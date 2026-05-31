(function(){
  var config=window.CHEM_GAME;
  var current=0,answered=false,sequence=[],selected=[];
  var card=document.getElementById('chem-card');
  var result=document.getElementById('chem-result');
  var progress=document.getElementById('chem-progress');

  function saveDone(){
    var done=[];
    try{done=JSON.parse(localStorage.getItem('fo_games_done')||'[]');}catch(e){}
    if(done.indexOf(config.id)<0){done.push(config.id);localStorage.setItem('fo_games_done',JSON.stringify(done));}
  }

  function renderProgress(){
    progress.innerHTML=config.stages.map(function(_,idx){
      var cls='chem-progress-dot'+(idx<current?' is-done':idx===current?' is-active':'');
      return '<span class="'+cls+'"></span>';
    }).join('')+'<span class="chem-progress-label">'+Math.min(current+1,config.stages.length)+' / '+config.stages.length+'</span>';
  }

  function optionButton(text,idx){
    return '<button class="chem-option" data-index="'+idx+'">'+text+'</button>';
  }

  function render(){
    answered=false;sequence=[];selected=[];
    if(current>=config.stages.length){finish();return;}
    var stage=config.stages[current];
    renderProgress();
    card.innerHTML='<p class="chem-stage">实验 '+(current+1)+' / '+config.stages.length+'</p>'+
      '<h2>'+stage.title+'</h2><p class="chem-prompt">'+stage.prompt+'</p>'+
      '<div class="chem-options">'+stage.options.map(optionButton).join('')+'</div>'+
      (stage.type==='choice'?'':'<button class="chem-action" id="chem-submit" disabled>提交答案</button>')+
      '<div class="chem-feedback" id="chem-feedback"></div>'+
      '<button class="chem-next" id="chem-next">'+(current+1===config.stages.length?'领取徽章':'下一关')+' →</button>';
    card.querySelectorAll('.chem-option').forEach(function(btn){btn.onclick=function(){choose(stage,btn);};});
    var submit=document.getElementById('chem-submit');
    if(submit)submit.onclick=function(){check(stage);};
  }

  function choose(stage,btn){
    if(answered)return;
    var idx=Number(btn.dataset.index);
    if(stage.type==='choice'){selected=[idx];check(stage);return;}
    if(stage.type==='sequence'){
      if(sequence.indexOf(idx)>=0)return;
      sequence.push(idx);btn.classList.add('is-selected');btn.textContent=sequence.length+'. '+btn.textContent;
      document.getElementById('chem-submit').disabled=sequence.length!==stage.options.length;
      return;
    }
    var pos=selected.indexOf(idx);
    if(pos>=0){selected.splice(pos,1);btn.classList.remove('is-selected');}
    else{selected.push(idx);btn.classList.add('is-selected');}
    document.getElementById('chem-submit').disabled=selected.length===0;
  }

  function sameSet(a,b){return a.slice().sort().join(',')===b.slice().sort().join(',');}

  function check(stage){
    if(answered)return;
    var actual=stage.type==='sequence'?sequence:selected;
    var correct=stage.type==='multi'?sameSet(actual,stage.answer):actual.join(',')===stage.answer.join(',');
    var feedback=document.getElementById('chem-feedback');
    feedback.textContent=(correct?'✓ ':'再想一步：')+(correct?stage.success:stage.retry);
    feedback.className='chem-feedback is-shown '+(correct?'is-correct':'is-wrong');
    if(!correct){
      if(stage.type!=='choice'){
        sequence=[];selected=[];
        card.querySelectorAll('.chem-option').forEach(function(btn){
          btn.classList.remove('is-selected');
          btn.textContent=stage.options[Number(btn.dataset.index)];
        });
        document.getElementById('chem-submit').disabled=true;
      }
      return;
    }
    answered=true;
    card.querySelectorAll('.chem-option').forEach(function(btn){btn.disabled=true;});
    document.getElementById('chem-next').classList.add('is-shown');
  }

  card.onclick=function(event){
    if(event.target.id!=='chem-next')return;
    current+=1;render();
  };

  function finish(){
    saveDone();card.hidden=true;progress.hidden=true;
    result.classList.add('is-shown');
    result.innerHTML='<h2>'+config.badge+'</h2><p>'+config.result+'</p><a href="index.html">返回游戏库 →</a>';
  }

  var member=window.FO&&FO.getMember(),memberButton=document.getElementById('nav-member-btn');
  if(member){memberButton.innerHTML=FO.avatarSVG(member.avatar,member.color,32)+'<span>'+member.name+'</span>';memberButton.onclick=function(){location.href='../dashboard.html';};}
  else{memberButton.innerHTML='<span>登录</span>';memberButton.onclick=function(){location.href='../login.html';};}
  render();
})();
