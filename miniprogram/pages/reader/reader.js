const { getReader } = require('../../data/readers.js');

Page({
  data: {
    piece: null,
    reflectOpen: {},
    actionDone: false
  },

  onLoad(options) {
    const piece = getReader(options.id);
    if (!piece) {
      wx.showToast({ title: '这篇还没上架', icon: 'none' });
      setTimeout(function () { wx.navigateBack(); }, 1200);
      return;
    }
    wx.setNavigationBarTitle({ title: piece.title });
    this.setData({ piece: piece });
    const read = wx.getStorageSync('fo_read_readers') || {};
    read[options.id] = { t: piece.title, ts: Date.now() };
    wx.setStorageSync('fo_read_readers', read);
  },

  toggleReflect(e) {
    const idx = e.currentTarget.dataset.idx;
    const key = 'reflectOpen[' + idx + ']';
    const patch = {};
    patch[key] = !this.data.reflectOpen[idx];
    this.setData(patch);
  },

  markAction() {
    this.setData({ actionDone: true });
  }
});
