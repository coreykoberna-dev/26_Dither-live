(function () {
  const $ = (selector, root = document) => root.querySelector(selector);

  const els = {
    form: $("#signupForm"),
    password: $("#signupPassword"),
    confirm: $("#signupConfirm"),
    googleButton: $("#googleSignupButton"),
    status: $("#signupStatus"),
    chip: $("#signupStateChip"),
  };

  function setStatus(message, state = "warning") {
    if (els.status) {
      els.status.textContent = message;
      els.status.dataset.state = state;
      els.status.classList.toggle("is-warning", state === "warning");
      els.status.classList.toggle("is-error", state === "error");
      els.status.classList.toggle("is-success", state === "success");
    }
    if (els.chip) {
      els.chip.textContent = "Preview";
      els.chip.classList.add("is-warning");
      els.chip.classList.remove("is-success", "is-error");
    }
  }

  function disableCredentialFields() {
    [els.password, els.confirm, els.googleButton].forEach((element) => {
      if (element) element.disabled = true;
    });
    [els.password, els.confirm].forEach((element) => {
      if (!element) return;
      element.value = "";
      element.placeholder = "disabled in public preview";
      element.required = false;
    });
    setStatus("Account creation is a preview shell until backend authentication is connected.");
  }

  els.form?.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus("No account credentials are accepted or stored in the public static build.", "error");
  });

  disableCredentialFields();
  window.DitherIconSystem?.hydrate(document);
})();
