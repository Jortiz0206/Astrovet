import { Route, Routes } from "react-router-dom";
import { RutaProtegida } from "./contexto/Autenticacion";
import FormPerfil from "./paginas/adulto/FormPerfil";
import Ingresar from "./paginas/adulto/Ingresar";
import PanelDocente from "./paginas/adulto/PanelDocente";
import PanelTutor from "./paginas/adulto/PanelTutor";
import Recuperar from "./paginas/adulto/Recuperar";
import Registro from "./paginas/adulto/Registro";
import CentroEspacial from "./paginas/juego/CentroEspacial";
import Clinica from "./paginas/juego/Clinica";
import Descanso from "./paginas/juego/Descanso";
import LayoutJuego from "./paginas/juego/LayoutJuego";
import Mapa from "./paginas/juego/Mapa";
import Mision from "./paginas/juego/Mision";
import Vestidor from "./paginas/juego/Vestidor";
import Landing from "./paginas/Landing";
import NoEncontrada from "./paginas/NoEncontrada";
import Privacidad from "./paginas/Privacidad";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/ingresar" element={<Ingresar />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/privacidad" element={<Privacidad />} />

      {/* Espacio del tutor */}
      <Route path="/tutor" element={<RutaProtegida rol="tutor"><PanelTutor /></RutaProtegida>} />
      <Route path="/tutor/perfil/nuevo" element={<RutaProtegida rol="tutor"><FormPerfil /></RutaProtegida>} />
      <Route path="/tutor/perfil/:id" element={<RutaProtegida rol="tutor"><FormPerfil /></RutaProtegida>} />

      {/* Espacio docente (incremento 4) */}
      <Route path="/docente" element={<RutaProtegida rol="teacher"><PanelDocente /></RutaProtegida>} />

      {/* Experiencia del niño: se entra con la sesión del tutor y un perfil elegido */}
      <Route path="/juego" element={<RutaProtegida rol="tutor"><LayoutJuego /></RutaProtegida>}>
        <Route index element={<CentroEspacial />} />
        <Route path="mapa" element={<Mapa />} />
        <Route path="mision/:id" element={<Mision />} />
        <Route path="vestidor" element={<Vestidor />} />
        <Route path="clinica" element={<Clinica />} />
        <Route path="descanso" element={<Descanso />} />
      </Route>

      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  );
}
