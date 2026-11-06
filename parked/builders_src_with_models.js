import * as THREE from 'three';

const M = {
  ground: new THREE.MeshStandardMaterial({color:0xd8dfc8, roughness:1}),
  water: new THREE.MeshStandardMaterial({color:0x3d7dc4, roughness:0.35, metalness:0.1}),
  park: new THREE.MeshStandardMaterial({color:0x7fb069, roughness:1}),
  road: new THREE.MeshStandardMaterial({color:0x9aa0a6, roughness:1}),
  white: new THREE.MeshStandardMaterial({color:0xf5f5f5, roughness:0.7}),
  red: new THREE.MeshStandardMaterial({color:0xd92323, roughness:0.6}),
  orange: new THREE.MeshStandardMaterial({color:0xe85d26, roughness:0.6}),
  blue: new THREE.MeshStandardMaterial({color:0x7fb2d9, roughness:0.4, metalness:0.3}),
  grey: new THREE.MeshStandardMaterial({color:0xb8bec6, roughness:0.8}),
  dark: new THREE.MeshStandardMaterial({color:0x334155, roughness:0.8}),
  gold: new THREE.MeshStandardMaterial({color:0xd4a017, roughness:0.5}),
  pink: new THREE.MeshStandardMaterial({color:0xef7aa2, roughness:0.7}),
  roof: new THREE.MeshStandardMaterial({color:0x274156, roughness:0.9}),
};

function label(text, scale=1, color='#12233a'){
  const c=document.createElement('canvas'); c.width=512; c.height=128;
  const g=c.getContext('2d'); g.font='bold 52px "PingFang SC","Microsoft YaHei",sans-serif';
  g.textAlign='center'; g.textBaseline='middle';
  g.shadowColor='rgba(255,255,255,0.95)'; g.shadowBlur=14; g.fillStyle=color; g.fillText(text,256,64);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c), transparent:true, depthTest:false}));
  sp.scale.set(11*scale, 2.75*scale, 1); return sp;
}
function box(w,h,d,mat,x=0,y=null,z=0){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x, y===null?h/2:y, z); m.castShadow=true; return m; }
function cyl(rt,rb,h,mat,x=0,z=0,seg=12){ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat); m.position.set(x,h/2,z); m.castShadow=true; return m; }
function cone(r,h,mat,x=0,z=0,seg=16,y=null){ const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,seg),mat); m.position.set(x, y===null?h/2:y, z); m.castShadow=true; return m; }
function beam(x1,y1,z1,x2,y2,z2,mat,r=0.08){ const a=new THREE.Vector3(x1,y1,z1), b=new THREE.Vector3(x2,y2,z2); const len=a.distanceTo(b); const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,6),mat); m.position.copy(a).lerp(b,0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), b.clone().sub(a).normalize()); return m; }
function ring(rad,y,mat,x=0,z=0){ const m=new THREE.Mesh(new THREE.TorusGeometry(rad,0.09,8,32),mat); m.rotation.x=Math.PI/2; m.position.set(x,y,z); return m; }
const ANIM=[];
function sph(r,mat,x=0,y=0,z=0,sx=1,sy=1,sz=1){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,14,12),mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; return m; }
function tor(r,t,mat,x=0,y=0,z=0,rx=0,ry=0){ const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,40),mat); m.position.set(x,y,z); m.rotation.set(rx,ry,0); m.castShadow=true; return m; }
function cnv(w,h,fn){ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
function std(o){ return new THREE.MeshStandardMaterial(o); }
const RND=(a,b)=>a+Math.random()*(b-a);
function texMat(tex,opts){ return new THREE.MeshStandardMaterial(Object.assign({map:tex, roughness:0.85}, opts||{})); }
function glowMat(tex){ return new THREE.MeshStandardMaterial({map:tex, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:0.55, roughness:0.6}); }
function facadeTex(base, win){ base=base||'#cfd6de'; win=win||'#ffe9a8'; return cnv(128,256,(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h); for(let y=8;y<h-8;y+=16) for(let x=8;x<w-8;x+=14){ g.fillStyle='rgba(240,243,245,0.9)'; g.fillRect(x-1,y-1,10,11); const wg=g.createLinearGradient(0,y,0,y+9); if(Math.random()<0.42){ wg.addColorStop(0,win); wg.addColorStop(1,'#d9b96a'); } else { wg.addColorStop(0,'#63788c'); wg.addColorStop(1,'#3c4f61'); } g.fillStyle=wg; g.globalAlpha=0.75+Math.random()*0.25; g.fillRect(x,y,8,9); g.globalAlpha=1; g.fillStyle='rgba(255,255,255,0.25)'; g.fillRect(x,y,8,2); } }); }
function glassTex(base){ base=base||'#9fc6e0'; return cnv(128,256,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#e6f2fb'); gr.addColorStop(0.5,base); gr.addColorStop(1,'#6f9fc4'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.strokeStyle='rgba(255,255,255,0.35)'; g.lineWidth=1; for(let y=0;y<=h;y+=16){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); } for(let x=0;x<=w;x+=16){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); } }); }
function signTex(text,bg,fg,vert){ bg=bg||'#e11d48'; fg=fg||'#ffffff'; if(vert===false){ return cnv(256,96,(g,w,h)=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.fillStyle=fg; g.font='bold 42px "PingFang SC","Microsoft YaHei",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(text,w/2,h/2+2); }); } return cnv(96,256,(g,w,h)=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.fillStyle=fg; g.font='bold 42px "PingFang SC","Microsoft YaHei",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; const ch=[...text]; ch.forEach((c,i)=>g.fillText(c, w/2, 38+i*((h-76)/Math.max(ch.length-1,1)))); }); }
function screenTex(lines){ return cnv(256,160,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#2563eb'); gr.addColorStop(0.55,'#111827'); gr.addColorStop(1,'#db2777'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#ffffff'; g.textAlign='center'; lines.forEach((tx,i)=>{ g.font=(i===0?'bold 38px':'bold 25px')+' "PingFang SC","Microsoft YaHei",sans-serif'; g.fillText(tx, w/2, 56+i*42); }); }); }
function brickTex(){ const t=cnv(256,128,(g,w,h)=>{ g.fillStyle='#9c3d2e'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(255,235,220,0.22)'; for(let y=0;y<h;y+=10){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); for(let x=(Math.floor(y/10)%2)*16;x<w;x+=32){ g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+10); g.stroke(); } } g.fillStyle='#f3e9dc'; g.fillRect(0,24,w,9); g.fillRect(0,84,w,9); }); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,1); return t; }
function kawaraTex(){ const t=cnv(256,256,(g,w,h)=>{ g.fillStyle='#33475c'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=32){ g.fillStyle='rgba(255,255,255,0.10)'; g.fillRect(0,y,w,3); g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(0,y+26,w,6); for(let x=0;x<w;x+=16){ g.strokeStyle='rgba(0,0,0,0.28)'; g.lineWidth=2; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+32); g.stroke(); g.fillStyle='rgba(255,255,255,0.06)'; g.fillRect(x+2,y+4,3,24); } } }); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(2,2); return t; }
function templeWallTex(){ return cnv(256,256,(g,w,h)=>{ g.fillStyle='#f4efe4'; g.fillRect(0,0,w,h); g.fillStyle='#8c2f26'; g.fillRect(0,0,14,h); g.fillRect(w-14,0,14,h); g.fillRect(0,0,w,16); g.fillRect(0,h-16,w,16); g.fillStyle='rgba(60,40,30,0.5)'; for(let x=42;x<w-20;x+=26) g.fillRect(x,44,3,h-88); for(let y=44;y<h-20;y+=26) g.fillRect(28,y,w-56,3); }); }
function stationTex(){ const t=cnv(512,256,(g,w,h)=>{ g.fillStyle='#9c3d2e'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(255,235,220,0.16)'; g.lineWidth=1; for(let y=0;y<h;y+=9){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); } g.fillStyle='#f3e9dc'; g.fillRect(0,20,w,12); g.fillRect(0,h-30,w,12); for(let r=0;r<2;r++){ const y0=58+r*84; for(let x=26;x<w-20;x+=48){ g.fillStyle='#f3e9dc'; g.beginPath(); g.arc(x+14,y0+16,15,Math.PI,0); g.fill(); g.fillRect(x-1,y0+16,30,38); g.fillStyle='#2e3d4d'; g.beginPath(); g.arc(x+14,y0+16,11,Math.PI,0); g.fill(); g.fillRect(x+3,y0+16,22,34); g.fillStyle='rgba(255,255,255,0.25)'; g.fillRect(x+6,y0+20,5,26); } } }); t.wrapS=THREE.RepeatWrapping; return t; }
function clockTex(){ return cnv(128,128,(g,w,h)=>{ g.fillStyle='#f8f4e8'; g.beginPath(); g.arc(64,64,60,0,7); g.fill(); g.strokeStyle='#2b2b2b'; g.lineWidth=5; g.beginPath(); g.arc(64,64,58,0,7); g.stroke(); g.fillStyle='#2b2b2b'; for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; g.fillRect(64+Math.cos(a)*48-2, 64+Math.sin(a)*48-2, 4, 4); } g.strokeStyle='#2b2b2b'; g.lineWidth=6; g.beginPath(); g.moveTo(64,64); g.lineTo(64,30); g.stroke(); g.lineWidth=4; g.beginPath(); g.moveTo(64,64); g.lineTo(92,74); g.stroke(); }); }
function barrelTex(){ return cnv(128,128,(g,w,h)=>{ g.fillStyle='#f1e6cf'; g.fillRect(0,0,w,h); const cols=['#c0392b','#2456a6','#1e8449','#7d3c98','#d4a017']; for(let i=0;i<5;i++){ g.fillStyle=cols[i]; g.beginPath(); g.arc(24+(i%3)*40, 30+Math.floor(i/3)*52, 15, 0, 7); g.fill(); } g.fillStyle='#333'; g.font='bold 26px "PingFang SC","Microsoft YaHei",sans-serif'; g.textAlign='center'; g.fillText('清酒', 64, 118); }); }
function archTex(){ return cnv(256,96,(g,w,h)=>{ g.fillStyle='#f472b6'; g.fillRect(0,0,w,h); const cols=['#fff','#fde047','#38bdf8','#a78bfa']; for(let i=0;i<14;i++){ g.fillStyle=cols[i%4]; g.beginPath(); g.arc(14+i*17, 14+(i%3)*10, 6, 0, 7); g.fill(); } g.fillStyle='#ffffff'; g.font='bold 40px "PingFang SC","Microsoft YaHei",sans-serif'; g.textAlign='center'; g.fillText('竹下通り', w/2, 66); }); }
function hipRoof(w,h,d,mat,x,y,z){ // 真·歇山式坡屋顶：带屋脊的四坡顶（替代原先拉伸的四角锥“菱形顶”）
  const hw=w/2, hd=d/2, tris=[];
  const A=[-hw,0,-hd], B=[hw,0,-hd], C=[hw,0,hd], D=[-hw,0,hd];
  if(w>=d){ const r=hw-hd, R1=[-r,h,0], R2=[r,h,0];
    tris.push([A,R2,B]); if(r>0.001) tris.push([A,R1,R2]);
    tris.push([C,R1,D]); if(r>0.001) tris.push([C,R2,R1]);
    tris.push([D,R1,A],[B,R2,C]);
  } else { const r=hd-hw, R1=[0,h,-r], R2=[0,h,r];
    tris.push([D,R1,A]); if(r>0.001) tris.push([D,R2,R1]);
    tris.push([B,R2,C]); if(r>0.001) tris.push([B,R1,R2]);
    tris.push([A,R1,B],[C,R2,D]);
  }
  tris.push([A,B,C],[A,C,D]);
  const pos=[], uvA=[];
  tris.forEach(t=>t.forEach(p=>{ pos.push(p[0],p[1],p[2]); uvA.push(p[0]/w+0.5, p[2]/d+0.5); }));
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvA,2));
  geo.computeVertexNormals();
  const m=new THREE.Mesh(geo, mat); m.position.set(x,y,z); m.castShadow=true; return m; }
const treeMat=std({color:0x3e7d3a, roughness:1});
const darkGreen=std({color:0x2c5d31, roughness:1});
const pinkTree=std({color:0xf2a7c3, roughness:1});
function tree(x,z,sc,mat){ sc=sc||1; const g=new THREE.Group(); g.position.set(x,0,z); g.add(cyl(0.07*sc,0.1*sc,0.8*sc,M.dark,0,0,6)); g.add(sph(0.6*sc, mat||treeMat, 0, 1.25*sc, 0)); g.add(sph(0.42*sc, mat||treeMat, 0.36*sc, 1.0*sc, 0.14*sc)); return g; }
function people(g,n,x0,x1,z0,z1,y){ const cols=[0xef4444,0x3b82f6,0xf59e0b,0x10b981,0xf8fafc,0x334155]; for(let i=0;i<n;i++){ const p=cyl(0.05,0.07,0.34, std({color:cols[i%6], roughness:0.8}), RND(x0,x1), RND(z0,z1), 6); p.position.y=(y||0.3)+0.17; g.add(p); } }
function cable(g,x1,y1,z1,x2,y2,z2,sag,mat){ const N=8; let px=x1,py=y1,pz=z1; for(let i=1;i<=N;i++){ const u=i/N; const x=x1+(x2-x1)*u, z=z1+(z2-z1)*u, y=y1+(y2-y1)*u-Math.sin(Math.PI*u)*sag; g.add(beam(px,py,pz,x,y,z,mat,0.03)); px=x; py=y; pz=z; } }
function blink(mat){ ANIM.push(t=>{ mat.color.setHex(Math.sin(t*2.4)>0?0xff3333:0x551111); }); return mat; }
function inPoly(x,z,poly){ let inside=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const xi=poly[i][0],zi=poly[i][1],xj=poly[j][0],zj=poly[j][1]; if(((zi>z)!==(zj>z)) && (x < (xj-xi)*(z-zi)/(zj-zi)+xi)) inside=!inside; } return inside; }

// 景点数据：x 向东，z 向南（北在 -z）
const spots=[
 {id:'skytree', name:'东京晴空塔', x:16, z:-14, h:22.5, desc:'高 634 米的电波塔，塔身从三角形底座向上逐渐变圆是它的标志，登上展望台可以俯瞰整个东京，天气好时能看到富士山。', make:g=>{
  const lod=new THREE.LOD();
  const hi=new THREE.Group(), lo=new THREE.Group();
  const steel=std({color:0xd9e1e6, roughness:0.46, metalness:0.35});
  const H=14.6, LEVELS=18, SEG=16;
  const baseR=y=>{ const t=y/H; return 1.55+(0.60-1.55)*Math.pow(t,0.8)+0.05*Math.sin(t*Math.PI); };
  const radiusAt=(th,y)=>{ const t=y/H; return baseR(y)*(1+0.13*Math.cos(3*th+y*0.05)*(1-t)); };
  const nodes=[];
  for(let l=0;l<=LEVELS;l++){ const y=0.4+l*((H-0.4)/LEVELS); const ringN=[]; for(let k=0;k<SEG;k++){ const th=k/SEG*Math.PI*2+l*0.035; ringN.push([Math.cos(th)*radiusAt(th,y), y, Math.sin(th)*radiusAt(th,y)]); } nodes.push(ringN); }
  const pairs=[];
  for(let l=0;l<LEVELS;l++) for(let k=0;k<SEG;k++){ pairs.push([nodes[l][k], nodes[l+1][k]]); if((l+k)%2===0) pairs.push([nodes[l][k], nodes[l+1][(k+1)%SEG]]); else pairs.push([nodes[l][(k+1)%SEG], nodes[l+1][k]]); }
  const strutGeo=new THREE.CylinderGeometry(0.028,0.028,1,5); strutGeo.translate(0,0.5,0);
  const inst=new THREE.InstancedMesh(strutGeo, steel, pairs.length);
  const dum=new THREE.Object3D(), va=new THREE.Vector3(), vb=new THREE.Vector3(), dir=new THREE.Vector3(), UPV=new THREE.Vector3(0,1,0);
  pairs.forEach((pr,idx)=>{ va.fromArray(pr[0]); vb.fromArray(pr[1]); dir.subVectors(vb,va); const len=dir.length(); dum.position.copy(va); dum.quaternion.setFromUnitVectors(UPV, dir.normalize()); dum.scale.set(1,len,1); dum.updateMatrix(); inst.setMatrixAt(idx, dum.matrix); });
  inst.castShadow=true; hi.add(inst);
  for(let l=0;l<=LEVELS;l+=2){ const y=nodes[l][0][1]; const ringM=new THREE.Mesh(new THREE.TorusGeometry(baseR(y)*1.0,0.035,6,48), steel); ringM.rotation.x=Math.PI/2; ringM.position.y=y; hi.add(ringM); }
  const core=cyl(0.52,1.05,H-0.4, std({color:0xcdd9e2,roughness:0.4,metalness:0.1,transparent:true,opacity:0.22})); core.position.y=0.4+(H-0.4)/2; hi.add(core);
  const deckMat=texMat(glassTex('#d4e4f0')); deckMat.emissive=new THREE.Color(0x000000);
  const rimMat=std({color:0xe8edf0, roughness:0.42, metalness:0.3});
  const glowMatN=new THREE.MeshBasicMaterial({color:0x14384f});
  function deck(r,y,hh,parent){ const d=cyl(r,r,hh,deckMat,0,0,28); d.position.y=y; parent.add(d);
    const sk=cyl(r*0.98,r*1.15,hh*0.56,rimMat,0,0,28); sk.position.y=y-hh/2-hh*0.28; parent.add(sk);
    [y-hh/2, y+hh/2].forEach(ry=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(r*1.03,0.045,6,48), rimMat); t.rotation.x=Math.PI/2; t.position.y=ry; parent.add(t); });
    const gl=new THREE.Mesh(new THREE.TorusGeometry(r+0.03,0.026,6,48), glowMatN); gl.rotation.x=Math.PI/2; gl.position.y=y; parent.add(gl); }
  deck(1.30, 11.5, 0.95, hi); deck(0.90, 14.6, 0.8, hi);
  const mast=cyl(0.05,0.17,5.5,steel); mast.position.y=17.5; hi.add(mast);
  const col1=cyl(0.17,0.17,0.3,steel); col1.position.y=16.2; hi.add(col1);
  const col2=cyl(0.12,0.12,0.26,steel); col2.position.y=18.4; hi.add(col2);
  const loBody=cyl(0.60,1.55,H, std({color:0xc3cfd8,roughness:0.5,metalness:0.3})); loBody.position.y=0.4+H/2; lo.add(loBody);
  deck(1.30, 11.5, 0.95, lo); deck(0.90, 14.6, 0.8, lo);
  const loMast=cyl(0.05,0.17,5.5,steel); loMast.position.y=17.5; lo.add(loMast);
  lod.addLevel(hi, 0); lod.addLevel(lo, 78); g.add(lod);
  window.NIGHT_FNS=window.NIGHT_FNS||[]; NIGHT_FNS.push(n=>{ const purp=new Date(Date.now()+9*3600*1000).getDate()%2===1; deckMat.emissive.setHex(n?(purp?0x5a3a8a:0x2e5f8f):0x000000); glowMatN.color.setHex(n?(purp?0xc09aff:0x86d7ff):0x14384f); });
  g.add(box(7.6,1.1,5, texMat(glassTex('#b7d3e8')), 0,0.55,2.4));
  g.add(box(6.4,0.9,4, M.white, -0.4,0.45,-2.8));
  g.add(box(7.8,0.35,5.2, std({color:0xd8cfb8,roughness:1}), 0,0.17,2.4));
  const bc1=sph(0.17, new THREE.MeshBasicMaterial({color:0xff2222}), 0,20.4,0); g.add(bc1);
  const bc2=sph(0.12, new THREE.MeshBasicMaterial({color:0xff4444}), 0,15.4,0); g.add(bc2);
  ANIM.push(t=>{ const on=Math.sin(t*2.4)>0; bc1.material.color.setHex(on?0xff2222:0x551111); bc2.material.color.setHex(on?0x441111:0xff4444); });
  g.add(tree(3.4,4.4,0.9)); g.add(tree(-3.6,4.2,0.8)); g.add(tree(4.2,-3.4,0.85)); } },
 {id:'sensoji', name:'浅草寺', x:13, z:-19, h:8, desc:'东京最古老的寺庙：先穿过挂着大红灯笼的雷门，沿仲见世商店街走到本堂，旁边就是五重塔，适合穿和服慢慢逛。', make:g=>{ const roofT=texMat(kawaraTex()); const stone=std({color:0xcfc4a5,roughness:1}); g.add(box(11,0.3,13.5,stone,0,0.15,0.4));
const wood=std({color:0x6b4423,roughness:0.9});
function templeRoof(w,d,x,y,z){ g.add(hipRoof(w,0.85,d,roofT,x,y,z)); g.add(hipRoof(w*0.62,0.6,d*0.62,roofT,x,y+0.8,z)); }
const gate=new THREE.Group(); gate.position.set(0,0,5.4); g.add(gate);
[-1.9,1.9].forEach(x=>{ const pl=cyl(0.34,0.4,3.4,M.red,x,0,10); gate.add(pl); });
gate.add(box(5.7,0.32,2.3,roofT,0,3.5,0)); const gr=hipRoof(5.9,1.05,2.7,roofT,0,3.6,0); gate.add(gr);
const lan=sph(0.95, std({color:0xd92323,roughness:0.55}), 0,1.95,0, 1,1.28,1); gate.add(lan);
const band=cyl(0.98,0.98,0.2,M.dark,0,0,20); band.position.y=1.95; gate.add(band);
gate.add(box(1.4,0.26,0.3,M.gold,0,3.18,0)); gate.add(box(1.4,0.26,0.3,M.gold,0,0.74,0));
gate.add(box(0.9,1.1,0.14, glowMat(signTex('雷門','#1f2937','#fbbf24',false)), 0,2.6,1.18));
for(let i=0;i<4;i++){ const z=3.3-i*1.75; [-2.3,2.3].forEach(x=>{ g.add(box(1.8,1.45,1.5, i%2?M.white:std({color:0xf3e5cf,roughness:0.9}), x,0.72,z)); const aw=box(1.95,0.1,1.15, i%2?M.red:M.blue, x,1.6,z+0.25); aw.rotation.x=0.28; g.add(aw); }); }
const hz=new THREE.Group(); hz.position.set(0,0,-2.7); g.add(hz);
[-2.2,2.2].forEach(x=>hz.add(cyl(0.36,0.42,2.6,M.red,x,0,10)));
hz.add(box(5.9,1.5,2, M.red, 0,3.2,0)); hz.add(box(6.4,0.3,2.5,roofT,0,4.05,0)); const hr=hipRoof(6.2,1,2.9,roofT,0,4.15,0); hz.add(hr);
const lan2=sph(0.7, std({color:0xd92323,roughness:0.55}), 0,1.5,0, 1,1.25,1); hz.add(lan2);
const hall=new THREE.Group(); hall.position.set(0.6,0,-5.6); g.add(hall);
hall.add(box(6.2,2.3,3.6, texMat(templeWallTex()), 0,1.15,0)); hall.add(box(6.2,0.8,3.6, M.red, 0,0.4,0));
const hr2=hipRoof(7.4,1.5,4.8,roofT,0,2.3,0); hall.add(hr2); const hr3=hipRoof(4.6,0.9,3,roofT,0,3.7,0); hall.add(hr3);
hall.add(box(1.8,0.3,0.3,M.gold,0,4.75,0));
const pg=new THREE.Group(); pg.position.set(-3.7,0,-4.9); g.add(pg);
let pw=1.8; for(let i=0;i<5;i++){ pg.add(box(pw,0.6,pw,M.red,0,0.32+i*0.98,0)); pg.add(hipRoof(pw+0.8,0.4,pw+0.8,roofT,0,0.66+i*0.98,0)); pw*=0.85; }
const spire=cyl(0.04,0.07,1.7,M.gold,0,0,8); spire.position.y=5.6; pg.add(spire);
[6.15,6.42,6.66].forEach(y=>pg.add(ring(0.2,y,M.gold)));
[[-3.1,3.4],[3.1,3.4],[-3.1,-0.6],[3.1,-0.6]].forEach(q=>{ const sl=new THREE.Group(); sl.position.set(q[0],0.3,q[1]); sl.add(box(0.16,0.8,0.16,stone,0,0.4,0)); sl.add(box(0.42,0.14,0.42,stone,0,0.86,0)); sl.add(box(0.3,0.3,0.3,stone,0,1.08,0)); sl.add(hipRoof(0.55,0.22,0.55,roofT,0,1.22,0)); g.add(sl); });
g.add(tree(4.6,-4.6,1,pinkTree)); g.add(tree(-4.8,-1.4,0.9,pinkTree)); g.add(tree(4.8,0.6,0.85)); people(g,10,-1.4,1.4,-1.6,4.6,0.3); } },
 {id:'tower', name:'东京塔', x:-3, z:9, h:15, desc:'高 333 米的红色铁塔，红白相间的钢架是它的标志（和实物一样的配色），夜晚点灯后尤其漂亮，塔下和两个展望台都值得一看。', make:g=>{
  const tO=std({color:0xe0401c, roughness:0.5, metalness:0.2});
  const tW=std({color:0xf3efe6, roughness:0.5, metalness:0.2});
  const bandCols=[tO,tO,tO,tW,tW,tO,tW,tO,tO];
  const halfW=y=>0.34+2.0*Math.pow(Math.max(0,1-y/13.2),1.35);
  const LV=9, topY=11.15, bandH=topY/LV;
  for(let l=0;l<LV;l++){ const y0=l*bandH, y1=(l+1)*bandH, ym=(y0+y1)/2, m=bandCols[l], w0=halfW(y0), w1=halfW(y1), wm=halfW(ym), lr=l<3?0.10:(l<6?0.085:0.07);
    for(let sx of [-1,1]) for(let sz of [-1,1]) g.add(beam(sx*w0,y0,sz*w0, sx*w1,y1,sz*w1, m, lr));
    for(let sgn of [-1,1]){
      g.add(beam(-w0,y0,sgn*w0, w1,y1,sgn*w1, m, 0.038)); g.add(beam(w0,y0,sgn*w0, -w1,y1,sgn*w1, m, 0.038));
      g.add(beam(sgn*w0,y0,-w0, sgn*w1,y1,w1, m, 0.038)); g.add(beam(sgn*w0,y0,w0, sgn*w1,y1,-w1, m, 0.038));
      g.add(beam(0,y0,sgn*w0, 0,y1,sgn*w1, m, 0.03)); g.add(beam(sgn*w0,y0,0, sgn*w1,y1,0, m, 0.03));
      g.add(beam(-wm,ym,sgn*wm, wm,ym,sgn*wm, m, 0.03)); g.add(beam(sgn*wm,ym,-wm, sgn*wm,ym,wm, m, 0.03));
    }
    g.add(beam(-w1,y1,-w1, w1,y1,-w1, m, 0.05)); g.add(beam(-w1,y1,w1, w1,y1,w1, m, 0.05)); g.add(beam(-w1,y1,-w1, -w1,y1,w1, m, 0.05)); g.add(beam(w1,y1,-w1, w1,y1,w1, m, 0.05));
  }
  g.add(box(0.34,topY,0.34, std({color:0xb8b0a2,roughness:0.85}), 0,topY/2,0));
  g.add(box(3.9,1.5,3.1, std({color:0xe6dfd2,roughness:0.9}), 0,0.75,0));
  g.add(box(4.1,0.18,3.3, std({color:0x8a4a34,roughness:0.8}), 0,1.58,0));
  g.add(box(3.9,0.5,0.06, new THREE.MeshBasicMaterial({color:0x9fc6dd}), 0,0.95,1.58));
  const deckGlass=texMat(glassTex('#aebfca')); deckGlass.emissive=new THREE.Color(0x000000);
  const md=new THREE.Group(); md.position.y=6.5; g.add(md);
  md.add(box(2.7,0.26,2.7, tW, 0,-0.58,0));
  md.add(box(2.55,1.0,2.55, deckGlass, 0,0,0));
  md.add(box(2.75,0.2,2.75, tO, 0,0.62,0));
  const td=cyl(0.8,0.87,0.8, deckGlass, 0,0, 20); td.position.y=10.95; g.add(td);
  const tdr=cyl(0.9,0.9,0.13, tO); tdr.position.y=11.4; g.add(tdr);
  const m1=cyl(0.085,0.11,1.3, tO); m1.position.y=12.05; g.add(m1);
  const m2=cyl(0.06,0.085,1.1, tW); m2.position.y=13.2; g.add(m2);
  const m3=cyl(0.035,0.06,1.2, tO); m3.position.y=14.3; g.add(m3);
  const bc=sph(0.12, new THREE.MeshBasicMaterial({color:0xff2222}), 0,15.05,0); g.add(bc);
  ANIM.push(t=>{ const on=Math.sin(t*2.4)>0; bc.material.color.setHex(on?0xff2222:0x551111); });
  window.NIGHT_FNS=window.NIGHT_FNS||[]; NIGHT_FNS.push(n=>{ tO.emissive.setHex(n?0xa84800:0x000000); tO.emissiveIntensity=n?1.3:1; tW.emissive.setHex(n?0x7a4a16:0x000000); deckGlass.emissive.setHex(n?0x8a5a1e:0x000000); });
 } },
 {id:'shibuya', name:'涩谷十字路口', x:-19, z:11, h:7, desc:'世界闻名的全向十字路口，一次绿灯上千人同时过马路。对面圆柱形的 SHIBUYA 109 和满墙大屏幕，就是日剧里最常见的东京画面。', make:g=>{ g.add(box(13.5,0.3,11.5,M.dark,0,0.15,0));
for(let i=-2;i<=2;i++){ g.add(box(7.2,0.34,0.8,M.white,0,0.18,i*1.5)); g.add(box(0.8,0.34,7.2,M.white,i*1.5,0.18,0)); }
const qf=box(3.6,6.6,3, texMat(facadeTex('#8b98a5')), 4.8,3.3,-3.6); g.add(qf);
g.add(box(3.1,2.7,0.16, glowMat(screenTex(['渋谷','SHIBUYA CROSSING'])), 4.8,4.7,-2.02));
const curveScr=new THREE.Mesh(new THREE.CylinderGeometry(2.35,2.35,2.7,18,1,true,Math.PI*0.72,Math.PI*0.52), glowMat(screenTex(['LIVE','109前']))); curveScr.position.set(4.8,4.55,-3.6); g.add(curveScr);
const sq=box(2.6,10.6,2.6, texMat(glassTex('#7fa8cc')), 6.1,5.3,-4.7); g.add(sq);
g.add(box(2.7,1.1,2.7, M.dark, 6.1,10.9,-4.7));
g.add(box(2.3,1.7,0.16, glowMat(screenTex(['Scramble','Square'])), 6.1,8.6,-3.32));
g.add(box(3,5.6,2.4, texMat(facadeTex('#98a2ac')), -1.6,2.8,-4.8));
g.add(box(0.18,3.4,1.1, glowMat(signTex('センター街','#dc2626')), 0.02,3,-4.8));
const c109=cyl(1.55,1.55,5.8, texMat(facadeTex('#d8cfc0')), -4.9,-3.4, 20); g.add(c109);
g.add(box(2.4,0.95,0.2, glowMat(signTex('SHIBUYA109','#f472b6','#ffffff',false)), -4.9,6.2,-1.78));
g.add(box(3.2,5,2.8, texMat(facadeTex('#a7b0ba')), -5,2.5,3.8));
g.add(box(2.2,1.6,0.14, glowMat(screenTex(['MAGNET','MUSIC'])), -5,3.6,2.38));
const hachi=new THREE.Group(); hachi.position.set(-3.3,0.3,-4.7); const bronze=std({color:0x7a5c33,roughness:0.55,metalness:0.5});
hachi.add(box(0.55,0.42,0.55, std({color:0x8b8f94,roughness:1}), 0,0.21,0));
hachi.add(box(0.36,0.2,0.17, bronze, 0,0.55,0)); const hd=box(0.15,0.17,0.15, bronze, 0.2,0.68,0); hd.rotation.z=-0.35; hachi.add(hd);
hachi.add(box(0.05,0.22,0.05, bronze, -0.22,0.6,0)); g.add(hachi);
g.add(box(0.22,3.6,1.2, glowMat(signTex('カラオケ','#7c3aed')), -3.32,3.2,3.8));
g.add(box(3,4.4,2.6, texMat(glassTex('#8fb8d8')), 5.1,2.2,3.9));
g.add(box(2.6,0.8,0.16, glowMat(screenTex(['109','SALE'])), 5.1,3.6,2.52));
g.add(box(9,0.35,1.2,M.grey,2.8,3.05,4.9));
[-0.5,2.8,6.1].forEach(x=>g.add(box(0.35,3,0.35,M.grey,x,1.5,4.9)));
const tr=new THREE.Group(); [-1.7,0,1.7].forEach(ox=>{ tr.add(box(1.55,0.6,0.72,M.white,ox,0,0)); }); tr.add(box(5.2,0.18,0.74, std({color:0x84cc16,roughness:0.6}), 0,0.05,0)); tr.position.set(0,3.5,4.9); g.add(tr);
ANIM.push(t=>{ tr.position.x=((t*1.1)%17)-8.5; });
people(g,46,-3.2,3.2,-3.2,3.2,0.32);
g.add(tree(-6,5,0.8)); g.add(tree(6.4,-5,0.8)); } },
 {id:'shinjuku', name:'新宿', x:-17, z:-3, h:9, desc:'东京最大的交通枢纽。西口的蚕茧塔（Cocoon Tower）和双塔造型的东京都厅是这里最认得出的两栋楼，东口则是百货和居酒屋街。', make:g=>{ g.add(box(13,0.3,10.5, std({color:0xb9bec6,roughness:1}), 0,0.15,0));
const cocoon=new THREE.Group(); cocoon.position.set(-3.6,0,-1.8); g.add(cocoon);
const cocR=u=>1.2+Math.sin(u*Math.PI)*0.72-u*0.4;
const lpts=[]; for(let i=0;i<=10;i++){ const u=i/10; lpts.push(new THREE.Vector2(cocR(u), u*7.6)); }
const cocCore=new THREE.Mesh(new THREE.LatheGeometry(lpts,20), texMat(glassTex('#a9c6de'))); cocCore.castShadow=true; cocoon.add(cocCore);
const CL=9, CS=14, cnodes=[];
for(let l=0;l<=CL;l++){ const u=l/CL, y=u*7.6, r=cocR(u)*1.03, ringN=[]; for(let k=0;k<CS;k++){ const th=k/CS*Math.PI*2; ringN.push([Math.cos(th)*r, y, Math.sin(th)*r*0.78]); } cnodes.push(ringN); }
const cpairs=[];
for(let l=0;l<CL;l++) for(let k=0;k<CS;k++){ cpairs.push([cnodes[l][k], cnodes[l+1][(k+1)%CS]]); cpairs.push([cnodes[l][k], cnodes[l+1][(k-1+CS)%CS]]); }
const cGeo=new THREE.CylinderGeometry(0.045,0.045,1,5); cGeo.translate(0,0.5,0);
const cInst=new THREE.InstancedMesh(cGeo, std({color:0xe8edf2, roughness:0.45, metalness:0.35}), cpairs.length);
const cdum=new THREE.Object3D(), cva=new THREE.Vector3(), cvb=new THREE.Vector3(), cdir=new THREE.Vector3(), CUP=new THREE.Vector3(0,1,0);
cpairs.forEach((pr,idx)=>{ cva.fromArray(pr[0]); cvb.fromArray(pr[1]); cdir.subVectors(cvb,cva); const len=cdir.length(); cdum.position.copy(cva); cdum.quaternion.setFromUnitVectors(CUP, cdir.normalize()); cdum.scale.set(1,len,1); cdum.updateMatrix(); cInst.setMatrixAt(idx, cdum.matrix); });
cInst.castShadow=true; cocoon.add(cInst);
for(let l=0;l<=CL;l+=3){ const u=l/CL, r=cocR(u)*1.03; const rm=new THREE.Mesh(new THREE.TorusGeometry(r,0.05,6,36), std({color:0xdde5ec, roughness:0.5, metalness:0.3})); rm.rotation.x=Math.PI/2; rm.position.y=u*7.6; rm.scale.set(1,0.78,1); cocoon.add(rm); }
function govTower(x){ const t=new THREE.Group(); t.position.set(x,0,-2.2); t.add(box(2.3,7.8,2.3, texMat(facadeTex('#b9c2cc')), 0,3.9,0)); const cap=new THREE.Mesh(new THREE.CylinderGeometry(1.62,1.62,1.15,4), M.grey); cap.rotation.y=Math.PI/4; cap.position.y=8.35; cap.scale.set(1,1,0.72); cap.castShadow=true; t.add(cap); t.add(box(0.45,1.1,0.45,M.dark,0,8.9,0)); return t; }
g.add(govTower(1.6)); g.add(govTower(4.5));
g.add(box(4.6,1,3, texMat(glassTex('#a9c4da')), 3,0.5,1.6));
g.add(box(2.4,6.2,2.4, texMat(facadeTex('#c3ccd4')), -6,3.1,1.8));
g.add(box(2.2,5,2.2, texMat(glassTex('#93b4cf')), 6.2,2.5,1.4));
g.add(box(8.6,1.3,2.6, texMat(facadeTex('#9aa7b4')), -0.6,0.65,4.3));
g.add(box(2.2,0.7,0.16, glowMat(signTex('新宿駅','#0ea5e9','#ffffff',false)), -0.6,1.15,5.68));
const plaza=cyl(2.1,2.1,0.12, std({color:0xd8cfb8,roughness:1}), 3,3.6, 24); plaza.position.y=0.36; g.add(plaza);
g.add(tree(0.6,3.4,0.9)); g.add(tree(5.4,3.2,0.9)); g.add(tree(-5.8,-3.6,1)); people(g,8,-2.5,1,-0.5,2.5,0.3); } },
 {id:'akiba', name:'秋叶原', x:8, z:-11, h:7, desc:'电器、动漫和游戏文化的中心，中央大街两边全是挂满彩色招牌的高楼、电玩店和扭蛋机，周日下午会变成步行街。', make:g=>{ g.add(box(11.5,0.3,12, std({color:0xcac2b4,roughness:1}), 0,0.15,0));
g.add(box(3.2,0.34,11.5,M.dark,0,0.17,0));
const cols=['#e11d48','#2563eb','#ec4899','#f59e0b','#059669','#7c3aed'];
const words=['ゲーム','アニメ','メイド','電気','ホビー','パソコン'];
for(let i=0;i<3;i++){ [-3.6,3.6].forEach(x=>{ const h=4.6+i*0.9; const b=box(2.7,h,2.5, texMat(facadeTex(i%2?'#b6bec8':'#98a5b3')), x,h/2, -3.9+i*3.9); g.add(b); const sg=box(0.18,3.4,1.15, glowMat(signTex(words[i*2+(x>0?1:0)], cols[i*2+(x>0?1:0)])), x+(x>0?-1.5:1.5), 2.9, -3.9+i*3.9); g.add(sg); }); }
let rk=0; [3.2,2.5,1.8].forEach(w=>{ g.add(box(w,1.15,w, texMat(facadeTex('#cbb9a0')), -3.6, 0.58+rk*1.15, 3.9)); rk++; });
g.add(box(2.2,0.8,0.16, glowMat(signTex('ラジオ会館','#dc2626','#ffffff',false)), -3.6,3.9,5.02));
g.add(box(11.5,0.35,1.2,M.grey,0,3.4,-4.6)); [-5,-1.5,2,5.5].forEach(x=>g.add(box(0.35,3.4,0.35,M.grey,x,1.7,-4.6)));
const tr=new THREE.Group(); [-1.7,0,1.7].forEach(ox=>tr.add(box(1.55,0.6,0.72,M.white,ox,0,0))); tr.add(box(5.2,0.18,0.74, std({color:0xfacc15,roughness:0.6}), 0,0.05,0)); tr.position.set(0,3.85,-4.6); g.add(tr);
ANIM.push(t=>{ tr.position.x=((t*1.3+6)%16)-8; });
for(let i=0;i<6;i++){ const gp=cyl(0.16,0.16,0.42, std({color:cols[i],roughness:0.4}), -1.2+i*0.48, 2.6, 8); gp.position.y=0.55; g.add(gp); }
g.add(box(2.4,5.6,2.2, texMat(facadeTex('#cfd6dd')), 5.15,2.8,-4.9));
g.add(box(2.5,0.75,0.16, glowMat(signTex('ヨドバシカメラ','#dc2626','#ffffff',false)), 5.15,5,-3.72));
g.add(box(0.16,3.2,1, glowMat(signTex('ヨドバシ','#dc2626')), 3.9,3.4,-4.9));
g.add(box(0.14,1.9,1.5, glowMat(screenTex(['AKIBA','LIVE'])), 2.18,3.7,0.1));
g.add(box(2,4.4,2, texMat(facadeTex('#39424e')), -5.15,2.2,4.7));
g.add(box(0.16,2.8,0.95, glowMat(signTex('アニメイト','#ec4899')), -4.08,2.8,4.7));
for(let i=0;i<5;i++){ g.add(box(0.34,0.62,0.3, std({color:['#d92323','#2563eb','#f59e0b','#0e9f6e','#e8e8e8'][i],roughness:0.4}), -1.95,0.62,-1.6+i*0.52)); g.add(box(0.3,0.3,0.05, std({color:0xbfe3ea,roughness:0.2}), -1.95,0.72,-1.6+i*0.52)); }
people(g,14,-1.2,1.2,-3.4,3.4,0.32); } },
 {id:'ueno', name:'上野公园', x:10, z:-17, h:5, desc:'博物馆、美术馆和动物园集中的文化区，正面是东京国立博物馆本馆，春天满园樱花。从成田坐 Skyliner 直达这里。', make:g=>{ g.add(box(12.5,0.3,9.5,M.park,0,0.15,0));
const cream=std({color:0xe8e0cc,roughness:0.9}); const grnRoof=std({color:0x4a7d6a,roughness:0.8});
g.add(box(6.6,2.3,2.7, texMat(facadeTex('#e8e0cc','#fff6d8')), 0,1.15,-2.4));
g.add(hipRoof(7.4,1,3.5,grnRoof,0,2.3,-2.4));
g.add(box(2.6,1,1.8, cream, 0,2.8,-2.4)); g.add(hipRoof(3.2,0.8,2.4,grnRoof,0,3.3,-2.4));
[-4.4,4.4].forEach(x=>{ g.add(box(2.2,1.6,2.2, cream, x,0.8,-2.4)); g.add(hipRoof(2.7,0.7,2.7,grnRoof,x,1.6,-2.4)); });
const pond=cyl(2.7,2.7,0.12,M.water,3,2.7,24); pond.scale.set(1.25,1,0.78); pond.position.y=0.33; g.add(pond);
const ben=cyl(0.72,0.82,0.85,M.red,3,2.7,8); ben.position.y=0.75; g.add(ben); g.add(hipRoof(1.9,0.7,1.9,M.roof,3,1.15,2.7));
g.add(box(1,0.8,1, std({color:0x9aa0a6,roughness:1}), -4.3,0.4,2.2));
const statue=new THREE.Group(); statue.position.set(-4.3,0.8,2.2); const bronze=std({color:0x44503f,roughness:0.6,metalness:0.4}); statue.add(cyl(0.16,0.24,0.85,bronze,0,0,8)); const sh=sph(0.17,bronze,0,1,0); statue.add(sh); statue.add(cyl(0.05,0.07,0.5,bronze,0.3,0,6)); g.add(statue);
for(let i=0;i<5;i++) g.add(tree(-5.4+i*1.5, 0.6, 0.95, pinkTree));
for(let i=0;i<4;i++) g.add(tree(-5.2+i*1.6, -4.2, 0.9, pinkTree));
g.add(tree(5.6,-4,1)); g.add(tree(-1.5,3.8,0.9));
const panda=new THREE.Group(); panda.position.set(5.4,0.3,0.6); panda.add(sph(0.3,M.white,0,0.3,0)); panda.add(sph(0.2,M.white,0.28,0.55,0)); panda.add(sph(0.09,M.dark,0.2,0.72,0.1)); panda.add(sph(0.09,M.dark,0.36,0.72,0.1)); g.add(panda);
people(g,8,-2.5,2.5,0.8,1.8,0.3); } },
 {id:'toudai', name:'东京大学', x:0, z:0, h:6, desc:'日本第一所国立大学，本乡校区的赤门、安田讲堂与银杏大道是东京最有书卷气的风景，校园可自由参观。', make:g=>{ g.add(box(11.5,0.3,10, std({color:0xd8d0bc,roughness:1}), 0,0.15,0));
g.add(box(2,0.34,9.6,M.dark,0,0.17,0));
const stone=texMat(facadeTex('#cfc4ae')); const ginkgo=std({color:0xd9a92e,roughness:0.9});
const yd=new THREE.Group(); yd.position.set(0,0.3,-3.2); g.add(yd);
yd.add(box(4.8,1.8,1.7, stone, 0,0.9,0)); yd.add(box(1.15,3.9,1.4, stone, 0,1.95,0));
yd.add(cone(0.98,1.1, M.roof, 0,0,4,4.45));
yd.add(box(0.52,0.52,0.08, texMat(clockTex()), 0,3.3,0.74));
[-2.9,2.9].forEach(x=>yd.add(box(1.6,1.25,1.5, stone, x,0.62,0)));
const aka=new THREE.Group(); aka.position.set(0,0.3,4.3); g.add(aka);
const redM=std({color:0x9e2b23,roughness:0.55});
[-1.05,1.05].forEach(x=>aka.add(box(0.27,1.95,0.27, redM, x,0.98,0)));
aka.add(box(2.6,0.24,0.42, redM, 0,1.78,0)); aka.add(hipRoof(3,0.8,1.15, texMat(kawaraTex()), 0,1.95,0));
g.add(box(1.7,0.55,0.14, glowMat(signTex('東京大学','#7f1d1d','#ffffff',false)), 0,1,5.05));
[-3.4,-1.7,1.7,3.4].forEach(z=>{ g.add(tree(-1.7,z,1,ginkgo)); g.add(tree(1.7,z,1,ginkgo)); });
g.add(box(2.7,2.3,1.9, texMat(brickTex()), -4,1.45,-3.1));
g.add(box(2.4,1.9,1.7, stone, 4.1,1.25,-2.9));
const pd=cyl(1.05,1.05,0.1, M.water, -3.9,2.5, 18); pd.position.y=0.33; g.add(pd);
g.add(sph(0.3, M.grey, -3.2,0.42,1.9)); g.add(tree(-4.8,3.4,1.1)); g.add(tree(4.6,2.8,1));
people(g,8,-1,1,-1.5,3.6,0.32); } },
 {id:'palace', name:'皇居', x:-1, z:-3, h:5, desc:'天皇居住地。认得出的是护城河石墙上的白色伏见橹和前面的二重桥，东御苑免费开放，离东京站很近。', make:g=>{ g.add(box(13.5,0.3,10.5, std({color:0x86b06c,roughness:1}), 0,0.15,0));
g.add(box(13.5,0.34,1.7,M.water,0,0.17,4.6));
g.add(box(1.7,0.34,10.5,M.water,-6,0.17,0));
const stoneM=std({color:0x9aa0a6,roughness:1});
g.add(box(11.5,1,1.1, stoneM, 0,0.5,3.4)); g.add(box(11.5,0.5,1.4, stoneM, 0,1.15,3.4));
function yagura(x,z,sc){ const t=new THREE.Group(); t.position.set(x,0,z); t.scale.setScalar(sc); t.add(box(2.4,1.05,2.4,M.white,0,0.55,0)); t.add(hipRoof(3,0.55,3,M.roof,0,1.05,0)); t.add(box(1.9,0.95,1.9,M.white,0,1.95,0)); t.add(hipRoof(2.5,0.6,2.5,M.roof,0,2.4,0)); return t; }
g.add(yagura(2.9,-0.6,1)); g.add(yagura(-3.6,-1,0.78));
g.add(box(4.6,0.3,2.6, std({color:0xd8cfb8,roughness:1}), 0,0.32,1.6));
const bridge=new THREE.Group(); bridge.position.set(0,0,4.6); bridge.add(box(3.6,0.28,2, stoneM, 0,1.05,0)); [-1.5,1.5].forEach(x=>bridge.add(box(0.5,1,0.6, stoneM, x,0.5,0))); [-1.7,1.7].forEach(x=>bridge.add(cyl(0.07,0.07,0.8,M.dark,x,0,6)).children); g.add(bridge);
[-1.7,1.7].forEach(x=>{ const lp=cyl(0.07,0.07,0.85,M.dark,x,4.6,6); lp.position.y=1.6; g.add(lp); const gl=sph(0.13, std({color:0xfff2c0,roughness:0.4}), x,2.1,4.6); g.add(gl); });
const pine=std({color:0x2f5d33,roughness:1});
[[-5,-3.4],[-1.8,-3.8],[1.2,-4],[4.8,-3.6],[-5.2,0.8],[5.4,1.2]].forEach(q=>{ const t=tree(q[0],q[1],1.05,pine); t.children[1].scale.set(1.35,0.62,1.35); g.add(t); });
g.add(tree(-2.6,1.8,0.9,pine)); g.add(tree(3.8,2,0.9,pine)); people(g,5,-1.5,1.5,1,2.4,0.34); } },
 {id:'tokyost', name:'东京站', x:4, z:0, h:6, desc:'红砖站舍是百年历史建筑：长长的红砖墙、白色腰线和中间的圆形穹顶是它的标志，也是新干线和成田特快 NEX 的核心枢纽。', make:g=>{ g.add(box(13,0.3,10.5, std({color:0xcac2b4,roughness:1}), 0,0.15,0));
const bt=stationTex(); g.add(box(12.5,2.9,3.1, texMat(bt), 0,1.45,-1.6));
const cream=std({color:0xf3e9dc,roughness:0.9});
g.add(box(12.7,0.16,3.3, cream, 0,1.02,-1.6)); g.add(box(12.7,0.16,3.3, cream, 0,2.52,-1.6));
const slate=std({color:0x51606e,roughness:0.8});
g.add(hipRoof(13.1,1.05,3.8,slate,0,2.9,-1.6));
[-5.6,5.6].forEach(x=>{ g.add(box(2.3,3.25,3.5, texMat(bt), x,1.62,-1.6)); g.add(hipRoof(2.7,0.8,3.9,slate,x,3.25,-1.6)); });
const domeM=std({color:0x7d9b8a,roughness:0.5,metalness:0.25});
function dome(x,r){ const drum=cyl(r*0.92,r*0.92,0.5,texMat(bt),x,-1.6,18); drum.position.y=3.8; g.add(drum); const d=sph(r, domeM, x, 4.05, -1.6, 1,0.85,1); g.add(d); const lant=cyl(r*0.16,r*0.2,0.42,domeM,x,-1.6,10); lant.position.y=4.05+r*0.85+0.1; g.add(lant); g.add(cone(0.07,0.5,M.gold,x,-1.6,6,4.55+r*0.85)); }
dome(0,1.3); dome(-4.4,0.85); dome(4.4,0.85);
g.add(box(11,0.26,3.6, std({color:0xd8cfb8,roughness:1}), 0,0.13,1.9));
g.add(box(9,0.28,1.1,M.dark,0,0.14,4.3));
for(let i=0;i<6;i++) g.add(box(0.9,0.3,0.14,M.white,-3.6+i*1.45,0.15,4.3));
[-5.2,-3.4,3.4,5.2].forEach(x=>g.add(tree(x,2,0.85)));
g.add(box(2.6,7.6,2.6, texMat(glassTex('#a9c8e2')), -4.6,3.8,-5));
g.add(box(2.4,6.2,2.4, texMat(facadeTex('#d5dbe1')), -1.2,3.1,-5.2));
g.add(box(2.8,8.4,2.8, texMat(glassTex('#8fb4d4')), 2.2,4.2,-5));
g.add(box(2.2,5.4,2.2, texMat(facadeTex('#e3e7ec')), 5.2,2.7,-5.1));
g.add(box(3.2,0.9,0.18, glowMat(signTex('東京駅','#991b1b','#ffffff',false)), 0,1.7,0.05));
people(g,10,-4,4,1.2,2.8,0.3); } },
 {id:'meiji', name:'明治神宫', x:-14, z:3, h:6, desc:'藏在市中心森林里的神社，入口的大鸟居是它的标志。紧邻原宿却安静庄严，常能碰到日式婚礼队伍。', make:g=>{ g.add(box(12.5,0.3,10.5, std({color:0x5d8a54,roughness:1}), 0,0.15,0));
g.add(box(2.8,0.34,8.5, std({color:0xd8cfb8,roughness:1}), 0,0.17,0.6));
const wood=std({color:0x8a5a2b,roughness:0.9});
const torii=new THREE.Group(); torii.name='meijiTorii'; torii.position.set(0,0,3.9); g.add(torii);
[-1.7,1.7].forEach(x=>{ const pl=cyl(0.3,0.38,3.9,wood,x,0,12); torii.add(pl); });
torii.add(box(5.2,0.44,0.55,wood,0,4,0)); torii.add(box(4.3,0.3,0.45,wood,0,3.15,0)); torii.add(box(0.32,0.95,0.32,wood,0,3.55,0));
const hall=new THREE.Group(); hall.position.set(0,0,-3.1); g.add(hall);
hall.add(box(5,0.5,3.4, std({color:0xcfc4a5,roughness:1}), 0,0.25,0));
hall.add(box(4.6,1.6,2.6, M.white, 0,1.3,0));
hall.add(hipRoof(5.9,1.25,3.9, std({color:0x4a3b2c,roughness:0.95}), 0,2.1,0));
hall.add(box(0.9,0.28,0.28,M.gold,0,3.55,0));
[-3.4,3.4].forEach(x=>{ const bb=new THREE.Group(); bb.position.set(x,0.3,-0.4); [0.55,1.62].forEach(y=>{ const b=cyl(0.42,0.42,1.05, texMat(barrelTex()), 0,0,14); b.position.y=y; bb.add(b); }); g.add(bb); });
for(let i=0;i<7;i++) g.add(tree(-5.6+i*0.4, -4.4+((i*37)%3)*0.5, 1.25, darkGreen));
[[-5.4,-1.5],[-5.6,1.8],[5.5,-1.8],[5.7,1.6],[-4.6,4.4],[4.7,4.5]].forEach(q=>g.add(tree(q[0],q[1],1.3,darkGreen)));
[[-2.8,-4.6],[3,-4.7],[0,-5]].forEach(q=>{ const c=sph(1.5, darkGreen, q[0],1.6,q[1], 1.3,0.8,1.1); g.add(c); });
people(g,6,-0.9,0.9,-1,2.6,0.32); } },
 {id:'odaiba', name:'台场', x:13, z:22, h:7, desc:'东京湾人工岛：富士电视台大楼中间的大圆球、1:1 高达立像，还有横跨东京湾的彩虹大桥，夜景尤其漂亮。', make:g=>{ g.add(box(13.5,0.3,10.5, std({color:0xb9c2c9,roughness:1}), 0,0.15,0));
g.add(box(13.5,0.34,1.9,M.water,0,0.17,4.9));
const fuji=new THREE.Group(); fuji.position.set(-3.8,0,-2.2); g.add(fuji);
[-1.35,1.35].forEach(x=>fuji.add(box(1.05,5.2,1.05, texMat(glassTex('#b9d2e4')), x,2.6,0)));
[1.2,2.9,4.6].forEach(y=>fuji.add(box(3.8,0.55,1.1, M.grey, 0,y,0)));
fuji.add(sph(1.5, std({color:0xd7dee6,roughness:0.25,metalness:0.65}), 0,3.3,0));
fuji.add(box(2.6,0.7,1.4, M.grey, 0,5.5,0));
const deckY=2.1, pz=4.9;
g.add(box(13.5,0.32,1.15,M.white,0,deckY,pz));
[-3.2,3.2].forEach(x=>{ g.add(box(0.55,3.6,0.55,M.white,x,1.8,pz)); g.add(box(0.9,0.5,0.9,M.white,x,3.75,pz)); });
[-0.55,0.55].forEach(dz=>{ cable(g,-3.2,3.9,pz+dz, -6.7,deckY+0.2,pz+dz, 0.55, M.white); cable(g,-3.2,3.9,pz+dz, 3.2,3.9,pz+dz, 1.5, M.white); cable(g,3.2,3.9,pz+dz, 6.7,deckY+0.2,pz+dz, 0.55, M.white); });
const gun=new THREE.Group(); gun.position.set(3.3,0.3,-0.7); g.add(gun);
gun.add(box(2.2,0.35,1.6, std({color:0x8a939e,roughness:1}), 0,0.17,0));
[-0.42,0.42].forEach(x=>{ gun.add(box(0.5,1.5,0.6,M.white,x,1.1,0)); gun.add(box(0.56,0.35,0.66,M.dark,x,0.55,0)); });
gun.add(box(1.25,1.35,0.7,M.white,0,2.5,0)); gun.add(box(1.3,0.4,0.74, M.blue, 0,2.9,0)); gun.add(box(0.5,0.55,0.5,M.red,-0.28,1.95,0));
[-1,1].forEach(sx=>{ gun.add(box(0.34,1.25,0.4,M.white,sx*0.85,2.45,0)); gun.add(box(0.3,0.5,0.34,M.grey,sx*0.9,1.7,0)); });
const ghead=new THREE.Group(); ghead.position.set(0,3.45,0); ghead.add(box(0.52,0.5,0.55,M.white,0,0,0)); const horn=cone(0.05,0.75,M.gold,0,0,6); horn.rotation.z=-0.5; horn.position.set(0.1,0.42,0); ghead.add(horn); ghead.add(box(0.56,0.14,0.3,M.red,0,0.12,0)); gun.add(ghead);
const wheel=new THREE.Group(); wheel.position.set(5.9,2.7,-3.1); g.add(wheel);
wheel.add(tor(1.95,0.09,M.white,0,0,0));
for(let i=0;i<6;i++){ const sp=box(3.8,0.07,0.07,M.white,0,0,0); sp.rotation.z=i*Math.PI/6; wheel.add(sp); }
for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; wheel.add(sph(0.17, std({color:[0xef4444,0x3b82f6,0xf59e0b,0x10b981][i%4],roughness:0.5}), Math.cos(a)*1.95, Math.sin(a)*1.95, 0)); }
g.add(beam(5.2,0.3,-3.1, 5.9,2.6,-3.1, M.grey, 0.09)); g.add(beam(6.6,0.3,-3.1, 5.9,2.6,-3.1, M.grey, 0.09));
ANIM.push((t,dt)=>{ wheel.rotation.z-=dt*0.35; });
[[-5.9,2.9],[-4.7,2.9],[-5.9,4.1],[-4.7,4.1]].forEach(q=>{ const py=cone(1.05,1.7, texMat(glassTex('#c3d9ea')), q[0],q[1],4); py.rotation.x=Math.PI; py.position.y=1.9; g.add(py); g.add(box(0.5,0.9,0.5,M.grey,q[0],0.75,q[1])); });
g.add(box(3.4,1.8,2.2, texMat(facadeTex('#d8cfc0')), 3.3,0.9,1.9));
g.add(tree(-6,-4.2,0.85)); g.add(tree(0.5,-4.4,0.85)); g.add(tree(6.4,1.2,0.85)); people(g,7,-1.5,1.8,2.6,3.6,0.3); } },
 {id:'roppongi', name:'六本木', x:-8, z:6, h:9, desc:'美术馆、展望台和夜生活集中的区域。微微收分的森大厦是六本木之丘的主楼，顶层展望台可以远眺东京塔。', make:g=>{ g.add(box(12.5,0.3,10.5, std({color:0xbcc3cb,roughness:1}), 0,0.15,0));
const mori=new THREE.Group(); mori.position.set(-1.6,0,-1.6); g.add(mori);
const moriTex=glassTex('#7ea6c8'); moriTex.repeat.set(2,3);
[[2.55,0,3.0],[2.32,3.0,3.0],[2.08,6.0,2.6]].forEach(t=>{ const sg=new THREE.Mesh(new THREE.CylinderGeometry(t[0]*0.92,t[0],t[2],4), texMat(moriTex)); sg.rotation.y=Math.PI/4; sg.position.y=t[1]+t[2]/2; sg.castShadow=true; mori.add(sg); });
const deckBand=box(3.05,0.55,3.05, texMat(glassTex('#cfe2f2')), 0,8.85,0); mori.add(deckBand);
const heli=cyl(1.15,1.15,0.28,M.dark,0,0,20); heli.position.y=9.3; mori.add(heli);
window.NIGHT_FNS=window.NIGHT_FNS||[]; NIGHT_FNS.push(n=>{ deckBand.material.emissive.setHex(n?0x335577:0x000000); });
const mbc=sph(0.1, new THREE.MeshBasicMaterial({color:0xff3333}), -1.6,9.68,-1.6); g.add(mbc); ANIM.push(t=>{ mbc.material.color.setHex(Math.sin(t*2.4+0.8)>0?0xff3333:0x551111); });
g.add(box(5.5,1.1,3.6, texMat(facadeTex('#c9d1d9')), -1.4,0.55,2.2));
g.add(box(4.2,2.1,2.6, texMat(glassTex('#a9c6de')), 3.9,1.05,-2.4));
const slope=box(6.5,0.24,1.7, std({color:0x9aa0a6,roughness:1}), 2.2,0.75,3.9); slope.rotation.z=0.16; g.add(slope);
for(let i=0;i<4;i++) g.add(tree(0.2+i*1.4, 3.3, 0.8));
const spider=new THREE.Group(); spider.position.set(3.4,0.3,1.6); const sm=std({color:0x3a3f45,roughness:0.5,metalness:0.5}); spider.add(sph(0.52,sm,0,1.55,0,1,0.9,1.15)); spider.add(sph(0.3, std({color:0xd8cfb8,roughness:0.7}), 0,1.05,0.1)); for(let i=0;i<6;i++){ const a=(i/6)*Math.PI*2+0.4; spider.add(beam(0,1.4,0, Math.cos(a)*0.5,1.75,Math.sin(a)*0.5, sm, 0.045)); spider.add(beam(Math.cos(a)*0.5,1.75,Math.sin(a)*0.5, Math.cos(a)*1.05,0.05,Math.sin(a)*1.05, sm, 0.04)); } g.add(spider);
g.add(box(2.6,3.4,2.2, texMat(facadeTex('#b7bfc9')), -5.4,1.7,1.6));
g.add(box(1.8,0.75,0.16, glowMat(signTex('六本木ヒルズ','#111827','#fbbf24',false)), -1.4,1.5,4.1));
people(g,7,-3,2.5,3.4,4.6,0.3); } },
 {id:'ikebukuro', name:'池袋', x:-14, z:-16, h:8, desc:'性价比高的住宿和购物区，东口的阳光城（Sunshine City）高塔是地标，里面有水族馆和展望台。', make:g=>{ g.add(box(12.5,0.3,10, std({color:0xcac2b4,roughness:1}), 0,0.15,0));
const sgTex=glassTex('#a8c8e0'); sgTex.repeat.set(2,6);
g.add(box(2.7,8.8,2.7, texMat(sgTex), -2.2,4.4,-1.2));
g.add(box(2.85,0.5,2.85, M.dark, -2.2,8.55,-1.2));
g.add(box(2.2,1,2.2, texMat(facadeTex('#d5dbe1')), -2.2,9.3,-1.2));
const ibc=sph(0.1, new THREE.MeshBasicMaterial({color:0xff3333}), -2.2,10,-1.2); g.add(ibc); ANIM.push(t=>{ ibc.material.color.setHex(Math.sin(t*2.4+1.7)>0?0xff3333:0x551111); });
g.add(box(4.6,1.7,3.4, texMat(facadeTex('#e0d8c8')), -2,0.85,2.4));
g.add(box(3.4,0.85,0.16, glowMat(signTex('サンシャイン水族館','#0284c7','#ffffff',false)), -2,1.35,4.18));
g.add(box(5.6,2.3,3, texMat(facadeTex('#b9c2cc')), 3.6,1.15,-2.2));
g.add(box(2.6,0.8,0.16, glowMat(signTex('池袋駅','#16a34a','#ffffff',false)), 3.6,1.9,-0.62));
g.add(box(2.4,3.8,2.2, texMat(facadeTex('#c3ccd4')), 4.6,1.9,2.2));
for(let i=0;i<3;i++) g.add(box(0.16,1.9,0.9, glowMat(signTex(['乙女ロード','アニメ','コスメ'][i], ['#ec4899','#7c3aed','#f59e0b'][i])), 2.6,1.5,1.2+i*1.15));
const bus=new THREE.Group(); bus.add(box(1.7,0.62,0.7,M.red,0,0.1,0)); bus.add(box(1.5,0.3,0.72, M.white, 0,0.5,0)); bus.position.set(0,0.35,4.3); g.add(bus);
ANIM.push(t=>{ const u=Math.sin(t*0.22)*4.4; bus.position.x=u; bus.rotation.y=Math.cos(t*0.22)>0?0:Math.PI; });
g.add(box(2.2,5.4,2.2, texMat(facadeTex('#2f3b4c')), 5.85,2.7,-3.85));
g.add(box(2,0.8,0.16, glowMat(signTex('animate','#111827','#f9a8d4',false)), 5.85,4.9,-2.7));
g.add(box(0.16,3,0.9, glowMat(signTex('アニメ','#ec4899')), 4.68,3,-3.85));
g.add(box(2.6,4.6,2.2, texMat(facadeTex('#d8cfc0')), -4.9,2.3,-3.9));
g.add(box(2.2,0.8,0.16, glowMat(signTex('西武','#0e7490','#ffffff',false)), -4.9,4.1,-2.72));
g.add(box(3,3.8,2.2, texMat(facadeTex('#c9d4de')), -0.6,1.9,-4.5));
g.add(box(2.4,0.8,0.16, glowMat(signTex('東武','#b91c1c','#ffffff',false)), -0.6,3.3,-3.32));
g.add(sph(0.16, std({color:0x8b8f94,roughness:0.9}), 2.9,0.62,-0.5, 1,1.15,1)); g.add(sph(0.11, std({color:0x8b8f94,roughness:0.9}), 2.9,0.85,-0.5));
people(g,10,-4.5,4.5,3.2,4.2,0.3); } },
 {id:'waseda', name:'早稻田大学', x:0, z:0, h:6, desc:'大隈重信创办的私立名校，大隈讲堂的钟塔、演剧博物馆与村上春树图书馆都在早稻田校区，校门外是热闹的学生街。', make:g=>{ g.add(box(11.5,0.3,10, std({color:0xd8d0bc,roughness:1}), 0,0.15,0));
g.add(box(4.6,0.34,3.8, M.park, -3.1,0.17,-0.4));
const creamF=texMat(facadeTex('#e6dcc4')); const roofB=std({color:0x7a4a3a,roughness:0.8});
const ok=new THREE.Group(); ok.position.set(1,0.3,-2.4); g.add(ok);
ok.add(box(4.4,2,1.9, creamF, 0,1,0)); ok.add(hipRoof(4.8,1.05,2.3, roofB, 0,2,0));
ok.add(box(1.2,4.9,1.2, creamF, 0,2.45,0.55));
ok.add(cone(0.95,1.8, roofB, 0,0.55,4,5.75));
ok.add(box(0.55,0.55,0.08, texMat(clockTex()), 0,4.1,1.2));
g.add(box(2.2,0.6,0.14, glowMat(signTex('早稲田大学','#7f1d1d','#ffffff',false)), 1,1.35,-1.38));
g.add(box(0.55,0.75,0.55, M.grey, 1,0.68,0.75));
const fig=cyl(0.1,0.15,0.6, std({color:0x6b5836,roughness:0.4,metalness:0.6}), 1,0.75,6); fig.position.y=1.35; g.add(fig); g.add(sph(0.1, std({color:0x6b5836,roughness:0.4,metalness:0.6}), 1,1.72,0.75));
const th=new THREE.Group(); th.position.set(4.4,0.3,2); g.add(th);
th.add(box(1.9,1.5,1.4, M.white, 0,0.75,0)); th.add(hipRoof(2.2,1.05,1.7, M.dark, 0,1.5,0));
[-0.5,0,0.5].forEach(x=>th.add(box(0.09,1.5,0.06, M.dark, x,0.75,0.72)));
const mk=new THREE.Group(); mk.position.set(-3.9,0.3,-3.4); g.add(mk);
mk.add(box(2.4,0.8,1.6, M.white, 0,0.4,0)); mk.add(box(2,0.8,1.4, M.white, 0.25,1.2,0)); mk.add(box(1.6,0.8,1.2, texMat(glassTex('#bcd6ea')), 0.5,2,0));
g.add(tree(-4.6,0.6,1.1)); g.add(tree(-1.8,-1.6,0.95)); g.add(tree(-3.4,1.2,0.85,pinkTree));
g.add(box(11,0.08,0.85, M.dark, 0,0.34,4.5));
const tram=new THREE.Group(); tram.add(box(1.55,0.62,0.62, std({color:0xf3e5cf,roughness:0.5}), 0,0.32,0)); tram.add(box(1.57,0.2,0.64, M.red, 0,0.2,0)); tram.add(box(1.3,0.14,0.5, M.grey, 0,0.7,0)); tram.position.set(0,0.36,4.5); g.add(tram);
ANIM.push(t=>{ tram.position.x=Math.sin(t*0.16)*4.4; tram.rotation.y=Math.cos(t*0.16)>0?0:Math.PI; });
people(g,8,-1.5,3.5,-0.8,1.6,0.32); } },
 {id:'shinagawa', name:'品川', x:-9, z:19, h:6, desc:'京急线从羽田进城的第一大站，站前是成排的玻璃高楼酒店，换乘山手线和新干线都很方便。', make:g=>{ g.add(box(12.5,0.3,10, std({color:0xcac2b4,roughness:1}), 0,0.15,0));
g.add(box(7.6,2.7,3.2, texMat(glassTex('#bcd6ea')), 0,1.35,-1.2));
const sroof=box(7.8,0.22,3.8, texMat(glassTex('#8fb8d8')), 0,3.1,-1.2); sroof.rotation.x=-0.16; g.add(sroof);
g.add(box(3,0.85,0.16, glowMat(signTex('品川駅','#0f766e','#ffffff',false)), 0,1.8,0.5));
[[-4.4,5.6],[0,6.8],[4.4,5]].forEach((q,i)=>{ g.add(box(2.3,q[1],2.3, texMat(facadeTex(i===1?'#d5dbe1':'#bcc7d1')), q[0], q[1]/2, -4)); });
g.add(box(1.9,0.6,0.14, glowMat(signTex('PRINCE','#991b1b','#ffffff',false)), 0,6.2,-2.82));
g.add(box(11,0.35,1.1,M.grey,0,1.5,3.3)); [-5,-1.8,1.8,5].forEach(x=>g.add(box(0.35,1.5,0.35,M.grey,x,0.75,3.3)));
const tr=new THREE.Group(); [-2.6,-0.85,0.9,2.65].forEach(ox=>tr.add(box(1.65,0.62,0.75,M.white,ox,0,0))); tr.add(box(7.2,0.2,0.77, std({color:0x2563eb,roughness:0.5}), 0,0.02,0)); tr.position.set(0,2.15,3.3); g.add(tr);
ANIM.push(t=>{ tr.position.x=((t*1.6+3)%18)-9; });
g.add(box(12.5,0.32,1.5,M.water,0,0.16,4.9));
const boat=new THREE.Group(); boat.position.set(-3.4,0.35,4.9); boat.add(box(1.7,0.35,0.6,M.white,0,0.1,0)); boat.add(box(0.8,0.4,0.45,M.blue,-0.2,0.45,0)); g.add(boat);
ANIM.push(t=>{ boat.position.x=-3.4+Math.sin(t*0.3)*0.8; boat.rotation.y=Math.sin(t*0.23)*0.12; });
const canopy2=new THREE.Mesh(new THREE.CylinderGeometry(2.15,2.15,7.8,16,1,true,0,Math.PI), std({color:0xbfe3ea,roughness:0.15,metalness:0.1,transparent:true,opacity:0.35,side:THREE.DoubleSide})); canopy2.rotation.z=Math.PI/2; canopy2.position.set(0,2.85,-1.2); g.add(canopy2);
const aqua=cyl(1.45,1.45,2.4, texMat(glassTex('#7fb6d9')), -4.75,1.05, 18); g.add(aqua);
g.add(box(1.9,0.7,0.16, glowMat(signTex('アクアパーク','#0369a1','#ffffff',false)), -4.75,1.7,2.42));
g.add(box(2.7,0.55,1.7, M.park, -4.55,0.3,3.6)); g.add(tree(-5.2,3.5,0.8)); g.add(tree(-3.9,3.8,0.75)); g.add(tree(-4.6,2.9,0.7,pinkTree));
people(g,8,-3,3,1,2.2,0.3); } },
 {id:'ginza', name:'银座', x:6, z:5, h:7, desc:'东京最高档的购物区。四丁目路口的和光百货钟楼是银座的象征，周末中央大街会变成步行街。', make:g=>{ g.add(box(13,0.3,10.5, std({color:0xd5cec0,roughness:1}), 0,0.15,0));
g.add(box(12.5,0.34,2.8,M.dark,0,0.17,3.4));
const wako=new THREE.Group(); wako.position.set(-3.4,0,-1.4); g.add(wako);
wako.add(box(2.3,4.2,2.3, texMat(facadeTex('#d9d2c4','#fff3cf')), 0,2.1,0));
wako.add(box(1.15,1.7,1.15, texMat(facadeTex('#d9d2c4','#fff3cf')), 0,5,0));
const clockM=texMat(clockTex());
wako.add(box(0.98,0.98,0.12, M.gold, 0,5.05,0.58));
wako.add(box(0.88,0.88,0.1, clockM, 0,5.05,0.62));
const clockSide=box(0.1,0.88,0.88, clockM, 0.62,5.05,0); wako.add(clockSide);
window.NIGHT_FNS=window.NIGHT_FNS||[]; NIGHT_FNS.push(n=>{ clockM.emissive.setHex(n?0x776622:0x000000); });
const wroof=cone(0.95,0.9,M.roof,0,0,4); wroof.position.y=6.25; wroof.rotation.y=Math.PI/4; wako.add(wroof);
wako.add(cone(0.06,0.7,M.gold,0,0,6)).children; const wsp=cyl(0.05,0.05,0.7,M.gold,0,0,6); wsp.position.y=7; wako.add(wsp);
const kab=new THREE.Group(); kab.position.set(3.4,0,-1); g.add(kab);
kab.add(box(4.6,2.1,3, M.white, 0,1.05,0)); kab.add(hipRoof(5.3,1.05,3.7, texMat(kawaraTex()), 0,2.1,0));
kab.add(box(1.3,1,1.3, M.white, 0,3.4,0)); kab.add(hipRoof(1.7,0.6,1.7, texMat(kawaraTex()), 0,3.9,0));
for(let i=0;i<5;i++){ const lt=sph(0.14, std({color:0xd92323,roughness:0.5, emissive:0x7f1d1d, emissiveIntensity:0.7}), -1.6+i*0.8, 1.9, 1.65); kab.add(lt); }
kab.add(box(0.18,2.2,0.95, glowMat(signTex('歌舞伎座','#7f1d1d')), 2.42,1.6,0.8));
g.add(box(2.6,5.6,2.6, texMat(glassTex('#e8c39a')), 0.4,2.8,-4));
g.add(box(2.2,6.6,2.2, texMat(glassTex('#d7e6f2')), 5.7,3.3,-3.8));
g.add(box(0.16,3.2,0.9, glowMat(signTex('銀座','#1e3a5f')), 4.55,3.6,-3.8));
g.add(box(2.3,0.5,2.3, M.red, 5.7,6.85,-3.8));
g.add(box(2.2,0.8,0.16, glowMat(signTex('GINZA SIX','#111827','#fbbf24',false)), 0.4,4.6,-2.62));
g.add(box(2.4,3.4,2.2, texMat(facadeTex('#e5e0d2')), -5.6,1.7,-3.4));
for(let i=0;i<4;i++){ const lp=cyl(0.05,0.07,1.5,M.dark,-4.8+i*3.1,3.4,6); lp.position.y=1.05; g.add(lp); g.add(sph(0.12, std({color:0xfff2c0,roughness:0.4}), -4.8+i*3.1, 1.95, 3.4)); }
people(g,16,-5.5,5.5,2.6,4.2,0.32); } },
 {id:'harajuku', name:'原宿', x:-12, z:7, h:5, desc:'竹下通满是年轻潮流小店和可丽饼摊，入口的彩色拱门一到周末就挤满人，和旁边的明治神宫一动一静。', make:g=>{ g.add(box(12,0.3,11, std({color:0xd9c9b8,roughness:1}), 0,0.15,0.5));
g.add(box(2.3,0.34,9.5, std({color:0xe8dcc8,roughness:1}), 0,0.17,0.8));
[-2.3,2.3].forEach(x=>{ const pl=cyl(0.14,0.18,3.1,M.pink,x,4.9,8); g.add(pl); });
g.add(box(5.6,1.05,0.35, glowMat(archTex()), 0,3.35,4.9));
const shopCols=[0xf9a8d4,0xfde047,0x93c5fd,0xa7f3d0,0xfca5a5,0xc4b5fd];
for(let i=0;i<5;i++){ [-1.95,1.95].forEach(x=>{ const h=1.6+((i*53)%10)/9; g.add(box(1.5,h,1.6, std({color:shopCols[(i+(x>0?2:0))%6], roughness:0.8}), x, h/2, 3.4-i*1.85)); g.add(box(0.14,0.95,1.1, glowMat(signTex(['クレープ','古着','雑貨','カフェ','写真'][i], ['#ec4899','#2563eb','#059669','#f59e0b','#7c3aed'][(i+(x>0?1:0))%5])), x+(x>0?-0.85:0.85), 1.35, 3.4-i*1.85)); }); }
const laf=new THREE.Group(); laf.position.set(-4.3,0,-3.2); [0,1,2].forEach(i=>{ laf.add(box(3-i*0.55,1.05,2.6-i*0.4, texMat(glassTex('#c3d9ea')), -i*0.28, 0.53+i*1.05, 0)); }); laf.add(box(2.2,0.7,0.14, glowMat(signTex('ラフォーレ','#111827','#ffffff',false)), 0,1.1,1.42)); g.add(laf);
g.add(box(6.4,1.5,2.4, texMat(glassTex('#b7cfdf')), 2.6,0.75,-4.4));
const slopeR=box(6.4,0.18,2.7, M.grey, 2.6,1.6,-4.4); slopeR.rotation.z=0.06; g.add(slopeR);
for(let i=0;i<5;i++) g.add(tree(-4.6+i*2.3, -2.6, 0.95));
const crepe=new THREE.Group(); crepe.position.set(1.1,0.3,1.4); const cc=cone(0.16,0.5, std({color:0xe8c39a,roughness:0.8}), 0,0,8); cc.rotation.x=Math.PI; cc.position.y=0.45; crepe.add(cc); crepe.add(sph(0.17,M.pink,0,0.78,0)); g.add(crepe);
people(g,20,-0.9,0.9,-2.6,4.2,0.32); } },
 {id:'toyosu', name:'丰洲市场', x:18, z:13, h:5, desc:'东京的厨房：白色大楼顶上有整片屋顶草坪是它的特点。清晨可以看金枪鱼拍卖、吃寿司早餐，注意休市日。', make:g=>{ g.add(box(13.5,0.3,10.5, std({color:0xb9c2c9,roughness:1}), 0,0.15,0));
g.add(box(13.5,0.34,1.6,M.water,0,0.17,5));
const roofM=std({color:0x7fa08a,roughness:0.7});
function marketHall(x,z,w,d,h){ const t=new THREE.Group(); t.position.set(x,0,z); t.add(box(w,h,d, texMat(facadeTex('#dde3e8','#eaf6ff')), 0,h/2,0)); const rf=cyl(d*0.52,d*0.52,w, roofM, 0,0, 18); rf.rotation.z=Math.PI/2; rf.position.set(0,h+d*0.18,0); t.add(rf); return t; }
g.add(marketHall(-2.2,-2.4,7.4,4.4,2.1));
g.add(marketHall(-2,2.4,6.6,3.8,1.8));
const veg=marketHall(4.6,-0.2,3.4,5.4,2.3); g.add(veg);
g.add(box(7.6,0.4,3.4,M.park,-2.2,3.62,-2.4));
g.add(box(2.6,0.85,0.16, glowMat(signTex('豊洲市場','#0369a1','#ffffff',false)), -2.2,1.35,0.05));
for(let i=0;i<4;i++){ const tk=new THREE.Group(); tk.position.set(2.2+i*0.1, 0.3, -4.3+ (i%2)*0.9); tk.add(box(1.15,0.55,0.55,M.white,-0.1,0.28,0)); tk.add(box(0.45,0.45,0.52, M.blue, 0.62,0.24,0)); g.add(tk); }
g.add(box(12.5,0.32,1,M.grey,0,2.3,4)); [-5.5,-2,2,5.5].forEach(x=>g.add(box(0.32,2.3,0.32,M.grey,x,1.15,4)));
const tr=new THREE.Group(); [-0.85,0.85].forEach(ox=>tr.add(box(1.6,0.55,0.68, texMat(glassTex('#cfe2f0')), ox,0,0))); tr.position.set(0,2.75,4); g.add(tr);
ANIM.push(t=>{ tr.position.x=((t*0.9+4)%16)-8; });
const senk=new THREE.Group(); senk.position.set(-4.7,0.3,-4.55); g.add(senk);
[[-1.3,'千客万来'],[0,'寿司'],[1.3,'足湯']].forEach((q,i)=>{ senk.add(box(1.15,0.95,0.95, std({color:0xf3e5cf,roughness:0.9}), q[0],0.48,0)); senk.add(hipRoof(1.35,0.5,1.15, texMat(kawaraTex()), q[0],0.95,0)); senk.add(box(0.9,0.4,0.1, glowMat(signTex(q[1],'#7f1d1d','#ffd9a0',false)), q[0],0.62,0.5)); });
const tlab=box(2,1.7,1.8, std({color:0x14181d,roughness:0.6}), -6.2,0.85,1.6); g.add(tlab);
g.add(box(1.7,0.55,0.12, glowMat(signTex('teamLab','#111827','#ffffff',false)), -6.2,1.15,2.55));
g.add(box(2.8,2,2.6, texMat(facadeTex('#e3e7ec')), 5.2,1,2.9));
g.add(box(2.4,0.7,0.14, glowMat(signTex('ららぽーと','#dc2626','#ffffff',false)), 5.2,1.75,4.25));
g.add(tree(-6,-4.4,0.85)); g.add(tree(6.2,3.4,0.85)); people(g,6,-4,0.5,-0.2,0.8,0.3); } },
 {id:'disney', name:'东京迪士尼乐园', x:35, z:19, h:11, desc:'位于千叶浦安的迪士尼度假区。入口的灰姑娘城堡是粉色墙身配蓝色尖顶，从东京站坐京叶线到舞滨约 15 分钟。', make:g=>{ const rock=new THREE.MeshStandardMaterial({color:0x8a5a3b,roughness:1}); const cream=new THREE.MeshStandardMaterial({color:0xf3e5cf,roughness:0.9}); const teal=new THREE.MeshStandardMaterial({color:0x2e8f86,roughness:0.5,metalness:0.2}); const brick=new THREE.MeshStandardMaterial({color:0x9c6644,roughness:0.95});
const stoneM=std({color:0xb9c0c7,roughness:0.95}); const tanM=std({color:0xe4d3ae,roughness:1});
g.add(box(17,0.35,12,M.park,0,0.18,0));
// ===== Cinderella Castle (upgraded) =====
const cbase=cyl(3.1,3.4,0.5,stoneM,-2.6,-0.6,20); cbase.position.y=0.42; g.add(cbase);
g.add(box(4.6,2.2,2.8,M.pink,-2.6,1.55,-0.6)); g.add(box(2,4.2,2,M.white,-2.6,2.55,-0.6)); g.add(cone(1.7,3.2,M.blue,-2.6,-0.6,12,6.25)); const tip=new THREE.Mesh(new THREE.SphereGeometry(0.28,10,10),M.gold); tip.position.set(-2.6,8.05,-0.6); g.add(tip);
[-4.5,-0.7].forEach(x=>{ g.add(cyl(0.6,0.75,3.4,M.white,x,-0.6)); g.add(cone(0.85,2.1,M.blue,x,-0.6,12,4.45)); const tt=new THREE.Mesh(new THREE.SphereGeometry(0.13,8,8),M.gold); tt.position.set(x,6.65,-0.6); g.add(tt); });
[-4.05,-1.15].forEach(x=>{ g.add(cyl(0.34,0.42,2.1,stoneM,x,0.35)); g.add(cone(0.5,1.3,M.blue,x,0.35,10,3.05)); });
g.add(box(1.1,1.5,0.3,M.dark,-2.6,1.2,0.85));
const clockD=cyl(0.42,0.42,0.1, texMat(clockTex()), -2.6,0.85, 20); clockD.rotation.x=Math.PI/2; clockD.position.set(-2.6,3.6,0.45); g.add(clockD);
[-3.6,-1.6].forEach(x=>{ g.add(box(0.34,1.15,0.06,M.pink,x,2.2,0.83)); g.add(box(0.05,1.5,0.05,M.gold,x,2.4,0.83)); });
// hub plaza + partners statue + flower ring
const hub=cyl(1.9,1.9,0.1,tanM,-2.6,1.9,24); hub.position.y=0.4; g.add(hub);
for(let k=0;k<10;k++){ const a=k/10*Math.PI*2; const fb=sph(0.16, k%2?M.pink:std({color:0xe23b3b,roughness:0.8}), -2.6+Math.cos(a)*1.55, 0.52, 1.9+Math.sin(a)*1.55, 1,0.7,1); g.add(fb); }
g.add(box(0.4,0.5,0.4,stoneM,-2.6,0.65,1.9)); const st1=cyl(0.05,0.07,0.52,M.gold,-2.72,1.9,6); st1.position.y=1.15; g.add(st1); const st2=cyl(0.04,0.06,0.4,std({color:0x8a6d2f,roughness:0.5,metalness:0.6}),-2.45,1.9,6); st2.position.y=1.1; g.add(st2);
const path1=box(1.5,0.37,3.8,tanM,-1.05,0.19,3.6); path1.rotation.y=-0.68; g.add(path1);
// ===== Tomorrowland: Space Mountain =====
g.add(cyl(1.5,1.9,1.1,M.white,-6.4,2.4)); g.add(cone(1.5,2.6,M.white,-6.4,2.4,16,2.4)); [[-6.4,2.4,1.6],[-5.5,3.1,1],[-7.3,3,0.9],[-5.6,1.6,0.8],[-7.2,1.7,0.7]].forEach(q=>g.add(cone(0.14,q[2],M.grey,q[0],q[1],6,2.3+q[2]/2)));
g.add(box(1.7,0.8,1.2, teal, -5.2,0.4,4.3)); g.add(box(0.16,1.6,0.9, glowMat(screenTex(['SPACE','MOUNTAIN'])), -4.32,1.15,4.3));
const splash=new THREE.Group(); splash.position.set(-7.45,0.35,5.0); splash.rotation.y=0.55; g.add(splash);
splash.add(box(2.3,0.5,1.7,rock,0,0.25,0)); splash.add(cone(1.45,2.7,rock,0,0,12,1.8));
splash.add(sph(0.5,M.park,-0.7,2.2,0.3)); splash.add(sph(0.42,M.park,0.75,1.9,-0.2));
const chute=box(0.42,0.1,2.1,M.water,0,1.35,0.95); chute.rotation.x=0.62; splash.add(chute);
const spool=cyl(0.72,0.72,0.1,M.water,0,1.55,16); spool.position.y=0.12; splash.add(spool);
const log=new THREE.Group(); const logBody=box(0.34,0.22,0.62,std({color:0x7a4a21,roughness:0.9}),0,0.05,0); log.add(logBody); log.add(sph(0.09,M.red,0,0.22,-0.12)); log.add(sph(0.09,M.blue,0,0.22,0.14)); splash.add(log);
ANIM.push(t=>{ const u=(t*0.22)%1; if(u<0.55){ const v=u/0.55; log.position.set(0, 2.35-v*1.85, 0.25+v*1.35); log.rotation.x=0.62*v; } else { const v=(u-0.55)/0.45; log.position.set(0, 0.5, 1.6+v*0.001); log.rotation.x=0; log.position.y=0.42+Math.sin(v*Math.PI*2)*0.02; } });
// ===== Westernland: Big Thunder + Mark Twain (docked, bobbing) =====
const th1=box(3,1.1,2.2,rock,-6.2,0.55,-3.6); th1.rotation.y=0.4; g.add(th1); const th2=box(2.2,1,1.6,rock,-6.2,1.55,-3.6); th2.rotation.y=0.15; g.add(th2); g.add(box(1.3,0.9,1.1,rock,-6.1,2.45,-3.6));
g.add(box(1.1,0.5,2.2,M.park,-6.35,0.3,-1.9)); g.add(tree(-6.3,-1.8,0.9));
// Adventureland treehouse
g.add(cyl(0.3,0.42,2.2,std({color:0x6b4423,roughness:1}),-4.7,-4.7,8)); g.add(sph(1.25,M.park,-4.7,3,-4.7)); g.add(sph(0.9,M.park,-3.9,2.6,-4.4)); g.add(box(0.9,0.6,0.9,cream,-4.7,2.2,-4.7)); g.add(cone(0.85,0.6,rock,-4.7,-4.7,4,2.8));
const pir=new THREE.Group(); pir.position.set(-2.2,0.35,-5.25); g.add(pir);
pir.add(box(2.7,1.6,1.1,cream,0,0.8,0)); pir.add(hipRoof(3.1,0.8,1.5,M.roof,0,1.6,0));
pir.add(box(2.9,0.36,0.55,M.water,0,0.18,0.85));
const pboat=new THREE.Group(); pboat.position.set(-0.5,0.42,0.85); pboat.add(box(0.85,0.2,0.3,M.dark,0,0.1,0)); const pmast=cyl(0.03,0.03,0.95,M.dark,0,0,6); pmast.position.y=0.6; pboat.add(pmast); const sail=box(0.04,0.55,0.42,M.white,0.03,0.62,0); pboat.add(sail); pir.add(pboat);
pir.add(box(1.5,0.5,0.14, glowMat(signTex('加勒比海盗','#1e3a5f','#ffd9a0',false)), 0,1.05,0.6));
// ===== Fantasyland: Small World + Carousel + Teacups =====
g.add(box(3.2,1.5,0.7,M.white,-3.4,0.75,3.9)); [-4.6,-3.9,-3.2,-2.5].forEach((x,i)=>g.add(cone(0.32,0.9,[M.pink,M.gold,M.blue,teal][i],x,3.9,4,1.95)));
const caro=new THREE.Group(); caro.position.set(-0.7,0.35,3.1); g.add(caro);
caro.add(cyl(1.05,1.15,0.3,cream,0,0,18)); const caroSpin=new THREE.Group(); caro.add(caroSpin);
for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; const pole=cyl(0.03,0.03,0.85,M.gold,Math.cos(a)*0.72,Math.sin(a)*0.72,6); pole.position.y=0.55; caroSpin.add(pole); const horse=box(0.3,0.24,0.14, k%2?M.white:M.pink, Math.cos(a)*0.72, 0.55, Math.sin(a)*0.72); horse.rotation.y=-a; caroSpin.add(horse); }
const caroPole=cyl(0.09,0.09,1.15,M.gold,0,0,8); caroPole.position.y=0.6; caro.add(caroPole);
const caroTop=cone(1.35,0.75,M.pink,0,0,18,1.55); caro.add(caroTop);
ANIM.push(t=>{ caroSpin.rotation.y=t*0.55; });
const cups=new THREE.Group(); cups.position.set(-3.1,0.35,5.35); g.add(cups);
cups.add(cyl(0.95,0.95,0.12,cream,0,0,18)); const cupSpin=new THREE.Group(); cups.add(cupSpin);
[-0.5,0.15,0.55].forEach((ox,i)=>{ const cp=cyl(0.2,0.14,0.24,[M.blue,M.pink,teal][i],ox,i===1?0.35:-0.3,10); cp.position.y=0.2; cupSpin.add(cp); });
ANIM.push(t=>{ cupSpin.rotation.y=-t*0.8; });
// Toontown
[[-0.6,-4.85,M.pink],[0.55,-5.05,M.gold],[1.65,-4.8,teal]].forEach((q,i)=>{ g.add(box(0.95,0.75,0.85,q[2],q[0],0.72,q[1])); const rf=sph(0.62,[M.blue,M.red,M.pink][i],q[0],1.15,q[1],1,0.62,1); g.add(rf); const ch=box(0.16,0.4,0.16,brick,q[0]+0.25,1.35,q[1]); ch.rotation.z=0.18; g.add(ch); });
// Beast's Castle
const beast=new THREE.Group(); beast.position.set(-6.0,0.35,-5.25); g.add(beast);
beast.add(cone(1.15,0.85,rock,0,0,12,0.42));
const bwall=std({color:0xb59aa0,roughness:0.9}); const bcopper=std({color:0x4f8a7a,roughness:0.45,metalness:0.35});
beast.add(box(1.35,1.45,1.05,bwall,0,1.35,0)); beast.add(cone(0.95,0.8,bcopper,0,0,4,2.45));
[-0.62,0.62].forEach(x=>{ beast.add(cyl(0.2,0.24,1.7,bwall,x,0,10)); beast.add(cone(0.3,0.62,bcopper,x,0,10,2.15)); });
beast.add(box(0.4,0.6,0.12,M.dark,0,0.95,0.55));
// ===== World Bazaar with glass canopy =====
g.add(box(4.4,0.75,0.18, glowMat(signTex('TOKYO DISNEYLAND','#1e3a5f','#ffd9a0',false)), 0.6,2.5,5.82));
[-1.2,2.4].forEach(x=>g.add(cyl(0.07,0.09,2.2,M.gold,x,5.82,8)));
g.add(box(4.6,1.1,1.4,cream,0.6,0.55,4.9)); const dome=new THREE.Mesh(new THREE.SphereGeometry(1.05,14,10,0,Math.PI*2,0,Math.PI/2),M.blue); dome.scale.set(1.6,0.7,0.8); dome.position.set(0.6,1.1,4.9); g.add(dome);
const canopy=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,4.4,14,1,true,0,Math.PI), std({color:0xbfe3ea,roughness:0.15,metalness:0.1,transparent:true,opacity:0.35,side:THREE.DoubleSide})); canopy.rotation.z=Math.PI/2; canopy.rotation.y=Math.PI/2; canopy.position.set(0.6,1.15,4.9); g.add(canopy);
// ===== DisneySea: Mediterranean Harbor =====
const hb=cyl(2.5,2.5,0.1,M.water,3.4,2.4,24); hb.position.y=0.4; g.add(hb); [[1.2,M.pink,1.5],[2.2,cream,1.9],[3.3,M.orange,1.4],[4.5,cream,1.8],[5.6,M.pink,1.5]].forEach(b=>g.add(box(0.95,b[2],0.8,b[1],b[0],b[2]/2+0.3,5.3)));
const fort=cyl(0.62,0.75,2.6,stoneM,5.75,0.15,12); fort.position.y=1.3; g.add(fort); g.add(cone(0.85,0.9,M.roof,5.75,0.15,12,3.05));
const lh=new THREE.Group(); lh.position.set(1.35,0.35,4.35); g.add(lh);
lh.add(cyl(0.16,0.22,0.55,M.red,0,0,10)); const lh2=cyl(0.16,0.22,0.55,M.white,0,0,10); lh2.position.y=0.55; lh.add(lh2); const lh3=cyl(0.16,0.22,0.5,M.red,0,0,10); lh3.position.y=1.1; lh.add(lh3);
const lhTop=sph(0.13, std({color:0xffe9a8,roughness:0.3,emissive:0xffca7a,emissiveIntensity:0.8}), 0,1.5,0); lh.add(lhTop);
[[2.6,1.6],[4.3,3.1]].forEach((q,i)=>{ const gon=new THREE.Group(); gon.position.set(q[0],0.48,q[1]); gon.rotation.y=i?2.4:0.7; gon.add(box(0.24,0.14,0.85,M.dark,0,0.07,0)); gon.add(box(0.2,0.12,0.5,cream,0,0.2,0)); g.add(gon); ANIM.push(t=>{ gon.position.y=0.48+Math.sin(t*1.1+i*2)*0.03; }); });
// Mount Prometheus (pulsing lava)
g.add(cone(2.5,4.6,rock,3.2,-2.8,18,2.65)); const crater=cyl(0.55,0.75,0.5,M.dark,3.2,-2.8,12); crater.position.y=4.85; g.add(crater); const lava=new THREE.Mesh(new THREE.SphereGeometry(0.3,8,8), new THREE.MeshStandardMaterial({color:0xff6a00, emissive:0xff4400, emissiveIntensity:0.9})); lava.position.set(3.2,5.05,-2.8); g.add(lava);
ANIM.push(t=>{ lava.material.emissiveIntensity=0.75+Math.sin(t*2.2)*0.35; const sc=1+Math.sin(t*2.2)*0.12; lava.scale.set(sc,sc,sc); });
// Fortress + Mermaid Lagoon
g.add(box(1.9,1.3,1.9,cream,0.9,0.65,-3.9)); const onion=new THREE.Mesh(new THREE.SphereGeometry(0.95,14,12),teal); onion.scale.set(1,1.25,1); onion.position.set(0.9,2,-3.9); g.add(onion); g.add(cone(0.12,0.9,M.gold,0.9,-3.9,6,3.6));
const lagoon=new THREE.Group(); lagoon.position.set(4.35,0.35,-4.75); g.add(lagoon);
const shell=new THREE.Mesh(new THREE.SphereGeometry(1.05,16,10,0,Math.PI*2,0,Math.PI/2), std({color:0xf6c9d4,roughness:0.5})); shell.scale.set(1.25,0.8,0.7); lagoon.add(shell);
[-0.75,0,0.75].forEach((ox,i)=>{ lagoon.add(cone(0.16,0.8+i*0.25,teal,ox,0.1,8,0.85+i*0.12)); });
lagoon.add(box(0.08,0.85,0.08,M.gold,0,0.95,0)); lagoon.add(cone(0.14,0.4,M.gold,0,0,6,1.5));
// Tower of Terror + Indiana pyramid
g.add(box(1.7,4.6,1.7,brick,6.6,2.3,-0.6)); g.add(box(1.2,1.2,1.2,brick,6.6,5.2,-0.6)); g.add(cone(0.95,1.6,M.roof,6.6,-0.6,4,6.6)); g.add(box(0.7,0.5,0.2,M.gold,6.6,3.4,0.32));
const pyr=new THREE.Group(); pyr.position.set(7.55,0.35,1.85); pyr.rotation.y=-0.3; g.add(pyr);
pyr.add(box(1.7,0.5,1.7,stoneM,0,0.25,0)); pyr.add(box(1.25,0.5,1.25,stoneM,0,0.75,0)); pyr.add(box(0.8,0.5,0.8,stoneM,0,1.25,0)); pyr.add(box(0.4,0.55,0.2,M.dark,0,0.5,0.8)); pyr.add(sph(0.14,M.gold,0,1.62,0));
g.add(tree(6.9,2.9,0.85)); g.add(tree(8,-0.9,0.8));
// SS Columbia
const ship=new THREE.Group(); ship.position.set(6.2,0.35,3.6); ship.rotation.y=-0.6; ship.add(box(3.2,0.8,1.05,M.dark,0,0.4,0)); ship.add(box(2.6,0.7,0.9,M.white,0,1.15,0)); ship.add(box(1.8,0.6,0.8,M.white,-0.2,1.8,0)); [-0.7,0.5].forEach(x=>{ const f=cyl(0.22,0.26,1.1,M.red,x,0); f.position.set(x,2.65,0); ship.add(f); const cap=cyl(0.23,0.23,0.3,M.dark,x,0); cap.position.set(x,3.3,0); ship.add(cap); }); g.add(ship);
// Port Discovery + Aquatopia
const pd=new THREE.Mesh(new THREE.SphereGeometry(1.05,14,10,0,Math.PI*2,0,Math.PI/2),M.blue); pd.position.set(7.3,0.35,-3.6); g.add(pd); g.add(cyl(1.15,1.25,0.5,M.grey,7.3,-3.6,16));
const aq=new THREE.Group(); aq.position.set(6.15,0.42,-2.5); g.add(aq);
aq.add(cyl(0.85,0.85,0.08,M.water,0,0,18));
for(let k=0;k<3;k++){ const a=k/3*Math.PI*2; const bt2=box(0.34,0.16,0.24, [M.pink,cream,teal][k], Math.cos(a)*0.5, 0.1, Math.sin(a)*0.5); bt2.rotation.y=-a; aq.add(bt2); }
ANIM.push(t=>{ aq.rotation.y=t*0.45; });
// Electric railway (waterfront <-> port discovery)
g.add(box(0.18,0.14,5.6,M.grey,7.95,1.85,-0.9)); [-3.2,-0.9,1.4].forEach(z=>g.add(box(0.16,1.85,0.16,M.grey,7.95,0.92,z)));
const ert=new THREE.Group(); const erCar=box(1.5,0.5,0.55,M.red,0,0,0); ert.add(erCar); ert.add(box(1.5,0.14,0.57,M.white,0,0.32,0)); g.add(ert);
ANIM.push(t=>{ const u=(Math.sin(t*0.16)+1)/2; ert.position.set(7.95, 2.2, -3.1+u*4.4); });
// ===== Resort monorail =====
const mono=new THREE.Group(); g.add(mono);
const mring=tor(8.6,0.09,M.grey,0,2.6,0.4,Math.PI/2); mring.scale.set(1,0.68,1); mono.add(mring);
for(let k=0;k<10;k++){ const a=k/10*Math.PI*2; mono.add(cyl(0.09,0.13,2.6,M.grey,Math.cos(a)*8.6,0.4+Math.sin(a)*5.85,8)); }
const mtrain=new THREE.Group(); [-1.25,0,1.25].forEach((ox,i)=>{ const car=box(1.15,0.52,0.6, i===1?M.pink:M.white, ox,0,0); mtrain.add(car); }); mtrain.add(box(3.6,0.16,0.62,M.pink,0,0.34,0)); mono.add(mtrain);
ANIM.push((t)=>{ const a=t*0.1+1; mtrain.position.set(Math.cos(a)*8.6, 2.98, 0.4+Math.sin(a)*5.85); mtrain.rotation.y=-a; });
// ===== Fireworks over the castle (night only) =====
const fwGroup=new THREE.Group(); fwGroup.visible=false; g.add(fwGroup);
function burst(x,y,z,col,ph){ const n=42, pos=new Float32Array(n*3); for(let i2=0;i2<n;i2++){ const th=Math.random()*Math.PI*2, ph2=Math.acos(2*Math.random()-1), rr=1; pos[i2*3]=x+rr*Math.sin(ph2)*Math.cos(th); pos[i2*3+1]=y+rr*Math.cos(ph2); pos[i2*3+2]=z+rr*Math.sin(ph2)*Math.sin(th); } const geo=new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos,3)); const m=new THREE.PointsMaterial({color:col, size:0.14, transparent:true, opacity:0}); const pts2=new THREE.Points(geo,m); pts2.userData.ph=ph; fwGroup.add(pts2); return pts2; }
const fw1=burst(-2.6,9.4,-0.6,0xffd166,0), fw2=burst(-4.4,10.3,-1.6,0xf472b6,2.1);
ANIM.push(t=>{ if(!fwGroup.visible) return; [fw1,fw2].forEach(f=>{ const u=((t+f.userData.ph)%4.2)/4.2; const sc=0.25+u*1.7; f.scale.set(sc,sc,sc); f.material.opacity=u<0.12? u/0.12 : Math.max(0, 1-(u-0.12)/0.7); f.position.y=-u*0.7; }); });
window.NIGHT_FNS=window.NIGHT_FNS||[]; NIGHT_FNS.push(n=>{ fwGroup.visible=n; });
g.add(tree(2.2,-5.2,0.9)); g.add(tree(-5.9,5.3,0.85)); g.add(tree(1.8,5.6,0.8,pinkTree)); g.add(tree(-7.9,-5.2,0.9,pinkTree));
} },, {id:'kamakura', name:'镰仓高校前', x:0, z:0, h:5, desc:'《灌篮高手》片头那个面朝大海的铁路道口——县立镰仓高校门前、江之岛电铁镰仓高校前站旁。位于东京西南约 55 公里处，地图上为示意位置。', make:g=>{
  g.add(box(22,0.35,14, std({color:0x8a9a72,roughness:1}), 0,0.17,0));
  g.add(box(22,0.5,3.6, std({color:0x2f6db0,roughness:0.25,metalness:0.15}), 0,0.28,5.2));
  g.add(box(22,0.14,0.5, std({color:0xf4f1e4,roughness:0.6}), 0,0.5,3.3));
  g.add(box(22,0.4,1.4, std({color:0xdcc79c,roughness:1}), 0,0.2,2.6));
  g.add(box(22,0.07,2.2, std({color:0x3c4148,roughness:0.9}), 0,0.4,0.8));
  g.add(box(22,0.02,0.14, std({color:0xf5f5f5}), 0,0.45,0.8));
  g.add(box(22,0.12,1.7, std({color:0x8d8d84,roughness:1}), 0,0.41,-1.1));
  for(let x=-10.5;x<=10.5;x+=1.05) g.add(box(0.32,0.05,1.3, std({color:0x4a3a28,roughness:1}), x,0.49,-1.1));
  const railM=std({color:0xb9c0c7,roughness:0.35,metalness:0.8});
  g.add(box(22,0.09,0.07, railM, 0,0.55,-1.45)); g.add(box(22,0.09,0.07, railM, 0,0.55,-0.75));
  const poleM=std({color:0x3a3f45,roughness:0.7,metalness:0.4});
  [-8,-2.5,3,8.5].forEach(x=>{ const p=cyl(0.05,0.06,2.6, poleM, x,-1.95); p.position.y=0.35+1.3; g.add(p); });
  g.add(beam(-8,3.3,-1.95, 8.5,3.3,-1.95, poleM, 0.015));
  const sg=new THREE.Group(); sg.position.set(0,1.06,-4.35); sg.rotation.x=0.21; g.add(sg);
  sg.add(box(3.0,0.1,5.6, std({color:0x42464e,roughness:0.95}), 0,0,0));
  sg.add(box(0.16,0.11,5.6, std({color:0xf5f5f5}), -1.32,0,0)); sg.add(box(0.16,0.11,5.6, std({color:0xf5f5f5}), 1.32,0,0));
  const wallM=std({color:0x7b7568,roughness:1});
  sg.add(box(0.45,1.0,5.6, wallM, -1.95,-0.25,0)); sg.add(box(0.45,1.0,5.6, wallM, 1.95,-0.25,0));
  g.add(box(3.0,0.1,2.3, std({color:0x42464e,roughness:0.95}), 0,0.47,-0.8));
  const yelM=std({color:0xf7c948,roughness:0.6});
  function xsignal(x,z){
    const p=cyl(0.045,0.05,1.9, poleM, x,z); p.position.y=0.45+0.95; g.add(p);
    const b1=box(0.62,0.11,0.04, yelM, x,2.55,z); b1.rotation.z=0.7; g.add(b1);
    const b2=box(0.62,0.11,0.04, yelM, x,2.55,z); b2.rotation.z=-0.7; g.add(b2);
    const m1=std({color:0xff3333, emissive:0xff2222, emissiveIntensity:1.2, roughness:0.4}); blink(m1);
    g.add(sph(0.075, m1, x,2.2,z+0.06));
    const m2=std({color:0x551111, emissive:0xff2222, emissiveIntensity:0.15, roughness:0.4});
    ANIM.push(t=>{ const on=Math.sin(t*2.4)<=0; m2.color.setHex(on?0xff3333:0x551111); m2.emissiveIntensity=on?1.2:0.15; });
    g.add(sph(0.075, m2, x,2.2,z-0.14));
  }
  xsignal(1.95,-1.8); xsignal(-1.95,-0.35);
  g.add(beam(2.1,1.2,-0.5, 0.7,2.0,-0.5, std({color:0xf0f0f0,roughness:0.5}), 0.05));
  g.add(beam(0.7,2.0,-0.5, 0.35,2.14,-0.5, std({color:0xd23b2e,roughness:0.5}), 0.05));
  g.add(beam(-2.1,1.2,-1.7, -0.7,2.0,-1.7, std({color:0xf0f0f0,roughness:0.5}), 0.05));
  g.add(beam(-0.7,2.0,-1.7, -0.35,2.14,-1.7, std({color:0xd23b2e,roughness:0.5}), 0.05));
  g.add(box(6.5,0.8,4.5, wallM, 6.3,0.4,-4.2));
  g.add(box(5.6,2.4,2.4, std({color:0xf2f0e8,roughness:0.85}), 6.3,2.0,-4.4));
  g.add(box(5.9,0.18,2.7, std({color:0x5b7186,roughness:0.7}), 6.3,3.3,-4.4));
  const winM=std({color:0x33506b,roughness:0.3,metalness:0.3});
  g.add(box(5.0,0.5,0.06, winM, 6.3,1.7,-3.17)); g.add(box(5.0,0.5,0.06, winM, 6.3,2.6,-3.17));
  const gateS=texMat(signTex('鎌倉高校','#1f3a93','#ffffff',false));
  const gp1=cyl(0.05,0.05,1.7, poleM, 2.3,-6.3); gp1.position.y=0.35+0.85; g.add(gp1);
  const gp2=cyl(0.05,0.05,1.7, poleM, 4.1,-6.3); gp2.position.y=0.35+0.85; g.add(gp2);
  const gsign=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.55,0.08), gateS); gsign.position.set(3.2,1.95,-6.3); g.add(gsign);
  g.add(box(5.2,0.45,1.7, std({color:0x9aa0a3,roughness:0.9}), -6.2,0.57,-1.1));
  g.add(box(1.7,1.5,1.5, std({color:0xefe6cf,roughness:0.9}), -8.6,1.1,-1.1));
  g.add(hipRoof(2.0,0.55,1.8, texMat(kawaraTex()), -8.6, 1.85, -1.1));
  [-7.6,-6.2,-4.8].forEach(x=>{ const p=cyl(0.04,0.04,1.6, poleM, x,-1.75); p.position.y=0.8+0.8; g.add(p); });
  g.add(box(3.6,0.1,1.6, std({color:0x5b7186,roughness:0.7}), -6.2,2.45,-1.4));
  const staS=texMat(signTex('鎌倉高校前','#0d7a4f','#ffffff',false));
  const ssign=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.5,0.07), staS); ssign.position.set(-6.2,1.95,-0.35); g.add(ssign);
  const eno=new THREE.Group(); g.add(eno);
  [-1.85,1.85].forEach(cx=>{
    const car=new THREE.Group(); car.position.set(cx,0,-1.1); eno.add(car);
    car.add(box(0.9,0.3,1.1, std({color:0x22262a}), -1.1,0.68,0)); car.add(box(0.9,0.3,1.1, std({color:0x22262a}), 1.1,0.68,0));
    car.add(box(3.52,0.5,1.47, std({color:0x2e7d4f,roughness:0.5}), 0,0.85,0));
    car.add(box(3.5,0.95,1.45, std({color:0xe9e2c4,roughness:0.5}), 0,1.55,0));
    car.add(box(3.54,0.42,1.49, std({color:0x2c4256,roughness:0.25,metalness:0.4}), 0,1.66,0));
    car.add(box(3.3,0.14,1.3, std({color:0x8f979e,roughness:0.6}), 0,2.12,0));
  });
  ANIM.push(t=>{ eno.position.x=-15+((t*0.85)%32); });
  const carW=new THREE.Group(); carW.position.set(0,0,0.45); g.add(carW);
  carW.add(box(1.5,0.42,0.75, std({color:0xf5f5f5,roughness:0.4}), 0,0.68,0));
  carW.add(box(0.85,0.34,0.7, std({color:0xdfe9f2,roughness:0.3}), -0.05,1.05,0));
  ANIM.push(t=>{ carW.position.x=12.5-((t*0.7)%27); });
  const isl=cone(1.7,0.9, std({color:0x5d7d4a,roughness:1}), -7.6,5.4, 12, 0.95); g.add(isl);
  const tw=cyl(0.05,0.09,1.5, std({color:0xf0f0f0,roughness:0.5}), -7.6,5.4); tw.position.y=1.35; g.add(tw);
  g.add(sph(0.15, std({color:0xfff2c8, emissive:0xffdf8a, emissiveIntensity:0.7}), -7.6,2.2,5.4));
  people(g,5, 1.7,2.7, -0.1,0.6, 0.5);
  people(g,3, -2.7,-1.9, -0.1,0.5, 0.5);
  people(g,2, 0.7,1.3, -3.6,-2.8, 1.25);
  g.add(tree(9.4,-6.3,1.1)); g.add(tree(-9.8,-5.4,1.0)); g.add(tree(-4.6,-6.5,0.9));
 } },
 {id:'fuji', name:'富士山', x:0, z:0, h:8, desc:'日本最高峰（3,776 米），位于东京西南约 100 公里处，地图上为示意位置。山脚下是河口湖与新仓山五重塔——看富士山最经典的角度都在这一带。', make:g=>{ g.add(box(26,0.35,17, std({color:0x7d8f66,roughness:1}), 0,0.17,0));
const prof=[[9.2,0],[8.6,0.9],[7.4,2.0],[6.0,3.2],[4.6,4.4],[3.3,5.5],[2.2,6.4],[1.25,7.1],[0.72,7.5],[0.6,7.62]];
const fgeo=new THREE.LatheGeometry(prof.map(q=>new THREE.Vector2(q[0],q[1])), 56);
{ const pa=fgeo.attributes.position; const cols=[]; const cL=new THREE.Color(0x7787a0), cH=new THREE.Color(0x4d6182), cS=new THREE.Color(0xf5f8fb), tc=new THREE.Color();
for(let i=0;i<pa.count;i++){ const x=pa.getX(i), y=pa.getY(i), z=pa.getZ(i); const ang=Math.atan2(z,x); const line=5.05+Math.sin(ang*7)*0.2+Math.sin(ang*13+1.7)*0.13; if(y>line) tc.copy(cS); else tc.copy(cL).lerp(cH, Math.min(1,y/5)); cols.push(tc.r,tc.g,tc.b); }
fgeo.setAttribute('color', new THREE.Float32BufferAttribute(cols,3)); }
const fm=new THREE.Mesh(fgeo, std({vertexColors:true, roughness:0.95})); fm.castShadow=true; fm.position.set(0,0.3,-2.8); g.add(fm);
const cr=cyl(0.5,0.62,0.22, M.dark, 0,-2.8, 16); cr.position.y=7.95; g.add(cr);
g.add(box(0.55,0.3,0.4, M.white, 0.62,8.05,-2.8)); g.add(sph(0.14, M.white, 0.62,8.28,-2.8));
const go=new THREE.Group(); go.position.set(0.4,3.3,3.1); go.rotation.x=-0.42; g.add(go);
go.add(box(1.5,0.5,0.9, M.white, 0,0.25,0)); go.add(box(1.1,0.45,0.7, texMat(facadeTex('#c8b393')), -0.1,0.72,0)); go.add(box(0.9,0.3,0.1, glowMat(signTex('五合目','#374151','#ffffff',false)), 0,0.3,0.47));
[[-9.5,-5.5,3.6,1.6],[-10.5,1.5,3,1.3],[10,-6,4,1.8],[11,2,3.2,1.4],[-6,-7.5,2.6,1.1]].forEach(q=>g.add(cone(q[2],q[3], std({color:0x55703f,roughness:1}), q[0],q[1],10,q[3]/2+0.3)));
const lake=cyl(1,1,0.1, M.water, 3.4,6.6, 24); lake.scale.set(5.4,1,2.3); lake.position.y=0.36; g.add(lake);
const pg=new THREE.Group(); pg.position.set(-7.6,0.3,5.4); g.add(pg);
pg.add(cone(2.3,1.1, std({color:0x55703f,roughness:1}), 0,0,12,0.85));
for(let i=0;i<5;i++){ const w=1.08-i*0.13, y=1.35+i*0.52; pg.add(box(w,0.4,w, std({color:0xa52a21,roughness:0.6}), 0,y,0)); pg.add(box(w+0.34,0.13,w+0.34, M.dark, 0,y+0.26,0)); }
const sp2=cyl(0.03,0.05,0.8, M.gold, 0,0, 6); sp2.position.y=4.35; pg.add(sp2);
pg.add(tree(1.6,0.8,0.95,pinkTree)); pg.add(tree(-1.7,0.5,0.85,pinkTree)); pg.add(tree(0.9,-1.2,0.8,pinkTree));
[[-4.5,4.6],[-3.2,5.6],[-5.6,6.2],[-2.2,4.2]].forEach(q=>{ g.add(box(0.95,0.55,0.8, M.white, q[0],0.6,q[1])); g.add(hipRoof(1.15,0.4,1, M.roof, q[0],0.88,q[1])); });
g.add(box(17,0.07,0.75, M.dark, -0.5,0.36,7.7));
const ft=new THREE.Group(); ft.add(box(1.5,0.58,0.6, M.red, -0.8,0.3,0)); ft.add(box(1.5,0.58,0.6, std({color:0xf3e5cf,roughness:0.5}), 0.8,0.3,0)); ft.add(box(3.1,0.16,0.5, M.grey, 0,0.66,0)); ft.position.set(0,0.4,7.7); g.add(ft);
ANIM.push(t=>{ ft.position.x=Math.sin(t*0.14)*6.2; });
const cl1=new THREE.Group(); [[0,0,0],[0.85,0.15,0.2],[1.7,-0.05,0]].forEach(q=>cl1.add(sph(0.55, M.white, q[0],q[1],q[2]))); cl1.children.forEach(c=>c.scale.y=0.55); cl1.position.set(-4,9.6,-3); g.add(cl1);
const cl2=cl1.clone(); cl2.position.set(5.5,10.4,-5); cl2.scale.setScalar(1.3); g.add(cl2);
ANIM.push(t=>{ cl1.position.x=-4+Math.sin(t*0.05)*1.2; cl2.position.x=5.5+Math.sin(t*0.04+2)*1.4; });
people(g,6,-5.5,-1.5,3.5,6.5,0.35); } }

];
export { M, ANIM, RND, label, spots, box, cyl, cone, sph, beam, ring, tor, cnv, std, texMat, glowMat, facadeTex, signTex, hipRoof, tree, pinkTree, treeMat, people, blink };
