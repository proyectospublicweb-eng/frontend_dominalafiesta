import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getEventosRequest,
  getMisInvitacionesRequest,
  createEventoRequest,
  updateEventoRequest,
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
  const {
    id: routeIdParam,
    eventoId: routeEventoIdParam,
    tab: routeTab,
  } = useParams();
  const routeEventoId = routeIdParam || routeEventoIdParam;

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
  const [memoriesShortcutAction, setMemoriesShortcutAction] = useState(null);

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

  // Acceso directo desde los iconos de cabecera y flotantes laterales hacia Cámara en Vivo o Creación de Reel
  const handleTriggerMemoriesShortcut = (actionType) => {
    setSelectedInvitacionAlbum(null);
    setMemoriesShortcutAction({ type: actionType, ts: Date.now() });
    openEventManager(selectedEventoId, "memories");
  };

  // Crear o actualizar el evento inmediatamente en la base de datos desde el Wizard y redirigir al Gestor con su ID real
  const handleCreateEvento = async (formData) => {
    const esNinguno =
      !formData.estado_evento || formData.estado_evento === "Ningúno";
    const payload = {
      ...formData,
      estado_evento: esNinguno ? "Ningúno" : formData.estado_evento,
      municipio: esNinguno ? "Ningúno" : formData.municipio || "Ningúno",
      color_secundario: formData.color_secundario || "#6C7EE1",
      imagen_portada: formData.imagen_portada || "",
      texto_boton_rsvp: formData.texto_boton_rsvp || "Confirmar Asistencia",
      modalidad_invitados: formData.modalidad_invitados || "Adultos + Niños",
      mesa_regalos_habilitada: Boolean(formData.mesa_regalos_habilitada),
      rsvp_habilitado: true,
    };
    const { data: savedEvento } = formData.idevento
      ? await updateEventoRequest(formData.idevento, payload)
      : await createEventoRequest(payload);
    setDraftEvento(null);
    await fetchEventos();
    openEventManager(savedEvento.idevento, "invitation");
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
            {/* 1. Crear Evento (Wizard) */}
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

            {/* 2. Resumen / Mis Eventos */}
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

            {/* 3. Mis Invitaciones (Invitaciones recibidas/confirmadas con el correo de la cuenta) */}
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
          ÁREA PRINCIPAL DERECHA (ESTILO Y PALETA DE REFERENCIA: #EBF0F7, #FFFFFF, #DCE5F2, #2B7FFF)
         ===================================================================== */}
      <div className="font-wallet flex min-w-0 flex-1 flex-col bg-[#EBF0F7] text-[#1E2235]">
        {/* Barra Superior Limpia (Saludo Editorial, Iconos y Avatar) */}
        <header className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-3.5 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-xl border border-[#ECEEF2] bg-white p-2 text-black shadow-2xs lg:hidden"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-black sm:text-3xl">
                ¡Hola! {user?.username || "Organizador"}
              </h1>
              <p className="truncate text-[10px] font-medium text-black sm:text-xs">
                Administra tus invitaciones, confirmaciones y accesos en tiempo real ✨
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {activeSection === "gestor" && (
              <>
                {/* Acceso directo 1: Cámara en Vivo (tomar fotos rápido) */}
                <button
                  type="button"
                  onClick={() => handleTriggerMemoriesShortcut("camera")}
                  title="Acceso directo a Cámara en Vivo para tomar fotos rápido"
                  aria-label="Abrir Cámara en Vivo"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#2ED47A] to-[#1E9E63] text-xs text-white shadow-[0_6px_16px_rgba(46,212,122,0.34)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 sm:h-9 sm:w-9 sm:text-sm"
                >
                  📷
                </button>

                {/* Acceso directo 2: Formulario / Sección de Creación de Reel */}
                <button
                  type="button"
                  onClick={() => handleTriggerMemoriesShortcut("reel")}
                  title="Acceso directo al formulario de Creación de Reel"
                  aria-label="Crear Reel"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#8A4FFF] via-[#E1306C] to-[#FF8E53] text-xs text-white shadow-[0_6px_16px_rgba(225,48,108,0.34)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 sm:h-9 sm:w-9 sm:text-sm"
                >
                  🎬
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => openEventManager(selectedEventoId, "settings")}
              title="Ajustes del evento"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#4A4A8A] text-xs text-black shadow-[0_6px_16px_rgba(74,74,138,0.28)] transition hover:bg-[#3F3F7A] active:scale-95 sm:h-9 sm:w-9"
            >
              ⚙️
            </button>

            <div className="flex items-center gap-2 rounded-full border border-[#ECEEF2] bg-white p-0.5 shadow-2xs sm:gap-2.5 sm:p-1 sm:pl-1.5 sm:pr-3.5">
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
              SECCIÓN 1: INICIO / MIS EVENTOS (PESTAÑAS Y CONTENEDOR ESTILO IMAGEN DE REFERENCIA)
             ================================================================= */}
          {activeSection === "inicio" && (
            <div className="space-y-6 text-[#1E2235]">
              {/* PESTAÑAS TIPO CARPETA CURVA + CONTENEDOR BLANCO GENERAL */}
              <div>
                {/* Pestañas Superiores Estilo Carpeta (Activa en Blanco #FFFFFF, Inactivas en Azul Pastel #DCE5F2 / #CBD7EB / #C1CEE6) */}
                <div className="flex flex-nowrap items-end gap-0">
                  {[
                    {
                      id: "all",
                      label: `Mis Eventos (${eventos.length})`,
                      inactiveBg: "#DCE5F2",
                      zIndexBase: "z-10",
                    },
                    {
                      id: "active",
                      label: "Eventos Activos/En Curso",
                      inactiveBg: "#CBD7EB",
                      zIndexBase: "z-[9]",
                    },
                    {
                      id: "paused",
                      label: "Eventos Pausados",
                      inactiveBg: "#C1CEE6",
                      zIndexBase: "z-[8]",
                    },
                  ].map((tab, idx) => {
                    const isTabActive = folderTab === tab.id;
                    const fillHex = isTabActive ? "#FFFFFF" : tab.inactiveBg;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFolderTab(tab.id)}
                        style={{ backgroundColor: fillHex }}
                        className={`group relative min-w-0 cursor-pointer rounded-t-[14px] rounded-b-none px-2.5 py-2.5 text-[10px] tracking-tight transition sm:rounded-t-[18px] sm:px-5 sm:py-3 sm:text-xs md:px-7 md:py-3.5 md:text-[13px] lg:px-8 ${
                          idx > 0 ? "-ml-1.5 sm:-ml-2" : ""
                        } ${
                          isTabActive
                            ? "z-20 -mb-px font-extrabold text-[#1E2235] shadow-[0_-4px_12px_rgba(30,42,70,0.04)]"
                            : `${tab.zIndexBase} font-medium text-[#55617C] hover:text-[#1E2235]`
                        }`}
                      >
                        {/* Curva cóncava izquierda estilo pestaña de carpeta */}
                        {idx > 0 && (
                          <svg
                            viewBox="0 0 12 12"
                            className="pointer-events-none absolute bottom-0 -left-2.5 h-2.5 w-2.5 sm:-left-3 sm:h-3 sm:w-3"
                            fill="none"
                          >
                            <path
                              d="M12 0C12 6.62742 6.62742 12 0 12H12V0Z"
                              fill={fillHex}
                            />
                          </svg>
                        )}
                        <span className="block truncate">{tab.label}</span>
                        {/* Curva cóncava derecha estilo pestaña de carpeta */}
                        <svg
                          viewBox="0 0 12 12"
                          className="pointer-events-none absolute -right-2.5 bottom-0 h-2.5 w-2.5 sm:-right-3 sm:h-3 sm:w-3"
                          fill="none"
                        >
                          <path
                            d="M0 0C0 6.62742 5.37258 12 12 12H0V0Z"
                            fill={fillHex}
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>

                {/* Contenedor General Blanco de "Mis Eventos" */}
                <div
                  className={`rounded-b-[20px] rounded-tr-[20px] bg-white p-3 text-[#1E2235] shadow-[0_10px_30px_rgba(30,42,70,0.04)] sm:p-7 lg:p-8 ${
                    folderTab === "all"
                      ? "rounded-tl-none"
                      : "rounded-tl-[16px] sm:rounded-tl-[20px]"
                  }`}
                >
                  {/* Barra de Búsqueda, Filtro y Botón "+ Crear Evento" (mismos colores y estilos que la imagen de referencia) */}
                  <div className="flex flex-col justify-between gap-4 pb-6 lg:flex-row lg:items-center">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                        <label className="text-xs font-bold text-[#1E2235] sm:text-[13px]">
                          Nombre del Evento
                        </label>
                        <input
                          type="text"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          placeholder="Buscar por nombre o lugar..."
                          className="w-full rounded-lg border border-[#DCE0E8] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2235] placeholder:text-[#B4BAC8] outline-none transition focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/15 sm:w-56"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                        <label className="text-xs font-bold text-[#1E2235] sm:text-[13px]">
                          Categoría
                        </label>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="w-full rounded-lg border border-[#DCE0E8] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2235] outline-none transition focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/15 sm:w-48"
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
                        className="w-fit cursor-pointer self-start rounded-lg border border-[#2B7FFF] bg-white px-5 py-2 text-xs font-semibold text-[#2B7FFF] transition hover:bg-[#2B7FFF]/8 sm:self-auto"
                      >
                        Ver Todos
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection("wizard")}
                      className="inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 self-start rounded-lg bg-[#2B7FFF] px-5 py-2.5 text-center text-xs font-semibold text-white shadow-[0_4px_12px_rgba(43,127,255,0.28)] transition hover:bg-[#1A6FEF] lg:self-auto"
                    >
                      <span>＋ Crear Evento</span>
                    </button>
                  </div>

                  {/* Cuadrícula de Tarjetas de Eventos */}
                  {loadingEventos ? (
                    <p className="py-12 text-center text-sm font-medium text-[#55617C]">
                      Cargando tus eventos...
                    </p>
                  ) : filteredEventos.length === 0 ? (
                    <div className="py-12 text-center">
                      <h3 className="text-lg font-bold text-[#1E2235]">
                        No se encontraron eventos en esta vista
                      </h3>
                      <p className="mt-1 text-xs font-medium text-[#55617C]">
                        Crea un nuevo evento con el Wizard paso a paso o cambia
                        los filtros de búsqueda.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveSection("wizard")}
                        className="mt-5 cursor-pointer rounded-lg bg-[#2B7FFF] px-6 py-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(43,127,255,0.28)] transition hover:bg-[#1A6FEF]"
                      >
                        ＋ Iniciar Wizard de Creación
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl bg-[#EAECF3] p-2.5 sm:gap-5 sm:rounded-3xl sm:p-5 lg:gap-6 lg:p-6 xl:grid-cols-3">
                      {filteredEventos.map((ev) => {
                        const fechaStr = String(ev.fecha_evento || "").slice(
                          0,
                          10
                        );
                        const coverThumb =
                          String(ev.imagen_portada || "").trim() ||
                          DEFAULT_INVITACION_THUMB;
                        const rsvpActive = ev.rsvp_habilitado !== false;

                        return (
                          <div
                            key={ev.idevento}
                            onClick={() =>
                              openEventManager(ev.idevento, "invitation")
                            }
                            className="group relative flex w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_10px_28px_rgba(20,24,45,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(20,24,45,0.14)] sm:rounded-[22px]"
                          >
                            {/* Imagen superior del evento */}
                            <div className="relative h-28 w-full overflow-hidden bg-[#181B2C] sm:h-48 xl:h-52">
                              <img
                                src={coverThumb}
                                alt={`Invitación de ${ev.nombre}`}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    DEFAULT_INVITACION_THUMB;
                                }}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            </div>

                            {/* Cuerpo inferior blanco estilo tarjeta de referencia */}
                            <div className="relative -mt-3.5 flex flex-1 flex-col justify-between rounded-t-[14px] bg-white px-2.5 pt-2.5 pb-3 text-left sm:-mt-4 sm:rounded-t-[18px] sm:px-5 sm:pt-4 sm:pb-5">
                              {/* Avatar circular superpuesto en el borde derecho entre imagen y texto */}
                              <div className="absolute -top-4 right-2.5 h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-[#2D3047] shadow-md sm:-top-6 sm:right-5 sm:h-12 sm:w-12 sm:border-[3px]">
                                <img
                                  src={coverThumb}
                                  alt={ev.nombre}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      DEFAULT_INVITACION_THUMB;
                                  }}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div>
                                {/* Subtítulo superior + punto verde de estado */}
                                <div className="flex items-center gap-1 pr-9 sm:gap-1.5 sm:pr-14">
                                  <span className="truncate text-[9px] font-medium text-[#7B819A] sm:text-xs">
                                    {ev.tipo_evento || "Evento"}
                                  </span>
                                  <span
                                    className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 ${
                                      rsvpActive
                                        ? "bg-[#4ADE80]"
                                        : "bg-[#F87171]"
                                    }`}
                                    title={
                                      rsvpActive
                                        ? "Evento Activo"
                                        : "Evento Pausado"
                                    }
                                  />
                                </div>

                                {/* Título principal en negro/carbón oscuro */}
                                <h3 className="mt-1 truncate pr-1 text-[12px] font-extrabold tracking-tight text-[#1E2029] sm:mt-1.5 sm:pr-2 sm:text-[17px]">
                                  {ev.nombre}
                                </h3>
                              </div>

                              {/* Fila inferior de 2 columnas con etiquetas grises y valores en negrita */}
                              <div className="mt-2 grid grid-cols-2 gap-1.5 pt-0.5 sm:mt-4 sm:gap-3 sm:pt-1">
                                <div className="min-w-0">
                                  <span className="block truncate text-[8px] font-medium text-[#8C92A8] sm:text-[11px]">
                                    Fecha del Evento
                                  </span>
                                  <span className="mt-0.5 block truncate text-[10px] font-extrabold text-[#1E2029] sm:text-[15px]">
                                    {fechaStr || "Por definir"}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <span className="block truncate text-[8px] font-medium text-[#8C92A8] sm:text-[11px]">
                                    Hora / Lugar
                                  </span>
                                  <span className="mt-0.5 block truncate text-[10px] font-extrabold text-[#1E2029] sm:text-[15px]">
                                    {ev.hora_evento || "20:00"} hrs
                                  </span>
                                </div>
                              </div>
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
            <div className="space-y-6 text-[#1E2235]">
              {selectedInvitacionAlbum ? (
                <CamaraAlbumEvento
                  evento={selectedInvitacionAlbum}
                  modoInvitado={true}
                  onCloseModoInvitado={() => setSelectedInvitacionAlbum(null)}
                />
              ) : (
                <div>
                  {/* Pestañas Superiores Estilo Carpeta Curva (Activa en Blanco #FFFFFF, Inactivas en Azul Pastel #DCE5F2 / #CBD7EB / #C1CEE6) */}
                  <div className="flex flex-nowrap items-end gap-0">
                    {[
                      {
                        id: "all",
                        label: `Mis Invitaciones (${misInvitaciones.length})`,
                        inactiveBg: "#DCE5F2",
                        zIndexBase: "z-10",
                      },
                      {
                        id: "confirmed",
                        label: "Asistencia Confirmada",
                        inactiveBg: "#CBD7EB",
                        zIndexBase: "z-[9]",
                      },
                      {
                        id: "pending",
                        label: "Pendientes / Por Confirmar",
                        inactiveBg: "#C1CEE6",
                        zIndexBase: "z-[8]",
                      },
                    ].map((tab, idx) => {
                      const isTabActive = invFolderTab === tab.id;
                      const fillHex = isTabActive ? "#FFFFFF" : tab.inactiveBg;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setInvFolderTab(tab.id)}
                          style={{ backgroundColor: fillHex }}
                          className={`group relative min-w-0 cursor-pointer rounded-t-[14px] rounded-b-none px-2 py-2.5 text-[9.5px] tracking-tight transition sm:rounded-t-[18px] sm:px-5 sm:py-3 sm:text-xs md:px-7 md:py-3.5 md:text-[13px] lg:px-8 ${
                            idx > 0 ? "-ml-1.5 sm:-ml-2" : ""
                          } ${
                            isTabActive
                              ? "z-20 -mb-px font-extrabold text-[#1E2235] shadow-[0_-4px_12px_rgba(30,42,70,0.04)]"
                              : `${tab.zIndexBase} font-medium text-[#55617C] hover:text-[#1E2235]`
                          }`}
                        >
                          {/* Curva cóncava izquierda estilo pestaña de carpeta */}
                          {idx > 0 && (
                            <svg
                              viewBox="0 0 12 12"
                              className="pointer-events-none absolute bottom-0 -left-2.5 h-2.5 w-2.5 sm:-left-3 sm:h-3 sm:w-3"
                              fill="none"
                            >
                              <path
                                d="M12 0C12 6.62742 6.62742 12 0 12H12V0Z"
                                fill={fillHex}
                              />
                            </svg>
                          )}
                          <span className="block truncate">{tab.label}</span>
                          {/* Curva cóncava derecha estilo pestaña de carpeta */}
                          <svg
                            viewBox="0 0 12 12"
                            className="pointer-events-none absolute -right-2.5 bottom-0 h-2.5 w-2.5 sm:-right-3 sm:h-3 sm:w-3"
                            fill="none"
                          >
                            <path
                              d="M0 0C0 6.62742 5.37258 12 12 12H0V0Z"
                              fill={fillHex}
                            />
                          </svg>
                        </button>
                      );
                    })}
                  </div>

                  {/* Contenedor General Blanco de "Mis Invitaciones" */}
                  <div
                    className={`rounded-b-[20px] rounded-tr-[20px] bg-white p-3 text-[#1E2235] shadow-[0_10px_30px_rgba(30,42,70,0.04)] sm:p-7 lg:p-8 ${
                      invFolderTab === "all"
                        ? "rounded-tl-none"
                        : "rounded-tl-[16px] sm:rounded-tl-[20px]"
                    }`}
                  >
                    {/* Barra de Búsqueda, Filtro y Botón Actualizar */}
                    <div className="flex flex-col justify-between gap-4 pb-6 lg:flex-row lg:items-center">
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                          <label className="text-xs font-bold text-[#1E2235] sm:text-[13px]">
                            Nombre del Evento
                          </label>
                          <input
                            type="text"
                            value={invSearchKeyword}
                            onChange={(e) => setInvSearchKeyword(e.target.value)}
                            placeholder="Buscar por evento o lugar..."
                            className="w-full rounded-lg border border-[#DCE0E8] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2235] placeholder:text-[#B4BAC8] outline-none transition focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/15 sm:w-56"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                          <label className="text-xs font-bold text-[#1E2235] sm:text-[13px]">
                            Categoría
                          </label>
                          <select
                            value={invTypeFilter}
                            onChange={(e) => setInvTypeFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#DCE0E8] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2235] outline-none transition focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/15 sm:w-48"
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
                          className="w-fit cursor-pointer self-start rounded-lg border border-[#2B7FFF] bg-white px-5 py-2 text-xs font-semibold text-[#2B7FFF] transition hover:bg-[#2B7FFF]/8 sm:self-auto"
                        >
                          Ver Todas
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={fetchMisInvitaciones}
                        className="inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 self-start rounded-lg bg-[#2B7FFF] px-5 py-2.5 text-center text-xs font-semibold text-white shadow-[0_4px_12px_rgba(43,127,255,0.28)] transition hover:bg-[#1A6FEF] lg:self-auto"
                      >
                        <span>🔄 Actualizar Invitaciones</span>
                      </button>
                    </div>

                    {/* Cuadrícula de Tarjetas de Invitaciones */}
                    {loadingMisInvitaciones ? (
                      <p className="py-12 text-center text-sm font-medium text-[#55617C]">
                        Cargando tus invitaciones vinculadas a{" "}
                        <strong>{user?.correoRegistro}</strong>...
                      </p>
                    ) : filteredMisInvitaciones.length === 0 ? (
                      <div className="py-12 text-center">
                        <h3 className="text-lg font-bold text-[#1E2235]">
                          Aún no tienes invitaciones registradas en esta vista
                        </h3>
                        <p className="mx-auto mt-1 max-w-lg text-xs font-medium text-[#55617C]">
                          Cuando alguien te envíe una invitación y confirmes tu
                          asistencia usando tu correo{" "}
                          <strong>{user?.correoRegistro}</strong>, aparecerá
                          automáticamente aquí con tu pase y código QR.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl bg-[#EAECF3] p-2.5 sm:gap-5 sm:rounded-3xl sm:p-5 lg:gap-6 lg:p-6 xl:grid-cols-3">
                        {filteredMisInvitaciones.map((inv) => {
                          const fechaStr = String(inv.fecha_evento || "").slice(
                            0,
                            10
                          );
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
                          const statusDotColor =
                            inv.estado_rsvp === "Confirmado"
                              ? "bg-[#4ADE80]"
                              : inv.estado_rsvp === "Rechazado"
                              ? "bg-[#F87171]"
                              : "bg-[#FBBF24]";

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
                              className="group relative flex w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_10px_28px_rgba(20,24,45,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(20,24,45,0.14)] sm:rounded-[22px]"
                            >
                              {/* Imagen superior del evento */}
                              <div className="relative h-28 w-full overflow-hidden bg-[#181B2C] sm:h-48 xl:h-52">
                                <img
                                  src={coverThumb}
                                  alt={`Invitación de ${inv.nombre}`}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      DEFAULT_INVITACION_THUMB;
                                  }}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                              </div>

                              {/* Cuerpo inferior blanco estilo tarjeta de referencia */}
                              <div className="relative -mt-3.5 flex flex-1 flex-col justify-between rounded-t-[14px] bg-white px-2.5 pt-2.5 pb-3 text-left sm:-mt-4 sm:rounded-t-[18px] sm:px-5 sm:pt-4 sm:pb-5">
                                {/* Avatar circular superpuesto en el borde derecho */}
                                <div className="absolute -top-4 right-2.5 h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-[#2D3047] shadow-md sm:-top-6 sm:right-5 sm:h-12 sm:w-12 sm:border-[3px]">
                                  <img
                                    src={coverThumb}
                                    alt={inv.nombre}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src =
                                        DEFAULT_INVITACION_THUMB;
                                    }}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div>
                                  {/* Subtítulo superior + punto verde/ámbar/rojo de estado */}
                                  <div className="flex items-center gap-1 pr-9 sm:gap-1.5 sm:pr-14">
                                    <span className="truncate text-[9px] font-medium text-[#7B819A] sm:text-xs">
                                      {inv.tipo_evento || "Evento"} •{" "}
                                      {inv.estado_rsvp === "Confirmado"
                                        ? `Confirmado (${inv.pases})`
                                        : inv.estado_rsvp === "Rechazado"
                                        ? "No asistiré"
                                        : "Pendiente"}
                                    </span>
                                    <span
                                      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 ${statusDotColor}`}
                                    />
                                  </div>

                                  {/* Título principal en negro/carbón oscuro */}
                                  <h3 className="mt-1 truncate pr-1 text-[12px] font-extrabold tracking-tight text-[#1E2029] sm:mt-1.5 sm:pr-2 sm:text-[17px]">
                                    {inv.nombre}
                                  </h3>
                                </div>

                                {/* Fila inferior de 2 columnas con etiquetas grises y valores en negrita */}
                                <div className="mt-2 grid grid-cols-2 gap-1.5 pt-0.5 sm:mt-4 sm:gap-3 sm:pt-1">
                                  <div className="min-w-0">
                                    <span className="block truncate text-[8px] font-medium text-[#8C92A8] sm:text-[11px]">
                                      Fecha del Evento
                                    </span>
                                    <span className="mt-0.5 block truncate text-[10px] font-extrabold text-[#1E2029] sm:text-[15px]">
                                      {fechaStr || "Por definir"}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="block truncate text-[8px] font-medium text-[#8C92A8] sm:text-[11px]">
                                      Hora / Pase QR
                                    </span>
                                    <span className="mt-0.5 block truncate text-[10px] font-extrabold text-[#1E2029] sm:text-[15px]">
                                      {inv.hora_evento || "20:00"} hrs ↗
                                    </span>
                                  </div>
                                </div>

                                {puedeVerAlbum && (
                                  <div className="mt-2 border-t border-[#ECEFF6] pt-2 sm:mt-3.5 sm:pt-3">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedInvitacionAlbum(inv);
                                      }}
                                      className="flex w-full cursor-pointer flex-wrap items-center justify-center gap-1 rounded-lg bg-[#1E2029] px-2 py-1.5 text-center text-[9px] font-extrabold text-white shadow-sm transition hover:bg-[#2D3047] sm:gap-1.5 sm:rounded-xl sm:px-3 sm:py-2 sm:text-[11px]"
                                      title="El anfitrión compartió las fotos y reels de este evento contigo"
                                    >
                                      <span className="truncate">
                                        📸 Ver Fotos y Reels
                                      </span>
                                      {(numFotos > 0 || numReels > 0) && (
                                        <span className="shrink-0 rounded-md bg-white/15 px-1 py-0.5 text-[8px] text-[#4ADE80] sm:px-1.5 sm:text-[9px]">
                                          {numFotos}📷 · {numReels}🎬
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                )}
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
              memoriesShortcutAction={memoriesShortcutAction}
              onConsumeMemoriesShortcut={() => setMemoriesShortcutAction(null)}
            />
          )}

          {/* =================================================================
              SECCIÓN 5: CONFIGURACIÓN GLOBAL DE PLATAFORMA (SOLO ADMINS)
             ================================================================= */}
          {activeSection === "admin" && user?.isAdmin && <PanelAdminGlobal />}
        </main>
      </div>

      {/* =====================================================================
          ICONOS FLOTANTES FIJOS DEL LADO DERECHO (CENTRADOS VERTICALMENTE EN COLUMNA: CÁMARA ARRIBA, REEL ABAJO)
          Solo visibles cuando el usuario entra a la configuración/gestor de un evento desde Mis Eventos
         ===================================================================== */}
      {activeSection === "gestor" && (
        <div className="fixed right-2 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 sm:right-3.5 sm:gap-3 lg:right-5">
          {/* Icono 1 (Arriba): Acceso directo a Cámara en Vivo */}
          <button
            type="button"
            onClick={() => handleTriggerMemoriesShortcut("camera")}
            title="Abrir Cámara en Vivo para tomar fotos rápido"
            aria-label="Abrir Cámara en Vivo"
            className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#2ED47A] to-[#1E9E63] text-base text-white shadow-[0_8px_22px_rgba(30,158,99,0.42)] transition duration-200 hover:scale-110 hover:brightness-110 active:scale-95 sm:h-11 sm:w-11 sm:text-lg lg:h-12 lg:w-12 lg:text-xl"
          >
            <span>📷</span>
            <span className="pointer-events-none absolute right-full mr-2.5 hidden whitespace-nowrap rounded-lg bg-[#1E2235] px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
              📷 Cámara en Vivo
            </span>
          </button>

          {/* Icono 2 (Abajo): Acceso directo a Creación de Reel */}
          <button
            type="button"
            onClick={() => handleTriggerMemoriesShortcut("reel")}
            title="Ir directo a Creación de Reel"
            aria-label="Crear Reel"
            className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#8A4FFF] via-[#E1306C] to-[#FF8E53] text-base text-white shadow-[0_8px_22px_rgba(225,48,108,0.42)] transition duration-200 hover:scale-110 hover:brightness-110 active:scale-95 sm:h-11 sm:w-11 sm:text-lg lg:h-12 lg:w-12 lg:text-xl"
          >
            <span>🎬</span>
            <span className="pointer-events-none absolute right-full mr-2.5 hidden whitespace-nowrap rounded-lg bg-[#1E2235] px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
              🎬 Crear Reel
            </span>
          </button>
        </div>
      )}

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
