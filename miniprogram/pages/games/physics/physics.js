// 科学 · 物理弹弓 —— 移植自网站 games/g22-physics.html。逻辑画布尺寸 700×320、
// 重力/初速度换算系数（SCALE=3.2、g=0.18）、3 个候选靶位、命中判定半径 42px，
// 均取自源实现的 <script> 内联逻辑，未做数值改动。
// 源游戏没有星级，这里按"用弹数"换算 1-3 星：命中 3 次时总尝试次数越少，星级越高。
const { buildShare, buildTimeline } = require('../../../utils/share.js');
const { PALETTE } = require('../../../data/palette.js');

const GAME_ID = 'g22-physics';
const CANVAS_W = 700, CANVAS_H = 320;
const GROUND_Y = CANVAS_H - 40;
const ORIGIN_X = 60;
const SCALE = 3.2;
const GRAVITY = 0.18;
const HIT_RADIUS = 42;
const TARGETS = [
  { x: CANVAS_W - 100, y: GROUND_Y - 20 },
  { x: CANVAS_W - 160, y: GROUND_Y - 60 },
  { x: CANVAS_W - 80, y: GROUND_Y - 100 }
];

// 场景插画配色（天空/草地/木架/橡皮筋）：源页面内联 <script> 里给画面用的美术色值，
// 不属于设计 token 体系里的语义色，canvas 也读不到 CSS 变量，故保留字面量。
const SKY_TOP = '#C8DFFF', SKY_BOTTOM = '#EEF5FF';
const GRASS = '#A8C96B', GRASS_EDGE = '#7A9C3E';
const WOOD = '#6B4A1E', BAND = '#C8863A';

function saveStars(stars) {
  const all = wx.getStorageSync('fo_game_stars') || {};
  if (!all[GAME_ID] || all[GAME_ID] < stars) all[GAME_ID] = stars;
  wx.setStorageSync('fo_game_stars', all);
}

Page({
  data: {
    angle: 45,
    power: 60,
    hits: 0,
    tries: 0,
    animating: false,
    resultMsg: '',
    resultHit: false,
    knowOpen: false,
    paletteCoral: PALETTE.coral
  },

  onLoad() {
    this.target = TARGETS[0];
  },

  onReady() {
    const that = this;
    wx.createSelectorQuery()
      .in(this)
      .select('#physicsCanvas')
      .fields({ node: true, size: true })
      .exec(function (res) {
        const item = res && res[0];
        if (!item || !item.node) return;
        const canvas = item.node;
        const dpr = wx.getSystemInfoSync().pixelRatio || 1;
        const k = item.width / CANVAS_W;
        canvas.width = item.width * dpr;
        canvas.height = item.height * dpr;
        that.canvas = canvas;
        that.ctx = canvas.getContext('2d');
        that.ctx.scale(k * dpr, k * dpr);
        that.drawScene(null, null, null);
      });
  },

  drawScene(ballX, ballY, trail) {
    const ctx = this.ctx;
    if (!ctx) return;
    const angle = this.data.angle;
    const animating = this.data.animating;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, SKY_TOP);
    sky.addColorStop(1, SKY_BOTTOM);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_W, GROUND_Y);

    ctx.fillStyle = GRASS;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    ctx.fillStyle = GRASS_EDGE;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, 6);

    ctx.strokeStyle = WOOD;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ORIGIN_X, GROUND_Y); ctx.lineTo(ORIGIN_X, GROUND_Y - 55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ORIGIN_X, GROUND_Y - 55); ctx.lineTo(ORIGIN_X - 18, GROUND_Y - 80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ORIGIN_X, GROUND_Y - 55); ctx.lineTo(ORIGIN_X + 18, GROUND_Y - 80); ctx.stroke();

    if (!animating && !trail) {
      ctx.strokeStyle = BAND;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(ORIGIN_X - 18, GROUND_Y - 80);
      ctx.lineTo(ORIGIN_X + 4, GROUND_Y - 76);
      ctx.lineTo(ORIGIN_X + 18, GROUND_Y - 80);
      ctx.stroke();
      ctx.fillStyle = PALETTE.coral;
      ctx.beginPath(); ctx.arc(ORIGIN_X + 4, GROUND_Y - 76, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = 1.5; ctx.stroke();

      const rad = angle * Math.PI / 180;
      const arrowLen = 40;
      const ax = ORIGIN_X + 4 + Math.cos(rad) * arrowLen;
      const ay = GROUND_Y - 76 - Math.sin(rad) * arrowLen;
      ctx.strokeStyle = PALETTE.blue;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(ORIGIN_X + 4, GROUND_Y - 76); ctx.lineTo(ax, ay); ctx.stroke();
      ctx.setLineDash([]);
    }

    if (trail && trail.length > 1) {
      ctx.strokeStyle = 'rgba(229,107,90,0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const target = this.target;
    const rings = [28, 20, 12, 5];
    const colors = [PALETTE.coral, PALETTE.paper, PALETTE.coral, PALETTE.ink];
    for (let r = 0; r < rings.length; r++) {
      ctx.fillStyle = colors[r];
      ctx.beginPath(); ctx.arc(target.x, target.y, rings[r], 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = 1; ctx.stroke();
    }

    if (ballX !== null) {
      ctx.fillStyle = PALETTE.coral;
      ctx.beginPath(); ctx.arc(ballX, ballY, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = 1.5; ctx.stroke();
    }
  },

  onAngleChange(e) {
    this.setData({ angle: e.detail.value });
    this.drawScene(null, null, null);
  },

  onPowerChange(e) {
    this.setData({ power: e.detail.value });
    this.drawScene(null, null, null);
  },

  fire() {
    if (this.data.animating || !this.ctx) return;
    this.setData({ animating: true, resultMsg: '', tries: this.data.tries + 1 });

    const angle = this.data.angle, power = this.data.power;
    const rad = angle * Math.PI / 180;
    const vx = power * SCALE * Math.cos(rad) * 0.035;
    let vy = -power * SCALE * Math.sin(rad) * 0.035;
    let bx = ORIGIN_X + 4, by = GROUND_Y - 76;
    const trail = [{ x: bx, y: by }];
    const that = this;

    function step() {
      bx += vx;
      by += vy;
      vy += GRAVITY;
      trail.push({ x: bx, y: by });

      if (by >= GROUND_Y - 9 || bx > CANVAS_W + 20) {
        const finalX = Math.min(bx, CANVAS_W - 10);
        const finalY = Math.min(by, GROUND_Y - 9);
        that.drawScene(finalX, finalY, trail);
        const dist = Math.sqrt(Math.pow(finalX - that.target.x, 2) + Math.pow(finalY - that.target.y, 2));
        setTimeout(function () {
          that.showResult(dist < HIT_RADIUS, dist);
          that.setData({ animating: false });
          if (dist < HIT_RADIUS) that.newTarget();
          that.drawScene(finalX, finalY, trail);
        }, 300);
        return;
      }
      that.drawScene(bx, by, trail);
      setTimeout(step, 16);
    }
    setTimeout(step, 16);
  },

  newTarget() {
    this.target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
  },

  showResult(isHit, dist) {
    if (isHit) {
      const hits = this.data.hits + 1;
      this.setData({
        hits: hits,
        resultMsg: '🎯 命中！角度 ' + this.data.angle + '°，力度 ' + this.data.power,
        resultHit: true
      });
      if (hits >= 3) this.finish();
    } else {
      this.setData({
        resultMsg: '💨 偏了！差了约 ' + Math.round(dist) + ' px，试着调整角度或力度。',
        resultHit: false
      });
    }
  },

  finish() {
    const stars = this.data.tries <= 4 ? 3 : (this.data.tries <= 6 ? 2 : 1);
    saveStars(stars);
  },

  toggleKnow() {
    this.setData({ knowOpen: !this.data.knowOpen });
  },

  onShareAppMessage() {
    return buildShare('物理弹弓', '/pages/games/physics/physics');
  },

  onShareTimeline() {
    return buildTimeline('物理弹弓', '');
  }
});
