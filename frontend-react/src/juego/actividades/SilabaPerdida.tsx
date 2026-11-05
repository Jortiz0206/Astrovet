import { useMemo, useState } from "react";
import Dibujo from "../../componentes/Dibujo";
import Icono from "../../componentes/Icono";
import { decirContenido, efecto, hablar } from "../../servicios/audio";
import { Destello, Hueco, Pieza, mezclar, type EstadoBloque, type PropsActividad } from "./comunes";

/** ACT-13 Sílaba perdida: completa la palabra con la sílaba que falta. */
export default function SilabaPerdida({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const partes = ronda.partes ?? [];
  const hueco = ronda.hueco ?? 0;
  const opciones = useMemo(() => mezclar(ronda.opciones), [ronda]);
  const [colocada, setColocada] = useState<string | null>(null);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const acierto = colocada === ronda.respuesta;

  function colocar(s: string): boolean {
    if (bloqueado || acierto || colocada) return false;
    setColocada(s);
    efecto("unir", paso);
    const ok = s === ronda.respuesta;
    onRespuesta(s, ok, ok);
    if (ok) hablar([{ c: s }, { c: ronda.objetivo }]);
    else {
      decirContenido(s);
      window.setTimeout(() => {
        setColocada(null);
        setDescartadas((d) => [...d, s]);
      }, 1100);
    }
    return true;
  }

  function estado(s: string): EstadoBloque {
    if (descartadas.includes(s)) return "descartado";
    if (nivelAyuda >= 2 && s === ronda.respuesta) return "brilla";
    return "normal";
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => decirContenido(ronda.objetivo)}
        aria-label="Escuchar la palabra"
        className="tarjeta-dibujo entrar-bloque relative grid size-36 place-items-center rounded-[2rem] sm:size-40"
      >
        <Dibujo palabra={ronda.objetivo} tamano={108} />
        <span className="absolute -right-2 -bottom-2 grid size-12 place-items-center rounded-full bg-white text-lavanda-oscuro shadow-md">
          <Icono nombre="altavoz" tamano={24} />
        </span>
      </button>

      <div className={`relative flex gap-2 rounded-[2rem] p-2 transition-colors duration-300 ${acierto ? "silaba-unida" : ""}`}>
        {partes.map((p, i) =>
          i === hueco ? (
            <Hueco key={i} zona="hueco" lleno={colocada !== null} etiqueta={colocada ?? "Sílaba que falta"} className={`h-28 w-28 sm:h-32 sm:w-36 ${colocada && !acierto ? "animate-vaiven" : ""}`}>
              {colocada ? <span className="pieza-encaja font-lectura text-5xl font-bold text-tinta sm:text-6xl">{colocada}</span> : null}
            </Hueco>
          ) : (
            <span key={i} className="bloque bloque-fijo grid h-28 w-28 place-items-center rounded-[1.5rem] sm:h-32 sm:w-36">
              <span className="font-lectura text-5xl font-bold sm:text-6xl">{p}</span>
            </span>
          ),
        )}
        {acierto ? <Destello /> : null}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {opciones.map((s, i) =>
          colocada === s ? (
            <span key={s} className="hueco-fantasma h-24 w-24 rounded-[1.5rem] sm:h-28 sm:w-28" />
          ) : (
            <Pieza
              key={s}
              indice={i + 2}
              etiqueta={`Sílaba ${s}`}
              estado={estado(s)}
              deshabilitada={descartadas.includes(s) || acierto}
              onSoltar={(zona) => zona === "hueco" && colocar(s)}
              onTocar={() => colocar(s)}
              className="h-24 w-24 sm:h-28 sm:w-28"
            >
              <span className="font-lectura text-5xl font-bold sm:text-6xl">{s}</span>
            </Pieza>
          ),
        )}
      </div>
    </div>
  );
}
