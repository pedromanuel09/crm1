const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ─── MySQL Pool ────────────────────────────────────────────────────────────────
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conectado a MySQL correctamente");
    conn.release();
  } catch (err) {
    console.error("❌ Error al conectar a MySQL:", err.message);
    process.exit(1);
  }
})();

// ─── Helper ────────────────────────────────────────────────────────────────────
const sendError = (res, status, message, detail = null) => {
  const body = { success: false, message };
  if (detail) body.detail = detail;
  return res.status(status).json(body);
};

// ─── GET /inversionistas ───────────────────────────────────────────────────────
app.get("/inversionistas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM inversionistas ORDER BY id DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /inversionistas:", err.message);
    sendError(res, 500, "Error al obtener inversionistas", err.message);
  }
});

// ─── POST /inversionistas ──────────────────────────────────────────────────────
app.post("/inversionistas", async (req, res) => {
  const {
    nombres,
    apellidos,
    telefono,
    dni,
    direccion,
    garantia,
    aval,
    fecha,
    agencia,
    canal,
    estado_civil,
    monto,
    estado,
    registrado_por,
  } = req.body;

  // Validaciones obligatorias
  if (!nombres || !String(nombres).trim()) {
    return sendError(res, 400, "El campo 'nombres' es obligatorio");
  }
  if (!dni || !String(dni).trim()) {
    return sendError(res, 400, "El campo 'dni' es obligatorio");
  }
  if (!telefono || !String(telefono).trim()) {
    return sendError(res, 400, "El campo 'telefono' es obligatorio");
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO inversionistas
        (nombres, apellidos, telefono, dni, direccion, garantia, aval,
         fecha, agencia, canal, estado_civil, monto, estado, registrado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombres?.trim() || "",
        apellidos?.trim() || "",
        telefono?.trim() || "",
        dni?.trim() || "",
        direccion?.trim() || "",
        garantia || "",
        aval || "",
        fecha ? fecha.toString().slice(0, 10) : new Date().toISOString().split("T")[0],
        agencia || "",
        canal || "",
        estado_civil || "",
        monto || null,
        estado || "Nuevo",
        registrado_por || "admin",
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM inversionistas WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Inversionista registrado correctamente",
      data: rows[0],
    });
  } catch (err) {
    console.error("POST /inversionistas:", err.message);
    if (err.code === "ER_DUP_ENTRY") {
      return sendError(res, 409, "Ya existe un registro con ese DNI");
    }
    sendError(res, 500, "Error al registrar inversionista", err.message);
  }
});

// ─── PUT /inversionistas/:id ───────────────────────────────────────────────────
app.put("/inversionistas/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return sendError(res, 400, "ID inválido");
  }

  const {
    nombres,
    apellidos,
    telefono,
    dni,
    direccion,
    garantia,
    aval,
    fecha,
    agencia,
    canal,
    estado_civil,
    monto,
    estado,
  } = req.body;

  if (!nombres || !String(nombres).trim()) {
    return sendError(res, 400, "El campo 'nombres' es obligatorio");
  }

  try {
    const [check] = await pool.query(
      "SELECT id FROM inversionistas WHERE id = ?",
      [id]
    );
    if (check.length === 0) {
      return sendError(res, 404, "Inversionista no encontrado");
    }

    await pool.query(
      `UPDATE inversionistas SET
        nombres = ?, apellidos = ?, telefono = ?, dni = ?,
        direccion = ?, garantia = ?, aval = ?, fecha = ?,
        agencia = ?, canal = ?, estado_civil = ?, monto = ?, estado = ?
       WHERE id = ?`,
      [
        nombres?.trim() || "",
        apellidos?.trim() || "",
        telefono?.trim() || "",
        dni?.trim() || "",
        direccion?.trim() || "",
        garantia || "",
        aval || "",
        fecha ? fecha.toString().slice(0, 10) : null,
        agencia || "",
        canal || "",
        estado_civil || "",
        monto || null,
        estado || "Nuevo",
        id,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM inversionistas WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Inversionista actualizado correctamente",
      data: rows[0],
    });
  } catch (err) {
    console.error(`PUT /inversionistas/${id}:`, err.message);
    sendError(res, 500, "Error al actualizar inversionista", err.message);
  }
});

// ─── DELETE /inversionistas/:id ────────────────────────────────────────────────
app.delete("/inversionistas/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return sendError(res, 400, "ID inválido");
  }

  try {
    const [check] = await pool.query(
      "SELECT id FROM inversionistas WHERE id = ?",
      [id]
    );
    if (check.length === 0) {
      return sendError(res, 404, "Inversionista no encontrado");
    }

    await pool.query("DELETE FROM inversionistas WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Inversionista eliminado correctamente",
      deletedId: Number(id),
    });
  } catch (err) {
    console.error(`DELETE /inversionistas/${id}:`, err.message);
    sendError(res, 500, "Error al eliminar inversionista", err.message);
  }
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend CRM-Fin corriendo en http://localhost:${PORT}`);
});