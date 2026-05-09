(function () {
  const data = window.DITHER_MAGE_VECTOR_DATA;
  if (!data) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const width = data.logicalSize.width;
  const height = data.logicalSize.height;
  const motionScale = Math.max(1, width / 48);
  const upperBodyY = Math.round(height * 0.57);
  const lowerBodyY = Math.round(height * 0.68);
  const footPlantY = Math.round(height * 0.82);
  const hemY = Math.round(height * 0.78);
  const transparent = data.transparent;
  const tokenByChar = new Map(data.palette.map((token) => [token.char, token.id]));
  const basePixelCache = new Map();
  const frameMarkupCache = new WeakMap();
  const hoverSpellElements = ["fire", "earth", "water", "electric"];
  const instances = [];
  let animationRequest = 0;
  const directionByBase = {
    south: "south",
    north: "north",
    east: "east",
    west: "west",
  };

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

  function directionNameFromSpec(spec) {
    return directionByBase[spec?.base] || "south";
  }

  function spellOrigin(direction) {
    if (direction === "up") return { x: Math.round(width * 0.5), y: Math.round(height * 0.43) };
    if (direction === "right") return { x: Math.round(width * 0.62), y: Math.round(height * 0.42) };
    if (direction === "left") return { x: Math.round(width * 0.38), y: Math.round(height * 0.42) };
    return { x: Math.round(width * 0.56), y: Math.round(height * 0.45) };
  }

  function castPhase(phase) {
    return Math.max(0, Number(phase) || 0) % 8;
  }

  function castMotion(phase) {
    const stage = castPhase(phase);
    return {
      stage,
      lift: [0, -1, -2, -2, -1, 0, 1, 0][stage],
      thrust: [0, -1, -1, 1, 2, 2, 1, 0][stage],
      release: stage >= 3 && stage <= 6,
    };
  }

  function walkOffset(x, y, token, spec) {
    const phase = spec.phase % 8;
    const center = width / 2;
    const lower = y >= lowerBodyY;
    const hem = y >= hemY;
    const side = x < center ? -1 : 1;
    const bob = [0, -1, -1, 0, 0, 1, 1, 0][phase];
    let dx = 0;
    let dy = y < footPlantY ? bob : 0;

    if (lower) {
      const stride = [1, 1, 0, -1, -1, 0, 0, 1][phase];
      if (spec.direction === "left" || spec.direction === "right") {
        dx += side * stride;
        dy += phase === 2 || phase === 6 ? 1 : 0;
      } else {
        dx += side * -stride;
        dy += phase === 2 || phase === 6 ? 1 : 0;
      }
    }

    if (hem && !isStaffToken(token)) {
      dx += [0, -side, -side, 0, 0, side, side, 0][phase] || 0;
    }

    if (isStaffToken(token) && y > Math.round(height * 0.27)) {
      dy -= bob;
    }

    return { dx, dy };
  }

  function castOffset(x, y, token, spec) {
    const phase = castMotion(spec.phase);
    const lift = spec.kind === "elemental-cast" ? phase.lift : [0, 0, -1, -2, -2, -1, 0, 0][castPhase(spec.phase)] || 0;
    let dx = 0;
    let dy = 0;

    if (y < upperBodyY) dy += lift;
    if (isMagicToken(token) && spec.phase >= 2) dy -= 1;
    if (spec.kind === "cast-burst" && x < width / 2 && y < upperBodyY) dx -= spec.phase > 2 ? 1 : 0;
    if (spec.kind === "elemental-cast") {
      const vector = directionVector(spec.direction);
      const upperBody = y < lowerBodyY;
      const lowerBody = y >= lowerBodyY && y < footPlantY;
      const footPlant = y >= footPlantY;
      const lean = phase.thrust;

      if (upperBody) {
        dx += vector.x * lean;
        dy += vector.y * Math.max(-1, Math.min(1, lean));
      }

      if (lowerBody && !footPlant) {
        dx += vector.x * Math.trunc(lean / 2);
        dy += phase.stage === 4 ? -1 : 0;
      }

      if (isStaffToken(token) && y < upperBodyY) {
        dx += vector.x * (phase.release ? 2 : -1);
        dy += vector.y * (phase.release ? 2 : 0);
      }
      if (isMagicToken(token) && phase.release) {
        dx += vector.x * 2;
        dy += vector.y * 2 - 1;
      }
    }

    return { dx, dy };
  }

  function pixelOffset(pixel, spec) {
    if (spec.kind === "idle") {
      return { dx: 0, dy: spec.phase === 1 && pixel.y < footPlantY ? -1 : 0 };
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

  function spellLevel(value) {
    return Math.max(1, Math.min(10, Number(value) || 1));
  }

  function spellForm(value) {
    return Math.max(1, Math.min(10, Number(value) || 1));
  }

  function addEffectBlock(pixels, x, y, width, height, token) {
    for (let by = 0; by < height; by += 1) {
      for (let bx = 0; bx < width; bx += 1) {
        addEffectPixel(pixels, x + bx, y + by, token);
      }
    }
  }

  function addEffectDiamond(pixels, cx, cy, radius, tokens) {
    for (let y = -radius; y <= radius; y += 1) {
      const span = radius - Math.abs(y);
      for (let x = -span; x <= span; x += 1) {
        const edge = Math.abs(x) === span || Math.abs(y) === radius;
        const core = Math.abs(x) + Math.abs(y) <= Math.max(0, radius - 2);
        addEffectPixel(pixels, cx + x, cy + y, core ? tokens.core : edge ? tokens.shadow : tokens.mid);
      }
    }
  }

  function addEffectRing(pixels, cx, cy, radius, tokens) {
    addEffectLine(pixels, cx - radius, cy, cx, cy - Math.max(1, Math.floor(radius * 0.55)), tokens.mid);
    addEffectLine(pixels, cx, cy - Math.max(1, Math.floor(radius * 0.55)), cx + radius, cy, tokens.core);
    addEffectLine(pixels, cx + radius, cy, cx, cy + Math.max(1, Math.floor(radius * 0.55)), tokens.mid);
    addEffectLine(pixels, cx, cy + Math.max(1, Math.floor(radius * 0.55)), cx - radius, cy, tokens.shadow);
  }

  function addEffectBurst(pixels, cx, cy, radius, tokens) {
    addEffectLine(pixels, cx - radius, cy, cx + radius, cy, tokens.mid);
    addEffectLine(pixels, cx, cy - radius, cx, cy + radius, tokens.core);
    addEffectLine(pixels, cx - Math.floor(radius * 0.7), cy - Math.floor(radius * 0.45), cx + Math.floor(radius * 0.7), cy + Math.floor(radius * 0.45), tokens.shadow);
    addEffectLine(pixels, cx + Math.floor(radius * 0.7), cy - Math.floor(radius * 0.45), cx - Math.floor(radius * 0.7), cy + Math.floor(radius * 0.45), tokens.mid);
  }

  const spellTravelByPhase = [0, 1, 4, 8, 12, 15, 18, 20];
  const spellRadiusByPhase = [1, 2, 4, 6, 8, 10, 7, 4];

  function normalVector(vector) {
    return { x: -vector.y, y: vector.x };
  }

  function orientedPoint(origin, vector, along, side = 0) {
    const normal = normalVector(vector);
    return {
      x: Math.round(origin.x + vector.x * along + normal.x * side),
      y: Math.round(origin.y + vector.y * along + normal.y * side),
    };
  }

  function addOrientedPixel(pixels, origin, vector, along, side, token, size = 1) {
    const point = orientedPoint(origin, vector, along, side);
    addEffectPixel(pixels, point.x, point.y, token, size);
  }

  function addOrientedLine(pixels, origin, vector, along0, side0, along1, side1, token) {
    const start = orientedPoint(origin, vector, along0, side0);
    const end = orientedPoint(origin, vector, along1, side1);
    addEffectLine(pixels, start.x, start.y, end.x, end.y, token);
  }

  function addOrientedBlock(pixels, origin, vector, along, side, alongSize, sideSize, token) {
    const alongStart = along - Math.floor(alongSize / 2);
    const sideStart = side - Math.floor(sideSize / 2);
    for (let a = 0; a < alongSize; a += 1) {
      for (let s = 0; s < sideSize; s += 1) {
        addOrientedPixel(pixels, origin, vector, alongStart + a, sideStart + s, token);
      }
    }
  }

  function addOrientedPolyline(pixels, origin, vector, points, token) {
    for (let index = 0; index < points.length - 1; index += 1) {
      const [along0, side0] = points[index];
      const [along1, side1] = points[index + 1];
      addOrientedLine(pixels, origin, vector, along0, side0, along1, side1, token);
    }
  }

  function spellTarget(origin, vector, phase, maxTravel = 18) {
    const stage = castPhase(phase);
    return orientedPoint(origin, vector, Math.min(maxTravel * motionScale, spellTravelByPhase[stage] * motionScale));
  }

  function spellRadius(phase, form, scale = 1) {
    const stage = castPhase(phase);
    const base = spellRadiusByPhase[stage] + Math.floor(form / 3);
    return Math.max(2, Math.floor(base * scale * motionScale));
  }

  function addSpellCharge(pixels, origin, tokens, phase) {
    const stage = castPhase(phase);
    if (stage > 3) return;
    const radius = stage <= 1 ? 1 : 2;
    addEffectDiamond(pixels, origin.x, origin.y, radius, tokens);
    if (stage >= 1) {
      addEffectPixel(pixels, origin.x - 3, origin.y + (stage % 2), tokens.mid);
      addEffectPixel(pixels, origin.x + 3, origin.y - (stage % 2), tokens.core);
      addEffectPixel(pixels, origin.x, origin.y - 3, tokens.shadow);
    }
  }

  function addSpellTrail(pixels, origin, target, vector, tokens, phase) {
    const stage = castPhase(phase);
    if (stage < 2) return;
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const length = Math.max(1, Math.abs(dx) + Math.abs(dy));
    addOrientedLine(pixels, origin, vector, 0, 0, length, 0, tokens.mid);
    if (stage >= 3) addOrientedLine(pixels, origin, vector, 2, -1, length - 1, -1, tokens.shadow);
    if (stage >= 4) addOrientedLine(pixels, origin, vector, 3, 1, length, 1, tokens.core);
    if (stage >= 5) {
      for (let index = 2; index < length; index += 4) {
        addOrientedPixel(pixels, origin, vector, index, ((index + stage) % 3) - 1, index % 2 ? tokens.core : tokens.shadow);
      }
    }
  }

  function addSpellFragments(pixels, center, vector, radius, tokens, phase, count) {
    const stage = castPhase(phase);
    if (stage < 6) return;
    for (let index = 0; index < count; index += 1) {
      const along = ((index * 5 + phase * 3) % (radius + 7)) - Math.floor(radius / 2);
      const side = ((index * 7 + phase * 2) % (radius * 2 + 1)) - radius;
      const token = index % 3 === 0 ? tokens.core : index % 2 ? tokens.mid : tokens.shadow;
      addOrientedPixel(pixels, center, vector, along, side, token);
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

  function fireEffect(phase, expression, formValue, direction) {
    const pixels = [];
    const level = spellLevel(expression);
    const form = spellForm(formValue);
    const stage = castPhase(phase);
    const tokens = { shadow: "fire-shadow", mid: "fire", core: "fire-core" };
    const origin = spellOrigin(direction);
    const vector = directionVector(direction);
    const target = spellTarget(origin, vector, phase, 15);
    const radius = spellRadius(phase, form, 0.85) + Math.floor(level / 10);
    const travel = Math.max(1, Math.abs(target.x - origin.x) + Math.abs(target.y - origin.y));

    addSpellCharge(pixels, origin, tokens, phase);
    addSpellTrail(pixels, origin, target, vector, tokens, phase);
    if (stage < 2) return pixels;

    if (form === 1) {
      addEffectDiamond(pixels, target.x, target.y, radius, tokens);
      addOrientedLine(pixels, target, vector, 0, -2, -radius - 2, -4, "fire");
      addOrientedLine(pixels, target, vector, 0, 1, -radius - 4, 1, "fire-core");
      addOrientedLine(pixels, target, vector, 0, 3, -radius - 1, 5, "fire-shadow");
    } else if (form === 2) {
      addEffectRing(pixels, target.x, target.y, radius + 2, tokens);
      addOrientedLine(pixels, target, vector, -radius, 0, radius, 0, "fire-core");
      addOrientedPixel(pixels, target, vector, -radius - 2, 0, "fire-core");
    } else if (form === 3) {
      addOrientedPolyline(pixels, origin, vector, [[0, 0], [4, -3], [8, 2], [12, -4], [travel, 1]], "fire");
      addOrientedPolyline(pixels, origin, vector, [[2, 1], [6, -2], [10, 3], [travel, 0]], "fire-core");
      addEffectDiamond(pixels, target.x, target.y, 3, tokens);
    } else if (form === 4) {
      addOrientedLine(pixels, origin, vector, 1, 0, travel + radius, 0, "fire-core");
      addOrientedLine(pixels, origin, vector, 3, -1, travel + radius - 2, -1, "fire");
      addOrientedLine(pixels, origin, vector, 3, 1, travel + radius - 2, 1, "fire-shadow");
      addOrientedPixel(pixels, origin, vector, travel + radius + 1, 0, "fire-core", 2);
    } else if (form === 5) {
      addOrientedLine(pixels, target, vector, -2, -radius, -radius - 2, -radius + 3, "fire");
      addOrientedLine(pixels, target, vector, -2, -radius + 3, -radius - 4, 0, "fire-core");
      addOrientedLine(pixels, target, vector, -radius - 4, 0, -2, radius - 3, "fire");
      addOrientedLine(pixels, target, vector, -2, radius - 3, -radius - 2, radius, "fire-shadow");
    } else if (form === 6) {
      addEffectRing(pixels, target.x, target.y, radius + 4, tokens);
      addOrientedPolyline(pixels, target, vector, [[-radius, -1], [-4, 4], [1, 2], [4, -3], [radius, -1]], "fire-core");
      addOrientedPixel(pixels, target, vector, 0, 0, "fire-core", 2);
    } else if (form === 7) {
      addOrientedLine(pixels, target, vector, -radius, -radius, radius + 1, -radius, "fire-shadow");
      addOrientedLine(pixels, target, vector, -radius, radius, radius + 1, radius, "fire-shadow");
      addOrientedLine(pixels, target, vector, -radius, -radius, -radius - 4, 0, "fire-core");
      addOrientedLine(pixels, target, vector, -radius, radius, -radius - 4, 0, "fire-core");
    } else if (form === 8) {
      addEffectDiamond(pixels, target.x, target.y, radius - 1, tokens);
      addSpellFragments(pixels, target, vector, radius + 7, tokens, phase, 18);
      addOrientedLine(pixels, target, vector, -radius, -radius, radius, radius, "fire-shadow");
    } else if (form === 9) {
      addEffectBurst(pixels, target.x, target.y, radius + 5, tokens);
      addEffectDiamond(pixels, target.x, target.y, Math.max(2, radius - 2), tokens);
    } else {
      addOrientedLine(pixels, target, vector, -radius, -radius - 4, -radius - 7, -1, "fire");
      addOrientedLine(pixels, target, vector, -radius - 7, -1, -radius, 4, "fire-core");
      addOrientedLine(pixels, target, vector, -radius, radius + 4, -radius - 7, 1, "fire");
      addOrientedLine(pixels, target, vector, -radius - 7, 1, -radius, -4, "fire-core");
      addEffectDiamond(pixels, target.x, target.y, 3, tokens);
    }

    addSpellFragments(pixels, target, vector, radius + 4, tokens, phase, 8 + form);
    return pixels;
  }

  function earthEffect(phase, expression, formValue, direction) {
    const pixels = [];
    const level = spellLevel(expression);
    const form = spellForm(formValue);
    const stage = castPhase(phase);
    const tokens = { shadow: "earth-shadow", mid: "earth", core: "earth-core" };
    const origin = spellOrigin(direction);
    const vector = directionVector(direction);
    const target = spellTarget(origin, vector, phase, 15);
    const radius = spellRadius(phase, form, 0.9) + Math.floor(level / 10);
    const travel = Math.max(1, Math.abs(target.x - origin.x) + Math.abs(target.y - origin.y));

    addSpellCharge(pixels, origin, tokens, phase);
    addSpellTrail(pixels, origin, target, vector, tokens, phase);
    if (stage < 2) return pixels;

    if (form === 1) {
      for (let side = -radius; side <= radius; side += 3) {
        addOrientedBlock(pixels, target, vector, 0, side, 2 + (Math.abs(side) % 2), 2, side % 2 ? "earth" : "earth-shadow");
      }
      addOrientedLine(pixels, target, vector, -2, -radius - 1, 3, radius + 1, "earth-core");
    } else if (form === 2) {
      addEffectRing(pixels, target.x, target.y, radius + 3, tokens);
      for (let side = -radius; side <= radius; side += 4) addOrientedBlock(pixels, target, vector, 0, side, 2, 2, "earth-core");
    } else if (form === 3) {
      addOrientedPolyline(pixels, origin, vector, [[0, 0], [4, 3], [7, -2], [12, 4], [travel, -1]], "earth");
      addOrientedPolyline(pixels, origin, vector, [[2, -1], [6, 2], [10, -3], [travel, 1]], "earth-core");
      addOrientedBlock(pixels, target, vector, 0, 0, 3, 3, "earth-shadow");
    } else if (form === 4) {
      addEffectDiamond(pixels, target.x, target.y, radius, tokens);
      addEffectDiamond(pixels, orientedPoint(target, vector, -radius - 1, -4).x, orientedPoint(target, vector, -radius - 1, -4).y, 3, tokens);
      addEffectDiamond(pixels, orientedPoint(target, vector, -radius, 5).x, orientedPoint(target, vector, -radius, 5).y, 3, tokens);
    } else if (form === 5) {
      addOrientedLine(pixels, target, vector, -2, -radius, -radius - 2, -radius + 3, "earth-core");
      addOrientedLine(pixels, target, vector, -radius - 2, -radius + 3, -3, 0, "earth");
      addOrientedLine(pixels, target, vector, -3, 0, -radius - 2, radius - 2, "earth-core");
      addOrientedLine(pixels, target, vector, -radius - 2, radius - 2, -2, radius, "earth-shadow");
    } else if (form === 6) {
      addEffectRing(pixels, target.x, target.y, radius + 4, tokens);
      addOrientedPolyline(pixels, target, vector, [[-radius, -2], [-5, 4], [0, 2], [5, -4], [radius, 2]], "earth-core");
      addOrientedBlock(pixels, target, vector, 0, 0, 3, 3, "earth");
    } else if (form === 7) {
      addOrientedBlock(pixels, target, vector, 0, -radius, radius + 7, 3, "earth-shadow");
      addOrientedBlock(pixels, target, vector, 0, radius, radius + 7, 3, "earth-shadow");
      addOrientedLine(pixels, target, vector, -radius - 4, -radius, -radius - 4, radius, "earth-core");
    } else if (form === 8) {
      for (let index = 0; index < 18; index += 1) {
        addOrientedBlock(pixels, target, vector, ((index * 3 + phase) % (radius + 10)) - 4, ((index * 7) % (radius * 2 + 1)) - radius, index % 3 === 0 ? 3 : 2, 2, index % 2 ? "earth" : "earth-core");
      }
    } else if (form === 9) {
      addEffectBurst(pixels, target.x, target.y, radius + 5, tokens);
      addEffectDiamond(pixels, target.x, target.y, Math.max(3, radius - 1), tokens);
    } else {
      addOrientedBlock(pixels, target, vector, 0, 0, 5, 7, "earth");
      for (let side = -5; side <= 5; side += 2) addOrientedBlock(pixels, target, vector, -6, side, 7, 2, "earth-shadow");
      addOrientedBlock(pixels, target, vector, 4, -5, 5, 2, "earth-core");
      addOrientedBlock(pixels, target, vector, 4, 5, 5, 2, "earth-core");
    }

    addSpellFragments(pixels, target, vector, radius + 4, tokens, phase, 8 + form);
    return pixels;
  }

  function waterEffect(phase, expression, formValue, direction) {
    const pixels = [];
    const level = spellLevel(expression);
    const form = spellForm(formValue);
    const stage = castPhase(phase);
    const tokens = { shadow: "water-shadow", mid: "water", core: "water-core" };
    const origin = spellOrigin(direction);
    const vector = directionVector(direction);
    const target = spellTarget(origin, vector, phase, 15);
    const radius = spellRadius(phase, form, 0.85) + Math.floor(level / 10);
    const travel = Math.max(1, Math.abs(target.x - origin.x) + Math.abs(target.y - origin.y));

    addSpellCharge(pixels, origin, tokens, phase);
    addSpellTrail(pixels, origin, target, vector, tokens, phase);
    if (stage < 2) return pixels;

    if (form === 1) {
      addOrientedPolyline(pixels, target, vector, [[-radius, 3], [-3, -2], [2, -4], [radius, 1]], "water");
      addOrientedPolyline(pixels, target, vector, [[-radius, 1], [-2, -4], [3, -1], [radius, -3]], "water-core");
      addOrientedLine(pixels, target, vector, -radius, 5, radius, 4, "water-shadow");
    } else if (form === 2) {
      addEffectRing(pixels, target.x, target.y, radius + 3, tokens);
      addOrientedLine(pixels, target, vector, -radius, 0, radius, 0, "water-core");
    } else if (form === 3) {
      addOrientedPolyline(pixels, origin, vector, [[0, 0], [4, -3], [8, 3], [12, -4], [travel, 1]], "water");
      addOrientedPolyline(pixels, origin, vector, [[2, 1], [6, -2], [10, 4], [travel, 0]], "water-core");
      addEffectDiamond(pixels, target.x, target.y, 3, tokens);
    } else if (form === 4) {
      addOrientedLine(pixels, origin, vector, 1, 0, travel + radius, 0, "water-core");
      addOrientedLine(pixels, origin, vector, 3, -1, travel + radius - 1, -1, "water");
      addOrientedLine(pixels, origin, vector, 3, 1, travel + radius - 1, 1, "water-shadow");
      addOrientedPixel(pixels, origin, vector, travel + radius + 1, 0, "water-core", 2);
    } else if (form === 5) {
      addOrientedLine(pixels, target, vector, -3, -radius, -radius - 2, -radius + 2, "water-core");
      addOrientedLine(pixels, target, vector, -radius - 2, -radius + 2, -4, 0, "water");
      addOrientedLine(pixels, target, vector, -4, 0, -radius - 2, radius - 2, "water-core");
      addOrientedLine(pixels, target, vector, -radius - 2, radius - 2, -3, radius, "water-shadow");
    } else if (form === 6) {
      addEffectRing(pixels, target.x, target.y, radius + 4, tokens);
      addOrientedPolyline(pixels, target, vector, [[-radius, -2], [-4, 5], [1, 2], [4, -4], [radius, 1]], "water-core");
      addOrientedPixel(pixels, target, vector, 0, 0, "water-core", 2);
    } else if (form === 7) {
      addOrientedLine(pixels, target, vector, -radius, -radius, radius + 1, -radius, "water-shadow");
      addOrientedLine(pixels, target, vector, -radius, radius, radius + 1, radius, "water-shadow");
      addOrientedLine(pixels, target, vector, -radius, -radius, -radius - 4, 0, "water-core");
      addOrientedLine(pixels, target, vector, -radius, radius, -radius - 4, 0, "water-core");
    } else if (form === 8) {
      for (let index = 0; index < 18; index += 1) {
        addOrientedPixel(pixels, target, vector, ((index * 3 + phase) % (radius + 9)) - 5, ((index * 5 + phase) % (radius * 2 + 1)) - radius, index % 3 === 0 ? "water-core" : index % 2 ? "water" : "water-shadow");
      }
    } else if (form === 9) {
      addEffectBurst(pixels, target.x, target.y, radius + 5, tokens);
      addOrientedLine(pixels, target, vector, -radius, radius, radius, radius + 3, "water-shadow");
    } else {
      addOrientedPolyline(pixels, target, vector, [[-radius, radius], [-4, 1], [0, -radius], [5, -2], [radius + 2, radius - 2]], "water");
      addOrientedPolyline(pixels, target, vector, [[-radius + 2, radius - 1], [-2, 0], [1, -radius + 2], [6, 0], [radius + 3, radius - 3]], "water-core");
      addEffectDiamond(pixels, target.x, target.y, 2, tokens);
    }

    addSpellFragments(pixels, target, vector, radius + 4, tokens, phase, 8 + form);
    return pixels;
  }

  function electricEffect(phase, expression, formValue, direction) {
    const pixels = [];
    const level = spellLevel(expression);
    const form = spellForm(formValue);
    const stage = castPhase(phase);
    const tokens = { shadow: "electric-shadow", mid: "electric", core: "electric-core" };
    const origin = spellOrigin(direction);
    const vector = directionVector(direction);
    const target = spellTarget(origin, vector, phase, 15);
    const radius = spellRadius(phase, form, 0.85) + Math.floor(level / 10);
    const travel = Math.max(1, Math.abs(target.x - origin.x) + Math.abs(target.y - origin.y));

    addSpellCharge(pixels, origin, tokens, phase);
    if (stage >= 2) {
      addOrientedPolyline(pixels, origin, vector, [[0, 0], [3, -3], [6, 2], [9, -4], [travel, 0]], "electric");
      addOrientedPolyline(pixels, origin, vector, [[1, 1], [4, -2], [8, 3], [travel, 1]], "electric-shadow");
      if (stage >= 4) addOrientedPolyline(pixels, origin, vector, [[2, 0], [5, -4], [10, -1], [travel, -3]], "electric-core");
    }
    if (stage < 2) return pixels;

    if (form === 1) {
      addEffectBurst(pixels, target.x, target.y, Math.max(4, radius), tokens);
    } else if (form === 2) {
      addEffectRing(pixels, target.x, target.y, radius + 2, tokens);
      addOrientedLine(pixels, target, vector, -radius, 0, radius, 0, "electric-core");
    } else if (form === 3) {
      addOrientedPolyline(pixels, origin, vector, [[0, 0], [4, -5], [7, 4], [11, -3], [travel, 3]], "electric-core");
      addOrientedPolyline(pixels, origin, vector, [[3, 2], [6, -2], [10, 5], [travel, -1]], "electric");
      addEffectDiamond(pixels, target.x, target.y, 2, tokens);
    } else if (form === 4) {
      addOrientedLine(pixels, origin, vector, 1, 0, travel + radius, 0, "electric-core");
      addOrientedLine(pixels, origin, vector, 2, -1, travel + radius - 2, -1, "electric");
      addOrientedLine(pixels, origin, vector, 2, 1, travel + radius - 2, 1, "electric-shadow");
      addOrientedPixel(pixels, origin, vector, travel + radius + 1, 0, "electric-core");
    } else if (form === 5) {
      addOrientedPolyline(pixels, target, vector, [[-2, -radius], [-radius - 2, -radius + 3], [-3, 0], [-radius - 2, radius - 3], [-2, radius]], "electric-core");
      addOrientedPixel(pixels, target, vector, -radius - 3, 0, "electric", 2);
    } else if (form === 6) {
      addEffectRing(pixels, target.x, target.y, radius + 4, tokens);
      addOrientedPolyline(pixels, target, vector, [[-radius, -2], [-4, 4], [1, 2], [5, -5], [radius, 1]], "electric-core");
    } else if (form === 7) {
      addOrientedLine(pixels, target, vector, -radius, -radius, radius + 1, -radius, "electric-shadow");
      addOrientedLine(pixels, target, vector, -radius, radius, radius + 1, radius, "electric-shadow");
      addOrientedLine(pixels, target, vector, -radius, -radius, -radius - 4, 0, "electric-core");
      addOrientedLine(pixels, target, vector, -radius, radius, -radius - 4, 0, "electric-core");
    } else if (form === 8) {
      for (let index = 0; index < 18; index += 1) {
        addOrientedPixel(pixels, target, vector, ((index * 4 + phase) % (radius + 10)) - 4, ((index * 7 + phase) % (radius * 2 + 1)) - radius, index % 3 === 0 ? "electric-core" : index % 2 ? "electric" : "electric-shadow");
      }
    } else if (form === 9) {
      addEffectBurst(pixels, target.x, target.y, radius + 5, tokens);
      addOrientedPolyline(pixels, target, vector, [[-radius, -radius], [0, 0], [radius, radius], [0, 0], [radius, -radius]], "electric-core");
    } else {
      addOrientedLine(pixels, target, vector, -radius, -radius, radius, radius, "electric");
      addOrientedLine(pixels, target, vector, -radius, radius, radius, -radius, "electric");
      addOrientedLine(pixels, target, vector, 0, -radius - 4, 0, radius + 4, "electric-core");
      addOrientedLine(pixels, target, vector, -radius - 4, 0, radius + 4, 0, "electric-core");
      addEffectRing(pixels, target.x, target.y, radius + 3, tokens);
    }

    addSpellFragments(pixels, target, vector, radius + 4, tokens, phase, 8 + form);
    return pixels;
  }

  function elementalEffect(spec) {
    const expression = spec.expression || 1;
    const form = spec.form || 1;
    const direction = spec.direction || "down";
    if (spec.element === "fire") return fireEffect(spec.phase, expression, form, direction);
    if (spec.element === "earth") return earthEffect(spec.phase, expression, form, direction);
    if (spec.element === "water") return waterEffect(spec.phase, expression, form, direction);
    if (spec.element === "electric") return electricEffect(spec.phase, expression, form, direction);
    return [];
  }

  function effectPixels(spec) {
    if (spec.kind === "cast-orb") return orbEffect(spec.phase);
    if (spec.kind === "cast-burst") return burstEffect(spec.phase);
    if (spec.kind === "elemental-cast") return elementalEffect(spec);
    return [];
  }

  function rectMarkup(x, y, token, size = 1) {
    return `<rect class="mage-pixel mage-px-${token}" x="${x}" y="${y}" width="${size}" height="${size}"></rect>`;
  }

  function frameMarkup(spec) {
    if (frameMarkupCache.has(spec)) return frameMarkupCache.get(spec);

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

    const markup = parts.join("");
    frameMarkupCache.set(spec, markup);
    return markup;
  }

  function renderFrame(svg, spec) {
    if (!spec || svg.__ditherMageFrame === spec) return;
    svg.innerHTML = frameMarkup(spec);
    svg.__ditherMageFrame = spec;
  }

  function runAnimationFrame(now) {
    animationRequest = 0;
    if (reducedMotionQuery.matches) return;

    let hasVisibleInstance = false;
    for (const instance of instances) {
      if (!instance.isVisible) continue;
      hasVisibleInstance = true;
      instance.tick(now);
    }

    if (hasVisibleInstance) startAnimationLoop();
  }

  function startAnimationLoop() {
    if (animationRequest || reducedMotionQuery.matches || !instances.length) return;
    animationRequest = requestAnimationFrame(runAnimationFrame);
  }

  function stopAnimationLoop() {
    if (!animationRequest) return;
    cancelAnimationFrame(animationRequest);
    animationRequest = 0;
  }

  class DitherMageVector {
    constructor(root) {
      this.root = root;
      this.svg = document.createElementNS(SVG_NS, "svg");
      this.svg.classList.add("mage-vector");
      this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      this.svg.setAttribute("aria-hidden", "true");
      this.root.appendChild(this.svg);

      this.state = root.dataset.mageState || "header";
      this.frame = 0;
      this.lastFrameAt = 0;
      this.playlistIndex = 0;
      this.playlistLoops = 0;
      this.hoverSpellIndex = 0;
      this.facing = "south";
      this.once = null;
      this.isVisible = true;
      this.root.__ditherMageVector = this;

      this.bindInteractions();
      this.observeBusyState();
      this.observeVisibility();
      this.renderCurrentFrame();
    }

    bindInteractions() {
      const hoverTrigger = this.root.closest("[data-mage-hover-cast]") || (this.state === "header" ? this.root : null);
      const focusTrigger = this.root.closest("[data-mage-hover-cast]") || (this.state === "header" ? this.root : null);
      const hoverEvent = window.PointerEvent ? "pointerenter" : "mouseenter";

      if (hoverTrigger) {
        hoverTrigger.addEventListener(hoverEvent, () => this.playNextHoverSpell());
      }

      if (focusTrigger) {
        focusTrigger.addEventListener("focusin", () => this.playNextHoverSpell());
        focusTrigger.addEventListener("click", () => this.playOnce("cast-burst"));
      }

    }

    playNextHoverSpell() {
      const candidates = hoverSpellElements
        .map((element) => `cast-${element}-${this.facing}-l10`)
        .filter((state) => data.animations[state]);
      if (!candidates.length) return;
      const state = candidates[this.hoverSpellIndex % candidates.length];
      this.hoverSpellIndex = (this.hoverSpellIndex + 1) % candidates.length;
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
      this.renderCurrentFrame();
      startAnimationLoop();
    }

    setState(state) {
      if (state !== "header" && !data.animations[state]) return;
      this.state = state;
      this.once = null;
      this.frame = 0;
      this.lastFrameAt = 0;
      this.playlistIndex = 0;
      this.playlistLoops = 0;
      this.renderCurrentFrame();
      startAnimationLoop();
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

    renderCurrentFrame() {
      const animation = this.currentAnimation();
      if (!animation?.frames?.length) return;
      const frameSpec = animation.frames[this.frame % animation.frames.length];
      this.facing = directionNameFromSpec(frameSpec);
      renderFrame(this.svg, frameSpec);
    }

    observeVisibility() {
      if (!visibilityObserver) return;
      this.isVisible = false;
      visibilityObserver.observe(this.root);
    }

    tick(now) {
      if (reducedMotionQuery.matches || !this.isVisible) return;
      const animation = this.currentAnimation();
      const frameDuration = 1000 / animation.fps;
      if (!this.lastFrameAt) {
        this.lastFrameAt = now;
        this.renderCurrentFrame();
        return;
      }

      if (now - this.lastFrameAt >= frameDuration) {
        const steps = Math.min(4, Math.floor((now - this.lastFrameAt) / frameDuration));
        for (let step = 0; step < steps; step += 1) {
          this.advanceFrame(this.currentAnimation());
        }
        this.lastFrameAt += steps * frameDuration;
        this.renderCurrentFrame();
      }
    }
  }

  const visibilityObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const instance = entry.target.__ditherMageVector;
              if (!instance) continue;
              instance.isVisible = entry.isIntersecting;
              if (entry.isIntersecting) {
                instance.lastFrameAt = 0;
                instance.renderCurrentFrame();
                startAnimationLoop();
              }
            }
          },
          { rootMargin: "160px" }
        )
      : null;

  document.querySelectorAll("[data-mage-vector]").forEach((root) => {
    instances.push(new DitherMageVector(root));
  });

  reducedMotionQuery.addEventListener("change", () => {
    if (reducedMotionQuery.matches) {
      stopAnimationLoop();
      instances.forEach((instance) => instance.renderCurrentFrame());
    } else {
      instances.forEach((instance) => {
        instance.lastFrameAt = 0;
      });
      startAnimationLoop();
    }
  });

  startAnimationLoop();

  window.DitherMageSprite = {
    states: Object.keys(data.animations),
    instances,
    setState(state) {
      instances.forEach((instance) => instance.setState(state));
    },
    play(state) {
      instances.forEach((instance) => instance.playOnce(state));
    },
    setRootState(root, state) {
      root?.__ditherMageVector?.setState(state);
    },
  };
})();
