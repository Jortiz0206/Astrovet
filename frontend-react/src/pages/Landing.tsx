
import "../styles/Landing.css";

type LandingProps = {
  onFamiliaClick: () => void;
  onDocenteClick: () => void;
};

function Landing({ onFamiliaClick, onDocenteClick }: LandingProps) {
  return (
    <main className="landing">
      <header className="landing-header">
        <a href="#inicio" className="landing-marca" aria-label="AstroVet, inicio">
          <img src="/logo-astrovet.png" alt="Logo oficial de AstroVet" />
        </a>

        <nav className="landing-nav" aria-label="Navegación principal">
          <a href="#proposito">Nuestro propósito</a>
          <a href="#experiencia">La experiencia</a>
          <a href="#acceso" className="landing-nav-cta">Ingresar</a>
        </nav>
      </header>

      <section className="landing-hero" id="inicio">
        <div className="landing-cielo" aria-hidden="true">
          <span className="landing-estrella estrella-uno" />
          <span className="landing-estrella estrella-dos" />
          <span className="landing-estrella estrella-tres" />
          <span className="landing-planeta planeta-uno" />
          <span className="landing-planeta planeta-dos" />
        </div>

        <div className="landing-contenido">
          <span className="landing-etiqueta">
            Un universo para descubrir
          </span>

          <h1>
            Cada niño tiene
            <span> su propia forma de aprender.</span>
          </h1>

          <p className="landing-descripcion">
            En AstroVet, aprender a leer se convierte en una aventura.
            Los niños exploran sonidos, reconocen letras y descubren palabras
            acompañados por Capitán Misi, a su propio ritmo y sin miedo a equivocarse.
          </p>

          <div className="landing-botones">
            <button className="boton-familia" onClick={onFamiliaClick}>
              Soy familiar
              <span aria-hidden="true">→</span>
            </button>

            <button className="boton-docente" onClick={onDocenteClick}>
              Soy docente
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <p className="landing-frase">
            Jugando hoy, leyendo mañana.
          </p>
        </div>

        <div className="landing-personaje">
          <div className="landing-orbita orbita-uno" />
          <div className="landing-orbita orbita-dos" />

          <div className="landing-logo-marco">
            <img
              src="/logo-astrovet.png"
              alt="Capitán Misi, mascota oficial de AstroVet"
            />
          </div>

          <div className="landing-dialogo">
            ¡Hola! ¿Listos para descubrir?
          </div>
          <span className="landing-punto-decorativo punto-uno" />
          <span className="landing-punto-decorativo punto-dos" />
        </div>
      </section>

      <section className="landing-proposito" id="proposito">
        <div className="landing-seccion-titulo">
          <span className="landing-mini-etiqueta">Nuestra misión</span>
          <h2>Aprender también puede sentirse diferente.</h2>
          <p>
            Creamos experiencias de aprendizaje que reconocen los diferentes
            ritmos, intereses y necesidades de cada niño.
          </p>
        </div>

        <div className="landing-pilares">
          <article className="pilar">
            <span className="pilar-numero">01</span>
            <div className="pilar-ilustracion pilar-audio">
              <span>OÍR</span>
            </div>
            <h3>Escuchar y descubrir</h3>
            <p>
              Instrucciones habladas y sonidos que acompañan cada actividad.
            </p>
          </article>

          <article className="pilar">
            <span className="pilar-numero">02</span>
            <div className="pilar-ilustracion pilar-juego">
              <span>JUGAR</span>
            </div>
            <h3>Explorar jugando</h3>
            <p>
              Misiones cortas, retos visuales y pequeños logros que motivan.
            </p>
          </article>

          <article className="pilar">
            <span className="pilar-numero">03</span>
            <div className="pilar-ilustracion pilar-ritmo">
              <span>AVANZAR</span>
            </div>
            <h3>Avanzar a su ritmo</h3>
            <p>
              Repetir, intentar de nuevo y aprender sin presión ni castigos.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-experiencia" id="experiencia">
        <div className="experiencia-intro">
          <span className="landing-mini-etiqueta">El universo AstroVet</span>
          <h2>Una aventura, muchos descubrimientos.</h2>
          <p>
            Cada mundo propone nuevas oportunidades para practicar y fortalecer
            habilidades relacionadas con el aprendizaje de la lectura.
          </p>
        </div>

        <div className="mundos-preview">
          <article className="mundo-preview mundo-vocales">
            <span className="mundo-etapa">Primeros descubrimientos</span>
            <div className="mundo-letra">A E I O U</div>
            <h3>Planeta de las vocales</h3>
            <p>Reconocer sonidos y relacionarlos con imágenes y palabras.</p>
          </article>

          <article className="mundo-preview mundo-silabas">
            <span className="mundo-etapa">Nuevos sonidos</span>
            <div className="mundo-letra">MA · ME · MI</div>
            <h3>Bosque de las sílabas</h3>
            <p>Explorar combinaciones de letras y descubrir cómo suenan.</p>
          </article>

          <article className="mundo-preview mundo-palabras">
            <span className="mundo-etapa">Una misión especial</span>
            <div className="mundo-letra">SOL · LUNA</div>
            <h3>Clínica de palabras</h3>
            <p>Unir sonidos y sílabas para acercarse a nuevas palabras.</p>
          </article>
        </div>
      </section>

      <section className="landing-acompanamiento">
        <div className="acompanamiento-texto">
          <span className="landing-mini-etiqueta">Cada avance cuenta</span>
          <h2>No se trata de ir más rápido. Se trata de seguir descubriendo.</h2>
          <p>
            AstroVet busca que los niños puedan practicar en un entorno amable,
            con oportunidades para repetir las actividades, reconocer sus logros
            y avanzar paso a paso.
          </p>
        </div>

        <div className="acompanamiento-destacado">
          <span className="destacado-linea">En AstroVet</span>
          <strong>Equivocarse también hace parte de aprender.</strong>
          <span className="destacado-firma">Capitán Misi te acompaña.</span>
        </div>
      </section>

      <section className="landing-acceso" id="acceso">
        <span className="landing-mini-etiqueta">Comienza la aventura</span>
        <h2>¿Quién quiere explorar AstroVet?</h2>
        <p>
          Familias y docentes pueden acompañar a los niños en esta experiencia
          de aprendizaje.
        </p>

        <div className="landing-botones landing-botones-centro">
          <button className="boton-familia" onClick={onFamiliaClick}>
            Acceso para familias
            <span aria-hidden="true">→</span>
          </button>

          <button className="boton-docente" onClick={onDocenteClick}>
            Acceso para docentes
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <img src="/logo-astrovet.png" alt="" />
        <p>AstroVet · Jugando hoy, leyendo mañana.</p>
        <span>Una aventura para descubrir nuevas formas de aprender.</span>
      </footer>
    </main>
  );
}

export default Landing;
