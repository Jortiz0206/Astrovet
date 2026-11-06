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
  | "caja";

export type IdCuarto = "sala" | "nebulosa" | "luna" | "selva";

/** Tamaño de la habitación en baldosas. */
export const LADO = 8;

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
}

export interface Cuarto {
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

/** Baldosas de las paredes donde se colocan los objetos de misión, en orden. */
const RINCONES: [number, number][] = [
  [0, 1],
  [0, 3],
  [0, 5],
  [1, 0],
  [5, 0],
  [7, 0],
  [7, 3],
  [7, 6],
  [2, 7],
  [5, 7],
];

const OBJETOS_MUNDO: Record<number, TipoSprite[]> = {
  1: ["telescopio", "cama", "estante", "planta", "lampara", "globo", "cohete"],
  2: ["telescopio", "sofa", "piano", "acuario", "mesa", "lampara", "estante", "planta", "cama", "cohete"],
  3: ["arbol", "planta", "estante", "mesa", "acuario", "globo"],
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
};

export function nombreSprite(s: TipoSprite): string {
  return NOMBRE_SPRITE[s];
}

const TEMAS: Record<number, { nombre: string; paredes: [string, string]; piso: [string, string]; cuarto: IdCuarto }> = {
  1: { nombre: "Cuarto Nebulosa", paredes: ["#E9DFFB", "#D3C4F2"], piso: ["#FBE3E8", "#F5D0DA"], cuarto: "nebulosa" },
  2: { nombre: "Cuarto Luna", paredes: ["#C9D4F2", "#AEBBE3"], piso: ["#E3E8F6", "#D3DAEE"], cuarto: "luna" },
  3: { nombre: "Cuarto Selva", paredes: ["#CFEBD6", "#B3DDBF"], piso: ["#F2E6C9", "#E7D6AE"], cuarto: "selva" },
};

export const CUARTO_DE_MUNDO: Record<number, IdCuarto> = { 1: "nebulosa", 2: "luna", 3: "selva" };

const cuartosMundo: Cuarto[] = MUNDOS.map((m) => {
  const t = TEMAS[m.id];
  return {
    id: t.cuarto,
    nombre: t.nombre,
    idMundo: m.id,
    paredes: t.paredes,
    piso: t.piso,
    puertas: [{ pared: "der", pos: 3, destino: { tipo: "cuarto", cuarto: "sala" } }],
    objetos: m.misiones.map((mi, i) => {
      const sprite = OBJETOS_MUNDO[m.id][i % OBJETOS_MUNDO[m.id].length];
      const [c, r] = RINCONES[i];
      return { sprite, c, r, idMision: mi.id, nombre: NOMBRE_SPRITE[sprite] };
    }),
    entrada: [3, 1],
    bienvenida: m.historia.split(". ")[0].replace(/\.$/, "") + ".",
  };
});

export const CUARTOS: Record<IdCuarto, Cuarto> = {
  sala: {
    id: "sala",
    nombre: "La sala",
    paredes: ["#FFE9C7", "#F6D7A8"],
    piso: ["#D9EFE6", "#C6E6D9"],
    puertas: [
      { pared: "der", pos: 1, destino: { tipo: "cuarto", cuarto: "nebulosa" } },
      { pared: "der", pos: 4, destino: { tipo: "cuarto", cuarto: "luna" } },
      { pared: "der", pos: 6, destino: { tipo: "cuarto", cuarto: "selva" } },
      { pared: "izq", pos: 3, destino: { tipo: "ruta", ruta: "/juego/clinica", nombre: "la clínica" } },
    ],
    objetos: [
      { sprite: "armario", c: 0, r: 6, ruta: "/juego/vestidor", nombre: "el armario" },
      { sprite: "pizarra", c: 7, r: 3, ruta: "/juego/mision/ESP-02", nombre: "la pizarra de las vocales" },
    ],
    entrada: [4, 5],
    bienvenida: "Cada puerta lleva a un cuarto con animales por rescatar.",
  },
  nebulosa: cuartosMundo[0],
  luna: cuartosMundo[1],
  selva: cuartosMundo[2],
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
  // Regalos de los animales (llegan al rescatarlos por primera vez).
  { id: "regalo-ada", nombre: "Colmena de Ada", sprite: "caja", tono: "#FFD166", regaloDe: "M1.1" },
  { id: "regalo-otto", nombre: "Alfombra de Otto", sprite: "alfombra", tono: "#C9A27C", regaloDe: "M1.4", pisable: true },
  { id: "regalo-patos", nombre: "Lámpara de los patos", sprite: "estrella", tono: "#FFB7B2", regaloDe: "M1.7" },
  { id: "regalo-mimi", nombre: "Cohete de Mimí", sprite: "cohete", tono: "#B9A8E6", regaloDe: "M2.2" },
  { id: "regalo-lalo", nombre: "Planta de Lalo", sprite: "planta", tono: "#8FD9B6", regaloDe: "M2.8" },
  { id: "regalo-paca", nombre: "Puff de Paca", sprite: "puff", tono: "#FFD166", regaloDe: "M2.10" },
  { id: "regalo-saul", nombre: "Globo de Saúl", sprite: "globo", tono: "#8FD9B6", regaloDe: "M3.1" },
  { id: "regalo-selva", nombre: "Árbol de la selva", sprite: "arbol", tono: "#3F9E73", regaloDe: "M3.6" },
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
