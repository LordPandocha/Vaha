(function () {
  'use strict';
  const source = window.VAHA_MENU || [];
  const selection = [
    {category:'Тарелка ассорти', name:'Тарелка 1', image:'assorti'},
    {category:'Люля-кебаб', name:'Классический куриный', image:'kebab'},
    {category:'Шашлык', name:'Из свинины (шейка)', image:'shashlik'},
    {category:'Пицца', name:'Армения фирменная', image:'pizza'},
    {category:'Хачапури', name:'По-мегрельски', image:'khachapuri'},
    {category:'Салаты и закуски', name:'Табуле', image:'salad'},
    {category:'Первые блюда', name:'Хашлама из баранины', image:'soup'},
    {category:'Горячие блюда', name:'Жаркое из свинины', image:'hot'}
  ];
  const menu = selection.map(choice => { const item = source.find(x => x.category === choice.category && x.name === choice.name); return item ? {...item, image:choice.image} : null; }).filter(Boolean);
  const grid = document.querySelector('#dish-grid'), filters = document.querySelector('.filters'), search = document.querySelector('#menu-search'), empty = document.querySelector('.empty');
  const navigation = document.querySelector('#navigation'), toggle = document.querySelector('.menu-toggle'), dialog = document.querySelector('#dish-dialog');
  let selected = 'Все', lastFocus = null;
  const categories = ['Все', ...menu.map(item => item.category)];
  const esc = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const price = item => typeof item.price === 'number' ? item.price.toLocaleString('ru-RU') + ' ₽' : item.price;
  function renderFilters() { filters.innerHTML = categories.map(category => `<button class="filter" type="button" aria-pressed="${category === selected}" data-category="${esc(category)}">${esc(category)}</button>`).join(''); }
  function renderMenu() {
    const query = search.value.trim().toLocaleLowerCase('ru');
    const items = menu.map((item, index) => ({...item,index})).filter(item => (selected === 'Все' || selected === item.category) && (item.name+' '+item.category+' '+item.description).toLocaleLowerCase('ru').includes(query));
    grid.innerHTML = items.map(item => `<button class="dish" type="button" data-index="${item.index}" aria-label="${esc(item.name)}, подробнее"><img class="dish-picture" src="assets/${esc(item.image)}.png" loading="lazy" alt=""><span class="dish-content"><span class="dish-category">${esc(item.category)}</span><h3>${esc(item.name)}</h3><span class="dish-bottom"><span><span class="dish-price">${esc(price(item))}</span>${item.unit ? `<span class="dish-unit"> / ${esc(item.unit)}</span>` : ''}</span><span class="dish-arrow" aria-hidden="true">↗</span></span></span></button>`).join('');
    empty.hidden = items.length > 0;
  }
  function closeMenu() { navigation.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.querySelector('.sr-only').textContent = 'Открыть меню'; }
  toggle.addEventListener('click', () => { const open=navigation.classList.toggle('open'); toggle.setAttribute('aria-expanded',String(open)); toggle.querySelector('.sr-only').textContent=open?'Закрыть меню':'Открыть меню'; });
  navigation.addEventListener('click', event => { if(event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if(event.key==='Escape' && navigation.classList.contains('open')) { closeMenu(); toggle.focus(); } });
  filters.addEventListener('click', event => { const button=event.target.closest('[data-category]'); if(!button)return; selected=button.dataset.category; renderFilters(); renderMenu(); filters.querySelector('[aria-pressed="true"]').focus({preventScroll:true}); });
  search.addEventListener('input',renderMenu);
  grid.addEventListener('click', event => {
    const button=event.target.closest('[data-index]'); if(!button)return; const item=menu[Number(button.dataset.index)]; lastFocus=button;
    document.querySelector('#dialog-content').innerHTML=`<div class="dialog-layout"><img class="dialog-image" src="assets/${esc(item.image)}.png" alt="Иллюстрация блюда ${esc(item.name)}"><div><p class="eyebrow"><span></span> ${esc(item.category)}</p><h2 class="dialog-title" id="dialog-title">${esc(item.name)}</h2>${item.description?`<p class="dialog-description">${esc(item.description)}</p>`:''}<p class="dialog-price">${esc(price(item))}${item.unit?` <span class="dialog-unit">/ ${esc(item.unit)}</span>`:''}</p><p class="dialog-note">Цена и состав указаны по предоставленному меню. Изображение создано с помощью ИИ. Актуальность уточняйте ВКонтакте.</p><a class="text-link" href="https://vk.ru/arm_mur89" target="_blank" rel="noopener noreferrer">УТОЧНИТЬ ВКОНТАКТЕ <span>↗</span></a></div></div>`;
    closeMenu(); document.body.classList.add('modal-open'); dialog.showModal(); dialog.querySelector('.dialog-close').focus();
  });
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(lastFocus&&lastFocus.isConnected)lastFocus.focus();});
  renderFilters();renderMenu();
  const reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('has-reveal'); const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08}); reveals.forEach(element=>observer.observe(element));}
})();
