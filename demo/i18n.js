/* ANUI demo i18n — zh (default) / en.
   Language: ?lang=en|zh → localStorage "anui-lang" → zh. Chinese strings in the markup and scripts are the
   source keys; T(s) returns the English string. A MutationObserver translates text nodes and
   placeholder / aria-label / title attributes as the demo renders, so section code stays unchanged.
   Dynamic strings use RULES (regex → replacement). Elements marked [data-i18n-keep] are left alone. */
(function () {
  var q = new URLSearchParams(location.search).get("lang"), lang = q;
  try { if (q) localStorage.setItem("anui-lang", q); lang = lang || localStorage.getItem("anui-lang"); } catch (e) {}
  lang = lang === "en" ? "en" : "zh";
  var DICT = window.ANUI_DICT || {}, RULES = window.ANUI_RULES || [];
  var CJK = /[\u3400-\u9fff\u3000-\u303f\uff00-\uffef]/;
  function T(s) {
    if (lang !== "en" || !s || !CJK.test(s)) return s;
    var k = s.trim(); if (!k) return s;
    var hit = DICT[k];
    if (hit == null) for (var i = 0; i < RULES.length; i++) { if (RULES[i][0].test(k)) { hit = k.replace(RULES[i][0], RULES[i][1]); break; } }
    if (hit == null) { (window.__i18nMissing = window.__i18nMissing || new Set()).add(k); return s; }
    return s.replace(k, hit);
  }
  var ATTRS = ["placeholder", "aria-label", "title"];
  function keep(n) { var e = n.nodeType === 1 ? n : n.parentElement; return e && e.closest && e.closest("[data-i18n-keep],script,style"); }
  function walk(root) {
    if (root.nodeType === 3) { if (!keep(root)) { var v = T(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; } return; }
    if (root.nodeType !== 1 || keep(root)) return;
    ATTRS.forEach(function (a) { var v = root.getAttribute(a); if (v && CJK.test(v)) { var t = T(v); if (t !== v) root.setAttribute(a, t); } });
    for (var c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  window.ANUI_LANG = lang; window.T = T;
  if (lang !== "en") return;
  document.documentElement.lang = "en";
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      if (m.type === "characterData") walk(m.target);
      else if (m.type === "attributes") walk(m.target);
      else m.addedNodes.forEach(walk);
    });
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  document.addEventListener("DOMContentLoaded", function () { walk(document.body); document.title = "ANUI — AI-native UI demo"; });
})();
