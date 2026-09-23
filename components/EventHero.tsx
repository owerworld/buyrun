import { fontOf, ornamentOf } from "@/lib/design";
import { shortDate } from "@/lib/format";
import { Ornament } from "./Ornament";

/**
 * Etkinlik davetinin kapağı: düğün kapağıyla aynı tasarım sistemi (renk, süsleme,
 * yazı), ama iki isim yerine etkinliğin başlığı. Başlık uzun olabildiği için
 * yazı boyu kısaltılmış.
 */
export function EventHero({ title, category, date, time, venue, font, ornament, compact = false }: {
  title: string; category: string; date?: string; time?: string; venue?: string;
  font?: string; ornament?: string; compact?: boolean;
}) {
  const f = fontOf(font).id, o = ornamentOf(ornament).id;
  return (
    <section className={`hero etkinlik-kapak f-${f} o-${o}${compact ? " kucuk" : ""}`} aria-label="Davet kapağı">
      <div className="frame">
        <Ornament kind={o} />
        <div className="inner">
          <p className="pre">{category}</p>
          <h1 className="names"><span>{title}</span></h1>
          {date && <p className="date">{shortDate(date)}{time ? ` · ${time}` : ""}</p>}
          {venue && <p className="city">{venue}</p>}
        </div>
      </div>
    </section>
  );
}
