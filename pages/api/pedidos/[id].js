export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { estado } = req.body;
  console.log("PATCH recibido:", { id, estado });

  try {
    // Actualizar el estado en Supabase
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ estado })
    });

    const result = await response.text();
    console.log("Respuesta de Supabase:", result);

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error actualizando pedido:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
