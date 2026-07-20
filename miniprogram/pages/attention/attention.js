// 对齐网站 attention-budget.html;数据按天存本地 fo_attention_<YYYY-MM-DD>。
const { buildShare, buildTimeline } = require('../../utils/share.js');

const CATEGORIES = [
  { key: 'deep', label: '深度专注' },
  { key: 'learn', label: '轻度学习' },
  { key: 'rest', label: '休息娱乐' },
  { key: 'lost', label: '被打断/刷手机' }
];

function dateKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getInsight(totals, total) {
  if (totals.deep >= 120) return '🔥 今天有超过两小时的深度专注，厉害！';
  if (totals.deep >= 60) return '✨ 今天有一小时专注，不错的一天。';
  if (totals.lost > totals.deep) return '💡 今天被打断/刷手机的时间比专注时间多——明天试试换个顺序？';
  if (total < 30) return '📝 今天还没记录多少——随时可以加。';
  return '📊 记录得越多，看得越清楚。';
}

Page({
  data: {
    categories: CATEGORIES,
    catSel: 0,
    nameInput: '',
    durationInput: '',
    total: 0,
    segments: [],
    legend: [],
    insight: '📊 记录得越多，看得越清楚。',
    entries: []
  },

  onLoad() {
    this.key = 'fo_attention_' + dateKey();
    this.entries = wx.getStorageSync(this.key) || [];
    this.render();
  },

  render() {
    const entries = this.entries;
    const totals = {};
    CATEGORIES.forEach(function (c) {
      totals[c.key] = entries
        .filter(function (e) { return e.cat === c.key; })
        .reduce(function (sum, e) { return sum + e.duration; }, 0);
    });
    const total = CATEGORIES.reduce(function (sum, c) { return sum + totals[c.key]; }, 0);
    this.setData({
      total: total,
      segments: CATEGORIES
        .filter(function (c) { return totals[c.key] > 0; })
        .map(function (c) { return { key: c.key, pct: (totals[c.key] / total * 100).toFixed(1) }; }),
      legend: CATEGORIES.map(function (c) { return { key: c.key, label: c.label, minutes: totals[c.key] }; }),
      insight: getInsight(totals, total),
      entries: entries.slice().reverse().map(function (e) {
        const cat = CATEGORIES.find(function (c) { return c.key === e.cat; }) || CATEGORIES[0];
        return Object.assign({}, e, { catLabel: cat.label });
      })
    });
  },

  save() {
    wx.setStorageSync(this.key, this.entries);
  },

  onName(e) { this.setData({ nameInput: e.detail.value }); },
  onDuration(e) { this.setData({ durationInput: e.detail.value }); },
  pickCat(e) { this.setData({ catSel: e.currentTarget.dataset.idx }); },

  add() {
    const name = this.data.nameInput.trim();
    const duration = Number(this.data.durationInput);
    if (!name || !duration || duration < 1 || duration > 240) {
      wx.showToast({ title: '写上做了什么和几分钟(1-240)', icon: 'none' });
      return;
    }
    this.entries.push({
      id: 'a' + Date.now(),
      name: name,
      duration: duration,
      cat: CATEGORIES[this.data.catSel].key
    });
    this.save();
    this.setData({ nameInput: '', durationInput: '', catSel: 0 });
    this.render();
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    this.entries = this.entries.filter(function (entry) { return entry.id !== id; });
    this.save();
    this.render();
  },

  clearToday() {
    const that = this;
    wx.showModal({
      title: '清空今天的记录？',
      content: '删掉之后就找不回来了。',
      success(res) {
        if (!res.confirm) return;
        that.entries = [];
        wx.removeStorageSync(that.key);
        that.render();
      }
    });
  },

  onShareAppMessage() {
    return buildShare('注意力账本', '/pages/attention/attention');
  },

  onShareTimeline() {
    return buildTimeline('注意力账本', '');
  }
});
