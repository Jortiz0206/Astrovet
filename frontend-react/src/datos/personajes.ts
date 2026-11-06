// Personajes que el niño puede usar como compañero. Misi viene de serie;
// los demás se desbloquean con patitas en el vestidor (sin dinero real ni
// premios al azar: el niño siempre ve qué obtiene y cuánto cuesta).

export type IdPersonaje = "misi" | "toby" | "lila" | "rayo" | "bambu" | "pipo" | "chispa";

export interface Personaje {
  id: IdPersonaje;
  nombre: string;
  especie: string;
  /** Patitas para desbloquearlo; 0 = disponible desde el inicio. */
  precio: number;
  /** Lo que dice al elegirlo. */
  saludo: string;
}

export const PERSONAJES: Personaje[] = [
  { id: "misi", nombre: "Misi", especie: "gato astronauta", precio: 0, saludo: "¡Soy Misi! Vamos a rescatar animales." },
  { id: "toby", nombre: "Toby", especie: "perro astronauta", precio: 25, saludo: "¡Guau! Soy Toby. ¡Qué buen equipo!" },
  { id: "lila", nombre: "Lila", especie: "coneja astronauta", precio: 35, saludo: "¡Hola! Soy Lila. Salto hasta la luna." },
  { id: "rayo", nombre: "Rayo", especie: "zorro astronauta", precio: 45, saludo: "Soy Rayo. ¡Corro rapidísimo!" },
  { id: "bambu", nombre: "Bambú", especie: "panda astronauta", precio: 55, saludo: "Soy Bambú. Me encanta ayudar." },
  { id: "pipo", nombre: "Pipo", especie: "pingüino astronauta", precio: 65, saludo: "¡Hola! Soy Pipo. Nado entre estrellas." },
  { id: "chispa", nombre: "Chispa", especie: "dragona astronauta", precio: 80, saludo: "¡Soy Chispa! Mi fuego es de colores." },
];

export function obtenerPersonaje(id: string | undefined): Personaje {
  return PERSONAJES.find((p) => p.id === id) ?? PERSONAJES[0];
}

// ---------- Pelajes de cada compañero (gratis, como los de Misi) ----------

/** Colores de un pelaje. Lo que no se indica queda como en el pelaje de serie. */
export interface Pelaje {
  id: string;
  nombre: string;
  base: string;
  borde: string;
  /** Orejas, puntas, parches o cuernos, según el personaje. */
  acento?: string;
  /** Segundo acento (espinas de Chispa, manchas de Toby). */
  acento2?: string;
  hocico?: string;
}

export const PELAJES: Record<Exclude<IdPersonaje, "misi">, Pelaje[]> = {
  toby: [
    { id: "caramelo", nombre: "Caramelo", base: "#C98B5A", borde: "#5A3418", acento: "#8A5530", acento2: "#A86B3C", hocico: "#F6E3C8" },
    { id: "dalmata", nombre: "Dálmata", base: "#FFFFFF", borde: "#4E4964", acento: "#3D3653", acento2: "#3D3653", hocico: "#F4F1FB" },
    { id: "chocolate", nombre: "Chocolate", base: "#7A4A2E", borde: "#3B200F", acento: "#4E2C17", acento2: "#5E3820", hocico: "#D9B08C" },
    { id: "dorado", nombre: "Dorado", base: "#E9B56A", borde: "#7A4F18", acento: "#C98B4A", acento2: "#F6D59B", hocico: "#FFF3D9" },
  ],
  lila: [
    { id: "nieve", nombre: "Nieve", base: "#F4F1FB", borde: "#7F7799", acento: "#FFB7B2", hocico: "#FFFFFF" },
    { id: "canela", nombre: "Canela", base: "#D9A47A", borde: "#6E4526", acento: "#FFB7B2", hocico: "#F6E3C8" },
    { id: "gris", nombre: "Gris", base: "#BDB9CC", borde: "#4E4964", acento: "#E58C86", hocico: "#F4F1FB" },
    { id: "manchas", nombre: "Manchas", base: "#FFFFFF", borde: "#6E6688", acento: "#FFB7B2", acento2: "#B08463", hocico: "#FFFFFF" },
  ],
  rayo: [
    { id: "fuego", nombre: "Fuego", base: "#F08A4B", borde: "#7A3A12", acento: "#3D3653", hocico: "#FFF8EE" },
    { id: "artico", nombre: "Ártico", base: "#EEF3FF", borde: "#5E6A99", acento: "#8E9BCB", hocico: "#FFFFFF" },
    { id: "plata", nombre: "Plata", base: "#9590A8", borde: "#3D3653", acento: "#2B2440", hocico: "#F4F1FB" },
    { id: "desierto", nombre: "Desierto", base: "#E9C27A", borde: "#7A5418", acento: "#A8742E", hocico: "#FFF8EE" },
  ],
  bambu: [
    { id: "clasico", nombre: "Clásico", base: "#FFFFFF", borde: "#4E4964", acento: "#3D3653", hocico: "#FFFFFF" },
    { id: "canela", nombre: "Canela", base: "#FFF6EA", borde: "#6E4526", acento: "#8A5A3C", hocico: "#FFFFFF" },
    { id: "rojo", nombre: "Panda rojo", base: "#D2643A", borde: "#6B2A12", acento: "#5A2A1A", hocico: "#FFF3E6" },
    { id: "luna", nombre: "Lunar", base: "#F4F1FB", borde: "#4E4964", acento: "#5E4E9A", hocico: "#FFFFFF" },
  ],
  pipo: [
    { id: "noche", nombre: "Noche", base: "#3D3653", borde: "#17132A", acento: "#FFB347" },
    { id: "oceano", nombre: "Océano", base: "#2F5E9E", borde: "#15294A", acento: "#FFB347" },
    { id: "emperador", nombre: "Emperador", base: "#3D3653", borde: "#17132A", acento: "#FFB347", acento2: "#FFD166" },
    { id: "rosado", nombre: "Rosado", base: "#E58C86", borde: "#7A3E4E", acento: "#FFD166" },
  ],
  chispa: [
    { id: "menta", nombre: "Menta", base: "#8FD9B6", borde: "#2F6B53", acento: "#FFD166", acento2: "#FFB7B2", hocico: "#C9F0DD" },
    { id: "lavanda", nombre: "Lavanda", base: "#B9A8E6", borde: "#4A3A80", acento: "#FFD166", acento2: "#8FD9B6", hocico: "#E4DCF8" },
    { id: "coral", nombre: "Coral", base: "#FFB7B2", borde: "#8A3F3A", acento: "#FFF3D1", acento2: "#B9A8E6", hocico: "#FFE7E5" },
    { id: "cielo", nombre: "Cielo", base: "#9FD3F2", borde: "#24557A", acento: "#FFFFFF", acento2: "#FFD166", hocico: "#DDF0FB" },
  ],
};

/** Pelaje elegido para un compañero (el primero si no hay o ya no existe). */
export function pelajeDe(personaje: Exclude<IdPersonaje, "misi">, id?: string): Pelaje {
  const lista = PELAJES[personaje];
  return lista.find((p) => p.id === id) ?? lista[0];
}
