// «Mi casa»: el centro del juego. Cada habitación es un mundo y cada misión
// vive en un objeto de la habitación. Los muebles de decorar se compran con
// patitas o llegan como regalo de los animales rescatados.

import { MUNDOS } from "./contenido";

/** Dibujos isométricos disponibles (componentes/casa/Sprites.tsx). */
export type TipoSprite =
  | "cama"
  | "estante"
  | "planta"
  | "lampara"
  | "telescopio"
  | "sofa"
  | "mesa"
  | "piano"
  | "acuario"
  | "cohete"
  | "globo"
  | "arbol"
  | "armario"
  | "pizarra"
  | "alfombra"
  | "puff"
  | "estrella"
  | "caja"
  | "cristal"
  | "camilla"
  | "botiquin"
  | "banera";

export type IdCuarto = "sala" | "nebulosa" | "luna" | "selva" | "cometa" | "clinica";

/**
 * Forma del cuarto en baldosas. `ancho` corre a lo largo de la pared derecha
 * (eje c) y `fondo` a lo largo de la izquierda (eje r). Los `huecos` son
 * rectángulos [c0, r0, c1, r1) que no tienen piso: así salen cuartos en L o
 * con salientes. Las paredes van siempre al fondo (c = 0 y r = 0).
 */
export interface Forma {
  ancho: number;
  fondo: number;
  huecos?: [number, number, number, number][];
}

export function enPiso(f: Forma, c: number, r: number): boolean {
  if (c < 0 || r < 0 || c >= f.ancho || r >= f.fondo) return false;
  return !(f.huecos ?? []).some(([c0, r0, c1, r1]) => c >= c0 && c < c1 && r >= r0 && r < r1);
}

/** Largo de cada pared: baldosas seguidas con piso desde la esquina. */
export function largoPared(f: Forma, pared: "izq" | "der"): number {
  let n = 0;
  while (pared === "izq" ? enPiso(f, 0, n) : enPiso(f, n, 0)) n++;
  return n;
}

/** Baldosas del cuarto. */
export function baldosas(f: Forma): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r < f.fondo; r++) for (let c = 0; c < f.ancho; c++) if (enPiso(f, c, r)) out.push([c, r]);
  return out;
}

export interface Puerta {
  /** Pared: "der" corre a lo largo de r = 0; "izq" a lo largo de c = 0. */
  pared: "der" | "izq";
  /** Columna (pared der) o fila (pared izq) donde está la puerta. */
  pos: number;
  destino: { tipo: "cuarto"; cuarto: IdCuarto } | { tipo: "ruta"; ruta: string; nombre: string };
}

export interface ObjetoFijo {
  sprite: TipoSprite;
  c: number;
  r: number;
  /** Misión que abre (en los cuartos de mundo). */
  idMision?: string;
  /** Ruta a la que lleva (en la sala). */
  ruta?: string;
  nombre: string;
  tono?: string;
  /** Lo que cuenta el personaje al tocarlo (objetos sin misión ni ruta). */
  frase?: string;
}

export interface Cuarto extends Forma {
  id: IdCuarto;
  nombre: string;
  idMundo?: number;
  paredes: [string, string];
  piso: [string, string];
  puertas: Puerta[];
  objetos: ObjetoFijo[];
  /** Baldosa donde aparece el personaje al entrar. */
  entrada: [number, number];
  bienvenida: string;
}

/** Baldosa desde la que se usa una puerta. */
export function frentePuerta(p: Puerta): [number, number] {
  return p.pared === "der" ? [p.pos, 0] : [0, p.pos];
}

/**
 * Lugares para los objetos de misión: primero contra las paredes, luego por el
 * borde de adelante del piso, sin tapar puertas ni la entrada y sin pegarse
 * entre sí.
 */
function rinconesDe(f: Forma, puertas: Puerta[], entrada: [number, number]): [number, number][] {
  const cerca = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1;
  const prohibidas = [...puertas.map(frentePuerta), entrada];
  const out: [number, number][] = [];
  const poner = (b: [number, number]) => {
    if (!enPiso(f, ...b) || prohibidas.some((x) => cerca(x, b)) || out.some((x) => cerca(x, b))) return;
    out.push(b);
  };
  for (let r = 1; r < largoPared(f, "izq"); r++) poner([0, r]);
  for (let c = 1; c < largoPared(f, "der"); c++) poner([c, 0]);
  // Borde de adelante: baldosas con piso que no tienen vecina por delante.
  const borde = baldosas(f)
    .filter(([c, r]) => c > 0 && r > 0 && (!enPiso(f, c + 1, r) || !enPiso(f, c, r + 1)))
    .sort((a, b) => b[0] - b[1] - (a[0] - a[1]));
  borde.forEach(poner);
  return out;
}

const OBJETOS_MUNDO: Record<number, TipoSprite[]> = {
  1: ["telescopio", "cama", "estante", "planta", "lampara", "globo", "cohete"],
  2: ["telescopio", "sofa", "piano", "acuario", "mesa", "lampara", "estante", "planta", "cama", "cohete"],
  3: ["arbol", "planta", "estante", "mesa", "acuario", "globo"],
  4: ["cristal", "telescopio", "estante", "cristal", "lampara", "cohete", "globo"],
};

const NOMBRE_SPRITE: Record<TipoSprite, string> = {
  cama: "la cama",
  estante: "el estante",
  planta: "la planta",
  lampara: "la lámpara",
  telescopio: "el telescopio",
  sofa: "el sofá",
  mesa: "la mesa",
  piano: "el piano",
  acuario: "el acuario",
  cohete: "el cohete de juguete",
  globo: "el globo terráqueo",
  arbol: "el árbol",
  armario: "el armario",
  pizarra: "la pizarra",
  alfombra: "la alfombra",
  puff: "el puff",
  estrella: "la lámpara de estrella",
  caja: "la caja",
  cristal: "los cristales",
  camilla: "la camilla",
  botiquin: "el botiquín",
  banera: "la bañera",
};

export function nombreSprite(s: TipoSprite): string {
  return NOMBRE_SPRITE[s];
}

const TEMAS: Record<number, { nombre: string; paredes: [string, string]; piso: [string, string]; cuarto: IdCuarto }> = {
  1: { nombre: "Cuarto Nebulosa", paredes: ["#E9DFFB", "#D3C4F2"], piso: ["#FBE3E8", "#F5D0DA"], cuarto: "nebulosa" },
  2: { nombre: "Cuarto Luna", paredes: ["#C9D4F2", "#AEBBE3"], piso: ["#E3E8F6", "#D3DAEE"], cuarto: "luna" },
  3: { nombre: "Cuarto Selva", paredes: ["#CFEBD6", "#B3DDBF"], piso: ["#F2E6C9", "#E7D6AE"], cuarto: "selva" },
  4: { nombre: "Cuarto Cometa", paredes: ["#DCEFFA", "#BCDDF0"], piso: ["#F2FAFE", "#E0F0F9"], cuarto: "cometa" },
};

export const CUARTO_DE_MUNDO: Record<number, IdCuarto> = { 1: "nebulosa", 2: "luna", 3: "selva", 4: "cometa" };

/**
 * Forma de cada cuarto de mundo, según su historia:
 *  - Nebulosa: una L, como una nube con un pedazo que se lleva el viento.
 *  - Luna: un pasillo largo de base lunar que dobla al fondo.
 *  - Selva: la más grande, una L ancha para perderse entre plantas.
 *  - Cometa: con una punta que sobresale adelante, como el núcleo del cometa.
 */
const FORMAS: Record<number, Forma> = {
  1: { ancho: 9, fondo: 9, huecos: [[6, 6, 9, 9]] },
  2: { ancho: 7, fondo: 11, huecos: [[4, 7, 7, 11]] },
  3: { ancho: 11, fondo: 9, huecos: [[7, 5, 11, 9]] },
  4: { ancho: 9, fondo: 9, huecos: [[0, 6, 3, 9], [6, 6, 9, 9]] },
};

const cuartosMundo: Cuarto[] = MUNDOS.map((m) => {
  const t = TEMAS[m.id];
  const forma = FORMAS[m.id] ?? { ancho: 8, fondo: 8 };
  const puertas: Puerta[] = [{ pared: "der", pos: 3, destino: { tipo: "cuarto", cuarto: "sala" } }];
  const entrada: [number, number] = [3, 1];
  const rincones = rinconesDe(forma, puertas, entrada);
  return {
    id: t.cuarto,
    nombre: t.nombre,
    idMundo: m.id,
    ...forma,
    paredes: t.paredes,
    piso: t.piso,
    puertas,
    objetos: m.misiones.map((mi, i) => {
      const sprite = OBJETOS_MUNDO[m.id][i % OBJETOS_MUNDO[m.id].length];
      const [c, r] = rincones[i % rincones.length];
      return { sprite, c, r, idMision: mi.id, nombre: NOMBRE_SPRITE[sprite] };
    }),
    entrada,
    bienvenida: m.historia.split(". ")[0].replace(/\.$/, "") + ".",
  };
});

export const CUARTOS: Record<IdCuarto, Cuarto> = {
  sala: {
    id: "sala",
    nombre: "La sala",
    // Sala amplia y rectangular: el centro de la casa.
    ancho: 10,
    fondo: 8,
    paredes: ["#FFE9C7", "#F6D7A8"],
    piso: ["#F1D9B5", "#E8CBA0"],
    puertas: [
      { pared: "der", pos: 1, destino: { tipo: "cuarto", cuarto: "nebulosa" } },
      { pared: "der", pos: 4, destino: { tipo: "cuarto", cuarto: "luna" } },
      { pared: "der", pos: 7, destino: { tipo: "cuarto", cuarto: "selva" } },
      { pared: "izq", pos: 3, destino: { tipo: "cuarto", cuarto: "clinica" } },
      { pared: "izq", pos: 1, destino: { tipo: "cuarto", cuarto: "cometa" } },
    ],
    objetos: [
      { sprite: "armario", c: 0, r: 6, ruta: "/juego/vestidor", nombre: "el armario" },
      { sprite: "pizarra", c: 9, r: 3, ruta: "/juego/mision/ESP-02", nombre: "la pizarra de las vocales" },
    ],
    entrada: [4, 5],
    bienvenida: "Cada puerta lleva a un cuarto con animales por rescatar.",
  },
  nebulosa: cuartosMundo[0],
  luna: cuartosMundo[1],
  selva: cuartosMundo[2],
  cometa: cuartosMundo[3],
  clinica: {
    id: "clinica",
    nombre: "Clínica veterinaria",
    // Clínica en L: la sala de atención y, al fondo a la izquierda, el rincón del baño.
    ancho: 10,
    fondo: 8,
    huecos: [[6, 5, 10, 8]],
    paredes: ["#E6F7EF", "#CDEEDD"],
    piso: ["#FFFFFF", "#E2F6EC"],
    puertas: [{ pared: "der", pos: 3, destino: { tipo: "cuarto", cuarto: "sala" } }],
    objetos: [
      { sprite: "camilla", c: 0, r: 2, nombre: "la camilla", tono: "#FFB7B2", frase: "La camilla. Aquí revisamos a los pacientes con mucho cuidado." },
      { sprite: "botiquin", c: 1, r: 0, nombre: "el botiquín", tono: "#FFFFFF", frase: "El botiquín: vendas, jarabes y curitas. Nada de agujas." },
      { sprite: "banera", c: 8, r: 0, nombre: "la bañera", tono: "#9FD3F2", frase: "La bañera de burbujas, para los que se llenan de barro." },
      { sprite: "estante", c: 0, r: 5, nombre: "el estante", tono: "#8FD9B6", frase: "Aquí guardamos las fichas de cuidado de cada animal." },
      { sprite: "planta", c: 5, r: 7, nombre: "la planta", tono: "#FFB7B2", frase: "Una planta para que la clínica se sienta tranquila." },
    ],
    entrada: [3, 1],
    bienvenida: "Tus pacientes te esperan. Toca a uno para ver cómo se siente.",
  },
};

// ---------- Muebles para decorar ----------

export interface Mueble {
  id: string;
  nombre: string;
  sprite: TipoSprite;
  tono: string;
  /** Precio en patitas; sin precio, solo llega como regalo. */
  precio?: number;
  /** Misión cuyo animal lo regala al ser rescatado. */
  regaloDe?: string;
  /** Se puede caminar encima (alfombras). */
  pisable?: boolean;
}

export const MUEBLES: Mueble[] = [
  { id: "planta-rosa", nombre: "Planta rosada", sprite: "planta", tono: "#FFB7B2", precio: 5 },
  { id: "puff-lila", nombre: "Puff lila", sprite: "puff", tono: "#B9A8E6", precio: 6 },
  { id: "alfombra-nube", nombre: "Alfombra de nube", sprite: "alfombra", tono: "#9FD3F2", precio: 8, pisable: true },
  { id: "lampara-dorada", nombre: "Lámpara dorada", sprite: "lampara", tono: "#FFD166", precio: 10 },
  { id: "estrella-noche", nombre: "Estrella de noche", sprite: "estrella", tono: "#FFD166", precio: 12 },
  { id: "mesa-menta", nombre: "Mesita menta", sprite: "mesa", tono: "#8FD9B6", precio: 12 },
  { id: "sofa-coral", nombre: "Sofá coral", sprite: "sofa", tono: "#FFB7B2", precio: 18 },
  { id: "acuario-azul", nombre: "Acuario", sprite: "acuario", tono: "#9FD3F2", precio: 20 },
  { id: "piano-lila", nombre: "Piano lila", sprite: "piano", tono: "#8E7CC3", precio: 25 },
  { id: "arbol-casa", nombre: "Arbolito", sprite: "arbol", tono: "#6FBF8E", precio: 22 },
  { id: "cristal-hielo", nombre: "Cristales de hielo", sprite: "cristal", tono: "#9FD3F2", precio: 15 },
  // Regalos de los animales (llegan al rescatarlos por primera vez).
  { id: "regalo-ada", nombre: "Colmena de Ada", sprite: "caja", tono: "#FFD166", regaloDe: "M1.1" },
  { id: "regalo-otto", nombre: "Alfombra de Otto", sprite: "alfombra", tono: "#C9A27C", regaloDe: "M1.4", pisable: true },
  { id: "regalo-patos", nombre: "Lámpara de los patos", sprite: "estrella", tono: "#FFB7B2", regaloDe: "M1.7" },
  { id: "regalo-mimi", nombre: "Cohete de Mimí", sprite: "cohete", tono: "#B9A8E6", regaloDe: "M2.2" },
  { id: "regalo-lalo", nombre: "Planta de Lalo", sprite: "planta", tono: "#8FD9B6", regaloDe: "M2.8" },
  { id: "regalo-paca", nombre: "Puff de Paca", sprite: "puff", tono: "#FFD166", regaloDe: "M2.10" },
  { id: "regalo-saul", nombre: "Globo de Saúl", sprite: "globo", tono: "#8FD9B6", regaloDe: "M3.1" },
  { id: "regalo-selva", nombre: "Árbol de la selva", sprite: "arbol", tono: "#3F9E73", regaloDe: "M3.6" },
  { id: "regalo-tito", nombre: "Cristal de Tito", sprite: "cristal", tono: "#B9A8E6", regaloDe: "M4.2" },
  { id: "regalo-dino", nombre: "Lámpara de Dino", sprite: "lampara", tono: "#9FD3F2", regaloDe: "M4.6" },
  { id: "regalo-kira", nombre: "Cohete de Kira", sprite: "cohete", tono: "#9FD3F2", regaloDe: "M4.7" },
];

export function obtenerMueble(id: string): Mueble | undefined {
  return MUEBLES.find((m) => m.id === id);
}

export function regaloDeMision(idMision: string): Mueble | undefined {
  return MUEBLES.find((m) => m.regaloDe === idMision);
}

// ---------- Colores para decorar ----------

export const PAREDES: { nombre: string; tonos: [string, string] }[] = [
  { nombre: "Lavanda", tonos: ["#E9DFFB", "#D3C4F2"] },
  { nombre: "Durazno", tonos: ["#FFE9C7", "#F6D7A8"] },
  { nombre: "Cielo", tonos: ["#D6ECFA", "#B6DCF4"] },
  { nombre: "Menta", tonos: ["#D7F2E4", "#B9E6CE"] },
  { nombre: "Rosa", tonos: ["#FFE0E3", "#F9C6CC"] },
  { nombre: "Noche", tonos: ["#8E86C4", "#6F67AE"] },
];

export const PISOS: { nombre: string; tonos: [string, string] }[] = [
  { nombre: "Rosa", tonos: ["#FBE3E8", "#F5D0DA"] },
  { nombre: "Madera", tonos: ["#E9C9A0", "#DDB685"] },
  { nombre: "Menta", tonos: ["#D9EFE6", "#C6E6D9"] },
  { nombre: "Arena", tonos: ["#F2E6C9", "#E7D6AE"] },
  { nombre: "Luna", tonos: ["#E3E8F6", "#D3DAEE"] },
  { nombre: "Uva", tonos: ["#DCD3F4", "#C9BDEB"] },
];
