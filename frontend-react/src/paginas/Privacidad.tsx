import { Link } from "react-router-dom";
import Marca from "../componentes/Marca";

/** Borrador: el texto definitivo debe revisarlo un abogado antes del lanzamiento (sección 18.2). */
export default function Privacidad() {
  return (
    <div className="min-h-svh bg-white">
      <header className="border-b border-lavanda-tenue">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Marca />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-tinta">
        <p className="inline-block rounded-full bg-dorado-claro px-3 py-1 text-xs font-extrabold text-[#8a6212]">Borrador · versión 0.1</p>
        <h1 className="mt-3 text-3xl font-black">Política de tratamiento de datos</h1>
        <p className="mt-4 text-tinta-suave">
          Este texto es un borrador para el prototipo. Antes de operar con usuarios reales se publicará la versión definitiva, revisada
          jurídicamente, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.
        </p>
        <h2 className="mt-8 text-xl font-black">Qué datos recogemos</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Del adulto: nombre, correo y contraseña (guardada cifrada).</li>
          <li>Del niño: solo un apodo, la edad si el adulto quiere darla y la configuración de su sesión.</li>
          <li>De las sesiones: actividades realizadas, intentos, tiempos de respuesta, ayudas y repeticiones del audio.</li>
        </ul>
        <h2 className="mt-8 text-xl font-black">Para qué</h2>
        <p className="mt-2">Para que el niño juegue y para que su tutor (y, si este lo autoriza, su docente) consulte información descriptiva del proceso. AstroVet no emite diagnósticos.</p>
        <h2 className="mt-8 text-xl font-black">Tus derechos</h2>
        <p className="mt-2">Puedes consultar, corregir y eliminar los datos. Desde tu espacio puedes eliminar un perfil con todos sus registros.</p>
        <Link to="/" className="mt-10 inline-block font-extrabold text-lavanda-oscuro hover:underline">
          Volver al inicio
        </Link>
      </main>
    </div>
  );
}
