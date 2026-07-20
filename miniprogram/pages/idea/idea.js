const { IDEAS, RULES } = require('../../data/ideas.js');
const { IDEA_ART } = require('../../data/idea-art.js');
const { savePrincipleImage } = require('../../utils/share-card.js');
const { buildTimeline } = require('../../utils/share.js');

Page({
  data: {
    idea: null,
    no: 1,
    total: IDEAS.length
  },

  onLoad(options) {
    this.render(Number(options.no) || 1);
  },

  render(no) {
    if (no < 1 || no > IDEAS.length) return;
    const idea = Object.assign({}, IDEAS[no - 1], { art: IDEA_ART[IDEAS[no - 1].id] || '' });
    wx.setNavigationBarTitle({ title: idea.num });
    this.setData({ idea: idea, no: no });
    wx.pageScrollTo({ scrollTop: 0 });
  },

  prev() {
    this.render(this.data.no - 1);
  },

  next() {
    this.render(this.data.no + 1);
  },

  saveImage() {
    savePrincipleImage(this, '#share-canvas', this.data.idea, RULES[this.data.no - 1], this.data.no, this.data.total);
  },

  onShareAppMessage() {
    return {
      title: this.data.idea ? this.data.idea.title : '六个想法',
      path: '/pages/idea/idea?no=' + this.data.no
    };
  },

  onShareTimeline() {
    return buildTimeline(this.data.idea ? this.data.idea.title : '六个想法', 'no=' + this.data.no);
  }
});
