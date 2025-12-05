'use client'
import { useRef, useEffect, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [win, setWin] = useState(false)

  const player = useRef({ x: 180, y: 500 })
  const bullets = useRef([])
  const enemies = useRef([])
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

    function spawnEnemy() {
      enemies.current.push({
        x: Math.random() * canvas.width,
        y: -20,
        life: 2 + level
      })
    }

    function spawnBoss() {
      boss.current = {
        x: canvas.width / 2 - 50,
        y: 50,
        life: 60 + level * 20
      }
    }

    function autoShoot() {
      const now = Date.now()
      if (now - lastShot > 180) {
        bullets.current.push({ x: player.current.x, y: player.current.y })
        lastShot = now
      }
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      autoShoot()

      enemies.current.forEach(e => {
        e.y += 2 + level
        ctx.fillStyle = 'red'
        ctx.fillRect(e.x, e.y, 20, 20)
      })

      if (boss.current) {
        ctx.fillStyle = 'purple'
        ctx.fillRect(boss.current.x, boss.current.y, 100, 80)
      }

      bullets.current.forEach((b, i) => {
        b.y -= 12
        ctx.fillStyle = 'yellow'
        ctx.fillRect(b.x, b.y, 4, 12)

        enemies.current.forEach((e, j) => {
          if (b.x < e.x + 20 && b.x > e.x && b.y < e.y + 20) {
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
            b.x < boss.current.x + 100 &&
            b.y > boss.current.y &&
            b.y < boss.current.y + 80
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

      ctx.fillStyle = 'cyan'
      ctx.fillRect(player.current.x, player.current.y, 20, 20)

      requestAnimationFrame(loop)
    }

    loop()
    spawnInterval = setInterval(spawnEnemy, 1200)
    bossTimeout = setTimeout(spawnBoss, 25000)

    return () => {
      clearInterval(spawnInterval)
      clearTimeout(bossTimeout)
    }
  }, [level])

  const movePlayer = e => {
    const touch = e.touches[0]
    player.current.x = touch.clientX
    player.current.y = touch.clientY
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

  if (!mounted) return null

  if (win) {
    return (
      <div style={styles.center}>
        <h2>🏆 ¡GANASTE EL JUEGO!</h2>
        <p>Tenés un DESCUENTO EXCLUSIVO</p>
        <a href="https://wa.me/541137659959" style={styles.whatsapp}>
          Reclamar en Smartronica M&M
        </a>
      </div>
    )
  }

  return (
    <div style={styles.container} onTouchMove={movePlayer}>
      <button onClick={goFullscreen} style={styles.fullBtn}>⛶</button>

      <div style={styles.hud}>
        Nivel: {level} | Puntos: {score} | Vidas: {lives}
      </div>

      <div style={styles.publicidad}>
        Publicidad — Smartronica M&M 📱 1137659959
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
