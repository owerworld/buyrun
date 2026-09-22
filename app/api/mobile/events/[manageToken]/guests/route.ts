import { allow } from "@/lib/ratelimit";
import { createMobileGuest, mobileEventByToken, mobileHandler, mobileJson, mobileOptions, mobileOrigin, readMobileBody, requireMobileEvent, MobileError } from "@/lib/mobile";
export const dynamic = "force-dynamic";
export const OPTIONS = mobileOptions;
export async function POST(req: Request, {params}: {params:Promise<{manageToken:string}>}) {
  return mobileHandler(async () => {
    const row = requireMobileEvent(await mobileEventByToken((await params).manageToken,"manage"));
    if (!await allow(`mobile-add:${row.id}`,200,3600)) throw new MobileError("Davetli eklemek için biraz bekle.",429);
    return mobileJson(await createMobileGuest(row,await readMobileBody(req),mobileOrigin(req)),201);
  });
}
