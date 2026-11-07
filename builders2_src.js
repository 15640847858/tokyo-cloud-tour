import * as THREE from 'three';
import { M, ANIM, box, cyl, cone, sph, beam, cnv, std, texMat, glowMat, facadeTex, glassTex, signTex, hipRoof, tree, pinkTree, treeMat, people } from './builders.js';

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
const pnk=pinkTree(-0.2,-1.0,1.15); cm.add(pnk);
people(g,8,-2.8,2.6,-0.9,0.9,0.32);
} }

];
