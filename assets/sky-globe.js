/* Asteriva 3D sky — lightweight, custom perspective projection on 2D Canvas.
   Only the sky itself rotates; the poster, typography and other portfolio UI stay fixed.
   This is decorative geometry, NOT astronomical positions or an astronomy calculation. */
(() => {
  'use strict';

  const canvas = document.getElementById('starCanvas');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!canvas || !ctx) return;

  const city = document.getElementById('starCity');
  const date = document.getElementById('starDate');
  const locationLabel = document.getElementById('labLocation');
  const dateLabel = document.getElementById('labMoment');
  const spinButton = document.getElementById('toggleSkySpin');
  const resetButton = document.getElementById('resetSkyView');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));

  let w = 540, h = 310;
  let yaw = -0.12, pitch = 0.10;
  let stars = [], backdrop = [], constellations = [];
  let dragging = null, spin = false, raf = 0, lastTime = 0;

  function hash(text) {
    let n = 2166136261;
    for (const c of text) { n ^= c.charCodeAt(0); n = Math.imul(n, 16777619); }
    return n >>> 0;
  }
  function prng(seed) {
    let n = seed >>> 0;
    return () => { n = (1664525 * n + 1013904223) >>> 0; return n / 4294967296; };
  }
  function point(x, y, z) { return {x, y, z}; }

  function createSky() {
    const random = prng(hash(`${city.value}|${date.value}`));
    backdrop = Array.from({length: 62}, () => ({
      x: random(), y: random(), r: 0.35 + random() * 0.95, a: .18 + random() * .42
    }));
    stars = Array.from({length: 135}, () => {
      const z = random() * 2 - 1;
      const angle = random() * Math.PI * 2;
      const r = Math.sqrt(1 - z*z);
      return {p: point(Math.cos(angle)*r, z, Math.sin(angle)*r), r: .4 + random()*1.45, a: .28 + random()*.68};
    });
    // Two modest, deliberately fictional constellations on opposing sides of the globe.
    const base = [[-.61,-.25],[-.36,.09],[-.1,-.51],[.12,-.10],[.57,-.38],[.64,.16],[.25,.48],[-.29,.56]];
    const connections = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,1],[3,6]];
    constellations = [1,-1].map((side, i) => {
      const nodes = base.map(([x,y]) => {
        let a = clamp(x + (random()-.5)*.075, -.78,.78);
        let b = clamp(y + (random()-.5)*.075, -.75,.75);
        const z = side * Math.sqrt(Math.max(.04, 1 - a*a - b*b));
        return point(side * a, b, z);
      });
      return {nodes, connections, tone: i === 0 ? '#ffd9ac' : '#a9d7ff'};
    });
    locationLabel.textContent = city.value.toUpperCase();
    const [year, month, day] = date.value.split('-').map(Number);
    const dt = new Date(Date.UTC(year, month - 1, day));
    dateLabel.textContent = Number.isNaN(dt.getTime()) ? 'SELECT A DATE' :
      new Intl.DateTimeFormat('en', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(dt).toUpperCase();
    yaw = -.12; pitch = .10;
    paint();
  }

  function rotate(p) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x = p.x*cy + p.z*sy;
    const z = p.z*cy - p.x*sy;
    return point(x, p.y*cp - z*sp, p.y*sp + z*cp);
  }
  function project(v) {
    const p = rotate(v);
    const s = 3.5 / (3.5 - p.z*.55);
    const r = Math.min(w*.36, h*.43);
    return {x: w*.57 + p.x*r*s, y: h*.47 - p.y*r*s, z:p.z, scale:s};
  }
  function line(a, b, color, alpha, thickness=1) {
    if (alpha < .012) return;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
    ctx.lineWidth = thickness; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function background() {
    const bg = ctx.createRadialGradient(w*.57,h*.42, 1, w*.57,h*.49, w*.79);
    bg.addColorStop(0,'#263f68'); bg.addColorStop(.52,'#132640'); bg.addColorStop(1,'#080f21');
    ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
    const glow = ctx.createRadialGradient(w*.57,h*.47, 5, w*.57,h*.47, Math.min(w,h)*.48);
    glow.addColorStop(0,'rgba(250,192,139,.075)'); glow.addColorStop(1,'rgba(250,192,139,0)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    for (const s of backdrop) {
      ctx.beginPath(); ctx.arc(s.x*w,s.y*h,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(220,232,254,${s.a})`; ctx.fill();
    }
  }

  function globeLines() {
    // A few gentle engraved spherical meridians/parallels; faint back, brighter front.
    const segs = 72;
    function curve(getPoint, color, alpha) {
      let prior = project(getPoint(0));
      for(let i=1;i<=segs;i++) {
        const current=project(getPoint(i/segs));
        const facing = (prior.z + current.z)/2;
        line(prior,current,color,alpha * (facing>0 ? .72 : .20),.65);
        prior = current;
      }
    }
    for(const lat of [-.82,-.41,0,.41,.82]) {
      const r=Math.sqrt(1-lat*lat);
      curve(t=>point(Math.cos(t*2*Math.PI)*r,lat,Math.sin(t*2*Math.PI)*r),'#9bbed6',.16);
    }
    for(let longitude=0;longitude<6;longitude++) {
      const a=longitude*Math.PI/6;
      curve(t=>{const phi=-Math.PI/2+t*Math.PI;return point(Math.sin(a)*Math.cos(phi),Math.sin(phi),Math.cos(a)*Math.cos(phi));},'#e0bd88',.13);
    }
  }

  function drawStars() {
    const plotted = stars.map(s=>({...project(s.p), radius:s.r,opacity:s.a}));
    plotted.sort((a,b)=>a.z-b.z);
    for (const s of plotted) {
      const alpha = s.opacity * (.16 + (s.z + 1)*.37);
      ctx.beginPath();ctx.arc(s.x,s.y,s.radius*s.scale,0,Math.PI*2);
      ctx.fillStyle=`rgba(232,241,255,${alpha})`;ctx.fill();
    }
  }

  function drawConstellations() {
    for(const shape of constellations) {
      const nodes=shape.nodes.map(project);
      for(const [a,b] of shape.connections) {
        const front=clamp((Math.min(nodes[a].z,nodes[b].z)+.10)*2.4,0,1);
        line(nodes[a],nodes[b],shape.tone,.68*front,1.2);
      }
      for(const n of nodes) {
        const front=clamp((n.z+.14)*2.8,0,1);
        if(front<=.01) continue;
        ctx.beginPath();ctx.arc(n.x,n.y,3.8*n.scale,0,2*Math.PI);
        ctx.fillStyle=shape.tone;ctx.globalAlpha=front*.12;ctx.fill();
        ctx.beginPath();ctx.arc(n.x,n.y,1.7*n.scale,0,2*Math.PI);
        ctx.globalAlpha=front*.9;ctx.fill();ctx.globalAlpha=1;
      }
    }
  }

  function paint() {
    if (!w || !h) return;
    ctx.clearRect(0,0,w,h);
    background();
    globeLines();
    drawStars();
    drawConstellations();
    // Dark lower-left wash keeps the date and city readable while the sky rotates.
    const shade=ctx.createLinearGradient(0,h*.56,0,h);
    shade.addColorStop(0,'rgba(5,10,22,0)');shade.addColorStop(1,'rgba(5,10,22,.59)');
    ctx.fillStyle=shade;ctx.fillRect(0,h*.56,w,h*.44);
    canvas.dataset.yaw = yaw.toFixed(3);
    canvas.dataset.pitch = pitch.toFixed(3);
  }

  function resize() {
    const rect=canvas.getBoundingClientRect();
    w=Math.max(1,rect.width || 540); h=Math.max(1,rect.height || w*310/540);
    const ratio=Math.min(window.devicePixelRatio || 1,2);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    paint();
  }

  function stopSpin() {
    spin=false;spinButton?.setAttribute('aria-pressed','false');
    if(spinButton)spinButton.textContent='Auto spin: off';
    cancelAnimationFrame(raf);raf=0;lastTime=0;
  }
  function loop(now) {
    if(!spin)return;
    if(document.body.dataset.mode === 'interactive' && !document.hidden) {
      const dt=lastTime?Math.min((now-lastTime)/1000,.05):0;
      yaw += dt*.20;
      paint();
    }
    lastTime=now;
    raf=requestAnimationFrame(loop);
  }
  function reset() { stopSpin();yaw=-.12;pitch=.10;paint(); }

  spinButton?.addEventListener('click',()=>{
    if(spin) {stopSpin();return;}
    if(reduced.matches)return;
    spin=true;spinButton.textContent='Auto spin: on';spinButton.setAttribute('aria-pressed','true');
    lastTime=0;raf=requestAnimationFrame(loop);
  });
  resetButton?.addEventListener('click',reset);
  reduced.addEventListener?.('change',()=>{if(reduced.matches)stopSpin();});

  canvas.addEventListener('pointerdown',event=>{
    if(dragging || (event.pointerType==='mouse' && event.button!==0))return;
    stopSpin();
    dragging={id:event.pointerId,x:event.clientX,y:event.clientY,yaw,pitch};
    canvas.classList.add('is-dragging');
    // Pointer capture is unavailable for some synthetic/embedded pointer events.
    try { canvas.setPointerCapture(event.pointerId); } catch { /* Drag still works inside canvas. */ }
  });
  canvas.addEventListener('pointermove',event=>{
    if(!dragging || event.pointerId!==dragging.id)return;
    yaw=dragging.yaw+(event.clientX-dragging.x)*.012;
    pitch=clamp(dragging.pitch+(event.clientY-dragging.y)*.009,-1.3,1.3);
    paint();
  });
  function end(event) {
    if(!dragging || event.pointerId!==dragging.id)return;
    dragging=null;canvas.classList.remove('is-dragging');
  }
  canvas.addEventListener('pointerup',end);
  canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('lostpointercapture',end);
  canvas.addEventListener('dblclick',reset);
  canvas.addEventListener('keydown',event=>{
    const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'];
    if(!keys.includes(event.key))return;
    event.preventDefault();stopSpin();
    if(event.key==='Home')return reset();
    if(event.key==='ArrowLeft') yaw-=.14;
    if(event.key==='ArrowRight') yaw+=.14;
    if(event.key==='ArrowUp') pitch=clamp(pitch-.11,-1.3,1.3);
    if(event.key==='ArrowDown') pitch=clamp(pitch+.11,-1.3,1.3);
    paint();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpin();});
  new ResizeObserver(()=>{
    // The element is hidden while Professional Mode is active.
    if(canvas.getBoundingClientRect().width > 0)resize();
  }).observe(canvas);

  window.starGlobe={regenerate:createSky,resize,reset,pause:stopSpin};
  createSky();
})();
