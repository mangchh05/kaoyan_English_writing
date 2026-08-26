/* ============================================================
   correction.js — AI 作文批改（.docx 解析 + 大模型 + 本地统计）
   布局：左主区(题目/正文/统计/结果/历史) + 右侧栏(模型设置)
   ============================================================ */
(function () {
  'use strict';
  var el = window.UI.el, toast = window.UI.toast, md = window.UI.renderMarkdown;

  var PROVIDERS = [
    { id: 'deepseek', name: 'DeepSeek（推荐 · 浏览器直连稳定）', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'] },
    { id: 'siliconflow', name: 'SiliconFlow（推荐 · 浏览器直连稳定）', baseUrl: 'https://api.siliconflow.cn/v1', models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct', 'Qwen/Qwen2.5-7B-Instruct'] },
    { id: 'moonshot', name: 'Moonshot / Kimi', baseUrl: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] },
    { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'] },
    { id: 'qwen', name: '通义千问（DashScope 兼容）', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-plus', 'qwen-turbo', 'qwen-max'] },
    { id: 'zhipu', name: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4-flash', 'glm-4-plus'] },
    { id: 'custom', name: '自定义（OpenAI 兼容接口）', baseUrl: '', models: [] }
  ];

  var SYSTEM_PROMPT = [
    '你是一位资深的考研英语（全国硕士研究生招生考试英语一/英语二）写作阅卷专家。请对学生作文进行专业、细致、有针对性的批改。',
    '请使用中文输出，并使用 Markdown 排版，严格按以下结构：',
    '## 评分',
    '- 总分：X / 满分Y分（并说明所属档次，如“第五档/第四档”）',
    '## 总体评价',
    '（2–3 句话，客观概括优点与不足）',
    '## 内容与结构',
    '（是否切题、段落逻辑、衔接手段、字数是否达标）',
    '## 语言运用',
    '（语法、词汇、句式；必须指出具体错误，用「原文 → 修改」格式逐条列出，并简要解释原因）',
    '## 亮点表达',
    '（指出写得好的词句）',
    '## 修改建议',
    '（分点给出可操作的改进方向，并给 1–2 句升级示范）',
    '## 高分表达参考',
    '（针对该话题给出 2–3 句地道的加分表达）',
    '',
    '要求：评价客观、具体、针对学生原文，避免空话套话；引用学生原文时必须准确。',
    '若用户消息中提供了「评分标准」或「该题高分参考要点」，请严格参照其中的分档要求与要点进行评分与点评。'
  ].join('\n');

  function scoreBasis(exam, part) { if (part === '小作文') return 10; if (exam === '英语二') return 15; return 20; }

  function field(label, input) {
    return el('div', { class: 'form-group' }, [el('label', { text: label }), input]);
  }

  function localStats(text) {
    var words = text.trim().split(/\s+/).filter(Boolean);
    var sentences = text.split(/[.!?。！？]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var paragraphs = text.split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    var unique = {};
    words.forEach(function (w) { unique[w.toLowerCase().replace(/[^a-z0-9]/g, '')] = 1; });
    var clean = Object.keys(unique).filter(Boolean);
    var totalChars = words.join('').length;
    return {
      words: words.length, unique: clean.length, sentences: sentences.length, paragraphs: paragraphs.length,
      avgSentence: sentences.length ? (words.length / sentences.length).toFixed(1) : '0',
      avgWord: words.length ? (totalChars / words.length).toFixed(1) : '0'
    };
  }

  function renderStats(text) {
    var s = localStats(text);
    var box = document.getElementById('stat-box');
    if (!box) return;
    box.innerHTML = '';
    box.appendChild(el('div', { class: 'stat-grid' },
      [
        ['词数', s.words], ['句子数', s.sentences], ['不同词', s.unique], ['段落数', s.paragraphs],
        ['均句长', s.avgSentence + ' 词'], ['均词长', s.avgWord + ' 字母'], ['词汇丰富度', (s.unique / Math.max(s.words, 1) * 100).toFixed(0) + '%'], ['推荐词数', '见右下角评分标准']
      ].map(function (it) {
        return el('div', { class: 'stat-item' },
          [el('div', { class: 'small muted', text: it[0] }), el('div', { class: 'stat-num', text: String(it[1]) })]);
      })));
  }

  function getProvider(id) { return PROVIDERS.filter(function (p) { return p.id === id; })[0] || PROVIDERS[0]; }

  App.pages.correct = function (root) {
    var settings = Store.getSettings();
    var trainingSession = TrainingSession.getCurrent();
    var prefill = {};
    try { prefill = JSON.parse(sessionStorage.getItem('kyeng.prefillTopic') || '{}'); } catch (e) { prefill = {}; }
    if (trainingSession && trainingSession.currentStep === 'correcting') {
      var sessionPrefill = TrainingSession.toPrefill(trainingSession);
      if (sessionPrefill) prefill = sessionPrefill;
    }

    root.appendChild(el('div', { class: 'page-head' },
      [el('h2', { text: 'AI 作文批改' }), el('div', { class: 'sub', text: '上传 Word 或粘贴作文，结合本站评分标准与该题要点，调用大模型给出评分与批改意见。' })]));

    // ---------- 两栏布局 ----------
    var grid = el('div', { class: 'grid-correction' });
    var colMain = el('div', { class: 'col-main' });
    var colSide = el('div', { class: 'col-side' });
    grid.appendChild(colMain);
    grid.appendChild(colSide);
    root.appendChild(grid);

    // 从主页/真题库带入的完整题目（含配图）
    if (prefill.text) {
      var topicCard = el('div', { class: 'card' });
      var th = el('div', { class: 'flex-between mb' });
      th.appendChild(el('h3', { text: '题目' }));
      if (prefill.type) th.appendChild(el('span', { class: 'badge', text: prefill.type }));
      topicCard.appendChild(th);
      if (prefill.image) topicCard.appendChild(el('div', { class: 'mt', html: App.charts.renderFor(prefill.id, prefill.image) }));
      topicCard.appendChild(el('div', { class: 'essay-text', style: 'font-family:inherit;font-size:14.5px;margin-top:12px;', text: prefill.text }));
      topicCard.appendChild(el('div', { class: 'hint mt', text: '请按题目要求完成作文后，粘贴或上传到下方输入区。' }));
      colMain.appendChild(topicCard);
    }

    /* ================= 右侧栏：模型设置状态 + 使用提示 ================= */
    var s0 = Store.getSettings();
    var p0 = getProvider(s0.provider);
    var setCard = el('div', { class: 'card side-card' });
    setCard.appendChild(el('h3', { text: '模型设置' }));
    setCard.appendChild(el('div', { class: 'flex-between' },
      [el('span', { class: 'small muted', text: '服务商' }), el('span', { class: 'badge', text: p0.name.split('（')[0] })]));
    setCard.appendChild(el('div', { class: 'flex-between mt' },
      [el('span', { class: 'small muted', text: '模型' }), el('span', { class: 'badge gray', text: s0.model || '未设置' })]));
    setCard.appendChild(el('div', { class: 'flex-between mt' },
      [el('span', { class: 'small muted', text: 'API Key' }), el('span', { class: 'badge gray', text: s0.apiKey ? '已保存' : '未配置' })]));
    setCard.appendChild(el('button', { class: 'btn btn-outline btn-block mt', onclick: function () { location.hash = 'admin'; } }, '前往「数据管理」配置'));
    setCard.appendChild(el('div', { class: 'hint mt', text: '模型设置已移至「数据管理」页，配置后此处自动生效。' }));
    colSide.appendChild(setCard);

    var tipCard = el('div', { class: 'card side-card' });
    tipCard.appendChild(el('h4', { style: 'margin-bottom:8px;', text: '使用提示' }));
    tipCard.appendChild(el('ul', { style: 'padding-left:18px;' },
      ['模型服务商与 API Key 请到「数据管理」页配置', '左侧上传 .docx 或粘贴作文', '若填了“作文题目/话题”，批改会结合该题要点更精准', '每次批改结果会保存到左下角“批改历史”'].map(function (t) {
        return el('li', { text: t, style: 'margin-bottom:5px;' });
      })));
    colSide.appendChild(tipCard);

    /* ================= 左侧主区 ================= */
    // 题目与正文
    var inputCard = el('div', { class: 'card' });
    inputCard.appendChild(el('h3', { text: '作文题目与正文' }));
    var topicRow = el('div', { class: 'form-row' });
    var examSel = el('select', { class: 'select', id: 'exam-sel' }, [el('option', { value: '英语一', text: '英语一' }), el('option', { value: '英语二', text: '英语二' })]);
    var partSel = el('select', { class: 'select', id: 'part-sel' }, [el('option', { value: '大作文', text: '大作文' }), el('option', { value: '小作文', text: '小作文' })]);
    if (prefill.type === '书信' || prefill.type === '通知') partSel.value = '小作文';
    if (trainingSession) {
      examSel.value = trainingSession.examType || examSel.value;
      var trainingQuestion = TrainingSession.getQuestion(trainingSession);
      if (trainingQuestion && trainingQuestion.part) partSel.value = trainingQuestion.part;
    }
    var topicInput = el('input', { class: 'input', id: 'topic-input', placeholder: '作文题目 / 话题（可选，填了批改更精准）', value: prefill.topic || '' });
    topicRow.appendChild(field('考试类型', examSel));
    topicRow.appendChild(field('大 / 小作文', partSel));
    topicRow.appendChild(field('题目 / 话题', topicInput));
    inputCard.appendChild(topicRow);

    var tabs = el('div', { class: 'tabs' });
    var tabUpload = el('div', { class: 'tab active', text: '上传 Word (.docx)', onclick: function () { switchInput('upload'); } });
    var tabPaste = el('div', { class: 'tab', text: '直接粘贴文本', onclick: function () { switchInput('paste'); } });
    tabs.appendChild(tabUpload);
    tabs.appendChild(tabPaste);
    inputCard.appendChild(tabs);

    var uploadBox = el('div', { id: 'upload-box' });
    var fileInput = el('input', { class: 'input', type: 'file', accept: '.docx,.txt' });
    uploadBox.appendChild(el('div', { class: 'warn-box', text: '支持 .docx 与 .txt；.doc（旧格式）请先在 Word 里另存为 .docx。' }));
    uploadBox.appendChild(fileInput);
    uploadBox.appendChild(el('div', { class: 'hint', id: 'file-status', text: '选择文件后自动抽取正文，可继续编辑。' }));

    var pasteBox = el('div', { id: 'paste-box', style: 'display:none;' });
    var textarea = el('textarea', { class: 'textarea mono', id: 'essay-text', placeholder: '把作文粘贴到这里…', style: 'min-height:240px;' });
    pasteBox.appendChild(textarea);
    pasteBox.appendChild(el('div', { class: 'hint', text: '可先将作文粘贴到这里；或切回“上传 Word”直接上传文件。' }));
    if (trainingSession && trainingSession.draft) {
      textarea.value = trainingSession.draft;
      switchInput('paste');
    }

    inputCard.appendChild(uploadBox);
    inputCard.appendChild(pasteBox);
    colMain.appendChild(inputCard);

    // 提交
    var actionCard = el('div', { class: 'card' });
    actionCard.appendChild(el('h3', { text: '基本统计（本地即时计算）' }));
    var statBox = el('div', { id: 'stat-box' });
    actionCard.appendChild(statBox);
    var submitBtn = el('button', { class: 'btn btn-primary btn-block mt', id: 'submit-btn', onclick: submit }, '开始 AI 批改');
    actionCard.appendChild(submitBtn);
    actionCard.appendChild(el('div', { class: 'hint', text: '提交时将发送「题目 + 作文」到你配置的模型接口；模型设置请见「数据管理」页。' }));
    colMain.appendChild(actionCard);

    var resultBox = el('div', { id: 'result-box' });
    colMain.appendChild(resultBox);

    // 历史
    var histCard = el('div', { class: 'card' });
    histCard.appendChild(el('div', { class: 'flex-between' },
      [el('h3', { text: '批改历史（本地）' }), el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { Store.clearHistory(); renderHistory(); toast('已清空'); } }, '清空')]));
    var histBox = el('div', { id: 'hist-box' });
    histCard.appendChild(histBox);
    colMain.appendChild(histCard);

    function renderHistory() {
      var h = Store.getHistory();
      histBox.innerHTML = '';
      if (!h.length) { histBox.appendChild(el('div', { class: 'empty', text: '暂无批改记录' })); return; }
      h.forEach(function (rec) {
        var item = el('div', { class: 'list-item' },
          [el('div', { class: 'li-main' },
            [el('div', { class: 'li-title', text: (rec.topic || '未命名题目') + ' · ' + rec.words + ' 词' }),
              el('div', { class: 'li-sub', text: rec.time + ' · ' + rec.exam + ' ' + rec.part })]),
            el('div', { class: 'flex' },
              [el('button', { class: 'btn btn-outline btn-sm', onclick: function () { loadResult(rec); } }, '查看'),
                el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { Store.deleteHistory(rec.id); renderHistory(); } }, '删除')])]);
        histBox.appendChild(item);
      });
    }

    function loadResult(rec) {
      resultBox.innerHTML = '';
      resultBox.appendChild(el('div', { class: 'card' },
        [el('div', { class: 'flex-between' },
          [el('h3', { text: '批改结果 · ' + (rec.topic || '未命名题目') }), el('span', { class: 'badge gray', text: rec.time })]),
          el('div', { class: 'md', html: md(rec.result) })]));
      window.scrollTo({ top: resultBox.offsetTop - 80, behavior: 'smooth' });
    }

    function switchInput(mode) {
      if (mode === 'upload') { tabUpload.classList.add('active'); tabPaste.classList.remove('active'); uploadBox.style.display = ''; pasteBox.style.display = 'none'; }
      else { tabPaste.classList.add('active'); tabUpload.classList.remove('active'); pasteBox.style.display = ''; uploadBox.style.display = 'none'; }
    }

    fileInput.addEventListener('change', function () {
      var f = fileInput.files[0];
      if (!f) return;
      var status = document.getElementById('file-status');
      status.textContent = '正在解析 ' + f.name + ' …';
      if (/\.txt$/i.test(f.name)) {
        f.text().then(function (t) { textarea.value = t; status.textContent = '已提取 ' + t.split(/\s+/).length + ' 词，可继续编辑。'; renderStats(t); });
        return;
      }
      if (typeof mammoth === 'undefined') { status.textContent = '解析组件未加载（libs/mammoth.browser.min.js 缺失），请改用粘贴文本。'; toast('mammoth 未加载'); return; }
      f.arrayBuffer().then(function (buf) { return mammoth.extractRawText({ arrayBuffer: buf }); })
        .then(function (res) {
          var t = (res.value || '').trim();
          textarea.value = t;
          status.textContent = '已提取 ' + (t ? t.split(/\s+/).length : 0) + ' 词，可继续编辑。';
          renderStats(t);
        })
        .catch(function (err) { status.textContent = '解析失败：' + (err && err.message ? err.message : err) + '，请改用粘贴文本。'; });
    });
    textarea.addEventListener('input', function () {
      renderStats(textarea.value);
      if (trainingSession && trainingSession.currentStep === 'correcting') TrainingSession.update({ draft: textarea.value });
    });

    function submit() {
      var text = textarea.value.trim();
      var s2 = Store.getSettings();
      if (!text) { toast('请先上传或粘贴作文内容'); switchInput('paste'); return; }
      if (!s2.apiKey) { toast('请先在「数据管理」页配置 API Key'); return; }
      if (!s2.baseUrl || !s2.model) { toast('请填写 API Base URL 与模型名称'); return; }

      var exam = examSel.value, part = partSel.value;
      var basis = scoreBasis(exam, part);
      var topic = topicInput.value.trim() || '（未指定，请结合作文内容判断话题）';

      // 评分标准 + 该题参考要点
      var scoringText = Store.getScoring().filter(function (s) { return s.exam === exam && s.part === part; })
        .map(function (s) { return s.band + '（' + s.range + '分）：' + s.criteria; }).join('\n');
      var essay = Store.getEssays().filter(function (e) { return topic && (topic.indexOf(e.title) >= 0 || e.title.indexOf(topic) >= 0); })[0];
      var refText = '';
      if (essay) {
        var kp = essay.keyPoints || {};
        refText = '题目：' + essay.title + '（' + essay.year + ' ' + essay.exam + ' ' + essay.type + '）\n'
          + '参考结构：' + (kp.structure || []).join('；') + '\n'
          + '核心词汇：' + (kp.keywords || []).join(', ') + '\n'
          + '高分好句：' + (kp.goodSentences || []).join(' | ');
      }

      var userMsg = [
        '【考试类型】' + exam + ' · ' + part + '（满分 ' + basis + ' 分）',
        '【作文题目/话题】' + topic,
        scoringText ? '【评分标准（分档要求）】\n' + scoringText : '',
        refText ? '【该题高分参考要点（来自本站真题库，供评分与点评参考）】\n' + refText : '',
        '【学生作文】',
        text
      ].filter(Boolean).join('\n\n');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spin"></span> 正在批改，请稍候…';
      resultBox.innerHTML = '';
      resultBox.appendChild(el('div', { class: 'card' }, el('div', { class: 'empty', text: '模型正在批改，通常需要几秒到几十秒…' })));

      var url = s2.baseUrl.replace(/\/+$/, '') + '/chat/completions';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s2.apiKey },
        body: JSON.stringify({ model: s2.model, temperature: s2.temperature, messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userMsg }] })
      }).then(function (resp) {
        if (!resp.ok) return resp.text().then(function (t) { throw new Error('HTTP ' + resp.status + '：' + t.slice(0, 300)); });
        return resp.json();
      }).then(function (data) {
        var content = data && data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
        if (!content) throw new Error('接口未返回内容');
        var stats = localStats(text);
        var rec = { id: 'h' + Date.now(), time: new Date().toLocaleString('zh-CN'), exam: exam, part: part, topic: topic, words: stats.words, essay: text, result: content };
        Store.addHistory(rec);
        renderResult(content, rec.time, topic);
        renderHistory();
        var activeSession = TrainingSession.getCurrent();
        if (activeSession && activeSession.currentStep === 'correcting') {
          TrainingSession.update({ correctionResult: content, currentStep: 'rewriting' });
          setTimeout(function () { location.hash = 'today'; }, 0);
        }
        toast('批改完成');
      }).catch(function (err) {
        var msg = err && err.message ? err.message : String(err);
        resultBox.innerHTML = '';
        resultBox.appendChild(el('div', { class: 'card' },
          [el('div', { class: 'error-text', style: 'font-weight:600;', text: '批改失败：' + msg }),
            el('div', { class: 'hint mt', text: '常见原因：① API Key 无效或余额不足；② Base URL / 模型名错误；③ 该服务商禁止浏览器跨域（CORS）直连——请改用 DeepSeek 或 SiliconFlow；④ 网络不通。' })]));
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = '开始 AI 批改';
      });
    }

    function renderResult(content, time, topic) {
      resultBox.innerHTML = '';
      resultBox.appendChild(el('div', { class: 'card result-card' },
        [el('div', { class: 'flex-between' },
          [el('h3', { text: '批改结果 · ' + (topic || '未命名题目') }), el('span', { class: 'badge gray', text: time || '' })]),
          el('div', { class: 'md', html: md(content) })]));
      window.scrollTo({ top: resultBox.offsetTop - 80, behavior: 'smooth' });
    }

    // 初始渲染
    renderHistory();
    if (prefill.type) { topicInput.value = prefill.topic || ''; toast('已带入题目，请粘贴/上传你的作文'); }
  };

  // 供「数据管理」页复用服务商列表
  window.AI_PROVIDERS = PROVIDERS;
})();
