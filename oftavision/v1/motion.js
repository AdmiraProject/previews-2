(function () {
  /* 1) parallax */
  var P = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var tick = false;
  function par() {
    tick = false; var vh = innerHeight;
    P.forEach(function (fig) {
      var r = fig.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      var prog = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2); // -1 … 1
      prog = Math.max(-1, Math.min(1, prog));
      var v = -prog * 100 * (fig.dataset.parallax === 'reverse' ? -1 : 1);
      fig.firstElementChild.style.setProperty('--parallax', v.toFixed(2) + 'px');
    });
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(par); } }, { passive: true });
  addEventListener('resize', par); par();

  /* 2) continuous auto-scroll strips (duplicate content once, translate by px/s, wrap at half width) */
  function strip(track, speed) {
    if (!track || track.dataset.auto) return; track.dataset.auto = 1;
    track.innerHTML += track.innerHTML;
    [].forEach.call(track.children, function (c, i) { if (i >= track.children.length / 2) c.setAttribute('aria-hidden', 'true'); });
    var x = 0, last = performance.now(), hold = false;
    track.addEventListener('pointerenter', function () { hold = true; }); track.addEventListener('pointerleave', function () { hold = false; });
    (function f(t) {
      var dt = Math.min(64, t - last); last = t;
      if (!hold) { x -= speed * dt / 1000; var half = track.scrollWidth / 2; if (-x >= half) x += half; track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)'; }
      requestAnimationFrame(f);
    })(last);
  }
  document.querySelectorAll('.bar__row').forEach(function (r) { strip(r, 36); });
  strip(document.querySelector('.lg__tr'), 36);
  strip(document.querySelector('.press__vp'), 37);
})();
