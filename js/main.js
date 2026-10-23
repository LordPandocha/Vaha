/* ПИРОГОВАЯ — interactions v2 (GSAP + ScrollTrigger + Lenis, с фолбэком) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasG = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  if (hasG && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('g');
  }

  /* ---------- smooth scroll (Lenis on GSAP clock) ---------- */
  let lenis = null;
  if (typeof Lenis !== 'undefined' && hasG && !reduced) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
    }));
  }

  /* ---------- preloader ---------- */
  const loader = $('#loader');
  if (loader) {
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('done'), 300));
    setTimeout(() => loader.classList.add('done'), 2500);
  }

  /* ---------- page transitions (veil) ---------- */
  const veil = $('#veil');
  const veilTag = veil && veil.querySelector('.tag');
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.host !== location.host) return;
    if (a.pathname === location.pathname) return; // same page / anchors
    e.preventDefault();
    if (veil && !reduced) {
      if (veilTag) veilTag.textContent = a.dataset.label || '🥧';
      veil.className = 'in';
      setTimeout(() => { location.href = a.href; }, 600);
    } else location.href = a.href;
  });
  window.addEventListener('pageshow', () => {
    if (!veil) return;
    veil.className = 'out';
    setTimeout(() => { veil.className = ''; }, 800);
  });

  /* ---------- header + progress ---------- */
  const header = $('header'), progress = $('#progress');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      header && header.classList.toggle('solid', y > 40);
      if (progress) {
        const h = document.documentElement.scrollHeight - innerHeight;
        progress.style.width = (h > 0 ? y / h * 100 : 0) + '%';
      }
      // fallback parallax (no GSAP)
      if (!hasG || reduced) {
        $$('[data-parallax]').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) {
            const sp = parseFloat(el.dataset.parallax) || .15;
            el.style.transform = `translateY(${(r.top - innerHeight / 2) * sp * -0.1}px) scale(1.08)`;
          }
        });
      }
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- burger ---------- */
  const burger = $('.burger'), nav = $('nav');
  burger && burger.addEventListener('click', () => {
    burger.classList.toggle('open'); nav && nav.classList.toggle('open');
  });
  $$('nav a').forEach(a => a.addEventListener('click', () => {
    burger && burger.classList.remove('open'); nav && nav.classList.remove('open');
  }));

  /* ---------- custom cursor + magnetic buttons ---------- */
  if (fine && !reduced) {
    const dot = document.createElement('div'); dot.className = 'cursor';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    document.body.classList.add('cursor-on');
    if (hasG) {
      const rx = gsap.quickTo(ring, 'x', { duration: .35, ease: 'power3' });
      const ry = gsap.quickTo(ring, 'y', { duration: .35, ease: 'power3' });
      const dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power2' });
      const dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power2' });
      addEventListener('pointermove', e => {
        gsap.set([dot, ring], { opacity: 1 });
        dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
        const hot = e.target.closest('a,button,.card,figure,.fchip');
        ring.classList.toggle('hover', !!hot);
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', () => gsap.set([dot, ring], { opacity: 0 }));
    } else {
      addEventListener('pointermove', e => {
        dot.style.opacity = ring.style.opacity = 1;
        dot.style.transform = ring.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
        ring.classList.toggle('hover', !!e.target.closest('a,button,.card,figure,.fchip'));
      }, { passive: true });
    }
    // magnetic
    if (hasG) $$('.btn.primary').forEach(b => {
      const mx = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' });
      const my = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .25);
        my((e.clientY - r.top - r.height / 2) * .35);
      });
      b.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* ---------- reveals ---------- */
  const dMap = { d1: .08, d2: .16, d3: .24, d4: .32, d5: .4, d6: .48 };
  if (hasG && !reduced) {
    $$('.reveal').forEach(el => {
      let delay = 0;
      for (const k in dMap) if (el.classList.contains(k)) delay = dMap[k];
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: .9, delay, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onStart: () => el.classList.contains('shine') && el.classList.add('is-inview'),
      });
    });
    // hero entrance
    const words = $$('h1.display .w>span');
    if (words.length) {
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .from('.kicker', { y: 24, opacity: 0, duration: .7 }, .15)
        .from(words, { yPercent: 110, duration: 1, stagger: .09 }, .2)
        .from('.hero p.lead', { y: 26, opacity: 0, duration: .8 }, .55)
        .from('.hero-cta .btn', { y: 26, opacity: 0, stagger: .1, duration: .7 }, .7)
        .from('.hero-stats .st', { y: 22, opacity: 0, stagger: .08, duration: .6 }, .85);
    }
    // scrub parallax
    $$('[data-parallax]').forEach(el => {
      gsap.fromTo(el, { yPercent: -6, scale: 1.12 }, {
        yPercent: 6, scale: 1.04, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    // marquee
    const track = $('.marquee .track');
    if (track) gsap.to(track, { xPercent: -50, ease: 'none', duration: 22, repeat: -1 });
    // band headings slight x drift
    $$('.band h2').forEach(h => gsap.fromTo(h, { x: -60, opacity: 0 }, {
      x: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: h, start: 'top 85%', once: true },
    }));
  } else {
    const io = new IntersectionObserver(es => es.forEach(x => {
      if (x.isIntersecting) { x.target.classList.add('visible'); io.unobserve(x.target); }
    }), { threshold: .12 });
    $$('.reveal').forEach(el => io.observe(el));
  }

  /* ---------- counters ---------- */
  const animCount = el => {
    const end = parseFloat(el.dataset.count), dec = el.dataset.dec ? 1 : 0;
    const obj = { v: 0 };
    if (hasG && !reduced) {
      gsap.to(obj, { v: end, duration: 1.6, ease: 'power2.out',
        onUpdate: () => el.textContent = obj.v.toFixed(dec),
        scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    } else {
      const io = new IntersectionObserver(es => es.forEach(x => {
        if (!x.isIntersecting) return; io.disconnect();
        const t0 = performance.now(), dur = 1400;
        const tick = t => {
          const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = (end * e).toFixed(dec);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }), { threshold: .6 });
      io.observe(el);
    }
  };
  $$('[data-count]').forEach(animCount);

  /* ---------- steam particles ---------- */
  $$('.steam').forEach(box => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('i');
      const size = 40 + Math.random() * 120;
      s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;
        animation-duration:${9 + Math.random() * 10}s;animation-delay:${-Math.random() * 18}s`;
      frag.appendChild(s);
    }
    box.appendChild(frag);
  });

  /* ---------- cursor glow on .feat ---------- */
  $$('.feat').forEach(f => f.addEventListener('pointermove', e => {
    const r = f.getBoundingClientRect();
    f.style.setProperty('--mx', e.clientX - r.left + 'px');
    f.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* ---------- 3d tilt ---------- */
  if (fine && !reduced) $$('.card.tilt').forEach(c => {
    const setT = t => c.style.transform = t;
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      const rx = (e.clientY - r.top) / r.height - .5;
      const ry = (e.clientX - r.left) / r.width - .5;
      setT(`perspective(800px) rotateX(${-rx * 6}deg) rotateY(${ry * 6}deg) translateY(-6px)`);
    });
    c.addEventListener('pointerleave', () => setT(''));
  });

  /* ---------- gallery lightbox ---------- */
  const lb = $('#lightbox');
  if (lb) {
    const imgs = $$('.gal figure img');
    let idx = 0;
    const show = i => { idx = (i + imgs.length) % imgs.length; lb.querySelector('img').src = imgs[idx].src; lb.classList.add('open'); lenis && lenis.stop(); };
    const close = () => { lb.classList.remove('open'); lenis && lenis.start(); };
    imgs.forEach((im, i) => im.parentElement.addEventListener('click', () => show(i)));
    lb.querySelector('.close').addEventListener('click', close);
    lb.querySelector('.prev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
    lb.querySelector('.next').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    let tx = null;
    lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
    lb.addEventListener('touchend', e => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      tx = null;
    }, { passive: true });
  }

  /* ---------- catalog filters ---------- */
  const chips = $$('.filters .fchip');
  if (chips.length) {
    const items = $$('.item');
    chips.forEach(chip => chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;
      items.forEach(it => {
        const show = f === 'all' || it.dataset.cat === f;
        it.classList.toggle('hidden', !show);
        if (hasG && !reduced && show) gsap.fromTo(it, { scale: .94, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'power3.out' });
      });
      hasG && ScrollTrigger.refresh();
    }));
  }

  document.body.style.visibility = document.body.style.visibility || '';
})();
