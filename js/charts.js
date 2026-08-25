/* ============================================================
   charts.js — SVG 图表渲染 + 图画题 AI 文生图
   图表作文：内置 SVG 图表（柱状/折线/饼图）
   图画作文：调用 OpenAI 兼容 images 接口生成图画（需配置 API）
   ============================================================ */
(function () {
  'use strict';

  var PALETTE = ['#4c6ef5', '#fa8c16', '#13c2c2', '#722ed1', '#52c41a', '#eb2f96', '#8d99ae'];
  var AXIS = '#9a9183', TEXT = '#4a443a', GRID = '#eae3d3';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function wrapSvg(inner, w, h, bg) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto;background:' + (bg || '#fffdf9') + ';border-radius:8px;display:block;">' + inner + '</svg>';
  }
  function niceCeil(v) {
    if (v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v)));
    var m = v / p;
    var nm = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return nm * p;
  }
  function fmt(v) { return String(Math.round(v * 10) / 10); }
  function title(text) {
    return '<text x="340" y="32" text-anchor="middle" font-size="19" font-weight="700" fill="' + TEXT + '" font-family="Songti SC,Noto Serif SC,SimSun,serif">' + esc(text) + '</text>';
  }
  function lab(x, y, t, size, fill, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" font-size="' + (size || 13) + '" fill="' + (fill || TEXT) + '">' + esc(t) + '</text>';
  }

  /* ---------- 柱状图 / 折线图 ---------- */
  function renderCartesian(spec) {
    var w = 680, h = 380, ml = 70, mr = 30, mt = 70, mb = 46;
    var pw = w - ml - mr, ph = h - mt - mb;
    var labels = spec.labels || [], series = spec.series || [];
    var maxV = 0;
    series.forEach(function (s) { s.values.forEach(function (v) { if (v > maxV) maxV = v; }); });
    var niceMax = niceCeil(maxV);
    function xAt(i) { return ml + pw * (labels.length <= 1 ? 0.5 : i / (labels.length - 1)); }
    function yAt(v) { return mt + ph - ph * (v / niceMax); }
    var P = [];
    P.push(title(spec.title));
    var gridN = 5;
    for (var g = 0; g <= gridN; g++) {
      var val = niceMax * g / gridN, yy = yAt(val);
      P.push('<line x1="' + ml + '" y1="' + yy + '" x2="' + (w - mr) + '" y2="' + yy + '" stroke="' + GRID + '" stroke-width="1"/>');
      P.push('<text x="' + (ml - 10) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="12" fill="' + AXIS + '">' + fmt(val) + '</text>');
    }
    P.push('<line x1="' + ml + '" y1="' + (mt + ph) + '" x2="' + (w - mr) + '" y2="' + (mt + ph) + '" stroke="' + AXIS + '" stroke-width="1.4"/>');
    P.push('<line x1="' + ml + '" y1="' + mt + '" x2="' + ml + '" y2="' + (mt + ph) + '" stroke="' + AXIS + '" stroke-width="1.4"/>');
    if (spec.unit) P.push(lab(ml - 8, mt + 10, spec.unit, 12, AXIS, 'end'));
    var bw = pw / labels.length;
    labels.forEach(function (lb, i) {
      if (spec.type === 'line') {
        series.forEach(function (s, si) {
          var prevX = null, prevY = null;
          s.values.forEach(function (v, j) {
            var xx = xAt(j), yy = yAt(v);
            if (prevX != null) P.push('<line x1="' + prevX + '" y1="' + prevY + '" x2="' + xx + '" y2="' + yy + '" stroke="' + PALETTE[si % PALETTE.length] + '" stroke-width="2.6" stroke-linecap="round"/>');
            prevX = xx; prevY = yy;
          });
        });
        series.forEach(function (s, si) {
          s.values.forEach(function (v, j) {
            var xx = xAt(j), yy = yAt(v);
            P.push('<circle cx="' + xx + '" cy="' + yy + '" r="4.2" fill="#fff" stroke="' + PALETTE[si % PALETTE.length] + '" stroke-width="2.4"/>');
            if (series.length === 1) P.push(lab(xx, yy - 10, fmt(v), 11.5, TEXT));
          });
        });
      } else {
        var n = series.length;
        series.forEach(function (s, si) {
          var v = s.values[i];
          var barW = (bw * 0.7 / n) * 0.82;
          var bx = ml + i * bw + (bw - bw * 0.7) / 2 + si * (bw * 0.7 / n) + (bw * 0.7 / n - barW) / 2;
          var bh = ph * (v / niceMax), by = mt + ph - bh;
          P.push('<rect x="' + bx + '" y="' + by + '" width="' + barW + '" height="' + bh + '" rx="3" fill="' + PALETTE[si % PALETTE.length] + '"/>');
          P.push(lab(bx + barW / 2, by - 6, fmt(v), 11.5, TEXT));
        });
      }
      P.push(lab(ml + i * bw + bw / 2, mt + ph + 22, lb, 12.5, TEXT));
    });
    if (series.length > 1) {
      var lx = ml;
      series.forEach(function (s, si) {
        P.push('<rect x="' + lx + '" y="' + (mt - 34) + '" width="12" height="12" rx="2" fill="' + PALETTE[si % PALETTE.length] + '"/>');
        P.push(lab(lx + 17, mt - 23, s.name, 12.5, TEXT, 'start'));
        lx += 46 + s.name.length * 14;
      });
    }
    return wrapSvg(P.join(''), w, h);
  }

  /* ---------- 饼图 ---------- */
  function renderPie(spec) {
    var w = 680, h = 400, cx = 300, cy = h / 2 + 14, r = 130;
    var data = spec.data || [];
    var total = data.reduce(function (a, d) { return a + d.value; }, 0) || 1;
    var P = [];
    P.push(title(spec.title));
    var start = -Math.PI / 2;
    data.forEach(function (d, i) {
      var angle = d.value / total * 2 * Math.PI, end = start + angle;
      var x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
      var x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
      var large = angle > Math.PI ? 1 : 0;
      P.push('<path d="M' + cx + ',' + cy + ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z" fill="' + PALETTE[i % PALETTE.length] + '" stroke="#fff" stroke-width="2"/>');
      var mid = start + angle / 2;
      var lx = cx + (r + 28) * Math.cos(mid), ly = cy + (r + 28) * Math.sin(mid);
      var pct = Math.round(d.value / total * 100);
      P.push(lab(lx, ly + 4, d.name + ' ' + pct + '%', 12.5, TEXT, Math.cos(mid) >= 0 ? 'start' : 'end'));
      start = end;
    });
    var lyy = 60;
    data.forEach(function (d, i) {
      P.push('<rect x="' + (cx + r + 90) + '" y="' + (lyy - 10) + '" width="11" height="11" rx="2" fill="' + PALETTE[i % PALETTE.length] + '"/>');
      P.push(lab(cx + r + 106, lyy, d.name + ' ' + d.value + (spec.unit || ''), 12, TEXT, 'start'));
      lyy += 22;
    });
    return wrapSvg(P.join(''), w, h);
  }

  function renderChart(spec) {
    if (!spec) return '';
    if (spec.type === 'pie') return renderPie(spec);
    return renderCartesian(spec);
  }

  /* ================= 图画题：AI 文生图 ================= */
  var STYLE = ', in the style of a simple line-drawing cartoon for a Chinese postgraduate entrance exam writing section, flat minimal illustration, thin ink outlines, muted colors, clean white background, no text';

  var IMG_PROVIDERS = [
    { id: 'siliconflow', name: 'SiliconFlow 硅基流动（推荐）', baseUrl: 'https://api.siliconflow.cn/v1', models: ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-3-5-large', 'Kwai-Kolors/Kolors'] },
    { id: 'zhipu', name: '智谱 CogView', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['cogview-3-flash'] },
    { id: 'openai', name: 'OpenAI DALL·E', baseUrl: 'https://api.openai.com/v1', models: ['dall-e-3', 'gpt-image-1'] },
    { id: 'custom', name: '自定义（OpenAI 兼容 images 接口）', baseUrl: '', models: [] }
  ];

  var THEME_PROMPTS = {
    '环境保护': 'A polluted lake covered with floating rubbish while people pass by indifferently, environmental protection theme' + STYLE,
    '诚实守信': 'Two partners shaking hands firmly beside a large red seal stamp symbolizing a promise, honesty and trust theme' + STYLE,
    '坚持不懈': 'A climber struggling up a steep mountain with a victory flag on the summit, persistence theme' + STYLE,
    '乐观心态': 'A person smiling at half a glass of water on a table, optimism theme' + STYLE,
    '团队合作': 'Several people lifting a heavy wooden box together, teamwork theme' + STYLE,
    '创新精神': 'A glowing light bulb with gears inside above an open book, innovation and creativity theme' + STYLE,
    '多读书·读好书': 'A person reading attentively under a warm lamp surrounded by piles of books, reading theme' + STYLE,
    '孝敬父母·亲情陪伴': 'A young adult holding an umbrella for an elderly parent walking together, filial piety and family love theme' + STYLE,
    '兴趣是最好的老师': 'A child playing a musical instrument with joyful expression, interest theme' + STYLE,
    '养成好习惯': 'A person watering a small sprout that grows into a strong tree, good habits theme' + STYLE,
    '体育锻炼·全民健身': 'People running and doing morning exercises in a park at sunrise, fitness theme' + STYLE,
    '追逐梦想': 'A person standing on a hill reaching for bright stars while a rocket launches in the background, dream theme' + STYLE,
    '文化交流与融合': 'A Peking Opera mask, a guitar and a compass joined together in harmony, cultural exchange theme' + STYLE,
    '言传身教·榜样': 'A father reading a book while his child imitates him, parents as role models theme' + STYLE
  };
  var GENERIC_PROMPT = 'A simple cartoon illustrating a moral lesson about persistence and growth' + STYLE;

  function promptFor(id) {
    if (!id) return '';
    if (id.indexOf('mock:') === 0) return THEME_PROMPTS[id.slice(5)] || GENERIC_PROMPT;
    var sc = (window.APP_DATA_IMAGES_SCENES || {})[id];
    return (sc && sc.scene && sc.scene.prompt) || GENERIC_PROMPT;
  }

  function picturePanel(id, caption) {
    var cached = null;
    try { cached = localStorage.getItem('kyeng.pic.' + id); } catch (e) { cached = null; }
    var inner = '';
    if (cached) {
      inner = '<img src="' + esc(cached) + '" style="width:100%;height:auto;border-radius:8px;display:block;background:#fdfbf4;">' +
        '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
        '<button class="btn btn-outline btn-sm" onclick="App.charts.genPicture(\'' + esc(id) + '\')">重新生成</button>' +
        '<span class="small muted">AI 生成 · 已缓存到本机，右键图片可另存</span></div>';
    } else {
      inner = '<div style="border:1px dashed #d4cab6;border-radius:8px;padding:20px;text-align:center;background:#fdfbf4;">' +
        '<div style="font-size:13.5px;color:#6f675a;margin-bottom:10px;">本题为图画作文，图画将由 AI 生成（需先在「数据管理」配置 AI 绘图）</div>' +
        '<button class="btn btn-primary btn-sm" onclick="App.charts.genPicture(\'' + esc(id) + '\')">AI 生成本题图画</button>' +
        (caption ? '<div style="margin-top:10px;font-size:12.5px;color:#a19888;">' + esc(caption) + '</div>' : '') +
        '</div>';
    }
    return '<div class="picture-panel" id="pic-' + esc(id) + '">' + inner + '</div>';
  }

  function genPicture(id) {
    var panel = document.getElementById('pic-' + id);
    if (!panel) { if (window.UI) window.UI.toast('未找到图画区域'); return; }
    var s = window.Store.getSettings();
    if (!s.imgKey || !s.imgBaseUrl || !s.imgModel) {
      panel.innerHTML = '<div style="padding:18px;text-align:center;color:#a63c2e;font-size:13px;">尚未配置 AI 绘图：请到「数据管理」页填写 API Key（推荐 SiliconFlow）后重试。<br><a href="#admin">前往配置 →</a></div>';
      return;
    }
    panel.innerHTML = '<div style="text-align:center;padding:26px;color:#6f675a;font-size:13.5px;">正在 AI 生成图画，约需 10–30 秒…</div>';
    fetch(s.imgBaseUrl.replace(/\/+$/, '') + '/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.imgKey },
      body: JSON.stringify({ model: s.imgModel, prompt: promptFor(id), n: 1, size: '1024x1024' })
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('HTTP ' + r.status + '：' + t.slice(0, 200)); });
      return r.json();
    }).then(function (d) {
      var item = d && d.data && d.data[0] ? d.data[0] : null;
      var src = item ? (item.url || (item.b64_json ? 'data:image/png;base64,' + item.b64_json : '')) : '';
      if (!src) throw new Error('接口未返回图片');
      try { localStorage.setItem('kyeng.pic.' + id, src); } catch (e) { /* 缓存超限忽略 */ }
      panel.innerHTML = '';
      var img = document.createElement('img');
      img.src = src;
      img.style.cssText = 'width:100%;height:auto;border-radius:8px;display:block;';
      panel.appendChild(img);
      var bar = document.createElement('div');
      bar.style.cssText = 'margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;';
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.textContent = '重新生成';
      btn.onclick = function () { genPicture(id); };
      bar.appendChild(btn);
      var hint = document.createElement('span');
      hint.className = 'small muted';
      hint.textContent = '已生成并缓存到本机；如需永久使用，请右键图片另存为放入 images/ 目录后引用。';
      bar.appendChild(hint);
      panel.appendChild(bar);
      if (window.UI) window.UI.toast('图画生成完成');
    }).catch(function (err) {
      var msg = err && err.message ? err.message : String(err);
      panel.innerHTML = '<div style="padding:16px;text-align:center;color:#a63c2e;font-size:13px;">生成失败：' + esc(msg) +
        '<br>常见原因：Key 无效 / 余额不足 / 模型名错误 / 服务商不支持浏览器直连（推荐 SiliconFlow）。</div>';
    });
  }

  /* 统一配图入口：chart(图表) / file(本地原图) / scene(图画→AI 生成) */
  function renderFor(id, imageObj) {
    if (!imageObj) return '';
    if (imageObj.chart) return renderChart(imageObj.chart);
    if (imageObj.file) return '<img src="' + esc(imageObj.file) + '" alt="题目配图" style="width:100%;height:auto;border-radius:8px;display:block;background:#fdfbf4;"/>';
    return picturePanel(id, (imageObj.scene && imageObj.scene.caption) || '');
  }

  /* ---------- 模拟题配图生成 ---------- */
  function mockChart(subject, trend) {
    var labels = ['2021', '2022', '2023', '2024', '2025'];
    var values = [];
    var base = 20 + Math.round(Math.random() * 15);
    if (trend.indexOf('激增') >= 0) { var k = [12, 14, 18, 22, 26][Math.floor(Math.random() * 5)]; for (var i = 0; i < 5; i++) values.push(base + k * i * (1 + Math.random() * 0.2)); }
    else if (trend.indexOf('翻') >= 0) { for (var j = 0; j < 5; j++) values.push(Math.round(base * Math.pow(1.55, j))); }
    else if (trend.indexOf('先升后稳') >= 0) { var v = base; for (var k2 = 0; k2 < 5; k2++) { values.push(Math.round(v)); v += (k2 < 3 ? 14 : 3); } }
    else if (trend.indexOf('连年攀升') >= 0) { for (var k3 = 0; k3 < 5; k3++) values.push(Math.round(base * (1 + k3 * 0.5))); }
    else { for (var k4 = 0; k4 < 5; k4++) values.push(Math.round(base + k4 * 10)); }
    return { type: 'bar', title: subject + '变化趋势（模拟题）', unit: '%', labels: labels, series: [{ name: '指标值', values: values }] };
  }

  function mockPrompt(theme) { return THEME_PROMPTS[theme] || GENERIC_PROMPT; }

  window.App = window.App || {};
  window.App.charts = {
    renderChart: renderChart,
    renderFor: renderFor,
    picturePanel: picturePanel,
    genPicture: genPicture,
    mockChart: mockChart,
    mockPrompt: mockPrompt
  };
  window.AI_IMAGE_PROVIDERS = IMG_PROVIDERS;
})();
