export type GuestStatus = "pending" | "going" | "maybe" | "declined";
export type Guest = {
  id: string;
  name: string;
  status: GuestStatus;
  count: number;
  note?: string;
  token?: string;
  rsvpUrl?: string;
};
export type EventInput = {
  title: string;
  category: string;
  hostName: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  description: string;
  coverId: string;
  coverData?: string | null;
  capacity?: number | null;
};
export type Party = EventInput & {
  id: string;
  manageToken?: string;
  inviteToken?: string;
  shareUrl?: string;
  guests: Guest[];
  deleteAfter?: string;
  demo?: boolean;
};
export function counts(event: Party) {
  const yes = event.guests.filter((g) => g.status === "going");
  const pending = event.guests.filter((g) => g.status === "pending").length;
  return {
    people: yes.reduce((n, g) => n + g.count, 0),
    going: yes.length,
    pending,
    maybe: event.guests.filter((g) => g.status === "maybe").length,
    declined: event.guests.filter((g) => g.status === "declined").length,
    total: event.guests.length,
    percent: event.guests.length
      ? Math.round(
          ((event.guests.length - pending) / event.guests.length) * 100,
        )
      : 0,
  };
}
export function dateText(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(date + "T12:00:00").toLocaleDateString(
    "tr-TR",
    options || { day: "numeric", month: "long", weekday: "short" },
  );
}
export function fold(s: string) {
  return s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
}
const makeGuests = (names: string[], offset = 0): Guest[] =>
  names.map((name, i) => ({
    id: "sample-" + offset + "-" + i,
    name,
    status: (i < 5 ? "going" : i < 7 ? "maybe" : "pending") as GuestStatus,
    count: i % 3 === 0 ? 2 : 1,
  }));
export const demoEvents: Party[] = [
  {
    id: "sample-birthday",
    demo: true,
    title: "İyi ki doğdun, Ece!",
    category: "Doğum günü",
    hostName: "Ece",
    date: "2027-04-17",
    time: "20:00",
    venue: "Moda Teras",
    address: "Caferağa, Kadıköy / İstanbul",
    description:
      "Bir yaş daha, güzel bir bahane daha! En sevdiğim insanlarla bol kahkahalı bir akşam. Bir şarkı seçip gel; gerisini birlikte hallederiz. ✨",
    coverId: "cherry",
    capacity: 25,
    guests: makeGuests([
      "Deniz Yılmaz",
      "Ada ve Baran",
      "Selin Demir",
      "Mert Kaya",
      "Zeynep Aksoy",
      "Bora Yıldız",
      "Eylül Şen",
      "Can Arslan",
      "Duru Aydın",
      "Sarp Öz",
    ]),
  },
  {
    id: "sample-dinner",
    demo: true,
    title: "Sofrada yerin var.",
    category: "Akşam yemeği",
    hostName: "Deniz",
    date: "2027-04-23",
    time: "19:30",
    venue: "Bizim ev",
    address: "Cihangir, Beyoğlu / İstanbul",
    description:
      "Telefonları biraz kenara bırakalım. Güzel yemek, uzun sohbet, sevdiğimiz şarkılar. Birlikte bir sofra kuralım.",
    coverId: "midnight",
    capacity: 12,
    guests: makeGuests(
      ["Elif", "Arda", "Ece", "Kaan", "Melis", "Berk", "Seda", "Eren"],
      1,
    ),
  },
  {
    id: "sample-wedding",
    demo: true,
    title: "Defne & Mert",
    category: "Düğün",
    hostName: "Defne ve Mert",
    date: "2027-06-19",
    time: "19:30",
    venue: "Boğaz Bahçe",
    address: "Beykoz / İstanbul",
    description:
      "Hayatımızın yeni sayfasını, sevdiğimiz herkesle birlikte açıyoruz. Bu güzel günde yanımızda olmanız bizim için çok özel.",
    coverId: "bloom",
    capacity: 150,
    guests: makeGuests(
      [
        "Ayşe ve ailesi",
        "Gülşen Teyze",
        "Şükrü Öztürk",
        "İbrahim Çelik",
        "Çağrı Kaya",
        "Deniz",
        "Selin",
        "Elif",
      ],
      2,
    ),
  },
];
