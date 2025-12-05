import { useEffect, useRef, useState } from "react"

export default function Home() {
  const canvasRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)

  const player = useRef({ x: 150, y: 300 })
  const bullets = useRef([])
  const heavyBullets = useRef([])
  const enemies = useRef([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // ✅ Disparo automático rápido
    const shootInterval = setInterval(() => {
      bullets.current.push({
        x: player.current.x,
        y: player.current.y,
        speed: 8
      })
    }, 150)

    // ✅ Enemigos
    const enemyInterval = setInterval(() => {
      enemies.current.push({
        x: Math.random() * canvas.width,
        y: -30,
        speed: 2 + level
      })
    }, 1200)

    function loop() {
      ctx.fillStyle = "#020617"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Player
      ctx.fillStyle = "cyan"
      ctx.beginPath()
      ctx.arc(player.current.x, player.current.y, 15, 0, Math.PI * 2)
      ctx.fill()

      // Balas normales
      bullets.current.forEach((b, i) => {
        b.y -= b.speed
        ctx.fillStyle = "yellow"
        ctx.fillRect(b.x - 2, b.y, 4, 10)
        if (b.y < 0) bullets.current.splice(i, 1)
      })

      // Balas pesadas
      heavyBullets.current.forEach((b, i) => {
        b.y -= b.speed
        ctx.fillStyle = "orange"
        ctx.fillRect(b.x - 5, b.y, 10, 20)
        if (b.y < 0) heavyBullets.current.splice(i, 1)
      })

      // Enemigos
      enemies.current.forEach((e, i) => {
        e.y += e.speed
        ctx.fillStyle = "red"
        ctx.fillRect(e.x, e.y, 30, 30)

        if (e.y > canvas.height) {
          enemies.current.splice(i, 1)
          setLives(v => {
            if (v <= 1) setGameOver(true)
            return v - 1
          })
        }

        bullets.current.forEach((b, bi) => {
          if (
            b.x > e.x &&
            b.x < e.x + 30 &&
            b.y > e.y &&
            b.y < e.y + 30
          ) {
            enemies.current.splice(i, 1)
            bullets.current.splice(bi, 1)
            setScore(s => s + 10)
          }
        })

        heavyBullets.current.forEach((b, bi) => {
          if (
            b.x > e.x &&
            b.x < e.x + 30 &&
            b.y > e.y &&
            b.y < e.y + 30
          ) {
            enemies.current.splice(i, 1)
            heavyBullets.current.splice(bi, 1)
            setScore(s => s + 30)
          }
        })
      })

      if (!gameOver) requestAnimationFrame(loop)
    }

    loop()

    const move = e => {
      const touch = e.touches[0]
      player.current.x = touch.clientX
      player.current.y = touch.clientY
    }

    window.addEventListener("touchmove", move, { passive: false })

    return () => {
      clearInterval(shootInterval)
      clearInterval(enemyInterval)
      window.removeEventListener("resize", resize)
      window.removeEventListener("touchmove", move)
    }
  }, [mounted, level, gameOver])

  const heavyShoot = () => {
    heavyBullets.current.push({
      x: player.current.x,
      y: player.current.y,
      speed: 10
    })
  }

  const goFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  if (!mounted) return null

  if (gameOver) {
    return (
      <div style={styles.center}>
        <h2>💀 GAME OVER</h2>
        <p>Puntaje: {score}</p>
        <a href="https://wa.me/541137659959" style={styles.whatsapp}>
          Smartronica M&M
        </a>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <button onClick={goFullscreen} style={styles.fullBtn}>⛶</button>

      <div style={styles.hud}>
        Nivel: {level} | Puntos: {score} | Vidas: {lives}
      </div>

      <canvas ref={canvasRef} />

      {/* ✅ BOTÓN DISPARO PESADO */}
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
    color: "white"
  }
}
