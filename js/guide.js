/* ============================================================
   guide.js — 写作指南（评分标准 + 高频错误）
   ============================================================ */
(function () {
  'use strict';
  var el = window.UI.el;

  App.pages.guide = function (root) {
    root.appendChild(el('div', { class: 'page-head' },
      [el('h2', { text: '📋 写作指南' }), el('div', { class: 'sub', text: '考研英语写作评分标准解读 + 高频错误对照纠正。' })]));

    var tabs = el('div', { class: 'tabs' });
    var tabScore = el('div', { class: 'tab active', text: '📊 评分标准' });
    var tabErr = el('div', { class: 'tab', text: '⚠️ 高频错误' });
    tabs.appendChild(tabScore); tabs.appendChild(tabErr);
    root.appendChild(tabs);

    var scorePane = el('div', { id: 'gd-score' });
    var errPane = el('div', { id: 'gd-err', style: 'display:none;' });
    root.appendChild(scorePane); root.appendChild(errPane);

    tabScore.onclick = function () { tabScore.classList.add('active'); tabErr.classList.remove('active'); scorePane.style.display = ''; errPane.style.display = 'none'; };
    tabErr.onclick = function () { tabErr.classList.add('active'); tabScore.classList.remove('active'); scorePane.style.display = 'none'; errPane.style.display = ''; };

    /* ---- 评分标准 ---- */
    var scoring = Store.getScoring();
    var examSel = el('select', { class: 'select', style: 'max-width:260px;margin-bottom:14px;' },
      ['全部', '英语一', '英语二', '英语一 / 英语二'].map(function (x) { return el('option', { value: x === '全部' ? '' : x, text: x }); }));
    examSel.addEventListener('change', renderScore);
    scorePane.appendChild(examSel);
    var scoreBox = el('div', { id: 'score-box' });
    scorePane.appendChild(scoreBox);

    function renderScore() {
      scoreBox.innerHTML = '';
      var list = scoring.filter(function (s) { return !examSel.value || s.exam === examSel.value; });
      var table = el('table', { class: 'table' });
      table.appendChild(el('thead', {}, el('tr', {}, [el('th', { text: '档次' }), el('th', { text: '分值' }), el('th', { text: '考试/题型' }), el('th', { text: '评分要求' })])));
      var tb = el('tbody');
      list.forEach(function (s) {
        tb.appendChild(el('tr', {}, [
          el('td', {}, el('span', { class: 'badge', text: s.band })),
          el('td', { text: s.range, style: 'white-space:nowrap;font-weight:600;' }),
          el('td', {}, [el('div', { text: s.exam }), el('div', { class: 'small muted', text: s.part })]),
          el('td', { text: s.criteria })
        ]));
      });
      table.appendChild(tb);
      scoreBox.appendChild(table);
      scoreBox.appendChild(el('div', { class: 'hint mt', text: '评分维度：内容完整性 + 语言准确性 + 结构逻辑 + 词汇句式丰富度。阅卷先看是否切题、结构是否清晰，再看语言质量。' }));
    }
    renderScore();

    /* ---- 高频错误 ---- */
    var errors = Store.getErrors();
    var cats = ['全部'].concat(uniq(errors.map(function (e) { return e.category; })));
    var catSel = el('select', { class: 'select', style: 'max-width:260px;margin-bottom:14px;' },
      cats.map(function (c) { return el('option', { value: c === '全部' ? '' : c, text: c }); }));
    catSel.addEventListener('change', renderErr);
    errPane.appendChild(catSel);
    var errBox = el('div', { id: 'err-box' });
    errPane.appendChild(errBox);

    function renderErr() {
      errBox.innerHTML = '';
      var list = errors.filter(function (e) { return !catSel.value || e.category === catSel.value; });
      list.forEach(function (e) {
        var card = el('div', { class: 'card tight', style: 'margin-bottom:12px;' });
        card.appendChild(el('div', { class: 'flex mb' }, [el('span', { class: 'badge red', text: e.category })]));
        card.appendChild(el('div', {}, [el('span', { class: 'small muted', text: '错误：' }), el('span', { text: e.wrong, style: 'color:var(--danger);text-decoration:line-through;font-family:var(--mono);' })]));
        card.appendChild(el('div', {}, [el('span', { class: 'small muted', text: '正确：' }), el('span', { text: e.right, style: 'color:#389e0d;font-family:var(--mono);' })]));
        card.appendChild(el('div', { class: 'small muted', style: 'margin-top:4px;', text: '💡 ' + e.note }));
        errBox.appendChild(card);
      });
    }
    renderErr();

    function uniq(arr) { var m = {}; arr.forEach(function (x) { m[x] = 1; }); return Object.keys(m); }
  };
})();
