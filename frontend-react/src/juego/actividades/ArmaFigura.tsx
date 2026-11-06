import { useMemo, useState } from "react";
import { decirContenido, efecto } from "../../servicios/audio";
import type { Ronda } from "../../tipos";
import { Destello, Hueco, Pieza, mezclar, type PropsActividad } from "./comunes";

interface Parte {
  d: string;
  color: string;
  /** Caja de la parte en el lienzo 300×300: [x, y, ancho, alto]. */
  caja: [number, number, number, number];
}

type Figura = NonNullable<Ronda["figura"]>;

/** Partes que el niño coloca; lo demás de la figura ya está dibujado. */
const FIGURAS: Record<Figura, { fijo: { d: string; color: string }[]; partes: Parte[]; nombre: string }> = {
  cohete: {
    nombre: "el cohete",
    fijo: [{ d: "M110 110 H190 V230 Q150 246 110 230 Z", color: "#F4F1FB" }],
    partes: [
      { d: "M110 110 Q150 20 190 110 Z", color: "#FFB7B2", caja: [110, 40, 80, 70] },
      { d: "M150 135 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0", color: "#9FD3F2", caja: [126, 111, 48, 48] },
      { d: "M110 170 L62 240 L110 226 Z", color: "#B9A8E6", caja: [62, 170, 48, 70] },
      { d: "M190 170 L238 240 L190 226 Z", color: "#FFD166", caja: [190, 170, 48, 70] },
    ],
  },
  casa: {
    nombre: "la casa",
    fijo: [{ d: "M70 140 H230 V260 H70 Z", color: "#FFF3D1" }],
    partes: [
      { d: "M50 145 L150 52 L250 145 Z", color: "#FFB7B2", caja: [50, 52, 200, 93] },
      { d: "M130 196 H170 V260 H130 Z", color: "#B9A8E6", caja: [130, 196, 40, 64] },
      { d: "M86 164 H120 V198 H86 Z", color: "#9FD3F2", caja: [86, 164, 34, 34] },
      { d: "M180 164 H214 V198 H180 Z", color: "#8FD9B6", caja: [180, 164, 34, 34] },
    ],
  },
  robot: {
    nombre: "el robot",
    fijo: [{ d: "M105 120 H195 V215 H105 Z", color: "#DDD5F3" }],
    partes: [
      { d: "M115 50 H185 V112 H115 Z", color: "#9FD3F2", caja: [115, 50, 70, 62] },
      { d: "M70 126 H100 V200 H70 Z", color: "#FFB7B2", caja: [70, 126, 30, 74] },
      { d: "M200 126 H230 V200 H200 Z", color: "#FFD166", caja: [200, 126, 30, 74] },
      { d: "M112 220 H190 V252 H112 Z", color: "#8FD9B6", caja: [112, 220, 78, 32] },
    ],
  },
};

/** Escala del lienzo (300 unidades → 390 px). */
const F = 1.3;

const TRAZO = { stroke: "#2B2440", strokeWidth: 5, strokeLinejoin: "round" as const };

/**
 * Arma la figura: cada espacio de la figura muestra una letra y cada pieza
 * lleva una. Se arrastra (o se toca la pieza y luego el espacio) para que
 * coincidan; al tocar una pieza Misi dice su sonido.
 */
export default function ArmaFigura({ ronda, nivelAyuda, bloqueado, paso, onRespuesta, onObjetivo }: PropsActividad) {
  const figura = FIGURAS[ronda.figura ?? "cohete"];
  const letras = useMemo(() => ronda.secuencia ?? [], [ronda]);
  const partes = figura.partes.slice(0, letras.length);
  const orden = useMemo(() => mezclar(partes.map((_, i) => i)), [ronda]); // eslint-disable-line react-hooks/exhaustive-deps
  const [puestas, setPuestas] = useState<Set<number>>(new Set());
  const [elegida, setElegida] = useState<number | null>(null);
  const [sacude, setSacude] = useState<number | null>(null);
  const completa = puestas.size >= partes.length;

  function poner(pieza: number, espacio: number): boolean {
    if (bloqueado || completa || puestas.has(pieza)) return false;
    if (pieza === espacio) {
      efecto("unir", paso + puestas.size);
      decirContenido(letras[pieza]);
      const n = new Set(puestas).add(pieza);
      setPuestas(n);
      setElegida(null);
      onRespuesta(letras[pieza], true, n.size >= partes.length);
      return true;
    }
    onObjetivo?.(letras[espacio]);
    setSacude(pieza);
    window.setTimeout(() => setSacude(null), 450);
    onRespuesta(letras[pieza], false, false);
    return false;
  }

  // Con pista, se ilumina un espacio libre y su pieza.
  const pistaEspacio = nivelAyuda >= 2 ? partes.findIndex((_, i) => !puestas.has(i)) : -1;

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-12">
      <div className={`figura-lienzo relative ${completa ? `figura-lista figura-${ronda.figura ?? "cohete"}` : ""}`} style={{ width: 300 * F, height: 300 * F }}>
        <svg viewBox="0 0 300 300" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          {figura.fijo.map((f, i) => (
            <path key={i} d={f.d} fill={f.color} {...TRAZO} />
          ))}
          {partes.map((p, i) => (
            <path key={i} d={p.d} className={`figura-parte ${puestas.has(i) ? "figura-parte-puesta" : ""}`} fill={puestas.has(i) ? p.color : "rgb(255 255 255 / 0.08)"} stroke={puestas.has(i) ? "#2B2440" : "rgb(255 255 255 / 0.7)"} strokeWidth={puestas.has(i) ? 5 : 3} strokeDasharray={puestas.has(i) ? undefined : "8 7"} strokeLinejoin="round" />
          ))}
        </svg>
        {partes.map((p, i) => {
          const [x, y, w, h] = p.caja;
          const lado = Math.max(52, Math.min(w, h) * F * 0.8);
          return (
            <span key={i} className="absolute grid place-items-center" style={{ left: (x + w / 2) * F - lado / 2, top: (y + h / 2) * F - lado / 2, width: lado, height: lado }}>
              <Hueco
                zona={`parte-${i}`}
                lleno={puestas.has(i)}
                etiqueta={puestas.has(i) ? `Lugar de ${letras[i]}, completo` : `Lugar de la letra ${letras[i]}`}
                onClick={elegida !== null && !puestas.has(i) ? () => poner(elegida, i) : undefined}
                className={`figura-hueco size-full !rounded-full ${puestas.has(i) ? "opacity-0" : ""} ${pistaEspacio === i ? "planeta-pista" : ""} ${elegida !== null && !puestas.has(i) ? "figura-hueco-activo" : ""}`}
              >
                {!puestas.has(i) ? <span className="font-lectura text-3xl font-bold text-white/80">{letras[i].toLowerCase()}</span> : null}
              </Hueco>
            </span>
          );
        })}
        {completa ? <Destello /> : null}
      </div>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:grid lg:grid-cols-2">
        {orden.map((i, k) => {
          const p = partes[i];
          const [x, y, w, h] = p.caja;
          return (
            <div key={i} className={`size-28 ${puestas.has(i) ? "invisible" : ""} ${sacude === i ? "sacudir" : ""}`}>
              <Pieza
                etiqueta={`Pieza con la letra ${letras[i]}`}
                indice={k}
                estado={elegida === i ? "correcto" : pistaEspacio === i ? "brilla" : "normal"}
                deshabilitada={bloqueado || puestas.has(i) || completa}
                onSoltar={(zona) => zona.startsWith("parte-") && poner(i, Number(zona.slice(6)))}
                onTocar={() => {
                  decirContenido(letras[i]);
                  setElegida(elegida === i ? null : i);
                }}
                className="size-full"
              >
                <svg viewBox={`${x - 6} ${y - 6} ${w + 12} ${h + 12}`} className="absolute inset-3 size-[calc(100%-1.5rem)]" aria-hidden="true">
                  <path d={p.d} fill={p.color} {...TRAZO} />
                </svg>
                <span className="relative font-lectura text-4xl font-bold text-tinta drop-shadow-[0_1px_0_white]">{letras[i].toLowerCase()}</span>
              </Pieza>
            </div>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {completa ? `¡Armaste ${figura.nombre}!` : elegida !== null ? `Elegiste la pieza ${letras[elegida]}. Toca su lugar.` : ""}
      </span>
    </div>
  );
}
