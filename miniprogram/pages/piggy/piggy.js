// 逻辑对齐网站 piggy-bank.html;数据存本地 fo_piggy(小程序无成员体系,单账本)。
const MAX_BALANCE = 200;
const INCOME_DEFS = [
  { emoji: '🎁', label: '零花钱' },
  { emoji: '🧹', label: '做家务' },
  { emoji: '🎂', label: '生日礼金' },
  { emoji: '🏆', label: '奖励' }
];
const EXPENSE_DEFS = [
  { emoji: '🍔', label: '零食' },
  { emoji: '📚', label: '买书' },
  { emoji: '🎮', label: '玩具' },
  { emoji: '🎨', label: '文具' },
  { emoji: '💝', label: '礼物' }
];
const GOAL_EMOJIS = ['🎮', '📚', '🎨', '🚲', '🎁'];

function fmtTime(ts) {
  const d = new Date(ts);
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' +
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

Page({
  data: {
    balanceText: '0.00',
    fillPct: 0,
    entries: [],
    goals: [],
    incomeDefs: INCOME_DEFS,
    expenseDefs: EXPENSE_DEFS,
    goalEmojis: GOAL_EMOJIS,
    openForm: '',
    incomeSel: 0,
    expenseSel: 0,
    amountInput: '',
    goalFormOpen: false,
    goalName: '',
    goalTarget: '',
    goalEmojiSel: 0
  },

  onLoad() {
    this.store = wx.getStorageSync('fo_piggy') || { balance: 0, entries: [], goals: [] };
    this.render();
  },

  render() {
    const s = this.store;
    this.setData({
      balanceText: s.balance.toFixed(2),
      fillPct: Math.round(Math.max(0, Math.min(1, s.balance / MAX_BALANCE)) * 100),
      entries: s.entries.map(function (e) {
        return Object.assign({}, e, { timeText: fmtTime(e.ts), amountText: e.amount.toFixed(2) });
      }),
      goals: s.goals.map(function (g) {
        const ratio = g.target > 0 ? Math.max(0, Math.min(1, g.saved / g.target)) : 0;
        return Object.assign({}, g, {
          pct: Math.round(ratio * 100),
          savedText: g.saved.toFixed(2),
          targetText: g.target.toFixed(2),
          done: s.balance >= g.target
        });
      })
    });
  },

  save() {
    wx.setStorageSync('fo_piggy', this.store);
  },

  toggleForm(e) {
    const which = e.currentTarget.dataset.form;
    this.setData({
      openForm: this.data.openForm === which ? '' : which,
      amountInput: ''
    });
  },

  onAmount(e) {
    this.setData({ amountInput: e.detail.value });
  },

  pickChip(e) {
    const d = e.currentTarget.dataset;
    const patch = {};
    patch[d.kind + 'Sel'] = d.idx;
    this.setData(patch);
  },

  submit() {
    const type = this.data.openForm;
    if (!type) return;
    const amount = Number(this.data.amountInput);
    if (!amount || amount <= 0) {
      wx.showToast({ title: '请输入正确金额', icon: 'none' });
      return;
    }
    const def = type === 'income'
      ? INCOME_DEFS[this.data.incomeSel]
      : EXPENSE_DEFS[this.data.expenseSel];
    this.store.entries.unshift({
      id: 'e' + Date.now(),
      type: type,
      amount: amount,
      label: def.label,
      emoji: def.emoji,
      ts: Date.now()
    });
    if (type === 'income') {
      this.store.balance += amount;
    } else {
      this.store.balance = Math.max(0, this.store.balance - amount);
    }
    this.updateGoalSavings();
    this.save();
    this.setData({ amountInput: '', openForm: '' });
    this.render();
  },

  updateGoalSavings() {
    const balance = this.store.balance;
    this.store.goals = this.store.goals.map(function (g) {
      return Object.assign({}, g, { saved: Math.min(balance, g.target) });
    });
  },

  toggleGoalForm() {
    this.setData({ goalFormOpen: !this.data.goalFormOpen });
  },

  onGoalName(e) { this.setData({ goalName: e.detail.value }); },
  onGoalTarget(e) { this.setData({ goalTarget: e.detail.value }); },
  pickGoalEmoji(e) { this.setData({ goalEmojiSel: e.currentTarget.dataset.idx }); },

  saveGoal() {
    const name = this.data.goalName.trim();
    const target = Number(this.data.goalTarget);
    if (!name || !target || target <= 0) {
      wx.showToast({ title: '目标名字和金额都要填', icon: 'none' });
      return;
    }
    this.store.goals.push({
      id: 'g' + Date.now(),
      name: name,
      target: target,
      saved: Math.min(this.store.balance, target),
      emoji: GOAL_EMOJIS[this.data.goalEmojiSel]
    });
    this.save();
    this.setData({ goalName: '', goalTarget: '', goalFormOpen: false });
    this.render();
  }
});
