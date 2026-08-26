/* 原创模拟题库：参考公开考试主题与常见命题结构编写，不复制任何教材原文。 */
(function () {
  'use strict';
  var pictureFiles = {
    '环境责任': 'assets/mock-环境保护.png', '坚持与选择': 'assets/mock-坚持不懈.png',
    '阅读与成长': 'assets/mock-多读书·读好书.png', '榜样教育': 'assets/mock-言传身教·榜样.png'
  };
  var pThemes = ['环境责任','坚持与选择','阅读与成长','榜样教育','数字生活','文化传承','团队协作','健康生活','终身学习','公共文明'];
  var en1Big = pThemes.map(function (t, i) { return { id:'sim-en1-big-'+(i+1), exam:'英语一', part:'大作文', type:'图画作文', topic:t, title:'模拟图画：'+t, image:{file:pictureFiles[t] || pictureFiles['环境责任']}, text:'Directions: Write an essay of 160–200 words based on the picture.\n\nYour essay should:\n1) describe the picture;\n2) interpret its meaning;\n3) give your comments.' }; });
  var en2BigTopics = ['大学生运动习惯','数字阅读时长','社区志愿服务','绿色出行方式','博物馆参观人数','在线课程选择','居民健康支出','青年职业培训','城市公共文化','家庭储蓄结构'];
  var en2Big = en2BigTopics.map(function (t, i) { return { id:'sim-en2-big-'+(i+1), exam:'英语二', part:'大作文', type:'图表作文', topic:t, title:'模拟图表：'+t, chart:{type:i%2?'bar':'line', title:t+'变化趋势', unit:i%3?'%':'万人次', labels:['2019','2020','2021','2022','2023'], series:[{name:t, values:[28+i,35+i,43+i,52+i,61+i]}]}, text:'Directions: Write an essay of about 150 words based on the chart.\n\nYour essay should:\n1) describe the information shown in the chart;\n2) analyze the reasons;\n3) give your comments.' }; });
  var smallSituations = ['给学弟学妹介绍高效英语复习方法','邀请外籍教师参加校园文化节','向图书馆反馈自习室座位问题','感谢朋友在备考期间的帮助','向社团负责人申请参加志愿活动','向商家投诉收到的学习用品有质量问题','向学校咨询研究生英语讲座安排','向同学道歉并解释未能参加聚会','向教授推荐一位优秀的项目成员','向交换生朋友介绍中国传统节日'];
  var en1Small = smallSituations.map(function (s, i) { return { id:'sim-en1-small-'+(i+1), exam:'英语一', part:'小作文', type:'书信', topic:s, title:'模拟书信：'+s, text:'Directions: Write an email of about 100 words to the relevant person about the following situation:\n\n'+s+'。\n\nDo not sign your own name. Use “Li Ming” instead.' }; });
  var notices = ['校园英语演讲比赛报名通知','图书馆闭馆维护通知','研究生经验分享会通知','校园旧书交换活动通知','志愿者招募通知','英语角主题活动通知','期末学习互助小组通知','校园环保倡议通知','宿舍安全检查通知','英语写作训练营通知'];
  var en2Small = notices.map(function (s, i) { return { id:'sim-en2-small-'+(i+1), exam:'英语二', part:'小作文', type:i%2?'通知':'书信', topic:s, title:'模拟应用文：'+s, text:'Directions: Write an English notice of about 100 words for your university students about the following event:\n\n'+s+'。\n\nInclude the time, place, purpose and contact information.' }; });
  window.APP_DATA_SIMULATIONS = en1Big.concat(en2Big, en1Small, en2Small);
})();
