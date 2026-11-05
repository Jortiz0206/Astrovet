import { useState, type FormEvent } from "react";
import Icono from "../../componentes/Icono";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MarcoCuenta } from "../../componentes/MarcoAdulto";
import { Alerta, Boton, Campo } from "../../componentes/ui";
import { useAutenticacion } from "../../contexto/Autenticacion";

/** CU-01 Registrarse como familia (tutor) o como docente. */
export default function Registro() {
  const { registrar } = useAutenticacion();
  const navegar = useNavigate();
  const [params, setParams] = useSearchParams();
  const rol = params.get("rol") === "docente" ? "teacher" : "tutor";

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const corta = contrasena.length > 0 && contrasena.length < 8;
  const noCoinciden = confirmar.length > 0 && confirmar !== contrasena;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (contrasena !== confirmar) {
      setError("Las contraseñas no son iguales.");
      return;
    }
    setCargando(true);
    try {
      await registrar({ nombre, correo, contrasena, rol, aceptaPolitica: acepta });
      navegar(rol === "tutor" ? "/tutor/perfil/nuevo?primero=1" : "/docente", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear la cuenta.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <MarcoCuenta>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-lavanda-tenue p-1" role="group" aria-label="Tipo de cuenta">
        {(
          [
            ["tutor", "Familia", "familia"],
            ["docente", "Docente", "docente"],
          ] as const
        ).map(([valor, texto, icono]) => {
          const activo = (valor === "docente") === (rol === "teacher");
          return (
            <button
              key={valor}
              type="button"
              aria-pressed={activo}
              onClick={() => setParams({ rol: valor }, { replace: true })}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl font-extrabold transition ${activo ? "bg-white text-lavanda-oscuro shadow" : "text-tinta-suave"}`}
            >
              <Icono nombre={icono} tamano={20} />
              {texto}
            </button>
          );
        })}
      </div>

      {rol === "tutor" ? (
        <ol className="mt-5 flex justify-center gap-2 text-sm font-bold" aria-label="Pasos del registro">
          <li className="rounded-full bg-lavanda-oscuro px-3 py-1 text-white" aria-current="step">
            1 · Tu cuenta
          </li>
          <li className="rounded-full bg-lavanda-tenue px-3 py-1 text-tinta-suave">2 · Perfil del niño</li>
        </ol>
      ) : null}

      <h1 className="mt-4 text-center text-2xl font-black">{rol === "tutor" ? "¡Comencemos esta aventura!" : "Crea tu cuenta docente"}</h1>
      <p className="mt-1 text-center text-tinta-suave">
        {rol === "tutor" ? "Esta cuenta es para el adulto responsable." : "Para usar AstroVet como apoyo en tu aula."}
      </p>

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-4" noValidate>
        {error ? <Alerta>{error}</Alerta> : null}
        <Campo id="nombre" etiqueta="Tu nombre" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <Campo id="correo" etiqueta="Correo electrónico" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <div className="relative">
          <Campo
            id="contrasena"
            etiqueta="Contraseña"
            type={mostrar ? "text" : "password"}
            autoComplete="new-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            error={corta}
            ayuda="Mínimo 8 caracteres."
            required
          />
          <button
            type="button"
            onClick={() => setMostrar(!mostrar)}
            aria-pressed={mostrar}
            className="absolute top-8 right-2 rounded-lg px-3 py-2 text-sm font-bold text-lavanda-oscuro hover:bg-lavanda-tenue"
          >
            {mostrar ? "Ocultar" : "Ver"}
          </button>
        </div>
        <Campo
          id="confirmar"
          etiqueta="Repite la contraseña"
          type={mostrar ? "text" : "password"}
          autoComplete="new-password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          error={noCoinciden}
          ayuda={noCoinciden ? "Todavía no son iguales." : confirmar && !noCoinciden ? "¡Son iguales!" : undefined}
          required
        />
        <label className="flex items-start gap-3 rounded-xl bg-lavanda-tenue p-3 text-sm">
          <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 size-5 accent-lavanda-oscuro" />
          <span>
            {rol === "tutor" ? "Soy el adulto responsable del niño y acepto " : "Acepto "}
            los términos de uso y la{" "}
            <Link to="/privacidad" target="_blank" className="font-bold text-lavanda-oscuro underline">
              política de tratamiento de datos
            </Link>
            .
          </span>
        </label>
        <Boton type="submit" cargando={cargando}>
          {rol === "tutor" ? "Continuar" : "Crear cuenta"}
          <Icono nombre="flecha-der" tamano={20} />
        </Boton>
      </form>
      <p className="mt-6 text-center text-sm text-tinta-suave">
        ¿Ya tienes cuenta?{" "}
        <Link to="/ingresar" className="font-extrabold text-lavanda-oscuro hover:underline">
          Ingresa
        </Link>
      </p>
    </MarcoCuenta>
  );
}
