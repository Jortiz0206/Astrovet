import type { ClaveCriatura } from "./componentes/Criatura";
import type { IdPersonaje } from "./datos/personajes";

// Tipos del dominio. Reflejan las tablas del modelo de datos (sección 17)
// para que la capa simulada se pueda cambiar por la API de FastAPI sin
// tocar las pantallas.

export type Rol = "tutor" | "teacher" | "admin";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  hashContrasena: string; // users.password_hash (en el backend será Bcrypt)
  activo: boolean;
  aceptoPoliticaEn: string; // users.privacy_accepted_at
  versionTerminos: string; // users.terms_version
  creadoEn: string;
}

export type UsuarioPublico = Omit<Usuario, "hashContrasena">;

export const COLORES_PELAJE = [
  "naranja",
  "gris",
  "negro",
  "blanco",
  "atigrado",
  "tricolor",
] as const;
export type ColorPelaje = (typeof COLORES_PELAJE)[number];

// players + avatar_config
export interface Jugador {
  id: string;
  idUsuario: string;
  apodo: string;
  edad?: number; // opcional por decisión del equipo
  minutosSesion: number; // 5 a 10 (RN-02)
  patitas: number; // players.golden_paws
  activo: boolean;
  pelaje: ColorPelaje; // avatar_config.fur_color
  /** Compañero elegido (avatar_config.character). Sin valor: Misi. */
  personaje?: IdPersonaje;
  /** Compañeros desbloqueados con patitas (player_items de tipo personaje). Misi siempre está. */
  personajes?: IdPersonaje[];
  /** Pelaje elegido para cada compañero que no es Misi (Misi usa `pelaje`). */
  pelajes?: Partial<Record<IdPersonaje, string>>;
  creadoEn: string;
  actualizadoEn: string;
}

export type EstadoMision = "bloqueado" | "disponible" | "en_progreso" | "completado";

// player_mission_progress
export interface ProgresoMision {
  idJugador: string;
  idMision: string;
  estado: EstadoMision;
  iniciadoEn?: string;
  completadoEn?: string;
  patitasOtorgadas: number;
}

export type EstadoSesion = "active" | "completed" | "abandoned";

// game_sessions
export interface SesionJuego {
  id: string;
  idJugador: string;
  inicioEn: string;
  ultimaActividadEn: string;
  finEn?: string;
  minutosMax: number; // max_minutes_snapshot
  estado: EstadoSesion;
}

// activity_attempts
export interface Intento {
  id: string;
  idSesion: string;
  idMision: string;
  idActividad: string;
  contenido: string; // letra, sílaba o palabra trabajada (id_learning_item)
  respuesta: string; // selected_answer
  correcta: boolean;
  tiempoMs: number;
  ayuda: boolean;
  repeticionesAudio: number;
  practica: boolean; // clínica o estación de vocales: no cambia progreso
  en: string;
}

// paw_transactions
export interface MovimientoPatitas {
  id: string;
  idJugador: string;
  idSesion?: string;
  idMision?: string;
  cantidad: number;
  motivo: "mision" | "compra" | "personaje";
  en: string;
}

// Muebles del jugador en «Mi casa» (player_items). Sin cuarto: guardado en el baúl.
export interface MuebleJugador {
  id: string;
  idJugador: string;
  idMueble: string;
  origen: "compra" | "regalo";
  cuarto?: string;
  c?: number;
  r?: number;
  en: string;
}

// Visitas terminadas en la clínica (ficha de cuidados): un sello por visita.
export interface Cuidado {
  id: string;
  idJugador: string;
  /** Animal atendido (nombre, porque un animal puede salir en varias misiones). */
  animal: string;
  /** Juego de cuidado: CL-01 … CL-05. */
  juego: string;
  en: string;
}

// Cómo decoró el niño cada cuarto: colores y posición de los objetos de misión.
export interface AjusteCuarto {
  idJugador: string;
  cuarto: string;
  paredes?: [string, string];
  piso?: [string, string];
  /** Índice del objeto de misión → baldosa elegida. */
  posiciones: Record<string, [number, number]>;
  /** Clínica: animales que están en el cuarto (los demás descansan en «Camas»). */
  pacientes?: string[];
}

// ---------- Contenido de aprendizaje ----------

export type TipoActividad =
  | "listen_choose" // ACT-01 Escucha y elige
  | "initial_sound" // ACT-02 Sonido inicial
  | "letter_hunt" // ACT-03 Caza de estrellas
  | "picture_word" // ACT-04 Imagen y palabra
  | "memory_pairs" // ACT-05 Memoria cósmica
  | "build_syllable" // ACT-10 Une las piezas
  | "vowel_wheel" // ACT-11 Ruleta de vocales
  | "build_word_syllables" // ACT-12 Arma la palabra
  | "missing_syllable" // ACT-13 Sílaba perdida
  | "read_match" // ACT-17 Lee y encuentra
  | "odd_one" // ACT-18 La palabra intrusa
  | "balloon_pop" // Globos: revienta los que suenan igual
  | "stepping_stones" // Piedras del río: cruza pisando el sonido
  | "sort_two" // Clasifica en dos planetas por el primer sonido
  | "trace_letter" // ACT-23 Traza la estela
  | "echo_sequence" // Eco de Misi: repite la secuencia
  | "feed_animal" // Regalo para el animal
  | "puzzle" // Rompecabezas: cada pieza lleva un sonido
  | "build_figure" // Arma la figura: pieza con letra en su lugar
  | "slingshot" // Resortera: lanza el ovillo a la torre del sonido
  | "fishing" // Pesca los peces con el sonido
  | "rocket_race" // Carrera del cohete: elige el carril del sonido
  | "cooking"; // Cocina: a la olla lo que empieza con el sonido

export interface Ronda {
  /** Lo que se trabaja: la letra o la palabra que suena. */
  objetivo: string;
  /** Valor que cuenta como respuesta correcta. */
  respuesta: string;
  /** Bloques en pantalla (letras o palabras). */
  opciones: string[];
  /** Solo para memory_pairs: [letra o sílaba, palabra con dibujo]. */
  pares?: [string, string][];
  /** Consonante fija en build_syllable y vowel_wheel. */
  base?: string;
  /** Sílabas de la palabra en build_word_syllables y missing_syllable. */
  partes?: string[];
  /** Posición de la sílaba que falta en missing_syllable. */
  hueco?: number;
  /** balloon_pop: cuántos globos correctos hay que reventar. */
  meta?: number;
  /** stepping_stones: piedras de cada columna del río. */
  filas?: string[][];
  /** sort_two: los dos sonidos (planetas) en los que se clasifica. */
  grupos?: [string, string];
  /** echo_sequence: lo que Misi dice y el niño repite en orden. puzzle/build_figure: sonido de cada pieza. */
  secuencia?: string[];
  /** build_figure: qué figura se arma. */
  figura?: "cohete" | "casa" | "robot";
}

export interface Actividad {
  id: string;
  tipo: TipoActividad;
  rondas: Ronda[];
}

export interface Animal {
  nombre: string;
  especie: string;
  /** Ilustraciones (una o varias si el rescate es de un grupo). */
  claves: ClaveCriatura[];
}

export interface Mision {
  id: string;
  idMundo: number;
  orden: number;
  titulo: string;
  animal: Animal;
  contenido: string;
  patitas: number;
  actividades: Actividad[];
}

/** Cómo se revela el animal al rescatarlo, según la historia del mundo. */
export type Revelado = "nube" | "crater" | "lianas" | "cristal";

export interface Mundo {
  id: number;
  nombre: string;
  tema: string;
  historia: string;
  revelado: Revelado;
  disponible: boolean;
  misiones: Mision[];
}
