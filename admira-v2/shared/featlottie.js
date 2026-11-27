
(function () {
  const A = new URL('https://admiraproject.github.io/previews-2/admira-v2/assets/', document.currentScript.src).href, $ = (s) => document.querySelector(s);
  const js = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const acc = $('#acc'), pn = $('#lpn');
  if (acc && pn) {
    const items = [...acc.children], boxes = [...pn.querySelectorAll('.lo')], xp = pn.querySelector('.xp'), caps = [...document.querySelectorAll('#caps .cap')];
    const lib = () => window.lottie ? Promise.resolve() : (lib.p = lib.p || js('https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js').catch(() => js(A + 'lottie/lottie-5.12.2.min.js')));
    const data = {}, get = (k) => (window.ADM_LOTTIE && window.ADM_LOTTIE[k]) ? Promise.resolve() : (data[k] = data[k] || js(A + 'lottie/' + k + '.js'));
    const anim = async (el) => {
      if (el._an) return el._an;
      await lib(); await get(el.dataset.k);
      el._an = lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: false, animationData: JSON.parse(JSON.stringify(window.ADM_LOTTIE[el.dataset.k])) });
      return el._an;
    };
    
    const panel = pn.parentElement, home = panel.parentElement, mq = matchMedia('(max-width:767px)');
    const place = () => { if (mq.matches && cur >= 0) items[cur].querySelector('.b > div').appendChild(panel); else if (panel.parentElement !== home) home.appendChild(panel); };
    mq.addEventListener('change', place);
    let cur = -1, t, tok = 0, inView = false, user = false;
    async function open(i, byUser) {
      if (byUser) user = true;
      if (i === cur && !byUser) return; cur = i; clearTimeout(t); const my = ++tok;
      items.forEach((el, k) => el.classList.toggle('on', k === i)); place(); if (xp && items[i].dataset.media) xp.dataset.watch = items[i].dataset.media;
      boxes.forEach((el, k) => { el.classList.toggle('on', k === i); if (k !== i && el._an) el._an.stop(); });
      caps.forEach(c => c.classList.remove('on')); caps.forEach((c, k) => setTimeout(() => my === tok && c.classList.add('on'), 250 + k * 120));
      const a = await anim(boxes[i]); if (my !== tok) return;
      a.goToAndPlay(0, true);
      const d = Math.max(4000, a.totalFrames / (a.frameRate || 60) * 1000 + 600);
      items[i].style.setProperty('--dur', d + 'ms'); const bar = items[i].querySelector('.bar i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      if (!user && inView) t = setTimeout(() => open((i + 1) % items.length), d);
    }
    items.forEach((el, i) => el.firstElementChild.addEventListener('click', () => open(i, true)));
    new IntersectionObserver(es => es.forEach(e => {
      inView = e.isIntersecting; const el = boxes[cur];
      if (inView) { if (cur < 0) open(0); else if (el && el._an) { el._an.play(); if (!user) { clearTimeout(t); t = setTimeout(() => open((cur + 1) % items.length), 4000); } } }
      else { clearTimeout(t); if (el && el._an) el._an.pause(); }
    }), { threshold: .3 }).observe(pn);
  }

})();
