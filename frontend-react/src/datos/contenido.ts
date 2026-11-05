// Contenido semilla del prototipo, tomado del «Catálogo de juegos,
// actividades y misiones». En el backend vivirá en learning_worlds,
// missions, activities, learning_items y activity_learning_items.

import type { ClaveCriatura } from "../componentes/Criatura";
import type { Actividad, Animal, Mision, Mundo, Ronda } from "../tipos";

export const VOCALES = ["A", "E", "I", "O", "U"] as const;

/** Rota una lista para que los distractores cambien entre rondas. */
function rotar<T>(lista: T[], n: number): T[] {
  if (lista.length === 0) return lista;
  const k = n % lista.length;
  return [...lista.slice(k), ...lista.slice(0, k)];
}

function distractores(objetivo: string, pool: readonly string[], n: number, desfase = 0, evitar: string[] = []): string[] {
  return rotar(
    pool.filter((x) => x !== objetivo && !evitar.includes(x)),
    desfase,
  ).slice(0, n);
}

// ---------- Constructores de actividades (una función por mecánica) ----------

/** ACT-01. Con un solo objetivo la dificultad sube de 2 a 4 opciones. */
function escuchaElige(id: string, objetivos: string[], pool: readonly string[], opciones = 3): Actividad {
  const rondas: Ronda[] =
    objetivos.length === 1
      ? [2, 3, 4].map((n, i) => ({ objetivo: objetivos[0], respuesta: objetivos[0], opciones: [objetivos[0], ...distractores(objetivos[0], pool, n - 1, i)] }))
      : objetivos.map((v, i) => ({ objetivo: v, respuesta: v, opciones: [v, ...distractores(v, pool, opciones - 1, i)] }));
  return { id, tipo: "listen_choose", rondas };
}

/** ACT-02. Evita como distractor la segunda letra de la palabra para no confundir. */
function sonidoInicial(id: string, palabras: string[], pool: readonly string[]): Actividad {
  return {
    id,
    tipo: "initial_sound",
    rondas: palabras.map((p, i) => ({ objetivo: p, respuesta: p[0], opciones: [p[0], ...distractores(p[0], pool, 2, i, [p[1]])] })),
  };
}

/** ACT-03. Seis estrellas: tres con el sonido pedido y tres distractoras. */
function cazaEstrellas(id: string, objetivos: string[], pool: readonly string[]): Actividad {
  return {
    id,
    tipo: "letter_hunt",
    rondas: objetivos.map((v, i) => {
      const [d1, d2, d3] = distractores(v, pool, 3, i);
      return { objetivo: v, respuesta: v, opciones: [v, d1, v, d2, d3 ?? d1, v] };
    }),
  };
}

/** ACT-04. Oye una palabra y toca su dibujo. */
function imagenPalabra(id: string, palabras: string[], pool: string[], opciones = 3): Actividad {
  return {
    id,
    tipo: "picture_word",
    rondas: palabras.map((p, i) => ({ objetivo: p, respuesta: p, opciones: [p, ...distractores(p, pool, opciones - 1, i)] })),
  };
}

/** ACT-05. Pares [letra o sílaba, palabra con dibujo]. */
function memoria(id: string, pares: [string, string][]): Actividad {
  return { id, tipo: "memory_pairs", rondas: [{ objetivo: pares.map((p) => p[0]).join(" "), respuesta: "pares", opciones: [], pares }] };
}

/** ACT-10. La consonante está fija; el niño arrastra la vocal que oye. */
function unePiezas(id: string, silabas: string[], opciones = 3): Actividad {
  return {
    id,
    tipo: "build_syllable",
    rondas: silabas.map((s, i) => {
      const vocal = s.slice(1);
      return { objetivo: s, base: s[0], respuesta: vocal, opciones: [vocal, ...distractores(vocal, VOCALES, (i === 0 ? 2 : opciones) - 1, i + 1)] };
    }),
  };
}

/** ACT-11. Gira la ruleta de vocales hasta formar la sílaba pedida. */
function ruleta(id: string, silabas: string[]): Actividad {
  return {
    id,
    tipo: "vowel_wheel",
    rondas: silabas.map((s) => ({ objetivo: s, base: s[0], respuesta: s.slice(1), opciones: [...VOCALES] })),
  };
}

/** ACT-18. Grupos que empiezan igual y una intrusa. */
function intrusa(id: string, grupos: [string[], string][]): Actividad {
  return {
    id,
    tipo: "odd_one",
    rondas: grupos.map(([iguales, diferente]) => ({ objetivo: diferente, respuesta: diferente, opciones: [...iguales, diferente] })),
  };
}

/** ACT-12. Arrastra las sílabas en orden; con una tercera sílaba como distractora sube la dificultad. */
function armaPalabra(id: string, palabras: [string, string[], string?][]): Actividad {
  return {
    id,
    tipo: "build_word_syllables",
    rondas: palabras.map(([palabra, partes, extra]) => ({ objetivo: palabra, respuesta: palabra, partes, opciones: extra ? [...partes, extra] : [...partes] })),
  };
}

/** ACT-13. Completa la sílaba que falta. */
function silabaPerdida(id: string, items: [string, string[], number, string[]][]): Actividad {
  return {
    id,
    tipo: "missing_syllable",
    rondas: items.map(([palabra, partes, hueco, otras]) => ({ objetivo: palabra, respuesta: partes[hueco], partes, hueco, opciones: [partes[hueco], ...otras] })),
  };
}

/** ACT-17. Lee la palabra (sin audio inicial) y toca su dibujo. */
function leeEncuentra(id: string, palabras: string[], pool: string[], opciones = 3): Actividad {
  return {
    id,
    tipo: "read_match",
    rondas: palabras.map((p, i) => ({ objetivo: p, respuesta: p, opciones: [p, ...distractores(p, pool, (i === 0 ? 2 : opciones) - 1, i)] })),
  };
}

/** Globos: revienta los que suenan como el objetivo (meta: cuántos). */
function globos(id: string, objetivos: string[], pool: readonly string[], meta = 3): Actividad {
  return {
    id,
    tipo: "balloon_pop",
    rondas: objetivos.map((o, i) => ({ objetivo: o, respuesta: o, opciones: [o, ...distractores(o, pool, 3, i)], meta })),
  };
}

/** Piedras del río: en cada columna, la piedra con el objetivo y una distractora. */
function piedras(id: string, objetivos: string[], pool: readonly string[], columnas = 3): Actividad {
  return {
    id,
    tipo: "stepping_stones",
    rondas: objetivos.map((o, i) => ({
      objetivo: o,
      respuesta: o,
      opciones: [o],
      filas: Array.from({ length: columnas }, (_, c) => [o, distractores(o, pool, 1, i + c)[0]]),
    })),
  };
}

/** Clasifica: dibujos que van a uno de dos planetas según su primer sonido. */
function clasifica(id: string, grupos: [string, string], palabras: string[]): Actividad {
  return { id, tipo: "sort_two", rondas: [{ objetivo: grupos.join(" "), respuesta: "", opciones: palabras, grupos }] };
}

/** Traza la estela: una ronda por letra. */
function traza(id: string, letras: string[]): Actividad {
  return { id, tipo: "trace_letter", rondas: letras.map((l) => ({ objetivo: l, respuesta: l, opciones: [l] })) };
}

/** Eco de Misi: secuencias de 2 o 3 sonidos para repetir en orden. */
function eco(id: string, secuencias: string[][], pool: readonly string[]): Actividad {
  return {
    id,
    tipo: "echo_sequence",
    rondas: secuencias.map((sec, i) => {
      const fichas = [...new Set(sec)];
      const extra = rotar(
        pool.filter((x) => !fichas.includes(x)),
        i,
      ).slice(0, Math.max(0, 4 - fichas.length));
      return { objetivo: sec.join(" "), respuesta: sec.join(" "), secuencia: sec, opciones: [...fichas, ...extra] };
    }),
  };
}

/** Regalo para el animal: [sonido, dibujo correcto, dibujos distractores]. */
function regalo(id: string, items: [string, string, string[]][]): Actividad {
  return { id, tipo: "feed_animal", rondas: items.map(([o, r, otros]) => ({ objetivo: o, respuesta: r, opciones: [r, ...otros] })) };
}

function animal(nombre: string, especie: string, ...claves: ClaveCriatura[]): Animal {
  return { nombre, especie, claves };
}

function mision(idMundo: number, orden: number, titulo: string, bicho: Animal, contenido: string, actividades: Actividad[], patitas = 10): Mision {
  return { id: `M${idMundo}.${orden}`, idMundo, orden, titulo, animal: bicho, contenido, patitas, actividades };
}

// ---------- Mundo 1: Planeta Nebulosa (vocales) ----------

const V = VOCALES;

const mundo1: Mundo = {
  id: 1,
  nombre: "Planeta Nebulosa",
  tema: "Vocales A, E, I, O, U",
  historia: "La niebla de colores dejó perdidos a varios animales. Cada vocal despeja una nube.",
  revelado: "nube",
  disponible: true,
  // Cada misión abre con un juego distinto al de la anterior (PRODUCT.md: variar para no cansar).
  misiones: [
    mision(1, 1, "La nube de la A", animal("Ada", "abeja", "abeja"), "A; ABEJA, AVIÓN", [
      escuchaElige("M1.1-1", ["A"], V),
      globos("M1.1-2", ["A"], V),
      imagenPalabra("M1.1-3", ["ABEJA", "AVIÓN"], ["OSO", "ISLA", "UVAS"], 2),
    ]),
    mision(1, 2, "La nube de la E", animal("Elio", "elefante", "elefante"), "E; ELEFANTE, ESTRELLA", [
      piedras("M1.2-1", ["E"], V),
      sonidoInicial("M1.2-2", ["ELEFANTE", "ESTRELLA"], V),
      traza("M1.2-3", ["E"]),
    ]),
    mision(1, 3, "La nube de la I", animal("Isa", "iguana", "iguana"), "I; IGUANA, ISLA", [
      globos("M1.3-1", ["I"], V),
      regalo("M1.3-2", [["I", "ISLA", ["OSO", "UVAS"]], ["I", "IGUANA", ["ABEJA", "ESTRELLA"]]]),
      memoria("M1.3-3", [["I", "IGUANA"], ["A", "AVIÓN"], ["E", "ELEFANTE"]]),
    ]),
    mision(1, 4, "La nube de la O", animal("Otto", "oso", "oso"), "O; OSO, OVEJA", [
      traza("M1.4-1", ["O"]),
      piedras("M1.4-2", ["O"], V),
      cazaEstrellas("M1.4-3", ["O"], V),
    ]),
    mision(1, 5, "La nube de la U", animal("Uli", "unicornio", "unicornio"), "U; UVAS, UÑA", [
      regalo("M1.5-1", [["U", "UVAS", ["ISLA", "AVIÓN"]], ["U", "UÑA", ["OVEJA", "ESTRELLA"]]]),
      globos("M1.5-2", ["U"], V),
      clasifica("M1.5-3", ["U", "A"], ["UVAS", "ABEJA", "UÑA", "AVIÓN"]),
    ]),
    mision(1, 6, "El coro de vocales", animal("Tula", "tortuga", "tortuga"), "Repaso de A, E, I, O, U", [
      eco("M1.6-1", [["A", "E"], ["O", "I"], ["U", "A", "E"]], V),
      clasifica("M1.6-2", ["E", "O"], ["ELEFANTE", "OSO", "ESTRELLA", "OVEJA"]),
      memoria("M1.6-3", [["A", "AVIÓN"], ["E", "ESTRELLA"], ["O", "OVEJA"], ["U", "UVAS"]]),
    ], 20),
    mision(1, 7, "Gran rescate: la tormenta de nubes", animal("La familia pato", "patos", "pato", "pato", "pato"), "Las 5 vocales mezcladas", [
      piedras("M1.7-1", ["A", "I"], V),
      escuchaElige("M1.7-2", ["U", "A", "I"], V, 4),
      regalo("M1.7-3", [["O", "OVEJA", ["ISLA", "UVAS"]], ["E", "ESTRELLA", ["ABEJA", "UÑA"]]]),
      traza("M1.7-4", ["U"]),
    ], 30),
  ],
};

// ---------- Mundo 2: Luna Mágica (M, P, S, L) ----------

const SIL = (c: string) => V.map((v) => c + v);
const TODAS_SIL = ["M", "P", "S", "L"].flatMap(SIL);
const mimi = animal("Mimí", "mona", "mona");
const pepe = animal("Pepe", "pingüino", "pinguino");
const sisi = animal("Sisi", "serpiente", "serpiente");
const lalo = animal("Lalo", "león", "leon");

const mundo2: Mundo = {
  id: 2,
  nombre: "Luna Mágica",
  tema: "Consonantes M, P, S, L",
  historia: "Los animales cayeron en los cráteres. Cada sílaba construye un escalón para que salgan.",
  revelado: "crater",
  disponible: true,
  misiones: [
    mision(2, 1, "El sonido de Mimí", mimi, "Sonido /m/", [
      globos("M2.1-1", ["M"], ["A", "O", "E", "U"]),
      sonidoInicial("M2.1-2", ["MANZANA", "MAPA", "MESA"], ["O", "U", "I", "E", "A"]),
      traza("M2.1-3", ["M"]),
    ]),
    mision(2, 2, "La escalera de la M", mimi, "MA, ME, MI, MO, MU", [
      unePiezas("M2.2-1", ["MA", "ME", "MI"]),
      piedras("M2.2-2", ["MO"], SIL("M")),
      ruleta("M2.2-3", ["MU", "ME"]),
    ]),
    mision(2, 3, "El sonido de Pepe", pepe, "Sonido /p/", [
      regalo("M2.3-1", [["P", "PATO", ["MESA", "OSO"]], ["P", "PELOTA", ["MANZANA", "UVAS"]], ["P", "PERRO", ["MAPA", "ISLA"]]]),
      escuchaElige("M2.3-2", ["P"], ["M", "A", "O", "E"]),
      traza("M2.3-3", ["P"]),
    ]),
    mision(2, 4, "La escalera de la P", pepe, "PA, PE, PI, PO, PU", [
      ruleta("M2.4-1", ["PO", "PU", "PA"]),
      eco("M2.4-2", [["PA", "PE"], ["PI", "PO", "PU"]], SIL("P")),
      intrusa("M2.4-3", [[["PA", "PE"], "MA"], [["PO", "PU"], "MI"], [["MA", "ME"], "PI"]]),
    ]),
    mision(2, 5, "El sonido de Sisi", sisi, "Sonido /s/", [
      clasifica("M2.5-1", ["S", "M"], ["SAPO", "MANZANA", "SOL", "MESA", "SANDÍA", "MAPA"]),
      globos("M2.5-2", ["S"], ["M", "P", "A", "O"]),
      memoria("M2.5-3", [["S", "SAPO"], ["M", "MANZANA"], ["P", "PATO"]]),
    ]),
    mision(2, 6, "La escalera de la S", sisi, "SA, SE, SI, SO, SU", [
      unePiezas("M2.6-1", ["SA", "SE", "SI"]),
      piedras("M2.6-2", ["SO", "SU"], [...SIL("S"), "MA", "PE"]),
      escuchaElige("M2.6-3", ["SU", "SA", "SO"], [...SIL("S"), "MA", "PE"]),
    ]),
    mision(2, 7, "El sonido de Lalo", lalo, "Sonido /l/", [
      sonidoInicial("M2.7-1", ["LEÓN", "LUNA", "LUPA"], ["M", "P", "S", "A", "O"]),
      traza("M2.7-2", ["L"]),
      cazaEstrellas("M2.7-3", ["L"], ["M", "P", "S"]),
    ]),
    mision(2, 8, "La escalera de la L", lalo, "LA, LE, LI, LO, LU", [
      eco("M2.8-1", [["LA", "LE"], ["LI", "LO", "LU"]], SIL("L")),
      ruleta("M2.8-2", ["LO", "LU", "LE"]),
      intrusa("M2.8-3", [[["LA", "LO"], "SA"], [["LE", "LI"], "PE"], [["SA", "SO"], "LU"]]),
    ]),
    mision(2, 9, "Mezcla lunar", animal("Nina", "lechuza", "lechuza"), "Repaso de las 20 sílabas", [
      memoria("M2.9-1", [["MA", "MAPA"], ["PE", "PERRO"], ["SO", "SOL"], ["LU", "LUNA"]]),
      clasifica("M2.9-2", ["P", "L"], ["PATO", "LUNA", "PELOTA", "LEÓN", "PERRO", "LUPA"]),
      globos("M2.9-3", ["PU", "SI"], TODAS_SIL, 2),
    ], 20),
    mision(2, 10, "Gran rescate: el cráter gigante", animal("Paca", "burra", "burra"), "Sílabas mezcladas y primeras palabras", [
      piedras("M2.10-1", ["SA", "LI"], TODAS_SIL),
      unePiezas("M2.10-2", ["PU", "SO", "LA"]),
      regalo("M2.10-3", [["L", "LIMA", ["SOPA", "MESA"]], ["S", "SOPA", ["PELOTA", "LUNA"]]]),
      intrusa("M2.10-4", [[["MU", "MO", "MA"], "SI"], [["LI", "LA", "LE"], "PO"]]),
    ], 30),
  ],
};

// ---------- Mundo 3: Selva Cósmica (primeras palabras) ----------

const LECTURA = ["MAPA", "MESA", "MAMÁ", "SOPA", "SAPO", "PALA", "PALO", "LUPA", "LIMA", "MULA", "LOMA", "OLA", "ALA", "OSO", "PISO", "PAPÁ", "MIMO", "PELO", "SALA", "PUMA"];

const mundo3: Mundo = {
  id: 3,
  nombre: "Selva Cósmica",
  tema: "Primeras palabras",
  historia: "Los animales necesitan que leas los carteles del camino para encontrar la salida.",
  revelado: "lianas",
  disponible: true,
  misiones: [
    mision(3, 1, "El mapa de Saúl", animal("Saúl", "sapo", "sapo"), "MAPA, MESA, MAMÁ", [
      armaPalabra("M3.1-1", [["MAPA", ["MA", "PA"]], ["MESA", ["ME", "SA"]], ["MAMÁ", ["MA", "MÁ"]]]),
      globos("M3.1-2", ["MAPA"], ["MESA", "MAMÁ", "SOPA", "LUPA"], 2),
      leeEncuentra("M3.1-3", ["MAPA", "MESA", "MAMÁ"], ["SOPA", "LUPA", "OSO", "MESA", "MAPA"]),
    ]),
    mision(3, 2, "La sopa de Paco", animal("Paco", "puma", "puma"), "SOPA, SAPO, PALA, PALO", [
      piedras("M3.2-1", ["SOPA"], ["SAPO", "SALA", "PALO"]),
      silabaPerdida("M3.2-2", [["PALA", ["PA", "LA"], 1, ["LO", "MU"]], ["PALO", ["PA", "LO"], 1, ["LA", "SE"]]]),
      armaPalabra("M3.2-3", [["SOPA", ["SO", "PA"]], ["SAPO", ["SA", "PO"], "LA"]]),
    ]),
    mision(3, 3, "La lupa de Lupe", animal("Lupe", "mula", "mula"), "LUPA, LIMA, MULA, LOMA", [
      leeEncuentra("M3.3-1", ["LUPA", "LIMA"], ["LOMA", "MULA", "PALA"]),
      regalo("M3.3-2", [["LU", "LUPA", ["LIMA", "MULA"]], ["MU", "MULA", ["LOMA", "MESA"]]]),
      intrusa("M3.3-3", [[["LUPA", "LIMA"], "MESA"], [["MAPA", "MULA"], "SOPA"]]),
    ]),
    mision(3, 4, "Las olas de Lola", animal("Lola", "tortuga marina", "tortuga-marina"), "OLA, ALA, OSO, PISO", [
      armaPalabra("M3.4-1", [["OLA", ["O", "LA"]], ["ALA", ["A", "LA"]], ["OSO", ["O", "SO"]], ["PISO", ["PI", "SO"]]]),
      clasifica("M3.4-2", ["O", "A"], ["OLA", "ALA", "OSO", "AVIÓN", "OVEJA", "ABEJA"]),
      memoria("M3.4-3", [["OLA", "OLA"], ["OSO", "OSO"], ["ALA", "ALA"]]),
    ]),
    mision(3, 5, "La casa de los mimos", animal("Mimí y Pepe", "mona y pingüino", "mona", "pinguino"), "PAPÁ, MIMO, PELO, SALA", [
      silabaPerdida("M3.5-1", [["PELO", ["PE", "LO"], 1, ["LA", "MA"]], ["SALA", ["SA", "LA"], 0, ["PI", "MU"]]]),
      globos("M3.5-2", ["MIMO"], ["MAMÁ", "PAPÁ", "MULA", "LIMA"], 2),
      armaPalabra("M3.5-3", [["PAPÁ", ["PA", "PÁ"], "MI"], ["MIMO", ["MI", "MO"], "PA"], ["SALA", ["SA", "LA"], "LO"]]),
    ], 20),
    mision(3, 6, "Gran rescate: los carteles de la selva", animal("Todos los animales", "amigos de la luna", "mona", "leon", "pinguino"), "Palabras de los mundos 2 y 3", [
      piedras("M3.6-1", ["PUMA"], ["PALA", "MULA", "LOMA"]),
      armaPalabra("M3.6-2", [["PALO", ["PA", "LO"], "MA"], ["LUPA", ["LU", "PA"], "SO"]]),
      leeEncuentra("M3.6-3", ["PUMA", "LOMA"], ["MULA", "LIMA", "SAPO"]),
      silabaPerdida("M3.6-4", [["SOPA", ["SO", "PA"], 0, ["MA", "LI"]], ["MESA", ["ME", "SA"], 1, ["PO", "LU"]]]),
    ], 30),
  ],
};

/** Palabras que se leen en el mundo 3 (solo usan letras ya trabajadas). */
export const PALABRAS_LECTURA = LECTURA;

export const MUNDOS: Mundo[] = [mundo1, mundo2, mundo3];

/** Todas las misiones en el orden del recorrido (RN-06). */
export const MISIONES: Mision[] = MUNDOS.flatMap((m) => m.misiones);

/** ESP-02 Estación de vocales: práctica libre, siempre disponible. */
export const ESTACION_VOCALES: Mision = {
  id: "ESP-02",
  idMundo: 1,
  orden: 0,
  titulo: "Estación de vocales",
  animal: animal("Capitán Misi", "gato astronauta"),
  contenido: "Práctica libre de A, E, I, O, U",
  patitas: 0,
  actividades: [escuchaElige("ESP-02-1", ["A", "E", "I", "O", "U"], V), cazaEstrellas("ESP-02-2", ["O"], V), memoria("ESP-02-3", [["A", "AVIÓN"], ["E", "ESTRELLA"], ["I", "ISLA"]])],
};

export function obtenerMision(id: string | undefined): Mision | undefined {
  if (id === ESTACION_VOCALES.id) return ESTACION_VOCALES;
  return MISIONES.find((m) => m.id === id);
}

export function obtenerMundo(id: number): Mundo | undefined {
  return MUNDOS.find((m) => m.id === id);
}
