import { useEffect, useState, type FormEvent } from "react";
import Icono from "../../componentes/Icono";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MarcoAdulto } from "../../componentes/MarcoAdulto";
import Misi, { NOMBRES_PELAJE } from "../../componentes/Misi";
import { Alerta, Boton, Campo } from "../../componentes/ui";
import * as api from "../../servicios/api";
import { COLORES_PELAJE, type ColorPelaje } from "../../tipos";

const EDADES = [4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTOS = [5, 6, 7, 8, 9, 10];

/** CU-03: crear o editar un perfil infantil (apodo, edad opcional, tiempo y pelaje de Misi). */
export default function FormPerfil() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const editando = Boolean(id);
  const primero = params.get("primero") === "1";

  const [apodo, setApodo] = useState("");
  const [edad, setEdad] = useState<number | undefined>(undefined);
  const [minutos, setMinutos] = useState(8);
  const [pelaje, setPelaje] = useState<ColorPelaje>("naranja");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargado, setCargado] = useState(!editando);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .obtenerJugador(id)
      .then((j) => {
        setApodo(j.apodo);
        setEdad(j.edad);
        setMinutos(j.minutosSesion);
        setPelaje(j.pelaje);
        setCargado(true);
      })
      .catch(() => navegar("/tutor", { replace: true }));
  }, [id, navegar]);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const datos = { apodo, edad, minutosSesion: minutos, pelaje };
      if (id) await api.actualizarJugador(id, datos);
      else await api.crearJugador(datos);
      navegar("/tutor", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el perfil.");
    } finally {
      setCargando(false);
    }
  }

  async function borrar() {
    if (!id) return;
    setCargando(true);
    try {
      await api.eliminarJugador(id);
      navegar("/tutor", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos eliminar el perfil.");
      setCargando(false);
    }
  }

  const chip = (activo: boolean) =>
    `min-h-12 min-w-12 rounded-xl px-3 font-extrabold transition ${activo ? "bg-lavanda-oscuro text-white" : "bg-white text-tinta ring-2 ring-lavanda-claro hover:ring-lavanda"}`;

  return (
    <MarcoAdulto>
      {primero ? (
        <ol className="mb-5 flex gap-2 text-sm font-bold" aria-label="Pasos del registro">
          <li className="flex items-center gap-1 rounded-full bg-menta-claro px-3 py-1 text-[#2c6e50]">
            <Icono nombre="check" tamano={16} />
            Tu cuenta
          </li>
          <li className="rounded-full bg-lavanda-oscuro px-3 py-1 text-white" aria-current="step">
            2 · Perfil del niño
          </li>
        </ol>
      ) : (
        <Link to="/tutor" className="inline-flex items-center gap-1.5 text-sm font-bold text-lavanda-oscuro hover:underline">
          <Icono nombre="flecha-izq" tamano={16} />
          Volver a los perfiles
        </Link>
      )}

      <div className="mt-3 grid gap-8 lg:grid-cols-[1fr_300px]">
        <form onSubmit={guardar} className="flex flex-col gap-6 rounded-3xl bg-white p-6 ring-1 ring-celeste-oscuro sm:p-8" noValidate>
          <div>
            <h1 className="text-2xl font-black">{editando ? "Editar perfil" : "Crear el perfil del niño"}</h1>
            <p className="mt-1 text-tinta-suave">Usa un apodo: no necesitamos el nombre completo ni otros datos del menor.</p>
          </div>
          {error ? <Alerta>{error}</Alerta> : null}
          {!cargado ? <p className="text-tinta-suave">Cargando…</p> : null}

          <Campo
            id="apodo"
            etiqueta="Apodo"
            placeholder="Por ejemplo: Mari, Juanchito, Luna"
            maxLength={20}
            autoComplete="off"
            value={apodo}
            onChange={(e) => setApodo(e.target.value)}
            required
          />

          <fieldset>
            <legend className="text-sm font-bold">
              Edad <span className="font-normal text-tinta-suave">(opcional)</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {EDADES.map((n) => (
                <button key={n} type="button" aria-pressed={edad === n} onClick={() => setEdad(n)} className={chip(edad === n)}>
                  {n}
                </button>
              ))}
              <button type="button" aria-pressed={edad === undefined} onClick={() => setEdad(undefined)} className={chip(edad === undefined)}>
                Prefiero no decirlo
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-bold">Tiempo máximo de cada sesión</legend>
            <p className="text-sm text-tinta-suave">Un minuto antes, Capitán Misi avisa y la sesión cierra con calma.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MINUTOS.map((n) => (
                <button key={n} type="button" aria-pressed={minutos === n} onClick={() => setMinutos(n)} className={chip(minutos === n)}>
                  {n} min
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-bold">Color de Capitán Misi</legend>
            <p className="text-sm text-tinta-suave">El niño también puede cambiarlo en el vestidor.</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {COLORES_PELAJE.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={pelaje === p}
                  onClick={() => setPelaje(p)}
                  className={`flex flex-col items-center rounded-2xl p-2 text-xs font-bold ${pelaje === p ? "bg-lavanda-tenue ring-3 ring-lavanda-oscuro" : "ring-1 ring-lavanda-claro hover:bg-lavanda-tenue"}`}
                >
                  <Misi pelaje={p} tamano={56} />
                  {NOMBRES_PELAJE[p]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <Boton type="submit" cargando={cargando} disabled={!cargado}>
              {editando ? "Guardar cambios" : "Crear perfil"}
            </Boton>
            {!primero ? (
              <Link to="/tutor" className="grid min-h-12 place-items-center rounded-2xl px-5 font-bold text-tinta-suave hover:bg-lavanda-tenue">
                Cancelar
              </Link>
            ) : null}
          </div>

          {editando ? (
            <div className="mt-2 border-t border-lavanda-tenue pt-5">
              {confirmarBorrado ? (
                <div className="flex flex-col gap-3 rounded-2xl bg-rosa-claro p-4">
                  <p className="font-bold">
                    ¿Eliminar el perfil de {apodo}? Se borrarán sus sesiones, intentos, progreso y patitas. No se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <Boton type="button" variante="peligro" onClick={borrar} cargando={cargando}>
                      Sí, eliminar
                    </Boton>
                    <Boton type="button" variante="suave" onClick={() => setConfirmarBorrado(false)}>
                      No, conservar
                    </Boton>
                  </div>
                </div>
              ) : (
                <Boton type="button" variante="peligro" onClick={() => setConfirmarBorrado(true)}>
                  Eliminar perfil
                </Boton>
              )}
            </div>
          ) : null}
        </form>

        <aside className="flex flex-col items-center gap-3 self-start rounded-3xl cielo-noche p-6 text-center text-white">
          <Misi pelaje={pelaje} tamano={160} />
          <p className="text-xl font-black">¡Hola, {apodo.trim() || "rescatista"}!</p>
          <p className="text-sm text-white/80">Así verá a Capitán Misi. Sus sesiones durarán {minutos} minutos.</p>
        </aside>
      </div>
    </MarcoAdulto>
  );
}
