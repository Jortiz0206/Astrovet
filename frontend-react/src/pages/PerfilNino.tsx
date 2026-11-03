import { useState } from "react";
import "../styles/PerfilNino.css";

interface PerfilNinoProps {
  onVolver: () => void;
  onContinuar: (perfil: {
    nombre: string;
    edad: number;
    avatar: string;
  }) => void;
}

// Animales exploradores: cada uno viene de un planeta distinto
const avatares = [
  { emoji: "🐱", nombre: "Gato de Marte", planeta: "🔴" },
  { emoji: "🦄", nombre: "Unicornio de Venus", planeta: "🟡" },
  { emoji: "🐙", nombre: "Pulpo de Neptuno", planeta: "🔵" },
  { emoji: "🦉", nombre: "Búho de Saturno", planeta: "🪐" },
  { emoji: "🦊", nombre: "Zorro de la Luna", planeta: "🌙" },
  { emoji: "🐲", nombre: "Dragón de Júpiter", planeta: "🟠" },
  { emoji: "🐢", nombre: "Tortuga de la Tierra", planeta: "🌍" },
  { emoji: "🐸", nombre: "Rana de Urano", planeta: "🟢" },
];
const edades = [4, 5, 6, 7, 8, 9, 10, 11, 12];

function PerfilNino({ onVolver, onContinuar }: PerfilNinoProps) {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState<number | null>(null);
  const [avatar, setAvatar] = useState(avatares[0].emoji);

  const avatarActual =
    avatares.find((a) => a.emoji === avatar) ?? avatares[0];

  const guardarPerfil = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (edad === null) return;

    onContinuar({
      nombre: nombre.trim(),
      edad,
      avatar,
    });
  };

  return (
    <main className="perfil-nino">
      <div className="perfil-cielo" aria-hidden="true">
        <span className="astro e1">⭐</span>
        <span className="astro e2">✨</span>
        <span className="astro e3">⭐</span>
        <span className="astro p1">🪐</span>
        <span className="astro p2">🌙</span>
      </div>

      <section className="perfil-contenedor">
        <button className="perfil-volver" type="button" onClick={onVolver}>
          <span aria-hidden="true">←</span> Volver
        </button>

        <ol className="perfil-pasos" aria-label="Progreso del registro">
          <li className="paso hecho">
            <span>✓</span> Tu cuenta
          </li>
          <li className="paso activo" aria-current="step">
            <span>2</span> Perfil del niño
          </li>
        </ol>

        {/* Vista previa: el niño ve cómo queda su perfil */}
        <div className="perfil-presentacion" aria-live="polite">
          <span className="perfil-presentacion-avatar" aria-hidden="true">
            {avatar}
            <span className="perfil-presentacion-planeta">
              {avatarActual.planeta}
            </span>
          </span>
          <p>¡Hola, {nombre.trim() || "explorador"}!</p>
          <small>Eres el {avatarActual.nombre}. ¡Tu aventura va a comenzar!</small>
        </div>

        <div className="perfil-cabecera">
          <h1>¡Vamos a crear tu perfil!</h1>
          <p>Capitán Misi quiere conocerte para comenzar la aventura.</p>
        </div>

        <form onSubmit={guardarPerfil} className="perfil-formulario">
          {/* 1. NOMBRE */}
          <div className="perfil-campo">
            <label htmlFor="nombre-nino">
              <span className="num">1</span> ¿Cómo te llamas?
            </label>
            <input
              id="nombre-nino"
              type="text"
              placeholder="Escribe tu nombre o apodo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={30}
              autoComplete="off"
              required
            />
          </div>

          {/* 2. EDAD */}
          <fieldset className="perfil-campo">
            <legend>
              <span className="num">2</span> ¿Cuántos años tienes?
            </legend>

            <div className="perfil-edades" role="group">
              {edades.map((numero) => (
                <button
                  key={numero}
                  type="button"
                  className={`perfil-edad ${edad === numero ? "seleccionado" : ""}`}
                  onClick={() => setEdad(numero)}
                  aria-pressed={edad === numero}
                  aria-label={`${numero} años`}
                >
                  {numero}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 3. AVATAR */}
          <fieldset className="perfil-campo">
            <legend>
              <span className="num">3</span> ¡Elige tu compañero de aventura!
            </legend>

            <div className="perfil-avatares" role="group">
              {avatares.map((opcion) => (
                <button
                  key={opcion.emoji}
                  type="button"
                  className={`perfil-avatar ${
                    avatar === opcion.emoji ? "seleccionado" : ""
                  }`}
                  onClick={() => setAvatar(opcion.emoji)}
                  aria-pressed={avatar === opcion.emoji}
                  aria-label={`Elegir ${opcion.nombre}`}
                >
                  <span className="perfil-avatar-planeta" aria-hidden="true">
                    {opcion.planeta}
                  </span>
                  <span className="perfil-avatar-emoji" aria-hidden="true">
                    {opcion.emoji}
                  </span>
                  <span className="perfil-avatar-nombre">{opcion.nombre}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <button
            className="perfil-continuar"
            type="submit"
            disabled={!nombre.trim() || edad === null}
          >
            Crear mi perfil <span aria-hidden="true">🚀</span>
          </button>

          {(!nombre.trim() || edad === null) && (
            <p className="perfil-ayuda" role="status">
              {!nombre.trim()
                ? "Escribe tu nombre para continuar."
                : "Toca tu edad para continuar."}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

export default PerfilNino;