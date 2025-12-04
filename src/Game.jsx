// src/Game.jsx
import { useEffect, useRef, useState } from 'react'

export default function Game() {
  const canvasRef = useRef(null)

  const [chapter, setChapter] = useState(1)      // capitulo actual
  const [level, setLevel] = useState(1)          // nivel dentro del capitulo
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)          // si ganó el juego (derrotó todos los jefes)
  const [discountCode, setDiscountCode] = useState(null)

  const player = useRef({ x: 160 })
  const targetX = useRef(160)
  const bullets = useRef([])
  const zombies = useRef([])
  const boss = useRef(null)
  const spawnIntervalRef = useRef(1200)
  const zombieSpeedRef = useRef(1)

  // parámetros: cuánto dura cada capítulo (niveles) y cuándo aparece jefe
  const CHAPTER_LEVELS = 3   // niveles por capítulo antes del jefe
  const TOTAL_CHAPTERS = 3   // capítulos totales (ajustá a gusto)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 360
    canvas.height = 500

    function spawnZombie() {
      // si hay boss activo no spawnear normales
      if (boss.current) return
      zombies.current.push({
        x: Math.random() * 320,
        y: -40,
        hp: 1
      })
    }

    function spawnBoss() {
      boss.current = { x: 140, y: -120, w: 80, h: 80, hp: 8 + chapter * 4, speed: 0.7 + chapter * 0.2 }
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
      // convertir a coordenada relativa del canvas si hace falta
      targetX.current = Math.max(0, Math.min(320, touchX - 20))
    }

    function update() {
      if (gameOver || won) return

      ctx.clearRect(0, 0, 360, 500)

      // Movimiento suave
      player.current.x += (targetX.current - player.current.x) * 0.15

      // Player
      ctx.fillStyle = 'cyan'
      ctx.fillRect(player.current.x, 420, 40, 40)

      // Bullets
      ctx.fillStyle = 'yellow'
      bullets.current.forEach((b, bi) => {
        b.y -= 6
        ctx.fillRect(b.x, b.y, 4, 10)
        if (b.y < 0) bullets.current.splice(bi, 1)
      })

      // Zombies normales
      ctx.fillStyle = 'green'
      zombies.current.forEach((z, zi) => {
        z.y += zombieSpeedRef.current
        ctx.fillRect(z.x, z.y, 40, 40)

        // choque con jugador
        if (z.y > 500) {
          zombies.current.splice(zi, 1)
          setLives(v => v - 1)
        }
      })

      // Colisiones balas / zombies normales
      zombies.current.forEach((z, zi) => {
        bullets.current.forEach((b, bi) => {
          if (b.x < z.x + 40 && b.x + 4 > z.x && b.y < z.y + 40 && b.y + 10 > z.y) {
            zombies.current.splice(zi, 1)
            bullets.current.splice(bi, 1)
            setScore(s => s + 10)
          }
        })
      })

      // Boss (si está)
      if (boss.current) {
        ctx.fillStyle = '#8b0000'
        boss.current.y += boss.current.speed
        if (boss.current.y > 40) boss.current.y = 40 // no bajar más
        ctx.fillRect(boss.current.x, boss.current.y, boss.current.w, boss.current.h)
        // dibujar HP
        ctx.fillStyle = '#fff'
        ctx.fillText(`Boss HP: ${boss.current.hp}`, 10, 30)

        // balas golpean boss
        bullets.current.forEach((b, bi) => {
          if (b.x < boss.current.x + boss.current.w && b.x + 4 > boss.current.x && b.y < boss.current.y + boss.current.h && b.y + 10 > boss.current.y) {
            bullets.current.splice(bi, 1)
            boss.current.hp -= 1
            setScore(s => s + 15)
          }
        })

        // si boss muerto
        if (boss.current.hp <= 0) {
          boss.current = null
          // si era el jefe final del capítulo:
          if (level > CHAPTER_LEVELS) {
            // terminó el capítulo
            if (chapter >= TOTAL_CHAPTERS) {
              // juego ganado
              setWon(true)
              // generar código único
              const code = `MM-WIN-${Math.random().toString(36).slice(2,7).toUpperCase()}`
              setDiscountCode(code)
              // enviar lead marcando win
              fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Anónimo', chapter, score, won: true, code })
              }).catch(()=>{})
              return
            } else {
              // nuevo capítulo
              setChapter(c => c + 1)
              setLevel(1)
              zombieSpeedRef.current += 0.6
              spawnIntervalRef.current = Math.max(500, spawnIntervalRef.current - 200)
            }
          }
        }
      }

      // mostrar UI
      ctx.fillStyle = '#fff'
      ctx.fillText(`Cap: ${chapter} | Nivel: ${level} | Punt: ${score} | Vidas: ${lives}`, 10, 15)

      requestAnimationFrame(update)
    }

    // logica de subida de nivel y aparición de jefe
    const levelChecker = setInterval(() => {
      // si ya está boss no subir nivel
      if (boss.current) return
      // cada cierta cantidad de puntos sube nivel
      // o podés incrementar por tiempo; aquí usamos score
      if (score >= level * 100) {
        setLevel(l => l + 1)
        zombieSpeedRef.current += 0.25
      }
      // cuando el nivel supera CHAPTER_LEVELS lanzamos un jefe
      if (level > CHAPTER_LEVELS && !boss.current) {
        spawnBoss()
      }
    }, 700)

    const spawnInterval = setInterval(spawnZombie, spawnIntervalRef.current)
    update()

    window.addEventListener('touchstart', shoot)
    window.addEventListener('touchmove', move)

    return () => {
      clearInterval(spawnInterval)
      clearInterval(levelChecker)
      window.removeEventListener('touchstart', shoot)
      window.removeEventListener('touchmove', move)
    }
  }, [score, level, chapter, gameOver])

  useEffect(() => {
    if (lives <= 0) setGameOver(true)
  }, [lives])

  // si ganó mostrando pantalla final con código (solo si won == true)
  if (won) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>🏆 ¡FELICITACIONES! GANASTE TODO EL JUEGO</h2>
        <p>Puntaje total: {score}</p>
        <p>Tu código de descuento (válido en SmARTRonica M&M):</p>
        <h3>{discountCode}</h3>

        <a
          href={`https://wa.me/541137659959?text=${encodeURIComponent(`Hola! Reclamo mi descuento ${discountCode} - Vine por el juego` )}`}
          style={{
            display: 'inline-block',
            marginTop: 12,
            padding: 12,
            background: '#16a34a',
            color: '#fff',
            borderRadius: 8
          }}
        >
          Reclamar por WhatsApp
        </a>

        <p style={{ marginTop: 16 }}>
          Compartí tu logro:
        </p>
        <button
          onClick={() => {
            const txt = `Gané el Zombie Repair Runner de SmARTRonica M&M y conseguí este código: ${discountCode}. Jugalo: ${location.href}`
            if (navigator.share) {
              navigator.share({ title: 'Zombie Repair Runner', text: txt, url: location.href }).catch(()=>{})
            } else {
              window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`,'_blank')
            }
          }}
          style={{ padding: '10px 14px', borderRadius: 8, background:'#0b84ff', color:'#fff', border:'none' }}
        >
          Compartir en WhatsApp
        </button>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>💀 Game Over</h2>
        <p>Puntaje: {score}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 12 }}>Volver a intentar</button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p>Capítulo: {chapter} | Nivel: {level} | Puntaje: {score} | Vidas: {lives}</p>
      <canvas ref={canvasRef} style={{ background: '#111', borderRadius: 8 }} />
      <p>👉 Tocá para disparar — Deslizá para moverte</p>

      <div style={{ marginTop: 12, border: '2px dashed #777', padding: 10 }}>
        Publicidad aquí (reemplazar por AdSense)
      </div>
    </div>
  )
}
