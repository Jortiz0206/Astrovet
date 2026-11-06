// Clínica veterinaria (catálogo, sección 6): el niño atiende a los animales
// que ya rescató y practica con los contenidos de las misiones donde los
// rescató (RN-12). Sin límite de intentos, sin patitas y sin cambiar el
// progreso. Cada visita son 5 aciertos y deja un sello en la ficha de cuidados.

import type { ClaveCriatura } from "../componentes/Criatura";
import { hayDibujo } from "../componentes/Dibujo";
import type { EstadoMision, Mision } from "../tipos";
import { MISIONES, PALABRAS_LECTURA, PALABRAS_LECTURA_4, VOCALES } from "./contenido";

export type IdCuidado = "CL-01" | "CL-02" | "CL-03" | "CL-04" | "CL-05";

export const PASOS_VISITA = 5;

export interface Cuidado {
  id: IdCuidado;
  nombre: string;
  /** Lo que le pasa al animal (siempre leve y amable). */
  malestar: (p: Quien) => string;
  /** La consigna con la que Misi propone el juego. */
  consigna: (p: Quien) => string;
  /** Lo que dice al terminar. */
  cierre: (p: Quien) => string;
}

/** Lo justo para nombrar al paciente en una frase (uno o un grupo). */
export interface Quien {
  nombre: string;
  plural: boolean;
}

/** «La familia pato» → «la familia pato» en medio de una frase. */
export function enFrase(nombre: string): string {
  return /^(La|Las|El|Los|Todos) /.test(nombre) ? nombre[0].toLowerCase() + nombre.slice(1) : nombre;
}

const v = (p: Quien, uno: string, varios: string) => (p.plural ? varios : uno);

export const CUIDADOS: Record<IdCuidado, Cuidado> = {
  "CL-01": {
    id: "CL-01",
    nombre: "Escucha el corazón",
    malestar: (p) => `${p.nombre} ${v(p, "está", "están")} estornudando un poquito.`,
    consigna: () => "Pon el estetoscopio. Cada latido suena como un sonido: toca el que oíste.",
    cierre: () => "¡Late fuerte y feliz! Se acabaron los estornudos.",
  },
  "CL-02": {
    id: "CL-02",
    nombre: "Vendaje de sílabas",
    malestar: (p) => `${p.nombre} se ${v(p, "raspó", "rasparon")} una patita jugando.`,
    consigna: () => "Une la sílaba que oyes. Cada sílaba bien unida es una vuelta de venda.",
    cierre: () => "¡Cinco vueltas! La patita quedó curada.",
  },
  "CL-03": {
    id: "CL-03",
    nombre: "Jarabe de letras",
    malestar: (p) => `${p.nombre} ${v(p, "tiene", "tienen")} un poco de tos.`,
    consigna: (p) => `Escucha qué jarabe ${v(p, "pide", "piden")} y toca ese frasco.`,
    cierre: () => "¡Se acabó la tos! Qué rico estaba el jarabe.",
  },
  "CL-04": {
    id: "CL-04",
    nombre: "La comida favorita",
    malestar: (p) => `${p.nombre} ${v(p, "tiene", "tienen")} mucha hambre.`,
    consigna: (p) => `Mira lo que ${v(p, "quiere", "quieren")} comer. Lee los platos y toca el que dice eso.`,
    cierre: () => "¡Pancita llena! Leíste muy bien los platos.",
  },
  "CL-05": {
    id: "CL-05",
    nombre: "Baño de burbujas",
    malestar: (p) => `${p.nombre} se ${v(p, "llenó", "llenaron")} de barro.`,
    consigna: () => "Revienta las burbujas con el sonido que oyes. Cada una limpia una mancha.",
    cierre: () => "¡Todo limpio, brillante y suavecito!",
  },
};

export interface Paciente {
  /** Nombre del animal: es la clave, porque un animal puede salir en varias misiones. */
  nombre: string;
  especie: string;
  claves: ClaveCriatura[];
  /** Un grupo de animales (cambia cómo se dicen las frases). */
  plural: boolean;
  /** Misiones donde se rescató (la última se usa para registrar los intentos). */
  misiones: string[];
  idMundo: number;
  /** Letras y sílabas que se trabajaron con este animal. */
  unidades: string[];
  /** Sílabas consonante + vocal (para el vendaje). */
  silabas: string[];
  /** Palabras con dibujo (para la comida favorita). */
  palabras: string[];
  /** Todo lo que el niño ya conoce hasta esta misión: de aquí salen los distractores. */
  conocidas: string[];
  conocidasPalabras: string[];
}

export interface RondaClinica {
  objetivo: string;
  respuesta: string;
  opciones: string[];
  /** Consonante fija del vendaje. */
  base?: string;
}

const CORTA = /^[A-ZÑ]{1,2}$/;

function unidadesDe(m: Mision): string[] {
  const out: string[] = [];
  const poner = (x?: string) => x && CORTA.test(x) && out.push(x);
  for (const a of m.actividades)
    for (const r of a.rondas) {
      switch (a.tipo) {
        case "initial_sound":
          poner(r.respuesta);
          break;
        case "echo_sequence":
          r.secuencia?.forEach(poner);
          break;
        case "sort_two":
          r.grupos?.forEach(poner);
          break;
        case "memory_pairs":
          r.pares?.forEach((p) => poner(p[0]));
          break;
        case "build_figure":
        case "puzzle":
          r.secuencia?.forEach(poner);
          break;
        case "build_word_syllables":
        case "missing_syllable":
          r.partes?.forEach(poner);
          break;
        default:
          poner(r.objetivo);
      }
    }
  return [...new Set(out)];
}

function palabrasDe(m: Mision): string[] {
  const out: string[] = [];
  const poner = (x?: string) => x && x.length > 2 && hayDibujo(x) && out.push(x);
  for (const a of m.actividades)
    for (const r of a.rondas) {
      switch (a.tipo) {
        case "picture_word":
        case "read_match":
        case "build_word_syllables":
        case "missing_syllable":
        case "initial_sound":
          poner(r.objetivo);
          break;
        case "feed_animal":
          poner(r.respuesta);
          break;
        case "memory_pairs":
          r.pares?.forEach((p) => poner(p[1]));
          break;
        case "sort_two":
        case "cooking":
          r.opciones.forEach(poner);
          break;
      }
    }
  return [...new Set(out)];
}

const esSilaba = (u: string) => u.length === 2 && !VOCALES.includes(u[0] as (typeof VOCALES)[number]) && VOCALES.includes(u[1] as (typeof VOCALES)[number]);

/** Los animales rescatados, uno por nombre, con todo lo que se practicó con ellos. */
export function pacientes(estados: Record<string, EstadoMision>): Paciente[] {
  const lista: Paciente[] = [];
  MISIONES.forEach((m, i) => {
    if (estados[m.id] !== "completado") return;
    const previas = MISIONES.slice(0, i + 1);
    const conocidas = [...new Set(previas.flatMap(unidadesDe))];
    const conocidasPalabras = [...new Set(previas.flatMap(palabrasDe))];
    const p = lista.find((x) => x.nombre === m.animal.nombre);
    const unidades = unidadesDe(m);
    const palabras = palabrasDe(m);
    if (p) {
      p.misiones.push(m.id);
      p.idMundo = m.idMundo;
      p.unidades = [...new Set([...p.unidades, ...unidades])];
      p.palabras = [...new Set([...p.palabras, ...palabras])];
      p.silabas = p.unidades.filter(esSilaba);
      p.conocidas = conocidas;
      p.conocidasPalabras = conocidasPalabras;
      return;
    }
    lista.push({
      nombre: m.animal.nombre,
      especie: m.animal.especie,
      claves: m.animal.claves,
      plural: m.animal.claves.length > 1 && !m.animal.nombre.startsWith("La familia"),
      misiones: [m.id],
      idMundo: m.idMundo,
      unidades,
      silabas: unidades.filter(esSilaba),
      palabras,
      conocidas,
      conocidasPalabras,
    });
  });
  return lista;
}

/**
 * Juegos que sirven para este animal. Regla del catálogo: con animales de
 * misiones de solo sonidos (mundos 1 y 2) se escucha y se construye; la
 * lectura (CL-04) aparece con los del mundo 3 en adelante.
 */
export function cuidadosPara(p: Paciente): IdCuidado[] {
  const lista: IdCuidado[] = [];
  if (p.unidades.length) lista.push("CL-01");
  if (p.silabas.length) lista.push("CL-02");
  if (p.unidades.length) lista.push("CL-03");
  if (p.idMundo >= 3 && p.palabras.length) lista.push("CL-04");
  if (p.unidades.length) lista.push("CL-05");
  return lista;
}

function mezclar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Distractores del mismo tipo (letra con letra, sílaba con sílaba) que el niño ya conoce. */
function distractores(objetivo: string, conocidas: readonly string[], n: number): string[] {
  const mismo = conocidas.filter((x) => x !== objetivo && x.length === objetivo.length);
  const extra = objetivo.length === 1 ? VOCALES.filter((v) => v !== objetivo && !mismo.includes(v)) : [];
  return mezclar([...new Set([...mismo, ...extra])]).slice(0, n);
}

/** Pacientes que caben a la vez en el cuarto de la clínica. */
export const PACIENTES_EN_CUARTO = 6;

/** Misi propone un cuidado distinto cada vez que vuelve el mismo animal (y cada animal empieza distinto). */
export function cuidadoPropuesto(p: Paciente, lista: Paciente[], visitas: number): IdCuidado {
  const opciones = cuidadosPara(p);
  const desfase = Math.max(0, lista.findIndex((x) => x.nombre === p.nombre));
  return opciones[(visitas + desfase) % opciones.length];
}

/**
 * Quiénes están hoy en el cuarto: los que el niño llamó (en ese orden) y, si
 * sobra lugar, los que menos visitas tienen (los recién rescatados primero).
 */
export function pacientesEnCuarto(lista: Paciente[], llamados: string[] | undefined, visitas: (nombre: string) => number): Paciente[] {
  const elegidos = (llamados ?? []).map((n) => lista.find((p) => p.nombre === n)).filter((p): p is Paciente => !!p);
  const resto = lista
    .filter((p) => !elegidos.includes(p))
    .map((p, i) => ({ p, i }))
    .sort((a, b) => visitas(a.p.nombre) - visitas(b.p.nombre) || b.i - a.i)
    .map((x) => x.p);
  return [...elegidos, ...resto].slice(0, PACIENTES_EN_CUARTO);
}

/** Comidas que se pueden dibujar; en la comida favorita se prefieren a otras palabras. */
const COMIDAS = new Set(["TOMATE", "DONA", "SOPA", "LIMA", "SAL", "UVAS", "PERA", "PAN", "MANZANA", "SANDÍA", "MANGO", "AJO", "AGUACATE", "LECHE"]);

/** Palabras que el niño lee con este animal: las de su misión y las de lectura del mundo 3. */
function legibles(p: Paciente): string[] {
  const mundo4 = p.idMundo >= 4 ? PALABRAS_LECTURA_4 : [];
  return [...new Set([...p.palabras, ...PALABRAS_LECTURA.filter(hayDibujo), ...mundo4.filter(hayDibujo)])];
}

/** Lo que pide el animal en la comida favorita: su comida si la hay; si no, una comida que ya se lee. */
function comidasDe(p: Paciente): string[] {
  const suyas = p.palabras.filter((w) => COMIDAS.has(w));
  if (suyas.length) return suyas;
  const leidas = legibles(p).filter((w) => COMIDAS.has(w));
  return leidas.length ? leidas : p.palabras;
}

/** Cinco pasos de tratamiento, recorriendo los contenidos del animal. */
export function rondasClinica(p: Paciente, juego: IdCuidado): RondaClinica[] {
  const base = juego === "CL-02" ? p.silabas : juego === "CL-04" ? comidasDe(p) : p.unidades;
  const orden = mezclar(base);
  return Array.from({ length: PASOS_VISITA }, (_, i) => {
    const objetivo = orden[i % orden.length];
    if (juego === "CL-02") {
      const vocal = objetivo[1];
      return { objetivo, base: objetivo[0], respuesta: vocal, opciones: mezclar([vocal, ...mezclar(VOCALES.filter((v) => v !== vocal)).slice(0, 2)]) };
    }
    if (juego === "CL-04") {
      const otras = mezclar(legibles(p).filter((w) => w !== objetivo && w[0] !== objetivo[0])).slice(0, 2);
      return { objetivo, respuesta: objetivo, opciones: mezclar([objetivo, ...otras]) };
    }
    if (juego === "CL-05") {
      // Seis burbujas: dos con el sonido pedido.
      return { objetivo, respuesta: objetivo, opciones: mezclar([objetivo, objetivo, ...distractores(objetivo, p.conocidas, 4)]) };
    }
    return { objetivo, respuesta: objetivo, opciones: mezclar([objetivo, ...distractores(objetivo, p.conocidas, 2)]) };
  });
}
