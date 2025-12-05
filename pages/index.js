import { useRef, useEffect, useState } from 'react'

export default function Home() {
  const canvasRef = useRef(null)

  const player = useRef({ x: 150, y: 400 })
  const bullets = useRef([])
  const enemies = useRef([])
  const boss = useRef(null)

  const [mounted, setMounted] = useState(false)
  const [score, setScore] = useState(0)
  const [win, setWin] = useState(false)

  useEffect(() => {
    setMounted(true)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    document.body.style.margin = 0
    document.body.style.overflow = 'hidden'

    let lastShot = 0
    let enemyInterval
    let bossTimeout

    function spawnEnemy() {
      enemies.current.push({
        x: Math.random() * canvas.width,
        y: -30,
        life: 3
      })
    }

    function spawnBoss() {
      boss.current = {
        x: canvas.width / 2 - 60,
        y: 40,
        life: 120
      }
    }

    function autoShoot() {
      const now = Date.now()
      if (now - lastShot > 120) {
        bullets.current.push({
          x: player.current.x + 10,
          y: player.current.y
        })
        lastShot = now
      }
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      autoShoot()

      // Enemigos
      enemies.current.forEach((e, i) => {
        e.y += 2
        ctx.fillStyle = 'red'
        ctx.fillRect(e.x, e.y, 24, 24)

        if (e.y > canvas.height) enemies.current.splice(i, 1)
      })

      // Jefe
      if (boss.current) {
        ctx.fillStyle = 'purple'
        ctx.fillRect(boss.current.x, boss.current.y, 120, 90)
      }

      // Balas
      bullets.current.forEach((b, i) => {
        b.y -= 10
        ctx.fillStyle = 'yellow'
        ctx.fillRect(b.x, b.y, 4, 12)

        enemies.current.forEach((e, j) => {
          if (
            b.x < e.x + 24 &&
            b.x > e.x &&
            b.y < e.y + 24 &&
            b.y > e.y
          ) {
            e.life--
            bullets.current.splice(i, 1)
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
      ctx.fillStyle = 'cyan'
      ctx.fillRect(player.current.x, player.current.y, 24, 24)

      requestAnimationFrame(loop)
    }

    enemyInterval = setInterval(spawnEnemy, 800)
    bossTimeout = setTimeout(spawnBoss, 20000)

    loop()

    return () => {
      clearInterval(enemyInterval)
      clearTimeout(bossTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const movePlayer = e => {
    const t = e.touches[0]
    player.current.x = t.clientX
    player.current.y = t.clientY
  }

  const heavyShoot = () => {
    for (let i = 0; i < 15; i++) {
      bullets.current.push({
        x: player.current.x + Math.random() * 40 - 20,
        y: player.current.y
      })
    }
  }

  const goFullscreen = () => {
    document.documentElement.requestFullscreen?.()
  }

  if (!mounted) return null

  if (win) {
    return (
      <div style={styles.center}>
        <h1>🏆 ¡GANASTE!</h1>
        <p>Tenés un descuento exclusivo en:</p>
        <a href="https://wa.me/541137659959" style={styles.whatsapp}>
          Smartronica M&M
        </a>
        <p style={{ marginTop: 20 }}>
          📱 1137659959
        </p>
      </div>
    )
  }

  return (
    <div style={styles.container} onTouchMove={movePlayer}>
      <button onClick={goFullscreen} style={styles.fullBtn}>⛶</button>

      <div style={styles.hud}>
        Smartronica M&M | Puntos: {score}
      </div>

      <div style={styles.publicidad}>
        PUBLICIDAD — Smartronica M&M 📱 1137659959
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
    position: 'fixed',
    inset: 0,
    background: '#020617',
    overflow: 'hidden',
    touchAction: 'none'
  },
  hud: {
    position: 'absolute',
    top: 12,
    left: 12,
    color: '#fff',
    zIndex: 20,
    fontSize: 16
  },
  publicidad: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: '#22c55e',
    fontSize: 14,
    zIndex: 30
  },
  heavyBtn: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 95,
    height: 95,
    borderRadius: '50%',
    border: 'none',
    background: 'radial-gradient(circle,#f97316,#7c2d12)',
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    zIndex: 50
  },
  fullBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
    fontSize: 18,
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: 8,
    borderRadius: 8
  },
  whatsapp: {
    marginTop: 20,
    display: 'inline-block',
    padding: 12,
    background: 'green',
    color: 'white',
    borderRadius: 8,
    textDecoration: 'none'
  },
  center: {
    textAlign: 'center',
    marginTop: 120,
    color: 'white',
    padding: 20
  }
}
