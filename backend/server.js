const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.get("/inversionistas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM inversionistas ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/inversionistas", async (req, res) => {
  try {
    const body = req.body;

    const nombres = body.nombres || body.nombre || body.nombre_completo || body.nombreCompleto || "";
    const apellidos = body.apellidos || "";
    const telefono = body.telefono || body.numero || "";
    const dni = body.dni || "";
    const direccion = body.direccion || "";
    const garantia = body.garantia || body.modelo || "";
    const aval = body.aval || "";
    const fecha = body.fecha || new Date().toISOString().split("T")[0];
    const agencia = body.agencia || "";
    const canal = body.canal || "";
    const estado_civil = body.estado_civil || "";
    const monto = body.monto || 0;
    const estado = body.estado || "Nuevo";
    const registrado_por = body.registrado_por || "calle";

    const [result] = await pool.query(
      `INSERT INTO inversionistas
      (nombres, apellidos, telefono, dni, direccion, garantia, aval, fecha, agencia, canal, estado_civil, monto, estado, registrado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, telefono, dni, direccion, garantia, aval, fecha, agencia, canal, estado_civil, monto, estado, registrado_por]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Error POST /inversionistas:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en puerto ${PORT}`);
});