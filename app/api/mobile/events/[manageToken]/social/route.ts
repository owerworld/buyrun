import {mobileEventByToken,requireMobileEvent,mobileHandler,mobileJson,mobileOptions,readMobileBody,MobileError} from '@/lib/mobile';
import {socialData,updateSocial} from '@/lib/social';
import {allow} from '@/lib/ratelimit';
export const dynamic='force-dynamic';export const OPTIONS=mobileOptions;
type Context={params:Promise<{manageToken:string}>};
export async function GET(req:Request,{params}:Context){return mobileHandler(async()=>{const e=requireMobileEvent(await mobileEventByToken((await params).manageToken,'manage'));return mobileJson(await socialData(e.id,undefined,true))})}
export async function PATCH(req:Request,{params}:Context){return mobileHandler(async()=>{const e=requireMobileEvent(await mobileEventByToken((await params).manageToken,'manage'));if(!await allow(`social-edit:${e.id}`,120,3600))throw new MobileError('Biraz sonra tekrar dene.',429);return mobileJson(await updateSocial(e.id,await readMobileBody(req)))})}
