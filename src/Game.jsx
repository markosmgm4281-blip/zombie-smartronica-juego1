import { useEffect, useRef, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)

  const [mounted, setMounted] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)

  const player = useRef({ x: 150 })
  const targetX = useRef(150)
  const bullets = useRef([])
  const zombies = useRef([])

  // ✅ asegura que solo se ejecute en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      player.current.x = canvas.width / 2 - 20
      targetX.current = player.current.x
    }

    resize()
    window.addEventListener('resize', resize)

    function drawBackground() {
      ctx.fillStyle = '#020617'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    function spawnZombie() {
      zombies.current.push({
        x: Math.random() * (canvas.width - 50),
        y: -60,
        size: 50
      })
    }

    function update() {
      if (gameOver) return

      drawBackground()

      // mover por desliz
      player.current.x += (targetX.current - player.current.x) * 0.25

      // jugador
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(player.current.x, canvas.height - 110, 40, 40)

      // balas
      ctx.fillStyle = '#fde047'
      bullets.current.forEach((b, i) => {
        b.y -= 10
        ctx.fillRect(b.x, b.y, 5, 14)
        if (b.y < 0) bullets.current.splice(i, 1)
      })

      // zombies
      ctx.fillStyle = '#22c55e'
      zombies.current.forEach((z, zi) => {
        z.y += 1.5 + level * 0.4
        ctx.fillRect(z.x, z.y, z.size, z.size)

        if (z.y > canvas.height) {
          zombies.current.splice(zi, 1)
          setLives(v => v - 1)
        }
      })

      // colisiones
      zombies.current.forEach((z, zi) => {
        bullets.current.forEach((b, bi) => {
          if (
            b.x < z.x + z.size &&
            b.x + 5 > z.x &&
            b.y < z.y + z.size &&
            b.y + 14 > z.y
          ) {
            zombies.current.splice(zi, 1)
            bullets.current.splice(bi, 1)
            setScore(v => v + 10)
          }
        })
      })

      requestAnimationFrame(update)
    }

    const spawner = setInterval(spawnZombie, 1000)
    update()

    function handleMove(e) {
      if (!e.touches || !e.touches[0]) return
      targetX.current = e.touches[0].clientX - 20
    }

    window.addEventListener('touchmove', handleMove)

    return () => {
      clearInterval(spawner)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('resize', resize)
    }
  }, [mounted, level, gameOver])

  useEffect(() => {
    if (score >= level * 120) setLevel(v => v + 1)
    if (lives <= 0) setGameOver(true)
  }, [score, lives])

  // ✅ disparo seguro
  function shoot() {
    bullets.current.push({
      x: player.current.x + 18,
      y: window.innerHeight - 130
    })
  }

  // ✅ fullscreen seguro
  function goFullscreen() {
    if (typeof document === 'undefined') return
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

      <button onTouchStart={shoot} style={styles.fireBtn}>🔥</button>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    background: '#020617',
    overflow: 'hidden'
  },
  hud: {
    position: 'absolute',
    top: 12,
    left: 12,
    color: '#fff',
    zIndex: 20,
    fontSize: 14
  },
  fireBtn: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 75,
    height: 75,
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(145deg,#ef4444,#7f1d1d)',
    color: '#fff',
    fontSize: 26,
    zIndex: 20
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
