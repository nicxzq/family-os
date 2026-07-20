const { getReader, GROUPS } = require('../../data/readers.js');
const { buildShare, buildTimeline } = require('../../utils/share.js');

function buildReaderOrder() {
  const list = [];
  GROUPS.forEach(function (g) {
    g.items.forEach(function (it) {
      if (it.id) list.push({ id: it.id, title: it.title });
    });
  });
  return list;
}

Page({
  data: {
    piece: null,
    reflectOpen: {},
    actionDone: false,
    prevPiece: null,
    nextPiece: null
  },

  onLoad(options) {
    this.id = options.id;
    const piece = getReader(options.id);
    if (!piece) {
      wx.showToast({ title: '这篇还没上架', icon: 'none' });
      setTimeout(function () { wx.navigateBack(); }, 1200);
      return;
    }
    wx.setNavigationBarTitle({ title: piece.title });
    const order = buildReaderOrder();
    let idx = -1;
    for (let i = 0; i < order.length; i++) {
      if (order[i].id === options.id) { idx = i; break; }
    }
    this.setData({
      piece: piece,
      prevPiece: idx > 0 ? order[idx - 1] : null,
      nextPiece: idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
    });
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
  },

  goPrev() {
    if (!this.data.prevPiece) return;
    wx.redirectTo({ url: '/pages/reader/reader?id=' + this.data.prevPiece.id });
  },

  goNext() {
    if (!this.data.nextPiece) return;
    wx.redirectTo({ url: '/pages/reader/reader?id=' + this.data.nextPiece.id });
  },

  onShareAppMessage() {
    return buildShare(
      this.data.piece ? this.data.piece.title : '成长读本',
      '/pages/reader/reader?id=' + this.id
    );
  },

  onShareTimeline() {
    return buildTimeline(this.data.piece ? this.data.piece.title : '成长读本', 'id=' + this.id);
  }
});
