import { useMemo, useState } from "react";
import { decirContenido, efecto } from "../../servicios/audio";
import { Destello, Hueco, Pieza, mezclar, type EstadoBloque, type PropsActividad } from "./comunes";

/** ACT-10 Une las piezas: arrastra la vocal junto a la consonante; al unirse suena la sílaba. */
export default function UnePiezas({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const opciones = useMemo(() => mezclar(ronda.opciones), [ronda]);
  const base = ronda.base ?? "";
  const [colocada, setColocada] = useState<string | null>(null);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const acierto = colocada === ronda.respuesta;

  function colocar(vocal: string): boolean {
    if (bloqueado || acierto || colocada) return false;
    setColocada(vocal);
    efecto("unir", paso);
    decirContenido(base + vocal);
    const ok = vocal === ronda.respuesta;
    onRespuesta(base + vocal, ok, ok);
    if (!ok) {
      window.setTimeout(() => {
        setColocada(null);
        setDescartadas((d) => [...d, vocal]);
      }, 1100);
    }
    return true;
  }

  function estado(v: string): EstadoBloque {
    if (descartadas.includes(v)) return "descartado";
    if (nivelAyuda >= 2 && v === ronda.respuesta) return "brilla";
    return "normal";
  }

  return (
    <div className="flex flex-col items-center gap-10">
      <div className={`flex items-center rounded-[2rem] p-2 transition-colors duration-300 ${acierto ? "silaba-unida" : ""}`}>
        <span className="bloque bloque-fijo entrar-bloque grid h-32 w-28 place-items-center rounded-l-[1.75rem] rounded-r-lg sm:h-40 sm:w-36">
          <span className="font-lectura text-7xl font-bold sm:text-8xl">{base}</span>
        </span>
        <Hueco
          zona="vocal"
          lleno={colocada !== null}
          etiqueta={colocada ? `${base}${colocada}` : "Espacio para la vocal"}
          className={`relative -ml-1 h-32 w-28 rounded-l-lg rounded-r-[1.75rem] sm:h-40 sm:w-36 ${colocada && !acierto ? "animate-vaiven" : ""}`}
        >
          {colocada ? <span className="pieza-encaja font-lectura text-7xl font-bold text-tinta sm:text-8xl">{colocada}</span> : null}
          {acierto ? <Destello /> : null}
        </Hueco>
      </div>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {opciones.map((v, i) =>
          colocada === v ? (
            <span key={v} className="size-24 sm:size-28" />
          ) : (
            <Pieza
              key={v}
              indice={i + 1}
              etiqueta={`Vocal ${v}`}
              estado={estado(v)}
              deshabilitada={descartadas.includes(v) || acierto}
              onSoltar={(zona) => zona === "vocal" && colocar(v)}
              onTocar={() => colocar(v)}
              className="size-24 sm:size-28"
            >
              <span className="font-lectura text-6xl font-bold sm:text-7xl">{v}</span>
            </Pieza>
          ),
        )}
      </div>
    </div>
  );
}
