const sourceCanvas = document.getElementById("sourceCanvas");
const outputCanvas = document.getElementById("outputCanvas");
const workCanvas = document.getElementById("workCanvas");
const pipelineCanvas = document.getElementById("pipelineCanvas");
const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
const outputCtx = outputCanvas.getContext("2d", { willReadFrequently: true });
const workCtx = workCanvas.getContext("2d", { willReadFrequently: true });
const pipelineCtx = pipelineCanvas.getContext("2d", { willReadFrequently: true });
const video = document.getElementById("videoElement");

const $ = (id) => document.getElementById(id);
const DEFAULT_SAMPLE_URL = "assets/images/dither-wizard-default.png";
const DEFAULT_SAMPLE_NAME = "dither-wizard-default.png";
const DROP_TEXTURE_DEV_KEY = "dither-wizard-drop-texture-dev";
const IDLE_THEME_INTERVAL = 110;
const ANIMATED_THEME_INTERVAL = 520;
const ANIMATED_EXPORT_METRIC_INTERVAL = 2200;
const ANIMATED_RENDER_MIN_INTERVAL = 66;
const ANIMATED_RENDER_MAX_INTERVAL = 210;
const ANIMATED_PREVIEW_MAX_SIDE = 700;
const WEBM_EXPORT_FPS = 30;
const WEBM_EXPORT_MAX_SECONDS = 8;
const WEBM_EXPORT_MIN_BITRATE = 12000000;
const WEBM_EXPORT_MAX_BITRATE = 80000000;
const WEBM_EXPORT_BITS_PER_PIXEL = 0.32;
const GIF_EXPORT_FPS = 8;
const GIF_EXPORT_MAX_SECONDS = 4;
const GIF_EXPORT_MAX_FRAMES = GIF_EXPORT_FPS * GIF_EXPORT_MAX_SECONDS;
const GIF_EXPORT_COLORS = 256;
const GIF_PALETTE_SAMPLE_PIXELS = 90000;
const DROP_TEXTURE_OPTIONS = [
  "rain-vortex-fine",
  "rain-vortex-soft",
  "rain-vortex-wide",
  "rain-vortex-spiral",
  "rain-vortex-cross",
  "rain-vortex-cyan",
  "rain-vortex-amber",
  "rain-vortex-static",
  "rain-vortex-deep",
  "rain-vortex-phosphor",
];

const els = {
  fileInput: $("fileInput"),
  loadButton: $("loadButton"),
  dropZone: $("dropZone"),
  resetSampleButton: $("resetSampleButton"),
  snapshotButton: $("snapshotButton"),
  presetGrid: $("presetGrid"),
  batchInput: $("batchInput"),
  batchInputButton: $("batchInputButton"),
  batchList: $("batchList"),
  processBatchButton: $("processBatchButton"),
  canvasFrame: $("canvasFrame"),
  algorithmSelect: $("algorithmSelect"),
  algorithmSearch: $("algorithmSearch"),
  adjustmentControls: $("adjustmentControls"),
  paletteSelect: $("paletteSelect"),
  swatchRow: $("swatchRow"),
  extractPaletteButton: $("extractPaletteButton"),
  exportPaletteButton: $("exportPaletteButton"),
  importPaletteButton: $("importPaletteButton"),
  paletteInput: $("paletteInput"),
  effectSelect: $("effectSelect"),
  addEffectButton: $("addEffectButton"),
  effectsStack: $("effectsStack"),
  playButton: $("playButton"),
  playIcon: $("playIcon"),
  stepBackButton: $("stepBackButton"),
  stepForwardButton: $("stepForwardButton"),
  recordButton: $("recordButton"),
  downloadGifButton: $("downloadGifButton"),
  recordWebmButton: $("recordWebmButton"),
  lastExportLink: $("lastExportLink"),
  timelineSlider: $("timelineSlider"),
  timeReadout: $("timeReadout"),
  loopToggle: $("loopToggle"),
  animateStillToggle: $("animateStillToggle"),
  livePreviewToggle: $("livePreviewToggle"),
  mediaStatus: $("mediaStatus"),
  algorithmStatus: $("algorithmStatus"),
  renderStatus: $("renderStatus"),
  dimensionsReadout: $("dimensionsReadout"),
  fpsReadout: $("fpsReadout"),
  paletteReadout: $("paletteReadout"),
  exportStatus: $("exportStatus"),
  exportFileName: $("exportFileName"),
  fileSizeMeter: $("fileSizeMeter"),
  exportPercent: $("exportPercent"),
  originalSize: $("originalSize"),
  ditheredSize: $("ditheredSize"),
  exportDeltaLabel: $("exportDeltaLabel"),
  savedSize: $("savedSize"),
  exportDimensions: $("exportDimensions"),
  exportMegapixels: $("exportMegapixels"),
  exportFormat: $("exportFormat"),
  downloadPngButton: $("downloadPngButton"),
  downloadJpgButton: $("downloadJpgButton"),
  downloadSvgButton: $("downloadSvgButton"),
  randomizeButton: $("randomizeButton"),
  savePresetButton: $("savePresetButton"),
  themeToggle: $("themeToggle"),
  themeGlyph: $("themeGlyph"),
  themeText: $("themeText"),
  contextDevPanel: $("contextDevPanel"),
  contextPanelToggle: $("contextPanelToggle"),
  dropTextureOptions: $("dropTextureOptions"),
};

const ERROR_KERNELS = {
  "floyd-steinberg": [
    [1, 0, 7 / 16],
    [-1, 1, 3 / 16],
    [0, 1, 5 / 16],
    [1, 1, 1 / 16],
  ],
  "false-floyd": [
    [1, 0, 3 / 8],
    [0, 1, 3 / 8],
    [1, 1, 2 / 8],
  ],
  jjn: [
    [1, 0, 7 / 48],
    [2, 0, 5 / 48],
    [-2, 1, 3 / 48],
    [-1, 1, 5 / 48],
    [0, 1, 7 / 48],
    [1, 1, 5 / 48],
    [2, 1, 3 / 48],
    [-2, 2, 1 / 48],
    [-1, 2, 3 / 48],
    [0, 2, 5 / 48],
    [1, 2, 3 / 48],
    [2, 2, 1 / 48],
  ],
  stucki: [
    [1, 0, 8 / 42],
    [2, 0, 4 / 42],
    [-2, 1, 2 / 42],
    [-1, 1, 4 / 42],
    [0, 1, 8 / 42],
    [1, 1, 4 / 42],
    [2, 1, 2 / 42],
    [-2, 2, 1 / 42],
    [-1, 2, 2 / 42],
    [0, 2, 4 / 42],
    [1, 2, 2 / 42],
    [2, 2, 1 / 42],
  ],
  atkinson: [
    [1, 0, 1 / 8],
    [2, 0, 1 / 8],
    [-1, 1, 1 / 8],
    [0, 1, 1 / 8],
    [1, 1, 1 / 8],
    [0, 2, 1 / 8],
  ],
  burkes: [
    [1, 0, 8 / 32],
    [2, 0, 4 / 32],
    [-2, 1, 2 / 32],
    [-1, 1, 4 / 32],
    [0, 1, 8 / 32],
    [1, 1, 4 / 32],
    [2, 1, 2 / 32],
  ],
  sierra: [
    [1, 0, 5 / 32],
    [2, 0, 3 / 32],
    [-2, 1, 2 / 32],
    [-1, 1, 4 / 32],
    [0, 1, 5 / 32],
    [1, 1, 4 / 32],
    [2, 1, 2 / 32],
    [-1, 2, 2 / 32],
    [0, 2, 3 / 32],
    [1, 2, 2 / 32],
  ],
  "sierra-two-row": [
    [1, 0, 4 / 16],
    [2, 0, 3 / 16],
    [-2, 1, 1 / 16],
    [-1, 1, 2 / 16],
    [0, 1, 3 / 16],
    [1, 1, 2 / 16],
    [2, 1, 1 / 16],
  ],
  "sierra-lite": [
    [1, 0, 2 / 4],
    [-1, 1, 1 / 4],
    [0, 1, 1 / 4],
  ],
  "stevenson-arce": [
    [2, 0, 32 / 200],
    [-3, 1, 12 / 200],
    [-1, 1, 26 / 200],
    [1, 1, 30 / 200],
    [3, 1, 16 / 200],
    [-2, 2, 12 / 200],
    [0, 2, 26 / 200],
    [2, 2, 12 / 200],
    [-3, 3, 5 / 200],
    [-1, 3, 12 / 200],
    [1, 3, 12 / 200],
    [3, 3, 5 / 200],
  ],
  "shiau-fan": [
    [1, 0, 0.5],
    [-1, 1, 0.25],
    [0, 1, 0.25],
  ],
  "shiau-fan-two": [
    [1, 0, 0.5],
    [2, 0, 0.25],
    [-1, 1, 0.125],
    [0, 1, 0.125],
  ],
  fan: [
    [1, 0, 7 / 14],
    [-1, 1, 3 / 14],
    [0, 1, 4 / 14],
  ],
  xot: [
    [1, 0, 5 / 16],
    [2, 0, 3 / 16],
    [-1, 1, 4 / 16],
    [0, 1, 3 / 16],
    [1, 1, 1 / 16],
  ],
  "two-stage": [
    [1, 0, 6 / 20],
    [-1, 1, 4 / 20],
    [0, 1, 7 / 20],
    [1, 1, 3 / 20],
  ],
};

const ORDERED_MATRICES = {
  "bayer-2": [
    [0, 2],
    [3, 1],
  ],
  "bayer-4": [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ],
  "bayer-8": [
    [0, 48, 12, 60, 3, 51, 15, 63],
    [32, 16, 44, 28, 35, 19, 47, 31],
    [8, 56, 4, 52, 11, 59, 7, 55],
    [40, 24, 36, 20, 43, 27, 39, 23],
    [2, 50, 14, 62, 1, 49, 13, 61],
    [34, 18, 46, 30, 33, 17, 45, 29],
    [10, 58, 6, 54, 9, 57, 5, 53],
    [42, 26, 38, 22, 41, 25, 37, 21],
  ],
  "cluster-dot": [
    [12, 5, 6, 13],
    [4, 0, 1, 7],
    [11, 3, 2, 8],
    [15, 10, 9, 14],
  ],
  "blue-noise": [
    [29, 9, 52, 20, 35, 3, 58, 13],
    [45, 24, 6, 62, 17, 40, 27, 0],
    [12, 55, 32, 2, 49, 8, 61, 21],
    [38, 16, 43, 26, 5, 54, 30, 47],
    [1, 60, 18, 34, 14, 57, 10, 50],
    [25, 7, 48, 22, 42, 31, 4, 63],
    [53, 36, 11, 59, 28, 46, 19, 39],
    [15, 44, 33, 23, 56, 37, 51, 41],
  ],
};

const ALGORITHMS = [
  ...[
    ["floyd-steinberg", "Floyd Steinberg"],
    ["false-floyd", "False Floyd Steinberg"],
    ["jjn", "Jarvis Judice Ninke"],
    ["stucki", "Stucki"],
    ["atkinson", "Atkinson"],
    ["burkes", "Burkes"],
    ["sierra", "Sierra"],
    ["sierra-two-row", "Sierra Two Row"],
    ["sierra-lite", "Sierra Lite"],
    ["stevenson-arce", "Stevenson Arce"],
    ["shiau-fan", "Shiau Fan"],
    ["shiau-fan-two", "Shiau Fan 2"],
    ["fan", "Fan Diffusion"],
    ["xot", "Xot Diffusion"],
    ["two-stage", "Two Stage Diffusion"],
  ].map(([id, name]) => ({ id, name, group: "Error Diffusion", type: "error" })),
  ...[
    ["bayer-2", "Bayer 2x2"],
    ["bayer-4", "Bayer 4x4"],
    ["bayer-8", "Bayer 8x8"],
    ["cluster-dot", "Cluster Dot 4x4"],
    ["blue-noise", "Blue Noise Matrix"],
  ].map(([id, name]) => ({ id, name, group: "Ordered", type: "ordered" })),
  ...[
    ["vertical-hatch", "Vertical Hatch"],
    ["horizontal-hatch", "Horizontal Hatch"],
    ["diagonal-hatch", "Diagonal Hatch"],
    ["crosshatch", "Crosshatch"],
    ["gridline", "Gridline"],
    ["dot-field", "Dot Field"],
    ["slash-weave", "Slash Weave"],
    ["pixel-rain", "Pixel Rain"],
  ].map(([id, name]) => ({ id, name, group: "Pattern", type: "pattern" })),
  ...[
    ["jpeg-glitch", "JPEG Glitch"],
    ["chromatic-aberration", "Chromatic Aberration"],
    ["rgb-channel-drift", "RGB Channel Drift"],
    ["datamosh-smear", "Datamosh Smear"],
    ["scanline-split", "Scanline Split"],
    ["bitplane-crush", "Bitplane Crush"],
    ["wave-fold", "Wave Fold"],
    ["poster-tear", "Poster Tear"],
    ["pixel-sort", "Pixel Sort"],
    ["signal-noise", "Signal Noise"],
    ["crt-warp", "CRT Warp"],
    ["column-drift", "Column Drift"],
    ["block-shuffle", "Block Shuffle"],
    ["frame-echo", "Frame Echo"],
    ["phase-tear", "Phase Tear"],
    ["magnetic-bleed", "Magnetic Bleed"],
    ["byte-offset", "Byte Offset"],
  ].map(([id, name]) => ({ id, name, group: "Glitch", type: "glitch" })),
  ...[
    ["epsilon-glow", "Epsilon Glow"],
    ["cmyk-halftone", "CMYK Halftone"],
    ["newsprint", "Newsprint"],
    ["riso-grain", "Riso Grain"],
    ["vector-hatch", "Vector Hatch"],
    ["embroidery-satin", "Embroidery Satin"],
    ["ascii-tone", "ASCII Tone"],
    ["contour-lines", "Contour Lines"],
    ["radial-halftone", "Radial Halftone"],
    ["threshold-bloom", "Threshold Bloom"],
    ["edge-pulse", "Edge Pulse"],
    ["thermal-map", "Thermal Map"],
    ["infrared", "Infrared"],
    ["luma-slice", "Luma Slice"],
    ["ink-spread", "Ink Spread"],
    ["silk-screen", "Silk Screen"],
  ].map(([id, name]) => ({ id, name, group: "Special", type: "special" })),
  ...[
    ["temporal-pulse", "Temporal Pulse"],
    ["temporal-drift", "Temporal Drift"],
  ].map(([id, name]) => ({ id, name, group: "Temporal", type: "temporal" })),
];

const PALETTES = {
  adaptive: { name: "Adaptive RGB", colors: null },
  phosphor: {
    name: "Phosphor Mono",
    colors: [
      [8, 18, 14],
      [25, 72, 38],
      [92, 174, 84],
      [198, 255, 151],
    ],
  },
  vectorBlack: {
    name: "Black Vector",
    colors: [
      [16, 18, 17],
      [229, 236, 220],
    ],
  },
  gameboy: {
    name: "Game Console",
    colors: [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
  },
  c64: {
    name: "C64 Deep",
    colors: [
      [10, 12, 11],
      [238, 241, 231],
      [104, 55, 43],
      [112, 164, 178],
      [111, 61, 134],
      [88, 141, 67],
      [53, 40, 121],
      [184, 199, 111],
      [111, 79, 37],
      [67, 57, 0],
      [154, 103, 89],
      [68, 68, 68],
      [108, 108, 108],
      [154, 210, 132],
      [108, 94, 181],
      [149, 149, 149],
    ],
  },
  cga: {
    name: "CGA Terminal",
    colors: [
      [8, 10, 9],
      [85, 255, 255],
      [255, 85, 255],
      [255, 255, 255],
    ],
  },
  riso: {
    name: "Riso Signal",
    colors: [
      [31, 34, 32],
      [54, 211, 116],
      [245, 92, 76],
      [248, 203, 88],
      [64, 190, 220],
    ],
  },
  cmyk: {
    name: "CMYK Plates",
    colors: [
      [14, 18, 17],
      [0, 174, 239],
      [236, 0, 140],
      [255, 242, 0],
      [236, 239, 224],
    ],
  },
  heat: {
    name: "Thermal Bloom",
    colors: [
      [8, 10, 9],
      [30, 55, 90],
      [180, 55, 120],
      [244, 123, 69],
      [252, 228, 122],
    ],
  },
  macpaint: {
    name: "MacPaint",
    colors: [
      [20, 22, 21],
      [235, 236, 226],
    ],
  },
};

const EFFECTS = [
  { id: "epsilon-glow", name: "Epsilon Glow", canvas: true },
  { id: "jpeg-glitch", name: "JPEG Glitch" },
  { id: "chromatic-aberration", name: "Chromatic Aberration", canvas: true },
  { id: "scanlines", name: "Scanlines" },
  { id: "noise", name: "Signal Noise" },
  { id: "posterize", name: "Posterize" },
  { id: "invert", name: "Invert" },
  { id: "vignette", name: "Vignette" },
  { id: "bit-crush", name: "Bit Crush" },
  { id: "cmyk-shift", name: "CMYK Shift", canvas: true },
];

const PRESETS = [
  {
    name: "Crush",
    detail: "FS / mono",
    algorithm: "floyd-steinberg",
    palette: "vectorBlack",
    settings: { cell: 2, levels: 2, contrast: 34, brightness: -8, gamma: 1.1, noise: 8, threshold: 126, temporal: 18 },
    effects: [{ id: "scanlines", strength: 24, enabled: true }],
  },
  {
    name: "Fine Print",
    detail: "JJN / cmyk",
    algorithm: "jjn",
    palette: "cmyk",
    settings: { cell: 1, levels: 5, contrast: 16, brightness: 2, gamma: 0.92, noise: 3, threshold: 132, temporal: 8 },
    effects: [{ id: "epsilon-glow", strength: 12, enabled: true }],
  },
  {
    name: "Live Wire",
    detail: "drift / phosphor",
    algorithm: "temporal-drift",
    palette: "phosphor",
    settings: { cell: 3, levels: 4, contrast: 28, brightness: -10, gamma: 1.22, noise: 18, threshold: 118, temporal: 70 },
    effects: [
      { id: "chromatic-aberration", strength: 22, enabled: true },
      { id: "scanlines", strength: 34, enabled: true },
    ],
  },
  {
    name: "CMYK Rot",
    detail: "halftone",
    algorithm: "cmyk-halftone",
    palette: "cmyk",
    settings: { cell: 4, levels: 5, contrast: 22, brightness: 4, gamma: 0.88, noise: 6, threshold: 130, temporal: 20 },
    effects: [{ id: "cmyk-shift", strength: 18, enabled: true }],
  },
  {
    name: "Embroidery",
    detail: "vector hatch",
    algorithm: "embroidery-satin",
    palette: "vectorBlack",
    settings: { cell: 5, levels: 2, contrast: 42, brightness: 0, gamma: 1, noise: 1, threshold: 124, temporal: 4 },
    effects: [],
  },
  {
    name: "Datamosh",
    detail: "glitch stack",
    algorithm: "datamosh-smear",
    palette: "riso",
    settings: { cell: 2, levels: 5, contrast: 18, brightness: -4, gamma: 1.05, noise: 24, threshold: 128, temporal: 78 },
    effects: [
      { id: "jpeg-glitch", strength: 36, enabled: true },
      { id: "chromatic-aberration", strength: 24, enabled: true },
    ],
  },
];

const ADJUSTMENTS = [
  { id: "cell", label: "Cell", min: 1, max: 12, step: 1 },
  { id: "levels", label: "Levels", min: 2, max: 16, step: 1 },
  { id: "threshold", label: "Gate", min: 0, max: 255, step: 1 },
  { id: "contrast", label: "Contrast", min: -100, max: 100, step: 1 },
  { id: "brightness", label: "Bias", min: -100, max: 100, step: 1 },
  { id: "gamma", label: "Gamma", min: 0.35, max: 2.5, step: 0.01 },
  { id: "noise", label: "Noise", min: 0, max: 100, step: 1 },
  { id: "temporal", label: "Motion", min: 0, max: 100, step: 1 },
];

const state = {
  algorithm: "floyd-steinberg",
  palette: "phosphor",
  customPalette: null,
  settings: {
    cell: 2,
    levels: 4,
    threshold: 128,
    contrast: 18,
    brightness: -2,
    gamma: 1,
    noise: 6,
    temporal: 24,
  },
  effects: [
    { id: "epsilon-glow", strength: 16, enabled: true },
    { id: "scanlines", strength: 18, enabled: true },
  ],
  sourceType: "image",
  sourceName: "procedural",
  duration: 4,
  time: 0,
  playing: false,
  livePreview: true,
  animateStill: true,
  view: "processed",
  dirty: true,
  batchFiles: [],
  isRecording: false,
  isExporting: false,
  lastFrameAt: performance.now(),
  lastRenderCost: 0,
  nextAnimatedRenderAt: 0,
  fpsFrames: 0,
  fpsAt: performance.now(),
  themeSeed: null,
  sourceThemeSeed: null,
  editThemeSeed: null,
  editThemeActive: false,
  lastThemeAt: 0,
  lastSourceThemeAt: 0,
  lastEditThemeAt: 0,
  pendingSourceThemeReset: false,
  exportSourceName: "procedural.png",
  exportSourceBytes: null,
  exportSourceFormat: "PNG",
  exportTargetFormat: "PNG",
  exportDitheredBytes: null,
  exportMetricsRequest: 0,
  exportMetricsAt: 0,
  sourceMetricsRequest: 0,
};

let renderRaf = 0;
let playbackRaf = 0;
let objectUrl = "";
let lastExportUrl = "";
let exportMetricsTimer = 0;
let exportStatusTimer = 0;
let errorDiffusionBuffer = new Float32Array(0);
const luminanceSortedPaletteCache = new WeakMap();
const themeCanvas = document.createElement("canvas");
const themeCtx = themeCanvas.getContext("2d", { willReadFrequently: true });

function getSavedTheme() {
  try {
    const saved = localStorage.getItem("dither-wizard-theme") || localStorage.getItem("dither-grid-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    return "dark";
  }
  return "dark";
}

function setTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  setAppPixelIconSlot(els.themeGlyph, nextTheme === "dark" ? "Sun" : "Moon");
  if (els.themeText) els.themeText.textContent = nextTheme === "dark" ? "Light" : "Dark";
  els.themeToggle.setAttribute("aria-label", `Switch to ${nextTheme === "dark" ? "light" : "dark"} mode`);
  applyDynamicThemeRoles(state.themeSeed || state.editThemeSeed || state.sourceThemeSeed || { hue: 148, saturation: 0.78, rgb: [95, 210, 104] });
  try {
    localStorage.setItem("dither-wizard-theme", nextTheme);
  } catch {
    return;
  }
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function normalizeHue(hue) {
  return ((hue % 360) + 360) % 360;
}

function hueDistance(a, b) {
  const diff = Math.abs(normalizeHue(a) - normalizeHue(b));
  return Math.min(diff, 360 - diff);
}

function mixHue(a, b, amount) {
  const start = normalizeHue(a);
  let delta = normalizeHue(b) - start;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return normalizeHue(start + delta * amount);
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
    if (max === green) hue = (blue - red) / delta + 2;
    if (max === blue) hue = (red - green) / delta + 4;
    hue *= 60;
  }

  return { hue: normalizeHue(hue), saturation, lightness };
}

function oklch(lightness, chroma, hue, alpha = 1) {
  const l = clamp(lightness, 0, 100).toFixed(1);
  const c = Math.max(0, chroma).toFixed(3);
  const h = normalizeHue(hue).toFixed(1);
  if (alpha < 1) return `oklch(${l}% ${c} ${h} / ${alpha.toFixed(3)})`;
  return `oklch(${l}% ${c} ${h})`;
}

function gradient(angle, first, second) {
  return `linear-gradient(${angle}deg, ${first}, ${second})`;
}

function repeatingGrid(a, b) {
  return `repeating-linear-gradient(45deg, ${a}, ${a} 12px, ${b} 12px, ${b} 24px)`;
}

const STANDARD_MATERIAL_COLOR_ROLES = [
  "primary",
  "on-primary",
  "primary-container",
  "on-primary-container",
  "secondary",
  "on-secondary",
  "secondary-container",
  "on-secondary-container",
  "tertiary",
  "on-tertiary",
  "tertiary-container",
  "on-tertiary-container",
  "error",
  "on-error",
  "error-container",
  "on-error-container",
  "background",
  "on-background",
  "surface",
  "on-surface",
  "surface-variant",
  "on-surface-variant",
  "surface-dim",
  "surface-bright",
  "surface-container-lowest",
  "surface-container-low",
  "surface-container",
  "surface-container-high",
  "surface-container-highest",
  "outline",
  "outline-variant",
  "inverse-surface",
  "inverse-on-surface",
  "inverse-primary",
  "scrim",
  "shadow",
];

function buildMaterialWebAliases(roles) {
  const aliases = {};
  STANDARD_MATERIAL_COLOR_ROLES.forEach((role) => {
    const value = roles[`--m3-${role}`];
    if (value) aliases[`--md-sys-color-${role}`] = value;
  });
  return aliases;
}

function buildMaterialTheme(seed, mode) {
  const hue = normalizeHue(seed.hue);
  const chroma = clamp(0.08 + seed.saturation * 0.17, 0.1, 0.23);
  const secondaryHue = normalizeHue(hue + 22);
  const tertiaryHue = normalizeHue(hue + 64);
  const neutralHue = normalizeHue(hue + 5);
  const neutralChroma = clamp(0.01 + seed.saturation * 0.03, 0.012, 0.048);
  const variantChroma = clamp(0.024 + seed.saturation * 0.058, 0.034, 0.09);
  const lightNeutralChroma = clamp(neutralChroma * 1.35, 0.018, 0.065);
  const lightVariantChroma = clamp(variantChroma * 1.18, 0.044, 0.105);

  if (mode === "light") {
    return {
      "--m3-primary": oklch(48, chroma, hue),
      "--m3-on-primary": oklch(98, lightNeutralChroma, neutralHue),
      "--m3-primary-container": oklch(84, chroma * 0.72, hue),
      "--m3-on-primary-container": oklch(24, chroma * 0.55, hue),
      "--m3-secondary": oklch(47, chroma * 0.42, secondaryHue),
      "--m3-on-secondary": oklch(98, lightNeutralChroma, neutralHue),
      "--m3-secondary-container": oklch(84, chroma * 0.34, secondaryHue),
      "--m3-on-secondary-container": oklch(23, chroma * 0.36, secondaryHue),
      "--m3-tertiary": oklch(52, chroma * 0.56, tertiaryHue),
      "--m3-on-tertiary": oklch(98, lightNeutralChroma, neutralHue),
      "--m3-tertiary-container": oklch(86, chroma * 0.44, tertiaryHue),
      "--m3-on-tertiary-container": oklch(24, chroma * 0.48, tertiaryHue),
      "--m3-background": oklch(95, lightNeutralChroma, neutralHue),
      "--m3-on-background": oklch(18, lightNeutralChroma * 1.7, neutralHue),
      "--m3-surface": oklch(95, lightNeutralChroma, neutralHue),
      "--m3-surface-dim": oklch(84, lightNeutralChroma * 1.22, neutralHue),
      "--m3-surface-bright": oklch(96, lightNeutralChroma, neutralHue),
      "--m3-surface-variant": oklch(87, lightVariantChroma * 0.72, neutralHue),
      "--m3-surface-container": oklch(91, lightNeutralChroma * 1.32, neutralHue),
      "--m3-surface-container-lowest": oklch(98, lightNeutralChroma * 0.72, neutralHue),
      "--m3-surface-container-low": oklch(94, lightNeutralChroma * 1.12, neutralHue),
      "--m3-surface-container-high": oklch(88, lightNeutralChroma * 1.64, neutralHue),
      "--m3-surface-container-highest": oklch(84, lightNeutralChroma * 1.88, neutralHue),
      "--m3-on-surface": oklch(18, lightNeutralChroma * 1.7, neutralHue),
      "--m3-on-surface-variant": oklch(41, lightVariantChroma * 0.88, neutralHue),
      "--m3-outline": oklch(58, lightVariantChroma, neutralHue),
      "--m3-outline-variant": oklch(72, lightVariantChroma * 0.82, neutralHue),
      "--m3-inverse-surface": oklch(20, lightNeutralChroma * 1.6, neutralHue),
      "--m3-inverse-on-surface": oklch(94, lightNeutralChroma, neutralHue),
      "--m3-inverse-primary": oklch(78, chroma, hue),
      "--m3-scrim": oklch(0, 0, neutralHue),
      "--m3-shadow": oklch(34, lightVariantChroma, neutralHue, 0.2),
      "--m3-error": oklch(50, 0.17, 28),
      "--m3-on-error": oklch(98, 0.012, 28),
      "--m3-error-container": oklch(88, 0.095, 28),
      "--m3-on-error-container": oklch(22, 0.12, 28),
      "--m3-warning": oklch(53, 0.13, 82),
      "--m3-on-warning": oklch(98, 0.012, 82),
      "--m3-warning-container": oklch(88, 0.085, 82),
      "--m3-on-warning-container": oklch(24, 0.1, 82),
      "--m3-info": oklch(48, 0.12, normalizeHue(hue - 84)),
      "--m3-on-info": oklch(98, lightNeutralChroma, neutralHue),
      "--m3-info-container": oklch(86, 0.082, normalizeHue(hue - 84)),
      "--m3-on-info-container": oklch(24, 0.09, normalizeHue(hue - 84)),
      "--m3-success": oklch(47, 0.14, 148),
      "--m3-on-success": oklch(98, 0.012, 148),
      "--m3-success-container": oklch(86, 0.095, 148),
      "--m3-on-success-container": oklch(23, 0.1, 148),
      "--m3-tertiary-strong": oklch(44, chroma * 0.7, tertiaryHue),
      "--body-bg": gradient(180, oklch(96, lightNeutralChroma, neutralHue), oklch(87, chroma * 0.17, hue)),
      "--topbar-bg": gradient(90, oklch(95, lightNeutralChroma, neutralHue, 0.98), oklch(89, chroma * 0.2, hue, 0.96)),
      "--control-bg": oklch(94, lightNeutralChroma, neutralHue),
      "--control-hover-bg": oklch(87, chroma * 0.3, hue),
      "--chip-bg": oklch(94, lightNeutralChroma, neutralHue, 0.84),
      "--pane-bg": gradient(180, oklch(95, lightNeutralChroma, neutralHue, 0.98), oklch(88, chroma * 0.15, hue, 0.97)),
      "--drop-bg": gradient(135, oklch(94, lightNeutralChroma + 0.006, neutralHue), oklch(87, chroma * 0.22, hue)),
      "--drag-bg": oklch(86, chroma * 0.32, hue),
      "--quiet-bg": oklch(92, chroma * 0.075, hue),
      "--segment-bg": oklch(92, chroma * 0.072, hue),
      "--segment-active-bg": oklch(80, chroma * 0.54, hue),
      "--canvas-bg": repeatingGrid(oklch(85, lightNeutralChroma + 0.008, neutralHue), oklch(91, lightNeutralChroma, neutralHue)),
      "--canvas-ring": oklch(45, chroma * 0.68, hue, 0.1),
      "--canvas-glow": oklch(53, chroma * 0.74, hue, 0.13),
      "--accent-glow": oklch(53, chroma * 0.82, hue, 0.3),
      "--scanline": oklch(42, chroma * 0.7, hue, 0.055),
      "--timeline-bg": oklch(92, lightNeutralChroma, neutralHue, 0.94),
      "--effect-bg": oklch(92, chroma * 0.075, hue),
      "--matrix-col": oklch(43, chroma * 0.78, hue, 0.11),
      "--matrix-row": oklch(36, chroma * 0.86, hue, 0.065),
    };
  }

  return {
    "--m3-primary": oklch(78, chroma, hue),
    "--m3-on-primary": oklch(12, neutralChroma, neutralHue),
    "--m3-primary-container": oklch(24, chroma * 0.58, hue),
    "--m3-on-primary-container": oklch(86, chroma * 0.86, hue),
    "--m3-secondary": oklch(76, chroma * 0.42, secondaryHue),
    "--m3-on-secondary": oklch(14, neutralChroma, neutralHue),
    "--m3-secondary-container": oklch(28, chroma * 0.24, secondaryHue),
    "--m3-on-secondary-container": oklch(88, chroma * 0.32, secondaryHue),
    "--m3-tertiary": oklch(72, chroma * 0.58, tertiaryHue),
    "--m3-on-tertiary": oklch(13, neutralChroma, neutralHue),
    "--m3-tertiary-container": oklch(30, chroma * 0.36, tertiaryHue),
    "--m3-on-tertiary-container": oklch(88, chroma * 0.42, tertiaryHue),
    "--m3-background": oklch(9, neutralChroma, neutralHue),
    "--m3-on-background": oklch(91, neutralChroma * 1.75, neutralHue),
    "--m3-surface": oklch(9, neutralChroma, neutralHue),
    "--m3-surface-dim": oklch(9, neutralChroma, neutralHue),
    "--m3-surface-bright": oklch(24, neutralChroma * 1.5, neutralHue),
    "--m3-surface-variant": oklch(30, variantChroma * 0.74, neutralHue),
    "--m3-surface-container": oklch(12, neutralChroma * 1.25, neutralHue),
    "--m3-surface-container-lowest": oklch(4, neutralChroma * 0.7, neutralHue),
    "--m3-surface-container-low": oklch(10, neutralChroma, neutralHue),
    "--m3-surface-container-high": oklch(16, neutralChroma * 1.55, neutralHue),
    "--m3-surface-container-highest": oklch(22, neutralChroma * 1.75, neutralHue),
    "--m3-on-surface": oklch(91, neutralChroma * 1.75, neutralHue),
    "--m3-on-surface-variant": oklch(69, variantChroma * 0.78, neutralHue),
    "--m3-outline": oklch(37, variantChroma, neutralHue),
    "--m3-outline-variant": oklch(29, variantChroma * 0.76, neutralHue),
    "--m3-inverse-surface": oklch(90, neutralChroma, neutralHue),
    "--m3-inverse-on-surface": oklch(20, neutralChroma * 1.6, neutralHue),
    "--m3-inverse-primary": oklch(48, chroma, hue),
    "--m3-scrim": oklch(0, 0, neutralHue),
    "--m3-shadow": oklch(4, neutralChroma, neutralHue, 0.42),
    "--m3-error": oklch(65, 0.2, 28),
    "--m3-on-error": oklch(16, 0.07, 28),
    "--m3-error-container": oklch(30, 0.14, 28),
    "--m3-on-error-container": oklch(88, 0.08, 28),
    "--m3-warning": oklch(80, 0.16, 82),
    "--m3-on-warning": oklch(17, 0.06, 82),
    "--m3-warning-container": oklch(32, 0.1, 82),
    "--m3-on-warning-container": oklch(88, 0.08, 82),
    "--m3-info": oklch(78, 0.14, normalizeHue(hue - 84)),
    "--m3-on-info": oklch(15, neutralChroma, neutralHue),
    "--m3-info-container": oklch(30, 0.09, normalizeHue(hue - 84)),
    "--m3-on-info-container": oklch(88, 0.08, normalizeHue(hue - 84)),
    "--m3-success": oklch(78, 0.16, 148),
    "--m3-on-success": oklch(15, 0.04, 148),
    "--m3-success-container": oklch(30, 0.1, 148),
    "--m3-on-success-container": oklch(88, 0.08, 148),
    "--m3-tertiary-strong": oklch(76, chroma * 0.72, tertiaryHue),
    "--body-bg": gradient(180, oklch(10, neutralChroma + 0.004, neutralHue), oklch(7.5, chroma * 0.075, hue)),
    "--topbar-bg": gradient(90, oklch(13, neutralChroma + 0.012, neutralHue, 0.96), oklch(11, chroma * 0.095, hue, 0.94)),
    "--control-bg": oklch(13.5, neutralChroma + 0.004, neutralHue),
    "--control-hover-bg": oklch(19, chroma * 0.28, hue),
    "--chip-bg": oklch(10, neutralChroma, neutralHue, 0.76),
    "--pane-bg": gradient(180, oklch(15, neutralChroma + 0.01, neutralHue, 0.96), oklch(10.5, chroma * 0.085, hue, 0.98)),
    "--drop-bg": gradient(135, oklch(15, neutralChroma + 0.016, neutralHue), oklch(12.5, chroma * 0.12, hue)),
    "--drag-bg": oklch(17, chroma * 0.3, hue),
    "--quiet-bg": oklch(12, chroma * 0.052, hue),
    "--segment-bg": oklch(12, chroma * 0.048, hue),
    "--segment-active-bg": oklch(24, chroma * 0.5, hue),
    "--canvas-bg": repeatingGrid(oklch(8, neutralChroma, neutralHue), oklch(10, neutralChroma, neutralHue)),
    "--canvas-ring": oklch(82, chroma * 0.78, hue, 0.05),
    "--canvas-glow": oklch(70, chroma * 0.86, hue, 0.05),
    "--accent-glow": oklch(72, chroma * 0.9, hue, 0.38),
    "--scanline": oklch(80, chroma * 0.78, hue, 0.04),
    "--timeline-bg": oklch(12, neutralChroma, neutralHue, 0.9),
    "--effect-bg": oklch(12.5, chroma * 0.048, hue),
    "--matrix-col": oklch(54, chroma * 0.66, hue, 0.1),
    "--matrix-row": oklch(84, chroma * 0.98, hue, 0.046),
  };
}

function applyDynamicThemeRoles(seed) {
  const mode = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const roles = buildMaterialTheme(seed, mode);
  const materialAliases = buildMaterialWebAliases(roles);
  const mapped = {
    "--bg": roles["--m3-surface"],
    "--bg-2": roles["--m3-surface-container"],
    "--panel": roles["--m3-surface-container-high"],
    "--panel-2": roles["--m3-primary-container"],
    "--line": mode === "light" ? oklch(63, 0.09, seed.hue, 0.78) : roles["--m3-outline"],
    "--line-dim": roles["--m3-outline-variant"],
    "--text": roles["--m3-on-surface"],
    "--muted": roles["--m3-on-surface-variant"],
    "--faint": mode === "light" ? oklch(58, 0.035, seed.hue) : oklch(50, 0.04, seed.hue),
    "--green": roles["--m3-primary"],
    "--green-strong": mode === "light" ? roles["--m3-on-primary-container"] : roles["--m3-on-primary-container"],
    "--amber": roles["--m3-warning"],
    "--red": roles["--m3-error"],
    "--cyan": roles["--m3-info"],
    "--magenta": roles["--m3-tertiary"],
    "--surface-shadow": `0 16px ${mode === "light" ? 50 : 60}px ${roles["--m3-shadow"]}`,
  };
  const spriteVars = mode === "light"
    ? {
        "--wizard-px-outline": `color-mix(in oklch, ${roles["--m3-scrim"]}, ${roles["--m3-primary"]} 14%)`,
        "--wizard-px-void": `color-mix(in oklch, ${roles["--m3-scrim"]}, ${roles["--m3-surface"]} 4%)`,
        "--wizard-px-robe-shadow": `color-mix(in oklch, ${roles["--m3-primary"]}, ${roles["--m3-scrim"]} 46%)`,
        "--wizard-px-robe-dark": `color-mix(in oklch, ${roles["--m3-primary"]}, ${roles["--m3-scrim"]} 24%)`,
        "--wizard-px-robe-mid": `color-mix(in oklch, ${roles["--m3-primary"]}, ${roles["--m3-secondary"]} 28%)`,
        "--wizard-px-robe-light": `color-mix(in oklch, ${roles["--m3-primary-container"]}, ${roles["--m3-primary"]} 46%)`,
        "--wizard-px-gold-shadow": `color-mix(in oklch, ${roles["--m3-warning"]}, ${roles["--m3-scrim"]} 38%)`,
        "--wizard-px-gold": roles["--m3-warning"],
        "--wizard-px-gold-light": `color-mix(in oklch, ${roles["--m3-warning-container"]}, ${roles["--m3-on-warning-container"]} 28%)`,
        "--wizard-px-purple-shadow": `color-mix(in oklch, ${roles["--m3-tertiary"]}, ${roles["--m3-scrim"]} 38%)`,
        "--wizard-px-purple": roles["--m3-tertiary"],
        "--wizard-px-purple-light": `color-mix(in oklch, ${roles["--m3-tertiary-container"]}, ${roles["--m3-tertiary"]} 38%)`,
        "--wizard-px-staff-dark": `color-mix(in oklch, ${roles["--m3-warning"]}, ${roles["--m3-scrim"]} 58%)`,
        "--wizard-px-staff-mid": `color-mix(in oklch, ${roles["--m3-warning"]}, ${roles["--m3-surface"]} 28%)`,
        "--wizard-px-staff-gold": roles["--m3-warning"],
        "--wizard-px-highlight": `color-mix(in oklch, ${roles["--m3-on-surface"]}, white 36%)`,
        "--wizard-px-spell-shadow": `color-mix(in oklch, ${roles["--m3-tertiary"]}, ${roles["--m3-scrim"]} 34%)`,
        "--wizard-px-spell": roles["--m3-tertiary"],
        "--wizard-px-spell-core": `color-mix(in oklch, ${roles["--m3-tertiary-container"]}, white 36%)`,
      }
    : {
        "--wizard-px-outline": `color-mix(in oklch, ${roles["--m3-scrim"]}, ${roles["--m3-primary"]} 10%)`,
        "--wizard-px-void": `color-mix(in oklch, ${roles["--m3-scrim"]}, ${roles["--m3-surface"]} 6%)`,
        "--wizard-px-robe-shadow": `color-mix(in oklch, ${roles["--m3-primary-container"]}, ${roles["--m3-scrim"]} 64%)`,
        "--wizard-px-robe-dark": `color-mix(in oklch, ${roles["--m3-primary-container"]}, ${roles["--m3-scrim"]} 42%)`,
        "--wizard-px-robe-mid": `color-mix(in oklch, ${roles["--m3-primary"]}, ${roles["--m3-secondary-container"]} 44%)`,
        "--wizard-px-robe-light": `color-mix(in oklch, ${roles["--m3-on-primary-container"]}, ${roles["--m3-secondary"]} 34%)`,
        "--wizard-px-gold-shadow": `color-mix(in oklch, ${roles["--m3-warning-container"]}, ${roles["--m3-scrim"]} 48%)`,
        "--wizard-px-gold": roles["--m3-warning"],
        "--wizard-px-gold-light": `color-mix(in oklch, ${roles["--m3-on-warning-container"]}, ${roles["--m3-warning"]} 45%)`,
        "--wizard-px-purple-shadow": `color-mix(in oklch, ${roles["--m3-tertiary-container"]}, ${roles["--m3-scrim"]} 42%)`,
        "--wizard-px-purple": roles["--m3-tertiary"],
        "--wizard-px-purple-light": `color-mix(in oklch, ${roles["--m3-on-tertiary-container"]}, ${roles["--m3-tertiary"]} 42%)`,
        "--wizard-px-staff-dark": `color-mix(in oklch, ${roles["--m3-warning-container"]}, ${roles["--m3-scrim"]} 70%)`,
        "--wizard-px-staff-mid": `color-mix(in oklch, ${roles["--m3-warning-container"]}, ${roles["--m3-surface"]} 18%)`,
        "--wizard-px-staff-gold": roles["--m3-warning"],
        "--wizard-px-highlight": `color-mix(in oklch, ${roles["--m3-on-surface"]}, ${roles["--m3-primary"]} 12%)`,
        "--wizard-px-spell-shadow": `color-mix(in oklch, ${roles["--m3-tertiary-container"]}, ${roles["--m3-scrim"]} 34%)`,
        "--wizard-px-spell": roles["--m3-tertiary"],
        "--wizard-px-spell-core": `color-mix(in oklch, ${roles["--m3-on-tertiary-container"]}, white 28%)`,
      };

  Object.entries({ ...roles, ...materialAliases, ...mapped, ...spriteVars }).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
  });
}

function extractArtworkSeed(canvas) {
  const sampleSize = 52;
  themeCanvas.width = sampleSize;
  themeCanvas.height = sampleSize;
  themeCtx.clearRect(0, 0, sampleSize, sampleSize);
  themeCtx.drawImage(canvas, 0, 0, sampleSize, sampleSize);
  const pixels = themeCtx.getImageData(0, 0, sampleSize, sampleSize).data;
  const buckets = Array.from({ length: 36 }, () => ({ weight: 0, r: 0, g: 0, b: 0, saturation: 0 }));

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;
    if (alpha < 0.25) continue;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const hsl = rgbToHsl(r, g, b);
    const contrastWeight = 1 - Math.min(0.85, Math.abs(hsl.lightness - 0.52) * 1.2);
    const colorWeight = 0.08 + Math.pow(hsl.saturation, 1.35) * 2.6;
    const weight = alpha * contrastWeight * colorWeight;
    const bucket = buckets[Math.floor(hsl.hue / 10) % buckets.length];
    bucket.weight += weight;
    bucket.r += r * weight;
    bucket.g += g * weight;
    bucket.b += b * weight;
    bucket.saturation += hsl.saturation * weight;
  }

  let winner = buckets[0];
  for (const bucket of buckets) {
    if (bucket.weight > winner.weight) winner = bucket;
  }

  if (!winner || winner.weight <= 0.01) return { hue: 148, saturation: 0.78, rgb: [95, 210, 104] };
  const rgb = [
    clamp(Math.round(winner.r / winner.weight), 0, 255),
    clamp(Math.round(winner.g / winner.weight), 0, 255),
    clamp(Math.round(winner.b / winner.weight), 0, 255),
  ];
  const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  return {
    hue: hsl.hue,
    saturation: clamp01(Math.max(hsl.saturation, winner.saturation / winner.weight)),
    rgb,
  };
}

function blendSeeds(base, overlay, amount) {
  return {
    hue: mixHue(base.hue, overlay.hue, amount),
    saturation: clamp01(lerp(base.saturation, overlay.saturation, amount)),
    rgb: base.rgb.map((value, index) => Math.round(lerp(value, overlay.rgb[index], amount))),
  };
}

function applyThemeSeed(seed, force = false, smoothing = 0.28) {
  let nextSeed = seed;
  if (state.themeSeed && !force) {
    nextSeed = blendSeeds(state.themeSeed, seed, smoothing);
  }
  const shouldApply =
    !state.themeSeed ||
    force ||
    hueDistance(state.themeSeed.hue, nextSeed.hue) > 1 ||
    Math.abs(state.themeSeed.saturation - nextSeed.saturation) > 0.012;
  state.themeSeed = nextSeed;
  state.lastThemeAt = performance.now();
  if (shouldApply) applyDynamicThemeRoles(nextSeed);
}

function updateDynamicThemeFromCanvas(canvas, force = false, options = {}) {
  const now = performance.now();
  const minInterval = options.minInterval ?? (state.playing ? ANIMATED_THEME_INTERVAL : IDLE_THEME_INTERVAL);
  if (!force && now - state.lastThemeAt < minInterval) return;
  if (!options.source && !state.editThemeActive && !options.allowInactive) return;
  const sampledSeed = extractArtworkSeed(canvas);

  if (options.source) {
    state.sourceThemeSeed = sampledSeed;
    state.lastSourceThemeAt = now;
    if (options.resetEdit) {
      state.editThemeSeed = null;
      state.editThemeActive = false;
      state.lastEditThemeAt = 0;
      state.pendingSourceThemeReset = false;
    }
    applyThemeSeed(sampledSeed, true, 1);
    return;
  }

  state.editThemeSeed = sampledSeed;
  state.lastEditThemeAt = now;
  const sourceAnchor = options.sourceAnchor ?? 0.08;
  const seed = state.sourceThemeSeed ? blendSeeds(sampledSeed, state.sourceThemeSeed, sourceAnchor) : sampledSeed;
  applyThemeSeed(seed, force, options.smoothing ?? 0.42);
}

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hashNoise(x, y, t = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + t * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function setCanvasDimensions(canvas, width, height) {
  if (canvas.width === width && canvas.height === height) return;
  canvas.width = width;
  canvas.height = height;
}

function resizeCanvases(width, height) {
  [sourceCanvas, outputCanvas, workCanvas, pipelineCanvas].forEach((canvas) => {
    setCanvasDimensions(canvas, width, height);
  });
  els.dimensionsReadout.textContent = `${width}x${height}`;
  renderExportMetrics();
}

function resizeProcessingCanvases(width, height) {
  [workCanvas, pipelineCanvas].forEach((canvas) => {
    setCanvasDimensions(canvas, width, height);
  });
}

function resizePipelineCanvas(width, height) {
  setCanvasDimensions(pipelineCanvas, width, height);
}

function getRenderDimensions(forceFullQuality = false) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  if (forceFullQuality || state.isRecording || !state.playing) return { width, height, preview: false };

  const maxSide = Math.max(width, height);
  if (maxSide <= ANIMATED_PREVIEW_MAX_SIDE) return { width, height, preview: false };

  const scale = ANIMATED_PREVIEW_MAX_SIDE / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    preview: true,
  };
}

function fitDimensions(width, height, maxSide = Number.POSITIVE_INFINITY) {
  const longestSide = Math.max(width, height);
  const scale = Number.isFinite(maxSide) && longestSide > maxSide ? maxSide / longestSide : 1;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds || 0);
  const minutes = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const ms = Math.floor((safe % 1) * 1000);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "--";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  if (unit === 0) return `${Math.round(size)} ${units[unit]}`;
  return `${size >= 100 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function formatMegapixels(width, height) {
  const megapixels = (width * height) / 1000000;
  if (!Number.isFinite(megapixels) || megapixels <= 0) return "--";
  return `${megapixels < 1 ? megapixels.toFixed(1) : megapixels.toFixed(2)} MP`;
}

function formatFromName(name = "", mime = "") {
  const byMime = {
    "image/png": "PNG",
    "image/jpeg": "JPG",
    "image/webp": "WEBP",
    "image/gif": "GIF",
    "image/svg+xml": "SVG",
    "video/mp4": "MP4",
    "video/webm": "WEBM",
    "video/quicktime": "MOV",
  };
  if (byMime[mime]) return byMime[mime];
  const ext = String(name).split(".").pop()?.toLowerCase();
  const byExt = {
    jpeg: "JPG",
    jpg: "JPG",
    png: "PNG",
    webp: "WEBP",
    gif: "GIF",
    svg: "SVG",
    mp4: "MP4",
    webm: "WEBM",
    mov: "MOV",
  };
  return byExt[ext] || "PNG";
}

function exportNameFromSource(name = "dither-wizard") {
  const clean = String(name).split(/[\\/]/).pop() || "dither-wizard";
  const base = clean.replace(/\.[^.]+$/, "") || "dither-wizard";
  return `${base}.png`;
}

function exportFileBase() {
  return (state.exportSourceName || state.sourceName || "dither-wizard").replace(/\.[^.]+$/, "") || "dither-wizard";
}

function exportFilename(extension, suffix = "dithered") {
  const cleanExtension = String(extension).replace(/^\./, "");
  const cleanSuffix = suffix ? `-${suffix}` : "";
  return `${exportFileBase()}${cleanSuffix}.${cleanExtension}`;
}

function savePickerType(mimeType, extension, description) {
  return {
    description,
    accept: { [mimeType]: [`.${String(extension).replace(/^\./, "")}`] },
  };
}

function canPickSaveLocation() {
  return false;
}

async function chooseSaveTarget(filename, mimeType, extension, description) {
  if (!canPickSaveLocation()) return { handle: null, cancelled: false };
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [savePickerType(mimeType, extension, description)],
    });
    return { handle, cancelled: false };
  } catch (error) {
    if (error?.name === "AbortError") return { handle: null, cancelled: true };
    return { handle: null, cancelled: false };
  }
}

function setExportStatus(label, stateName = "ready", resetDelay = 0) {
  if (!els.exportStatus) return;
  if (exportStatusTimer) {
    clearTimeout(exportStatusTimer);
    exportStatusTimer = 0;
  }
  els.exportStatus.textContent = label;
  els.exportStatus.dataset.state = stateName;
  els.exportStatus.classList.toggle("is-recording", stateName === "recording");
  if (resetDelay) {
    exportStatusTimer = window.setTimeout(() => {
      exportStatusTimer = 0;
      if (!state.isRecording && !state.isExporting) setExportStatus("ready", "ready");
    }, resetDelay);
  }
}

function setExportButtonsDisabled(disabled) {
  [
    els.downloadGifButton,
    els.downloadPngButton,
    els.downloadJpgButton,
    els.downloadSvgButton,
    els.recordWebmButton,
    els.recordButton,
    els.exportPaletteButton,
  ].forEach((button) => {
    if (button) button.disabled = disabled;
  });
}

function setExportResult(blob, format) {
  if (!blob) return;
  state.exportTargetFormat = format;
  state.exportDitheredBytes = blob.size || null;
  renderExportMetrics();
}

function validateExportBlob(blob, label) {
  if (!blob || blob.size <= 0) {
    throw new Error(`${label} export produced an empty file`);
  }
  return blob;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas export failed"));
    }, type, quality);
  });
}

function clearLastExportLink() {
  if (lastExportUrl && lastExportUrl.startsWith("blob:")) {
    URL.revokeObjectURL(lastExportUrl);
    lastExportUrl = "";
  }
  lastExportUrl = "";
  if (!els.lastExportLink) return;
  els.lastExportLink.hidden = true;
  els.lastExportLink.removeAttribute("href");
  els.lastExportLink.removeAttribute("download");
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Could not prepare download"));
    reader.readAsDataURL(blob);
  });
}

async function setLastExportLink(blob, filename) {
  clearLastExportLink();
  if (!els.lastExportLink) return "";
  lastExportUrl = await blobToDataUrl(blob);
  els.lastExportLink.href = lastExportUrl;
  els.lastExportLink.download = filename;
  els.lastExportLink.textContent = `Download ${filename}`;
  els.lastExportLink.hidden = false;
  return lastExportUrl;
}

function setExportSource({ name, bytes = null, format = "PNG" }) {
  state.sourceMetricsRequest += 1;
  state.exportMetricsRequest += 1;
  if (exportMetricsTimer) {
    clearTimeout(exportMetricsTimer);
    exportMetricsTimer = 0;
  }
  state.exportSourceName = exportNameFromSource(name);
  state.exportSourceBytes = Number.isFinite(bytes) && bytes > 0 ? bytes : null;
  state.exportSourceFormat = format || "PNG";
  state.exportTargetFormat = "PNG";
  state.exportDitheredBytes = null;
  renderExportMetrics();
}

function estimateSourceBytesFromCanvas(name = state.exportSourceName, format = "PNG") {
  if (!sourceCanvas.width || !sourceCanvas.height) return;
  setExportSource({ name, format });
  const request = ++state.sourceMetricsRequest;
  sourceCanvas.toBlob((blob) => {
    if (request !== state.sourceMetricsRequest) return;
    state.exportSourceBytes = blob?.size || null;
    renderExportMetrics();
  }, "image/png");
}

function renderExportMetrics() {
  const width = outputCanvas.width || sourceCanvas.width || 0;
  const height = outputCanvas.height || sourceCanvas.height || 0;
  const sourceBytes = state.exportSourceBytes;
  const ditheredBytes = state.exportDitheredBytes;
  const hasBoth = Number.isFinite(sourceBytes) && sourceBytes > 0 && Number.isFinite(ditheredBytes) && ditheredBytes > 0;
  const ratio = hasBoth ? (ditheredBytes / sourceBytes) * 100 : 0;
  const delta = hasBoth ? sourceBytes - ditheredBytes : 0;
  const deltaType = !hasBoth ? "neutral" : delta >= 0 ? "saved" : "over";

  els.exportFileName.textContent = state.exportSourceName;
  els.originalSize.textContent = formatBytes(sourceBytes);
  els.ditheredSize.textContent = formatBytes(ditheredBytes);
  els.exportPercent.textContent = hasBoth ? `${ratio >= 100 ? Math.round(ratio) : ratio.toFixed(1)}%` : "--";
  els.fileSizeMeter.style.setProperty("--file-percent", `${Math.min(100, Math.max(0, ratio))}%`);
  els.fileSizeMeter.dataset.state = deltaType;
  els.exportDeltaLabel.textContent = deltaType === "over" ? "Over" : "Saved";
  els.savedSize.textContent = hasBoth ? formatBytes(Math.abs(delta)) : "--";
  els.savedSize.dataset.delta = deltaType;
  els.exportDimensions.textContent = width && height ? `${width}×${height}` : "--";
  els.exportMegapixels.textContent = width && height ? formatMegapixels(width, height) : "--";
  els.exportFormat.textContent = `${state.exportSourceFormat} → ${state.exportTargetFormat}`;
}

function scheduleExportMetrics(force = false) {
  if (!outputCanvas.width || !outputCanvas.height) return;
  const run = () => {
    exportMetricsTimer = 0;
    state.exportMetricsAt = performance.now();
    const request = ++state.exportMetricsRequest;
    state.exportTargetFormat = "PNG";
    outputCanvas.toBlob((blob) => {
      if (request !== state.exportMetricsRequest) return;
      state.exportDitheredBytes = blob?.size || null;
      renderExportMetrics();
    }, "image/png");
  };

  if (force) {
    if (exportMetricsTimer) {
      clearTimeout(exportMetricsTimer);
      exportMetricsTimer = 0;
    }
    run();
    return;
  }

  if (exportMetricsTimer) return;
  const delay = Math.max(0, 260 - (performance.now() - state.exportMetricsAt));
  exportMetricsTimer = window.setTimeout(run, delay);
}

function getPalette() {
  if (state.palette === "custom" && state.customPalette) return state.customPalette;
  return PALETTES[state.palette]?.colors || null;
}

function quantizeChannel(value, levels) {
  if (levels <= 1) return value < 128 ? 0 : 255;
  const step = 255 / (levels - 1);
  return Math.round(value / step) * step;
}

function nearestColor(r, g, b, palette, levels) {
  if (!palette) {
    return [
      quantizeChannel(r, levels),
      quantizeChannel(g, levels),
      quantizeChannel(b, levels),
    ];
  }

  let best = palette[0];
  let bestDistance = Infinity;
  for (const color of palette) {
    const dr = r - color[0];
    const dg = g - color[1];
    const db = b - color[2];
    const distance = dr * dr + dg * dg + db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = color;
    }
  }
  return best;
}

function monoColor(r, g, b, palette, levels, threshold = 128) {
  const luma = luminance(r, g, b);
  if (palette && palette.length > 1) {
    const sorted = getLuminanceSortedPalette(palette);
    const index = Math.round(clamp(luma / 255, 0, 1) * (sorted.length - 1));
    return sorted[index];
  }
  const value = luma >= threshold ? 255 : 0;
  return [value, value, value];
}

function getLuminanceSortedPalette(palette) {
  let sorted = luminanceSortedPaletteCache.get(palette);
  if (!sorted) {
    sorted = [...palette].sort((a, bColor) => luminance(a[0], a[1], a[2]) - luminance(bColor[0], bColor[1], bColor[2]));
    luminanceSortedPaletteCache.set(palette, sorted);
  }
  return sorted;
}

function applyBaseAdjustments(data, width, height, time) {
  const contrast = (259 * (state.settings.contrast + 255)) / (255 * (259 - state.settings.contrast));
  const brightness = state.settings.brightness;
  const gamma = state.settings.gamma || 1;
  const noiseAmount = state.settings.noise * 1.55;
  const temporal = state.settings.temporal / 100;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const pulse = Math.sin(time * 2.4 + x * 0.012 + y * 0.017) * 10 * temporal;
      const grain = (hashNoise(x, y, time) - 0.5) * noiseAmount;
      for (let c = 0; c < 3; c++) {
        let value = data[i + c];
        value = contrast * (value - 128) + 128 + brightness + grain + pulse;
        value = 255 * Math.pow(clamp(value) / 255, 1 / gamma);
        data[i + c] = clamp(value);
      }
    }
  }
}

function pixelateSource() {
  const cell = state.settings.cell;
  workCtx.imageSmoothingEnabled = false;
  workCtx.clearRect(0, 0, workCanvas.width, workCanvas.height);
  if (cell <= 1) {
    workCtx.drawImage(sourceCanvas, 0, 0);
    return;
  }
  const smallW = Math.max(1, Math.round(workCanvas.width / cell));
  const smallH = Math.max(1, Math.round(workCanvas.height / cell));
  setCanvasDimensions(pipelineCanvas, smallW, smallH);
  pipelineCtx.imageSmoothingEnabled = true;
  pipelineCtx.clearRect(0, 0, smallW, smallH);
  pipelineCtx.drawImage(sourceCanvas, 0, 0, smallW, smallH);
  workCtx.drawImage(pipelineCanvas, 0, 0, smallW, smallH, 0, 0, workCanvas.width, workCanvas.height);
  setCanvasDimensions(pipelineCanvas, workCanvas.width, workCanvas.height);
}

function ditherErrorDiffusion(imageData, algorithm) {
  const { width, height, data } = imageData;
  const kernel = ERROR_KERNELS[algorithm.id] || ERROR_KERNELS["floyd-steinberg"];
  if (errorDiffusionBuffer.length < data.length) {
    errorDiffusionBuffer = new Float32Array(data.length);
  }
  const buffer = errorDiffusionBuffer.subarray(0, data.length);
  for (let i = 0; i < data.length; i++) buffer[i] = data[i];
  const palette = getPalette();
  const levels = state.settings.levels;

  for (let y = 0; y < height; y++) {
    const serpentine = algorithm.id === "two-stage" && y % 2 === 1;
    const xStart = serpentine ? width - 1 : 0;
    const xEnd = serpentine ? -1 : width;
    const xStep = serpentine ? -1 : 1;
    for (let x = xStart; x !== xEnd; x += xStep) {
      const i = (y * width + x) * 4;
      const oldR = buffer[i];
      const oldG = buffer[i + 1];
      const oldB = buffer[i + 2];
      const next = nearestColor(oldR, oldG, oldB, palette, levels);
      data[i] = next[0];
      data[i + 1] = next[1];
      data[i + 2] = next[2];
      const errR = oldR - next[0];
      const errG = oldG - next[1];
      const errB = oldB - next[2];
      for (const [kx, ky, amount] of kernel) {
        const nx = x + (serpentine ? -kx : kx);
        const ny = y + ky;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const ni = (ny * width + nx) * 4;
        buffer[ni] += errR * amount;
        buffer[ni + 1] += errG * amount;
        buffer[ni + 2] += errB * amount;
      }
    }
  }
}

function ditherOrdered(imageData, algorithm, time) {
  const { width, height, data } = imageData;
  const matrix = ORDERED_MATRICES[algorithm.id] || ORDERED_MATRICES["bayer-4"];
  const size = matrix.length;
  const max = size * size;
  const palette = getPalette();
  const levels = state.settings.levels;
  const intensity = 40 + state.settings.temporal * 0.18;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const driftX = algorithm.id === "blue-noise" ? Math.floor(time * 12) : 0;
      const threshold = ((matrix[y % size][(x + driftX) % size] + 0.5) / max - 0.5) * intensity;
      const next = nearestColor(data[i] + threshold, data[i + 1] + threshold, data[i + 2] + threshold, palette, levels);
      data[i] = next[0];
      data[i + 1] = next[1];
      data[i + 2] = next[2];
    }
  }
}

function patternThreshold(id, x, y, luma, time) {
  const cell = Math.max(3, state.settings.cell * 3);
  const phase = Math.floor(time * (2 + state.settings.temporal / 24));
  if (id === "vertical-hatch") return ((x + phase) % cell) / cell;
  if (id === "horizontal-hatch") return ((y + phase) % cell) / cell;
  if (id === "diagonal-hatch") return ((x + y + phase) % cell) / cell;
  if (id === "crosshatch") return Math.min(((x + y + phase) % cell) / cell, ((x - y + cell * 20 - phase) % cell) / cell);
  if (id === "gridline") return Math.min((x % cell) / cell, (y % cell) / cell);
  if (id === "dot-field") {
    const cx = (x % cell) - cell / 2;
    const cy = (y % cell) - cell / 2;
    return Math.sqrt(cx * cx + cy * cy) / (cell * 0.7);
  }
  if (id === "slash-weave") return Math.abs(((x * 0.7 + y * 1.3 + phase) % cell) / cell - 0.5) * 2;
  if (id === "pixel-rain") return hashNoise(Math.floor(x / cell), Math.floor((y + phase * 4) / cell), time);
  return luma / 255;
}

function ditherPattern(imageData, algorithm, time) {
  const { width, height, data } = imageData;
  const palette = getPalette();
  const levels = state.settings.levels;
  const gate = state.settings.threshold;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const luma = luminance(data[i], data[i + 1], data[i + 2]);
      const pattern = patternThreshold(algorithm.id, x, y, luma, time);
      const lift = (pattern - 0.5) * 96;
      const next = luma + lift > gate
        ? nearestColor(data[i] + lift, data[i + 1] + lift, data[i + 2] + lift, palette, levels)
        : monoColor(data[i] - lift, data[i + 1] - lift, data[i + 2] - lift, palette, levels, gate);
      data[i] = next[0];
      data[i + 1] = next[1];
      data[i + 2] = next[2];
    }
  }
}

function sample(src, width, height, x, y, channel) {
  const sx = clamp(Math.round(x), 0, width - 1);
  const sy = clamp(Math.round(y), 0, height - 1);
  return src[(sy * width + sx) * 4 + channel];
}

function applyGlitchField(imageData, algorithm, time) {
  const { width, height, data } = imageData;
  const src = new Uint8ClampedArray(data);
  const amount = 1 + state.settings.temporal / 20;
  const block = Math.max(4, state.settings.cell * 7);

  for (let y = 0; y < height; y++) {
    const scan = Math.sin(y * 0.08 + time * 4) * amount * 2;
    const tear = Math.floor(hashNoise(0, Math.floor(y / block), time) * amount * 5);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let sx = x;
      let sy = y;

      if (algorithm.id === "jpeg-glitch") sx += Math.floor((hashNoise(Math.floor(x / block), Math.floor(y / block), time) - 0.5) * block * amount);
      if (algorithm.id === "datamosh-smear") sx -= Math.floor((hashNoise(8, Math.floor(y / block), time) * block * amount) % Math.max(1, x + 1));
      if (algorithm.id === "scanline-split") sx += y % 6 < 2 ? scan * 4 : 0;
      if (algorithm.id === "wave-fold") sx += Math.sin(y * 0.045 + time * 3) * amount * 6;
      if (algorithm.id === "poster-tear") sx += tear * (y % block);
      if (algorithm.id === "pixel-sort") sx = Math.floor(x / block) * block + ((x + Math.floor(luminance(src[i], src[i + 1], src[i + 2]) / 10)) % block);
      if (algorithm.id === "crt-warp") {
        const nx = x / width - 0.5;
        const ny = y / height - 0.5;
        const warp = 1 + (nx * nx + ny * ny) * 0.18;
        sx = (nx * warp + 0.5) * width;
        sy = (ny * warp + 0.5) * height;
      }
      if (algorithm.id === "column-drift") sx += Math.sin(Math.floor(x / block) + time * 2) * amount * 5;
      if (algorithm.id === "block-shuffle") sx += Math.floor((hashNoise(Math.floor(x / block), Math.floor(y / block), 2) - 0.5) * block);
      if (algorithm.id === "frame-echo") sx = lerp(x, x + Math.sin(time + y * 0.02) * 20, 0.3);
      if (algorithm.id === "phase-tear") sx += Math.tan(Math.sin(y * 0.015 + time)) * amount * 2;
      if (algorithm.id === "magnetic-bleed") sy += Math.sin(x * 0.03 + time * 4) * amount * 2;
      if (algorithm.id === "byte-offset") sx += (x ^ y ^ Math.floor(time * 24)) % Math.round(amount * 7);
      if (algorithm.id === "signal-noise") {
        const n = (hashNoise(x, y, time) - 0.5) * 140 * (state.settings.noise / 100 + 0.2);
        data[i] = clamp(src[i] + n);
        data[i + 1] = clamp(src[i + 1] + n);
        data[i + 2] = clamp(src[i + 2] + n);
        continue;
      }

      if (algorithm.id === "chromatic-aberration" || algorithm.id === "rgb-channel-drift") {
        const split = amount * (algorithm.id === "rgb-channel-drift" ? 5 : 2.5);
        data[i] = sample(src, width, height, sx + split, sy, 0);
        data[i + 1] = sample(src, width, height, sx, sy + split * 0.35, 1);
        data[i + 2] = sample(src, width, height, sx - split, sy, 2);
      } else if (algorithm.id === "bitplane-crush") {
        const mask = 255 << Math.floor(1 + state.settings.temporal / 18);
        data[i] = src[i] & mask;
        data[i + 1] = src[i + 1] & mask;
        data[i + 2] = src[i + 2] & mask;
      } else {
        data[i] = sample(src, width, height, sx, sy, 0);
        data[i + 1] = sample(src, width, height, sx, sy, 1);
        data[i + 2] = sample(src, width, height, sx, sy, 2);
      }
    }
  }
  ditherOrdered(imageData, { id: "blue-noise" }, time);
}

function applySpecial(imageData, algorithm, time) {
  const { width, height, data } = imageData;
  let palette = getPalette();
  if (!palette && algorithm.id === "thermal-map") palette = PALETTES.heat.colors;
  if (!palette && algorithm.id === "infrared") palette = PALETTES.riso.colors;
  const levels = state.settings.levels;
  const centerX = width / 2;
  const centerY = height / 2;
  const gate = state.settings.threshold;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const luma = luminance(data[i], data[i + 1], data[i + 2]);
      let mod = 0;
      const cell = Math.max(3, state.settings.cell * 4);

      if (algorithm.id === "epsilon-glow") mod = edgeEstimate(data, width, height, x, y) * 0.6;
      if (algorithm.id === "cmyk-halftone") mod = cmykDot(x, y, data[i], data[i + 1], data[i + 2], cell);
      if (algorithm.id === "newsprint") mod = Math.sin((x + y) / cell) * 42 + Math.cos((x - y) / cell) * 22;
      if (algorithm.id === "riso-grain") mod = (hashNoise(x, y, time) - 0.5) * 86;
      if (algorithm.id === "vector-hatch") mod = Math.abs(((x + y) % cell) - cell / 2) < (cell * (1 - luma / 255)) / 2 ? 60 : -30;
      if (algorithm.id === "embroidery-satin") mod = Math.sin((x * 0.8 + y * 0.2) / cell * Math.PI) * 70;
      if (algorithm.id === "ascii-tone") mod = asciiCell(x, y, luma, cell);
      if (algorithm.id === "contour-lines") mod = Math.abs((luma + time * 10) % 38 - 19) < 4 ? 92 : -22;
      if (algorithm.id === "radial-halftone") {
        const distance = Math.hypot(x - centerX, y - centerY);
        mod = Math.sin(distance / cell * Math.PI + time) * 64;
      }
      if (algorithm.id === "threshold-bloom") mod = luma > gate ? 80 : -20;
      if (algorithm.id === "edge-pulse") mod = edgeEstimate(data, width, height, x, y) * (0.5 + Math.sin(time * 3) * 0.4);
      if (algorithm.id === "thermal-map") {
        const heat = clamp(luma + Math.sin(x * 0.02 + time) * 30);
        data[i] = clamp(heat * 1.2);
        data[i + 1] = clamp(Math.max(0, heat - 80) * 1.7);
        data[i + 2] = clamp(255 - heat);
      }
      if (algorithm.id === "infrared") {
        data[i] = clamp(data[i] * 1.3 + 40);
        data[i + 1] = clamp(data[i + 1] * 0.5);
        data[i + 2] = clamp(255 - data[i + 2] * 0.7);
      }
      if (algorithm.id === "luma-slice") mod = Math.floor(luma / 32) % 2 === 0 ? 52 : -52;
      if (algorithm.id === "ink-spread") mod = edgeEstimate(data, width, height, x, y) > 30 ? 70 : hashNoise(x, y, time) * -30;
      if (algorithm.id === "silk-screen") mod = Math.sin(x / cell) * 35 + Math.sin(y / cell) * 35;

      const next = nearestColor(data[i] + mod, data[i + 1] + mod, data[i + 2] + mod, palette, levels);
      data[i] = next[0];
      data[i + 1] = next[1];
      data[i + 2] = next[2];
    }
  }

}

function applyTemporal(imageData, algorithm, time) {
  const { width, height, data } = imageData;
  const src = new Uint8ClampedArray(data);
  const amount = state.settings.temporal / 100;
  const palette = getPalette();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const wave = algorithm.id === "temporal-pulse"
        ? Math.sin(time * 4 + Math.hypot(x - width / 2, y - height / 2) * 0.025)
        : Math.sin(time * 3 + x * 0.025) + Math.cos(time * 2 + y * 0.02);
      const shift = wave * amount * 70;
      const sx = algorithm.id === "temporal-drift" ? x + wave * amount * 16 : x;
      data[i] = sample(src, width, height, sx, y, 0);
      data[i + 1] = sample(src, width, height, sx - wave * 2, y, 1);
      data[i + 2] = sample(src, width, height, sx + wave * 2, y, 2);
      const next = nearestColor(data[i] + shift, data[i + 1] + shift, data[i + 2] + shift, palette, state.settings.levels);
      data[i] = next[0];
      data[i + 1] = next[1];
      data[i + 2] = next[2];
    }
  }
}

function edgeEstimate(data, width, height, x, y) {
  const i = (y * width + x) * 4;
  const x2 = Math.min(width - 1, x + 1);
  const y2 = Math.min(height - 1, y + 1);
  const ix = (y * width + x2) * 4;
  const iy = (y2 * width + x) * 4;
  const here = luminance(data[i], data[i + 1], data[i + 2]);
  const dx = Math.abs(here - luminance(data[ix], data[ix + 1], data[ix + 2]));
  const dy = Math.abs(here - luminance(data[iy], data[iy + 1], data[iy + 2]));
  return dx + dy;
}

function cmykDot(x, y, r, g, b, cell) {
  const c = 1 - r / 255;
  const m = 1 - g / 255;
  const yy = 1 - b / 255;
  const k = Math.min(c, m, yy);
  const plate = c * Math.sin((x + y) / cell) + m * Math.sin((x - y) / cell) + yy * Math.cos(y / cell) + k * Math.cos(x / cell);
  return plate * 52;
}

function asciiCell(x, y, luma, cell) {
  const localX = x % cell;
  const localY = y % cell;
  const tone = luma / 255;
  if (tone < 0.25) return localX === localY || localX + localY === cell - 1 ? 70 : -60;
  if (tone < 0.5) return localX < cell * 0.25 || localY > cell * 0.72 ? 50 : -30;
  if (tone < 0.75) return localY < cell * 0.2 ? 40 : -20;
  return localX > cell * 0.75 && localY < cell * 0.25 ? 20 : 0;
}

function applyAlgorithm(imageData, time) {
  const algorithm = ALGORITHMS.find((item) => item.id === state.algorithm) || ALGORITHMS[0];
  if (algorithm.type === "error") ditherErrorDiffusion(imageData, algorithm);
  if (algorithm.type === "ordered") ditherOrdered(imageData, algorithm, time);
  if (algorithm.type === "pattern") ditherPattern(imageData, algorithm, time);
  if (algorithm.type === "glitch") applyGlitchField(imageData, algorithm, time);
  if (algorithm.type === "special") applySpecial(imageData, algorithm, time);
  if (algorithm.type === "temporal") applyTemporal(imageData, algorithm, time);
}

function applyDataEffect(imageData, effect, time) {
  const { width, height, data } = imageData;
  const strength = effect.strength / 100;
  if (!effect.enabled) return;
  if (effect.id === "noise") {
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width;
      const y = Math.floor(i / 4 / width);
      const n = (hashNoise(x, y, time) - 0.5) * 150 * strength;
      data[i] = clamp(data[i] + n);
      data[i + 1] = clamp(data[i + 1] + n);
      data[i + 2] = clamp(data[i + 2] + n);
    }
  }
  if (effect.id === "scanlines") {
    const period = Math.max(2, Math.round(6 - strength * 4));
    for (let y = 0; y < height; y++) {
      if (y % period !== 0) continue;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        data[i] *= 1 - strength * 0.55;
        data[i + 1] *= 1 - strength * 0.55;
        data[i + 2] *= 1 - strength * 0.55;
      }
    }
  }
  if (effect.id === "posterize" || effect.id === "bit-crush") {
    const levels = effect.id === "bit-crush" ? Math.max(2, Math.round(8 - strength * 6)) : Math.max(2, Math.round(14 - strength * 10));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = quantizeChannel(data[i], levels);
      data[i + 1] = quantizeChannel(data[i + 1], levels);
      data[i + 2] = quantizeChannel(data[i + 2], levels);
    }
  }
  if (effect.id === "invert") {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = lerp(data[i], 255 - data[i], strength);
      data[i + 1] = lerp(data[i + 1], 255 - data[i + 1], strength);
      data[i + 2] = lerp(data[i + 2], 255 - data[i + 2], strength);
    }
  }
  if (effect.id === "jpeg-glitch") {
    const src = new Uint8ClampedArray(data);
    const block = Math.max(8, Math.round(32 - strength * 20));
    for (let y = 0; y < height; y++) {
      const rowShift = Math.floor((hashNoise(9, Math.floor(y / block), time) - 0.5) * block * strength * 4);
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const sx = x + rowShift;
        data[i] = sample(src, width, height, sx, y, 0);
        data[i + 1] = sample(src, width, height, sx, y, 1);
        data[i + 2] = sample(src, width, height, sx, y, 2);
      }
    }
  }
  if (effect.id === "vignette") {
    const cx = width / 2;
    const cy = height / 2;
    const maxD = Math.hypot(cx, cy);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const falloff = Math.pow(Math.hypot(x - cx, y - cy) / maxD, 1.8) * strength;
        data[i] *= 1 - falloff;
        data[i + 1] *= 1 - falloff;
        data[i + 2] *= 1 - falloff;
      }
    }
  }
}

function applyCanvasEffects(time) {
  const enabled = state.effects.filter((effect) => effect.enabled);
  for (const effect of enabled) {
    const strength = effect.strength / 100;
    if (effect.id === "epsilon-glow") {
      pipelineCtx.clearRect(0, 0, pipelineCanvas.width, pipelineCanvas.height);
      pipelineCtx.filter = `blur(${Math.max(1, strength * 12)}px) brightness(${1 + strength * 2})`;
      pipelineCtx.drawImage(outputCanvas, 0, 0);
      pipelineCtx.filter = "none";
      outputCtx.save();
      outputCtx.globalAlpha = strength * 0.55;
      outputCtx.globalCompositeOperation = "screen";
      outputCtx.drawImage(pipelineCanvas, 0, 0);
      outputCtx.restore();
    }
    if (effect.id === "chromatic-aberration" || effect.id === "cmyk-shift") {
      const offset = Math.round(2 + strength * 12 + Math.sin(time * 3) * strength * 2);
      pipelineCtx.clearRect(0, 0, pipelineCanvas.width, pipelineCanvas.height);
      pipelineCtx.drawImage(outputCanvas, 0, 0);
      outputCtx.save();
      outputCtx.globalCompositeOperation = "screen";
      outputCtx.globalAlpha = 0.28 * strength;
      outputCtx.drawImage(pipelineCanvas, offset, 0);
      outputCtx.drawImage(pipelineCanvas, -offset, offset * 0.5);
      outputCtx.restore();
    }
  }
}

function renderNow(options = {}) {
  renderRaf = 0;
  const start = performance.now();
  const renderDimensions = getRenderDimensions(Boolean(options.forceFullQuality));
  resizeProcessingCanvases(renderDimensions.width, renderDimensions.height);
  document.body.classList.add("is-busy");
  els.renderStatus.textContent = "PROCESSING";
  els.renderStatus.classList.add("is-working");

  if (state.sourceType === "video" && video.readyState >= 2) {
    sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceCtx.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);
    if (state.pendingSourceThemeReset || performance.now() - state.lastSourceThemeAt > 900) {
      updateDynamicThemeFromCanvas(sourceCanvas, true, {
        source: true,
        resetEdit: state.pendingSourceThemeReset,
      });
      state.pendingSourceThemeReset = false;
    }
  }

  pixelateSource();
  const imageData = workCtx.getImageData(0, 0, workCanvas.width, workCanvas.height);
  applyBaseAdjustments(imageData.data, imageData.width, imageData.height, state.time);
  applyAlgorithm(imageData, state.time);
  for (const effect of state.effects) applyDataEffect(imageData, effect, state.time);

  outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
  if (renderDimensions.preview) {
    workCtx.putImageData(imageData, 0, 0);
    outputCtx.save();
    outputCtx.imageSmoothingEnabled = false;
    outputCtx.drawImage(workCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
    outputCtx.restore();
    resizePipelineCanvas(outputCanvas.width, outputCanvas.height);
  } else {
    outputCtx.putImageData(imageData, 0, 0);
  }
  applyCanvasEffects(state.time);
  updateDynamicThemeFromCanvas(outputCanvas, false, {
    minInterval: state.playing ? ANIMATED_THEME_INTERVAL : IDLE_THEME_INTERVAL,
    smoothing: state.playing ? 0.32 : 0.42,
  });
  if (!options.skipExportMetrics && (!state.playing || performance.now() - state.exportMetricsAt > ANIMATED_EXPORT_METRIC_INTERVAL)) {
    scheduleExportMetrics();
  }

  const elapsed = performance.now() - start;
  state.fpsFrames += 1;
  if (performance.now() - state.fpsAt > 500) {
    const fps = Math.round((state.fpsFrames * 1000) / (performance.now() - state.fpsAt));
    els.fpsReadout.textContent = `${String(fps).padStart(2, "0")} FPS`;
    state.fpsFrames = 0;
    state.fpsAt = performance.now();
  }

  els.renderStatus.textContent = `${Math.round(elapsed)} MS`;
  els.renderStatus.classList.remove("is-working");
  document.body.classList.remove("is-busy");
  state.lastRenderCost = elapsed;
  state.dirty = false;
  return elapsed;
}

function scheduleRender() {
  state.dirty = true;
  if (state.playing) return;
  if (!state.livePreview) return;
  if (!renderRaf) renderRaf = requestAnimationFrame(renderNow);
}

function scheduleEditRender() {
  state.editThemeActive = true;
  scheduleRender();
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function enableStillMotionPreview() {
  state.animateStill = true;
  els.animateStillToggle.checked = true;
  setPlaying(!prefersReducedMotion());
}

function tick(now) {
  if (!state.playing) {
    playbackRaf = 0;
    return;
  }
  const delta = Math.min(0.05, (now - state.lastFrameAt) / 1000);
  state.lastFrameAt = now;

  if (state.sourceType === "video" && video.readyState >= 2) {
    state.time = video.currentTime || 0;
    if (video.ended && els.loopToggle.checked) {
      video.currentTime = 0;
      video.play();
    }
  } else {
    state.time += delta;
    if (state.time > state.duration) state.time = els.loopToggle.checked ? state.time % state.duration : state.duration;
  }

  syncTimeline();
  if (state.sourceType === "video" || state.animateStill) {
    if (state.dirty || now >= state.nextAnimatedRenderAt) {
      const elapsed = renderNow();
      const interval = clamp(elapsed * 1.35, ANIMATED_RENDER_MIN_INTERVAL, ANIMATED_RENDER_MAX_INTERVAL);
      state.nextAnimatedRenderAt = now + interval;
    }
  }
  playbackRaf = requestAnimationFrame(tick);
}

function setAppPixelIconSlot(slot, iconName) {
  if (!slot) return;
  slot.dataset.pixelIcon = iconName;
  if (window.DitherIconSystem) {
    window.DitherIconSystem.hydrate(slot);
  }
}

function setPlaying(playing) {
  state.playing = playing;
  setAppPixelIconSlot(els.playIcon, playing ? "Pause" : "Play");
  state.lastFrameAt = performance.now();
  state.nextAnimatedRenderAt = 0;
  if (playing && renderRaf) {
    cancelAnimationFrame(renderRaf);
    renderRaf = 0;
  }
  if (playing) state.editThemeActive = true;
  if (state.sourceType === "video") {
    if (playing) video.play();
    else video.pause();
  }
  if (playing && !playbackRaf) playbackRaf = requestAnimationFrame(tick);
}

function syncTimeline() {
  const duration = state.sourceType === "video" ? video.duration || state.duration : state.duration;
  const value = duration ? Math.round((state.time / duration) * 1000) : 0;
  els.timelineSlider.value = String(clamp(value, 0, 1000));
  els.timeReadout.textContent = formatTime(state.time);
}

function setCanvasView(view) {
  state.view = view;
  els.canvasFrame.dataset.view = view;
  document.querySelectorAll(".segment").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function populateAlgorithms(filter = "") {
  const query = filter.trim().toLowerCase();
  els.algorithmSelect.innerHTML = "";
  const groups = new Map();
  ALGORITHMS.forEach((algorithm) => {
    const haystack = `${algorithm.name} ${algorithm.group}`.toLowerCase();
    if (query && !haystack.includes(query)) return;
    if (!groups.has(algorithm.group)) {
      const group = document.createElement("optgroup");
      group.label = algorithm.group;
      groups.set(algorithm.group, group);
      els.algorithmSelect.appendChild(group);
    }
    const option = document.createElement("option");
    option.value = algorithm.id;
    option.textContent = algorithm.name;
    option.selected = algorithm.id === state.algorithm;
    groups.get(algorithm.group).appendChild(option);
  });
}

function populatePalettes() {
  els.paletteSelect.innerHTML = "";
  Object.entries(PALETTES).forEach(([id, palette]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = palette.name;
    els.paletteSelect.appendChild(option);
  });
  const custom = document.createElement("option");
  custom.value = "custom";
  custom.textContent = "Extracted Custom";
  els.paletteSelect.appendChild(custom);
  syncPaletteSelect();
}

function syncPaletteSelect() {
  els.paletteSelect.value = state.palette;
  renderSwatches();
}

function renderSwatches() {
  els.swatchRow.innerHTML = "";
  const colors = getPalette();
  const display = colors || [
    [32, 32, 32],
    [80, 80, 80],
    [128, 128, 128],
    [176, 176, 176],
    [224, 224, 224],
  ];
  display.slice(0, 16).forEach((color) => {
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.title = `rgb(${color.join(", ")})`;
    swatch.style.background = `rgb(${color.join(",")})`;
    els.swatchRow.appendChild(swatch);
  });
  els.paletteReadout.textContent = colors ? `PAL ${colors.length}` : `RGB ${state.settings.levels}`;
}

function populateEffects() {
  els.effectSelect.innerHTML = "";
  EFFECTS.forEach((effect) => {
    const option = document.createElement("option");
    option.value = effect.id;
    option.textContent = effect.name;
    els.effectSelect.appendChild(option);
  });
}

function renderEffects() {
  els.effectsStack.innerHTML = "";
  if (!state.effects.length) {
    const empty = document.createElement("li");
    empty.className = "batch-empty";
    empty.textContent = "No effects in stack";
    els.effectsStack.appendChild(empty);
    return;
  }
  state.effects.forEach((effect, index) => {
    const meta = EFFECTS.find((item) => item.id === effect.id);
    const item = document.createElement("li");
    item.className = "effect-item";

    const title = document.createElement("label");
    title.className = "effect-title";
    const enabled = document.createElement("input");
    enabled.type = "checkbox";
    enabled.checked = effect.enabled;
    enabled.addEventListener("change", () => {
      effect.enabled = enabled.checked;
      scheduleEditRender();
    });
    const name = document.createElement("span");
    name.textContent = meta?.name || effect.id;
    title.append(enabled, name);

    const actions = document.createElement("div");
    actions.className = "effect-actions";
    const up = effectButton("↑", "Move up", () => moveEffect(index, -1));
    const down = effectButton("↓", "Move down", () => moveEffect(index, 1));
    const remove = effectButton("×", "Remove", () => {
      state.effects.splice(index, 1);
      renderEffects();
      scheduleEditRender();
    });
    actions.append(up, down, remove);

    const control = document.createElement("div");
    control.className = "slider-control";
    const label = document.createElement("label");
    label.textContent = "Mix";
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.value = String(effect.strength);
    const output = document.createElement("output");
    output.textContent = String(effect.strength);
    input.addEventListener("input", () => {
      effect.strength = Number(input.value);
      output.textContent = input.value;
      scheduleEditRender();
    });
    control.append(label, input, output);

    item.append(title, actions, control);
    els.effectsStack.appendChild(item);
  });
}

function effectButton(text, label, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.title = label;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", handler);
  return button;
}

function moveEffect(index, delta) {
  const next = index + delta;
  if (next < 0 || next >= state.effects.length) return;
  const [item] = state.effects.splice(index, 1);
  state.effects.splice(next, 0, item);
  renderEffects();
  scheduleEditRender();
}

function renderAdjustmentControls() {
  els.adjustmentControls.innerHTML = "";
  ADJUSTMENTS.forEach((setting) => {
    const wrap = document.createElement("div");
    wrap.className = "slider-control";
    const label = document.createElement("label");
    label.htmlFor = `control-${setting.id}`;
    label.textContent = setting.label;
    const input = document.createElement("input");
    input.id = `control-${setting.id}`;
    input.type = "range";
    input.min = String(setting.min);
    input.max = String(setting.max);
    input.step = String(setting.step);
    input.value = String(state.settings[setting.id]);
    const output = document.createElement("output");
    output.textContent = String(state.settings[setting.id]);
    input.addEventListener("input", () => {
      state.settings[setting.id] = Number(input.value);
      output.textContent = input.value;
      if (setting.id === "levels") renderSwatches();
      scheduleEditRender();
    });
    wrap.append(label, input, output);
    els.adjustmentControls.appendChild(wrap);
  });
}

function renderPresets() {
  els.presetGrid.innerHTML = "";
  PRESETS.forEach((preset) => {
    const button = document.createElement("button");
    button.className = "preset-button";
    button.type = "button";
    const name = document.createElement("strong");
    name.textContent = preset.name;
    const detail = document.createElement("span");
    detail.textContent = preset.detail;
    button.append(name, detail);
    button.addEventListener("click", () => applyPreset(preset));
    els.presetGrid.appendChild(button);
  });
}

function applyPreset(preset) {
  state.algorithm = preset.algorithm;
  state.palette = preset.palette;
  state.settings = { ...state.settings, ...preset.settings };
  state.effects = preset.effects.map((effect) => ({ ...effect }));
  populateAlgorithms(els.algorithmSearch.value);
  syncPaletteSelect();
  renderAdjustmentControls();
  renderEffects();
  updateStatus();
  scheduleEditRender();
}

function updateStatus() {
  const algorithm = ALGORITHMS.find((item) => item.id === state.algorithm) || ALGORITHMS[0];
  els.mediaStatus.textContent = `SOURCE: ${state.sourceName.toUpperCase().slice(0, 24)}`;
  els.algorithmStatus.textContent = `ALG: ${algorithm.name.toUpperCase().slice(0, 28)}`;
  els.paletteReadout.textContent = getPalette() ? `PAL ${getPalette().length}` : `RGB ${state.settings.levels}`;
}

function drawSample() {
  resizeCanvases(1024, 640);
  sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const gradient = sourceCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgb(12,24,19)");
  gradient.addColorStop(0.35, "rgb(48,96,66)");
  gradient.addColorStop(0.68, "rgb(170,84,112)");
  gradient.addColorStop(1, "rgb(232,201,110)");
  sourceCtx.fillStyle = gradient;
  sourceCtx.fillRect(0, 0, width, height);

  for (let y = 0; y < height; y += 16) {
    sourceCtx.fillStyle = `rgba(190,255,170,${0.03 + (y / height) * 0.05})`;
    sourceCtx.fillRect(0, y, width, 1);
  }

  sourceCtx.save();
  sourceCtx.translate(width * 0.48, height * 0.52);
  for (let i = 0; i < 18; i++) {
    sourceCtx.rotate(0.22);
    sourceCtx.strokeStyle = `rgba(${80 + i * 7}, ${255 - i * 4}, ${140 + i * 4}, ${0.15 + i * 0.018})`;
    sourceCtx.lineWidth = 5 + i * 0.6;
    sourceCtx.strokeRect(-210 + i * 8, -150 + i * 5, 420 - i * 10, 300 - i * 7);
  }
  sourceCtx.restore();

  sourceCtx.fillStyle = "rgba(12,18,16,0.72)";
  sourceCtx.fillRect(width * 0.08, height * 0.18, width * 0.32, height * 0.62);
  sourceCtx.fillStyle = "rgba(214,255,164,0.72)";
  sourceCtx.font = "700 72px ui-monospace, SFMono-Regular, Consolas, monospace";
  sourceCtx.fillText("WIZ", width * 0.11, height * 0.42);
  sourceCtx.font = "600 19px ui-monospace, SFMono-Regular, Consolas, monospace";
  sourceCtx.fillText("DITHER WIZARD 63", width * 0.115, height * 0.49);
  sourceCtx.fillStyle = "rgba(0,174,239,0.54)";
  sourceCtx.fillRect(width * 0.58, height * 0.14, width * 0.26, height * 0.18);
  sourceCtx.fillStyle = "rgba(236,0,140,0.48)";
  sourceCtx.fillRect(width * 0.64, height * 0.52, width * 0.22, height * 0.22);
  sourceCtx.fillStyle = "rgba(255,242,0,0.42)";
  sourceCtx.beginPath();
  sourceCtx.arc(width * 0.72, height * 0.44, 88, 0, Math.PI * 2);
  sourceCtx.fill();

  state.sourceType = "image";
  state.sourceName = "procedural";
  state.duration = 4;
  state.time = 0;
  estimateSourceBytesFromCanvas("procedural.png", "PNG");
  syncTimeline();
  enableStillMotionPreview();
  updateDynamicThemeFromCanvas(sourceCanvas, true, { source: true, resetEdit: true });
  updateStatus();
  scheduleRender();
}

async function loadDefaultSample() {
  try {
    const response = await fetch(DEFAULT_SAMPLE_URL);
    if (!response.ok) throw new Error(`Default sample request failed: ${response.status}`);
    const blob = await response.blob();
    const file = new File([blob], DEFAULT_SAMPLE_NAME, { type: blob.type || "image/png" });
    await loadFile(file);
  } catch {
    drawSample();
  }
}

async function loadFile(file) {
  if (!file) return;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  state.sourceName = file.name;
  setExportSource({
    name: file.name,
    bytes: file.size,
    format: formatFromName(file.name, file.type),
  });
  state.pendingSourceThemeReset = true;

  if (file.type.startsWith("video/")) {
    await loadVideo(objectUrl, file);
  } else {
    await loadImage(objectUrl, file);
  }
  updateStatus();
  scheduleRender();
}

function loadImage(url, file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const dims = fitDimensions(image.naturalWidth, image.naturalHeight);
      resizeCanvases(dims.width, dims.height);
      sourceCtx.clearRect(0, 0, dims.width, dims.height);
      sourceCtx.drawImage(image, 0, 0, dims.width, dims.height);
      state.sourceType = "image";
      state.duration = 4;
      state.time = 0;
      syncTimeline();
      enableStillMotionPreview();
      updateDynamicThemeFromCanvas(sourceCanvas, true, { source: true, resetEdit: true });
      state.pendingSourceThemeReset = false;
      resolve();
    };
    image.onerror = (event) => {
      state.pendingSourceThemeReset = false;
      reject(event);
    };
    image.src = url;
  });
}

function loadVideo(url) {
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      const dims = fitDimensions(video.videoWidth || 960, video.videoHeight || 540);
      resizeCanvases(dims.width, dims.height);
      state.sourceType = "video";
      state.duration = video.duration || 4;
      state.time = 0;
      video.currentTime = 0;
      syncTimeline();
      resolve();
    };
    video.onseeked = () => {
      state.time = video.currentTime;
      if (video.readyState >= 2) {
        sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
        sourceCtx.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);
        updateDynamicThemeFromCanvas(sourceCanvas, true, {
          source: true,
          resetEdit: state.pendingSourceThemeReset,
        });
        state.pendingSourceThemeReset = false;
      }
      syncTimeline();
      scheduleRender();
    };
    video.onerror = (event) => {
      state.pendingSourceThemeReset = false;
      reject(event);
    };
    video.src = url;
    video.load();
  });
}

function extractPalette() {
  const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const buckets = new Map();
  const step = Math.max(1, Math.floor(imageData.data.length / 4 / 14000));
  for (let p = 0; p < imageData.data.length / 4; p += step) {
    const i = p * 4;
    const r = Math.round(imageData.data[i] / 32) * 32;
    const g = Math.round(imageData.data[i + 1] / 32) * 32;
    const b = Math.round(imageData.data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  const colors = [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([key]) => key.split(",").map(Number));
  state.customPalette = colors.length ? colors : PALETTES.phosphor.colors;
  state.palette = "custom";
  syncPaletteSelect();
  updateStatus();
  scheduleEditRender();
}

async function exportPalette() {
  if (state.isExporting || state.isRecording) return;
  const colors = getPalette();
  if (!colors) return;
  const blob = validateExportBlob(
    new Blob([JSON.stringify({ name: "Dither Wizard Palette", colors }, null, 2)], { type: "application/json" }),
    "Palette",
  );
  const filename = "dither-wizard-palette.json";
  state.isExporting = true;
  setExportButtonsDisabled(true);
  setExportStatus("saving", "saving");
  try {
    const target = await chooseSaveTarget(filename, "application/json", "json", "JSON palette");
    if (target.cancelled) {
      setExportStatus("cancelled", "ready", 1200);
      return;
    }
    const result = await saveBlob(blob, filename, target.handle);
    setExportStatus(result, "saved", 1600);
  } catch (error) {
    console.error(error);
    setExportStatus("export error", "error", 2400);
  } finally {
    state.isExporting = false;
    setExportButtonsDisabled(false);
  }
}

function importPalette(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const colors = Array.isArray(parsed) ? parsed : parsed.colors;
      if (!Array.isArray(colors) || colors.length === 0) throw new Error("Invalid palette");
      state.customPalette = colors
        .map((color) => color.slice(0, 3).map((value) => clamp(Number(value) || 0)))
        .filter((color) => color.length === 3);
      state.palette = "custom";
      syncPaletteSelect();
      updateStatus();
      scheduleEditRender();
    } catch {
      els.renderStatus.textContent = "PALETTE ERROR";
    }
  };
  reader.readAsText(file);
}

async function downloadBlob(blob, filename) {
  const href = await setLastExportLink(blob, filename);
  if (!href) throw new Error("Could not prepare download link");
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function writeBlobToHandle(blob, handle) {
  const writable = await handle.createWritable();
  const data = await blob.arrayBuffer();
  await writable.write({ type: "write", position: 0, data });
  await writable.truncate(data.byteLength);
  await writable.close();
}

async function saveBlob(blob, filename, handle = null) {
  if (handle) {
    try {
      await writeBlobToHandle(blob, handle);
      clearLastExportLink();
      return "saved";
    } catch (error) {
      console.warn(error);
      await downloadBlob(blob, filename);
      return "downloaded";
    }
  }
  await downloadBlob(blob, filename);
  return "downloaded";
}

class GifByteWriter {
  constructor() {
    this.chunks = [];
    this.buffer = new Uint8Array(65536);
    this.offset = 0;
  }

  writeByte(value) {
    if (this.offset >= this.buffer.length) this.flushBuffer();
    this.buffer[this.offset] = value & 255;
    this.offset += 1;
  }

  writeBytes(bytes) {
    for (let i = 0; i < bytes.length; i++) this.writeByte(bytes[i]);
  }

  writeAscii(value) {
    for (let i = 0; i < value.length; i++) this.writeByte(value.charCodeAt(i));
  }

  writeShort(value) {
    this.writeByte(value);
    this.writeByte(value >> 8);
  }

  flushBuffer() {
    if (!this.offset) return;
    this.chunks.push(this.buffer.slice(0, this.offset));
    this.offset = 0;
  }

  toBlob(type) {
    this.flushBuffer();
    return new Blob(this.chunks, { type });
  }
}

class GifSubBlockWriter {
  constructor(writer) {
    this.writer = writer;
    this.block = new Uint8Array(255);
    this.offset = 0;
  }

  writeByte(value) {
    if (this.offset >= 255) this.flush();
    this.block[this.offset] = value & 255;
    this.offset += 1;
  }

  flush() {
    if (!this.offset) return;
    this.writer.writeByte(this.offset);
    this.writer.writeBytes(this.block.subarray(0, this.offset));
    this.offset = 0;
  }

  close() {
    this.flush();
    this.writer.writeByte(0);
  }
}

function writeGifHeader(writer, width, height, palette) {
  if (width > 65535 || height > 65535) {
    throw new Error("GIF export is limited to 65535 pixels per side");
  }
  writer.writeAscii("GIF89a");
  writer.writeShort(width);
  writer.writeShort(height);
  writer.writeByte(0xf7);
  writer.writeByte(0);
  writer.writeByte(0);
  for (let i = 0; i < GIF_EXPORT_COLORS; i++) {
    const color = palette[i] || palette[palette.length - 1] || [0, 0, 0];
    writer.writeByte(color[0]);
    writer.writeByte(color[1]);
    writer.writeByte(color[2]);
  }
  writer.writeByte(0x21);
  writer.writeByte(0xff);
  writer.writeByte(0x0b);
  writer.writeAscii("NETSCAPE2.0");
  writer.writeByte(0x03);
  writer.writeByte(0x01);
  writer.writeShort(0);
  writer.writeByte(0);
}

function writeGifFrameHeader(writer, width, height, delay) {
  writer.writeByte(0x21);
  writer.writeByte(0xf9);
  writer.writeByte(0x04);
  writer.writeByte(0x04);
  writer.writeShort(delay);
  writer.writeByte(0);
  writer.writeByte(0);
  writer.writeByte(0x2c);
  writer.writeShort(0);
  writer.writeShort(0);
  writer.writeShort(width);
  writer.writeShort(height);
  writer.writeByte(0);
}

function writeGifLzwData(writer, indices) {
  const minCodeSize = 8;
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  let dictionary = new Map();
  let bitBuffer = 0;
  let bitCount = 0;
  const blocks = new GifSubBlockWriter(writer);

  writer.writeByte(minCodeSize);

  const resetDictionary = () => {
    dictionary = new Map();
    codeSize = minCodeSize + 1;
    nextCode = endCode + 1;
  };

  const writeCode = (code) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      blocks.writeByte(bitBuffer & 255);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  resetDictionary();
  writeCode(clearCode);
  let prefix = indices[0] || 0;
  for (let i = 1; i < indices.length; i++) {
    const color = indices[i];
    const key = (prefix << 8) | color;
    const existing = dictionary.get(key);
    if (existing !== undefined) {
      prefix = existing;
      continue;
    }

    writeCode(prefix);
    if (nextCode < 4096) {
      dictionary.set(key, nextCode);
      nextCode += 1;
      if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
    } else {
      writeCode(clearCode);
      resetDictionary();
    }
    prefix = color;
  }
  writeCode(prefix);
  writeCode(endCode);
  if (bitCount > 0) blocks.writeByte(bitBuffer & 255);
  blocks.close();
}

function writeGifFrame(writer, width, height, indices, delay) {
  writeGifFrameHeader(writer, width, height, delay);
  writeGifLzwData(writer, indices);
}

function buildGifPalette(data) {
  const buckets = new Map();
  const pixelCount = data.length / 4;
  const step = Math.max(1, Math.floor(pixelCount / GIF_PALETTE_SAMPLE_PIXELS));
  for (let pixel = 0; pixel < pixelCount; pixel += step) {
    const i = pixel * 4;
    if (data[i + 3] < 128) continue;
    const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { count: 0, r: 0, g: 0, b: 0 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    bucket.r += data[i];
    bucket.g += data[i + 1];
    bucket.b += data[i + 2];
  }

  const palette = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, GIF_EXPORT_COLORS)
    .map((bucket) => [
      Math.round(bucket.r / bucket.count),
      Math.round(bucket.g / bucket.count),
      Math.round(bucket.b / bucket.count),
    ]);
  if (!palette.length) palette.push([0, 0, 0]);
  while (palette.length < GIF_EXPORT_COLORS) palette.push([...palette[palette.length - 1]]);
  return palette;
}

function createGifPaletteCache() {
  const cache = new Uint16Array(32768);
  cache.fill(65535);
  return cache;
}

function nearestGifPaletteIndex(red, green, blue, palette) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < palette.length; i++) {
    const color = palette[i];
    const dr = red - color[0];
    const dg = green - color[1];
    const db = blue - color[2];
    const distance = dr * dr + dg * dg + db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
      if (distance === 0) break;
    }
  }
  return bestIndex;
}

function indexGifFramePixels(data, palette, cache) {
  const pixelCount = data.length / 4;
  const indices = new Uint8Array(pixelCount);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    const i = pixel * 4;
    if (data[i + 3] < 128) {
      indices[pixel] = 0;
      continue;
    }
    const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
    let paletteIndex = cache[key];
    if (paletteIndex === 65535) {
      paletteIndex = nearestGifPaletteIndex(data[i], data[i + 1], data[i + 2], palette);
      cache[key] = paletteIndex;
    }
    indices[pixel] = paletteIndex;
  }
  return indices;
}

function waitForAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function seekVideoFrame(time) {
  const duration = video.duration || state.duration || 0;
  const target = clamp(time, 0, Math.max(0, duration - 0.001));
  if (video.readyState >= 2 && Math.abs((video.currentTime || 0) - target) < 0.01) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let done = false;
    let timeout = 0;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timeout);
      video.removeEventListener("seeked", finish);
      resolve();
    };
    timeout = window.setTimeout(finish, 1200);
    video.addEventListener("seeked", finish, { once: true });
    try {
      video.currentTime = target;
    } catch {
      finish();
    }
  });
}

async function renderFullQualityFrameAt(time) {
  state.time = time;
  if (state.sourceType === "video") await seekVideoFrame(time);
  syncTimeline();
  renderNow({ forceFullQuality: true, skipExportMetrics: true });
  return outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
}

async function exportGIF() {
  if (state.isExporting || state.isRecording) return;
  const filename = exportFilename("gif", "loop");
  const wasPlaying = state.playing;
  const originalTime = state.time;
  const originalVideoTime = video.currentTime || 0;
  if (wasPlaying) setPlaying(false);
  state.isExporting = true;
  setExportButtonsDisabled(true);
  setExportStatus("gif 0%", "saving");
  try {
    const sourceDuration = state.sourceType === "video" ? video.duration || state.duration : state.duration;
    const duration = Math.max(1 / GIF_EXPORT_FPS, Math.min(sourceDuration || 1, GIF_EXPORT_MAX_SECONDS));
    const frameCount = Math.max(2, Math.min(GIF_EXPORT_MAX_FRAMES, Math.round(duration * GIF_EXPORT_FPS)));
    const frameDelay = Math.max(2, Math.round((duration / frameCount) * 100));
    const firstFrame = await renderFullQualityFrameAt(0);
    const width = firstFrame.width;
    const height = firstFrame.height;
    const palette = buildGifPalette(firstFrame.data);
    const paletteCache = createGifPaletteCache();
    const writer = new GifByteWriter();
    writeGifHeader(writer, width, height, palette);

    for (let frame = 0; frame < frameCount; frame++) {
      const imageData = frame === 0 ? firstFrame : await renderFullQualityFrameAt((frame / frameCount) * duration);
      const indices = indexGifFramePixels(imageData.data, palette, paletteCache);
      writeGifFrame(writer, width, height, indices, frameDelay);
      setExportStatus(`gif ${Math.round(((frame + 1) / frameCount) * 100)}%`, "saving");
      if (frame % 2 === 1) await waitForAnimationFrame();
    }
    writer.writeByte(0x3b);
    const blob = validateExportBlob(writer.toBlob("image/gif"), "GIF");
    setExportResult(blob, "GIF");
    setExportStatus("saving", "saving");
    const target = await chooseSaveTarget(filename, "image/gif", "gif", "GIF animation");
    if (target.cancelled) {
      setExportStatus("cancelled", "ready", 1200);
      return;
    }
    const result = await saveBlob(blob, filename, target.handle);
    setExportStatus(result, "saved", 1600);
  } catch (error) {
    console.error(error);
    setExportStatus("export error", "error", 2400);
  } finally {
    state.time = originalTime;
    if (state.sourceType === "video") await seekVideoFrame(originalVideoTime);
    syncTimeline();
    renderNow({ forceFullQuality: true, skipExportMetrics: true });
    if (wasPlaying) setPlaying(true);
    state.isExporting = false;
    setExportButtonsDisabled(false);
  }
}

async function downloadCanvas(type) {
  if (state.isExporting || state.isRecording) return;
  const ext = type === "image/jpeg" ? "jpg" : "png";
  const format = type === "image/jpeg" ? "JPG" : "PNG";
  const description = type === "image/jpeg" ? "JPG image" : "PNG image";
  const filename = exportFilename(ext);
  const wasPlaying = state.playing;
  if (wasPlaying) setPlaying(false);
  state.isExporting = true;
  setExportButtonsDisabled(true);
  setExportStatus("saving", "saving");
  try {
    renderNow({ forceFullQuality: true, skipExportMetrics: true });
    const blob = validateExportBlob(
      await canvasToBlob(outputCanvas, type, type === "image/jpeg" ? 0.94 : undefined),
      format,
    );
    setExportResult(blob, format);
    const target = await chooseSaveTarget(filename, type, ext, description);
    if (target.cancelled) {
      setExportStatus("cancelled", "ready", 1200);
      return;
    }
    const result = await saveBlob(blob, filename, target.handle);
    setExportStatus(result, "saved", 1600);
  } catch (error) {
    console.error(error);
    setExportStatus("export error", "error", 2400);
  } finally {
    if (wasPlaying) setPlaying(true);
    state.isExporting = false;
    setExportButtonsDisabled(false);
  }
}

async function exportSVG() {
  if (state.isExporting || state.isRecording) return;
  const filename = exportFilename("svg", "vector");
  const wasPlaying = state.playing;
  if (wasPlaying) setPlaying(false);
  state.isExporting = true;
  setExportButtonsDisabled(true);
  setExportStatus("saving", "saving");
  try {
    renderNow({ forceFullQuality: true, skipExportMetrics: true });
    const width = outputCanvas.width;
    const height = outputCanvas.height;
    const imageData = outputCtx.getImageData(0, 0, width, height);
    const step = Math.max(state.settings.cell, Math.ceil(Math.max(width, height) / 360));
    const threshold = state.settings.threshold;
    const rects = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4;
        const luma = luminance(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]);
        if (luma < threshold) rects.push(`<rect x="${x}" y="${y}" width="${step}" height="${step}"/>`);
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="100%" height="100%" fill="rgb(238,241,228)"/><g fill="rgb(17,19,17)">${rects.join("")}</g></svg>`;
    const blob = validateExportBlob(new Blob([svg], { type: "image/svg+xml" }), "SVG");
    setExportResult(blob, "SVG");
    const target = await chooseSaveTarget(filename, "image/svg+xml", "svg", "SVG vector image");
    if (target.cancelled) {
      setExportStatus("cancelled", "ready", 1200);
      return;
    }
    const result = await saveBlob(blob, filename, target.handle);
    setExportStatus(result, "saved", 1600);
  } catch (error) {
    console.error(error);
    setExportStatus("export error", "error", 2400);
  } finally {
    if (wasPlaying) setPlaying(true);
    state.isExporting = false;
    setExportButtonsDisabled(false);
  }
}

function getWebmMimeType() {
  return ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => (
    MediaRecorder.isTypeSupported(type)
  )) || "";
}

function getWebmBitrate(width, height) {
  const estimated = width * height * WEBM_EXPORT_FPS * WEBM_EXPORT_BITS_PER_PIXEL;
  return Math.round(clamp(estimated, WEBM_EXPORT_MIN_BITRATE, WEBM_EXPORT_MAX_BITRATE));
}

async function recordWebm() {
  if (state.isRecording || state.isExporting) return;
  if (!outputCanvas.captureStream || !window.MediaRecorder) {
    setExportStatus("unavailable", "error", 2400);
    return;
  }
  const filename = exportFilename("webm", "loop");
  state.isRecording = true;
  setExportButtonsDisabled(true);
  setExportStatus("recording", "recording");
  const wasPlaying = state.playing;
  let stream = null;
  try {
    if (wasPlaying) setPlaying(false);
    renderNow({ forceFullQuality: true, skipExportMetrics: true });
    stream = outputCanvas.captureStream(WEBM_EXPORT_FPS);
    const mimeType = getWebmMimeType();
    const recorderOptions = {
      videoBitsPerSecond: getWebmBitrate(outputCanvas.width, outputCanvas.height),
    };
    if (mimeType) recorderOptions.mimeType = mimeType;
    const recorder = new MediaRecorder(stream, recorderOptions);
    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = async () => {
      try {
        const blob = validateExportBlob(new Blob(chunks, { type: mimeType || "video/webm" }), "WebM");
        setExportResult(blob, "WEBM");
        setExportStatus("saving", "saving");
        const result = await saveBlob(blob, filename);
        setExportStatus(result, "saved", 1600);
      } catch (error) {
        console.error(error);
        setExportStatus("export error", "error", 2400);
      } finally {
        state.isRecording = false;
        setExportButtonsDisabled(false);
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    recorder.start();

    state.time = 0;
    if (state.sourceType === "video") {
      video.currentTime = 0;
      await video.play();
    }
    setPlaying(true);
    const duration = Math.min(state.sourceType === "video" ? video.duration || 4 : state.duration, 8);
    setTimeout(() => {
      recorder.stop();
      setPlaying(wasPlaying);
    }, duration * 1000);
  } catch (error) {
    console.error(error);
    state.isRecording = false;
    setExportButtonsDisabled(false);
    setExportStatus("record error", "error", 2400);
    if (wasPlaying) setPlaying(true);
    if (stream) stream.getTracks().forEach((track) => track.stop());
  }
}

function renderBatchList() {
  els.batchList.innerHTML = "";
  if (!state.batchFiles.length) {
    const empty = document.createElement("div");
    empty.className = "batch-empty";
    empty.textContent = "No queued image files";
    els.batchList.appendChild(empty);
    return;
  }
  state.batchFiles.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "batch-item";
    const name = document.createElement("span");
    name.textContent = file.name;
    const status = document.createElement("output");
    status.id = `batch-status-${index}`;
    status.textContent = "queued";
    item.append(name, status);
    els.batchList.appendChild(item);
  });
}

async function processBatch() {
  if (!state.batchFiles.length) return;
  for (let i = 0; i < state.batchFiles.length; i++) {
    const status = $(`batch-status-${i}`);
    if (status) status.textContent = "open";
    await loadFile(state.batchFiles[i]);
    setPlaying(false);
    await new Promise((resolve) => requestAnimationFrame(() => {
      renderNow({ forceFullQuality: true, skipExportMetrics: true });
      resolve();
    }));
    if (status) status.textContent = "export";
    await new Promise((resolve) => outputCanvas.toBlob((blob) => {
      if (blob) void downloadBlob(blob, `batch-${i + 1}-${state.batchFiles[i].name.replace(/\.[^.]+$/, "")}.png`);
      resolve();
    }, "image/png"));
    if (status) status.textContent = "done";
  }
}

function randomizeLook() {
  const algorithm = ALGORITHMS[Math.floor(Math.random() * ALGORITHMS.length)];
  const paletteKeys = Object.keys(PALETTES);
  state.algorithm = algorithm.id;
  state.palette = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
  state.settings.cell = 1 + Math.floor(Math.random() * 8);
  state.settings.levels = 2 + Math.floor(Math.random() * 8);
  state.settings.threshold = 92 + Math.floor(Math.random() * 80);
  state.settings.contrast = -10 + Math.floor(Math.random() * 70);
  state.settings.brightness = -20 + Math.floor(Math.random() * 40);
  state.settings.gamma = Number((0.75 + Math.random() * 0.75).toFixed(2));
  state.settings.noise = Math.floor(Math.random() * 38);
  state.settings.temporal = Math.floor(Math.random() * 100);
  renderAdjustmentControls();
  populateAlgorithms(els.algorithmSearch.value);
  syncPaletteSelect();
  updateStatus();
  scheduleEditRender();
}

function savePreset() {
  const preset = {
    name: `User ${PRESETS.length + 1}`,
    detail: "current",
    algorithm: state.algorithm,
    palette: state.palette,
    settings: { ...state.settings },
    effects: state.effects.map((effect) => ({ ...effect })),
  };
  PRESETS.push(preset);
  renderPresets();
}

function getSavedDropTexture() {
  try {
    const saved = sessionStorage.getItem(DROP_TEXTURE_DEV_KEY);
    if (DROP_TEXTURE_OPTIONS.includes(saved)) return saved;
  } catch {
    return DROP_TEXTURE_OPTIONS[0];
  }
  return DROP_TEXTURE_OPTIONS[0];
}

function setDropTexture(variant) {
  const next = DROP_TEXTURE_OPTIONS.includes(variant) ? variant : DROP_TEXTURE_OPTIONS[0];
  document.body.dataset.dropTexture = next;
  els.dropTextureOptions?.querySelectorAll("[data-drop-texture-option]").forEach((button) => {
    const active = button.dataset.dropTextureOption === next;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  try {
    sessionStorage.setItem(DROP_TEXTURE_DEV_KEY, next);
  } catch {
    return;
  }
}

function bindDropTextureDevOverlay() {
  if (!els.dropTextureOptions) return;
  setDropTexture(getSavedDropTexture());
  els.dropTextureOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-drop-texture-option]");
    if (!button) return;
    setDropTexture(button.dataset.dropTextureOption);
  });
}

function setContextPanelCollapsed(collapsed) {
  if (!els.contextDevPanel || !els.contextPanelToggle) return;
  els.contextDevPanel.classList.toggle("is-collapsed", collapsed);
  els.contextPanelToggle.setAttribute("aria-expanded", String(!collapsed));
  els.contextPanelToggle.textContent = collapsed ? "Show" : "Hide";
}

function bindContextDevPanel() {
  if (!els.contextDevPanel) return;
  els.contextPanelToggle?.addEventListener("click", () => {
    setContextPanelCollapsed(!els.contextDevPanel.classList.contains("is-collapsed"));
  });
  els.contextDevPanel.addEventListener("keydown", (event) => event.stopPropagation());
}

function bindEvents() {
  els.loadButton.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", () => {
    const [file] = els.fileInput.files;
    loadFile(file);
    els.fileInput.value = "";
  });
  els.resetSampleButton.addEventListener("click", loadDefaultSample);
  els.snapshotButton.addEventListener("click", () => {
    sourceCtx.drawImage(outputCanvas, 0, 0);
    state.sourceType = "image";
    state.sourceName = "captured-frame";
    state.time = 0;
    estimateSourceBytesFromCanvas("captured-frame.png", "PNG");
    setPlaying(false);
    updateDynamicThemeFromCanvas(sourceCanvas, true, { source: true, resetEdit: true });
    updateStatus();
    scheduleRender();
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    els.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.dropZone.classList.add("is-dragging");
    });
  });
  ["dragleave", "drop"].forEach((eventName) => {
    els.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.dropZone.classList.remove("is-dragging");
    });
  });
  els.dropZone.addEventListener("drop", (event) => loadFile(event.dataTransfer.files[0]));

  els.algorithmSearch.addEventListener("input", () => populateAlgorithms(els.algorithmSearch.value));
  els.algorithmSelect.addEventListener("change", () => {
    if (!els.algorithmSelect.value) return;
    state.algorithm = els.algorithmSelect.value;
    updateStatus();
    scheduleEditRender();
  });

  els.paletteSelect.addEventListener("change", () => {
    state.palette = els.paletteSelect.value;
    syncPaletteSelect();
    updateStatus();
    scheduleEditRender();
  });
  els.extractPaletteButton.addEventListener("click", extractPalette);
  els.exportPaletteButton.addEventListener("click", exportPalette);
  els.importPaletteButton.addEventListener("click", () => els.paletteInput.click());
  els.paletteInput.addEventListener("change", () => importPalette(els.paletteInput.files[0]));

  els.addEffectButton.addEventListener("click", () => {
    state.effects.push({ id: els.effectSelect.value, strength: 35, enabled: true });
    renderEffects();
    scheduleEditRender();
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => setCanvasView(button.dataset.view));
  });

  els.playButton.addEventListener("click", () => setPlaying(!state.playing));
  els.stepBackButton.addEventListener("click", () => stepTimeline(-1 / 12));
  els.stepForwardButton.addEventListener("click", () => stepTimeline(1 / 12));
  els.recordButton.addEventListener("click", recordWebm);
  els.recordWebmButton.addEventListener("click", recordWebm);
  els.loopToggle.addEventListener("change", () => {
    video.loop = els.loopToggle.checked;
  });
  els.animateStillToggle.addEventListener("change", () => {
    state.animateStill = els.animateStillToggle.checked;
    state.editThemeActive = true;
    if (state.sourceType === "image") setPlaying(state.animateStill && !prefersReducedMotion());
    scheduleRender();
  });
  els.livePreviewToggle.addEventListener("change", () => {
    state.livePreview = els.livePreviewToggle.checked;
    if (state.dirty && state.livePreview) scheduleRender();
  });
  els.timelineSlider.addEventListener("input", () => {
    const duration = state.sourceType === "video" ? video.duration || state.duration : state.duration;
    state.time = (Number(els.timelineSlider.value) / 1000) * duration;
    if (state.sourceType === "video") video.currentTime = state.time;
    syncTimeline();
    scheduleEditRender();
  });

  els.downloadPngButton.addEventListener("click", () => downloadCanvas("image/png"));
  els.downloadJpgButton.addEventListener("click", () => downloadCanvas("image/jpeg"));
  els.downloadGifButton.addEventListener("click", exportGIF);
  els.downloadSvgButton.addEventListener("click", exportSVG);
  els.batchInputButton.addEventListener("click", () => els.batchInput.click());
  els.batchInput.addEventListener("change", () => {
    state.batchFiles = [...els.batchInput.files].filter((file) => file.type.startsWith("image/"));
    renderBatchList();
  });
  els.processBatchButton.addEventListener("click", processBatch);
  els.randomizeButton.addEventListener("click", randomizeLook);
  els.savePresetButton.addEventListener("click", savePreset);
  els.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(current === "light" ? "dark" : "light");
  });
  bindDropTextureDevOverlay();
  bindContextDevPanel();

  window.addEventListener("resize", () => scheduleRender());
  document.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
    if (event.key === " ") {
      event.preventDefault();
      setPlaying(!state.playing);
    }
    if (event.key === "ArrowLeft") stepTimeline(-1 / 12);
    if (event.key === "ArrowRight") stepTimeline(1 / 12);
  });
}

function stepTimeline(delta) {
  const duration = state.sourceType === "video" ? video.duration || state.duration : state.duration;
  state.time = clamp(state.time + delta, 0, duration);
  if (state.sourceType === "video") video.currentTime = state.time;
  syncTimeline();
  scheduleEditRender();
}

async function init() {
  setTheme(getSavedTheme());
  if (ALGORITHMS.length !== 63) {
    els.renderStatus.textContent = `ALG COUNT ${ALGORITHMS.length}`;
  }
  els.canvasFrame.dataset.view = state.view;
  populateAlgorithms();
  populatePalettes();
  populateEffects();
  renderAdjustmentControls();
  renderPresets();
  renderEffects();
  renderBatchList();
  bindEvents();
  await loadDefaultSample();
  renderNow();
}

init();
