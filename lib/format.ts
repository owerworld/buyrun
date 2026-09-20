const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const DAYS = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, wd };
}
export const longDate = (iso: string) => { const p = parts(iso); return `${p.d} ${MONTHS[p.m - 1]} ${p.y}, ${DAYS[p.wd]}`; };
export const shortDate = (iso: string) => { const p = parts(iso); return `${p.d} ${MONTHS[p.m - 1]} ${p.y}`; };
export const dayNum = (iso: string) => String(parts(iso).d);
export const monShort = (iso: string) => MONTHS[parts(iso).m - 1].slice(0, 3);

export function addDays(iso: string, n: number) {
  const p = parts(iso);
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return dt.toISOString().slice(0, 10);
}
export const todayIso = () => new Date().toISOString().slice(0, 10);

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
