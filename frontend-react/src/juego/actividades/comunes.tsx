/* eslint-disable react-refresh/only-export-components */
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ClaveCriatura } from "../../componentes/Criatura";
import { efecto } from "../../servicios/audio";
import type { Ronda } from "../../tipos";

export interface PropsActividad {
  ronda: Ronda;
  /** 0 sin ayuda · 1 repetir audio · 2 resaltar · 3 hacerlo con Misi (ayuda progresiva). */
  nivelAyuda: number;
  /** Mientras se celebra un acierto no se aceptan toques. */
  bloqueado: boolean;
  /** Paso de la misión: sube la nota de los efectos. */
  paso: number;
  onRespuesta: (respuesta: string, correcta: boolean, terminada: boolean) => void;
  /** El niño pidió escuchar el contenido como ayuda (ACT-17). */
  onAyuda?: () => void;
  /** El animal de la misión, para los juegos donde participa. */
  animal?: ClaveCriatura[];
}

/** true si el sistema o el botón de calma del juego piden menos movimiento. */
export function movimientoReducido(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.querySelector(".sin-movimiento") !== null;
}

/** Mezcla sin alterar el arreglo original. */
export function mezclar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Tamaño de letra según la cantidad de caracteres del bloque. */
export function tamanoTexto(texto: string, grande = false): string {
  if (texto.length <= 1) return grande ? "text-7xl sm:text-8xl" : "text-6xl sm:text-7xl";
  if (texto.length === 2) return grande ? "text-6xl sm:text-7xl" : "text-5xl sm:text-6xl";
  if (texto.length <= 4) return "text-4xl sm:text-5xl";
  return "text-3xl sm:text-4xl";
}

export type EstadoBloque = "normal" | "correcto" | "descartado" | "brilla";

const ESTILO_BLOQUE: Record<EstadoBloque, string> = {
  normal: "bloque-normal",
  correcto: "bloque-correcto",
  descartado: "bloque-descartado",
  brilla: "bloque-brilla",
};

/** Retardo de entrada escalonado, con tope para que nada espere de más. */
export function entrada(indice: number): CSSProperties {
  return { animationDelay: `${Math.min(indice, 5) * 55}ms` };
}

/** Chispas que salen del bloque correcto. Solo decoran: no llevan información. */
export function Destello() {
  return (
    <span className="destello" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} style={{ "--angulo": `${i * 45 + 22}deg` } as CSSProperties} />
      ))}
    </span>
  );
}

/** Bloque táctil grande (mínimo 48 × 48 px; aquí mucho más). */
export function Bloque({
  estado = "normal",
  onClick,
  children,
  etiqueta,
  className = "",
  disabled,
  indice = 0,
}: {
  estado?: EstadoBloque;
  onClick: () => void;
  children: ReactNode;
  etiqueta: string;
  className?: string;
  disabled?: boolean;
  indice?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={etiqueta}
      style={entrada(indice)}
      className={`bloque entrar-bloque relative grid place-items-center rounded-[1.75rem] text-tinta select-none ${ESTILO_BLOQUE[estado]} ${className}`}
    >
      {children}
      {estado === "correcto" ? <Destello /> : null}
    </button>
  );
}

/** Espacio donde se suelta una pieza. */
export function Hueco({
  zona,
  lleno,
  children,
  className = "",
  onClick,
  etiqueta,
}: {
  zona: string;
  lleno: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      data-zona={zona}
      onClick={onClick}
      aria-label={etiqueta}
      disabled={!onClick}
      className={`hueco grid place-items-center rounded-[1.5rem] ${lleno ? "hueco-lleno" : "hueco-vacio"} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Pieza que se arrastra hasta un Hueco o se toca para colocarla.
 * Tocar siempre funciona: arrastrar es la forma rica, no la única.
 */
export function Pieza({
  children,
  etiqueta,
  onSoltar,
  onTocar,
  deshabilitada,
  estado = "normal",
  className = "",
  indice = 0,
}: {
  children: ReactNode;
  etiqueta: string;
  /** Devuelve true si la pieza quedó colocada en la zona. */
  onSoltar: (zona: string) => boolean;
  onTocar: () => void;
  deshabilitada?: boolean;
  estado?: EstadoBloque;
  className?: string;
  indice?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const inicio = useRef<{ x: number; y: number; id: number } | null>(null);
  const arrastrando = useRef(false);
  const ignorarClic = useRef(false);
  const zonaActiva = useRef<HTMLElement | null>(null);
  const [levantada, setLevantada] = useState(false);

  function zonaEn(x: number, y: number): HTMLElement | null {
    for (const el of document.elementsFromPoint(x, y)) {
      if (el instanceof HTMLElement && el.dataset.zona) return el;
    }
    return null;
  }

  function marcar(zona: HTMLElement | null) {
    if (zonaActiva.current === zona) return;
    zonaActiva.current?.classList.remove("hueco-encima");
    zona?.classList.add("hueco-encima");
    zonaActiva.current = zona;
  }

  function volver() {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 320ms cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = "";
    window.setTimeout(() => {
      el.style.transition = "";
    }, 340);
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label={etiqueta}
      disabled={deshabilitada}
      style={entrada(indice)}
      className={`bloque entrar-bloque relative grid touch-none place-items-center rounded-[1.5rem] text-tinta select-none ${ESTILO_BLOQUE[estado]} ${levantada ? "pieza-levantada" : ""} ${className}`}
      onPointerDown={(e) => {
        if (deshabilitada) return;
        inicio.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        arrastrando.current = false;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const i = inicio.current;
        if (!i || i.id !== e.pointerId || !ref.current) return;
        const dx = e.clientX - i.x;
        const dy = e.clientY - i.y;
        if (!arrastrando.current && Math.hypot(dx, dy) < 8) return;
        if (!arrastrando.current) {
          arrastrando.current = true;
          setLevantada(true);
          efecto("toque");
        }
        ref.current.style.transform = `translate(${dx}px, ${dy}px) scale(1.08) rotate(${Math.max(-6, Math.min(6, dx / 30))}deg)`;
        marcar(zonaEn(e.clientX, e.clientY));
      }}
      onPointerUp={(e) => {
        const i = inicio.current;
        inicio.current = null;
        if (!i || !arrastrando.current) return; // fue un toque: lo resuelve onClick
        ignorarClic.current = true;
        arrastrando.current = false;
        setLevantada(false);
        const zona = zonaEn(e.clientX, e.clientY);
        marcar(null);
        const colocada = zona?.dataset.zona ? onSoltar(zona.dataset.zona) : false;
        if (colocada && ref.current) ref.current.style.transform = "";
        else volver();
      }}
      onPointerCancel={() => {
        inicio.current = null;
        arrastrando.current = false;
        setLevantada(false);
        marcar(null);
        volver();
      }}
      onClick={() => {
        if (ignorarClic.current) {
          ignorarClic.current = false;
          return;
        }
        if (!deshabilitada) onTocar();
      }}
    >
      {children}
      {estado === "correcto" ? <Destello /> : null}
    </button>
  );
}
