/* ============================================================
   模块：心情日记
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;
  var MOODS = [
    { e: '😄', n: '开心', v: 5 },
    { e: '🤩', n: '兴奋', v: 5 },
    { e: '😌', n: '平静', v: 4 },
    { e: '🙂', n: '还行', v: 3 },
    { e: '😪', n: '疲惫', v: 2 },
    { e: '😰', n: '焦虑', v: 2 },
    { e: '😢', n: '难过', v: 1 },
    { e: '😤', n: '烦躁', v: 2 }
  ];
  var draft = { mood: '😄', name: '开心', score: 4, text: '', day: '' };

  function M() { return G.state.mood; }
  function sorted() {
    return M().entries.slice().sort(function (a, b) {
      if (a.day !== b.day) return b.day.localeCompare(a.day);
      return (b.at || 0) - (a.at || 0);
    });
  }
  function monthEntries(mk) {
    return sorted().filter(function (x) { return G.inMonth(x.day, mk); });
  }
  function avg(list) {
    if (!list.length) return 0;
    return G.sum(list, function (x) { return Number(x.score) || 0; }) / list.length;
  }
  function chart() {
    var days = G.lastNDays(14);
    var byDay = {};
    M().entries.forEach(function (x) { byDay[x.day] = Number(x.score) || 0; });
    var w = 300, h = 100, pad = 8;
    var pts = [];
    days.forEach(function (d, i) {
      var x = pad + i * ((w - pad * 2) / (days.length - 1));
      var v = byDay[d];
      var y = v ? (h - 12 - (v - 1) / 4 * (h - 24)) : null;
      pts.push({ x: x, y: y, v: v, d: d });
    });
    var segs = '', dots = '';
    var cur = [];
    pts.forEach(function (p) {
      if (p.y === null) {
        if (cur.length > 1) segs += '<polyline points="' + cur.map(function (q) { return q.x + ',' + q.y; }).join(' ') + '" fill="none" stroke="#f2709c" stroke-width="2.4" stroke-linecap="round"/>';
        cur = [];
        return;
      }
      cur.push(p);
      dots += '<circle cx="' + p.x + '" cy="' + p.y + '" r="3.2" fill="#fff" stroke="#e0517f" stroke-width="2"/>';
    });
    if (cur.length > 1) segs += '<polyline points="' + cur.map(function (q) { return q.x + ',' + q.y; }).join(' ') + '" fill="none" stroke="#f2709c" stroke-width="2.4" stroke-linecap="round"/>';
    var grid = '';
    for (var i = 0; i <= 4; i++) {
      var gy = 12 + i * ((h - 24) / 4);
      grid += '<line x1="' + pad + '" y1="' + gy + '" x2="' + (w - pad) + '" y2="' + gy + '" stroke="var(--track)" stroke-width="1"/>';
    }
    return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' + grid + segs + dots + '</svg>';
  }

  function entryRow(x) {
    return '<div class="mood-entry" style="margin-bottom:9px">' +
      '<div class="mood-emo">' + G.esc(x.mood) + '</div>' +
      '<div class="grow">' +
        '<div class="row tight"><span class="small strong">' + G.esc(x.name || '') + '</span>' +
          '<span class="tiny muted">' + G.fmtCN(x.day) + ' · ' + '★'.repeat(G.clamp(Number(x.score) || 0, 1, 5)) + '</span></div>' +
        (x.text ? '<div class="small ink2" style="margin-top:3px;white-space:pre-wrap">' + G.esc(x.text) + '</div>' : '') +
      '</div>' +
      '<div class="row tight" style="flex-direction:column">' +
        '<button class="icon-btn sm" data-act="mood-edit" data-id="' + G.esc(x.id) + '">' + G.icon('edit') + '</button>' +
        '<button class="icon-btn sm" data-act="mood-del" data-id="' + G.esc(x.id) + '">' + G.icon('trash') + '</button>' +
      '</div>' +
    '</div>';
  }

  G.register('mood', {
    title: '心情日记',
    nav: '日记',
    icon: 'mood',
    sub: function () {
      var mk = G.monthKey(G.today());
      return '本月记录了 ' + monthEntries(mk).length + ' 条';
    },
    badge: function () {
      return M().entries.some(function (x) { return x.day === G.today(); }) ? '✓' : '';
    },
    actions: {
      'mood-pick': function (el) {
        var i = Number(el.getAttribute('data-i'));
        draft.mood = MOODS[i].e;
        draft.name = MOODS[i].n;
        draft.score = MOODS[i].v;
        return true;
      },
      'mood-score': function (el) {
        draft.score = Number(el.getAttribute('data-v'));
        return true;
      },
      'mood-save': function (el, ev, ctx) {
        var root = ctx.root;
        var ta = root.querySelector('#moodText');
        var dayInput = root.querySelector('#moodDay');
        var text = (ta && ta.value || '').trim();
        var day = (dayInput && dayInput.value) || G.today();
        M().entries.push({
          id: G.uid('md'), day: day, mood: draft.mood, name: draft.name,
          score: draft.score, text: text, at: Date.now()
        });
        G.save();
        draft.text = '';
        G.toast('记下了，' + G.fmtMD(day) + ' 心情：' + draft.name);
        return true;
      },
      'mood-del': function (el) {
        var id = el.getAttribute('data-id');
        G.confirmBox('删掉这条日记？', '删除').then(function (ok) {
          if (!ok) return;
          M().entries = M().entries.filter(function (x) { return x.id !== id; });
          G.save();
          G.render();
        });
        return false;
      },
      'mood-edit': function (el) {
        var id = el.getAttribute('data-id');
        var x = M().entries.filter(function (e) { return e.id === id; })[0];
        if (!x) return false;
        G.sheet({
          title: '编辑日记',
          html:
            '<div class="field"><label>心情</label><div class="mood-pick">' +
              MOODS.map(function (m, i) {
                return '<button class="mood-opt ' + (m.e === x.mood ? 'on' : '') + '" data-em="' + i + '">' +
                  '<span class="emo">' + m.e + '</span><span>' + m.n + '</span></button>';
              }).join('') + '</div></div>' +
            '<div class="field"><label>心情分（1-5）</label><select class="select" id="edScore">' +
              [1, 2, 3, 4, 5].map(function (v) {
                return '<option value="' + v + '"' + (Number(x.score) === v ? ' selected' : '') + '>' + v + ' 分</option>';
              }).join('') + '</select></div>' +
            '<div class="field"><label>日期</label><input class="input" id="edDay" type="date" value="' + G.esc(x.day) + '"></div>' +
            '<div class="field"><label>内容</label><textarea class="textarea" id="edText">' + G.esc(x.text || '') + '</textarea></div>' +
            '<button class="btn primary block" id="edSave">保存</button>',
          onMount: function (root) {
            var picked = { mood: x.mood, name: x.name };
            root.querySelectorAll('[data-em]').forEach(function (b) {
              b.onclick = function () {
                var m = MOODS[Number(b.getAttribute('data-em'))];
                picked.mood = m.e; picked.name = m.n;
                root.querySelectorAll('[data-em]').forEach(function (o) { o.classList.remove('on'); });
                b.classList.add('on');
              };
            });
            root.querySelector('#edSave').onclick = function () {
              x.mood = picked.mood; x.name = picked.name;
              x.score = Number(root.querySelector('#edScore').value) || x.score;
              x.day = root.querySelector('#edDay').value || x.day;
              x.text = root.querySelector('#edText').value || '';
              G.save();
              G.closeSheet();
              G.render();
            };
          }
        });
        return false;
      }
    },
    inputs: {
      'mood-text': function (el) { draft.text = el.value; return false; }
    },
    render: function (root) {
      var t = G.today(), mk = G.monthKey(t);
      var month = monthEntries(mk);
      var all = sorted();
      var best = {};
      month.forEach(function (x) { best[x.name] = (best[x.name] || 0) + 1; });
      var top = Object.keys(best).sort(function (a, b) { return best[b] - best[a]; })[0] || '—';

      root.innerHTML =
        '<div class="card">' +
          '<div class="card-head">' + G.icon('heart') +
            '<div class="grow"><div class="card-title">今天心情怎么样</div>' +
            '<div class="card-sub">' + G.fmtCN(t) + '</div></div>' +
          '</div>' +
          '<div class="mood-pick" style="margin-bottom:11px">' + MOODS.map(function (m, i) {
            return '<button class="mood-opt ' + (draft.mood === m.e ? 'on' : '') + '" data-act="mood-pick" data-i="' + i + '">' +
              '<span class="emo">' + m.e + '</span><span>' + m.n + '</span></button>';
          }).join('') + '</div>' +
          '<div class="row" style="margin-bottom:9px">' +
            '<span class="small muted nowrap">心情分</span>' +
            [1, 2, 3, 4, 5].map(function (v) {
              return '<button class="btn xs ' + (draft.score === v ? 'primary' : 'line') + '" data-act="mood-score" data-v="' + v + '">' + v + '</button>';
            }).join('') +
          '</div>' +
          '<textarea class="textarea" id="moodText" data-inp="mood-text" placeholder="今天发生了什么？想记点什么就写点什么…">' + G.esc(draft.text) + '</textarea>' +
          '<div class="row" style="margin-top:9px">' +
            '<input class="input" id="moodDay" type="date" value="' + t + '" style="max-width:160px">' +
            '<button class="btn primary grow" data-act="mood-save">' + G.icon('check') + '写好了，保存</button>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('chart') +
            '<div class="grow"><div class="card-title">近 14 天心情曲线</div>' +
            '<div class="card-sub">竖着是心情分 1-5，没记录的日子会断开</div></div>' +
          '</div>' +
          chart() +
          '<div class="grid three" style="margin-top:11px">' +
            G.statBox('本月记录', month.length, '条') +
            G.statBox('平均分', month.length ? avg(month).toFixed(1) : '—', '') +
            G.statBox('最常见', top, '') +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('list') +
            '<div class="grow"><div class="card-title">全部日记</div>' +
            '<div class="card-sub">共 ' + all.length + ' 条，新的在上面</div></div>' +
          '</div>' +
          (all.length ? all.map(entryRow).join('') : G.emptyBox('还没有写过日记')) +
        '</div>';
    }
  });
})();
