// pages/api/webhook/pedidos.js

export default async function handler(req, res) {
  // Solo aceptar solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Validar la clave secreta (para asegurarte que viene de BuilderBot)
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.SHARED_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const { negocio_id, cliente_nombre, cliente_numero, pedido, total } = req.body;

    if (!negocio_id || !cliente_nombre || !cliente_numero || !pedido) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Guardar el pedido en Supabase
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        negocio_id,
        cliente_nombre,
        cliente_numero,
        pedido,
        total,
        estado: 'pendiente'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: 'Error al guardar pedido', details: error });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error webhook:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
