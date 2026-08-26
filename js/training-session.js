/* ============================================================
   training-session.js — 今日训练 Training Session 状态机
   会话独立存储，兼容已有 localStorage 的 progress/history 数据。
   ============================================================ */
(function () {
  'use strict';

  var STEPS = ['reading', 'planning', 'writing', 'correcting', 'rewriting', 'completed'];
  var TRANSITIONS = {
    reading: 'planning',
    planning: 'writing',
    writing: 'correcting',
    correcting: 'rewriting',
    rewriting: 'completed'
  };

  function makeId() {
    return 'session-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function normalizeCorrectionResult(result) {
    if (result == null || result === '') return null;
    return window.CorrectionSchema ? window.CorrectionSchema.parse(result) : result;
  }

  function normalizeInput(input) {
    input = input || {};
    return {
      id: input.id || input.sessionId || makeId(),
      sessionId: input.sessionId || input.id || makeId(),
      examType: input.examType || '英语一',
      questionId: input.questionId || '',
      questionSource: input.questionSource || 'real',
      questionType: input.questionType || '',
      startedAt: input.startedAt || new Date().toISOString(),
      updatedAt: input.updatedAt || input.startedAt || new Date().toISOString(),
      currentStep: input.currentStep || 'reading',
      outline: input.outline || '',
      draft: input.draft || '',
      correctionResult: normalizeCorrectionResult(input.correctionResult),
      rewrite: input.rewrite || '',
      scoreBefore: input.scoreBefore == null ? null : input.scoreBefore,
      scoreAfter: input.scoreAfter == null ? null : input.scoreAfter,
      completedAt: input.completedAt || null
    };
  }

  function getCurrent() {
    var session = Store.getTrainingSession();
    if (!session || (!session.sessionId && !session.id)) return null;
    var normalized = normalizeInput(session);
    if (JSON.stringify(session) !== JSON.stringify(normalized)) Store.setTrainingSession(normalized);
    return normalized;
  }

  function start(input) {
    var session = normalizeInput(input);
    session.id = session.sessionId;
    session.updatedAt = new Date().toISOString();
    Store.setTrainingSession(session);
    var activity = Store.recordLearningActivity('start_training');
    if (activity.checkedIn && window.UI) window.UI.toast('Day ' + activity.day + ' ✓ 今天也完成了一次学习。');
    return session;
  }

  function update(changes) {
    var current = getCurrent();
    if (!current) return null;
    Object.keys(changes || {}).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(current, key)) current[key] = changes[key];
    });
    current.updatedAt = new Date().toISOString();
    Store.setTrainingSession(current);
    return current;
  }

  function transition(nextStep, changes) {
    var current = getCurrent();
    if (!current || STEPS.indexOf(nextStep) < 0) return null;
    if (nextStep !== current.currentStep && TRANSITIONS[current.currentStep] !== nextStep) return null;
    var patch = changes || {};
    patch.currentStep = nextStep;
    if (nextStep === 'completed') patch.completedAt = new Date().toISOString();
    return update(patch);
  }

  function advance(changes) {
    var current = getCurrent();
    if (!current || !TRANSITIONS[current.currentStep]) return current;
    return transition(TRANSITIONS[current.currentStep], changes);
  }

  function getQuestion(session) {
    session = session || getCurrent();
    if (!session || !session.questionId) return null;
    if (session.questionSource === 'simulation') {
      return (window.APP_DATA_SIMULATIONS_SOURCE || []).filter(function (q) { return q.id === session.questionId; })[0] || null;
    }
    return Store.getEssayById(session.questionId);
  }

  function toPrefill(session) {
    var q = getQuestion(session);
    if (!q) return null;
    var pre = {
      id: q.id,
      topic: q.title || q.topic || '',
      type: q.type || '',
      text: q.prompt || q.text || ''
    };
    if (q.image) pre.image = q.image;
    return pre;
  }

  function startForQuestion(question, source) {
    if (!question) return null;
    var session = start({
      examType: question.exam || '英语一',
      questionId: question.id,
      questionSource: source || 'real',
      questionType: question.type || '',
      currentStep: 'reading'
    });
    Store.setPreferences({ examType: question.exam || '英语一', part: question.part || '大作文' });
    return session;
  }

  function stepIndex(step) { return Math.max(0, STEPS.indexOf(step)); }

  window.TrainingSession = {
    STEPS: STEPS,
    getCurrent: getCurrent,
    start: start,
    startForQuestion: startForQuestion,
    update: update,
    transition: transition,
    advance: advance,
    getQuestion: getQuestion,
    toPrefill: toPrefill,
    stepIndex: stepIndex,
    clone: clone
  };
})();
