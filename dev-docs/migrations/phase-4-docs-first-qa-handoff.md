# Fase 4 - QA final y handoff docs-first

## Objetivo

Cerrar la migración docs-first con QA final, corrección de regresiones y documentación del flujo permanente para editar solo en `docs/`.

## Ajustes aplicados

- Se eliminaron referencias internas que seguían apuntando a aliases o rutas legacy como fuente:
  - fallback a `/docs/data/products.json`
  - `sourceUrl` de productos hacia `/es/tienda.html#...`
  - enlaces fuente de `header-es.html` hacia `.html`
  - redirect root hacia `./es/index.html`
- Se normalizó el precache del service worker para incluir rutas canónicas y compatibilidad legacy.
- Se agregó `npm run qa` con validaciones automáticas del flujo docs-first.
- Se creó `dev-docs/docs-first-workflow.md` como guía operativa permanente.

## QA esperado

```bash
npm run qa
npm run dev
```

## Señales de cierre exitoso

- `docs/` sigue siendo la única fuente real.
- Las rutas canónicas funcionan:
  - `/`
  - `/es/`
  - `/es/tienda/`
  - `/es/cotizacion/`
- Los aliases legacy siguen funcionando:
  - `/es/tienda.html`
  - `/es/cotizacion.html`
  - `/es/vg.html`
  - `/es/vg/vg.html`
- `vg` sigue fuera de analytics y con `noindex,nofollow,noarchive`.
