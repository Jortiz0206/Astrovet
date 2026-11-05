import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icono from "../../componentes/Icono";
import Misi, { NOMBRES_PELAJE } from "../../componentes/Misi";
import { useJuego } from "../../contexto/Juego";
import * as api from "../../servicios/api";
import { efecto, hablar } from "../../servicios/audio";
import { COLORES_PELAJE, type ColorPelaje } from "../../tipos";

/** Vestidor: por ahora el color de pelaje (gratis); trajes y tienda llegan en el incremento 2. */
export default function Vestidor() {
  const { jugador, refrescar, setMundoVisual } = useJuego();
  const [guardando, setGuardando] = useState<ColorPelaje | null>(null);
  useEffect(() => setMundoVisual(0), [setMundoVisual]);
  if (!jugador) return null;

  async function elegir(p: ColorPelaje) {
    if (!jugador || p === jugador.pelaje) return;
    setGuardando(p);
    try {
      await api.cambiarPelaje(jugador.id, p);
      await refrescar();
      efecto("paso");
      hablar("¡Te queda muy bien!");
    } finally {
      setGuardando(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-6 px-4 py-6">
      <div className="flex w-full items-center">
        <Link to="/juego" viewTransition className="flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-bold ring-1 ring-white/15 hover:bg-white/20">
          <Icono nombre="flecha-izq" tamano={20} />
          Centro espacial
        </Link>
      </div>
      <h1 className="text-3xl font-black sm:text-4xl">Vestidor de Misi</h1>
      <div className="grid size-56 animate-flotar place-items-center rounded-full bg-white/10 ring-4 ring-white/15 sm:size-64">
        <Misi key={jugador.pelaje} pelaje={jugador.pelaje} tamano={200} className="misi-cambia" />
      </div>
      <h2 className="text-xl font-extrabold">Elige el color de pelaje</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {COLORES_PELAJE.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => elegir(p)}
            aria-pressed={jugador.pelaje === p}
            disabled={guardando !== null}
            className={`flex flex-col items-center gap-1 rounded-3xl p-2 font-bold transition ${
              jugador.pelaje === p ? "bg-white text-tinta ring-4 ring-dorado" : "bg-white/10 ring-2 ring-white/15 hover:bg-white/20"
            }`}
          >
            <Misi pelaje={p} tamano={80} />
            {NOMBRES_PELAJE[p]}
          </button>
        ))}
      </div>
      <div className="mt-2 w-full rounded-3xl bg-white/10 p-5 text-center ring-1 ring-white/15">
        <p className="flex items-center justify-center gap-2 text-lg font-extrabold">
          <Icono nombre="bolsa" tamano={22} />
          Tienda de trajes y accesorios
        </p>
        <p className="text-white/80 tabular-nums">Muy pronto podrás cambiar tus {jugador.patitas} patitas por cascos, capas y gafas.</p>
      </div>
    </section>
  );
}
