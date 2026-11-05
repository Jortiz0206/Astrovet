import { useMemo, useState } from "react";
import Dibujo from "../../componentes/Dibujo";
import { decirContenido } from "../../servicios/audio";
import { Bloque, mezclar, type EstadoBloque, type PropsActividad } from "./comunes";

/**
 * ACT-04 Imagen y palabra: oye una palabra y toca su dibujo.
 * ACT-17 Lee y encuentra usa la misma grilla con la palabra escrita (ver LeeEncuentra).
 */
export default function ImagenPalabra({ ronda, nivelAyuda, bloqueado, onRespuesta }: PropsActividad) {
  const opciones = useMemo(() => mezclar(ronda.opciones), [ronda]);
  return <GrillaDibujos opciones={opciones} respuesta={ronda.respuesta} nivelAyuda={nivelAyuda} bloqueado={bloqueado} onRespuesta={onRespuesta} />;
}

export function GrillaDibujos({
  opciones,
  respuesta,
  nivelAyuda,
  bloqueado,
  onRespuesta,
  decirAlTocar = true,
}: {
  opciones: string[];
  respuesta: string;
  nivelAyuda: number;
  bloqueado: boolean;
  onRespuesta: PropsActividad["onRespuesta"];
  decirAlTocar?: boolean;
}) {
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const [acierto, setAcierto] = useState(false);

  function tocar(op: string) {
    if (bloqueado || acierto) return;
    if (decirAlTocar || op === respuesta) decirContenido(op);
    const ok = op === respuesta;
    if (ok) setAcierto(true);
    else setDescartadas((d) => [...d, op]);
    onRespuesta(op, ok, ok);
  }

  function estado(op: string): EstadoBloque {
    if (acierto && op === respuesta) return "correcto";
    if (descartadas.includes(op)) return "descartado";
    if (nivelAyuda >= 2 && op === respuesta) return "brilla";
    return "normal";
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {opciones.map((op, i) => (
        <Bloque
          key={op}
          indice={i}
          estado={estado(op)}
          disabled={descartadas.includes(op)}
          onClick={() => tocar(op)}
          etiqueta={`Dibujo de ${op.toLowerCase()}`}
          className="h-44 w-38 flex-col gap-1 sm:h-52 sm:w-46"
        >
          <Dibujo palabra={op} tamano={112} />
          <span className={`font-lectura text-xl font-bold tracking-wide transition-opacity duration-300 ${acierto && op === respuesta ? "opacity-100" : "opacity-0"}`}>{op}</span>
        </Bloque>
      ))}
    </div>
  );
}
