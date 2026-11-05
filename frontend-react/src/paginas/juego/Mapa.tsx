import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Grupo } from "../../componentes/Criatura";
import Icono from "../../componentes/Icono";
import MisiDice from "../../componentes/MisiDice";
import Planeta from "../../componentes/Planeta";
import { useJuego } from "../../contexto/Juego";
import { MUNDOS } from "../../datos/contenido";
import { efecto, hablar } from "../../servicios/audio";
import type { EstadoMision, Mision, Mundo } from "../../tipos";

const ALTO_PASO = 112;

/** Posición horizontal (en %) de cada parada: un camino que serpentea. */
function xParada(i: number): number {
  return 50 + Math.sin(i * 1.15) * 30;
}

function mundoAbierto(mundo: Mundo, estados: Record<string, EstadoMision>): boolean {
  return mundo.misiones.some((m) => (estados[m.id] ?? "bloqueado") !== "bloqueado");
}

/** Mapa de mundos: una ruta de misiones por mundo, con sus estados (RF-06, RF-12). */
export default function Mapa() {
  const { jugador, estados, setMundoVisual } = useJuego();
  const navegar = useNavigate();
  const [params, setParams] = useSearchParams();

  // Por defecto se abre el mundo donde está la siguiente misión.
  const mundoActual = useMemo(() => {
    const pedido = Number(params.get("mundo"));
    if (MUNDOS.some((m) => m.id === pedido)) return pedido;
    const pendiente = MUNDOS.find((m) => m.misiones.some((x) => estados[x.id] === "disponible" || estados[x.id] === "en_progreso"));
    return pendiente?.id ?? MUNDOS[0].id;
  }, [params, estados]);
  const mundo = MUNDOS.find((m) => m.id === mundoActual) ?? MUNDOS[0];
  const abierto = mundoAbierto(mundo, estados);

  const [mensaje, setMensaje] = useState("");
  useEffect(() => {
    setMundoVisual(mundo.id);
    setMensaje(abierto ? mundo.historia : `Para llegar a ${mundo.nombre}, termina el mundo anterior.`);
  }, [mundo, abierto, setMundoVisual]);

  if (!jugador) return null;

  function elegirMundo(m: Mundo) {
    efecto("toque");
    setParams({ mundo: String(m.id) }, { replace: true, viewTransition: true });
  }

  function abrir(m: Mision, estado: EstadoMision) {
    if (estado === "bloqueado") {
      const t = "Esa misión se abre cuando termines la anterior.";
      setMensaje(t);
      hablar(t);
      return;
    }
    efecto("toque");
    navegar(`/juego/mision/${m.id}`, { viewTransition: true });
  }

  const n = mundo.misiones.length;
  const alto = n * ALTO_PASO + 40;
  const puntos = mundo.misiones.map((_, i) => ({ x: xParada(i), y: 56 + i * ALTO_PASO }));
  const primeraPendiente = mundo.misiones.find((m) => estados[m.id] === "disponible" || estados[m.id] === "en_progreso")?.id;
  const ultimaHecha = mundo.misiones.reduce((k, m, i) => (estados[m.id] === "completado" ? i : k), -1);
  const camino = (hasta: number) =>
    puntos
      .slice(0, hasta + 1)
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const a = puntos[i - 1];
        const medio = (a.y + p.y) / 2;
        return `C ${a.x} ${medio} ${p.x} ${medio} ${p.x} ${p.y}`;
      })
      .join(" ");

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 px-4 py-5">
      <nav className="selector-mundos flex w-full justify-center gap-2 sm:gap-4" aria-label="Mundos">
        {MUNDOS.map((m) => {
          const activo = m.id === mundo.id;
          const libre = mundoAbierto(m, estados);
          const hechas = m.misiones.filter((x) => estados[x.id] === "completado").length;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => elegirMundo(m)}
              aria-pressed={activo}
              className={`mundo-tab relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[1.75rem] px-2 pt-2 pb-3 transition-colors duration-200 sm:flex-none sm:px-5 ${activo ? "mundo-tab-activo" : "hover:bg-white/8"}`}
            >
              <span className={`transition-transform duration-300 ${activo ? "scale-110" : "scale-90 opacity-80"} ${libre ? "" : "grayscale-[0.7]"}`}>
                <Planeta mundo={m.id} tamano={64} />
              </span>
              <span className="truncate text-sm font-extrabold sm:text-base">{m.nombre}</span>
              <span className="flex items-center gap-1 text-xs font-bold text-white/70 tabular-nums">
                {libre ? (
                  <>
                    {hechas}/{m.misiones.length}
                    <Icono nombre="check" tamano={14} />
                  </>
                ) : (
                  <Icono nombre="candado" tamano={14} titulo="Bloqueado" />
                )}
              </span>
            </button>
          );
        })}
      </nav>

      <MisiDice mensaje={mensaje} pelaje={jugador.pelaje} tamano={80} onEscuchar={() => hablar(mensaje)} />

      <div className="ruta relative w-full max-w-xl" style={{ height: alto }}>
        <svg className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 100 ${alto}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={camino(n - 1)} className="ruta-camino" vectorEffect="non-scaling-stroke" />
          {ultimaHecha >= 0 ? <path d={camino(Math.min(n - 1, ultimaHecha + 1))} className="ruta-recorrida" vectorEffect="non-scaling-stroke" /> : null}
        </svg>
        <ol className="absolute inset-0">
          {mundo.misiones.map((m, i) => {
            const estado = estados[m.id] ?? "bloqueado";
            const hecha = estado === "completado";
            const actual = m.id === primeraPendiente;
            const abiertaSinHacer = !hecha && !actual && estado !== "bloqueado";
            const grande = m.patitas >= 30;
            const p = puntos[i];
            return (
              <li key={m.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: p.y }}>
                <button
                  type="button"
                  onClick={() => abrir(m, estado)}
                  aria-label={`${m.titulo}. ${hecha ? "Completada" : estado === "bloqueado" ? "Bloqueada" : "Disponible"}`}
                  className={`parada relative grid place-items-center rounded-full ${grande ? "size-24" : "size-20"} ${hecha ? "parada-hecha" : actual ? "parada-actual" : abiertaSinHacer ? "parada-abierta" : "parada-bloqueada"}`}
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  {hecha ? (
                    <Grupo claves={m.animal.claves} tamano={grande ? 70 : 58} />
                  ) : actual || abiertaSinHacer ? (
                    <span className="niebla-suave">
                      <Grupo claves={m.animal.claves} tamano={grande ? 66 : 54} />
                    </span>
                  ) : (
                    <Icono nombre="candado" tamano={26} />
                  )}
                  {grande ? (
                    <span className="absolute -top-2 -right-2 grid size-8 place-items-center rounded-full bg-dorado text-tinta shadow-md">
                      <Icono nombre="estrella" tamano={18} />
                    </span>
                  ) : null}
                </button>
                {actual ? (
                  <span className="parada-etiqueta pointer-events-none absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-full bg-white px-3 py-1 text-sm font-extrabold whitespace-nowrap text-tinta shadow-lg" style={p.x > 60 ? { left: "auto", right: "100%", marginRight: 12, marginLeft: 0 } : undefined}>
                    {m.animal.nombre} te espera
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
