import { useState } from "react";
import { Link } from "react-router-dom";
import Misi from "./Misi";

/** Logo de AstroVet. Si la imagen no carga, muestra a Misi dibujado. */
export default function Marca({ tamano = 44, conTexto = true, claro = false }: { tamano?: number; conTexto?: boolean; claro?: boolean }) {
  const [falla, setFalla] = useState(false);
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="AstroVet, ir al inicio">
      {falla ? (
        <Misi tamano={tamano} titulo="" />
      ) : (
        <img
          src="/logo-astrovet.webp"
          alt=""
          width={tamano}
          height={tamano}
          className="rounded-full object-cover"
          style={{ width: tamano, height: tamano }}
          onError={() => setFalla(true)}
        />
      )}
      {conTexto ? <span className={`text-xl font-black tracking-tight ${claro ? "text-white" : "text-lavanda-oscuro"}`}>AstroVet</span> : null}
    </Link>
  );
}
