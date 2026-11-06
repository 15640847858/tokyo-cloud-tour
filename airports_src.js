import * as THREE from 'three';
import { M, label, box, cyl, cone, sph, std, texMat, glowMat, facadeTex, glassTex, signTex } from './builders.js';
function airportTex(labelTxt){ const cv=document.createElement('canvas'); cv.width=1024; cv.height=648; const g=cv.getContext('2d'); const SX=1024/30, SZ=648/19; const X=v=>(v+15)*SX, Z=v=>(v+9.5)*SZ;
  g.fillStyle='#6f8563'; g.fillRect(0,0,1024,648);
  for(let i=0;i<2000;i++){ g.fillStyle=Math.random()>0.5?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.05)'; g.fillRect(Math.random()*1024, Math.random()*648, 3, 3); }
  g.fillStyle='#939ba2'; g.fillRect(0, Z(-4.4), 1024, Z(4.4)-Z(-4.4));
  for(let i=0;i<1500;i++){ g.fillStyle=Math.random()>0.5?'rgba(255,255,255,0.05)':'rgba(30,34,40,0.06)'; g.fillRect(Math.random()*1024, Z(-4.4)+Math.random()*(Z(4.4)-Z(-4.4)), 3, 3); }
  g.strokeStyle='rgba(60,66,72,0.35)'; g.lineWidth=1; for(let x=-12;x<=12;x+=3){ g.beginPath(); g.moveTo(X(x),Z(-4.4)); g.lineTo(X(x),Z(4.4)); g.stroke(); } for(let z=-3;z<=3;z+=3){ g.beginPath(); g.moveTo(0,Z(z)); g.lineTo(1024,Z(z)); g.stroke(); }
  g.fillStyle='#33373b'; g.fillRect(0, Z(-8.8), 1024, Z(-5.6)-Z(-8.8));
  g.fillStyle='rgba(255,255,255,0.85)'; g.fillRect(0, Z(-8.75), 1024, 2); g.fillRect(0, Z(-5.75), 1024, 2);
  for(let x=-14;x<14;x+=2.2) g.fillRect(X(x), Z(-7.28), 26, 4);
  for(let i=0;i<8;i++) g.fillRect(X(-14.6)+i*7, Z(-8.55), 4, Z(-5.85)-Z(-8.55));
  g.save(); g.translate(X(13.4), Z(-7.2)); g.rotate(-Math.PI/2); g.fillStyle='rgba(255,255,255,0.9)'; g.font='bold 44px sans-serif'; g.textAlign='center'; g.fillText(labelTxt, 0, 14); g.restore();
  g.fillStyle='#3d4147'; g.fillRect(0, Z(-5.2), 1024, Z(-4.4)-Z(-5.2));
  g.fillStyle='#e8b93b'; for(let x=-15;x<15;x+=1.6) g.fillRect(X(x), Z(-4.85), 18, 3);
  g.strokeStyle='#e8b93b'; g.lineWidth=3;
  [-11.5,-9,-6.5,-1.5,1.2,7.2,9.8].forEach(gx=>{ g.beginPath(); g.moveTo(X(gx), Z(3.5)); g.lineTo(X(gx), Z(1.9)); g.stroke(); g.fillStyle='#e8b93b'; g.fillRect(X(gx)-9, Z(1.82), 18, 4); });
  g.fillStyle='#3a3f45'; g.fillRect(0, Z(7.6), 1024, Z(8.9)-Z(7.6));
  g.fillStyle='rgba(255,255,255,0.6)'; for(let x=-14;x<14;x+=2.4) g.fillRect(X(x), Z(8.2), 22, 3);
  const t=new THREE.CanvasTexture(cv); t.anisotropy=8; t.colorSpace=THREE.SRGBColorSpace; return t; }
function planeTex(stripe){ const cv=document.createElement('canvas'); cv.width=256; cv.height=512; const g=cv.getContext('2d');
  g.fillStyle='#f4f6f8'; g.fillRect(0,0,256,512);
  g.fillStyle='#dfe5ea'; g.fillRect(0,470,256,42);
  [64,192].forEach(cx=>{ g.fillStyle='#'+stripe.toString(16).padStart(6,'0'); g.fillRect(cx-26,120,52,470);
    g.fillStyle='rgba(20,28,38,0.88)';
    for(let y=140;y<560;y+=17){ g.beginPath(); g.roundRect(cx-19,y,9,6,3); g.fill(); g.beginPath(); g.roundRect(cx+10,y,9,6,3); g.fill(); }
    g.strokeStyle='rgba(40,50,62,0.55)'; g.lineWidth=2; g.strokeRect(cx-22,96,44,54); g.strokeRect(cx-22,428,44,54); });
  const t=new THREE.CanvasTexture(cv); t.anisotropy=4; t.colorSpace=THREE.SRGBColorSpace; return t; }
function wingGeo(span, rootC, tipC, sweep){ const sh=new THREE.Shape();
  sh.moveTo(rootC/2, 0); sh.lineTo(-sweep+tipC/2, span/2); sh.lineTo(-sweep-tipC/2, span/2); sh.lineTo(-rootC/2, 0); sh.lineTo(-sweep-tipC/2, -span/2); sh.lineTo(-sweep+tipC/2, -span/2); sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh, {depth:0.055, bevelEnabled:false}); geo.rotateX(-Math.PI/2); return geo; }
function makePlane2(stripe, tail){
  const g=new THREE.Group(); const W=M.white; const tailM=std({color:tail,roughness:0.5});
  const fusM=texMat(planeTex(stripe),{roughness:0.35,metalness:0.08});
  const fusGeo=new THREE.CylinderGeometry(0.31,0.31,3.3,18,1,false,Math.PI/2);
  const fus=new THREE.Mesh(fusGeo, fusM); fus.rotation.z=Math.PI/2; fus.position.y=0.66; g.add(fus);
  const nose=sph(0.31, W, 0,0,0); nose.scale.set(1.5,1,1); nose.position.set(1.68,0.66,0); g.add(nose);
  const tailC=new THREE.Mesh(new THREE.CylinderGeometry(0.31,0.09,0.85,14), W); tailC.rotation.z=Math.PI/2; tailC.position.set(-1.98,0.74,0); g.add(tailC);
  g.add(box(0.36,0.13,0.46, M.dark, 1.86,0.86,0)).children;
  const cock=g.children[g.children.length-1]; cock.rotation.z=-0.45;
  const wing=new THREE.Mesh(wingGeo(3.7, 0.78, 0.3, 0.62), std({color:0xd8dde2,roughness:0.38,metalness:0.35})); wing.position.set(0.02,0.44,0); g.add(wing);
  [-1.82,1.82].forEach(z=>{ const wl=box(0.2,0.24,0.035, tailM, -0.5,0.56,z); wl.rotation.x=(z>0?-1:1)*0.25; g.add(wl); });
  [-0.78,0.78].forEach(z=>{ g.add(box(0.24,0.17,0.045, M.grey, 0.12,0.42,z));
    const nac=cyl(0.115,0.12,0.44, W, 0,0,12); nac.rotation.z=Math.PI/2; nac.position.set(0.14,0.3,z); g.add(nac);
    const intake=cyl(0.095,0.095,0.03, M.dark, 0,0,12); intake.rotation.z=Math.PI/2; intake.position.set(0.37,0.3,z); g.add(intake); });
  const finSh=new THREE.Shape(); finSh.moveTo(0.28,0); finSh.lineTo(0.06,0.78); finSh.lineTo(-0.3,0.8); finSh.lineTo(-0.52,0.02); finSh.closePath();
  const finGeo=new THREE.ExtrudeGeometry(finSh, {depth:0.06, bevelEnabled:false}); finGeo.translate(0,0,-0.03);
  const fin=new THREE.Mesh(finGeo, tailM); fin.position.set(-2.02,0.82,0); g.add(fin);
  [-0.035,0.035].forEach(z=>{ const dot=sph(0.09, W, 0,0,0); dot.scale.set(1,1,0.4); dot.position.set(-2.22,1.32,z*1.6); g.add(dot); });
  const stab=new THREE.Mesh(wingGeo(1.35, 0.4, 0.18, 0.3), std({color:0xd8dde2,roughness:0.38,metalness:0.35})); stab.position.set(-2.28,0.8,0); g.add(stab);
  [[1.3,0,1],[-0.3,0.3,2],[-0.3,-0.3,2]].forEach(([gx,gz])=>{ g.add(cyl(0.022,0.022,0.3, M.dark, 0,0,6)).children; const leg=g.children[g.children.length-1]; leg.position.set(gx,0.18,gz);
    const wh=cyl(0.075,0.075,0.05, M.dark, 0,0,10); wh.rotation.x=Math.PI/2; wh.position.set(gx,0.07,gz); g.add(wh); });
  return g; }
function jetBridge(gx, gz, ang){ const gr=new THREE.Group(); gr.position.set(gx,0.3,gz); gr.rotation.y=ang||0;
  gr.add(box(0.3,1.05,0.3, M.grey, 0,0.52,0)); const arm=box(0.36,0.44,1.7, M.white, 0,1.18,-0.8); gr.add(arm); gr.add(box(0.44,0.5,0.3, M.dark, 0,1.18,-1.6)); return gr; }
function airportHND(x,z,scene,pickables){
  const g=new THREE.Group(); g.position.set(x,0,z); g.scale.setScalar(0.85);
  g.add(box(30,0.3,19, texMat(airportTex('34R'),{roughness:0.95}), 0,0.15,0));
  const t3=new THREE.Group(); t3.position.set(-8.2,0.3,5.6); g.add(t3);
  const t3g=glassTex('#b9d2e4'); t3g.repeat.set(6,2);
  t3.add(box(10.6,2.5,3.1, texMat(t3g), 0,1.25,0));
  const roofM=std({color:0xd8dde2,roughness:0.35,metalness:0.55});
  const r1=box(10.9,0.09,2.05, roofM, 0,2.98,-0.88); r1.rotation.x=0.36; t3.add(r1);
  const r2=box(10.9,0.09,2.05, roofM, 0,2.98,0.88); r2.rotation.x=-0.36; t3.add(r2);
  t3.add(box(10.7,0.35,0.5, texMat(glassTex('#cfe2f2')), 0,3.28,0));
  t3.add(box(8.2,0.12,1.1, M.dark, 0,1.55,-2.05));
  t3.add(box(3.4,0.62,0.14, glowMat(signTex('羽田空港 HND','#0c4a6e','#ffffff',false)), 0,2.1,-1.62));
  const t1=new THREE.Group(); t1.position.set(0.6,0.3,5.7); g.add(t1);
  t1.add(box(8.6,2.3,3.0, texMat(facadeTex('#d5dbe1')), 0,1.15,0));
  const t1r1=box(8.8,0.08,1.9, roofM, 0,2.62,-0.8); t1r1.rotation.x=0.3; t1.add(t1r1);
  const t1r2=box(8.8,0.08,1.9, roofM, 0,2.62,0.8); t1r2.rotation.x=-0.3; t1.add(t1r2);
  t1.add(box(8.7,0.4,2.6, texMat(glassTex('#c3d5e4')), 0,0.5,0));
  t1.add(box(2.8,0.55,0.14, glowMat(signTex('第1ターミナル','#7c2d12','#ffffff',false)), 0,1.8,-1.57));
  const t2=new THREE.Group(); t2.position.set(9.3,0.3,5.7); g.add(t2);
  t2.add(box(6.2,2.5,3.0, texMat(facadeTex('#e3e7ec')), 0,1.25,0));
  t2.add(box(6.4,0.35,3.2, M.dark, 0,2.68,0));
  t2.add(box(6.3,0.3,0.1, std({color:0x2563eb,roughness:0.5}), 0,1.55,-1.53));
  t2.add(box(6.3,0.3,0.1, std({color:0x2563eb,roughness:0.5}), 0,0.75,-1.53));
  t2.add(box(2.8,0.55,0.14, glowMat(signTex('第2ターミナル','#1e3a5f','#ffffff',false)), 0,2.0,-1.57));
  const twr=new THREE.Group(); twr.position.set(4.6,0.3,3.9); g.add(twr);
  twr.add(cyl(0.15,0.32,5.4, M.white, 0,0,10));
  const cab=cyl(0.54,0.4,0.68, M.glass, 0,0,12); cab.position.y=5.72; twr.add(cab);
  const tr2=cyl(0.6,0.6,0.12, M.dark, 0,0,12); tr2.position.y=6.12; twr.add(tr2);
  twr.add(cyl(0.025,0.025,0.95, M.dark, 0,0,6));
  const bc=sph(0.07, new THREE.MeshBasicMaterial({color:0xff3333}), 4.6,6.85,3.9); g.add(bc);
  const gates=[[-11.5,0x2563eb,0x1e40af,1.12],[-9,0xdc2626,0xdc2626,1.0],[-6.5,0x2563eb,0x1e40af,1.05],[-1.5,0xdc2626,0xdc2626,0.95],[1.2,0x2563eb,0x1e40af,1.0],[7.2,0x2563eb,0x1e40af,0.95],[9.8,0x0ea5e9,0x0369a1,0.9]];
  gates.forEach(([gx,stripe,tail,sc],i)=>{ g.add(jetBridge(gx, 3.55, (i%2? -0.12:0.12))); if(i!==3){ const pl=makePlane2(stripe,tail); pl.position.set(gx+0.4,0.3,1.15); pl.rotation.y=-Math.PI/2+(i%2?0.05:-0.05); pl.scale.setScalar(sc); g.add(pl); } });
  g.add(box(3.4,2.9,2.6, texMat(facadeTex('#c9d1d9')), 13.4,1.45,5.9));
  const bus=new THREE.Group(); bus.add(box(1.9,0.66,0.75,std({color:0x0891b2,roughness:0.5}),0,0.12,0)); bus.add(box(1.7,0.32,0.77, M.glass, 0,0.56,0)); bus.position.set(-3.5,0.32,8.2); g.add(bus);
  const lb=label('羽田 HND', 1.15, '#7c2d12'); lb.position.y=8.6; g.add(lb);
  g.userData.spot={id:'hnd', x:x, z:z, name:'羽田机场', desc:'位于东京湾边，距市中心约 15 公里。京急线或单轨电车 15 分钟左右就能进城，是离市区最近的机场。'};
  g.traverse(o=>{o.userData.spot=g.userData.spot;}); scene.add(g); pickables.push(g); return g;
}
function airportNRT(x,z,scene,pickables){
  const g=new THREE.Group(); g.position.set(x,0,z); g.scale.setScalar(0.85);
  g.add(box(30,0.3,19, texMat(airportTex('16R'),{roughness:0.95}), 0,0.15,0));
  const roofW=std({color:0xe8eaed,roughness:0.4,metalness:0.4});
  const t1=new THREE.Group(); t1.position.set(-5.8,0.3,5.5); g.add(t1);
  const t1g=glassTex('#aec6da'); t1g.repeat.set(6,2);
  t1.add(box(10.5,2.8,3.4, texMat(t1g), 0,1.4,0));
  const a1=box(11.0,0.09,2.4, roofW, 0,3.2,-1.05); a1.rotation.x=0.33; t1.add(a1);
  const a2=box(11.0,0.09,2.4, roofW, 0,3.2,1.05); a2.rotation.x=-0.33; t1.add(a2);
  [-6.9,6.9].forEach((wx,i)=>{ const w=box(4.0,2.1,2.5, texMat(facadeTex('#ccd3da')), wx,1.05,0.3); w.rotation.y=(i? -1:1)*0.32; t1.add(w); });
  t1.add(box(3.6,0.62,0.14, glowMat(signTex('成田空港 NRT','#7c2d12','#ffffff',false)), 0,2.3,-1.78));
  t1.add(box(7.6,0.12,1.1, M.dark, 0,1.5,-2.15));
  t1.add(box(9.8,0.42,0.3, texMat(glassTex('#cfe2f2')), 0,0.45,-1.85));
  const pier1=box(1.8,1.8,4.6, texMat(glassTex('#b9d2e4')), -5.8,1.2,1.4); g.add(pier1);
  const t2=new THREE.Group(); t2.position.set(7.6,0.3,5.5); g.add(t2);
  t2.add(box(8.4,2.4,3.0, texMat(facadeTex('#d8dde3')), 0,1.2,0));
  const b1=box(8.7,0.08,2.1, roofW, 0,2.72,-0.85); b1.rotation.x=0.24; t2.add(b1);
  const b2=box(8.7,0.08,2.1, roofW, 0,2.72,0.85); b2.rotation.x=-0.24; t2.add(b2);
  t2.add(box(2.8,0.55,0.14, glowMat(signTex('第2ターミナル','#1e3a5f','#ffffff',false)), 0,1.9,-1.57));
  t2.add(box(6.4,0.12,1.0, M.dark, 0,1.35,-2.05));
  const pier2=box(1.7,1.7,4.4, texMat(glassTex('#b9d2e4')), 7.6,1.15,1.4); g.add(pier2);
  const t3=new THREE.Group(); t3.position.set(13.2,0.3,5.6); g.add(t3);
  t3.add(box(3.0,1.5,2.4, M.white, 0,0.75,0));
  t3.add(box(3.1,0.34,2.5, std({color:0x2563eb,roughness:0.5}), 0,1.32,0));
  t3.add(box(1.9,0.5,0.12, glowMat(signTex('第3ターミナル','#1d4ed8','#ffffff',false)), 0,0.85,-1.26));
  const twr=new THREE.Group(); twr.position.set(3.2,0.3,3.4); g.add(twr);
  twr.add(cyl(0.12,0.27,6.6, M.white, 0,0,10));
  const cab=cyl(0.5,0.37,0.7, M.glass, 0,0,12); cab.position.y=6.9; twr.add(cab);
  const tr2=cyl(0.56,0.56,0.12, M.dark, 0,0,12); tr2.position.y=7.3; twr.add(tr2);
  const ant=cyl(0.02,0.02,1.1, M.dark, 0,0,6); ant.position.y=7.85; twr.add(ant);
  const twr2=new THREE.Group(); twr2.position.set(-0.6,0.3,3.8); g.add(twr2);
  twr2.add(cyl(0.14,0.26,3.4, M.white, 0,0,10));
  const cab2=cyl(0.44,0.34,0.55, M.dark, 0,0,12); cab2.position.y=3.6; twr2.add(cab2);
  const spotsP=[[-8.3,1.3,-Math.PI/2,0x2563eb,0x1e40af,1.1],[-3.3,1.3,Math.PI/2,0xdc2626,0xdc2626,1.05],[-8.6,4.1,-Math.PI/2,0x0ea5e9,0x0369a1,1.0],[5.2,1.3,-Math.PI/2,0x2563eb,0x1e40af,1.05],[10.2,1.5,Math.PI/2,0xdc2626,0xdc2626,1.0],[12.6,3.4,-Math.PI/2,0xf59e0b,0xec4899,0.85]];
  spotsP.forEach(([px,pz,ry,stripe,tail,sc],i)=>{ const pl=makePlane2(stripe,tail); pl.position.set(px,0.3,pz); pl.rotation.y=ry; pl.scale.setScalar(sc); g.add(pl); });
  [[-11.5,3.55],[1.2,3.55],[6.2,3.55],[9.6,3.55],[-7.4,3.55],[11.8,3.55]].forEach(([gx],i)=>g.add(jetBridge(gx, 3.55, (i%2? -0.12:0.12))));
  [[-12.6,2.2,0x2563eb],[-12.6,3.1,0xdc2626],[-11.7,2.65,0x0ea5e9]].forEach(([cx,cz,cc])=>g.add(box(1.1,0.55,0.5, std({color:cc,roughness:0.6}), cx,0.58,cz)));
  g.add(box(3.2,2.6,2.4, texMat(facadeTex('#c9d1d9')), -13.6,1.3,5.9));
  const bus2=new THREE.Group(); bus2.add(box(1.9,0.66,0.75,std({color:0x1d4ed8,roughness:0.5}),0,0.12,0)); bus2.add(box(1.7,0.32,0.77, M.glass, 0,0.56,0)); bus2.position.set(2.5,0.62,8.2); g.add(bus2);
  [[-7.6,2.9],[5.9,2.9],[11.9,4.3]].forEach(([vx,vz])=>{ const sv=new THREE.Group(); sv.add(box(0.85,0.4,0.45, M.white, 0,0.2,0)); sv.add(box(0.1,0.08,0.1, new THREE.MeshBasicMaterial({color:0xffb020}), 0.1,0.44,0)); sv.position.set(vx,0.3,vz); g.add(sv); });
  const lb=label('成田 NRT', 1.15, '#7c2d12'); lb.position.y=9.6; g.add(lb);
  g.userData.spot={id:'nrt', x:x, z:z, name:'成田机场', desc:'位于千叶县成田市，距市中心约 60 公里（地图已压缩）。进城首选 Skyliner、成田特快 NEX 或 Access 特快。'};
  g.traverse(o=>{o.userData.spot=g.userData.spot;}); scene.add(g); pickables.push(g); return g;
}

export { airportHND, airportNRT };
