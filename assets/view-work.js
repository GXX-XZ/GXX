/* ============================================================
   模块：工作 · 自定义待办清单
   添加 / 勾选完成 / 删除，优先级（高/中/低）+ 截止日期
   默认「今日待办」，另有 全部 / 进行中 / 已完成
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;
  var PANES = [
    { id: 'today', label: '今日待办' },
    { id: 'all', label: '全部' },
    { id: 'doing', label: '进行中' },
    { id: 'done', label: '已完成' }
  ];
  var filter = 'today';
  var PRIO = { high: ['高', 'p0', 0], mid: ['中', 'p1', 1], low: ['低', 'p2', 2] };

  function W() { return G.state.work; }
  function todayList() {
    var t = G.today();
    return W().tasks.filter(function (x) { return !x.done && (!x.due || x.due <= t); });
  }
  function sortTasks(list) {
    return list.slice().sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      var pa = PRIO[a.priority] ? PRIO[a.priority][2] : 1;
      var pb = PRIO[b.priority] ? PRIO[b.priority][2] : 1;
      if (pa !== pb) return pa - pb;
      return (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99');
    });
  }
  function listFor(pane) {
    var t = G.today();
    if (pane === 'today') return sortTasks(todayList());
    if (pane === 'doing') return sortTasks(W().tasks.filter(function (x) { return !x.done; }));
    if (pane === 'done') return sortTasks(W().tasks.filter(function (x) { return x.done; }));
    return sortTasks(W().tasks);
  }
  function countFor(pane) {
    var t = G.today();
    if (pane === 'today') return W().tasks.filter(function (x) { return !x.done && (!x.due || x.due <= t); }).length;
    if (pane === 'doing') return W().tasks.filter(function (x) { return !x.done; }).length;
    if (pane === 'done') return W().tasks.filter(function (x) { return x.done; }).length;
    return W().tasks.length;
  }

  function prioTag(p) {
    var v = PRIO[p] || PRIO.mid;
    return '<span class="tag ' + v[1] + '">' + v[0] + '</span>';
  }
  function dueTag(due, done) {
    if (!due) return '<span class="tag plain muted">不限日期</span>';
    var t = G.today();
    if (!done && due < t) return '<span class="tag danger">逾期 ' + G.fmtMD(due) + '</span>';
    if (due === t) return '<span class="tag warn">今天到期</span>';
    return '<span class="tag plain">' + G.fmtMD(due) + '</span>';
  }

  function taskRow(x) {
    return '<div class="item ' + (x.done ? 'done' : '') + '">' +
      G.checkBox(!!x.done, 'task-toggle', '', 'data-id="' + G.esc(x.id) + '"') +
      '<div class="item-main">' +
        '<div class="item-title">' + G.esc(x.text) + '</div>' +
        '<div class="item-sub row tight">' + prioTag(x.priority) + dueTag(x.due, x.done) +
          (x.done && x.doneAt ? '<span class="muted">完成于 ' + G.fmtMD(x.doneAt) + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="row tight">' +
        '<button class="icon-btn sm" data-act="task-edit" data-id="' + G.esc(x.id) + '" aria-label="编辑">' + G.icon('edit') + '</button>' +
        '<button class="icon-btn sm" data-act="task-del" data-id="' + G.esc(x.id) + '" aria-label="删除">' + G.icon('trash') + '</button>' +
      '</div>' +
    '</div>';
  }

  G.register('work', {
    title: '工作',
    nav: '工作',
    icon: 'work',
    sub: function () {
      var t = G.today(), mk = G.monthKey(t);
      var doneMonth = W().tasks.filter(function (x) { return x.done && x.doneAt && G.inMonth(x.doneAt, mk); }).length;
      return '今日待办 ' + todayList().length + ' 条 · 本月完成 ' + doneMonth + ' 条';
    },
    badge: function () {
      var n = todayList().length;
      return n ? String(n) : '';
    },
    actions: {
      'pane': function (el) {
        filter = el.getAttribute('data-pane');
        return true;
      },
      'task-add': function (el, ev, ctx) {
        var root = ctx.root;
        var input = root.querySelector('#taskText');
        var text = (input && input.value || '').trim();
        if (!text) { G.toast('先写一条待办内容'); return false; }
        var prio = root.querySelector('#taskPrio').value;
        var due = root.querySelector('#taskDue').value;
        W().tasks.push({
          id: G.uid('tk'),
          text: text,
          priority: prio,
          due: due,
          done: false,
          doneAt: '',
          createdAt: G.today()
        });
        G.save();
        G.toast('已添加');
        return true;
      },
      'task-toggle': function (el) {
        var id = el.getAttribute('data-id');
        var x = W().tasks.filter(function (t) { return t.id === id; })[0];
        if (!x) return false;
        x.done = !x.done;
        x.doneAt = x.done ? G.today() : '';
        G.save();
        G.toast(x.done ? '完成啦' : '已恢复');
      },
      'task-del': function (el) {
        var id = el.getAttribute('data-id');
        G.confirmBox('删除这条待办？删掉就找不回来了。', '删除').then(function (ok) {
          if (!ok) return;
          W().tasks = W().tasks.filter(function (t) { return t.id !== id; });
          G.save();
          G.toast('已删除');
          G.render();
        });
        return false;
      },
      'task-edit': function (el) {
        var id = el.getAttribute('data-id');
        var x = W().tasks.filter(function (t) { return t.id === id; })[0];
        if (!x) return false;
        G.sheet({
          title: '编辑待办',
          html:
            '<div class="field"><label>内容</label><input class="input" id="edText" value="' + G.esc(x.text) + '"></div>' +
            '<div class="field"><label>优先级</label><select class="select" id="edPrio">' +
              '<option value="high"' + (x.priority === 'high' ? ' selected' : '') + '>高</option>' +
              '<option value="mid"' + (x.priority === 'mid' ? ' selected' : '') + '>中</option>' +
              '<option value="low"' + (x.priority === 'low' ? ' selected' : '') + '>低</option>' +
            '</select></div>' +
            '<div class="field"><label>截止日期</label><input class="input" id="edDue" type="date" value="' + G.esc(x.due || '') + '"></div>' +
            '<div class="row"><button class="btn primary grow" id="edSave">保存</button>' +
            '<button class="btn line" id="edClear">清空日期</button></div>',
          onMount: function (root) {
            root.querySelector('#edSave').onclick = function () {
              x.text = root.querySelector('#edText').value || x.text;
              x.priority = root.querySelector('#edPrio').value;
              x.due = root.querySelector('#edDue').value;
              G.save();
              G.closeSheet();
              G.toast('已保存');
              G.render();
            };
            root.querySelector('#edClear').onclick = function () {
              root.querySelector('#edDue').value = '';
            };
          }
        });
        return false;
      },
      'task-clear-done': function () {
        var n = countFor('done');
        if (!n) { G.toast('还没有已完成的待办'); return false; }
        G.confirmBox('清空 ' + n + ' 条已完成的待办？', '清空').then(function (ok) {
          if (!ok) return;
          W().tasks = W().tasks.filter(function (t) { return !t.done; });
          G.save();
          G.render();
        });
        return false;
      }
    },
    render: function (root) {
      var t = G.today();
      var list = listFor(filter);
      var overdue = W().tasks.filter(function (x) { return !x.done && x.due && x.due < t; }).length;
      var doneToday = W().tasks.filter(function (x) { return x.done && x.doneAt === t; }).length;

      root.innerHTML =
        '<div class="card">' +
          '<div class="card-head">' + G.icon('plus') +
            '<div class="grow"><div class="card-title">添加待办</div>' +
            '<div class="card-sub">优先级默认「中」，不加日期就进今天的清单</div></div>' +
          '</div>' +
          '<div class="composer">' +
            '<input class="input" id="taskText" placeholder="要做什么？" enterkeyhint="done">' +
            '<div class="row-form">' +
              '<select class="select" id="taskPrio">' +
                '<option value="high">高优先级</option>' +
                '<option value="mid" selected>中优先级</option>' +
                '<option value="low">低优先级</option>' +
              '</select>' +
              '<input class="input" id="taskDue" type="date">' +
            '</div>' +
            '<button class="btn primary block" data-act="task-add">' + G.icon('plus') + '添加</button>' +
          '</div>' +
        '</div>' +

        '<div class="grid three" style="margin-bottom:13px">' +
          G.statBox('今日待办', todayList().length, '条') +
          G.statBox('今日完成', doneToday, '条') +
          G.statBox('已逾期', overdue, '条') +
        '</div>' +

        '<div class="card">' +
          '<div class="tabs">' + PANES.map(function (p) {
            return '<button class="tab ' + (filter === p.id ? 'on' : '') + '" data-act="pane" data-pane="' + p.id + '">' +
              p.label + '<span class="n">' + countFor(p.id) + '</span></button>';
          }).join('') + '</div>' +
          (list.length
            ? '<div class="list">' + list.map(taskRow).join('') + '</div>'
            : G.emptyBox(filter === 'done' ? '还没有已完成的待办' : '这里空空的，加一条吧')) +
          (filter === 'done' && countFor('done') > 0
            ? '<div style="margin-top:11px"><button class="btn sm line" data-act="task-clear-done">' + G.icon('trash') + '清空已完成</button></div>'
            : '') +
          '<p class="hint" style="margin-top:10px">今日待办 = 没写日期或截止日期在今天及之前的未完成事项，按优先级从高到低排。</p>' +
        '</div>';
    }
  });
})();
