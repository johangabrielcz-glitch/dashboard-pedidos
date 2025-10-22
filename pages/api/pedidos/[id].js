export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { estado } = req.body;

  if (!['pendiente', 'en_camino', 'entregado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    // Actualizar el pedido en Supabase
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ estado })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: 'Error al actualizar pedido', details: error });
    }

    // Opcional: enviar mensaje al cliente vía BuilderBot
    const pedidoActualizado = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${id}`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }).then(r => r.json());

    const pedidoObj = pedidoActualizado[0];

    // Enviar mensaje solo si el estado cambió a "en_camino" o "entregado"
    if (estado === 'en_camino' || estado === 'entregado') {
      const mensaje = estado === 'en_camino'
        ? `Hola ${pedidoObj.cliente_nombre}! Tu pedido ya va en camino. Gracias por tu compra 💛`
        : `Hola ${pedidoObj.cliente_nombre}! Tu pedido ha sido entregado. ¡Disfrútalo!`;

      await fetch(`https://builderbot.cloud/api/v1/bots/${pedidoObj.negocio_id}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BUILDERBOT_API_KEY}`
        },
        body: JSON.stringify({
          number: pedidoObj.cliente_numero,
          messages: { content: mensaje },
          checkIfExists: true
        })
      });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error actualizando pedido:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
