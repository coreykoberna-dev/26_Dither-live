(function () {
  const emailAddress = "hello@ditherwizard.ai";
  const CONTACT_VARIANT_KEY = "dither-wizard-contact-rule-stack-variant";
  const CONTACT_CONTENT_KEY = "dither-wizard-contact-content-variant";
  const CONTACT_CONTENT = "signal-ledger";
  const CONTACT_VARIANT_PANEL_KEY = "dither-wizard-feature-monitor-panel";
  const CONTACT_LAYOUT = "offset-stack";
  const CONTACT_WINDOW_STATE_KEY = "dither-wizard-contact-window-state-three-window";
  const CONTACT_VARIANTS = [
    ["terminal-deck", "Rule Stack", "matrix-micro"],
    ["archive-console", "Slow Afterimage", "matrix-micro"],
    ["blue-noc", "Fine Wake", "matrix-micro"],
    ["deep-raster", "Micro Spark", "matrix-micro"],
    ["amber-mainframe", "Large Tiles", "matrix-micro"],
    ["split-tty", "Rail Trail", "matrix-micro"],
    ["paper-crt", "Ledger Glow", "matrix-micro"],
    ["null-shell", "Long Ghost", "matrix-micro"],
    ["red-panic", "Fault Scatter", "matrix-micro"],
    ["radar-shell", "Broad Pulse", "matrix-micro"],
  ];
  const CONTACT_PULSE = {
    label: "pulse 09",
    id: "09",
    path: "M0 48 L18 48 L26 30 L34 68 L42 48 L52 48 L60 38 L68 58 L77 48 L94 48 L103 18 L114 73 L126 42 L144 42 L153 54 L165 54 L174 28 L185 66 L198 48 L216 48 L226 40 L236 56 L247 46 L260 46 L270 22 L282 70 L296 48 L320 48",
    dash: "2 4 8 3",
    sweep: "3.8s",
  };
  const variantMap = new Map(CONTACT_VARIANTS.map(([value, label, texture]) => [value, { label, texture }]));
  const draggableVariants = new Set(CONTACT_VARIANTS.map(([value]) => value));
  const shell = document.querySelector(".contact-shell");
  const variantPanel = document.getElementById("contactVariantPanel");
  const variantToggle = document.getElementById("contactVariantToggle");
  const variantReadout = document.getElementById("contactVariantReadout");
  const variantButtons = Array.from(document.querySelectorAll("[data-contact-variant-option]"));
  const beacon = document.querySelector("[data-contact-beacon]");
  const pulseScope = document.querySelector(".contact-signal-scope");
  const pulsePrimary = document.querySelector("[data-contact-pulse-primary]");
  const pulseGhost = document.querySelector("[data-contact-pulse-ghost]");
  const pulseReadout = document.getElementById("contactPulseReadout");
  const gridTrail = document.getElementById("contactGridTrail");
  const previewTrail = document.getElementById("contactBlockPreviewCanvas");
  const previewPanel = document.querySelector(".contact-block-preview");
  const previewMouse = document.querySelector(".contact-demo-mouse");
  const contactPage = document.querySelector(".contact-page");
  const windowModules = Array.from(document.querySelectorAll(".contact-window"));
  const form = document.getElementById("contactForm");
  const copyButton = document.getElementById("copyEmailButton");
  const status = document.getElementById("contactStatus");
  let beaconCharge = 0;
  let keyBuffer = "";
  let focusedWindowZ = 20;
  const dragIgnoreSelector = "input, textarea, select, button, a, label, [contenteditable='true']";

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function fieldValue(formData, name) {
    return String(formData.get(name) || "").trim();
  }

  function readStoredValue(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStoredValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable in locked-down previews.
    }
  }

  function removeStoredValue(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable in locked-down previews.
    }
  }

  function normalizeVariant(value) {
    return variantMap.has(value) ? value : CONTACT_VARIANTS[0][0];
  }

  function normalizeLayout(value) {
    return value === CONTACT_LAYOUT ? value : CONTACT_LAYOUT;
  }

  function moduleKey(module) {
    return module.dataset.contactModule || module.id || "window";
  }

  function numericDatasetValue(module, key) {
    const value = Number.parseFloat(module.dataset[key] || "0");
    return Number.isFinite(value) ? value : 0;
  }

  function readWindowStateStore() {
    const raw = readStoredValue(CONTACT_WINDOW_STATE_KEY);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeWindowStateStore(store) {
    writeStoredValue(CONTACT_WINDOW_STATE_KEY, JSON.stringify(store));
  }

  function setModuleOffset(module, x, y) {
    module.dataset.windowX = String(x);
    module.dataset.windowY = String(y);
    module.style.setProperty("--window-x", `${x}px`);
    module.style.setProperty("--window-y", `${y}px`);
  }

  function setModuleSize(module, width, height) {
    if (Number.isFinite(width) && width > 0) {
      module.dataset.windowW = String(Math.round(width));
      module.style.setProperty("--window-custom-width", `${Math.round(width)}px`);
    } else {
      delete module.dataset.windowW;
      module.style.removeProperty("--window-custom-width");
    }

    if (Number.isFinite(height) && height > 0) {
      module.dataset.windowH = String(Math.round(height));
      module.style.setProperty("--window-custom-height", `${Math.round(height)}px`);
    } else {
      delete module.dataset.windowH;
      module.style.removeProperty("--window-custom-height");
    }
  }

  function resetWindowAdjustments() {
    windowModules.forEach((module) => {
      setModuleOffset(module, 0, 0);
      setModuleSize(module, 0, 0);
    });
  }

  function applyStoredWindowState(layout = document.body.dataset.contactLayout) {
    const state = readWindowStateStore()[normalizeLayout(layout)] || {};
    windowModules.forEach((module) => {
      const saved = state[moduleKey(module)];
      if (!saved) {
        setModuleOffset(module, 0, 0);
        setModuleSize(module, 0, 0);
        return;
      }

      setModuleOffset(module, Number(saved.x) || 0, Number(saved.y) || 0);
      setModuleSize(module, Number(saved.width) || 0, Number(saved.height) || 0);
    });
  }

  function persistWindowState(module) {
    const layout = normalizeLayout(document.body.dataset.contactLayout);
    const key = moduleKey(module);
    const store = readWindowStateStore();
    const layoutState = store[layout] && typeof store[layout] === "object" ? store[layout] : {};
    const next = {
      x: Math.round(numericDatasetValue(module, "windowX")),
      y: Math.round(numericDatasetValue(module, "windowY")),
      width: Math.round(numericDatasetValue(module, "windowW")),
      height: Math.round(numericDatasetValue(module, "windowH")),
    };

    if (!next.x && !next.y && !next.width && !next.height) {
      delete layoutState[key];
    } else {
      layoutState[key] = next;
    }

    if (Object.keys(layoutState).length) store[layout] = layoutState;
    else delete store[layout];
    writeWindowStateStore(store);
  }

  function setContactLayout(value, options = {}) {
    const { resetOffsets = true, restoreState = true } = options;
    const nextLayout = normalizeLayout(value);

    document.body.dataset.contactLayout = nextLayout;
    if (shell) shell.dataset.contactLayout = nextLayout;
    if (variantPanel) variantPanel.dataset.activeContactLayout = nextLayout;

    if (resetOffsets) resetWindowAdjustments();
    if (restoreState) applyStoredWindowState(nextLayout);
    window.dispatchEvent(new CustomEvent("contactlayoutchange"));
  }

  function setPulseLine() {
    if (pulsePrimary) pulsePrimary.setAttribute("d", CONTACT_PULSE.path);
    if (pulseGhost) pulseGhost.setAttribute("d", CONTACT_PULSE.path);
    if (pulseReadout) pulseReadout.textContent = CONTACT_PULSE.label;
    if (pulseScope) {
      pulseScope.style.setProperty("--scope-dash", CONTACT_PULSE.dash);
      pulseScope.style.setProperty("--scope-sweep-speed", CONTACT_PULSE.sweep);
      pulseScope.dataset.contactPulse = CONTACT_PULSE.id;
    }
    if (shell) shell.dataset.contactPulse = CONTACT_PULSE.id;
  }

  function setContactVariant(value, options = {}) {
    const { persist = true } = options;
    const nextVariant = normalizeVariant(value);
    const meta = variantMap.get(nextVariant);

    document.body.dataset.contactVariant = nextVariant;
    document.body.dataset.bgTexture = meta.texture;
    if (shell) shell.dataset.contactVariant = nextVariant;
    if (variantPanel) variantPanel.dataset.activeContactVariant = nextVariant;
    if (variantReadout) variantReadout.textContent = meta.label;

    variantButtons.forEach((button) => {
      const isActive = button.dataset.contactVariantOption === nextVariant;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (persist) writeStoredValue(CONTACT_VARIANT_KEY, nextVariant);
    window.dispatchEvent(new CustomEvent("contactvariantchange"));
  }

  function setPreviewVariant(value) {
    if (!variantPanel) return;
    variantPanel.dataset.previewContactVariant = normalizeVariant(value);
    window.dispatchEvent(new CustomEvent("contactvariantpreviewchange"));
  }

  function clearPreviewVariant() {
    if (!variantPanel) return;
    delete variantPanel.dataset.previewContactVariant;
    window.dispatchEvent(new CustomEvent("contactvariantpreviewchange"));
  }

  function setContactContent() {
    document.body.dataset.contactContent = CONTACT_CONTENT;
    if (shell) shell.dataset.contactContent = CONTACT_CONTENT;
    removeStoredValue(CONTACT_CONTENT_KEY);
    window.dispatchEvent(new CustomEvent("contactcontentchange"));
  }

  function setPanelCollapsed(isCollapsed, options = {}) {
    const { persist = true } = options;
    if (!variantPanel || !variantToggle) return;
    variantPanel.classList.toggle("is-collapsed", isCollapsed);
    variantToggle.textContent = isCollapsed ? "Expand" : "Collapse";
    variantToggle.setAttribute("aria-expanded", String(!isCollapsed));
    if (persist) writeStoredValue(CONTACT_VARIANT_PANEL_KEY, isCollapsed ? "collapsed" : "open");
  }

  function focusWindow(module) {
    focusedWindowZ += 1;
    module.style.zIndex = String(focusedWindowZ);
  }

  function setResizeMode(isActive) {
    document.body.toggleAttribute("data-contact-resizing", isActive);
  }

  const storedVariant = readStoredValue(CONTACT_VARIANT_KEY);
  setContactVariant(storedVariant || document.body.dataset.contactVariant, { persist: false });
  setContactContent();
  setPanelCollapsed(readStoredValue(CONTACT_VARIANT_PANEL_KEY) === "collapsed", { persist: false });
  setPulseLine();
  setContactLayout(CONTACT_LAYOUT, { resetOffsets: false });

  variantButtons.forEach((button) => {
    button.addEventListener("click", () => {
      clearPreviewVariant();
      setContactVariant(button.dataset.contactVariantOption);
    });
    button.addEventListener("mouseenter", () => {
      setPreviewVariant(button.dataset.contactVariantOption);
    });
    button.addEventListener("pointerenter", () => {
      setPreviewVariant(button.dataset.contactVariantOption);
    });
    button.addEventListener("focus", () => {
      setPreviewVariant(button.dataset.contactVariantOption);
    });
    button.addEventListener("mouseleave", clearPreviewVariant);
    button.addEventListener("pointerleave", clearPreviewVariant);
    button.addEventListener("blur", clearPreviewVariant);
  });

  if (variantToggle) {
    variantToggle.addEventListener("click", () => {
      setPanelCollapsed(!variantPanel?.classList.contains("is-collapsed"));
    });
  }

  function initGridTrail() {
    if (!gridTrail || !contactPage) return;

    const context = gridTrail.getContext("2d");
    if (!context) return;

    const cells = new Map();
    const colorProbe = document.createElement("span");
    let frame = 0;
    let rect = contactPage.getBoundingClientRect();
    let dpr = window.devicePixelRatio || 1;
    let config = {};

    colorProbe.setAttribute("aria-hidden", "true");
    colorProbe.style.cssText = "position:absolute;inset:0 auto auto 0;width:0;height:0;overflow:hidden;pointer-events:none;";
    contactPage.appendChild(colorProbe);

    function numberSetting(name, fallback) {
      const source = getComputedStyle(shell || contactPage).getPropertyValue(name).trim();
      const value = Number.parseFloat(source);
      return Number.isFinite(value) ? value : fallback;
    }

    function colorSetting(name, fallback) {
      colorProbe.style.color = fallback;
      colorProbe.style.color = `var(${name}, ${fallback})`;
      const resolved = getComputedStyle(colorProbe).color;
      return resolved && resolved !== "rgba(0, 0, 0, 0)" ? resolved : fallback;
    }

    function readTrailSettings() {
      config = {
        cell: Math.max(6, numberSetting("--trail-cell-size", 24)),
        fade: Math.max(120, numberSetting("--trail-fade-ms", 900)),
        radius: Math.max(0, Math.round(numberSetting("--trail-radius", 1))),
        color: colorSetting("--trail-color", colorSetting("--m3-primary", "rgb(120, 255, 170)")),
        hotColor: colorSetting("--trail-hot-color", colorSetting("--m3-on-primary-container", "rgb(210, 255, 220)")),
      };
    }

    function resizeTrail() {
      rect = contactPage.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      gridTrail.width = Math.max(1, Math.round(rect.width * dpr));
      gridTrail.height = Math.max(1, Math.round(rect.height * dpr));
      gridTrail.style.width = `${rect.width}px`;
      gridTrail.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function scheduleDraw() {
      if (!frame) frame = window.requestAnimationFrame(drawTrail);
    }

    function touchCell(gridX, gridY, strength, time) {
      const key = `${gridX}:${gridY}`;
      const existing = cells.get(key);
      if (!existing || strength >= existing.strength || time - existing.time > 80) {
        cells.set(key, { gridX, gridY, strength, time });
      }
    }

    function addTrail(event) {
      if (!config.cell) readTrailSettings();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      const gridX = Math.floor(x / config.cell);
      const gridY = Math.floor(y / config.cell);
      const now = performance.now();
      for (let offsetY = -config.radius; offsetY <= config.radius; offsetY += 1) {
        for (let offsetX = -config.radius; offsetX <= config.radius; offsetX += 1) {
          const distance = Math.abs(offsetX) + Math.abs(offsetY);
          if (distance > config.radius + 1) continue;
          const strength = Math.max(0.22, 1 - distance * 0.28);
          touchCell(gridX + offsetX, gridY + offsetY, strength, now);
        }
      }
      scheduleDraw();
    }

    function drawTrail(now) {
      frame = 0;
      context.clearRect(0, 0, rect.width, rect.height);
      for (const [key, cell] of cells) {
        const age = now - cell.time;
        const progress = age / config.fade;
        if (progress >= 1) {
          cells.delete(key);
          continue;
        }

        const life = 1 - progress;
        const glow = Math.pow(life, 1.45) * cell.strength;
        const inset = Math.max(1, Math.round(config.cell * 0.12));
        const x = cell.gridX * config.cell + inset;
        const y = cell.gridY * config.cell + inset;
        const size = Math.max(2, config.cell - inset * 2);

        context.globalAlpha = Math.min(1, glow);
        context.fillStyle = config.color;
        context.fillRect(x, y, size, size);
        if (glow > 0.46) {
          context.globalAlpha = Math.min(1, (glow - 0.32) * 0.9);
          context.fillStyle = config.hotColor;
          context.fillRect(x + inset, y + inset, Math.max(1, size - inset * 2), Math.max(1, size - inset * 2));
        }
      }

      context.globalAlpha = 1;
      if (cells.size) scheduleDraw();
    }

    readTrailSettings();
    resizeTrail();
    contactPage.addEventListener("pointermove", addTrail);
    window.addEventListener("resize", () => {
      resizeTrail();
      scheduleDraw();
    });
    window.addEventListener("contactvariantchange", () => {
      readTrailSettings();
      resizeTrail();
      cells.clear();
      context.clearRect(0, 0, rect.width, rect.height);
    });
  }

  initGridTrail();

  function initPreviewTrail() {
    if (!previewTrail || !previewPanel) return;

    const context = previewTrail.getContext("2d");
    if (!context) return;

    const cells = new Map();
    const colorProbe = document.createElement("span");
    const demoPath = [
      [0.08, 0.42],
      [0.28, 0.42],
      [0.46, 0.24],
      [0.66, 0.24],
      [0.86, 0.48],
      [0.68, 0.72],
      [0.42, 0.72],
      [0.18, 0.58],
    ];
    let rect = previewPanel.getBoundingClientRect();
    let dpr = window.devicePixelRatio || 1;
    let config = {};
    let signature = "";
    let startedAt = performance.now();

    colorProbe.setAttribute("aria-hidden", "true");
    colorProbe.style.cssText = "position:absolute;inset:0 auto auto 0;width:0;height:0;overflow:hidden;pointer-events:none;";
    previewPanel.appendChild(colorProbe);

    function cssValue(name) {
      return getComputedStyle(previewPanel).getPropertyValue(name).trim();
    }

    function numberSetting(name, fallback) {
      const value = Number.parseFloat(cssValue(name));
      return Number.isFinite(value) ? value : fallback;
    }

    function durationSetting(name, fallback) {
      const raw = cssValue(name);
      const value = Number.parseFloat(raw);
      if (!Number.isFinite(value)) return fallback;
      if (raw.endsWith("ms")) return value;
      if (raw.endsWith("s")) return value * 1000;
      return value;
    }

    function colorSetting(name, fallback) {
      colorProbe.style.color = fallback;
      colorProbe.style.color = `var(${name}, ${fallback})`;
      const resolved = getComputedStyle(colorProbe).color;
      return resolved && resolved !== "rgba(0, 0, 0, 0)" ? resolved : fallback;
    }

    function resizePreview() {
      rect = previewPanel.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      previewTrail.width = Math.max(1, Math.round(rect.width * dpr));
      previewTrail.height = Math.max(1, Math.round(rect.height * dpr));
      previewTrail.style.width = `${rect.width}px`;
      previewTrail.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function readPreviewSettings() {
      const next = {
        cell: Math.max(6, numberSetting("--trail-cell-size", 24)),
        fade: Math.max(120, numberSetting("--trail-fade-ms", 850)),
        radius: Math.max(0, Math.round(numberSetting("--trail-radius", 1))),
        cycle: Math.max(1200, durationSetting("--preview-cycle", 5400)),
        color: colorSetting("--preview-trail-color", colorSetting("--trail-color", "rgb(120, 255, 170)")),
        hotColor: colorSetting("--preview-hot-color", colorSetting("--trail-hot-color", "rgb(210, 255, 220)")),
      };
      const nextSignature = `${next.cell}|${next.fade}|${next.radius}|${next.cycle}|${next.color}|${next.hotColor}`;
      if (signature && signature !== nextSignature) {
        cells.clear();
        context.clearRect(0, 0, rect.width, rect.height);
        startedAt = performance.now();
      }
      signature = nextSignature;
      config = next;
    }

    function touchCell(gridX, gridY, strength, time) {
      const key = `${gridX}:${gridY}`;
      const existing = cells.get(key);
      if (!existing || strength >= existing.strength || time - existing.time > 80) {
        cells.set(key, { gridX, gridY, strength, time });
      }
    }

    function addPreviewTrail(x, y, time) {
      const gridX = Math.floor(x / config.cell);
      const gridY = Math.floor(y / config.cell);
      for (let offsetY = -config.radius; offsetY <= config.radius; offsetY += 1) {
        for (let offsetX = -config.radius; offsetX <= config.radius; offsetX += 1) {
          const distance = Math.abs(offsetX) + Math.abs(offsetY);
          if (distance > config.radius + 1) continue;
          const strength = Math.max(0.22, 1 - distance * 0.28);
          touchCell(gridX + offsetX, gridY + offsetY, strength, time);
        }
      }
    }

    function demoPosition(now) {
      const elapsed = (Number.isFinite(now) ? now : performance.now()) - startedAt;
      const wrapped = ((elapsed % config.cycle) + config.cycle) % config.cycle;
      const progress = wrapped / config.cycle;
      const segment = Math.min(demoPath.length - 1, Math.floor(progress * demoPath.length));
      const nextSegment = (segment + 1) % demoPath.length;
      const local = progress * demoPath.length - segment;
      const [startX, startY] = demoPath[segment];
      const [endX, endY] = demoPath[nextSegment];
      return {
        x: (startX + (endX - startX) * local) * rect.width,
        y: (startY + (endY - startY) * local) * rect.height,
      };
    }

    function drawPreview(now) {
      readPreviewSettings();
      if (!rect.width || !rect.height) resizePreview();
      const point = demoPosition(now);
      addPreviewTrail(point.x, point.y, now);

      if (previewMouse) {
        previewMouse.style.transform = `translate3d(${Math.round(point.x)}px, ${Math.round(point.y)}px, 0)`;
      }

      context.clearRect(0, 0, rect.width, rect.height);
      for (const [key, cell] of cells) {
        const age = now - cell.time;
        const progress = age / config.fade;
        if (progress >= 1) {
          cells.delete(key);
          continue;
        }

        const life = 1 - progress;
        const glow = Math.pow(life, 1.45) * cell.strength;
        const inset = Math.max(1, Math.round(config.cell * 0.12));
        const x = cell.gridX * config.cell + inset;
        const y = cell.gridY * config.cell + inset;
        const size = Math.max(2, config.cell - inset * 2);

        context.globalAlpha = Math.min(1, glow);
        context.fillStyle = config.color;
        context.fillRect(x, y, size, size);
        if (glow > 0.46) {
          context.globalAlpha = Math.min(1, (glow - 0.32) * 0.9);
          context.fillStyle = config.hotColor;
          context.fillRect(x + inset, y + inset, Math.max(1, size - inset * 2), Math.max(1, size - inset * 2));
        }
      }

      context.globalAlpha = 1;
      window.requestAnimationFrame(drawPreview);
    }

    readPreviewSettings();
    resizePreview();
    window.addEventListener("resize", () => {
      resizePreview();
      cells.clear();
    });
    window.addEventListener("contactvariantchange", () => {
      readPreviewSettings();
      resizePreview();
      cells.clear();
    });
    window.addEventListener("contactvariantpreviewchange", () => {
      readPreviewSettings();
      resizePreview();
      cells.clear();
    });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => {
        resizePreview();
        cells.clear();
      });
      observer.observe(previewPanel);
    }
    window.requestAnimationFrame(drawPreview);
  }

  initPreviewTrail();

  windowModules.forEach((module) => {
    const handle = module.querySelector(".contact-window-handle");
    if (!handle) return;
    let resizeHandle = module.querySelector(".contact-window-resize");
    if (!resizeHandle) {
      resizeHandle = document.createElement("button");
      resizeHandle.className = "contact-window-resize";
      resizeHandle.type = "button";
      resizeHandle.setAttribute("aria-label", `Resize ${moduleKey(module)} window`);
      module.appendChild(resizeHandle);
    }
    let dragState = null;
    let resizeState = null;

    module.addEventListener("pointerdown", () => {
      if (draggableVariants.has(document.body.dataset.contactVariant)) focusWindow(module);
    });

    function windowOffset() {
      return {
        x: Number.parseFloat(module.dataset.windowX || "0") || 0,
        y: Number.parseFloat(module.dataset.windowY || "0") || 0,
      };
    }

    function dragBounds(baseX, baseY) {
      const boundary = module.closest(".contact-page")?.getBoundingClientRect();
      const rect = module.getBoundingClientRect();
      if (!boundary || !rect.width || !rect.height) {
        return { minX: -420, maxX: 420, minY: -260, maxY: 320 };
      }

      const gutter = 12;
      const baseLeft = rect.left - baseX;
      const baseRight = rect.right - baseX;
      const baseTop = rect.top - baseY;
      const baseBottom = rect.bottom - baseY;
      let minX = boundary.left + gutter - baseLeft;
      let maxX = boundary.right - gutter - baseRight;
      let minY = boundary.top + gutter - baseTop;
      let maxY = boundary.bottom - gutter - baseBottom;

      if (minX > maxX) {
        const centeredX = (minX + maxX) / 2;
        minX = centeredX;
        maxX = centeredX;
      }
      if (minY > maxY) {
        const centeredY = (minY + maxY) / 2;
        minY = centeredY;
        maxY = centeredY;
      }

      return { minX, maxX, minY, maxY };
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function canResizeWindow() {
      return window.matchMedia("(min-width: 560px)").matches;
    }

    function sizeLimits() {
      const boundary = module.closest(".contact-page")?.getBoundingClientRect();
      const rect = module.getBoundingClientRect();
      const kind = moduleKey(module);
      const compactResize = boundary ? boundary.width < 921 : false;
      const minimums = compactResize
        ? {
            intro: { width: 300, height: 255 },
            monitor: { width: 210, height: 285 },
            form: { width: 360, height: 285 },
          }
        : {
            intro: { width: 420, height: 255 },
            monitor: { width: 250, height: 285 },
            form: { width: 520, height: 260 },
          };
      const minimum = minimums[kind] || { width: 260, height: 180 };
      if (!boundary || !rect.width || !rect.height) {
        return {
          minWidth: minimum.width,
          minHeight: minimum.height,
          maxWidth: 920,
          maxHeight: 760,
        };
      }

      const gutter = 12;
      const maxWidth = Math.max(minimum.width, boundary.right - rect.left - gutter);
      const maxHeight = Math.max(minimum.height, boundary.bottom - rect.top - gutter);
      return {
        minWidth: Math.min(minimum.width, maxWidth),
        minHeight: Math.min(minimum.height, maxHeight),
        maxWidth,
        maxHeight,
      };
    }

    function clampWindowToBounds() {
      if (!draggableVariants.has(document.body.dataset.contactVariant)) return;
      const current = windowOffset();
      const bounds = dragBounds(current.x, current.y);
      setModuleOffset(
        module,
        clamp(current.x, bounds.minX, bounds.maxX),
        clamp(current.y, bounds.minY, bounds.maxY),
      );
    }

    function isDragSource(event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest(".contact-window-handle")) return true;
      return !target.closest(dragIgnoreSelector);
    }

    function startDrag(event) {
      if (!draggableVariants.has(document.body.dataset.contactVariant)) return;
      if (!isDragSource(event)) return;
      focusWindow(module);
      const { x: baseX, y: baseY } = windowOffset();
      dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseX,
        baseY,
        bounds: dragBounds(baseX, baseY),
      };
      module.classList.add("is-dragging");
      module.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }

    module.addEventListener("pointerdown", startDrag);

    module.addEventListener("pointermove", (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const nextX = clamp(dragState.baseX + event.clientX - dragState.startX, dragState.bounds.minX, dragState.bounds.maxX);
      const nextY = clamp(dragState.baseY + event.clientY - dragState.startY, dragState.bounds.minY, dragState.bounds.maxY);
      setModuleOffset(module, nextX, nextY);
    });

    function endDrag(event) {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      module.classList.remove("is-dragging");
      module.releasePointerCapture?.(event.pointerId);
      dragState = null;
      persistWindowState(module);
    }

    function startResize(event) {
      if (!draggableVariants.has(document.body.dataset.contactVariant) || !canResizeWindow()) return;
      focusWindow(module);
      const rect = module.getBoundingClientRect();
      const limits = sizeLimits();
      resizeState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        limits,
      };
      module.classList.add("is-resizing");
      setResizeMode(true);
      window.addEventListener("pointermove", moveResize);
      window.addEventListener("pointerup", endResize);
      window.addEventListener("pointercancel", endResize);
      resizeHandle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    }

    function moveResize(event) {
      if (!resizeState || resizeState.pointerId !== event.pointerId) return;
      const nextWidth = clamp(
        resizeState.startWidth + event.clientX - resizeState.startX,
        resizeState.limits.minWidth,
        resizeState.limits.maxWidth,
      );
      const nextHeight = clamp(
        resizeState.startHeight + event.clientY - resizeState.startY,
        resizeState.limits.minHeight,
        resizeState.limits.maxHeight,
      );
      setModuleSize(module, nextWidth, nextHeight);
      window.requestAnimationFrame(clampWindowToBounds);
      event.preventDefault();
    }

    function removeResizeListeners() {
      window.removeEventListener("pointermove", moveResize);
      window.removeEventListener("pointerup", endResize);
      window.removeEventListener("pointercancel", endResize);
    }

    function endResize(event) {
      if (!resizeState || resizeState.pointerId !== event.pointerId) return;
      module.classList.remove("is-resizing");
      setResizeMode(false);
      removeResizeListeners();
      if (resizeHandle.hasPointerCapture?.(event.pointerId)) {
        resizeHandle.releasePointerCapture?.(event.pointerId);
      }
      resizeState = null;
      persistWindowState(module);
      event.preventDefault();
    }

    function resizeWithKeyboard(event) {
      if (!canResizeWindow()) return;
      const step = event.shiftKey ? 48 : 16;
      const rect = module.getBoundingClientRect();
      const limits = sizeLimits();
      let nextWidth = rect.width;
      let nextHeight = rect.height;

      if (event.key === "ArrowLeft") nextWidth -= step;
      else if (event.key === "ArrowRight") nextWidth += step;
      else if (event.key === "ArrowUp") nextHeight -= step;
      else if (event.key === "ArrowDown") nextHeight += step;
      else return;

      focusWindow(module);
      setModuleSize(
        module,
        clamp(nextWidth, limits.minWidth, limits.maxWidth),
        clamp(nextHeight, limits.minHeight, limits.maxHeight),
      );
      window.requestAnimationFrame(clampWindowToBounds);
      persistWindowState(module);
      event.preventDefault();
      event.stopPropagation();
    }

    module.addEventListener("pointerup", endDrag);
    module.addEventListener("pointercancel", endDrag);
    resizeHandle.addEventListener("pointerdown", startResize);
    resizeHandle.addEventListener("keydown", resizeWithKeyboard);
    resizeHandle.addEventListener("dblclick", (event) => {
      setModuleSize(module, 0, 0);
      persistWindowState(module);
      window.requestAnimationFrame(clampWindowToBounds);
      event.preventDefault();
      event.stopPropagation();
    });
    module.addEventListener("dblclick", (event) => {
      if (!isDragSource(event)) return;
      setModuleOffset(module, 0, 0);
      persistWindowState(module);
      window.requestAnimationFrame(clampWindowToBounds);
    });
    window.addEventListener("resize", () => window.requestAnimationFrame(clampWindowToBounds));
    window.addEventListener("contactvariantchange", () => window.requestAnimationFrame(clampWindowToBounds));
    window.addEventListener("contactlayoutchange", () => window.requestAnimationFrame(clampWindowToBounds));
    window.requestAnimationFrame(clampWindowToBounds);
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const name = fieldValue(formData, "name");
      const email = fieldValue(formData, "email");
      const subject = fieldValue(formData, "subject");
      const message = fieldValue(formData, "message");
      const body = [
        message,
        "",
        `From: ${name}`,
        `Reply: ${email}`,
      ].join("\n");

      const mailto = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("email client requested", "sent");
      window.location.href = mailto;
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailAddress);
        setStatus("email copied", "sent");
      } catch {
        setStatus(emailAddress, "ready");
      }
    });
  }

  if (beacon) {
    beacon.addEventListener("click", () => {
      beaconCharge = (beaconCharge + 1) % 8;
      if (shell) shell.style.setProperty("--contact-spark", String(beaconCharge));

      if (beaconCharge === 7) {
        setStatus("hidden channel armed", "sent");
      } else if (document.body.dataset.contactVariant === "radar-shell") {
        setStatus(`scope ping ${beaconCharge}/7`, "ready");
      } else {
        setStatus("beacon ping", "ready");
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("input, textarea, select, button, a")) return;
    if (event.key.length !== 1) return;

    keyBuffer = `${keyBuffer}${event.key.toLowerCase()}`.slice(-6);
    if (keyBuffer !== "dither") return;

    const currentVariant = document.body.dataset.contactVariant;
    const currentIndex = CONTACT_VARIANTS.findIndex(([value]) => value === currentVariant);
    const nextIndex = (currentIndex + 1) % CONTACT_VARIANTS.length;
    setContactVariant(CONTACT_VARIANTS[nextIndex][0]);
    setStatus("variant stepped", "ready");
    keyBuffer = "";
  });
})();
