const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// ===== ARENA =====
const ARENA = { margin: 60 };

// ===== ESTADO =====
let wave = 1;
let gameOver = false;
let lastTime = 0;

// ===== PLAYER =====
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 14,
  speed: 3.8,
  angle: 0,
  hp: 100,
  maxHp: 100
};

// ===== INPUT =====
const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

addEventListener("mousemove", e => {
  player.angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
});

// Touch
let touchAim = null;
canvas.addEventListener("touchstart", e => touchAim = e.touches[0]);
canvas.addEventListener("touchmove", e => touchAim = e.touches[0]);
canvas.addEventListener("touchend", () => touchAim = null);

// ===== BALAS =====
const bullets = [];
let fireTimer = 0;
const FIRE_RATE = 170;

// ===== HEAVY =====
let heavyActive = false;
let heavyHeat = 0;
let heavyCooldown = 0;
const HEAVY_MAX = 4000;
const HEAVY_COOLDOWN = 3500;

document.getElementById("heavyBtn").onclick = () => {
  if(!heavyActive && heavyCooldown<=0){
    heavyActive = true;
    heavyHeat = 0;
  }
};

// ===== ZOMBIES =====
const zombies = [];
let boss = null;

function spawnZombie(type="normal"){
  const side = Math.floor(Math.random()*4);
  let x,y;

  if(side===0){x=Math.random()*canvas.width;y=ARENA.margin;}
  if(side===1){x=Math.random()*canvas.width;y=canvas.height-ARENA.margin;}
  if(side===2){x=ARENA.margin;y=Math.random()*canvas.height;}
  if(side===3){x=canvas.width-ARENA.margin;y=Math.random()*canvas.height;}

  let speed = type==="fast" ? player.speed : 1.4;
  let life = type==="fast" ? 18+wave : 26+wave*2;

  zombies.push({x,y,type,r:14,speed,life,maxLife:life});
}

function spawnBoss(){
  boss = {
    x: canvas.width/2,
    y: ARENA.margin+80,
    r: 55,
    speed: 1.2,
    life: 600+wave*120,
    maxLife: 600+wave*120
  };
}

function spawnWave(){
  zombies.length = 0;
  boss = null;

  for(let i=0;i<8+wave*2;i++) spawnZombie();
  for(let i=0;i<wave;i++) spawnZombie("fast");
  if(wave%4===0) spawnBoss();
}
spawnWave();

// ===== UPDATE =====
function update(dt){
  if(gameOver) return;

  // Movimiento
  if(keys["w"]) player.y -= player.speed;
  if(keys["s"]) player.y += player.speed;
  if(keys["a"]) player.x -= player.speed;
  if(keys["d"]) player.x += player.speed;

  player.x = Math.max(ARENA.margin+player.r, Math.min(canvas.width-ARENA.margin-player.r, player.x));
  player.y = Math.max(ARENA.margin+player.r, Math.min(canvas.height-ARENA.margin-player.r, player.y));

  // Flechas apuntan
  let ax=0,ay=0;
  if(keys["ArrowUp"]) ay--;
  if(keys["ArrowDown"]) ay++;
  if(keys["ArrowLeft"]) ax--;
  if(keys["ArrowRight"]) ax++;
  if(ax||ay) player.angle = Math.atan2(ay,ax);

  if(touchAim){
    player.angle = Math.atan2(touchAim.clientY-player.y, touchAim.clientX-player.x);
  }

  // Disparo normal
  fireTimer+=dt;
  if(fireTimer>FIRE_RATE){
    fireTimer=0;
    bullets.push({
      x:player.x,
      y:player.y,
      a:player.angle,
      s:8,
      d:1
    });
  }

  // HEAVY
  if(heavyActive){
    heavyHeat+=dt;
    for(let i=0;i<12;i++){
      bullets.push({
        x:player.x,
        y:player.y,
        a:(Math.PI*2/12)*i,
        s:8,
        d:2.5
      });
    }
    if(heavyHeat>=HEAVY_MAX){
      heavyActive=false;
      heavyCooldown=HEAVY_COOLDOWN;
    }
  }
  if(heavyCooldown>0) heavyCooldown-=dt;

  // Balas
  bullets.forEach(b=>{
    b.x+=Math.cos(b.a)*b.s;
    b.y+=Math.sin(b.a)*b.s;
  });

  // Zombies
  zombies.forEach((z,zi)=>{
    const dx=player.x-z.x;
    const dy=player.y-z.y;
    const d=Math.hypot(dx,dy)||1;
    z.x+=(dx/d)*z.speed;
    z.y+=(dy/d)*z.speed;

    if(d<z.r+player.r){
      player.hp-=z.type==="fast"?0.6:0.4;
      if(player.hp<=0) gameOver=true;
    }

    bullets.forEach((b,bi)=>{
      if(Math.hypot(b.x-z.x,b.y-z.y)<z.r){
        z.life-=b.d;
        bullets.splice(bi,1);
        if(z.life<=0) zombies.splice(zi,1);
      }
    });
  });

  // Boss
  if(boss){
    const dx=player.x-boss.x;
    const dy=player.y-boss.y;
    const d=Math.hypot(dx,dy)||1;
    boss.x+=(dx/d)*boss.speed;
    boss.y+=(dy/d)*boss.speed;

    bullets.forEach((b,bi)=>{
      if(Math.hypot(b.x-boss.x,b.y-boss.y)<boss.r){
        boss.life-=b.d;
        bullets.splice(bi,1);
        if(boss.life<=0) boss=null;
      }
    });
  }

  if(zombies.length===0 && !boss){
    wave++;
    spawnWave();
  }
}

// ===== DRAW =====
function draw(){
  ctx.fillStyle="#3a3f4b";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="#1f2433";
  ctx.fillRect(0,0,canvas.width,ARENA.margin);
  ctx.fillRect(0,canvas.height-ARENA.margin,canvas.width,ARENA.margin);
  ctx.fillRect(0,0,ARENA.margin,canvas.height);
  ctx.fillRect(canvas.width-ARENA.margin,0,ARENA.margin,canvas.height);

  // Player
  ctx.save();
  ctx.translate(player.x,player.y);
  ctx.rotate(player.angle);
  ctx.fillStyle="#1e90ff";
  ctx.fillRect(-10,-14,20,28);
  ctx.restore();

  // Vida
  ctx.fillStyle="red";
  ctx.fillRect(player.x-20,player.y-30,40,5);
  ctx.fillStyle="lime";
  ctx.fillRect(player.x-20,player.y-30,40*(player.hp/player.maxHp),5);

  // Zombies
  zombies.forEach(z=>{
    ctx.fillStyle=z.type==="fast"?"red":"green";
    ctx.beginPath();
    ctx.arc(z.x,z.y,z.r,0,Math.PI*2);
    ctx.fill();
  });

  // Boss
  if(boss){
    ctx.fillStyle="purple";
    ctx.beginPath();
    ctx.arc(boss.x,boss.y,boss.r,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="red";
    ctx.fillRect(canvas.width/2-150,20,300,10);
    ctx.fillStyle="lime";
    ctx.fillRect(canvas.width/2-150,20,300*(boss.life/boss.maxLife),10);
  }

  // HUD
  ctx.fillStyle="#fff";
  ctx.fillText(`Oleada ${wave}`,10,20);
  ctx.fillText(`HP ${Math.floor(player.hp)}`,10,40);
  ctx.fillText(`HEAVY ${heavyActive?"🔥":heavyCooldown>0?"❄️":"OK"}`,10,60);
}

// ===== LOOP =====
function loop(t){
  const dt=t-lastTime;
  lastTime=t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
