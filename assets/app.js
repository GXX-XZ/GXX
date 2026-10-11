/* ============================================================
   gxx的空间 · 外壳：导航、路由、事件分发
   ============================================================ */
(function () {
  'use strict';

  var G = window.GXX;
  var viewEl = document.getElementById('view');
  var navEl = document.getElementById('nav');
  var titleEl = document.getElementById('viewTitle');
  var subEl = document.getElementById('viewSub');
  var currentId = null;

  function current() { return G.byId[currentId]; }

  function buildNav() {
    var html = '';
    G.views.forEach(function (v) {
      html += '<button class="nav-item" data-go="' + v.id + '">' +
        G.icon(v.icon || 'star') +
        '<span>' + G.esc(v.nav || v.title) + '</span>' +
        '<span class="nav-badge" data-badge="' + v.id + '" hidden></span>' +
        '</button>';
    });
    navEl.innerHTML = html;
  }

  function paintNav() {
    var items = navEl.querySelectorAll('[data-go]');
    for (var i = 0; i < items.length; i++) {
      var id = items[i].getAttribute('data-go');
      if (id === currentId) items[i].classList.add('on');
      else items[i].classList.remove('on');
      var b = items[i].querySelector('[data-badge]');
      var def = G.byId[id];
      var txt = '';
      if (def && typeof def.badge === 'function') {
        try { txt = def.badge() || ''; } catch (e) { txt = ''; }
      }
      if (b) {
        if (txt) { b.textContent = txt; b.hidden = false; }
        else { b.hidden = true; }
      }
    }
  }

  function render() {
    var def = current();
    if (!def) return;
    titleEl.textContent = def.title;
    try {
      subEl.textContent = typeof def.sub === 'function' ? def.sub() : (def.sub || '');
    } catch (e) { subEl.textContent = ''; }
    viewEl.innerHTML = '';
    try {
      def.render(viewEl);
    } catch (err) {
      viewEl.innerHTML = '<div class="card"><p class="small danger-text">这个模块渲染出错了：' + G.esc(err && err.message) + '</p></div>';
      if (window.console && console.error) {
        console.error('[view ' + def.id + '] ' + (err && err.stack ? err.stack : err));
      }
    }
    paintNav();
  }

  function go(id) {
    if (!G.byId[id]) id = G.views[0].id;
    if (location.hash.slice(1) === id) {
      currentId = id;
      render();
    } else {
      location.hash = '#' + id;
    }
  }

  function readHash() {
    var id = location.hash.slice(1);
    currentId = G.byId[id] ? id : G.views[0].id;
    render();
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------ 事件分发 */
  function dispatch(el, attr, map, ev) {
    var name = el.getAttribute(attr);
    var fn = map && map[name];
    if (typeof fn !== 'function') return;
    var out = fn(el, ev, { render: render, root: viewEl });
    if (out !== false) render();
  }

  viewEl.addEventListener('click', function (e) {
    var goEl = e.target.closest('[data-go]');
    if (goEl) { go(goEl.getAttribute('data-go')); return; }
    var def = current();
    var el = e.target.closest('[data-act]');
    if (el && def) dispatch(el, 'data-act', def.actions, e);
  });
  viewEl.addEventListener('change', function (e) {
    var def = current();
    var el = e.target.closest('[data-chg]');
    if (el && def) dispatch(el, 'data-chg', def.changes, e);
  });
  viewEl.addEventListener('input', function (e) {
    var def = current();
    var el = e.target.closest('[data-inp]');
    if (el && def) dispatch(el, 'data-inp', def.inputs, e);
  });

  navEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (b) go(b.getAttribute('data-go'));
  });

  window.addEventListener('hashchange', readHash);

  /* ------------------------------------------------ 启动 */
  var railDate = document.getElementById('railDate');
  function paintDate() {
    var t = G.today();
    var parts = t.split('-');
    if (railDate) railDate.innerHTML = parts[1] + '月<br>' + Number(parts[2]) + '日<br>' + G.weekday(t).slice(1);
  }

  // 跨天或回到前台时自动刷新，保证「今天」始终是今天
  var lastDay = G.today();
  function tick() {
    var t = G.today();
    if (t !== lastDay) {
      lastDay = t;
      paintDate();
      render();
    }
  }
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { tick(); paintDate(); render(); }
  });

  buildNav();
  paintDate();
  readHash();

  G.go = go;
  G.render = render;

  if (!G.storageOK) {
    G.toast('浏览器不允许本地存储，记录可能无法保存');
  }

  // 离线缓存：只有通过 http/https 打开（比如手机访问或放到网上）时才注册
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { });
    });
  }
})();
