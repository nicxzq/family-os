const { ROLES, getRole } = require('../../data/roles.js');
const { buildTimeline } = require('../../utils/share.js');

const PER_SHELF = 3;

function buildRows(items) {
  const rows = [];
  items.forEach(function (it, i) {
    const row = Math.floor(i / PER_SHELF);
    if (!rows[row]) rows[row] = [];
    rows[row].push(it);
  });
  return rows;
}

Page({
  data: {
    roles: ROLES,
    role: '',
    roleInfo: null,
    picker: false,
    eldestShelves: [],
    youngestShelves: []
  },

  onLoad(options) {
    if (options && options.role && getRole(options.role)) {
      wx.setStorageSync('fo_role', options.role);
    }
  },

  onShow() {
    const role = wx.getStorageSync('fo_role');
    if (!role || !getRole(role)) {
      this.setData({ picker: true });
      return;
    }
    if (role !== this.data.role) this.loadRole(role);
  },

  loadRole(role) {
    const patch = { role: role, roleInfo: getRole(role), picker: false };
    if (role === 'eldest' && !this.data.eldestShelves.length) {
      patch.eldestShelves = require('../../data/readers.js').GROUPS.map(function (g) {
        return { group: g.group, rows: buildRows(g.items) };
      });
    }
    if (role === 'youngest' && !this.data.youngestShelves.length) {
      patch.youngestShelves = buildRows(require('../../data/stories.js').CATALOG);
    }
    this.setData(patch);
    wx.pageScrollTo({ scrollTop: 0 });
  },

  openPicker() {
    this.setData({ picker: true });
  },

  closePicker() {
    if (this.data.role) this.setData({ picker: false });
  },

  pickRole(e) {
    const role = e.currentTarget.dataset.role;
    wx.setStorageSync('fo_role', role);
    this.loadRole(role);
  },

  noop() {},

  openReader(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      wx.showToast({ title: '这篇还在路上，敬请期待', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/reader/reader?id=' + id });
  },

  openStory(e) {
    const d = e.currentTarget.dataset;
    if (!d.available) {
      wx.showToast({ title: '这本还在路上', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/story/story?id=' + d.id });
  },

  goSummer() {
    wx.navigateTo({ url: '/pages/summer/summer' });
  },

  goGames() {
    wx.navigateTo({ url: '/pages/games/games' });
  },

  goQuiz() {
    wx.navigateTo({ url: '/pages/quiz/quiz' });
  },

  onShareAppMessage() {
    const info = this.data.roleInfo;
    return {
      title: info ? '给' + info.name + '：' + info.tag : '好的家庭教育',
      path: '/pages/role/role' + (this.data.role ? '?role=' + this.data.role : '')
    };
  },

  onShareTimeline() {
    const info = this.data.roleInfo;
    return buildTimeline(
      info ? '给' + info.name + '：' + info.tag : '好的家庭教育',
      this.data.role ? 'role=' + this.data.role : ''
    );
  }
});
