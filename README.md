# 考研英语写作训练与批改系统

一个**纯静态**、可离线打开、可直接托管到 GitHub Pages 的考研英语（英语一 / 英语二）写作一站式训练平台。

> 双击 `index.html` 即可使用（无需安装、无需服务器、无需构建）。数据以 JS 文件形式随仓库一起版本管理。

## ✨ 功能总览

| 模块 | 说明 |
| --- | --- |
| 🏠 主页 | 数据概览 + **模拟出题**（图画/图表/书信/通知随机或指定）+ 真题抽题 + 快速入口 |
| 📖 真题库 | 2010–2025 英语一、英语二大作文 + 8 篇小作文，含**题目、范文、要点拆解**（结构/核心词汇/好句/提示），支持按考试类型/题型/年份/关键词检索 |
| ✍️ AI 批改 | 上传 **Word(.docx)** 或粘贴作文，调用大模型评分与批改；本地即时统计词数/句子/词汇丰富度；批改历史存档 |
| 🧠 范文背诵 | 范文**完整 / 挖空 / 遮挡句子 / 逐段**四种背诵模式 + 打卡；**好词好句**按 9 大话题分类，可收藏 |
| 🧱 作文框架 | 图画作文、图表作文、议论文、书信、通知、备忘录 6 类框架 + 段落模板 + 万能句型（可一键复制） |
| 📋 写作指南 | 考研英语写作**评分标准**（英语一/英语二/小作文各 5 档）+ **高频错误**对照纠正 |
| ⚙️ 数据管理 | **输入口**：录入/编辑/删除真题范文与好词好句；导入/导出 JSON；导出可直接提交 git 的真题 JS 文件 |

## 🚀 快速开始

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
3. 几分钟后访问 `https://<你的用户名>.github.io/<仓库名>/` 即可。

## 🔑 AI 批改配置

批改功能调用 **OpenAI 兼容接口**，密钥只保存在你本地浏览器（localStorage），不上传任何服务器。

1. 进入「✍️ AI 批改」页面。
2. 在「模型设置」中选择服务商（推荐 **DeepSeek** 或 **SiliconFlow**，浏览器直连稳定），填写 **API Key**、Base URL 与模型名，点「保存设置」。
3. 上传/粘贴作文，点「开始 AI 批改」。

常用服务商（OpenAI 兼容）：

| 服务商 | Base URL | 示例模型 |
| --- | --- | --- |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| SiliconFlow | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3` |
| Moonshot/Kimi | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-flash` |

> 若某服务商报 CORS 错误，说明其禁止浏览器直连，请改用 DeepSeek / SiliconFlow。

## 📝 如何更新 / 维护数据

数据分两类文件存放，均有两种维护方式。

### 真题与范文
- 文件：`js/data-essays-en1.js`（英语一大作文）、`js/data-essays-en2.js`（英语二大作文）、`js/data-essays-xiao.js`（小作文）。
- **网页即时维护**：在「⚙️ 数据管理」页用表单新增/编辑/删除，改动存浏览器 localStorage（换设备/清缓存会丢）。
- **长期版本化维护（推荐）**：两种做法——
  1. 直接在代码编辑器里编辑上述三个 `data-essays-*.js` 文件；
  2. 或在网页维护后点「导出三份真题 JS 文件」，把下载的三个文件覆盖 `js/` 下同名文件。
  完成后 `git commit` 并 `push`。

### 好词好句 / 框架 / 评分标准 / 高频错误
- 文件：`js/data-meta.js`（含 `phrases`、`frameworks`、`scoring`、`commonErrors` 四部分）。
- 好词好句可在「⚙️ 数据管理」页维护；框架等建议直接编辑 `js/data-meta.js`。

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
    "keyPoints": {
      "structure": ["首段：…", "中段：…", "尾段：…"],
      "keywords": ["…"], "goodSentences": ["…"], "notes": "…"
    },
    "framework": "图画作文"
  }
];
```

## 📁 目录结构

```
考研英语定制化/
├── index.html              # 应用入口（单页应用）
├── css/style.css           # 样式
├── js/
│   ├── app.js              # 路由 + 导航 + UI 工具
│   ├── store.js            # 数据合并 + localStorage 持久化
│   ├── data-meta.js        # 框架 / 好词好句 / 评分标准 / 高频错误
│   ├── data-essays-en1.js  # 英语一大作文真题范文
│   ├── data-essays-en2.js  # 英语二大作文真题范文
│   ├── data-essays-xiao.js # 小作文真题范文
│   ├── quiz.js             # 主页 + 模拟出题
│   ├── library.js          # 真题库
│   ├── correction.js       # AI 批改 + docx 解析 + 本地统计
│   ├── memorize.js         # 范文背诵 + 好词好句
│   ├── framework.js        # 作文框架库
│   ├── guide.js            # 写作指南
│   └── admin.js            # 数据管理（输入口）
└── libs/mammoth.browser.min.js  # .docx 解析库（本地化）
```

## ⚠️ 说明与免责

- **题目**：真题题目依据公开资料整理，请以官方真题为准；2025 年英语一大作文题型由图画调整为图表，本站已按此收录。
- **范文**：范文为本站撰写的高分参考范文（非官方答案），用于学习借鉴。
- **数据安全**：所有学习进度、收藏、批改历史、API 密钥均保存在浏览器 localStorage，属本地数据；换浏览器/清缓存会丢失，重要内容请用「数据管理 → 导出 JSON」备份。
