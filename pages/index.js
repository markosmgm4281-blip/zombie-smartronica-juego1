<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Zombie - Smartronica M&amp;M</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#ff0000"/>
  <style>
    body{margin:0;background:#000;color:#fff;font-family:Inter,Arial,Helvetica,sans-serif}
    header{padding:12px;text-align:center;background:#111}
    canvas{display:block;margin:14px auto;border:2px solid #333;background:#0b0b0b}
    #ui{position:fixed;left:12px;top:12px;background:rgba(0,0,0,0.4);padding:8px;border-radius:8px}
    #whatsapp{position:fixed;left:12px;bottom:12px;background:#25D366;padding:10px;border-radius:10px;color:#fff;text-decoration:none;font-weight:600}
    #heavyBtn{position:fixed;right:18px;bottom:20px;background:#c62828;color:#fff;padding:16px;border-radius:50%;font-weight:700;box-shadow:0 6px 12px rgba(0,0,0,0.4);user-select:none}
    #notice{position:fixed;right:12px;top:12px;background:rgba(255,255,255,0.06);padding:8px;border-radius:8px}
  </style>
</head>
<body>
<header><h2>🧟 Zombie — Smartronica M&amp;M</h2></header>

<canvas id="game" width="360" height="640" aria-label="Zona de juego"></canvas>

<div id="ui">
  <div>Nivel: <span id="nivel">1</span></div>
  <div>Vida: <span id="vida">100</span></div>
</div>

<a id="whatsapp" href="https://wa.me/541137659959" target="_blank" rel="noopener noreferrer">
  📲 Smartronica M&amp;M — Soporte
</a>

<div id="heavyBtn" role="button" aria-label="Arma pesada">🔥</div>

<div id="notice">Instalable: Agregá a la pantalla de inicio</div>

<script>
/* --- Variables básicas --- */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let nivel = 1;
let vida = 100;
let zombies = [];
let jefe = null;
let heavyReady = true;
const player = { x: 170, y: 560, w: 20, h: 20 };

/* --- Funciones de juego (simple, expandible) --- */
function crearZombie() {
  zombies.push({
    x: Math.random() * (canvas.width - 20),
    y: -20,
    speed: 0.8 + nivel * 0.12 + Math.random()*0.6,
    life: Math.floor(8 + nivel * 1.8)
  });
}

function crearJefe() {
  jefe = { x: 30, y: 40, w: canvas.width-60, h: 40, life: 400 + nivel * 70, phase: 1 };
}

function dispararPesada() {
  if (!heavyReady) return;
  heavyReady = false;
  // efecto: daño masivo a todos y jefe
  zombies = zombies.filter(z => {
    // 80% chance to kill standard zombies
    return Math.random() < 0.2;
  });
  if (jefe) jefe.life -= 300;
  // cooldown 7s
  setTimeout(()=> heavyReady = true, 7000);
}

/* --- Input --- */
document.getElementById('heavyBtn').addEventListener('click', dispararPesada);
canvas.addEventListener('pointermove', e => {
  const rect = canvas.getBoundingClientRect();
  player.x = Math.max(0, Math.min(canvas.width - player.w, e.clientX - rect.left - player.w/2));
});

/* --- Update & Draw --- */
function actualizar() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // jugador
  ctx.fillStyle = '#00d1ff';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // zombies
  ctx.fillStyle = '#8ef04a';
  for (let i = zombies.length-1; i >= 0; i--) {
    const z = zombies[i];
    z.y += z.speed;
    ctx.fillRect(z.x, z.y, 16, 16);
    // colisión con player (simple)
    if (z.y + 16 >= player.y && z.x < player.x + player.w && z.x + 16 > player.x) {
      vida -= 5;
      zombies.splice(i,1);
    } else if (z.y > canvas.height) {
      vida -= 3;
      zombies.splice(i,1);
    }
  }

  // jefe
  if (jefe) {
    ctx.fillStyle = '#9c27b0';
    ctx.fillRect(jefe.x, jefe.y, jefe.w, jefe.h);
    // jefe se mueve y ataca
    jefe.x += Math.sin(Date.now()/1000) * 1.5;
    if (jefe.life <= 0) {
      jefe = null;
      nivel += 1;
    }
  }

  // HUD
  document.getElementById('nivel').textContent = nivel;
  document.getElementById('vida').textContent = vida;

  if (vida <= 0) {
    // game over minimal: mostrar ad / recargar
    alert('GAME OVER — Smartronica M&M');
    // placeholder publicidad
    setTimeout(()=> location.reload(), 200);
  }
}

/* --- Generadores --- */
setInterval(()=>{
  // aumentar dificultad con nivel
  const maxZ = 3 + Math.min(40, Math.floor(nivel * 1.4));
  if (zombies.length < maxZ) crearZombie();
}, 900);

setInterval(()=>{
  // sube de nivel cada 20s (ajustable)
  nivel++;
  if (nivel % 5 === 0 && !jefe) {
    alert('⚠️ JEFE FINAL ⚠️');
    crearJefe();
  }
}, 20000);

/* --- Loop principal --- */
function loop(){
  actualizar();
  requestAnimationFrame(loop);
}
loop();
</script>

</body>
</html>
