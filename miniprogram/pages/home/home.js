const { IDEAS, RULES, BOOKS } = require('../../data/ideas.js');
const { IDEA_ART } = require('../../data/idea-art.js');
const { ROLES } = require('../../data/roles.js');
const { saveWallPoster } = require('../../utils/share-card.js');

const SHELF_COLORS = ['coral', 'yellow', 'green', 'blue'];
const PER_SHELF = 3;

function buildShelves() {
  const shelves = [];
  BOOKS.forEach(function (b, i) {
    const row = Math.floor(i / PER_SHELF);
    if (!shelves[row]) shelves[row] = [];
    shelves[row].push(Object.assign({}, b, { color: SHELF_COLORS[i % SHELF_COLORS.length] }));
  });
  return shelves;
}

Page({
  data: {
    ideas: IDEAS,
    rules: RULES,
    shelves: buildShelves(),
    selBook: null,
    roles: ROLES
  },

  goIdea(e) {
    wx.navigateTo({ url: '/pages/idea/idea?no=' + e.currentTarget.dataset.no });
  },

  savePoster() {
    saveWallPoster(this, '#poster-canvas', IDEAS, RULES, IDEA_ART);
  },

  pickBook(e) {
    const d = e.currentTarget.dataset;
    const book = this.data.shelves[d.ri][d.bi];
    const same = this.data.selBook && this.data.selBook.title === book.title;
    this.setData({ selBook: same ? null : book });
  },

  goRole(e) {
    const role = this.data.roles[e.currentTarget.dataset.idx];
    wx.setStorageSync('fo_role', role.id);
    wx.switchTab({ url: '/pages/role/role' });
  },

  goToolbox() {
    wx.switchTab({ url: '/pages/toolbox/toolbox' });
  }
});
