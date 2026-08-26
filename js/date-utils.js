/* date-utils.js — 统一使用用户本地日期，避免 UTC 跨日 */
(function () {
  'use strict';
  function localDateKey(date) {
    date = date || new Date();
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  function addDays(date, amount) {
    var next = new Date(date || new Date());
    next.setDate(next.getDate() + amount);
    return next;
  }
  window.DateUtils = { localDateKey: localDateKey, addDays: addDays };
})();
