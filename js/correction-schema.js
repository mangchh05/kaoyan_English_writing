/* correction-schema.js — AI 批改结果的结构化协议 */
(function () {
  'use strict';

  var DIMENSIONS = ['task', 'content', 'structure', 'grammar', 'vocabulary', 'sentenceVariety', 'coherence', 'ideaDevelopment'];

  function finite(value) {
    var number = Number(value);
    return isFinite(number) ? number : null;
  }

  function array(value) { return Array.isArray(value) ? value : []; }

  function empty(rawText) {
    return { totalScore: null, maxScore: null, dimensions: {}, issues: [], strengths: [], summary: '', rawText: rawText || '' };
  }

  function normalize(value, rawText) {
    if (!value || typeof value !== 'object') return empty(rawText);
    var result = empty(rawText);
    result.totalScore = finite(value.totalScore);
    result.maxScore = finite(value.maxScore);
    result.summary = typeof value.summary === 'string' ? value.summary : '';
    result.issues = array(value.issues);
    result.strengths = array(value.strengths);
    var source = value.dimensions && typeof value.dimensions === 'object' ? value.dimensions : {};
    DIMENSIONS.forEach(function (key) {
      var direct = source[key];
      if (direct && typeof direct === 'object') direct = direct.score;
      var score = finite(direct);
      if (score != null) result.dimensions[key] = score;
    });
    return result;
  }

  function parse(rawText) {
    if (rawText && typeof rawText === 'object') return normalize(rawText, '');
    var text = String(rawText || '').trim();
    if (!text) return empty('');
    var start = text.indexOf('{'), end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return normalize(JSON.parse(text.slice(start, end + 1)), text); } catch (e) { /* 保留原文，等待用户重试 */ }
    }
    return empty(text);
  }

  window.CorrectionSchema = { DIMENSIONS: DIMENSIONS, empty: empty, normalize: normalize, parse: parse };
})();
