/* ============================================================
   模块：每月复盘（树木成长 · 计划 vs 实际）
   - 严格按自然月分区，新月份自动生成空白模板
   - 完成度越高，小树长得越好
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;

  var DEFAULT_ITEMS = [
    { key: 'water', name: '晨起温开水', unit: '天', plan: '', actual: '' },
    { key: 'tvb', name: '粤语 · TVB 观看', unit: '次', plan: '', actual: '' },
    { key: 'listen', name: '粤语 · 每日收听 ≥3 分钟', unit: '天', plan: '', actual: '' },
    { key: 'blog', name: '博客写作', unit: '篇', plan: '', actual: '' },
    { key: 'learn-listen', name: '英语听力练习', unit: '次', plan: '', actual: '' },
    { key: 'learn-speak', name: '英语口语练习', unit: '次', plan: '', actual: '' },
    { key: 'learn-express', name: '表达训练', unit: '次', plan: '', actual: '' },
    { key: 'fit-strength', name: '力量训练', unit: '次', plan: '', actual: '' },
    { key: 'fit-bike', name: '骑车', unit: '次', plan: '', actual: '' },
    { key: 'fit-core', name: '腹部训练', unit: '次', plan: '', actual: '' },
    { key: 'work', name: '工作待办完成', unit: '条', plan: '', actual: '' },
    { key: 'mood', name: '心情日记', unit: '天', plan: '', actual: '' },
    { key: 'media', name: '爆款拆解', unit: '条', plan: '', actual: '' }
  ];

  var cursor = null; // 当前查看的月份

  function R() { return G.state.review; }
  function months() { return R().months; }
  function save() { G.save(); }

  function mondayCount(mk) {
    var n = 0, days = G.monthDaysList(mk);
    days.forEach(function (d) { if (G.parse(d).getDay() === 1) n++; });
    return n || 1;
  }
  function ensure(mk) {
    var m = months()[mk];
    if (!m) {
      m = {
        createdAt: Date.now(),
        note: '',
        items: DEFAULT_ITEMS.map(function (it) {
          return { id: G.uid('rv'), key: it.key, name: it.name, unit: it.unit, plan: '', actual: '' };
        })
      };
      months()[mk] = m;
      save();
    }
    if (!m.items) m.items = [];
    return m;
  }

  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function ratioOf(it) {
    var plan = num(it.plan), actual = num(it.actual);
    if (plan > 0) return Math.min(actual / plan, 1);
    if (plan <= 0 && actual > 0) return 1;
    return null;
  }
  function overall(m) {
    var rs = m.items.map(ratioOf).filter(function (r) { return r !== null; });
    if (!rs.length) return 0;
    return G.sum(rs, function (r) { return r; }) / rs.length;
  }

  function autoValues(mk) {
    var h = G.state.habits;
    var days = G.monthDaysList(mk);
    var elapsed = G.daysInMonthUpToToday(mk);
    var weeks = mondayCount(mk);
    var out = {};
    out['water'] = { actual: G.dayCount(h.water, days), plan: elapsed };
    var tvbCount = 0;
    days.forEach(function (d) { if (G.parse(d).getDay() === 1) tvbCount += (h.tvb[G.weekKey(d)] || 0); });
    out['tvb'] = { actual: tvbCount, plan: weeks };
    var listenDays = {};
    h.listen.forEach(function (s) { if (s.sec >= 180 && G.inMonth(s.day, mk)) listenDays[s.day] = true; });
    out['listen'] = { actual: Object.keys(listenDays).length, plan: elapsed };
    out['blog'] = { actual: Object.keys(h.blog.posts).filter(function (k) { return G.inMonth(k, mk); }).length, plan: h.blog.goal || 4 };
    ['listen', 'speak', 'express'].forEach(function (id) {
      var tr = G.state.learn.tracks[id];
      out['learn-' + id] = {
        actual: tr.log.filter(function (x) { return G.inMonth(x.day, mk); }).length,
        plan: elapsed
      };
    });
    ['strength', 'bike', 'core'].forEach(function (k) {
      out['fit-' + k] = {
        actual: G.state.fitness.log.filter(function (s) { return s.kind === k && G.inMonth(s.day, mk); }).length,
        plan: weeks * (G.state.fitness.targets[k] || 1)
      };
    });
    var created = G.state.work.tasks.filter(function (x) { return G.inMonth(x.createdAt || '', mk); }).length;
    out['work'] = {
      actual: G.state.work.tasks.filter(function (x) { return x.done && G.inMonth(x.doneAt || '', mk); }).length,
      plan: created
    };
    var moodDays = {};
    G.state.mood.entries.forEach(function (x) { if (G.inMonth(x.day, mk)) moodDays[x.day] = true; });
    out['mood'] = { actual: Object.keys(moodDays).length, plan: elapsed };
    out['media'] = { actual: G.state.media.analyses.filter(function (a) { return G.inMonth(a.day, mk); }).length, plan: weeks };
    return out;
  }

  /* ------------------------------------------------ 小树 */
  var SPOTS = (function () {
    var seed = 20260101, spots = [];
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var i = 0; i < 30; i++) {
      spots.push({ a: i * 2.399963, rad: Math.sqrt((i + 0.6) / 30) * (0.8 + rnd() * 0.4), rot: rnd() * 360, t: rnd() });
    }
    return spots;
  })();
  var FLOWER_SPOTS = [
    { x: -26, y: -14 }, { x: 22, y: -22 }, { x: 4, y: -40 }, { x: -12, y: -4 },
    { x: 30, y: 6 }, { x: -32, y: 10 }
  ];

  function treeSVG(p) {
    var groundY = 188, cx = 110;
    var trunkH = 40 + 74 * p;
    var trunkW = 7 + 6 * p;
    var topY = groundY - trunkH;
    var cy = topY - 22 - 8 * p;
    var rx = 48 + 20 * p, ry = 36 + 14 * p;
    var leaves = Math.round(SPOTS.length * p);
    var flowers = p >= 0.8 ? Math.min(FLOWER_SPOTS.length, Math.floor((p - 0.8) / 0.2 * FLOWER_SPOTS.length) + 1) : 0;

    var leafSvg = '';
    for (var i = 0; i < SPOTS.length; i++) {
      var s = SPOTS[i], a = s.a, rad = s.rad;
      var x = cx + Math.cos(a) * rx * rad;
      var y = cy + Math.sin(a) * ry * rad * (Math.sin(a) > 0 ? 0.82 : 1);
      var on = i < leaves;
      var col = s.t > 0.62 ? '#ff9dbf' : (s.t > 0.3 ? '#ffb7d0' : '#8ecfa4');
      leafSvg += '<ellipse class="leaf" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) +
        '" rx="' + (8.6 + s.t * 2).toFixed(1) + '" ry="5.6" fill="' + col +
        '" transform="rotate(' + s.rot.toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" data-leaf="' + i + '"/>';
    }
    var flowerSvg = '';
    for (var f = 0; f < FLOWER_SPOTS.length; f++) {
      var sp = FLOWER_SPOTS[f];
      var fx = cx + sp.x * (0.75 + 0.35 * p), fy = cy + sp.y * (0.75 + 0.35 * p);
      flowerSvg += '<g class="leaf flower" data-flower="' + f + '" transform="translate(' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ')">' +
        '<circle r="4.4" fill="#fff0f6"/><circle r="2.1" fill="#f2709c"/></g>';
    }
    void leaves; void flowers;

    return '<svg viewBox="0 0 220 200" role="img" aria-label="本月成长小树">' +
      '<g class="tree-sway">' +
        '<ellipse cx="110" cy="190" rx="58" ry="7" fill="var(--track)"/>' +
        '<g class="tree-trunk">' +
          '<path d="M' + (cx - trunkW / 2) + ' ' + groundY + ' L' + (cx - trunkW / 2.6) + ' ' + topY.toFixed(1) +
            ' L' + (cx + trunkW / 2.6) + ' ' + topY.toFixed(1) + ' L' + (cx + trunkW / 2) + ' ' + groundY + ' Z" fill="#c69a8b"/>' +
          (p > 0.2 ? '<path d="M' + cx + ' ' + (topY + trunkH * 0.35).toFixed(1) + ' L' + (cx - 30 - 12 * p).toFixed(1) + ' ' + (topY + trunkH * 0.16).toFixed(1) + '" stroke="#c69a8b" stroke-width="' + (3 + 2 * p).toFixed(1) + '" stroke-linecap="round" fill="none"/>' : '') +
          (p > 0.45 ? '<path d="M' + cx + ' ' + (topY + trunkH * 0.52).toFixed(1) + ' L' + (cx + 30 + 12 * p).toFixed(1) + ' ' + (topY + trunkH * 0.3).toFixed(1) + '" stroke="#c69a8b" stroke-width="' + (3 + 2 * p).toFixed(1) + '" stroke-linecap="round" fill="none"/>' : '') +
        '</g>' +
        '<g class="tree-young">' +
          '<ellipse cx="' + (cx - 9) + '" cy="' + (groundY - 46) + '" rx="8" ry="5.4" fill="#8ecfa4" transform="rotate(-24 ' + (cx - 9) + ' ' + (groundY - 46) + ')"/>' +
          '<ellipse cx="' + (cx + 9) + '" cy="' + (groundY - 46) + '" rx="8" ry="5.4" fill="#ffb7d0" transform="rotate(24 ' + (cx + 9) + ' ' + (groundY - 46) + ')"/>' +
        '</g>' +
        leafSvg + flowerSvg +
      '</g>' +
    '</svg>';
  }
  function stageText(p) {
    if (p <= 0.001) return '刚发芽，先动起来';
    if (p < 0.3) return '小树苗，正在长';
    if (p < 0.6) return '长到一半啦';
    if (p < 0.85) return '枝繁叶茂，很稳';
    if (p < 1) return '快满月了，再冲一把';
    return '开花结果，这个月漂亮';
  }

  function rowHtml(it) {
    var r = ratioOf(it);
    return '<div class="review-row">' +
      '<input class="input rv-name" value="' + G.esc(it.name) + '" data-chg="rv-name" data-id="' + G.esc(it.id) + '">' +
      '<input class="input" type="number" min="0" value="' + G.esc(it.plan) + '" placeholder="计划" data-chg="rv-plan" data-id="' + G.esc(it.id) + '">' +
      '<input class="input" type="number" min="0" value="' + G.esc(it.actual) + '" placeholder="实际" data-chg="rv-actual" data-id="' + G.esc(it.id) + '">' +
      '<input class="input" value="' + G.esc(it.unit) + '" data-chg="rv-unit" data-id="' + G.esc(it.id) + '">' +
      '<button class="icon-btn sm" data-act="rv-del" data-id="' + G.esc(it.id) + '">' + G.icon('trash') + '</button>' +
    '</div>';
  }

  G.register('review', {
    title: '每月复盘',
    nav: '复盘',
    icon: 'review',
    sub: function () { return '一个月一棵树，看它长了多少'; },
    actions: {
      'rv-prev': function () {
        cursor = G.monthKey(G.shift(G.monthStart(cursor), -1));
      },
      'rv-next': function () {
        var next = G.monthKey(G.shift(G.monthEnd(cursor), 1));
        if (next > G.monthKey(G.today())) { G.toast('还没到那个月呢'); return false; }
        cursor = next;
      },
      'rv-goto': function (el) { cursor = el.getAttribute('data-m'); },
      'rv-auto': function () {
        var m = ensure(cursor);
        var vals = autoValues(cursor);
        var n = 0;
        m.items.forEach(function (it) {
          var v = vals[it.key];
          if (!v) return;
          it.actual = v.actual;
          if (!num(it.plan)) it.plan = v.plan;
          n++;
        });
        save();
        G.toast(n ? '已按本月记录填入 ' + n + ' 项实际值' : '这个月还没有可用的记录');
      },
      'rv-add': function () {
        G.sheet({
          title: '加一条复盘项目',
          html:
            '<div class="field"><label>项目名称</label><input class="input" id="rvName" placeholder="例如：早睡"></div>' +
            '<div class="field"><label>计划值</label><input class="input" id="rvPlan" type="number" min="0" placeholder="例如 20"></div>' +
            '<div class="field"><label>实际值</label><input class="input" id="rvActual" type="number" min="0" placeholder="例如 12"></div>' +
            '<div class="field"><label>单位</label><input class="input" id="rvUnit" placeholder="天 / 次 / 篇"></div>' +
            '<button class="btn primary block" id="rvSave">加进去</button>',
          onMount: function (root) {
            root.querySelector('#rvSave').onclick = function () {
              var name = (root.querySelector('#rvName').value || '').trim();
              if (!name) { G.toast('写个名字'); return; }
              ensure(cursor).items.push({
                id: G.uid('rv'),
                key: '',
                name: name,
                plan: Number(root.querySelector('#rvPlan').value) || 0,
                actual: Number(root.querySelector('#rvActual').value) || 0,
                unit: root.querySelector('#rvUnit').value || ''
              });
              save();
              G.closeSheet();
              G.render();
            };
          }
        });
        return false;
      },
      'rv-del': function (el) {
        var id = el.getAttribute('data-id');
        var m = ensure(cursor);
        m.items = m.items.filter(function (x) { return x.id !== id; });
        save();
      },
      'rv-reset': function () {
        G.confirmBox('把 ' + G.monthLabel(cursor) + ' 换成新的空白模板？已经填的内容会没了。', '换新模板').then(function (ok) {
          if (!ok) return;
          delete months()[cursor];
          ensure(cursor);
          G.toast('已生成空白模板');
          G.render();
        });
        return false;
      }
    },
    changes: {
      'rv-name': function (el) { find(el).name = el.value; save(); },
      'rv-plan': function (el) { find(el).plan = el.value === '' ? '' : num(el.value); save(); },
      'rv-actual': function (el) { find(el).actual = el.value === '' ? '' : num(el.value); save(); },
      'rv-unit': function (el) { find(el).unit = el.value; save(); }
    },
    inputs: {
      'rv-note': function (el) { ensure(cursor).note = el.value; save(); return false; }
    },
    render: function (root) {
      cursor = cursor || G.monthKey(G.today());
      if (cursor > G.monthKey(G.today())) cursor = G.monthKey(G.today());
      var m = ensure(cursor);
      var p = overall(m);
      var pct = Math.round(p * 100);
      var filled = m.items.filter(function (it) { return ratioOf(it) !== null; }).length;
      var hist = Object.keys(months()).sort().reverse().slice(0, 12);

      root.innerHTML =
        '<div class="card">' +
          '<div class="month-nav">' +
            '<button class="icon-btn" data-act="rv-prev">' + G.icon('left') + '</button>' +
            '<div style="text-align:center"><b>' + G.monthLabel(cursor) + '</b>' +
              '<div class="tiny muted">' + (cursor === G.monthKey(G.today()) ? '本月 · 还没结束' : '已归档月份') + '</div></div>' +
            '<button class="icon-btn" data-act="rv-next">' + G.icon('right') + '</button>' +
          '</div>' +
          '<div class="divider"></div>' +
          '<div class="tree-wrap">' +
            '<div class="tree-box">' + treeSVG(p) +
              '<div class="tree-label">' + stageText(p) + ' · 完成度 ' + pct + '%</div>' +
            '</div>' +
            '<div class="tree-side">' +
              G.ring(pct, 70) +
              '<div class="small ink2">' + (filled ? '已填写 ' + filled + ' 项，完成度按每项「实际 ÷ 计划」平均算，超出计划按 100% 记。' : '还没有填计划，点下面「按记录自动填入」试试。') + '</div>' +
              '<div class="row">' +
                '<button class="btn primary sm" data-act="rv-auto">' + G.icon('refresh') + '按记录自动填入</button>' +
                '<button class="btn sm line" data-act="rv-add">' + G.icon('plus') + '加一条</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('list') +
            '<div class="grow"><div class="card-title">计划 vs 实际</div>' +
            '<div class="card-sub">计划填目标，实际填做到的量</div></div>' +
            '<button class="btn xs line" data-act="rv-reset">换空白模板</button>' +
          '</div>' +
          '<div class="review-table">' +
            '<div class="review-row head"><span>项目</span><span>计划</span><span>实际</span><span>单位</span><span></span></div>' +
            m.items.map(rowHtml).join('') +
          '</div>' +
          '<div class="divider"></div>' +
          '<div class="small muted" style="margin-bottom:8px">各项完成度</div>' +
          m.items.map(function (it) {
            var r = ratioOf(it);
            if (r === null) return '';
            return '<div class="spread small" style="margin-bottom:6px"><span class="ellipsis" style="max-width:48%">' + G.esc(it.name) + '</span>' +
              '<div class="grow" style="padding:0 8px">' + G.bar(r * 100, r >= 1 ? 'ok' : (r >= 0.6 ? '' : 'warn'), 'thin') + '</div>' +
              '<span class="num muted nowrap">' + Math.round(r * 100) + '%</span></div>';
          }).join('') +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('edit') +
            '<div class="grow"><div class="card-title">这个月想说的话</div>' +
            '<div class="card-sub">做得好的、没做到的、下个月想改的</div></div>' +
          '</div>' +
          '<textarea class="textarea" data-inp="rv-note" placeholder="' + G.monthLabel(cursor) + '小结…">' + G.esc(m.note || '') + '</textarea>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('clock') +
            '<div class="grow"><div class="card-title">历史月份</div>' +
            '<div class="card-sub">点一下切回去看</div></div>' +
          '</div>' +
          '<div class="topic-grid">' + hist.map(function (h2) {
            var mm = months()[h2];
            var o = mm ? Math.round(overall(mm) * 100) : 0;
            return '<button class="btn xs ' + (h2 === cursor ? 'primary' : 'line') + '" data-act="rv-goto" data-m="' + h2 + '">' +
              G.monthLabel(h2).replace('年', '.').replace('月', '') + ' · ' + o + '%</button>';
          }).join('') + '</div>' +
        '</div>';

      // 叶片依次长出来
      var leafEls = root.querySelectorAll('[data-leaf]');
      var leafCount = Math.round(leafEls.length * p);
      for (var i = 0; i < leafCount; i++) {
        (function (el, idx) {
          el.style.transitionDelay = (idx * 0.02).toFixed(2) + 's';
          setTimeout(function () { el.classList.add('in'); }, 30);
        })(leafEls[i], i);
      }
      var flowerEls = root.querySelectorAll('[data-flower]');
      var flowerCount = p >= 0.8 ? Math.min(flowerEls.length, Math.floor((p - 0.8) / 0.2 * flowerEls.length) + 1) : 0;
      for (var j = 0; j < flowerCount; j++) {
        (function (el, idx) {
          el.style.transitionDelay = (0.3 + idx * 0.06).toFixed(2) + 's';
          setTimeout(function () { el.classList.add('in'); }, 60);
        })(flowerEls[j], j);
      }
      var young = root.querySelector('.tree-young');
      if (young && p < 0.12) young.classList.add('in');
    }
  });

  function find(el) {
    var id = el.getAttribute('data-id');
    var m = ensure(cursor);
    return m.items.filter(function (x) { return x.id === id; })[0] || {};
  }
})();
