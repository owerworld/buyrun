import { allow } from "@/lib/ratelimit";
import { answersQuery, parseAnswers } from "@/lib/wizard";
import { createMobileEvent, mobileHandler, mobileJson, mobileOptions, mobileOrigin, readMobileBody, validateEvent, MobileError } from "@/lib/mobile";
export const dynamic = "force-dynamic";
export const OPTIONS = mobileOptions;
export async function POST(req: Request) {
  return mobileHandler(async () => {
    if (!await allow("mobile-create", 20, 3600)) throw new MobileError("Yeni etkinlik için biraz bekle.", 429);
    const body = await readMobileBody(req);
    // Sihirbazdan gelindiyse cevaplar: davet sayfasında hitap, sürpriz uyarısı ve not örneği
    const raw = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>).answers : null;
    const answers = raw && typeof raw === "object" && !Array.isArray(raw)
      ? answersQuery(parseAnswers(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v)]))))
      : "";
    return mobileJson(await createMobileEvent(validateEvent(body),mobileOrigin(req),undefined,undefined,answers),201);
  });
}
