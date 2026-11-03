import { useState } from "react";
import "../styles/RegistroFamilia.css";

interface RegistroFamiliaProps {
  onVolver: () => void;
  onContinuar: () => void;
}

function RegistroFamilia({ onVolver, onContinuar }: RegistroFamiliaProps) {
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);

  const noCoinciden = confirmar.length > 0 && contrasena !== confirmar;
  const coinciden = confirmar.length > 0 && contrasena === confirmar;

  return (
    <main className="registro-familia">
      <div className="registro-cielo" aria-hidden="true">
        <span className="astro e1">⭐</span>
        <span className="astro e2">✨</span>
        <span className="astro e3">⭐</span>
        <span className="astro p1">🪐</span>
        <span className="astro p2">🌙</span>
      </div>

      <section className="registro-contenedor">
        <button className="registro-volver" type="button" onClick={onVolver}>
          <span aria-hidden="true">←</span> Volver
        </button>

        <div className="registro-cabecera">
          <img
            src="/logo-astrovet.png"
            alt="Logo de AstroVet"
            className="registro-logo"
          />
          <div className="registro-burbuja" aria-hidden="true">
            ¡Hola! Vamos paso a paso 🚀
          </div>
        </div>

        <ol className="registro-pasos" aria-label="Progreso del registro">
          <li className="paso activo" aria-current="step">
            <span>1</span> Tu cuenta
          </li>
          <li className="paso">
            <span>2</span> Perfil del niño
          </li>
        </ol>

        <p className="registro-etiqueta">👨‍👩‍👧 Registro para familias</p>

        <h1>¡Comencemos esta aventura!</h1>

        <p className="registro-descripcion">
          Crea tu cuenta para acompañar el aprendizaje de tu pequeño.
        </p>

        <form
          className="registro-formulario"
          onSubmit={(e) => {
            e.preventDefault();
            if (contrasena !== confirmar) return;
            onContinuar();
          }}
        >
          <div className="campo">
            <label htmlFor="nombre">
              <span aria-hidden="true">🙂</span> Tu nombre
            </label>
            <input
              id="nombre"
              type="text"
              placeholder="Escribe tu nombre"
              autoComplete="name"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="correo">
              <span aria-hidden="true">✉️</span> Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="contrasena">
              <span aria-hidden="true">🔑</span> Contraseña
            </label>
            <div className="campo-password">
              <input
                id="contrasena"
                type={mostrar ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                autoComplete="new-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <button
                type="button"
                className="registro-ojo"
                onClick={() => setMostrar(!mostrar)}
                aria-pressed={mostrar}
              >
                {mostrar ? "🙈 Ocultar" : "👁️ Ver"}
              </button>
            </div>
          </div>

          <div className="campo">
            <label htmlFor="confirmar">
              <span aria-hidden="true">🔁</span> Repite la contraseña
            </label>
            <input
              id="confirmar"
              type={mostrar ? "text" : "password"}
              placeholder="Escríbela otra vez"
              minLength={8}
              autoComplete="new-password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              aria-invalid={noCoinciden}
              aria-describedby="ayuda-confirmar"
              required
            />
            <p
              id="ayuda-confirmar"
              role="status"
              className={`campo-ayuda ${
                noCoinciden ? "error" : coinciden ? "ok" : ""
              }`}
            >
              {noCoinciden && "Las contraseñas no son iguales todavía."}
              {coinciden && "¡Muy bien! Son iguales. ✅"}
            </p>
          </div>

          <label className="registro-autorizacion">
            <input type="checkbox" required />
            <span>
              Soy adulto responsable y acepto los términos y la política
              de tratamiento de datos.
            </span>
          </label>

          <button className="registro-boton" type="submit">
            Continuar <span aria-hidden="true">🚀</span>
          </button>
        </form>

        <p className="registro-nota">
          💡 Esta cuenta es para el adulto responsable. El perfil del niño
          se crea en el siguiente paso.
        </p>
      </section>
    </main>
  );
}

export default RegistroFamilia;
