const { ROLES, getRole } = require('../../data/roles.js');

Page({
  data: {
    roles: ROLES,
    role: '',
    roleInfo: null,
    picker: false,
    groups: [],
    stories: []
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
    if (role === 'eldest' && !this.data.groups.length) {
      patch.groups = require('../../data/readers.js').GROUPS;
    }
    if (role === 'youngest' && !this.data.stories.length) {
      patch.stories = require('../../data/stories.js').CATALOG;
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
    const d = e.currentTarget.dataset;
    const item = this.data.groups[d.g].items[d.i];
    if (!item.id) {
      wx.showToast({ title: '这篇还在路上，敬请期待', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/reader/reader?id=' + item.id });
  },

  openStory(e) {
    const s = this.data.stories[e.currentTarget.dataset.idx];
    if (!s.available) {
      wx.showToast({ title: '这本还在路上', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/story/story?id=' + s.id });
  },

  goSummer() {
    wx.navigateTo({ url: '/pages/summer/summer' });
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
  }
});
