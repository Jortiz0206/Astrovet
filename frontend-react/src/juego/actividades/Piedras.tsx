import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Grupo } from "../../componentes/Criatura";
import { decirContenido, efecto } from "../../servicios/audio";
import { Destello, entrada, mezclar, tamanoTexto, type PropsActividad } from "./comunes";

/**
 * Piedras del río: el animal cruza saltando. En cada columna hay dos piedras
 * y solo una tiene el sonido pedido; al pisarla, el animal salta hasta ella.
 */
export default function Piedras({ ronda, nivelAyuda, bloqueado, paso, onRespuesta, animal = ["pato"] }: PropsActividad) {
  const columnas = useMemo(() => (ronda.filas ?? []).map((f) => mezclar(f)), [ronda]);
  const [columna, setColumna] = useState(0); // columna que toca pisar
  const [pisadas, setPisadas] = useState<string[]>([]); // claves "col-fila"
  const [hundida, setHundida] = useState<string | null>(null);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const [salto, setSalto] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const escenario = useRef<HTMLDivElement>(null);
  const destino = useRef<string>("orilla-izq");
  const terminado = columna > columnas.length;

  function medir(clave: string) {
    const caja = escenario.current;
    const el = caja?.querySelector<HTMLElement>(`[data-punto="${clave}"]`);
    if (!caja || !el) return;
    const a = caja.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    setPos({ x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 });
  }

  useLayoutEffect(() => {
    medir(destino.current);
    const caja = escenario.current;
    if (!caja) return;
    const ro = new ResizeObserver(() => medir(destino.current));
    ro.observe(caja);
    return () => ro.disconnect();
  }, []);

  function saltarA(clave: string) {
    destino.current = clave;
    setSalto((s) => s + 1);
    medir(clave);
  }

  function pisar(col: number, fila: number, valor: string) {
    const clave = `${col}-${fila}`;
    if (bloqueado || terminado || col !== columna || descartadas.includes(clave)) return;
    decirContenido(valor);
    const ok = valor === ronda.respuesta;
    if (!ok) {
      setHundida(clave);
      setDescartadas((d) => [...d, clave]);
      window.setTimeout(() => setHundida(null), 700);
      onRespuesta(valor, false, false);
      return;
    }
    efecto("paso", paso + col);
    setPisadas((p) => [...p, clave]);
    saltarA(clave);
    const ultima = col === columnas.length - 1;
    setColumna(col + 1);
    if (ultima) {
      window.setTimeout(() => {
        saltarA("orilla-der");
        setColumna(columnas.length + 1);
        onRespuesta(valor, true, true);
      }, 620);
    } else onRespuesta(valor, true, false);
  }

  return (
    <div ref={escenario} className="rio-escena relative w-full max-w-3xl">
      <div className="grid items-stretch gap-2 sm:gap-3" style={{ gridTemplateColumns: `minmax(4.5rem,1fr) repeat(${columnas.length}, minmax(5.5rem,1.3fr)) minmax(4.5rem,1fr)` }}>
        <div className="orilla orilla-izq grid min-h-72 place-items-center rounded-[2rem] sm:min-h-80">
          <span data-punto="orilla-izq" className="size-2" />
        </div>
        {columnas.map((piedras, c) => (
          <div key={c} className="rio relative flex flex-col items-center justify-around gap-6 py-6">
            {piedras.map((valor, f) => {
              const clave = `${c}-${f}`;
              const pisada = pisadas.includes(clave);
              const activa = c === columna && !terminado;
              const pista = activa && nivelAyuda >= 2 && valor === ronda.respuesta;
              return (
                <button
                  key={clave}
                  type="button"
                  data-punto={clave}
                  disabled={!activa || descartadas.includes(clave)}
                  onClick={() => pisar(c, f, valor)}
                  aria-label={`Piedra ${valor}`}
                  style={entrada(c * 2 + f)}
                  className={`piedra entrar-bloque relative grid h-22 w-full max-w-36 place-items-center rounded-[46%_54%_50%_50%/55%_50%_50%_45%] ${pisada ? "piedra-pisada" : activa ? "piedra-activa" : "piedra-lejos"} ${hundida === clave ? "piedra-hunde" : ""} ${descartadas.includes(clave) ? "opacity-45" : ""} ${pista ? "piedra-pista" : ""}`}
                >
                  <span className={`font-lectura font-bold text-tinta ${tamanoTexto(valor)}`}>{valor}</span>
                  {pisada ? <Destello /> : null}
                </button>
              );
            })}
          </div>
        ))}
        <div className="orilla orilla-der grid min-h-72 place-items-center rounded-[2rem] sm:min-h-80">
          <span data-punto="orilla-der" className="size-2" />
          <svg viewBox="0 0 40 60" className="absolute top-6 h-14 w-10" aria-hidden="true">
            <path d="M8 58 V6" stroke="#2B2440" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M9 7 L34 15 L9 24 Z" fill="#FFD166" stroke="#2B2440" strokeWidth="3" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {pos ? (
        <span className="animal-cruza pointer-events-none absolute top-0 left-0 z-10" style={{ transform: `translate(${pos.x - 36}px, ${pos.y - 62}px)` }} aria-hidden="true">
          <span key={salto} className={`block ${salto ? "animal-salta" : ""}`}>
            <Grupo claves={animal.slice(0, 1)} tamano={72} />
          </span>
        </span>
      ) : null}
    </div>
  );
}
