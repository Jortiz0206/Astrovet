import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Grupo } from "../../componentes/Criatura";
import Icono from "../../componentes/Icono";
import type { AnimoMisi } from "../../componentes/Misi";
import MisiDice from "../../componentes/MisiDice";
import { useJuego } from "../../contexto/Juego";
import { ESTACION_VOCALES, obtenerMision, obtenerMundo } from "../../datos/contenido";
import { CONSIGNAS, GUION, SIN_SONIDO_INICIAL, frase } from "../../datos/guion";
import { COMPONENTES, audioRonda, nivelDeAyuda, respuestaDicha, retroalimentacion } from "../../juego/actividades";
import Rescate from "../../juego/Rescate";
import * as api from "../../servicios/api";
import { alAzar, callar, efecto, hablando, hablar, type Locucion } from "../../servicios/audio";

/** Cómo llega una ronda: al empezar, al cambiar de juego o al seguir en el mismo. */
type Llegada = "inicio" | "nuevoJuego" | "otraRonda";

const esperar = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

type Fase = "intro" | "jugando" | "rescate";

/** Reinicia todo el estado al pasar de una misión a otra en la misma ruta. */
export default function MisionConClave() {
  const { id } = useParams();
  return <Mision key={id} />;
}

function Mision() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { jugador, sesion, estados, prefs, setEnActividad, setMundoVisual, refrescar } = useJuego();
  const mision = obtenerMision(id);
  const mundo = mision ? obtenerMundo(mision.idMundo) : undefined;
  const practica = mision?.id === ESTACION_VOCALES.id || params.get("modo") === "practica";

  const [fase, setFase] = useState<Fase>("intro");
  const [iAct, setIAct] = useState(0);
  const [iRonda, setIRonda] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [animo, setAnimo] = useState<AnimoMisi>("feliz");
  const [celebrando, setCelebrando] = useState(false);
  const [resultado, setResultado] = useState<api.ResultadoMision | null>(null);
  const [entregado, setEntregado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const marca = useRef(Date.now());
  const repeticiones = useRef(0);
  const ayudaPedida = useRef(false);
  const huboError = useRef(false);
  const rachaLimpia = useRef(0);
  const vivo = useRef(true);
  const avisoInactivo = useRef(false);

  // Lo que dice Misi al abrir la misión: se elige una vez y se dice solo.
  const [mensajeIntro] = useState(() => {
    if (!mision) return "";
    const lugar = (mision.titulo.split(":")[1] ?? mision.titulo).trim().toLowerCase();
    if (mision.id === ESTACION_VOCALES.id || params.get("modo") === "practica") return "Practiquemos las vocales, sin prisa. ¿Empezamos?";
    const varios = mision.animal.claves.length > 1;
    const datos = { animal: mision.animal.nombre, lugar, esta: varios ? "están" : "está", perdio: varios ? "se perdieron" : "se perdió" };
    return frase(estados[mision.id] === "completado" ? GUION.introOtraVez : GUION.intro, datos, alAzar);
  });

  useEffect(() => {
    if (mision) setMundoVisual(mision.idMundo);
  }, [mision, setMundoVisual]);

  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
      setEnActividad(false);
      callar();
    };
  }, [setEnActividad]);

  // Los niños de 5 a 8 años aún no leen: Misi dice la bienvenida sin que haya que tocar nada.
  useEffect(() => {
    if (fase !== "intro" || !mensajeIntro) return;
    const t = window.setTimeout(() => hablar(mensajeIntro), 450);
    return () => window.clearTimeout(t);
  }, [fase, mensajeIntro]);

  // Si pasa un rato sin respuesta, Misi repite la consigna una vez, con calma.
  useEffect(() => {
    if (fase !== "jugando" || celebrando || !mision || avisoInactivo.current) return;
    const t = window.setInterval(() => {
      if (hablando() || avisoInactivo.current) return;
      if (Date.now() - marca.current < 16000) return;
      avisoInactivo.current = true;
      const act = mision.actividades[iAct];
      const texto = alAzar(GUION.inactivo);
      setMensaje(`${texto} ${CONSIGNAS[act.tipo]}`);
      setAnimo("habla");
      hablar([texto, ...audioRonda(act, act.rondas[iRonda])], { alTerminar: () => setAnimo("feliz") });
    }, 2000);
    return () => window.clearInterval(t);
  }, [fase, celebrando, mision, iAct, iRonda]);

  const estado = mision ? estados[mision.id] : undefined;
  const yaRescatado = estado === "completado";

  const presentar = useCallback(
    (a: number, r: number, llegada: Llegada = "inicio") => {
      if (!mision) return;
      const act = mision.actividades[a];
      const rondaNueva = act.rondas[r];
      setErrores(0);
      huboError.current = false;
      ayudaPedida.current = false;
      avisoInactivo.current = false;
      repeticiones.current = 0;
      marca.current = Date.now();
      setMensaje(CONSIGNAS[act.tipo]);
      setAnimo("habla");
      // La consigna completa se dice al empezar un juego; en las rondas
      // siguientes del mismo juego basta una frase corta y el sonido nuevo.
      const completa = audioRonda(act, rondaNueva);
      const voz: Locucion[] =
        llegada === "nuevoJuego"
          ? [alAzar(GUION.nuevoJuego), ...completa]
          : llegada === "otraRonda" && !SIN_SONIDO_INICIAL.has(act.tipo) && completa.length > 1
            ? [alAzar(GUION.otraRonda), ...completa.slice(1)]
            : completa;
      // Cola, no interrupción: así la celebración anterior termina entera.
      hablar(voz, { interrumpir: false, alTerminar: () => setAnimo("feliz") });
    },
    [mision],
  );

  const alEntregar = useCallback(() => {
    setEntregado(true);
    void refrescar();
  }, [refrescar]);

  if (!mision || !jugador || !sesion) return <Navigate to="/juego/mapa" replace />;
  if (mision.actividades.length === 0) return <Navigate to="/juego/mapa" replace />;
  if (!practica && estado === "bloqueado") return <Navigate to="/juego/mapa" replace />;

  const actividad = mision.actividades[iAct];
  const ronda = actividad.rondas[iRonda];
  const totalRondas = mision.actividades.reduce((t, a) => t + a.rondas.length, 0);
  const rondaGlobal = mision.actividades.slice(0, iAct).reduce((t, a) => t + a.rondas.length, 0) + iRonda;
  const esMemoria = actividad.tipo === "memory_pairs";
  const nivelAyuda = nivelDeAyuda(errores, actividad.tipo);
  const avance = (rondaGlobal + (celebrando ? 1 : 0)) / totalRondas;
  const claves = mision.animal.claves;

  async function empezar() {
    if (!mision || !jugador) return;
    setError(null);
    try {
      if (!practica) await api.iniciarMision(jugador.id, mision.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos abrir la misión.");
      return;
    }
    efecto("toque");
    setEnActividad(true);
    setFase("jugando");
    callar(); // el niño ya eligió empezar: la bienvenida no tiene que terminar
    presentar(0, 0);
  }

  function escucharOtraVez() {
    repeticiones.current += 1;
    setAnimo("habla");
    hablar(audioRonda(actividad, ronda), { alTerminar: () => setAnimo("feliz") });
  }

  function decir(texto: string, extra: Locucion[] = [], voz?: Locucion[]): Promise<void> {
    setMensaje(texto);
    setAnimo("habla");
    return hablar([...(voz ?? [texto]), ...extra], { interrumpir: false, alTerminar: () => setAnimo("feliz") });
  }

  function onRespuesta(respuesta: string, correcta: boolean, terminada: boolean) {
    if (!mision || !sesion) return;
    const ahora = Date.now();
    api.registrarIntento({
      idSesion: sesion.id,
      idMision: mision.id,
      idActividad: actividad.id,
      contenido: esMemoria && correcta ? respuesta : ronda.objetivo,
      respuesta,
      correcta,
      tiempoMs: ahora - marca.current,
      ayuda: nivelAyuda > 0 || ayudaPedida.current,
      repeticionesAudio: repeticiones.current,
      practica,
    });
    marca.current = ahora;
    repeticiones.current = 0;

    if (correcta) {
      const n = aciertos + 1;
      setAciertos(n);
      if (!terminada) {
        efecto("paso", n);
        const frases = actividad.tipo === "build_word_syllables" ? GUION.pieza : actividad.tipo === "stepping_stones" ? GUION.cruza : GUION.paso;
        setMensaje(alAzar(frases));
        return;
      }
      setCelebrando(true);
      efecto("acierto", Math.min(n, 6));
      const conAyuda = nivelAyuda >= 3;
      rachaLimpia.current = huboError.current ? 0 : rachaLimpia.current + 1;
      const lista = conAyuda
        ? GUION.aciertoConAyuda
        : huboError.current
          ? GUION.aciertoTrasError
          : rachaLimpia.current > 0 && rachaLimpia.current % 3 === 0
            ? GUION.racha
            : actividad.tipo === "feed_animal"
              ? GUION.regalo
              : GUION.acierto;
      const textos: string[] = [alAzar(lista)];
      // A la mitad de la misión, Misi lo cuenta (la niebla del animal ya se aclara).
      const hechas = rondaGlobal + 1;
      if (totalRondas >= 6 && hechas === Math.ceil(totalRondas / 2)) textos.push(alAzar(GUION.mitad));
      const dicho = decir(textos.join(" "), [], textos);
      // Se avanza cuando Misi terminó la frase (y la celebración se vio), nunca a mitad.
      const a = iAct;
      const r = iRonda;
      void Promise.race([Promise.all([dicho, esperar(1300)]), esperar(8000)]).then(() => {
        if (vivo.current) avanzar(a, r);
      });
      return;
    }

    huboError.current = true;
    const n = errores + 1;
    setErrores(n);
    efecto("intento");
    const nivel = nivelDeAyuda(n, actividad.tipo);
    if (esMemoria) {
      decir(nivel >= 2 ? GUION.pista2[0] : alAzar(GUION.memoriaNo));
      return;
    }
    // 1-2 errores: retroalimentación (qué eligió y qué se busca). 3-4: pista visual. 5+: Misi ayuda.
    if (nivel <= 1) {
      // 1.º error: qué eligió y qué se busca. 2.º: lo mismo, ánimo y el sonido otra vez.
      const retro = retroalimentacion(actividad, ronda, respuesta);
      const casi = alAzar(GUION.casi);
      if (n === 1) decir(`${casi} ${retro.texto}`, [], [casi, ...retro.voz]);
      else {
        const animo2 = alAzar(GUION.sigueIntentando);
        const sonido = audioRonda(actividad, ronda).slice(1);
        decir(`${retro.texto} ${animo2}`, sonido, [...retro.voz, animo2]);
      }
    } else if (nivel === 2) decir(alAzar(GUION.pista2), [respuestaDicha(actividad, ronda)].filter(() => n === 4));
    else decir(alAzar(GUION.pista3), [respuestaDicha(actividad, ronda)]);
  }

  function avanzar(a: number, r: number) {
    if (!mision) return;
    setCelebrando(false);
    const act = mision.actividades[a];
    if (r + 1 < act.rondas.length) {
      setIRonda(r + 1);
      presentar(a, r + 1, "otraRonda");
    } else if (a + 1 < mision.actividades.length) {
      setIAct(a + 1);
      setIRonda(0);
      presentar(a + 1, 0, "nuevoJuego");
    } else {
      void terminar();
    }
  }

  async function terminar() {
    if (!mision || !jugador || !sesion) return;
    callar();
    if (practica) {
      setResultado(null);
      setFase("rescate");
      efecto("rescate");
      decir("¡Qué buena práctica! Las vocales te conocen muy bien.");
      return;
    }
    try {
      const res = await api.completarMision(jugador.id, mision.id, sesion.id);
      setResultado(res);
      setFase("rescate");
      efecto("rescate");
      const varios = mision.animal.claves.length > 1;
      const datos = { animal: mision.animal.nombre, esta: varios ? "están" : "está" };
      const textos = [frase(res.primeraVez ? GUION.rescate : GUION.repaso, datos, alAzar)];
      if (res.primeraVez) textos.push(`Ganaste ${res.patitasGanadas} patitas doradas.`);
      const sigue = res.siguiente && obtenerMundo(res.siguiente.idMundo)?.disponible && res.siguiente.actividades.length > 0;
      if (res.primeraVez && (!res.siguiente || res.siguiente.idMundo !== mision.idMundo)) textos.push(alAzar(GUION.finMundo));
      if (sigue) textos.push(alAzar(GUION.siguiente));
      setMensaje(textos.join(" "));
      setAnimo("habla");
      window.setTimeout(() => hablar(textos, { alTerminar: () => setAnimo("feliz") }), 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos guardar la misión.");
    }
  }

  function salirA(ruta: string) {
    setEnActividad(false);
    navegar(ruta, { viewTransition: true });
  }

  const siguiente = resultado?.siguiente;
  const siguienteJugable = siguiente && obtenerMundo(siguiente.idMundo)?.disponible && siguiente.actividades.length > 0;
  const volverA = practica ? "/juego" : `/juego/mapa?mundo=${mision.idMundo}`;

  // ---------- Pantallas ----------

  if (fase === "intro") {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-7 px-4 py-8 text-center">
        <div className="intro-animal relative grid size-52 place-items-center sm:size-60">
          <span className="rescate-halo absolute inset-0 rounded-full" aria-hidden="true" />
          {practica ? (
            <span className="relative grid size-36 place-items-center rounded-full bg-white/10 text-white">
              <Icono nombre="letras" tamano={84} />
            </span>
          ) : (
            <span className={`relative ${yaRescatado ? "" : "niebla-total"}`}>
              <Grupo claves={claves} tamano={168} titulo={mision.animal.nombre} />
            </span>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-balance text-3xl font-black text-white sm:text-4xl">{mision.titulo}</h1>
          <p className="font-bold text-white/75">{practica ? "Práctica libre" : `${mundo?.nombre} · ${mision.contenido}`}</p>
        </div>
        <MisiDice mensaje={mensajeIntro} pelaje={jugador.pelaje} onEscuchar={() => hablar(mensajeIntro)} />
        {error ? <p className="rounded-xl bg-rosa-claro px-4 py-2 font-bold text-tinta">{error}</p> : null}
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={empezar} className="boton-juego flex min-h-18 items-center gap-3 rounded-full px-10 text-2xl font-black">
            <Icono nombre="cohete" tamano={30} />
            ¡Vamos!
          </button>
          <button type="button" onClick={() => salirA(volverA)} className="grid min-h-18 place-items-center rounded-full px-6 font-bold text-white/80 hover:text-white">
            Volver
          </button>
        </div>
      </section>
    );
  }

  if (fase === "rescate") {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
        {practica ? (
          <div className="rescate-practica grid size-56 place-items-center rounded-full bg-dorado/15 text-dorado">
            <Icono nombre="estrella" tamano={120} />
          </div>
        ) : (
          <Rescate
            revelado={mundo?.revelado ?? "nube"}
            claves={claves}
            nombre={mision.animal.nombre}
            patitas={resultado?.primeraVez ? resultado.patitasGanadas : 0}
            sinMovimiento={!prefs.movimiento}
            onPatitasEntregadas={alEntregar}
          />
        )}
        <h1 className="rescate-titulo text-balance text-3xl font-black text-white sm:text-4xl">
          {practica ? "¡Práctica terminada!" : `¡${mision.animal.nombre} ${claves.length > 1 ? "están" : "está"} a salvo!`}
        </h1>
        <MisiDice mensaje={mensaje} pelaje={jugador.pelaje} animo={animo} onEscuchar={() => hablar(mensaje)} />
        <div className={`flex flex-wrap justify-center gap-3 transition-opacity duration-300 ${entregado || practica || !resultado?.primeraVez ? "opacity-100" : "opacity-0"}`}>
          {siguienteJugable ? (
            <button type="button" className="boton-juego flex min-h-18 items-center gap-2 rounded-full px-8 text-xl font-black" onClick={() => salirA(`/juego/mision/${siguiente.id}`)}>
              Siguiente misión
              <Icono nombre="flecha-der" tamano={26} />
            </button>
          ) : null}
          <button
            type="button"
            className={`${siguienteJugable ? "boton-juego-secundario" : "boton-juego"} flex min-h-18 items-center gap-2 rounded-full px-8 text-xl font-black`}
            onClick={() => salirA(volverA)}
          >
            <Icono nombre={practica ? "casa" : "mapa"} tamano={24} />
            {practica ? "Centro espacial" : "Volver al mapa"}
          </button>
        </div>
      </section>
    );
  }

  const Componente = COMPONENTES[actividad.tipo];

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-5 px-4 pt-3 pb-10">
      <div className="flex w-full items-center gap-3">
        <button
          type="button"
          onClick={() => salirA(volverA)}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
          aria-label="Salir de la misión"
        >
          <Icono nombre="cerrar" tamano={22} />
        </button>
        <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-white/12" role="progressbar" aria-valuemin={0} aria-valuemax={totalRondas} aria-valuenow={rondaGlobal} aria-label={`Paso ${rondaGlobal + 1} de ${totalRondas}`}>
          <span className="barra-avance absolute inset-y-0 left-0 w-full origin-left rounded-full" style={{ transform: `scaleX(${Math.max(0.04, avance)})` }} />
        </div>
        {/* El animal aparece entre la niebla a medida que se avanza (principio 12). */}
        <span className="relative grid size-14 shrink-0 place-items-center" aria-hidden="true">
          {practica ? (
            <Icono nombre="letras" tamano={34} className="text-white" />
          ) : (
            <span className="niebla-animal" style={{ filter: `blur(${(1 - avance) * 6}px) saturate(${0.35 + avance * 0.65})`, opacity: 0.45 + avance * 0.55 }}>
              <Grupo claves={claves} tamano={56} />
            </span>
          )}
        </span>
      </div>

      <MisiDice mensaje={mensaje} pelaje={jugador.pelaje} animo={animo} onEscuchar={escucharOtraVez} />

      <div className="flex w-full flex-1 items-center justify-center py-2">
        <Componente
          key={`${iAct}-${iRonda}`}
          ronda={ronda}
          nivelAyuda={nivelAyuda}
          bloqueado={celebrando}
          paso={aciertos}
          animal={claves.length ? claves : undefined}
          onRespuesta={onRespuesta}
          onAyuda={() => {
            ayudaPedida.current = true;
            repeticiones.current += 1;
          }}
        />
      </div>
    </section>
  );
}
