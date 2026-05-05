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

initFullscreenToggle();
