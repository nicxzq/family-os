# Games Library Redesign Plan

## Overview

Reorganize `games/index.html` into **4 categories** with improved UX, add 18+ new game files.

---

## Category Structure

### 🗣 问答类 (20 games — g01–g20, existing)
Display: compact "booklet card" style — narrower, portrait orientation, emoji icon prominent.

### 🔬 科学类 (20 games — 10 chemistry + 10 physics)
- Chemistry: g21 (existing) + g23–g31 (8 new stubs)
- Physics: g22 (existing) + g32–g40 (9 new stubs)

### 🧩 程序类 (block coding games)
- g41-blocks.html — **full implementation** (Scratch-like drag-and-drop)
- g42-maze-algo.html — stub
- g43-pattern-draw.html — stub

### 🌐 多学科类 (interdisciplinary)
- g44-history-detective.html — stub
- g45-geo-treasure.html — stub
- g46-words-cipher.html — stub
- g47-math-art.html — stub

---

## Task 1: games/index.html — Full Redesign

Replace the existing flat game-grid with a 4-tab category layout.

### HTML structure (index.html)

```
<nav class="games-nav"> ... back link + member btn </nav>
<header class="games-hero"> ... </header>
<div class="progress-bar"> total done / total </div>

<!-- Category tabs -->
<nav class="cat-tabs" role="tablist">
  <button role="tab" data-cat="qa" class="cat-tab is-active">🗣 问答类 <span class="cat-count">20</span></button>
  <button role="tab" data-cat="science" class="cat-tab">🔬 科学类 <span class="cat-count">20</span></button>
  <button role="tab" data-cat="code" class="cat-tab">🧩 程序类 <span class="cat-count">3</span></button>
  <button role="tab" data-cat="multi" class="cat-tab">🌐 多学科 <span class="cat-count">4</span></button>
</nav>

<!-- Q&A Panel -->
<section id="panel-qa" class="cat-panel is-active" role="tabpanel">
  <p class="panel-desc">思辨与人生 · 20 个独立小游戏</p>
  <div class="booklet-grid" id="qa-grid"></div>
</section>

<!-- Science Panel -->
<section id="panel-science" class="cat-panel" role="tabpanel">
  <div class="sci-section">
    <h3 class="sci-label">🧪 化学</h3>
    <div class="game-grid" id="chem-grid"></div>
  </div>
  <div class="sci-section">
    <h3 class="sci-label">⚡ 物理</h3>
    <div class="game-grid" id="phys-grid"></div>
  </div>
</section>

<!-- Programming Panel -->
<section id="panel-code" class="cat-panel" role="tabpanel">
  <div class="game-grid" id="code-grid"></div>
</section>

<!-- Multi-discipline Panel -->
<section id="panel-multi" class="cat-panel" role="tabpanel">
  <div class="game-grid" id="multi-grid"></div>
</section>
```

### CSS for booklet cards (Q&A style — narrower, booklet-like)

```css
.booklet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
  max-width: 800px;
}
@media (max-width: 600px) {
  .booklet-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
}

.booklet-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  text-decoration: none;
  background: var(--paper);
  border-radius: var(--radius);
  padding: 18px 12px 14px;
  box-shadow: var(--shadow-card);
  border-top: 4px solid var(--coral);
  transition: transform .2s ease;
  min-height: 140px;
  position: relative;
}
.booklet-card:hover { transform: translateY(-3px); }
.booklet-card[data-color="yellow"] { border-top-color: var(--yellow); }
.booklet-card[data-color="green"]  { border-top-color: var(--green); }
.booklet-card[data-color="blue"]   { border-top-color: var(--blue); }
.booklet-icon { font-size: 32px; margin-bottom: 8px; line-height: 1; }
.booklet-num {
  position: absolute; top: 8px; left: 10px;
  font-size: 11px; color: var(--ink-mute); letter-spacing: .1em;
}
.booklet-title { font-size: 13px; font-weight: 700; color: var(--ink); line-height: 1.4; margin-bottom: 4px; }
.booklet-done { font-size: 11px; color: var(--green); margin-top: auto; }
.booklet-todo { font-size: 11px; color: var(--ink-mute); margin-top: auto; }
```

### Science game grid (reuse existing .game-card style, narrower)

Science grid uses `.game-grid` with max 3 columns:
```css
.sci-section { margin-bottom: 40px; }
.sci-label { font-size: 16px; letter-spacing: .1em; color: var(--ink-mute); margin-bottom: 16px; }
#panel-science .game-grid {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
```

Stub games show a "🚧 即将推出" status badge instead of done/todo.

### Tab switching JS

```javascript
document.querySelectorAll('.cat-tab').forEach(function(tab){
  tab.addEventListener('click', function(){
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('is-active'));
    document.querySelectorAll('.cat-panel').forEach(p => p.classList.remove('is-active'));
    tab.classList.add('is-active');
    document.getElementById('panel-' + tab.dataset.cat).classList.add('is-active');
  });
});
```

### Q&A game data (all 20) with icons

```javascript
var qaGames = [
  ['g01-direction', '方向 vs 目标', '🧭', 'coral', '/games/g01-direction.html'],
  ['g02-compound',  '时间的魔法',   '⏰', 'yellow', '/games/g02-compound.html'],
  ['g03-responsibility', '这是谁的事？', '⚖️', 'green', '/games/g03-responsibility.html'],
  ['g04-soft-skills','软技能地图',  '🎯', 'blue', '/games/g04-soft-skills.html'],
  ['g05-attention', '注意力卫士',   '🛡️', 'coral', '/games/g05-attention.html'],
  ['g06-dilemma',   '两难题',       '🔀', 'yellow', '/games/g06-dilemma.html'],
  ['g07-reading',   '阅读侦探',     '🔍', 'green', '/games/g07-reading.html'],
  ['g08-letter',    '未来信件',     '✉️', 'blue', '/games/g08-letter.html'],
  ['g09-growth',    '成长地图',     '🗺️', 'coral', '/games/g09-growth.html'],
  ['g10-questions', '提问高手',     '❓', 'yellow', '/games/g10-questions.html'],
  ['g11-calm',      '不慌实验室',   '🌊', 'blue', '/games/g11-calm.html'],
  ['g12-express',   '表达工坊',     '💬', 'coral', '/games/g12-express.html'],
  ['g13-learn',     '学习解剖室',   '🔬', 'yellow', '/games/g13-learn.html'],
  ['g14-bias',      '思维陷阱',     '🧠', 'green', '/games/g14-bias.html'],
  ['g15-together',  '共学密码',     '🤝', 'blue', '/games/g15-together.html'],
  ['g16-empathy',   '换位思考',     '💭', 'coral', '/games/g16-empathy.html'],
  ['g17-info',      '信息鉴别',     '📡', 'yellow', '/games/g17-info.html'],
  ['g18-longterm',  '长期主义',     '🌱', 'green', '/games/g18-longterm.html'],
  ['g19-habit',     '习惯实验室',   '🔄', 'coral', '/games/g19-habit.html'],
  ['g20-connect',   '知识连接',     '🔗', 'blue', '/games/g20-connect.html'],
];
```

### Science game data

Chemistry (10):
```javascript
var chemGames = [
  ['g21-chemistry', '化学厨房',     '⚗️',  'green', '/games/g21-chemistry.html', true],
  ['g23-chemistry-elements', '元素探险', '🧪', 'green', '/games/g23-chemistry-elements.html', false],
  ['g24-chemistry-acids', '酸碱侦探', '🌡️', 'green', '/games/g24-chemistry-acids.html', false],
  ['g25-chemistry-bonds', '化学键拼图','🔗', 'green', '/games/g25-chemistry-bonds.html', false],
  ['g26-chemistry-organic', '有机物工厂','🌿','green','/games/g26-chemistry-organic.html', false],
  ['g27-chemistry-solution','溶液实验室','💧','green','/games/g27-chemistry-solution.html', false],
  ['g28-chemistry-redox', '氧化还原',  '⚡','green','/games/g28-chemistry-redox.html', false],
  ['g29-chemistry-electro','电化学',   '🔋','green','/games/g29-chemistry-electro.html', false],
  ['g30-chemistry-balance','方程式配平','⚖️','green','/games/g30-chemistry-balance.html', false],
  ['g31-chemistry-burn',   '燃烧密室', '🔥','green','/games/g31-chemistry-burn.html', false],
];
```

Physics (10):
```javascript
var physGames = [
  ['g22-physics',   '物理弹弓',    '🎯', 'blue', '/games/g22-physics.html', true],
  ['g32-physics-circuit','电路实验室','💡','blue','/games/g32-physics-circuit.html', false],
  ['g33-physics-optics', '光路迷宫', '🔭','blue','/games/g33-physics-optics.html', false],
  ['g34-physics-newton', '牛顿三定律','🍎','blue','/games/g34-physics-newton.html', false],
  ['g35-physics-magnet', '磁力对决', '🧲','blue','/games/g35-physics-magnet.html', false],
  ['g36-physics-sound',  '声波探索', '🔊','blue','/games/g36-physics-sound.html', false],
  ['g37-physics-heat',   '热传导',   '🌡️','blue','/games/g37-physics-heat.html', false],
  ['g38-physics-lever',  '杠杆原理', '⚖️','blue','/games/g38-physics-lever.html', false],
  ['g39-physics-gravity','星球引力', '🪐','blue','/games/g39-physics-gravity.html', false],
  ['g40-physics-wave',   '波动叠加', '〰️','blue','/games/g40-physics-wave.html', false],
];
```

Programming (3):
```javascript
var codeGames = [
  ['g41-blocks',    '代码积木',    '🧱', 'coral', '/games/g41-blocks.html', true],
  ['g42-maze-algo', '迷宫算法',    '🗺️', 'yellow', '/games/g42-maze-algo.html', false],
  ['g43-pattern-draw','图案绘制',  '🎨', 'green', '/games/g43-pattern-draw.html', false],
];
```

Multi-discipline (4):
```javascript
var multiGames = [
  ['g44-history',   '历史侦探',    '🏛️', 'coral', '/games/g44-history-detective.html', false],
  ['g45-geo',       '地图寻宝',    '🗺️', 'yellow', '/games/g45-geo-treasure.html', false],
  ['g46-words',     '文字密码',    '📝', 'green', '/games/g46-words-cipher.html', false],
  ['g47-math-art',  '数学画廊',    '🔢', 'blue', '/games/g47-math-art.html', false],
];
```

---

## Task 2: g41-blocks.html — Block Coding Game (FULL IMPLEMENTATION)

A Scratch-like drag-and-drop block coding game. Pure HTML/CSS/JS, no external libs.

### Concept
- **Puzzle**: Guide a robot 🤖 from start ⬛ to goal ⭐ on a 6×6 grid
- **Mechanics**: Drag code blocks into a "program slot", press "▶ 运行" to animate robot
- **3 levels** of increasing maze complexity

### Layout
```
Left panel (program area):
  - Block palette: [前进] [右转] [左转] [重复 × 2/3/4]
  - Drop zone: numbered slots (1–8)
  - [▶ 运行] button

Right panel (game stage):
  - 6×6 grid canvas (CSS grid or Canvas2D)
  - Robot position shown as 🤖 emoji overlay
  - Start cell (light green), Goal cell (yellow star)
  - Wall cells (dark)
```

### Block types
```javascript
const BLOCKS = {
  forward: { label: '前进', color: 'var(--green)', action: 'move' },
  right:   { label: '右转', color: 'var(--blue)',  action: 'turn_r' },
  left:    { label: '左转', color: 'var(--coral)', action: 'turn_l' },
  repeat2: { label: '重复×2', color: 'var(--yellow)', action: 'repeat', n: 2 },
  repeat3: { label: '重复×3', color: 'var(--yellow)', action: 'repeat', n: 3 },
};
```

### Grid levels
```javascript
const LEVELS = [
  {
    title: '关卡 1 — 直线前进',
    grid: [
      [0,0,0,0,0,0],
      [0,1,0,1,1,0],
      [0,1,0,0,1,0],
      [0,1,1,0,1,0],
      [0,0,1,0,1,0],
      [0,0,1,1,1,0],
    ],
    start: {r:1, c:1, dir:'right'},
    goal:  {r:5, c:4},
    hint: '把「前进」放进去，看看能走多远。'
  },
  // ... level 2, 3
];
// 0=wall/empty, 1=path
```

### Drag and drop
- Palette blocks are `draggable="true"` divs
- Drop zone slots accept drops; on drop insert block
- "删除" button on each placed block (×)
- "清空" button to clear program
- Max 8 blocks in program

### Animation
- "运行" runs blocks in sequence with 400ms per step
- Robot moves one cell per `前进`, rotates 90° per `右转/左转`
- `重复×N` repeats next block N times
- On reaching goal: ✨ success message + score
- On walking into wall: 💥 error, reset to start

### Visual design
- Left panel bg: `var(--cream-deep)`, rounded, shadow
- Palette block: rounded pill with color accent, text in `--ink`, drag cursor
- Drop zone slot: dashed border `--ink-mute`, numbered, becomes solid when filled
- Running state: `.is-running` class adds pulse animation on active block
- Stage: CSS grid with cell divs; `.cell-wall` = dark bg, `.cell-path` = light cream, `.cell-goal` = yellow

---

## Task 3: Stub Game Files (18 science + 3 code + 4 multi = 25 files)

All stubs share the same template structure. Create each file:
- `games/g23-chemistry-elements.html`
- `games/g24-chemistry-acids.html`
- `games/g25-chemistry-bonds.html`
- `games/g26-chemistry-organic.html`
- `games/g27-chemistry-solution.html`
- `games/g28-chemistry-redox.html`
- `games/g29-chemistry-electro.html`
- `games/g30-chemistry-balance.html`
- `games/g31-chemistry-burn.html`
- `games/g32-physics-circuit.html`
- `games/g33-physics-optics.html`
- `games/g34-physics-newton.html`
- `games/g35-physics-magnet.html`
- `games/g36-physics-sound.html`
- `games/g37-physics-heat.html`
- `games/g38-physics-lever.html`
- `games/g39-physics-gravity.html`
- `games/g40-physics-wave.html`
- `games/g42-maze-algo.html`
- `games/g43-pattern-draw.html`
- `games/g44-history-detective.html`
- `games/g45-geo-treasure.html`
- `games/g46-words-cipher.html`
- `games/g47-math-art.html`

### Stub template

Each stub has:
1. Nav bar (← 游戏库 / member button) — same as other games
2. Hero with large emoji, title, short description
3. A teaser section: "这个游戏里，你将会…" — 3 bullet points describing what the player does
4. A "coming soon" banner: `🚧 即将推出 · 敬请期待`
5. A "知识预习" section with 2–3 concept cards relevant to the topic

Each stub should be unique — unique title, emoji, description, concept cards. Here's the content for each:

#### g23-chemistry-elements.html — 元素探险 🧪
- Desc: 元素周期表里住着 118 个元素，它们都有什么脾气？
- Teaser: 用卡牌翻翻乐认识元素；匹配元素符号和名称；发现同族元素的共同规律
- Concept cards: 原子序数（质子数决定元素身份）；族和周期（横行竖列的规律）；金属与非金属（导电、光泽、延展性）

#### g24-chemistry-acids.html — 酸碱侦探 🌡️
- Desc: 柠檬、洗衣粉、白醋、牛奶……哪个是酸，哪个是碱？
- Teaser: 测量 pH 值判断酸碱；中和反应让颜色消失；设计实验区分未知液体
- Concept cards: pH 值（0–14，7 是中性）；酸碱指示剂（石蕊、酚酞变色原理）；中和反应（酸 + 碱 → 盐 + 水）

#### g25-chemistry-bonds.html — 化学键拼图 🔗
- Desc: 原子单独存在很孤单，它们喜欢手牵手——这就是化学键。
- Teaser: 拖动电子配对形成共价键；给离子配对形成离子化合物；观察分子的3D立体结构
- Concept cards: 共价键（共享电子对）；离子键（正负离子吸引）；化学式（元素符号 + 数字下标）

#### g26-chemistry-organic.html — 有机物工厂 🌿
- Desc: 碳元素是有机物的骨架，它能连成链、环，建造出生命的材料。
- Teaser: 搭建甲烷、乙烯、苯的模型；区分烷烃、烯烃、炔烃；认识生活中的有机物（塑料、乙醇、葡萄糖）
- Concept cards: 碳的四价（能连4个键）；同系物（相差 CH₂ 的一组分子）；官能团（决定性质的原子团）

#### g27-chemistry-solution.html — 溶液实验室 💧
- Desc: 一勺糖放进水里就消失了？不，它只是藏起来了。
- Teaser: 调配不同浓度的溶液；观察溶解度随温度的变化；结晶实验——让消失的固体重新出现
- Concept cards: 溶质与溶剂（溶解的和溶解它的）；溶解度（100g溶剂最多溶多少）；饱和溶液（溶满了就不溶了）

#### g28-chemistry-redox.html — 氧化还原 ⚡
- Desc: 铁生锈、电池放电、光合作用——背后都是同一个故事：电子的旅行。
- Teaser: 追踪电子从哪里来到哪里去；判断谁被氧化谁被还原；配平氧化还原方程式
- Concept cards: 化合价（电子的得失计数）；氧化剂与还原剂（得电子/失电子的那个）；电子守恒（得到的 = 失去的）

#### g29-chemistry-electro.html — 电化学 🔋
- Desc: 第一块电池是用锌片、铜片和盐水做的——200年前的智慧，今天仍在用。
- Teaser: 组装伏打电堆看电压表；电解水分离氢气和氧气；设计铜的电镀实验
- Concept cards: 原电池（化学能→电能）；电解池（电能→化学能）；两极反应（正极还原，负极氧化）

#### g30-chemistry-balance.html — 方程式配平 ⚖️
- Desc: 化学方程式两边的原子必须相等——这是宇宙的守恒法则。
- Teaser: 数原子、找差异、添系数；用观察法快速配平简单方程式；掌握氧化还原方程式的配平技巧
- Concept cards: 质量守恒（反应前后总质量不变）；化学计量数（方程式前面的系数）；最小公倍数法（配平技巧）

#### g31-chemistry-burn.html — 燃烧密室 🔥
- Desc: 火是什么？为什么有些东西燃烧，有些不燃？灭火器里藏着什么秘密？
- Teaser: 点燃三角形——找到燃烧的三个条件；移除一个条件看火焰如何熄灭；设计最高效的灭火方案
- Concept cards: 燃烧三要素（可燃物 + 氧气 + 着火点）；灭火原理（隔离、降温、隔绝氧气）；爆炸极限（气体浓度的危险区间）

#### g32-physics-circuit.html — 电路实验室 💡
- Desc: 手电筒、充电器、家里的插座——它们背后都是同一套电路逻辑。
- Teaser: 连接串联与并联电路；用欧姆定律预测电流；短路保护——学会安全用电
- Concept cards: 欧姆定律（I = U/R）；串联与并联（总电阻的计算方式不同）；电功率（P = UI，单位瓦特）

#### g33-physics-optics.html — 光路迷宫 🔭
- Desc: 光是直线传播的，但镜子和水能让它拐弯——来驾驭光束。
- Teaser: 用镜子反射光束穿过迷宫；调整棱镜角度折射光线；用凸透镜让光汇聚到焦点
- Concept cards: 反射定律（入射角 = 反射角）；折射定律（光从密到疏，偏离法线）；凸透镜成像（焦距决定倒正大小）

#### g34-physics-newton.html — 牛顿三定律 🍎
- Desc: 苹果为什么落地？火箭为什么飞天？牛顿的三条定律回答了一切。
- Teaser: 给物体施加合力观察加速度变化；验证力的作用是相互的；设计火箭喷射路径
- Concept cards: 惯性（不受力就保持原状）；F=ma（合力越大，加速度越大）；作用力与反作用力（大小相等方向相反）

#### g35-physics-magnet.html — 磁力对决 🧲
- Desc: 同极相斥、异极相吸——简单的规律，却能造出电动机和发电机。
- Teaser: 放置磁铁观察磁场线方向；利用排斥力把物体悬浮；拖动线圈切割磁感线产生电流
- Concept cards: 磁场（看不见但真实存在的力场）；地磁场（地球本身是一块大磁铁）；电磁感应（运动产生电，电产生磁）

#### g36-physics-sound.html — 声波探索 🔊
- Desc: 声音是振动，振动是波，波能穿越空气、水和固体——但不能穿越真空。
- Teaser: 调节频率听音高变化；改变振幅观察响度；声波在不同介质里的传播速度对比
- Concept cards: 频率与音调（Hz 越高，声音越尖）；振幅与响度（振动幅度越大，越响）；回声（反射声波与原声的时差）

#### g37-physics-heat.html — 热传导 🌡️
- Desc: 为什么铁棒比木棒更烫手？热量是怎么从一个地方跑到另一个地方的？
- Teaser: 观察热传导在不同材料中的速度；对流实验——水是怎么"搅动"热量的；红外辐射——颜色和表面对散热的影响
- Concept cards: 导热系数（金属>液体>气体）；对流（密度差驱动流体运动）；热辐射（不需要介质，能在真空中传播）

#### g38-physics-lever.html — 杠杆原理 ⚖️
- Desc: 阿基米德说：给我一个支点，我能撬动地球。杠杆原理是力学的第一课。
- Teaser: 移动砝码找到平衡点；用省力杠杆抬起重物；识别日常工具里的三类杠杆
- Concept cards: 力矩（力 × 力臂，旋转的"能力"）；三类杠杆（省力、省距离、改变方向）；机械效率（有用功/总功 × 100%）

#### g39-physics-gravity.html — 星球引力 🪐
- Desc: 月亮绕着地球转，地球绕着太阳转——是同一个力在控制一切。
- Teaser: 调整行星质量看轨道变化；发射卫星到正确的轨道高度；计算逃逸速度
- Concept cards: 万有引力（F = Gm₁m₂/r²）；轨道速度（越高轨道，速度越慢）；失重（自由落体时感受不到重力）

#### g40-physics-wave.html — 波动叠加 〰️
- Desc: 两列波相遇会发生什么？有时它们叠加加强，有时互相抵消。
- Teaser: 叠加两列相同频率的波；调整相位差观察干涉条纹；耳机降噪的原理——反相波消声
- Concept cards: 叠加原理（位移直接相加）；干涉（相长→亮纹，相消→暗纹）；衍射（波绕过障碍物的能力）

#### g42-maze-algo.html — 迷宫算法 🗺️
- Desc: 计算机是如何在地图上找到最短路径的？你来当算法工程师。
- Teaser: 用广度优先搜索找到最短路径；观察深度优先搜索如何探索迷宫；比较不同算法的效率
- Concept cards: BFS（层层扩散，保证最短）；DFS（一条路走到黑，再回头）；时间复杂度（操作步数随数据量增长的速度）

#### g43-pattern-draw.html — 图案绘制 🎨
- Desc: 用几行循环代码，就能画出复杂的几何图案——这就是编程的美。
- Teaser: 用 for 循环画出螺旋线；嵌套循环绘制棋盘格；函数复用——把正六边形铺满画布
- Concept cards: 循环（重复执行，减少代码量）；变量（让每次循环做不同的事）；函数（给一段代码起名字，可以反复调用）

#### g44-history-detective.html — 历史侦探 🏛️
- Desc: 历史不只是背年份，它是一连串的因果——找到线索，还原真相。
- Teaser: 分析史料判断事件的真假；用时间线找出因果关系；比较东西方同一时期发生了什么
- Concept cards: 一手资料（亲历者留下的记录）；因果逻辑（什么条件导致了什么结果）；历史解释（史料 + 推理 = 结论）

#### g45-geo-treasure.html — 地图寻宝 🗺️
- Desc: 经度和纬度是地球的坐标系，掌握它你就能找到世界上任何一个地方。
- Teaser: 用经纬度坐标锁定城市；计算两点之间的球面距离；根据气候线索猜测地理位置
- Concept cards: 经纬度（经度0°在英国格林尼治，纬度0°在赤道）；比例尺（地图上1cm代表实地多远）；时区（经度每15°一个时区）

#### g46-words-cipher.html — 文字密码 📝
- Desc: 密码学从字母替换开始——凯撒、维吉尼亚、摩斯，每一种都有独特的逻辑。
- Teaser: 破解凯撒密码（字母位移）；用频率分析找到代替密码的规律；制作和解读摩斯电码
- Concept cards: 对称加密（加解密用同一把钥匙）；频率分析（E 是英语中最常出现的字母）；摩斯电码（点和划的二进制组合）

#### g47-math-art.html — 数学画廊 🔢
- Desc: 雪花、贝壳、树枝——大自然用数学画画，你也可以。
- Teaser: 用黄金比例螺旋设计图案；生成科赫雪花分形；探索斐波那契数列出现在植物中的规律
- Concept cards: 黄金比例（约1.618，自然界的美学公式）；分形（自相似的无限细节）；斐波那契数列（1,1,2,3,5,8,13…每项是前两项之和）

---

## Tab CSS

```css
.cat-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.cat-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 2px solid transparent;
  border-radius: 999px;
  background: var(--paper);
  color: var(--ink-soft);
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
  transition: all .2s;
}
.cat-tab:hover { border-color: var(--ink-mute); }
.cat-tab.is-active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.cat-count {
  background: rgba(255,255,255,.2);
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 12px;
}
.cat-tab:not(.is-active) .cat-count {
  background: var(--cream-deep);
  color: var(--ink-mute);
}
.cat-panel { display: none; }
.cat-panel.is-active { display: block; }
.panel-desc { color: var(--ink-soft); font-size: 16px; margin-bottom: 24px; }
```

---

## Summary of files to create/modify

### MODIFY:
- `games/index.html` — full redesign as specified above

### CREATE:
- `games/g41-blocks.html` — full block coding game
- `games/g23-chemistry-elements.html` — stub
- `games/g24-chemistry-acids.html` — stub
- `games/g25-chemistry-bonds.html` — stub
- `games/g26-chemistry-organic.html` — stub
- `games/g27-chemistry-solution.html` — stub
- `games/g28-chemistry-redox.html` — stub
- `games/g29-chemistry-electro.html` — stub
- `games/g30-chemistry-balance.html` — stub
- `games/g31-chemistry-burn.html` — stub
- `games/g32-physics-circuit.html` — stub
- `games/g33-physics-optics.html` — stub
- `games/g34-physics-newton.html` — stub
- `games/g35-physics-magnet.html` — stub
- `games/g36-physics-sound.html` — stub
- `games/g37-physics-heat.html` — stub
- `games/g38-physics-lever.html` — stub
- `games/g39-physics-gravity.html` — stub
- `games/g40-physics-wave.html` — stub
- `games/g42-maze-algo.html` — stub
- `games/g43-pattern-draw.html` — stub
- `games/g44-history-detective.html` — stub
- `games/g45-geo-treasure.html` — stub
- `games/g46-words-cipher.html` — stub
- `games/g47-math-art.html` — stub

Total: 1 modify + 25 create = 26 files.

---

## Design tokens (must use, no hardcoded values)

```
var(--coral)       #E56B5A
var(--coral-soft)  #F4A799
var(--yellow)      #F4C13E
var(--yellow-soft) #FBE39A
var(--green)       #6FA86D
var(--green-soft)  #B5D4A8
var(--blue)        #4B7BA8
var(--blue-soft)   #A8C2DE
var(--cream)       #F8F2E2
var(--cream-deep)  #F1E8D0
var(--ink)         #2B2419
var(--ink-soft)    #5C4F3D
var(--ink-mute)    #8C7C66
var(--paper)       #FFFDF6
var(--shadow-card) 0 4px 0 rgba(43,36,25,.06), 0 12px 32px -16px rgba(43,36,25,.18)
var(--shadow-soft) 0 2px 0 rgba(43,36,25,.08)
var(--radius)      18px
var(--radius-lg)   28px
```

Font: `"LXGW WenKai TC"` only. Loaded from Google Fonts CDN. No other typefaces.
