# Guía del proyecto (Cousy Web)

Este repo es un sitio estático pensado para **GitHub Pages** y para posicionamiento SEO en **ES (LatAm)** y **EN (US/Global)**.

## Objetivo del proyecto

- Generar leads **B2B** y solicitudes de **cotización** (regalos corporativos / producción textil sostenible / personalización).
- Soportar **envíos a todo el mundo**, envíos **locales en Nicaragua**, y comunicarlo claramente.
- Mantener un **SEO excelente** (técnico + contenido) en dos idiomas:
  - Español: posicionamiento en Latinoamérica.
  - Inglés: posicionamiento en Estados Unidos.
- Experiencia **mobile-first**, tema **claro** (light), rápida y accesible.

## Alcance (cotizador B2B por WhatsApp)

- Esto **NO** es una tienda en línea: no hay checkout, pagos, ni “comprar ahora”.
- Flujo actual (se debe preservar):
  - Catálogo de productos → “Añadir a cotización” (carrito de cotización).
  - Página de cotización → ajustar cantidades + notas.
  - Envío → abrir WhatsApp con el mensaje prearmado para cotizar.

## Stack usado

- Sitio estático: **HTML + JS** (vanilla).
- Estilos: **Tailwind CSS** (compilado a `assets/app.css`).
- Build: **Node.js** (scripts propios en `scripts/`).
- Hosting: **GitHub Pages** publicando desde **`/docs`**.

## Estructura de carpetas

- `docs/index.html`: página principal publicada.
- `docs/js/`: JS fuente.
- `docs/styles/`: CSS fuente (Tailwind input).
- `docs/data/`: data JSON para render o consumo en el frontend.
- `docs/config/`: configuración del sitio (JSON).
- `docs/assets/`: imágenes, descargas y CSS compilado publicado.
- `docs/partials/`: parciales HTML (header/footer) inyectados por `docs/js/layout.js`.
- `docs/fonts/` y `docs/icons/`: assets publicados.
- `scripts/`: scripts de build/dev.
- `dev-docs/`: auditorías y notas de migración.

### Regla docs-first

- Editar solo dentro de `docs/`.
- No recrear `src/`, `public/` ni `dist/`.
- Conservar los aliases legacy `.html` como compatibilidad pública, pero no usarlos como fuente de edición.

### Estructura publicada esperada

```text
docs/
  index.html
  robots.txt
  sitemap.xml
  es/
    index.html
    tienda/
      index.html
    tienda.html
    cotizacion/
      index.html
    cotizacion.html
    casos-de-exito/
      index.html
    nosotros/
      index.html
    sostenibilidad/
      index.html
    vg/
      index.html
    vg.html
  assets/
  js/
  data/
  config/
  partials/
```

Además, la publicación debe conservar:

- rutas limpias como canónicas (`/es/tienda/`)
- aliases legacy `.html` como compatibilidad (`/es/tienda.html`)
- exclusión de analytics y foco no indexable para `vg`

La estructura base recomendada sigue siendo:

```text
docs/
  index.html
  es/
  en/
  assets/
  css/
  js/
  images/
  icons/
  fonts/
  downloads/
```

## Convenciones de código

- **Mobile-first**: diseñar y probar primero en 360–430px; luego escalar con breakpoints.
- **Tema claro**: fondos claros por defecto; contraste AA mínimo para texto; evitar overlays oscuros salvo hero.
- **HTML**
  - Semántico (`header`, `nav`, `main`, `section`, `footer`) y headings en orden.
  - `lang` correcto por idioma (`es` / `en`) y metadatos coherentes.
  - Links relativos tipo `./pagina.html` para navegación interna.
- **CSS/Tailwind**
  - Preferir utilidades Tailwind; si se necesita CSS custom, mantenerlo mínimo y en `docs/styles/`.
  - Evitar “magic numbers” repetidos; usar tokens/variables del diseño cuando existan.
- **JS**
  - Preferir `type="module"` y funciones pequeñas.
  - Usar `data-*` para hooks de UI (ej: `data-cart-count`) en vez de clases de estilo.
  - No depender de APIs que rompan en Safari iOS sin polyfills.
- **Contenido**
  - Copy orientado a B2B: beneficios, tiempos, personalización, MOQ si aplica, proceso de cotización y contacto.
  - Evitar texto “placeholder” en producción.

## Qué NO debe tocar (sin pedir confirmación)

- `CNAME`: define el dominio en GitHub Pages.
- `.nojekyll`: necesario para servir carpetas que empiezan con `_` (ej: `assets/_...`).
- Estructura de salida publicada en `/` (`assets/`, `js/`, etc) salvo que el build lo regenere.
- Archivos dentro de `assets/_*-download/` (se sirven tal cual; cuidado con rutas y nombres).
- Flujo/formato de cotización por WhatsApp:
  - `docs/js/cart.js`: `CART_KEY`, `NOTES_KEY`, `buildWhatsappText()`, `whatsappLink()`.
  - `docs/js/tienda.js`: objeto producto `{ id, name, image, sourceUrl }` que se agrega al carrito.
  - `docs/js/cotizacion.js`: IDs/selectores de UI (ej: `#quote-send`, `#quote-items`, `#quote-notes`) y evento `cousy:cart-changed`.
  - `docs/config/site.json`: claves `whatsappNumber` y `whatsappGreeting`.

## Cómo correr tests

- Actualmente **no hay tests automatizados**.
- Validación se hace con build + smoke-check manual.

## Cómo validar cambios (checklist)

- Build: `npm run build` (recompila CSS y finaliza `docs/`).
- QA docs-first: `npm run qa`.
- Publicación: `npm run build:pages` (alias de build para Pages).
- Compatibilidad histórica: `npm run export:docs` (alias de build).
- Smoke test local: `npm run dev` y revisar:
  - Navegación entre páginas, carga de imágenes, y flujo de cotización:
    - `/es/tienda/` → “Añadir a cotización” → `/es/cotizacion/` → “Enviar por WhatsApp”.
    - `/es/tienda.html` y `/es/cotizacion.html` deben redirigir a sus rutas canónicas.
  - 404s en consola/network (paths relativos).
  - Performance percibida en móvil.
- SEO técnico:
  - `docs/sitemap.xml`, `docs/robots.txt`, títulos y meta descriptions.
  - Canonical + dominio consistente (importante: `CNAME`, canonical en HTML y `sitemap.xml` deben alinearse).

## Reglas UI/UX

- Mobile-first, sin “saltos” de layout: reservar alturas (`width/height`, `aspect-*`) en imágenes.
- Accesibilidad:
  - Targets táctiles >= 44px, foco visible, `aria-label` donde corresponda.
  - Contraste suficiente; no comunicar solo por color.
- Conversión B2B:
  - CTA claro (“Cotizar por WhatsApp”, “Añadir a cotización”, “Solicitar catálogo”, “Hablar con ventas”).
  - Propuesta de valor arriba del fold, con prueba social/credenciales donde aplique.
- Internacionalización:
  - Mantener estructura equivalente ES/EN (misma arquitectura + URLs claras).
  - Evitar mezclar idiomas en una misma página.

## Bilingüe (EN/ES) y páginas recomendadas

- Estrategia sugerida:
  - Raíz `/`: landing/puerta de entrada ligera.
  - Español publicado en `/es/`: `docs/es/index.html`, `docs/es/tienda/index.html`, `docs/es/cotizacion/index.html`, etc.
  - Inglés bajo `/en/` solo cuando exista contenido real equivalente.
- Cuando existan páginas EN:
  - Agregar `hreflang` (`es` y `en`) y alternates por página.
  - Incluir URLs EN en `sitemap.xml` (solo si están publicadas y con contenido real).

## Formato de respuestas / documentación (para cambios en el repo)

- Describir cambios en bullets cortos.
- Incluir cómo validar: comando(s) exactos (`npm run ...`) y qué revisar.
- Si el cambio afecta SEO/i18n, listar explícitamente: canonical, sitemap, robots y navegación ES/EN.


# Colores que debes utilizar
- #ffffff principal
- #ec1665 secundario (para botones o donde se requiera la atencion del cliente)
- #73a35a secundario Para destacar ecologia en secmentos
- #dde0e1 secundario
