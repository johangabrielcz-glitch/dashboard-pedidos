import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CSVLink } from "react-csv";

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Cargar pedidos
  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase.from("pedidos").select("*");
      if (error) console.error("Error cargando pedidos:", error);
      else setPedidos(data);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    }
  };

  // Suscripción en tiempo real
  useEffect(() => {
    fetchPedidos();
    const subscription = supabase
      .from("pedidos")
      .on("*", payload => {
        fetchPedidos();
      })
      .subscribe();
    return () => supabase.removeSubscription(subscription);
  }, []);

  // Cambiar estado
  const cambiarEstado = async (id, estado) => {
    try {
      await fetch(`/api/pedidos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado })
      });
      toast.success(`Pedido ${id.slice(0, 6)} actualizado a "${estado.replace("_", " ")}"`);
    } catch (error) {
      console.error("Error actualizando estado:", error);
      toast.error("Error al actualizar el pedido");
    }
  };

  // Colores según estado
  const colorEstado = estado => {
    switch (estado) {
      case "pendiente": return "#FFF8B0";
      case "en_camino": return "#B0D4FF";
      case "entregado": return "#B0FFB0";
      default: return "white";
    }
  };

  // Filtrado y búsqueda
  const pedidosFiltrados = pedidos
    .filter(p => filtro === "todos" || p.estado === filtro)
    .filter(p => p.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()));

  // Resumen
  const resumen = {
    pendientes: pedidos.filter(p => p.estado === "pendiente").length,
    en_camino: pedidos.filter(p => p.estado === "en_camino").length,
    entregados: pedidos.filter(p => p.estado === "entregado").length
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Inter', sans-serif", backgroundColor: "#f7f8fa", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={2000} />

      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "20px" }}>📦 Dashboard de Pedidos</h1>

      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        {["pendientes", "en_camino", "entregados"].map(key => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "1.2rem", color: "#555", textTransform: "capitalize" }}>{key.replace("_", " ")}</h2>
            <p style={{ fontSize: "2.2rem", fontWeight: 700, marginTop: "12px", color: key === "pendientes" ? "#f1c40f" : key === "en_camino" ? "#3498db" : "#2ecc71" }}>
              {resumen[key]}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc" }}>
          <option value="todos">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_camino">En camino</option>
          <option value="entregado">Entregados</option>
        </select>
        <input
          type="text"
          placeholder="Buscar por cliente"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc", flex: 1 }}
        />
        <CSVLink
          data={pedidosFiltrados}
          filename={"pedidos_export.csv"}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            backgroundColor: "#e67e22",
            color: "white",
            fontWeight: 600,
            textDecoration: "none"
          }}
        >
          Exportar CSV
        </CSVLink>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#555", fontWeight: 600 }}>
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
            <AnimatePresence>
              {pedidosFiltrados.map(p => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    backgroundColor: colorEstado(p.estado),
                    borderRadius: "12px",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
                    fontWeight: 500,
                    cursor: "default"
                  }}
                >
                  <td style={{ padding: "12px" }}>{p.id.slice(0, 8)}</td>
                  <td>{p.cliente_nombre}</td>
                  <td>{p.cliente_numero}</td>
                  <td>{p.pedido}</td>
                  <td>${p.total}</td>
                  <td style={{ textTransform: "capitalize" }}>{p.estado.replace("_", " ")}</td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => cambiarEstado(p.id, "en_camino")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#3498db",
                        color: "white",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        cursor: "pointer"
                      }}
                    >
                      En camino
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => cambiarEstado(p.id, "entregado")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#2ecc71",
                        color: "white",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        cursor: "pointer"
                      }}
                    >
                      Entregado
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
