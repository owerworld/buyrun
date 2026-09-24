import {mobileEventByToken,requireMobileEvent,mobileHandler,mobileJson,mobileOptions,readMobileBody,MobileError} from '@/lib/mobile';
import {socialData,respondSocial} from '@/lib/social';
import {allow} from '@/lib/ratelimit';
export const dynamic='force-dynamic';export const OPTIONS=mobileOptions;
type Context={params:Promise<{inviteToken:string}>};
export async function GET(req:Request,{params}:Context){return mobileHandler(async()=>{const e=requireMobileEvent(await mobileEventByToken((await params).inviteToken,'invite'));return mobileJson(await socialData(e.id,new URL(req.url).searchParams.get('guest')||undefined))})}
export async function POST(req:Request,{params}:Context){return mobileHandler(async()=>{const e=requireMobileEvent(await mobileEventByToken((await params).inviteToken,'invite'));if(!await allow(`social-reply:${e.id}`,120,3600))throw new MobileError('Biraz sonra tekrar dene.',429);return mobileJson(await respondSocial(e.id,await readMobileBody(req)))})}
