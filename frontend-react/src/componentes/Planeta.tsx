const T = "#2B2440";
const P = { stroke: T, strokeWidth: 3.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Ilustración de cada mundo del mapa. */
export default function Planeta({ mundo, tamano = 96, className = "" }: { mundo: number; tamano?: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" width={tamano} height={tamano} className={`overflow-visible ${className}`} aria-hidden="true">
      {mundo === 1 ? (
        <>
          <ellipse cx="60" cy="62" rx="56" ry="16" fill="none" stroke="#FFB7B2" strokeWidth="9" transform="rotate(-14 60 62)" />
          <circle cx="60" cy="58" r="36" fill="#9C7FD1" {...P} />
          <path d="M30 46 C42 40 54 50 66 44 C78 38 86 44 92 48" fill="none" stroke="#DDD5F3" strokeWidth="6" strokeLinecap="round" />
          <path d="M28 66 C40 62 52 72 66 66 C78 60 86 66 94 64" fill="none" stroke="#B9A8E6" strokeWidth="6" strokeLinecap="round" />
          <path d="M6 70 A56 16 -14 0 0 116 46" fill="none" stroke="#FFB7B2" strokeWidth="9" strokeLinecap="round" />
          <path d="M6 70 A56 16 -14 0 0 116 46" fill="none" {...P} strokeWidth={2} opacity="0.5" />
          <path d="M18 30 c4 -6 12 -6 14 0 c6 0 6 8 0 8 h-14 c-4 0 -4 -8 0 -8 z" fill="#fff" {...P} strokeWidth={2.5} />
        </>
      ) : mundo === 2 ? (
        <>
          <circle cx="60" cy="60" r="40" fill="#D5DDF3" {...P} />
          <circle cx="44" cy="46" r="9" fill="#B3BFE3" {...P} strokeWidth={2.5} />
          <circle cx="74" cy="70" r="12" fill="#B3BFE3" {...P} strokeWidth={2.5} />
          <circle cx="50" cy="80" r="5" fill="#B3BFE3" {...P} strokeWidth={2} />
          <circle cx="78" cy="40" r="4" fill="#B3BFE3" {...P} strokeWidth={2} />
          <path d="M96 16 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#FFD166" {...P} strokeWidth={2} />
          <path d="M18 96 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z" fill="#FFD166" />
        </>
      ) : (
        <>
          <circle cx="60" cy="62" r="38" fill="#4FB08A" {...P} />
          <path d="M30 54 C40 50 46 60 58 56 C70 52 74 60 90 58" fill="none" stroke="#9BE7A8" strokeWidth="6" strokeLinecap="round" />
          <path d="M60 24 C56 10 40 6 30 12 C40 14 50 20 60 24 Z" fill="#9BE7A8" {...P} />
          <path d="M62 24 C70 10 88 8 96 16 C84 16 72 20 62 24 Z" fill="#6FBF8E" {...P} />
          <path d="M60 24 V30" {...P} />
          <circle cx="44" cy="76" r="4" fill="#FFD166" />
          <circle cx="78" cy="80" r="3" fill="#FFB7B2" />
          <circle cx="70" cy="70" r="2.5" fill="#FFD166" />
        </>
      )}
    </svg>
  );
}
