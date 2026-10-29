import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getEventosRequest,
  getMisInvitacionesRequest,
  createEventoRequest,
  deleteEventoRequest,
} from "../api/eventos.js";
import WizardCrearEvento from "../components/dashboard/WizardCrearEvento.jsx";
import GestorEvento from "../components/dashboard/GestorEvento.jsx";
import CalendarioEventos from "../components/dashboard/CalendarioEventos.jsx";
import PanelAdminGlobal from "../components/dashboard/PanelAdminGlobal.jsx";
import CamaraAlbumEvento from "../components/dashboard/CamaraAlbumEvento.jsx";
import {
  GESTOR_TABS,
  normalizeGestorTab,
} from "../components/dashboard/gestorTabs.js";

const DEFAULT_INVITACION_THUMB = "/default-invitacion.svg";

const EVENT_CARD_THEMES = [
  {
    cardClass:
      "from-[#8FBDAA] via-[#86B59F] to-[#78A892] shadow-[0_14px_28px_rgba(134,181,159,0.38)]",
    badgeClass: "bg-white text-black shadow-2xs",
    titleClass: "text-black",
    metaClass: "text-black",
  },
  {
    cardClass:
      "from-[#535398] via-[#4A4A8A] to-[#3F3F7A] shadow-[0_14px_28px_rgba(74,74,138,0.38)]",
    badgeClass: "bg-white text-black shadow-2xs",
    titleClass: "text-black",
    metaClass: "text-black",
  },
  {
    cardClass:
      "from-[#FF685B] via-[#FF5B4D] to-[#F24C3E] shadow-[0_14px_28px_rgba(255,91,77,0.38)]",
    badgeClass: "bg-white text-black shadow-2xs",
    titleClass: "text-black",
    metaClass: "text-black",
  },
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

  // Estado y filtros de la sección "Mis Invitaciones"
  const [misInvitaciones, setMisInvitaciones] = useState([]);
  const [loadingMisInvitaciones, setLoadingMisInvitaciones] = useState(true);
  const [invFolderTab, setInvFolderTab] = useState("all"); // "all" | "confirmed" | "pending"
  const [invSearchKeyword, setInvSearchKeyword] = useState("");
  const [invTypeFilter, setInvTypeFilter] = useState("Todos");
  const [selectedInvitacionAlbum, setSelectedInvitacionAlbum] = useState(null);

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

  const fetchMisInvitaciones = async () => {
    try {
      setLoadingMisInvitaciones(true);
      const { data } = await getMisInvitacionesRequest();
      setMisInvitaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar mis invitaciones:", error);
    } finally {
      setLoadingMisInvitaciones(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchMisInvitaciones();
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
    const esNinguno =
      !formData.estado_evento || formData.estado_evento === "Ningúno";
    setDraftEvento({
      ...formData,
      estado_evento: esNinguno ? "Ningúno" : formData.estado_evento,
      municipio: esNinguno ? "Ningúno" : formData.municipio || "Ningúno",
      color_secundario: formData.color_secundario || "#6C7EE1",
      imagen_portada: formData.imagen_portada || "",
      texto_boton_rsvp: formData.texto_boton_rsvp || "Confirmar Asistencia",
      modalidad_invitados: formData.modalidad_invitados || "Adultos + Niños",
      mesa_regalos_habilitada: Boolean(formData.mesa_regalos_habilitada),
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

  // Tipos únicos de evento para el selector de Mis Invitaciones
  const invitacionTypes = useMemo(() => {
    const set = new Set(misInvitaciones.map((e) => e.tipo_evento).filter(Boolean));
    return ["Todos", ...Array.from(set)];
  }, [misInvitaciones]);

  // Invitaciones filtradas en la sección Mis Invitaciones
  const filteredMisInvitaciones = useMemo(() => {
    return misInvitaciones.filter((inv) => {
      const estado = inv.estado_rsvp || "Pendiente";
      if (invFolderTab === "confirmed" && estado !== "Confirmado") return false;
      if (invFolderTab === "pending" && estado !== "Pendiente") return false;

      if (invTypeFilter !== "Todos" && inv.tipo_evento !== invTypeFilter) {
        return false;
      }

      const q = invSearchKeyword.trim().toLowerCase();
      if (
        q &&
        !String(inv.nombre || "").toLowerCase().includes(q) &&
        !String(inv.lugar || "").toLowerCase().includes(q) &&
        !String(inv.anfitrion_nombre || "").toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [misInvitaciones, invFolderTab, invTypeFilter, invSearchKeyword]);

  return (
    <div className="font-wallet flex min-h-screen bg-[#F5F6F8] text-[#090C24]">
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
        className={`font-wallet fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-[#2D3047] text-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Bloque Superior Redondeado en Índigo Periwinkle (#6C7EE1) estilo "Tbk" */}
          <div className="m-4 flex items-center justify-between overflow-hidden rounded-2xl bg-[#6C7EE1] shadow-md shadow-[#1E2135]/40">
            <div className="flex items-center gap-2.5 px-4 py-3.5">
              <img
                src="/logo-recuerdalo.png?v=3"
                alt="Recuérdalo"
                className="h-10 w-10 shrink-0 rounded-xl border border-white/60 object-cover shadow-sm"
              />
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

          {/* Tarjeta con el correo del usuario y cierre de sesión debajo del logo */}
          <div className="mx-4 mb-4 rounded-2xl bg-[#23263A] p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6C7EE1] text-xs font-bold text-white shadow-xs">
                {String(user?.username || "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-bold text-white">
                    {user?.username || "Organizador"}
                  </p>
                  {user?.isAdmin && (
                    <span className="shrink-0 rounded-md bg-[#4CE0B3]/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#4CE0B3]">
                      🛡️ Admin
                    </span>
                  )}
                </div>
                <p className="truncate text-[10px] text-[#8E94B2]">
                  {user?.correoRegistro}
                </p>
              </div>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#4CE0B3]" />
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6C7EE1] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#5A6CD0]"
            >
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* Navegación Principal */}
          <nav className="mt-2 space-y-1.5 px-4">
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

            {/* 1.B Mis Invitaciones (Invitaciones recibidas/confirmadas con el correo de la cuenta) */}
            <button
              type="button"
              onClick={() => {
                setSelectedInvitacionAlbum(null);
                setActiveSection("mis-invitaciones");
                setSidebarOpen(false);
                fetchMisInvitaciones();
                navigate("/home");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-semibold transition ${
                activeSection === "mis-invitaciones"
                  ? "bg-[#23263A] font-bold text-white shadow-inner"
                  : "text-[#8E94B2] hover:bg-[#23263A]/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm">💌</span>
                <span>Mis Invitaciones</span>
              </span>
              <span className="rounded-full bg-[#4CE0B3]/25 px-2 py-0.5 text-[10px] font-bold text-[#4CE0B3]">
                {misInvitaciones.length}
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

            {/* 4. Configuración Global (Exclusivo Cuentas Administradoras) */}
            {user?.isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setActiveSection("admin");
                  setSidebarOpen(false);
                  navigate("/home");
                }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-semibold transition ${
                  activeSection === "admin"
                    ? "bg-[#23263A] font-bold text-white shadow-inner ring-1 ring-[#4CE0B3]/40"
                    : "text-[#4CE0B3] hover:bg-[#23263A]/50 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-sm">🛡️</span>
                  <span>Config. Global</span>
                </span>
                <span className="rounded-full bg-[#4CE0B3]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#4CE0B3]">
                  Admin
                </span>
              </button>
            )}
          </nav>
        </div>
      </aside>

      {/* =====================================================================
          ÁREA PRINCIPAL DERECHA (ESTILO Y PALETA "TRIPLER": #86B59F, #4A4A8A, #FF5B4D)
         ===================================================================== */}
      <div className="font-wallet flex min-w-0 flex-1 flex-col bg-[#F6F7F9] text-black">
        {/* Barra Superior Limpia (Saludo Editorial, Iconos y Avatar) */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-4 sm:gap-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-[#ECEEF2] bg-white p-2 text-black shadow-2xs lg:hidden"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold tracking-tight text-black sm:text-3xl">
                ¡Hola! {user?.username || "Organizador"}
              </h1>
              <p className="text-[11px] font-medium text-black sm:text-xs">
                Administra tus invitaciones, confirmaciones y accesos en tiempo real ✨
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => openEventManager(selectedEventoId, "settings")}
              title="Ajustes del evento"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#4A4A8A] text-xs text-black shadow-[0_6px_16px_rgba(74,74,138,0.28)] transition hover:bg-[#3F3F7A]"
            >
              ⚙️
            </button>

            <div className="flex items-center gap-2 rounded-full border border-[#ECEEF2] bg-white p-1 shadow-2xs sm:gap-2.5 sm:py-1 sm:pl-1.5 sm:pr-3.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5B4D] text-xs font-extrabold text-black shadow-2xs">
                {String(user?.username || "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
              <span className="hidden text-xs font-bold text-black sm:inline">
                {user?.username || "Organizador"}
              </span>
            </div>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-10 sm:px-6 lg:px-8">
          {/* =================================================================
              SECCIÓN 1: INICIO / MIS EVENTOS (MISMA ORGANIZACIÓN + ESTILO "TRIPLER")
             ================================================================= */}
          {activeSection === "inicio" && (
            <div className="space-y-6 text-black">
              {/* PESTAÑAS TIPO CARPETA + CONTENEDOR BLANCO DE EVENTOS */}
              <div>
                {/* Pestañas Superiores Estilo Carpeta con la Paleta Tripler (#86B59F, #4A4A8A, #FF5B4D) */}
                <div className="grid grid-cols-1 gap-1.5 sm:flex sm:flex-wrap sm:items-end sm:gap-2">
                  {[
                    {
                      id: "all",
                      label: `Mis Eventos (${eventos.length})`,
                      colorClass:
                        "bg-[#86B59F] text-black shadow-[#86B59F]/35",
                    },
                    {
                      id: "active",
                      label: "Eventos Activos/En Curso",
                      colorClass:
                        "bg-[#4A4A8A] text-black shadow-[#4A4A8A]/35",
                    },
                    {
                      id: "paused",
                      label: "Eventos Pausados",
                      colorClass:
                        "bg-[#FF5B4D] text-black shadow-[#FF5B4D]/35",
                    },
                  ].map((tab) => {
                    const isTabActive = folderTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFolderTab(tab.id)}
                        className={`cursor-pointer rounded-2xl px-4 py-2.5 text-xs font-bold tracking-tight transition sm:rounded-t-2xl sm:rounded-b-none sm:px-6 sm:py-3 ${tab.colorClass} ${
                          isTabActive
                            ? "sm:-translate-y-0.5 shadow-lg ring-2 ring-white brightness-105"
                            : "opacity-85 hover:opacity-100"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Panel Blanco Principal */}
                <div className="mt-2 rounded-3xl border border-[#ECEEF2] bg-white p-4 text-black shadow-[0_14px_38px_rgba(20,20,31,0.05)] sm:mt-0 sm:rounded-b-[30px] sm:rounded-tr-[30px] sm:rounded-tl-none sm:p-8">
                  {/* Barra de Búsqueda, Filtro y Botón "+ Crear Evento" */}
                  <div className="flex flex-col justify-between gap-4 border-b border-[#ECEEF2] pb-6 lg:flex-row lg:items-center">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
                        <label className="text-xs font-bold text-black">
                          Nombre del Evento
                        </label>
                        <input
                          type="text"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          placeholder="Buscar por nombre o lugar..."
                          className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-2 text-xs font-medium text-black placeholder:text-black/60 outline-none transition focus:border-[#4A4A8A] focus:bg-white sm:w-56"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
                        <label className="text-xs font-bold text-black">
                          Categoría
                        </label>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-2 text-xs font-semibold text-black outline-none transition focus:border-[#4A4A8A] focus:bg-white sm:w-44"
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
                        className="w-full cursor-pointer rounded-xl border border-[#4A4A8A]/30 bg-[#F4F4FA] px-5 py-2 text-xs font-bold text-black transition hover:bg-[#4A4A8A]/20 sm:w-auto"
                      >
                        Ver Todos
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection("wizard")}
                      className="w-full cursor-pointer rounded-2xl bg-[#FF5B4D] px-6 py-2.5 text-center text-xs font-bold text-black shadow-[0_10px_22px_rgba(255,91,77,0.34)] transition hover:bg-[#F24C3E] sm:w-auto sm:self-start lg:self-auto"
                    >
                      ＋ Crear Evento
                    </button>
                  </div>

                  {/* Cuadrícula de Tarjetas de Eventos (3 por fila en desktop) */}
                  {loadingEventos ? (
                    <p className="py-12 text-center text-sm font-medium text-black">
                      Cargando tus eventos...
                    </p>
                  ) : filteredEventos.length === 0 ? (
                    <div className="py-12 text-center">
                      <h3 className="text-lg font-bold text-black">
                        No se encontraron eventos en esta vista
                      </h3>
                      <p className="mt-1 text-xs font-medium text-black">
                        Crea un nuevo evento con el Wizard paso a paso o cambia
                        los filtros de búsqueda.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveSection("wizard")}
                        className="mt-5 cursor-pointer rounded-2xl bg-[#FF5B4D] px-6 py-2.5 text-xs font-bold text-black shadow-[0_10px_22px_rgba(255,91,77,0.34)] transition hover:bg-[#F24C3E]"
                      >
                        ＋ Iniciar Wizard de Creación
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredEventos.map((ev, index) => {
                        const fechaStr = String(ev.fecha_evento || "").slice(
                          0,
                          10
                        );
                        const cardTheme =
                          EVENT_CARD_THEMES[index % EVENT_CARD_THEMES.length];
                        const coverThumb =
                          String(ev.imagen_portada || "").trim() ||
                          DEFAULT_INVITACION_THUMB;

                        return (
                          <div
                            key={ev.idevento}
                            onClick={() =>
                              openEventManager(ev.idevento, "invitation")
                            }
                            className={`group relative flex h-[142px] w-full min-w-0 cursor-pointer items-center justify-between gap-3.5 overflow-hidden rounded-[22px] bg-gradient-to-br p-4 transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] sm:p-5 ${cardTheme.cardClass}`}
                          >
                            <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                              <div className="flex min-w-0 items-center justify-between">
                                <span
                                  className={`truncate rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider ${cardTheme.badgeClass}`}
                                >
                                  {ev.tipo_evento}
                                </span>
                              </div>
                              <div
                                className={`truncate text-[14.5px] font-extrabold tracking-tight ${cardTheme.titleClass}`}
                              >
                                {ev.nombre}
                              </div>
                              <div
                                className={`truncate text-[10px] font-semibold ${cardTheme.metaClass}`}
                              >
                                📅 {fechaStr} • ⏰ {ev.hora_evento} hrs
                              </div>
                            </div>

                            {/* Miniatura de la invitación virtual (o imagen genérica automática si no tiene) */}
                            <div className="relative h-[104px] w-[78px] shrink-0 overflow-hidden rounded-2xl border-2 border-white/90 bg-[#2D3047] shadow-md sm:w-[84px]">
                              <img
                                src={coverThumb}
                                alt={`Invitación de ${ev.nombre}`}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    DEFAULT_INVITACION_THUMB;
                                }}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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
          )}

          {/* =================================================================
              SECCIÓN 1.B: MIS INVITACIONES (INVITACIONES RECIBIDAS / CONFIRMADAS CON EL CORREO DEL USUARIO)
             ================================================================= */}
          {activeSection === "mis-invitaciones" && (
            <div className="space-y-6 text-black">
              {selectedInvitacionAlbum ? (
                <CamaraAlbumEvento
                  evento={selectedInvitacionAlbum}
                  modoInvitado={true}
                  onCloseModoInvitado={() => setSelectedInvitacionAlbum(null)}
                />
              ) : (
                <div>
                  {/* Pestañas Superiores Estilo Carpeta con la Paleta Tripler (#86B59F, #4A4A8A, #FF5B4D) */}
                  <div className="grid grid-cols-1 gap-1.5 sm:flex sm:flex-wrap sm:items-end sm:gap-2">
                    {[
                      {
                        id: "all",
                        label: `Mis Invitaciones (${misInvitaciones.length})`,
                        colorClass:
                          "bg-[#86B59F] text-black shadow-[#86B59F]/35",
                      },
                      {
                        id: "confirmed",
                        label: "Asistencia Confirmada",
                        colorClass:
                          "bg-[#4A4A8A] text-black shadow-[#4A4A8A]/35",
                      },
                      {
                        id: "pending",
                        label: "Pendientes / Por Confirmar",
                        colorClass:
                          "bg-[#FF5B4D] text-black shadow-[#FF5B4D]/35",
                      },
                    ].map((tab) => {
                      const isTabActive = invFolderTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setInvFolderTab(tab.id)}
                          className={`cursor-pointer rounded-2xl px-4 py-2.5 text-xs font-bold tracking-tight transition sm:rounded-t-2xl sm:rounded-b-none sm:px-6 sm:py-3 ${tab.colorClass} ${
                            isTabActive
                              ? "sm:-translate-y-0.5 shadow-lg ring-2 ring-white brightness-105"
                              : "opacity-85 hover:opacity-100"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Panel Blanco Principal */}
                  <div className="mt-2 rounded-3xl border border-[#ECEEF2] bg-white p-4 text-black shadow-[0_14px_38px_rgba(20,20,31,0.05)] sm:mt-0 sm:rounded-b-[30px] sm:rounded-tr-[30px] sm:rounded-tl-none sm:p-8">
                    {/* Barra de Búsqueda, Filtro y Botón Actualizar */}
                    <div className="flex flex-col justify-between gap-4 border-b border-[#ECEEF2] pb-6 lg:flex-row lg:items-center">
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
                          <label className="text-xs font-bold text-black">
                            Nombre del Evento
                          </label>
                          <input
                            type="text"
                            value={invSearchKeyword}
                            onChange={(e) => setInvSearchKeyword(e.target.value)}
                            placeholder="Buscar por evento o lugar..."
                            className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-2 text-xs font-medium text-black placeholder:text-black/60 outline-none transition focus:border-[#4A4A8A] focus:bg-white sm:w-56"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
                          <label className="text-xs font-bold text-black">
                            Categoría
                          </label>
                          <select
                            value={invTypeFilter}
                            onChange={(e) => setInvTypeFilter(e.target.value)}
                            className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-2 text-xs font-semibold text-black outline-none transition focus:border-[#4A4A8A] focus:bg-white sm:w-44"
                          >
                            {invitacionTypes.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setInvSearchKeyword("");
                            setInvTypeFilter("Todos");
                            setInvFolderTab("all");
                          }}
                          className="w-full cursor-pointer rounded-xl border border-[#4A4A8A]/30 bg-[#F4F4FA] px-5 py-2 text-xs font-bold text-black transition hover:bg-[#4A4A8A]/20 sm:w-auto"
                        >
                          Ver Todas
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={fetchMisInvitaciones}
                        className="w-full cursor-pointer rounded-2xl bg-[#86B59F] px-5 py-2.5 text-center text-xs font-bold text-black shadow-[0_10px_22px_rgba(134,181,159,0.34)] transition hover:bg-[#78A892] sm:w-auto sm:self-start lg:self-auto"
                      >
                        🔄 Actualizar Invitaciones
                      </button>
                    </div>

                    {/* Cuadrícula de Tarjetas de Invitaciones (3 por fila en desktop) */}
                    {loadingMisInvitaciones ? (
                      <p className="py-12 text-center text-sm font-medium text-black">
                        Cargando tus invitaciones vinculadas a{" "}
                        <strong>{user?.correoRegistro}</strong>...
                      </p>
                    ) : filteredMisInvitaciones.length === 0 ? (
                      <div className="py-12 text-center">
                        <h3 className="text-lg font-bold text-black">
                          Aún no tienes invitaciones registradas en esta vista
                        </h3>
                        <p className="mx-auto mt-1 max-w-lg text-xs font-medium text-black">
                          Cuando alguien te envíe una invitación y confirmes tu
                          asistencia usando tu correo{" "}
                          <strong>{user?.correoRegistro}</strong>, aparecerá
                          automáticamente aquí con tu pase y código QR.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredMisInvitaciones.map((inv, index) => {
                          const fechaStr = String(inv.fecha_evento || "").slice(
                            0,
                            10
                          );
                          const cardTheme =
                            EVENT_CARD_THEMES[index % EVENT_CARD_THEMES.length];
                          const coverThumb =
                            String(inv.imagen_portada || "").trim() ||
                            DEFAULT_INVITACION_THUMB;
                          const guestTokenParam =
                            inv.token_invitacion || inv.idinvitado;
                          const publicUrl = `/invitacion/e${
                            inv.idevento
                          }?guest=${encodeURIComponent(guestTokenParam)}`;
                          const puedeVerAlbum =
                            inv.estado_rsvp === "Confirmado" &&
                            Boolean(inv.compartir_album_invitados);
                          const numFotos = Number(inv.total_fotos_evento || 0);
                          const numReels = Number(inv.total_reels_evento || 0);

                          return (
                            <div
                              key={`${inv.idevento}-${inv.idinvitado}`}
                              onClick={() =>
                                window.open(
                                  publicUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                              className={`group relative flex min-h-[148px] w-full min-w-0 cursor-pointer items-center justify-between gap-3.5 overflow-hidden rounded-[22px] bg-gradient-to-br p-4 transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] sm:p-5 ${cardTheme.cardClass}`}
                            >
                              <div className="flex h-full min-w-0 flex-1 flex-col justify-between gap-1.5">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <span
                                    className={`truncate rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider ${cardTheme.badgeClass}`}
                                  >
                                    {inv.tipo_evento || "Evento"}
                                  </span>
                                  <span className="shrink-0 rounded-xl bg-white/90 px-2 py-1 text-[9px] font-extrabold text-black shadow-2xs">
                                    {inv.estado_rsvp === "Confirmado"
                                      ? `🟢 Confirmado (${inv.pases} pase${
                                          Number(inv.pases) === 1 ? "" : "s"
                                        })`
                                      : inv.estado_rsvp === "Rechazado"
                                      ? "🔴 No asistiré"
                                      : "🟡 Pendiente"}
                                  </span>
                                </div>
                                <div
                                  className={`truncate text-[14.5px] font-extrabold tracking-tight ${cardTheme.titleClass}`}
                                >
                                  {inv.nombre}
                                </div>
                                <div
                                  className={`truncate text-[10px] font-semibold ${cardTheme.metaClass}`}
                                >
                                  📅 {fechaStr} • ⏰ {inv.hora_evento} hrs • 🎟️
                                  Ver Pase ↗
                                </div>

                                {puedeVerAlbum && (
                                  <div className="pt-0.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedInvitacionAlbum(inv);
                                      }}
                                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#090C24] px-3 py-1.5 text-[10px] font-extrabold text-white shadow-md ring-1 ring-white/30 transition hover:bg-[#1C224A]"
                                      title="El anfitrión compartió las fotos y reels de este evento contigo"
                                    >
                                      <span>📸 Ver Fotos y Reels</span>
                                      {(numFotos > 0 || numReels > 0) && (
                                        <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] text-[#3CE7B6]">
                                          {numFotos}📷 · {numReels}🎬
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Miniatura de la invitación virtual (o imagen genérica automática si no tiene) */}
                              <div className="relative h-[104px] w-[78px] shrink-0 overflow-hidden rounded-2xl border-2 border-white/90 bg-[#2D3047] shadow-md sm:w-[84px]">
                                <img
                                  src={coverThumb}
                                  alt={`Invitación de ${inv.nombre}`}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      DEFAULT_INVITACION_THUMB;
                                  }}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
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

          {/* =================================================================
              SECCIÓN 5: CONFIGURACIÓN GLOBAL DE PLATAFORMA (SOLO ADMINS)
             ================================================================= */}
          {activeSection === "admin" && user?.isAdmin && <PanelAdminGlobal />}
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
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#DCE0F0] bg-white p-5 shadow-[0_24px_60px_rgba(45,48,71,0.32)] sm:p-7"
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
                y toda su lista de invitados
                <span className="hidden">, mesas y presupuesto</span>{" "}
                y registros asociados.
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
