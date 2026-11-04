// Theme Switcher (ported from static/js/theme.js)
(function () {
  const STORAGE_KEY = "theme";
  const root = document.documentElement;
  const defaultTheme = root.getAttribute("data-default-theme") || "dark";

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    if (defaultTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return defaultTheme;
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }

  applyTheme(getPreferredTheme());

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
        applyTheme(current === "dark" ? "light" : "dark");
      });
    });
  });
})();
