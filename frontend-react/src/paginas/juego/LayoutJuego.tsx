import { useEffect, useRef } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Icono from "../../componentes/Icono";
import Misi from "../../componentes/Misi";
import { BotonMantener } from "../../componentes/ui";
import { useJuego } from "../../contexto/Juego";
import { GUION } from "../../datos/guion";
import { alAzar, hablar } from "../../servicios/audio";

/** Marco de todas las pantallas del niño: cielo, saldo, ajustes y control del tiempo. */
export default function LayoutJuego() {
  const { listo, jugador, sesion, fase, prefs, setPrefs, terminarJuego, mundoVisual } = useJuego();
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const enDescanso = ubicacion.pathname === "/juego/descanso";
  const avisado = useRef(false);

  // Aviso amable un minuto antes de terminar (CU-08, paso 1).
  useEffect(() => {
    if (fase === "aviso" && !avisado.current) {
      avisado.current = true;
      hablar(alAzar(GUION.aviso), { interrumpir: false });
    }
    if (fase === "normal") avisado.current = false;
  }, [fase]);

  // Al cumplirse el tiempo (y la gracia), pasa a la escena de descanso.
  useEffect(() => {
    if (fase === "cierre" && !enDescanso) navegar("/juego/descanso", { replace: true, viewTransition: true });
  }, [fase, enDescanso, navegar]);

  if (!listo) return <div className="min-h-svh cielo-noche" />;
  if (!jugador || !sesion) return <Navigate to="/tutor" replace />;

  async function salirAlAdulto() {
    await terminarJuego();
    navegar("/tutor");
  }

  const control = "grid size-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20";

  return (
    <div data-mundo={enDescanso ? "descanso" : mundoVisual} className={`juego flex min-h-svh flex-col cielo-noche text-white ${prefs.movimiento ? "" : "sin-movimiento"}`}>
      {!enDescanso && (
        <header className="flex items-center gap-2 px-3 pt-3 sm:gap-3 sm:px-5">
          <Link to="/juego" viewTransition className="flex min-h-12 items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-1 min-[431px]:pr-4 ring-1 ring-white/15 transition-colors hover:bg-white/15">
            <Misi pelaje={jugador.pelaje} tamano={40} titulo="Ir al centro espacial" />
            <span className="max-w-28 truncate font-extrabold max-[430px]:hidden sm:max-w-none">{jugador.apodo}</span>
          </Link>
          <span id="contador-patitas" className="contador-patitas flex min-h-12 shrink-0 items-center gap-1.5 rounded-full px-4 font-black whitespace-nowrap text-tinta tabular-nums" aria-label={`${jugador.patitas} patitas doradas`}>
            <Icono nombre="patita" tamano={22} />
            {jugador.patitas}
          </span>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, efectos: !prefs.efectos })}
              aria-pressed={prefs.efectos}
              aria-label={prefs.efectos ? "Silenciar efectos de sonido" : "Activar efectos de sonido"}
              className={control}
            >
              <Icono nombre={prefs.efectos ? "campana" : "campana-off"} tamano={22} />
            </button>
            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, movimiento: !prefs.movimiento })}
              aria-pressed={!prefs.movimiento}
              aria-label={prefs.movimiento ? "Reducir animaciones" : "Activar animaciones"}
              className={`${control} ${prefs.movimiento ? "" : "bg-white/30"}`}
            >
              <Icono nombre={prefs.movimiento ? "chispas" : "calma"} tamano={22} />
            </button>
            <BotonMantener onCompletar={salirAlAdulto} className="min-h-12 bg-white/10 text-white/85 ring-1 ring-white/15">
              <span className="hidden sm:inline">Adulto: mantén para salir</span>
              <span className="sm:hidden">Salir</span>
            </BotonMantener>
          </div>
        </header>
      )}

      {(fase === "aviso" || fase === "gracia") && !enDescanso ? (
        <div role="status" className="aviso-descanso mx-auto mt-3 flex items-center gap-2 rounded-full bg-lavanda-claro px-5 py-2 font-extrabold text-tinta">
          <Icono nombre="luna" tamano={20} />
          {fase === "aviso" ? "Ya casi es hora de descansar." : "Terminemos esta y vamos a dormir."}
        </div>
      ) : null}

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
