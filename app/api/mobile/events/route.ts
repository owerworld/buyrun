import { allow } from "@/lib/ratelimit";
import { createMobileEvent, mobileHandler, mobileJson, mobileOptions, mobileOrigin, readMobileBody, validateEvent, MobileError } from "@/lib/mobile";
export const dynamic = "force-dynamic";
export const OPTIONS = mobileOptions;
export async function POST(req: Request) {
  return mobileHandler(async () => {
    if (!await allow("mobile-create", 20, 3600)) throw new MobileError("Yeni etkinlik için biraz bekle.", 429);
    return mobileJson(await createMobileEvent(validateEvent(await readMobileBody(req)),mobileOrigin(req)),201);
  });
}
