/* ============================================================
   模块：我的自媒体（小红书 / 剪映新手赛道）
   - 关键词直达小红书搜索页（不抓取，点开即跳转）
   - 选题灵感库（可自己加）
   - 爆款拆解：粘贴标题 + 正文，自动出结构化拆解与评分
   ============================================================ */
(function () {
  'use strict';
  var G = window.GXX;

  var KEYWORDS = ['剪映新手', '剪映小白', '剪映教程', '新手剪辑', '剪映技巧', '手机剪辑入门'];
  var TEMPLATES = [
    { text: '零基础学剪映：第一步先搞懂这 3 个界面', tag: '入门' },
    { text: '剪映新手最容易踩的 5 个坑', tag: '踩坑' },
    { text: '不用电脑，手机 5 分钟剪出一条完整视频', tag: '效率' },
    { text: '剪映自动字幕怎么改才不难看？', tag: '字幕' },
    { text: '新手剪辑卡点视频，记住这一个技巧就够', tag: '卡点' },
    { text: '剪映转场别乱用，这 3 个最不容易翻车', tag: '转场' },
    { text: '一条视频改 3 个地方，播放量翻了 5 倍', tag: '复盘' },
    { text: '第一次发小红书视频，封面该怎么做？', tag: '封面' },
    { text: '新手剪辑常见问题：为什么导出后变模糊', tag: '画质' },
    { text: '剪映调色入门：一个滤镜解决 90% 画面问题', tag: '调色' },
    { text: '小白也能上手：把长视频剪成 3 条短视频', tag: '拆条' },
    { text: '剪映新手一周练习计划（照做就行）', tag: '计划' }
  ];
  var TAGS = ['剪映教程', '剪映新手入门', '新手剪辑', '剪映技巧', '手机剪辑', '零基础学剪辑',
    '短视频运营', '自媒体干货', '剪辑教程', '剪映小技巧', '视频剪辑', '起号'];

  var HOOKS = [
    { k: '具体数字', re: /\d/, tip: '加一个具体数字（3 个坑、5 分钟），让人一眼知道能得到什么' },
    { k: '疑问/悬念', re: /[？?]|为什么|怎么|如何|是不是|到底|居然|竟然|原来/, tip: '用一句提问或反差制造悬念，例如「为什么你剪的片子总差点意思？」' },
    { k: '身份代入', re: /新手|小白|零基础|入门|刚开始|上班族|学生|宝妈|打工人/, tip: '点名人群：新手 / 小白 / 零基础，对的人才会点进来' },
    { k: '痛点踩坑', re: /踩坑|翻车|不会|太难|卡住|没流量|限流|失败|浪费|劝退|后悔|注意|别/, tip: '把对方的痛写进标题：踩坑、翻车、没流量，比讲道理更抓人' },
    { k: '结果承诺', re: /学会|搞定|秒会|一次|3\s*天|一周|分钟|简单|轻松|上手|出片/, tip: '给出明确结果和时间成本：5 分钟学会、一周上手' },
    { k: '情绪词', re: /绝了|太香|真香|救命|惊艳|无敌|必看|千万别|狠狠|哭|痛/, tip: '加一点情绪浓度，但要跟内容相符，别硬凑' },
    { k: '互动引导', re: /评论区|留言|点赞|收藏|关注|你们|有没有|一起/, tip: '结尾留一句互动：你卡在哪一步？评论区说' },
    { k: '干货福利', re: /免费|模板|素材|资源|干货|分享|拿走|整理/, tip: '有分享感的内容更容易被收藏：模板、清单、整理好的步骤' }
  ];
  var MOODS = { 好奇: /为什么|怎么|如何|居然|竟然|到底|原来/, 共鸣: /我也|新手|小白|一起|是不是|有没有/, 焦虑: /没流量|限流|失败|踩坑|翻车|后悔|劝退/, 惊喜: /绝了|太香|惊艳|无敌|原来/, 认同: /记住|一定|必须|建议|真的|亲测/ };

  function M() { return G.state.media; }
  function xhs(kw) {
    return 'https://www.xiaohongshu.com/search_result?keyword=' + encodeURIComponent(kw) + '&source=web_explore_feed';
  }
  function hasEmoji(s) {
    for (var i = 0; i < s.length; i++) {
      var c = s.codePointAt(i);
      if (c >= 0x1f300 && c <= 0x1faff) return true;
      if (c >= 0x2600 && c <= 0x27bf) return true;
      if (c === 0x2764 || c === 0x2b50) return true;
      if (c > 0xffff) i++;
    }
    return false;
  }
  function countHits(re, s) { return re.test(s); }

  function analyze(title, body) {
    title = title || '';
    body = body || '';
    var all = title + '\n' + body;
    var inTitle = HOOKS.filter(function (h) { return countHits(h.re, title); });
    var hits = HOOKS.filter(function (h) { return countHits(h.re, all); });
    var missing = HOOKS.filter(function (h) { return !countHits(h.re, all); });
    var tags = all.match(/#[^\s#]{1,14}/g) || [];

    var titleScore = 30 + inTitle.length * 12;
    var len = title.replace(/\s/g, '').length;
    titleScore += (len >= 10 && len <= 24) ? 15 : (len > 0 ? 5 : -20);
    titleScore += hasEmoji(title) ? 8 : 0;

    var painScore = 30 + (countHits(HOOKS[3].re, all) ? 25 : 0) + (countHits(HOOKS[2].re, all) ? 20 : 0) + (countHits(HOOKS[4].re, all) ? 20 : 0);
    var trustScore = 25 + (countHits(/\d/, all) ? 20 : 0) + (countHits(/我|亲测|实测|自己|记录|经历/, all) ? 20 : 0)
      + (countHits(/组|步|分钟|次|天|秒/, all) ? 15 : 0) + (countHits(/对比|之前|原来|以前|后来/, all) ? 15 : 0);
    var interactScore = 20 + (countHits(HOOKS[6].re, all) ? 40 : 0) + (countHits(/[？?]/, all) ? 20 : 0) + (countHits(/收藏|关注|点赞/, all) ? 20 : 0);
    var tagScore = Math.min(100, tags.length * 15 + (countHits(/剪映|剪辑/, all) ? 25 : 0) + 10);

    var scores = [
      { k: '标题吸引力', v: G.clamp(titleScore, 0, 100) },
      { k: '痛点明确度', v: G.clamp(painScore, 0, 100) },
      { k: '信任要素', v: G.clamp(trustScore, 0, 100) },
      { k: '互动引导', v: G.clamp(interactScore, 0, 100) },
      { k: '标签覆盖', v: G.clamp(tagScore, 0, 100) }
    ];
    var total = Math.round(G.sum(scores, function (s) { return s.v; }) / scores.length);

    var lines = body.split(/\n+/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 1; });
    var labeled = lines.slice(0, 8).map(function (l) {
      var t = '其它';
      if (/\d|第|首先|第一步|技巧|方法|步骤/.test(l)) t = '干货/步骤';
      if (HOOKS[1].re.test(l) || HOOKS[5].re.test(l)) t = '钩子/情绪';
      if (/我|你|我们|大家|是不是|有没有/.test(l)) t = '共鸣';
      if (/评论|关注|收藏|点赞|留言|一起/.test(l)) t = '互动引导';
      return { line: l, type: t };
    });

    var mood = Object.keys(MOODS).filter(function (k) { return MOODS[k].test(all); });
    var picked = [];
    if (/新手|小白|零基础/.test(all)) picked.push('剪映新手入门', '零基础学剪辑');
    if (/字幕/.test(all)) picked.push('字幕教程');
    if (/封面/.test(all)) picked.push('封面制作');
    if (/卡点|转场/.test(all)) picked.push('转场教程', '卡点视频');
    if (/起号|流量/.test(all)) picked.push('账号起号', '短视频运营');
    var suggestTags = G.uniqBy(TAGS.concat(picked), function (x) { return x; }).slice(0, 8);

    var advice = [];
    var weakest = scores.slice().sort(function (a, b) { return a.v - b.v; }).slice(0, 2);
    weakest.forEach(function (w) {
      if (w.k === '标题吸引力') advice.push('标题再狠一点：数字 + 人群 + 结果，例如「新手剪映 5 分钟出片，只用这一个功能」。');
      if (w.k === '痛点明确度') advice.push('把对方的痛讲出来（没流量、剪得慢、导出模糊），比讲功能更有点击欲。');
      if (w.k === '信任要素') advice.push('加上你的亲身细节：第几次做、花了多久、前后对比，可信度立刻上去。');
      if (w.k === '互动引导') advice.push('结尾补一句提问或引导：你卡在哪一步？评论区告诉我。');
      if (w.k === '标签覆盖') advice.push('标签补到 5-8 个，覆盖「工具词 + 人群词 + 场景词」，例如 #剪映教程 #新手剪辑 #手机剪辑。');
    });
    missing.slice(0, 3).forEach(function (m) { advice.push(m.tip); });
    if (!lines.length) advice.push('正文还没写：建议按「钩子 → 共鸣 → 干货步骤 → 互动引导」四段来写。');

    var formula = '人群（新手/小白）+ 具体痛点 + 结果承诺 + 数字';

    return {
      total: total,
      scores: scores,
      hooks: hits.map(function (h) { return h.k; }),
      missingHooks: missing.map(function (h) { return h.k; }),
      mood: mood,
      labeled: labeled,
      tags: tags,
      suggestTags: suggestTags,
      advice: advice,
      formula: formula
    };
  }

  function bars(result) {
    return result.scores.map(function (s) {
      return '<div class="score-row"><span class="small nowrap" style="width:66px">' + s.k + '</span>' +
        G.bar(s.v, s.v >= 70 ? 'ok' : (s.v >= 45 ? 'warn' : '')) +
        '<span class="score-n num">' + s.v + '</span></div>';
    }).join('');
  }
  function resultHtml(result) {
    return '<div class="analysis-out">' +
      '<div class="analysis-block">' +
        '<h4>总评 ' + result.total + ' 分</h4>' + bars(result) +
        '<p class="hint" style="margin-top:6px">分数是本地规则按标题公式、痛点、信任、互动、标签五个维度算的，只做参考。</p>' +
      '</div>' +
      '<div class="analysis-block"><h4>标题里已经有了</h4>' +
        '<p>' + (result.hooks.length ? result.hooks.map(function (h) { return '<span class="tag ok">' + h + '</span>'; }).join(' ') : '<span class="muted">暂时没识别到明显的爆款元素</span>') + '</p>' +
        (result.missingHooks.length ? '<h4 style="margin-top:8px">还可以补上</h4><p>' + result.missingHooks.map(function (h) { return '<span class="tag warn">' + h + '</span>'; }).join(' ') + '</p>' : '') +
        '<h4 style="margin-top:8px">建议标题公式</h4><p>' + result.formula + '</p>' +
      '</div>' +
      '<div class="analysis-block"><h4>情绪触发</h4>' +
        '<p>' + (result.mood.length ? result.mood.map(function (m) { return '<span class="tag accent">' + m + '</span>'; }).join(' ') : '<span class="muted">情绪不强，可以加一点反差或共鸣</span>') + '</p>' +
      '</div>' +
      (result.labeled.length
        ? '<div class="analysis-block"><h4>正文结构</h4><div class="list">' + result.labeled.map(function (l) {
            return '<div class="item plain"><span class="tag plain nowrap">' + l.type + '</span>' +
              '<div class="item-main"><div class="small ink2">' + G.esc(l.line.slice(0, 60)) + '</div></div></div>';
          }).join('') + '</div><p class="hint" style="margin-top:7px">理想顺序：钩子 → 共鸣 → 干货步骤 → 互动引导。</p></div>'
        : '') +
      '<div class="analysis-block"><h4>标签建议</h4>' +
        '<p>' + result.suggestTags.map(function (t) { return '<span class="tag">#' + t + '</span>'; }).join(' ') + '</p>' +
        (result.tags.length ? '<p class="hint" style="margin-top:6px">你已经写了：' + result.tags.join(' ') + '</p>' : '') +
      '</div>' +
      '<div class="analysis-block"><h4>怎么改</h4><ul>' +
        result.advice.map(function (a) { return '<li>· ' + G.esc(a) + '</li>'; }).join('') +
      '</ul></div>' +
    '</div>';
  }

  G.register('media', {
    title: '我的自媒体',
    nav: '自媒体',
    icon: 'media',
    sub: function () { return '小红书 · 剪映新手 / 小白赛道'; },
    badge: function () {
      var n = M().topics.filter(function (t) { return !t.done; }).length;
      return n ? String(n) : '';
    },
    actions: {
      'topic-add': function (el, ev, ctx) {
        var input = ctx.root.querySelector('#topicText');
        var text = (input && input.value || '').trim();
        if (!text) { G.toast('先写一个选题'); return false; }
        M().topics.push({ id: G.uid('tp'), text: text, tag: '自定', done: false });
        G.save();
        G.toast('已加入选题库');
        return true;
      },
      'topic-load': function () {
        var have = {};
        M().topics.forEach(function (t) { have[t.text] = 1; });
        var n = 0;
        TEMPLATES.forEach(function (t) {
          if (have[t.text]) return;
          M().topics.push({ id: G.uid('tp'), text: t.text, tag: t.tag, done: false });
          n++;
        });
        G.save();
        G.toast(n ? '加入了 ' + n + ' 条灵感模板' : '模板都已经在里面了');
      },
      'topic-toggle': function (el) {
        var id = el.getAttribute('data-id');
        M().topics.forEach(function (t) { if (t.id === id) t.done = !t.done; });
        G.save();
      },
      'topic-del': function (el) {
        var id = el.getAttribute('data-id');
        M().topics = M().topics.filter(function (t) { return t.id !== id; });
        G.save();
      },
      'analyze-run': function (el, ev, ctx) {
        var root = ctx.root;
        var title = (root.querySelector('#anaTitle').value || '').trim();
        var body = (root.querySelector('#anaBody').value || '').trim();
        if (!title && !body) { G.toast('先把标题或正文粘进来'); return false; }
        var result = analyze(title, body);
        M().analyses.unshift({ id: G.uid('an'), at: Date.now(), day: G.today(), title: title || '(无标题)', body: body, result: result });
        M().analyses = M().analyses.slice(0, 30);
        G.save();
        G.sheet({ title: '爆款拆解结果', html: resultHtml(result) });
        return false;
      },
      'analyze-view': function (el) {
        var id = el.getAttribute('data-id');
        var a = M().analyses.filter(function (x) { return x.id === id; })[0];
        if (!a) return false;
        G.sheet({
          title: a.title,
          html: '<p class="hint" style="margin-bottom:10px">' + G.fmtMD(a.day) + ' 拆解</p>' + resultHtml(a.result),
          onClose: function () { G.render(); }
        });
        return false;
      },
      'analyze-del': function (el) {
        var id = el.getAttribute('data-id');
        M().analyses = M().analyses.filter(function (x) { return x.id !== id; });
        G.save();
      }
    },
    render: function (root) {
      var topics = M().topics;
      var analyses = M().analyses;
      root.innerHTML =
        '<div class="card">' +
          '<div class="card-head">' + G.icon('search') +
            '<div class="grow"><div class="card-title">小红书关键词直达</div>' +
            '<div class="card-sub">点一下跳到小红书搜索页，看当天的新笔记</div></div>' +
          '</div>' +
          '<div class="topic-grid">' + KEYWORDS.map(function (k) {
            return '<a class="btn sm line" href="' + xhs(k) + '" target="_blank" rel="noopener">' + G.icon('link') + k + '</a>';
          }).join('') + '</div>' +
          '<p class="hint" style="margin-top:10px">小红书没有对外接口，直接抓笔记不稳定也容易封号，所以这里用「搜索直达 + 手动粘贴拆解」的方式，稳一点。</p>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('list') +
            '<div class="grow"><div class="card-title">选题灵感库</div>' +
            '<div class="card-sub">' + topics.filter(function (t) { return !t.done; }).length + ' 条待拍，' + topics.filter(function (t) { return t.done; }).length + ' 条已发</div></div>' +
            '<button class="btn xs line" data-act="topic-load">' + G.icon('sparkle') + '载入模板</button>' +
          '</div>' +
          '<div class="inline-form" style="margin-bottom:11px">' +
            '<input class="input" id="topicText" placeholder="想拍什么选题？">' +
            '<button class="btn primary sm" data-act="topic-add">' + G.icon('plus') + '加入</button>' +
          '</div>' +
          (topics.length
            ? '<div class="list">' + topics.map(function (t) {
                return '<div class="item ' + (t.done ? 'done' : '') + '">' +
                  G.checkBox(!!t.done, 'topic-toggle', '', 'data-id="' + G.esc(t.id) + '"') +
                  '<div class="item-main"><div class="item-title">' + G.esc(t.text) + '</div>' +
                  '<div class="item-sub"><span class="tag plain">' + G.esc(t.tag || '') + '</span></div></div>' +
                  '<button class="icon-btn sm" data-act="topic-del" data-id="' + G.esc(t.id) + '">' + G.icon('trash') + '</button></div>';
              }).join('') + '</div>'
            : G.emptyBox('还没有选题，点「载入模板」先看看常用选题')) +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' + G.icon('sparkle') +
            '<div class="grow"><div class="card-title">爆款拆解</div>' +
            '<div class="card-sub">把笔记的标题和正文粘进来，拆它的钩子、结构和标签</div></div>' +
          '</div>' +
          '<div class="field"><label>标题</label><input class="input" id="anaTitle" placeholder="粘贴笔记标题"></div>' +
          '<div class="field"><label>正文</label><textarea class="textarea" id="anaBody" style="min-height:120px" placeholder="粘贴正文，一行一段最好"></textarea></div>' +
          '<button class="btn primary block" data-act="analyze-run">' + G.icon('sparkle') + '开始拆解</button>' +
          '<p class="hint" style="margin-top:9px">拆解用本机规则完成，不联网、不上传，粘进来就存这台设备上。</p>' +
        '</div>' +

        (analyses.length
          ? '<div class="card"><div class="card-head">' + G.icon('clock') +
              '<div class="grow"><div class="card-title">拆解记录</div>' +
              '<div class="card-sub">最近 ' + analyses.length + ' 条</div></div></div>' +
              '<div class="list">' + analyses.map(function (a) {
                return '<div class="item plain"><div class="grow" data-act="analyze-view" data-id="' + G.esc(a.id) + '">' +
                  '<div class="item-title">' + G.esc(a.title) + '</div>' +
                  '<div class="item-sub">' + G.fmtMD(a.day) + ' · ' + a.result.total + ' 分 · ' +
                  (a.result.hooks || []).slice(0, 3).join(' / ') + '</div></div>' +
                  '<button class="icon-btn sm" data-act="analyze-del" data-id="' + G.esc(a.id) + '">' + G.icon('trash') + '</button></div>';
              }).join('') + '</div></div>'
          : '');
    }
  });
})();
