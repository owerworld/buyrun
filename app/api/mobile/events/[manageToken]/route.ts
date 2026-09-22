import { allow } from "@/lib/ratelimit";
import { editMobileEvent, eventInput, managedEvent, mobileEventByToken, mobileHandler, mobileJson, mobileOptions, mobileOrigin, readMobileBody, requireMobileEvent, validateEvent, MobileError } from "@/lib/mobile";
export const dynamic = "force-dynamic";
export const OPTIONS = mobileOptions;
type Context = {params: Promise<{manageToken:string}>};
export async function GET(req: Request, {params}: Context) {
  return mobileHandler(async () => mobileJson(await managedEvent(requireMobileEvent(await mobileEventByToken((await params).manageToken,"manage")),mobileOrigin(req))));
}
export async function PATCH(req: Request, {params}: Context) {
  return mobileHandler(async () => {
    const row = requireMobileEvent(await mobileEventByToken((await params).manageToken,"manage"));
    if (!await allow(`mobile-edit:${row.id}`, 120, 3600)) throw new MobileError("Çok fazla düzenleme yapıldı. Biraz sonra dene.",429);
    return mobileJson(await editMobileEvent(row,validateEvent(await readMobileBody(req),eventInput(row)),mobileOrigin(req)));
  });
}
