import { notFound } from "next/navigation";
import { getPanel, list, SIDE_LABEL } from "@/lib/data";
import { csvResponse, toCsv } from "@/lib/csv";

const DURUM = { geliyor: "Geliyor", gelmiyor: "Gelemiyor", bekliyor: "Bekliyor" } as const;

/** Ailenin kendi davetli listesini indirir. Salon ve kapı için yazdırılabilir. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getPanel(token);
  if (!data) notFound();
  const { family, events, guests } = data;

  const mine = guests.filter((g) => g.family_id === family.id);
  const titleOf = (id: string) => events.find((e) => e.id === id)?.title ?? "";

  const rows = mine.map((g) => [
    g.name,
    list(g.event_ids).map(titleOf).filter(Boolean).join(" + "),
    DURUM[g.status],
    g.status === "geliyor" ? g.count : 0,
    g.status === "geliyor" ? list(g.attend_ids).map(titleOf).filter(Boolean).join(" + ") : "",
    g.note,
  ]);
  const gelecek = mine.filter((g) => g.status === "geliyor").reduce((s, g) => s + g.count, 0);
  rows.push(["TOPLAM", "", "", gelecek, "", `${mine.length} davet`]);

  const csv = toCsv(
    ["Davetli", "Davetli olduğu günler", "Durum", "Kişi sayısı", "Geleceği günler", "Not"],
    rows
  );
  return csvResponse(csv, `${SIDE_LABEL[family.side].toLowerCase().replace(/\s/g, "-")}-davetli-listesi.csv`);
}
