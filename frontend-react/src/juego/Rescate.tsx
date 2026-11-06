import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { Grupo, type ClaveCriatura } from "../componentes/Criatura";
import Icono from "../componentes/Icono";
import { efecto } from "../servicios/audio";
import type { Revelado } from "../tipos";

/**
 * El momento central del juego: el animal sale de donde estaba atrapado,
 * con la forma que cuenta la historia de su mundo (la nube se abre, sube
 * del cráter, se apartan las lianas). Después las patitas vuelan al contador.
 */
export default function Rescate({
  revelado,
  claves,
  nombre,
  patitas,
  sinMovimiento,
  onPatitasEntregadas,
}: {
  revelado: Revelado;
  claves: ClaveCriatura[];
  nombre: string;
  patitas: number;
  sinMovimiento: boolean;
  onPatitasEntregadas: () => void;
}) {
  const escenario = useRef<HTMLDivElement>(null);
  const entregado = useRef(false);

  useEffect(() => {
    if (entregado.current) return;
    const reducido = sinMovimiento || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const contador = document.getElementById("contador-patitas");
    const origen = escenario.current;
    if (!patitas || reducido || !contador || !origen) {
      entregado.current = true;
      onPatitasEntregadas();
      return;
    }
    const cantidad = Math.min(6, Math.max(3, Math.round(patitas / 5)));
    const timers: number[] = [];
    const nodos: HTMLElement[] = [];
    const desde = origen.getBoundingClientRect();
    const hasta = contador.getBoundingClientRect();
    const x0 = desde.left + desde.width / 2;
    const y0 = desde.top + desde.height * 0.45;
    const x1 = hasta.left + hasta.width * 0.3;
    const y1 = hasta.top + hasta.height / 2;

    for (let k = 0; k < cantidad; k++) {
      timers.push(
        window.setTimeout(() => {
          const p = document.createElement("span");
          p.className = "patita-voladora";
          p.innerHTML = `<svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M12 12.5c-3 0-5.5 2.6-5.5 4.6 0 1.5 1.2 2.4 2.6 2.4 1.2 0 1.8-.6 2.9-.6s1.7.6 2.9.6c1.4 0 2.6-.9 2.6-2.4 0-2-2.5-4.6-5.5-4.6z"/><ellipse cx="6" cy="10" rx="1.7" ry="2.2"/><ellipse cx="9.5" cy="6.5" rx="1.7" ry="2.3"/><ellipse cx="14.5" cy="6.5" rx="1.7" ry="2.3"/><ellipse cx="18" cy="10" rx="1.7" ry="2.2"/></svg>`;
          p.style.left = `${x0 - 17}px`;
          p.style.top = `${y0 - 17}px`;
          document.body.appendChild(p);
          nodos.push(p);
          const dx = x1 - x0;
          const dy = y1 - y0;
          const curva = (k % 2 ? 1 : -1) * (60 + k * 14);
          const vuelo = p.animate(
            [
              { transform: "translate(0,0) scale(0.4)", opacity: 0 },
              { transform: `translate(${dx * 0.35 + curva}px, ${dy * 0.25 - 90}px) scale(1.15)`, opacity: 1, offset: 0.35 },
              { transform: `translate(${dx}px, ${dy}px) scale(0.55)`, opacity: 0.95 },
            ],
            { duration: 900, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards" },
          );
          vuelo.onfinish = () => {
            p.remove();
            efecto("patita", k);
            contador.classList.remove("contador-recibe");
            void contador.offsetWidth;
            contador.classList.add("contador-recibe");
          };
        }, 1150 + k * 130),
      );
    }
    timers.push(
      window.setTimeout(() => {
        entregado.current = true;
        onPatitasEntregadas();
      }, 1150 + cantidad * 130 + 950),
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      nodos.forEach((n) => n.remove());
    };
  }, [patitas, sinMovimiento, onPatitasEntregadas]);

  return (
    <div ref={escenario} className={`rescate rescate-modo-${revelado} relative grid h-64 w-72 place-items-center sm:h-72 sm:w-80`} aria-hidden="true">
      <span className="rescate-halo absolute inset-6 rounded-full" />
      {revelado === "crater" ? <span className="rescate-crater absolute bottom-6 left-1/2 h-16 w-60 -translate-x-1/2 rounded-[50%]" /> : null}
      <span className="rescate-animal relative">
        <Grupo claves={claves} tamano={176} titulo={nombre} />
      </span>
      {revelado === "crater" ? <span className="rescate-borde absolute bottom-6 left-1/2 h-10 w-60 -translate-x-1/2 rounded-b-[50%]" /> : null}
      {revelado === "nube" ? (
        <>
          <Nube className="rescate-nube-izq" />
          <Nube className="rescate-nube-der" espejo />
        </>
      ) : null}
      {revelado === "cristal" ? <Cristal /> : null}
      {revelado === "lianas" ? (
        <>
          <Lianas className="rescate-lianas-izq" />
          <Lianas className="rescate-lianas-der" espejo />
        </>
      ) : null}
      {patitas ? (
        <span className="rescate-premio absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-dorado px-5 py-2 text-2xl font-black text-tinta">
          +{patitas} <Icono nombre="patita" tamano={26} />
        </span>
      ) : null}
    </div>
  );
}

function Nube({ className, espejo }: { className: string; espejo?: boolean }) {
  return (
    <svg viewBox="0 0 160 200" className={`absolute top-0 h-full ${espejo ? "right-0" : "left-0"} ${className}`}>
      <g transform={espejo ? "translate(160 0) scale(-1 1)" : undefined}>
      <path
        d="M0 30 C30 0 70 10 82 36 C110 26 140 44 132 74 C160 86 160 126 132 136 C148 166 118 196 88 182 C70 204 30 200 18 180 C6 190 0 186 0 180 Z"
        fill="#F4ECFF"
        stroke="#B9A8E6"
        strokeWidth="4"
      />
      <path d="M40 70 C56 60 74 66 80 80 M30 130 C50 118 74 124 84 140" fill="none" stroke="#DDD5F3" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Lianas({ className, espejo }: { className: string; espejo?: boolean }) {
  const hojas = [24, 58, 92, 126, 160];
  return (
    <svg viewBox="0 0 90 220" className={`absolute top-0 h-full ${espejo ? "right-0" : "left-0"} ${className}`}>
      <g transform={espejo ? "translate(90 0) scale(-1 1)" : undefined}>
      {[18, 46, 74].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 0 C${x + 10} 60 ${x - 10} 120 ${x + 4} 210`} fill="none" stroke="#2F7A5E" strokeWidth="7" strokeLinecap="round" />
          {hojas.map((y, j) => (
            <path
              key={y}
              d={`M${x + (j % 2 ? 4 : -2)} ${y + i * 8} c${j % 2 ? 18 : -18} -10 ${j % 2 ? 26 : -26} 4 ${j % 2 ? 22 : -22} 14 c${j % 2 ? -10 : 10} 6 ${j % 2 ? -18 : 18} 2 ${j % 2 ? -22 : 22} -14 z`}
              fill={j % 2 ? "#6FBF8E" : "#4FB08A"}
              stroke="#2B2440"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          ))}
        </g>
      ))}
      </g>
    </svg>
  );
}

/** Cristal de hielo del cometa: se raja y sus trozos se apartan para liberar al animal. */
function Cristal() {
  // Trozos de un prisma alrededor del animal: [puntos, dirección de salida en grados].
  const trozos: [string, number][] = [
    ["20,40 70,6 92,62 40,96", -140],
    ["70,6 130,0 116,58 92,62", -90],
    ["130,0 190,22 172,82 116,58", -40],
    ["190,22 236,70 206,130 172,82", 10],
    ["206,130 236,70 240,190 196,206", 40],
    ["196,206 240,190 200,254 146,250", 80],
    ["146,250 200,254 120,280 96,236", 100],
    ["96,236 120,280 46,256 52,200", 140],
    ["52,200 46,256 4,186 26,150", 170],
    ["26,150 4,186 20,40 40,96", -170],
  ];
  return (
    <svg viewBox="0 0 240 280" className="rescate-cristal absolute inset-0 m-auto h-full" aria-hidden="true">
      {/* Núcleo de hielo: deja ver al animal borroso y se derrite primero */}
      <polygon points="40,96 92,62 172,82 206,130 196,206 96,236 52,200 26,150" className="rescate-nucleo" fill="#DDF1FB" fillOpacity="0.6" />
      {trozos.map(([pts, ang], i) => (
        <polygon
          key={i}
          points={pts}
          className="rescate-trozo"
          style={{ "--dx": `${Math.cos((ang * Math.PI) / 180) * 120}px`, "--dy": `${Math.sin((ang * Math.PI) / 180) * 120}px`, "--giro": `${(i % 2 ? 1 : -1) * 40}deg` } as CSSProperties}
          fill={i % 3 === 0 ? "#DDF1FB" : i % 3 === 1 ? "#BFE3F7" : "#A7D3EA"}
          fillOpacity="0.88"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ))}
      <path d="M70 40 L96 120 M150 30 L134 110 M200 120 L150 150 M90 230 L118 170" className="rescate-grieta" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
