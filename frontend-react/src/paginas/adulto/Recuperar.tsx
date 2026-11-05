import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MarcoCuenta } from "../../componentes/MarcoAdulto";
import { Alerta, Boton, Campo } from "../../componentes/ui";
import * as api from "../../servicios/api";

/** CU-16: siempre muestra el mismo mensaje, exista o no la cuenta. */
export default function Recuperar() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    await api.solicitarRecuperacion(correo);
    setCargando(false);
    setEnviado(true);
  }

  return (
    <MarcoCuenta>
      <h1 className="text-center text-2xl font-black">Recuperar contraseña</h1>
      {enviado ? (
        <div className="mt-6 flex flex-col gap-4">
          <Alerta tipo="ok">Si el correo está registrado, recibirás un enlace para crear una contraseña nueva. El enlace vence en 30 minutos.</Alerta>
          <p className="text-sm text-tinta-suave">En este prototipo no se envían correos: el envío real llega con el backend.</p>
          <Link to="/ingresar" className="text-center font-extrabold text-lavanda-oscuro hover:underline">
            Volver a ingresar
          </Link>
        </div>
      ) : (
        <form onSubmit={enviar} className="mt-6 flex flex-col gap-4">
          <p className="text-tinta-suave">Escribe el correo de tu cuenta y te enviaremos un enlace.</p>
          <Campo id="correo" etiqueta="Correo electrónico" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          <Boton type="submit" cargando={cargando}>
            Enviar enlace
          </Boton>
          <Link to="/ingresar" className="text-center text-sm font-bold text-lavanda-oscuro hover:underline">
            Volver
          </Link>
        </form>
      )}
    </MarcoCuenta>
  );
}
