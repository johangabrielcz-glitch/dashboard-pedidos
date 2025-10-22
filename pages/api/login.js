import { createClient } from "@supabase/supabase-js";

// Usamos Service Role Key para permisos completos
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    // Buscar negocio con email y contraseña
    const { data: negocio, error } = await supabase
      .from("negocios")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !negocio) {
      console.error("Error login:", error);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Login exitoso, devolvemos datos esenciales
    return res.status(200).json({
      message: "Login exitoso",
      negocio: {
        id: negocio.id,
        nombre: negocio.nombre,
        email: negocio.email,
      },
    });

  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: "Error al conectar con el servidor" });
  }
}
