import { useEffect, useRef, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [discount, setDiscount] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = 360
    canvas.height = 500

    let player = { x: 160, y: 420, w: 40, h: 40 }
    let bullets = []
    let zombies = []
    let speed = 1 + level * 0.5

    function spawnZombie() {
      zombies.push({
        x: Math.random() * 320,
        y: -40,
        w: 40,
        h: 40
      })
    }

    function shoot() {
      bullets.push({
        x: player.x + 18,
        y: player.y,
        w: 4,
        h: 10
      })
    }

    function update() {
      if (gameOver) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Player
      ctx.fillStyle = 'cyan'
      ctx.fillRect(player.x, player.y, player.w, player.h)

      // Bullets
      ctx.fillStyle = 'yellow'
      bullets.forEach(b => {
        b.y -= 5
        ctx.fillRect(b.x, b.y, b.w, b.h)
      })

      // Zombies
      ctx.fillStyle = 'green'
      zombies.forEach(z => {
        z.y += speed
        ctx.fillRect(z.x, z.y, z.w, z.h)
      })

      // Collisions
      zombies.forEach((z, zi) => {
        bullets.forEach((b, bi) => {
          if (
            b.x < z.x + z.w &&
            b.x + b.w > z.x &&
            b.y < z.y + z.h &&
            b.y + b.h > z.y
          ) {
            zombies.splice(zi, 1)
            bullets.splice(bi, 1)
            setScore(s => s + 10)

            if ((score + 10) % 100 === 0) {
              setLevel(l => l + 1)
              speed += 0.5
            }
          }
        })

        if (z.y > canvas.height) {
          zombies.splice(zi, 1)
          setLives(l => l - 1)
        }
      })

      if (lives <= 0) {
        setGameOver(true)
        setDiscount('ZOMBIE10')
      }

      requestAnimationFrame(update)
    }

    const interval = setInterval(spawnZombie, 1000 - level * 80)
    update()

    window.addEventListener('touchstart', shoot)

    return () => {
      clearInterval(interval)
      window.removeEventListener('touchstart', shoot)
    }
  }, [level, lives, gameOver, score])

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
      <p>Tocá la pantalla para disparar</p>
    </div>
  )
}
