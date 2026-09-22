import type { summarize } from "@/lib/data";
type Summary = ReturnType<typeof summarize>;
export function AttendanceStats({ summary: s }: { summary: Summary }) {
  return <div className="metric-grid" aria-label="Katılım özeti">
    <div className="metric"><span>Gelecek kişi</span><strong>{s.people}</strong><small>Katılım bildirenlerin toplamı</small></div>
    <div className="metric"><span>Yanıt bekleyen davet</span><strong>{s.waiting}</strong><small>Henüz yanıt vermeyen kayıt</small></div>
    <div className="metric"><span>Yanıt oranı</span><strong>{s.invites ? `%${s.answeredPct}` : "—"}</strong><small>{s.invites ? `${s.invites} davetin ${s.invites - s.waiting} tanesi yanıtlandı` : "Henüz davetli eklenmedi"}</small></div>
  </div>;
}
export function ResponseChart({ summary: s }: { summary: Summary }) {
  const rows = [{ label: "Geliyor", value: s.comingInvites, tone: "yes" }, { label: "Gelemiyor", value: s.declined, tone: "no" }, { label: "Yanıt bekleniyor", value: s.waiting, tone: "waiting" }];
  return <section className="surface response-chart"><div className="section-heading"><h2>Davetlerin durumu</h2><span className="subtle-badge">{s.invites} davet</span></div>
    {s.invites === 0 ? <p className="empty-note">İlk davetliyi eklediğinizde yanıtların dağılımı burada görünecek.</p> : <>
      <div className="response-bar" role="img" aria-label={rows.map((r) => `${r.label}: ${r.value} davet`).join(", ")}>{rows.filter((r) => r.value > 0).map((r) => <span key={r.tone} className={`chart-${r.tone}`} style={{ width: `${r.value / s.invites * 100}%` }} />)}</div>
      <dl className="chart-legend">{rows.map((r) => <div key={r.tone}><dt><i className={`chart-${r.tone}`} aria-hidden="true" />{r.label}</dt><dd>{r.value}<span> davet</span></dd></div>)}</dl><p className="chart-note">Bir davet, bir kişiyi veya bir aileyi temsil edebilir.</p></>}
  </section>;
}
export function EventChart({ summary: s }: { summary: Summary }) {
  const max = Math.max(...s.perEvent.map((e) => e.people), 1);
  return <section className="surface"><div className="section-heading"><h2>Etkinliklere katılım</h2><span className="eyebrow">Kişi sayısı</span></div><div className="event-bars">{s.perEvent.map((e) => <div key={e.id} className="event-bar-row"><div><span>{e.title}</span><strong>{e.people}<small> kişi</small></strong></div><div className="event-track" aria-hidden="true"><span style={{ width: `${e.people / max * 100}%` }} /></div></div>)}</div><p className="chart-note">Bir kişi birden fazla etkinliğe katılabilir. Salon planını her etkinliğin kendi sayısına göre yapın.</p></section>;
}
