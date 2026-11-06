import { useEffect, useMemo, useRef, useState } from "react";
import { GUION } from "../../datos/guion";
import { alAzar, decirContenido, efecto, hablar } from "../../servicios/audio";
import { mezclar, type PropsActividad } from "./comunes";

type Fase = "llega" | "espera" | "atrapa";

/**
 * Carrera del cohete: llegan filas de tres estrellas y se detienen frente al
 * cohete. El niño toca la que suena como el objetivo y el cohete vuela a su
 * carril para atraparla. Nadie corre: cada fila espera lo que haga falta.
 */
export default function CarreraCohete({ ronda, nivelAyuda, bloqueado, paso, onRespuesta, onObjetivo }: PropsActividad) {
  const filas = useMemo(() => (ronda.filas ?? []).map((f) => mezclar(f)), [ronda]);
  const [fila, setFila] = useState(0);
  const [fase, setFase] = useState<Fase>("llega");
  const [carril, setCarril] = useState(1);
  const [apagada, setApagada] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const terminada = fila >= filas.length;

  useEffect(() => {
    onObjetivo?.(ronda.respuesta);
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, [ronda, onObjetivo]);

  useEffect(() => {
    if (terminada) return;
    setFase("llega");
    const t = window.setTimeout(() => setFase("espera"), 900);
    timers.current.push(t);
    if (fila > 0) hablar([alAzar(GUION.ahora), { c: ronda.respuesta }], { interrumpir: false });
  }, [fila, terminada, ronda]);

  function elegir(i: number) {
    if (bloqueado || fase !== "espera" || terminada) return;
    const valor = filas[fila][i];
    setCarril(i);
    decirContenido(valor);
    if (valor !== ronda.respuesta) {
      setApagada(i);
      timers.current.push(window.setTimeout(() => setApagada(null), 600));
      onRespuesta(valor, false, false);
      return;
    }
    setFase("atrapa");
    efecto("paso", paso + fila);
    const n = fila + 1;
    onRespuesta(valor, true, n >= filas.length);
    timers.current.push(window.setTimeout(() => setFila(n), 650));
  }

  const actual = filas[Math.min(fila, filas.length - 1)] ?? [];
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="carrera-escena relative h-[24rem] w-full max-w-xl overflow-hidden rounded-[2rem]">
        <span className="carrera-estrellas" aria-hidden="true" />
        <div className="absolute inset-0 grid grid-cols-3">
          {[0, 1, 2].map((c) => (
            <span key={c} className={`carrera-carril ${c === 1 ? "border-x-2 border-dashed border-white/10" : ""}`} aria-hidden="true" />
          ))}
        </div>
        {!terminada ? (
          <div key={fila} className={`carrera-fila absolute inset-x-0 top-0 grid grid-cols-3 ${fase === "llega" ? "carrera-fila-llega" : ""}`}>
            {actual.map((valor, i) => {
              const atrapada = fase === "atrapa" && valor === ronda.respuesta;
              const pista = nivelAyuda >= 2 && valor === ronda.respuesta && fase === "espera";
              return (
                <button
                  key={valor + i}
                  type="button"
                  onClick={() => elegir(i)}
                  disabled={bloqueado || fase !== "espera"}
                  aria-label={`Estrella ${valor}`}
                  className={`carrera-estrella mx-auto mt-14 grid size-28 place-items-center ${atrapada ? "estrella-atrapada" : ""} ${apagada === i ? "estrella-apagada" : ""} ${pista ? "planeta-pista" : ""} ${fase === "atrapa" && !atrapada ? "opacity-30" : ""}`}
                >
                  <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
                    <path d="M50 4 L62 36 L96 38 L69 59 L79 93 L50 73 L21 93 L31 59 L4 38 L38 36 Z" fill="#FFD166" stroke="#2B2440" strokeWidth="4.5" strokeLinejoin="round" />
                  </svg>
                  <span className={`relative mt-3 font-lectura font-bold text-tinta drop-shadow-[0_1px_0_white] ${valor.length > 2 ? "text-2xl" : "text-4xl"}`}>{valor.toLowerCase()}</span>
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="carrera-cohete absolute bottom-4 w-1/3" style={{ transform: `translateX(${carril * 100}%)` }} aria-hidden="true">
          <svg viewBox="0 0 80 120" className="mx-auto h-28 overflow-visible">
            <path className="carrera-fuego" d="M28 96 Q40 128 52 96 Z" fill="#FFB7B2" />
            <path d="M24 70 L8 96 L28 90 Z M56 70 L72 96 L52 90 Z" fill="#B9A8E6" stroke="#2B2440" strokeWidth="4" strokeLinejoin="round" />
            <path d="M40 4 Q66 34 60 92 H20 Q14 34 40 4 Z" fill="#F4F1FB" stroke="#2B2440" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="40" cy="46" r="11" fill="#9FD3F2" stroke="#2B2440" strokeWidth="4" />
          </svg>
        </div>
      </div>
      <div className="flex gap-2" aria-label={`${Math.min(fila, filas.length)} de ${filas.length} estrellas`}>
        {filas.map((_, i) => (
          <span key={i} className={`h-3 w-10 rounded-full transition-[background-color] duration-300 ${i < fila ? "bg-dorado" : "bg-white/20"}`} />
        ))}
      </div>
    </div>
  );
}
