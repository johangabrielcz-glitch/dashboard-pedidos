import { useEffect, useState } from "react";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/pedidos");
      const data = await res.json();
      setPedidos(data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const cambiarEstado = async (id, estado) => {
    try {
      await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      });
      fetchPedidos(); // actualizar tabla
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  const colorEstado = estado => {
    switch(estado) {
      case 'pendiente': return '#FFF8B0'; // amarillo claro
      case 'en_camino': return '#B0D4FF'; // azul claro
      case 'entregado': return '#B0FFB0'; // verde claro
      default: return 'white';
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>📦 Dashboard de Pedidos</h1>
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Número</th>
            <th>Pedido</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id} style={{ backgroundColor: colorEstado(p.estado) }}>
              <td>{p.id}</td>
              <td>{p.cliente_nombre}</td>
              <td>{p.cliente_numero}</td>
              <td>{p.pedido}</td>
              <td>{p.total}</td>
              <td>{p.estado}</td>
              <td>
                <button onClick={() => cambiarEstado(p.id, 'en_camino')}>En camino</button>
                <button onClick={() => cambiarEstado(p.id, 'entregado')}>Entregado</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
