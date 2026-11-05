/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import * as api from "../servicios/api";
import type { Rol, UsuarioPublico } from "../tipos";

interface ValorAutenticacion {
  usuario: UsuarioPublico | null;
  ingresar: (correo: string, contrasena: string) => Promise<UsuarioPublico>;
  registrar: typeof api.registrar;
  salir: () => void;
}

const Contexto = createContext<ValorAutenticacion | null>(null);

export function ProveedorAutenticacion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioPublico | null>(() => api.usuarioActual());

  const ingresar = useCallback(async (correo: string, contrasena: string) => {
    const u = await api.ingresar(correo, contrasena);
    setUsuario(u);
    return u;
  }, []);

  const registrar = useCallback<typeof api.registrar>(async (datos) => {
    const u = await api.registrar(datos);
    setUsuario(u);
    return u;
  }, []);

  const salir = useCallback(() => {
    api.salir();
    sessionStorage.removeItem("astrovet:juego");
    setUsuario(null);
  }, []);

  const valor = useMemo(() => ({ usuario, ingresar, registrar, salir }), [usuario, ingresar, registrar, salir]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAutenticacion(): ValorAutenticacion {
  const v = useContext(Contexto);
  if (!v) throw new Error("useAutenticacion debe usarse dentro de ProveedorAutenticacion");
  return v;
}

/** Espacio de inicio de cada rol (RF-02). */
export function inicioDeRol(rol: Rol): string {
  if (rol === "teacher") return "/docente";
  if (rol === "admin") return "/admin";
  return "/tutor";
}

/** Ruta privada: exige sesión y, si se indica, un rol (RNF-05). */
export function RutaProtegida({ rol, children }: { rol?: Rol; children: ReactNode }) {
  const { usuario } = useAutenticacion();
  const ubicacion = useLocation();
  if (!usuario) {
    return <Navigate to={`/ingresar?volver=${encodeURIComponent(ubicacion.pathname)}`} replace />;
  }
  if (rol && usuario.rol !== rol) {
    return <Navigate to={inicioDeRol(usuario.rol)} replace />;
  }
  return <>{children}</>;
}
