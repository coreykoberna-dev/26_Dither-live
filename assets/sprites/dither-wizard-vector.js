(function () {
  const data = window.DITHER_WIZARD_VECTOR_DATA;
  if (!data) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const width = data.logicalSize.width;
  const height = data.logicalSize.height;
  const transparent = data.transparent;
  const tokenByChar = new Map(data.palette.map((token) => [token.char, token.id]));
  const basePixelCache = new Map();

  function readBasePixels(name) {
    if (basePixelCache.has(name)) return basePixelCache.get(name);
    const rows = data.baseFrames[name] || data.baseFrames.south;
    const pixels = [];
    rows.forEach((row, y) => {
      [...row].forEach((char, x) => {
        if (char === transparent) return;
        pixels.push({ x, y, token: tokenByChar.get(char) || "outline" });
      });
    });
    basePixelCache.set(name, pixels);
    return pixels;
  }

  function isStaffToken(token) {
    return token.startsWith("staff") || token === "staff-gold";
  }

  function isMagicToken(token) {
    return token.startsWith("purple") || token.startsWith("spell") || token === "highlight";
  }

  function walkOffset(x, y, token, spec) {
    const phase = spec.phase % 4;
    const center = width / 2;
    const lower = y >= 38;
    const hem = y >= 45;
    const side = x < center ? -1 : 1;
    const bob = [0, -1, 0, 1][phase];
    let dx = 0;
    let dy = y < 47 ? bob : 0;

    if (lower) {
      const stride = phase === 0 ? 1 : phase === 2 ? -1 : 0;
      if (spec.direction === "left" || spec.direction === "right") {
        dx += side * stride;
        dy += phase % 2 === 1 ? 1 : 0;
      } else {
        dx += side * -stride;
        dy += phase % 2 === 1 ? 1 : 0;
      }
    }

    if (hem && !isStaffToken(token)) {
      dx += phase === 1 ? -side : phase === 3 ? side : 0;
    }

    if (isStaffToken(token) && y > 15) {
      dy -= bob;
    }

    return { dx, dy };
  }

  function castOffset(x, y, token, spec) {
    const lift = [0, 0, -1, -2, -1, 0][spec.phase] || 0;
    let dx = 0;
    let dy = 0;

    if (y < 32) dy += lift;
    if (isMagicToken(token) && spec.phase >= 2) dy -= 1;
    if (spec.kind === "cast-burst" && x < width / 2 && y < 34) dx -= spec.phase > 2 ? 1 : 0;

    return { dx, dy };
  }

  function pixelOffset(pixel, spec) {
    if (spec.kind === "idle") {
      return { dx: 0, dy: spec.phase === 1 && pixel.y < 43 ? -1 : 0 };
    }

    if (spec.kind === "walk") {
      return walkOffset(pixel.x, pixel.y, pixel.token, spec);
    }

    if (spec.kind === "cast-orb" || spec.kind === "cast-burst") {
      return castOffset(pixel.x, pixel.y, pixel.token, spec);
    }

    return { dx: 0, dy: 0 };
  }

  function addEffectPixel(pixels, x, y, token, size = 1) {
    pixels.push({ x, y, token, size });
  }

  function orbEffect(phase) {
    const pixels = [];
    const x = 13 + phase * 4;
    const y = 11 - Math.min(phase, 3);
    addEffectPixel(pixels, x, y, "spell-core", 2);
    addEffectPixel(pixels, x - 1, y + 1, "spell", 1);
    addEffectPixel(pixels, x + 2, y + 1, "spell", 1);
    addEffectPixel(pixels, x + 1, y - 1, "spell", 1);
    if (phase >= 2) addEffectPixel(pixels, x - 5, y + 3, "spell-shadow", 1);
    if (phase >= 3) addEffectPixel(pixels, x + 5, y - 2, "spell", 1);
    if (phase >= 4) addEffectPixel(pixels, x + 8, y + 2, "spell-core", 1);
    return pixels;
  }

  function burstEffect(phase) {
    const pixels = [];
    const cx = 14 + phase * 3;
    const cy = 13;
    const radius = Math.min(phase + 1, 5);
    addEffectPixel(pixels, cx, cy, "spell-core", 2);
    addEffectPixel(pixels, cx - radius, cy, "spell", 1);
    addEffectPixel(pixels, cx + radius, cy, "spell", 1);
    addEffectPixel(pixels, cx, cy - radius, "spell", 1);
    addEffectPixel(pixels, cx, cy + radius, "spell", 1);
    if (phase >= 2) {
      addEffectPixel(pixels, cx - radius + 1, cy - radius + 1, "spell-shadow", 1);
      addEffectPixel(pixels, cx + radius - 1, cy - radius + 1, "spell-core", 1);
    }
    if (phase >= 4) {
      addEffectPixel(pixels, cx - radius - 2, cy + 2, "spell", 1);
      addEffectPixel(pixels, cx + radius + 1, cy - 1, "spell-shadow", 1);
    }
    return pixels;
  }

  function effectPixels(spec) {
    if (spec.kind === "cast-orb") return orbEffect(spec.phase);
    if (spec.kind === "cast-burst") return burstEffect(spec.phase);
    return [];
  }

  function rectMarkup(x, y, token, size = 1) {
    return `<rect class="wizard-pixel wizard-px-${token}" x="${x}" y="${y}" width="${size}" height="${size}"></rect>`;
  }

  function renderFrame(svg, spec) {
    const parts = [];
    for (const pixel of readBasePixels(spec.base)) {
      const offset = pixelOffset(pixel, spec);
      const x = pixel.x + offset.dx;
      const y = pixel.y + offset.dy;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      parts.push(rectMarkup(x, y, pixel.token));
    }

    for (const pixel of effectPixels(spec)) {
      if (pixel.x < 0 || pixel.x >= width || pixel.y < 0 || pixel.y >= height) continue;
      parts.push(rectMarkup(pixel.x, pixel.y, pixel.token, pixel.size || 1));
    }

    svg.innerHTML = parts.join("");
  }

  class DitherWizardVector {
    constructor(root) {
      this.root = root;
      this.svg = document.createElementNS(SVG_NS, "svg");
      this.svg.classList.add("wizard-vector");
      this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      this.svg.setAttribute("aria-hidden", "true");
      this.root.appendChild(this.svg);

      this.state = root.dataset.wizardState || "header";
      this.frame = 0;
      this.lastFrameAt = 0;
      this.playlistIndex = 0;
      this.playlistLoops = 0;
      this.once = null;

      this.bindInteractions();
      this.observeBusyState();
      this.tick = this.tick.bind(this);
      renderFrame(this.svg, data.animations["idle-down"].frames[0]);
      if (!reducedMotionQuery.matches) requestAnimationFrame(this.tick);
    }

    bindInteractions() {
      const trigger = this.root.closest(".brand-lockup") || this.root;
      trigger.addEventListener("mouseenter", () => this.playOnce("cast-orb"));
      trigger.addEventListener("focusin", () => this.playOnce("cast-orb"));
      trigger.addEventListener("click", () => this.playOnce("cast-burst"));
      reducedMotionQuery.addEventListener("change", () => {
        if (reducedMotionQuery.matches) {
          renderFrame(this.svg, data.animations["idle-down"].frames[0]);
        } else {
          requestAnimationFrame(this.tick);
        }
      });
    }

    observeBusyState() {
      const observer = new MutationObserver(() => {
        if (document.body.classList.contains("is-busy")) {
          this.setState("cast-burst");
        } else if (this.state === "cast-burst" && !this.once) {
          this.setState("header");
        }
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    playOnce(state) {
      this.once = { state, returnTo: this.state === state ? "header" : this.state };
      this.frame = 0;
      this.lastFrameAt = 0;
    }

    setState(state) {
      if (state !== "header" && !data.animations[state]) return;
      this.state = state;
      this.once = null;
      this.frame = 0;
      this.lastFrameAt = 0;
      this.playlistIndex = 0;
      this.playlistLoops = 0;
    }

    currentAnimation() {
      if (this.once) return data.animations[this.once.state];
      if (this.state !== "header") return data.animations[this.state];
      const entry = data.headerSequence[this.playlistIndex % data.headerSequence.length];
      return data.animations[entry.state];
    }

    advanceFrame(animation) {
      this.frame += 1;
      if (this.frame < animation.frames.length) return;

      this.frame = 0;
      if (this.once) {
        this.state = this.once.returnTo || "header";
        this.once = null;
        return;
      }

      if (this.state !== "header") return;

      const entry = data.headerSequence[this.playlistIndex % data.headerSequence.length];
      this.playlistLoops += 1;
      if (this.playlistLoops >= entry.loops) {
        this.playlistIndex = (this.playlistIndex + 1) % data.headerSequence.length;
        this.playlistLoops = 0;
      }
    }

    tick(now) {
      if (reducedMotionQuery.matches) return;
      const animation = this.currentAnimation();
      const frameDuration = 1000 / animation.fps;
      if (!this.lastFrameAt || now - this.lastFrameAt >= frameDuration) {
        renderFrame(this.svg, animation.frames[this.frame]);
        this.advanceFrame(animation);
        this.lastFrameAt = now;
      }
      requestAnimationFrame(this.tick);
    }
  }

  const instances = [...document.querySelectorAll("[data-wizard-vector]")].map((root) => new DitherWizardVector(root));
  window.DitherWizardSprite = {
    states: Object.keys(data.animations),
    instances,
    setState(state) {
      instances.forEach((instance) => instance.setState(state));
    },
    play(state) {
      instances.forEach((instance) => instance.playOnce(state));
    },
  };
})();
