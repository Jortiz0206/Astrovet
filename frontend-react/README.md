# AstroVet · Frontend (prototipo)

Prototipo navegable del MVP según el documento de producto v3.0 y el catálogo de juegos, con datos
simulados en el navegador. La capa `src/servicios/api.ts` tiene la misma forma que tendrá la API de
FastAPI: cuando exista el backend, solo cambia ese archivo.

## Cómo correrlo

```bash
pnpm install
pnpm dev
```

Para probar en una tableta de la misma red Wi-Fi, abre la dirección «Network» que muestra
`pnpm dev` (por ejemplo `http://192.168.1.20:5173`).

**Cuentas de prueba** (contraseña `astrovet123`):

- Familia: `familia@astrovet.demo` (ya tiene el perfil «Mariana»)
- Docente: `docente@astrovet.demo`

En el espacio del tutor hay dos atajos para demostraciones: **abrir todas las misiones** (para
llegar a Luna Mágica y Selva Cósmica sin jugar todo) y **probar el cierre suave** (sesión de 2 min).

## Qué hay construido

| Área | Estado |
| --- | --- |
| Landing jugable: mini misión «Ada se perdió en la niebla» (3 juegos) y registro en la misma página | Listo |
| Registro (familia/docente), ingreso, recuperación (simulada) | Listo |
| Espacio del tutor: perfiles, progreso por mundo, actividad reciente, voz de Misi | Listo |
| Mapa con los 3 mundos del MVP: ruta, estados y desbloqueo en orden (RN-06) | Listo |
| Planeta Nebulosa: 7 misiones (vocales) | Listo |
| Luna Mágica: 10 misiones (M, P, S, L y sus sílabas) | Listo |
| Selva Cósmica: 6 misiones (primeras palabras) | Listo |
| 17 juegos: los 11 del MVP más globos, piedras del río, clasificar en planetas, trazar la letra, eco de Misi y regalo para el animal | Listo |
| Cada misión abre con un juego distinto al de la anterior; los juegos se repiten cada 4 o 5 misiones | Listo |
| Sin castigo: 1-2 errores retroalimentación (qué eligió y qué se busca), 3-4 pista visual, 5+ Misi ayuda | Listo |
| Rescate animado por mundo y patitas solo la primera vez (RN-08) | Listo |
| Estación de vocales (ESP-02) y cierre suave con «Estrellas de hoy» (ESP-04) | Listo |
| Vestidor (pelaje) · Clínica (sala de rescatados) | Parcial: tienda y juegos de cuidado pendientes |
| Espacio docente | Pantalla de bienvenida (módulo: incremento 4) |

## Arte, sonido y voz

- **Ilustraciones:** Capitán Misi, 19 animales, 26 objetos para las palabras, 3 planetas y los iconos
  son SVG propios con un mismo trazo (`src/componentes/`). Son provisionales hasta tener el arte
  definitivo, pero ya no se usa ningún emoji.
- **Efectos:** tonos de marimba sintetizados (sin archivos), en escala pentatónica; cada acierto de
  una misión suena un poco más alto. Se silencian con la campana del juego.
- **Voz:** el tutor elige la voz del dispositivo en su espacio (se recomienda una «natural» o «en
  línea»). Para usar grabaciones humanas, mira `public/audio/LEEME.md`: lista los 66 audios de los
  mundos 1 a 3 y cómo activarlos sin tocar el código.
- **Cola de voz:** todo lo que dice Misi pasa por una sola cola (`servicios/audio.ts`). Las frases de
  celebración terminan antes de pasar de ronda, la vocal o la palabra nunca se pierde tras la consigna y
  solo un toque del niño interrumpe. La bienvenida de cada misión y cada consigna se dicen solas; en las
  rondas siguientes del mismo juego Misi dice una frase corta y el sonido nuevo; tras 16 s sin respuesta
  repite la consigna una vez.
- **Diálogos:** `datos/guion.ts` tiene frases para inicio de misión, acierto, acierto tras error, con
  ayuda, rachas, mitad de misión, errores, ánimo, inactividad, cambio de juego, rescate y siguiente
  misión. Nunca repite la misma frase dos veces seguidas.
- Las consonantes aisladas suenan aproximadas con la voz sintética («mmm», «sss»); la /p/ necesita
  grabación para sonar bien.

## Movimiento y accesibilidad

- Transiciones entre pantallas con View Transitions; Misi «viaja» de un globo al siguiente.
- El botón de calma del juego y la preferencia del sistema reducen las animaciones.
- Arrastrar es opcional: todas las piezas también se colocan tocándolas.
- Trazar la letra tiene el botón «Trazar con Misi» como alternativa al dedo.
- El cielo de la landing (canvas) se detiene fuera de pantalla y no se anima con movimiento reducido.

## Estructura

```
src/
  tipos.ts                 Tipos del dominio (reflejan el modelo de 20 tablas)
  datos/contenido.ts       Mundos, misiones y actividades (semilla del catálogo)
  datos/guion.ts           Frases y consignas de Capitán Misi
  servicios/api.ts         Reglas de negocio y "endpoints" (se cambia por fetch a FastAPI)
  servicios/bd.ts          Base de datos simulada en localStorage (se elimina con el backend)
  servicios/audio.ts       Voces, grabaciones y efectos
  contexto/                Sesión del adulto y estado del juego (tiempo, sesión, perfil, mundo)
  juego/actividades/       Una mecánica por archivo
  juego/Rescate.tsx        Animación del rescate y vuelo de las patitas
  paginas/                 Pantallas: adulto/ y juego/
  componentes/             Misi, Criatura, Dibujo, Planeta, Icono, botones, marcos
public/audio/              Grabaciones (vacío por ahora) y su lista
```

## Notas

- Los datos viven solo en el navegador donde se usan; «Reiniciar datos de prueba» los borra.
- `pnpm lint` falla porque `typescript-eslint` todavía no es compatible con TypeScript 7.
  `pnpm build` sí verifica los tipos.
