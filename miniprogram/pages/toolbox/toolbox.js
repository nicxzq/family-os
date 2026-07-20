const { buildShare, buildTimeline } = require('../../utils/share.js');

Page({
  data: {
    tools: [
      { id: 'topics', emoji: '🍚', name: '饭桌问题', desc: '每周一个话题，一家人一起想。', color: 'coral', url: '/pages/topics/topics' },
      { id: 'summer', emoji: '🌞', name: '暑期打卡', desc: '快乐暑假 2026，每天的任务清单。', color: 'yellow', url: '/pages/summer/summer' },
      { id: 'quiz', emoji: '🌱', name: '测一测', desc: '五个小问题——没有正确答案。', color: 'green', url: '/pages/quiz/quiz' },
      { id: 'review', emoji: '📋', name: '每周回顾', desc: '每周日 10 分钟，把这一周说清楚。', color: 'blue', url: '/pages/review/review' },
      { id: 'piggy', emoji: '🐷', name: '存钱罐', desc: '零花钱实验室：记账 + 储蓄目标。', color: 'coral', url: '/pages/piggy/piggy' },
      { id: 'attention', emoji: '🧠', name: '注意力账本', desc: '注意力是最贵的东西，今天怎么花的？', color: 'yellow', url: '/pages/attention/attention' },
      { id: 'games', emoji: '🎮', name: '52 个小游戏', desc: '问答·化学·物理·编程，5 个已上线。', color: 'blue', url: '/pages/games/games' }
    ]
  },

  open(e) {
    const tool = this.data.tools[e.currentTarget.dataset.idx];
    if (!tool.url) {
      wx.showToast({ title: '游戏在网站版可玩', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: tool.url });
  },

  onShareAppMessage() {
    return buildShare('家庭工具箱', '/pages/toolbox/toolbox');
  },

  onShareTimeline() {
    return buildTimeline('家庭工具箱', '');
  }
});
