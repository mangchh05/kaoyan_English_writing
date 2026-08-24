/* ============================================================
   data-meta.js — 作文框架、好词好句、评分标准、高频错误
   说明：范文与真题在 data-essays-*.js；此处为"方法/素材"类数据。
   ============================================================ */
window.APP_DATA_META = {
  /* ========== 作文框架 ========== */
  "frameworks": [
    {
      "id": "fw-picture",
      "type": "图画作文",
      "exam": "英语一（大作文）",
      "description": "图画作文标准三段式：描述图画 → 阐释寓意 → 发表评论。首段客观描图，中段升华寓意并联系现实，尾段表态与建议。",
      "wordTarget": "160–200 词",
      "parts": [
        {
          "title": "第一段 · 描述图画",
          "role": "用 2–3 句客观描述图画，点明主体与关键要素，不要展开议论",
          "template": "As is vividly depicted in the picture, 图中主体在做什么 + 配文/背景。",
          "sentences": [
            "As is vividly depicted in the cartoon, ...",
            "The picture portrays a thought-provoking scene in which ...",
            "In the foreground / background, ...",
            "The caption reads: \"...\""
          ]
        },
        {
          "title": "第二段 · 阐释寓意",
          "role": "揭示寓意，联系社会现实，可用举例 / 因果 / 对比论证",
          "template": "Evidently, the picture intends to convey that 寓意。It mirrors a widespread phenomenon that 现实联系。",
          "sentences": [
            "The picture conveys a profound message that ...",
            "What the cartoon intends to tell us is that ...",
            "This phenomenon is not uncommon in our daily life.",
            "The reasons behind it are as follows.",
            "For one thing, ...; for another, ..."
          ]
        },
        {
          "title": "第三段 · 评论 / 建议",
          "role": "表明态度、提出建议、升华主题（可提“从我做起”或社会层面）",
          "template": "In my view, 观点。We should 建议。Only in this way can 升华。",
          "sentences": [
            "From my perspective, ...",
            "It is high time that we took effective measures to ...",
            "Only by doing so can we ...",
            "Only in this way can ...",
            "As college students, we ought to ..."
          ]
        }
      ]
    },
    {
      "id": "fw-chart",
      "type": "图表作文",
      "exam": "英语二（大作文）",
      "description": "图表作文三段式：描述数据 → 分析原因 → 总结评论。首段客观转述图表趋势与占比，中段分析成因，尾段总结并展望。",
      "wordTarget": "约 150 词",
      "parts": [
        {
          "title": "第一段 · 描述图表",
          "role": "客观描述图表类型、总体趋势、最大值/关键数据，不议论",
          "template": "As is clearly shown in the chart, 数据总体趋势 + 关键数据。",
          "sentences": [
            "As is clearly shown in the chart, the number of ... rose steadily from ... to ...",
            "... accounted for the largest proportion, reaching ... percent.",
            "There was a sharp increase / decline in ... over the period.",
            "The figures indicate a remarkable growth trend.",
            "... witnessed a steady rise, peaking at ..."
          ]
        },
        {
          "title": "第二段 · 分析原因",
          "role": "解释数据变化背后的 2–3 点原因（经济、政策、观念、技术等）",
          "template": "Several factors account for this phenomenon. To begin with, 原因一。Moreover, 原因二。",
          "sentences": [
            "Several factors contribute to this phenomenon.",
            "To begin with, ...; moreover, ...; what's more, ...",
            "Thanks to the rapid economic development, ...",
            "The change of people's attitudes also plays a key role.",
            "This can be attributed to ..."
          ]
        },
        {
          "title": "第三段 · 总结评论",
          "role": "总结趋势，作简短评价或展望",
          "template": "From what has been discussed above, 总结。There is every reason to believe that 展望。",
          "sentences": [
            "From what has been analyzed above, we may safely draw the conclusion that ...",
            "This trend is likely to continue in the foreseeable future.",
            "There is every reason to believe that ...",
            "In a word, the phenomenon reflects ... and deserves our attention."
          ]
        }
      ]
    },
    {
      "id": "fw-argument",
      "type": "议论文（观点类）",
      "exam": "通用",
      "description": "观点类议论文：亮明立场 → 论证（正面 + 让步/反面）→ 总结。适合话题型写作。",
      "wordTarget": "150–200 词",
      "parts": [
        {
          "title": "第一段 · 提出观点",
          "role": "引入话题并明确表态",
          "template": "Nowadays, 话题 has become a heated topic. As far as I am concerned, 我的观点。",
          "sentences": [
            "Nowadays, ... has drawn wide public attention.",
            "As far as I am concerned, ...",
            "I am firmly convinced that ...",
            "There is no denying that ..."
          ]
        },
        {
          "title": "第二段 · 展开论证",
          "role": "给出 2–3 个论据，可加让步段增强说服力",
          "template": "On the one hand, 论据一。On the other hand, 论据二。Admittedly, 让步，but 反驳。",
          "sentences": [
            "On the one hand, ...; on the other hand, ...",
            "A case in point is that ...",
            "Admittedly, ..., but this does not mean ...",
            "What is more, ..."
          ]
        },
        {
          "title": "第三段 · 总结",
          "role": "重申立场、给出建议",
          "template": "In conclusion, 重申观点。It is advisable that 建议。",
          "sentences": [
            "In conclusion / To sum up, ...",
            "It is advisable that ...",
            "Therefore, we should attach great importance to ..."
          ]
        }
      ]
    },
    {
      "id": "fw-letter",
      "type": "书信（通用）",
      "exam": "英语一 / 英语二（小作文）",
      "description": "书信三段：称呼与写信目的 → 正文（功能句）→ 礼貌收尾与落款。语气得体、格式规范。",
      "wordTarget": "约 100 词",
      "parts": [
        {
          "title": "开头 · 称呼与目的",
          "role": "写称呼，一句话说明写信目的",
          "template": "Dear 称呼，I am writing to 写信目的。",
          "sentences": [
            "Dear Sir or Madam, / Dear Prof. Wang, / Dear Tom,",
            "I am writing to express my sincere gratitude for ...",
            "I am writing to apologize for ...",
            "I am writing to invite you to ...",
            "I am writing to seek some information about ..."
          ]
        },
        {
          "title": "正文 · 功能展开",
          "role": "根据信件类型补充细节（说明情况 / 提出请求 / 给出建议）",
          "template": "具体内容：说明理由、提供细节、表达期待。",
          "sentences": [
            "The reason is that ...",
            "I would appreciate it if you could ...",
            "What I intend to suggest is that ...",
            "Please accept my sincere apologies for any inconvenience caused."
          ]
        },
        {
          "title": "结尾 · 礼貌收尾",
          "role": "表达感谢/期待，落款签名",
          "template": "期待回信 + 敬语 + 署名。",
          "sentences": [
            "I am looking forward to your early reply.",
            "Thank you for your time and consideration.",
            "Yours sincerely, / Yours faithfully, / Best regards,",
            "Li Ming"
          ]
        }
      ]
    },
    {
      "id": "fw-notice",
      "type": "通知 / 告示",
      "exam": "英语一 / 英语二（小作文）",
      "description": "通知格式：标题 NOTICE → 正文（时间、地点、活动内容、要求）→ 落款（发布单位 + 日期）。",
      "wordTarget": "约 100 词",
      "parts": [
        {
          "title": "标题与开头",
          "role": "居中写 NOTICE，一句话说明活动",
          "template": "NOTICE\n为……现举办/举行……。",
          "sentences": [
            "A lecture / meeting / activity on ... will be held ...",
            "All the students are warmly welcome to take part.",
            "This notice is issued to inform you that ..."
          ]
        },
        {
          "title": "正文 · 时间地点要求",
          "role": "写清时间、地点、内容、注意事项",
          "template": "时间地点 + 活动内容 + 参加要求。",
          "sentences": [
            "It is to be held at ... on ...",
            "Those who are interested are requested to ...",
            "Please arrive on time and keep quiet."
          ]
        },
        {
          "title": "落款",
          "role": "发布单位 + 日期",
          "template": "落款单位 + 日期。",
          "sentences": [
            "The Students' Union",
            "The English Club"
          ]
        }
      ]
    },
    {
      "id": "fw-memo",
      "type": "备忘录 / 报告",
      "exam": "英语一 / 英语二（小作文）",
      "description": "备忘录格式：To / From / Date / Subject → 正文要点 → 结尾。语言简洁、条理清晰。",
      "wordTarget": "约 100 词",
      "parts": [
        {
          "title": "信头",
          "role": "To / From / Date / Subject 四要素",
          "template": "To: 收件人  From: 发件人  Date: 日期  Subject: 主题。",
          "sentences": [
            "To: All staff",
            "From: Li Ming",
            "Date: June 20, 2025",
            "Subject: ..."
          ]
        },
        {
          "title": "正文",
          "role": "分条说明要点（事项、原因、安排）",
          "template": "I am writing to inform you that ...",
          "sentences": [
            "I am writing to inform you that ...",
            "The main points are as follows.",
            "Please note that ..."
          ]
        },
        {
          "title": "结尾",
          "role": "感谢配合 / 提示",
          "template": "Thank you for your cooperation.",
          "sentences": [
            "Thank you for your cooperation.",
            "Should you have any questions, please do not hesitate to contact me."
          ]
        }
      ]
    }
  ],

  /* ========== 好词好句 ========== */
  "phrases": [
    { "id": "ph-edu-1", "category": "教育学习", "text": "Knowledge is power, but enthusiasm pulls the switch.", "translation": "知识就是力量，但热情才是开启它的开关。", "usage": "论证学习热情/兴趣的重要性", "tags": ["学习", "兴趣"] },
    { "id": "ph-edu-2", "category": "教育学习", "text": "Reading nourishes the mind just as food nourishes the body.", "translation": "阅读滋养心灵，正如食物滋养身体。", "usage": "读书话题开头或论证", "tags": ["读书"] },
    { "id": "ph-edu-3", "category": "教育学习", "text": "Education is not the filling of a pail, but the lighting of a fire.", "translation": "教育不是注满一桶水，而是点燃一把火。", "usage": "谈教育本质、启发式教学", "tags": ["教育"] },
    { "id": "ph-edu-4", "category": "教育学习", "text": "Lifelong learning has become an indispensable part of modern life.", "translation": "终身学习已成为现代生活不可或缺的一部分。", "usage": "学习/知识更新话题", "tags": ["终身学习"] },
    { "id": "ph-edu-5", "category": "教育学习", "text": "It is universally acknowledged that reading broadens our horizons.", "translation": "众所周知，阅读能开阔我们的视野。", "usage": "读书话题万能句", "tags": ["读书"] },
    { "id": "ph-edu-6", "category": "教育学习", "text": "Practice makes perfect, and perseverance paves the way to success.", "translation": "熟能生巧，坚持铺就成功之路。", "usage": "坚持/练习话题", "tags": ["坚持", "练习"] },

    { "id": "ph-env-1", "category": "环境保护", "text": "Environmental protection is not a slogan but an urgent mission for everyone.", "translation": "环境保护不是口号，而是每个人迫切的使命。", "usage": "环保话题点题", "tags": ["环保"] },
    { "id": "ph-env-2", "category": "环境保护", "text": "Only when we live in harmony with nature can sustainable development be achieved.", "translation": "只有与自然和谐相处，才能实现可持续发展。", "usage": "环保结尾升华（倒装）", "tags": ["环保", "倒装"] },
    { "id": "ph-env-3", "category": "环境保护", "text": "Every small eco-friendly act contributes to a greener planet.", "translation": "每一个小小的环保举动都能让地球更绿色。", "usage": "号召从我做起", "tags": ["环保"] },
    { "id": "ph-env-4", "category": "环境保护", "text": "We have borrowed the earth from our descendants rather than inherited it from our ancestors.", "translation": "地球是我们向后代借来的，而非从祖先那里继承的。", "usage": "环保责任的高分表达", "tags": ["环保", "责任"] },

    { "id": "ph-tech-1", "category": "科技网络", "text": "The Internet has transformed the way we communicate, work and learn.", "translation": "互联网改变了我们交流、工作和学习的方式。", "usage": "科技话题开头", "tags": ["互联网"] },
    { "id": "ph-tech-2", "category": "科技网络", "text": "While technology brings convenience, it may also erode face-to-face communication.", "translation": "科技带来便利的同时，也可能侵蚀面对面的交流。", "usage": "手机聚会/人际话题（让步）", "tags": ["科技", "人际"] },
    { "id": "ph-tech-3", "category": "科技网络", "text": "We should harness technology wisely instead of being enslaved by it.", "translation": "我们应明智地驾驭科技，而不是被它所奴役。", "usage": "科技双刃剑结尾", "tags": ["科技"] },
    { "id": "ph-tech-4", "category": "科技网络", "text": "Online resources have made knowledge more accessible than ever before.", "translation": "网络资源让知识比以往任何时候都更容易获取。", "usage": "数字阅读/在线学习", "tags": ["网络", "学习"] },

    { "id": "ph-cul-1", "category": "文化传统", "text": "Traditional culture is the root and soul of a nation.", "translation": "传统文化是一个民族的根与魂。", "usage": "传统文化话题点题", "tags": ["传统文化"] },
    { "id": "ph-cul-2", "category": "文化传统", "text": "Cultural exchanges promote mutual understanding among nations.", "translation": "文化交流促进各国之间的相互理解。", "usage": "文化融合/交流", "tags": ["文化交流"] },
    { "id": "ph-cul-3", "category": "文化传统", "text": "It is our duty to inherit and carry forward fine traditional culture.", "translation": "继承和弘扬优秀传统文化是我们的责任。", "usage": "传统文化结尾呼吁", "tags": ["传统文化", "责任"] },
    { "id": "ph-cul-4", "category": "文化传统", "text": "Only by cherishing our traditions can we embrace the future with confidence.", "translation": "只有珍视传统，我们才能自信地拥抱未来。", "usage": "文化自信（倒装）", "tags": ["文化", "倒装"] },

    { "id": "ph-soc-1", "category": "社会民生", "text": "The aging of the population has posed new challenges to society.", "translation": "人口老龄化给社会带来了新的挑战。", "usage": "养老/老龄化话题", "tags": ["老龄化"] },
    { "id": "ph-soc-2", "category": "社会民生", "text": "Rapid urbanization has reshaped the landscape of both cities and countryside.", "translation": "快速的城市化重塑了城市与乡村的面貌。", "usage": "城镇化话题", "tags": ["城镇化"] },
    { "id": "ph-soc-3", "category": "社会民生", "text": "A harmonious society is built on mutual trust and care.", "translation": "和谐社会建立在相互信任与关爱之上。", "usage": "社会和谐/人际", "tags": ["和谐"] },
    { "id": "ph-soc-4", "category": "社会民生", "text": "The steady rise in living standards reflects the fruits of reform and opening-up.", "translation": "生活水平的稳步提高反映了改革开放的成果。", "usage": "生活水平/消费升级", "tags": ["生活水平"] },

    { "id": "ph-life-1", "category": "人生哲理", "text": "Where there is a will, there is a way.", "translation": "有志者事竟成。", "usage": "坚持/志向话题", "tags": ["坚持", "意志"] },
    { "id": "ph-life-2", "category": "人生哲理", "text": "Opportunity favors the prepared mind.", "translation": "机会垂青有准备的人。", "usage": "准备/努力话题", "tags": ["机会"] },
    { "id": "ph-life-3", "category": "人生哲理", "text": "Attitude, rather than aptitude, determines altitude.", "translation": "决定高度的，是态度而非天资。", "usage": "乐观/态度话题", "tags": ["态度", "乐观"] },
    { "id": "ph-life-4", "category": "人生哲理", "text": "Every cloud has a silver lining.", "translation": "否极泰来；黑暗中总有一线光明。", "usage": "乐观/挫折话题", "tags": ["乐观", "挫折"] },
    { "id": "ph-life-5", "category": "人生哲理", "text": "Success belongs to those who persevere in the face of setbacks.", "translation": "成功属于那些在挫折面前坚持不懈的人。", "usage": "坚持话题结尾", "tags": ["坚持", "成功"] },
    { "id": "ph-life-6", "category": "人生哲理", "text": "Failure is the mother of success.", "translation": "失败乃成功之母。", "usage": "挫折/失败话题", "tags": ["失败"] },

    { "id": "ph-chart-1", "category": "图表描述", "text": "As is clearly shown in the chart, the number of ... rose steadily from ... to ...", "translation": "如图所示，……的数量从……稳步上升到……", "usage": "图表作文首段开头", "tags": ["图表", "趋势"] },
    { "id": "ph-chart-2", "category": "图表描述", "text": "... accounted for the largest proportion, reaching ... percent.", "translation": "……占比最大，达到了百分之……", "usage": "饼图/占比描述", "tags": ["图表", "占比"] },
    { "id": "ph-chart-3", "category": "图表描述", "text": "There was a sharp increase / decline in ... over the period.", "translation": "在此期间，……出现了急剧的上升/下降。", "usage": "趋势变化", "tags": ["图表", "趋势"] },
    { "id": "ph-chart-4", "category": "图表描述", "text": "... witnessed a steady rise, peaking at ...", "translation": "……稳步上升，在……达到峰值。", "usage": "数据趋势高分表达", "tags": ["图表", "峰值"] },
    { "id": "ph-chart-5", "category": "图表描述", "text": "The figures indicate a remarkable growth trend.", "translation": "这些数据表明了一个显著的增长趋势。", "usage": "图表总结句", "tags": ["图表", "总结"] },

    { "id": "ph-letter-1", "category": "书信功能句", "text": "I am writing to express my sincere gratitude for ...", "translation": "我写信是为了对……表达诚挚的感谢。", "usage": "感谢信开头", "tags": ["感谢信"] },
    { "id": "ph-letter-2", "category": "书信功能句", "text": "I am writing to apologize for ...", "translation": "我写信是为……表示歉意。", "usage": "道歉信开头", "tags": ["道歉信"] },
    { "id": "ph-letter-3", "category": "书信功能句", "text": "I am writing to invite you to ...", "translation": "我写信邀请你参加……", "usage": "邀请信开头", "tags": ["邀请信"] },
    { "id": "ph-letter-4", "category": "书信功能句", "text": "I am writing to seek some information about ...", "translation": "我写信想咨询关于……的信息。", "usage": "咨询信开头", "tags": ["咨询信"] },
    { "id": "ph-letter-5", "category": "书信功能句", "text": "I would appreciate it if you could ...", "translation": "如果您能……我将不胜感激。", "usage": "礼貌请求（各类信通用）", "tags": ["请求"] },
    { "id": "ph-letter-6", "category": "书信功能句", "text": "I am looking forward to your early reply.", "translation": "期待您的早日回复。", "usage": "书信结尾", "tags": ["结尾"] },
    { "id": "ph-letter-7", "category": "书信功能句", "text": "Please accept my sincere apologies for any inconvenience caused.", "translation": "由此造成的不便，请接受我诚挚的歉意。", "usage": "道歉信结尾", "tags": ["道歉信"] },

    { "id": "ph-gen-1", "category": "开头/结尾万能句", "text": "There is no denying that ... plays an increasingly vital role in our life.", "translation": "不可否认，……在我们的生活中发挥着越来越重要的作用。", "usage": "议论文万能开头", "tags": ["开头"] },
    { "id": "ph-gen-2", "category": "开头/结尾万能句", "text": "In conclusion, ... is not merely a matter of ..., but a cause that concerns us all.", "translation": "总之，……不仅关乎……，更是关系到我们所有人的事业。", "usage": "议论文万能结尾", "tags": ["结尾"] },
    { "id": "ph-gen-3", "category": "开头/结尾万能句", "text": "It is high time that we attached great importance to ...", "translation": "是我们该高度重视……的时候了。", "usage": "呼吁重视（虚拟语气）", "tags": ["呼吁"] },
    { "id": "ph-gen-4", "category": "开头/结尾万能句", "text": "Nothing is more important than to ...", "translation": "没有什么比……更重要了。", "usage": "强调重要性", "tags": ["强调"] }
  ],

  /* ========== 评分标准 ========== */
  "scoring": [
    { "id": "sc-1", "exam": "英语一", "part": "大作文（20分）", "band": "第五档", "range": "17–20 分", "criteria": "内容切题，思想表达清楚，结构严谨，语言流畅，用词丰富准确，句式多样，无明显语法错误。" },
    { "id": "sc-2", "exam": "英语一", "part": "大作文（20分）", "band": "第四档", "range": "13–16 分", "criteria": "内容较切题，表达较清楚，结构较清晰，语言基本流畅，有少量语法或用词错误但不影响理解。" },
    { "id": "sc-3", "exam": "英语一", "part": "大作文（20分）", "band": "第三档", "range": "9–12 分", "criteria": "基本切题，部分表达不够清楚，结构一般，语法与用词错误较多，但仍能传达主要意思。" },
    { "id": "sc-4", "exam": "英语一", "part": "大作文（20分）", "band": "第二档", "range": "5–8 分", "criteria": "内容有偏离，表达混乱，结构松散，语言错误较多，影响对内容的理解。" },
    { "id": "sc-5", "exam": "英语一", "part": "大作文（20分）", "band": "第一档", "range": "1–4 分", "criteria": "严重跑题，语言支离破碎，几乎无法有效表达思想。" },
    { "id": "sc-6", "exam": "英语二", "part": "大作文（15分）", "band": "第五档", "range": "13–15 分", "criteria": "内容切题，表达清楚，结构严谨，语言流畅，用词丰富，无明显错误。" },
    { "id": "sc-7", "exam": "英语二", "part": "大作文（15分）", "band": "第四档", "range": "10–12 分", "criteria": "内容较切题，表达较清楚，结构较清晰，有少量错误但不影响理解。" },
    { "id": "sc-8", "exam": "英语二", "part": "大作文（15分）", "band": "第三档", "range": "7–9 分", "criteria": "基本切题，部分表达不清，结构一般，错误较多但仍可理解大意。" },
    { "id": "sc-9", "exam": "英语二", "part": "大作文（15分）", "band": "第二档", "range": "4–6 分", "criteria": "内容有偏离，表达混乱，错误较多，影响理解。" },
    { "id": "sc-10", "exam": "英语二", "part": "大作文（15分）", "band": "第一档", "range": "1–3 分", "criteria": "严重跑题，几乎无法有效表达。" },
    { "id": "sc-11", "exam": "英语一 / 英语二", "part": "小作文（10分）", "band": "第五档", "range": "9–10 分", "criteria": "格式正确，内容完整，语言得体流畅，功能句到位，无重大错误。" },
    { "id": "sc-12", "exam": "英语一 / 英语二", "part": "小作文（10分）", "band": "第四档", "range": "7–8 分", "criteria": "格式基本正确，内容较完整，语言较得体，有少量错误。" },
    { "id": "sc-13", "exam": "英语一 / 英语二", "part": "小作文（10分）", "band": "第三档", "range": "5–6 分", "criteria": "格式有误，内容基本完整，错误较多但仍达意。" },
    { "id": "sc-14", "exam": "英语一 / 英语二", "part": "小作文（10分）", "band": "第二档", "range": "3–4 分", "criteria": "格式错误，内容不全，错误多，影响理解。" },
    { "id": "sc-15", "exam": "英语一 / 英语二", "part": "小作文（10分）", "band": "第一档", "range": "1–2 分", "criteria": "严重偏离要求，几乎无法有效表达。" }
  ],

  /* ========== 高频错误 ========== */
  "commonErrors": [
    { "id": "ce-1", "category": "中式英语", "wrong": "I very like reading.", "right": "I like reading very much.", "note": "very 不修饰动词，应说 like ... very much / really enjoy。" },
    { "id": "ce-2", "category": "中式英语", "wrong": "Although he is busy, but he helps me.", "right": "Although he is busy, he still helps me.", "note": "although 与 but 不可连用，二选一。" },
    { "id": "ce-3", "category": "中式英语", "wrong": "There are more and more people like reading e-books.", "right": "More and more people like reading e-books.", "note": "there be 与 like 主语重复，删去 there are。" },
    { "id": "ce-4", "category": "语法错误", "wrong": "He go to school every day.", "right": "He goes to school every day.", "note": "第三人称单数动词忘加 -s。" },
    { "id": "ce-5", "category": "语法错误", "wrong": "I have finished my homework yesterday.", "right": "I finished my homework yesterday.", "note": "有具体过去时间 yesterday，应用一般过去时而非现在完成时。" },
    { "id": "ce-6", "category": "语法错误", "wrong": "There is a lot of people.", "right": "There are a lot of people.", "note": "people 是复数名词，用 there are。" },
    { "id": "ce-7", "category": "语法错误", "wrong": "The number of students are increasing.", "right": "The number of students is increasing.", "note": "the number of 作主语时谓语用单数。" },
    { "id": "ce-8", "category": "语法错误", "wrong": "Reading books help us grow.", "right": "Reading books helps us grow.", "note": "动名词短语作主语，谓语用单数。" },
    { "id": "ce-9", "category": "语法错误", "wrong": "Everyone should do their best.", "right": "Everyone should do his or her best.", "note": "everyone 用单数代词（或改用 they/their 需谨慎，考试建议 his or her）。" },
    { "id": "ce-10", "category": "语法错误", "wrong": "I am looking forward to see you.", "right": "I am looking forward to seeing you.", "note": "look forward to 中 to 是介词，后接动名词。" },
    { "id": "ce-11", "category": "用词错误", "wrong": "He is a good cooker.", "right": "He is a good cook.", "note": "cook 是厨师，cooker 是炊具。" },
    { "id": "ce-12", "category": "用词错误", "wrong": "I want to improve my English level.", "right": "I want to improve my English.", "note": "improve 已含“提高”义，不必再加 level。" },
    { "id": "ce-13", "category": "用词错误", "wrong": "The price is expensive.", "right": "The price is high. / The book is expensive.", "note": "价格用 high/low，物品才用 expensive/cheap。" },
    { "id": "ce-14", "category": "用词错误", "wrong": "In my opinion, I think ...", "right": "In my opinion, ... / I think ...", "note": "两者语义重复，二选一。" },
    { "id": "ce-15", "category": "逻辑衔接", "wrong": "On the one hand ... . On the other hand, I disagree.", "right": "逻辑前后要对应，on the one hand / on the other hand 用于并列两个方面，不宜接转折结论。", "note": "注意衔接词与逻辑关系匹配。" },
    { "id": "ce-16", "category": "拼写", "wrong": "recieve, seperate, goverment", "right": "receive, separate, government", "note": "高频易错拼写：receive、separate、government、environment、necessary。" },
    { "id": "ce-17", "category": "拼写", "wrong": "it's (表所属时误用)", "right": "its（物主代词）", "note": "it's = it is / it has；its 才是“它的”。" },
    { "id": "ce-18", "category": "格式", "wrong": "书信漏称呼或落款", "right": "书信需有称呼、正文、结束语与署名（Li Ming）", "note": "小作文格式分很关键，漏项直接扣分。" }
  ]
};
