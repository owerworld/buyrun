import Image from "next/image";
import { COVERS } from "@/components/CoverPicker";
import { Hero } from "@/components/Invite";
import type { Answers, Plan } from "@/lib/wizard";

const ORNEK_BASLIK: Record<string, string> = {
  dogumgunu: "İyi ki doğdun!", mezuniyet: "Mezun olduk!", evpartisi: "Yeni evimize buyrun",
  yemek: "Bir akşam yemeği", bulusma: "Buluşalım", kina: "Kına gecemize buyrun",
};

/**
 * Sihirbazın sağındaki canlı önizleme. Her cevapla yeniden çizilir; kullanıcı
 * verdiği kararın davetiyeye ne yaptığını anında görür.
 */
export function WizardPreview({ answers, plan, names }: { answers: Answers; plan: Plan; names?: [string, string] }) {
  if (plan.toren) {
    return (
      <Hero
        compact
        inv={{
          name_a: names?.[0] || "Defne", name_b: names?.[1] || "Mert",
          main_date: "2027-06-19", city: "", font: plan.font, ornament: plan.ornament,
        }}
      />
    );
  }
  const cover = COVERS.find((c) => c.id === plan.coverId) ?? COVERS[0];
  return (
    <div className="kapak-onizleme">
      <Image src={cover.src} alt="" fill sizes="(max-width: 760px) 260px, 340px" />
      <div className="kapak-golge" />
      <div className="kapak-yazi">
        <span>{plan.category}</span>
        <b>{ORNEK_BASLIK[answers.tur ?? ""] ?? "Sizin davetiniz"}</b>
      </div>
    </div>
  );
}
