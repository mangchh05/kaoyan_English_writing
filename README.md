# 考研英语写作训练与批改系统

一个**纯静态**、可离线打开、可直接托管到 GitHub Pages 的考研英语（英语一 / 英语二）写作一站式训练平台。

> 双击 `index.html` 即可使用（无需安装、无需服务器、无需构建）。数据以 JS 文件形式随仓库一起版本管理。

## 功能总览

| 模块 | 说明 |
| --- | --- |
| 主页 | 学习驾驶舱（今日时长、学习日、近 12 周热力矩阵）+ **固定模拟题库**（英一/英二大作文、小作文各 10 题）+ 真题抽题 |
| 真题库 | 2010–2025 英语一、英语二大作文 + 8 篇小作文，含**题目、配图、范文、要点拆解**（结构/核心词汇/好句/提示），支持按考试类型/题型/年份/关键词检索 |
| AI 批改 | 上传 **Word(.docx)** 或粘贴作文，调用大模型评分与批改；**批改时自动结合本站评分标准与该题要点**；本地即时统计词数/句子/词汇丰富度；批改历史存档 |
| 范文背诵 | 范文**完整 / 挖空 / 遮挡句子 / 逐段**四种背诵模式 + 背诵打卡；**好词好句**按 9 大话题分类，可收藏 |
| 作文框架 | 图画作文、图表作文、议论文、书信、通知、备忘录 6 类框架 + 段落模板 + 万能句型（可一键复制） |
| 写作指南 | 考研英语写作**评分标准**（英语一/英语二/小作文各 5 档）+ **高频错误**对照纠正 |
| 数据管理 | **输入口**：配置模型设置、录入/编辑/删除真题范文与好词好句；导入/导出 JSON；导出可直接提交 git 的真题 JS 文件 |

**配图能力**：英语一 2010–2024 真题已绑定项目内 `kaoyan_english_cartoon/` 原图；图表作文继续使用按公开真题数据复刻的 SVG 图表；模拟题库已替换为用户提供的本地资料包 30 篇（英一 15 篇、英二 15 篇），配套图片已复制到 `assets/simulations/`。模拟题不再依赖 AI 随机生成。

**资料导入**：用户提供的好词好句 Word 汇总已转换为 `js/data-phrases-imported.js`，与原有素材合并展示，共导入 235 条可检索内容。

**学习记录**：学习驾驶舱自动统计页面可见期间的在线时长，并以近 12 周热力矩阵展示，颜色越深表示当天学习时间越长；无需手动填写或添加时长。

**界面设计**：采用内容优先的 AI 工作台风格：深色侧栏、浅色内容区、克制的绿色主色、宽松留白和清晰卡片层级，适合长时间学习使用。

## 快速开始

### 方式一：本地直接打开
双击项目根目录的 `index.html`，浏览器打开即可。所有功能（除 AI 批改需联网调用 API 外）均可离线使用。

### 方式二：部署到 GitHub Pages
1. 把本文件夹推送到 GitHub 仓库：
   ```bash
   git add -A
   git commit -m "init: 考研英语写作训练系统"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```
2. 在 GitHub 仓库 `Settings → Pages` 中，把 Source 选为 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`，保存。
3. 几分钟后访问 `https://<你的用户名>.github.io/<仓库名>/` 即可（手机 / 电脑均可）。

## AI 批改配置

批改功能调用 **OpenAI 兼容接口**，密钥只保存在你本地浏览器（localStorage），不上传任何服务器。

1. 进入「数据管理」页面，在**模型设置（AI 批改使用）**中：
   - 选择服务商（推荐 **DeepSeek** 或 **SiliconFlow**，浏览器直连稳定）；
   - 填写 **API Key**、**Base URL**、**模型名**；
   - **温度**（0–2）控制回答随机度：越低越稳定、越标准，越高越有创意，批改建议 0.3；
   - 点「保存设置」。
2. 回到「AI 批改」页，上传/粘贴作文，点「开始 AI 批改」。
3. 若从「主页 → 模拟出题」或「真题库」点击「带着这题去批改 / 就这题练习批改」，批改页会自动展示**完整题目与配图**，且批改会结合该题的评分标准与要点。

常用服务商（OpenAI 兼容）：

| 服务商 | Base URL | 示例模型 |
| --- | --- | --- |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| SiliconFlow | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3` |
| Moonshot/Kimi | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-flash` |

> 若某服务商报 CORS 错误，说明其禁止浏览器直连，请改用 DeepSeek / SiliconFlow。

## AI 绘图配置（图画题配图）

图画作文的配图通过 **OpenAI 兼容的文生图接口**（`/images/generations`）生成，Key 只保存在本地浏览器。

1. 进入「数据管理」页，在 **AI 绘图设置（图画题配图）** 中选择绘图服务商（推荐 **SiliconFlow 硅基流动**，浏览器直连稳定，`black-forest-labs/FLUX.1-schnell` 速度快），填写 **API Key** 与模型，保存。
2. 打开任意图画题（真题库详情 / 模拟出题 / 批改页题目卡片），点「**AI 生成本题图画**」，稍候即可看到生成的图画；结果缓存在本机，可随时「重新生成」。
3. 如需永久使用某张生成图，右键图片另存为放入 `images/` 目录，并把该真题的配图改为 `{ "file": "images/xxx.png" }`。

常用绘图服务商：

| 服务商 | Base URL | 示例模型 |
| --- | --- | --- |
| SiliconFlow | `https://api.siliconflow.cn/v1` | `black-forest-labs/FLUX.1-schnell` |
| 智谱 CogView | `https://open.bigmodel.cn/api/paas/v4` | `cogview-3-flash` |
| OpenAI DALL·E | `https://api.openai.com/v1` | `dall-e-3` |

## 如何更新 / 维护数据

数据以 JS 文件存放，均可用「数据管理」页维护，或直接编辑文件后 git 提交。

### 真题与范文（题目 / 配图 / 要点）
- `js/data-essays-en1.js`（英语一大作文）、`js/data-essays-en2.js`（英语二大作文）、`js/data-essays-xiao.js`（小作文）。
- **配图数据**：`js/data-images-charts.js`（真题图表数据）、`js/data-images-scenes.js`（图画场景标注）。
- 网页即时维护：在「数据管理」页用表单新增/编辑/删除，改动存浏览器 localStorage（换设备/清缓存会丢），可用「导出 JSON」备份。
- 长期版本化（推荐）：在「数据管理」页点「导出三份真题 JS 文件」覆盖 `js/` 下同名文件，或直接编辑数据文件，然后 `git commit` + `push`。

### 好词好句 / 框架 / 评分标准 / 高频错误
- 文件：`js/data-meta.js`（含 `phrases`、`frameworks`、`scoring`、`commonErrors` 四部分）。
- 好词好句可在「数据管理」页维护；框架等建议直接编辑 `js/data-meta.js`。

### 配图数据说明
- 真题配图支持三种形式（在对应真题的 `image` 字段中任选其一）：
  1. **图表复刻**：`{ "chart": { "type": "bar", "title": "...", "unit": "...", "labels": [...], "series": [{"name":"...","values":[...]}] } }`（饼图用 `data` 数组）；
  2. **AI 生成图画**：`{ "scene": { "prompt": "（英文绘图提示词）", "caption": "图画内容描述" } }` —— 页面会显示「AI 生成本题图画」按钮，点击后调用你配置的文生图接口生成；
  3. **本地原图**：`{ "file": "kaoyan_english_cartoon/2015_手机时代的聚会.jpg" }` —— 真题图片已按年份/主题绑定在 `js/data-images-scenes.js` 中；
  4. **模拟题预置图**：`assets/mock-*.png` —— 主页模拟图画题直接引用，未单独配置的主题使用通用练习插画兜底。

### 数据结构示例（真题）
```js
window.APP_DATA_EN1 = [
  {
    "id": "en1-2010",
    "exam": "英语一", "part": "大作文", "type": "图画作文", "year": 2010,
    "title": "文化“火锅”，既美味又营养",
    "prompt": "（题目原文 + 写作要求）",
    "topicTags": ["文化融合", "文化交流"],
    "modelEssay": "（英文范文，段落间用 \n\n 分隔）",
    "keyPoints": { "structure": ["首段：…", "中段：…", "尾段：…"], "keywords": ["…"], "goodSentences": ["…"], "notes": "…" },
    "framework": "图画作文"
  }
];
```

## 目录结构

```
考研英语定制化/
├── index.html                # 应用入口（单页应用）
├── css/style.css             # 样式（纸墨书卷 · 学术风）
├── assets/                   # 用户资料包中的模拟题配图
│   └── simulations/          # 30 篇模拟题对应的 14 张图片
├── kaoyan_english_cartoon/   # 2010–2024 英语一真题原图
├── js/
│   ├── app.js                # 路由 + 导航 + SVG 图标 + UI 工具
│   ├── store.js              # 数据合并 + localStorage 持久化
│   ├── charts.js             # SVG 图表 / 图画场景渲染引擎
│   ├── data-meta.js          # 框架 / 好词好句 / 评分标准 / 高频错误
│   ├── data-phrases-extra.js # 好词好句扩充素材库
│   ├── data-essays-en1.js    # 英语一大作文真题范文
│   ├── data-essays-en2.js    # 英语二大作文真题范文
│   ├── data-essays-xiao.js   # 小作文真题范文
│   ├── data-images-charts.js # 真题图表数据
│   ├── data-images-scenes.js # 真题图画场景标注
│   ├── quiz.js               # 主页 + 本地固定模拟题抽题
│   ├── data-simulations-source.js # 用户资料包导入的 30 篇模拟题
│   ├── data-phrases-imported.js   # 用户 Word 汇总导入的好词好句
│   ├── library.js            # 真题库
│   ├── correction.js         # AI 批改 + docx 解析 + 本地统计
│   ├── memorize.js           # 范文背诵 + 好词好句
│   ├── framework.js          # 作文框架库
│   ├── guide.js              # 写作指南
│   └── admin.js              # 数据管理（输入口 + 模型设置）
└── libs/mammoth.browser.min.js  # .docx 解析库（本地化）
```

## 说明与免责

- **题目**：真题题目依据公开资料整理，请以官方真题为准；2025 年英语一大作文题型由图画调整为图表，本站已按此收录。
- **配图**：真题图表按公开数据**近似复刻**（数值贴近公开资料）；图画作文由 **AI 文生图**按题目的英文提示词生成（非真题原图，原图版权归考试命题方），生成质量取决于所选绘图服务商。如需与真题完全一致的原图，请将原图放入 `images/` 目录并在对应真题的 `image.file` 中引用。
- **范文**：范文为本站撰写的高分参考范文（非官方答案），用于学习借鉴。
- **AI 批改**：使用通用大模型（非本站数据训练），批改时会将评分标准与该题要点注入提示词，使评分尺度与本站一致。
- **数据安全**：学习进度、收藏、批改历史、API 密钥均保存在浏览器 localStorage；换浏览器/清缓存会丢失，重要内容请用「数据管理 → 导出 JSON」备份。
