# Fase 1: implementación docs-first

Fecha: 2026-07-02

## Objetivo

Promover `docs/` a fuente de verdad del sitio publicado sin eliminar todavía `src/`, `public/` ni `dist/`, y sin romper la compatibilidad actual.

## Qué cambió

### 1. `build` ahora parte de `docs/`

- `npm run build` ya no genera el sitio desde `src/` y `public/`.
- El build ahora:
  - trata `docs/` como fuente primaria,
  - sincroniza espejos legacy hacia `src/` y `public/`,
  - recompone `dist/` a partir de `docs/`,
  - y regenera `robots.txt` + `sitemap.xml` en `dist/`.

### 2. `src/` y `public/` quedan como espejos legacy

Se mantienen por compatibilidad, pero dejan de ser la fuente de verdad.

Sincronizaciones actuales:

- `docs/*.html` canónicos -> `src/pages/*.html`
- `docs/es/vg/index.html` -> `src/pages/es/ventas-gastos-panel.html`
- `docs/js/` -> `src/js/`
- `docs/data/` -> `src/data/`
- `docs/config/` -> `src/config/`
- `docs/partials/` -> `public/partials/`
- `docs/assets/` -> `public/assets/`
- `docs/icons/` -> `public/icons/`
- `docs/fonts/` -> `public/fonts/`
- `docs/manifest*.json` y `docs/service-worker.js` -> `public/`

Nota:

- La sincronización no poda archivos viejos en `src/` ni `public/`.
- Esto evita cambios destructivos y conserva compatibilidad mientras dura la transición.

### 3. `build:css` deja de escribir en `dist/`

- `npm run build:css` ahora recompila Tailwind legacy hacia `docs/assets/app.css`.
- Luego `npm run build` copia ese asset publicado desde `docs/` hacia `dist/`.

Esto deja a `docs/assets/app.css` como el asset publicado que alimenta el build.

### 4. `export:docs` deja de reexportar todo el sitio

- `docs/` ya no se borra ni se reconstruye completo desde `dist/`.
- `npm run export:docs` ahora solo sincroniza artefactos derivados:
  - `robots.txt`
  - `sitemap.xml`

## Compatibilidad preservada

- `npm run dev` sigue sirviendo `dist/`.
- `npm run build:pages` sigue existiendo.
- Se conservan los aliases públicos actuales en `docs/`:
  - `/es/tienda.html`
  - `/es/cotizacion.html`
  - `/es/casos-de-exito.html`
  - `/es/nosotros.html`
  - `/es/sostenibilidad.html`
  - `/es/ventas-gastos-panel.html`
  - `/es/vg.html`
  - `/es/vg/vg.html`
- Se conserva el panel `vg` como caso especial.
- Se mantiene la exclusión de analytics asociada a `vg` y `ventas-gastos-panel`.

## Límite actual de la fase

Esta fase no rehace todavía la arquitectura legacy completa alrededor de `src/styles/`, ni elimina la deuda histórica de parciales ya inyectados dentro del HTML canónico de `docs/`.

En otras palabras:

- `docs/` ya manda.
- `src/` y `public/` todavía existen para compatibilidad.
- La limpieza profunda de generadores legacy queda para una fase posterior.
