import { useEffect, useMemo, useRef, useState } from "react";
import Icono from "../../componentes/Icono";
import { decirContenido, efecto } from "../../servicios/audio";
import { Destello, type PropsActividad } from "./comunes";

type Punto = [number, number];

function arco(cx: number, cy: number, rx: number, ry: number, desde: number, hasta: number, pasos = 14): Punto[] {
  return Array.from({ length: pasos + 1 }, (_, i) => {
    const t = ((desde + ((hasta - desde) * i) / pasos) * Math.PI) / 180;
    return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];
  });
}

/** Trazos de cada letra (mayúscula de imprenta) en una caja de 200 × 260, en el orden en que se escriben. */
const TRAZOS: Record<string, Punto[][]> = {
  A: [
    [[100, 22], [32, 238]],
    [[100, 22], [168, 238]],
    [[62, 150], [138, 150]],
  ],
  E: [
    [[52, 22], [52, 238]],
    [[52, 22], [160, 22]],
    [[52, 130], [142, 130]],
    [[52, 238], [160, 238]],
  ],
  I: [[[100, 22], [100, 238]]],
  O: [arco(100, 130, 74, 106, -90, -450, 28)],
  U: [[[45, 22], [45, 160], ...arco(100, 160, 55, 74, 180, 0, 12).slice(1), [155, 22]]],
  M: [[[32, 238], [32, 22], [100, 150], [168, 22], [168, 238]]],
  P: [
    [[52, 238], [52, 22]],
    [[52, 22], [108, 22], ...arco(108, 78, 56, 56, -90, 90, 10).slice(1), [52, 134]],
  ],
  S: [[[156, 52], [132, 26], [96, 20], [62, 32], [46, 62], [56, 96], [92, 118], [132, 136], [156, 168], [154, 208], [128, 236], [90, 242], [56, 230], [42, 208]]],
  L: [[[52, 22], [52, 238], [160, 238]]],
};

/** Reparte puntos de control cada ~18 unidades a lo largo del trazo. */
function puntosDeControl(trazo: Punto[]): Punto[] {
  const salida: Punto[] = [trazo[0]];
  for (let i = 1; i < trazo.length; i++) {
    const [x0, y0] = trazo[i - 1];
    const [x1, y1] = trazo[i];
    const largo = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(largo / 18));
    for (let k = 1; k <= n; k++) salida.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return salida;
}

const ruta = (pts: Punto[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/** Traza la estela (ACT-23): el niño sigue con el dedo la estela de un cometa que dibuja la letra. */
export default function Traza({ ronda, nivelAyuda, bloqueado, paso, onRespuesta, onAyuda }: PropsActividad) {
  const letra = ronda.objetivo;
  const trazos = TRAZOS[letra] ?? TRAZOS.A;
  const controles = useMemo(() => trazos.map(puntosDeControl), [trazos]);
  const [trazo, setTrazo] = useState(0);
  const [avance, setAvance] = useState(0); // índice del siguiente punto de control
  const [listo, setListo] = useState(false);
  const [demo, setDemo] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const estela = useRef<SVGPathElement>(null);
  const cabeza = useRef<SVGCircleElement>(null);
  const dibujando = useRef(false);
  const estado = useRef({ trazo: 0, avance: 0 });

  // Si el niño no avanza en un rato, Misi le muestra el camino (sin contarlo como error).
  useEffect(() => {
    if (listo) return;
    const t = window.setTimeout(() => setDemo(true), nivelAyuda >= 1 ? 600 : 6000);
    return () => window.clearTimeout(t);
  }, [trazo, avance, listo, nivelAyuda]);

  function punto(e: React.PointerEvent): Punto | null {
    const s = svg.current;
    const m = s?.getScreenCTM();
    if (!s || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  }

  function pintar(cursor: Punto | null) {
    const { trazo: t, avance: a } = estado.current;
    const hechos = controles[t]?.slice(0, a) ?? [];
    const pts = cursor && hechos.length ? [...hechos, cursor] : hechos;
    estela.current?.setAttribute("d", pts.length > 1 ? ruta(pts) : "");
    if (cabeza.current) {
      const c = cursor ?? hechos.at(-1);
      cabeza.current.setAttribute("opacity", c && dibujando.current ? "1" : "0");
      if (c) {
        cabeza.current.setAttribute("cx", String(c[0]));
        cabeza.current.setAttribute("cy", String(c[1]));
      }
    }
  }

  function terminarTrazo() {
    const t = estado.current.trazo + 1;
    efecto("unir", paso + t);
    if (t >= controles.length) {
      setListo(true);
      dibujando.current = false;
      pintar(null);
      decirContenido(letra);
      onRespuesta(letra, true, true);
      return;
    }
    estado.current = { trazo: t, avance: 0 };
    setTrazo(t);
    setAvance(0);
    dibujando.current = false;
    pintar(null);
  }

  function mover(p: Punto) {
    const { trazo: t } = estado.current;
    const cps = controles[t];
    let a = estado.current.avance;
    // Avanza por todos los puntos cercanos: el margen es amplio a propósito.
    while (a < cps.length && Math.hypot(p[0] - cps[a][0], p[1] - cps[a][1]) < 30) a++;
    if (a !== estado.current.avance) {
      estado.current.avance = a;
      setAvance(a);
      setDemo(false);
      if (a >= cps.length) return terminarTrazo();
    }
    // Lejos del camino: se suelta la estela, sin perder lo avanzado.
    const sig = cps[Math.min(a, cps.length - 1)];
    if (Math.hypot(p[0] - sig[0], p[1] - sig[1]) > 80) {
      dibujando.current = false;
      pintar(null);
      return;
    }
    pintar(p);
  }

  function conMisi() {
    if (listo || bloqueado) return;
    onAyuda?.();
    setDemo(true);
    let t = estado.current.trazo;
    const paso1 = () => {
      if (t >= controles.length) return;
      estado.current = { trazo: t, avance: controles[t].length };
      setAvance(controles[t].length);
      window.setTimeout(() => {
        terminarTrazo();
        t++;
        window.setTimeout(paso1, 350);
      }, 450);
    };
    paso1();
  }

  const inicio = controles[trazo]?.[avance] ?? controles[trazo]?.[0];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`tablero-traza relative rounded-[2.5rem] p-4 ${listo ? "traza-lista" : ""}`}>
        <svg
          ref={svg}
          viewBox="-10 -10 220 280"
          className="h-80 w-64 touch-none select-none sm:h-96 sm:w-76"
          role="img"
          aria-label={`Letra ${letra} para trazar`}
          onPointerDown={(e) => {
            if (bloqueado || listo) return;
            const p = punto(e);
            if (!p || !inicio) return;
            const cerca = Math.hypot(p[0] - inicio[0], p[1] - inicio[1]) < 48 || estado.current.avance > 0;
            if (!cerca) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            dibujando.current = true;
            mover(p);
          }}
          onPointerMove={(e) => {
            if (!dibujando.current) return;
            const p = punto(e);
            if (p) mover(p);
          }}
          onPointerUp={() => {
            dibujando.current = false;
            pintar(null);
          }}
        >
          {/* Camino guía */}
          {trazos.map((t, i) => (
            <path key={`g${i}`} d={ruta(t)} className="traza-guia" />
          ))}
          {trazos.map((t, i) => (
            <path key={`p${i}`} d={ruta(t)} className="traza-puntos" />
          ))}
          {/* Trazos ya hechos */}
          {controles.map((c, i) =>
            i < trazo || listo ? <path key={`h${i}`} d={ruta(c)} className="traza-hecha" /> : i === trazo && avance > 1 ? <path key={`h${i}`} d={ruta(c.slice(0, avance))} className="traza-hecha" /> : null,
          )}
          <path ref={estela} className="traza-hecha" d="" />
          {/* Punto de inicio del trazo actual */}
          {!listo && controles[trazo] ? (
            <g>
              <circle cx={controles[trazo][0][0]} cy={controles[trazo][0][1]} r="16" className="traza-inicio" />
              <text x={controles[trazo][0][0]} y={controles[trazo][0][1] + 6} textAnchor="middle" className="traza-numero">
                {trazo + 1}
              </text>
            </g>
          ) : null}
          {/* Demostración: un cometa recorre el trazo */}
          {demo && !listo && trazos[trazo] ? (
            <circle r="9" className="traza-demo">
              <animateMotion dur="1.8s" repeatCount="indefinite" path={ruta(trazos[trazo])} />
            </circle>
          ) : null}
          <circle ref={cabeza} r="13" className="traza-cabeza" opacity="0" />
        </svg>
        {listo ? <Destello /> : null}
      </div>
      <button type="button" onClick={conMisi} disabled={listo} className="boton-juego-secundario flex min-h-12 items-center gap-2 rounded-full px-5 font-bold">
        <Icono nombre="chispas" tamano={20} />
        Trazar con Misi
      </button>
    </div>
  );
}
