(function () {
  const LOGOTYPE_TEXTURE_SRC = "assets/video/dither-magic.mp4";
  const LOGOTYPE_TEXTURE_WIDTH = 229;
  const LOGOTYPE_TEXTURE_HEIGHT = 54;

  function currentPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith("design-system.html")) return "design-system";
    if (path.endsWith("contact.html")) return "contact";
    if (path.endsWith("mage-lab.html")) return "mage-lab";
    return "home";
  }

  function navLink(page, href, label) {
    const active = currentPage() === page;
    const state = active ? ' is-current" aria-current="page' : "";
    return `<a class="primary-nav-link${state}" href="${href}"><span class="primary-nav-label">${label}</span></a>`;
  }

  function renderSiteHeader() {
    const mount = document.querySelector("[data-site-header]");
    if (!mount) return;

    mount.outerHTML = `
      <header class="topbar">
        <a class="brand-lockup" href="index.html" aria-label="Dither Wizard home">
          <span class="brand-mark" aria-hidden="true">
            <span class="wizard-logo" data-wizard-hover-cast aria-hidden="true">
              <span class="wizard-vector-sprite" data-wizard-vector data-wizard-state="header" aria-hidden="true"></span>
            </span>
          </span>
          <div class="brand-identity">
            <h1 class="brand-logotype" id="brandLogotype" aria-label="Dither Wizard">
              <span class="brand-logotype-art" aria-hidden="true">
                <video class="brand-logotype-source" src="${LOGOTYPE_TEXTURE_SRC}" muted loop autoplay playsinline preload="auto"></video>
                <canvas class="brand-logotype-media" width="${LOGOTYPE_TEXTURE_WIDTH}" height="${LOGOTYPE_TEXTURE_HEIGHT}"></canvas>
              </span>
            </h1>
            <p>local signal processing studio</p>
          </div>
        </a>
        <div class="topbar-actions">
          <nav class="primary-nav" aria-label="Primary navigation">
            ${navLink("home", "index.html", "Home")}
            ${navLink("design-system", "design-system.html", "Wizardry")}
            ${navLink("contact", "contact.html", "Contact")}
          </nav>
          <div class="topbar-controls">
            <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to light mode" title="Switch theme">
              <span id="themeGlyph" data-pixel-icon="Sun" aria-hidden="true"></span>
            </button>
            <button class="fullscreen-toggle icon-button" id="fullscreenToggle" type="button" aria-label="Enter fullscreen" aria-pressed="false" title="Enter fullscreen">
              <span class="fullscreen-icon" data-pixel-icon="Scale" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  renderSiteHeader();
})();
