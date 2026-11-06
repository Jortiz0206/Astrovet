import type { ReactNode } from "react";
import { obtenerPersonaje, pelajeDe, type IdPersonaje } from "../datos/personajes";
import type { ColorPelaje, Jugador } from "../tipos";
import Misi, { type AnimoMisi } from "./Misi";

// Compañeros del niño, dibujados en el mismo lienzo de 200×200 que Misi:
// mismo traje y casco, cambia la cabeza. Misi sigue siendo el de serie y es
// el único que cambia de pelaje.

interface Estilo {
  base: string;
  borde: string;
  ojos: string;
  acento: string;
  acento2: string;
  hocico?: string;
  /** Ojos claros con pupila (para caras con parches oscuros). */
  ojosClaros?: boolean;
}

/** Colores del pelaje elegido, con los detalles fijos de cada personaje. */
function estiloDe(personaje: Exclude<IdPersonaje, "misi">, variante?: string): Estilo {
  const p = pelajeDe(personaje, variante);
  return {
    base: p.base,
    borde: p.borde,
    ojos: "#2B2440",
    acento: p.acento ?? p.borde,
    acento2: p.acento2 ?? p.acento ?? p.borde,
    hocico: p.hocico,
    ojosClaros: personaje === "bambu",
  };
}

/** Lo que va detrás de la cabeza (orejas, cuernos). */
const DETRAS: Partial<Record<IdPersonaje, (e: Estilo) => ReactNode>> = {
  lila: (e) => (
    <>
      <ellipse cx="72" cy="36" rx="16" ry="40" transform="rotate(-12 72 36)" fill={e.base} stroke={e.borde} strokeWidth="5" />
      <ellipse cx="128" cy="36" rx="16" ry="40" transform="rotate(12 128 36)" fill={e.base} stroke={e.borde} strokeWidth="5" />
      <ellipse cx="72" cy="38" rx="7" ry="28" transform="rotate(-12 72 38)" fill={e.acento} />
      <ellipse cx="128" cy="38" rx="7" ry="28" transform="rotate(12 128 38)" fill={e.acento} />
    </>
  ),
  rayo: (e) => (
    <>
      <path d="M46 78 L50 16 L94 52 Z" fill={e.base} stroke={e.borde} strokeWidth="5" strokeLinejoin="round" />
      <path d="M154 78 L150 16 L106 52 Z" fill={e.base} stroke={e.borde} strokeWidth="5" strokeLinejoin="round" />
      <path d="M50 18 L49 36 L63 28 Z" fill={e.acento} />
      <path d="M150 18 L151 36 L137 28 Z" fill={e.acento} />
      <path d="M58 62 L60 34 L80 52 Z" fill={e.hocico ?? "#FFF8EE"} />
      <path d="M142 62 L140 34 L120 52 Z" fill={e.hocico ?? "#FFF8EE"} />
    </>
  ),
  bambu: (e) => (
    <>
      <circle cx="52" cy="54" r="22" fill={e.acento} stroke={e.borde} strokeWidth="5" />
      <circle cx="148" cy="54" r="22" fill={e.acento} stroke={e.borde} strokeWidth="5" />
    </>
  ),
  chispa: (e) => (
    <>
      <path d="M64 60 C58 44 54 30 50 16 C66 26 78 38 84 52 Z" fill={e.acento} stroke={e.borde} strokeWidth="4" strokeLinejoin="round" />
      <path d="M136 60 C142 44 146 30 150 16 C134 26 122 38 116 52 Z" fill={e.acento} stroke={e.borde} strokeWidth="4" strokeLinejoin="round" />
      {[86, 100, 114].map((x) => (
        <path key={x} d={`M${x - 8} 48 L${x} 30 L${x + 8} 48 Z`} fill={e.acento2} stroke={e.borde} strokeWidth="3.5" strokeLinejoin="round" />
      ))}
    </>
  ),
};

/** Lo que va sobre la cabeza y antes de los ojos (manchas, orejas caídas, máscaras). */
const DELANTE: Partial<Record<IdPersonaje, (e: Estilo) => ReactNode>> = {
  toby: (e) => (
    <>
      <ellipse cx="124" cy="92" rx="19" ry="18" fill={e.acento2} />
      <circle cx="70" cy="62" r="6" fill={e.acento2} opacity="0.85" />
      <circle cx="140" cy="128" r="5" fill={e.acento2} opacity="0.85" />
      <path d="M50 60 C26 64 20 112 34 130 C46 140 58 122 60 100 Z" fill={e.acento} stroke={e.borde} strokeWidth="5" strokeLinejoin="round" />
      <path d="M150 60 C174 64 180 112 166 130 C154 140 142 122 140 100 Z" fill={e.acento} stroke={e.borde} strokeWidth="5" strokeLinejoin="round" />
    </>
  ),
  rayo: (e) => (
    <path d="M40 104 C62 100 86 110 100 130 C114 110 138 100 160 104 C156 136 130 152 100 152 C70 152 44 136 40 104 Z" fill={e.hocico ?? "#FFF8EE"} />
  ),
  lila: (e) =>
    e.acento2 !== e.acento ? (
      <>
        <ellipse cx="124" cy="88" rx="20" ry="17" fill={e.acento2} opacity="0.9" />
        <ellipse cx="66" cy="62" rx="12" ry="8" fill={e.acento2} opacity="0.9" />
      </>
    ) : null,
  bambu: (e) => (
    <>
      <ellipse cx="74" cy="96" rx="18" ry="22" transform="rotate(24 74 96)" fill={e.acento} />
      <ellipse cx="126" cy="96" rx="18" ry="22" transform="rotate(-24 126 96)" fill={e.acento} />
    </>
  ),
  pipo: (e) => (
    <>
      <path d="M100 70 C82 50 44 60 46 98 C48 132 76 150 100 150 C124 150 152 132 154 98 C156 60 118 50 100 70 Z" fill="#FFFFFF" />
      {e.acento2 !== e.acento ? (
        <>
          <path d="M44 96 C40 112 48 128 58 134 C56 120 52 106 44 96 Z" fill={e.acento2} />
          <path d="M156 96 C160 112 152 128 142 134 C144 120 148 106 156 96 Z" fill={e.acento2} />
        </>
      ) : null}
    </>
  ),
};

interface PersonajeProps {
  personaje?: IdPersonaje;
  pelaje?: ColorPelaje;
  /** Pelaje de los compañeros que no son Misi (id de PELAJES). */
  variante?: string;
  animo?: AnimoMisi;
  tamano?: number;
  className?: string;
  titulo?: string;
}

export default function Personaje({ personaje = "misi", pelaje, variante, animo = "feliz", tamano = 120, className = "", titulo }: PersonajeProps) {
  if (personaje === "misi") return <Misi pelaje={pelaje} animo={animo} tamano={tamano} className={className} titulo={titulo} />;
  const e = estiloDe(personaje, variante);
  const info = obtenerPersonaje(personaje);
  const duerme = animo === "duerme";
  const altoOjo = animo === "piensa" ? 9 : 13;
  const pico = personaje === "pipo";
  return (
    <svg viewBox="0 0 200 200" width={tamano} height={tamano} className={className} role="img" aria-label={titulo ?? `${info.nombre}, ${info.especie}`}>
      {/* Traje, igual al de Misi */}
      <path d="M38 196 C40 150 70 140 100 140 C130 140 160 150 162 196 Z" fill="#F4F1FB" stroke="#5E4E9A" strokeWidth="5" />
      <path d="M62 150 C80 162 120 162 138 150" fill="none" stroke="#8E7CC3" strokeWidth="9" strokeLinecap="round" />
      <circle cx="100" cy="176" r="14" fill="#FFD166" stroke="#5E4E9A" strokeWidth="4" />
      <path d="M100 168 V184 M92 176 H108" stroke="#E58C86" strokeWidth="5" strokeLinecap="round" />

      {DETRAS[personaje]?.(e)}
      <ellipse cx="100" cy="98" rx="62" ry="54" fill={e.base} stroke={e.borde} strokeWidth="5" />
      {DELANTE[personaje]?.(e)}
      {e.hocico ? <ellipse cx="100" cy="118" rx={personaje === "chispa" ? 34 : 30} ry="21" fill={e.hocico} /> : null}

      {/* Ojos */}
      {duerme ? (
        <g stroke={personaje === "bambu" ? "#FFFFFF" : e.borde} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M66 94 Q76 102 86 94" />
          <path d="M114 94 Q124 102 134 94" />
        </g>
      ) : e.ojosClaros ? (
        <g className="misi-ojos">
          <ellipse cx="76" cy="94" rx="10" ry={altoOjo} fill="#FFFFFF" />
          <ellipse cx="124" cy="94" rx="10" ry={altoOjo} fill="#FFFFFF" />
          <ellipse cx="77" cy="95" rx="6" ry={altoOjo - 4} fill={e.ojos} />
          <ellipse cx="123" cy="95" rx="6" ry={altoOjo - 4} fill={e.ojos} />
          <circle cx="79" cy="91" r="2.5" fill="#fff" />
          <circle cx="125" cy="91" r="2.5" fill="#fff" />
        </g>
      ) : (
        <g className="misi-ojos">
          <ellipse cx="76" cy="92" rx="10" ry={altoOjo} fill={e.ojos} />
          <ellipse cx="124" cy="92" rx="10" ry={altoOjo} fill={e.ojos} />
          <circle cx="80" cy="87" r="4" fill="#fff" />
          <circle cx="128" cy="87" r="4" fill="#fff" />
        </g>
      )}
      {/* Mejillas */}
      <circle cx="58" cy="116" r="9" fill="#FFB7B2" opacity="0.7" />
      <circle cx="142" cy="116" r="9" fill="#FFB7B2" opacity="0.7" />

      {/* Nariz, pico o fosas */}
      {pico ? (
        <path d="M86 108 H114 L100 124 Z" fill={e.acento} stroke={e.borde} strokeWidth="3" strokeLinejoin="round" />
      ) : personaje === "chispa" ? (
        <g fill={e.borde}>
          <ellipse cx="91" cy="110" rx="3.5" ry="2.5" />
          <ellipse cx="109" cy="110" rx="3.5" ry="2.5" />
        </g>
      ) : personaje === "lila" ? (
        <path d="M95 106 H105 L100 112 Z" fill="#E58C86" stroke={e.borde} strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <ellipse cx="100" cy="108" rx={personaje === "toby" ? 11 : 8} ry={personaje === "toby" ? 8 : 6} fill="#2B2440" />
      )}

      {/* Boca */}
      {animo === "habla" ? (
        <ellipse cx="100" cy={pico ? 132 : 126} rx="8" ry="6" fill="#7A3E4E" className="misi-boca" />
      ) : pico ? null : (
        <path d="M100 114 Q100 124 90 124 M100 114 Q100 124 110 124" fill="none" stroke={e.borde} strokeWidth="3" strokeLinecap="round" />
      )}
      {personaje === "lila" && animo !== "habla" ? (
        <g fill="#FFFFFF" stroke={e.borde} strokeWidth="2">
          <rect x="93" y="124" width="7" height="9" rx="2" />
          <rect x="100" y="124" width="7" height="9" rx="2" />
        </g>
      ) : null}
      {personaje === "toby" && animo === "feliz" ? <path d="M95 125 Q100 138 105 125 Z" fill="#E58C86" stroke={e.borde} strokeWidth="2" /> : null}
      {duerme ? (
        <text x="150" y="44" fontSize="26" fontWeight="800" fill="#DDD5F3" fontFamily="Nunito, sans-serif">
          z
        </text>
      ) : null}

      {/* Casco de cristal */}
      <circle cx="100" cy="96" r="88" fill="#E8F0FE" fillOpacity="0.14" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="5" />
      <path d="M44 56 A70 70 0 0 1 82 22" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

/** El compañero que eligió el niño, con su pelaje. */
export function PersonajeDe({ jugador, ...resto }: { jugador: Pick<Jugador, "personaje" | "pelaje" | "pelajes"> } & Omit<PersonajeProps, "personaje" | "pelaje" | "variante">) {
  const personaje = jugador.personaje ?? "misi";
  return <Personaje personaje={personaje} pelaje={jugador.pelaje} variante={jugador.pelajes?.[personaje]} {...resto} />;
}
