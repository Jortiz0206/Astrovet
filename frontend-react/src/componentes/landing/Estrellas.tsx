import { useEffect, useRef } from "react";

/** Control imperativo del campo de estrellas: un salto (warp) entre escenas. */
export interface ControlEstrellas {
  saltar: () => void;
}

interface Estrella {
  x: number;
  y: number;
  z: number;
  color: string;
}

const COLORES = ["#ffffff", "#ffffff", "#ffffff", "#fff3d1", "#ffd166", "#ddd5f3", "#ffb7b2"];
const VELOCIDAD_REPOSO = 0.018; // profundidad por segundo
const VELOCIDAD_SALTO = 1.5;

function nueva(z = Math.random()): Estrella {
  return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.max(0.05, z), color: COLORES[Math.floor(Math.random() * COLORES.length)] };
}

/**
 * Cielo de la landing en canvas. Las estrellas se acercan muy despacio y,
 * en cada cambio de escena, se estiran en un salto de 1 s (la firma visual).
 * Se detiene fuera de pantalla y con la pestaña oculta; con movimiento
 * reducido se dibuja una sola vez y el salto no hace nada.
 */
export default function Estrellas({ control, className = "" }: { control?: React.RefObject<ControlEstrellas | null>; className?: string }) {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = lienzo.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ancho = 0;
    let alto = 0;
    let estrellas: Estrella[] = [];
    let marco = 0;
    let visible = true;
    let ultimo = performance.now();
    let salto = 0; // 0..1, decae sola
    let px = 0;
    let py = 0;
    let objetivoX = 0;
    let objetivoY = 0;

    function medir() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas!.getBoundingClientRect();
      ancho = r.width;
      alto = r.height;
      canvas!.width = Math.round(ancho * dpr);
      canvas!.height = Math.round(alto * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cantidad = Math.min(420, Math.round((ancho * alto) / 2600));
      if (estrellas.length !== cantidad) estrellas = Array.from({ length: cantidad }, () => nueva());
      if (reducido) dibujar(0);
    }

    function dibujar(dt: number) {
      ctx!.clearRect(0, 0, ancho, alto);
      const cx = ancho / 2 + px;
      const cy = alto * 0.45 + py;
      const foco = Math.max(ancho, alto) * 0.5;
      const vel = VELOCIDAD_REPOSO + VELOCIDAD_SALTO * salto * salto;
      for (const e of estrellas) {
        const zAntes = e.z;
        e.z -= vel * dt;
        if (e.z <= 0.04) {
          Object.assign(e, nueva(1));
          continue;
        }
        const sx = cx + (e.x / e.z) * foco;
        const sy = cy + (e.y / e.z) * foco;
        if (sx < -20 || sx > ancho + 20 || sy < -20 || sy > alto + 20) {
          Object.assign(e, nueva(1));
          continue;
        }
        const tamano = Math.max(0.5, (1 - e.z) * 2.6);
        const brillo = Math.min(1, (1 - e.z) * 1.4);
        ctx!.globalAlpha = brillo;
        if (salto > 0.08) {
          // Estela: desde donde estaba la estrella un instante antes.
          const zCola = Math.min(1, zAntes + vel * 0.05);
          ctx!.strokeStyle = e.color;
          ctx!.lineWidth = tamano;
          ctx!.lineCap = "round";
          ctx!.beginPath();
          ctx!.moveTo(cx + (e.x / zCola) * foco, cy + (e.y / zCola) * foco);
          ctx!.lineTo(sx, sy);
          ctx!.stroke();
        } else {
          ctx!.fillStyle = e.color;
          ctx!.beginPath();
          ctx!.arc(sx, sy, tamano, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;
    }

    function cuadro(t: number) {
      const dt = Math.min(0.05, (t - ultimo) / 1000);
      ultimo = t;
      salto = Math.max(0, salto - dt * 1.1);
      px += (objetivoX - px) * Math.min(1, dt * 3);
      py += (objetivoY - py) * Math.min(1, dt * 3);
      dibujar(dt);
      marco = requestAnimationFrame(cuadro);
    }

    function arrancar() {
      if (reducido || marco || !visible || document.hidden) return;
      ultimo = performance.now();
      marco = requestAnimationFrame(cuadro);
    }
    function parar() {
      cancelAnimationFrame(marco);
      marco = 0;
    }

    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) arrancar();
      else parar();
    });
    io.observe(canvas);
    const alCambiarPestana = () => (document.hidden ? parar() : arrancar());
    document.addEventListener("visibilitychange", alCambiarPestana);
    // Paralaje leve con el puntero fino (en tabletas no hay hover).
    const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const alMover = (ev: PointerEvent) => {
      objetivoX = (ev.clientX / window.innerWidth - 0.5) * -36;
      objetivoY = (ev.clientY / window.innerHeight - 0.5) * -24;
    };
    if (fino && !reducido) window.addEventListener("pointermove", alMover, { passive: true });

    if (control) {
      control.current = {
        saltar: () => {
          if (!reducido) salto = 1;
        },
      };
    }

    medir();
    arrancar();
    return () => {
      parar();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", alCambiarPestana);
      window.removeEventListener("pointermove", alMover);
      if (control) control.current = null;
    };
  }, [control]);

  return <canvas ref={lienzo} className={`pointer-events-none absolute inset-0 size-full ${className}`} aria-hidden="true" />;
}
