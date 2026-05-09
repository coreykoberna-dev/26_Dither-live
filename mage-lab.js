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
  const stateButtons = [...lab.querySelectorAll("[data-mage-lab-state]")];
  const spellButtons = [...lab.querySelectorAll("[data-mage-spell]")];
  const seedButtons = [...lab.querySelectorAll("[data-mage-seed]")];

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

  const map = [
    "#####################",
    "#...................#",
    "#..###.........###..#",
    "#...................#",
    "#...................#",
    "#...#...........#...#",
    "#...................#",
    "#.........#.........#",
    "#...................#",
    "#....##.......##....#",
    "#...................#",
    "#...#...........#...#",
    "#...................#",
    "#..###.........###..#",
    "#.........#.........#",
    "#...................#",
    "#####################",
  ];
  const mapWidth = map[0].length;
  const mapDepth = map.length;
  const dungeonFixtures = [
    { type: "candle", x: 2.4, z: 2.4, phase: 0.2 },
    { type: "candle", x: 18.2, z: 2.7, phase: 1.9 },
    { type: "crystal", x: 4.3, z: 6.8, phase: 2.8 },
    { type: "cauldron", x: 10, z: 8, phase: 0.7 },
    { type: "crystal", x: 16.5, z: 12.8, phase: 4.1 },
    { type: "candle", x: 3.2, z: 14.3, phase: 3.4 },
    { type: "candle", x: 18, z: 14.1, phase: 5.1 },
  ];

  const state = {
    x: 10,
    z: 10,
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
    const cameraX = (mapWidth - 1) / 2;
    const cameraZ = (mapDepth - 1) / 2 + 0.65;
    const dx = x - cameraX;
    const dz = z - cameraZ;
    return {
      x: Math.round(state.width / 2 + (dx - dz) * state.tileW * 0.5),
      y: Math.round(state.height * 0.48 + (dx + dz) * state.tileH * 0.5 - lift),
    };
  }

  function setSpriteState(nextState) {
    if (!nextState || state.spriteState === nextState) return;
    state.spriteState = nextState;
    actorSprite.dataset.mageState = nextState;
    window.DitherMageSprite?.setRootState?.(actorSprite, nextState);
    if (stateReadout) stateReadout.textContent = nextState;
    stateButtons.forEach((button) => {
      const active = button.dataset.mageLabState === nextState || (nextState.startsWith("cast-") && button.dataset.mageLabState === "header");
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function updateActorPosition() {
    const point = project(state.x, state.z, 0);
    const depth = clamp((state.z + state.x) / (mapWidth + mapDepth), 0, 1);
    const scale = 1 + depth * 0.18;
    actor.style.left = `${point.x}px`;
    actor.style.top = `${point.y + 14}px`;
    actor.style.transform = `translate(-50%, -88%) scale(${scale.toFixed(3)})`;
    actor.style.zIndex = String(100 + Math.round((state.x + state.z) * 8));
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
    const widthFit = state.width / (mapWidth + 2.8);
    const heightFit = state.height / ((mapWidth + mapDepth) * 0.36);
    state.tileW = clamp(Math.min(widthFit, heightFit), 30, 86);
    state.tileH = Math.round(state.tileW * 0.48);
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
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    ctx.restore();
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

  function drawBackdrop(now) {
    const w = state.width;
    const h = state.height;
    const wall = css("--mage-wall-left", "#172330");
    const wallDark = css("--mage-wall-right", "#0d131b");
    const wallTop = css("--mage-wall-top", "#263647");
    const line = css("--mage-wall-line", "#4e5e70");
    ctx.save();
    const roomGlow = ctx.createRadialGradient(w * 0.5, h * 0.47, h * 0.02, w * 0.5, h * 0.45, h * 0.58);
    roomGlow.addColorStop(0, "rgba(147, 190, 86, 0.16)");
    roomGlow.addColorStop(0.4, "rgba(44, 158, 203, 0.08)");
    roomGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = roomGlow;
    ctx.fillRect(0, 0, w, h);
    fillPixelRect(w * 0.08, h * 0.07, w * 0.84, h * 0.58, wall, 0.62);
    drawSteppedArch(w * 0.5, h * 0.06, w * 0.76, h * 0.66, Math.max(10, state.tileW * 0.18), wallTop, wallDark);
    for (let row = 0; row < 12; row += 1) {
      const y = h * 0.1 + row * h * 0.043;
      const offset = row % 2 ? state.tileW * 0.22 : 0;
      for (let col = 0; col < 11; col += 1) {
        const x = w * 0.18 + col * w * 0.066 + offset;
        const alpha = 0.13 + ((row + col) % 3) * 0.035;
        fillPixelRect(x, y, w * 0.042, 2, line, alpha);
      }
    }
    drawStainedWindow(w * 0.16, h * 0.22, w * 0.055, h * 0.22, 0.4, now);
    drawStainedWindow(w * 0.79, h * 0.22, w * 0.055, h * 0.22, 2.1, now);
    drawShelf(w * 0.1, h * 0.56, w * 0.18, now);
    drawShelf(w * 0.72, h * 0.53, w * 0.17, now);
    drawHangingCandles(now);
    drawVines(now);
    drawCauldronBeam(now);
    ctx.restore();
  }

  function colorMixFallback(color, fallback) {
    return color && !color.startsWith("color-mix") ? color : fallback;
  }

  function drawFixture(fixture, now) {
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

  function drawCandle(fixture, now) {
    const base = project(fixture.x, fixture.z, 10);
    const flame = project(fixture.x, fixture.z, 28 + Math.sin(now * 0.006 + fixture.phase) * 3);
    const stem = blockSize(0.9);
    ctx.save();
    ctx.fillStyle = css("--mage-px-staff-dark", "#251811");
    ctx.fillRect(base.x - stem, base.y - stem * 2, stem * 2, stem * 3);
    ctx.fillStyle = css("--mage-px-fire-shadow", "#8a2414");
    ctx.fillRect(flame.x - stem, flame.y - stem, stem * 2, stem * 2);
    ctx.fillStyle = css("--mage-px-fire-core", "#ffd36a");
    ctx.fillRect(flame.x, flame.y - stem, stem, stem);
    ctx.restore();
  }

  function drawCrystal(fixture, now) {
    const pulse = 0.58 + Math.sin(now * 0.0024 + fixture.phase) * 0.22;
    const base = project(fixture.x, fixture.z, 12);
    const core = project(fixture.x, fixture.z, 34);
    const size = blockSize(1.15);
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = css("--mage-px-electric-shadow", "#4d2a83");
    ctx.fillRect(base.x - size * 2, base.y - size, size * 4, size * 2);
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

    const glow = ctx.createLinearGradient(0, h * 0.12, 0, h);
    glow.addColorStop(0, css("--mage-dungeon-fog", "rgba(44, 158, 203, 0.18)"));
    glow.addColorStop(0.64, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    drawBackdrop(now);

    const floorA = css("--mage-floor-a", "#141d26");
    const floorB = css("--mage-floor-b", "#1e2a36");
    const floorLine = css("--mage-floor-line", "#324355");
    for (let z = 0; z < map.length; z += 1) {
      for (let x = 0; x < map[z].length; x += 1) {
        if (map[z][x] === "#") continue;
        drawDiamond(x, z, (x + z) % 2 ? floorA : floorB, floorLine);
        if ((x * 7 + z * 3) % 11 === 0) {
          const pulse = 0.42 + Math.sin(now * 0.002 + x * 0.7 + z * 0.35) * 0.22;
          drawRuneLine(x, z, css("--mage-floor-rune", "rgba(241, 213, 120, 0.26)"), pulse);
        }
      }
    }

    dungeonFixtures.forEach((fixture) => drawFixture(fixture, now));

    const walls = [];
    for (let z = 0; z < map.length; z += 1) {
      for (let x = 0; x < map[z].length; x += 1) {
        if (map[z][x] === "#") walls.push([x, z]);
      }
    }
    walls.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    walls.forEach(([x, z]) => drawWall(x, z));

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

    const vars = elementVars[state.activeSpell.element] || elementVars.fire;
    const colors = vars.map((name) => css(name, "#bd5cff"));
    ctx.save();
    if (state.activeSpell.element !== "earth") ctx.globalCompositeOperation = "lighter";
    if (state.activeSpell.element === "fire") drawFireSpell(state.activeSpell, progress, colors);
    if (state.activeSpell.element === "earth") drawEarthSpell(state.activeSpell, progress, colors);
    if (state.activeSpell.element === "electric") drawElectricSpell(state.activeSpell, progress, colors);
    if (state.activeSpell.element === "water") drawWaterSpell(state.activeSpell, progress, colors);
    ctx.restore();
  }

  function spellPoint(spell, along, side = 0, lift = 92) {
    const [dx, dz] = castDirection[spell.facing] || castDirection.south;
    const nx = -dz;
    const nz = dx;
    return project(spell.x + dx * along + nx * side, spell.z + dz * along + nz * side, lift);
  }

  function spellReach(spell, progress, base = 3.1) {
    const levelBoost = spell.level * 0.075;
    return 0.42 + progress * (base + levelBoost);
  }

  function drawSpellBeam(spell, progress, colors, options = {}) {
    const reach = spellReach(spell, progress, options.reach || 3.4);
    const segments = options.segments || 9;
    const liftStart = options.liftStart ?? 104;
    const liftEnd = options.liftEnd ?? 62;
    const width = blockSize(options.width || 1.18);
    const jitter = options.jitter || 0.12;
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const side = Math.sin(spell.seed + i * 1.73 + progress * (options.speed || 9)) * jitter * (0.3 + t);
      const lift = liftStart + (liftEnd - liftStart) * t + Math.sin(progress * 8 + i) * (options.liftJitter || 3);
      points.push(spellPoint(spell, 0.12 + t * reach, side, lift));
    }
    drawPixelLine(points, colors[0], width * 2.35, options.shadowAlpha || 0.52);
    drawPixelLine(points, colors[1], width * 1.34, options.midAlpha || 0.86);
    drawPixelLine(points, colors[2], Math.max(2, Math.round(width * 0.52)), options.coreAlpha || 0.96);
    return { points, tip: points[points.length - 1], reach };
  }

  function drawImpactBurst(point, colors, progress, size = 1) {
    const block = blockSize(size);
    const rays = 10;
    for (let i = 0; i < rays; i += 1) {
      const angle = (i / rays) * Math.PI * 2 + progress * 2.4;
      const length = block * (2.4 + (i % 3) + progress * 3.2);
      const end = {
        x: point.x + Math.cos(angle) * length,
        y: point.y + Math.sin(angle) * length * 0.64,
      };
      drawPixelLine([point, end], colors[i % 2 ? 1 : 2], Math.max(2, block * 0.42), 0.72);
      if (i % 2 === 0) drawBlock(end, block * 0.9, colors[0], 0.76);
    }
    drawBlock(point, block * 2.3, colors[1], 0.68);
    drawBlock(point, block * 1.1, colors[2], 0.95);
  }

  function drawFireSpell(spell, progress, colors) {
    const beam = drawSpellBeam(spell, progress, colors, {
      reach: 3.9,
      liftStart: 106,
      liftEnd: 70,
      width: 1.34,
      jitter: 0.18,
      speed: 16,
    });
    const block = blockSize(1.08);
    const count = Math.round(22 + spell.level * 2.2);
    for (let i = 0; i < count; i += 1) {
      const t = (i + 1) / count;
      if (t > progress + 0.46) continue;
      const taper = 1 - t * 0.72;
      const wave = Math.sin(spell.seed + i * 1.9 + progress * 20);
      const side = wave * (0.1 + taper * 0.48);
      const lift = 92 - t * 38 + Math.sin(progress * 13 + i) * 9;
      const point = spellPoint(spell, 0.26 + t * beam.reach, side, lift);
      const size = Math.max(3, Math.round(block * (0.95 + taper * 2.1)));
      const color = i % 4 === 0 ? colors[2] : i % 3 === 0 ? colors[0] : colors[1];
      drawBlock(point, size, color, 0.78 + taper * 0.18);
    }
    drawImpactBurst(beam.tip, colors, progress, 1.28);
    for (let i = 0; i < 9; i += 1) {
      const ember = spellPoint(spell, 0.9 + progress * beam.reach + i * 0.08, Math.sin(i + progress * 8) * 0.75, 74 + i * 5);
      drawBlock(ember, blockSize(0.62), i % 2 ? colors[2] : colors[1], 0.54);
    }
  }

  function drawEarthSpell(spell, progress, colors) {
    const reach = spellReach(spell, progress, 3.7);
    const block = blockSize(1.08);
    const slabs = Math.round(9 + spell.level);
    const hand = spellPoint(spell, 0.22, 0, 96);
    drawBlock(hand, blockSize(1.7), colors[2], 0.58);
    drawBlock(hand, blockSize(0.86), colors[1], 0.82);
    const crack = [];
    for (let i = 0; i <= slabs; i += 1) {
      const t = i / slabs;
      if (t > progress + 0.36) continue;
      const side = Math.sin(i * 2.1 + spell.seed) * (0.08 + t * 0.28);
      crack.push(spellPoint(spell, 0.35 + t * reach, side, 8));
    }
    drawPixelLine(crack, colors[0], Math.max(2, Math.round(block * 1.02)), 0.72);
    drawPixelLine(crack, colors[2], Math.max(2, Math.round(block * 0.42)), 0.56);
    for (let i = 0; i < slabs; i += 1) {
      const t = (i + 0.5) / slabs;
      const local = clamp((progress - t * 0.1) * 2.7, 0, 1);
      if (local <= 0) continue;
      const rise = Math.sin(local * Math.PI);
      const side = (i % 2 ? -1 : 1) * (0.1 + (i % 3) * 0.07);
      const point = spellPoint(spell, 0.45 + t * reach, side, 15 + rise * 38);
      const width = Math.round(block * (1.8 + (i % 3) * 0.48));
      const height = Math.round(block * (1.5 + rise * 3.8));
      ctx.save();
      ctx.globalAlpha = 0.86;
      ctx.fillStyle = i % 3 === 0 ? colors[2] : colors[1];
      ctx.fillRect(point.x - Math.round(width / 2), point.y - height, width, height);
      ctx.fillStyle = colors[0];
      ctx.fillRect(point.x - Math.round(width / 2), point.y, width, Math.max(2, Math.round(block * 0.55)));
      ctx.restore();
      if (i % 3 === 0) {
        const leaf = spellPoint(spell, 0.45 + t * reach, side + 0.22, 36 + rise * 30);
        drawBlock(leaf, blockSize(0.8), colors[2], 0.64);
      }
    }
    const impact = spellPoint(spell, reach + 0.4, Math.sin(progress * 6) * 0.08, 46);
    drawImpactBurst(impact, colors, progress, 1.05);
  }

  function drawElectricSpell(spell, progress, colors) {
    const reach = spellReach(spell, progress, 4.25);
    const block = blockSize(0.92);
    const segments = 11;
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const snap = i % 2 ? -1 : 1;
      const side = i === 0 ? 0 : snap * (0.14 + (i % 4) * 0.08);
      const lift = 112 - t * 45 + Math.sin(progress * 11 + i) * 5;
      points.push(spellPoint(spell, 0.12 + t * reach, side, lift));
    }
    drawPixelLine(points, colors[0], block * 3.1, 0.62);
    drawPixelLine(points, colors[1], block * 1.65, 0.96);
    drawPixelLine(points, colors[2], Math.max(2, Math.round(block * 0.7)), 0.98);
    points.forEach((point, index) => {
      if (index % 2 === 0) drawBlock(point, blockSize(1.1), colors[2], 0.98);
    });
    for (let i = 3; i < points.length - 1; i += 2) {
      const side = i % 4 === 1 ? 0.58 : -0.58;
      const tip = spellPoint(spell, 0.12 + (i / segments) * reach, side, 96 - (i / segments) * 34);
      drawPixelLine([points[i], tip], colors[1], Math.max(2, Math.round(block * 0.9)), 0.74);
      drawBlock(tip, blockSize(0.68), colors[2], 0.86);
    }
    drawImpactBurst(points[points.length - 1], colors, progress, 1.25);
  }

  function drawWaterSpell(spell, progress, colors) {
    const beam = drawSpellBeam(spell, progress, colors, {
      reach: 3.85,
      liftStart: 98,
      liftEnd: 58,
      width: 1.08,
      jitter: 0.24,
      speed: 8,
      shadowAlpha: 0.42,
      midAlpha: 0.75,
    });
    const block = blockSize(1);
    const count = Math.round(24 + spell.level * 1.4);
    const ribbon = [];
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      if (t > progress + 0.42) continue;
      const side = Math.sin(t * Math.PI * 2.4 + progress * 6.4 + spell.seed) * (0.16 + t * 0.42);
      const lift = 82 + Math.sin(t * Math.PI) * 24 - t * 34;
      const point = spellPoint(spell, 0.22 + t * beam.reach, side, lift);
      ribbon.push(point);
      drawBlock(point, block * (i % 3 === 0 ? 1.7 : 1.05), i % 4 === 0 ? colors[2] : colors[1], 0.74 + (1 - t) * 0.12);
    }
    drawPixelLine(ribbon, colors[0], Math.max(2, Math.round(block * 1.08)), 0.42);
    drawImpactBurst(beam.tip, colors, progress, 1.08);
    for (let i = 0; i < 12; i += 1) {
      const t = clamp(progress - i * 0.08, 0, 1);
      if (t <= 0) continue;
      const side = Math.sin(i * 1.6 + progress * 7) * 0.76;
      const droplet = spellPoint(spell, 0.75 + t * beam.reach, side, 50 + Math.sin(i + progress * 8) * 18);
      drawBlock(droplet, blockSize(0.82), i % 2 ? colors[2] : colors[1], 0.62);
    }
  }

  function drawFrame(now) {
    drawDungeon(now);
    updateActorPosition();
  }

  function cast(element = state.spell) {
    state.spell = element;
    state.level = clamp(Number(levelInput?.value || state.level), 1, 10);
    const level = String(state.level).padStart(2, "0");
    const nextState = `cast-${state.spell}-${state.facing}-l${level}`;
    const started = performance.now();
    state.castUntil = started + 1040;
    state.activeSpell = {
      element: state.spell,
      facing: state.facing,
      x: state.x,
      z: state.z,
      started,
      duration: 1040,
      level: state.level,
      seed: started * 0.001 + state.level,
    };
    actor.classList.add("is-casting");
    actor.dataset.mageCasting = state.spell;
    setSpriteState(directionToIdleState[state.facing] || "idle-down");
    if (stateReadout) stateReadout.textContent = nextState;
    updateSpellControls();
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
  castButton?.addEventListener("click", () => cast());

  window.addEventListener("keydown", (event) => {
    if (isFormField(event.target)) return;
    if (walkVectorByKey[event.code]) {
      event.preventDefault();
      keys.add(event.code);
    }
    if (elementByKey[event.code]) {
      event.preventDefault();
      cast(elementByKey[event.code]);
    }
    if (event.code === "Space") {
      event.preventDefault();
      cast();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });
  window.addEventListener("resize", resizeCanvas);

  applySeed(seedInput?.value || "#8e49ca");
  updateSpellControls();
  resizeCanvas();
  requestAnimationFrame(loop);
})();
