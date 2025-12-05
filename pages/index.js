import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const bullets = useRef([]);
  const enemies = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let player = {
      x: canvas.width / 2,
      y: canvas.height - 80,
      size: 25,
    };

    function createEnemy() {
      enemies.current.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        size: 30,
        speed: 2 + Math.random() * 2,
      });
    }

    setInterval(createEnemy, 900);

    // ✅ DISPARO AUTOMÁTICO RÁPIDO
    setInterval(() => {
      bullets.current.push({
        x: player.x,
        y: player.y,
        speed: 8,
        heavy: false,
      });
    }, 200);

    function drawPlayer() {
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawBullets() {
      bullets.current.forEach((b) => {
        ctx.fillStyle = b.heavy ? "red" : "yellow";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.heavy ? 10 : 5, 0, Math.PI * 2);
        ctx.fill();
        b.y -= b.speed;
      });
    }

    function drawEnemies() {
      enemies.current.forEach((e) => {
        ctx.fillStyle = "#ff0033";
        ctx.fillRect(e.x, e.y, e.size, e.size);
        e.y += e.speed;

        if (e.y > canvas.height) {
          setLives((l) => l - 1);
          e.y = -100;
        }
      });
    }

    function detectCollisions() {
      enemies.current.forEach((e, ei) => {
        bullets.current.forEach((b, bi) => {
          const dx = e.x - b.x;
          const dy = e.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < e.size) {
            enemies.current.splice(ei, 1);
            bullets.current.splice(bi, 1);
            setScore((s) => s + (b.heavy ? 5 : 1));
          }
        });
      });
    }

    function gameLoop() {
      if (lives <= 0) {
        setGameOver(true);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawPlayer();
      drawBullets();
      drawEnemies();
      detectCollisions();

      requestAnimationFrame(gameLoop);
    }

    gameLoop();

    // Movimiento táctil
    window.addEventListener("touchmove", (e) => {
      player.x = e.touches[0].clientX;
    });
  }, [mounted, lives]);

  function heavyShoot() {
    bullets.current.push({
      x: window.innerWidth / 2,
      y: window.innerHeight - 80,
      speed: 6,
      heavy: true,
    });
  }

  if (!mounted) return null;

  if (gameOver) {
    return (
      <div style={styles.center}>
        <h2>💀 GAME OVER</h2>
        <p>Puntaje: {score}</p>

        <a
          href="https://wa.me/541137659959"
          style={styles.whatsapp}
        >
          Smartronica M&M
        </a>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.hud}>
        ❤️ {lives} | ⭐ {score}
      </div>

      <canvas ref={canvasRef} />

      {/* ✅ BOTÓN DE FUEGO PESADO */}
      <button onTouchStart={heavyShoot} style={styles.heavyBtn}>
        💥
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    background: "#020617",
    overflow: "hidden",
    touchAction: "none",
  },
  hud: {
    position: "absolute",
    top: 12,
    left: 12,
    color: "#fff",
    zIndex: 20,
    fontSize: 16,
  },
  heavyBtn: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 95,
    height: 95,
    borderRadius: "50%",
    border: "none",
    background: "radial-gradient(circle,#f97316,#7c2d12)",
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    zIndex: 50,
  },
  whatsapp: {
    marginTop: 20,
    display: "inline-block",
    padding: 12,
    background: "green",
    color: "white",
    borderRadius: 8,
    textDecoration: "none",
  },
  center: {
    textAlign: "center",
    marginTop: 120,
    color: "white",
  },
};
