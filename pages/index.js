import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  // Estado del juego
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1); // nivel / capítulo
  const [win, setWin] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null); // para PWA install prompt

  // Objetos del juego
  const player = useRef({ x: 200, y: 0 });
  const bullets = useRef([]);
  const heavyBullets = useRef([]);
  const enemies = useRef([]);
  const boss = useRef(null);

  // --- Montaje inicial: captura install prompt (PWA)
  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  // --- Main game loop & spawners
  useEffect(() => {
    if (!started || win) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      player.current.y = canvas.height - 90;
      if (!player.current.x) player.current.x = canvas.width / 2;
    }
    resize();
    window.addEventListener("resize", resize);

    document.body.style.overflow = "hidden";

    // control de spawn con refs para limpiar luego
    let lastAuto = 0;
    let enemyInterval = null;
    let bossInterval = null;

    function spawnEnemy() {
      enemies.current.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -40,
        size: 30,
        life: 1 + Math.floor(level / 3),
        speed: 1.6 + level * 0.2
      });
    }

    function spawnBoss() {
      if (boss.current) return;
      boss.current = {
        x: canvas.width / 2 - 100 / 2,
        y: 40,
        w: 100,
        h: 70,
        life: 60 + level * 40,
        speed: 0.8 + level * 0.05
      };
    }

    function autoShoot() {
      const now = Date.now();
      const delay = Math.max(60, 160 - level * 8); // más rápido con nivel
      if (now - lastAuto > delay) {
        bullets.current.push({
          x: player.current.x,
          y: player.current.y - 12,
          speed: 10
        });
        lastAuto = now;
      }
    }

    function update() {
      // clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // fondo
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      autoShoot();

      // dibujar jugador
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(player.current.x, player.current.y, 18, 0, Math.PI * 2);
      ctx.fill();

      // balas normales
      for (let i = bullets.current.length - 1; i >= 0; i--) {
        const b = bullets.current[i];
        b.y -= b.speed;
        ctx.fillStyle = "#fde047";
        ctx.fillRect(b.x - 3, b.y, 6, 12);
        if (b.y < -30) bullets.current.splice(i, 1);
      }

      // balas pesadas
      for (let i = heavyBullets.current.length - 1; i >= 0; i--) {
        const hb = heavyBullets.current[i];
        hb.y -= hb.speed;
        ctx.fillStyle = "#f97316";
        ctx.fillRect(hb.x - 7, hb.y, 14, 28);
        if (hb.y < -40) heavyBullets.current.splice(i, 1);
      }

      // enemigos
      for (let i = enemies.current.length - 1; i >= 0; i--) {
        const e = enemies.current[i];
        e.y += e.speed;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(e.x, e.y, e.size, e.size);

        // fuera de pantalla -> resta vida
        if (e.y > canvas.height + 40) {
          enemies.current.splice(i, 1);
          setLives(v => {
            const nv = v - 1;
            if (nv <= 0) setTimeout(() => setWin(false), 0);
            return nv;
          });
          continue;
        }

        // colisiones con balas normales
        for (let j = bullets.current.length - 1; j >= 0; j--) {
          const b = bullets.current[j];
          if (b.x > e.x && b.x < e.x + e.size && b.y > e.y && b.y < e.y + e.size) {
            bullets.current.splice(j, 1);
            e.life--;
            if (e.life <= 0) {
              enemies.current.splice(i, 1);
              setScore(s => s + 10);
            }
            break;
          }
        }

        // colisiones con balas pesadas
        for (let j = heavyBullets.current.length - 1; j >= 0; j--) {
          const hb = heavyBullets.current[j];
          if (hb.x > e.x && hb.x < e.x + e.size && hb.y > e.y && hb.y < e.y + e.size) {
            heavyBullets.current.splice(j, 1);
            enemies.current.splice(i, 1);
            setScore(s => s + 30);
            break;
          }
        }
      }

      // jefe (si existe) → no desaparece hasta morir
      if (boss.current) {
        ctx.fillStyle = "#7c3aed";
        ctx.fillRect(boss.current.x, boss.current.y, boss.current.w, boss.current.h);

        // movimiento horizontal suave
        boss.current.x += Math.sin(Date.now() / 800) * boss.current.speed;

        // colisiones con balas normales
        for (let j = bullets.current.length - 1; j >= 0; j--) {
          const b = bullets.current[j];
          if (b.x > boss.current.x && b.x < boss.current.x + boss.current.w &&
            b.y > boss.current.y && b.y < boss.current.y + boss.current.h) {
            bullets.current.splice(j, 1);
            boss.current.life--;
          }
        }
        // colisiones con balas pesadas (más daño)
        for (let j = heavyBullets.current.length - 1; j >= 0; j--) {
          const hb = heavyBullets.current[j];
          if (hb.x > boss.current.x && hb.x < boss.current.x + boss.current.w &&
            hb.y > boss.current.y && hb.y < boss.current.y + boss.current.h) {
            heavyBullets.current.splice(j, 1);
            boss.current.life -= 8;
          }
        }

        if (boss.current && boss.current.life <= 0) {
          boss.current = null;
          setScore(s => s + 500);
          // matar jefe = subir de nivel / capítulo
          setLevel(l => l + 1);
          // limpiar enemigos para nuevo capítulo
          enemies.current = [];
        }
      }

      // HUD
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px Arial";
      ctx.fillText(`Smartronica M&M  ⭐ ${score}  ❤️ ${lives}  Capítulo ${level}`, 12, 26);

      // condición simple de ganar todo (ej: pasar 5 capítulos)
      if (level > 5 && !boss.current && enemies.current.length === 0) {
        setTimeout(() => setWin(true), 0);
        return;
      }

      requestAnimationFrame(update);
    }

    // spawn y jefe
    enemyInterval = setInterval(spawnEnemy, Math.max(400, 1200 - level * 120));
    bossInterval = setInterval(() => {
      if (!boss.current) spawnBoss();
    }, 30000); // aparece cada 30s si no hay jefe

    update();

    return () => {
      clearInterval(enemyInterval);
      clearInterval(bossInterval);
      window.removeEventListener("resize", resize);
    };
  }, [started, level, win]);

  // movimiento táctil del jugador
  useEffect(() => {
    function touchMoveHandler(e) {
      if (!player.current) return;
      const t = e.touches[0];
      player.current.x = t.clientX;
    }
    window.addEventListener("touchmove", touchMoveHandler, { passive: false });
    return () => window.removeEventListener("touchmove", touchMoveHandler);
  }, []);

  // disparo pesado (botón)
  function heavyShoot() {
    // generamos varias balas con spread
    for (let i = 0; i < 8; i++) {
      heavyBullets.current.push({
        x: player.current.x + (Math.random() * 40 - 20),
        y: player.current.y - 10,
        speed: 12
      });
    }
  }

  // solicitar instalación PWA (si navegador lo permite)
  function triggerInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      alert("Usá 'Agregar a pantalla de inicio' en el menú del navegador para instalar.");
    }
  }

  // función para reclamar descuento (solo en pantalla win)
  function reclamarDescuento() {
    const txt = encodeURIComponent(`Gané en Zombie Smartronica y quiero mi descuento - Smartronica M&M`);
    window.location.href = `https://wa.me/541137659959?text=${txt}`;
  }

  // FULLSCREEN
  function goFullscreen() {
    document.documentElement.requestFullscreen?.();
  }

  if (!started && !win) {
    return (
      <div style={styles.menu}>
        <h1>🧟 Zombie Smartronica M&M</h1>
        <p>Mueve con el dedo. Disparo automático. Botón 💥 para disparo pesado.</p>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button onClick={() => setStarted(true)} style={styles.startBtn}>Iniciar Juego</button>
          <button onClick={() => triggerInstall()} style={styles.startBtn}>Instalar App</button>
        </div>

        <p style={{ marginTop: 16, color: "#9ca3af" }}>Smartronica M&amp;M — 1137659959</p>
      </div>
    );
  }

  if (win) {
    return (
      <div style={styles.center}>
        <h2>🏆 ¡GANASTE TODOS LOS CAPÍTULOS!</h2>
        <p>Puntaje final: {score}</p>
        <button onClick={reclamarDescuento} style={styles.whatsapp}>Reclamar descuento por WhatsApp</button>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigator.share?.({ title: 'Zombie Smartronica', text: 'Vení a jugar Zombie Smartronica y ganá descuentos', url: location.href })}>Compartir</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Pantalla completa */}
      <button onClick={goFullscreen} style={styles.fullBtn}>⛶</button>

      {/* HUD superpuesto */}
      <div style={styles.hudOverlay}>
        <div>📱 Smartronica M&amp;M</div>
        <div>⭐ {score}  ❤️ {lives}  Capítulo {level}</div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ display: "block" }} />

      {/* Botón de disparo pesado */}
      <button onTouchStart={heavyShoot} style={styles.heavyBtn}>💥</button>

      {/* Espacio para anuncio (cuando tengas AdSense) */}
      <div id="ad-slot" style={styles.adSlot}>
        {/* Reemplaza este div con el bloque de AdSense cuando te aprueben */}
        Publicidad — Smartronica M&amp;M
      </div>
    </div>
  );
}

const styles = {
  container: { position: "fixed", inset: 0, background: "#020617", overflow: "hidden", touchAction: "none" },
  hudOverlay: { position: "absolute", top: 8, left: 12, color: "#fff", zIndex: 40, fontSize: 14, display: "flex", gap: 18 },
  heavyBtn: { position: "absolute", bottom: 24, right: 16, width: 84, height: 84, borderRadius: "50%", border: "none", background: "radial-gradient(circle,#f97316,#7c2d12)", color: "#fff", fontSize: 32, zIndex: 50 },
  fullBtn: { position: "absolute", top: 10, right: 10, zIndex: 50, fontSize: 18, background: "#0f172a", color: "#fff", border: "none", padding: 8, borderRadius: 8 },
  adSlot: { position: "absolute", top: 44, right: 10, zIndex: 40, background: "#00000066", color: "#fff", padding: 8, borderRadius: 6, fontSize: 12 },
  menu: { background: "#020617", height: "100vh", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" },
  startBtn: { marginTop: 20, padding: 12, fontSize: 16, borderRadius: 10, border: "none", background: "#22c55e", color: "black" },
  whatsapp: { display: "inline-block", padding: 12, background: "green", color: "white", borderRadius: 8, textDecoration: "none", marginTop: 12 },
  center: { textAlign: "center", marginTop: 80, color: "white" }
};
