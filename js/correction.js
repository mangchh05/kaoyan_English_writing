/* ============================================================
   correction.js — AI 作文批改（.docx 解析 + 大模型 + 本地统计）
   ============================================================ */
(function () {
  'use strict';
  var el = window.UI.el, toast = window.UI.toast, md = window.UI.renderMarkdown;

  var PROVIDERS = [
    { id: 'deepseek', name: 'DeepSeek（推荐，支持浏览器直连）', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'] },
    { id: 'siliconflow', name: 'SiliconFlow（支持浏览器直连）', baseUrl: 'https://api.siliconflow.cn/v1', models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct', 'Qwen/Qwen2.5-7B-Instruct'] },
    { id: 'moonshot', name: 'Moonshot / Kimi', baseUrl: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] },
    { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'] },
    { id: 'qwen', name: '通义千问（DashScope 兼容模式）', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-plus', 'qwen-turbo', 'qwen-max'] },
    { id: 'zhipu', name: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4-flash', 'glm-4-plus'] },
    { id: 'custom', name: '自定义（OpenAI 兼容接口）', baseUrl: '', models: [] }
  ];

  var SYSTEM_PROMPT = [
    '你是一位资深的考研英语（全国硕士研究生招生考试英语一/英语二）写作阅卷专家。请对学生作文进行专业、细致、有针对性的批改。',
    '请使用中文输出，并使用 Markdown 排版，严格按以下结构：',
    '## 评分',
    '- 总分：X / 满分Y分（并说明所属档次，如"第五档/第四档"）',
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
    '要求：评价客观、具体、针对学生原文，避免空话套话；引用学生原文时必须准确。'
  ].join('\n');

  function scoreBasis(exam, part) {
    if (part === '小作文') return 10;
    if (exam === '英语二') return 15;
    return 20;
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
      words: words.length,
      unique: clean.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      avgSentence: sentences.length ? (words.length / sentences.length).toFixed(1) : '0',
      avgWord: words.length ? (totalChars / words.length).toFixed(1) : '0'
    };
  }

  function renderStats(text) {
    var s = localStats(text);
    var box = document.getElementById('stat-box');
    if (!box) return;
    box.innerHTML = '';
    box.appendChild(el('div', { class: 'grid grid-4', style: 'gap:10px;' },
      [
        ['词数', s.words], ['句子数', s.sentences], ['不同词', s.unique], ['段落数', s.paragraphs],
        ['均句长', s.avgSentence + ' 词'], ['均词长', s.avgWord + ' 字母'], ['词汇丰富度', (s.unique / Math.max(s.words, 1) * 100).toFixed(0) + '%'], ['推荐词数', '见评分标准']
      ].map(function (it) {
        return el('div', { class: 'card tight', style: 'padding:10px;text-align:center;' },
          [el('div', { class: 'small muted', text: it[0] }), el('div', { style: 'font-size:20px;font-weight:700;color:#2f54eb;', text: String(it[1]) })]);
      })));
  }

  function getProvider(id) {
    return PROVIDERS.filter(function (p) { return p.id === id; })[0] || PROVIDERS[0];
  }

  App.pages.correct = function (root) {
    var settings = Store.getSettings();

    // 读取从"出题"页带来的题目
    var prefill = {};
    try { prefill = JSON.parse(sessionStorage.getItem('kyeng.prefillTopic') || '{}'); } catch (e) { prefill = {}; }

    root.appendChild(el('div', { class: 'page-head' },
      [el('h2', { text: '✍️ AI 作文批改' }), el('div', { class: 'sub', text: '上传 Word（.docx）或粘贴作文，调用大模型给出评分与批改意见；数据只经你配置的 API 发送。' })]));

    // ---- 设置 ----
    var setCard = el('div', { class: 'card' });
    setCard.appendChild(el('h3', { text: '🔑 模型设置（保存在本地浏览器）' }));
    var setRow = el('div', { class: 'form-row' });
    var provSel = el('select', { class: 'select', id: 'prov-sel' },
      PROVIDERS.map(function (p) { return el('option', { value: p.id, text: p.name }); }));
    provSel.value = settings.provider;
    var baseInput = el('input', { class: 'input', id: 'base-url', placeholder: 'API Base URL', value: settings.baseUrl });
    var modelInput = el('input', { class: 'input', id: 'model', placeholder: '模型名称', value: settings.model, list: 'model-list' });
    var modelList = el('datalist', { id: 'model-list' }, getProvider(settings.provider).models.map(function (m) { return el('option', { value: m }); }));
    var keyInput = el('input', { class: 'input', id: 'api-key', type: 'password', placeholder: 'API Key（仅存本地）', value: settings.apiKey });
    var tempInput = el('input', { class: 'input', id: 'temp', type: 'number', step: '0.1', min: '0', max: '2', value: settings.temperature, style: 'max-width:100px;' });
    setRow.appendChild(provSel);
    setRow.appendChild(keyInput);
    setRow.appendChild(baseInput);
    setRow.appendChild(modelInput);
    setRow.appendChild(modelList);
    setRow.appendChild(el('div', { class: 'form-group', style: 'flex:0 0 90px;min-width:90px;' },
      [el('label', { text: '温度' }), tempInput]));
    setCard.appendChild(setRow);
    setCard.appendChild(el('div', { class: 'hint', text: '提示：推荐 DeepSeek / SiliconFlow（浏览器直连稳定）。API Key 仅保存在你本地浏览器 localStorage，不会上传到本站任何服务器。' }));
    var saveBtn = el('button', { class: 'btn btn-outline btn-sm mt', onclick: function () { saveSettings(); } }, '保存设置');
    setCard.appendChild(saveBtn);
    root.appendChild(setCard);

    function saveSettings() {
      Store.setSettings({
        provider: provSel.value, baseUrl: baseInput.value.trim(), model: modelInput.value.trim(),
        apiKey: keyInput.value.trim(), temperature: parseFloat(tempInput.value) || 0.3
      });
      toast('设置已保存');
    }
    provSel.addEventListener('change', function () {
      var p = getProvider(provSel.value);
      baseInput.value = p.baseUrl;
      if (p.models.length) modelInput.value = p.models[0];
      modelList.innerHTML = '';
      p.models.forEach(function (m) { modelList.appendChild(el('option', { value: m })); });
    });

    // ---- 题目与输入 ----
    var inputCard = el('div', { class: 'card' });
    inputCard.appendChild(el('h3', { text: '📄 作文题目与正文' }));

    var topicRow = el('div', { class: 'form-row' });
    var examSel = el('select', { class: 'select', id: 'exam-sel' }, [el('option', { value: '英语一', text: '英语一' }), el('option', { value: '英语二', text: '英语二' })]);
    var partSel = el('select', { class: 'select', id: 'part-sel' }, [el('option', { value: '大作文', text: '大作文' }), el('option', { value: '小作文', text: '小作文' })]);
    if (prefill.type === '书信' || prefill.type === '通知') partSel.value = '小作文';
    var topicInput = el('input', { class: 'input', id: 'topic-input', placeholder: '作文题目 / 话题（可选，填了批改更精准）', value: prefill.topic || '' });
    topicRow.appendChild(examSel);
    topicRow.appendChild(partSel);
    topicRow.appendChild(topicInput);
    inputCard.appendChild(topicRow);

    // 选项卡：上传 / 粘贴
    var tabs = el('div', { class: 'tabs' });
    var tabUpload = el('div', { class: 'tab active', text: '📎 上传 Word (.docx)', onclick: function () { switchInput('upload'); } });
    var tabPaste = el('div', { class: 'tab', text: '📝 直接粘贴文本', onclick: function () { switchInput('paste'); } });
    tabs.appendChild(tabUpload);
    tabs.appendChild(tabPaste);
    inputCard.appendChild(tabs);

    var uploadBox = el('div', { id: 'upload-box' });
    var fileInput = el('input', { class: 'input', type: 'file', accept: '.docx,.txt' });
    uploadBox.appendChild(el('div', { class: 'warn-box', text: '支持 .docx 与 .txt；.doc（旧格式）请先在 Word 里另存为 .docx。' }));
    uploadBox.appendChild(fileInput);
    uploadBox.appendChild(el('div', { class: 'hint', id: 'file-status', text: '选择文件后自动抽取正文，可继续编辑。' }));

    var pasteBox = el('div', { id: 'paste-box', style: 'display:none;' });
    var textarea = el('textarea', { class: 'textarea mono', id: 'essay-text', placeholder: '把作文粘贴到这里…', style: 'min-height:220px;' });
    pasteBox.appendChild(textarea);

    inputCard.appendChild(uploadBox);
    inputCard.appendChild(pasteBox);

    var prefillText = prefill.text || '';
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
      if (typeof mammoth === 'undefined') {
        status.textContent = '解析组件未加载（libs/mammoth.browser.min.js 缺失），请改用粘贴文本。';
        toast('mammoth 未加载');
        return;
      }
      f.arrayBuffer().then(function (buf) {
        return mammoth.extractRawText({ arrayBuffer: buf });
      }).then(function (res) {
        var t = (res.value || '').trim();
        textarea.value = t;
        status.textContent = '已提取 ' + (t ? t.split(/\s+/).length : 0) + ' 词，可继续编辑。';
        renderStats(t);
      }).catch(function (err) {
        status.textContent = '解析失败：' + (err && err.message ? err.message : err) + '，请改用粘贴文本。';
      });
    });
    textarea.addEventListener('input', function () { renderStats(textarea.value); });

    root.appendChild(inputCard);

    // ---- 提交 ----
    var actionCard = el('div', { class: 'card' });
    var statBox = el('div', { id: 'stat-box' });
    actionCard.appendChild(el('h3', { text: '📊 基本统计（本地即时计算）' }));
    actionCard.appendChild(statBox);
    var submitBtn = el('button', { class: 'btn btn-primary btn-block mt', id: 'submit-btn', onclick: submit }, '开始 AI 批改');
    actionCard.appendChild(submitBtn);
    actionCard.appendChild(el('div', { class: 'hint', text: '提交后将把「题目 + 你的作文」发送到上面配置的模型接口；请先保存模型设置并填写 API Key。' }));
    root.appendChild(actionCard);

    var resultBox = el('div', { id: 'result-box' });
    root.appendChild(resultBox);

    // ---- 历史 ----
    var histCard = el('div', { class: 'card' });
    histCard.appendChild(el('div', { class: 'flex-between' },
      [el('h3', { text: '🕘 批改历史（本地）' }), el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { Store.clearHistory(); renderHistory(); toast('已清空'); } }, '清空')]));
    var histBox = el('div', { id: 'hist-box' });
    histCard.appendChild(histBox);
    root.appendChild(histCard);

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

    function submit() {
      var text = textarea.value.trim();
      var settings2 = Store.getSettings();
      if (!text) { toast('请先上传或粘贴作文内容'); switchInput('paste'); return; }
      if (!settings2.apiKey) { toast('请先填写 API Key 并保存设置'); return; }
      if (!settings2.baseUrl || !settings2.model) { toast('请填写 API Base URL 与模型名称'); return; }

      var exam = examSel.value, part = partSel.value;
      var basis = scoreBasis(exam, part);
      var topic = topicInput.value.trim() || '（未指定，请结合作文内容判断话题）';

      var userMsg = [
        '【考试类型】' + exam + ' · ' + part + '（满分 ' + basis + ' 分）',
        '【作文题目/话题】' + topic,
        '【学生作文】',
        text
      ].join('\n\n');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spin"></span> 正在批改，请稍候…';
      resultBox.innerHTML = '';
      resultBox.appendChild(el('div', { class: 'card' }, el('div', { class: 'empty', text: '模型正在批改，通常需要几秒到几十秒…' })));

      var url = settings2.baseUrl.replace(/\/+$/, '') + '/chat/completions';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + settings2.apiKey },
        body: JSON.stringify({
          model: settings2.model,
          temperature: settings2.temperature,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMsg }
          ]
        })
      }).then(function (resp) {
        if (!resp.ok) {
          return resp.text().then(function (t) { throw new Error('HTTP ' + resp.status + '：' + t.slice(0, 300)); });
        }
        return resp.json();
      }).then(function (data) {
        var content = data && data.choices && data.choices[0] && data.choices[0].message
          ? data.choices[0].message.content : '';
        if (!content) throw new Error('接口未返回内容');
        var stats = localStats(text);
        var rec = {
          id: 'h' + Date.now(),
          time: new Date().toLocaleString('zh-CN'),
          exam: exam, part: part, topic: topic, words: stats.words,
          essay: text, result: content
        };
        Store.addHistory(rec);
        renderResult(content, rec.time, topic);
        renderHistory();
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
      resultBox.appendChild(el('div', { class: 'card' },
        [el('div', { class: 'flex-between' },
          [el('h3', { text: '批改结果 · ' + (topic || '未命名题目') }), el('span', { class: 'badge gray', text: time || '' })]),
          el('div', { class: 'md', html: md(content) })]));
      window.scrollTo({ top: resultBox.offsetTop - 80, behavior: 'smooth' });
    }

    // 初始渲染
    renderHistory();
    if (prefillText) {
      var starter = prefill.type + '：' + (prefill.topic || '') + '\n\n' + prefillText + '\n\n（请在下方粘贴你的作文）';
      // 仅把题目放进题目框，正文留空让用户填
      topicInput.value = prefill.topic || '';
      toast('已带入题目，请粘贴/上传你的作文');
    }
  };
})();
