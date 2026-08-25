/* ============================================================
   charts.js — SVG 图表与图画场景渲染
   用于真题/模拟题的图表作文与图画作文配图
   ============================================================ */
(function () {
  'use strict';

  var PALETTE = ['#4c6ef5', '#fa8c16', '#13c2c2', '#722ed1', '#52c41a', '#eb2f96', '#8d99ae'];
  var AXIS = '#9a9183', TEXT = '#4a443a', GRID = '#eae3d3', INK = '#4a443a';

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
  function fmt(v) {
    var r = Math.round(v * 10) / 10;
    return String(r);
  }
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
    // 图例
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

  /* ---------- 图画场景 ---------- */
  function person(x, y, color) {
    var c = color || INK;
    return '<circle cx="' + x + '" cy="' + (y - 46) + '" r="7" fill="none" stroke="' + c + '" stroke-width="2.6"/>' +
      '<line x1="' + x + '" y1="' + (y - 39) + '" x2="' + x + '" y2="' + (y - 22) + '" stroke="' + c + '" stroke-width="2.6"/>' +
      '<line x1="' + x + '" y1="' + (y - 22) + '" x2="' + (x - 9) + '" y2="' + (y - 8) + '" stroke="' + c + '" stroke-width="2.6"/>' +
      '<line x1="' + x + '" y1="' + (y - 22) + '" x2="' + (x + 9) + '" y2="' + (y - 8) + '" stroke="' + c + '" stroke-width="2.6"/>' +
      '<line x1="' + x + '" y1="' + (y - 18) + '" x2="' + (x - 8) + '" y2="' + (y - 3) + '" stroke="' + c + '" stroke-width="2.6"/>' +
      '<line x1="' + x + '" y1="' + (y - 18) + '" x2="' + (x + 8) + '" y2="' + (y - 3) + '" stroke="' + c + '" stroke-width="2.6"/>';
  }
  function chip(x, y, t) {
    return '<rect x="' + x + '" y="' + y + '" width="78" height="26" rx="13" fill="#f5e7e2" stroke="#a63c2e" stroke-width="1.4"/>' +
      '<text x="' + (x + 39) + '" y="' + (y + 18) + '" text-anchor="middle" font-size="13.5" fill="#8a2f22">' + esc(t) + '</text>';
  }
  function sceneWrap(inner, caption) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 400" style="width:100%;height:auto;background:#fdfbf4;border-radius:8px;display:block;">' +
      inner +
      (caption ? '<text x="340" y="388" text-anchor="middle" font-size="14.5" fill="#6f675a" font-family="Songti SC,Noto Serif SC,SimSun,serif">' + esc(caption) + '</text>' : '') +
      '</svg>';
  }

  var SCENES = {
    'sc-hotpot': function () {
      return sceneWrap(
        '<path d="M150 260 a190 190 0 0 1 380 0 Z" fill="#f7e8d8" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M150 260 h380" stroke="' + INK + '" stroke-width="3"/>' +
        '<line x1="300" y1="240" x2="290" y2="196" stroke="' + INK + '" stroke-width="2.6"/><line x1="300" y1="240" x2="305" y2="186" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<line x1="360" y1="232" x2="372" y2="188" stroke="' + INK + '" stroke-width="2.6"/><line x1="360" y1="232" x2="350" y2="180" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<line x1="240" y1="238" x2="230" y2="196" stroke="' + INK + '" stroke-width="2.6"/><line x1="240" y1="238" x2="248" y2="190" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="340" cy="238" r="8" fill="none" stroke="' + INK + '" stroke-width="2"/><circle cx="300" cy="252" r="6" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        chip(78, 300, '京剧') + chip(176, 300, '功夫') + chip(274, 300, '孔子') + chip(372, 300, '毕昇') + chip(470, 300, '老舍') +
        lab(340, 280, '文化“火锅”，既美味又营养', 15, '#a63c2e'),
        '配文：文化“火锅”，既美味又营养');
    },
    'sc-litter': function () {
      return sceneWrap(
        '<ellipse cx="340" cy="250" rx="260" ry="70" fill="#e7f0ec" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path d="M150 250 q190 -60 380 0" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        person(180, 340, INK) +
        '<line x1="180" y1="200" x2="210" y2="250" stroke="' + INK + '" stroke-width="2.4"/>' + // 投掷动作
        '<rect x="300" y="246" width="16" height="10" fill="#c9c2b2" stroke="' + INK + '" stroke-width="1.6"/>' +
        '<rect x="380" y="258" width="14" height="9" fill="#c9c2b2" stroke="' + INK + '" stroke-width="1.6"/>' +
        '<rect x="440" y="244" width="15" height="10" fill="#c9c2b2" stroke="' + INK + '" stroke-width="1.6"/>' +
        '<rect x="250" y="262" width="13" height="9" fill="#c9c2b2" stroke="' + INK + '" stroke-width="1.6"/>' +
        lab(340, 130, '旅途之“余”', 16, '#a63c2e'),
        '游客随手乱扔垃圾，湖面漂满废弃物');
    },
    'sc-optimism': function () {
      return sceneWrap(
        '<path d="M250 190 L390 150 L430 235 L290 275 Z" fill="#e7eefb" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M270 198 L392 163 L400 205 L278 240 Z" fill="#8ab8e8"/>' +
        '<line x1="300" y1="140" x2="300" y2="120" stroke="' + INK + '" stroke-width="2"/>' + // 洒落的水
        '<line x1="318" y1="136" x2="318" y2="114" stroke="' + INK + '" stroke-width="2"/>' +
        person(140, 330, INK) + '<path d="M112 268 q10 -12 22 0" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' + // 乐观笑脸
        person(540, 330, INK) + '<path d="M512 262 q10 12 22 0" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' + // 悲观哭脸
        lab(152, 292, '幸好还剩半杯', 13, '#1f6f5c') + lab(552, 292, '全完了！', 13, '#a63c2e') +
        lab(340, 120, '半杯水：乐观与悲观', 16, '#a63c2e'),
        '面对倒掉半杯的水，两人心态截然不同');
    },
    'sc-choice': function () {
      return sceneWrap(
        person(340, 300, INK) +
        '<line x1="340" y1="150" x2="340" y2="254" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path d="M340 150 Q340 90 200 70" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<path d="M340 150 Q340 90 480 70" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<rect x="140" y="40" width="120" height="30" rx="6" fill="#f5e7e2" stroke="#a63c2e"/><text x="200" y="60" text-anchor="middle" font-size="14" fill="#8a2f22">求职</text>' +
        '<rect x="140" y="0" width="120" height="30" rx="6" fill="#e6efe9" stroke="#1f6f5c"/><text x="200" y="20" text-anchor="middle" font-size="14" fill="#1f6f5c">考研</text>' +
        '<rect x="420" y="40" width="120" height="30" rx="6" fill="#f3ead6" stroke="#a67c2e"/><text x="480" y="60" text-anchor="middle" font-size="14" fill="#8a6a1f">出国</text>' +
        '<rect x="420" y="0" width="120" height="30" rx="6" fill="#e7eefb" stroke="#3b5bdb"/><text x="480" y="20" text-anchor="middle" font-size="14" fill="#3b5bdb">创业</text>' +
        lab(340, 120, '毕业生的人生岔路口', 16, '#a63c2e'),
        '毕业生站在岔路口，面临求职、考研、出国、创业等选择');
    },
    'sc-elder': function () {
      return sceneWrap(
        lab(170, 60, '30年前', 15, '#6f675a') + lab(510, 60, '30年后', 15, '#6f675a') +
        '<line x1="340" y1="40" x2="340" y2="360" stroke="' + GRID + '" stroke-width="2" stroke-dasharray="6 6"/>' +
        person(150, 300, '#3b5bdb') + person(230, 300, '#5a5244') + // 母(小)牵孩
        '<line x1="150" y1="228" x2="230" y2="228" stroke="' + INK + '" stroke-width="2.2"/>' +
        person(470, 300, '#5a5244') + person(550, 300, '#3b5bdb') + // 孩(成)扶母
        '<line x1="470" y1="228" x2="550" y2="228" stroke="' + INK + '" stroke-width="2.2"/>' +
        lab(340, 375, '相携', 15, '#a63c2e'),
        '母亲牵着孩子长大，孩子搀扶年迈的母亲');
    },
    'sc-phones': function () {
      return sceneWrap(
        '<ellipse cx="340" cy="240" rx="220" ry="70" fill="#f2eee4" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<ellipse cx="340" cy="238" rx="150" ry="46" fill="#fff" stroke="' + GRID + '" stroke-width="1.6"/>' +
        person(200, 340, INK) + person(300, 340, INK) + person(440, 340, INK) + person(540, 340, INK) +
        '<rect x="182" y="196" width="22" height="34" rx="4" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        '<rect x="288" y="186" width="22" height="34" rx="4" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        '<rect x="426" y="194" width="22" height="34" rx="4" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        '<rect x="528" y="200" width="22" height="34" rx="4" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        lab(340, 120, '手机时代的聚会', 16, '#a63c2e'),
        '朋友们同桌聚餐，却各自低头玩手机');
    },
    'sc-role-model': function () {
      return sceneWrap(
        lab(170, 60, '认真阅读的父亲', 14, '#6f675a') + lab(510, 60, '玩手机的家长', 14, '#6f675a') +
        '<line x1="340" y1="40" x2="340" y2="360" stroke="' + GRID + '" stroke-width="2" stroke-dasharray="6 6"/>' +
        person(160, 290, '#3b5bdb') + person(250, 290, '#5a5244') +
        '<rect x="120" y="230" width="34" height="24" rx="3" fill="none" stroke="' + INK + '" stroke-width="2"/><line x1="132" y1="230" x2="132" y2="222" stroke="' + INK + '" stroke-width="2"/>' +
        person(460, 290, '#3b5bdb') + person(550, 290, '#5a5244') +
        '<rect x="428" y="230" width="30" height="26" rx="3" fill="none" stroke="' + INK + '" stroke-width="2"/><rect x="458" y="236" width="22" height="14" fill="#8ab8e8"/>' +
        lab(340, 375, '言传身教', 15, '#a63c2e'),
        '父母是孩子的第一任老师，孩子有样学样');
    },
    'sc-reading': function () {
      return sceneWrap(
        lab(170, 60, '有书（书满为患）', 14, '#6f675a') + lab(510, 60, '读书（开卷有益）', 14, '#6f675a') +
        '<line x1="340" y1="40" x2="340" y2="360" stroke="' + GRID + '" stroke-width="2" stroke-dasharray="6 6"/>' +
        '<rect x="90" y="100" width="180" height="230" fill="#f2eee4" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<rect x="108" y="120" width="140" height="16" fill="#c9c2b2"/><rect x="108" y="146" width="140" height="16" fill="#c9c2b2"/><rect x="108" y="172" width="140" height="16" fill="#c9c2b2"/><rect x="108" y="198" width="140" height="16" fill="#c9c2b2"/><rect x="108" y="224" width="140" height="16" fill="#c9c2b2"/>' +
        '<text x="180" y="270" text-anchor="middle" font-size="13" fill="#8d8571">积满灰尘</text>' +
        person(530, 320, INK) +
        '<rect x="470" y="210" width="40" height="30" rx="3" fill="none" stroke="' + INK + '" stroke-width="2"/><line x1="482" y1="210" x2="482" y2="202" stroke="' + INK + '" stroke-width="2"/><line x1="482" y1="234" x2="476" y2="244" stroke="' + INK + '" stroke-width="2"/><line x1="482" y1="238" x2="488" y2="246" stroke="' + INK + '" stroke-width="2"/>' +
        lab(340, 375, '有书与读书', 15, '#a63c2e'),
        '书架上堆满书却积灰，与认真读书形成对比');
    },
    'sc-course': function () {
      return sceneWrap(
        '<rect x="170" y="70" width="340" height="220" rx="10" fill="#232019" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<rect x="190" y="110" width="300" height="160" fill="#f2eee4" stroke="#8d8571" stroke-width="1.6"/>' +
        lab(340, 100, '选课系统', 15, '#f2eee4') +
        '<rect x="210" y="130" width="260" height="30" rx="4" fill="#f5e7e2"/><text x="340" y="150" text-anchor="middle" font-size="13.5" fill="#8a2f22">知识新</text>' +
        '<rect x="210" y="170" width="260" height="30" rx="4" fill="#f3ead6"/><text x="340" y="190" text-anchor="middle" font-size="13.5" fill="#8a6a1f">创新难</text>' +
        '<rect x="210" y="210" width="260" height="30" rx="4" fill="#e6efe9"/><text x="340" y="230" text-anchor="middle" font-size="13.5" fill="#1f6f5c">给分高</text>' +
        '<line x1="260" y1="300" x2="300" y2="340" stroke="' + INK + '" stroke-width="2.4"/><circle cx="340" cy="340" r="34" fill="none" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle cx="340" cy="328" r="8" fill="none" stroke="' + INK + '" stroke-width="2"/><path d="M326 348 q14 10 28 0" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        '<text x="380" y="345" font-size="13" fill="' + TEXT + '">选哪个？</text>' +
        lab(340, 120, '选课难', 16, '#a63c2e'),
        '面对“知识新、创新难、给分高”的课程，学生陷入选择');
    },
    'sc-mountain': function () {
      return sceneWrap(
        '<path d="M60 340 L250 130 L340 240 L420 120 L620 340 Z" fill="#e7eefb" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M330 130 L250 130 L230 110 L300 90 L310 108 L330 108 Z" fill="#f3ead6" stroke="' + INK + '" stroke-width="2"/>' + // 山顶旗帜
        person(500, 330, INK) + '<text x="500" y="276" font-size="12.5" fill="' + TEXT + '">“太累了，算了”</text>' +
        person(300, 190, '#3b5bdb') + '<text x="300" y="140" font-size="12.5" fill="#1f6f5c">坚持！</text>' +
        lab(340, 120, '爬山的启示', 16, '#a63c2e'),
        '一人坚持登顶，一人半途而废');
    },
    'sc-habit': function () {
      return sceneWrap(
        person(330, 300, INK) +
        '<circle cx="330" cy="150" r="52" fill="#f5e7e2" stroke="#a63c2e" stroke-width="2.6"/>' +
        '<circle cx="330" cy="150" r="34" fill="none" stroke="#a63c2e" stroke-width="1.6" stroke-dasharray="5 5"/>' +
        '<text x="330" y="157" text-anchor="middle" font-size="15" fill="#8a2f22">好习惯</text>' +
        '<line x1="330" y1="98" x2="330" y2="78" stroke="#a63c2e" stroke-width="3"/><circle cx="330" cy="70" r="9" fill="#f5e7e2" stroke="#a63c2e" stroke-width="2.4"/>' +
        '<line x1="278" y1="150" x2="258" y2="150" stroke="#a63c2e" stroke-width="3"/><circle cx="248" cy="150" r="9" fill="#f5e7e2" stroke="#a63c2e" stroke-width="2.4"/>' +
        '<line x1="382" y1="150" x2="402" y2="150" stroke="#a63c2e" stroke-width="3"/><circle cx="412" cy="150" r="9" fill="#f5e7e2" stroke="#a63c2e" stroke-width="2.4"/>' +
        lab(340, 250, '日拱一卒，功不唐捐', 15, '#a63c2e'),
        '习惯成自然，自律者自由');
    },
    'sc-interest': function () {
      return sceneWrap(
        '<rect x="150" y="60" width="120" height="70" rx="6" fill="#f3ead6" stroke="#a67c2e" stroke-width="2.2"/>' + // 头饰
        '<circle cx="340" cy="150" r="40" fill="#f5e7e2" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M310 160 q10 12 20 0" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' +
        person(340, 310, INK) +
        '<rect x="480" y="90" width="130" height="180" fill="#e7eefb" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<line x1="480" y1="90" x2="610" y2="90" stroke="' + INK + '" stroke-width="1.4"/><line x1="480" y1="90" x2="480" y2="270" stroke="' + INK + '" stroke-width="1.4"/>' +
        '<circle cx="545" cy="160" r="26" fill="none" stroke="' + INK + '" stroke-width="1.8"/>' +
        lab(545, 245, '镜子', 12, '#6f675a') +
        lab(340, 120, '兴趣是最好的老师', 16, '#a63c2e'),
        '孩子穿着戏服对镜扮演，眼中闪烁着兴趣的光芒');
    },
    'sc-innovation': function () {
      return sceneWrap(
        '<rect x="120" y="70" width="440" height="200" rx="8" fill="#232019" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<text x="340" y="150" text-anchor="middle" font-size="34" fill="#f3ead6" font-family="Songti SC,Noto Serif SC,SimSun,serif">创 新</text>' +
        '<text x="340" y="190" text-anchor="middle" font-size="14" fill="#c8c0ac">Innovation · 创新讲座</text>' +
        '<text x="340" y="220" text-anchor="middle" font-size="12.5" fill="#8d8571">—— 敢于挑战 · 勇于创造 ——</text>' +
        '<circle cx="600" cy="120" r="34" fill="#f3ead6" stroke="#a67c2e" stroke-width="2.2"/>' +
        '<path d="M600 100 q14 16 0 26 M600 100 q-14 16 0 26" fill="none" stroke="#a67c2e" stroke-width="2.2"/>' +
        lab(340, 300, '创新驱动发展', 15, '#a63c2e'),
        '校园讲座海报：创新，是时代的最强音');
    },
    'sc-dragonboat': function () {
      return sceneWrap(
        '<path d="M120 240 Q340 290 560 240 L530 300 Q340 340 150 300 Z" fill="#e7eefb" stroke="' + INK + '" stroke-width="2.8"/>' + // 船身
        '<path d="M120 240 Q90 220 70 240 Q60 258 84 262 L120 270" fill="none" stroke="' + INK + '" stroke-width="2.6"/>' + // 龙头
        '<circle cx="78" cy="228" r="4" fill="' + INK + '"/><path d="M72 250 q8 8 16 0" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        person(220, 296, '#3b5bdb') + person(320, 300, '#5a5244') + person(420, 300, '#3b5bdb') + person(520, 294, '#5a5244') +
        '<line x1="220" y1="220" x2="180" y2="250" stroke="' + INK + '" stroke-width="2.4"/><line x1="320" y1="226" x2="280" y2="256" stroke="' + INK + '" stroke-width="2.4"/><line x1="420" y1="226" x2="460" y2="256" stroke="' + INK + '" stroke-width="2.4"/><line x1="520" y1="220" x2="560" y2="250" stroke="' + INK + '" stroke-width="2.4"/>' +
        lab(340, 120, '赛龙舟', 16, '#a63c2e'),
        '众人划桨开大船，传统文化薪火相传');
    },
    'sc-exercise': function () {
      return sceneWrap(
        '<circle cx="600" cy="90" r="26" fill="#f3ead6" stroke="#a67c2e" stroke-width="2"/>' + // 太阳
        '<path d="M90 340 q60 -60 120 -20 q60 40 120 -30 q60 -70 150 -10 q70 45 140 0" fill="none" stroke="#8ab8e8" stroke-width="2.4"/>' + // 小径
        '<path d="M40 300 q40 -60 100 -30" fill="none" stroke="#1f6f5c" stroke-width="2.6"/><circle cx="44" cy="296" r="6" fill="#1f6f5c"/><circle cx="104" cy="282" r="6" fill="#1f6f5c"/>' + // 树
        person(240, 330, '#3b5bdb') + '<line x1="240" y1="250" x2="300" y2="240" stroke="#3b5bdb" stroke-width="2.6"/><line x1="300" y1="240" x2="330" y2="205" stroke="#3b5bdb" stroke-width="2.6"/>' +
        person(440, 340, '#a63c2e') + '<line x1="440" y1="258" x2="500" y2="252" stroke="#a63c2e" stroke-width="2.6"/><line x1="500" y1="252" x2="530" y2="220" stroke="#a63c2e" stroke-width="2.6"/>' +
        lab(340, 130, '公园晨练', 16, '#a63c2e'),
        '全民健身，健康中国');
    },
    'sc-honesty': function () {
      return sceneWrap(
        person(250, 320, '#3b5bdb') + person(430, 320, '#a63c2e') +
        '<line x1="290" y1="252" x2="390" y2="252" stroke="' + INK + '" stroke-width="3"/>' + // 握手
        '<path d="M300 260 q20 14 40 0" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        lab(340, 150, '诚信是立身之本', 16, '#a63c2e') +
        '<rect x="250" y="180" width="180" height="34" rx="17" fill="#e6efe9" stroke="#1f6f5c" stroke-width="1.6"/><text x="340" y="202" text-anchor="middle" font-size="14" fill="#1f6f5c">一诺千金</text>',
        '诚信，一诺千金');
    },
    'sc-cooperate': function () {
      return sceneWrap(
        person(230, 330, '#3b5bdb') + person(450, 330, '#a63c2e') +
        '<line x1="230" y1="256" x2="280" y2="230" stroke="#3b5bdb" stroke-width="2.6"/><line x1="450" y1="256" x2="400" y2="230" stroke="#a63c2e" stroke-width="2.6"/>' +
        '<rect x="260" y="196" width="160" height="34" rx="4" fill="#f2eee4" stroke="' + INK + '" stroke-width="2.6"/>' + // 抬的木箱
        '<line x1="280" y1="230" x2="260" y2="196" stroke="' + INK + '" stroke-width="2.6"/><line x1="400" y1="230" x2="420" y2="196" stroke="' + INK + '" stroke-width="2.6"/>' +
        lab(340, 140, '团结合作力量大', 16, '#a63c2e') +
        '<text x="340" y="270" text-anchor="middle" font-size="13" fill="' + TEXT + '">1 + 1 &gt; 2</text>',
        '人心齐，泰山移');
    },
    'sc-dream': function () {
      return sceneWrap(
        person(330, 330, INK) +
        '<path d="M330 200 L360 150 L440 70 L430 130 L480 140 L390 190 Z" fill="#f3ead6" stroke="#a67c2e" stroke-width="2.4"/>' + // 火箭
        '<circle cx="398" cy="100" r="5" fill="#fa8c16"/><circle cx="430" cy="60" r="4" fill="#4c6ef5"/><circle cx="360" cy="50" r="3" fill="#13c2c2"/><circle cx="470" cy="90" r="3" fill="#722ed1"/>' +
        lab(340, 120, '追逐梦想', 16, '#a63c2e') +
        '<text x="340" y="262" text-anchor="middle" font-size="13" fill="' + TEXT + '">梦想有多远，我们就能走多远</text>',
        '心之所向，素履以往');
    }
  };

  function renderScene(id, caption) {
    var fn = SCENES[id];
    if (fn) return fn();
    return sceneWrap('<text x="340" y="200" text-anchor="middle" font-size="16" fill="#9a9183">（图画示意）</text>', caption);
  }

  /* 统一配图入口：chart(图表) / scene(示意画) / file(本地原图) */
  function renderImage(image) {
    if (!image) return '';
    if (image.chart) return renderChart(image.chart);
    if (image.scene) return renderScene(image.scene.id, image.scene.caption);
    if (image.file) return '<img src="' + esc(image.file) + '" alt="题目配图" style="width:100%;height:auto;border-radius:8px;display:block;background:#fdfbf4;"/>';
    return '';
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
    return {
      type: 'bar',
      title: subject + '变化趋势（模拟题）',
      unit: '%',
      labels: labels,
      series: [{ name: '指标值', values: values }]
    };
  }
  var THEME_SCENE = {
    '环境保护': ['sc-litter', '游客乱扔垃圾，湖面漂满废弃物'],
    '诚实守信': ['sc-honesty', '一诺千金，诚信为本'],
    '坚持不懈': ['sc-mountain', '坚持者终达顶峰'],
    '乐观心态': ['sc-optimism', '半杯水，乐观与悲观'],
    '团队合作': ['sc-cooperate', '团结协作，事半功倍'],
    '创新精神': ['sc-innovation', '创新海报：敢想敢做'],
    '多读书·读好书': ['sc-reading', '有书与读书，知行合一'],
    '孝敬父母·亲情陪伴': ['sc-elder', '你养我小，我陪你老'],
    '兴趣是最好的老师': ['sc-interest', '兴趣点亮梦想'],
    '养成好习惯': ['sc-habit', '好习惯，受益一生'],
    '体育锻炼·全民健身': ['sc-exercise', '全民健身，健康中国'],
    '追逐梦想': ['sc-dream', '心之所向，素履以往'],
    '文化交流与融合': ['sc-hotpot', '文化“火锅”，兼收并蓄'],
    '言传身教·榜样': ['sc-role-model', '父母是孩子最好的老师']
  };
  function mockScene(theme) {
    var m = THEME_SCENE[theme];
    return m ? { id: m[0], caption: m[1] } : { id: 'sc-dream', caption: '追逐梦想' };
  }

  window.App = window.App || {};
  window.App.charts = {
    renderChart: renderChart,
    renderScene: renderScene,
    renderImage: renderImage,
    mockChart: mockChart,
    mockScene: mockScene
  };
})();
