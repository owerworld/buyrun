/**
 * Tören türleri.
 *
 * Model aynı kalıyor: iki isim, iki aile, bir ana tören ve isteğe bağlı bir ikinci etkinlik.
 * Sünnet, mezuniyet gibi tek kişilik/kurumsal etkinlikler bilerek yok — bu modele oturmuyorlar.
 *
 * Metinler tek yerden geliyor ki davetli sayfası, aile panelindeki mesaj ve link önizlemesi
 * hep aynı dili konuşsun.
 */
export interface Kind {
  id: string;
  /** Etkinliğin davetiyedeki adı */
  title: string;
  /** Cümle içinde kullanılan kısa ad: "kına", "düğün" */
  short: string;
  /** Çiftin ağzından: "düğünümüzde", "kına gecemizde" */
  greeting: string;
  /** Üçüncü kişi ağzından: "düğünlerine", "kına gecelerine" */
  phrase: string;
}

/** Davetiyenin ana töreni. Her davetiyede bir tane vardır. */
export const MAIN_KINDS: Kind[] = [
  { id: "dugun", title: "Nikâh ve Düğün", short: "düğün", greeting: "düğünümüzde", phrase: "düğünlerine" },
  { id: "nisan", title: "Nişan Töreni", short: "nişan", greeting: "nişanımızda", phrase: "nişanlarına" },
  { id: "soz", title: "Söz Töreni", short: "söz", greeting: "söz törenimizde", phrase: "söz törenlerine" },
];

/** İsteğe bağlı ikinci etkinlik. */
export const EXTRA_KINDS: Kind[] = [
  { id: "kina", title: "Kına Gecesi", short: "kına", greeting: "kına gecemizde", phrase: "kına gecelerine" },
  { id: "after", title: "After Party", short: "after party", greeting: "after party'mizde", phrase: "after party'lerine" },
];

const ALL = [...MAIN_KINDS, ...EXTRA_KINDS];

export const DEFAULT_MAIN = MAIN_KINDS[0].id;
export const DEFAULT_EXTRA = EXTRA_KINDS[0].id;
export const isMainKind = (id: string) => MAIN_KINDS.some((k) => k.id === id);
export const isExtraKind = (id: string) => EXTRA_KINDS.some((k) => k.id === id);
export const kindOf = (id: string) => ALL.find((k) => k.id === id) ?? MAIN_KINDS[0];

type HasKind = { kind: string };

/** Davetiyenin ana töreni (düğün, nişan ya da söz). */
export const mainOf = <T extends HasKind>(events: T[]) => events.find((e) => isMainKind(e.kind));
/** İsteğe bağlı ikinci etkinlik (kına ya da after party). */
export const extraOf = <T extends HasKind>(events: T[]) => events.find((e) => isExtraKind(e.kind));

const buyuk = (s: string) => s.charAt(0).toLocaleUpperCase("tr") + s.slice(1);
/** Etkinlikleri takvim sırasına göre değil, anlatım sırasına göre dizer: önce ikinci etkinlik, sonra ana tören. */
const sirali = <T extends HasKind>(events: T[]) => [extraOf(events), mainOf(events)].filter(Boolean) as T[];

/** "kına gecemizde ve düğünümüzde" */
export const greetingFor = (events: HasKind[]) =>
  sirali(events).map((e) => kindOf(e.kind).greeting).join(" ve ") || "bu mutlu günümüzde";

/** "kına gecelerine ve düğünlerine" */
export const phraseFor = (events: HasKind[]) =>
  sirali(events).map((e) => kindOf(e.kind).phrase).join(" ve ") || "davetlerine";

/** "Kına ve düğün daveti" */
export const inviteLabel = (events: HasKind[]) => {
  const parts = sirali(events).map((e) => kindOf(e.kind).short);
  return parts.length ? `${buyuk(parts.join(" ve "))} daveti` : "Davet";
};

/** "Düğün günü programı" */
export const programTitle = (events: HasKind[]) => {
  const m = mainOf(events);
  return `${buyuk(m ? kindOf(m.kind).short : "tören")} günü programı`;
};
