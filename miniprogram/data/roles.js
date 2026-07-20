// 四个角色 —— home / role / mine 三页共用（手工维护）
const ROLES = [
  { id: 'parents', name: '爸爸妈妈', color: 'coral', tag: '父母的原则', desc: '不焦虑，也不躺平。一份温和、清醒的父母共读页。' },
  { id: 'eldest', name: '老大', color: 'yellow', tag: '读本 + 暑期计划', desc: '28 篇成长读本，每篇一个值得想清楚的概念；还有暑假打卡。' },
  { id: 'youngest', name: '老二', color: 'green', tag: '毛毛绘本', desc: '每周一本。大字、图多、可朗读。' },
  { id: 'family', name: '爷爷奶奶和朋友', color: 'blue', tag: '三个故事', desc: '不讲道理，只讲三个真实的家庭故事。' }
];

function getRole(id) {
  for (var i = 0; i < ROLES.length; i++) {
    if (ROLES[i].id === id) return ROLES[i];
  }
  return null;
}

module.exports = { ROLES, getRole };
