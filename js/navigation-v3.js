/* ============================================================
   navigation-v3.js — V3 信息架构聚合入口
   只重组页面入口，不删除旧页面、题库数据或 localStorage 数据。
   ============================================================ */
(function () {
  'use strict';

  var el = window.UI.el;
  var App = window.App;
  var realPage = App.pages.library;
  var simulationPage = App.pages.simulations;
  var correctionPage = App.pages.correct;
  var memorizePage = App.pages.memorize;
  var frameworkPage = App.pages.framework;
  var guidePage = App.pages.guide;
  var insightPage = App.pages.insights;

  App.routeAliases = {
    library: 'bank',
    simulations: 'bank',
    correct: 'essays',
    memorize: 'materials',
    framework: 'materials',
    guide: 'materials',
    insights: 'reports'
  };
  App.routeTitles = { admin: '设置 / 高级设置' };

  function shell(root, title, subtitle, tabs, renderers, defaultIndex) {
    var current = Math.max(0, Math.min(defaultIndex || 0, renderers.length - 1));
    var body = el('div', { class: 'ia-panel-body' });
    var tabbar = el('div', { class: 'ia-tabs', role: 'tablist', 'aria-label': title });
    var buttons = [];

    function activate(index) {
      current = index;
      buttons.forEach(function (button, i) {
        var active = i === current;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      body.innerHTML = '';
      if (renderers[current]) renderers[current](body);
    }

    root.appendChild(el('div', { class: 'page-head ia-page-head' }, [
      el('div', {}, [el('div', { class: 'eyebrow', text: 'V3 WORKSPACE' }), el('h2', { text: title }), el('p', { class: 'muted', text: subtitle })])
    ]));
    tabs.forEach(function (label, index) {
      var button = el('button', { class: 'ia-tab', type: 'button', role: 'tab', 'aria-selected': 'false', onclick: function () { activate(index); } }, label);
      buttons.push(button);
      tabbar.appendChild(button);
    });
    root.appendChild(tabbar);
    root.appendChild(body);
    activate(current);
  }

  App.pages.today = function (root) {
    var STEP_LABELS = { reading: '阅读题目', planning: '列出提纲', writing: '完成初稿', correcting: 'AI 批改', rewriting: '二次重写', completed: '训练完成' };
    var session = TrainingSession.getCurrent();

    function questionText(question) { return question && (question.prompt || question.text || '') || ''; }
    function questionTitle(question) { return question && (question.title || question.topic || '今日作文') || '今日作文'; }
    function resumeCorrection() {
      var prefill = TrainingSession.toPrefill(session);
      if (prefill) sessionStorage.setItem('kyeng.prefillTopic', JSON.stringify(prefill));
      location.hash = 'essays';
    }
    function clearAndChoose() { Store.clearTrainingSession(); location.hash = 'bank'; }

    function renderQuestionCard(question) {
      var card = el('div', { class: 'card training-question' }, [
        el('div', { class: 'flex-between' }, [el('div', {}, [el('div', { class: 'eyebrow', text: 'QUESTION · 训练题目' }), el('h3', { text: questionTitle(question) })]), question && question.exam ? el('span', { class: 'badge', text: question.exam + ' · ' + (question.part || '') }) : null]),
        question && question.image ? el('div', { class: 'mt', html: App.charts.renderFor(question.id, question.image) }) : null,
        el('div', { class: 'essay-text training-prompt', text: questionText(question) })
      ]);
      return card;
    }

    function renderStepRail() {
      return el('div', { class: 'training-rail', role: 'list', 'aria-label': '训练进度' }, TrainingSession.STEPS.map(function (step, index) {
        var currentIndex = TrainingSession.stepIndex(session.currentStep);
        var state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : '';
        return el('div', { class: 'training-rail-step ' + state, role: 'listitem' }, [el('b', { text: String(index + 1).padStart(2, '0') }), el('span', { text: STEP_LABELS[step] })]);
      }));
    }

    function renderState() {
      root.innerHTML = '';
      root.appendChild(el('div', { class: 'page-head' }, [
        el('div', {}, [el('div', { class: 'eyebrow', text: 'TODAY · TRAINING SESSION' }), el('h2', { text: '今日训练' }), el('p', { class: 'muted', text: session ? '当前会话会自动保存，刷新或明天回来都能继续。' : '先选一道题，系统会为这次训练建立独立会话。' })])
      ]));

      if (!session) {
        root.appendChild(el('div', { class: 'card today-focus' }, [
          el('div', { class: 'today-focus-copy' }, [el('div', { class: 'eyebrow', text: 'START HERE' }), el('h3', { text: '开始一轮完整写作训练' }), el('p', { text: '训练会依次经过阅读、规划、写作、批改和重写，每一步都会自动保存。' })]),
          el('button', { class: 'btn btn-primary', onclick: function () { location.hash = 'bank'; } }, '去题库选题')
        ]));
        return;
      }

      root.appendChild(renderStepRail());
      var question = TrainingSession.getQuestion(session);
      if (question) root.appendChild(renderQuestionCard(question));
      else root.appendChild(el('div', { class: 'card error-text', text: '当前训练题目暂时无法读取，请回到题库重新选择。' }));

      var action = el('div', { class: 'card training-action' });
      action.appendChild(el('div', { class: 'eyebrow', text: 'CURRENT STEP · ' + session.currentStep.toUpperCase() }));
      if (session.currentStep === 'reading') {
        action.appendChild(el('h3', { text: '先读懂题目，再开始规划' }));
        action.appendChild(el('p', { class: 'muted', text: '确认考试类型、题型和写作要求，暂时不要打开范文。' }));
        action.appendChild(el('button', { class: 'btn btn-primary', onclick: function () { TrainingSession.transition('planning'); session = TrainingSession.getCurrent(); renderState(); } }, '我已读懂，进入规划'));
      } else if (session.currentStep === 'planning') {
        action.appendChild(el('h3', { text: '用几行提纲固定文章方向' }));
        var outline = el('textarea', { class: 'textarea', id: 'training-outline', placeholder: '写下文章结构、核心观点和准备使用的表达…', value: session.outline || '', style: 'min-height:150px;margin-top:12px;' });
        action.appendChild(outline);
        outline.addEventListener('input', function () { TrainingSession.update({ outline: outline.value }); });
        action.appendChild(el('button', { class: 'btn btn-primary mt', onclick: function () { TrainingSession.transition('writing', { outline: outline.value.trim() }); session = TrainingSession.getCurrent(); renderState(); } }, '保存提纲，进入写作'));
      } else if (session.currentStep === 'writing') {
        action.appendChild(el('h3', { text: '完成你的第一版作文' }));
        var draft = el('textarea', { class: 'textarea', id: 'training-draft', placeholder: '在这里完成作文初稿…', value: session.draft || '', style: 'min-height:260px;margin-top:12px;' });
        action.appendChild(draft);
        draft.addEventListener('input', function () { TrainingSession.update({ draft: draft.value }); });
        action.appendChild(el('button', { class: 'btn btn-primary mt', onclick: function () {
          if (!draft.value.trim()) { UI.toast('请先完成作文初稿'); return; }
          TrainingSession.transition('correcting', { draft: draft.value.trim() });
          session = TrainingSession.getCurrent();
          resumeCorrection();
        } }, '保存初稿，去 AI 批改'));
      } else if (session.currentStep === 'correcting') {
        action.appendChild(el('h3', { text: '把初稿交给 AI 批改' }));
        action.appendChild(el('p', { class: 'muted', text: '初稿已保存。进入“我的作文”提交批改，结果会自动回填到本次训练。' }));
        action.appendChild(el('button', { class: 'btn btn-primary', onclick: resumeCorrection }, '继续 AI 批改'));
      } else if (session.currentStep === 'rewriting') {
        action.appendChild(el('h3', { text: '根据反馈完成二次重写' }));
        if (session.correctionResult) action.appendChild(el('div', { class: 'md training-feedback', html: UI.renderMarkdown(session.correctionResult) }));
        var rewrite = el('textarea', { class: 'textarea', id: 'training-rewrite', placeholder: '根据批改建议，重新写一遍你的作文…', value: session.rewrite || '', style: 'min-height:260px;margin-top:14px;' });
        action.appendChild(rewrite);
        rewrite.addEventListener('input', function () { TrainingSession.update({ rewrite: rewrite.value }); });
        action.appendChild(el('button', { class: 'btn btn-primary mt', onclick: function () {
          if (!rewrite.value.trim()) { UI.toast('请先完成二次重写'); return; }
          TrainingSession.transition('completed', { rewrite: rewrite.value.trim() });
          session = TrainingSession.getCurrent(); renderState();
        } }, '提交重写，完成训练'));
      } else {
        action.appendChild(el('h3', { text: '这一轮训练完成了' }));
        action.appendChild(el('p', { class: 'muted', text: '你已经完成阅读、规划、初稿、批改和二次重写。下一次训练可以从题库继续。' }));
        action.appendChild(el('button', { class: 'btn btn-outline', onclick: clearAndChoose }, '选择下一道题'));
      }
      root.appendChild(action);
    }

    renderState();
  };

  App.pages.bank = function (root) {
    var defaultIndex = sessionStorage.getItem('kyeng.bankTab') === 'sim' ? 1 : 0;
    sessionStorage.removeItem('kyeng.bankTab');
    shell(root, '题库', '真题与固定资料模拟题统一入口，按考试类型和题型开始训练。', ['真题训练', '模拟训练'], [realPage, simulationPage], defaultIndex);
  };

  App.pages.essays = function (root) {
    if (correctionPage) correctionPage(root);
  };

  App.pages.materials = function (root) {
    var defaultIndex = sessionStorage.getItem('kyeng.framework') ? 2 : 0;
    shell(root, '素材库', '把范文、好词好句、作文框架和评分方法放在同一个复习空间。', ['范文背诵', '好词好句', '作文框架', '评分与错误'], [memorizePage, function (body) {
      memorizePage(body);
      var tabs = body.querySelectorAll('.tab');
      if (tabs[1]) tabs[1].click();
    }, frameworkPage, guidePage], defaultIndex);
  };

  App.pages.reports = function (root) {
    if (insightPage) insightPage(root);
    root.appendChild(el('div', { class: 'card advanced-entry' }, [
      el('div', {}, [el('strong', { text: '设置 / 高级设置' }), el('p', { class: 'muted', text: '数据导入导出、模型配置等低频操作集中放在这里。' })]),
      el('button', { class: 'btn btn-outline', onclick: function () { location.hash = 'admin'; } }, '打开高级设置')
    ]));
  };
})();
