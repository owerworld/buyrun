import { FONTS, ORNAMENTS, PATTERNS, fontOf, ornamentOf, patternOf } from "@/lib/design";
import { OrnamentSwatch, PatternSwatch } from "./Ornament";

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

/** Düzenleme formunda arka plan dokusu. Tüm dokular burada sunulur; seçim ev sahibinin. */
export function PatternPicker({ current }: { current?: string }) {
  const selected = patternOf(current).id;
  return (
    <fieldset style={{ marginTop: 18 }}>
      <legend className="lbl" style={{ margin: 0 }}>Arka plan dokusu</legend>
      <div className="tasarim-secim">
        {PATTERNS.map((d) => (
          <label key={d.id}>
            <input type="radio" name="pattern" value={d.id} defaultChecked={d.id === selected} />
            <span className="tasarim-kart" title={d.hint}>
              <PatternSwatch kind={d.id} />
              {d.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
