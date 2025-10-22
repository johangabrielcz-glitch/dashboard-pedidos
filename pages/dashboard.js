import { useEffect, useState } from "react";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);

  // Función para traer los pedidos del endpoint (backend serverless)
  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/pedidos"); // más adelante crearemos este endpoint
      const data = await res.json();
      setPedidos(data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    }
  };

  // useEffect para actualizar automáticamente cada 5 segundos
  useEffect(() => {
    fetchPedidos(); // carga inicial
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

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
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.cliente_nombre}</td>
              <td>{p.cliente_numero}</td>
              <td>{p.pedido}</td>
              <td>{p.total}</td>
              <td>{p.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
