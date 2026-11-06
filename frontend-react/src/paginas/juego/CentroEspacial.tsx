import { useEffect, useMemo } from "react";
import { PersonajeDe } from "../../componentes/Personaje";
import { Link } from "react-router-dom";
import { Grupo } from "../../componentes/Criatura";
import Icono from "../../componentes/Icono";
import MisiDice from "../../componentes/MisiDice";
import Planeta from "../../componentes/Planeta";
import { useJuego } from "../../contexto/Juego";
import { MISIONES, obtenerMundo } from "../../datos/contenido";
import { GUION } from "../../datos/guion";
import { alAzar, hablar } from "../../servicios/audio";

/** Centro espacial: pantalla principal del juego (sección 11.2). */
export default function CentroEspacial() {
  const { jugador, estados, setMundoVisual } = useJuego();
  const saludo = useMemo(() => alAzar(GUION.bienvenida), []);
  useEffect(() => setMundoVisual(0), [setMundoVisual]);
  if (!jugador) return null;

  const rescatados = MISIONES.filter((m) => estados[m.id] === "completado");
  const siguiente = MISIONES.find((m) => estados[m.id] === "disponible" || estados[m.id] === "en_progreso");
  const mundoSiguiente = siguiente ? obtenerMundo(siguiente.idMundo) : undefined;
  const mensaje = `¡Hola, ${jugador.apodo}! ${saludo}`;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-7 px-4 py-7">
      <MisiDice mensaje={mensaje} pelaje={jugador.pelaje} personaje={jugador.personaje} variante={jugador.pelajes?.[jugador.personaje ?? "misi"]} tamano={104} onEscuchar={() => hablar(mensaje)} />

      <div className="grid w-full gap-4 sm:grid-cols-[1.35fr_1fr] sm:grid-rows-2">
        <Link to={siguiente ? `/juego/mapa?mundo=${siguiente.idMundo}` : "/juego/mapa"} viewTransition className="destino destino-mapa group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-[2.25rem] p-6 sm:row-span-2 sm:min-h-80">
          <span className="absolute -top-4 -right-4 transition-transform duration-500 group-hover:rotate-6" aria-hidden="true">
            <Planeta mundo={siguiente?.idMundo ?? 1} tamano={190} />
          </span>
          {siguiente ? (
            <span className="niebla-suave absolute top-28 left-8 sm:top-32" aria-hidden="true">
              <Grupo claves={siguiente.animal.claves} tamano={92} />
            </span>
          ) : null}
          <span className="relative">
            <span className="flex items-center gap-2 text-3xl font-black text-white sm:text-4xl">
              <Icono nombre="mapa" tamano={32} />
              Mapa de mundos
            </span>
            <span className="mt-1 block text-lg font-bold text-white/85">
              {siguiente ? `${siguiente.animal.nombre} te espera en ${mundoSiguiente?.nombre}.` : "¡Rescataste a todos! Repite tus misiones favoritas."}
            </span>
          </span>
        </Link>

        <Link to="/juego/mision/ESP-02" viewTransition className="destino destino-vocales group relative flex min-h-32 items-center gap-4 overflow-hidden rounded-[2rem] p-5">
          <span className="flex gap-1 font-lectura text-4xl font-bold text-white" aria-hidden="true">
            {["A", "E", "I", "O", "U"].map((v, i) => (
              <span key={v} className="vocal-salta" style={{ animationDelay: `${i * 0.12}s` }}>
                {v}
              </span>
            ))}
          </span>
          <span>
            <span className="block text-2xl font-black text-white">Estación de vocales</span>
            <span className="block font-bold text-white/85">Practica sin prisa.</span>
          </span>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/juego/casa/clinica" viewTransition className="destino destino-clinica relative flex min-h-32 flex-col justify-between overflow-hidden rounded-[2rem] p-5">
            <span className="flex -space-x-5" aria-hidden="true">
              {rescatados.length ? (
                rescatados.slice(-3).map((m) => <Grupo key={m.id} claves={[m.animal.claves[0]]} tamano={52} />)
              ) : (
                <Icono nombre="clinica" tamano={44} className="text-white" />
              )}
            </span>
            <span>
              <span className="block text-xl font-black text-white">Clínica</span>
              <span className="block text-sm font-bold text-white/85 tabular-nums">
                {rescatados.length ? `${rescatados.length} ${rescatados.length === 1 ? "rescatado" : "rescatados"}` : "Aún vacía"}
              </span>
            </span>
          </Link>
          <Link to="/juego/vestidor" viewTransition className="destino destino-vestidor relative flex min-h-32 flex-col justify-between overflow-hidden rounded-[2rem] p-5">
            <span aria-hidden="true">
              <PersonajeDe jugador={jugador} tamano={56} />
            </span>
            <span>
              <span className="block text-xl font-black text-white">Vestidor</span>
              <span className="block text-sm font-bold text-white/85">Elige tu personaje.</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
