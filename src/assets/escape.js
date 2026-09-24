/* Instagram / Meta in-app browser escape.
   Meta's WKWebView silently refuses the OS handoff that an apps.apple.com link
   needs, so App Store links die there with no error. The fix is to put an
   escape URL in the href of the anchor the user actually taps — Meta drops
   *scripted* navigation to a custom scheme but honours a genuine tap. */
(function () {
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid  = /Android/.test(ua);
  var isInsta    = /Instagram/i.test(ua);
  var isThreads  = /Barcelona/i.test(ua);
  var isFB       = /FBAN|FBAV|FB_IAB|FBIOS/i.test(ua);
  var isOtherIAB = /TikTok|musical_ly|BytedanceWebview|Snapchat|Line\/|MicroMessenger|Twitter|LinkedInApp|Pinterest|Reddit|Telegram/i.test(ua);
  var inApp      = isInsta || isThreads || isFB || isOtherIAB;

  function escapeUrl(target) {
    var enc = encodeURIComponent(target);

    // Meta's own hand-off. Their webview refuses everything else.
    if (isIOS && isInsta)   return 'instagram://extbrowser/?url=' + enc;
    if (isIOS && isThreads) return 'barcelona://extbrowser/?url=' + enc;

    // TikTok, Snapchat, X, LinkedIn, Pinterest, Reddit, Telegram all dead-end
    // on App Store links the same way — but unlike Meta they never blocked the
    // Safari scheme, so it still gets people out.
    if (isIOS && isOtherIAB) return 'x-safari-https://' + target.replace(/^https?:\/\//, '');

    // Android: the documented intent hand-off, with a fallback if Chrome is absent.
    if (isAndroid && inApp) {
      return 'intent://' + target.replace(/^https?:\/\//, '') +
             '#Intent;scheme=https;package=com.android.chrome;' +
             'S.browser_fallback_url=' + enc + ';end';
    }
    return null;                       // Facebook on iOS: no known escape
  }

  var canEscape = inApp && escapeUrl(location.href) !== null;

  if (canEscape) {
    var links = document.querySelectorAll('a[data-store]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = escapeUrl(links[i].getAttribute('data-store'));
    }
  }

  var notice = document.getElementById('notice');
  if (inApp && notice) {
    var txt = document.getElementById('notice-txt');
    var cta = document.getElementById('notice-cta');
    var app = isInsta ? 'Instagram' : isThreads ? 'Threads' : isFB ? 'Facebook'
            : /TikTok|musical_ly|BytedanceWebview/i.test(ua) ? 'TikTok' : 'This app';
    if (canEscape) {
      txt.innerHTML = '<b>' + app + '&rsquo;s browser can&rsquo;t open the App&nbsp;Store.</b> Links here will jump out for you.';
      cta.href = escapeUrl(location.href);
      cta.setAttribute('data-escape', '');
    } else {
      notice.setAttribute('data-mode', 'manual');
      txt.innerHTML = '<b>' + app + '&rsquo;s browser can&rsquo;t open the App&nbsp;Store.</b> Tap &#8943; above, then &ldquo;Open in browser&rdquo;.';
    }
    notice.setAttribute('data-on', '');
  }

  /* If the escape is swallowed we are still here — offer the manual route. */
  var sheet = document.getElementById('sheet');
  var timer = null, left = false;
  function markLeft() { left = true; if (timer) { clearTimeout(timer); timer = null; } }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') markLeft();
  });
  window.addEventListener('pagehide', markLeft);
  window.addEventListener('blur', markLeft);

  if (canEscape && sheet) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[data-store],a[data-escape]') : null;
      if (!a) return;
      left = false;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        if (!left && document.visibilityState === 'visible') sheet.setAttribute('data-on', '');
      }, 1600);
    }, true);
  }

  /* Report the one conversion that matters. No-ops when GA4 is not configured. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-store]') : null;
    if (!a) return;
    var where = inApp
      ? (isInsta ? 'instagram' : isThreads ? 'threads' : isFB ? 'facebook'
         : /TikTok|musical_ly|BytedanceWebview/i.test(ua) ? 'tiktok' : 'other')
      : 'browser';
    /* Vercel Web Analytics */
    if (typeof window.va === 'function') {
      window.va('event', { name: 'app_store_click', data: {
        url: a.getAttribute('data-store'), page: location.pathname, from: where,
      }});
    }
    /* GA4, if a measurement id is ever configured */
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'app_store_click', {
        app_store_url: a.getAttribute('data-store'),
        page_path: location.pathname,
        in_app_browser: where,
      });
    }
  }, true);

  var x = document.getElementById('sheet-x');
  if (x) x.addEventListener('click', function () { sheet.removeAttribute('data-on'); });
})();
