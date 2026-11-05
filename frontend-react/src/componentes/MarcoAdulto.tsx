import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAutenticacion } from "../contexto/Autenticacion";
import Marca from "./Marca";
import Misi from "./Misi";

/** Encabezado y contenedor de los espacios del tutor y del docente. */
export function MarcoAdulto({ children }: { children: ReactNode }) {
  const { usuario, salir } = useAutenticacion();
  const navegar = useNavigate();
  return (
    <div className="min-h-svh bg-celeste">
      <header className="border-b border-celeste-oscuro bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Marca tamano={38} />
          <span className="ml-1 hidden rounded-full bg-lavanda-tenue px-3 py-1 text-xs font-extrabold text-lavanda-oscuro sm:inline">
            {usuario?.rol === "teacher" ? "Espacio docente" : "Espacio familiar"}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-bold text-tinta-suave sm:inline">{usuario?.nombre}</span>
            <button
              type="button"
              onClick={() => {
                salir();
                navegar("/");
              }}
              className="rounded-full px-4 py-2 text-sm font-extrabold text-lavanda-oscuro ring-2 ring-lavanda-claro hover:bg-lavanda-tenue"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

/** Tarjeta centrada para registro, ingreso y recuperación. */
export function MarcoCuenta({ children, misi = true }: { children: ReactNode; misi?: boolean }) {
  return (
    <div className="flex min-h-svh flex-col items-center cielo-noche px-4 py-8">
      <div className="flex w-full max-w-md items-center justify-between">
        <Marca claro tamano={40} />
      </div>
      <div className="mt-6 w-full max-w-md">
        {misi ? (
          <div className="-mb-6 flex justify-center">
            <Misi tamano={96} />
          </div>
        ) : null}
        <div className="rounded-[2rem] bg-white p-6 pt-9 shadow-2xl sm:p-8 sm:pt-10">{children}</div>
      </div>
    </div>
  );
}
