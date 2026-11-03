
import { useState } from "react";
import "./App.css";

import Landing from "./pages/Landing";
import RegistroFamilia from "./pages/RegistroFamilia";
import PerfilNino from "./pages/PerfilNino";
import CapitanMisi from "./components/CapitanMisi";

type Pantalla =
  | "landing"
  | "registroFamilia"
  | "perfilNino"
  | "inicio"
  | "perfiles"
  | "mundos"
  | "vocales"
  | "aventura";

type Perfil = {
  id: number;
  nombre: string;
  edad?: number;
  avatar?: string;
};

type Mundo = {
  id: number;
  nombre: string;
  descripcion: string;
  nivel: string;
  emoji: string;
};

type PreguntaVocal = {
  vocal: string;
  opciones: string[];
  respuesta: string;
};

const perfilesIniciales: Perfil[] = [
  { id: 1, nombre: "Mariana", avatar: "🦄" },
  { id: 2, nombre: "Johanna", avatar: "🐱" },
];

const mundos: Mundo[] = [
  {
    id: 1,
    nombre: "Planeta de las vocales",
    descripcion: "Descubre los sonidos de las vocales.",
    nivel: "Inicial",
    emoji: "🪐",
  },
  {
    id: 2,
    nombre: "Bosque de las sílabas",
    descripcion: "Explora nuevos sonidos y aprende sílabas.",
    nivel: "Exploración",
    emoji: "🌳",
  },
  {
    id: 3,
    nombre: "Clínica de palabras",
    descripcion: "Ayuda a Capitán Misi a descubrir palabras.",
    nivel: "Aventura",
    emoji: "🩺",
  },
];

const preguntasVocales: PreguntaVocal[] = [
  { vocal: "A", opciones: ["AVIÓN", "MESA", "SOL"], respuesta: "AVIÓN" },
  { vocal: "E", opciones: ["CASA", "ESTRELLA", "LUNA"], respuesta: "ESTRELLA" },
  { vocal: "I", opciones: ["PATO", "ISLA", "NUBE"], respuesta: "ISLA" },
  { vocal: "O", opciones: ["OSO", "GATO", "TREN"], respuesta: "OSO" },
  { vocal: "U", opciones: ["FLOR", "PEZ", "UVA"], respuesta: "UVA" },
];

// Dibujos de apoyo para facilitar el reconocimiento de las palabras.
const dibujos: Record<string, string> = {
  AVIÓN: "✈️",
  MESA: "🪑",
  SOL: "☀️",
  CASA: "🏠",
  ESTRELLA: "⭐",
  LUNA: "🌙",
  PATO: "🦆",
  ISLA: "🏝️",
  NUBE: "☁️",
  OSO: "🐻",
  GATO: "🐱",
  TREN: "🚆",
  FLOR: "🌸",
  PEZ: "🐟",
  UVA: "🍇",
};

// Reproduce instrucciones y palabras en voz alta.
function hablar(texto: string): boolean {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  const mensaje = new SpeechSynthesisUtterance(texto);
  mensaje.lang = "es-CO";
  mensaje.rate = 0.85;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(mensaje);

  return true;
}

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("landing");

  const [perfiles, setPerfiles] = useState<Perfil[]>(perfilesIniciales);

  const [perfilSeleccionado, setPerfilSeleccionado] =
    useState<Perfil | null>(null);

  const [mundoSeleccionado, setMundoSeleccionado] =
    useState<Mundo | null>(null);

  const [indicePregunta, setIndicePregunta] = useState(0);
  const [puntos, setPuntos] = useState(0);

  const [respuestaSeleccionada, setRespuestaSeleccionada] =
    useState<string | null>(null);

  const [juegoTerminado, setJuegoTerminado] = useState(false);

  const preguntaActual = preguntasVocales[indicePregunta];

  const acerto = respuestaSeleccionada === preguntaActual.respuesta;

  // Mensaje de Capitán Misi según el momento de la actividad.
  const mensajeMisi =
    respuestaSeleccionada === null
      ? `¡Vamos, ${perfilSeleccionado?.nombre}! Escucha con atención y encuentra la palabra que comienza con la vocal ${preguntaActual.vocal}.`
      : acerto
        ? `¡Excelente, ${perfilSeleccionado?.nombre}! ¡Lo hiciste muy bien! Ganaste una estrella. Sigamos nuestra aventura.`
        : `¡No te preocupes, ${perfilSeleccionado?.nombre}! Inténtalo otra vez. Busca una palabra que comience con la vocal ${preguntaActual.vocal}. ¡Yo sé que puedes!`;

  const estrellas =
    "⭐".repeat(puntos) +
    "☆".repeat(preguntasVocales.length - puntos);

  // El progreso avanza cuando se responde correctamente.
  const porcentaje = juegoTerminado
    ? 100
    : ((indicePregunta +
        (respuestaSeleccionada === preguntaActual.respuesta ? 1 : 0)) /
        preguntasVocales.length) *
      100;

  // CREAR PERFIL DEL NIÑO
  function crearPerfilNino(perfil: {
    nombre: string;
    edad: number;
    avatar: string;
  }) {
    const nuevoPerfil: Perfil = {
      id: Date.now(),
      nombre: perfil.nombre,
      edad: perfil.edad,
      avatar: perfil.avatar,
    };

    setPerfiles((actuales) => [...actuales, nuevoPerfil]);
    setPerfilSeleccionado(nuevoPerfil);
    setPantalla("mundos");
  }

  // SELECCIONAR PERFIL
  function seleccionarPerfil(perfil: Perfil) {
    setPerfilSeleccionado(perfil);
    setPantalla("mundos");
  }

  // SELECCIONAR MUNDO
  function seleccionarMundo(mundo: Mundo) {
    setMundoSeleccionado(mundo);

    if (mundo.id === 1) {
      reiniciarJuego();
      setPantalla("vocales");
    } else {
      setPantalla("aventura");
    }
  }

  // RESPONDER PREGUNTA
  function responder(palabra: string) {
    if (respuestaSeleccionada !== null || juegoTerminado) {
      return;
    }

    setRespuestaSeleccionada(palabra);
    hablar(palabra.toLowerCase());

    if (palabra === preguntaActual.respuesta) {
      setPuntos((actual) => actual + 1);
    }
  }

  // ESCUCHAR INSTRUCCIÓN
  function escucharInstruccion() {
    const ok = hablar(
      `Busca la palabra que comienza con la vocal ${preguntaActual.vocal}`
    );

    if (!ok) {
      alert("Tu navegador no permite reproducir instrucciones habladas.");
    }
  }

  // SIGUIENTE PREGUNTA
  function siguientePregunta() {
    if (!acerto) {
      setRespuestaSeleccionada(null);
      return;
    }

    if (indicePregunta === preguntasVocales.length - 1) {
      setJuegoTerminado(true);
    } else {
      setIndicePregunta((actual) => actual + 1);
      setRespuestaSeleccionada(null);
    }
  }

  // REINICIAR JUEGO
  function reiniciarJuego() {
    setIndicePregunta(0);
    setPuntos(0);
    setRespuestaSeleccionada(null);
    setJuegoTerminado(false);
  }

  // VOLVER AL MAPA DE MUNDOS
  function volverAlMapa() {
    window.speechSynthesis?.cancel();
    setPantalla("mundos");
  }

  // VOLVER AL INICIO
  function volverAlInicio() {
    window.speechSynthesis?.cancel();

    setPerfilSeleccionado(null);
    setMundoSeleccionado(null);

    reiniciarJuego();
    setPantalla("inicio");
  }

  return (
    <>
      {/* PÁGINA DE BIENVENIDA */}
      {pantalla === "landing" && (
        <Landing
          onFamiliaClick={() => setPantalla("registroFamilia")}
          onDocenteClick={() =>
            alert("El acceso para docentes lo construiremos próximamente.")
          }
        />
      )}

      {/* REGISTRO DEL ADULTO RESPONSABLE */}
      {pantalla === "registroFamilia" && (
        <RegistroFamilia
          onVolver={() => setPantalla("landing")}
          onContinuar={() => setPantalla("perfilNino")}
        />
      )}

      {/* CREACIÓN DEL PERFIL DEL NIÑO */}
      {pantalla === "perfilNino" && (
        <PerfilNino
          onVolver={() => setPantalla("registroFamilia")}
          onContinuar={crearPerfilNino}
        />
      )}

      {/* APLICACIÓN PRINCIPAL */}
      {(pantalla === "inicio" ||
        pantalla === "perfiles" ||
        pantalla === "mundos" ||
        pantalla === "vocales" ||
        pantalla === "aventura") && (
        <main className="inicio">
          {/* DECORACIÓN DEL ESPACIO */}
          <div className="cielo" aria-hidden="true">
            <span className="astro e1">⭐</span>
            <span className="astro e2">✨</span>
            <span className="astro e3">⭐</span>
            <span className="astro p1">🪐</span>
            <span className="astro p2">🌙</span>
            <span className="astro p3">☁️</span>
          </div>

          <section className="bienvenida">
            {/* INICIO */}
            {pantalla === "inicio" && (
              <>
                <img
                  src="/logo-astrovet.png"
                  alt="Logo oficial de AstroVet con Capitán Misi"
                  className="logo-astrovet"
                />

                <h1>¡Bienvenidos a AstroVet!</h1>

                <h2>Jugando hoy, leyendo mañana</h2>

                <p>
                  Acompaña a Capitán Misi en una aventura llena de
                  sonidos, descubrimientos y aprendizaje.
                </p>

                <button
                  className="boton-principal"
                  onClick={() => setPantalla("perfiles")}
                >
                  Comenzar aventura 🚀
                </button>

                <button
                  className="boton-volver"
                  onClick={() => setPantalla("landing")}
                >
                  ← Volver a la página principal
                </button>
              </>
            )}

            {/* SELECCIÓN DE PERFIL */}
            {pantalla === "perfiles" && (
              <>
                <h1>¿Quién va a jugar hoy?</h1>

                <h2>Toca tu perfil</h2>

                <p>Capitán Misi está listo para acompañarte.</p>

                <div className="perfiles">
                  {perfiles.map((perfil) => (
                    <button
                      className="tarjeta-perfil"
                      key={perfil.id}
                      onClick={() => seleccionarPerfil(perfil)}
                    >
                      <span className="avatar-perfil" aria-hidden="true">
                        {perfil.avatar ?? "🚀"}
                      </span>

                      <span className="nombre-perfil">{perfil.nombre}</span>
                    </button>
                  ))}
                </div>

                <button
                  className="boton-volver"
                  onClick={() => setPantalla("inicio")}
                >
                  ← Volver
                </button>
              </>
            )}

            {/* SELECCIÓN DE MUNDOS */}
            {pantalla === "mundos" && (
              <>
                <h1>
                  ¡Hola, {perfilSeleccionado?.nombre}!{" "}
                  {perfilSeleccionado?.avatar}
                </h1>

                <h2>Elige tu mundo de aventura</h2>

                <p>Capitán Misi te acompañará en cada misión.</p>

                <CapitanMisi
                  mensaje={`¡Hola, ${perfilSeleccionado?.nombre}! Elige tu mundo y vamos a vivir una gran aventura.`}
                />

                <div className="mundos">
                  {mundos.map((mundo) => (
                    <button
                      className={`tarjeta-mundo mundo-${mundo.id}`}
                      key={mundo.id}
                      onClick={() => seleccionarMundo(mundo)}
                    >
                      <span className="mundo-emoji" aria-hidden="true">
                        {mundo.emoji}
                      </span>

                      <span className="nivel">{mundo.nivel}</span>

                      <h3>{mundo.nombre}</h3>

                      <p>{mundo.descripcion}</p>
                    </button>
                  ))}
                </div>

                <button className="boton-volver" onClick={volverAlInicio}>
                  ← Cambiar perfil
                </button>
              </>
            )}

            {/* PLANETA DE LAS VOCALES */}
            {pantalla === "vocales" && (
              <>
                {!juegoTerminado ? (
                  <>
                    <h1>🪐 Planeta de las vocales</h1>

                    {/* CAPITÁN MISI ACOMPAÑA LA ACTIVIDAD */}
                    <CapitanMisi mensaje={mensajeMisi} />

                    <div
                      className="barra-progreso"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(porcentaje)}
                      aria-label={`Progreso: ${Math.round(porcentaje)} por ciento`}
                    >
                      <div
                        className="barra-relleno"
                        style={{ width: `${porcentaje}%` }}
                      />

                      <span className="barra-texto">
                        Misión {indicePregunta + 1} de{" "}
                        {preguntasVocales.length}
                      </span>
                    </div>

                    <div className="progreso-juego">
                      <p>Tu misión es encontrar una palabra.</p>

                      <span className="vocal-destacada">
                        {preguntaActual.vocal}
                      </span>
                    </div>

                    <button
                      className="boton-audio"
                      onClick={escucharInstruccion}
                    >
                      🔊 Escuchar instrucción
                    </button>

                    <h2>¿Qué palabra comienza con esta vocal?</h2>

                    <div className="opciones-palabra">
                      {preguntaActual.opciones.map((palabra) => (
                        <button
                          className={`tarjeta-palabra ${
                            respuestaSeleccionada !== null &&
                            palabra === preguntaActual.respuesta
                              ? "correcta"
                              : respuestaSeleccionada === palabra
                                ? "incorrecta"
                                : ""
                          }`}
                          key={palabra}
                          disabled={respuestaSeleccionada !== null}
                          onClick={() => responder(palabra)}
                        >
                          <span className="palabra-dibujo" aria-hidden="true">
                            {dibujos[palabra]}
                          </span>

                          <span className="palabra-texto">{palabra}</span>
                        </button>
                      ))}
                    </div>

                    {/* MENSAJE DE RESPUESTA */}
                    {respuestaSeleccionada !== null && (
                      <div
                        className={`mensaje-respuesta ${
                          acerto ? "ok" : "intento"
                        }`}
                        role="status"
                      >
                        {acerto ? (
                          <>
                            <h2>🎉 ¡Muy bien! Respuesta correcta.</h2>
                            <p>¡Ganaste una estrella!</p>
                          </>
                        ) : (
                          <>
                            <h2>💪 ¡Vamos a intentarlo otra vez!</h2>
                            <p>
                              Busca la palabra que comienza con{" "}
                              <strong>{preguntaActual.vocal}</strong>.
                            </p>
                          </>
                        )}

                        <button
                          className="boton-principal"
                          onClick={siguientePregunta}
                        >
                          {acerto
                            ? indicePregunta === preguntasVocales.length - 1
                              ? "Ver resultado 🏆"
                              : "Siguiente misión ➡️"
                            : "Intentar de nuevo 🔄"}
                        </button>
                      </div>
                    )}

                    <p
                      className="puntos"
                      aria-label={`Puntos obtenidos: ${puntos}`}
                    >
                      {estrellas}
                    </p>
                  </>
                ) : (
                  <>
                    <h1>🏆 ¡Misión completada!</h1>

                    <CapitanMisi
                      mensaje={`¡Lo lograste, ${perfilSeleccionado?.nombre}! Terminaste el Planeta de las vocales. Estoy muy orgulloso de tu esfuerzo.`}
                    />

                    <h2>Terminaste el Planeta de las vocales.</h2>

                    <p className="puntos-final">{estrellas}</p>

                    <h2>
                      {puntos} de {preguntasVocales.length} estrellas
                    </h2>

                    <p>
                      Sigue practicando y aprendiendo con Capitán Misi.
                    </p>

                    <button
                      className="boton-principal"
                      onClick={reiniciarJuego}
                    >
                      Volver a jugar 🔄
                    </button>
                  </>
                )}

                <button className="boton-volver" onClick={volverAlMapa}>
                  ← Volver a los mundos
                </button>
              </>
            )}

            {/* OTROS MUNDOS */}
            {pantalla === "aventura" && (
              <>
                <h1>
                  {mundoSeleccionado?.emoji} {mundoSeleccionado?.nombre}
                </h1>

                <h2>¡Una nueva misión te espera!</h2>

                <p>
                  Capitán Misi está preparando una aventura para ti. ¡Muy
                  pronto podrás explorarla!
                </p>

                <button className="boton-volver" onClick={volverAlMapa}>
                  ← Volver a los mundos
                </button>
              </>
            )}
          </section>
        </main>
      )}
    </>
  );
}

export default App;
