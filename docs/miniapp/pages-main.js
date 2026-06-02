// ===== 主页面：六条 / 给家人 / 共读 / 家庭墙 + 想法/人物详情 =====

function pageIdeas(){
  const cards = IDEAS.map((d,i)=>`
    <div class="idea-card" data-idea="${i}">
      <div class="num"><i style="background:${COLORS[d.color]}"></i>${d.no}</div>
      <h4>${d.title}</h4>
      <div class="scene" style="border-left-color:${COLORS[d.color]}">${d.scene}</div>
      <div class="go"><b>看完整的想法</b><span>展开 ›</span></div>
    </div>`).join('');
  return `<div class="page">
    <div class="mini-hero">
      <div class="tag">A FAMILY OS · v1</div>
      <h3>把<em>"家"</em>当作一件可以<br>一起经营一辈子的事。</h3>
      <p>不是鸡娃手册，也不是大道理。是一家人可以一起点开、一起聊、慢慢做的几条原则。</p>
      <div class="dots"><i style="background:${COLORS.coral}"></i><i style="background:${COLORS.yellow}"></i><i style="background:${COLORS.green}"></i><i style="background:${COLORS.blue}"></i></div>
    </div>
    <div class="ph" style="padding-top:6px"><div class="kicker">六个想法</div>
      <h2 style="font-size:21px">一家人都能听懂的六句话</h2>
      <p class="sub">点开任意一张卡片，看完整的故事。一周看一张刚刚好。</p></div>
    <div style="height:14px"></div>${cards}<div style="height:8px"></div></div>`;
}

function pagePersons(){
  const cards = PERSONS.map(p=>{
    const live = p.id==='eldest'||p.id==='youngest';
    return `<div class="person-card" data-person="${p.id}">
      <div class="tag">${applyVars(p.tag)}</div>
      <h4>${applyVars(p.title)}</h4>
      <p>${applyVars(p.p)}</p>
      <span class="cta ${live?'live':''}">${p.cta} ${live?'▸':'›'}</span>
      <svg class="ava" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${p.fill}"/>
        <circle cx="25" cy="29" r="2.4" fill="#2B2419"/><circle cx="39" cy="29" r="2.4" fill="#2B2419"/>
        <path d="M23 39 Q32 47 41 39" stroke="#2B2419" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
    </div>`;
  }).join('');
  return `<div class="page">
    <div class="ph"><div class="kicker">给家里每个人</div>
      <h2>不同的人，不同的入口。</h2>
      <p class="sub">同一套想法，讲给不同年纪、不同立场的人，需要完全不同的方式。每一页都能单独转发给那个人看。</p></div>
    <div style="height:14px"></div>${cards}<div style="height:8px"></div></div>`;
}

function pageBooks(){
  const groups = BOOKS.map(g=>`<div class="book-group"><div class="gt">${g.who}</div>
    ${g.items.map((b,i)=>`<div class="book" style="border-left-color:${[COLORS.coral,COLORS.yellow,COLORS.green,COLORS.blue][i%4]}"><h5>${b.t}</h5><p>${b.n}</p></div>`).join('')}
    </div>`).join('');
  return `<div class="page">
    <div class="ph"><div class="kicker">家庭仪式</div>
      <h2>第一年的共读清单。</h2>
      <p class="sub">一个"做发展论"的家庭，最重要的仪式是一家人一起读书。不贵，不卷，慢慢读。</p></div>
    <div style="height:10px"></div>${groups}<div style="height:14px"></div></div>`;
}

function pageWall(){
  const rules = WALL.map((r,i)=>`<div><b>${NUMS[i]}</b>${r}</div>`).join('');
  return `<div class="page">
    <div class="ph"><div class="kicker">家庭墙</div>
      <h2>六条原则，贴在墙上。</h2>
      <p class="sub">把六个想法浓缩成六条家规。小程序不能直接打印——生成海报，保存到相册，去冲印或自己打印。</p></div>
    <div class="poster"><div class="pt">我们家的六条</div><div class="pe">A FAMILY OF LONG-TERMISTS</div>
      <div class="rules">${rules}</div><div class="pf">— 我们家 · 2026 —</div></div>
    <div class="wall-actions">
      <div class="wb primary" id="saveAlbum"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3v11m0 0l-4-4m4 4l4-4M5 19h14" stroke="#F8F2E2" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>保存到相册</div>
      <div class="wb ghost" id="forwardWall">转发给家人</div></div>
    <p class="wall-tip">竖版 · 横版 · 单卡片版可在生成时切换。<br>措辞可在"编辑"里改，自动保存到本地（wx.setStorage）。</p>
    <div style="height:10px"></div></div>`;
}

/* 详情 */
function viewIdea(i){
  const d = IDEAS[i];
  return `<div class="page"><div class="detail">
    <div class="num"><i style="background:${COLORS[d.color]}"></i>${d.no}</div>
    <h2>${d.title}</h2>
    <div class="scene" style="border-left-color:${COLORS[d.color]}">${d.scene}</div>
    <p class="key">→ ${d.key}</p>
    <div class="body">${d.body.map(p=>`<p>${p}</p>`).join('')}</div>
    <div class="share-btn green" data-forward="第${i+1}想法"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12l16-7-7 16-2-7-7-2z" stroke="#F8F2E2" stroke-width="1.6" stroke-linejoin="round"/></svg>转发给家人</div>
  </div></div>`;
}

function viewPerson(id){
  const p = PERSONS.find(x=>x.id===id);
  return `<div class="page"><div class="detail">
    <div class="num"><i style="background:${p.fill}"></i>${applyVars(p.tag)}</div>
    <h2>${applyVars(p.title)}</h2>
    <div class="body">${p.body.map(t=>`<p>${applyVars(t)}</p>`).join('')}</div>
    <div class="share-btn green" data-forward="${p.cta}"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12l16-7-7 16-2-7-7-2z" stroke="#F8F2E2" stroke-width="1.6" stroke-linejoin="round"/></svg>转发给 TA</div>
    <p style="font-size:11.5px;color:var(--ink-mute);text-align:center;margin-top:14px;line-height:1.7">这一页可以单独转发到聊天，<br>对方点开就停在这个入口。</p>
  </div></div>`;
}
