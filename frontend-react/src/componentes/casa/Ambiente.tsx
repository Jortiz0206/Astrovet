import type { ReactNode } from "react";
import { baldosas, type Forma, type IdCuarto } from "../../datos/casa";

// Ambientación de cada cuarto de «Mi casa». Cada cuarto cuenta su nombre con
// tres cosas: lo que hay en las paredes, lo que se ve por la ventana y de qué
// está hecho el piso. Los colores base salen de lo que el niño eligió en
// «Colores»; el tema pone encima la textura y los detalles.
//
// Se dibuja en coordenadas planas y una matriz isométrica las proyecta:
//  - pared: X de 0 a ANCHO_MURO desde la esquina, Y de 0 (arriba) a ALTO (piso);
//  - piso:  (c, r) en baldosas, dentro de la forma del cuarto.

const T = "#2B2440";

/** Aclara (k > 0) u oscurece (k < 0) un color hex. */
export function tono(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

interface Geometria {
  ox: number;
  oy: number;
  /** Largo de las paredes izquierda y derecha, en baldosas. */
  li: number;
  ld: number;
  forma: Forma;
  alto: number;
  /** Medio ancho de baldosa (36) y medio alto (18). */
  hx: number;
  hy: number;
}

interface PropsAmbiente {
  tema: IdCuarto;
  paredes: [string, string];
  piso: [string, string];
  g: Geometria;
}

/** Destello de cuatro puntas. */
function Destello({ x, y, r, color = "#fff", o = 1 }: { x: number; y: number; r: number; color?: string; o?: number }) {
  const k = r * 0.28;
  return <path d={`M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k} Z`} fill={color} opacity={o} />;
}

/** Nube de algodón (para las paredes y el piso de la Nebulosa). */
function Nube({ x, y, s, color, o = 1 }: { x: number; y: number; s: number; color: string; o?: number }) {
  return (
    <g opacity={o} fill={color}>
      <circle cx={x - 16 * s} cy={y} r={12 * s} />
      <circle cx={x} cy={y - 8 * s} r={16 * s} />
      <circle cx={x + 17 * s} cy={y - 2 * s} r={12 * s} />
      <rect x={x - 28 * s} y={y} width={56 * s} height={10 * s} rx={5 * s} />
    </g>
  );
}

/** Hoja simple: una lágrima con nervio. */
function Hoja({ x, y, l, a, color, nervio }: { x: number; y: number; l: number; a: number; color: string; nervio?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <path d={`M0 0 C${l * 0.35} ${-l * 0.32} ${l * 0.8} ${-l * 0.22} ${l} 0 C${l * 0.8} ${l * 0.22} ${l * 0.35} ${l * 0.32} 0 0 Z`} fill={color} />
      {nervio ? <path d={`M${l * 0.08} 0 H${l * 0.86}`} stroke={nervio} strokeWidth="1.6" strokeLinecap="round" /> : null}
    </g>
  );
}

// ======================= Ventanas =======================

/** Lo que se ve por la ventana de cada cuarto: su propio rincón del espacio. */
function Paisaje({ tema, w, h }: { tema: IdCuarto; w: number; h: number }) {
  switch (tema) {
    case "sala":
      // Desde la casa se ven los mundos que esperan.
      return (
        <>
          <rect width={w} height={h} fill="#231d45" />
          <circle cx={w * 0.3} cy={h * 0.42} r={h * 0.16} fill="#9C7FD1" />
          <ellipse cx={w * 0.3} cy={h * 0.44} rx={h * 0.27} ry={h * 0.07} fill="none" stroke="#FFB7B2" strokeWidth="3" transform={`rotate(-14 ${w * 0.3} ${h * 0.44})`} />
          <circle cx={w * 0.72} cy={h * 0.3} r={h * 0.1} fill="#D5DDF3" />
          <circle cx={w * 0.66} cy={h * 0.72} r={h * 0.12} fill="#4FB08A" />
          <circle cx={w * 0.84} cy={h * 0.62} r={h * 0.05} fill="#BFE3F7" />
          {[
            [0.12, 0.16],
            [0.5, 0.12],
            [0.9, 0.2],
            [0.18, 0.8],
            [0.46, 0.66],
          ].map(([x, y], i) => (
            <Destello key={i} x={w * x} y={h * y} r={3 + (i % 2) * 2} color="#FFD166" o={0.9} />
          ))}
        </>
      );
    case "nebulosa":
      return (
        <>
          <rect width={w} height={h} fill="#5B3C9A" />
          <ellipse cx={w * 0.25} cy={h * 0.3} rx={w * 0.55} ry={h * 0.3} fill="#B0569C" opacity="0.55" />
          <ellipse cx={w * 0.85} cy={h * 0.55} rx={w * 0.5} ry={h * 0.32} fill="#FFB7B2" opacity="0.45" />
          <circle cx={w * 0.62} cy={h * 0.36} r={h * 0.15} fill="#9C7FD1" stroke="#E4D6FA" strokeWidth="2" />
          <ellipse cx={w * 0.62} cy={h * 0.38} rx={h * 0.26} ry={h * 0.06} fill="none" stroke="#FFB7B2" strokeWidth="3" transform={`rotate(-16 ${w * 0.62} ${h * 0.38})`} />
          <Nube x={w * 0.3} y={h * 0.86} s={1.1} color="#F4ECFF" />
          <Nube x={w * 0.82} y={h * 0.94} s={0.9} color="#E4D6FA" />
          <Destello x={w * 0.2} y={h * 0.18} r={4} />
          <Destello x={w * 0.9} y={h * 0.16} r={3} color="#FFD166" />
        </>
      );
    case "luna":
      // Desde la base lunar se ve la Tierra salir sobre el horizonte gris.
      return (
        <>
          <rect width={w} height={h} fill="#0E1433" />
          {[
            [0.1, 0.2],
            [0.3, 0.1],
            [0.85, 0.15],
            [0.7, 0.35],
            [0.15, 0.5],
            [0.92, 0.48],
          ].map(([x, y], i) => (
            <circle key={i} cx={w * x} cy={h * y} r={1.4 + (i % 3) * 0.6} fill="#fff" opacity="0.85" />
          ))}
          <circle cx={w * 0.58} cy={h * 0.44} r={h * 0.2} fill="#4D8FD6" />
          <path d={`M${w * 0.5} ${h * 0.34} C${w * 0.56} ${h * 0.3} ${w * 0.6} ${h * 0.38} ${w * 0.64} ${h * 0.34} C${w * 0.68} ${h * 0.46} ${w * 0.56} ${h * 0.52} ${w * 0.5} ${h * 0.46} Z`} fill="#6FBF8E" />
          <path d={`M0 ${h * 0.78} C${w * 0.3} ${h * 0.68} ${w * 0.6} ${h * 0.74} ${w} ${h * 0.66} V${h} H0 Z`} fill="#AEB6D3" />
          <ellipse cx={w * 0.3} cy={h * 0.86} rx={w * 0.1} ry={h * 0.04} fill="#8E97BC" />
          <ellipse cx={w * 0.75} cy={h * 0.82} rx={w * 0.07} ry={h * 0.03} fill="#8E97BC" />
        </>
      );
    case "selva":
      return (
        <>
          <rect width={w} height={h} fill="#0D2C33" />
          <circle cx={w * 0.7} cy={h * 0.25} r={h * 0.12} fill="#FFF3D1" opacity="0.85" />
          <path d={`M0 ${h * 0.7} C${w * 0.2} ${h * 0.4} ${w * 0.4} ${h * 0.6} ${w * 0.5} ${h * 0.5} C${w * 0.65} ${h * 0.38} ${w * 0.8} ${h * 0.56} ${w} ${h * 0.45} V${h} H0 Z`} fill="#165448" />
          <path d={`M0 ${h * 0.86} C${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.86} ${w} ${h * 0.74} V${h} H0 Z`} fill="#1D7A66" />
          <Hoja x={-4} y={h * 0.22} l={w * 0.42} a={20} color="#4FB08A" nervio="#9BE7A8" />
          <Hoja x={w + 4} y={h * 0.32} l={w * 0.38} a={160} color="#6FBF8E" nervio="#9BE7A8" />
          {[
            [0.3, 0.55],
            [0.55, 0.7],
            [0.82, 0.62],
          ].map(([x, y], i) => (
            <circle key={i} cx={w * x} cy={h * y} r="3" fill="#FFD166" className="ambiente-luciernaga" style={{ animationDelay: `${i * 0.8}s` }} />
          ))}
        </>
      );
    case "clinica":
      // Jardín de la clínica de noche, con una constelación en forma de huella.
      return (
        <>
          <rect width={w} height={h} fill="#16324A" />
          {[
            [0.5, 0.36, 3.2],
            [0.36, 0.2, 2],
            [0.46, 0.14, 2],
            [0.58, 0.14, 2],
            [0.66, 0.22, 2],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={w * x} cy={h * y} r={r * 2.4} fill="#FFD166" opacity="0.18" />
              <circle cx={w * x} cy={h * y} r={r} fill="#FFF3D1" />
            </g>
          ))}
          <path d={`M0 ${h * 0.74} C${w * 0.3} ${h * 0.62} ${w * 0.7} ${h * 0.8} ${w} ${h * 0.66} V${h} H0 Z`} fill="#3F9E73" />
          <path d={`M0 ${h * 0.86} C${w * 0.4} ${h * 0.78} ${w * 0.7} ${h * 0.9} ${w} ${h * 0.82} V${h} H0 Z`} fill="#4FB08A" />
          {[0.2, 0.5, 0.8].map((x, i) => (
            <g key={i}>
              <path d={`M${w * x} ${h * 0.86} V${h * 0.74}`} stroke="#2F7F5D" strokeWidth="2" />
              <circle cx={w * x} cy={h * 0.72} r="4" fill={["#FFB7B2", "#FFD166", "#B9A8E6"][i]} />
            </g>
          ))}
        </>
      );
    case "cometa":
      // El cometa de cristal pasa con su cola de hielo.
      return (
        <>
          <rect width={w} height={h} fill="#0C2340" />
          <path d={`M${w * 0.62} ${h * 0.42} C${w * 0.4} ${h * 0.5} ${w * 0.18} ${h * 0.72} ${-w * 0.05} ${h * 0.95}`} stroke="#9FD3F2" strokeWidth={h * 0.16} strokeLinecap="round" opacity="0.45" fill="none" />
          <path d={`M${w * 0.62} ${h * 0.42} C${w * 0.45} ${h * 0.46} ${w * 0.25} ${h * 0.6} ${w * 0.05} ${h * 0.72}`} stroke="#DDF1FB" strokeWidth={h * 0.07} strokeLinecap="round" opacity="0.8" fill="none" />
          <path d={`M${w * 0.6} ${h * 0.3} L${w * 0.72} ${h * 0.34} L${w * 0.75} ${h * 0.48} L${w * 0.64} ${h * 0.56} L${w * 0.54} ${h * 0.5} L${w * 0.52} ${h * 0.38} Z`} fill="#BFE3F7" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          <Destello x={w * 0.85} y={h * 0.2} r={5} />
          <Destello x={w * 0.2} y={h * 0.25} r={3} color="#FFD166" />
          <Destello x={w * 0.9} y={h * 0.75} r={3} color="#B9A8E6" />
        </>
      );
  }
}

type FormaVentana = "redonda" | "arco" | "hexagonal";

/** Ventana con marco, en coordenadas de pared. */
function Ventana({ id, tema, x, y, w, h, forma, marco }: { id: string; tema: IdCuarto; x: number; y: number; w: number; h: number; forma: FormaVentana; marco: string }) {
  const contorno =
    forma === "redonda"
      ? `M${x} ${y + h / 2} A${w / 2} ${h / 2} 0 1 1 ${x + w} ${y + h / 2} A${w / 2} ${h / 2} 0 1 1 ${x} ${y + h / 2} Z`
      : forma === "arco"
        ? `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`
        : `M${x + w * 0.25} ${y} H${x + w * 0.75} L${x + w} ${y + h / 2} L${x + w * 0.75} ${y + h} H${x + w * 0.25} L${x} ${y + h / 2} Z`;
  return (
    <g>
      <clipPath id={id}>
        <path d={contorno} />
      </clipPath>
      {/* Sombra interior del hueco */}
      <path d={contorno} fill={T} transform="translate(0 3)" opacity="0.18" />
      <g clipPath={`url(#${id})`}>
        <g transform={`translate(${x} ${y})`}>
          <Paisaje tema={tema} w={w} h={h} />
        </g>
        {/* Reflejo del vidrio */}
        <path d={`M${x + w * 0.12} ${y + h * 0.7} L${x + w * 0.42} ${y + h * 0.05}`} stroke="#fff" strokeWidth={w * 0.06} strokeLinecap="round" opacity="0.18" />
      </g>
      <path d={contorno} fill="none" stroke={marco} strokeWidth="7" strokeLinejoin="round" />
      <path d={contorno} fill="none" stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
      {forma === "arco" ? <path d={`M${x + w / 2} ${y + 2} V${y + h} M${x} ${y + h * 0.62} H${x + w}`} stroke={marco} strokeWidth="4" /> : null}
      {forma === "redonda"
        ? [0, 90, 180, 270].map((a) => (
            <circle key={a} cx={x + w / 2 + Math.cos((a * Math.PI) / 180) * (w / 2)} cy={y + h / 2 + Math.sin((a * Math.PI) / 180) * (h / 2)} r="2.6" fill="#fff" stroke={T} strokeWidth="1.5" />
          ))
        : null}
      {/* Repisa */}
      <rect x={x - 6} y={y + h - 1} width={w + 12} height="7" rx="3" fill={marco} stroke={T} strokeWidth="2" />
    </g>
  );
}

// ======================= Paredes =======================

/** Lo que va sobre una pared, en coordenadas planas (W × H). */
function DecoPared({ tema, lado, paredes, W, H }: { tema: IdCuarto; lado: "izq" | "der"; paredes: [string, string]; W: number; H: number }) {
  const oscuro = tono(paredes[1], -0.12);
  const idv = `ventana-${tema}-${lado}`;
  switch (tema) {
    case "sala": {
      // Hogar: papel con huellitas, zócalo de madera y una ventana a los mundos.
      return (
        <>
          <pattern id="papel-sala" width="36" height="30" patternUnits="userSpaceOnUse">
            <g fill={T} opacity="0.07">
              <circle cx="9" cy="10" r="3" />
              <circle cx="5" cy="5" r="1.4" />
              <circle cx="9" cy="3.5" r="1.4" />
              <circle cx="13" cy="5" r="1.4" />
              <circle cx="27" cy="25" r="3" />
              <circle cx="23" cy="20" r="1.4" />
              <circle cx="27" cy="18.5" r="1.4" />
              <circle cx="31" cy="20" r="1.4" />
            </g>
          </pattern>
          <rect width={W} height={H} fill="url(#papel-sala)" />
          <rect y={H - 46} width={W} height="46" fill={oscuro} opacity="0.55" />
          {Array.from({ length: Math.floor(W / 32) }, (_, i) => (
            <rect key={i} x={8 + i * 32} y={H - 38} width="22" height="28" rx="3" fill="none" stroke={T} strokeOpacity="0.12" strokeWidth="2" />
          ))}
          <rect y={H - 50} width={W} height="6" fill="#fff" opacity="0.55" />
          {lado === "izq" ? (
            <Ventana id={idv} tema="sala" x={150} y={16} w={62} h={62} forma="redonda" marco="#C9A27C" />
          ) : (
            // Un cuadro entre las puertas: el cohete de Misi.
            <g>
              <rect x="80" y="20" width="50" height="40" rx="4" fill="#FFF3D1" stroke="#E0A82E" strokeWidth="6" />
              <rect x="80" y="20" width="50" height="40" rx="4" fill="none" stroke={T} strokeWidth="2" />
              <path d="M105 28 C112 34 113 44 110 50 H100 C97 44 98 34 105 28 Z" fill="#FFB7B2" stroke={T} strokeWidth="1.8" />
              <circle cx="105" cy="39" r="2.6" fill="#9FD3F2" stroke={T} strokeWidth="1.2" />
              <path d="M101 50 L98 55 M109 50 L112 55" stroke={T} strokeWidth="1.8" strokeLinecap="round" />
              <Destello x={89} y={30} r={3} color="#FFD166" />
            </g>
          )}
        </>
      );
    }
    case "nebulosa": {
      // Planeta de nubes: bruma de colores arriba, banco de nubes abajo, destellos.
      return (
        <>
          <ellipse cx={W * 0.3} cy={H * 0.18} rx={W * 0.45} ry={H * 0.22} fill="#FFB7B2" opacity="0.28" />
          <ellipse cx={W * 0.8} cy={H * 0.3} rx={W * 0.35} ry={H * 0.2} fill="#B0569C" opacity="0.18" />
          {[
            [0.08, 0.14, 4],
            [0.22, 0.42, 3],
            [0.62, 0.1, 5],
            [0.92, 0.36, 3.5],
            [0.48, 0.5, 2.5],
          ].map(([x, y, r], i) => (
            <Destello key={i} x={W * x} y={H * y} r={r} color={i % 2 ? "#FFD166" : "#fff"} o={0.9} />
          ))}
          {/* Banco de nubes: dos filas que se pisan */}
          {Array.from({ length: 8 }, (_, i) => (
            <Nube key={`a${i}`} x={i * 40 + 14} y={H - 20} s={1.05} color="#FFFFFF" o={0.7} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <Nube key={`b${i}`} x={i * 40 + 32} y={H - 6} s={0.95} color={tono(paredes[0], 0.5)} o={0.95} />
          ))}
          {lado === "izq" ? <Ventana id={idv} tema="nebulosa" x={142} y={14} w={60} h={72} forma="arco" marco="#E4D6FA" /> : null}
        </>
      );
    }
    case "luna": {
      // Base lunar: paneles de metal con remaches, franja de luces y una escotilla con la Tierra.
      const filas = [H * 0.36, H * 0.68];
      return (
        <>
          <rect width={W} height={H} fill="#1B2350" opacity="0.18" />
          {filas.map((y, i) => (
            <rect key={i} y={y} width={W} height="3" fill={T} opacity="0.14" />
          ))}
          {Array.from({ length: Math.ceil(W / 48) }, (_, i) => (
            <g key={i}>
              <rect x={i * 48} width="3" height={H} fill={T} opacity="0.1" />
              {filas.map((y, k) => (
                <g key={k} fill="#fff" opacity="0.6">
                  <circle cx={i * 48 + 9} cy={y - 6} r="1.8" />
                  <circle cx={i * 48 + 39} cy={y - 6} r="1.8" />
                </g>
              ))}
            </g>
          ))}
          {/* Franja de luces de la base */}
          <rect y={H - 22} width={W} height="10" fill="#26357A" opacity="0.55" />
          {Array.from({ length: Math.floor(W / 24) }, (_, i) => (
            <circle key={i} cx={12 + i * 24} cy={H - 17} r="2.6" fill={i % 3 === 0 ? "#FFD166" : "#9FD3F2"} className="ambiente-luz" style={{ animationDelay: `${(i % 5) * 0.4}s` }} />
          ))}
          {lado === "izq" ? (
            <Ventana id={idv} tema="luna" x={140} y={12} w={66} h={66} forma="redonda" marco="#AEB6D3" />
          ) : (
            // Media luna de neón sobre la pared.
            <g transform={`translate(${W - 64} 38)`}>
              <circle r="22" fill="#FFF3D1" opacity="0.25" />
              <path d="M8 -18 A20 20 0 1 0 8 18 A15 15 0 1 1 8 -18 Z" fill="#FFF3D1" stroke="#FFD166" strokeWidth="2.5" />
            </g>
          )}
        </>
      );
    }
    case "selva": {
      // Selva brillante: lianas que cuelgan, hojas grandes desde el piso, esporas que flotan.
      const lianas = lado === "izq" ? [30, 96, 210, 262] : [24, 196, 258];
      return (
        <>
          {lianas.map((x, i) => {
            const largo = 40 + ((i * 37) % 50);
            return (
              <g key={i}>
                <path d={`M${x} -2 C${x + 8} ${largo * 0.3} ${x - 8} ${largo * 0.6} ${x + 2} ${largo}`} stroke="#3F9E73" strokeWidth="3" fill="none" strokeLinecap="round" />
                {[0.25, 0.5, 0.78].map((t, k) => (
                  <Hoja key={k} x={x + (k % 2 ? 3 : -2)} y={largo * t} l={13} a={k % 2 ? 30 : 150} color={k % 2 ? "#6FBF8E" : "#4FB08A"} />
                ))}
              </g>
            );
          })}
          {/* Hojas grandes de la planta que crece contra la pared */}
          {(lado === "izq" ? [8, 64, 230] : [70, 236]).map((x, i) => (
            <g key={i} opacity="0.75">
              <Hoja x={x} y={H} l={60} a={-72} color="#3F9E73" nervio="#6FBF8E" />
              <Hoja x={x + 6} y={H} l={48} a={-110} color="#4FB08A" nervio="#9BE7A8" />
              <Hoja x={x + 2} y={H} l={40} a={-40} color="#2F7F5D" />
            </g>
          ))}
          {[
            [0.2, 0.3],
            [0.45, 0.55],
            [0.7, 0.22],
            [0.88, 0.5],
          ].map(([x, y], i) => (
            <circle key={i} cx={W * x} cy={H * y} r="3.2" fill="#FFF3D1" className="ambiente-luciernaga" style={{ animationDelay: `${i * 0.7}s` }} />
          ))}
          {lado === "izq" ? <Ventana id={idv} tema="selva" x={140} y={14} w={64} h={74} forma="arco" marco="#B08463" /> : null}
        </>
      );
    }
    case "clinica": {
      // Clínica: azulejos abajo, una línea de latido que recorre el cuarto y la cruz de la clínica.
      const latido = `M0 70 H${W * 0.3} l8 -14 l8 26 l8 -34 l8 22 l6 0 H${W * 0.72} l6 -10 l6 18 l6 -8 H${W}`;
      return (
        <>
          <rect y={H - 58} width={W} height="58" fill="#fff" opacity="0.7" />
          {Array.from({ length: Math.ceil(W / 18) }, (_, i) => (
            <path key={`v${i}`} d={`M${i * 18} ${H - 58} V${H}`} stroke={oscuro} strokeWidth="1.5" opacity="0.6" />
          ))}
          {[0, 1, 2].map((k) => (
            <path key={`h${k}`} d={`M0 ${H - 58 + k * 19} H${W}`} stroke={oscuro} strokeWidth="1.5" opacity="0.6" />
          ))}
          <rect y={H - 61} width={W} height="5" fill="#8FD9B6" />
          <path d={latido} fill="none" stroke="#FFB7B2" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" className="ambiente-latido" />
          {lado === "izq" ? (
            <>
              <Ventana id={idv} tema="clinica" x={140} y={10} w={66} h={52} forma="arco" marco="#FFFFFF" />
              {/* Cartel: una huella dentro de un corazón */}
              <g transform="translate(232 18)">
                <rect width="40" height="44" rx="6" fill="#FFF3D1" stroke={T} strokeWidth="2" />
                <path d="M20 36 C10 28 6 22 9 16 C12 11 18 12 20 17 C22 12 28 11 31 16 C34 22 30 28 20 36 Z" fill="#FFB7B2" stroke={T} strokeWidth="1.6" />
                <circle cx="20" cy="25" r="3" fill={T} opacity="0.7" />
              </g>
            </>
          ) : (
            <g transform={`translate(${W - 74} 14)`}>
              <circle cx="22" cy="22" r="24" fill="#fff" stroke={T} strokeWidth="2.5" />
              <path d="M22 9 V35 M9 22 H35" stroke="#E58C86" strokeWidth="9" strokeLinecap="round" />
            </g>
          )}
        </>
      );
    }
    case "cometa": {
      // Hielo de cometa: facetas de cristal, carámbanos que cuelgan y cristales en la base.
      return (
        <>
          {[
            `0,0 ${W * 0.3},0 ${W * 0.12},${H * 0.55}`,
            `${W * 0.3},0 ${W * 0.62},0 ${W * 0.42},${H * 0.7} ${W * 0.12},${H * 0.55}`,
            `${W * 0.62},0 ${W},0 ${W},${H * 0.4} ${W * 0.42},${H * 0.7}`,
            `${W * 0.12},${H * 0.55} ${W * 0.42},${H * 0.7} ${W * 0.3},${H} 0,${H} 0,${H * 0.7}`,
            `${W * 0.42},${H * 0.7} ${W},${H * 0.4} ${W},${H} ${W * 0.3},${H}`,
          ].map((pts, i) => (
            <polygon key={i} points={pts} fill="#fff" opacity={[0.22, 0.08, 0.16, 0.05, 0.12][i]} />
          ))}
          {/* Carámbanos */}
          {Array.from({ length: Math.floor(W / 20) }, (_, i) => {
            const l = 8 + ((i * 7) % 14);
            return <path key={i} d={`M${i * 20 + 4} 0 L${i * 20 + 10} ${l} L${i * 20 + 16} 0 Z`} fill="#EEF8FD" stroke="#9FD3F2" strokeWidth="1.5" strokeLinejoin="round" />;
          })}
          {/* Cristales que nacen del piso */}
          {(lado === "izq" ? [18, 250] : [40, 240]).map((x, i) => (
            <g key={i}>
              {[
                [-10, 34, 8],
                [0, 52, 10],
                [12, 26, 7],
              ].map(([dx, h, w], k) => (
                <path key={k} d={`M${x + dx - w} ${H} V${H - h + w} L${x + dx} ${H - h} L${x + dx + w} ${H - h + w} V${H} Z`} fill={k === 1 ? "#BFE3F7" : "#DDF1FB"} stroke="#5E8FB5" strokeWidth="1.8" strokeLinejoin="round" />
              ))}
            </g>
          ))}
          {[
            [0.2, 0.38],
            [0.55, 0.22],
            [0.8, 0.58],
          ].map(([x, y], i) => (
            <Destello key={i} x={W * x} y={H * y} r={4 + (i % 2) * 2} color="#fff" o={0.95} />
          ))}
          {lado === "izq" ? <Ventana id={idv} tema="cometa" x={138} y={18} w={70} h={58} forma="hexagonal" marco="#DDF1FB" /> : null}
        </>
      );
    }
  }
}

/** Decoración de las dos paredes, proyectada sobre cada plano. */
export function ParedesAmbiente({ tema, paredes, g }: PropsAmbiente) {
  const H = g.alto;
  // (X, Y) de la pared → pantalla. La izquierda avanza hacia la izquierda.
  const izq = `matrix(-1 0.5 0 1 ${g.ox} ${g.oy - H})`;
  const der = `matrix(1 0.5 0 1 ${g.ox} ${g.oy - H})`;
  return (
    <g className="ambiente" pointerEvents="none">
      {(
        [
          ["izq", izq, g.li * g.hx],
          ["der", der, g.ld * g.hx],
        ] as const
      ).map(([lado, m, W]) => (
        <g key={lado} transform={m}>
          <clipPath id={`muro-plano-${lado}`}>
            <rect width={W} height={H} />
          </clipPath>
          <g clipPath={`url(#muro-plano-${lado})`}>
            <DecoPared tema={tema} lado={lado} paredes={paredes} W={W} H={H} />
            {/* La pared derecha recibe menos luz */}
            {lado === "der" ? <rect width={W} height={H} fill={T} opacity="0.04" /> : null}
          </g>
        </g>
      ))}
    </g>
  );
}

// ======================= Piso =======================

/** Una forma en coordenadas de baldosa (c, r), sin que el trazo se deforme. */
function DecoPiso({ tema, piso, forma }: { tema: IdCuarto; piso: [string, string]; forma: Forma }) {
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  // Los detalles se reparten por todo el rectángulo; el recorte de la forma quita lo que cae fuera.
  const lado = Math.max(forma.ancho, forma.fondo);
  const sx = forma.ancho / 8;
  const sy = forma.fondo / 8;
  const escala = `scale(${sx} ${sy})`;
  const tablero: ReactNode = baldosas(forma).map(([c, r]) => <rect key={`${c}-${r}`} x={c} y={r} width="1" height="1" fill={(c + r) % 2 ? piso[1] : piso[0]} />);
  switch (tema) {
    case "sala":
      // Tablas de madera a lo largo de c, con uniones alternadas.
      return (
        <>
          <rect width={lado} height={lado} fill={piso[0]} />
          {Array.from({ length: lado * 2 }, (_, k) => (
            <g key={k}>
              <rect y={k * 0.5} width={lado} height="0.5" fill={k % 2 ? piso[1] : piso[0]} />
              <path d={`M0 ${k * 0.5} H${lado}`} stroke={tono(piso[1], -0.18)} strokeWidth="1.2" {...ns} />
              {Array.from({ length: 3 }, (_, j) => {
                const x = ((k * 1.7 + j * 2.9) % lado) + 0.3;
                return <path key={j} d={`M${x} ${k * 0.5} V${k * 0.5 + 0.5}`} stroke={tono(piso[1], -0.18)} strokeWidth="1.2" {...ns} />;
              })}
            </g>
          ))}
          {/* Alfombra redonda en el centro de la sala */}
          <circle cx={forma.ancho * 0.5} cy={forma.fondo * 0.55} r="1.7" fill="#FFB7B2" opacity="0.55" />
          <circle cx={forma.ancho * 0.5} cy={forma.fondo * 0.55} r="1.25" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" {...ns} />
        </>
      );
    case "nebulosa":
      return (
        <>
          {tablero}
          <g transform={escala}>
          {[
            [1.5, 2.5, 0.7],
            [4.2, 1.2, 0.55],
            [6.2, 4.6, 0.8],
            [2.8, 6.2, 0.6],
            [5, 6.8, 0.45],
          ].map(([c, r, k], i) => (
            <g key={i} opacity="0.55" fill="#fff">
              <circle cx={c} cy={r} r={k} />
              <circle cx={c + k * 0.9} cy={r + k * 0.2} r={k * 0.7} />
              <circle cx={c - k * 0.8} cy={r + k * 0.3} r={k * 0.6} />
            </g>
          ))}
          </g>
        </>
      );
    case "luna": {
      // Regolito: cráteres de distinto tamaño, con borde claro y fondo en sombra.
      const crateres: [number, number, number][] = [
        [2.2, 3.4, 0.75],
        [5.6, 2.2, 0.5],
        [4.6, 5.6, 0.95],
        [1.4, 6.4, 0.4],
        [6.8, 6.6, 0.35],
        [3.4, 1.2, 0.3],
      ];
      return (
        <>
          <rect width={lado} height={lado} fill={piso[0]} />
          {tablero}
          <g transform={escala}>
          {crateres.map(([c, r, k], i) => (
            <g key={i}>
              <circle cx={c} cy={r} r={k * 1.18} fill={tono(piso[0], 0.45)} />
              <circle cx={c} cy={r} r={k} fill={tono(piso[1], -0.12)} />
              <circle cx={c - k * 0.18} cy={r - k * 0.18} r={k * 0.78} fill={tono(piso[1], -0.24)} />
            </g>
          ))}
          {[
            [0.8, 1.6],
            [3.8, 3.4],
            [6.4, 3.8],
            [2.6, 4.8],
          ].map(([c, r], i) => (
            <circle key={i} cx={c} cy={r} r="0.09" fill={tono(piso[1], -0.35)} />
          ))}
          </g>
        </>
      );
    }
    case "selva":
      return (
        <>
          {tablero}
          <g transform={escala}>
          {/* Musgo */}
          {[
            [1.2, 1.4, 1.1],
            [6.4, 2.8, 0.9],
            [3.2, 5.4, 1.3],
            [6.8, 6.6, 0.8],
          ].map(([c, r, k], i) => (
            <g key={i} fill="#6FBF8E" opacity="0.4">
              <circle cx={c} cy={r} r={k} />
              <circle cx={c + k * 0.7} cy={r + k * 0.4} r={k * 0.7} />
            </g>
          ))}
          {/* Hojas caídas */}
          {[
            [2.6, 2.4, 30],
            [5.2, 4.2, 120],
            [1.6, 4.6, 200],
            [4.4, 7.2, 300],
            [7.2, 1.2, 80],
          ].map(([c, r, a], i) => (
            <g key={i} transform={`translate(${c} ${r}) rotate(${a})`}>
              <path d="M0 0 C0.12 -0.14 0.34 -0.12 0.46 0 C0.34 0.12 0.12 0.14 0 0 Z" fill={i % 2 ? "#4FB08A" : "#E0A82E"} opacity="0.85" />
            </g>
          ))}
          </g>
        </>
      );
    case "clinica":
      // Piso limpio de clínica con un camino de huellitas desde la puerta.
      return (
        <>
          {tablero}
          {[
            [3.3, 0.7, 0],
            [3.7, 1.5, 1],
            [3.2, 2.3, 0],
            [3.7, 3.1, 1],
            [3.3, 3.9, 0],
            [3.8, 4.7, 1],
          ].map(([c, r, k], i) => (
            <g key={i} transform={`translate(${c} ${r}) rotate(${k ? 8 : -8})`} fill="#FFB7B2" opacity="0.75">
              <ellipse cx="0" cy="0.06" rx="0.13" ry="0.11" />
              <circle cx="-0.12" cy="-0.1" r="0.045" />
              <circle cx="-0.04" cy="-0.15" r="0.045" />
              <circle cx="0.05" cy="-0.15" r="0.045" />
              <circle cx="0.13" cy="-0.1" r="0.045" />
            </g>
          ))}
        </>
      );
    case "cometa":
      // Hielo: baldosas claras con brillos diagonales y alguna grieta fina.
      return (
        <>
          {tablero}
          {Array.from({ length: lado }, (_, k) => (
            <path key={k} d={`M${k} ${0.15} L${k + 0.6} ${lado}`} stroke="#fff" strokeWidth="5" opacity="0.35" {...ns} />
          ))}
          <path transform={escala} d="M1.2 2 L1.8 2.6 L1.6 3.4 L2.3 3.9 M5.4 5 L6 5.3 L6.1 6.2 M3.6 6.4 L4.3 6.8" stroke="#9FD3F2" strokeWidth="1.5" fill="none" {...ns} />
        </>
      );
  }
}

/** Piso del cuarto, proyectado en isométrico. */
export function PisoAmbiente({ tema, piso, g }: PropsAmbiente) {
  const m = `matrix(${g.hx} ${g.hy} ${-g.hx} ${g.hy} ${g.ox} ${g.oy})`;
  return (
    <g className="ambiente" pointerEvents="none" transform={m}>
      <DecoPiso tema={tema} piso={piso} forma={g.forma} />
    </g>
  );
}
