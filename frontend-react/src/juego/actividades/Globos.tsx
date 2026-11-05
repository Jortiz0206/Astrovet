import { useEffect, useRef, useState, type CSSProperties } from "react";
import { decirContenido, efecto } from "../../servicios/audio";
import { Destello, movimientoReducido, tamanoTexto, type PropsActividad } from "./comunes";

const COLORES = [
  { cuerpo: "#FFB7B2", sombra: "#E58C86" },
  { cuerpo: "#B9A8E6", sombra: "#8E7CC3" },
  { cuerpo: "#FFD166", sombra: "#E0A82E" },
  { cuerpo: "#9FD3F2", sombra: "#5FA6D6" },
  { cuerpo: "#8FD9B6", sombra: "#3F9E73" },
];

interface Globo {
  id: number;
  valor: string;
  x: number; // % horizontal
  duracion: number; // s
  color: number;
  estado: "vuela" | "reventado" | "no";
}

/** Globos: los globos suben despacio; el niño revienta los que tienen el sonido pedido. */
export default function Globos({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const meta = ronda.meta ?? 3;
  const estatico = useRef(movimientoReducido()).current;
  const [globos, setGlobos] = useState<Globo[]>([]);
  const [reventados, setReventados] = useState(0);
  const sigId = useRef(0);
  const sinObjetivo = useRef(0);
  const ultimaX = useRef(50);
  const terminado = reventados >= meta;

  function nuevo(): Globo {
    const forzar = sinObjetivo.current >= 2;
    const esObjetivo = forzar || Math.random() < 0.45;
    sinObjetivo.current = esObjetivo ? 0 : sinObjetivo.current + 1;
    const otros = ronda.opciones.filter((o) => o !== ronda.respuesta);
    let x = 10 + Math.random() * 80;
    if (Math.abs(x - ultimaX.current) < 18) x = (x + 40) % 85 + 8;
    ultimaX.current = x;
    return {
      id: sigId.current++,
      valor: esObjetivo ? ronda.respuesta : otros[Math.floor(Math.random() * otros.length)],
      x,
      duracion: 7.5 + Math.random() * 2.5,
      color: Math.floor(Math.random() * COLORES.length),
      estado: "vuela",
    };
  }

  // Sin movimiento: una fila fija de globos que se reponen. Con movimiento: suben en oleadas.
  useEffect(() => {
    if (estatico) {
      setGlobos(
        Array.from({ length: 5 }, (_, i) => {
          const g = nuevo();
          return { ...g, x: 10 + i * 20 };
        }),
      );
      return;
    }
    setGlobos([nuevo(), { ...nuevo(), duracion: 6.5 }]);
    const t = window.setInterval(() => {
      setGlobos((g) => (g.filter((x) => x.estado === "vuela").length >= 6 ? g : [...g, nuevo()]));
    }, 1150);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ronda]);

  function quitar(id: number) {
    setGlobos((g) => g.filter((x) => x.id !== id));
  }

  function tocar(g: Globo) {
    if (bloqueado || terminado || g.estado !== "vuela") return;
    decirContenido(g.valor);
    const ok = g.valor === ronda.respuesta;
    if (ok) {
      efecto("paso", paso + reventados);
      const n = reventados + 1;
      setReventados(n);
      setGlobos((lista) => lista.map((x) => (x.id === g.id ? { ...x, estado: "reventado" } : x)));
      window.setTimeout(() => {
        if (estatico) setGlobos((lista) => lista.map((x) => (x.id === g.id ? { ...nuevo(), x: g.x } : x)));
        else quitar(g.id);
      }, 420);
      onRespuesta(g.valor, true, n >= meta);
    } else {
      setGlobos((lista) => lista.map((x) => (x.id === g.id ? { ...x, estado: "no" } : x)));
      onRespuesta(g.valor, false, false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className={`escenario-globos relative w-full max-w-3xl overflow-hidden ${estatico ? "h-64" : "h-[24rem] sm:h-[26rem]"}`}>
        {globos.map((g) => {
          const c = COLORES[g.color];
          const pista = nivelAyuda >= 2 && g.valor === ronda.respuesta && g.estado === "vuela";
          return (
            <button
              key={g.id}
              type="button"
              aria-label={`Globo ${g.valor}`}
              disabled={g.estado !== "vuela" || terminado}
              onClick={() => tocar(g)}
              onAnimationEnd={(e) => {
                if (e.animationName === "subir-globo") quitar(g.id);
              }}
              className={`globo-aire absolute ${estatico ? "top-6" : "globo-sube"} ${g.estado === "reventado" ? "globo-reventado" : ""} ${g.estado === "no" ? "globo-no" : ""}`}
              style={{ left: `${g.x}%`, "--dur": `${g.duracion}s` } as CSSProperties}
            >
              <span className={`globo-mece block ${pista ? "globo-pista" : ""}`} style={{ animationDelay: `${(g.id % 4) * -0.7}s` }}>
                <svg viewBox="0 0 100 150" className="h-36 w-24 overflow-visible sm:h-40 sm:w-28" aria-hidden="true">
                  <path d="M50 112 C46 124 56 132 50 148" fill="none" stroke="rgb(255 255 255 / 0.7)" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="50" cy="56" rx="44" ry="52" fill={c.cuerpo} stroke="#2B2440" strokeWidth="3.5" />
                  <path d="M44 106 L56 106 L50 116 Z" fill={c.sombra} stroke="#2B2440" strokeWidth="3" strokeLinejoin="round" />
                  <ellipse cx="32" cy="32" rx="9" ry="14" fill="#fff" opacity="0.55" transform="rotate(-24 32 32)" />
                </svg>
                <span className={`absolute inset-x-0 top-[22%] text-center font-lectura font-bold text-tinta ${tamanoTexto(g.valor)}`}>{g.valor}</span>
              </span>
              {g.estado === "reventado" ? <Destello /> : null}
            </button>
          );
        })}
      </div>
      <p className="flex gap-2" aria-label={`${Math.min(reventados, meta)} de ${meta} globos`}>
        {Array.from({ length: meta }, (_, k) => (
          <span key={k} className={`size-5 rounded-full transition-[background-color,transform] duration-300 ${k < reventados ? "scale-110 bg-dorado" : "bg-white/20"}`} />
        ))}
      </p>
    </div>
  );
}
