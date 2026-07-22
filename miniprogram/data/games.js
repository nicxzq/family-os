// 手工维护：游戏中心目录数据（R6 §6）。对齐网站 games/index.html 的目录清单
// （qaGames / chemGames / physGames / codeGames / multiGames 五个数组），网站新增/
// 调整游戏时同步在此维护，不要新增网站没有的游戏。
//
// cat 取值：qa（问答，21 个）/ sci（科学，化学 20 + 物理 11 = 31 个）/
// code（程序，11 个）/ multi（多学科，5 个）。
//
// live: true 表示该游戏已在小程序内实现为原生页面（page 指向小程序页面路径）；
// 其余 59 个为预告位——网站版已可玩，小程序版尚未做，page 留空字符串。
// 本批（P4a）只落地了 qa（g01-direction）与 multi（g44-history-detective）两个
// 页面；g22-physics / g21-chemistry / g41-blocks 的 page 路径按同一命名约定预先
// 占位，供下一批直接接入，暂不会被小程序侧调用（app.json 未注册对应路由）。
var CATS = [
  { id: 'all', label: '全部' },
  { id: 'qa', label: '问答' },
  { id: 'sci', label: '科学' },
  { id: 'code', label: '程序' },
  { id: 'multi', label: '多学科' }
];

var GAMES = [
  // 问答类 20 个（网站 qaGames）
  { id: 'g01-direction', name: '方向 vs 目标', emoji: '🧭', color: 'coral', cat: 'qa', live: true, page: '/pages/games/qa/qa' },
  { id: 'g02-compound', name: '时间的魔法', emoji: '⏰', color: 'yellow', cat: 'qa', live: false, page: '' },
  { id: 'g03-responsibility', name: '这是谁的事？', emoji: '⚖️', color: 'green', cat: 'qa', live: false, page: '' },
  { id: 'g04-soft-skills', name: '软技能地图', emoji: '🎯', color: 'blue', cat: 'qa', live: false, page: '' },
  { id: 'g05-attention', name: '注意力卫士', emoji: '🛡️', color: 'coral', cat: 'qa', live: false, page: '' },
  { id: 'g06-dilemma', name: '两难题', emoji: '🔀', color: 'yellow', cat: 'qa', live: false, page: '' },
  { id: 'g07-reading', name: '阅读侦探', emoji: '🔍', color: 'green', cat: 'qa', live: false, page: '' },
  { id: 'g08-letter', name: '未来信件', emoji: '✉️', color: 'blue', cat: 'qa', live: false, page: '' },
  { id: 'g09-growth', name: '成长地图', emoji: '🗺️', color: 'coral', cat: 'qa', live: false, page: '' },
  { id: 'g10-questions', name: '提问高手', emoji: '❓', color: 'yellow', cat: 'qa', live: false, page: '' },
  { id: 'g11-calm', name: '不慌实验室', emoji: '🌊', color: 'blue', cat: 'qa', live: false, page: '' },
  { id: 'g12-express', name: '表达工坊', emoji: '💬', color: 'coral', cat: 'qa', live: false, page: '' },
  { id: 'g13-learn', name: '学习解剖室', emoji: '🔬', color: 'yellow', cat: 'qa', live: false, page: '' },
  { id: 'g14-bias', name: '思维陷阱', emoji: '🧠', color: 'green', cat: 'qa', live: false, page: '' },
  { id: 'g15-together', name: '共学密码', emoji: '🤝', color: 'blue', cat: 'qa', live: false, page: '' },
  { id: 'g16-empathy', name: '换位思考', emoji: '💭', color: 'coral', cat: 'qa', live: false, page: '' },
  { id: 'g17-info', name: '信息鉴别', emoji: '📡', color: 'yellow', cat: 'qa', live: false, page: '' },
  { id: 'g18-longterm', name: '长期主义', emoji: '🌱', color: 'green', cat: 'qa', live: false, page: '' },
  { id: 'g19-habit', name: '习惯实验室', emoji: '🔄', color: 'coral', cat: 'qa', live: false, page: '' },
  { id: 'g20-connect', name: '知识连接', emoji: '🔗', color: 'blue', cat: 'qa', live: false, page: '' },
  { id: 'g60-mistakes', name: '错误博物馆', emoji: '🏛️', color: 'green', cat: 'qa', live: false, page: '' },

  // 科学类 · 化学 20 个（网站 chemGames，均为 color: green）
  { id: 'g21-chemistry', name: '化学厨房', emoji: '⚗️', color: 'green', cat: 'sci', live: true, page: '/pages/games/chem/chem' },
  { id: 'g23-chemistry-elements', name: '元素探险', emoji: '🧪', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g24-chemistry-acids', name: '酸碱侦探', emoji: '🌡️', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g25-chemistry-bonds', name: '化学键拼图', emoji: '🔗', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g26-chemistry-organic', name: '有机物工厂', emoji: '🌿', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g27-chemistry-solution', name: '溶液实验室', emoji: '💧', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g28-chemistry-redox', name: '氧化还原', emoji: '⚡', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g29-chemistry-electro', name: '电化学', emoji: '🔋', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g30-chemistry-balance', name: '方程式配平', emoji: '⚖️', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g31-chemistry-burn', name: '燃烧密室', emoji: '🔥', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g48-chemistry-gas', name: '气体大变身', emoji: '💨', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g49-chemistry-mole', name: '摩尔小算盘', emoji: '🔢', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g50-chemistry-metal', name: '金属擂台', emoji: '🥇', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g51-chemistry-rate', name: '快慢实验室', emoji: '⏱️', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g52-chemistry-mixture', name: '分离大师', emoji: '🥽', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g48-chem-indicator', name: '酸碱指示剂', emoji: '🌈', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g49-chem-flame', name: '焰色反应', emoji: '🔥', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g50-chem-balance', name: '方程式配平', emoji: '⚖️', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g51-chem-mixing', name: '溶液混合变色', emoji: '🧫', color: 'green', cat: 'sci', live: false, page: '' },
  { id: 'g52-chem-electro', name: '电解水实验', emoji: '⚡', color: 'green', cat: 'sci', live: false, page: '' },

  // 科学类 · 物理 10 个（网站 physGames，均为 color: blue）
  { id: 'g22-physics', name: '物理弹弓', emoji: '🎯', color: 'blue', cat: 'sci', live: true, page: '/pages/games/physics/physics' },
  { id: 'g32-physics-circuit', name: '电路实验室', emoji: '💡', color: 'blue', cat: 'sci', live: false, page: '' },
  { id: 'g33-physics-optics', name: '光路迷宫', emoji: '🔭', color: 'blue', cat: 'sci', live: false, page: '' },
  { id: 'g34-physics-newton', name: '小车加速度', emoji: '🍎', color: 'blue', cat: 'sci', live: false, page: '' },
  { id: 'g35-physics-magnet', name: '磁力对决', emoji: '🧲', color: 'blue', cat: 'sci', live: false, page: '' },
  { id: 'g36-physics-sound', name: '声波探索', emoji: '🔊', color: 'blue', cat: 'sci', live: false, page: '' },
  { id: 'g37-physics-heat', name: '热传导', emoji: '🌡️', color: 'blue', cat: 'sci', live: false, page: '' },
  { id: 'g38-physics-lever', name: '杠杆原理', emoji: '⚖️', color: 'blue', cat: 'sci', live: false, page: '' },
  { id: 'g39-physics-gravity', name: '星球引力', emoji: '🪐', color: 'blue', cat: 'sci', live: false, page: '' },
  { id: 'g40-physics-wave', name: '波动叠加', emoji: '〰️', color: 'blue', cat: 'sci', live: false, page: '' },
  { id: 'g61-physics-buoyancy', name: '浮力沉浮舱', emoji: '⚓', color: 'blue', cat: 'sci', live: false, page: '' },

  // 程序类 10 个（网站 codeGames）
  { id: 'g41-blocks', name: '代码积木', emoji: '🧱', color: 'coral', cat: 'code', live: true, page: '/pages/games/code/code' },
  { id: 'g42-maze-algo', name: '迷宫算法', emoji: '🗺️', color: 'yellow', cat: 'code', live: false, page: '' },
  { id: 'g43-pattern-draw', name: '图案绘制', emoji: '🎨', color: 'green', cat: 'code', live: false, page: '' },
  { id: 'g53-recursion-tree', name: '递归树', emoji: '🌳', color: 'blue', cat: 'code', live: false, page: '' },
  { id: 'g54-sort-race', name: '排序竞速', emoji: '🏁', color: 'coral', cat: 'code', live: false, page: '' },
  { id: 'g55-condition-fork', name: '条件分岔口', emoji: '🔀', color: 'yellow', cat: 'code', live: false, page: '' },
  { id: 'g56-binary-search', name: '二分查找', emoji: '🔍', color: 'green', cat: 'code', live: false, page: '' },
  { id: 'g57-stack-queue', name: '栈与队列', emoji: '📚', color: 'blue', cat: 'code', live: false, page: '' },
  { id: 'g58-logic-gate', name: '逻辑门', emoji: '💡', color: 'yellow', cat: 'code', live: false, page: '' },
  { id: 'g59-greedy-coins', name: '贪心找零', emoji: '🪙', color: 'coral', cat: 'code', live: false, page: '' },
  { id: 'g62-loop-factory', name: '循环工厂', emoji: '🔁', color: 'yellow', cat: 'code', live: false, page: '' },

  // 多学科 4 个（网站 multiGames）
  { id: 'g44-history-detective', name: '历史侦探', emoji: '🏛️', color: 'coral', cat: 'multi', live: true, page: '/pages/games/multi/multi' },
  { id: 'g45-geo', name: '地图寻宝', emoji: '🗺️', color: 'yellow', cat: 'multi', live: false, page: '' },
  { id: 'g46-words-cipher', name: '文字密码', emoji: '📝', color: 'green', cat: 'multi', live: false, page: '' },
  { id: 'g47-math-art', name: '数学画廊', emoji: '🔢', color: 'blue', cat: 'multi', live: false, page: '' },
  { id: 'g63-food-chain', name: '食物链平衡', emoji: '🦉', color: 'green', cat: 'multi', live: false, page: '' }
];

module.exports = { CATS: CATS, GAMES: GAMES };
