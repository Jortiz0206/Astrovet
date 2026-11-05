import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { GUION } from "../../datos/guion";
import Rescate from "../../juego/Rescate";
import { COMPONENTES, audioRonda, nivelDeAyuda, respuestaDicha, retroalimentacion } from "../../juego/actividades";
import { alAzar, callar, efecto, hablar, type Locucion } from "../../servicios/audio";
import type { Actividad } from "../../tipos";
import Icono from "../Icono";
import Misi, { type AnimoMisi } from "../Misi";
import MisiDice from "../MisiDice";
import type { ControlEstrellas } from "./Estrellas";
import NieblaAda from "./NieblaAda";

/** Las tres rondas de la demostración: tres juegos distintos, un solo sonido. */
const RONDAS: Actividad[] = [
  { id: "demo-globos", tipo: "balloon_pop", rondas: [{ objetivo: "A", respuesta: "A", opciones: ["A", "E", "O", "U"], meta: 3 }] },
  {
    id: "demo-piedras",
    tipo: "stepping_stones",
    rondas: [{ objetivo: "A", respuesta: "A", opciones: ["A"], filas: [["A", "E"], ["A", "O"], ["A", "U"]] }],
  },
  { id: "demo-traza", tipo: "trace_letter", rondas: [{ objetivo: "A", respuesta: "A", opciones: ["A"] }] },
];

const ENTRE_RONDAS = [
  "¡Se fue una nube! Ya veo algo amarillo.",
  "¡Otra nube menos! Escucho un zumbido.",
];

export interface ResumenDemo {
  errores: number;
  pistas: number;
}

type Fase = "inicio" | "jugando" | "rescate";

const esperar = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** Cambia de escena con View Transitions cuando el navegador las tiene. */
function cambiarEscena(fn: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (doc.startViewTransition && !reducido) doc.startViewTransition(() => flushSync(fn));
  else fn();
}

/**
 * La primera pantalla de la landing es una misión de verdad: Ada se perdió
 * en la niebla y el visitante (adulto, a veces con el niño) la rescata en
 * tres rondas. Usa los mismos juegos, la misma voz y la misma ayuda
 * progresiva que la app.
 */
export default function MiniMision({
  estrellas,
  onTerminar,
  onIrACuenta,
  onPatitas,
}: {
  estrellas: React.RefObject<ControlEstrellas | null>;
  onTerminar: (r: ResumenDemo) => void;
  onIrACuenta: () => void;
  onPatitas: () => void;
}) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [iRonda, setIRonda] = useState(0);
  const [capas, setCapas] = useState(3);
  const [errores, setErrores] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [celebrando, setCelebrando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [animo, setAnimo] = useState<AnimoMisi>("feliz");
  const [entregado, setEntregado] = useState(false);
  const [vuelta, setVuelta] = useState(0);
  const resumen = useRef<ResumenDemo>({ errores: 0, pistas: 0 });
  const huboError = useRef(false);

  const actividad = RONDAS[iRonda];
  const ronda = actividad.rondas[0];
  const nivelAyuda = nivelDeAyuda(errores, actividad.tipo);

  function decir(texto: string, voz?: Locucion[], extra: Locucion[] = []) {
    setMensaje(texto);
    setAnimo("habla");
    return hablar([...(voz ?? [texto]), ...extra], { interrumpir: false, alTerminar: () => setAnimo("feliz") });
  }

  function presentar(i: number) {
    const act = RONDAS[i];
    const r = act.rondas[0];
    setMensaje(consigna(act));
    setAnimo("habla");
    hablar(audioRonda(act, r), { interrumpir: false, alTerminar: () => setAnimo("feliz") });
  }

  function empezar() {
    efecto("toque");
    estrellas.current?.saltar();
    cambiarEscena(() => {
      setFase("jugando");
      setIRonda(0);
      setCapas(3);
      setErrores(0);
      setAciertos(0);
    });
    resumen.current = { errores: 0, pistas: 0 };
    callar();
    window.setTimeout(() => presentar(0), 450);
  }

  function onRespuesta(respuesta: string, correcta: boolean, terminada: boolean) {
    if (correcta) {
      const n = aciertos + 1;
      setAciertos(n);
      if (!terminada) {
        efecto("paso", n);
        setMensaje(alAzar(actividad.tipo === "stepping_stones" ? GUION.cruza : GUION.paso));
        return;
      }
      setCelebrando(true);
      efecto("acierto", Math.min(n, 6));
      const siguiente = iRonda + 1;
      setCapas(3 - siguiente);
      if (siguiente < RONDAS.length) {
        const dicho = decir(`${alAzar(huboError.current ? GUION.aciertoTrasError : GUION.acierto)} ${ENTRE_RONDAS[iRonda]}`);
        huboError.current = false;
        // Se cambia de escena cuando Misi terminó la frase, no a mitad.
        void Promise.race([Promise.all([dicho, esperar(1500)]), esperar(8000)]).then(() => {
          estrellas.current?.saltar();
          cambiarEscena(() => {
            setCelebrando(false);
            setErrores(0);
            setIRonda(siguiente);
          });
          window.setTimeout(() => presentar(siguiente), 500);
        });
      } else {
        window.setTimeout(() => {
          estrellas.current?.saltar();
          efecto("rescate");
          cambiarEscena(() => {
            setCelebrando(false);
            setFase("rescate");
          });
          decir("¡Encontramos a Ada! Así se siente una misión en AstroVet.");
          onTerminar({ ...resumen.current });
        }, 1100);
      }
      return;
    }
    // Sin castigo: primero retroalimentación, luego una pista visual y al final Misi ayuda.
    const n = errores + 1;
    setErrores(n);
    huboError.current = true;
    resumen.current.errores += 1;
    efecto("intento");
    const nivel = nivelDeAyuda(n, actividad.tipo);
    if (nivel >= 2) resumen.current.pistas += 1;
    if (nivel <= 1) {
      const retro = retroalimentacion(actividad, ronda, respuesta);
      const casi = alAzar(GUION.casi);
      if (n === 1) decir(`${casi} ${retro.texto}`, [casi, ...retro.voz]);
      else {
        const animo2 = alAzar(GUION.sigueIntentando);
        decir(`${retro.texto} ${animo2}`, [...retro.voz, animo2], audioRonda(actividad, ronda).slice(1));
      }
    } else if (nivel === 2) decir(alAzar(GUION.pista2), undefined, n === 4 ? [respuestaDicha(actividad, ronda)] : []);
    else decir(alAzar(GUION.pista3), undefined, [respuestaDicha(actividad, ronda)]);
  }

  const alEntregar = useCallback(() => {
    setEntregado(true);
    onPatitas();
  }, [onPatitas]);

  function otraVez() {
    callar();
    setEntregado(false);
    setVuelta((v) => v + 1);
    empezar();
  }

  function escuchar() {
    setAnimo("habla");
    hablar(fase === "jugando" ? audioRonda(actividad, ronda) : [mensaje], { alTerminar: () => setAnimo("feliz") });
  }

  if (fase === "inicio") {
    return (
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 px-4 pt-4 pb-14 md:grid-cols-[1.05fr_1fr] md:gap-10">
        <div className="demo-entra order-2 text-white md:order-1">
          <h1 className="titulo-demo text-balance">¡Ada se perdió en la niebla!</h1>
          <p className="mt-4 max-w-[34rem] text-lg leading-relaxed text-white/85 sm:text-xl">
            Capitán Misi necesita ayuda para encontrarla. Es una misión de un minuto, igual a las que juega tu hijo en AstroVet: escucha, toca y
            mira cómo se despeja la niebla.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <button type="button" onClick={empezar} className="boton-juego boton-despegar flex min-h-16 items-center gap-3 rounded-full px-8 text-xl font-black">
              <Icono nombre="cohete" tamano={26} />
              Ayudar a Ada
            </button>
            <a href="#como" className="font-extrabold text-lavanda-claro underline decoration-2 underline-offset-4 hover:text-white">
              Ver cómo aprende tu hijo
            </a>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm font-bold text-white/65">
            <Icono nombre="altavoz" tamano={18} />
            Sube el volumen: Misi habla.
          </p>
        </div>
        <div className="demo-entra demo-entra-2 relative order-1 mx-auto grid place-items-center md:order-2">
          <NieblaAda capas={3} tamano={typeof window !== "undefined" && window.innerWidth < 640 ? 210 : 320} className="niebla-grande" />
          <div className="misi-viaja absolute -bottom-4 -left-10 sm:-left-16">
            <div className="animate-flotar">
              <Misi tamano={typeof window !== "undefined" && window.innerWidth < 640 ? 104 : 150} animo="piensa" titulo="Capitán Misi, el gato astronauta veterinario" />
            </div>
          </div>
          <p className="globo absolute -top-2 -right-2 max-w-48 rounded-2xl px-4 py-2 text-base font-extrabold text-tinta sm:right-0">¿Me ayudas a encontrarla?</p>
        </div>
      </div>
    );
  }

  if (fase === "rescate") {
    return (
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-5 px-4 pt-2 pb-14 text-center">
        <Rescate key={vuelta} revelado="nube" claves={["abeja"]} nombre="Ada" patitas={10} sinMovimiento={false} onPatitasEntregadas={alEntregar} />
        <h2 className="rescate-titulo titulo-demo text-balance">¡Ada está a salvo!</h2>
        <MisiDice mensaje={mensaje} animo={animo} onEscuchar={escuchar} tamano={84} />
        <p className={`max-w-xl text-lg text-white/80 transition-opacity duration-300 ${entregado ? "opacity-100" : "opacity-0"}`}>
          En su primera misión, Ada vuelve a perderse. Esta vez la rescata tu hijo, con su nombre, su avatar y su propio ritmo.
        </p>
        <div className={`flex flex-wrap justify-center gap-3 transition-opacity duration-300 ${entregado ? "opacity-100" : "opacity-0"}`}>
          <button type="button" onClick={onIrACuenta} className="boton-juego flex min-h-16 items-center gap-2 rounded-full px-8 text-xl font-black">
            Crear la cuenta de mi hijo
          </button>
          <button type="button" onClick={otraVez} className="boton-juego-secundario flex min-h-16 items-center gap-2 rounded-full px-7 text-lg font-black">
            <Icono nombre="girar" tamano={22} />
            Jugar otra vez
          </button>
        </div>
      </div>
    );
  }

  const Componente = COMPONENTES[actividad.tipo];
  return (
    <div className="juego relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-4 px-4 pt-1 pb-10" data-mundo="1">
      <div className="flex w-full items-center gap-3">
        <MisiDice mensaje={mensaje} animo={animo} onEscuchar={escuchar} tamano={80} />
        <NieblaAda capas={capas} tamano={96} className="shrink-0 max-sm:hidden" />
      </div>
      <ol className="flex items-center gap-2" aria-label={`Ronda ${iRonda + 1} de ${RONDAS.length}`}>
        {RONDAS.map((r, i) => (
          <li key={r.id} className={`ronda-punto ${i < iRonda ? "ronda-hecha" : i === iRonda ? "ronda-actual" : ""}`} aria-hidden="true" />
        ))}
      </ol>
      <div className="escena-ronda flex w-full flex-1 items-center justify-center">
        <Componente
          key={`${vuelta}-${iRonda}`}
          ronda={ronda}
          nivelAyuda={nivelAyuda}
          bloqueado={celebrando}
          paso={aciertos}
          animal={["pato"]}
          onRespuesta={onRespuesta}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          callar();
          estrellas.current?.saltar();
          setCapas(0);
          cambiarEscena(() => setFase("rescate"));
          setMensaje("Ada ya está a salvo. Cuando quieras, juega la misión completa.");
          onTerminar({ ...resumen.current });
        }}
        className="text-sm font-bold text-white/60 underline underline-offset-4 hover:text-white"
      >
        Saltar la misión
      </button>
    </div>
  );
}

function consigna(act: Actividad): string {
  const l = audioRonda(act, act.rondas[0]);
  return l.map((x) => (typeof x === "string" ? x : `«${x.c.toLowerCase()}»`)).join(" ");
}
