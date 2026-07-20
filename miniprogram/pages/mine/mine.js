const { ROLES, getRole } = require('../../data/roles.js');
const { buildShare, buildTimeline } = require('../../utils/share.js');

const VERSION = '2.0.0';

function countReaders() {
  const { GROUPS } = require('../../data/readers.js');
  let n = 0;
  GROUPS.forEach(function (g) {
    g.items.forEach(function (i) { if (i.id) n++; });
  });
  return n;
}

function countStories() {
  const { CATALOG } = require('../../data/stories.js');
  return CATALOG.filter(function (s) { return s.available; }).length;
}

function fmtDate(ts) {
  const d = new Date(ts);
  return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

Page({
  data: {
    profile: {},
    roleName: '',
    readerDone: 0,
    readerTotal: 0,
    storyDone: 0,
    storyTotal: 0,
    records: [],
    recordsOpen: false,
    helpOpen: false,
    version: VERSION
  },

  onLoad() {
    this.setData({
      readerTotal: countReaders(),
      storyTotal: countStories()
    });
  },

  onShow() {
    const role = getRole(wx.getStorageSync('fo_role'));
    const readers = wx.getStorageSync('fo_read_readers') || {};
    const stories = wx.getStorageSync('fo_read_stories') || {};
    const records = [];
    Object.keys(readers).forEach(function (id) {
      records.push({ key: 'r-' + id, kind: '读本', title: readers[id].t, date: fmtDate(readers[id].ts), ts: readers[id].ts });
    });
    Object.keys(stories).forEach(function (id) {
      records.push({ key: 's-' + id, kind: '绘本', title: stories[id].t, date: fmtDate(stories[id].ts), ts: stories[id].ts });
    });
    records.sort(function (a, b) { return b.ts - a.ts; });
    this.setData({
      profile: wx.getStorageSync('fo_profile') || {},
      roleName: role ? role.name : '',
      readerDone: Object.keys(readers).length,
      storyDone: Object.keys(stories).length,
      records: records.slice(0, 10)
    });
  },

  onChooseAvatar(e) {
    const that = this;
    const tempPath = e.detail.avatarUrl;
    // 先 1:1 裁剪再入库，配合圆形展示实现"圆形截取"
    if (wx.cropImage) {
      wx.cropImage({
        src: tempPath,
        cropScale: '1:1',
        success(res) { that.persistAvatar(res.tempFilePath); },
        fail() { that.persistAvatar(tempPath); }
      });
    } else {
      this.persistAvatar(tempPath);
    }
  },

  persistAvatar(tempPath) {
    const that = this;
    wx.getFileSystemManager().saveFile({
      tempFilePath: tempPath,
      success(res) { that.saveAvatar(res.savedFilePath); },
      fail() { that.saveAvatar(tempPath); }
    });
  },

  saveAvatar(path) {
    const profile = Object.assign({}, this.data.profile, { avatarPath: path });
    wx.setStorageSync('fo_profile', profile);
    this.setData({ profile: profile });
  },

  onNickname(e) {
    const nickname = (e.detail.value || '').trim();
    const profile = Object.assign({}, this.data.profile, { nickname: nickname });
    wx.setStorageSync('fo_profile', profile);
    this.setData({ profile: profile });
  },

  switchRole() {
    const that = this;
    wx.showActionSheet({
      itemList: ROLES.map(function (r) { return r.name; }),
      success(res) {
        const role = ROLES[res.tapIndex];
        wx.setStorageSync('fo_role', role.id);
        that.setData({ roleName: role.name });
      }
    });
  },

  exportData() {
    const data = {};
    wx.getStorageInfoSync().keys.forEach(function (k) {
      if (k.indexOf('fo_') === 0) data[k] = wx.getStorageSync(k);
    });
    // 头像是本机文件路径，换设备无意义，不带出去
    if (data.fo_profile && data.fo_profile.avatarPath) {
      data.fo_profile = Object.assign({}, data.fo_profile);
      delete data.fo_profile.avatarPath;
    }
    const payload = { app: 'family-os', v: 1, exportedAt: Date.now(), data: data };
    const filePath = wx.env.USER_DATA_PATH + '/family-os-backup.json';
    try {
      wx.getFileSystemManager().writeFileSync(filePath, JSON.stringify(payload), 'utf8');
    } catch (e) {
      wx.showToast({ title: '导出失败', icon: 'none' });
      return;
    }
    wx.shareFileMessage({
      filePath: filePath,
      fileName: 'family-os-backup.json',
      fail() {
        wx.showToast({ title: '未发送，文件已生成', icon: 'none' });
      }
    });
  },

  importData() {
    const that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success(res) {
        const file = res.tempFiles[0];
        wx.getFileSystemManager().readFile({
          filePath: file.path,
          encoding: 'utf8',
          success(r) {
            let payload;
            try { payload = JSON.parse(r.data); } catch (e) { payload = null; }
            if (!payload || payload.app !== 'family-os' || !payload.data) {
              wx.showToast({ title: '不是本小程序的备份文件', icon: 'none' });
              return;
            }
            wx.showModal({
              title: '导入备份',
              content: '将合并阅读记录和工具箱数据，同名记录以备份为准。继续？',
              success(m) {
                if (!m.confirm) return;
                that.mergeImport(payload.data);
              }
            });
          },
          fail() { wx.showToast({ title: '读取文件失败', icon: 'none' }); }
        });
      }
    });
  },

  mergeImport(data) {
    Object.keys(data).forEach(function (k) {
      if (k.indexOf('fo_') !== 0) return;
      const incoming = data[k];
      const existing = wx.getStorageSync(k);
      // 对象型记录(阅读记录/打卡等)做并集合并，其余直接覆盖
      if (existing && incoming &&
          typeof existing === 'object' && !Array.isArray(existing) &&
          typeof incoming === 'object' && !Array.isArray(incoming)) {
        wx.setStorageSync(k, Object.assign({}, existing, incoming));
      } else {
        wx.setStorageSync(k, incoming);
      }
    });
    wx.showToast({ title: '导入完成', icon: 'success' });
    this.onShow();
  },

  toggleRecords() {
    this.setData({ recordsOpen: !this.data.recordsOpen });
  },

  toggleHelp() {
    this.setData({ helpOpen: !this.data.helpOpen });
  },

  goPrivacy() {
    wx.navigateTo({ url: '/pages/policy/policy?type=privacy' });
  },

  goDisclaimer() {
    wx.navigateTo({ url: '/pages/policy/policy?type=disclaimer' });
  },

  onShareAppMessage() {
    return buildShare('好的家庭教育', '/pages/home/home');
  },

  onShareTimeline() {
    return buildTimeline('好的家庭教育', '');
  }
});
