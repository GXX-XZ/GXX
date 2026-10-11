/* ============================================================
   模块：习惯养成
   1) 每日晨喝温开水（勾选 + 连续天数）
   2) 粤语 · TVB 观看（至少一周一次）
   3) 粤语 · 每日收听（≥1 个音频，单次 ≥3 分钟）
   4) 博客学习（写博客打卡 + 手动填写阶段/进度）
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;
  var ticker = null;

  function S() { return G.state.habits; }
  function elapsedSec() {
    var start = S().timerStart;
    return start ? (Date.now() - start) / 1000 : 0;
  }
  function paintClock() {
    var el = document.getElementById('listenClock');
    if (!el) return;
    var running = !!S().timerStart;
    el.textContent = G.mmss(elapsedSec());
    el.classList.toggle('run', running);
  }
  function ensureTicker() {
    if (S().timerStart && !ticker) ticker = setInterval(paintClock, 500);
    if (!S().timerStart && ticker) { clearInterval(ticker); ticker = null; }
    paintClock();
  }

  function weekStreak(map) {
    var cursor = G.weekStartKey(G.today());
    if ((map[G.weekKey(cursor)] || 0) < 1) cursor = G.shift(cursor, -7);
    var n = 0;
    while ((map[G.weekKey(cursor)] || 0) >= 1) { n++; cursor = G.shift(cursor, -7); }
    return n;
  }
  function listenDayOK(day, sessions) {
    return sessions.filter(function (s) { return s.day === day && s.sec >= 180; }).length > 0;
  }
  function listenDaysMap(sessions) {
    var m = {};
    sessions.forEach(function (s) { if (s.sec >= 180) m[s.day] = true; });
    return m;
  }

  function waterCard() {
    var t = G.today(), w = S().water, mk = G.monthKey(t);
    var monthKeys = G.monthDaysList(mk).filter(function (k) { return k <= t; });
    var weekKeys = G.weekDays(t);
    return '<div class="card">' +
      '<div class="card-head">' + G.icon('water') +
        '<div class="grow"><div class="card-title">晨起温开水</div>' +
        '<div class="card-sub">每天起床后先喝一杯温开水</div></div>' +
      '</div>' +
      '<div class="spread" style="margin-bottom:11px">' +
        '<div class="row">' + G.checkBox(!!w[t], 'water-toggle') +
          '<div><div class="small strong">' + (w[t] ? '今天已喝 ✓' : '今天还没打卡') + '</div>' +
          '<div class="tiny muted">点左边方框打卡/取消</div></div>' +
        '</div>' +
        '<div class="tag accent">' + G.icon('flame') + '连续 ' + G.streak(w) + ' 天</div>' +
      '</div>' +
      '<div class="grid three" style="margin-bottom:11px">' +
        G.statBox('当前连续', G.streak(w), '天') +
        G.statBox('最长记录', G.longestStreak(w), '天') +
        G.statBox('本月完成', G.dayCount(w, monthKeys), '/ ' + monthKeys.length) +
      '</div>' +
      '<div class="small muted" style="margin-bottom:6px">本周（点日期可补打卡）</div>' +
      G.dayDots(weekKeys, w, t, 'water-day') +
      '<div class="small muted" style="margin:11px 0 6px">近 30 天</div>' +
      G.heat(G.lastNDays(30), w) +
    '</div>';
  }

  function tvbCard() {
    var t = G.today(), wk = G.weekKey(t), map = S().tvb;
    var n = map[wk] || 0;
    var weeks = [];
    var ws = G.weekStartKey(t);
    for (var i = 5; i >= 0; i--) {
      var start = G.shift(ws, -7 * i);
      weeks.push({ start: start, key: G.weekKey(start), n: map[G.weekKey(start)] || 0 });
    }
    var recent = G.sum(weeks, function (w) { return w.n; });
    var allCount = 0;
    Object.keys(map).forEach(function (k) { allCount += map[k]; });

    return '<div class="card">' +
      '<div class="card-head">' + G.icon('tv') +
        '<div class="grow"><div class="card-title">粤语学习 · TVB 观看</div>' +
        '<div class="card-sub">频率：至少一周一次，看剧、看综艺都算</div></div>' +
        '<div class="tag ' + (n >= 1 ? 'ok' : 'warn') + '">' + (n >= 1 ? '本周已达标' : '本周未达标') + '</div>' +
      '</div>' +
      '<div class="grid three" style="margin-bottom:11px">' +
        G.statBox('本周观看', n, '次') +
        G.statBox('连续达标', weekStreak(map), '周') +
        G.statBox('近 6 周合计', recent, '次') +
      '</div>' +
      '<div class="row" style="margin-bottom:11px">' +
        '<button class="btn primary sm" data-act="tvb-add">' + G.icon('plus') + '记录一次观看</button>' +
        '<button class="btn sm line" data-act="tvb-sub"' + (n <= 0 ? ' disabled' : '') + '>' + G.icon('minus') + '减一次</button>' +
      '</div>' +
      '<div class="small muted" style="margin-bottom:6px">最近 6 周</div>' +
      '<div class="dots">' + weeks.map(function (w) {
        return '<span class="dot ' + (w.n >= 1 ? 'on' : '') + '" title="' + w.key + '">' + w.n + '</span>';
      }).join('') + '</div>' +
      '<p class="hint" style="margin-top:9px">点格子里的数字就是那一周看了几次；本周目标 1 次。</p>' +
    '</div>';
  }

  function listenCard() {
    var t = G.today(), list = S().listen;
    var todayList = list.filter(function (s) { return s.day === t; }).sort(function (a, b) { return b.at - a.at; });
    var totalSec = G.sum(todayList, function (s) { return s.sec; });
    var okCount = todayList.filter(function (s) { return s.sec >= 180; }).length;
    var daysMap = listenDaysMap(list);
    var weekKeys = G.weekDays(t);
    var running = !!S().timerStart;

    return '<div class="card">' +
      '<div class="card-head">' + G.icon('listen') +
        '<div class="grow"><div class="card-title">粤语学习 · 每日收听</div>' +
        '<div class="card-sub">每天至少 1 个音频资料，单次收听 ≥ 3 分钟</div></div>' +
        '<div class="tag ' + (okCount > 0 ? 'ok' : 'warn') + '">' + (okCount > 0 ? '今日已达标' : '今日未达标') + '</div>' +
      '</div>' +
      '<div class="timer' + (running ? ' run' : '') + '" id="listenClock">' + G.mmss(elapsedSec()) + '</div>' +
      '<div class="row" style="justify-content:center;margin-bottom:12px">' +
        (running
          ? '<button class="btn primary" data-act="listen-stop">' + G.icon('stop') + '结束并保存</button>' +
            '<button class="btn line" data-act="listen-cancel">取消</button>'
          : '<button class="btn primary" data-act="listen-start">' + G.icon('play') + '开始收听计时</button>' +
            '<button class="btn line" data-act="listen-manual">手动补记</button>') +
      '</div>' +
      '<div class="grid three" style="margin-bottom:11px">' +
        G.statBox('今日累计', Math.round(totalSec / 60), '分钟') +
        G.statBox('达标音频', okCount, '个') +
        G.statBox('连续达标', G.streak(daysMap), '天') +
      '</div>' +
      '<div class="small muted" style="margin-bottom:6px">本周达标情况</div>' +
      G.dayDots(weekKeys, daysMap, t) +
      (todayList.length
        ? '<div class="divider"></div><div class="small muted" style="margin-bottom:7px">今天的记录</div><div class="list">' +
          todayList.map(function (s) {
            return '<div class="item plain"><div class="grow"><div class="item-title">' +
              G.mmss(s.sec) + (s.sec >= 180 ? ' <span class="tag ok">达标</span>' : ' <span class="tag warn">不足 3 分钟</span>') +
              '</div><div class="item-sub">' + G.esc(s.note || '') + '</div></div>' +
              '<button class="icon-btn sm" data-act="listen-del" data-id="' + G.esc(s.id) + '">' + G.icon('trash') + '</button></div>';
          }).join('') + '</div>'
        : '') +
    '</div>';
  }

  function blogCard() {
    var t = G.today(), b = S().blog, mk = G.monthKey(t);
    var posts = Object.keys(b.posts).filter(function (k) { return G.inMonth(k, mk); }).sort().reverse();
    var goal = b.goal || 0;
    var pct = goal > 0 ? Math.min(100, posts.length / goal * 100) : 0;
    var stage = b.stage || '', next = b.next || '';
    var progress = Number(b.progress || 0);

    return '<div class="card">' +
      '<div class="card-head">' + G.icon('edit') +
        '<div class="grow"><div class="card-title">博客学习 · 写博客</div>' +
        '<div class="card-sub">今天是「写」的那一步，坚持更新</div></div>' +
      '</div>' +
      '<div class="spread" style="margin-bottom:11px">' +
        '<div class="row">' + G.checkBox(!!b.posts[t], 'blog-toggle') +
          '<div><div class="small strong">' + (b.posts[t] ? '今天已写 ✓' : '今天还没写') + '</div>' +
          '<div class="tiny muted">' + (b.posts[t] && b.posts[t].title ? G.esc(b.posts[t].title) : '点方框打卡，也可写一个主题') + '</div></div>' +
        '</div>' +
        '<button class="btn xs line" data-act="blog-topic">' + G.icon('plus') + '记主题</button>' +
      '</div>' +
      '<div class="spread small" style="margin-bottom:5px"><span>本月已写 ' + posts.length + ' 篇</span>' +
        '<span class="muted">目标 <input class="input" style="width:62px;display:inline-block;padding:3px 7px;font-size:calc(12.5px * var(--fs))" type="number" min="0" max="60" value="' + goal + '" data-chg="blog-goal"> 篇</span>' +
      '</div>' +
      G.bar(pct, posts.length >= goal && goal > 0 ? 'ok' : '') +
      '<div class="divider"></div>' +
      '<div class="small strong" style="margin-bottom:7px">阶段 · 进度 · 下一步（自己填）</div>' +
      '<div class="row-form" style="margin-bottom:8px">' +
        '<input class="input" placeholder="当前阶段，例如：稳定周更" value="' + G.esc(stage) + '" data-inp="blog-stage">' +
      '</div>' +
      '<div class="row" style="margin-bottom:8px">' +
        '<input class="input grow" type="number" min="0" max="100" value="' + progress + '" data-chg="blog-progress" style="max-width:110px">' +
        '<span class="small muted">%</span>' +
        '<div class="grow">' + G.bar(progress) + '</div>' +
      '</div>' +
      '<input class="input" placeholder="下一步要做什么" value="' + G.esc(next) + '" data-inp="blog-next">' +
      (posts.length
        ? '<div class="divider"></div><div class="small muted" style="margin-bottom:7px">本月主题</div><div class="list">' +
          posts.map(function (k) {
            var p = b.posts[k];
            return '<div class="item plain"><div class="grow"><div class="item-title">' + G.esc(p.title || '（未写主题）') + '</div>' +
              '<div class="item-sub">' + G.fmtMD(k) + (p.words ? ' · ' + p.words + ' 字' : '') + '</div></div>' +
              '<button class="icon-btn sm" data-act="blog-del" data-day="' + k + '">' + G.icon('trash') + '</button></div>';
          }).join('') + '</div>'
        : '') +
    '</div>';
  }

  G.register('habits', {
    title: '习惯养成',
    nav: '习惯',
    icon: 'habits',
    sub: function () {
      var h = S();
      var t = G.today();
      var n = [!!h.water[t], (h.tvb[G.weekKey(t)] || 0) >= 1, listenDayOK(t, h.listen), !!h.blog.posts[t]].filter(Boolean).length;
      return '今天 4 项已完成 ' + n + ' 项';
    },
    badge: function () {
      var h = S(), t = G.today();
      var n = [!!h.water[t], (h.tvb[G.weekKey(t)] || 0) >= 1, listenDayOK(t, h.listen), !!h.blog.posts[t]].filter(Boolean).length;
      return n === 4 ? '✓' : String(n) + '/4';
    },
    actions: {
      'water-toggle': function () {
        var t = G.today(), w = S().water;
        if (w[t]) { delete w[t]; G.toast('已取消今天的打卡'); }
        else { w[t] = true; G.toast('温开水打卡完成，连续 ' + G.streak(w) + ' 天'); }
        G.save();
      },
      'water-day': function (el) {
        var k = el.getAttribute('data-day'), w = S().water;
        if (k > G.today()) return false;
        if (w[k]) delete w[k]; else w[k] = true;
        G.save();
        return true;
      },
      'tvb-add': function () {
        var wk = G.weekKey(G.today()), m = S().tvb;
        m[wk] = (m[wk] || 0) + 1;
        G.save();
        G.toast('本周第 ' + m[wk] + ' 次观看，已记录');
      },
      'tvb-sub': function () {
        var wk = G.weekKey(G.today()), m = S().tvb;
        m[wk] = Math.max(0, (m[wk] || 0) - 1);
        if (!m[wk]) delete m[wk];
        G.save();
      },
      'listen-start': function () {
        S().timerStart = Date.now();
        G.save();
        G.toast('开始计时，坚持 3 分钟以上');
      },
      'listen-stop': function () {
        var sec = elapsedSec();
        S().timerStart = 0;
        if (sec < 10) { G.save(); G.toast('不到 10 秒，没有记录'); return; }
        S().listen.push({ id: G.uid('ls'), day: G.today(), sec: Math.round(sec), at: Date.now(), note: '' });
        G.save();
        G.toast(sec >= 180 ? '达标啦，本次 ' + G.mmss(sec) : '已记录 ' + G.mmss(sec) + '，还没到 3 分钟');
      },
      'listen-cancel': function () {
        S().timerStart = 0;
        G.save();
      },
      'listen-manual': function () {
        G.sheet({
          title: '手动补记收听',
          html:
            '<div class="field"><label>收听时长（分钟）</label>' +
            '<input class="input" id="manMin" type="number" min="1" max="600" value="5"></div>' +
            '<div class="field"><label>日期</label><input class="input" id="manDay" type="date" value="' + G.today() + '"></div>' +
            '<div class="field"><label>备注（选填）</label><input class="input" id="manNote" placeholder="例如：TVB 新闻 3 分钟"></div>' +
            '<button class="btn primary block" id="manSave">保存记录</button>',
          onMount: function (root) {
            root.querySelector('#manSave').onclick = function () {
              var min = Number(root.querySelector('#manMin').value) || 0;
              var day = root.querySelector('#manDay').value || G.today();
              var note = root.querySelector('#manNote').value || '';
              if (min <= 0) { G.toast('填一下分钟数'); return; }
              S().listen.push({ id: G.uid('ls'), day: day, sec: Math.round(min * 60), at: Date.now(), note: note });
              G.save();
              G.closeSheet();
              G.toast('补记成功：' + min + ' 分钟');
              G.render();
            };
          }
        });
        return false;
      },
      'listen-del': function (el) {
        var id = el.getAttribute('data-id');
        S().listen = S().listen.filter(function (s) { return s.id !== id; });
        G.save();
        G.toast('已删除这条记录');
      },
      'blog-toggle': function () {
        var t = G.today(), posts = S().blog.posts;
        if (posts[t]) { delete posts[t]; G.toast('已取消今天的写作打卡'); }
        else { posts[t] = { title: '', words: 0 }; G.toast('写作打卡完成，记得写主题'); }
        G.save();
      },
      'blog-topic': function () {
        var t = G.today();
        var cur = S().blog.posts[t] || { title: '', words: 0 };
        G.sheet({
          title: '今天写了什么',
          html:
            '<div class="field"><label>主题 / 标题</label><input class="input" id="bpTitle" value="' + G.esc(cur.title) + '" placeholder="例如：新手剪辑最容易踩的 3 个坑"></div>' +
            '<div class="field"><label>字数（选填）</label><input class="input" id="bpWords" type="number" min="0" value="' + (cur.words || '') + '"></div>' +
            '<div class="field"><label>日期</label><input class="input" id="bpDay" type="date" value="' + t + '"></div>' +
            '<button class="btn primary block" id="bpSave">保存</button>',
          onMount: function (root) {
            root.querySelector('#bpSave').onclick = function () {
              var day = root.querySelector('#bpDay').value || t;
              S().blog.posts[day] = {
                title: root.querySelector('#bpTitle').value || '',
                words: Number(root.querySelector('#bpWords').value) || 0
              };
              G.save();
              G.closeSheet();
              G.toast('已记下今天的主题');
              G.render();
            };
          }
        });
        return false;
      },
      'blog-del': function (el) {
        delete S().blog.posts[el.getAttribute('data-day')];
        G.save();
        G.toast('已删除');
      }
    },
    changes: {
      'blog-goal': function (el) {
        S().blog.goal = Math.max(0, Number(el.value) || 0);
        G.save();
      },
      'blog-progress': function (el) {
        S().blog.progress = G.clamp(Number(el.value) || 0, 0, 100);
        G.save();
      }
    },
    inputs: {
      'blog-stage': function (el) { S().blog.stage = el.value; G.saveSoon(); return false; },
      'blog-next': function (el) { S().blog.next = el.value; G.saveSoon(); return false; }
    },
    render: function (root) {
      root.innerHTML = waterCard() + tvbCard() + listenCard() + blogCard();
      ensureTicker();
    }
  });
})();
