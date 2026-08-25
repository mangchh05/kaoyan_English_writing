/* ============================================================
   framework.js — 作文框架库
   ============================================================ */
(function () {
  'use strict';
  var el = window.UI.el, toast = window.UI.toast;

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { toast('已复制'); }, function () { fb(t); });
    else fb(t);
  }
  function fb(t) {
    var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('已复制'); } catch (e) { toast('复制失败'); }
    document.body.removeChild(ta);
  }

  App.pages.framework = function (root) {
    var fws = Store.getFrameworks();
    var pre = sessionStorage.getItem('kyeng.framework');
    if (pre) sessionStorage.removeItem('kyeng.framework');

    root.appendChild(el('div', { class: 'page-head' },
      [el('h2', { text: '作文框架库' }), el('div', { class: 'sub', text: '各题型的段落框架与万能句型，覆盖图画作文、图表作文、议论文及各类小作文。' })]));

    var typeSel = el('select', { class: 'select', id: 'fw-type', style: 'max-width:260px;margin-bottom:16px;' },
      ['全部框架'].concat(fws.map(function (f) { return f.type; })).map(function (t) { return el('option', { value: t === '全部框架' ? '' : t, text: t }); }));
    typeSel.addEventListener('change', render);
    root.appendChild(typeSel);

    var box = el('div', { id: 'fw-box' });
    root.appendChild(box);

    function render() {
      box.innerHTML = '';
      var list = fws.filter(function (f) { return !typeSel.value || f.type === typeSel.value; });
      list.forEach(function (fw) {
        var card = el('div', { class: 'card', id: 'fw-' + fw.id });
        if (pre === fw.type) card.style.borderColor = '#2f54eb';
        var head = el('div', { class: 'flex-between' },
          [el('div', { class: 'flex' },
            [el('span', { class: 'badge', text: fw.type }), el('span', { class: 'badge cyan', text: fw.exam }), el('span', { class: 'badge gray', text: fw.wordTarget })]),
            el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { copyText(JSON.stringify(fw, null, 2)); } }, '复制全文')]);
        card.appendChild(head);
        card.appendChild(el('p', { class: 'small muted', style: 'margin:8px 0 14px;', text: fw.description }));
        (fw.parts || []).forEach(function (p) {
          var block = el('div', { class: 'kp-block' });
          block.appendChild(el('h4', { text: p.title + ' · ' + p.role }));
          block.appendChild(el('div', { class: 'small', style: 'font-family:var(--mono);background:#fff;border:1px solid var(--border);border-radius:6px;padding:8px 10px;margin-bottom:8px;', text: p.template }));
          (p.sentences || []).forEach(function (s) {
            var row = el('div', { class: 'flex-between', style: 'padding:4px 0;border-bottom:1px dashed var(--border);' },
              [el('span', { text: s, style: 'font-family:Georgia,serif;' }), el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { copyText(s); } }, '复制')]);
            block.appendChild(row);
          });
          card.appendChild(block);
        });
        box.appendChild(card);
      });
      if (pre) {
        var fwMatch = fws.filter(function (f) { return f.type === pre; })[0];
        if (fwMatch) {
          setTimeout(function () {
            var target = document.getElementById('fw-' + fwMatch.id);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        }
      }
    }
    render();
  };
})();
