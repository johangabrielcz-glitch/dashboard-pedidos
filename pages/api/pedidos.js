export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?select=*`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: 'Error al obtener pedidos', details: error });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
