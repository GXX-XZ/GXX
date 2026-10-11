/* ============================================================
   模块：新闻热点（央视新闻 / 人民网 / 新华网）
   数据由电脑上的抓取脚本生成，页面按日期轮换展示
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;
  var SRC = [
    { id: 'all', label: '全部' },
    { id: 'CCTV', label: '央视新闻' },
    { id: 'PEOPLE', label: '人民网' },
    { id: 'XINHUA', label: '新华网' }
  ];
  var FALLBACK = [
    { name: '央视新闻', url: 'https://news.cctv.com/', tip: '要闻 · 国内 · 国际' },
    { name: '央视新闻 · 热点', url: 'https://news.cctv.com/china/', tip: '国内频道' },
    { name: '人民网', url: 'http://www.people.com.cn/', tip: '时政 · 社会 · 经济' },
    { name: '人民网 · 经济', url: 'http://finance.people.com.cn/', tip: '财经频道' },
    { name: '新华网', url: 'https://www.news.cn/', tip: '要闻' },
    { name: '新华网 · 时政', url: 'https://www.news.cn/politics/', tip: '时政频道' }
  ];
  var state = { src: 'all', batch: 0, shown: 24 };

  function srcName(s) {
    return { CCTV: '央视新闻', PEOPLE: '人民网', XINHUA: '新华网' }[s] || s;
  }
  function srcCls(s) {
    return { CCTV: 'src-cctv', PEOPLE: 'src-people', XINHUA: 'src-xinhua' }[s] || '';
  }
  function payload() { return window.GXX_NEWS || null; }

  function rnd(seedStr) {
    var h = 2166136261;
    for (var i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6d2b79f5;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, seed) {
    var r = rnd(seed), a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function rotated() {
    var data = payload();
    if (!data || !data.items) return [];
    var items = data.items.filter(function (x) {
      return state.src === 'all' || x.source === state.src;
    });
    var seedBase = G.today() + '#' + state.batch;
    var groups = {};
    items.forEach(function (x) {
      if (!groups[x.source]) groups[x.source] = [];
      groups[x.source].push(x);
    });
    var order = ['CCTV', 'PEOPLE', 'XINHUA'];
    order.forEach(function (s) {
      if (groups[s]) groups[s] = shuffle(groups[s], seedBase + s);
    });
    var out = [], i = 0;
    while (out.length < items.length && i < 200) {
      var added = false;
      order.forEach(function (s) {
        if (groups[s] && groups[s][i]) { out.push(groups[s][i]); added = true; }
      });
      if (!added) break;
      i++;
    }
    return out;
  }

  function newsCard(it) {
    return '<a class="news-item" href="' + G.esc(it.url) + '" target="_blank" rel="noopener">' +
      '<div class="news-body">' +
        '<div class="news-title">' + G.esc(it.title) + '</div>' +
        (it.summary ? '<div class="news-summary clamp2">' + G.esc(it.summary) + '</div>' : '') +
        '<div class="news-meta">' +
          '<span class="tag ' + srcCls(it.source) + '">' + srcName(it.source) + '</span>' +
          '<span>' + G.esc(it.time) + '</span>' +
          (it.channel ? '<span class="muted">' + G.esc(channelName(it.channel)) + '</span>' : '') +
          '<span class="accent-text">' + G.icon('external') + '</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  }
  function channelName(c) {
    var m = {
      'CCTV-NEWS': '要闻', 'CCTV-CHINA': '国内',
      'PEOPLE-HOME': '人民网首页', 'PEOPLE-FINANCE': '经济', 'PEOPLE-SOCIETY': '社会', 'PEOPLE-WORLD': '国际',
      'XINHUA-TOP': '要闻', 'XINHUA-TECH': '科技', 'XINHUA-HEALTH': '健康', 'XINHUA-SPORTS': '体育'
    };
    return m[c] || '';
  }

  function staleHint(data) {
    if (!data || !data.generatedAt) return '';
    var t = Date.parse(String(data.generatedAt).replace(' ', 'T'));
    if (!t) return '';
    var days = Math.floor((Date.now() - t) / 86400000);
    if (days < 2) return '';
    return '<div class="sticky-note info" style="margin-bottom:12px">这份热点是 ' + days + ' 天前抓的（' +
      G.esc(data.generatedAt) + '）。在电脑上运行一次 <b>tools\\refresh-news.ps1</b>（或设置页里的「让电脑抓一次热点」），' +
      '再把新数据放到你放工作台的地方，手机上就是新的了。</div>';
  }

  function fallbackCard() {
    return '<div class="card">' +
      '<div class="card-head">' + G.icon('link') +
        '<div class="grow"><div class="card-title">权威媒体直达</div>' +
        '<div class="card-sub">暂时没有抓到热点数据，先点下面的入口看原文</div></div>' +
      '</div>' +
      '<div class="list">' + FALLBACK.map(function (f) {
        return '<a class="item plain" href="' + f.url + '" target="_blank" rel="noopener">' +
          '<div class="grow"><div class="item-title">' + f.name + '</div>' +
          '<div class="item-sub">' + f.tip + '</div></div>' + G.icon('external') + '</a>';
      }).join('') + '</div>' +
      '<p class="hint" style="margin-top:11px">在电脑上运行 <b>tools/refresh-news.ps1</b> 就会把当天热点抓下来，页面会自动读到。</p>' +
    '</div>';
  }

  G.register('news', {
    title: '新闻热点',
    nav: '热点',
    icon: 'news',
    sub: function () {
      var d = payload();
      if (!d) return '还没有数据';
      return '更新于 ' + d.generatedAt + ' · 共 ' + d.total + ' 条';
    },
    actions: {
      'news-src': function (el) {
        state.src = el.getAttribute('data-src');
        state.shown = 24;
      },
      'news-shuffle': function () {
        state.batch++;
        G.toast('换了一批');
      },
      'news-more': function () {
        state.shown += 24;
      }
    },
    render: function (root) {
      var data = payload();
      if (!data || !data.items || !data.items.length) {
        root.innerHTML = fallbackCard();
        return;
      }
      var all = rotated();
      var shown = all.slice(0, state.shown);
      var status = (data.status || []).map(function (s) {
        return '<span class="tag ' + (s.ok ? 'ok' : 'danger') + '">' + srcName(s.source) + ' ' + s.count + '</span>';
      }).join(' ');
      var rows = shown.map(function (it) {
        return '<div style="margin-bottom:9px">' + newsCard(it) + '</div>';
      }).join('');

      root.innerHTML =
        '<div class="card">' +
          '<div class="card-head">' + G.icon('news') +
            '<div class="grow"><div class="card-title">今日热点</div>' +
            '<div class="card-sub">抓取时间：' + G.esc(data.generatedAt) + ' · 每天自动换一批</div></div>' +
            '<button class="btn sm soft" data-act="news-shuffle">' + G.icon('refresh') + '换一批</button>' +
          '</div>' +
          '<div class="row" style="margin-bottom:9px">' + status + '</div>' +
          '<div class="tabs">' + SRC.map(function (s) {
            return '<button class="tab ' + (state.src === s.id ? 'on' : '') + '" data-act="news-src" data-src="' + s.id + '">' + s.label + '</button>';
          }).join('') + '</div>' +
          '<p class="hint">点标题直接打开来源网站原文。每过一天顺序会自动变一次，「换一批」可以立刻再抽一轮。</p>' +
        '</div>' +
        staleHint(data) +
        rows +
        (all.length > state.shown
          ? '<button class="btn block line" data-act="news-more">还有 ' + (all.length - state.shown) + ' 条，展开看看</button>'
          : '<div class="card flat"><p class="hint">今天的 ' + all.length + ' 条都在这了。</p></div>');
    }
  });
})();
