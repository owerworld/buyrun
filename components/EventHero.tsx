import { fontOf, ornamentOf, patternOf } from "@/lib/design";
import { fotoOf, fotoSrc } from "@/lib/fotolar";
import { shortDate } from "@/lib/format";
import { Ornament } from "./Ornament";

/**
 * Etkinlik davetinin kapağı: düğün kapağıyla aynı tasarım sistemi (renk, süsleme,
 * yazı), ama iki isim yerine etkinliğin başlığı. Başlık uzun olabildiği için
 * yazı boyu kısaltılmış.
 */
export function EventHero({ title, category, date, time, venue, font, ornament, pattern, photo, credit = false, compact = false }: {
  title: string; category: string; date?: string; time?: string; venue?: string;
  font?: string; ornament?: string; pattern?: string;
  /** Kapak fotoğrafı (lib/fotolar.ts); boşsa yalnızca tasarım */
  photo?: string;
  /** Fotoğrafçının adı altta küçük satırla anılsın mı (davet sayfası) */
  credit?: boolean;
  compact?: boolean;
}) {
  const f = fontOf(font).id, o = ornamentOf(ornament).id, d = patternOf(pattern).id;
  const foto = fotoOf(photo);
  return (
    <section className={`hero etkinlik-kapak f-${f} o-${o} d-${d}${compact ? " kucuk" : ""}${foto ? " fotolu" : ""}`} aria-label="Davet kapağı">
      {foto && (
        <figure className="kapak-foto">
          {/* Kendi sunucumuzdan: davetlinin tarayıcısı başka siteye istek atmaz */}
          <img src={fotoSrc(foto.id)} alt={foto.alt} width={1080} height={720} loading={compact ? "lazy" : "eager"} decoding="async" />
          {credit && (
            <figcaption>
              Fotoğraf: <a href={foto.link} target="_blank" rel="noopener noreferrer nofollow">{foto.credit}</a> · CC0
            </figcaption>
          )}
        </figure>
      )}
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
