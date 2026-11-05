import { useMemo, useState } from "react";
import { decirContenido } from "../../servicios/audio";
import { Bloque, mezclar, tamanoTexto, type EstadoBloque, type PropsActividad } from "./comunes";

/**
 * ACT-01 Escucha y elige: oye un sonido y toca la letra o sílaba que suena.
 * También sirve para ACT-18 (la intrusa): misma interacción, otra consigna.
 */
export default function EscuchaElige({ ronda, nivelAyuda, bloqueado, onRespuesta }: PropsActividad) {
  const opciones = useMemo(() => mezclar(ronda.opciones), [ronda]);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const [acierto, setAcierto] = useState(false);
  const muchas = opciones.length > 3;

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
    <div className={`grid gap-4 sm:gap-6 ${muchas ? "grid-cols-2 sm:grid-cols-4" : opciones.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {opciones.map((op, i) => (
        <Bloque
          key={op}
          indice={i}
          estado={estado(op)}
          disabled={descartadas.includes(op)}
          onClick={() => tocar(op)}
          etiqueta={op.length === 1 ? `Letra ${op}` : op}
          className={muchas ? "size-28 sm:size-32" : "size-28 sm:size-36"}
        >
          <span className={`font-lectura font-bold ${tamanoTexto(op, true)}`}>{op}</span>
        </Bloque>
      ))}
    </div>
  );
}
