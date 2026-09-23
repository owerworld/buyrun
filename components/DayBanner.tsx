import type { Forecast } from "@/lib/weather";
import { kalanMetin, type DayItem, type DayStatus } from "@/lib/eventday";
import type { PlaceRef } from "@/lib/directions";
import { Directions } from "./Directions";
import { WeatherLine } from "./WeatherLine";

export type BannerItem = DayItem & { place: PlaceRef & { directions?: string } };

/**
 * Etkinlik yaklaştıkça davetiyenin en üstünde çıkan bant. Etkinlik günü davetlinin
 * aradığı iki şey tek yerde: ne zaman başlıyor ve nasıl giderim.
 * Durum sunucuda hesaplanır; bu bileşen yalnızca gösterir.
 */
export function DayBanner({ status, forecast }: { status: DayStatus<BannerItem> | null; forecast?: Forecast | null }) {
  if (!status) return null;
  const { item } = status;
  if (status.kind === "yakinda") {
    return (
      <p className="gun-cip" role="status">
        <b>{status.days} gün kaldı</b> · {item.title}
      </p>
    );
  }
  const baslik =
    status.kind === "bugun" ? "Bugün görüşüyoruz!"
    : status.kind === "suruyor" ? "Şu an devam ediyor"
    : "Yarın görüşmek üzere";
  const alt =
    status.kind === "bugun" ? `${item.title} saat ${item.time}'da başlıyor · ${kalanMetin(status.minutes)} kaldı`
    : status.kind === "suruyor" ? `${item.title} saat ${item.time}'da başladı, hâlâ yetişebilirsiniz.`
    : `${item.title} yarın saat ${item.time}'da.`;
  return (
    <section className={`gun-bandi ${status.kind}`} aria-label="Etkinlik günü">
      <p className="gun-baslik">{baslik}</p>
      <p className="gun-alt">{alt}</p>
      {forecast && <WeatherLine forecast={forecast} />}
      <p className="gun-yer">{item.place.venue}</p>
      <Directions place={item.place} />
    </section>
  );
}
