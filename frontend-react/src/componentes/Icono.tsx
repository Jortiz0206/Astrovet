import type { SVGProps } from "react";

// Iconos propios de AstroVet: trazo redondeado de 2.25 sobre una cuadrícula
// de 24, para que todos pesen lo mismo. Usan currentColor.

export type NombreIcono =
  | "oreja"
  | "altavoz"
  | "candado"
  | "cerrar"
  | "campana"
  | "campana-off"
  | "chispas"
  | "calma"
  | "casa"
  | "mapa"
  | "letras"
  | "clinica"
  | "camiseta"
  | "flecha-der"
  | "flecha-izq"
  | "check"
  | "girar"
  | "jugar"
  | "lapiz"
  | "estrella"
  | "patita"
  | "cohete"
  | "familia"
  | "docente"
  | "aula"
  | "enlace"
  | "calendario"
  | "tablero"
  | "luna"
  | "bolsa";

const TRAZOS: Record<NombreIcono, React.ReactNode> = {
  oreja: (
    <>
      <path d="M7 9.5a5 5 0 0 1 10 0c0 3-2.5 4-3 6.5-.4 2-1.8 3.5-3.6 3.5A2.9 2.9 0 0 1 7.5 17" />
      <path d="M10 10a2 2 0 0 1 4 0c0 1.2-1 1.8-1.5 2.6" />
    </>
  ),
  altavoz: (
    <>
      <path d="M4 9.5h3l4.5-4v13L7 14.5H4z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  candado: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="3" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
      <path d="M12 14.5v2" />
    </>
  ),
  cerrar: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  campana: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  "campana-off": (
    <>
      <path d="M8.5 6A6 6 0 0 1 18 11v4M6 11v5.5L4.5 18h12" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0M3.5 3.5l17 17" />
    </>
  ),
  chispas: (
    <>
      <path d="M10 3.5l1.6 4.4L16 9.5l-4.4 1.6L10 15.5 8.4 11.1 4 9.5l4.4-1.6z" />
      <path d="M17.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  calma: (
    <>
      <path d="M4 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2" />
      <path d="M4 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2" />
      <circle cx="12" cy="7" r="2.5" />
    </>
  ),
  casa: (
    <>
      <path d="M4 11l8-6.5 8 6.5" />
      <path d="M6.5 9.5V19h11V9.5" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  mapa: (
    <>
      <path d="M3.5 6.5l5-2 7 2.5 5-2v13l-5 2-7-2.5-5 2z" />
      <path d="M8.5 4.5v13M15.5 7v13" />
    </>
  ),
  letras: (
    <>
      <path d="M3.5 18l4-11 4 11M5 14h5" />
      <path d="M14 12.5a3 3 0 1 1 0 4.5M17 11v7" />
    </>
  ),
  clinica: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  camiseta: <path d="M8.5 4.5L4 7l1.8 4 2.2-1V20h8V10l2.2 1L20 7l-4.5-2.5c-.5 1.5-1.9 2.5-3.5 2.5s-3-1-3.5-2.5z" />,
  "flecha-der": <path d="M5 12h14M13 6l6 6-6 6" />,
  "flecha-izq": <path d="M19 12H5M11 6l-6 6 6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  girar: (
    <>
      <path d="M19 12a7 7 0 1 1-2.2-5.1" />
      <path d="M19.5 4.5v4h-4" />
    </>
  ),
  jugar: <path d="M8 5.5v13l10.5-6.5z" />,
  lapiz: (
    <>
      <path d="M15 5l4 4L9 19H5v-4z" />
      <path d="M13 7l4 4" />
    </>
  ),
  estrella: <path d="M12 3.8l2.5 5.3 5.7.7-4.2 4 1.1 5.7-5.1-2.8-5.1 2.8 1.1-5.7-4.2-4 5.7-.7z" />,
  patita: (
    <>
      <path d="M12 12.5c-3 0-5.5 2.6-5.5 4.6 0 1.5 1.2 2.4 2.6 2.4 1.2 0 1.8-.6 2.9-.6s1.7.6 2.9.6c1.4 0 2.6-.9 2.6-2.4 0-2-2.5-4.6-5.5-4.6z" />
      <ellipse cx="6" cy="10" rx="1.7" ry="2.2" />
      <ellipse cx="9.5" cy="6.5" rx="1.7" ry="2.3" />
      <ellipse cx="14.5" cy="6.5" rx="1.7" ry="2.3" />
      <ellipse cx="18" cy="10" rx="1.7" ry="2.2" />
    </>
  ),
  cohete: (
    <>
      <path d="M12 3c3.5 2.5 5 6 4.5 11h-9C7 9 8.5 5.5 12 3z" />
      <path d="M7.5 14L5 17.5l3 .5M16.5 14l2.5 3.5-3 .5M10 17.5l2 3.5 2-3.5" />
      <circle cx="12" cy="9" r="1.6" />
    </>
  ),
  familia: (
    <>
      <circle cx="8" cy="7" r="2.5" />
      <circle cx="16.5" cy="9" r="2" />
      <path d="M3.5 19.5c0-3.5 2-6 4.5-6s4.5 2.5 4.5 6M13 19.5c0-2.8 1.5-5 3.5-5s3.5 2.2 3.5 5" />
    </>
  ),
  docente: (
    <>
      <rect x="3.5" y="4.5" width="17" height="11" rx="2" />
      <path d="M8 20l4-4.5 4 4.5M7.5 9h5M7.5 12h8" />
    </>
  ),
  aula: (
    <>
      <path d="M3.5 10L12 5l8.5 5-8.5 5z" />
      <path d="M7 12v4.5c3 2 7 2 10 0V12M20.5 10v5" />
    </>
  ),
  enlace: (
    <>
      <path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
    </>
  ),
  calendario: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="3" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  tablero: (
    <>
      <path d="M4 20h16" />
      <path d="M7 16.5V11M12 16.5V6.5M17 16.5v-3.5" />
    </>
  ),
  luna: <path d="M18.5 14.5A7.5 7.5 0 0 1 9.5 5.5a7.5 7.5 0 1 0 9 9z" />,
  bolsa: (
    <>
      <path d="M5.5 8.5h13l-1 11.5h-11z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </>
  ),
};

const RELLENOS: Partial<Record<NombreIcono, boolean>> = { jugar: true, estrella: true, patita: true };

interface IconoProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  nombre: NombreIcono;
  tamano?: number;
  titulo?: string;
}

export default function Icono({ nombre, tamano = 24, titulo, className = "", ...resto }: IconoProps) {
  const relleno = RELLENOS[nombre];
  return (
    <svg
      viewBox="0 0 24 24"
      width={tamano}
      height={tamano}
      fill={relleno ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={relleno ? 1.2 : 2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      {...resto}
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
