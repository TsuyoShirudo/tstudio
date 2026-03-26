
(() => {
  const portfolioData = window.TSTUDIO_PORTFOLIO || { items: [], categories: ['Todos'], subcategories: ['Todos'] };
  const state = {
    category: 'Todos',
    type: 'Todos',
    currentIndex: 0,
    currentItems: portfolioData.items.slice(),
    muted: false,
  };

  const audioCtx = (() => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    return Ctx ? new Ctx() : null;
  })();

  function beep({ freq = 440, duration = 0.04, type = 'sine', gain = 0.015 }) {
    if (state.muted || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration + 0.015);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration + 0.03);
  }

  function attachUIFX() {
    document.querySelectorAll('[data-sound="hover"]').forEach(el => {
      el.addEventListener('mouseenter', () => beep({ freq: 620, duration: 0.03, type: 'triangle', gain: 0.01 }));
    });
    document.querySelectorAll('[data-sound="click"]').forEach(el => {
      el.addEventListener('click', () => {
        beep({ freq: 280, duration: 0.025, type: 'square', gain: 0.02 });
        setTimeout(() => beep({ freq: 520, duration: 0.03, type: 'triangle', gain: 0.01 }), 34);
      });
    });
  }

  function setYear() {
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  }

  function setupLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('is-hidden'), 1750);
  }

  function setupCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor || matchMedia('(pointer: coarse)').matches) {
      if (cursor) cursor.style.display = 'none';
      return;
    }
    window.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a,button,.portfolio-card,.icon-btn,.nav-link,.filter-btn').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
  }

  function setupMute() {
    const btn = document.querySelector('[data-mute-toggle]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      state.muted = !state.muted;
      btn.innerHTML = state.muted ? iconVolumeOff() : iconVolumeOn();
      btn.setAttribute('aria-label', state.muted ? 'Ativar sons' : 'Silenciar sons');
    });
  }

  function iconVolumeOn(){return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a8.5 8.5 0 0 1 0 12"/></svg>'}
  function iconVolumeOff(){return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>'}
  function iconPrev(){return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m15 18-6-6 6-6"/></svg>'}
  function iconNext(){return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 18 6-6-6-6"/></svg>'}
  function iconClose(){return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>'}

  function setupPreview() {
    const heroImg = document.querySelector('[data-hero-image]');
    const heroTitle = document.querySelector('[data-hero-title]');
    if (!heroImg || !heroTitle || !portfolioData.items.length) return;
    const spotlight = portfolioData.items.filter(item => ['Vestuário','Logo','Banner'].includes(item.category));
    let idx = 0;
    const change = () => {
      const item = spotlight[idx % spotlight.length];
      heroImg.animate([{opacity:.25, filter:'blur(12px)'},{opacity:1, filter:'blur(0px)'}], {duration:500, fill:'forwards'});
      heroImg.src = item.image;
      heroTitle.textContent = item.title;
      idx += 1;
    };
    change();
    setInterval(change, 3200);
  }

  function renderPortfolio() {
    const grid = document.querySelector('[data-portfolio-grid]');
    const catWrap = document.querySelector('[data-category-filters]');
    const typeWrap = document.querySelector('[data-type-filters]');
    const count = document.querySelector('[data-portfolio-count]');
    if (!grid) return;

    if (catWrap && !catWrap.dataset.ready) {
      portfolioData.categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (category === state.category ? ' is-active' : '');
        btn.textContent = category;
        btn.dataset.sound = 'click';
        btn.addEventListener('mouseenter', () => beep({freq:620,duration:0.03,type:'triangle',gain:0.01}));
        btn.addEventListener('click', () => {
          beep({freq:280,duration:0.025,type:'square',gain:0.02});
          state.category = category;
          renderPortfolio();
        });
        catWrap.appendChild(btn);
      });
      catWrap.dataset.ready = '1';
    }

    if (typeWrap && !typeWrap.dataset.ready) {
      portfolioData.subcategories.forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (type === state.type ? ' is-active' : '');
        btn.textContent = type;
        btn.dataset.sound = 'click';
        btn.addEventListener('mouseenter', () => beep({freq:620,duration:0.03,type:'triangle',gain:0.01}));
        btn.addEventListener('click', () => {
          beep({freq:280,duration:0.025,type:'square',gain:0.02});
          state.type = type;
          renderPortfolio();
        });
        typeWrap.appendChild(btn);
      });
      typeWrap.dataset.ready = '1';
    }

    [...(catWrap?.children || [])].forEach(btn => btn.classList.toggle('is-active', btn.textContent === state.category));
    [...(typeWrap?.children || [])].forEach(btn => btn.classList.toggle('is-active', btn.textContent === state.type));

    state.currentItems = portfolioData.items.filter(item => {
      const matchCat = state.category === 'Todos' || item.category === state.category;
      const matchType = state.type === 'Todos' || item.type === state.type;
      return matchCat && matchType;
    });
    grid.innerHTML = '';
    if (count) count.textContent = `${state.currentItems.length} itens`;

    state.currentItems.forEach((item, index) => {
      const card = document.createElement('button');
      card.className = 'card portfolio-card';
      card.dataset.sound = 'click';
      card.innerHTML = `
        <div class="thumb"><img src="${item.image}" alt="${item.title}"></div>
        <div class="card-body">
          <div class="meta">${item.category} · ${item.type}</div>
          <div class="card-title">${item.title}</div>
          <div class="card-desc">${item.description}</div>
        </div>`;
      card.style.animation = `modalIn .35s ease ${index * .03}s both`;
      card.addEventListener('mouseenter', () => beep({ freq: 620, duration: 0.03, type: 'triangle', gain: 0.01 }));
      card.addEventListener('click', () => openModal(index));
      grid.appendChild(card);
    });
  }

  function openModal(index) {
    const modal = document.querySelector('.modal');
    if (!modal || !state.currentItems.length) return;
    state.currentIndex = index;
    fillModal();
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    beep({ freq: 840, duration: 0.025, type: 'sawtooth', gain: 0.008 });
  }

  function closeModal() {
    const modal = document.querySelector('.modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function fillModal() {
    const item = state.currentItems[state.currentIndex];
    if (!item) return;
    document.querySelector('[data-modal-image]').src = item.image;
    document.querySelector('[data-modal-image]').alt = item.title;
    document.querySelector('[data-modal-meta]').textContent = `${item.category} · ${item.type}`;
    document.querySelector('[data-modal-title]').textContent = item.title;
    document.querySelector('[data-modal-desc]').textContent = item.description;
  }

  function modalStep(dir) {
    if (!state.currentItems.length) return;
    state.currentIndex = (state.currentIndex + dir + state.currentItems.length) % state.currentItems.length;
    fillModal();
    beep({ freq: dir > 0 ? 510 : 350, duration: 0.03, type: 'triangle', gain: 0.012 });
  }

  function setupModal() {
    const modal = document.querySelector('.modal');
    if (!modal) return;
    document.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', closeModal));
    document.querySelector('[data-modal-prev]')?.addEventListener('click', () => modalStep(-1));
    document.querySelector('[data-modal-next]')?.addEventListener('click', () => modalStep(1));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') modalStep(-1);
      if (e.key === 'ArrowRight') modalStep(1);
    });
    document.querySelectorAll('[data-prev-icon]').forEach(el => el.innerHTML = iconPrev());
    document.querySelectorAll('[data-next-icon]').forEach(el => el.innerHTML = iconNext());
    document.querySelectorAll('[data-close-icon]').forEach(el => el.innerHTML = iconClose());
  }

  function setupStats() {
    document.querySelectorAll('[data-total-items]').forEach(el => el.textContent = portfolioData.items.length);
    document.querySelectorAll('[data-total-categories]').forEach(el => el.textContent = portfolioData.categories.length - 1);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setYear();
    setupLoader();
    setupCursor();
    setupMute();
    setupPreview();
    setupModal();
    setupStats();
    renderPortfolio();
    attachUIFX();
    document.querySelectorAll('[data-hero-title]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        el.animate([{transform:'translateX(0px)',opacity:1},{transform:'translateX(2px)',opacity:.8},{transform:'translateX(-2px)',opacity:1},{transform:'translateX(0)',opacity:1}], {duration:220});
      });
    });
  });
})();
