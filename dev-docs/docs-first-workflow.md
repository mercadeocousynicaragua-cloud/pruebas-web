# Flujo de trabajo docs-first

## Regla principal

La única fuente de verdad del sitio es `docs/`.

- Editar HTML publicado en `docs/`.
- Editar parciales en `docs/partials/`.
- Editar JS en `docs/js/`.
- Editar data en `docs/data/`.
- Editar configuración en `docs/config/`.
- Editar estilos fuente en `docs/styles/tailwind.css`.

No recrear ni volver a introducir:

- `src/`
- `public/`
- `dist/`

## Comandos de trabajo

```bash
npm run build
npm run qa
npm run dev
```

## Qué hace cada comando

- `npm run build`
  - recompila `docs/assets/app.css`
  - regenera redirects legacy `.html`
  - regenera `docs/sitemap.xml`
  - regenera `docs/robots.txt`

- `npm run qa`
  - ejecuta `build`
  - valida invariantes del flujo docs-first
  - confirma archivos clave, aliases legacy, rutas canónicas y exclusión de `vg`

- `npm run dev`
  - compila primero
  - sirve `docs/` localmente en `http://localhost:4321`
  - resuelve rutas canónicas y aliases `.html`

## Convenciones de edición

- Crear páginas nuevas como rutas limpias: `docs/es/slug/index.html`
- Mantener los aliases `.html` como compatibilidad pública, no como fuente de edición
- Si un producto enlaza a tienda, usar `"/es/tienda/#id-del-producto"`
- Mantener `vg` fuera de analytics y con `noindex,nofollow,noarchive`
- No tocar el flujo de cotización por WhatsApp sin revisar `docs/js/cart.js`, `docs/js/tienda.js`, `docs/js/cotizacion.js` y `docs/config/site.json`

## Checklist antes de push

1. Editar solo dentro de `docs/`.
2. Ejecutar `npm run qa`.
3. Si el cambio afecta UI o navegación, revisar con `npm run dev`.
4. Confirmar que `docs/robots.txt`, `docs/sitemap.xml` y aliases legacy sigan presentes.
