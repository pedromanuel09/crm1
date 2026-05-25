const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test conexión
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conectado a MySQL correctamente");
    conn.release();
  } catch (err) {
    console.error("❌ Error al conectar a MySQL:", err.message);
  }
})();

// GET inversionistas
app.get("/inversionistas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM inversionistas ORDER BY id DESC"
    );

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// INICIO SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en puerto ${PORT}`);
});