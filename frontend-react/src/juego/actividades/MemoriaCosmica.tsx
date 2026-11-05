import { useMemo, useRef, useState } from "react";
import Dibujo from "../../componentes/Dibujo";
import { decirContenido, efecto } from "../../servicios/audio";
import { Destello, entrada, mezclar, tamanoTexto, type PropsActividad } from "./comunes";

interface Carta {
  id: number;
  par: number;
  valor: string;
  tipo: "texto" | "imagen";
}

/** ACT-05 Memoria cósmica: une cada letra, sílaba o palabra con su dibujo. */
export default function MemoriaCosmica({ ronda, nivelAyuda, bloqueado, onRespuesta }: PropsActividad) {
  const cartas = useMemo<Carta[]>(
    () =>
      mezclar(
        (ronda.pares ?? []).flatMap(([texto, palabra], par) => [
          { id: par * 2, par, valor: texto, tipo: "texto" as const },
          { id: par * 2 + 1, par, valor: palabra, tipo: "imagen" as const },
        ]),
      ),
    [ronda],
  );
  const [abiertas, setAbiertas] = useState<number[]>([]);
  const [hechas, setHechas] = useState<number[]>([]);
  const esperando = useRef(false);
  const totalPares = ronda.pares?.length ?? 0;

  function tocar(c: Carta) {
    if (bloqueado || esperando.current || hechas.includes(c.par) || abiertas.includes(c.id)) return;
    efecto("voltear");
    decirContenido(c.valor);
    const nuevas = [...abiertas, c.id];
    setAbiertas(nuevas);
    if (nuevas.length < 2) return;

    const [a, b] = nuevas.map((id) => cartas.find((x) => x.id === id)!);
    const ok = a.par === b.par;
    const texto = a.tipo === "texto" ? a.valor : b.valor;
    if (ok) {
      const pares = [...hechas, a.par];
      setHechas(pares);
      setAbiertas([]);
      onRespuesta(texto, true, pares.length === totalPares);
    } else {
      esperando.current = true;
      onRespuesta(`${a.valor}+${b.valor}`, false, false);
      window.setTimeout(() => {
        setAbiertas([]);
        esperando.current = false;
      }, 1200);
    }
  }

  // Ayuda: con una carta abierta brilla su pareja; si no, la letra de un par pendiente.
  const abierta = abiertas.length === 1 ? cartas.find((x) => x.id === abiertas[0]) : undefined;
  const parPendiente = cartas.find((x) => !hechas.includes(x.par))?.par;
  function brilla(c: Carta): boolean {
    if (nivelAyuda < 2 || hechas.includes(c.par) || abiertas.includes(c.id)) return false;
    if (abierta) return c.par === abierta.par;
    return c.par === parPendiente && c.tipo === "texto";
  }

  const columnas = cartas.length > 6 ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className={`grid ${columnas} gap-3 sm:gap-5`}>
      {cartas.map((c, i) => {
        const visible = abiertas.includes(c.id) || hechas.includes(c.par);
        const hecha = hechas.includes(c.par);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => tocar(c)}
            style={entrada(i)}
            aria-label={visible ? (c.tipo === "texto" ? c.valor : `Dibujo de ${c.valor.toLowerCase()}`) : "Tarjeta boca abajo"}
            className={`carta entrar-bloque relative size-24 sm:size-32 ${visible ? "carta-abierta" : ""} ${brilla(c) ? "carta-pista" : ""}`}
          >
            <span className="carta-cara carta-dorso" aria-hidden="true">
              <svg viewBox="0 0 40 40" className="size-10 opacity-80">
                <circle cx="20" cy="20" r="9" fill="#FFB7B2" />
                <ellipse cx="20" cy="20" rx="17" ry="5" fill="none" stroke="#FFD166" strokeWidth="2.5" transform="rotate(-18 20 20)" />
              </svg>
            </span>
            <span className={`carta-cara carta-frente ${hecha ? "carta-hecha" : ""}`}>
              {c.tipo === "texto" ? <span className={`font-lectura font-bold text-tinta ${tamanoTexto(c.valor)}`}>{c.valor}</span> : <Dibujo palabra={c.valor} tamano={84} />}
            </span>
            {hecha ? <Destello /> : null}
          </button>
        );
      })}
    </div>
  );
}
