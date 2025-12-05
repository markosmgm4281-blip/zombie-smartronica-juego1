<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Zombie Smartronica M&M</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="manifest" href="manifest.json">
  <style>
    body { margin:0; background:#000; color:white; font-family:Arial; text-align:center; }
    canvas { background:#111; display:block; margin:auto; border:2px solid red; }
    #ui { position:fixed; top:10px; left:10px; }
    #whatsapp { position:fixed; bottom:10px; left:10px; background:green; padding:10px; border-radius:10px; color:white; text-decoration:none; }
    #heavyBtn { position:fixed; bottom:20px; right:20px; background:red; padding:15px; border-radius:50%; font-weight:bold; }
  </style>
</head>
<body>

<h2>🧟 ZOMBIE - Smartronica M&M</h2>
<canvas id="game" width="360" height="640"></canvas>

<div id="ui">
  <p>Nivel: <span id="nivel">1</span></p>
  <p>Vida: <span id="vida">100</span></p>
</div>

<a id="whatsapp" href="https://wa.me/541137659959" target="_blank">
📲 Smartronica M&M
</a>

<div id="heavyBtn">🔥</div>

<script>
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let nivel = 1;
let vida = 100;
let zombies = [];
let jefe = null;
let heavyReady = true;

const player = { x:180, y:550, size:20 };

function crearZombie() {
  zombies.push({
    x: Math.random()*340,
    y: -20,
    speed: 1 + nivel * 0.2,
    life: 10 + nivel * 2
  });
}

function crearJefe() {
  jefe = {
    x: 80,
    y: 50,
    life: 500 + nivel * 50,
    speed: 1
  };
}

function dispararPesada() {
  if(!heavyReady) return;
  heavyReady = false;
  zombies = [];
  if(jefe) jefe.life -= 300;
  setTimeout(()=>heavyReady=true, 7000);
}

document.getElementById("heavyBtn").onclick = dispararPesada;

canvas.addEventListener("touchmove", e=>{
  player.x = e.touches[0].clientX - 20;
});

function actualizar() {
  ctx.clearRect(0,0,360,640);

  // Player
  ctx.fillStyle="cyan";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Zombies
  ctx.fillStyle="lime";
  zombies.forEach(z=>{
    z.y += z.speed;
    ctx.fillRect(z.x, z.y, 15, 15);
    if(z.y > 600){
      vida -= 5;
    }
  });

  // Jefe
  if(jefe){
    ctx.fillStyle="purple";
    ctx.fillRect(jefe.x, jefe.y, 200, 40);
  }

  if(vida <= 0){
    alert("GAME OVER - Smartronica M&M");
    mostrarPublicidad();
    location.reload();
  }

  document.getElementById("nivel").textContent = nivel;
  document.getElementById("vida").textContent = vida;
}

function mostrarPublicidad(){
  alert("Publicidad mostrada - Ganaste dinero 💰");
}

setInterval(()=>{
  actualizar();
  if(zombies.length < 5 + nivel) crearZombie();
  if(nivel % 5 === 0 && !jefe) crearJefe();
}, 30);

setInterval(()=>{
  nivel++;
  if(nivel % 5 === 0){
    alert("⚠️ JEFE FINAL ⚠️");
    crearJefe();
  }
}, 15000);
</script>

</body>
</html>
