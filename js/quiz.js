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
    var mockFiles = { '环境保护': 'assets/mock-环境保护.png', '坚持不懈': 'assets/mock-坚持不懈.png', '多读书·读好书': 'assets/mock-多读书·读好书.png', '言传身教·榜样': 'assets/mock-言传身教·榜样.png' };
    return {
      type: '图画作文',
      topic: theme,
      scene: { caption: theme, file: mockFiles[theme] || 'assets/mock-环境保护.png' },
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
    var bank = window.APP_DATA_SIMULATIONS_SOURCE || [];
    var pool = bank.filter(function (q) { return !type || q.type === type || (type === '英语一大作文' && q.exam === '英语一' && q.part === '大作文') || (type === '英语二大作文' && q.exam === '英语二' && q.part === '大作文') || (type === '英语一小作文' && q.exam === '英语一' && q.part === '小作文') || (type === '英语二小作文' && q.exam === '英语二' && q.part === '小作文'); });
    if (!pool.length) pool = bank;
    var q = pool[Math.floor(Math.random() * pool.length)];
    return JSON.parse(JSON.stringify(q));
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
        el('button', { class: 'btn btn-outline', onclick: function () { startTraining(quiz); } }, '开始今日训练'),
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

  function startTraining(quiz) {
    var question = quiz && quiz.essayId ? Store.getEssayById(quiz.essayId) : (window.APP_DATA_SIMULATIONS_SOURCE || []).filter(function (q) { return q.id === quiz.id; })[0];
    if (!question) { toast('找不到这道题，无法创建训练会话'); return; }
    TrainingSession.startForQuestion(question, quiz.essayId ? 'real' : 'simulation');
    location.hash = 'today';
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('已复制'); }, function () { fallbackCopy(text); });
    } else fallbackCopy(text);
  }

  function renderSimulationPage(root) {
    var quizCard = el('div', { class: 'card simulation-studio' });
    quizCard.appendChild(el('div', { class: 'eyebrow', text: 'PRACTICE DECK · 固定资料题库' }));
    quizCard.appendChild(el('h2', { text: '模拟出题' }));
    quizCard.appendChild(el('p', { class: 'muted', text: '从本地导入的 30 篇资料模拟题中训练，题目与配图固定可复习。' }));
    var resultBox = el('div', { id: 'quiz-result' });
    quizCard.appendChild(el('div', { class: 'filterbar' }, [el('select', { class: 'select', id: 'quiz-type', style: 'max-width:220px;' }, ['全部模拟题', '英语一大作文', '英语一小作文', '英语二大作文', '英语二小作文'].map(function (t) { return el('option', { value: t === '全部模拟题' ? '' : t, text: t }); })), el('button', { class: 'btn btn-primary', onclick: function () { renderQuizResult(resultBox, genQuiz(document.getElementById('quiz-type').value)); } }, '抽取一题'), el('button', { class: 'btn btn-outline', onclick: function () { var q = genRealQuestion(); renderQuizResult(resultBox, q); } }, '抽一道真题')]));
    quizCard.appendChild(resultBox); root.appendChild(quizCard); renderQuizResult(resultBox, genQuiz(''));
  }
  App.pages.simulations = renderSimulationPage;

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('已复制'); } catch (e) { toast('复制失败，请手动选择复制'); }
    document.body.removeChild(ta);
  }

  /* ---------- 主页 ---------- */
  App.pages.home = function (root) {
    var prog = Store.getProgress();
    var minutes = prog.studyMinutes || {}, byDate = prog.studyByDate || {};
    Object.keys(byDate).forEach(function (k) { minutes[k] = (minutes[k] || 0) + Math.floor(byDate[k] / 60); });
    function dateKey(d) { return DateUtils.localDateKey(d); }
    var history = Store.getHistory();
    var activeSession = TrainingSession.getCurrent();
    var canResume = activeSession && activeSession.currentStep !== 'completed';
    var stepNames = { reading: '阅读题目', planning: '列出提纲', writing: '完成初稿', correcting: 'AI 批改', rewriting: '二次重写' };
    var now = new Date();
    var todayKey = dateKey(now);
    var todayMinutes = minutes[todayKey] || 0;
    var last = history[0] || null;
    var scoredHistory = history.filter(function (record) { return scoreFrom(record) != null; });
    var lastScore = scoreFrom(scoredHistory[0]);
    var previousScore = scoreFrom(scoredHistory[1]);
    var weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    var weekEssays = history.filter(function (record) {
      var time = record && record.time ? new Date(record.time) : null;
      return time && !isNaN(time.getTime()) && time >= weekStart;
    }).length;
    var streak = prog.streak && prog.streak.current ? prog.streak.current : 0;

    function scoreFrom(record) {
      var result = record && record.structuredResult;
      return result && typeof result.totalScore === 'number' ? result.totalScore : null;
    }

    function scoreLabel(value) { return value == null ? '—' : String(value) + ' 分'; }
    function scoreDeltaLabel() {
      if (lastScore == null || previousScore == null) return '完成两次批改后显示变化';
      var delta = lastScore - previousScore;
      return (delta > 0 ? '+' : '') + delta.toFixed(1).replace('.0', '') + ' 分 · 较上次';
    }

    root.appendChild(el('div', { class: 'home-heading' }, [
      el('div', {}, [el('div', { class: 'eyebrow', text: 'TODAY · 写作训练工作台' }), el('h2', { text: '今天，完成一轮真正的训练。' }), el('p', { class: 'muted', text: canResume ? '当前停在「' + stepNames[activeSession.currentStep] + '」，继续当前会话即可。' : (last ? '上一轮训练已完成，今天开始新的训练。' : '先完成一篇作文，系统会从今天开始记录你的写作进步。') })])
    ]));

    var recommendation = Recommendation.getToday(0), recommendationOffset = 0;
    var task = el('div', { class: 'card home-task' });
    var taskCopy = el('div', { class: 'home-task-copy' });
    var taskActions = el('div', { class: 'home-task-actions' });
    var taskPrimary = el('button', { class: 'btn btn-primary', onclick: function () {
      if (canResume) { location.hash = 'today'; return; }
      Recommendation.start(recommendation); location.hash = 'today';
    } }, canResume ? '继续训练' : '开始今日训练');
    var changeTask = el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { recommendation = Recommendation.getToday(++recommendationOffset); renderTask(); } }, '换一道');
    function renderTask() {
      taskCopy.innerHTML = '';
      if (canResume) {
        taskCopy.appendChild(el('div', { class: 'eyebrow', text: 'YOUR NEXT ACTION' }));
        taskCopy.appendChild(el('h3', { text: '继续当前训练会话' }));
        taskCopy.appendChild(el('p', { text: '上次离开在「' + stepNames[activeSession.currentStep] + '」阶段，所有提纲、草稿和反馈都会保留。' }));
      } else {
        var q = recommendation.question;
        taskCopy.appendChild(el('div', { class: 'eyebrow', text: 'TODAY RECOMMENDATION · 今日推荐' }));
        taskCopy.appendChild(el('h3', { text: q.title || q.topic || '今日作文训练' }));
        taskCopy.appendChild(el('div', { class: 'home-task-meta' }, [el('span', { class: 'badge', text: q.exam + ' · ' + q.part }), el('span', { class: 'muted', text: '预计 ' + recommendation.estimatedMinutes + ' min' })]));
        taskCopy.appendChild(el('p', { text: '训练重点：' + recommendation.focus + '。推荐原因：' + recommendation.reason }));
      }
    }
    taskActions.appendChild(taskPrimary);
    if (!canResume) taskActions.appendChild(changeTask);
    task.appendChild(taskCopy); task.appendChild(taskActions); renderTask(); root.appendChild(task);

    root.appendChild(el('div', { class: 'card home-last' }, [
      el('div', { class: 'flex-between' }, [el('div', {}, [el('div', { class: 'eyebrow', text: 'PREVIOUS SESSION · 上次训练' }), el('h3', { text: last ? (last.topic || '作文练习') : '还没有训练记录' })]), last ? el('span', { class: 'badge gray', text: last.time || '最近一次' }) : null]),
      el('p', { class: 'muted', text: last ? '你已经完成 ' + (last.words || '—') + ' 词，并保存了一次 AI 批改结果。' : '完成第一篇作文后，这里会显示你昨天或最近一次学到哪里。' }),
      last ? el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { location.hash = 'essays'; } }, '查看上次反馈') : null
    ]));

    var todayNum = el('strong', { text: String(todayMinutes) });
    function refreshLiveMinutes() { var live = window.App.getLiveStudySeconds ? Math.floor(window.App.getLiveStudySeconds() / 60) : 0; todayNum.textContent = String(todayMinutes + live); }
    var metrics = el('div', { class: 'home-metrics' });
    [['今日学习时长', todayNum, '在线分钟'], ['连续学习天数', String(streak), '天'], ['本周作文数量', String(weekEssays), '篇'], ['最近得分变化', scoreLabel(lastScore), scoreDeltaLabel()]].forEach(function (metric) {
      metrics.appendChild(el('div', { class: 'card home-metric' }, [metric[1] instanceof Node ? metric[1] : el('strong', { text: metric[1] }), el('span', { text: metric[0] }), el('small', { text: metric[2] })]));
    });
    root.appendChild(metrics);

    var progress = el('div', { class: 'card study-dashboard home-progress' }, [
      el('div', { class: 'flex-between' }, [el('div', {}, [el('div', { class: 'eyebrow', text: 'RECENT PROGRESS · 最近有没有进步' }), el('h3', { text: '把学习痕迹变成可见的进步' })]), el('span', { class: 'live-status', text: '● ONLINE TIME' })]),
      el('div', { class: 'heatmap-title' }, [el('span', { text: '近 12 周学习热力' }), el('span', { class: 'muted small', text: '颜色越深，学习越久' })]),
      (function () { var grid = el('div', { class: 'heatmap' }); var end = new Date(); for (var i = 83; i >= 0; i--) { var d = new Date(end); d.setDate(end.getDate() - i); var v = minutes[dateKey(d)] || 0; var level = v >= 120 ? 4 : v >= 60 ? 3 : v >= 30 ? 2 : v > 0 ? 1 : 0; grid.appendChild(el('span', { class: 'heat-cell l' + level, title: dateKey(d) + ' · ' + v + ' 分钟' })); } return grid; })(),
      el('div', { class: 'heat-legend' }, [el('span', { text: '少' }), [0,1,2,3,4].map(function(n){ return el('i', { class: 'heat-cell l' + n }); }), el('span', { text: '多' })])
    ]);
    root.appendChild(progress);
    setInterval(refreshLiveMinutes, 1000); refreshLiveMinutes();
  };
})();
