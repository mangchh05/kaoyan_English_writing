/* recommendation.js — 基于真实能力数据的轻量今日推荐 */
(function () {
  'use strict';

  var FOCUS_RULES = {
    '观点展开': function (q) { return q.part === '大作文'; },
    '内容与观点': function (q) { return q.part === '大作文'; },
    '结构组织': function (q) { return q.part === '大作文'; },
    '任务完成度': function (q) { return q.part === '小作文'; },
    '语法准确': function () { return true; },
    '词汇运用': function () { return true; },
    '句式多样': function (q) { return q.part === '大作文'; },
    '连贯衔接': function (q) { return q.part === '大作文'; }
  };

  function dayNumber() {
    var key = DateUtils.localDateKey(), parts = key.split('-');
    return Math.floor(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) / 86400000);
  }
  function allQuestions() {
    var real = Store.getEssays().map(function (q) { return { question: q, source: 'real' }; });
    var simulation = (window.APP_DATA_SIMULATIONS_SOURCE || []).map(function (q) { return { question: q, source: 'simulation' }; });
    return real.concat(simulation);
  }
  function getToday(offset) {
    var prefs = Store.getPreferences(), profile = App.getWritingProfile ? App.getWritingProfile() : null;
    var weak = App.getWeakDimension ? App.getWeakDimension() : null;
    var focus = weak ? weak.label : '观点展开';
    var pool = allQuestions().filter(function (item) { return item.question.exam === prefs.examType; });
    if (!pool.length) pool = allQuestions();
    var rule = FOCUS_RULES[focus];
    var focused = rule ? pool.filter(function (item) { return rule(item.question); }) : pool;
    if (focused.length) pool = focused;
    var current = TrainingSession.getCurrent();
    pool = pool.filter(function (item) { return !current || item.question.id !== current.questionId || item.source !== current.questionSource; });
    if (!pool.length) pool = allQuestions();
    var index = Math.abs(dayNumber() + (offset || 0)) % pool.length;
    var picked = pool[index], q = picked.question;
    var reason = weak ? '最近评分记录中，“' + weak.label + '”是平均表现最低的维度。' : '你还没有足够的结构化评分记录，先用一篇大作文建立能力基线。';
    return { question: q, questionId: q.id, questionSource: picked.source, examType: q.exam, questionType: q.type || '', focus: focus, reason: reason, estimatedMinutes: q.part === '小作文' ? 15 : 25, profile: profile };
  }
  function start(recommendation) {
    if (!recommendation || !recommendation.question) return null;
    return TrainingSession.startForQuestion(recommendation.question, recommendation.questionSource);
  }
  window.Recommendation = { getToday: getToday, start: start };
})();
