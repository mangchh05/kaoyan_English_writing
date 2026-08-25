/* ============================================================
   quiz.js — 主页 + 模拟出题
   ============================================================ */
(function () {
  'use strict';
  var el = window.UI.el, toast = window.UI.toast;

  var PICTURE_THEMES = [
    '环境保护', '诚实守信', '坚持不懈', '乐观心态', '团队合作', '创新精神',
    '多读书·读好书', '孝敬父母·亲情陪伴', '兴趣是最好的老师', '养成好习惯',
    '体育锻炼·全民健身', '追逐梦想', '文化交流与融合', '言传身教·榜样'
  ];

  var CHART_SUBJECTS = [
    { subject: '大学生每周体育锻炼的次数', unit: '次', trend: '从 2 次稳步上升到 5 次' },
    { subject: '居民网购支出占消费总支出的比例', unit: '%', trend: '由 15% 增长至 45%' },
    { subject: '全国快递业务量', unit: '亿件', trend: '由 50 亿件激增到 150 亿件' },
    { subject: '图书馆年均到馆人次', unit: '万人次', trend: '先升后稳，保持高位' },
    { subject: '高校学生参加社会实践的比例', unit: '%', trend: '从 40% 提升至 80%' },
    { subject: '居民健康素养水平', unit: '%', trend: '由 8.8% 提高到 27.8%' },
    { subject: '博物馆参观人数', unit: '万人次', trend: '连年攀升，翻了一番' },
    { subject: '老年人参加社区休闲活动的比例', unit: '%', trend: '由 30% 上升至 70%' }
  ];

  var CHART_TYPES = ['柱状图', '折线图', '饼图', '表格'];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function genPicturePrompt(theme) {
    theme = theme || pick(PICTURE_THEMES);
    return {
      type: '图画作文',
      topic: theme,
      scene: { caption: theme },
      picId: 'mock:' + theme,
      text: '请根据下面这幅图画写一篇英语短文（约 160–200 词）：\n\n图画围绕主题「' + theme + '」展开。\n\n写作要求：\n1) describe the picture（描述图画）\n2) interpret its meaning（阐释寓意）\n3) give your comments（发表评论）'
    };
  }

  function genChartPrompt() {
    var s = pick(CHART_SUBJECTS), ct = pick(CHART_TYPES);
    return {
      type: '图表作文',
      topic: s.subject,
      chart: App.charts.mockChart(s.subject, s.trend),
      text: '请根据下面的' + ct + '写一篇英语短文（约 150 词）：\n\n图表内容：' + s.subject + '，变化趋势为「' + s.trend + '」。\n\n写作要求：\n1) interpret the chart（解读图表）\n2) give your comments（发表评论）'
    };
  }

  function genLetterPrompt() {
    var types = ['建议信', '道歉信', '邀请信', '感谢信', '投诉信', '咨询信', '推荐信'];
    var t = pick(types);
    var scene = {
      '建议信': '你的朋友准备考研但不知如何复习英语，请给他写一封建议信。',
      '道歉信': '你因临时有事不能参加同学的毕业聚会，请写一封道歉信说明情况。',
      '邀请信': '请邀请你的外教老师参加学校举办的新年晚会。',
      '感谢信': '你在生病期间得到了朋友的悉心照顾，请写一封感谢信。',
      '投诉信': '你在网上购买的书包存在质量问题，请向商家写一封投诉信。',
      '咨询信': '你想了解某高校研究生招生的相关信息，请写一封咨询信。',
      '推荐信': '请为你的同学写一封推荐信，推荐其担任校学生会某职务。'
    }[t];
    return { type: '书信', topic: t, text: scene + '\n\n要求：约 100 词，格式规范（称呼、正文、结束语、署名 Li Ming）。' };
  }

  function genNoticePrompt() {
    return {
      type: '通知',
      topic: '通知 / 告示',
      text: '请以校学生会的名义写一则英语通知，告知同学们将于下周五晚在学校礼堂举办英语演讲比赛，欢迎报名参加。\n\n要求：约 100 词，格式规范（标题 NOTICE、正文、落款）。'
    };
  }

  function genQuiz(type, topic) {
    if (type === '图画作文') return genPicturePrompt(topic);
    if (type === '图表作文') return genChartPrompt();
    if (type === '书信') return genLetterPrompt();
    if (type === '通知') return genNoticePrompt();
    // 随机
    var r = Math.random();
    if (r < 0.4) return genPicturePrompt();
    if (r < 0.7) return genChartPrompt();
    if (r < 0.9) return genLetterPrompt();
    return genNoticePrompt();
  }

  function genRealQuestion() {
    var essays = Store.getEssays();
    if (!essays.length) return null;
    var e = pick(essays);
    var q = {
      type: e.type,
      topic: e.title + '（' + e.year + ' ' + e.exam + '）',
      text: '【真题重现】' + e.year + ' ' + e.exam + ' ' + e.part + '：' + e.title + '\n\n' + e.prompt,
      essayId: e.id
    };
    if (e.image) q.image = e.image;
    q.picId = e.id;
    return q;
  }

  function renderQuizResult(container, quiz) {
    container.innerHTML = '';
    var card = el('div', { class: 'card', style: 'background:#fff;border-left:4px solid #a63c2e;' });
    var head = el('div', { class: 'flex-between mb' },
      [el('div', {}, [el('span', { class: 'badge', text: quiz.type }), ' ',
        el('span', { class: 'badge gray', text: quiz.topic || '' })]),
      el('button', { class: 'btn btn-outline btn-sm', onclick: function () { renderQuizResult(container, genQuiz(document.getElementById('quiz-type').value)); } }, '换一题')]);
    card.appendChild(head);
    if (quiz.image) card.appendChild(el('div', { class: 'mt', html: App.charts.renderFor(quiz.picId, quiz.image) }));
    else if (quiz.chart) card.appendChild(el('div', { class: 'mt', html: App.charts.renderChart(quiz.chart) }));
    else if (quiz.scene) card.appendChild(el('div', { class: 'mt', html: App.charts.renderFor(quiz.picId, { scene: quiz.scene }) }));
    var pre = el('div', { class: 'essay-text', style: 'margin-top:12px;white-space:pre-wrap;', text: quiz.text });
    card.appendChild(pre);
    var actions = el('div', { class: 'flex mt' },
      [el('button', { class: 'btn btn-primary', onclick: function () { goCorrect(quiz); } }, '带着这题去批改'),
        quiz.essayId ? el('button', { class: 'btn btn-outline', onclick: function () { sessionStorage.setItem('kyeng.openEssay', quiz.essayId); location.hash = 'library'; } }, '查看该题范文') : null,
        el('button', { class: 'btn btn-ghost', onclick: function () { copyText(quiz.text); } }, '复制题目')]);
    card.appendChild(actions);
    container.appendChild(card);
  }

  function goCorrect(quiz) {
    var pre = { id: quiz.picId, topic: quiz.topic, type: quiz.type, text: quiz.text };
    if (quiz.image) pre.image = quiz.image;
    else if (quiz.chart) pre.image = { chart: quiz.chart };
    else if (quiz.scene) pre.image = { scene: quiz.scene };
    sessionStorage.setItem('kyeng.prefillTopic', JSON.stringify(pre));
    location.hash = 'correct';
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('已复制'); }, function () { fallbackCopy(text); });
    } else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('已复制'); } catch (e) { toast('复制失败，请手动选择复制'); }
    document.body.removeChild(ta);
  }

  /* ---------- 主页 ---------- */
  App.pages.home = function (root) {
    var essays = Store.getEssays();
    var prog = Store.getProgress();

    root.appendChild(el('div', { class: 'hero' },
      [el('h2', { text: '考研英语写作 · 一站式训练平台' }),
        el('p', { text: '真题范文 · 要点拆解 · 好词好句 · 作文框架 · 模拟出题 · AI 批改，帮助你系统攻克考研英语（英语一 / 英语二）写作。' }),
        el('div', { class: 'hero-actions' },
          [el('button', { class: 'btn btn-outline', onclick: function () { location.hash = 'library'; } }, '进入真题库'),
            el('button', { class: 'btn btn-outline', onclick: function () { location.hash = 'correct'; } }, '上传作文批改'),
            el('button', { class: 'btn btn-outline', onclick: function () { location.hash = 'memorize'; } }, '开始背诵')])]));

    // 统计
    var stats = el('div', { class: 'grid grid-4 mb' });
    [['真题范文', essays.length, '篇'], ['好词好句', Store.getPhrases().length, '条'],
     ['作文框架', Store.getFrameworks().length, '类'], ['已背范文', (prog.memorized || []).length, '篇']]
      .forEach(function (s) {
        stats.appendChild(el('div', { class: 'card stat-card tight' },
          [el('div', { class: 'num', text: String(s[1]) }), el('div', { class: 'lbl', text: s[0] + ' · ' + s[2] })]));
      });
    root.appendChild(stats);

    // 模拟出题
    var quizCard = el('div', { class: 'card' });
    quizCard.appendChild(el('h3', { text: '模拟出题' }));
    var bar = el('div', { class: 'filterbar' },
      [el('select', { class: 'select', id: 'quiz-type', style: 'max-width:200px;' },
          ['全部（随机）', '图画作文', '图表作文', '书信', '通知'].map(function (t) { return el('option', { value: t === '全部（随机）' ? '' : t, text: t }); })),
        el('button', { class: 'btn btn-primary', onclick: function () { renderQuizResult(resultBox, genQuiz(document.getElementById('quiz-type').value)); } }, '生成模拟题'),
        el('button', { class: 'btn btn-outline', onclick: function () { var q = genRealQuestion(); renderQuizResult(resultBox, q); } }, '抽一道真题')]);
    quizCard.appendChild(bar);
    var resultBox = el('div', { id: 'quiz-result' });
    quizCard.appendChild(resultBox);
    root.appendChild(quizCard);

    // 快速入口
    var quick = el('div', { class: 'card' });
    quick.appendChild(el('h3', { text: '快速开始' }));
    quick.appendChild(el('div', { class: 'grid grid-3' },
      [
        [['真题库', '查看历年真题题目、范文与要点'], 'library'],
        [['AI 批改', '上传 Word 或粘贴作文，获取专业批改'], 'correct'],
        [['范文背诵', '渐进式背诵范文与好词好句'], 'memorize'],
        [['作文框架', '各题型段落框架与万能句型'], 'framework'],
        [['写作指南', '评分标准与高频错误对照'], 'guide'],
        [['数据管理', '录入/更新真题与范文数据'], 'admin']
      ].map(function (q) {
        return el('div', { class: 'list-item', onclick: function () { location.hash = q[1]; } },
          [el('div', { class: 'li-main' },
            [el('div', { class: 'li-title', text: q[0][0] }), el('div', { class: 'li-sub', text: q[0][1] })])]);
      })));
    root.appendChild(quick);

    // 自动渲染一题
    renderQuizResult(resultBox, genRealQuestion() || genQuiz(''));
  };
})();
