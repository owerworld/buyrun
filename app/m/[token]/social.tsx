'use client';
import {useEffect,useState} from 'react';
import type {SocialData} from '@/lib/socialSchema';
import styles from './invitation.module.css';
export function GuestSocial({inviteToken,guestToken}:{inviteToken:string;guestToken:string|null}){
 const [data,setData]=useState<SocialData|null>(null),[answers,setAnswers]=useState<Record<string,string>>({}),[votes,setVotes]=useState<string[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saved,setSaved]=useState(false);
 useEffect(()=>{let alive=true;fetch(`/api/mobile/invites/${inviteToken}/social${guestToken?'?guest='+encodeURIComponent(guestToken):''}`,{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);if(alive){setData(d);setAnswers(d.own.answers);setVotes(d.own.votes);setError('')}}).catch(e=>{if(alive)setError(e.message||'Plan ayrıntıları yüklenemedi.')});return()=>{alive=false}},[inviteToken,guestToken]);
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setSaved(false);setError('');try{const r=await fetch(`/api/mobile/invites/${inviteToken}/social`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({guestToken,pollId:data?.settings.poll?.id||'',votes,answers})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Yanıt kaydedilemedi.');setData(d);setSaved(true)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 if(!data)return error?<p role="alert" className={styles.error}>{error}</p>:null;
 const {settings:s}=data;if(!s.poll&&!s.questions.length&&!s.announcements.length)return null;
 return <section className={styles.rsvp} aria-label="Birlikte planlayalım">
 {s.announcements.length>0&&<><h2>Ev sahibinden haberler</h2>{s.announcements.map(a=><article key={a.id} style={{padding:'18px 0',borderBottom:'1px solid #e8e5e0'}}><small>{new Date(a.at).toLocaleDateString('tr-TR')}</small><p style={{whiteSpace:'pre-wrap',lineHeight:1.7}}>{a.text}</p></article>)}</>}
 {(s.poll||s.questions.length>0)&&<form onSubmit={save} style={{marginTop:25}}><fieldset disabled={busy||!guestToken} className={styles.fieldset}>
 {s.poll&&<><h2>{s.poll.title}</h2><p>{s.poll.closed?'Oylama tamamlandı.':'Sana uyan tüm seçenekleri işaretle.'} · {data.voters} kişi oy verdi</p>{s.poll.options.map(o=><label key={o.id} style={{display:'block',padding:15,borderRadius:14,border:'1px solid #ddd8e8',marginBottom:10,background:votes.includes(o.id)?'#f0eaf9':'white'}}><span style={{display:'flex',gap:10,alignItems:'center'}}><input type="checkbox" disabled={s.poll!.closed} checked={votes.includes(o.id)} onChange={()=>{setVotes(v=>v.includes(o.id)?v.filter(x=>x!==o.id):[...v,o.id]);setSaved(false)}}/><span style={{flex:1}}>{o.label}</span><b>{data.totals[o.id]||0}</b></span><div style={{height:5,background:'#eee',borderRadius:5,marginTop:10}}><div style={{height:5,borderRadius:5,background:'#ac8cd1',width:`${data.voters?(data.totals[o.id]||0)/data.voters*100:0}%`}}/></div></label>)}</>}
 {s.questions.map(q=><label key={q.id} className={styles.label}>{q.prompt}<span>İsteğe bağlı · Yalnızca ev sahibine görünür</span><textarea rows={2} maxLength={400} value={answers[q.id]||''} onChange={e=>{setAnswers(v=>({...v,[q.id]:e.target.value}));setSaved(false)}}/></label>)}
 <button className={styles.submit} type="submit" disabled={busy||!guestToken}>{busy?'Kaydediliyor…':'Seçimlerimi kaydet'} ↗</button></fieldset>
 {!guestToken&&<p>Oy vermek ve soruları yanıtlamak için önce yukarıdan katılım yanıtını kaydet.</p>}{saved&&<p role="status" className={styles.success}>Seçimlerin kaydedildi.</p>}{error&&<p role="alert" className={styles.error}>{error}</p>}</form>}
 </section>
}
