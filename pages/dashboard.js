import { useEffect, useState } from "react";

export default function DashboardV2() {
  const [pedidos, setPedidos] = useState([]);

  const fetchPedidos = async () => {
    try {
      const negocio_id = localStorage.getItem("negocio_id"); // negocio que inició sesión
      const res = await fetch(`/api/pedidos?negocio_id=${negocio_id}`);
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      fetchPedidos();
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  const colorEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "#FFF7AE";
      case "en_camino":
        return "#BEE3FF";
      case "entregado":
        return "#C2FFBE";
      default:
        return "white";
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "20px" }}>
        📦 Panel de Pedidos
      </h1>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div
          style={{
            flex: 1,
            background: "#fff8b0",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3>Pendientes</h3>
          <p style={{ fontSize: "24px", fontWeight: "600" }}>
            {pedidos.filter((p) => p.estado === "pendiente").length}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            background: "#b0d4ff",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3>En camino</h3>
          <p style={{ fontSize: "24px", fontWeight: "600" }}>
            {pedidos.filter((p) => p.estado === "en_camino").length}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            background: "#b0ffb0",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3>Entregados</h3>
          <p style={{ fontSize: "24px", fontWeight: "600" }}>
            {pedidos.filter((p) => p.estado === "entregado").length}
          </p>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#e9ecef", textAlign: "left" }}>
              <th style={{ padding: "12px" }}>ID</th>
              <th style={{ padding: "12px" }}>Cliente</th>
              <th style={{ padding: "12px" }}>Número</th>
              <th style={{ padding: "12px" }}>Pedido</th>
              <th style={{ padding: "12px" }}>Total</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr
                key={p.id}
                style={{ backgroundColor: colorEstado(p.estado), transition: "0.3s" }}
              >
                <td style={{ padding: "10px" }}>{p.id}</td>
                <td style={{ padding: "10px" }}>{p.cliente_nombre}</td>
                <td style={{ padding: "10px" }}>{p.cliente_numero}</td>
                <td style={{ padding: "10px" }}>{p.pedido}</td>
                <td style={{ padding: "10px" }}>{p.total}</td>
                <td style={{ padding: "10px", fontWeight: "600" }}>{p.estado}</td>
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => cambiarEstado(p.id, "en_camino")}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      marginRight: "8px",
                      cursor: "pointer",
                    }}
                  >
                    En camino
                  </button>
                  <button
                    onClick={() => cambiarEstado(p.id, "entregado")}
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                    }}
                  >
                    Entregado
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
