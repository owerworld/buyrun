import Image from "next/image";

/** Mobil uygulamayla aynı üç kapak. Web'de kişisel fotoğraf yüklenmez. */
export const COVERS = [
  { id: "cherry", label: "Kiraz gibi", hint: "Doğum günü", src: "/mobile-covers/cherry.png" },
  { id: "midnight", label: "Uzun bir akşam", hint: "Akşam yemeği", src: "/mobile-covers/midnight.png" },
  { id: "bloom", label: "Birlikte güzel", hint: "Düğün, kına", src: "/mobile-covers/bloom.png" },
] as const;

export const isCover = (v: string) => COVERS.some((c) => c.id === v);

export function CoverPicker({ current }: { current?: string }) {
  const selected = COVERS.some((c) => c.id === current) ? current : COVERS[0].id;
  return (
    <fieldset style={{ marginTop: 14 }}>
      <legend className="lbl" style={{ margin: 0 }}>Kapak</legend>
      <div className="kapaklar">
        {COVERS.map((c) => (
          <label key={c.id}>
            <input type="radio" name="coverId" value={c.id} defaultChecked={c.id === selected} />
            <span className="kapak">
              <Image src={c.src} alt="" width={160} height={200} sizes="160px" />
              {c.label}
              <small>{c.hint}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
