// ===== 哥哥互动测试 + 弟弟绘本目录 + 翻页阅读器 =====

/* ---------- 互动测试 ---------- */
let quizState = { step:-1, answers:[] };

function viewQuiz(){
  const s = quizState;
  if(s.step === -1){
    const it = QUIZ.intro;
    return `<div class="page"><div class="quiz"><div class="quiz-intro">
      <div class="em">${it.em}</div><h2>${it.title}</h2><p>${it.p}</p>
      <button class="qbtn" onclick="quizStart()">开始 →</button>
    </div></div></div>`;
  }
  if(s.step >= QUIZ.questions.length){
    const r = QUIZ.result;
    return `<div class="page"><div class="quiz"><div class="qresult">
      <div class="em">${r.em}</div><h2>${r.title}</h2>
      <p>${r.p1}</p><p>${r.p2}</p>
      <div class="secret"><h3>给正在长大的你 · 五条</h3>${r.secret.map(x=>`<p>${x}</p>`).join('')}</div>
      <p style="font-size:13px;color:var(--ink-mute)">${r.tail}</p>
      <div class="share-btn green" style="margin-top:20px" data-forward="给正在长大的你·五条"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12l16-7-7 16-2-7-7-2z" stroke="#F8F2E2" stroke-width="1.6" stroke-linejoin="round"/></svg>把五条转发给爸妈</div>
      <button class="qbtn" style="margin-top:12px;background:transparent;color:var(--ink);border:1.5px solid var(--ink)" onclick="quizRetry()">重新来一次</button>
    </div></div></div>`;
  }
  const q = QUIZ.questions[s.step];
  const picked = s.answers[s.step];
  const answered = picked !== undefined;
  const dots = QUIZ.questions.map((_,i)=>`<span class="${i<s.step?'done':i===s.step?'cur':''}"></span>`).join('');
  const opts = q.opts.map((o,i)=>`<button class="qopt ${picked===i?'sel':''}" onclick="quizPick(${i})">${o}</button>`).join('');
  return `<div class="page"><div class="quiz">
    <div class="qprog">${dots}</div>
    <div class="qcard">
      <div class="qn">问题 ${s.step+1} / ${QUIZ.questions.length}</div>
      <h3>${q.q}</h3>
      <div class="qopts">${opts}</div>
      <div class="qreact ${answered?'show':''}">${q.react.map(x=>`<p>${x}</p>`).join('')}</div>
      <button class="qnext ${answered?'show':''}" onclick="quizNext()">${s.step===QUIZ.questions.length-1?'看看结果 →':'下一题 →'}</button>
    </div>
  </div></div>`;
}
function quizStart(){ quizState={step:0, answers:[]}; render(); }
function quizPick(i){ quizState.answers[quizState.step]=i; render(); }
function quizNext(){ quizState.step++; if(quizState.step>=QUIZ.questions.length){ progress.quizDone=true; save(); } render(); bodyArea.querySelector('.page').scrollTop=0; }
function quizRetry(){ quizState={step:-1, answers:[]}; render(); }

/* ---------- 绘本目录 ---------- */
function viewSbList(){
  const cards = STORYBOOKS.map(b=>{
    const read = progress.books.includes(b.id);
    const badge = b.locked ? '即将上架' : (read ? '已读完' : `第 ${+b.no} 本`);
    const badgeCls = b.locked ? '' : (read ? 'read' : '');
    return `<div class="sb-book ${b.locked?'locked':''}" ${b.locked?'':`onclick="openBook('${b.id}')"`}>
      <div class="badge ${badgeCls}">${badge}</div>
      <div class="cover" style="background:${b.cover}">${coverSvg(b.coverArt)}</div>
      <div class="bi"><div class="bn">${b.no} · ${applyVars('{hero}系列')}</div>
        <h4>${applyVars(b.title)}</h4><div class="th">${b.theme}</div><div class="ds">${applyVars(b.desc)}</div></div>
    </div>`;
  }).join('');
  return `<div class="page">
    <div class="sb-head">
      <div class="sb-chick"><svg viewBox="0 0 100 110" class="chick">${chick()}</svg></div>
      <div class="who">FOR LITTLE BROTHER</div>
      <h2>给${esc(config.child)}的<br>${esc(config.hero)}绘本</h2>
      <p>${esc(config.hero)}是一只小小鸡，她和${esc(config.friend)}是好朋友。<br>每周一本——慢慢看，慢慢长大。</p>
    </div>
    <div class="sb-grid">${cards}</div>
    <div class="sb-parent">💡 <b>给爸爸妈妈：</b>每本约 5–6 页、3 分钟念完。每周读一本就好，<br>读完不用考问，让故事自己长进他心里。</div>
    <div style="height:8px"></div></div>`;
}

/* ---------- 翻页阅读器 ---------- */
let readerState = { bookId:null, page:0 };
function openBook(id){ readerState={bookId:id, page:0}; state.stack.push({type:'reader', title:''}); render(); }

function viewReader(){
  const b = STORYBOOKS.find(x=>x.id===readerState.bookId);
  const total = b.pages.length;
  const pagesHtml = b.pages.map((p,i)=>{
    const active = i===readerState.page ? 'active' : '';
    if(p.end){
      return `<div class="rpage endp ${active}" style="background:${p.bg}">
        <div class="endcard"><h3>${applyVars(p.h)}</h3>
          ${p.endP.map(x=>`<p>${applyVars(x)}</p>`).join('')}
          <p style="font-size:26px;color:var(--coral);font-weight:700;margin:14px 0">${applyVars(p.endBig)}</p>
          <p class="small" style="font-size:14px;color:var(--ink-soft)">${applyVars(p.endSmall)}</p>
        </div></div>`;
    }
    return `<div class="rpage ${active}" style="background:${p.bg}">
      <div class="rscene">${p.art}</div>
      <div class="rtext"><h3>${applyVars(p.h).replace(/<span/g,'<span style="color:#E56B5A"')}</h3>
        ${p.big?`<div class="big">${applyVars(p.big)}</div>`:''}
        ${p.small?`<div class="small">${applyVars(p.small)}</div>`:''}</div>
    </div>`;
  }).join('');
  const dots = b.pages.map((_,i)=>`<span class="${i===readerState.page?'active':''}"></span>`).join('');
  return `<div class="reader" style="background:${b.pages[readerState.page].bg}">
    <div class="rtop">
      <div class="rback" onclick="closeReader()">← 回绘本目录</div>
      <button class="raloud" onclick="readerAloud()">🔊 念给我听</button>
    </div>
    <div class="rpages">${pagesHtml}</div>
    <div class="rnav">
      <button onclick="readerGo(-1)" ${readerState.page===0?'disabled':''}>←</button>
      <div class="rdots">${dots}</div>
      <button onclick="readerGo(1)" ${readerState.page===total-1?'disabled':''}>→</button>
    </div>
  </div>`;
}
function readerGo(d){
  const b = STORYBOOKS.find(x=>x.id===readerState.bookId);
  const n = readerState.page + d;
  if(n<0 || n>=b.pages.length) return;
  if(window.speechSynthesis) speechSynthesis.cancel();
  readerState.page = n;
  if(n===b.pages.length-1 && !progress.books.includes(b.id)){ progress.books.push(b.id); save(); }
  render();
}
function closeReader(){ if(window.speechSynthesis) speechSynthesis.cancel(); state.stack.pop(); render(); }
function readerAloud(){
  const b = STORYBOOKS.find(x=>x.id===readerState.bookId);
  const text = applyVars(b.pages[readerState.page].read||'');
  if(!text || !window.speechSynthesis){ toast('🔊 朗读中…'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang='zh-CN'; u.rate=.85; u.pitch=1.1;
  speechSynthesis.speak(u); toast('🔊 念给你听…');
}
