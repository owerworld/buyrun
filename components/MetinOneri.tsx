"use client";

import { useState } from "react";

/**
 * "Başka metin öner": davetin türüne ve diline uyan hazır metinler arasında
 * gezdirir (lib/sozler.ts). Kullanıcı kendi metnini yazdıysa üzerine yazmadan önce sorar.
 */
export function MetinOneri({ hedef, oneriler }: { hedef: string; oneriler: string[] }) {
  const [sira, setSira] = useState(-1);
  if (oneriler.length < 2) return null;

  function sonraki() {
    const el = document.getElementById(hedef) as HTMLTextAreaElement | null;
    if (!el) return;
    const simdiki = el.value.trim();
    // Öneri + kullanıcının eklediği not ("Kırmızı beyaz giyelim.") olabilir: not korunur
    const bulunan = oneriler.findIndex((o) => simdiki.startsWith(o));
    const ek = bulunan >= 0 ? simdiki.slice(oneriler[bulunan].length).trim() : "";
    if (simdiki && bulunan < 0 && !window.confirm("Kendi yazdığınız metnin yerine öneri gelsin mi?")) return;
    const n = (bulunan + 1) % oneriler.length;
    el.value = ek ? `${oneriler[n]} ${ek}` : oneriler[n];
    el.dispatchEvent(new Event("input", { bubbles: true }));
    setSira(n);
  }

  return (
    <div className="metin-oneri">
      <button type="button" className="btn ghost small" onClick={sonraki}>↻ Başka metin öner</button>
      <span className="muted small" aria-live="polite">
        {sira < 0 ? `Bu davete uygun ${oneriler.length} hazır metin var` : `${sira + 1}. öneri / ${oneriler.length}`}
      </span>
    </div>
  );
}
