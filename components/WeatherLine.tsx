import { WEATHER_CREDIT, type Forecast } from "@/lib/weather";

/** "🌙 Açık · 16° (gün içinde 9°–19°)" — yağmur bekleniyorsa kısa bir uyarı. */
export function WeatherLine({ forecast: f, credit = false }: { forecast: Forecast; credit?: boolean }) {
  return (
    <p className="hava">
      <span aria-hidden="true">{f.icon}</span>{" "}
      <b>{f.label}</b> · {f.temp}° <span className="hava-gun">(gün içinde {f.min}°–{f.max}°)</span>
      {f.rain >= 1 && <span className="hava-uyari"> Yağmur bekleniyor, şemsiyenizi unutmayın.</span>}
      {credit && <a className="hava-kaynak" href={WEATHER_CREDIT.href} target="_blank" rel="noopener noreferrer">{WEATHER_CREDIT.text}</a>}
    </p>
  );
}
