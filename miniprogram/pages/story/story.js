const { getStory, CATALOG } = require('../../data/stories.js');
const { buildShare, buildTimeline } = require('../../utils/share.js');

function buildStoryOrder() {
  const list = [];
  CATALOG.forEach(function (s) {
    if (s.available) list.push({ id: s.id, title: s.title });
  });
  return list;
}

Page({
  data: {
    story: null,
    current: 0,
    total: 0,
    playIdx: -1,   // 正在播放动画的页
    bubbleIdx: -1, // 正在显示气泡的页
    prevStory: null,
    nextStory: null
  },

  onLoad(options) {
    this.id = options.id;
    const story = getStory(options.id);
    if (!story || !story.pages) {
      wx.showToast({ title: '这本绘本还没上架', icon: 'none' });
      setTimeout(function () { wx.navigateBack(); }, 1200);
      return;
    }
    wx.setNavigationBarTitle({ title: story.title });
    const order = buildStoryOrder();
    let idx = -1;
    for (let i = 0; i < order.length; i++) {
      if (order[i].id === options.id) { idx = i; break; }
    }
    this.setData({
      story: story,
      total: story.pages.length,
      prevStory: idx > 0 ? order[idx - 1] : null,
      nextStory: idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
    });
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
  },

  goPrevStory() {
    if (!this.data.prevStory) return;
    wx.redirectTo({ url: '/pages/story/story?id=' + this.data.prevStory.id });
  },

  goNextStory() {
    if (!this.data.nextStory) return;
    wx.redirectTo({ url: '/pages/story/story?id=' + this.data.nextStory.id });
  },

  onShareAppMessage() {
    return buildShare(
      this.data.story ? this.data.story.title : '毛毛绘本',
      '/pages/story/story?id=' + this.id
    );
  },

  onShareTimeline() {
    return buildTimeline(this.data.story ? this.data.story.title : '毛毛绘本', 'id=' + this.id);
  }
});
