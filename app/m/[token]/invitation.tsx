"use client";
import { useEffect, useState } from "react";
import styles from "./invitation.module.css";
import { EventHero } from "@/components/EventHero";
import { Directions } from "@/components/Directions";
import type { PlaceRef } from "@/lib/directions";
import type { EventDesign } from "@/lib/mobile";
type Status = "pending" | "going" | "maybe" | "declined";
type OwnGuest = {name:string;status:Status;count:number;note:string};
type InvitationEvent = {
  title:string;category:string;hostName:string;date:string;time:string;venue:string;address:string;
  description:string;coverId:string;coverData:string|null;capacity:number|null;guest:OwnGuest|null;
};
const labels = {going:"Geliyorum",maybe:"Belki",declined:"Gelemiyorum"};
/**
 * Hitap: uygulamanın kendi daveti arkadaşça "sen" der. Web sihirbazıyla hazırlanan
 * davetler (sünnet, mevlid, düğün öncesi günler…) büyüklere de gider; orada "siz" denir.
 */
const SEN = {
  host:"EV SAHİBİ",descTitle:"Bir araya gelelim.",eyebrow:"YERİN HAZIR",title:"Sen de geliyor musun?",
  lead:"Ev sahibine haber ver, planlar tamamlansın.",name:"Adın soyadın",namePh:"Sana nasıl seslenelim?",
  countHint:"Kendin dahil toplam kişi sayısı",note:"Ev sahibine not",notePh:"Bir şey getireyim mi?",
  saved:"✓ Yanıtın kaydedildi. Fikrin değişirse buradan güncelleyebilirsin.",send:"Yanıtımı gönder",update:"Yanıtımı güncelle",
  chooseFirst:"Önce katılım durumunu seç.",
  privacy:"Adın ve yanıtın yalnızca ev sahibine görünür. Davet bilgileri etkinlikten 90 gün sonra silinir. Bu davet senden para göndermeni asla istemez; isteyen olursa dikkat et.",
};
const SIZ: typeof SEN = {
  host:"DAVET EDEN",descTitle:"Davetimiz",eyebrow:"SİZİ BEKLİYORUZ",title:"Katılım durumunuz",
  lead:"Ev sahibine haber verin, hazırlıklar ona göre yapılsın.",name:"Adınız soyadınız",namePh:"Adınızı yazın",
  countHint:"Siz dahil toplam kişi sayısı",note:"Ev sahibine not",notePh:"İletmek istediğiniz bir şey varsa",
  saved:"✓ Yanıtınız iletildi. Değişirse buradan güncelleyebilirsiniz.",send:"Yanıtımı gönder",update:"Yanıtımı güncelle",
  chooseFirst:"Önce katılım durumunuzu seçin.",
  privacy:"Adınız ve yanıtınız yalnızca ev sahibine görünür. Davet bilgileri etkinlikten 90 gün sonra silinir. Bu davet sizden para göndermenizi asla istemez; isteyen olursa dikkat edin.",
};
export default function Invitation({event,design,place,inviteToken,initialGuestToken}: {
  event:InvitationEvent;design:EventDesign|null;place:PlaceRef&{directions?:string};inviteToken:string;initialGuestToken:string|null
}) {
  const [guestToken,setGuestToken]=useState(initialGuestToken);
  const [name,setName]=useState(event.guest?.name || "");
  const [status,setStatus]=useState<Status>(event.guest?.status || "pending");
  const [count,setCount]=useState(event.guest?.count || 1);
  const [note,setNote]=useState(event.guest?.note || "");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [saved,setSaved]=useState(false);
  const t=design?SIZ:SEN;
  useEffect(() => {
    if(initialGuestToken) return;
    let active=true;
    let stored:string|null=null;
    try { stored=localStorage.getItem(`buyrun-rsvp-${inviteToken}`); } catch {}
    if(stored) {
      setGuestToken(stored);
      setBusy(true);
      fetch(`/api/mobile/invites/${inviteToken}?guest=${encodeURIComponent(stored)}`,{cache:"no-store"})
        .then(async response => {
          if(!response.ok) {
            if(response.status===404) { if(active) setGuestToken(null); try {localStorage.removeItem(`buyrun-rsvp-${inviteToken}`);} catch {} }
            else throw new Error("Önceki yanıtın yüklenemedi. Sayfayı yenileyip tekrar dene.");
            return;
          }
          const data=await response.json();
          if(active && data.guest) {
            setGuestToken(stored);setName(data.guest.name);setStatus(data.guest.status);
            setCount(data.guest.count);setNote(data.guest.note);
          }
        })
        .catch((e:Error) => {if(active) setError(e.message);})
        .finally(()=>{if(active)setBusy(false);});
    }
    return ()=>{active=false;};
  },[initialGuestToken,inviteToken]);
  async function submit(e:React.FormEvent) {
    e.preventDefault();setError("");setSaved(false);
    if(status==="pending"){setError(t.chooseFirst);return;}
    setBusy(true);
    try {
      const response=await fetch(`/api/mobile/invites/${inviteToken}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,status,count,note,...(guestToken?{guestToken}:{})})
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error || "Yanıt kaydedilemedi.");
      setGuestToken(result.token);setSaved(true);
      try {localStorage.setItem(`buyrun-rsvp-${inviteToken}`,result.token);} catch {}
      // The personal link also preserves editing access when storage is unavailable.
      window.history.replaceState(null,"",`/m/${inviteToken}?guest=${result.token}`);
    } catch(e){setError(e instanceof Error?e.message:"Bağlantı kurulamadı. Tekrar dene.");}
    finally {setBusy(false);}
  }
  const date=new Date(`${event.date}T12:00:00`);
  const dateLabel=date.toLocaleDateString("tr-TR",{day:"numeric",month:"long",weekday:"long"});
  const cover=["cherry","midnight","bloom"].includes(event.coverId)?event.coverId:"cherry";
  // Web sihirbazıyla hazırlanan davet kendi tasarımını taşır; uygulamanınki fotoğraflı kapakla açılır
  return <main className={`${styles.page}${design?` ${styles.tasarimli}`:""}`}>
    <div className={styles.shell}>
      <header className={styles.brand}><a href="#invitation" aria-label="Buyrun davetiye">buyrun<span>✳</span></a><span>Güzel şeyler birlikte.</span></header>
      {design ? <EventHero title={event.title} category={event.category} font={design.font} ornament={design.ornament}/> :
      <section className={`${styles.cover} ${styles[cover]}`} aria-label="Etkinlik kapağı">
        {/* Local generated artwork or an explicitly selected photo. No external tracking requests. */}
        <img src={event.coverData || `/mobile-covers/${cover}.png`} alt="" className={styles.coverImage}/>
        <div className={styles.coverShade}/><span className={styles.badge}>SEN DE DAVETLİSİN ↗</span>
        <div className={styles.coverBottom}><span>{event.category}</span><h1>{event.title}</h1></div>
      </section>}
      <section id="invitation" className={styles.details}>
        <div className={styles.host}><span className={styles.avatar}>{event.hostName.slice(0,1).toLocaleUpperCase("tr")}</span><div><span>{t.host}</span><strong>{event.hostName}</strong></div><span className={styles.star}>✳</span></div>
        <div className={styles.infoRow}><span className={styles.infoIcon}>↗</span><div><strong>{dateLabel}</strong><p>Saat {event.time}</p></div></div>
        <div className={styles.infoRow}><span className={styles.infoIcon}>⌖</span><div><strong>{event.venue}</strong>{event.address&&<p>{event.address}</p>}<Directions place={place}/></div></div>
        {event.description&&<div className={styles.description}><h2>{t.descTitle}</h2><p>{event.description}</p></div>}
      </section>
      <section className={styles.rsvp} aria-labelledby="rsvp-title">
        <div className={styles.formHeading}><span className={styles.eyebrow}>{t.eyebrow}</span><h2 id="rsvp-title">{t.title}</h2><p>{t.lead}</p></div>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className={styles.fieldset}>
            <legend className={styles.srOnly}>Katılım yanıtı</legend>
            <div className={styles.statuses}>{(["going","maybe","declined"] as const).map(value=><button key={value} type="button" aria-pressed={status===value} className={status===value?styles.selected:""} onClick={()=>{setStatus(value);setSaved(false);}}><span>{value==="going"?"✓":value==="maybe"?"~":"×"}</span>{labels[value]}</button>)}</div>
            <label className={styles.label}>{t.name}<input value={name} onChange={e=>{setName(e.target.value);setSaved(false);}} placeholder={t.namePh} autoComplete="name" required maxLength={100}/></label>
            {status!=="declined"&&<div className={styles.countRow}><div><strong>Kaç kişi geliyorsunuz?</strong><p>{t.countHint}</p></div><div className={styles.stepper}><button type="button" disabled={count<=1} onClick={()=>{setCount(c=>Math.max(1,c-1));setSaved(false);}} aria-label="Kişi sayısını azalt">−</button><output aria-live="polite">{count}</output><button type="button" disabled={count>=20} onClick={()=>{setCount(c=>Math.min(20,c+1));setSaved(false);}} aria-label="Kişi sayısını artır">+</button></div></div>}
            <label className={styles.label}>{t.note} <span>isteğe bağlı</span><textarea value={note} onChange={e=>{setNote(e.target.value);setSaved(false);}} maxLength={500} placeholder={t.notePh} rows={3}/></label>
            {error&&<p role="alert" className={styles.error}>{error}</p>}
            {saved&&<p role="status" className={styles.success}>{t.saved}</p>}
            <button className={styles.submit} disabled={busy} type="submit">{busy?"Kaydediliyor…":guestToken?t.update:t.send}<span>↗</span></button>
          </fieldset>
          <p className={styles.privacy}>{t.privacy}</p>
        </form>
      </section>
      <footer className={styles.footer}>Buluşmaya bir <b>buyrun</b> yeter. ✳</footer>
    </div>
  </main>;
}
