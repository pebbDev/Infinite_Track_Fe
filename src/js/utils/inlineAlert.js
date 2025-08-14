export function showInlineAlert({
  type = "success",
  title = "",
  message = "",
  timeoutMs = 3000,
} = {}) {
  try {
    const container = document.getElementById("alert-container");
    if (!container) {
      console.warn("alert-container not found in DOM");
      return;
    }

    const templateId =
      {
        success: "alert-success-template",
        warning: "alert-warning-template",
        danger: "alert-error-template",
        error: "alert-error-template",
        info: "alert-info-template",
      }[type] || "alert-info-template";

    const templateWrapper = document.getElementById(templateId);
    if (!templateWrapper) {
      console.warn("alert template not found:", templateId);
      return;
    }

    // Clone template HTML
    const temp = document.createElement("div");
    temp.innerHTML = templateWrapper.innerHTML.trim();

    // The partials contain two alert blocks; use the first one as primary
    const alertEl = temp.firstElementChild?.cloneNode(true);
    if (!alertEl) return;

    // Set title and message if provided
    const titleEl = alertEl.querySelector("h4");
    const msgEl = alertEl.querySelector("p");
    if (titleEl && title) titleEl.textContent = title;
    if (msgEl && message) msgEl.textContent = message;

    // Optional: remove any link in template to avoid navigation
    const learnMore = alertEl.querySelector("a");
    if (learnMore) learnMore.remove();

    // Insert alert at top
    alertEl.classList.add("mb-4");
    container.prepend(alertEl);

    // Auto-dismiss after timeout
    if (timeoutMs > 0) {
      setTimeout(() => {
        try {
          alertEl.remove();
        } catch {}
      }, timeoutMs);
    }
  } catch (e) {
    console.error("showInlineAlert error:", e);
  }
}
