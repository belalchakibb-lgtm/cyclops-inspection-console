/* Injected after the voice bridge in MainActivity. Android's WebView has no print, no pop-up window and no way to
   save a clicked download link, so these browser calls go to the phone. The web app itself is unchanged. */
(function () {
  'use strict';
  var A = window.CyAndroid;
  if (!A || window.__cyExtras) return;
  window.__cyExtras = true;

  // Offer only the voices the phone really has. With none, callers use their timed, silent mode instead of rushing.
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices = function () {
      var langs = String(A.voiceLangs() || '');
      return langs ? langs.split(',').map(function (l) { return { name: 'Android ' + l, lang: l, localService: true, default: false, voiceURI: 'android-' + l }; }) : [];
    };
  }

  // Print: the Android print screen, which also offers "Save as PDF".
  window.print = function () { A.printPage(); };

  // Reports are written into a new window: show them full screen instead.
  function showDocument(html) {
    var d = document.createElement('dialog');
    d.style.cssText = 'width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#fff';
    d.innerHTML = '<div style="display:flex;gap:8px;padding:8px;background:#081126"><button type="button" data-x style="flex:1;padding:10px;font:inherit">✕</button><button type="button" data-p style="flex:3;padding:10px;font:inherit">🖨 PDF</button></div><iframe style="display:block;width:100%;height:calc(100% - 56px);border:0"></iframe>';
    document.body.appendChild(d);
    d.querySelector('iframe').srcdoc = html;
    d.querySelector('[data-x]').onclick = function () { d.close(); };
    d.querySelector('[data-p]').onclick = function () { A.printHtml(html); };
    d.addEventListener('close', function () { d.remove(); });
    d.showModal();
    return d;
  }
  window.open = function (url) {
    if (url) { A.openLink(new URL(url, location.href).href); return null; }
    var buf = '', dlg = null;
    return {
      document: { open: function () { buf = ''; }, write: function (h) { buf += h; }, close: function () { dlg = showDocument(buf); } },
      focus: function () {}, print: function () { A.printHtml(buf); }, close: function () { if (dlg) dlg.close(); }
    };
  };

  // Download links the user taps (the voice bridge already handles links clicked from code).
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[download]');
    if (a && /^(blob|data):/.test(a.href)) { e.preventDefault(); a.click(); }
  }, true);
}());
