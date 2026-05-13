(() => {
  const root = document.querySelector("[data-system-sizzle]");

  if (!root) {
    return;
  }

  const stage = root.querySelector("[data-sizzle-stage]");
  const caption = root.querySelector("[data-sizzle-caption]");

  if (!stage || !caption) {
    return;
  }

  const projectId = "whwOGlfJ5Rz2rHaEUgHl";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const statusBars = Array.from({ length: 10 }, (_, index) => {
    const opacity = (0.24 + (index % 4) * 0.12).toFixed(2);
    return `<span style="--bar:${index};--bar-opacity:${opacity}"></span>`;
  }).join("");
  const starField = Array.from({ length: 34 }, (_, index) => {
    const x = (index * 37) % 100;
    const y = (index * 61) % 100;
    const opacity = (0.18 + (index % 5) * 0.08).toFixed(2);
    const scale = 1 + (index % 3);
    return `<span style="--star:${index};--star-x:${x}%;--star-y:${y}%;--star-opacity:${opacity};--star-scale:${scale}"></span>`;
  }).join("");
  const orbitMarks = Array.from({ length: 18 }, (_, index) => `<span class="motion-orbit-mark" style="--mark-rotation:${index * 20}deg"></span>`).join("");
  const vectorOrbitSvg = `
    <svg class="motion-hero-vector-orbits" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" aria-hidden="true">
      <ellipse class="motion-vector-ellipse is-outer" cx="50" cy="50" rx="47" ry="45"></ellipse>
      <ellipse class="motion-vector-ellipse is-tilt" cx="50" cy="50" rx="45" ry="25" transform="rotate(-22 50 50)"></ellipse>
      <ellipse class="motion-vector-ellipse is-counter" cx="50" cy="50" rx="34" ry="34"></ellipse>
      <line class="motion-vector-axis" x1="50" y1="8" x2="50" y2="92"></line>
      <line class="motion-vector-axis" x1="6" y1="50" x2="94" y2="50"></line>
    </svg>
  `;

  const render = () => {
    root.dataset.sizzleMode = "vitruvian";
    root.dataset.sizzlePhase = "0";
    root.style.setProperty("--sizzle-phase-count", "1");
    root.classList.toggle("is-reduced-motion", prefersReducedMotion.matches);
    caption.textContent = "01 / Dither motion / Vitruvian geometry";
    stage.setAttribute("aria-label", "Dither motion Vitruvian Man hero");
    stage.innerHTML = `
      <article class="sizzle-reel motion-hero-reel" aria-label="Dither motion piece of the Vitruvian Man">
        <div class="motion-hero-stars" aria-hidden="true">${starField}</div>
        <div class="motion-unicorn-shell" aria-hidden="true">
          <div class="motion-unicorn-project" data-us-project="${projectId}"></div>
        </div>
        <div class="motion-hero-grid" aria-hidden="true"></div>
        <div class="motion-hero-orbit" aria-hidden="true">${vectorOrbitSvg}${orbitMarks}</div>
        <div class="motion-hero-frame" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
        <div class="motion-hero-readout" aria-hidden="true">
          <span>dyther.motion</span>
          <span>vitruvian field</span>
          <span>leonardo / 1490</span>
        </div>
        <div class="motion-hero-meter" aria-hidden="true">${statusBars}</div>
      </article>
    `;
  };

  const initUnicorn = () => {
    if (prefersReducedMotion.matches) {
      return;
    }

    const studio = window.UnicornStudio;

    if (!studio?.init || studio.isInitialized) {
      return;
    }

    studio.init();
    studio.isInitialized = true;
  };

  const loadUnicorn = () => {
    if (prefersReducedMotion.matches) {
      return;
    }

    if (window.UnicornStudio?.init) {
      initUnicorn();
      return;
    }

    let script = document.querySelector("script[data-unicorn-studio]");

    if (!script) {
      script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
      script.async = true;
      script.dataset.unicornStudio = "true";
      document.head.appendChild(script);
    }

    script.addEventListener("load", initUnicorn, { once: true });
  };

  prefersReducedMotion.addEventListener?.("change", () => {
    render();
    loadUnicorn();
  });

  render();
  loadUnicorn();
})();
