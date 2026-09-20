export function Sirma({ pos }: { pos: "t" | "b" }) {
  return (
    <svg className={`sirma ${pos}`} viewBox="0 0 120 18" aria-hidden="true">
      <rect x="0" y="0" width="120" height="18" />
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M8 9h26M86 9h26" />
        <path d="M60 2l7 7-7 7-7-7z" />
        <path d="M44 9c3-5 7-5 9 0M76 9c-3-5-7-5-9 0" />
      </g>
      <g fill="currentColor">
        <circle cx="38" cy="9" r="1.6" /><circle cx="82" cy="9" r="1.6" /><circle cx="60" cy="9" r="1.4" />
      </g>
    </svg>
  );
}
