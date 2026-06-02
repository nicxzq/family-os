// ===== 哥哥互动测试 + 弟弟绘本 数据 =====
// 文案占位符 {hero}=绘本主角(默认毛毛) {friend}=好朋友(默认卡梅拉) {child}=弟弟昵称
// 真实工程中同样由阿里云接口返回。

const QUIZ = {
  intro:{ em:'🌱', title:'嘿，<b>正在长大的你</b>。', p:'这不是测验。没有分数，也没有人会打分。<br>就五个小问题——回答你真实的想法就行。' },
  questions:[
    { q:'"学习是谁的事？"',
      opts:['是爸妈的事。他们催我，我就学。','是学校的事。老师布置的，我就做。','是我自己的事——只是我现在还没完全觉得。','是我自己的事——而且我已经感觉到了。'],
      react:['真有意思——这道题没有"对"的答案，但有一个真相：','<b>这世上 99% 的事情，最后谁负责，谁就受益。</b>','学习是你的事，那将来你能做的、能赚的、能看懂的——才是你的。'] },
    { q:'当爸妈说"你应该……"时，你心里第一反应是？',
      opts:['烦。又来了。','嗯……我听着，但其实没怎么入耳。','有时候有道理，有时候觉得他们也没做到。','如果他们自己也在做，我就比较服。'],
      react:['说实话，<b>"自己没做到却来要求别人"是世界上最讨厌的事之一。</b>','所以爸爸在做一个偷偷的练习：说"你应该"之前，先问自己"我做到了吗？"','如果我没做到，我就闭嘴。你也可以用同样的标准要求爸爸——和你自己。'] },
    { q:'"竞争"这个词，对你来说是？',
      opts:['压力。每天都在比。','兴奋。我想赢。','很累。但好像必须。','没那么重要。我有我自己的事要做。'],
      react:['给你一个小秘密：','<b>每次有 90% 赢面，连赢 100 次的概率只有十万分之二点六。</b>','所以聪明的做法是：<b>非必要不竞争。</b>把劲儿留给真正重要的几次。'] },
    { q:'你最近一次"专注到忘了时间"，是什么时候？',
      opts:['玩游戏的时候。','画画 / 看小说 / 搭东西的时候。','……好像有点想不起来了。','我每天都有这种时刻。'],
      react:['不管选哪个——你已经知道：<b>"全身心投入"是世上最爽的感觉之一。</b>','这个东西叫<b>专注</b>，它比聪明值钱多了。','所以我们家有条规矩：你做事时，没人会突然打断你。'] },
    { q:'给十年后的自己写一句话，你会写什么？',
      opts:['"你赚了很多钱。"','"你成了厉害的人。"','"你过得开心。"','"你还在不断变好。"'],
      react:['四个答案都好。但"你还在不断变好"最特别。','前三个是<b>目标</b>——可能实现，也可能落空。','第四个是<b>方向</b>——只要还在方向上，就永远不会"输"。<b>选方向，不选目标。</b>'] },
  ],
  result:{ em:'🌱', title:'所以——你已经知道了。',
    p1:'你不是"要被爸妈教育的人"。你是<b>正在长出自己大脑</b>的人。',
    p2:'我们家不会"管"你，但有几件事想一起做：',
    secret:['一 · 学习是你自己的事。爸妈只负责不打扰、买你想读的书、回答你的问题。','二 · 你犯错可以。我们尽量先一起解决问题，而不是先指责你。如果哪天我们没忍住、先怪了你，你可以提醒我们这条。','三 · 你说"不"是被允许的，但要给一个理由——给你自己。','四 · 你想做的事，我们一起想办法，不替你做决定。','五 · 每周一次"家庭会议"，你也是一票。'],
    tail:'把这页给爸爸/妈妈看一眼，问他们："这五条，你们能做到吗？"' }
};

// —— 绘本插画（简化版小鸡，真实工程用 PNG）——
function chick(opts){
  const c = opts||{};
  const body = c.body||'#FFFDF6', wing = c.wing||'#FBE39A';
  return `<g class="wig"><ellipse cx="50" cy="62" rx="26" ry="29" fill="${body}" stroke="#2B2419" stroke-width="1.3"/>
    <circle cx="50" cy="34" r="21" fill="${body}" stroke="#2B2419" stroke-width="1.3"/>
    <circle cx="43" cy="32" r="2.6" fill="#2B2419"/><circle cx="57" cy="32" r="2.6" fill="#2B2419"/>
    <polygon points="50,37 61,41 50,45" fill="#E56B5A"/>
    <path d="M44 41 Q50 45 56 41" stroke="#2B2419" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <ellipse cx="26" cy="62" rx="7" ry="13" fill="${wing}" transform="rotate(-18 26 62)"/>
    <ellipse cx="74" cy="62" rx="7" ry="13" fill="${wing}" transform="rotate(18 74 62)"/>
    <line x1="44" y1="88" x2="41" y2="97" stroke="#E56B5A" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="56" y1="88" x2="59" y2="97" stroke="#E56B5A" stroke-width="2.4" stroke-linecap="round"/></g>`;
}
function scene(bg, inner){ return `<svg viewBox="0 0 100 110" class="chick"><rect width="100" height="110" fill="none"/>${inner}</svg>`; }

const STORYBOOKS = [
  {
    id:'try-it', no:'01', cover:'#FBE39A', coverArt:'chick',
    title:'{hero}和{friend}', theme:'关于「敢于尝试新东西」',
    desc:'{hero}害怕新东西。直到她偷偷尝了一口新水果……',
    pages:[
      { bg:'#FBE39A', art:scene('#FBE39A', `<circle cx="84" cy="22" r="11" fill="#F4C13E"/>${chick()}`),
        h:'这是一只小小鸡，叫做<span>{hero}</span>。', small:'她和{friend}是好朋友。<br>但是——她们不太一样。',
        read:'这是一只小小鸡，叫做{hero}。她和{friend}是好朋友。但是，她们不太一样。' },
      { bg:'#FBE3D5', art:scene('#FBE3D5', `<circle cx="26" cy="30" r="11" fill="#A8C2DE"/><text x="26" y="35" font-size="13" text-anchor="middle" fill="#2B2419">?</text><circle cx="74" cy="28" r="10" fill="#6FA86D"/><text x="74" y="33" font-size="12" text-anchor="middle" fill="#fff">?</text>${chick()}`),
        h:'{hero}不喜欢<span>新东西</span>。', small:'新的食物——不要！<br>新的游戏——不玩！<br>新的朋友——躲起来！',
        read:'{hero}不喜欢新东西。新的食物不要，新的游戏不玩，新的朋友躲起来。' },
      { bg:'#D7E7F4', art:scene('#D7E7F4', `<path d="M0 80 Q50 66 100 80 L100 110 L0 110 Z" fill="#A8C2DE"/><circle cx="82" cy="22" r="11" fill="#FFF8E0"/>${chick({wing:'#F4A799'})}<g transform="translate(70,18)"><ellipse rx="16" ry="11" fill="#fff"/><text y="4" font-size="9" text-anchor="middle" fill="#E56B5A" font-weight="700">试一试</text></g>`),
        h:'可<span>{friend}</span>不一样。', small:'她要看大海，她要去月亮。<br>她总先说一句——', big:'"试一试"',
        read:'可{friend}不一样。她要看大海，她要去月亮。她总是先说一句话，试一试。' },
      { bg:'#D7EBC9', art:scene('#D7EBC9', `<g transform="translate(74,40)"><path d="M-12 -8 L0 12 L12 -8 Q0 -20 -12 -8Z" fill="#E56B5A"/><ellipse cx="-4" cy="-12" rx="5" ry="3" fill="#6FA86D"/><ellipse cx="4" cy="-12" rx="5" ry="3" fill="#6FA86D"/></g>${chick()}<text x="30" y="24" font-size="16" fill="#F4C13E">✨</text>`),
        h:'有一天，{hero}偷偷尝了一口<span>新水果</span>。', big:'哇——是甜的！', small:'她悄悄说："再试一口……"',
        read:'有一天，{hero}偷偷尝了一口新水果。哇，是甜的！她悄悄说，再试一口，再试一口。' },
      { bg:'#F4A799', art:scene('#F4A799', `<circle cx="84" cy="22" r="10" fill="#FBE39A"/><g transform="translate(-18,6) scale(.8)">${chick()}</g><g transform="translate(20,2) scale(.78)">${chick({wing:'#F4A799'})}</g><text x="50" y="20" font-size="13" fill="#fff">♥</text>`),
        h:'<span style="color:#fff">{hero}跟着{friend}跑啊跑——</span>', big:'<span style="color:#fff">原来"试一试"<br>没那么可怕。</span>',
        read:'{hero}跟着{friend}跑啊跑，原来试一试，没有那么可怕。' },
      { bg:'#FBE39A', end:true, h:'给{child} ❤️', endP:['下次看到<b>新东西</b>的时候，','悄悄说一句——'], endBig:'"试一试。"', endSmall:'试了不喜欢——没关系。<br>试了喜欢——就赚到了。',
        read:'给{child}。下次看到新东西的时候，悄悄说一句，试一试。试了不喜欢没关系，试了喜欢，就赚到了。' },
    ]
  },
  {
    id:'library', no:'02', cover:'#FBE3D5', coverArt:'book',
    title:'{hero}的小书房', theme:'关于「每天读一点点」',
    desc:'爸爸每天在书房不说话。{hero}问："你在看什么？"',
    pages:[
      { bg:'#FBE3D5', art:scene('#FBE3D5', `<rect x="30" y="38" width="40" height="34" rx="2" fill="#A8826B"/><rect x="33" y="42" width="34" height="26" fill="#FFF8E0"/>${chick({wing:'#A8C2DE'})}`),
        h:'爸爸每天都在<span>书房</span>里。', small:'他安安静静，一句话也不说。',
        read:'爸爸每天都在书房里。他安安静静，一句话也不说。' },
      { bg:'#D7E7F4', art:scene('#D7E7F4', `<g transform="translate(68,40)"><rect x="-14" y="-10" width="28" height="20" rx="2" fill="#fff" stroke="#2B2419" stroke-width="1"/><line x1="0" y1="-10" x2="0" y2="10" stroke="#2B2419" stroke-width="1"/></g>${chick()}`),
        h:'{hero}悄悄问：', big:'"你在看什么？"', small:'爸爸笑着说："一个好长好长的故事。"',
        read:'{hero}悄悄问，你在看什么。爸爸笑着说，一个好长好长的故事。' },
      { bg:'#D7EBC9', art:scene('#D7EBC9', `${chick()}<g transform="translate(66,46)"><rect x="-12" y="-9" width="24" height="18" rx="2" fill="#fff" stroke="#2B2419" stroke-width="1"/></g><text x="30" y="26" font-size="13" fill="#F4C13E">✨</text>`),
        h:'于是{hero}也翻开一本书。', small:'每天只读<span>一点点</span>，<br>像小口小口喝牛奶。',
        read:'于是{hero}也翻开一本书。每天只读一点点，像小口小口喝牛奶。' },
      { bg:'#FBE39A', end:true, h:'给{child} ❤️', endP:['书不用一次读完。','每天读<b>一点点</b>——'], endBig:'就够了。', endSmall:'一年下来，<br>你会读完好多好多故事。',
        read:'给{child}。书不用一次读完，每天读一点点就够了。一年下来，你会读完好多好多故事。' },
    ]
  },
  {
    id:'ten-minutes', no:'03', cover:'#D7EBC9', coverArt:'clock',
    title:'{hero}的十分钟', theme:'关于「不被打扰的时候」',
    desc:'{hero}在搭积木——可是妈妈一直来叫她……',
    pages:[
      { bg:'#D7EBC9', art:scene('#D7EBC9', `<rect x="36" y="58" width="12" height="12" fill="#E56B5A"/><rect x="50" y="58" width="12" height="12" fill="#4B7BA8"/><rect x="43" y="46" width="12" height="12" fill="#F4C13E"/>${chick()}`),
        h:'{hero}在搭一座<span>很高的塔</span>。', small:'她搭得好认真，眼睛都不眨。',
        read:'{hero}在搭一座很高的塔。她搭得好认真，眼睛都不眨。' },
      { bg:'#FBE3D5', art:scene('#FBE3D5', `${chick()}<g transform="translate(72,36)"><ellipse rx="15" ry="10" fill="#fff"/><text y="4" font-size="8" text-anchor="middle" fill="#E56B5A">喝水！</text></g>`),
        h:'可是——', small:'"快喝水！""快穿外套！"<br>大家一直来<span>打断</span>她。',
        read:'可是，快喝水，快穿外套，大家一直来打断她。' },
      { bg:'#D7E7F4', art:scene('#D7E7F4', `<circle cx="50" cy="40" r="22" fill="#fff" stroke="#2B2419" stroke-width="1.5"/><line x1="50" y1="40" x2="50" y2="26" stroke="#E56B5A" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="40" x2="60" y2="44" stroke="#2B2419" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="40" r="2.5" fill="#2B2419"/>`),
        h:'后来，妈妈学会了等。', big:'"等你十分钟。"', small:'这十分钟，没有人打扰{hero}。',
        read:'后来，妈妈学会了等。等你十分钟。这十分钟，没有人打扰{hero}。' },
      { bg:'#FBE39A', end:true, h:'给{child} ❤️', endP:['你认真做事的时候，','我们会<b>等你</b>——'], endBig:'那是你的十分钟。', endSmall:'专注，是最了不起的本事。',
        read:'给{child}。你认真做事的时候，我们会等你，那是你的十分钟。专注，是最了不起的本事。' },
    ]
  },
  {
    id:'mountain', no:'04', cover:'#D7E7F4', coverArt:'hill', locked:true,
    title:'{hero}上山', theme:'关于「时间是朋友」',
    desc:'{hero}和{friend}去爬山。{friend}跑得好快——{hero}走得好慢……',
    pages:[]
  },
];

// 绘本封面图标
function coverSvg(kind){
  if(kind==='book') return `<svg viewBox="0 0 100 100"><rect x="22" y="28" width="56" height="46" rx="3" fill="#A8826B"/><rect x="26" y="34" width="46" height="34" fill="#FBE3D5"/><line x1="49" y1="34" x2="49" y2="68" stroke="#A8826B" stroke-width="2"/></svg>`;
  if(kind==='clock') return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#fff" stroke="#2B2419" stroke-width="2"/><line x1="50" y1="50" x2="50" y2="28" stroke="#E56B5A" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="50" x2="64" y2="44" stroke="#2B2419" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="50" r="3" fill="#2B2419"/></svg>`;
  if(kind==='hill') return `<svg viewBox="0 0 100 100"><path d="M20 72 Q50 26 80 72" stroke="#2B2419" stroke-width="2.5" fill="none"/><circle cx="38" cy="62" r="5" fill="#F4C13E"/><circle cx="50" cy="56" r="5" fill="#E56B5A"/><circle cx="62" cy="62" r="5" fill="#6FA86D"/></svg>`;
  return `<svg viewBox="0 0 100 110">${chick()}</svg>`;
}
