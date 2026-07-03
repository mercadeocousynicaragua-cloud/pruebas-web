const INSTALL_PROMPT_STORAGE_KEY = "cousy:pwa-install-snooze-until";
const INSTALL_PROMPT_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const INSTALL_PROMPT_INSTALLED_MS = 180 * 24 * 60 * 60 * 1000;

let swRegisterPromise = null;
let installUiEventsReady = false;
let deferredInstallPrompt = null;

function normalizePathname(pathname) {
  let normalized = String(pathname ?? "/").replace(/\/+/g, "/");
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized || "/";
}

function rootPrefix() {
  const pathname = String(window.location?.pathname ?? "/").replace(/\/+/g, "/");
  let dirPath = pathname;

  if (dirPath.endsWith("/")) {
    // already a directory path
  } else if (/\/[^/]+\.[a-z0-9]+$/i.test(dirPath)) {
    dirPath = dirPath.replace(/\/[^/]+$/, "/");
  } else {
    dirPath = `${dirPath}/`;
  }

  const depth = dirPath.split("/").filter(Boolean).length;
  if (depth <= 0) return ".";
  return Array(depth).fill("..").join("/");
}

function basePathPrefix() {
  const pathname = String(window.location?.pathname ?? "/").replace(/\/+/g, "/");
  let dirPath = pathname;

  if (dirPath.endsWith("/")) {
    // already a directory path
  } else if (/\/[^/]+\.[a-z0-9]+$/i.test(dirPath)) {
    dirPath = dirPath.replace(/\/[^/]+$/, "/");
  } else {
    dirPath = `${dirPath}/`;
  }

  const segments = dirPath.split("/").filter(Boolean);
  const langIndex = segments.findIndex((segment) => segment === "es");
  if (langIndex <= 0) return "";

  return `/${segments.slice(0, langIndex).join("/")}`;
}

function fromRoot(relPath) {
  const cleaned = String(relPath).replace(/^\.?\//, "");
  const basePath = basePathPrefix();

  if (!basePath) return `${rootPrefix()}/${cleaned}`;
  return `${basePath}/${cleaned}`.replace(/\/{2,}/g, "/");
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosDevice() {
  const ua = String(window.navigator.userAgent ?? "");
  return /iphone|ipad|ipod/i.test(ua);
}

function shouldSkipInstallUi() {
  const path = normalizePathname(window.location?.pathname ?? "/");
  return path === "/es/vg" || path.startsWith("/es/vg/");
}

function readInstallSnoozeUntil() {
  try {
    return Number(window.localStorage.getItem(INSTALL_PROMPT_STORAGE_KEY) ?? "0");
  } catch {
    return 0;
  }
}

function isInstallPromptSnoozed() {
  return readInstallSnoozeUntil() > Date.now();
}

function snoozeInstallPrompt(durationMs) {
  try {
    window.localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, String(Date.now() + durationMs));
  } catch {
    // noop
  }
}

function clearInstallSnooze() {
  try {
    window.localStorage.removeItem(INSTALL_PROMPT_STORAGE_KEY);
  } catch {
    // noop
  }
}

function ensureInstallPromptStyles() {
  if (document.getElementById("cousy-pwa-install-styles")) return;

  const style = document.createElement("style");
  style.id = "cousy-pwa-install-styles";
  style.textContent = `
    #cousy-pwa-install {
      position: fixed;
      left: 1rem;
      right: 1rem;
      bottom: 1rem;
      z-index: 80;
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    #cousy-pwa-install [data-pwa-card] {
      width: min(100%, 30rem);
      border: 1px solid #dde0e1;
      border-radius: 1.1rem;
      background: #ffffff;
      box-shadow: 0 18px 45px rgba(17, 24, 39, 0.16);
      padding: 1rem;
      pointer-events: auto;
    }

    #cousy-pwa-install [data-pwa-badge] {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      background: rgba(115, 163, 90, 0.12);
      color: #73a35a;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      padding: 0.32rem 0.62rem;
    }

    #cousy-pwa-install [data-pwa-title] {
      margin: 0.7rem 0 0;
      color: #111827;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.35;
    }

    #cousy-pwa-install [data-pwa-copy] {
      margin: 0.45rem 0 0;
      color: rgba(17, 24, 39, 0.76);
      font-size: 0.94rem;
      line-height: 1.55;
    }

    #cousy-pwa-install [data-pwa-actions] {
      display: flex;
      flex-wrap: wrap;
      gap: 0.7rem;
      margin-top: 0.9rem;
    }

    #cousy-pwa-install [data-pwa-button] {
      display: inline-flex;
      min-height: 2.9rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.9rem;
      border: 1px solid transparent;
      cursor: pointer;
      font: inherit;
      padding: 0.8rem 1rem;
      text-decoration: none;
    }

    #cousy-pwa-install [data-pwa-button="primary"] {
      background: #ec1665;
      color: #ffffff;
      font-weight: 700;
    }

    #cousy-pwa-install [data-pwa-button="secondary"] {
      background: #ffffff;
      border-color: #dde0e1;
      color: #111827;
      font-weight: 600;
    }

    @media (min-width: 640px) {
      #cousy-pwa-install {
        left: auto;
        right: 1.25rem;
      }

      #cousy-pwa-install [data-pwa-card] {
        width: 28rem;
      }
    }
  `;

  document.head.appendChild(style);
}

function removeInstallPromptUi() {
  document.getElementById("cousy-pwa-install")?.remove();
}

async function handleNativeInstall() {
  if (!deferredInstallPrompt) return;

  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  removeInstallPromptUi();

  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice?.outcome === "accepted") {
      snoozeInstallPrompt(INSTALL_PROMPT_INSTALLED_MS);
      return;
    }
  } catch {
    // noop
  }

  snoozeInstallPrompt(INSTALL_PROMPT_DISMISS_MS);
}

function buildInstallPromptCopy(mode) {
  if (mode === "ios") {
    return {
      title: "Instala Cousy en tu pantalla de inicio",
      body: "En iPhone o iPad, usa Compartir y luego toca Agregar a pantalla de inicio para abrir Cousy como app.",
      primaryLabel: "Entendido",
      secondaryLabel: "Ahora no"
    };
  }

  return {
    title: "Instala Cousy como app",
    body: "Guarda el sitio en tu pantalla de inicio para abrir el catálogo y la cotización con una experiencia más rápida y tipo app.",
    primaryLabel: "Instalar app",
    secondaryLabel: "Ahora no"
  };
}

function renderInstallPromptUi(mode) {
  if (!document.body) return;

  ensureInstallPromptStyles();
  removeInstallPromptUi();

  const copy = buildInstallPromptCopy(mode);
  const wrapper = document.createElement("aside");
  wrapper.id = "cousy-pwa-install";
  wrapper.setAttribute("aria-live", "polite");
  wrapper.innerHTML = `
    <div data-pwa-card>
      <span data-pwa-badge>App web</span>
      <p data-pwa-title>${copy.title}</p>
      <p data-pwa-copy>${copy.body}</p>
      <div data-pwa-actions>
        <button type="button" data-pwa-button="primary">${copy.primaryLabel}</button>
        <button type="button" data-pwa-button="secondary">${copy.secondaryLabel}</button>
      </div>
    </div>
  `;

  const [primaryButton, secondaryButton] = wrapper.querySelectorAll("button");

  primaryButton?.addEventListener("click", async () => {
    if (mode === "native") {
      await handleNativeInstall();
      return;
    }
    snoozeInstallPrompt(INSTALL_PROMPT_DISMISS_MS);
    removeInstallPromptUi();
  });

  secondaryButton?.addEventListener("click", () => {
    snoozeInstallPrompt(INSTALL_PROMPT_DISMISS_MS);
    removeInstallPromptUi();
  });

  document.body.appendChild(wrapper);
}

function updateInstallPromptUi() {
  if (shouldSkipInstallUi() || isStandaloneMode() || isInstallPromptSnoozed()) {
    removeInstallPromptUi();
    return;
  }

  if (deferredInstallPrompt) {
    renderInstallPromptUi("native");
    return;
  }

  if (isIosDevice()) {
    renderInstallPromptUi("ios");
    return;
  }

  removeInstallPromptUi();
}

function ensureInstallUiEvents() {
  if (installUiEventsReady) return;
  installUiEventsReady = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    if (shouldSkipInstallUi()) return;
    event.preventDefault();
    clearInstallSnooze();
    deferredInstallPrompt = event;
    updateInstallPromptUi();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    snoozeInstallPrompt(INSTALL_PROMPT_INSTALLED_MS);
    removeInstallPromptUi();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      updateInstallPromptUi();
    }
  });
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  if (swRegisterPromise) return swRegisterPromise;

  swRegisterPromise = navigator.serviceWorker.register(fromRoot("service-worker.js")).catch(() => null);
  return swRegisterPromise;
}

export async function initPwa() {
  ensureInstallUiEvents();
  await registerServiceWorker();
  updateInstallPromptUi();
}

function runInit() {
  void initPwa();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runInit, { once: true });
} else {
  runInit();
}

document.addEventListener("turbo:load", runInit);
