import type { Kind } from "@/lib/events";

/** Tören türü / ikinci etkinlik türü seçici. Tema seçiciyle aynı görsel dili kullanır. */
export function KindPicker({
  name, kinds, current, legend,
}: { name: string; kinds: Kind[]; current?: string; legend: string }) {
  const selected = kinds.some((k) => k.id === current) ? current : kinds[0].id;
  return (
    <fieldset style={{ marginTop: 14 }}>
      <legend className="lbl" style={{ margin: 0 }}>{legend}</legend>
      <div className={`secenekler${kinds.length === 2 ? " iki" : ""}`}>
        {kinds.map((k) => (
          <label key={k.id}>
            <input type="radio" name={name} value={k.id} defaultChecked={k.id === selected} />
            <span className="secenek">{k.title}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
