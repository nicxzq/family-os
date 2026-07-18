const { getStory } = require('../../data/stories.js');

Page({
  data: {
    story: null,
    current: 0,
    total: 0,
    playIdx: -1,   // 正在播放动画的页
    bubbleIdx: -1  // 正在显示气泡的页
  },

  onLoad(options) {
    const story = getStory(options.id);
    if (!story || !story.pages) {
      wx.showToast({ title: '这本绘本还没上架', icon: 'none' });
      setTimeout(function () { wx.navigateBack(); }, 1200);
      return;
    }
    wx.setNavigationBarTitle({ title: story.title });
    this.setData({ story: story, total: story.pages.length });
    const read = wx.getStorageSync('fo_read_stories') || {};
    read[options.id] = { t: story.title, ts: Date.now() };
    wx.setStorageSync('fo_read_stories', read);
  },

  onSwiper(e) {
    this.clearTimers();
    this.setData({ current: e.detail.current, playIdx: -1, bubbleIdx: -1 });
  },

  // 点插图：播放一次性动画 + 弹语音气泡（迁移网页 makeInteractive 效果）
  tapArt(e) {
    const i = e.currentTarget.dataset.i;
    const page = this.data.story.pages[i];
    if (!page || !page.fx) return;
    this.clearTimers();
    this.setData({ playIdx: i, bubbleIdx: i });
    const that = this;
    this._animT = setTimeout(function () { that.setData({ playIdx: -1 }); }, 700);
    this._bubbleT = setTimeout(function () { that.setData({ bubbleIdx: -1 }); }, 1400);
  },

  clearTimers() {
    if (this._animT) clearTimeout(this._animT);
    if (this._bubbleT) clearTimeout(this._bubbleT);
  },

  onUnload() {
    this.clearTimers();
  }
});
