import { useMemo, useState } from "react";
import { Grupo } from "../../componentes/Criatura";
import Dibujo from "../../componentes/Dibujo";
import { decirContenido, efecto } from "../../servicios/audio";
import { Hueco, Pieza, mezclar, type EstadoBloque, type PropsActividad } from "./comunes";

/** Regalo para el animal: arrastra hasta el animal el dibujo que empieza con el sonido pedido. */
export default function Regalo({ ronda, nivelAyuda, bloqueado, paso, onRespuesta, animal = ["pato"] }: PropsActividad) {
  const opciones = useMemo(() => mezclar(ronda.opciones), [ronda]);
  const [entregado, setEntregado] = useState(false);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const [niega, setNiega] = useState(0);

  function dar(p: string): boolean {
    if (bloqueado || entregado) return false;
    decirContenido(p);
    const ok = p === ronda.respuesta;
    if (ok) {
      setEntregado(true);
      efecto("unir", paso);
    } else {
      setNiega((n) => n + 1);
      setDescartadas((d) => [...d, p]);
    }
    onRespuesta(p, ok, ok);
    return ok;
  }

  function estado(p: string): EstadoBloque {
    if (descartadas.includes(p)) return "descartado";
    if (nivelAyuda >= 2 && p === ronda.respuesta) return "brilla";
    return "normal";
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <Hueco zona="animal" lleno={false} etiqueta="El animal" onClick={undefined} className="receptor relative grid size-56 place-items-center rounded-full sm:size-64">
        <span key={niega} className={`pointer-events-none ${entregado ? "animal-feliz" : niega ? "animal-duda" : "animal-respira"}`}>
          <Grupo claves={animal.slice(0, 1)} tamano={170} />
        </span>
        {entregado ? (
          <span className="regalo-recibido pointer-events-none absolute -top-2 -right-2">
            <Dibujo palabra={ronda.respuesta} tamano={84} />
          </span>
        ) : null}
        {entregado ? (
          <span className="corazones pointer-events-none absolute inset-0" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ "--i": i } as React.CSSProperties} />
            ))}
          </span>
        ) : null}
      </Hueco>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {opciones.map((p, i) =>
          entregado && p === ronda.respuesta ? (
            <span key={p} className="h-36 w-32 sm:h-40 sm:w-36" />
          ) : (
            <Pieza
              key={p}
              indice={i + 1}
              etiqueta={`Dibujo de ${p.toLowerCase()}`}
              estado={estado(p)}
              deshabilitada={descartadas.includes(p) || entregado}
              onSoltar={(zona) => zona === "animal" && dar(p)}
              onTocar={() => dar(p)}
              className="h-36 w-32 flex-col sm:h-40 sm:w-36"
            >
              <Dibujo palabra={p} tamano={96} />
            </Pieza>
          ),
        )}
      </div>
    </div>
  );
}
