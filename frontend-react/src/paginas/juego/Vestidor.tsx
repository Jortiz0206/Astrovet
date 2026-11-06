import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icono from "../../componentes/Icono";
import Misi, { NOMBRES_PELAJE } from "../../componentes/Misi";
import Personaje from "../../componentes/Personaje";
import { useJuego } from "../../contexto/Juego";
import { PELAJES, PERSONAJES, obtenerPersonaje, type IdPersonaje } from "../../datos/personajes";
import * as api from "../../servicios/api";
import { efecto, hablar } from "../../servicios/audio";
import { COLORES_PELAJE, type ColorPelaje } from "../../tipos";

/**
 * Vestidor: el niño elige su compañero (Misi viene de serie; los demás se
 * desbloquean con patitas) y el pelaje de cada uno (gratis).
 */
export default function Vestidor() {
  const { jugador, refrescar, setMundoVisual } = useJuego();
  const [ocupado, setOcupado] = useState(false);
  /** Personaje bloqueado que el niño está mirando antes de desbloquearlo. */
  const [mirando, setMirando] = useState<IdPersonaje | null>(null);
  const [aviso, setAviso] = useState("");
  useEffect(() => setMundoVisual(0), [setMundoVisual]);
  if (!jugador) return null;

  const tengo = api.personajesDe(jugador);
  const actual = jugador.personaje ?? "misi";
  const vista = mirando ?? actual;
  const infoVista = obtenerPersonaje(vista);
  const bloqueadoVista = !tengo.includes(vista);
  const faltan = infoVista.precio - jugador.patitas;

  async function elegirPelaje(p: ColorPelaje) {
    if (!jugador || p === jugador.pelaje || ocupado) return;
    setOcupado(true);
    try {
      await api.cambiarPelaje(jugador.id, p);
      await refrescar();
      efecto("paso");
      hablar("¡Te queda muy bien!");
    } finally {
      setOcupado(false);
    }
  }

  async function elegirVariante(variante: string) {
    if (!jugador || actual === "misi" || jugador.pelajes?.[actual] === variante || ocupado) return;
    setOcupado(true);
    try {
      await api.cambiarPelajePersonaje(jugador.id, actual, variante);
      await refrescar();
      efecto("paso");
      hablar("¡Te queda muy bien!");
    } finally {
      setOcupado(false);
    }
  }

  async function tocarPersonaje(id: IdPersonaje) {
    if (!jugador || ocupado) return;
    efecto("toque");
    const info = obtenerPersonaje(id);
    if (!tengo.includes(id)) {
      setMirando(id);
      const texto =
        jugador.patitas >= info.precio
          ? `${info.nombre} cuesta ${info.precio} patitas. ¿Lo desbloqueamos?`
          : `${info.nombre} cuesta ${info.precio} patitas. Te faltan ${info.precio - jugador.patitas}: rescata más animales.`;
      setAviso(texto);
      hablar(texto);
      return;
    }
    setMirando(null);
    setAviso("");
    if (id === actual) return;
    setOcupado(true);
    try {
      await api.elegirPersonaje(jugador.id, id);
      await refrescar();
      efecto("unir", 3);
      hablar(info.saludo);
    } finally {
      setOcupado(false);
    }
  }

  async function desbloquear() {
    if (!jugador || !mirando || ocupado) return;
    const info = obtenerPersonaje(mirando);
    setOcupado(true);
    try {
      await api.desbloquearPersonaje(jugador.id, mirando);
      await refrescar();
      efecto("rescate");
      setMirando(null);
      setAviso(`¡${info.nombre} ya es tu compañero!`);
      hablar(info.saludo);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No se pudo desbloquear.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-5 px-4 py-6">
      <div className="flex w-full items-center gap-2">
        <Link to="/juego" viewTransition className="flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-bold ring-1 ring-white/15 hover:bg-white/20">
          <Icono nombre="flecha-izq" tamano={20} />
          Mi casa
        </Link>
      </div>
      <h1 className="text-3xl font-black sm:text-4xl">Vestidor</h1>

      <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        <div className={`grid size-52 shrink-0 animate-flotar place-items-center rounded-full ring-4 sm:size-60 ${bloqueadoVista ? "bg-white/5 ring-white/10" : "bg-white/10 ring-white/15"}`}>
          <Personaje key={`${vista}-${jugador.pelaje}-${jugador.pelajes?.[vista] ?? ""}`} personaje={vista} pelaje={jugador.pelaje} variante={jugador.pelajes?.[vista]} tamano={190} className={`misi-cambia ${bloqueadoVista ? "personaje-bloqueado" : ""}`} />
        </div>
        <div className="flex max-w-sm flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <p className="text-2xl font-black">{infoVista.nombre}</p>
          <p className="font-bold text-white/80">{infoVista.especie[0].toUpperCase() + infoVista.especie.slice(1)}</p>
          {aviso ? (
            <p className="rounded-2xl bg-white px-4 py-2 font-extrabold text-tinta" aria-live="polite">
              {aviso}
            </p>
          ) : null}
          {mirando ? (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={desbloquear}
                disabled={faltan > 0 || ocupado}
                className="boton-juego flex min-h-14 items-center gap-2 rounded-full px-6 text-lg font-black disabled:opacity-50"
              >
                <Icono nombre="patita" tamano={20} />
                {faltan > 0 ? `Faltan ${faltan}` : `Desbloquear por ${infoVista.precio}`}
              </button>
              <button type="button" onClick={() => (setMirando(null), setAviso(""))} className="min-h-14 rounded-full bg-white/10 px-5 font-bold ring-1 ring-white/15">
                Volver
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <h2 className="text-xl font-extrabold">Elige tu personaje</h2>
      <ul className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {PERSONAJES.map((p) => {
          const lo = tengo.includes(p.id);
          const puesto = p.id === actual;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => tocarPersonaje(p.id)}
                aria-pressed={puesto}
                aria-label={lo ? `${p.nombre}${puesto ? ", puesto" : ""}` : `${p.nombre}, bloqueado: ${p.precio} patitas`}
                className={`relative flex w-full flex-col items-center gap-1 rounded-3xl p-2 font-bold transition ${
                  puesto ? "bg-white text-tinta ring-4 ring-dorado" : mirando === p.id ? "bg-white/20 ring-4 ring-white/60" : "bg-white/10 ring-2 ring-white/15 hover:bg-white/20"
                }`}
              >
                <Personaje personaje={p.id} pelaje={jugador.pelaje} variante={jugador.pelajes?.[p.id]} tamano={78} className={lo ? "" : "personaje-bloqueado"} />
                {p.nombre}
                {lo ? null : (
                  <span className="absolute top-1 right-1 flex items-center gap-0.5 rounded-full bg-dorado px-2 py-0.5 text-sm font-black text-tinta tabular-nums">
                    <Icono nombre="patita" tamano={14} />
                    {p.precio}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {!mirando ? (
        <>
          <h2 className="mt-2 text-xl font-extrabold">Pelaje de {obtenerPersonaje(actual).nombre}</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {actual === "misi"
              ? COLORES_PELAJE.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => elegirPelaje(p)}
                    aria-pressed={jugador.pelaje === p}
                    disabled={ocupado}
                    className={`flex flex-col items-center gap-1 rounded-3xl p-2 font-bold transition ${
                      jugador.pelaje === p ? "bg-white text-tinta ring-4 ring-dorado" : "bg-white/10 ring-2 ring-white/15 hover:bg-white/20"
                    }`}
                  >
                    <Misi pelaje={p} tamano={72} />
                    {NOMBRES_PELAJE[p]}
                  </button>
                ))
              : PELAJES[actual].map((v, i) => {
                  const puesto = (jugador.pelajes?.[actual] ?? PELAJES[actual][0].id) === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => elegirVariante(v.id)}
                      aria-pressed={puesto}
                      disabled={ocupado}
                      style={{ animationDelay: `${i * 50}ms` }}
                      className={`entrar-bloque flex flex-col items-center gap-1 rounded-3xl p-2 font-bold transition ${
                        puesto ? "bg-white text-tinta ring-4 ring-dorado" : "bg-white/10 ring-2 ring-white/15 hover:bg-white/20"
                      }`}
                    >
                      <Personaje personaje={actual} variante={v.id} tamano={72} />
                      {v.nombre}
                    </button>
                  );
                })}
          </div>
        </>
      ) : null}

      <p className="flex items-center gap-2 text-white/80 tabular-nums">
        <Icono nombre="patita" tamano={18} />
        Tienes {jugador.patitas} patitas. Ganas más rescatando animales.
      </p>
    </section>
  );
}
