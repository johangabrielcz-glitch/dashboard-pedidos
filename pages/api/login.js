import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  try {
    // Buscar negocio por email
    const { data: negocio, error } = await supabase
      .from("negocios")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !negocio) {
      return res.status(401).json({ error: "Negocio no encontrado" });
    }

    // Validar contraseña
    if (negocio.password !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Enviar respuesta con los datos del negocio
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
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
