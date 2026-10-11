/* ============================================================
   模块：今日总览
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;

  function greeting() {
    var h = new Date().getHours();
    if (h < 5) return '夜深了';
    if (h < 9) return '早上好';
    if (h < 12) return '上午好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    if (h < 23) return '晚上好';
    return '夜深了';
  }

  function todayTasks() {
    var t = G.today();
    return G.state.work.tasks
      .filter(function (x) { return !x.done && (!x.due || x.due <= t); })
      .sort(function (a, b) {
        var order = { high: 0, mid: 1, low: 2 };
        if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
        return (a.due || '9999').localeCompare(b.due || '9999');
      });
  }

  function habitRows() {
    var h = G.state.habits;
    var t = G.today();
    var wk = G.weekKey(t);
    var todayListen = h.listen.filter(function (s) { return s.day === t; });
    var listenOK = todayListen.some(function (s) { return s.sec >= 180; });
    var blogDone = !!h.blog.posts[t];
    var rows = [
      { key: 'water', label: '晨起温开水', on: !!h.water[t], act: 'today-water', icon: 'water', note: '连续 ' + G.streak(h.water) + ' 天' },
      { key: 'tvb', label: '粤语 TVB 观看', on: (h.tvb[wk] || 0) >= 1, act: 'today-tvb', icon: 'tv', note: '本周 ' + (h.tvb[wk] || 0) + ' 次' },
      { key: 'listen', label: '粤语音频收听 ≥3 分钟', on: listenOK, act: 'today-listen', icon: 'listen', note: '今日 ' + Math.round(G.sum(todayListen, function (s) { return s.sec; }) / 60) + ' 分钟' },
      { key: 'blog', label: '博客写作', on: blogDone, act: 'today-blog', icon: 'edit', note: '本月 ' + Object.keys(h.blog.posts).filter(function (k) { return G.inMonth(k, G.monthKey(t)); }).length + ' 篇' }
    ];
    return rows.map(function (r) {
      return '<div class="item plain">' + G.checkBox(r.on, r.act) +
        '<div class="item-main"><div class="item-title">' + G.esc(r.label) + '</div>' +
        '<div class="item-sub">' + G.esc(r.note) + '</div></div></div>';
    }).join('');
  }

  function fitnessMini() {
    var f = G.state.fitness;
    var wk = G.weekStartKey(G.today());
    var days = G.weekDays(G.today());
    var kinds = [['strength', '力量训练', 'fitness'], ['bike', '骑车', 'bike'], ['core', '腹部训练', 'core']];
    return kinds.map(function (k) {
      var n = f.log.filter(function (s) { return s.kind === k[0] && days.indexOf(s.day) >= 0; }).length;
      var target = f.targets[k[0]] || 1;
      var pct = Math.min(100, n / target * 100);
      return '<div style="margin-bottom:9px">' +
        '<div class="spread small"><span>' + G.icon(k[2], '') + ' ' + k[1] + '</span>' +
        '<span class="num ' + (n >= target ? 'ok-text' : 'muted') + '">' + n + '/' + target + '</span></div>' +
        '<div style="margin-top:5px">' + G.bar(pct, n >= target ? 'ok' : '', 'thin') + '</div></div>';
    }).join('');
  }

  function learnMini() {
    var L = G.state.learn;
    return L.order.map(function (id) {
      var tr = L.tracks[id];
      return '<div style="margin-bottom:9px">' +
        '<div class="spread small"><span>' + G.esc(tr.name) + (tr.stage ? ' · ' + G.esc(tr.stage) : '') + '</span>' +
        '<span class="num muted">' + (tr.progress || 0) + '%</span></div>' +
        '<div style="margin-top:5px">' + G.bar(tr.progress || 0, '', 'thin') + '</div></div>';
    }).join('');
  }

  function hotList() {
    var data = window.GXX_NEWS;
    if (!data || !data.items || !data.items.length) {
      return G.emptyBox('还没有抓到热点数据，去「新闻热点」页点一下「换一批」看看');
    }
    var list = hot3(data);
    return list.map(function (it) {
      return '<a class="news-item" href="' + G.esc(it.url) + '" target="_blank" rel="noopener" style="margin-bottom:8px">' +
        '<div class="news-body"><div class="news-title clamp2">' + G.esc(it.title) + '</div>' +
        '<div class="news-meta"><span class="tag ' + srcCls(it.source) + '">' + srcName(it.source) + '</span>' +
        '<span>' + G.esc(it.time) + '</span></div></div></a>';
    }).join('');
  }

  function srcName(s) {
    return { CCTV: '央视新闻', PEOPLE: '人民网', XINHUA: '新华网' }[s] || s;
  }
  function srcCls(s) {
    return { CCTV: 'src-cctv', PEOPLE: 'src-people', XINHUA: 'src-xinhua' }[s] || '';
  }
  function hot3(data) {
    var out = [], sources = ['CCTV', 'PEOPLE', 'XINHUA'];
    sources.forEach(function (s) {
      var first = data.items.filter(function (i) { return i.source === s; })[0];
      if (first) out.push(first);
    });
    return out.slice(0, 3);
  }

  function moodLine() {
    var t = G.today();
    var e = G.state.mood.entries.filter(function (x) { return x.day === t; });
    if (e.length) {
      return '<div class="item plain"><div class="mood-emo">' + G.esc(e[0].mood) + '</div>' +
        '<div class="item-main"><div class="item-title">今天已经记过心情了</div>' +
        '<div class="item-sub clamp2">' + G.esc(e[0].text || '（没有写内容）') + '</div></div></div>';
    }
    return '<p class="hint">今天还没有记录心情，花一分钟写一句吧。</p>' +
      '<div style="margin-top:9px"><button class="btn soft sm" data-go="mood">' + G.icon('heart') + '去写心情日记</button></div>';
  }

  /* ------------------------------------------------ 月历 */
  var calCursor = null;

  function listenOKDays() {
    var m = {};
    G.state.habits.listen.forEach(function (s) { if (s.sec >= 180) m[s.day] = true; });
    return m;
  }
  function dayMarks(k) {
    var h = G.state.habits;
    var out = [];
    if (h.water[k]) out.push('water');
    if (listenOKDays()[k]) out.push('yue');
    if (G.state.fitness.log.some(function (s) { return s.day === k; })) out.push('fit');
    var learned = G.state.learn.order.some(function (id) {
      return G.state.learn.tracks[id].log.some(function (x) { return x.day === k; });
    });
    if (learned || h.blog.posts[k]) out.push('learn');
    if (G.state.mood.entries.some(function (e) { return e.day === k; })) out.push('mood');
    return out;
  }
  function monthMarks(mk) {
    var keys = G.monthDaysList(mk);
    var days = keys.filter(function (k) { return dayMarks(k).length > 0; });
    var fit = G.state.fitness.log.filter(function (s) { return G.inMonth(s.day, mk); }).length;
    var mood = keys.filter(function (k) { return G.state.mood.entries.some(function (e) { return e.day === k; }); }).length;
    return { days: days.length, fit: fit, mood: mood, total: keys.length };
  }
  /* ------------------------------------------------ 打卡提醒条 */
  function remindStrip() {
    var r = G.state.settings.reminder || {};
    var t = G.today();
    var ack = (r.ack && r.ack[t]) || {};
    var now = G.nowHM();
    var items = [];
    if (!ack.m && now >= (r.morning || '07:30') && now < '11:30') {
      items.push({ k: 'm', name: '上班打卡', tip: '打完卡，顺手喝一杯温开水。' });
    }
    if (!ack.e && now >= (r.evening || '17:10') && now < '23:00') {
      items.push({ k: 'e', name: '下班打卡', tip: '收工前记得打卡，路上注意安全。' });
    }
    if (!items.length) return '';
    return items.map(function (o) {
      return '<div class="card" style="border-color:var(--accent);background:var(--accent-soft);box-shadow:none">' +
        '<div class="row"><div class="grow">' +
          '<div class="small strong">该' + o.name + '了</div>' +
          '<div class="tiny ink2" style="margin-top:2px">' + o.tip + '</div>' +
        '</div>' +
        '<button class="btn xs line" data-act="remind-ack" data-k="' + o.k + '">知道了</button>' +
        '</div></div>';
    }).join('');
  }

  function calendarCard() {
    var mk = calCursor || G.monthKey(G.today());
    var t = G.today();
    var startWd = (G.parse(G.monthStart(mk)).getDay() + 6) % 7;
    var days = G.daysInMonth(mk);
    var cells = '';
    var i;
    for (i = 0; i < startWd; i++) cells += '<div class="cal-cell blank"></div>';
    for (i = 1; i <= days; i++) {
      var k = mk + '-' + G.pad2(i);
      var marks = dayMarks(k);
      var cls = 'cal-cell' + (k === t ? ' today' : '') + (k > t ? ' future' : '');
      cells += '<button class="' + cls + '" data-act="cal-day" data-day="' + k + '">' +
        '<span class="cal-num">' + i + '</span>' +
        '<span class="cal-dots">' + marks.map(function (m) { return '<i class="cd-' + m + '"></i>'; }).join('') + '</span>' +
        '</button>';
    }
    // 补齐整周
    var total = startWd + G.daysInMonth(mk);
    var pad = (7 - (total % 7)) % 7;
    for (i = 0; i < pad; i++) cells += '<div class="cal-cell blank"></div>';

    var st = monthMarks(mk);
    var isThisMonth = mk === G.monthKey(t);

    return '<div class="card">' +
      '<div class="month-nav" style="margin-bottom:10px">' +
        '<button class="icon-btn" data-act="cal-prev">' + G.icon('left') + '</button>' +
        '<div style="text-align:center"><b>' + G.monthLabel(mk) + '</b>' +
          '<div class="tiny muted">本月有记录 ' + st.days + ' 天</div></div>' +
        '<button class="icon-btn" data-act="cal-next">' + G.icon('right') + '</button>' +
      '</div>' +
      (isThisMonth ? '' : '<div class="row" style="justify-content:center;margin-bottom:9px"><button class="btn xs soft" data-act="cal-today">回到本月</button></div>') +
      '<div class="cal-head"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>' +
      '<div class="cal-grid">' + cells + '</div>' +
      '<div class="cal-legend" style="margin-top:10px">' +
        '<span><i class="cd-water"></i>温开水</span>' +
        '<span><i class="cd-yue"></i>粤语收听</span>' +
        '<span><i class="cd-fit"></i>健身</span>' +
        '<span><i class="cd-learn"></i>学习/写作</span>' +
        '<span><i class="cd-mood"></i>心情</span>' +
      '</div>' +
      '<div class="grid three" style="margin-top:11px">' +
        G.statBox('有记录', st.days, '/ ' + st.total + ' 天') +
        G.statBox('健身', st.fit, '次') +
        G.statBox('心情', st.mood, '天') +
      '</div>' +
      '<p class="hint" style="margin-top:9px">点某一天可以看到那天的详细记录。</p>' +
    '</div>';
  }

  function dayDetail(day) {
    var h = G.state.habits;
    var sessions = h.listen.filter(function (s) { return s.day === day; });
    var sec = G.sum(sessions, function (s) { return s.sec; });
    var listenDone = sessions.some(function (s) { return s.sec >= 180; });
    var wk = G.weekKey(day);
    var fit = G.state.fitness.log.filter(function (s) { return s.day === day; });
    var fitNames = { strength: '力量训练', bike: '骑车', core: '腹部训练' };
    var learnRows = G.state.learn.order.map(function (id) {
      var tr = G.state.learn.tracks[id];
      var n = tr.log.filter(function (x) { return x.day === day; }).length;
      return { name: tr.name, n: n };
    });
    var doneTasks = G.state.work.tasks.filter(function (x) { return x.done && x.doneAt === day; });
    var moods = G.state.mood.entries.filter(function (e) { return e.day === day; });
    var post = h.blog.posts[day];

    function line(on, label, note) {
      return '<div class="day-detail-row">' +
        '<span class="check ' + (on ? 'on' : '') + '" style="pointer-events:none">' + G.icon('check') + '</span>' +
        '<div class="grow"><div class="small ' + (on ? 'strong' : 'muted') + '">' + label + '</div>' +
        (note ? '<div class="tiny muted">' + G.esc(note) + '</div>' : '') + '</div></div>';
    }
    return '<p class="small muted" style="margin-bottom:10px">' + G.fmtCN(day) + '</p>' +
      line(!!h.water[day], '晨起温开水', h.water[day] ? '已打卡' : '没有记录') +
      line(listenDone, '粤语收听', sec ? ('共 ' + Math.round(sec / 60) + ' 分钟' + (listenDone ? '，达标' : '，不足 3 分钟')) : '没有记录') +
      line((h.tvb[wk] || 0) >= 1, 'TVB 观看（第 ' + wk + ' 周）', '那一周共 ' + (h.tvb[wk] || 0) + ' 次') +
      line(!!post, '博客写作', post ? (post.title || '已打卡') : '没有记录') +
      line(fit.length > 0, '健身', fit.length ? fit.map(function (s) { return fitNames[s.kind] + (s.min ? '(' + s.min + '分钟)' : ''); }).join('、') : '没有记录') +
      line(learnRows.some(function (r) { return r.n > 0; }), '学习练习',
        learnRows.filter(function (r) { return r.n > 0; }).map(function (r) { return r.name + ' ' + r.n + ' 次'; }).join('、') || '没有记录') +
      line(doneTasks.length > 0, '完成的待办', doneTasks.length ? doneTasks.map(function (x) { return x.text; }).join('；') : '没有记录') +
      line(moods.length > 0, '心情',
        moods.length ? moods.map(function (m) { return m.mood + ' ' + m.name + (m.text ? '：' + m.text : ''); }).join(' ／ ') : '没有记录') +
      '<div class="row" style="margin-top:12px">' +
        '<button class="btn sm line" data-sheet-water="' + day + '">' + (h.water[day] ? '取消当天温开水' : '补打卡温开水') + '</button>' +
        '<button class="btn sm line" data-go="habits">去习惯页调整</button>' +
      '</div>';
  }

  G.register('today', {
    title: '今日',
    nav: '今日',
    icon: 'today',
    sub: function () { return G.fmtCN(G.today()) + ' · ' + greeting(); },
    badge: function () {
      var n = todayTasks().length;
      return n ? String(n) : '';
    },
    actions: {
      'today-water': function () {
        var t = G.today(), w = G.state.habits.water;
        if (w[t]) delete w[t]; else w[t] = true;
        G.save();
        G.toast(w[t] ? '温开水打卡完成' : '已取消今天的打卡');
      },
      'remind-ack': function (el) {
        var k = el.getAttribute('data-k');
        var r = G.state.settings.reminder || (G.state.settings.reminder = { morning: '07:30', evening: '17:10', ack: {} });
        var t = G.today();
        if (!r.ack) r.ack = {};
        if (!r.ack[t]) r.ack[t] = {};
        r.ack[t][k] = true;
        Object.keys(r.ack).forEach(function (d) {
          if (G.diffDays(t, d) > 7) delete r.ack[d];
        });
        G.save();
        G.toast(k === 'm' ? '好，上班打卡别忘啦' : '好，下班打卡别忘啦');
      },
      'today-tvb': function () {
        var wk = G.weekKey(G.today()), tvb = G.state.habits.tvb;
        tvb[wk] = (tvb[wk] || 0) + 1;
        G.save();
        G.toast('本周第 ' + tvb[wk] + ' 次观看，已记录');
      },
      'today-listen': function () {
        G.toast('收听计时在「习惯养成」里，去那边开始计时');
        G.go('habits');
        return false;
      },
      'today-blog': function (el) {
        var t = G.today(), posts = G.state.habits.blog.posts;
        if (posts[t]) { delete posts[t]; G.toast('已取消今天的写作打卡'); }
        else { posts[t] = { title: '', words: 0 }; G.toast('写作打卡完成'); }
        G.save();
      },
      'task-toggle': function (el) {
        var id = el.getAttribute('data-id');
        var task = G.state.work.tasks.filter(function (x) { return x.id === id; })[0];
        if (!task) return;
        task.done = !task.done;
        task.doneAt = task.done ? G.today() : '';
        G.save();
        G.toast(task.done ? '完成啦' : '已恢复为未完成');
      },
      'cal-prev': function () {
        calCursor = G.monthKey(G.shift(G.monthStart(calCursor || G.monthKey(G.today())), -1));
      },
      'cal-next': function () {
        var mk = calCursor || G.monthKey(G.today());
        var next = G.monthKey(G.shift(G.monthEnd(mk), 1));
        if (next > G.monthKey(G.today())) { G.toast('还没到那个月呢'); return false; }
        calCursor = next;
      },
      'cal-today': function () { calCursor = G.monthKey(G.today()); },
      'cal-day': function (el) {
        var day = el.getAttribute('data-day');
        G.sheet({
          title: '这一天的记录',
          html: dayDetail(day),
          onMount: function (root) {
            var wb = root.querySelector('[data-sheet-water]');
            if (wb) {
              wb.onclick = function () {
                var d = wb.getAttribute('data-sheet-water');
                var w = G.state.habits.water;
                if (w[d]) delete w[d]; else w[d] = true;
                G.save();
                G.closeSheet();
                G.render();
                G.toast(w[d] ? '已补打卡「' + G.fmtMD(d) + '」' : '已取消那天的打卡');
              };
            }
            var gob = root.querySelector('[data-go]');
            if (gob) {
              gob.onclick = function () {
                var id = gob.getAttribute('data-go');
                G.closeSheet();
                G.go(id);
              };
            }
          }
        });
        return false;
      }
    },
    render: function (root) {
      var tasks = todayTasks();
      root.innerHTML =
        '<div class="card tint">' +
          '<div class="spread"><div><div class="card-title">' + greeting() + '，gxx</div>' +
          '<div class="card-sub">' + G.fmtCN(G.today()) + ' · 今天也要好好照顾自己</div></div></div>' +
        '</div>' +

        remindStrip() +

        calendarCard() +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('list') +
            '<div class="grow"><div class="card-title">今日待办</div>' +
            '<div class="card-sub">' + (tasks.length ? '还有 ' + tasks.length + ' 件没做完' : '今天的都清空啦') + '</div></div>' +
            '<button class="btn xs line" data-go="work">全部</button>' +
          '</div>' +
          (tasks.length
            ? '<div class="list">' + tasks.slice(0, 4).map(function (x) {
                return '<div class="item plain">' + G.checkBox(false, 'task-toggle', '', 'data-id="' + G.esc(x.id) + '"') +
                  '<div class="item-main"><div class="item-title">' + G.esc(x.text) + '</div>' +
                  '<div class="item-sub">' + ptag(x.priority) + ' ' + dueLabel(x.due) + '</div></div></div>';
              }).join('') + '</div>'
            : G.emptyBox('暂时没有待办，去「工作」加一条')) +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('habits') +
            '<div class="grow"><div class="card-title">今日习惯</div>' +
            '<div class="card-sub">点一下就能打卡</div></div>' +
            '<button class="btn xs line" data-go="habits">详情</button>' +
          '</div>' +
          '<div class="list">' + habitRows() + '</div>' +
        '</div>' +

        '<div class="grid two">' +
          '<div class="card"><div class="card-head">' + G.icon('fitness') +
            '<div class="grow"><div class="card-title">本周健身</div></div>' +
            '<button class="btn xs line" data-go="fitness">详情</button></div>' +
            fitnessMini() + '</div>' +
          '<div class="card"><div class="card-head">' + G.icon('learn') +
            '<div class="grow"><div class="card-title">学习进度</div></div>' +
            '<button class="btn xs line" data-go="learn">详情</button></div>' +
            learnMini() + '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('news') +
            '<div class="grow"><div class="card-title">今日热点</div>' +
            '<div class="card-sub">央视新闻 · 人民网 · 新华网</div></div>' +
            '<button class="btn xs line" data-go="news">更多</button>' +
          '</div>' + hotList() +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('mood') +
            '<div class="grow"><div class="card-title">心情</div></div>' +
            '<button class="btn xs line" data-go="mood">日记</button>' +
          '</div>' + moodLine() +
        '</div>' +

        '<button class="btn block line" data-go="settings">' + G.icon('sun') + '外观、数据保存位置与备份，都在「设置」里</button>';
    }
  });

  function ptag(p) {
    var m = { high: ['高', 'p0'], mid: ['中', 'p1'], low: ['低', 'p2'] };
    var v = m[p] || m.mid;
    return '<span class="tag ' + v[1] + '">' + v[0] + '</span>';
  }
  function dueLabel(due) {
    if (!due) return '<span class="muted">不限日期</span>';
    var t = G.today();
    if (due < t) return '<span class="danger-text">逾期 ' + G.fmtMD(due) + '</span>';
    return '<span class="muted">' + G.relDay(due) + '</span>';
  }

  G.todayHelpers = { ptag: ptag, dueLabel: dueLabel, srcName: srcName, srcCls: srcCls };
})();
