import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Dibujo from "../../componentes/Dibujo";
import { GUION } from "../../datos/guion";
import { alAzar, decirContenido, efecto, hablar } from "../../servicios/audio";
import { Destello, Hueco, Pieza, mezclar, tamanoTexto, type PropsActividad } from "./comunes";

const CUADROS = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];

/** Un cuarto del dibujo: el dibujo al doble de tamaño, desplazado dentro de un marco que recorta. */
function Cuarto({ palabra, cuadro, tamano }: { palabra: string; cuadro: number; tamano: number }) {
  const x = cuadro % 2 === 0 ? 0 : -tamano;
  const y = cuadro < 2 ? 0 : -tamano;
  return (
    <span className="relative block overflow-hidden" style={{ width: tamano, height: tamano }} aria-hidden="true">
      <span className="absolute" style={{ left: x, top: y }}>
        <Dibujo palabra={palabra} tamano={tamano * 2} />
      </span>
    </span>
  );
}

interface FichaPuzzle {
  id: string;
  valor: string;
  /** Cuadro del dibujo que muestra la pieza (-1: pieza de otro rompecabezas). */
  cuadro: number;
  otro: string;
}

/**
 * Rompecabezas: el dibujo está partido en cuatro. Misi dice un sonido y el
 * niño busca la pieza que lo lleva; al completarlo aparece la palabra entera.
 */
export default function Rompecabezas({ ronda, nivelAyuda, bloqueado, paso, onRespuesta, onObjetivo }: PropsActividad) {
  const secuencia = useMemo(() => ronda.secuencia ?? [], [ronda]);
  const fichas = useMemo<FichaPuzzle[]>(() => {
    const reales = secuencia.map((v, i) => ({ id: `r${i}`, valor: v, cuadro: i, otro: "" }));
    const extra = ronda.opciones.filter((o) => !secuencia.includes(o)).map((v, i) => ({ id: `x${i}`, valor: v, cuadro: -1, otro: i % 2 ? "LUNA" : "SOL" }));
    return mezclar([...reales, ...extra]);
  }, [ronda, secuencia]);
  const [colocadas, setColocadas] = useState(0);
  const [sacude, setSacude] = useState<string | null>(null);
  const [usadas, setUsadas] = useState<Set<string>>(new Set());
  const anunciada = useRef(-1);
  const completo = colocadas >= secuencia.length;
  const buscada = secuencia[colocadas];

  useEffect(() => {
    if (completo || anunciada.current === colocadas) return;
    anunciada.current = colocadas;
    onObjetivo?.(buscada);
    // El primer sonido lo dice la consigna; los siguientes, Misi al terminar de celebrar.
    if (colocadas > 0) hablar([alAzar(GUION.ahora), { c: buscada }], { interrumpir: false });
  }, [colocadas, completo, buscada, onObjetivo]);

  function intentar(f: FichaPuzzle): boolean {
    if (bloqueado || completo || usadas.has(f.id)) return false;
    if (f.valor === buscada && f.cuadro === colocadas) {
      decirContenido(f.valor);
      efecto("unir", paso + colocadas);
      setUsadas((u) => new Set(u).add(f.id));
      const n = colocadas + 1;
      setColocadas(n);
      if (n >= secuencia.length) {
        window.setTimeout(() => hablar({ c: ronda.objetivo }, { interrumpir: false }), 300);
        onRespuesta(ronda.objetivo, true, true);
      } else onRespuesta(f.valor, true, false);
      return true;
    }
    decirContenido(f.valor);
    setSacude(f.id);
    window.setTimeout(() => setSacude(null), 450);
    onRespuesta(f.valor, false, false);
    return false;
  }

  const celda = 132;
  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-12">
      <div className={`puzzle-tablero relative grid grid-cols-2 gap-1 rounded-[1.75rem] p-2 ${completo ? "puzzle-completo" : ""}`}>
        {CUADROS.map((_, i) => {
          const puesta = i < colocadas;
          return (
            <Hueco key={i} zona={`celda-${i}`} lleno={puesta} etiqueta={puesta ? "Pieza puesta" : i === colocadas ? "Aquí va la siguiente pieza" : "Espacio vacío"} className={`puzzle-celda rounded-2xl ${i === colocadas && !completo ? "puzzle-siguiente" : ""}`}>
              <span className={`transition-opacity duration-300 ${puesta ? "opacity-100" : "opacity-15 grayscale"}`}>
                <Cuarto palabra={ronda.objetivo} cuadro={i} tamano={celda} />
              </span>
              {puesta ? <span className="pieza-encaja absolute inset-0" aria-hidden="true" /> : null}
            </Hueco>
          );
        })}
        {completo ? <Destello /> : null}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {fichas.map((f, i) => {
          const usada = usadas.has(f.id);
          const pista = nivelAyuda >= 2 && f.valor === buscada && f.cuadro === colocadas;
          return (
            <div key={f.id} className={`size-28 sm:size-32 ${usada ? "invisible" : ""} ${sacude === f.id ? "sacudir" : ""}`} style={{ "--i": i } as CSSProperties}>
              <Pieza
                etiqueta={`Pieza ${f.valor}`}
                indice={i}
                estado={pista ? "brilla" : "normal"}
                deshabilitada={bloqueado || usada || completo}
                onSoltar={(zona) => zona === `celda-${colocadas}` && intentar(f)}
                onTocar={() => intentar(f)}
                className="pieza-puzzle size-full overflow-hidden"
              >
                <span className="absolute inset-0 opacity-35" aria-hidden="true">
                  {f.cuadro >= 0 ? <Cuarto palabra={ronda.objetivo} cuadro={f.cuadro} tamano={128} /> : <Cuarto palabra={f.otro} cuadro={1} tamano={128} />}
                </span>
                <span className={`relative font-lectura font-bold ${tamanoTexto(f.valor)}`}>{f.valor.toLowerCase()}</span>
              </Pieza>
            </div>
          );
        })}
      </div>
    </div>
  );
}
