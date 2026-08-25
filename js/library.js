/* ============================================================
   library.js — 真题库（题目 / 范文 / 要点）
   ============================================================ */
(function () {
  'use strict';
  var el = window.UI.el, toast = window.UI.toast, esc = window.UI.escapeHtml;

  function uniq(arr) { var m = {}; arr.forEach(function (x) { m[x] = 1; }); return Object.keys(m); }

  function openEssay(e) {
    var modal = window.UI.openModal('', e.year + ' · ' + e.exam + ' · ' + e.part + ' · ' + e.title);
    var body = modal.body;
    body.appendChild(el('div', { class: 'flex mb' },
      [el('span', { class: 'badge', text: e.exam }), el('span', { class: 'badge cyan', text: e.type }),
        el('span', { class: 'badge gray', text: e.part }),
        (e.topicTags || []).map(function (t) { return el('span', { class: 'tag', text: t }); })]));

    // 真题配图（图表 / 图画 / 原图文件）
    if (e.image) {
      var imgBox = el('div', { style: 'margin:12px 0;' });
      imgBox.innerHTML = App.charts.renderImage(e.image);
      body.appendChild(imgBox);
    }

    body.appendChild(el('h4', { text: '题目' }));
    body.appendChild(el('div', { class: 'essay-text', style: 'font-family:inherit;font-size:14px;', text: e.prompt }));

    body.appendChild(el('h4', { text: '范文' }));
    body.appendChild(el('div', { class: 'essay-text', text: e.modelEssay }));

    var kp = e.keyPoints || {};
    if (kp.structure && kp.structure.length) {
      body.appendChild(el('div', { class: 'kp-block' },
        [el('h4', { text: '结构要点' }), el('ul', {}, kp.structure.map(function (s) { return el('li', { text: s }); }))]));
    }
    if (kp.keywords && kp.keywords.length) {
      var kw = el('div', { class: 'kp-block' });
      kw.appendChild(el('h4', { text: '核心词汇' }));
      kw.appendChild(el('div', {}, kp.keywords.map(function (k) { return el('span', { class: 'tag', style: 'background:#eef2ff;color:#1d39c4;', text: k }); })));
      body.appendChild(kw);
    }
    if (kp.goodSentences && kp.goodSentences.length) {
      body.appendChild(el('div', { class: 'kp-block' },
        [el('h4', { text: '好句摘抄' }), el('ul', {}, kp.goodSentences.map(function (s) { return el('li', { text: s, style: 'font-style:italic;' }); }))]));
    }
    if (kp.notes) {
      body.appendChild(el('div', { class: 'kp-block' }, [el('h4', { text: '写作要点' }), el('p', { text: kp.notes })]));
    }

    body.appendChild(el('div', { class: 'modal-actions' },
      [el('button', { class: 'btn btn-primary', onclick: function () { sessionStorage.setItem('kyeng.memorizeEssay', e.id); location.hash = 'memorize'; modal.close(); } }, '背诵这篇'),
        el('button', { class: 'btn btn-outline', onclick: function () { goCorrect(e); modal.close(); } }, '就这题练习批改'),
        e.framework ? el('button', { class: 'btn btn-ghost', onclick: function () { sessionStorage.setItem('kyeng.framework', e.framework); location.hash = 'framework'; modal.close(); } }, '查看「' + e.framework + '」框架') : null]));
  }

  function goCorrect(e) {
    var pre = { topic: e.title + '（' + e.year + ' ' + e.exam + '）', type: e.type, text: e.prompt };
    if (e.image) pre.image = e.image;
    sessionStorage.setItem('kyeng.prefillTopic', JSON.stringify(pre));
    location.hash = 'correct';
  }

  App.pages.library = function (root) {
    var essays = Store.getEssays().slice().sort(function (a, b) { return b.year - a.year; });

    root.appendChild(el('div', { class: 'page-head' },
      [el('h2', { text: '真题库' }), el('div', { class: 'sub', text: '历年考研英语（英语一 / 英语二）作文题目、范文与要点拆解。范文为本站撰写，题目请以官方真题为准。' })]));

    var types = uniq(essays.map(function (e) { return e.type; }));
    var years = uniq(essays.map(function (e) { return String(e.year); })).sort(function (a, b) { return b - a; });

    var bar = el('div', { class: 'filterbar' });
    var examSel = el('select', { class: 'select', id: 'f-exam' }, ['全部', '英语一', '英语二'].map(function (x) { return el('option', { value: x === '全部' ? '' : x, text: x }); }));
    var partSel = el('select', { class: 'select', id: 'f-part' }, ['全部', '大作文', '小作文'].map(function (x) { return el('option', { value: x === '全部' ? '' : x, text: x }); }));
    var typeSel = el('select', { class: 'select', id: 'f-type' }, ['全部题型'].concat(types).map(function (x) { return el('option', { value: x === '全部题型' ? '' : x, text: x }); }));
    var yearSel = el('select', { class: 'select', id: 'f-year' }, ['全部年份'].concat(years).map(function (x) { return el('option', { value: x === '全部年份' ? '' : x, text: x }); }));
    var search = el('input', { class: 'input grow', id: 'f-search', placeholder: '搜索题目/话题/要点关键词…' });
    [examSel, partSel, typeSel, yearSel, search].forEach(function (n) { n.addEventListener('input', renderList); n.addEventListener('change', renderList); });
    bar.appendChild(examSel); bar.appendChild(partSel); bar.appendChild(typeSel); bar.appendChild(yearSel); bar.appendChild(search);
    root.appendChild(bar);

    var listBox = el('div', { id: 'lib-list' });
    root.appendChild(listBox);

    function renderList() {
      var q = search.value.trim().toLowerCase();
      var list = essays.filter(function (e) {
        if (examSel.value && e.exam !== examSel.value) return false;
        if (partSel.value && e.part !== partSel.value) return false;
        if (typeSel.value && e.type !== typeSel.value) return false;
        if (yearSel.value && String(e.year) !== yearSel.value) return false;
        if (q) {
          var hay = [e.title, e.prompt, e.type, e.exam, e.part, (e.topicTags || []).join(' '), JSON.stringify(e.keyPoints || {})].join(' ').toLowerCase();
          if (hay.indexOf(q) < 0) return false;
        }
        return true;
      });
      listBox.innerHTML = '';
      if (!list.length) { listBox.appendChild(el('div', { class: 'empty', text: '没有符合条件的题目' })); return; }
      list.forEach(function (e) {
        var item = el('div', { class: 'list-item', onclick: function () { openEssay(e); } },
          [el('div', { class: 'li-main' },
            [el('div', { class: 'flex' }, [el('span', { class: 'badge', text: e.year + ' ' + e.exam }), el('span', { class: 'badge cyan', text: e.type }), el('span', { class: 'badge gray', text: e.part })]),
              el('div', { class: 'li-title', style: 'margin-top:6px;', text: e.title }),
              el('div', { class: 'li-sub', text: (e.topicTags || []).join(' · ') })]),
            el('div', { style: 'font-size:20px;color:#c2c9d6;', text: '›' })]);
        listBox.appendChild(item);
      });
    }

    renderList();

    // 从出题页/其它入口带过来的"查看范文"
    var openId = sessionStorage.getItem('kyeng.openEssay');
    if (openId) {
      sessionStorage.removeItem('kyeng.openEssay');
      var target = Store.getEssayById(openId);
      if (target) openEssay(target);
    }
  };
})();
