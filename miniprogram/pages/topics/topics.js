const { TOPICS, THEMES_ORDER, weekOfYear } = require('../../data/topics.js');

Page({
  data: {
    topic: null,
    thisWeek: 1,
    current: 0,
    total: TOPICS.length,
    themeBlocks: []
  },

  onLoad() {
    const thisWeek = weekOfYear();
    this.setData({
      thisWeek: thisWeek,
      themeBlocks: THEMES_ORDER.map(function (theme) {
        return {
          theme: theme,
          topics: TOPICS.filter(function (t) { return t.theme === theme; })
        };
      })
    });
    this.render(thisWeek - 1);
  },

  render(idx) {
    if (idx < 0 || idx >= TOPICS.length) return;
    this.setData({ current: idx, topic: TOPICS[idx] });
  },

  prev() {
    this.render(this.data.current - 1);
    wx.pageScrollTo({ scrollTop: 0 });
  },

  next() {
    this.render(this.data.current + 1);
    wx.pageScrollTo({ scrollTop: 0 });
  },

  pick(e) {
    this.render(e.currentTarget.dataset.w - 1);
    wx.pageScrollTo({ scrollTop: 0 });
  }
});
