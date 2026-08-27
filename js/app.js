/* ============================================================
   app.js — 路由、布局、导航、通用 UI 工具
   ============================================================ */
(function () {
  'use strict';

  // V3 日常导航：保留旧页面模块作为底层能力，入口统一收敛到六个学习目的。
  var ROUTES = [
    { hash: 'home', title: '首页', group: '开始', svg: 'M3 10.5 12 3l9 7.5V21h-5v-6h-8v6H3z' },
    { hash: 'today', title: '今日训练', group: '训练', svg: 'M6 3v3M18 3v3M4 9h16M6 13h4M6 17h7M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z' },
    { hash: 'bank', title: '题库', group: '训练', svg: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5' },
    { hash: 'essays', title: '我的作文', group: '训练', svg: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
    { hash: 'materials', title: '素材库', group: '复习', svg: 'M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z' },
    { hash: 'reports', title: '学习报告', group: '我的进步', svg: 'M4 19V5M4 19h16M8 16v-4M12 16V8M16 16V5' }
  ];
  var ADVANCED_ROUTE = { hash: 'admin', title: '设置 / 高级设置', svg: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3l-.5.2a1.7 1.7 0 0 0-1 1.5v.2h-2.4V20a1.7 1.7 0 0 0-1-1.5l-.5-.2a1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1a1.7 1.7 0 0 0 .3-1.9l-.2-.5a1.7 1.7 0 0 0-1.5-1H7v-2.4h.2a1.7 1.7 0 0 0 1.5-1l.2-.5a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3l.5-.2a1.7 1.7 0 0 0 1-1.5V4h2.4v.2a1.7 1.7 0 0 0 1 1.5l.5.2a1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9l.2.5a1.7 1.7 0 0 0 1.5 1h.2v2.4H21a1.7 1.7 0 0 0-1.5 1l-.1.4z' };

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
    var lastGroup = '';
    ROUTES.forEach(function (r) {
      if (r.group !== lastGroup) { nav.appendChild(el('div', { class: 'nav-section-title', text: r.group })); lastGroup = r.group; }
      var item = el('button', { class: 'nav-item' + (cur === r.hash ? ' active' : ''), type: 'button', 'aria-current': cur === r.hash ? 'page' : 'false', onclick: function () { location.hash = r.hash; } },
        [el('span', { class: 'ico' }, iconSvg(r.svg)), el('span', { text: r.title })]);
      nav.appendChild(item);
    });

    nav.appendChild(el('div', { class: 'nav-advanced-divider', 'aria-hidden': 'true' }));
    nav.appendChild(el('button', { class: 'nav-item nav-item-advanced' + (cur === ADVANCED_ROUTE.hash ? ' active' : ''), type: 'button', 'aria-current': cur === ADVANCED_ROUTE.hash ? 'page' : 'false', onclick: function () { location.hash = ADVANCED_ROUTE.hash; } },
      [el('span', { class: 'ico' }, iconSvg(ADVANCED_ROUTE.svg)), el('span', { text: ADVANCED_ROUTE.title })]));

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
    var aliases = window.App.routeAliases || {};
    if (aliases[r]) { location.hash = aliases[r]; return; }
    var meta = ROUTES.filter(function (x) { return x.hash === r; })[0];
    var hiddenTitles = window.App.routeTitles || {};
    document.getElementById('topbar-title').textContent = meta ? meta.title : (hiddenTitles[r] || '未找到');
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
    window.App.sessionStartedAt = startedAt;
    function liveSeconds() { return Math.max(0, Math.floor((Date.now() - startedAt) / 1000)); }
    window.App.getLiveStudySeconds = liveSeconds;
    function saveStay() { var seconds = liveSeconds(); if (seconds < 5) return; var p = Store.getProgress(), key = DateUtils.localDateKey(); p.studySeconds = (p.studySeconds || 0) + seconds; p.studyByDate = p.studyByDate || {}; p.studyByDate[key] = (p.studyByDate[key] || 0) + seconds; Store.setProgress(p); startedAt = Date.now(); window.App.sessionStartedAt = startedAt; }
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
