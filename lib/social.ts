import {q} from './db';
import {MobileError,mobileReady,textField} from './mobile';
import {emptySocial,type SocialSettings,type SocialData} from './socialSchema';
const globalSocial=globalThis as unknown as {__buyrunSocialReady?:Promise<void>};
async function ready(){
 await mobileReady();
 if(!globalSocial.__buyrunSocialReady)globalSocial.__buyrunSocialReady=(async()=>{
  await q(`CREATE TABLE IF NOT EXISTS mobile_social(event_id TEXT PRIMARY KEY REFERENCES mobile_events(id) ON DELETE CASCADE, settings TEXT NOT NULL DEFAULT '{}',version INT NOT NULL DEFAULT 0)`);
  await q(`CREATE TABLE IF NOT EXISTS mobile_social_responses(event_id TEXT NOT NULL REFERENCES mobile_events(id) ON DELETE CASCADE,guest_id TEXT NOT NULL REFERENCES mobile_guests(id) ON DELETE CASCADE,poll_id TEXT NOT NULL DEFAULT '',votes TEXT NOT NULL DEFAULT '[]',answers TEXT NOT NULL DEFAULT '{}',PRIMARY KEY(event_id,guest_id))`);
 })().catch(e=>{globalSocial.__buyrunSocialReady=undefined;throw e});
 return globalSocial.__buyrunSocialReady;
}
function object(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))throw new MobileError('Bilgiler geçersiz.');return v as Record<string,unknown>}
const key=(v:unknown)=>{const s=textField(v,'Kimlik',50);if(!/^[a-zA-Z0-9_-]+$/.test(s))throw new MobileError('Kimlik geçersiz.');return s};
function list(v:unknown,max:number){if(!Array.isArray(v)||v.length>max)throw new MobileError(`En fazla ${max} öğe ekleyebilirsin.`);return v.map(object)}
function unique<T extends {id:string}>(v:T[]){if(new Set(v.map(x=>x.id)).size!==v.length)throw new MobileError('Tekrarlanan seçenekleri kaldır.');return v}
export function validateSocial(v:unknown):SocialSettings{
 const b=object(v);
 const questions=unique(list(b.questions,3).map(x=>({id:key(x.id),prompt:textField(x.prompt,'Soru',140)})));
 const announcements=unique(list(b.announcements,20).map(x=>{const at=textField(x.at,'Tarih',30);if(!Number.isFinite(Date.parse(at)))throw new MobileError('Duyuru tarihi geçersiz.');return{id:key(x.id),text:textField(x.text,'Duyuru',600),at}}));
 let poll:SocialSettings['poll']=null;
 if(b.poll!=null){const p=object(b.poll),options=unique(list(p.options,6).map(x=>({id:key(x.id),label:textField(x.label,'Seçenek',100)})));if(options.length<2)throw new MobileError('En az iki oylama seçeneği ekle.');if(new Set(options.map(x=>x.label.toLocaleLowerCase('tr'))).size!==options.length)throw new MobileError('Oylama seçenekleri farklı olmalı.');if(typeof p.closed!=='boolean')throw new MobileError('Oylama durumu geçersiz.');poll={id:key(p.id),title:textField(p.title,'Oylama başlığı',140),options,closed:p.closed};}
 return{questions,announcements,poll};
}
async function config(eventId:string){await ready();const row=(await q<{settings:string;version:number}>(`SELECT settings,version FROM mobile_social WHERE event_id=$1`,[eventId]))[0];return row?{settings:validateSocial(JSON.parse(row.settings)),version:row.version}:{settings:emptySocial(),version:0};}
async function guestId(eventId:string,token:unknown){if(typeof token!=='string'||!/^[A-Za-z0-9_-]{16,64}$/.test(token))throw new MobileError('Önce davete katılım yanıtını kaydet.',401);const g=(await q<{id:string}>(`SELECT id FROM mobile_guests WHERE event_id=$1 AND token=$2`,[eventId,token]))[0];if(!g)throw new MobileError('Kişisel davet bağlantısı geçersiz.',404);return g.id;}
export async function socialData(eventId:string,guestToken?:string,host=false):Promise<SocialData>{
 const c=await config(eventId);const ownId=guestToken?await guestId(eventId,guestToken):null;
 const rows=await q<{guest_id:string;name:string;poll_id:string;votes:string;answers:string}>(`SELECT r.*,g.name FROM mobile_social_responses r JOIN mobile_guests g ON r.guest_id=g.id WHERE r.event_id=$1`,[eventId]);
 const totals:Record<string,number>=Object.fromEntries(c.settings.poll?.options.map(o=>[o.id,0])||[]);
 let own:SocialData['own']={votes:[],answers:{}},voters=0;
 const responses=rows.map(r=>{const votes:string[]=r.poll_id===c.settings.poll?.id?JSON.parse(r.votes).filter((id:string)=>Object.hasOwn(totals,id)):[];if(votes.length)voters++;for(const v of votes)totals[v]++;const raw=JSON.parse(r.answers),answers=Object.fromEntries(c.settings.questions.filter(x=>typeof raw[x.id]==='string').map(x=>[x.id,raw[x.id]]));if(r.guest_id===ownId)own={votes,answers};return{name:r.name,votes,answers}});
 return{...c,totals,voters,own,...(host?{responses}:{})};
}
export async function updateSocial(eventId:string,body:unknown){
 const b=object(body),settings=validateSocial(b.settings);
 if(!Number.isInteger(b.version)||Number(b.version)<0)throw new MobileError('Sürüm geçersiz.');
 await ready();await q(`INSERT INTO mobile_social(event_id,settings) VALUES($1,$2) ON CONFLICT(event_id) DO NOTHING`,[eventId,JSON.stringify(emptySocial())]);
 const updated=await q(`UPDATE mobile_social SET settings=$1,version=version+1 WHERE event_id=$2 AND version=$3 RETURNING version`,[JSON.stringify(settings),eventId,b.version]);
 if(!updated.length)throw new MobileError('Bu plan başka bir yerde değişti. Yenileyip tekrar dene.',409);
 return socialData(eventId,undefined,true);
}
export async function respondSocial(eventId:string,body:unknown){
 const b=object(body),c=await config(eventId),g=await guestId(eventId,b.guestToken);
 const votes=Array.isArray(b.votes)?[...new Set(b.votes)]:[];
 if(votes.some(v=>typeof v!=='string'||!c.settings.poll?.options.some(o=>o.id===v)))throw new MobileError('Oylama seçeneği geçersiz.');
 if(b.pollId!==(c.settings.poll?.id||''))throw new MobileError('Oylama değişmiş. Sayfayı yenileyip tekrar dene.',409);
 const previous=(await q<{votes:string;poll_id:string}>(`SELECT votes,poll_id FROM mobile_social_responses WHERE event_id=$1 AND guest_id=$2`,[eventId,g]))[0];
 if(c.settings.poll?.closed){const old=previous?.poll_id===c.settings.poll.id?JSON.parse(previous.votes):[];if(JSON.stringify([...votes].sort())!==JSON.stringify([...old].sort()))throw new MobileError('Bu oylama tamamlandı.');}
 const raw=object(b.answers||{});if(Object.keys(raw).some(k=>!c.settings.questions.some(x=>x.id===k)))throw new MobileError('Sorular değişmiş. Sayfayı yenileyip tekrar dene.',409);
 const answers=Object.fromEntries(c.settings.questions.map(x=>[x.id,textField(raw[x.id]||'','Yanıt',400,false)]));
 await q(`INSERT INTO mobile_social_responses(event_id,guest_id,poll_id,votes,answers) VALUES($1,$2,$3,$4,$5) ON CONFLICT(event_id,guest_id) DO UPDATE SET poll_id=excluded.poll_id,votes=excluded.votes,answers=excluded.answers`,[eventId,g,c.settings.poll?.id||'',JSON.stringify(votes),JSON.stringify(answers)]);
 return socialData(eventId,b.guestToken as string);
}
