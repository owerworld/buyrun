"use client";
import { useState } from "react";

export function CopyButton({ text, label = "Kopyala", done = "Kopyalandı" }: { text: string; label?: string; done?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="lnk"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }
        catch { window.prompt("Metni kopyalayın:", text); }
      }}
    >
      {ok ? done : label}
    </button>
  );
}
