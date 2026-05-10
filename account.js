(function () {
  const EXPORT_LIMIT = 5;
  const EXPORT_COUNT_KEY = "ditherWizardExportCount";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const els = {
    heroPlan: $("#accountHeroPlan"),
    heroExports: $("#accountHeroExports"),
    navLinks: $$("[data-account-nav]"),
    accountUserReadout: $("#accountUserReadout"),
    emailReadout: $("#accountEmailReadout"),
    exportCount: $("#accountExportCount"),
    exportFill: $("#accountExportMeterFill"),
    exportRemaining: $("#accountExportRemaining"),
    checkoutForm: $("#checkoutForm"),
    checkoutStatus: $("#checkoutStatus"),
    subscriptionChip: $("#subscriptionStateChip"),
    accountStatus: $("#accountStatus"),
    manageName: $("#manageName"),
    manageEmail: $("#manageEmail"),
  };

  function readExportCount() {
    try {
      const value = Number(localStorage.getItem(EXPORT_COUNT_KEY));
      return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    } catch {
      return 0;
    }
  }

  function setStatus(element, message, state = "warning") {
    if (!element) return;
    element.textContent = message;
    element.dataset.state = state;
    element.classList.toggle("is-warning", state === "warning");
    element.classList.toggle("is-success", state === "success");
    element.classList.toggle("is-error", state === "error");
  }

  function syncMeter() {
    const count = readExportCount();
    const used = Math.min(count, EXPORT_LIMIT);
    const remaining = Math.max(0, EXPORT_LIMIT - count);
    const meter = `${used} / ${EXPORT_LIMIT}`;
    const percent = Math.min(100, (used / EXPORT_LIMIT) * 100);

    if (els.heroPlan) els.heroPlan.textContent = "Preview";
    if (els.heroExports) els.heroExports.textContent = meter;
    if (els.exportCount) els.exportCount.textContent = meter;
    if (els.exportFill) els.exportFill.style.width = `${percent}%`;
    if (els.exportRemaining) {
      els.exportRemaining.textContent = remaining
        ? `${remaining} preview ${remaining === 1 ? "export" : "exports"} remain in this browser meter.`
        : "Preview meter reached in this browser. Exports remain available.";
    }
  }

  function disableAccountActions() {
    els.checkoutForm?.querySelectorAll("input, button").forEach((element) => {
      element.disabled = true;
    });
    $$("#cardPaymentFields input, #paypalPaymentFields input").forEach((element) => {
      element.value = "";
      element.placeholder = "disabled in public preview";
    });
    if (els.subscriptionChip) {
      els.subscriptionChip.textContent = "Preview";
      els.subscriptionChip.classList.add("is-warning");
    }
    if (els.accountUserReadout) els.accountUserReadout.textContent = "Preview only";
    if (els.emailReadout) els.emailReadout.textContent = "No account data is collected.";
    if (els.manageName) els.manageName.textContent = "Preview";
    if (els.manageEmail) els.manageEmail.textContent = "Backend auth not connected";
    setStatus(els.checkoutStatus, "Payments are disabled in the public static build.");
    setStatus(els.accountStatus, "Account management is a preview shell until backend services are connected.");
  }

  function syncSection() {
    const requested = (window.location.hash || "#checkout").slice(1);
    const active = requested === "manage" ? "manage" : "checkout";
    document.body.dataset.accountSection = active;
    els.navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.accountNav === active);
    });
  }

  els.checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus(els.checkoutStatus, "No payment information is accepted in the public static build.", "error");
  });

  window.addEventListener("hashchange", syncSection);
  syncMeter();
  disableAccountActions();
  syncSection();
  window.DitherIconSystem?.hydrate(document);
})();
