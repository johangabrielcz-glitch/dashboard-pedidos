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
    console.log("PATCH recibido:", { id, estado });

    // 1️⃣ Actualizar estado en Supabase
    const supabaseResp = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ estado })
    });
    const supabaseResult = await supabaseResp.text();
    console.log("Respuesta de Supabase:", supabaseResult);

    // 2️⃣ Obtener datos actualizados del pedido
    const pedidoData = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${id}`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }).then(r => r.json());

    const pedidoObj = pedidoData[0];
    console.log("Pedido actualizado:", pedidoObj);

    // 3️⃣ Obtener bot_id y builderbot_api_key del negocio
    const negocioData = await fetch(`${process.env.SUPABASE_URL}/rest/v1/negocios?id=eq.${pedidoObj.negocio_id}`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }).then(r => r.json());

    if (!negocioData[0]) {
      return res.status(400).json({ error: 'Negocio no encontrado' });
    }

    const botId = negocioData[0].bot_id;
    const builderBotApiKey = negocioData[0].builderbot_api_key;

    // 4️⃣ Enviar mensaje vía BuilderBot si aplica
    if (estado === 'en_camino' || estado === 'entregado') {
      const mensaje = estado === 'en_camino'
        ? `Hola ${pedidoObj.cliente_nombre}! Tu pedido ya va en camino. Gracias por tu compra 💛`
        : `Hola ${pedidoObj.cliente_nombre}! Tu pedido ha sido entregado. ¡Disfrútalo!`;

      console.log("Preparando fetch a BuilderBot:", {
        botId,
        numero: pedidoObj.cliente_numero,
        mensaje,
        builderBotApiKeyPresent: !!builderBotApiKey
      });

      try {
        const builderResp = await fetch(`https://app.builderbot.cloud/api/v2/${botId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-builderbot': builderBotApiKey
          },
          body: JSON.stringify({
            messages: { content: mensaje },
            number: pedidoObj.cliente_numero,
            checkIfExists: true
          })
        });

        const builderResult = await builderResp.text();
        console.log("Respuesta de BuilderBot:", builderResult);

        if (!builderResp.ok) {
          console.error("Error al enviar mensaje a BuilderBot:", builderResp.status, builderResult);
        }
      } catch (err) {
        console.error("Excepción al enviar mensaje a BuilderBot:", err);
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error en PATCH /api/pedidos/[id]:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
