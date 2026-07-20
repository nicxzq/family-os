// 多学科 · 历史侦探 —— 移植自网站 games/g44-history-detective.html，三个案件
// （真假史料 / 时间线排序 / 东西方同步）的题面、文案、正确答案原文照搬。
// 源游戏没有星级，这里用全程"失误次数"换算 1-3 星：0 次失误 3 星，1-3 次 2 星，
// 4 次及以上 1 星。失误定义：真假史料首次点错、时间线提交顺序错误、东西方配对点错。
const { buildShare, buildTimeline } = require('../../../utils/share.js');

const GAME_ID = 'g44-history-detective';

const TF = [
  { stmt: '郑和第七次下西洋（1431年启程）时，哥伦布尚未出生。', correct: true, explain: '✅ 正确！哥伦布生于 1451 年，郑和 1431 年已扬帆——中国的"大航海"比欧洲早了数十年。' },
  { stmt: '中国四大发明——造纸、印刷、火药、指南针——全部在宋朝完成发明。', correct: false, explain: '❌ 错误！造纸术由东汉蔡伦改良（约 105 年），指南针雏形最早见于战国时期。四大发明跨越了一千多年，宋朝只是集大成。' },
  { stmt: '牛顿发表《自然哲学的数学原理》（1687 年）时，清朝处于康熙年间。', correct: true, explain: '✅ 正确！康熙在位 1661—1722 年，1687 年正是他主政期间。康熙本人也热爱数学，曾向传教士学习西洋几何。' },
  { stmt: '达·芬奇（1452—1519）与哥伦布（1451—1506）是同一时代的人。', correct: true, explain: '✅ 正确！两人几乎同年出生，都活跃在文艺复兴盛期。达·芬奇比哥伦布多活了 13 年，可能读过哥伦布发现新大陆的报道。' },
  { stmt: '西罗马帝国灭亡（476 年）和中国南北朝时期（420—589 年）发生在同一个世纪。', correct: true, explain: '✅ 正确！476 年和 420 年都在公元 5 世纪。东西方帝国同时面临分裂动荡，历史的巧合，何其相似。' }
];

// 正确顺序即为下列展示顺序（index 0 最早 → index 4 最晚），与源页一致。
const TL_EVENTS = [
  { title: '孔子创立儒家', year: 551 },
  { title: '亚历山大大帝东征波斯', year: 334 },
  { title: '秦始皇统一六国', year: 221 },
  { title: '张骞出使西域（开通丝绸之路）', year: 138 },
  { title: '凯撒遇刺于罗马', year: 44 }
];

const EW_LEFT = [
  { id: 0, text: '活字印刷术发明（约 1040 年，毕昇）' },
  { id: 1, text: '成吉思汗建立蒙古帝国（1206 年）' },
  { id: 2, text: '明朝郑和首次下西洋（1405 年）' },
  { id: 3, text: '清朝第一次鸦片战争（1840 年）' }
];
const EW_RIGHT = [
  { id: 2, text: '英法百年战争（1337—1453 年）' },
  { id: 0, text: '诺曼人征服英格兰（1066 年）' },
  { id: 1, text: '英国签署大宪章（1215 年）' },
  { id: 3, text: '欧洲工业革命完成（约 1760—1840 年）' }
];

function findCard(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

function buildTF() {
  return TF.map(function (item) {
    return { stmt: item.stmt, explain: item.explain, done: false, showExplain: false, trueBtnClass: '', falseBtnClass: '' };
  });
}

function buildTLEvents() {
  return TL_EVENTS.map(function (ev) {
    return { title: ev.title, year: ev.year, num: '?', showYear: false, cls: '' };
  });
}

function buildEwSide(src) {
  return src.map(function (item) {
    return { id: item.id, text: item.text, cls: '' };
  });
}

Page({
  data: {
    activeCase: 'tf',
    solved: { tf: false, tl: false, ew: false },
    allDone: false,
    stars: 0,
    starRange: [0, 1, 2],
    tf: buildTF(),
    tl: {
      events: buildTLEvents(),
      order: [],
      done: false,
      locked: false,
      msg: '',
      msgClass: '',
      canSubmit: false,
      canReset: true
    },
    ew: {
      left: buildEwSide(EW_LEFT),
      right: buildEwSide(EW_RIGHT),
      matched: 0,
      selSide: '',
      selId: -1
    }
  },

  onLoad() {
    this.mistakes = 0;
  },

  switchCase(e) {
    this.setData({ activeCase: e.currentTarget.dataset.case });
  },

  // ---------- 案件一：真假史料 ----------
  answerTF(e) {
    const idx = e.currentTarget.dataset.idx;
    const choice = e.currentTarget.dataset.choice;
    const tf = this.data.tf;
    if (tf[idx].done) return;
    const correct = TF[idx].correct;
    tf[idx].done = true;
    tf[idx].showExplain = true;
    if (correct) {
      tf[idx].trueBtnClass = 'is-correct';
      if (!choice) tf[idx].falseBtnClass = 'is-wrong';
    } else {
      tf[idx].falseBtnClass = 'is-correct';
      if (choice) tf[idx].trueBtnClass = 'is-wrong';
    }
    if (choice !== correct) this.mistakes++;
    this.setData({ tf: tf });
    if (tf.every(function (t) { return t.done; })) this.markSolved('tf');
  },

  // ---------- 案件二：时间线排序 ----------
  selectTL(e) {
    const tl = this.data.tl;
    if (tl.done || tl.locked) return;
    const idx = e.currentTarget.dataset.idx;
    const pos = tl.order.indexOf(idx);
    if (pos >= 0) {
      tl.order.splice(pos, 1);
      tl.events[idx].cls = '';
    } else {
      tl.order.push(idx);
      tl.events[idx].cls = 'tl-ev--sel';
    }
    tl.events.forEach(function (ev, i) {
      const p = tl.order.indexOf(i);
      ev.num = p >= 0 ? String(p + 1) : '?';
    });
    tl.canSubmit = !tl.done && !tl.locked && tl.order.length >= 5;
    this.setData({ tl: tl });
  },

  checkTL() {
    const tl = this.data.tl;
    if (tl.done || tl.locked || tl.order.length < 5) return;
    let correct = true;
    tl.order.forEach(function (evIdx, i) {
      tl.events[evIdx].showYear = true;
      if (evIdx !== i) {
        correct = false;
        tl.events[evIdx].cls = 'tl-ev--err';
      } else {
        tl.events[evIdx].cls = 'tl-ev--ok';
      }
    });
    if (correct) {
      tl.done = true;
      tl.canSubmit = false;
      tl.canReset = false;
      tl.msgClass = 'ok';
      tl.msg = '✅ 完全正确！孔子 → 亚历山大 → 秦始皇 → 张骞 → 凯撒，五百年的世界史尽在眼前。';
      this.setData({ tl: tl });
      this.markSolved('tl');
    } else {
      this.mistakes++;
      tl.locked = true;
      tl.canSubmit = false;
      tl.canReset = false;
      tl.msgClass = 'err';
      tl.msg = '❌ 有些顺序不对，年份将显示 2 秒。稍后请重新排序。';
      this.setData({ tl: tl });
      const that = this;
      setTimeout(function () { that.resetTL(); }, 2000);
    }
  },

  resetTL() {
    const tl = this.data.tl;
    if (tl.done) return;
    tl.order = [];
    tl.locked = false;
    tl.msg = '';
    tl.msgClass = '';
    tl.events.forEach(function (ev) { ev.num = '?'; ev.showYear = false; ev.cls = ''; });
    tl.canSubmit = false;
    tl.canReset = true;
    this.setData({ tl: tl });
  },

  // ---------- 案件三：东西方同步 ----------
  selectEW(e) {
    const ew = this.data.ew;
    const side = e.currentTarget.dataset.side;
    const id = e.currentTarget.dataset.id;
    const list = side === 'L' ? ew.left : ew.right;
    const card = findCard(list, id);
    if (!card || card.cls === 'ew-card--matched') return;

    if (ew.selSide === '') {
      card.cls = 'ew-card--sel';
      ew.selSide = side;
      ew.selId = id;
      this.setData({ ew: ew });
      return;
    }

    if (ew.selSide === side) {
      const prevCard = findCard(list, ew.selId);
      if (prevCard) prevCard.cls = '';
      if (ew.selId === id) {
        ew.selSide = '';
        ew.selId = -1;
      } else {
        card.cls = 'ew-card--sel';
        ew.selId = id;
      }
      this.setData({ ew: ew });
      return;
    }

    const prevSide = ew.selSide;
    const prevId = ew.selId;
    const prevList = prevSide === 'L' ? ew.left : ew.right;
    const prevCard = findCard(prevList, prevId);
    if (id === prevId) {
      card.cls = 'ew-card--matched';
      if (prevCard) prevCard.cls = 'ew-card--matched';
      ew.matched++;
      ew.selSide = '';
      ew.selId = -1;
      this.setData({ ew: ew });
      if (ew.matched === 4) this.markSolved('ew');
    } else {
      card.cls = 'ew-card--flash';
      if (prevCard) prevCard.cls = 'ew-card--flash';
      this.mistakes++;
      ew.selSide = '';
      ew.selId = -1;
      this.setData({ ew: ew });
      const that = this;
      setTimeout(function () {
        const ew2 = that.data.ew;
        const c1 = findCard(side === 'L' ? ew2.left : ew2.right, id);
        const c2 = findCard(prevSide === 'L' ? ew2.left : ew2.right, prevId);
        if (c1 && c1.cls === 'ew-card--flash') c1.cls = '';
        if (c2 && c2.cls === 'ew-card--flash') c2.cls = '';
        that.setData({ ew: ew2 });
      }, 700);
    }
  },

  // ---------- 通关 ----------
  markSolved(caseId) {
    if (this.data.solved[caseId]) return;
    const solved = this.data.solved;
    solved[caseId] = true;
    this.setData({ solved: solved });
    if (solved.tf && solved.tl && solved.ew) this.finishAll();
  },

  finishAll() {
    const stars = this.mistakes === 0 ? 3 : (this.mistakes <= 3 ? 2 : 1);
    const all = wx.getStorageSync('fo_game_stars') || {};
    if (!all[GAME_ID] || all[GAME_ID] < stars) all[GAME_ID] = stars;
    wx.setStorageSync('fo_game_stars', all);
    this.setData({ allDone: true, stars: stars });
  },

  retry() {
    this.mistakes = 0;
    this.setData({
      activeCase: 'tf',
      solved: { tf: false, tl: false, ew: false },
      allDone: false,
      stars: 0,
      tf: buildTF(),
      tl: {
        events: buildTLEvents(),
        order: [],
        done: false,
        locked: false,
        msg: '',
        msgClass: '',
        canSubmit: false,
        canReset: true
      },
      ew: {
        left: buildEwSide(EW_LEFT),
        right: buildEwSide(EW_RIGHT),
        matched: 0,
        selSide: '',
        selId: -1
      }
    });
  },

  onShareAppMessage() {
    return buildShare('历史侦探', '/pages/games/multi/multi');
  },

  onShareTimeline() {
    return buildTimeline('历史侦探', '');
  }
});
