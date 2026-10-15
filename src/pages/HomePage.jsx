import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const MENU_ITEMS = [
  {
    id: "inicio",
    label: "Inicio",
    icon: (
      <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    ),
  },
  {
    id: "eventos",
    label: "Mis Eventos",
    icon: (
      <path d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-15h9.75A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25A2.25 2.25 0 0 1 6.75 3Z" />
    ),
  },
  {
    id: "calendario",
    label: "Calendario",
    icon: (
      <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    ),
  },
  {
    id: "invitados",
    label: "Invitados",
    icon: (
      <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    ),
  },
];

function HomePage() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("inicio");

  return (
    <div className="flex min-h-screen bg-[#050508] text-white">
      {/* Overlay oscuro en móviles cuando el panel está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel Izquierdo (Sidebar Responsivo) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-white/10 bg-[#0b0d14] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Parte superior: Marca, Usuario y Navegación */}
        <div className="flex flex-col gap-6 p-6">
          {/* Encabezado del panel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff1e38]/15 border border-[#ff1e38]/40 text-[#ff1e38] shadow-[0_0_15px_rgba(255,30,56,0.3)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <div>
                <span className="block text-base font-bold tracking-wide text-white">
                  ProyectoEventos
                </span>
                <span className="block text-xs text-[#00f0ff]">
                  Fiestas y Eventos
                </span>
              </div>
            </div>

            {/* Botón cerrar panel en móvil */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Cerrar menú"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tarjeta del usuario en sesión */}
          <div className="rounded-xl border border-white/10 bg-[#07080d] p-3.5">
            <p className="text-xs text-gray-400">Sesión iniciada como</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-[#00f0ff] text-glow-cyan">
              {user?.correoRegistro}
            </p>
          </div>

          {/* Menú de navegación */}
          <nav className="space-y-1.5">
            {MENU_ITEMS.map((item) => {
              const active = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveItem(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "border border-[#ff1e38]/50 bg-[#ff1e38]/15 text-white shadow-[0_0_15px_rgba(255,30,56,0.2)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={`h-5 w-5 ${
                      active ? "text-[#ff1e38]" : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </svg>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Parte inferior del panel: Botón de Salir */}
        <div className="border-t border-white/10 p-6">
          <button
            type="button"
            onClick={logout}
            className="btn-glow-red flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#ff1e38] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ff334b]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Contenedor Principal Derecho */}
      <div className="flex flex-1 flex-col">
        {/* Barra superior visible solo en dispositivos móviles */}
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0b0d14] px-4 py-3.5 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-white/15 bg-[#07080d] p-2 text-gray-300 transition hover:border-[#ff1e38] hover:text-white"
            aria-label="Abrir panel de navegación"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          <span className="text-sm font-bold tracking-wide text-white">
            ProyectoEventos
          </span>

          <div className="w-10" aria-hidden="true" />
        </header>

        {/* Área de contenido principal */}
        <main className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-3xl border border-[#ff1e38]/40 bg-[#0b0d14] p-10 text-center box-glow-red">
            <h1 className="text-3xl font-bold text-white">
              ¡Hola, bienvenido!
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Sesión iniciada como
            </p>
            <p className="mt-1 font-semibold text-[#00f0ff] text-glow-cyan">
              {user?.correoRegistro}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HomePage;
