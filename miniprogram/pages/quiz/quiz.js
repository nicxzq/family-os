const { QUIZ, FIVE_RULES } = require('../../data/quiz.js');

Page({
  data: {
    started: false,
    finished: false,
    current: 0,
    total: QUIZ.length,
    question: null,
    selected: -1,
    progress: [],
    fiveRules: FIVE_RULES
  },

  start() {
    this.setData({ started: true });
    this.goTo(0);
  },

  goTo(idx) {
    if (idx >= QUIZ.length) {
      this.setData({
        finished: true,
        progress: QUIZ.map(function () { return 'done'; })
      });
      wx.pageScrollTo({ scrollTop: 0 });
      return;
    }
    this.setData({
      current: idx,
      question: QUIZ[idx],
      selected: -1,
      progress: QUIZ.map(function (_, i) {
        return i < idx ? 'done' : (i === idx ? 'current' : '');
      })
    });
    wx.pageScrollTo({ scrollTop: 0 });
  },

  select(e) {
    this.setData({ selected: e.currentTarget.dataset.idx });
  },

  next() {
    this.goTo(this.data.current + 1);
  },

  goReaders() {
    wx.setStorageSync('fo_role', 'eldest');
    wx.switchTab({ url: '/pages/role/role' });
  },

  retry() {
    this.setData({ started: false, finished: false, current: 0, question: null, selected: -1, progress: [] });
  }
});
