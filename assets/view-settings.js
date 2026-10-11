/* ============================================================
   模块：设置（字体大小 / 颜色基调 / 数据保存位置 / 备份）
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;
  var probe = null;          // 电脑端服务返回的信息
  var probing = false;

  function S() { return G.state.settings; }

  function isRemote() {
    if (location.protocol === 'file:') return false;
    var h = location.hostname;
    return !(h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '');
  }

  function statusLine() {
    var s = S();
    if (!s.sync) {
      return '<span class="tag plain">只保存在这台设备</span>';
    }
    if (probe && probe.ok) {
      return '<span class="tag ok">已连接电脑</span>';
    }
    if (probe && probe.ok === false) {
      return '<span class="tag danger">连不上电脑</span>';
    }
    return '<span class="tag warn">未检测</span>';
  }

  function probeNow(then) {
    if (probing) return;
    probing = true;
    G.api('/api/info').then(function (info) {
      probe = info || { ok: false };
    }, function (err) {
      probe = { ok: false, error: String(err && err.message || err) };
    }).then(function () {
      probing = false;
      if (typeof then === 'function') then();
    });
  }

  /* ------------------------------------- 电脑提醒（上班 / 下班打卡） */
  var remInfo = null, remLoading = false;
  function loadReminders(cb) {
    if (remLoading) return;
    remLoading = true;
    G.api('/api/reminders').then(function (res) {
      remInfo = (res && res.ok) ? res : { ok: false };
    }, function () {
      remInfo = { ok: false };
    }).then(function () {
      remLoading = false;
      if (typeof cb === 'function') cb();
    });
  }
  function remCfg() {
    var cfg = (remInfo && remInfo.config) || {};
    var r = S().reminder || {};
    return {
      morningTime: cfg.morningTime || r.morning || '07:30',
      eveningTime: cfg.eveningTime || r.evening || '17:10',
      morningText: cfg.morningText || '',
      eveningText: cfg.eveningText || '',
      refreshNewsInMorning: cfg.refreshNewsInMorning !== false
    };
  }
  function remTasksHtml() {
    if (!remInfo || !remInfo.tasks) {
      if (isRemote()) {
        return '<p class="hint" style="margin-top:10px">手机上改不了电脑的提醒设置。要改时间或内容，请在电脑浏览器里打开工作台。</p>';
      }
      return '<p class="hint" style="margin-top:10px">要在电脑上运行 <b>tools\\serve.ps1</b>（窗口开着）之后，才能从这里安装和改时间。</p>';
    }
    return '<div class="divider"></div><div class="list">' + remInfo.tasks.map(function (t) {
      var label = t.name.indexOf('evening') >= 0 ? '下班打卡提醒' : '上班打卡提醒';
      return '<div class="item plain"><div class="grow"><div class="item-title">' + label + ' · ' +
        (t.installed ? '已装到电脑' : '还没装') + '</div>' +
        '<div class="item-sub">状态 ' + G.esc(t.state || '—') + (t.lastRun ? ' · 上次运行 ' + G.esc(t.lastRun) : '') + '</div></div></div>';
    }).join('') + '</div>';
  }
  function remCard() {
    var c = remCfg();
    return '<div class="card">' +
      '<div class="card-head">' + G.icon('clock') +
        '<div class="grow"><div class="card-title">打卡提醒</div>' +
        '<div class="card-sub">到点由电脑弹通知，跟工作台开没开着没关系</div></div>' +
        (remInfo && remInfo.tasks ? '<span class="tag ok">已装到电脑</span>' : '<span class="tag plain">未检测</span>') +
      '</div>' +
      '<div class="row-form" style="margin-bottom:9px">' +
        '<div class="field grow" style="margin:0"><label>上班打卡提醒</label>' +
          '<input class="input" id="remMorningTime" type="time" value="' + G.esc(c.morningTime) + '"></div>' +
        '<div class="field grow" style="margin:0"><label>下班打卡提醒</label>' +
          '<input class="input" id="remEveningTime" type="time" value="' + G.esc(c.eveningTime) + '"></div>' +
      '</div>' +
      '<div class="field"><label>上班提醒内容</label>' +
        '<input class="input" id="remMorningText" value="' + G.esc(c.morningText) + '"></div>' +
      '<div class="field"><label>下班提醒内容</label>' +
        '<input class="input" id="remEveningText" value="' + G.esc(c.eveningText) + '"></div>' +
      '<div class="row" style="margin-bottom:11px"><label class="row" style="gap:7px">' +
        '<input type="checkbox" id="remNews"' + (c.refreshNewsInMorning ? ' checked' : '') + '> 早上顺手更新今天的热点</label></div>' +
      '<div class="row">' +
        '<button class="btn sm primary" data-act="rem-save">' + G.icon('check') + '保存并更新电脑提醒</button>' +
        '<button class="btn sm line" data-act="rem-test">' + G.icon('clock') + '在电脑上试一条</button>' +
      '</div>' +
      remTasksHtml() +
    '</div>';
  }

  G.register('settings', {
    title: '设置',
    nav: '设置',
    icon: 'sun',
    sub: function () { return '外观、数据保存位置和备份都在这'; },
    actions: {
      'set-font': function (el) {
        S().fontScale = Number(el.getAttribute('data-v')) || 1;
        G.applyAppearance();
        G.save();
        G.toast('字体大小已改为「' + el.getAttribute('data-name') + '」');
      },
      'set-theme': function (el) {
        S().theme = el.getAttribute('data-theme');
        G.applyAppearance();
        G.save();
        G.toast('配色已切换为「' + G.themeInfo(S().theme).name + '」');
      },
      'set-sync': function (el) {
        S().sync = !!el.checked;
        G.save();
        if (S().sync) {
          if (location.protocol === 'file:') {
            G.toast('记得在电脑上运行 tools\\serve.ps1');
          }
          G.render();
        }
      },
      'test-conn': function () {
        G.toast('正在连接电脑上的服务…');
        probeNow(function () { G.render(); });
        return false;
      },
      'set-dir': function (el, ev, ctx) {
        var input = ctx.root.querySelector('#pcDir');
        var dir = (input && input.value || '').trim();
        if (!dir) { G.toast('先写下电脑上的文件夹，例如 D:\\gxx数据'); return false; }
        G.toast('正在设置…');
        G.api('/api/setpath', { body: { dir: dir } }).then(function (res) {
          if (res && res.ok) {
            probe = res;
            G.toast('保存位置已设为 ' + res.dir);
          } else {
            G.toast('设置失败：' + ((res && res.error) || '路径不可用'));
          }
          G.render();
        }, function (err) {
          G.toast('设置失败：' + String(err && err.message || err));
          G.render();
        });
        return false;
      },
      'sync-now': function () {
        G.toast('正在保存到电脑…');
        G.syncToPc(true).then(function () {
          probeNow(function () { G.render(); });
        }, function () {
          G.render();
        });
        return false;
      },
      'load-pc': function () {
        G.toast('正在读取电脑上的文件…');
        G.api('/api/load').then(function (res) {
          var data = res && (res.data || res);
          if (!data || !data.habits) {
            G.toast(res && res.error ? ('读取失败：' + res.error) : '电脑上的文件还没有数据');
            return;
          }
          G.confirmBox('用电脑文件里的数据覆盖这台设备现在的记录吗？', '覆盖').then(function (ok) {
            if (!ok) return;
            Object.keys(G.state).forEach(function (k) { delete G.state[k]; });
            Object.keys(data).forEach(function (k) { G.state[k] = data[k]; });
            G.applyAppearance();
            G.save();
            G.toast('已从电脑文件读回');
            G.render();
          });
        }, function (err) {
          G.toast('读取失败：' + String(err && err.message || err));
        });
        return false;
      },
      'pc-refresh-news': function () {
        G.toast('正在让电脑抓取今天的热点，大约 20 秒…');
        G.api('/api/refresh', { body: {}, timeout: 90000 }).then(function (res) {
          if (!res || !res.ok) { G.toast('抓取失败：' + ((res && res.error) || '未知原因')); return; }
          var script = document.createElement('script');
          script.src = 'assets/news-data.js?t=' + Date.now();
          script.onload = function () {
            G.toast('热点已更新：' + (res.total || 0) + ' 条');
            G.render();
          };
          script.onerror = function () { G.toast('数据读回来了，但页面加载失败，刷新一下即可'); };
          document.head.appendChild(script);
        }, function (err) {
          G.toast('抓取失败：' + String(err && err.message || err));
        });
        return false;
      },
      'rem-save': function (el, ev, ctx) {
        var root = ctx.root;
        var re = /^([01]\d|2[0-3]):[0-5]\d$/;
        var m = (root.querySelector('#remMorningTime').value || '').trim();
        var e2 = (root.querySelector('#remEveningTime').value || '').trim();
        if (!re.test(m) || !re.test(e2)) { G.toast('时间格式要像 07:30 这样'); return false; }
        var body = {
          morningTime: m,
          eveningTime: e2,
          morningText: (root.querySelector('#remMorningText').value || '').trim(),
          eveningText: (root.querySelector('#remEveningText').value || '').trim(),
          refreshNewsInMorning: !!root.querySelector('#remNews').checked
        };
        var r = S().reminder || (S().reminder = { morning: '07:30', evening: '17:10', ack: {} });
        r.morning = m;
        r.evening = e2;
        G.save();
        G.toast('正在更新电脑提醒…');
        G.api('/api/reminders', { body: body, timeout: 60000 }).then(function (res) {
          if (res && res.ok) G.toast('提醒已更新：上班 ' + m + '，下班 ' + e2);
          else G.toast('没改成：' + ((res && res.error) || '先在电脑上运行 tools\\serve.ps1'));
          loadReminders(function () { G.render(); });
        }, function (err) {
          G.toast('连不上电脑服务：' + String(err && err.message || err));
          G.render();
        });
        return false;
      },
      'rem-test': function () {
        G.toast('正在让电脑弹一条测试提醒…');
        G.api('/api/notify', { body: { kind: 'morning' }, timeout: 30000 }).then(function (res) {
          G.toast(res && res.ok ? '电脑上应该弹出来了' : ('没能弹出：' + ((res && res.error) || '未知原因')));
        }, function (err) {
          G.toast('连不上电脑服务：' + String(err && err.message || err));
        });
        return false;
      },
      'data-export': function () {
        var blob = new Blob([JSON.stringify(G.state, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'gxx空间备份-' + G.today() + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        G.toast('备份文件已生成');
        return false;
      },
      'data-copy': function () {
        G.sheet({
          title: '备份文本（长按全选复制）',
          html: '<div class="field"><textarea class="textarea" id="bkText" style="min-height:200px;font-size:calc(11.5px * var(--fs))" readonly>' +
            G.esc(JSON.stringify(G.state)) + '</textarea></div>' +
            '<button class="btn primary block" id="bkCopy">复制到剪贴板</button>' +
            '<p class="hint" style="margin-top:8px">复制不了就手动长按上面的文字全选复制，存到备忘录或微信里。</p>',
          onMount: function (root) {
            var ta = root.querySelector('#bkText');
            root.querySelector('#bkCopy').onclick = function () {
              try { ta.select(); document.execCommand('copy'); G.toast('已复制'); }
              catch (e) { G.toast('复制失败，请手动长按选择'); }
            };
          }
        });
        return false;
      },
      'data-import': function (el, ev, ctx) {
        var input = ctx.root.querySelector('#importFile');
        if (!input) return false;
        input.value = '';
        input.click();
        return false;
      },
      'data-wipe': function () {
        G.confirmBox('清空这台设备上的全部记录？清空后找不回来，建议先导出备份。', '确认清空').then(function (ok) {
          if (!ok) return;
          var sync = S().sync, apiBase = S().apiBase;
          G.resetAll();
          G.state.settings.sync = sync;
          G.state.settings.apiBase = apiBase;
          G.applyAppearance();
          G.save();
          G.toast('已清空');
          G.render();
        });
        return false;
      },
      'reset-appearance': function () {
        S().fontScale = 1;
        S().theme = 'pink';
        G.applyAppearance();
        G.save();
        G.toast('外观已恢复默认');
      }
    },
    changes: {
      'import-file': function (el) {
        var f = el.files && el.files[0];
        if (!f) return false;
        var reader = new FileReader();
        reader.onload = function () {
          var data;
          try { data = JSON.parse(String(reader.result)); } catch (e) { G.toast('这个文件不是备份文件'); return; }
          if (!data || !data.habits || !data.work) { G.toast('备份文件格式不对'); return; }
          G.confirmBox('用这个备份覆盖现在的数据？现在的记录会被替换。', '覆盖导入').then(function (ok) {
            if (!ok) return;
            Object.keys(G.state).forEach(function (k) { delete G.state[k]; });
            Object.keys(data).forEach(function (k) { G.state[k] = data[k]; });
            G.applyAppearance();
            G.save();
            G.toast('导入完成');
            G.render();
          });
        };
        reader.readAsText(f);
        return false;
      }
    },
    inputs: {
      'api-base': function (el) { S().apiBase = el.value.trim(); G.saveSoon(); return false; },
      'pc-dir-input': function (el) { return false; }
    },
    render: function (root) {
      var s = S();
      var fs = Number(s.fontScale) || 1;
      var isFile = location.protocol === 'file:';
      var pcPath = (probe && probe.file) || (s.dataDir ? (s.dataDir + '\\gxx-data.json') : '');

      root.innerHTML =
        '<div class="card">' +
          '<div class="card-head">' + G.icon('sun') +
            '<div class="grow"><div class="card-title">外观</div>' +
            '<div class="card-sub">改完立刻生效，也记在这台设备上</div></div>' +
            '<button class="btn xs line" data-act="reset-appearance">恢复默认</button>' +
          '</div>' +

          '<div class="small muted" style="margin-bottom:6px">字体大小</div>' +
          '<div class="font-row" style="margin-bottom:9px">' +
            G.FONT_STEPS.map(function (f) {
              var on = Math.abs(f.v - fs) < 0.001;
              return '<button class="btn sm ' + (on ? 'primary' : 'line') + '" data-act="set-font" data-v="' + f.v + '" data-name="' + f.name + '">' + f.name + '</button>';
            }).join('') +
          '</div>' +
          '<div class="sample-line small">示例：习惯养成 · 今天也要好好照顾自己，慢慢来比较快。</div>' +

          '<div class="small muted" style="margin:13px 0 6px">颜色基调</div>' +
          '<div class="theme-grid">' +
            G.THEMES.map(function (t) {
              return '<button class="theme-swatch ' + (s.theme === t.id ? 'on' : '') + '" data-act="set-theme" data-theme="' + t.id + '">' +
                '<span class="theme-dots"><i style="background:' + t.colors[1] + '"></i>' +
                '<i style="background:' + t.colors[2] + '"></i>' +
                '<i style="background:' + t.colors[0] + '"></i></span>' +
                '<span class="small">' + t.name + '</span></button>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('copy') +
            '<div class="grow"><div class="card-title">数据保存位置</div>' +
            '<div class="card-sub">' + (isFile ? '当前是这个网页文件' : '当前从 ' + G.esc(location.host || '本机') + ' 打开') + '</div></div>' +
            statusLine() +
          '</div>' +
          '<p class="hint" style="margin-bottom:10px">手机上没有「文件夹路径」这个概念，所以这里说的保存位置指的是<b>电脑上的文件夹</b>：开启同步后，每次改动都会自动写进电脑里的一个数据文件，可以用云盘同步，也方便备份。</p>' +

          (isRemote()
            ? '<div class="sticky-note info" style="margin-bottom:11px">你现在是从网上的地址打开的，手机连不到你电脑上的服务，所以下面这些按钮点了也不会生效。' +
              '要设置数据保存位置、改打卡提醒时间，请在<b>电脑浏览器</b>里打开工作台（直接双击 index.html，或访问 <b>tools\\serve.ps1</b> 给出的本机地址）。</div>'
            : '') +

          '<div class="row" style="margin-bottom:11px">' +
            '<label class="row" style="gap:7px"><input type="checkbox" data-chg="set-sync" ' + (s.sync ? 'checked' : '') + '> 自动同步到电脑文件</label>' +
          '</div>' +

          '<div class="field"><label>电脑上的文件夹</label>' +
            '<div class="row-form">' +
              '<input class="input" id="pcDir" placeholder="例如 D:\\gxx数据 或 C:\\Users\\Lenovo\\Documents\\gxx" value="' + G.esc(probe && probe.dir ? probe.dir : '') + '" data-inp="pc-dir-input">' +
              '<button class="btn sm line" data-act="set-dir">用这个文件夹</button>' +
            '</div></div>' +

          '<div class="grid three" style="margin:10px 0">' +
            G.statBox('数据文件', pcPath ? pcPath.split('\\').pop() : '未设置') +
            G.statBox('上次保存', s.lastSyncAt || '—') +
            G.statBox('文件位置', probe && probe.dir ? probe.dir : '—') +
          '</div>' +
          (pcPath ? '<p class="hint" style="margin-bottom:10px">完整路径：' + G.esc(pcPath) + '</p>' : '') +
          (s.lastSyncNote ? '<p class="hint danger-text" style="margin-bottom:10px">最近一次失败：' + G.esc(s.lastSyncNote) + '</p>' : '') +

          '<div class="row">' +
            '<button class="btn sm line" data-act="test-conn">' + G.icon('link') + '测试连接</button>' +
            '<button class="btn sm primary" data-act="sync-now">' + G.icon('check') + '立即保存到电脑</button>' +
            '<button class="btn sm line" data-act="load-pc">' + G.icon('refresh') + '从电脑文件读回</button>' +
            '<button class="btn sm line" data-act="pc-refresh-news">' + G.icon('news') + '让电脑抓一次热点</button>' +
          '</div>' +

          (isFile
            ? '<div class="field" style="margin-top:12px"><label>电脑服务的地址（用文件方式打开时需要）</label>' +
              '<input class="input" placeholder="http://127.0.0.1:8080" value="' + G.esc(s.apiBase || '') + '" data-inp="api-base"></div>'
            : '') +

          '<p class="hint" style="margin-top:11px">同步需要电脑上运行着 <b>tools\\serve.ps1</b>。服务窗口关掉后同步会失败，但记录还在手机上，下次开服务会重新补上。</p>' +
        '</div>' +

        remCard() +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('external') +
            '<div class="grow"><div class="card-title">本机备份</div>' +
            '<div class="card-sub">导出、复制、导入、清空</div></div>' +
          '</div>' +
          '<div class="row">' +
            '<button class="btn sm line" data-act="data-export">' + G.icon('external') + '导出备份</button>' +
            '<button class="btn sm line" data-act="data-copy">' + G.icon('copy') + '复制备份</button>' +
            '<button class="btn sm line" data-act="data-import">' + G.icon('refresh') + '导入备份</button>' +
            '<button class="btn sm danger" data-act="data-wipe">' + G.icon('trash') + '清空</button>' +
          '</div>' +
          '<input type="file" id="importFile" accept=".json,application/json" hidden data-chg="import-file">' +
          '<p class="hint" style="margin-top:9px">不管开没开同步，用浏览器打开时记录都存在浏览器本地；换手机、换浏览器、清理浏览器数据都会让它消失，所以建议每月导出一份。</p>' +
        '</div>' +

        '<div class="card flat">' +
          '<p class="hint">gxx的空间 · 数据不上传任何服务器，抓热点时才需要电脑联网。</p>' +
        '</div>';

      if (!probe && !probing && !isRemote()) {
        probeNow(function () { G.render(); });
      }
      if (!remInfo && !remLoading) {
        if (!isRemote()) loadReminders(function () { G.render(); });
      }
    }
  });
})();
