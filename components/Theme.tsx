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
/** ids verilirse yalnızca o davet türüne yakışan temalar, o sırayla (seçili olan her zaman listede). */
export function ThemePicker({ current, ids }: { current?: string; ids?: string[] }) {
  const selected = themeOf(current).id;
  const liste = ids
    ? [...new Set([...ids, selected])].map((id) => THEMES.find((t) => t.id === id)).filter((t): t is (typeof THEMES)[number] => Boolean(t))
    : THEMES;
  return (
    <fieldset style={{ marginTop: 14 }}>
      <legend className="lbl" style={{ margin: 0 }}>Tema</legend>
      <div className="temalar">
        {liste.map((t) => (
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
