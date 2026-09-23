import { fotolarFor, fotoSrc } from "@/lib/fotolar";

/**
 * Kapak fotoğrafı seçimi: türe göre elle seçilmiş telifsiz fotoğraflar ve
 * "fotoğrafsız" seçeneği. Seçilen fotoğraf canlı önizlemede hemen görünür.
 */
export function FotoSecici({ tur, current }: { tur: string | undefined; current?: string }) {
  const list = fotolarFor(tur);
  const secili = current === "" ? "" : list.some((f) => f.id === current) ? current : list[0].id;
  return (
    <fieldset className="foto-secici">
      <legend className="lbl">Kapak fotoğrafı</legend>
      <div className="foto-liste">
        {list.map((f) => (
          <label key={f.id} className="foto-kart" title={f.alt}>
            <input type="radio" name="photoId" value={f.id} defaultChecked={f.id === secili} />
            <img src={fotoSrc(f.id)} alt={f.alt} loading="lazy" decoding="async" />
          </label>
        ))}
        <label className="foto-kart yok">
          <input type="radio" name="photoId" value="" defaultChecked={secili === ""} />
          <span>Fotoğrafsız</span>
        </label>
      </div>
      <p className="muted small" style={{ marginTop: 6 }}>
        Telifsiz, filigransız fotoğraflar; kişisel fotoğraf istemiyoruz.
      </p>
    </fieldset>
  );
}
