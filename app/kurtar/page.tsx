import Link from "next/link";
import { recoverAction } from "../actions";

export const metadata = { title: "Yönetim linkini kurtar – Buyrun" };

export default async function Kurtar({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const { hata } = await searchParams;
  return (
    <main className="wrap">
      <div className="brand"><Link href="/">Buyrun</Link></div>
      <form action={recoverAction} className="card">
        <h1 className="title">Yönetim linkini kurtar</h1>
        <p className="muted">
          Davetiyeyi oluştururken size verilen kurtarma kodunu yazın. Yönetim sayfanıza geri döneriz.
        </p>
        {hata && <p className="err" role="alert">{hata}</p>}
        <label className="lbl" htmlFor="kod">Kurtarma kodu</label>
        <input
          type="text" id="kod" name="kod" required maxLength={40} autoComplete="off"
          autoCapitalize="characters" spellCheck={false} placeholder="ABCD-EFGH-JKMN"
          style={{ letterSpacing: ".12em", textTransform: "uppercase" }}
        />
        <button className="btn full" type="submit" style={{ marginTop: 14 }}>Yönetim sayfasına git</button>
        <div className="info">
          Kodunuz da yoksa: aile panellerinden birinin linki duruyorsa davetli listeniz güvende, panelden
          davetli eklemeye devam edebilirsiniz. Güvenlik gereği yönetim linkini başka türlü veremiyoruz —
          sizden telefon ya da e-posta istemediğimiz için doğrulayacak başka bir bilgimiz yok.
        </div>
      </form>
    </main>
  );
}
