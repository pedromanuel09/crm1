-- ============================================================
-- CRM-FIN · MySQL Setup Script
-- Ejecutar en MySQL Workbench o desde terminal:
--   mysql -u root -p < setup.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS crm_fin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crm_fin;

CREATE TABLE IF NOT EXISTS inversionistas (
  id              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  nombres         VARCHAR(100)     NOT NULL,
  apellidos       VARCHAR(100)     NOT NULL DEFAULT '',
  telefono        VARCHAR(20)      NOT NULL DEFAULT '',
  dni             VARCHAR(20)      NOT NULL DEFAULT '',
  direccion       VARCHAR(255)     NOT NULL DEFAULT '',
  garantia        VARCHAR(50)      NOT NULL DEFAULT '',
  aval            VARCHAR(50)      NOT NULL DEFAULT '',
  fecha           DATE                      DEFAULT NULL,
  agencia         VARCHAR(50)      NOT NULL DEFAULT '',
  canal           VARCHAR(50)      NOT NULL DEFAULT '',
  estado_civil    VARCHAR(30)      NOT NULL DEFAULT '',
  monto           DECIMAL(15,2)             DEFAULT NULL,
  estado          VARCHAR(30)      NOT NULL DEFAULT 'Nuevo',
  registrado_por  VARCHAR(50)      NOT NULL DEFAULT 'admin',
  created_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices opcionales para mejorar búsquedas
CREATE INDEX idx_estado    ON inversionistas (estado);
CREATE INDEX idx_reg_por   ON inversionistas (registrado_por);
CREATE INDEX idx_dni       ON inversionistas (dni);
CREATE INDEX idx_fecha     ON inversionistas (fecha);

-- ============================================================
-- Datos de prueba (opcional)
-- ============================================================
INSERT INTO inversionistas
  (nombres, apellidos, telefono, dni, direccion, garantia, aval, fecha, agencia, canal, estado_civil, monto, estado, registrado_por)
VALUES
  ('Carlos', 'Mendoza', '987654321', '45678901', 'Av. Lima 123', 'Hipotecaria', 'Con Aval', '2024-01-15', 'Lima', 'Referido', 'Casado', 50000.00, 'Desembolsado', 'admin'),
  ('María', 'Torres', '912345678', '32109876', 'Jr. Arequipa 456', 'Vehicular', 'Sin Aval', '2024-02-20', 'Arequipa', 'WhatsApp', 'Soltera', 30000.00, 'En proceso', 'pedro'),
  ('Luis', 'García', '998877665', '56781234', 'Calle Cusco 789', 'Personal', 'Con Aval', '2024-03-10', 'Cusco', 'Facebook', 'Casado', 75000.00, 'Nuevo', 'asesor');
