(function () {
  'use strict';
  const menu = window.VAHA_MENU || [];
  const grid = document.querySelector('#dish-grid');
  const filters = document.querySelector('.filters');
  const search = document.querySelector('#menu-search');
  const empty = document.querySelector('.empty');
  const navigation = document.querySelector('#navigation');
  const toggle = document.querySelector('.menu-toggle');
  const dishDialog = document.querySelector('#dish-dialog');
  const pagesDialog = document.querySelector('#pages-dialog');
  let selected = 'Все';
  let lastFocus = null;
  const categories = ['Все', ...new Set(menu.map(item => item.category))];
  const escapeHtml = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const price = item => typeof item.price === 'number' ? item.price.toLocaleString('ru-RU') + ' ₽' : item.price;
  function renderFilters() {
    filters.innerHTML = categories.map(category => `<button class="filter" type="button" aria-pressed="${category === selected}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
  }
  function renderMenu() {
    const query = search.value.trim().toLocaleLowerCase('ru');
    const items = menu.map((item, index) => ({...item, index})).filter(item => (selected === 'Все' || selected === item.category) && (item.name + ' ' + item.category + ' ' + item.description).toLocaleLowerCase('ru').includes(query));
    grid.innerHTML = items.map(item => {
      const positions = ['0% 17%', '100% 17%', '0% 53%', '100% 53%', '0% 92%', '100% 92%'];
      const visual = item.index < 6 ? `style="background-image:url('assets/menu-1.png');background-position:${positions[item.index]}"` : '';
      const fallback = item.index < 6 ? '' : `<span class="dish-ornament" aria-hidden="true">✳</span><span class="dish-picture-label">${escapeHtml(item.category)}</span>`;
      return `<button class="dish ${item.index < 6 ? "" : "dish-text"}" type="button" data-index="${item.index}" aria-label="${escapeHtml(item.name)}, подробнее"><span class="dish-picture ${item.index < 6 ? '' : 'dish-picture-text'}" ${visual}>${fallback}</span><span class="dish-meta"><span><span class="dish-type">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.name)}</h3><span class="dish-unit">${escapeHtml(item.unit)}</span></span><span class="dish-price">${escapeHtml(price(item))}</span></span></button>`;
    }).join('');
    empty.hidden = items.length > 0;
  }
  function openDialog(dialog) {
    lastFocus = document.activeElement;
    closeMenu();
    document.body.classList.add('modal-open');
    dialog.showModal();
    dialog.querySelector('.dialog-close').focus();
  }
  function closeMenu() {
    navigation.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Открыть меню';
  }
  toggle.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.querySelector('.sr-only').textContent = isOpen ? 'Закрыть меню' : 'Открыть меню';
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); toggle.focus(); }
  });
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    selected = button.dataset.category;
    renderFilters(); renderMenu();
    filters.querySelector('[aria-pressed="true"]').focus({preventScroll:true});
  });
  search.addEventListener('input', renderMenu);
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-index]');
    if (!button) return;
    const item = menu[Number(button.dataset.index)];
    document.querySelector('#dialog-content').innerHTML = `<div class="dialog-layout"><img class="dialog-image" src="assets/menu-${item.page}.png" alt="Оригинальная страница меню: ${escapeHtml(item.category)}"><div><p class="eyebrow">${escapeHtml(item.category)}</p><h2 class="dialog-title" id="dialog-title">${escapeHtml(item.name)}</h2>${item.description ? `<p class="dialog-description">${escapeHtml(item.description)}</p>` : ''}<p class="dialog-price">${escapeHtml(price(item))}${item.unit ? ` <span class="dialog-unit">/ ${escapeHtml(item.unit)}</span>` : ''}</p><p class="dialog-note">Цена и состав указаны по предоставленной фотографии меню. Актуальность уточняйте ВКонтакте.</p><a class="text-link" href="https://vk.ru/arm_mur89" target="_blank" rel="noopener noreferrer">Уточнить ВКонтакте ↗</a></div></div>`;
    openDialog(dishDialog);
  });
  document.querySelector('#open-pages').addEventListener('click', () => {
    const pages = document.querySelector('.pages-grid');
    if (!pages.children.length) pages.innerHTML = Array.from({length:8}, (_, i) => `<img loading="lazy" src="assets/menu-${i+1}.png" alt="Страница меню ${i+1}">`).join('');
    openDialog(pagesDialog);
  });
  [dishDialog, pagesDialog].forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (lastFocus && lastFocus.isConnected) lastFocus.focus(); });
  });
  renderFilters();
  renderMenu();
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('has-reveal');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), {threshold: 0.08});
    reveals.forEach(element => observer.observe(element));
  }
})();

