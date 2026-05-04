(function () {
  const storageKey = "ditherWizard.navMotion";
  const options = [
    {
      id: "trace",
      name: "Trace Fold",
      motion: "y fade",
      duration: "170ms",
      description: "Quiet default with a short vertical trace for technical documentation.",
    },
    {
      id: "lock",
      name: "Lock Snap",
      motion: "scale-y",
      duration: "150ms",
      description: "Fast instrument lock, crisp enough for repeated menu work.",
    },
    {
      id: "scan",
      name: "Scan Reveal",
      motion: "clip",
      duration: "210ms",
      description: "A top-down mask that feels like a reading head passing over rows.",
    },
    {
      id: "step",
      name: "Terminal Step",
      motion: "4 step",
      duration: "190ms",
      description: "Discrete frame reveal for a more pixel-native menu response.",
    },
    {
      id: "drift",
      name: "Signal Drift",
      motion: "x slide",
      duration: "230ms",
      description: "Subtle lateral acquisition, useful when the rail needs more spatial direction.",
    },
    {
      id: "prism",
      name: "Prism Offset",
      motion: "skew",
      duration: "220ms",
      description: "Small angular distortion with enough edge to feel sci-fi without wobble.",
    },
    {
      id: "depth",
      name: "Depth Gate",
      motion: "rotate-x",
      duration: "240ms",
      description: "A shallow hinged plane that keeps the menu precise and dimensional.",
    },
    {
      id: "cascade",
      name: "Cascade Index",
      motion: "stagger",
      duration: "250ms",
      description: "Delayed subgroup arrival for dense sections like component families.",
    },
    {
      id: "recoil",
      name: "Recoil Lock",
      motion: "overshoot",
      duration: "180ms",
      description: "A restrained impact frame for a slightly more responsive rail.",
    },
    {
      id: "ghost",
      name: "Ghost Compile",
      motion: "phase",
      duration: "260ms",
      description: "Soft phasing for a quieter documentation mode with a technical afterimage.",
    },
  ];

  function safeReadStorage() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return "";
    }
  }

  function safeWriteStorage(value) {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch (error) {
      return;
    }
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function getSelectedOption(id) {
    return options.find((option) => option.id === id) || options[0];
  }

  function applyMotion(root, id) {
    const shell = document.querySelector(".system-shell");
    const selected = getSelectedOption(id);
    if (shell) shell.dataset.navMotion = selected.id;
    root.querySelectorAll("[data-nav-motion-option]").forEach((button) => {
      const isSelected = button.dataset.navMotionOption === selected.id;
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    const readout = root.querySelector("[data-nav-motion-readout]");
    if (readout) {
      readout.textContent = `${selected.name} / ${selected.duration} / ${selected.motion}`;
    }
    safeWriteStorage(selected.id);
  }

  function getPreviewDuration() {
    const selected = getSelectedOption(safeReadStorage() || options[0].id);
    const value = Number.parseFloat(selected.duration);
    return Number.isFinite(value) ? value + 180 : 380;
  }

  function previewRailToggle() {
    const rail = document.querySelector("[data-system-left-nav]");
    if (!rail) return;
    const activeLink = rail.querySelector(".system-nav-link.is-active, .system-nav-leaf.is-active");
    const details = activeLink?.closest("details")
      || rail.querySelector(".system-nav-group[open]")
      || rail.querySelector(".system-nav-group");
    const summary = details?.querySelector("summary");
    if (!details || !summary) return;

    const wasOpen = details.open;
    summary.click();
    if (wasOpen) {
      window.setTimeout(() => {
        if (!details.open) summary.click();
      }, getPreviewDuration());
    }
  }

  function renderLab(root) {
    const header = createElement("div", "nav-motion-lab-head");
    const copy = createElement("div", "nav-motion-lab-copy");
    copy.appendChild(createElement("span", "token-name", "rail motion dev tool"));
    copy.appendChild(createElement("strong", "", "Left rail expand and close choreography"));
    copy.appendChild(createElement("p", "", "Ten subtle motion profiles for the left-hand menu and component sub-menu records. The selected profile applies to the real rail immediately."));
    header.appendChild(copy);

    const preview = createElement("button", "nav-motion-preview", "Preview toggle");
    preview.type = "button";
    preview.addEventListener("click", previewRailToggle);
    header.appendChild(preview);

    const optionsGrid = createElement("div", "nav-motion-options");
    options.forEach((option, index) => {
      const button = createElement("button", "nav-motion-option");
      button.type = "button";
      button.dataset.navMotionOption = option.id;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `${option.name}, ${option.duration}, ${option.motion}`);

      button.appendChild(createElement("span", "token-name", String(index + 1).padStart(2, "0")));
      button.appendChild(createElement("strong", "nav-motion-name", option.name));
      button.appendChild(createElement("p", "", option.description));

      const meta = createElement("span", "nav-motion-meta");
      meta.appendChild(createElement("span", "", option.duration));
      meta.appendChild(createElement("span", "", option.motion));
      button.appendChild(meta);

      button.addEventListener("click", () => applyMotion(root, option.id));
      optionsGrid.appendChild(button);
    });

    const readout = createElement("div", "nav-motion-readout");
    readout.dataset.navMotionReadout = "";

    root.replaceChildren(header, optionsGrid, readout);
    applyMotion(root, safeReadStorage() || options[0].id);
  }

  const root = document.querySelector("[data-nav-motion-lab]");
  if (root) renderLab(root);
})();
