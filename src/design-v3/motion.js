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

/* --- scroll-driven showcase ---------------------------------------------
   The section is 420vh tall with a sticky 100vh child. Progress through the
   tall section picks which app is showing. One rAF-throttled scroll read; the
   page never has its scrolling speed altered. */
(function () {
  var sec = document.getElementById('showcase');
  var data = window.__APPS;
  if (!sec || !data || !data.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var bg = sec.querySelector('.showcase-bg');
  var nameEl = sec.querySelector('[data-sc-name]');
  var lineEl = sec.querySelector('[data-sc-line]');
  var numEl = sec.querySelector('[data-sc-n]');
  var dots = [].slice.call(sec.querySelectorAll('.showcase-dots i'));
  var imgs = [].slice.call(sec.querySelectorAll('.showcase-phone img'));
  var cur = -1, queued = false;

  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };

  function show(i) {
    if (i === cur) return;
    cur = i;
    var d = data[i];
    bg.style.setProperty('--sc-accent', d.accent);
    nameEl.textContent = d.name;
    lineEl.textContent = d.line;
    numEl.textContent = pad(i + 1) + ' — ' + pad(data.length);
    dots.forEach(function (el, n) { el.classList.toggle('on', n === i); });
    imgs.forEach(function (el, n) { el.classList.toggle('on', n === i); });
  }

  function read() {
    queued = false;
    var r = sec.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    if (span <= 0) return;
    // 0 at the moment the section pins, 1 as it unpins
    var p = Math.min(1, Math.max(0, -r.top / span));
    show(Math.min(data.length - 1, Math.floor(p * data.length)));
  }

  addEventListener('scroll', function () {
    if (!queued) { queued = true; requestAnimationFrame(read); }
  }, { passive: true });
  addEventListener('resize', read, { passive: true });
  read();
})();
