import { Sirma } from "./Sirma";
import { shortDate } from "@/lib/format";
import { themeOf } from "@/lib/themes";
export function InvitationCard({ nameA, nameB, date, city, theme = "klasik" }: { nameA: string; nameB: string; date: string; city: string; theme?: string }) {
  const t = themeOf(theme);
  return <div className="invitation-art" style={{ background: t.og.bg, color: t.og.text, ["--gold" as string]: t.og.frame, ["--velvet" as string]: t.og.bg }}><div className="invitation-art-frame"><Sirma pos="t" /><p className="eyebrow" style={{ color: t.og.accent }}>Birlikte, en güzel güne.</p><div className="preview-names"><span>{nameA}</span><em>ile</em><span>{nameB}</span></div><span className="invitation-divider" /><p className="preview-date">{shortDate(date)}</p><p className="preview-city">{city}</p><Sirma pos="b" /></div></div>;
}
