<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Zombie — Smartronica M&M</title>
<style>
  :root{--bg:#0b0f13;--ui:#111;--accent:#ff3b30;--accent2:#ffd54f}
  html,body{height:100%;margin:0;background:linear-gradient(#050607,#0b0f13);font-family:Inter,Arial,Helvetica,sans-serif}
  #game-wrap{max-width:420px;margin:8px auto;position:relative}
  canvas{display:block;background:linear-gradient(to bottom,#122,#000);width:100%;height:auto;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.6)}
  header{color:white;text-align:center;margin-bottom:6px}
  #ui{position:absolute;left:12px;top:12px;background:rgba(0,0,0,0.35);backdrop-filter:blur(4px);padding:8px;border-radius:8px;color:#fff}
  #ui div{margin:4px 0}
  #controls{position:absolute;right:12px;top:12px;display:flex;flex-direction:column;gap:8px}
  .btn{background:var(--ui);color:#fff;padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);cursor:pointer;font-weight:700}
  #heavyBtn{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;background:linear-gradient(180deg,var(--accent),#a92b26);box-shadow:0 10px 18px rgba(200,50,50,0.25)}
  #whatsapp{position:absolute;left:12px;bottom:12px;background:#25D366;padding:8px 12px;border-radius:10px;color:#fff;text-decoration:none;font-weight:700}
  #notice{position:absolute;right:12px;bottom:12px;color:rgba(255,255,255,0.8);font-size:12px}
  #progress{width:160px;height:8px;background:rgba(255,255,255,0.08);border-radius:8px;overflow:hidden}
  #progress > i{display:block;height:100%;background:linear-gradient(90deg,var(--accent2),#ffd740);width:0%}
  small{opacity:0.8}
</style>
</head>
<body>

<header><h1>🧟 Zombie — Smartronica M&amp;M</h1></header>

<div id="game-wrap">
  <canvas id="game" width="360" height="720" aria-label="Área de juego"></canvas>

  <div id="ui" aria-hidden="false">
    <div><strong>Nivel:</strong> <span id="nivel">1</span>  <small>(Capítulo: <span id="cap">1</span>)</small></div>
    <div><strong>Vida:</strong> <span id="vida">100</span></div>
    <div id="progress" title="Progreso del nivel"><i id="pbar"></i></div>
  </div>

  <div id="controls" aria-hidden="false">
    <div id="heavyBtn" class="btn" title="Arma pesada (cooldown)">🔥</div>
    <button id="pauseBtn" class="btn">PAUSAR</button>
  </div>

  <a id="whatsapp" href="https://wa.me/541137659959" target="_blank" rel="noopener noreferrer">📲 Smartronica M&amp;M</a>
  <div id="notice">Jefes cada 5 niveles • Uso: mover con el dedo/ratón • Heavy: 7s cooldown</div>
</div>

<script>
/* ===========================
   Juego: niveles, dificultad,
   jefes por capítulo, heavy weapon
   =========================== */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

/* ---------- Estado ---------- */
let nivel = 1;
let capitulo = 1; // capítulo = cada 5 niveles
let vida = 100;
let puntosNivel = 0;
let puntosParaSubir = 30; // aumenta con nivel
let zombies = [];
let boss = null;
let heavyReady = true;
let paused = false;

/* ---------- Player ---------- */
const player = { x: W/2 - 15, y: H - 90, w:30, h:30, color:'#00e5ff' };

/* ---------- Gráficos simples & Parallax ---------- */
const stars = [];
for(let i=0;i<60;i++) stars.push({x:Math.random()*W,y:Math.random()*H*0.6,size:Math.random()*2+0.5});
const bgLayers = [
  { speed:0.15, color:'#071018', objects:[] }, // distant
  { speed:0.35, color:'#08131b', objects:[] }  // near
];
for(let i=0;i<30;i++){
  bgLayers[0].objects.push({x:Math.random()*W,y:Math.random()*H*0.5,size:Math.random()*18+6});
  bgLayers[1].objects.push({x:Math.random()*W,y:Math.random()*H*0.6,size:Math.random()*28+10});
}

/* ---------- Utiles ---------- */
function rand(a,b){ return a + Math.random()*(b-a); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

/* ---------- Crear zombies ---------- */
function crearZombie(){
  // Las stats escalan con el nivel para que no sea fácil
  const speedBase = 0.5 + nivel * 0.08;
  const lifeBase = Math.floor(6 + nivel * 2.2);
  const z = {
    x: rand(12, W-28),
    y: -20 - rand(0,80),
    w: 18, h:18,
    speed: speedBase + Math.random()*0.8,
    life: lifeBase,
    color: `hsl(${rand(90,140)},60%,50%)`
  };
  zombies.push(z);
}

/* ---------- Crear jefe (al final del capítulo) ---------- */
function crearBoss(){
  boss = {
    x: 30, y: 40,
    w: W-60, h:60,
    life: 300 + capitulo * 220 + nivel * 40,
    phase: 1,
    lastAttack: 0
  };
}

/* ---------- Heavy weapon ---------- */
function usarHeavy(){
  if(!heavyReady || paused) return;
  heavyReady = false;
  // efecto visual y daño: elimina muchos zombies y hiere al boss
  zombies = zombies.filter(z => Math.random() < 0.25); // queda 25%
  if(boss){
    boss.life -= 350;
    if(boss.life < 0) boss.life = 0;
  }
  // feedback
  flashScreen('#ffebee', 220);
  setTimeout(()=> heavyReady = true, 7000);
}

/* ---------- Movimiento del jugador (pointer) ---------- */
let pointerX = player.x;
canvas.addEventListener('pointermove', e=> {
  const rect = canvas.getBoundingClientRect();
  pointerX = e.clientX - rect.left - player.w/2;
});
canvas.addEventListener('pointerdown', e=> {
  // opcional: disparo (en futuras iteraciones)
});
document.getElementById('heavyBtn').addEventListener('click', usarHeavy);
document.getElementById('pauseBtn').addEventListener('click', ()=>{
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? 'REANUDAR' : 'PAUSAR';
});

/* ---------- Progreso y escalado ---------- */
function incrementarPuntos(pts=1){
  puntosNivel += pts;
  const p = clamp((puntosNivel / puntosParaSubir)*100,0,100);
  document.getElementById('pbar').style.width = p + '%';
  if(puntosNivel >= puntosParaSubir){
    subirNivel();
  }
}

function subirNivel(){
  nivel++;
  puntosNivel = 0;
  puntosParaSubir = Math.floor(30 + nivel * 8); // se requiere más para subir
  capitulo = Math.floor((nivel-1)/5) + 1; // capítulo aumenta cada 5 niveles
  // cada vez que sube de nivel, ligera recompensa
  vida = Math.min(100, vida + 12);
  // Si es fin de capítulo (cada 5 niveles), spawn jefe
  if(nivel % 5 === 0){
    crearBoss();
    // aviso
    playSound('warning');
  }
  // actualizar UI
  document.getElementById('nivel').textContent = nivel;
  document.getElementById('cap').textContent = capitulo;
}

/* ---------- Lógica de colisión y actualizaciones ---------- */
function actualizar(dt){
  if(paused) return;
  // parallax movimiento
  bgLayers.forEach(l=>{
    l.objects.forEach(o=>{
      o.y += l.speed * (0.3 + nivel*0.02);
      if(o.y > H) { o.y = -rand(20,80); o.x = rand(0,W); }
    });
  });

  // mover player hacia pointer suavemente
  player.x += (pointerX - player.x) * 0.18;
  player.x = clamp(player.x, 6, W - player.w - 6);

  // generar zombies segun dificultad
  const maxZ = 3 + Math.min(60, Math.floor(nivel * 1.6)); // muchos niveles posible
  if(zombies.length < maxZ && Math.random() < 0.12 + nivel*0.004) crearZombie();

  // actualizar zombies
  for(let i=zombies.length-1;i>=0;i--){
    const z = zombies[i];
    // comportamiento: si boss activo, zombies avanzan mas rapido
    const multi = boss ? 1.1 : 1;
    z.y += z.speed * multi;
    // colisión simplificada con jugador
    if(z.y + z.h >= player.y && z.x < player.x + player.w && z.x + z.w > player.x){
      vida -= 6 + Math.floor(nivel/8);
      zombies.splice(i,1);
      playSound('hit');
      continue;
    }
    if(z.y > H + 10){
      zombies.splice(i,1);
      incrementarPuntos(2);
    }
    // si golpean al fondo reducen vida
  }

  // boss behavior
  if(boss){
    // boss se mueve lento y lanza ataques
    boss.x += Math.sin(Date.now()/1000) * 0.7;
    boss.lastAttack = boss.lastAttack || 0;
    if(Date.now() - boss.lastAttack > 2200 - capitulo*120){
      // ataque: crea proyectiles (simples zombies rápidos)
      for(let k=0;k<3;k++){
        zombies.push({
          x: boss.x + rand(20, boss.w-20),
          y: boss.y + boss.h + 6,
          w: 12, h:12,
          speed: 2.8 + capitulo*0.2,
          life: 2,
          color:'#ff7043'
        });
      }
      boss.lastAttack = Date.now();
      playSound('bossatk');
    }

    // si boss se queda sin vida:
    if(boss.life <= 0){
      // recompensa: subir 1 nivel extra, curar algo
      boss = null;
      incrementarPuntos(puntosParaSubir); // fuerza subir nivel
      vida = Math.min(100, vida + 30);
      playSound('bossdie');
    }
  }

  // game over
  if(vida <= 0){
    paused = true;
    playSound('gameover');
    setTimeout(()=> {
      if(confirm('GAME OVER — Ver anuncio para revivir? (simulado)')) {
        vida = 60; paused = false;
      } else {
        location.reload();
      }
    }, 120);
  }

  // UI
  document.getElementById('vida').textContent = Math.max(0, vida.toFixed(0));
}

/* ---------- Dibujado (mejorado visualmente) ---------- */
function dibujar(){
  // fondo: gradientes y parallax
  ctx.clearRect(0,0,W,H);

  // stars
  ctx.fillStyle = '#8ea6c2';
  stars.forEach(s => { ctx.globalAlpha = 0.55; ctx.fillRect(s.x, s.y, s.size, s.size); s.x -= 0.02*(1 + nivel*0.01); if(s.x < 0) s.x = W; });
  ctx.globalAlpha = 1;

  // layers
  bgLayers.forEach((l, idx) => {
    ctx.fillStyle = l.color;
    l.objects.forEach(o=>{
      ctx.globalAlpha = idx === 0 ? 0.12 : 0.22;
      ctx.fillRect(o.x, o.y, o.size, o.size*0.6);
    });
  });
  ctx.globalAlpha = 1;

  // player (rounded)
  ctx.fillStyle = player.color;
  roundRect(ctx, player.x, player.y, player.w, player.h, 6, true);

  // zombies
  zombies.forEach(z=>{
    ctx.fillStyle = z.color || '#7cfc00';
    roundRect(ctx, z.x, z.y, z.w, z.h, 4, true);
    // vida pequeña (si tuviera)
  });

  // boss
  if(boss){
    ctx.fillStyle = '#9c27b0';
    roundRect(ctx, boss.x, boss.y, boss.w, boss.h, 8, true);
    // boss life bar
    ctx.fillStyle = '#222';
    ctx.fillRect(boss.x, boss.y - 12, boss.w, 8);
    ctx.fillStyle = '#ff5252';
    const bl = clamp(boss.life / (300 + capitulo * 220 + nivel * 40), 0, 1);
    ctx.fillRect(boss.x, boss.y - 12, boss.w * bl, 8);
  }

  // efecto cooldown en heavyBtn
  const hb = document.getElementById('heavyBtn');
  hb.style.opacity = heavyReady ? 1 : 0.45;
  // mini texto de cooldown
  if(!heavyReady) hb.textContent = '⏳'; else hb.textContent = '🔥';
}

/* ---------- utilidades canvas ---------- */
function roundRect(ctx,x,y,w,h,r,fill){
  if(w<2*r) r = w/2;
  if(h<2*r) r = h/2;
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
  if(fill) ctx.fill(); else ctx.stroke();
}

/* ---------- Flash pantalla ---------- */
function flashScreen(color, time=160){
  const o = {a:1};
  const start = Date.now();
  const id = setInterval(()=> {
    const t = Date.now() - start;
    const a = 1 - t / time;
    if(a <= 0){ clearInterval(id); return; }
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.12 * a;
    ctx.fillRect(0,0,W,H);
    ctx.globalAlpha = 1;
  },16);
}

/* ---------- Sonidos simples (beeps usando WebAudio) ---------- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, duration=120, type='sine'){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  o.connect(g); g.connect(audioCtx.destination);
  g.gain.value = 0.03;
  o.start();
  setTimeout(()=> { o.stop(); }, duration);
}
function playSound(name){
  if(!audioCtx) return;
  switch(name){
    case 'hit': playTone(240,100,'square'); break;
    case 'warning': playTone(420,220,'sawtooth'); break;
    case 'bossatk': playTone(180,200,'triangle'); break;
    case 'bossdie': playTone(620,260,'sine'); break;
    case 'gameover': playTone(110,700,'sine'); break;
    default: playTone(320,80); break;
  }
}

/* ---------- Loop principal ---------- */
let last = performance.now();
function loop(now){
  const dt = now - last;
  last = now;
  actualizar(dt);
  dibujar();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- Interacciones pequeñas para hacerlo adictivo ---------- */
// click en pantalla da pequeña bonificación de puntos (micro-recompensa)
canvas.addEventListener('click', ()=> {
  if(paused) return;
  incrementarPuntos(1 + Math.floor(nivel/10));
});

/* ---------- progreso y guardado básico ---------- */
function guardarEstado(){
  const s = {nivel,capitulo,vida,puntosNivel};
  localStorage.setItem('zombie_state_v1', JSON.stringify(s));
}
function cargarEstado(){
  try{
    const s = JSON.parse(localStorage.getItem('zombie_state_v1'));
    if(s){ nivel = s.nivel || nivel; capitulo = s.capitulo || capitulo; vida = s.vida || vida; puntosNivel = s.puntosNivel || puntosNivel; }
  }catch(e){}
}
window.addEventListener('beforeunload', guardarEstado);
cargarEstado();

/* ---------- Mostrar UI inicial values ---------- */
document.getElementById('nivel').textContent = nivel;
document.getElementById('cap').textContent = capitulo;
document.getElementById('vida').textContent = vida;

/* ---------- Explicación rápida (en código): ----------
 - Capítulo = cada 5 niveles -> aparece jefe al final de capítulo
 - Dificultad progresa: más zombies, más velocidad/life
 - Heavy weapon: limpia la pantalla y da daño alto al jefe (7s cooldown)
 - Recompensas: click para micro puntos, curación al subir nivel
 - Guardado: localStorage básico
--------------------------------------------------- */

</script>

</body>
</html>
