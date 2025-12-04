import Head from 'next/head'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const Game = dynamic(() => import('../src/Game'), { ssr: false })

export default function Home() {
  const [play, setPlay] = useState(false)

  return (
    <div style={{ background: '#0b1220', minHeight: '100vh', color: '#fff', padding: 20 }}>
      <Head>
        <title>Zombie Repair Runner - SmARTRonica M&M</title>
      </Head>

      {!play ? (
        <div style={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
          <h1>🧟 Zombie Repair Runner</h1>
          <p>Jugá, mirá publicidad y ganá descuentos para reparar tu celular</p>

          <p style={{ marginTop: 10 }}>
            <strong>SmARTRonica M&M</strong><br />
            WhatsApp: <strong>1137659959</strong>
          </p>

          <button
            onClick={() => setPlay(true)}
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 10,
              border: 'none',
              background: '#16a34a',
              color: '#fff',
              fontSize: 16
            }}
          >
            🎮 JUGAR
          </button>

          <div style={{ marginTop: 30, border: '2px dashed #888', padding: 20 }}>
            Publicidad aquí (AdSense)
          </div>
        </div>
      ) : (
        <Game />
      )}
    </div>
  )
}
