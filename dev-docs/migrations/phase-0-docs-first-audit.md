# Fase 0: auditoría para migración docs-first

Fecha de auditoría: 2026-07-02

Alcance de esta fase:

- Auditar el estado real del repo sin cambiar comportamiento publicado.
- Separar fuente, salida intermedia y salida publicada.
- Identificar rutas canónicas, aliases legacy y dependencias de compatibilidad.
- Dejar documentada la base para una migración posterior.

No se hicieron cambios destructivos. Esta fase es solo de lectura y documentación.

## 1. Estado real del repo hoy

El repo actual todavía funciona con una publicación `docs/`-first, aunque el plan maestro nuevo define una publicación desde la raíz del repo.

### Fuente

- `src/pages/`: HTML fuente.
- `src/js/`: lógica frontend fuente.
- `src/data/`: JSON fuente.
- `src/config/`: configuración fuente.
- `public/`: assets, parciales y archivos PWA fuente.

### Salida intermedia

- `dist/`: artefacto generado por `npm run build`.
- `scripts/build.mjs` limpia `dist/`, genera HTML canónico, crea aliases `.html`, copia `src/data`, `src/js`, `src/config`, `public`, `CNAME` y `.nojekyll`, y genera `sitemap.xml` y `robots.txt`.

### Salida publicada actual

- `docs/`: artefacto generado por `npm run export:docs`.
- `scripts/export-docs.mjs` borra `docs/`, copia `dist/` completo y luego normaliza la ruta interna `ventas-gastos-panel` a `vg`.

## 2. Diferencia entre plan maestro y realidad actual

### Objetivo del plan maestro

- Publicar desde la raíz del repo.
- Mantener estructura pública principal en `/`, `/es/`, `/en/`, `/assets/`.
- Tratar `/es/` y `/en/` como arquitectura equivalente.

### Realidad auditada

- `README.md` todavía documenta GitHub Pages en `main / docs`.
- `package.json` todavía define `build:pages` como `build` + `export:docs`.
- No existe `src/pages/en/`.
- No existe `docs/en/`.
- La huella pública real hoy es raíz + español.

Conclusión: antes de migrar publicación a raíz, primero hay que cerrar la brecha entre el contrato documental nuevo y la topología actual del build.

## 3. Pipeline actual de rutas

### Generación en `build`

Reglas actuales del build:

- `index.html` y cualquier `*/index.html` se conservan como archivo directo.
- Cualquier otra página fuente `foo.html` se genera como página canónica `foo/index.html`.
- Además se genera un alias legacy `foo.html` que redirige con `window.location.replace(...)` a `foo/`.
- El build también reescribe links internos `.html` a URLs limpias y ajusta assets relativos cuando la salida queda un nivel más profunda.

### Normalización extra en `export:docs`

Solo `docs/` recibe esta adaptación adicional:

- `dist/es/ventas-gastos-panel/index.html` pasa a `docs/es/vg/index.html`.
- Se preservan aliases adicionales:
  - `/es/ventas-gastos-panel.html`
  - `/es/vg.html`
  - `/es/vg/vg.html`

Conclusión: `dist/` es la verdad generada del sitio y `docs/` es una copia adaptada para despliegue actual.

## 4. Matriz de rutas actual

### Páginas fuente y salida publicada

| Fuente | Canónica en `dist/` | Canónica en `docs/` | Alias legacy vigentes | Indexación |
| --- | --- | --- | --- | --- |
| `src/pages/index.html` | `dist/index.html` | `docs/index.html` | Ninguno | `index,follow` |
| `src/pages/es/index.html` | `dist/es/index.html` | `docs/es/index.html` | Ninguno | `index,follow` |
| `src/pages/es/tienda.html` | `dist/es/tienda/index.html` | `docs/es/tienda/index.html` | `/es/tienda.html` | `index,follow` |
| `src/pages/es/cotizacion.html` | `dist/es/cotizacion/index.html` | `docs/es/cotizacion/index.html` | `/es/cotizacion.html` | `noindex,follow` |
| `src/pages/es/casos-de-exito.html` | `dist/es/casos-de-exito/index.html` | `docs/es/casos-de-exito/index.html` | `/es/casos-de-exito.html` | `index,follow` |
| `src/pages/es/nosotros.html` | `dist/es/nosotros/index.html` | `docs/es/nosotros/index.html` | `/es/nosotros.html` | `index,follow` |
| `src/pages/es/sostenibilidad.html` | `dist/es/sostenibilidad/index.html` | `docs/es/sostenibilidad/index.html` | `/es/sostenibilidad.html` | `index,follow` |
| `src/pages/es/ventas-gastos-panel.html` | `dist/es/ventas-gastos-panel/index.html` | `docs/es/vg/index.html` | `/es/ventas-gastos-panel.html`, `/es/vg.html`, `/es/vg/vg.html` | `noindex,nofollow,noarchive` |

### URLs públicas efectivas hoy

Canónicas indexables:

- `/`
- `/es/`
- `/es/tienda/`
- `/es/casos-de-exito/`
- `/es/nosotros/`
- `/es/sostenibilidad/`

Canónicas no indexables:

- `/es/cotizacion/`
- `/es/vg/`

Aliases de compatibilidad:

- `/es/tienda.html`
- `/es/cotizacion.html`
- `/es/casos-de-exito.html`
- `/es/nosotros.html`
- `/es/sostenibilidad.html`
- `/es/ventas-gastos-panel.html`
- `/es/vg.html`
- `/es/vg/vg.html`

## 5. Compatibilidades de runtime que la migración debe respetar

La compatibilidad actual no vive solo en archivos HTML. También existe en JS, data, caché y parciales.

### Dependencias a rutas `.html`

- `public/partials/header-es.html` todavía enlaza a `./index.html`, `./tienda.html`, `./casos-de-exito.html`, `./nosotros.html`, `./sostenibilidad.html` y `./cotizacion.html`.
- `src/data/products.json` usa `sourceUrl` con anchors sobre `/es/tienda.html#...`.
- Varias páginas fuente también enlazan internamente con `.html`; el build las convierte a URL limpia al generar la salida.

### Dependencias a `docs/`

- `src/js/tienda.js` mantiene un fallback explícito a `${window.location.origin}/docs/data/products.json`.
- Esto confirma que hoy existe compatibilidad en runtime con despliegues donde `docs/` es parte del entorno operativo.

### Compatibilidad del panel `vg`

- `src/js/analytics.config.js` excluye analytics tanto para `/es/vg/` como para `/es/vg.html` y `/es/ventas-gastos-panel...`.
- Esto es correcto y debe preservarse mientras existan aliases legacy.

### Caché PWA

- `public/service-worker.js` precachea una mezcla de rutas canónicas y aliases legacy:
  - `./es/vg/`
  - `./es/tienda/`
  - `./es/tienda.html`
  - `./es/cotizacion.html`
  - `./es/casos-de-exito.html`
  - `./es/nosotros.html`
  - `./es/sostenibilidad.html`

Conclusión: cambiar solo el árbol de archivos no basta. La migración tiene que tocar también fetches, precache, data y navegación interna.

## 6. SEO e indexación actuales

### Sitemap real

El `docs/sitemap.xml` actual publica solo:

- `/`
- `/es/`
- `/es/casos-de-exito/`
- `/es/nosotros/`
- `/es/sostenibilidad/`
- `/es/tienda/`

No publica:

- `/es/cotizacion/`
- `/es/vg/`
- ninguna ruta `/en/`

### Canonicals

- En fuente, varias páginas todavía declaran canonical `.html`.
- En salida generada, `scripts/build.mjs` corrige esos canonicals a la URL final según la ruta publicada.
- `scripts/export-docs.mjs` vuelve a corregir específicamente la canonical del panel a `/es/vg/`.

Conclusión: el canonical confiable hoy no es el del HTML fuente, sino el de la salida generada.

## 7. Hallazgos clave para la migración

1. El repo no está listo para root-first todavía.
   `README.md`, `package.json`, `src/js/tienda.js` y la topología de publicación siguen anclados a `docs/`.

2. El repo no está listo para bilingüe publicado.
   La documentación nueva exige `/en/`, pero no hay páginas fuente ni salida en inglés.

3. `dist/` y `docs/` no son equivalentes.
   `docs/` tiene una adaptación propia de `vg` que no existe en `dist/`.

4. La compatibilidad legacy es intencional y útil.
   Los `.html` no son basura accidental; hoy siguen siendo parte del contrato público y del runtime.

5. La raíz actual es un gateway español.
   `index.html` enlaza a `/es/`, pero también redirige con JS a `./es/index.html`, lo que mezcla URL limpia y URL legacy.

## 8. Recomendaciones para la siguiente fase

### Mantener en Fase 1

- Mantener todos los redirects `.html` existentes.
- Mantener la exclusión de analytics para todas las variantes de `vg`.
- Mantener `vg` como caso especial hasta definir la nueva ruta pública definitiva.
- Mantener `dist/` como salida de build única mientras se migra la publicación.

### Resolver primero

- Definir si la publicación nueva será realmente desde raíz o si habrá una etapa intermedia donde `docs/` siga existiendo.
- Definir la estrategia de transición para `/es/tienda.html` y demás aliases.
- Definir cuándo aparecerá `en/`: antes o después del cambio de publicación.
- Reemplazar dependencias explícitas a `/docs/...` por rutas agnósticas al destino final.

### No asumir todavía

- Que se puede borrar `docs/`.
- Que se puede borrar `.html` legacy.
- Que `vg` puede alinearse sin impacto con el resto de páginas.
- Que el sitemap bilingüe es activable sin crear primero contenido real en inglés.

## 9. Resumen ejecutivo

Hoy el repo es `src -> dist -> docs`, con `docs/` como salida publicada real, español como único idioma publicado, rutas limpias como canónicas y `.html` como capa activa de compatibilidad. La migración futura debe tratar `dist/` como origen de verdad del build, preservar aliases públicos mientras exista tráfico o dependencias internas, y resolver explícitamente la brecha entre el plan maestro root-first y la implementación actual docs-first.
