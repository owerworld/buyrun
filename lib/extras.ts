import type { EventRow } from "./data";
import { dayStatus, todayTr, type DayStatus } from "./eventday";
import { forecastFor, type Forecast } from "./weather";
import type { BannerItem } from "@/components/DayBanner";

/** Düğün davetiyesinin günü yaklaşınca gösterilecek bant ve her etkinliğin hava tahmini. */
export async function weddingExtras(events: EventRow[]) {
  const today = todayTr();
  const list = await Promise.all(events.map((e) => forecastFor(e.lat, e.lng, e.event_date, e.event_time, today)));
  const forecasts: Record<string, Forecast | null> = Object.fromEntries(events.map((e, i) => [e.id, list[i]]));
  const items: (BannerItem & { id: string })[] = events.map((e) => ({
    id: e.id, title: e.title, date: e.event_date, time: e.event_time,
    place: { venue: e.venue, address: e.address, lat: e.lat, lng: e.lng, placeId: e.place_id, directions: e.directions },
  }));
  const status = dayStatus(items) as DayStatus<BannerItem & { id: string }> | null;
  return { status, forecasts, bannerForecast: status ? forecasts[status.item.id] ?? null : null };
}
