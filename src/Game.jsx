import { useEffect, useRef, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)

  const player = useRef({ x: 160 })
  const targetX = useRef(160)
  const bullets = useRef([])
  const zombies = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = 360
    canvas.height = 500

    function spawnZombie() {
      zombies.current.push({
        x: Math.random() * 320,
        y: -40
      })
    }

    function shoot() {
      bullets.current.push({
        x: player.current.x + 18,
        y: 420
      })
    }

    function move(e) {
      if (!e.touches) return
      const touchX = e.touches[0].clientX
      targetX.current = Math.max(0, Math.min(320, touchX - 20))
    }

    function update() {
      if (gameOver) return

      ctx.clearRect(0, 0, 360, 500)

      // Movimiento suave
      player.current.x += (targetX.current - player.current.x) * 0.15

      // Player
      ctx.fillStyle = 'cyan'
      ctx.fillRect(player.current.x, 420, 40, 40)

      // Balas
      ctx.fillStyle = 'yellow'
      bullets.current.forEach((b, bi) => {
        b.y -= 6
        ctx.fillRect(b.x, b.y, 4, 10)
        if (b.y < 0) bullets.current.splice(bi, 1)
      })

      // Zombies
      ctx.fillStyle = 'green'
      zombies.current.forEach((z, zi) => {
        z.y += 1 + level * 0.3
        ctx.fillRect(z.x, z.y, 40, 40)

        if (z.y > 500) {
          zombies.current.splice(zi, 1)
          setLives(v => v - 1)
        }
      })

      // Colisiones
      zombies.current.forEach((z, zi) => {
        bullets.current.forEach((b, bi) => {
          if (
            b.x < z.x + 40 &&
            b.x + 4 > z.x &&
            b.y < z.y + 40 &&
            b.y + 10 > z.y
          ) {
            zombies.current.splice(zi, 1)
            bullets.current.splice(bi, 1)

            setScore(v => {
              const n = v + 10
              if (n % 100 === 0) setLevel(l => l + 1)
              return n
            })
          }
        })
      })

      requestAnimationFrame(update)
    }

    const interval = setInterval(spawnZombie, 1200)

    window.addEventListener('touchstart', shoot)
    window.addEventListener('touchmove', move)

    update()

    return () => {
      clearInterval(interval)
      window.removeEventListener('touchstart', shoot)
      window.removeEventListener('touchmove', move)
    }
  }, [gameOver, level])

  useEffect(() => {
    if (lives <= 0) setGameOver(true)
  }, [lives])

  if (gameOver) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>💀 Game Over</h2>
        <p>Puntaje: {score}</p>

        <a
          href="https://wa.me/541137659959"
          style={{
            padding: 12,
            background: 'green',
            color: '#fff',
            borderRadius: 8,
            display: 'inline-block',
            marginTop: 10
          }}
        >
          Reclamar descuento en SmARTRonica M&M
        </a>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p>Nivel: {level} | Puntos: {score} | Vidas: {lives}</p>
      <canvas ref={canvasRef} style={{ background: '#111', borderRadius: 8 }} />
      <p>👉 Tocá para disparar<br/>👉 Deslizá para moverte</p>
    </div>
  )
}
