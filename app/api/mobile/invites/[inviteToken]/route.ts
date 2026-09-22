import { allow } from "@/lib/ratelimit";
import { mobileEventByToken, mobileHandler, mobileJson, mobileOptions, mobileOrigin, publicEvent, readMobileBody, requireMobileEvent, respondMobile, MobileError } from "@/lib/mobile";
export const dynamic = "force-dynamic";
export const OPTIONS = mobileOptions;
type Context = {params:Promise<{inviteToken:string}>};
export async function GET(req: Request, {params}:Context) {
  return mobileHandler(async () => {
    const row = requireMobileEvent(await mobileEventByToken((await params).inviteToken,"invite"));
    return mobileJson(await publicEvent(row,new URL(req.url).searchParams.get("guest") || undefined));
  });
}
export async function POST(req: Request,{params}:Context) {
  return mobileHandler(async () => {
    const row = requireMobileEvent(await mobileEventByToken((await params).inviteToken,"invite"));
    if (!await allow(`mobile-rsvp:${row.id}`,40,3600)) throw new MobileError("Çok fazla yanıt gönderildi. Biraz sonra dene.",429);
    return mobileJson(await respondMobile(row,await readMobileBody(req),mobileOrigin(req)));
  });
}
