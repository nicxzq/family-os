// 对齐网站 weekly-review.html 的五个板块;按 ISO 周存本地 fo_review_<YYYY-Wnn>,可回看历史周。
const MEMBERS = [
  { key: 'dad', name: '爸爸' },
  { key: 'mom', name: '妈妈' },
  { key: 'eldest', name: '老大' },
  { key: 'youngest', name: '老二' }
];

function emptyForm() {
  return {
    highlights: '',
    reading: { dad: '', mom: '', eldest: '', youngest: '' },
    gains: { dad: '', mom: '', eldest: '', youngest: '' },
    frictionWhat: '',
    frictionFix: '',
    focus: '',
    motto: ''
  };
}

function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  return d;
}

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { year: d.getUTCFullYear(), week: Math.ceil((((d - yearStart) / 86400000) + 1) / 7) };
}

function md(d) { return (d.getMonth() + 1) + '/' + d.getDate(); }

Page({
  data: {
    members: MEMBERS,
    weekLabel: '',
    rangeLabel: '',
    isThisWeek: true,
    form: emptyForm()
  },

  onLoad() {
    this.offset = 0;
    this.load();
  },

  onHide() { this.save(); },
  onUnload() { this.save(); },

  weekKeyAndLabels() {
    const monday = mondayOf(new Date());
    monday.setDate(monday.getDate() + this.offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const w = isoWeek(monday);
    const num = String(w.week).padStart(2, '0');
    return {
      key: 'fo_review_' + w.year + '-W' + num,
      weekLabel: w.year + ' 年 · 第 ' + w.week + ' 周',
      rangeLabel: md(monday) + ' — ' + md(sunday)
    };
  },

  load() {
    const info = this.weekKeyAndLabels();
    this.key = info.key;
    this.form = Object.assign(emptyForm(), wx.getStorageSync(info.key) || {});
    this.setData({
      weekLabel: info.weekLabel,
      rangeLabel: info.rangeLabel,
      isThisWeek: this.offset === 0,
      form: this.form
    });
  },

  save() {
    if (this.key) wx.setStorageSync(this.key, this.form);
  },

  onField(e) {
    const path = e.currentTarget.dataset.path.split('.');
    if (path.length === 2) {
      this.form[path[0]][path[1]] = e.detail.value;
    } else {
      this.form[path[0]] = e.detail.value;
    }
    this.save();
  },

  prevWeek() { this.save(); this.offset--; this.load(); },
  nextWeek() { if (this.offset < 0) { this.save(); this.offset++; this.load(); } },
  thisWeek() { this.save(); this.offset = 0; this.load(); }
});
