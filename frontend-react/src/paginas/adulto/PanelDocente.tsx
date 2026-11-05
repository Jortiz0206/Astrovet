import { MarcoAdulto } from "../../componentes/MarcoAdulto";
import Icono, { type NombreIcono } from "../../componentes/Icono";
import Misi from "../../componentes/Misi";
import { useAutenticacion } from "../../contexto/Autenticacion";

const PROXIMO: [NombreIcono, string, string][] = [
  ["aula", "Crear aulas", "Cada aula tiene un código de invitación para las familias."],
  ["enlace", "Vinculación con autorización", "Solo el tutor decide si el perfil del niño entra a tu aula."],
  ["calendario", "Asignar misiones", "Elige las misiones que trabajará el grupo y sus fechas."],
  ["familia", "Sala de clase", "Cada niño toca su Capitán Misi y realiza la misión a su ritmo."],
  ["tablero", "Tablero del aula", "Estado, intentos, aciertos y ayudas por niño, actualizado cada 10 segundos."],
];

/** Espacio docente: el módulo completo es el incremento 4. */
export default function PanelDocente() {
  const { usuario } = useAutenticacion();
  return (
    <MarcoAdulto>
      <h1 className="text-3xl font-black">Mis aulas</h1>
      <p className="text-tinta-suave">Hola, {usuario?.nombre.split(" ")[0]}.</p>
      <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center ring-1 ring-celeste-oscuro">
        <Misi tamano={110} animo="piensa" />
        <p className="text-xl font-black">El módulo docente está en construcción</p>
        <p className="max-w-lg text-tinta-suave">
          Tu cuenta ya quedó creada. Cuando el módulo esté listo podrás crear aulas y trabajar las misiones con tu grupo.
        </p>
      </div>
      <h2 className="mt-8 text-lg font-black">Lo que podrás hacer</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {PROXIMO.map(([icono, titulo, texto]) => (
          <li key={titulo} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-celeste-oscuro">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lavanda-tenue text-lavanda-oscuro">
              <Icono nombre={icono} tamano={22} />
            </span>
            <span>
              <span className="block font-extrabold">{titulo}</span>
              <span className="block text-sm text-tinta-suave">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </MarcoAdulto>
  );
}
