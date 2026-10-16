import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getEventosRequest,
  createEventoRequest,
} from "../api/eventos.js";
import WizardCrearEvento from "../components/dashboard/WizardCrearEvento.jsx";
import GestorEvento from "../components/dashboard/GestorEvento.jsx";
import { normalizeGestorTab } from "../components/dashboard/gestorTabs.js";

function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id: routeEventId, tab: routeTab } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(
    routeEventId ? "gestor" : "inicio"
  ); // "inicio" | "wizard" | "gestor"
  const [gestorSubTab, setGestorSubTab] = useState(
    normalizeGestorTab(routeTab)
  );

  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [selectedEventoId, setSelectedEventoId] = useState(
    routeEventId ? Number(routeEventId) : null
  );

  const fetchEventos = useCallback(async () => {
    try {
      setLoadingEventos(true);
      const { data } = await getEventosRequest();
      setEventos(data);
      setSelectedEventoId((prev) => {
        if (routeEventId && data.some((e) => e.idevento === Number(routeEventId))) {
          return Number(routeEventId);
        }
        if (prev && data.some((e) => e.idevento === prev)) return prev;
        return data[0]?.idevento || null;
      });
    } catch (error) {
      console.error("Error al obtener eventos:", error);
    } finally {
      setLoadingEventos(false);
    }
  }, [routeEventId]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  // Abrir el gestor de un evento específico en su ruta /events/[id]/[tab]
  const openEventManager = (idEvento, tab = "invitation") => {
    const cleanTab = normalizeGestorTab(tab);
    const targetId = idEvento || selectedEventoId || eventos[0]?.idevento;
    setSelectedEventoId(targetId);
    setGestorSubTab(cleanTab);
    setActiveSection("gestor");
    setSidebarOpen(false);
    if (targetId) {
      navigate(`/events/${targetId}/${cleanTab}`);
    }
  };

  // Crear evento desde el Wizard paso a paso
  const handleCreateEvento = async (payload) => {
    const { data } = await createEventoRequest(payload);
    await fetchEventos();
    openEventManager(data.idevento, "invitation");
  };

  const handleEventoDuplicated = async (newEventId) => {
    await fetchEventos();
    openEventManager(newEventId, "invitation");
  };

  const handleEventoDeleted = async () => {
    await fetchEventos();
    setActiveSection("inicio");
    navigate("/home");
  };

  // Métricas globales del Dashboard
  const totalInvitadosGlobal = eventos.reduce(
    (acc, ev) => acc + Number(ev.total_invitados || 0),
    0
  );
  const totalPasesConfirmados = eventos.reduce(
    (acc, ev) => acc + Number(ev.pases_confirmados || 0),
    0
  );
  const totalPresupuestoPagado = eventos.reduce(
    (acc, ev) => acc + Number(ev.total_pagado || 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-[#050508] text-white">
      {/* Overlay oscuro en móviles cuando el panel izquierdo está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =====================================================================
          PANEL IZQUIERDO RESPONSIVO (SIDEBAR: MI CUENTA / DASHBOARD)
         ===================================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col justify-between border-r border-white/10 bg-[#0b0d14] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Parte superior y árbol de navegación */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          {/* Cabecera del Dashboard */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff1e38]/40 bg-[#ff1e38]/15 text-[#ff1e38] shadow-[0_0_15px_rgba(255,30,56,0.3)]">
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
                <span className="block text-sm font-bold uppercase tracking-wider text-white">
                  Mi Cuenta / Dashboard
                </span>
                <span className="block text-[11px] text-[#00f0ff]">
                  ProyectoEventos
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>

          {/* Tarjeta de Perfil Activo */}
          <div className="rounded-xl border border-white/10 bg-[#07080d] p-3.5">
            <p className="text-[11px] text-gray-400">Sesión iniciada como</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-[#00f0ff] text-glow-cyan">
              {user?.correoRegistro}
            </p>
          </div>

          {/* Árbol de Navegación del Dashboard */}
          <nav className="space-y-2">
            {/* 1. 🏠 Inicio / Mis Eventos */}
            <button
              type="button"
              onClick={() => {
                setActiveSection("inicio");
                setSidebarOpen(false);
                navigate("/home");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-semibold transition ${
                activeSection === "inicio"
                  ? "border border-[#ff1e38]/50 bg-[#ff1e38]/15 text-white shadow-[0_0_15px_rgba(255,30,56,0.2)]"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>🏠 Inicio / Mis Eventos</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-300">
                {eventos.length}
              </span>
            </button>

            {/* 2. ➕ Flujo de Creación de Evento (Wizard paso a paso) */}
            <button
              type="button"
              onClick={() => {
                setActiveSection("wizard");
                setSidebarOpen(false);
                navigate("/home");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-semibold transition ${
                activeSection === "wizard"
                  ? "border border-[#ff1e38]/50 bg-[#ff1e38]/15 text-white shadow-[0_0_15px_rgba(255,30,56,0.2)]"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>➕ Flujo de Creación de Evento</span>
              <span className="text-[10px] text-[#00f0ff]">Wizard</span>
            </button>
          </nav>
        </div>

        {/* Parte inferior del panel izquierdo: Botón Salir */}
        <div className="border-t border-white/10 p-5">
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

      {/* =====================================================================
          ÁREA PRINCIPAL DERECHA
         ===================================================================== */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Barra superior móvil */}
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
            Mi Cuenta / Dashboard
          </span>

          <div className="w-10" aria-hidden="true" />
        </header>

        {/* Contenido dinámico según la sección seleccionada */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          {/* SECCIÓN 1: 🏠 INICIO / MIS EVENTOS */}
          {activeSection === "inicio" && (
            <div className="space-y-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#ff1e38]">
                    PANEL DE ORGANIZADOR
                  </span>
                  <h1 className="font-display mt-1 text-4xl font-bold uppercase tracking-wide text-white">
                    🏠 INICIO / MIS EVENTOS
                  </h1>
                  <p className="text-xs text-gray-400">
                    Haz clic en cualquier evento activo para entrar a su panel
                    especializado (/events/[id]).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection("wizard")}
                  className="btn-glow-red self-start rounded-xl bg-[#ff1e38] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#ff334b]"
                >
                  ➕ Crear Nuevo Evento
                </button>
              </div>

              {/* Resumen de métricas */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-5">
                  <p className="text-xs text-gray-400">Eventos Activos</p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {eventos.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#00f0ff]/30 bg-[#0b0d14] p-5">
                  <p className="text-xs text-[#00f0ff]">
                    Total de Invitados Registrados
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#00f0ff]">
                    {totalInvitadosGlobal}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-[#0b0d14] p-5">
                  <p className="text-xs text-emerald-400">Pases Confirmados</p>
                  <p className="mt-1 text-3xl font-bold text-emerald-400">
                    {totalPasesConfirmados}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ff1e38]/30 bg-[#0b0d14] p-5">
                  <p className="text-xs text-[#ff4d63]">Presupuesto Pagado</p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    ${totalPresupuestoPagado.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Lista de Eventos del Usuario */}
              {loadingEventos ? (
                <p className="py-12 text-center text-sm text-gray-400">
                  Cargando tus eventos...
                </p>
              ) : eventos.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 bg-[#0b0d14]/70 p-12 text-center">
                  <h2 className="text-2xl font-bold text-white">
                    ¡Comienza a planear tu primer evento!
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-gray-400">
                    Utiliza nuestro flujo de creación paso a paso (Wizard) para
                    configurar los datos del evento, diseñar tu invitación y
                    gestionar tu lista de invitados.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection("wizard")}
                    className="btn-glow-red mt-6 rounded-xl bg-[#ff1e38] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#ff334b]"
                  >
                    ➕ Iniciar Wizard de Creación
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {eventos.map((ev) => {
                    const fechaStr = String(ev.fecha_evento || "").slice(0, 10);
                    return (
                      <div
                        key={ev.idevento}
                        className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0b0d14] p-6 transition hover:border-[#ff1e38]/50"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                              style={{
                                backgroundColor: ev.color_acento || "#ff1e38",
                              }}
                            >
                              {ev.tipo_evento}
                            </span>
                            <span className="font-mono text-[10px] text-[#00f0ff]">
                              /events/{ev.idevento}
                            </span>
                          </div>

                          <h3 className="font-display mt-3 text-3xl font-bold uppercase tracking-wide text-white">
                            {ev.nombre}
                          </h3>

                          <p className="mt-1 text-xs text-gray-400">
                            📅 {fechaStr} • ⏰ {ev.hora_evento} hrs • 📍{" "}
                            {ev.lugar || "Por definir"}
                          </p>

                          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/5 bg-[#07080d] p-3 text-center text-xs">
                            <div>
                              <span className="block text-[10px] text-gray-400">
                                Invitados
                              </span>
                              <strong className="text-white">
                                {ev.total_invitados || 0}
                              </strong>
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-400">
                                Confirmados
                              </span>
                              <strong className="text-emerald-400">
                                {ev.pases_confirmados || 0} / {ev.capacidad}
                              </strong>
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-400">
                                Rechazados / Pend.
                              </span>
                              <strong className="text-amber-300">
                                🔴 {ev.rechazados || 0} • 🟡{" "}
                                {ev.pendientes || 0}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Accesos directos a las Pestañas del Evento Activo */}
                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                          <button
                            type="button"
                            onClick={() =>
                              openEventManager(ev.idevento, "invitation")
                            }
                            className="btn-glow-red flex-1 rounded-xl bg-[#ff1e38] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#ff334b]"
                          >
                            📇 Invitación
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openEventManager(ev.idevento, "guests")
                            }
                            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:text-white"
                          >
                            👥 Invitados
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openEventManager(ev.idevento, "broadcast")
                            }
                            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:text-white"
                          >
                            📤 Difusión
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openEventManager(ev.idevento, "logistics")
                            }
                            className="hidden rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:text-white"
                          >
                            📋 Logística
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openEventManager(ev.idevento, "settings")
                            }
                            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:text-white"
                          >
                            ⚙️ Ajustes
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 2: ➕ FLUJO DE CREACIÓN DE EVENTO (WIZARD PASO A PASO) */}
          {activeSection === "wizard" && (
            <WizardCrearEvento
              onCreateEvento={handleCreateEvento}
              onCancel={() => {
                setActiveSection("inicio");
                navigate("/home");
              }}
            />
          )}

          {/* SECCIÓN 3: 🛠️ GESTOR DEL EVENTO ACTIVO (/events/[id]/[tab]) */}
          {activeSection === "gestor" && (
            <GestorEvento
              eventos={eventos}
              selectedEventoId={selectedEventoId}
              onSelectEvento={(newId) => openEventManager(newId, gestorSubTab)}
              activeSubTab={gestorSubTab}
              onChangeSubTab={(newTab) =>
                openEventManager(selectedEventoId, newTab)
              }
              onEventoUpdated={fetchEventos}
              onEventoDuplicated={handleEventoDuplicated}
              onEventoDeleted={handleEventoDeleted}
              onGoToWizard={() => setActiveSection("wizard")}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;
