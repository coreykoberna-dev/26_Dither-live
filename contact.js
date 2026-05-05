(function () {
  const emailAddress = "hello@ditherwizard.ai";
  const CONTACT_VARIANT_KEY = "dither-wizard-contact-rule-stack-variant";
  const CONTACT_VARIANT_PANEL_KEY = "dither-wizard-feature-monitor-panel";
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
  const variantMap = new Map(CONTACT_VARIANTS.map(([value, label, texture]) => [value, { label, texture }]));
  const draggableVariants = new Set(CONTACT_VARIANTS.map(([value]) => value));
  const shell = document.querySelector(".contact-shell");
  const variantPanel = document.getElementById("contactVariantPanel");
  const variantToggle = document.getElementById("contactVariantToggle");
  const variantReadout = document.getElementById("contactVariantReadout");
  const variantButtons = Array.from(document.querySelectorAll("[data-contact-variant-option]"));
  const beacon = document.querySelector("[data-contact-beacon]");
  const gridTrail = document.getElementById("contactGridTrail");
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

  function normalizeVariant(value) {
    return variantMap.has(value) ? value : CONTACT_VARIANTS[0][0];
  }

  function setContactVariant(value, options = {}) {
    const { persist = true } = options;
    const nextVariant = normalizeVariant(value);
    const meta = variantMap.get(nextVariant);

    document.body.dataset.contactVariant = nextVariant;
    document.body.dataset.bgTexture = meta.texture;
    if (shell) shell.dataset.contactVariant = nextVariant;
    if (variantReadout) variantReadout.textContent = meta.label;

    variantButtons.forEach((button) => {
      const isActive = button.dataset.contactVariantOption === nextVariant;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (persist) writeStoredValue(CONTACT_VARIANT_KEY, nextVariant);
    window.dispatchEvent(new CustomEvent("contactvariantchange"));
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

  const storedVariant = readStoredValue(CONTACT_VARIANT_KEY);
  setContactVariant(storedVariant || document.body.dataset.contactVariant, { persist: false });
  setPanelCollapsed(readStoredValue(CONTACT_VARIANT_PANEL_KEY) === "collapsed", { persist: false });

  variantButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setContactVariant(button.dataset.contactVariantOption);
    });
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
      colorProbe.style.color = `var(${name})`;
      return getComputedStyle(colorProbe).color || fallback;
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

  windowModules.forEach((module) => {
    const handle = module.querySelector(".contact-window-handle");
    if (!handle) return;
    let dragState = null;

    module.addEventListener("pointerdown", () => {
      if (draggableVariants.has(document.body.dataset.contactVariant)) focusWindow(module);
    });

    function windowOffset() {
      return {
        x: Number.parseFloat(module.dataset.windowX || "0") || 0,
        y: Number.parseFloat(module.dataset.windowY || "0") || 0,
      };
    }

    function setWindowOffset(x, y) {
      module.dataset.windowX = String(x);
      module.dataset.windowY = String(y);
      module.style.setProperty("--window-x", `${x}px`);
      module.style.setProperty("--window-y", `${y}px`);
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

    function clampWindowToBounds() {
      if (!draggableVariants.has(document.body.dataset.contactVariant)) return;
      const current = windowOffset();
      const bounds = dragBounds(current.x, current.y);
      setWindowOffset(
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
      setWindowOffset(nextX, nextY);
    });

    function endDrag(event) {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      module.classList.remove("is-dragging");
      module.releasePointerCapture?.(event.pointerId);
      dragState = null;
    }

    module.addEventListener("pointerup", endDrag);
    module.addEventListener("pointercancel", endDrag);
    module.addEventListener("dblclick", (event) => {
      if (!isDragSource(event)) return;
      setWindowOffset(0, 0);
      window.requestAnimationFrame(clampWindowToBounds);
    });
    window.addEventListener("resize", () => window.requestAnimationFrame(clampWindowToBounds));
    window.addEventListener("contactvariantchange", () => window.requestAnimationFrame(clampWindowToBounds));
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
