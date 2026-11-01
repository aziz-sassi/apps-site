/* Scroll-driven motion.
   Everything is *scrubbed*: values are derived from scroll position each frame,
   so scrolling back rewinds exactly. One rAF-throttled listener drives it all.
   Reduced motion: nothing here runs, every element sits in its final state,
   and no video is ever fetched (their posters stay). */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var root = document.documentElement;
  root.classList.add('js');
  var all = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* ---------- reveals (one-way, for page content) ---------- */
  var targets = all('.reveal');
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
  var heroes = all('.plan-hero');                 // photo zooms as you leave the hero
  var stages = all('.demo-stage').map(function (s) {
    return { el: s, beats: [].slice.call(s.querySelectorAll('.beats li')), cur: -1 };
  });
  var films = all('.film-frame');                 // clip grows to full width as it arrives
  var photos = all('.pday-photo');                // day photos drift as they cross the screen
  var feat = document.querySelector('.feat-phone');
  var feats = feat ? all('.feat-list .feat') : [];
  var featImgs = feat ? [].slice.call(feat.querySelectorAll('img')) : [];
  var featCur = 0;

  function frame() {
    var vh = window.innerHeight, i, r;

    for (i = 0; i < heroes.length; i++) {
      r = heroes[i].getBoundingClientRect();
      heroes[i].style.setProperty('--hp', clamp(-r.top / Math.max(1, r.height)).toFixed(4));
    }

    for (i = 0; i < stages.length; i++) {
      var s = stages[i];
      r = s.el.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, r.height - vh));
      s.el.style.setProperty('--p', p.toFixed(4));
      var n = s.beats.length, b = Math.min(n - 1, Math.floor(p * n));
      if (b !== s.cur) {
        s.beats.forEach(function (li, k) { li.classList.toggle('on', k === b); li.classList.toggle('past', k < b); });
        s.cur = b;
      }
    }

    for (i = 0; i < films.length; i++) {
      r = films[i].getBoundingClientRect();
      films[i].style.setProperty('--fp', clamp((vh - r.top) / (vh * 0.75)).toFixed(4));
    }

    for (i = 0; i < photos.length; i++) {
      r = photos[i].getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      photos[i].style.setProperty('--vp', clamp((vh - r.top) / (vh + r.height)).toFixed(4));
    }

    if (feats.length) {
      var f = 0;
      for (i = 0; i < feats.length; i++) if (feats[i].getBoundingClientRect().top < vh * 0.55) f = i;
      if (f !== featCur) {
        featImgs.forEach(function (img, k) { img.classList.toggle('on', k === f); });
        featCur = f;
      }
    }
  }

  /* --- videos: attach a source only when the section is close ------------
     preload="none" plus no src means zero bytes on load. We add the source
     one viewport ahead, then fade in once it can actually play, so the poster
     never cuts to a blank frame. */
  var pending = all('video.ambient');
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

  /* ---------- guide pages: progress, contents, download bar ----------------
     Runs with reduced motion too: none of this is animation, it is state.
     The bar only exists in the stylesheet's hidden state once this script has
     claimed it (.js-guide), so without JS it simply stays on screen.        */
  (function () {
    var main = document.querySelector('.g-main');
    if (!main) return;
    document.documentElement.classList.add('js-guide');
    var prog = document.querySelector('.read-progress');
    var bar = document.getElementById('dl-bar');
    var answer = main.querySelector('.answer');
    var end = document.querySelector('.g-end');
    var mid = main.querySelector('.mid-cta');
    var heads = [].slice.call(main.querySelectorAll('.prose > h2[id], .art-faq[id]'));
    var links = {};
    [].forEach.call(document.querySelectorAll('.toc-d a'), function (a) { links[a.hash.slice(1)] = a; });
    var current = null;

    // tapping a contents entry on a phone should get the list out of the way
    [].forEach.call(document.querySelectorAll('.toc-m a'), function (a) {
      a.addEventListener('click', function () { a.closest('details').open = false; });
    });

    function tick() {
      var vh = window.innerHeight;
      var r = main.getBoundingClientRect();
      var p = (vh * 0.35 - r.top) / Math.max(1, r.height);
      if (prog) prog.style.setProperty('--rp', (p < 0 ? 0 : p > 1 ? 1 : p).toFixed(4));

      var id = null;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top < vh * 0.3) id = heads[i].id; else break;
      }
      if (id !== current) {
        if (links[current]) links[current].removeAttribute('aria-current');
        if (links[id]) links[id].setAttribute('aria-current', 'location');
        current = id;
      }

      if (bar) {
        var past = !answer || answer.getBoundingClientRect().bottom < 0;
        var atEnd = end && end.getBoundingClientRect().top < vh;
        // never a second App Store button stacked on top of the one in view
        var mr = mid && mid.getBoundingClientRect();
        var atMid = mr && mr.top < vh && mr.bottom > 0;
        bar.classList.toggle('on', past && !atEnd && !atMid);
      }
    }

    var queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { tick(); queued = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    tick();
  })();
