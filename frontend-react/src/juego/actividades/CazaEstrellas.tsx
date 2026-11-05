import { useMemo, useState } from "react";
import { decirContenido } from "../../servicios/audio";
import { Destello, entrada, mezclar, type PropsActividad } from "./comunes";

/** ACT-03 Caza de estrellas: toca todas las estrellas que tienen la letra pedida. */
export default function CazaEstrellas({ ronda, nivelAyuda, bloqueado, onRespuesta }: PropsActividad) {
  const estrellas = useMemo(() => mezclar(ronda.opciones.map((letra, i) => ({ letra, i }))), [ronda]);
  const total = ronda.opciones.filter((l) => l === ronda.respuesta).length;
  const [encontradas, setEncontradas] = useState<number[]>([]);
  const [sacudida, setSacudida] = useState<number | null>(null);

  function tocar(letra: string, i: number) {
    if (bloqueado || encontradas.includes(i)) return;
    decirContenido(letra);
    const ok = letra === ronda.respuesta;
    if (ok) {
      const nuevas = [...encontradas, i];
      setEncontradas(nuevas);
      onRespuesta(letra, true, nuevas.length === total);
    } else {
      setSacudida(i);
      window.setTimeout(() => setSacudida(null), 500);
      onRespuesta(letra, false, false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="grid grid-cols-3 gap-4 sm:gap-7">
        {estrellas.map(({ letra, i }, pos) => {
          const hallada = encontradas.includes(i);
          const brilla = !hallada && nivelAyuda >= 2 && letra === ronda.respuesta;
          return (
            <button
              key={i}
              type="button"
              onClick={() => tocar(letra, i)}
              aria-label={hallada ? `Estrella ${letra}, encontrada` : `Estrella con la letra ${letra}`}
              className={`entrar-bloque relative grid size-24 place-items-center sm:size-32 ${sacudida === i ? "animate-vaiven" : ""}`}
              style={entrada(pos)}
            >
              <span className={`absolute inset-0 ${hallada ? "estrella-hallada" : "animate-flotar"}`} style={{ animationDelay: `${pos * 0.7}s` }}>
                <svg viewBox="0 0 100 100" className="size-full drop-shadow-[0_6px_10px_rgb(0_0_0/0.35)]" aria-hidden="true">
                  <path
                    d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z"
                    fill={hallada ? "#FFD166" : brilla ? "#FFF3D1" : "#FFFFFF"}
                    stroke={hallada ? "#E0A82E" : brilla ? "#FFD166" : "var(--borde-bloque, #DDD5F3)"}
                    strokeWidth={brilla ? 7 : 5}
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="relative mt-2 font-lectura text-4xl font-bold text-tinta sm:text-5xl">{letra}</span>
              {hallada ? <Destello /> : null}
            </button>
          );
        })}
      </div>
      <p className="flex gap-1.5" aria-label={`${encontradas.length} de ${total} estrellas encontradas`}>
        {Array.from({ length: total }, (_, k) => (
          <span key={k} className={`size-4 rounded-full transition-colors duration-300 ${k < encontradas.length ? "bg-dorado" : "bg-white/25"}`} />
        ))}
      </p>
    </div>
  );
}
