/* 「今日东京」每日告示 — 独立模块（经典脚本，window.TokyoNews）。
   数据来自 news.json（scripts/fetch_news.py 抓取的真实公开源）。
   加载失败时整体不显示，绝不影响站点其他功能。
   交互形态（用户 2026-11-08 定版）：面板里只放紧凑入口行，完整列表在弹窗；
   状态栏上方一条快讯（可关，警报不可关）；可关联景点的条目在地图上以
   HTML 投影点呈现（不介入现有射线点击），点击打开弹窗并高亮该条。 */
(function(){
'use strict';
var LV_ORDER={alert:0,traffic:1,event:2,news:3};
var LV_COLOR={alert:'#ff6b5e',traffic:'#ffa257',event:'#e6c887',news:'#8ca0c8'};
var LOCALES={zh:'zh-CN',ja:'ja-JP',en:'en-US',ko:'ko-KR',hi:'hi-IN'};
var api=null, DATA=null, items=[], yItems=[], hasAlert=false, tickerIdx=0, tickerTimer=null, closedToday=false;

function $(id){ return document.getElementById(id); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function T(k){ return api?api.T(k):k; }
function lang(){ return api?api.lang():'zh'; }
function pick(it,field){
  var m=it[field+'I18n'];
  if(m){ var v=m[lang()]||m.zh; if(v) return v; }
  return it[field]||'';
}
function todayStr(){
  try{ return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
  catch(e){ return DATA?DATA.date:''; }
}
function dateLabel(ds){
  try{
    var d=new Date(ds+'T00:00:00+09:00');
    return new Intl.DateTimeFormat(LOCALES[lang()]||'zh-CN',{month:'numeric',day:'numeric',weekday:'short',timeZone:'Asia/Tokyo'}).format(d);
  }catch(e){ return ds||''; }
}
/* 过期过滤：expires 优先；traffic 无 expires 时以 time(HH:MM) 起算 3 小时；
   event 无 expires 时当天 24:00（按数据日期）过期 */
function alive(it){
  var now=Date.now();
  if(it.expires){ var t=Date.parse(it.expires); if(!isNaN(t)&&t<now) return false; }
  if(it.level==='traffic'&&!/^\d{2}:\d{2}$/.test(it.time||'')) return true;
  if(it.level==='traffic'){
    var base=Date.parse((DATA.date||todayStr())+'T'+it.time+':00+09:00');
    if(!isNaN(base)&&now>base+3*3600*1000) return false;
  }
  if(it.level==='event'&&!it.expires&&DATA&&DATA.date){
    var end=Date.parse(DATA.date+'T24:00:00+09:00');
    if(!isNaN(end)&&now>end) return false;
  }
  return true;
}
function sortItems(list){
  return list.slice().sort(function(a,b){ return (LV_ORDER[a.level]||9)-(LV_ORDER[b.level]||9); });
}

function injectCss(){
  if($('newsCss')) return;
  var st=document.createElement('style'); st.id='newsCss';
  st.textContent=
  /* 面板入口行 */
  '#newsEntry{display:flex;align-items:center;gap:8px;width:100%;text-align:left;cursor:pointer}'+
  '#newsEntry .nwT{font-weight:700;color:#f0e6cd;font-size:14.5px}'+
  '#newsEntry .nwDate{color:#cbbd93;font-size:12.5px}'+
  '#newsEntry .nwBadge{margin-left:auto;background:rgba(230,200,135,.16);border:1px solid rgba(230,200,135,.55);color:#e6c887;border-radius:999px;font-size:11px;padding:2px 9px;white-space:nowrap}'+
  '#newsEntry .nwDot{width:8px;height:8px;border-radius:50%;background:#ff6b5e;box-shadow:0 0 8px #ff6b5e;flex:none}'+
  '#newsEntry .nwChev{color:#e6c887;font-weight:800}'+
  /* 快讯条 */
  '#newsTicker{position:fixed;left:14px;bottom:54px;z-index:9;display:none;align-items:center;gap:8px;max-width:min(430px,calc(100vw - 28px));height:30px;background:rgba(8,13,24,.88);border:1px solid rgba(230,200,135,.45);border-radius:999px;padding:0 8px 0 12px;font-size:12px;color:#f0e6cd;backdrop-filter:blur(10px);cursor:pointer;box-sizing:border-box}'+
  '#newsTicker.alert{background:rgba(46,14,12,.9);border-color:rgba(255,107,94,.65)}'+
  '#newsTicker .ntLab{color:#e6c887;font-weight:800;flex:none}'+
  '#newsTicker.alert .ntLab{color:#ff9d8a}'+
  '#newsTicker .ntTx{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}'+
  '#newsTicker .ntX{flex:none;background:none;border:none;color:#e6c887;font-size:14px;font-weight:800;cursor:pointer;padding:2px 5px;line-height:1}'+
  '@media(max-width:760px){#newsTicker{left:8px;bottom:calc(50px + env(safe-area-inset-bottom));max-width:calc(100vw - 16px)}}'+
  /* 弹窗 */
  '#newsModal{position:fixed;inset:0;background:rgba(5,10,20,.74);display:none;align-items:center;justify-content:center;z-index:65;padding:10px}'+
  '.nwBox{width:min(94vw,430px);max-height:min(88dvh,640px);display:flex;flex-direction:column;background:rgba(15,25,45,.96);border:1px solid rgba(230,200,135,.4);border-radius:16px;padding:14px;backdrop-filter:blur(14px);box-sizing:border-box}'+
  '.nwHead{display:flex;align-items:baseline;gap:8px;flex:none}'+
  '.nwHead h3{color:#e6c887;margin:0;font-size:17px;letter-spacing:.05em}'+
  '.nwHead .nwD{color:#f0e6cd;font-size:13.5px;font-weight:700}'+
  '.nwHead .nwU{margin-left:auto;color:#8b93a3;font-size:10.5px}'+
  '#newsClose{width:34px;height:34px;flex:none;align-self:flex-start;background:none!important;border:none!important;box-shadow:none!important;color:#e6c887;font-size:19px;font-weight:700;text-shadow:0 1px 7px rgba(0,0,0,.65);cursor:pointer;line-height:1;padding:0}'+
  '.nwList{overflow-y:auto;min-height:0;margin-top:6px}'+
  '.nwItem{display:flex;gap:9px;padding:10px 4px;border-bottom:1px dashed rgba(255,255,255,.1);border-radius:8px}'+
  '.nwItem.hl{background:rgba(230,200,135,.1)}'+
  '.nwChip{flex:none;font-size:10px;font-weight:800;padding:2.5px 7px;border-radius:6px;height:fit-content;margin-top:1px;border:1px solid}'+
  '.nwTx{flex:1;min-width:0}'+
  '.nwH{font-size:13.5px;color:#f2eee1;font-weight:700;line-height:1.5}'+
  'a.nwH{text-decoration:none}a.nwH:hover{text-decoration:underline}'+
  '.nwDsc{font-size:11.5px;color:#9aa3b2;line-height:1.55;margin-top:2px}'+
  '.nwMeta{font-size:10px;color:#6f7789;margin-top:3px}'+
  '.nwFly{flex:none;align-self:center;background:none;border:1px solid rgba(230,200,135,.65);color:#e6c887;font-size:11px;font-weight:700;padding:5px 10px;border-radius:999px;cursor:pointer;white-space:nowrap}'+
  '.nwEmpty{color:#9aa3b2;font-size:13px;padding:16px 4px;text-align:center}'+
  '.nwYHead{display:flex;justify-content:space-between;align-items:center;width:100%;background:none;border:none;border-top:1px solid rgba(230,200,135,.22);color:#cbbd93;font-size:12.5px;font-weight:700;padding:11px 2px 3px;cursor:pointer;margin-top:6px}'+
  /* 地图标记（HTML 投影点） */
  '#newsPins{position:fixed;inset:0;pointer-events:none;z-index:8;overflow:hidden}'+
  '.nwPin{position:absolute;transform:translate(-50%,-100%);pointer-events:auto;background:none;border:none;cursor:pointer;padding:0;display:flex;flex-direction:column;align-items:center;gap:3px}'+
  '.nwPin .dot{width:25px;height:25px;border-radius:50%;background:#e6c887;color:#23190a;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 5px rgba(230,200,135,.22),0 4px 10px rgba(0,0,0,.45);animation:nwPulse 2.2s infinite}'+
  '.nwPin.red .dot{background:#ff6b5e;color:#fff;box-shadow:0 0 0 5px rgba(255,107,94,.22),0 4px 10px rgba(0,0,0,.45)}'+
  '.nwPin .lab{max-width:118px;background:rgba(8,12,22,.86);color:#f0e6cd;font-size:10px;font-weight:600;padding:2px 7px;border-radius:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '@keyframes nwPulse{0%{box-shadow:0 0 0 3px rgba(230,200,135,.3),0 4px 10px rgba(0,0,0,.45)}50%{box-shadow:0 0 0 8px rgba(230,200,135,.08),0 4px 10px rgba(0,0,0,.45)}100%{box-shadow:0 0 0 3px rgba(230,200,135,.3),0 4px 10px rgba(0,0,0,.45)}}';
  document.head.appendChild(st);
}

function buildDom(){
  if($('newsModal')) return;
  /* 面板入口（景点介绍模块上方）：只在数据加载成功后显示。锚点用景点模块——天气模块已移入弹窗，不能再作锚点 */
  var spT=$('hSpotsT');
  if(spT&&spT.closest('.mod')){
    var sec=document.createElement('section'); sec.className='mod'; sec.id='newsMod'; sec.style.display='none';
    sec.innerHTML='<button id="newsEntry" class="route" type="button"></button>';
    spT.closest('.mod').before(sec);
    sec.querySelector('#newsEntry').addEventListener('click',function(){ openModal(); });
  }
  /* 快讯条 */
  var tk=document.createElement('div'); tk.id='newsTicker';
  tk.innerHTML='<span class="ntLab"></span><span class="ntTx"></span><button class="ntX" type="button" aria-label="close">✕</button>';
  var sb=$('statusbar'); if(sb) sb.before(tk); else document.body.appendChild(tk);
  tk.addEventListener('click',function(e){ if(e.target.classList.contains('ntX')) return; openModal(); });
  tk.querySelector('.ntX').addEventListener('click',function(e){
    e.stopPropagation(); closedToday=true;
    try{ localStorage.setItem('tt_newsx', todayStr()); }catch(err){}
    tk.style.display='none';
  });
  /* 弹窗 */
  var md=document.createElement('div'); md.id='newsModal';
  md.innerHTML='<div class="nwBox"><div class="nwHead"><h3></h3><span class="nwD"></span><span class="nwU"></span><button id="newsClose" type="button" aria-label="close">×</button></div><div class="nwList"></div></div>';
  document.body.appendChild(md);
  md.addEventListener('click',function(e){ if(e.target===md) closeModal(); });
  md.querySelector('#newsClose').addEventListener('click',closeModal);
  /* 地图标记层 */
  var pins=document.createElement('div'); pins.id='newsPins'; document.body.appendChild(pins);
}

function chipHtml(it){
  var c=LV_COLOR[it.level]||'#e6c887';
  var lab=it.cat||T('newsLv_'+it.level);
  return '<span class="nwChip" style="color:'+c+';border-color:'+c+'66;background:'+c+'14">'+esc(lab)+'</span>';
}
function itemHtml(it){
  var title=pick(it,'title'), desc=pick(it,'desc');
  var h=it.url?'<a class="nwH" target="_blank" rel="noopener" href="'+esc(it.url)+'">'+esc(title)+'</a>':'<div class="nwH">'+esc(title)+'</div>';
  var meta=[it.source,it.time].filter(Boolean).join(' · ');
  return '<div class="nwItem" data-nid="'+esc(it.id)+'">'+chipHtml(it)+'<div class="nwTx">'+h+
    (desc?'<div class="nwDsc">'+esc(desc)+'</div>':'')+
    (meta?'<div class="nwMeta">'+esc(meta)+'</div>':'')+'</div>'+
    (it.spotId?'<button class="nwFly" type="button" data-fly="'+esc(it.spotId)+'">'+esc(T('newsFly'))+' ›</button>':'')+'</div>';
}
function renderModal(hlId){
  var md=$('newsModal'); if(!md||!DATA) return;
  md.querySelector('.nwHead h3').textContent=T('newsTitle');
  md.querySelector('.nwD').textContent=dateLabel(DATA.date);
  md.querySelector('.nwU').textContent=DATA.updated?T('newsUpdated').replace('{t}',DATA.updated):'';
  var list=md.querySelector('.nwList');
  var html=items.length?items.map(itemHtml).join(''):'<div class="nwEmpty">'+esc(T('newsEmpty'))+'</div>';
  if(yItems.length){
    html+='<button class="nwYHead" type="button" id="nwYTog"><span>'+esc(T('newsYesterday'))+'</span><span>⌄</span></button><div id="nwYBody" style="display:none">'+yItems.map(itemHtml).join('')+'</div>';
  }
  list.innerHTML=html;
  list.querySelectorAll('.nwFly').forEach(function(b){
    b.addEventListener('click',function(){
      var sid=b.getAttribute('data-fly'); closeModal(); if(api) api.flySpot(sid);
    });
  });
  var tog=$('nwYTog');
  if(tog) tog.addEventListener('click',function(){
    var yb=$('nwYBody'); if(yb) yb.style.display=(yb.style.display==='none')?'':'none';
  });
  if(hlId){
    var el=list.querySelector('[data-nid="'+hlId+'"]');
    if(el){ el.classList.add('hl'); try{ el.scrollIntoView({block:'center'}); }catch(e){} }
  }
}
function openModal(hlId){ renderModal(hlId); var md=$('newsModal'); if(md) md.style.display='flex'; }
function closeModal(){ var md=$('newsModal'); if(md) md.style.display='none'; }

function paintEntry(){
  var sec=$('newsMod'), btn=$('newsEntry');
  if(!sec||!btn||!DATA) return;
  sec.style.display='';
  btn.innerHTML='<span class="nwT">📰 '+esc(T('newsTitle'))+'</span><span class="nwDate">· '+esc(dateLabel(DATA.date))+'</span>'+
    (hasAlert?'<span class="nwDot"></span>':'')+
    (items.length?'<span class="nwBadge">'+esc(T('newsItemsFmt').replace('{n}',items.length))+'</span>':'')+
    '<span class="nwChev">›</span>';
}
function topItems(){ return items.slice(0,3); }
function paintTicker(){
  var tk=$('newsTicker'); if(!tk) return;
  var tops=topItems();
  if(!tops.length||closedToday){ tk.style.display='none'; return; }
  var it=tops[tickerIdx%tops.length];
  tk.classList.toggle('alert',hasAlert);
  tk.querySelector('.ntLab').textContent=T('newsFlash');
  tk.querySelector('.ntTx').textContent=pick(it,'title');
  tk.querySelector('.ntX').style.display=hasAlert?'none':'';
  tk.style.display='flex';
}
function rotateTicker(){
  if(tickerTimer) clearInterval(tickerTimer);
  tickerTimer=setInterval(function(){
    var tops=topItems(); if(tops.length<2) return;
    tickerIdx=(tickerIdx+1)%tops.length; paintTicker();
  },5000);
}
/* 地图标记：HTML 投影点，rAF 跟随相机；不介入现有射线点击 */
var pinEls=[];
function buildPins(){
  var wrap=$('newsPins'); if(!wrap) return;
  wrap.innerHTML=''; pinEls=[];
  items.filter(function(it){ return it.spotId; }).slice(0,3).forEach(function(it){
    var pos=api.spotPos(it.spotId); if(!pos) return;
    var b=document.createElement('button'); b.type='button';
    b.className='nwPin'+(it.level==='alert'?' red':'');
    b.innerHTML='<span class="dot">!</span><span class="lab">'+esc(pick(it,'title'))+'</span>';
    b.addEventListener('click',function(){ openModal(it.id); });
    wrap.appendChild(b);
    pinEls.push({el:b,x:pos.x,y:pos.h+5,z:pos.z});
  });
}
var pinRaf=false;
function pinLoop(){
  if(!api||!api.project) return;
  pinEls.forEach(function(p){
    var s=api.project(p.x,p.y,p.z);
    if(!s||!s.visible){ p.el.style.display='none'; return; }
    p.el.style.display='flex'; p.el.style.left=s.x+'px'; p.el.style.top=s.y+'px';
  });
  /* 漫游控制栏出现时快讯条让位 */
  var tb=$('tourbar'), tk=$('newsTicker');
  if(tb&&tk&&tk.style.display!=='none'){
    var touring=getComputedStyle(tb).display!=='none';
    tk.style.visibility=touring?'hidden':'';
  }
  requestAnimationFrame(pinLoop);
}

function paint(){ if(!DATA) return; paintEntry(); paintTicker(); renderModal(); }

window.TokyoNews={
  init:function(a){
    api=a; injectCss(); buildDom();
    try{ closedToday=(localStorage.getItem('tt_newsx')===todayStr()); }catch(e){}
    fetch('news.json',{cache:'no-cache'}).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(d){
      if(!d||!Array.isArray(d.items)) return;
      DATA=d;
      items=sortItems(d.items.filter(alive));
      yItems=sortItems((d.yesterday||[]).filter(alive));
      hasAlert=items.some(function(it){ return it.level==='alert'; });
      paintEntry(); paintTicker(); rotateTicker(); buildPins();
      if(!pinRaf){ pinRaf=true; requestAnimationFrame(pinLoop); }
    }).catch(function(){ /* 加载失败：入口/快讯/标记全部不显示 */ });
  },
  paint:paint,
  open:openModal
};
})();
