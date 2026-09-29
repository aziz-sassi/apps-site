/* Scroll-driven motion.
   Everything is *scrubbed*: values are derived from scroll position each frame,
   so scrolling back rewinds exactly. One rAF-throttled listener drives it all. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- reveals (one-way, for page content) ---------- */
  var targets = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }
  requestAnimationFrame(function () {
    targets.forEach(function (t) {
      if (t.getBoundingClientRect().top < window.innerHeight * 0.92) t.classList.add('in');
    });
  });

  /* ---------- scrubbed effects ---------- */
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* Per-layer depth: bigger number = nearer the viewer = moves and grows more,
     which is what sells "descending through the clouds" rather than a flat pan. */
  var DEPTH = { c1: 0.38, c2: 0.82, c3: 0.52, c4: 0.20, c5: 0.66, c6: 0.95, c7: 0.30 };

  var bands = [].slice.call(document.querySelectorAll('.band')).map(function (b) {
    return {
      el: b,
      sky: b.querySelector('.sky'),
      clouds: [].slice.call(b.querySelectorAll('.cloud')).map(function (c, i) {
        var cls = (c.className.match(/\bc(\d)\b/) || [])[0] || 'c1';
        return { el: c, depth: DEPTH[cls] || 0.5, dir: i % 2 ? 1 : -1 };
      }),
    };
  });
  // .film uses the same scrub as .stage: progress through a tall section
  // drives which phrase is visible.
  var stages = [].slice.call(document.querySelectorAll('.stage, .film'));

  function frame() {
    var vh = window.innerHeight;

    for (var i = 0; i < bands.length; i++) {
      var b = bands[i];
      var r = b.el.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, r.height));
      b.el.style.setProperty('--hp', p.toFixed(4));

      for (var k = 0; k < b.clouds.length; k++) {
        var c = b.clouds[k], d = c.depth, st = c.el.style;
        st.setProperty('--cy', (p * r.height * d * 0.85).toFixed(1) + 'px');
        st.setProperty('--cx', (p * c.dir * d * 190).toFixed(1) + 'px');
        st.setProperty('--cs', (1 + p * d * 1.15).toFixed(3));
        st.setProperty('--co', clamp(1 - p * 1.35).toFixed(3));
      }
    }

    /* Ring: the first slice of the stage assembles it, the rest spins it. */
    for (var j = 0; j < stages.length; j++) {
      var s = stages[j];
      var sr = s.getBoundingClientRect();
      var sp = clamp(-sr.top / Math.max(1, sr.height - vh));
      s.style.setProperty('--p', sp.toFixed(4));
      s.style.setProperty('--a', clamp(sp / 0.16).toFixed(4));
      var ring = s.querySelector('.ring');
      if (ring) ring.style.setProperty('--rot', sp.toFixed(4));
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { frame(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  frame();
})();
