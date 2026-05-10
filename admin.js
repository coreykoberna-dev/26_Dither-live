(function () {
  const $ = (selector, root = document) => root.querySelector(selector);

  const els = {
    heroAccess: $("#adminHeroAccess"),
    adminForm: $("#adminLoginForm"),
    adminStatus: $("#adminStatus"),
    adminChip: $("#adminStateChip"),
    adminDashboard: $("#adminDashboard"),
  };

  function setStatus(message, state = "warning") {
    if (els.adminStatus) {
      els.adminStatus.textContent = message;
      els.adminStatus.dataset.state = state;
      els.adminStatus.classList.toggle("is-warning", state === "warning");
      els.adminStatus.classList.toggle("is-error", state === "error");
      els.adminStatus.classList.toggle("is-success", state === "success");
    }
    if (els.adminChip) {
      els.adminChip.textContent = "Disabled";
      els.adminChip.classList.add("is-warning");
      els.adminChip.classList.remove("is-success", "is-error");
    }
    if (els.heroAccess) els.heroAccess.textContent = "Disabled";
  }

  function disableAdminSurface() {
    els.adminForm?.querySelectorAll("input, button").forEach((element) => {
      element.disabled = true;
    });
    els.adminDashboard?.querySelectorAll("button").forEach((element) => {
      element.disabled = true;
    });
    els.adminDashboard?.classList.add("is-locked");
    setStatus("Admin operations are disabled in the public static build.");
  }

  els.adminForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus("Admin operations require a private backend, not client-side credentials.", "error");
  });

  disableAdminSurface();
  window.DitherIconSystem?.hydrate(document);
})();
