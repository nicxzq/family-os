// 程序 · 代码积木 —— 移植自网站 games/g41-blocks.html。3 个关卡的起点/朝向/终点/
// 墙体坐标、关卡标题与提示文案均取自源实现 levels 数组（源游戏本身只有 3 关，全部保留），
// 方向编号 d：0=上 1=右 2=下 3=左，与源实现坐标系统一致。computeMinSteps 的 BFS 算法
// 也移植自源实现，用于换算步数效率星级。
// 源页面用拖拽 + 可嵌套的"重复"积木搭程序，小程序端简化为点按钮追加指令队列；
// "🔁 重复上一步"按钮是简化版的循环块——复制队列里最后一条指令，不做真正的嵌套循环。
const { buildShare, buildTimeline } = require('../../../utils/share.js');

const GAME_ID = 'g41-blocks';
const GRID = 6;
const LABELS = { move: '前进', right: '右转', left: '左转' };

const LEVELS = [
  {
    title: '关卡 1 — 直线前进',
    hint: '向下走到底，再向右到达星星。',
    start: { r: 1, c: 1, d: 2 },
    goal: { r: 5, c: 4 },
    walls: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 0], [1, 5], [2, 0], [2, 2], [2, 3], [2, 5], [3, 0], [3, 3], [3, 5], [4, 0], [4, 3], [4, 5], [5, 0], [5, 5]]
  },
  {
    title: '关卡 2 — 重复的力量',
    hint: '试试用"重复上一步"复制前进/转向指令，少点几次按钮。',
    start: { r: 0, c: 0, d: 1 },
    goal: { r: 4, c: 5 },
    walls: [[0, 3], [1, 1], [1, 3], [1, 5], [2, 1], [2, 3], [3, 1], [3, 4], [4, 1], [5, 1], [5, 2], [5, 3], [5, 4]]
  },
  {
    title: '关卡 3 — 绕弯高手',
    hint: '先向上，再向右穿过中间走廊，最后转向星星。',
    start: { r: 5, c: 0, d: 0 },
    goal: { r: 1, c: 5 },
    walls: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 1], [2, 1], [2, 2], [2, 3], [2, 5], [4, 1], [4, 3], [4, 4], [5, 3]]
  }
];

function isWall(level, r, c) {
  if (r < 0 || c < 0 || r >= GRID || c >= GRID) return true;
  for (let i = 0; i < level.walls.length; i++) {
    if (level.walls[i][0] === r && level.walls[i][1] === c) return true;
  }
  return false;
}

// BFS 求最短步数，移植自源实现 computeMinSteps
function computeMinSteps(level) {
  const visited = {};
  const queue = [{ r: level.start.r, c: level.start.c, d: level.start.d, s: 0 }];
  visited[level.start.r + ',' + level.start.c + ',' + level.start.d] = true;
  while (queue.length) {
    const cur = queue.shift();
    if (cur.r === level.goal.r && cur.c === level.goal.c) return cur.s;
    const moves = [
      { r: cur.r + (cur.d === 2 ? 1 : cur.d === 0 ? -1 : 0), c: cur.c + (cur.d === 1 ? 1 : cur.d === 3 ? -1 : 0), d: cur.d, move: true },
      { r: cur.r, c: cur.c, d: (cur.d + 1) % 4, move: false },
      { r: cur.r, c: cur.c, d: (cur.d + 3) % 4, move: false }
    ];
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      if (m.move && isWall(level, m.r, m.c)) continue;
      const key = m.r + ',' + m.c + ',' + m.d;
      if (visited[key]) continue;
      visited[key] = true;
      queue.push({ r: m.r, c: m.c, d: m.d, s: cur.s + 1 });
    }
  }
  return 12;
}

function slotsForLevel(level) {
  const minSteps = computeMinSteps(level);
  return Math.min(Math.max(minSteps + 6, 8), 20);
}

function buildCells(level, pos, trail) {
  const cells = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      let cls = 'cell';
      let text = '';
      const wall = isWall(level, r, c);
      const isGoal = level.goal.r === r && level.goal.c === c;
      const isRobot = pos.r === r && pos.c === c;
      const isTrail = !isRobot && trail[r + ',' + c];
      if (wall) {
        cls += ' is-wall';
      } else if (isGoal) {
        cls += ' is-goal';
        text = isRobot ? '' : '⭐';
      } else if (isTrail) {
        cls += ' is-trail';
        text = '·';
      }
      if (isRobot) {
        cls += ' is-robot';
        text = ['⬆️', '➡️', '⬇️', '⬅️'][pos.d];
      }
      cells.push({ cls: cls, text: text });
    }
  }
  return cells;
}

function saveStars(stars) {
  const all = wx.getStorageSync('fo_game_stars') || {};
  if (!all[GAME_ID] || all[GAME_ID] < stars) all[GAME_ID] = stars;
  wx.setStorageSync('fo_game_stars', all);
}

Page({
  data: {
    levelIndex: 0,
    levelPill: '关卡 1 / 3',
    levelTitle: '',
    levelHint: '',
    cells: [],
    program: [],
    programMax: 8,
    running: false,
    resultShow: false,
    resultSuccess: false,
    resultText: '',
    resultBtnText: '',
    finalStars: 0,
    starRange: [0, 1, 2]
  },

  onLoad() {
    this.levelStars = [];
    this.loadLevel(0);
  },

  loadLevel(index) {
    const level = LEVELS[index];
    this.level = level;
    this.pos = { r: level.start.r, c: level.start.c, d: level.start.d };
    this.trail = {};
    this.setData({
      levelIndex: index,
      levelPill: '关卡 ' + (index + 1) + ' / ' + LEVELS.length,
      levelTitle: level.title,
      levelHint: level.hint,
      programMax: slotsForLevel(level),
      cells: buildCells(level, this.pos, this.trail),
      program: [],
      running: false,
      resultShow: false,
      finalStars: 0
    });
  },

  addInstruction(e) {
    if (this.data.running || this.data.program.length >= this.data.programMax) return;
    const type = e.currentTarget.dataset.type;
    const program = this.data.program.concat([{ type: type, label: LABELS[type] }]);
    this.setData({ program: program });
  },

  repeatLast() {
    if (this.data.running) return;
    if (this.data.program.length === 0 || this.data.program.length >= this.data.programMax) return;
    const last = this.data.program[this.data.program.length - 1];
    const program = this.data.program.concat([{ type: last.type, label: last.label }]);
    this.setData({ program: program });
  },

  removeInstruction(e) {
    if (this.data.running) return;
    const idx = e.currentTarget.dataset.idx;
    const program = this.data.program.slice();
    program.splice(idx, 1);
    this.setData({ program: program });
  },

  clearProgram() {
    if (this.data.running) return;
    this.setData({ program: [] });
  },

  resetPosition() {
    const level = this.level;
    this.pos = { r: level.start.r, c: level.start.c, d: level.start.d };
    this.trail = {};
    this.setData({ cells: buildCells(level, this.pos, this.trail), resultShow: false });
  },

  runProgram() {
    if (this.data.running || this.data.program.length === 0) return;
    this.resetPosition();
    this.setData({ running: true });
    const level = this.level;
    const program = this.data.program;
    const that = this;
    let i = 0;

    function step() {
      if (i >= program.length) {
        that.setData({ running: false });
        that.showResult(that.pos.r === level.goal.r && that.pos.c === level.goal.c, program.length);
        return;
      }
      const cmd = program[i].type;
      i++;
      if (cmd === 'left') that.pos.d = (that.pos.d + 3) % 4;
      if (cmd === 'right') that.pos.d = (that.pos.d + 1) % 4;
      if (cmd === 'move') {
        that.trail[that.pos.r + ',' + that.pos.c] = true;
        const nr = that.pos.r + (that.pos.d === 2 ? 1 : that.pos.d === 0 ? -1 : 0);
        const nc = that.pos.c + (that.pos.d === 1 ? 1 : that.pos.d === 3 ? -1 : 0);
        if (isWall(level, nr, nc)) {
          that.setData({ cells: buildCells(level, that.pos, that.trail), running: false });
          that.showResult(false, i);
          return;
        }
        that.pos.r = nr;
        that.pos.c = nc;
      }
      that.setData({ cells: buildCells(level, that.pos, that.trail) });
      setTimeout(step, 300);
    }
    setTimeout(step, 300);
  },

  showResult(success, steps) {
    if (success) {
      const minSteps = computeMinSteps(this.level);
      const stars = steps <= minSteps ? 3 : (steps <= minSteps + 2 ? 2 : 1);
      this.levelStars[this.data.levelIndex] = stars;
      const isLast = this.data.levelIndex >= LEVELS.length - 1;
      let text = steps <= minSteps
        ? '🎉 完美！最优解！'
        : (steps <= minSteps + 2 ? '🎉 完成！很接近最优（最少 ' + minSteps + ' 步）' : '🎉 完成！最少可用 ' + minSteps + ' 步');
      let finalStars = 0;
      if (isLast) {
        finalStars = Math.min.apply(null, this.levelStars);
        saveStars(finalStars);
        text = '🏁 全部关卡通关！' + text;
      }
      this.setData({
        resultShow: true,
        resultSuccess: true,
        resultText: text,
        resultBtnText: isLast ? '再玩一次' : '下一关',
        finalStars: finalStars
      });
    } else {
      this.setData({
        resultShow: true,
        resultSuccess: false,
        resultText: '💥 撞墙了！调整一下指令再试试。',
        resultBtnText: '重试'
      });
    }
  },

  onResultTap() {
    if (this.data.resultSuccess) {
      const next = this.data.levelIndex >= LEVELS.length - 1 ? 0 : this.data.levelIndex + 1;
      this.loadLevel(next);
    } else {
      this.resetPosition();
    }
  },

  onShareAppMessage() {
    return buildShare('代码积木', '/pages/games/code/code');
  },

  onShareTimeline() {
    return buildTimeline('代码积木', '');
  }
});
