import type { CSSProperties } from "react";
import Criatura from "../Criatura";

/** Una nube de la niebla de colores del Planeta Nebulosa. */
function Bruma({ className, style, tono }: { className: string; style?: CSSProperties; tono: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} style={style} aria-hidden="true">
      <g fill={tono}>
        <circle cx="52" cy="72" r="38" />
        <circle cx="94" cy="50" r="46" />
        <circle cx="144" cy="66" r="40" />
        <circle cx="172" cy="88" r="26" />
        <rect x="24" y="76" width="156" height="38" rx="19" />
      </g>
    </svg>
  );
}

const CAPAS: { clase: string; tono: string; sale: string }[] = [
  { clase: "left-[-26%] top-[-4%] w-[70%]", tono: "#cdbdf2", sale: "-130%, -18%" },
  { clase: "right-[-30%] top-[30%] w-[70%]", tono: "#ffd3cf", sale: "130%, -6%" },
  { clase: "left-[-14%] bottom-[-12%] w-[78%]", tono: "#e9e1fb", sale: "-20%, 120%" },
];

/**
 * Ada, la abeja perdida, detrás de tres capas de niebla. Cada ronda ganada
 * aparta una capa (transform + opacity) y aclara a Ada (blur ≤ 9px).
 */
export default function NieblaAda({ capas, tamano, className = "" }: { capas: number; tamano: number; className?: string }) {
  const despejado = 3 - capas;
  return (
    <div className={`niebla-ada relative grid place-items-center ${className}`} style={{ width: tamano, height: tamano }}>
      <span className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgb(255_209_102/0.45),transparent_68%)]" aria-hidden="true" />
      <span
        className="ada-tras-niebla relative"
        style={{ filter: `blur(${capas * 3}px) saturate(${0.4 + despejado * 0.2})`, opacity: 0.55 + despejado * 0.15 }}
      >
        <Criatura clave="abeja" tamano={Math.round(tamano * 0.62)} titulo={capas ? "Ada, escondida en la niebla" : "Ada, la abeja"} />
      </span>
      {CAPAS.map((c, i) => (
        <Bruma
          key={i}
          tono={c.tono}
          className={`bruma absolute ${c.clase} ${i < capas ? "" : "bruma-fuera"}`}
          style={{ "--sale": c.sale, "--retardo": `${i * 0.7}s` } as CSSProperties}
        />
      ))}
    </div>
  );
}
