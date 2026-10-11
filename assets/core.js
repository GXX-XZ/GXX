/* ============================================================
   gxx的空间 · 内核：状态、存储、日期、图标、通用组件
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY = 'gxx.space.v1';
  var WEEK_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  /* ------------------------------------------------ 图标 */
  var ICONS = {
    today: 'M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z|M9.5 21v-6h5v6',
    habits: 'M12 21v-6.2|M12 14.8c0-3.2-2.2-5.4-5.6-5.4 0 3.2 2.2 5.4 5.6 5.4z|M12 14.8c0-3.2 2.2-5.4 5.6-5.4 0 3.2-2.2 5.4-5.6 5.4z',
    learn: 'M5 4.6A1.6 1.6 0 0 1 6.6 3H19v14.4H6.6A1.6 1.6 0 0 0 5 19z|M5 19v1.4h14',
    fitness: 'M3.6 9.5v5M6.8 7v10M17.2 7v10M20.4 9.5v5M6.8 12h10.4',
    work: 'M3.6 8.6h16.8V20H3.6z|M9 8.6V6.4A1.4 1.4 0 0 1 10.4 5h3.2A1.4 1.4 0 0 1 15 6.4v2.2|M3.6 13.4h16.8',
    news: 'M4 5.4h12.4V20H5.6A1.6 1.6 0 0 1 4 18.4z|M16.4 9.4h3.2v9a1.6 1.6 0 0 1-1.6 1.6h-1.6z|M6.8 9h6.6M6.8 12.4h6.6M6.8 15.8h4.4',
    media: 'M3.6 6.4h12V17.6h-12z|M15.6 10.6 20.4 7.6v8.8l-4.8-3z',
    mood: 'M12 3.6a8.4 8.4 0 1 0 0 16.8 8.4 8.4 0 0 0 0-16.8z|M9 10h.01M15 10h.01|M8.4 14.4a4.6 4.6 0 0 0 7.2 0',
    review: 'M12 21v-5.4|M12 3.6 6.4 12.6h11.2z|M12 9.2 8.4 15.4h7.2z',
    check: 'M5.5 12.5 10 17l8.5-10.5',
    plus: 'M12 5.5v13M5.5 12h13',
    minus: 'M5.5 12h13',
    trash: 'M5 7.2h14|M9.4 7.2V5.6a1 1 0 0 1 1-1h3.2a1 1 0 0 1 1 1v1.6|M7.2 7.2 8.1 20h7.8l.9-12.8',
    clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z|M12 7.6V12l3.2 2',
    play: 'M8.4 5.6 18 12l-9.6 6.4z',
    stop: 'M7.6 7.6h8.8v8.8H7.6z',
    calendar: 'M4 6.4h16V20H4z|M4 10.4h16|M8.4 3.6v4M15.6 3.6v4',
    left: 'M14 6.4 8.4 12 14 17.6',
    right: 'M10 6.4 15.6 12 10 17.6',
    refresh: 'M19.6 12a7.6 7.6 0 1 1-2.4-5.5|M19.6 4.6v5h-5',
    external: 'M14.4 4.4h5.2v5.2|M19.6 4.4 11.2 12.8|M17.6 14v4.4a1.2 1.2 0 0 1-1.2 1.2H5.6a1.2 1.2 0 0 1-1.2-1.2V7.6a1.2 1.2 0 0 1 1.2-1.2H10',
    close: 'M6.6 6.6 17.4 17.4M17.4 6.6 6.6 17.4',
    edit: 'M4.4 19.6h4l10-10-4-4-10 10z|M15.2 4.4l4 4',
    flame: 'M12 3.6c3.2 4 4.8 6.2 4.8 9a4.8 4.8 0 0 1-9.6 0c0-2.8 1.6-5 4.8-9z',
    copy: 'M9.2 9.2h10.4v10.4H9.2z|M4.4 15.2V4.4h10.8',
    search: 'M10.8 4.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8z|M15.6 15.6 20 20',
    star: 'M12 4.4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z',
    sparkle: 'M12 5.6l1.4 3.2 3.2 1.4-3.2 1.4L12 14.8l-1.4-3.2L7.4 10.2l3.2-1.4z|M18.4 15.2l.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7z',
    water: 'M12 3.6c3 4 5 6.4 5 9.4a5 5 0 0 1-10 0c0-3 2-5.4 5-9.4z',
    tv: 'M4 7.6h16v11.2H4z|M8.4 3.6 12 7.2l3.6-3.6',
    listen: 'M5.6 15.6v-3.2a6.4 6.4 0 0 1 12.8 0v3.2|M5.6 13.6h2.4v4.8H5.6z|M16 13.6h2.4v4.8H16z',
    bike: 'M6.4 17.6a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z|M17.6 17.6a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z|M6.4 14.4 10 7.6h4l3.6 6.8|M10 7.6 12 14.4',
    core: 'M12 4.4c2.4 2 3.6 4.6 3.6 7.6S14.4 19.6 12 19.6 8.4 15 8.4 12 9.6 6.4 12 4.4z|M12 9.6v6',
    chart: 'M4 19.6h16|M7.2 16.4V10M12 16.4V6.4M16.8 16.4v-4.4',
    link: 'M9.6 14.4 14.4 9.6|M13.2 6.8l1.6-1.6a3.6 3.6 0 0 1 5.1 5.1l-1.6 1.6|M10.8 17.2l-1.6 1.6a3.6 3.6 0 0 1-5.1-5.1l1.6-1.6',
    heart: 'M12 19.6C7.2 16.4 4.4 13.8 4.4 10.8A3.9 3.9 0 0 1 12 8.4a3.9 3.9 0 0 1 7.6 2.4c0 3-2.8 5.6-7.6 8.8z',
    list: 'M4.6 7h14.8M4.6 12h14.8M4.6 17h9.8',
    sun: 'M12 5.6a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8z|M12 1.8v2M12 20.2v2M1.8 12h2M20.2 12h2M4.8 4.8l1.4 1.4M17.8 17.8l1.4 1.4M19.2 4.8l-1.4 1.4M6.2 17.8l-1.4 1.4'
  };

  function icon(name, cls) {
    var d = ICONS[name] || ICONS.star;
    var parts = d.split('|');
    var body = '';
    for (var i = 0; i < parts.length; i++) {
      body += '<path d="' + parts[i] + '"/>';
    }
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + body + '</svg>';
  }

  /* ------------------------------------------------ 基础工具 */
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function sum(arr, fn) {
    var t = 0;
    for (var i = 0; i < arr.length; i++) t += fn ? (fn(arr[i]) || 0) : (arr[i] || 0);
    return t;
  }
  function uniqBy(arr, fn) {
    var seen = {}, out = [];
    for (var i = 0; i < arr.length; i++) {
      var k = fn(arr[i]);
      if (seen[k]) continue;
      seen[k] = 1;
      out.push(arr[i]);
    }
    return out;
  }

  /* ------------------------------------------------ 日期 */
  function key(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function today() { return key(new Date()); }
  function parse(k) {
    var p = String(k).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function shift(k, n) {
    var d = parse(k);
    d.setDate(d.getDate() + n);
    return key(d);
  }
  function diffDays(a, b) { return Math.round((parse(a) - parse(b)) / 86400000); }
  function weekStartKey(k) {
    var d = parse(k);
    var w = (d.getDay() + 6) % 7; // 周一为一周之始
    d.setDate(d.getDate() - w);
    return key(d);
  }
  function weekKey(k) {
    var d = parse(weekStartKey(k));
    var th = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3); // 该周周四
    var firstThu = new Date(th.getFullYear(), 0, 4);
    var fw = (firstThu.getDay() + 6) % 7;
    firstThu.setDate(firstThu.getDate() - fw + 3);
    var n = 1 + Math.round((th - firstThu) / (7 * 86400000));
    return th.getFullYear() + '-W' + pad2(n);
  }
  function weekDays(k) {
    var s = weekStartKey(k), out = [];
    for (var i = 0; i < 7; i++) out.push(shift(s, i));
    return out;
  }
  function monthKey(k) { return String(k).slice(0, 7); }
  function monthLabel(mk) {
    var p = mk.split('-');
    return p[0] + '年' + Number(p[1]) + '月';
  }
  function monthStart(mk) { return mk + '-01'; }
  function monthEnd(mk) {
    var p = mk.split('-');
    var d = new Date(Number(p[0]), Number(p[1]), 0);
    return mk + '-' + pad2(d.getDate());
  }
  function daysInMonth(mk) { return Number(monthEnd(mk).slice(-2)); }
  function daysInMonthUpToToday(mk) {
    var t = today();
    if (monthKey(t) < mk) return 0;
    if (monthKey(t) > mk) return daysInMonth(mk);
    return Number(t.slice(-2));
  }
  function monthDaysList(mk) {
    var out = [], n = daysInMonth(mk);
    for (var i = 1; i <= n; i++) out.push(mk + '-' + pad2(i));
    return out;
  }
  function inMonth(k, mk) { return String(k).slice(0, 7) === mk; }
  function fmtMD(k) {
    var p = String(k).split('-');
    return Number(p[1]) + '月' + Number(p[2]) + '日';
  }
  function weekday(k) { return WEEK_CN[parse(k).getDay()]; }
  function fmtCN(k) { return fmtMD(k) + ' ' + weekday(k); }
  function relDay(k) {
    var d = diffDays(k, today());
    if (d === 0) return '今天';
    if (d === 1) return '明天';
    if (d === -1) return '昨天';
    if (d === -2) return '前天';
    if (d < 0) return fmtMD(k);
    return fmtMD(k);
  }
  function nowHM() {
    var d = new Date();
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function lastNDays(n, endKey) {
    var e = endKey || today(), out = [];
    for (var i = n - 1; i >= 0; i--) out.push(shift(e, -i));
    return out;
  }

  /* ------------------------------------------------ 连续天数 */
  function streak(daysObj, endKey, refKey) {
    var t = refKey || today();
    var cursor = (daysObj[t] ? t : shift(t, -1));
    var n = 0;
    while (daysObj[cursor]) { n++; cursor = shift(cursor, -1); }
    return n;
  }
  function longestStreak(daysObj) {
    var ks = Object.keys(daysObj).filter(function (k) { return daysObj[k]; }).sort();
    var best = 0, cur = 0, prev = null;
    for (var i = 0; i < ks.length; i++) {
      cur = (prev && diffDays(ks[i], prev) === 1) ? cur + 1 : 1;
      if (cur > best) best = cur;
      prev = ks[i];
    }
    return best;
  }
  function dayCount(daysObj, keys) {
    var n = 0;
    for (var i = 0; i < keys.length; i++) if (daysObj[keys[i]]) n++;
    return n;
  }

  /* ------------------------------------------------ 状态 */
  function defaults() {
    return {
      version: 1,
      habits: {
        water: {},
        tvb: {},
        listen: [],
        timerStart: 0,
        blog: { posts: {}, stage: '', progress: 0, next: '', goal: 4 }
      },
      learn: {
        order: ['listen', 'speak', 'express'],
        tracks: {
          listen: { name: '英语听力', icon: 'listen', stage: '', progress: 0, next: '', log: [], note: '' },
          speak: { name: '英语口语', icon: 'media', stage: '', progress: 0, next: '', log: [], note: '' },
          express: { name: '表达训练', icon: 'star', stage: '', progress: 0, next: '', log: [], note: '' }
        }
      },
      fitness: {
        targets: { strength: 3, bike: 3, core: 5 },
        log: []
      },
      work: { tasks: [] },
      media: { topics: [], analyses: [] },
      mood: { entries: [] },
      review: { months: {} },
      settings: {
        lastVisit: '',
        fontScale: 1,
        theme: 'pink',
        reminder: { morning: '07:30', evening: '17:10', ack: {} },
        sync: false,
        apiBase: '',
        lastSyncAt: '',
        lastSyncNote: ''
      }
    };
  }
  function merge(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(base).forEach(function (k) {
      var b = base[k], s = saved[k];
      if (s === undefined || s === null) return;
      if (Array.isArray(b)) { if (Array.isArray(s)) base[k] = s; return; }
      if (typeof b === 'object') { base[k] = merge(b, s); return; }
      if (typeof s === typeof b) base[k] = s;
    });
    return base;
  }

  var state = defaults();
  var storageOK = true;
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) state = merge(defaults(), JSON.parse(raw));
  } catch (e) { storageOK = false; }

  var saveTimer = null, flashTimer = null;
  var suppressSync = false;
  function save() {
    var node = document.getElementById('saveState');
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      if (node) {
        node.textContent = '已保存 ' + nowHM();
        node.classList.add('flash');
        clearTimeout(flashTimer);
        flashTimer = setTimeout(function () {
          node.classList.remove('flash');
          node.textContent = '已保存';
        }, 1800);
      }
    } catch (e) {
      storageOK = false;
      if (node) node.textContent = '未能保存';
    }
    if (!suppressSync) syncSoon();
  }
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 260);
  }

  /* ------------------------------------------------ 外观主题 */
  var THEMES = [
    { id: 'pink', name: '樱花粉', colors: ['#fff8fb', '#f2709c', '#ffa8c8'], themeColor: '#ffe3ee' },
    { id: 'peach', name: '蜜桃橘', colors: ['#fff9f4', '#f2865c', '#ffb48f'], themeColor: '#ffe8dc' },
    { id: 'mint', name: '薄荷绿', colors: ['#f7fffb', '#4fb489', '#8ed9b7'], themeColor: '#e4f5ec' },
    { id: 'blue', name: '雾霾蓝', colors: ['#f7fbff', '#5f8fd8', '#9dbde9'], themeColor: '#e7f0fc' },
    { id: 'lavender', name: '薰衣草', colors: ['#fbf9ff', '#9a7fd4', '#bfa8e8'], themeColor: '#efe8fc' },
    { id: 'latte', name: '燕麦奶咖', colors: ['#fdfaf6', '#b9865a', '#d9b48d'], themeColor: '#f5ece0' }
  ];
  var FONT_STEPS = [
    { v: 0.9, name: '小' },
    { v: 1, name: '标准' },
    { v: 1.12, name: '大' },
    { v: 1.26, name: '更大' },
    { v: 1.42, name: '特大' }
  ];
  function themeInfo(id) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
    return THEMES[0];
  }
  function applyAppearance() {
    var s = state.settings || {};
    var fs = Number(s.fontScale) || 1;
    document.documentElement.style.setProperty('--fs', String(fs));
    document.documentElement.setAttribute('data-theme', s.theme || 'pink');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', themeInfo(s.theme).themeColor);
  }

  /* ------------------------------------------------ 电脑端服务接口 */
  function apiBase() {
    var s = state.settings || {};
    if (s.apiBase) return String(s.apiBase).replace(/\/+$/, '');
    if (/^https?:$/.test(location.protocol)) return location.origin;
    return 'http://127.0.0.1:8080';
  }
  function api(path, opt) {
    opt = opt || {};
    var url = apiBase() + path;
    var timeout = opt.timeout || 6000;
    var ctl = null, timer = null;
    var init = { method: opt.method || 'GET', cache: 'no-store' };
    if (opt.body !== undefined) {
      init.method = opt.method || 'POST';
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(opt.body);
    }
    if (typeof AbortController === 'function') {
      ctl = new AbortController();
      init.signal = ctl.signal;
      timer = setTimeout(function () { ctl.abort(); }, timeout);
    }
    return fetch(url, init).then(function (r) {
      if (!r.ok) throw new Error('服务返回 ' + r.status);
      return r.json();
    }).then(function (data) {
      if (timer) clearTimeout(timer);
      return data;
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }
  var syncTimer = null;
  function syncToPc(manual) {
    var s = state.settings || {};
    if (!s.sync && !manual) return;
    return api('/api/save', { body: state, timeout: 12000 }).then(function (res) {
      s.lastSyncAt = nowHM();
      s.lastSyncNote = '';
      suppressSync = true; save(); suppressSync = false;
      if (manual) toast('已保存到电脑：' + (res.file || ''));
      return res;
    }, function (err) {
      s.lastSyncNote = String(err && err.message || err);
      if (manual) toast('保存到电脑失败：' + s.lastSyncNote);
      suppressSync = true; save(); suppressSync = false;
      throw err;
    });
  }
  function syncSoon() {
    var s = state.settings || {};
    if (!s.sync) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { syncToPc(false).catch(function () { }); }, 2500);
  }

  applyAppearance();
  function resetAll() {
    var d = defaults();
    Object.keys(state).forEach(function (k) { delete state[k]; });
    Object.keys(d).forEach(function (k) { state[k] = d[k]; });
    save();
  }

  /* ------------------------------------------------ 弹层 / 提示 */
  var toastTimer = null;
  function toast(msg) {
    var n = document.getElementById('toast');
    if (!n) return;
    n.textContent = msg;
    n.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { n.hidden = true; }, 1900);
  }
  var sheetOnClose = null;
  function sheet(opt) {
    var host = document.getElementById('modalHost');
    if (!host) return;
    host.hidden = false;
    host.innerHTML =
      '<div class="sheet" role="dialog">' +
        '<div class="sheet-head">' +
          '<h3>' + esc(opt.title || '') + '</h3>' +
          '<button class="icon-btn sm" data-sheet-close aria-label="关闭">' + icon('close') + '</button>' +
        '</div>' +
        '<div class="sheet-body">' + (opt.html || '') + '</div>' +
      '</div>';
    sheetOnClose = opt.onClose || null;
    host.onclick = function (e) {
      if (e.target === host || (e.target.closest && e.target.closest('[data-sheet-close]'))) closeSheet();
    };
    if (typeof opt.onMount === 'function') opt.onMount(host.querySelector('.sheet'));
    var f = host.querySelector('input,textarea,select');
    if (f && !opt.noFocus && window.matchMedia('(min-width: 640px)').matches) f.focus();
  }
  function closeSheet() {
    var host = document.getElementById('modalHost');
    if (!host) return;
    host.hidden = true;
    host.innerHTML = '';
    host.onclick = null;
    if (sheetOnClose) { var f = sheetOnClose; sheetOnClose = null; f(); }
  }
  function confirmBox(message, okText) {
    return new Promise(function (resolve) {
      sheet({
        title: '确认一下',
        html: '<p class="small ink2" style="margin-bottom:14px">' + esc(message) + '</p>' +
          '<div class="row"><button class="btn danger grow" data-cf="1">' + esc(okText || '确定') + '</button>' +
          '<button class="btn line grow" data-cf="0">取消</button></div>',
        onMount: function (root) {
          root.addEventListener('click', function (e) {
            var b = e.target.closest('[data-cf]');
            if (!b) return;
            closeSheet();
            resolve(b.getAttribute('data-cf') === '1');
          });
        },
        onClose: function () { resolve(false); }
      });
    });
  }

  /* ------------------------------------------------ 小组件 */
  function bar(pct, tone, extra) {
    var p = clamp(Number(pct) || 0, 0, 100);
    return '<div class="bar ' + (tone || '') + ' ' + (extra || '') + '"><i style="width:' + p.toFixed(1) + '%"></i></div>';
  }
  function ring(pct, size) {
    var p = clamp(Number(pct) || 0, 0, 100);
    var r = 26, c = 2 * Math.PI * r;
    return '<div class="ring" style="width:' + (size || 64) + 'px;height:' + (size || 64) + 'px">' +
      '<svg width="' + (size || 64) + '" height="' + (size || 64) + '" viewBox="0 0 64 64">' +
        '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="var(--track)" stroke-width="7"/>' +
        '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="url(#gxxRing)" stroke-width="7" stroke-linecap="round" ' +
          'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - p / 100)).toFixed(1) + '"/>' +
        '<defs><linearGradient id="gxxRing" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#ffa8c8"/><stop offset="100%" stop-color="#e0517f"/>' +
        '</linearGradient></defs>' +
      '</svg><span class="ring-val">' + Math.round(p) + '%</span></div>';
  }
  function checkBox(on, act, extra, attrs) {
    return '<button class="check ' + (on ? 'on' : '') + ' ' + (extra || '') + '" data-act="' + act + '"' +
      (attrs ? ' ' + attrs : '') + '>' + icon('check') + '</button>';
  }
  function emptyBox(text) { return '<div class="empty">' + esc(text) + '</div>'; }
  function statBox(k, v, unit) {
    return '<div class="stat"><span class="stat-k">' + esc(k) + '</span><span class="stat-v">' + esc(v) +
      (unit ? '<small>' + esc(unit) + '</small>' : '') + '</span></div>';
  }
  function mmss(sec) {
    sec = Math.max(0, Math.round(sec));
    return pad2(Math.floor(sec / 60)) + ':' + pad2(sec % 60);
  }
  function dayDots(keys, daysObj, todayKey, act) {
    return '<div class="dots">' + keys.map(function (k) {
      var on = !!daysObj[k];
      var cls = 'dot' + (on ? ' on' : '') + (k === (todayKey || today()) ? ' today' : '');
      var label = k.slice(-2);
      return act
        ? '<button class="' + cls + '" data-act="' + act + '" data-day="' + k + '">' + label + '</button>'
        : '<span class="' + cls + '">' + label + '</span>';
    }).join('') + '</div>';
  }
  function heat(days, daysObj) {
    return '<div class="heat">' + days.map(function (k) {
      return '<i class="' + (daysObj[k] ? 'on' : '') + '" title="' + k + '"></i>';
    }).join('') + '</div>';
  }
  function openLink(url) {
    window.open(url, '_blank', 'noopener');
  }

  /* ------------------------------------------------ 视图注册 */
  var views = [], byId = {};
  function register(id, def) {
    def.id = id;
    views.push(def);
    byId[id] = def;
  }

  window.GXX = {
    STORE_KEY: STORE_KEY,
    state: state,
    defaults: defaults,
    storageOK: storageOK,
    save: save,
    saveSoon: saveSoon,
    resetAll: resetAll,
    applyAppearance: applyAppearance,
    THEMES: THEMES,
    FONT_STEPS: FONT_STEPS,
    themeInfo: themeInfo,
    api: api,
    apiBase: apiBase,
    syncToPc: syncToPc,
    syncSoon: syncSoon,
    icon: icon,
    esc: esc,
    uid: uid,
    pad2: pad2,
    clamp: clamp,
    sum: sum,
    uniqBy: uniqBy,
    key: key,
    today: today,
    parse: parse,
    shift: shift,
    diffDays: diffDays,
    weekKey: weekKey,
    weekStartKey: weekStartKey,
    weekDays: weekDays,
    monthKey: monthKey,
    monthLabel: monthLabel,
    monthStart: monthStart,
    monthEnd: monthEnd,
    daysInMonth: daysInMonth,
    daysInMonthUpToToday: daysInMonthUpToToday,
    monthDaysList: monthDaysList,
    inMonth: inMonth,
    fmtMD: fmtMD,
    fmtCN: fmtCN,
    weekday: weekday,
    relDay: relDay,
    nowHM: nowHM,
    lastNDays: lastNDays,
    streak: streak,
    longestStreak: longestStreak,
    dayCount: dayCount,
    toast: toast,
    sheet: sheet,
    closeSheet: closeSheet,
    confirmBox: confirmBox,
    bar: bar,
    ring: ring,
    checkBox: checkBox,
    emptyBox: emptyBox,
    statBox: statBox,
    mmss: mmss,
    dayDots: dayDots,
    heat: heat,
    openLink: openLink,
    register: register,
    views: views,
    byId: byId
  };
})();
