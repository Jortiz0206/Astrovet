import { useMemo } from "react";
import Icono from "../../componentes/Icono";
import { decirContenido } from "../../servicios/audio";
import { mezclar, type PropsActividad } from "./comunes";
import { GrillaDibujos } from "./ImagenPalabra";

/** ACT-17 Lee y encuentra: la palabra aparece escrita, sin audio; el audio queda como ayuda. */
export default function LeeEncuentra({ ronda, nivelAyuda, bloqueado, onRespuesta, onAyuda }: PropsActividad) {
  const opciones = useMemo(() => mezclar(ronda.opciones), [ronda]);
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="cartel entrar-bloque relative flex items-center gap-4 rounded-[1.75rem] py-4 pr-4 pl-8">
        <span className="font-lectura text-6xl font-bold tracking-[0.06em] text-tinta sm:text-7xl">{ronda.objetivo}</span>
        <button
          type="button"
          onClick={() => {
            onAyuda?.();
            decirContenido(ronda.objetivo);
          }}
          aria-label="Escuchar la palabra (ayuda)"
          className="grid size-14 place-items-center rounded-full bg-lavanda-tenue text-lavanda-oscuro ring-2 ring-lavanda-claro hover:bg-lavanda-claro"
        >
          <Icono nombre="altavoz" tamano={26} />
        </button>
      </div>
      <GrillaDibujos opciones={opciones} respuesta={ronda.respuesta} nivelAyuda={nivelAyuda} bloqueado={bloqueado} onRespuesta={onRespuesta} decirAlTocar={false} />
    </div>
  );
}
