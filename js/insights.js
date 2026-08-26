/* insights.js — 基于结构化批改结果的真实能力画像 */
(function () {
  'use strict';
  var el = window.UI.el;
  var DIMENSIONS = [
    ['task', '任务完成度', '是否切题、是否完成题目要求'],
    ['content', '内容与观点', '信息完整度与观点回应'],
    ['structure', '结构组织', '段落推进与逻辑关系'],
    ['grammar', '语法准确', '时态、单复数与句法'],
    ['vocabulary', '词汇运用', '词汇准确度与丰富度'],
    ['sentenceVariety', '句式多样', '复合句与表达变化'],
    ['coherence', '连贯衔接', '连接词与语篇流畅度'],
    ['ideaDevelopment', '观点展开', '解释、论证与例证深度']
  ];

  function number(value) { var n = Number(value); return isFinite(n) ? n : null; }
  function resultOf(record) {
    var result = record && record.structuredResult;
    if (!result && record && record.result && typeof record.result === 'object') result = record.result;
    return result && number(result.totalScore) != null ? result : null;
  }
  function normalizedDimension(result, key) {
    if (!result || !result.dimensions) return null;
    var value = result.dimensions[key];
    if (value && typeof value === 'object') value = value.score;
    value = number(value);
    return value == null ? null : Math.max(0, Math.min(100, value <= 5 ? value / 5 * 100 : value));
  }
  function average(records, key) {
    var values = records.map(function (record) { return normalizedDimension(resultOf(record), key); }).filter(function (value) { return value != null; });
    return values.length ? Math.round(values.reduce(function (sum, value) { return sum + value; }, 0) / values.length) : null;
  }
  function scoreAverage(records) {
    var values = records.map(function (record) { return number(resultOf(record).totalScore); }).filter(function (value) { return value != null; });
    return values.length ? Math.round(values.reduce(function (sum, value) { return sum + value; }, 0) / values.length * 10) / 10 : null;
  }
  function getWritingProfile() {
    var scored = Store.getHistory().filter(function (record) { return !!resultOf(record); });
    var recent = scored.slice(0, 5), previous = scored.slice(5, 10), dimensions = {};
    DIMENSIONS.forEach(function (item) {
      var current = average(recent, item[0]), before = average(previous, item[0]);
      dimensions[item[0]] = { key: item[0], label: item[1], description: item[2], current: current, previous: before, delta: current != null && before != null ? current - before : null };
    });
    return { scoredCount: scored.length, recentCount: recent.length, averageScore: scoreAverage(recent), previousAverageScore: scoreAverage(previous), dimensions: dimensions, recentRecords: recent };
  }
  function weakDimension(profile) {
    var list = DIMENSIONS.map(function (item) { return profile.dimensions[item[0]]; }).filter(function (item) { return item.current != null; });
    return list.sort(function (a, b) { return a.current - b.current; })[0] || null;
  }

  App.getWritingProfile = getWritingProfile;
  App.getWeakDimension = function () { return weakDimension(getWritingProfile()); };

  App.pages.insights = function (root) {
    var profile = getWritingProfile(), weak = weakDimension(profile);
    var scoreText = profile.averageScore == null ? '—' : profile.averageScore + ' 分';
    var change = profile.averageScore != null && profile.previousAverageScore != null ? profile.averageScore - profile.previousAverageScore : null;
    root.appendChild(el('div', { class: 'page-head' }, [el('div', { class: 'eyebrow', text: 'WRITING PROFILE · 真实评分画像' }), el('h2', { text: '我的写作能力' }), el('div', { class: 'sub', text: '能力数据只来自结构化 AI 批改结果，不再根据训练次数推算。' })]));
    root.appendChild(el('div', { class: 'insight-summary card' }, [
      el('div', { class: 'insight-score' }, [el('span', { text: '最近 5 次平均' }), el('strong', { text: scoreText }), el('small', { text: change == null ? '完成更多结构化批改后显示变化' : (change > 0 ? '+' : '') + change.toFixed(1) + ' · 较前 5 次' })]),
      el('div', { class: 'insight-copy' }, [el('h3', { text: weak ? '下一步优先补齐：' + weak.label : '先完成一次结构化批改' }), el('p', { text: weak ? '最近 ' + profile.recentCount + ' 篇有评分记录中，这一项平均表现最低，将用于今日训练推荐。' : '旧批改历史仍然保留，但没有结构化分数时不会被虚构为能力数据。' }), el('button', { class: 'btn btn-primary', onclick: function () { location.hash = 'today'; } }, '开始针对性训练')])
    ]));
    var grid = el('div', { class: 'grid grid-2 insight-grid' });
    DIMENSIONS.forEach(function (item) {
      var d = profile.dimensions[item[0]], current = d.current == null ? '—' : d.current, delta = d.delta == null ? '' : ' ' + (d.delta > 0 ? '↑ +' : d.delta < 0 ? '↓ ' : '→ ') + Math.abs(d.delta);
      var bar = el('div', { class: 'insight-bar' });
      bar.appendChild(el('div', { class: 'flex-between' }, [el('strong', { text: d.label }), el('span', { text: current + ' / 100' + delta })]));
      bar.appendChild(el('div', { class: 'progress-track' }, [el('i', { style: 'width:' + (d.current || 0) + '%' })]));
      bar.appendChild(el('small', { text: d.description + (d.previous == null ? '' : ' · 前阶段 ' + d.previous) }));
      var card = el('div', { class: 'card' }); card.appendChild(bar); grid.appendChild(card);
    });
    root.appendChild(grid);
    root.appendChild(el('div', { class: 'card weak-focus' }, [el('div', { class: 'eyebrow', text: 'NEXT FOCUS' }), el('h3', { text: weak ? '本次推荐重点：' + weak.label : '完成第一次结构化批改后生成重点' }), el('p', { class: 'muted', text: weak ? '系统会优先推荐适合训练该能力的题目。' : '当前没有足够的真实评分数据，暂时不会虚构能力分数。' })]));
  };
})();
