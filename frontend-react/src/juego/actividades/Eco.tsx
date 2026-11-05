import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icono from "../../componentes/Icono";
import { decirContenido, efecto, hablando, hablar } from "../../servicios/audio";
import { entrada, mezclar, tamanoTexto, type PropsActividad } from "./comunes";

const TONOS = ["#FFB7B2", "#B9A8E6", "#FFD166", "#9FD3F2", "#8FD9B6"];

/**
 * Eco de Misi: Misi dice una secuencia corta (las antenas se encienden en orden)
 * y el niño la repite tocando en el mismo orden. Un error solo vuelve a mostrarla.
 */
export default function Eco({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const secuencia = useMemo(() => ronda.secuencia ?? [], [ronda]);
  const fichas = useMemo(() => mezclar(ronda.opciones), [ronda]);
  const [fase, setFase] = useState<"escucha" | "turno" | "listo">("escucha");
  const [encendida, setEncendida] = useState<string | null>(null);
  const [hechos, setHechos] = useState(0);

  const funcion = useRef(0);

  // La secuencia se dice cuando Misi terminó de hablar (consigna o retroalimentación),
  // y cada antena se enciende justo mientras suena su sílaba.
  const mostrar = useCallback(() => {
    const mia = ++funcion.current;
    setFase("escucha");
    setHechos(0);
    setEncendida(null);
    const vigente = () => mia === funcion.current;
    void (async () => {
      await new Promise((r) => window.setTimeout(r, 500));
      for (let i = 0; i < 60 && hablando() && vigente(); i++) await new Promise((r) => window.setTimeout(r, 150));
      for (const s of secuencia) {
        if (!vigente()) return;
        setEncendida(s);
        await hablar({ c: s }, { interrumpir: false });
        if (!vigente()) return;
        setEncendida(null);
        await new Promise((r) => window.setTimeout(r, 300));
      }
      if (vigente()) setFase("turno");
    })();
  }, [secuencia]);

  useEffect(() => {
    mostrar();
    return () => {
      funcion.current++;
    };
  }, [mostrar]);

  function tocar(f: string) {
    if (bloqueado || fase !== "turno") return;
    decirContenido(f);
    setEncendida(f);
    window.setTimeout(() => setEncendida((e) => (e === f ? null : e)), 350);
    if (f === secuencia[hechos]) {
      efecto("paso", paso + hechos);
      const n = hechos + 1;
      setHechos(n);
      if (n >= secuencia.length) {
        setFase("listo");
        onRespuesta(secuencia.join(" "), true, true);
      }
      return;
    }
    onRespuesta(f, false, false);
    mostrar();
  }

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="flex gap-2" aria-label={`${hechos} de ${secuencia.length}`}>
        {secuencia.map((_, i) => (
          <span key={i} className={`h-3 w-10 rounded-full transition-[background-color] duration-300 ${i < hechos ? "bg-dorado" : "bg-white/20"}`} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-5 sm:gap-8">
        {fichas.map((f, i) => {
          const pista = nivelAyuda >= 2 && fase === "turno" && f === secuencia[hechos];
          return (
            <button
              key={f}
              type="button"
              onClick={() => tocar(f)}
              disabled={fase !== "turno"}
              aria-label={f}
              style={{ ...entrada(i), "--tono": TONOS[i % TONOS.length] } as React.CSSProperties}
              className={`antena entrar-bloque relative grid size-28 place-items-center rounded-full sm:size-32 ${encendida === f ? "antena-encendida" : ""} ${pista ? "antena-pista" : ""}`}
            >
              <span className={`relative font-lectura font-bold text-tinta ${tamanoTexto(f, true)}`}>{f}</span>
            </button>
          );
        })}
      </div>
      <div className="flex min-h-12 items-center gap-3">
        {fase === "escucha" ? (
          <p className="flex items-center gap-2 text-lg font-extrabold text-white">
            <Icono nombre="oreja" tamano={22} />
            Escucha…
          </p>
        ) : fase === "turno" ? (
          <>
            <p className="text-lg font-extrabold text-dorado">¡Tu turno!</p>
            <button type="button" onClick={mostrar} className="boton-juego-secundario flex min-h-12 items-center gap-2 rounded-full px-4 font-bold">
              <Icono nombre="girar" tamano={18} />
              Otra vez
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
