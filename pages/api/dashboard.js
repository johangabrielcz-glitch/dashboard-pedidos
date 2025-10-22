export default async function handler(req, res) {
  // Traemos los pedidos de Supabase
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?select=*`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const pedidos = await response.json();

  // Generamos HTML simple
  let html = `<h1>📦 Dashboard de Pedidos</h1>`;
  html += `<table border="1" cellpadding="10" style="border-collapse:collapse;">`;
  html += `<tr><th>ID</th><th>Cliente</th><th>Número</th><th>Pedido</th><th>Total</th><th>Estado</th></tr>`;
  pedidos.forEach(p => {
    html += `<tr>
      <td>${p.id}</td>
      <td>${p.cliente_nombre}</td>
      <td>${p.cliente_numero}</td>
      <td>${p.pedido}</td>
      <td>${p.total}</td>
      <td>${p.estado}</td>
    </tr>`;
  });
  html += `</table>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
