(function(){
  var cfg = window.PHYSICS_GAME;
  if (!cfg) return;

  var canvas = document.getElementById('physics-canvas');
  var ctx = canvas.getContext('2d');
  var W = canvas.width;
  var H = canvas.height;
  var state = {};
  var running = false;
  var raf = 0;
  var score = 0;

  function $(id){ return document.getElementById(id); }
  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function fmt(v){ return Math.round(v * 10) / 10; }

  function markDone(){
    var a = [];
    try { a = JSON.parse(localStorage.getItem('fo_games_done') || '[]'); } catch(e) {}
    if (a.indexOf(cfg.id) < 0) {
      a.push(cfg.id);
      localStorage.setItem('fo_games_done', JSON.stringify(a));
    }
    $('badge').textContent = '已完成';
    $('badge').className = 'physics-pill is-done';
  }

  function message(text, good){
    $('message').innerHTML = text;
    $('message').className = 'physics-message' + (good ? ' good' : '');
    if (good) {
      score++;
      $('score').textContent = '成功：' + score + ' 次';
      if (score >= 2) markDone();
    }
  }

  function resetState(){
    running = false;
    cancelAnimationFrame(raf);
    state = { t: 0, sparks: [], dots: [], heat: [20, 20, 20, 20, 20, 20, 20], waveShift: 0, orbitTrail: [] };
    cfg.controls.forEach(function(c){ state[c.id] = c.value; });
    draw();
    message(cfg.prompt, false);
  }

  function setupDom(){
    $('title').textContent = cfg.title;
    $('emoji').textContent = cfg.emoji;
    $('sub').textContent = cfg.sub;
    $('concept').textContent = cfg.concept;
    $('mission').textContent = cfg.mission;
    $('learn').innerHTML = cfg.learn.map(function(x){ return '<li>' + x + '</li>'; }).join('');
    $('score').textContent = '成功：0 次';
    $('badge').textContent = '挑战中';

    $('controls').innerHTML = cfg.controls.map(function(c){
      return '<div class="physics-control"><label for="' + c.id + '">' +
        '<span>' + c.label + '</span><strong id="' + c.id + '-val">' + c.value + c.unit + '</strong></label>' +
        '<input id="' + c.id + '" type="range" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + c.value + '"></div>';
    }).join('') + '<div class="physics-actions"><button class="physics-btn" id="run-btn">运行</button><button class="physics-btn secondary" id="reset-btn">重置</button></div>';

    cfg.controls.forEach(function(c){
      var input = $(c.id);
      input.addEventListener('input', function(){
        state[c.id] = parseFloat(input.value);
        $(c.id + '-val').textContent = input.value + c.unit;
        if (!running || cfg.type === 'wave' || cfg.type === 'sound' || cfg.type === 'circuit') draw();
      });
    });
    $('run-btn').onclick = run;
    $('reset-btn').onclick = resetState;

    var m = window.FO && FO.getMember();
    var el = $('nav-member-btn');
    if (m) {
      el.innerHTML = FO.avatarSVG(m.avatar, m.color, 32) + '<span>' + m.name + '</span>';
      el.onclick = function(){ location.href='../dashboard.html'; };
    } else {
      el.innerHTML = '<span>登录</span>';
      el.onclick = function(){ location.href='../login.html'; };
    }
  }

  function bg(){
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#dfeffd');
    g.addColorStop(1, '#fffdf6');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(43,36,25,.08)';
    for (var x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = 40; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  function circle(x, y, r, fill, stroke){
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }

  function line(x1, y1, x2, y2, color, width, dash){
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 3;
    ctx.setLineDash(dash || []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawCircuit(){
    var battery = state.voltage;
    var r1 = state.resistance;
    var closed = state.switching > 50;
    var current = closed ? battery / r1 : 0;
    bg();
    line(140, 250, 140, 110, '#2b2419', 5);
    line(140, 110, 320, 110, '#2b2419', 5);
    line(420, 110, 600, 110, '#2b2419', 5);
    line(600, 110, 600, 250, '#2b2419', 5);
    line(600, 250, 140, 250, '#2b2419', 5);
    ctx.fillStyle = '#4b7ba8'; ctx.fillRect(110, 180, 60, 72);
    ctx.fillStyle = '#fffdf6'; ctx.font = '18px serif'; ctx.fillText(battery + 'V', 122, 222);
    circle(370, 110, 38, current > 0.12 ? '#fbe39a' : '#f1e8d0', '#2b2419');
    circle(370, 110, 17 + current * 28, 'rgba(244,193,62,.35)');
    ctx.fillStyle = '#2b2419'; ctx.fillText('灯泡', 352, 170);
    line(500, 110, closed ? 560 : 545, closed ? 110 : 78, closed ? '#6fa86d' : '#e56b5a', 6);
    ctx.fillText('开关', 500, 72);
    for (var i = 0; i < Math.floor(current * 24); i++) {
      var p = (state.t * 0.03 + i / 18) % 1;
      var x = p < .5 ? lerp(150, 590, p * 2) : (p < .75 ? 600 : 140);
      var y = p < .5 ? 250 : (p < .75 ? lerp(250, 115, (p - .5) * 4) : lerp(110, 245, (p - .75) * 4));
      circle(x, y, 4, '#e56b5a');
    }
    return current > 0.25 && current < 0.9 ? '电流 ' + fmt(current) + 'A，灯泡稳定发亮。' : current >= 0.9 ? '电流过大，容易烧坏灯泡。加大电阻试试。' : '电流太小或开关未闭合。';
  }

  function drawOptics(){
    var mirror = state.mirror;
    var target = state.target;
    bg();
    var sx = 80, sy = 190, mx = 360, my = 190;
    var ang = (mirror - 90) * Math.PI / 180;
    line(mx - Math.cos(ang) * 90, my - Math.sin(ang) * 90, mx + Math.cos(ang) * 90, my + Math.sin(ang) * 90, '#4b7ba8', 8);
    circle(sx, sy, 26, '#fbe39a', '#2b2419');
    ctx.fillStyle = '#2b2419'; ctx.fillText('激光', 58, 236);
    line(sx + 26, sy, mx, my, '#e56b5a', 4);
    var reflect = (180 - mirror * 2) * Math.PI / 180;
    var ex = mx + Math.cos(reflect) * 300;
    var ey = my + Math.sin(reflect) * 300;
    line(mx, my, ex, ey, '#e56b5a', 4);
    var ty = 80 + target * 2.2;
    ctx.fillStyle = '#6fa86d'; ctx.fillRect(650, ty - 38, 24, 76);
    circle(662, ty, 18, '#fffdf6', '#2b2419');
    var hit = Math.abs(ey - ty) < 28;
    if (hit) circle(662, ty, 34, 'rgba(111,168,109,.35)');
    return hit ? '反射光命中接收器。入射角等于反射角。' : '还没对准。调整镜面角度，让反射光落到右侧接收器。';
  }

  function drawNewton(){
    bg();
    var force = state.force;
    var mass = state.mass;
    var friction = state.friction;
    var acc = Math.max(0, (force - friction) / mass);
    var x = 110 + Math.min(470, acc * state.t * state.t * 0.018);
    line(70, 280, 650, 280, '#6fa86d', 6);
    ctx.fillStyle = '#4b7ba8'; ctx.fillRect(x, 220, 105, 55);
    circle(x + 25, 284, 15, '#2b2419');
    circle(x + 82, 284, 15, '#2b2419');
    line(x - 50, 248, x - 5, 248, '#e56b5a', 5);
    ctx.fillStyle = '#e56b5a'; ctx.font = '20px serif'; ctx.fillText(force + 'N', x - 66, 235);
    ctx.fillStyle = '#2b2419'; ctx.fillText('a = ' + fmt(acc) + ' m/s²', 305, 72);
    return acc > 4 && x > 500 ? '小车明显加速冲过终点。F=ma：同样质量下，合力越大加速度越大。' : '加速度还不够。增大推力、减小质量或摩擦。';
  }

  function drawMagnet(){
    bg();
    var polarity = state.polarity > 50 ? 1 : -1;
    var distance = state.distance;
    var strength = state.strength;
    var force = polarity * strength / Math.pow(distance / 40, 2);
    var mx = 140, bx = 370 + clamp(force * 2.2, -125, 170);
    ctx.fillStyle = '#e56b5a'; ctx.fillRect(mx, 145, 78, 86);
    ctx.fillStyle = '#4b7ba8'; ctx.fillRect(mx + 39, 145, 39, 86);
    ctx.fillStyle = '#fffdf6'; ctx.font = '22px serif'; ctx.fillText(polarity > 0 ? 'N S' : 'S N', mx + 16, 195);
    circle(bx, 188, 32, '#f1e8d0', '#2b2419');
    ctx.fillStyle = '#2b2419'; ctx.fillText('铁球', bx - 20, 244);
    for (var i = 0; i < 9; i++) {
      var y = 88 + i * 25;
      line(230, y, bx - 42, y + Math.sin(i + state.t * .05) * 16, polarity > 0 ? '#6fa86d' : '#e56b5a', 2, [6, 7]);
    }
    return Math.abs(force) > 70 ? '磁场足够强，铁球被明显吸引/排斥。距离越近，作用越强。' : '磁力还不明显。增强磁铁或缩短距离。';
  }

  function drawSound(){
    bg();
    var freq = state.frequency;
    var amp = state.amplitude;
    var noise = state.noise;
    ctx.fillStyle = '#4b7ba8'; ctx.fillRect(76, 145, 56, 90);
    ctx.fillStyle = '#2b2419'; ctx.fillText('音箱', 82, 255);
    ctx.strokeStyle = '#e56b5a'; ctx.lineWidth = 4; ctx.beginPath();
    for (var x = 145; x < 650; x++) {
      var n = Math.sin((x + state.t * 2) * freq / 900) * amp;
      var wobble = Math.sin((x + state.t) * .08) * noise * .25;
      var y = 190 + n + wobble;
      if (x === 145) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    circle(590, 190, 34, '#fffdf6', '#2b2419');
    var clean = noise < 30 && amp > 45 && freq > 360;
    if (clean) circle(590, 190, 48, 'rgba(111,168,109,.25)');
    return clean ? '波形清楚、振幅足够，接收器识别到声音。频率决定音高，振幅决定响度。' : '声音还不够清晰。提高振幅、减少噪声，观察波形变化。';
  }

  function drawHeat(){
    bg();
    var source = state.source;
    var conduct = state.conductivity / 100;
    var cooling = state.cooling / 100;
    state.heat[0] = source;
    for (var i = 1; i < state.heat.length; i++) {
      state.heat[i] += (state.heat[i - 1] - state.heat[i]) * conduct * .018;
      state.heat[i] -= cooling * .035;
      state.heat[i] = clamp(state.heat[i], 18, 120);
    }
    for (var j = 0; j < state.heat.length; j++) {
      var hot = (state.heat[j] - 18) / 102;
      ctx.fillStyle = 'rgb(' + Math.round(75 + hot * 180) + ',' + Math.round(123 - hot * 60) + ',' + Math.round(168 - hot * 120) + ')';
      ctx.fillRect(110 + j * 78, 145, 72, 72);
      ctx.fillStyle = '#fffdf6'; ctx.fillText(Math.round(state.heat[j]) + '°', 126 + j * 78, 188);
    }
    ctx.fillStyle = '#e56b5a'; ctx.fillRect(92, 230, 110, 22);
    var endHot = state.heat[state.heat.length - 1] > 52;
    return endHot ? '热量传到最右端。导热越强，温度差传播越快。' : '末端还不热。提高热源或导热率，降低散热。';
  }

  function drawLever(){
    bg();
    var left = state.leftWeight;
    var right = state.rightWeight;
    var pivot = state.pivot;
    var leftArm = pivot;
    var rightArm = 100 - pivot;
    var torque = left * leftArm - right * rightArm;
    var tilt = clamp(torque / 2500, -0.35, 0.35);
    var cx = 360, cy = 205;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-tilt);
    line(-230, 0, 230, 0, '#4b7ba8', 12);
    circle(-190, 42, 28 + left * .18, '#e56b5a', '#2b2419');
    circle(190, 42, 28 + right * .18, '#f4c13e', '#2b2419');
    ctx.fillStyle = '#2b2419'; ctx.fillText(left + 'kg', -214, 92); ctx.fillText(right + 'kg', 166, 92);
    ctx.restore();
    ctx.fillStyle = '#6fa86d';
    ctx.beginPath(); ctx.moveTo(cx - 34, 280); ctx.lineTo(cx + 34, 280); ctx.lineTo(cx, 205); ctx.fill();
    var balanced = Math.abs(torque) < 260;
    return balanced ? '杠杆接近平衡。力矩 = 重量 × 力臂。' : '还不平衡。移动支点或改变两边重量，让左右力矩接近。';
  }

  function drawGravity(){
    bg();
    var mass = state.planetMass;
    var speed = state.launchSpeed;
    var altitude = state.altitude;
    var cx = 360, cy = 190;
    var orbit = 62 + altitude;
    circle(cx, cy, 48 + mass * 2.4, '#4b7ba8', '#2b2419');
    circle(cx, cy, orbit, 'rgba(75,123,168,.08)', 'rgba(75,123,168,.45)');
    var ideal = Math.sqrt(mass / orbit) * 78;
    var stable = Math.abs(speed - ideal) < 6;
    state.waveShift += (speed / Math.max(orbit, 40)) * .018;
    var a = state.waveShift;
    var sx = cx + Math.cos(a) * orbit;
    var sy = cy + Math.sin(a) * orbit;
    state.orbitTrail.push([sx, sy]);
    if (state.orbitTrail.length > 90) state.orbitTrail.shift();
    for (var i = 1; i < state.orbitTrail.length; i++) line(state.orbitTrail[i-1][0], state.orbitTrail[i-1][1], state.orbitTrail[i][0], state.orbitTrail[i][1], 'rgba(229,107,90,.35)', 2);
    circle(sx, sy, 12, stable ? '#6fa86d' : '#e56b5a', '#2b2419');
    ctx.fillStyle = '#2b2419'; ctx.fillText('理想速度约 ' + fmt(ideal), 54, 66);
    return stable ? '卫星进入稳定轨道。轨道越高，需要的速度越低。' : speed > ideal ? '速度偏大，轨道会被甩高甚至逃逸。' : '速度偏小，卫星会落回星球。';
  }

  function drawWave(){
    bg();
    var a1 = state.ampA, a2 = state.ampB, phase = state.phase;
    state.waveShift += .06;
    function waveY(x, amp, ph){ return 190 + Math.sin(x * .035 + ph + state.waveShift) * amp; }
    line(60, 190, 660, 190, 'rgba(43,36,25,.18)', 2);
    ctx.strokeStyle = '#4b7ba8'; ctx.lineWidth = 2; ctx.beginPath();
    for (var x = 60; x <= 660; x++) { var y = waveY(x, a1, 0); if (x === 60) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
    ctx.strokeStyle = '#f4c13e'; ctx.beginPath();
    for (x = 60; x <= 660; x++) { y = waveY(x, a2, phase / 57.3); if (x === 60) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
    ctx.strokeStyle = '#e56b5a'; ctx.lineWidth = 5; ctx.beginPath();
    var max = 0;
    for (x = 60; x <= 660; x++) {
      y = 190 + (waveY(x, a1, 0) - 190) + (waveY(x, a2, phase / 57.3) - 190);
      max = Math.max(max, Math.abs(y - 190));
      if (x === 60) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    return max > 95 ? '两列波发生明显增强叠加。波峰遇波峰，振幅变大。' : phase > 145 && phase < 215 ? '接近相消叠加。波峰遇波谷，振幅变小。' : '调节相位和振幅，观察红色合成波如何变化。';
  }

  function draw(){
    state.t++;
    var text = {
      circuit: drawCircuit,
      optics: drawOptics,
      newton: drawNewton,
      magnet: drawMagnet,
      sound: drawSound,
      heat: drawHeat,
      lever: drawLever,
      gravity: drawGravity,
      wave: drawWave
    }[cfg.type]();
    $('live').textContent = text;
  }

  function tick(){
    if (!running) return;
    draw();
    raf = requestAnimationFrame(tick);
  }

  function run(){
    if (cfg.type === 'wave' || cfg.type === 'gravity' || cfg.type === 'heat' || cfg.type === 'newton') {
      running = true;
      state.t = 0;
      tick();
      setTimeout(check, 1400);
    } else {
      draw();
      check();
    }
  }

  function check(){
    var ok = false;
    if (cfg.type === 'circuit') ok = state.switching > 50 && state.voltage / state.resistance > .25 && state.voltage / state.resistance < .9;
    if (cfg.type === 'optics') ok = $('live').textContent.indexOf('命中') >= 0;
    if (cfg.type === 'newton') ok = Math.max(0, (state.force - state.friction) / state.mass) > 4;
    if (cfg.type === 'magnet') ok = Math.abs((state.polarity > 50 ? 1 : -1) * state.strength / Math.pow(state.distance / 40, 2)) > 70;
    if (cfg.type === 'sound') ok = state.noise < 30 && state.amplitude > 45 && state.frequency > 360;
    if (cfg.type === 'heat') ok = state.heat[state.heat.length - 1] > 52;
    if (cfg.type === 'lever') ok = Math.abs(state.leftWeight * state.pivot - state.rightWeight * (100 - state.pivot)) < 260;
    if (cfg.type === 'gravity') {
      var ideal = Math.sqrt(state.planetMass / (62 + state.altitude)) * 78;
      ok = Math.abs(state.launchSpeed - ideal) < 6;
    }
    if (cfg.type === 'wave') ok = $('live').textContent.indexOf('增强') >= 0 || $('live').textContent.indexOf('相消') >= 0;
    message(ok ? cfg.success : cfg.tryAgain, ok);
  }

  setupDom();
  resetState();
  if (cfg.type === 'wave' || cfg.type === 'sound') { running = true; tick(); }
})();
