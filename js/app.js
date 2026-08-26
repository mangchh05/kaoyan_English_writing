/* ============================================================
   app.js — 路由、布局、导航、通用 UI 工具
   ============================================================ */
(function () {
  'use strict';

  var ROUTES = [
    { hash: 'home', title: '主页', svg: 'M3 10.5 12 3l9 7.5V21h-5v-6h-8v6H3z' },
    { hash: 'library', title: '真题库', svg: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5' },
    { hash: 'simulations', title: '模拟出题', svg: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5' },
    { hash: 'correct', title: 'AI 批改', svg: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
    { hash: 'memorize', title: '范文背诵', svg: 'M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10zM12 18a6 6 0 1 0-6-6 6 6 0 0 0 6 6zM12 14a2 2 0 1 0-2-2 2 2 0 0 0 2 2z' },
    { hash: 'framework', title: '作文框架', svg: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { hash: 'guide', title: '写作指南', svg: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { hash: 'admin', title: '数据管理', svg: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6' }
  ];

  /* ---------- SVG 线性图标 ---------- */
  function iconSvg(d) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '17');
    svg.setAttribute('height', '17');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
    return svg;
  }

  /* ---------- 通用 DOM 工具 ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'value') node.value = v;
        else if (k === 'checked') node.checked = !!v;
        else if (k === 'disabled') node.disabled = !!v;
        else if (k === 'placeholder') node.placeholder = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v);
      });
    }
    if (children != null) {
      var arr = Array.isArray(children) ? children : [children];
      // 递归展平嵌套数组，让 map() 等返回的数组也能直接作为子节点
      (function flatten(list) {
        for (var i = 0; i < list.length; i++) {
          var c = list[i];
          if (c == null) continue;
          if (Array.isArray(c)) { flatten(c); continue; }
          node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
        }
      })(arr);
    }
    return node;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(msg, ms) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, ms || 2200);
  }

  function inlineMd(s) {
    s = escapeHtml(s);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    return s;
  }

  function renderMarkdown(md) {
    if (!md) return '';
    var lines = String(md).replace(/\r\n/g, '\n').split('\n');
    var html = '', inCode = false, codeBuf = [], inList = false, listType = null;
    function closeList() {
      if (inList) { html += (listType === 'ol' ? '</ol>' : '</ul>'); inList = false; listType = null; }
    }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (/^\s*```/.test(line)) {
        if (inCode) { html += '<pre><code>' + escapeHtml(codeBuf.join('\n')) + '</code></pre>'; codeBuf = []; inCode = false; }
        else { closeList(); inCode = true; }
        continue;
      }
      if (inCode) { codeBuf.push(line); continue; }
      var h = line.match(/^(#{1,4})\s+(.*)/);
      if (h) { closeList(); html += '<h' + h[1].length + '>' + inlineMd(h[2]) + '</h' + h[1].length + '>'; continue; }
      var ul = line.match(/^\s*[-*]\s+(.*)/);
      if (ul) { if (!inList || listType !== 'ul') { closeList(); html += '<ul>'; inList = true; listType = 'ul'; } html += '<li>' + inlineMd(ul[1]) + '</li>'; continue; }
      var ol = line.match(/^\s*\d+[.)]\s+(.*)/);
      if (ol) { if (!inList || listType !== 'ol') { closeList(); html += '<ol>'; inList = true; listType = 'ol'; } html += '<li>' + inlineMd(ol[1]) + '</li>'; continue; }
      if (line.trim() === '') { closeList(); continue; }
      closeList();
      html += '<p>' + inlineMd(line) + '</p>';
    }
    closeList();
    return html;
  }

  function openModal(html, title) {
    var backdrop = el('div', { class: 'modal-backdrop' });
    var modal = el('div', { class: 'modal' });
    if (title) modal.appendChild(el('h3', { text: title }));
    var body = el('div');
    if (typeof html === 'string') body.innerHTML = html; else body.appendChild(html);
    modal.appendChild(body);
    backdrop.appendChild(modal);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) backdrop.remove(); });
    document.body.appendChild(backdrop);
    return { backdrop: backdrop, body: body, close: function () { backdrop.remove(); } };
  }

  /* ---------- 导航 ---------- */
  function renderNav() {
    var nav = document.getElementById('nav');
    var cur = currentRoute();
    nav.innerHTML = '';
    ROUTES.forEach(function (r) {
      var item = el('div', { class: 'nav-item' + (cur === r.hash ? ' active' : ''), onclick: function () { location.hash = r.hash; } },
        [el('span', { class: 'ico' }, iconSvg(r.svg)), el('span', { text: r.title })]);
      nav.appendChild(item);
    });

    // 底部数据统计
    var count = document.getElementById('nav-data-count');
    var essays = Store.getEssays().length, phrases = Store.getPhrases().length;
    count.textContent = '真题范文 ' + essays + ' 篇 · 好词好句 ' + phrases + ' 条';
  }

  function currentRoute() {
    var h = (location.hash || '').replace(/^#/, '');
    return h || 'home';
  }

  function navigate() {
    var r = currentRoute();
    var meta = ROUTES.filter(function (x) { return x.hash === r; })[0];
    document.getElementById('topbar-title').textContent = meta ? meta.title : '未找到';
    renderNav();
    var content = document.getElementById('content');
    content.innerHTML = '';
    var page = document.createElement('div');
    page.className = 'page';
    var fn = window.App.pages[r];
    if (fn) fn(page); else page.appendChild(el('div', { class: 'empty', text: '页面不存在' }));
    content.appendChild(page);
    closeSidebar();
    window.scrollTo(0, 0);
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-veil').classList.remove('show');
  }

  /* ---------- 初始化 ---------- */
  function init() {
    document.getElementById('menu-btn').addEventListener('click', function () {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebar-veil').classList.toggle('show');
    });
    document.getElementById('sidebar-veil').addEventListener('click', closeSidebar);
    window.addEventListener('hashchange', navigate);
    var startedAt = Date.now();
    function saveStay() { var seconds = Math.floor((Date.now() - startedAt) / 1000); if (seconds < 5) return; var p = Store.getProgress(), key = new Date().toISOString().slice(0,10); p.studySeconds = (p.studySeconds || 0) + seconds; p.studyByDate = p.studyByDate || {}; p.studyByDate[key] = (p.studyByDate[key] || 0) + seconds; Store.setProgress(p); startedAt = Date.now(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) saveStay(); else startedAt = Date.now(); });
    window.addEventListener('beforeunload', saveStay);
    if (!location.hash) location.hash = 'home';
    navigate();
  }

  window.UI = { el: el, escapeHtml: escapeHtml, toast: toast, renderMarkdown: renderMarkdown, openModal: openModal };
  window.App = { pages: {}, ROUTES: ROUTES };
  window.App.helpers = { el: el, escapeHtml: escapeHtml };

  // 延迟到所有脚本（各页面模块）加载完毕后再初始化
  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
