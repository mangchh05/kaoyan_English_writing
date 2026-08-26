/* ============================================================
   store.js — 数据合并 + 本地持久化
   基础数据来自 data-*.js（全局 window.APP_DATA_*），
   用户通过"数据管理"的修改/新增存到 localStorage 覆盖层，
   加载时合并，实现"改不丢、可导出"。
   ============================================================ */
(function () {
  'use strict';

  var NS = 'kyeng.';
  var KEYS = {
    overrides: NS + 'overrides',
    settings: NS + 'settings',
    progress: NS + 'progress',
    history: NS + 'history',
    trainingSession: NS + 'trainingSession',
    preferences: NS + 'preferences'
  };

  function safeParse(str, fallback) {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch (e) { return fallback; }
  }

  function load(key, fallback) {
    var v = null;
    try { v = localStorage.getItem(key); } catch (e) { /* 隐私模式等 */ }
    return safeParse(v, fallback);
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 忽略 */ }
  }

  /* ---------- 覆盖层 ---------- */
  function getOverrides() { return load(KEYS.overrides, { essays: {}, phrases: {} }); }
  function saveOverrides(o) { save(KEYS.overrides, o); }

  /* ---------- 基础数据 ---------- */
  function baseEssays() {
    return [].concat(
      window.APP_DATA_EN1 || [],
      window.APP_DATA_EN2 || [],
      window.APP_DATA_XIAO || []
    );
  }
  function basePhrases() {
    var base = (window.APP_DATA_META && window.APP_DATA_META.phrases) || [];
    var extra = window.APP_DATA_PHRASES_EXTRA || [];
    var imported = window.APP_DATA_PHRASES_IMPORTED || [];
    return base.concat(extra, imported);
  }

  function applyOverrides(list, overridesMap) {
    if (!overridesMap) return list;
    var byId = {};
    var result = [];
    list.forEach(function (item) {
      byId[item.id] = item;
      var ov = overridesMap[item.id];
      if (ov && ov.__deleted) return; // 删除
      if (ov) { result.push(ov); return; } // 覆盖
      result.push(item);
    });
    // 新增项（id 不在基础数据中）
    Object.keys(overridesMap).forEach(function (id) {
      var ov = overridesMap[id];
      if (ov && !ov.__deleted && !byId[id]) result.push(ov);
    });
    return result;
  }

  function getEssays() {
    var ov = getOverrides();
    var list = applyOverrides(baseEssays(), ov.essays);
    // 合并配图（图表/图画场景），覆盖层中的 image 优先
    var charts = window.APP_DATA_IMAGES_CHARTS || {};
    var scenes = window.APP_DATA_IMAGES_SCENES || {};
    list.forEach(function (e) {
      if (!e.image) {
        var img = charts[e.id] || scenes[e.id] || null;
        if (img) e.image = img;
      }
    });
    return list;
  }
  function getPhrases() {
    var ov = getOverrides();
    return applyOverrides(basePhrases(), ov.phrases);
  }
  function getFrameworks() { return (window.APP_DATA_META && window.APP_DATA_META.frameworks) || []; }
  function getScoring() { return (window.APP_DATA_META && window.APP_DATA_META.scoring) || []; }
  function getErrors() { return (window.APP_DATA_META && window.APP_DATA_META.commonErrors) || []; }

  function getEssayById(id) {
    return getEssays().filter(function (e) { return e.id === id; })[0] || null;
  }

  /* ---------- 覆盖层操作（供 admin 使用） ---------- */
  function upsertEssay(essay) {
    var o = getOverrides();
    o.essays[essay.id] = essay;
    saveOverrides(o);
  }
  function deleteEssay(id) {
    var o = getOverrides();
    o.essays[id] = { __deleted: true };
    saveOverrides(o);
  }
  function upsertPhrase(p) {
    var o = getOverrides();
    o.phrases[p.id] = p;
    saveOverrides(o);
  }
  function deletePhrase(id) {
    var o = getOverrides();
    o.phrases[id] = { __deleted: true };
    saveOverrides(o);
  }
  function resetOverrides() { saveOverrides({ essays: {}, phrases: {} }); }

  /* ---------- 设置（AI 批改 + AI 绘图） ---------- */
  function getSettings() {
    return load(KEYS.settings, {
      provider: 'deepseek',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      apiKey: '',
      temperature: 0.3,
      imgProvider: 'siliconflow',
      imgBaseUrl: 'https://api.siliconflow.cn/v1',
      imgModel: 'black-forest-labs/FLUX.1-schnell',
      imgKey: ''
    });
  }
  // 合并保存，避免覆盖其它设置字段
  function setSettings(s) {
    var cur = getSettings();
    var merged = {};
    Object.keys(cur).forEach(function (k) { merged[k] = cur[k]; });
    Object.keys(s || {}).forEach(function (k) { merged[k] = s[k]; });
    save(KEYS.settings, merged);
  }

  /* ---------- 学习进度 ---------- */
  function getProgress() {
    return load(KEYS.progress, { memorized: [], favorites: [], streak: {}, checkins: {}, studySeconds: 0 });
  }
  function setProgress(p) { save(KEYS.progress, p); }

  /* ---------- 批改历史 ---------- */
  function getHistory() { return load(KEYS.history, []); }
  function addHistory(rec) {
    var h = getHistory();
    h.unshift(rec);
    if (h.length > 100) h = h.slice(0, 100);
    save(KEYS.history, h);
    return h;
  }
  function deleteHistory(id) {
    var h = getHistory().filter(function (r) { return r.id !== id; });
    save(KEYS.history, h);
    return h;
  }
  function clearHistory() { save(KEYS.history, []); }

  /* ---------- 本地日期与自动签到 ---------- */
  function localDay(date) { return window.DateUtils ? window.DateUtils.localDateKey(date) : new Date(date || new Date()).toLocaleDateString('en-CA'); }
  function recordLearningActivity(activity) {
    var p = getProgress();
    var today = localDay();
    p.checkins = p.checkins || {};
    var checkedIn = !p.checkins[today];
    if (checkedIn) p.checkins[today] = true;
    var count = 0, cursor = new Date();
    while (p.checkins[localDay(cursor)]) { count++; cursor.setDate(cursor.getDate() - 1); }
    p.streak = p.streak || {};
    p.streak.current = count;
    p.streak.lastDate = today;
    p.streak.lastActivity = activity || 'study';
    p.streak.total = Object.keys(p.checkins).filter(function (key) { return !!p.checkins[key]; }).length;
    setProgress(p);
    return { checkedIn: checkedIn, day: count, date: today, activity: activity || 'study' };
  }

  /* ---------- 用户训练偏好 ---------- */
  function getPreferences() { return load(KEYS.preferences, { examType: '英语一', part: '大作文' }); }
  function setPreferences(prefs) {
    var current = getPreferences();
    Object.keys(prefs || {}).forEach(function (key) { current[key] = prefs[key]; });
    save(KEYS.preferences, current);
    return current;
  }

  /* ---------- 今日训练会话 ---------- */
  function getTrainingSession() { return load(KEYS.trainingSession, null); }
  function setTrainingSession(session) { save(KEYS.trainingSession, session); return session; }
  function clearTrainingSession() { save(KEYS.trainingSession, null); }

  /* ---------- 导出 ---------- */
  function exportData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      essays: getEssays(),
      phrases: getPhrases(),
      frameworks: getFrameworks(),
      scoring: getScoring(),
      commonErrors: getErrors()
    };
  }

  window.Store = {
    KEYS: KEYS,
    getEssays: getEssays,
    getPhrases: getPhrases,
    getFrameworks: getFrameworks,
    getScoring: getScoring,
    getErrors: getErrors,
    getEssayById: getEssayById,
    upsertEssay: upsertEssay,
    deleteEssay: deleteEssay,
    upsertPhrase: upsertPhrase,
    deletePhrase: deletePhrase,
    resetOverrides: resetOverrides,
    getSettings: getSettings,
    setSettings: setSettings,
    getProgress: getProgress,
    setProgress: setProgress,
    getHistory: getHistory,
    addHistory: addHistory,
    deleteHistory: deleteHistory,
    clearHistory: clearHistory,
    recordLearningActivity: recordLearningActivity,
    getPreferences: getPreferences,
    setPreferences: setPreferences,
    getTrainingSession: getTrainingSession,
    setTrainingSession: setTrainingSession,
    clearTrainingSession: clearTrainingSession,
    exportData: exportData
  };
})();
