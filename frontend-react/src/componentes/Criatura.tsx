import { useId, type ReactNode } from "react";

// Animales de AstroVet dibujados en SVG con el mismo lenguaje que Capitán
// Misi: contorno tinta de 3.5, formas redondas, mejillas rosadas y ojos con
// brillo. Ilustraciones provisionales hasta tener el arte definitivo, pero
// ya con un estilo único para que el mundo se vea coherente.

export type ClaveCriatura =
  | "abeja"
  | "elefante"
  | "iguana"
  | "oso"
  | "unicornio"
  | "tortuga"
  | "tortuga-marina"
  | "pato"
  | "mona"
  | "pinguino"
  | "serpiente"
  | "leon"
  | "lechuza"
  | "burra"
  | "sapo"
  | "puma"
  | "mula"
  | "oveja"
  | "perro";

const T = "#2B2440";
const SW = 3.5;
const P = { stroke: T, strokeWidth: SW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Ojos({ x1, x2, y, r = 5 }: { x1: number; x2: number; y: number; r?: number }) {
  return (
    <g className="criatura-ojos">
      <ellipse cx={x1} cy={y} rx={r * 0.85} ry={r} fill={T} />
      <ellipse cx={x2} cy={y} rx={r * 0.85} ry={r} fill={T} />
      <circle cx={x1 + r * 0.3} cy={y - r * 0.38} r={r * 0.36} fill="#fff" />
      <circle cx={x2 + r * 0.3} cy={y - r * 0.38} r={r * 0.36} fill="#fff" />
    </g>
  );
}

function Mejillas({ x1, x2, y, r = 5.5 }: { x1: number; x2: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x1} cy={y} r={r} fill="#FFB7B2" opacity="0.75" />
      <circle cx={x2} cy={y} r={r} fill="#FFB7B2" opacity="0.75" />
    </>
  );
}

function Sonrisa({ x, y, ancho = 7 }: { x: number; y: number; ancho?: number }) {
  return <path d={`M${x - ancho} ${y} Q${x} ${y + ancho * 0.9} ${x + ancho} ${y}`} fill="none" {...P} strokeWidth={3} />;
}

function Abeja({ id }: { id: string }) {
  return (
    <>
      <ellipse cx="38" cy="38" rx="18" ry="13" fill="#E8F0FE" {...P} transform="rotate(-25 38 38)" />
      <ellipse cx="82" cy="38" rx="18" ry="13" fill="#E8F0FE" {...P} transform="rotate(25 82 38)" />
      <path d="M50 34 Q44 18 36 16 M70 34 Q76 18 84 16" fill="none" {...P} />
      <circle cx="35" cy="15" r="4.5" fill={T} />
      <circle cx="85" cy="15" r="4.5" fill={T} />
      <clipPath id={id}>
        <ellipse cx="60" cy="70" rx="34" ry="32" />
      </clipPath>
      <ellipse cx="60" cy="70" rx="34" ry="32" fill="#FFD166" />
      <g clipPath={`url(#${id})`} fill="#6B4A2B">
        <rect x="20" y="82" width="80" height="9" rx="2" />
        <rect x="20" y="97" width="80" height="9" rx="2" />
      </g>
      <ellipse cx="60" cy="70" rx="34" ry="32" fill="none" {...P} />
      <Ojos x1={48} x2={72} y={62} />
      <Mejillas x1={38} x2={82} y={72} />
      <Sonrisa x={60} y={71} ancho={6} />
    </>
  );
}

function Elefante() {
  const piel = "#B8B4CE";
  return (
    <>
      <ellipse cx="25" cy="58" rx="19" ry="24" fill={piel} {...P} />
      <ellipse cx="95" cy="58" rx="19" ry="24" fill={piel} {...P} />
      <ellipse cx="25" cy="58" rx="10" ry="15" fill="#FFB7B2" opacity="0.8" />
      <ellipse cx="95" cy="58" rx="10" ry="15" fill="#FFB7B2" opacity="0.8" />
      <circle cx="60" cy="56" r="32" fill={piel} {...P} />
      <path d="M60 66 C60 84 56 94 64 100 C70 104 76 98 71 94" fill="none" stroke={T} strokeWidth="17" strokeLinecap="round" />
      <path d="M60 66 C60 84 56 94 64 100 C70 104 76 98 71 94" fill="none" stroke={piel} strokeWidth="10" strokeLinecap="round" />
      <path d="M50 84 q10 4 20 0" fill="none" stroke="#9590A8" strokeWidth="2.5" strokeLinecap="round" />
      <Ojos x1={47} x2={73} y={52} />
      <Mejillas x1={40} x2={80} y={66} />
    </>
  );
}

function Iguana() {
  return (
    <>
      <path d="M30 46 l8 -14 l7 12 l7 -15 l7 14 l7 -14 l7 13 l8 -12 l5 16" fill="#3F9E73" {...P} />
      <ellipse cx="60" cy="66" rx="40" ry="28" fill="#7CC48A" {...P} />
      <ellipse cx="60" cy="96" rx="20" ry="10" fill="#7CC48A" {...P} />
      <circle cx="40" cy="58" r="11" fill="#E2F6EC" {...P} />
      <circle cx="80" cy="58" r="11" fill="#E2F6EC" {...P} />
      <Ojos x1={41} x2={79} y={59} r={5.5} />
      <circle cx="52" cy="74" r="2" fill={T} />
      <circle cx="68" cy="74" r="2" fill={T} />
      <path d="M36 80 Q60 92 84 80" fill="none" {...P} strokeWidth={3} />
      <Mejillas x1={30} x2={90} y={76} r={5} />
    </>
  );
}

function Oso() {
  return (
    <>
      <circle cx="33" cy="34" r="13" fill="#B9805A" {...P} />
      <circle cx="87" cy="34" r="13" fill="#B9805A" {...P} />
      <circle cx="33" cy="34" r="6" fill="#E8C9A6" />
      <circle cx="87" cy="34" r="6" fill="#E8C9A6" />
      <circle cx="60" cy="62" r="36" fill="#B9805A" {...P} />
      <ellipse cx="60" cy="78" rx="17" ry="13" fill="#E8C9A6" {...P} />
      <ellipse cx="60" cy="72" rx="6.5" ry="4.5" fill={T} />
      <path d="M60 76 v4 M54 82 q6 4 12 0" fill="none" {...P} strokeWidth={3} />
      <Ojos x1={46} x2={74} y={56} />
      <Mejillas x1={36} x2={84} y={70} />
    </>
  );
}

function Unicornio() {
  return (
    <>
      <path d="M60 8 L68 36 L52 36 Z" fill="#FFD166" {...P} />
      <path d="M55 20 l10 -3 M54 28 l12 -3" stroke="#E0A82E" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38 40 L34 18 L52 32 Z M82 40 L86 18 L68 32 Z" fill="#fff" {...P} />
      <ellipse cx="60" cy="64" rx="30" ry="33" fill="#fff" {...P} />
      <path d="M32 50 C18 56 20 78 30 86 C26 72 34 66 38 60 C34 74 40 84 44 88 C42 72 42 56 50 42 Z" fill="#B9A8E6" {...P} />
      <circle cx="40" cy="44" r="8" fill="#FFB7B2" {...P} />
      <ellipse cx="62" cy="84" rx="19" ry="12" fill="#FFE7E5" {...P} />
      <circle cx="56" cy="84" r="2" fill={T} />
      <circle cx="68" cy="84" r="2" fill={T} />
      <Ojos x1={52} x2={74} y={62} />
      <Mejillas x1={46} x2={84} y={72} r={4.5} />
    </>
  );
}

function Tortuga({ marina = false }: { marina?: boolean }) {
  const caparazon = marina ? "#5FB7C8" : "#6FBF8E";
  const linea = marina ? "#3E8C9E" : "#3F9E73";
  const piel = marina ? "#A9DDE4" : "#B6E2A6";
  return (
    <>
      {marina ? (
        <>
          <ellipse cx="26" cy="92" rx="14" ry="6" fill={piel} {...P} transform="rotate(25 26 92)" />
          <ellipse cx="86" cy="94" rx="14" ry="6" fill={piel} {...P} transform="rotate(-25 86 94)" />
        </>
      ) : (
        <>
          <ellipse cx="34" cy="92" rx="8" ry="7" fill={piel} {...P} />
          <ellipse cx="78" cy="92" rx="8" ry="7" fill={piel} {...P} />
        </>
      )}
      <circle cx="96" cy="62" r="17" fill={piel} {...P} />
      <path d="M14 88 A42 40 0 0 1 98 88 Z" fill={caparazon} {...P} />
      <path d="M56 50 l11 7 v12 l-11 7 l-11 -7 v-12 z M24 82 l14 -8 M88 82 l-14 -8 M45 69 l-15 -10 M67 69 l15 -10" fill="none" stroke={linea} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M12 88 h88" {...P} />
      <Ojos x1={92} x2={104} y={58} r={4} />
      <path d="M93 68 q5 4 10 0" fill="none" {...P} strokeWidth={2.5} />
      <circle cx="108" cy="66" r="3.5" fill="#FFB7B2" opacity="0.75" />
    </>
  );
}

function Pato() {
  return (
    <>
      <path d="M56 22 q4 -10 10 -4 q-4 0 -4 6" fill="#FFD166" {...P} />
      <ellipse cx="60" cy="88" rx="34" ry="20" fill="#FFD166" {...P} />
      <circle cx="60" cy="54" r="30" fill="#FFD166" {...P} />
      <path d="M38 72 Q60 64 82 72 Q76 86 60 86 Q44 86 38 72 Z" fill="#F4A261" {...P} />
      <path d="M42 74 Q60 70 78 74" fill="none" stroke="#C9722F" strokeWidth="2.5" strokeLinecap="round" />
      <Ojos x1={47} x2={73} y={50} />
      <Mejillas x1={36} x2={84} y={62} r={5} />
    </>
  );
}

function Mona() {
  return (
    <>
      <circle cx="24" cy="60" r="13" fill="#A0704F" {...P} />
      <circle cx="96" cy="60" r="13" fill="#A0704F" {...P} />
      <circle cx="24" cy="60" r="6.5" fill="#F1D3B3" />
      <circle cx="96" cy="60" r="6.5" fill="#F1D3B3" />
      <circle cx="60" cy="60" r="36" fill="#A0704F" {...P} />
      <path d="M60 46 C50 34 32 40 34 56 C35 70 44 88 60 90 C76 88 85 70 86 56 C88 40 70 34 60 46 Z" fill="#F1D3B3" {...P} />
      <path d="M52 22 q8 -10 14 2" fill="none" {...P} />
      <Ojos x1={49} x2={71} y={56} />
      <ellipse cx="56" cy="69" rx="1.8" ry="2.3" fill={T} />
      <ellipse cx="64" cy="69" rx="1.8" ry="2.3" fill={T} />
      <Sonrisa x={60} y={76} ancho={8} />
      <Mejillas x1={42} x2={78} y={70} r={4.5} />
    </>
  );
}

function Pinguino() {
  return (
    <>
      <ellipse cx="44" cy="108" rx="11" ry="5" fill="#F4A261" {...P} />
      <ellipse cx="76" cy="108" rx="11" ry="5" fill="#F4A261" {...P} />
      <path d="M26 76 q-12 10 -8 24 q10 -6 14 -14 Z M94 76 q12 10 8 24 q-10 -6 -14 -14 Z" fill="#2F3557" {...P} />
      <ellipse cx="60" cy="66" rx="34" ry="42" fill="#2F3557" {...P} />
      <path d="M60 40 C44 36 34 50 38 64 C36 82 44 102 60 102 C76 102 84 82 82 64 C86 50 76 36 60 40 Z" fill="#fff" {...P} />
      <path d="M52 62 L60 74 L68 62 Z" fill="#F4A261" {...P} />
      <Ojos x1={50} x2={70} y={54} r={4.5} />
      <Mejillas x1={44} x2={76} y={66} r={4.5} />
    </>
  );
}

function Serpiente() {
  return (
    <>
      <ellipse cx="60" cy="100" rx="42" ry="13" fill="#7CC48A" {...P} />
      <ellipse cx="60" cy="85" rx="32" ry="12" fill="#9BD67A" {...P} />
      <path d="M48 85 q12 6 24 0" fill="none" stroke="#3F9E73" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 100 q20 8 40 0" fill="none" stroke="#3F9E73" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 70 v4 l-3 4 M60 74 l3 4" fill="none" stroke="#E58C86" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="60" cy="50" rx="30" ry="24" fill="#9BD67A" {...P} />
      <circle cx="44" cy="34" r="3" fill="#3F9E73" />
      <circle cx="76" cy="34" r="3" fill="#3F9E73" />
      <circle cx="60" cy="30" r="3" fill="#3F9E73" />
      <Ojos x1={48} x2={72} y={48} r={5.5} />
      <Sonrisa x={60} y={60} ancho={9} />
      <Mejillas x1={38} x2={82} y={58} r={4.5} />
    </>
  );
}

function Leon() {
  const melena = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return <circle key={i} cx={60 + Math.cos(a) * 34} cy={62 + Math.sin(a) * 34} r="15" fill="#C9722F" {...P} />;
  });
  return (
    <>
      {melena}
      <circle cx="60" cy="62" r="34" fill="#C9722F" />
      <circle cx="38" cy="36" r="8" fill="#F2B661" {...P} />
      <circle cx="82" cy="36" r="8" fill="#F2B661" {...P} />
      <circle cx="60" cy="64" r="28" fill="#F2B661" {...P} />
      <ellipse cx="60" cy="78" rx="14" ry="10" fill="#FFF3D1" {...P} />
      <path d="M54 72 h12 l-6 6 z" fill={T} {...P} strokeWidth={2} />
      <path d="M60 78 v3 M54 84 q6 3 12 0" fill="none" {...P} strokeWidth={2.5} />
      <Ojos x1={49} x2={71} y={60} />
      <Mejillas x1={40} x2={80} y={72} r={4.5} />
    </>
  );
}

function Lechuza() {
  return (
    <>
      <path d="M30 40 L28 16 L48 30 Z M90 40 L92 16 L72 30 Z" fill="#6E5394" {...P} />
      <ellipse cx="60" cy="66" rx="38" ry="44" fill="#8C6BB1" {...P} />
      <ellipse cx="60" cy="84" rx="22" ry="22" fill="#DDD5F3" />
      <path d="M50 78 q4 4 8 0 M62 78 q4 4 8 0 M52 90 q4 4 8 0 M60 90 q4 4 8 0" fill="none" stroke="#8C6BB1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="52" r="15" fill="#fff" {...P} />
      <circle cx="76" cy="52" r="15" fill="#fff" {...P} />
      <Ojos x1={44} x2={76} y={53} r={7} />
      <path d="M55 62 L65 62 L60 72 Z" fill="#F4A261" {...P} />
    </>
  );
}

function Burra({ color = "#A39AAF", hocico = "#E7E2F1" }: { color?: string; hocico?: string }) {
  return (
    <>
      <ellipse cx="38" cy="26" rx="9" ry="24" fill={color} {...P} transform="rotate(-18 38 26)" />
      <ellipse cx="82" cy="26" rx="9" ry="24" fill={color} {...P} transform="rotate(18 82 26)" />
      <ellipse cx="38" cy="26" rx="4" ry="15" fill="#FFB7B2" transform="rotate(-18 38 26)" />
      <ellipse cx="82" cy="26" rx="4" ry="15" fill="#FFB7B2" transform="rotate(18 82 26)" />
      <ellipse cx="60" cy="64" rx="30" ry="38" fill={color} {...P} />
      <path d="M50 30 q10 -8 20 0 q-4 6 -10 8 q-6 -2 -10 -8 Z" fill="#5C556E" {...P} />
      <ellipse cx="60" cy="88" rx="22" ry="15" fill={hocico} {...P} />
      <ellipse cx="53" cy="88" rx="2.5" ry="3.5" fill={T} />
      <ellipse cx="67" cy="88" rx="2.5" ry="3.5" fill={T} />
      <Ojos x1={48} x2={72} y={60} />
      <Mejillas x1={40} x2={80} y={72} r={4.5} />
    </>
  );
}

function Sapo() {
  return (
    <>
      <ellipse cx="60" cy="96" rx="36" ry="14" fill="#7CC48A" {...P} />
      <ellipse cx="60" cy="70" rx="44" ry="30" fill="#8FD18F" {...P} />
      <circle cx="36" cy="42" r="15" fill="#8FD18F" {...P} />
      <circle cx="84" cy="42" r="15" fill="#8FD18F" {...P} />
      <circle cx="36" cy="42" r="9" fill="#fff" />
      <circle cx="84" cy="42" r="9" fill="#fff" />
      <Ojos x1={36} x2={84} y={43} r={5.5} />
      <path d="M28 74 Q60 96 92 74" fill="none" {...P} />
      <Mejillas x1={26} x2={94} y={68} r={6} />
      <circle cx="54" cy="64" r="1.8" fill={T} />
      <circle cx="66" cy="64" r="1.8" fill={T} />
    </>
  );
}

function Puma() {
  return (
    <>
      <path d="M30 50 L34 22 L54 36 Z M90 50 L86 22 L66 36 Z" fill="#D9A46B" {...P} />
      <path d="M35 30 L38 24 L46 32 Z M85 30 L82 24 L74 32 Z" fill="#5C3B24" />
      <ellipse cx="60" cy="64" rx="38" ry="34" fill="#D9A46B" {...P} />
      <path d="M44 74 C44 64 54 62 60 66 C66 62 76 64 76 74 C76 88 66 92 60 92 C54 92 44 88 44 74 Z" fill="#FFF8EE" {...P} />
      <path d="M54 70 h12 l-6 6 z" fill="#5C3B24" {...P} strokeWidth={2} />
      <path d="M60 76 v4 M53 82 q7 4 14 0" fill="none" {...P} strokeWidth={2.5} />
      <path d="M42 62 q-2 8 -8 10 M78 62 q2 8 8 10" fill="none" stroke="#5C3B24" strokeWidth="2.5" strokeLinecap="round" />
      <Ojos x1={46} x2={74} y={56} />
    </>
  );
}

function Oveja() {
  const lana = [
    [32, 46], [46, 32], [62, 28], [78, 32], [90, 46], [94, 64], [88, 82], [74, 92], [56, 94], [40, 90], [28, 78], [26, 62],
  ];
  return (
    <>
      {lana.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="15" fill="#fff" {...P} />
      ))}
      <circle cx="60" cy="62" r="34" fill="#fff" />
      <ellipse cx="22" cy="60" rx="12" ry="7" fill="#8E879F" {...P} transform="rotate(20 22 60)" />
      <ellipse cx="98" cy="60" rx="12" ry="7" fill="#8E879F" {...P} transform="rotate(-20 98 60)" />
      <ellipse cx="60" cy="66" rx="22" ry="27" fill="#8E879F" {...P} />
      <circle cx="52" cy="58" r="6" fill="#fff" />
      <circle cx="68" cy="58" r="6" fill="#fff" />
      <Ojos x1={52} x2={68} y={59} r={4} />
      <ellipse cx="60" cy="78" rx="9" ry="6" fill="#B8B1C7" />
      <path d="M56 79 q4 3 8 0" fill="none" {...P} strokeWidth={2.5} />
    </>
  );
}

function Perro() {
  return (
    <>
      <path d="M30 34 C14 36 12 70 24 78 C32 74 36 52 40 40 Z" fill="#8D6748" {...P} />
      <path d="M90 34 C106 36 108 70 96 78 C88 74 84 52 80 40 Z" fill="#8D6748" {...P} />
      <ellipse cx="60" cy="60" rx="34" ry="36" fill="#D9B48A" {...P} />
      <circle cx="74" cy="50" r="11" fill="#8D6748" opacity="0.55" />
      <ellipse cx="60" cy="78" rx="18" ry="14" fill="#FFF3D1" {...P} />
      <ellipse cx="60" cy="70" rx="7" ry="5" fill={T} />
      <path d="M60 74 v5 M53 81 q7 4 14 0" fill="none" {...P} strokeWidth={2.5} />
      <path d="M57 84 q3 10 7 0" fill="#E58C86" {...P} strokeWidth={2.5} />
      <Ojos x1={47} x2={73} y={54} />
    </>
  );
}

const DIBUJOS: Record<ClaveCriatura, (id: string) => ReactNode> = {
  abeja: (id) => <Abeja id={id} />,
  elefante: () => <Elefante />,
  iguana: () => <Iguana />,
  oso: () => <Oso />,
  unicornio: () => <Unicornio />,
  tortuga: () => <Tortuga />,
  "tortuga-marina": () => <Tortuga marina />,
  pato: () => <Pato />,
  mona: () => <Mona />,
  pinguino: () => <Pinguino />,
  serpiente: () => <Serpiente />,
  leon: () => <Leon />,
  lechuza: () => <Lechuza />,
  burra: () => <Burra />,
  sapo: () => <Sapo />,
  puma: () => <Puma />,
  mula: () => <Burra color="#9A7351" hocico="#F1D3B3" />,
  oveja: () => <Oveja />,
  perro: () => <Perro />,
};

interface CriaturaProps {
  clave: ClaveCriatura;
  tamano?: number;
  className?: string;
  titulo?: string;
}

/** Un animal. Lleva la clase .criatura para poder animar parpadeo y saltos desde CSS. */
export default function Criatura({ clave, tamano = 96, className = "", titulo }: CriaturaProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 120 120"
      width={tamano}
      height={tamano}
      className={`criatura overflow-visible ${className}`}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      {DIBUJOS[clave](`c${id}`)}
    </svg>
  );
}

/** Uno o varios animales (por ejemplo «Mimí y Pepe» o «la familia pato»). */
export function Grupo({ claves, tamano = 96, titulo }: { claves: ClaveCriatura[]; tamano?: number; titulo?: string }) {
  if (claves.length === 1) return <Criatura clave={claves[0]} tamano={tamano} titulo={titulo} />;
  const pequeno = Math.round(tamano * (claves.length > 2 ? 0.56 : 0.66));
  return (
    <span role={titulo ? "img" : undefined} aria-label={titulo} className="relative inline-flex items-end justify-center" style={{ width: tamano, height: tamano }}>
      {claves.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="absolute"
          style={{
            left: `${(i / Math.max(1, claves.length - 1)) * (tamano - pequeno)}px`,
            bottom: i % 2 === 1 ? tamano * 0.2 : 0,
            zIndex: i % 2 === 1 ? 0 : 1,
          }}
        >
          <Criatura clave={c} tamano={i === 0 ? pequeno * 1.12 : pequeno} />
        </span>
      ))}
    </span>
  );
}
