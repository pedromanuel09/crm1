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

// GET
app.get("/inversionistas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM inversionistas ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
app.post("/inversionistas", async (req, res) => {
  try {
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

    const [result] = await pool.query(
      `INSERT INTO inversionistas
      (nombres, apellidos, telefono, dni, direccion, garantia, aval, fecha, agencia, canal, estado_civil, monto, estado, registrado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        estado || "Nuevo",
        registrado_por || "admin",
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en puerto ${PORT}`);
});