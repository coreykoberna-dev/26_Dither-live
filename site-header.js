(function () {
  const LOGOTYPE_TEXTURE_SRC = "assets/video/dither-magic.mp4";
  const LOGOTYPE_TEXTURE_WIDTH = 229;
  const LOGOTYPE_TEXTURE_HEIGHT = 54;
  const LOGOTYPE_SELECTOR = ".brand-logotype-art";
  const STORAGE = {
    user: "ditherWizardUser",
    traffic: "ditherWizardTraffic",
    session: "ditherWizardTrafficSession",
  };
  const CURSOR_GRID = [
    "xx",
    "xxx",
    "xx x",
    "xx  x",
    "xx   x",
    "xx    x",
    "xx     x",
    "xx      x",
    "xx       x",
    "xx      xxxx",
    "xx     xx",
    "xx   x  x",
    "xx  x   x",
    "xxxx    x",
    "      x x",
    "       xx",
  ];
  const CURSOR_CELL = 1;
  const CURSOR_CANVAS_SIZE = 20;
  const CURSOR_OFFSET = 2;
  const CURSOR_HOTSPOT = [2, 2];
  const LOGOTYPE_BAYER_4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];
  const LOGOTYPE_FALLBACK_COLORS = {
    "--bg": [8, 18, 14],
    "--m3-primary": [198, 255, 151],
    "--m3-secondary": [110, 228, 232],
    "--m3-tertiary": [226, 114, 214],
  };
  const sourceCanvas = document.createElement("canvas");
  const workCanvas = document.createElement("canvas");
  const glowCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const workCtx = workCanvas.getContext("2d", { willReadFrequently: true });
  const glowCtx = glowCanvas.getContext("2d", { willReadFrequently: true });
  let logotypeSurfaces = [];
  let logotypeRaf = 0;
  let cursorThemeRefresh = 0;
  let cursorThemeSignature = "";

  function currentPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith("design-system.html")) return "design-system";
    if (path.endsWith("contact.html")) return "contact";
    if (path.endsWith("mage-lab.html")) return "mage-lab";
    return "home";
  }

  function readJson(key, fallback, storage = localStorage) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value, storage = localStorage) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
    return true;
  }

  function colorCssValue(color, fallback = "rgb(198 255 151)") {
    if (!Array.isArray(color)) return fallback;
    return `rgb(${color.join(" ")})`;
  }

  function mixRgb(base, overlay, amount) {
    return base.map((channel, index) => Math.round(channel + (overlay[index] - channel) * amount));
  }

  function relativeLuminance(color) {
    return color
      .map((channel) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  }

  function contrastRatio(a, b) {
    const light = Math.max(relativeLuminance(a), relativeLuminance(b));
    const dark = Math.min(relativeLuminance(a), relativeLuminance(b));
    return (light + 0.05) / (dark + 0.05);
  }

  function contrastAdjustedThemeColor(color, background) {
    if (!Array.isArray(color) || !Array.isArray(background)) return color;
    if (contrastRatio(color, background) >= 3) return color;
    const target = relativeLuminance(background) > 0.38 ? [0, 0, 0] : [255, 255, 255];
    for (const amount of [0.28, 0.42, 0.58, 0.72]) {
      const mixed = mixRgb(color, target, amount);
      if (contrastRatio(mixed, background) >= 3) return mixed;
    }
    return mixRgb(color, target, 0.82);
  }

  function cursorThemeColors() {
    const rawPrimary = cssColor("--m3-primary") || cssColor("--green-strong") || LOGOTYPE_FALLBACK_COLORS["--m3-primary"];
    const rawSecondary = cssColor("--m3-secondary") || LOGOTYPE_FALLBACK_COLORS["--m3-secondary"];
    const rawTertiary = cssColor("--m3-tertiary") || LOGOTYPE_FALLBACK_COLORS["--m3-tertiary"];
    const background = cssColor("--bg") || LOGOTYPE_FALLBACK_COLORS["--bg"];
    const primary = contrastAdjustedThemeColor(rawPrimary, background);
    const secondary = contrastAdjustedThemeColor(rawSecondary, background);
    const tertiary = contrastAdjustedThemeColor(rawTertiary, background);
    return {
      primary: colorCssValue(primary),
      secondary: colorCssValue(secondary),
      tertiary: colorCssValue(tertiary),
      background: colorCssValue(background, "rgb(6 17 13)"),
      signature: [primary, secondary, tertiary, background].map((color) => color?.join(",")).join("|"),
    };
  }

  function cursorCells() {
    const cells = [];
    CURSOR_GRID.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        if (cell === "x") cells.push([x, y]);
      });
    });
    return cells;
  }

  function drawCursorCells(context, cells, color, offsetX = 0, offsetY = 0, alpha = 1) {
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = color;
    cells.forEach(([x, y]) => {
      context.fillRect(
        CURSOR_OFFSET + offsetX + x * CURSOR_CELL,
        CURSOR_OFFSET + offsetY + y * CURSOR_CELL,
        CURSOR_CELL,
        CURSOR_CELL,
      );
    });
    context.restore();
  }

  function renderDynamicCursor() {
    const colors = cursorThemeColors();
    if (colors.signature === cursorThemeSignature) return;
    cursorThemeSignature = colors.signature;

    const canvas = document.createElement("canvas");
    canvas.width = CURSOR_CANVAS_SIZE;
    canvas.height = CURSOR_CANVAS_SIZE;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.imageSmoothingEnabled = false;

    const cells = cursorCells();
    for (const [x, y] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) {
      drawCursorCells(context, cells, "rgb(0 0 0)", x, y, 0.96);
    }
    for (const [x, y] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
      drawCursorCells(context, cells, "rgb(255 255 255)", x, y, 0.92);
    }
    drawCursorCells(context, cells, colors.primary);
    drawCursorCells(context, cells.filter((_, index) => index % 5 === 0), colors.secondary, 1, 0, 0.95);
    drawCursorCells(context, cells.filter((_, index) => index % 7 === 0), colors.tertiary, 0, 1, 0.82);

    const cursorUrl = canvas.toDataURL("image/png");
    const hotspotX = CURSOR_HOTSPOT[0];
    const hotspotY = CURSOR_HOTSPOT[1];
    document.documentElement.dataset.pixelCursor = "dynamic-arrow";
    document.documentElement.style.setProperty("--pixel-cursor-default", `url("${cursorUrl}") ${hotspotX} ${hotspotY}, auto`);
    document.documentElement.style.setProperty("--pixel-cursor-action", `url("${cursorUrl}") ${hotspotX} ${hotspotY}, pointer`);
  }

  function scheduleDynamicCursorRender() {
    window.clearTimeout(cursorThemeRefresh);
    cursorThemeRefresh = window.setTimeout(renderDynamicCursor, 40);
  }

  function initDynamicCursor() {
    document.getElementById("cursorDevOverlay")?.remove();
    document.querySelector(".cursor-trail-layer")?.remove();
    delete document.documentElement.dataset.cursorTrail;
    renderDynamicCursor();

    const observer = new MutationObserver(scheduleDynamicCursorRender);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });
    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-bg-texture", "data-home-variant", "class", "style"],
      });
    }
  }

  function navLink(page, href, label, attributes = "") {
    const active = currentPage() === page;
    const state = active ? ' is-current" aria-current="page' : "";
    const attr = attributes ? ` ${attributes}` : "";
    return `<a class="primary-nav-link${state}" href="${href}"${attr}><span class="primary-nav-label">${label}</span></a>`;
  }

  function syncAccountNavigation() {}

  function pageLabel() {
    const page = currentPage();
    if (page !== "home") return page;
    return window.location.pathname.endsWith("/") || window.location.pathname.endsWith("index.html") ? "home" : "unknown";
  }

  function recordLocalTraffic() {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const path = `${window.location.pathname || "/"}${window.location.hash || ""}`;
    let session = readJson(STORAGE.session, null, sessionStorage);
    let newSession = false;
    if (!session || Date.now() - Number(session.lastSeen || 0) > 30 * 60 * 1000) {
      session = { id: `sess_${Date.now().toString(36)}`, startedAt: now.toISOString() };
      newSession = true;
    }
    session.lastSeen = Date.now();
    writeJson(STORAGE.session, session, sessionStorage);

    const traffic = readJson(STORAGE.traffic, {
      pageViews: 0,
      sessions: 0,
      pages: {},
      daily: {},
      events: [],
    });
    traffic.pages = traffic.pages && typeof traffic.pages === "object" ? traffic.pages : {};
    traffic.daily = traffic.daily && typeof traffic.daily === "object" ? traffic.daily : {};
    traffic.pageViews = Number(traffic.pageViews || 0) + 1;
    traffic.sessions = Number(traffic.sessions || 0) + (newSession ? 1 : 0);
    traffic.lastVisit = now.toISOString();
    traffic.pages[path] = Number(traffic.pages?.[path] || 0) + 1;
    traffic.daily[day] = Number(traffic.daily?.[day] || 0) + 1;
    traffic.events = Array.isArray(traffic.events) ? traffic.events.slice(-79) : [];
    traffic.events.push({
      type: "page_view",
      page: pageLabel(),
      path,
      sessionId: session.id,
      at: now.toISOString(),
    });
    writeJson(STORAGE.traffic, traffic);
  }

  function renderSiteHeader() {
    const mount = document.querySelector("[data-site-header]");
    if (!mount) return;

    mount.outerHTML = `
      <header class="topbar">
        <a class="brand-lockup" href="index.html" aria-label="Dither Wizard home">
          <span class="brand-mark" aria-hidden="true">
            <span class="wizard-logo" data-mage-hover-cast aria-hidden="true">
              <span class="mage-vector-sprite" data-mage-vector data-mage-state="header" aria-hidden="true"></span>
            </span>
          </span>
          <div class="brand-identity">
            <h1 class="brand-logotype" id="brandLogotype" aria-label="Dither Wizard">
              <span class="brand-logotype-art" aria-hidden="true">
                <video class="brand-logotype-source" src="${LOGOTYPE_TEXTURE_SRC}" muted loop autoplay playsinline preload="auto"></video>
                <canvas class="brand-logotype-media" width="${LOGOTYPE_TEXTURE_WIDTH}" height="${LOGOTYPE_TEXTURE_HEIGHT}"></canvas>
              </span>
            </h1>
            <p>local signal processing studio</p>
          </div>
        </a>
        <div class="topbar-actions">
          <nav class="primary-nav" aria-label="Primary navigation">
            ${navLink("home", "index.html", "Home")}
            ${navLink("design-system", "design-system.html", "Wizardry")}
            ${navLink("contact", "contact.html", "Contact")}
          </nav>
          <div class="topbar-controls">
            <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to light mode" title="Switch theme">
              <span id="themeGlyph" data-pixel-icon="Sun" aria-hidden="true"></span>
            </button>
            <button class="bug-report-toggle icon-button" id="bugReportToggle" type="button" aria-label="File a bug" aria-haspopup="dialog" aria-expanded="false" aria-controls="bugReportOverlay" title="File a bug">
              <span class="bug-report-icon pixel-icon-slot" data-pixel-icon="Bug" aria-hidden="true"></span>
            </button>
            <button class="fullscreen-toggle icon-button" id="fullscreenToggle" type="button" aria-label="Enter fullscreen" aria-pressed="false" title="Enter fullscreen">
              <span class="fullscreen-icon" data-pixel-icon="Scale" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  function clamp(value, min = 0, max = 255) {
    return Math.max(min, Math.min(max, value));
  }

  function setCanvasSize(canvas, width, height) {
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  }

  function cssToken(name, seen = new Set()) {
    if (seen.has(name)) return "";
    seen.add(name);
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const variable = value.match(/^var\((--[^,\s)]+)/);
    if (variable) return cssToken(variable[1], seen);
    return value;
  }

  function parseRgb(value) {
    const match = value.match(/rgba?\(([^)]+)\)/i);
    if (!match) return null;
    const parts = match[1].split(/[,\s/]+/).filter(Boolean).slice(0, 3).map(Number);
    if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null;
    return parts.map((part) => clamp(part));
  }

  function parseHex(value) {
    const match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    const hex = match[1].length === 3
      ? match[1].split("").map((char) => char + char).join("")
      : match[1];
    return [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
  }

  function parseOklch(value) {
    const match = value.match(/oklch\(\s*([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+)/i);
    if (!match) return null;
    const lValue = Number(match[1]);
    const lightness = value.includes(`${match[1]}%`) ? lValue / 100 : lValue;
    const chroma = Number(match[2]);
    const hue = Number(match[3]) * Math.PI / 180;
    const a = Math.cos(hue) * chroma;
    const b = Math.sin(hue) * chroma;
    const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
    const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
    const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;
    const l = lPrime ** 3;
    const m = mPrime ** 3;
    const s = sPrime ** 3;
    const linear = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    return linear.map((channel) => {
      const encoded = channel <= 0.0031308
        ? 12.92 * channel
        : 1.055 * (channel ** (1 / 2.4)) - 0.055;
      return clamp(Math.round(encoded * 255));
    });
  }

  function cssColor(name) {
    const value = cssToken(name);
    return parseRgb(value) || parseHex(value) || parseOklch(value) || LOGOTYPE_FALLBACK_COLORS[name];
  }

  function luminance(color) {
    return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
  }

  function mixColor(base, overlay, amount) {
    return base.map((channel, index) => Math.round(channel + (overlay[index] - channel) * amount));
  }

  function themePalette() {
    const base = cssColor("--bg") || LOGOTYPE_FALLBACK_COLORS["--bg"];
    const primary = cssColor("--m3-primary") || LOGOTYPE_FALLBACK_COLORS["--m3-primary"];
    const secondary = cssColor("--m3-secondary") || LOGOTYPE_FALLBACK_COLORS["--m3-secondary"];
    const tertiary = cssColor("--m3-tertiary") || LOGOTYPE_FALLBACK_COLORS["--m3-tertiary"];
    const palette = [
      base,
      mixColor(base, primary, 0.36),
      mixColor(base, secondary, 0.48),
      mixColor(base, tertiary, 0.58),
      mixColor(primary, tertiary, 0.18),
    ].filter(Boolean);
    const unique = palette.filter((color, index) => (
      palette.findIndex((item) => item.join(",") === color.join(",")) === index
    ));
    return unique.sort((a, b) => luminance(a) - luminance(b));
  }

  function drawMediaCover(context, media, width, height) {
    const sourceWidth = media.videoWidth || media.naturalWidth || width;
    const sourceHeight = media.videoHeight || media.naturalHeight || height;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    const cropWidth = width / scale;
    const cropHeight = height / scale;
    const cropX = (sourceWidth - cropWidth) / 2;
    const cropY = (sourceHeight - cropHeight) / 2;
    context.drawImage(media, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
  }

  function ditherLogotypeFrame(video, canvas, time) {
    if (!sourceCtx || !workCtx || !glowCtx || video.readyState < 2) return;
    const width = canvas.width || LOGOTYPE_TEXTURE_WIDTH;
    const height = canvas.height || LOGOTYPE_TEXTURE_HEIGHT;
    const targetCtx = canvas.getContext("2d", { willReadFrequently: true });
    if (!targetCtx) return;

    setCanvasSize(sourceCanvas, width, height);
    setCanvasSize(workCanvas, width, height);
    setCanvasSize(glowCanvas, width, height);
    drawMediaCover(sourceCtx, video, width, height);

    const palette = themePalette();
    const toneColor = cssColor("--m3-primary") || palette[Math.max(0, palette.length - 2)];
    if (toneColor) {
      document.documentElement.style.setProperty("--logotype-source-tone", `rgb(${toneColor.join(" ")})`);
      document.documentElement.style.setProperty("--logotype-source-tone-alpha", "0.08");
    }

    const imageData = sourceCtx.getImageData(0, 0, width, height);
    const { data } = imageData;
    const contrast = (259 * (-21 + 255)) / (255 * (259 - -21));
    const phase = Math.floor(time / 96) % 4;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const sourceTone = luminance([data[index], data[index + 1], data[index + 2]]);
        const adjusted = clamp(contrast * (sourceTone - 128) + 128 + 4);
        const threshold = (LOGOTYPE_BAYER_4[(y + phase) % 4][(x + phase) % 4] / 15 - 0.5) * 54;
        const tone = clamp(adjusted + threshold, 0, 255) / 255;
        const color = palette[Math.min(palette.length - 1, Math.max(0, Math.round(tone * (palette.length - 1))))];
        data[index] = color[0];
        data[index + 1] = color[1];
        data[index + 2] = color[2];
        data[index + 3] = 255;
      }
    }

    targetCtx.clearRect(0, 0, width, height);
    targetCtx.putImageData(imageData, 0, 0);
    glowCtx.clearRect(0, 0, width, height);
    glowCtx.filter = "blur(7px) brightness(1.95)";
    glowCtx.drawImage(canvas, 0, 0);
    glowCtx.filter = "none";
    targetCtx.save();
    targetCtx.globalCompositeOperation = "screen";
    targetCtx.globalAlpha = 0.3;
    targetCtx.drawImage(glowCanvas, 0, 0);
    targetCtx.restore();
  }

  function renderLogotypes(time = performance.now()) {
    for (const surface of logotypeSurfaces) ditherLogotypeFrame(surface.video, surface.canvas, time);
  }

  function tickLogotypes(time) {
    renderLogotypes(time);
    logotypeRaf = requestAnimationFrame(tickLogotypes);
  }

  function initSharedLogotypes() {
    logotypeSurfaces = Array.from(document.querySelectorAll(LOGOTYPE_SELECTOR))
      .map((art) => {
        const video = art.querySelector(".brand-logotype-source");
        const canvas = art.querySelector(".brand-logotype-media");
        if (!video || !(canvas instanceof HTMLCanvasElement)) return null;
        setCanvasSize(canvas, LOGOTYPE_TEXTURE_WIDTH, LOGOTYPE_TEXTURE_HEIGHT);
        video.addEventListener("loadeddata", () => renderLogotypes(), { once: true });
        const playback = video.play();
        if (playback && typeof playback.catch === "function") playback.catch(() => {});
        return { video, canvas };
      })
      .filter(Boolean);

    if (logotypeSurfaces.length && !logotypeRaf) logotypeRaf = requestAnimationFrame(tickLogotypes);
  }

  window.DitherSharedLogotype = {
    stop() {
      if (logotypeRaf) cancelAnimationFrame(logotypeRaf);
      logotypeRaf = 0;
    },
    start: initSharedLogotypes,
    render: renderLogotypes,
  };

  window.DitherSiteHeader = {
    syncAuthNav: syncAccountNavigation,
    recordLocalTraffic,
  };
  window.DitherDynamicCursor = {
    refresh: renderDynamicCursor,
  };

  renderSiteHeader();
  recordLocalTraffic();
  initDynamicCursor();
  initSharedLogotypes();
})();
