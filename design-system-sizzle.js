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

  const ditherPixels = Array.from({ length: 70 }, (_, index) => {
    const delay = (index * 73) % 1200;
    return `<span style="--d:${delay}ms"></span>`;
  }).join("");

  const tickMarks = Array.from({ length: 24 }, () => "<span></span>").join("");
  const spectrumCells = Array.from({ length: 18 }, () => "<span></span>").join("");
  const gridColumns = Array.from({ length: 12 }, () => "<span></span>").join("");
  const roleCells = ["primary", "surface", "line", "error", "warn", "info", "success", "focus"]
    .map((label) => `<span>${label}</span>`)
    .join("");
  const typeRows = ["display", "headline", "label", "body", "data"]
    .map((label) => `<span>${label}</span>`)
    .join("");
  const stateCells = ["default", "hover", "focus", "error", "locked"]
    .map((label) => `<span>${label}</span>`)
    .join("");

  const mapGrid = `
    <div class="sizzle-background-field" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <div class="sizzle-map-grid" aria-hidden="true"></div>
    <div class="sizzle-system-layer" aria-hidden="true">
      <div class="sizzle-column-field">${gridColumns}</div>
      <div class="sizzle-role-map">${roleCells}</div>
      <div class="sizzle-type-map">${typeRows}</div>
      <div class="sizzle-state-map">${stateCells}</div>
    </div>
    <div class="sizzle-hero-index" aria-hidden="true">
      <span>tokens</span><span>states</span><span>motion</span>
    </div>
    <div class="sizzle-title-orbit" aria-hidden="true">
      <span></span><span></span><span></span><i></i><i></i>
    </div>
    <div class="sizzle-dither-field" aria-hidden="true">
      <div class="sizzle-dither-pixels">${ditherPixels}</div>
      <div class="sizzle-dither-readout"><span>bayer</span><span>diffuse</span></div>
    </div>
    <div class="sizzle-spectrum-ruler" aria-hidden="true">${spectrumCells}</div>
    <svg class="sizzle-handoff-map" viewBox="0 0 860 360" aria-hidden="true">
      <path class="is-soft" d="M22 282 C134 208 204 266 302 178 S506 82 832 52" />
      <path class="is-hot" d="M42 96 H196 L262 160 H446 L532 232 H818" />
      <path class="is-amber" d="M58 326 C188 300 240 224 336 238 S548 318 760 280" />
      <path class="is-magenta" d="M102 46 C184 118 240 68 318 120 S476 210 628 166 S742 102 820 148" />
      <circle cx="196" cy="96" r="5" />
      <circle cx="262" cy="160" r="5" />
      <circle cx="446" cy="160" r="5" />
      <circle cx="532" cy="232" r="5" />
      <circle cx="704" cy="142" r="5" />
    </svg>
    <div class="sizzle-axis-readout" aria-hidden="true">
      <span>roles</span><span>parts</span><span>states</span>
    </div>
  `;

  const modes = [
    {
      id: "foundations",
      title: "Token Reactor",
      phases: ["palette roles", "type specimen", "state stack", "motion curve"],
      html: `
        <article class="sizzle-reel sizzle-option sizzle-atlas" aria-label="Token Reactor sizzle option">
          ${mapGrid}
          <div class="sizzle-option-identity" aria-hidden="true"><span>01</span><b>token reactor</b></div>
          <div class="sizzle-palette-core" aria-hidden="true">
            <span>primary</span><span>secondary</span><span>tertiary</span><span>surface</span><span>outline</span><span>warning</span><span>error</span><span>success</span>
          </div>
          <div class="sizzle-type-tower" aria-hidden="true"><span>DISPLAY</span><span>LABEL</span><span>BODY</span><span>DATA</span></div>
          <div class="sizzle-motion-rings" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="sizzle-compass" aria-hidden="true"><span></span><i></i><i></i></div>
          <div class="sizzle-tick-strip" aria-hidden="true">${tickMarks}</div>
          <div class="sizzle-dither-sample" aria-hidden="true">
            <span>threshold</span><i></i><i></i><i></i><i></i>
          </div>
          <section class="sizzle-map-panel sizzle-frame" data-phase="0" aria-hidden="true">
            <b>color roles</b>
            <div class="sizzle-token-stack"><span></span><span></span><span></span><span></span><span></span></div>
            <em>primary / secondary / tertiary / warning / error</em>
          </section>
          <section class="sizzle-map-panel sizzle-frame" data-phase="1" aria-hidden="true">
            <b>type roles</b>
            <div class="sizzle-route-board"><span>display</span><span>label</span><span>body</span><span>data</span></div>
            <em>GT Standard Mono roles with fixed product sizing</em>
          </section>
          <section class="sizzle-map-panel sizzle-frame" data-phase="2" aria-hidden="true">
            <b>state matrix</b>
            <div class="sizzle-state-grid"><span>hover</span><span>focus</span><span>loading</span><span>error</span></div>
            <em>shared states required for every interactive component</em>
          </section>
          <section class="sizzle-map-panel sizzle-frame" data-phase="3" aria-hidden="true">
            <b>motion tokens</b>
            <svg class="sizzle-mini-curve" viewBox="0 0 160 74"><path d="M8 58 C34 58 42 12 78 12 S118 58 152 16" /></svg>
            <em>80 / 100 / 135 / 210 / 320ms state motion</em>
          </section>
          <div class="sizzle-coordinate-strip" aria-hidden="true"><span>DS-01</span><span>12COL</span><span>OKLCH</span><span>AA</span></div>
        </article>
      `,
    },
    {
      id: "components",
      title: "Component Sequencer",
      phases: ["button states", "text inputs", "data table", "doc rail"],
      html: `
        <article class="sizzle-reel sizzle-option sizzle-cartography" aria-label="Component Sequencer sizzle option">
          ${mapGrid}
          <div class="sizzle-option-identity" aria-hidden="true"><span>02</span><b>component sequencer</b></div>
          <div class="sizzle-component-sequencer" aria-hidden="true">
            <section><b>Button</b><span></span><span class="is-hot"></span><span></span></section>
            <section><b>Text field</b><i></i><i></i></section>
            <section><b>Data table</b><em></em><em></em><em></em><em></em></section>
            <section><b>Doc rail</b><small></small><small class="is-open"></small><small></small></section>
          </div>
          <div class="sizzle-component-orbit" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="sizzle-blueprint-stack" aria-hidden="true">
            <span>hover</span><span>focus</span><span>active</span><span>disabled</span>
          </div>
          <section class="sizzle-component-sheet sizzle-frame" data-phase="0" aria-hidden="true">
            <b>button component</b>
            <div class="sizzle-button-line"><span>secondary</span><span>primary</span><span>disabled</span></div>
            <em>default / hover / focus / pressed / loading</em>
          </section>
          <section class="sizzle-component-sheet sizzle-frame" data-phase="1" aria-hidden="true">
            <b>text input family</b>
            <label><span>email field</span><i></i></label>
            <label><span>password field</span><i></i></label>
          </section>
          <section class="sizzle-component-sheet sizzle-frame" data-phase="2" aria-hidden="true">
            <b>data table specimen</b>
            <div class="sizzle-table-map"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
            <em>invoice ledger / sessions / plan comparison</em>
          </section>
          <section class="sizzle-component-sheet sizzle-frame" data-phase="3" aria-hidden="true">
            <b>documentation rail</b>
            <div class="sizzle-nav-fold"><span></span><span class="is-open"></span><span></span><span></span></div>
            <em>Bare Index nesting and accordion disclosure</em>
          </section>
        </article>
      `,
    },
    {
      id: "commerce",
      title: "Commerce Flow",
      phases: ["sign-in form", "account settings", "store product card", "billing recovery"],
      html: `
        <article class="sizzle-reel sizzle-option sizzle-commerce-map" aria-label="Commerce Flow sizzle option">
          ${mapGrid}
          <div class="sizzle-option-identity" aria-hidden="true"><span>03</span><b>commerce flow</b></div>
          <div class="sizzle-commerce-flow" aria-hidden="true">
            <span>sign in</span><span>account</span><span>store</span><span>checkout</span><span>recovery</span>
          </div>
          <div class="sizzle-plan-plate" aria-hidden="true"><b>Dither Wizard Pro</b><span>$38</span><i></i><i></i></div>
          <div class="sizzle-payment-thread" aria-hidden="true">
            <span>auth</span><span>plan</span><span>cart</span><span>receipt</span><span>retry</span>
          </div>
          <section class="sizzle-commerce-node sizzle-frame" data-phase="0" aria-hidden="true">
            <b>sign-in form</b>
            <label><span>email</span><i></i></label>
            <div class="sizzle-code-row"><span></span><span></span><span></span><span></span><span></span><span></span></div>
            <em>password / passkey / one-time code states</em>
          </section>
          <section class="sizzle-commerce-node sizzle-frame" data-phase="1" aria-hidden="true">
            <b>account settings</b>
            <div class="sizzle-product-shelf"><span>profile</span><span>security</span><span>seats</span></div>
            <em>subscription, team, entitlement, notification rows</em>
          </section>
          <section class="sizzle-commerce-node sizzle-frame" data-phase="2" aria-hidden="true">
            <b>store product card</b>
            <div class="sizzle-checkout-steps"><span></span><span></span><span></span></div>
            <em>plan selector, order summary, discount code</em>
          </section>
          <section class="sizzle-commerce-node sizzle-frame" data-phase="3" aria-hidden="true">
            <b>payment recovery</b>
            <div class="sizzle-billing-rows"><span>failed</span><span>retry</span><span>receipt</span></div>
            <em>payment method, invoice list, cancellation path</em>
          </section>
          <div class="sizzle-merchant-rail" aria-hidden="true"><span>auth</span><span>cart</span><span>tax</span><span>receipt</span></div>
        </article>
      `,
    },
    {
      id: "workbench",
      title: "Workbench Signal",
      phases: ["dropzone", "preview canvas", "timeline transport", "export meter"],
      html: `
        <article class="sizzle-reel sizzle-option sizzle-workbench-map" aria-label="Workbench Signal sizzle option">
          ${mapGrid}
          <div class="sizzle-option-identity" aria-hidden="true"><span>04</span><b>workbench signal</b></div>
          <div class="sizzle-signal-stack" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
          <section class="sizzle-workbench-frame" aria-hidden="true">
            <div class="sizzle-pane-left"><b>dropzone</b><i></i><i></i><i></i></div>
            <div class="sizzle-pane-center"><div class="sizzle-signal-preview"></div><span></span></div>
            <div class="sizzle-pane-right"><b>effects</b><i></i><i></i><i></i><i></i></div>
            <div class="sizzle-pane-timeline"><span></span><span></span><span></span><span></span><span></span></div>
          </section>
          <div class="sizzle-workbench-callout sizzle-frame" data-phase="0" aria-hidden="true"><b>file dropzone</b><span>upload, sample reset, batch queue row</span></div>
          <div class="sizzle-workbench-callout sizzle-frame" data-phase="1" aria-hidden="true"><b>preview canvas</b><span>live processed output as primary object</span></div>
          <div class="sizzle-workbench-callout sizzle-frame" data-phase="2" aria-hidden="true"><b>timeline transport</b><span>frame state, scrubber, motion dither</span></div>
          <div class="sizzle-workbench-callout sizzle-frame" data-phase="3" aria-hidden="true"><b>export meter</b><span>format, bytes, dimensions, compression</span></div>
        </article>
      `,
    },
    {
      id: "governance",
      title: "Governance Radar",
      phases: ["source files", "access gates", "qa gates", "handoff"],
      html: `
        <article class="sizzle-reel sizzle-option sizzle-governance-map" aria-label="Governance Radar sizzle option">
          ${mapGrid}
          <div class="sizzle-option-identity" aria-hidden="true"><span>05</span><b>governance radar</b></div>
          <div class="sizzle-radar-field" aria-hidden="true"><span></span><span></span><span></span><i></i></div>
          <div class="sizzle-system-spine" aria-hidden="true">
            <span>design.md</span><span>tokens</span><span>css</span><span>html</span>
          </div>
          <div class="sizzle-verification-grid" aria-hidden="true">
            <span>contrast</span><span>keyboard</span><span>tokens</span><span>motion</span>
          </div>
          <section class="sizzle-governance-card sizzle-frame" data-phase="0" aria-hidden="true">
            <b>source sync</b>
            <div><span>DESIGN</span><span>JSON</span><span>CSS</span></div>
            <em>DESIGN.md / DESIGN_SYSTEM.md / design-tokens.json</em>
          </section>
          <section class="sizzle-governance-card sizzle-frame" data-phase="1" aria-hidden="true">
            <b>access gates</b>
            <div><span>contrast</span><span>focus</span><span>motion</span></div>
            <em>WCAG AA, keyboard, reduced motion</em>
          </section>
          <section class="sizzle-governance-card sizzle-frame" data-phase="2" aria-hidden="true">
            <b>qa gates</b>
            <div><span>visual</span><span>state</span><span>tokens</span></div>
            <em>syntax, state coverage, visual regression path</em>
          </section>
          <section class="sizzle-governance-card sizzle-frame" data-phase="3" aria-hidden="true">
            <b>build handoff</b>
            <div><span>auth</span><span>store</span><span>editor</span></div>
            <em>ready for product pages</em>
          </section>
        </article>
      `,
    },
  ];

  const progress = document.createElement("div");
  progress.className = "sizzle-progress";
  progress.setAttribute("aria-hidden", "true");

  root.append(progress);

  let modeIndex = 0;
  let phaseIndex = 0;
  let intervalId = null;
  let renderTicket = 0;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const syncProgress = (mode) => {
    const count = mode.phases.length;

    if (progress.children.length === count) {
      return;
    }

    progress.replaceChildren(...Array.from({ length: count }, () => document.createElement("span")));
  };

  const setPhase = (nextPhase) => {
    const mode = modes[modeIndex];
    phaseIndex = (nextPhase + mode.phases.length) % mode.phases.length;
    root.dataset.sizzlePhase = String(phaseIndex);
    caption.textContent = `${String(modeIndex + 1).padStart(2, "0")} / ${mode.title} / ${mode.phases[phaseIndex]}`;

    progress.querySelectorAll("span").forEach((bar, barIndex) => {
      bar.classList.toggle("is-active", barIndex === phaseIndex);
      bar.classList.toggle("is-past", barIndex < phaseIndex);
    });
  };

  const renderMode = (nextMode, resetPhase = true) => {
    const ticket = ++renderTicket;
    const mode = modes[nextMode];
    modeIndex = nextMode;
    phaseIndex = resetPhase ? 0 : phaseIndex % mode.phases.length;
    root.dataset.sizzleMode = mode.id;
    root.style.setProperty("--sizzle-phase-count", String(mode.phases.length));
    syncProgress(mode);
    stage.classList.add("is-transitioning");

    window.setTimeout(() => {
      if (ticket !== renderTicket) {
        return;
      }

      stage.innerHTML = mode.html;
      stage.setAttribute("aria-label", `${mode.title}: ${mode.phases.join(", ")}`);
      stage.classList.remove("is-transitioning");
      setPhase(phaseIndex);
    }, 140);
  };

  const stop = () => {
    if (!intervalId) {
      return;
    }

    window.clearInterval(intervalId);
    intervalId = null;
  };

  const start = () => {
    if (prefersReducedMotion || intervalId) {
      return;
    }

    intervalId = window.setInterval(() => {
      const mode = modes[modeIndex];

      if (phaseIndex >= mode.phases.length - 1) {
        renderMode((modeIndex + 1) % modes.length);
        return;
      }

      setPhase(phaseIndex + 1);
    }, 3400);
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
      return;
    }

    start();
  });

  renderMode(0);
  start();
})();
