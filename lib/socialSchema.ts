export type SocialSettings={questions:{id:string;prompt:string}[];announcements:{id:string;text:string;at:string}[];poll:null|{id:string;title:string;options:{id:string;label:string}[];closed:boolean}};
export type SocialData={settings:SocialSettings;version:number;totals:Record<string,number>;voters:number;own:{votes:string[];answers:Record<string,string>};responses?:{name:string;answers:Record<string,string>;votes:string[]}[]};
export const emptySocial=():SocialSettings=>({questions:[],announcements:[],poll:null});
