# AstroVet · Frontend (prototipo)

Prototipo navegable del **Incremento 1** del documento de producto v3.0, con datos simulados
en el navegador. La capa `src/servicios/api.ts` tiene la misma forma que tendrá la API de
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

## Qué hay construido

| Área | Estado |
| --- | --- |
| Landing, registro (familia/docente), ingreso, recuperación de contraseña (simulada) | Listo |
| Espacio del tutor: perfiles con apodo, edad opcional, tiempo de 5 a 10 min y pelaje de Misi; editar y eliminar | Listo |
| Seguimiento básico: sesiones, intentos, aciertos, ayudas y repeticiones de audio | Vista previa |
| Centro espacial, mapa de mundos con estados y desbloqueo en orden (RN-06) | Listo |
| Planeta Nebulosa: misiones M1.1 a M1.7 con ACT-01 a ACT-05 | Listo |
| Ayuda progresiva (repetir audio → resaltar → hacerlo con Misi) y errores sin castigo | Listo |
| Rescate de animales y patitas doradas solo la primera vez (RN-08) | Listo |
| Estación de vocales (ESP-02) | Listo |
| Cierre suave: aviso al minuto, gracia de 2 min, escena de descanso con «Estrellas de hoy» | Listo |
| Vestidor: color de pelaje | Listo (trajes y tienda: incremento 2) |
| Clínica | Vista previa (juegos de cuidado: incremento 2) |
| Luna Mágica y Selva Cósmica | Se ven en el mapa como «Muy pronto» |
| Espacio docente | Pantalla de bienvenida (módulo: incremento 4) |

En el espacio del tutor, «Probar el cierre suave» abre una sesión de 2 minutos para demostrarlo.

## Estructura

```
src/
  tipos.ts                 Tipos del dominio (reflejan el modelo de 20 tablas)
  datos/contenido.ts       Mundos, misiones y actividades (semilla del catálogo)
  datos/guion.ts           Frases de Capitán Misi
  servicios/api.ts         Reglas de negocio y "endpoints" (se cambia por fetch a FastAPI)
  servicios/bd.ts          Base de datos simulada en localStorage (se elimina con el backend)
  servicios/audio.ts       Voz del navegador (provisional) y efectos silenciables
  contexto/                Sesión del adulto y estado del juego (tiempo, sesión, perfil)
  juego/actividades/       Una mecánica por archivo (ACT-01 a ACT-05)
  paginas/                 Pantallas: adulto/ y juego/
  componentes/             Misi (SVG con pelaje configurable), botones, marcos
```

## Notas del prototipo

- Los datos viven solo en el navegador donde se usan; «Reiniciar datos de prueba» los borra.
- La voz es la síntesis del dispositivo; el documento pide grabaciones con voz humana (RNF-11).
- Las imágenes de las palabras son emoji provisionales hasta tener las ilustraciones propias.
- `pnpm lint` falla porque `typescript-eslint` todavía no es compatible con TypeScript 7
  (pasaba antes de estos cambios también). `pnpm build` sí verifica los tipos.
