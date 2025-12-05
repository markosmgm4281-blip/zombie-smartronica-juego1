import { useRef, useEffect, useState } from "react"

export default function Home() {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [score, setScore] = useState(0)
  const [win, setWin] = useState(false)

  const player = useRef({ x: 180, y: 500 })
  const bullets = useRef([])
  const enemies = useRef([])
  const boss = useRef(null)

  useEffect(() => {
    setReady(true)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    document.body.style.overflow = "hidden"
    document.addEventListener("touchmove", e => e.preventDefault(), { passive: false })

    let lastShot = 0

    function autoShoot() {
      const now = Date.now()
      if (now - lastShot > 150) {
        bullets.current.push({ x: player.current.x, y: player.current.y })
        lastShot = now
      }
    }

    function spawnEnemy() {
      enemies.current.push({
        x: Math.random() * canvas.width,
        y: -20,
        life: 2
      })
    }

    function spawnBoss() {
      boss.current = {
        x: canvas.width / 2 - 60,
        y: 60,
        life: 80
      }
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      autoShoot()

      // Enemigos
      enemies.current.forEach((e, i) => {
        e.y += 2
        ctx.fillStyle = "red"
        ctx.fillRect(e.x, e.y, 20, 20)

        if (e.y > canvas.height) enemies.current.splice(i, 1)
      })

      // Boss
      if (boss.current) {
        ctx.fillStyle = "purple"
        ctx.fillRect(boss.current.x, boss.current.y, 120, 90)
      }

      // Balas
      bullets.current.forEach((b, i) => {
        b.y -= 10
        ctx.fillStyle = "yellow"
        ctx.fillRect(b.x, b.y, 4, 10)

        enemies.current.forEach((e, j) => {
          if (
            b.x > e.x &&
            b.x < e.x + 20 &&
            b.y > e.y &&
            b.y < e.y + 20
          ) {
            bullets.current.splice(i, 1)
            e.life--
            if (e.life <= 0) {
              enemies.current.splice(j, 1)
              setScore(s => s + 10)
            }
          }
        })

        if (boss.current) {
          if (
            b.x > boss.current.x &&
            b.x < boss.current.x + 120 &&
            b.y > boss.current.y &&
            b.y < boss.current.y + 90
          ) {
            boss.current.life--
            bullets.current.splice(i, 1)

            if (boss.current.life <= 0) {
              boss.current = null
              setWin(true)
            }
          }
        }
      })

      // Jugador
      ctx.fillStyle = "cyan"
      ctx.fillRect(player.current.x, player.current.y, 20, 20)

      requestAnimationFrame(loop)
    }

    loop()

    const enemyInterval = setInterval(spawnEnemy, 1000)
    const bossTimeout = setTimeout(spawnBoss, 20000)

    return () => {
      clearInterval(enemyInterval)
      clearTimeout(bossTimeout)
    }
  }, [])

  const movePlayer = e => {
    const t = e.touches[0]
    player.current.x = t.clientX
    player.current.y = t.clientY
  }

  const heavyShoot = () => {
    for (let i = 0; i < 12; i++) {
      bullets.current.push({
        x: player.current.x + Math.random() * 30 - 15,
        y: player.current.y
      })
    }
  }

  const goFullscreen = () => {
    document.documentElement.requestFullscreen?.()
  }

  if (!ready) return null

  if (win) {
    return (
      <div style={styles.center}>
        <h2>🏆 ¡GANASTE EL JUEGO!</h2>
        <p>Tenés un DESCUENTO en Smartronica M&M</p>
        <a href="https://wa.me/541137659959" style={styles.whatsapp}>
          Reclamar ahora
        </a>
      </div>
    )
  }

  return (
    <div style={styles.container} onTouchMove={movePlayer}>
      <button onClick={goFullscreen} style={styles.fullBtn}>⛶</button>

      <div style={styles.hud}>
        Puntos: {score}
      </div>

      <div style={styles.publicidad}>
        Smartronica M&M 📱 1137659959
      </div>

      <canvas ref={canvasRef} />

      <button onTouchStart={heavyShoot} style={styles.heavyBtn}>
        💥
      </button>
    </div>
  )
}

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    background: "#020617",
    overflow: "hidden",
    touchAction: "none"
  },
  hud: {
    position: "absolute",
    top: 12,
    left: 12,
    color: "#fff",
    zIndex: 20,
    fontSize: 16
  },
  publicidad: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "#22c55e",
    fontSize: 14,
    zIndex: 30
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
    zIndex: 50
  },
  fullBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
    fontSize: 18,
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: 8,
    borderRadius: 8
  },
  whatsapp: {
    marginTop: 20,
    display: "inline-block",
    padding: 12,
    background: "green",
    color: "white",
    borderRadius: 8,
    textDecoration: "none"
  },
  center: {
    textAlign: "center",
    marginTop: 120,
    color: "white",
    padding: 20
  }
}
