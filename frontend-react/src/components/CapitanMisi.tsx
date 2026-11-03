import { useEffect, useState } from "react";
import "../styles/CapitanMisi.css";

interface CapitanMisiProps {
  mensaje: string;
}

function CapitanMisi({ mensaje }: CapitanMisiProps) {
  const [hablando, setHablando] = useState(false);

  // Si se cierra la pantalla, se corta la voz
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function escucharMensaje() {
    if (!("speechSynthesis" in window)) {
      alert("Tu navegador no permite reproducir voz.");
      return;
    }

    const voz = new SpeechSynthesisUtterance(mensaje);
    voz.lang = "es-CO";
    voz.rate = 0.85;
    voz.onstart = () => setHablando(true);
    voz.onend = () => setHablando(false);
    voz.onerror = () => setHablando(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(voz);
  }

  return (
    <div className={`capitan-misi ${hablando ? "hablando" : ""}`}>
      {/* Cara de Capitán Misi (recorte del logo) */}
      <div
        className="capitan-cara"
        role="img"
        aria-label="Capitán Misi, el gatito astronauta"
      />

      <div className="capitan-mensaje" role="status">
        <p>{mensaje}</p>

        <button
          type="button"
          className="boton-audio capitan-boton"
          onClick={escucharMensaje}
        >
          <span aria-hidden="true">{hablando ? "🔊" : "▶️"}</span>{" "}
          {hablando ? "Escuchando…" : "Escuchar de nuevo"}
        </button>
      </div>
    </div>
  );
}

export default CapitanMisi;