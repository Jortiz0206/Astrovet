import type { ColorPelaje } from "../tipos";

// Capitán Misi dibujado en SVG para poder cambiar el color de pelaje
// (RF-05). Es una ilustración provisional: cuando estén las ilustraciones
// propias se reemplaza el contenido del SVG sin cambiar las props.

export type AnimoMisi = "feliz" | "habla" | "duerme" | "piensa";

interface Paleta {
  base: string;
  sombra: string;
  borde: string;
  ojos: string;
}

const PALETAS: Record<ColorPelaje, Paleta> = {
  naranja: { base: "#F4A261", sombra: "#DB8443", borde: "#7A4420", ojos: "#2B2440" },
  gris: { base: "#BDB9CC", sombra: "#9590A8", borde: "#4E4964", ojos: "#2B2440" },
  negro: { base: "#3D3653", sombra: "#2B2540", borde: "#17132A", ojos: "#FFD166" },
  blanco: { base: "#FFFFFF", sombra: "#E7E2F1", borde: "#7F7799", ojos: "#2B2440" },
  atigrado: { base: "#F2B661", sombra: "#C77B2E", borde: "#74431B", ojos: "#2B2440" },
  tricolor: { base: "#FFFFFF", sombra: "#E7E2F1", borde: "#6E6688", ojos: "#2B2440" },
};

export const NOMBRES_PELAJE: Record<ColorPelaje, string> = {
  naranja: "Naranja",
  gris: "Gris",
  negro: "Negro",
  blanco: "Blanco",
  atigrado: "Atigrado",
  tricolor: "Tricolor",
};

interface MisiProps {
  pelaje?: ColorPelaje;
  animo?: AnimoMisi;
  tamano?: number;
  className?: string;
  titulo?: string;
}

export default function Misi({ pelaje = "naranja", animo = "feliz", tamano = 120, className = "", titulo }: MisiProps) {
  const p = PALETAS[pelaje];
  const duerme = animo === "duerme";
  return (
    <svg
      viewBox="0 0 200 200"
      width={tamano}
      height={tamano}
      className={className}
      role="img"
      aria-label={titulo ?? `Capitán Misi, gato astronauta de pelaje ${NOMBRES_PELAJE[pelaje].toLowerCase()}`}
    >
      {/* Traje y cuello del traje */}
      <path d="M38 196 C40 150 70 140 100 140 C130 140 160 150 162 196 Z" fill="#F4F1FB" stroke="#5E4E9A" strokeWidth="5" />
      <path d="M62 150 C80 162 120 162 138 150" fill="none" stroke="#8E7CC3" strokeWidth="9" strokeLinecap="round" />
      {/* Insignia veterinaria */}
      <circle cx="100" cy="176" r="14" fill="#FFD166" stroke="#5E4E9A" strokeWidth="4" />
      <path d="M100 168 V184 M92 176 H108" stroke="#E58C86" strokeWidth="5" strokeLinecap="round" />

      {/* Orejas */}
      <path d="M48 78 L58 22 L94 56 Z" fill={p.base} stroke={p.borde} strokeWidth="5" strokeLinejoin="round" />
      <path d="M152 78 L142 22 L106 56 Z" fill={p.base} stroke={p.borde} strokeWidth="5" strokeLinejoin="round" />
      <path d="M60 64 L64 38 L82 56 Z" fill="#FFB7B2" />
      <path d="M140 64 L136 38 L118 56 Z" fill="#FFB7B2" />
      {pelaje === "tricolor" && <path d="M48 78 L58 22 L94 56 Z" fill="#F4A261" stroke={p.borde} strokeWidth="5" strokeLinejoin="round" />}

      {/* Cabeza */}
      <ellipse cx="100" cy="98" rx="62" ry="54" fill={p.base} stroke={p.borde} strokeWidth="5" />
      {pelaje === "atigrado" && (
        <g stroke={p.sombra} strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M100 48 V64" />
          <path d="M84 52 L88 66" />
          <path d="M116 52 L112 66" />
          <path d="M42 96 H56" />
          <path d="M144 96 H158" />
        </g>
      )}
      {pelaje === "tricolor" && (
        <>
          <path d="M120 50 C150 52 162 80 160 100 C146 96 128 82 120 50 Z" fill="#3D3653" />
          <path d="M44 112 C50 132 66 144 80 148 C78 130 62 116 44 112 Z" fill="#F4A261" />
        </>
      )}
      {/* Hocico */}
      <ellipse cx="100" cy="116" rx="30" ry="21" fill={pelaje === "negro" ? "#4B4363" : "#FFF8EE"} />

      {/* Ojos */}
      {duerme ? (
        <g stroke={p.borde} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M66 94 Q76 102 86 94" />
          <path d="M114 94 Q124 102 134 94" />
        </g>
      ) : (
        <g className="misi-ojos">
          <ellipse cx="76" cy="92" rx="10" ry={animo === "piensa" ? 9 : 13} fill={p.ojos} />
          <ellipse cx="124" cy="92" rx="10" ry={animo === "piensa" ? 9 : 13} fill={p.ojos} />
          {pelaje === "negro" && (
            <>
              <ellipse cx="76" cy="93" rx="4" ry="9" fill="#17132A" />
              <ellipse cx="124" cy="93" rx="4" ry="9" fill="#17132A" />
            </>
          )}
          <circle cx="80" cy="87" r="4" fill="#fff" />
          <circle cx="128" cy="87" r="4" fill="#fff" />
        </g>
      )}
      {/* Mejillas */}
      <circle cx="60" cy="114" r="9" fill="#FFB7B2" opacity="0.7" />
      <circle cx="140" cy="114" r="9" fill="#FFB7B2" opacity="0.7" />
      {/* Nariz y boca */}
      <path d="M93 106 H107 L100 114 Z" fill="#E58C86" stroke={p.borde} strokeWidth="2" strokeLinejoin="round" />
      {animo === "habla" ? (
        <ellipse cx="100" cy="124" rx="8" ry="6" fill="#7A3E4E" className="misi-boca" />
      ) : (
        <path d="M100 114 Q100 124 90 124 M100 114 Q100 124 110 124" fill="none" stroke={p.borde} strokeWidth="3" strokeLinecap="round" />
      )}
      {/* Bigotes */}
      <g stroke={p.borde} strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
        <path d="M70 118 L38 112" />
        <path d="M70 124 L40 128" />
        <path d="M130 118 L162 112" />
        <path d="M130 124 L160 128" />
      </g>
      {duerme && (
        <text x="150" y="44" fontSize="26" fontWeight="800" fill="#DDD5F3" fontFamily="Nunito, sans-serif">
          z
        </text>
      )}

      {/* Casco de cristal */}
      <circle cx="100" cy="96" r="88" fill="#E8F0FE" fillOpacity="0.14" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="5" />
      <path d="M44 56 A70 70 0 0 1 82 22" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
