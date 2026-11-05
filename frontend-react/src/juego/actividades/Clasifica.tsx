import { useMemo, useState } from "react";
import Dibujo from "../../componentes/Dibujo";
import Planeta from "../../componentes/Planeta";
import { decirContenido, efecto } from "../../servicios/audio";
import { Hueco, Pieza, mezclar, type PropsActividad } from "./comunes";

/** Clasifica: cada dibujo viaja al planeta de su primer sonido (arrastrando o tocando el planeta). */
export default function Clasifica({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const grupos = ronda.grupos ?? ["A", "O"];
  const items = useMemo(() => mezclar(ronda.opciones), [ronda]);
  const [indice, setIndice] = useState(0);
  const [guardados, setGuardados] = useState<Record<string, string[]>>({ [grupos[0]]: [], [grupos[1]]: [] });
  const [rebote, setRebote] = useState<string | null>(null);
  const [sacudir, setSacudir] = useState(0);
  const actual = items[indice];
  const correcto = actual ? (actual.startsWith(grupos[0]) ? grupos[0] : grupos[1]) : "";

  function enviar(grupo: string): boolean {
    if (bloqueado || !actual) return false;
    const ok = grupo === correcto;
    if (!ok) {
      setSacudir((s) => s + 1);
      decirContenido(actual);
      onRespuesta(`${actual}→${grupo}`, false, false);
      return false;
    }
    efecto("unir", paso + indice);
    decirContenido(actual);
    setGuardados((g) => ({ ...g, [grupo]: [...g[grupo], actual] }));
    setRebote(grupo);
    window.setTimeout(() => setRebote(null), 450);
    const n = indice + 1;
    setIndice(n);
    onRespuesta(actual, true, n >= items.length);
    return true;
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        {grupos.map((g, i) => (
          <Hueco
            key={g}
            zona={`grupo-${g}`}
            lleno={false}
            onClick={() => enviar(g)}
            etiqueta={`Planeta de ${g}`}
            className={`planeta-destino relative flex min-h-56 flex-col items-center justify-center gap-2 rounded-[2.25rem] p-3 ${i === 1 ? "order-3" : ""} ${rebote === g ? "planeta-recibe" : ""} ${nivelAyuda >= 2 && g === correcto ? "planeta-pista" : ""}`}
          >
            <Planeta mundo={i === 0 ? 1 : 3} tamano={96} className="pointer-events-none" />
            <span className="pointer-events-none font-lectura text-5xl font-bold text-white">{g}</span>
            <span className="pointer-events-none flex min-h-10 flex-wrap justify-center -space-x-3">
              {guardados[g].map((p) => (
                <span key={p} className="pieza-encaja">
                  <Dibujo palabra={p} tamano={40} />
                </span>
              ))}
            </span>
          </Hueco>
        ))}
        <div className="order-2 grid min-h-56 w-32 place-items-center sm:w-40">
          {actual ? (
            <span key={`${actual}-${sacudir}`} className={sacudir ? "animate-vaiven" : ""}>
              <Pieza
                key={actual}
                etiqueta={`Dibujo de ${actual.toLowerCase()}`}
                onSoltar={(zona) => zona.startsWith("grupo-") && enviar(zona.replace("grupo-", ""))}
                onTocar={() => decirContenido(actual)}
                className="h-36 w-32 flex-col sm:h-40 sm:w-36"
              >
                <Dibujo palabra={actual} tamano={96} />
              </Pieza>
            </span>
          ) : null}
        </div>
      </div>
      <p className="text-center font-bold text-white/80">Arrastra el dibujo o toca su planeta.</p>
    </div>
  );
}
