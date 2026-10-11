/* ============================================================
   模块：学习（英语听力 / 英语口语 / 表达训练）
   阶段、进度、下一步全部手动填写
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;

  function L() { return G.state.learn; }
  function track(id) { return L().tracks[id]; }
  function logDays(tr) {
    var m = {};
    tr.log.forEach(function (x) { m[x.day] = true; });
    return m;
  }
  function weekCount(tr) {
    var week = G.weekDays(G.today());
    return tr.log.filter(function (x) { return week.indexOf(x.day) >= 0; }).length;
  }
  function monthCount(tr) {
    var mk = G.monthKey(G.today());
    return tr.log.filter(function (x) { return G.inMonth(x.day, mk); }).length;
  }
  function practicedToday(tr) {
    return tr.log.some(function (x) { return x.day === G.today(); });
  }

  function trackCard(id) {
    var tr = track(id);
    var days = logDays(tr);
    var recent = tr.log.slice().sort(function (a, b) { return b.day.localeCompare(a.day); }).slice(0, 4);
    var progress = Number(tr.progress || 0);
    return '<div class="card">' +
      '<div class="card-head">' + G.icon(tr.icon || 'learn') +
        '<div class="grow"><div class="card-title">' + G.esc(tr.name) + '</div>' +
        '<div class="card-sub">' + (tr.stage ? '当前阶段：' + G.esc(tr.stage) : '还没填阶段，点下面自己写') + '</div></div>' +
        '<div class="tag ' + (practicedToday(tr) ? 'ok' : 'warn') + '">' + (practicedToday(tr) ? '今日已练' : '今日未练') + '</div>' +
      '</div>' +

      '<div class="row" style="margin-bottom:9px">' +
        '<span class="small muted nowrap">进度</span>' +
        '<input class="input" type="number" min="0" max="100" value="' + progress + '" data-chg="learn-progress" data-id="' + id + '" style="width:88px">' +
        '<span class="small muted">%</span>' +
        '<div class="grow">' + G.bar(progress) + '</div>' +
      '</div>' +

      '<div class="row-form" style="margin-bottom:8px">' +
        '<input class="input" placeholder="当前阶段（自己填）" value="' + G.esc(tr.stage || '') + '" data-inp="learn-stage" data-id="' + id + '">' +
      '</div>' +
      '<div class="row-form" style="margin-bottom:11px">' +
        '<input class="input" placeholder="下一步做什么（自己填）" value="' + G.esc(tr.next || '') + '" data-inp="learn-next" data-id="' + id + '">' +
      '</div>' +

      '<div class="row" style="margin-bottom:11px">' +
        '<button class="btn primary sm" data-act="learn-log" data-id="' + id + '">' + G.icon('plus') + '记一次练习</button>' +
        '<button class="btn line sm" data-act="learn-quick" data-id="' + id + '">今天已练，快速打卡</button>' +
      '</div>' +

      '<div class="grid three" style="margin-bottom:11px">' +
        G.statBox('连续练习', G.streak(days), '天') +
        G.statBox('本周', weekCount(tr), '次') +
        G.statBox('本月', monthCount(tr), '次') +
      '</div>' +
      '<div class="small muted" style="margin-bottom:6px">本周练习</div>' +
      G.dayDots(G.weekDays(G.today()), days, G.today()) +

      (recent.length
        ? '<div class="divider"></div><div class="list">' + recent.map(function (x) {
            return '<div class="item plain"><div class="grow"><div class="item-title">' + G.fmtMD(x.day) +
              (x.min ? ' · ' + x.min + ' 分钟' : '') + '</div>' +
              (x.note ? '<div class="item-sub">' + G.esc(x.note) + '</div>' : '') + '</div>' +
              '<button class="icon-btn sm" data-act="learn-del" data-id="' + id + '" data-log="' + G.esc(x.id) + '">' + G.icon('trash') + '</button></div>';
          }).join('') + '</div>'
        : '') +
    '</div>';
  }

  G.register('learn', {
    title: '学习',
    nav: '学习',
    icon: 'learn',
    sub: function () { return '英语听说 + 表达训练，阶段和进度由你自己定'; },
    badge: function () {
      var n = L().order.filter(function (id) { return practicedToday(track(id)); }).length;
      return n + '/3';
    },
    actions: {
      'learn-quick': function (el) {
        var tr = track(el.getAttribute('data-id'));
        tr.log.push({ id: G.uid('lg'), day: G.today(), min: 0, note: '' });
        G.save();
        G.toast(tr.name + ' 打卡完成，连续 ' + G.streak(logDays(tr)) + ' 天');
      },
      'learn-log': function (el) {
        var id = el.getAttribute('data-id');
        var tr = track(id);
        G.sheet({
          title: '记录一次' + tr.name,
          html:
            '<div class="field"><label>练习内容</label><input class="input" id="lgNote" placeholder="例如：BBC 新闻精听 1 段 / 影子跟读"></div>' +
            '<div class="field"><label>时长（分钟，选填）</label><input class="input" id="lgMin" type="number" min="0" value="20"></div>' +
            '<div class="field"><label>日期</label><input class="input" id="lgDay" type="date" value="' + G.today() + '"></div>' +
            '<button class="btn primary block" id="lgSave">保存</button>',
          onMount: function (root) {
            root.querySelector('#lgSave').onclick = function () {
              tr.log.push({
                id: G.uid('lg'),
                day: root.querySelector('#lgDay').value || G.today(),
                min: Number(root.querySelector('#lgMin').value) || 0,
                note: root.querySelector('#lgNote').value || ''
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
      'learn-del': function (el) {
        var tr = track(el.getAttribute('data-id'));
        var lid = el.getAttribute('data-log');
        tr.log = tr.log.filter(function (x) { return x.id !== lid; });
        G.save();
      }
    },
    changes: {
      'learn-progress': function (el) {
        track(el.getAttribute('data-id')).progress = G.clamp(Number(el.value) || 0, 0, 100);
        G.save();
      }
    },
    inputs: {
      'learn-stage': function (el) { track(el.getAttribute('data-id')).stage = el.value; G.saveSoon(); return false; },
      'learn-next': function (el) { track(el.getAttribute('data-id')).next = el.value; G.saveSoon(); return false; }
    },
    render: function (root) {
      root.innerHTML = L().order.map(trackCard).join('') +
        '<div class="card flat"><p class="hint">阶段、进度、下一步都是你自己填的。填完会自动存在这台设备上，换手机要重新填。</p></div>';
    }
  });
})();
