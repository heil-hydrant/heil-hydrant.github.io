// Scroll-reveal: adds [data-shown] to [data-reveal] elements when visible
;(function () {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback: show everything immediately
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.setAttribute('data-shown', '');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-shown', '');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    observer.observe(el);
  });
})();
