/* ============================================================
   模块：健身（力量训练 / 骑车 / 腹部训练）
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;
  var KINDS = [
    { id: 'strength', name: '力量训练', icon: 'fitness', tip: '一周至少 3 次' },
    { id: 'bike', name: '骑车', icon: 'bike', tip: '一周至少 3 次' },
    { id: 'core', name: '腹部训练', icon: 'core', tip: '一周至少 5 次' }
  ];

  function F() { return G.state.fitness; }
  function sessionsOf(kind, days) {
    return F().log.filter(function (s) { return s.kind === kind && days.indexOf(s.day) >= 0; });
  }
  function kindDaysMap(kind) {
    var m = {};
    F().log.forEach(function (s) { if (s.kind === kind) m[s.day] = true; });
    return m;
  }
  function weekTargetOK(kind, weekStart) {
    var days = [];
    for (var i = 0; i < 7; i++) days.push(G.shift(weekStart, i));
    return sessionsOf(kind, days).length >= (F().targets[kind] || 1);
  }
  function okWeekStreak(kind) {
    var cursor = G.weekStartKey(G.today());
    var target = F().targets[kind] || 1;
    var days = [];
    for (var i = 0; i < 7; i++) days.push(G.shift(cursor, i));
    if (sessionsOf(kind, days).length < target) cursor = G.shift(cursor, -7);
    var n = 0;
    while (n < 200) {
      var ds = [];
      for (var j = 0; j < 7; j++) ds.push(G.shift(cursor, j));
      if (sessionsOf(kind, ds).length < target) break;
      n++;
      cursor = G.shift(cursor, -7);
    }
    return n;
  }

  function kindCard(k) {
    var week = G.weekDays(G.today());
    var n = sessionsOf(k.id, week).length;
    var target = F().targets[k.id] || 1;
    var pct = Math.min(100, n / target * 100);
    var done = n >= target;
    var recent = F().log.filter(function (s) { return s.kind === k.id; })
      .sort(function (a, b) { return b.day.localeCompare(a.day); }).slice(0, 5);
    var weeks = [];
    var ws = G.weekStartKey(G.today());
    for (var i = 7; i >= 0; i--) {
      var start = G.shift(ws, -7 * i);
      weeks.push({ start: start, ok: weekTargetOK(k.id, start), cur: i === 0 });
    }
    return '<div class="card">' +
      '<div class="card-head">' + G.icon(k.icon) +
        '<div class="grow"><div class="card-title">' + k.name + '</div>' +
        '<div class="card-sub">' + k.tip + '</div></div>' +
        '<div class="tag ' + (done ? 'ok' : 'warn') + '">' + (done ? '本周达标' : '还差 ' + (target - n) + ' 次') + '</div>' +
      '</div>' +
      '<div class="spread small" style="margin-bottom:6px"><span>本周 ' + n + ' / ' + target + ' 次</span>' +
        '<span class="muted">目标 <input class="input" type="number" min="1" max="14" value="' + target + '" data-chg="fit-target" data-id="' + k.id + '" style="width:56px;display:inline-block;padding:3px 6px;font-size:calc(12px * var(--fs))"> 次/周</span>' +
      '</div>' +
      G.bar(pct, done ? 'ok' : '') +
      '<div class="small muted" style="margin:11px 0 6px">本周打卡（点日期可加/取消）</div>' +
      '<div class="dots">' + week.map(function (d) {
        var on = sessionsOf(k.id, [d]).length > 0;
        var cls = 'dot' + (on ? ' on' : '') + (d === G.today() ? ' today' : '') + (d > G.today() ? ' dim' : '');
        return '<button class="' + cls + '" data-act="fit-day" data-id="' + k.id + '" data-day="' + d + '">' + d.slice(-2) + '</button>';
      }).join('') + '</div>' +
      '<div style="margin-top:9px"><button class="btn xs line" data-act="fit-detail" data-id="' + k.id + '">' + G.icon('edit') + '记时长 / 内容</button></div>' +
      '<div class="grid three" style="margin:11px 0">' +
        G.statBox('连续达标', okWeekStreak(k.id), '周') +
        G.statBox('本月', F().log.filter(function (s) { return s.kind === k.id && G.inMonth(s.day, G.monthKey(G.today())); }).length, '次') +
        G.statBox('累计', F().log.filter(function (s) { return s.kind === k.id; }).length, '次') +
      '</div>' +
      '<div class="small muted" style="margin-bottom:6px">最近 8 周</div>' +
      '<div class="dots">' + weeks.map(function (w) {
        return '<span class="dot ' + (w.ok ? 'on' : '') + (w.cur ? ' today' : '') + '" title="' + w.start + '">' + (w.ok ? '✓' : '·') + '</span>';
      }).join('') + '</div>' +
      (recent.length
        ? '<div class="divider"></div><div class="list">' + recent.map(function (s) {
            return '<div class="item plain"><div class="grow"><div class="item-title">' + G.fmtMD(s.day) +
              (s.min ? ' · ' + s.min + ' 分钟' : '') + '</div>' +
              (s.note ? '<div class="item-sub">' + G.esc(s.note) + '</div>' : '') + '</div>' +
              '<button class="icon-btn sm" data-act="fit-del" data-log="' + G.esc(s.id) + '">' + G.icon('trash') + '</button></div>';
          }).join('') + '</div>'
        : '') +
    '</div>';
  }

  G.register('fitness', {
    title: '健身',
    nav: '健身',
    icon: 'fitness',
    sub: function () { return '力量 3 次 / 骑车 3 次 / 腹部 5 次，按周结算'; },
    badge: function () {
      var week = G.weekDays(G.today());
      var n = KINDS.filter(function (k) { return sessionsOf(k.id, week).length >= (F().targets[k.id] || 1); }).length;
      return n + '/3';
    },
    actions: {
      'fit-day': function (el) {
        var kind = el.getAttribute('data-id');
        var day = el.getAttribute('data-day');
        if (day > G.today()) { G.toast('还没到那天呢'); return false; }
        var exist = F().log.filter(function (s) { return s.kind === kind && s.day === day; });
        if (exist.length) {
          F().log = F().log.filter(function (s) { return !(s.kind === kind && s.day === day); });
          G.toast('已取消 ' + G.fmtMD(day) + ' 的记录');
        } else {
          F().log.push({ id: G.uid('ft'), kind: kind, day: day, min: 0, note: '' });
          var name = KINDS.filter(function (k) { return k.id === kind; })[0].name;
          G.toast(name + ' 打卡：' + G.fmtMD(day));
        }
        G.save();
      },
      'fit-detail': function (el) {
        var kind = el.getAttribute('data-id');
        var day = el.getAttribute('data-day') || G.today();
        var name = KINDS.filter(function (k) { return k.id === kind; })[0].name;
        G.sheet({
          title: name + ' · 记一笔',
          html:
            '<div class="field"><label>时长（分钟，选填）</label><input class="input" id="ftMin" type="number" min="0" value="40"></div>' +
            '<div class="field"><label>内容 / 备注</label><input class="input" id="ftNote" placeholder="例如：深蹲 4 组、卧推 4 组"></div>' +
            '<div class="field"><label>日期</label><input class="input" id="ftDay" type="date" value="' + day + '"></div>' +
            '<button class="btn primary block" id="ftSave">保存</button>',
          onMount: function (root) {
            root.querySelector('#ftSave').onclick = function () {
              F().log.push({
                id: G.uid('ft'),
                kind: kind,
                day: root.querySelector('#ftDay').value || G.today(),
                min: Number(root.querySelector('#ftMin').value) || 0,
                note: root.querySelector('#ftNote').value || ''
              });
              G.save();
              G.closeSheet();
              G.toast('已记录');
              G.render();
            };
          }
        });
        return false;
      },
      'fit-del': function (el) {
        var id = el.getAttribute('data-log');
        F().log = F().log.filter(function (s) { return s.id !== id; });
        G.save();
      }
    },
    changes: {
      'fit-target': function (el) {
        F().targets[el.getAttribute('data-id')] = G.clamp(Number(el.value) || 1, 1, 14);
        G.save();
      }
    },
    render: function (root) {
      root.innerHTML = KINDS.map(kindCard).join('') +
        '<div class="card flat"><p class="hint">点日期格子就是打卡，再点一次取消；想记下时长和练了什么，用「记时长 / 内容」。目标次数可以随时改，改完从本周开始生效。</p></div>';
    }
  });
})();
