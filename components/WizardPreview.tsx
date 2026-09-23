import { EventHero } from "@/components/EventHero";
import { Hero } from "@/components/Invite";
import type { Answers, Plan } from "@/lib/wizard";

const ORNEK_BASLIK: Record<string, string> = {
  dogumgunu: "İyi ki doğdun!", mezuniyet: "Mezun olduk!", evpartisi: "Yeni evimize buyrun",
  yemek: "Bir akşam yemeği", bulusma: "Buluşalım", kina: "Kına gecemize buyrun",
  bekarlik: "Bekârlığa veda!", sunnet: "Mert'in sünnet düğünü", babyshower: "Bebeğimizi bekliyoruz",
  cinsiyet: "Kız mı, erkek mi?", disbugdayi: "İlk dişimiz çıktı!", mevlid: "Mevlid-i Şerif",
  iftar: "İftar soframıza buyrun", hac: "Hac yolculuğuna uğurlama", asker: "Asker uğurlaması",
};

/**
 * Sihirbazın sağındaki canlı önizleme. Her cevapla yeniden çizilir; kullanıcı
 * verdiği kararın davetiyeye ne yaptığını anında görür.
 */
export function WizardPreview({ answers, plan, names, families, title }: { answers: Answers; plan: Plan; names?: [string, string]; families?: [string, string]; title?: string }) {
  if (plan.toren) {
    return (
      <Hero
        compact
        inv={{
          name_a: names?.[0] || "Defne", name_b: names?.[1] || "Mert",
          main_date: "2027-06-19", city: "", font: plan.font, ornament: plan.ornament,
          opening: answers.ton ? plan.opening : undefined,
          family_a: plan.families ? families?.[0] || "Ayşe & Ahmet Yılmaz" : "",
          family_b: plan.families ? families?.[1] || "Fatma & Mehmet Kaya" : "",
        }}
      />
    );
  }
  return (
    <EventHero
      compact
      title={title || (ORNEK_BASLIK[answers.tur ?? ""] ?? "Sizin davetiniz")}
      category={plan.category}
      date="2027-06-19"
      font={plan.font}
      ornament={plan.ornament}
    />
  );
}
