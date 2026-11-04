// Floating Action Dock (ported from static/js/dock.js)
document.addEventListener("DOMContentLoaded", function () {
  const dock = document.querySelector("[data-dock]");
  const toggle = document.querySelector("[data-dock-toggle]");
  if (!dock || !toggle) return;

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    dock.classList.toggle("dock--open");
  });

  document.addEventListener("click", function (e) {
    if (!dock.contains(e.target)) {
      dock.classList.remove("dock--open");
    }
  });
});
