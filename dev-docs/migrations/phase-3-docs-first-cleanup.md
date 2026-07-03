# Fase 3 - docs-first cleanup

## Objetivo

Eliminar de forma segura las carpetas y flujos duplicados que dejaron de ser fuente real despues de la migracion docs-first, manteniendo compatibilidad funcional y visual.

## Cambios aplicados

- `docs/styles/tailwind.css` pasa a ser la entrada oficial de Tailwind.
- `npm run build:css` compila desde `docs/styles/tailwind.css` hacia `docs/assets/app.css`.
- `tailwind.config.cjs` ahora escanea solo `docs/**/*.html` y `docs/**/*.js`.
- `npm run export:docs` queda como alias de compatibilidad hacia `npm run build`.
- Se retiran los flujos duplicados:
  - `src/`
  - `public/`
  - `dist/`
  - `scripts/export-docs.mjs`
  - `scripts/clean-cousy-assets.ps1`

## Validacion previa al borrado

- Equivalencia de contenido fuente vs espejo legacy confirmada en:
  - `docs/js/analytics.js` == `src/js/analytics.js`
  - `docs/js/layout.js` == `src/js/layout.js`
  - `docs/data/products.json` == `src/data/products.json`
  - `docs/config/site.json` == `src/config/site.json`
  - `docs/partials/header-es.html` == `public/partials/header-es.html`
  - `docs/service-worker.js` == `public/service-worker.js`
  - `docs/manifest.json` == `public/manifest.json`
- Hash CSS base antes del cleanup:
  - `docs/assets/app.css` -> `dc8fc5227bf174b6fd66ff4e9d703cc8ee2c284eac1972c538180a4b2fa5fa4d`
- Smoke funcional previo:
  - `/`
  - `/es/tienda/`
  - `/es/tienda.html`

## Validacion posterior esperada

Ejecutar:

```bash
npm run build
npm run build:pages
npm run dev
```

Revisar:

- `docs/assets/app.css` mantiene el mismo hash.
- `docs/sitemap.xml` y `docs/robots.txt` se regeneran.
- `/es/tienda/` sigue sirviendo la pagina canonica.
- `/es/tienda.html`, `/es/cotizacion.html`, `/es/vg.html` y `/es/vg/vg.html` siguen funcionando como compatibilidad legacy.
