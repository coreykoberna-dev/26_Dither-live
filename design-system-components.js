(function () {
  const componentFamilies = [
    {
      id: "actions",
      label: "Actions",
      lead: "Commands that mutate the image, queue, preset library, or export state.",
      components: [
        {
          name: "Button",
          intent: "Primary, secondary, destructive, loading, disabled, icon-leading, and compact variants.",
          states: ["default", "hover", "focus", "pressed", "selected", "loading", "disabled", "error"],
          tokens: "Uses primary, secondary, error, outline, focus ring, and on-color roles.",
          access: "Minimum 44px touch target, visible label, aria-busy while rendering.",
          product: "Process, export, reset, randomize, save preset, clear queue.",
        },
        {
          name: "Floating action button",
          intent: "Pinned high-emphasis command for the one action that should stay reachable while inspecting output.",
          states: ["default", "hover", "focus", "pressed", "loading", "disabled"],
          tokens: "Primary container, on-primary-container, focus ring, elevated action plane.",
          access: "Use one visible label or a labelled icon. Never cover canvas metadata or timeline controls.",
          product: "Capture frame, record loop, or run batch when the workspace is scrolled.",
        },
        {
          name: "Icon button",
          intent: "Dense single-purpose action with tooltip and accessible label.",
          states: ["default", "hover", "focus", "pressed", "selected", "disabled"],
          tokens: "24-grid pixel glyph, currentColor, transparent default surface.",
          access: "Never icon-only without aria-label. Tooltip names the command, not the icon shape.",
          product: "Fullscreen, theme, step frame, lock seed, remove effect.",
        },
        {
          name: "Segmented control",
          intent: "Mutually exclusive mode switching with fixed-height items and overflow-safe labels.",
          states: ["default", "selected", "focus", "disabled"],
          tokens: "Segment background, active background, outline, primary text.",
          access: "Use roving focus or native buttons in a named group.",
          product: "Output, split, source, mask, vectors, motion modes.",
        },
        {
          name: "Split button",
          intent: "Default command plus adjacent menu for related command variants.",
          states: ["default", "menu open", "focus", "loading", "disabled"],
          tokens: "Primary action fill, outline divider, menu surface, elevation level 2.",
          access: "Main action and menu trigger have separate labels.",
          product: "Export PNG by default, open SVG, WebM, palette JSON, copy CSS.",
        },
        {
          name: "Action group",
          intent: "Toolbar cluster for tightly related controls with one visual rhythm.",
          states: ["default", "selected", "focus", "overflow", "disabled"],
          tokens: "Open row, hairline separators, compact spacing, currentColor icons.",
          access: "Provide group label and preserve tab order left to right.",
          product: "Undo, redo, compare, fit, zoom, snap, crop.",
        },
        {
          name: "Quick trigger",
          intent: "High-priority floating or pinned command without decorative card treatment.",
          states: ["default", "hover", "focus", "pressed", "disabled"],
          tokens: "Primary role, focus ring, active glow, reduced-motion safe scan.",
          access: "Avoid covering canvas controls or status text.",
          product: "Capture frame, cast preview, run batch, record loop.",
        },
      ],
    },
    {
      id: "communication",
      label: "Communication",
      lead: "Feedback, interruption, status, and instructional signals that help users recover without leaving flow.",
      components: [
        {
          name: "Banner",
          intent: "Persistent inline notice for system-wide state.",
          states: ["info", "success", "warning", "error", "dismissed"],
          tokens: "Surface container, semantic role, outline variant, icon currentColor.",
          access: "Include text label and action. Do not rely on warning color alone.",
          product: "Unsupported video codec, palette extracted, low contrast warning.",
        },
        {
          name: "Dialog",
          intent: "Blocking confirmation for destructive or irreversible choices.",
          states: ["open", "focus trapped", "submitting", "error"],
          tokens: "Surface container high, scrim, focus ring, action hierarchy.",
          access: "Use aria-modal, labelled title, initial focus, Escape close when safe.",
          product: "Delete preset, clear batch, overwrite export.",
        },
        {
          name: "Snackbar",
          intent: "Short-lived confirmation with optional undo.",
          states: ["queued", "visible", "actioned", "dismissed"],
          tokens: "Inverse surface, inverse on-surface, primary action accent.",
          access: "Announce politely. Keep action reachable by keyboard.",
          product: "Preset saved, export copied, effect duplicated.",
        },
        {
          name: "Tooltip",
          intent: "Names dense controls and explains unfamiliar pixel glyphs.",
          states: ["hover", "focus", "delayed", "dismissed"],
          tokens: "Inverse surface, small mono type, 4px radius.",
          access: "Do not hide required instructions in tooltips.",
          product: "Icon-only canvas controls, timeline transport, palette lock.",
        },
        {
          name: "Progress indicator",
          intent: "Determinate or indeterminate processing feedback.",
          states: ["idle", "running", "paused", "complete", "failed"],
          tokens: "Primary sweep, track outline, success, error, reduced-motion fallback.",
          access: "Expose aria-valuenow when determinate and text status when long-running.",
          product: "Dither render, batch progress, video frame extraction.",
        },
        {
          name: "Badge",
          intent: "Small count, category, or metadata marker attached to another component.",
          states: ["neutral", "count", "selected", "warning", "error", "hidden"],
          tokens: "Outline variant, muted mono text, semantic tint only when stateful.",
          access: "Badge text must be present in the related control label or nearby copy when it carries meaning.",
          product: "63 algorithms, format tags, preset counts, icon library result counts.",
        },
        {
          name: "Status chip",
          intent: "Compact operational state label for recording, queue, seed, export, or render status.",
          states: ["neutral", "selected", "loading", "success", "warning", "error"],
          tokens: "Semantic tint, outline, mono label, optional pixel glyph.",
          access: "Use readable text. Color is reinforcement only.",
          product: "Recording, over budget, seed locked, queued, complete, failed.",
        },
      ],
    },
    {
      id: "containment",
      label: "Containment",
      lead: "Structures that group operational controls without turning the page into stacked boxes.",
      components: [
        {
          name: "Card",
          intent: "Repeated item container only; never a page section wrapper or card inside another card.",
          states: ["default", "hover", "focus", "selected", "loading", "disabled"],
          tokens: "Surface container low, outline variant, 4px radius, compact spacing.",
          access: "If clickable, use button or link semantics for the actual action, not a hidden full-card trap.",
          product: "Preset tile, export history item, icon inventory result, asset specimen.",
        },
        {
          name: "Carousel",
          intent: "Horizontal browsing for visual specimens where comparison matters more than vertical reading.",
          states: ["default", "selected", "scrolling", "overflow", "empty"],
          tokens: "Frame surface, selected outline, scroll shadows, reduced-motion safe snapping.",
          access: "Provide keyboard previous/next controls and visible item position.",
          product: "Sprite states, palette ramps, batch thumbnails, before/after looks.",
        },
        {
          name: "Pane",
          intent: "Primary workbench region with independent scrolling and stable density.",
          states: ["default", "resized", "collapsed", "empty", "loading"],
          tokens: "Pane surface, border line, scrollbar, sticky subheader.",
          access: "Keep pane headings programmatic and preserve keyboard scroll access.",
          product: "Ingest, preview, algorithm, effects, export panes.",
        },
        {
          name: "Panel",
          intent: "Local group of related controls using rules and rhythm, not heavy containers.",
          states: ["default", "expanded", "collapsed", "disabled"],
          tokens: "Transparent background, hairline rules, section labels, compact spacing.",
          access: "Heading hierarchy must remain clear when panels collapse.",
          product: "Adjustment rack, palette lab, file-size equipment.",
        },
        {
          name: "List row",
          intent: "Repeated object row with status, actions, and dense metadata.",
          states: ["default", "hover", "selected", "loading", "error", "dragging"],
          tokens: "Open row, focus ring, state chip, icon slot.",
          access: "Full row is not a hidden button unless it has button semantics.",
          product: "Batch item, preset row, effect stack row, export history.",
        },
        {
          name: "Divider and rule",
          intent: "Relationship marker between groups, rows, and diagnostics.",
          states: ["dim", "standard", "active", "semantic"],
          tokens: "Outline variant, primary accent segment, no thick side stripe.",
          access: "Decorative rules are aria-hidden.",
          product: "Section breaks, row separators, meter baselines.",
        },
        {
          name: "Details and accordion",
          intent: "Progressive disclosure for dense documentation or advanced controls.",
          states: ["closed", "opening", "open", "focus", "disabled"],
          tokens: "Summary row, expander glyph, motion-fast, reduced-motion respect.",
          access: "Native details preferred. Summary text must describe hidden content.",
          product: "Component catalog, advanced effect settings, QA notes.",
        },
        {
          name: "Bottom sheet",
          intent: "Mobile-first temporary surface for dense controls that cannot fit beside the preview.",
          states: ["closed", "opening", "open", "scrimmed", "dismissed"],
          tokens: "Surface container high, top handle, scrim, compact header.",
          access: "Trap focus when modal, support Escape/close, and restore focus to the trigger.",
          product: "Mobile algorithm controls, export settings, preset browser.",
        },
        {
          name: "Side sheet",
          intent: "Desktop or tablet side surface for temporary configuration without leaving the editor.",
          states: ["closed", "opening", "open", "resized", "dismissed"],
          tokens: "Pane surface, elevation level 3, outline, sticky header.",
          access: "Use labelled region semantics and keep close controls keyboard reachable.",
          product: "Advanced palette settings, batch details, export manifests.",
        },
        {
          name: "Frame strip",
          intent: "Horizontal collection of previews or steps with dense scanning.",
          states: ["default", "selected", "loading", "overflow", "empty"],
          tokens: "Canvas border, selected outline, timeline track, thumbnail surface.",
          access: "Arrow navigation and visible selected label.",
          product: "Timeline frames, batch thumbnails, palette swatches.",
        },
      ],
    },
    {
      id: "navigation",
      label: "Navigation",
      lead: "Movement between product areas, documentation families, and local views.",
      components: [
        {
          name: "Shared header",
          intent: "Global product identity, primary routes, theme, and fullscreen controls.",
          states: ["default", "current route", "focus", "mobile wrap"],
          tokens: "Topbar surface, mono route labels, icon buttons, focus ring.",
          access: "Use a named nav region and preserve logical order.",
          product: "Home, Contact, Design System, theme toggle, fullscreen.",
        },
        {
          name: "Navigation bar",
          intent: "Small-screen route strip when the full header needs to collapse.",
          states: ["default", "current route", "focus", "overflow"],
          tokens: "Top or bottom surface, current route accent, icon plus text rhythm.",
          access: "Expose current route with aria-current and keep labels visible at narrow widths.",
          product: "Home, Design System, editor, export, saved presets.",
        },
        {
          name: "Navigation drawer",
          intent: "Temporary route and section list for mobile or narrow documentation views.",
          states: ["closed", "opening", "open", "current route", "dismissed"],
          tokens: "Surface container high, scrim, section labels, active row.",
          access: "Trap focus while modal, close on Escape, restore focus to trigger.",
          product: "Design-system section browser and future mobile editor navigation.",
        },
        {
          name: "Navigation rail",
          intent: "Persistent narrow rail for large documentation maps or future editor tools.",
          states: ["default", "active", "expanded group", "collapsed group", "focus"],
          tokens: "Rail surface, active accent, section labels, dim inactive text.",
          access: "Only the current destination owns aria-current. Group toggles remain native buttons or summaries.",
          product: "Design-system left rail and future tool category rail.",
        },
        {
          name: "Documentation rail",
          intent: "Compact left rail for system sections and subsections.",
          states: ["collapsed group", "expanded group", "active", "focus"],
          tokens: "Rail surface, single-select active state, green accent, dim inactive text.",
          access: "Only one item owns aria-current at a time.",
          product: "Design-system section navigation.",
        },
        {
          name: "Tabs",
          intent: "Major section switching without deep vertical expansion.",
          states: ["selected", "hover", "focus", "overflow", "disabled"],
          tokens: "Tab rail, active scan line, panel reveal motion.",
          access: "Use role tablist, roving focus, arrow keys, labelled panels.",
          product: "Component families, icon styles, preview modes.",
        },
        {
          name: "Breadcrumb and path",
          intent: "Orientation for nested documentation or batch paths.",
          states: ["default", "current", "overflow"],
          tokens: "Muted mono labels, current text, separator glyph.",
          access: "Use nav label and mark the current page.",
          product: "Design System / Components / Navigation.",
        },
        {
          name: "Search and command entry",
          intent: "Fast filtering or direct navigation by keyword.",
          states: ["empty", "typing", "results", "no results", "loading"],
          tokens: "Text field, search glyph, surface container, result rows.",
          access: "Announce result count and support Escape clear.",
          product: "Icon library search, algorithm filter, preset finder.",
        },
        {
          name: "Footer",
          intent: "Compact persistent route and repo access at document end.",
          states: ["default", "hover", "focus"],
          tokens: "Footer surface, link underline/focus, compact spacing.",
          access: "Links remain visible and keyboard reachable.",
          product: "Home, Design System, Contact, GitHub Repo.",
        },
      ],
    },
    {
      id: "selection",
      label: "Selection",
      lead: "Controls for choosing modes, toggles, values, palettes, and queue membership.",
      components: [
        {
          name: "Checkbox",
          intent: "Independent binary or multi-select choice.",
          states: ["unchecked", "checked", "indeterminate", "focus", "disabled", "error"],
          tokens: "Outline, primary fill, error outline, check glyph.",
          access: "Native input preferred. Label target includes visible text.",
          product: "Batch item select, export layers, preserve alpha.",
        },
        {
          name: "Radio",
          intent: "Single choice in a small exclusive group.",
          states: ["unchecked", "checked", "focus", "disabled", "error"],
          tokens: "Primary dot, outline, mono group label.",
          access: "Use fieldset and legend for groups.",
          product: "Palette mode, scaling method, output target.",
        },
        {
          name: "Switch",
          intent: "Immediate on/off setting with clear state persistence.",
          states: ["off", "on", "focus", "disabled"],
          tokens: "Track surface, primary thumb, text label.",
          access: "Label states in text when meaning is not obvious.",
          product: "Motion dither, lock seed, invert, transparency.",
        },
        {
          name: "Slider",
          intent: "Continuous numeric adjustment with live output.",
          states: ["default", "focus", "dragging", "disabled", "error"],
          tokens: "Track, fill, thumb, numeric output, focus ring.",
          access: "Expose min, max, value, and keyboard increments.",
          product: "Threshold, contrast, scale, scanline speed, noise.",
        },
        {
          name: "Chips",
          intent: "Compact selectable metadata, filter, or removable token.",
          states: ["default", "selected", "focus", "removable", "disabled"],
          tokens: "Outline, selected fill, icon slot, close glyph.",
          access: "Selected state must be announced and removable chips have labelled buttons.",
          product: "Algorithm tags, file formats, preset filters.",
        },
        {
          name: "Menu and listbox",
          intent: "Dense option selection with grouping and keyboard navigation.",
          states: ["closed", "open", "highlighted", "selected", "invalid"],
          tokens: "Menu surface, active row, group label, elevation.",
          access: "Support arrows, Home, End, Escape, and typeahead where possible.",
          product: "Dither algorithm list, export format, color space.",
        },
        {
          name: "Palette swatch group",
          intent: "Selectable color ramps and extracted seed colors.",
          states: ["default", "selected", "locked", "invalid contrast"],
          tokens: "Swatch geometry, primary outline, warning/error state.",
          access: "Each swatch has a text name or value.",
          product: "Dynamic theme seed, limited palette, print palette.",
        },
      ],
    },
    {
      id: "inputs",
      label: "Text Inputs",
      lead: "Typed entry, search, upload, and numeric control with strong validation states.",
      components: [
        {
          name: "Text field",
          intent: "Single-line naming, notes, and small configuration values.",
          states: ["empty", "filled", "hover", "focus", "disabled", "invalid"],
          tokens: "Field surface, outline, label text, error role.",
          access: "Programmatic label, helper text, error text, autocomplete when useful.",
          product: "Preset name, export filename, project label.",
        },
        {
          name: "Search field",
          intent: "Filter large lists without page navigation.",
          states: ["empty", "typing", "results", "no results", "clearable"],
          tokens: "Search icon, field surface, result count, focus ring.",
          access: "Announce result count and provide clear button label.",
          product: "Algorithm search, icon library filter, preset finder.",
        },
        {
          name: "Textarea",
          intent: "Longer notes, prompts, and preset descriptions.",
          states: ["empty", "filled", "focus", "resizing", "invalid"],
          tokens: "Field surface, outline, helper text, count text.",
          access: "Resize must not break surrounding controls.",
          product: "Preset notes, export comments, design-system annotations.",
        },
        {
          name: "Select field",
          intent: "Single choice when options are known and compact.",
          states: ["closed", "open", "selected", "focus", "disabled", "invalid"],
          tokens: "Field surface, menu surface, selected row, caret glyph.",
          access: "Native select is acceptable where custom behavior is not required.",
          product: "Palette, format, algorithm family, aspect ratio.",
        },
        {
          name: "Number field and stepper",
          intent: "Precise numeric input with bounded increments.",
          states: ["default", "focus", "stepping", "invalid", "disabled"],
          tokens: "Field surface, step buttons, unit label, error text.",
          access: "Expose units and min/max. Do not rely on slider alone for precision.",
          product: "Width, height, frame rate, color count, file budget.",
        },
        {
          name: "File input and dropzone",
          intent: "Source image, video, and batch ingestion.",
          states: ["empty", "drag over", "uploading", "accepted", "rejected", "error"],
          tokens: "Drop surface, outline, progress, success/error roles.",
          access: "Keyboard-accessible button remains available next to drag and drop.",
          product: "Image upload, video capture, batch folder replacement.",
        },
        {
          name: "Range and frame fields",
          intent: "Start, end, loop, and clip range entry.",
          states: ["empty", "filled", "linked", "invalid range", "disabled"],
          tokens: "Text field, timeline accent, warning role, helper text.",
          access: "Validate relationships and announce range errors.",
          product: "Video trim, GIF loop, export frame window.",
        },
        {
          name: "Date picker",
          intent: "Calendar entry for dated exports or future project metadata, not a default editing control.",
          states: ["empty", "selected", "open", "invalid", "disabled"],
          tokens: "Field surface, calendar popover, selected day primary role, error role.",
          access: "Native date input is acceptable; custom calendars need full keyboard grid navigation.",
          product: "Dated preset manifests, scheduled asset batches, documentation changelog metadata.",
        },
        {
          name: "Time picker",
          intent: "Precise time entry for clip metadata, export naming, or future scheduled processing.",
          states: ["empty", "selected", "open", "invalid", "disabled"],
          tokens: "Field surface, time popover, active option, unit labels.",
          access: "Expose hour, minute, timezone or duration context in text.",
          product: "Loop start labels, export timestamp metadata, batch manifest timing.",
        },
      ],
    },
    {
      id: "workflows",
      label: "Dither Workflows",
      lead: "Product-specific components that make this more than a generic Material clone.",
      components: [
        {
          name: "Preview canvas",
          intent: "Primary image surface with source, output, split, and inspection modes.",
          states: ["empty", "loading", "rendering", "ready", "error", "zoomed"],
          tokens: "Canvas surface, preview border, focus ring, checker transparency.",
          access: "Expose mode and output metadata outside the canvas.",
          product: "Live dither output, source compare, inspect pixels.",
        },
        {
          name: "Timeline transport",
          intent: "Frame playback and motion-dither control.",
          states: ["stopped", "playing", "paused", "recording", "reduced motion"],
          tokens: "Transport buttons, timeline track, active sweep, recording status.",
          access: "Buttons announce current playback state and frame count.",
          product: "Animated stills, video frames, loop preview.",
        },
        {
          name: "Algorithm picker",
          intent: "Browsable dither algorithm selection with metadata.",
          states: ["default", "filtered", "selected", "favorite", "unavailable"],
          tokens: "List row, category chip, selected outline, search field.",
          access: "Keyboard search and selected state are required.",
          product: "63 algorithm choices and family filtering.",
        },
        {
          name: "Effect stack",
          intent: "Ordered, removable processing layers.",
          states: ["empty", "active", "dragging", "bypassed", "error"],
          tokens: "Open row, drag handle glyph, state chip, rule separators.",
          access: "Provide non-drag controls for reorder and remove.",
          product: "Sharpen, posterize, distortion, scanlines, bloom.",
        },
        {
          name: "Palette inspector",
          intent: "Extracted colors, locked seed, and output ramp decisions.",
          states: ["extracting", "ready", "locked", "contrast warning"],
          tokens: "Swatches, color roles, warning chip, dynamic seed indicator.",
          access: "Swatches expose names or color values.",
          product: "Material seed color, limited palette, print ramp.",
        },
        {
          name: "Batch queue row",
          intent: "Per-file status, preview, selection, and recovery.",
          states: ["queued", "processing", "complete", "failed", "selected", "removed"],
          tokens: "Row surface, thumbnail, progress, status chip, remove action.",
          access: "Status updates are announced politely.",
          product: "Batch image processing and retry.",
        },
        {
          name: "Export meter",
          intent: "Live output size, dimensions, format, and savings.",
          states: ["estimating", "ready", "over budget", "exporting", "complete"],
          tokens: "Radial meter, file stats, success/warning/error roles.",
          access: "Numeric values must render as text, not only in the radial meter.",
          product: "PNG, SVG, palette JSON, WebM, file-size savings.",
        },
      ],
    },
  ];

  const componentVariants = {
    Button: ["primary", "secondary", "destructive", "loading", "compact"],
    "Floating action button": ["extended", "icon-only", "pinned", "loading"],
    "Icon button": ["plain", "selected", "destructive", "disabled"],
    "Segmented control": ["two-up", "three-up", "scrolling", "disabled item"],
    "Split button": ["default action", "menu trigger", "open menu", "loading"],
    "Action group": ["toolbar", "overflow", "mixed selection", "disabled group"],
    "Quick trigger": ["pinned", "inline", "busy", "reduced-motion"],
    Banner: ["info", "success", "warning", "error", "dismissible"],
    Dialog: ["confirmation", "destructive", "busy", "recoverable error"],
    Snackbar: ["confirmation", "undo", "export complete", "dismissed"],
    Tooltip: ["hover", "focus", "delayed", "disabled target"],
    "Progress indicator": ["determinate", "indeterminate", "paused", "failed"],
    Badge: ["count", "category", "semantic", "hidden"],
    "Status chip": ["neutral", "loading", "success", "warning", "error"],
    Card: ["preset", "asset", "selected", "loading"],
    Carousel: ["thumbnail strip", "snap list", "overflow", "empty"],
    Pane: ["ingest", "stage", "control", "collapsed", "loading"],
    Panel: ["section", "expanded", "collapsed", "disabled"],
    "List row": ["batch item", "preset row", "effect row", "dragging"],
    "Divider and rule": ["dim", "standard", "active", "semantic"],
    "Details and accordion": ["closed", "open", "nested section", "disabled"],
    "Bottom sheet": ["modal", "persistent", "half-height", "full-height"],
    "Side sheet": ["modal", "modeless", "resizable", "dismissed"],
    "Frame strip": ["timeline", "thumbnail", "palette", "selected"],
    "Shared header": ["desktop", "mobile wrap", "current route", "busy"],
    "Navigation bar": ["top", "bottom", "current route", "overflow"],
    "Navigation drawer": ["modal", "sectioned", "current route", "dismissed"],
    "Navigation rail": ["collapsed", "expanded", "active", "grouped"],
    "Documentation rail": ["grouped", "active", "collapsed group", "keyboard"],
    Tabs: ["manual activation", "auto activation", "overflow", "disabled"],
    "Breadcrumb and path": ["short path", "overflow", "current page"],
    "Search and command entry": ["empty", "typing", "results", "no results"],
    Footer: ["document", "product", "link focus", "mobile stack"],
    Checkbox: ["unchecked", "checked", "indeterminate", "error"],
    Radio: ["unchecked", "checked", "group error", "disabled"],
    Switch: ["off", "on", "labelled state", "disabled"],
    Slider: ["single value", "bounded", "live output", "disabled"],
    Chips: ["filter", "input", "selected", "removable"],
    "Menu and listbox": ["native select", "custom listbox", "grouped", "typeahead"],
    "Palette swatch group": ["extracted", "locked", "selected", "contrast warning"],
    "Text field": ["empty", "filled", "helper text", "invalid"],
    "Search field": ["empty", "typing", "clearable", "no results"],
    Textarea: ["notes", "resizable", "counter", "invalid"],
    "Select field": ["native", "grouped", "invalid", "disabled"],
    "Number field and stepper": ["unit suffix", "bounded", "stepping", "invalid"],
    "File input and dropzone": ["empty", "drag over", "accepted", "rejected"],
    "Range and frame fields": ["start/end", "linked", "invalid range", "disabled"],
    "Date picker": ["native", "popover", "invalid", "disabled"],
    "Time picker": ["native", "duration", "invalid", "disabled"],
    "Preview canvas": ["processed", "split", "source", "zoomed"],
    "Timeline transport": ["stopped", "playing", "recording", "reduced-motion"],
    "Algorithm picker": ["unfiltered", "filtered", "selected", "favorite"],
    "Effect stack": ["empty", "ordered", "bypassed", "dragging"],
    "Palette inspector": ["extracting", "ready", "locked", "warning"],
    "Batch queue row": ["queued", "processing", "complete", "failed"],
    "Export meter": ["estimating", "ready", "over budget", "complete"],
  };

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function componentRecordId(familyId, componentName) {
    return `component-${familyId}-${slugify(componentName)}`;
  }

  function getComponentVariants(component) {
    return component.variants || componentVariants[component.name] || ["default", "dense", "loading", "disabled"];
  }

  function createChipList(items) {
    const list = createElement("div", "component-chip-list");
    items.forEach((item) => {
      list.appendChild(createElement("span", "component-chip", item));
    });
    return list;
  }

  function createDetail(component, familyId, isOpen) {
    const detail = createElement("details", "component-detail");
    detail.open = isOpen;
    detail.id = componentRecordId(familyId, component.name);
    detail.dataset.componentRecord = detail.id;
    detail.dataset.componentFamily = familyId;

    const summary = document.createElement("summary");
    const copy = createElement("span", "component-summary-copy");
    copy.appendChild(createElement("strong", "", component.name));
    copy.appendChild(createElement("span", "", component.intent));
    summary.appendChild(copy);
    summary.appendChild(createElement("span", "component-expander"));
    detail.appendChild(summary);

    const body = createElement("div", "component-detail-body");

    [
      ["States", createChipList(component.states)],
      ["Variants / modes", createChipList(getComponentVariants(component))],
      ["Tokens", component.tokens],
      ["Accessibility", component.access],
      ["Dither Wizard use", component.product],
    ].forEach(([label, value]) => {
      const cell = createElement("div", "component-detail-cell");
      cell.appendChild(createElement("span", "token-name", label));
      if (value instanceof HTMLElement) cell.appendChild(value);
      else cell.appendChild(createElement("p", "", value));
      body.appendChild(cell);
    });

    detail.appendChild(body);
    return detail;
  }

  function setActiveTab(root, activeId, focusTab = false) {
    const tabs = Array.from(root.querySelectorAll("[data-component-tab]"));
    const panels = Array.from(root.querySelectorAll("[data-component-panel]"));

    tabs.forEach((tab) => {
      const isActive = tab.dataset.componentTab === activeId;
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && focusTab) tab.focus();
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.componentPanel === activeId;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
  }

  function renderCatalog(root) {
    const totalComponents = componentFamilies.reduce((count, family) => count + family.components.length, 0);

    const header = createElement("div", "component-catalog-head");
    const intro = createElement("div", "component-catalog-intro");
    intro.appendChild(createElement("span", "token-name", "component model"));
    intro.appendChild(createElement("strong", "", "Tabbed families, collapsed records, full product contract."));
    intro.appendChild(createElement("p", "", "Each record carries variants, states, token dependencies, accessibility expectations, and Dither Wizard usage so the section stays complete without becoming a vertical wall."));
    header.appendChild(intro);

    const stats = createElement("div", "component-catalog-stats", "");
    [
      [componentFamilies.length, "families"],
      [totalComponents, "components"],
      [5, "required fields"],
    ].forEach(([value, label]) => {
      const stat = createElement("span", "");
      stat.appendChild(createElement("strong", "", String(value)));
      stat.appendChild(document.createTextNode(label));
      stats.appendChild(stat);
    });
    header.appendChild(stats);
    root.appendChild(header);

    const tablist = createElement("div", "component-tablist");
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", "Component families");

    const panels = createElement("div", "component-panels");

    componentFamilies.forEach((family, familyIndex) => {
      const tab = createElement("button", "component-tab", family.label);
      const tabId = `component-tab-${family.id}`;
      const panelId = `component-panel-${family.id}`;
      tab.type = "button";
      tab.id = tabId;
      tab.dataset.componentTab = family.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panelId);
      tab.setAttribute("aria-selected", familyIndex === 0 ? "true" : "false");
      tab.tabIndex = familyIndex === 0 ? 0 : -1;
      tablist.appendChild(tab);

      const panel = createElement("section", "component-panel");
      panel.id = panelId;
      panel.dataset.componentPanel = family.id;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
      panel.hidden = familyIndex !== 0;
      panel.classList.toggle("is-active", familyIndex === 0);

      const panelIntro = createElement("div", "component-family-intro");
      const panelCopy = createElement("div", "");
      panelCopy.appendChild(createElement("span", "token-name", `${String(family.components.length).padStart(2, "0")} records`));
      panelCopy.appendChild(createElement("strong", "", family.label));
      panelCopy.appendChild(createElement("p", "", family.lead));
      panelIntro.appendChild(panelCopy);
      panelIntro.appendChild(createElement("span", "component-family-count", `${family.components.length} components`));
      panel.appendChild(panelIntro);

      family.components.forEach((component, componentIndex) => {
        panel.appendChild(createDetail(component, family.id, familyIndex === 0 && componentIndex === 0));
      });

      panels.appendChild(panel);
    });

    root.appendChild(tablist);
    root.appendChild(panels);

    root.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const tab = target?.closest("[data-component-tab]");
      if (!tab || !root.contains(tab)) return;
      setActiveTab(root, tab.dataset.componentTab || componentFamilies[0].id, true);
    });

    root.addEventListener("keydown", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const activeTab = target?.closest("[data-component-tab]");
      if (!activeTab || !root.contains(activeTab)) return;

      const tabs = Array.from(root.querySelectorAll("[data-component-tab]"));
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < 0) return;

      const commands = {
        ArrowRight: (currentIndex + 1) % tabs.length,
        ArrowDown: (currentIndex + 1) % tabs.length,
        ArrowLeft: (currentIndex - 1 + tabs.length) % tabs.length,
        ArrowUp: (currentIndex - 1 + tabs.length) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };

      if (!(event.key in commands)) return;
      event.preventDefault();
      const nextTab = tabs[commands[event.key]];
      setActiveTab(root, nextTab.dataset.componentTab || componentFamilies[0].id, true);
    });
  }

  function activateComponentHash(root, hash, shouldScroll = true) {
    if (!hash || !hash.startsWith("#component-")) return false;
    const record = root.querySelector(hash);
    if (!record) return false;
    const familyId = record.dataset.componentFamily || componentFamilies[0].id;
    setActiveTab(root, familyId, false);
    record.open = true;
    if (shouldScroll) {
      requestAnimationFrame(() => {
        record.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
    }
    return true;
  }

  const root = document.querySelector("[data-component-catalog]");
  if (root) {
    renderCatalog(root);
    activateComponentHash(root, window.location.hash, true);
    window.addEventListener("hashchange", () => activateComponentHash(root, window.location.hash, true));
    window.addEventListener("popstate", () => activateComponentHash(root, window.location.hash, true));
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest('a[href^="#component-"]');
      if (!link) return;
      activateComponentHash(root, link.getAttribute("href") || "", false);
    }, true);
  }
})();
