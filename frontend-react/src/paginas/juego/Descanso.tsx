import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icono from "../../componentes/Icono";
import Misi from "../../componentes/Misi";
import { BotonMantener } from "../../componentes/ui";
import { useJuego } from "../../contexto/Juego";
import { GUION } from "../../datos/guion";
import * as api from "../../servicios/api";
import { efecto, hablar } from "../../servicios/audio";

function lista(sonidos: string[]): string {
  const conArticulo = sonidos.map((s) => `la ${s}`);
  if (conArticulo.length <= 1) return conArticulo.join("");
  return `${conArticulo.slice(0, -1).join(", ")} y ${conArticulo.at(-1)}`;
}

/** Cierre suave (CU-08) con el ritual «Estrellas de hoy» (ESP-04). */
export default function Descanso() {
  const { jugador, sesion, terminarJuego } = useJuego();
  const navegar = useNavigate();
  const cerrada = useRef(false);

  const sonidos = useMemo(() => (sesion ? api.sonidosDeSesion(sesion.id).slice(0, 3) : []), [sesion]);
  const mensaje = sonidos.length
    ? `Hoy practicamos ${lista(sonidos)}. ¡Qué buen viaje! ${GUION.despedida[0]}`
    : `¡Qué buen viaje! ${GUION.despedida[0]}`;

  useEffect(() => {
    if (!sesion || cerrada.current) return;
    cerrada.current = true;
    void api.cerrarSesion(sesion.id, "completed");
    efecto("cierre");
    const t = setTimeout(() => hablar(mensaje, { lento: true }), 900);
    return () => clearTimeout(t);
  }, [sesion, mensaje]);

  async function volver() {
    await terminarJuego();
    navegar("/tutor");
  }

  if (!jugador) return null;

  return (
    <section className="escena-descanso relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-4 py-10 text-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {sonidos.map((s, i) => (
          <span
            key={s}
            className="estrella-hoy absolute grid size-20 place-items-center font-lectura text-4xl font-bold text-tinta"
            style={{ top: `${12 + i * 9}%`, left: `${18 + i * 28}%`, animationDelay: `${i * 0.8}s` }}
          >
            {s}
          </span>
        ))}
        <span className="absolute top-8 right-10 text-dorado/80">
          <Icono nombre="luna" tamano={72} />
        </span>
      </div>
      <div className="relative grid size-56 place-items-center rounded-full bg-lavanda/20 ring-8 ring-lavanda/20 sm:size-64">
        <Misi pelaje={jugador.pelaje} animo="duerme" tamano={200} />
      </div>
      <div className="relative max-w-xl">
        <h1 className="text-3xl font-black text-lavanda-claro sm:text-4xl">Hora de descansar</h1>
        <p className="mt-4 text-xl leading-relaxed font-bold text-white/90">{mensaje}</p>
      </div>
      <div className="relative flex flex-col items-center gap-2">
        <BotonMantener onCompletar={volver} className="bg-white/15 px-6 py-3 text-base text-white ring-1 ring-white/25">
          Adulto: mantén para volver a tu espacio
        </BotonMantener>
        <p className="text-sm text-white/60">La sesión quedó guardada.</p>
      </div>
    </section>
  );
}
