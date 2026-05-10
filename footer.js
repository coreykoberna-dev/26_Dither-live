const BUG_REPORT_EMAIL = "support@ditherwizard.ai";
const BUG_REPORT_CATEGORIES = [
  "Rendering output",
  "Upload or import",
  "Export or download",
  "Access or pricing",
  "Performance",
  "Interface polish",
  "Other issue",
];

function getSiteFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
}

function getSiteFullscreenTarget() {
  return document.querySelector(".app-shell, .system-shell") || document.documentElement;
}

function setFullscreenButtonState(button, target) {
  const active = getSiteFullscreenElement() === target;
  const icon = button.querySelector("[data-pixel-icon]");
  target.classList.toggle("is-fullscreen", active);
  button.classList.toggle("is-active", active);
  button.setAttribute("aria-pressed", String(active));
  button.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
  button.title = active ? "Exit fullscreen" : "Enter fullscreen";
  if (icon) {
    icon.dataset.pixelIcon = active ? "Frame" : "Scale";
    window.DitherIconSystem?.hydrate(icon);
  }
}

function handleSiteFullscreenChange(button, target) {
  setFullscreenButtonState(button, target);
  window.dispatchEvent(new Event("resize"));
}

async function toggleSiteFullscreen(button, target) {
  const active = getSiteFullscreenElement() === target;
  let blocked = false;
  try {
    if (active) {
      const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      await exitFullscreen.call(document);
      return;
    }

    const requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
    await requestFullscreen.call(target);
  } catch {
    blocked = true;
  } finally {
    setFullscreenButtonState(button, target);
    if (blocked) button.title = "Fullscreen blocked by browser";
  }
}

function buildBugReportOverlayMarkup() {
  const options = BUG_REPORT_CATEGORIES.map((category, index) => `
                    <button class="bug-category-option" type="button" role="option" aria-selected="${index === 0 ? "true" : "false"}" data-bug-category-option data-value="${category}">
                      <span class="bug-category-option-code">${String(index + 1).padStart(2, "0")}</span>
                      <span data-bug-category-option-label>${category}</span>
                    </button>
  `).join("");

  return `
    <div class="bug-report-overlay" id="bugReportOverlay" role="dialog" aria-modal="true" aria-labelledby="bugReportTitle" aria-describedby="bugReportRoute" hidden>
      <div class="bug-report-scrim" data-bug-report-close aria-hidden="true"></div>
      <section class="bug-report-panel" role="document">
        <div class="bug-report-head">
          <div>
            <span class="bug-report-kicker">support / bug intake</span>
            <h2 id="bugReportTitle">File Bug</h2>
          </div>
          <button class="bug-report-close icon-button" type="button" aria-label="Close bug report" data-bug-report-close>
            <span class="pixel-icon-slot" data-pixel-icon="Close" aria-hidden="true"></span>
          </button>
        </div>
        <p class="bug-report-route" id="bugReportRoute">support@ditherwizard.ai</p>
        <form class="bug-report-form" id="bugReportForm">
          <label class="field-group">
            <span class="field-label">Name</span>
            <input class="text-input" name="name" type="text" autocomplete="name" placeholder="your name" />
          </label>
          <label class="field-group">
            <span class="field-label">Email</span>
            <input class="text-input" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
          </label>
          <div class="field-group bug-category-field">
            <span class="field-label">Category</span>
            <div class="bug-category-select" data-bug-category-select data-state="closed">
              <input type="hidden" name="category" value="${BUG_REPORT_CATEGORIES[0]}" data-bug-category-value />
              <button class="bug-category-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="bugCategoryList" data-bug-category-trigger>
                <span data-bug-category-label>${BUG_REPORT_CATEGORIES[0]}</span>
                <span class="bug-category-trigger-icon pixel-icon-slot" data-pixel-icon="Chevron Down" aria-hidden="true"></span>
              </button>
              <div class="bug-category-menu" id="bugCategoryList" role="listbox" aria-label="Bug category" data-bug-category-menu hidden>
${options}
              </div>
            </div>
          </div>
          <label class="field-group bug-report-summary-field">
            <span class="field-label">Summary</span>
            <input class="text-input" name="summary" type="text" maxlength="120" placeholder="short title" required />
          </label>
          <label class="field-group bug-report-detail-field">
            <span class="field-label">Details</span>
            <textarea class="text-input bug-report-details" name="details" rows="7" placeholder="what happened" required></textarea>
          </label>
          <div class="bug-report-actions">
            <span class="bug-report-status" id="bugReportStatus" data-state="ready" role="status">ready</span>
            <button class="bug-report-submit" type="submit">
              <span class="pixel-icon-slot" data-pixel-icon="Mail" aria-hidden="true"></span>
              <span>File Ticket</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function ensureBugReportOverlay() {
  let overlay = document.getElementById("bugReportOverlay");
  if (overlay) return overlay;

  const host = getSiteFullscreenTarget();
  host.insertAdjacentHTML("beforeend", buildBugReportOverlayMarkup());
  overlay = document.getElementById("bugReportOverlay");
  if (overlay) window.DitherIconSystem?.hydrate(overlay);
  return overlay;
}

function fieldText(formData, name) {
  return String(formData.get(name) || "").trim();
}

function bugReportMailtoUrl(formData) {
  const category = fieldText(formData, "category") || BUG_REPORT_CATEGORIES[0];
  const summary = fieldText(formData, "summary");
  const details = fieldText(formData, "details");
  const name = fieldText(formData, "name") || "Not provided";
  const email = fieldText(formData, "email") || "Not provided";
  const subjectSummary = summary.replace(/\s+/g, " ").slice(0, 80);
  const subject = subjectSummary ? `Dither Wizard bug: ${subjectSummary}` : `Dither Wizard bug: ${category}`;
  const body = [
    `Category: ${category}`,
    `Page: ${window.location.href}`,
    `Reporter: ${name}`,
    `Reply Email: ${email}`,
    "",
    "Summary:",
    summary || "Not provided",
    "",
    "Details:",
    details || "Not provided",
    "",
    `User Agent: ${navigator.userAgent || "Not available"}`,
  ].join("\n");

  return `mailto:${BUG_REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function setBugReportContentInert(active) {
  document.querySelectorAll(".topbar, main, .site-footer").forEach((element) => {
    if (element.closest("#bugReportOverlay")) return;
    if (active) {
      element.dataset.bugReportInert = "true";
      element.inert = true;
    } else if (element.dataset.bugReportInert === "true") {
      element.inert = false;
      delete element.dataset.bugReportInert;
    }
  });
}

function initBugCategorySelect(overlay) {
  const categorySelect = overlay.querySelector("[data-bug-category-select]");
  if (!categorySelect || categorySelect.dataset.bugCategoryBound === "true") {
    return { close: () => false, isOpen: () => false };
  }

  const trigger = categorySelect.querySelector("[data-bug-category-trigger]");
  const label = categorySelect.querySelector("[data-bug-category-label]");
  const valueInput = categorySelect.querySelector("[data-bug-category-value]");
  const menu = categorySelect.querySelector("[data-bug-category-menu]");
  const options = Array.from(categorySelect.querySelectorAll("[data-bug-category-option]"));
  if (!trigger || !label || !valueInput || !menu || !options.length) {
    return { close: () => false, isOpen: () => false };
  }

  categorySelect.dataset.bugCategoryBound = "true";
  let activeIndex = Math.max(0, options.findIndex((option) => option.dataset.value === valueInput.value));

  function optionValue(option) {
    return option.dataset.value || option.textContent.trim();
  }

  function optionLabel(option) {
    return option.querySelector("[data-bug-category-option-label]")?.textContent.trim() || optionValue(option);
  }

  function setOpen(isOpen, focusActive = false) {
    categorySelect.dataset.state = isOpen ? "open" : "closed";
    trigger.setAttribute("aria-expanded", String(isOpen));
    menu.hidden = !isOpen;
    if (isOpen && focusActive) options[activeIndex]?.focus({ preventScroll: true });
  }

  function focusOption(index) {
    activeIndex = (index + options.length) % options.length;
    options[activeIndex].focus({ preventScroll: true });
  }

  function selectOption(option, focusTrigger = true) {
    activeIndex = options.indexOf(option);
    valueInput.value = optionValue(option);
    label.textContent = optionLabel(option);
    options.forEach((item) => item.setAttribute("aria-selected", String(item === option)));
    setOpen(false);
    if (focusTrigger) trigger.focus({ preventScroll: true });
  }

  options.forEach((option, index) => {
    option.tabIndex = -1;
    option.addEventListener("click", () => selectOption(option));
    option.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        focusOption(index + 1);
      } else if (event.key === "ArrowUp") {
        focusOption(index - 1);
      } else if (event.key === "Home") {
        focusOption(0);
      } else if (event.key === "End") {
        focusOption(options.length - 1);
      } else if (event.key === "Enter" || event.key === " ") {
        selectOption(option);
      } else if (event.key === "Escape") {
        setOpen(false);
        trigger.focus({ preventScroll: true });
      } else {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    });
  });

  trigger.addEventListener("click", () => setOpen(menu.hidden, true));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      setOpen(true, true);
    } else if (event.key === "ArrowUp") {
      setOpen(true, false);
      focusOption(options.length - 1);
    } else {
      return;
    }
    event.preventDefault();
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.target instanceof Node && !categorySelect.contains(event.target)) setOpen(false);
  });

  selectOption(options[activeIndex], false);

  return {
    close() {
      const wasOpen = categorySelect.dataset.state === "open";
      setOpen(false);
      return wasOpen;
    },
    isOpen() {
      return categorySelect.dataset.state === "open";
    },
  };
}

function visibleBugReportFocusable(overlay) {
  return Array.from(overlay.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter((element) => element instanceof HTMLElement && !element.hidden && element.offsetParent !== null);
}

function initBugReportOverlay() {
  const button = document.getElementById("bugReportToggle");
  if (!button) return;

  const overlay = ensureBugReportOverlay();
  if (!overlay || overlay.dataset.bugReportBound === "true") return;

  const form = overlay.querySelector("#bugReportForm");
  const status = overlay.querySelector("#bugReportStatus");
  const categoryApi = initBugCategorySelect(overlay);
  let restoreFocusTo = button;

  function setStatus(message, state = "ready") {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function openOverlay() {
    if (!overlay.hidden) return;
    restoreFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : button;
    overlay.hidden = false;
    document.body.classList.add("bug-report-open");
    button.setAttribute("aria-expanded", "true");
    setBugReportContentInert(true);
    window.requestAnimationFrame(() => {
      const firstField = overlay.querySelector("[name='summary']") || overlay.querySelector("input, textarea, button");
      firstField?.focus({ preventScroll: true });
    });
  }

  function closeOverlay(focusBack = true) {
    if (overlay.hidden) return;
    categoryApi.close();
    overlay.hidden = true;
    document.body.classList.remove("bug-report-open");
    button.setAttribute("aria-expanded", "false");
    setBugReportContentInert(false);
    if (focusBack) (restoreFocusTo || button).focus?.({ preventScroll: true });
  }

  button.addEventListener("click", openOverlay);

  overlay.addEventListener("pointerdown", (event) => {
    const closeTrigger = event.target instanceof Element ? event.target.closest("[data-bug-report-close]") : null;
    if (!closeTrigger) return;
    event.preventDefault();
    closeOverlay();
  });

  overlay.addEventListener("keydown", (event) => {
    event.stopPropagation();

    if (event.key === "Escape") {
      if (categoryApi.isOpen()) categoryApi.close();
      else closeOverlay();
      event.preventDefault();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = visibleBugReportFocusable(overlay);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus({ preventScroll: true });
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus({ preventScroll: true });
      event.preventDefault();
    }
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      setStatus("ticket email opened", "sent");
      window.location.href = bugReportMailtoUrl(new FormData(form));
    });
  }

  overlay.dataset.bugReportBound = "true";
}

function initFullscreenToggle() {
  const button = document.getElementById("fullscreenToggle");
  if (!button) return;

  const target = getSiteFullscreenTarget();
  const requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
  const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;

  if (!requestFullscreen || !exitFullscreen) {
    button.disabled = true;
    button.setAttribute("aria-label", "Fullscreen unavailable");
    button.title = "Fullscreen unavailable";
    return;
  }

  button.addEventListener("click", () => toggleSiteFullscreen(button, target));
  document.addEventListener("fullscreenchange", () => handleSiteFullscreenChange(button, target));
  document.addEventListener("webkitfullscreenchange", () => handleSiteFullscreenChange(button, target));
  document.addEventListener("MSFullscreenChange", () => handleSiteFullscreenChange(button, target));
  setFullscreenButtonState(button, target);
}

function initCurrentYear() {
  const currentYear = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = currentYear;
    element.setAttribute("datetime", currentYear);
  });
}

initCurrentYear();
initFullscreenToggle();
initBugReportOverlay();
