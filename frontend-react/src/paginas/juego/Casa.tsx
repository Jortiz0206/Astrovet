import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Sprite from "../../componentes/casa/Sprites";
import { Grupo } from "../../componentes/Criatura";
import Icono from "../../componentes/Icono";
import Misi from "../../componentes/Misi";
import Planeta from "../../componentes/Planeta";
import { useJuego } from "../../contexto/Juego";
import { CUARTOS, LADO, MUEBLES, PAREDES, PISOS, obtenerMueble, type Cuarto, type IdCuarto, type ObjetoFijo, type Puerta, type TipoSprite } from "../../datos/casa";
import { MISIONES, obtenerMision, obtenerMundo } from "../../datos/contenido";
import * as api from "../../servicios/api";
import { alAzar, efecto, hablar } from "../../servicios/audio";
import type { AjusteCuarto, EstadoMision, MuebleJugador } from "../../tipos";

// Geometría isométrica: baldosa de 72×36, paredes de 150 px.
const TW = 72;
const TH = 36;
const ALTO_PARED = 150;
const ANCHO = LADO * TW + 96;
const ALTO = ALTO_PARED + LADO * TH + 90;
const OX = ANCHO / 2;
const OY = ALTO_PARED + 34;
const PASO_MS = 230;

const TONO_OBJETO: Partial<Record<TipoSprite, string>> = {
  cama: "#B9A8E6",
  estante: "#FFB7B2",
  planta: "#FFB7B2",
  lampara: "#FFD166",
  telescopio: "#9FD3F2",
  sofa: "#B9A8E6",
  mesa: "#8FD9B6",
  piano: "#5e4e9a",
  acuario: "#9FD3F2",
  cohete: "#FFB7B2",
  globo: "#8FD9B6",
  arbol: "#6FBF8E",
  armario: "#FFB7B2",
};

type Baldosa = [number, number];

function centro(c: number, r: number): [number, number] {
  return [OX + (c - r) * (TW / 2), OY + (c + r) * (TH / 2) + TH / 2];
}

function rombo(c: number, r: number): string {
  const [x, y] = centro(c, r);
  return `${x},${y - TH / 2} ${x + TW / 2},${y} ${x},${y + TH / 2} ${x - TW / 2},${y}`;
}

/** Baldosa desde la que se usa una puerta. */
function frenteA(p: Puerta): Baldosa {
  return p.pared === "der" ? [p.pos, 0] : [0, p.pos];
}

/** Camino más corto entre dos baldosas libres (búsqueda en anchura, con diagonales sin cortar esquinas). */
function camino(desde: Baldosa, hasta: Baldosa, ocupada: (c: number, r: number) => boolean): Baldosa[] {
  const clave = (c: number, r: number) => c * 100 + r;
  const previo = new Map<number, number>();
  const cola: Baldosa[] = [desde];
  previo.set(clave(...desde), -1);
  while (cola.length) {
    const [c, r] = cola.shift()!;
    if (c === hasta[0] && r === hasta[1]) {
      const ruta: Baldosa[] = [];
      let k = clave(c, r);
      while (k !== -1) {
        ruta.unshift([Math.floor(k / 100), k % 100]);
        k = previo.get(k)!;
      }
      return ruta.slice(1);
    }
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ]) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= LADO || nr >= LADO || previo.has(clave(nc, nr)) || ocupada(nc, nr)) continue;
      // En diagonal solo si las dos baldosas de los lados están libres.
      if (dc !== 0 && dr !== 0 && (ocupada(c + dc, r) || ocupada(c, r + dr))) continue;
      previo.set(clave(nc, nr), clave(c, r));
      cola.push([nc, nr]);
    }
  }
  return [];
}

/** La baldosa libre junto a un objeto más cercana al personaje. */
function junto(obj: Baldosa, yo: Baldosa, ocupada: (c: number, r: number) => boolean): Baldosa | null {
  const opciones: Baldosa[] = [
    [obj[0] + 1, obj[1]],
    [obj[0], obj[1] + 1],
    [obj[0] - 1, obj[1]],
    [obj[0], obj[1] - 1],
    [obj[0] + 1, obj[1] + 1],
  ];
  const libres = opciones.filter(([c, r]) => c >= 0 && r >= 0 && c < LADO && r < LADO && !ocupada(c, r));
  libres.sort((a, b) => Math.hypot(a[0] - yo[0], a[1] - yo[1]) - Math.hypot(b[0] - yo[0], b[1] - yo[1]));
  return libres[0] ?? null;
}

interface Accion {
  texto: string;
  boton?: string;
  ir?: () => void;
}

/**
 * Mi casa: vista isométrica (estilo Habbo). El niño toca el piso para que su
 * Misi camine; al tocar un objeto o una puerta, Misi va hasta allí y cuenta qué
 * hay. Cada cuarto es un mundo y cada objeto con brillo es una misión.
 */
export default function Casa() {
  const { cuarto: idParam } = useParams();
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { jugador, estados, setMundoVisual, refrescar } = useJuego();
  const cuarto: Cuarto = CUARTOS[(idParam as IdCuarto) ?? "sala"] ?? CUARTOS.sala;
  const desde = params.get("desde");

  const [muebles, setMuebles] = useState<MuebleJugador[]>([]);
  const [pos, setPos] = useState<Baldosa>(() => cuarto.entrada);
  const [ruta, setRuta] = useState<Baldosa[]>([]);
  const [mira, setMira] = useState<1 | -1>(1);
  const [mensaje, setMensaje] = useState("");
  const [accion, setAccion] = useState<Accion | null>(null);
  const [decorar, setDecorar] = useState(false);
  const [elegido, setElegido] = useState<string | null>(null);
  const [panel, setPanel] = useState<"baul" | "tienda" | "colores">("baul");
  const [ajustes, setAjustes] = useState<AjusteCuarto[]>([]);
  const [durPaso, setDurPaso] = useState(PASO_MS);
  const [aviso, setAviso] = useState("");
  const alLlegar = useRef<(() => void) | null>(null);
  const marco = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);

  useEffect(() => setMundoVisual(cuarto.idMundo ?? 0), [cuarto, setMundoVisual]);

  const cargar = useCallback(async () => {
    if (!jugador) return;
    const [m, a] = await Promise.all([api.mueblesDe(jugador.id), api.ajustesDe(jugador.id)]);
    setMuebles(m);
    setAjustes(a);
  }, [jugador]);
  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Escala la escena al ancho disponible.
  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const porAncho = e.contentRect.width / ANCHO;
      // Al decorar el panel va al costado; solo en pantallas angostas queda abajo y el cuarto se achica.
      const abajo = decorar && window.innerWidth < 900;
      const porAlto = (window.innerHeight - 250 - (abajo ? 250 : 0)) / ALTO;
      setEscala(Math.max(0.4, Math.min(1.35, porAncho, porAlto)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [decorar]);

  const ajuste = ajustes.find((a) => a.cuarto === cuarto.id);
  const paredes = ajuste?.paredes ?? cuarto.paredes;
  const piso = ajuste?.piso ?? cuarto.piso;
  const objetos: (ObjetoFijo & { indice: number })[] = useMemo(
    () =>
      cuarto.objetos.map((o, indice) => {
        const p = ajuste?.posiciones[String(indice)];
        return p ? { ...o, c: p[0], r: p[1], indice } : { ...o, indice };
      }),
    [cuarto, ajuste],
  );
  const enCuarto = muebles.filter((m) => m.cuarto === cuarto.id && m.c !== undefined && m.r !== undefined);
  const enBaul = muebles.filter((m) => !m.cuarto);

  const ocupada = useCallback(
    (c: number, r: number) =>
      objetos.some((o) => o.c === c && o.r === r) ||
      enCuarto.some((m) => m.c === c && m.r === r && !obtenerMueble(m.idMueble)?.pisable),
    [objetos, enCuarto],
  );

  // Al entrar: aparece en la puerta (o junto a la misión de la que vuelve) y Misi saluda.
  const saludado = useRef<string | null>(null);
  useEffect(() => {
    if (!jugador || saludado.current === cuarto.id) return;
    saludado.current = cuarto.id;
    const obj = desde ? objetos.find((o) => o.idMision === desde) : undefined;
    const inicio = obj ? junto([obj.c, obj.r], cuarto.entrada, (c, r) => objetos.some((o) => o.c === c && o.r === r)) : null;
    setPos(inicio ?? cuarto.entrada);
    setRuta([]);
    setAccion(null);
    const actual = cuarto.objetos.find((o) => o.idMision && (estados[o.idMision] === "disponible" || estados[o.idMision] === "en_progreso"));
    const texto =
      cuarto.id === "sala"
        ? `¡Hola, ${jugador.apodo}! ${cuarto.bienvenida}`
        : actual
          ? `${cuarto.bienvenida} Toca la estrella dorada para jugar.`
          : `${cuarto.bienvenida}`;
    setMensaje(texto);
    setSaludo(texto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuarto, desde, jugador, estados]);

  // El saludo se dice en su propio efecto: así sobrevive al doble montaje de
  // React en desarrollo (StrictMode) y a que los datos lleguen después.
  const [saludo, setSaludo] = useState<string | null>(null);
  useEffect(() => {
    if (!saludo) return;
    const t = window.setTimeout(() => void hablar(saludo).then(() => programarOcultar(saludo, false)), 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saludo]);

  // Camina un paso cada PASO_MS; las transiciones de CSS hacen el resto.
  useEffect(() => {
    if (!ruta.length) {
      if (alLlegar.current) {
        const f = alLlegar.current;
        alLlegar.current = null;
        f();
      }
      return;
    }
    const t = window.setTimeout(() => {
      const [sig, ...resto] = ruta;
      const [x0, y0] = centro(...pos);
      const [x1, y1] = centro(...sig);
      const dx = x1 - x0;
      if (dx !== 0) setMira(dx > 0 ? 1 : -1);
      // La duración sigue la distancia en pantalla: una diagonal horizontal es más larga.
      setDurPaso(Math.round(PASO_MS * Math.max(0.8, Math.hypot(dx, y1 - y0) / 40)));
      setPos(sig);
      setRuta(resto);
      if (resto.length % 2 === 0) efecto("paso", 2);
    }, durPaso);
    return () => window.clearTimeout(t);
  }, [ruta, pos, durPaso]);

  function irA(destino: Baldosa, luego?: () => void) {
    if (destino[0] === pos[0] && destino[1] === pos[1]) {
      luego?.();
      return;
    }
    const r = camino(pos, destino, ocupada);
    if (!r.length) return;
    alLlegar.current = luego ?? null;
    setAccion(null);
    setRuta(r);
  }

  function decir(texto: string, a?: Accion) {
    setMensaje(texto);
    setAccion(a ?? null);
    void hablar(texto).then(() => programarOcultar(texto, !!a));
  }

  // El globo se va solo un rato después de que Misi termina (salvo si hay un botón).
  const ocultar = useRef(0);
  function programarOcultar(texto: string, conBoton: boolean) {
    window.clearTimeout(ocultar.current);
    if (conBoton) return;
    ocultar.current = window.setTimeout(() => setMensaje((m) => (m === texto ? "" : m)), 4500);
  }

  function tocarPiso(c: number, r: number) {
    if (decorar) return colocarEn(c, r);
    if (ocupada(c, r)) return;
    efecto("toque");
    irA([c, r]);
  }

  function tocarObjeto(o: ObjetoFijo & { indice: number }) {
    if (decorar) {
      const id = `obj:${o.indice}`;
      setElegido(elegido === id ? null : id);
      setAviso(`${o.nombre[0].toUpperCase()}${o.nombre.slice(1)}: toca otra baldosa para moverlo.`);
      return;
    }
    efecto("toque");
    const lugar = junto([o.c, o.r], pos, ocupada);
    if (!lugar) return;
    irA(lugar, () => {
      setMira(centro(o.c, o.r)[0] >= centro(...lugar)[0] ? 1 : -1);
      if (o.ruta) {
        const esPizarra = o.sprite === "pizarra";
        decir(esPizarra ? "La pizarra de las vocales. ¿Practicamos sin prisa?" : "Mi armario. ¿Me cambio el pelaje?", {
          texto: "",
          boton: esPizarra ? "Practicar" : "Abrir el armario",
          ir: () => navegar(o.ruta!, { viewTransition: true }),
        });
        return;
      }
      const m = o.idMision ? obtenerMision(o.idMision) : undefined;
      if (!m) return;
      const est = estados[m.id];
      if (est === "bloqueado") decir(`Aquí hay alguien escondido. Se abre cuando termines la misión anterior.`);
      else if (est === "completado")
        decir(`${m.animal.nombre} vive aquí ahora. ¿Jugamos otra vez «${m.titulo}»?`, { texto: "", boton: "Jugar otra vez", ir: () => navegar(`/juego/mision/${m.id}`, { viewTransition: true }) });
      else decir(`¡Escucho a ${m.animal.nombre} detrás de ${o.nombre}! Misión: ${m.titulo}.`, { texto: "", boton: "¡Jugar!", ir: () => navegar(`/juego/mision/${m.id}`, { viewTransition: true }) });
    });
  }

  function abrirPuerta(p: Puerta) {
    if (decorar) return;
    efecto("toque");
    irA(frenteA(p), () => {
      if (p.destino.tipo === "ruta") {
        navegar(p.destino.ruta, { viewTransition: true });
        return;
      }
      const destino = CUARTOS[p.destino.cuarto];
      if (destino.idMundo && !abierto(destino)) {
        decir(`Esa puerta se abre cuando termines el cuarto anterior.`);
        return;
      }
      efecto("girar");
      navegar(`/juego/casa/${destino.id}`, { viewTransition: true });
    });
  }

  function abierto(c: Cuarto): boolean {
    if (!c.idMundo) return true;
    const mundo = obtenerMundo(c.idMundo);
    return !!mundo?.disponible && c.objetos.some((o) => o.idMision && estados[o.idMision] !== "bloqueado");
  }

  // Teclado: flechas para caminar una baldosa.
  function teclas(e: KeyboardEvent) {
    const mov: Record<string, Baldosa> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const d = mov[e.key];
    if (!d || ruta.length) return;
    e.preventDefault();
    const sig: Baldosa = [pos[0] + d[0], pos[1] + d[1]];
    if (sig[0] < 0 || sig[1] < 0 || sig[0] >= LADO || sig[1] >= LADO || ocupada(...sig)) return;
    irA(sig);
  }

  // ---------- Decorar ----------
  function puertaEn(c: number, r: number) {
    return cuarto.puertas.some((p) => frenteA(p)[0] === c && frenteA(p)[1] === r);
  }

  async function colocarEn(c: number, r: number) {
    if (!jugador || !elegido) return;
    if (elegido.startsWith("obj:")) {
      const indice = Number(elegido.slice(4));
      const libre = !objetos.some((o) => o.indice !== indice && o.c === c && o.r === r) && !enCuarto.some((x) => x.c === c && x.r === r) && !(c === pos[0] && r === pos[1]);
      if (!libre || puertaEn(c, r)) {
        setAviso("Ahí no cabe. Prueba en una baldosa libre.");
        return;
      }
      await api.guardarAjuste(jugador.id, cuarto.id, { posicion: { indice, c, r } });
      efecto("unir", 3);
      setElegido(null);
      setAviso("¡Listo, quedó en su nuevo lugar!");
      await cargar();
      return;
    }
    const m = muebles.find((x) => x.id === elegido);
    const def = m && obtenerMueble(m.idMueble);
    if (!m || !def) return;
    const libre = !objetos.some((o) => o.c === c && o.r === r) && !enCuarto.some((x) => x.id !== m.id && x.c === c && x.r === r) && !(c === pos[0] && r === pos[1] && !def.pisable);
    if (!libre || puertaEn(c, r)) {
      setAviso("Ahí no cabe. Prueba en una baldosa libre.");
      return;
    }
    await api.moverMueble(jugador.id, m.id, { cuarto: cuarto.id, c, r });
    efecto("unir", 3);
    setElegido(null);
    setAviso(`¡Pusiste ${def.nombre.toLowerCase()}!`);
    await cargar();
  }

  async function pintar(cambio: { paredes?: [string, string]; piso?: [string, string] }) {
    if (!jugador) return;
    await api.guardarAjuste(jugador.id, cuarto.id, cambio);
    efecto("toque");
    await cargar();
  }

  async function guardar(id: string) {
    if (!jugador) return;
    await api.moverMueble(jugador.id, id, null);
    setElegido(null);
    setAviso("Guardado en el baúl.");
    await cargar();
  }

  async function comprar(idMueble: string) {
    if (!jugador) return;
    try {
      const { mueble } = await api.comprarMueble(jugador.id, idMueble);
      efecto("patita");
      await Promise.all([refrescar(), cargar()]);
      setPanel("baul");
      setElegido(mueble.id);
      setAviso("¡Es tuyo! Toca una baldosa para ponerlo.");
      hablar(alAzar(["¡Qué lindo!", "¡Buena elección!", "¡Quedará muy bien!"]));
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No se pudo comprar.");
    }
  }

  const actualId = useMemo(() => MISIONES.find((m) => estados[m.id] === "disponible" || estados[m.id] === "en_progreso")?.id, [estados]);
  if (!jugador) return null;

  const [ax, ay] = centro(...pos);
  const caminando = ruta.length > 0;
  const sel = elegido ? muebles.find((m) => m.id === elegido) : undefined;

  // Objetos y muebles, ordenados por profundidad con el personaje.
  const capas: { clave: string; c: number; r: number; plano?: boolean; nodo: React.ReactNode }[] = [];
  for (const o of objetos) {
    const est: EstadoMision | undefined = o.idMision ? estados[o.idMision] : undefined;
    const m = o.idMision ? obtenerMision(o.idMision) : undefined;
    const esActual = o.idMision === actualId;
    capas.push({
      clave: `o-${o.c}-${o.r}`,
      c: o.c,
      r: o.r,
      nodo: (
        <button
          type="button"
          onClick={() => tocarObjeto(o)}
          aria-label={
            m ? `${o.nombre}: ${est === "completado" ? `${m.animal.nombre}, rescatado` : est === "bloqueado" ? "misión cerrada" : `misión ${m.titulo}`}` : o.nombre
          }
          className={`objeto-casa ${esActual ? "objeto-actual" : ""} ${est === "bloqueado" ? "objeto-cerrado" : ""} ${decorar ? "mueble-editable" : ""} ${elegido === `obj:${o.indice}` ? "mueble-elegido" : ""}`}
        >
          <Sprite tipo={o.sprite} color={o.tono ?? TONO_OBJETO[o.sprite]} />
          {m && est === "completado" ? (
            <span className="objeto-animal" aria-hidden="true">
              <Grupo claves={[m.animal.claves[0]]} tamano={46} />
            </span>
          ) : null}
          {m && est !== "completado" ? (
            <span className={`objeto-marca ${est === "bloqueado" ? "marca-cerrada" : esActual ? "marca-actual" : "marca-abierta"}`} aria-hidden="true">
              {est === "bloqueado" ? <Icono nombre="candado" tamano={16} /> : <Icono nombre="estrella" tamano={esActual ? 22 : 16} />}
            </span>
          ) : null}
        </button>
      ),
    });
  }
  for (const m of enCuarto) {
    const def = obtenerMueble(m.idMueble);
    if (!def) continue;
    capas.push({
      clave: `m-${m.id}`,
      c: m.c!,
      r: m.r!,
      plano: def.pisable,
      nodo: (
        <button
          type="button"
          tabIndex={decorar ? 0 : -1}
          onClick={() => {
            if (!decorar) return;
            setElegido(elegido === m.id ? null : m.id);
            setAviso(`${def.nombre}: toca otra baldosa para moverlo.`);
          }}
          aria-label={decorar ? `Mover ${def.nombre}` : def.nombre}
          className={`objeto-casa ${decorar ? "mueble-editable" : "mueble-fijo"} ${elegido === m.id ? "mueble-elegido" : ""} ${def.pisable ? "mueble-pisable" : ""}`}
        >
          <Sprite tipo={def.sprite} color={def.tono} />
        </button>
      ),
    });
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-2 px-2 pb-4 sm:px-4">
      <div className="flex w-full flex-wrap items-center gap-2 pt-2">
        {cuarto.id !== "sala" ? (
          <Link to="/juego/casa/sala" viewTransition className="flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-bold ring-1 ring-white/15 hover:bg-white/20">
            <Icono nombre="flecha-izq" tamano={20} />
            Sala
          </Link>
        ) : null}
        <h1 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
          {cuarto.idMundo ? <Planeta mundo={cuarto.idMundo} tamano={34} /> : <Icono nombre="casa" tamano={26} />}
          {cuarto.nombre}
        </h1>
        <button
          type="button"
          onClick={() => {
            setDecorar(!decorar);
            setElegido(null);
            setAviso(decorar ? "" : "Elige algo del baúl o de la tienda y toca una baldosa.");
            efecto("toque");
          }}
          aria-pressed={decorar}
          className={`ml-auto flex min-h-12 items-center gap-2 rounded-full px-5 font-extrabold ring-1 ring-white/15 ${decorar ? "bg-dorado text-tinta" : "bg-white/10 hover:bg-white/20"}`}
        >
          <Icono nombre={decorar ? "check" : "lapiz"} tamano={20} />
          {decorar ? "Listo" : "Decorar"}
        </button>
      </div>

      {/* Lo que dice Misi va arriba del cuarto, para no tapar nada. */}
      <div className={`casa-dialogo flex min-h-[4.25rem] w-full max-w-3xl items-center gap-3 rounded-[1.5rem] px-3 py-2 ${(decorar ? aviso : mensaje) ? "casa-dialogo-visible" : ""}`} aria-live="polite">
        <span className="shrink-0" aria-hidden="true">
          <Misi pelaje={jugador.pelaje} tamano={46} titulo="" />
        </span>
        <p className="min-w-0 flex-1 text-[15px] leading-snug font-extrabold text-tinta sm:text-base">{decorar ? aviso : mensaje}</p>
        {!decorar && mensaje ? (
          <button type="button" onClick={() => hablar(mensaje)} aria-label="Escuchar otra vez" className="grid size-11 shrink-0 place-items-center rounded-full bg-lavanda-tenue text-lavanda-oscuro">
            <Icono nombre="oreja" tamano={20} />
          </button>
        ) : null}
        {!decorar && accion?.boton ? (
          <button type="button" onClick={accion.ir} className="boton-juego flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-lg font-black">
            <Icono nombre="jugar" tamano={18} />
            {accion.boton}
          </button>
        ) : null}
      </div>

      <div className={decorar ? "flex w-full gap-3 max-[899px]:flex-col min-[900px]:items-start" : "w-full"}>
      <div ref={marco} className="w-full min-w-0 flex-1">
        <div className="relative mx-auto" style={{ width: ANCHO * escala, height: ALTO * escala }}>
          <div
            className={`casa-escena absolute top-0 left-0 origin-top-left outline-none ${decorar ? "casa-decorando" : ""}`}
            style={{ width: ANCHO, height: ALTO, transform: `scale(${escala})` }}
            tabIndex={0}
            onKeyDown={teclas}
            aria-label={`${cuarto.nombre}. Usa las flechas para caminar.`}
            role="application"
          >
            <svg width={ANCHO} height={ALTO} className="absolute inset-0" aria-hidden="true">
              <defs>
                <linearGradient id="pared-izq" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={paredes[0]} />
                  <stop offset="1" stopColor={paredes[1]} />
                </linearGradient>
              </defs>
              {/* Paredes */}
              <polygon
                points={`${OX},${OY} ${OX - LADO * 36},${OY + LADO * 18} ${OX - LADO * 36},${OY + LADO * 18 - ALTO_PARED} ${OX},${OY - ALTO_PARED}`}
                fill="url(#pared-izq)"
                stroke="#2B2440"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <polygon
                points={`${OX},${OY} ${OX + LADO * 36},${OY + LADO * 18} ${OX + LADO * 36},${OY + LADO * 18 - ALTO_PARED} ${OX},${OY - ALTO_PARED}`}
                fill={paredes[1]}
                stroke="#2B2440"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d={`M${OX - LADO * 36} ${OY + LADO * 18 - 26} L${OX} ${OY - 26} L${OX + LADO * 36} ${OY + LADO * 18 - 26}`} fill="none" stroke="#2B2440" strokeOpacity="0.18" strokeWidth="6" />
              {/* Piso */}
              <polygon
                points={`${OX},${OY} ${OX + LADO * 36},${OY + LADO * 18} ${OX},${OY + LADO * 36} ${OX - LADO * 36},${OY + LADO * 18}`}
                fill={piso[1]}
                stroke="#2B2440"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </svg>
            <svg width={ANCHO} height={ALTO} className="absolute inset-0">
              {Array.from({ length: LADO * LADO }, (_, i) => {
                const c = i % LADO;
                const r = Math.floor(i / LADO);
                const libre = !ocupada(c, r);
                return (
                  <polygon
                    key={i}
                    points={rombo(c, r)}
                    onClick={() => tocarPiso(c, r)}
                    className={`baldosa ${(c + r) % 2 ? "baldosa-b" : "baldosa-a"} ${decorar && sel && libre ? "baldosa-libre" : ""}`}
                    fill={(c + r) % 2 ? piso[1] : piso[0]}
                  />
                );
              })}
              {cuarto.puertas.map((p, i) => (
                <PuertaSvg key={i} puerta={p} abierta={p.destino.tipo === "ruta" || abierto(CUARTOS[p.destino.cuarto])} onAbrir={() => abrirPuerta(p)} />
              ))}
            </svg>

            {capas.map((k) => {
              const [x, y] = centro(k.c, k.r);
              return (
                <div key={k.clave} className="absolute" style={{ left: x - 60, top: y - 150, zIndex: k.plano ? 5 : 10 + (k.c + k.r) * 2 }}>
                  {k.nodo}
                </div>
              );
            })}

            {/* Personaje: Misi del niño */}
            <div
              className="personaje absolute top-0 left-0"
              style={{ transform: `translate(${ax - 42}px, ${ay - 92}px)`, zIndex: 11 + (pos[0] + pos[1]) * 2, transitionDuration: `${durPaso}ms` } as CSSProperties}
              aria-hidden="true"
            >
              <span className="personaje-sombra" />
              <span className={`block ${caminando ? "personaje-camina" : "personaje-quieto"}`}>
                <span className="block" style={{ scale: `${mira} 1` }}>
                  <Misi pelaje={jugador.pelaje} tamano={84} animo={mensaje ? "feliz" : "feliz"} titulo="" />
                </span>
              </span>
            </div>

          </div>
        </div>
      </div>

      {decorar ? (
        <PanelDecorar
          panel={panel}
          setPanel={setPanel}
          enBaul={enBaul}
          elegido={elegido}
          seleccionado={sel}
          onElegir={(id) => {
            setElegido(elegido === id ? null : id);
            setAviso("Ahora toca una baldosa libre.");
          }}
          onGuardar={guardar}
          onComprar={comprar}
          patitas={jugador.patitas}
          estados={estados}
          tengo={muebles.map((m) => m.idMueble)}
          paredes={paredes}
          piso={piso}
          onPintar={pintar}
        />
      ) : null}
      </div>
    </section>
  );
}

function PuertaSvg({ puerta, abierta, onAbrir }: { puerta: Puerta; abierta: boolean; onAbrir: () => void }) {
  const k = puerta.pos;
  const der = puerta.pared === "der";
  const p0: [number, number] = der ? [OX + k * 36, OY + k * 18] : [OX - k * 36, OY + k * 18];
  const p1: [number, number] = der ? [OX + (k + 1) * 36, OY + (k + 1) * 18] : [OX - (k + 1) * 36, OY + (k + 1) * 18];
  const a: [number, number] = [p0[0] + (p1[0] - p0[0]) * 0.12, p0[1] + (p1[1] - p0[1]) * 0.12];
  const b: [number, number] = [p0[0] + (p1[0] - p0[0]) * 0.88, p0[1] + (p1[1] - p0[1]) * 0.88];
  const H = 104;
  const destino = puerta.destino;
  const cuarto = destino.tipo === "cuarto" ? CUARTOS[destino.cuarto] : undefined;
  const nombre = destino.tipo === "cuarto" ? cuarto!.nombre : destino.nombre;
  const color = cuarto?.paredes[1] ?? "#8FD9B6";
  const medio: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Puerta a ${nombre}${abierta ? "" : ", cerrada"}`}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAbrir();
        }
      }}
      className={`puerta-casa ${abierta ? "" : "puerta-cerrada"}`}
    >
      <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${b[0]},${b[1] - H} ${a[0]},${a[1] - H}`} fill="#5e4e9a" stroke="#2B2440" strokeWidth="3" strokeLinejoin="round" />
      <polygon
        points={`${a[0] + (der ? 4 : -4)},${a[1] - 2} ${b[0] - (der ? 4 : -4)},${b[1] - 2} ${b[0] - (der ? 4 : -4)},${b[1] - H + 6} ${a[0] + (der ? 4 : -4)},${a[1] - H + 6}`}
        fill={color}
        className="puerta-hoja"
      />
      <circle cx={medio[0] + (der ? 10 : -10)} cy={medio[1] - H / 2 + 4} r="4" fill="#FFD166" stroke="#2B2440" strokeWidth="2" />
      {/* Letrero */}
      <g transform={`translate(${medio[0]} ${medio[1] - H - 20})`}>
        <rect x="-44" y="-14" width="88" height="26" rx="13" fill="#fff" stroke="#2B2440" strokeWidth="2.5" />
        <text y="5" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="12" fill="#2B2440">
          {destino.tipo === "cuarto" ? (cuarto!.idMundo ? cuarto!.nombre.replace("Cuarto ", "") : "Sala") : "Clínica"}
        </text>
      </g>
      {!abierta ? (
        <g transform={`translate(${medio[0]} ${medio[1] - H / 2})`}>
          <circle r="16" fill="#fff" stroke="#2B2440" strokeWidth="2.5" />
          <path d="M-6 -1 V-5 a6 6 0 0 1 12 0 V-1 M-8 -1 H8 V9 H-8 Z" fill="none" stroke="#2B2440" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      ) : null}
    </g>
  );
}

function PanelDecorar({
  panel,
  setPanel,
  enBaul,
  elegido,
  seleccionado,
  onElegir,
  onGuardar,
  onComprar,
  patitas,
  estados,
  tengo,
  paredes,
  piso,
  onPintar,
}: {
  panel: "baul" | "tienda" | "colores";
  setPanel: (p: "baul" | "tienda" | "colores") => void;
  enBaul: MuebleJugador[];
  elegido: string | null;
  seleccionado?: MuebleJugador;
  onElegir: (id: string) => void;
  onGuardar: (id: string) => void;
  onComprar: (idMueble: string) => void;
  patitas: number;
  estados: Record<string, EstadoMision>;
  tengo: string[];
  paredes: [string, string];
  piso: [string, string];
  onPintar: (c: { paredes?: [string, string]; piso?: [string, string] }) => void;
}) {
  const tienda = MUEBLES.filter((m) => m.precio !== undefined);
  const regalos = MUEBLES.filter((m) => m.regaloDe && !tengo.includes(m.id));
  return (
    <div className="panel-decorar w-full shrink-0 rounded-[2rem] bg-white p-4 text-tinta min-[900px]:max-h-[calc(100svh-11rem)] min-[900px]:w-80 min-[900px]:overflow-y-auto">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="flex w-full gap-1 rounded-full bg-lavanda-tenue p-1 min-[900px]:justify-between">
          {(["baul", "tienda", "colores"] as const).map((p) => (
            <button key={p} role="tab" type="button" aria-selected={panel === p} onClick={() => setPanel(p)} className={`min-h-11 rounded-full px-4 text-sm font-extrabold sm:text-base ${panel === p ? "bg-white shadow-sm" : "text-tinta-suave"}`}>
              {p === "baul" ? `Baúl (${enBaul.length})` : p === "tienda" ? "Tienda" : "Colores"}
            </button>
          ))}
        </div>
        {seleccionado?.cuarto ? (
          <button type="button" onClick={() => onGuardar(seleccionado.id)} className="min-h-11 rounded-full bg-lavanda-tenue px-4 font-extrabold text-lavanda-oscuro">
            Guardar en el baúl
          </button>
        ) : null}
        <p className="w-full text-sm font-bold text-tinta-suave">Toca una misión o un mueble del cuarto para moverlo.</p>
      </div>
      {panel === "colores" ? (
        <div className="mt-4 grid gap-4 max-[899px]:sm:grid-cols-2">
          {(
            [
              ["Paredes", PAREDES, paredes, (t: [string, string]) => onPintar({ paredes: t })],
              ["Piso", PISOS, piso, (t: [string, string]) => onPintar({ piso: t })],
            ] as const
          ).map(([titulo, lista, actual, elegir]) => (
            <fieldset key={titulo}>
              <legend className="mb-2 font-extrabold">{titulo}</legend>
              <div className="flex flex-wrap gap-2">
                {lista.map((op) => {
                  const puesto = op.tonos[0] === actual[0];
                  return (
                    <button
                      key={op.nombre}
                      type="button"
                      onClick={() => elegir(op.tonos)}
                      aria-pressed={puesto}
                      aria-label={`${titulo} ${op.nombre}`}
                      className={`grid size-14 place-items-center rounded-2xl ring-2 ${puesto ? "ring-tinta" : "ring-transparent"}`}
                      style={{ background: `linear-gradient(135deg, ${op.tonos[0]} 50%, ${op.tonos[1]} 50%)` }}
                    >
                      {puesto ? <Icono nombre="check" tamano={20} /> : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      ) : panel === "baul" ? (
        enBaul.length ? (
          <ul className="mt-4 flex gap-3 overflow-x-auto pb-1 min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:overflow-visible">
            {enBaul.map((m) => {
              const def = obtenerMueble(m.idMueble)!;
              return (
                <li key={m.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onElegir(m.id)}
                    aria-pressed={elegido === m.id}
                    className={`flex w-28 flex-col items-center rounded-2xl p-2 ring-2 min-[900px]:w-full ${elegido === m.id ? "bg-dorado/30 ring-dorado" : "bg-lavanda-tenue ring-transparent"}`}
                  >
                    <span className="block h-20 overflow-hidden">
                      <span className="block origin-top scale-[0.55]" style={{ marginTop: -18 }}>
                        <Sprite tipo={def.sprite} color={def.tono} />
                      </span>
                    </span>
                    <span className="text-center text-sm leading-tight font-bold">{def.nombre}</span>
                    {m.origen === "regalo" ? <span className="text-xs font-bold text-lavanda-oscuro">Regalo</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 font-bold text-tinta-suave">Tu baúl está vacío. Compra algo en la tienda o rescata animales: algunos traen regalos.</p>
        )
      ) : (
        <>
          <ul className="mt-4 flex gap-3 overflow-x-auto pb-1 min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:overflow-visible">
            {tienda.map((m) => {
              const alcanza = patitas >= (m.precio ?? 0);
              return (
                <li key={m.id} className="shrink-0">
                  <div className="flex w-32 flex-col items-center rounded-2xl bg-lavanda-tenue p-2 min-[900px]:w-full">
                    <span className="block h-20 overflow-hidden">
                      <span className="block origin-top scale-[0.55]" style={{ marginTop: -18 }}>
                        <Sprite tipo={m.sprite} color={m.tono} />
                      </span>
                    </span>
                    <span className="text-center text-sm leading-tight font-bold">{m.nombre}</span>
                    <button
                      type="button"
                      disabled={!alcanza}
                      onClick={() => onComprar(m.id)}
                      className="mt-2 flex min-h-10 items-center gap-1 rounded-full bg-dorado px-3 font-black text-tinta disabled:bg-white disabled:text-tinta-suave"
                      aria-label={alcanza ? `Comprar ${m.nombre} por ${m.precio} patitas` : `${m.nombre}: te faltan ${(m.precio ?? 0) - patitas} patitas`}
                    >
                      <Icono nombre="patita" tamano={16} />
                      {m.precio}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {regalos.length ? (
            <>
              <p className="mt-4 text-sm font-extrabold text-tinta-suave">Regalos que llegan al rescatar</p>
              <ul className="mt-2 flex gap-3 overflow-x-auto pb-1 min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:overflow-visible">
                {regalos.map((m) => {
                  const mi = obtenerMision(m.regaloDe!);
                  return (
                    <li key={m.id} className="flex w-32 shrink-0 flex-col items-center rounded-2xl bg-lavanda-tenue/60 p-2 opacity-80 min-[900px]:w-full">
                      <span className="block h-16 overflow-hidden grayscale">
                        <span className="block origin-top scale-[0.45]" style={{ marginTop: -14 }}>
                          <Sprite tipo={m.sprite} color={m.tono} />
                        </span>
                      </span>
                      <span className="text-center text-xs font-bold">
                        {mi && estados[mi.id] !== "completado" ? `Rescata a ${mi.animal.nombre}` : m.nombre}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
