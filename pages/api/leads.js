export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Solo POST permitido' })
  }

  const { name, level, score, code } = req.body

  console.log('Nuevo jugador:', { name, level, score, code })

  // Más adelante podemos guardar esto en una base de datos real
  return res.status(200).json({ success: true })
}
