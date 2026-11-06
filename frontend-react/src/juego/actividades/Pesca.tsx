import { useEffect, useRef, useState, type CSSProperties } from "react";
import { decirContenido, efecto } from "../../servicios/audio";
import { escalaDe, movimientoReducido, type PropsActividad } from "./comunes";

const TONOS = ["#FFB7B2", "#FFD166", "#B9A8E6", "#8FD9B6", "#9FD3F2"];

interface Pez {
  id: number;
  valor: string;
  carril: number; // 0..2 (profundidad)
  haciaDerecha: boolean;
  duracion: number;
  tono: string;
  estado: "nada" | "pescado" | "no";
}

function Cuerpo({ tono }: { tono: string }) {
  return (
    <svg viewBox="0 0 140 90" className="size-full overflow-visible" aria-hidden="true">
      <path d="M112 45 L138 20 L134 45 L138 70 Z" fill={tono} stroke="#2B2440" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="62" cy="45" rx="56" ry="36" fill={tono} stroke="#2B2440" strokeWidth="4" />
      <path d="M56 12 Q72 0 86 14" fill={tono} stroke="#2B2440" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="24" cy="38" r="6" fill="#2B2440" />
      <circle cx="22" cy="36" r="2" fill="#fff" />
    </svg>
  );
}

/**
 * Pesca: los peces nadan con un sonido cada uno; al tocar el que suena como el
 * objetivo, el anzuelo lo sube a la cubeta. Los demás solo se escapan.
 */
export default function Pesca({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const meta = ronda.meta ?? 3;
  const estatico = useRef(movimientoReducido()).current;
  const [peces, setPeces] = useState<Pez[]>([]);
  const [cubeta, setCubeta] = useState(0);
  const [linea, setLinea] = useState<{ x: number; y: number; id: number } | null>(null);
  const escena = useRef<HTMLDivElement>(null);
  const sigId = useRef(0);
  const sinObjetivo = useRef(0);
  const terminado = cubeta >= meta;

  function nuevo(carril?: number): Pez {
    const esObjetivo = sinObjetivo.current >= 1 || Math.random() < 0.5;
    sinObjetivo.current = esObjetivo ? 0 : sinObjetivo.current + 1;
    const otros = ronda.opciones.filter((o) => o !== ronda.respuesta);
    const c = carril ?? sigId.current % 3;
    return {
      id: sigId.current++,
      valor: esObjetivo ? ronda.respuesta : otros[Math.floor(Math.random() * otros.length)],
      carril: c,
      haciaDerecha: c % 2 === 0,
      duracion: 9 + Math.random() * 3,
      tono: TONOS[Math.floor(Math.random() * TONOS.length)],
      estado: "nada",
    };
  }

  useEffect(() => {
    if (estatico) {
      setPeces([0, 1, 2, 0, 1].map((c) => nuevo(c)));
      return;
    }
    setPeces([nuevo(0), nuevo(1)]);
    const t = window.setInterval(() => {
      setPeces((p) => (p.filter((x) => x.estado === "nada").length >= 5 ? p : [...p, nuevo()]));
    }, 1900);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ronda]);

  function tocar(p: Pez, el: HTMLElement) {
    if (bloqueado || terminado || p.estado !== "nada") return;
    decirContenido(p.valor);
    if (p.valor !== ronda.respuesta) {
      setPeces((l) => l.map((x) => (x.id === p.id ? { ...x, estado: "no" } : x)));
      window.setTimeout(() => setPeces((l) => l.map((x) => (x.id === p.id ? { ...x, estado: "nada" } : x))), 700);
      onRespuesta(p.valor, false, false);
      return;
    }
    // Congela al pez donde está y lo sube con el anzuelo.
    const caja = escena.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const k = escalaDe(el);
    if (caja) setLinea({ x: (r.left + r.width / 2 - caja.left) / k, y: (r.top - caja.top) / k + 10, id: p.id });
    const m = getComputedStyle(el).transform;
    el.style.transform = m === "none" ? "" : m;
    el.style.animation = "none";
    requestAnimationFrame(() => {
      el.style.transition = "transform 650ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms ease";
      el.style.transform = `${m === "none" ? "" : m} translateY(-${(r.top - (caja?.top ?? 0)) / k + 60}px)`;
      el.style.opacity = "0";
    });
    efecto("paso", paso + cubeta);
    const n = cubeta + 1;
    setCubeta(n);
    setPeces((l) => l.map((x) => (x.id === p.id ? { ...x, estado: "pescado" } : x)));
    window.setTimeout(() => {
      setLinea(null);
      setPeces((l) => (estatico ? l.map((x) => (x.id === p.id ? nuevo(p.carril) : x)) : l.filter((x) => x.id !== p.id)));
    }, 700);
    onRespuesta(p.valor, true, n >= meta);
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div ref={escena} className="pesca-escena relative h-[23rem] w-full max-w-4xl overflow-hidden rounded-[2rem]">
        <span className="pesca-ola" aria-hidden="true" />
        <div className="pesca-barca absolute top-2 left-1/2 -translate-x-1/2" aria-hidden="true">
          <svg viewBox="0 0 160 60" width="160" height="60">
            <path d="M8 22 H152 L130 54 H30 Z" fill="#B9A8E6" stroke="#2B2440" strokeWidth="4" strokeLinejoin="round" />
            <path d="M80 22 V2" stroke="#2B2440" strokeWidth="4" />
          </svg>
        </div>
        {linea ? (
          <span className="pesca-linea absolute top-12 w-0.5 origin-top bg-white" style={{ left: linea.x, height: Math.max(0, linea.y - 48) }} aria-hidden="true" />
        ) : null}
        {peces.map((p, i) => {
          const pista = nivelAyuda >= 2 && p.valor === ronda.respuesta && p.estado === "nada";
          return (
            <button
              key={p.id}
              type="button"
              onClick={(e) => tocar(p, e.currentTarget)}
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget) setPeces((l) => l.filter((x) => x.id !== p.id));
              }}
              disabled={p.estado !== "nada" || bloqueado || terminado}
              aria-label={`Pez ${p.valor}`}
              className={`pez absolute h-[5.6rem] w-[8.75rem] ${estatico ? "" : p.haciaDerecha ? "pez-derecha" : "pez-izquierda"} ${p.estado === "no" ? "pez-no" : ""} ${pista ? "pez-pista" : ""}`}
              style={
                {
                  top: `${33 + p.carril * 21}%`,
                  left: estatico ? `${6 + (i % 5) * 19}%` : undefined,
                  "--dur": `${p.duracion}s`,
                } as CSSProperties
              }
            >
              <span className={`pez-cuerpo block size-full ${p.haciaDerecha && !estatico ? "-scale-x-100" : ""}`}>
                <Cuerpo tono={p.tono} />
              </span>
              <span className="absolute inset-y-0 left-[18%] grid w-[55%] place-items-center font-lectura text-4xl font-bold text-tinta">{p.valor.toLowerCase()}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3" aria-label={`${cubeta} de ${meta} peces`}>
        {Array.from({ length: meta }, (_, i) => (
          <span key={i} className={`grid size-12 place-items-center rounded-full ring-2 ${i < cubeta ? "bg-dorado ring-dorado" : "bg-white/10 ring-white/25"}`} aria-hidden="true">
            {i < cubeta ? (
              <svg viewBox="0 0 140 90" width="34" height="22">
                <ellipse cx="62" cy="45" rx="56" ry="36" fill="#fff" stroke="#2B2440" strokeWidth="8" />
              </svg>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
