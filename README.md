<h1 align="center">Cousy Nicaragua Web</h1>

<p align="center">
  Sitio web estatico B2B para cotizaciones por WhatsApp, SEO bilingue y experiencia mobile-first.
</p>

<p align="center">
  <img src="./docs/assets/logo-cousy.png" alt="Cousy Nicaragua" width="96" />
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-en%20desarrollo-ec1665" />
  <img alt="Stack" src="https://img.shields.io/badge/stack-HTML%20%2B%20JS%20%2B%20Tailwind-73a35a" />
  <img alt="Hosting" src="https://img.shields.io/badge/hosting-GitHub%20Pages-dde0e1" />
</p>

<hr />

<h2>Estado Actual</h2>

<p>
  El repo ya opera en modo <strong>docs-first</strong>: <code>docs/</code> es la fuente de verdad
  para HTML, JS, data, config, parciales, assets publicados y CSS compilado.
</p>

<p>
  A partir de la Fase 4, el flujo oficial es editar <strong>solo</strong> dentro de <code>docs/</code>.
  No se deben recrear carpetas fuente paralelas como <code>src/</code>, <code>public/</code> o <code>dist/</code>.
</p>

<h2>Tecnologias Que Utilizamos</h2>

<table>
  <thead>
    <tr>
      <th>Tecnologia</th>
      <th>Uso en el proyecto</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>HTML + JavaScript (Vanilla)</td>
      <td>Estructura de paginas, logica de UI y flujo de cotizacion.</td>
    </tr>
    <tr>
      <td>Tailwind CSS</td>
      <td>Estilos utilitarios compilados desde <code>docs/styles/tailwind.css</code> hacia <code>docs/assets/app.css</code>.</td>
    </tr>
    <tr>
      <td>Node.js + scripts custom</td>
      <td>Build minimo centrado en <code>docs/</code>, con sitemap, robots y redirects legacy.</td>
    </tr>
    <tr>
      <td>GitHub Pages</td>
      <td>Hosting estatico publicando desde <code>/docs</code>.</td>
    </tr>
    <tr>
      <td>PWA (Manifest + Service Worker)</td>
      <td>Instalacion en celular y cache para carga mas rapida.</td>
    </tr>
    <tr>
      <td>Google Apps Script (proxy)</td>
      <td>Proteccion de key de Google Reviews fuera del frontend.</td>
    </tr>
  </tbody>
</table>

<h2>Metodos De Trabajo</h2>

<ul>
  <li><strong>Mobile-first:</strong> primero en pantallas 360-430px, luego escalado a desktop.</li>
  <li><strong>SEO bilingue:</strong> arquitectura equivalente en <code>/es/</code> y <code>/en/</code>.</li>
  <li><strong>Accesibilidad:</strong> enfoque visible, targets tactiles amplios y contraste AA.</li>
  <li><strong>Performance:</strong> assets optimizados, carga eficiente y rutas relativas seguras.</li>
  <li><strong>Seguridad:</strong> secretos fuera del cliente y consumo controlado de APIs externas.</li>
  <li><strong>Conversion B2B:</strong> CTA claros para cotizar por WhatsApp en todo el flujo.</li>
</ul>

<h2>Estructura Del Repo</h2>

<ul>
  <li><code>docs/</code>: fuente de verdad del sitio publicado.</li>
  <li><code>docs/styles/</code>: entrada de Tailwind.</li>
  <li><code>docs/js/</code>: logica frontend y flujo de cotizacion.</li>
  <li><code>docs/data/</code> y <code>docs/config/</code>: datos y configuracion del sitio.</li>
  <li><code>docs/partials/</code>: parciales HTML inyectables.</li>
  <li><code>docs/assets/</code>, <code>docs/fonts/</code> y <code>docs/icons/</code>: assets publicados.</li>
  <li><code>scripts/</code>: build y servidor de desarrollo local.</li>
  <li><code>dev-docs/</code>: auditorias y documentacion de migracion.</li>
</ul>

<h2>Comandos De Trabajo</h2>

```bash
# Desarrollo local
npm run dev

# Compilar CSS publicado en docs/assets/app.css
npm run build:css

# Finalizar docs/ para publicacion
npm run build

# QA docs-first
npm run qa

# Alias historico compatible con el flujo anterior
npm run export:docs

# Build final para Pages
npm run build:pages
```

<h2>Flujo Docs-First</h2>

<ol>
  <li>Editar contenido, parciales, JS, data, config o estilos directamente en <code>docs/</code>.</li>
  <li>Ejecutar <code>npm run build</code> para recompilar CSS y regenerar sitemap, robots y aliases legacy.</li>
  <li>Ejecutar <code>npm run qa</code> para validar invariantes del flujo docs-first.</li>
  <li>Si el cambio toca UX o navegación, revisar localmente con <code>npm run dev</code>.</li>
</ol>

<h2>Publicacion En GitHub Pages</h2>

<ol>
  <li>Configurar Pages en <strong>main / docs</strong>.</li>
  <li>Editar primero en <code>docs/</code>.</li>
  <li>Ejecutar <code>npm run qa</code> antes de push.</li>
  <li>Si se cambian estilos o plantillas, ejecutar <code>npm run build:pages</code> antes de push.</li>
  <li>Confirmar que exista <code>.nojekyll</code> dentro de <code>docs/</code>.</li>
</ol>

<h2>Nota De Migracion</h2>

<p>
  Fase 4 de la migracion docs-first completada: el proyecto queda listo para editarse solo en <code>docs/</code>.
  El pipeline duplicado <code>src -&gt; dist -&gt; docs</code> fue retirado y el sitio se valida ahora directamente sobre <code>docs/</code>, manteniendo
  <code>assets/app.css</code>, <code>sitemap.xml</code>, <code>robots.txt</code> y los redirects
  legacy <code>.html</code>.
</p>

<h2>Documentacion Interna</h2>

<ul>
  <li><code>AGENTS.md</code>: reglas del proyecto, SEO, UX y validacion.</li>
  <li><code>dev-docs/docs-first-workflow.md</code>: flujo operativo permanente para trabajar solo en <code>docs/</code>.</li>
  <li><code>dev-docs/apps-script/README.md</code>: guia del proxy de reseñas.</li>
</ul>
