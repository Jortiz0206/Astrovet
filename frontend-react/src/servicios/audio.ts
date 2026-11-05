// Voz y efectos de AstroVet.
//
// Voz: cada contenido (letra, sílaba o palabra) busca primero una grabación
// propia en /public/audio (RNF-11). Mientras no existan, usa la mejor voz en
// español del dispositivo. Para agregar grabaciones basta con copiar los MP3
// en public/audio y listarlos en public/audio/manifiesto.json; los nombres
// salen de claveAudio() (ver public/audio/LEEME.md).
//
// Efectos: tonos suaves de marimba sintetizados con Web Audio (sin archivos),
// en escala pentatónica para que nada suene estridente. Se pueden silenciar.

const PREFS = "astrovet:prefs";

export interface Preferencias {
  efectos: boolean; // sonidos de refuerzo (no esenciales, silenciables)
  movimiento: boolean; // animaciones no esenciales
  voz: string | null; // voiceURI elegida por el adulto
}

const PREFS_BASE: Preferencias = { efectos: true, movimiento: true, voz: null };

export function leerPreferencias(): Preferencias {
  try {
    return { ...PREFS_BASE, ...(JSON.parse(localStorage.getItem(PREFS) ?? "{}") as Partial<Preferencias>) };
  } catch {
    return { ...PREFS_BASE };
  }
}

export function guardarPreferencias(p: Preferencias): void {
  try {
    localStorage.setItem(PREFS, JSON.stringify(p));
  } catch {
    // sin almacenamiento
  }
  vozCache = undefined;
}

// ======================= Voces del dispositivo =======================

export function vozDisponible(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Puntaje para preferir voces naturales y el español de Colombia. */
function puntaje(v: SpeechSynthesisVoice): number {
  const lang = v.lang.replace("_", "-").toLowerCase();
  const nombre = v.name.toLowerCase();
  let p = 0;
  if (lang === "es-co") p += 8;
  else if (["es-419", "es-mx", "es-us", "es-pe", "es-cl", "es-ar", "es-ve", "es-ec"].includes(lang)) p += 5;
  else if (lang.startsWith("es")) p += 2;
  if (/natural|neural|online/.test(nombre)) p += 12;
  if (/google/.test(nombre)) p += 6;
  if (/premium|enhanced|mejorad/.test(nombre)) p += 6;
  if (/salom|paulina|dalia|elena|sabina|monica|mónica|marisol|lupe|paloma/.test(nombre)) p += 2;
  return p;
}

export function vocesEspanol(): SpeechSynthesisVoice[] {
  if (!vozDisponible()) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("es"))
    .sort((a, b) => puntaje(b) - puntaje(a));
}

/** Avisa cuando el navegador termina de cargar las voces (llegan tarde en Chrome). */
export function alCargarVoces(fn: () => void): () => void {
  if (!vozDisponible()) return () => undefined;
  const manejador = () => {
    vozCache = undefined;
    fn();
  };
  window.speechSynthesis.addEventListener("voiceschanged", manejador);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", manejador);
}

let vozCache: SpeechSynthesisVoice | null | undefined;

function voz(): SpeechSynthesisVoice | null {
  if (vozCache !== undefined) return vozCache;
  const voces = vocesEspanol();
  if (voces.length === 0) return null;
  const elegida = leerPreferencias().voz;
  vozCache = voces.find((v) => v.voiceURI === elegida) ?? voces[0];
  return vozCache;
}

// ======================= Grabaciones propias =======================

let manifiesto: Set<string> | null = null;
let cargandoManifiesto: Promise<Set<string>> | null = null;

function cargarManifiesto(): Promise<Set<string>> {
  if (manifiesto) return Promise.resolve(manifiesto);
  cargandoManifiesto ??= fetch("/audio/manifiesto.json")
    .then((r) => (r.ok ? (r.json() as Promise<{ archivos?: string[] }>) : { archivos: [] }))
    .then((d) => (manifiesto = new Set(d.archivos ?? [])))
    .catch(() => (manifiesto = new Set()));
  return cargandoManifiesto;
}
if (typeof window !== "undefined") void cargarManifiesto();

const SIN_TILDES: Record<string, string> = { Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U", Ñ: "N" };
const VOCALES_SET = new Set(["A", "E", "I", "O", "U", "Á", "É", "Í", "Ó", "Ú"]);

/** Nombre del archivo de audio de un contenido: vocal-a, fonema-m, silaba-ma, palabra-manzana. */
export function claveAudio(contenido: string): string {
  const t = contenido.toUpperCase();
  const limpio = t.replace(/[ÁÉÍÓÚÑ]/g, (c) => SIN_TILDES[c]).toLowerCase();
  if (t.length === 1) return VOCALES_SET.has(t) ? `vocal-${limpio}` : `fonema-${limpio}`;
  if (t.length <= 3 && !VOCALES_SET.has(t[0]) && VOCALES_SET.has(t.at(-1)!)) return `silaba-${limpio}`;
  return `palabra-${limpio}`;
}

/**
 * Lo que dice la voz sintética mientras no haya grabación.
 * Las consonantes se aproximan alargando su sonido, nunca con su nombre
 * («mmm», no «eme»). Es una aproximación: la grabación humana es la meta.
 */
const FONEMAS: Record<string, string> = { M: "mmm", S: "sss", L: "lll", P: "p", N: "nnn", F: "fff" };

function textoSintetico(contenido: string): string {
  const t = contenido.toUpperCase();
  if (t.length === 1 && !VOCALES_SET.has(t)) return FONEMAS[t] ?? t.toLowerCase();
  return contenido.toLowerCase();
}

// ======================= Reproducción en cola =======================
//
// Todo lo que dice Misi pasa por una sola cola. Antes, cada llamada nueva
// cortaba la anterior aunque no debiera interrumpir: así se perdían la vocal
// que sigue a la consigna o el final de una frase de celebración.
//  - hablar(…)                       interrumpe lo que suena y empieza ya.
//  - hablar(…, { interrumpir: false }) espera su turno al final de la cola.
// Ambas devuelven una promesa que se cumple al terminar (o al ser callada).

/** Una frase de Misi (texto) o un contenido de aprendizaje ({ c: "MA" }). */
export type Locucion = string | { c: string };

interface Pedido {
  items: Locucion[];
  lento: boolean;
  alTerminar?: () => void;
  resolver: () => void;
}

let cola: Pedido[] = [];
let procesando = false;
let generacion = 0;
let ultimoSilencio = 0;
let audioActual: HTMLAudioElement | null = null;
/** Corta la locución en curso al instante (Safari no siempre avisa onend al cancelar). */
let soltarActual: (() => void) | null = null;
/** Chrome descarta el habla si la referencia a la locución se pierde antes de terminar. */
const vivas = new Set<SpeechSynthesisUtterance>();

const esperar = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** Duración aproximada de una frase con la voz sintética, en ms. */
function duracionEstimada(texto: string, ritmo: number): number {
  return 900 + (texto.length * 85) / ritmo;
}

async function decirSintetico(texto: string, lento: boolean, gen: number): Promise<void> {
  if (!vozDisponible() || gen !== generacion) return;
  const sintesis = window.speechSynthesis;
  // Chrome ignora lo que se pide justo después de cancel(): una pausa mínima lo evita.
  const desdeSilencio = performance.now() - ultimoSilencio;
  if (desdeSilencio < 140) await esperar(140 - desdeSilencio);
  // Si quedó algo sonando (otra pantalla, un tope vencido), se espera a que termine.
  for (let i = 0; i < 40 && sintesis.speaking && gen === generacion; i++) await esperar(100);
  if (gen !== generacion) return;

  await new Promise<void>((resolver) => {
    const u = new SpeechSynthesisUtterance(texto);
    const v = voz();
    u.lang = v?.lang ?? "es-CO";
    if (v) u.voice = v;
    u.rate = lento ? 0.75 : 0.92;
    u.pitch = 1.08;
    vivas.add(u);
    let listo = false;
    let tope = 0;
    const fin = () => {
      if (listo) return;
      listo = true;
      window.clearTimeout(tope);
      vivas.delete(u);
      soltarActual = null;
      resolver();
    };
    soltarActual = fin;
    u.onend = fin;
    u.onerror = fin;
    // Algunos navegadores no disparan onend. Al vencer el tope solo se sigue
    // si la voz de verdad terminó; si no, se revisa cada 200 ms (máx. 8 s).
    const revisar = (intentos: number) => {
      if (!sintesis.speaking || intentos <= 0) fin();
      else tope = window.setTimeout(() => revisar(intentos - 1), 200);
    };
    tope = window.setTimeout(() => revisar(40), duracionEstimada(texto, u.rate));
    sintesis.speak(u);
    // Chrome a veces deja la síntesis en pausa tras cambiar de pestaña.
    if (sintesis.paused) sintesis.resume();
  });
}

function reproducirArchivo(clave: string, gen: number): Promise<void> {
  return new Promise((resolver) => {
    if (gen !== generacion) return resolver();
    const a = new Audio(`/audio/${clave}.mp3`);
    audioActual = a;
    const fin = () => {
      soltarActual = null;
      if (audioActual === a) audioActual = null;
      resolver();
    };
    soltarActual = fin;
    a.onended = a.onerror = fin;
    a.play().catch(fin);
  });
}

async function decirUna(l: Locucion, lento: boolean, gen: number, grabaciones: Set<string>): Promise<void> {
  if (typeof l === "string") return decirSintetico(l, lento, gen);
  const clave = claveAudio(l.c);
  if (grabaciones.has(clave)) return reproducirArchivo(clave, gen);
  return decirSintetico(textoSintetico(l.c), true, gen);
}

async function procesar(): Promise<void> {
  if (procesando) return;
  procesando = true;
  const grabaciones = await cargarManifiesto();
  while (cola.length) {
    const gen = generacion;
    const pedido = cola.shift()!;
    for (let i = 0; i < pedido.items.length && gen === generacion; i++) {
      await decirUna(pedido.items[i], pedido.lento, gen, grabaciones);
      // Respiro corto entre una frase y el sonido que sigue: se entiende mejor.
      if (i < pedido.items.length - 1 && gen === generacion) await esperar(160);
    }
    if (gen === generacion) pedido.alTerminar?.();
    pedido.resolver();
  }
  procesando = false;
}

/**
 * Dice una o varias locuciones en orden. Por defecto interrumpe lo que se
 * estuviera diciendo; con `interrumpir: false` se suma al final de la cola.
 */
export function hablar(
  locuciones: Locucion | Locucion[],
  opciones: { interrumpir?: boolean; lento?: boolean; alTerminar?: () => void } = {},
): Promise<void> {
  const { interrumpir = true, lento = false, alTerminar } = opciones;
  const items = (Array.isArray(locuciones) ? locuciones : [locuciones]).filter((l) => (typeof l === "string" ? l.trim() : l.c));
  if (interrumpir) callar();
  return new Promise((resolver) => {
    if (items.length === 0) {
      alTerminar?.();
      return resolver();
    }
    cola.push({ items, lento, alTerminar, resolver });
    void procesar();
  });
}

/** Atajo: dice un contenido de aprendizaje (letra, sílaba o palabra). Interrumpe. */
export function decirContenido(contenido: string): Promise<void> {
  return hablar({ c: contenido });
}

/** true mientras Misi está hablando o tiene algo en la cola. */
export function hablando(): boolean {
  return procesando || cola.length > 0;
}

export function callar(): void {
  generacion++;
  const pendientes = cola;
  cola = [];
  pendientes.forEach((p) => p.resolver());
  if (vozDisponible()) window.speechSynthesis.cancel();
  ultimoSilencio = performance.now();
  if (audioActual) {
    audioActual.pause();
    audioActual = null;
  }
  soltarActual?.();
}

/** Prueba de voz para el espacio del adulto. */
export function probarVoz(uri: string | null): void {
  guardarPreferencias({ ...leerPreferencias(), voz: uri });
  hablar(["¡Hola! Soy Capitán Misi. Escucha:", { c: "MA" }, { c: "MESA" }]);
}

// ======================= Efectos =======================

let contexto: AudioContext | null = null;

function ctx(): AudioContext | null {
  try {
    contexto ??= new AudioContext();
    if (contexto.state === "suspended") void contexto.resume();
    return contexto;
  } catch {
    return null;
  }
}

/** Escala pentatónica de Do: cualquier combinación suena bien junta. */
const ESCALA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

function marimba(c: AudioContext, f: number, inicio: number, duracion = 0.5, volumen = 0.07) {
  const t0 = c.currentTime + inicio;
  const salida = c.createGain();
  salida.gain.setValueAtTime(0.0001, t0);
  salida.gain.exponentialRampToValueAtTime(volumen, t0 + 0.008);
  salida.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
  salida.connect(c.destination);
  // Fundamental + parcial agudo que se apaga rápido: el «toc» de la madera.
  for (const [mult, peso, caida] of [
    [1, 1, duracion],
    [4, 0.25, duracion * 0.25],
  ] as const) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = f * mult;
    g.gain.setValueAtTime(peso, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + caida);
    o.connect(g).connect(salida);
    o.start(t0);
    o.stop(t0 + duracion + 0.05);
  }
}

function soplo(c: AudioContext, inicio: number, duracion: number, desde: number, hasta: number, volumen = 0.03) {
  const t0 = c.currentTime + inicio;
  const muestras = Math.floor(c.sampleRate * duracion);
  const buffer = c.createBuffer(1, muestras, c.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < muestras; i++) datos[i] = Math.random() * 2 - 1;
  const fuente = c.createBufferSource();
  fuente.buffer = buffer;
  const filtro = c.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.Q.value = 1.2;
  filtro.frequency.setValueAtTime(desde, t0);
  filtro.frequency.exponentialRampToValueAtTime(hasta, t0 + duracion);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(volumen, t0 + duracion * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
  fuente.connect(filtro).connect(g).connect(c.destination);
  fuente.start(t0);
}

export type Efecto = "toque" | "paso" | "acierto" | "intento" | "voltear" | "unir" | "girar" | "patita" | "rescate" | "cierre";

/**
 * Reproduce un efecto. `nivel` sube la nota: cada acierto de la misión
 * suena un poco más alto, como una escalera que lleva al rescate.
 */
export function efecto(nombre: Efecto, nivel = 0): void {
  if (!leerPreferencias().efectos) return;
  const c = ctx();
  if (!c) return;
  const n = Math.max(0, Math.min(ESCALA.length - 3, nivel));
  switch (nombre) {
    case "toque":
      marimba(c, ESCALA[2] * 2, 0, 0.08, 0.025);
      break;
    case "paso":
      marimba(c, ESCALA[n], 0, 0.35, 0.06);
      break;
    case "acierto":
      marimba(c, ESCALA[n], 0, 0.4);
      marimba(c, ESCALA[n + 2], 0.11, 0.6);
      break;
    case "intento":
      marimba(c, 392, 0, 0.3, 0.045);
      marimba(c, 329.63, 0.14, 0.45, 0.04);
      break;
    case "voltear":
      soplo(c, 0, 0.16, 900, 2600, 0.025);
      break;
    case "unir":
      marimba(c, 261.63, 0, 0.18, 0.08);
      marimba(c, ESCALA[n + 2], 0.06, 0.4, 0.06);
      break;
    case "girar":
      marimba(c, ESCALA[4], 0, 0.06, 0.03);
      marimba(c, ESCALA[6], 0.07, 0.08, 0.025);
      break;
    case "patita":
      marimba(c, ESCALA[7 + (nivel % 3)], 0, 0.25, 0.035);
      break;
    case "rescate":
      [0, 2, 4, 5, 7].forEach((i, k) => marimba(c, ESCALA[i], k * 0.12, 0.7, 0.06));
      soplo(c, 0.55, 0.9, 3000, 7000, 0.015);
      break;
    case "cierre":
      [4, 2, 1, 0].forEach((i, k) => marimba(c, ESCALA[i] / 2, k * 0.5, 1.2, 0.045));
      break;
  }
}

const ultimaElegida = new WeakMap<readonly unknown[], number>();

/** Elige una frase al azar, sin repetir la última que salió de esa lista. */
export function alAzar<T>(lista: readonly T[]): T {
  if (lista.length <= 1) return lista[0];
  const antes = ultimaElegida.get(lista);
  let i = Math.floor(Math.random() * lista.length);
  if (i === antes) i = (i + 1 + Math.floor(Math.random() * (lista.length - 1))) % lista.length;
  ultimaElegida.set(lista, i);
  return lista[i];
}
