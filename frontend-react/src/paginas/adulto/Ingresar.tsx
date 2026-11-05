import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MarcoCuenta } from "../../componentes/MarcoAdulto";
import { Alerta, Boton, Campo } from "../../componentes/ui";
import { inicioDeRol, useAutenticacion } from "../../contexto/Autenticacion";

export default function Ingresar() {
  const { ingresar } = useAutenticacion();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const u = await ingresar(correo, contrasena);
      const volver = params.get("volver");
      navegar(volver && volver.startsWith("/") && !volver.startsWith("//") ? volver : inicioDeRol(u.rol), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos ingresar.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <MarcoCuenta>
      <h1 className="text-center text-2xl font-black">Ingresar a AstroVet</h1>
      <p className="mt-1 text-center text-tinta-suave">Para familias y docentes.</p>
      <form onSubmit={enviar} className="mt-6 flex flex-col gap-4" noValidate>
        {error ? <Alerta>{error}</Alerta> : null}
        <Campo id="correo" etiqueta="Correo electrónico" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <Campo
          id="contrasena"
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        <Link to="/recuperar" className="-mt-1 self-end text-sm font-bold text-lavanda-oscuro hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
        <Boton type="submit" cargando={cargando} className="mt-1">
          Ingresar
        </Boton>
      </form>
      <p className="mt-6 text-center text-sm text-tinta-suave">
        ¿No tienes cuenta?{" "}
        <Link to="/registro" className="font-extrabold text-lavanda-oscuro hover:underline">
          Crear cuenta
        </Link>
      </p>
      <div className="mt-6 rounded-2xl bg-dorado-claro p-4 text-sm text-tinta">
        <p className="font-extrabold">Cuentas de prueba (prototipo)</p>
        <p className="mt-1">
          Familia: <code className="font-bold">familia@astrovet.demo</code>
          <br />
          Docente: <code className="font-bold">docente@astrovet.demo</code>
          <br />
          Contraseña: <code className="font-bold">astrovet123</code>
        </p>
      </div>
    </MarcoCuenta>
  );
}
