import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = path.resolve(process.cwd());
const docsDir = path.join(projectRoot, "docs");
const docsConfigDir = path.join(docsDir, "config");
const docsSiteConfigFile = path.join(docsConfigDir, "site.json");
const LAYOUT_PARTIALS = Object.freeze({
  es: Object.freeze({
    header: "partials/header-es.html",
    footer: "partials/footer-es.html",
    routes: Object.freeze({
      home: "es/index.html",
      store: "es/tienda/index.html",
      successCases: "es/casos-de-exito/index.html",
      about: "es/nosotros/index.html",
      sustainability: "es/sostenibilidad/index.html",
      quote: "es/cotizacion/index.html"
    })
  })
});

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeSiteUrl(siteUrl) {
  const raw = String(siteUrl ?? "").trim();
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function normalizeSitemapPath(rawPath) {
  const trimmed = String(rawPath ?? "").trim();
  if (!trimmed) return "";

  const normalized = trimmed.replaceAll("\\", "/");
  if (normalized === "/index.html" || normalized === "index.html") return "/";
  if (normalized.endsWith("/index.html")) {
    return `${normalized.slice(0, -"/index.html".length)}/`;
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function canonicalPathForOutPath(relOutPath) {
  const rel = String(relOutPath).replaceAll("\\", "/").replaceAll(/^\.\//g, "");
  if (!rel || rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"/index.html".length)}/`;
  return `/${rel}`;
}

function toPosixRelPath(filePath) {
  return String(filePath).replaceAll("\\", "/").replaceAll(/^\.\//g, "");
}

function listHtmlRelPaths(dirPath, baseDir = dirPath) {
  const out = [];
  if (!fs.existsSync(dirPath)) return out;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      out.push(...listHtmlRelPaths(full, baseDir));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    out.push(toPosixRelPath(path.relative(baseDir, full)));
  }

  return out;
}

function isCanonicalPageRel(relPath) {
  const rel = toPosixRelPath(relPath);
  if (rel.startsWith("partials/")) return false;
  return rel === "index.html" || rel.endsWith("/index.html");
}

function extractHtmlLang(html) {
  const match = String(html).match(/<html[^>]*\blang=(["'])([^"']+)\1/i);
  return match?.[2] || "es";
}

function relativeHref(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replaceAll("\\", "/");
  if (rel === "index.html") rel = ".";
  else if (rel.endsWith("/index.html")) rel = rel.slice(0, -"index.html".length);
  if (!rel || rel === ".") return "./";
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function relativeAssetPath(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replaceAll("\\", "/");
  if (!rel) return "./";
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function updatePartialRouteHrefs(partialHtml, relPagePath, routes) {
  return String(partialHtml).replace(/<a\b[^>]*\bdata-nav-route="([^"]+)"[^>]*>/gi, (match, routeKey) => {
      const targetRelPath = routes?.[routeKey];
      if (!targetRelPath) return match;
      return match.replace(/\bhref="[^"]*"/i, `href="${relativeHref(relPagePath, targetRelPath)}"`);
    });
}

function updatePartialAssetPaths(partialHtml, relPagePath) {
  const logoRelPath = "assets/logo-cousy.webp";
  return String(partialHtml).replace(
    /(<img\b[^>]*\bdata-nav-asset="logo"[^>]*\bsrc=")[^"]*(")/gi,
    (_, before, after) => `${before}${relativeAssetPath(relPagePath, logoRelPath)}${after}`
  );
}

function renderPartialForPage(partialHtml, relPagePath, layoutConfig) {
  let rendered = String(partialHtml);
  rendered = updatePartialRouteHrefs(rendered, relPagePath, layoutConfig.routes);
  rendered = updatePartialAssetPaths(rendered, relPagePath);
  return rendered.trim();
}

function replaceShellRegion(html, markerAttr, renderedPartial) {
  const tagName = markerAttr === "data-site-header" ? "header" : "footer";
  const siteIdPrefix = tagName === "header" ? "site-header" : "site-footer";
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>[\\s\\S]*?<\\/${tagName}>`, "i");

  return String(html).replace(pattern, (match, attrs = "") => {
    const hasMarker = new RegExp(`\\b${markerAttr}\\b`, "i").test(attrs);
    const hasSiteId = new RegExp(`\\bid=(["'])${siteIdPrefix}[^"'<>]*\\1`, "i").test(attrs);
    if (!hasMarker && !hasSiteId) return match;

    const nextAttrsSource = hasMarker ? attrs : `${attrs} ${markerAttr}`;
    const nextAttrs = nextAttrsSource
      .replace(new RegExp(`\\s${markerAttr}\\b`, "gi"), "")
      .replace(/\sdata-partial-injected=(["']).*?\1/i, "");
    return `<${tagName}${nextAttrs} ${markerAttr} data-partial-injected="1">\n${renderedPartial}\n    </${tagName}>`;
  });
}

function inlineLayoutPartials() {
  const canonicalPages = listHtmlRelPaths(docsDir).filter((rel) => isCanonicalPageRel(rel));

  for (const relPagePath of canonicalPages) {
    const absPagePath = path.join(docsDir, relPagePath);
    const originalHtml = fs.readFileSync(absPagePath, "utf8");
    const lang = extractHtmlLang(originalHtml);
    const layoutConfig = LAYOUT_PARTIALS[lang];
    const hasHeaderShell = originalHtml.includes("data-site-header") || originalHtml.includes('id="site-header');
    const hasFooterShell = originalHtml.includes("data-site-footer") || originalHtml.includes('id="site-footer');

    if (!layoutConfig) continue;
    if (!hasHeaderShell && !hasFooterShell) {
      continue;
    }

    let nextHtml = originalHtml;

    if (hasHeaderShell) {
      const headerHtml = fs.readFileSync(path.join(docsDir, layoutConfig.header), "utf8");
      nextHtml = replaceShellRegion(
        nextHtml,
        "data-site-header",
        renderPartialForPage(headerHtml, relPagePath, layoutConfig)
      );
    }

    if (hasFooterShell) {
      const footerHtml = fs.readFileSync(path.join(docsDir, layoutConfig.footer), "utf8").trim();
      nextHtml = replaceShellRegion(nextHtml, "data-site-footer", footerHtml);
    }

    if (nextHtml !== originalHtml) {
      fs.writeFileSync(absPagePath, nextHtml, "utf8");
    }
  }
}

function buildLegacyRedirectHtml({ targetHref, lang }) {
  const safeTarget = String(targetHref || "./");
  const safeLang = String(lang || "es");
  return `<!doctype html>
<html lang="${safeLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex,follow" />
    <title>Redirecting...</title>
    <link rel="canonical" href="${safeTarget}" />
    <noscript><meta http-equiv="refresh" content="0; url=${safeTarget}" /></noscript>
    <script>
      (function () {
        var target = ${JSON.stringify(safeTarget)};
        window.location.replace(target + window.location.search + window.location.hash);
      })();
    </script>
  </head>
  <body></body>
</html>
`;
}

function listLegacyAliasesForCanonical(relCanonicalPath) {
  const rel = toPosixRelPath(relCanonicalPath);
  if (rel === "index.html" || rel === "es/index.html" || rel === "en/index.html") return [];

  if (rel === "es/vg/index.html") {
    return ["es/ventas-gastos-panel.html", "es/vg.html", "es/vg/vg.html"];
  }

  if (!rel.endsWith("/index.html")) return [];
  return [`${rel.slice(0, -"/index.html".length)}.html`];
}

function ensureLegacyRedirects() {
  const canonicalPages = listHtmlRelPaths(docsDir).filter((rel) => isCanonicalPageRel(rel));

  for (const relCanonicalPath of canonicalPages) {
    const canonicalAbsPath = path.join(docsDir, relCanonicalPath);
    const canonicalHtml = fs.readFileSync(canonicalAbsPath, "utf8");
    const lang = extractHtmlLang(canonicalHtml);

    for (const aliasRelPath of listLegacyAliasesForCanonical(relCanonicalPath)) {
      const aliasAbsPath = path.join(docsDir, aliasRelPath);
      const targetHref = relativeHref(aliasAbsPath, canonicalAbsPath);
      const redirectHtml = buildLegacyRedirectHtml({ targetHref, lang });

      fs.mkdirSync(path.dirname(aliasAbsPath), { recursive: true });
      fs.writeFileSync(aliasAbsPath, redirectHtml, "utf8");
    }
  }
}

function writeSitemapAndRobots({ siteUrl, manualPaths = [] }) {
  if (!siteUrl) return;

  const relHtml = listHtmlRelPaths(docsDir).filter((rel) => isCanonicalPageRel(rel));
  const indexable = relHtml.filter((rel) => {
    const full = path.join(docsDir, rel);
    const html = fs.readFileSync(full, "utf8");
    return !/<meta\s+name="robots"\s+content="[^"]*\bnoindex\b/i.test(html);
  });

  const discoveredPaths = indexable.map((rel) => canonicalPathForOutPath(rel)).filter(Boolean);
  const normalizedManualPaths = manualPaths.map((rel) => normalizeSitemapPath(rel)).filter(Boolean);
  const paths = Array.from(new Set([...discoveredPaths, ...normalizedManualPaths])).sort((a, b) =>
    a.localeCompare(b)
  );

  const sitemapXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((rel) => `  <url>\n    <loc>${siteUrl}${rel === "/" ? "/" : rel}</loc>\n  </url>`).join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(path.join(docsDir, "sitemap.xml"), sitemapXml, "utf8");
  fs.writeFileSync(
    path.join(docsDir, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
    "utf8"
  );
}

export function finalizeDocsSite() {
  if (!fs.existsSync(docsDir)) {
    throw new Error("No existe `docs/`, que es la fuente de verdad del sitio.");
  }

  const siteConfig = readJson(docsSiteConfigFile);
  const siteUrl = normalizeSiteUrl(siteConfig.siteUrl);
  const manualSitemapPaths = Array.isArray(siteConfig.manualSitemapPaths)
    ? siteConfig.manualSitemapPaths
    : [];

  inlineLayoutPartials();
  ensureLegacyRedirects();
  writeSitemapAndRobots({ siteUrl, manualPaths: manualSitemapPaths });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  finalizeDocsSite();
}
