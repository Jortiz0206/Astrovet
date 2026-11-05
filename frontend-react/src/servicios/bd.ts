// Base de datos simulada en el navegador (localStorage).
// Solo existe para el prototipo: cuando esté el backend, api.ts pasará a
// llamar a FastAPI y este archivo se elimina.

import type {
  Intento,
  Jugador,
  MovimientoPatitas,
  ProgresoMision,
  SesionJuego,
  Usuario,
} from "../tipos";

const CLAVE = "astrovet:bd:v1";

export interface BaseDatos {
  usuarios: Usuario[];
  jugadores: Jugador[];
  progreso: ProgresoMision[];
  sesiones: SesionJuego[];
  intentos: Intento[];
  movimientos: MovimientoPatitas[];
}

let cache: BaseDatos | null = null;

export function nuevoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ahoraIso(): string {
  return new Date().toISOString();
}

/**
 * Hash de contraseña SOLO para la simulación (no es seguro).
 * El backend usará Bcrypt (RNF-05).
 */
export function hashSimulado(texto: string, sal: string): string {
  const entrada = `${sal}:${texto}`;
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < entrada.length; i++) {
    const c = entrada.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `sim$${sal}$${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`;
}

function vacia(): BaseDatos {
  return { usuarios: [], jugadores: [], progreso: [], sesiones: [], intentos: [], movimientos: [] };
}

/** Datos ficticios para probar sin registrarse (sección 18.1). */
function semilla(): BaseDatos {
  const bd = vacia();
  const ahora = ahoraIso();
  bd.usuarios.push(
    {
      id: "u-demo-tutor",
      nombre: "Familia Demo",
      correo: "familia@astrovet.demo",
      rol: "tutor",
      hashContrasena: hashSimulado("astrovet123", "u-demo-tutor"),
      activo: true,
      aceptoPoliticaEn: ahora,
      versionTerminos: "borrador-0.1",
      creadoEn: ahora,
    },
    {
      id: "u-demo-docente",
      nombre: "Docente Demo",
      correo: "docente@astrovet.demo",
      rol: "teacher",
      hashContrasena: hashSimulado("astrovet123", "u-demo-docente"),
      activo: true,
      aceptoPoliticaEn: ahora,
      versionTerminos: "borrador-0.1",
      creadoEn: ahora,
    },
  );
  bd.jugadores.push({
    id: "j-demo-mariana",
    idUsuario: "u-demo-tutor",
    apodo: "Mariana",
    edad: 7,
    minutosSesion: 10,
    patitas: 0,
    activo: true,
    pelaje: "naranja",
    creadoEn: ahora,
    actualizadoEn: ahora,
  });
  return bd;
}

export function leer(): BaseDatos {
  if (cache) return cache;
  try {
    const guardado = localStorage.getItem(CLAVE);
    cache = guardado ? { ...vacia(), ...(JSON.parse(guardado) as BaseDatos) } : semilla();
  } catch {
    cache = semilla();
  }
  return cache;
}

/** Ejecuta un cambio y lo guarda (equivale a una transacción). */
export function transaccion<T>(cambio: (bd: BaseDatos) => T): T {
  const copia = structuredClone(leer());
  const resultado = cambio(copia);
  cache = copia;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(copia));
  } catch {
    // Si el navegador no deja guardar, la app sigue funcionando en memoria.
  }
  return resultado;
}

/** Borra todo y vuelve a los datos de demostración. */
export function reiniciarDemo(): void {
  cache = semilla();
  try {
    localStorage.setItem(CLAVE, JSON.stringify(cache));
  } catch {
    // sin almacenamiento disponible
  }
}
