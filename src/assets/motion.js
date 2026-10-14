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

  /* --- ambient video: attach a source only when the section is close ------
     preload="none" plus no src means zero bytes on load. We add the source
     one viewport ahead, then fade in once it can actually play, so the poster
     never cuts to a blank frame. */
  var pending = [].slice.call(document.querySelectorAll('video.ambient'));
  var live = [];
  function syncVideos() {
    var ih = window.innerHeight, i, r;
    for (i = pending.length - 1; i >= 0; i--) {
      var v = pending[i];
      r = v.parentNode.getBoundingClientRect();
      if (r.top > ih * 1.5 || r.bottom < -ih * 0.5) continue;

      var canWebm = v.canPlayType && v.canPlayType('video/webm; codecs="vp9"');
      v.src = canWebm ? v.getAttribute('data-webm') : v.getAttribute('data-mp4');
      v.addEventListener('canplay', function () { this.classList.add('ready'); }, { once: true });
      pending.splice(i, 1);
      live.push(v);
    }
    /* Only what is actually on screen decodes. An off-screen loop burns battery
       for nothing, and a backgrounded tab refuses play() outright -- so this also
       doubles as the retry that starts them once the tab comes back. */
    for (i = 0; i < live.length; i++) {
      var w = live[i];
      r = w.parentNode.getBoundingClientRect();
      var visible = !document.hidden && r.top < ih && r.bottom > 0;
      if (visible && w.paused) {
        var play = w.play();
        if (play && play.catch) play.catch(function () { /* autoplay refused: poster stays */ });
      } else if (!visible && !w.paused) {
        w.pause();
      }
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { frame(); syncVideos(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('visibilitychange', syncVideos);
  frame();
  syncVideos();
})();

  /* ---------- hero wordmark: MADE. folds into the eyebrow pill ----------
     Same closed-form springs as the launch film, so the motion matches frame
     for frame. Every value is a pure function of elapsed time: no state, no
     chained transitions, nothing to drift if a frame is dropped.            */
  (function () {
    var line = document.querySelector('.markline[data-mark]');
    if (!line) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      line.classList.add('mark-done'); return;
    }
    var word = line.querySelector('.mark-word');
    var pill = line.querySelector('.eyebrow');
    var gl = [].slice.call(word.querySelectorAll('i'));
    if (!gl.length) { line.classList.add('mark-done'); return; }

    function springStep(x, f, z) {
      if (x <= 0) return 0;
      var w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + (z * w / wd) * Math.sin(wd * x));
    }
    var cl = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
    var ease = function (t, a, d) { var x = cl((t - a) / d); return x * x * (3 - 2 * x); };
    var lerp = function (a, b, u) { return a + (b - a) * u; };

    var M = null;
    function measure() {
      // each glyph's own width at both ends of the width axis
      var probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;' +
        "font-family:'Bricolage MADE','Bricolage Grotesque',sans-serif;font-weight:800;font-size:34px";
      document.body.appendChild(probe);
      var at = function (ch, wd) {
        probe.style.fontVariationSettings = '"wdth" ' + wd;
        probe.textContent = ch;
        return probe.getBoundingClientRect().width;
      };
      var g = gl.map(function (el) { return { w: at(el.textContent, 100), wN: at(el.textContent, 75) }; });
      probe.remove();
      var total = g.reduce(function (a, v) { return a + v.w; }, 0);
      // put the period where the pill's centre is, so the dot becomes the pill
      var pr = pill.getBoundingClientRect(), lr = line.getBoundingClientRect();
      var dotCx = pr.left - lr.left + pr.width / 2;
      M = { g: g, total: total, dotCx: dotCx, pillW: pr.width, pillH: pr.height };
    }

    var DUR = 2.05, t0 = 0;
    function frame(now) {
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      if (!M) measure();
      var k = ease(t, 0.35, 1.00);                 // the squeeze
      var s = lerp(1, 0.07, k);
      var wd = lerp(100, 75, k);
      var last = gl.length - 1;
      var dot = M.g[last];
      var left = M.dotCx - dot.w / 2;
      var xs = [], right = left;
      for (var i = last - 1; i >= 0; i--) { right -= M.g[i].w * s; xs[i] = right; }
      for (var j = 0; j < gl.length; j++) {
        var el = gl[j], gm = M.g[j];
        if (j === last) {
          el.style.fontVariationSettings = '"wdth" 100';
          el.style.transform = 'translateX(' + left.toFixed(2) + 'px)';
          el.style.opacity = t > 1.45 ? 0 : 1;     // hand the dot over to the pill
          continue;
        }
        var nat = lerp(gm.w, gm.wN, k);
        el.style.fontVariationSettings = '"wdth" ' + wd.toFixed(1);
        el.style.transform = 'translateX(' + xs[j].toFixed(2) + 'px) scaleX(' + ((gm.w * s) / nat).toFixed(4) + ')';
        el.style.opacity = k > 0.97 ? 0 : 1;
      }
      // the dot springs open into the pill that was always in the markup
      var grow = springStep(t - 1.40, 2.7, 0.62);
      if (t >= 1.40) {
        pill.style.opacity = 1;
        pill.style.transformOrigin = '50% 50%';
        pill.style.transform = 'scaleX(' + lerp(dot.w / M.pillW, 1, grow).toFixed(4) +
                               ') scaleY(' + lerp(dot.w / M.pillH, 1, grow).toFixed(4) + ')';
        pill.style.color = 'rgba(255,255,255,' + cl((t - 1.60) / 0.34).toFixed(3) + ')';
      }
      if (t < DUR) { requestAnimationFrame(frame); }
      else {
        // hand every property back to the stylesheet; leave no inline residue
        pill.removeAttribute('style');
        line.classList.add('mark-done');
      }
    }
    // only start once the 5-glyph face is really there, or the squeeze measures a fallback
    var go = function () { requestAnimationFrame(frame); };
    if (document.fonts && document.fonts.load) {
      document.fonts.load('800 34px "Bricolage MADE"', 'MADE.').then(go, go);
    } else go();
  })();
