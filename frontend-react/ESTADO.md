# AstroVet: estado del proyecto

Actualizado: 6 de noviembre de 2026. Corresponde al prototipo en `frontend-react` (React 19, TypeScript, Vite y Tailwind).

## Resumen

El prototipo funciona de punta a punta en el navegador:
- la landing jugable, el registro y el espacio del adulto;
- la casa, con 6 cuartos de formas distintas;
- 4 mundos con 30 misiones y 23 tipos de juego;
- rescates, patitas y decoración;
- una clínica donde se cuida a los animales rescatados;
- 7 personajes con sus pelajes.

Todavía no hay backend. Los datos viven en el `localStorage` del navegador, detrás de una capa de servicios (`servicios/api.ts`) que tiene la misma forma que tendrá la API de FastAPI.

---

## Lo que ya estaba hecho

### Landing (página de inicio)
- Mini misión jugable de un minuto, «¡Ada se perdió en la niebla!»: tres rondas (globos, piedras del río y trazar la A), niebla que se despeja, rescate y patitas.
- Cielo de estrellas en canvas con un salto a toda velocidad entre escenas. Se detiene cuando sale de la pantalla y cuando está activado el movimiento reducido.
- Secciones de la página:
  - cómo aprende el niño, con la escalera de ayudas y el resumen de lo que pasó en la misión del visitante;
  - el viaje de los mundos, con un trazo que avanza al bajar;
  - la explicación para el adulto, con un seguimiento de ejemplo;
  - el registro, en la misma página.

### Adultos
- Registro de familia y de docente, ingreso y recuperación de contraseña (simulada).
- Espacio del tutor:
  - perfiles de los niños con apodo, edad opcional, minutos por sesión y color de Misi;
  - progreso por mundo y actividad reciente;
  - selector de la voz de Misi;
  - botón de prototipo para abrir todas las misiones.
- Espacio docente: solo la pantalla de bienvenida.
- Cumplimiento: aceptación de la política de datos (Ley 1581) y versión de términos guardada.

### Sesión de juego
- El tutor fija la duración de la sesión entre 5 y 10 minutos (regla RN-02).
- Aviso un minuto antes. Si hay una actividad en curso, se da hasta 2 minutos de gracia para terminarla.
- Al final, una escena de descanso tranquila («Estrellas de hoy») que recuerda los sonidos practicados.

### Mi casa (centro del juego)
- Vista isométrica estilo Habbo:
  - la sala tiene puertas a los cuartos de cada mundo y a la clínica, además del armario (vestidor) y la pizarra de vocales;
  - cada cuarto es un mundo y cada objeto es una misión. Cada misión se marca con un candado, una estrella, una estrella dorada (la siguiente que toca jugar) o el animal rescatado al lado.
- El niño toca el piso y su personaje camina, también en diagonal y sin cortar esquinas. Con el teclado se mueve con las flechas.
- El diálogo va en una franja arriba del cuarto, para no tapar nada, y la frase se oye al entrar.
- Decorar:
  - el panel va al costado en tabletas y computadores, y abajo en teléfonos;
  - tienda de muebles que se pagan con patitas y regalos que llegan al rescatar ciertos animales;
  - mover muebles y misiones, guardar en el baúl, y elegir colores de pared y de piso;
  - todo queda guardado por niño.

### Mundos y misiones (los 3 del MVP)
- Planeta Nebulosa: 7 misiones (vocales).
- Luna Mágica: 10 misiones (M, P, S, L y sus sílabas, presentadas por su sonido).
- Selva Cósmica: 6 misiones (primeras palabras).
- Estación de vocales para practicar sin prisa.
- Rescate animado distinto en cada mundo (nube, cráter y lianas). Las patitas solo se dan la primera vez que se completa una misión.

### 23 juegos
- **Del documento (MVP):**
  - escucha y elige, sonido inicial, caza de estrellas, imagen y palabra;
  - memoria cósmica, une las piezas, ruleta de vocales, arma la palabra;
  - sílaba perdida, lee y encuentra, y la palabra intrusa.
- **Nuevos:**
  - globos, piedras del río, clasificar en planetas, trazar la letra, eco de Misi y regalo para el animal;
  - rompecabezas, armar la figura, resortera (estilo Angry Birds), pesca, carrera del cohete y cocina.
- Cada misión abre con un juego distinto al de la anterior, y los juegos vuelven cada 4 o 5 misiones.
- Si un juego no cabe en la pantalla, se achica para que no haya que desplazarse, y arrastrar sigue funcionando bien.
- Sin castigo:
  - con 1 o 2 errores, el compañero dice qué se eligió y qué se busca;
  - con 3 o 4, aparece una pista visual;
  - con 5 o más, el compañero ayuda a hacerlo.

### Voz, sonido y diálogos
- Una sola cola de voz: las frases no se cortan y la vocal o la palabra nunca se pierde.
- La bienvenida y las consignas suenan solas, y la consigna se repite si pasan 16 segundos sin respuesta.
- Más de 30 grupos de frases: inicio, acierto, acierto tras error, con ayuda, rachas, mitad de misión, ánimo, inactividad, cambio de juego, rescate, regalo y siguiente misión.
- Efectos de marimba sintetizados, sin archivos.
- Listo para grabaciones humanas: el manifiesto en `public/audio/` lista los audios que hay que grabar.

### Diseño y accesibilidad
- Todo el arte es SVG propio (personajes, animales, dibujos de palabras, muebles isométricos y planetas), sin emojis.
- Transiciones entre pantallas, botón de calma y respeto por la preferencia de movimiento reducido.
- Todo lo que se arrastra también se puede tocar, y la resortera también se lanza tocando la torre.
- Probado en tableta (1024×768), iPhone y portátil de poca altura.
- Documentos de diseño: `PRODUCT.md` y `DESIGN.md`.

---

## Lo nuevo (6 de noviembre de 2026)

### Toques y movimiento en la casa (arreglo)
- **Problema:** cada mueble tenía alrededor una caja invisible mucho más grande que su baldosa, y esa caja se tragaba los toques. En el cuarto Luna, 59 de las 64 baldosas no respondían al tocarlas en el centro.
- **Arreglo:** la baldosa se calcula ahora desde el punto exacto del toque. Si el dedo se resbala un poco, cuenta el punto donde bajó.
- **Arrastrar:** al decorar, los muebles y las misiones ahora se pueden arrastrar. La baldosa de destino se pinta verde si cabe y roja si no. Tocar y luego tocar el destino sigue funcionando.
- Corregido: los muebles sin misión brillaban como si fueran «la siguiente misión».
- Corregido: «detrás de el telescopio» ahora dice «detrás del telescopio».

### Personajes y pelajes (vestidor)
- 7 compañeros. Misi viene de serie; los demás se desbloquean con patitas en el vestidor:

  | Personaje | Patitas |
  |---|---|
  | Toby, el perro | 25 |
  | Lila, la coneja | 35 |
  | Rayo, el zorro | 45 |
  | Bambú, el panda | 55 |
  | Pipo, el pingüino | 65 |
  | Chispa, la dragona | 80 |

- Antes de gastar, el niño ve el precio y cuántas patitas le faltan.
- Cada compañero tiene 4 pelajes gratis:
  - Toby: caramelo, dálmata, chocolate y dorado.
  - Lila: nieve, canela, gris y manchas.
  - Rayo: fuego, ártico, plata y desierto.
  - Bambú: clásico, canela, panda rojo y lunar.
  - Pipo: noche, océano, emperador y rosado.
  - Chispa: menta, lavanda, coral y cielo.
- Misi conserva sus 6 colores. Se guarda un pelaje por personaje.
- El compañero elegido, con su pelaje, camina por la casa y acompaña en las misiones, el mapa, la clínica y el descanso.

### Cuartos con estilo propio
Cada cuarto se ve según su nombre y tiene su propia ventana. Los colores que el niño elige en «Decorar» se aplican encima del diseño.

| Cuarto | Paredes | Piso | Ventana |
|---|---|---|---|
| Sala | Papel con huellitas, zócalo y un cuadro del cohete | Madera, con alfombra | Redonda, a los mundos |
| Nebulosa | Bruma rosada y banco de nubes | Con nubes | El planeta anillado |
| Luna (base lunar) | Paneles con remaches, luces que titilan y media luna de neón | Cráteres | Escotilla con la Tierra |
| Selva | Lianas, hojas grandes y luciérnagas | Musgo y hojas caídas | Jardín de la selva |
| Cometa | Facetas de hielo, carámbanos y cristales | Hielo con grietas finas | Hexagonal, con el cometa |
| Clínica | Azulejos, línea de latido y la cruz | Huellitas desde la puerta | Jardín con estrellas en forma de huella |

### Cuartos de formas y tamaños distintos
| Cuarto | Tamaño | Forma |
|---|---|---|
| Sala | 10 × 8 | Rectángulo amplio |
| Nebulosa | 9 × 9 | En L |
| Luna | 7 × 11 | Pasillo largo que dobla |
| Selva | 11 × 9 | L ancha, la más grande |
| Cometa | 9 × 9 | Con una punta que sobresale adelante |
| Clínica | 10 × 8 | En L, con el rincón del baño |

- El piso se ve como una losa con canto, así la forma se lee de un vistazo.
- Los objetos de misión se acomodan solos según la forma: contra las paredes y luego por el borde de adelante, sin tapar puertas.
- Si un mueble queda donde ya no hay piso, vuelve al baúl.

### Clínica veterinaria
- Es un cuarto más de la casa: azulejos, camilla, botiquín, bañera de burbujas y estante de fichas.
- Hasta 6 pacientes pasean despacio por el cuarto, cada uno con el ícono de su malestar leve: estornudos, patita raspada, tos, hambre o barro.
- Los demás rescatados descansan en «Camas» y se pueden llamar al cuarto. La elección queda guardada por niño.
- Al tocar un paciente, el compañero camina hasta él, cuenta qué le pasa y ofrece «Atender».
- Hay 5 juegos de cuidado del catálogo:
  - escucha el corazón (CL-01);
  - vendaje de sílabas (CL-02);
  - jarabe de letras (CL-03);
  - la comida favorita (CL-04), que es de lectura y solo aparece con animales del mundo 3 en adelante;
  - baño de burbujas (CL-05).
- Cada visita son 5 aciertos. El malestar se va paso a paso y el animal deja un sello en su ficha de cuidados.
- Usa solo contenidos que el niño ya conoce y registra los intentos como práctica. No da patitas ni cambia el progreso, y equivocarse nunca empeora al animal.

### Mundo 4: Cometa Cristal (T, N, D)
- 7 misiones del catálogo; cada palabra usa solo letras ya trabajadas:

  | Misiones | Animal | Qué se practica |
  |---|---|---|
  | M4.1–M4.2 | Tito, el pato | /t/; TA–TU; PATO, TAPA, MOTO |
  | M4.3–M4.4 | Nico, el mono | /n/; NA–NU; LUNA, MANO, MONO |
  | M4.5–M4.6 | Dino, el dinosaurio | /d/; DA–DU; DADO, DEDO, DONA, NIDO |
  | M4.7 Gran rescate | Kira, la cabra | TOMATE, PELOTA, MALETA |

- NIDO pasó de las palabras con N a las de D, porque lleva una D que todavía no se había visto. En su lugar quedó MONO.
- 3 animales nuevos y 9 dibujos de palabras nuevos.
- El rescate rompe un cristal de hielo. El planeta del mapa es un cometa facetado y el cielo se vuelve azul hielo.
- En la tienda: el mueble «Cristales de hielo» y 3 regalos nuevos.

### Otros cambios
- El mapa con 4 mundos ya no encima los nombres en el teléfono.
- «Escucha a Misi y repite» ahora dice «Escúchame y repite», porque el compañero puede ser otro personaje.
- Al borrar el perfil de un niño ahora también se borran sus muebles, su decoración y sus sellos.

---

## Lo que falta por hacer

### Para poder publicarlo (prioridad alta)
1. **Repositorio en GitHub**, con los commits solo a tu nombre.
2. **Backend FastAPI y PostgreSQL** con el modelo de 20 tablas:
   - autenticación con Bcrypt y tokens;
   - perfiles, progreso, sesiones, intentos y patitas;
   - muebles, ajustes de la casa, personajes, pelajes y sellos de la clínica.
3. **Cambiar `servicios/api.ts` por llamadas reales**, sin tocar las pantallas, y eliminar `bd.ts`.
4. **Privacidad (Ley 1581):** política y términos definitivos, consentimiento del adulto, y opciones para borrar y exportar datos.
5. **Despliegue:** el frontend en Vercel o Netlify; el backend y la base de datos en Railway, Render o Fly.io; dominio y HTTPS.

### Calidad del producto (prioridad media)
6. **Tiempo de sesión sin límite, a decisión de los padres.**
   - Hoy la sesión dura entre 5 y 10 minutos (regla RN-02).
   - Agregar en el perfil del niño una opción «Sin límite de tiempo» que el adulto active si quiere. En ese modo no hay aviso ni cierre automático, y el niño termina cuando quiera con el botón de descanso.
   - Mantener los 5 a 10 minutos como opción recomendada y por defecto.
   - Cambiar la regla RN-02 en la documentación, la validación de `api.ts` y la del backend.
   - Guardar el valor como «sin límite», no como un número muy grande, para que los reportes lo muestren bien.
7. **Grabar los audios**, al menos las vocales y los fonemas de M, P, S, L, T, N y D. La /p/, la /t/ y la /d/ sintéticas no suenan bien.
8. **Prueba con niños** en una tableta real para revisar la voz, los gestos (en especial la resortera y arrastrar muebles), la dificultad y si se aburren.
9. **Clínica, fase 2:** radiografía, peluquería, termómetro de rimas, paseo y visita doble (CL-06 a CL-10).
10. **Vestidor:** trajes y accesorios de la tienda del catálogo (casco con antena, gafas de estrellas, bata, capa…). Ya hay personajes y pelajes, pero aún no ropa.
11. **Espacio docente:** grupos, invitación de alumnos y reportes por curso.
12. **Reportes para el adulto:** gráficas por sonido, recomendaciones de qué practicar y exportar a PDF.
13. **Landing:** sigue mostrando los 3 mundos del MVP. Decidir si se presenta el Cometa Cristal.
14. **Arte definitivo**, si se quiere reemplazar el provisional.

### Ideas para la casa (sugeridas)
15. **Desniveles:** una tarima de uno o dos escalones en algunos cuartos, por ejemplo el escenario de la Selva o el puente de mando de la Luna.
16. **Ventanas que cambian con el progreso:** el planeta se ve más claro a medida que se rescatan sus animales.
17. **Cuartos que crecen:** al terminar un mundo, su cuarto gana un ala nueva.
18. **Pisos por zonas:** una alfombra o una baldosa distinta en una parte del cuarto, por ejemplo azul en el rincón del baño de la clínica.
19. **Puertas entre cuartos de mundo**, para pasar de uno a otro sin volver a la sala.

### Mejoras técnicas
20. **Lint:** `typescript-eslint` aún no es compatible con TypeScript 7. Hay que esperar la versión nueva o bajar a TypeScript 5.x.
21. **Pruebas automáticas:** unitarias de reglas y contenido, y de punta a punta con Playwright, que ya se usan para revisar a mano.
22. **PWA:** que se instale en la tableta y funcione con mala conexión.
23. **Rendimiento:** el paquete pesa unos 600 kB (unos 180 kB comprimido). Conviene dividirlo por rutas.
24. **Más mundos y contenido:** el mundo 5 (Océano Estelar: B/V y F) y los siguientes, y la lectura de frases.

---

## Cómo probarlo
1. En `frontend-react`, ejecutar `pnpm install` y luego `pnpm dev`.
2. Entrar con `familia@astrovet.demo` / `astrovet123`.
3. En el espacio del tutor, tocar «Prototipo: abrir todas las misiones» para recorrer todo. Ese botón abre las misiones pero no las completa: los animales llegan a la clínica cuando se rescatan jugando.
4. La landing (`/`) se puede jugar sin cuenta.
