/* Blog post template (Spanish locale): the new-design shell (#v2post) is filled from the page's own Webflow CMS content,
   so /es/blog/<slug> shows the Spanish article Webflow renders (title, date, category, author, cover, rich text). */
(function () {
  if (window.ADM_LANG !== 'es' || !document.getElementById('v2post')) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var v = $('#v2post'), old = $('.page-wrapper') || document.body;
  var h1o = $('.blog-post_heading', old), rich = $('.blog-post_content .w-richtext', old);
  if (!h1o || !rich) return;
  var slugify = function (t) { return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  // title + summary
  var h1 = $('h1', v); if (h1) h1.textContent = h1o.textContent.trim();
  var md = $('meta[name="description"]'); var sub = $('.sub', v); if (sub && md && md.content) sub.textContent = md.content;
  // meta line
  var date = $('.blog-tag.is-date', old), cat = $('.blog-tag.is-category', old), au = $('.blog-author_name', old);
  var wm = $('.wm', v);
  if (wm) {
    var spans = wm.querySelectorAll(':scope > span');
    var tg = $('.tg', wm); if (tg && cat) tg.textContent = cat.textContent.trim();
    var who = $('.who span', wm); if (who && au) who.textContent = au.textContent.trim();
    var last = spans[spans.length - 1]; if (last && date && !last.querySelector('svg')) last.textContent = date.textContent.trim();
  }
  var crumb = $('.crumb span:last-child', v); if (crumb && cat) crumb.textContent = cat.textContent.trim();
  var cov = $('.blog-post_img', old), cimg = $('.cov img', v); if (cov && cimg) cimg.src = cov.src;
  // body
  var prose = $('.prose', v);
  if (prose) {
    prose.innerHTML = rich.innerHTML;
    var hs = [].slice.call(prose.querySelectorAll('h2'));
    hs.forEach(function (h) { if (!h.id) h.id = slugify(h.textContent); });
    var words = (prose.textContent.match(/\S+/g) || []).length;
    var rt = wm && [].slice.call(wm.querySelectorAll('.ic')).filter(function (e) { return /min/.test(e.textContent); })[0];
    if (rt) { var svg = rt.querySelector('svg'); rt.textContent = ' ' + Math.max(1, Math.round(words / 220)) + ' min de lectura'; if (svg) rt.insertBefore(svg, rt.firstChild); }
    var side = $('.side .toc', v), tm = $('.toc.tm', v);
    if (side) side.innerHTML = '<p class="lb">En esta página</p>' + hs.map(function (h) { return '<a href="#' + h.id + '">' + h.textContent + '</a>'; }).join('');
    if (tm) tm.innerHTML = '<p class="lb"><span>En esta página</span><span>' + hs.length + ' secciones</span></p>' + hs.map(function (h, i) { return '<a href="#' + h.id + '"><span class="n">' + (i + 1) + '</span>' + h.textContent + '</a>'; }).join('');
  }
  // related cards: Spanish titles by slug
  try {
    var x = new XMLHttpRequest(); x.open('GET', (window.ADM_BASE || '') + 'blog/es-titles.json', false); x.send();
    var T = x.status === 200 ? JSON.parse(x.responseText) : {};
    var S = window.ADM_ES_SLUGS || {}, R = {}; Object.keys(S).forEach(function (es) { R[S[es]] = es; });
    v.querySelectorAll('a[href^="/es/blog/"],a[href^="/blog/"]').forEach(function (a) {
      var en = a.getAttribute('href').replace(/^\/(es\/)?blog\//, '').replace(/[#?].*$/, ''); var es = R[en] || en;
      a.setAttribute('href', '/es/blog/' + es);
      var t = a.querySelector('h2,h3'); if (t && T[es]) t.textContent = T[es];
      var p = a.querySelector('p'); if (p && T[es]) p.remove();
    });
  } catch (e) {}
})();
