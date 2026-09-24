import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), mobile=path.join(root,'buyrun-mobile');
const designs=[
 ['citrus','Limonlu bir pazar','Akşam yemeği','#F9F1C9','#164F36','serif','citrus','Sofrada buluşalım.'],
 ['ribbon','Mavi bir dilek','Doğum günü','#DDE9F8','#173D74','serif','ribbon','İyi ki doğdun.'],
 ['disco','Gece bizim','Ev partisi','#4F25B6','#FFFFFF','bold','disco','Bir gece. Bin anı.'],
 ['chess','Bir dilim mutluluk','Doğum günü','#FFF1E5','#B33147','bold','chess','Mumları birlikte üfleyelim.'],
 ['olive','Zeytin dalı','Düğün','#F4F0E5','#394A37','serif','olive','Hikâyemize ortak ol.'],
 ['cobalt','Mavi sofra','Akşam yemeği','#F5F1DD','#1540A1','serif','tiles','Muhabbetin en güzeli.'],
 ['sunset','Gün batımı kulübü','Buluşma','#F9673C','#542316','bold','sunset','Güneşi birlikte uğurlayalım.'],
 ['flower','Papatya günleri','Baby shower','#F2CAD8','#873450','serif','flower','Küçücük bir mutluluk.'],
 ['film','Mezunlar kulübü','Mezuniyet','#E3F36D','#252823','bold','film','Bir devrin en güzel sonu.'],
 ['arch','Sade bir evet','Düğün','#EEDFD0','#654D41','serif','arch','Sonsuza bir adım.'],
 ['henna','Kına kırmızısı','Kına gecesi','#651F35','#FCE3B1','serif','henna','Bu gece bizden.'],
 ['moon','Ay ışığında','İftar','#142C41','#F5E5B7','serif','moon','Aynı sofrada, aynı duada.'],
 ['nazar','Mavi maşallah','Sünnet','#B2D7F2','#164DA0','serif','nazar','Güzel bir güne buyrun.'],
 ['wheat','Bereket zamanı','Diş buğdayı','#F7EACF','#715028','serif','wheat','İlk dişe kocaman bir kutlama.'],
 ['rose','Gül bahçesi','Mevlid','#ECDCD1','#69453D','serif','rose','Duada bir aradayız.'],
 ['flag','Yolun açık olsun','Asker uğurlaması','#E5EBDE','#324838','bold','stars','Güle güle git, güle güle gel.'],
 ['home','Yeni ev, yeni anılar','Ev partisi','#EDCDA6','#B24031','serif','home','Kapımız sevdiklerimize açık.'],
 ['picnic','Çimenlere serilelim','Buluşma','#EFF0CE','#4D6036','serif','picnic','Bir pazar bahanesi.'],
 ['cloud','Bulutların üstünde','Cinsiyet partisi','#DFDBF5','#615294','serif','cloud','Bir sürprizimiz var.'],
 ['pink','Pembe bir gece','Bekârlığa veda','#FBAECB','#772453','bold','heart','En yakınlar. En güzel gece.'],
 ['paper','Bir kahve arası','Buluşma','#EDE4CE','#3D342B','serif','paper','Hadi bir kahve içelim.'],
 ['neon','Son ders: eğlenmek','Mezuniyet','#202639','#DFFF7C','bold','neon','Yeni başlangıçlara!'],
 ['welcomeback','Yine bir aradayız','Askerden dönüş','#EFE2CF','#594230','serif','stars','Hoş geldin. Çok özledik.'],
 ['journey','Hayırlı yolculuk','Hac uğurlaması','#DFE8DC','#395448','serif','arch','Dualarla yola çıkarken.'],
];
const circle=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const petal=(x,y,c)=>`<g transform="translate(${x} ${y})">${Array.from({length:7},(_,i)=>`<ellipse cy="-43" rx="23" ry="43" fill="${c}" transform="rotate(${i*360/7})"/>`).join('')}${circle(0,0,23,'#E8B84D')}</g>`;
const leaf=(x,y,c,rot=0)=>`<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 90Q-68 22 0 0Q68 22 0 90" fill="${c}"/><path d="M0 12V95" stroke="#ffffff" stroke-opacity=".35" stroke-width="3"/></g>`;
const star=(x,y,c)=>`<path d="M${x} ${y-44}q0 44 -44 44q44 0 44 44q0 -44 44 -44q-44 0 -44 -44" fill="${c}"/>`;
function art(kind,bg,fg){let s='';
 if(['citrus','olive','wheat','rose','flower'].includes(kind)){
  for(const [x,y,r] of [[80,140,-40],[540,740,140],[590,90,20],[85,750,45]]){s+=leaf(x,y,kind==='rose'?'#7E8969':'#55765A',r);if(kind==='citrus')s+=`<ellipse cx="${x+30}" cy="${y-20}" rx="55" ry="74" transform="rotate(30 ${x+30} ${y-20})" fill="#EBC33F" stroke="#E0B431" stroke-width="4"/>`;if(kind==='flower'||kind==='rose')s+=petal(x+10,y+15,kind==='rose'?'#A96666':'#FFF8E8');if(kind==='wheat')for(let j=0;j<5;j++)s+=`<ellipse cx="${x+(j%2?15:-15)}" cy="${y+j*22}" rx="12" ry="22" fill="#C8A45E" transform="rotate(${j%2?35:-35} ${x} ${y+j*22})"/>`;}
 }
 if(kind==='ribbon'){s+=`<path d="M320 150C95 -30 30 260 320 150C520 -35 675 280 320 150M320 150Q170 160 165 345M320 150Q445 230 448 350" fill="none" stroke="#668CBD" stroke-width="20"/><path d="M320 150Q295 190 305 260" fill="none" stroke="#173D74" stroke-width="8"/>`;s+=`<rect x="22" y="22" width="596" height="816" rx="160" fill="none" stroke="#7591B8" stroke-width="2"/>`;}
 if(kind==='disco'){s+=`<path d="M440 0V85" stroke="#C6B4E8" stroke-width="4"/>${circle(440,160,120,'#BAA4E7')}`;for(let i=0;i<8;i++)s+=`<ellipse cx="440" cy="160" rx="${15+i*15}" ry="120" fill="none" stroke="#7653A8" stroke-width="2"/>`;for(let i=0;i<7;i++)s+=`<path d="M325 ${80+i*25}h230" stroke="#EFE4F7" stroke-width="3"/>`;s+=star(110,250,'#EAFAAA')+star(560,640,'#F4D4EC');for(let i=0;i<8;i++)s+=`<path d="M${i*90} 860L320 680" stroke="#9C72D7" stroke-width="2"/>`;}
 if(['chess','tiles','picnic'].includes(kind)){for(let x=0;x<8;x++)for(let y=0;y<11;y++){if(y>2&&y<8&&x>0&&x<7)continue;s+=`<rect x="${x*80}" y="${y*80}" width="80" height="80" fill="${(x+y)%2===0?fg:bg}" opacity="${kind==='picnic'?'.22':'1'}"/>`;if(kind==='tiles')s+=petal(x*80+40,y*80+40,bg).replaceAll('23','10').replaceAll('43','17');}s+=`<rect x="58" y="175" width="524" height="500" rx="${kind==='chess'?110:8}" fill="${bg}" stroke="${fg}" stroke-width="3"/>`;}
 if(kind==='sunset'){s+=circle(320,340,230,'#FCC673');for(let y=580;y<860;y+=25)s+=`<path d="M0 ${y}Q160 ${y-30}320 ${y}T640 ${y}" fill="none" stroke="#763C5A" stroke-width="12"/>`;s+=`<path d="M0 0L160 200M640 0L500 200" stroke="#F7C4A3" stroke-width="3"/>`;}
 if(kind==='film'){s+=`<rect x="28" y="26" width="584" height="808" rx="8" fill="none" stroke="${fg}" stroke-width="26"/>`;for(let y=50;y<820;y+=55)s+=`<rect x="19" y="${y}" width="20" height="24" fill="${bg}"/><rect x="601" y="${y}" width="20" height="24" fill="${bg}"/>`;s+=`<path d="M255 180l65 -35 65 35 -65 35zM280 200v36q40 25 80 0v-36" fill="${fg}"/>`;}
 if(kind==='arch'){for(let i=0;i<4;i++)s+=`<path d="M${30+i*15} 860V315a${290-i*15} ${290-i*15} 0 0 1 ${580-i*30} 0v545" fill="none" stroke="${fg}" stroke-opacity="${.18+i*.08}" stroke-width="2"/>`;s+=leaf(65,680,fg,-25)+leaf(580,150,fg,155);}
 if(kind==='henna'){for(let i=0;i<24;i++)s+=`<ellipse cx="320" cy="60" rx="18" ry="75" fill="none" stroke="${fg}" stroke-width="2" transform="rotate(${i*15} 320 190)"/>`;s+=`<rect x="24" y="24" width="592" height="812" rx="16" fill="none" stroke="${fg}" stroke-width="2"/>`;s+=star(100,740,fg)+star(540,740,fg);}
 if(kind==='moon'){s+=circle(480,145,90,fg)+circle(515,116,84,bg);for(let i=0;i<16;i++)s+=star(40+(i*137)%560,35+(i*191)%800,fg).replaceAll('44','8');s+=`<path d="M0 860v-75q80-90 160 0q80-140 160 0q80-90 160 0q80-140 160 0v75" fill="#233F50"/>`;}
 if(kind==='nazar'){s+=circle(320,185,108,'#1747A2')+circle(320,185,76,'#FFFBE9')+circle(320,185,44,'#6CBFE0')+circle(320,185,24,'#172E44');for(let i=0;i<7;i++)s+=`<path d="M${i*110} 660q-90 90 0 200" fill="none" stroke="#99C8E9" stroke-width="12"/>`;}
 if(kind==='stars'||kind==='neon'){for(const [x,y]of [[90,110],[530,180],[140,730],[565,695]])s+=star(x,y,fg);s+=`<rect x="26" y="26" width="588" height="808" rx="20" fill="none" stroke="${fg}" stroke-opacity=".4" stroke-width="2"/>`;if(kind==='neon')for(let i=0;i<7;i++)s+=`<ellipse cx="320" cy="480" rx="${180+i*23}" ry="${260+i*15}" fill="none" stroke="#A288DA" stroke-opacity=".23" stroke-width="2"/>`;}
 if(kind==='home'){s+=`<path d="M205 205L320 100l115 105v100H205z" fill="#E9AE7C" stroke="${fg}" stroke-width="4"/><rect x="295" y="220" width="50" height="85" rx="25" fill="${bg}"/><path d="M40 730Q170 640 280 750T640 735V860H0" fill="#C8764B"/>`;s+=leaf(530,630,'#6C7251',10);}
 if(kind==='cloud'){for(const [x,y]of [[20,100],[430,180],[180,750]])s+=`<g opacity=".8">${circle(x,y,80,'#FFF8EE')+circle(x+75,y-30,75,'#FFF8EE')+circle(x+130,y+10,65,'#FFF8EE')}</g>`;s+=star(460,670,'#E2AD68');}
 if(kind==='heart'){for(const [x,y,r]of [[130,150,-15],[500,690,20]])s+=`<path d="M0 35C-110 -25 -40 -95 0 -50C40 -95 110 -25 0 35" transform="translate(${x} ${y}) rotate(${r})" fill="${fg}"/>`;s+=`<path d="M50 330q270 -240 540 0M50 600q270 240 540 0" fill="none" stroke="#E0659A" stroke-width="3"/>`;}
 if(kind==='paper'){for(let y=25;y<840;y+=22)s+=`<path d="M22 ${y}h596" stroke="#9E8D6B" stroke-opacity=".14"/>`;s+=`<rect x="65" y="170" width="510" height="540" fill="${bg}" stroke="${fg}" stroke-width="1"/><path d="M260 130h110v55a55 55 0 0 1 -110 0zM370 140h20q55 35 -20 50" fill="none" stroke="${fg}" stroke-width="5"/>`;}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="860" viewBox="0 0 640 860"><rect width="640" height="860" fill="${bg}"/>${s}</svg>`;
}
fs.mkdirSync(path.join(root,'public/mobile-covers'),{recursive:true});fs.mkdirSync(path.join(mobile,'assets/studio'),{recursive:true});
const catalog=[];
for(const [id,label,category,color,text,font,kind,caption]of designs){let svg=art(kind,color,text);fs.writeFileSync(path.join(mobile,`assets/studio/${id}.svg`),svg);await sharp(Buffer.from(svg)).png().toFile(path.join(mobile,`assets/studio/${id}.png`));fs.copyFileSync(path.join(mobile,`assets/studio/${id}.png`),path.join(root,`public/mobile-covers/${id}.png`));catalog.push({id,label,category,color,text,font,caption,collection:'İllüstrasyon',image:`../../assets/studio/${id}.png`});}
const src=fs.readFileSync(path.join(root,'lib/fotolar.ts'),'utf8');
const map={sunnet:'Sünnet',kina:'Kına gecesi',bekarlik:'Bekârlığa veda',babyshower:'Baby shower',cinsiyet:'Cinsiyet partisi',disbugdayi:'Diş buğdayı',dogumgunu:'Doğum günü',mevlid:'Mevlid',iftar:'İftar',hac:'Hac uğurlaması',evpartisi:'Ev partisi',yemek:'Akşam yemeği',mezuniyet:'Mezuniyet',asker:'Asker uğurlaması',bulusma:'Buluşma'};
for(const m of src.matchAll(/\{ id: "([^"]+)", tur: "([^"]+)", alt: "([^"]+)"/g)){let[,pid,tur,label]=m;const id='photo-'+pid;fs.copyFileSync(path.join(root,`public/foto/${pid}.jpg`),path.join(mobile,`assets/studio/${id}.jpg`));catalog.push({id,label,category:map[tur],color:'#39362F',text:'#FFFFFF',font:'serif',caption:map[tur]+' için buyrun.',collection:'Fotoğraf',image:`../../assets/studio/${id}.jpg`});}
const fields=catalog.map(({id,image,...d})=>`${JSON.stringify(id)}: { ...${JSON.stringify(d)}, image: require(${JSON.stringify(image)}) }`).join(',\n');
fs.writeFileSync(path.join(mobile,'src/lib/catalog.ts'),`// scripts/design-catalog.mjs tarafından üretilir.\nexport const studioCovers = {\n${fields}\n};\n`);
fs.writeFileSync(path.join(root,'lib/coverCatalog.ts'),`// Native uygulama ile aynı kapak kimlikleri.\nexport const COVER_CATALOG: Record<string,{src:string;text:string;font:string;category:string}> = ${JSON.stringify(Object.fromEntries(catalog.map(({id,text,font,category})=>[id,{src:id.startsWith('photo-')?'/foto/'+id.slice(6)+'.jpg':`/mobile-covers/${id}.png`,text,font,category}])),null,2)};\n`);
console.log(`${catalog.length} yeni tasarım üretildi`);
