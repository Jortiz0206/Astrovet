/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Grupo } from "../../componentes/Criatura";
import Dibujo from "../../componentes/Dibujo";
import Icono from "../../componentes/Icono";
import MisiDice from "../../componentes/MisiDice";
import { useJuego } from "../../contexto/Juego";
import { CUIDADOS, PASOS_VISITA, cuidadosPara, enFrase, pacientes, rondasClinica, type IdCuidado, type Paciente } from "../../datos/clinica";
import { Bloque, Destello, entrada, tamanoTexto, type EstadoBloque } from "../../juego/actividades/comunes";
import * as api from "../../servicios/api";
import { alAzar, callar, decirContenido, efecto, hablar } from "../../servicios/audio";

/**
 * Clínica veterinaria (catálogo, sección 6). La sala de espera es un cuarto
 * de la casa (/juego/casa/clinica): allí el niño toca a un animal y Misi
 * propone un cuidado. Esta página es la visita: cada acierto es un paso del
 * tratamiento y con 5 el animal queda feliz y deja un sello en su ficha. Sin
 * patitas, sin límite de intentos, sin cambiar el progreso; un error nunca
 * empeora al animal.
 */
export default function Clinica() {
  const { jugador, estados, setMundoVisual } = useJuego();
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const [juego, setJuego] = useState<IdCuidado | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => setMundoVisual(0), [setMundoVisual]);

  const lista = useMemo(() => pacientes(estados), [estados]);
  const paciente = lista.find((p) => p.nombre === params.get("animal"));
  if (!jugador) return null;
  if (!paciente) return <Navigate to="/juego/casa/clinica" replace />;

  const pedido = params.get("cuidado") as IdCuidado | null;
  const disponibles = cuidadosPara(paciente);
  const actual = juego ?? (pedido && disponibles.includes(pedido) ? pedido : disponibles[0]);

  return (
    <Visita
      key={`${actual}-${n}`}
      paciente={paciente}
      juego={actual}
      otros={disponibles.filter((c) => c !== actual)}
      onOtro={(j) => {
        efecto("toque");
        setJuego(j);
        setN((k) => k + 1);
      }}
      onSalir={() => {
        callar();
        navegar(`/juego/casa/clinica?desde=${encodeURIComponent(paciente.nombre)}`, { viewTransition: true });
      }}
      onSello={() => {}}
    />
  );
}

// ======================= Una visita =======================

function Visita({
  paciente,
  juego,
  otros,
  onOtro,
  onSalir,
  onSello,
}: {
  paciente: Paciente;
  juego: IdCuidado;
  otros: IdCuidado[];
  onOtro: (j: IdCuidado) => void;
  onSalir: () => void;
  onSello: () => void;
}) {
  const { jugador, sesion, setEnActividad } = useJuego();
  const cuidado = CUIDADOS[juego];
  const rondas = useMemo(() => rondasClinica(paciente, juego), [paciente, juego]);
  const [paso, setPaso] = useState(0);
  const [errores, setErrores] = useState(0);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const [acierto, setAcierto] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState(`${cuidado.malestar(paciente)} ${cuidado.consigna(paciente)}`);
  const terminado = paso >= PASOS_VISITA;
  const ronda = rondas[Math.min(paso, PASOS_VISITA - 1)];
  const inicioPaso = useRef(Date.now());
  const repeticiones = useRef(0);
  const lectura = juego === "CL-04";

  useEffect(() => {
    setEnActividad(true);
    return () => setEnActividad(false);
  }, [setEnActividad]);

  /** Lo que se escucha en cada paso (en la lectura no se dice la palabra). */
  const decirObjetivo = useCallback(
    (conConsigna: boolean) => {
      const r = rondas[Math.min(paso, PASOS_VISITA - 1)];
      const antes = conConsigna ? [`${cuidado.malestar(paciente)} ${cuidado.consigna(paciente)}`] : [];
      switch (juego) {
        case "CL-01":
          void hablar(antes).then(() => {
            efecto("latido");
            window.setTimeout(() => void hablar({ c: r.objetivo }, { interrumpir: false }), 520);
          });
          break;
        case "CL-02":
          void hablar([...antes, "Une", { c: r.objetivo }]);
          break;
        case "CL-03":
          void hablar([...antes, "Quiero el jarabe de", { c: r.objetivo }]);
          break;
        case "CL-04":
          void hablar(antes.length ? antes : ["Mira lo que quiere y busca el plato."]);
          break;
        case "CL-05":
          void hablar([...antes, "Burbujas de", { c: r.objetivo }]);
          break;
      }
    },
    [rondas, paso, juego, cuidado, paciente],
  );

  // Al llegar cada paso: se dice qué se busca (la primera vez con la consigna).
  useEffect(() => {
    if (terminado) return;
    inicioPaso.current = Date.now();
    repeticiones.current = 0;
    const t = window.setTimeout(() => decirObjetivo(paso === 0), paso === 0 ? 350 : 250);
    return () => window.clearTimeout(t);
  }, [paso, terminado, decirObjetivo]);

  function escuchar() {
    repeticiones.current += 1;
    decirObjetivo(false);
  }

  /** Cómo se dice una opción: en el vendaje se oye la sílaba que queda armada. */
  const sonidoDe = (op: string) => (juego === "CL-02" ? (ronda.base ?? "") + op : op);

  function elegir(op: string) {
    if (terminado || acierto) return;
    const correcta = op === ronda.respuesta;
    if (sesion && jugador) {
      api.registrarIntento({
        idSesion: sesion.id,
        idMision: paciente.misiones[paciente.misiones.length - 1],
        idActividad: juego,
        contenido: ronda.objetivo,
        respuesta: sonidoDe(op),
        correcta,
        tiempoMs: Date.now() - inicioPaso.current,
        ayuda: errores >= 2,
        repeticionesAudio: repeticiones.current,
        practica: true,
      });
    }
    if (correcta) {
      setAcierto(op);
      efecto(juego === "CL-05" ? "burbuja" : "acierto", paso);
      const ultimo = paso + 1 >= PASOS_VISITA;
      const frase = ultimo ? cuidado.cierre(paciente) : alAzar(FRASES_PASO[juego]);
      setMensaje(frase);
      if (!lectura) void decirContenido(sonidoDe(op)).then(() => hablar(frase, { interrumpir: false }));
      else void hablar(frase);
      window.setTimeout(() => {
        setAcierto(null);
        setErrores(0);
        setDescartadas([]);
        setPaso((p) => p + 1);
        if (ultimo && jugador) {
          efecto("rescate");
          void api.registrarCuidado(jugador.id, paciente.nombre, juego).then(onSello);
        }
      }, 1100);
      return;
    }
    // Un error nunca empeora al animal: se explica qué se eligió y qué se busca.
    efecto("intento");
    const n = errores + 1;
    setErrores(n);
    if (juego !== "CL-05") setDescartadas((d) => [...d, op]);
    if (lectura) {
      const texto = n >= 2 ? "Mira el plato que brilla. ¿Dice lo mismo que el dibujo?" : `Ese plato dice ${op}. Mira otra vez lo que quiere.`;
      setMensaje(texto);
      void hablar(n >= 2 ? texto : ["Ese plato dice", { c: op }, ". Mira otra vez lo que quiere."]);
      return;
    }
    const texto = n >= 2 ? "Fíjate en el que brilla y escucha otra vez." : "Casi. Escucha otra vez.";
    setMensaje(texto);
    void hablar(["Esa es", { c: sonidoDe(op) }, ". Buscamos", { c: ronda.objetivo }, n >= 2 ? ". Fíjate en el que brilla." : "."]);
  }

  function estado(op: string): EstadoBloque {
    if (acierto === op) return "correcto";
    if (descartadas.includes(op)) return "descartado";
    if (errores >= 2 && op === ronda.respuesta) return "brilla";
    return "normal";
  }

  if (!jugador) return null;
  const restante = PASOS_VISITA - paso;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-4 px-4 py-4">
      <div className="flex w-full flex-wrap items-center gap-2">
        <button type="button" onClick={onSalir} className="flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-bold ring-1 ring-white/15 hover:bg-white/20">
          <Icono nombre="flecha-izq" tamano={20} />
          Sala de espera
        </button>
        <h1 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
          <Icono nombre="clinica" tamano={26} className="text-rosa" />
          {cuidado.nombre}
        </h1>
      </div>

      <MisiDice mensaje={mensaje} pelaje={jugador.pelaje} personaje={jugador.personaje} variante={jugador.pelajes?.[jugador.personaje ?? "misi"]} animo={terminado ? "feliz" : "habla"} tamano={76} onEscuchar={lectura ? () => hablar(mensaje) : escuchar} />

      <div className="grid w-full items-center gap-5 md:grid-cols-[minmax(0,17rem)_1fr]">
        {/* El paciente y su tratamiento */}
        <div className="flex flex-col items-center gap-3">
          <div className={`camilla relative grid size-48 place-items-center rounded-[2.25rem] sm:size-64 ${terminado ? "camilla-lista" : ""}`}>
            <span className={terminado ? "paciente-feliz" : "animal-respira"}>
              <Grupo claves={paciente.claves} tamano={paciente.claves.length > 1 ? 120 : 160} titulo={paciente.nombre} />
            </span>
            {!terminado ? <Malestar juego={juego} paso={paso} restante={restante} /> : <Destello />}
            {lectura && !terminado ? (
              <span className="globo-pensar" aria-label={`${paciente.nombre}: ${paciente.plural ? "quieren" : "quiere"} comer esto`}>
                <Dibujo palabra={ronda.objetivo} tamano={64} />
              </span>
            ) : null}
          </div>
          <ol className="flex gap-2" aria-label={`Tratamiento: ${Math.min(paso, PASOS_VISITA)} de ${PASOS_VISITA} pasos`}>
            {Array.from({ length: PASOS_VISITA }, (_, i) => (
              <li key={i} className={`paso-cuidado ${i < paso ? "paso-hecho" : ""}`} aria-hidden="true">
                <Icono nombre="patita" tamano={16} />
              </li>
            ))}
          </ol>
        </div>

        {/* El juego de cuidado */}
        <div className="flex min-h-64 flex-col items-center justify-center gap-5">
          {terminado ? (
            <div className="sello-final flex flex-col items-center gap-4 text-center">
              <span className="sello-grande" aria-hidden="true">
                <Icono nombre="patita" tamano={54} />
              </span>
              <p className="text-2xl font-black">¡Sello de cuidado para {enFrase(paciente.nombre)}!</p>
              <div className="flex flex-wrap justify-center gap-3">
                {otros.length ? (
                  <button type="button" onClick={() => onOtro(otros[Math.floor(Math.random() * otros.length)])} className="boton-juego flex min-h-14 items-center gap-2 rounded-full px-6 text-lg font-black">
                    <Icono nombre="clinica" tamano={20} />
                    Otro cuidado
                  </button>
                ) : null}
                <button type="button" onClick={onSalir} className="boton-juego-secundario flex min-h-14 items-center gap-2 rounded-full px-6 text-lg font-black">
                  Sala de espera
                </button>
              </div>
            </div>
          ) : (
            <>
              {juego === "CL-01" ? (
                <div className="flex flex-col items-center gap-5">
                  <button type="button" onClick={escuchar} className="estetoscopio flex min-h-14 items-center gap-3 rounded-full px-6 text-lg font-black" aria-label="Escuchar el latido otra vez">
                    <IconoMalestar juego="CL-01" />
                    Escuchar el latido
                  </button>
                  <div className="grid grid-cols-3 gap-4">
                    {ronda.opciones.map((op, i) => (
                      <Bloque key={`${paso}-${op}`} indice={i} estado={estado(op)} disabled={descartadas.includes(op)} onClick={() => elegir(op)} etiqueta={op.length === 1 ? `Letra ${op}` : op} className="size-24 sm:size-32">
                        <span className={`font-lectura font-bold ${tamanoTexto(op, true)}`}>{op}</span>
                      </Bloque>
                    ))}
                  </div>
                </div>
              ) : null}

              {juego === "CL-02" ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center rounded-[2rem] p-2">
                    <span className="bloque bloque-fijo grid h-28 w-24 place-items-center rounded-l-[1.75rem] rounded-r-lg sm:h-32 sm:w-28">
                      <span className="font-lectura text-6xl font-bold sm:text-7xl">{ronda.base}</span>
                    </span>
                    <span className={`hueco relative -ml-1 grid h-28 w-24 place-items-center rounded-l-lg rounded-r-[1.75rem] sm:h-32 sm:w-28 ${acierto ? "hueco-lleno" : "hueco-vacio"}`}>
                      {acierto ? <span className="pieza-encaja font-lectura text-6xl font-bold text-tinta sm:text-7xl">{acierto}</span> : null}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {ronda.opciones.map((v, i) => (
                      <Bloque key={`${paso}-${v}`} indice={i} estado={estado(v)} disabled={descartadas.includes(v)} onClick={() => elegir(v)} etiqueta={`Vocal ${v}`} className="size-24 sm:size-28">
                        <span className="font-lectura text-6xl font-bold">{v}</span>
                      </Bloque>
                    ))}
                  </div>
                </div>
              ) : null}

              {juego === "CL-03" ? (
                <div className="flex items-end gap-4 sm:gap-6">
                  {ronda.opciones.map((op, i) => (
                    <button
                      key={`${paso}-${op}`}
                      type="button"
                      onClick={() => elegir(op)}
                      disabled={descartadas.includes(op)}
                      aria-label={`Jarabe de ${op}`}
                      style={{ ...entrada(i), "--jarabe": COLORES_JARABE[i % COLORES_JARABE.length] } as CSSProperties}
                      className={`frasco entrar-bloque relative ${estado(op) === "brilla" ? "frasco-brilla" : ""} ${estado(op) === "descartado" ? "frasco-descartado" : ""} ${acierto === op ? "frasco-elegido" : ""}`}
                    >
                      <svg viewBox="0 0 100 140" width="100%" height="100%" aria-hidden="true">
                        <rect x="34" y="6" width="32" height="18" rx="5" fill="#8E7CC3" stroke="#2B2440" strokeWidth="4" />
                        <path d="M30 24 H70 V38 C86 44 92 58 92 74 V122 C92 130 86 136 78 136 H22 C14 136 8 130 8 122 V74 C8 58 14 44 30 38 Z" fill="#F4F1FB" stroke="#2B2440" strokeWidth="4" strokeLinejoin="round" />
                        <path d="M11 84 H89 V122 C89 128 84 133 78 133 H22 C16 133 11 128 11 122 Z" fill="var(--jarabe)" />
                        <rect x="22" y="58" width="56" height="44" rx="12" fill="#fff" stroke="#2B2440" strokeWidth="3" />
                      </svg>
                      <span className={`absolute inset-x-0 top-[44%] font-lectura font-bold text-tinta ${op.length > 1 ? "text-3xl" : "text-4xl"}`}>{op}</span>
                      {acierto === op ? <Destello /> : null}
                    </button>
                  ))}
                </div>
              ) : null}

              {juego === "CL-04" ? (
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  {ronda.opciones.map((op, i) => (
                    <button
                      key={`${paso}-${op}`}
                      type="button"
                      onClick={() => elegir(op)}
                      disabled={descartadas.includes(op)}
                      aria-label={`Plato que dice ${op}`}
                      style={entrada(i)}
                      className={`plato entrar-bloque relative grid size-32 place-items-center rounded-full sm:size-36 ${estado(op) === "brilla" ? "plato-brilla" : ""} ${estado(op) === "descartado" ? "plato-descartado" : ""} ${acierto === op ? "plato-elegido" : ""}`}
                    >
                      <span className="font-lectura text-2xl font-bold text-tinta sm:text-3xl">{op}</span>
                      {acierto === op ? <Destello /> : null}
                    </button>
                  ))}
                </div>
              ) : null}

              {juego === "CL-05" ? (
                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                  {ronda.opciones.map((op, i) => (
                    <button
                      key={`${paso}-${i}`}
                      type="button"
                      onClick={() => elegir(op)}
                      aria-label={`Burbuja ${op}`}
                      style={{ ...entrada(i), animationDelay: `${Math.min(i, 5) * 55}ms, ${i * 0.4}s` }}
                      className={`burbuja-bano relative grid size-24 place-items-center rounded-full sm:size-28 ${errores >= 2 && op === ronda.respuesta ? "burbuja-brilla" : ""} ${acierto !== null && op === acierto ? "burbuja-revienta" : ""}`}
                    >
                      <span className={`font-lectura font-bold text-tinta ${op.length > 1 ? "text-3xl" : "text-4xl"}`}>{op}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {!lectura ? (
                <button type="button" onClick={escuchar} className="boton-juego-secundario flex min-h-12 items-center gap-2 rounded-full px-5 font-bold">
                  <Icono nombre="oreja" tamano={20} />
                  Escuchar otra vez
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

const COLORES_JARABE = ["#FFB7B2", "#8FD9B6", "#FFD166", "#B9A8E6"];

const FRASES_PASO: Record<IdCuidado, string[]> = {
  "CL-01": ["¡Late muy bien!", "¡Eso es! Otro latido.", "¡Muy bien escuchado!"],
  "CL-02": ["¡Una vuelta de venda!", "¡Otra vuelta! Ya casi.", "¡Qué buena enfermera!"],
  "CL-03": ["¡Ese era! Una cucharada.", "¡Rico! Otra cucharada.", "¡Muy bien!"],
  "CL-04": ["¡Ese plato era! Ñam.", "¡Lo leíste muy bien!", "¡Qué rico!"],
  "CL-05": ["¡Pop! Una mancha menos.", "¡Burbuja reventada!", "¡Brilla un poquito más!"],
};

/** Ícono pequeño del malestar (en la sala de espera y en el botón del estetoscopio). */
export function IconoMalestar({ juego }: { juego: IdCuidado }) {
  const P = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      {juego === "CL-01" ? (
        <>
          <path d="M6 3 V9 a5 5 0 0 0 10 0 V3" {...P} />
          <path d="M11 14 V17 a3 3 0 0 0 6 0 V15" {...P} />
          <circle cx="17" cy="13" r="2.2" {...P} />
        </>
      ) : juego === "CL-02" ? (
        <>
          <rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)" {...P} />
          <path d="M10 10 l1 1 M13 12 l1 1" {...P} />
        </>
      ) : juego === "CL-03" ? (
        <>
          <path d="M9 3 H15 V6 C18 7 19 9 19 12 V19 a2 2 0 0 1 -2 2 H7 a2 2 0 0 1 -2 -2 V12 C5 9 6 7 9 6 Z" {...P} />
          <path d="M5 14 H19" {...P} />
        </>
      ) : juego === "CL-04" ? (
        <>
          <circle cx="12" cy="13" r="8" {...P} />
          <circle cx="12" cy="13" r="4" {...P} />
        </>
      ) : (
        <>
          <circle cx="8" cy="14" r="4" {...P} />
          <circle cx="16" cy="9" r="3" {...P} />
          <circle cx="17" cy="17" r="2" {...P} />
        </>
      )}
    </svg>
  );
}

/** El malestar se ve sobre el animal y se va con cada paso (nunca hay dolor ni sangre). */
function Malestar({ juego, paso, restante }: { juego: IdCuidado; paso: number; restante: number }) {
  const k = restante / PASOS_VISITA;
  return (
    <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
      {juego === "CL-01" ? (
        <g opacity={k} className="estornudo">
          <circle cx="150" cy="58" r="10" fill="#fff" stroke="#9FD3F2" strokeWidth="3" />
          <circle cx="166" cy="42" r="7" fill="#fff" stroke="#9FD3F2" strokeWidth="3" />
          <circle cx="176" cy="26" r="4.5" fill="#fff" stroke="#9FD3F2" strokeWidth="3" />
        </g>
      ) : null}
      {juego === "CL-02" ? (
        <g>
          <ellipse cx="62" cy="168" rx="14" ry="7" fill="#FFB7B2" opacity={paso === 0 ? 0.9 : 0} />
          {paso > 0 ? <rect x="40" y="158" width="46" height="20" rx="10" fill="#fff" stroke="#2B2440" strokeWidth="3" /> : null}
          {Array.from({ length: paso }, (_, i) => (
            <path key={i} d={`M${46 + i * 8} 160 L${50 + i * 8} 176`} stroke="#DDD5F3" strokeWidth="3" strokeLinecap="round" />
          ))}
        </g>
      ) : null}
      {juego === "CL-03" ? (
        <g opacity={k} fontFamily="Nunito, sans-serif" fontWeight="900" fill="#fff" stroke="#2B2440" strokeWidth="1.5">
          <text x="140" y="56" fontSize="20">cof</text>
          <text x="152" y="34" fontSize="14">cof</text>
        </g>
      ) : null}
      {juego === "CL-05"
        ? MANCHAS.map(([x, y, r], i) => (i >= paso ? <circle key={i} cx={x} cy={y} r={r} fill="#9A7351" opacity="0.75" className="mancha" /> : null))
        : null}
    </svg>
  );
}

const MANCHAS: [number, number, number][] = [
  [70, 90, 12],
  [128, 104, 10],
  [92, 140, 13],
  [140, 150, 9],
  [60, 132, 8],
];
