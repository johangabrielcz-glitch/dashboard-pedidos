import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { negocio_id } = req.query;

  try {
    let query = supabase.from("pedidos").select("*");

    if (negocio_id) {
      query = query.eq("negocio_id", negocio_id); // filtramos por negocio
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching pedidos:", err);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
}
