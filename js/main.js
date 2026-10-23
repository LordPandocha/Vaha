/* ПИРОГОВАЯ — interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- preloader ---------- */
  const loader = $('#loader');
  if (loader) {
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('done'), 350));
    setTimeout(() => loader.classList.add('done'), 2600); // safety
  }

  /* ---------- page transitions (veil) ---------- */
  const veil = $('#veil');
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.host !== location.host || a.hash && a.pathname === location.pathname) return;
    if (a.pathname === location.pathname) return;
    e.preventDefault();
    if (veil) {
      veil.className = 'in';
      veil.querySelector('.tag').textContent = a.dataset.label || '🥧';
      setTimeout(() => { location.href = a.href; }, 620);
    } else location.href = a.href;
  });
  window.addEventListener('pageshow', () => { if (veil) { veil.className = 'out'; setTimeout(() => veil.className = '', 700); } });

  /* ---------- header + progress ---------- */
  const header = $('header'), progress = $('#progress');
  const onScroll = () => {
    const y = scrollY;
    header && header.classList.toggle('solid', y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    }
    // parallax layers
    $$('[data-parallax]').forEach(el => {
      const r = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || .15;
      if (r.bottom > 0 && r.top < innerHeight) {
        el.style.transform = `translateY(${(r.top - innerHeight / 2) * speed * -0.1}px) scale(1.12)`;
      }
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- burger ---------- */
  const burger = $('.burger'), nav = $('nav');
  burger && burger.addEventListener('click', () => {
    burger.classList.toggle('open'); nav.classList.toggle('open');
  });
  $$('nav a').forEach(a => a.addEventListener('click', () => {
    burger && burger.classList.remove('open'); nav && nav.classList.remove('open');
  }));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(x => {
    if (x.isIntersecting) { x.target.classList.add('visible'); io.unobserve(x.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- animated counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(x => {
    if (!x.isIntersecting) return;
    const el = x.target, end = parseFloat(el.dataset.count), dec = el.dataset.dec ? 1 : 0;
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * ease).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick); cio.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- steam particles ---------- */
  const steams = $$('.steam');
  steams.forEach(box => {
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('i');
      const size = 40 + Math.random() * 120;
      s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;
        animation-duration:${9 + Math.random() * 10}s;animation-delay:${-Math.random() * 18}s`;
      box.appendChild(s);
    }
  });

  /* ---------- cursor glow on .feat ---------- */
  $$('.feat').forEach(f => f.addEventListener('pointermove', e => {
    const r = f.getBoundingClientRect();
    f.style.setProperty('--mx', e.clientX - r.left + 'px');
    f.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* ---------- 3d tilt on cards ---------- */
  if (matchMedia('(pointer:fine)').matches) {
    $$('.card.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const rx = (e.clientY - r.top) / r.height - .5;
        const ry = (e.clientX - r.left) / r.width - .5;
        c.style.transform = `perspective(800px) rotateX(${-rx * 6}deg) rotateY(${ry * 6}deg) translateY(-6px)`;
      });
      c.addEventListener('pointerleave', () => c.style.transform = '');
    });
  }

  /* ---------- gallery lightbox ---------- */
  const lb = $('#lightbox');
  if (lb) {
    const imgs = $$('.gal figure img');
    let idx = 0;
    const show = i => { idx = (i + imgs.length) % imgs.length; lb.querySelector('img').src = imgs[idx].src; lb.classList.add('open'); };
    imgs.forEach((im, i) => im.parentElement.addEventListener('click', () => show(i)));
    lb.querySelector('.close').addEventListener('click', () => lb.classList.remove('open'));
    lb.querySelector('.prev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
    lb.querySelector('.next').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- hero word stagger ---------- */
  $$('h1.display .w>span').forEach((s, i) => s.style.animationDelay = (.15 + i * .09) + 's');
})();
