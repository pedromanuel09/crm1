import { useEffect, useState } from "react";
import axios from "axios";

// ─── API Base URL ──────────────────────────────────────────────────────────────
const API = "https://crm-backend-86xw.onrender.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTodayDateString = () => {
  const local = new Date();
  const offset = local.getTimezoneOffset();
  const localDate = new Date(local.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

// Users are handled locally — no DB needed for auth
const USUARIOS_VALIDOS = [
  { user: "pedro", pass: "1234", role: "admin" },
  { user: "admin", pass: "1234", role: "admin" },
  { user: "asesor", pass: "1234", role: "asesor" },
  { user: "calle", pass: "1234", role: "calle" },
];

// Permission helpers
const puedeEliminar = (user) => ["pedro", "admin"].includes(user);
const puedeVerLista = (user) => user !== "calle";

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [menu, setMenu] = useState("Inicio");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [error, setError] = useState("");
  const [inversionistas, setInversionistas] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const montoTotal = inversionistas.reduce(
    (total, inv) => total + Number(inv.monto || 0),
    0
  );

  // ── Login ──────────────────────────────────────────────────────────────────
  const iniciarSesion = () => {
    const encontrado = USUARIOS_VALIDOS.find(
      (u) =>
        u.user.toLowerCase() === usuario.trim().toLowerCase() &&
        u.pass === password
    );
    if (encontrado) {
      setIsLoggedIn(true);
      setCurrentUser(encontrado.user);
      setError("");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  const cerrarSesion = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
    setUsuario("");
    setPassword("");
    setMenu("Inicio");
    setInversionistas([]);
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const cambiarMenu = (item) => {
    setMenu(item);
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  // ── API Calls ──────────────────────────────────────────────────────────────
  const obtenerInversionistas = async () => {
    setLoadingData(true);
    try {
      const { data } = await axios.get(`${API}/inversionistas`);
      setInversionistas(data.data || []);
    } catch (err) {
      console.error("Error al obtener inversionistas:", err.message);
      alert("No se pudo conectar al servidor. ¿Está corriendo el backend?");
    } finally {
      setLoadingData(false);
    }
  };

  const eliminarInversionista = async () => {
    try {
      await axios.delete(`${API}/inversionistas/${deleteId}`);
      setShowDelete(false);
      setDeleteId(null);
      obtenerInversionistas();
    } catch (err) {
      console.error("Error al eliminar:", err.message);
      alert(err.response?.data?.message || "Error al eliminar");
    }
  };

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && puedeVerLista(currentUser)) {
      obtenerInversionistas();
    }
  }, [isLoggedIn, currentUser]);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Login
  // ══════════════════════════════════════════════════════════════════════════
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto font-bold text-2xl">
              S
            </div>
            <h1 className="text-2xl font-bold mt-4">Sistema de Inversionistas</h1>
            <p className="text-gray-500 text-sm">Ingresa tus credenciales</p>
          </div>

          <div className="space-y-4">
            <input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && iniciarSesion()}
              className="w-full border rounded-lg p-3"
              placeholder="Usuario"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && iniciarSesion()}
              className="w-full border rounded-lg p-3"
              placeholder="Contraseña"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={iniciarSesion}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Iniciar sesión
            </button>
            <p className="text-center text-xs text-gray-400">
              Usuarios: pedro, admin, asesor, calle · Contraseña: 1234
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Perfil Calle (formulario simplificado)
  // ══════════════════════════════════════════════════════════════════════════
  if (currentUser === "calle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col">
        <header className="flex items-center justify-between px-5 py-4 bg-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="text-white font-bold text-sm tracking-wide">Perfil Calle</span>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-blue-200 hover:text-white text-xs font-medium bg-white/10 px-3 py-1.5 rounded-full transition-colors"
          >
            Cerrar sesión
          </button>
        </header>

        <div className="flex-1 flex flex-col justify-center px-5 py-6">
          <FormularioSimplificado />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Dashboard Principal (admin, pedro, asesor)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-100 flex text-gray-800 relative overflow-x-hidden">
      {/* Overlay móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-blue-950 text-white p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                S
              </div>
              <div>
                <h1 className="font-bold text-sm">Sistema de</h1>
                <p className="text-sm">Inversionistas</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-white lg:hidden text-xl focus:outline-none"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-2">
            {[
              "Inicio",
              "Agregar Inversionista",
              "Lista de Inversionistas",
              "Progreso",
              "Reportes",
              "Configuración",
            ].map((item) => (
              <button
                key={item}
                onClick={() => cambiarMenu(item)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${menu === item ? "bg-blue-600" : "hover:bg-blue-900"
                  }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={cerrarSesion}
          className="text-left text-sm hover:text-gray-300 transition-colors"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 text-2xl lg:hidden focus:outline-none"
          >
            ☰
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span>🔔</span>
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold uppercase">
              {currentUser.charAt(0)}
            </div>
            <span className="text-sm font-medium capitalize hidden sm:inline">
              {currentUser}
            </span>
          </div>
        </header>

        {/* Content */}
        <section className="p-4 md:p-8">
          {menu === "Inicio" && (
            <Inicio
              cambiarMenu={cambiarMenu}
              total={inversionistas.length}
              montoTotal={montoTotal}
              currentUser={currentUser}
              inversionistas={inversionistas}
            />
          )}

          {menu === "Agregar Inversionista" && (
            <Formulario
              obtenerInversionistas={obtenerInversionistas}
              cambiarMenu={cambiarMenu}
              currentUser={currentUser}
            />
          )}

          {menu === "Lista de Inversionistas" && (
            <Lista
              inversionistas={inversionistas}
              setShowDelete={setShowDelete}
              setDeleteId={setDeleteId}
              cambiarMenu={cambiarMenu}
              obtenerInversionistas={obtenerInversionistas}
              currentUser={currentUser}
              loading={loadingData}
            />
          )}

          {menu === "Progreso" && (
            <Progreso
              montoTotal={montoTotal}
              total={inversionistas.length}
              inversionistas={inversionistas}
            />
          )}

          {menu === "Reportes" && (
            <h2 className="text-2xl font-bold">Reportes</h2>
          )}

          {menu === "Configuración" && (
            <h2 className="text-2xl font-bold">Configuración</h2>
          )}
        </section>
      </main>

      {/* Modal Eliminar */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-3">Eliminar Inversionista</h2>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que deseas eliminar este inversionista? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setShowDelete(false); setDeleteId(null); }}
                className="px-5 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarInversionista}
                className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INICIO
// ══════════════════════════════════════════════════════════════════════════════
function Inicio({ cambiarMenu, total, montoTotal, currentUser, inversionistas }) {
  const porEstado = inversionistas.reduce((acc, inv) => {
    const e = inv.estado || "Nuevo";
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 capitalize">
        Bienvenido, {currentUser}
      </h2>
      <p className="text-gray-500 mb-8">
        Gestiona tus inversionistas y el progreso de tus operaciones.
      </p>

      {/* Quick-access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          ["👤➕", "Agregar Inversionista", "Registra un nuevo inversionista en el sistema."],
          ["👥", "Lista de Inversionistas", "Consulta, edita o elimina inversionistas registrados."],
          ["📊", "Progreso", "Visualiza el progreso y estadísticas generales."],
          ["📄", "Reportes", "Genera reportes y exporta información."],
        ].map(([icono, titulo, texto]) => (
          <div
            key={titulo}
            className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => cambiarMenu(titulo)}
          >
            <div className="text-4xl mb-4">{icono}</div>
            <h3 className="font-bold mb-3">{titulo}</h3>
            <p className="text-gray-500 text-sm mb-4">{texto}</p>
            <button className="text-blue-600 font-semibold text-sm">Ir →</button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-xl mb-6">Resumen General</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card titulo="Total inversionistas" valor={total} />
          <Card
            titulo="Monto total invertido"
            valor={`S/ ${montoTotal.toLocaleString("es-PE")}`}
          />
          <Card titulo="En Proceso" valor={porEstado["En proceso"] || 0} />
          <Card titulo="Completados" valor={porEstado["Completado"] || 0} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FORMULARIO (admin / pedro / asesor)
// ══════════════════════════════════════════════════════════════════════════════
function Formulario({ obtenerInversionistas, cambiarMenu, currentUser }) {
  const emptyForm = {
    nombres: "", apellidos: "", telefono: "", dni: "", direccion: "",
    garantia: "", aval: "", fecha: getTodayDateString(), agencia: "",
    canal: "", estado_civil: "", monto: "", estado: "Nuevo",
    registrado_por: currentUser,
  };

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok"|"error", texto }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardarInversionista = async () => {
    if (!form.nombres.trim()) {
      setMensaje({ tipo: "error", texto: "El campo Nombres es obligatorio" });
      return;
    }
    if (!form.dni.trim()) {
      setMensaje({ tipo: "error", texto: "El campo DNI es obligatorio" });
      return;
    }
    if (!form.telefono.trim()) {
      setMensaje({ tipo: "error", texto: "El campo Teléfono es obligatorio" });
      return;
    }

    setLoading(true);
    setMensaje(null);

    try {
      await axios.post(`${API}/inversionistas`, {
        ...form,
        registrado_por: currentUser,
      });

      setMensaje({ tipo: "ok", texto: "Inversionista registrado correctamente ✅" });
      setForm({ ...emptyForm, fecha: getTodayDateString() });
      obtenerInversionistas();

      setTimeout(() => {
        setMensaje(null);
        cambiarMenu("Lista de Inversionistas");
      }, 1500);
    } catch (err) {
      console.error("Error al guardar:", err);
      setMensaje({
        tipo: "error",
        texto: err.response?.data?.message || "Error al guardar el registro",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agregar Inversionista</h2>

      {mensaje && (
        <div
          className={`mb-4 px-5 py-3 rounded-lg font-semibold text-sm ${mensaje.tipo === "ok"
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-red-100 text-red-700 border border-red-300"
            }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="nombres" label="Nombres" value={form.nombres} onChange={handleChange} />
          <Input name="apellidos" label="Apellidos" value={form.apellidos} onChange={handleChange} />
          <Input name="telefono" label="Teléfono / Número" value={form.telefono} onChange={handleChange} />
          <Input name="dni" label="DNI" value={form.dni} onChange={handleChange} />

          <div className="col-span-1 md:col-span-2">
            <Input name="direccion" label="Dirección" value={form.direccion} onChange={handleChange} />
          </div>

          <Select
            name="garantia" label="Garantía" value={form.garantia} onChange={handleChange}
            options={["", "Hipotecaria", "Vehicular", "Personal", "Ninguna"]}
          />
          <Select
            name="aval" label="Aval" value={form.aval} onChange={handleChange}
            options={["", "Con Aval", "Sin Aval", "En evaluación"]}
          />

          <Input type="date" name="fecha" label="Fecha de Registro" value={form.fecha} onChange={handleChange} />
          <Input name="monto" label="Monto" value={form.monto} onChange={handleChange} />

          <Select
            name="agencia" label="Agencia" value={form.agencia} onChange={handleChange}
            options={["", "Lima", "Arequipa", "Cusco", "Huancayo"]}
          />
          <Select
            name="canal" label="Canal" value={form.canal} onChange={handleChange}
            options={["", "WhatsApp", "Facebook", "Lead", "Referido", "Cartera"]}
          />
          <Select
            name="estado_civil" label="Estado Civil" value={form.estado_civil} onChange={handleChange}
            options={["", "Soltero", "Casado", "Divorciado"]}
          />

          <div>
            <label className="font-semibold text-sm">Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full mt-2 border rounded-lg p-3"
            >
              {["Nuevo", "En proceso", "Lanzado", "Desembolsado", "Completado"].map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => cambiarMenu("Lista de Inversionistas")}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardarInversionista}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LISTA DE INVERSIONISTAS
// ══════════════════════════════════════════════════════════════════════════════
function Lista({
  inversionistas,
  setShowDelete,
  setDeleteId,
  cambiarMenu,
  obtenerInversionistas,
  currentUser,
  loading,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editMsg, setEditMsg] = useState(null);

  const filtrados = inversionistas.filter((inv) => {
    const texto = `
      ${inv.nombres || ""} ${inv.apellidos || ""} ${inv.dni || ""}
      ${inv.telefono || ""} ${inv.registrado_por || ""} ${inv.estado || ""}
    `.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const guardarEdicion = async () => {
    if (!editando.nombres?.trim()) {
      setEditMsg({ tipo: "error", texto: "El campo Nombres es obligatorio" });
      return;
    }

    setSaving(true);
    setEditMsg(null);

    // Convertir fecha a YYYY-MM-DD para MySQL
    let fechaFormateada = null;
    if (editando.fecha) {
      const f = editando.fecha.toString();
      if (f.includes("/")) {
        const [d, m, y] = f.split("/");
        fechaFormateada = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      } else {
        fechaFormateada = f.slice(0, 10);
      }
    }

    try {
      await axios.put(`${API}/inversionistas/${editando.id}`, {
        nombres: editando.nombres,
        apellidos: editando.apellidos,
        dni: editando.dni,
        telefono: editando.telefono,
        direccion: editando.direccion,
        garantia: editando.garantia,
        aval: editando.aval,
        monto: editando.monto,
        fecha: fechaFormateada,
        agencia: editando.agencia,
        canal: editando.canal,
        estado_civil: editando.estado_civil,
        estado: editando.estado,
      });

      setEditMsg({ tipo: "ok", texto: "Registro actualizado ✅" });
      obtenerInversionistas();
      setTimeout(() => setEditando(null), 1200);
    } catch (err) {
      console.error("Error al editar:", err);
      setEditMsg({
        tipo: "error",
        texto: err.response?.data?.message || "Error al actualizar el registro",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lista de Inversionistas</h2>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex gap-4 mb-6">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border rounded-lg p-3 flex-1"
            placeholder="Buscar por nombre, apellido, DNI, teléfono o registrado por..."
          />
          <button
            onClick={() => cambiarMenu("Agregar Inversionista")}
            className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700 font-semibold transition-colors whitespace-nowrap"
          >
            + Nuevo
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">⏳</div>
            <p>Cargando inversionistas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[1350px] border-collapse">
              <thead>
                <tr className="border-b text-gray-400 text-xs font-semibold uppercase">
                  <th className="py-3 pr-3">ID</th>
                  <th className="pr-3">Nombres y Apellidos</th>
                  <th className="pr-3">DNI</th>
                  <th className="pr-3">Teléfono</th>
                  <th className="pr-3">Dirección</th>
                  <th className="pr-3">Garantía</th>
                  <th className="pr-3">Aval</th>
                  <th className="pr-3">Monto</th>
                  <th className="pr-3">Fecha</th>
                  <th className="pr-3">Agencia</th>
                  <th className="pr-3">Canal</th>
                  <th className="pr-3">Estado</th>
                  <th className="pr-3">Registrado por</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium pr-3">{inv.id}</td>
                    <td className="font-semibold text-gray-900 pr-3">
                      {inv.nombres} {inv.apellidos}
                    </td>
                    <td className="pr-3">{inv.dni}</td>
                    <td className="pr-3">{inv.telefono}</td>
                    <td className="max-w-[150px] truncate pr-3">{inv.direccion || "-"}</td>
                    <td className="pr-3">{inv.garantia || "-"}</td>
                    <td className="pr-3">{inv.aval || "-"}</td>
                    <td className="font-semibold text-blue-600 pr-3">
                      S/ {Number(inv.monto || 0).toLocaleString("es-PE")}
                    </td>
                    <td className="pr-3">{inv.fecha ? inv.fecha.toString().slice(0, 10) : "-"}</td>
                    <td className="pr-3">{inv.agencia || "-"}</td>
                    <td className="pr-3">{inv.canal || "-"}</td>
                    <td className="pr-3">
                      <EstadoBadge estado={inv.estado || "Nuevo"} />
                    </td>
                    <td className="pr-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 capitalize">
                        {inv.registrado_por || "admin"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditando(inv); setEditMsg(null); }}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1.5 rounded transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        {puedeEliminar(currentUser) && (
                          <button
                            onClick={() => { setDeleteId(inv.id); setShowDelete(true); }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1.5 rounded transition-colors"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan="14" className="text-center py-8 text-gray-400">
                      {busqueda
                        ? "No hay resultados para la búsqueda."
                        : "No hay inversionistas registrados."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edición */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar inversionista</h2>

            {editMsg && (
              <div
                className={`mb-4 px-4 py-2 rounded-lg text-sm font-semibold ${editMsg.tipo === "ok"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
                  }`}
              >
                {editMsg.texto}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border p-3 rounded-lg" placeholder="Nombres"
                value={editando.nombres || ""}
                onChange={(e) => setEditando({ ...editando, nombres: e.target.value })} />
              <input className="border p-3 rounded-lg" placeholder="Apellidos"
                value={editando.apellidos || ""}
                onChange={(e) => setEditando({ ...editando, apellidos: e.target.value })} />
              <input className="border p-3 rounded-lg" placeholder="DNI"
                value={editando.dni || ""}
                onChange={(e) => setEditando({ ...editando, dni: e.target.value })} />
              <input className="border p-3 rounded-lg" placeholder="Teléfono"
                value={editando.telefono || ""}
                onChange={(e) => setEditando({ ...editando, telefono: e.target.value })} />
              <input className="border p-3 rounded-lg md:col-span-2" placeholder="Dirección"
                value={editando.direccion || ""}
                onChange={(e) => setEditando({ ...editando, direccion: e.target.value })} />

              <select className="border p-3 rounded-lg" value={editando.garantia || ""}
                onChange={(e) => setEditando({ ...editando, garantia: e.target.value })}>
                <option value="">Seleccione garantía</option>
                {["Hipotecaria", "Vehicular", "Personal", "Ninguna"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <select className="border p-3 rounded-lg" value={editando.aval || ""}
                onChange={(e) => setEditando({ ...editando, aval: e.target.value })}>
                <option value="">Seleccione aval</option>
                {["Con Aval", "Sin Aval", "En evaluación"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <input className="border p-3 rounded-lg" placeholder="Monto"
                value={editando.monto || ""}
                onChange={(e) => setEditando({ ...editando, monto: e.target.value })} />
              <input type="date" className="border p-3 rounded-lg"
                value={editando.fecha ? editando.fecha.toString().slice(0, 10) : ""}
                onChange={(e) => setEditando({ ...editando, fecha: e.target.value })} />

              <select className="border p-3 rounded-lg" value={editando.agencia || ""}
                onChange={(e) => setEditando({ ...editando, agencia: e.target.value })}>
                <option value="">Seleccione agencia</option>
                {["Lima", "Arequipa", "Cusco", "Huancayo"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <select className="border p-3 rounded-lg" value={editando.canal || ""}
                onChange={(e) => setEditando({ ...editando, canal: e.target.value })}>
                <option value="">Seleccione canal</option>
                {["WhatsApp", "Facebook", "Lead", "Referido", "Cartera"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <select className="border p-3 rounded-lg" value={editando.estado_civil || ""}
                onChange={(e) => setEditando({ ...editando, estado_civil: e.target.value })}>
                <option value="">Estado civil</option>
                {["Soltero", "Casado", "Divorciado"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <select className="border p-3 rounded-lg" value={editando.estado || "Nuevo"}
                onChange={(e) => setEditando({ ...editando, estado: e.target.value })}>
                {["Nuevo", "En proceso", "Lanzado", "Desembolsado", "Completado"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditando(null)}
                className="px-5 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={saving}
                className={`px-5 py-3 rounded-lg text-white font-semibold transition-colors ${saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROGRESO
// ══════════════════════════════════════════════════════════════════════════════
function Progreso({ montoTotal, total, inversionistas }) {
  const porEstado = inversionistas.reduce((acc, inv) => {
    const e = inv.estado || "Nuevo";
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});

  const porCanal = inversionistas.reduce((acc, inv) => {
    const c = inv.canal || "Otros";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const totalCanal = Object.values(porCanal).reduce((a, b) => a + b, 0) || 1;
  const canalEntries = Object.entries(porCanal).sort((a, b) => b[1] - a[1]);

  const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Progreso</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          titulo="Monto Total Invertido"
          valor={`S/ ${montoTotal.toLocaleString("es-PE")}`}
          sub="Total acumulado"
        />
        <MetricCard
          titulo="En Proceso"
          valor={porEstado["En proceso"] || 0}
          sub="registros activos"
        />
        <MetricCard
          titulo="Completados"
          valor={porEstado["Completado"] || 0}
          sub="finalizados"
        />
        <MetricCard
          titulo="Total Inversionistas"
          valor={total}
          sub="registrados"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado breakdown */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold mb-6">Inversionistas por Estado</h3>
          <div className="space-y-3">
            {["Nuevo", "En proceso", "Lanzado", "Desembolsado", "Completado"].map((estado, i) => {
              const qty = porEstado[estado] || 0;
              const pct = total > 0 ? Math.round((qty / total) * 100) : 0;
              return (
                <div key={estado}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{estado}</span>
                    <span className="text-gray-500">{qty} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canal breakdown */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold mb-6">Inversionistas por Canal</h3>
          {canalEntries.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {canalEntries.map(([canal, qty], i) => {
                const pct = Math.round((qty / totalCanal) * 100);
                return (
                  <div key={canal}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{canal}</span>
                      <span className="text-gray-500">{qty} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FORMULARIO SIMPLIFICADO (perfil calle)
// ══════════════════════════════════════════════════════════════════════════════
function FormularioSimplificado() {
  const emptyForm = {
    nombres: "", direccion: "", dni: "", telefono: "",
    modelo: "", fecha: getTodayDateString(),
  };

  const [form, setForm] = useState(emptyForm);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async () => {
    if (!form.nombres || !form.dni || !form.telefono) {
      setErrMsg("Por favor completa Nombre, DNI y Número.");
      return;
    }

    setErrMsg("");
    setGuardando(true);

    try {
      await axios.post(`${API}/inversionistas`, {
        nombres: form.nombres,
        apellidos: "",
        direccion: form.direccion,
        dni: form.dni,
        telefono: form.telefono,
        garantia: form.modelo === "Garantía" ? "Personal" : "",
        aval: form.modelo === "Aval" ? "Con Aval" : "",
        fecha: form.fecha,
        monto: "",
        agencia: "",
        canal: "",
        estado_civil: "",
        estado: "Nuevo",
        registrado_por: "calle",
      });

      setExito(true);
      setForm({ ...emptyForm, fecha: getTodayDateString() });
      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      console.error("Error al guardar:", err);
      setErrMsg(err.response?.data?.message || "Error al guardar. Revisa el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-white text-2xl font-bold tracking-tight">Nuevo Registro</h2>
        <p className="text-blue-300 text-sm mt-1">Perfil Calle · Registro rápido</p>
      </div>

      {exito && (
        <div className="bg-green-500 text-white text-center font-semibold py-3 rounded-2xl mb-5 text-sm shadow-lg">
          ✅ Registrado con éxito
        </div>
      )}
      {errMsg && (
        <div className="bg-red-500/80 text-white text-center font-semibold py-3 rounded-2xl mb-5 text-sm shadow-lg">
          ⚠️ {errMsg}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 space-y-4 shadow-2xl">
        {/* Nombre */}
        <div>
          <label className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1.5 block">
            Nombre Completo
          </label>
          <input
            name="nombres" value={form.nombres} onChange={handleChange}
            placeholder="Ej: Juan Pérez García"
            className="w-full bg-white/90 rounded-2xl px-4 py-3.5 text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
          />
        </div>

        {/* Dirección */}
        <div>
          <label className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1.5 block">
            Dirección
          </label>
          <input
            name="direccion" value={form.direccion} onChange={handleChange}
            placeholder="Calle, N° y Distrito"
            className="w-full bg-white/90 rounded-2xl px-4 py-3.5 text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
          />
        </div>

        {/* DNI + Teléfono */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1.5 block">DNI</label>
            <input
              name="dni" value={form.dni} onChange={handleChange}
              placeholder="12345678" inputMode="numeric" maxLength={8}
              className="w-full bg-white/90 rounded-2xl px-4 py-3.5 text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
            />
          </div>
          <div>
            <label className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1.5 block">Número</label>
            <input
              name="telefono" value={form.telefono} onChange={handleChange}
              placeholder="999 000 000" inputMode="tel"
              className="w-full bg-white/90 rounded-2xl px-4 py-3.5 text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
            />
          </div>
        </div>

        {/* Modelo */}
        <div>
          <label className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1.5 block">Modelo</label>
          <select
            name="modelo" value={form.modelo} onChange={handleChange}
            className="w-full bg-white/90 rounded-2xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium appearance-none"
          >
            <option value="">Seleccionar modelo...</option>
            <option value="Garantía">Garantía</option>
            <option value="Aval">Aval</option>
          </select>
        </div>

        <button
          onClick={guardar}
          disabled={guardando}
          className={`w-full mt-2 py-4 rounded-2xl font-bold text-base tracking-wide transition-all duration-200 shadow-lg ${guardando
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-400 active:scale-95 text-white shadow-blue-900/50"
            }`}
        >
          {guardando ? "Registrando..." : "Registrar Datos"}
        </button>
      </div>

      <p className="text-center text-blue-400/70 text-xs mt-5">
        Fecha de registro: {form.fecha}
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
function Card({ titulo, valor }) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <p className="text-gray-500 text-sm">{titulo}</p>
      <h2 className="text-2xl font-bold mt-2">{valor}</h2>
    </div>
  );
}

function MetricCard({ titulo, valor, sub }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-gray-500 text-sm mb-3">{titulo}</p>
      <h2 className="text-2xl font-bold">{valor}</h2>
      {sub && <p className="text-gray-400 text-xs mt-2">{sub}</p>}
    </div>
  );
}

function EstadoBadge({ estado }) {
  const colors = {
    "Nuevo": "bg-blue-100 text-blue-700",
    "En proceso": "bg-yellow-100 text-yellow-700",
    "Lanzado": "bg-purple-100 text-purple-700",
    "Desembolsado": "bg-orange-100 text-orange-700",
    "Completado": "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors[estado] || "bg-gray-100 text-gray-700"}`}>
      {estado}
    </span>
  );
}

function Input({ name, label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="font-semibold text-sm">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mt-2 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
        placeholder={type === "date" ? "" : `Ingrese ${label.toLowerCase()}`}
      />
    </div>
  );
}

function Select({ name, label, value, onChange, options }) {
  return (
    <div>
      <label className="font-semibold text-sm">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mt-2 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {options.map((op) => (
          <option key={op} value={op}>
            {op === "" ? `Seleccione ${label.toLowerCase()}` : op}
          </option>
        ))}
      </select>
    </div>
  );
}