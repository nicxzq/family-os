// 问答类 · 方向 vs 目标 —— 移植自网站 games/g01-direction.html，题目/选项/反馈原文照搬。
// 源游戏本身没有对错判分（每题无论选哪个选项，反馈文案都一样），只有"完成"状态。
// 为满足"结果页含星级"的要求，这里用每题里贴近"方向感"理念的那个选项（aligned）
// 做一个不外显的软性打分，仅用于换算 1-3 星，不在答题过程中标注对错、不改变原游戏
// 不评判对错的调性。
const { buildShare, buildTimeline } = require('../../../utils/share.js');

const GAME_ID = 'g01-direction';

const QUESTIONS = [
  {
    q: '一年后你想变成什么样的人？',
    options: ['具体目标：考上某某学校', '保持方向：比今天的我更好', '没想过', '想了，但不确定'],
    reaction: '目标当然有用，但它会变，也会落空。方向不一样：只要你还在持续学习、持续升级，就没有真正失败。',
    aligned: 1
  },
  {
    q: '当目标没达到，你会⋯⋯？',
    options: ['觉得自己输了', '换一个更低的目标', '看看方向有没有走偏', '先难过一会儿，再想办法'],
    reaction: '把目标当作唯一标准，容易把一次结果误认为整个人的价值。更好的复盘是问：我的方向对吗？下一步怎么迭代？',
    aligned: 2
  },
  {
    q: '如果方向是“不断学习”，达到了吗？',
    options: ['达到了，因为今天学了', '没达到，因为还不够厉害', '方向不是终点，不能用“达到”衡量', '要看考试分数'],
    reaction: '方向更像一条路。你不会“完成”北方，只会继续朝北走。学习也是这样：关键不是宣布成功，而是每天仍在路上。',
    aligned: 2
  },
  {
    q: '你现在做的事，三年后还有价值吗？',
    options: ['有，比如阅读、写作、思考', '可能有，但我还看不清', '大多只是为了眼前分数', '不知道，三年太远了'],
    reaction: '能被时间放大的事，往往更接近方向：读书、表达、专注、好奇心。短期目标会过去，长期能力会留下。',
    aligned: 0
  },
  {
    q: '给现在的你一个建议：',
    options: ['选方向，不选目标', '把目标写得更大', '只做别人说有用的事', '先赢过身边的人'],
    reaction: '"选方向，不选目标"不是不要目标，而是不让目标绑架自己。方向正确，目标只是路标；路标错了，还可以换。',
    aligned: 0
  }
];

function saveStars(stars) {
  const all = wx.getStorageSync('fo_game_stars') || {};
  if (!all[GAME_ID] || all[GAME_ID] < stars) all[GAME_ID] = stars;
  wx.setStorageSync('fo_game_stars', all);
}

Page({
  data: {
    total: QUESTIONS.length,
    current: 0,
    question: QUESTIONS[0],
    selected: -1,
    progress: [],
    finished: false,
    stars: 0,
    starRange: [0, 1, 2],
    resultTitle: '方向感知者',
    resultDesc: '你已经开始分辨：有些事是短跑，有些事是人生的长期方向。选一个值得持续十年的方向，然后让时间帮你。'
  },

  onLoad() {
    this.picks = [];
    this.updateProgress(0);
  },

  updateProgress(idx) {
    this.setData({
      progress: QUESTIONS.map(function (_, i) {
        return i < idx ? 'done' : (i === idx ? 'current' : '');
      })
    });
  },

  select(e) {
    this.setData({ selected: e.currentTarget.dataset.idx });
  },

  next() {
    this.picks[this.data.current] = this.data.selected;
    const nextIdx = this.data.current + 1;
    if (nextIdx >= QUESTIONS.length) {
      this.finish();
      return;
    }
    this.setData({
      current: nextIdx,
      question: QUESTIONS[nextIdx],
      selected: -1
    });
    this.updateProgress(nextIdx);
    wx.pageScrollTo({ scrollTop: 0 });
  },

  finish() {
    let aligned = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (this.picks[i] === QUESTIONS[i].aligned) aligned++;
    }
    const stars = aligned >= 4 ? 3 : (aligned >= 2 ? 2 : 1);
    saveStars(stars);
    this.setData({ finished: true, stars: stars });
    wx.pageScrollTo({ scrollTop: 0 });
  },

  retry() {
    this.picks = [];
    this.setData({
      current: 0,
      question: QUESTIONS[0],
      selected: -1,
      finished: false,
      stars: 0
    });
    this.updateProgress(0);
  },

  onShareAppMessage() {
    return buildShare('方向 vs 目标', '/pages/games/qa/qa');
  },

  onShareTimeline() {
    return buildTimeline('方向 vs 目标', '');
  }
});
