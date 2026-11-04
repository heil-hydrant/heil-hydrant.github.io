// Mermaid Diagram Initializer for Zola (ported from static/js/mermaid.js)
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("pre code.language-mermaid, pre[data-lang='mermaid'] code").forEach(function (codeEl) {
    const pre = codeEl.parentElement;
    const wrapper = document.createElement("div");
    wrapper.className = "md-mermaid";
    const mermaidPre = document.createElement("pre");
    mermaidPre.className = "mermaid";
    mermaidPre.textContent = codeEl.textContent;
    wrapper.appendChild(mermaidPre);
    pre.replaceWith(wrapper);
  });

  if (window.mermaid && document.querySelector(".mermaid")) {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    window.mermaid.initialize({
      startOnLoad: true,
      theme: isDark ? "dark" : "default"
    });
  }
});
