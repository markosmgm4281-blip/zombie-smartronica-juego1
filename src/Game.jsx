import { useEffect, useRef, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)

  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [discount, setDiscount] = useState(null)

  const player = useRef({ x: 160 })
  const targetX = useRef(160)
  const bullets = useRef([])
  const zombies = useRef([])
  const speed = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
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

    function movePlayer(e) {
      const touchX = e.touches[0].clientX
      targetX.current = Math.max(0, Math.min(320, touchX - 20))
    }

    function update() {
      if (gameOver) return

      ctx.clearRect(0, 0, 360, 500)

      // 🎯 Movimiento suave hacia el objetivo
      player.current.x += (targetX.current - player.current.x) * 0.15

      // Player
      ctx.fillStyle = 'cyan'
      ctx.fillRect(player.current.x, 420, 40, 40)

      // Bullets
      ctx.fillStyle = 'yellow'
      bullets.current.forEach((b, i) => {
        b.y -= 6
        ctx.fillRect(b.x, b.y, 4, 10)
        if (b.y < 0) bullets.current.splice(i, 1)
      })

      // Zombies
      ctx.fillStyle = 'green'
      zombies.current.forEach((z, zi) => {
        z.y += speed.current
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
              const newScore = v + 10

              if (newScore % 100 === 0) {
                setLevel(l => l + 1)
                speed.current += 0.5
              }

              return newScore
            })
          }
        })
      })

      requestAnimationFrame(update)
    }

    const interval = setInterval(spawnZombie, 1200)
    update()

    window.addEventListener('touchstart', shoot)
    window.addEventListener('touchmove', movePlayer)

    return () => {
      clearInterval(interval)
      window.removeEventListener('touchstart', shoot)
      window.removeEventListener('touchmove', movePlayer)
    }
  }, [gameOver])

  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true)
      setDiscount('ZOMBIE10')
    }
  }, [lives])

  if (gameOver) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>💀 Game Over</h2>
        <p>Puntaje: {score}</p>
        <p>Código de descuento:</p>
        <h3>{discount}</h3>

        <a
          href="https://wa.me/541137659959"
          style={{
            display: 'inline-block',
            marginTop: 10,
            padding: 12,
            background: 'green',
            color: '#fff',
            borderRadius: 8
          }}
        >
          Reclamar por WhatsApp
        </a>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p>Nivel: {level} | Puntos: {score} | Vidas: {lives}</p>
      <canvas ref={canvasRef} style={{ background: '#111', borderRadius: 8 }} />
      <p>
        👉 Tocá para disparar<br />
        👉 Deslizá el dedo para moverte suave
      </p>
    </div>
  )
}
