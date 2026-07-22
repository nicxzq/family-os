// 通用打卡工具。计划本身是数据（fo_checkin_cfg），不是写死的代码——
// 换一个假期、换一套习惯，只改配置就行，不用改代码。
// 打卡记录 fo_summer_done = { 'YYYY-MM-DD': { itemId: 1 } }，改配置不影响历史记录。
const { buildShare, buildTimeline } = require('../../utils/share.js');

const CFG_KEY = 'fo_checkin_cfg';
const DONE_KEY = 'fo_summer_done';
const WK = ['日', '一', '二', '三', '四', '五', '六'];

const MOTTOS = [
  '方向比目标更重要——只要方向对，慢一点也没关系。',
  '今天的一点点，乘上一整个暑假，就是很大的不一样。',
  '你专注的十分钟，比被打扰的一小时更值钱。',
  '不慌，时间是你的朋友。',
  '读书是自己的事，也是这世上最划算的事。',
  '犯错没关系，我们先一起解决问题，再想别的。',
  '非必要不竞争，把劲儿留给真正重要的那几次。',
  '把一件事做完，比同时开始十件事更酷。',
  '慢慢来，反而比较快。',
  '你不是在完成任务，你是在长出自己的本事。',
  '每天进步一点点，一年后你会认不出自己。',
  '真正的高手，都赢在"又坚持了一天"。'
];

/* 默认配置 = 原来写死的那份 2026 暑假计划，老用户的打卡记录继续有效 */
function defaultCfg() {
  return {
    title: '🌞 快乐暑假 2026',
    start: '2026-07-14',
    end: '2026-08-30',
    slots: [
      { key: 'morning', label: '🌅 早晨' },
      { key: 'study', label: '📚 上午 · 学习' },
      { key: 'flex', label: '🧩 下午 · 自选' },
      { key: 'cls', label: '🏫 英语课' },
      { key: 'evening', label: '🌙 晚上' }
    ],
    items: [
      { id: 'sport', name: '早起运动 30 分钟', slot: 'morning', req: true, time: '8:00' },
      { id: 'ski', name: '上午滑雪 ⛷️', slot: 'morning', req: false, time: '上午', dates: ['2026-07-15'] },
      { id: 'kuaile', name: '《快乐暑假》2 页', slot: 'study', req: true, time: '9:00-11:30', exceptDates: ['2026-07-15'] },
      { id: 'yuedu', name: '英语阅读训练 2 篇', slot: 'study', req: true, time: '9:00-11:30', exceptDates: ['2026-07-15'] },
      { id: 'fanwen', name: '✍️ 高分范文 · 学 1 个话题', slot: 'study', req: true, weekdays: [2, 5] },
      { id: 'miaohong', name: '英语范文描红 1 篇', slot: 'study', req: true },
      { id: 'mindmap', name: '🗺️ 《猫武士》思维导图制作', slot: 'study', req: true, dates: ['2026-08-16'] },
      { id: 'video', name: '🎬 《猫武士》讲书视频拍摄', slot: 'study', req: true, dates: ['2026-08-23'] },
      { id: 'coding', name: '编程做游戏 30-60 分钟(自选)', slot: 'flex', req: false, time: '14:00-15:30' },
      { id: 'cube', name: '魔方 · 平板对战(自选)', slot: 'flex', req: false },
      { id: 'maowu', name: '读《猫武士》30 分钟', slot: 'flex', req: true },
      { id: 'cls', name: '🏫 英语课(线下)', slot: 'cls', req: true, time: '15:30 出发 · 16:00-17:50', range: ['2026-07-15', '2026-07-19'] },
      { id: 'tingli-1', name: '听力天天练 · 练词汇', slot: 'evening', req: true, time: '晚饭前后 10 分钟', weekdays: [1] },
      { id: 'tingli-2', name: '听力天天练 · 练句子', slot: 'evening', req: true, time: '晚饭前后 10 分钟', weekdays: [2] },
      { id: 'tingli-3', name: '听力天天练 · 练对话', slot: 'evening', req: true, time: '晚饭前后 10 分钟', weekdays: [3] },
      { id: 'tingli-4', name: '听力天天练 · 练短文', slot: 'evening', req: true, time: '晚饭前后 10 分钟', weekdays: [4] },
      { id: 'tingli-5', name: '听力天天练 · 练综合', slot: 'evening', req: true, time: '晚饭前后 10 分钟', weekdays: [5] },
      { id: 'tingli-6', name: '听力天天练 · 双休自测', slot: 'evening', req: true, time: '晚饭前后 10 分钟', weekdays: [6] },
      { id: 'lianzi', name: '练字 15-20 分钟', slot: 'evening', req: true, time: '19:30' },
      { id: 'switch', name: '🎮 Switch 时间 2 个半小时', slot: 'evening', req: false, time: '周六专属', weekdays: [6] },
      { id: 'sleep', name: '22:30 前上床睡觉', slot: 'evening', req: true, time: '21:45 洗漱' }
    ]
  };
}

function p(s) { const a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
function f(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function addD(s, n) { const d = p(s); d.setDate(d.getDate() + n); return f(d); }
function cn(s) { const d = p(s); return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 周' + WK[d.getDay()]; }
function cnShort(s) { const d = p(s); return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'; }

/* 一条计划项是否落在某一天：weekdays / dates / range / exceptDates 四种规则 */
function itemOnDate(it, date) {
  if (it.exceptDates && it.exceptDates.indexOf(date) >= 0) return false;
  if (it.dates) return it.dates.indexOf(date) >= 0;
  if (it.range) return date >= it.range[0] && date <= it.range[1];
  if (it.weekdays) return it.weekdays.indexOf(p(date).getDay()) >= 0;
  return true;
}

Page({
  data: {
    view: 'cal',
    cfg: null,
    title: '',
    rangeText: '',
    weeks: [],
    calDone: 0,
    calFull: 0,
    sel: '',
    selCn: '',
    isToday: false,
    slots: [],
    doneReq: 0,
    totalReq: 0,
    pct: 0,
    motto: '',
    atStart: false,
    atEnd: false,
    confetti: [],
    // 设置页
    setItems: [],
    slotOptions: []
  },

  onLoad() {
    this.done = wx.getStorageSync(DONE_KEY) || {};
    this.cfg = wx.getStorageSync(CFG_KEY) || defaultCfg();
    this.streak = 0;
    this.syncCfg();
    this.buildCal();
  },

  syncCfg() {
    const c = this.cfg;
    this.setData({
      cfg: c,
      title: c.title,
      rangeText: cnShort(c.start) + ' — ' + cnShort(c.end),
      slotOptions: c.slots.map(function (s) { return s.label; })
    });
  },

  saveCfg() {
    wx.setStorageSync(CFG_KEY, this.cfg);
    this.syncCfg();
  },

  tasksOf(date) {
    return this.cfg.items.filter(function (it) { return itemOnDate(it, date); });
  },

  clampDate(s) { return s < this.cfg.start ? this.cfg.start : (s > this.cfg.end ? this.cfg.end : s); },

  // 进来先看日历：每天一格，颜色 = 当天必做完成度
  buildCal() {
    const today = f(new Date());
    const start = this.cfg.start;
    const end = this.cfg.end;
    const weeks = [];
    let row = [];
    for (let i = 0; i < p(start).getDay(); i++) row.push(null);
    let calDone = 0;
    let calFull = 0;
    for (let d = start; d <= end; d = addD(d, 1)) {
      const req = this.tasksOf(d).filter(function (t) { return t.req; });
      const dayDone = this.done[d] || {};
      const n = req.filter(function (t) { return dayDone[t.id]; }).length;
      let state = 'none';
      if (n > 0 && n === req.length) { state = 'full'; calFull++; }
      else if (n > 0) state = 'part';
      else if (d > today) state = 'future';
      if (n > 0) calDone++;
      const dt = p(d);
      row.push({
        d: d,
        num: dt.getDate(),
        month: dt.getDate() === 1 || d === start ? (dt.getMonth() + 1) + '月' : '',
        state: state,
        isToday: d === today
      });
      if (row.length === 7) { weeks.push(row); row = []; }
    }
    if (row.length) { while (row.length < 7) row.push(null); weeks.push(row); }
    this.setData({ view: 'cal', weeks: weeks, calDone: calDone, calFull: calFull });
  },

  openDay(e) {
    const d = e.currentTarget.dataset.d;
    if (!d) return;
    this.streak = 0;
    this.render(d);
    this.setData({ view: 'day' });
  },

  backCal() { this.buildCal(); },

  render(sel) {
    const tasks = this.tasksOf(sel);
    const dayDone = this.done[sel] || {};
    const slots = this.cfg.slots.map(function (s) {
      return {
        key: s.key,
        label: s.label,
        tasks: tasks
          .filter(function (t) { return t.slot === s.key; })
          .map(function (t) { return Object.assign({}, t, { done: !!dayDone[t.id] }); })
      };
    }).filter(function (s) { return s.tasks.length; });
    const req = tasks.filter(function (t) { return t.req; });
    const doneReq = req.filter(function (t) { return dayDone[t.id]; }).length;
    const idx = Math.round((p(sel) - p(this.cfg.start)) / 864e5);
    this.setData({
      sel: sel,
      selCn: cn(sel),
      isToday: sel === f(new Date()),
      slots: slots,
      doneReq: doneReq,
      totalReq: req.length,
      pct: req.length ? Math.round(doneReq / req.length * 100) : 100,
      motto: MOTTOS[((idx % MOTTOS.length) + MOTTOS.length) % MOTTOS.length],
      atStart: sel === this.cfg.start,
      atEnd: sel === this.cfg.end
    });
  },

  toggle(e) {
    const ds = e.currentTarget.dataset;
    const task = this.data.slots[ds.s].tasks[ds.t];
    const sel = this.data.sel;
    if (!this.done[sel]) this.done[sel] = {};
    let justDone = false;
    if (this.done[sel][task.id]) {
      delete this.done[sel][task.id];
      this.streak = 0;
    } else {
      this.done[sel][task.id] = 1;
      justDone = true;
      this.streak++;
    }
    wx.setStorageSync(DONE_KEY, this.done);
    this.render(sel);
    if (justDone) this.cheer(task);
  },

  /* 三档激励：单次勾选小花、连续 3 项中花、当天必做全完成大花 */
  cheer(task) {
    const all = this.data.totalReq && this.data.doneReq === this.data.totalReq;
    if (all) {
      this.burst(60);
      wx.showToast({ title: '今天全部完成！🎉', icon: 'none' });
    } else if (this.streak > 0 && this.streak % 3 === 0) {
      this.burst(30);
      wx.showToast({ title: '连续完成 ' + this.streak + ' 项 🔥', icon: 'none' });
    } else {
      this.burst(12);
    }
  },

  /* 撒花：位置和旋转是运行期算出来的，颜色走 class 上的设计 token */
  burst(count) {
    const colors = ['coral', 'yellow', 'green', 'blue'];
    const pieces = [];
    for (let i = 0; i < count; i++) {
      pieces.push({
        id: Date.now() + '-' + i,
        color: colors[i % colors.length],
        left: Math.round(Math.random() * 100),
        delay: Math.round(Math.random() * 400),
        drift: Math.round((Math.random() - 0.5) * 120),
        spin: Math.round(Math.random() * 720 - 360)
      });
    }
    this.setData({ confetti: pieces });
    clearTimeout(this._fxTimer);
    this._fxTimer = setTimeout(() => { this.setData({ confetti: [] }); }, 1800);
  },

  /* 长按条目：改名称 / 改时间 / 从计划中删除 */
  longpress(e) {
    const ds = e.currentTarget.dataset;
    const task = this.data.slots[ds.s].tasks[ds.t];
    wx.showActionSheet({
      itemList: ['改名称', '改时间', '设为' + (task.req ? '自选' : '必做'), '从计划中删除'],
      success: (res) => {
        if (res.tapIndex === 0) this.editField(task.id, 'name', '任务名称', task.name);
        if (res.tapIndex === 1) this.editField(task.id, 'time', '时间段', task.time || '');
        if (res.tapIndex === 2) this.patchItem(task.id, { req: !task.req });
        if (res.tapIndex === 3) this.removeItem(task.id);
      }
    });
  },

  editField(id, field, label, value) {
    wx.showModal({
      title: '修改' + label,
      editable: true,
      placeholderText: label,
      content: value,
      success: (res) => {
        if (!res.confirm) return;
        const v = (res.content || '').trim();
        if (field === 'name' && !v) return;
        this.patchItem(id, field === 'name' ? { name: v } : { time: v });
      }
    });
  },

  patchItem(id, patch) {
    const it = this.cfg.items.find(function (x) { return x.id === id; });
    if (!it) return;
    Object.assign(it, patch);
    this.saveCfg();
    if (this.data.view === 'day') this.render(this.data.sel);
    if (this.data.view === 'set') this.buildSet();
  },

  removeItem(id) {
    wx.showModal({
      title: '从计划中删除',
      content: '以后每天都不再出现这一项。已经打过的记录不会消失。',
      success: (res) => {
        if (!res.confirm) return;
        this.cfg.items = this.cfg.items.filter(function (x) { return x.id !== id; });
        this.saveCfg();
        if (this.data.view === 'day') this.render(this.data.sel);
        if (this.data.view === 'set') this.buildSet();
      }
    });
  },

  /* ── 设置 ───────────────────────────────────────────── */
  openSet() {
    this.buildSet();
    this.setData({ view: 'set' });
  },

  buildSet() {
    const slots = this.cfg.slots;
    const setItems = this.cfg.items.map(function (it) {
      const slot = slots.find(function (s) { return s.key === it.slot; });
      let rule = '每天';
      if (it.dates) rule = it.dates.join('、');
      else if (it.range) rule = it.range[0] + ' 起 ' + it.range[1] + ' 止';
      else if (it.weekdays) rule = '每周' + it.weekdays.map(function (w) { return WK[w]; }).join('、');
      return {
        id: it.id,
        name: it.name,
        time: it.time || '',
        req: it.req,
        slotLabel: slot ? slot.label : it.slot,
        slotIndex: slots.findIndex(function (s) { return s.key === it.slot; }),
        rule: rule
      };
    });
    this.setData({ setItems: setItems });
  },

  onTitle(e) {
    this.cfg.title = e.detail.value.trim() || '打卡';
    this.saveCfg();
  },
  onStart(e) {
    this.cfg.start = e.detail.value;
    if (this.cfg.start > this.cfg.end) this.cfg.end = this.cfg.start;
    this.saveCfg();
  },
  onEnd(e) {
    this.cfg.end = e.detail.value;
    if (this.cfg.end < this.cfg.start) this.cfg.start = this.cfg.end;
    this.saveCfg();
  },
  onSetSlot(e) {
    this.patchItem(e.currentTarget.dataset.id, { slot: this.cfg.slots[+e.detail.value].key });
  },
  onSetName(e) {
    this.editField(e.currentTarget.dataset.id, 'name', '任务名称', e.currentTarget.dataset.name);
  },
  onSetTime(e) {
    this.editField(e.currentTarget.dataset.id, 'time', '时间段', e.currentTarget.dataset.time);
  },
  onSetReq(e) {
    this.patchItem(e.currentTarget.dataset.id, { req: e.detail.value });
  },
  onSetDelete(e) {
    this.removeItem(e.currentTarget.dataset.id);
  },

  addItem() {
    wx.showModal({
      title: '新增一项',
      editable: true,
      placeholderText: '比如：跳绳 200 个',
      success: (res) => {
        if (!res.confirm) return;
        const name = (res.content || '').trim();
        if (!name) return;
        this.cfg.items.push({
          id: 'c' + Date.now(),
          name: name,
          slot: this.cfg.slots[0].key,
          req: true,
          time: ''
        });
        this.saveCfg();
        this.buildSet();
      }
    });
  },

  addSlot() {
    wx.showModal({
      title: '新增时间段',
      editable: true,
      placeholderText: '比如：🌆 傍晚',
      success: (res) => {
        if (!res.confirm) return;
        const label = (res.content || '').trim();
        if (!label) return;
        this.cfg.slots.push({ key: 's' + Date.now(), label: label });
        this.saveCfg();
        this.buildSet();
      }
    });
  },

  resetCfg() {
    wx.showModal({
      title: '恢复默认计划',
      content: '把项目和时间段恢复成初始的暑假计划。打卡记录不会删除。',
      success: (res) => {
        if (!res.confirm) return;
        this.cfg = defaultCfg();
        this.saveCfg();
        this.buildSet();
        wx.showToast({ title: '已恢复', icon: 'success' });
      }
    });
  },

  backFromSet() { this.buildCal(); },

  prev() { if (!this.data.atStart) this.render(addD(this.data.sel, -1)); },
  next() { if (!this.data.atEnd) this.render(addD(this.data.sel, 1)); },
  today() { this.render(this.clampDate(f(new Date()))); },

  onShareAppMessage() {
    return buildShare(this.cfg.title, '/pages/summer/summer');
  },

  onShareTimeline() {
    return buildTimeline(this.cfg.title, '');
  }
});
