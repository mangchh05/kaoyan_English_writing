/* ============================================================
   admin.js — 数据管理（录入/更新真题范文与好词好句 + 导入导出）
   说明：网页里的改动保存在浏览器 localStorage 覆盖层；导出可生成
   可直接提交 git 的 data-essays-*.js 文件。
   ============================================================ */
(function () {
  'use strict';
  var el = window.UI.el, toast = window.UI.toast;

  var TYPES = ['图画作文', '图表作文', '议论文', '建议信', '道歉信', '邀请信', '感谢信', '投诉信', '咨询信', '推荐信', '通知/告示', '备忘录/报告'];
  var CATS = ['教育学习', '环境保护', '科技网络', '文化传统', '社会民生', '人生哲理', '图表描述', '书信功能句', '开头/结尾万能句'];

  function makeId(p) { return p + '-' + Date.now().toString(36) + Math.floor(Math.random() * 1000); }
  function splitLines(s) { return String(s || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }
  function splitComma(s) { return String(s || '').split(/[,，、]/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function downloadFile(name, text) {
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 100);
  }

  App.pages.admin = function (root) {
    root.appendChild(el('div', { class: 'page-head' },
      [el('h2', { text: '数据管理（输入口）' }), el('div', { class: 'sub', text: '在这里配置模型、录入真题范文与好词好句；改动即时生效并保存在本地，可导出为 git 可提交的数据文件。' })]));

    /* ================= 模型设置（AI 批改共用） ================= */
    var PROVIDERS = window.AI_PROVIDERS || [];
    var s = Store.getSettings();
    var setCard = el('div', { class: 'card' });
    setCard.appendChild(el('div', { class: 'flex-between' },
      [el('h3', { text: '模型设置（AI 批改使用）' }), el('span', { class: 'badge gray', text: '仅保存在本机浏览器' })]));
    var provSel = el('select', { class: 'select' }, PROVIDERS.map(function (p) { return el('option', { value: p.id, text: p.name }); }));
    provSel.value = s.provider;
    var keyInput = el('input', { class: 'input', type: 'password', placeholder: 'sk-…', value: s.apiKey });
    var baseInput = el('input', { class: 'input', value: s.baseUrl });
    var modelInput = el('input', { class: 'input', value: s.model, list: 'adm-model-list' });
    var modelList = el('datalist', { id: 'adm-model-list' });
    var tempInput = el('input', { class: 'input', type: 'number', step: '0.1', min: '0', max: '2', value: s.temperature });
    function fillModels() {
      var p = PROVIDERS.filter(function (x) { return x.id === provSel.value; })[0] || PROVIDERS[0] || { models: [] };
      modelList.innerHTML = '';
      (p.models || []).forEach(function (m) { modelList.appendChild(el('option', { value: m })); });
    }
    fillModels();
    provSel.addEventListener('change', function () {
      var p = PROVIDERS.filter(function (x) { return x.id === provSel.value; })[0];
      if (p) { baseInput.value = p.baseUrl; if (p.models.length) modelInput.value = p.models[0]; }
      fillModels();
    });
    setCard.appendChild(el('div', { class: 'form-row' }, [field('服务商', provSel), field('API Key', keyInput), field('模型', modelInput), modelList]));
    setCard.appendChild(el('div', { class: 'form-row' }, [field('Base URL', baseInput), field('温度', tempInput)]));
    setCard.appendChild(el('div', { class: 'hint', text: '温度（0–2）控制回答随机度：越低越稳定、越标准，越高越有创意，批改建议 0.3。推荐 DeepSeek / SiliconFlow（浏览器直连稳定）。' }));
    setCard.appendChild(el('button', { class: 'btn btn-primary btn-sm mt', onclick: function () {
      Store.setSettings({ provider: provSel.value, baseUrl: baseInput.value.trim(), model: modelInput.value.trim(), apiKey: keyInput.value.trim(), temperature: parseFloat(tempInput.value) || 0.3 });
      toast('模型设置已保存');
    } }, '保存设置'));
    root.appendChild(setCard);

    /* ================= 真题/范文 ================= */
    var essayCard = el('div', { class: 'card' });
    essayCard.appendChild(el('div', { class: 'flex-between' },
      [el('h3', { text: '真题 / 范文管理' }), el('button', { class: 'btn btn-primary btn-sm', onclick: function () { essayForm(null, refresh); } }, '新增真题/范文')]));
    var esSearch = el('input', { class: 'input', id: 'adm-es-search', placeholder: '搜索题目/年份…', style: 'margin-bottom:12px;' });
    esSearch.addEventListener('input', refresh);
    essayCard.appendChild(esSearch);
    var esBox = el('div', { id: 'adm-es-box' });
    essayCard.appendChild(esBox);
    root.appendChild(essayCard);

    function refresh() {
      var q = esSearch.value.trim().toLowerCase();
      var list = Store.getEssays().slice().sort(function (a, b) { return b.year - a.year; });
      esBox.innerHTML = '';
      list.filter(function (e) {
        if (!q) return true;
        return (e.title + ' ' + e.year + ' ' + e.exam + ' ' + e.type).toLowerCase().indexOf(q) >= 0;
      }).forEach(function (e) {
        var item = el('div', { class: 'list-item' },
          [el('div', { class: 'li-main' },
            [el('div', { class: 'flex' }, [el('span', { class: 'badge', text: e.year + ' ' + e.exam }), el('span', { class: 'badge cyan', text: e.type }), el('span', { class: 'badge gray', text: e.part })]),
              el('div', { class: 'li-title', style: 'margin-top:4px;', text: e.title })]),
            el('div', { class: 'flex' },
              [el('button', { class: 'btn btn-outline btn-sm', onclick: function () { essayForm(e, refresh); } }, '编辑'),
                el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { if (confirm('确定删除「' + e.title + '」？')) { Store.deleteEssay(e.id); toast('已删除'); refresh(); } } }, '删除')])]);
        esBox.appendChild(item);
      });
      if (!list.length) esBox.appendChild(el('div', { class: 'empty', text: '暂无数据' }));
    }

    /* ================= 好词好句 ================= */
    var phCard = el('div', { class: 'card' });
    phCard.appendChild(el('div', { class: 'flex-between' },
      [el('h3', { text: '好词好句管理' }), el('button', { class: 'btn btn-primary btn-sm', onclick: function () { phraseForm(null, refreshPh); } }, '新增词句')]));
    var phBox = el('div', { id: 'adm-ph-box' });
    phCard.appendChild(phBox);
    root.appendChild(phCard);

    function refreshPh() {
      var list = Store.getPhrases();
      phBox.innerHTML = '';
      list.forEach(function (p) {
        var item = el('div', { class: 'list-item' },
          [el('div', { class: 'li-main' },
            [el('span', { class: 'badge gray', text: p.category }), el('span', { class: 'li-title', text: p.text, style: 'margin-left:6px;' }),
              el('div', { class: 'li-sub', text: p.translation })]),
            el('div', { class: 'flex' },
              [el('button', { class: 'btn btn-outline btn-sm', onclick: function () { phraseForm(p, refreshPh); } }, '编辑'),
                el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { if (confirm('删除该词句？')) { Store.deletePhrase(p.id); toast('已删除'); refreshPh(); } } }, '删除')])]);
        phBox.appendChild(item);
      });
      if (!list.length) phBox.appendChild(el('div', { class: 'empty', text: '暂无数据' }));
    }

    /* ================= 导入 / 导出 ================= */
    var ioCard = el('div', { class: 'card' });
    ioCard.appendChild(el('h3', { text: '导入 / 导出 / 重置' }));
    var importInput = el('input', { class: 'input', type: 'file', accept: '.json', style: 'display:none;' });
    ioCard.appendChild(el('div', { class: 'flex' },
      [
        el('button', { class: 'btn btn-outline', onclick: exportJson }, '导出全部数据(JSON 备份)'),
        el('button', { class: 'btn btn-outline', onclick: exportJsFiles }, '导出三份真题 JS 文件(git 用)'),
        el('button', { class: 'btn btn-outline', onclick: function () { importInput.click(); } }, '导入 JSON 合并'),
        importInput,
        el('button', { class: 'btn btn-danger', onclick: function () { if (confirm('重置所有本地修改（恢复为 data-*.js 文件中的原始数据）？此操作不可撤销。')) { Store.resetOverrides(); toast('已重置'); refresh(); refreshPh(); } } }, '重置本地修改')
      ]));
    ioCard.appendChild(el('div', { class: 'warn-box', style: 'margin-top:12px;' },
      [el('div', { text: '两种维护方式：' }),
        el('div', { text: '① 网页即时：在下方表单新增/修改，改动存浏览器 localStorage（换设备/清缓存会丢失），可「导出 JSON」备份。' }),
        el('div', { text: '② 长期版本化（推荐）：点「导出三份真题 JS 文件」覆盖 js/ 下同名文件，再 git commit / push；或在代码编辑器里直接编辑 js/data-essays-*.js。' })]));
    root.appendChild(ioCard);

    importInput.addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      f.text().then(function (t) {
        try {
          var d = JSON.parse(t);
          var n = 0;
          (d.essays || []).forEach(function (e) { if (e && e.id) { Store.upsertEssay(e); n++; } });
          (d.phrases || []).forEach(function (p) { if (p && p.id) { Store.upsertPhrase(p); n++; } });
          toast('已导入合并 ' + n + ' 条'); refresh(); refreshPh();
        } catch (e) { toast('导入失败：不是有效的 JSON'); }
      });
      this.value = '';
    });

    function exportJson() {
      downloadFile('kaoyan-english-data-' + dateStr() + '.json', JSON.stringify(Store.exportData(), null, 2));
      toast('已导出 JSON');
    }
    function exportJsFiles() {
      var essays = Store.getEssays();
      var en1 = essays.filter(function (e) { return e.exam === '英语一'; });
      var en2 = essays.filter(function (e) { return e.exam === '英语二'; });
      var xiao = essays.filter(function (e) { return e.part === '小作文' || e.exam === '英语一/英语二'; });
      // 小作文不重复进 en1/en2
      en1 = en1.filter(function (e) { return e.part !== '小作文'; });
      en2 = en2.filter(function (e) { return e.part !== '小作文'; });
      downloadFile('data-essays-en1.js', 'window.APP_DATA_EN1 = ' + JSON.stringify(en1, null, 2) + ';\n');
      downloadFile('data-essays-en2.js', 'window.APP_DATA_EN2 = ' + JSON.stringify(en2, null, 2) + ';\n');
      downloadFile('data-essays-xiao.js', 'window.APP_DATA_XIAO = ' + JSON.stringify(xiao, null, 2) + ';\n');
      toast('已导出三份 JS 文件');
    }
    function dateStr() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

    refresh();
    refreshPh();
  };

  /* ================= 表单 ================= */
  function field(label, input) {
    return el('div', { class: 'form-group' }, [el('label', { text: label }), input]);
  }

  function essayForm(existing, onSave) {
    var isNew = !existing;
    var d = existing || { exam: '英语一', part: '大作文', type: '图画作文', year: new Date().getFullYear(), title: '', prompt: '', topicTags: [], modelEssay: '', keyPoints: { structure: [], keywords: [], goodSentences: [], notes: '' }, framework: '图画作文' };
    var kp = d.keyPoints || {};
    var modal = window.UI.openModal('', (isNew ? '新增' : '编辑') + '真题/范文');
    var m = modal.body;

    var examSel = el('select', { class: 'select' }, ['英语一', '英语二', '英语一/英语二'].map(function (x) { return el('option', { value: x, text: x }); }));
    examSel.value = d.exam === '英语一/英语二' ? '英语一/英语二' : d.exam;
    var partSel = el('select', { class: 'select' }, ['大作文', '小作文'].map(function (x) { return el('option', { value: x, text: x }); }));
    partSel.value = d.part;
    var typeInput = el('input', { class: 'input', list: 'adm-type-list', value: d.type });
    var typeList = el('datalist', { id: 'adm-type-list' }, TYPES.map(function (t) { return el('option', { value: t }); }));
    var yearInput = el('input', { class: 'input', type: 'number', value: d.year });
    var titleInput = el('input', { class: 'input', value: d.title, placeholder: '题目/标题' });
    var fwSel = el('select', { class: 'select' }, Store.getFrameworks().map(function (f) { return el('option', { value: f.type, text: f.type }); }));
    fwSel.value = d.framework || '图画作文';

    m.appendChild(el('div', { class: 'form-row' }, [field('考试类型', examSel), field('大/小作文', partSel), field('年份', yearInput)]));
    m.appendChild(el('div', { class: 'form-row' }, [field('题型', typeInput), typeList, field('关联框架', fwSel)]));
    m.appendChild(field('标题', titleInput));
    var promptTa = el('textarea', { class: 'textarea', style: 'min-height:80px;', text: d.prompt });
    m.appendChild(field('题目原文（图画/图表描述 + 写作要求）', promptTa));
    var tagsInput = el('input', { class: 'input', value: (d.topicTags || []).join('，'), placeholder: '话题标签，用逗号分隔' });
    m.appendChild(field('话题标签', tagsInput));
    var essayTa = el('textarea', { class: 'textarea mono', style: 'min-height:200px;', text: d.modelEssay });
    m.appendChild(field('范文（英文，段落间留空行）', essayTa));

    m.appendChild(el('h4', { text: '要点拆解', style: 'margin:14px 0 8px;' }));
    var stTa = el('textarea', { class: 'textarea', style: 'min-height:70px;', text: (kp.structure || []).join('\n'), placeholder: '结构要点，每行一条' });
    m.appendChild(field('结构要点（每行一条）', stTa));
    var kwTa = el('textarea', { class: 'textarea', style: 'min-height:56px;', text: (kp.keywords || []).join(', '), placeholder: '核心词汇，逗号分隔' });
    m.appendChild(field('核心词汇（逗号分隔）', kwTa));
    var gsTa = el('textarea', { class: 'textarea', style: 'min-height:70px;', text: (kp.goodSentences || []).join('\n'), placeholder: '好句摘抄，每行一句' });
    m.appendChild(field('好句摘抄（每行一句）', gsTa));
    var noteTa = el('textarea', { class: 'textarea', style: 'min-height:60px;', text: kp.notes || '' });
    m.appendChild(field('写作要点提示', noteTa));

    m.appendChild(el('div', { class: 'modal-actions' },
      [el('button', { class: 'btn btn-primary', onclick: function () {
        if (!titleInput.value.trim() || !essayTa.value.trim()) { toast('标题与范文不能为空'); return; }
        var obj = {
          id: existing ? existing.id : makeId('essay'),
          exam: examSel.value, part: partSel.value, type: typeInput.value.trim() || '图画作文',
          year: parseInt(yearInput.value, 10) || new Date().getFullYear(),
          title: titleInput.value.trim(), prompt: promptTa.value.trim(),
          topicTags: splitComma(tagsInput.value), modelEssay: essayTa.value.trim(),
          keyPoints: { structure: splitLines(stTa.value), keywords: splitComma(kwTa.value), goodSentences: splitLines(gsTa.value), notes: noteTa.value.trim() },
          framework: fwSel.value
        };
        Store.upsertEssay(obj); toast('已保存'); modal.close(); onSave();
      } }, '保存'),
        el('button', { class: 'btn btn-outline', onclick: function () { modal.close(); } }, '取消')]));
  }

  function phraseForm(existing, onSave) {
    var isNew = !existing;
    var d = existing || { category: '教育学习', text: '', translation: '', usage: '', tags: [] };
    var modal = window.UI.openModal('', (isNew ? '新增' : '编辑') + '好词好句');
    var m = modal.body;
    var catSel = el('select', { class: 'select' }, CATS.map(function (c) { return el('option', { value: c, text: c }); }));
    catSel.value = d.category;
    m.appendChild(field('分类', catSel));
    var textTa = el('textarea', { class: 'textarea mono', style: 'min-height:70px;', text: d.text });
    m.appendChild(field('英文原句/词', textTa));
    var trInput = el('input', { class: 'input', value: d.translation });
    m.appendChild(field('中文翻译', trInput));
    var useInput = el('input', { class: 'input', value: d.usage });
    m.appendChild(field('用法说明', useInput));
    var tagsInput = el('input', { class: 'input', value: (d.tags || []).join('，'), placeholder: '标签，逗号分隔' });
    m.appendChild(field('标签', tagsInput));
    m.appendChild(el('div', { class: 'modal-actions' },
      [el('button', { class: 'btn btn-primary', onclick: function () {
        if (!textTa.value.trim()) { toast('英文内容不能为空'); return; }
        Store.upsertPhrase({ id: existing ? existing.id : makeId('ph'), category: catSel.value, text: textTa.value.trim(), translation: trInput.value.trim(), usage: useInput.value.trim(), tags: splitComma(tagsInput.value) });
        toast('已保存'); modal.close(); onSave();
      } }, '保存'),
        el('button', { class: 'btn btn-outline', onclick: function () { modal.close(); } }, '取消')]));
  }
})();
