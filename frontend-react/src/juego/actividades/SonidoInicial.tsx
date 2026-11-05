import { useMemo, useState } from "react";
import Dibujo from "../../componentes/Dibujo";
import Icono from "../../componentes/Icono";
import { decirContenido } from "../../servicios/audio";
import { Bloque, mezclar, type EstadoBloque, type PropsActividad } from "./comunes";

/** ACT-02 Sonido inicial: ve una imagen, oye su nombre y elige la letra con que empieza. */
export default function SonidoInicial({ ronda, nivelAyuda, bloqueado, onRespuesta }: PropsActividad) {
  const opciones = useMemo(() => mezclar(ronda.opciones), [ronda]);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const [acierto, setAcierto] = useState(false);

  function tocar(op: string) {
    if (bloqueado || acierto) return;
    decirContenido(op);
    const ok = op === ronda.respuesta;
    if (ok) setAcierto(true);
    else setDescartadas((d) => [...d, op]);
    onRespuesta(op, ok, ok);
  }

  function estado(op: string): EstadoBloque {
    if (acierto && op === ronda.respuesta) return "correcto";
    if (descartadas.includes(op)) return "descartado";
    if (nivelAyuda >= 2 && op === ronda.respuesta) return "brilla";
    return "normal";
  }

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-12">
      <button
        type="button"
        onClick={() => decirContenido(ronda.objetivo)}
        aria-label="Escuchar la palabra"
        className="tarjeta-dibujo entrar-bloque relative grid size-48 place-items-center rounded-[2.5rem] sm:size-60"
      >
        <Dibujo palabra={ronda.objetivo} tamano={150} className="sm:scale-110" />
        <span className="absolute -right-3 -bottom-3 grid size-14 place-items-center rounded-full bg-white text-lavanda-oscuro shadow-md">
          <Icono nombre="altavoz" tamano={28} />
        </span>
        <span className={`palabra-revelada absolute -bottom-12 font-lectura text-3xl font-bold tracking-wider text-white ${acierto ? "visible" : ""}`}>
          <span className="text-dorado">{ronda.objetivo[0]}</span>
          {ronda.objetivo.slice(1)}
        </span>
      </button>
      <div className="flex gap-4 sm:flex-col">
        {opciones.map((op, i) => (
          <Bloque key={op} indice={i + 1} estado={estado(op)} disabled={descartadas.includes(op)} onClick={() => tocar(op)} etiqueta={`Letra ${op}`} className="size-24 sm:size-28">
            <span className="font-lectura text-6xl font-bold sm:text-7xl">{op}</span>
          </Bloque>
        ))}
      </div>
    </div>
  );
}
