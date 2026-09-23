import { writeInvitationText } from "@/lib/ai";
import { longDate } from "@/lib/format";
import { MobileError, mobileHandler, mobileJson, mobileOptions, readMobileBody } from "@/lib/mobile";
import { allow } from "@/lib/ratelimit";
import { parseAnswers, planFromAnswers } from "@/lib/wizard";

export const dynamic = "force-dynamic";
export const OPTIONS = mobileOptions;

const metin = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Mobil sihirbazın davet metni isteği.
 *
 * Sunucuda duruyor çünkü API anahtarı uygulamaya gömülemez. Metin üretmek para
 * harcadığı için istek sayısı davet oluşturmayla aynı sınırda tutuluyor.
 */
export async function POST(req: Request) {
  return mobileHandler(async () => {
    if (!(await allow("wizard-text", 40, 3600))) throw new MobileError("Metin için biraz bekle.", 429);
    const body = await readMobileBody(req);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new MobileError("İstek geçersiz.");
    const b = body as Record<string, unknown>;

    const answers = parseAnswers(
      Object.fromEntries(Object.entries(b.answers && typeof b.answers === "object" ? b.answers : {}).map(([k, v]) => [k, String(v)]))
    );
    const heading = metin(b.title, 100);
    const date = metin(b.date, 10);
    const venue = metin(b.venue, 160);
    if (!heading || !venue || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new MobileError("Etkinlik adı, tarih ve mekân gerekli.");

    const { text, source } = await writeInvitationText({
      plan: planFromAnswers(answers), answers, heading,
      host: metin(b.hostName, 80), dateLabel: longDate(date), venue,
      request: metin(b.request, 160),
      // "Başka metin" dendikçe artar; her basışta sıradaki öneri gelir
      variant: typeof b.variant === "number" && Number.isInteger(b.variant) ? Math.max(0, Math.min(b.variant, 50)) : 0,
    });
    return mobileJson({ text, source });
  });
}
