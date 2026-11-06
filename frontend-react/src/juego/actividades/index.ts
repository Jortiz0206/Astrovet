import { CONSIGNAS, ELIGE_DIBUJO, SIN_SONIDO_INICIAL } from "../../datos/guion";
import type { Locucion } from "../../servicios/audio";
import type { Actividad, Ronda, TipoActividad } from "../../tipos";
import ArmaFigura from "./ArmaFigura";
import ArmaPalabra from "./ArmaPalabra";
import CarreraCohete from "./CarreraCohete";
import Cocina from "./Cocina";
import Pesca from "./Pesca";
import Resortera from "./Resortera";
import Rompecabezas from "./Rompecabezas";
import CazaEstrellas from "./CazaEstrellas";
import Clasifica from "./Clasifica";
import type { PropsActividad } from "./comunes";
import Eco from "./Eco";
import EscuchaElige from "./EscuchaElige";
import Globos from "./Globos";
import ImagenPalabra from "./ImagenPalabra";
import LeeEncuentra from "./LeeEncuentra";
import MemoriaCosmica from "./MemoriaCosmica";
import Piedras from "./Piedras";
import Regalo from "./Regalo";
import RuletaVocales from "./RuletaVocales";
import SilabaPerdida from "./SilabaPerdida";
import SonidoInicial from "./SonidoInicial";
import Traza from "./Traza";
import UnePiezas from "./UnePiezas";

export const COMPONENTES: Record<TipoActividad, (p: PropsActividad) => React.ReactElement> = {
  listen_choose: EscuchaElige,
  initial_sound: SonidoInicial,
  letter_hunt: CazaEstrellas,
  picture_word: ImagenPalabra,
  memory_pairs: MemoriaCosmica,
  build_syllable: UnePiezas,
  vowel_wheel: RuletaVocales,
  build_word_syllables: ArmaPalabra,
  missing_syllable: SilabaPerdida,
  read_match: LeeEncuentra,
  odd_one: EscuchaElige,
  balloon_pop: Globos,
  stepping_stones: Piedras,
  sort_two: Clasifica,
  trace_letter: Traza,
  echo_sequence: Eco,
  feed_animal: Regalo,
  puzzle: Rompecabezas,
  build_figure: ArmaFigura,
  slingshot: Resortera,
  fishing: Pesca,
  rocket_race: CarreraCohete,
  cooking: Cocina,
};

/** Una consigna a la vez: la instrucción y, cuando corresponde, el sonido objetivo. */
export function audioRonda(act: Actividad, r: Ronda): Locucion[] {
  if (act.tipo === "sort_two" && r.grupos) return [CONSIGNAS.sort_two, { c: r.grupos[0] }, { c: r.grupos[1] }];
  if (SIN_SONIDO_INICIAL.has(act.tipo)) return [CONSIGNAS[act.tipo]];
  if (act.tipo === "puzzle") return [CONSIGNAS.puzzle, { c: r.secuencia?.[0] ?? r.objetivo }];
  return [CONSIGNAS[act.tipo], { c: act.tipo === "feed_animal" ? r.objetivo : r.objetivo }];
}

/** Lo que se busca, dicho como sonido (para la retroalimentación). */
function buscado(act: Actividad, r: Ronda): string {
  if (act.tipo === "initial_sound") return r.respuesta;
  if (act.tipo === "build_syllable" || act.tipo === "vowel_wheel") return r.objetivo;
  if (act.tipo === "missing_syllable") return r.respuesta;
  return r.objetivo;
}

/**
 * Retroalimentación de un error: nombra lo que el niño eligió y lo que se
 * busca, sin reproche. Devuelve el texto para el globo y lo que se dice.
 */
export function retroalimentacion(act: Actividad, r: Ronda, elegido: string, actual?: string): { texto: string; voz: Locucion[] } {
  const meta = actual ?? buscado(act, r);
  if (act.tipo === "build_figure") {
    return { texto: `Esa pieza es «${elegido.toLowerCase()}». Ese lugar es de «${meta.toLowerCase()}».`, voz: ["Esa pieza es", { c: elegido }, "Ese lugar es de", { c: meta }] };
  }
  if (act.tipo === "cooking") {
    return { texto: `Eso es ${elegido.toLowerCase()}. A la olla va lo que empieza con «${meta.toLowerCase()}».`, voz: ["Eso es", { c: elegido }, "A la olla va lo que empieza con", { c: meta }] };
  }
  if (act.tipo === "sort_two") {
    const [dibujo] = elegido.split("→");
    const grupo = r.grupos?.find((g) => dibujo.startsWith(g)) ?? "";
    return { texto: `${dibujo.toLowerCase()} empieza con «${grupo.toLowerCase()}». Llévalo a ese planeta.`, voz: [{ c: dibujo }, "empieza con", { c: grupo }] };
  }
  if (act.tipo === "echo_sequence") return { texto: "Escuchemos otra vez el orden.", voz: ["Escuchemos otra vez el orden."] };
  if (act.tipo === "trace_letter") return { texto: "Sigue la estela desde el punto.", voz: ["Sigue la estela desde el punto."] };
  if (ELIGE_DIBUJO.has(act.tipo)) {
    const final = act.tipo === "feed_animal" ? `Buscamos algo que empiece con «${meta.toLowerCase()}».` : `Buscamos ${meta.toLowerCase()}.`;
    return {
      texto: `Ese es ${elegido.toLowerCase()}. ${final}`,
      voz: act.tipo === "feed_animal" ? ["Ese es", { c: elegido }, "Buscamos algo que empiece con", { c: meta }] : ["Ese es", { c: elegido }, "Buscamos", { c: meta }],
    };
  }
  if (act.tipo === "build_word_syllables") return { texto: `Armaste «${elegido.toLowerCase()}». Escucha: ${meta.toLowerCase()}.`, voz: ["Armaste", { c: elegido }, "Escucha:", { c: meta }] };
  if (act.tipo === "odd_one") return { texto: `«${elegido.toLowerCase()}» empieza igual que las otras. Busca la diferente.`, voz: [{ c: elegido }, "empieza igual que las otras. Busca la diferente."] };
  return { texto: `Esa suena «${elegido.toLowerCase()}». Buscamos «${meta.toLowerCase()}».`, voz: ["Esa suena", { c: elegido }, "Buscamos", { c: meta }] };
}

/** Lo que Misi dice al ayudar: la respuesta, como sonido. */
export function respuestaDicha(act: Actividad, r: Ronda, actual?: string): Locucion {
  if (actual) return { c: actual };
  if (act.tipo === "cooking") return { c: r.objetivo };
  if (act.tipo === "build_syllable" || act.tipo === "vowel_wheel") return { c: r.objetivo };
  if (act.tipo === "echo_sequence") return { c: (r.secuencia ?? []).join(" ") };
  if (act.tipo === "feed_animal" || act.tipo === "build_word_syllables") return { c: r.respuesta };
  return { c: r.respuesta };
}

/**
 * Niveles de ayuda según errores seguidos en la ronda (PRODUCT.md):
 * 1-2 retroalimentación y repetir audio · 3-4 pista visual · 5+ Misi ayuda.
 */
export function nivelDeAyuda(errores: number, tipo: TipoActividad): number {
  if (tipo === "memory_pairs") return errores >= 4 ? 2 : 0;
  if (errores >= 5) return 3;
  if (errores >= 3) return 2;
  if (errores >= 1) return 1;
  return 0;
}
