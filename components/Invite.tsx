import type { EventRow, Invitation } from "@/lib/data";
import { isExtraKind, mainOf, programTitle } from "@/lib/events";
import { dayNum, longDate, monShort, shortDate } from "@/lib/format";
import { fontOf, ornamentOf } from "@/lib/design";
import { Ornament } from "./Ornament";
import { Directions } from "./Directions";
import { WeatherLine } from "./WeatherLine";
import type { Forecast } from "@/lib/weather";

type HeroInv = Pick<Invitation, "name_a" | "name_b" | "main_date" | "city"> & {
  font?: string; ornament?: string; opening?: string; family_a?: string; family_b?: string;
};

/** Eski davetiyelerde üst satır boş; o zaman ilk günden beri kullanılan cümle çıkar. */
export const DEFAULT_OPENING = "Mutluluğumuza ortak olun";

/** Davetiyenin kapağı. Yazı karakteri ve süsleme davetiyeye kayıtlı tasarımdan gelir. */
export function Hero({ inv, greeting, compact = false }: { inv: HeroInv; greeting?: React.ReactNode; compact?: boolean }) {
  const font = fontOf(inv.font).id, ornament = ornamentOf(inv.ornament).id;
  return (
    <section className={`hero f-${font} o-${ornament}${compact ? " kucuk" : ""}`} aria-label="Davetiye">
      <div className="frame">
        <Ornament kind={ornament} />
        <div className="inner">
          {(inv.family_a || inv.family_b) && (
            <p className="aileler">
              <span>{inv.family_a}</span>
              <span>{inv.family_b}</span>
            </p>
          )}
          <p className="pre">{inv.opening?.trim() || DEFAULT_OPENING}</p>
          <h1 className="names"><span>{inv.name_a}</span><span className="amp">ile</span><span>{inv.name_b}</span></h1>
          <p className="date">{shortDate(inv.main_date)}</p>
          {inv.city && <p className="city">{inv.city}</p>}
          {greeting && <p className="greet">{greeting}</p>}
        </div>
      </div>
    </section>
  );
}

/** Çiftin davet metni. Sihirbazdan geçmeyen eski davetiyelerde boş olur, o zaman hiç görünmez. */
export function MessageCard({ inv }: { inv: Invitation }) {
  if (!inv.message?.trim()) return null;
  return (
    <section className="card davet-metni">
      <p>{inv.message}</p>
    </section>
  );
}


export function EventsCard({ inv, events, title = "Davetli olduğunuz günler", calendarHref, weather = {} }: {
  inv: Invitation; events: EventRow[]; title?: string; calendarHref?: string;
  /** Etkinlik 9 gün içindeyse hava tahmini (etkinlik kimliğine göre) */
  weather?: Record<string, Forecast | null>;
}) {
  const sonHava = [...events].reverse().find((e) => weather[e.id])?.id;
  /** "19:00 Nikâh töreni" satırlarını saat ve metin olarak ayırır. */
  const parseProgram = (text: string) =>
    text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const m = l.match(/^(\d{1,2}[:.]\d{2})\s+(.*)$/);
      return m ? [m[1].replace(".", ":"), m[2]] : ["", l];
    });
  // Ana törenin programı invitations.program, ikinci etkinliğinki extra_program sütununda
  const programOf = (e: EventRow) => parseProgram(isExtraKind(e.kind) ? inv.extra_program : inv.program);
  const hasWedding = Boolean(mainOf(events));
  return (
    <section className="card">
      <h2>{title}</h2>
      {events.map((e) => (
        <div className={`ev ${e.kind}`} key={e.id}>
          <div className="cal"><b>{dayNum(e.event_date)}</b><span>{monShort(e.event_date)}</span></div>
          <div>
            <h3>{e.title}</h3>
            <p>{longDate(e.event_date)} · {e.event_time}</p>
            {weather[e.id] && <WeatherLine forecast={weather[e.id]!} credit={e.id === sonHava} />}
            <p className="muted">{e.venue}{e.address ? `, ${e.address}` : ""}</p>
            <Directions hotels={!isExtraKind(e.kind)}
              place={{ venue: e.venue, address: e.address, lat: e.lat, lng: e.lng, placeId: e.place_id, directions: e.directions }} />
          </div>
        </div>
      ))}
      {hasWedding && inv.bus_from && (
        <div className="bus"><span aria-hidden="true">🚌</span><div><b>Servis:</b> {inv.bus_from}{inv.bus_time ? `, saat ${inv.bus_time}` : ""}.{inv.bus_note && <span className="muted"> {inv.bus_note}</span>}
          {inv.bus_lat != null && <Directions className="yol-servis" place={{ venue: inv.bus_from, lat: inv.bus_lat, lng: inv.bus_lng, placeId: inv.bus_place }} />}</div></div>
      )}
      {events.map((e) => {
        const lines = programOf(e);
        if (!lines.length) return null;
        return (
          <div key={`prog-${e.id}`}>
            <h3 style={{ margin: "14px 0 6px" }}>{isExtraKind(e.kind) ? `${e.title} programı` : programTitle(events)}</h3>
            <ul className="prog">{lines.map(([t, x], i) => <li key={i}><b>{t}</b><span>{x}</span></li>)}</ul>
          </div>
        );
      })}
      {calendarHref && (
        <p style={{ margin: "14px 0 0" }}>
          <a className="btn ghost full" href={calendarHref}>Takvime ekle</a>
        </p>
      )}
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <b>Buyrun</b> ile hazırlandı. Katılım için üyelik gerekmez.<br />
      Bu davetiye sizden <b>para göndermenizi</b> asla istemez; isteyen olursa dikkat edin.<br />
      <a href="/gizlilik">Gizlilik ve KVKK</a>
    </footer>
  );
}
