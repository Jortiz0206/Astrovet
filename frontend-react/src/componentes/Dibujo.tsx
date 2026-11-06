import type { ReactNode } from "react";
import Criatura, { type ClaveCriatura } from "./Criatura";

// Dibujos de las palabras del recorrido (mundos 1 a 3), con el mismo trazo
// que los animales. Cada palabra se puede reconocer sin ayuda (sección 12.1).

const T = "#2B2440";
const P = { stroke: T, strokeWidth: 3.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const ANIMALES: Record<string, ClaveCriatura> = {
  ABEJA: "abeja",
  ELEFANTE: "elefante",
  IGUANA: "iguana",
  OSO: "oso",
  OVEJA: "oveja",
  PATO: "pato",
  PERRO: "perro",
  SAPO: "sapo",
  LEÓN: "leon",
  MULA: "mula",
  PUMA: "puma",
};

function Cara({ pelo, extra, piel = "#F1C9A5" }: { pelo: ReactNode; extra?: ReactNode; piel?: string }) {
  return (
    <>
      {pelo}
      <ellipse cx="60" cy="64" rx="30" ry="34" fill={piel} {...P} />
      <ellipse cx="49" cy="62" rx="4" ry="5" fill={T} />
      <ellipse cx="71" cy="62" rx="4" ry="5" fill={T} />
      <circle cx="50.5" cy="60" r="1.5" fill="#fff" />
      <circle cx="72.5" cy="60" r="1.5" fill="#fff" />
      <circle cx="42" cy="74" r="5" fill="#FFB7B2" opacity="0.7" />
      <circle cx="78" cy="74" r="5" fill="#FFB7B2" opacity="0.7" />
      <path d="M52 80 Q60 87 68 80" fill="none" {...P} strokeWidth={3} />
      {extra}
    </>
  );
}

const OBJETOS: Record<string, ReactNode> = {
  AVIÓN: (
    <>
      <path d="M14 66 C14 58 22 54 32 54 H92 C104 54 110 60 110 64 C110 68 104 72 92 72 H32 C22 72 14 70 14 66 Z" fill="#fff" {...P} />
      <path d="M58 56 L44 26 H56 L78 56 Z M58 70 L46 96 H58 L78 70 Z" fill="#8E7CC3" {...P} />
      <path d="M18 60 L12 40 H22 L32 56" fill="#8E7CC3" {...P} />
      <circle cx="74" cy="63" r="3.5" fill="#C9DAF8" stroke={T} strokeWidth="2" />
      <circle cx="86" cy="63" r="3.5" fill="#C9DAF8" stroke={T} strokeWidth="2" />
      <path d="M98 58 C104 58 106 62 106 64 H96 Z" fill="#C9DAF8" stroke={T} strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  ESTRELLA: (
    <>
      <path d="M60 10 L74 42 L108 46 L82 68 L90 102 L60 84 L30 102 L38 68 L12 46 L46 42 Z" fill="#FFD166" {...P} />
      <ellipse cx="51" cy="58" rx="3.5" ry="4.5" fill={T} />
      <ellipse cx="69" cy="58" rx="3.5" ry="4.5" fill={T} />
      <path d="M53 68 Q60 74 67 68" fill="none" {...P} strokeWidth={3} />
    </>
  ),
  ISLA: (
    <>
      <path d="M8 96 C24 90 40 92 60 96 C80 100 96 92 112 96 V112 H8 Z" fill="#8FC7E8" {...P} />
      <path d="M22 94 C30 78 90 78 98 94 Z" fill="#F6D58E" {...P} />
      <path d="M62 86 C60 66 58 52 52 40" fill="none" stroke="#8D6748" strokeWidth="9" strokeLinecap="round" />
      <path d="M62 86 C60 66 58 52 52 40" fill="none" {...P} strokeWidth={2.5} />
      <path d="M52 40 C40 30 26 34 20 44 C32 40 42 42 52 40 Z M52 40 C60 26 76 24 86 32 C74 32 62 36 52 40 Z M52 40 C48 28 40 20 30 20 C36 26 44 32 52 40 Z M52 40 C64 40 78 44 82 56 C72 48 62 44 52 40 Z" fill="#6FBF8E" {...P} />
    </>
  ),
  UVAS: (
    <>
      <path d="M60 24 C60 16 64 12 70 10" fill="none" stroke="#5C3B24" strokeWidth="5" strokeLinecap="round" />
      <path d="M62 22 C72 14 86 16 90 24 C80 28 70 28 62 22 Z" fill="#6FBF8E" {...P} />
      {[
        [46, 40], [62, 38], [78, 40], [38, 56], [54, 56], [70, 56], [86, 56], [46, 72], [62, 72], [78, 72], [54, 88], [70, 88], [62, 102],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="10" fill="#9C7FD1" {...P} strokeWidth={3} />
      ))}
      <circle cx="58" cy="35" r="2.5" fill="#fff" opacity="0.8" />
    </>
  ),
  UÑA: (
    <>
      <path d="M40 112 V48 C40 28 80 28 80 48 V112 Z" fill="#F1C9A5" {...P} />
      <path d="M48 52 C48 38 72 38 72 52 V64 C72 70 48 70 48 64 Z" fill="#FFB7B2" {...P} />
      <path d="M52 48 C54 44 58 42 62 42" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 86 q12 4 24 0" fill="none" stroke="#D9A07A" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  MANZANA: (
    <>
      <path d="M60 34 C44 22 18 30 20 60 C22 88 42 106 60 98 C78 106 98 88 100 60 C102 30 76 22 60 34 Z" fill="#E86A5E" {...P} />
      <path d="M60 34 C60 24 62 18 66 12" fill="none" stroke="#5C3B24" strokeWidth="5" strokeLinecap="round" />
      <path d="M64 24 C72 12 90 14 92 22 C82 28 72 28 64 24 Z" fill="#6FBF8E" {...P} />
      <path d="M34 52 C36 44 42 40 48 40" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    </>
  ),
  MAPA: (
    <>
      <path d="M14 30 L42 20 L78 30 L106 20 V90 L78 100 L42 90 L14 100 Z" fill="#FFF3D1" {...P} />
      <path d="M42 20 V90 M78 30 V100" fill="none" {...P} strokeWidth={2.5} />
      <path d="M26 74 C36 62 50 74 58 60 C66 46 80 56 90 44" fill="none" stroke="#E58C86" strokeWidth="3.5" strokeDasharray="1 7" strokeLinecap="round" />
      <path d="M86 38 l8 8 M94 38 l-8 8" stroke="#E86A5E" strokeWidth="4" strokeLinecap="round" />
      <path d="M22 44 c6 -6 14 -2 14 4 c0 6 -10 8 -14 -4 z" fill="#8FD18F" stroke={T} strokeWidth="2" />
    </>
  ),
  MESA: (
    <>
      <path d="M12 44 H108 L100 56 H20 Z" fill="#C99366" {...P} />
      <path d="M26 56 V104 M94 56 V104 M40 56 V92 M80 56 V92" fill="none" stroke="#8D6748" strokeWidth="7" strokeLinecap="round" />
      <path d="M26 56 V104 M94 56 V104" fill="none" {...P} strokeWidth={2} />
      <path d="M50 44 C50 30 70 30 70 44" fill="#E8F0FE" {...P} />
      <path d="M60 30 c-4 -6 4 -8 0 -14" fill="none" stroke="#8E7CC3" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  MAMÁ: (
    <Cara
      pelo={
        <>
          <path d="M26 62 C22 28 40 16 60 16 C80 16 98 28 94 62 C96 84 94 100 86 108 H34 C26 100 24 84 26 62 Z" fill="#6B4A2B" {...P} />
        </>
      }
      extra={
        <>
          <path d="M30 52 C38 30 72 26 90 50 C78 44 60 40 30 52 Z" fill="#6B4A2B" {...P} />
          <circle cx="30" cy="80" r="4" fill="#FFD166" {...P} strokeWidth={2} />
          <circle cx="90" cy="80" r="4" fill="#FFD166" {...P} strokeWidth={2} />
        </>
      }
    />
  ),
  PAPÁ: (
    <Cara
      piel="#D9A07A"
      pelo={<path d="M28 56 C26 30 42 20 60 20 C80 20 94 30 92 56 C84 40 72 36 60 36 C46 36 36 40 28 56 Z" fill="#2F2A3F" {...P} />}
      extra={<path d="M46 78 C52 72 58 74 60 77 C62 74 68 72 74 78 C68 82 64 80 60 79 C56 80 52 82 46 78 Z" fill="#2F2A3F" {...P} strokeWidth={2.5} />}
    />
  ),
  MIMO: (
    <Cara
      piel="#FFFFFF"
      pelo={
        <>
          <path d="M24 104 C24 94 40 90 60 90 C80 90 96 94 96 104 V114 H24 Z" fill="#fff" {...P} />
          <path d="M28 98 H92 M26 108 H94" stroke={T} strokeWidth="5" />
        </>
      }
      extra={
        <>
          <path d="M30 40 C30 26 50 20 64 22 C82 24 94 30 92 40 C80 36 46 34 30 40 Z" fill={T} {...P} />
          <circle cx="66" cy="20" r="4" fill={T} />
          <path d="M49 52 v-6 M71 52 v-6" stroke={T} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M49 70 v6 M71 70 v6" stroke="#8E7CC3" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M52 81 Q60 87 68 81" fill="none" stroke="#E86A5E" strokeWidth="4" strokeLinecap="round" />
        </>
      }
    />
  ),
  PELO: (
    <Cara
      pelo={
        <>
          {[
            [30, 40], [44, 26], [60, 20], [76, 26], [90, 40], [96, 58], [24, 58], [94, 76], [26, 76],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="16" fill="#E0884A" {...P} />
          ))}
          <circle cx="60" cy="46" r="30" fill="#E0884A" />
        </>
      }
      extra={
        <>
          <path d="M34 46 C40 34 50 38 54 44 C58 34 70 34 74 44 C80 36 88 40 88 48" fill="none" stroke="#C26A2E" strokeWidth="3" strokeLinecap="round" />
          <rect x="88" y="14" width="26" height="8" rx="3" fill="#8E7CC3" {...P} strokeWidth={2.5} transform="rotate(30 100 18)" />
        </>
      }
    />
  ),
  PELOTA: (
    <>
      <circle cx="60" cy="60" r="44" fill="#fff" {...P} />
      <path d="M60 16 C80 30 80 90 60 104" fill="#FFB7B2" {...P} />
      <path d="M60 16 C40 30 40 90 60 104" fill="#C9DAF8" {...P} />
      <path d="M18 50 C40 58 80 58 102 50" fill="none" {...P} />
      <path d="M30 34 C34 28 40 24 46 22" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  SOL: (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const x1 = 60 + Math.cos(a) * 38;
        const y1 = 60 + Math.sin(a) * 38;
        const x2 = 60 + Math.cos(a) * 52;
        const y2 = 60 + Math.sin(a) * 52;
        return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#E0A82E" strokeWidth="7" strokeLinecap="round" />;
      })}
      <circle cx="60" cy="60" r="30" fill="#FFD166" {...P} />
      <ellipse cx="51" cy="57" rx="3.5" ry="4.5" fill={T} />
      <ellipse cx="69" cy="57" rx="3.5" ry="4.5" fill={T} />
      <circle cx="44" cy="67" r="4.5" fill="#F4A261" opacity="0.7" />
      <circle cx="76" cy="67" r="4.5" fill="#F4A261" opacity="0.7" />
      <path d="M52 68 Q60 75 68 68" fill="none" {...P} strokeWidth={3} />
    </>
  ),
  SANDÍA: (
    <>
      <path d="M10 48 H110 C110 80 88 102 60 102 C32 102 10 80 10 48 Z" fill="#6FBF8E" {...P} />
      <path d="M18 48 H102 C102 74 84 92 60 92 C36 92 18 74 18 48 Z" fill="#F07C74" />
      <path d="M18 48 H102 C102 74 84 92 60 92 C36 92 18 74 18 48" fill="none" stroke="#fff" strokeWidth="4" />
      {[
        [40, 60], [60, 66], [80, 60], [50, 76], [70, 76],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2.5" ry="4" fill={T} />
      ))}
      <path d="M10 48 H110" {...P} />
    </>
  ),
  LUNA: (
    <>
      <path d="M78 14 C52 18 34 40 36 64 C38 90 62 108 88 104 C66 96 54 78 56 58 C58 38 68 22 78 14 Z" fill="#FFE9A8" {...P} />
      <circle cx="54" cy="46" r="5" fill="#F6D58E" />
      <circle cx="58" cy="80" r="7" fill="#F6D58E" />
      <ellipse cx="66" cy="62" rx="3" ry="4" fill={T} />
      <path d="M68 74 q-6 4 -10 -2" fill="none" {...P} strokeWidth={2.5} />
    </>
  ),
  LUPA: (
    <>
      <path d="M74 74 L104 104" stroke="#8D6748" strokeWidth="14" strokeLinecap="round" />
      <path d="M74 74 L104 104" stroke={T} strokeWidth="3" strokeLinecap="round" opacity="0" />
      <circle cx="50" cy="50" r="32" fill="#E8F0FE" {...P} strokeWidth={6} />
      <circle cx="50" cy="50" r="32" fill="none" stroke="#8E7CC3" strokeWidth="5" />
      <path d="M34 40 C38 32 44 28 52 28" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  SOPA: (
    <>
      <path d="M48 30 c-6 -8 6 -10 0 -18 M62 30 c-6 -8 6 -10 0 -18 M76 30 c-6 -8 6 -10 0 -18" fill="none" stroke="#B9A8E6" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M14 52 H106 C106 82 86 100 60 100 C34 100 14 82 14 52 Z" fill="#8E7CC3" {...P} />
      <ellipse cx="60" cy="52" rx="46" ry="10" fill="#F4A261" {...P} />
      <circle cx="46" cy="51" r="3.5" fill="#6FBF8E" />
      <circle cx="68" cy="50" r="3" fill="#E86A5E" />
      <path d="M44 106 H76" {...P} strokeWidth={5} />
      <path d="M88 40 L110 18" stroke="#BDB9CC" strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  PALA: (
    <>
      <path d="M60 8 V64" stroke="#8D6748" strokeWidth="9" strokeLinecap="round" />
      <path d="M48 10 H72" stroke="#8D6748" strokeWidth="9" strokeLinecap="round" />
      <path d="M40 64 H80 V86 C80 100 70 110 60 112 C50 110 40 100 40 86 Z" fill="#BDB9CC" {...P} />
      <path d="M48 72 V92" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    </>
  ),
  PALO: (
    <>
      <path d="M22 100 C40 80 70 46 100 18" fill="none" stroke={T} strokeWidth="16" strokeLinecap="round" />
      <path d="M22 100 C40 80 70 46 100 18" fill="none" stroke="#A97A4F" strokeWidth="10" strokeLinecap="round" />
      <path d="M62 58 C70 56 76 50 78 44" fill="none" stroke={T} strokeWidth="9" strokeLinecap="round" />
      <path d="M62 58 C70 56 76 50 78 44" fill="none" stroke="#A97A4F" strokeWidth="4" strokeLinecap="round" />
      <path d="M78 44 C86 38 92 40 94 44 C88 48 82 48 78 44 Z" fill="#6FBF8E" {...P} strokeWidth={2.5} />
    </>
  ),
  LIMA: (
    <>
      <ellipse cx="60" cy="64" rx="42" ry="34" fill="#9BD67A" {...P} />
      <circle cx="60" cy="64" r="24" fill="#E2F6EC" stroke="#6FBF8E" strokeWidth="4" />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <path key={i} d={`M60 64 L${60 + Math.cos(a) * 22} ${64 + Math.sin(a) * 22}`} stroke="#9BD67A" strokeWidth="3" strokeLinecap="round" />;
      })}
      <path d="M86 32 C94 22 106 24 108 30 C100 34 92 34 86 32 Z" fill="#6FBF8E" {...P} strokeWidth={2.5} />
    </>
  ),
  LOMA: (
    <>
      <circle cx="92" cy="28" r="12" fill="#FFD166" {...P} />
      <path d="M6 104 C20 54 52 36 70 44 C88 52 104 76 114 104 Z" fill="#8FD18F" {...P} />
      <path d="M40 104 C52 80 72 70 90 74 C100 80 108 92 114 104 Z" fill="#6FBF8E" {...P} />
      <path d="M48 58 v8 M44 62 h8 M74 60 v8 M70 64 h8" stroke="#3F9E73" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  OLA: (
    <>
      <path d="M8 76 C20 40 56 28 76 46 C88 58 80 76 66 72 C58 70 60 58 68 58 C62 50 46 54 42 70 C38 88 54 98 72 96 C88 94 102 86 112 76 V110 H8 Z" fill="#6FB8E0" {...P} />
      <path d="M16 90 C26 86 34 94 44 90" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 84 C88 80 96 86 104 82" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  ALA: (
    <>
      <path d="M20 84 C20 50 50 22 104 22 C100 34 92 40 84 42 C96 44 98 50 92 56 C84 62 74 62 68 62 C78 64 80 72 72 78 C60 86 38 90 20 84 Z" fill="#fff" {...P} />
      <path d="M40 76 C56 66 76 52 92 30 M36 64 C52 56 66 46 80 32" fill="none" stroke="#C9DAF8" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  PISO: (
    <>
      <path d="M6 104 L34 44 H86 L114 104 Z" fill="#E7D3B2" {...P} />
      <path d="M24 66 H96 M15 86 H105 M60 44 V104 M47 44 L36 104 M73 44 L84 104" fill="none" stroke="#B48B5C" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 104 L34 44 H86 L114 104 Z" fill="none" {...P} />
    </>
  ),
  AJO: (
    <>
      <path d="M60 22 C52 34 26 44 26 72 C26 96 44 104 60 104 C76 104 94 96 94 72 C94 44 68 34 60 22 Z" fill="#FBF7EC" {...P} />
      <path d="M60 30 C54 50 50 76 56 102 M60 30 C68 50 72 76 66 102 M44 46 C36 62 36 84 44 100 M76 46 C84 62 84 84 76 100" fill="none" stroke="#D8CDB2" strokeWidth="3" />
      <path d="M60 22 C58 14 60 10 64 6" fill="none" stroke="#8A7A5A" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  AGUACATE: (
    <>
      <path d="M60 10 C40 12 32 40 26 62 C18 92 38 110 60 110 C82 110 102 92 94 62 C88 40 80 12 60 10 Z" fill="#4F8F45" {...P} />
      <path d="M60 22 C46 24 42 46 38 64 C32 88 46 100 60 100 C74 100 88 88 82 64 C78 46 74 24 60 22 Z" fill="#CBE69A" />
      <circle cx="60" cy="74" r="16" fill="#A0673D" {...P} />
      <path d="M54 68 C56 64 60 62 63 63" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </>
  ),
  PAN: (
    <>
      <path d="M14 70 C14 42 36 30 60 30 C84 30 106 42 106 70 C106 84 98 90 86 90 H34 C22 90 14 84 14 70 Z" fill="#E7B36A" {...P} />
      <path d="M40 46 L48 62 M58 42 L64 60 M76 46 L80 62" fill="none" stroke="#B57A33" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 66 C26 54 32 48 40 44" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  PERA: (
    <>
      <path d="M60 28 C48 28 46 44 46 52 C46 62 22 70 24 92 C26 108 44 112 60 112 C76 112 94 108 96 92 C98 70 74 62 74 52 C74 44 72 28 60 28 Z" fill="#C9DB6A" {...P} />
      <path d="M60 28 C60 20 62 14 66 8" fill="none" stroke="#5C3B24" strokeWidth="5" strokeLinecap="round" />
      <path d="M64 18 C72 8 88 10 90 18 C80 24 70 22 64 18 Z" fill="#6FBF8E" {...P} />
      <path d="M38 84 C38 76 42 72 48 70" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    </>
  ),
  "MAÍZ": (
    <>
      <path d="M60 10 C40 14 36 50 38 78 C40 98 50 108 60 108 C70 108 80 98 82 78 C84 50 80 14 60 10 Z" fill="#FFD166" {...P} />
      {Array.from({ length: 5 }, (_, f) =>
        [46, 60, 74].map((x) => <circle key={`${f}-${x}`} cx={x} cy={30 + f * 15} r="5" fill="#F2B632" />),
      )}
      <path d="M58 108 C40 98 22 80 24 56 C34 72 46 86 60 92 Z M62 108 C80 98 98 80 96 56 C86 72 74 86 60 92 Z" fill="#6FBF8E" {...P} />
    </>
  ),
  MANGO: (
    <>
      <path d="M30 48 C40 22 84 18 98 44 C110 70 92 104 62 106 C32 108 18 78 30 48 Z" fill="#FFB347" {...P} />
      <path d="M30 48 C40 22 70 20 84 30 C70 34 50 46 40 70 C34 66 28 58 30 48 Z" fill="#E86A5E" opacity="0.55" />
      <path d="M84 30 C88 20 94 14 100 12" fill="none" stroke="#5C3B24" strokeWidth="5" strokeLinecap="round" />
      <path d="M92 18 C98 6 112 8 114 14 C106 20 98 20 92 18 Z" fill="#6FBF8E" {...P} />
    </>
  ),
  LECHE: (
    <>
      <path d="M36 30 H84 V104 C84 108 82 110 78 110 H42 C38 110 36 108 36 104 Z" fill="#fff" {...P} />
      <path d="M36 30 L46 14 H74 L84 30 Z" fill="#9FD3F2" {...P} />
      <rect x="36" y="56" width="48" height="26" fill="#9FD3F2" {...P} />
      <path d="M52 64 C56 60 64 60 68 64 C64 70 56 72 52 64 Z" fill="#fff" />
    </>
  ),
  "LIMÓN": (
    <>
      <path d="M16 62 C16 40 40 26 60 26 C80 26 104 40 104 62 C104 84 80 98 60 98 C40 98 16 84 16 62 Z" fill="#FFE066" {...P} />
      <path d="M16 62 L6 58 M104 62 L114 58" stroke={T} strokeWidth="4" strokeLinecap="round" />
      <path d="M36 50 C40 42 48 38 56 37" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    </>
  ),
  SAL: (
    <>
      <path d="M40 40 H80 V104 C80 108 78 110 74 110 H46 C42 110 40 108 40 104 Z" fill="#F4F1FB" {...P} />
      <path d="M40 40 C40 22 80 22 80 40 Z" fill="#B9A8E6" {...P} />
      <circle cx="54" cy="30" r="2.5" fill={T} />
      <circle cx="60" cy="27" r="2.5" fill={T} />
      <circle cx="66" cy="30" r="2.5" fill={T} />
      <rect x="46" y="62" width="28" height="18" rx="4" fill="#DDD5F3" />
    </>
  ),
  OLLA: (
    <>
      <path d="M18 50 H102 V88 C102 102 90 110 76 110 H44 C30 110 18 102 18 88 Z" fill="#8E7CC3" {...P} />
      <path d="M8 56 H18 M102 56 H112" stroke={T} strokeWidth="6" strokeLinecap="round" />
      <rect x="12" y="42" width="96" height="12" rx="6" fill="#B9A8E6" {...P} />
    </>
  ),
  SALA: (
    <>
      <rect x="20" y="40" width="80" height="34" rx="12" fill="#B9A8E6" {...P} />
      <rect x="10" y="58" width="22" height="34" rx="9" fill="#8E7CC3" {...P} />
      <rect x="88" y="58" width="22" height="34" rx="9" fill="#8E7CC3" {...P} />
      <rect x="28" y="66" width="64" height="24" rx="8" fill="#DDD5F3" {...P} />
      <path d="M22 92 v10 M98 92 v10" {...P} strokeWidth={5} />
      <rect x="44" y="48" width="18" height="16" rx="5" fill="#FFB7B2" {...P} strokeWidth={2.5} transform="rotate(-8 53 56)" />
    </>
  ),
};

/** Dibujo de una palabra. Los animales usan la misma ilustración que en las misiones. */
export default function Dibujo({ palabra, tamano = 96, className = "" }: { palabra: string; tamano?: number; className?: string }) {
  const animal = ANIMALES[palabra];
  if (animal) return <Criatura clave={animal} tamano={tamano} className={className} />;
  const objeto = OBJETOS[palabra];
  return (
    <svg viewBox="0 0 120 120" width={tamano} height={tamano} className={`overflow-visible ${className}`} aria-hidden="true">
      {objeto ?? <circle cx="60" cy="60" r="40" fill="#DDD5F3" {...P} />}
    </svg>
  );
}

export function hayDibujo(palabra: string): boolean {
  return palabra in ANIMALES || palabra in OBJETOS;
}
