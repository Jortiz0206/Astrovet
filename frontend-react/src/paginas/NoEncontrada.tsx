import { Link } from "react-router-dom";
import Misi from "../componentes/Misi";

export default function NoEncontrada() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 cielo-noche px-4 text-center text-white">
      <Misi tamano={140} animo="piensa" />
      <h1 className="text-3xl font-black">Esta página se perdió en el espacio</h1>
      <Link to="/" className="rounded-2xl bg-dorado px-6 py-3 font-black text-tinta">
        Volver al inicio
      </Link>
    </div>
  );
}
