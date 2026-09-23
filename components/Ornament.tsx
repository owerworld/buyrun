import { Sirma } from "./Sirma";

/**
 * Davetiye çerçevesinin süslemesi. Renkleri temadan (currentColor = --gold) alır,
 * böylece her süsleme her paletle uyumlu çalışır.
 */

/** Köşe çiçek dalı: bir sap, yapraklar ve bir tomurcuk. */
function Sprig({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg className={`orn kose ${pos}`} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d="M4 60C10 38 24 20 50 8" />
        <path d="M14 41c-6-1-9-6-9-11 5 0 9 4 9 11z" />
        <path d="M21 30c-2-6 1-11 6-12 1 5-1 10-6 12z" />
        <path d="M33 19c2-5 7-8 12-7-2 5-7 8-12 7z" />
        <path d="M19 45c5-2 10 0 13 5-5 2-10 0-13-5z" />
        <path d="M30 33c5-1 9 2 11 6-5 1-9-1-11-6z" />
      </g>
      <g fill="currentColor">
        <circle cx="51" cy="7" r="3" />
        <circle cx="45.5" cy="4.5" r="1.4" />
        <circle cx="55" cy="12" r="1.4" />
      </g>
    </svg>
  );
}

/** Art deco köşe: iç içe basamaklı çizgiler. */
function Deco({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg className={`orn kose ${pos}`} viewBox="0 0 48 48" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M3 45V3h42" />
        <path d="M9 45V9h36" />
        <path d="M15 32V15h17" />
        <path d="M3 3l12 12" />
      </g>
      <rect x="19" y="19" width="4" height="4" transform="rotate(45 21 21)" fill="currentColor" />
    </svg>
  );
}

/** Art deco yelpaze: üst ortada ışınlar. */
function Fan() {
  return (
    <svg className="orn yelpaze" viewBox="0 0 96 30" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 28a36 36 0 0 1 72 0" />
        <path d="M26 28a22 22 0 0 1 44 0" />
        <path d="M48 28V6M48 28L33 10M48 28L63 10M48 28L22 18M48 28L74 18" />
      </g>
      <circle cx="48" cy="28" r="2.2" fill="currentColor" />
    </svg>
  );
}

/** Defne dalı: kavisli sap boyunca karşılıklı yapraklar. Yapraklar hesapla dizilir. */
function Laurel({ pos }: { pos: "t" | "b" }) {
  const leaves = Array.from({ length: 11 }, (_, i) => {
    const t = 0.08 + i * 0.084;
    // Q(10,22) (70,6) (130,22) eğrisi üzerinde nokta ve eğim
    const x = (1 - t) ** 2 * 10 + 2 * (1 - t) * t * 70 + t ** 2 * 130;
    const y = (1 - t) ** 2 * 22 + 2 * (1 - t) * t * 6 + t ** 2 * 22;
    const dx = 2 * (1 - t) * 60 + 2 * t * 60;
    const dy = 2 * (1 - t) * -16 + 2 * t * 16;
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    const side = i % 2 ? -1 : 1;
    return (
      <path
        key={i}
        d="M0 0c3-4 8-5 12-3-3 4-8 5-12 3z"
        transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(a + side * 38).toFixed(1)}) scale(1 ${side})`}
      />
    );
  });
  return (
    <svg className={`orn defne ${pos}`} viewBox="0 0 140 30" aria-hidden="true">
      <path d="M10 22Q70 6 130 22" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <g fill="none" stroke="currentColor" strokeWidth="1">{leaves}</g>
    </svg>
  );
}

/** Çini lale: üç yapraklı çiçek, iki yaprak, yanlarda noktalı çizgi. İznik çinisinin en bilinen motifi. */
function Lale({ pos }: { pos: "t" | "b" }) {
  return (
    <svg className={`orn lale ${pos}`} viewBox="0 0 120 44" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 4c-4 6-4 13 0 17 4-4 4-11 0-17z" fill="currentColor" fillOpacity=".22" />
        <path d="M60 21c-8-1-11-8-10-14 3 4 6 8 10 14zM60 21c8-1 11-8 10-14-3 4-6 8-10 14z" />
        <path d="M60 21v19" />
        <path d="M60 36c-7-1-11-6-12-11 5 2 9 5 12 11zM60 36c7-1 11-6 12-11-5 2-9 5-12 11z" />
        <path d="M8 26h30M82 26h30" />
      </g>
      <g fill="currentColor">
        <circle cx="42" cy="26" r="1.6" /><circle cx="78" cy="26" r="1.6" />
        <circle cx="4" cy="26" r="1.2" /><circle cx="116" cy="26" r="1.2" />
      </g>
    </svg>
  );
}

const CORNERS = ["tl", "tr", "bl", "br"] as const;

export function Ornament({ kind }: { kind: string }) {
  switch (kind) {
    case "cicek":
      return <>{CORNERS.map((p) => <Sprig key={p} pos={p} />)}</>;
    case "deco":
      return <><Fan />{CORNERS.map((p) => <Deco key={p} pos={p} />)}</>;
    case "yaprak":
      return <><Laurel pos="t" /><Laurel pos="b" /></>;
    case "cini":
      return <><Lale pos="t" /><Lale pos="b" /></>;
    case "cizgi":
      return null;
    default:
      return <><Sirma pos="t" /><Sirma pos="b" /></>;
  }
}

/** Sihirbazdaki seçim kartları için küçük süsleme örneği. */
export function OrnamentSwatch({ kind }: { kind: string }) {
  return (
    <span className={`orn-ornek o-${kind}`} aria-hidden="true">
      <span className="frame"><Ornament kind={kind} /></span>
    </span>
  );
}

/** Sihirbaz ve düzenleme ekranı için küçük arka plan dokusu örneği. */
export function PatternSwatch({ kind }: { kind: string }) {
  return <span className={`desen-ornek d-${kind}`} aria-hidden="true" />;
}
