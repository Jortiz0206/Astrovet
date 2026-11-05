import { useCallback, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Criatura, { type ClaveCriatura } from "../componentes/Criatura";
import Icono from "../componentes/Icono";
import Estrellas, { type ControlEstrellas } from "../componentes/landing/Estrellas";
import MiniMision, { type ResumenDemo } from "../componentes/landing/MiniMision";
import Marca from "../componentes/Marca";
import Misi from "../componentes/Misi";
import Planeta from "../componentes/Planeta";
import { Alerta, Boton, Campo } from "../componentes/ui";
import { inicioDeRol, useAutenticacion } from "../contexto/Autenticacion";

const MUNDOS: { id: number; letras: string; nombre: string; texto: string; animales: ClaveCriatura[] }[] = [
  { id: 1, letras: "A E I O U", nombre: "Planeta Nebulosa", texto: "Las vocales por su sonido. Cada vocal despeja una nube y aparece un animal.", animales: ["abeja", "elefante", "oso"] },
  { id: 2, letras: "MA PE SI LU", nombre: "Luna Mágica", texto: "M, P, S y L llegan una a una, por su sonido, y se unen con las vocales para sacar a los animales de los cráteres.", animales: ["mona", "pinguino", "leon"] },
  { id: 3, letras: "MAPA SOPA", nombre: "Selva Cósmica", texto: "Con las sílabas conocidas se arman y se leen las primeras palabras de los carteles de la selva.", animales: ["sapo", "puma", "tortuga-marina"] },
];

/** Camino entre los centros de los planetas (columna de 16rem, filas parejas). */
const RUTA = "M75 150 C 75 300, 185 300, 185 450 S 75 600, 75 750";

const AYUDAS: { cuando: string; dice: string; detalle: string }[] = [
  { cuando: "Se equivoca", dice: "Esa suena «e». Buscamos «a».", detalle: "Misi nombra lo que eligió y lo que se busca. Nada se pierde." },
  { cuando: "Le sigue costando", dice: "Una pista: la que brilla.", detalle: "Tras tres intentos seguidos, la respuesta se ilumina un poco." },
  { cuando: "No le sale", dice: "Hagámoslo juntos. Mira y escucha.", detalle: "Misi dice la respuesta y la hacen juntos, sin quitarle el logro." },
];

const EJEMPLO: { mision: string; estado: string; intentos: number; ayudas: number; avance: number }[] = [
  { mision: "La nube de la A", estado: "Completada", intentos: 9, ayudas: 1, avance: 1 },
  { mision: "La nube de la E", estado: "Completada", intentos: 11, ayudas: 2, avance: 1 },
  { mision: "La nube de la I", estado: "En curso", intentos: 4, ayudas: 0, avance: 0.4 },
];

export default function Landing() {
  const { usuario } = useAutenticacion();
  const estrellas = useRef<ControlEstrellas | null>(null);
  const [resumen, setResumen] = useState<ResumenDemo | null>(null);
  const [patitas, setPatitas] = useState(0);

  const irACuenta = useCallback(() => {
    const destino = document.getElementById("cuenta");
    destino?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    window.setTimeout(() => document.getElementById("cuenta-nombre")?.focus({ preventScroll: true }), 700);
  }, []);
  const alGanarPatitas = useCallback(() => setPatitas(10), []);

  return (
    <div className="landing min-h-svh bg-noche text-white">
      {/* Primera pantalla: la misión jugable */}
      <section className="escena-demo cielo-noche relative flex min-h-svh flex-col overflow-hidden" aria-label="Misión de demostración">
        <span className="nebulosa nebulosa-1" aria-hidden="true" />
        <span className="nebulosa nebulosa-2" aria-hidden="true" />
        <Estrellas control={estrellas} />
        <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4">
          <Marca claro />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span
              id="contador-patitas"
              className={`contador-demo flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 font-black text-dorado ring-1 ring-white/15 ${patitas ? "contador-lleno" : ""}`}
              aria-label={`Patitas de la demostración: ${patitas}`}
            >
              <Icono nombre="patita" tamano={20} />
              {patitas}
            </span>
            {usuario ? (
              <Link to={inicioDeRol(usuario.rol)} className="rounded-full bg-white px-5 py-2.5 font-extrabold text-lavanda-oscuro">
                Mi espacio
              </Link>
            ) : (
              <>
                <Link to="/ingresar" className="rounded-full px-3 py-2.5 font-extrabold text-white/90 hover:text-white max-sm:hidden">
                  Ingresar
                </Link>
                <a href="#cuenta" className="rounded-full bg-white px-4 py-2.5 font-extrabold whitespace-nowrap text-lavanda-oscuro sm:px-5">
                  Crear cuenta
                </a>
              </>
            )}
          </div>
        </header>
        <MiniMision estrellas={estrellas} onTerminar={setResumen} onIrACuenta={irACuenta} onPatitas={alGanarPatitas} />
        <span className="horizonte" aria-hidden="true" />
      </section>

      {/* Cómo aprende: lo que el visitante acaba de jugar, explicado */}
      <section id="como" className="bg-lavanda-tenue text-tinta">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="grid items-end gap-10 md:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 className="titulo-seccion text-balance">Tres juegos para un solo sonido.</h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-tinta-suave">
                En la misión se revientan globos, se cruza un río y se traza una estela, y todo es la «a». Así practica tu hijo: cada misión cambia de
                juego para que repetir no se sienta como repetir.
              </p>
            </div>
            <ul className="juegos-muestra flex items-end justify-between gap-3 sm:gap-6" aria-label="Juegos de la misión">
              <li className="flex flex-col items-center gap-2">
                <MuestraGlobos />
                <span className="font-extrabold">Globos</span>
              </li>
              <li className="flex flex-col items-center gap-2">
                <MuestraPiedras />
                <span className="font-extrabold">Piedras del río</span>
              </li>
              <li className="flex flex-col items-center gap-2">
                <MuestraEstela />
                <span className="font-extrabold">Estela</span>
              </li>
            </ul>
          </div>

          <div className="mt-20 grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <h3 className="text-balance text-3xl font-black sm:text-4xl">Equivocarse no quita nada.</h3>
              <p className="mt-3 text-lg leading-relaxed text-tinta-suave">
                No hay vidas, ni tiempo que corre, ni patitas que se pierden. Cuando algo no sale, Misi responde con lo que pasó y, si hace falta,
                ayuda un poco más.
              </p>
              <p className="mt-4 font-bold text-lavanda-oscuro" aria-live="polite">
                {resumen === null
                  ? "Prueba la misión de arriba y equivócate a propósito: verás cómo responde."
                  : resumen.errores === 0
                    ? "En tu misión no hubo errores. Juega otra vez y prueba a equivocarte."
                    : `En tu misión hubo ${resumen.errores} ${resumen.errores === 1 ? "intento fallido" : "intentos fallidos"}${resumen.pistas ? ` y ${resumen.pistas} ${resumen.pistas === 1 ? "pista" : "pistas"}` : ""}. Así se registra en el panel de la familia.`}
              </p>
            </div>
            <ol className="escalera grid gap-4 sm:grid-cols-3 sm:items-end">
              {AYUDAS.map((a, i) => (
                <li key={a.cuando} className="escalon flex flex-col gap-3" style={{ "--alto": `${i * 2.75}rem` } as CSSProperties}>
                  <p className="globo-claro relative rounded-2xl bg-white px-4 py-3 text-lg leading-snug font-extrabold shadow-[0_10px_24px_-16px_rgb(43_36_64/0.5)]">
                    {a.dice}
                  </p>
                  <div className="escalon-base rounded-[1.5rem] bg-lavanda-oscuro p-5 text-white">
                    <span className="font-black text-dorado">{a.cuando}</span>
                    <p className="mt-1 text-white/85">{a.detalle}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* El camino de los tres mundos, con el trazo que avanza al bajar */}
      <section id="mundos" className="cielo-noche relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <h2 className="titulo-seccion max-w-2xl text-balance">Un viaje de las vocales a las primeras palabras.</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
            Las vocales acompañan todo el recorrido. Cada mundo retoma lo anterior y agrega un paso nuevo; las consonantes se presentan por su sonido,
            nunca por su nombre.
          </p>
          <div className="ruta relative mt-14">
            <svg className="ruta-trazo absolute top-0 bottom-0 left-0 h-full w-64 max-md:hidden" viewBox="0 0 260 900" preserveAspectRatio="none" aria-hidden="true">
              <path className="ruta-fondo" d={RUTA} />
              <path className="ruta-linea" pathLength={1} d={RUTA} />
            </svg>
            <ol className="relative grid gap-14 md:gap-20">
              {MUNDOS.map((m, i) => (
                <li key={m.id} className="mundo-parada grid items-center gap-5 md:grid-cols-[16rem_1fr]">
                  <span className={`flex ${i % 2 ? "md:justify-end" : "md:justify-start"}`}>
                    <Planeta mundo={m.id} tamano={150} className="planeta-ruta shrink-0" />
                  </span>
                  <div className="max-w-xl">
                    <p className="font-lectura text-3xl font-bold tracking-[0.12em] text-dorado">{m.letras}</p>
                    <h3 className="mt-1 text-3xl font-black">{m.nombre}</h3>
                    <p className="mt-2 text-lg leading-relaxed text-white/80">{m.texto}</p>
                    <div className="mt-4 flex -space-x-3" aria-hidden="true">
                      {m.animales.map((a) => (
                        <Criatura key={a} clave={a} tamano={60} />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Para el adulto */}
      <section className="bg-white text-tinta">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 md:grid-cols-2">
          <div>
            <h2 className="titulo-seccion text-balance">Tú acompañas. Misi guía.</h2>
            <dl className="mt-8 grid gap-6">
              <div>
                <dt className="text-xl font-black">Sesiones cortas, con cierre tranquilo</dt>
                <dd className="mt-1 text-lg text-tinta-suave">Defines entre 5 y 10 minutos. Un minuto antes, Misi avisa y la sesión termina sin cortes bruscos.</dd>
              </div>
              <div>
                <dt className="text-xl font-black">Un perfil por niño</dt>
                <dd className="mt-1 text-lg text-tinta-suave">Nombre, avatar, color de Misi y su propio avance. Varios hermanos pueden jugar con la misma cuenta.</dd>
              </div>
              <div>
                <dt className="text-xl font-black">Seguimiento que describe, no que juzga</dt>
                <dd className="mt-1 text-lg text-tinta-suave">
                  Ves qué se practicó, cuántos intentos hubo y qué ayudas se usaron. AstroVet no diagnostica ni reemplaza la valoración de un profesional.
                </dd>
              </div>
            </dl>
          </div>
          <figure className="panel-ejemplo rounded-[2rem] bg-lavanda-tenue p-6 sm:p-8">
            <figcaption className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-white">
                  <Misi tamano={40} pelaje="gris" titulo="" />
                </span>
                <span>
                  <span className="block text-lg font-black">Avance de Sofía</span>
                  <span className="text-sm text-tinta-suave">Planeta Nebulosa</span>
                </span>
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-tinta-suave">Ejemplo</span>
            </figcaption>
            <ul className="mt-6 grid gap-3">
              {EJEMPLO.map((e) => (
                <li key={e.mision} className="rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-extrabold">{e.mision}</span>
                    <span className={`text-sm font-bold ${e.avance === 1 ? "text-menta-oscuro" : "text-lavanda-oscuro"}`}>{e.estado}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-lavanda-tenue">
                    <span className="block h-full origin-left rounded-full bg-lavanda" style={{ transform: `scaleX(${e.avance})` }} />
                  </div>
                  <p className="mt-2 text-sm text-tinta-suave">
                    {e.intentos} intentos, {e.ayudas === 0 ? "sin ayudas" : `${e.ayudas} ${e.ayudas === 1 ? "ayuda" : "ayudas"}`}
                  </p>
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </section>

      <SeccionCuenta resumen={resumen} />

      <footer className="bg-noche">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-white/70 sm:flex-row sm:justify-between">
          <span className="font-bold">AstroVet. Jugando hoy, leyendo mañana.</span>
          <span className="flex gap-5">
            <Link to="/registro?rol=docente" className="hover:text-white">
              Soy docente
            </Link>
            <Link to="/privacidad" className="hover:text-white">
              Tratamiento de datos
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

/** Registro en la misma página: el adulto termina la misión y crea la cuenta sin salir. */
function SeccionCuenta({ resumen }: { resumen: ResumenDemo | null }) {
  const { usuario, registrar } = useAutenticacion();
  const navegar = useNavigate();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const corta = contrasena.length > 0 && contrasena.length < 8;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await registrar({ nombre, correo, contrasena, rol: "tutor", aceptaPolitica: acepta });
      navegar("/tutor/perfil/nuevo?primero=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear la cuenta.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <section id="cuenta" className="cielo-noche relative scroll-mt-4 overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 md:grid-cols-[1fr_1fr]">
        <div className="relative">
          <h2 className="titulo-seccion text-balance">{resumen ? "Ada ya te conoce. Ahora falta tu hijo." : "Hay animales esperando a tu hijo."}</h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/80">
            Crea la cuenta del adulto y, en el siguiente paso, el perfil del niño: nombre, avatar y color de Misi. Toma menos de dos minutos.
          </p>
          <div className="cuenta-amigos mt-10 flex items-end gap-2" aria-hidden="true">
            <span className="animate-flotar">
              <Misi tamano={120} />
            </span>
            <Criatura clave="abeja" tamano={84} className="amigo-1" />
            <Criatura clave="mona" tamano={84} className="amigo-2" />
            <Criatura clave="sapo" tamano={84} className="amigo-3" />
          </div>
        </div>

        {usuario ? (
          <div className="rounded-[2rem] bg-white p-8 text-tinta">
            <p className="text-xl font-black">Ya tienes una sesión abierta.</p>
            <Link to={inicioDeRol(usuario.rol)} className="boton-juego mt-5 inline-flex min-h-14 items-center rounded-full px-7 text-lg font-black">
              Ir a mi espacio
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 text-tinta sm:p-8" noValidate>
            <p className="text-2xl font-black">Crear cuenta de familia</p>
            {error ? <Alerta>{error}</Alerta> : null}
            <Campo id="cuenta-nombre" etiqueta="Tu nombre" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <Campo id="cuenta-correo" etiqueta="Correo electrónico" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            <div className="relative">
              <Campo
                id="cuenta-contrasena"
                etiqueta="Contraseña"
                type={mostrar ? "text" : "password"}
                autoComplete="new-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                error={corta}
                ayuda="Mínimo 8 caracteres."
                required
              />
              <button
                type="button"
                onClick={() => setMostrar(!mostrar)}
                aria-pressed={mostrar}
                className="absolute top-8 right-2 rounded-lg px-3 py-2 text-sm font-bold text-lavanda-oscuro hover:bg-lavanda-tenue"
              >
                {mostrar ? "Ocultar" : "Ver"}
              </button>
            </div>
            <label className="flex items-start gap-3 rounded-xl bg-lavanda-tenue p-3 text-sm">
              <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 size-5 accent-lavanda-oscuro" />
              <span>
                Soy el adulto responsable del niño y acepto los términos de uso y la{" "}
                <Link to="/privacidad" target="_blank" className="font-bold text-lavanda-oscuro underline">
                  política de tratamiento de datos
                </Link>
                .
              </span>
            </label>
            <Boton type="submit" cargando={cargando} className="min-h-14 text-lg">
              Crear cuenta y seguir
            </Boton>
            <p className="text-center text-sm text-tinta-suave">
              ¿Ya tienes cuenta?{" "}
              <Link to="/ingresar" className="font-extrabold text-lavanda-oscuro hover:underline">
                Ingresa
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

/* Miniaturas de los tres juegos (solo ilustran; el juego real está arriba). */

function MuestraGlobos() {
  return (
    <svg viewBox="0 0 120 150" className="muestra w-24 sm:w-32" aria-hidden="true">
      {[
        { x: 32, y: 58, c: "#FFB7B2", l: "a", d: "0s" },
        { x: 82, y: 40, c: "#FFD166", l: "e", d: "-1.2s" },
        { x: 66, y: 96, c: "#8FD9B6", l: "a", d: "-2.1s" },
      ].map((g, i) => (
        <g key={i} className="muestra-globo" style={{ animationDelay: g.d }}>
          <path d={`M${g.x} ${g.y + 24} q-4 14 3 26`} fill="none" stroke="#5f5878" strokeWidth="2" />
          <ellipse cx={g.x} cy={g.y} rx="21" ry="25" fill={g.c} stroke="#2B2440" strokeWidth="3" />
          <text x={g.x} y={g.y + 8} textAnchor="middle" fontFamily="Andika, Nunito, sans-serif" fontWeight="700" fontSize="24" fill="#2B2440">
            {g.l}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MuestraPiedras() {
  const piedras: [number, number, string][] = [
    [28, 112, "a"],
    [70, 100, "a"],
    [112, 118, "o"],
  ];
  return (
    <svg viewBox="0 0 140 150" className="muestra w-28 sm:w-36" aria-hidden="true">
      <rect x="0" y="70" width="140" height="70" rx="22" fill="#9ed2f0" />
      <path d="M10 92 q14 -6 28 0 t28 0 t28 0 t28 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      {piedras.map(([x, y, l]) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx="19" ry="11" fill="#c9bfa8" stroke="#2B2440" strokeWidth="3" />
          <text x={x} y={y + 6} textAnchor="middle" fontFamily="Andika, Nunito, sans-serif" fontWeight="700" fontSize="18" fill="#2B2440">
            {l}
          </text>
        </g>
      ))}
      <g className="muestra-salto">
        <ellipse cx="70" cy="74" rx="17" ry="14" fill="#FFD166" stroke="#2B2440" strokeWidth="3" />
        <circle cx="76" cy="70" r="2.5" fill="#2B2440" />
        <path d="M84 74 l8 2 l-8 3 z" fill="#E0A82E" stroke="#2B2440" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function MuestraEstela() {
  const d = "M22 128 L60 22 L98 128 M38 86 L82 86";
  return (
    <svg viewBox="0 0 120 150" className="muestra w-24 sm:w-32" aria-hidden="true">
      <path d={d} fill="none" stroke="#ddd5f3" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path className="muestra-trazo" pathLength={1} d={d} fill="none" stroke="#5e4e9a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
