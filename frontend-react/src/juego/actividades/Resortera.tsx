import { useEffect, useMemo, useRef, useState } from "react";
import { decirContenido, efecto } from "../../servicios/audio";
import { escalaDe, mezclar, type PropsActividad } from "./comunes";

const G = 980; // gravedad en px/s²
const TIRON_MAX = 92; // cuánto se estira la banda, en px
const PUNTOS = 14;
const COLORES = ["#FFB7B2", "#B9A8E6", "#9FD3F2", "#FFD166", "#8FD9B6"];

interface Torre {
  valor: string;
  x: number; // centro, px
  pisos: number;
}

type Estado = "lista" | "estirando" | "vuela" | "fin";

/**
 * Resortera: el niño estira la banda y lanza el ovillo de Misi a la torre que
 * tiene el sonido. Tocar una torre también lanza (apuntado automático), para
 * quien aún no domina el gesto.
 */
export default function Resortera({ ronda, nivelAyuda, bloqueado, paso, onRespuesta }: PropsActividad) {
  const escena = useRef<HTMLDivElement>(null);
  const ovillo = useRef<HTMLDivElement>(null);
  const bandaA = useRef<SVGLineElement>(null);
  const bandaB = useRef<SVGLineElement>(null);
  const puntos = useRef<(SVGCircleElement | null)[]>([]);
  const [medida, setMedida] = useState({ w: 720, h: 360 });
  const [estado, setEstado] = useState<Estado>("lista");
  const [caida, setCaida] = useState<string | null>(null);
  const [duda, setDuda] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const marco = useRef(0);
  const opciones = useMemo(() => mezclar(ronda.opciones), [ronda]);

  const { w, h } = medida;
  const suelo = h - 26;
  const ancla = { x: Math.max(70, w * 0.14), y: suelo - 118 };
  const torres: Torre[] = opciones.map((valor, i) => ({ valor, x: w * (0.5 + i * 0.19), pisos: 2 + ((i + ronda.objetivo.length) % 2) }));
  const PISO = 36;
  const altoTorre = (t: Torre) => t.pisos * PISO + 64;
  const k = Math.sqrt(0.98 * (w - ancla.x) * G) / TIRON_MAX;

  useEffect(() => {
    const el = escena.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setMedida({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(marco.current);
    };
  }, []);

  // Coloca el ovillo y las bandas sin pasar por el estado de React (cada cuadro).
  function pintar(x: number, y: number) {
    if (ovillo.current) ovillo.current.style.transform = `translate(${x - 22}px, ${y - 22}px)`;
    bandaA.current?.setAttribute("x2", String(x));
    bandaA.current?.setAttribute("y2", String(y));
    bandaB.current?.setAttribute("x2", String(x));
    bandaB.current?.setAttribute("y2", String(y));
  }
  function guia(vx: number, vy: number, visible: boolean) {
    puntos.current.forEach((c, i) => {
      if (!c) return;
      const t = (i + 1) * 0.07;
      c.setAttribute("cx", String(ancla.x + vx * t));
      c.setAttribute("cy", String(ancla.y + vy * t + 0.5 * G * t * t));
      c.style.opacity = visible ? String(1 - i / PUNTOS) : "0";
    });
  }

  useEffect(() => {
    if (estado === "lista") pintar(ancla.x, ancla.y);
  });

  // Con la ayuda más alta, la guía muestra el tiro hacia la torre correcta.
  const ayuda = nivelAyuda >= 3 && estado === "lista" ? velocidadHacia(torres.find((t) => t.valor === ronda.respuesta)) : null;
  useEffect(() => {
    if (ayuda) guia(ayuda.vx, ayuda.vy, true);
    else if (estado === "lista") guia(0, 0, false);
  });

  function velocidadHacia(t?: Torre) {
    if (!t) return null;
    const objetivoY = suelo - altoTorre(t) + 30;
    const dx = t.x - ancla.x;
    const dy = ancla.y - objetivoY;
    const ang = (52 * Math.PI) / 180;
    const den = 2 * Math.cos(ang) ** 2 * (dx * Math.tan(ang) - dy);
    if (den <= 0) return null;
    const v = Math.sqrt((G * dx * dx) / den);
    return { vx: v * Math.cos(ang), vy: -v * Math.sin(ang) };
  }

  function lanzar(vx: number, vy: number) {
    setEstado("vuela");
    efecto("girar");
    guia(0, 0, false);
    let x = ancla.x;
    let y = ancla.y;
    let ultimo = performance.now();
    const paso1 = (ahora: number) => {
      const dt = Math.min(0.033, (ahora - ultimo) / 1000);
      ultimo = ahora;
      vy += G * dt;
      x += vx * dt;
      y += vy * dt;
      if (ovillo.current) ovillo.current.style.transform = `translate(${x - 22}px, ${y - 22}px) rotate(${x * 2}deg)`;
      bandaA.current?.setAttribute("x2", String(ancla.x));
      bandaA.current?.setAttribute("y2", String(ancla.y));
      bandaB.current?.setAttribute("x2", String(ancla.x));
      bandaB.current?.setAttribute("y2", String(ancla.y));
      const tocada = torres.find((t) => Math.abs(x - t.x) < 40 && y > suelo - altoTorre(t) - 10 && y < suelo);
      if (tocada) return impacto(tocada);
      if (y > suelo || x > w + 40 || x < -40) return fallo();
      marco.current = requestAnimationFrame(paso1);
    };
    marco.current = requestAnimationFrame(paso1);
  }

  function reiniciar(ms: number) {
    window.setTimeout(() => {
      setEstado("lista");
      setDuda(null);
      pintar(ancla.x, ancla.y);
    }, ms);
  }

  function impacto(t: Torre) {
    decirContenido(t.valor);
    if (t.valor === ronda.respuesta) {
      setCaida(t.valor);
      setEstado("fin");
      efecto("acierto", paso);
      if (ovillo.current) ovillo.current.style.opacity = "0";
      onRespuesta(t.valor, true, true);
    } else {
      setDuda(t.valor);
      efecto("intento");
      onRespuesta(t.valor, false, false);
      reiniciar(700);
    }
  }

  function fallo() {
    setAviso("¡Casi! Estira otra vez.");
    window.setTimeout(() => setAviso(""), 1600);
    reiniciar(350);
  }

  const libre = !bloqueado && estado === "lista";

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div ref={escena} className="resortera-escena relative h-[22rem] w-full max-w-4xl touch-none overflow-hidden rounded-[2rem] select-none">
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
          <rect x="0" y={suelo} width={w} height={h - suelo} fill="#8FD9B6" />
          <path d={`M0 ${suelo} H${w}`} stroke="#2B2440" strokeWidth="4" />
          {Array.from({ length: PUNTOS }, (_, i) => (
            <circle key={i} ref={(el) => void (puntos.current[i] = el)} r={5 - i * 0.22} fill="#fff" style={{ opacity: 0 }} />
          ))}
          {/* Resortera: horqueta y bandas */}
          <path d={`M${ancla.x} ${suelo} V${ancla.y + 40} L${ancla.x - 22} ${ancla.y - 6} M${ancla.x} ${ancla.y + 40} L${ancla.x + 22} ${ancla.y - 6}`} stroke="#8A5A3C" strokeWidth="12" strokeLinecap="round" fill="none" />
          <line ref={bandaA} x1={ancla.x - 22} y1={ancla.y - 6} x2={ancla.x} y2={ancla.y} stroke="#E58C86" strokeWidth="5" strokeLinecap="round" />
          <line ref={bandaB} x1={ancla.x + 22} y1={ancla.y - 6} x2={ancla.x} y2={ancla.y} stroke="#E58C86" strokeWidth="5" strokeLinecap="round" />
        </svg>

        {torres.map((t, i) => {
          const alto = altoTorre(t);
          const pista = nivelAyuda >= 2 && t.valor === ronda.respuesta && estado !== "fin";
          return (
            <button
              key={t.valor}
              type="button"
              disabled={!libre}
              onClick={() => {
                const v = velocidadHacia(t);
                if (v) lanzar(v.vx, v.vy);
              }}
              aria-label={`Torre ${t.valor}`}
              className={`torre absolute flex flex-col items-center ${caida === t.valor ? "torre-cae" : ""} ${duda === t.valor ? "torre-duda" : ""}`}
              style={{ left: t.x - 40, top: suelo - alto, width: 80, height: alto }}
            >
              <span className={`torre-letrero relative grid h-16 w-20 place-items-center rounded-2xl border-4 border-tinta bg-white font-lectura text-4xl font-bold text-tinta ${pista ? "planeta-pista" : ""}`}>
                {t.valor.toLowerCase()}
              </span>
              {Array.from({ length: t.pisos }, (_, p) => (
                <span
                  key={p}
                  className="torre-bloque block border-4 border-tinta"
                  style={{ width: p % 2 ? 64 : 72, height: PISO, marginTop: -4, background: COLORES[(i + p) % COLORES.length], ["--giro" as string]: `${(p % 2 ? 1 : -1) * (25 + p * 20)}deg`, ["--lejos" as string]: `${40 + p * 30}px` }}
                />
              ))}
            </button>
          );
        })}

        <div
          ref={ovillo}
          role="button"
          tabIndex={-1}
          aria-hidden="true"
          className={`ovillo absolute top-0 left-0 size-11 cursor-grab ${estado === "estirando" ? "cursor-grabbing" : ""}`}
          onPointerDown={(e) => {
            if (!libre) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setEstado("estirando");
            efecto("toque");
          }}
          onPointerMove={(e) => {
            if (estado !== "estirando" || !escena.current) return;
            const r = escena.current.getBoundingClientRect();
            const k = escalaDe(escena.current);
            let dx = (e.clientX - r.left) / k - ancla.x;
            let dy = (e.clientY - r.top) / k - ancla.y;
            const largo = Math.hypot(dx, dy);
            if (largo > TIRON_MAX) {
              dx = (dx / largo) * TIRON_MAX;
              dy = (dy / largo) * TIRON_MAX;
            }
            pintar(ancla.x + dx, ancla.y + dy);
            guia(-dx * k, -dy * k, largo > 12);
            e.currentTarget.dataset.dx = String(dx);
            e.currentTarget.dataset.dy = String(dy);
          }}
          onPointerUp={(e) => {
            if (estado !== "estirando") return;
            const dx = Number(e.currentTarget.dataset.dx ?? 0);
            const dy = Number(e.currentTarget.dataset.dy ?? 0);
            e.currentTarget.dataset.dx = e.currentTarget.dataset.dy = "0";
            if (Math.hypot(dx, dy) < 14) {
              setEstado("lista");
              pintar(ancla.x, ancla.y);
              guia(0, 0, false);
              return;
            }
            lanzar(-dx * k, -dy * k);
          }}
        >
          <svg viewBox="0 0 44 44" className="size-full" aria-hidden="true">
            <circle cx="22" cy="22" r="19" fill="#FFB7B2" stroke="#2B2440" strokeWidth="3.5" />
            <path d="M8 16 Q22 26 36 14 M6 26 Q22 34 38 24 M16 5 Q24 22 18 40" fill="none" stroke="#E58C86" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="pointer-events-none absolute top-3 left-0 w-full text-center text-lg font-extrabold text-white" aria-live="polite">
          {aviso}
        </p>
      </div>
      <p className="text-center font-bold text-white/75">Estira el ovillo hacia atrás y suéltalo, o toca la torre.</p>
    </div>
  );
}
