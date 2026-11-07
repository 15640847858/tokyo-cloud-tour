import * as THREE from 'three';
import { M, ANIM, box, cyl, cone, sph, beam, cnv, std, texMat, glowMat, facadeTex, glassTex, signTex, hipRoof, tree, pinkTree, treeMat, people, blink, kawaraTex, paveTex } from './builders.js';

// 第二批景点模块（builders.js 接近部署体积上限后拆分，index/audio 合并 spots+spots2）
export const spots2 = [

{id:'yanaka', name:'谷中银座', x:0, z:0, h:2.6, desc:'东京少有躲过战火的老街：170 米的商店街两旁挤着 60 多家小店，东头一座看日落的台阶「夕やけだんだん」，西头通向满是寺庙与猫的谷根千。先下台阶，再一路吃着メンチカツ慢慢逛。', make:g=>{
const plazaTex=cnv(256,256,(c,w,h)=>{ c.fillStyle='#b3a58d'; c.fillRect(0,0,w,h);
  for(let i=0;i<1600;i++){ c.fillStyle=`rgba(${90+Math.random()*60|0},${80+Math.random()*50|0},${60+Math.random()*40|0},0.12)`; c.fillRect(Math.random()*w, Math.random()*h, 2, 2); }
  c.strokeStyle='rgba(90,78,58,0.35)'; c.lineWidth=2;
  for(let x=0;x<=w;x+=64){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); }
  for(let y=0;y<=h;y+=64){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); } });
plazaTex.wrapS=plazaTex.wrapT=THREE.RepeatWrapping; plazaTex.repeat.set(3,2);
g.add(box(13,0.3,9.5, texMat(plazaTex,{roughness:1}), 0,0.15,0));
g.add(box(9.2,0.34,2.7, std({color:0x8d8578,roughness:1}), -0.6,0.17,0));
// —— 夕やけだんだん（东头台阶 + 观景平台 + 猫）——
const stp=new THREE.Group(); stp.position.set(0,0,-0.2); g.add(stp);
const stepM=std({color:0xa99f8d,roughness:1});
stp.add(box(1.1,1.0,4.3, stepM, 5.55,0.5,0));
for(let k=0;k<6;k++){ const sh=0.98-0.16*k; stp.add(box(0.26,sh,4.0, stepM, 4.86-0.26*k, sh/2, 0)); }
stp.add(beam(5.1,1.32,1.95, 3.55,0.42,1.95, M.steel, 0.035));
stp.add(beam(5.1,1.32,-1.95, 3.55,0.42,-1.95, M.steel, 0.035));
[-2.35,2.35].forEach(pz=>{ stp.add(box(0.7,0.42,0.55, std({color:0x9c4a38,roughness:1}), 5.5,1.2,pz)); stp.add(sph(0.3, M.park, 5.5,1.5,pz, 1,0.75,1)); });
function cat(x,y,z,cm){ const cg=new THREE.Group(); cg.position.set(x,y,z); cg.add(sph(0.11, cm, 0,0.07,0, 1,0.8,1.25)); cg.add(sph(0.075, cm, 0,0.16,0.1)); cg.add(cone(0.03,0.06, cm, -0.045,0.24,0.1, 4)); cg.add(cone(0.03,0.06, cm, 0.045,0.24,0.1, 4)); cg.add(beam(0,0.05,-0.13, 0,0.16,-0.24, cm, 0.02)); return cg; }
stp.add(cat(4.35,0.68,1.2, std({color:0xe8e2d4,roughness:0.9})));
stp.add(cat(5.55,1.0,-1.4, std({color:0x4a4038,roughness:0.9})));
people(stp,3,5.2,5.9,-1.2,1.2,1.0);
// —— 商店街入口牌坊 ——
const gate=new THREE.Group(); gate.position.set(3.35,0,0); g.add(gate);
gate.add(box(0.14,2.0,0.14, M.dark, 0,1.0,-1.55)); gate.add(box(0.14,2.0,0.14, M.dark, 0,1.0,1.55));
gate.add(box(0.1,0.12,3.4, M.dark, 0,2.02,0));
const gb=box(0.08,0.85,1.9, glowMat(signTex('谷中ぎんざ','#f7f1de','#2b2b2b',false)), 0,2.5,0); gate.add(gb);
const gr1=box(0.07,0.09,1.35, M.dark, 0,2.78,-0.5); gr1.rotation.x=0.62; gate.add(gr1);
const gr2=box(0.07,0.09,1.35, M.dark, 0,2.78,0.5); gr2.rotation.x=-0.62; gate.add(gr2);
// —— 两侧下町小店（独立门面 + 雨棚 + 招牌，越往西越旧）——
const shopNames=['肉のサトー','やなかしっぽや','谷中メンチ','ひみつ堂','肉のすずき','かき氷','猫の雑貨','せんべい','そば処','花や','八百屋','甘味処','惣菜や','雑貨みち'];
const awnCols=[0xb8503f,0x3f6d8e,0x4a7a4f,0xc7a23a,0x7a4a6d,0x546e7a];
const wallCols=['#cbb79a','#b09a7d','#d6cbb2','#a8b0ae','#c4a184','#bfae94'];
let sidx=0;
[-1,1].forEach(side=>{
  for(let i=0;i<7;i++){
    const sx=2.75-i*1.14, sz=side*2.15, wdt=0.95+((i*7+side*3)%3)*0.09, dep=1.35, hgt=(i%3===0)?1.28:0.92;
    const shop=new THREE.Group(); shop.position.set(sx,0,sz); shop.rotation.y=side>0?Math.PI:0; g.add(shop);
    shop.add(box(wdt,hgt,dep, texMat(facadeTex(wallCols[(i+ (side>0?3:0))%6])), 0,hgt/2,0));
    shop.add(hipRoof(wdt+0.18,0.3,dep+0.22, std({color:0x5d5648,roughness:1}), 0,hgt,0));
    const awn=box(wdt*0.92,0.05,0.62, std({color:awnCols[(i*2+(side>0?1:0))%6],roughness:0.85}), 0,0.72,dep/2+0.26); awn.rotation.x=0.28; shop.add(awn);
    shop.add(box(wdt*0.8,0.3,0.06, texMat(glassTex('#9fc6d8')), 0,0.36,dep/2+0.02));
    shop.add(box(wdt*0.86,0.34,0.07, glowMat(signTex(shopNames[sidx%shopNames.length],'#2f3a42','#f5eeda',false)), 0,1.02,dep/2+0.03));
    sidx++;
  }
});
// —— 街后老木屋民居 + 小寺 ——
const houseCols=['#8a6f52','#77613f','#93826a'];
[[-3.9,-3.6],[-2.2,-3.7],[-0.4,-3.6],[1.6,-3.7]].forEach((hp,hi2)=>{
  const hs=new THREE.Group(); hs.position.set(hp[0],0,hp[1]); g.add(hs);
  hs.add(box(1.5,0.95,1.3, texMat(facadeTex(houseCols[hi2%3])), 0,0.48,0));
  hs.add(hipRoof(1.7,0.42,1.5, std({color:0x4c463c,roughness:1}), 0,0.95,0));
  hs.add(sph(0.32, M.park, 0.85,0.3,0.5, 1,0.8,1));
});
const tmp=new THREE.Group(); tmp.position.set(4.7,0,-2.75); tmp.rotation.y=-0.25; g.add(tmp);
tmp.add(box(0.16,1.15,0.16, M.dark, -0.55,0.57,0)); tmp.add(box(0.16,1.15,0.16, M.dark, 0.55,0.57,0));
tmp.add(hipRoof(1.7,0.4,0.5, std({color:0x5f8575,roughness:0.7,metalness:0.25}), 0,1.15,0));
tmp.add(box(2.3,1.05,1.6, texMat(facadeTex('#ddd3ba')), 0,0.52,-1.15));
tmp.add(hipRoof(2.6,0.55,1.9, std({color:0x5f8575,roughness:0.7,metalness:0.25}), 0,1.05,-1.15));
g.add(tree(-5.6,-2.6,1.0,treeMat)); g.add(tree(5.9,2.9,0.9,treeMat));
// —— 根津神社千本鸟居小径（西南角）——
const nz=new THREE.Group(); nz.position.set(-4.7,0,3.4); nz.rotation.y=0.5; g.add(nz);
nz.add(sph(1.5, M.park, 0,0.1,0, 1.3,0.42,1.1));
for(let i=0;i<5;i++){ const a=i*0.42, tx=Math.sin(a)*1.15, tz=-Math.cos(a)*1.15+0.4, sc=1-i*0.09;
  const tg2=new THREE.Group(); tg2.position.set(tx,0.28,tz); tg2.rotation.y=a; tg2.scale.setScalar(sc); nz.add(tg2);
  const red=std({color:0xc73e24,roughness:0.6});
  tg2.add(cyl(0.045,0.055,0.8, red, -0.3,0,6)); tg2.add(cyl(0.045,0.055,0.8, red, 0.3,0,6));
  tg2.add(box(0.78,0.09,0.1, red, 0,0.82,0)); tg2.add(box(0.6,0.07,0.08, red, 0,0.62,0)); }
[[0.9,0.9],[-1.1,0.6],[0.2,1.25],[-0.7,-0.9],[1.2,-0.5]].forEach(bp=>{ nz.add(sph(0.2, std({color:[0xe56b9a,0xd94f3d,0xf2f0e6][Math.abs(bp[0]*10|0)%3],roughness:0.8}), bp[0],0.32,bp[1], 1,0.75,1)); });
// —— 谷中灵园一角（西北角，樱花树 + 墓石）——
const cm=new THREE.Group(); cm.position.set(-5.1,0,-3.5); g.add(cm);
for(let r2=0;r2<3;r2++) for(let c2=0;c2<4;c2++) cm.add(box(0.15,0.3+((r2+c2)%2)*0.08,0.09, M.grey, -0.75+c2*0.42, 0.32, -0.5+r2*0.45));
const pnk=tree(-0.2,-1.0,1.15,pinkTree); cm.add(pnk);
people(g,8,-2.8,2.6,-0.9,0.9,0.32);
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
people(g,6,-5.5,-1.5,3.5,6.5,0.35); } },

{id:'kamakura', name:'镰仓高校前', x:0, z:0, h:5, desc:'《灌篮高手》片头那个面朝大海的铁路道口——县立镰仓高校门前、江之岛电铁镰仓高校前站旁。位于东京西南约 55 公里处，地图上为示意位置。', make:g=>{
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
{id:'ghibli', name:'三鹰之森吉卜力美术馆', x:0, z:0, h:3.2, desc:'宫崎骏亲自设计的美术馆，藏在井之头公园的绿荫里：彩色拼布外墙、旋转楼梯、屋顶花园里站着天空之城的机器人兵。完全预约制，现场买不到票。', make:g=>{
g.add(box(11.5,0.3,10, std({color:0x7aa763,roughness:1}), 0,0.15,0));
const pond=sph(1.5, M.water, -4.2,0.3,3.4, 1.25,0.1,0.9); g.add(pond);
g.add(box(4.5,0.06,1.1, std({color:0xd8cbb2,roughness:1}), 0.6,0.32,2.6));
const cream=texMat(facadeTex('#f3e5cf'));
const mus=new THREE.Group(); mus.position.set(0.5,0.3,-1.0); g.add(mus);
mus.add(box(4.6,1.5,3.2, cream, 0,0.75,0));
mus.add(box(3.9,1.25,2.7, cream, -0.2,2.1,0));
const patchC=['#e8a2b4','#f2d38a','#a8c8a0','#9db8d6'];
patchC.forEach((c,i)=>mus.add(box(0.85,1.0,0.06, std({color:c,roughness:0.85}), -1.7+i*1.05,0.8,1.63)));
[[2.0,0.9],[-1.2,2.15],[0.6,2.15]].forEach(w=>mus.add(box(0.5,0.62,0.06, std({color:0xffca7a,emissive:0xcf8a2e,emissiveIntensity:0.55,roughness:0.4}), w[0],w[1],1.38)));
const twr=cyl(0.85,0.95,2.7, cream, -2.6,0,14); mus.add(twr);
mus.add(cone(1.15,0.8, texMat(kawaraTex()), -2.6,0,12,3.1));
const st=cyl(0.55,0.62,3.6, std({color:0xe6d7bd,roughness:0.9}), 2.65,0,12); mus.add(st);
for(let k=0;k<5;k++){ const sb=box(0.5,0.09,0.34, M.dark, 2.65+Math.cos(k*1.15)*0.72, 0.6+k*0.55, Math.sin(k*1.15)*0.72); sb.rotation.y=-k*1.15; mus.add(sb); }
mus.add(cone(0.8,0.6, texMat(kawaraTex()), 2.65,0,10,3.9));
mus.add(hipRoof(4.9,0.75,3.5, texMat(kawaraTex()), 0,1.5,0));
mus.add(box(3.4,0.14,2.2, std({color:0x6f9a58,roughness:1}), -0.2,2.8,0));
const botM=std({color:0x59614f,roughness:0.55,metalness:0.45});
const bot=new THREE.Group(); bot.position.set(-0.7,2.87,-0.3); mus.add(bot);
bot.add(box(0.16,0.62,0.2, botM, -0.16,0.31,0)); bot.add(box(0.16,0.62,0.2, botM, 0.16,0.31,0));
bot.add(box(0.56,0.78,0.34, botM, 0,0.98,0));
const armL=box(0.13,1.05,0.16, botM, -0.48,0.85,0); armL.rotation.z=0.16; bot.add(armL);
const armR=box(0.13,1.05,0.16, botM, 0.48,0.85,0); armR.rotation.z=-0.16; bot.add(armR);
bot.add(box(0.36,0.34,0.32, botM, 0,1.56,0));
bot.add(box(0.6,0.3,0.1, glowMat(signTex('ジブリ美術館','#5b4636','#ffe9b0',false)), 0,2.05,1.78));
const booth=new THREE.Group(); booth.position.set(2.2,0.3,2.4); g.add(booth);
booth.add(box(1.15,1.15,0.9, std({color:0xe9dcc0,roughness:0.9}), 0,0.57,0));
booth.add(box(0.7,0.6,0.06, M.dark, 0,0.68,0.47));
const toto=sph(0.26, std({color:0x5d707e,roughness:0.8}), 0,0.66,0.44, 1,1.1,0.4); booth.add(toto);
booth.add(hipRoof(1.4,0.4,1.1, texMat(kawaraTex()), 0,1.15,0));
const cafe=new THREE.Group(); cafe.position.set(-3.4,0.3,0.9); g.add(cafe);
cafe.add(box(2.3,1.1,1.9, M.white, 0,0.55,0));
cafe.add(hipRoof(2.6,0.6,2.2, std({color:0xd97c2e,roughness:0.8}), 0,1.1,0));
cafe.add(box(1.5,0.34,0.08, glowMat(signTex('麦わらぼうし','#7c2d12','#fff7e0',false)), 0,0.95,0.97));
[-1.9,1.9].forEach(x=>mus.add(box(0.28,0.8,0.1, std({color:0x4d7c43,roughness:1}), x,1.1,1.64)));
g.add(tree(-4.6,-3.4,1.15)); g.add(tree(4.9,-3.8,1.05)); g.add(tree(4.4,3.6,0.95,pinkTree)); g.add(tree(-5.0,0.4,1.0)); g.add(tree(2.8,-4.3,0.9));
people(g,7,-2.5,3.5,1.8,3.2,0.32);
} },
{id:'kasukabe', name:'春日部', x:0, z:0, h:3.4, desc:'《蜡笔小新》的故乡：春日部站东口有野原一家铜像，站前的伊藤洋华堂就是动画里「佐藤九日堂」的原型，还有一座能参观的「地下神殿」防洪设施。', make:g=>{
g.add(box(11.5,0.3,10, texMat(paveTex(),{roughness:1}), 0,0.15,0));
const store=new THREE.Group(); store.position.set(-1.4,0.3,-2.4); g.add(store);
store.add(box(6.6,3.3,3.4, texMat(facadeTex('#eef0f2')), 0,1.65,0));
store.add(box(6.7,0.5,3.5, std({color:0x2456a6,roughness:0.6}), 0,3.5,0));
store.add(box(6.7,0.16,3.5, std({color:0xd23b3b,roughness:0.6}), 0,3.2,0));
store.add(box(3.6,0.62,0.1, glowMat(signTex('イトーヨーカドー','#ffffff','#d23b3b',false)), 0,2.6,1.73));
store.add(box(2.6,0.9,0.08, M.glass, 0,0.5,1.73));
const stn=new THREE.Group(); stn.position.set(1.6,0.3,3.1); g.add(stn);
stn.add(box(5.8,1.35,1.7, texMat(facadeTex('#e8e2d4')), 0,0.67,0));
stn.add(box(2.2,0.55,0.1, glowMat(signTex('春日部駅','#1f3a5f','#ffffff',false)), 0,1.05,0.87));
stn.add(box(8.6,0.22,1.15, M.grey, 0,1.62,-0.4));
[-3.6,-1.2,1.2,3.6].forEach(x=>stn.add(box(0.18,1.5,0.18, M.grey, x,0.75,-0.4)));
const train=new THREE.Group(); train.position.set(-3.2,1.78,2.7); g.add(train);
for(let cix=0;cix<3;cix++){ const car=new THREE.Group(); car.position.x=cix*1.55; train.add(car);
  car.add(box(1.45,0.62,0.85, M.white, 0,0.31,0));
  car.add(box(1.45,0.14,0.87, std({color:0x2456a6,roughness:0.5}), 0,0.5,0));
  car.add(box(1.45,0.1,0.87, std({color:0xd23b3b,roughness:0.5}), 0,0.13,0)); }
ANIM.push(t=>{ train.position.x=-3.4+((t*0.55)%7.4); });
const bz=std({color:0x8a6b34,roughness:0.38,metalness:0.65});
const stat=new THREE.Group(); stat.position.set(2.9,0.3,0.7); g.add(stat);
stat.add(box(0.95,0.42,0.6, M.grey, 0,0.21,0));
stat.add(sph(0.17, bz, -0.2,0.78,0, 1,1.15,1)); stat.add(box(0.3,0.4,0.2, bz, -0.2,0.5,0));
stat.add(sph(0.13, bz, 0.22,0.68,0, 1,1.1,1)); stat.add(box(0.22,0.28,0.16, bz, 0.22,0.44,0));
const house=new THREE.Group(); house.position.set(-4.5,0.3,2.6); g.add(house);
house.add(box(2.0,1.25,1.7, texMat(facadeTex('#f6e8d8')), 0,0.62,0));
house.add(hipRoof(2.3,0.6,2.0, std({color:0xb34a3a,roughness:0.85}), 0,1.25,0));
house.add(box(0.6,0.85,0.06, std({color:0x7a5230,roughness:0.9}), 0.3,0.42,0.87));
[[-3.4,0.9],[0.4,0.9],[4.3,-0.9]].forEach((sp2,ix)=>{ g.add(box(1.15,0.95+ix*0.14,1.0, texMat(facadeTex(['#e9eef2','#f3e9d2','#e6f0e6'][ix])), sp2[0],0.62,sp2[1])); g.add(hipRoof(1.35,0.32,1.2, texMat(kawaraTex()), sp2[0],1.12+ix*0.14,sp2[1])); });
g.add(tree(5.0,-3.6,0.95)); g.add(tree(-5.2,-0.6,1.0)); g.add(tree(4.8,1.8,0.9,pinkTree));
people(g,9,-3.5,4.2,-0.6,1.6,0.32);
} }

];
