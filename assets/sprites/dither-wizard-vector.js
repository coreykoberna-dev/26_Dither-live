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
  const hoverSpellStates = [
    "cast-orb",
    "cast-burst",
    "cast-fire-south",
    "cast-earth-north",
    "cast-water-east",
    "cast-electric-west",
  ].filter((state) => data.animations[state]);

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
    return (
      token.startsWith("purple") ||
      token.startsWith("spell") ||
      token.startsWith("fire") ||
      token.startsWith("earth") ||
      token.startsWith("water") ||
      token.startsWith("electric") ||
      token === "highlight"
    );
  }

  function directionVector(direction) {
    if (direction === "up") return { x: 0, y: -1 };
    if (direction === "right") return { x: 1, y: 0 };
    if (direction === "left") return { x: -1, y: 0 };
    return { x: 0, y: 1 };
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
    if (spec.kind === "elemental-cast") {
      const vector = directionVector(spec.direction);
      const pulse = spec.phase >= 2 && spec.phase <= 4 ? 1 : 0;
      if (isStaffToken(token) && y < 32) {
        dx += vector.x * pulse;
        dy += vector.y * pulse;
      }
      if (isMagicToken(token) && spec.phase >= 2) {
        dx += vector.x;
        dy += vector.y;
      }
    }

    return { dx, dy };
  }

  function pixelOffset(pixel, spec) {
    if (spec.kind === "idle") {
      return { dx: 0, dy: spec.phase === 1 && pixel.y < 43 ? -1 : 0 };
    }

    if (spec.kind === "walk") {
      return walkOffset(pixel.x, pixel.y, pixel.token, spec);
    }

    if (spec.kind === "cast-orb" || spec.kind === "cast-burst" || spec.kind === "elemental-cast") {
      return castOffset(pixel.x, pixel.y, pixel.token, spec);
    }

    return { dx: 0, dy: 0 };
  }

  function addEffectPixel(pixels, x, y, token, size = 1) {
    pixels.push({ x, y, token, size });
  }

  function addEffectLine(pixels, x0, y0, x1, y1, token) {
    let x = x0;
    let y = y0;
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;

    while (true) {
      addEffectPixel(pixels, x, y, token);
      if (x === x1 && y === y1) break;
      const e2 = 2 * error;
      if (e2 >= dy) {
        error += dy;
        x += sx;
      }
      if (e2 <= dx) {
        error += dx;
        y += sy;
      }
    }
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

  function fireEffect(phase) {
    const pixels = [];
    const flicker = phase % 2;
    const reach = Math.min(phase, 4);
    const y = 34 + reach;

    addEffectPixel(pixels, 38, y + 2, "fire-shadow", 2);
    addEffectPixel(pixels, 42, y + 3 - flicker, "fire-shadow", 2);
    addEffectPixel(pixels, 37, y, "fire", 2);
    addEffectPixel(pixels, 41, y + 1, "fire", 2);
    addEffectPixel(pixels, 40, y - 3 - flicker, "fire-core", 2);
    addEffectPixel(pixels, 44, y - 1, "fire-core", 1);
    if (phase >= 2) {
      addEffectPixel(pixels, 36, y + 5, "fire", 1);
      addEffectPixel(pixels, 46, y + 4, "fire-shadow", 1);
    }
    if (phase >= 4) {
      addEffectPixel(pixels, 40 + flicker, y + 7, "fire-core", 1);
      addEffectPixel(pixels, 44 - flicker, y + 7, "fire", 1);
    }
    return pixels;
  }

  function earthEffect(phase) {
    const pixels = [];
    const lift = Math.min(phase, 4);
    const jitter = phase % 2;

    addEffectPixel(pixels, 15, 20 - lift, "earth-shadow", 2);
    addEffectPixel(pixels, 34, 18 - lift + jitter, "earth-shadow", 2);
    addEffectPixel(pixels, 18, 15 - lift, "earth", 2);
    addEffectPixel(pixels, 38, 14 - lift - jitter, "earth", 1);
    addEffectPixel(pixels, 25, 10 - lift, "earth-core", 1);
    addEffectPixel(pixels, 13, 23 - lift, "earth-core", 1);
    if (phase >= 2) {
      addEffectLine(pixels, 14, 22 - lift, 39, 22 - lift, "earth-shadow");
      addEffectPixel(pixels, 31, 13 - lift, "earth-core", 1);
    }
    if (phase >= 4) {
      addEffectPixel(pixels, 30, 7 - lift, "earth-core", 1);
      addEffectPixel(pixels, 12, 16 - lift, "earth", 1);
    }
    return pixels;
  }

  function waterEffect(phase) {
    const pixels = [];
    const roll = phase % 3;
    const x = 30 + Math.min(phase, 4);

    addEffectLine(pixels, x - 1, 25 + roll, x + 7, 20 - roll, "water-shadow");
    addEffectLine(pixels, x, 24 + roll, x + 8, 19 - roll, "water");
    addEffectPixel(pixels, x + 3, 22 - roll, "water-core", 2);
    addEffectPixel(pixels, x + 8, 18 - roll, "water-core", 1);
    addEffectPixel(pixels, x + 5, 27 + roll, "water", 1);
    if (phase >= 2) {
      addEffectPixel(pixels, x + 10, 21, "water", 2);
      addEffectPixel(pixels, x + 12, 24, "water-shadow", 1);
    }
    if (phase >= 4) addEffectPixel(pixels, x + 13, 19 + roll, "water-core", 1);
    return pixels;
  }

  function electricEffect(phase) {
    const pixels = [];
    const jitter = phase % 2;
    const reach = Math.min(phase, 4);
    const points = [
      [20 - reach, 19 + jitter],
      [16 - reach, 17 - jitter],
      [17 - reach, 22 + jitter],
      [12 - reach, 24 - jitter],
      [13 - reach, 29],
      [8 - reach, 31 + jitter],
    ];

    for (let index = 0; index < points.length - 1; index += 1) {
      const [x0, y0] = points[index];
      const [x1, y1] = points[index + 1];
      addEffectLine(pixels, x0, y0 + 1, x1, y1 + 1, "electric-shadow");
      addEffectLine(pixels, x0, y0, x1, y1, "electric");
    }
    addEffectPixel(pixels, points[0][0], points[0][1], "electric-core", 2);
    addEffectPixel(pixels, points[2][0], points[2][1], "electric-core", 1);
    addEffectPixel(pixels, points[5][0], points[5][1], "electric-core", 1);
    if (phase >= 3) {
      addEffectPixel(pixels, 14 - reach, 15 + jitter, "electric-core", 1);
      addEffectPixel(pixels, 10 - reach, 27 - jitter, "electric", 1);
    }
    return pixels;
  }

  function elementalEffect(spec) {
    if (spec.element === "fire") return fireEffect(spec.phase);
    if (spec.element === "earth") return earthEffect(spec.phase);
    if (spec.element === "water") return waterEffect(spec.phase);
    if (spec.element === "electric") return electricEffect(spec.phase);
    return [];
  }

  function effectPixels(spec) {
    if (spec.kind === "cast-orb") return orbEffect(spec.phase);
    if (spec.kind === "cast-burst") return burstEffect(spec.phase);
    if (spec.kind === "elemental-cast") return elementalEffect(spec);
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
      this.hoverSpellIndex = 0;
      this.once = null;

      this.bindInteractions();
      this.observeBusyState();
      this.tick = this.tick.bind(this);
      renderFrame(this.svg, data.animations["idle-down"].frames[0]);
      if (!reducedMotionQuery.matches) requestAnimationFrame(this.tick);
    }

    bindInteractions() {
      const hoverTrigger = this.root.closest("[data-wizard-hover-cast]") || (this.state === "header" ? this.root : null);
      const focusTrigger = this.root.closest(".brand-lockup") || (this.state === "header" ? this.root : null);
      const hoverEvent = window.PointerEvent ? "pointerenter" : "mouseenter";

      if (hoverTrigger) {
        hoverTrigger.addEventListener(hoverEvent, () => this.playNextHoverSpell());
      }

      if (focusTrigger) {
        focusTrigger.addEventListener("focusin", () => this.playNextHoverSpell());
        focusTrigger.addEventListener("click", () => this.playOnce("cast-burst"));
      }

      reducedMotionQuery.addEventListener("change", () => {
        if (reducedMotionQuery.matches) {
          renderFrame(this.svg, data.animations["idle-down"].frames[0]);
        } else {
          requestAnimationFrame(this.tick);
        }
      });
    }

    playNextHoverSpell() {
      if (!hoverSpellStates.length) return;
      const state = hoverSpellStates[this.hoverSpellIndex % hoverSpellStates.length];
      this.hoverSpellIndex = (this.hoverSpellIndex + 1) % hoverSpellStates.length;
      this.playOnce(state);
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
