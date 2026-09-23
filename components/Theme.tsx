import { THEMES, themeOf, type Vars } from "@/lib/themes";

const vars = (v: Vars) => Object.entries(v).map(([k, x]) => `${k}:${x}`).join(";");

/**
 * Seçilen temanın renklerini sayfaya uygular. Değerler sabit listeden gelir,
 * kullanıcı metni buraya girmez. Klasik temada hiç stil basılmaz.
 */
export function ThemeStyle({ theme }: { theme: string }) {
  const t = themeOf(theme);
  if (!Object.keys(t.light).length && !Object.keys(t.dark).length) return null;
  const css =
    `:root{${vars(t.light)}}` +
    `@media (prefers-color-scheme:dark){:root{${vars(t.dark)}}}`;
  return <style>{css}</style>;
}

/** Oluşturma ve düzenleme formlarındaki tema seçici. */
export function ThemePicker({ current }: { current?: string }) {
  const selected = themeOf(current).id;
  return (
    <fieldset style={{ marginTop: 14 }}>
      <legend className="lbl" style={{ margin: 0 }}>Tema</legend>
      <div className="temalar">
        {THEMES.map((t) => (
          <label key={t.id}>
            <input type="radio" name="theme" value={t.id} defaultChecked={t.id === selected} />
            <span className="tema">
              <span
                className="theme-preview"
                aria-hidden="true"
                style={{ background: t.og.bg, color: t.og.text, borderColor: t.og.frame }}
              ><span>A</span><em>ile</em><span>B</span></span>
              {t.label}
              <small>{t.hint}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Temayı yalnızca bir kutunun içine uygular (ör. yönetim panelindeki davetiye önizlemesi). */
export function themeScope(theme: string): React.CSSProperties {
  return themeOf(theme).light as React.CSSProperties;
}
