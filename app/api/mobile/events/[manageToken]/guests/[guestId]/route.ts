import { allow } from "@/lib/ratelimit";
import { editMobileGuest, mobileEventByToken, mobileHandler, mobileJson, mobileOptions, mobileOrigin, readMobileBody, requireMobileEvent, MobileError } from "@/lib/mobile";
export const dynamic = "force-dynamic";
export const OPTIONS = mobileOptions;
export async function PATCH(req: Request, {params}: {params:Promise<{manageToken:string;guestId:string}>}) {
  return mobileHandler(async () => {
    const p = await params;
    const row = requireMobileEvent(await mobileEventByToken(p.manageToken,"manage"));
    if (!await allow(`mobile-response:${row.id}`,300,3600)) throw new MobileError("Çok fazla yanıt kaydedildi. Biraz sonra dene.",429);
    return mobileJson(await editMobileGuest(row,p.guestId,await readMobileBody(req),mobileOrigin(req)));
  });
}
