/* Motion for Editorial Pop. ~2 KB, no dependencies.
   Three behaviours only: reveal on scroll, scroll progress, magnetic buttons.
   All of them bail out under prefers-reduced-motion, and all of them are
   transform/opacity so they never trigger layout. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- scroll progress ------------------------------------------------- */
  var prog = document.querySelector('.prog');
  if (prog) {
    var ticking = false;
    var paint = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      prog.style.setProperty('--p', p.toFixed(2) + '%');
      ticking = false;
    };
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  /* --- reveal on scroll ------------------------------------------------- */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* --- magnetic buttons ------------------------------------------------- */
  /* The button leans toward the cursor by a capped fraction of the offset and
     springs back on leave. Pointer-only: a touch device never gets a hover
     state, so this would otherwise leave the button stuck off-centre. */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    [].slice.call(document.querySelectorAll('.btn')).forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        var cap = 9;
        b.style.transform = 'translate(' + (dx * cap).toFixed(2) + 'px,' + (dy * cap).toFixed(2) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* --- marquee: duplicate once so the -50% loop is seamless -------------- */
  var rail = document.querySelector('.rail-in');
  if (rail && !rail.dataset.doubled) {
    rail.innerHTML += rail.innerHTML;
    rail.dataset.doubled = '1';
  }
})();
