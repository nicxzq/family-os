// 科学 · 化学厨房 —— 移植自网站 games/g21-chemistry.html。8 个元素 + 8 组反应配方
// 全部照搬自源实现的 ELEMENTS / RECIPES（源游戏本身规模已经很小，未做删减）。
// 玩法简化为纯 view 的"选元素卡片 → 合成 → 看反应结果"，去掉源页面的拖拽/动画细节。
// 源游戏没有星级，这里用"未命中次数"换算 1-3 星：全部发现时 0 次误配 3 星，
// 1-3 次 2 星，4 次及以上 1 星（与 multi.js 的评星方式一致）。
const { buildShare, buildTimeline } = require('../../../utils/share.js');

const GAME_ID = 'g21-chemistry';

const ELEMENTS = [
  { sym: 'H', num: 1, name: '氢' },
  { sym: 'O', num: 8, name: '氧' },
  { sym: 'C', num: 6, name: '碳' },
  { sym: 'N', num: 7, name: '氮' },
  { sym: 'Na', num: 11, name: '钠' },
  { sym: 'Cl', num: 17, name: '氯' },
  { sym: 'Ca', num: 20, name: '钙' },
  { sym: 'Fe', num: 26, name: '铁' }
];

// key = 元素符号排序后用 '+' 连接，与源实现的 makeKey 规则一致
const RECIPES = {
  'H+O': { name: '水', formula: 'H₂O', emoji: '🌊', fact: '你发现了水！地球 70% 都是它，生命之源。' },
  'Cl+Na': { name: '食盐', formula: 'NaCl', emoji: '🧂', fact: '你发现了盐！厨房里最重要的调味料，也是维持生命的电解质。' },
  'C+O': { name: '二氧化碳', formula: 'CO₂', emoji: '🫧', fact: '你发现了二氧化碳！植物用它来光合作用生长，我们呼出的就是它。' },
  'Ca+O': { name: '氧化钙', formula: 'CaO', emoji: '🏛️', fact: '你发现了石灰！古代建筑的黏合剂，遇水会剧烈放热。' },
  'H+N': { name: '氨气', formula: 'NH₃', emoji: '💊', fact: '你发现了氨！很多化肥都含有它，农业生产不可缺少。' },
  'Fe+O': { name: '氧化铁', formula: 'Fe₂O₃', emoji: '🦺', fact: '你发现了铁锈！铁遇到湿气和氧气就会生锈，这是氧化反应。' },
  'C+H': { name: '甲烷', formula: 'CH₄', emoji: '🔥', fact: '你发现了甲烷！天然气的主要成分，也是沼气的来源。' },
  'N+O': { name: '二氧化氮', formula: 'NO₂', emoji: '⚡', fact: '你发现了二氧化氮！雷电能制造它，工业上用来制造硝酸。' }
};
const TOTAL_RECIPES = Object.keys(RECIPES).length;

function makeKey(syms) {
  return syms.slice().sort().join('+');
}

function saveStars(stars) {
  const all = wx.getStorageSync('fo_game_stars') || {};
  if (!all[GAME_ID] || all[GAME_ID] < stars) all[GAME_ID] = stars;
  wx.setStorageSync('fo_game_stars', all);
}

Page({
  data: {
    elements: ELEMENTS,
    totalRecipes: TOTAL_RECIPES,
    selected: [],
    selectedDisplay: '已选：无',
    resultMsg: '',
    resultOk: false,
    discoveries: [],
    discoveredCount: 0
  },

  onLoad() {
    this.discovered = {};
    this.misses = 0;
  },

  toggleElem(e) {
    const sym = e.currentTarget.dataset.sym;
    const selected = this.data.selected.slice();
    const idx = selected.indexOf(sym);
    if (idx >= 0) selected.splice(idx, 1);
    else selected.push(sym);
    this.setData({
      selected: selected,
      selectedDisplay: selected.length ? '已选：' + selected.join(' + ') : '已选：无'
    });
  },

  clearSelection() {
    this.setData({ selected: [], selectedDisplay: '已选：无', resultMsg: '' });
  },

  synthesize() {
    const selected = this.data.selected;
    if (selected.length < 2) {
      this.setData({ resultMsg: '请至少选择两种元素再合成！', resultOk: false });
      return;
    }
    const key = makeKey(selected);
    const recipe = RECIPES[key];
    if (!recipe) {
      this.misses++;
      this.setData({ resultMsg: '❓ 这个组合还没发现！试试别的？（提示：从最简单的开始）', resultOk: false });
      return;
    }
    if (this.discovered[key]) {
      this.setData({
        resultMsg: '✅ ' + recipe.emoji + ' ' + recipe.name + '（' + recipe.formula + '）已经发现过啦！',
        resultOk: true
      });
      return;
    }
    this.discovered[key] = recipe;
    const discoveries = this.data.discoveries.concat([{
      key: key, name: recipe.name, formula: recipe.formula, emoji: recipe.emoji, fact: recipe.fact
    }]);
    this.setData({
      resultMsg: '🎉 ' + recipe.emoji + ' 成功！你发现了' + recipe.name + '（' + recipe.formula + '）！',
      resultOk: true,
      selected: [],
      selectedDisplay: '已选：无',
      discoveries: discoveries,
      discoveredCount: discoveries.length
    });
    if (discoveries.length >= TOTAL_RECIPES) this.finish();
  },

  finish() {
    const stars = this.misses === 0 ? 3 : (this.misses <= 3 ? 2 : 1);
    saveStars(stars);
  },

  onShareAppMessage() {
    return buildShare('化学厨房', '/pages/games/chem/chem');
  },

  onShareTimeline() {
    return buildTimeline('化学厨房', '');
  }
});
