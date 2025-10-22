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
    // Actualizar pedido en Supabase
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ estado })
    });

    // Obtener datos del pedido actualizado
    const pedidoActualizado = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${id}`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }).then(r => r.json());

    const pedidoObj = pedidoActualizado[0];

    // Enviar mensaje al cliente solo si cambia a "en_camino" o "entregado"
    if (estado === 'en_camino' || estado === 'entregado') {
      const mensaje = estado === 'en_camino'
        ? `Hola ${pedidoObj.cliente_nombre}! Tu pedido ya va en camino. Gracias por tu compra 💛`
        : `Hola ${pedidoObj.cliente_nombre}! Tu pedido ha sido entregado. ¡Disfrútalo!`;

      // Usar BOT ID real de BuilderBot
      const botId = pedidoObj.bot_id; // Asegúrate de que la tabla negocios tenga esta columna

      await fetch(`https://app.builderbot.cloud/api/v2/${botId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-builderbot': process.env.BUILDERBOT_API_KEY
        },
        body: JSON.stringify({
          messages: { content: mensaje },
          number: pedidoObj.cliente_numero,
          checkIfExists: true
        })
      });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error actualizando pedido o enviando mensaje:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
