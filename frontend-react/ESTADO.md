# AstroVet: estado del proyecto

Actualizado: 5 de noviembre de 2026. Corresponde al prototipo en `frontend-react` (React 19, TypeScript, Vite y Tailwind).

## Resumen

El prototipo funciona de punta a punta en el navegador: landing jugable, registro, espacio del adulto, la casa de Misi, los 3 mundos con 23 misiones y 23 tipos de juego, rescates, patitas y decoración. Todavía no hay backend: los datos viven en el `localStorage` del navegador, con una capa de servicios (`servicios/api.ts`) que tiene la misma forma que tendrá la API de FastAPI.

---

## Lo que ya está hecho

### Landing (página de inicio)
- Mini misión jugable de un minuto, «¡Ada se perdió en la niebla!»: tres rondas (globos, piedras del río y trazar la A), niebla que se despeja, rescate y patitas.
- Cielo de estrellas en canvas con un salto a toda velocidad entre escenas, que se detiene fuera de pantalla y con movimiento reducido.
- Secciones de cómo aprende el niño (con la escalera de ayudas y el resumen de lo que pasó en la misión del visitante), el viaje de los 3 mundos con un trazo que avanza al bajar, la explicación para el adulto con un seguimiento de ejemplo y el registro en la misma página.

### Adultos
- Registro de familia y de docente, ingreso y recuperación de contraseña (simulada).
- Espacio del tutor:
  - perfiles de los niños con nombre, edad opcional, minutos por sesión y color de Misi;
  - progreso por mundo y actividad reciente;
  - selector de la voz de Misi;
  - botón de prototipo para abrir todas las misiones.
- Espacio docente: solo la pantalla de bienvenida.
- Cumplimiento: aceptación de la política de datos (Ley 1581) y versión de términos guardada.

### Mi casa (centro del juego)
- Vista isométrica estilo Habbo:
  - la sala tiene puertas a los cuartos Nebulosa, Luna y Selva y a la clínica, además del armario (vestidor) y la pizarra de vocales;
  - cada cuarto es un mundo y cada objeto es una misión, marcada con candado, estrella, estrella dorada (la siguiente que toca jugar) o el animal rescatado al lado.
- El niño toca el piso y su Misi camina, también en diagonal y sin cortar esquinas; con teclado se mueve con las flechas.
- El diálogo de Misi va en una franja arriba del cuarto, para no tapar nada, y la frase se oye al entrar.
- Decorar:
  - el panel va al costado en tabletas y computadores, y abajo en teléfonos;
  - tienda con 10 muebles que se pagan con patitas y 8 regalos que llegan al rescatar ciertos animales;
  - mover muebles y misiones, guardar en el baúl, y elegir colores de pared y de piso;
  - todo queda guardado por niño.

### Mundos y misiones
- Planeta Nebulosa: 7 misiones (vocales).
- Luna Mágica: 10 misiones (M, P, S, L y sus sílabas, presentadas por su sonido).
- Selva Cósmica: 6 misiones (primeras palabras).
- Estación de vocales para practicar sin prisa.
- Rescate animado distinto en cada mundo (nube, cráter y lianas). Las patitas solo se dan la primera vez.

### 23 juegos
- **Del documento (MVP):** escucha y elige, sonido inicial, caza de estrellas, imagen y palabra, memoria cósmica, une las piezas, ruleta de vocales, arma la palabra, sílaba perdida, lee y encuentra, y la palabra intrusa.
- **Nuevos:**
  - globos, piedras del río, clasificar en planetas, trazar la letra, eco de Misi y regalo para el animal;
  - rompecabezas, armar la figura, resortera (estilo Angry Birds), pesca, carrera del cohete y cocina.
- Cada misión abre con un juego distinto al de la anterior, y los juegos vuelven cada 4 o 5 misiones.
- Si un juego no cabe en la pantalla, se achica para que no haya que desplazarse, y arrastrar sigue funcionando bien.
- Sin castigo:
  - con 1 o 2 errores, Misi dice qué se eligió y qué se busca;
  - con 3 o 4, aparece una pista visual;
  - con 5 o más, Misi ayuda a hacerlo.

### Voz, sonido y diálogos
- Una sola cola de voz: las frases no se cortan y la vocal o la palabra nunca se pierde.
- La bienvenida y las consignas suenan solas, y Misi repite la consigna si pasan 16 segundos sin respuesta.
- Más de 30 grupos de frases: inicio, acierto, acierto tras error, con ayuda, rachas, mitad de misión, ánimo, inactividad, cambio de juego, rescate, regalo y siguiente misión.
- Efectos de marimba sintetizados, sin archivos.
- Listo para grabaciones humanas: el manifiesto en `public/audio/` lista los 66 audios.

### Diseño y accesibilidad
- Todo el arte es SVG propio (Misi, 19 animales, más de 35 dibujos de palabras, muebles isométricos y planetas), sin emojis.
- Transiciones entre pantallas, botón de calma y respeto por la preferencia de movimiento reducido.
- Todo lo que se arrastra también se puede tocar, y la resortera también se lanza tocando la torre.
- Probado en tableta (1024×768), iPhone y portátil de poca altura.
- Documentos de diseño: `PRODUCT.md` y `DESIGN.md`.

---

## Lo que falta por hacer

### Para poder publicarlo (prioridad alta)
1. **Repositorio en GitHub**, con commits solo a tu nombre.
2. **Backend FastAPI y PostgreSQL** con el modelo de 20 tablas:
   - autenticación con Bcrypt y tokens;
   - perfiles, progreso, sesiones, intentos y patitas;
   - muebles y ajustes de la casa.
3. **Cambiar `servicios/api.ts` por llamadas reales**, sin tocar las pantallas, y eliminar `bd.ts`.
4. **Privacidad (Ley 1581):** política y términos definitivos, consentimiento del adulto, y opciones para borrar y exportar datos.
5. **Despliegue:** frontend en Vercel o Netlify; backend y base de datos en Railway, Render o Fly.io; dominio y HTTPS.

### Calidad del producto (prioridad media)
6. **Grabar los audios**, al menos vocales y fonemas de M, P, S y L; la /p/ sintética no suena bien.
7. **Prueba con niños** en tableta real para revisar voz, gestos (en especial la resortera), dificultad y si se aburren.
8. **Clínica:** juegos de cuidado de los animales rescatados (hoy es solo una sala).
9. **Vestidor:** trajes y accesorios para Misi (hoy solo cambia el pelaje).
10. **Espacio docente:** grupos, invitación de alumnos y reportes por curso.
11. **Reportes para el adulto:** gráficas por sonido, recomendaciones de qué practicar y exportar a PDF.
12. **Arte definitivo**, si se quiere reemplazar el provisional.

### Mejoras técnicas
13. **Lint:** `typescript-eslint` aún no es compatible con TypeScript 7; hay que esperar la versión nueva o bajar a TypeScript 5.x.
14. **Pruebas automáticas:** unitarias de reglas y contenido, y de punta a punta con Playwright, que ya se usan para revisar a mano.
15. **PWA:** que se instale en la tableta y funcione con mala conexión.
16. **Rendimiento:** el paquete pesa unos 460 kB (140 kB comprimido); se puede dividir por rutas.
17. **Más mundos y contenido:** nuevas consonantes y lectura de frases.

---

## Cómo probarlo
1. En `frontend-react`, ejecutar `pnpm install` y luego `pnpm dev`.
2. Entrar con `familia@astrovet.demo` / `astrovet123`.
3. En el espacio del tutor, tocar «Prototipo: abrir todas las misiones» para recorrer todo.
4. La landing (`/`) se puede jugar sin cuenta.
