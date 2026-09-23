import { directionLinks, type PlaceRef } from "@/lib/directions";

/**
 * Davetlinin "nasıl giderim?" sorusunun cevabı. Ana düğme Google Haritalar'da
 * bulunduğu yerden arabayla tarifi açar; altında Türkiye'de yaygın diğer
 * uygulamalar var (Yandex, Apple Haritalar, Waze).
 */
export function Directions({ place, hotels = false, className = "" }: { place: PlaceRef & { directions?: string }; hotels?: boolean; className?: string }) {
  const l = directionLinks(place);
  const dis = { target: "_blank", rel: "noopener noreferrer" } as const;
  return (
    <div className={`yol ${className}`}>
      {place.directions && <p className="yol-not"><b>Nasıl bulunur:</b> {place.directions}</p>}
      <a className="btn sm yol-ana" href={l.google} {...dis}>Yol tarifi al <span aria-hidden="true">↗</span></a>
      <p className="yol-diger">
        <span>Diğer:</span>
        <a href={l.yandex} {...dis}>Yandex</a>
        <a href={l.apple} {...dis}>Apple Haritalar</a>
        <a href={l.waze} {...dis}>Waze</a>
      </p>
      {hotels && l.hotels && (
        <p className="yol-diger"><a href={l.hotels} {...dis}>Şehir dışından gelenler için yakındaki oteller</a></p>
      )}
    </div>
  );
}
