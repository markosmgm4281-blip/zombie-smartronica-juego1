import { useEffect, useRef, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)
  const bullets = useRef([])
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
    if (!mounted) return
    if (!canvasRef.current) return

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
        size: 50
      })
    }

    function draw() {
      if (gameOver) return

      ctx.fillStyle = '#020617'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      player.current.x += (targetX.current - player.current.x) * 0.2
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(player.current.x, canvas.height - 110, 40, 40)

      ctx.fillStyle = '#fde047'
      bullets.current.forEach((b, i) => {
        b.y -= 12
        ctx.fillRect(b.x, b.y, 6, 16)
        if (b.y < 0) bullets.current.splice(i, 1)
      })

      ctx.fillStyle = '#22c55e'
      zombies.current.forEach((z, zi) => {
        z.y += 1.3 + level * 0.4
        ctx.fillRect(z.x, z.y, z.size, z.size)

        if (z.y > canvas.height) {
          zombies.current.splice(zi, 1)
          setLives(v => v - 1)
        }
      })

      zombies.current.forEach((z, zi) => {
        bullets.current.forEach((b, bi) => {
          if (
            b.x < z.x + z.size &&
            b.x + 6 > z.x &&
            b.y < z.y + z.size &&
            b.y + 16 > z.y
          ) {
            zombies.current.splice(zi, 1)
            bullets.current.splice(bi, 1)
            setScore(v => v + 10)
          }
        })
      })

      requestAnimationFrame(draw)
    }

    const spawner = setInterval(spawnZombie, 900)

    // ✅ AUTO DISPARO CADA 300ms
    const autoFire = setInterval(() => {
      bullets.current.push({
        x: player.current.x + 18,
        y: canvas.height - 130
      })
    }, 300)

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
    if (score >= level * 120) setLevel(v => v + 1)
    if (lives <= 0) setGameOver(true)
  }, [score, lives])

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
    fontSize: 14
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
