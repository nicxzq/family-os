// ===== 核心：状态 / 持久化 / 登录门 / 导航分发 =====

const TAB_TITLES = { ideas:'好的家庭教育', persons:'给家里每个人', books:'第一年的共读清单', wall:'我们家的六条', me:'我的' };

const state = { loggedIn:false, user:{}, tab:'ideas', stack:[] };
let config   = { child:'小弟弟', hero:'毛毛', friend:'卡梅拉', tint:'#FFFDF6' };
let progress = { books:[], quizDone:false };

const bodyArea = document.getElementById('bodyArea');
const navbar   = document.getElementById('navbar');
const navTitle = document.getElementById('navTitle');
const backBtn  = document.getElementById('backBtn');
const tabbar   = document.getElementById('tabbar');
const statusbar= document.getElementById('statusbar');
const toastEl  = document.getElementById('toast');

/* ---------- 持久化（模拟 wx.setStorage） ---------- */
const KEY = 'family_miniapp_v1';
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify({ loggedIn:state.loggedIn, user:state.user, config, progress })); }catch(e){}
}
function load(){
  try{
    const d = JSON.parse(localStorage.getItem(KEY)||'{}');
    if(d.loggedIn){ state.loggedIn=true; state.user=d.user||{}; }
    if(d.config) config = Object.assign(config, d.config);
    if(d.progress) progress = Object.assign(progress, d.progress);
  }catch(e){}
}

/* ---------- 工具 ---------- */
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function applyVars(str){
  return String(str==null?'':str)
    .replace(/\{hero\}/g, esc(config.hero))
    .replace(/\{friend\}/g, esc(config.friend))
    .replace(/\{child\}/g, esc(config.child));
}

/* ---------- 渲染调度 ---------- */
function render(){
  // 登录门
  if(!state.loggedIn){
    navbar.classList.add('hidden'); tabbar.classList.add('hidden');
    bodyArea.innerHTML = viewLogin();
    return;
  }

  if(state.stack.length){
    const top = state.stack[state.stack.length-1];
    let html='', title='';
    switch(top.type){
      case 'idea':   html=viewIdea(top.id);   title=IDEAS[top.id].no; break;
      case 'person': html=viewPerson(top.id); title=PERSONS.find(p=>p.id===top.id).cta; break;
      case 'quiz':   html=viewQuiz();          title='给正在长大的你'; break;
      case 'sblist': html=viewSbList();        title=esc(config.hero)+'绘本'; break;
      case 'config': html=viewConfig();        title='绘本角色配置'; break;
      case 'reader': html=viewReader();        title=''; break;
    }
    bodyArea.innerHTML = html;
    tabbar.classList.add('hidden');
    if(top.type==='reader'){ navbar.classList.add('hidden'); }   // 阅读器沉浸式，自带返回
    else { navbar.classList.remove('hidden'); navbar.classList.add('has-back'); navTitle.textContent=title; }
  }else{
    const map = { ideas:pageIdeas, persons:pagePersons, books:pageBooks, wall:pageWall, me:pageMe };
    bodyArea.innerHTML = map[state.tab]();
    navbar.classList.remove('hidden','has-back');
    navTitle.textContent = TAB_TITLES[state.tab];
    tabbar.classList.remove('hidden');
    [...tabbar.children].forEach(t=>t.classList.toggle('active', t.dataset.tab===state.tab));
  }
  bindPageEvents();
}

/* ---------- 事件绑定（卡片类用委托；测试/阅读器/配置用内联 onclick） ---------- */
function bindPageEvents(){
  bodyArea.querySelectorAll('[data-idea]').forEach(el=>{
    el.onclick=()=>{ state.stack.push({type:'idea', id:+el.dataset.idea}); render(); };
  });
  bodyArea.querySelectorAll('[data-person]').forEach(el=>{
    el.onclick=()=>{
      const id = el.dataset.person;
      if(id==='eldest'){ quizState={step:-1,answers:[]}; state.stack.push({type:'quiz'}); }
      else if(id==='youngest'){ state.stack.push({type:'sblist'}); }
      else state.stack.push({type:'person', id});
      render();
    };
  });
  bodyArea.querySelectorAll('[data-forward]').forEach(el=>{
    el.onclick=()=>toast('已唤起转发面板','选择一位家人发送');
  });
  const sa=bodyArea.querySelector('#saveAlbum'); if(sa) sa.onclick=()=>toast('已保存到相册','check');
  const fw=bodyArea.querySelector('#forwardWall'); if(fw) fw.onclick=()=>toast('已唤起转发面板','把家庭墙发到家庭群');
}

backBtn.onclick=()=>{ if(state.stack.length){ state.stack.pop(); render(); } };

function switchTab(name){ state.stack=[]; state.tab=name; bodyArea.scrollTop=0; render(); }
[...tabbar.children].forEach(tab=>{ tab.onclick=()=>switchTab(tab.dataset.tab); });

/* ---------- toast ---------- */
let toastTimer;
function toast(msg, sub){
  const isCheck = sub==='check';
  toastEl.innerHTML = (isCheck?'<div class="ck">✓</div>':'') + `<div>${msg}</div>` + (sub&&!isCheck?`<div style="font-size:11.5px;opacity:.7;margin-top:-4px">${sub}</div>`:'');
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toastEl.classList.remove('show'), 1500);
}

load();
render();
