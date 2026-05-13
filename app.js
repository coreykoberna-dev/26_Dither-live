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
const RANDOM_SOURCE_LAST_KEY = "ditherWizardLastRandomSource";
const IDLE_THEME_INTERVAL = 110;
const ANIMATED_THEME_INTERVAL = 520;
const MOTION_SOURCE_THEME_INTERVAL = 3600;
const MOTION_OUTPUT_THEME_INTERVAL = 2800;
const SOURCE_VIEW_THEME_INTERVAL = 900;
const SOURCE_VIEW_MOTION_THEME_INTERVAL = 1600;
const SOURCE_VIEW_MOTION_THEME_SMOOTHING = 0.22;
const STATIC_IMAGE_THEME_IMAGE_SMOOTHING = 0.38;
const ANIMATED_EXPORT_METRIC_INTERVAL = 2200;
const ANIMATED_RENDER_MIN_INTERVAL = 66;
const ANIMATED_RENDER_MAX_INTERVAL = 210;
const ANIMATED_PREVIEW_MAX_SIDE = 700;
const PLAYBACK_UI_SYNC_INTERVAL = 100;
const LOGOTYPE_RENDER_INTERVAL = 1000 / 12;
const STARTUP_RANDOM_SOURCE_MAX_BYTES = 2600000;
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
const GIF_DISPOSAL_NONE = 0;
const GIF_SOURCE_DEFAULT_DELAY = 0.1;
const GIF_SOURCE_MIN_DELAY = 0.02;
const EXPORT_FREE_LIMIT = 5;
const EXPORT_COUNT_KEY = "ditherWizardExportCount";
const els = {
  fileInput: $("fileInput"),
  loadButton: $("loadButton"),
  randomSourceButton: $("randomSourceButton"),
  dropZone: $("dropZone"),
  resetSampleButton: $("resetSampleButton"),
  presetGrid: $("presetGrid"),
  batchInput: $("batchInput"),
  batchInputButton: $("batchInputButton"),
  batchList: $("batchList"),
  processBatchButton: $("processBatchButton"),
  canvasFrame: $("canvasFrame"),
  algorithmSelect: $("algorithmSelect"),
  adjustmentControls: $("adjustmentControls"),
  paletteSelect: $("paletteSelect"),
  palettePicker: $("palettePicker"),
  palettePickerList: $("palettePickerList"),
  swatchRow: $("swatchRow"),
  randomizePaletteButton: $("randomizePaletteButton"),
  randomizePresetButton: $("randomizePresetButton"),
  randomizeAlgorithmButton: $("randomizeAlgorithmButton"),
  extractPaletteButton: $("extractPaletteButton"),
  exportPaletteButton: $("exportPaletteButton"),
  importPaletteButton: $("importPaletteButton"),
  paletteInput: $("paletteInput"),
  effectSelect: $("effectSelect"),
  randomizeEffectsButton: $("randomizeEffectsButton"),
  effectsStack: $("effectsStack"),
  effectsStackScrollIndicator: document.querySelector(".effects-stack-scroll-indicator"),
  effectsStackScrollThumb: document.querySelector(".effects-stack-scroll-indicator span"),
  playButton: $("playButton"),
  playIcon: $("playIcon"),
  stepBackButton: $("stepBackButton"),
  stepForwardButton: $("stepForwardButton"),
  recordButton: $("recordButton"),
  downloadGifButton: $("downloadGifButton"),
  exportIconButton: $("exportIconButton"),
  recordWebmButton: $("recordWebmButton"),
  recordMp4Button: $("recordMp4Button"),
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
  exportPreview: $("exportPreview"),
  exportPreviewFormat: $("exportPreviewFormat"),
  exportPreviewDetails: $("exportPreviewDetails"),
  exportEntitlement: $("exportEntitlement"),
  exportEntitlementTitle: $("exportEntitlementTitle"),
  exportEntitlementMeter: $("exportEntitlementMeter"),
  exportEntitlementFill: $("exportEntitlementFill"),
  exportGate: $("exportGate"),
  exportGateTitle: $("exportGateTitle"),
  exportGateDetail: $("exportGateDetail"),
  exportGateDismiss: $("exportGateDismiss"),
  wizardSignalButton: $("wizardSignalButton"),
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
  masterControlsPane: document.querySelector(".master-controls-pane"),
  masterScrollIndicator: document.querySelector(".master-scroll-indicator"),
  masterScrollThumb: document.querySelector(".master-scroll-indicator span"),
  pageScrollIndicator: document.querySelector(".page-scroll-indicator"),
  pageScrollThumb: document.querySelector(".page-scroll-indicator span"),
  stagePane: document.querySelector(".stage-pane"),
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
    themeScheme: "monochrome",
    colors: [
      [8, 18, 14],
      [25, 72, 38],
      [92, 174, 84],
      [198, 255, 151],
    ],
  },
  vectorBlack: {
    name: "Black Vector",
    themeScheme: "monochrome",
    colors: [
      [16, 18, 17],
      [229, 236, 220],
    ],
  },
  gameboy: {
    name: "GameBoy Original",
    themeScheme: "monochrome",
    colors: [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
  },
  gameboyPocket: {
    name: "GameBoy Pocket",
    themeScheme: "monochrome",
    colors: [
      [28, 28, 28],
      [86, 86, 86],
      [139, 139, 139],
      [196, 196, 196],
    ],
  },
  nes: {
    name: "NES",
    colors: [
      [124, 124, 124],
      [0, 0, 252],
      [0, 0, 188],
      [68, 40, 188],
      [148, 0, 132],
      [168, 0, 32],
      [168, 16, 0],
      [136, 20, 0],
      [80, 48, 0],
      [0, 120, 0],
      [0, 104, 0],
      [0, 88, 0],
      [0, 64, 88],
      [0, 0, 0],
    ],
  },
  virtualBoy: {
    name: "Virtual Boy",
    themeScheme: "monochrome",
    colors: [
      [0, 0, 0],
      [56, 0, 0],
      [112, 0, 0],
      [168, 0, 0],
      [224, 0, 0],
    ],
  },
  c64: {
    name: "Commodore 64",
    colors: [
      [0, 0, 0],
      [255, 255, 255],
      [136, 0, 0],
      [170, 255, 238],
      [204, 68, 204],
      [0, 204, 85],
      [0, 0, 170],
      [238, 238, 119],
      [221, 136, 85],
      [102, 68, 0],
      [255, 119, 119],
      [51, 51, 51],
      [119, 119, 119],
      [170, 255, 102],
      [0, 136, 255],
      [187, 187, 187],
    ],
  },
  zxSpectrum: {
    name: "ZX Spectrum",
    colors: [
      [0, 0, 0],
      [0, 0, 215],
      [215, 0, 0],
      [215, 0, 215],
      [0, 215, 0],
      [0, 215, 215],
      [215, 215, 0],
      [215, 215, 215],
    ],
  },
  appleII: {
    name: "Apple II",
    colors: [
      [0, 0, 0],
      [255, 20, 147],
      [0, 0, 255],
      [255, 215, 0],
      [0, 100, 0],
      [255, 255, 255],
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
  cgaMode4: {
    name: "CGA Mode 4",
    colors: [
      [0, 0, 0],
      [85, 255, 255],
      [255, 85, 85],
      [255, 255, 255],
    ],
  },
  pico8: {
    name: "Pico-8",
    colors: [
      [0, 0, 0],
      [29, 43, 83],
      [126, 37, 83],
      [0, 135, 81],
      [171, 82, 54],
      [95, 87, 79],
      [194, 195, 199],
      [255, 241, 232],
      [255, 0, 77],
      [255, 163, 0],
      [255, 236, 39],
      [0, 228, 54],
      [41, 173, 255],
      [131, 118, 156],
      [255, 119, 168],
      [255, 204, 170],
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
    name: "Macintosh SE",
    themeScheme: "monochrome",
    colors: [
      [0, 0, 0],
      [255, 255, 255],
    ],
  },
  blueprint: {
    name: "Blueprint Cyan",
    themeScheme: "monochrome",
    colors: [
      [5, 10, 18],
      [17, 55, 96],
      [58, 139, 204],
      [158, 224, 237],
      [230, 242, 235],
    ],
  },
  amberCrt: {
    name: "Amber CRT",
    themeScheme: "monochrome",
    colors: [
      [17, 12, 5],
      [82, 45, 10],
      [214, 132, 42],
      [255, 216, 125],
      [246, 236, 190],
    ],
  },
  ultraviolet: {
    name: "Ultraviolet Glitch",
    colors: [
      [10, 8, 20],
      [53, 38, 98],
      [148, 80, 220],
      [238, 97, 185],
      [130, 224, 212],
    ],
  },
  signalRed: {
    name: "Signal Red",
    themeScheme: "monochrome",
    colors: [
      [12, 8, 9],
      [73, 16, 25],
      [185, 32, 54],
      [255, 92, 82],
      [244, 204, 154],
    ],
  },
  acidBath: {
    name: "Acid Bath",
    colors: [
      [7, 14, 11],
      [24, 78, 50],
      [105, 236, 109],
      [230, 244, 93],
      [80, 218, 204],
    ],
  },
  lunarLab: {
    name: "Lunar Lab",
    themeScheme: "monochrome",
    colors: [
      [20, 22, 24],
      [78, 86, 91],
      [151, 160, 156],
      [222, 223, 207],
    ],
  },
  hotlineMiami: {
    name: "Hotline Miami",
    colors: [
      [26, 26, 46],
      [22, 33, 62],
      [15, 52, 96],
      [233, 69, 96],
      [0, 255, 245],
    ],
  },
  moltenRock: {
    name: "Molten Rock",
    colors: [
      [26, 5, 0],
      [74, 13, 0],
      [130, 30, 0],
      [181, 57, 0],
      [232, 93, 4],
      [255, 186, 8],
    ],
  },
  deepOcean: {
    name: "Deep Ocean",
    colors: [
      [0, 18, 25],
      [0, 95, 115],
      [10, 147, 150],
      [148, 210, 189],
      [233, 216, 166],
    ],
  },
  nordTheme: {
    name: "Nord Theme",
    colors: [
      [46, 52, 64],
      [59, 66, 82],
      [67, 76, 94],
      [76, 86, 106],
      [216, 222, 233],
      [229, 233, 240],
      [236, 239, 244],
      [143, 188, 187],
      [136, 192, 208],
      [129, 161, 193],
      [94, 129, 172],
    ],
  },
  dracula: {
    name: "Dracula",
    colors: [
      [40, 42, 54],
      [68, 71, 90],
      [248, 248, 242],
      [98, 114, 164],
      [139, 233, 253],
      [80, 250, 123],
      [255, 184, 108],
      [255, 121, 198],
      [189, 147, 249],
      [255, 85, 85],
      [241, 250, 140],
    ],
  },
  solarizedDark: {
    name: "Solarized Dark",
    colors: [
      [0, 43, 54],
      [7, 54, 66],
      [88, 110, 117],
      [101, 123, 131],
      [131, 148, 150],
      [147, 161, 161],
      [238, 232, 213],
      [253, 246, 227],
      [181, 137, 0],
      [203, 75, 22],
      [220, 50, 47],
      [211, 54, 130],
      [108, 113, 196],
      [38, 139, 210],
      [42, 161, 152],
      [133, 153, 0],
    ],
  },
  monokai: {
    name: "Monokai",
    colors: [
      [39, 40, 34],
      [249, 38, 114],
      [102, 217, 239],
      [166, 226, 46],
      [253, 151, 31],
      [230, 219, 116],
    ],
  },
  gruvbox: {
    name: "Gruvbox",
    colors: [
      [40, 40, 40],
      [204, 36, 29],
      [152, 151, 26],
      [215, 153, 33],
      [69, 133, 136],
      [177, 98, 134],
      [104, 157, 106],
      [168, 153, 132],
      [146, 131, 116],
      [251, 73, 52],
      [184, 187, 38],
      [250, 189, 47],
      [131, 165, 152],
      [211, 134, 155],
      [142, 192, 124],
      [235, 219, 178],
    ],
  },
  cyberpunkNeon: {
    name: "Cyberpunk Neon",
    colors: [
      [11, 12, 21],
      [24, 42, 58],
      [38, 64, 86],
      [20, 184, 166],
      [244, 63, 94],
      [139, 92, 246],
      [254, 243, 199],
    ],
  },
  vaporwave: {
    name: "Vaporwave",
    colors: [
      [44, 33, 55],
      [70, 54, 90],
      [118, 101, 156],
      [139, 186, 199],
      [231, 151, 150],
      [215, 75, 118],
    ],
  },
  synthwaveSunset: {
    name: "Synthwave Sunset",
    colors: [
      [43, 33, 58],
      [76, 47, 105],
      [176, 48, 92],
      [235, 86, 75],
      [255, 155, 94],
      [243, 216, 125],
    ],
  },
  ammo8: {
    name: "Ammo-8",
    themeScheme: "monochrome",
    colors: [
      [4, 12, 6],
      [17, 35, 24],
      [30, 58, 41],
      [48, 93, 66],
      [77, 128, 97],
      [137, 162, 87],
      [190, 204, 133],
      [205, 222, 163],
    ],
  },
  obraDinn: {
    name: "Obra Dinn",
    themeScheme: "monochrome",
    colors: [
      [29, 31, 33],
      [197, 193, 163],
    ],
  },
  matrix: {
    name: "Matrix",
    themeScheme: "monochrome",
    colors: [
      [0, 0, 0],
      [0, 59, 0],
      [0, 143, 17],
      [0, 255, 65],
      [204, 255, 204],
    ],
  },
  blueprintClassic: {
    name: "Blueprint",
    themeScheme: "monochrome",
    colors: [
      [0, 34, 102],
      [0, 51, 153],
      [0, 68, 204],
      [255, 255, 255],
    ],
  },
};

const ADAPTIVE_PALETTE_PREVIEW = [
  [24, 26, 25],
  [68, 74, 72],
  [112, 122, 118],
  [166, 176, 170],
  [226, 232, 220],
];

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
    settings: { cell: 2, levels: 5, contrast: 16, brightness: 2, gamma: 0.92, noise: 3, threshold: 132, temporal: 8 },
    effects: [{ id: "epsilon-glow", strength: 12, enabled: true }],
  },
  {
    name: "Tokyo Nightlife",
    detail: "neon / clear",
    algorithm: "sierra-lite",
    palette: "cyberpunkNeon",
    settings: { cell: 2, levels: 8, contrast: 8, brightness: 6, gamma: 0.96, noise: 5, threshold: 128, temporal: 18 },
    effects: [
      { id: "epsilon-glow", strength: 12, enabled: true },
      { id: "chromatic-aberration", strength: 6, enabled: true },
    ],
  },
  {
    name: "Tron Grid",
    detail: "blue / crisp",
    algorithm: "blue-noise",
    palette: "blueprint",
    settings: { cell: 2, levels: 7, contrast: 12, brightness: 8, gamma: 0.98, noise: 1, threshold: 128, temporal: 12 },
    effects: [
      { id: "epsilon-glow", strength: 14, enabled: true },
      { id: "scanlines", strength: 8, enabled: true },
    ],
  },
  {
    name: "Clear Proof",
    detail: "adaptive / clean",
    algorithm: "atkinson",
    palette: "adaptive",
    settings: { cell: 1, levels: 11, contrast: 4, brightness: 5, gamma: 1, noise: 0, threshold: 128, temporal: 6 },
    effects: [{ id: "epsilon-glow", strength: 6, enabled: true }],
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
  {
    name: "Old VHS",
    detail: "tape / drift",
    algorithm: "scanline-split",
    palette: "adaptive",
    settings: { cell: 2, levels: 7, contrast: -10, brightness: -6, gamma: 0.92, noise: 34, threshold: 126, temporal: 76 },
    effects: [
      { id: "noise", strength: 26, enabled: true },
      { id: "chromatic-aberration", strength: 28, enabled: true },
      { id: "jpeg-glitch", strength: 14, enabled: true },
      { id: "vignette", strength: 16, enabled: true },
    ],
  },
  {
    name: "CRT Monitor",
    detail: "warp / phos",
    algorithm: "crt-warp",
    palette: "phosphor",
    settings: { cell: 2, levels: 4, contrast: 28, brightness: -9, gamma: 1.18, noise: 9, threshold: 122, temporal: 36 },
    effects: [
      { id: "scanlines", strength: 48, enabled: true },
      { id: "epsilon-glow", strength: 22, enabled: true },
      { id: "chromatic-aberration", strength: 10, enabled: true },
      { id: "vignette", strength: 22, enabled: true },
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
  randomSourceVisibilityGuard: false,
  duration: 4,
  time: 0,
  playing: false,
  livePreview: true,
  animateStill: true,
  view: "processed",
  dirty: true,
  batchFiles: [],
  animatedImage: null,
  isRecording: false,
  isExporting: false,
  lastFrameAt: performance.now(),
  lastPlaybackUiSyncAt: 0,
  lastRenderCost: 0,
  nextAnimatedRenderAt: 0,
  fpsFrames: 0,
  fpsAt: performance.now(),
  themeSeed: null,
  sourceThemeSeed: null,
  editThemeSeed: null,
  ditherViewThemeSeed: null,
  sourceViewThemeSeed: null,
  editThemeActive: false,
  lastThemeAt: 0,
  lastSourceThemeAt: 0,
  lastEditThemeAt: 0,
  lastSourceViewThemeAt: 0,
  pendingSourceThemeReset: false,
  pendingOutputThemeSeed: false,
  exportSourceName: "procedural.png",
  exportSourceBytes: null,
  exportSourceFormat: "PNG",
  exportTargetFormat: "PNG",
  exportDitheredBytes: null,
  exportMetricsRequest: 0,
  exportMetricsAt: 0,
  sourceMetricsRequest: 0,
  exportPreviewFormat: "gif",
};

const DITHER_TEXT_SELECTOR = [
  ".wizard-source-main",
  ".segment",
  ".meter-strip span",
  ".system-strip span",
  ".palette-option-name",
  ".effect-title > span",
  ".slider-control > label",
  ".slider-control > output",
  ".preset-button strong",
  ".preset-button span",
  ".file-size-head strong",
  ".file-size-list dt",
  ".file-size-list dd",
  ".export-entitlement strong",
  ".export-entitlement span",
  ".export-preview span",
  ".export-gif-button",
  ".export-grid button",
  ".media-actions button:not(.icon-button):not(.wizard-source-button)",
  "#exportFileName",
  ".batch-empty",
].join(",");

const LOGOTYPE_TEXTURE_WIDTH = 229;
const LOGOTYPE_TEXTURE_HEIGHT = 54;
const LOGOTYPE_SURFACE_SELECTOR = ".brand-logotype-art";
const LOGOTYPE_CONTRAST_CEILING = -21;
const LOGOTYPE_BIAS_FLOOR = -25;
const LOGOTYPE_EPSILON_GLOW_FLOOR = 52;
const CLARITY_SPECIAL_ALGORITHMS = new Set([
  "cmyk-halftone",
  "newsprint",
  "riso-grain",
  "vector-hatch",
  "threshold-bloom",
]);
const CLARITY_EFFECT_POOL = [
  { id: "epsilon-glow", weight: 6, min: 16, max: 38 },
  { id: "scanlines", weight: 5, min: 10, max: 24 },
  { id: "posterize", weight: 4, min: 8, max: 22 },
  { id: "noise", weight: 3, min: 4, max: 16 },
  { id: "chromatic-aberration", weight: 2, min: 6, max: 16 },
  { id: "cmyk-shift", weight: 2, min: 6, max: 14 },
];
const RANDOM_SOURCE_CLARITY_ALGORITHMS = [
  { id: "atkinson", weight: 9 },
  { id: "floyd-steinberg", weight: 8 },
  { id: "sierra-lite", weight: 7 },
  { id: "burkes", weight: 6 },
  { id: "bayer-4", weight: 5 },
  { id: "blue-noise", weight: 5 },
  { id: "newsprint", weight: 3 },
  { id: "riso-grain", weight: 2 },
  { id: "cmyk-halftone", weight: 2 },
];
const RANDOM_SOURCE_CLARITY_PALETTES = [
  { id: "adaptive", weight: 24 },
  { id: "riso", weight: 4 },
  { id: "cmyk", weight: 3 },
  { id: "heat", weight: 3 },
  { id: "c64", weight: 2 },
];
const RANDOM_SOURCE_CLARITY_EFFECTS = [
  { id: "epsilon-glow", weight: 5, min: 8, max: 16 },
  { id: "scanlines", weight: 4, min: 6, max: 12 },
  { id: "posterize", weight: 2, min: 5, max: 10 },
];
const RANDOM_SOURCE_VISIBILITY_GUARD = {
  lowMean: 46,
  highMean: 212,
  minRange: 58,
  minDeviation: 21,
  targetMean: 132,
  targetRange: 148,
  maxSamples: 12000,
};

const WIZARD_SIGNAL_PALETTES = [
  ["rgb(7,18,17)", "rgb(33,74,50)", "rgb(190,218,120)", "rgb(240,174,76)", "rgb(236,92,134)"],
  ["rgb(10,15,28)", "rgb(32,52,98)", "rgb(82,196,176)", "rgb(244,211,94)", "rgb(233,96,96)"],
  ["rgb(19,10,17)", "rgb(68,38,72)", "rgb(204,84,124)", "rgb(254,205,116)", "rgb(138,227,179)"],
  ["rgb(9,20,30)", "rgb(24,82,92)", "rgb(91,199,141)", "rgb(214,238,144)", "rgb(244,113,88)"],
  ["rgb(18,15,8)", "rgb(68,47,25)", "rgb(205,147,69)", "rgb(248,226,145)", "rgb(107,222,202)"],
];

const WIZARD_SIGNAL_NAMES = ["orbital", "lantern", "rune", "cipher", "threshold", "relay", "apparition"];

let renderRaf = 0;
let playbackRaf = 0;
let objectUrl = "";
let lastExportUrl = "";
let exportMetricsTimer = 0;
let exportStatusTimer = 0;
let pageScrollHideTimer = 0;
let errorDiffusionBuffer = new Float32Array(0);
let logotypeRaf = 0;
let lastLogotypeRenderAt = 0;
let logotypeSurfaces = [];
const unavailableRandomSourceIds = new Set();
const luminanceSortedPaletteCache = new WeakMap();
const themeCanvas = document.createElement("canvas");
const themeCtx = themeCanvas.getContext("2d", { willReadFrequently: true });
const logotypeSourceCanvas = document.createElement("canvas");
const logotypeWorkCanvas = document.createElement("canvas");
const logotypePipelineCanvas = document.createElement("canvas");
const logotypeSourceCtx = logotypeSourceCanvas.getContext("2d", { willReadFrequently: true });
const logotypeWorkCtx = logotypeWorkCanvas.getContext("2d", { willReadFrequently: true });
const logotypePipelineCtx = logotypePipelineCanvas.getContext("2d", { willReadFrequently: true });

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

function themeSeedScheme(seed) {
  if (!seed || typeof seed !== "object") return null;
  if (seed.scheme === "monochrome" || seed.monochrome === true) return "monochrome";
  return null;
}

function isMonochromaticColorSet(colors) {
  if (!Array.isArray(colors) || colors.length < 2) return false;
  const samples = [];
  let saturationTotal = 0;

  colors.forEach((color) => {
    if (!Array.isArray(color) || color.length < 3) return;
    const hsl = rgbToHsl(color[0], color[1], color[2]);
    saturationTotal += hsl.saturation;
    if (hsl.saturation <= 0.12 || hsl.lightness <= 0.06 || hsl.lightness >= 0.94) return;
    const midtoneWeight = 1 - Math.min(0.7, Math.abs(hsl.lightness - 0.52) * 1.25);
    samples.push({ hue: hsl.hue, weight: Math.max(0.2, hsl.saturation) * midtoneWeight });
  });

  if (!samples.length) return saturationTotal / colors.length < 0.12;
  if (samples.length === 1) return true;

  const vector = samples.reduce(
    (acc, sample) => {
      const radians = (sample.hue * Math.PI) / 180;
      acc.x += Math.cos(radians) * sample.weight;
      acc.y += Math.sin(radians) * sample.weight;
      return acc;
    },
    { x: 0, y: 0 },
  );
  const meanHue = normalizeHue((Math.atan2(vector.y, vector.x) * 180) / Math.PI);
  const maxSpread = Math.max(...samples.map((sample) => hueDistance(sample.hue, meanHue)));
  return maxSpread <= 24;
}

function paletteThemeScheme(id = state.palette, colors = getPalettePreviewColors(id)) {
  if (id === "adaptive") return null;
  const configured = id !== "custom" ? PALETTES[id]?.themeScheme : null;
  if (configured === "monochrome") return configured;
  return isMonochromaticColorSet(colors) ? "monochrome" : null;
}

function withPaletteThemeMetadata(seed, paletteId = state.palette, colors = getPalettePreviewColors(paletteId), label = "palette") {
  if (!seed || paletteId === "adaptive") return seed;
  const paletteName = paletteId === "custom" ? "Custom palette" : PALETTES[paletteId]?.name;
  if (!paletteName) return seed;
  const scheme = paletteThemeScheme(paletteId, colors);
  return {
    ...seed,
    id: `home-palette-${paletteId}`,
    name: `${paletteName} ${label}`,
    ...(scheme ? { scheme, monochrome: scheme === "monochrome" } : {}),
  };
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
  const monochrome = themeSeedScheme(seed) === "monochrome";
  const chroma = monochrome
    ? clamp(0.045 + seed.saturation * 0.13, 0.035, 0.18)
    : clamp(0.08 + seed.saturation * 0.17, 0.1, 0.23);
  const secondaryHue = monochrome ? hue : normalizeHue(hue + 22);
  const tertiaryHue = monochrome ? hue : normalizeHue(hue + 64);
  const neutralHue = monochrome ? hue : normalizeHue(hue + 5);
  const neutralChroma = monochrome
    ? clamp(0.008 + seed.saturation * 0.018, 0.01, 0.034)
    : clamp(0.01 + seed.saturation * 0.03, 0.012, 0.048);
  const variantChroma = monochrome
    ? clamp(0.018 + seed.saturation * 0.035, 0.022, 0.064)
    : clamp(0.024 + seed.saturation * 0.058, 0.034, 0.09);
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

function blendSeeds(base, overlay, amount, options = {}) {
  const next = {
    hue: mixHue(base.hue, overlay.hue, amount),
    saturation: clamp01(lerp(base.saturation, overlay.saturation, amount)),
    rgb: base.rgb.map((value, index) => Math.round(lerp(value, overlay.rgb[index], amount))),
  };
  const metadataSource = themeSeedScheme(overlay) ? overlay : options.preserveBaseScheme && themeSeedScheme(base) ? base : null;
  if (metadataSource) {
    if (metadataSource.id) next.id = metadataSource.id;
    if (metadataSource.name) next.name = metadataSource.name;
    const scheme = themeSeedScheme(metadataSource);
    if (scheme) {
      next.scheme = scheme;
      next.monochrome = scheme === "monochrome";
    }
  }
  return next;
}

function syncLogotypeSourceTone(seed = state.sourceThemeSeed || state.themeSeed) {
  if (!seed?.rgb?.length) return;
  document.documentElement.style.setProperty("--logotype-source-tone", rgbCss(seed.rgb));
  document.documentElement.style.setProperty("--logotype-source-tone-alpha", "0.15");
}

function applyThemeSeed(seed, force = false, smoothing = 0.28) {
  let nextSeed = seed;
  if (state.themeSeed && !force) {
    nextSeed = blendSeeds(state.themeSeed, seed, smoothing);
  }
  const currentScheme = themeSeedScheme(state.themeSeed);
  const nextScheme = themeSeedScheme(nextSeed);
  const shouldApply =
    !state.themeSeed ||
    force ||
    currentScheme !== nextScheme ||
    hueDistance(state.themeSeed.hue, nextSeed.hue) > 1 ||
    Math.abs(state.themeSeed.saturation - nextSeed.saturation) > 0.012;
  state.themeSeed = nextSeed;
  state.lastThemeAt = performance.now();
  syncLogotypeSourceTone(state.sourceThemeSeed || nextSeed);
  if (shouldApply) {
    applyDynamicThemeRoles(nextSeed);
    window.DitherColorRuntime?.recordPageSeed(
      { ...nextSeed, id: nextSeed.id || "home-artwork", name: nextSeed.name || "Home artwork" },
      { page: "home" },
    );
  }
}

function updateDynamicThemeFromCanvas(canvas, force = false, options = {}) {
  const now = performance.now();
  const minInterval = options.minInterval ?? (state.playing ? ANIMATED_THEME_INTERVAL : IDLE_THEME_INTERVAL);
  const lastThemeUpdateAt = options.source ? state.lastSourceThemeAt : options.deferApply ? state.lastEditThemeAt : state.lastThemeAt;
  if (!force && now - lastThemeUpdateAt < minInterval) return;
  if (!options.source && !state.editThemeActive && !options.allowInactive) return;
  const sampledSeed = options.source
    ? extractArtworkSeed(canvas)
    : withPaletteThemeMetadata(extractArtworkSeed(canvas), state.palette, getPalettePreviewColors(state.palette), "output");

  if (options.source) {
    state.sourceThemeSeed = sampledSeed;
    state.sourceViewThemeSeed = sampledSeed;
    syncLogotypeSourceTone(sampledSeed);
    state.lastSourceThemeAt = now;
    state.lastSourceViewThemeAt = now;
    if (options.resetEdit) {
      state.editThemeSeed = null;
      state.ditherViewThemeSeed = null;
      state.editThemeActive = false;
      state.lastEditThemeAt = 0;
      state.pendingSourceThemeReset = false;
    }
    if (options.deferApply) return;
    applyThemeSeed(sampledSeed, options.forceApply ?? true, options.smoothing ?? 1);
    return;
  }

  state.editThemeSeed = sampledSeed;
  state.lastEditThemeAt = now;
  const sourceAnchor = options.sourceAnchor ?? 0.08;
  const seed = state.sourceThemeSeed
    ? blendSeeds(sampledSeed, state.sourceThemeSeed, sourceAnchor, { preserveBaseScheme: true })
    : sampledSeed;
  state.ditherViewThemeSeed = seed;
  if (options.deferApply) return;
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

function luminanceStats(data, pixelCount, maxSamples = RANDOM_SOURCE_VISIBILITY_GUARD.maxSamples) {
  if (!data || !pixelCount) return { mean: 0, deviation: 0, range: 0, min: 0, max: 0 };
  const sampleStep = Math.max(1, Math.floor(pixelCount / maxSamples));
  let min = 255;
  let max = 0;
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let pixel = 0; pixel < pixelCount; pixel += sampleStep) {
    const index = pixel * 4;
    const value = luminance(data[index], data[index + 1], data[index + 2]);
    min = Math.min(min, value);
    max = Math.max(max, value);
    sum += value;
    sumSq += value * value;
    count += 1;
  }
  const mean = count ? sum / count : 0;
  const variance = count ? Math.max(0, sumSq / count - mean * mean) : 0;
  return {
    mean,
    deviation: Math.sqrt(variance),
    range: max - min,
    min,
    max,
  };
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

function isGifFile(file) {
  return file?.type === "image/gif" || /\.gif$/i.test(file?.name || "");
}

function isAnimatedImageSource() {
  return state.sourceType === "animated-image" && state.animatedImage?.frames?.length > 0;
}

function sourceHasNativeMotion() {
  return state.sourceType === "video" || isAnimatedImageSource();
}

function sourceViewThemeInterval() {
  return sourceHasNativeMotion() ? SOURCE_VIEW_MOTION_THEME_INTERVAL : SOURCE_VIEW_THEME_INTERVAL;
}

function motionThemeActive() {
  return sourceHasNativeMotion();
}

function sourceDuration() {
  if (state.sourceType === "video") return video.duration || state.duration || 1;
  return state.duration || 1;
}

function clearAnimatedImageSource() {
  state.animatedImage = null;
}

function paletteThemeSeed(colors = getPalettePreviewColors(state.palette), paletteId = state.palette) {
  const palette = colors?.length ? colors : ADAPTIVE_PALETTE_PREVIEW;
  let winner = null;
  for (const color of palette) {
    const hsl = rgbToHsl(color[0], color[1], color[2]);
    const midtoneWeight = 1 - Math.min(0.86, Math.abs(hsl.lightness - 0.56) * 1.35);
    const colorWeight = 0.06 + Math.pow(hsl.saturation, 1.25) * 2.4;
    const weight = midtoneWeight * colorWeight;
    if (!winner || weight > winner.weight) winner = { color, hsl, weight };
  }
  if (!winner || winner.weight < 0.05) {
    return withPaletteThemeMetadata(
      { hue: 148, saturation: 0.42, rgb: [112, 122, 118] },
      paletteId,
      palette,
    );
  }
  return withPaletteThemeMetadata({
    hue: winner.hsl.hue,
    saturation: clamp01(Math.max(winner.hsl.saturation, 0.38)),
    rgb: winner.color,
  }, paletteId, palette);
}

function applyPaletteTheme(force = false, smoothing = 0.2) {
  const seed = paletteThemeSeed();
  applyThemeSeed(seed, force, force ? 1 : smoothing);
  return seed;
}

function applyMotionPaletteTheme(force = false, options = {}) {
  if (!sourceHasNativeMotion()) return false;
  const shouldApply = options.apply ?? true;
  const seed = paletteThemeSeed();
  if (shouldApply) applyThemeSeed(seed, force, force ? 1 : 0.2);
  state.sourceThemeSeed = seed;
  state.ditherViewThemeSeed = seed;
  syncLogotypeSourceTone(seed);
  state.pendingSourceThemeReset = false;
  state.lastSourceThemeAt = performance.now();
  return true;
}

function syncSourceCanvasForTheme() {
  if (state.sourceType === "video") {
    if (video.readyState < 2) return false;
    sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceCtx.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);
    return true;
  }
  if (isAnimatedImageSource()) {
    drawAnimatedImageFrame(state.time);
    return true;
  }
  return sourceCanvas.width > 0 && sourceCanvas.height > 0;
}

function currentDitherViewThemeSeed() {
  if (state.ditherViewThemeSeed) return state.ditherViewThemeSeed;
  if (sourceHasNativeMotion()) return state.sourceThemeSeed || paletteThemeSeed();
  if (state.editThemeSeed && state.sourceThemeSeed) {
    return blendSeeds(state.editThemeSeed, state.sourceThemeSeed, 0.08, { preserveBaseScheme: true });
  }
  return state.editThemeSeed || state.sourceThemeSeed || state.themeSeed || paletteThemeSeed();
}

function applySourceViewTheme(force = false, smoothing = 1) {
  const canSample = syncSourceCanvasForTheme();
  const seed = canSample
    ? extractArtworkSeed(sourceCanvas)
    : state.sourceViewThemeSeed || state.sourceThemeSeed || state.themeSeed || paletteThemeSeed();
  state.sourceViewThemeSeed = seed;
  state.lastSourceViewThemeAt = performance.now();
  state.pendingSourceThemeReset = false;
  applyThemeSeed(seed, force, force ? 1 : smoothing);
  return seed;
}

function applyPreviewViewTheme(view = state.view, force = true) {
  if (view === "source") return applySourceViewTheme(force, 1);
  const seed = currentDitherViewThemeSeed();
  if (seed) applyThemeSeed(seed, force, 1);
  return seed;
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

function createGifReader(arrayBuffer) {
  return {
    bytes: new Uint8Array(arrayBuffer),
    offset: 0,
  };
}

function readGifByte(reader) {
  if (reader.offset >= reader.bytes.length) throw new Error("Unexpected end of GIF data");
  return reader.bytes[reader.offset++];
}

function readGifUnsigned(reader) {
  const low = readGifByte(reader);
  const high = readGifByte(reader);
  return low | (high << 8);
}

function readGifAscii(reader, length) {
  let text = "";
  for (let i = 0; i < length; i++) text += String.fromCharCode(readGifByte(reader));
  return text;
}

function readGifColorTable(reader, colorCount) {
  const colors = [];
  for (let i = 0; i < colorCount; i++) {
    colors.push([readGifByte(reader), readGifByte(reader), readGifByte(reader)]);
  }
  return colors;
}

function readGifSubBlocks(reader) {
  const chunks = [];
  let total = 0;
  while (true) {
    const size = readGifByte(reader);
    if (!size) break;
    if (reader.offset + size > reader.bytes.length) throw new Error("Unexpected end of GIF sub-block");
    chunks.push(reader.bytes.slice(reader.offset, reader.offset + size));
    reader.offset += size;
    total += size;
  }
  const data = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }
  return data;
}

function skipGifSubBlocks(reader) {
  while (true) {
    const size = readGifByte(reader);
    if (!size) break;
    reader.offset += size;
    if (reader.offset > reader.bytes.length) throw new Error("Unexpected end of GIF sub-block");
  }
}

function decodeGifLzw(minCodeSize, data, expectedLength) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  let bitOffset = 0;
  let table = [];
  let previous = null;
  const output = new Uint16Array(expectedLength);
  let outputOffset = 0;

  const resetTable = () => {
    table = Array.from({ length: endCode + 1 }, (_, index) => (index < clearCode ? [index] : null));
    codeSize = minCodeSize + 1;
    nextCode = endCode + 1;
    previous = null;
  };

  const readCode = () => {
    let code = 0;
    for (let bit = 0; bit < codeSize; bit++) {
      const byteIndex = bitOffset >> 3;
      if (byteIndex >= data.length) return null;
      const bitIndex = bitOffset & 7;
      code |= ((data[byteIndex] >> bitIndex) & 1) << bit;
      bitOffset += 1;
    }
    return code;
  };

  resetTable();

  while (outputOffset < expectedLength) {
    const code = readCode();
    if (code === null || code === endCode) break;
    if (code === clearCode) {
      resetTable();
      continue;
    }

    let entry = table[code];
    if (entry) {
      entry = entry.slice();
    } else if (code === nextCode && previous) {
      entry = previous.concat(previous[0]);
    } else {
      break;
    }

    for (let i = 0; i < entry.length && outputOffset < expectedLength; i++) {
      output[outputOffset++] = entry[i];
    }

    if (previous) {
      table[nextCode] = previous.concat(entry[0]);
      nextCode += 1;
      if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
    }
    previous = entry;
  }

  return output;
}

function deinterlaceGifIndices(indices, width, height) {
  const output = new Uint16Array(width * height);
  const passes = [
    { start: 0, step: 8 },
    { start: 4, step: 8 },
    { start: 2, step: 4 },
    { start: 1, step: 2 },
  ];
  let source = 0;
  for (const pass of passes) {
    for (let y = pass.start; y < height; y += pass.step) {
      for (let x = 0; x < width; x++) {
        output[y * width + x] = indices[source++] || 0;
      }
    }
  }
  return output;
}

function makeGifImageData(data, width, height) {
  if (typeof ImageData === "function") return new ImageData(data, width, height);
  return { data, width, height };
}

function clearGifRect(buffer, canvasWidth, left, top, width, height, backgroundColor = null) {
  const maxX = Math.min(canvasWidth, left + width);
  const maxY = Math.min(buffer.length / 4 / canvasWidth, top + height);
  const color = backgroundColor || [0, 0, 0];
  const alpha = backgroundColor ? 255 : 0;
  for (let y = Math.max(0, top); y < maxY; y++) {
    for (let x = Math.max(0, left); x < maxX; x++) {
      const index = (y * canvasWidth + x) * 4;
      buffer[index] = color[0];
      buffer[index + 1] = color[1];
      buffer[index + 2] = color[2];
      buffer[index + 3] = alpha;
    }
  }
}

function drawGifIndexedFrame(buffer, canvasWidth, frame, indices, colorTable, transparentIndex) {
  const { left, top, width, height } = frame;
  for (let y = 0; y < height; y++) {
    const targetY = top + y;
    if (targetY < 0 || targetY >= buffer.length / 4 / canvasWidth) continue;
    for (let x = 0; x < width; x++) {
      const colorIndex = indices[y * width + x];
      if (colorIndex === transparentIndex) continue;
      const color = colorTable[colorIndex] || [0, 0, 0];
      const targetX = left + x;
      if (targetX < 0 || targetX >= canvasWidth) continue;
      const index = (targetY * canvasWidth + targetX) * 4;
      buffer[index] = color[0];
      buffer[index + 1] = color[1];
      buffer[index + 2] = color[2];
      buffer[index + 3] = 255;
    }
  }
}

function decodeAnimatedGif(arrayBuffer) {
  const reader = createGifReader(arrayBuffer);
  const signature = readGifAscii(reader, 6);
  if (signature !== "GIF87a" && signature !== "GIF89a") throw new Error("Unsupported GIF signature");

  const width = readGifUnsigned(reader);
  const height = readGifUnsigned(reader);
  const packed = readGifByte(reader);
  const hasGlobalColorTable = Boolean(packed & 0x80);
  const globalColorCount = 1 << ((packed & 0x07) + 1);
  const backgroundIndex = readGifByte(reader);
  readGifByte(reader);
  const globalColorTable = hasGlobalColorTable ? readGifColorTable(reader, globalColorCount) : null;
  const backgroundColor = globalColorTable?.[backgroundIndex] || null;
  const composite = new Uint8ClampedArray(width * height * 4);
  if (backgroundColor) clearGifRect(composite, width, 0, 0, width, height, backgroundColor);

  const frames = [];
  let graphicControl = {
    delay: GIF_SOURCE_DEFAULT_DELAY,
    disposal: 0,
    transparentIndex: null,
  };

  while (reader.offset < reader.bytes.length) {
    const block = readGifByte(reader);
    if (block === 0x3b) break;

    if (block === 0x21) {
      const label = readGifByte(reader);
      if (label === 0xf9) {
        const blockSize = readGifByte(reader);
        if (blockSize !== 4) {
          reader.offset += blockSize;
          readGifByte(reader);
          continue;
        }
        const gcePacked = readGifByte(reader);
        const delayCs = readGifUnsigned(reader);
        const transparentIndex = readGifByte(reader);
        readGifByte(reader);
        graphicControl = {
          delay: delayCs ? Math.max(GIF_SOURCE_MIN_DELAY, delayCs / 100) : GIF_SOURCE_DEFAULT_DELAY,
          disposal: (gcePacked >> 2) & 0x07,
          transparentIndex: (gcePacked & 0x01) ? transparentIndex : null,
        };
      } else {
        if (label === 0xff || label === 0x01) {
          const blockSize = readGifByte(reader);
          reader.offset += blockSize;
        }
        skipGifSubBlocks(reader);
      }
      continue;
    }

    if (block !== 0x2c) throw new Error("Unexpected GIF block");

    const frame = {
      left: readGifUnsigned(reader),
      top: readGifUnsigned(reader),
      width: readGifUnsigned(reader),
      height: readGifUnsigned(reader),
    };
    const imagePacked = readGifByte(reader);
    const hasLocalColorTable = Boolean(imagePacked & 0x80);
    const interlaced = Boolean(imagePacked & 0x40);
    const localColorCount = 1 << ((imagePacked & 0x07) + 1);
    const colorTable = hasLocalColorTable ? readGifColorTable(reader, localColorCount) : globalColorTable;
    if (!colorTable) throw new Error("GIF frame is missing a color table");
    const minCodeSize = readGifByte(reader);
    const imageData = readGifSubBlocks(reader);
    let indices = decodeGifLzw(minCodeSize, imageData, frame.width * frame.height);
    if (interlaced) indices = deinterlaceGifIndices(indices, frame.width, frame.height);

    const beforeFrame = graphicControl.disposal === 3 ? new Uint8ClampedArray(composite) : null;
    drawGifIndexedFrame(composite, width, frame, indices, colorTable, graphicControl.transparentIndex);
    frames.push({
      imageData: makeGifImageData(new Uint8ClampedArray(composite), width, height),
      delay: graphicControl.delay,
    });

    if (graphicControl.disposal === 2) {
      clearGifRect(composite, width, frame.left, frame.top, frame.width, frame.height, null);
    } else if (graphicControl.disposal === 3 && beforeFrame) {
      composite.set(beforeFrame);
    }

    graphicControl = {
      delay: GIF_SOURCE_DEFAULT_DELAY,
      disposal: 0,
      transparentIndex: null,
    };
  }

  const duration = frames.reduce((total, frame) => total + frame.delay, 0) || GIF_SOURCE_DEFAULT_DELAY;
  return { width, height, frames, duration };
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
  syncDitherTextElement(els.exportStatus);
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
    els.wizardSignalButton,
    els.randomSourceButton,
    els.recordWebmButton,
    els.recordMp4Button,
    els.recordButton,
    els.exportPaletteButton,
  ].forEach((button) => {
    if (button) button.disabled = disabled;
  });
}

function readLocalNumber(key) {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function writeLocalNumber(key, value) {
  try {
    localStorage.setItem(key, String(Math.max(0, Math.floor(value))));
  } catch {
    return false;
  }
  return true;
}

function syncExportEntitlement() {
  if (!els.exportEntitlement) return;
  const exportCount = readLocalNumber(EXPORT_COUNT_KEY);
  const used = Math.min(exportCount, EXPORT_FREE_LIMIT);
  const remaining = Math.max(0, EXPORT_FREE_LIMIT - exportCount);
  const percent = Math.min(100, (used / EXPORT_FREE_LIMIT) * 100);
  els.exportEntitlement.dataset.state = "preview";
  if (els.exportEntitlementTitle) {
    els.exportEntitlementTitle.textContent = remaining > 0
      ? `${remaining} preview ${remaining === 1 ? "export" : "exports"} left`
      : "Preview meter reached";
  }
  if (els.exportEntitlementMeter) {
    els.exportEntitlementMeter.textContent = `${used} / ${EXPORT_FREE_LIMIT}`;
  }
  if (els.exportEntitlementFill) els.exportEntitlementFill.style.width = `${percent}%`;
}

function showExportGate(format = "export") {
  if (!els.exportGate) return;
  const label = String(format || "export").toUpperCase();
  if (els.exportGateTitle) els.exportGateTitle.textContent = `${label} available`;
  if (els.exportGateDetail) els.exportGateDetail.textContent = "The public static build tracks preview usage locally but does not block exports.";
  els.exportGate.hidden = false;
  setExportStatus("preview meter", "warning", 2400);
  syncExportEntitlement();
}

function canStartMeteredExport() {
  return true;
}

function recordMeteredExport() {
  writeLocalNumber(EXPORT_COUNT_KEY, readLocalNumber(EXPORT_COUNT_KEY) + 1);
  syncExportEntitlement();
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

async function setLastExportLink(blob, filename) {
  clearLastExportLink();
  if (!els.lastExportLink) return "";
  lastExportUrl = URL.createObjectURL(blob);
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
  setExportPreview(state.exportPreviewFormat);
  syncDitherTextElement(els.exportFileName);
  syncDitherTextSurfaces(els.exportPreview);
  syncDitherTextSurfaces(document.querySelector(".file-size-list") || document);
}

function exportRenderSizeLabel() {
  const width = outputCanvas.width || sourceCanvas.width || 0;
  const height = outputCanvas.height || sourceCanvas.height || 0;
  return width && height ? `${width}x${height}` : "--";
}

function exportSourceDuration() {
  return sourceDuration();
}

function formatExportDuration(seconds) {
  const safe = Math.max(0, seconds || 0);
  return `${safe % 1 ? safe.toFixed(1) : Math.round(safe)}s`;
}

function exportPreviewData(format) {
  const size = exportRenderSizeLabel();
  const duration = exportSourceDuration();
  const svgStep = Math.max(state.settings.cell, Math.ceil(Math.max(outputCanvas.width || 0, outputCanvas.height || 0) / 360));
  const previews = {
    gif: {
      label: "GIF Loop",
      details: `${size} / ${GIF_EXPORT_FPS} fps / ${formatExportDuration(Math.min(duration, GIF_EXPORT_MAX_SECONDS))} / animated / shared 256-color palette`,
    },
    png: {
      label: "PNG",
      details: `${size} / lossless / current frame / transparent-safe`,
    },
    jpg: {
      label: "JPG",
      details: `${size} / quality 94 / current frame / smaller file`,
    },
    svg: {
      label: "SVG Vector",
      details: `${size} / threshold trace / step ${svgStep}px / editable vector`,
    },
    webm: {
      label: "WebM Loop",
      details: `${size} / ${WEBM_EXPORT_FPS} fps / ${formatExportDuration(Math.min(duration, WEBM_EXPORT_MAX_SECONDS))} max / high bitrate`,
    },
    mp4: {
      label: "MP4 Loop",
      details: `${size} / ${WEBM_EXPORT_FPS} fps / ${formatExportDuration(Math.min(duration, WEBM_EXPORT_MAX_SECONDS))} max / browser encoded`,
    },
  };
  return previews[format] || previews.gif;
}

function setExportPreview(format = "gif") {
  if (!els.exportPreviewFormat || !els.exportPreviewDetails) return;
  const nextFormat = format || "gif";
  const preview = exportPreviewData(nextFormat);
  state.exportPreviewFormat = nextFormat;
  if (els.exportPreview) els.exportPreview.dataset.format = nextFormat;
  els.exportPreviewFormat.textContent = preview.label;
  els.exportPreviewDetails.textContent = preview.details;
  syncDitherTextElement(els.exportPreviewFormat);
  syncDitherTextElement(els.exportPreviewDetails);
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

function outputNeedsRandomSourceGuard(stats) {
  return (
    stats.mean < RANDOM_SOURCE_VISIBILITY_GUARD.lowMean ||
    stats.mean > RANDOM_SOURCE_VISIBILITY_GUARD.highMean ||
    stats.range < RANDOM_SOURCE_VISIBILITY_GUARD.minRange ||
    stats.deviation < RANDOM_SOURCE_VISIBILITY_GUARD.minDeviation
  );
}

function applyRandomSourceVisibilityGuard(imageData) {
  if (!state.randomSourceVisibilityGuard || !imageData?.data?.length) return;
  const pixelCount = imageData.width * imageData.height;
  const outputStats = luminanceStats(imageData.data, pixelCount);
  if (!outputNeedsRandomSourceGuard(outputStats)) return;

  const sourceData = workCtx.getImageData(0, 0, imageData.width, imageData.height).data;
  const sourceStats = luminanceStats(sourceData, pixelCount);
  const missingRange = Math.max(0, RANDOM_SOURCE_VISIBILITY_GUARD.minRange - outputStats.range);
  const missingDeviation = Math.max(0, RANDOM_SOURCE_VISIBILITY_GUARD.minDeviation - outputStats.deviation);
  const extremeMean = outputStats.mean < RANDOM_SOURCE_VISIBILITY_GUARD.lowMean || outputStats.mean > RANDOM_SOURCE_VISIBILITY_GUARD.highMean;
  const sourceMix = clamp(
    0.18 + missingRange / 150 + missingDeviation / 90 + (extremeMean ? 0.16 : 0),
    0.18,
    0.52,
  );
  const outputScale = clamp(
    RANDOM_SOURCE_VISIBILITY_GUARD.targetRange / Math.max(outputStats.range, 1),
    1.05,
    2.35,
  );
  const sourceScale = clamp(
    RANDOM_SOURCE_VISIBILITY_GUARD.targetRange / Math.max(sourceStats.range, 1),
    0.82,
    2.1,
  );
  const targetMean = RANDOM_SOURCE_VISIBILITY_GUARD.targetMean;
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const outputLuma = luminance(data[index], data[index + 1], data[index + 2]);
    const sourceLuma = luminance(sourceData[index], sourceData[index + 1], sourceData[index + 2]);
    const outputTone = (outputLuma - outputStats.mean) * outputScale + targetMean;
    const sourceTone = (sourceLuma - sourceStats.mean) * sourceScale + targetMean;
    const targetTone = clamp(lerp(outputTone, sourceTone, sourceMix));
    const delta = targetTone - outputLuma;
    data[index] = clamp(data[index] + delta);
    data[index + 1] = clamp(data[index + 1] + delta);
    data[index + 2] = clamp(data[index + 2] + delta);
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

function applyCanvasEffectsToCanvas(targetCanvas, targetCtx, scratchCanvas, scratchCtx, time) {
  const enabled = state.effects.filter((effect) => effect.enabled);
  for (const effect of enabled) {
    const strength = effect.strength / 100;
    if (effect.id === "epsilon-glow") {
      scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
      scratchCtx.filter = `blur(${Math.max(1, strength * 12)}px) brightness(${1 + strength * 2})`;
      scratchCtx.drawImage(targetCanvas, 0, 0);
      scratchCtx.filter = "none";
      targetCtx.save();
      targetCtx.globalAlpha = strength * 0.55;
      targetCtx.globalCompositeOperation = "screen";
      targetCtx.drawImage(scratchCanvas, 0, 0);
      targetCtx.restore();
    }
    if (effect.id === "chromatic-aberration" || effect.id === "cmyk-shift") {
      const offset = Math.round(2 + strength * 12 + Math.sin(time * 3) * strength * 2);
      scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
      scratchCtx.drawImage(targetCanvas, 0, 0);
      targetCtx.save();
      targetCtx.globalCompositeOperation = "screen";
      targetCtx.globalAlpha = 0.28 * strength;
      targetCtx.drawImage(scratchCanvas, offset, 0);
      targetCtx.drawImage(scratchCanvas, -offset, offset * 0.5);
      targetCtx.restore();
    }
  }
}

function applyCanvasEffects(time) {
  applyCanvasEffectsToCanvas(outputCanvas, outputCtx, pipelineCanvas, pipelineCtx, time);
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

function pixelateCanvasSource(source, work, workContext, scratch, scratchContext) {
  const cell = state.settings.cell;
  workContext.imageSmoothingEnabled = false;
  workContext.clearRect(0, 0, work.width, work.height);
  if (cell <= 1) {
    workContext.drawImage(source, 0, 0, work.width, work.height);
    return;
  }

  const smallW = Math.max(1, Math.round(work.width / cell));
  const smallH = Math.max(1, Math.round(work.height / cell));
  setCanvasDimensions(scratch, smallW, smallH);
  scratchContext.imageSmoothingEnabled = true;
  scratchContext.clearRect(0, 0, smallW, smallH);
  scratchContext.drawImage(source, 0, 0, smallW, smallH);
  workContext.drawImage(scratch, 0, 0, smallW, smallH, 0, 0, work.width, work.height);
}

function withLogotypeRenderSettings(render) {
  const currentSettings = state.settings;
  const currentEffects = state.effects;
  const contrast = Number(currentSettings.contrast || 0);
  const brightness = Number(currentSettings.brightness || 0);
  let hasEpsilonGlow = false;

  state.settings = {
    ...currentSettings,
    contrast: Math.min(contrast, LOGOTYPE_CONTRAST_CEILING),
    brightness: Math.max(brightness, LOGOTYPE_BIAS_FLOOR),
  };

  state.effects = currentEffects.map((effect) => {
    if (effect.id !== "epsilon-glow") return effect;
    hasEpsilonGlow = true;
    return {
      ...effect,
      enabled: true,
      strength: Math.max(Number(effect.strength || 0), LOGOTYPE_EPSILON_GLOW_FLOOR),
    };
  });

  if (!hasEpsilonGlow) {
    state.effects = [
      ...state.effects,
      { id: "epsilon-glow", strength: LOGOTYPE_EPSILON_GLOW_FLOOR, enabled: true },
    ];
  }

  try {
    render();
  } finally {
    state.settings = currentSettings;
    state.effects = currentEffects;
  }
}

function processCanvasWithCurrentLook(source, target, time) {
  if (!logotypeWorkCtx || !logotypePipelineCtx) return;
  const targetCtx = target.getContext("2d", { willReadFrequently: true });
  if (!targetCtx) return;
  const width = target.width || source.width || LOGOTYPE_TEXTURE_WIDTH;
  const height = target.height || source.height || LOGOTYPE_TEXTURE_HEIGHT;

  withLogotypeRenderSettings(() => {
    setCanvasDimensions(logotypeWorkCanvas, width, height);
    pixelateCanvasSource(source, logotypeWorkCanvas, logotypeWorkCtx, logotypePipelineCanvas, logotypePipelineCtx);

    const imageData = logotypeWorkCtx.getImageData(0, 0, width, height);
    applyBaseAdjustments(imageData.data, imageData.width, imageData.height, time);
    applyAlgorithm(imageData, time);
    for (const effect of state.effects) applyDataEffect(imageData, effect, time);

    targetCtx.clearRect(0, 0, width, height);
    targetCtx.putImageData(imageData, 0, 0);
    setCanvasDimensions(logotypePipelineCanvas, width, height);
    applyCanvasEffectsToCanvas(target, targetCtx, logotypePipelineCanvas, logotypePipelineCtx, time);
  });
}

function renderLogotypeSurfaces() {
  if (!logotypeSourceCtx) return;
  for (const surface of logotypeSurfaces) {
    if (surface.video.readyState < 2) continue;
    drawMediaCover(logotypeSourceCtx, surface.video, LOGOTYPE_TEXTURE_WIDTH, LOGOTYPE_TEXTURE_HEIGHT);
    processCanvasWithCurrentLook(logotypeSourceCanvas, surface.canvas, state.time);
  }
}

function tickLogotypeSurfaces(now = performance.now()) {
  logotypeRaf = 0;
  if (document.visibilityState !== "hidden" && now - lastLogotypeRenderAt >= LOGOTYPE_RENDER_INTERVAL) {
    lastLogotypeRenderAt = now;
    renderLogotypeSurfaces();
  }
  logotypeRaf = requestAnimationFrame(tickLogotypeSurfaces);
}

function initLogotypeSurfaces() {
  setCanvasDimensions(logotypeSourceCanvas, LOGOTYPE_TEXTURE_WIDTH, LOGOTYPE_TEXTURE_HEIGHT);
  logotypeSurfaces = Array.from(document.querySelectorAll(LOGOTYPE_SURFACE_SELECTOR))
    .map((art) => {
      const video = art.querySelector(".brand-logotype-source");
      const canvas = art.querySelector(".brand-logotype-media");
      if (!video || !(canvas instanceof HTMLCanvasElement)) return null;
      setCanvasDimensions(canvas, LOGOTYPE_TEXTURE_WIDTH, LOGOTYPE_TEXTURE_HEIGHT);
      video.addEventListener("loadeddata", renderLogotypeSurfaces, { once: true });
      const playback = video.play();
      if (playback && typeof playback.catch === "function") playback.catch(() => {});
      return { video, canvas };
    })
    .filter(Boolean);

  if (logotypeSurfaces.length && !logotypeRaf && !prefersReducedMotion()) {
    logotypeRaf = requestAnimationFrame(tickLogotypeSurfaces);
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
  const sourceThemeIsVisible = state.view === "source";

  if (state.sourceType === "video" && video.readyState >= 2) {
    sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceCtx.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);
    if (sourceThemeIsVisible) {
      if (
        state.pendingSourceThemeReset ||
        performance.now() - state.lastSourceViewThemeAt > sourceViewThemeInterval()
      ) {
        applySourceViewTheme(state.pendingSourceThemeReset, SOURCE_VIEW_MOTION_THEME_SMOOTHING);
      }
    } else if (motionThemeActive()) {
      if (state.pendingSourceThemeReset || performance.now() - state.lastSourceThemeAt > MOTION_SOURCE_THEME_INTERVAL) {
        applyMotionPaletteTheme(state.pendingSourceThemeReset);
      }
    } else if (state.pendingSourceThemeReset || performance.now() - state.lastSourceThemeAt > 900) {
      updateDynamicThemeFromCanvas(sourceCanvas, state.pendingSourceThemeReset, {
        source: true,
        resetEdit: state.pendingSourceThemeReset,
      });
      state.pendingSourceThemeReset = false;
    }
  }

  if (isAnimatedImageSource()) {
    drawAnimatedImageFrame(state.time);
    if (sourceThemeIsVisible) {
      if (
        state.pendingSourceThemeReset ||
        performance.now() - state.lastSourceViewThemeAt > sourceViewThemeInterval()
      ) {
        applySourceViewTheme(state.pendingSourceThemeReset, SOURCE_VIEW_MOTION_THEME_SMOOTHING);
      }
    } else if (motionThemeActive()) {
      if (state.pendingSourceThemeReset || performance.now() - state.lastSourceThemeAt > MOTION_SOURCE_THEME_INTERVAL) {
        applyMotionPaletteTheme(state.pendingSourceThemeReset);
      }
    } else if (state.pendingSourceThemeReset || performance.now() - state.lastSourceThemeAt > 900) {
      updateDynamicThemeFromCanvas(sourceCanvas, state.pendingSourceThemeReset, {
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
  applyRandomSourceVisibilityGuard(imageData);

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
  const forceOutputThemeSeed = state.pendingOutputThemeSeed;
  const motionTheme = motionThemeActive();
  if (motionTheme) {
    if (forceOutputThemeSeed || performance.now() - state.lastSourceThemeAt > MOTION_OUTPUT_THEME_INTERVAL) {
      applyMotionPaletteTheme(forceOutputThemeSeed, { apply: !sourceThemeIsVisible });
    }
  } else {
    updateDynamicThemeFromCanvas(outputCanvas, forceOutputThemeSeed, {
      allowInactive: forceOutputThemeSeed,
      deferApply: sourceThemeIsVisible,
      minInterval: forceOutputThemeSeed ? 0 : state.playing ? ANIMATED_THEME_INTERVAL : IDLE_THEME_INTERVAL,
      smoothing: state.playing ? 0.32 : 0.42,
      sourceAnchor: forceOutputThemeSeed ? 0 : undefined,
    });
  }
  state.pendingOutputThemeSeed = false;
  if (!options.skipExportMetrics && (!state.playing || performance.now() - state.exportMetricsAt > ANIMATED_EXPORT_METRIC_INTERVAL)) {
    scheduleExportMetrics();
  }

  const elapsed = performance.now() - start;
  state.fpsFrames += 1;
  if (performance.now() - state.fpsAt > 500) {
    const fps = Math.round((state.fpsFrames * 1000) / (performance.now() - state.fpsAt));
    els.fpsReadout.textContent = `${String(fps).padStart(2, "0")} FPS`;
    syncDitherTextElement(els.fpsReadout);
    state.fpsFrames = 0;
    state.fpsAt = performance.now();
  }

  els.renderStatus.textContent = `${Math.round(elapsed)} MS`;
  syncDitherTextElement(els.renderStatus);
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

  const shouldRenderMotionFrame = sourceHasNativeMotion() || state.animateStill;
  const shouldSyncTimeline = now - state.lastPlaybackUiSyncAt >= PLAYBACK_UI_SYNC_INTERVAL;
  if (shouldRenderMotionFrame) {
    const shouldRender = state.dirty || now >= state.nextAnimatedRenderAt;
    if (shouldRender) {
      syncTimeline();
      state.lastPlaybackUiSyncAt = now;
      const elapsed = renderNow();
      const interval = clamp(elapsed * 1.35, ANIMATED_RENDER_MIN_INTERVAL, ANIMATED_RENDER_MAX_INTERVAL);
      state.nextAnimatedRenderAt = now + interval;
    } else if (shouldSyncTimeline) {
      syncTimeline();
      state.lastPlaybackUiSyncAt = now;
    }
  } else if (shouldSyncTimeline) {
    syncTimeline();
    state.lastPlaybackUiSyncAt = now;
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
  state.lastPlaybackUiSyncAt = 0;
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
  const duration = sourceDuration();
  const value = duration ? Math.round((state.time / duration) * 1000) : 0;
  els.timelineSlider.value = String(clamp(value, 0, 1000));
  syncRangeVisual(els.timelineSlider);
  els.timeReadout.textContent = formatTime(state.time);
}

function syncRangeVisual(input) {
  if (!input) return;
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value || min);
  const percent = max === min ? 0 : clamp(((value - min) / (max - min)) * 100, 0, 100);
  input.style.setProperty("--range-value", `${percent}%`);
}

function setCanvasView(view) {
  state.view = view;
  els.canvasFrame.dataset.view = view;
  document.querySelectorAll(".segment").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  applyPreviewViewTheme(view, true);
}

function populateAlgorithms() {
  els.algorithmSelect.innerHTML = "";
  ALGORITHMS.forEach((algorithm) => {
    const option = document.createElement("option");
    option.className = "tool-list-row";
    option.value = algorithm.id;
    option.textContent = algorithm.name;
    option.selected = algorithm.id === state.algorithm;
    els.algorithmSelect.appendChild(option);
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

function rgbCss(color) {
  return `rgb(${color.join(",")})`;
}

function getCurrentAlgorithm() {
  return ALGORITHMS.find((item) => item.id === state.algorithm) || ALGORITHMS[0];
}

function normalizeDitherText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function syncDitherTextElement(element) {
  if (!element) return;
  const text = normalizeDitherText(element.textContent || "");
  if (!text) {
    element.classList.remove("dither-texture");
    delete element.dataset.ditherText;
    return;
  }
  if (element.dataset.ditherText === text && element.classList.contains("dither-texture")) return;
  element.classList.add("dither-texture");
  element.dataset.ditherText = text;
}

function syncDitherTextSurfaces(root = document) {
  root.querySelectorAll(DITHER_TEXT_SELECTOR).forEach(syncDitherTextElement);
}

function getTextDitherMode(algorithm) {
  if (algorithm.type === "ordered") return "matrix";
  if (algorithm.type === "glitch") return "glitch";
  if (algorithm.type === "temporal") return "temporal";
  if (algorithm.type === "pattern") return "threshold";
  if (algorithm.type === "special") {
    if (/halftone|newsprint|radial|riso|screen/i.test(algorithm.id)) return "halftone";
    if (/hatch|embroidery|ascii|contour|silk/i.test(algorithm.id)) return "hatch";
  }
  return "diffusion";
}

function pickTextDitherColors() {
  const colors = getPalette() || getPalettePreviewColors("adaptive");
  const palette = colors.length ? colors : [[96, 214, 116], [80, 188, 210], [216, 86, 170]];
  const byLuma = [...palette].sort((a, b) => luminance(a[0], a[1], a[2]) - luminance(b[0], b[1], b[2]));
  const thresholdIndex = Math.abs(Math.round(state.settings.threshold + state.settings.contrast + state.settings.noise)) % palette.length;
  return {
    low: byLuma[0],
    mid: byLuma[Math.floor(byLuma.length / 2)],
    high: byLuma[byLuma.length - 1],
    accent: palette[thresholdIndex],
  };
}

function updateDitherTextTexture() {
  const algorithm = getCurrentAlgorithm();
  const mode = getTextDitherMode(algorithm);
  const colors = pickTextDitherColors();
  const enabledEffects = state.effects.filter((effect) => effect.enabled);
  const effectMix = enabledEffects.length
    ? enabledEffects.reduce((sum, effect) => sum + Number(effect.strength || 0), 0) / enabledEffects.length
    : 0;
  const noise = clamp(Number(state.settings.noise || 0), 0, 100);
  const contrast = Math.abs(clamp(Number(state.settings.contrast || 0), -100, 100));
  const temporal = clamp(Number(state.settings.temporal || 0), 0, 100);
  const cellBase = mode === "matrix" ? 2.8 : mode === "halftone" ? 4.8 : mode === "hatch" ? 6 : 3.6;
  const cell = clamp(Math.round(Number(state.settings.cell || 1) * cellBase + (noise > 40 ? 2 : 0)), 4, 22);
  const alpha = clamp(0.13 + noise / 650 + contrast / 900 + effectMix / 900, 0.12, 0.34);
  const logoAlpha = clamp(alpha + 0.06 + effectMix / 1800, 0.16, 0.36);
  const edge = clamp(0.35 + contrast / 220 + effectMix / 420, 0.35, 1.15);
  const phase = Math.round((state.settings.threshold || 0) / 17) % Math.max(4, cell);
  const xShift = mode === "glitch" ? Math.max(1, Math.round(effectMix / 18)) : mode === "temporal" ? Math.max(1, Math.round(temporal / 28)) : 1;
  const yShift = mode === "hatch" ? 1 : mode === "matrix" ? 0 : Math.round((noise + effectMix) / 90);

  document.body.dataset.textDitherMode = mode;
  document.documentElement.style.setProperty("--text-dither-a", rgbCss(colors.high));
  document.documentElement.style.setProperty("--text-dither-b", rgbCss(colors.accent));
  document.documentElement.style.setProperty("--text-dither-c", rgbCss(colors.mid));
  document.documentElement.style.setProperty("--text-dither-ink", rgbCss(colors.low));
  document.documentElement.style.setProperty("--text-dither-cell", `${cell}px`);
  document.documentElement.style.setProperty("--text-dither-alpha", alpha.toFixed(3));
  document.documentElement.style.setProperty("--logo-dither-alpha", logoAlpha.toFixed(3));
  document.documentElement.style.setProperty("--text-dither-edge", `${edge.toFixed(2)}px`);
  document.documentElement.style.setProperty("--text-dither-x", `${xShift}px`);
  document.documentElement.style.setProperty("--text-dither-y", `${yShift}px`);
  document.documentElement.style.setProperty("--text-dither-phase", `${phase}px`);
  document.documentElement.style.setProperty("--text-dither-temporal", `${Math.max(0, temporal / 100).toFixed(2)}`);
}

function adaptivePalettePreview() {
  const count = clamp(Math.round(state.settings.levels || ADAPTIVE_PALETTE_PREVIEW.length), 2, 8);
  return Array.from({ length: count }, (_, index) => {
    const value = Math.round(28 + (index / Math.max(1, count - 1)) * 200);
    return [value, value, value];
  });
}

function getPalettePreviewColors(id = state.palette) {
  if (id === "adaptive") return adaptivePalettePreview();
  if (id === "custom") return state.customPalette?.length ? state.customPalette : ADAPTIVE_PALETTE_PREVIEW;
  return PALETTES[id]?.colors || ADAPTIVE_PALETTE_PREVIEW;
}

function renderPalettePreview(target, colors, limit = 16) {
  if (!target) return;
  target.innerHTML = "";
  colors.slice(0, limit).forEach((color) => {
    const swatch = document.createElement("span");
    swatch.style.background = rgbCss(color);
    target.appendChild(swatch);
  });
}

function getPaletteOptions() {
  return [
    ...Object.entries(PALETTES).map(([id, palette]) => ({ id, name: palette.name })),
    { id: "custom", name: "Extracted Custom" },
  ];
}

function isPaletteOptionAvailable(id) {
  return id !== "custom" || Boolean(state.customPalette?.length);
}

function renderPalettePickerOptions() {
  if (!els.palettePickerList) return;
  els.palettePickerList.innerHTML = "";
  getPaletteOptions().forEach(({ id, name }) => {
    const disabled = !isPaletteOptionAvailable(id);
    const option = document.createElement("button");
    option.className = "palette-option tool-list-row";
    option.type = "button";
    option.disabled = disabled;
    option.dataset.paletteOption = id;
    option.setAttribute("role", "option");
    option.setAttribute("aria-disabled", String(disabled));
    const label = document.createElement("span");
    label.className = "palette-option-name tool-list-label";
    label.textContent = name;
    const preview = document.createElement("span");
    preview.className = "palette-preview";
    preview.setAttribute("aria-hidden", "true");
    renderPalettePreview(preview, getPalettePreviewColors(id));
    option.append(label, preview);
    els.palettePickerList.appendChild(option);
  });
  syncDitherTextSurfaces(els.palettePickerList);
}

function syncPalettePicker({ reveal = false } = {}) {
  renderPalettePickerOptions();
  let activeOption = null;
  els.palettePickerList?.querySelectorAll("[data-palette-option]").forEach((option) => {
    const active = option.dataset.paletteOption === state.palette;
    option.classList.toggle("is-active", active);
    option.setAttribute("aria-selected", String(active));
    if (active) activeOption = option;
  });
  if (reveal) activeOption?.scrollIntoView({ block: "nearest" });
  requestAnimationFrame(syncPaletteScrollIndicator);
}

function syncPaletteScrollIndicator() {
  if (!els.palettePicker || !els.palettePickerList) return;
  const list = els.palettePickerList;
  const trackPadding = 5;
  const trackHeight = Math.max(1, list.clientHeight - trackPadding * 2);
  const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight);
  const visibleRatio = list.scrollHeight ? list.clientHeight / list.scrollHeight : 1;
  const thumbHeight = clamp(trackHeight * visibleRatio, 28, trackHeight);
  const thumbTop = trackPadding + (maxScroll ? (list.scrollTop / maxScroll) * (trackHeight - thumbHeight) : 0);
  els.palettePicker.style.setProperty("--palette-scroll-thumb-height", `${thumbHeight}px`);
  els.palettePicker.style.setProperty("--palette-scroll-thumb-top", `${thumbTop}px`);
}

function syncMasterScrollIndicator() {
  const pane = els.masterControlsPane;
  if (!pane) return;
  const indicator = els.masterScrollIndicator;
  const trackPadding = 14;
  const paneRect = pane.getBoundingClientRect();
  const workbenchRect = pane.closest(".workbench")?.getBoundingClientRect();
  const stageRect = els.stagePane?.getBoundingClientRect();
  const imageRect = els.canvasFrame?.getBoundingClientRect();
  const rightBoundaryRect = imageRect?.width > 0 ? imageRect : stageRect;
  const rightBoundary = rightBoundaryRect?.left ?? paneRect.right + 28;
  const trackHeight = Math.max(1, pane.clientHeight - trackPadding * 2);
  const maxScroll = Math.max(0, pane.scrollHeight - pane.clientHeight);
  const visibleRatio = pane.scrollHeight ? pane.clientHeight / pane.scrollHeight : 1;
  const thumbHeight = clamp(trackHeight * visibleRatio, 48, Math.min(trackHeight, 172));
  const thumbTop = maxScroll ? (pane.scrollTop / maxScroll) * (trackHeight - thumbHeight) : 0;
  const gutterInset = 4;
  const gutterLeft = paneRect.right - 4;
  const gutterRight = rightBoundary - gutterInset;
  const gutterWidth = Math.max(0, gutterRight - gutterLeft);
  const indicatorWidth = Math.min(22, gutterWidth);
  const thumbWidth = Math.min(16, Math.max(10, indicatorWidth - 6));
  const indicatorLeft = gutterLeft;
  pane.style.setProperty("--master-scroll-thumb-height", `${thumbHeight}px`);
  pane.style.setProperty("--master-scroll-thumb-top", `${thumbTop}px`);
  if (indicator) {
    indicator.hidden = indicatorWidth < 6;
    indicator.style.setProperty("--master-scroll-track-left", `${indicatorLeft - (workbenchRect?.left ?? 0)}px`);
    indicator.style.setProperty("--master-scroll-track-top", `${paneRect.top - (workbenchRect?.top ?? 0) + trackPadding}px`);
    indicator.style.setProperty("--master-scroll-track-height", `${trackHeight}px`);
    indicator.style.setProperty("--master-scroll-track-width", `${indicatorWidth}px`);
    indicator.style.setProperty("--master-scroll-thumb-width", `${thumbWidth}px`);
    indicator.style.setProperty("--master-scroll-thumb-height", `${thumbHeight}px`);
    indicator.style.setProperty("--master-scroll-thumb-top", `${thumbTop}px`);
  }
  pane.classList.toggle("is-scrollable", maxScroll > 1);
}

function syncEffectsStackScrollIndicator() {
  const stack = els.effectsStack;
  const indicator = els.effectsStackScrollIndicator;
  if (!stack || !indicator) return;
  const trackPadding = 5;
  const stackRect = stack.getBoundingClientRect();
  const trackHeight = Math.max(1, stack.clientHeight - trackPadding * 2);
  const maxScroll = Math.max(0, stack.scrollHeight - stack.clientHeight);
  const visibleRatio = stack.scrollHeight ? stack.clientHeight / stack.scrollHeight : 1;
  const thumbHeight = clamp(trackHeight * visibleRatio, 28, trackHeight);
  const thumbTop = trackPadding + (maxScroll ? (stack.scrollTop / maxScroll) * (trackHeight - thumbHeight) : 0);
  const isVisible = stackRect.bottom > 0 && stackRect.top < window.innerHeight && stack.clientHeight > 0;
  indicator.hidden = !isVisible;
  indicator.style.setProperty("--effects-stack-scroll-track-left", `${stackRect.right - 11}px`);
  indicator.style.setProperty("--effects-stack-scroll-track-top", `${stackRect.top + trackPadding}px`);
  indicator.style.setProperty("--effects-stack-scroll-track-height", `${trackHeight}px`);
  indicator.style.setProperty("--effects-stack-scroll-thumb-height", `${thumbHeight}px`);
  indicator.style.setProperty("--effects-stack-scroll-thumb-top", `${thumbTop - trackPadding}px`);
  stack.classList.toggle("is-scrollable", maxScroll > 1);
}

function dragMasterScrollIndicator(event) {
  const pane = els.masterControlsPane;
  const thumb = els.masterScrollThumb;
  if (!pane || !thumb) return;
  const maxScroll = Math.max(0, pane.scrollHeight - pane.clientHeight);
  if (!maxScroll) return;
  event.preventDefault();
  thumb.setPointerCapture?.(event.pointerId);
  pane.classList.add("is-master-scroll-dragging");
  els.masterScrollIndicator?.classList.add("is-master-scroll-dragging");

  const startY = event.clientY;
  const startScroll = pane.scrollTop;
  const trackPadding = 14;
  const trackHeight = Math.max(1, pane.clientHeight - trackPadding * 2);
  const thumbHeight = Number.parseFloat(pane.style.getPropertyValue("--master-scroll-thumb-height")) || 46;
  const scrollPerPixel = maxScroll / Math.max(1, trackHeight - thumbHeight);

  const handlePointerMove = (moveEvent) => {
    pane.scrollTop = clamp(startScroll + (moveEvent.clientY - startY) * scrollPerPixel, 0, maxScroll);
    syncMasterScrollIndicator();
  };

  const stopDragging = (upEvent) => {
    thumb.releasePointerCapture?.(upEvent.pointerId);
    pane.classList.remove("is-master-scroll-dragging");
    els.masterScrollIndicator?.classList.remove("is-master-scroll-dragging");
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
    window.removeEventListener("pointercancel", stopDragging);
  };

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", stopDragging);
  window.addEventListener("pointercancel", stopDragging);
}

function pageScrollMetrics() {
  const root = document.documentElement;
  const scrollHeight = Math.max(root.scrollHeight, document.body?.scrollHeight || 0);
  const viewportHeight = window.innerHeight || root.clientHeight || 1;
  const maxScroll = Math.max(0, scrollHeight - viewportHeight);
  return {
    root,
    scrollHeight,
    viewportHeight,
    maxScroll,
    scrollTop: clamp(window.scrollY || root.scrollTop || 0, 0, maxScroll),
  };
}

function pageScrollTrackGeometry(metrics = pageScrollMetrics()) {
  const trackTop = 0;
  const trackHeight = Math.max(1, Math.round(metrics.viewportHeight));
  return { trackTop, trackHeight };
}

function syncPageScrollIndicator() {
  const indicator = els.pageScrollIndicator;
  if (!indicator) return;
  const metrics = pageScrollMetrics();
  const { trackTop, trackHeight } = pageScrollTrackGeometry(metrics);
  const visibleRatio = metrics.scrollHeight ? metrics.viewportHeight / metrics.scrollHeight : 1;
  const thumbHeight = clamp(trackHeight * visibleRatio, 38, Math.min(trackHeight, 118));
  const thumbTop = metrics.maxScroll ? (metrics.scrollTop / metrics.maxScroll) * (trackHeight - thumbHeight) : 0;
  indicator.hidden = metrics.maxScroll <= 1;
  indicator.style.setProperty("--page-scroll-track-top", `${trackTop}px`);
  indicator.style.setProperty("--page-scroll-track-height", `${trackHeight}px`);
  indicator.style.setProperty("--page-scroll-thumb-height", `${thumbHeight}px`);
  indicator.style.setProperty("--page-scroll-thumb-top", `${thumbTop}px`);
}

function hidePageScrollIndicator() {
  if (document.body.classList.contains("is-page-scroll-dragging")) return;
  document.body.classList.remove("is-page-scroll-active");
}

function queuePageScrollIndicatorHide(delay = 900) {
  window.clearTimeout(pageScrollHideTimer);
  pageScrollHideTimer = window.setTimeout(hidePageScrollIndicator, delay);
}

function showPageScrollIndicator(options = {}) {
  syncPageScrollIndicator();
  if (els.pageScrollIndicator?.hidden) return;
  document.body.classList.add("is-page-scroll-active");
  if (!options.persist) queuePageScrollIndicatorHide(options.delay ?? 900);
}

function isNestedScrollTarget(target) {
  const element = target instanceof Element ? target : null;
  const scroller = element?.closest(".master-controls-pane, .palette-picker-list, .effects-stack, select[size]");
  if (!scroller) return false;
  const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  return maxScroll > 1;
}

function handlePageScrollIntent(event) {
  if (isNestedScrollTarget(event.target)) return;
  showPageScrollIndicator();
}

function dragPageScrollIndicator(event) {
  const thumb = els.pageScrollThumb;
  if (!thumb) return;
  const metrics = pageScrollMetrics();
  if (!metrics.maxScroll) return;
  event.preventDefault();
  window.clearTimeout(pageScrollHideTimer);
  thumb.setPointerCapture?.(event.pointerId);
  document.body.classList.add("is-page-scroll-active", "is-page-scroll-dragging");

  const startY = event.clientY;
  const startScroll = metrics.scrollTop;
  const { trackHeight } = pageScrollTrackGeometry(metrics);
  const thumbHeight = Number.parseFloat(els.pageScrollIndicator?.style.getPropertyValue("--page-scroll-thumb-height")) || 46;
  const scrollPerPixel = metrics.maxScroll / Math.max(1, trackHeight - thumbHeight);

  const handlePointerMove = (moveEvent) => {
    const nextScroll = clamp(startScroll + (moveEvent.clientY - startY) * scrollPerPixel, 0, metrics.maxScroll);
    window.scrollTo({ top: nextScroll });
    syncPageScrollIndicator();
  };

  const stopDragging = (upEvent) => {
    thumb.releasePointerCapture?.(upEvent.pointerId);
    document.body.classList.remove("is-page-scroll-dragging");
    queuePageScrollIndicatorHide();
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
    window.removeEventListener("pointercancel", stopDragging);
  };

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", stopDragging);
  window.addEventListener("pointercancel", stopDragging);
}

function syncLeftScrollIndicators() {
  syncPaletteScrollIndicator();
  syncEffectsStackScrollIndicator();
  syncMasterScrollIndicator();
  syncPageScrollIndicator();
}

function selectPalette(id, options = {}) {
  if (id !== "custom" && !PALETTES[id]) return;
  if (!isPaletteOptionAvailable(id)) return;
  state.palette = id;
  syncPaletteSelect(options);
  const paletteSeed = applyPaletteTheme(true);
  if (state.view === "source") applySourceViewTheme(true);
  else if (sourceHasNativeMotion()) applyMotionPaletteTheme(true);
  window.DitherColorRuntime?.recordPageSeed(paletteSeed, { page: "home" });
  updateStatus();
  scheduleEditRender();
}

function randomizePaletteSource() {
  const options = getPaletteOptions().filter(({ id }) => (
    id !== state.palette &&
    isPaletteOptionAvailable(id) &&
    paletteVisibilityWeight(id) > 0
  ));
  if (!options.length) return;
  const next = weightedRandom(options, ({ id }) => paletteVisibilityWeight(id));
  selectPalette(next.id, { reveal: true });
  pulseDiceButton(els.randomizePaletteButton);
}

function pulseDiceButton(button) {
  if (!button) return;
  button.classList.add("is-cycling");
  window.setTimeout(() => button.classList.remove("is-cycling"), 460);
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

function weightedRandom(items, weightFor) {
  const total = items.reduce((sum, item) => sum + Math.max(0, weightFor(item) || 0), 0);
  if (!items.length) return null;
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let cursor = Math.random() * total;
  for (const item of items) {
    cursor -= Math.max(0, weightFor(item) || 0);
    if (cursor <= 0) return item;
  }
  return items[items.length - 1];
}

function paletteVisibilityWeight(id) {
  if (id === "custom") return state.customPalette?.length >= 4 ? 9 : 0;
  const colors = PALETTES[id]?.colors;
  if (colors === null) return 10;
  if (!colors || colors.length < 4) return 0;
  return Math.min(8, colors.length) + (id === "phosphor" ? 1 : 0);
}

function algorithmVisibilityWeight(algorithm) {
  if (!algorithm) return 0;
  if (algorithm.type === "error") return 9;
  if (algorithm.type === "ordered") return algorithm.id === "bayer-2" ? 5 : 8;
  if (CLARITY_SPECIAL_ALGORITHMS.has(algorithm.id)) return 4;
  return 0;
}

function randomizeAlgorithm() {
  const options = ALGORITHMS.filter((algorithm) => (
    algorithm.id !== state.algorithm &&
    algorithmVisibilityWeight(algorithm) > 0
  ));
  if (!options.length) return;
  const algorithm = weightedRandom(options, algorithmVisibilityWeight);
  state.algorithm = algorithm.id;
  populateAlgorithms();
  updateStatus();
  updateDitherTextTexture();
  scheduleEditRender();
  pulseDiceButton(els.randomizeAlgorithmButton);
}

function syncPaletteSelect(options = {}) {
  els.paletteSelect.value = state.palette;
  renderSwatches();
  syncPalettePicker(options);
}

function renderSwatches() {
  els.swatchRow.innerHTML = "";
  const colors = getPalette();
  const display = colors || getPalettePreviewColors("adaptive");
  display.slice(0, 16).forEach((color) => {
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.title = `rgb(${color.join(", ")})`;
    swatch.style.background = rgbCss(color);
    els.swatchRow.appendChild(swatch);
  });
  els.paletteReadout.textContent = colors ? `PAL ${colors.length}` : `RGB ${state.settings.levels}`;
  syncDitherTextElement(els.paletteReadout);
}

function populateEffects() {
  els.effectSelect.innerHTML = "";
  EFFECTS.forEach((effect) => {
    const option = document.createElement("option");
    option.className = "tool-list-row";
    option.value = effect.id;
    option.textContent = effect.name;
    option.selected = effect.id === state.effects[0]?.id;
    els.effectSelect.appendChild(option);
  });
}

function addEffectToStack(effectId, strength = 35) {
  if (!effectId) return;
  state.effects.push({ id: effectId, strength, enabled: true });
  renderEffects();
  updateDitherTextTexture();
  scheduleEditRender();
}

function renderEffects() {
  els.effectsStack.innerHTML = "";
  if (!state.effects.length) {
    const empty = document.createElement("li");
    empty.className = "batch-empty";
    empty.textContent = "No effects in stack";
    els.effectsStack.appendChild(empty);
    syncDitherTextSurfaces(els.effectsStack);
    requestAnimationFrame(syncEffectsStackScrollIndicator);
    requestAnimationFrame(syncMasterScrollIndicator);
    return;
  }
  state.effects.forEach((effect, index) => {
    const meta = EFFECTS.find((item) => item.id === effect.id);
    const item = document.createElement("li");
    item.className = "effect-item tool-list-row";

    const title = document.createElement("label");
    title.className = "effect-title";
    const enabled = document.createElement("input");
    enabled.type = "checkbox";
    enabled.checked = effect.enabled;
    enabled.addEventListener("change", () => {
      effect.enabled = enabled.checked;
      updateDitherTextTexture();
      scheduleEditRender();
    });
    const name = document.createElement("span");
    name.className = "tool-list-label";
    name.textContent = meta?.name || effect.id;
    title.append(enabled, name);

    const actions = document.createElement("div");
    actions.className = "effect-actions";
    const up = effectButton("↑", "Move up", () => moveEffect(index, -1));
    const down = effectButton("↓", "Move down", () => moveEffect(index, 1));
    const remove = effectButton("×", "Remove", () => {
      state.effects.splice(index, 1);
      renderEffects();
      updateDitherTextTexture();
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
    syncRangeVisual(input);
    const output = document.createElement("output");
    output.textContent = String(effect.strength);
    input.addEventListener("input", () => {
      effect.strength = Number(input.value);
      syncRangeVisual(input);
      output.textContent = input.value;
      syncDitherTextElement(output);
      updateDitherTextTexture();
      scheduleEditRender();
    });
    control.append(label, input, output);

    item.append(title, actions, control);
    els.effectsStack.appendChild(item);
  });
  syncDitherTextSurfaces(els.effectsStack);
  requestAnimationFrame(syncEffectsStackScrollIndicator);
  requestAnimationFrame(syncMasterScrollIndicator);
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

function randomizeEffectsStack() {
  const pool = CLARITY_EFFECT_POOL.filter((preset) => EFFECTS.some((effect) => effect.id === preset.id));
  const count = Math.min(pool.length, Math.random() > 0.78 ? 3 : 1 + Math.floor(Math.random() * 2));
  state.effects = Array.from({ length: count }, () => {
    const effect = weightedRandom(pool, (preset) => preset.weight);
    const index = pool.findIndex((preset) => preset.id === effect.id);
    if (index >= 0) pool.splice(index, 1);
    return {
      id: effect.id,
      strength: randomInt(effect.min, effect.max),
      enabled: true,
    };
  });
  if (state.effects[0]) els.effectSelect.value = state.effects[0].id;
  renderEffects();
  updateDitherTextTexture();
  scheduleEditRender();
  pulseDiceButton(els.randomizeEffectsButton);
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
    syncRangeVisual(input);
    const output = document.createElement("output");
    output.textContent = String(state.settings[setting.id]);
    input.addEventListener("input", () => {
      state.settings[setting.id] = Number(input.value);
      syncRangeVisual(input);
      output.textContent = input.value;
      syncDitherTextElement(output);
      if (setting.id === "levels") syncPaletteSelect();
      updateDitherTextTexture();
      scheduleEditRender();
    });
    wrap.append(label, input, output);
    els.adjustmentControls.appendChild(wrap);
  });
  syncDitherTextSurfaces(els.adjustmentControls);
}

function renderPresets() {
  els.presetGrid.innerHTML = "";
  PRESETS.forEach((preset) => {
    const button = document.createElement("button");
    button.className = "preset-button tool-list-row";
    button.type = "button";
    const name = document.createElement("strong");
    name.className = "tool-list-label";
    name.textContent = preset.name;
    const detail = document.createElement("span");
    detail.className = "tool-list-meta";
    detail.textContent = preset.detail;
    button.append(name, detail);
    button.addEventListener("click", () => applyPreset(preset));
    els.presetGrid.appendChild(button);
  });
  syncDitherTextSurfaces(els.presetGrid);
}

function applyPreset(preset) {
  state.algorithm = preset.algorithm;
  state.palette = preset.palette;
  state.settings = { ...state.settings, ...preset.settings };
  state.effects = preset.effects.map((effect) => ({ ...effect }));
  populateAlgorithms();
  syncPaletteSelect();
  renderAdjustmentControls();
  renderEffects();
  updateStatus();
  scheduleEditRender();
}

function updateStatus() {
  const algorithm = getCurrentAlgorithm();
  els.mediaStatus.textContent = `SOURCE: ${state.sourceName.toUpperCase().slice(0, 24)}`;
  els.algorithmStatus.textContent = `ALG: ${algorithm.name.toUpperCase().slice(0, 28)}`;
  els.paletteReadout.textContent = getPalette() ? `PAL ${getPalette().length}` : `RGB ${state.settings.levels}`;
  updateDitherTextTexture();
  syncDitherTextSurfaces();
}

function createSeededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function randomFromList(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

function randomRange(rng, min, max) {
  return min + rng() * (max - min);
}

function drawWizardSignal(seed = Math.floor(Math.random() * 0xffffffff)) {
  clearAnimatedImageSource();
  const signalSeed = seed >>> 0;
  const rng = createSeededRandom(signalSeed || 1);
  const name = randomFromList(WIZARD_SIGNAL_NAMES, rng);
  const colors = randomFromList(WIZARD_SIGNAL_PALETTES, rng);
  const seedCode = signalSeed.toString(16).padStart(8, "0").slice(0, 6).toUpperCase();
  resizeCanvases(1024, 640);
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const centerX = width * randomRange(rng, 0.42, 0.58);
  const centerY = height * randomRange(rng, 0.42, 0.58);

  sourceCtx.save();
  sourceCtx.clearRect(0, 0, width, height);
  sourceCtx.imageSmoothingEnabled = false;

  const gradient = sourceCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.42, colors[1]);
  gradient.addColorStop(0.72, colors[2]);
  gradient.addColorStop(1, colors[3]);
  sourceCtx.fillStyle = gradient;
  sourceCtx.fillRect(0, 0, width, height);

  sourceCtx.globalCompositeOperation = "screen";
  for (let i = 0; i < 72; i++) {
    const x = Math.floor(rng() * width);
    const y = Math.floor(rng() * height);
    const size = Math.floor(randomRange(rng, 2, 10));
    sourceCtx.fillStyle = `${colors[Math.floor(randomRange(rng, 2, colors.length))]}`;
    sourceCtx.globalAlpha = randomRange(rng, 0.08, 0.28);
    sourceCtx.fillRect(x - (x % 2), y - (y % 2), size, size);
  }

  sourceCtx.globalAlpha = 1;
  sourceCtx.strokeStyle = colors[4];
  sourceCtx.lineWidth = 2;
  for (let y = 0; y < height; y += 20) {
    sourceCtx.globalAlpha = 0.06 + (y / height) * 0.05;
    sourceCtx.beginPath();
    sourceCtx.moveTo(0, y + Math.floor(rng() * 3));
    sourceCtx.lineTo(width, y + Math.floor(rng() * 3));
    sourceCtx.stroke();
  }

  sourceCtx.globalAlpha = 0.34;
  for (let i = 0; i < 9; i++) {
    const panelW = randomRange(rng, 72, 220);
    const panelH = randomRange(rng, 26, 96);
    const x = randomRange(rng, -20, width - panelW + 20);
    const y = randomRange(rng, -10, height - panelH + 10);
    sourceCtx.fillStyle = i % 2 === 0 ? colors[0] : colors[3];
    sourceCtx.fillRect(x, y, panelW, panelH);
    sourceCtx.strokeStyle = colors[(i % 3) + 2];
    sourceCtx.strokeRect(x + 4, y + 4, panelW - 8, panelH - 8);
  }

  sourceCtx.save();
  sourceCtx.translate(centerX, centerY);
  sourceCtx.rotate(randomRange(rng, -0.18, 0.18));
  sourceCtx.globalAlpha = 0.72;
  sourceCtx.globalCompositeOperation = "screen";
  for (let i = 0; i < 7; i++) {
    sourceCtx.strokeStyle = colors[(i % 3) + 2];
    sourceCtx.lineWidth = 2 + i * 0.7;
    sourceCtx.beginPath();
    sourceCtx.ellipse(0, 0, 110 + i * 25, 54 + i * 14, i * 0.32, 0, Math.PI * 2);
    sourceCtx.stroke();
  }
  for (let i = 0; i < 18; i++) {
    const angle = (Math.PI * 2 * i) / 18 + randomRange(rng, -0.07, 0.07);
    const distance = randomRange(rng, 84, 210);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance * 0.62;
    sourceCtx.fillStyle = colors[(i % 3) + 2];
    sourceCtx.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, 8, 8);
  }
  sourceCtx.restore();

  sourceCtx.globalCompositeOperation = "source-over";
  sourceCtx.globalAlpha = 0.74;
  sourceCtx.fillStyle = "rgba(4, 8, 8, 0.74)";
  sourceCtx.fillRect(width * 0.08, height * 0.13, width * 0.28, height * 0.26);
  sourceCtx.strokeStyle = colors[4];
  sourceCtx.strokeRect(width * 0.08 + 6, height * 0.13 + 6, width * 0.28 - 12, height * 0.26 - 12);
  sourceCtx.fillStyle = colors[3];
  sourceCtx.font = "700 64px ui-monospace, SFMono-Regular, Consolas, monospace";
  sourceCtx.fillText("WZD", width * 0.11, height * 0.28);
  sourceCtx.font = "600 18px ui-monospace, SFMono-Regular, Consolas, monospace";
  sourceCtx.fillText(`SIGNAL ${seedCode}`, width * 0.11, height * 0.34);

  sourceCtx.globalAlpha = 0.62;
  for (let i = 0; i < 12; i++) {
    const x = width * 0.72 + (i % 3) * 28;
    const y = height * 0.16 + Math.floor(i / 3) * 58;
    sourceCtx.fillStyle = colors[(i % 4) + 1];
    sourceCtx.fillRect(x, y, 14 + (i % 2) * 18, 36 + (i % 3) * 8);
  }
  sourceCtx.restore();

  state.sourceType = "image";
  state.sourceName = `wizard-${name}-${seedCode.toLowerCase()}`;
  state.randomSourceVisibilityGuard = true;
  state.duration = 4;
  state.time = 0;
  estimateSourceBytesFromCanvas(`${state.sourceName}.png`, "PNG");
  syncTimeline();
  enableStillMotionPreview();
  updateDynamicThemeFromCanvas(sourceCanvas, true, { source: true, resetEdit: true });
  updateStatus();
  scheduleRender();
  return state.sourceName;
}

function drawSample() {
  clearAnimatedImageSource();
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
  state.randomSourceVisibilityGuard = false;
  state.duration = 4;
  state.time = 0;
  estimateSourceBytesFromCanvas("procedural.png", "PNG");
  syncTimeline();
  enableStillMotionPreview();
  state.pendingOutputThemeSeed = true;
  updateDynamicThemeFromCanvas(sourceCanvas, true, { source: true, resetEdit: true, deferApply: true });
  updateStatus();
  scheduleRender();
}

async function loadDefaultSample() {
  try {
    const response = await fetch(DEFAULT_SAMPLE_URL);
    if (!response.ok) throw new Error(`Default sample request failed: ${response.status}`);
    const blob = await response.blob();
    const file = new File([blob], DEFAULT_SAMPLE_NAME, { type: blob.type || "image/png" });
    await loadFile(file, { deferSourceTheme: true, seedFromOutput: true });
  } catch {
    drawSample();
  }
}

function getRandomSourceLibrary(options = {}) {
  const maxBytes = Number(options.maxBytes || 0);
  return Array.isArray(window.DITHER_RANDOM_SOURCE_LIBRARY)
    ? window.DITHER_RANDOM_SOURCE_LIBRARY.filter((asset) => (
      asset?.src &&
      asset?.filename &&
      !unavailableRandomSourceIds.has(randomSourceKey(asset)) &&
      (!maxBytes || !Number.isFinite(asset.bytes) || asset.bytes <= maxBytes)
    ))
    : [];
}

function randomSourceKey(asset) {
  return asset?.id || asset?.filename || asset?.src || "";
}

function pickRandomSourceAsset(excludedIds = new Set(), options = {}) {
  const library = getRandomSourceLibrary(options).filter((asset) => !excludedIds.has(randomSourceKey(asset)));
  if (!library.length) return null;
  let lastSourceId = "";
  try {
    lastSourceId = localStorage.getItem(RANDOM_SOURCE_LAST_KEY) || "";
  } catch {
    lastSourceId = "";
  }
  const pool = library.length > 1 ? library.filter((asset) => asset.id !== lastSourceId) : library;
  const asset = pool[Math.floor(Math.random() * pool.length)] || library[0];
  try {
    localStorage.setItem(RANDOM_SOURCE_LAST_KEY, randomSourceKey(asset));
  } catch {
    // Local storage can be unavailable in strict browser modes.
  }
  return asset;
}

function clearObjectUrlSource() {
  if (!objectUrl) return;
  URL.revokeObjectURL(objectUrl);
  objectUrl = "";
}

function prepareRandomSourceLoad(asset, options = {}) {
  clearObjectUrlSource();
  state.sourceName = asset.label || asset.filename.replace(/\.[^.]+$/, "");
  state.randomSourceVisibilityGuard = options.visibilityGuard !== false;
  setExportSource({
    name: asset.filename,
    bytes: asset.bytes,
    format: formatFromName(asset.filename, asset.mime),
  });
  state.pendingSourceThemeReset = true;
  state.sourceViewThemeSeed = null;
  state.ditherViewThemeSeed = null;
  state.lastSourceViewThemeAt = 0;
  if (options.seedFromOutput) state.pendingOutputThemeSeed = true;
}

async function fetchRandomSourceFile(asset) {
  const response = await fetch(asset.src);
  if (!response.ok) throw new Error(`Random source request failed: ${response.status}`);
  const blob = await response.blob();
  return new File([blob], asset.filename, { type: asset.mime || blob.type || "" });
}

async function loadRandomSourceAsset(asset, options = {}) {
  if (!asset) return false;
  prepareRandomSourceLoad(asset, options);
  try {
    if (asset.kind === "video" || asset.mime?.startsWith("video/")) {
      await loadVideo(asset.src, options);
    } else if (asset.kind === "gif" || /\.gif$/i.test(asset.filename)) {
      try {
        const file = await fetchRandomSourceFile(asset);
        const loadedAnimatedGif = await loadAnimatedGif(file, options);
        if (!loadedAnimatedGif) await loadImage(asset.src, file, options);
      } catch {
        await loadImage(asset.src, asset, options);
      }
    } else {
      await loadImage(asset.src, asset, options);
    }
    if (sourceHasNativeMotion()) setPlaying(!prefersReducedMotion());
    updateStatus();
    scheduleRender();
    return true;
  } catch (error) {
    console.warn("Random source load failed.", error);
    unavailableRandomSourceIds.add(randomSourceKey(asset));
    return false;
  }
}

async function loadRandomLibrarySource(options = {}) {
  const tried = new Set();
  const libraryOptions = options.startupMaxBytes ? { maxBytes: options.startupMaxBytes } : {};
  const maxAttempts = getRandomSourceLibrary(libraryOptions).length;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const asset = pickRandomSourceAsset(tried, libraryOptions);
    if (!asset) return false;
    tried.add(randomSourceKey(asset));
    const loaded = await loadRandomSourceAsset(asset, options);
    if (loaded) return true;
  }
  return false;
}

async function loadStartupSource() {
  const loaded = await loadRandomLibrarySource({
    deferSourceTheme: true,
    seedFromOutput: true,
    startupMaxBytes: STARTUP_RANDOM_SOURCE_MAX_BYTES,
  });
  if (!loaded) await loadDefaultSample();
  applyRandomSourceClarityLook({ startup: true });
}

async function loadFile(file, options = {}) {
  if (!file) return;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  state.sourceName = file.name;
  state.randomSourceVisibilityGuard = Boolean(options.visibilityGuard);
  setExportSource({
    name: file.name,
    bytes: file.size,
    format: formatFromName(file.name, file.type),
  });
  state.pendingSourceThemeReset = true;
  state.sourceViewThemeSeed = null;
  state.ditherViewThemeSeed = null;
  state.lastSourceViewThemeAt = 0;
  if (options.seedFromOutput) state.pendingOutputThemeSeed = true;

  if (file.type.startsWith("video/")) {
    await loadVideo(objectUrl, options);
  } else if (isGifFile(file)) {
    try {
      const loadedAnimatedGif = await loadAnimatedGif(file, options);
      if (!loadedAnimatedGif) await loadImage(objectUrl, file, options);
    } catch (error) {
      console.warn("Animated GIF decode failed; loading first frame instead.", error);
      await loadImage(objectUrl, file, options);
    }
  } else {
    await loadImage(objectUrl, file, options);
  }
  if (sourceHasNativeMotion()) setPlaying(!prefersReducedMotion());
  updateStatus();
  scheduleRender();
}

function loadImage(url, file, options = {}) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      clearAnimatedImageSource();
      const dims = fitDimensions(image.naturalWidth, image.naturalHeight);
      resizeCanvases(dims.width, dims.height);
      sourceCtx.clearRect(0, 0, dims.width, dims.height);
      sourceCtx.drawImage(image, 0, 0, dims.width, dims.height);
      state.sourceType = "image";
      state.duration = 4;
      state.time = 0;
      syncTimeline();
      enableStillMotionPreview();
      if (options.deferSourceTheme) {
        updateDynamicThemeFromCanvas(sourceCanvas, true, {
          source: true,
          resetEdit: true,
          deferApply: true,
        });
      } else {
        applyPaletteTheme(true);
        requestAnimationFrame(() => {
          updateDynamicThemeFromCanvas(sourceCanvas, true, {
            source: true,
            resetEdit: true,
            forceApply: false,
            smoothing: STATIC_IMAGE_THEME_IMAGE_SMOOTHING,
          });
        });
      }
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

function animatedFrameIndexAtTime(animatedImage, time) {
  const duration = animatedImage.duration || GIF_SOURCE_DEFAULT_DELAY;
  let localTime = duration ? ((time % duration) + duration) % duration : 0;
  for (let index = 0; index < animatedImage.frames.length; index++) {
    localTime -= animatedImage.frames[index].delay;
    if (localTime < 0) return index;
  }
  return animatedImage.frames.length - 1;
}

function drawAnimatedImageFrame(time = state.time) {
  const animatedImage = state.animatedImage;
  if (!animatedImage?.frames?.length) return;
  const frameIndex = animatedFrameIndexAtTime(animatedImage, time);
  const frame = animatedImage.frames[frameIndex];
  animatedImage.frameCtx.clearRect(0, 0, animatedImage.width, animatedImage.height);
  animatedImage.frameCtx.putImageData(frame.imageData, 0, 0);
  sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  sourceCtx.imageSmoothingEnabled = false;
  sourceCtx.drawImage(animatedImage.frameCanvas, 0, 0, animatedImage.renderWidth, animatedImage.renderHeight);
  animatedImage.lastFrameIndex = frameIndex;
}

async function loadAnimatedGif(file, options = {}) {
  const decoded = decodeAnimatedGif(await file.arrayBuffer());
  if (decoded.frames.length < 2) return false;
  clearAnimatedImageSource();
  const dims = fitDimensions(decoded.width, decoded.height);
  resizeCanvases(dims.width, dims.height);
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = decoded.width;
  frameCanvas.height = decoded.height;
  const frameCtx = frameCanvas.getContext("2d");
  if (!frameCtx) return false;
  state.animatedImage = {
    width: decoded.width,
    height: decoded.height,
    renderWidth: dims.width,
    renderHeight: dims.height,
    duration: decoded.duration,
    frames: decoded.frames,
    frameCanvas,
    frameCtx,
    lastFrameIndex: -1,
  };
  state.sourceType = "animated-image";
  state.duration = decoded.duration;
  state.time = 0;
  syncTimeline();
  drawAnimatedImageFrame(0);
  if (options.deferSourceTheme) {
    const seed = paletteThemeSeed();
    state.sourceThemeSeed = seed;
    state.ditherViewThemeSeed = seed;
    state.lastSourceThemeAt = performance.now();
    state.pendingSourceThemeReset = false;
  } else {
    applyMotionPaletteTheme(true);
  }
  return true;
}

function loadVideo(url, options = {}) {
  return new Promise((resolve, reject) => {
    clearAnimatedImageSource();
    video.onloadedmetadata = () => {
      const dims = fitDimensions(video.videoWidth || 960, video.videoHeight || 540);
      resizeCanvases(dims.width, dims.height);
      state.sourceType = "video";
      state.duration = video.duration || 4;
      state.time = 0;
      video.currentTime = 0;
      syncTimeline();
      if (options.deferSourceTheme) {
        const seed = paletteThemeSeed();
        state.sourceThemeSeed = seed;
        state.ditherViewThemeSeed = seed;
        state.lastSourceThemeAt = performance.now();
        state.pendingSourceThemeReset = false;
      } else {
        applyMotionPaletteTheme(true);
      }
      resolve();
    };
    video.onseeked = () => {
      state.time = video.currentTime;
      if (video.readyState >= 2) {
        sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
        sourceCtx.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);
        if (state.pendingSourceThemeReset && !options.deferSourceTheme) {
          if (state.view === "source") applySourceViewTheme(true);
          else applyMotionPaletteTheme(true);
        }
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
  syncPaletteSelect({ reveal: true });
  applyPaletteTheme(true);
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
      syncPaletteSelect({ reveal: true });
      applyPaletteTheme(true);
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
  writeGifPalette(writer, palette);
  writer.writeByte(0x21);
  writer.writeByte(0xff);
  writer.writeByte(0x0b);
  writer.writeAscii("NETSCAPE2.0");
  writer.writeByte(0x03);
  writer.writeByte(0x01);
  writer.writeShort(0);
  writer.writeByte(0);
}

function writeGifPalette(writer, palette) {
  for (let i = 0; i < GIF_EXPORT_COLORS; i++) {
    const color = palette[i] || palette[palette.length - 1] || [0, 0, 0];
    writer.writeByte(color[0]);
    writer.writeByte(color[1]);
    writer.writeByte(color[2]);
  }
}

function writeGifFrameHeader(writer, width, height, delay, palette = null) {
  writer.writeByte(0x21);
  writer.writeByte(0xf9);
  writer.writeByte(0x04);
  writer.writeByte(GIF_DISPOSAL_NONE << 2);
  writer.writeShort(delay);
  writer.writeByte(0);
  writer.writeByte(0);
  writer.writeByte(0x2c);
  writer.writeShort(0);
  writer.writeShort(0);
  writer.writeShort(width);
  writer.writeShort(height);
  writer.writeByte(palette ? 0x87 : 0);
  if (palette) writeGifPalette(writer, palette);
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
      // The encoder stays one dictionary slot ahead of the decoder, so widen only after passing the current code width.
      if (nextCode > (1 << codeSize) && codeSize < 12) codeSize += 1;
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

function writeGifFrame(writer, width, height, indices, delay, palette = null) {
  writeGifFrameHeader(writer, width, height, delay, palette);
  writeGifLzwData(writer, indices);
}

function addGifPaletteSamples(data, buckets) {
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
}

function paletteFromGifBuckets(buckets) {
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

function buildGifPalette(data) {
  const buckets = new Map();
  addGifPaletteSamples(data, buckets);
  return paletteFromGifBuckets(buckets);
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
  if (isAnimatedImageSource()) drawAnimatedImageFrame(time);
  syncTimeline();
  renderNow({ forceFullQuality: true, skipExportMetrics: true });
  return outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
}

async function exportGIF() {
  if (state.isExporting || state.isRecording) return;
  if (!canStartMeteredExport("GIF")) return;
  const filename = exportFilename("gif", "loop");
  const wasPlaying = state.playing;
  const originalTime = state.time;
  const originalVideoTime = video.currentTime || 0;
  if (wasPlaying) setPlaying(false);
  state.isExporting = true;
  setExportButtonsDisabled(true);
  setExportStatus("gif 0%", "saving");
  try {
    const duration = Math.max(1 / GIF_EXPORT_FPS, Math.min(sourceDuration(), GIF_EXPORT_MAX_SECONDS));
    const frameCount = Math.max(2, Math.min(GIF_EXPORT_MAX_FRAMES, Math.round(duration * GIF_EXPORT_FPS)));
    const frameDelay = Math.max(2, Math.round((duration / frameCount) * 100));
    const frameTimes = Array.from({ length: frameCount }, (_, frame) => (frame / frameCount) * duration);
    const paletteBuckets = new Map();
    let width = 0;
    let height = 0;
    for (let frame = 0; frame < frameCount; frame++) {
      const imageData = await renderFullQualityFrameAt(frameTimes[frame]);
      width = imageData.width;
      height = imageData.height;
      addGifPaletteSamples(imageData.data, paletteBuckets);
      setExportStatus(`gif colors ${Math.round(((frame + 1) / frameCount) * 100)}%`, "saving");
      if (frame % 2 === 1) await waitForAnimationFrame();
    }
    const palette = paletteFromGifBuckets(paletteBuckets);
    const paletteCache = createGifPaletteCache();
    const writer = new GifByteWriter();
    writeGifHeader(writer, width, height, palette);

    for (let frame = 0; frame < frameCount; frame++) {
      const imageData = await renderFullQualityFrameAt(frameTimes[frame]);
      const indices = indexGifFramePixels(imageData.data, palette, paletteCache);
      writeGifFrame(writer, width, height, indices, frameDelay);
      setExportStatus(`gif frames ${Math.round(((frame + 1) / frameCount) * 100)}%`, "saving");
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
    recordMeteredExport();
    setExportStatus(result, "saved", 1600);
  } catch (error) {
    console.error(error);
    setExportStatus("export error", "error", 2400);
  } finally {
    state.time = originalTime;
    if (state.sourceType === "video") await seekVideoFrame(originalVideoTime);
    if (isAnimatedImageSource()) drawAnimatedImageFrame(originalTime);
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
  if (!canStartMeteredExport(format)) return;
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
    recordMeteredExport();
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
  if (!canStartMeteredExport("SVG")) return;
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
    recordMeteredExport();
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

function getMp4MimeType() {
  return [
    'video/mp4;codecs="avc1.42E01E"',
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=avc1.640028",
    "video/mp4;codecs=h264",
    "video/mp4",
  ].find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function getRecordingMimeType(format) {
  return format === "mp4" ? getMp4MimeType() : getWebmMimeType();
}

function getRecordingBitrate(width, height) {
  const estimated = width * height * WEBM_EXPORT_FPS * WEBM_EXPORT_BITS_PER_PIXEL;
  return Math.round(clamp(estimated, WEBM_EXPORT_MIN_BITRATE, WEBM_EXPORT_MAX_BITRATE));
}

async function recordVideoExport(format = "webm") {
  const extension = format === "mp4" ? "mp4" : "webm";
  const label = extension.toUpperCase();
  if (state.isRecording || state.isExporting) return;
  if (!canStartMeteredExport(label)) return;
  if (!outputCanvas.captureStream || !window.MediaRecorder) {
    setExportStatus("unavailable", "error", 2400);
    return;
  }
  const mimeType = getRecordingMimeType(extension);
  if (extension === "mp4" && !mimeType) {
    setExportStatus("mp4 unsupported", "error", 2400);
    return;
  }
  const filename = exportFilename(extension, "loop");
  state.isRecording = true;
  setExportButtonsDisabled(true);
  setExportStatus("recording", "recording");
  const wasPlaying = state.playing;
  let stream = null;
  try {
    if (wasPlaying) setPlaying(false);
    renderNow({ forceFullQuality: true, skipExportMetrics: true });
    stream = outputCanvas.captureStream(WEBM_EXPORT_FPS);
    const recorderOptions = {
      videoBitsPerSecond: getRecordingBitrate(outputCanvas.width, outputCanvas.height),
    };
    if (mimeType) recorderOptions.mimeType = mimeType;
    const recorder = new MediaRecorder(stream, recorderOptions);
    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = async () => {
      try {
        const blob = validateExportBlob(new Blob(chunks, { type: mimeType || "video/webm" }), label);
        setExportResult(blob, label);
        setExportStatus("saving", "saving");
        const result = await saveBlob(blob, filename);
        recordMeteredExport();
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
    const duration = Math.min(sourceDuration(), 8);
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

function recordWebm() {
  return recordVideoExport("webm");
}

function recordMp4() {
  return recordVideoExport("mp4");
}

function renderBatchList() {
  els.batchList.innerHTML = "";
  if (!state.batchFiles.length) {
    const empty = document.createElement("div");
    empty.className = "batch-empty";
    empty.textContent = "No queued image files";
    els.batchList.appendChild(empty);
    syncDitherTextSurfaces(els.batchList);
    requestAnimationFrame(syncMasterScrollIndicator);
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
  syncDitherTextSurfaces(els.batchList);
  requestAnimationFrame(syncMasterScrollIndicator);
}

async function processBatch() {
  if (!state.batchFiles.length) return;
  if (!canStartMeteredExport("BATCH")) return;
  let exportedAny = false;
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
      if (blob) {
        exportedAny = true;
        void downloadBlob(blob, `batch-${i + 1}-${state.batchFiles[i].name.replace(/\.[^.]+$/, "")}.png`);
      }
      resolve();
    }, "image/png"));
    if (status) status.textContent = "done";
  }
  if (exportedAny) recordMeteredExport();
}

function randomizeAdjustmentValues() {
  state.settings.cell = randomInt(2, 4);
  state.settings.levels = randomInt(5, 10);
  state.settings.threshold = randomInt(112, 144);
  state.settings.contrast = randomInt(-12, 28);
  state.settings.brightness = randomInt(-6, 18);
  state.settings.gamma = Number(randomFloat(0.88, 1.18).toFixed(2));
  state.settings.noise = randomInt(0, 18);
  state.settings.temporal = randomInt(8, 54);
}

function randomizeAdjustments() {
  randomizeAdjustmentValues();
  renderAdjustmentControls();
  syncPaletteSelect();
  updateStatus();
  updateDitherTextTexture();
  scheduleEditRender();
  pulseDiceButton(els.randomizeButton);
}

function randomizeLook() {
  const algorithmOptions = ALGORITHMS.filter((item) => algorithmVisibilityWeight(item) > 0);
  const algorithm = weightedRandom(algorithmOptions, algorithmVisibilityWeight) || ALGORITHMS[0];
  const paletteKeys = Object.keys(PALETTES).filter((id) => paletteVisibilityWeight(id) > 0);
  state.algorithm = algorithm.id;
  state.palette = weightedRandom(paletteKeys, paletteVisibilityWeight) || "adaptive";
  randomizeAdjustmentValues();
  renderAdjustmentControls();
  populateAlgorithms();
  syncPaletteSelect();
  updateStatus();
  updateDitherTextTexture();
  scheduleEditRender();
  pulseDiceButton(els.randomizePresetButton);
}

function applyRandomSourceClarityLook(options = {}) {
  const startup = Boolean(options.startup);
  const algorithmPool = RANDOM_SOURCE_CLARITY_ALGORITHMS.filter((preset) => (
    ALGORITHMS.some((algorithm) => algorithm.id === preset.id)
  ));
  const palettePool = RANDOM_SOURCE_CLARITY_PALETTES.filter((preset) => isPaletteOptionAvailable(preset.id));
  const algorithm = startup ? { id: "atkinson" } : weightedRandom(algorithmPool, (preset) => preset.weight);
  const palette = startup ? { id: "adaptive" } : weightedRandom(palettePool, (preset) => preset.weight);

  state.algorithm = algorithm?.id || "atkinson";
  state.palette = palette?.id || "adaptive";
  state.settings = {
    ...state.settings,
    cell: startup ? 2 : randomInt(2, 3),
    levels: startup ? 9 : randomInt(7, 11),
    threshold: startup ? 128 : randomInt(120, 136),
    contrast: startup ? 10 : randomInt(6, 18),
    brightness: startup ? 4 : randomInt(0, 10),
    gamma: startup ? 1 : Number(randomFloat(0.92, 1.08).toFixed(2)),
    noise: startup ? 2 : randomInt(0, 6),
    temporal: startup ? 14 : randomInt(10, 24),
  };

  if (startup) {
    state.effects = [
      { id: "epsilon-glow", strength: 10, enabled: true },
      { id: "scanlines", strength: 8, enabled: true },
    ];
  } else {
    const effectPool = RANDOM_SOURCE_CLARITY_EFFECTS.filter((preset) => EFFECTS.some((effect) => effect.id === preset.id));
    const effectCount = Math.random() > 0.72 ? 2 : 1;
    state.effects = Array.from({ length: effectCount }, () => {
      const effect = weightedRandom(effectPool, (preset) => preset.weight);
      const index = effectPool.findIndex((preset) => preset.id === effect?.id);
      if (index >= 0) effectPool.splice(index, 1);
      return {
        id: effect?.id || "epsilon-glow",
        strength: randomInt(effect?.min || 8, effect?.max || 14),
        enabled: true,
      };
    });
  }

  populateAlgorithms();
  syncPaletteSelect();
  renderAdjustmentControls();
  renderEffects();
  updateStatus();
  updateDitherTextTexture();
  scheduleEditRender();
}

async function summonWizardSignal() {
  if (state.isExporting || state.isRecording) return;
  els.wizardSignalButton?.classList.add("is-casting");
  els.randomSourceButton?.classList.add("is-casting");
  const loaded = await loadRandomLibrarySource({ seedFromOutput: true, visibilityGuard: true });
  if (!loaded) drawWizardSignal();
  applyRandomSourceClarityLook();
  setCanvasView("processed");
  setExportPreview("gif");
  window.setTimeout(() => {
    els.wizardSignalButton?.classList.remove("is-casting");
    els.randomSourceButton?.classList.remove("is-casting");
  }, 700);
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
  requestAnimationFrame(syncMasterScrollIndicator);
}

function bindEvents() {
  els.loadButton.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", () => {
    const [file] = els.fileInput.files;
    loadFile(file);
    els.fileInput.value = "";
  });
  els.resetSampleButton?.addEventListener("click", loadDefaultSample);

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

  els.algorithmSelect.addEventListener("change", () => {
    if (!els.algorithmSelect.value) return;
    state.algorithm = els.algorithmSelect.value;
    updateStatus();
    scheduleEditRender();
  });

  els.paletteSelect.addEventListener("change", () => selectPalette(els.paletteSelect.value, { reveal: true }));
  els.randomizePresetButton?.addEventListener("click", randomizeLook);
  els.randomizePaletteButton?.addEventListener("click", randomizePaletteSource);
  els.randomizeAlgorithmButton?.addEventListener("click", randomizeAlgorithm);
  els.palettePickerList?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const option = target?.closest("[data-palette-option]");
    if (!option || !els.palettePickerList.contains(option)) return;
    selectPalette(option.dataset.paletteOption, { reveal: true });
  });
  els.palettePickerList?.addEventListener("scroll", syncPaletteScrollIndicator, { passive: true });
  els.effectsStack?.addEventListener("scroll", syncEffectsStackScrollIndicator, { passive: true });
  els.masterControlsPane?.addEventListener("scroll", syncLeftScrollIndicators, { passive: true });
  els.masterScrollThumb?.addEventListener("pointerdown", dragMasterScrollIndicator);
  els.pageScrollThumb?.addEventListener("pointerdown", dragPageScrollIndicator);
  document.addEventListener("wheel", handlePageScrollIntent, { passive: true, capture: true });
  document.addEventListener("touchmove", handlePageScrollIntent, { passive: true, capture: true });
  window.addEventListener("scroll", () => showPageScrollIndicator(), { passive: true });
  window.addEventListener("resize", syncLeftScrollIndicators);
  els.extractPaletteButton.addEventListener("click", extractPalette);
  els.exportPaletteButton.addEventListener("click", exportPalette);
  els.importPaletteButton.addEventListener("click", () => els.paletteInput.click());
  els.paletteInput.addEventListener("change", () => importPalette(els.paletteInput.files[0]));

  els.randomizeEffectsButton?.addEventListener("click", randomizeEffectsStack);
  els.effectSelect.addEventListener("change", () => addEffectToStack(els.effectSelect.value));

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => setCanvasView(button.dataset.view));
  });

  els.playButton.addEventListener("click", () => setPlaying(!state.playing));
  els.stepBackButton.addEventListener("click", () => stepTimeline(-1 / 12));
  els.stepForwardButton.addEventListener("click", () => stepTimeline(1 / 12));
  els.recordButton.addEventListener("click", recordWebm);
  els.recordWebmButton.addEventListener("click", recordWebm);
  els.recordMp4Button?.addEventListener("click", recordMp4);
  els.loopToggle.addEventListener("change", () => {
    video.loop = els.loopToggle.checked;
  });
  els.animateStillToggle.addEventListener("change", () => {
    state.animateStill = els.animateStillToggle.checked;
    state.editThemeActive = true;
    if (!sourceHasNativeMotion()) setPlaying(state.animateStill && !prefersReducedMotion());
    scheduleRender();
  });
  els.livePreviewToggle.addEventListener("change", () => {
    state.livePreview = els.livePreviewToggle.checked;
    if (state.dirty && state.livePreview) scheduleRender();
  });
  els.timelineSlider.addEventListener("input", () => {
    const duration = sourceDuration();
    state.time = (Number(els.timelineSlider.value) / 1000) * duration;
    if (state.sourceType === "video") video.currentTime = state.time;
    syncTimeline();
    scheduleEditRender();
  });

  els.downloadPngButton.addEventListener("click", () => downloadCanvas("image/png"));
  els.downloadJpgButton.addEventListener("click", () => downloadCanvas("image/jpeg"));
  els.downloadGifButton.addEventListener("click", exportGIF);
  els.exportIconButton?.addEventListener("click", exportGIF);
  els.downloadSvgButton.addEventListener("click", exportSVG);
  els.exportGateDismiss?.addEventListener("click", () => {
    if (els.exportGate) els.exportGate.hidden = true;
  });
  window.addEventListener("storage", (event) => {
    if (event.key === EXPORT_COUNT_KEY) syncExportEntitlement();
  });
  els.wizardSignalButton?.addEventListener("click", summonWizardSignal);
  els.randomSourceButton?.addEventListener("click", summonWizardSignal);
  [
    els.exportIconButton,
    els.downloadGifButton,
    els.downloadPngButton,
    els.downloadJpgButton,
    els.downloadSvgButton,
    els.recordWebmButton,
    els.recordMp4Button,
  ].forEach((button) => {
    if (!button) return;
    const previewFormat = button.dataset.exportFormat;
    button.addEventListener("mouseenter", () => setExportPreview(previewFormat));
    button.addEventListener("focus", () => setExportPreview(previewFormat));
  });
  syncExportEntitlement();
  setExportPreview(state.exportPreviewFormat);
  els.batchInputButton.addEventListener("click", () => els.batchInput.click());
  els.batchInput.addEventListener("change", () => {
    state.batchFiles = [...els.batchInput.files].filter((file) => file.type.startsWith("image/"));
    renderBatchList();
  });
  els.processBatchButton.addEventListener("click", processBatch);
  els.randomizeButton.addEventListener("click", randomizeAdjustments);
  els.savePresetButton.addEventListener("click", savePreset);
  els.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(current === "light" ? "dark" : "light");
  });
  window.addEventListener("resize", () => scheduleRender());
  document.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(event.key)) {
      showPageScrollIndicator();
    }
    if (event.key === " ") {
      event.preventDefault();
      setPlaying(!state.playing);
    }
    if (event.key === "ArrowLeft") stepTimeline(-1 / 12);
    if (event.key === "ArrowRight") stepTimeline(1 / 12);
  });
}

function stepTimeline(delta) {
  const duration = sourceDuration();
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
  updateDitherTextTexture();
  syncDitherTextSurfaces();
  window.DitherSharedLogotype?.stop?.();
  initLogotypeSurfaces();
  bindEvents();
  await loadStartupSource();
  renderNow();
  syncLeftScrollIndicators();
}

init();
