// 任务规则移植自网站 summer2026.html(genTasks);数量取网站默认 cfg(快乐暑假 2 页、阅读 2 篇)。
// 打卡数据独立存本地 fo_summer_done = { 'YYYY-MM-DD': { taskId: 1 } },与网站不互通。
const START = '2026-07-14';
const END = '2026-08-30';
const WK = ['日', '一', '二', '三', '四', '五', '六'];
const SLOTS = [
  ['morning', '🌅 早晨'],
  ['study', '📚 上午 · 学习'],
  ['flex', '🧩 下午 · 自选'],
  ['cls', '🏫 英语课'],
  ['evening', '🌙 晚上']
];
const TL = { 1: '练词汇', 2: '练句子', 3: '练对话', 4: '练短文', 5: '练综合', 6: '双休自测' };
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

function p(s) { const a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
function f(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function addD(s, n) { const d = p(s); d.setDate(d.getDate() + n); return f(d); }
function clamp(s) { return s < START ? START : (s > END ? END : s); }
function cn(s) { const d = p(s); return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 周' + WK[d.getDay()]; }

function genTasks(date) {
  const t = [];
  const w = p(date).getDay();
  const ski = (date === '2026-07-15');
  t.push({ id: 'sport', name: '早起运动 30 分钟', slot: 'morning', req: true, time: '8:00' });
  if (ski) t.push({ id: 'ski', name: '上午滑雪 ⛷️', slot: 'morning', req: false, time: '上午' });
  if (!ski) {
    t.push({ id: 'kuaile', name: '《快乐暑假》2 页', slot: 'study', req: true, time: '9:00-11:30' });
    t.push({ id: 'yuedu', name: '英语阅读训练 2 篇', slot: 'study', req: true, time: '9:00-11:30' });
  }
  if (w === 2 || w === 5) t.push({ id: 'fanwen', name: '✍️ 高分范文 · 学 1 个话题', slot: 'study', req: true });
  t.push({ id: 'miaohong', name: '英语范文描红 1 篇', slot: 'study', req: true });
  if (date === '2026-08-16') t.push({ id: 'mindmap', name: '🗺️ 《猫武士》思维导图制作', slot: 'study', req: true });
  if (date === '2026-08-23') t.push({ id: 'video', name: '🎬 《猫武士》讲书视频拍摄', slot: 'study', req: true });
  t.push({ id: 'coding', name: '编程做游戏 30-60 分钟(自选)', slot: 'flex', req: false, time: '14:00-15:30' });
  t.push({ id: 'cube', name: '魔方 · 平板对战(自选)', slot: 'flex', req: false });
  t.push({ id: 'maowu', name: '读《猫武士》30 分钟', slot: 'flex', req: true });
  if (date >= '2026-07-15' && date <= '2026-07-19') {
    t.push({ id: 'cls', name: '🏫 英语课(线下)', slot: 'cls', req: true, time: '15:30 出发 · 16:00-17:50' });
  }
  if (TL[w]) t.push({ id: 'tingli', name: '听力天天练 · ' + TL[w], slot: 'evening', req: true, time: '晚饭前后 10 分钟' });
  t.push({ id: 'lianzi', name: '练字 15-20 分钟', slot: 'evening', req: true, time: '19:30' });
  if (w === 6) t.push({ id: 'switch', name: '🎮 Switch 时间 2 个半小时', slot: 'evening', req: false, time: '周六专属' });
  t.push({ id: 'sleep', name: '22:30 前上床睡觉', slot: 'evening', req: true, time: '21:45 洗漱' });
  return t;
}

Page({
  data: {
    view: 'cal',
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
    atEnd: false
  },

  onLoad() {
    this.done = wx.getStorageSync('fo_summer_done') || {};
    this.buildCal();
  },

  // 进来先看日历：每天一格，颜色 = 当天必做完成度
  buildCal() {
    const today = f(new Date());
    const weeks = [];
    let row = [];
    for (let i = 0; i < p(START).getDay(); i++) row.push(null);
    let calDone = 0;
    let calFull = 0;
    for (let d = START; d <= END; d = addD(d, 1)) {
      const req = genTasks(d).filter(function (t) { return t.req; });
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
        month: dt.getDate() === 1 || d === START ? (dt.getMonth() + 1) + '月' : '',
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
    this.render(d);
    this.setData({ view: 'day' });
  },

  backCal() {
    this.buildCal();
  },

  render(sel) {
    const tasks = genTasks(sel);
    const dayDone = this.done[sel] || {};
    const slots = SLOTS.map(function (s) {
      return {
        key: s[0],
        label: s[1],
        tasks: tasks
          .filter(function (t) { return t.slot === s[0]; })
          .map(function (t) { return Object.assign({}, t, { done: !!dayDone[t.id] }); })
      };
    }).filter(function (s) { return s.tasks.length; });
    const req = tasks.filter(function (t) { return t.req; });
    const doneReq = req.filter(function (t) { return dayDone[t.id]; }).length;
    const idx = Math.round((p(sel) - p(START)) / 864e5);
    this.setData({
      sel: sel,
      selCn: cn(sel),
      isToday: sel === f(new Date()),
      slots: slots,
      doneReq: doneReq,
      totalReq: req.length,
      pct: req.length ? Math.round(doneReq / req.length * 100) : 100,
      motto: MOTTOS[((idx % MOTTOS.length) + MOTTOS.length) % MOTTOS.length],
      atStart: sel === START,
      atEnd: sel === END
    });
  },

  toggle(e) {
    const d = e.currentTarget.dataset;
    const task = this.data.slots[d.s].tasks[d.t];
    const sel = this.data.sel;
    if (!this.done[sel]) this.done[sel] = {};
    if (this.done[sel][task.id]) {
      delete this.done[sel][task.id];
    } else {
      this.done[sel][task.id] = 1;
    }
    wx.setStorageSync('fo_summer_done', this.done);
    this.render(sel);
  },

  prev() { if (!this.data.atStart) this.render(addD(this.data.sel, -1)); },
  next() { if (!this.data.atEnd) this.render(addD(this.data.sel, 1)); },
  today() { this.render(clamp(f(new Date()))); }
});
