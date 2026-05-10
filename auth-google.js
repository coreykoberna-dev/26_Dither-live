(function () {
  const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

  function getClientId() {
    const metaClientId = document.querySelector('meta[name="google-signin-client_id"]')?.content;
    return String(metaClientId || window.DITHER_GOOGLE_CLIENT_ID || localStorage.getItem("ditherWizardGoogleClientId") || "").trim();
  }

  function configMessage() {
    return "Google sign-in needs a Google OAuth web client ID before it can open the Google account chooser.";
  }

  function loadScript() {
    if (window.google?.accounts?.id) return Promise.resolve();

    const existingScript = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existingScript) {
      return new Promise((resolve, reject) => {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.append(script);
    });
  }

  function decodeBase64Url(value) {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binary = window.atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function profileFromCredential(response) {
    if (!response?.credential) throw new Error("missing_google_credential");
    const [, payload] = response.credential.split(".");
    if (!payload) throw new Error("invalid_google_credential");
    const claims = JSON.parse(decodeBase64Url(payload));
    return {
      email: claims.email || "",
      emailVerified: Boolean(claims.email_verified),
      googleSubject: claims.sub || "",
      name: claims.name || claims.given_name || claims.email || "",
      picture: claims.picture || "",
      selectBy: response.select_by || "",
      credential: response.credential,
    };
  }

  async function start({ onCredential, onStatus } = {}) {
    const clientId = getClientId();
    if (!clientId) {
      onStatus?.(configMessage(), "warning");
      return { ok: false, reason: "missing_client_id" };
    }

    try {
      await loadScript();
      if (!window.google?.accounts?.id) throw new Error("google_identity_unavailable");

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback(response) {
          try {
            onCredential?.(profileFromCredential(response), response);
          } catch {
            onStatus?.("Google returned a credential we could not read. Try again or use email.", "error");
          }
        },
        ux_mode: "popup",
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed?.()) {
          onStatus?.("Google sign-in did not open. Check the OAuth client setup or use email.", "warning");
        } else if (notification.isSkippedMoment?.()) {
          onStatus?.("Google sign-in was skipped. Use email or try again.", "warning");
        } else if (notification.isDismissedMoment?.()) {
          onStatus?.("Google sign-in was closed.", "warning");
        }
      });

      return { ok: true };
    } catch {
      onStatus?.("Google sign-in could not load. Check your connection or use email.", "error");
      return { ok: false, reason: "load_failed" };
    }
  }

  async function renderButton({ container, onCredential, onStatus, text = "continue_with" } = {}) {
    const clientId = getClientId();
    if (!clientId || !container) return { ok: false, reason: "missing_client_id" };

    try {
      await loadScript();
      if (!window.google?.accounts?.id) throw new Error("google_identity_unavailable");

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback(response) {
          try {
            onCredential?.(profileFromCredential(response), response);
          } catch {
            onStatus?.("Google returned a credential we could not read. Try again or use email.", "error");
          }
        },
        ux_mode: "popup",
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      container.hidden = false;
      container.replaceChildren();
      const width = Math.max(220, Math.min(400, Math.round(container.getBoundingClientRect().width || 400)));
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text,
        logo_alignment: "left",
        width,
      });

      return { ok: true };
    } catch {
      onStatus?.("Google sign-in could not load. Check your connection or use email.", "error");
      return { ok: false, reason: "load_failed" };
    }
  }

  window.DitherGoogleAuth = {
    getClientId,
    renderButton,
    start,
  };
})();
