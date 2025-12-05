import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("Tocá para iniciar");

  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let player = { x: canvas.width / 2, y: canvas.height - 120 };
    let bullets = [];
    let enemies = [];
    let frame = 0;
    let running = true;

    function shoot() {
      bullets.push({ x: player.x, y: player.y });
    }

    function spawnEnemy() {
      enemies.push({
        x: Math.random() * canvas.width,
        y: -40,
        life: 3,
      });
    }

    function update() {
      if (!running) return;

      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frame % 10 === 0) shoot(); // disparo automático
      if (frame % 50 === 0) spawnEnemy();

      bullets.forEach((b) => (b.y -= 10));
      enemies.forEach((e) => (e.y += 3));

      bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
          if (
            b.x > e.x - 20 &&
            b.x < e.x + 20 &&
            b.y > e.y - 20 &&
            b.y < e.y + 20
          ) {
            e.life--;
            bullets.splice(bi, 1);
            if (e.life <= 0) enemies.splice(ei, 1);
          }
        });
      });

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "red";
      enemies.forEach((e) => {
        ctx.fillRect(e.x - 20, e.y - 20, 40, 40);
      });

      ctx.fillStyle = "yellow";
      bullets.forEach((b) => {
        ctx.fillRect(b.x - 3, b.y - 10, 6, 10);
      });

      requestAnimationFrame(update);
    }

    canvas.addEventListener("touchmove", (e) => {
      player.x = e.touches[0].clientX;
      player.y = e.touches[0].clientY;
    });

    update();

    return () => (running = false);
  }, [started]);

  return (
    <div
      style={{
        background: "#000",
        color: "white",
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {!started ? (
        <>
          <h1>Smartronica M&M</h1>
          <button
            onClick={() => {
              setStarted(true);
              setMessage("Juego iniciado");
            }}
            style={{
              padding: 20,
              fontSize: 20,
              marginTop: 20,
            }}
          >
            Iniciar juego
          </button>
          <p>{message}</p>
        </>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}
