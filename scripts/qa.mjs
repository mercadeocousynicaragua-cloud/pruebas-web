import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());

function readText(relPath) {
  return fs.readFileSync(path.join(projectRoot, relPath), "utf8");
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

function exists(relPath) {
  return fs.existsSync(path.join(projectRoot, relPath));
}

const checks = [];
const failures = [];

function check(condition, message) {
  if (condition) {
    checks.push(`OK  ${message}`);
    return;
  }
  failures.push(`FAIL ${message}`);
}

const requiredFiles = [
  "docs/index.html",
  "docs/assets/app.css",
  "docs/config/site.json",
  "docs/data/products.json",
  "docs/js/layout.js",
  "docs/js/tienda.js",
  "docs/partials/header-es.html",
  "docs/robots.txt",
  "docs/sitemap.xml",
  "docs/es/index.html",
  "docs/es/tienda/index.html",
  "docs/es/cotizacion/index.html",
  "docs/es/casos-de-exito/index.html",
  "docs/es/nosotros/index.html",
  "docs/es/sostenibilidad/index.html",
  "docs/es/vg/index.html"
];

requiredFiles.forEach((relPath) => check(exists(relPath), `${relPath} existe`));

const requiredAliases = [
  "docs/es/tienda.html",
  "docs/es/cotizacion.html",
  "docs/es/casos-de-exito.html",
  "docs/es/nosotros.html",
  "docs/es/sostenibilidad.html",
  "docs/es/vg.html",
  "docs/es/vg/vg.html",
  "docs/es/ventas-gastos-panel.html"
];

requiredAliases.forEach((relPath) => {
  check(exists(relPath), `${relPath} existe como compatibilidad legacy`);
  if (exists(relPath)) {
    check(readText(relPath).includes("window.location.replace"), `${relPath} es redirect HTML`);
  }
});

const packageJson = readJson("package.json");
check(
  packageJson.scripts?.["build:css"] === "tailwindcss -i ./docs/styles/tailwind.css -o ./docs/assets/app.css --minify",
  "build:css compila desde docs/styles/tailwind.css"
);
check(packageJson.scripts?.qa === "npm run build && node ./scripts/qa.mjs", "npm run qa esta configurado");

const tiendaJs = readText("docs/js/tienda.js");
check(!tiendaJs.includes("/docs/data/products.json"), "docs/js/tienda.js ya no usa fallback a /docs/data/products.json");

const headerPartial = readText("docs/partials/header-es.html");
[
  "./tienda.html",
  "./cotizacion.html",
  "./casos-de-exito.html",
  "./nosotros.html",
  "./sostenibilidad.html"
].forEach((legacyHref) => {
  check(!headerPartial.includes(`href="${legacyHref}"`), `header-es.html no usa ${legacyHref}`);
});

const products = readJson("docs/data/products.json");
check(
  products.every((product) => typeof product.sourceUrl === "string" && product.sourceUrl.startsWith("/es/tienda/#")),
  "docs/data/products.json usa rutas canonicas /es/tienda/#..."
);

const storeHtml = readText("docs/es/tienda/index.html");
check(!storeHtml.includes("/es/tienda.html#"), "docs/es/tienda/index.html no inyecta sourceUrl legacy");

const publicPages = [
  "docs/es/index.html",
  "docs/es/tienda/index.html",
  "docs/es/cotizacion/index.html",
  "docs/es/casos-de-exito/index.html",
  "docs/es/nosotros/index.html",
  "docs/es/sostenibilidad/index.html"
];

publicPages.forEach((relPath) => {
  const html = readText(relPath);
  check(html.includes('data-site-header') && html.includes('data-partial-injected="1"'), `${relPath} incluye header renderizado`);
  check(html.includes('data-site-footer') && html.includes('data-partial-injected="1"'), `${relPath} incluye footer renderizado`);
  check(html.includes("data-cart-count"), `${relPath} mantiene el badge del carrito de cotizacion`);
  check(html.includes("js-site-nav"), `${relPath} mantiene la navegacion principal`);
});

const rootHtml = readText("docs/index.html");
check(rootHtml.includes('window.location.replace("./es/"'), "docs/index.html redirige a /es/ con ruta canonica");

const serviceWorker = readText("docs/service-worker.js");
[
  './es/',
  './es/tienda/',
  './es/cotizacion/',
  './es/casos-de-exito/',
  './es/nosotros/',
  './es/sostenibilidad/',
  './es/vg/'
].forEach((route) => {
  check(serviceWorker.includes(`"${route}"`), `service-worker precachea ${route}`);
});

const robots = readText("docs/robots.txt");
check(robots.includes("Sitemap: https://cousynicaragua.com/sitemap.xml"), "robots.txt publica el sitemap canonico");

const sitemap = readText("docs/sitemap.xml");
[
  "https://cousynicaragua.com/",
  "https://cousynicaragua.com/es/",
  "https://cousynicaragua.com/es/tienda/",
  "https://cousynicaragua.com/es/casos-de-exito/",
  "https://cousynicaragua.com/es/nosotros/",
  "https://cousynicaragua.com/es/sostenibilidad/"
].forEach((url) => {
  check(sitemap.includes(url), `sitemap.xml contiene ${url}`);
});

const vgHtml = readText("docs/es/vg/index.html");
check(vgHtml.includes('content="noindex,nofollow,noarchive"'), "vg mantiene noindex,nofollow,noarchive");
check(!vgHtml.includes("googletagmanager.com/gtm.js"), "vg no carga GTM");

checks.forEach((line) => console.log(line));
if (failures.length) {
  failures.forEach((line) => console.error(line));
  process.exitCode = 1;
} else {
  console.log(`OK  QA docs-first completado (${checks.length} comprobaciones)`);
}
