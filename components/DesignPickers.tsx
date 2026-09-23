import { FONTS, ORNAMENTS, fontOf, ornamentOf } from "@/lib/design";
import { OrnamentSwatch } from "./Ornament";

/** Düzenleme formunda isimlerin yazı karakteri. */
export function FontPicker({ current, names }: { current?: string; names: string }) {
  const selected = fontOf(current).id;
  return (
    <fieldset style={{ marginTop: 18 }}>
      <legend className="lbl" style={{ margin: 0 }}>İsimlerin yazısı</legend>
      <div className="tasarim-secim">
        {FONTS.map((f) => (
          <label key={f.id}>
            <input type="radio" name="font" value={f.id} defaultChecked={f.id === selected} />
            <span className="tasarim-kart">
              <span className="yazi-ornek" aria-hidden="true" style={f.sample}>{names}</span>
              {f.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Düzenleme formunda çerçeve süslemesi. */
export function OrnamentPicker({ current }: { current?: string }) {
  const selected = ornamentOf(current).id;
  return (
    <fieldset style={{ marginTop: 18 }}>
      <legend className="lbl" style={{ margin: 0 }}>Süsleme</legend>
      <div className="tasarim-secim">
        {ORNAMENTS.map((o) => (
          <label key={o.id}>
            <input type="radio" name="ornament" value={o.id} defaultChecked={o.id === selected} />
            <span className="tasarim-kart">
              <OrnamentSwatch kind={o.id} />
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
