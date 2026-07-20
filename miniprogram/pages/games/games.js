// 游戏中心目录页（R6 §6）：分类 tab + 卡片流，数据来自 data/games.js（手工维护）。
const { CATS, GAMES } = require('../../data/games.js');
const { buildShare, buildTimeline } = require('../../utils/share.js');

Page({
  data: {
    cats: CATS,
    activeCat: 'all',
    list: GAMES,
    totalCount: GAMES.length,
    liveCount: GAMES.filter(function (g) { return g.live; }).length
  },

  onTabTap(e) {
    const cat = e.currentTarget.dataset.cat;
    const list = cat === 'all' ? GAMES : GAMES.filter(function (g) { return g.cat === cat; });
    this.setData({ activeCat: cat, list: list });
  },

  onGameTap(e) {
    const g = this.data.list[e.currentTarget.dataset.idx];
    if (!g || !g.live) {
      wx.showToast({ title: '小程序版在路上，网站版已可玩', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: g.page,
      fail() {
        wx.showToast({ title: '小程序版在路上，网站版已可玩', icon: 'none' });
      }
    });
  },

  onShareAppMessage() {
    return buildShare('一起玩的小游戏', '/pages/games/games');
  },

  onShareTimeline() {
    return buildTimeline('一起玩的小游戏', '');
  }
});
