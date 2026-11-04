// Main UI Entry Point (TOC Toggle, Active Nav Highlighting & Copyright Year)
document.addEventListener("DOMContentLoaded", function () {
  const tocToggle = document.querySelector(".toc-toggle");
  const tocNav = document.querySelector(".toc-nav");
  if (tocToggle && tocNav) {
    tocToggle.addEventListener("click", function () {
      const isHidden = tocNav.style.display === "none";
      tocNav.style.display = isHidden ? "block" : "none";
    });
  }

  // Highlight active section links for nested child pages
  const currentPath = window.location.pathname;
  document.querySelectorAll(".site-nav__link, .dock-action[href]").forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href) return;
    try {
      const linkPath = new URL(href, window.location.origin).pathname;
      if (linkPath === currentPath || (linkPath !== "/" && currentPath.startsWith(linkPath))) {
        link.classList.add("is-active");
      }
    } catch (_) {}
  });

  // Update copyright year dynamically
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
});
