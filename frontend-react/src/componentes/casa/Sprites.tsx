import type { ReactNode } from "react";
import type { TipoSprite } from "../../datos/casa";

// Muebles isométricos (vista estilo Habbo). Cada dibujo vive en un lienzo de
// 120×170 con el punto de apoyo (centro de la baldosa) en (60, 150).
// Una baldosa mide 72×36: el eje c avanza (36, 18) y el eje r (−36, 18).

export const ANCHO_SPRITE = 120;
export const ALTO_SPRITE = 170;
const CX = 60;
const CY = 150;
const T = "#2B2440";

/** Aclara (+) u oscurece (−) un color hex. */
function tono(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function punto(u: number, v: number, z: number): string {
  return `${CX + u * 36 - v * 36},${CY + u * 18 + v * 18 - z}`;
}

/** Caja isométrica: a (largo en c), b (largo en r), alto h, elevada z, desplazada du/dv. */
function Caja({ a, b, h, z = 0, du = 0, dv = 0, color, trazo = 2.5 }: { a: number; b: number; h: number; z?: number; du?: number; dv?: number; color: string; trazo?: number }) {
  const u0 = du - a / 2;
  const u1 = du + a / 2;
  const v0 = dv - b / 2;
  const v1 = dv + b / 2;
  const arriba = [punto(u0, v0, z + h), punto(u1, v0, z + h), punto(u1, v1, z + h), punto(u0, v1, z + h)].join(" ");
  const derecha = [punto(u1, v0, z), punto(u1, v1, z), punto(u1, v1, z + h), punto(u1, v0, z + h)].join(" ");
  const izquierda = [punto(u0, v1, z), punto(u1, v1, z), punto(u1, v1, z + h), punto(u0, v1, z + h)].join(" ");
  const p = { stroke: T, strokeWidth: trazo, strokeLinejoin: "round" as const };
  return (
    <g>
      <polygon points={izquierda} fill={tono(color, -0.12)} {...p} />
      <polygon points={derecha} fill={tono(color, -0.28)} {...p} />
      <polygon points={arriba} fill={tono(color, 0.18)} {...p} />
    </g>
  );
}

function xy(u: number, v: number, z: number): [number, number] {
  return [CX + u * 36 - v * 36, CY + u * 18 + v * 18 - z];
}

const DIBUJOS: Record<TipoSprite, (c: string) => ReactNode> = {
  cama: (c) => (
    <>
      <Caja a={0.95} b={0.62} h={14} color="#C9A27C" />
      <Caja a={0.9} b={0.58} h={9} z={14} color="#FFFFFF" />
      <Caja a={0.6} b={0.6} h={4} z={23} du={0.15} color={c} />
      <Caja a={0.22} b={0.48} h={7} z={23} du={-0.33} color="#F4F1FB" />
      <Caja a={0.08} b={0.62} h={34} du={-0.5} color="#C9A27C" />
    </>
  ),
  estante: (c) => (
    <>
      <Caja a={0.36} b={0.86} h={88} du={-0.2} color="#C9A27C" />
      {[22, 48, 74].map((z) => (
        <g key={z}>
          <Caja a={0.12} b={0.16} h={18} z={z - 18} du={0.0} dv={-0.25} color={c} trazo={1.5} />
          <Caja a={0.12} b={0.12} h={14} z={z - 18} du={0.0} dv={0.05} color="#9FD3F2" trazo={1.5} />
          <Caja a={0.12} b={0.14} h={16} z={z - 18} du={0.0} dv={0.28} color="#FFD166" trazo={1.5} />
        </g>
      ))}
    </>
  ),
  planta: (c) => {
    const [x, y] = xy(0, 0, 34);
    return (
      <>
        <Caja a={0.38} b={0.38} h={22} color={c} />
        <path d={`M${x} ${y + 10} C ${x - 4} ${y - 10}, ${x - 26} ${y - 22}, ${x - 30} ${y - 36} M${x} ${y + 10} C ${x + 4} ${y - 20}, ${x + 20} ${y - 30}, ${x + 26} ${y - 46} M${x} ${y + 10} V ${y - 48}`} fill="none" stroke="#3F9E73" strokeWidth="4" strokeLinecap="round" />
        {[
          [-30, -38, 13],
          [26, -48, 14],
          [0, -54, 15],
          [-14, -20, 12],
          [14, -24, 12],
        ].map(([dx, dy, r], i) => (
          <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={i % 2 ? "#6FBF8E" : "#8FD9B6"} stroke={T} strokeWidth="2.5" />
        ))}
      </>
    );
  },
  lampara: (c) => {
    const [x, y] = xy(0, 0, 0);
    return (
      <>
        <ellipse cx={x} cy={y} rx="18" ry="9" fill="#8E7CC3" stroke={T} strokeWidth="2.5" />
        <path d={`M${x} ${y} V ${y - 84}`} stroke={T} strokeWidth="4" />
        <circle cx={x} cy={y - 96} r="30" fill={c} opacity="0.25" className="sprite-brillo" />
        <path d={`M${x - 22} ${y - 82} L${x - 12} ${y - 112} H${x + 12} L${x + 22} ${y - 82} Z`} fill={c} stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
      </>
    );
  },
  telescopio: (c) => {
    const [x, y] = xy(0, 0, 0);
    return (
      <>
        <path d={`M${x} ${y - 46} L${x - 22} ${y + 4} M${x} ${y - 46} L${x + 22} ${y + 4} M${x} ${y - 46} L${x + 2} ${y + 12}`} stroke="#5f5878" strokeWidth="4" strokeLinecap="round" />
        <g transform={`rotate(-32 ${x} ${y - 52})`}>
          <rect x={x - 34} y={y - 62} width="64" height="20" rx="8" fill={c} stroke={T} strokeWidth="2.5" />
          <rect x={x + 24} y={y - 66} width="14" height="28" rx="5" fill={tono(c, -0.25)} stroke={T} strokeWidth="2.5" />
        </g>
      </>
    );
  },
  sofa: (c) => (
    <>
      <Caja a={0.95} b={0.2} h={34} dv={-0.26} color={c} />
      <Caja a={0.95} b={0.5} h={14} dv={0.08} color={c} />
      <Caja a={0.18} b={0.7} h={24} du={-0.4} color={tono(c, -0.1)} />
      <Caja a={0.18} b={0.7} h={24} du={0.4} color={tono(c, -0.1)} />
      <Caja a={0.5} b={0.4} h={5} z={14} dv={0.1} color={tono(c, 0.3)} trazo={1.5} />
    </>
  ),
  mesa: (c) => {
    const patas = [
      [-0.3, -0.3],
      [0.3, -0.3],
      [-0.3, 0.3],
      [0.3, 0.3],
    ];
    return (
      <>
        {patas.map(([u, v], i) => {
          const [x, y] = xy(u, v, 0);
          return <path key={i} d={`M${x} ${y} V${y - 28}`} stroke={T} strokeWidth="4" strokeLinecap="round" />;
        })}
        <Caja a={0.8} b={0.8} h={6} z={28} color={c} />
        <Caja a={0.14} b={0.14} h={12} z={34} du={0.1} dv={-0.1} color="#FFFFFF" trazo={1.5} />
      </>
    );
  },
  piano: (c) => {
    const pts = [xy(-0.42, 0.22, 26), xy(0.42, 0.22, 26), xy(0.42, 0.22, 34), xy(-0.42, 0.22, 34)];
    return (
      <>
        <Caja a={0.9} b={0.45} h={58} dv={-0.12} color={c} />
        <Caja a={0.9} b={0.2} h={8} z={26} dv={0.2} color="#FFFFFF" />
        <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="#fff" stroke={T} strokeWidth="1.5" />
        {Array.from({ length: 6 }, (_, i) => {
          const [x, y] = xy(-0.36 + i * 0.14, 0.3, 34);
          return <path key={i} d={`M${x} ${y} l 4 -2`} stroke={T} strokeWidth="3" strokeLinecap="round" />;
        })}
      </>
    );
  },
  acuario: (c) => {
    const [x, y] = xy(0, 0.1, 40);
    return (
      <>
        <Caja a={0.8} b={0.5} h={22} color="#8E7CC3" />
        <g opacity="0.85">
          <Caja a={0.76} b={0.46} h={40} z={22} color={c} />
        </g>
        <ellipse cx={x - 8} cy={y} rx="9" ry="6" fill="#FFB347" stroke={T} strokeWidth="2" className="sprite-pez" />
        <circle cx={x + 14} cy={y - 14} r="3" fill="#fff" opacity="0.8" />
        <circle cx={x + 18} cy={y - 24} r="2" fill="#fff" opacity="0.8" />
      </>
    );
  },
  cohete: (c) => {
    const [x, y] = xy(0, 0, 0);
    return (
      <>
        <ellipse cx={x} cy={y} rx="22" ry="10" fill="#5f5878" opacity="0.35" />
        <path d={`M${x - 14} ${y - 18} L${x - 28} ${y + 2} L${x - 12} ${y - 2} Z M${x + 14} ${y - 18} L${x + 28} ${y + 2} L${x + 12} ${y - 2} Z`} fill={tono(c, -0.2)} stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={`M${x} ${y - 92} Q${x + 22} ${y - 60} ${x + 16} ${y - 4} H${x - 16} Q${x - 22} ${y - 60} ${x} ${y - 92} Z`} fill="#F4F1FB" stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={`M${x} ${y - 92} Q${x + 12} ${y - 76} ${x + 14} ${y - 66} H${x - 14} Q${x - 12} ${y - 76} ${x} ${y - 92} Z`} fill={c} stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={x} cy={y - 46} r="8" fill="#9FD3F2" stroke={T} strokeWidth="2.5" />
      </>
    );
  },
  globo: (c) => {
    const [x, y] = xy(0, 0, 0);
    return (
      <>
        <ellipse cx={x} cy={y} rx="16" ry="8" fill="#C9A27C" stroke={T} strokeWidth="2.5" />
        <path d={`M${x} ${y} V${y - 20}`} stroke={T} strokeWidth="4" />
        <circle cx={x} cy={y - 50} r="28" fill="#9FD3F2" stroke={T} strokeWidth="2.5" />
        <path d={`M${x - 18} ${y - 66} q10 -4 14 6 q-2 10 -12 8 z M${x + 4} ${y - 44} q14 -6 18 6 q-6 14 -16 6 z`} fill={c} stroke={T} strokeWidth="2" />
        <path d={`M${x - 30} ${y - 50} a30 30 0 0 0 60 0`} fill="none" stroke="#C9A27C" strokeWidth="3" />
      </>
    );
  },
  arbol: (c) => {
    const [x, y] = xy(0, 0, 0);
    return (
      <>
        <Caja a={0.4} b={0.4} h={18} color="#C9A27C" />
        <path d={`M${x - 5} ${y - 18} L${x - 6} ${y - 70} H${x + 6} L${x + 5} ${y - 18} Z`} fill="#A0673D" stroke={T} strokeWidth="2.5" />
        {[
          [0, -112, 28],
          [-26, -88, 22],
          [26, -90, 22],
          [-10, -76, 18],
          [14, -72, 18],
        ].map(([dx, dy, r], i) => (
          <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={i % 2 ? tono(c, 0.15) : c} stroke={T} strokeWidth="2.5" />
        ))}
      </>
    );
  },
  armario: (c) => {
    const [x1, y1] = xy(0.25, 0, 50);
    return (
      <>
        <Caja a={0.5} b={0.9} h={100} du={-0.2} color={c} />
        <path d={`M${x1 - 18} ${y1 + 2} l 0 10 M${x1 + 4} ${y1 - 10} l 0 10`} stroke={T} strokeWidth="4" strokeLinecap="round" />
      </>
    );
  },
  pizarra: () => {
    const [x, y] = xy(0, 0, 0);
    return (
      <>
        <path d={`M${x - 24} ${y + 4} L${x - 10} ${y - 96} M${x + 24} ${y + 4} L${x + 10} ${y - 96}`} stroke="#A0673D" strokeWidth="5" strokeLinecap="round" />
        <rect x={x - 38} y={y - 100} width="76" height="56" rx="6" fill="#3F6E5A" stroke={T} strokeWidth="3" />
        <text x={x} y={y - 64} textAnchor="middle" fontFamily="Andika, Nunito, sans-serif" fontWeight="700" fontSize="18" fill="#fff" letterSpacing="2">
          aeiou
        </text>
      </>
    );
  },
  alfombra: (c) => (
    <>
      <Caja a={0.96} b={0.96} h={3} color={c} trazo={2} />
      <Caja a={0.6} b={0.6} h={1} z={3} color={tono(c, 0.35)} trazo={1.2} />
    </>
  ),
  puff: (c) => {
    const [x, y] = xy(0, 0, 0);
    return (
      <>
        <path d={`M${x - 26} ${y - 4} V${y - 22} A26 13 0 0 1 ${x + 26} ${y - 22} V${y - 4} A26 13 0 0 1 ${x - 26} ${y - 4} Z`} fill={tono(c, -0.15)} stroke={T} strokeWidth="2.5" />
        <ellipse cx={x} cy={y - 22} rx="26" ry="13" fill={tono(c, 0.2)} stroke={T} strokeWidth="2.5" />
      </>
    );
  },
  estrella: (c) => {
    const [x, y] = xy(0, 0, 0);
    const cy = y - 84;
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? 11 : 24;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      return `${x + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    }).join(" ");
    return (
      <>
        <ellipse cx={x} cy={y} rx="16" ry="8" fill="#5f5878" stroke={T} strokeWidth="2.5" />
        <path d={`M${x} ${y} V${cy + 18}`} stroke={T} strokeWidth="4" />
        <circle cx={x} cy={cy} r="34" fill={c} opacity="0.25" className="sprite-brillo" />
        <polygon points={pts} fill={c} stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
      </>
    );
  },
  cristal: (c) => {
    // Racimo de cristales del cometa: prismas de distinto alto que brillan.
    const prismas: [number, number, number, number][] = [
      // [desplazamiento en c, desplazamiento en r, alto, ancho]
      [-0.12, 0.1, 58, 13],
      [0.16, -0.08, 86, 16],
      [0.08, 0.24, 40, 11],
      [-0.26, -0.18, 34, 10],
    ];
    const [bx, by] = xy(0, 0, 0);
    return (
      <>
        <ellipse cx={bx} cy={by} rx="30" ry="13" fill={tono(c, -0.35)} opacity="0.35" />
        <circle cx={bx} cy={by - 50} r="38" fill={c} opacity="0.22" className="sprite-brillo" />
        {[...prismas]
          .sort((a, b) => a[0] + a[1] - (b[0] + b[1]))
          .map(([u, v, h, w], i) => {
            const [x, y] = xy(u, v, 0);
            const punta = `${x},${y - h - w}`;
            return (
              <g key={i}>
                <polygon points={`${x - w},${y - 4} ${x},${y + 3} ${x},${y - h + 3} ${x - w},${y - h}`} fill={tono(c, 0.25)} stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
                <polygon points={`${x},${y + 3} ${x + w},${y - 4} ${x + w},${y - h} ${x},${y - h + 3}`} fill={tono(c, -0.1)} stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
                <polygon points={`${x - w},${y - h} ${x},${y - h + 3} ${x + w},${y - h} ${punta}`} fill={tono(c, 0.55)} stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
                <path d={`M${x - w + 4} ${y - 10} V${y - h + 6}`} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              </g>
            );
          })}
      </>
    );
  },
  camilla: (c) => {
    // Camilla de la clínica: marco metálico, colchoneta y almohada.
    const patas: [number, number][] = [
      [-0.38, -0.2],
      [0.38, -0.2],
      [-0.38, 0.2],
      [0.38, 0.2],
    ];
    return (
      <>
        {patas.map(([u, v], i) => (
          <Caja key={i} a={0.06} b={0.06} h={22} du={u} dv={v} color="#BDB9CC" trazo={2} />
        ))}
        <Caja a={0.92} b={0.54} h={6} z={22} color="#DDD5F3" />
        <Caja a={0.86} b={0.48} h={9} z={28} color={c} />
        <Caja a={0.2} b={0.38} h={7} z={37} du={-0.3} color="#FFFFFF" />
      </>
    );
  },
  botiquin: (c) => {
    // Botiquín alto con la cruz rosada al frente.
    const [x1, y1] = xy(0.23, -0.17, 62);
    const [x2, y2] = xy(0.23, 0.17, 62);
    const [x3, y3] = xy(0.23, 0, 48);
    const [x4, y4] = xy(0.23, 0, 76);
    return (
      <>
        <Caja a={0.46} b={0.8} h={96} color={c} />
        <path d={`M${x1} ${y1} L${x2} ${y2} M${x3} ${y3} L${x4} ${y4}`} stroke="#E58C86" strokeWidth="8" strokeLinecap="round" />
        {[30, 90].map((z) => {
          const [a1, b1] = xy(0.23, -0.36, z);
          const [a2, b2] = xy(0.23, 0.36, z);
          return <path key={z} d={`M${a1} ${b1} L${a2} ${b2}`} stroke={T} strokeOpacity="0.25" strokeWidth="2" />;
        })}
      </>
    );
  },
  banera: (c) => {
    // Bañera con agua y burbujas que suben.
    const [bx, by] = xy(0, 0, 30);
    return (
      <>
        {[
          [-0.36, -0.2],
          [0.36, 0.2],
          [0.36, -0.2],
          [-0.36, 0.2],
        ].map(([u, v], i) => (
          <Caja key={i} a={0.08} b={0.08} h={6} du={u} dv={v} color="#FFD166" trazo={2} />
        ))}
        <Caja a={0.94} b={0.6} h={26} z={6} color="#FFFFFF" />
        <Caja a={0.78} b={0.44} h={2} z={28} color={c} trazo={1.5} />
        {[
          [-22, -6, 9],
          [-4, -14, 12],
          [16, -8, 8],
          [6, -26, 6],
          [-14, -30, 5],
        ].map(([dx, dy, r], i) => (
          <circle key={i} cx={bx + dx} cy={by + dy} r={r} fill="#FFFFFF" fillOpacity="0.9" stroke="#9FD3F2" strokeWidth="2" className={i % 2 ? "sprite-brillo" : undefined} />
        ))}
      </>
    );
  },
  caja: (c) => (
    <>
      <Caja a={0.55} b={0.55} h={18} color={c} />
      <Caja a={0.5} b={0.5} h={16} z={18} color={tono(c, 0.15)} />
      <Caja a={0.42} b={0.42} h={14} z={34} color={c} />
    </>
  ),
};

/** Dibujo isométrico de un mueble u objeto de la casa. */
export default function Sprite({ tipo, color = "#B9A8E6", className = "" }: { tipo: TipoSprite; color?: string; className?: string }) {
  return (
    <svg viewBox={`0 0 ${ANCHO_SPRITE} ${ALTO_SPRITE}`} width={ANCHO_SPRITE} height={ALTO_SPRITE} className={`overflow-visible ${className}`} aria-hidden="true">
      {DIBUJOS[tipo](color)}
    </svg>
  );
}
