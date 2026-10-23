/* Consent-gated Google Analytics.
   gtag is never loaded until someone actively allows it, so a visitor who
   ignores or declines the banner gets exactly the site they got before GA4
   existed: no Google script, no cookies, nothing in dataLayer.

   The choice itself lives in localStorage, not a cookie — a declined visitor
   should not end up with storage set by the act of declining. */
(function () {
  var ID = window.__ga4Id;
  if (!ID) return;

  var KEY = 'as-analytics-consent';
  var box = document.getElementById('consent');

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: ask again next visit */ }
  }

  function loadGa4() {
    if (window.gtag) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    // IP anonymisation is the default in GA4; spelled out so it is reviewable here.
    window.gtag('config', ID, { anonymize_ip: true });
  }

  function decide(v) {
    write(v);
    if (box) { box.hidden = true; }
    if (v === 'granted') loadGa4();
  }

  var prior = read();
  if (prior === 'granted') { loadGa4(); return; }
  if (prior === 'denied') { return; }

  if (!box) return;
  box.hidden = false;
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-consent]');
    if (b) decide(b.getAttribute('data-consent'));
  });
})();
