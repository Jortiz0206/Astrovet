import type { ColorPelaje } from "../tipos";
import Icono from "./Icono";
import Misi, { type AnimoMisi } from "./Misi";

interface MisiDiceProps {
  mensaje: string;
  pelaje?: ColorPelaje;
  animo?: AnimoMisi;
  onEscuchar?: () => void;
  tamano?: number;
  oscuro?: boolean;
}

/** Capitán Misi con su globo de diálogo. El texto siempre se ve en pantalla. */
export default function MisiDice({ mensaje, pelaje, animo = "feliz", onEscuchar, tamano = 96, oscuro = true }: MisiDiceProps) {
  return (
    <div className="flex w-full max-w-2xl items-center gap-3 sm:gap-4">
      <div className="misi-viaja shrink-0">
        <div className={animo === "habla" ? "misi-hablando" : "animate-flotar"}>
          <Misi pelaje={pelaje} animo={animo} tamano={tamano} />
        </div>
      </div>
      <div
        className={`globo relative flex flex-1 items-center gap-3 rounded-[1.75rem] px-4 py-3 text-left sm:px-5 sm:py-4 ${
          oscuro ? "bg-white text-tinta" : "bg-lavanda-tenue text-tinta"
        }`}
      >
        <span
          className={`absolute top-1/2 -left-2 size-4 -translate-y-1/2 rotate-45 ${oscuro ? "bg-white" : "bg-lavanda-tenue"}`}
          aria-hidden="true"
        />
        <p role="status" aria-live="polite" key={mensaje} className="globo-texto relative flex-1 text-lg leading-snug font-bold text-pretty sm:text-xl">
          {mensaje}
        </p>
        {onEscuchar ? (
          <button
            type="button"
            onClick={onEscuchar}
            className="relative grid size-14 shrink-0 place-items-center rounded-full bg-lavanda-tenue text-lavanda-oscuro ring-2 ring-lavanda-claro transition-colors hover:bg-lavanda-claro"
            aria-label="Escuchar otra vez"
          >
            <Icono nombre="oreja" tamano={28} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
