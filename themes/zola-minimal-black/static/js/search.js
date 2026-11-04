// Instant Search Modal for Zola (ported from static/js/search.js)
// Supports Zola's search_index.<lang>.json, search_index.json, and custom /index.json
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.querySelector("[data-search-overlay]");
  const input = document.querySelector("[data-search-input]");
  const resultsContainer = document.querySelector("[data-search-results]");
  const openBtns = document.querySelectorAll("[data-search-open]");
  const closeBtns = document.querySelectorAll("[data-search-close]");

  if (!overlay || !input || !resultsContainer) return;

  let pagesIndex = [];
  let loaded = false;

  async function loadSearchIndex() {
    if (loaded) return;
    const candidates = ["/index.json", "/search_index.en.json", "/search_index.json"];
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data)) {
          pagesIndex = data;
          loaded = true;
          return;
        }
        if (data && data.documentStore && data.documentStore.docs) {
          pagesIndex = Object.values(data.documentStore.docs).map(function (doc) {
            return {
              title: doc.title || "",
              permalink: doc.id || "#",
              summary: doc.description || (doc.body ? doc.body.slice(0, 160) : ""),
              content: doc.body || "",
              section: "page"
            };
          });
          loaded = true;
          return;
        }
      } catch (_) {}
    }
  }

  function openOverlay() {
    loadSearchIndex();
    overlay.classList.add("search-overlay--open");
    document.body.style.overflow = "hidden";
    setTimeout(function () { input.focus(); }, 50);
  }

  function closeOverlay() {
    overlay.classList.remove("search-overlay--open");
    document.body.style.overflow = "";
  }

  openBtns.forEach(function (btn) { btn.addEventListener("click", openOverlay); });
  closeBtns.forEach(function (btn) { btn.addEventListener("click", closeOverlay); });

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openOverlay();
    } else if (e.key === "Escape" && overlay.classList.contains("search-overlay--open")) {
      closeOverlay();
    }
  });

  function highlightText(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp("(" + escaped + ")", "gi"), '<mark class="search-highlight">$1</mark>');
  }

  input.addEventListener("input", function () {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      resultsContainer.innerHTML = "";
      return;
    }
    const matches = pagesIndex.filter(function (p) {
      return (
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.summary && p.summary.toLowerCase().includes(query)) ||
        (p.content && p.content.toLowerCase().includes(query))
      );
    }).slice(0, 20);

    if (matches.length === 0) {
      resultsContainer.innerHTML = '<div class="p-4 text-sm text-muted">No matching results found.</div>';
      return;
    }

    resultsContainer.innerHTML = matches.map(function (item) {
      const titleHtml = highlightText(item.title || "Untitled", query);
      const summaryHtml = highlightText(item.summary || "", query);
      return (
        '<a class="search-result-item" href="' + item.permalink + '">' +
          '<div class="font-medium text-sm">' + titleHtml + '</div>' +
          '<div class="text-xs text-muted mt-1">' + summaryHtml + '</div>' +
        '</a>'
      );
    }).join("");
  });
});
