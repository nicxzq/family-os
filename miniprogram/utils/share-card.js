// 分享卡 / 家庭墙海报：canvas 2d 绘制 + 存相册。
// canvas 读不到 CSS 变量，色值取生成物 data/palette.js（源 styles.css，勿手改）。
// 所有导出统一带"大橙小原"logo（assets/logo-mark.png + 文字）。
const { PALETTE } = require('../data/palette.js');

const LOGO_MARK = '/assets/logo-mark.png';
const BRAND = '大橙小原 · 好的家庭教育';

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const ch of text) {
    if (ch === '\n') { lines.push(line); line = ''; continue; }
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 页脚品牌行：logo mark（若加载成功）+ 文案，居中
function drawBrand(ctx, logo, centerX, y, markSize) {
  ctx.font = '26px sans-serif';
  const textW = ctx.measureText(BRAND).width;
  const gap = 12;
  const totalW = (logo ? markSize + gap : 0) + textW;
  let x = centerX - totalW / 2;
  if (logo) {
    ctx.drawImage(logo, x, y - markSize + 6, markSize, markSize);
    x += markSize + gap;
  }
  ctx.fillStyle = PALETTE.inkMute;
  ctx.textAlign = 'left';
  ctx.fillText(BRAND, x, y);
  ctx.textAlign = 'left';
}

function loadImage(canvas, src) {
  return new Promise(function (resolve) {
    const img = canvas.createImage();
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };  // 加载失败不阻断导出
    img.src = src;
  });
}

function getCanvas(pageCtx, selector) {
  return new Promise(function (resolve) {
    wx.createSelectorQuery().in(pageCtx).select(selector).fields({ node: true }).exec(function (res) {
      resolve(res && res[0] && res[0].node);
    });
  });
}

function exportCanvas(canvas) {
  return new Promise(function (resolve, reject) {
    wx.canvasToTempFilePath({
      canvas: canvas,
      success(r) { resolve(r.tempFilePath); },
      fail(e) { reject(e); }
    });
  });
}

function saveToAlbum(filePath) {
  return new Promise(function (resolve, reject) {
    wx.saveImageToPhotosAlbum({ filePath: filePath, success: resolve, fail: reject });
  });
}

function handleSaveError(err) {
  wx.hideLoading();
  if (err && err.errMsg && err.errMsg.indexOf('auth') !== -1) {
    wx.showModal({
      title: '需要相册权限',
      content: '请在设置中允许保存到相册，再试一次。',
      confirmText: '去设置',
      success(m) { if (m.confirm) wx.openSetting(); }
    });
  } else {
    wx.showToast({ title: '保存取消', icon: 'none' });
  }
}

/* ── 单条原则分享卡（750×1060） ─────────────────────────── */

function drawPrincipleCard(canvas, idea, rule, no, total, artImg, logoImg) {
  const W = 750, H = 1200;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const accent = PALETTE[idea.color] || PALETTE.coral;

  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(0, 0, W, H);

  const cx = 48, cy = 64, cw = W - 96, chh = H - 150;
  ctx.fillStyle = PALETTE.paper;
  roundRect(ctx, cx, cy, cw, chh, 28);
  ctx.fill();

  ctx.save();
  roundRect(ctx, cx, cy, cw, chh, 28);
  ctx.clip();
  ctx.fillStyle = accent;
  ctx.fillRect(cx, cy, cw, 14);
  ctx.restore();

  const left = cx + 48;
  const maxW = cw - 96;
  let y = cy + 84;

  ctx.textAlign = 'left';
  ctx.fillStyle = accent;
  ctx.font = '24px sans-serif';
  ctx.fillText('我 们 家 的 六 条 · ' + no + ' / ' + total, left, y);
  y += 60;

  // 插画（保持 3:2）
  if (artImg) {
    const iw = maxW;
    const ih = iw * 2 / 3;
    roundRect(ctx, left, y, iw, ih, 16);
    ctx.save();
    ctx.clip();
    ctx.drawImage(artImg, left, y, iw, ih);
    ctx.restore();
    y += ih + 44;
  } else {
    y += 8;
  }

  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 52px sans-serif';
  wrapText(ctx, rule, maxW).forEach(function (l) {
    ctx.fillText(l, left, y);
    y += 74;
  });
  y += 6;

  ctx.strokeStyle = PALETTE.creamDeep;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + maxW, y);
  ctx.stroke();
  y += 56;

  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 38px sans-serif';
  wrapText(ctx, idea.title, maxW).forEach(function (l) {
    ctx.fillText(l, left, y);
    y += 56;
  });
  y += 20;

  ctx.fillStyle = accent;
  ctx.font = '32px sans-serif';
  wrapText(ctx, idea.key, maxW).forEach(function (l) {
    ctx.fillText(l, left, y);
    y += 50;
  });

  drawBrand(ctx, logoImg, W / 2, H - 52, 44);
}

function savePrincipleImage(pageCtx, selector, idea, rule, no, total) {
  wx.showLoading({ title: '生成中…' });
  getCanvas(pageCtx, selector).then(function (canvas) {
    if (!canvas) throw new Error('no-canvas');
    return Promise.all([
      idea.art ? loadImage(canvas, idea.art) : Promise.resolve(null),
      loadImage(canvas, LOGO_MARK)
    ]).then(function (imgs) {
      drawPrincipleCard(canvas, idea, rule, no, total, imgs[0], imgs[1]);
      return exportCanvas(canvas);
    });
  }).then(function (filePath) {
    return saveToAlbum(filePath);
  }).then(function () {
    wx.hideLoading();
    wx.showToast({ title: '已存到相册', icon: 'success' });
  }).catch(function (err) {
    if (err && err.message === 'no-canvas') {
      wx.hideLoading();
      wx.showToast({ title: '生成失败', icon: 'none' });
    } else {
      handleSaveError(err);
    }
  });
}

/* ── A4 家庭墙海报（1080×1527，六条合一） ───────────────── */

function drawWallPoster(canvas, ideas, rules, artImgs, logoImg) {
  const W = 1080, H = 1527;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(0, 0, W, H);

  const pad = 72;
  ctx.textAlign = 'center';

  // 顶部品牌 + 标题
  if (logoImg) ctx.drawImage(logoImg, W / 2 - 44, 70, 88, 88);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 68px sans-serif';
  ctx.fillText('我们家的六条', W / 2, 244);
  ctx.fillStyle = PALETTE.inkMute;
  ctx.font = '30px sans-serif';
  ctx.fillText('A family of long-termists', W / 2, 290);

  ctx.textAlign = 'left';
  const rowTop = 340;
  const rowH = 176;
  const colors = ['coral', 'yellow', 'green', 'blue', 'coral', 'yellow'];
  for (let i = 0; i < 6; i++) {
    const y = rowTop + i * rowH;
    const accent = PALETTE[colors[i]];
    // 卡
    ctx.fillStyle = PALETTE.paper;
    roundRect(ctx, pad, y, W - pad * 2, rowH - 24, 24);
    ctx.fill();
    // 左侧色条
    ctx.save();
    roundRect(ctx, pad, y, W - pad * 2, rowH - 24, 24);
    ctx.clip();
    ctx.fillStyle = accent;
    ctx.fillRect(pad, y, 12, rowH - 24);
    // 插画方块
    const art = artImgs[i];
    const asz = rowH - 24 - 32;
    const ax = pad + 28, ay = y + 16;
    if (art) {
      roundRect(ctx, ax, ay, asz, asz, 16);
      ctx.save();
      ctx.clip();
      // art 是 3:2，用高度铺满、宽度居中裁
      const scale = asz / (art.height || 480);
      const dw = (art.width || 720) * scale;
      ctx.drawImage(art, ax - (dw - asz) / 2, ay, dw, asz);
      ctx.restore();
    }
    ctx.restore();

    // 文字
    const tx = pad + 28 + asz + 32;
    ctx.fillStyle = PALETTE.ink;
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText((i + 1) + '. ' + rules[i].replace(/^[一二三四五六]\s·\s/, ''), tx, y + 62);
    ctx.fillStyle = PALETTE.inkMute;
    ctx.font = '26px sans-serif';
    const titleLines = wrapText(ctx, ideas[i].title, W - pad * 2 - (tx - pad) - 40).slice(0, 2);
    let ty = y + 104;
    titleLines.forEach(function (l) { ctx.fillText(l, tx, ty); ty += 36; });
  }

  // 页脚
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.inkMute;
  ctx.font = '28px sans-serif';
  ctx.fillText('— 我们家 · 2026 —', W / 2, H - 96);
  drawBrand(ctx, logoImg, W / 2, H - 48, 44);
  ctx.textAlign = 'left';
}

function saveWallPoster(pageCtx, selector, ideas, rules, artMap) {
  wx.showLoading({ title: '生成家庭墙…' });
  getCanvas(pageCtx, selector).then(function (canvas) {
    if (!canvas) throw new Error('no-canvas');
    const artLoads = ideas.map(function (idea) {
      const src = artMap[idea.id];
      return src ? loadImage(canvas, src) : Promise.resolve(null);
    });
    return Promise.all([Promise.all(artLoads), loadImage(canvas, LOGO_MARK)]).then(function (r) {
      drawWallPoster(canvas, ideas, rules, r[0], r[1]);
      return exportCanvas(canvas);
    });
  }).then(function (filePath) {
    return saveToAlbum(filePath);
  }).then(function () {
    wx.hideLoading();
    wx.showToast({ title: '家庭墙已存相册', icon: 'success' });
  }).catch(function (err) {
    if (err && err.message === 'no-canvas') {
      wx.hideLoading();
      wx.showToast({ title: '生成失败', icon: 'none' });
    } else {
      handleSaveError(err);
    }
  });
}

module.exports = { savePrincipleImage, saveWallPoster };
