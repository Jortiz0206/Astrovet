# AstroVet: diseño

Resumen corto del sistema visual. La verdad del producto está en `PRODUCT.md`.

## Paleta (src/index.css, `@theme`)
- Noche `#231d45` / `#1d1740` (landing): el cielo de todo el juego.
- Lavanda `#8e7cc3`, lavanda oscuro `#5e4e9a`, lavanda tenue `#f4f1fb`: superficies del adulto y botones.
- Dorado `#ffd166`: acción principal, patitas, la ruta. Rosa `#ffb7b2` y menta `#8fd9b6`: acentos y estados.
- Cada mundo tiñe su cielo con `.juego[data-mundo]` (nebulosa, luna, selva).

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
