import { useEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

type Variante = "primario" | "secundario" | "suave" | "peligro" | "juego";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-lavanda-oscuro text-white shadow-[0_4px_0_#3f3473] hover:bg-[#54458d] active:translate-y-0.5 active:shadow-[0_2px_0_#3f3473]",
  secundario: "bg-white text-lavanda-oscuro ring-2 ring-lavanda-claro hover:ring-lavanda",
  suave: "bg-transparent text-lavanda-oscuro hover:bg-lavanda-tenue",
  peligro: "bg-white text-[#a8433d] ring-2 ring-rosa hover:bg-rosa-claro",
  juego:
    "bg-dorado text-tinta shadow-[0_5px_0_#c98f1c] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#c98f1c] text-xl",
};

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
}

export function Boton({ variante = "primario", cargando, className = "", children, disabled, ...resto }: BotonProps) {
  return (
    <button
      {...resto}
      disabled={disabled || cargando}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 font-extrabold transition disabled:opacity-55 ${VARIANTES[variante]} ${className}`}
    >
      {cargando ? <span className="size-5 animate-spin rounded-full border-3 border-current border-r-transparent" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  ayuda?: ReactNode;
  error?: boolean;
}

export function Campo({ etiqueta, ayuda, error, id, className = "", ...resto }: CampoProps) {
  return (
    <div className={`flex flex-col gap-1.5 text-left ${className}`}>
      <label htmlFor={id} className="text-sm font-bold text-tinta">
        {etiqueta}
      </label>
      <input
        id={id}
        aria-invalid={error || undefined}
        {...resto}
        className={`min-h-12 rounded-xl border-2 bg-white px-4 text-base text-tinta outline-none transition placeholder:text-tinta-suave/60 focus:border-lavanda ${
          error ? "border-rosa-oscuro" : "border-lavanda-claro"
        }`}
      />
      {ayuda ? <p className={`text-sm ${error ? "text-[#a8433d]" : "text-tinta-suave"}`}>{ayuda}</p> : null}
    </div>
  );
}

export function Alerta({ tipo = "error", children }: { tipo?: "error" | "info" | "ok"; children: ReactNode }) {
  const estilos = {
    error: "bg-rosa-claro text-[#8a3530] ring-rosa",
    info: "bg-celeste text-tinta ring-celeste-oscuro",
    ok: "bg-menta-claro text-[#2c6e50] ring-menta",
  }[tipo];
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm font-semibold ring-1 ${estilos}`}>
      {children}
    </div>
  );
}

/**
 * Botón que hay que mantener presionado: evita que el niño salga del
 * juego por accidente (lo usa el adulto).
 */
export function BotonMantener({ onCompletar, children, segundos = 1.5, className = "" }: { onCompletar: () => void; children: ReactNode; segundos?: number; className?: string }) {
  const [avance, setAvance] = useState(0);
  const inicio = useRef<number | null>(null);
  const marco = useRef<number | null>(null);

  useEffect(() => () => {
    if (marco.current) cancelAnimationFrame(marco.current);
  }, []);

  function paso(t: number) {
    if (inicio.current === null) return;
    const a = Math.min(1, (t - inicio.current) / (segundos * 1000));
    setAvance(a);
    if (a >= 1) {
      inicio.current = null;
      setAvance(0);
      onCompletar();
      return;
    }
    marco.current = requestAnimationFrame(paso);
  }

  function empezar() {
    inicio.current = performance.now();
    marco.current = requestAnimationFrame(paso);
  }

  function soltar() {
    inicio.current = null;
    if (marco.current) cancelAnimationFrame(marco.current);
    setAvance(0);
  }

  return (
    <button
      type="button"
      onPointerDown={empezar}
      onPointerUp={soltar}
      onPointerLeave={soltar}
      onPointerCancel={soltar}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onCompletar();
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative overflow-hidden rounded-full px-4 py-2 text-sm font-bold select-none ${className}`}
    >
      <span className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${avance * 100}%` }} aria-hidden="true" />
      <span className="relative">{children}</span>
    </button>
  );
}
