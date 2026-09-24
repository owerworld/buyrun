import { EventHero } from "@/components/EventHero";
import { Hero } from "@/components/Invite";
import { ornekBaslik } from "@/lib/ornekler";
import type { Answers, Plan } from "@/lib/wizard";

/**
 * Sihirbazın sağındaki canlı önizleme. Her cevapla yeniden çizilir; kullanıcı
 * verdiği kararın davetiyeye ne yaptığını anında görür.
 */
export function WizardPreview({ answers, plan, names, families, title, date, photo }: { answers: Answers; plan: Plan; names?: [string, string]; families?: [string, string]; title?: string; date?: string; photo?: string }) {
  if (plan.toren) {
    return (
      <Hero
        compact
        inv={{
          name_a: names?.[0] || "Defne", name_b: names?.[1] || "Mert",
          main_date: date || "2027-06-19", city: "", font: plan.font, ornament: plan.ornament, pattern: plan.pattern,
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
      title={title || ornekBaslik(answers)}
      category={plan.category}
      date={date || "2027-06-19"}
      font={plan.font}
      ornament={plan.ornament}
      pattern={plan.pattern}
      photo={photo ?? plan.photo}
    />
  );
}
