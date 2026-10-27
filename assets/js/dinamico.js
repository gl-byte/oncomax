(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isPhone = window.matchMedia('(max-width: 700px)');
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  var usingKeys = false;
  document.addEventListener('keydown', function () {
    usingKeys = true;
  }, true);
  document.addEventListener('pointerdown', function () {
    usingKeys = false;
  }, true);
  function focusIfKeys(node) {
    if (usingKeys && node) node.focus({ preventScroll: true });
  }
  function lock(on) {
    root.classList.toggle('zq-lock', on);
  }
  function trapFocus(container, e) {
    var items = $$('a[href], button:not([disabled])', container).filter(function (n) {
      return n.offsetParent !== null;
    });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
    else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  function onSwipe(target, cb) {
    var x0 = null, y0 = 0;
    target.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) {
        x0 = null;
        return;
      }
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    target.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) cb(dx < 0 ? 'next' : 'prev');
    }, { passive: true });
  }
  var progress = el('div', 'zq-progress');
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  var header = $('body > header');
  var quick = $('.quick-actions');
  var topBtn = quick && $('a[href="#inicio"]', quick);
  var waBtn = quick && $('.quick-whatsapp', quick);
  if (topBtn) {
    topBtn.classList.add('zq-top');
    topBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
  if (waBtn) {
    Array.prototype.slice.call(waBtn.childNodes).forEach(function (n) {
      if (n.nodeType === 3 && n.textContent.trim()) {
        var s = el('span', 'zq-label');
        s.textContent = n.textContent.trim();
        n.replaceWith(s);
      }
    });
  }
  function setHeaderHeight() {
    if (header) root.style.setProperty('--zq-header-h', header.offsetHeight + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, y / max).toFixed(4) : 0;
    progress.style.setProperty('--zq-p', p);
    if (topBtn) topBtn.style.setProperty('--zq-p', p);
    root.classList.toggle('zq-scrolled', y > 10);
    root.classList.toggle('zq-scrolled-far', y > 300);
    root.classList.toggle('zq-show-top', y > 400);
    if (header && !root.classList.contains('zq-lock')) {
      if (y > lastY + 6 && y > 260) root.classList.add('zq-header-hidden');
      else if (y < lastY - 6 || y < 120) root.classList.remove('zq-header-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();
  var RIPPLE = '.btn, .btn-detail, .btn-whatsapp, .menu-link, .catalog-menu summary, .hero-categories a, ' +
  '.modal-navigation a, .mobile-menu summary, .mobile-home-menu summary, .zq-sheet .mobile-links a, .zq-chip, .zq-filter';
  if (!reduce) {
    document.addEventListener('pointerdown', function (e) {
      var host = e.target.closest(RIPPLE);
      if (!host) return;
      var r = host.getBoundingClientRect();
      var s = Math.max(r.width, r.height) * 2.2;
      var dot = el('span', 'zq-ripple');
      dot.style.cssText = '--s:' + s + 'px;--x:' + (e.clientX - r.left) + 'px;--y:' + (e.clientY - r.top) + 'px';
      host.appendChild(dot);
      dot.addEventListener('animationend', function () {
        dot.remove();
      });
    }, { passive: true });
  }
  var backdrop = null;
  var openSheet = null;
  function closeSheet(returnFocus) {
    if (!openSheet) return;
    var s = openSheet;
    s.sheet.classList.remove('is-open');
    s.sheet.style.transform = '';
    backdrop.classList.remove('is-open');
    s.summary.classList.remove('is-active');
    s.summary.setAttribute('aria-expanded', 'false');
    lock(false);
    openSheet = null;
    if (returnFocus) s.summary.focus({ preventScroll: true });
  }
  $$('details.mobile-menu, details.mobile-home-menu').forEach(function (details, n) {
    var summary = $('summary', details);
    var links = $('.mobile-links', details);
    if (!summary || !links) return;
    if (!backdrop) {
      backdrop = el('div', 'zq-backdrop');
      backdrop.addEventListener('click', function () {
        closeSheet(false);
      });
      document.body.appendChild(backdrop);
    }
    var id = 'zq-menu-' + n;
    var sheet = el('div', 'zq-sheet');
    sheet.id = id;
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Menú de navegación');
    var logo = $('.logo, .brand img');
    var head = el('div', 'zq-sheet-head',
    (logo ? '<img src="' + logo.getAttribute('src') + '" alt="ZQ SPORT">' : '<p class="zq-sheet-title">Menú</p>') +
    '<button type="button" class="zq-sheet-close" aria-label="Cerrar menú">&#10005;</button>');
    var body = el('div', 'zq-sheet-body');
    $$('a', links).forEach(function (a, i) {
      a.style.setProperty('--i', i);
    });
    body.appendChild(links);
    sheet.appendChild(el('div', 'zq-sheet-handle'));
    sheet.appendChild(head);
    sheet.appendChild(body);
    if (waBtn) {
      var foot = el('div', 'zq-sheet-foot',
      '<a href="' + waBtn.getAttribute('href') + '"><img src="assets/icons/whatsapp.svg" alt="">Escríbenos por WhatsApp</a>');
      sheet.appendChild(foot);
    }
    document.body.appendChild(sheet);
    details.open = false;
    summary.setAttribute('aria-expanded', 'false');
    summary.setAttribute('aria-controls', id);
    var entry = { sheet: sheet, summary: summary };
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (openSheet === entry) {
        closeSheet(true);
        return;
      }
      openSheet = entry;
      root.classList.remove('zq-header-hidden');
      sheet.classList.add('is-open');
      backdrop.classList.add('is-open');
      summary.classList.add('is-active');
      summary.setAttribute('aria-expanded', 'true');
      lock(true);
      setTimeout(function () {
        focusIfKeys($('.zq-sheet-close', sheet));
      }, 60);
    });
    $('.zq-sheet-close', sheet).addEventListener('click', function () {
      closeSheet(true);
    });
    sheet.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') trapFocus(sheet, e);
    });
    var start = null, delta = 0, axisY = true, t0 = 0;
    sheet.addEventListener('touchstart', function (e) {
      axisY = isPhone.matches;
      var inBody = e.target.closest('.zq-sheet-body');
      if (axisY && inBody && body.scrollTop > 0) {
        start = null;
        return;
      }
      start = axisY ? e.touches[0].clientY : e.touches[0].clientX;
      delta = 0;
      t0 = Date.now();
    }, { passive: true });
    sheet.addEventListener('touchmove', function (e) {
      if (start === null) return;
      delta = (axisY ? e.touches[0].clientY : e.touches[0].clientX) - start;
      if (delta <= 0) {
        sheet.classList.remove('is-dragging');
        sheet.style.transform = '';
        return;
      }
      sheet.classList.add('is-dragging');
      sheet.style.transform = axisY ? 'translateY(' + delta + 'px)' : 'translateX(' + delta + 'px)';
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    sheet.addEventListener('touchend', function () {
      if (start === null) return;
      start = null;
      sheet.classList.remove('is-dragging');
      var fast = delta / Math.max(1, Date.now() - t0) > .6;
      if (delta > 110 || (fast && delta > 30)) closeSheet(false);
      else sheet.style.transform = '';
    });
  });
  var REVEAL = '.product-card, .gallery-card, .offers > .card, .team-card, .info-panel, .map-panel, ' +
  '.faq-list details, .section-title, .section-intro, .footer-grid > section';
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--d', Math.min(i++, 5) * 80 + 'ms');
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    $$(REVEAL).forEach(function (n) {
      n.classList.add('zq-reveal');
      io.observe(n);
    });
  }
  if (finePointer && !reduce) {
    $$('.product-card, .gallery-card, .card, .team-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((x - .5) * 8).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }
  var heroTitle = $('.hero-title');
  if (heroTitle && !reduce) {
    var text = heroTitle.textContent.trim();
    heroTitle.setAttribute('aria-label', text);
    heroTitle.textContent = '';
    text.split('').forEach(function (ch, i) {
      var s = el('span', ch === ' ' ? 'zq-space' : 'zq-letter');
      s.setAttribute('aria-hidden', 'true');
      if (ch !== ' ') {
        s.textContent = ch;
        s.style.setProperty('--i', i);
      }
      heroTitle.appendChild(s);
    });
  }
  var hero = $('.hero');
  if (hero && finePointer && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      hero.style.setProperty('--px', (e.clientX / window.innerWidth - .5).toFixed(3));
      hero.style.setProperty('--py', (e.clientY / window.innerHeight - .5).toFixed(3));
    });
    $$('.hero-actions .btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + 'px');
        b.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () {
        b.style.setProperty('--tx', '0px');
        b.style.setProperty('--ty', '0px');
      });
    });
  }
  var modals = $$('.product-modal');
  var COLORS = {
  coral: '#FF7F50', azul: '#1E5AA8', negro: '#1B1B1B', blanco: '#FFFFFF', rojo: '#D62828',
  verde: '#2E9E5B', amarillo: '#F5C518', gris: '#9AA5AB', celeste: '#48B7BD', naranja: '#F15A38',
  rosado: '#F48FB1', rosa: '#F48FB1', morado: '#7E57C2', plomo: '#7D8A90'
  };
  function buildOptions(modal) {
    var btn = $('.btn-whatsapp', modal);
    if (!btn || btn.href.indexOf('__') === -1) return;
    var parts = btn.href.split('?text=');
    if (parts.length !== 2) return;
    var baseText;
    try {
      baseText = decodeURIComponent(parts[1]);
    } catch (err) {
      return;
    }
    var state = { Talla: null, Color: null, Cantidad: 1 };
    function update() {
      var t = baseText;
      Object.keys(state).forEach(function (k) {
        t = t.replace(new RegExp(k + ':\\s*__'), k + ': ' + (state[k] == null ? '__' : state[k]));
      });
      btn.href = parts[0] + '?text=' + encodeURIComponent(t);
    }
    var lastGroup = null;
    $$('.modal-info p', modal).forEach(function (p) {
      var strong = $('strong', p);
      if (!strong) return;
      var label = strong.textContent.replace(':', '').trim();
      var key = /talla/i.test(label) ? 'Talla' : /color/i.test(label) ? 'Color' : null;
      if (!key) return;
      var values = p.textContent.replace(strong.textContent, '').split(/,|\s+y\s+/)
      .map(function (v) {
        return v.trim();
      }).filter(Boolean);
      if (!values.length) return;
      var group = el('div', 'zq-option-group');
      group.appendChild(el('span', 'zq-option-label')).textContent = label;
      var chips = el('div', 'zq-chips');
      chips.setAttribute('role', 'group');
      chips.setAttribute('aria-label', label);
      values.forEach(function (v) {
        var b = el('button', 'zq-chip');
        b.type = 'button';
        b.setAttribute('aria-pressed', 'false');
        if (key === 'Color') {
          var sw = el('span', 'zq-swatch');
          sw.style.setProperty('--c', COLORS[v.toLowerCase()] || '#ccc');
          b.appendChild(sw);
        }
        b.appendChild(document.createTextNode(v));
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-pressed') !== 'true';
          $$('.zq-chip', chips).forEach(function (c) {
            c.setAttribute('aria-pressed', 'false');
          });
          b.setAttribute('aria-pressed', String(on));
          state[key] = on ? v : null;
          update();
        });
        chips.appendChild(b);
      });
      group.appendChild(chips);
      p.replaceWith(group);
      lastGroup = group;
    });
    if (/Cantidad:\s*__/.test(baseText)) {
      var qty = el('div', 'zq-option-group',
      '<span class="zq-option-label">Cantidad</span>' +
      '<div class="zq-qty"><button type="button" aria-label="Quitar uno">&minus;</button>' +
      '<output aria-live="polite">1</output>' +
      '<button type="button" aria-label="Agregar uno">+</button></div>');
      var out = $('output', qty);
      var btns = $$('button', qty);
      function setQty(n) {
        state.Cantidad = Math.max(1, Math.min(99, n));
        out.textContent = state.Cantidad;
        out.classList.remove('zq-bump');
        void out.offsetWidth;
        out.classList.add('zq-bump');
        update();
      }
      btns[0].addEventListener('click', function () {
        setQty(state.Cantidad - 1);
      });
      btns[1].addEventListener('click', function () {
        setQty(state.Cantidad + 1);
      });
      if (lastGroup) lastGroup.after(qty); else btn.before(qty);
    }
    update();
  }
  function setDir(dir) {
    root.classList.remove('zq-dir-next', 'zq-dir-prev');
    if (dir) root.classList.add('zq-dir-' + dir);
  }
  function currentModal() {
    return $('.product-modal:target');
  }
  function go(modal, dir) {
    var links = $$('.modal-navigation a', modal);
    var a = dir === 'next' ? links[links.length - 1] : links[0];
    if (!a) return;
    setDir(dir);
    location.replace(a.getAttribute('href'));
  }
  if (modals.length) {
    modals.forEach(function (modal, idx) {
      var nav = $('.modal-navigation', modal);
      if (nav && nav.children.length >= 2) {
        var c = el('span', 'zq-counter', '<b>' + (idx + 1) + '</b> / ' + modals.length);
        c.setAttribute('aria-hidden', 'true');
        nav.children[0].after(c);
      }
      var img = $('.modal-content > img', modal);
      if (img) {
        var zoom = el('div', 'zq-zoom');
        img.before(zoom);
        zoom.appendChild(img);
        if (finePointer && !reduce) {
          zoom.addEventListener('pointermove', function (e) {
            var r = zoom.getBoundingClientRect();
            zoom.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
            zoom.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
          });
        }
      }
      buildOptions(modal);
      onSwipe(modal, function (dir) {
        go(modal, dir);
      });
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('.modal-navigation a, .modal-close, .btn-detail');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      if (a.classList.contains('btn-detail')) {
        setDir(null);
        return;
      }
      e.preventDefault();
      if (a.classList.contains('modal-close')) {
        setDir(null);
        location.replace(href);
        return;
      }
      var links = $$('.modal-navigation a', a.closest('.modal-navigation'));
      setDir(a === links[links.length - 1] ? 'next' : 'prev');
      location.replace(href);
    });
    window.addEventListener('hashchange', function () {
      var m = currentModal();
      if (m && usingKeys) {
        var close = $('.modal-close', m);
        if (close) close.focus({ preventScroll: true });
      }
    });
  }
  var gallery = $('.gallery');
  if (gallery) {
    var gCards = $$('.gallery-card', gallery);
    gCards.forEach(function (c) {
      var link = $('a', c);
      var h = link ? link.getAttribute('href') : '';
      c.dataset.cat = /deportivos/.test(h) ? 'deportivos' : /poleras/.test(h) ? 'poleras' : /mochilas/.test(h) ? 'mochilas' : 'otros';
    });
    var CATS = [['todos', 'Todos'], ['deportivos', 'Deportivos'], ['poleras', 'Poleras'], ['mochilas', 'Mochilas']];
    var bar = el('div', 'zq-filters');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filtrar galería');
    CATS.forEach(function (cat) {
      var count = cat[0] === 'todos' ? gCards.length : gCards.filter(function (c) {
        return c.dataset.cat === cat[0];
      }).length;
      if (!count) return;
      var b = el('button', 'zq-filter', cat[1] + ' <span>' + count + '</span>');
      b.type = 'button';
      b.dataset.cat = cat[0];
      b.setAttribute('aria-pressed', cat[0] === 'todos' ? 'true' : 'false');
      bar.appendChild(b);
    });
    gallery.before(bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('.zq-filter');
      if (!b) return;
      $$('.zq-filter', bar).forEach(function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      var cat = b.dataset.cat;
      function apply() {
        gCards.forEach(function (c) {
          c.classList.toggle('is-out', cat !== 'todos' && c.dataset.cat !== cat);
        });
      }
      if (document.startViewTransition && !reduce) {
        gCards.forEach(function (c, i) {
          c.style.viewTransitionName = 'zq-g' + i;
        });
        document.startViewTransition(apply).finished.finally(function () {
          gCards.forEach(function (c) {
            c.style.viewTransitionName = '';
          });
        });
      } else {
        apply();
      }
    });
    var lb = el('div', 'zq-lightbox',
    '<span class="zq-lb-count" aria-hidden="true"></span>' +
    '<button type="button" class="zq-lb-btn zq-lb-close" aria-label="Cerrar">&#10005;</button>' +
    '<button type="button" class="zq-lb-btn zq-lb-prev" aria-label="Imagen anterior">&#8249;</button>' +
    '<button type="button" class="zq-lb-btn zq-lb-next" aria-label="Imagen siguiente">&#8250;</button>' +
    '<figure class="zq-lb-figure"><img alt=""><figcaption class="zq-lb-caption"><h2></h2><a></a></figcaption></figure>');
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Vista ampliada');
    document.body.appendChild(lb);
    var lbImg = $('img', lb), lbTitle = $('h2', lb), lbLink = $('figcaption a', lb), lbCount = $('.zq-lb-count', lb);
    var list = [], pos = 0, opener = null;
    function show(i, dir) {
      pos = (i + list.length) % list.length;
      var card = list[pos];
      var img = $('img', card), link = $('a', card), h = $('h2', card);
      lbImg.src = img.getAttribute('src');
      lbImg.alt = img.alt;
      lbTitle.textContent = h ? h.textContent : '';
      if (link) {
        lbLink.href = link.getAttribute('href');
        lbLink.textContent = link.textContent;
      }
      lbCount.textContent = (pos + 1) + ' / ' + list.length;
      if (dir && !reduce && lbImg.animate) {
        lbImg.animate([
        { opacity: 0, transform: 'translateX(' + (dir === 'next' ? 50 : -50) + 'px) scale(.97)' },
        { opacity: 1, transform: 'none' }
        ], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    }
    function openLb(card) {
      list = gCards.filter(function (c) {
        return !c.classList.contains('is-out');
      });
      opener = document.activeElement;
      show(list.indexOf(card));
      lb.classList.add('is-open');
      lock(true);
      setTimeout(function () {
        focusIfKeys($('.zq-lb-close', lb));
      }, 50);
    }
    function closeLb() {
      lb.classList.remove('is-open');
      lock(false);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    }
    gCards.forEach(function (c) {
      var img = $('img', c);
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Ampliar ' + ($('h2', c) ? $('h2', c).textContent : 'imagen'));
      img.addEventListener('click', function () {
        openLb(c);
      });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLb(c);
        }
      });
    });
    $('.zq-lb-close', lb).addEventListener('click', closeLb);
    $('.zq-lb-prev', lb).addEventListener('click', function () {
      show(pos - 1, 'prev');
    });
    $('.zq-lb-next', lb).addEventListener('click', function () {
      show(pos + 1, 'next');
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLb();
    });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') trapFocus(lb, e);
    });
    onSwipe(lb, function (dir) {
      show(pos + (dir === 'next' ? 1 : -1), dir);
    });
  }
  var offers = $('.offers');
  if (offers) {
    var oCards = $$('.offers > .card');
    function money(node) {
      var m = node && node.textContent.match(/Bs\.?\s*([\d.,]+)/);
      return m ? parseFloat(m[1].replace(',', '.')) : 0;
    }
    oCards.forEach(function (card, i) {
      var oldP = money($('.old', card)), newP = money($('.new', card));
      if (oldP && newP && oldP > newP) {
        var save = el('p', 'zq-save');
        save.textContent = 'Ahorras Bs. ' + Math.round(oldP - newP);
        $('.new', card).after(save);
      }
      var shine = el('span', 'zq-shine');
      shine.setAttribute('aria-hidden', 'true');
      shine.style.setProperty('--d', (i * .7).toFixed(1) + 's');
      card.appendChild(shine);
    });
    if (oCards.length > 1) {
      var dots = el('div', 'zq-dots');
      dots.setAttribute('role', 'group');
      dots.setAttribute('aria-label', 'Elegir oferta');
      oCards.forEach(function (card, i) {
        var d = el('button');
        d.type = 'button';
        d.setAttribute('aria-label', 'Ver oferta ' + (i + 1));
        d.addEventListener('click', function () {
          offers.scrollTo({ left: card.offsetLeft - oCards[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
        });
        dots.appendChild(d);
      });
      offers.after(dots);
      var dotBtns = $$('button', dots), dotTick = false;
      function syncDots() {
        dotTick = false;
        var step = oCards[1].offsetLeft - oCards[0].offsetLeft || 1;
        var idx = Math.max(0, Math.min(oCards.length - 1, Math.round(offers.scrollLeft / step)));
        dotBtns.forEach(function (b, i) {
          b.setAttribute('aria-current', String(i === idx));
        });
      }
      offers.addEventListener('scroll', function () {
        if (!dotTick) {
          dotTick = true;
          requestAnimationFrame(syncDots);
        }
      }, { passive: true });
      syncDots();
    }
  }
  document.addEventListener('keydown', function (e) {
    var lbOpen = $('.zq-lightbox.is-open');
    if (lbOpen) {
      if (e.key === 'Escape') lbOpen.querySelector('.zq-lb-close').click();
      if (e.key === 'ArrowRight') lbOpen.querySelector('.zq-lb-next').click();
      if (e.key === 'ArrowLeft') lbOpen.querySelector('.zq-lb-prev').click();
      return;
    }
    if (openSheet) {
      if (e.key === 'Escape') closeSheet(true);
      return;
    }
    var m = currentModal();
    if (m) {
      if (e.key === 'Escape') {
        var c = $('.modal-close', m);
        if (c) c.click();
      }
      if (e.key === 'ArrowRight') go(m, 'next');
      if (e.key === 'ArrowLeft') go(m, 'prev');
    }
  });
})();
