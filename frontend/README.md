# CRM-Fin · Full Stack (React + Express + MySQL)

## Estructura del proyecto

```
crm-fin/
├── backend/
│   ├── package.json
│   ├── server.js          ← API Express + MySQL2
│   └── setup.sql          ← Script CREATE TABLE + datos de prueba
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── index.css
        └── App.jsx        ← App completa (sin Supabase)
```

---

## 1. Configurar MySQL

### Opción A — MySQL Workbench
1. Abrir MySQL Workbench y conectar a `localhost:3306` con usuario `root` / contraseña `1234`
2. Abrir una nueva pestaña SQL
3. Copiar y ejecutar el contenido de `backend/setup.sql`
4. Verificar que la tabla `inversionistas` fue creada en la base `crm_fin`

### Opción B — Terminal
```bash
mysql -u root -p1234 < backend/setup.sql
```

---

## 2. Instalar dependencias del Backend

```bash
cd crm-fin/backend
npm install
```

Paquetes instalados:
- `express` — servidor HTTP
- `mysql2` — driver MySQL con soporte async/await
- `cors` — permite peticiones desde el frontend
- `nodemon` — recarga automática en desarrollo (devDependency)

---

## 3. Iniciar el Backend

```bash
# Modo producción
node server.js

# Modo desarrollo (recarga automática)
npx nodemon server.js
```

El servidor corre en: **http://localhost:3001**

Verás en consola:
```
✅ Conectado a MySQL correctamente
🚀 Backend CRM-Fin corriendo en http://localhost:3001
```

---

## 4. Instalar dependencias del Frontend

```bash
cd crm-fin/frontend
npm install
```

Paquetes instalados:
- `react` + `react-dom`
- `axios` — cliente HTTP para consumir la API
- `tailwindcss` + `autoprefixer` + `postcss`
- `@vitejs/plugin-react` + `vite`

---

## 5. Iniciar el Frontend

```bash
cd crm-fin/frontend
npm run dev
```

La app corre en: **http://localhost:5173**

---

## 6. Endpoints de la API

| Método | Ruta                        | Descripción                  |
|--------|-----------------------------|------------------------------|
| GET    | /inversionistas             | Listar todos                 |
| POST   | /inversionistas             | Crear nuevo                  |
| PUT    | /inversionistas/:id         | Actualizar por ID            |
| DELETE | /inversionistas/:id         | Eliminar por ID              |

---

## 7. Usuarios del sistema

| Usuario | Contraseña | Permisos                                      |
|---------|------------|-----------------------------------------------|
| admin   | 1234       | Ver todo, registrar, editar, eliminar         |
| pedro   | 1234       | Ver todo, registrar, editar, eliminar         |
| asesor  | 1234       | Registrar, editar (NO puede eliminar)         |
| calle   | 1234       | Solo formulario simplificado (sin dashboard)  |

---

## 8. Configuración MySQL Workbench

- **Host:** 127.0.0.1
- **Puerto:** 3306
- **Usuario:** root
- **Contraseña:** 1234
- **Base de datos:** crm_fin

---

## 9. Proxy Vite (opcional)

Si prefieres usar `/api` en el frontend en lugar de la URL completa, descomenta
el bloque `proxy` en `vite.config.js` y cambia la constante `API` en `App.jsx`:

```js
// App.jsx
const API = "/api";
```

```js
// vite.config.js
proxy: {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ""),
  },
},
```

---

## 10. Recomendaciones de seguridad para producción

1. **Variables de entorno** — mover credenciales MySQL a un archivo `.env`
   ```
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASS=1234
   DB_NAME=crm_fin
   DB_PORT=3306
   ```
   Instalar `dotenv` (`npm i dotenv`) y usar `process.env.DB_PASS`

2. **Autenticación real** — reemplazar el login local por JWT (`jsonwebtoken`)
   y guardar la sesión en `localStorage` o cookies httpOnly

3. **Validación robusta** — usar `express-validator` o `zod` en el backend

4. **Rate limiting** — instalar `express-rate-limit` para proteger la API

5. **HTTPS** — usar nginx o un proxy inverso con certificado SSL en producción

6. **CORS** — cambiar `origin: "http://localhost:5173"` al dominio real en producción

7. **Usuario MySQL de solo aplicación** — no usar `root` en producción;
   crear un usuario con permisos mínimos:
   ```sql
   CREATE USER 'crm_app'@'localhost' IDENTIFIED BY 'contraseñaSegura';
   GRANT SELECT, INSERT, UPDATE, DELETE ON crm_fin.* TO 'crm_app'@'localhost';
   FLUSH PRIVILEGES;
   ```
