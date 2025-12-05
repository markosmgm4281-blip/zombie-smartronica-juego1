'use client'
import { useRef, useEffect, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)

  const [mounted, setMounted] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)

  const player = useRef({ x: 200, y: 500 })
  const bullets = useRef([])
  const enemies = useRef([])
  const enemyBullets = useRef([])
  const boss = useRef(null)

  useEffect(() => {
    setMounted(true)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    document.body.style.overflow = 'hidden'
    document.addEventListener('touchmove', e => e.preventDefault(), { passive: false })

    let lastShot = 0
    let spawnInterval
    let bossInterval

    function spawnEnemy() {
      enemies.current.push({
        x: Math.random() * canvas.width,
        y: -20,
        life: 2 + level,
        speed: 1 + level * 0.3
      })
    }

    function spawnBoss() {
      boss.current = {
        x: canvas.width / 2 - 60,
        y: 40,
        life: 80 + level * 25,
        dir: 1
      }
    }

    function autoShoot() {
      const now = Date.now()
      if (now - lastShot > 180) {
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
        e.y += e.speed
        ctx.fillStyle = 'red'
        ctx.fillRect(e.x, e.y, 24, 24)

        if (e.y > canvas.height) {
          enemies.current.splice(i, 1)
          setLives(l => l - 1)
        }
      })

      // Jefe
      if (boss.current) {
        boss.current.x += boss.current.dir * 3

        if (boss.current.x < 0 || boss.current.x > canvas.width - 120) {
          boss.current.dir *= -1
        }

        ctx.fillStyle = 'purple'
        ctx.fillRect(boss.current.x, boss.current.y, 120, 80)

        // Disparo del jefe
        if (Math.random() < 0.03) {
          enemyBullets.current.push({
            x: boss.current.x + 60,
            y: boss.current.y + 80
          })
        }
      }

      // Balas del jugador
      bullets.current.forEach((b, i) => {
        b.y -= 12
        ctx.fillStyle = 'yellow'
        ctx.fillRect(b.x, b.y, 5, 15)

        enemies.current.forEach((e, j) => {
          if (b.x < e.x + 24 && b.x > e.x && b.y < e.y + 24 && b.y > e.y) {
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
            b.y < boss.current.y + 80
          ) {
            boss.current.life--
            bullets.current.splice(i, 1)

            if (boss.current.life <= 0) {
              boss.current = null
              enemies.current = []
              enemyBullets.current = []
              setLevel(l => l + 1)
            }
          }
        }
      })

      // Balas enemigas
      enemyBullets.current.forEach((b, i) => {
        b.y += 7
        ctx.fillStyle = 'white'
        ctx.fillRect(b.x, b.y, 6, 14)

        if (
          b.x > player.current.x &&
          b.x < player.current.x + 20 &&
          b.y > player.current.y &&
          b.y < player.current.y + 20
        ) {
          enemyBullets.current.splice(i, 1)
          setLives(l => l - 1)
        }
      })

      // Jugador
      ctx.fillStyle = 'cyan'
      ctx.fillRect(player.current.x, player.current.y, 22, 22)

      if (lives <= 0) setGameOver(true)

      requestAnimationFrame(loop)
    }

    spawnInterval = setInterval(spawnEnemy, Math.max(800 - level * 60, 250))

    if (level % 5 === 0) {
      bossInterval = setTimeout(spawnBoss, 3000)
    }

    loop()

    return () => {
      clearInterval(spawnInterval)
      clearTimeout(bossInterval)
    }
  }, [level])

  const movePlayer = e => {
    const touch = e.touches[0]
    player.current.x = touch.clientX
    player.current.y = touch.clientY
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

  if (gameOver) {
    return (
      <div style={styles.center}>
        <h2>💀 GAME OVER</h2>
        <p>Nivel alcanzado: {level}</p>
        <p>Puntaje: {score}</p>
        <a href="https://wa.me/541137659959" style={styles.whatsapp}>
          Smartronica M&M
        </a>
      </div>
    )
  }

  return (
    <div style={styles.container} onTouchMove={movePlayer}>
      <button onClick={goFullscreen} style={styles.fullBtn}>⛶</button>

      <div style={styles.hud}>
        Nivel {level} | Puntos {score} | Vidas {lives}
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
