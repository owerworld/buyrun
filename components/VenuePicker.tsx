"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Suggestion { id: string; name: string; address: string; lat?: number; lng?: number }
interface Coords { lat: number; lng: number; placeId: string }

/**
 * Sayfada son seçilen konum. Salon seçildikten sonra servis kalkış yeri ya da kına
 * mekânı aranırken o çevredeki sonuçlar öne çıkar ("Heykel" yazınca Karacabey'deki değil).
 */
let yakin: { lat: number; lng: number } | null = null;

/**
 * Mekân kutusu: yazdıkça gerçek yerleri önerir, seçilince adres ve konum kendiliğinden dolar.
 * Google Haritalar linki yapıştırılırsa konum linkten okunur.
 *
 * JavaScript kapalıysa sıradan metin kutusu gibi çalışır; konum kaydedilmez, davetli
 * yine yer adıyla yol tarifi alır.
 */
export function VenuePicker({
  prefix, venueName, addressName, label, placeholder, required, venueMax = 80, addressMax = 120,
  defaultVenue = "", defaultAddress = "", defaultLat, defaultLng, defaultPlaceId = "", note, defaultNote = "",
}: {
  /** Gizli alanların öneki: "d" → d_lat, d_lng, d_place, d_tarif */
  prefix: string;
  venueName: string;
  /** Adres kutusu; servis kalkış yeri gibi tek alanlı yerlerde yok */
  addressName?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  venueMax?: number;
  addressMax?: number;
  defaultVenue?: string;
  defaultAddress?: string;
  defaultLat?: number | null;
  defaultLng?: number | null;
  defaultPlaceId?: string;
  /** "Nasıl bulunur?" notu gösterilsin mi */
  note?: boolean;
  defaultNote?: string;
}) {
  const n = (k: string) => (prefix ? `${prefix}_${k}` : k);
  const uid = useId();
  const listId = `${uid}-liste`;
  const [venue, setVenue] = useState(defaultVenue);
  const [address, setAddress] = useState(defaultAddress);
  const [coords, setCoords] = useState<Coords | null>(
    defaultLat != null && defaultLng != null ? { lat: defaultLat, lng: defaultLng, placeId: defaultPlaceId } : null
  );
  // Konum hangi ada göre seçildi; kullanıcı adı değiştirirse konum eski yeri göstermesin
  const [chosenFor, setChosenFor] = useState(defaultLat != null ? defaultVenue : "");
  const [fromLink, setFromLink] = useState(false);
  const [list, setList] = useState<Suggestion[]>([]);
  const [provider, setProvider] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const session = useRef("");
  const skipSearch = useRef(true);

  useEffect(() => {
    session.current = globalThis.crypto?.randomUUID?.() ?? String(Math.random()).slice(2);
    if (!yakin && defaultLat != null && defaultLng != null) yakin = { lat: defaultLat, lng: defaultLng };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function remember(c: Coords) {
    setCoords(c);
    yakin = { lat: c.lat, lng: c.lng };
  }

  // Yazmayı bırakınca ara (her tuşta istek atma)
  useEffect(() => {
    if (skipSearch.current) { skipSearch.current = false; return; }
    const text = venue.trim();
    if (/^https:\/\//.test(text)) { void readLink(text); return; }
    if (text.length < 3 || (coords && text === chosenFor)) { setList([]); setOpen(false); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const near = yakin ? `&near=${yakin.lat.toFixed(4)},${yakin.lng.toFixed(4)}` : "";
        const r = await fetch(`/api/yer?q=${encodeURIComponent(text)}&s=${session.current}${near}`, { signal: ctrl.signal });
        const d = await r.json();
        setList(d.suggestions ?? []);
        setProvider(d.provider ?? "");
        setOpen(true);
        setActive(-1);
      } catch { /* sessiz: elle yazmaya devam edilebilir */ }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue]);

  async function readLink(url: string) {
    setBusy(true);
    setMsg("");
    setOpen(false);
    try {
      const r = await fetch(`/api/yer?link=${encodeURIComponent(url)}&s=${session.current}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Linkten konum okunamadı.");
      remember({ lat: d.place.lat, lng: d.place.lng, placeId: d.place.placeId ?? "" });
      setFromLink(true);
      skipSearch.current = true;
      setVenue(d.place.name || "");
      setChosenFor(d.place.name || "");
      setMsg(d.place.name ? "" : "Konum linkten alındı. Şimdi mekânın adını yazın.");
    } catch (e) {
      skipSearch.current = true;
      setVenue("");
      setMsg(e instanceof Error ? e.message : "Linkten konum okunamadı.");
    } finally {
      setBusy(false);
    }
  }

  async function choose(s: Suggestion) {
    setOpen(false);
    setMsg("");
    skipSearch.current = true;
    setVenue(s.name);
    setChosenFor(s.name);
    setFromLink(false);
    if (addressName && s.address) setAddress(s.address);
    if (s.lat != null && s.lng != null) { remember({ lat: s.lat, lng: s.lng, placeId: "" }); return; }
    setBusy(true);
    try {
      const r = await fetch(`/api/yer?id=${encodeURIComponent(s.id)}&s=${session.current}`);
      const d = await r.json();
      if (!r.ok) throw new Error();
      remember({ lat: d.place.lat, lng: d.place.lng, placeId: d.place.placeId ?? "" });
      if (addressName && d.place.address) setAddress(d.place.address);
    } catch {
      setCoords(null);
      setMsg("Konum alınamadı; davetliler yine yer adıyla yol tarifi alabilir.");
    } finally {
      setBusy(false);
      session.current = globalThis.crypto?.randomUUID?.() ?? String(Math.random()).slice(2);
    }
  }

  function onVenueChange(v: string) {
    setVenue(v);
    // Aramayla seçilen konum, ad değişince geçersiz olur; linkle gelen konum korunur
    if (coords && !fromLink && v.trim() !== chosenFor) setCoords(null);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !list.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % list.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i <= 0 ? list.length - 1 : i - 1)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); void choose(list[active]); }
    else if (e.key === "Escape") setOpen(false);
  }

  const kontrol = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}${coords.placeId ? `&query_place_id=${coords.placeId}` : ""}`
    : "";

  return (
    <div className="yer-secici">
      <label className="lbl" htmlFor={`${uid}-yer`}>{label}</label>
      <div className="yer-kutu">
        <input
          type="text" id={`${uid}-yer`} name={venueName} value={venue} required={required} maxLength={venueMax + 400}
          placeholder={placeholder} autoComplete="off"
          role="combobox" aria-autocomplete="list" aria-expanded={open && list.length > 0} aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => onVenueChange(e.target.value)} onKeyDown={onKey}
          onBlur={() => setTimeout(() => setOpen(false), 150)} onFocus={() => list.length && setOpen(true)}
        />
        {open && list.length > 0 && (
          <ul className="yer-liste" id={listId} role="listbox" aria-label="Bulunan yerler">
            {list.map((s, i) => (
              <li key={s.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}
                onMouseDown={(e) => { e.preventDefault(); void choose(s); }}>
                <b>{s.name}</b>
                {s.address && <small>{s.address}</small>}
              </li>
            ))}
            <li className="yer-kaynak" aria-hidden="true">
              {provider === "google" ? "Google ile" : provider === "tomtom" ? "Harita verisi © TomTom" : "Harita verisi © OpenStreetMap katkıcıları"}
            </li>
          </ul>
        )}
      </div>

      <p className={`yer-durum${coords ? " ok" : ""}`} aria-live="polite">
        {busy ? "Konum alınıyor…" : coords ? (
          <>✓ Konum bulundu, davetliler tek dokunuşla yol tarifi alacak. <a href={kontrol} target="_blank" rel="noopener noreferrer">Haritada kontrol et</a></>
        ) : msg || "Adını yazıp listeden seçin. Listede yoksa Google Haritalar linkini buraya yapıştırabilirsiniz."}
      </p>

      <input type="hidden" name={n("lat")} value={coords?.lat ?? ""} />
      <input type="hidden" name={n("lng")} value={coords?.lng ?? ""} />
      <input type="hidden" name={n("place")} value={coords?.placeId ?? ""} />

      {addressName && (
        <>
          <label className="lbl" htmlFor={`${uid}-adres`}>Adres</label>
          <input type="text" id={`${uid}-adres`} name={addressName} value={address} maxLength={addressMax}
            placeholder="Seçince kendiliğinden dolar" onChange={(e) => setAddress(e.target.value)} />
        </>
      )}
      {note && (
        <>
          <label className="lbl" htmlFor={`${uid}-tarif`}>Nasıl bulunur? <small className="muted">(isteğe bağlı)</small></label>
          <input type="text" id={`${uid}-tarif`} name={n("tarif")} defaultValue={defaultNote} maxLength={160}
            placeholder="Örn: Podyum Park içinde, otoparktan asansörle 2. kat" />
        </>
      )}
    </div>
  );
}
