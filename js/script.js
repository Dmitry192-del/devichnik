// ─── Cursor ────────────────────────────────────────────────────
const cursorEl = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
const isTouch = window.matchMedia('(hover:none) and (pointer:coarse)').matches;

if(isTouch){
  cursorEl.style.transition   = 'opacity .25s ease';
  cursorRing.style.transition = 'opacity .25s ease, transform .15s ease';
  document.addEventListener('touchmove', e=>{
    const t = e.touches[0];
    mx=t.clientX; my=t.clientY;
    cursorEl.style.opacity   = '1';
    cursorRing.style.opacity = '1';
  }, {passive:true});
  document.addEventListener('touchstart', e=>{
    const t = e.touches[0];
    mx=t.clientX; my=t.clientY;
    cursorEl.style.opacity   = '1';
    cursorRing.style.opacity = '1';
  }, {passive:true});
  document.addEventListener('touchend',   ()=>{ cursorEl.style.opacity='0'; cursorRing.style.opacity='0'; });
  document.addEventListener('touchcancel',()=>{ cursorEl.style.opacity='0'; cursorRing.style.opacity='0'; });
  cursorEl.style.opacity='0'; cursorRing.style.opacity='0';
  cursorEl.style.display='block'; cursorRing.style.display='block';
} else {
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
}

(function animCursor(){
  rx+=(mx-rx)*.18; ry+=(my-ry)*.18;
  cursorEl.style.left=mx+'px'; cursorEl.style.top=my+'px';
  cursorRing.style.left=rx+'px'; cursorRing.style.top=ry+'px';
  requestAnimationFrame(animCursor);
})();

// ─── Confetti ──────────────────────────────────────────────────
const cCvs=document.getElementById('confetti-canvas');
const cCtx=cCvs.getContext('2d');
let W,H,parts=[],tabVisible=true;
function resizeC(){W=cCvs.width=window.innerWidth;H=cCvs.height=window.innerHeight}
resizeC();
let resizeT; window.addEventListener('resize',()=>{clearTimeout(resizeT);resizeT=setTimeout(resizeC,200)});
document.addEventListener('visibilitychange',()=>{tabVisible=!document.hidden});
const COLS=['#f2c4c4','#d4728a','#f7e9d7','#a84e65'];
function rp(){return{x:Math.random()*W,y:Math.random()*H,r:Math.random()*4+2,d:Math.random()*.6+.3,color:COLS[Math.random()*COLS.length|0],angle:Math.random()*360,spin:(Math.random()-.5)*3,vx:(Math.random()-.5)*1,alpha:Math.random()*.5+.2}}
for(let i=0;i<28;i++) parts.push(rp());
function drawP(p){cCtx.save();cCtx.globalAlpha=p.alpha;cCtx.translate(p.x,p.y);cCtx.rotate(p.angle*Math.PI/180);cCtx.fillStyle=p.color;cCtx.beginPath();cCtx.arc(0,0,p.r,0,Math.PI*2);cCtx.fill();cCtx.restore()}
let lastC=0;
(function animC(ts){
  requestAnimationFrame(animC);
  if(!tabVisible) return;
  if(ts-lastC<33) return; lastC=ts;
  cCtx.clearRect(0,0,W,H);
  parts.forEach(p=>{p.y+=p.d;p.x+=p.vx;p.angle+=p.spin;if(p.y>H+10)Object.assign(p,rp(),{y:-10});drawP(p)});
})();

// ─── Scroll reveal ─────────────────────────────────────────────
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.12});
document.querySelectorAll('.reveal,.section-title,.section-sub,.program-item,.palette').forEach(el=>obs.observe(el));
document.querySelectorAll('.program-item').forEach((el,i)=>el.style.transitionDelay=(i*.12)+'s');

// ─── Countdown ─────────────────────────────────────────────────
const EVENT_DATE = new Date('2026-06-13T00:00:00+04:00');
function updateCD(){
  const diff = EVENT_DATE - Date.now();
  if(diff <= 0){
    document.getElementById('cd-grid').style.display='none';
    document.getElementById('cd-done').style.display='block';
    return;
  }
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);
  document.getElementById('cd-d').textContent = String(days).padStart(2,'0');
  document.getElementById('cd-h').textContent = String(hours).padStart(2,'0');
  document.getElementById('cd-m').textContent = String(mins).padStart(2,'0');
  document.getElementById('cd-s').textContent = String(secs).padStart(2,'0');
}
updateCD(); setInterval(updateCD, 1000);

// ─── Fireworks in closing section ──────────────────────────────
const fwCvs=document.getElementById('fw-canvas');
const fwCtx=fwCvs.getContext('2d');
let fwW,fwH,rockets=[],fwActive=false;
function resizeFW(){
  const rect=fwCvs.parentElement.getBoundingClientRect();
  fwCvs.width=fwW=rect.width;
  fwCvs.height=fwH=rect.height;
}
window.addEventListener('resize',resizeFW);

function launchRocket(){
  const x=fwW*(.2+Math.random()*.6);
  const targetY=fwH*(.1+Math.random()*.35);
  const color=`hsl(${Math.random()*60+320},80%,65%)`;
  rockets.push({x,y:fwH,targetY,vy:-6-Math.random()*4,color,exploded:false,particles:[]});
}

function explode(r){
  r.exploded=true;
  for(let i=0;i<60;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=2+Math.random()*4;
    r.particles.push({x:r.x,y:r.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,alpha:1,color:r.color,r:Math.random()*3+1});
  }
}

function animFW(){
  if(!fwActive||document.hidden){requestAnimationFrame(animFW);return}
  fwCtx.clearRect(0,0,fwW,fwH);
  rockets.forEach(r=>{
    if(!r.exploded){
      r.y+=r.vy;
      fwCtx.beginPath();fwCtx.arc(r.x,r.y,3,0,Math.PI*2);
      fwCtx.fillStyle=r.color;fwCtx.fill();
      if(r.y<=r.targetY)explode(r);
    }else{
      r.particles.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.alpha-=.015;
        if(p.alpha>0){
          fwCtx.save();fwCtx.globalAlpha=p.alpha;
          fwCtx.beginPath();fwCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
          fwCtx.fillStyle=p.color;fwCtx.fill();fwCtx.restore();
        }
      });
      r.particles=r.particles.filter(p=>p.alpha>0);
    }
  });
  rockets=rockets.filter(r=>!r.exploded||r.particles.length>0);
  requestAnimationFrame(animFW);
}
animFW();

const fwObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting&&!fwActive){
      fwActive=true; resizeFW();
      let count=0;
      const burst=setInterval(()=>{
        launchRocket(); count++;
        if(count>=8)clearInterval(burst);
      },500);
    }
  });
},{threshold:.3});
fwObs.observe(document.querySelector('.closing'));
// ─── Slider ────────────────────────────────────────────────────
(function(){
  const track   = document.getElementById('slider-track');
  const dotsBox = document.getElementById('slider-dots');
  const slCur   = document.getElementById('sl-cur');
  const slTotal = document.getElementById('sl-total');
  const btnPrev = document.getElementById('sl-prev');
  const btnNext = document.getElementById('sl-next');
  if(!track) return;

  const slides = Array.from(track.querySelectorAll('.slide'));
  const N = slides.length;
  slTotal.textContent = N;
  let current = 0;

  slides.forEach((_,i)=>{
    const d = document.createElement('div');
    d.className = 'sl-dot' + (i===0?' active':'');
    d.onclick = ()=> goTo(i);
    dotsBox.appendChild(d);
  });

  function getDots(){ return Array.from(dotsBox.querySelectorAll('.sl-dot')); }

  const captions = [
    '',
    'Мы всегда были, есть и будем в твоей жизни, очень тебя ценим и любим! Верим что с Ильдаром ты станешь самой любимой и счастливой 💕',
    'Между этими кадрами — целая жизнь, полная любви 🌸',
    'Между этими кадрами — целая жизнь, полная любви 🌸',
    'Пусть предстоящая семейная жизнь будет праздником каждый день ✨',
    'Хочу чтобы в твоей жизни были только правильные люди. Ты для меня очень важный человек 💗',
    'Пусть каждый момент будет наполнен смехом и счастливыми воспоминаниями 🎀',
    'Надеюсь Ильдар уже обучен фотосъёмке. Потому что такую красоту надо уметь запечатлеть! Желаю ярких воспоминаний и нежных чувств не только на фотографиях, но и в памяти! 📸',
    'Пусть ваш семейный очаг горит ярче солнца, согревая вас и ваших будущих детей. Желаю, чтобы все ваши мечты сбывались, а совместные планы воплощались в реальность 🔥',
    'Пусть твои глаза всегда сияют от счастья и огонёк в них никогда не угаснет! ✨',
  ];
  const captionEl = document.getElementById('slide-caption-text');

  function goTo(idx, smooth=true){
    current = (idx + N) % N;
    const slide = slides[current];
    const trackW = track.offsetWidth;
    const slideL = slide.offsetLeft;
    const slideW = slide.offsetWidth;
    track.scrollTo({ left: slideL - (trackW - slideW)/2, behavior: smooth?'smooth':'instant' });
    slides.forEach((s,i)=> s.classList.toggle('active', i===current));
    getDots().forEach((d,i)=> d.classList.toggle('active', i===current));
    slCur.textContent = current + 1;
    if(captionEl){
      captionEl.classList.remove('visible');
      captionEl.textContent = captions[current] || '';
      if(captions[current]) setTimeout(()=>captionEl.classList.add('visible'), 50);
    }
  }

  btnPrev.onclick = ()=> goTo(current - 1);
  btnNext.onclick = ()=> goTo(current + 1);

  let scrollTimer;
  track.addEventListener('scroll', ()=>{
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(()=>{
      const center = track.scrollLeft + track.offsetWidth/2;
      let closest = 0, minDist = Infinity;
      slides.forEach((s,i)=>{
        const dist = Math.abs(s.offsetLeft + s.offsetWidth/2 - center);
        if(dist < minDist){ minDist=dist; closest=i; }
      });
      if(closest !== current){
        current = closest;
        slides.forEach((s,i)=> s.classList.toggle('active', i===current));
        getDots().forEach((d,i)=> d.classList.toggle('active', i===current));
        slCur.textContent = current + 1;
        if(captionEl){
          captionEl.classList.remove('visible');
          captionEl.textContent = captions[current] || '';
          if(captions[current]) setTimeout(()=>captionEl.classList.add('visible'), 50);
        }
      }
    }, 100);
  }, {passive:true});

  let dragging=false, dx0=0, sx0=0;
  track.addEventListener('mousedown', e=>{ dragging=true; dx0=e.clientX; sx0=track.scrollLeft; track.style.userSelect='none'; });
  window.addEventListener('mousemove', e=>{ if(!dragging)return; track.scrollLeft=sx0-(e.clientX-dx0); });
  window.addEventListener('mouseup',   ()=>{ dragging=false; track.style.userSelect=''; });

  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  let lbIdx=0;
  function openLB(i){
    const imgs = slides.map(s=>s.querySelector('img')).filter(Boolean);
    if(!imgs[i])return;
    lbIdx=i; lbImg.src=imgs[i].src; openLightbox();
  }
  slides.forEach((s,i)=>{
    s.addEventListener('click', ()=>{ if(!dragging) openLB(i); });
  });
  function openLightbox(){ lightbox.classList.add('open'); document.body.style.overflow='hidden'; if(captionEl) captionEl.style.visibility='hidden'; }
  function closeLightbox(){ lightbox.classList.remove('open'); document.body.style.overflow=''; if(captionEl) captionEl.style.visibility=''; }
  document.getElementById('lb-close').onclick = closeLightbox;
  lightbox.addEventListener('click', e=>{ if(e.target===lightbox) closeLightbox(); });
  document.getElementById('lb-prev').onclick = ()=>{
    const imgs=slides.map(s=>s.querySelector('img')).filter(Boolean);
    lbIdx=(lbIdx-1+imgs.length)%imgs.length; lbImg.src=imgs[lbIdx].src;
  };
  document.getElementById('lb-next').onclick = ()=>{
    const imgs=slides.map(s=>s.querySelector('img')).filter(Boolean);
    lbIdx=(lbIdx+1)%imgs.length; lbImg.src=imgs[lbIdx].src;
  };
  document.addEventListener('keydown', e=>{
    if(!lightbox.classList.contains('open'))return;
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowLeft')  document.getElementById('lb-prev').click();
    if(e.key==='ArrowRight') document.getElementById('lb-next').click();
  });

  function syncBg(){
    slides.forEach(slide=>{
      const img = slide.querySelector('img');
      if(img && img.src && !img.src.endsWith('/')){
        slide.style.setProperty('--bg', 'url("'+img.src+'")');
      }
    });
  }
  let loaded=0;
  slides.forEach(s=>{
    const img=s.querySelector('img');
    if(!img) return;
    const done=()=>{ loaded++; if(loaded===slides.length) syncBg(); };
    if(img.complete) done(); else { img.addEventListener('load',done); img.addEventListener('error',done); }
  });
  syncBg();

  goTo(0, false);
})();
