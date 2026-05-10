(() => {
  const lab = document.querySelector("[data-mage-lab]");
  if (!lab) return;

  const body = document.body;
  const canvas = document.getElementById("mageDungeonCanvas");
  const actor = document.getElementById("mageDungeonActor");
  const actorSprite = actor?.querySelector("[data-mage-dungeon-sprite]");
  const ctx = canvas?.getContext("2d", { alpha: true });
  if (!canvas || !ctx || !actor || !actorSprite) return;

  const spellReadout = lab.querySelector("[data-mage-spell-readout]");
  const stateReadout = lab.querySelector("[data-mage-state-readout]");
  const positionReadout = lab.querySelector("[data-mage-position-readout]");
  const seedInput = document.getElementById("mageSeedColor");
  const levelInput = document.getElementById("mageSpellLevel");
  const levelOutput = document.getElementById("mageSpellLevelOutput");
  const castButton = document.getElementById("mageCastButton");
  const demoButton = document.getElementById("mageDemoButton");
  const stateButtons = [...lab.querySelectorAll("[data-mage-lab-state]")];
  const spellButtons = [...lab.querySelectorAll("[data-mage-spell]")];
  const seedButtons = [...lab.querySelectorAll("[data-mage-seed]")];
  const storyboardOutput = lab.querySelector("[data-mage-storyboard-output]");

  const keys = new Set();
  const walkVectorByKey = {
    ArrowUp: [0, -1, "north", "up"],
    KeyW: [0, -1, "north", "up"],
    ArrowDown: [0, 1, "south", "down"],
    KeyS: [0, 1, "south", "down"],
    ArrowLeft: [-1, 0, "west", "left"],
    KeyA: [-1, 0, "west", "left"],
    ArrowRight: [1, 0, "east", "right"],
    KeyD: [1, 0, "east", "right"],
  };
  const elementByKey = {
    Digit1: "fire",
    Digit2: "earth",
    Digit3: "electric",
    Digit4: "water",
  };
  const directionToWalkState = {
    south: "walk-down",
    north: "walk-up",
    east: "walk-right",
    west: "walk-left",
  };
  const directionToIdleState = {
    south: "idle-down",
    north: "idle-up",
    east: "idle-right",
    west: "idle-left",
  };
  const castDirection = {
    south: [0, 1],
    north: [0, -1],
    east: [1, 0],
    west: [-1, 0],
  };
  const elementVars = {
    fire: ["--mage-px-fire-shadow", "--mage-px-fire", "--mage-px-fire-core"],
    earth: ["--mage-px-earth-shadow", "--mage-px-earth", "--mage-px-earth-core"],
    electric: ["--mage-px-electric-shadow", "--mage-px-electric", "--mage-px-electric-core"],
    water: ["--mage-px-water-shadow", "--mage-px-water", "--mage-px-water-core"],
  };
  const storyboardSpells = [
    { id: "fire", label: "Fire" },
    { id: "earth", label: "Earth" },
    { id: "electric", label: "Electric" },
    { id: "water", label: "Water" },
  ];
  const storyboardDirections = [
    { id: "north", label: "North" },
    { id: "south", label: "South" },
    { id: "east", label: "East" },
    { id: "west", label: "West" },
  ];
  const roomPlate = new Image();
  let roomPlateReady = false;
  roomPlate.decoding = "async";
  roomPlate.addEventListener("load", () => {
    roomPlateReady = true;
  });
  roomPlate.src = "assets/images/mage-lab-inspired-room.jpg?v=20260509-dungeon-room-plate";
  if (roomPlate.complete) roomPlateReady = true;

  const map = [
    "###########################",
    "#.........................#",
    "#..####.............####..#",
    "#..####.............####..#",
    "#.........................#",
    "#.....#.............#.....#",
    "#.........................#",
    "#.........................#",
    "#.........##...##.........#",
    "#.........................#",
    "#.........................#",
    "#.....#.............#.....#",
    "#.........................#",
    "#..###...............###..#",
    "#.........................#",
    "#.........................#",
    "###########################",
  ];
  const mapWidth = map[0].length;
  const mapDepth = map.length;
  const dungeonFixtures = [
    { type: "bookStack", x: 10.2, z: 5.8, phase: 0.2 },
    { type: "candle", x: 12.6, z: 6.2, phase: 1.9 },
    { type: "candle", x: 14.1, z: 6.2, phase: 2.8 },
    { type: "crystal", x: 5.9, z: 9.6, phase: 3.1 },
    { type: "crystal", x: 20.1, z: 9.8, phase: 4.1 },
    { type: "candle", x: 4.8, z: 13.8, phase: 3.4 },
    { type: "candle", x: 21.1, z: 13.6, phase: 5.1 },
  ];

  const state = {
    x: 13,
    z: 12,
    facing: "south",
    spell: "fire",
    level: 10,
    spriteState: "idle-down",
    manualState: "",
    castUntil: 0,
    activeSpell: null,
    lastTime: 0,
    dpr: 1,
    width: 1,
    height: 1,
    tileW: 72,
    tileH: 36,
  };
  let demoTimer = 0;
  const ambientMotes = Array.from({ length: 58 }, (_, index) => {
    const x = 1 + ((index * 7 + 3) % (mapWidth - 2));
    const z = 1 + ((index * 11 + 5) % (mapDepth - 2));
    return {
      x,
      z,
      phase: index * 0.73,
      lift: 22 + (index % 9) * 8,
      scale: 0.58 + (index % 4) * 0.18,
      element: index % 5,
    };
  }).filter((mote) => !blocked(mote.x, mote.z));

  function css(name, fallback) {
    const value = getComputedStyle(body).getPropertyValue(name).trim();
    return value || fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function isFormField(target) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
  }

  function blocked(x, z) {
    const mx = Math.round(x);
    const mz = Math.round(z);
    const row = map[mz];
    return !row || row[mx] === "#";
  }

  function project(x, z, lift = 0) {
    const depth = clamp(z / (mapDepth - 1), 0, 1);
    const eased = Math.pow(depth, 1.08);
    const farLeft = state.width * 0.265;
    const farRight = state.width * 0.735;
    const nearLeft = state.width * 0.055;
    const nearRight = state.width * 0.945;
    const left = farLeft + (nearLeft - farLeft) * eased;
    const right = farRight + (nearRight - farRight) * eased;
    const xRatio = clamp(x / (mapWidth - 1), 0, 1);
    return {
      x: Math.round(left + (right - left) * xRatio),
      y: Math.round(state.height * 0.59 + Math.pow(depth, 1.18) * state.height * 0.31 - lift * (0.46 + depth * 0.62)),
    };
  }

  function setSpriteState(nextState, force = false) {
    if (!nextState || (!force && state.spriteState === nextState)) return;
    state.spriteState = nextState;
    actorSprite.dataset.mageState = nextState;
    window.DitherMageSprite?.setRootState?.(actorSprite, nextState);
    if (stateReadout) stateReadout.textContent = nextState;
    stateButtons.forEach((button) => {
      const active =
        button.dataset.mageLabState === nextState ||
        ((nextState.startsWith("cast-") || nextState.startsWith("storyboard-")) && button.dataset.mageLabState === "header");
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function updateActorPosition() {
    const point = project(state.x, state.z, 0);
    const depth = clamp(state.z / (mapDepth - 1), 0, 1);
    const scale = 0.78 + depth * 0.44;
    actor.style.left = `${point.x}px`;
    actor.style.top = `${point.y + 14}px`;
    actor.style.transform = `translate(-50%, -88%) scale(${scale.toFixed(3)})`;
    actor.style.zIndex = String(160 + Math.round(state.z * 12));
    if (positionReadout) {
      positionReadout.textContent = `cell ${Math.round(state.x).toString().padStart(2, "0")} / ${Math.round(state.z).toString().padStart(2, "0")}`;
    }
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(1, Math.round(rect.width));
    state.height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    state.tileW = clamp(state.width / 24, 34, 82);
    state.tileH = clamp(state.height / 30, 20, 36);
    updateActorPosition();
  }

  function path(points) {
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
  }

  function drawDiamond(x, z, fill, stroke) {
    const top = project(x, z - 0.5);
    const right = project(x + 0.5, z);
    const bottom = project(x, z + 0.5);
    const left = project(x - 0.5, z);
    path([top, right, bottom, left]);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawWall(x, z) {
    if (x === 0 || z === 0 || x === mapWidth - 1 || z === mapDepth - 1) return;
    const lift = state.tileH * 0.82;
    const top = project(x, z - 0.5, lift);
    const right = project(x + 0.5, z, lift);
    const bottom = project(x, z + 0.5, lift);
    const left = project(x - 0.5, z, lift);
    const groundTop = project(x, z - 0.5);
    const groundRight = project(x + 0.5, z);
    const groundBottom = project(x, z + 0.5);
    const groundLeft = project(x - 0.5, z);

    const wood = css("--mage-px-staff-mid", "#684425");
    const stone = css("--mage-wall-top", "#263646");
    const dark = css("--mage-wall-right", "#0f171f");
    const topColor = (x * 5 + z * 3) % 4 === 0 ? wood : stone;

    path([left, bottom, groundBottom, groundLeft]);
    ctx.fillStyle = dark;
    ctx.fill();
    path([right, bottom, groundBottom, groundRight]);
    ctx.fillStyle = css("--mage-wall-left", "#172330");
    ctx.fill();
    path([top, right, bottom, left]);
    ctx.fillStyle = topColor;
    ctx.fill();
    ctx.strokeStyle = css("--mage-wall-line", "#4e5e70");
    ctx.lineWidth = 1;
    ctx.stroke();

    const chip = Math.max(2, Math.round(state.tileW / 20));
    const detailColors = [
      css("--mage-px-gold", "#c48a3d"),
      css("--mage-px-water", "#2c9ecb"),
      css("--mage-px-earth", "#718143"),
      css("--mage-px-fire", "#e45324"),
    ];
    for (let i = 0; i < 4; i += 1) {
      const p = project(x - 0.26 + i * 0.17, z - 0.11 + (i % 2) * 0.16, lift + 1);
      ctx.fillStyle = detailColors[(x + z + i) % detailColors.length];
      ctx.fillRect(p.x, p.y, chip * (i % 2 ? 1 : 2), chip);
    }
  }

  function drawRuneLine(x, z, color, alpha = 1) {
    const a = project(x - 0.36, z);
    const b = project(x + 0.36, z);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  function blockSize(scale = 1) {
    return Math.max(2, Math.round((state.tileW / 14) * scale));
  }

  function drawBlock(point, size, color, alpha = 1) {
    const pixelSize = Math.max(1, Math.round(size));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(point.x - pixelSize / 2), Math.round(point.y - pixelSize / 2), pixelSize, pixelSize);
    ctx.restore();
  }

  function drawPixelLine(points, color, width, alpha = 1) {
    if (points.length < 2) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, Math.round(width));
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function fillPixelRect(x, y, width, height, color, alpha = 1) {
    const step = 2;
    const xx = Math.round(x / step) * step;
    const yy = Math.round(y / step) * step;
    const ww = Math.max(1, Math.round(width / step) * step);
    const hh = Math.max(1, Math.round(height / step) * step);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(xx, yy, ww, hh);
    ctx.restore();
  }

  function dungeonPixel(scale = 1) {
    return Math.max(2, Math.round((state.tileW / 28) * scale));
  }

  function drawPixelFrame(x, y, width, height, colors) {
    const p = dungeonPixel();
    fillPixelRect(x - p, y - p, width + p * 2, height + p * 2, colors.outline, 1);
    fillPixelRect(x, y, width, height, colors.fill, colors.alpha ?? 1);
    fillPixelRect(x, y, width, p, colors.highlight, colors.highlightAlpha ?? 0.74);
    fillPixelRect(x, y, p, height, colors.highlight, colors.highlightAlpha ?? 0.42);
    fillPixelRect(x, y + height - p, width, p, colors.shadow, colors.shadowAlpha ?? 0.72);
    fillPixelRect(x + width - p, y, p, height, colors.shadow, colors.shadowAlpha ?? 0.62);
  }

  function drawPixelChips(x, y, width, height, options = {}) {
    const step = dungeonPixel(options.scale || 1);
    const cols = Math.max(1, Math.floor(width / (step * 5)));
    const rows = Math.max(1, Math.floor(height / (step * 5)));
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const seed = (col * 17 + row * 31 + (options.seed || 0)) % 11;
        if (seed > (options.density || 2)) continue;
        const xx = x + col * step * 5 + ((row + seed) % 3) * step;
        const yy = y + row * step * 5 + ((col + seed) % 4) * step;
        const color = seed % 2 ? options.light : options.shadow;
        fillPixelRect(xx, yy, step * (seed % 3 === 0 ? 3 : 2), step, color, options.alpha || 0.62);
      }
    }
  }

  function drawSteppedArch(centerX, topY, width, height, thickness, color, shadow) {
    const step = Math.max(4, Math.round(thickness * 0.58));
    const half = width / 2;
    for (let i = 0; i < 14; i += 1) {
      const t = i / 13;
      const archWidth = half * Math.sin(t * Math.PI * 0.52);
      const y = topY + t * height * 0.46;
      fillPixelRect(centerX - archWidth - thickness, y, thickness, step + 2, shadow, 0.72);
      fillPixelRect(centerX + archWidth, y, thickness, step + 2, color, 0.82);
      if (i % 2 === 0) {
        fillPixelRect(centerX - archWidth - thickness, y, thickness * 1.55, 2, color, 0.5);
        fillPixelRect(centerX + archWidth - thickness * 0.55, y, thickness * 1.55, 2, shadow, 0.46);
      }
    }
    fillPixelRect(centerX - half - thickness, topY + height * 0.36, thickness, height * 0.64, shadow, 0.82);
    fillPixelRect(centerX + half, topY + height * 0.36, thickness, height * 0.64, color, 0.76);
  }

  function drawStainedWindow(x, y, width, height, phase, now) {
    const pulse = 0.58 + Math.sin(now * 0.0015 + phase) * 0.18;
    fillPixelRect(x - 4, y - 6, width + 8, height + 12, css("--mage-wall-right", "#0d131b"), 0.92);
    fillPixelRect(x, y, width, height, css("--mage-px-void", "#010107"), 0.94);
    const pane = Math.max(3, Math.round(width / 5));
    const colors = [
      css("--mage-px-water", "#2c9ecb"),
      css("--mage-px-fire", "#e45324"),
      css("--mage-px-electric", "#68d9ff"),
      css("--mage-px-earth-core", "#c7b36b"),
    ];
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const color = colors[(row + col + Math.round(phase)) % colors.length];
        fillPixelRect(x + 4 + col * pane * 1.3, y + 5 + row * (height / 5.6), pane, height / 7.2, color, pulse * (row === 1 ? 0.9 : 0.55));
      }
    }
    fillPixelRect(x + Math.round(width * 0.48), y, 2, height, css("--mage-wall-chip", "#748498"), 0.72);
    fillPixelRect(x, y + Math.round(height * 0.48), width, 2, css("--mage-wall-chip", "#748498"), 0.66);
  }

  function drawShelf(x, y, width, now) {
    const wood = css("--mage-px-staff-mid", "#684425");
    const dark = css("--mage-px-staff-dark", "#251811");
    fillPixelRect(x, y, width, 6, dark, 0.95);
    fillPixelRect(x + 2, y - 44, width - 4, 5, wood, 0.9);
    fillPixelRect(x + 5, y - 22, width - 10, 5, wood, 0.9);
    const colors = [
      css("--mage-px-robe-mid", "#6b52bd"),
      css("--mage-px-water", "#2c9ecb"),
      css("--mage-px-fire", "#e45324"),
      css("--mage-px-earth", "#718143"),
      css("--mage-px-gold", "#c48a3d"),
    ];
    for (let i = 0; i < 18; i += 1) {
      const row = i % 2;
      const bookX = x + 8 + (i % 9) * Math.max(5, width / 11);
      const bookY = y - 46 + row * 22;
      const bookH = 10 + ((i * 5) % 10);
      fillPixelRect(bookX, bookY + (18 - bookH), 4 + (i % 3), bookH, colors[i % colors.length], 0.8);
    }
    const glint = 0.4 + Math.sin(now * 0.003) * 0.16;
    fillPixelRect(x + width * 0.68, y - 59, 7, 7, css("--mage-px-earth-core", "#c7b36b"), glint);
  }

  function drawHangingCandles(now) {
    const w = state.width;
    const top = state.height * 0.13;
    const center = w * 0.51;
    const gold = css("--mage-px-gold", "#c48a3d");
    const flame = css("--mage-px-fire-core", "#ffd36a");
    fillPixelRect(center - state.tileW * 1.15, top, state.tileW * 2.3, 4, gold, 0.72);
    for (let i = 0; i < 7; i += 1) {
      const x = center - state.tileW * 0.95 + i * state.tileW * 0.32;
      const hang = 26 + (i % 3) * 9;
      const y = top + hang + Math.sin(now * 0.002 + i) * 2;
      fillPixelRect(x, top + 4, 2, hang, css("--mage-wall-line", "#4e5e70"), 0.45);
      fillPixelRect(x - 3, y, 6, 14, css("--mage-px-beard", "#cbd4ee"), 0.72);
      fillPixelRect(x - 4, y - 6, 7, 7, css("--mage-px-fire", "#e45324"), 0.68);
      fillPixelRect(x, y - 6, 3, 4, flame, 0.88);
    }
  }

  function drawVines(now) {
    const green = css("--mage-px-earth", "#718143");
    const light = css("--mage-px-earth-core", "#c7b36b");
    for (let side = 0; side < 2; side += 1) {
      const anchorX = side ? state.width * 0.84 : state.width * 0.13;
      for (let i = 0; i < 5; i += 1) {
        const x = anchorX + Math.sin(now * 0.0009 + i) * 7 + i * (side ? 6 : -6);
        const y = state.height * (0.2 + i * 0.065);
        fillPixelRect(x, y, 3, 52 + (i % 2) * 24, green, 0.46);
        fillPixelRect(x + (side ? 4 : -5), y + 20, 7, 4, i % 2 ? light : green, 0.52);
      }
    }
  }

  function drawCauldronBeam(now) {
    const pot = project(10, 8, 28);
    const topY = state.height * 0.24;
    const pulse = 0.36 + Math.sin(now * 0.0018) * 0.1;
    const green = css("--mage-px-earth-core", "#c7b36b");
    const water = css("--mage-px-water-core", "#b9f3ff");
    for (let i = 0; i < 6; i += 1) {
      const width = state.tileW * (0.18 + i * 0.08);
      const x = pot.x - width / 2 + Math.sin(now * 0.001 + i) * 6;
      fillPixelRect(x, topY + i * 3, width, pot.y - topY - i * 3, i % 2 ? water : green, pulse * (0.72 - i * 0.07));
    }
  }

  function drawBlockGlow(cx, cy, width, height, color, alpha = 0.12) {
    const p = dungeonPixel(1.3);
    for (let layer = 5; layer >= 1; layer -= 1) {
      const scale = layer / 2.5;
      fillPixelRect(cx - (width * scale) / 2, cy - (height * scale) / 2, width * scale, height * scale, color, alpha / (layer + 0.8));
      if (layer % 2 === 1) {
        fillPixelRect(cx - width * scale * 0.24, cy - height * scale * 0.08, p * (layer + 1), p, color, alpha * 0.8);
      }
    }
  }

  function drawMasonry(x, y, width, height, now) {
    const wall = css("--mage-stone-shadow", "#102019");
    const mid = css("--mage-stone-mid", "#263b2f");
    const lit = css("--mage-stone-lit", "#5a6c4f");
    const chip = css("--mage-stone-chip", "#91a07d");
    const dark = css("--mage-stone-deep", "#06100e");
    const line = css("--mage-wall-line", "#4e5e70");
    fillPixelRect(x, y, width, height, dark, 1);
    fillPixelRect(x + 4, y + 4, width - 8, height - 4, wall, 1);
    const rowH = Math.max(18, Math.round(height / 13));
    for (let row = 0; row <= height / rowH; row += 1) {
      const yy = y + row * rowH;
      fillPixelRect(x, yy, width, 2, dark, 0.88);
      const offset = row % 2 ? rowH * 1.9 : 0;
      const blockW = rowH * 3.4;
      for (let xx = x - offset; xx < x + width; xx += blockW) {
        const brickX = xx + 2;
        const brickY = yy + 3;
        const brickW = blockW - 4;
        const brickH = rowH - 5;
        fillPixelRect(brickX, brickY, brickW, brickH, (row + Math.round(xx)) % 3 ? wall : mid, 0.7);
        fillPixelRect(brickX, brickY, brickW, 2, lit, 0.2);
        fillPixelRect(brickX, brickY + brickH - 2, brickW, 2, dark, 0.36);
        fillPixelRect(xx, yy + 2, 2, rowH - 3, dark, 0.66);
        if ((Math.round(xx + row * 13) % 5) === 0) fillPixelRect(xx + blockW * 0.38, yy + rowH * 0.55, blockW * 0.24, 2, line, 0.48 + Math.sin(now * 0.001 + row) * 0.04);
        if ((Math.round(xx + row * 19) % 7) === 0) fillPixelRect(xx + blockW * 0.16, yy + rowH * 0.28, 8, 2, chip, 0.46);
      }
    }
    drawPixelChips(x + 12, y + 12, width - 24, height - 20, { light: chip, shadow: dark, seed: 3, density: 2, alpha: 0.38, scale: 0.85 });
  }

  function drawGothicWindow(cx, top, width, height, now) {
    const dark = css("--mage-px-void", "#010107");
    const line = css("--mage-wall-line", "#4e5e70");
    const blue = css("--mage-px-water", "#2c9ecb");
    const core = css("--mage-px-water-core", "#b9f3ff");
    const glow = 0.32 + Math.sin(now * 0.0015) * 0.06;
    drawBlockGlow(cx, top + height * 0.55, width * 1.2, height * 1.2, blue, 0.06);
    for (let step = 0; step < 11; step += 1) {
      const t = step / 10;
      const rowW = width * (0.32 + Math.sin(t * Math.PI) * 0.68);
      const rowY = top + t * height * 0.26;
      fillPixelRect(cx - rowW / 2 - 5, rowY, rowW + 10, Math.max(5, height * 0.025), dark, 0.9);
      fillPixelRect(cx - rowW / 2, rowY + 4, rowW, Math.max(8, height * 0.026), line, 0.42);
    }
    drawPixelFrame(cx - width * 0.5, top + height * 0.24, width, height * 0.72, {
      fill: dark,
      outline: css("--mage-stone-deep", "#06100e"),
      highlight: line,
      shadow: dark,
      alpha: 0.94,
      highlightAlpha: 0.38,
      shadowAlpha: 0.78,
    });
    fillPixelRect(cx - 2, top + height * 0.27, 4, height * 0.66, line, 0.74);
    fillPixelRect(cx - width * 0.24, top + height * 0.34, 4, height * 0.54, line, 0.48);
    fillPixelRect(cx + width * 0.24, top + height * 0.34, 4, height * 0.54, line, 0.48);
    for (let i = 0; i < 18; i += 1) {
      const xx = cx - width * 0.42 + ((i * 17) % Math.round(width * 0.84));
      const yy = top + height * (0.28 + ((i * 11) % 56) / 100);
      fillPixelRect(xx, yy, 2 + (i % 3), 18 + (i % 4) * 9, i % 4 ? blue : core, glow * (0.42 + (i % 3) * 0.1));
    }
    for (let i = 0; i < 13; i += 1) {
      const crackX = cx - width * 0.24 + Math.sin(i * 1.8) * width * 0.22;
      const crackY = top + height * (0.36 + i * 0.043);
      fillPixelRect(crackX, crackY, 2, 8 + (i % 2) * 5, line, 0.28);
    }
  }

  function drawBookcase(x, y, width, height, side, now) {
    const dark = css("--mage-wood-deep", "#140b08");
    const wood = css("--mage-wood-mid", "#5c351d");
    const woodLit = css("--mage-wood-lit", "#a26a35");
    const gold = css("--mage-px-gold", "#c48a3d");
    drawPixelFrame(x, y, width, height, {
      fill: colorMixFallback(css("--mage-wall-right", "#07100d"), "#07100d"),
      outline: dark,
      highlight: woodLit,
      shadow: dark,
      alpha: 0.96,
      highlightAlpha: 0.62,
      shadowAlpha: 0.86,
    });
    fillPixelRect(x + 4, y + 8, 6, height - 12, wood, 0.94);
    fillPixelRect(x + width - 10, y + 8, 6, height - 12, dark, 0.94);
    fillPixelRect(x + 8, y + 8, width - 16, 4, woodLit, 0.6);
    const shelfCount = 5;
    const bookColors = [
      css("--mage-px-gold", "#c48a3d"),
      css("--mage-px-fire-shadow", "#8a2414"),
      css("--mage-px-water-shadow", "#173f5f"),
      css("--mage-px-earth", "#718143"),
      css("--mage-px-beard-shadow", "#747789"),
    ];
    for (let shelf = 0; shelf < shelfCount; shelf += 1) {
      const shelfY = y + 26 + shelf * ((height - 42) / shelfCount);
      fillPixelRect(x + 8, shelfY, width - 16, 6, dark, 0.96);
      fillPixelRect(x + 8, shelfY - 2, width - 16, 2, woodLit, 0.68);
      let cursor = x + 12;
      let book = 0;
      while (cursor < x + width - 18) {
        const bookW = 4 + ((book * 5 + shelf * 3 + side) % 7);
        const bookH = 12 + ((book * 7 + shelf * 2) % 18);
        const lean = ((book + shelf) % 5) - 2;
        fillPixelRect(cursor + lean - 1, shelfY - bookH - 1, bookW + 2, bookH + 2, dark, 0.9);
        fillPixelRect(cursor + lean, shelfY - bookH, bookW, bookH, bookColors[(book + shelf + side) % bookColors.length], 0.88);
        fillPixelRect(cursor + lean, shelfY - bookH + 2, Math.max(2, bookW - 1), 2, woodLit, 0.28);
        if ((book + shelf) % 6 === 0) fillPixelRect(cursor + lean, shelfY - bookH + 5, bookW, 2, gold, 0.68);
        cursor += bookW + 2 + ((book + shelf) % 4);
        book += 1;
      }
    }
    const glint = 0.44 + Math.sin(now * 0.002 + side) * 0.08;
    fillPixelRect(x + width * 0.18, y + height * 0.8, width * 0.3, 3, gold, glint);
    drawPixelChips(x + 14, y + 14, width - 28, height - 28, { light: woodLit, shadow: dark, seed: side + 5, density: 1, alpha: 0.26, scale: 0.8 });
  }

  function drawSconce(cx, cy, phase, now, scale = 1) {
    const iron = css("--mage-px-staff-dark", "#251811");
    const gold = css("--mage-px-gold", "#c48a3d");
    const fire = css("--mage-px-fire", "#e45324");
    const core = css("--mage-px-fire-core", "#ffd36a");
    const pulse = 0.76 + Math.sin(now * 0.006 + phase) * 0.16;
    drawBlockGlow(cx, cy - 7 * scale, 76 * scale, 58 * scale, core, 0.13 * pulse);
    fillPixelRect(cx - 20 * scale, cy + 10 * scale, 40 * scale, 7 * scale, iron, 1);
    fillPixelRect(cx - 18 * scale, cy + 12 * scale, 36 * scale, 3 * scale, gold, 0.56);
    for (let i = -1; i <= 1; i += 1) {
      const candleX = cx + i * 12 * scale;
      fillPixelRect(candleX - 4 * scale, cy - 5 * scale, 8 * scale, 22 * scale, css("--mage-px-outline", "#05050b"), 0.9);
      fillPixelRect(candleX - 3 * scale, cy - 5 * scale, 6 * scale, 20 * scale, css("--mage-px-beard", "#cbd4ee"), 0.9);
      fillPixelRect(candleX - 6 * scale, cy - 14 * scale, 12 * scale, 10 * scale, fire, 0.88 * pulse);
      fillPixelRect(candleX - 1 * scale, cy - 16 * scale, 5 * scale, 8 * scale, core, 1 * pulse);
    }
    fillPixelRect(cx - 6 * scale, cy + 17 * scale, 12 * scale, 18 * scale, gold, 0.68);
  }

  function drawStoneColumn(cx, baseY, width, height, phase, now) {
    const top = baseY - height;
    const stone = css("--mage-stone-mid", "#263b2f");
    const shade = css("--mage-stone-deep", "#07100d");
    const lit = css("--mage-stone-lit", "#5a6c4f");
    const chip = css("--mage-stone-chip", "#91a07d");
    const line = css("--mage-wall-line", "#4e5e70");
    drawPixelFrame(cx - width * 0.42, top, width * 0.84, height, {
      fill: stone,
      outline: shade,
      highlight: lit,
      shadow: shade,
      alpha: 0.96,
      highlightAlpha: 0.42,
      shadowAlpha: 0.72,
    });
    fillPixelRect(cx - width * 0.62, top - 18, width * 1.24, 16, shade, 1);
    fillPixelRect(cx - width * 0.52, top - 30, width * 1.04, 12, stone, 1);
    fillPixelRect(cx - width * 0.5, top - 30, width * 0.84, 3, lit, 0.48);
    fillPixelRect(cx + width * 0.22, top, width * 0.2, height, shade, 0.54);
    const rows = 9;
    for (let row = 0; row < rows; row += 1) {
      const yy = top + row * (height / rows);
      fillPixelRect(cx - width * 0.42, yy, width * 0.84, 2, shade, 0.72);
      fillPixelRect(cx - width * 0.34, yy + 3, width * 0.18, 2, chip, 0.38);
      if (row % 2 === 0) fillPixelRect(cx, yy + 4, 2, height / rows - 5, shade, 0.42);
    }
    fillPixelRect(cx - width * 0.58, baseY, width * 1.16, 18, shade, 1);
    fillPixelRect(cx - width * 0.68, baseY + 18, width * 1.36, 10, stone, 0.96);
    drawPixelChips(cx - width * 0.34, top + 16, width * 0.65, height - 30, { light: chip, shadow: shade, seed: Math.round(phase * 10), density: 1, alpha: 0.34, scale: 0.72 });
    drawSconce(cx, top + height * 0.42, phase, now, Math.max(0.7, width / 96));
  }

  function drawCentralTable(cx, y, width, height, now) {
    const dark = css("--mage-wood-deep", "#251811");
    const wood = css("--mage-wood-mid", "#684425");
    const woodLit = css("--mage-wood-lit", "#a26a35");
    const gold = css("--mage-px-gold", "#c48a3d");
    drawPixelFrame(cx - width / 2, y, width, height, {
      fill: dark,
      outline: css("--mage-px-outline", "#05050b"),
      highlight: woodLit,
      shadow: dark,
      alpha: 0.96,
      highlightAlpha: 0.38,
      shadowAlpha: 0.78,
    });
    fillPixelRect(cx - width / 2 - 8, y - 10, width + 16, 14, css("--mage-px-outline", "#05050b"), 0.96);
    fillPixelRect(cx - width / 2 - 6, y - 8, width + 12, 10, wood, 0.98);
    fillPixelRect(cx - width / 2, y - 8, width * 0.75, 3, woodLit, 0.55);
    fillPixelRect(cx - width / 2 + 8, y + height - 8, width - 16, 6, gold, 0.38);
    for (let i = 0; i < 6; i += 1) {
      fillPixelRect(cx - width * 0.34 + i * width * 0.065 - 1, y - 19 - (i % 2) * 4, width * 0.12 + 2, 9, dark, 0.9);
      fillPixelRect(cx - width * 0.34 + i * width * 0.065, y - 18 - (i % 2) * 4, width * 0.12, 7, i % 2 ? css("--mage-px-fire-shadow", "#8a2414") : wood, 0.86);
    }
    drawSconce(cx + width * 0.32, y - 22, 2.7, now, 0.62);
  }

  function drawSpatialFloor(now) {
    const floorA = css("--mage-floor-a", "#111b18");
    const floorB = css("--mage-floor-b", "#182820");
    const line = css("--mage-floor-line", "#4c604d");
    const chip = css("--mage-stone-chip", "#91a07d");
    const dark = css("--mage-stone-deep", "#06100e");
    const farLeft = project(1, 1);
    const farRight = project(mapWidth - 2, 1);
    const nearRight = project(mapWidth - 1, mapDepth - 1);
    const nearLeft = project(0, mapDepth - 1);
    path([farLeft, farRight, nearRight, nearLeft]);
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = floorA;
    ctx.fill();
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    for (let z = 1; z < mapDepth; z += 1) {
      const left = project(1, z);
      const right = project(mapWidth - 2, z);
      drawPixelLine([left, right], z % 2 ? dark : line, z % 2 ? 2 : 3, z % 2 ? 0.14 : 0.12);
      if (z % 2 === 0) drawPixelLine([project(2, z + 0.12), project(mapWidth - 3, z + 0.12)], floorB, 2, 0.16);
    }
    for (let x = 1; x < mapWidth; x += 2) {
      const near = project(x, mapDepth - 1);
      const far = project(x, 1);
      drawPixelLine([near, far], dark, 2, 0.12);
    }
    for (let z = 3; z < mapDepth - 1; z += 1) {
      for (let x = 2; x < mapWidth - 2; x += 2) {
        if (map[z]?.[x] !== "." || (x * 11 + z * 7) % 5 !== 0) continue;
        const point = project(x + 0.3, z + 0.16);
        const size = dungeonPixel(0.74 + (z % 3) * 0.1);
        fillPixelRect(point.x, point.y - size, size * ((x + z) % 3 === 0 ? 3 : 2), size, (x + z) % 2 ? chip : line, 0.12);
      }
    }

    const runner = [
      project(9, 5),
      project(18, 5),
      project(20, mapDepth - 2),
      project(7, mapDepth - 2),
    ];
    path(runner);
    ctx.strokeStyle = css("--mage-carpet-line", "#7a2b33");
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let z = 6; z < mapDepth - 1; z += 1) {
      const left = project(8.2, z);
      const right = project(18.8, z);
      drawPixelLine([left, right], css("--mage-carpet-line", "#7a2b33"), 2, 0.12 + Math.sin(now * 0.001 + z) * 0.02);
      if (z % 3 === 0) {
        const center = project(13.5, z);
        fillPixelRect(center.x - dungeonPixel(2), center.y - dungeonPixel(), dungeonPixel(4), dungeonPixel(), css("--mage-px-gold", "#c48a3d"), 0.1);
      }
    }
  }

  function drawFloorObstacle(x, z) {
    if (z <= 1 || z >= mapDepth - 1) return;
    const depth = clamp(z / (mapDepth - 1), 0, 1);
    const point = project(x, z, 0);
    const width = state.tileW * (0.34 + depth * 0.34);
    const height = state.tileH * (0.62 + depth * 0.42);
    drawPixelFrame(point.x - width / 2, point.y - height, width, height, {
      fill: css("--mage-stone-mid", "#263b2f"),
      outline: css("--mage-stone-deep", "#06100e"),
      highlight: css("--mage-stone-lit", "#5a6c4f"),
      shadow: css("--mage-stone-deep", "#06100e"),
      alpha: 0.88,
      highlightAlpha: 0.34,
      shadowAlpha: 0.76,
    });
    fillPixelRect(point.x - width * 0.28, point.y - height * 0.68, width * 0.32, 2, css("--mage-stone-chip", "#91a07d"), 0.36);
  }

  function drawImageCover(image, offsetX = 0, offsetY = 0, pad = 0) {
    const scale = Math.max((state.width + pad * 2) / image.naturalWidth, (state.height + pad * 2) / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const x = (state.width - drawWidth) / 2 + offsetX;
    const y = (state.height - drawHeight) / 2 + offsetY;
    ctx.drawImage(image, Math.round(x), Math.round(y), Math.round(drawWidth), Math.round(drawHeight));
  }

  function drawRoomPlate(now) {
    if (!roomPlateReady) {
      drawBackdrop(now);
      return;
    }

    const parallaxX = (state.x / (mapWidth - 1) - 0.5) * -18;
    const parallaxY = (state.z / (mapDepth - 1) - 0.62) * -10 + Math.sin(now * 0.0008) * 1.5;
    drawImageCover(roomPlate, parallaxX, parallaxY, 26);

    const candlePulse = 0.36 + Math.sin(now * 0.006) * 0.06;
    drawBlockGlow(state.width * 0.31 + parallaxX * 0.32, state.height * 0.45 + parallaxY * 0.2, state.width * 0.12, state.height * 0.14, css("--mage-px-fire-core", "#ffd36a"), candlePulse * 0.04);
    drawBlockGlow(state.width * 0.69 + parallaxX * 0.32, state.height * 0.45 + parallaxY * 0.2, state.width * 0.12, state.height * 0.14, css("--mage-px-fire-core", "#ffd36a"), candlePulse * 0.04);
    fillPixelRect(0, state.height * 0.92, state.width, state.height * 0.08, css("--mage-px-void", "#010107"), 0.18);
  }

  function drawBackdrop(now) {
    const w = state.width;
    const h = state.height;
    const wallTop = css("--mage-wall-top", "#263b2f");
    const wallDark = css("--mage-wall-right", "#07100d");
    ctx.save();
    drawMasonry(0, 0, w, h * 0.64, now);
    drawSteppedArch(w * 0.18, h * 0.02, w * 0.34, h * 0.58, Math.max(10, state.tileW * 0.16), wallTop, wallDark);
    drawSteppedArch(w * 0.5, h * 0.01, w * 0.38, h * 0.64, Math.max(12, state.tileW * 0.18), wallTop, wallDark);
    drawSteppedArch(w * 0.82, h * 0.02, w * 0.34, h * 0.58, Math.max(10, state.tileW * 0.16), wallTop, wallDark);
    drawGothicWindow(w * 0.5, h * 0.12, w * 0.12, h * 0.44, now);
    drawBookcase(w * 0.035, h * 0.38, w * 0.18, h * 0.32, 0, now);
    drawBookcase(w * 0.785, h * 0.38, w * 0.18, h * 0.32, 1, now);
    drawStoneColumn(w * 0.31, h * 0.71, w * 0.075, h * 0.38, 0.4, now);
    drawStoneColumn(w * 0.69, h * 0.71, w * 0.075, h * 0.38, 1.9, now);
    drawCentralTable(w * 0.5, h * 0.675, w * 0.24, h * 0.065, now);
    fillPixelRect(0, 0, w, h * 0.045, css("--mage-px-void", "#010107"), 0.9);
    fillPixelRect(0, h * 0.63, w, 4, css("--mage-wall-line", "#4e5e70"), 0.28);
    drawBlockGlow(w * 0.31, h * 0.38, w * 0.22, h * 0.28, css("--mage-px-fire-core", "#ffd36a"), 0.08);
    drawBlockGlow(w * 0.69, h * 0.38, w * 0.22, h * 0.28, css("--mage-px-fire-core", "#ffd36a"), 0.08);
    ctx.restore();
  }

  function colorMixFallback(color, fallback) {
    return color && !color.startsWith("color-mix") ? color : fallback;
  }

  function drawFixture(fixture, now) {
    if (fixture.type === "bookStack") {
      drawBookStack(fixture, now);
      return;
    }
    if (fixture.type === "cauldron") {
      drawCauldron(fixture, now);
      return;
    }
    if (fixture.type === "crystal") {
      drawCrystal(fixture, now);
      return;
    }
    drawCandle(fixture, now);
  }

  function drawBookStack(fixture, now) {
    const base = project(fixture.x, fixture.z, 8);
    const depth = clamp(fixture.z / (mapDepth - 1), 0, 1);
    const scale = 0.65 + depth * 0.7;
    const outline = css("--mage-px-outline", "#05050b");
    const colors = [
      css("--mage-px-staff-mid", "#684425"),
      css("--mage-px-fire-shadow", "#8a2414"),
      css("--mage-px-water-shadow", "#173f5f"),
      css("--mage-px-gold", "#c48a3d"),
    ];
    for (let i = 0; i < 5; i += 1) {
      const w = (34 - i * 3 + (i % 2) * 5) * scale;
      const h = (5 + (i % 2) * 2) * scale;
      const x = base.x - w / 2 + Math.sin(i + fixture.phase) * 3 * scale;
      const y = base.y - i * h * 1.15;
      fillPixelRect(x - 1, y - 1, w + 2, h + 2, outline, 0.86);
      fillPixelRect(x, y, w, h, colors[i % colors.length], 0.92);
      fillPixelRect(x + 4 * scale, y + 2 * scale, w - 8 * scale, 2 * scale, css("--mage-px-gold-light", "#e0b56b"), 0.42 + Math.sin(now * 0.002 + i) * 0.04);
    }
  }

  function drawCandle(fixture, now) {
    const base = project(fixture.x, fixture.z, 10);
    const flame = project(fixture.x, fixture.z, 28 + Math.sin(now * 0.006 + fixture.phase) * 3);
    const stem = blockSize(0.9);
    ctx.save();
    ctx.fillStyle = css("--mage-px-staff-dark", "#251811");
    ctx.fillRect(base.x - stem * 1.4, base.y - stem * 2.2, stem * 2.8, stem * 3.4);
    ctx.fillStyle = css("--mage-px-beard", "#cbd4ee");
    ctx.fillRect(base.x - stem, base.y - stem * 2, stem * 2, stem * 3);
    ctx.fillStyle = css("--mage-px-fire-shadow", "#8a2414");
    ctx.fillRect(flame.x - stem * 1.4, flame.y - stem * 1.4, stem * 2.8, stem * 2.8);
    ctx.fillStyle = css("--mage-px-fire-core", "#ffd36a");
    ctx.fillRect(flame.x, flame.y - stem * 1.2, stem, stem * 1.2);
    ctx.restore();
  }

  function drawCrystal(fixture, now) {
    const pulse = 0.58 + Math.sin(now * 0.0024 + fixture.phase) * 0.22;
    const base = project(fixture.x, fixture.z, 12);
    const core = project(fixture.x, fixture.z, 34);
    const size = blockSize(1.15);
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = css("--mage-px-electric-shadow", "#4d2a83");
    ctx.fillRect(base.x - size * 2.5, base.y - size * 1.2, size * 5, size * 2.4);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = css("--mage-px-electric", "#68d9ff");
    ctx.fillRect(core.x - size, core.y - size * 3, size * 2, size * 4);
    ctx.fillStyle = css("--mage-px-electric-core", "#f5ef76");
    ctx.fillRect(core.x, core.y - size * 2, size, size);
    ctx.restore();
  }

  function drawCauldron(fixture, now) {
    const base = project(fixture.x, fixture.z, 12);
    const lip = project(fixture.x, fixture.z, 26);
    const size = blockSize(1.25);
    const glow = 0.42 + Math.sin(now * 0.002 + fixture.phase) * 0.13;
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.fillStyle = css("--mage-px-earth-core", "#c7b36b");
    ctx.fillRect(base.x - size * 5, base.y - size * 2, size * 10, size * 4);
    ctx.globalAlpha = 1;
    ctx.fillStyle = css("--mage-px-void", "#010107");
    ctx.fillRect(base.x - size * 4, base.y - size * 3, size * 8, size * 4);
    ctx.fillStyle = css("--mage-px-earth", "#718143");
    ctx.fillRect(lip.x - size * 3, lip.y - size, size * 6, size * 2);
    for (let i = 0; i < 5; i += 1) {
      const side = (i - 2) * 0.12;
      const lift = 35 + Math.sin(now * 0.003 + fixture.phase + i) * 11 + i * 4;
      const bubble = project(fixture.x + side, fixture.z + side * 0.4, lift);
      drawBlock(bubble, blockSize(0.75 + (i % 2) * 0.35), i % 2 ? css("--mage-px-earth-core", "#c7b36b") : css("--mage-px-earth", "#718143"), 0.72);
    }
    ctx.restore();
  }

  function drawAmbientMotes(now) {
    const colors = [
      css("--mage-px-earth-core", "#c7b36b"),
      css("--mage-px-water-core", "#b9f3ff"),
      css("--mage-px-electric", "#68d9ff"),
      css("--mage-px-fire-core", "#ffd36a"),
      css("--mage-px-gold", "#c48a3d"),
    ];
    ambientMotes.forEach((mote) => {
      const driftX = Math.sin(now * 0.0009 + mote.phase) * 0.08;
      const driftZ = Math.cos(now * 0.0011 + mote.phase * 1.4) * 0.08;
      const lift = mote.lift + Math.sin(now * 0.0015 + mote.phase) * 10;
      const point = project(mote.x + driftX, mote.z + driftZ, lift);
      const alpha = 0.16 + (Math.sin(now * 0.0022 + mote.phase) + 1) * 0.18;
      drawBlock(point, blockSize(mote.scale), colors[mote.element], alpha);
    });
  }

  function drawDungeon(now) {
    const w = state.width;
    const h = state.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = css("--mage-dungeon-bg", "#080b0f");
    ctx.fillRect(0, 0, w, h);

    drawRoomPlate(now);
    drawSpatialFloor(now);
    drawAmbientMotes(now);
    drawSpell(now);
  }

  function drawSpell(now) {
    if (!state.activeSpell) return;
    const age = now - state.activeSpell.started;
    const progress = clamp(age / state.activeSpell.duration, 0, 1);
    if (progress >= 1) {
      state.activeSpell = null;
      actor.classList.remove("is-casting");
      delete actor.dataset.mageCasting;
      return;
    }
    if (state.activeSpell.mode === "sprite") return;

    const [dx, dz] = castDirection[state.activeSpell.facing] || castDirection.south;
    const vars = elementVars[state.activeSpell.element] || elementVars.fire;
    const colors = vars.map((name) => css(name, "#bd5cff"));

    const length = 0.4 + progress * 3.2;
    const start = { x: state.activeSpell.x, z: state.activeSpell.z };
    const core = { x: start.x + dx * length, z: start.z + dz * length };
    const startPoint = project(start.x, start.z, 78);
    const corePoint = project(core.x, core.z, 64 - progress * 24);
    const block = Math.max(4, Math.round(state.tileW / 13));

    ctx.save();
    ctx.globalCompositeOperation = state.activeSpell.element === "earth" ? "source-over" : "lighter";
    ctx.strokeStyle = colors[1];
    ctx.lineWidth = block;
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(corePoint.x, corePoint.y);
    ctx.stroke();

    ctx.strokeStyle = colors[2];
    ctx.lineWidth = Math.max(2, Math.round(block * 0.45));
    ctx.stroke();

    const burst = Math.round(5 + progress * 12);
    for (let i = 0; i < burst; i += 1) {
      const angle = (i / burst) * Math.PI * 2 + progress * 4;
      const radius = block * (1.2 + progress * 3.2) * (i % 3 === 0 ? 1.2 : 0.7);
      const x = Math.round(corePoint.x + Math.cos(angle) * radius);
      const y = Math.round(corePoint.y + Math.sin(angle) * radius * 0.58);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, y, block, block);
    }
    ctx.restore();
  }

  function drawFrame(now) {
    drawDungeon(now);
    updateActorPosition();
  }

  function cast(element = state.spell) {
    state.spell = element;
    state.level = clamp(Number(levelInput?.value || state.level), 1, 10);
    const nextState = `storyboard-${state.spell}-${state.facing}`;
    const hasStoryboardState = window.DitherMageSprite?.states?.includes(nextState);
    const started = performance.now();
    const duration = 1000;
    state.castUntil = started + duration;
    state.activeSpell = {
      mode: hasStoryboardState ? "sprite" : "canvas",
      element: state.spell,
      facing: state.facing,
      x: state.x,
      z: state.z,
      started,
      duration,
      level: state.level,
      seed: started * 0.001 + state.level,
    };
    actor.classList.add("is-casting");
    actor.dataset.mageCasting = state.spell;
    setSpriteState(hasStoryboardState ? nextState : directionToIdleState[state.facing] || "idle-down", true);
    updateSpellControls();
  }

  function stopDemoCycle() {
    if (!demoTimer) return;
    window.clearTimeout(demoTimer);
    demoTimer = 0;
  }

  function runDemoCycle() {
    stopDemoCycle();
    keys.clear();
    state.manualState = "";
    const sequence = storyboardSpells.flatMap((spell) =>
      storyboardDirections.map((direction) => ({
        spell: spell.id,
        facing: direction.id,
      }))
    );
    let index = 0;

    const step = () => {
      const item = sequence[index];
      if (!item) {
        demoTimer = 0;
        return;
      }
      state.facing = item.facing;
      cast(item.spell);
      updateActorPosition();
      index += 1;
      demoTimer = index < sequence.length ? window.setTimeout(step, 1100) : 0;
    };

    step();
  }

  function updateSpellControls() {
    spellButtons.forEach((button) => {
      const active = button.dataset.mageSpell === state.spell;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (levelOutput) {
      levelOutput.value = String(state.level);
      levelOutput.textContent = String(state.level);
    }
    if (spellReadout) spellReadout.textContent = `spell ${state.spell} / level ${state.level}`;
  }

  function buildSpellStoryboard() {
    if (!storyboardOutput) return;
    const frameNumbers = Array.from({ length: 10 }, (_, index) => String(index + 1).padStart(2, "0"));
    storyboardOutput.innerHTML = storyboardSpells
      .map((spell) => {
        const rows = storyboardDirections
          .map((direction) => {
            const cells = frameNumbers
              .map((frameNumber) => {
                const stateName = `storyboard-${spell.id}-${direction.id}-f${frameNumber}`;
                return `
                  <figure class="mage-story-frame">
                    <span class="mage-story-frame-sprite mage-vector-sprite" data-mage-vector data-mage-static data-mage-wide data-mage-state="${stateName}" aria-hidden="true"></span>
                    <figcaption>f${frameNumber}</figcaption>
                  </figure>
                `;
              })
              .join("");
            return `
              <div class="mage-story-row" data-mage-story-row="${spell.id}-${direction.id}">
                <div class="mage-story-row-label">
                  <span>${direction.label}</span>
                  <small>${spell.id}-${direction.id}</small>
                </div>
                <div class="mage-story-frames">${cells}</div>
              </div>
            `;
          })
          .join("");

        return `
          <article class="mage-story-group mage-story-group-${spell.id}">
            <header class="mage-story-group-head">
              <span class="token-name">${spell.id}</span>
              <strong>${spell.label} cast</strong>
            </header>
            ${rows}
          </article>
        `;
      })
      .join("");

    window.DitherMageSprite?.hydrate?.(storyboardOutput);
  }

  function applySeed(color) {
    body.style.setProperty("--mage-seed", color);
    if (seedInput && seedInput.value !== color) seedInput.value = color;
    seedButtons.forEach((button) => {
      const active = button.dataset.mageSeed?.toLowerCase() === color.toLowerCase();
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function updateMovement(now) {
    let vx = 0;
    let vz = 0;
    let nextFacing = state.facing;
    let walkSuffix = "";

    for (const code of keys) {
      const vector = walkVectorByKey[code];
      if (!vector) continue;
      vx += vector[0];
      vz += vector[1];
      nextFacing = vector[2];
      walkSuffix = vector[3];
    }

    const moving = vx !== 0 || vz !== 0;
    if (moving) {
      const length = Math.hypot(vx, vz) || 1;
      const dt = Math.min(0.04, Math.max(0, (now - state.lastTime) / 1000 || 0));
      const speed = 2.3;
      const nx = state.x + (vx / length) * speed * dt;
      const nz = state.z + (vz / length) * speed * dt;
      state.facing = nextFacing;
      if (!blocked(nx, state.z)) state.x = clamp(nx, 1, map[0].length - 2);
      if (!blocked(state.x, nz)) state.z = clamp(nz, 1, map.length - 2);
    }

    if (now > state.castUntil) {
      if (moving) setSpriteState(directionToWalkState[state.facing] || `walk-${walkSuffix}`);
      else setSpriteState(state.manualState || directionToIdleState[state.facing] || "idle-down");
    }
  }

  function loop(now) {
    updateMovement(now);
    drawFrame(now);
    state.lastTime = now;
    requestAnimationFrame(loop);
  }

  stateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      stopDemoCycle();
      const next = button.dataset.mageLabState || "idle-down";
      state.manualState = next.startsWith("walk-") || next.startsWith("idle-") ? next : "";
      if (next === "walk-up" || next === "idle-up") state.facing = "north";
      if (next === "walk-down" || next === "idle-down") state.facing = "south";
      if (next === "walk-right" || next === "idle-right") state.facing = "east";
      if (next === "walk-left" || next === "idle-left") state.facing = "west";
      setSpriteState(next);
    });
  });

  spellButtons.forEach((button) => {
    button.addEventListener("click", () => {
      stopDemoCycle();
      state.spell = button.dataset.mageSpell || "fire";
      updateSpellControls();
      cast(state.spell);
    });
  });

  seedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.mageSeed) applySeed(button.dataset.mageSeed);
    });
  });

  seedInput?.addEventListener("input", () => applySeed(seedInput.value));
  levelInput?.addEventListener("input", () => {
    state.level = clamp(Number(levelInput.value), 1, 10);
    updateSpellControls();
  });
  castButton?.addEventListener("click", () => {
    stopDemoCycle();
    cast();
  });
  demoButton?.addEventListener("click", runDemoCycle);

  window.addEventListener("keydown", (event) => {
    if (isFormField(event.target)) return;
    if (walkVectorByKey[event.code]) {
      event.preventDefault();
      stopDemoCycle();
      keys.add(event.code);
    }
    if (elementByKey[event.code]) {
      event.preventDefault();
      stopDemoCycle();
      cast(elementByKey[event.code]);
    }
    if (event.code === "Space") {
      event.preventDefault();
      stopDemoCycle();
      cast();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });
  window.addEventListener("resize", resizeCanvas);

  applySeed(seedInput?.value || "#8e49ca");
  buildSpellStoryboard();
  updateSpellControls();
  resizeCanvas();
  requestAnimationFrame(loop);
})();
