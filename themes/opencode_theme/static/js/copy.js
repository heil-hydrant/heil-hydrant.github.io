;(function () {
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          var original = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(function () {
            btn.textContent = original;
          }, 1500);
        });
      }
    });
  });
})();
