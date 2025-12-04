import { useEffect, useRef, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)

  const player = useRef({ x: 0 })
  const touchX = useRef(null)
  const bullets = useRef([])
  const zombies = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    player.current.x = canvas.width / 2 - 20

    function spawnZombie() {
      zombies.current.push({
        x: Math.random() * (canvas.width - 40),
        y: -40
      })
    }

    function shoot() {
      bullets.current.push({
        x: player.current.x + 18,
        y: canvas.height - 120
      })
    }

    function handleMove(e) {
      const x = e.touches[0].clientX
      touchX.current = x
    }

    function update() {
      if (gameOver) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // mover jugador por desliz
      if (touchX.current !== null) {
        player.current.x += (touchX.current - player.current.x - 20) * 0.2
      }

      // dibujar jugador
      ctx.fillStyle = 'cyan'
      ctx.fillRect(player.current.x, canvas.height - 90, 40, 40)

      // balas
      ctx.fillStyle = 'yellow'
      bullets.current.forEach((b, i) => {
        b.y -= 8
        ctx.fillRect(b.x, b.y, 5, 12)
        if (b.y < 0) bullets.current.splice(i, 1)
      })

      // zombies
      ctx.fillStyle = 'green'
      zombies.current.forEach((z, zi) => {
        z.y += 1 + level * 0.4
        ctx.fillRect(z.x, z.y, 40, 40)

        if (z.y > canvas.height) {
          zombies.current.splice(zi, 1)
          setLives(v => v - 1)
        }
      })

      // colisiones
      zombies.current.forEach((z, zi) => {
        bullets.current.forEach((b, bi) => {
          if (
            b.x < z.x + 40 &&
            b.x + 5 > z.x &&
            b.y < z.y + 40 &&
            b.y + 12 > z.y
          ) {
            zombies.current.splice(zi, 1)
            bullets.current.splice(bi, 1)
            setScore(s => s + 10)
          }
        })
      })

      requestAnimationFrame(update)
    }

    const spawner = setInterval(spawnZombie, 1200)

    window.addEventListener('touchmove', handleMove)
    update()

    return () => {
      clearInterval(spawner)
      window.removeEventListener('touchmove', handleMove)
    }
  }, [level, gameOver])

  useEffect(() => {
    if (score >= level * 100) setLevel(l => l + 1)
    if (lives <= 0) setGameOver(true)
  }, [score, lives, level])

  if (gameOver) {
    return (
      <div style={styles.center}>
        <h2>💀 GAME OVER</h2>
        <p>Puntaje: {score}</p>
        <a
          href="https://wa.me/541137659959"
          style={styles.whatsapp}
        >
          Contactar SmARTRonica M&M
        </a>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* HUD */}
      <div style={styles.hud}>
        Nivel: {level} | Puntos: {score} | Vidas: {lives}
      </div>

      {/* BOTÓN DE DISPARO */}
      <button onTouchStart={() => {
        bullets.current.push({
          x: player.current.x + 18,
          y: window.innerHeight - 120
        })
      }} style={styles.fireBtn}>
        🔫
      </button>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    background: 'black'
  },
  canvas: {
    width: '100vw',
    height: '100vh'
  },
  hud: {
    position: 'absolute',
    top: 10,
    left: 10,
    color: 'white',
    fontSize: 14,
    zIndex: 10
  },
  fireBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 70,
    height: 70,
    fontSize: 28,
    borderRadius: '50%',
    border: 'none',
    background: 'red',
    color: 'white',
    zIndex: 10
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
    marginTop: 100
  }
}
