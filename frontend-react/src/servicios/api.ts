// Capa de servicios con la misma forma que tendrá la API REST de FastAPI.
// Hoy guarda en el navegador (bd.ts); mañana cada función hará un fetch.
// Las reglas de negocio que viven aquí (RN-xx) se repetirán en el backend.

import { MUEBLES, obtenerMueble, regaloDeMision, type Mueble } from "../datos/casa";
import { MISIONES, obtenerMision } from "../datos/contenido";
import { obtenerPersonaje, PELAJES, PERSONAJES, type IdPersonaje } from "../datos/personajes";
import type {
  ColorPelaje,
  EstadoMision,
  EstadoSesion,
  Intento,
  Jugador,
  AjusteCuarto,
  Cuidado,
  Mision,
  MuebleJugador,
  Rol,
  SesionJuego,
  Usuario,
  UsuarioPublico,
} from "../tipos";
import { ahoraIso, hashSimulado, leer, nuevoId, transaccion } from "./bd";

export class ErrorApi extends Error {}

const CLAVE_TOKEN = "astrovet:token";
const VERSION_TERMINOS = "borrador-0.1";
const MINUTOS_ABANDONO = 15; // RN-16

function pausa(ms = 90): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function publico(u: Usuario): UsuarioPublico {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hashContrasena, ...resto } = u;
  return resto;
}

function correoNormalizado(correo: string): string {
  return correo.trim().toLowerCase();
}

// ======================= Autenticación =======================

export function usuarioActual(): UsuarioPublico | null {
  let id: string | null = null;
  try {
    id = localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
  const u = leer().usuarios.find((x) => x.id === id && x.activo);
  return u ? publico(u) : null;
}

function exigirUsuario(rol?: Rol): UsuarioPublico {
  const u = usuarioActual();
  if (!u) throw new ErrorApi("Tu sesión terminó. Vuelve a ingresar.");
  if (rol && u.rol !== rol) throw new ErrorApi("No tienes permiso para esta acción.");
  return u;
}

export async function registrar(datos: {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: "tutor" | "teacher";
  aceptaPolitica: boolean;
}): Promise<UsuarioPublico> {
  await pausa();
  const nombre = datos.nombre.trim();
  const correo = correoNormalizado(datos.correo);
  if (nombre.length < 2) throw new ErrorApi("Escribe tu nombre.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw new ErrorApi("Revisa el correo electrónico.");
  if (datos.contrasena.length < 8) throw new ErrorApi("La contraseña debe tener al menos 8 caracteres.");
  if (!datos.aceptaPolitica) throw new ErrorApi("Debes aceptar la política de tratamiento de datos.");
  if (leer().usuarios.some((u) => u.correo === correo)) {
    throw new ErrorApi("Ya existe una cuenta con este correo. Puedes ingresar o recuperar tu contraseña.");
  }
  const id = nuevoId();
  const ahora = ahoraIso();
  const usuario: Usuario = {
    id,
    nombre,
    correo,
    rol: datos.rol,
    hashContrasena: hashSimulado(datos.contrasena, id),
    activo: true,
    aceptoPoliticaEn: ahora,
    versionTerminos: VERSION_TERMINOS,
    creadoEn: ahora,
  };
  transaccion((bd) => bd.usuarios.push(usuario));
  localStorage.setItem(CLAVE_TOKEN, id);
  return publico(usuario);
}

// Limitación de intentos simulada (RNF-13): 5 fallos en 10 minutos.
const fallos = new Map<string, number[]>();

export async function ingresar(correo: string, contrasena: string): Promise<UsuarioPublico> {
  await pausa();
  const clave = correoNormalizado(correo);
  const ahora = Date.now();
  const recientes = (fallos.get(clave) ?? []).filter((t) => ahora - t < 10 * 60_000);
  if (recientes.length >= 5) {
    throw new ErrorApi("Hubo demasiados intentos. Espera unos minutos y vuelve a intentarlo.");
  }
  const u = leer().usuarios.find((x) => x.correo === clave);
  const valido = u && u.activo && u.hashContrasena === hashSimulado(contrasena, u.id);
  if (!u || !valido) {
    fallos.set(clave, [...recientes, ahora]);
    // Mismo mensaje siempre: no revela qué dato falló (CU-02).
    throw new ErrorApi("El correo o la contraseña no son correctos.");
  }
  fallos.delete(clave);
  localStorage.setItem(CLAVE_TOKEN, u.id);
  return publico(u);
}

export function salir(): void {
  localStorage.removeItem(CLAVE_TOKEN);
}

export async function solicitarRecuperacion(correo: string): Promise<void> {
  await pausa(300);
  // En producción se envía un enlace válido por 30 minutos (RF-29).
  // La respuesta no cambia exista o no la cuenta (CU-16).
  void correo;
}

// ======================= Perfiles infantiles =======================

function jugadorPropio(idJugador: string): Jugador {
  const u = exigirUsuario("tutor");
  const j = leer().jugadores.find((x) => x.id === idJugador);
  // RN-15: un tutor solo ve sus propios perfiles.
  if (!j || j.idUsuario !== u.id) throw new ErrorApi("No encontramos ese perfil.");
  return j;
}

function validarPerfil(datos: { apodo: string; minutosSesion: number; edad?: number }, idUsuario: string, idActual?: string) {
  const apodo = datos.apodo.trim();
  if (apodo.length < 2) throw new ErrorApi("Escribe un apodo de al menos 2 letras.");
  if (apodo.length > 20) throw new ErrorApi("El apodo puede tener hasta 20 caracteres.");
  const repetido = leer().jugadores.some(
    (j) => j.idUsuario === idUsuario && j.id !== idActual && j.apodo.toLowerCase() === apodo.toLowerCase(),
  );
  if (repetido) throw new ErrorApi("Ya tienes un perfil con ese apodo.");
  if (!Number.isInteger(datos.minutosSesion) || datos.minutosSesion < 5 || datos.minutosSesion > 10) {
    throw new ErrorApi("El tiempo de sesión debe estar entre 5 y 10 minutos."); // RN-02
  }
  if (datos.edad !== undefined && (datos.edad < 3 || datos.edad > 14)) {
    throw new ErrorApi("Revisa la edad.");
  }
  return apodo;
}

export async function listarJugadores(): Promise<Jugador[]> {
  await pausa(60);
  const u = exigirUsuario("tutor");
  return leer().jugadores.filter((j) => j.idUsuario === u.id);
}

export async function obtenerJugador(id: string): Promise<Jugador> {
  await pausa(40);
  return jugadorPropio(id);
}

export async function crearJugador(datos: {
  apodo: string;
  edad?: number;
  minutosSesion: number;
  pelaje: ColorPelaje;
}): Promise<Jugador> {
  await pausa();
  const u = exigirUsuario("tutor");
  const apodo = validarPerfil(datos, u.id);
  const ahora = ahoraIso();
  const jugador: Jugador = {
    id: nuevoId(),
    idUsuario: u.id,
    apodo,
    edad: datos.edad,
    minutosSesion: datos.minutosSesion,
    patitas: 0,
    activo: true,
    pelaje: datos.pelaje,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
  transaccion((bd) => bd.jugadores.push(jugador));
  return jugador;
}

export async function actualizarJugador(
  id: string,
  cambios: Partial<Pick<Jugador, "apodo" | "edad" | "minutosSesion" | "pelaje" | "activo">>,
): Promise<Jugador> {
  await pausa();
  const actual = jugadorPropio(id);
  const combinado = { ...actual, ...cambios };
  combinado.apodo = validarPerfil(combinado, actual.idUsuario, id);
  combinado.actualizadoEn = ahoraIso();
  transaccion((bd) => {
    bd.jugadores = bd.jugadores.map((j) => (j.id === id ? combinado : j));
  });
  return combinado;
}

/** RF-30 / RN-22: borra el perfil y todos sus registros. */
export async function eliminarJugador(id: string): Promise<void> {
  await pausa();
  jugadorPropio(id);
  transaccion((bd) => {
    const sesiones = new Set(bd.sesiones.filter((s) => s.idJugador === id).map((s) => s.id));
    bd.jugadores = bd.jugadores.filter((j) => j.id !== id);
    bd.progreso = bd.progreso.filter((p) => p.idJugador !== id);
    bd.sesiones = bd.sesiones.filter((s) => s.idJugador !== id);
    bd.intentos = bd.intentos.filter((i) => !sesiones.has(i.idSesion));
    bd.movimientos = bd.movimientos.filter((m) => m.idJugador !== id);
    bd.muebles = bd.muebles.filter((m) => m.idJugador !== id);
    bd.cuartos = bd.cuartos.filter((c) => c.idJugador !== id);
    bd.cuidados = bd.cuidados.filter((c) => c.idJugador !== id);
  });
}

// ======================= Progreso (RN-06, RN-07, RN-08) =======================

export function estadosMisiones(idJugador: string): Record<string, EstadoMision> {
  const guardados = leer().progreso.filter((p) => p.idJugador === idJugador);
  const estados: Record<string, EstadoMision> = {};
  MISIONES.forEach((m, i) => {
    const p = guardados.find((x) => x.idMision === m.id);
    estados[m.id] = p ? p.estado : i === 0 ? "disponible" : "bloqueado";
  });
  return estados;
}

export async function progresoDe(idJugador: string): Promise<Record<string, EstadoMision>> {
  await pausa(40);
  jugadorPropio(idJugador);
  return estadosMisiones(idJugador);
}

export async function iniciarMision(idJugador: string, idMision: string): Promise<void> {
  await pausa(40);
  jugadorPropio(idJugador);
  const estado = estadosMisiones(idJugador)[idMision];
  if (estado === "bloqueado") throw new ErrorApi("Esta misión todavía está bloqueada.");
  if (estado !== "disponible") return;
  transaccion((bd) => {
    bd.progreso = bd.progreso.filter((p) => !(p.idJugador === idJugador && p.idMision === idMision));
    bd.progreso.push({ idJugador, idMision, estado: "en_progreso", iniciadoEn: ahoraIso(), patitasOtorgadas: 0 });
  });
}

export interface ResultadoMision {
  primeraVez: boolean;
  /** Mueble que regala el animal al ser rescatado por primera vez. */
  regalo?: Mueble;
  patitasGanadas: number;
  saldo: number;
  siguiente?: Mision;
}

export async function completarMision(idJugador: string, idMision: string, idSesion: string): Promise<ResultadoMision> {
  await pausa();
  const jugador = jugadorPropio(idJugador);
  const mision = obtenerMision(idMision);
  if (!mision) throw new ErrorApi("No encontramos la misión.");
  const estados = estadosMisiones(idJugador);
  if (estados[idMision] === "bloqueado") throw new ErrorApi("Esta misión todavía está bloqueada.");
  const primeraVez = estados[idMision] !== "completado";
  const indice = MISIONES.findIndex((m) => m.id === idMision);
  const siguiente = MISIONES[indice + 1];
  const ahora = ahoraIso();

  // Saldo, movimiento y progreso en una sola transacción (RN-09).
  return transaccion((bd) => {
    let saldo = jugador.patitas;
    if (primeraVez) {
      bd.progreso = bd.progreso.filter((p) => !(p.idJugador === idJugador && p.idMision === idMision));
      bd.progreso.push({
        idJugador,
        idMision,
        estado: "completado",
        iniciadoEn: ahora,
        completadoEn: ahora,
        patitasOtorgadas: mision.patitas,
      });
      saldo += mision.patitas;
      bd.jugadores = bd.jugadores.map((j) => (j.id === idJugador ? { ...j, patitas: saldo } : j));
      bd.movimientos.push({
        id: nuevoId(),
        idJugador,
        idSesion,
        idMision,
        cantidad: mision.patitas,
        motivo: "mision",
        en: ahora,
      });
      if (siguiente && estados[siguiente.id] === "bloqueado") {
        bd.progreso.push({ idJugador, idMision: siguiente.id, estado: "disponible", patitasOtorgadas: 0 });
      }
    }
    const regalo = primeraVez ? regaloDeMision(idMision) : undefined;
    if (regalo && !bd.muebles.some((m) => m.idJugador === idJugador && m.idMueble === regalo.id)) {
      bd.muebles.push({ id: nuevoId(), idJugador, idMueble: regalo.id, origen: "regalo", en: ahora });
    }
    return { primeraVez, regalo, patitasGanadas: primeraVez ? mision.patitas : 0, saldo, siguiente };
  });
}

/** Solo para demostraciones del prototipo: abre todas las misiones sin completarlas. */
export async function desbloquearTodoDemo(idJugador: string): Promise<void> {
  await pausa(40);
  jugadorPropio(idJugador);
  const estados = estadosMisiones(idJugador);
  transaccion((bd) => {
    for (const m of MISIONES) {
      if (estados[m.id] !== "bloqueado") continue;
      bd.progreso.push({ idJugador, idMision: m.id, estado: "disponible", patitasOtorgadas: 0 });
    }
  });
}

// ======================= Sesiones e intentos =======================

/** RN-16: sesiones sin actividad durante 15 minutos pasan a abandonadas. */
export function marcarAbandonadas(): void {
  const limite = Date.now() - MINUTOS_ABANDONO * 60_000;
  const hay = leer().sesiones.some((s) => s.estado === "active" && Date.parse(s.ultimaActividadEn) < limite);
  if (!hay) return;
  transaccion((bd) => {
    bd.sesiones = bd.sesiones.map((s) =>
      s.estado === "active" && Date.parse(s.ultimaActividadEn) < limite
        ? { ...s, estado: "abandoned", finEn: s.ultimaActividadEn }
        : s,
    );
  });
}

export async function iniciarSesion(idJugador: string, minutosMax: number): Promise<SesionJuego> {
  await pausa(60);
  jugadorPropio(idJugador);
  const ahora = ahoraIso();
  const sesion: SesionJuego = {
    id: nuevoId(),
    idJugador,
    inicioEn: ahora,
    ultimaActividadEn: ahora,
    minutosMax,
    estado: "active",
  };
  transaccion((bd) => {
    // Solo una sesión activa por perfil: la anterior queda abandonada.
    bd.sesiones = bd.sesiones.map((s) =>
      s.idJugador === idJugador && s.estado === "active" ? { ...s, estado: "abandoned", finEn: s.ultimaActividadEn } : s,
    );
    bd.sesiones.push(sesion);
  });
  return sesion;
}

export function obtenerSesion(id: string): SesionJuego | undefined {
  return leer().sesiones.find((s) => s.id === id);
}

export async function cerrarSesion(id: string, estado: Exclude<EstadoSesion, "active"> = "completed"): Promise<void> {
  await pausa(40);
  transaccion((bd) => {
    bd.sesiones = bd.sesiones.map((s) => (s.id === id && s.estado === "active" ? { ...s, estado, finEn: ahoraIso() } : s));
  });
}

export function registrarIntento(datos: Omit<Intento, "id" | "en">): void {
  const ahora = ahoraIso();
  transaccion((bd) => {
    bd.intentos.push({ ...datos, id: nuevoId(), en: ahora });
    bd.sesiones = bd.sesiones.map((s) => (s.id === datos.idSesion ? { ...s, ultimaActividadEn: ahora } : s));
  });
}

/** Contenidos acertados en la sesión, para «Estrellas de hoy» (ESP-04). */
export function sonidosDeSesion(idSesion: string): string[] {
  const vistos: string[] = [];
  for (const i of leer().intentos) {
    if (i.idSesion !== idSesion || !i.correcta) continue;
    const letra = i.contenido.length === 1 ? i.contenido : i.contenido[0];
    if (!vistos.includes(letra)) vistos.push(letra);
  }
  return vistos;
}

export async function cambiarPelaje(idJugador: string, pelaje: ColorPelaje): Promise<Jugador> {
  return actualizarJugador(idJugador, { pelaje });
}

// ======================= Personajes =======================

/** Compañeros que el jugador ya puede usar (Misi siempre). */
export function personajesDe(j: Jugador): IdPersonaje[] {
  return ["misi", ...(j.personajes ?? []).filter((p) => p !== "misi")];
}

/** Desbloquea un compañero con patitas (paw_transactions con motivo «personaje») y lo deja puesto. */
export async function desbloquearPersonaje(idJugador: string, id: IdPersonaje): Promise<Jugador> {
  await pausa(60);
  const jugador = jugadorPropio(idJugador);
  const p = PERSONAJES.find((x) => x.id === id);
  if (!p) throw new ErrorApi("Ese personaje no existe.");
  if (personajesDe(jugador).includes(id)) throw new ErrorApi("Ya tienes ese personaje.");
  if (jugador.patitas < p.precio) throw new ErrorApi("Aún no tienes patitas suficientes.");
  return transaccion((bd) => {
    const nuevo: Jugador = {
      ...jugador,
      patitas: jugador.patitas - p.precio,
      personajes: [...(jugador.personajes ?? []), id],
      personaje: id,
      actualizadoEn: ahoraIso(),
    };
    bd.jugadores = bd.jugadores.map((j) => (j.id === idJugador ? nuevo : j));
    bd.movimientos.push({ id: nuevoId(), idJugador, cantidad: -p.precio, motivo: "personaje", en: ahoraIso() });
    return nuevo;
  });
}

/** Cambia el pelaje de un compañero (gratis). */
export async function cambiarPelajePersonaje(idJugador: string, personaje: IdPersonaje, variante: string): Promise<Jugador> {
  await pausa(30);
  const jugador = jugadorPropio(idJugador);
  if (personaje === "misi" || !PELAJES[personaje].some((p) => p.id === variante)) throw new ErrorApi("Ese pelaje no existe.");
  return transaccion((bd) => {
    const nuevo: Jugador = { ...jugador, pelajes: { ...jugador.pelajes, [personaje]: variante }, actualizadoEn: ahoraIso() };
    bd.jugadores = bd.jugadores.map((j) => (j.id === idJugador ? nuevo : j));
    return nuevo;
  });
}

/** Cambia el compañero por otro ya desbloqueado. */
export async function elegirPersonaje(idJugador: string, id: IdPersonaje): Promise<Jugador> {
  await pausa(30);
  const jugador = jugadorPropio(idJugador);
  if (!personajesDe(jugador).includes(id)) throw new ErrorApi(`Primero desbloquea a ${obtenerPersonaje(id).nombre}.`);
  return transaccion((bd) => {
    const nuevo: Jugador = { ...jugador, personaje: id, actualizadoEn: ahoraIso() };
    bd.jugadores = bd.jugadores.map((j) => (j.id === idJugador ? nuevo : j));
    return nuevo;
  });
}

// ======================= Clínica =======================

/** Ficha de cuidados del jugador: un sello por visita terminada (sin patitas ni progreso). */
export async function cuidadosDe(idJugador: string): Promise<Cuidado[]> {
  await pausa(20);
  jugadorPropio(idJugador);
  return leer().cuidados.filter((c) => c.idJugador === idJugador);
}

export async function registrarCuidado(idJugador: string, animal: string, juego: string): Promise<Cuidado> {
  await pausa(20);
  jugadorPropio(idJugador);
  const cuidado: Cuidado = { id: nuevoId(), idJugador, animal, juego, en: ahoraIso() };
  transaccion((bd) => bd.cuidados.push(cuidado));
  return cuidado;
}

// ======================= Seguimiento (vista previa del incremento 3) =======================

export interface ResumenSesion {
  sesion: SesionJuego;
  minutos: number;
  intentos: number;
  aciertos: number;
  ayudas: number;
  repeticionesAudio: number;
  misiones: string[];
}

export async function resumenSesiones(idJugador: string, limite = 8): Promise<ResumenSesion[]> {
  await pausa(60);
  jugadorPropio(idJugador);
  const bd = leer();
  return bd.sesiones
    .filter((s) => s.idJugador === idJugador)
    .sort((a, b) => b.inicioEn.localeCompare(a.inicioEn))
    .slice(0, limite)
    .map((sesion) => {
      const propios = bd.intentos.filter((i) => i.idSesion === sesion.id);
      const fin = Date.parse(sesion.finEn ?? sesion.ultimaActividadEn);
      return {
        sesion,
        minutos: Math.max(0, Math.round((fin - Date.parse(sesion.inicioEn)) / 60_000)),
        intentos: propios.length,
        aciertos: propios.filter((i) => i.correcta).length,
        ayudas: propios.filter((i) => i.ayuda).length,
        repeticionesAudio: propios.reduce((t, i) => t + i.repeticionesAudio, 0),
        misiones: [...new Set(propios.map((i) => i.idMision))],
      };
    });
}

// ======================= Mi casa =======================

/** Muebles del jugador. Entrega los regalos de animales ya rescatados que falten. */
export async function mueblesDe(idJugador: string): Promise<MuebleJugador[]> {
  await pausa(30);
  jugadorPropio(idJugador);
  const estados = estadosMisiones(idJugador);
  const faltan = MUEBLES.filter(
    (m) => m.regaloDe && estados[m.regaloDe] === "completado" && !leer().muebles.some((x) => x.idJugador === idJugador && x.idMueble === m.id),
  );
  if (faltan.length) {
    transaccion((bd) => {
      for (const m of faltan) bd.muebles.push({ id: nuevoId(), idJugador, idMueble: m.id, origen: "regalo", en: ahoraIso() });
    });
  }
  return leer().muebles.filter((m) => m.idJugador === idJugador);
}

/** Compra un mueble con patitas (paw_transactions con motivo «compra»). */
export async function comprarMueble(idJugador: string, idMueble: string): Promise<{ saldo: number; mueble: MuebleJugador }> {
  await pausa(60);
  const jugador = jugadorPropio(idJugador);
  const m = obtenerMueble(idMueble);
  if (!m || m.precio === undefined) throw new ErrorApi("Ese mueble no está en la tienda.");
  if (jugador.patitas < m.precio) throw new ErrorApi("Aún no tienes patitas suficientes.");
  return transaccion((bd) => {
    const saldo = jugador.patitas - m.precio!;
    bd.jugadores = bd.jugadores.map((j) => (j.id === idJugador ? { ...j, patitas: saldo } : j));
    bd.movimientos.push({ id: nuevoId(), idJugador, cantidad: -m.precio!, motivo: "compra", en: ahoraIso() });
    const mueble: MuebleJugador = { id: nuevoId(), idJugador, idMueble, origen: "compra", en: ahoraIso() };
    bd.muebles.push(mueble);
    return { saldo, mueble };
  });
}

/** Coloca un mueble en una baldosa del cuarto, o lo guarda en el baúl (sin cuarto). */
export async function moverMueble(idJugador: string, id: string, lugar: { cuarto: string; c: number; r: number } | null): Promise<void> {
  await pausa(20);
  jugadorPropio(idJugador);
  transaccion((bd) => {
    bd.muebles = bd.muebles.map((m) =>
      m.id === id && m.idJugador === idJugador ? (lugar ? { ...m, ...lugar } : { ...m, cuarto: undefined, c: undefined, r: undefined }) : m,
    );
  });
}

/** Colores y posiciones que el niño eligió para sus cuartos. */
export async function ajustesDe(idJugador: string): Promise<AjusteCuarto[]> {
  await pausa(20);
  jugadorPropio(idJugador);
  return leer().cuartos.filter((c) => c.idJugador === idJugador);
}

export async function guardarAjuste(
  idJugador: string,
  cuarto: string,
  cambio: { paredes?: [string, string]; piso?: [string, string]; posicion?: { indice: number; c: number; r: number }; pacientes?: string[] },
): Promise<void> {
  await pausa(20);
  jugadorPropio(idJugador);
  transaccion((bd) => {
    let a = bd.cuartos.find((x) => x.idJugador === idJugador && x.cuarto === cuarto);
    if (!a) {
      a = { idJugador, cuarto, posiciones: {} };
      bd.cuartos.push(a);
    }
    if (cambio.paredes) a.paredes = cambio.paredes;
    if (cambio.piso) a.piso = cambio.piso;
    if (cambio.pacientes) a.pacientes = cambio.pacientes;
    if (cambio.posicion) a.posiciones[String(cambio.posicion.indice)] = [cambio.posicion.c, cambio.posicion.r];
  });
}
