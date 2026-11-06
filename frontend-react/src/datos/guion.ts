// Guion de Capitán Misi (catálogo, sección 10): frases cortas, tuteo y
// elogio del esfuerzo. Nunca «te equivocaste», «rápido» ni comparaciones.

export const GUION = {
  bienvenida: ["¡Hola, rescatista! ¿Despegamos?", "Qué bueno verte. Hay animales esperando.", "Mi nave está lista. ¿Vienes conmigo?", "¡Llegaste! Hoy hay mucho por descubrir."],

  // Al abrir una misión ({animal}, {lugar}; {esta} y {perdio} concuerdan con uno o varios animales).
  intro: ["¡{animal} {perdio} en {lugar}! ¿Vamos a ayudar?", "Escucho a {animal} en {lugar}. ¿Vamos a buscar?", "¡Alerta, rescatista! Hay que buscar a {animal} en {lugar}."],
  introOtraVez: ["Ya rescataste a {animal}. ¡Juguemos otra vez!", "¡A jugar otra vez con {animal}!", "¡Volvimos con {animal}! Practiquemos juntos."],

  // Ronda completa.
  acierto: ["¡Lo lograste!", "Escuchaste con atención.", "¡Eso es!", "Muy buen trabajo.", "¡Bien hecho, rescatista!", "¡Así se hace!", "¡Excelente oído!", "¡Sí, esa era!"],
  aciertoTrasError: ["Lo intentaste otra vez y lo lograste.", "Seguiste intentando. ¡Así se hace!", "¡No te rendiste y lo encontraste!", "Probaste otra vez y salió. ¡Muy bien!"],
  aciertoConAyuda: ["Lo hicimos juntos. ¡Qué buen equipo!", "Juntos lo logramos. La próxima la intentas tú.", "¡Bien! Con ayuda también se aprende."],
  racha: ["¡Tres seguidas! Estás volando.", "¡Otra más sin ayuda! Tu oído está muy despierto.", "¡Qué racha, rescatista!"],

  // Dentro de una ronda (falta poco).
  paso: ["¡Sí! Sigue buscando.", "¡Una más!", "¡Muy bien, sigue!", "¡Bien! ¿Hay otra?", "¡Esa sí! Sigue así."],
  ahora: ["Ahora:", "Ahora busca:", "La siguiente:"],
  pesca: ["¡Picó!", "¡A la cubeta!", "¡Qué buen pez!"],
  olla: ["¡Splash! A la olla.", "¡Huele rico!", "¡Eso va en la sopa!"],
  torre: ["¡Derribada!", "¡Justo en el blanco!", "¡Pum! ¡Bien lanzado!"],
  carril: ["¡Atrapada!", "¡Buen vuelo!", "¡Directo a la estrella!"],
  cruza: ["¡Saltó!", "¡Una piedra más!", "¡Qué buen salto!", "¡Ya casi llega a la orilla!"],
  regalo: ["¡Le encantó!", "¡Gracias!", "¡Mira qué feliz está!", "¡Justo lo que quería!"],
  pieza: ["¡Esa va ahí!", "¡Bien! Falta otra pieza.", "¡Encaja!"],
  mitad: ["¡Ya vamos por la mitad! La niebla se está yendo.", "¡Mitad del camino! Ya casi lo vemos.", "¡Vamos muy bien! Falta menos."],

  // Errores: nunca «te equivocaste». Primero se nombra lo que pasó.
  casi: ["Casi.", "Mmm, ese no.", "Uy, por poquito.", "Ese no es."],
  sigueIntentando: ["Sigue intentando, lo estás haciendo bien.", "Tranquilo, tenemos tiempo.", "Escucha con calma y prueba otra vez.", "Equivocarse también es aprender."],
  pista2: ["Te doy una pista: mira, esta brilla un poquito.", "Una pista: la que brilla.", "Mira bien: hay una que brilla. ¡Esa te ayuda!"],
  pista3: ["Hagámoslo juntos. Mira y escucha. Ahora tú.", "Te ayudo. Escucha bien y tócala conmigo.", "Vamos juntos, paso a paso. Es esta:"],
  memoriaNo: ["Esas no son pareja. ¡Sigue buscando!", "Hmm, esas no van juntas. Prueba otra.", "Esas no. ¿Recuerdas dónde estaba la otra?"],

  // Sin respuesta por un rato.
  inactivo: ["¿Te ayudo? Escucha otra vez.", "Aquí estoy. Escucha bien:", "Tómate tu tiempo. Escucha:"],

  // Entre juegos de una misma misión y al seguir en el mismo juego.
  nuevoJuego: ["¡Muy bien! Ahora, un juego nuevo.", "¡Listo! Vamos con otro juego.", "¡Qué bien! Cambiemos de juego."],
  otraRonda: ["¡Otra!", "Ahora esta.", "Vamos con la siguiente.", "¡Seguimos!"],

  // Al rescatar ({animal}).
  rescate: ["¡Rescataste a {animal}! Ya {esta} en la clínica.", "¡{animal} {esta} a salvo gracias a ti!", "¡Lo lograste! {animal} ya {esta} en la clínica."],
  repaso: ["¡Gracias por practicar otra vez con {animal}!", "¡Qué buen repaso! {animal} {esta} feliz."],
  siguiente: ["¿Vamos por el siguiente animal?", "Hay otro amigo esperando. ¿Vamos?", "¿Seguimos con el próximo rescate?"],
  finMundo: ["¡Terminaste todo este mundo! Eres un gran rescatista.", "¡Todos los animales de este mundo están a salvo!"],

  turno: ["¡Tu turno!", "Ahora tú.", "¡Te toca!"],
  aviso: ["Ya casi es hora de descansar.", "Terminemos esta y vamos a dormir."],
  despedida: ["Me voy a descansar. ¿Le cuentas a tu adulto lo que hicimos?", "Hasta pronto, rescatista."],
} as const;

/** Reemplaza {animal}, {lugar}… en una frase del guion. */
export function frase(lista: readonly string[], datos: Record<string, string>, elegir: (l: readonly string[]) => string): string {
  return elegir(lista).replace(/\{(\w+)\}/g, (_, k: string) => datos[k] ?? "");
}

/** Instrucción principal de cada tipo de actividad (una consigna a la vez). */
export const CONSIGNAS = {
  listen_choose: "Toca la letra que suena así:",
  initial_sound: "¿Con qué sonido empieza esta palabra?",
  letter_hunt: "Toca todas las estrellas con este sonido:",
  picture_word: "Toca el dibujo de:",
  memory_pairs: "Voltea dos tarjetas que vayan juntas.",
  build_syllable: "Junta las piezas para que suene:",
  vowel_wheel: "Gira la ruleta hasta que suene:",
  build_word_syllables: "Arma la palabra:",
  missing_syllable: "¿Qué pieza le falta a esta palabra?",
  read_match: "Lee la palabra y toca su dibujo.",
  odd_one: "Toca la que no empieza igual.",
  balloon_pop: "Revienta los globos que suenan así:",
  stepping_stones: "Ayuda a cruzar el río. Pisa las piedras con:",
  sort_two: "Lleva cada dibujo al planeta de su primer sonido.",
  trace_letter: "Sigue la estela con tu dedo:",
  echo_sequence: "Escúchame y repite en el mismo orden.",
  feed_animal: "Llévale al animal lo que empieza con:",
  puzzle: "Arma el rompecabezas. Busca la pieza con:",
  build_figure: "Arma la figura: lleva cada pieza al lugar de su letra.",
  slingshot: "Estira la resortera y lanza el ovillo a la torre con:",
  fishing: "Pesca los peces que suenan así:",
  rocket_race: "Guía el cohete hacia las estrellas con:",
  cooking: "Echa a la olla lo que empieza con:",
} as const;

/** Tipos en los que la consigna no va seguida de un sonido objetivo. */
export const SIN_SONIDO_INICIAL = new Set(["memory_pairs", "read_match", "odd_one", "sort_two", "echo_sequence", "build_figure"]);

/** Juegos donde lo que se elige es un dibujo (la retroalimentación nombra la palabra). */
export const ELIGE_DIBUJO = new Set(["picture_word", "read_match", "feed_animal", "sort_two", "cooking"]);
