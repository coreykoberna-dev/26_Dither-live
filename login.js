(function () {
  const $ = (selector, root = document) => root.querySelector(selector);

  const els = {
    form: $("#loginPageForm"),
    email: $("#loginPageEmail"),
    password: $("#loginPagePassword"),
    googleButton: $("#loginPageGoogleButton"),
    resetButton: $("#loginPageResetButton"),
    status: $("#loginPageStatus"),
  };

  function setStatus(message, state = "warning") {
    if (!els.status) return;
    els.status.textContent = message;
    els.status.dataset.state = state;
    els.status.classList.toggle("is-warning", state === "warning");
    els.status.classList.toggle("is-error", state === "error");
    els.status.classList.toggle("is-success", state === "success");
  }

  function disableCredentialFields() {
    [els.password, els.googleButton, els.resetButton].forEach((element) => {
      if (element) element.disabled = true;
    });
    if (els.password) {
      els.password.value = "";
      els.password.placeholder = "disabled in public preview";
    }
    setStatus("Account login is a preview shell until backend authentication is connected.");
  }

  els.form?.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus("No password is accepted or stored in the public static build.", "error");
  });

  disableCredentialFields();
  window.DitherIconSystem?.hydrate(document);
})();
