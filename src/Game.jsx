import { useEffect, useRef, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)
  const bullets = useRef([])
  const heavyBullets = useRef([])
  const zombies = useRef([])
  const player = useRef({ x: 150 })
  const targetX = useRef(150)

  const [mounted, setMounted] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      player.current.x = canvas.width / 2 - 20
      targetX.current = player.current.x
    }

    resize()
    window.addEventListener('resize', resize)

    function spawnZombie() {
      zombies.current.push({
        x: Math.random() * (canvas.width - 50),
        y: -60,
        size: 50,
        life: level >= 3 ? 2 : 1
      })
    }

    function draw() {
      if (gameOver) return

      ctx.fillStyle = '#020617'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // jugador
      player.current.x += (targetX.current - player.current.x) * 0.25
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(player.current.x, canvas.height - 110, 40, 40)

      // 🔫 BALAS AUTOMÁTICAS (RÁPIDAS)
      ctx.fillStyle = '#fde047'
      bullets.current.forEach((b, i) => {
        b.y -= 18 // MÁS RÁPIDO
        ctx.fillRect(b.x, b.y, 6, 16)
        if (b.y < 0) bullets.current.splice(i, 1)
      })

      // 💥 BALAS PESADAS
      ctx.fillStyle = '#f97316'
      heavyBullets.current.forEach((b, i) => {
        b.y -= 12
        ctx.fillRect(b.x, b.y, 14, 30)
        if (b.y < 0) heavyBullets.current.splice(i, 1)
      })

      // 🧟 ZOMBIES
      ctx.fillStyle = '#22c55e'
      zombies.current.forEach((z, zi) => {
        z.y += 1.4 + level * 0.5
        ctx.fillRect(z.x, z.y, z.size, z.size)

        if (z.y > canvas.height) {
          zombies.current.splice(zi, 1)
          setLives(v => v - 1)
        }
      })

      // colisión bala normal
      zombies.current.forEach((z, zi) => {
        bullets.current.forEach((b, bi) => {
          if (
            b.x < z.x + z.size &&
            b.x + 6 > z.x &&
            b.y < z.y + z.size &&
            b.y + 16 > z.y
          ) {
            z.life -= 1
            bullets.current.splice(bi, 1)
            if (z.life <= 0) {
              zombies.current.splice(zi, 1)
              setScore(v => v + 10)
            }
          }
        })
      })

      // colisión bala pesada (mata de 1)
      zombies.current.forEach((z, zi) => {
        heavyBullets.current.forEach((b, bi) => {
          if (
            b.x < z.x + z.size &&
            b.x + 14 > z.x &&
            b.y < z.y + z.size &&
            b.y + 30 > z.y
          ) {
            zombies.current.splice(zi, 1)
            heavyBullets.current.splice(bi, 1)
            setScore(v => v + 30)
          }
        })
      })

      requestAnimationFrame(draw)
    }

    const spawner = setInterval(spawnZombie, 850)

    // ✅ 🔥 DISPARO AUTOMÁTICO MUY RÁPIDO
    const autoFire = setInterval(() => {
      bullets.current.push({
        x: player.current.x + 18,
        y: canvas.height - 130
      })
    }, 140) // MÁS RÁPIDO

    function handleTouch(e) {
      e.preventDefault()
      if (!e.touches || !e.touches[0]) return
      targetX.current = e.touches[0].clientX - 20
    }

    window.addEventListener('touchstart', handleTouch, { passive: false })
    window.addEventListener('touchmove', handleTouch, { passive: false })

    draw()

    return () => {
      clearInterval(spawner)
      clearInterval(autoFire)
      window.removeEventListener('touchstart', handleTouch)
      window.removeEventListener('touchmove', handleTouch)
      window.removeEventListener('resize', resize)
    }
  }, [mounted, level, gameOver])

  useEffect(() => {
    if (score >= level * 180) setLevel(v => v + 1)
    if (lives <= 0) setGameOver(true)
  }, [score, lives])

  // ✅ 💥 BOTÓN DE FUEGO PESADO
  function heavyShoot() {
    if (!canvasRef.current) return
    heavyBullets.current.push({
      x: player.current.x + 12,
      y: canvasRef.current.height - 150
    })
  }

  function goFullscreen() {
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen()
  }

  if (!mounted) return null

  if (gameOver) {
    return (
      <div style={styles.center}>
        <h2>💀 GAME OVER</h2>
        <p>Puntaje: {score}</p>
        <a href="https://wa.me/541137659959" style={styles.whatsapp}>
          SmARTRonica M&M
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

      {/* ✅ BOTÓN GRANDE DE DISPARO PESADO */}
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
    color: 'white'
  }
}
