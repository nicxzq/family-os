// ===== 登录 / 我的（进度记录）/ 角色配置 =====

/* ---------- 登录页 ---------- */
function viewLogin(){
  return `<div class="login">
    <div class="logo"></div>
    <h1>好的家庭教育</h1>
    <p class="sl">一家人的家庭操作系统。<br>登录后，记录每个人的阅读与游戏进度。</p>
    <div class="wx-btn" onclick="doLogin()">
      <svg viewBox="0 0 24 24" fill="#fff"><path d="M8.7 7.2c-3.3 0-6 2.1-6 4.8 0 1.5.9 2.9 2.3 3.8l-.5 1.6 1.9-1c.7.2 1.4.3 2.3.3h.6c-.1-.4-.2-.9-.2-1.3 0-2.7 2.6-4.9 5.8-4.9h.6C15.2 9 12.3 7.2 8.7 7.2zm-2 2.2c.5 0 .8.4.8.8s-.3.8-.8.8-.9-.4-.9-.8.4-.8.9-.8zm4.1 0c.5 0 .8.4.8.8s-.3.8-.8.8-.9-.4-.9-.8.4-.8.9-.8z"/><path d="M21.3 14.6c0-2.3-2.3-4.2-5.1-4.2s-5.1 1.9-5.1 4.2 2.3 4.2 5.1 4.2c.6 0 1.2-.1 1.7-.2l1.6.9-.4-1.4c1.3-.8 2.2-1.9 2.2-3.5zm-6.8-.7c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7zm3.4 0c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z"/></svg>
      微信一键登录
    </div>
    <p class="note2">个人主体小程序支持微信登录、获取头像昵称；<br>仅用于在本机记录你家的进度。</p>
    <p class="agree">登录即表示同意 <b>《用户协议》</b> 与 <b>《隐私政策》</b></p>
  </div>`;
}
function doLogin(){
  state.loggedIn = true;
  state.user = { name:'笑来家的爸爸', color:COLORS.coral };
  save(); render();
  toast('登录成功','check');
}

/* ---------- 我的 ---------- */
function pageMe(){
  const booksTotal = STORYBOOKS.filter(b=>!b.locked).length;
  const booksRead = progress.books.length;
  const u = state.user;
  const fam = [
    { name:'爸爸（我）', role:'管理员 · 持续阅读的活样本', color:COLORS.coral, chip:'本周共读 4 次', chipCls:'' },
    { name:'妈妈', role:'同学，不是被教育的人', color:COLORS.blue, chip:'速览已读', chipCls:'done' },
    { name:'哥哥', role:'互动测试 · 自己的主角', color:COLORS.yellow,
      chip: progress.quizDone?'测试已完成':'去测试 ›', chipCls: progress.quizDone?'done':'todo', go:'quiz' },
    { name:`${esc(config.child)}`, role:`${esc(config.hero)}绘本 · 每周一本`, color:COLORS.green,
      chip:`绘本 ${booksRead}/${booksTotal}`, chipCls: booksRead>=booksTotal?'done':'', go:'sblist' },
  ];
  const members = fam.map((m,i)=>`
    <div class="member" ${m.go?`onclick="goFromMe('${m.go}')"`:''}>
      <div class="av" style="background:${m.color}">${['爸','妈','哥',esc(config.child)[0]||'弟'][i]}</div>
      <div class="mi"><b>${m.name}</b><span>${m.role}</span></div>
      <div class="chip ${m.chipCls}">${m.chip}</div>
    </div>`).join('');
  return `<div class="page">
    <div class="me-head">
      <div class="avatar" style="background:${u.color||COLORS.coral}">${(u.name||'家')[0]}</div>
      <div class="info"><b>${u.name||'我的家'}</b><span>好的家庭教育 · 家庭操作系统</span></div>
    </div>

    <div class="stat-row">
      <div class="stat"><b>${booksRead}</b><span>绘本读完</span></div>
      <div class="stat"><b>${progress.quizDone?'✓':'—'}</b><span>哥哥的测试</span></div>
      <div class="stat"><b>4</b><span>本周共读</span></div>
    </div>

    <div class="card"><div class="ct">家庭成员 · 进度</div>${members}</div>

    <div class="card">
      <div class="list-row" onclick="goFromMe('config')">
        <div class="ic"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#5C4F3D" stroke-width="1.6"/><path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="#5C4F3D" stroke-width="1.6" stroke-linecap="round"/></svg></div>
        <div class="ri">绘本角色配置</div><div class="arr">›</div>
      </div>
      <div class="list-row" onclick="switchTab('wall')">
        <div class="ic"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="#5C4F3D" stroke-width="1.6"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#5C4F3D" stroke-width="1.6" stroke-linecap="round"/></svg></div>
        <div class="ri">我们家的六条 · 家庭墙</div><div class="arr">›</div>
      </div>
      <div class="list-row" onclick="toast('内容由阿里云接口下发','改文案不用重新提审')">
        <div class="ic"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#5C4F3D" stroke-width="1.6"/><path d="M12 11v5M12 8h.01" stroke="#5C4F3D" stroke-width="1.6" stroke-linecap="round"/></svg></div>
        <div class="ri">关于 · 内容如何更新</div><div class="arr">›</div>
      </div>
    </div>

    <div class="logout" onclick="doLogout()">退出登录</div>
    <div style="height:14px"></div></div>`;
}
function goFromMe(go){
  if(go==='quiz'){ quizState={step:-1,answers:[]}; state.stack.push({type:'quiz', title:'给正在长大的你'}); render(); }
  else if(go==='sblist'){ state.stack.push({type:'sblist', title:'毛毛绘本'}); render(); }
  else if(go==='config'){ state.stack.push({type:'config', title:'绘本角色配置'}); render(); }
}
function doLogout(){ state.loggedIn=false; state.stack=[]; state.tab='ideas'; save(); render(); }

/* ---------- 角色配置 ---------- */
const TINTS = ['#FFFDF6','#FBE39A','#F4A799','#B5D4A8'];
function viewConfig(){
  return `<div class="page"><div class="cfg">
    <p class="lead">给绘本里的角色起你们家自己的名字——保存后，弟弟看到的每一本绘本都会自动替换。</p>

    <div class="field"><label>弟弟的昵称 <em>（绘本里"给谁"）</em></label>
      <input id="cfg-child" value="${esc(config.child)}" oninput="cfgPreview()" maxlength="6"></div>
    <div class="field"><label>绘本主角的名字 <em>（默认 毛毛）</em></label>
      <input id="cfg-hero" value="${esc(config.hero)}" oninput="cfgPreview()" maxlength="6"></div>
    <div class="field"><label>好朋友的名字 <em>（默认 卡梅拉）</em></label>
      <input id="cfg-friend" value="${esc(config.friend)}" oninput="cfgPreview()" maxlength="6"></div>

    <div class="field"><label>主角羽毛颜色</label>
      <div class="swatches" id="cfg-tints">${TINTS.map(c=>`<div class="swatch ${c===config.tint?'sel':''}" style="background:${c};border-color:${c===config.tint?'var(--ink)':'rgba(43,36,25,.12)'}" onclick="cfgTint('${c}')"></div>`).join('')}</div></div>

    <div class="cfg-preview"><div class="pl">实时预览</div><span id="cfg-pv">${cfgSentence()}</span></div>

    <div class="cfg-save" onclick="cfgSave()">保存配置</div>
    <p style="font-size:11.5px;color:var(--ink-mute);text-align:center;margin-top:14px;line-height:1.7">真实工程里：保存到 wx.setStorage，绘本文字用模板渲染。<br>未来可加更多角色（妈妈鸡、爷爷鸡…）。</p>
  </div></div>`;
}
function cfgSentence(){
  const c = document.getElementById('cfg-child')?.value || config.child;
  const h = document.getElementById('cfg-hero')?.value || config.hero;
  const f = document.getElementById('cfg-friend')?.value || config.friend;
  return `这是一只小小鸡，叫做 <b>${esc(h)||'毛毛'}</b>。她和 <b>${esc(f)||'卡梅拉'}</b> 是好朋友。<br>故事讲给 <b>${esc(c)||'小弟弟'}</b> 听。`;
}
function cfgPreview(){ const el=document.getElementById('cfg-pv'); if(el) el.innerHTML=cfgSentence(); }
function cfgTint(c){ config.tint=c; bodyArea.querySelectorAll('#cfg-tints .swatch').forEach(s=>{ const on=s.style.background.replace(/\s/g,'')===''; }); render(); }
function cfgSave(){
  config.child = (document.getElementById('cfg-child').value||'小弟弟').trim();
  config.hero  = (document.getElementById('cfg-hero').value||'毛毛').trim();
  config.friend= (document.getElementById('cfg-friend').value||'卡梅拉').trim();
  save();
  toast('已保存','check');
  setTimeout(()=>{ state.stack.pop(); render(); }, 700);
}
