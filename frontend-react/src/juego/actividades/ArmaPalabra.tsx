import { useMemo, useState } from "react";
import Dibujo from "../../componentes/Dibujo";
import Icono from "../../componentes/Icono";
import { decirContenido, efecto, hablar } from "../../servicios/audio";
import { Destello, Hueco, Pieza, mezclar, type EstadoBloque, type PropsActividad } from "./comunes";

interface Ficha {
  id: number;
  texto: string;
}

/** ACT-12 Arma la palabra: arrastra las sílabas a las casillas en orden. */
export default function ArmaPalabra({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const partes = ronda.partes ?? [];
  const fichas = useMemo<Ficha[]>(() => mezclar(ronda.opciones.map((texto, id) => ({ id, texto }))), [ronda]);
  const [casillas, setCasillas] = useState<(number | null)[]>(() => partes.map(() => null));
  const [revisando, setRevisando] = useState(false);
  const [acierto, setAcierto] = useState(false);
  const [malas, setMalas] = useState<number[]>([]);

  const usadas = new Set(casillas.filter((c): c is number => c !== null));
  const siguienteVacia = casillas.findIndex((c) => c === null);

  function texto(id: number | null) {
    return id === null ? "" : (fichas.find((f) => f.id === id)?.texto ?? "");
  }

  function colocar(ficha: Ficha, posicion = siguienteVacia): boolean {
    if (bloqueado || acierto || revisando || posicion < 0 || casillas[posicion] !== null) return false;
    const nuevas = [...casillas];
    nuevas[posicion] = ficha.id;
    setCasillas(nuevas);
    efecto("unir", paso);
    decirContenido(ficha.texto);
    if (nuevas.every((c) => c !== null)) revisar(nuevas);
    return true;
  }

  function quitar(posicion: number) {
    if (bloqueado || acierto || revisando || casillas[posicion] === null) return;
    efecto("toque");
    setCasillas((c) => c.map((x, i) => (i === posicion ? null : x)));
  }

  function revisar(llenas: (number | null)[]) {
    const armada = llenas.map(texto).join("");
    const ok = llenas.every((id, i) => texto(id) === partes[i]);
    setRevisando(true);
    onRespuesta(armada, ok, ok);
    if (ok) {
      setAcierto(true);
      window.setTimeout(() => hablar({ c: ronda.objetivo }, { interrumpir: false }), 350);
      return;
    }
    // Las sílabas bien puestas se quedan; las demás vuelven a su lugar.
    const fuera = llenas.map((id, i) => (texto(id) === partes[i] ? -1 : i)).filter((i) => i >= 0);
    setMalas(fuera);
    window.setTimeout(() => {
      setCasillas(llenas.map((id, i) => (fuera.includes(i) ? null : id)));
      setMalas([]);
      setRevisando(false);
    }, 1100);
  }

  function estado(f: Ficha): EstadoBloque {
    if (nivelAyuda >= 2 && siguienteVacia >= 0 && f.texto === partes[siguienteVacia]) return "brilla";
    return "normal";
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => decirContenido(ronda.objetivo)}
        aria-label="Escuchar la palabra"
        className="tarjeta-dibujo entrar-bloque relative grid size-36 place-items-center rounded-[2rem] sm:size-40"
      >
        <Dibujo palabra={ronda.objetivo} tamano={108} />
        <span className="absolute -right-2 -bottom-2 grid size-12 place-items-center rounded-full bg-white text-lavanda-oscuro shadow-md">
          <Icono nombre="altavoz" tamano={24} />
        </span>
      </button>

      <div className={`relative flex gap-2 rounded-[2rem] p-2 transition-colors duration-300 ${acierto ? "silaba-unida" : ""}`}>
        {casillas.map((id, i) => (
          <Hueco
            key={i}
            zona={`casilla-${i}`}
            lleno={id !== null}
            etiqueta={id !== null ? `Casilla ${i + 1}: ${texto(id)}. Toca para quitarla` : `Casilla ${i + 1}, vacía`}
            onClick={id !== null ? () => quitar(i) : undefined}
            className={`h-28 w-28 sm:h-32 sm:w-36 ${malas.includes(i) ? "animate-vaiven" : ""}`}
          >
            {id !== null ? <span className="pieza-encaja font-lectura text-5xl font-bold text-tinta sm:text-6xl">{texto(id)}</span> : null}
          </Hueco>
        ))}
        {acierto ? <Destello /> : null}
      </div>

      <div className="flex min-h-28 flex-wrap justify-center gap-4">
        {fichas.map((f, i) =>
          usadas.has(f.id) ? (
            <span key={f.id} className="hueco-fantasma h-24 w-24 rounded-[1.5rem] sm:h-28 sm:w-28" />
          ) : (
            <Pieza
              key={f.id}
              indice={i + 2}
              etiqueta={`Sílaba ${f.texto}`}
              estado={estado(f)}
              deshabilitada={acierto || revisando}
              onSoltar={(zona) => {
                const n = Number(zona.replace("casilla-", ""));
                return Number.isInteger(n) && colocar(f, n);
              }}
              onTocar={() => colocar(f)}
              className="h-24 w-24 sm:h-28 sm:w-28"
            >
              <span className="font-lectura text-5xl font-bold sm:text-6xl">{f.texto}</span>
            </Pieza>
          ),
        )}
      </div>
    </div>
  );
}
