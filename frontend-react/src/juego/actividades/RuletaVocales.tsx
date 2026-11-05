import { useEffect, useRef, useState } from "react";
import Icono from "../../componentes/Icono";
import { decirContenido, hablar, efecto } from "../../servicios/audio";
import { Destello, type PropsActividad } from "./comunes";

/** ACT-11 Ruleta de vocales: la consonante queda fija y el niño gira la vocal hasta oír la sílaba. */
export default function RuletaVocales({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const vocales = ronda.opciones;
  const base = ronda.base ?? "";
  const objetivo = vocales.indexOf(ronda.respuesta);
  const [indice, setIndice] = useState(() => (objetivo === 0 ? 1 : 0));
  const [vueltas, setVueltas] = useState(0);
  const [acierto, setAcierto] = useState(false);
  const [sacudir, setSacudir] = useState(false);
  const inicioY = useRef<number | null>(null);
  const actual = vocales[indice];

  // Ayuda 3 (hacerlo con Misi): la ruleta se acomoda sola en la vocal correcta.
  useEffect(() => {
    if (nivelAyuda >= 3 && !acierto && indice !== objetivo) {
      const t = window.setTimeout(() => {
        setIndice(objetivo);
        setVueltas((v) => v + 1);
        hablar({ c: base + vocales[objetivo] }, { interrumpir: false });
      }, 900);
      return () => window.clearTimeout(t);
    }
  }, [nivelAyuda, acierto, indice, objetivo, base, vocales]);

  function girar(dir = 1) {
    if (bloqueado || acierto) return;
    const n = (indice + dir + vocales.length) % vocales.length;
    setIndice(n);
    setVueltas((v) => v + dir);
    efecto("girar");
    decirContenido(base + vocales[n]);
  }

  function elegir() {
    if (bloqueado || acierto) return;
    const ok = indice === objetivo;
    decirContenido(base + actual);
    if (ok) setAcierto(true);
    else {
      setSacudir(true);
      window.setTimeout(() => setSacudir(false), 500);
    }
    onRespuesta(base + actual, ok, ok);
    if (ok) efecto("unir", paso);
  }

  const anterior = vocales[(indice - 1 + vocales.length) % vocales.length];
  const siguiente = vocales[(indice + 1) % vocales.length];

  return (
    <div className="flex flex-col items-center gap-8">
      <div className={`flex items-stretch gap-1 ${sacudir ? "animate-vaiven" : ""}`}>
        <span className="bloque bloque-fijo entrar-bloque grid w-28 place-items-center rounded-l-[1.75rem] rounded-r-lg sm:w-36">
          <span className="font-lectura text-7xl font-bold sm:text-8xl">{base}</span>
        </span>
        <button
          type="button"
          onClick={() => girar(1)}
          onPointerDown={(e) => (inicioY.current = e.clientY)}
          onPointerUp={(e) => {
            if (inicioY.current !== null && Math.abs(e.clientY - inicioY.current) > 24) girar(e.clientY < inicioY.current ? 1 : -1);
            inicioY.current = null;
          }}
          aria-label={`Ruleta: ${base}${actual}. Toca para girar`}
          className={`ruleta bloque entrar-bloque relative h-48 w-28 touch-none overflow-hidden rounded-l-lg rounded-r-[1.75rem] sm:h-56 sm:w-36 ${acierto ? "bloque-correcto" : nivelAyuda >= 2 && indice === objetivo ? "bloque-brilla" : "bloque-normal"}`}
          style={{ animationDelay: "60ms" }}
        >
          <span key={vueltas} className="ruleta-tambor absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-lectura text-4xl font-bold text-tinta/25 sm:text-5xl">{anterior}</span>
            <span className="font-lectura text-7xl leading-none font-bold text-tinta sm:text-8xl">{actual}</span>
            <span className="font-lectura text-4xl font-bold text-tinta/25 sm:text-5xl">{siguiente}</span>
          </span>
          {acierto ? <Destello /> : null}
        </button>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => girar(1)}
          disabled={acierto}
          className="boton-juego-secundario grid size-18 place-items-center rounded-full"
          aria-label="Girar la ruleta"
        >
          <Icono nombre="girar" tamano={34} />
        </button>
        <button type="button" onClick={elegir} disabled={acierto} className="boton-juego flex min-h-18 items-center gap-2 rounded-full px-8 text-2xl font-black">
          <Icono nombre="check" tamano={30} />
          ¡Es esta!
        </button>
      </div>
    </div>
  );
}
