import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Grupo } from "../../componentes/Criatura";
import Icono from "../../componentes/Icono";
import MisiDice from "../../componentes/MisiDice";
import { useJuego } from "../../contexto/Juego";
import { MISIONES } from "../../datos/contenido";
import { hablar } from "../../servicios/audio";

/** Vista previa de la clínica: muestra los rescatados. Los juegos de cuidado llegan en el incremento 2. */
export default function Clinica() {
  const { jugador, estados, setMundoVisual } = useJuego();
  useEffect(() => setMundoVisual(0), [setMundoVisual]);
  if (!jugador) return null;
  const rescatados = MISIONES.filter((m) => estados[m.id] === "completado");
  const mensaje = rescatados.length
    ? "Tus animales están en la sala de espera. Muy pronto podrás cuidarlos aquí."
    : "Todavía no hay animales en la clínica. ¡Ve a tu casa y rescata al primero!";

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-6 px-4 py-6">
      <div className="flex w-full items-center">
        <Link to="/juego" viewTransition className="flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-bold ring-1 ring-white/15 hover:bg-white/20">
          <Icono nombre="flecha-izq" tamano={20} />
          Mi casa
        </Link>
      </div>
      <h1 className="flex items-center gap-3 text-3xl font-black sm:text-4xl">
        <Icono nombre="clinica" tamano={36} className="text-rosa" />
        Clínica veterinaria
      </h1>
      <MisiDice mensaje={mensaje} pelaje={jugador.pelaje} onEscuchar={() => hablar(mensaje)} />
      {rescatados.length ? (
        <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
          {rescatados.map((m, i) => (
            <li key={m.id} className="ficha-rescatado entrar-bloque flex flex-col items-center gap-1 rounded-[1.75rem] p-4 text-center" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
              <span className="animal-respira">
                <Grupo claves={m.animal.claves} tamano={96} />
              </span>
              <span className="text-lg font-black">{m.animal.nombre}</span>
              <span className="text-sm text-white/75">{m.animal.especie}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Link to="/juego" viewTransition className="boton-juego flex min-h-16 items-center gap-2 rounded-full px-8 text-xl font-black">
          <Icono nombre="casa" tamano={24} />
          Ir a mi casa
        </Link>
      )}
    </section>
  );
}
