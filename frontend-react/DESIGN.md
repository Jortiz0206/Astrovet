# AstroVet: diseño

Resumen corto del sistema visual. La verdad del producto está en `PRODUCT.md`.

## Paleta (src/index.css, `@theme`)
- Noche `#231d45` / `#1d1740` (landing): el cielo de todo el juego.
- Lavanda `#8e7cc3`, lavanda oscuro `#5e4e9a`, lavanda tenue `#f4f1fb`: superficies del adulto y botones.
- Dorado `#ffd166`: acción principal, patitas, la ruta. Rosa `#ffb7b2` y menta `#8fd9b6`: acentos y estados.
- Cada mundo tiñe su cielo con `.juego[data-mundo]` (nebulosa, luna, selva, cometa).

## Cuartos de «Mi casa» (`componentes/casa/Ambiente.tsx`)
Cada cuarto cuenta su nombre con tres capas, dibujadas en plano y proyectadas con una matriz isométrica (pared: `matrix(±1 0.5 0 1 …)`; piso: `matrix(36 18 -36 18 …)`):
- Sala: hogar. Papel con huellitas, zócalo de paneles, piso de tablas, alfombra redonda, cuadro del cohete y ventana redonda a los mundos.
- Nebulosa: bruma rosada, banco de nubes al pie de las paredes, destellos y nubes en el piso; ventana en arco con el planeta anillado.
- Luna: base lunar. Paneles con remaches, franja de luces, media luna de neón; piso de regolito con cráteres; escotilla con la Tierra.
- Selva: lianas que cuelgan, hojas grandes que crecen desde el piso, luciérnagas; musgo y hojas caídas en el piso.
- Clínica: azulejos bajos, una línea de latido rosada que recorre las paredes, la cruz de la clínica, un cartel con huella y corazón; piso blanco y menta con huellitas desde la puerta; ventana al jardín con una constelación en forma de huella.
- Cometa: facetas de hielo, carámbanos, cristales en la base; piso de hielo con brillos y grietas finas; ventana hexagonal con el cometa.
Forma: cada cuarto define `ancho`, `fondo` y `huecos` (rectángulos sin piso) en `datos/casa.ts`; las paredes van siempre al fondo y el piso lleva un canto de 12 px en los bordes de adelante. Los objetos de misión se ubican solos (`rinconesDe`): contra las paredes y luego por el borde de adelante, sin tapar puertas.
Los colores base salen de «Colores» (lo que elige el niño); el tema pone encima textura y detalles.

## Tipografía
- Nunito para todo el texto; títulos en 900 con tracking negativo.
- Andika para letras, sílabas y palabras que el niño lee (formas inequívocas).

## Movimiento
- Curvas: `--ease-llegada` cubic-bezier(0.16,1,0.3,1) para entradas; `--ease-mover` cubic-bezier(0.77,0,0.175,1) para desplazamientos.
- Solo transform y opacity (más filter blur ≤ 9px en la niebla). Pulsos con anillo `::after`, no con box-shadow.
- Hover solo con `(hover: hover) and (pointer: fine)`. Movimiento reducido: sin desplazamientos, se conservan fundidos.
- Firma de la landing: salto de estrellas (canvas) entre rondas y la niebla que se aparta de Ada.

## Reglas
- Sin emojis: todo el arte es SVG propio.
- Una consigna a la vez, siempre visible y con audio.
- Errores sin castigo: retroalimentación, luego pista, luego ayuda.
