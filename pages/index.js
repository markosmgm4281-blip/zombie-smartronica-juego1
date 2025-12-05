import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [win, setWin] = useState(false);
  const [bossActive, setBossActive] = useState(false);

  const player = useRef({ x: 150, y: 0 });
  const bullets = useRef([]);
  const heavyBullets = useRef([]);
  const enemies = useRef([]);
  const boss = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      player.current.y = canvas.height - 90;
    }
    resize();
    window.addEventListener("resize", resize);
    document.body.style.overflow = "hidden";

    let lastAuto = 0;
    let enemyInterval = null;
    let levelTimer = null;

    // spawn enemies faster as level grows
    function spawnEnemy() {
      enemies.current.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -40,
        size: 32,
        life: 1 + Math.floor(level / 3),
        speed: 1.6 + level * 0.15
      });
    }

    // boss that stays until destroyed
    function spawnBoss() {
      boss.current = {
        x: (canvas.width / 2) - 120 / 2,
        y: 40,
        w: 120,
        h: 90,
        life: 50 + level * 30,
        speed: 0.6 + level * 0.05
      };
      setBossActive(true);
    }

    function autoShoot() {
      const now = Date.now();
      if (now - lastAuto > Math.max(80, 200 - level * 10)) {
        bullets.current.push({
          x: player.current.x,
          y: player.current.y - 10,
          speed: 10
        });
        lastAuto = now;
      }
    }

    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // fondo
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#020617");
      grad.addColorStop(1, "#000000");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      autoShoot();

      // dibujar jugador
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(player.current.x, player.current.y, 18, 0, Math.PI * 2);
      ctx.fill();

      // actualizar y dibujar balas livianas
      for (let i = bullets.current.length - 1; i >= 0; i--) {
        const b = bullets.current[i];
        b.y -= b.speed;
        ctx.fillStyle = "#fde047";
        ctx.fillRect(b.x - 3, b.y, 6, 12);
        if (b.y < -20) bullets.current.splice(i, 1);
      }

      // balas pesadas
      for (let i = heavyBullets.current.length - 1; i >= 0; i--) {
        const hb = heavyBullets.current[i];
        hb.y -= hb.speed;
        ctx.fillStyle = "#f97316";
        ctx.fillRect(hb.x - 7, hb.y, 14, 28);
        if (hb.y < -40) heavyBullets.current.splice(i, 1);
      }

      // enemigos normales
      for (let i = enemies.current.length - 1; i >= 0; i--) {
        const e = enemies.current[i];
        e.y += e.speed;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(e.x, e.y, e.size, e.size);

        // fuera de pantalla => pierde vida y se elimina
        if (e.y > canvas.height + 40) {
          enemies.current.splice(i, 1);
          setLives(v => {
            const nv = v - 1;
            if (nv <= 0) setTimeout(() => setWin(false), 0);
            return nv;
          });
        }
      }

      // SI hay jefe, dibujalo y no dejes que desaparezca hasta morir
      if (boss.current) {
        ctx.fillStyle = "#7c3aed";
        ctx.fillRect(boss.current.x, boss.current.y, boss.current.w, boss.current.h);
        // pequeño movimiento horizontal del jefe
        boss.current.x += Math.sin(Date.now() / 1000) * boss.current.speed;
      }

      // colisiones: balas vs enemigos
      for (let i = enemies.current.length - 1; i >= 0; i--) {
        const e = enemies.current[i];
        // balas normales
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
        // balas pesadas
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

      // colisiones: balas vs boss (si existe)
      if (boss.current) {
        for (let j = bullets.current.length - 1; j >= 0; j--) {
          const b = bullets.current[j];
          if (b.x > boss.current.x && b.x < boss.current.x + boss.current.w &&
              b.y > boss.current.y && b.y < boss.current.y + boss.current.h) {
            bullets.current.splice(j, 1);
            boss.current.life--;
          }
        }
        for (let j = heavyBullets.current.length - 1; j >= 0; j--) {
          const hb = heavyBullets.current[j];
          if (hb.x > boss.current.x && hb.x < boss.current.x + boss.current.w &&
              hb.y > boss.current.y && hb.y < boss.current.y + boss.current.h) {
            heavyBullets.current.splice(j, 1);
            boss.current.life -= 8; // heavy hace más daño
          }
        }
        if (boss.current && boss.current.life <= 0) {
          boss.current = null;
          setBossActive(false);
          setScore(s => s + 500);
          // subir de nivel al matar jefe
          setLevel(l => l + 1);
        }
      }

      // HUD
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px Arial";
      ctx.fillText(`Nivel ${level}  Puntos ${score}  Vidas ${lives}`, 12, 26);

      // condición de victoria cuando llegás a level X (ej: nivel 6)
      if (level >= 6 && !boss.current && enemies.current.length === 0) {
        // ganaste el capítulo completo -> mostrar pantalla de victoria
        setTimeout(() => setWin(true), 0);
        return;
      }

      requestAnimationFrame(update);
    }

    // arranca spawn de enemigos; aumenta velocidad cuando level sube
    enemyInterval = setInterval(spawnEnemy, Math.max(600, 1200 - level * 80));
    // cada 30 segundos aparece un jefe (si no hay uno ya)
    const bossInterval = setInterval(() => {
      if (!boss.current) spawnBoss();
    }, 30000);

    update();

    return () => {
      clearInterval(enemyInterval);
      clearInterval(bossInterval);
      window.removeEventListener("resize", resize);
    };
  }, [mounted, level, lives]);

  // control táctil (mover jugador)
  useEffect(() => {
    function touchMoveHandler(e) {
      if (!player.current) return;
      const t = e.touches[0];
      player.current.x = t.clientX;
    }
    window.addEventListener("touchmove", touchMoveHandler, { passive: false });
    return () => window.removeEventListener("touchmove", touchMoveHandler);
  }, []);

  // disparo pesado por botón (heavy)
  function heavyShoot() {
    heavyBullets.current.push({ x: player.current.x, y: player.current.y - 10, speed: 12 });
  }

  // compartir / reclamar descuento por WA (solo si win true)
  function reclamarDescuento() {
    // mensaje predefinido en WhatsApp
    const text = encodeURIComponent(`Gané el juego y quiero mi descuento - Smartronica M&M`);
    window.location.href = `https://wa.me/541137659959?text=${text}`;
  }

  if (!mounted) return null;

  if (win) {
    // pantalla de victoria: solo ahí se muestra el link de descuento
    return (
      <div style={styles.center}>
        <h2>🏆 ¡GANASTE EL CAPÍTULO!</h2>
        <p>Puntaje: {score}</p>
        <button onClick={reclamarDescuento} style={styles.whatsapp}>
          Reclamar descuento por WhatsApp
        </button>
        <p style={{ marginTop: 12 }}>Compartir juego:</p>
        <button onClick={() => navigator.share?.({ title: 'Zombie Smartronica', text: 'Jugué y gané en Zombie Smartronica. ¡Probalo!', url: location.href })}>
          Compartir
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
      <div style={styles.hudOverlay}>
        <div>📱 Smartronica M&M</div>
        <div>⭐ {score}  ❤️ {lives}  Nivel {level}</div>
      </div>

      <button onTouchStart={heavyShoot} style={styles.heavyBtn}>💥</button>

      {/* ESPACIO PARA ANUNCIO (AdSense) - cuando tengas el ID lo reemplazas aquí */}
      <div id="ad-slot" style={styles.adSlot}>
        {/* Aquí irá el anuncio web cuando pegues el código de AdSense */}
        Publicidad — Smartronica M&M
      </div>
    </div>
  );
}

const styles = {
  container: { position: "fixed", inset: 0, background: "#020617", overflow: "hidden", touchAction: "none" },
  hudOverlay: { position: "absolute", top: 8, left: 12, color: "#fff", zIndex: 40, fontSize: 14, display: "flex", gap: 18 },
  heavyBtn: { position: "absolute", bottom: 24, right: 16, width: 84, height: 84, borderRadius: "50%", border: "none", background: "radial-gradient(circle,#f97316,#7c2d12)", color: "#fff", fontSize: 32, zIndex: 50 },
  adSlot: { position: "absolute", top: 40, right: 10, zIndex: 40, background: "#00000066", color: "#fff", padding: 6, borderRadius: 6, fontSize: 12 },
  center: { textAlign: "center", marginTop: 120, color: "white" },
  whatsapp: { display: "inline-block", padding: 12, background: "green", color: "white", borderRadius: 8, textDecoration: "none", marginTop: 12 }
};
