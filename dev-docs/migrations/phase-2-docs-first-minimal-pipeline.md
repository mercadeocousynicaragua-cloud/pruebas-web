# Fase 2: pipeline mínimo centrado en docs

Fecha: 2026-07-02

## Objetivo

Reemplazar el pipeline histórico `src -> dist -> docs` por un pipeline mínimo que trabaja directo sobre `docs/`, preservando:

- CSS compilado publicado
- `sitemap.xml`
- `robots.txt`
- redirects legacy `.html`

## Flujo nuevo

### Fuente de verdad

- `docs/` es la fuente activa del sitio publicado.
- HTML, JS, data, config, partials y assets publicados se editan directamente ahí.

### Build principal

- `npm run build:css`
  - recompila Tailwind legacy hacia `docs/assets/app.css`

- `npm run build`
  - ejecuta `build:css`
  - regenera redirects legacy esperados dentro de `docs/`
  - regenera `docs/sitemap.xml`
  - regenera `docs/robots.txt`

- `npm run export:docs`
  - queda como alias histórico
  - ya no exporta desde otra carpeta
  - solo finaliza `docs/` por compatibilidad con flujos anteriores

- `npm run build:pages`
  - ahora equivale a `npm run build`

### Desarrollo local

- `npm run dev` ya no sirve `dist/`
- ahora sirve `docs/` directamente
- soporta:
  - `/ruta/`
  - `/ruta.html`
  - resolución a `index.html` en carpetas

## Compatibilidad preservada

Se siguen regenerando o respetando estos redirects legacy:

- `/es/tienda.html` -> `/es/tienda/`
- `/es/cotizacion.html` -> `/es/cotizacion/`
- `/es/casos-de-exito.html` -> `/es/casos-de-exito/`
- `/es/nosotros.html` -> `/es/nosotros/`
- `/es/sostenibilidad.html` -> `/es/sostenibilidad/`
- `/es/vg.html` -> `/es/vg/`
- `/es/ventas-gastos-panel.html` -> `/es/vg/`
- `/es/vg/vg.html` -> `/es/vg/`

También se conserva la exclusión funcional del panel `vg` en el resto del stack existente.

## Qué dejó de ser parte del pipeline normal

- `src/`
- `public/`
- `dist/`

Esas carpetas siguen presentes en el repo, pero ya no son la base del build principal del sitio.

## Resultado

La publicación queda centrada en un solo árbol operativo:

- editar `docs/`
- compilar CSS a `docs/assets/app.css`
- finalizar metadata y redirects en `docs/`
- servir y publicar `docs/`
