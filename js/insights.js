/* insights.js — 写作能力画像与薄弱点入口 */
(function () {
  'use strict';
  var el = window.UI.el;
  App.pages.insights = function (root) {
    var history = Store.getHistory(), progress = Store.getProgress(), attempts = history.length;
    var dimensions = [
      ['内容完成度', 68 + Math.min(attempts * 2, 24), '任务要求与观点回应'],
      ['结构组织', 64 + Math.min(attempts * 2, 26), '段落推进与逻辑关系'],
      ['语法准确', 58 + Math.min(attempts * 2, 28), '时态、单复数与句法'],
      ['词汇丰富', 56 + Math.min(attempts * 2, 30), '词汇层次与准确搭配'],
      ['句式多样', 52 + Math.min(attempts * 2, 32), '复合句与表达变化'],
      ['连贯衔接', 62 + Math.min(attempts * 2, 27), '连接词与语篇流畅度']
    ];
    root.appendChild(el('div', { class: 'page-head' }, [el('div', { class: 'eyebrow', text: 'WRITING PROFILE · 训练画像' }), el('h2', { text: '我的写作能力' }), el('div', { class: 'sub', text: '每一次练习，都会让下一次训练更有针对性。当前基于你的训练次数生成画像。' })]));
    var summary = el('div', { class: 'insight-summary card' }, [el('div', { class: 'insight-score' }, [el('span', { text: '当前训练指数' }), el('strong', { text: String(Math.round(dimensions.reduce(function(a,x){return a+x[1];},0)/dimensions.length)) }), el('small', { text: '/ 100' })]), el('div', { class: 'insight-copy' }, [el('h3', { text: attempts ? '继续保持，优先补齐语言表达' : '先完成一次诊断作文' }), el('p', { text: attempts ? '你已经完成 ' + attempts + ' 次批改。建议下一步集中训练“句式多样”和“词汇丰富”。' : '完成一篇真题或模拟题后，这里会逐步形成你的个人写作能力模型。' }), el('button', { class: 'btn btn-primary', onclick: function () { location.hash = attempts ? 'correct' : 'simulations'; } }, attempts ? '开始针对性训练' : '开始第一次训练')])]);
    root.appendChild(summary);
    var grid = el('div', { class: 'grid grid-2 insight-grid' });
    dimensions.forEach(function (d) { var bar = el('div', { class: 'insight-bar' }); bar.appendChild(el('div', { class: 'flex-between' }, [el('strong', { text: d[0] }), el('span', { text: d[1] + ' / 100' })])); bar.appendChild(el('div', { class: 'progress-track' }, [el('i', { style: 'width:' + d[1] + '%' })])); bar.appendChild(el('small', { text: d[2] })); var card = el('div', { class: 'card' }); card.appendChild(bar); grid.appendChild(card); });
    root.appendChild(grid);
    root.appendChild(el('div', { class: 'card weak-focus' }, [el('div', { class: 'eyebrow', text: 'NEXT FOCUS' }), el('h3', { text: '本周建议训练路径' }), el('div', { class: 'focus-steps' }, [['01','积累 10 条高分表达','memorize'],['02','完成 1 篇图画作文','simulations'],['03','提交批改并重写','correct']].map(function (s) { return el('button', { class: 'focus-step', onclick: function () { location.hash = s[2]; } }, [el('b', { text: s[0] }), el('span', { text: s[1] })]); }))]));
  };
})();
