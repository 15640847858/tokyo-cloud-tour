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
  glass: new THREE.MeshStandardMaterial({color:0xa8cbe4, roughness:0.08, metalness:0.15, envMapIntensity:1.5}),
  steel: new THREE.MeshStandardMaterial({color:0x9aa4ae, roughness:0.35, metalness:0.85, envMapIntensity:1.1}),
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
function cnv(w,h,fn){ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=8; return t; }
function std(o){ return new THREE.MeshStandardMaterial(o); }
const RND=(a,b)=>a+Math.random()*(b-a);
const HASH=(n)=>{ const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };
function texMat(tex,opts){ return new THREE.MeshStandardMaterial(Object.assign({map:tex, roughness:0.85}, opts||{})); }
function glowMat(tex){ return new THREE.MeshStandardMaterial({map:tex, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:0.55, roughness:0.6}); }
function facadeTex(base, win){ base=base||'#cfd6de'; win=win||'#ffe9a8'; return cnv(256,512,(g,w,h)=>{
  g.fillStyle=base; g.fillRect(0,0,w,h);
  for(let i=0;i<1100;i++){ g.fillStyle=HASH(i*3.1)>0.5?'rgba(255,255,255,0.05)':'rgba(30,40,50,0.05)'; g.fillRect(HASH(i*1.7)*w, HASH(i*2.3)*h, 2, 2); }
  for(let y=16;y<h-10;y+=32){ g.fillStyle='rgba(60,70,80,0.20)'; g.fillRect(0,y+23,w,2); g.fillStyle='rgba(255,255,255,0.16)'; g.fillRect(0,y+25,w,1);
    for(let x=14;x<w-12;x+=28){ const s=(y*7+x)*1.31, lit=HASH(s)>0.58;
      g.fillStyle='rgba(238,241,244,0.95)'; g.fillRect(x-2,y-2,20,24);
      g.fillStyle='rgba(25,32,40,0.55)'; g.fillRect(x-1,y-1,18,22);
      const wg=g.createLinearGradient(0,y,0,y+18); if(lit){ wg.addColorStop(0,win); wg.addColorStop(1,'#d9b96a'); } else { wg.addColorStop(0,'#6d8699'); wg.addColorStop(1,'#3c4f61'); }
      g.fillStyle=wg; g.globalAlpha=0.8+HASH(s*3)*0.2; g.fillRect(x,y,16,18); g.globalAlpha=1;
      g.fillStyle='rgba(255,255,255,0.28)'; g.fillRect(x,y,16,4);
      g.fillStyle='rgba(240,243,245,0.9)'; g.fillRect(x-2,y+21,20,2); } }
}); }
function glassTex(base){ base=base||'#9fc6e0'; return cnv(256,512,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#dceef9'); gr.addColorStop(0.5,base); gr.addColorStop(1,'#5d87a8'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=42){ g.fillStyle='rgba(38,58,76,0.55)'; g.fillRect(0,y,w,9); g.fillStyle='rgba(255,255,255,0.20)'; g.fillRect(0,y+9,w,2); }
  for(let y=21;y<h;y+=42) for(let x=0;x<w;x+=32){ const v=HASH((y*3+x)*1.7); if(v>0.72){ g.fillStyle='rgba(24,38,52,0.35)'; g.fillRect(x+2,y,28,19); } else if(v<0.16){ g.fillStyle='rgba(255,255,255,0.20)'; g.fillRect(x+2,y,28,19); } }
  g.strokeStyle='rgba(240,248,252,0.5)'; g.lineWidth=2; for(let x=0;x<=w;x+=32){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
  g.fillStyle='rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(w*0.08,h); g.lineTo(w*0.5,0); g.lineTo(w*0.68,0); g.lineTo(w*0.3,h); g.fill();
}); }
function signTex(text,bg,fg,vert){ bg=bg||'#e11d48'; fg=fg||'#ffffff'; if(vert===false){ return cnv(256,96,(g,w,h)=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.fillStyle=fg; g.font='bold 42px "PingFang SC","Microsoft YaHei",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(text,w/2,h/2+2); }); } return cnv(96,256,(g,w,h)=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.fillStyle=fg; g.font='bold 42px "PingFang SC","Microsoft YaHei",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; const ch=[...text]; ch.forEach((c,i)=>g.fillText(c, w/2, 38+i*((h-76)/Math.max(ch.length-1,1)))); }); }
function screenTex(lines){ return cnv(256,160,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#2563eb'); gr.addColorStop(0.55,'#111827'); gr.addColorStop(1,'#db2777'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#ffffff'; g.textAlign='center'; lines.forEach((tx,i)=>{ g.font=(i===0?'bold 38px':'bold 25px')+' "PingFang SC","Microsoft YaHei",sans-serif'; g.fillText(tx, w/2, 56+i*42); }); }); }
function brickTex(){ const t=cnv(512,256,(g,w,h)=>{
  g.fillStyle='#8f3a2b'; g.fillRect(0,0,w,h);
  for(let y=0,row=0;y<h;y+=16,row++){ for(let x=-32;x<w+32;x+=64){ const bx=x+(row%2)*32, v=HASH((y*3+x)*1.13); g.fillStyle=['#9c4030','#a54533','#93402e','#ab4a34'][Math.floor(v*4)%4]; g.fillRect(bx+2,y+2,60,12); g.fillStyle='rgba(255,255,255,0.07)'; g.fillRect(bx+2,y+2,60,3); } }
  g.strokeStyle='rgba(226,205,182,0.5)'; g.lineWidth=2; for(let y=0;y<=h;y+=16){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  g.fillStyle='#f3e9dc'; g.fillRect(0,48,w,18); g.fillRect(0,168,w,18); g.fillStyle='rgba(120,100,80,0.35)'; g.fillRect(0,64,w,2); g.fillRect(0,184,w,2);
}); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,1); return t; }
function kawaraTex(){ const t=cnv(256,256,(g,w,h)=>{ g.fillStyle='#33475c'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=32){ g.fillStyle='rgba(255,255,255,0.10)'; g.fillRect(0,y,w,3); g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(0,y+26,w,6); for(let x=0;x<w;x+=16){ g.strokeStyle='rgba(0,0,0,0.28)'; g.lineWidth=2; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+32); g.stroke(); g.fillStyle='rgba(255,255,255,0.06)'; g.fillRect(x+2,y+4,3,24); } } }); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(2,2); return t; }
function templeWallTex(){ return cnv(256,256,(g,w,h)=>{ g.fillStyle='#f4efe4'; g.fillRect(0,0,w,h); g.fillStyle='#8c2f26'; g.fillRect(0,0,14,h); g.fillRect(w-14,0,14,h); g.fillRect(0,0,w,16); g.fillRect(0,h-16,w,16); g.fillStyle='rgba(60,40,30,0.5)'; for(let x=42;x<w-20;x+=26) g.fillRect(x,44,3,h-88); for(let y=44;y<h-20;y+=26) g.fillRect(28,y,w-56,3); }); }
function stationTex(){ const t=cnv(1024,512,(g,w,h)=>{
  g.fillStyle='#9c3d2e'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(255,235,220,0.16)'; g.lineWidth=1;
  for(let y=0;y<h;y+=18){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  for(let y=9;y<h;y+=18) for(let x=(Math.floor(y/18)%2)*24;x<w;x+=48){ g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+18); g.stroke(); }
  g.fillStyle='#f3e9dc'; g.fillRect(0,40,w,24); g.fillRect(0,h-60,w,24);
  for(let r=0;r<2;r++){ const y0=116+r*168; for(let x=52;x<w-40;x+=96){ g.fillStyle='#f3e9dc'; g.beginPath(); g.arc(x+28,y0+32,30,Math.PI,0); g.fill(); g.fillRect(x-2,y0+32,60,76); g.fillStyle='#2e3d4d'; g.beginPath(); g.arc(x+28,y0+32,22,Math.PI,0); g.fill(); g.fillRect(x+6,y0+32,44,68); g.fillStyle='rgba(255,255,255,0.25)'; g.fillRect(x+12,y0+40,10,52); } }
}); t.wrapS=THREE.RepeatWrapping; return t; }
function gravelTex(){ const t=cnv(256,256,(g,w,h)=>{
  g.fillStyle='#c9bda3'; g.fillRect(0,0,w,h);
  for(let i=0;i<5200;i++){ const v=HASH(i*1.71); g.fillStyle=v>0.66?'rgba(255,250,238,0.5)':(v>0.33?'rgba(120,105,80,0.4)':'rgba(80,70,52,0.35)'); g.fillRect(HASH(i*2.3)*w, HASH(i*3.1)*h, 2, 2); }
}); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,6); return t; }
function paveTex(){ const t=cnv(256,256,(g,w,h)=>{
  g.fillStyle='#cfc8b8'; g.fillRect(0,0,w,h);
  for(let i=0;i<1600;i++){ g.fillStyle=HASH(i*2.9)>0.5?'rgba(255,255,255,0.05)':'rgba(60,55,45,0.05)'; g.fillRect(HASH(i*1.3)*w, HASH(i*1.9)*h, 2, 2); }
  g.strokeStyle='rgba(90,84,70,0.45)'; g.lineWidth=2;
  for(let y=0;y<=h;y+=64){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  for(let y=0;y<h;y+=64) for(let x=(Math.floor(y/64)%2)*64;x<=w;x+=128){ g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+64); g.stroke(); }
}); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(4,3); return t; }
function shibuyaRoadTex(){ const t=cnv(1024,1024,(g,w,h)=>{
  g.save(); g.scale(w/13.5, h/11.5); g.translate(6.75, 5.75);
  g.fillStyle='#a8a49c'; g.fillRect(-6.75,-5.75,13.5,11.5);
  for(let i=0;i<2600;i++){ g.fillStyle=HASH(i*1.37)>0.5?'rgba(255,255,255,0.05)':'rgba(50,48,44,0.06)'; g.fillRect(HASH(i*2.11)*13.5-6.75, HASH(i*3.17)*11.5-5.75, 0.09, 0.09); }
  g.fillStyle='#33373b'; g.fillRect(-1.6,-5.75,3.2,11.5); g.fillRect(-6.75,-1.6,13.5,3.2);
  for(let i=0;i<1500;i++){ g.fillStyle=HASH(i*1.91)>0.5?'rgba(255,255,255,0.045)':'rgba(0,0,0,0.16)'; g.fillRect(HASH(i*2.53)*3.2-1.6, HASH(i*3.71)*11.5-5.75, 0.06, 0.06); g.fillStyle=HASH(i*1.53)>0.5?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.14)'; g.fillRect(HASH(i*2.97)*13.5-6.75, HASH(i*3.31)*3.2-1.6, 0.06, 0.06); }
  g.fillStyle='rgba(245,245,240,0.55)';
  g.fillRect(-1.66,-5.75,0.09,4.05); g.fillRect(-1.66,1.7,0.09,4.05); g.fillRect(1.57,-5.75,0.09,4.05); g.fillRect(1.57,1.7,0.09,4.05);
  g.fillRect(-5.75,-1.66,4.05,0.09); g.fillRect(1.7,-1.66,4.05,0.09); g.fillRect(-5.75,1.57,4.05,0.09); g.fillRect(1.7,1.57,4.05,0.09);
  g.fillStyle='rgba(250,250,245,0.85)';
  for(let z=-5.5;z<-2.1;z+=0.95) g.fillRect(-0.055,z,0.11,0.5);
  for(let z=2.2;z<5.4;z+=0.95) g.fillRect(-0.055,z,0.11,0.5);
  for(let x=-6.4;x<-2.1;x+=0.95) g.fillRect(x,-0.055,0.5,0.11);
  for(let x=2.2;x<6.3;x+=0.95) g.fillRect(x,-0.055,0.5,0.11);
  g.fillStyle='rgba(255,255,255,0.94)';
  for(let x=-1.48;x<1.3;x+=0.55) g.fillRect(x,-3.15,0.34,1.15);
  for(let x=-1.48;x<1.3;x+=0.55) g.fillRect(x,2.0,0.34,1.15);
  for(let z=-1.48;z<1.3;z+=0.55) g.fillRect(-3.15,z,1.15,0.34);
  for(let z=-1.48;z<1.3;z+=0.55) g.fillRect(2.0,z,1.15,0.34);
  g.fillRect(-1.55,-3.5,1.5,0.22); g.fillRect(0.05,3.28,1.5,0.22); g.fillRect(-3.5,0.05,0.22,1.5); g.fillRect(3.28,-1.55,0.22,1.5);
  g.restore();
}); return t; }
function yasudaTex(){ const t=cnv(512,256,(g,w,h)=>{
  g.fillStyle='#5f2a1e'; g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=12){ for(let x=-24;x<w+24;x+=48){ const bx=x+(Math.floor(y/12)%2)*24, v=HASH((y*3+x)*1.17); g.fillStyle=['#6d2f22','#63301f','#713626','#673223'][Math.floor(v*4)%4]; g.fillRect(bx+1,y+1,46,10); } }
  g.strokeStyle='rgba(230,205,180,0.28)'; g.lineWidth=1; for(let y=0;y<=h;y+=12){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  g.fillStyle='#cfc4ae'; g.fillRect(0,0,w,14);
  for(let b=0;b<5;b++){ const cx=52+b*102, wy=52, ww=44, wh=150;
    g.fillStyle='#cfc4ae'; g.beginPath(); g.moveTo(cx-ww/2,wy+wh); g.lineTo(cx-ww/2,wy+22); g.arc(cx,wy+22,ww/2,Math.PI,0); g.lineTo(cx+ww/2,wy+wh); g.closePath(); g.fill();
    g.fillStyle='#26313d'; g.beginPath(); g.moveTo(cx-ww/2+5,wy+wh); g.lineTo(cx-ww/2+5,wy+24); g.arc(cx,wy+24,ww/2-5,Math.PI,0); g.lineTo(cx+ww/2-5,wy+wh); g.closePath(); g.fill();
    g.fillStyle='rgba(255,255,255,0.20)'; g.fillRect(cx-2,wy+30,4,wh-36);
    const wg2=g.createLinearGradient(0,wy,0,wy+wh); wg2.addColorStop(0,'rgba(190,215,235,0.25)'); wg2.addColorStop(1,'rgba(190,215,235,0)'); g.fillStyle=wg2; g.fillRect(cx-ww/2+5,wy+4,ww-10,wh-8); }
}); t.wrapS=THREE.RepeatWrapping; return t; }
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
function tree(x,z,sc,mat){ sc=sc||1; const g=new THREE.Group(); g.position.set(x,0,z); const fm=mat||treeMat; g.add(cyl(0.06*sc,0.1*sc,0.9*sc,M.dark,0,0,6)); const c1=sph(0.58*sc, fm, 0, 1.3*sc, 0); c1.scale.y*=0.85; g.add(c1); const c2=sph(0.4*sc, fm, 0.34*sc, 1.05*sc, 0.12*sc); c2.scale.y*=0.85; g.add(c2); const c3=sph(0.34*sc, fm, -0.3*sc, 1.12*sc, -0.1*sc); c3.scale.y*=0.85; g.add(c3); g.rotation.y=HASH(x*13.7+z*7.1)*3.14; return g; }
function people(g,n,x0,x1,z0,z1,y){ const cols=[0xef4444,0x3b82f6,0xf59e0b,0x10b981,0xf8fafc,0x334155]; for(let i=0;i<n;i++){ const p=cyl(0.05,0.07,0.34, std({color:cols[i%6], roughness:0.8}), RND(x0,x1), RND(z0,z1), 6); p.position.y=(y||0.3)+0.17; g.add(p); } }
function cable(g,x1,y1,z1,x2,y2,z2,sag,mat){ const N=8; let px=x1,py=y1,pz=z1; for(let i=1;i<=N;i++){ const u=i/N; const x=x1+(x2-x1)*u, z=z1+(z2-z1)*u, y=y1+(y2-y1)*u-Math.sin(Math.PI*u)*sag; g.add(beam(px,py,pz,x,y,z,mat,0.03)); px=x; py=y; pz=z; } }
function blink(mat){ ANIM.push(t=>{ mat.color.setHex(Math.sin(t*2.4)>0?0xff3333:0x551111); }); return mat; }
function inPoly(x,z,poly){ let inside=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const xi=poly[i][0],zi=poly[i][1],xj=poly[j][0],zj=poly[j][1]; if(((zi>z)!==(zj>z)) && (x < (xj-xi)*(z-zi)/(zj-zi)+xi)) inside=!inside; } return inside; }

// 景点数据：x 向东，z 向南（北在 -z）
function castleStoneTex(){ const t=cnv(256,256,(g)=>{ g.fillStyle='#c3cad4'; g.fillRect(0,0,256,256);
  for(let y=0;y<8;y++) for(let x=0;x<4;x++){ const ox=(y%2)*32; g.fillStyle=['#bcc4cf','#c9d0da','#b4bdc9'][HASH(x*3.7+y*9.1)*3|0]; g.fillRect(x*64+ox-32, y*32, 62, 30); }
  g.strokeStyle='rgba(90,100,115,0.5)'; g.lineWidth=2; for(let y=0;y<=8;y++){ g.beginPath(); g.moveTo(0,y*32); g.lineTo(256,y*32); g.stroke(); }
  for(let i=0;i<500;i++){ g.fillStyle=Math.random()>0.5?'rgba(255,255,255,0.05)':'rgba(40,50,66,0.05)'; g.fillRect(Math.random()*256, Math.random()*256, 3, 3); } });
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; }
function disneyTex(){ const t=cnv(1024,828,(g)=>{ const SX=1024/26, SZ=828/21; const X=v=>(v+13)*SX, Z=v=>(v+10.5)*SZ;
  g.fillStyle='#5d7d4a'; g.fillRect(0,0,1024,828);
  for(let i=0;i<70;i++){ g.fillStyle=i%2?'#54743f':'#678a50'; g.fillRect(0, i*12, 1024, 6); }
  for(let i=0;i<2600;i++){ g.fillStyle=Math.random()>0.5?'rgba(255,255,255,0.04)':'rgba(20,40,16,0.07)'; g.fillRect(Math.random()*1024, Math.random()*828, 3, 3); }
  g.fillStyle='rgba(214,186,140,0.5)'; g.beginPath(); g.ellipse(X(6.2), Z(-3.8), 200, 150, 0, 0, 7); g.fill();
  g.fillStyle='rgba(168,175,182,0.9)'; g.beginPath(); g.ellipse(X(6.8), Z(3.2), 215, 165, 0, 0, 7); g.fill();
  g.strokeStyle='#79a9cf'; g.lineWidth=54; g.lineCap='round'; g.beginPath(); g.moveTo(X(-10.6), Z(9.8)); g.bezierCurveTo(X(-11.2), Z(3), X(-10.8), Z(-1), X(-9.6), Z(-5.2)); g.bezierCurveTo(X(-8.6), Z(-8.6), X(-4), Z(-9.6), X(1), Z(-9.8)); g.stroke();
  g.strokeStyle='#8fb9dc'; g.lineWidth=38; g.beginPath(); g.moveTo(X(-10.6), Z(9.8)); g.bezierCurveTo(X(-11.2), Z(3), X(-10.8), Z(-1), X(-9.6), Z(-5.2)); g.bezierCurveTo(X(-8.6), Z(-8.6), X(-4), Z(-9.6), X(1), Z(-9.8)); g.stroke();
  g.strokeStyle='#d3bd93'; g.lineWidth=34; g.lineCap='round';
  [[0,8.6,0,2.6],[0,1.8,-6.2,2.2],[0,1.8,6.8,3.4],[0,1.8,-6.6,-3.6],[0,1.8,6.4,-4.2]].forEach(([x0,z0,x1,z1])=>{ g.beginPath(); g.moveTo(X(x0),Z(z0)); g.lineTo(X(x1),Z(z1)); g.stroke(); });
  g.fillStyle='#d3bd93'; g.beginPath(); g.arc(X(0), Z(1.8), 100, 0, 7); g.fill();
  g.fillRect(X(-2.6), Z(8.2), X(2.6)-X(-2.6), Z(10.5)-Z(8.2));
  g.strokeStyle='rgba(120,90,50,0.35)'; g.lineWidth=3; g.beginPath(); g.arc(X(0), Z(1.8), 100, 0, 7); g.stroke(); });
  t.colorSpace=THREE.SRGBColorSpace; return t; }
function lanternTex(){ const t=cnv(256,256,(g)=>{ g.fillStyle='#c22424'; g.fillRect(0,0,256,256);
  for(let x=0;x<256;x+=16){ g.fillStyle='rgba(120,10,10,0.35)'; g.fillRect(x,0,3,256); g.fillStyle='rgba(255,120,110,0.20)'; g.fillRect(x+4,0,3,256); }
  g.fillStyle='#1c1c20'; g.fillRect(0,0,256,26); g.fillRect(0,230,256,26);
  g.fillStyle='#c8a24a'; g.fillRect(0,26,256,5); g.fillRect(0,225,256,5); });
  t.colorSpace=THREE.SRGBColorSpace; return t; }
function sensoGroundTex(){ const t=cnv(768,912,(g)=>{ const SX=768/13, SZ=912/15.5; const X=v=>(v+6.5)*SX, Z=v=>(v+7.75)*SZ;
  g.fillStyle='#a49a86'; g.fillRect(0,0,768,912);
  for(let y=0;y<15;y++) for(let x=0;x<13;x++){ g.fillStyle=(x+y)%2?'#9d927c':'#aaa088'; g.fillRect(x*SX+2, y*SZ+2, SX-4, SZ-4); }
  for(let i=0;i<2200;i++){ g.fillStyle=Math.random()>0.5?'rgba(255,255,255,0.05)':'rgba(40,34,24,0.06)'; g.fillRect(Math.random()*768, Math.random()*912, 3, 3); }
  g.fillStyle='#b3a78d'; g.fillRect(X(-1.9), Z(-1.2), X(1.9)-X(-1.9), Z(7.75)-Z(-1.2));
  g.fillStyle='#b8ab90'; g.fillRect(X(-4.6), Z(-7.75), X(4.6)-X(-4.6), Z(-1.2)-Z(-7.75));
  g.fillStyle='rgba(90,80,60,0.5)'; for(let z=-7;z<7.6;z+=1.05){ g.fillRect(X(-1.9), Z(z), X(1.9)-X(-1.9), 2); } });
  t.colorSpace=THREE.SRGBColorSpace; return t; }
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
  const core=cyl(0.52,1.05,H-0.4, std({color:0xcdd9e2,roughness:0.4,metalness:0.1,transparent:true,opacity:0.13})); core.position.y=0.4+(H-0.4)/2; hi.add(core);
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
  g.add(box(4.6,1.5,2.2, texMat(facadeTex('#e3ddd2')), -3.6,0.75,3.6));
  g.add(box(4.6,1.5,2.2, texMat(facadeTex('#ddd6e6')), 3.6,0.75,3.6));
  g.add(box(3.4,0.8,0.16, glowMat(signTex('東京ソラマチ','#7c3aed','#ffffff',false)), -3.6,1.05,4.76));
  g.add(box(3.4,0.8,0.16, glowMat(signTex('TOKYO Solamachi','#0c4a6e','#ffffff',false)), 3.6,1.05,4.76));
  const plDome=sph(0.95, std({color:0x2f3b4c,roughness:0.35,metalness:0.4}), 3.6,0,2.9); plDome.scale.y=0.6; plDome.position.y=1.55; g.add(plDome);
  g.add(box(3.2,0.9,1.6, texMat(facadeTex('#c9d1d9')), 0,0.45,5.6));
  g.add(box(2.2,0.55,0.14, glowMat(signTex('押上駅','#334155','#ffffff',false)), 0,0.6,6.44));
  g.add(tree(3.4,4.4,0.9)); g.add(tree(-3.6,4.2,0.8)); g.add(tree(4.2,-3.4,0.85)); } },
 {id:'sensoji', name:'浅草寺', x:13, z:-19, h:8, desc:'东京最古老的寺庙：先穿过挂着大红灯笼的雷门，沿仲见世商店街走到宝藏门和本堂，五重塔立在本堂西南侧，适合穿和服慢慢逛。', make:g=>{ const roofT=texMat(kawaraTex()); const stone=std({color:0xcfc4a5,roughness:1}); const redM=std({color:0xb02a1e,roughness:0.5}); const darkWood=std({color:0x4a3421,roughness:0.9});
g.add(box(13.6,0.28,16.1, std({color:0x8a8069,roughness:1}), 0,0.14,0.3));
const gnd=new THREE.Mesh(new THREE.PlaneGeometry(13,15.5), texMat(sensoGroundTex(),{roughness:1})); gnd.rotation.x=-Math.PI/2; gnd.position.set(0,0.3,0.3); g.add(gnd);
function lantern(r,h){ const pts=[]; [[0.03,0],[0.34,0.03],[0.55,0.2],[0.64,0.48],[0.6,0.75],[0.36,0.93],[0.03,0.97]].forEach(([px,py])=>pts.push(new THREE.Vector2(px*r/0.64, py*h/0.97))); const m=new THREE.Mesh(new THREE.LatheGeometry(pts,18), texMat(lanternTex(),{roughness:0.6})); return m; }
function slan(x,z){ const gr=new THREE.Group(); gr.position.set(x,0.3,z); gr.add(cyl(0.05,0.07,0.85, stone, 0,0,8)); gr.add(box(0.24,0.26,0.24, stone, 0,1.0,0)); gr.add(cone(0.24,0.2, stone, 0,0,4,1.24)); g.add(gr); }
// ===== Kaminarimon =====
const km=new THREE.Group(); km.position.set(0,0.3,6.1); g.add(km);
[-1.55,1.55].forEach(x=>{ [-0.55,0.55].forEach(z=>km.add(cyl(0.21,0.25,3.0, redM, x,z,10))); });
km.add(box(4.6,0.34,1.7, redM, 0,2.35,0)); km.add(box(4.6,0.3,1.7, redM, 0,3.0,0));
[-1.55,-0.5,0.5,1.55].forEach(x=>km.add(box(0.34,0.3,1.5, redM, x,2.68,0)));
km.add(hipRoof(5.6,1.0,2.6, roofT, 0,3.15,0));
km.add(box(1.5,0.24,0.34, M.gold, 0,4.32,0));
const kmLan=lantern(1.0,1.55); kmLan.position.y=0.55; km.add(kmLan);
km.add(cyl(0.3,0.3,0.1, M.gold, 0,0,14)).children;
const kmBase=km.children[km.children.length-1]; kmBase.position.y=0.5;
km.add(box(1.7,0.5,0.14, glowMat(signTex('風雷神門','#1f2937','#fbbf24',false)), 0,2.68,0.92));
[-2.35,2.35].forEach((x,i)=>{ km.add(box(0.85,1.7,0.9, redM, x,0.85,0)); km.add(box(0.6,1.05,0.14, i?std({color:0x3f6212,roughness:0.7}):std({color:0x9e2b25,roughness:0.7}), x,0.95,0.5)); const hd=sph(0.17, std({color:0xd9b38c,roughness:0.7}), x,1.85,0.5); km.add(hd); });
// ===== Nakamise =====
const shopNames=['人形焼','雷おこし','せんべい','扇子','風鈴','手ぬぐい','浴衣'];
const shopTones=['#efe6d0','#e8dcc8','#dfe3e6','#efe0ce','#e6d5c0','#eef0e9','#ead9c2'];
for(let i=0;i<7;i++){ [-1,1].forEach(sd=>{ const sz2=4.35-i*0.78, sh=1.12+HASH(i*3.7+sd*1.3)*0.3;
  g.add(box(1.35,sh,0.68, texMat(facadeTex(shopTones[(i+(sd>0?2:0))%7])), sd*2.15,sh/2+0.3,sz2));
  const rf=box(1.5,0.06,0.95, roofT, sd*2.15,sh+0.42,sz2); rf.rotation.z=sd*-0.13; g.add(rf);
  g.add(box(0.95,0.42,0.05, M.glass, sd*1.78,0.62,sz2));
  g.add(box(0.8,0.3,0.04, std({color:[0x9e2b25,0x1e3a5f,0x7c3aed,0x0f766e][(i+(sd>0?1:0))%4],roughness:0.85}), sd*1.76,1.02,sz2));
  g.add(box(1.05,0.4,0.1, glowMat(signTex(shopNames[(i+(sd>0?3:0))%7],'#374151','#ffffff',false)), sd*2.15,sh+0.08,sz2-sd*0));
  if(i%2===0){ const sl=lantern(0.16,0.3); sl.position.set(sd*1.7,1.05,sz2+0.3); g.add(sl); }
}); }
people(g,12,-0.8,0.8,0.2,4.4,0.32);
// ===== Hozomon =====
const hz=new THREE.Group(); hz.position.set(0,0.3,-1.7); g.add(hz);
[-2.0,2.0].forEach(x=>hz.add(cyl(0.27,0.32,2.9, redM, x,0,10)));
hz.add(box(5.6,0.5,1.9, redM, 0,1.35,0));
hz.add(box(5.6,1.15,1.7, std({color:0x8e241a,roughness:0.6}), 0,2.15,0));
hz.add(box(5.7,0.35,2.0, M.white, 0,2.85,0));
hz.add(hipRoof(6.6,1.15,3.0, roofT, 0,3.0,0));
hz.add(hipRoof(5.9,0.5,2.4, roofT, 0,2.35,-0.2));
const hzLan=lantern(0.72,1.1); hzLan.position.y=0.35; hz.add(hzLan);
[-2.85,2.85].forEach(x=>{ hz.add(box(0.8,1.6,0.8, redM, x,0.8,0)); hz.add(box(0.52,1.0,0.12, std({color:0x6b5a2e,roughness:0.65,metalness:0.3}), x,0.95,0.46)); });
const waraji=tor(0.55,0.17, std({color:0xc9a86a,roughness:1}), 1.9,1.5,-1.02); waraji.scale.y=1.35; hz.add(waraji);
// ===== Plaza + jokoro + temizuya =====
const jk=new THREE.Group(); jk.position.set(0,0.3,-3.3); g.add(jk);
jk.add(cyl(0.44,0.5,0.62, std({color:0x5c5148,roughness:0.45,metalness:0.55}), 0,0,14));
jk.add(cyl(0.56,0.56,0.1, std({color:0x4a423a,roughness:0.5,metalness:0.5}), 0,0,14)).children;
jk.children[jk.children.length-1].position.y=0.85;
jk.add(cone(0.5,0.3, std({color:0x4a423a,roughness:0.5,metalness:0.5}), 0,0,12,1.05));
const smokeM=std({color:0xe8ecf0,roughness:1,transparent:true,opacity:0.3});
const smokes=[];
[0,1,2].forEach(i=>{ const sm=sph(0.16+i*0.05, smokeM, (i-1)*0.1, 1.35+i*0.3, 0); jk.add(sm); smokes.push(sm); });
ANIM.push(t=>{ smokes.forEach((sm,i)=>{ sm.position.y=1.3+i*0.3+Math.sin(t*0.7+i*2.1)*0.07; sm.scale.setScalar(1+0.15*Math.sin(t*0.5+i)); }); });
const tm=new THREE.Group(); tm.position.set(3.3,0.3,-3.1); g.add(tm);
[-0.55,0.55].forEach(x=>{ [-0.45,0.45].forEach(z=>tm.add(cyl(0.05,0.05,1.05, darkWood, x,z,6))); });
tm.add(hipRoof(1.7,0.5,1.4, roofT, 0,1.05,0));
tm.add(box(1.15,0.3,0.8, stone, 0,0.32,0));
slan(-2.6,-2.6); slan(2.6,-2.6); slan(-2.6,-4.3); slan(2.6,-4.3); slan(-1.6,5.2); slan(1.6,5.2);
// ===== Hondo (main hall) =====
const hall=new THREE.Group(); hall.position.set(0,0.3,-5.5); g.add(hall);
hall.add(box(8.0,0.5,5.4, stone, 0,0.25,0));
[-2.2,0,2.2].forEach(sx=>hall.add(box(1.15,0.16,0.5, stone, sx,0.58,2.5)));
const twt=templeWallTex(); hall.add(box(6.9,2.1,3.9, texMat(twt,{bumpMap:twt,bumpScale:0.08}), 0,1.55,0));
hall.add(box(7.0,0.55,4.0, redM, 0,0.78,0));
[-2.7,-1.35,0,1.35,2.7].forEach(px=>hall.add(cyl(0.11,0.11,1.9, redM, px,1.85,8)));
hall.add(box(6.9,0.28,0.3, darkWood, 0,2.68,1.98));
const hrMain=hipRoof(8.6,1.85,5.6, roofT, 0,2.6,0); hall.add(hrMain);
hall.add(hipRoof(5.4,1.15,3.4, roofT, 0,4.3,0));
hall.add(box(2.4,0.26,0.3, M.gold, 0,5.55,0));
[-3.9,3.9].forEach(x=>{ const og=box(0.4,0.42,0.3, roofT, x,4.35,1.9); og.rotation.z=(x>0?-1:1)*0.4; hall.add(og); });
const hallLan=lantern(0.62,0.95); hallLan.position.set(0,1.15,2.15); hall.add(hallLan);
hall.add(box(1.6,0.45,0.12, glowMat(signTex('浅草寺','#7f1d1d','#ffd9a0',false)), 0,2.25,2.02));
[-3.3,3.3].forEach(rx=>{ for(let k=0;k<4;k++) hall.add(cyl(0.035,0.035,0.55, redM, rx,0.85,2.2-k*0.001)); });
// ===== Five-story pagoda (SW of hall) =====
const pg=new THREE.Group(); pg.position.set(-4.6,0.3,-3.6); g.add(pg);
pg.add(box(2.3,0.4,2.3, stone, 0,0.2,0));
let pw=1.62;
for(let i=0;i<5;i++){ const ty=0.4+i*1.28;
  pg.add(box(pw,0.92,pw, redM, 0,ty+0.46,0));
  pg.add(box(pw+0.14,0.16,pw+0.14, M.white, 0,ty+0.98,0));
  pg.add(hipRoof(pw+0.85,0.42,pw+0.85, roofT, 0,ty+1.02,0));
  pg.add(box(0.2,0.4,0.05, M.dark, 0,ty+0.5,pw/2+0.01));
  pw*=0.86; }
const sorin=cyl(0.03,0.05,1.5, M.gold, 0,0,8); sorin.position.y=7.55; pg.add(sorin);
[6.95,7.14,7.33,7.52,7.71].forEach(y=>pg.add(ring(0.17,y,M.gold)));
const jewel=sph(0.09, M.gold, 0,8.38,0); pg.add(jewel);
// ===== Perimeter walls + trees =====
[-5.9,5.9].forEach(wx=>{ g.add(box(0.22,1.0,10.5, M.white, wx,0.8,-0.9)); g.add(hipRoof(0.5,0.3,10.7, roofT, wx,1.3,-0.9)); });
g.add(tree(-5.2,-5.9,1.15, darkGreen)); g.add(tree(5.3,-5.6,1.05, darkGreen)); g.add(tree(-5.3,1.8,0.95, darkGreen)); g.add(tree(5.4,4.6,1.0));
people(g,8,-1,1,-2.2,-3.9,0.32); } },
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
  const pedM=std({color:0xb8b0a2,roughness:0.95}); [[-2.34,-2.34],[2.34,-2.34],[-2.34,2.34],[2.34,2.34]].forEach(([fx,fz])=>g.add(box(0.85,0.55,0.85, pedM, fx,0.27,fz)));
  g.add(box(3.9,1.5,3.1, texMat(facadeTex('#e6dfd2')), 0,0.75,0));
  g.add(box(4.1,0.18,3.3, std({color:0x8a4a34,roughness:0.8}), 0,1.58,0));
  g.add(box(3.9,0.5,0.06, new THREE.MeshBasicMaterial({color:0x9fc6dd}), 0,0.95,1.58));
  const deckGlass=texMat(glassTex('#aebfca')); deckGlass.emissive=new THREE.Color(0x000000);
  const md=new THREE.Group(); md.position.y=6.5; g.add(md);
  md.add(box(2.7,0.26,2.7, tW, 0,-0.58,0));
  md.add(box(2.55,1.0,2.55, deckGlass, 0,0,0));
  md.add(box(2.75,0.2,2.75, tO, 0,0.62,0));
  const td=cyl(0.8,0.87,0.8, deckGlass, 0,0, 20); td.position.y=10.95; g.add(td);
  const tdr=cyl(0.9,0.9,0.13, tO); tdr.position.y=11.4; g.add(tdr);
  // Top Deck 以上：格构继续收分至约 290m（13.2）成小截面塔尖段，再接天线桅杆
  const upBase=11.35, upTop=13.2, UL=6, upCols=[tO,tO,tW,tO,tW,tO];
  const upHW=t=>0.115+(0.44-0.115)*Math.pow(1-t,1.15);
  for(let l=0;l<UL;l++){ const t0=l/UL, t1=(l+1)/UL, y0=upBase+(upTop-upBase)*t0, y1=upBase+(upTop-upBase)*t1, m=upCols[l], w0=upHW(t0), w1=upHW(t1), lr=0.05-l*0.0035;
    for(let sx of [-1,1]) for(let sz of [-1,1]) g.add(beam(sx*w0,y0,sz*w0, sx*w1,y1,sz*w1, m, lr));
    for(let sgn of [-1,1]){
      g.add(beam(-w0,y0,sgn*w0, w1,y1,sgn*w1, m, 0.02)); g.add(beam(w0,y0,sgn*w0, -w1,y1,sgn*w1, m, 0.02));
      g.add(beam(sgn*w0,y0,-w0, sgn*w1,y1,w1, m, 0.02)); g.add(beam(sgn*w0,y0,w0, sgn*w1,y1,-w1, m, 0.02));
    }
    g.add(beam(-w1,y1,-w1, w1,y1,-w1, m, 0.03)); g.add(beam(-w1,y1,w1, w1,y1,w1, m, 0.03)); g.add(beam(-w1,y1,-w1, -w1,y1,w1, m, 0.03)); g.add(beam(w1,y1,-w1, w1,y1,w1, m, 0.03));
  }
  g.add(beam(0,upBase,0, 0,upTop,0, tO, 0.028));
  const upCap=cyl(0.30,0.34,0.1, tO); upCap.position.y=upTop+0.05; g.add(upCap);
  const mast1=cyl(0.055,0.078,0.85, tO); mast1.position.y=13.72; g.add(mast1);
  const ring1=cyl(0.17,0.17,0.045, tW); ring1.position.y=13.95; g.add(ring1);
  const col1=cyl(0.10,0.10,0.07, tW); col1.position.y=14.14; g.add(col1);
  g.add(beam(-0.27,14.2,0, 0.27,14.2,0, tO, 0.018));
  const mast2=cyl(0.028,0.052,0.8, tW); mast2.position.y=14.52; g.add(mast2);
  const ring2=cyl(0.13,0.13,0.04, tO); ring2.position.y=14.48; g.add(ring2);
  g.add(beam(0,14.66,-0.2, 0,14.66,0.2, tW, 0.015));
  const tip=cyl(0.006,0.02,0.3, tO); tip.position.y=14.97; g.add(tip);
  const bc=sph(0.12, new THREE.MeshBasicMaterial({color:0xff2222}), 0,15.05,0); g.add(bc);
  const zj=new THREE.Group(); zj.position.set(4.3,0.3,3.7); zj.rotation.y=-0.35; g.add(zj);
  zj.add(box(2.5,1.5,1.6, M.white, 0,0.75,-1.1)); zj.add(hipRoof(3.0,1.0,2.1, texMat(kawaraTex()), 0,1.5,-1.1));
  [-0.85,0.85].forEach(px=>zj.add(box(0.2,1.6,0.2, std({color:0x7a4a2e,roughness:0.8}), px,0.8,0.75)));
  zj.add(box(2.1,0.18,0.5, std({color:0x7a4a2e,roughness:0.8}), 0,1.05,0.75));
  zj.add(hipRoof(2.5,0.62,0.95, texMat(kawaraTex()), 0,1.62,0.75));
  zj.add(hipRoof(2.2,0.5,0.8, texMat(kawaraTex()), 0,2.28,0.75));
  zj.add(box(1.5,0.5,0.14, glowMat(signTex('増上寺','#7f1d1d','#ffffff',false)), 0,0.55,0.78));
  g.add(tree(2.6,5.2,1.0)); g.add(tree(5.9,1.9,0.9));
  ANIM.push(t=>{ const on=Math.sin(t*2.4)>0; bc.material.color.setHex(on?0xff2222:0x551111); });
  window.NIGHT_FNS=window.NIGHT_FNS||[]; NIGHT_FNS.push(n=>{ tO.emissive.setHex(n?0xa84800:0x000000); tO.emissiveIntensity=n?1.3:1; tW.emissive.setHex(n?0x7a4a16:0x000000); deckGlass.emissive.setHex(n?0x8a5a1e:0x000000); });
 } },
 {id:'shibuya', name:'涩谷十字路口', x:-19, z:11, h:7, desc:'世界闻名的全向十字路口，一次绿灯上千人同时过马路。对面圆柱形的 SHIBUYA 109 和满墙大屏幕，就是日剧里最常见的东京画面。', make:g=>{ g.add(box(13.5,0.3,11.5, texMat(shibuyaRoadTex(),{roughness:0.96}), 0,0.15,0));
const paveM=texMat(paveTex(),{roughness:1});
[[-4.25,-3.75],[4.25,-3.75],[-4.25,3.75]].forEach(([cx,cz])=>g.add(box(5.0,0.1,4.0, paveM, cx,0.33,cz)));
g.add(box(2.6,0.1,4.0, paveM, 3.05,0.33,3.75));
const rimW=std({color:0xe8edf0,roughness:0.5,metalness:0.3});
const qf=box(3.4,6.4,2.8, texMat(glassTex('#86a8c4')), 2.75,3.2,-3.1); g.add(qf);
const curveScr=new THREE.Mesh(new THREE.CylinderGeometry(2.28,2.28,2.7,18,1,true,Math.PI*1.58,Math.PI*0.35), glowMat(screenTex(['渋谷','SHIBUYA CROSSING']))); curveScr.position.set(2.75,4.6,-3.1); g.add(curveScr);
g.add(box(0.16,2.2,2.0, glowMat(screenTex(['LIVE','109前'])), 0.97,4.6,-3.1));
g.add(box(2.2,0.7,0.16, glowMat(signTex('TSUTAYA','#1d4ed8','#ffffff',false)), 2.75,1.5,-1.62));
const sq=box(2.3,11.5,2.3, texMat(glassTex('#7fa8cc')), 5.6,5.75,-3.5); g.add(sq);
[1.7,3.35,5.0,6.65,8.3,9.95].forEach(y=>g.add(box(2.42,0.1,2.42, rimW, 5.6,y,-3.5)));
g.add(box(2.5,0.35,2.5, M.dark, 5.6,11.68,-3.5));
g.add(box(2.3,0.5,0.07, M.dark, 5.6,12.05,-4.68)); g.add(box(2.3,0.5,0.07, M.dark, 5.6,12.05,-2.32)); g.add(box(0.07,0.5,2.3, M.dark, 4.42,12.05,-3.5)); g.add(box(0.07,0.5,2.3, M.dark, 6.78,12.05,-3.5));
g.add(box(1.8,0.85,0.16, glowMat(signTex('SHIBUYA SKY','#0ea5e9','#ffffff',false)), 5.6,10.6,-2.3));
g.add(box(2.6,5.2,2.4, texMat(facadeTex('#a7b0ba')), -5.2,2.6,-3.9));
g.add(box(0.18,3.4,1.1, glowMat(signTex('センター街','#dc2626')), -3.86,3,-3.9));
g.add(box(2.2,4.2,2.2, texMat(glassTex('#8fb8d8')), -2.9,2.1,-4.4));
g.add(box(1.9,1.5,0.16, glowMat(screenTex(['SALE','LIVE'])), -2.9,3.1,-3.26));
const c109=cyl(1.55,1.55,5.8, texMat(facadeTex('#d8cfc0')), -4.7,3.3, 20); g.add(c109);
const c109c=cyl(1.18,1.52,0.55, std({color:0xb9c0c7,roughness:0.4,metalness:0.5}), -4.7,3.3,20); c109c.position.y=6.05; g.add(c109c);
const can109=box(1.7,0.09,1.0, M.dark, -3.6,1.15,2.25); can109.rotation.y=-Math.PI/4; g.add(can109);
g.add(box(2.0,3.2,2.0, texMat(facadeTex('#98a2ac')), -2.45,1.6,4.3));
g.add(box(1.8,1.3,0.14, glowMat(screenTex(['MAGNET','MUSIC'])), -2.45,2.5,3.26));
g.add(box(3.0,4.6,1.8, texMat(facadeTex('#b9c2cc')), 3.1,2.3,0.9));
g.add(box(2.0,0.7,0.16, glowMat(signTex('MARK CITY','#334155','#ffffff',false)), 3.1,4.2,1.85));
g.add(box(2.0,3.4,3.0, texMat(facadeTex('#c9cfd6')), 5.6,1.7,1.7));
g.add(box(2.2,0.22,3.2, M.dark, 5.6,3.5,1.7));
g.add(box(0.14,0.7,2.2, glowMat(signTex('渋谷駅','#16a34a','#ffffff',false)), 4.55,2.6,1.7));
g.add(box(1.7,5.5,1.9, texMat(glassTex('#9cc0d8')), 5.85,2.75,4.65));
g.add(box(1.5,0.7,0.14, glowMat(signTex('STREAM','#0284c7','#ffffff',false)), 5.85,4.9,5.66));
const hachi=new THREE.Group(); hachi.position.set(2.75,0.38,2.75); hachi.rotation.y=-0.7; g.add(hachi);
const bronze=std({color:0x7a5c33,roughness:0.55,metalness:0.5});
hachi.add(box(0.55,0.42,0.55, std({color:0x8b8f94,roughness:1}), 0,0.21,0));
hachi.add(box(0.36,0.2,0.17, bronze, 0,0.55,0)); const hd=box(0.15,0.17,0.15, bronze, 0.2,0.68,0); hd.rotation.z=-0.35; hachi.add(hd);
hachi.add(box(0.05,0.22,0.05, bronze, -0.22,0.6,0));
const tram=new THREE.Group(); tram.position.set(4.15,0.38,4.75); tram.rotation.y=0.5; g.add(tram);
tram.add(box(1.9,0.8,0.8, std({color:0x3f7a4e,roughness:0.6}), 0,0.48,0)); tram.add(box(1.92,0.28,0.82, M.glass, 0,0.72,0)); tram.add(box(1.7,0.16,0.7, std({color:0xd8d3c3,roughness:0.7}), 0,0.98,0));
[[-1.95,-1.95],[1.95,-1.95],[-1.95,1.95],[1.95,1.95]].forEach(([sx,sz])=>{ const sg=new THREE.Group(); sg.position.set(sx,0.3,sz); sg.add(cyl(0.045,0.045,1.7,M.dark,0,0,6)); const hd2=box(0.17,0.46,0.17, M.dark, 0,0,0); hd2.position.y=1.85; sg.add(hd2); [[0xff2222,2.0],[0xffaa00,1.85],[0x22cc55,1.7]].forEach(([cc,yy])=>{ const lm=sph(0.05, new THREE.MeshBasicMaterial({color:cc}), 0,yy,0); sg.add(lm); });
  const pb=box(0.15,0.34,0.15, M.dark, 0,0,0); pb.position.set(-sx*0.14,1.05,-sz*0.14); sg.add(pb);
  const pm=sph(0.04, new THREE.MeshBasicMaterial({color:0x2bff70}), -sx*0.14,0.98,-sz*0.14); sg.add(pm);
  const pr=sph(0.04, new THREE.MeshBasicMaterial({color:0x551111}), -sx*0.14,1.13,-sz*0.14); sg.add(pr);
  g.add(sg); });
const car1=new THREE.Group(); car1.position.set(-0.8,0.3,-3.85); car1.add(box(0.62,0.3,1.35, std({color:0xd8d8d8,roughness:0.4,metalness:0.3}), 0,0.28,0)); car1.add(box(0.55,0.26,0.7, M.glass, 0,0.55,-0.05)); g.add(car1);
const car2=new THREE.Group(); car2.position.set(-3.85,0.3,0.8); car2.rotation.y=Math.PI/2; car2.add(box(0.62,0.3,1.35, std({color:0x334155,roughness:0.4,metalness:0.3}), 0,0.28,0)); car2.add(box(0.55,0.26,0.7, M.glass, 0,0.55,-0.05)); g.add(car2);
g.add(box(9.5,0.35,1.2,M.grey,1.8,3.05,5.3));
[-0.5,2.8,6.1].forEach(x=>g.add(box(0.35,3,0.35,M.grey,x,1.5,5.3)));
const tr=new THREE.Group(); [-1.7,0,1.7].forEach(ox=>{ tr.add(box(1.55,0.6,0.72,M.white,ox,0,0)); }); tr.add(box(5.2,0.18,0.74, std({color:0x84cc16,roughness:0.6}), 0,0.05,0)); tr.position.set(0,3.55,5.3); g.add(tr);
ANIM.push(t=>{ tr.position.x=((t*1.1)%17)-8.5; });
g.add(tree(2.1,4.9,0.95)); g.add(tree(4.35,2.05,0.9));
g.add(box(2.2,3.0,2.2, texMat(glassTex('#93b4cf')), 5.65,1.5,-3.5));
const slant=box(2.5,0.9,2.5, texMat(glassTex('#7fa8cc')), 5.6,12.3,-3.5); slant.rotation.z=0.1; g.add(slant);
const d109=new THREE.Group(); d109.position.set(-3.72,6.05,2.32); d109.rotation.y=-Math.PI/4; g.add(d109);
const disc=cyl(0.58,0.58,0.13, M.white, 0,0,24); disc.rotation.x=Math.PI/2; d109.add(disc);
const disc2=cyl(0.43,0.43,0.15, std({color:0xe11d63,roughness:0.5}), 0,0,24); disc2.rotation.x=Math.PI/2; d109.add(disc2);
g.add(box(2.4,5.6,1.1, texMat(facadeTex('#8b98a5')), 3.0,2.8,-5.15));
const adMat=glowMat(screenTex(['AD','渋谷'])); g.add(box(2.0,1.6,0.14, adMat, 3.0,3.6,-4.56));
ANIM.push(t=>{ adMat.color.setHSL((t*0.045)%1, 0.45, 0.72); });
g.add(box(0.14,1.8,1.6, glowMat(signTex('カラオケ','#7c3aed')), -1.5,2.2,4.3));
people(g,30,-1.5,1.5,-1.5,1.5,0.32);
people(g,10,-4.6,4.4,2.0,5.2,0.4); } },
 {id:'shinjuku', name:'新宿', x:-17, z:-3, h:9, desc:'东京最大的交通枢纽。西口的蚕茧塔（Cocoon Tower）和双塔造型的东京都厅是这里最认得出的两栋楼，东口则是百货和居酒屋街。', make:g=>{ g.add(box(13,0.3,10.5, texMat(paveTex(),{roughness:1}), 0,0.15,0));
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
g.add(govTower(1.3)); g.add(govTower(4.9));
g.add(box(4.6,1,3, texMat(glassTex('#a9c4da')), 3,0.5,1.6));
g.add(box(2.4,6.2,2.4, texMat(facadeTex('#c3ccd4')), -5.2,3.1,1.8));
g.add(box(2.2,5,2.2, texMat(glassTex('#93b4cf')), 5.3,2.5,1.2));
g.add(box(8.6,1.3,2.6, texMat(facadeTex('#9aa7b4')), -0.6,0.65,4.3));
g.add(box(2.2,0.7,0.16, glowMat(signTex('新宿駅','#0ea5e9','#ffffff',false)), -0.6,1.15,5.68));
const plaza=cyl(2.1,2.1,0.12, std({color:0xd8cfb8,roughness:1}), 3,3.6, 24); plaza.position.y=0.36; g.add(plaza);
g.add(tree(0.6,3.4,0.9)); g.add(tree(5.4,3.2,0.9)); g.add(tree(-5.8,-3.6,1)); people(g,8,-2.5,1,-0.5,2.5,0.3); } },
 {id:'akiba', name:'秋叶原', x:8, z:-11, h:7, desc:'电器、动漫和游戏文化的中心，中央大街两边全是挂满彩色招牌的高楼、电玩店和扭蛋机，周日下午会变成步行街。', make:g=>{ g.add(box(11.5,0.3,12, texMat(paveTex(),{roughness:1}), 0,0.15,0));
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
g.add(box(8.2,0.07,3.4, texMat(paveTex(),{roughness:1}), 0,0.34,0.6));
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
 {id:'toudai', name:'东京大学', x:0, z:0, h:6, desc:'日本第一所国立大学，本乡校区的赤门、安田讲堂与银杏大道是东京最有书卷气的风景，校园可自由参观。', make:g=>{ g.add(box(11.5,0.3,10, texMat(paveTex(),{roughness:1}), 0,0.15,0));
g.add(box(2,0.34,9.6,M.dark,0,0.17,0));
const stone=texMat(facadeTex('#cfc4ae')); const ginkgo=std({color:0xd9a92e,roughness:0.9});
const ydTex=yasudaTex(); const ydBrick=texMat(ydTex,{bumpMap:ydTex, bumpScale:0.12}); const ydWing=texMat(facadeTex('#7d4030')); const ydStone=std({color:0xcfc4ae,roughness:0.9});
const yd=new THREE.Group(); yd.position.set(0,0.3,-3.2); g.add(yd);
yd.add(box(4.8,1.8,2.5, ydBrick, 0,0.9,-0.4));
yd.add(cyl(1.3,1.3,1.8, ydBrick, 0,-1.6,20));
yd.add(box(4.9,0.1,2.6, ydStone, 0,1.85,-0.4));
yd.add(box(1.15,3.9,1.4, ydBrick, 0,1.95,0));
yd.add(hipRoof(4.95,0.85,2.65, std({color:0x3a4149,roughness:0.85}), 0,1.9,-0.4));
yd.add(cone(0.9,1.6, std({color:0x3a4149,roughness:0.8}), 0,0,8,4.7));
const fin=cyl(0.03,0.03,0.34, M.gold, 0,0,6); fin.position.y=5.5; yd.add(fin); yd.add(sph(0.06, M.gold, 0,5.72,0));
yd.add(box(0.52,0.52,0.08, texMat(clockTex()), 0,3.3,0.74));
yd.add(box(0.52,0.52,0.08, texMat(clockTex()), 0,3.3,-0.74));
yd.add(box(0.08,0.52,0.52, texMat(clockTex()), 0.6,3.3,0));
yd.add(box(0.08,0.52,0.52, texMat(clockTex()), -0.6,3.3,0));
yd.add(box(0.34,1.05,0.05, M.glass, 0,2.35,0.72));
[[-0.52,-0.62],[0.52,-0.62],[-0.52,0.62],[0.52,0.62]].forEach(([tx,tz])=>{ const tt=cyl(0.09,0.1,0.72, ydBrick, tx,tz,8); tt.position.y=3.86; yd.add(tt); yd.add(cone(0.14,0.32, M.roof, tx,tz,8,4.36)); });
[-1.92,-0.96,0,0.96,1.92].forEach(wx=>{ yd.add(box(0.36,1.02,0.03, M.glass, wx,0.9,0.855)); yd.add(box(0.06,1.1,0.06, ydStone, wx-0.21,0.9,0.86)); yd.add(box(0.06,1.1,0.06, ydStone, wx+0.21,0.9,0.86)); yd.add(box(0.48,0.08,0.06, ydStone, wx,1.47,0.86)); yd.add(box(0.5,0.06,0.1, ydStone, wx,0.36,0.86)); });
[-2.32,-1.55,-0.78,0.78,1.55,2.32].forEach(bx=>{ yd.add(box(0.16,2.0,0.14, ydBrick, bx,1.0,0.9)); yd.add(cone(0.1,0.36, ydStone, bx,0.9,4,2.16)); });
[-0.42,0.42].forEach(px=>yd.add(box(0.14,0.95,0.14, ydStone, px,0.48,1.35)));
yd.add(box(1.2,0.16,0.34, ydStone, 0,1.02,1.35));
yd.add(box(1.5,0.09,0.3, ydStone, 0,0.045,1.3)); yd.add(box(1.8,0.06,0.3, ydStone, 0,0.03,1.55));
yd.add(box(3.6,0.05,1.7, std({color:0xb9b2a2,roughness:1}), 0,0.025,1.9));
[-2.9,2.9].forEach(x=>yd.add(box(1.6,1.25,1.5, ydWing, x,0.62,0)));
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
// ===== UTokyo deep refine: Akamon walls, ginkgo avenue, Sanshiro pond, library =====
[-2.35,2.35].forEach(wx=>{ aka.add(box(2.2,1.25,0.24, M.white, wx,0.62,0)); aka.add(hipRoof(2.4,0.32,0.5, texMat(kawaraTex()), wx,1.25,0)); aka.add(box(0.5,1.5,0.1, redM, wx>0?-0.55:0.55,0.75,0.1)); });
g.add(box(1.7,0.05,8.6, std({color:0xcfc8b4,roughness:1}), 0,0.36,0.4));
[-2.6,-0.9,0.9,2.6].forEach(z=>{ g.add(sph(0.5, ginkgo, -1.7,0.38,z)); g.add(sph(0.5, ginkgo, 1.7,0.38,z)); });
const pd2=cyl(0.8,0.8,0.1, M.water, -4.5,1.8, 16); pd2.position.y=0.33; g.add(pd2);
const pd3=cyl(0.62,0.62,0.1, M.water, -3.4,3.2, 14); pd3.position.y=0.33; g.add(pd3);
g.add(sph(0.22, M.grey, -4.4,0.4,2.6)); g.add(sph(0.16, M.grey, -3.1,0.38,2.2));
const brg=new THREE.Group(); brg.position.set(-3.85,0.32,2.5); brg.rotation.y=0.7; g.add(brg);
[-0.3,0,0.3].forEach((ox,i)=>{ const seg=box(0.4,0.07,0.42, std({color:0x8a6844,roughness:1}), ox,0.16+Math.sin((i+0.5)/3*Math.PI)*0.14,0); seg.rotation.z=(i-1)*-0.42; brg.add(seg); });
[-2.32,2.32].forEach(sx=>{ [-0.85,0.85].forEach(sz=>yd.add(box(0.03,0.95,0.34, M.glass, sx,0.95,sz))); });
const libSpire=cone(0.34,1.1, std({color:0x3a4149,roughness:0.8}), -4,-3.1,8); libSpire.position.y=3.15; g.add(libSpire);
g.add(box(1.15,0.5,0.14, glowMat(signTex('総合図書館','#5b21b6','#ffffff',false)), -4,1.15,-2.12));
[-2.9,2.9].forEach(lx=>{ [-0.6,3.4].forEach(lz=>{ const lp=cyl(0.05,0.06,1.25, M.dark, lx,lz,6); lp.position.y=0.95; g.add(lp); g.add(sph(0.11, std({color:0xfff2c0,roughness:0.4}), lx,1.66,lz)); }); });
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
 {id:'tokyost', name:'东京站', x:4, z:0, h:6, desc:'红砖站舍是百年历史建筑：长长的红砖墙、白色腰线和中间的圆形穹顶是它的标志，也是新干线和成田特快 NEX 的核心枢纽。', make:g=>{ g.add(box(13,0.3,10.5, texMat(paveTex(),{roughness:1}), 0,0.15,0));
const bt=stationTex(); g.add(box(12.5,2.9,3.1, texMat(bt,{bumpMap:bt,bumpScale:0.1}), 0,1.45,-1.6));
const cream=std({color:0xf3e9dc,roughness:0.9});
g.add(box(12.7,0.16,3.3, cream, 0,1.02,-1.6)); g.add(box(12.7,0.16,3.3, cream, 0,2.52,-1.6));
const slate=std({color:0x51606e,roughness:0.8});
g.add(hipRoof(13.1,1.05,3.8,slate,0,2.9,-1.6));
[-5.6,5.6].forEach(x=>{ g.add(box(2.3,3.25,3.5, texMat(bt), x,1.62,-1.6)); g.add(hipRoof(2.7,0.8,3.9,slate,x,3.25,-1.6)); });
const domeM=std({color:0x7d9b8a,roughness:0.5,metalness:0.25});
function dome(x,r){ const drum=cyl(r*0.92,r*0.92,0.5,texMat(bt),x,-1.6,18); drum.position.y=3.8; g.add(drum); const d=sph(r, domeM, x, 4.05, -1.6, 1,0.85,1); g.add(d); const lant=cyl(r*0.16,r*0.2,0.42,domeM,x,-1.6,10); lant.position.y=4.05+r*0.85+0.1; g.add(lant); g.add(cone(0.07,0.5,M.gold,x,-1.6,6,4.55+r*0.85)); }
dome(0,1.3); dome(-4.4,0.85); dome(4.4,0.85);
g.add(box(11,0.26,3.6, texMat(paveTex(),{roughness:1}), 0,0.13,1.9));
g.add(box(9,0.28,1.1,M.dark,0,0.14,4.3));
for(let i=0;i<6;i++) g.add(box(0.9,0.3,0.14,M.white,-3.6+i*1.45,0.15,4.3));
[-5.2,-3.4,3.4,5.2].forEach(x=>g.add(tree(x,2,0.85)));
g.add(box(2.6,7.6,2.6, texMat(glassTex('#a9c8e2')), -4.9,3.8,-5.1));
g.add(box(2.8,8.4,2.8, texMat(glassTex('#8fb4d4')), 1.6,4.2,-5.2));
g.add(box(2.2,5.4,2.2, texMat(facadeTex('#e3e7ec')), 5.4,2.7,-5));
g.add(box(3.2,0.9,0.18, glowMat(signTex('東京駅','#991b1b','#ffffff',false)), 0,1.7,0.05));
const kitte=new THREE.Group(); kitte.position.set(-5.4,0,3.6); kitte.rotation.y=0.12; g.add(kitte);
kitte.add(box(2.3,6.6,2.3, texMat(facadeTex('#d8d2c4')), 0,3.3,0));
const kTop=box(2.35,1.1,2.35, texMat(facadeTex('#c9c2b2')), 0,7.05,0); kTop.rotation.z=0.13; kitte.add(kTop);
kitte.add(box(1.5,0.6,0.14, glowMat(signTex('KITTE','#7c2d12','#ffffff',false)), 0,1.2,1.2));
g.add(box(7.6,0.06,1.3, std({color:0xb9b2a2,roughness:1}), 0,0.33,3.9));
[-3.3,-1.1,1.1,3.3].forEach(tx=>g.add(tree(tx,3.9,0.95)));
g.add(box(9.6,0.14,1.1, M.dark, 0,0.42,-4.3));
[-3.4,3.4].forEach(cx=>g.add(box(3.6,0.1,1.5, std({color:0xd8d2c2,roughness:0.9}), cx,0.52,-4.3)));
const shk=new THREE.Group(); shk.position.set(0.6,0.5,-4.3); g.add(shk);
shk.add(box(3.6,0.62,0.85, M.white, 0,0.31,0));
shk.add(box(3.7,0.2,0.6, std({color:0x2563eb,roughness:0.5}), 0,0.2,0));
const shkNose=cone(0.42,1.1, M.white, 2.35,0,12); shkNose.rotation.z=-Math.PI/2; shkNose.position.y=0.31; shk.add(shkNose);
people(g,10,-4,4,1.2,2.8,0.3); } },
 {id:'meiji', name:'明治神宫', x:-14, z:3, h:6, desc:'藏在市中心森林里的神社，入口的大鸟居是它的标志。紧邻原宿却安静庄严，常能碰到日式婚礼队伍。', make:g=>{ g.add(box(12.5,0.3,10.5, std({color:0x5d8a54,roughness:1}), 0,0.15,0));
g.add(box(2.8,0.34,8.5, texMat(gravelTex(),{roughness:1}), 0,0.17,0.6));
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
 {id:'odaiba', name:'台场', x:13, z:22, h:7, desc:'东京湾人工岛：富士电视台大楼中间的大圆球、1:1 高达立像，还有横跨东京湾的彩虹大桥，夜景尤其漂亮。', make:g=>{ g.add(box(13.5,0.3,10.5, texMat(paveTex(),{roughness:1}), 0,0.15,0));
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
g.add(box(2.2,0.6,0.14, glowMat(signTex('DiverCity','#0ea5e9','#ffffff',false)), 3.3,1.5,3.02));
g.add(box(1.8,0.5,0.12, glowMat(signTex('フジテレビ','#dc2626','#ffffff',false)), -3.8,5.5,-1.44));
g.add(tree(-6,-4.2,0.85)); g.add(tree(0.5,-4.4,0.85)); g.add(tree(6.4,1.2,0.85)); people(g,7,-1.5,1.8,2.6,3.6,0.3); } },
 {id:'roppongi', name:'六本木', x:-8, z:6, h:9, desc:'美术馆、展望台和夜生活集中的区域。微微收分的森大厦是六本木之丘的主楼，顶层展望台可以远眺东京塔。', make:g=>{ g.add(box(12.5,0.3,10.5, texMat(paveTex(),{roughness:1}), 0,0.15,0));
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
 {id:'ikebukuro', name:'池袋', x:-14, z:-16, h:8, desc:'性价比高的住宿和购物区，东口的阳光城（Sunshine City）高塔是地标，里面有水族馆和展望台。', make:g=>{ g.add(box(12.5,0.3,10, texMat(paveTex(),{roughness:1}), 0,0.15,0));
g.add(box(7.2,1.6,2.6, texMat(facadeTex('#c9cfd6')), 0,0.8,-0.6));
g.add(box(7.4,0.18,2.8, M.dark, 0,1.7,-0.6));
g.add(box(2.6,0.8,0.16, glowMat(signTex('池袋駅','#16a34a','#ffffff',false)), 0,1.15,0.78));
g.add(box(3.2,3.6,2.4, texMat(facadeTex('#d8cfc0')), 2.6,1.8,-3.4));
g.add(box(2.2,0.8,0.16, glowMat(signTex('西武','#0e7490','#ffffff',false)), 2.6,3.2,-2.16));
g.add(box(3.2,3.4,2.4, texMat(facadeTex('#c9d4de')), -2.6,1.7,-3.4));
g.add(box(2.2,0.8,0.16, glowMat(signTex('東武','#b91c1c','#ffffff',false)), -2.6,3.0,-2.16));
const sgTex=glassTex('#a8c8e0'); sgTex.repeat.set(2,6);
g.add(box(2.7,8.8,2.7, texMat(sgTex), 4.1,4.4,-1.4));
g.add(box(2.85,0.5,2.85, M.dark, 4.1,8.55,-1.4));
g.add(box(2.2,1,2.2, texMat(facadeTex('#d5dbe1')), 4.1,9.3,-1.4));
const ibc=sph(0.1, new THREE.MeshBasicMaterial({color:0xff3333}), 4.1,10,-1.4); g.add(ibc); ANIM.push(t=>{ ibc.material.color.setHex(Math.sin(t*2.4+1.7)>0?0xff3333:0x551111); });
g.add(box(4.2,1.7,3.2, texMat(facadeTex('#e0d8c8')), 3.9,0.85,2.2));
g.add(box(3.4,0.85,0.16, glowMat(signTex('サンシャイン水族館','#0284c7','#ffffff',false)), 3.9,1.35,3.86));
g.add(box(2.2,5.4,2.2, texMat(facadeTex('#2f3b4c')), 5.9,2.7,-3.9));
g.add(box(2,0.8,0.16, glowMat(signTex('animate','#111827','#f9a8d4',false)), 5.9,4.9,-2.76));
g.add(box(0.16,3,0.9, glowMat(signTex('アニメ','#ec4899')), 4.78,3,-3.9));
for(let i=0;i<3;i++) g.add(box(0.16,1.9,0.9, glowMat(signTex(['乙女ロード','アニメ','コスメ'][i], ['#ec4899','#7c3aed','#f59e0b'][i])), 1.8,1.5,1.0+i*1.15));
g.add(box(3.4,2.2,2.6, texMat(facadeTex('#b8b0a2')), -3.7,1.1,1.9));
const atr=cyl(1.15,1.15,2.9, M.glass, -2.1,1.9,3); atr.rotation.y=Math.PI/6; g.add(atr);
g.add(box(3.2,0.5,0.16, glowMat(signTex('東京芸術劇場','#334155','#ffffff',false)), -3.7,2.5,3.24));
g.add(box(3.4,0.12,2.8, M.park, -3.5,0.36,4.2));
const ring=tor(0.8,0.05, M.gold, -3.5,0.45,4.2); ring.rotation.x=Math.PI/2; g.add(ring);
g.add(box(2.2,4.4,2.2, texMat(glassTex('#9fb6c9')), -5.0,2.2,-0.9));
g.add(tree(-4.9,3.3,1.1)); g.add(tree(-2.2,3.4,0.9));
g.add(sph(0.16, std({color:0x8b8f94,roughness:0.9}), 2.9,0.62,-0.5, 1,1.15,1)); g.add(sph(0.11, std({color:0x8b8f94,roughness:0.9}), 2.9,0.85,-0.5));
const bus=new THREE.Group(); bus.add(box(1.7,0.62,0.7,M.red,0,0.1,0)); bus.add(box(1.5,0.3,0.72, M.white, 0,0.5,0)); bus.position.set(0,0.35,4.6); g.add(bus);
ANIM.push(t=>{ const u=Math.sin(t*0.22)*4.4; bus.position.x=u; bus.rotation.y=Math.cos(t*0.22)>0?0:Math.PI; });
// ===== Ikebukuro deep refine: Sunshine City complex + station rail level + east density =====
g.add(box(2.0,6.6,2.1, texMat(facadeTex('#ddd6c8')), 6.6,3.3,1.3));
g.add(box(1.7,0.7,0.16, glowMat(signTex('プリンスホテル','#7c2d12','#ffffff',false)), 6.6,5.6,2.42));
g.add(box(2.6,3.1,2.3, texMat(facadeTex('#cfd6dd')), 6.2,1.55,-1.9));
g.add(box(2.2,0.75,0.16, glowMat(signTex('文化会館','#334155','#ffffff',false)), 6.2,2.6,-0.72));
const aqDome=sph(0.85, M.glass, 3.4,0,1.6); aqDome.scale.y=0.55; aqDome.position.y=2.15; g.add(aqDome);
g.add(box(3.3,2.9,2.3, texMat(facadeTex('#d8dde3')), 1.9,1.45,1.6));
g.add(box(2.4,0.85,0.16, glowMat(signTex('ビックカメラ','#b91c1c','#ffffff',false)), 1.9,2.2,2.82));
g.add(box(0.16,2.2,0.85, glowMat(signTex('カラオケ','#2563eb')), 3.62,1.7,1.4));
g.add(box(6.9,0.1,0.5, M.dark, 0,1.82,-1.15)); g.add(box(6.9,0.1,0.5, M.dark, 0,1.82,-0.15));
const trI=new THREE.Group(); [-1.9,0,1.9].forEach(oz=>{ trI.add(box(1.45,0.55,0.66, M.white, oz,0,0)); }); trI.add(box(4.9,0.14,0.68, std({color:0x80c241,roughness:0.6}), 0,0.36,0)); trI.position.set(0,1.9,-0.65); g.add(trI);
g.add(box(4.6,0.06,1.15, std({color:0x8f8a80,roughness:1}), 3.6,0.34,4.35));
[-0.2,2.2,4.6].forEach(lx=>{ const lp=cyl(0.045,0.045,1.5, M.dark, lx,4.35,6); g.add(lp); g.add(sph(0.09, std({color:0xfff2c0,roughness:0.4}), lx,1.62,4.35)); });
g.add(box(2.3,4.9,2.1, texMat(facadeTex('#d5dbe1')), -5.9,2.45,1.6));
g.add(box(1.8,0.7,0.16, glowMat(signTex('ホテルメトロポリタン','#1e3a5f','#ffffff',false)), -5.9,4.2,2.72));
people(g,10,-4.5,4.5,3.4,4.4,0.3); } },
 {id:'waseda', name:'早稻田大学', x:0, z:0, h:6, desc:'大隈重信创办的私立名校，大隈讲堂的钟塔、演剧博物馆与村上春树图书馆都在早稻田校区，校门外是热闹的学生街。', make:g=>{ g.add(box(11.5,0.3,10, texMat(paveTex(),{roughness:1}), 0,0.15,0));
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
 {id:'shinagawa', name:'品川', x:-9, z:19, h:6, desc:'京急线从羽田进城的第一大站，站前是成排的玻璃高楼酒店，换乘山手线和新干线都很方便。', make:g=>{ g.add(box(12.5,0.3,10, texMat(paveTex(),{roughness:1}), 0,0.15,0));
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
 {id:'ginza', name:'银座', x:6, z:5, h:7, desc:'东京最高档的购物区。四丁目路口的和光百货钟楼是银座的象征，周末中央大街会变成步行街。', make:g=>{ g.add(box(13,0.3,10.5, texMat(paveTex(),{roughness:1}), 0,0.15,0));
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
g.add(box(2.6,5.6,2.6, texMat(glassTex('#e8c39a')), 0.2,2.8,-4.3));
g.add(box(2.0,6.6,2.0, texMat(glassTex('#d7e6f2')), 5.5,3.3,-4.0));
g.add(box(0.16,3.2,0.9, glowMat(signTex('銀座','#1e3a5f')), 4.45,3.6,-4.0));
g.add(box(2.1,0.5,2.1, M.red, 5.5,6.85,-4.0));
g.add(box(2.2,0.8,0.16, glowMat(signTex('GINZA SIX','#111827','#fbbf24',false)), 0.2,4.6,-2.92));
g.add(box(2.4,3.4,2.2, texMat(facadeTex('#e5e0d2')), -5.3,1.7,-3.6));
for(let i=0;i<4;i++){ const lp=cyl(0.05,0.07,1.5,M.dark,-4.8+i*3.1,3.4,6); lp.position.y=1.05; g.add(lp); g.add(sph(0.12, std({color:0xfff2c0,roughness:0.4}), -4.8+i*3.1, 1.95, 3.4)); }
people(g,16,-5.5,5.5,2.6,4.2,0.32); } },
 {id:'harajuku', name:'原宿', x:-12, z:7, h:5, desc:'竹下通满是年轻潮流小店和可丽饼摊，一到周末就挤满人；明治通对面是 Laforet，车站旁是木格栅外立面的 WITH HARAJUKU，和旁边的明治神宫一动一静。', make:g=>{ g.add(box(12,0.3,11, texMat(paveTex(),{roughness:1}), 0,0.15,0.5));
g.add(box(1.5,2.3,5.6, texMat(facadeTex('#d8cfc0')), -4.9,1.15,-0.6));
g.add(box(1.7,0.16,5.8, M.dark, -4.9,2.38,-0.6));
g.add(box(0.35,0.1,5.8, std({color:0x4a4640,roughness:1}), -5.8,0.35,-0.6));
g.add(box(0.14,0.8,3.4, glowMat(signTex('原宿駅','#16a34a','#ffffff',false)), -4.08,1.7,-0.6));
g.add(box(2.2,0.07,3.2, texMat(paveTex(),{roughness:1}), -3.55,0.34,-0.5));
const wth=new THREE.Group(); wth.position.set(-2.95,0,-2.5); g.add(wth);
wth.add(box(2.4,3.1,2.0, texMat(glassTex('#a9c6de')), 0,1.55,0));
for(let i=0;i<7;i++) wth.add(box(2.44,0.09,0.06, std({color:0x8a6844,roughness:0.85}), 0,0.55+i*0.38,1.03));
wth.add(box(2.0,0.7,0.14, glowMat(signTex('WITH HARAJUKU','#7a4a21','#ffffff',false)), 0,2.9,1.05));
[[1.5,1.02],[1.85,1.85],[2.2,2.68]].forEach(([tx,ty],i)=>{ wth.add(box(1.5-i*0.25,0.16,1.7, std({color:0xcac2b4,roughness:1}), tx-1.2,ty,0.1)); wth.add(box(1.4-i*0.25,0.1,1.6, M.park, tx-1.2,ty+0.12,0.1)); });
const tk=new THREE.Group(); tk.position.set(-2.3,0,-0.75); tk.rotation.y=-0.178; g.add(tk);
tk.add(box(5.6,0.07,1.15, std({color:0x8f8a80,roughness:1}), 2.6,0.34,0));
const shopNames=['クレープ','古着','雑貨','カフェ','写真','コスメ','タピオカ'];
const shopSignCols=['#ec4899','#2563eb','#059669','#d97706','#7c3aed','#db2777','#0ea5e9'];
const bldgTones=['#cfc4b0','#b9c0c7','#d8cfc0','#a8b2ba','#cbb9a0','#bfb4a4'];
for(let i=0;i<6;i++){ [-1,1].forEach(sd=>{ const bx=0.55+i*0.88, bh=1.35+HASH(i*3.1+sd)*1.3, bz=sd*1.02;
  tk.add(box(0.78,bh,0.85, texMat(facadeTex(bldgTones[(i+(sd>0?3:0))%6])), bx,bh/2,bz));
  tk.add(box(0.62,0.55,0.06, M.glass, bx,0.62,bz-sd*0.46));
  const aw=box(0.68,0.05,0.36, std({color:[0xd96a7a,0x7a9cc4,0x86b06c,0xd9a45c][(i+(sd>0?1:0))%4],roughness:0.8}), bx,0.98,bz-sd*0.6); aw.rotation.x=sd*0.32; tk.add(aw);
  tk.add(box(0.13,0.9,0.52, glowMat(signTex(shopNames[(i+(sd>0?2:0))%7], shopSignCols[(i+(sd>0?2:0))%7])), bx+0.3,1.5,bz-sd*0.47));
}); }
[-0.35,0.35].forEach(px=>tk.add(cyl(0.05,0.05,2.3,M.dark,px,0,6)));
tk.add(box(1.35,0.42,0.09, glowMat(signTex('竹下通り','#374151','#ffffff',false)), 0,2.42,0));
people(tk,12,0.3,5.2,-0.32,0.32,0.38);
g.add(box(1.3,0.06,11, std({color:0x3a3f45,roughness:0.95}), 3.95,0.335,0.5));
for(let i=0;i<5;i++) g.add(box(0.09,0.02,0.55, M.white, 3.95,0.37,-3.6+i*1.9));
const carH=new THREE.Group(); carH.position.set(3.7,0.36,-1.8); carH.add(box(0.6,0.3,1.3, std({color:0xe8e8e8,roughness:0.4,metalness:0.3}), 0,0.28,0)); carH.add(box(0.54,0.26,0.68, M.glass, 0,0.55,-0.05)); g.add(carH);
const laf=new THREE.Group(); laf.position.set(5.25,0,-0.9); g.add(laf);
laf.add(box(1.5,4.4,2.3, texMat(facadeTex('#c9c2b4')), 0,2.2,0));
const lafCyl=cyl(0.52,0.52,3.5, M.glass, -0.72,1.32,14); laf.add(lafCyl);
[1.25,2.45,3.65].forEach(y=>laf.add(box(0.1,0.17,2.0, std({color:0xd8d2c2,roughness:0.9}), -0.78,y,0)));
laf.add(box(0.14,2.3,0.52, glowMat(signTex('ラフォーレ','#111827','#ffffff')), -0.8,2.5,-0.7));
laf.add(box(1.1,0.09,0.8, M.dark, -0.95,0.95,1.15));
const omo=new THREE.Group(); omo.position.set(2.45,0,3.6); g.add(omo);
omo.add(box(1.8,3.6,1.9, texMat(glassTex('#9db8cc')), 0,1.8,0));
const prism=cyl(0.85,1.05,2.2, M.glass, 0.85,-0.8,4); prism.rotation.y=Math.PI/4; omo.add(prism);
omo.add(box(1.9,0.14,2.0, M.park, 0,3.67,0));
omo.add(box(1.5,0.6,0.14, glowMat(signTex('Omokado','#0f766e','#ffffff',false)), 0,2.6,0.99));
const hkd=new THREE.Group(); hkd.position.set(5.25,0,3.9); g.add(hkd);
hkd.add(box(1.4,4.9,1.8, texMat(glassTex('#8fb0cc')), 0,2.45,0));
hkd.add(box(1.55,0.3,1.95, std({color:0x51606e,roughness:0.7,metalness:0.3}), 0,3.4,0));
hkd.add(box(1.5,0.14,1.9, M.park, 0,5.0,0));
hkd.add(box(1.2,0.6,0.14, glowMat(signTex('Harakado','#b45309','#ffffff',false)), 0,4.3,0.94));
const omoSt=new THREE.Group(); omoSt.position.set(3.3,0,3.3); omoSt.rotation.y=2.705; g.add(omoSt);
omoSt.add(box(6.6,0.06,1.9, std({color:0x43484e,roughness:0.95}), 3.3,0.335,0));
for(let i=0;i<6;i++){ omoSt.add(tree(1.1+i*1.05, 1.5, 1.2, darkGreen)); omoSt.add(tree(1.1+i*1.05, -1.5, 1.2, darkGreen)); }
const hills=new THREE.Group(); hills.position.set(3.5,0,2.35); omoSt.add(hills);
hills.add(box(3.9,1.5,1.7, texMat(facadeTex('#b9b0a0')), 0,0.75,0));
hills.add(box(3.9,0.5,0.06, M.glass, 0,0.95,-0.87));
hills.add(box(3.1,1.0,1.5, texMat(facadeTex('#c2b8a6')), -0.3,2.0,0.05));
hills.add(box(2.2,0.55,0.14, glowMat(signTex('表参道ヒルズ','#57534e','#ffffff',false)), 0,1.15,-0.9));
g.add(box(0.7,0.06,2.0, std({color:0x8f8a80,roughness:1}), 3.0,0.335,1.6));
g.add(box(0.9,1.7,0.8, texMat(facadeTex('#c3ccd4')), 2.45,0.85,1.35));
g.add(box(0.9,2.1,0.8, texMat(facadeTex('#d5dbe1')), 2.45,1.05,2.6));
people(g,8,-1.8,2.4,-1.9,-1.2,0.36); } },
 {id:'toyosu', name:'丰洲市场', x:18, z:13, h:5, desc:'东京的厨房：白色大楼顶上有整片屋顶草坪是它的特点。清晨可以看金枪鱼拍卖、吃寿司早餐，注意休市日。', make:g=>{ g.add(box(13.5,0.3,10.5, texMat(paveTex(),{roughness:1}), 0,0.15,0));
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
 {id:'disney', name:'东京迪士尼乐园', x:35, z:19, h:11, desc:'位于千叶浦安的迪士尼度假区。灰姑娘城堡是浅灰石墙配深蓝尖顶，立在园区中央的高地上；从东京站坐京叶线到舞滨约 15 分钟。', make:g=>{ const rock=std({color:0x9c5a38,roughness:1}); const cream=std({color:0xf3e5cf,roughness:0.9}); const stoneM=texMat(castleStoneTex(),{roughness:0.92}); const blueM=std({color:0x2e4d7d,roughness:0.42,metalness:0.25}); const blue2=std({color:0x3a5f94,roughness:0.45,metalness:0.2}); const winGlow=new THREE.MeshBasicMaterial({color:0xffca7a});
g.add(box(26.6,0.3,21.6, std({color:0x46603a,roughness:1}), 0,0.15,0.5));
const gnd=new THREE.Mesh(new THREE.PlaneGeometry(26,21), texMat(disneyTex(),{roughness:1})); gnd.rotation.x=-Math.PI/2; gnd.position.set(0,0.32,0.5); g.add(gnd);
// ===== Cinderella Castle =====
const cas=new THREE.Group(); cas.position.set(0,0.32,-2.4); g.add(cas);
cas.add(box(7.8,0.5,6.6, texMat(castleStoneTex(),{roughness:0.95}), 0,0.25,0));
cas.add(box(6.9,1.5,0.5, stoneM, 0,1.25,-2.95));
for(let k=0;k<8;k++) cas.add(box(0.42,0.34,0.3, stoneM, -3.0+k*0.86, 2.15, -2.95));
cas.add(box(3.4,2.6,2.4, stoneM, 0,1.8,0));
const keepRoof=cone(2.35,1.15, blue2, 0,0,4); keepRoof.rotation.y=Math.PI/4; keepRoof.position.y=3.68; cas.add(keepRoof);
const mainTower=cyl(0.58,0.7,3.6, stoneM, 0,-0.25,14); mainTower.position.y=3.6; cas.add(mainTower);
const spire=cone(0.8,2.7, blueM, 0,-0.25,14); spire.position.y=6.75; cas.add(spire);
const trim=tor(0.6,0.05, M.gold, 0,5.42,-0.25); trim.rotation.x=Math.PI/2; cas.add(trim);
const tipB=sph(0.1, M.gold, 0,0,0); tipB.position.set(0,8.2,-0.25); cas.add(tipB);
cas.add(box(0.34,0.2,0.02, std({color:0xc8a24a,roughness:0.5,metalness:0.5}), 0.2,7.95,-0.25));
[[-1.5,-1.05],[1.5,-1.05],[-1.5,1.05],[1.5,1.05]].forEach(([tx,tz])=>{ cas.add(cyl(0.3,0.37,2.3, stoneM, tx,tz,10)); const cn=cone(0.45,1.35, blueM, tx,tz,10); cn.position.y=3.32; cas.add(cn); const tb=sph(0.055, M.gold, 0,0,0); tb.position.set(tx,4.05,tz); cas.add(tb); });
[[-1.0,1.5],[1.0,1.5]].forEach(([tx,tz])=>{ cas.add(cyl(0.35,0.42,3.0, stoneM, tx,tz,12)); const cn=cone(0.52,1.6, blueM, tx,tz,12); cn.position.y=4.3; cas.add(cn); });
cas.add(box(1.05,1.5,0.18, M.dark, 0,1.25,1.28));
const archTop=cyl(0.52,0.52,0.18, M.dark, 0,1.28,16); archTop.rotation.x=Math.PI/2; archTop.position.y=2.0; cas.add(archTop);
const clockD=cyl(0.34,0.34,0.08, texMat(clockTex()), 0,-0.25,20); clockD.rotation.x=Math.PI/2; clockD.position.set(0,4.5,0.36); cas.add(clockD);
[[-0.55,2.35],[0.55,2.35],[-1.5,3.1],[1.5,3.1]].forEach(([wx,wy])=>cas.add(box(0.17,0.36,0.05, winGlow, wx,wy,1.22)));
[[-2.35,-0.7],[2.35,-0.7]].forEach(([wx,wz])=>{ cas.add(box(1.7,1.9,2.0, stoneM, wx,1.45,wz)); const rf=cone(1.45,0.8, blue2, wx,wz,4); rf.rotation.y=Math.PI/4; rf.position.y=2.8; cas.add(rf); });
// hub plaza + partners statue + flower ring
const hub=cyl(2.45,2.45,0.09, texMat(paveTex(),{roughness:1}), 0,1.8,26); hub.position.y=0.36; g.add(hub);
g.add(box(0.42,0.52,0.42, texMat(castleStoneTex(),{roughness:0.95}), 0,0.62,1.8));
const st1=cyl(0.05,0.07,0.55, M.gold, -0.08,1.8,6); st1.position.y=1.15; g.add(st1); const st2=sph(0.11, M.gold, -0.08,0,1.8); st2.position.y=1.52; g.add(st2);
for(let k=0;k<10;k++){ const a=k/10*Math.PI*2; g.add(sph(0.15, k%2?std({color:0xd96a8a,roughness:0.8}):std({color:0xe23b3b,roughness:0.8}), Math.cos(a)*1.95, 0.5, 1.8+Math.sin(a)*1.95)); }
// ===== World Bazaar =====
const bazaarTones=['#e8dcc4','#d9c6a5','#c9d2d8','#e2cdb2'];
for(let i=0;i<4;i++){ [-1,1].forEach(sd=>{ const bz=4.6+i*1.55, bh=1.9+HASH(i*2.3+sd)*0.7;
  g.add(box(1.6,bh,1.35, texMat(facadeTex(bazaarTones[(i+(sd>0?1:0))%4])), sd*2.05,bh/2,bz));
  g.add(hipRoof(1.75,0.55,1.5, M.roof, sd*2.05,bh,bz));
  g.add(box(1.3,0.6,0.06, M.glass, sd*1.22,0.62,bz));
}); }
const canopy=box(2.7,0.07,6.6, M.glass, 0,2.95,7.0); g.add(canopy);
[-1.25,1.25].forEach(cx=>{ [4.4,9.6].forEach(cz=>g.add(cyl(0.045,0.045,2.95, M.dark, cx,cz,6))); });
const ent=new THREE.Group(); ent.position.set(0,0.32,9.9); g.add(ent);
ent.add(box(5.6,1.7,0.9, texMat(facadeTex('#e8dcc4')), 0,0.85,0));
ent.add(hipRoof(5.9,0.7,1.2, M.roof, 0,1.7,0));
ent.add(box(4.4,0.66,0.14, glowMat(signTex('TOKYO DISNEYLAND','#7c2d12','#ffffff',false)), 0,1.15,0.5));
// ===== Tomorrowland =====
const sm=new THREE.Group(); sm.position.set(7.2,0.32,3.2); g.add(sm);
sm.add(cyl(1.95,2.35,0.95, M.white, 0,0,20));
const smCone=cone(1.85,2.9, M.white, 0,0,20); smCone.position.y=2.4; sm.add(smCone);
const smRing=tor(1.5,0.06, M.grey, 0,0); smRing.rotation.x=Math.PI/2; smRing.position.y=1.15; sm.add(smRing);
for(let k=0;k<5;k++){ const a=k/5*Math.PI*2+0.4; const sp=cone(0.09,0.85, M.white, Math.cos(a)*1.05, Math.sin(a)*1.05, 6); sp.position.y=3.6; sm.add(sp); }
sm.add(box(1.9,0.55,0.14, glowMat(signTex('SPACE MOUNTAIN','#0c4a6e','#ffffff',false)), -1.2,0.75,1.6));
const st2b=new THREE.Group(); st2b.position.set(4.9,0.32,5.6); g.add(st2b);
st2b.add(box(1.9,1.1,1.5, texMat(glassTex('#9fc0d8')), 0,0.55,0));
const dome2=sph(0.75, std({color:0xc7ccd4,roughness:0.3,metalness:0.6}), 0,0,0); dome2.scale.y=0.62; dome2.position.y=1.1; st2b.add(dome2);
// ===== Fantasyland =====
const sw=new THREE.Group(); sw.position.set(6.4,0.32,-4.6); g.add(sw);
sw.add(box(3.7,1.7,0.8, M.white, 0,0.85,0));
[-1.55,-0.9,-0.3,0.3,0.9,1.55].forEach((x,i)=>{ const cn=cone(0.3,0.85, [blue2,M.gold,blueM][i%3], x,0,4); cn.position.y=2.1; sw.add(cn); });
const swClock=cyl(0.26,0.26,0.08, texMat(clockTex()), 0,0,20); swClock.rotation.x=Math.PI/2; swClock.position.set(0,1.05,0.44); sw.add(swClock);
sw.add(box(2.6,0.5,0.12, glowMat(signTex("it's a small world",'#1d4ed8','#ffffff',false)), 0,0.32,0.44));
const caro=new THREE.Group(); caro.position.set(4.1,0.32,-2.1); g.add(caro);
caro.add(cyl(1.05,1.15,0.3, cream, 0,0,18));
const caroSpin=new THREE.Group(); caro.add(caroSpin);
for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; const pole=cyl(0.03,0.03,0.85, M.gold, Math.cos(a)*0.72,Math.sin(a)*0.72,6); pole.position.y=0.55; caroSpin.add(pole); const horse=box(0.3,0.22,0.12, k%2?M.white:cream, Math.cos(a)*0.72, Math.sin(a)*0.72); horse.position.y=0.5; horse.rotation.y=-a; caroSpin.add(horse); }
const caroPole=cyl(0.09,0.09,1.2, M.gold, 0,0,8); caroPole.position.y=0.62; caro.add(caroPole);
const caroTop=cone(1.38,0.8, std({color:0x9e2b25,roughness:0.6}), 0,0,18); caroTop.position.y=1.6; caro.add(caroTop);
ANIM.push(t=>{ caroSpin.rotation.y=t*0.55; });
[[8.6,-1.9,'#e8dcc4',0x7a4a8c],[3.3,-5.6,'#d9e2ec',0x2e4d7d],[8.8,-5.9,'#f0e0c8',0x9e2b25]].forEach(([hx,hz,tone,rc])=>{ g.add(box(1.15,1.0,1.0, texMat(facadeTex(tone)), hx,0.82,hz)); const rf=cone(0.95,0.85, std({color:rc,roughness:0.6}), hx,hz,4); rf.rotation.y=Math.PI/4; rf.position.y=1.75; g.add(rf); });
// ===== Adventureland =====
const pir=new THREE.Group(); pir.position.set(-6.6,0.32,3.4); pir.rotation.y=0.25; g.add(pir);
pir.add(box(2.9,1.7,1.2, cream, 0,0.85,0)); pir.add(hipRoof(3.3,0.85,1.6, M.roof, 0,1.7,0));
pir.add(box(2.2,0.55,0.14, glowMat(signTex('加勒比海盗','#1e3a5f','#ffd9a0',false)), 0,1.1,0.65));
const thut=new THREE.Group(); thut.position.set(-7.6,0.32,0.6); g.add(thut);
thut.add(cyl(0.32,0.46,2.3, std({color:0x6b4423,roughness:1}), 0,0,8));
const can1=sph(1.3, std({color:0x3f6b35,roughness:1}), 0,0,0); can1.position.y=2.9; thut.add(can1);
const can2=sph(0.9, std({color:0x4a7a3e,roughness:1}), 0,0,0); can2.position.set(0.8,2.5,0.3); thut.add(can2);
thut.add(box(0.9,0.6,0.8, std({color:0x8a6844,roughness:1}), 0.5,2.15,0));
const temple=new THREE.Group(); temple.position.set(-4.9,0.32,5.4); g.add(temple);
temple.add(box(1.7,0.7,1.7, texMat(castleStoneTex(),{roughness:1}), 0,0.35,0));
temple.add(box(1.2,0.6,1.2, texMat(castleStoneTex(),{roughness:1}), 0,1.0,0));
temple.add(box(0.7,0.55,0.7, texMat(castleStoneTex(),{roughness:1}), 0,1.55,0));
// ===== Westernland =====
const th=new THREE.Group(); th.position.set(-6.4,0.32,-4.2); th.rotation.y=0.4; g.add(th);
th.add(box(3.2,1.1,2.3, rock, 0,0.55,0)); const thB=box(2.3,1.05,1.7, rock, 0,1.6,0); thB.rotation.y=0.35; th.add(thB);
const thC=cone(1.15,1.5, rock, 0.2,0,8); thC.position.y=2.85; th.add(thC);
const track=tor(1.85,0.055, M.dark, 0,0); track.rotation.x=Math.PI/2; track.position.y=0.75; th.add(track);
const train=new THREE.Group(); train.add(box(0.5,0.3,0.28, std({color:0x7c2d12,roughness:0.7}), 0,0.15,0)); train.add(box(0.42,0.22,0.24, std({color:0xc8a24a,roughness:0.6}), 0.55,0.11,0)); th.add(train);
ANIM.push(t=>{ const a=t*0.5; train.position.set(Math.cos(a)*1.85, 0.78, Math.sin(a)*1.85); train.rotation.y=-a; });
[[-3.9,-2.2],[-3.9,-3.5],[-3.9,-4.8]].forEach(([fx,fz],i)=>{ const fh=1.15+HASH(i*3.3)*0.5; g.add(box(0.85,fh,1.05, texMat(facadeTex(['#a9805a','#96714e','#b08a5e'][i])), fx,fh/2+0.32,fz)); g.add(box(1.0,0.07,0.5, std({color:0x6b4423,roughness:1}), fx+0.25,0.95,fz)); });
const tw=new THREE.Group(); tw.position.set(-10.6,0.32,-3.2); tw.rotation.y=0.12; g.add(tw);
tw.add(box(0.95,0.32,2.6, M.white, 0,0.3,0));
tw.add(box(0.8,0.5,2.2, M.white, 0,0.72,0)); tw.add(box(0.66,0.45,1.7, M.white, 0,1.2,0));
const stk1=cyl(0.09,0.09,0.75, M.dark, 0,-0.6,8); stk1.position.y=1.75; tw.add(stk1);
const stk2=cyl(0.09,0.09,0.75, M.dark, 0,0.55,8); stk2.position.y=1.75; tw.add(stk2);
const wheel=box(0.16,0.85,0.85, std({color:0xb03a2e,roughness:0.7}), -0.52,0.45,-1.45); tw.add(wheel);
ANIM.push(t=>{ tw.position.y=0.32+Math.sin(t*0.9)*0.03; });
g.add(tree(-9.2,5.6,1.15, darkGreen)); g.add(tree(-4.3,0.9,1.0, darkGreen)); g.add(tree(9.9,-0.6,1.05)); g.add(tree(-2.9,-7.6,1.1)); g.add(tree(2.9,-7.8,1.0)); g.add(tree(10.1,6.3,1.1)); g.add(tree(-10.9,7.8,1.0, darkGreen));
people(g,10,-0.8,0.8,4.2,8.6,0.35); } },
{id:'dome', name:'东京巨蛋', x:0, z:0, h:6.6, desc:'日本第一座全天候巨蛋球场（1988 年），读卖巨人队主场，白色屋顶靠气压撑起，人称“BIG EGG”。旁边的东京巨蛋城里有无心摩天轮 Big O 与穿楼而过的过山车。', make:g=>{
g.add(box(19,0.3,14.5, texMat(paveTex(),{roughness:1}), 0,0.15,0));
const dmat=std({color:0xf3f1ec, roughness:0.5, metalness:0.05});
const dm=new THREE.Mesh(new THREE.SphereGeometry(6.4, 40, 20, 0, Math.PI*2, 0, Math.PI/2), dmat);
dm.scale.set(1,0.52,0.88); dm.position.set(-2.4,0.8,0); dm.castShadow=true; g.add(dm);
[0.5,0.95,1.35].forEach(th=>{ const r=6.4*Math.sin(th), y=0.8+6.4*0.52*Math.cos(th); const rg=new THREE.Mesh(new THREE.TorusGeometry(r,0.035,6,48), std({color:0xd9d5ca,roughness:0.7})); rg.rotation.x=Math.PI/2; rg.scale.set(1,0.88,1); rg.position.set(-2.4,y,0); g.add(rg); });
const bring=cyl(6.5,6.65,0.85, std({color:0x848b93,roughness:0.55}), -2.4, 0, 40); bring.scale.z=0.88; bring.position.y=0.43; g.add(bring);
const bglass=cyl(6.56,6.56,0.3, std({color:0x2e3e4e,roughness:0.25,metalness:0.3}), -2.4, 0, 40); bglass.scale.z=0.88; bglass.position.y=0.62; g.add(bglass);
g.add(box(2.4,0.9,0.18, glowMat(signTex('東京ドーム','#20303e','#ffd76a',false)), -2.4,0.75,5.85));
const hotel=box(2.7,7.4,2.3, texMat(facadeTex('#bcc3ca')), 6.9,3.7,-3.6); g.add(hotel);
g.add(box(2.9,0.35,2.5, M.white, 6.9,7.55,-3.6));
g.add(box(0.16,1.6,1.4, glowMat(signTex('東京ドームホテル','#7a1f1f','#ffffff',true)), 8.32,6.4,-3.6));
g.add(box(4.6,2.7,2.6, texMat(facadeTex('#c9bda6')), 7.2,1.35,3.9));
const wo=new THREE.Group(); wo.position.set(3.6,3.1,4.1); g.add(wo);
const wr=new THREE.Mesh(new THREE.TorusGeometry(2.75,0.09,8,40), std({color:0xe8e4da,roughness:0.4,metalness:0.4})); wo.add(wr);
const wr2=new THREE.Mesh(new THREE.TorusGeometry(2.1,0.05,8,36), std({color:0xcfd4d9,roughness:0.4,metalness:0.4})); wo.add(wr2);
for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; wo.add(box(0.34,0.3,0.3, std({color:[0xd94f3d,0x2e7f86,0xe0a83c,0x33527a,0x7a4a86][i%5],roughness:0.5}), Math.cos(a)*2.75, Math.sin(a)*2.75, 0)); }
g.add(beam(2.2,0,3.4, 3.6,3.1,4.1, M.grey, 0.07)); g.add(beam(5.0,0,3.4, 3.6,3.1,4.1, M.grey, 0.07));
ANIM.push(t=>{ wo.rotation.z=t*0.06; });
const cpts=[[0.2,3.6,4.3],[1.6,1.4,4.8],[3.2,0.6,4.5],[5.2,2.2,4.1],[6.8,3.4,4.3],[8.6,2.4,4.0]].map(q=>new THREE.Vector3(q[0],q[1],q[2]));
const ctr=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cpts), 40, 0.055, 6), std({color:0x2e7f86,roughness:0.4,metalness:0.3})); g.add(ctr);
[[1.6,4.8],[3.2,4.5],[5.2,4.1]].forEach(q=>{ const sup=cyl(0.045,0.045,1, M.grey, q[0],q[1],6); sup.scale.y=[1.4,0.6,2.2][[1.6,3.2,5.2].indexOf(q[0])]; sup.position.y=sup.scale.y/2; g.add(sup); });
[[-7.5,5.6],[-5.5,-5.8],[0.5,6.1],[5.8,-5.9],[8.6,-0.8],[-8.2,-4.6]].forEach(q=>g.add(tree(q[0],q[1],0.85,treeMat)));
people(g,7,-6,2,4.5,6.2,0.3);
} },

{id:'stadium', name:'国立竞技场', x:0, z:0, h:5.4, desc:'2020 东京奥运会主会场，隈研吾设计的“森林体育场”：五层檐廊的木格栅来自全日本 47 个都道府县，藏在神宫外苑的绿荫里。五楼空中回廊免费开放。', make:g=>{
const plaza=cyl(10.6,10.9,0.3, texMat(paveTex(),{roughness:1}), 0,0, 48); plaza.scale.z=0.72; plaza.position.y=0.15; g.add(plaza);
const wood=std({color:0xa87f56,roughness:0.85}), woodD=std({color:0x8a6844,roughness:0.9}), eaveM=std({color:0xeae5db,roughness:0.8});
for(let tI=0;tI<5;tI++){ const y=0.62+tI*0.8, r=8.7-tI*0.58;
  const ring=cyl(r, r+0.3, 0.6, tI%2?woodD:wood, 0,0, 48); ring.scale.z=0.72; ring.position.y=y+0.3; g.add(ring);
  const ev=cyl(r+0.44, r+0.44, 0.1, eaveM, 0,0, 48); ev.scale.z=0.72; ev.position.y=y+0.65; g.add(ev); }
const slatGeo=new THREE.BoxGeometry(0.07,0.6,0.05);
const slats=new THREE.InstancedMesh(slatGeo, wood, 300); const dum=new THREE.Object3D();
for(let i=0;i<300;i++){ const tier=i<170?0:1, ang=(i%170)/170*Math.PI*2 + tier*0.02, r=9.06-tier*0.58;
  dum.position.set(Math.cos(ang)*r, 0.92+tier*0.8, Math.sin(ang)*r*0.72); dum.rotation.set(0,-ang,0); dum.updateMatrix(); slats.setMatrixAt(i, dum.matrix); }
g.add(slats);
const roof=new THREE.Mesh(new THREE.TorusGeometry(6.2, 1.45, 10, 48), std({color:0xf1eee7,roughness:0.55}));
roof.rotation.x=Math.PI/2; roof.scale.set(1,0.72,1); roof.position.y=5.15; roof.castShadow=true; g.add(roof);
const seats=cyl(6.15,6.15,0.16, std({color:0x77806f,roughness:1}), 0,0, 44); seats.scale.z=0.72; seats.position.y=4.68; g.add(seats);
const pitch=cyl(3.3,3.3,0.1, std({color:0x4d8146,roughness:1}), 0,0, 36); pitch.scale.z=0.68; pitch.position.y=4.78; g.add(pitch);
const pline=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.035,6,40), M.white); pline.rotation.x=Math.PI/2; pline.scale.set(1,0.68,1); pline.position.y=4.84; g.add(pline);
for(let i=0;i<9;i++){ const a=i/9*Math.PI*2+0.2; g.add(tree(Math.cos(a)*11.6, Math.sin(a)*8.6, 0.95, treeMat)); }
const gink=std({color:0xc9a437,roughness:1});
for(let i=0;i<5;i++) g.add(tree(12.6, -4.4+i*2.2, 0.9, gink));
people(g,8,-8,8,5.6,6.8,0.3);
} },

{id:'yokohama', name:'横滨港未来', x:0, z:0, h:11.6, desc:'东京以南 30 公里的海港新城：296 米的地标塔带着阶梯收分的身姿立在港边，脚边停着 1930 年的帆船日本丸，对岸是直径 100 米的大摩天轮 Cosmo Clock 21，再往南是 1911 年的红砖仓库。整条海湾线一到夜里全亮起来。', make:g=>{
g.add(box(21,0.3,15.5, texMat(paveTex(),{roughness:1}), 0,0.15,0));
g.add(box(3.4,0.34,15.6, M.water, 10.3,0.17,0));
g.add(box(21.5,0.34,3.2, M.water, 0,0.17,8.6));
g.add(box(2.0,0.34,10.5, M.water, 1.35,0.17,-1.2));
// —— 横滨地标塔（296m：阶梯收分 + 横向檐线 + 双鳍冠顶）——
const tw=new THREE.Group(); tw.position.set(-6.3,0,-1.2); g.add(tw);
const lmTex=facadeTex('#ddd5c0'); lmTex.wrapS=lmTex.wrapT=THREE.RepeatWrapping; lmTex.repeat.set(2,5);
const lmMat=texMat(lmTex,{roughness:0.75});
const stoneM=std({color:0xcfc7b2,roughness:0.9});
tw.add(box(5.2,0.55,4.4, stoneM, 0,0.27,0));
tw.add(box(2.6,0.6,0.14, glowMat(signTex('ランドマークタワー','#20303e','#ffd76a',false)), 0,0.78,2.24));
tw.add(box(3.05,3.3,2.45, lmMat, 0,2.2,0));
tw.add(box(3.3,0.22,2.7, stoneM, 0,3.9,0));
tw.add(box(2.7,2.7,2.2, lmMat, 0,5.25,0));
tw.add(box(2.35,2.3,1.95, lmMat, 0,7.75,0));
tw.add(box(2.6,0.2,2.15, stoneM, 0,8.95,0));
tw.add(box(2.0,1.6,1.7, lmMat, 0,9.72,0));
const sgBandM=std({color:0x8fb0c9, roughness:0.2, metalness:0.3});
tw.add(box(2.08,0.42,1.78, sgBandM, 0,10.15,0));
tw.add(box(2.1,0.22,1.8, stoneM, 0,10.6,0));
tw.add(box(0.55,1.0,1.8, lmMat, -0.72,11.15,0));
tw.add(box(0.55,1.0,1.8, lmMat, 0.72,11.15,0));
tw.add(box(0.75,0.5,1.8, lmMat, 0,10.9,0));
const lbc=sph(0.09, new THREE.MeshBasicMaterial({color:0xff3333}), 0,11.78,0); tw.add(lbc);
ANIM.push(t=>{ lbc.material.color.setHex(Math.sin(t*2.4+0.5)>0?0xff3333:0x551111); });
window.NIGHT_FNS=window.NIGHT_FNS||[]; NIGHT_FNS.push(n=>{ sgBandM.emissive.setHex(n?0x35597a:0x000000); });
// —— 皇后广场（三座玻璃塔）——
const qs=new THREE.Group(); qs.position.set(-1.8,0,-4.9); g.add(qs);
[[-1.9,4.5],[0,5.3],[1.9,4.5]].forEach(q=>{ qs.add(box(1.55,q[1],1.9, texMat(glassTex('#b9cfdf')), q[0],q[1]/2,0)); });
// —— 船坞花园 + 帆船日本丸（1930 年，太平洋的白鸟）——
const dk=new THREE.Group(); dk.position.set(-2.4,0,1.8); dk.rotation.y=0.5; g.add(dk);
dk.add(box(1.5,0.3,4.6, M.water, 0,0.15,0));
dk.add(box(0.35,0.55,4.9, stoneM, -0.95,0.27,0)); dk.add(box(0.35,0.55,4.9, stoneM, 0.95,0.27,0));
dk.add(box(2.25,0.55,0.35, stoneM, 0,0.27,2.45));
const ship=new THREE.Group(); ship.position.set(0,0.3,0); dk.add(ship);
ship.add(sph(0.62, M.white, 0,0.05,0, 0.72,0.5,2.7));
ship.add(box(0.66,0.09,2.5, std({color:0x8a6844,roughness:0.9}), 0,0.3,0));
ship.add(beam(0,0.42,-1.55, 0,0.72,-2.35, M.dark, 0.035));
[-0.95,0.05,1.0].forEach(mz=>{ const ms=cyl(0.028,0.045,2.3, M.dark, 0,mz,6); ms.position.y=1.45; ship.add(ms);
  [1.6,2.2].forEach(hy=>{ ship.add(beam(-(2.6-hy)*0.42,hy,mz, (2.6-hy)*0.42,hy,mz, M.dark, 0.018)); }); });
// —— 洲际酒店帆形楼 ——
const ic=new THREE.Group(); ic.position.set(3.1,0,-5.3); ic.rotation.y=0.35; g.add(ic);
const sailShape=new THREE.Shape();
sailShape.moveTo(-1.05,0); sailShape.quadraticCurveTo(0.9,0.25, 1.0,2.6); sailShape.quadraticCurveTo(1.02,4.2, 0.55,5.1); sailShape.quadraticCurveTo(0.1,4.0, -0.35,2.2); sailShape.quadraticCurveTo(-0.8,0.8, -1.05,0);
const sail=new THREE.Mesh(new THREE.ExtrudeGeometry(sailShape,{depth:0.8,bevelEnabled:false}), texMat(glassTex('#cfe0ea'),{roughness:0.35}));
sail.castShadow=true; sail.position.z=-0.4; ic.add(sail);
// —— Cosmo World + Cosmo Clock 21（直径 100m，会转的大时钟摩天轮）——
const cs=new THREE.Group(); cs.position.set(4.35,0,-1.5); g.add(cs);
cs.add(box(2.6,0.8,1.6, texMat(facadeTex('#e8e2d2')), 0,0.4,1.15));
cs.add(box(1.9,0.5,0.12, glowMat(signTex('コスモワールド','#db2777','#ffffff',false)), 0,0.98,1.99));
const cw=new THREE.Group(); cw.position.set(0,2.15,0); cs.add(cw);
const rimM=std({color:0xf2f4f6, roughness:0.35, metalness:0.5});
cw.add(tor(1.78,0.06, rimM, 0,0,0));
for(let i=0;i<6;i++){ const sp2=box(0.06,3.56,0.05, M.steel, 0,0,0); sp2.rotation.z=i*Math.PI/6; cw.add(sp2); }
for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; cw.add(sph(0.13, std({color:[0xd94f3d,0x2e7f86,0xe0a83c,0x33527a,0xef7aa2,0x5da24a][i%6],roughness:0.5}), Math.cos(a)*1.78, Math.sin(a)*1.78, 0, 1,0.85,1)); }
cw.add(sph(0.18, M.steel, 0,0,0));
const cd=cyl(0.44,0.44,0.07, glowMat(clockTex()), 0,0,20); cd.rotation.x=Math.PI/2; cd.position.set(0,0,0.3); cw.add(cd);
cs.add(beam(-1.35,0,0, 0,2.1,0, M.steel, 0.09)); cs.add(beam(1.35,0,0, 0,2.1,0, M.steel, 0.09));
cs.add(beam(-0.95,0,-0.95, 0,2.1,0, M.steel, 0.07)); cs.add(beam(0.95,0,-0.95, 0,2.1,0, M.steel, 0.07));
ANIM.push((t,dt)=>{ cw.rotation.z-=dt*0.09; });
NIGHT_FNS.push(n=>{ rimM.emissive.setHex(n?0xd63384:0x000000); rimM.emissiveIntensity=n?0.55:0; });
// —— 红砖仓库（1911/1913 年海关仓库，两栋长屋）——
const ak=new THREE.Group(); ak.position.set(5.6,0,4.7); ak.rotation.y=-0.38; g.add(ak);
const akaTex=cnv(512,128,(c,w,h)=>{ c.fillStyle='#96402c'; c.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=8){ c.fillStyle=(y/8)%2?'#a04632':'#9c4430'; c.fillRect(0,y,w,7); }
  c.fillStyle='#e8ddc8'; c.fillRect(0,0,w,5); c.fillRect(0,h-6,w,6);
  for(let r=0;r<2;r++){ const wy=26+r*48; for(let x=20;x<w-14;x+=44){ c.fillStyle='#e8ddc8'; c.fillRect(x-2,wy+6,22,28); c.fillStyle='#2c2622'; c.fillRect(x,wy+8,18,24); } } });
const akaMat=texMat(akaTex,{roughness:0.9});
const slateM=std({color:0x3d4450,roughness:0.9});
[[5.6,-1.05,0],[4.6,1.05,0.3]].forEach(wd=>{ const wl=wd[0], wz=wd[1], wx=wd[2];
  ak.add(box(wl,0.95,1.15, akaMat, wx,0.48,wz));
  ak.add(hipRoof(wl+0.25,0.42,1.42, slateM, wx,0.95,wz));
});
ak.add(box(5.6,0.3,0.1, texMat(glassTex('#9fc6e0')), 0,0.2,-0.42));
[[-7.9,-5.6],[-8.3,2.2],[7.9,-4.6]].forEach(q=>g.add(tree(q[0],q[1],0.85,treeMat)));
people(g,9,2.6,6.4,-0.6,1.4,0.3);
} }

];
function makeFacadeTexture(style, sr){
  const S = matchMedia('(pointer:coarse)').matches ? 512 : 1024;
  const cv=document.createElement('canvas'); cv.width=cv.height=S;
  const ev=document.createElement('canvas'); ev.width=ev.height=S;
  const g=cv.getContext('2d'), e=ev.getContext('2d');
  e.fillStyle='#000'; e.fillRect(0,0,S,S);
  const regionH=S*0.875, shopY=regionH, shopH=S-regionH, FLOORS=6, BAYS=4;
  const floorPx=regionH/FLOORS, bayPx=S/BAYS, u=S/1024;
  const glass = style==='glass';
  // wall base
  const grd=g.createLinearGradient(0,0,0,regionH);
  if(glass){ grd.addColorStop(0,'#86a9c2'); grd.addColorStop(1,'#6285a1'); }
  else { grd.addColorStop(0,'#c3c0ba'); grd.addColorStop(1,'#a8a399'); }
  g.fillStyle=grd; g.fillRect(0,0,S,regionH);
  if(!glass){ g.fillStyle='rgba(90,100,110,0.04)'; for(let i=0;i<1400;i++){ g.fillRect(sr(i*3)*S, sr(i*7)*regionH, 2*u, 2*u); } }
  if(!glass){ g.fillStyle='rgba(80,88,96,0.09)'; for(let tx2=0;tx2<=BAYS*2;tx2++) g.fillRect(tx2*bayPx/2, 0, 1*u, regionH); for(let ty2=0;ty2<regionH;ty2+=8*u) g.fillRect(0, ty2, S, 1*u); }
  const TINTS=['#7ea6c4','#93b8d2','#a9c9de','#7498b2','#86aecb'];
  for(let f=0;f<FLOORS;f++){
    const yTop=regionH-(f+1)*floorPx;
    // floor separator / spandrel
    if(glass){ g.fillStyle='#55788f'; g.fillRect(0,yTop,S,floorPx*0.20); }
    else { g.fillStyle='rgba(70,80,90,0.35)'; g.fillRect(0,yTop,S,2*u); }
    for(let b=0;b<BAYS;b++){
      const seed=f*10+b, bx=b*bayPx;
      if(glass){ g.fillStyle='rgba(30,45,60,0.55)'; g.fillRect(bx, yTop+floorPx*0.20, 2*u, floorPx*0.80); g.fillStyle='rgba(255,255,255,0.13)'; g.fillRect(bx+2*u, yTop+floorPx*0.20, 1.5*u, floorPx*0.80); }
      else { g.fillStyle='rgba(70,80,90,0.16)'; g.fillRect(bx, yTop, 1.5*u, floorPx); }
      let wx,ww,wy,wh;
      if(glass){ wx=bx+3*u; ww=bayPx-6*u; wy=yTop+floorPx*0.24; wh=floorPx*0.72; const pg=g.createLinearGradient(0,wy,0,wy+wh); const hiP=sr(seed*3)>0.82; pg.addColorStop(0, hiP?'#e6f3fa':TINTS[Math.floor(sr(seed*5)*TINTS.length)]); pg.addColorStop(1, hiP?'#b9d6e8':'#5d7d99'); g.fillStyle=pg; g.fillRect(wx,wy,ww,wh); if(sr(seed*23)>0.78){ g.fillStyle='rgba(20,32,44,0.35)'; g.fillRect(wx,wy,ww,wh); } }
      else { wx=bx+bayPx*0.22; ww=bayPx*0.56; wy=yTop+floorPx*0.16; wh=floorPx*0.52;
        g.fillStyle='rgba(40,48,56,0.35)'; g.fillRect(wx-1*u,wy+1*u,ww+6*u,wh+7*u);
        g.fillStyle='#d6d2cb'; g.fillRect(wx-3*u,wy-3*u,ww+6*u,wh+6*u);
        const wg=g.createLinearGradient(0,wy,0,wy+wh); wg.addColorStop(0,'#4b5f73'); wg.addColorStop(1,'#2e3e4e'); g.fillStyle=wg; g.fillRect(wx,wy,ww,wh);
        g.fillStyle='rgba(255,255,255,0.20)'; g.beginPath(); g.moveTo(wx+ww*0.15,wy+wh); g.lineTo(wx+ww*0.55,wy); g.lineTo(wx+ww*0.8,wy); g.lineTo(wx+ww*0.4,wy+wh); g.fill();
        g.fillStyle='rgba(0,0,0,0.22)'; g.fillRect(wx,wy,ww,wh*0.16);
        if(sr(seed*17)>0.62){ g.fillStyle='rgba(226,232,236,0.5)'; for(let bl=0;bl<4;bl++) g.fillRect(wx, wy+bl*wh*0.11, ww, wh*0.05); }
        g.fillStyle='rgba(255,255,255,0.35)'; g.fillRect(wx-3*u, wy+wh+3*u, ww+6*u, 2*u);
        if(sr(seed*19)>0.5){ const stg=g.createLinearGradient(0,wy+wh,0,wy+wh+floorPx*0.34); stg.addColorStop(0,'rgba(80,88,96,0.10)'); stg.addColorStop(1,'rgba(80,88,96,0)'); g.fillStyle=stg; g.fillRect(wx, wy+wh, ww, floorPx*0.34); }
        if((b===1||b===2) && sr(seed*7)>0.45){ const by=wy+wh+3*u; g.fillStyle='#9aa3ac'; g.fillRect(bx+bayPx*0.10,by,bayPx*0.8,floorPx*0.15); g.fillStyle='rgba(60,70,80,0.6)'; for(let rI=0;rI<5;rI++) g.fillRect(bx+bayPx*0.10+4*u+rI*bayPx*0.15,by,2*u,floorPx*0.15);  if(sr(seed*29)>0.58){ const LC=['#e8e4da','#a8c4de','#e5b7c8','#f2f2f2']; for(let li=0;li<3;li++){ g.fillStyle=LC[Math.floor(sr(seed*37+li)*4)%4]; g.fillRect(bx+bayPx*0.16+li*bayPx*0.22, by+floorPx*0.16, bayPx*0.16, floorPx*0.10); } } }
        if(sr(seed*13)>0.55){ g.fillStyle='#d7dce0'; g.fillRect(wx+ww-24*u,wy+wh-16*u,22*u,16*u); g.strokeStyle='#8f979e'; g.strokeRect(wx+ww-24*u,wy+wh-16*u,22*u,16*u); }
      }
      if(sr(seed*31)>0.64){ e.fillStyle= sr(seed*41)>0.5 ? 'rgba(255,214,150,0.95)' : 'rgba(210,236,255,0.9)'; e.fillRect(wx,wy,ww,wh); }
    }
  }
  // parapet band at top
  g.fillStyle= glass ? '#4a6a82' : '#8d959d'; g.fillRect(0,0,S,7*u);
  // glass reflection streaks
  if(glass){ g.fillStyle='rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(S*0.1,regionH); g.lineTo(S*0.45,0); g.lineTo(S*0.62,0); g.lineTo(S*0.27,regionH); g.fill(); }
  // shopfront band (v 0..0.125)
  g.fillStyle='#5d6167'; g.fillRect(0,shopY,S,shopH);
  const SIGNS=['#d94f3d','#2e7f86','#e0a83c','#33527a','#7a4a86','#3f7a4a'];
  const signH=shopH*0.36, glassY=shopY+shopH*0.44, glassH=shopH*0.52;
  for(let b=0;b<BAYS;b++){ const bx=b*bayPx;
    g.fillStyle=SIGNS[b%SIGNS.length]; g.fillRect(bx+4*u, shopY+shopH*0.05, bayPx-8*u, signH);
    g.fillStyle='rgba(255,255,255,0.85)'; for(let tI=0;tI<3;tI++) g.fillRect(bx+14*u, shopY+shopH*0.13+tI*shopH*0.09, (bayPx-30*u)*(0.5+sr(b*7+tI)*0.4), 3.5*u);
    e.fillStyle=SIGNS[b%SIGNS.length]; e.fillRect(bx+4*u, shopY+shopH*0.05, bayPx-8*u, signH);
    const sg=g.createLinearGradient(0,glassY,0,glassY+glassH); sg.addColorStop(0,'#31424e'); sg.addColorStop(1,'#1d2830'); g.fillStyle=sg; g.fillRect(bx+6*u, glassY, bayPx-12*u, glassH);
    g.fillStyle='rgba(255,205,130,0.30)'; g.fillRect(bx+6*u, glassY, bayPx-12*u, glassH*0.4);
    e.fillStyle='rgba(255,196,110,0.75)'; e.fillRect(bx+6*u, glassY, bayPx-12*u, glassH);
    g.fillStyle='rgba(230,238,242,0.7)'; g.fillRect(bx+bayPx/2-1.5*u, glassY, 3*u, glassH);
  }
  g.fillStyle='#c22730'; g.fillRect(6*u, glassY+glassH*0.08, 15*u, glassH*0.92); g.fillStyle='#f5f5f5'; g.fillRect(8*u, glassY+glassH*0.16, 11*u, glassH*0.30); g.fillStyle='rgba(30,30,34,0.85)'; g.fillRect(8*u, glassY+glassH*0.55, 11*u, glassH*0.36); e.fillStyle='rgba(255,110,110,0.85)'; e.fillRect(6*u, glassY+glassH*0.08, 15*u, glassH*0.92);
  const map=new THREE.CanvasTexture(cv); map.colorSpace=THREE.SRGBColorSpace;
  map.wrapS=THREE.RepeatWrapping; map.anisotropy=4;
  const emi=new THREE.CanvasTexture(ev); emi.wrapS=THREE.RepeatWrapping;
  return {map:map, emissiveMap:emi};
}
const SIGN_DESIGNS=[['#d92323','#ffffff','居酒屋'],['#6d28d9','#ffffff','カラオケ'],['#f59e0b','#1f2937','ラーメン'],['#0e9f6e','#ffffff','薬局'],['#7f1d1d','#ffd9a0','焼肉'],['#1d4ed8','#ffffff','ホテル'],['#0ea5e9','#ffffff','コンビニ'],['#db2777','#ffffff','パチンコ']];
function makeSignTex(d){ return cnv(128,256,(g,w,h)=>{ g.fillStyle=d[0]; g.fillRect(0,0,w,h); g.strokeStyle='rgba(255,255,255,0.85)'; g.lineWidth=5; g.strokeRect(7,7,w-14,h-14); g.fillStyle=d[1]; g.font='bold 44px "PingFang SC","Hiragino Sans","Microsoft YaHei",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; const ch=[...d[2]]; ch.forEach((c,i)=>g.fillText(c, w/2, 52+i*((h-100)/Math.max(ch.length-1,1)))); }); }
function buildCity(scene, d, sr, isNight){
  const COARSE = matchMedia('(pointer:coarse)').matches;
  const MAXB = COARSE ? 7000 : 14000;
  const FLOORH=0.09, BAYW=0.09, CHUNK=6*FLOORH;
  const texC=makeFacadeTexture('concrete', sr), texG=makeFacadeTexture('glass', sr);
  const matC=new THREE.MeshStandardMaterial({map:texC.map, emissiveMap:texC.emissiveMap, emissive:0xffffff, emissiveIntensity:0, vertexColors:true, roughness:0.85, envMapIntensity:0.30});
  const matG=new THREE.MeshStandardMaterial({map:texG.map, emissiveMap:texG.emissiveMap, emissive:0xffffff, emissiveIntensity:0, vertexColors:true, roughness:0.24, metalness:0.1, envMapIntensity:1.15});
  window.cityMats=[matC, matG];
  if(isNight){ matC.emissiveIntensity=0.9; matG.emissiveIntensity=0.9; }
  const A={pos:[],col:[],uv:[]}, B={pos:[],col:[],uv:[]}, R={pos:[],col:[]};
  const palette=[[0.82,0.82,0.84],[0.87,0.83,0.77],[0.79,0.81,0.84],[0.85,0.80,0.74],[0.77,0.79,0.81],[0.89,0.87,0.83],[0.74,0.77,0.73],[0.81,0.78,0.73]];
  const ACCENTS=[[0.55,0.68,0.66],[0.78,0.62,0.60],[0.80,0.70,0.52],[0.58,0.66,0.78],[0.76,0.58,0.50]];
  const EXCL = spots.map(sp=>[sp.x, sp.z, sp.id==='disney'?13:9]);
  const roofCand=[], fSigns=[[],[],[],[],[],[],[],[]], rSigns=[[],[],[],[],[],[],[],[]], treePts=[];
  const bboxHash=new Map();
  const hashKey=(x,z)=>Math.floor(x/0.5)+','+Math.floor(z/0.5);
  const quad=(o,a,b,c,dd,cc,ua,ub,uc,ud,va,vb,vc,vd)=>{ o.pos.push(a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2], a[0],a[1],a[2], c[0],c[1],c[2], dd[0],dd[1],dd[2]); o.uv.push(ua,va, ub,vb, uc,vc, ua,va, uc,vc, ud,vd); for(let v=0;v<6;v++) o.col.push(cc[0],cc[1],cc[2]); };
  function addWalls(o,P,tint,yFrom,yTo,shop){
    let perim=0;
    for(let k=0;k<P.length;k++){ const Pt=P[k], Q=P[(k+1)%P.length];
      const el=Math.hypot(Q[0]-Pt[0],Q[1]-Pt[1]); const u0=perim/(4*BAYW), u1=(perim+el)/(4*BAYW); perim+=el;
      if(shop) quad(o,[Pt[0],0.02,Pt[1]],[Q[0],0.02,Q[1]],[Q[0],FLOORH,Q[1]],[Pt[0],FLOORH,Pt[1]], tint, u0,u1,u1,u0, 0,0,0.125,0.125);
      const mStart=Math.max(0, Math.floor((yFrom-FLOORH)/CHUNK));
      for(let m=mStart; ; m++){ const cs=FLOORH+m*CHUNK; if(cs>=yTo-0.001) break; const ce=Math.min(yTo, cs+CHUNK); const y0=Math.max(yFrom, cs); if(ce-y0<0.004) continue;
        const vb=0.125+0.875*(y0-cs)/CHUNK, vt=0.125+0.875*(ce-cs)/CHUNK;
        quad(o,[Pt[0],y0,Pt[1]],[Q[0],y0,Q[1]],[Q[0],ce,Q[1]],[Pt[0],ce,Pt[1]], tint, u0,u1,u1,u0, vb,vb,vt,vt); }
    }
  }
  let i=0, built=0;
  while(i<d.length && built<MAXB){
    const n=d[i], h=d[i+1]/20, x0=d[i+2]/20-80, z0=d[i+3]/20-80; i+=4;
    const pts=[[x0,z0]]; let px=x0, pz=z0;
    for(let k=1;k<n;k++){ px+=d[i]/20; pz+=d[i+1]/20; i+=2; pts.push([px,pz]); }
    let cx=0, cz=0, mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;
    pts.forEach(q=>{ cx+=q[0]; cz+=q[1]; mnx=Math.min(mnx,q[0]); mxx=Math.max(mxx,q[0]); mnz=Math.min(mnz,q[1]); mxz=Math.max(mxz,q[1]); });
    cx/=pts.length; cz/=pts.length;
    const nearSpot = EXCL.some(e=>{ const dx=cx-e[0], dz=cz-e[1]; return dx*dx+dz*dz < e[2]*e[2]; });
    if(nearSpot) continue;
    built++;
    if(n<3) continue;
    const hk=hashKey(cx,cz); if(!bboxHash.has(hk)) bboxHash.set(hk, []); bboxHash.get(hk).push([mnx,mxx,mnz,mxz]);
    let cc=palette[(built*37)%palette.length];
    if(sr(built*7.3)>0.90) cc=ACCENTS[Math.floor(sr(built*3.9)*ACCENTS.length)%ACCENTS.length];
    const sh=0.9+((built*53)%17)/100; const c=[cc[0]*sh, cc[1]*sh, cc[2]*sh];
    let rc=[c[0]*0.42+0.08, c[1]*0.42+0.08, c[2]*0.44+0.09];
    const roofKind=sr(built*11.3);
    if(roofKind>0.82) rc=[0.62,0.60,0.57]; else if(roofKind>0.68) rc=[0.45,0.33,0.27]; else if(roofKind>0.58) rc=[0.36,0.44,0.38];
    // tiered tops for tall buildings
    let tierPts=null, baseY=0;
    if(h>=1.7){ const mT=Math.max(1, Math.round((0.6*h-FLOORH)/CHUNK)); baseY=FLOORH+mT*CHUNK; if(baseY<h-0.3) tierPts=pts.map(q=>[cx+(q[0]-cx)*0.8, cz+(q[1]-cz)*0.8]); else baseY=0; }
    const topPts = tierPts || pts;
    const wdt=mxx-mnx, dep=mxz-mnz;
    let gabled=false;
    if(!tierPts && h>=0.26 && h<1.05 && wdt>0.14 && dep>0.14 && sr(built*13.7)<0.6){
      let pa=0; for(let k2=0;k2<n;k2++){ const P2=pts[k2], Q2=pts[(k2+1)%n]; pa+=P2[0]*Q2[1]-Q2[0]*P2[1]; } pa=Math.abs(pa)/2;
      if(pa > wdt*dep*0.78){ gabled=true;
        const rise=Math.min(0.17, Math.max(0.05, Math.min(wdt,dep)*0.30)), ov=0.025;
        const gc=[c[0]*0.92, c[1]*0.92, c[2]*0.92];
        const pushR=(arr,col)=>{ for(let vi=0;vi<arr.length;vi++) R.pos.push(arr[vi]); for(let v2=0;v2<arr.length/3;v2++) R.col.push(col[0],col[1],col[2]); };
        if(wdt>=dep){ const zm=(mnz+mxz)/2;
          pushR([mnx-ov,h,mnz-ov, mxx+ov,h,mnz-ov, mxx+ov,h+rise,zm, mnx-ov,h,mnz-ov, mxx+ov,h+rise,zm, mnx-ov,h+rise,zm], rc);
          pushR([mxx+ov,h,mxz+ov, mnx-ov,h,mxz+ov, mnx-ov,h+rise,zm, mxx+ov,h,mxz+ov, mnx-ov,h+rise,zm, mxx+ov,h+rise,zm], rc);
          pushR([mnx,h,mnz, mnx,h,mxz, mnx,h+rise,zm], gc);
          pushR([mxx,h,mxz, mxx,h,mnz, mxx,h+rise,zm], gc);
        } else { const xm=(mnx+mxx)/2;
          pushR([mnx-ov,h,mnz-ov, mnx-ov,h,mxz+ov, xm,h+rise,mxz+ov, mnx-ov,h,mnz-ov, xm,h+rise,mxz+ov, xm,h+rise,mnz-ov], rc);
          pushR([mxx+ov,h,mxz+ov, mxx+ov,h,mnz-ov, xm,h+rise,mnz-ov, mxx+ov,h,mxz+ov, xm,h+rise,mnz-ov, xm,h+rise,mxz+ov], rc);
          pushR([mnx,h,mnz, mxx,h,mnz, xm,h+rise,mnz], gc);
          pushR([mxx,h,mxz, mnx,h,mxz, xm,h+rise,mxz], gc);
        }
      }
    }
    if(!gabled){
    const contour=topPts.map(q=>new THREE.Vector2(q[0],q[1]));
    let tris=[]; try{ tris=THREE.ShapeUtils.triangulateShape(contour, []); }catch(e){}
    tris.forEach(t=>{ const A2=topPts[t[0]],B2=topPts[t[1]],C2=topPts[t[2]]; R.pos.push(A2[0],h,A2[1], B2[0],h,B2[1], C2[0],h,C2[1]); for(let v=0;v<3;v++) R.col.push(rc[0],rc[1],rc[2]); });
    }
    if(tierPts){ for(let k=0;k<n;k++){ const P=pts[k], Q=pts[(k+1)%n], P2=tierPts[k], Q2=tierPts[(k+1)%n];
      R.pos.push(P[0],baseY,P[1], Q[0],baseY,Q[1], Q2[0],baseY,Q2[1], P[0],baseY,P[1], Q2[0],baseY,Q2[1], P2[0],baseY,P2[1]);
      for(let v=0;v<6;v++) R.col.push(rc[0],rc[1],rc[2]); } }
    const o = h>=1.2 ? B : A;
    addWalls(o, pts, c, 0, tierPts?baseY:h, true);
    if(tierPts) addWalls(o, tierPts, c, baseY, h, false);
    if(!gabled && h>=0.30 && (mxx-mnx)>=0.045 && (mxz-mnz)>=0.045) roofCand.push([cx,cz,h,mxx-mnx,mxz-mnz,built]);
    // facade neon sign
    if(h>=0.55 && sr(built*3.1)<0.5){ const di=Math.floor(sr(built*7.7)*8)%8; const k=Math.floor(sr(built*5.3)*n)%n; const P=pts[k], Q=pts[(k+1)%n];
      const mxp=(P[0]+Q[0])/2, mzp=(P[1]+Q[1])/2; let nx=mxp-cx, nz=mzp-cz; const nl=Math.hypot(nx,nz);
      if(nl>0.01){ nx/=nl; nz/=nl; const w=0.05+sr(built*9.4)*0.045;
        fSigns[di].push([mxp+nx*0.015, h*(0.5+sr(built*6.7)*0.25), mzp+nz*0.015, Math.atan2(nx,nz), w, w*2.6]); } }
    // rooftop billboard
    if(h>=1.5 && sr(built*4.9)>0.62){ const di=Math.floor(sr(built*8.3)*8)%8; const dirs=[[1,0],[-1,0],[0,1],[0,-1]]; const dr=dirs[Math.floor(sr(built*2.9)*4)%4];
      rSigns[di].push([cx+dr[0]*(mxx-mnx)*0.32, h+0.10, cz+dr[1]*(mxz-mnz)*0.32, Math.atan2(dr[0],dr[1]), 0.34+sr(built*5.9)*0.3, 0.13]); }
    // street tree candidate
    if(sr(built*6.1)<0.16){ const side=Math.floor(sr(built*4.3)*4)%4; const jx=(sr(built*8.9)-0.5)*0.1, jz=(sr(built*9.7)-0.5)*0.1;
      let tx2=cx, tz2=cz; if(side===0) tx2=mxx+0.07; else if(side===1) tx2=mnx-0.07; else if(side===2) tz2=mxz+0.07; else tz2=mnz-0.07;
      tx2+=jx; tz2+=jz;
      let blocked=false;
      for(let gx=-1;gx<=1&&!blocked;gx++) for(let gz=-1;gz<=1&&!blocked;gz++){ const arr=bboxHash.get(Math.floor(cx/0.5)+gx+','+(Math.floor(cz/0.5)+gz)); if(!arr) continue;
        for(const bb of arr){ if(tx2>bb[0]-0.02&&tx2<bb[1]+0.02&&tz2>bb[2]-0.02&&tz2<bb[3]+0.02){ blocked=true; break; } } }
      if(!blocked) treePts.push([tx2,tz2,built]); }
  }
  const mk=(o,mat)=>{ if(!o.pos.length) return; const g=new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(o.pos,3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(o.col,3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(o.uv,2));
    g.computeVertexNormals();
    const m=new THREE.Mesh(g, mat); m.receiveShadow=true; scene.add(m); };
  mk(A, matC); mk(B, matG);
  if(R.pos.length){ const g=new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(R.pos,3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(R.col,3));
    g.computeVertexNormals();
    const m=new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors:true, roughness:1, side:THREE.DoubleSide, envMapIntensity:0.3})); m.receiveShadow=true; scene.add(m); }
  // rooftop equipment (instanced)
  const cap = COARSE?900:2600;
  const list = roofCand.slice(0, cap);
  if(list.length){
    const geo=new THREE.BoxGeometry(1,1,1); geo.translate(0,0.5,0);
    const inst=new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({color:0xa7b0b8, roughness:0.9, envMapIntensity:0.4}), list.length);
    const dum=new THREE.Object3D();
    list.forEach((r,idx)=>{ const sd=sr(r[5]*3.7);
      dum.position.set(r[0]+(sd-0.5)*r[3]*0.3, r[2], r[1]+(sr(r[5]*9.1)-0.5)*r[4]*0.3);
      dum.scale.set(Math.max(0.018, r[3]*(0.25+sd*0.25)), 0.02+sr(r[5]*5.3)*0.045, Math.max(0.018, r[4]*(0.25+sr(r[5]*7.7)*0.25)));
      dum.rotation.set(0,sd*Math.PI,0); dum.updateMatrix(); inst.setMatrixAt(idx, dum.matrix); });
    inst.receiveShadow=true; scene.add(inst);
  }
  // neon signs (instanced, one mesh per design)
  const signGeo=new THREE.PlaneGeometry(1,1);
  const dum2=new THREE.Object3D();
  const buildSigns=(perDesign)=>{ perDesign.forEach((arr,di)=>{ if(!arr.length) return;
    const im=new THREE.InstancedMesh(signGeo, new THREE.MeshBasicMaterial({map:makeSignTex(SIGN_DESIGNS[di]), side:THREE.DoubleSide}), arr.length);
    arr.forEach((sg,idx)=>{ dum2.position.set(sg[0],sg[1],sg[2]); dum2.rotation.set(0,sg[3],0); dum2.scale.set(sg[4],sg[5],1); dum2.updateMatrix(); im.setMatrixAt(idx, dum2.matrix); });
    scene.add(im); }); };
  buildSigns(fSigns); buildSigns(rSigns);
  // street trees & sakura (instanced blobs)
  const tList = treePts.slice(0, COARSE?700:1500);
  if(tList.length){
    const tGeo=new THREE.IcosahedronGeometry(1,1);
    const tInst=new THREE.InstancedMesh(tGeo, new THREE.MeshStandardMaterial({color:0xffffff, roughness:1, flatShading:true}), tList.length);
    const GREENS=[0x5da24a,0x6fb457,0x4c9440,0x79b34a], PINKS=[0xf2a7c3,0xefa0bd];
    tList.forEach((tp,idx)=>{ const r=0.05+sr(tp[2]*3.3)*0.065;
      dum2.position.set(tp[0], r*0.8, tp[1]); dum2.rotation.set(0, sr(tp[2]*7.1)*3, 0); dum2.scale.set(r, r*0.88, r); dum2.updateMatrix(); tInst.setMatrixAt(idx, dum2.matrix);
      const col = sr(tp[2]*5.7)>0.78 ? PINKS[Math.floor(sr(tp[2]*9.3)*2)%2] : GREENS[Math.floor(sr(tp[2]*9.3)*4)%4];
      tInst.setColorAt(idx, new THREE.Color(col)); });
    scene.add(tInst);
    window.__streetTrees={inst:tInst, seeds:tList.map(tp=>tp[2])};
  }
}

export { M, ANIM, RND, label, spots, box, cyl, cone, sph, beam, ring, tor, cnv, std, texMat, glowMat, facadeTex, glassTex, signTex, hipRoof, tree, pinkTree, treeMat, people, blink , buildCity, kawaraTex };
