// pages/api/leads.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Solo POST permitido' })
  }

  const payload = req.body
  // payload ejemplo: { name, chapter, score, won: true/false, code }

  console.log('Lead recibido:', payload)

  // si querés guardar en Google Sheets, Airtable o enviar notificación, lo hacemos aquí
  // P.ej. reenviar a webhook (SHEET_WEBHOOK_URL) si está configurado en Vercel
  const webhook = process.env.SHEET_WEBHOOK_URL
  if (webhook && payload.won) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, ts: new Date().toISOString() })
      })
    } catch (e) {
      console.error('Error webhook:', e)
    }
  }

  // respondemos OK siempre
  return res.status(200).json({ success: true })
}
