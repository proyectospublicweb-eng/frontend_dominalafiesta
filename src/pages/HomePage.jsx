import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getEventosRequest,
  createEventoRequest,
  deleteEventoRequest,
} from "../api/eventos.js";
import WizardCrearEvento from "../components/dashboard/WizardCrearEvento.jsx";
import GestorEvento from "../components/dashboard/GestorEvento.jsx";
import CalendarioEventos from "../components/dashboard/CalendarioEventos.jsx";
import {
  GESTOR_TABS,
  normalizeGestorTab,
} from "../components/dashboard/gestorTabs.js";

const THUMB_GRADIENTS = [
  "from-[#7587EB] via-[#6C7EE1] to-[#5869C9]",
  "from-[#E4F9F3] via-[#D2F4EA] to-[#E8ECFA]",
  "from-[#FA938B] via-[#F98880] to-[#EE7169]",
  "from-[#343854] via-[#2D3047] to-[#23263A]",
];

function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { eventoId: routeEventoId, tab: routeTab } = useParams();

  // Control del panel lateral en dispositivos móviles
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(true);

  // Navegación principal del Dashboard: "inicio" | "wizard" | "gestor"
  const [activeSection, setActiveSection] = useState(() =>
    routeEventoId ? "gestor" : "inicio"
  );

  // Pestaña activa dentro del Gestor del Evento Activo
  const [gestorSubTab, setGestorSubTab] = useState(() =>
    normalizeGestorTab(routeTab)
  );

  // Filtros de la vista principal
  const [folderTab, setFolderTab] = useState("all"); // "all" | "active" | "paused"
  const [searchKeyword, setSearchKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");

  // Estado de eventos del usuario
  const [eventos, setEventos] = useState([]);
  const [selectedEventoId, setSelectedEventoId] = useState(() =>
    routeEventoId ? Number(routeEventoId) : null
  );
  const [draftEvento, setDraftEvento] = useState(null);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [eventoToDelete, setEventoToDelete] = useState(null);
  const [deletingEvento, setDeletingEvento] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [wizardInitialDate, setWizardInitialDate] = useState("");

  const fetchEventos = async () => {
    try {
      const { data } = await getEventosRequest();
      setEventos(data);
      if (data.length > 0 && !selectedEventoId && !routeEventoId && !draftEvento) {
        setSelectedEventoId(data[0].idevento);
      }
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    } finally {
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar estado cuando cambia la URL (/events/:eventoId/:tab)
  useEffect(() => {
    if (routeEventoId) {
      const numericId = Number(routeEventoId);
      if (!Number.isNaN(numericId)) {
        setSelectedEventoId(numericId);
        setDraftEvento(null);
      }
      setActiveSection("gestor");
      setGestorSubTab(normalizeGestorTab(routeTab));
    }
  }, [routeEventoId, routeTab]);

  // Navegar hacia una pestaña del Gestor del Evento Activo sincronizando URL
  const openEventManager = (idEvento, subTab = "invitation") => {
    const validTab = normalizeGestorTab(subTab);
    if (draftEvento && !idEvento) {
      setGestorSubTab(validTab);
      setActiveSection("gestor");
      setSidebarOpen(false);
      return;
    }
    const targetId = idEvento || selectedEventoId || eventos[0]?.idevento;
    if (!targetId) {
      setActiveSection("wizard");
      return;
    }
    setDraftEvento(null);
    setSelectedEventoId(targetId);
    setGestorSubTab(validTab);
    setActiveSection("gestor");
    setSidebarOpen(false);
    navigate(`/events/${targetId}/${validTab}`);
  };

  // Preparar borrador de evento desde el Wizard y redirigir al Gestor para guardarlo con "Guardar Evento"
  const handleCreateEvento = async (formData) => {
    setDraftEvento({
      ...formData,
      color_secundario: formData.color_secundario || "#6C7EE1",
      imagen_portada: formData.imagen_portada || "",
      texto_boton_rsvp: formData.texto_boton_rsvp || "Confirmar Asistencia",
      modalidad_invitados: formData.modalidad_invitados || "Adultos y niños",
      rsvp_habilitado: true,
    });
    setSelectedEventoId(null);
    setGestorSubTab("invitation");
    setActiveSection("gestor");
    setSidebarOpen(false);
  };

  const handleDraftSaved = async (savedEvento) => {
    setDraftEvento(null);
    await fetchEventos();
    openEventManager(savedEvento.idevento, "invitation");
  };

  const handleEventoDuplicated = async (newEventoId) => {
    await fetchEventos();
    openEventManager(newEventoId, "invitation");
  };

  const handleEventoDeleted = async (deletedId) => {
    const remaining = eventos.filter((e) => e.idevento !== deletedId);
    setEventos(remaining);
    if (activeSection === "gestor") {
      if (remaining.length > 0) {
        openEventManager(remaining[0].idevento, "invitation");
      } else {
        setSelectedEventoId(null);
        setActiveSection("inicio");
        navigate("/home");
      }
    } else if (selectedEventoId === deletedId) {
      setSelectedEventoId(remaining[0]?.idevento || null);
    }
  };

  const handleConfirmDeleteFromModal = async (e) => {
    e.preventDefault();
    if (!eventoToDelete) return;
    setDeletingEvento(true);
    setDeleteError("");
    try {
      await deleteEventoRequest(eventoToDelete.idevento);
      await handleEventoDeleted(eventoToDelete.idevento);
      setEventoToDelete(null);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "No se pudo eliminar el evento."
      );
    } finally {
      setDeletingEvento(false);
    }
  };

  // Métricas globales para las 3 tarjetas superiores
  const totalInvitadosGlobal = eventos.reduce(
    (acc, ev) => acc + Number(ev.total_invitados || 0),
    0
  );
  const totalPasesConfirmados = eventos.reduce(
    (acc, ev) => acc + Number(ev.pases_confirmados || 0),
    0
  );

  // Tipos únicos de evento para el selector
  const eventTypes = useMemo(() => {
    const set = new Set(eventos.map((e) => e.tipo_evento).filter(Boolean));
    return ["Todos", ...Array.from(set)];
  }, [eventos]);

  // Eventos filtrados en la tabla/lista blanca
  const filteredEventos = useMemo(() => {
    return eventos.filter((ev) => {
      const rsvpActive = ev.rsvp_habilitado !== false;
      if (folderTab === "active" && !rsvpActive) return false;
      if (folderTab === "paused" && rsvpActive) return false;

      if (typeFilter !== "Todos" && ev.tipo_evento !== typeFilter) {
        return false;
      }

      const q = searchKeyword.trim().toLowerCase();
      if (
        q &&
        !String(ev.nombre || "").toLowerCase().includes(q) &&
        !String(ev.lugar || "").toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [eventos, folderTab, typeFilter, searchKeyword]);

  return (
    <div className="flex min-h-screen bg-[#F0F2F8] text-[#2D3047]">
      {/* Overlay oscuro en móviles cuando el panel izquierdo está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =====================================================================
          SIDEBAR IZQUIERDO ESTILO "Tbk" (#2D3047 + BLOQUE SUPERIOR #6C7EE1)
         ===================================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-[#2D3047] text-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Bloque Superior Redondeado en Índigo Periwinkle (#6C7EE1) estilo "Tbk" */}
          <div className="m-4 flex items-center justify-between overflow-hidden rounded-2xl bg-[#6C7EE1] shadow-md shadow-[#1E2135]/40">
            <div className="flex items-center gap-2.5 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/80 bg-white/15 text-xs font-black tracking-tight text-white">
                ✦
              </div>
              <span className="text-base font-extrabold tracking-tight text-white">
                Recuerdalo
              </span>
            </div>

            <div className="flex h-full items-center bg-[#5A6CD0] px-3.5 py-5 text-white/90">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="text-sm font-bold lg:hidden"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
              <span className="hidden text-sm font-bold lg:inline">⋮</span>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="mt-4 space-y-1.5 px-4">
            {/* 1. Resumen / Mis Eventos */}
            <button
              type="button"
              onClick={() => {
                setActiveSection("inicio");
                setSidebarOpen(false);
                navigate("/home");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-semibold transition ${
                activeSection === "inicio"
                  ? "bg-[#23263A] font-bold text-white shadow-inner"
                  : "text-[#8E94B2] hover:bg-[#23263A]/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm">🏠</span>
                <span>Mis Eventos</span>
              </span>
              <span className="rounded-full bg-[#6C7EE1]/25 px-2 py-0.5 text-[10px] font-bold text-[#9BA9FF]">
                {eventos.length}
              </span>
            </button>

            {/* 2. Crear Evento (Wizard) */}
            <button
              type="button"
              onClick={() => {
                setWizardInitialDate("");
                setActiveSection("wizard");
                setSidebarOpen(false);
                navigate("/home");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-semibold transition ${
                activeSection === "wizard"
                  ? "bg-[#23263A] font-bold text-white shadow-inner"
                  : "text-[#8E94B2] hover:bg-[#23263A]/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm">✨</span>
                <span>Crear Evento</span>
              </span>
              <span className="text-[10px] text-[#4CE0B3]">＋</span>
            </button>

            {/* 3. Calendario de Eventos */}
            <button
              type="button"
              onClick={() => {
                setActiveSection("calendario");
                setSidebarOpen(false);
                navigate("/home");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-semibold transition ${
                activeSection === "calendario"
                  ? "bg-[#23263A] font-bold text-white shadow-inner"
                  : "text-[#8E94B2] hover:bg-[#23263A]/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm">📅</span>
                <span>Calendario</span>
              </span>
              <span className="rounded-full bg-[#FF8086]/25 px-2 py-0.5 text-[10px] font-bold text-[#FF8086]">
                Mes
              </span>
            </button>
          </nav>
        </div>

        {/* Parte inferior del Sidebar: Ilustración decorativa + Cuenta y Cerrar Sesión */}
        <div className="p-4">
          <div className="mb-3 rounded-2xl bg-[#23263A] p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6C7EE1] text-xs font-bold text-white shadow-xs">
                {String(user?.username || "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">
                  {user?.username || "Organizador"}
                </p>
                <p className="truncate text-[10px] text-[#8E94B2]">
                  {user?.correoRegistro}
                </p>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-[#4CE0B3]" />
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C7EE1] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#5A6CD0]"
            >
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          ÁREA PRINCIPAL DERECHA
         ===================================================================== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra Superior Limpia (Saludo Editorial, Buscador Píldora, Iconos y Avatar) */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-4 sm:gap-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl bg-white p-2 text-[#2D3047] shadow-xs lg:hidden"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#2D3047] sm:text-3xl">
                ¡Hola! {user?.username || "Organizador"}
              </h1>
              <p className="text-xs text-[#8E94A9]">
                Administra tus invitaciones, confirmaciones y accesos en tiempo real ✨
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openEventManager(selectedEventoId, "settings")}
              title="Ajustes del evento"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs text-[#6E7491] shadow-xs transition hover:text-[#6C7EE1]"
            >
              ⚙️
            </button>

            <div className="flex items-center gap-2.5 rounded-full bg-white py-1 pl-1.5 pr-3.5 shadow-xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2D3047] text-xs font-bold text-[#4CE0B3]">
                {String(user?.username || "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
              <span className="text-xs font-bold text-[#2D3047]">
                {user?.username || "Organizador"}
              </span>
            </div>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <main className="flex-1 overflow-y-auto px-3.5 pb-10 sm:px-6 lg:px-8">
          {/* =================================================================
              SECCIÓN 1: INICIO / MIS EVENTOS (MISMA ORGANIZACIÓN + ESTILO "Tbk")
             ================================================================= */}
          {activeSection === "inicio" && (
            <div className="space-y-6">
              {/* PESTAÑAS TIPO CARPETA + CONTENEDOR BLANCO DE EVENTOS */}
              <div>
                {/* Pestañas Superiores Estilo Carpeta con la Paleta (#6C7EE1, #F98880, #2D3047) */}
                <div className="flex flex-wrap items-end gap-2">
                  {[
                    {
                      id: "all",
                      label: `Mis Eventos (${eventos.length})`,
                      colorClass: "bg-[#6C7EE1] text-white shadow-[#6C7EE1]/30",
                    },
                    {
                      id: "active",
                      label: "Eventos Activos/En Curso",
                      colorClass: "bg-[#F98880] text-white shadow-[#F98880]/30",
                    },
                    {
                      id: "paused",
                      label: "Eventos Pausados",
                      colorClass: "bg-[#2D3047] text-white shadow-[#2D3047]/30",
                    },
                  ].map((tab) => {
                    const isTabActive = folderTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFolderTab(tab.id)}
                        className={`rounded-t-2xl px-6 py-3 text-xs font-extrabold transition ${tab.colorClass} ${
                          isTabActive
                            ? "-translate-y-0.5 shadow-lg ring-2 ring-white brightness-105"
                            : "opacity-85 hover:opacity-100"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Panel Blanco Principal */}
                <div className="rounded-b-3xl rounded-tr-3xl bg-white p-6 shadow-[0_10px_30px_rgba(108,126,225,0.06)] sm:p-8">
                  {/* Barra de Búsqueda, Filtro y Botón "+ Crear Evento" */}
                  <div className="flex flex-col justify-between gap-4 border-b border-[#ECEFFA] pb-6 lg:flex-row lg:items-center">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2.5">
                        <label className="text-xs font-bold text-[#2D3047]">
                          Nombre del Evento
                        </label>
                        <input
                          type="text"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          placeholder="Buscar por nombre o lugar..."
                          className="w-52 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2 text-xs text-[#2D3047] outline-none transition focus:border-[#6C7EE1]"
                        />
                      </div>

                      <div className="flex items-center gap-2.5">
                        <label className="text-xs font-bold text-[#2D3047]">
                          Categoría
                        </label>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="w-44 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs text-[#2D3047] outline-none transition focus:border-[#6C7EE1]"
                        >
                          {eventTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSearchKeyword("");
                          setTypeFilter("Todos");
                          setFolderTab("all");
                        }}
                        className="rounded-full border border-[#6C7EE1] px-5 py-2 text-xs font-bold text-[#6C7EE1] transition hover:bg-[#ECEFFA]"
                      >
                        Ver Todos
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection("wizard")}
                      className="self-start rounded-full bg-[#6C7EE1] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#6C7EE1]/30 transition hover:bg-[#5A6CD0] lg:self-auto"
                    >
                      ＋ Crear Evento
                    </button>
                  </div>

                  {/* Lista Horizontal de Eventos (Conservando el tamaño grande +50% +30%) */}
                  {loadingEventos ? (
                    <p className="py-12 text-center text-sm text-[#8E94A9]">
                      Cargando tus eventos...
                    </p>
                  ) : filteredEventos.length === 0 ? (
                    <div className="py-12 text-center">
                      <h3 className="text-lg font-bold text-[#2D3047]">
                        No se encontraron eventos en esta vista
                      </h3>
                      <p className="mt-1 text-xs text-[#8E94A9]">
                        Crea un nuevo evento con el Wizard paso a paso o cambia
                        los filtros de búsqueda.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveSection("wizard")}
                        className="mt-5 rounded-full bg-[#6C7EE1] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#6C7EE1]/30 transition hover:bg-[#5A6CD0]"
                      >
                        ＋ Iniciar Wizard de Creación
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#ECEFFA]">
                      {filteredEventos.map((ev, index) => {
                        const fechaStr = String(ev.fecha_evento || "").slice(
                          0,
                          10
                        );
                        const thumbGrad =
                          THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];
                        const isLightThumb = index % THUMB_GRADIENTS.length === 1;

                        return (
                          <div
                            key={ev.idevento}
                            className="flex flex-col justify-between gap-8 py-11 transition hover:bg-[#FAFBFD] 2xl:flex-row 2xl:items-center"
                          >
                            {/* Izquierda: Miniatura gráfica + Título y Detalles */}
                            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                              {/* Miniatura estilo banner (h-48 sm:w-96) */}
                              <div
                                onClick={() =>
                                  openEventManager(ev.idevento, "invitation")
                                }
                                className={`relative flex h-48 w-full shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-7 shadow-md transition hover:scale-[1.01] sm:w-96 ${thumbGrad} ${
                                  isLightThumb
                                    ? "border border-[#C9EFE3] text-[#2D3047]"
                                    : "text-white"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`rounded-xl px-4 py-1.5 text-sm font-extrabold uppercase ${
                                      isLightThumb
                                        ? "bg-[#6C7EE1] text-white"
                                        : "bg-white/20 text-white"
                                    }`}
                                  >
                                    {ev.tipo_evento}
                                  </span>
                                  <span className="font-mono text-sm font-bold opacity-85">
                                    #{ev.idevento}
                                  </span>
                                </div>
                                <div className="truncate text-2xl font-black tracking-tight">
                                  {ev.nombre}
                                </div>
                                <div className="text-sm font-semibold opacity-95">
                                  📅 {fechaStr} • ⏰ {ev.hora_evento} hrs
                                </div>
                              </div>

                              {/* Información Central Ampliada */}
                              <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-4">
                                  <h3
                                    onClick={() =>
                                      openEventManager(
                                        ev.idevento,
                                        "invitation"
                                      )
                                    }
                                    className="cursor-pointer text-2xl font-extrabold text-[#2D3047] hover:text-[#6C7EE1] sm:text-3xl"
                                  >
                                    {ev.nombre}
                                  </h3>
                                  <span
                                    className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                                      ev.rsvp_habilitado !== false
                                        ? "bg-[#E4F9F3] text-[#18A97E]"
                                        : "bg-[#FFF0EF] text-[#F26B61]"
                                    }`}
                                  >
                                    {ev.rsvp_habilitado !== false
                                      ? "Evento Activo"
                                      : "Evento Pausado"}
                                  </span>
                                </div>

                                <p className="text-base text-[#8E94A9] sm:text-lg">
                                  📍 {ev.lugar || "Salón por definir"} &nbsp;•&nbsp; 📅{" "}
                                  {fechaStr} a las {ev.hora_evento} hrs
                                </p>

                                <div className="flex flex-wrap items-center gap-4 pt-1 text-sm sm:text-base">
                                  <span className="rounded-xl bg-[#F0F2F8] px-4 py-2.5 text-[#6E7491]">
                                    👥 Invitados:{" "}
                                    <strong className="text-[#2D3047]">
                                      {ev.total_invitados || 0}
                                    </strong>
                                  </span>
                                  <span className="rounded-xl bg-[#ECEFFA] px-4 py-2.5 text-[#6C7EE1]">
                                    ✅ Confirmados:{" "}
                                    <strong>
                                      {ev.pases_confirmados || 0}/{ev.capacidad}
                                    </strong>
                                  </span>
                                  <span className="rounded-xl bg-[#FFF0EF] px-4 py-2.5 text-[#F26B61]">
                                    ⏳ Pendientes:{" "}
                                    <strong className="text-[#2D3047]">
                                      {ev.pendientes || 0}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Derecha: Botones de Acción Estilo Tarjeta con Insignia Izquierda y Flecha (Reducidos un 30%) */}
                            <div className="flex flex-wrap items-center gap-2.5">
                              {/* 1. Editar / Invitación - Deep Royal Indigo (#4E54A3) */}
                              <button
                                type="button"
                                onClick={() =>
                                  openEventManager(ev.idevento, "invitation")
                                }
                                className="group flex items-center gap-2.5 rounded-xl bg-[#4E54A3] px-3 py-2 text-left text-white shadow-[0_6px_15px_rgba(78,84,163,0.25)] transition hover:-translate-y-0.5 hover:bg-[#434994]"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3.5 w-3.5 text-white"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </span>
                                <div className="pr-1">
                                  <span className="block text-[9px] font-medium leading-tight text-white/75">
                                    Diseño Digital
                                  </span>
                                  <span className="block text-xs font-extrabold leading-tight tracking-tight text-white">
                                    Editar / Invitación
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-white/90 transition-transform group-hover:translate-x-1">
                                  →
                                </span>
                              </button>

                              {/* 2. Invitados - Soft Lavender Periwinkle (#9599D6) */}
                              <button
                                type="button"
                                onClick={() =>
                                  openEventManager(ev.idevento, "guests")
                                }
                                className="group flex items-center gap-2.5 rounded-xl bg-[#9599D6] px-3 py-2 text-left text-white shadow-[0_6px_15px_rgba(149,153,214,0.25)] transition hover:-translate-y-0.5 hover:bg-[#8489CA]"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3.5 w-3.5 text-white"
                                  >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                  </svg>
                                </span>
                                <div className="pr-1">
                                  <span className="block text-[9px] font-medium leading-tight text-white/80">
                                    Control RSVP
                                  </span>
                                  <span className="block text-xs font-extrabold leading-tight tracking-tight text-white">
                                    Invitados ({ev.total_invitados || 0})
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-white/90 transition-transform group-hover:translate-x-1">
                                  →
                                </span>
                              </button>

                              {/* 3. Difusión - Periwinkle Indigo (#6C7EE1) */}
                              <button
                                type="button"
                                onClick={() =>
                                  openEventManager(ev.idevento, "broadcast")
                                }
                                className="group flex items-center gap-2.5 rounded-xl bg-[#6C7EE1] px-3 py-2 text-left text-white shadow-[0_6px_15px_rgba(108,126,225,0.25)] transition hover:-translate-y-0.5 hover:bg-[#5B6DD0]"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3.5 w-3.5 text-white"
                                  >
                                    <path d="m3 11 18-5v12L3 13v-2Z" />
                                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                                  </svg>
                                </span>
                                <div className="pr-1">
                                  <span className="block text-[9px] font-medium leading-tight text-white/75">
                                    WhatsApp y Email
                                  </span>
                                  <span className="block text-xs font-extrabold leading-tight tracking-tight text-white">
                                    Difusión
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-white/90 transition-transform group-hover:translate-x-1">
                                  →
                                </span>
                              </button>

                              {/* 4. Ajustes y QR - Deep Twilight (#2D3047) */}
                              <button
                                type="button"
                                onClick={() =>
                                  openEventManager(ev.idevento, "settings")
                                }
                                className="group flex items-center gap-2.5 rounded-xl bg-[#2D3047] px-3 py-2 text-left text-white shadow-[0_6px_15px_rgba(45,48,71,0.22)] transition hover:-translate-y-0.5 hover:bg-[#23263A]"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3.5 w-3.5 text-white"
                                  >
                                    <rect width="5" height="5" x="3" y="3" rx="1" />
                                    <rect width="5" height="5" x="16" y="3" rx="1" />
                                    <rect width="5" height="5" x="3" y="16" rx="1" />
                                    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                                    <path d="M21 21v.01" />
                                    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                                    <path d="M3 12h.01" />
                                    <path d="M12 3h.01" />
                                    <path d="M12 16v.01" />
                                    <path d="M16 12h1" />
                                    <path d="M21 12v.01" />
                                    <path d="M12 21v-1" />
                                  </svg>
                                </span>
                                <div className="pr-1">
                                  <span className="block text-[9px] font-medium leading-tight text-white/70">
                                    Acceso y Control
                                  </span>
                                  <span className="block text-xs font-extrabold leading-tight tracking-tight text-white">
                                    Ajustes y QR
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-white/90 transition-transform group-hover:translate-x-1">
                                  →
                                </span>
                              </button>

                              {/* 5. Eliminar - Coral-Pink (#FF8086) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError("");
                                  setEventoToDelete(ev);
                                }}
                                className="group flex items-center gap-2.5 rounded-xl bg-[#FF8086] px-3 py-2 text-left text-white shadow-[0_6px_15px_rgba(255,128,134,0.28)] transition hover:-translate-y-0.5 hover:bg-[#F56E74]"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3.5 w-3.5 text-white"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    <line x1="10" x2="10" y1="11" y2="17" />
                                    <line x1="14" x2="14" y1="11" y2="17" />
                                  </svg>
                                </span>
                                <div className="pr-1">
                                  <span className="block text-[9px] font-medium leading-tight text-white/80">
                                    Acción del Evento
                                  </span>
                                  <span className="block text-xs font-extrabold leading-tight tracking-tight text-white">
                                    Eliminar
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-white/90 transition-transform group-hover:translate-x-1">
                                  →
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECCIÓN 2: FLUJO DE CREACIÓN DE EVENTO (WIZARD PASO A PASO)
             ================================================================= */}
          {activeSection === "wizard" && (
            <WizardCrearEvento
              initialDate={wizardInitialDate}
              onCreateEvento={handleCreateEvento}
              onCancel={() => {
                setWizardInitialDate("");
                setActiveSection("inicio");
                navigate("/home");
              }}
            />
          )}

          {/* =================================================================
              SECCIÓN 3: CALENDARIO COMPLETO DE EVENTOS
             ================================================================= */}
          {activeSection === "calendario" && (
            <CalendarioEventos
              eventos={eventos}
              onOpenEvento={(id) => openEventManager(id, "invitation")}
              onCreateNew={(dateStr) => {
                setWizardInitialDate(
                  typeof dateStr === "string" ? dateStr : ""
                );
                setActiveSection("wizard");
              }}
            />
          )}

          {/* =================================================================
              SECCIÓN 4: GESTOR DEL EVENTO ACTIVO (/events/[id]/[tab])
             ================================================================= */}
          {activeSection === "gestor" && (
            <GestorEvento
              eventos={eventos}
              selectedEventoId={selectedEventoId}
              draftEvento={draftEvento}
              onDraftSaved={handleDraftSaved}
              onSelectEvento={(newId) => openEventManager(newId, gestorSubTab)}
              activeSubTab={gestorSubTab}
              onChangeSubTab={(newTab) =>
                openEventManager(selectedEventoId, newTab)
              }
              onEventoUpdated={fetchEventos}
              onEventoDuplicated={handleEventoDuplicated}
              onEventoDeleted={handleEventoDeleted}
              onRequestDeleteEvento={(ev) => {
                setDeleteError("");
                setEventoToDelete(ev);
              }}
              onGoToWizard={() => setActiveSection("wizard")}
            />
          )}
        </main>
      </div>

      {/* Formulario Flotante de Confirmación para Eliminar Evento */}
      {eventoToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3047]/70 p-4 backdrop-blur-sm"
          onClick={() => !deletingEvento && setEventoToDelete(null)}
        >
          <form
            onSubmit={handleConfirmDeleteFromModal}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#DCE0F0] bg-white p-7 shadow-[0_24px_60px_rgba(45,48,71,0.32)]"
          >
            {/* Franja superior Coral-Salmón */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#FA938B] to-[#F77D75]" />

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF2F1] text-2xl text-[#E05349] shadow-xs">
                🗑️
              </div>
              <h3 className="mt-4 text-2xl font-extrabold text-[#2D3047]">
                ¿Eliminar este evento?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6E748A] sm:text-sm">
                Estás a punto de eliminar permanentemente el evento{" "}
                <strong className="text-[#2D3047]">
                  &ldquo;{eventoToDelete.nombre}&rdquo;
                </strong>{" "}
                y toda su lista de invitados, mesas y presupuesto asociados.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-[#ECEFFA] bg-[#F7F8FC] p-4 text-xs text-[#6E748A]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D3047]">Evento:</span>
                <span>{eventoToDelete.nombre}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="font-bold text-[#2D3047]">Fecha:</span>
                <span>
                  {String(eventoToDelete.fecha_evento || "").slice(0, 10)} •{" "}
                  {eventoToDelete.hora_evento} hrs
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="font-bold text-[#2D3047]">Lugar:</span>
                <span>{eventoToDelete.lugar || "Por definir"}</span>
              </div>
            </div>

            {deleteError && (
              <p className="mt-4 rounded-xl border border-[#F98880]/40 bg-[#FFF2F1] px-3.5 py-2.5 text-xs font-semibold text-[#E05349]">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deletingEvento}
                onClick={() => setEventoToDelete(null)}
                className="flex-1 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-4 py-3 text-xs font-extrabold text-[#2D3047] transition hover:bg-[#ECEFFA] disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={deletingEvento}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#FA938B] to-[#E05349] px-4 py-3 text-xs font-extrabold text-white shadow-[0_10px_24px_rgba(249,136,128,0.35)] transition hover:opacity-95 disabled:opacity-60"
              >
                {deletingEvento ? "Eliminando..." : "Sí, Eliminar Evento"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default HomePage;
