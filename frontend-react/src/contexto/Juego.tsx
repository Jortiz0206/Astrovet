/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as api from "../servicios/api";
import { guardarPreferencias, leerPreferencias, type Preferencias } from "../servicios/audio";
import type { EstadoMision, Jugador, SesionJuego } from "../tipos";

const CLAVE = "astrovet:juego";
const AVISO_MS = 60_000; // aviso un minuto antes (CU-08)
const GRACIA_MS = 120_000; // máximo 2 minutos para terminar la actividad

/**
 * normal → aviso (último minuto) → gracia (tiempo cumplido pero hay una
 * actividad en curso) → cierre (escena de descanso).
 */
export type FaseTiempo = "normal" | "aviso" | "gracia" | "cierre";

interface ValorJuego {
  /** false mientras se intenta recuperar un juego tras recargar la página. */
  listo: boolean;
  jugador: Jugador | null;
  sesion: SesionJuego | null;
  estados: Record<string, EstadoMision>;
  fase: FaseTiempo;
  restanteMs: number;
  prefs: Preferencias;
  /** Mundo cuyos colores pinta el cielo del juego (0 = centro espacial). */
  mundoVisual: number;
  setMundoVisual: (n: number) => void;
  setPrefs: (p: Preferencias) => void;
  setEnActividad: (v: boolean) => void;
  iniciarJuego: (jugador: Jugador, minutosDemo?: number) => Promise<void>;
  terminarJuego: () => Promise<void>;
  refrescar: () => Promise<void>;
}

const Contexto = createContext<ValorJuego | null>(null);

interface Guardado {
  idJugador: string;
  idSesion: string;
}

function leerGuardado(): Guardado | null {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE) ?? "null") as Guardado | null;
  } catch {
    return null;
  }
}

export function ProveedorJuego({ children }: { children: ReactNode }) {
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [sesion, setSesion] = useState<SesionJuego | null>(null);
  const [estados, setEstados] = useState<Record<string, EstadoMision>>({});
  const [prefs, setPrefsEstado] = useState<Preferencias>(() => leerPreferencias());
  const [enActividad, setEnActividad] = useState(false);
  const [mundoVisual, setMundoVisual] = useState(0);
  const [cerrado, setCerrado] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());
  const [listo, setListo] = useState(() => leerGuardado() === null);

  // Recupera el juego si la pestaña se recargó con una sesión todavía activa.
  useEffect(() => {
    api.marcarAbandonadas();
    const g = leerGuardado();
    if (!g) return;
    const s = api.obtenerSesion(g.idSesion);
    if (!s || s.estado !== "active") {
      sessionStorage.removeItem(CLAVE);
      setListo(true);
      return;
    }
    api
      .obtenerJugador(g.idJugador)
      .then((j) => {
        setJugador(j);
        setSesion(s);
        setEstados(api.estadosMisiones(j.id));
      })
      .catch(() => sessionStorage.removeItem(CLAVE))
      .finally(() => setListo(true));
  }, []);

  useEffect(() => {
    if (!sesion) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [sesion]);

  const limite = sesion ? Date.parse(sesion.inicioEn) + sesion.minutosMax * 60_000 : Infinity;
  let fase: FaseTiempo = "normal";
  if (cerrado) fase = "cierre";
  else if (ahora >= limite + GRACIA_MS) fase = "cierre";
  else if (ahora >= limite) fase = enActividad ? "gracia" : "cierre";
  else if (ahora >= limite - AVISO_MS) fase = "aviso";

  useEffect(() => {
    if (fase === "cierre" && sesion && !cerrado) setCerrado(true);
  }, [fase, sesion, cerrado]);

  const setPrefs = useCallback((p: Preferencias) => {
    guardarPreferencias(p);
    setPrefsEstado(p);
  }, []);

  const iniciarJuego = useCallback(async (j: Jugador, minutosDemo?: number) => {
    const s = await api.iniciarSesion(j.id, minutosDemo ?? j.minutosSesion);
    sessionStorage.setItem(CLAVE, JSON.stringify({ idJugador: j.id, idSesion: s.id } satisfies Guardado));
    setCerrado(false);
    setEnActividad(false);
    setAhora(Date.now());
    setJugador(j);
    setSesion(s);
    setEstados(api.estadosMisiones(j.id));
  }, []);

  const terminarJuego = useCallback(async () => {
    if (sesion) await api.cerrarSesion(sesion.id, "completed");
    sessionStorage.removeItem(CLAVE);
    setSesion(null);
    setJugador(null);
    setEstados({});
    setCerrado(false);
    setEnActividad(false);
  }, [sesion]);

  const refrescar = useCallback(async () => {
    if (!jugador) return;
    const j = await api.obtenerJugador(jugador.id);
    setJugador(j);
    setEstados(api.estadosMisiones(j.id));
  }, [jugador]);

  const valor = useMemo<ValorJuego>(
    () => ({
      listo,
      jugador,
      sesion,
      estados,
      fase,
      restanteMs: Math.max(0, limite - ahora),
      prefs,
      mundoVisual,
      setMundoVisual,
      setPrefs,
      setEnActividad,
      iniciarJuego,
      terminarJuego,
      refrescar,
    }),
    [listo, jugador, sesion, estados, fase, limite, ahora, prefs, mundoVisual, setPrefs, iniciarJuego, terminarJuego, refrescar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useJuego(): ValorJuego {
  const v = useContext(Contexto);
  if (!v) throw new Error("useJuego debe usarse dentro de ProveedorJuego");
  return v;
}
