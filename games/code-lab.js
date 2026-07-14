/* ===== 程序类游戏公共逻辑 =====
   依赖 fo-utils.js (window.FO)。提供成员按钮、关卡/星级持久化、HUD、结果横幅。
   页面约定的 DOM id：nav-member-btn, level-pill, level-title, level-hint,
   result, result-text, result-btn（可选）, hud-hearts（可选）, hud-stars（可选）。 */
window.CodeLab = (function () {
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function initMember() {
    var el = document.getElementById('nav-member-btn');
    if (!el) return;
    var m = window.FO ? FO.getMember() : null;
    if (m) {
      el.innerHTML = FO.avatarSVG(m.avatar, m.color, 32) + '<span>' + m.name + '</span>';
      el.onclick = function () { location.href = '../dashboard.html'; };
    } else {
      el.innerHTML = '<span>登录</span>';
      el.onclick = function () { location.href = '../login.html'; };
    }
  }

  function markDone(gameId) {
    try {
      var d = JSON.parse(localStorage.getItem('fo_games_done') || '[]');
      if (d.indexOf(gameId) < 0) { d.push(gameId); localStorage.setItem('fo_games_done', JSON.stringify(d)); }
    } catch (e) { }
  }

  /* 星级持久化：fo_game_stars = { gameId: { levelIndex: stars } }，只升不降 */
  function getStars(gameId) {
    try { return (JSON.parse(localStorage.getItem('fo_game_stars') || '{}'))[gameId] || {}; }
    catch (e) { return {}; }
  }
  function saveStars(gameId, levelIndex, stars) {
    try {
      var all = JSON.parse(localStorage.getItem('fo_game_stars') || '{}');
      if (!all[gameId]) all[gameId] = {};
      if ((all[gameId][levelIndex] || 0) < stars) all[gameId][levelIndex] = stars;
      localStorage.setItem('fo_game_stars', JSON.stringify(all));
    } catch (e) { }
  }
  function starHTML(n, total) {
    total = total || 3;
    var out = '';
    for (var i = 0; i < total; i++) out += i < n ? '★' : '<span class="off">★</span>';
    return out;
  }

  function setLevel(index, total, title, hint) {
    var pill = document.getElementById('level-pill');
    if (pill) pill.textContent = '关卡 ' + (index + 1) + ' / ' + total;
    var t = document.getElementById('level-title');
    if (t) t.textContent = title;
    var h = document.getElementById('level-hint');
    if (h) h.textContent = hint || '';
  }

  function renderHearts(total, left, symbol) {
    var el = document.getElementById('hud-hearts');
    if (!el) return;
    var out = '';
    for (var i = 0; i < total; i++) {
      out += '<span class="heart' + (i < left ? '' : ' lost') + '">' + (symbol || '❤️') + '</span>';
    }
    el.innerHTML = out;
  }
  function renderStarsHud(n) {
    var el = document.getElementById('hud-stars');
    if (el) el.innerHTML = starHTML(n);
  }

  /* 结果横幅：kind = success | retry | fail */
  function showResult(kind, text, btnText, onBtn) {
    var box = document.getElementById('result');
    var txt = document.getElementById('result-text');
    var btn = document.getElementById('result-btn');
    if (!box || !txt) return;
    box.className = 'result ' + kind + ' show';
    txt.innerHTML = text;
    if (btn) {
      if (btnText) {
        btn.style.display = '';
        btn.textContent = btnText;
        btn.onclick = onBtn || null;
      } else {
        btn.style.display = 'none';
      }
    }
  }
  function hideResult() {
    var box = document.getElementById('result');
    if (box) box.className = 'result';
  }

  return {
    wait: wait,
    initMember: initMember,
    markDone: markDone,
    getStars: getStars,
    saveStars: saveStars,
    starHTML: starHTML,
    setLevel: setLevel,
    renderHearts: renderHearts,
    renderStarsHud: renderStarsHud,
    showResult: showResult,
    hideResult: hideResult
  };
})();
