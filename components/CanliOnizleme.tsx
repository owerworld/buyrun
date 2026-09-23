"use client";

import { useEffect, useState } from "react";
import { WizardPreview } from "@/components/WizardPreview";
import type { Answers, Plan } from "@/lib/wizard";

const ALANLAR = ["nameA", "nameB", "familyA", "familyB", "title", "d_date", "date"] as const;

/**
 * Son sayfadaki önizleme: formda yazılan isim, başlık ve tarih davetiyede anında
 * görünür. Form kendi başına çalışır; bu bileşen yalnızca dinler.
 */
export function CanliOnizleme({ answers, plan }: { answers: Answers; plan: Plan }) {
  const [v, setV] = useState<Record<string, string>>({});
  useEffect(() => {
    const oku = () => {
      const next: Record<string, string> = {};
      for (const id of ALANLAR) {
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (el?.value.trim()) next[id] = el.value.trim();
      }
      setV(next);
    };
    const els = ALANLAR.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    els.forEach((el) => { el.addEventListener("input", oku); el.addEventListener("change", oku); });
    oku();
    return () => els.forEach((el) => { el.removeEventListener("input", oku); el.removeEventListener("change", oku); });
  }, []);
  const tarih = v.d_date || v.date;
  return (
    <WizardPreview
      answers={answers}
      plan={plan}
      names={[v.nameA ?? "", v.nameB ?? ""]}
      families={[v.familyA ?? "", v.familyB ?? ""]}
      title={v.title}
      date={/^\d{4}-\d{2}-\d{2}$/.test(tarih ?? "") ? tarih : undefined}
    />
  );
}
