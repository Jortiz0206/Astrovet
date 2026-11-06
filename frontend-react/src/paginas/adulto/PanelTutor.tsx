import { useCallback, useEffect, useState } from "react";
import { PersonajeDe } from "../../componentes/Personaje";
import { Link, useNavigate } from "react-router-dom";
import { MarcoAdulto } from "../../componentes/MarcoAdulto";
import Misi from "../../componentes/Misi";
import { Alerta, Boton } from "../../componentes/ui";
import { useAutenticacion } from "../../contexto/Autenticacion";
import { useJuego } from "../../contexto/Juego";
import Icono from "../../componentes/Icono";
import Planeta from "../../componentes/Planeta";
import { MISIONES, MUNDOS } from "../../datos/contenido";
import { alCargarVoces, leerPreferencias, probarVoz, vocesEspanol } from "../../servicios/audio";
import * as api from "../../servicios/api";
import { reiniciarDemo } from "../../servicios/bd";
import type { Jugador } from "../../tipos";

const ESTADOS_SESION = { active: "En curso", completed: "Completada", abandoned: "Abandonada" } as const;

function fecha(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function Seguimiento({ jugador }: { jugador: Jugador }) {
  const [filas, setFilas] = useState<api.ResumenSesion[] | null>(null);
  useEffect(() => {
    api.resumenSesiones(jugador.id).then(setFilas).catch(() => setFilas([]));
  }, [jugador.id]);

  if (!filas) return <p className="text-sm text-tinta-suave">Cargando…</p>;
  if (filas.length === 0) return <p className="text-sm text-tinta-suave">Todavía no hay sesiones registradas.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs text-tinta-suave uppercase">
          <tr>
            <th className="py-2 pr-3 font-extrabold">Inicio</th>
            <th className="py-2 pr-3 font-extrabold">Estado</th>
            <th className="py-2 pr-3 font-extrabold">Duración</th>
            <th className="py-2 pr-3 font-extrabold">Intentos</th>
            <th className="py-2 pr-3 font-extrabold">Aciertos</th>
            <th className="py-2 pr-3 font-extrabold">Con ayuda</th>
            <th className="py-2 font-extrabold">Audio repetido</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.sesion.id} className="border-t border-lavanda-tenue">
              <td className="py-2 pr-3 font-bold">{fecha(f.sesion.inicioEn)}</td>
              <td className="py-2 pr-3">{ESTADOS_SESION[f.sesion.estado]}</td>
              <td className="py-2 pr-3">{f.minutos} min</td>
              <td className="py-2 pr-3">{f.intentos}</td>
              <td className="py-2 pr-3">{f.aciertos}</td>
              <td className="py-2 pr-3">{f.ayudas}</td>
              <td className="py-2">{f.repeticionesAudio}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-tinta-suave">
        Datos descriptivos de lo ocurrido en cada sesión. No son una evaluación ni un diagnóstico.
      </p>
    </div>
  );
}

function TarjetaPerfil({ jugador, onJugar, iniciando }: { jugador: Jugador; onJugar: (j: Jugador, demo?: number) => void; iniciando: boolean }) {
  const [verSeguimiento, setVerSeguimiento] = useState(false);
  const [, refrescar] = useState(0);
  const estados = api.estadosMisiones(jugador.id);
  const actual = MISIONES.find((m) => estados[m.id] === "disponible" || estados[m.id] === "en_progreso");

  return (
    <article className="rounded-3xl bg-white p-5 ring-1 ring-celeste-oscuro sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid size-20 shrink-0 place-items-center rounded-full cielo-noche">
          <PersonajeDe jugador={jugador} tamano={68} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-black">{jugador.apodo}</h2>
          <p className="text-sm text-tinta-suave">
            {jugador.edad ? `${jugador.edad} años · ` : ""}Sesiones de {jugador.minutosSesion} min · <span className="tabular-nums">{jugador.patitas}</span> patitas
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Boton onClick={() => onJugar(jugador)} cargando={iniciando} className="flex-1 sm:flex-none">
            <Icono nombre="jugar" tamano={20} />
            Jugar
          </Boton>
          <Link
            to={`/tutor/perfil/${jugador.id}`}
            className="grid min-h-12 place-items-center rounded-2xl px-4 font-extrabold text-lavanda-oscuro ring-2 ring-lavanda-claro hover:bg-lavanda-tenue"
          >
            Editar
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {MUNDOS.map((mundo) => {
          const hechas = mundo.misiones.filter((m) => estados[m.id] === "completado").length;
          return (
            <div key={mundo.id} className="flex items-center gap-3">
              <Planeta mundo={mundo.id} tamano={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 text-sm font-bold">
                  <span className="truncate">{mundo.nombre}</span>
                  <span className="text-tinta-suave tabular-nums">
                    {hechas}/{mundo.misiones.length}
                  </span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-lavanda-tenue" role="progressbar" aria-label={`Misiones completadas en ${mundo.nombre}`} aria-valuemin={0} aria-valuemax={mundo.misiones.length} aria-valuenow={hechas}>
                  <div className="h-full origin-left rounded-full bg-lavanda transition-transform duration-500" style={{ transform: `scaleX(${hechas / mundo.misiones.length})` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-tinta-suave">{actual ? `Siguiente: ${actual.id} · ${actual.titulo}` : "¡Recorrido completo! Puede repetir cualquier misión."}</p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-lavanda-tenue pt-3">
        <button type="button" onClick={() => setVerSeguimiento(!verSeguimiento)} aria-expanded={verSeguimiento} className="py-2 text-sm font-extrabold text-lavanda-oscuro hover:underline">
          {verSeguimiento ? "Ocultar actividad" : "Ver actividad reciente"}
        </button>
        <button type="button" onClick={() => onJugar(jugador, 2)} className="py-2 text-sm font-bold text-tinta-suave hover:text-lavanda-oscuro">
          Prototipo: probar el cierre suave (2 min)
        </button>
        <button
          type="button"
          onClick={async () => {
            await api.desbloquearTodoDemo(jugador.id);
            refrescar((n) => n + 1);
          }}
          className="py-2 text-sm font-bold text-tinta-suave hover:text-lavanda-oscuro"
        >
          Prototipo: abrir todas las misiones
        </button>
      </div>
      {verSeguimiento ? (
        <div className="mt-3">
          <Seguimiento jugador={jugador} />
        </div>
      ) : null}
    </article>
  );
}

/** El adulto elige la voz del dispositivo que usará Misi mientras no haya grabaciones. */
function VozMisi() {
  const [voces, setVoces] = useState<SpeechSynthesisVoice[]>(() => vocesEspanol());
  const [elegida, setElegida] = useState<string | null>(() => leerPreferencias().voz);
  useEffect(() => alCargarVoces(() => setVoces(vocesEspanol())), []);

  return (
    <section className="mt-10 rounded-3xl bg-white p-5 ring-1 ring-celeste-oscuro sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid size-12 place-items-center rounded-full bg-lavanda-tenue text-lavanda-oscuro">
          <Icono nombre="altavoz" tamano={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black">Voz de Capitán Misi</h2>
          <p className="text-sm text-tinta-suave">Mientras grabamos la voz definitiva, Misi usa una voz de este dispositivo. Las voces «natural» o «en línea» suenan mejor.</p>
        </div>
      </div>
      {voces.length ? (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex min-w-60 flex-1 flex-col gap-1.5 text-sm font-bold">
            Voz
            <select
              value={elegida ?? voces[0].voiceURI}
              onChange={(e) => {
                setElegida(e.target.value);
                probarVoz(e.target.value);
              }}
              className="min-h-12 rounded-xl border-2 border-lavanda-claro bg-white px-3 text-base font-semibold text-tinta focus:border-lavanda"
            >
              {voces.map((v, i) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang}){i === 0 ? " · recomendada" : ""}
                </option>
              ))}
            </select>
          </label>
          <Boton type="button" variante="secundario" onClick={() => probarVoz(elegida ?? voces[0].voiceURI)}>
            <Icono nombre="jugar" tamano={18} />
            Escuchar
          </Boton>
        </div>
      ) : (
        <p className="mt-4 text-sm text-tinta-suave">Este navegador no tiene voces en español instaladas. En Windows y Android se pueden agregar desde la configuración de idioma del sistema.</p>
      )}
    </section>
  );
}

export default function PanelTutor() {
  const { usuario, salir } = useAutenticacion();
  const { iniciarJuego } = useJuego();
  const navegar = useNavigate();
  const [jugadores, setJugadores] = useState<Jugador[] | null>(null);
  const [iniciando, setIniciando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    api.listarJugadores().then(setJugadores).catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    api.marcarAbandonadas();
    cargar();
  }, [cargar]);

  async function jugar(j: Jugador, demo?: number) {
    setIniciando(j.id);
    try {
      await iniciarJuego(j, demo);
      navegar("/juego");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos iniciar la sesión.");
      setIniciando(null);
    }
  }

  return (
    <MarcoAdulto>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">¿Quién va a jugar hoy?</h1>
          <p className="text-tinta-suave">Hola, {usuario?.nombre.split(" ")[0]}. Toca «Jugar» y entrégale la tableta al niño.</p>
        </div>
        <Link to="/tutor/perfil/nuevo" className="flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 font-extrabold text-lavanda-oscuro ring-2 ring-lavanda-claro hover:ring-lavanda">
          <Icono nombre="lapiz" tamano={20} />
          Nuevo perfil
        </Link>
      </div>

      {error ? (
        <div className="mt-4">
          <Alerta>{error}</Alerta>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        {jugadores === null ? <p className="text-tinta-suave">Cargando perfiles…</p> : null}
        {jugadores?.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center ring-1 ring-celeste-oscuro">
            <Misi tamano={110} />
            <p className="text-xl font-black">Todavía no hay perfiles</p>
            <p className="text-tinta-suave">Crea el perfil del niño para empezar la aventura.</p>
            <Link to="/tutor/perfil/nuevo" className="rounded-2xl bg-lavanda-oscuro px-6 py-3 font-extrabold text-white">
              Crear perfil
            </Link>
          </div>
        ) : null}
        {jugadores?.map((j) => (
          <TarjetaPerfil key={j.id} jugador={j} onJugar={jugar} iniciando={iniciando === j.id} />
        ))}
      </div>

      <VozMisi />

      <section className="mt-6 rounded-3xl border-2 border-dashed border-lavanda-claro p-5 text-sm text-tinta-suave">
        <p className="font-extrabold text-tinta">Prototipo</p>
        <p className="mt-1">
          Los datos se guardan solo en este navegador. Los audios usan la voz del dispositivo mientras se graban los definitivos.
        </p>
        <button
          type="button"
          className="mt-2 font-extrabold text-lavanda-oscuro hover:underline"
          onClick={() => {
            if (window.confirm("¿Borrar todos los datos de este navegador y volver a los datos de prueba?")) {
              reiniciarDemo();
              if (!api.usuarioActual()) {
                salir();
                navegar("/ingresar");
              } else cargar();
            }
          }}
        >
          Reiniciar datos de prueba
        </button>
      </section>
    </MarcoAdulto>
  );
}
