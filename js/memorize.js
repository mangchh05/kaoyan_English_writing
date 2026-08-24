/* ============================================================
   memorize.js — 范文背诵 + 好词好句
   ============================================================ */
(function () {
  'use strict';
  var el = window.UI.el, toast = window.UI.toast;

  var STOP = { a:1,an:1,the:1,and:1,or:1,but:1,of:1,in:1,on:1,at:1,to:1,for:1,with:1,by:1,is:1,are:1,was:1,were:1,be:1,been:1,being:1,it:1,its:1,this:1,that:1,these:1,those:1,as:1,we:1,you:1,he:1,she:1,they:1,i:1,my:1,your:1,his:1,her:1,our:1,their:1,not:1,no:1,so:1,can:1,could:1,will:1,would:1,should:1,may:1,might:1,must:1,do:1,does:1,did:1,have:1,has:1,had:1,from:1,up:1,down:1,out:1,if:1,than:1,then:1,what:1,which:1,who:1,when:1,where:1,why:1,how:1,there:1,more:1,most:1,only:1,into:1,about:1,such:1,than:1,also:1,very:1,just:1 };

  var curEssay = null, curMode = 'full', paragraphShown = 0;

  App.pages.memorize = function (root) {
    var essays = Store.getEssays();
    var prog = Store.getProgress();

    root.appendChild(el('div', { class: 'page-head' },
      [el('h2', { text: '🧠 范文背诵 & 好词好句' }), el('div', { class: 'sub', text: '渐进式背诵范文，按话题积累好词好句，背诵进度与收藏保存在本地。' })]));

    var tabs = el('div', { class: 'tabs' });
    var tabEssay = el('div', { class: 'tab active', text: '📖 范文背诵' });
    var tabPhrase = el('div', { class: 'tab', text: '✨ 好词好句' });
    tabs.appendChild(tabEssay); tabs.appendChild(tabPhrase);
    root.appendChild(tabs);

    var essayPane = el('div', { id: 'mem-essay' });
    var phrasePane = el('div', { id: 'mem-phrase', style: 'display:none;' });
    root.appendChild(essayPane); root.appendChild(phrasePane);

    tabEssay.onclick = function () { tabEssay.classList.add('active'); tabPhrase.classList.remove('active'); essayPane.style.display = ''; phrasePane.style.display = 'none'; };
    tabPhrase.onclick = function () { tabPhrase.classList.add('active'); tabEssay.classList.remove('active'); essayPane.style.display = 'none'; phrasePane.style.display = ''; renderPhrases(); };

    /* ---------- 范文背诵 ---------- */
    var sel = el('select', { class: 'select', id: 'mem-sel' });
    var groups = {};
    essays.forEach(function (e) { (groups[e.exam] = groups[e.exam] || []).push(e); });
    ['英语一', '英语二', '英语一/英语二'].forEach(function (g) {
      if (!groups[g] || !groups[g].length) return;
      var og = el('optgroup', { label: g });
      groups[g].slice().sort(function (a, b) { return b.year - a.year; }).forEach(function (e) {
        og.appendChild(el('option', { value: e.id, text: e.year + ' · ' + e.part + ' · ' + e.title }));
      });
      sel.appendChild(og);
    });
    sel.addEventListener('change', function () { curEssay = Store.getEssayById(sel.value); paragraphShown = 0; renderRecite(); });
    essayPane.appendChild(sel);

    var toolbar = el('div', { class: 'recite-toolbar' });
    [['full', '完整'], ['cloze', '挖空背诵'], ['sentence', '遮挡句子'], ['paragraph', '逐段显示']].forEach(function (m) {
      toolbar.appendChild(el('button', { class: 'btn ' + (curMode === m[0] ? 'btn-primary' : 'btn-outline') + ' btn-sm', 'data-mode': m[0], text: m[1], onclick: function () { curMode = m[0]; paragraphShown = 0; renderRecite(); } }));
    });
    var checkinBtn = el('button', { class: 'btn btn-sm', id: 'checkin-btn', onclick: toggleMemorized }, '✅ 打卡');
    toolbar.appendChild(checkinBtn);
    essayPane.appendChild(toolbar);

    var reciteBox = el('div', { id: 'recite-box', class: 'card' });
    essayPane.appendChild(reciteBox);

    function toggleMemorized() {
      if (!curEssay) { toast('请先选择一篇范文'); return; }
      var p = Store.getProgress();
      p.memorized = p.memorized || [];
      var idx = p.memorized.indexOf(curEssay.id);
      if (idx >= 0) { p.memorized.splice(idx, 1); toast('已取消打卡'); }
      else { p.memorized.push(curEssay.id); toast('🎉 打卡成功！已记录'); }
      Store.setProgress(p);
      updateCheckin();
    }
    function updateCheckin() {
      var p = Store.getProgress();
      var done = curEssay && (p.memorized || []).indexOf(curEssay.id) >= 0;
      checkinBtn.textContent = done ? '✅ 已背诵' : '⬜ 打卡';
      checkinBtn.className = 'btn btn-sm ' + (done ? 'btn-primary' : 'btn-outline');
    }

    function renderRecite() {
      reciteBox.innerHTML = '';
      if (!curEssay) { reciteBox.appendChild(el('div', { class: 'empty', text: '请选择一篇范文开始背诵' })); return; }
      reciteBox.appendChild(el('div', { class: 'flex mb' },
        [el('span', { class: 'badge', text: curEssay.year + ' ' + curEssay.exam }), el('span', { class: 'badge cyan', text: curEssay.type }),
          el('span', { class: 'badge gray', text: '约 ' + curEssay.modelEssay.split(/\s+/).length + ' 词' })]));
      var textBox = el('div', { class: 'recite-text' });
      if (curMode === 'full') textBox.appendChild(el('div', { class: 'essay-text', style: 'font-size:17px;', text: curEssay.modelEssay }));
      else if (curMode === 'cloze') textBox.appendChild(renderCloze(curEssay.modelEssay));
      else if (curMode === 'sentence') textBox.appendChild(renderSentence(curEssay.modelEssay));
      else textBox.appendChild(renderParagraph(curEssay.modelEssay));
      reciteBox.appendChild(textBox);
      if (curMode !== 'full') {
        reciteBox.appendChild(el('div', { class: 'hint', text: '点击被遮挡/挖空的词句可逐处显示答案。' }));
      }
      updateCheckin();
    }

    function renderCloze(text) {
      var wrap = el('div', {});
      var words = text.split(/(\s+)/);
      var ci = 0;
      words.forEach(function (tok) {
        if (tok === '' || /^\s+$/.test(tok)) { wrap.appendChild(document.createTextNode(tok)); return; }
        var m = tok.match(/^([A-Za-z'’-]+)(.*)$/);
        var w = m ? m[1] : tok, trail = m ? m[2] : '';
        if (w.length >= 4 && !STOP[w.toLowerCase()] && ci % 3 === 0) {
          var hint = w[0] + '_'.repeat(Math.max(w.length - 1, 2));
          var span = el('span', { class: 'cloze-word', text: hint + trail });
          span.addEventListener('click', function () {
            if (!span.classList.contains('revealed')) { span.textContent = w + trail; span.classList.add('revealed'); }
          });
          wrap.appendChild(span); ci++;
        } else { wrap.appendChild(document.createTextNode(tok)); ci++; }
      });
      return wrap;
    }

    function renderSentence(text) {
      var wrap = el('div', {});
      var frags = text.match(/[^.!?]+[.!?]*/g) || [text];
      frags.forEach(function (f) {
        if (!f.trim()) return;
        var span = el('span', { class: 'hidden-block', text: f });
        span.addEventListener('click', function () {
          if (!span.classList.contains('revealed')) { span.classList.add('revealed'); }
        });
        wrap.appendChild(span);
        wrap.appendChild(document.createTextNode(' '));
      });
      return wrap;
    }

    function renderParagraph(text) {
      var paras = text.split(/\n\s*\n/);
      var wrap = el('div', {});
      var shown = Math.min(paragraphShown + 1, paras.length);
      for (var i = 0; i < shown; i++) {
        wrap.appendChild(el('div', { class: 'essay-text', style: 'margin-top:8px;font-size:17px;', text: paras[i] }));
      }
      if (shown < paras.length) {
        wrap.appendChild(el('button', { class: 'btn btn-primary btn-sm mt', onclick: function () { paragraphShown++; renderRecite(); } }, '显示下一段（' + (shown + 1) + '/' + paras.length + '）'));
      } else {
        wrap.appendChild(el('div', { class: 'hint mt', text: '已显示全部段落，可切换到「挖空背诵」检测记忆。' }));
      }
      return wrap;
    }

    /* ---------- 好词好句 ---------- */
    function renderPhrases() {
      phrasePane.innerHTML = '';
      var phrases = Store.getPhrases();
      var cats = ['全部'].concat(uniq(phrases.map(function (p) { return p.category; })));
      var bar = el('div', { class: 'filterbar' });
      var catSel = el('select', { class: 'select', id: 'ph-cat' }, cats.map(function (c) { return el('option', { value: c === '全部' ? '' : c, text: c }); }));
      var search = el('input', { class: 'input grow', id: 'ph-search', placeholder: '搜索单词/短语/译文…' });
      var favOnly = el('label', { class: 'small', style: 'display:flex;align-items:center;gap:4px;' }, [el('input', { type: 'checkbox', id: 'ph-fav' }), '只看收藏']);
      [catSel, search, favOnly].forEach(function (n) { n.addEventListener('input', doFilter); n.addEventListener('change', doFilter); });
      bar.appendChild(catSel); bar.appendChild(search); bar.appendChild(favOnly);
      phrasePane.appendChild(bar);
      var box = el('div', { id: 'ph-list' });
      phrasePane.appendChild(box);

      function doFilter() {
        var p = Store.getProgress(); p.favorites = p.favorites || [];
        var q = search.value.trim().toLowerCase();
        var list = phrases.filter(function (ph) {
          if (catSel.value && ph.category !== catSel.value) return false;
          if (favOnly.querySelector('input').checked && p.favorites.indexOf(ph.id) < 0) return false;
          if (q && (ph.text + ' ' + ph.translation + ' ' + ph.usage).toLowerCase().indexOf(q) < 0) return false;
          return true;
        });
        box.innerHTML = '';
        if (!list.length) { box.appendChild(el('div', { class: 'empty', text: '没有符合条件的词句' })); return; }
        list.forEach(function (ph) {
          var fav = p.favorites.indexOf(ph.id) >= 0;
          var item = el('div', { class: 'card tight', style: 'margin-bottom:10px;' });
          var head = el('div', { class: 'flex-between' },
            [el('div', { class: 'flex' }, [el('span', { class: 'badge gray', text: ph.category }), (ph.tags || []).map(function (t) { return el('span', { class: 'tag', text: t }); })]),
              el('button', { class: 'btn btn-ghost btn-sm', text: fav ? '★ 已收藏' : '☆ 收藏', onclick: function () {
                var pp = Store.getProgress(); pp.favorites = pp.favorites || [];
                var i = pp.favorites.indexOf(ph.id);
                if (i >= 0) { pp.favorites.splice(i, 1); toast('已取消收藏'); } else { pp.favorites.push(ph.id); toast('已收藏'); }
                Store.setProgress(pp); doFilter();
              } })]);
          item.appendChild(head);
          item.appendChild(el('div', { style: 'font-size:16px;font-weight:600;margin:6px 0 2px;', text: ph.text }));
          item.appendChild(el('div', { class: 'muted', text: ph.translation }));
          item.appendChild(el('div', { class: 'small', style: 'color:#2f54eb;margin-top:4px;', text: '用法：' + ph.usage }));
          box.appendChild(item);
        });
      }
      doFilter();
    }

    function uniq(arr) { var m = {}; arr.forEach(function (x) { m[x] = 1; }); return Object.keys(m); }

    // 初始选择
    var pre = sessionStorage.getItem('kyeng.memorizeEssay');
    if (pre) { sessionStorage.removeItem('kyeng.memorizeEssay'); if (Store.getEssayById(pre)) sel.value = pre; }
    curEssay = Store.getEssayById(sel.value) || essays[0] || null;
    if (curEssay) sel.value = curEssay.id;
    renderRecite();
  };
})();
