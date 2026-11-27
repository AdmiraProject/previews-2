/* Admira /es runtime strings: page HTML comes translated from Webflow's Spanish locale; this only translates text that
   our scripts render at runtime (menus, tabs, FAQ, tour captions, popups). Dictionary: shared/i18n-es.json (English → Spanish).
   Active only on /es and /es/… paths. Never touches the native Webflow form (Webflow localizes it). */
(function () {
  var p = location.pathname;
  if (!(p === '/es' || p.indexOf('/es/') === 0)) return;
  window.ADM_LANG = 'es';
  document.documentElement.lang = 'es';
  var D = null;
  try {
    var s = document.currentScript && document.currentScript.src;
    var url = (s ? s.replace(/i18n\.js.*$/, '') : '') + 'i18n-es.json';
    var x = new XMLHttpRequest(); x.open('GET', url, false); x.send();
    if (x.status === 200) D = JSON.parse(x.responseText);
  } catch (e) {}
  // localized Spanish URLs for pages whose /es slug differs (menus built by nav.js go through ADM_LINK)
  try {
    var y = new XMLHttpRequest(); y.open('GET', url.replace('i18n-es.json', 'es-pages.json'), false); y.send();
    var PG = y.status === 200 ? JSON.parse(y.responseText) : {};
    window.ADM_ES_PAGES = PG;
    if (window.ADM_LINK) { var L0 = window.ADM_LINK; window.ADM_LINK = function (u) { var r = L0(u); return r.replace(/^\/es\/([^\/#?]+)/, function (m, a) { return '/es/' + (PG[a] || a); }); }; }
  } catch (e) {}
  if (!D) return;
  var ATTR = ['aria-label', 'alt', 'title', 'placeholder', 'data-title', 'data-sub'];
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|CODE|PRE|TEXTAREA)$/;
  function tr(t) {
    var k = t.trim(); if (!k) return null;
    var v = D[k]; if (v == null) return null;
    return t.replace(k, v);
  }
  function inForm(n) { return n.closest && n.closest('.main-form-wrapper,.w-form'); }
  function walk(root) {
    if (!root || root.nodeType !== 1 || SKIP.test(root.tagName) || inForm(root)) return;
    ATTR.forEach(function (a) { if (root.hasAttribute(a)) { var v = tr(root.getAttribute(a)); if (v != null) root.setAttribute(a, v); } });
    for (var c = root.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { var v = tr(c.nodeValue); if (v != null) c.nodeValue = v; }
      else if (c.nodeType === 1) walk(c);
    }
  }
  function all() { walk(document.body); }
  var mo = new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      if (m.type === 'characterData') { var n = m.target, v = tr(n.nodeValue); if (v != null && v !== n.nodeValue) n.nodeValue = v; return; }
      m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1) walk(n);
        else if (n.nodeType === 3 && n.parentNode && !SKIP.test(n.parentNode.tagName) && !inForm(n.parentNode)) { var v = tr(n.nodeValue); if (v != null) n.nodeValue = v; }
      });
    });
  });
  function start() { all(); mo.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  window.AdmI18n = { t: function (s) { return D[s] || s; }, dict: D };
})();
