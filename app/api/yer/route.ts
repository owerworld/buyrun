import { allow } from "@/lib/ratelimit";
import { looksLikeMapLink, parseNear, placeDetails, placesProvider, resolveMapLink, searchPlaces } from "@/lib/places";

export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Mekân seçicinin sunucu tarafı.
 *   ?q=Podyum Davet        → öneriler (&near=40.2,28.9 ile o çevre öne alınır)
 *   ?id=g:<placeId>        → seçilen Google önerisinin koordinatı
 *   ?link=https://maps…    → yapıştırılan harita linkinden ad ve koordinat
 * Tarayıcı Google'a ya da OpenStreetMap'e doğrudan istek atmaz.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  // Yazdıkça arama yapılır; sınır bu yüzden geniş, ama kötüye kullanıma kapalı
  if (!(await allow("yer", 400, 3600))) return json({ error: "Çok fazla arama yapıldı. Biraz sonra deneyin." }, 429);
  const session = (u.searchParams.get("s") || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 64) || "tek";

  const link = u.searchParams.get("link");
  if (link) {
    if (!looksLikeMapLink(link)) return json({ error: "Bu bir harita linkine benzemiyor." }, 400);
    const place = await resolveMapLink(link);
    return place ? json({ place }) : json({ error: "Linkten konum okunamadı. Mekânın adını yazmayı deneyin." }, 404);
  }

  const id = u.searchParams.get("id");
  if (id) {
    const place = await placeDetails(id, session);
    return place ? json({ place }) : json({ error: "Konum alınamadı." }, 404);
  }

  // Kaynak, listenin altında belirtilir (OpenStreetMap ve Google lisansları bunu ister)
  return json({ suggestions: await searchPlaces(u.searchParams.get("q") || "", session, parseNear(u.searchParams.get("near"))), provider: placesProvider() });
}
