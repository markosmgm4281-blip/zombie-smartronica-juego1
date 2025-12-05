'use client'
import { useRef, useEffect, useState } from 'react'

export default function Home() {
  const canvasRef = useRef(null)
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(0)

  const player = useRef({ x: 180, y: 500 })
  const bullets = useRef([])
  const enemies = useRef([])

  useEffect(() => {
    if (!started) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    document.body.style.overflow = 'hidden'
    document.addEventListener(
      'touchmove',
      e => e.preventDefault(),
      { passive: false }
    )

    function spawnEnemy() {
      enemies.current.push({
        x: Math.random() * canvas.width,
        y: -20
      })
    }

    function shoot() {
      bullets.current.push({
        x: player.current.x,
        y: player.current.y
      })
    }

    const shootInterval = setInterval(shoot, 200)
    const enemyInterval = setInterval(spawnEnemy, 1200)

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Jugador
      ctx.fillStyle = 'cyan'
      ctx.fillRect(player.current.x, player.current.y, 25, 25)

      // Balas
      bullets.current.forEach((b, i) => {
        b.y -= 10
        ctx.fillStyle = 'yellow'
        ctx.fillRect(b.x, b.y, 5, 10)
        if (b.y < 0) bullets.current.splice(i, 1)
      })

      // Enemigos
      enemies.current.forEach((e, i) => {
        e.y += 3
        ctx.fillStyle = 'red'
        ctx.fillRect(e.x, e.y, 25, 25)

        bullets.current.forEach((b, j) => {
          if (
            b.x < e.x + 25 &&
            b.x + 5 > e.x &&
            b.y < e.y + 25 &&
            b.y + 10 > e.y
          ) {
            enemies.current.splice(i, 1)
            bullets.current.splice(j, 1)
            setScore(s => s + 10)
          }
        })
      })

      requestAnimationFrame(loop)
    }

    loop()

    return () => {
      clearInterval(enemyInterval)
      clearInterval(shootInterval)
    }
  }, [started])

  const movePlayer = e => {
    const touch = e.touches[0]
    player.current.x = touch.clientX
    player.current.y = touch.clientY
  }

  if (!started) {
    return (
      <div style={styles.menu}>
        <h1>🧟 Zombie Smartronica M&M</h1>
        <p>Disparo automático - Mové con el dedo</p>
        <button onClick={() => setStarted(true)} style={styles.startBtn}>
          Iniciar Juego
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container} onTouchMove={movePlayer}>
      <div style={styles.hud}>
        Puntos: {score}
      </div>

      <div style={styles.publicidad}>
        Smartronica M&M 📱 1137659959
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
    top: 10,
    left: 10,
    color: '#fff',
    fontSize: 18,
    zIndex: 20
  },
  publicidad: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: '#22c55e',
    fontSize: 14,
    zIndex: 20
  },
  menu: {
    background: '#020617',
    height: '100vh',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  startBtn: {
    marginTop: 20,
    padding: 15,
    fontSize: 18,
    borderRadius: 10,
    border: 'none',
    background: '#22c55e',
    color: 'black'
  }
}
