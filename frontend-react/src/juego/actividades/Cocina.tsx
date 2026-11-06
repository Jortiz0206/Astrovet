import { useMemo, useRef, useState } from "react";
import Dibujo from "../../componentes/Dibujo";
import { decirContenido, efecto } from "../../servicios/audio";
import { Hueco, Pieza, escalaDe, mezclar, sinTildes, type PropsActividad } from "./comunes";

/**
 * Cocina con sonidos: en la mesa hay ingredientes; a la olla va lo que empieza
 * con el sonido pedido. La sopa burbujea más con cada ingrediente correcto.
 */
export default function Cocina({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const ingredientes = useMemo(() => mezclar(ronda.opciones), [ronda]);
  const correctos = useMemo(() => ronda.opciones.filter((o) => sinTildes(o).startsWith(ronda.objetivo)), [ronda]);
  const [enOlla, setEnOlla] = useState<string[]>([]);
  const [rebota, setRebota] = useState<string | null>(null);
  const [splash, setSplash] = useState(0);
  const olla = useRef<HTMLDivElement>(null);
  const lista = enOlla.length >= correctos.length;

  /** Vuelo del ingrediente tocado hasta la olla (WAAPI: transform y opacidad). */
  function volar(desde: HTMLElement | null) {
    const destino = olla.current?.getBoundingClientRect();
    const r = desde?.getBoundingClientRect();
    if (!desde || !destino || !r) return;
    const k = escalaDe(desde);
    const dx = (destino.left + destino.width / 2 - (r.left + r.width / 2)) / k;
    const dy = (destino.top + destino.height * 0.3 - (r.top + r.height / 2)) / k;
    desde.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy - 80}px) scale(0.9) rotate(-12deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.5) rotate(10deg)`, opacity: 0 },
      ],
      { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" },
    );
  }

  function echar(palabra: string, el: HTMLElement | null): boolean {
    if (bloqueado || lista || enOlla.includes(palabra)) return false;
    decirContenido(palabra);
    if (!correctos.includes(palabra)) {
      setRebota(palabra);
      window.setTimeout(() => setRebota(null), 500);
      onRespuesta(palabra, false, false);
      return false;
    }
    volar(el);
    efecto("unir", paso + enOlla.length);
    const n = [...enOlla, palabra];
    window.setTimeout(() => {
      setEnOlla(n);
      setSplash((s) => s + 1);
    }, el ? 480 : 0);
    onRespuesta(palabra, true, n.length >= correctos.length);
    return true;
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-14">
      <div ref={olla} className="relative">
        <Hueco zona="olla" lleno={lista} etiqueta={`Olla con ${enOlla.length} ingredientes`} className={`cocina-olla relative !rounded-full p-2 ${lista ? "olla-lista" : ""}`}>
          <span className="cocina-vapor" aria-hidden="true" style={{ opacity: Math.min(1, enOlla.length * 0.4) }}>
            <span />
            <span />
            <span />
          </span>
          <svg viewBox="0 0 220 170" width="240" height="186" className="overflow-visible" aria-hidden="true">
            <path d="M16 70 H204 V124 C204 150 182 166 156 166 H64 C38 166 16 150 16 124 Z" fill="#8E7CC3" stroke="#2B2440" strokeWidth="5" strokeLinejoin="round" />
            <path d="M2 82 H16 M204 82 H218" stroke="#2B2440" strokeWidth="9" strokeLinecap="round" />
            <ellipse cx="110" cy="70" rx="94" ry="16" fill={enOlla.length ? "#FFB347" : "#B9A8E6"} stroke="#2B2440" strokeWidth="5" />
            <g key={splash} className={splash ? "olla-burbujas" : ""}>
              <circle cx="78" cy="66" r="7" fill="#FFD9A0" />
              <circle cx="124" cy="72" r="5" fill="#FFD9A0" />
              <circle cx="150" cy="64" r="6" fill="#FFD9A0" />
            </g>
          </svg>
          <span className="absolute top-[38%] left-1/2 flex -translate-x-1/2 -space-x-5" aria-hidden="true">
            {enOlla.map((p) => (
              <span key={p} className="olla-flota">
                <Dibujo palabra={p} tamano={46} />
              </span>
            ))}
          </span>
        </Hueco>
      </div>
      <div className="cocina-mesa grid grid-cols-3 gap-3 rounded-[2rem] p-4 sm:gap-4">
        {ingredientes.map((p, i) => {
          const usado = enOlla.includes(p);
          const pista = nivelAyuda >= 2 && correctos.includes(p) && !usado;
          return (
            <div key={p} className={`size-28 sm:size-32 ${usado ? "invisible" : ""} ${rebota === p ? "sacudir" : ""}`}>
              <Pieza
                etiqueta={`Ingrediente ${p.toLowerCase()}`}
                indice={i}
                estado={pista ? "brilla" : "normal"}
                deshabilitada={bloqueado || usado || lista}
                onSoltar={(zona) => zona === "olla" && echar(p, null)}
                onTocar={() => echar(p, document.querySelector<HTMLElement>(`[data-ingrediente="${p}"]`))}
                className="size-full"
              >
                <span data-ingrediente={p} className="grid place-items-center">
                  <Dibujo palabra={p} tamano={84} />
                </span>
              </Pieza>
            </div>
          );
        })}
      </div>
    </div>
  );
}
