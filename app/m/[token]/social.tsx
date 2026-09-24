"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SocialData } from "@/lib/socialSchema";
import styles from "./invitation.module.css";

/**
 * Davetlinin plan verileri: ev sahibinin duyuruları, tarih oylaması ve özel sorular.
 *
 * Oylama ve sorular katılım formunun içinde durur; davetli tek düğmeyle hem
 * katılımını hem seçimlerini gönderir. Soru yanıtları yalnızca ev sahibine görünür
 * (sunucu diğer davetlilere yanıt ya da isim döndürmez).
 */
export function useGuestSocial(inviteToken: string, guestToken: string | null) {
  const [data, setData] = useState<SocialData | null>(null);
  const [votes, setVotes] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Davetli formu doldurmaya başladıysa sunucudan gelen eski seçimle ezilmesin
  const dirty = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const q = guestToken ? "?guest=" + encodeURIComponent(guestToken) : "";
    fetch(`/api/mobile/invites/${inviteToken}/social${q}`, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (!alive) return;
        setData(d);
        if (!dirty.current) { setVotes(d.own.votes); setAnswers(d.own.answers); }
        setError("");
      })
      .catch((e: Error) => { if (alive) setError(e.message || "Plan ayrıntıları yüklenemedi."); });
    return () => { alive = false; };
  }, [inviteToken, guestToken]);

  const s = data?.settings;
  /** Formda oylama ya da soru var mı? */
  const var_ = Boolean(s && ((s.poll && !s.poll.closed) || s.questions.length));

  const toggleVote = (id: string) => { setVotes((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id])); dirty.current = true; };
  const setAnswer = (id: string, text: string) => { setAnswers((v) => ({ ...v, [id]: text })); dirty.current = true; };

  /** Katılım kaydedildikten sonra, aynı gönderimde seçimleri de kaydeder. */
  const save = useCallback(async (token: string) => {
    if (!data || !var_ || !dirty.current) return;
    const r = await fetch(`/api/mobile/invites/${inviteToken}/social`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestToken: token, pollId: data.settings.poll?.id || "", votes: data.settings.poll?.closed ? data.own.votes : votes, answers }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Seçimlerin kaydedilemedi.");
    setData(d);
    dirty.current = false;
  }, [data, var_, inviteToken, votes, answers]);

  return { data, votes, answers, error, var: var_, toggleVote, setAnswer, save };
}

const tarih = (at: string) =>
  new Date(at).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/** Ev sahibinin duyuruları: en yenisi üstte, sayfanın başında. */
export function Duyurular({ data }: { data: SocialData | null }) {
  const list = data?.settings.announcements ?? [];
  if (!list.length) return null;
  return (
    <section className={styles.duyurular} aria-label="Ev sahibinden haberler">
      <h2><span aria-hidden="true">📣</span> Ev sahibinden haberler</h2>
      {[...list].sort((a, b) => b.at.localeCompare(a.at)).map((a) => (
        <article key={a.id}>
          <small>{tarih(a.at)}</small>
          <p>{a.text}</p>
        </article>
      ))}
    </section>
  );
}

/** Katılım formunun içindeki oylama ve sorular. */
export function PlanAlanlari({ social, samimi }: { social: ReturnType<typeof useGuestSocial>; samimi: boolean }) {
  const { data, votes, answers } = social;
  const s = data?.settings;
  if (!s || (!s.poll && !s.questions.length)) return null;
  return (
    <div className={styles.planAlani}>
      {s.poll && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.label} style={{ marginBottom: 6 }}>{s.poll.title}</legend>
          <p className={styles.planNot}>
            {s.poll.closed ? "Oylama tamamlandı." : samimi ? "Sana uyan tüm seçenekleri işaretle." : "Size uyan tüm seçenekleri işaretleyin."}
            {" · "}{data!.voters} kişi oy verdi
          </p>
          {s.poll.options.map((o) => {
            const oy = data!.totals[o.id] || 0;
            return (
              <label key={o.id} className={`${styles.secenek}${votes.includes(o.id) ? " " + styles.secili : ""}`}>
                <span className={styles.secenekUst}>
                  <input type="checkbox" disabled={s.poll!.closed} checked={votes.includes(o.id)} onChange={() => social.toggleVote(o.id)} />
                  <span style={{ flex: 1 }}>{o.label}</span>
                  <b>{oy}</b>
                </span>
                <span className={styles.cubuk} aria-hidden="true"><span style={{ width: `${data!.voters ? (oy / data!.voters) * 100 : 0}%` }} /></span>
              </label>
            );
          })}
        </fieldset>
      )}
      {s.questions.map((q) => (
        <label key={q.id} className={styles.label}>
          {q.prompt} <span>isteğe bağlı · yalnızca ev sahibi görür</span>
          <textarea rows={2} maxLength={400} value={answers[q.id] || ""} onChange={(e) => social.setAnswer(q.id, e.target.value)} />
        </label>
      ))}
    </div>
  );
}
