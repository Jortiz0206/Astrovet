import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { ProveedorAutenticacion } from "./contexto/Autenticacion";
import { ProveedorJuego } from "./contexto/Juego";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorAutenticacion>
        <ProveedorJuego>
          <App />
        </ProveedorJuego>
      </ProveedorAutenticacion>
    </BrowserRouter>
  </StrictMode>,
);
