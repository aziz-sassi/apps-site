/* Counters for the code-drawn screens. Driven off one shared 9s clock so the
   numbers land exactly when the route finishes drawing — a count-up on its own
   timer drifts away from the CSS animation within a few loops. */
(function () {
  var LOOP = 9000, RISE = 0.55;   // matches msDraw/msWalk in screens.css
  var els = [].slice.call(document.querySelectorAll('.ms-count'));
  if (!els.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(function (el) { el.textContent = el.dataset.to; });
    return;
  }
  var t0 = performance.now();

  function fmt(el, p) {
    var to = el.dataset.to;
    if (el.dataset.kind === 'time') {
      var parts = to.split(':').map(Number);
      var total = Math.round((parts[0] * 60 + parts[1]) * p);
      return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
    }
    var n = parseFloat(to);
    var dec = (to.split('.')[1] || '').length;
    return (n * p).toFixed(dec);
  }

  function frame(now) {
    var p = Math.min(1, ((now - t0) % LOOP) / (LOOP * RISE));
    // ease-out so the numbers decelerate into place with the route
    var e = 1 - Math.pow(1 - p, 2.2);
    els.forEach(function (el) { el.textContent = fmt(el, e); });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
