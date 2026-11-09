import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlarmClock,
  AlertTriangle,
  Bell,
  Calendar,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FolderOpen,
  Gift,
  Hourglass,
  Image as ImageIcon,
  LayoutTemplate,
  Lightbulb,
  Link2,
  Lock,
  Mail,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Monitor,
  Navigation,
  Package,
  PartyPopper,
  Pause,
  Pencil,
  Play,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Rocket,
  Save,
  Send,
  Settings,
  Share2,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Sofa,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  Unlock,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import {
  createEventoRequest,
  getEventoDetalleRequest,
  updateEventoRequest,
  duplicarEventoRequest,
  cambiarPropietarioRequest,
  deleteEventoRequest,
  addInvitadoRequest,
  importarInvitadosRequest,
  updateInvitadoRequest,
  deleteInvitadoRequest,
  enviarCorreoIndividualRequest,
  enviarDifusionRequest,
  guardarConfigWhatsAppApiRequest,
  listarPlantillasWhatsAppApiRequest,
  enviarWhatsAppIndividualApiRequest,
  enviarRecordatoriosWhatsAppMasivoRequest,
  addLogisticaRequest,
  updateLogisticaRequest,
  deleteLogisticaRequest,
  addPresupuestoRequest,
  updatePresupuestoRequest,
  deletePresupuestoRequest,
} from "../../api/eventos.js";
import { GESTOR_TABS, normalizeGestorTab } from "./gestorTabs.js";
import CamaraAlbumEvento from "./CamaraAlbumEvento.jsx";
import { useGoogleMapsLocation } from "../../utils/googleMaps.js";
import catalogosMexico from "../../utils/catalogosMexico.json";

const PLANTILLAS = [
  {
    id: "neon-crimson",
    name: "Azul Celeste Pro",
    accent: "#15b2f5",
    secondary: "#171f39",
    bg: "from-[#142257] via-[#142257] to-[#0B1336]",
    border: "border-[#15b2f5]",
  },
  {
    id: "cyber-cyan",
    name: "Cian Eléctrico",
    accent: "#00f0ff",
    secondary: "#15b2f5",
    bg: "from-[#061e24] via-[#142257] to-[#0B1336]",
    border: "border-[#00f0ff]",
  },
  {
    id: "gold-gala",
    name: "Gala Dorada VIP",
    accent: "#f59e0b",
    secondary: "#fde68a",
    bg: "from-[#221706] via-[#142257] to-[#0B1336]",
    border: "border-amber-400",
  },
  {
    id: "midnight-vip",
    name: "Medianoche Violeta",
    accent: "#a855f7",
    secondary: "#15b2f5",
    bg: "from-[#190729] via-[#142257] to-[#0B1336]",
    border: "border-purple-500",
  },
];

const POSTER_PRESETS = [
  {
    label: "Sin póster (Degradado Tech)",
    url: "",
  },
  {
    label: "Fiesta Club & DJ",
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Gala & Brindis VIP",
    url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Concierto & Luces",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  },
];

const EMAIL_HTML_TEMPLATES = [
  {
    id: "neon-vip",
    name: "Gala Azul Real VIP",
    subject: "✨ Invitación Exclusiva: {evento}",
    badge: "VIP ACCESS",
    gradient: "from-[#142257] via-[#142257] to-[#121316]",
    borderClass: "border-[#15b2f5]/40",
    badgeColor: "#15b2f5",
    accentHex: "#15b2f5",
    buttonClass: "bg-[#15b2f5] text-[#171F39]",
  },
  {
    id: "minimal-gold",
    name: "Etiqueta Dorada Elegante",
    subject: "🥂 Estás invitado a {evento} - Confirma tu asistencia",
    badge: "INVITACIÓN DIGITAL",
    gradient: "from-[#241907] via-[#142257] to-[#121316]",
    borderClass: "border-amber-400/40",
    badgeColor: "#fde68a",
    accentHex: "#f59e0b",
    buttonClass: "bg-amber-400 text-[#0F1A45]",
  },
  {
    id: "club-pass",
    name: "Pase Nocturno / Afterparty",
    subject: "🎧 Tu pase digital para {evento} está listo",
    badge: "OFFICIAL PASS",
    gradient: "from-[#061e24] via-[#142257] to-[#1a0726]",
    borderClass: "border-[#00f0ff]/40",
    badgeColor: "#15b2f5",
    accentHex: "#00f0ff",
    buttonClass: "bg-[#00f0ff] text-[#0F1A45]",
  },
];

const MODALIDADES_INVITADOS = [
  "Solo Adultos",
  "Solo Niños",
  "Solo Hombres",
  "Solo Mujeres",
  "Adultos + Niños",
  "Papa + Niños",
  "Mama + Niños",
  "+LGBT",
];

const TIENDAS_MESA_REGALOS = [
  "Amazon",
  "Mercado Libre",
  "IKEA",
  "Liverpool",
  "Palacio de Hierro",
  "Sears",
  "Coppel",
  "Walmart",
  "Otra tienda",
];

function detectStoreFromUrl(rawUrl) {
  const u = String(rawUrl || "").toLowerCase();
  if (u.includes("amazon.") || u.includes("amzn.")) return "Amazon";
  if (u.includes("mercadolibre.") || u.includes("meli.")) return "Mercado Libre";
  if (u.includes("ikea.")) return "IKEA";
  if (u.includes("liverpool.")) return "Liverpool";
  if (u.includes("elpalaciodehierro.")) return "Palacio de Hierro";
  if (u.includes("sears.")) return "Sears";
  if (u.includes("coppel.")) return "Coppel";
  if (u.includes("walmart.")) return "Walmart";
  return "";
}

function getTiendaMeta(tienda) {
  const t = String(tienda || "").toLowerCase();
  if (t.includes("amazon")) {
    return {
      Icon: Package,
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      lightBadgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    };
  }
  if (t.includes("mercado")) {
    return {
      Icon: ShoppingBag,
      badgeClass: "bg-yellow-400/20 text-yellow-200 border-yellow-400/40",
      lightBadgeClass: "bg-yellow-100 text-yellow-900 border-yellow-300",
    };
  }
  if (t.includes("ikea")) {
    return {
      Icon: Sofa,
      badgeClass: "bg-sky-500/20 text-sky-200 border-sky-400/40",
      lightBadgeClass: "bg-sky-100 text-sky-900 border-sky-300",
    };
  }
  if (t.includes("liverpool")) {
    return {
      Icon: ShoppingBag,
      badgeClass: "bg-pink-500/20 text-pink-200 border-pink-400/40",
      lightBadgeClass: "bg-pink-100 text-pink-900 border-pink-300",
    };
  }
  if (t.includes("palacio")) {
    return {
      Icon: Sparkles,
      badgeClass: "bg-amber-400/20 text-amber-200 border-amber-300/40",
      lightBadgeClass: "bg-amber-50 text-amber-900 border-amber-300",
    };
  }
  return {
    Icon: Gift,
    badgeClass: "bg-[#15b2f5]/20 text-[#15b2f5] border-[#15b2f5]/40",
    lightBadgeClass: "bg-indigo-50 text-indigo-900 border-indigo-200",
  };
}

function parseMesaRegaloItem(item) {
  let parsed = {};
  try {
    parsed = JSON.parse(item.detalle || "{}");
  } catch {
    parsed = {};
  }
  const url = String(
    parsed.url ||
      (String(item.detalle || "").startsWith("http") ? item.detalle : "")
  ).trim();
  const tienda =
    parsed.tienda ||
    item.estado ||
    detectStoreFromUrl(url) ||
    "Tienda Externa";
  const producto = parsed.producto || item.titulo || "Regalo sugerido";
  const nota = parsed.nota || item.fecha_limite || "";
  return {
    iditem: item.iditem,
    tienda,
    producto,
    url,
    nota,
  };
}

function normalizeModalidad(mod) {
  const raw = String(mod || "").trim();
  const lower = raw.toLowerCase();
  if (!raw || lower === "adultos y niños" || lower === "padres e hijos" || lower === "toda la familia") {
    return "Adultos + Niños";
  }
  if (lower === "padre e hijos" || lower === "un padre, un hijo") {
    return "Papa + Niños";
  }
  if (lower === "madre e hijos" || lower === "una madre, un hijo") {
    return "Mama + Niños";
  }
  return raw;
}

function isSoloAdultosMod(mod) {
  const m = String(mod || "").trim().toLowerCase();
  return (
    m === "solo adultos" ||
    m === "solo hombres" ||
    m === "solo mujeres"
  );
}

function isSoloNinosMod(mod) {
  return String(mod || "").trim().toLowerCase() === "solo niños";
}

function formatDateInput(val) {
  if (!val) return "";
  return String(val).slice(0, 10);
}

// Genera una matriz booleana 21x21 estilo QR determinista a partir de un texto
function buildQrMatrix(text) {
  const size = 21;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (r0, c0) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = isBorder || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Patrones de sincronización
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  let hash = 2166136261;
  const seed = String(text || "PROYECTO-EVENTOS-QR");
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft || r === 6 || c === 6) {
        continue;
      }
      const mix =
        ((r * 31 + c * 17 + seed.charCodeAt((r + c) % seed.length)) ^ hash) >>>
        0;
      grid[r][c] = mix % 3 !== 0;
    }
  }
  return grid;
}

function parseCsvRows(rawText) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const parsed = [];
  for (let idx = 0; idx < lines.length; idx++) {
    const cols = lines[idx].split(/[,;\t]/).map((c) => c.trim());
    // Saltar cabecera si la primera línea dice "nombre"
    if (
      idx === 0 &&
      cols[0].toLowerCase().includes("nombre") &&
      (cols[1]?.toLowerCase().includes("tel") ||
        cols[1]?.toLowerCase().includes("correo") ||
        cols[1]?.toLowerCase().includes("email"))
    ) {
      continue;
    }
    if (!cols[0]) continue;
    parsed.push({
      nombre: cols[0],
      telefono: cols[1] || "",
      correo: cols[2] || "",
      grupo: cols[3] || "Amigos",
      adultos: Math.max(0, Number(cols[4] ?? 1) || 1),
      ninos: Math.max(0, Number(cols[5] ?? 0) || 0),
      nota_alimentacion: cols[6] || "",
      estado_rsvp: cols[7] || "Pendiente",
    });
  }
  return parsed;
}

function getGoogleMapsUrls(lugar, direccion) {
  const rawDir = String(direccion || "").trim();
  const rawLugar = String(lugar || "").trim();
  const isDirectUrl = /^https?:\/\//i.test(rawDir);

  let queryForEmbed = [rawLugar, isDirectUrl ? "" : rawDir]
    .filter(Boolean)
    .join(", ")
    .trim();

  if (!queryForEmbed && isDirectUrl) {
    const matchCoord = rawDir.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const matchQ = rawDir.match(/[?&]q=([^&]+)/);
    if (matchCoord) {
      queryForEmbed = `${matchCoord[1]},${matchCoord[2]}`;
    } else if (matchQ) {
      queryForEmbed = decodeURIComponent(matchQ[1].replace(/\+/g, " "));
    } else {
      queryForEmbed = rawLugar || "Ciudad de México";
    }
  }

  if (!queryForEmbed) {
    queryForEmbed = "Ciudad de México";
  }

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    queryForEmbed
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const externalUrl = isDirectUrl
    ? rawDir
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [rawLugar, rawDir].filter(Boolean).join(", ") || "Ciudad de México"
      )}`;

  return {
    embedUrl,
    externalUrl,
    hasLocation: Boolean(rawLugar || rawDir),
  };
}

function GestorEvento({
  eventos,
  selectedEventoId,
  draftEvento,
  onDraftSaved,
  onSelectEvento,
  activeSubTab,
  onChangeSubTab,
  onEventoUpdated,
  onEventoDuplicated,
  onEventoDeleted,
  onRequestDeleteEvento,
  onGoToWizard,
  memoriesShortcutAction,
  onConsumeMemoriesShortcut,
}) {
  const currentTab = normalizeGestorTab(activeSubTab);

  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [toast, setToast] = useState("");

  // Tab A: Vista previa Móvil vs Escritorio, Editor Rápido y Generador de Links por Modalidad/Pases
  const [previewDevice, setPreviewDevice] = useState("mobile"); // "mobile" | "desktop"
  const [invForm, setInvForm] = useState(null);
  const [customLinkForm, setCustomLinkForm] = useState({
    etiqueta: "",
    modalidad: "Adultos + Niños",
    tipoPase: "GENERAL",
    adultos: 0,
    ninos: 0,
  });
  const [editingCustomLinkId, setEditingCustomLinkId] = useState(null);
  const [customLinkError, setCustomLinkError] = useState("");
  const [showConfirmCreateLinkModal, setShowConfirmCreateLinkModal] =
    useState(false);

  // Mesa de Regalos (Enlaces a tiendas externas: Amazon, Mercado Libre, IKEA, etc.)
  const [giftForm, setGiftForm] = useState({
    tienda: "Amazon",
    tiendaCustom: "",
    producto: "",
    url: "",
    nota: "",
  });
  const [editingGiftId, setEditingGiftId] = useState(null);
  const [giftError, setGiftError] = useState("");

  // Itinerario de Evento (Horario Inicial, Horario Final, Título de Actividad, Descripción)
  const [itinerarioItems, setItinerarioItems] = useState([
    {
      iditem: null,
      localId: "init-1",
      horario_inicial: "20:00",
      horario_final: "21:00",
      titulo: "",
      descripcion: "",
    },
  ]);
  const [savingItinerario, setSavingItinerario] = useState(false);
  const [itinerarioError, setItinerarioError] = useState("");

  // Tab B: Lista de Invitados, Filtros y Modal/Panel de Alta Individual o CSV
  const [rsvpFilter, setRsvpFilter] = useState("Todos");
  const [groupFilter, setGroupFilter] = useState("Todos");
  const [guestSearch, setGuestSearch] = useState("");
  const [addMode, setAddMode] = useState("individual"); // "individual" | "csv"
  const [guestForm, setGuestForm] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    grupo: "Amigos",
    modalidad_pase: "Adultos + Niños",
    adultos: 1,
    ninos: 0,
    estado_rsvp: "Pendiente",
    mesa_asignada: "Sin asignar",
    nota_alimentacion: "",
  });
  const [csvText, setCsvText] = useState("");
  const [editingGuest, setEditingGuest] = useState(null);

  // Tab C: Centro de Envíos y Difusión (Enlaces, WhatsApp, Email/SMS, Recordatorios)
  const [whatsappMsg, setWhatsappMsg] = useState(
    "¡Hola {nombre}! 🎉 Estás cordialmente invitado(a) a {evento} el día {fecha} a las {hora} hrs en {lugar}. Confirma tu asistencia en la invitación virtual: {enlace}"
  );
  const [selectedWhatsappLinkId, setSelectedWhatsappLinkId] =
    useState("principal");
  const [selectedEmailLinkId, setSelectedEmailLinkId] =
    useState("principal");
  const [broadcastChannel, setBroadcastChannel] = useState("Email HTML");
  const [selectedHtmlTemplate, setSelectedHtmlTemplate] = useState("neon-vip");
  const [showHtmlPreviewModal, setShowHtmlPreviewModal] = useState(false);
  const [htmlPreviewTab, setHtmlPreviewTab] = useState("visual"); // "visual" | "code"
  const [previewGuestId, setPreviewGuestId] = useState("");
  const [confirmBroadcastModal, setConfirmBroadcastModal] = useState(null);
  const [confirmDirectEmailGuest, setConfirmDirectEmailGuest] = useState(null);
  const [guestLimitWarningModal, setGuestLimitWarningModal] = useState(null);
  const [showMetaWaConfig, setShowMetaWaConfig] = useState(false);
  const [sendingWaGuestId, setSendingWaGuestId] = useState(null);
  const [sendingWaBulk, setSendingWaBulk] = useState(false);
  const [loadingMetaTemplates, setLoadingMetaTemplates] = useState(false);
  const [metaTemplatesList, setMetaTemplatesList] = useState([]);
  const [metaWaForm, setMetaWaForm] = useState({
    configured: false,
    wabaId: "",
    phoneNumberId: "",
    accessToken: "",
    tokenMasked: "",
    templateName: "recordatorio_evento_recuerdalo",
    templateLang: "es_MX",
    mode: "template",
  });
  const [scheduledEmailForm, setScheduledEmailForm] = useState({
    fecha: "",
    hora: "10:00",
    templateId: "neon-vip",
    mensaje: "",
  });
  const [savingScheduledEmail, setSavingScheduledEmail] = useState(false);
  const [reminderPreviewMode, setReminderPreviewMode] = useState("dias");

  const DEFAULT_CONFIRMED_REMINDER_DIAS =
    "¡Hola! Te recordamos que faltan {dias} días para {evento} ({fecha} a las {hora} hrs en {lugar}). ¡Te esperamos! Ver detalles del evento: {enlace}";
  const DEFAULT_CONFIRMED_REMINDER_HORAS =
    "¡Hola! Te recordamos que faltan {horas} horas para {evento} (hoy a las {hora} hrs en {lugar}). ¡Te esperamos! Ver detalles del evento: {enlace}";
  const DEFAULT_PENDING_REMINDER_MSG =
    "¡Hola {nombre}! Te invitamos a confirmar tu asistencia para {evento} ({fecha} a las {hora} hrs en {lugar}) aquí: {enlace}";

  const normalizeConfirmedReminderMsg = (rawMsg, isHoras = false) => {
    const clean = String(rawMsg || "").trim();
    if (
      !clean ||
      /confirma tu asistencia|enlace personalizado|\{nombre\}/i.test(clean)
    ) {
      return isHoras
        ? DEFAULT_CONFIRMED_REMINDER_HORAS
        : DEFAULT_CONFIRMED_REMINDER_DIAS;
    }
    return clean;
  };

  // Tab D: Logística (Seating Chart Drag & Drop, Checklist con fecha límite, Cronograma)
  const [draggedGuestId, setDraggedGuestId] = useState(null);
  const [dragOverMesa, setDragOverMesa] = useState(null);
  const [newMesaForm, setNewMesaForm] = useState({
    titulo: "",
    detalle: "Zona General",
    capacidad_mesa: 8,
  });
  const [newTaskForm, setNewTaskForm] = useState({
    titulo: "",
    detalle: "",
    fecha_limite: "",
  });
  const [newCronoForm, setNewCronoForm] = useState({
    hora_itinerario: "20:00",
    titulo: "",
    detalle: "",
  });

  // Tab Presupuesto (Opcional)
  const [budgetForm, setBudgetForm] = useState({
    concepto: "",
    categoria: "Banquete",
    monto_estimado: "",
    monto_pagado: "",
    estado_pago: "Pendiente",
  });

  // Tab E: Ajustes del Evento (Propietario y QR)
  const [nuevoPropietarioEmail, setNuevoPropietarioEmail] = useState("");
  const [transferirCuenta, setTransferirCuenta] = useState(false);

  const showNotice = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3800);
  };

  useEffect(() => {
    let active = true;
    async function fetchDetail() {
      if (!selectedEventoId && draftEvento) {
        const esNingunoDraft =
          !draftEvento.estado_evento || draftEvento.estado_evento === "Ningúno";
        const draftObj = {
          ...draftEvento,
          idevento: null,
          estado_evento: esNingunoDraft ? "Ningúno" : draftEvento.estado_evento,
          municipio: esNingunoDraft
            ? "Ningúno"
            : draftEvento.municipio || "Ningúno",
          fecha_evento: formatDateInput(draftEvento.fecha_evento),
          fecha_limite_rsvp_activa: Boolean(
            draftEvento.fecha_limite_rsvp_activa
          ),
          fecha_limite_rsvp: draftEvento.fecha_limite_rsvp
            ? formatDateInput(draftEvento.fecha_limite_rsvp)
            : "",
          color_secundario: draftEvento.color_secundario || "#6C7EE1",
          imagen_portada: draftEvento.imagen_portada || "",
          texto_boton_rsvp: "Confirmar Asistencia",
          modalidad_invitados: normalizeModalidad(
            draftEvento.modalidad_invitados
          ),
          permitir_acompanantes:
            draftEvento.permitir_acompanantes ?? true,
          confirmar_acceso_qr:
            draftEvento.confirmar_acceso_qr ??
            draftEvento.permitir_acompanantes ??
            true,
          mesa_regalos_habilitada: Boolean(
            draftEvento.mesa_regalos_habilitada
          ),
          mesa_regalos_tienda: draftEvento.mesa_regalos_tienda || "Amazon",
          mesa_regalos_url: draftEvento.mesa_regalos_url || "",
          recordatorio_dias: draftEvento.recordatorio_dias ?? 3,
          recordatorio_activo: Boolean(draftEvento.recordatorio_activo),
          recordatorio_horas: draftEvento.recordatorio_horas ?? 12,
          recordatorio_horas_activo: Boolean(
            draftEvento.recordatorio_horas_activo
          ),
          recordatorio_mensaje: normalizeConfirmedReminderMsg(
            draftEvento.recordatorio_mensaje,
            Boolean(draftEvento.recordatorio_horas_activo) &&
              !draftEvento.recordatorio_activo
          ),
        };
        setReminderPreviewMode(
          Boolean(draftEvento.recordatorio_horas_activo) &&
            !draftEvento.recordatorio_activo
            ? "horas"
            : "dias"
        );
        setDetalle({
          evento: draftObj,
          invitados: [],
          logistica: [],
          presupuesto: [],
        });
        setInvForm(draftObj);
        setLoading(false);
        try {
          const { data: autoSaved } = await createEventoRequest(draftObj);
          if (!active || !autoSaved?.idevento) return;
          setDetalle((prev) => ({
            ...(prev || { invitados: [], logistica: [], presupuesto: [] }),
            evento: autoSaved,
          }));
          setInvForm((prev) => ({
            ...(prev || draftObj),
            ...autoSaved,
            fecha_evento: formatDateInput(
              autoSaved.fecha_evento || draftObj.fecha_evento
            ),
          }));
          if (onDraftSaved) {
            await onDraftSaved(autoSaved);
          } else if (onEventoUpdated) {
            onEventoUpdated();
          }
        } catch (err) {
          console.error("Error en autoguardado inicial del borrador:", err);
        }
        return;
      }
      if (!selectedEventoId) return;
      setLoading(true);
      try {
        const { data } = await getEventoDetalleRequest(selectedEventoId);
        if (!active) return;
        setDetalle(data);
        const modNormalizada = normalizeModalidad(
          data.evento.modalidad_invitados
        );
        const cfgRow = (data.logistica || []).find(
          (i) => i.categoria === "mesa_regalo_config"
        );
        const legacyGiftRow = (data.logistica || []).find(
          (i) => i.categoria === "mesa_regalo" && i.detalle
        );
        const tiendaConfig =
          data.evento.mesa_regalos_tienda ||
          (cfgRow?.titulo && cfgRow.titulo !== "Configuración Mesa de Regalos"
            ? cfgRow.titulo
            : "") ||
          legacyGiftRow?.estado ||
          "Amazon";
        const rawUrlCfg =
          data.evento.mesa_regalos_url ||
          cfgRow?.detalle ||
          (legacyGiftRow ? parseMesaRegaloItem(legacyGiftRow).url : "") ||
          "";
        const urlConfig = rawUrlCfg.startsWith("{")
          ? parseMesaRegaloItem({ detalle: rawUrlCfg }).url
          : rawUrlCfg;

        const ubicRow = (data.logistica || []).find(
          (i) => i.categoria === "ubicacion_config"
        );
        const estadoConfig =
          data.evento.estado_evento || ubicRow?.titulo || "Ningúno";
        const esNingunoCfg =
          !estadoConfig || /^ning[uú]no$/i.test(estadoConfig);
        const municipioConfig = esNingunoCfg
          ? "Ningúno"
          : data.evento.municipio || ubicRow?.detalle || "Ningúno";

        const itinerarioCfgRow = (data.logistica || []).find(
          (i) => i.categoria === "itinerario_config"
        );
        const itinerarioRows = (data.logistica || []).filter(
          (i) => i.categoria === "itinerario_evento"
        );
        const itinerarioHabilitadoCfg = Boolean(
          data.evento.itinerario_habilitado ||
            (itinerarioCfgRow && itinerarioCfgRow.estado === "Activo") ||
            (!itinerarioCfgRow && itinerarioRows.length > 0)
        );
        if (itinerarioRows.length > 0) {
          setItinerarioItems(
            itinerarioRows.map((row, idx) => ({
              iditem: row.iditem,
              localId: `row-${row.iditem || idx}`,
              horario_inicial: row.hora_itinerario || "20:00",
              horario_final: row.fecha_limite || "21:00",
              titulo:
                row.titulo === "Actividad de itinerario"
                  ? ""
                  : row.titulo || "",
              descripcion: row.detalle || "",
            }))
          );
        } else {
          setItinerarioItems([
            {
              iditem: null,
              localId: `init-${Date.now()}`,
              horario_inicial: data.evento.hora_evento || "20:00",
              horario_final: "21:00",
              titulo: "",
              descripcion: "",
            },
          ]);
        }

        setInvForm({
          ...data.evento,
          estado_evento: esNingunoCfg ? "Ningúno" : estadoConfig,
          municipio: municipioConfig,
          fecha_evento: formatDateInput(data.evento.fecha_evento),
          fecha_limite_rsvp_activa: Boolean(
            data.evento.fecha_limite_rsvp_activa
          ),
          fecha_limite_rsvp: data.evento.fecha_limite_rsvp
            ? formatDateInput(data.evento.fecha_limite_rsvp)
            : "",
          color_secundario: data.evento.color_secundario || "#6C7EE1",
          imagen_portada: data.evento.imagen_portada || "",
          texto_boton_rsvp: "Confirmar Asistencia",
          modalidad_invitados: modNormalizada,
          permitir_acompanantes:
            data.evento.permitir_acompanantes ?? true,
          confirmar_acceso_qr:
            data.evento.confirmar_acceso_qr ??
            data.evento.permitir_acompanantes ??
            true,
          mesa_regalos_habilitada: Boolean(
            data.evento.mesa_regalos_habilitada ||
              (cfgRow && cfgRow.estado === "Activo")
          ),
          mesa_regalos_tienda: tiendaConfig,
          mesa_regalos_url: urlConfig,
          itinerario_habilitado: itinerarioHabilitadoCfg,
          recordatorio_dias: data.evento.recordatorio_dias ?? 3,
          recordatorio_activo: Boolean(data.evento.recordatorio_activo),
          recordatorio_horas: data.evento.recordatorio_horas ?? 12,
          recordatorio_horas_activo: Boolean(
            data.evento.recordatorio_horas_activo
          ),
          recordatorio_mensaje: normalizeConfirmedReminderMsg(
            data.evento.recordatorio_mensaje,
            Boolean(data.evento.recordatorio_horas_activo) &&
              !data.evento.recordatorio_activo
          ),
        });
        setReminderPreviewMode(
          Boolean(data.evento.recordatorio_horas_activo) &&
            !data.evento.recordatorio_activo
            ? "horas"
            : "dias"
        );
        setGuestForm((prev) => ({
          ...prev,
          modalidad_pase: modNormalizada,
        }));
        setCustomLinkForm((prev) => ({
          ...prev,
          modalidad: modNormalizada,
        }));
        setMetaWaForm({
          configured: Boolean(data.evento.whatsapp_api_configurado),
          wabaId: data.evento.whatsapp_api_waba_id || "",
          phoneNumberId: data.evento.whatsapp_api_phone_id || "",
          accessToken: "",
          tokenMasked: data.evento.whatsapp_api_token_masked || "",
          templateName:
            data.evento.whatsapp_api_template ||
            "recordatorio_evento_recuerdalo",
          templateLang: data.evento.whatsapp_api_lang || "es_MX",
          mode: data.evento.whatsapp_api_mode || "template",
        });
        setNuevoPropietarioEmail(data.evento.propietario_email || "");
      } catch (err) {
        console.error("Error cargando detalle del evento:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchDetail();
    return () => {
      active = false;
    };
  }, [selectedEventoId, draftEvento]);

  useEffect(() => {
    if (!invForm) return;
    const rawMsg = String(invForm.recordatorio_mensaje || "").trim();
    if (
      !rawMsg ||
      /confirma tu asistencia|enlace personalizado|\{nombre\}/i.test(rawMsg)
    ) {
      const isHoras =
        reminderPreviewMode === "horas" ||
        (Boolean(invForm.recordatorio_horas_activo) &&
          !invForm.recordatorio_activo);
      setInvForm((prev) =>
        prev
          ? {
              ...prev,
              recordatorio_mensaje: isHoras
                ? DEFAULT_CONFIRMED_REMINDER_HORAS
                : DEFAULT_CONFIRMED_REMINDER_DIAS,
            }
          : prev
      );
    }
  }, [invForm?.recordatorio_mensaje, reminderPreviewMode]);

  const lastAutoSaveSnapshotRef = useRef("");

  useEffect(() => {
    const idEv = detalle?.evento?.idevento;
    if (!idEv || !invForm) return;
    const cleanFechaEv = String(invForm.fecha_evento || "")
      .trim()
      .slice(0, 10);
    let cleanFechaLim = invForm.fecha_limite_rsvp_activa
      ? String(invForm.fecha_limite_rsvp || cleanFechaEv || "")
          .trim()
          .slice(0, 10)
      : "";
    if (cleanFechaLim && cleanFechaEv && cleanFechaLim > cleanFechaEv) {
      cleanFechaLim = cleanFechaEv;
    }
    let normalizedGiftUrl = String(invForm.mesa_regalos_url || "").trim();
    if (normalizedGiftUrl && !/^https?:\/\//i.test(normalizedGiftUrl)) {
      normalizedGiftUrl = `https://${normalizedGiftUrl}`;
    }
    const esNinguno =
      !invForm.estado_evento || invForm.estado_evento === "Ningúno";
    const autoPayload = {
      nombre: invForm.nombre || "",
      tipo_evento: invForm.tipo_evento || "Fiesta Privada",
      fecha_evento: cleanFechaEv,
      hora_evento: invForm.hora_evento || "20:00",
      lugar: invForm.lugar || "",
      direccion: invForm.direccion || "",
      estado_evento: esNinguno ? "Ningúno" : invForm.estado_evento,
      municipio: esNinguno ? "Ningúno" : invForm.municipio || "Ningúno",
      capacidad: Math.max(1, Number(invForm.capacidad || 100) || 100),
      presupuesto_meta: Number(invForm.presupuesto_meta || 0) || 0,
      mensaje_invitacion: invForm.mensaje_invitacion || "",
      codigo_vestimenta: invForm.codigo_vestimenta || "",
      plantilla_tema: invForm.plantilla_tema || "neon-crimson",
      color_acento: invForm.color_acento || "#6C7EE1",
      color_secundario: invForm.color_secundario || "#6C7EE1",
      imagen_portada: invForm.imagen_portada || "",
      texto_boton_rsvp: "Confirmar Asistencia",
      rsvp_habilitado: invForm.rsvp_habilitado !== false,
      permitir_acompanantes: Boolean(
        invForm.confirmar_acceso_qr ?? invForm.permitir_acompanantes ?? true
      ),
      confirmar_acceso_qr: Boolean(
        invForm.confirmar_acceso_qr ?? invForm.permitir_acompanantes ?? true
      ),
      modalidad_invitados: invForm.modalidad_invitados || "Adultos + Niños",
      mesa_regalos_habilitada: Boolean(invForm.mesa_regalos_habilitada),
      mesa_regalos_tienda: String(
        invForm.mesa_regalos_tienda ||
          detectStoreFromUrl(normalizedGiftUrl) ||
          "Amazon"
      ).trim(),
      mesa_regalos_url: normalizedGiftUrl,
      fecha_limite_rsvp_activa: Boolean(
        invForm.fecha_limite_rsvp_activa && cleanFechaLim
      ),
      fecha_limite_rsvp: cleanFechaLim,
      recordatorio_dias: invForm.recordatorio_dias ?? 3,
      recordatorio_activo: Boolean(invForm.recordatorio_activo),
      recordatorio_horas: invForm.recordatorio_horas ?? 12,
      recordatorio_horas_activo: Boolean(invForm.recordatorio_horas_activo),
      recordatorio_mensaje: invForm.recordatorio_mensaje || "",
    };

    const snapshot = JSON.stringify({ idEv, ...autoPayload });
    if (!lastAutoSaveSnapshotRef.current) {
      lastAutoSaveSnapshotRef.current = snapshot;
      return;
    }
    if (lastAutoSaveSnapshotRef.current === snapshot) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        lastAutoSaveSnapshotRef.current = snapshot;
        const { data } = await updateEventoRequest(idEv, autoPayload);
        setDetalle((prev) => (prev ? { ...prev, evento: data } : prev));
        if (onEventoUpdated) onEventoUpdated();
      } catch (err) {
        console.error("Error en autoguardado de evento:", err);
      }
    }, 1200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invForm, detalle?.evento?.idevento]);

  const csvPreviewRows = useMemo(() => parseCsvRows(csvText), [csvText]);
  const mapLocation = useGoogleMapsLocation(
    invForm?.lugar,
    invForm?.direccion
  );

  if ((!eventos || eventos.length === 0) && !draftEvento) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#E6E9F4] bg-white shadow-xs p-10 text-center">
        <h2 className="text-2xl font-bold text-[#2D3047]">
          Aún no tienes eventos activos
        </h2>
        <p className="mt-2 text-sm text-[#8E94A9]">
          Crea tu primer evento en el Wizard paso a paso para acceder al Gestor
          del Evento Activo (Diseño Virtual, Invitados y Confirmaciones, Difusión
          <span className="hidden">, Seating Chart</span> y Código QR).
        </p>
        <button
          type="button"
          onClick={onGoToWizard}
          className="btn-glow-red mt-6 rounded-xl bg-[#6C7EE1] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#5A6CD0]"
        >
          ➕ Crear Mi Primer Evento
        </button>
      </div>
    );
  }

  if (loading || !detalle || !invForm) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#8E94A9]">
          Cargando panel del evento activo...
        </p>
      </div>
    );
  }

  const { evento, invitados, logistica, presupuesto } = detalle;
  const tpl =
    PLANTILLAS.find((p) => p.id === invForm.plantilla_tema) || PLANTILLAS[0];

  const eventoSlug =
    String(invForm?.nombre || evento?.nombre || "evento")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "evento";
  const baseShareUrl = `${window.location.origin}/${eventoSlug}/e${
    evento.idevento || "nuevo"
  }`;
  const buildCustomInviteUrl = ({ modalidad, tipoPase, adultos, ninos }) => {
    const params = new URLSearchParams();
    if (modalidad) params.set("mod", modalidad);
    const paseClean =
      String(tipoPase || "GENERAL").toUpperCase() === "VIP" ? "VIP" : "GENERAL";
    params.set("tipo", paseClean);
    const numAd = Math.max(0, Number(adultos) || 0);
    const numNi = Math.max(0, Number(ninos) || 0);
    params.set("adultos", String(numAd));
    params.set("ninos", String(numNi));
    return `${baseShareUrl}?${params.toString()}`;
  };

  const customLinksItems = logistica
    .filter((i) => i.categoria === "link_invitacion")
    .map((item) => {
      let parsed = {};
      try {
        parsed = JSON.parse(item.detalle || "{}");
      } catch {
        parsed = {};
      }
      const modalidad = normalizeModalidad(
        parsed.modalidad ||
          item.estado ||
          invForm.modalidad_invitados
      );
      const tipoPase =
        String(parsed.tipoPase || item.fecha_limite || "GENERAL")
          .trim()
          .toUpperCase() === "VIP"
          ? "VIP"
          : "GENERAL";
      const soloAd = isSoloAdultosMod(modalidad);
      const soloNi = isSoloNinosMod(modalidad);
      const adultos = soloNi
        ? 0
        : Math.max(
            0,
            Number(parsed.adultos ?? item.capacidad_mesa ?? 0) || 0
          );
      const ninos = soloAd
        ? 0
        : Math.max(
            0,
            Number(parsed.ninos ?? item.hora_itinerario ?? 0) || 0
          );
      return {
        iditem: item.iditem,
        etiqueta: item.titulo || "Link Personalizado",
        modalidad,
        tipoPase,
        adultos,
        ninos,
        url: buildCustomInviteUrl({ modalidad, tipoPase, adultos, ninos }),
      };
    });

  const mesaRegalosItems = logistica
    .filter((i) => i.categoria === "mesa_regalo")
    .map(parseMesaRegaloItem);

  const allAvailableLinks = [
    {
      iditem: "principal",
      etiqueta: "Link General del Evento",
      modalidad: normalizeModalidad(invForm.modalidad_invitados),
      tipoPase: "GENERAL",
      adultos: 0,
      ninos: 0,
      url: baseShareUrl,
      isPrincipal: true,
    },
    ...customLinksItems,
  ];

  const selectedWhatsappLinkObj =
    allAvailableLinks.find(
      (l) => String(l.iditem) === String(selectedWhatsappLinkId)
    ) || allAvailableLinks[0];

  const selectedEmailLinkObj =
    allAvailableLinks.find(
      (l) => String(l.iditem) === String(selectedEmailLinkId)
    ) || allAvailableLinks[0];

  // Días restantes para el evento
  const diasParaEvento = Math.max(
    0,
    Math.ceil(
      (new Date(`${invForm.fecha_evento}T00:00:00`).getTime() - Date.now()) /
        86400000
    )
  );
  const todayMxPreviewStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const isPreviewFechaLimiteVencida = Boolean(
    invForm.fecha_limite_rsvp_activa &&
      invForm.fecha_limite_rsvp &&
      todayMxPreviewStr > String(invForm.fecha_limite_rsvp).slice(0, 10)
  );

  // =========================================================================
  // CÁLCULOS ESTADÍSTICOS Y LÍMITE DE INVITADOS PERMITIDOS (TAB A, B, C, D, E)
  // =========================================================================
  const isRejected = (status) =>
    status === "Rechazado" || status === "Declinado";

  const totalInvitadosCount = invitados.length;
  const confirmadosList = invitados.filter(
    (g) => g.estado_rsvp === "Confirmado"
  );
  const rechazadosList = invitados.filter((g) => isRejected(g.estado_rsvp));
  const pendientesList = invitados.filter((g) => g.estado_rsvp === "Pendiente");
  const invitadosEnviadosList = invitados.filter((g) =>
    Boolean(g.invitacion_enviada)
  );

  const totalAdultos = invitados.reduce(
    (acc, g) => acc + Number(g.adultos ?? g.pases ?? 1),
    0
  );
  const totalNinos = invitados.reduce((acc, g) => acc + Number(g.ninos ?? 0), 0);
  const totalPasesLista = invitados.reduce(
    (acc, g) => acc + Number(g.pases || 1),
    0
  );
  const pasesConfirmadosCount = confirmadosList.reduce(
    (acc, g) => acc + Number(g.pases || 1),
    0
  );
  const invitadosEnviadosCount = invitadosEnviadosList.length;
  const pasesEnviadosCount = invitadosEnviadosList.reduce(
    (acc, g) => acc + Number(g.pases || 1),
    0
  );
  const menusEspecialesCount = invitados.filter(
    (g) => g.nota_alimentacion && g.nota_alimentacion.trim().length > 0
  ).length;

  const limiteInvitadosPermitidos = Math.max(
    1,
    Number(invForm.capacidad ?? evento.capacidad ?? 100) || 100
  );
  const maximoActualInvitadosOPases = Math.max(
    totalPasesLista,
    totalInvitadosCount,
    pasesEnviadosCount,
    invitadosEnviadosCount
  );
  const isGuestLimitExceeded =
    maximoActualInvitadosOPases > limiteInvitadosPermitidos;
  const excedenteInvitadosActual = Math.max(
    0,
    maximoActualInvitadosOPases - limiteInvitadosPermitidos
  );

  const validateAndWarnBeforeShare = ({
    canal = "WhatsApp / Correo",
    destinatarioLabel = "Invitado",
    proyectadoInvitados = totalInvitadosCount,
    proyectadoPases = totalPasesLista,
    enviadosDespuesInvitados = invitadosEnviadosCount,
    enviadosDespuesPases = pasesEnviadosCount,
    onProceed,
  }) => {
    const maxEvaluado = Math.max(
      proyectadoPases,
      proyectadoInvitados,
      enviadosDespuesPases,
      enviadosDespuesInvitados
    );
    if (maxEvaluado > limiteInvitadosPermitidos) {
      const excedente = maxEvaluado - limiteInvitadosPermitidos;
      showNotice(
        `⚠️ Advertencia: Se ha sobrepasado el límite de ${limiteInvitadosPermitidos} invitados permitidos en la configuración del evento (+${excedente} adicional${
          excedente === 1 ? "" : "es"
        }).`
      );
      setGuestLimitWarningModal({
        canal,
        destinatarioLabel,
        limitePermitido: limiteInvitadosPermitidos,
        totalInvitadosLista: totalInvitadosCount,
        totalPasesLista,
        invitadosEnviadosActuales: invitadosEnviadosCount,
        pasesEnviadosActuales: pasesEnviadosCount,
        proyectadoInvitados: Math.max(
          proyectadoInvitados,
          enviadosDespuesInvitados
        ),
        proyectadoPases: Math.max(proyectadoPases, enviadosDespuesPases),
        excedente,
        onProceed,
      });
      return false;
    }
    if (typeof onProceed === "function") {
      onProceed();
    }
    return true;
  };

  // =========================================================================
  // HANDLERS: EVENTO / INVITACIÓN / AJUSTES
  // =========================================================================
  const handleSaveEvento = async (e, customPatch = null) => {
    e?.preventDefault();
    const rawPayload = customPatch ? { ...invForm, ...customPatch } : invForm;
    let normalizedGiftUrl = String(rawPayload.mesa_regalos_url || "").trim();
    if (normalizedGiftUrl && !/^https?:\/\//i.test(normalizedGiftUrl)) {
      normalizedGiftUrl = `https://${normalizedGiftUrl}`;
    }
    const esNinguno =
      !rawPayload.estado_evento || rawPayload.estado_evento === "Ningúno";
    const cleanFechaEv = String(rawPayload.fecha_evento || "")
      .trim()
      .slice(0, 10);
    let cleanFechaLim = rawPayload.fecha_limite_rsvp_activa
      ? String(rawPayload.fecha_limite_rsvp || cleanFechaEv || "")
          .trim()
          .slice(0, 10)
      : "";
    if (cleanFechaLim && cleanFechaEv && cleanFechaLim > cleanFechaEv) {
      cleanFechaLim = cleanFechaEv;
    }
    const payload = {
      ...rawPayload,
      texto_boton_rsvp: "Confirmar Asistencia",
      capacidad: Math.max(
        1,
        Number(rawPayload.capacidad ?? evento?.capacidad ?? 100) || 100
      ),
      estado_evento: esNinguno ? "Ningúno" : rawPayload.estado_evento,
      municipio: esNinguno ? "Ningúno" : rawPayload.municipio || "Ningúno",
      mesa_regalos_tienda: String(
        rawPayload.mesa_regalos_tienda ||
          detectStoreFromUrl(normalizedGiftUrl) ||
          "Amazon"
      ).trim(),
      mesa_regalos_url: normalizedGiftUrl,
      fecha_limite_rsvp_activa: Boolean(
        rawPayload.fecha_limite_rsvp_activa && cleanFechaLim
      ),
      fecha_limite_rsvp: cleanFechaLim,
    };
    try {
      if (!evento.idevento) {
        const draftGifts = logistica.filter(
          (i) => i.categoria === "mesa_regalo"
        );
        const { data } = await createEventoRequest({
          ...payload,
          regalos_iniciales: draftGifts,
        });
        showNotice("✓ Evento guardado correctamente.");
        if (onDraftSaved) {
          await onDraftSaved(data);
        } else {
          onEventoUpdated();
        }
        return data;
      }
      const { data } = await updateEventoRequest(evento.idevento, payload);
      setDetalle((prev) => ({ ...prev, evento: data }));
      setInvForm({
        ...data,
        estado_evento: data.estado_evento || payload.estado_evento || "Ningúno",
        municipio: data.municipio || payload.municipio || "Ningúno",
        fecha_evento: formatDateInput(data.fecha_evento),
        fecha_limite_rsvp_activa: Boolean(
          data.fecha_limite_rsvp_activa ?? payload.fecha_limite_rsvp_activa
        ),
        fecha_limite_rsvp:
          data.fecha_limite_rsvp_activa ?? payload.fecha_limite_rsvp_activa
            ? String(
                data.fecha_limite_rsvp || payload.fecha_limite_rsvp || ""
              )
                .trim()
                .slice(0, 10)
            : "",
        confirmar_acceso_qr:
          data.confirmar_acceso_qr ?? data.permitir_acompanantes ?? true,
        mesa_regalos_habilitada: Boolean(data.mesa_regalos_habilitada),
        mesa_regalos_tienda:
          data.mesa_regalos_tienda || payload.mesa_regalos_tienda || "Amazon",
        mesa_regalos_url:
          data.mesa_regalos_url ?? payload.mesa_regalos_url ?? "",
        itinerario_habilitado: Boolean(
          data.itinerario_habilitado ??
            payload.itinerario_habilitado ??
            invForm.itinerario_habilitado
        ),
        recordatorio_horas:
          data.recordatorio_horas ?? payload.recordatorio_horas ?? 12,
        recordatorio_horas_activo: Boolean(
          data.recordatorio_horas_activo ?? payload.recordatorio_horas_activo
        ),
      });
      if (!customPatch && invForm.itinerario_habilitado) {
        await handleSaveItinerarioEvento({ silent: true });
      }
      onEventoUpdated();
      showNotice("✓ Evento guardado correctamente.");
      return data;
    } catch (err) {
      showNotice(
        err.response?.data?.message ||
          "Error al guardar el evento"
      );
      return null;
    }
  };

  // =========================================================================
  // HANDLERS: ITINERARIO DE EVENTO (CONFIGURACIÓN)
  // =========================================================================
  const syncItinerarioConfigRow = async (checked) => {
    if (!evento?.idevento) return;
    const currentLogistica = detalle?.logistica || [];
    const existingCfg = currentLogistica.find(
      (i) => i.categoria === "itinerario_config"
    );
    const estadoVal = checked ? "Activo" : "Inactivo";
    try {
      if (existingCfg?.iditem) {
        const { data } = await updateLogisticaRequest(
          evento.idevento,
          existingCfg.iditem,
          {
            titulo: "Configuración Itinerario de Evento",
            estado: estadoVal,
          }
        );
        setDetalle((prev) => ({
          ...prev,
          logistica: (prev.logistica || []).map((i) =>
            i.iditem === existingCfg.iditem ? data : i
          ),
        }));
      } else {
        const { data } = await addLogisticaRequest(evento.idevento, {
          categoria: "itinerario_config",
          titulo: "Configuración Itinerario de Evento",
          detalle: "",
          estado: estadoVal,
        });
        setDetalle((prev) => ({
          ...prev,
          logistica: [...(prev.logistica || []), data],
        }));
      }
    } catch (err) {
      console.error("Error guardando configuración de itinerario:", err);
    }
  };

  const handleToggleItinerarioHabilitado = async (checked) => {
    setItinerarioError("");
    setInvForm((prev) => ({
      ...prev,
      itinerario_habilitado: checked,
    }));
    if (checked && (!itinerarioItems || itinerarioItems.length === 0)) {
      setItinerarioItems([
        {
          iditem: null,
          localId: `init-${Date.now()}`,
          horario_inicial: invForm.hora_evento || "20:00",
          horario_final: "21:00",
          titulo: "",
          descripcion: "",
        },
      ]);
    }
    await syncItinerarioConfigRow(checked);
  };

  const handleUpdateItinerarioField = (idx, field, value) => {
    if (itinerarioError) setItinerarioError("");
    setItinerarioItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleAddItinerarioActividad = () => {
    setItinerarioError("");
    setItinerarioItems((prev) => {
      const lastItem = prev[prev.length - 1];
      const nextStart = lastItem?.horario_final || "";
      return [
        ...prev,
        {
          iditem: null,
          localId: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          horario_inicial: nextStart,
          horario_final: "",
          titulo: "",
          descripcion: "",
        },
      ];
    });
  };

  const handleRemoveItinerarioActividad = async (idx) => {
    setItinerarioError("");
    const target = itinerarioItems[idx];
    if (target?.iditem && evento?.idevento) {
      try {
        await deleteLogisticaRequest(evento.idevento, target.iditem);
        setDetalle((prev) => ({
          ...prev,
          logistica: (prev.logistica || []).filter(
            (i) => i.iditem !== target.iditem
          ),
        }));
      } catch {
        showNotice("No se pudo eliminar la actividad del itinerario.");
        return;
      }
    }
    setItinerarioItems((prev) => {
      if (prev.length <= 1) {
        return [
          {
            iditem: null,
            localId: `init-${Date.now()}`,
            horario_inicial: invForm.hora_evento || "20:00",
            horario_final: "21:00",
            titulo: "",
            descripcion: "",
          },
        ];
      }
      return prev.filter((_, i) => i !== idx);
    });
    if (target?.iditem) {
      showNotice("✓ Actividad eliminada del itinerario.");
    }
  };

  const handleSaveItinerarioEvento = async ({ silent = false } = {}) => {
    if (!evento?.idevento) return;
    setItinerarioError("");

    const validRows = itinerarioItems.filter(
      (item) =>
        String(item.titulo || "").trim() ||
        String(item.descripcion || "").trim() ||
        item.iditem
    );

    if (!silent && validRows.length === 0) {
      setItinerarioError(
        "Por favor ingresa al menos el Título de Actividad para guardar el itinerario."
      );
      return;
    }

    const missingTitle = validRows.some(
      (item) => !String(item.titulo || "").trim()
    );
    if (!silent && missingTitle) {
      setItinerarioError(
        "Completa el campo «Título de Actividad» en las actividades del itinerario."
      );
      return;
    }

    try {
      setSavingItinerario(true);
      await syncItinerarioConfigRow(Boolean(invForm.itinerario_habilitado));

      const updatedItems = [...itinerarioItems];
      let nextLogistica = [...(detalle?.logistica || [])];

      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        const cleanTitulo = String(item.titulo || "").trim();
        const cleanDesc = String(item.descripcion || "").trim();
        const cleanIni = String(item.horario_inicial || "").trim();
        const cleanFin = String(item.horario_final || "").trim();

        if (!cleanTitulo && !cleanDesc && !item.iditem) {
          continue;
        }

        const payloadItem = {
          categoria: "itinerario_evento",
          hora_itinerario: cleanIni,
          fecha_limite: cleanFin,
          titulo: cleanTitulo || "Actividad de itinerario",
          detalle: cleanDesc,
          capacidad_mesa: i + 1,
          estado: "Activo",
        };

        if (item.iditem) {
          const { data } = await updateLogisticaRequest(
            evento.idevento,
            item.iditem,
            payloadItem
          );
          updatedItems[i] = {
            ...item,
            iditem: data.iditem,
          };
          nextLogistica = nextLogistica.map((row) =>
            row.iditem === data.iditem ? data : row
          );
        } else {
          const { data } = await addLogisticaRequest(
            evento.idevento,
            payloadItem
          );
          updatedItems[i] = {
            ...item,
            iditem: data.iditem,
          };
          nextLogistica.push(data);
        }
      }

      setItinerarioItems(updatedItems);
      setDetalle((prev) => ({
        ...prev,
        logistica: nextLogistica,
      }));
      if (!silent) {
        showNotice("✓ Itinerario de evento guardado correctamente.");
      }
    } catch (err) {
      if (!silent) {
        setItinerarioError(
          err.response?.data?.message ||
            "No se pudo guardar el itinerario del evento."
        );
      }
    } finally {
      setSavingItinerario(false);
    }
  };

  const ensureRealShareUrl = async () => {
    if (evento.idevento) return baseShareUrl;
    const saved = await handleSaveEvento(null);
    if (saved?.idevento) {
      return `${window.location.origin}/${eventoSlug}/e${saved.idevento}`;
    }
    return null;
  };

  const handlePosterFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const img = new window.Image();
      img.onload = async () => {
        const maxW = 1000;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setInvForm((prev) => ({ ...prev, imagen_portada: compressedDataUrl }));
        if (evento?.idevento) {
          await handleSaveEvento(null, { imagen_portada: compressedDataUrl });
          showNotice("✓ Imagen/póster optimizado y guardado en la invitación.");
        } else {
          showNotice("✓ Imagen/póster optimizado y cargado en la vista previa.");
        }
      };
      img.onerror = async () => {
        const rawDataUrl = reader.result;
        setInvForm((prev) => ({ ...prev, imagen_portada: rawDataUrl }));
        if (evento?.idevento) {
          await handleSaveEvento(null, { imagen_portada: rawDataUrl });
          showNotice("✓ Imagen/póster cargado y guardado en la invitación.");
        } else {
          showNotice("✓ Imagen/póster cargado en la vista previa.");
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDuplicateEvento = async () => {
    try {
      const { data } = await duplicarEventoRequest(evento.idevento);
      showNotice(`✓ Evento duplicado: "${data.nombre}"`);
      if (onEventoDuplicated) {
        await onEventoDuplicated(data.idevento);
      } else {
        onEventoUpdated();
      }
    } catch {
      showNotice("No se pudo duplicar el evento");
    }
  };

  const handleTogglePauseRsvp = async () => {
    const nextState = !invForm.rsvp_habilitado;
    setInvForm((prev) => ({ ...prev, rsvp_habilitado: nextState }));
    await handleSaveEvento(null, { rsvp_habilitado: nextState });
  };

  const handleCambiarPropietario = async (e) => {
    e.preventDefault();
    if (!nuevoPropietarioEmail.trim()) return;
    try {
      const { data } = await cambiarPropietarioRequest(evento.idevento, {
        nuevoCorreo: nuevoPropietarioEmail,
        transferirCuenta,
      });
      showNotice(`✓ ${data.message}`);
      if (data.transferido) {
        onEventoDeleted(evento.idevento);
      } else if (data.evento) {
        setDetalle((prev) => ({ ...prev, evento: data.evento }));
        onEventoUpdated();
      }
    } catch {
      showNotice("Error al actualizar el propietario del evento");
    }
  };

  const handleDeleteEvento = async () => {
    if (onRequestDeleteEvento && evento?.idevento) {
      onRequestDeleteEvento(evento);
      return;
    }
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar permanentemente el evento "${evento.nombre}" y todos sus registros?`
      )
    ) {
      return;
    }
    try {
      await deleteEventoRequest(evento.idevento);
      onEventoDeleted(evento.idevento);
    } catch {
      showNotice("No se pudo eliminar el evento");
    }
  };

  // =========================================================================
  // HANDLERS: INVITADOS Y RSVP (TAB B)
  // =========================================================================
  const handleChangeModalidadInvitados = async (nuevaModalidad) => {
    setInvForm((prev) => ({ ...prev, modalidad_invitados: nuevaModalidad }));
    setGuestForm((prev) => ({
      ...prev,
      modalidad_pase: nuevaModalidad,
      adultos: isSoloNinosMod(nuevaModalidad) ? 0 : prev.adultos,
      ninos: isSoloAdultosMod(nuevaModalidad) ? 0 : prev.ninos,
    }));
    try {
      const { data } = await updateEventoRequest(evento.idevento, {
        ...invForm,
        modalidad_invitados: nuevaModalidad,
      });
      setDetalle((prev) => ({ ...prev, evento: data }));
      onEventoUpdated();
      showNotice(
        `✓ "${nuevaModalidad}" seleccionado y notificado en la tarjeta de invitación.`
      );
    } catch {
      showNotice("No se pudo actualizar la modalidad en la invitación");
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!guestForm.nombre.trim()) return;
    const totalPases = Math.max(
      1,
      Number(guestForm.adultos || 0) + Number(guestForm.ninos || 0)
    );
    try {
      const { data } = await addInvitadoRequest(evento.idevento, {
        ...guestForm,
        pases: totalPases,
      });
      setDetalle((prev) => ({
        ...prev,
        invitados: [data, ...prev.invitados],
      }));
      setGuestForm({
        nombre: "",
        telefono: "",
        correo: "",
        grupo: "Amigos",
        modalidad_pase: normalizeModalidad(invForm.modalidad_invitados),
        adultos: 1,
        ninos: 0,
        estado_rsvp: "Pendiente",
        mesa_asignada: "Sin asignar",
        nota_alimentacion: "",
      });
      onEventoUpdated();
      const nuevoTotalPases = totalPasesLista + totalPases;
      const nuevoTotalInvitados = totalInvitadosCount + 1;
      if (
        nuevoTotalPases > limiteInvitadosPermitidos ||
        nuevoTotalInvitados > limiteInvitadosPermitidos
      ) {
        showNotice(
          `⚠️ Invitado agregado. Atención: Tu lista (${nuevoTotalInvitados} invitados / ${nuevoTotalPases} pases) supera el límite configurado de ${limiteInvitadosPermitidos} invitados permitidos.`
        );
      } else {
        showNotice("✓ Invitado agregado a la lista.");
      }
    } catch {
      showNotice("Error al agregar invitado");
    }
  };

  const handleImportCsv = async () => {
    if (csvPreviewRows.length === 0) {
      showNotice("Agrega o carga filas válidas para importar.");
      return;
    }
    try {
      const { data } = await importarInvitadosRequest(evento.idevento, {
        invitados: csvPreviewRows,
      });
      setDetalle((prev) => ({ ...prev, invitados: data }));
      setCsvText("");
      setAddMode("individual");
      onEventoUpdated();
      const importedList = Array.isArray(data) ? data : [];
      const importedPases = importedList.reduce(
        (acc, g) => acc + Number(g.pases || 1),
        0
      );
      if (
        importedPases > limiteInvitadosPermitidos ||
        importedList.length > limiteInvitadosPermitidos
      ) {
        showNotice(
          `⚠️ Se importaron ${csvPreviewRows.length} invitados. Atención: El total (${importedList.length} invitados / ${importedPases} pases) supera el límite de ${limiteInvitadosPermitidos} permitidos.`
        );
      } else {
        showNotice(
          `✓ Se importaron ${csvPreviewRows.length} invitados correctamente.`
        );
      }
    } catch {
      showNotice("Error al importar invitados desde CSV/Excel");
    }
  };

  const handleCsvFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCsvText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadCsvTemplate = () => {
    const sample = [
      "Nombre,Telefono,Email,Grupo,Adultos,Ninos,Requerimientos,Estado",
      "Carlos Mendoza,+525512345678,carlos@email.com,VIP,2,0,Sin gluten,Confirmado",
      "Laura Gómez,+525598765432,laura@email.com,Familia,2,1,Menú infantil,Pendiente",
      "Roberto Díaz,+525544332211,roberto@email.com,Amigos,1,0,Vegetariano,Pendiente",
    ].join("\n");
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantilla_invitados_evento_${evento.idevento}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateGuest = async (idInvitado, patch) => {
    try {
      const { data } = await updateInvitadoRequest(
        evento.idevento,
        idInvitado,
        patch
      );
      setDetalle((prev) => ({
        ...prev,
        invitados: prev.invitados.map((g) =>
          g.idinvitado === idInvitado ? data : g
        ),
      }));
      onEventoUpdated();
    } catch {
      showNotice("No se pudo actualizar el invitado");
    }
  };

  const handleOpenEditGuest = (guest) => {
    setEditingGuest({
      idinvitado: guest.idinvitado,
      nombre: guest.nombre || "",
      telefono: guest.telefono || "",
      correo: guest.correo || "",
      grupo: guest.grupo || "Amigos",
      estado_rsvp: isRejected(guest.estado_rsvp)
        ? "Rechazado"
        : guest.estado_rsvp || "Pendiente",
      modalidad_pase: normalizeModalidad(
        guest.modalidad_pase || invForm.modalidad_invitados
      ),
      adultos: guest.adultos ?? guest.pases ?? 1,
      ninos: guest.ninos ?? 0,
      mesa_asignada: guest.mesa_asignada || "Sin asignar",
      nota_alimentacion: guest.nota_alimentacion || "",
    });
  };

  const handleSaveEditedGuest = async (e) => {
    e.preventDefault();
    if (!editingGuest || !editingGuest.nombre.trim()) return;
    const soloAd = isSoloAdultosMod(editingGuest.modalidad_pase);
    const soloNi = isSoloNinosMod(editingGuest.modalidad_pase);
    const numAd = soloNi ? 0 : Math.max(0, Number(editingGuest.adultos) || 0);
    const numNi = soloAd ? 0 : Math.max(0, Number(editingGuest.ninos) || 0);
    const totalPases = Math.max(1, numAd + numNi);

    await handleUpdateGuest(editingGuest.idinvitado, {
      nombre: editingGuest.nombre.trim(),
      telefono: editingGuest.telefono.trim(),
      correo: editingGuest.correo.trim(),
      grupo: editingGuest.grupo,
      estado_rsvp: editingGuest.estado_rsvp,
      modalidad_pase: editingGuest.modalidad_pase,
      adultos: numAd,
      ninos: numNi,
      pases: totalPases,
      mesa_asignada: editingGuest.mesa_asignada,
      nota_alimentacion: editingGuest.nota_alimentacion.trim(),
    });
    showNotice(`✓ Datos de "${editingGuest.nombre.trim()}" actualizados.`);
    setEditingGuest(null);
  };

  const handleDeleteGuest = async (idInvitado) => {
    try {
      await deleteInvitadoRequest(evento.idevento, idInvitado);
      setDetalle((prev) => ({
        ...prev,
        invitados: prev.invitados.filter((g) => g.idinvitado !== idInvitado),
      }));
      onEventoUpdated();
    } catch {
      showNotice("No se pudo eliminar el invitado");
    }
  };

  // =========================================================================
  // HANDLERS: DIFUSIÓN Y RECORDATORIOS (TAB C)
  // =========================================================================
  const formatGuestMessage = (
    templateStr,
    guest,
    customUrl = null,
    options = {}
  ) => {
    const link = customUrl || baseShareUrl;
    const isHoras = options.mode === "horas";
    const diasVal =
      options.dias !== undefined
        ? Number(options.dias)
        : Number(invForm?.recordatorio_dias ?? diasParaEvento ?? 3);
    const horasVal =
      options.horas !== undefined
        ? Number(options.horas)
        : Number(invForm?.recordatorio_horas ?? 12);
    let msg = String(templateStr || "");
    if (options.adaptCountdown) {
      if (isHoras) {
        msg = msg
          .replace(/\{dias\}\s*d[ií]as?/gi, "{horas} horas")
          .replace(/faltan\s+\d+\s*d[ií]as?/gi, `faltan ${horasVal} horas`);
      } else {
        msg = msg
          .replace(/\{horas\}\s*horas?/gi, "{dias} días")
          .replace(/faltan\s+\d+\s*horas?/gi, `faltan ${diasVal} días`);
      }
    }
    return msg
      .replaceAll("{nombre}", guest?.nombre || "Invitado Confirmado")
      .replaceAll("{evento}", invForm?.nombre || evento.nombre)
      .replaceAll(
        "{fecha}",
        formatDateInput(invForm?.fecha_evento || evento.fecha_evento)
      )
      .replaceAll(
        "{hora}",
        invForm?.hora_evento || evento.hora_evento || "20:00"
      )
      .replaceAll(
        "{lugar}",
        invForm?.lugar || evento.lugar || "Salón Principal"
      )
      .replaceAll(
        "{dias}",
        String(options.useConfiguredCountdown ? diasVal : diasParaEvento)
      )
      .replaceAll("{horas}", String(horasVal))
      .replaceAll(
        "{tiempo}",
        isHoras
          ? `${horasVal} ${horasVal === 1 ? "hora" : "horas"}`
          : `${diasVal} ${diasVal === 1 ? "día" : "días"}`
      )
      .replaceAll("{enlace}", link);
  };

  const handleSwitchReminderMode = (targetMode) => {
    setReminderPreviewMode(targetMode);
    setInvForm((p) => {
      const current = String(p.recordatorio_mensaje || "");
      const adapted =
        targetMode === "horas"
          ? current.replace(/\{dias\}\s*d[ií]as?/gi, "{horas} horas")
          : current.replace(/\{horas\}\s*horas?/gi, "{dias} días");
      return {
        ...p,
        recordatorio_mensaje: adapted,
      };
    });
  };

  const activeEmailTemplate =
    EMAIL_HTML_TEMPLATES.find((t) => t.id === selectedHtmlTemplate) ||
    EMAIL_HTML_TEMPLATES[0];

  const previewGuestObj =
    invitados.find((g) => String(g.idinvitado) === String(previewGuestId)) ||
    null;

  const buildEmailHtmlCode = (guest) => {
    const link = selectedEmailLinkObj?.url || baseShareUrl;
    const guestName = guest?.nombre || "Invitado Especial";
    const modalidade = normalizeModalidad(
      selectedEmailLinkObj && !selectedEmailLinkObj.isPrincipal
        ? selectedEmailLinkObj.modalidad
        : guest?.modalidad_pase ||
          invForm?.modalidad_invitados ||
          evento.modalidad_invitados
    );
    const pasesCount =
      selectedEmailLinkObj &&
      !selectedEmailLinkObj.isPrincipal &&
      selectedEmailLinkObj.adultos + selectedEmailLinkObj.ninos > 0
        ? selectedEmailLinkObj.adultos + selectedEmailLinkObj.ninos
        : guest?.pases || 2;
    const btnText = "Confirmar Asistencia";

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${formatGuestMessage(activeEmailTemplate.subject, guest, link)}</title>
</head>
<body style="margin:0;padding:24px;background-color:#0F1A45;font-family:Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background-color:#142257;border:1px solid ${activeEmailTemplate.accentHex};border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:28px 24px;text-align:center;background:linear-gradient(135deg,#1c0810,#081921);">
        <div style="font-size:11px;font-weight:bold;letter-spacing:3px;color:${activeEmailTemplate.badgeColor};text-transform:uppercase;">
          ${activeEmailTemplate.badge} • ${evento.tipo_evento || "Evento Exclusivo"}
        </div>
        <h1 style="margin:10px 0 6px;font-size:28px;text-transform:uppercase;color:#ffffff;">
          ${evento.nombre}
        </h1>
        <p style="margin:0;font-size:14px;color:#d1d5db;">
          ¡Hola <strong>${guestName}</strong>! ${invForm?.mensaje_bienvenida || "Estás cordialmente invitado(a) a celebrar con nosotros."}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;text-align:center;">
        <p style="margin:0 0 12px;font-size:13px;color:#e5e7eb;">
          📅 <strong>Fecha:</strong> ${formatDateInput(evento.fecha_evento)} &nbsp;|&nbsp;
          ⏰ <strong>Hora:</strong> ${evento.hora_evento || "20:00"} hrs
        </p>
        ${
          invForm?.fecha_limite_rsvp_activa && invForm?.fecha_limite_rsvp
            ? `<p style="margin:0 0 12px;font-size:13px;color:#fde68a;">⏳ <strong>Fecha límite para confirmar:</strong> ${formatDateInput(invForm.fecha_limite_rsvp)}</p>`
            : ""
        }
        <p style="margin:0 0 12px;font-size:13px;color:#e5e7eb;">
          📍 <strong>Lugar:</strong> ${evento.lugar || "Salón VIP"} &nbsp;|&nbsp;
          👔 <strong>Código de Vestimenta:</strong> ${invForm?.codigo_vestimenta || "Formal / Libre"}
        </p>
        <div style="margin:16px auto;padding:10px 14px;background-color:rgba(21,178,245,0.1);border:1px solid rgba(21,178,245,0.35);border-radius:10px;display:inline-block;font-size:12px;color:#6C7EE1;">
          🔔 <strong>Modalidad de Asistencia:</strong> ${modalidade} (${pasesCount} pases)
        </div>
        <div style="margin-top:22px;">
          <a href="${link}" style="display:inline-block;padding:12px 28px;background-color:${activeEmailTemplate.accentHex};color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;border-radius:10px;text-transform:uppercase;letter-spacing:1px;">
            ${btnText}
          </a>
        </div>
        <p style="margin-top:18px;font-size:11px;color:#9ca3af;">
          Enlace directo a tu pase digital: <a href="${link}" style="color:${activeEmailTemplate.badgeColor};">${link}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const executeSendDirectEmail = async (guest) => {
    const emailDestino = String(guest.correo || "").trim();
    if (!emailDestino || !emailDestino.includes("@")) {
      showNotice(
        `⚠️ El invitado "${guest.nombre}" no tiene un correo electrónico válido registrado.`
      );
      return;
    }

    const link = selectedEmailLinkObj?.url || baseShareUrl;
    const subject = formatGuestMessage(
      activeEmailTemplate.subject,
      guest,
      link
    );
    const bodyText = formatGuestMessage(whatsappMsg, guest, link);
    const htmlCode = buildEmailHtmlCode(guest);

    try {
      showNotice(`⏳ Enviando correo HTML a ${emailDestino}...`);
      const { data } = await enviarCorreoIndividualRequest(
        evento.idevento,
        guest.idinvitado,
        {
          subject,
          html: htmlCode,
          text: bodyText,
          linkUrl: link,
          templateId: selectedHtmlTemplate,
          canal: broadcastChannel || "Email HTML",
        }
      );
      if (data?.invitado) {
        setDetalle((prev) => ({
          ...prev,
          invitados: prev.invitados.map((g) =>
            g.idinvitado === guest.idinvitado ? data.invitado : g
          ),
        }));
      }
      onEventoUpdated();
      showNotice(
        `✓ Correo HTML enviado exitosamente a ${emailDestino} desde notificaciones@recuerdalo.com.mx`
      );
    } catch (err) {
      showNotice(
        err.response?.data?.message ||
          `Error al enviar correo a ${emailDestino}`
      );
    }
  };

  const handleRequestDirectEmail = (guest) => {
    const guestPases = Math.max(1, Number(guest?.pases || 1));
    const isNewSend = !guest?.invitacion_enviada;
    validateAndWarnBeforeShare({
      canal: "Correo Electrónico",
      destinatarioLabel: `${guest.nombre} (${
        guest.correo || "Sin correo"
      } • ${guestPases} pase${guestPases === 1 ? "" : "s"})`,
      proyectadoInvitados: totalInvitadosCount,
      proyectadoPases: totalPasesLista,
      enviadosDespuesInvitados: invitadosEnviadosCount + (isNewSend ? 1 : 0),
      enviadosDespuesPases: pasesEnviadosCount + (isNewSend ? guestPases : 0),
      onProceed: () => setConfirmDirectEmailGuest(guest),
    });
  };

  const handleSendDirectEmail = async (guest) => {
    await executeSendDirectEmail(guest);
  };

  const executeSendWhatsApp = async (guest) => {
    const text = formatGuestMessage(
      whatsappMsg,
      guest,
      selectedWhatsappLinkObj?.url || baseShareUrl
    );
    const cleanPhone = String(guest.telefono || "").replace(/\D/g, "");
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    await handleUpdateGuest(guest.idinvitado, {
      invitacion_enviada: true,
      canal_ultimo_envio: "WhatsApp",
    });
  };

  const handleSendWhatsApp = (guest) => {
    const guestPases = Math.max(1, Number(guest?.pases || 1));
    const isNewSend = !guest?.invitacion_enviada;
    validateAndWarnBeforeShare({
      canal: "WhatsApp Directo",
      destinatarioLabel: `${guest.nombre} (${
        guest.telefono || "Enlace directo"
      } • ${guestPases} pase${guestPases === 1 ? "" : "s"})`,
      proyectadoInvitados: totalInvitadosCount,
      proyectadoPases: totalPasesLista,
      enviadosDespuesInvitados: invitadosEnviadosCount + (isNewSend ? 1 : 0),
      enviadosDespuesPases: pasesEnviadosCount + (isNewSend ? guestPases : 0),
      onProceed: () => {
        executeSendWhatsApp(guest);
      },
    });
  };

  const executeBroadcastMasivo = async ({
    soloPendientes = false,
    canal = broadcastChannel,
    estadoFiltro = null,
  }) => {
    try {
      showNotice(`⏳ Procesando envío masivo de correos por ${canal}...`);
      const link = selectedEmailLinkObj?.url || baseShareUrl;
      const modalidadOverride =
        selectedEmailLinkObj && !selectedEmailLinkObj.isPrincipal
          ? selectedEmailLinkObj.modalidad
          : "";
      const pasesOverride =
        selectedEmailLinkObj &&
        !selectedEmailLinkObj.isPrincipal &&
        selectedEmailLinkObj.adultos + selectedEmailLinkObj.ninos > 0
          ? selectedEmailLinkObj.adultos + selectedEmailLinkObj.ninos
          : 0;

      const { data } = await enviarDifusionRequest(evento.idevento, {
        soloPendientes,
        canal,
        estadoFiltro,
        linkUrl: link,
        templateId: selectedHtmlTemplate,
        modalidadOverride,
        pasesOverride,
      });

      const updatedInvitados = Array.isArray(data)
        ? data
        : data?.invitados || [];
      setDetalle((prev) => ({ ...prev, invitados: updatedInvitados }));
      onEventoUpdated();

      if (data && typeof data.enviadosCount === "number") {
        if (data.enviadosCount === 0 && data.erroresCount > 0) {
          showNotice(
            `⚠️ No se pudo enviar el correo (${data.erroresCount} error(es)): ${
              data.ultimoError || "Verifica la conexión SMTP"
            }`
          );
        } else {
          showNotice(
            `✓ Se enviaron ${data.enviadosCount} correo(s) HTML exitosamente desde notificaciones@recuerdalo.com.mx${
              data.sinCorreoCount > 0
                ? ` (${data.sinCorreoCount} sin correo registrado)`
                : ""
            }${
              data.erroresCount > 0
                ? ` • ${data.erroresCount} con error`
                : ""
            }.`
          );
        }
      } else {
        showNotice(
          estadoFiltro === "Pendiente"
            ? `✓ Recordatorio disparado por ${canal} a todos los invitados Pendientes.`
            : `✓ Campaña masiva enviada por ${canal}.`
        );
      }
    } catch (err) {
      showNotice(
        err.response?.data?.message || "Error al procesar el envío masivo"
      );
    }
  };

  const handleRequestBroadcastMasivo = (payload) => {
    const targetList = payload?.soloPendientes
      ? invitados.filter((g) => !g.invitacion_enviada)
      : invitados;
    const targetPases = targetList.reduce(
      (acc, g) => acc + Number(g.pases || 1),
      0
    );
    validateAndWarnBeforeShare({
      canal: `Difusión Masiva (${payload?.canal || broadcastChannel})`,
      destinatarioLabel: payload?.soloPendientes
        ? `${targetList.length} invitado(s) sin envío previo (${targetPases} pases)`
        : `Todos los invitados (${invitados.length} invitados • ${totalPasesLista} pases)`,
      proyectadoInvitados: totalInvitadosCount,
      proyectadoPases: totalPasesLista,
      enviadosDespuesInvitados: totalInvitadosCount,
      enviadosDespuesPases: totalPasesLista,
      onProceed: () => setConfirmBroadcastModal(payload),
    });
  };

  const handleBroadcastMasivo = async (payload) => {
    await executeBroadcastMasivo(payload);
  };

  const handleSaveMetaWaConfig = async () => {
    try {
      const { data } = await guardarConfigWhatsAppApiRequest(evento.idevento, {
        wabaId: metaWaForm.wabaId,
        phoneNumberId: metaWaForm.phoneNumberId,
        accessToken: metaWaForm.accessToken,
        templateName: metaWaForm.templateName,
        templateLang: metaWaForm.templateLang,
        mode: metaWaForm.mode,
      });
      setMetaWaForm((prev) => ({
        ...prev,
        configured: Boolean(data.whatsapp_api_configurado),
        wabaId: data.whatsapp_api_waba_id || "",
        phoneNumberId: data.whatsapp_api_phone_id || "",
        accessToken: "",
        tokenMasked: data.whatsapp_api_token_masked || "",
        templateName:
          data.whatsapp_api_template || "recordatorio_evento_recuerdalo",
        templateLang: data.whatsapp_api_lang || "es_MX",
        mode: data.whatsapp_api_mode || "template",
      }));
      setShowMetaWaConfig(false);
      showNotice(
        "✓ Credenciales de Meta WhatsApp Cloud API guardadas correctamente."
      );
    } catch (err) {
      showNotice(
        err.response?.data?.message ||
          "Error al guardar la configuración de Meta WhatsApp API"
      );
    }
  };

  const handleListMetaTemplates = async () => {
    const cleanWaba = String(metaWaForm.wabaId || "").trim();
    if (!cleanWaba) return;
    try {
      setLoadingMetaTemplates(true);
      showNotice("⏳ Consultando plantillas de tu cuenta WABA en Meta...");
      const { data } = await listarPlantillasWhatsAppApiRequest(
        evento.idevento,
        {
          wabaId: cleanWaba,
          accessToken: metaWaForm.accessToken,
        }
      );
      const list = Array.isArray(data?.templates) ? data.templates : [];
      setMetaTemplatesList(list);
      if (list.length === 0) {
        showNotice("ℹ️ No se encontraron plantillas en esta cuenta WABA.");
      } else {
        showNotice(
          `✓ Se encontraron ${list.length} plantilla(s) en tu cuenta comercial de Meta. Haz clic en cualquiera para seleccionarla.`
        );
      }
    } catch (err) {
      showNotice(
        `⚠️ ${
          err.response?.data?.message ||
          "Error al consultar las plantillas del WABA ID en Meta"
        }`
      );
    } finally {
      setLoadingMetaTemplates(false);
    }
  };

  const executeSendSilentWhatsAppReminder = async (guest) => {
    const isPendingGuest = guest?.estado_rsvp === "Pendiente";
    const msgTemplate = isPendingGuest
      ? DEFAULT_PENDING_REMINDER_MSG
      : invForm.recordatorio_mensaje;
    if (!metaWaForm.configured) {
      const text = formatGuestMessage(msgTemplate, guest, null, {
        mode: reminderPreviewMode,
        useConfiguredCountdown: !isPendingGuest,
        adaptCountdown: !isPendingGuest,
      });
      const cleanPhone = String(guest.telefono || "").replace(/\D/g, "");
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
      await handleUpdateGuest(guest.idinvitado, {
        invitacion_enviada: true,
        canal_ultimo_envio: "Recordatorio WhatsApp",
      });
      return;
    }
    try {
      setSendingWaGuestId(guest.idinvitado);
      showNotice(
        `⏳ Enviando recordatorio silencioso por API de Meta a ${guest.nombre}...`
      );
      const { data } = await enviarWhatsAppIndividualApiRequest(
        evento.idevento,
        guest.idinvitado,
        {
          linkUrl: selectedWhatsappLinkObj?.url || baseShareUrl,
          customMessage: msgTemplate,
          canal: "Recordatorio WhatsApp API",
        }
      );
      if (data?.invitado) {
        setDetalle((prev) => ({
          ...prev,
          invitados: prev.invitados.map((g) =>
            g.idinvitado === guest.idinvitado ? data.invitado : g
          ),
        }));
      }
      onEventoUpdated();
      showNotice(
        `✓ ${data.message || `Recordatorio enviado por API Meta a ${guest.nombre}`}`
      );
    } catch (err) {
      showNotice(
        `⚠️ ${
          err.response?.data?.message ||
          `No se pudo enviar por API Meta a ${guest.nombre}`
        }`
      );
    } finally {
      setSendingWaGuestId(null);
    }
  };

  const handleSendSilentWhatsAppReminder = (guest) => {
    const guestPases = Math.max(1, Number(guest?.pases || 1));
    const isNewSend = !guest?.invitacion_enviada;
    validateAndWarnBeforeShare({
      canal: "Recordatorio por WhatsApp",
      destinatarioLabel: `${guest.nombre} (${
        guest.telefono || "WhatsApp"
      } • ${guestPases} pase${guestPases === 1 ? "" : "s"})`,
      proyectadoInvitados: totalInvitadosCount,
      proyectadoPases: totalPasesLista,
      enviadosDespuesInvitados: invitadosEnviadosCount + (isNewSend ? 1 : 0),
      enviadosDespuesPases: pasesEnviadosCount + (isNewSend ? guestPases : 0),
      onProceed: () => {
        executeSendSilentWhatsAppReminder(guest);
      },
    });
  };

  const executeTriggerBulkReminders = async () => {
    const activeMode =
      reminderPreviewMode === "horas" ||
      (Boolean(invForm.recordatorio_horas_activo) &&
        !invForm.recordatorio_activo)
        ? "horas"
        : "dias";
    const activeCantidad =
      activeMode === "horas"
        ? Number(invForm.recordatorio_horas ?? 12) || 12
        : Number(invForm.recordatorio_dias ?? 3) || 3;

    if (metaWaForm.configured) {
      try {
        setSendingWaBulk(true);
        showNotice(
          `⏳ Disparando recordatorios silenciosos por API de Meta a ${confirmadosList.length} invitado(s) confirmado(s)...`
        );
        const { data } = await enviarRecordatoriosWhatsAppMasivoRequest(
          evento.idevento,
          {
            estadoFiltro: "Confirmado",
            linkUrl: selectedWhatsappLinkObj?.url || baseShareUrl,
            customMessage: invForm.recordatorio_mensaje,
            incluirCorreo: true,
            mode: activeMode,
            cantidad: activeCantidad,
          }
        );
        if (Array.isArray(data?.invitados)) {
          setDetalle((prev) => ({ ...prev, invitados: data.invitados }));
        }
        onEventoUpdated();
        if (data.waEnviadosCount === 0 && data.waErroresCount > 0) {
          showNotice(
            `⚠️ Error en API Meta (${data.waErroresCount} fallo(s)): ${
              data.ultimoError || "Verifica plantilla y credenciales"
            }`
          );
        } else {
          showNotice(
            `✓ Disparo silencioso a Confirmados completado: ${data.waEnviadosCount} WhatsApp API enviados${
              data.emailEnviadosCount > 0
                ? ` • ${data.emailEnviadosCount} Correos enviados`
                : ""
            }${
              data.sinTelefonoCount > 0
                ? ` (${data.sinTelefonoCount} sin teléfono)`
                : ""
            }.`
          );
        }
      } catch (err) {
        showNotice(
          err.response?.data?.message ||
            "Error al disparar recordatorios masivos por API de Meta"
        );
      } finally {
        setSendingWaBulk(false);
      }
      return;
    }

    // Respaldo semiautomático si aún no se han ingresado credenciales de Meta API
    const firstConfirmed = confirmadosList[0];
    if (firstConfirmed) {
      const text = formatGuestMessage(
        invForm.recordatorio_mensaje,
        firstConfirmed,
        null,
        {
          mode: activeMode,
          useConfiguredCountdown: true,
          adaptCountdown: true,
        }
      );
      const cleanPhone = String(firstConfirmed.telefono || "").replace(
        /\D/g,
        ""
      );
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
    await executeBroadcastMasivo({
      soloPendientes: false,
      canal: "Recordatorio Automático (Confirmados)",
      estadoFiltro: "Confirmado",
    });
  };

  const handleTriggerBulkReminders = () => {
    if (confirmadosList.length === 0) {
      showNotice(
        "ℹ️ Actualmente hay 0 invitados en estado 'Confirmado'. El recordatorio automático se envía a quienes ya confirmaron su asistencia."
      );
      return;
    }
    const confirmedPases = confirmadosList.reduce(
      (acc, g) => acc + Number(g.pases || 1),
      0
    );
    validateAndWarnBeforeShare({
      canal: "Recordatorios Masivos a Confirmados (WhatsApp / Correo)",
      destinatarioLabel: `${confirmadosList.length} invitado(s) Confirmado(s) (${confirmedPases} pases)`,
      proyectadoInvitados: totalInvitadosCount,
      proyectadoPases: totalPasesLista,
      enviadosDespuesInvitados: totalInvitadosCount,
      enviadosDespuesPases: totalPasesLista,
      onProceed: () => {
        executeTriggerBulkReminders();
      },
    });
  };

  const executeCreateScheduledEmail = async () => {
    const fechaClean = String(scheduledEmailForm.fecha || "").trim();
    const horaClean = String(scheduledEmailForm.hora || "10:00").trim();
    if (!fechaClean || !horaClean) {
      showNotice(
        "⚠️ Selecciona la fecha y hora exacta para el envío automático de correo."
      );
      return;
    }

    try {
      setSavingScheduledEmail(true);
      const detallePayload = JSON.stringify({
        templateId: scheduledEmailForm.templateId || "neon-vip",
        mensaje:
          String(scheduledEmailForm.mensaje || "").trim() ||
          String(invForm.recordatorio_mensaje || "").trim(),
        linkUrl: selectedEmailLinkObj?.url || baseShareUrl,
      });

      const { data } = await addLogisticaRequest(evento.idevento, {
        categoria: "correo_programado",
        titulo: "Envío Automático de Correo a Confirmados",
        fecha_limite: fechaClean,
        hora_itinerario: horaClean,
        estado: "Programado",
        detalle: detallePayload,
      });

      setDetalle((prev) => ({
        ...prev,
        logistica: [...(prev.logistica || []), data],
      }));
      setScheduledEmailForm((prev) => ({
        ...prev,
        fecha: "",
        mensaje: "",
      }));
      showNotice(
        `✓ Envío automático de correo programado para el ${fechaClean} a las ${horaClean} hrs.`
      );
    } catch (err) {
      showNotice(
        err.response?.data?.message ||
          "Error al programar el envío automático de correo"
      );
    } finally {
      setSavingScheduledEmail(false);
    }
  };

  const handleCreateScheduledEmail = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const fechaClean = String(scheduledEmailForm.fecha || "").trim();
    const horaClean = String(scheduledEmailForm.hora || "10:00").trim();
    if (!fechaClean || !horaClean) {
      showNotice(
        "⚠️ Selecciona la fecha y la hora exacta para programar el envío de correo."
      );
      return;
    }
    const confirmedPases = confirmadosList.reduce(
      (acc, g) => acc + Number(g.pases || 1),
      0
    );
    validateAndWarnBeforeShare({
      canal: `Correo Automático Programado (${fechaClean} • ${horaClean} hrs)`,
      destinatarioLabel: `${confirmadosList.length} invitado(s) Confirmado(s) (${confirmedPases} pases)`,
      proyectadoInvitados: totalInvitadosCount,
      proyectadoPases: totalPasesLista,
      enviadosDespuesInvitados: totalInvitadosCount,
      enviadosDespuesPases: totalPasesLista,
      onProceed: () => {
        executeCreateScheduledEmail();
      },
    });
  };

  const handleToggleScheduledEmailStatus = async (item) => {
    const nextState =
      item.estado === "Programado" ? "Pausado" : "Programado";
    await handleUpdateLogistica(item.iditem, {
      estado: nextState,
    });
    showNotice(
      nextState === "Programado"
        ? `✓ Envío automático de correo activado (${item.fecha_limite} • ${item.hora_itinerario} hrs).`
        : "⏸ Envío automático de correo puesto en pausa."
    );
  };

  // =========================================================================
  // HANDLERS: LOGÍSTICA - SEATING CHART DRAG & DROP, TAREAS, CRONOGRAMA (TAB D)
  // =========================================================================
  const handleDropGuestOnMesa = async (nombreMesa) => {
    setDragOverMesa(null);
    if (!draggedGuestId) return;
    await handleUpdateGuest(draggedGuestId, { mesa_asignada: nombreMesa });
    setDraggedGuestId(null);
    showNotice(`✓ Invitado asignado a "${nombreMesa}".`);
  };

  const handleCreateMesa = async (e) => {
    e.preventDefault();
    if (!newMesaForm.titulo.trim()) return;
    try {
      const { data } = await addLogisticaRequest(evento.idevento, {
        categoria: "mesa",
        titulo: newMesaForm.titulo.trim(),
        detalle: newMesaForm.detalle.trim() || "Zona General",
        capacidad_mesa: Number(newMesaForm.capacidad_mesa) || 8,
        estado: "Pendiente",
      });
      setDetalle((prev) => ({
        ...prev,
        logistica: [...prev.logistica, data],
      }));
      setNewMesaForm({
        titulo: "",
        detalle: "Zona General",
        capacidad_mesa: 8,
      });
      showNotice("✓ Nueva mesa añadida al Seating Chart.");
    } catch {
      showNotice("Error al crear mesa");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskForm.titulo.trim()) return;
    try {
      const { data } = await addLogisticaRequest(evento.idevento, {
        categoria: "tarea",
        titulo: newTaskForm.titulo.trim(),
        detalle: newTaskForm.detalle.trim(),
        fecha_limite: newTaskForm.fecha_limite,
        estado: "Pendiente",
      });
      setDetalle((prev) => ({
        ...prev,
        logistica: [...prev.logistica, data],
      }));
      setNewTaskForm({ titulo: "", detalle: "", fecha_limite: "" });
      showNotice("✓ Tarea agregada al checklist.");
    } catch {
      showNotice("Error al agregar tarea");
    }
  };

  const handleCreateCronograma = async (e) => {
    e.preventDefault();
    if (!newCronoForm.titulo.trim()) return;
    try {
      const { data } = await addLogisticaRequest(evento.idevento, {
        categoria: "cronograma",
        hora_itinerario: newCronoForm.hora_itinerario || "20:00",
        titulo: newCronoForm.titulo.trim(),
        detalle: newCronoForm.detalle.trim(),
        estado: "Pendiente",
      });
      setDetalle((prev) => ({
        ...prev,
        logistica: [...prev.logistica, data],
      }));
      setNewCronoForm({ hora_itinerario: "21:00", titulo: "", detalle: "" });
      showNotice("✓ Horario añadido al itinerario del día.");
    } catch {
      showNotice("Error al agregar horario al cronograma");
    }
  };

  const handleUpdateLogistica = async (idItem, patch) => {
    try {
      const { data } = await updateLogisticaRequest(
        evento.idevento,
        idItem,
        patch
      );
      setDetalle((prev) => ({
        ...prev,
        logistica: prev.logistica.map((i) => (i.iditem === idItem ? data : i)),
      }));
    } catch {
      showNotice("Error al actualizar logística");
    }
  };

  const handleDeleteLogistica = async (idItem) => {
    if (editingCustomLinkId === idItem) {
      setEditingCustomLinkId(null);
      setCustomLinkForm((prev) => ({
        ...prev,
        etiqueta: "",
        tipoPase: "GENERAL",
        adultos: 0,
        ninos: 0,
      }));
    }
    if (String(idItem).startsWith("temp-")) {
      setDetalle((prev) => ({
        ...prev,
        logistica: prev.logistica.filter((i) => i.iditem !== idItem),
      }));
      return;
    }
    try {
      await deleteLogisticaRequest(evento.idevento, idItem);
      setDetalle((prev) => ({
        ...prev,
        logistica: prev.logistica.filter((i) => i.iditem !== idItem),
      }));
    } catch {
      showNotice("Error al eliminar elemento");
    }
  };

  const handleStartEditCustomLink = (item) => {
    setEditingCustomLinkId(item.iditem);
    setCustomLinkError("");
    setCustomLinkForm({
      etiqueta: item.etiqueta || "",
      modalidad: normalizeModalidad(item.modalidad),
      tipoPase:
        String(item.tipoPase || "GENERAL").toUpperCase() === "VIP"
          ? "VIP"
          : "GENERAL",
      adultos: item.adultos ?? 0,
      ninos: item.ninos ?? 0,
    });
  };

  const handleCancelEditCustomLink = () => {
    setEditingCustomLinkId(null);
    setCustomLinkError("");
    setCustomLinkForm((prev) => ({
      ...prev,
      etiqueta: "",
      tipoPase: "GENERAL",
      adultos: 0,
      ninos: 0,
    }));
  };

  const handleCreateCustomLink = async (e) => {
    e?.preventDefault();
    if (!customLinkForm.etiqueta.trim()) {
      setCustomLinkError("El campo 'Identificador del Link' es obligatorio.");
      showNotice(
        "⚠️ Por favor ingresa el Identificador del Link antes de continuar."
      );
      return;
    }
    setCustomLinkError("");

    if (!editingCustomLinkId) {
      setShowConfirmCreateLinkModal(true);
      return;
    }

    await executeSaveCustomLink();
  };

  const executeSaveCustomLink = async () => {
    setShowConfirmCreateLinkModal(false);
    const mod = normalizeModalidad(customLinkForm.modalidad);
    const tipoPaseFinal =
      String(customLinkForm.tipoPase || "GENERAL").toUpperCase() === "VIP"
        ? "VIP"
        : "GENERAL";
    const numAdultos = isSoloNinosMod(mod)
      ? 0
      : Math.max(0, parseInt(customLinkForm.adultos, 10) || 0);
    const numNinos = isSoloAdultosMod(mod)
      ? 0
      : Math.max(0, parseInt(customLinkForm.ninos, 10) || 0);

    const tituloFinal = customLinkForm.etiqueta.trim();
    const detalleJson = JSON.stringify({
      modalidad: mod,
      tipoPase: tipoPaseFinal,
      adultos: numAdultos,
      ninos: numNinos,
    });

    if (editingCustomLinkId) {
      if (
        !evento.idevento ||
        String(editingCustomLinkId).startsWith("temp-")
      ) {
        setDetalle((prev) => ({
          ...prev,
          logistica: prev.logistica.map((i) =>
            i.iditem === editingCustomLinkId
              ? {
                  ...i,
                  titulo: tituloFinal,
                  detalle: detalleJson,
                  estado: mod,
                  fecha_limite: tipoPaseFinal,
                  capacidad_mesa: numAdultos,
                  hora_itinerario: String(numNinos),
                }
              : i
          ),
        }));
        setEditingCustomLinkId(null);
        setCustomLinkForm((prev) => ({
          ...prev,
          etiqueta: "",
          tipoPase: "GENERAL",
          adultos: 0,
          ninos: 0,
        }));
        showNotice("✓ Link actualizado correctamente.");
        return;
      }

      try {
        const { data } = await updateLogisticaRequest(
          evento.idevento,
          editingCustomLinkId,
          {
            titulo: tituloFinal,
            detalle: detalleJson,
            estado: mod,
            fecha_limite: tipoPaseFinal,
            capacidad_mesa: numAdultos,
            hora_itinerario: String(numNinos),
          }
        );
        setDetalle((prev) => ({
          ...prev,
          logistica: prev.logistica.map((i) =>
            i.iditem === editingCustomLinkId ? data : i
          ),
        }));
        setEditingCustomLinkId(null);
        setCustomLinkForm((prev) => ({
          ...prev,
          etiqueta: "",
          tipoPase: "GENERAL",
          adultos: 0,
          ninos: 0,
        }));
        showNotice("✓ Link de invitación actualizado correctamente.");
      } catch {
        showNotice("Error al actualizar el link de invitación");
      }
      return;
    }

    if (!evento.idevento) {
      const tempItem = {
        iditem: `temp-${Date.now()}`,
        categoria: "link_invitacion",
        titulo: tituloFinal,
        detalle: detalleJson,
        estado: mod,
        fecha_limite: tipoPaseFinal,
        capacidad_mesa: numAdultos,
        hora_itinerario: String(numNinos),
      };
      setDetalle((prev) => ({
        ...prev,
        logistica: [...prev.logistica, tempItem],
      }));
      setCustomLinkForm((prev) => ({
        ...prev,
        etiqueta: "",
        tipoPase: "GENERAL",
        adultos: 0,
        ninos: 0,
      }));
      showNotice(
        "✓ Link generado en vista previa (guarda el evento para conservarlo)."
      );
      return;
    }

    try {
      const { data } = await addLogisticaRequest(evento.idevento, {
        categoria: "link_invitacion",
        titulo: tituloFinal,
        detalle: detalleJson,
        estado: mod,
        fecha_limite: tipoPaseFinal,
        capacidad_mesa: numAdultos,
        hora_itinerario: String(numNinos),
      });
      setDetalle((prev) => ({
        ...prev,
        logistica: [...prev.logistica, data],
      }));
      setCustomLinkForm((prev) => ({
        ...prev,
        etiqueta: "",
        tipoPase: "GENERAL",
        adultos: 0,
        ninos: 0,
      }));
      showNotice("✓ Nuevo link de invitación generado y agregado a la tabla.");
    } catch {
      showNotice("Error al generar el link de invitación");
    }
  };

  const executeShareCustomLink = async (linkItem) => {
    const shareText = `¡Hola! 🎉 Estás cordialmente invitado(a) a ${
      evento.nombre || "nuestro evento"
    } el día ${formatDateInput(evento.fecha_evento)} a las ${
      evento.hora_evento || "20:00"
    } hrs en ${
      evento.lugar || "el lugar del evento"
    }. Confirma tu asistencia en esta invitación virtual (${
      linkItem.modalidad
    }): ${linkItem.url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitación: ${evento.nombre}`,
          text: shareText,
          url: linkItem.url,
        });
        return;
      } catch {
        // Si el usuario cancela el share nativo, abrimos WhatsApp como respaldo
      }
    }
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const executeWhatsAppCustomLink = (linkItem) => {
    const shareText = `¡Hola! 🎉 Estás cordialmente invitado(a) a ${
      evento.nombre || "nuestro evento"
    } el día ${formatDateInput(evento.fecha_evento)} a las ${
      evento.hora_evento || "20:00"
    } hrs en ${
      evento.lugar || "el lugar del evento"
    }. Confirma tu asistencia en esta invitación virtual (${
      linkItem.modalidad
    }): ${linkItem.url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareCustomLink = (linkItem) => {
    const linkPases = Math.max(
      1,
      Number(linkItem?.adultos || 0) + Number(linkItem?.ninos || 0)
    );
    validateAndWarnBeforeShare({
      canal: "Compartir Link de Invitación",
      destinatarioLabel: `${linkItem?.etiqueta || "Link de Invitación"} (${
        linkItem?.modalidad || "General"
      } • ${linkPases} pase${linkPases === 1 ? "" : "s"})`,
      proyectadoInvitados: Math.max(
        totalInvitadosCount,
        invitadosEnviadosCount + 1
      ),
      proyectadoPases: Math.max(
        totalPasesLista,
        pasesEnviadosCount + linkPases,
        linkPases
      ),
      enviadosDespuesInvitados: invitadosEnviadosCount + 1,
      enviadosDespuesPases: pasesEnviadosCount + linkPases,
      onProceed: () => {
        executeShareCustomLink(linkItem);
      },
    });
  };

  const handleWhatsAppCustomLink = (linkItem) => {
    const linkPases = Math.max(
      1,
      Number(linkItem?.adultos || 0) + Number(linkItem?.ninos || 0)
    );
    validateAndWarnBeforeShare({
      canal: "WhatsApp (Link de Invitación)",
      destinatarioLabel: `${linkItem?.etiqueta || "Link de Invitación"} (${
        linkItem?.modalidad || "General"
      } • ${linkPases} pase${linkPases === 1 ? "" : "s"})`,
      proyectadoInvitados: Math.max(
        totalInvitadosCount,
        invitadosEnviadosCount + 1
      ),
      proyectadoPases: Math.max(
        totalPasesLista,
        pasesEnviadosCount + linkPases,
        linkPases
      ),
      enviadosDespuesInvitados: invitadosEnviadosCount + 1,
      enviadosDespuesPases: pasesEnviadosCount + linkPases,
      onProceed: () => {
        executeWhatsAppCustomLink(linkItem);
      },
    });
  };

  // =========================================================================
  // HANDLERS: MESA DE REGALOS (TIENDAS EXTERNAS)
  // =========================================================================
  const handleStartEditGift = (gift) => {
    const isStandardStore = TIENDAS_MESA_REGALOS.includes(gift.tienda);
    setEditingGiftId(gift.iditem);
    setGiftError("");
    setGiftForm({
      tienda: isStandardStore ? gift.tienda : "Otra tienda",
      tiendaCustom: isStandardStore ? "" : gift.tienda,
      producto: gift.producto || "",
      url: gift.url || "",
      nota: gift.nota || "",
    });
  };

  const handleCancelEditGift = () => {
    setEditingGiftId(null);
    setGiftError("");
    setGiftForm({
      tienda: "Amazon",
      tiendaCustom: "",
      producto: "",
      url: "",
      nota: "",
    });
  };

  const handleSaveGiftItem = async () => {
    const prodClean = String(giftForm.producto || "").trim();
    let urlClean = String(giftForm.url || "").trim();
    if (!prodClean) {
      setGiftError("Ingresa el nombre del producto o regalo.");
      return;
    }
    if (!urlClean) {
      setGiftError("Ingresa el enlace (URL) del producto en la tienda.");
      return;
    }
    if (!/^https?:\/\//i.test(urlClean)) {
      urlClean = `https://${urlClean}`;
    }

    const tiendaFinal =
      giftForm.tienda === "Otra tienda"
        ? String(giftForm.tiendaCustom || "").trim() ||
          detectStoreFromUrl(urlClean) ||
          "Tienda Externa"
        : giftForm.tienda;

    const notaClean = String(giftForm.nota || "").trim();
    let detalleCleanUrl = urlClean;
    if (detalleCleanUrl.length > 255) {
      try {
        const uObj = new URL(detalleCleanUrl);
        detalleCleanUrl = `${uObj.origin}${uObj.pathname}`.slice(0, 255);
      } catch {
        detalleCleanUrl = detalleCleanUrl.slice(0, 255);
      }
    }
    const detalleJson = detalleCleanUrl;

    setGiftError("");

    if (editingGiftId) {
      if (!evento.idevento || String(editingGiftId).startsWith("temp-")) {
        setDetalle((prev) => ({
          ...prev,
          logistica: prev.logistica.map((i) =>
            i.iditem === editingGiftId
              ? {
                  ...i,
                  titulo: prodClean,
                  detalle: detalleJson,
                  estado: tiendaFinal.slice(0, 40),
                  fecha_limite: notaClean.slice(0, 40),
                }
              : i
          ),
        }));
        handleCancelEditGift();
        showNotice("✓ Producto de mesa de regalos actualizado.");
        return;
      }

      try {
        const { data } = await updateLogisticaRequest(
          evento.idevento,
          editingGiftId,
          {
            titulo: prodClean,
            detalle: detalleJson,
            estado: tiendaFinal.slice(0, 40),
            fecha_limite: notaClean.slice(0, 40),
          }
        );
        setDetalle((prev) => ({
          ...prev,
          logistica: prev.logistica.map((i) =>
            i.iditem === editingGiftId ? data : i
          ),
        }));
        handleCancelEditGift();
        showNotice("✓ Producto de mesa de regalos actualizado.");
      } catch {
        showNotice("Error al actualizar el producto en la mesa de regalos");
      }
      return;
    }

    if (!evento.idevento) {
      const tempGift = {
        iditem: `temp-gift-${Date.now()}`,
        categoria: "mesa_regalo",
        titulo: prodClean,
        detalle: detalleJson,
        estado: tiendaFinal.slice(0, 40),
        fecha_limite: notaClean.slice(0, 40),
      };
      setDetalle((prev) => ({
        ...prev,
        logistica: [...prev.logistica, tempGift],
      }));
      handleCancelEditGift();
      showNotice(
        "✓ Regalo agregado en vista previa (haz clic en Guardar Evento para conservarlo)."
      );
      return;
    }

    try {
      const { data } = await addLogisticaRequest(evento.idevento, {
        categoria: "mesa_regalo",
        titulo: prodClean,
        detalle: detalleJson,
        estado: tiendaFinal.slice(0, 40),
        fecha_limite: notaClean.slice(0, 40),
      });
      setDetalle((prev) => ({
        ...prev,
        logistica: [...prev.logistica, data],
      }));
      handleCancelEditGift();
      showNotice("✓ Producto agregado a la Mesa de Regalos.");
    } catch {
      showNotice("Error al agregar producto a la Mesa de Regalos");
    }
  };

  // =========================================================================
  // HANDLERS: PRESUPUESTO
  // =========================================================================
  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!budgetForm.concepto.trim()) return;
    try {
      const { data } = await addPresupuestoRequest(evento.idevento, budgetForm);
      setDetalle((prev) => ({
        ...prev,
        presupuesto: [data, ...prev.presupuesto],
      }));
      setBudgetForm({
        concepto: "",
        categoria: "Banquete",
        monto_estimado: "",
        monto_pagado: "",
        estado_pago: "Pendiente",
      });
      onEventoUpdated();
      showNotice("✓ Partida agregada al presupuesto.");
    } catch {
      showNotice("Error al agregar gasto");
    }
  };

  const handleUpdateBudget = async (idGasto, patch) => {
    try {
      const { data } = await updatePresupuestoRequest(
        evento.idevento,
        idGasto,
        patch
      );
      setDetalle((prev) => ({
        ...prev,
        presupuesto: prev.presupuesto.map((b) =>
          b.idgasto === idGasto ? data : b
        ),
      }));
      onEventoUpdated();
    } catch {
      showNotice("Error al actualizar gasto");
    }
  };

  const handleDeleteBudget = async (idGasto) => {
    try {
      await deletePresupuestoRequest(evento.idevento, idGasto);
      setDetalle((prev) => ({
        ...prev,
        presupuesto: prev.presupuesto.filter((b) => b.idgasto !== idGasto),
      }));
      onEventoUpdated();
    } catch {
      showNotice("Error al eliminar gasto");
    }
  };

  // =========================================================================
  // FILTROS DE TABLA DE INVITADOS (TAB B, D, E)
  // =========================================================================
  const filteredGuests = invitados.filter((g) => {
    const matchStatus =
      rsvpFilter === "Todos"
        ? true
        : rsvpFilter === "Confirmados"
        ? g.estado_rsvp === "Confirmado"
        : rsvpFilter === "Rechazados"
        ? isRejected(g.estado_rsvp)
        : g.estado_rsvp === "Pendiente";

    const matchGroup =
      groupFilter === "Todos" || (g.grupo || "Amigos") === groupFilter;

    const q = guestSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      g.nombre.toLowerCase().includes(q) ||
      (g.correo || "").toLowerCase().includes(q) ||
      (g.telefono || "").toLowerCase().includes(q) ||
      (g.nota_alimentacion || "").toLowerCase().includes(q);

    return matchStatus && matchGroup && matchSearch;
  });

  const mesasItems = logistica.filter((i) => i.categoria === "mesa");
  const tareasItems = logistica.filter((i) => i.categoria === "tarea");
  const cronogramaItems = [...logistica.filter((i) => i.categoria === "cronograma")].sort(
    (a, b) =>
      String(a.hora_itinerario || a.titulo).localeCompare(
        String(b.hora_itinerario || b.titulo)
      )
  );
  const correosProgramadosList = [
    ...logistica.filter((i) => i.categoria === "correo_programado"),
  ].sort((a, b) => {
    const keyA = `${a.fecha_limite || ""} ${a.hora_itinerario || ""}`;
    const keyB = `${b.fecha_limite || ""} ${b.hora_itinerario || ""}`;
    return keyA.localeCompare(keyB);
  });

  // QR SVG Download handler
  const qrCodeValue = `${window.location.origin}/checkin/${evento.idevento}?code=${
    invForm.codigo_acceso_qr || "QR-GATE"
  }`;
  const qrMatrix = buildQrMatrix(qrCodeValue);

  const handleDownloadQrSvg = () => {
    const cellSize = 10;
    const quietZone = 20;
    const totalDim = qrMatrix.length * cellSize + quietZone * 2;
    let rects = "";
    qrMatrix.forEach((row, rIdx) => {
      row.forEach((active, cIdx) => {
        if (active) {
          rects += `<rect x="${quietZone + cIdx * cellSize}" y="${
            quietZone + rIdx * cellSize
          }" width="${cellSize}" height="${cellSize}" fill="#0F1A45" />`;
        }
      });
    });

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDim} ${
      totalDim + 45
    }" width="420" height="480">
      <rect width="100%" height="100%" rx="16" fill="#ffffff"/>
      ${rects}
      <text x="50%" y="${
        totalDim + 16
      }" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#0F1A45">${
      evento.nombre
    }</text>
      <text x="50%" y="${
        totalDim + 32
      }" text-anchor="middle" font-family="monospace" font-size="10" fill="#6C7EE1">${
      invForm.codigo_acceso_qr || "QR-GATE"
    }</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_Acceso_${evento.nombre.replace(/\s+/g, "_")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Notificación flotante */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-[#6C7EE1]/50 bg-[#142257]/95 px-4 py-3 text-center text-xs font-semibold text-[#6C7EE1] shadow-[0_0_25px_rgba(21,178,245,0.25)] backdrop-blur-md sm:bottom-6 sm:left-auto sm:right-6 sm:px-5 sm:text-left">
          {toast}
        </div>
      )}

      {/* Modal de Advertencia cuando se sobrepasa el Número de Invitados Permitidos al compartir por WhatsApp o Correo */}
      {guestLimitWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1A45]/70 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-amber-400 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-amber-200 pb-3.5">
              <div className="flex items-start gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl text-amber-700">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                </span>
                <div>
                  <span className="inline-block rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                    ADVERTENCIA DE CAPACIDAD CONFIGURADA
                  </span>
                  <h3 className="mt-1 text-base font-extrabold text-[#2D3047] sm:text-lg">
                    Has sobrepasado el número de invitados permitidos
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuestLimitWarningModal(null)}
                className="cursor-pointer rounded-lg border border-[#E6E9F4] px-2.5 py-1 text-xs font-bold text-[#8E94A9] hover:border-rose-400 hover:text-rose-500"
              >
                <X className="h-4 w-4 shrink-0" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-950">
              <p className="font-bold leading-relaxed">
                Estás intentando compartir invitaciones virtuales por{" "}
                <span className="underline decoration-amber-600">
                  {guestLimitWarningModal.canal}
                </span>
                , pero el número de invitados / pases registrados o enviados{" "}
                <strong className="text-rose-700">
                  supera el límite de {guestLimitWarningModal.limitePermitido}{" "}
                  invitados permitidos
                </strong>{" "}
                especificado en la configuración del evento.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-3">
              <div className="rounded-xl border border-[#E6E9F4] bg-[#F8F9FD] p-3">
                <span className="block text-[10px] font-bold uppercase text-[#8E94A9]">
                  Límite Configurado
                </span>
                <p className="mt-1 text-lg font-extrabold text-[#2D3047]">
                  {guestLimitWarningModal.limitePermitido}
                </p>
                <span className="text-[10px] text-[#5B617A]">
                  invitados permitidos
                </span>
              </div>

              <div className="rounded-xl border border-[#E6E9F4] bg-[#F8F9FD] p-3">
                <span className="block text-[10px] font-bold uppercase text-[#8E94A9]">
                  Actual / Proyectado
                </span>
                <p className="mt-1 text-lg font-extrabold text-amber-700">
                  {guestLimitWarningModal.proyectadoInvitados} inv. /{" "}
                  {guestLimitWarningModal.proyectadoPases} pases
                </p>
                <span className="text-[10px] text-[#5B617A]">
                  Enviados:{" "}
                  {guestLimitWarningModal.invitadosEnviadosActuales} (
                  {guestLimitWarningModal.pasesEnviadosActuales} pases)
                </span>
              </div>

              <div className="col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3 sm:col-span-1">
                <span className="block text-[10px] font-bold uppercase text-rose-700">
                  Exceso Detectado
                </span>
                <p className="mt-1 text-lg font-extrabold text-rose-600">
                  +{guestLimitWarningModal.excedente}
                </p>
                <span className="text-[10px] font-semibold text-rose-700">
                  sobre el límite
                </span>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-[#E6E9F4] bg-[#F8F9FD] px-3.5 py-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[#8E94A9]">
                  Destinatario / Acción:
                </span>
                <span className="font-extrabold text-[#2D3047]">
                  {guestLimitWarningModal.destinatarioLabel}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse items-stretch justify-between gap-2.5 border-t border-[#E6E9F4] pt-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  setGuestLimitWarningModal(null);
                  onChangeSubTab("config");
                }}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#6C7EE1]/40 bg-[#6C7EE1]/10 px-3.5 py-2.5 text-xs font-extrabold text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white"
              >
                <Settings className="h-3.5 w-3.5 shrink-0" />
                <span>Ajustar Límite en Configuración</span>
              </button>

              <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setGuestLimitWarningModal(null)}
                  className="cursor-pointer rounded-xl border border-[#E6E9F4] bg-white px-4 py-2.5 text-xs font-bold text-[#8E94A9] transition hover:border-[#2D3047] hover:text-[#2D3047]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const proceedFn = guestLimitWarningModal.onProceed;
                    setGuestLimitWarningModal(null);
                    if (typeof proceedFn === "function") {
                      proceedFn();
                    }
                  }}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black shadow-sm transition hover:bg-amber-400"
                >
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Compartir de Todos Modos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TARJETA SUPERIOR UNIFICADA CON FONDO BLANCO
         ===================================================================== */}
      <div className="w-full rounded-2xl border border-[#E6E9F4] bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 lg:gap-8">
          {/* Bloque Izquierdo: Evento Seleccionado, Cuenta Regresiva y Estado */}
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-[#6C7EE1]/12 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#6C7EE1]">
              Evento Seleccionado
            </span>
            <div className="mt-1.5">
              <select
                value={evento.idevento || "draft"}
                onChange={(e) => {
                  if (e.target.value !== "draft") {
                    onSelectEvento(Number(e.target.value));
                  }
                }}
                className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs font-extrabold text-[#2D3047] outline-none transition focus:border-[#6C7EE1] sm:max-w-[360px] sm:text-[13px]"
              >
                {!evento.idevento && (
                  <option value="draft" className="text-[#2D3047]">
                    ✨ {invForm.nombre || "Nuevo Evento"} (Por guardar)
                  </option>
                )}
                {eventos.map((ev) => (
                  <option
                    key={ev.idevento}
                    value={ev.idevento}
                    className="text-[#2D3047]"
                  >
                    {ev.nombre} ({formatDateInput(ev.fecha_evento)})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5B617A]">
              <span className="inline-flex items-center gap-1">
                <Hourglass className="h-3.5 w-3.5 text-[#6D28D9]" />
                Faltan <strong className="text-[#2D3047]">{diasParaEvento}</strong> días
              </span>
              <span>•</span>
              <span
                className={`inline-flex items-center gap-1 font-bold ${
                  invForm.rsvp_habilitado
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    invForm.rsvp_habilitado
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
                {invForm.rsvp_habilitado ? "Evento Activo" : "Evento Pausado"}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-[#E6E9F4]">
              <div className="h-full w-4/5 rounded-full bg-[#4CE0B3]" />
            </div>
          </div>

          {/* Bloque Derecho: Confirmación de Asistencia y Botón Ver Invitados */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5 border-t border-[#E6E9F4] pt-3.5 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 lg:pl-8">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-xl font-extrabold tracking-tight text-[#2D3047]">
                  {pasesConfirmadosCount} / {limiteInvitadosPermitidos}
                </span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#6C7EE1]">
                  Confirmación de Asistencia
                </h3>
                {isGuestLimitExceeded && (
                  <button
                    type="button"
                    onClick={() => onChangeSubTab("config")}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-amber-400 bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 transition hover:bg-amber-200"
                    title="El número de invitados/pases supera el límite configurado"
                  >
                    <AlertTriangle className="h-3 w-3" /> +{excedenteInvitadosActual} sobre el límite
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-[#5B617A]">
                <strong className="text-[#2D3047]">{pendientesList.length}</strong>{" "}
                invitaciones pendientes por confirmar •{" "}
                <span className="font-semibold text-[#2D3047]">
                  En lista ahora: {totalInvitadosCount} invitados registrados /{" "}
                  {totalPasesLista} lugares
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChangeSubTab("guests")}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#6C7EE1] px-4 py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#5A6CD0] sm:w-auto sm:py-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                Ver Invitados
              </button>
              <button
                type="button"
                onClick={() => onChangeSubTab("memories")}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 sm:w-auto sm:py-1.5"
              >
                <Camera className="h-3.5 w-3.5" />
                Cámara y Recuerdos
              </button>
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Deep Twilight Navy (#2D3047) con tarjeta flotante blanca y anillo neón (Oculta temporalmente) */}
        <div className="hidden relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#323650] to-[#26293E] p-[15px] text-white shadow-[0_8px_18px_rgba(45,48,71,0.2)] sm:col-span-2 lg:col-span-1">
          <div className="relative z-10 flex items-start justify-between gap-2.5">
            <div className="max-w-[68%]">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[13px] font-extrabold tracking-tight">
                  Invitación y QR
                </h3>
                <span className="h-2 w-2 rounded-full bg-[#4CE0B3]" />
              </div>
              <p className="mt-1 text-[11px] leading-tight text-[#9DA3C0]">
                Enlace activo y código QR listo para recepción
              </p>
              <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-full rounded-full bg-[#4CE0B3]" />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChangeSubTab("broadcast")}
                  className="rounded-full bg-[#6C7EE1] px-3 py-1 text-[11px] font-bold text-white transition hover:bg-[#5A6CD0]"
                >
                  Compartir
                </button>
                <button
                  type="button"
                  onClick={onGoToWizard}
                  className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-white hover:text-[#2D3047]"
                >
                  ＋ Nuevo
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 text-center text-[#2D3047] shadow-md">
              <div className="mx-auto flex h-4 w-4 items-center justify-center rounded-full bg-[#4CE0B3] text-[10px] font-bold text-white">
                ✓
              </div>
              <p className="mt-0.5 text-[10px] font-bold leading-tight text-[#2D3047]">
                ¡Enlace
                <br />
                Activo!
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-2 right-3.5 h-5 w-5 rounded-full border-2 border-[#6C7EE1] shadow-[0_0_8px_#6C7EE1]" />
        </div>
      </div>

      {/* =====================================================================
          PESTAÑAS ESTILO CARPETA CURVA + CONTENEDOR GENERAL BLANCO DE EDICIÓN DEL EVENTO
         ===================================================================== */}
      <div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 lg:flex lg:flex-nowrap lg:items-end lg:gap-0">
          {GESTOR_TABS.filter((t) => !t.hidden).map((t, idx) => {
            const active = currentTab === t.id;
            const inactiveBgs = [
              "#DCE5F2",
              "#D4DFEE",
              "#CBD8EA",
              "#C3D1E6",
              "#BBCBE2",
              "#B3C4DE",
            ];
            const zIndexes = [
              "z-10",
              "z-[9]",
              "z-[8]",
              "z-[7]",
              "z-[6]",
              "z-[5]",
            ];
            const fillHex = active
              ? "#FFFFFF"
              : inactiveBgs[idx % inactiveBgs.length];
            const zIndexBase = zIndexes[idx % zIndexes.length];
            const cleanTabText = String(t.short || "")
              .replace(/^[^\p{L}\p{N}]+/u, "")
              .trim();
            const TabIcon =
              t.id === "config"
                ? SlidersHorizontal
                : t.id === "invitation"
                ? LayoutTemplate
                : t.id === "guests"
                ? Users
                : t.id === "broadcast"
                ? Share2
                : t.id === "memories"
                ? Camera
                : Settings;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeSubTab(t.id)}
                style={{ backgroundColor: fillHex }}
                className={`group relative min-w-0 cursor-pointer rounded-xl px-2.5 py-2.5 text-center text-[11px] tracking-tight transition sm:px-3 sm:py-3 sm:text-xs lg:flex-1 lg:rounded-t-[18px] lg:rounded-b-none lg:px-3 lg:py-3 lg:text-[11px] xl:flex-initial xl:px-5 xl:py-3.5 xl:text-[13px] ${
                  idx > 0 ? "lg:-ml-2" : ""
                } ${
                  active
                    ? "z-20 font-extrabold text-[#1E2235] shadow-[0_-4px_12px_rgba(30,42,70,0.04)] lg:-mb-px"
                    : `${zIndexBase} font-medium text-[#55617C] hover:text-[#1E2235]`
                }`}
              >
                {/* Curva cóncava izquierda estilo pestaña de carpeta (visible en lg+) */}
                {idx > 0 && (
                  <svg
                    viewBox="0 0 12 12"
                    className="pointer-events-none absolute bottom-0 -left-3 hidden h-3 w-3 lg:block"
                    fill="none"
                  >
                    <path
                      d="M12 0C12 6.62742 6.62742 12 0 12H12V0Z"
                      fill={fillHex}
                    />
                  </svg>
                )}
                <span className="inline-flex max-w-full items-center justify-center gap-1.5 truncate">
                  <TabIcon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      active ? "text-[#6D28D9]" : "text-[#55617C]"
                    }`}
                  />
                  <span className="truncate">{cleanTabText}</span>
                </span>
                {/* Curva cóncava derecha estilo pestaña de carpeta (visible en lg+) */}
                <svg
                  viewBox="0 0 12 12"
                  className="pointer-events-none absolute -right-3 bottom-0 hidden h-3 w-3 lg:block"
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

        {/* Contenedor General Blanco de la Vista de Edición del Evento */}
        <div
          className={`mt-2 rounded-2xl bg-white p-3.5 text-[#1E2235] shadow-[0_10px_30px_rgba(30,42,70,0.04)] sm:p-5 lg:mt-0 lg:rounded-b-[20px] lg:rounded-tr-[20px] lg:p-7 ${
            currentTab === "config"
              ? "lg:rounded-tl-none"
              : "lg:rounded-tl-[20px]"
          }`}
        >

      {/* =====================================================================
          TAB A: 📇 DISEÑO E INVITACIÓN VIRTUAL (/events/[id]/invitation) — ESTILO TARJETAS LIMPIAS & VIOLETA ELÉCTRICO (#6D28D9)
         ===================================================================== */}
      {currentTab === "invitation" && (
        <div className="grid grid-cols-1 items-start gap-5 rounded-3xl bg-[#F7F8FB] p-3 text-[#111827] sm:gap-6 sm:p-6 xl:grid-cols-12">
          {/* Editor Rápido (Columna Izquierda: 5 cols) */}
          <form
            onSubmit={handleSaveEvento}
            className="min-w-0 space-y-5 rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6 xl:col-span-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2F6] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    PERSONALIZACIÓN VISUAL
                  </span>
                  <h3 className="text-sm font-bold text-[#111827] sm:text-base">
                    Editor Rápido de Invitación
                  </h3>
                </div>
              </div>
              <span className="rounded-lg bg-[#F3E8FF] px-3 py-1 text-[11px] font-semibold text-[#6D28D9]">
                En vivo
              </span>
            </div>

            {/* Banner de enlace permanente estilo fila "Resume" de la imagen de referencia */}
            <div className="rounded-xl border border-[#F1F2F6] bg-[#FAFAFC] p-3.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F5F8] text-[#6D28D9]">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-[#111827]">
                    Enlace Permanente Activo
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const urlToCopy = await ensureRealShareUrl();
                    if (!urlToCopy) return;
                    navigator.clipboard.writeText(urlToCopy);
                    showNotice("✓ Enlace copiado al portapapeles.");
                  }}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-none bg-[#6D28D9] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(109,40,217,0.2)] transition hover:bg-[#5B21B6]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar URL
                </button>
              </div>
              <p className="mt-2 break-all font-mono text-[11px] font-medium text-[#6D28D9] sm:truncate">
                {baseShareUrl}
              </p>
              <p className="mt-1 text-[11px] text-[#9CA3AF]">
                Modifica textos, colores, botones o póster en cualquier momento
                sin alterar los enlaces ya compartidos.
              </p>
            </div>

            {/* Plantilla y Colores */}
            <div>
              <label className="mb-2 block text-[11px] font-medium text-[#9CA3AF]">
                Tema Visual y Colores de Acento / Botones
              </label>
              <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:gap-2.5">
                {PLANTILLAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setInvForm((prev) => ({
                        ...prev,
                        plantilla_tema: p.id,
                        color_acento: p.accent,
                        color_secundario: p.secondary,
                      }))
                    }
                    className={`min-w-0 cursor-pointer rounded-none border p-2.5 text-left transition ${
                      invForm.plantilla_tema === p.id
                        ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9]"
                        : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#6D28D9]/50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full"
                        style={{ backgroundColor: p.accent }}
                      />
                      <span className="truncate text-xs font-semibold">
                        {p.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5">
                  <span className="text-[11px] font-medium text-[#9CA3AF]">
                    Color Principal
                  </span>
                  <input
                    type="color"
                    value={invForm.color_acento || "#6D28D9"}
                    onChange={(e) =>
                      setInvForm((prev) => ({
                        ...prev,
                        color_acento: e.target.value,
                      }))
                    }
                    className="h-6 w-10 cursor-pointer border border-[#E5E7EB] bg-transparent"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5">
                  <span className="text-[11px] font-medium text-[#9CA3AF]">
                    Color Botón / Detalles
                  </span>
                  <input
                    type="color"
                    value={invForm.color_secundario || "#6D28D9"}
                    onChange={(e) =>
                      setInvForm((prev) => ({
                        ...prev,
                        color_secundario: e.target.value,
                      }))
                    }
                    className="h-6 w-10 cursor-pointer border border-[#E5E7EB] bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Imagen / Póster Principal */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-medium text-[#9CA3AF]">
                Imagen / Póster Principal de la Invitación
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POSTER_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setInvForm((prev) => ({
                        ...prev,
                        imagen_portada: preset.url,
                      }))
                    }
                    className={`cursor-pointer rounded-none border px-2.5 py-1 text-[10px] font-semibold transition ${
                      invForm.imagen_portada === preset.url
                        ? "border-[#6D28D9] bg-[#F3E8FF] text-[#6D28D9]"
                        : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#6D28D9] hover:text-[#6D28D9]"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={invForm.imagen_portada || ""}
                  onChange={(e) =>
                    setInvForm((prev) => ({
                      ...prev,
                      imagen_portada: e.target.value,
                    }))
                  }
                  placeholder="Pega la URL de tu póster o sube una imagen..."
                  className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                />
                <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-center text-xs font-semibold text-[#6D28D9] transition hover:border-[#6D28D9] hover:bg-[#F5F3FF]">
                  <Upload className="h-3.5 w-3.5" />
                  Subir
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Textos y Botón CTA */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                  Título Principal en la Invitación
                </label>
                <input
                  type="text"
                  value={invForm.nombre || ""}
                  onChange={(e) =>
                    setInvForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                  Fecha del Evento
                </label>
                <input
                  type="date"
                  value={invForm.fecha_evento || ""}
                  onChange={(e) => {
                    const nextEvDate = e.target.value;
                    setInvForm((prev) => ({
                      ...prev,
                      fecha_evento: nextEvDate,
                      ...(prev.fecha_limite_rsvp_activa &&
                      prev.fecha_limite_rsvp &&
                      nextEvDate &&
                      prev.fecha_limite_rsvp > nextEvDate
                        ? { fecha_limite_rsvp: nextEvDate }
                        : {}),
                    }));
                  }}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={invForm.hora_evento || "20:00"}
                  onChange={(e) =>
                    setInvForm((prev) => ({
                      ...prev,
                      hora_evento: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                  Mensaje de Invitación para los Asistentes
                </label>
                <textarea
                  rows={3}
                  value={invForm.mensaje_invitacion || ""}
                  onChange={(e) =>
                    setInvForm((prev) => ({
                      ...prev,
                      mensaje_invitacion: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                  Código de Vestimenta
                </label>
                <input
                  type="text"
                  value={invForm.codigo_vestimenta || ""}
                  onChange={(e) =>
                    setInvForm((prev) => ({
                      ...prev,
                      codigo_vestimenta: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-[#6D28D9] px-5 py-3 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
            >
              <Save className="h-4 w-4" />
              Guardar Evento
            </button>
          </form>

          {/* Vista Previa en Vivo: Móvil y Escritorio (Columna Derecha: 7 cols) */}
          <div className="flex min-w-0 flex-col self-start rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6 xl:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2F6] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    VISTA PREVIA EN VIVO
                  </span>
                  <h4 className="text-sm font-bold text-[#111827] sm:text-[15px]">
                    Simulador de Invitación Virtual Interactiva
                  </h4>
                </div>
              </div>

              {/* Selector de dispositivo: Móvil vs Escritorio (sin bordes redondeados) */}
              <div className="grid w-full grid-cols-2 border border-[#E5E7EB] bg-[#F4F5F8] p-1 sm:flex sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none px-3.5 py-1.5 text-center text-xs font-semibold transition ${
                    previewDevice === "mobile"
                      ? "bg-[#6D28D9] text-white shadow-xs"
                      : "text-[#6B7280] hover:text-[#6D28D9]"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Móvil
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none px-3.5 py-1.5 text-center text-xs font-semibold transition ${
                    previewDevice === "desktop"
                      ? "bg-[#6D28D9] text-white shadow-xs"
                      : "text-[#6B7280] hover:text-[#6D28D9]"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Escritorio
                </button>
              </div>
            </div>

            {/* Contenedor del Simulador */}
            <div className="mt-5 flex items-start justify-center">
              {previewDevice === "mobile" ? (
                /* SIMULADOR DE PANTALLA MÓVIL */
                <div className="w-full max-w-[360px] rounded-[2.2rem] border-4 border-white/15 bg-[#0F1A45] p-2.5 shadow-[0_0_50px_rgba(0,0,0,0.85)] sm:rounded-[2.6rem] sm:border-[6px] sm:p-3">
                  {/* Notch de smartphone */}
                  <div className="mx-auto mb-2.5 h-1.5 w-20 rounded-full bg-white/20" />

                  <div
                    className={`overflow-hidden rounded-[1.8rem] border bg-gradient-to-b sm:rounded-[2rem] ${tpl.bg} ${tpl.border}`}
                  >
                    {invForm.imagen_portada && (
                      <div className="relative h-44 w-full overflow-hidden">
                        <img
                          src={invForm.imagen_portada}
                          alt="Póster del evento"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06070b] via-black/30 to-transparent" />
                      </div>
                    )}

                    <div className="p-3.5 text-center sm:p-5">
                      <span
                        className="inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
                        style={{
                          backgroundColor: invForm.color_acento || tpl.accent,
                        }}
                      >
                        {invForm.tipo_evento}
                      </span>

                      <h2 className="font-display mt-3 break-words text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
                        {invForm.nombre}
                      </h2>

                      <p className="mt-2 break-words text-xs leading-relaxed text-gray-300">
                        {invForm.mensaje_invitacion}
                      </p>

                      {/* Contador rápido */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/50 p-2.5 text-center">
                        <div>
                          <span className="block text-base font-bold text-white">
                            {diasParaEvento}
                          </span>
                          <span className="text-[9px] uppercase text-gray-400">
                            Días Restantes
                          </span>
                        </div>
                        <div>
                          <span className="block text-base font-bold text-white">
                            {invForm.hora_evento}
                          </span>
                          <span className="text-[9px] uppercase text-gray-400">
                            Hora
                          </span>
                        </div>
                        <div>
                          <span className="block text-base font-bold text-[#15b2f5]">
                            GENERAL
                          </span>
                          <span className="text-[9px] uppercase text-gray-400">
                            Pase
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5 rounded-xl border border-white/10 bg-black/40 p-3 text-left text-[11px] text-gray-200">
                        <p className="flex items-start gap-1.5">
                          <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15b2f5]" />
                          <span>
                            <strong>Fecha:</strong> {invForm.fecha_evento}
                          </span>
                        </p>
                        {Boolean(
                          invForm.fecha_limite_rsvp_activa &&
                            invForm.fecha_limite_rsvp
                        ) && (
                          <p
                            className={`flex items-start gap-1.5 ${
                              isPreviewFechaLimiteVencida
                                ? "text-rose-300"
                                : "text-amber-300"
                            }`}
                          >
                            <Hourglass className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>
                              <strong>Fecha límite para confirmar:</strong>{" "}
                              {invForm.fecha_limite_rsvp}{" "}
                              {isPreviewFechaLimiteVencida ? "(Caducada)" : ""}
                            </span>
                          </p>
                        )}
                        <p className="flex items-start gap-1.5">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15b2f5]" />
                          <span>
                            <strong>Lugar:</strong>{" "}
                            {invForm.lugar || "Por confirmar"}
                          </span>
                        </p>
                        {invForm.direccion && (
                          <p className="flex items-start gap-1.5 truncate">
                            <MapIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15b2f5]" />
                            <span className="truncate">
                              <strong>Dirección:</strong> {invForm.direccion}
                            </span>
                          </p>
                        )}
                        <p className="flex items-start gap-1.5">
                          <Shirt className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15b2f5]" />
                          <span>
                            <strong>Código de Vestimenta:</strong>{" "}
                            {invForm.codigo_vestimenta}
                          </span>
                        </p>
                      </div>

                      {/* Ubicación interactiva de Google Maps en la Tarjeta Móvil */}
                      <div className="mt-3 overflow-hidden rounded-xl border border-white/15 bg-black/40 text-left">
                        <iframe
                          title="Mapa del evento en invitación móvil"
                          src={mapLocation.embedUrl}
                          className="h-28 w-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                        <div className="flex items-center justify-between gap-2 px-3 py-2 text-[10px]">
                          <span className="inline-flex min-w-0 items-center gap-1 truncate font-semibold text-gray-300">
                            <MapPin className="h-3 w-3 shrink-0 text-[#15b2f5]" />
                            <span className="truncate">
                              {invForm.lugar || "Ubicación del Evento"}
                            </span>
                          </span>
                          <a
                            href={mapLocation.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 font-extrabold text-[#15b2f5] hover:underline"
                          >
                            <MapIcon className="h-3 w-3 shrink-0" />
                            <span>Ver en Maps</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        </div>
                      </div>

                      {/* Notificación de Modalidad de Invitados en la Tarjeta Móvil */}
                      <div className="mt-3 rounded-xl border border-[#15b2f5]/40 bg-[#15b2f5]/10 px-3 py-2 text-center shadow-[0_0_15px_rgba(21,178,245,0.15)]">
                        <span className="inline-flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#15b2f5]">
                          <Bell className="h-3 w-3 shrink-0" />
                          <span>MODALIDAD DE ASISTENCIA</span>
                        </span>
                        <strong className="mt-0.5 flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-white">
                          <Ticket className="h-3.5 w-3.5 shrink-0 text-[#15b2f5]" />
                          <span>{normalizeModalidad(invForm.modalidad_invitados)}</span>
                        </strong>
                      </div>

                      {/* Mesa de Regalos en la Tarjeta Móvil */}
                      {Boolean(invForm.mesa_regalos_habilitada) &&
                        (() => {
                          const rawUrl = String(
                            invForm.mesa_regalos_url ||
                              mesaRegalosItems[0]?.url ||
                              ""
                          ).trim();
                          const hrefUrl =
                            rawUrl && !/^https?:\/\//i.test(rawUrl)
                              ? `https://${rawUrl}`
                              : rawUrl;
                          const tiendaActual =
                            invForm.mesa_regalos_tienda ||
                            detectStoreFromUrl(hrefUrl) ||
                            mesaRegalosItems[0]?.tienda ||
                            "Amazon";
                          const meta = getTiendaMeta(tiendaActual);
                          const TiendaIcon = meta.Icon;
                          return (
                            <div className="mt-3 rounded-xl border border-amber-400/35 bg-black/40 p-3 text-left">
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                                  <Gift className="h-3.5 w-3.5 shrink-0" />
                                  <span>MESA DE REGALOS</span>
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold ${meta.badgeClass}`}
                                >
                                  <TiendaIcon className="h-3 w-3 shrink-0" />
                                  <span>{tiendaActual}</span>
                                </span>
                              </div>
                              {hrefUrl ? (
                                <a
                                  href={hrefUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 flex items-center justify-between gap-2 rounded-none border border-amber-400/40 bg-amber-400/15 px-3 py-2 text-[11px] font-extrabold text-amber-200 transition hover:bg-amber-400/25"
                                >
                                  <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                                    <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">
                                      Ver Carrito / Lista en {tiendaActual}
                                    </span>
                                  </span>
                                  <span className="inline-flex shrink-0 items-center gap-1">
                                    <span>Abrir</span>
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                  </span>
                                </a>
                              ) : (
                                <p className="mt-1.5 text-[10px] text-gray-400">
                                  Pega el link de tu carrito de compras (Amazon,
                                  Mercado Libre, etc.) en el editor para
                                  mostrarlo aquí.
                                </p>
                              )}
                            </div>
                          );
                        })()}

                      <button
                        type="button"
                        onClick={async () => {
                          const realUrl = await ensureRealShareUrl();
                          if (realUrl) {
                            window.open(realUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition hover:brightness-110"
                        style={{
                          backgroundColor: isPreviewFechaLimiteVencida
                            ? "#e11d48"
                            : invForm.color_secundario || "#15b2f5",
                          color: isPreviewFechaLimiteVencida
                            ? "#ffffff"
                            : "#000000",
                        }}
                        title="Haz clic para abrir y probar el formulario real de Confirmación de Asistencia"
                      >
                        {isPreviewFechaLimiteVencida ? (
                          <>
                            <Hourglass className="h-3.5 w-3.5 shrink-0" />
                            <span>FECHA DE CONFIRMACIÓN CADUCADA</span>
                          </>
                        ) : (
                          <span>Confirmar Asistencia</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* SIMULADOR DE PANTALLA DE ESCRITORIO */
                <div className="w-full overflow-hidden rounded-2xl border border-white/15 bg-[#0F1A45] shadow-2xl">
                  {/* Barra de navegador simulada */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#142257] px-3 py-2 sm:px-4">
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="max-w-[160px] truncate rounded bg-black/50 px-2.5 py-0.5 font-mono text-[10px] text-gray-400 sm:max-w-xs sm:px-3">
                      {baseShareUrl}
                    </span>
                    <span className="shrink-0 text-[10px] text-[#15b2f5]">
                      100% HD
                    </span>
                  </div>

                  <div
                    className={`grid grid-cols-1 md:grid-cols-12 bg-gradient-to-br ${tpl.bg}`}
                  >
                    {/* Póster Izquierdo en Escritorio */}
                    <div className="relative min-h-[240px] sm:min-h-[320px] md:col-span-5">
                      {invForm.imagen_portada ? (
                        <img
                          src={invForm.imagen_portada}
                          alt="Póster"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                          <div
                            className="flex h-20 w-20 items-center justify-center rounded-2xl border text-3xl text-white shadow-lg"
                            style={{
                              borderColor: invForm.color_acento || tpl.accent,
                              backgroundColor: `${
                                invForm.color_acento || tpl.accent
                              }22`,
                            }}
                          >
                            <PartyPopper className="h-9 w-9 shrink-0" />
                          </div>
                          <p className="mt-3 text-xs uppercase tracking-widest text-gray-400">
                            {invForm.tipo_evento}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#06070b]/90 hidden md:block" />
                    </div>

                    {/* Contenido Derecho en Escritorio */}
                    <div className="flex flex-col justify-between p-4 sm:p-8 md:col-span-7">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                            style={{
                              backgroundColor:
                                invForm.color_acento || tpl.accent,
                            }}
                          >
                            {invForm.tipo_evento}
                          </span>
                          <span className="font-mono text-xs text-[#15b2f5]">
                            Faltan {diasParaEvento} días
                          </span>
                        </div>

                        <h2 className="font-display mt-4 text-2xl font-bold uppercase tracking-wide text-white sm:text-4xl">
                          {invForm.nombre}
                        </h2>

                        <p className="mt-3 text-xs leading-relaxed text-gray-300 sm:text-sm">
                          {invForm.mensaje_invitacion}
                        </p>

                        <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs sm:mt-6 sm:grid-cols-2 sm:p-4">
                          <div>
                            <span className="block text-[10px] uppercase text-gray-400">
                              Fecha y Hora
                            </span>
                            <strong className="text-white">
                              {invForm.fecha_evento} • {invForm.hora_evento} hrs
                            </strong>
                            {Boolean(
                              invForm.fecha_limite_rsvp_activa &&
                                invForm.fecha_limite_rsvp
                            ) && (
                              <span
                                className={`mt-1 inline-flex items-center gap-1 text-[11px] font-bold ${
                                  isPreviewFechaLimiteVencida
                                    ? "text-rose-300"
                                    : "text-amber-300"
                                }`}
                              >
                                <Hourglass className="h-3 w-3 shrink-0" />
                                <span>
                                  Límite confirmación:{" "}
                                  {invForm.fecha_limite_rsvp}{" "}
                                  {isPreviewFechaLimiteVencida ? "(Caducada)" : ""}
                                </span>
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase text-gray-400">
                              Ubicación
                            </span>
                            <strong className="text-white">
                              {invForm.lugar || "Salón Principal"}
                            </strong>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase text-gray-400">
                              Dirección
                            </span>
                            <strong className="text-gray-300">
                              {invForm.direccion || "Ver mapa interactivo"}
                            </strong>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase text-gray-400">
                              Código de Vestimenta
                            </span>
                            <strong className="text-[#15b2f5]">
                              {invForm.codigo_vestimenta}
                            </strong>
                          </div>
                        </div>

                        {/* Notificación de Modalidad de Invitados en la Tarjeta de Escritorio */}
                        <div className="mt-4 flex flex-col items-center justify-between gap-1 rounded-xl border border-[#15b2f5]/40 bg-[#15b2f5]/10 px-4 py-2.5 text-center shadow-[0_0_15px_rgba(21,178,245,0.15)] sm:flex-row sm:text-left">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#15b2f5]">
                            <Bell className="h-3.5 w-3.5 shrink-0" />
                            <span>Modalidad de Asistencia Notificada:</span>
                          </span>
                          <strong className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                            <Ticket className="h-3.5 w-3.5 shrink-0 text-[#15b2f5]" />
                            <span>{normalizeModalidad(invForm.modalidad_invitados)}</span>
                          </strong>
                        </div>

                        {/* Mapa Interactivo de Ubicación en la Tarjeta de Escritorio */}
                        <div className="mt-4 overflow-hidden rounded-xl border border-white/15 bg-black/40">
                          <iframe
                            title="Mapa del evento en invitación de escritorio"
                            src={mapLocation.embedUrl}
                            className="h-36 w-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>

                        {/* Mesa de Regalos en la Tarjeta de Escritorio */}
                        {Boolean(invForm.mesa_regalos_habilitada) &&
                          (() => {
                            const rawUrl = String(
                              invForm.mesa_regalos_url ||
                                mesaRegalosItems[0]?.url ||
                                ""
                            ).trim();
                            const hrefUrl =
                              rawUrl && !/^https?:\/\//i.test(rawUrl)
                                ? `https://${rawUrl}`
                                : rawUrl;
                            const tiendaActual =
                              invForm.mesa_regalos_tienda ||
                              detectStoreFromUrl(hrefUrl) ||
                              mesaRegalosItems[0]?.tienda ||
                              "Amazon";
                            const meta = getTiendaMeta(tiendaActual);
                            const TiendaIcon = meta.Icon;
                            return (
                              <div className="mt-4 rounded-xl border border-amber-400/35 bg-black/40 p-3.5 text-left">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                                    <Gift className="h-3.5 w-3.5 shrink-0" />
                                    <span>MESA DE REGALOS SUGERIDOS</span>
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${meta.badgeClass}`}
                                  >
                                    <TiendaIcon className="h-3 w-3 shrink-0" />
                                    <span>{tiendaActual}</span>
                                  </span>
                                </div>
                                {hrefUrl ? (
                                  <a
                                    href={hrefUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2.5 flex items-center justify-between gap-3 rounded-none border border-amber-400/40 bg-amber-400/15 px-3.5 py-2.5 text-xs font-extrabold text-amber-200 transition hover:bg-amber-400/25"
                                  >
                                    <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                                      <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                                      <span className="truncate">
                                        Ver Carrito de Compras / Mesa de Regalos en{" "}
                                        {tiendaActual}
                                      </span>
                                    </span>
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-none bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold text-[#171F39]">
                                      <span>Abrir Carrito</span>
                                      <ExternalLink className="h-3 w-3 shrink-0" />
                                    </span>
                                  </a>
                                ) : (
                                  <p className="mt-1.5 text-xs text-gray-400">
                                    Pega el link de tu carrito de compras
                                    (Amazon, Mercado Libre, IKEA, etc.) en el
                                    editor para visualizarlo aquí.
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                      </div>

                      <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                        <button
                          type="button"
                          onClick={async () => {
                            const realUrl = await ensureRealShareUrl();
                            if (realUrl) {
                              window.open(realUrl, "_blank", "noopener,noreferrer");
                            }
                          }}
                          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-none py-3 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition hover:brightness-110"
                          style={{
                            backgroundColor: isPreviewFechaLimiteVencida
                              ? "#e11d48"
                              : invForm.color_secundario || "#15b2f5",
                            color: isPreviewFechaLimiteVencida
                              ? "#ffffff"
                              : "#000000",
                          }}
                          title="Haz clic para abrir y probar el formulario real de Confirmación de Asistencia"
                        >
                          {isPreviewFechaLimiteVencida ? (
                            <>
                              <Hourglass className="h-3.5 w-3.5 shrink-0" />
                              <span>FECHA DE CONFIRMACIÓN CADUCADA</span>
                            </>
                          ) : (
                            <span>Confirmar Asistencia</span>
                          )}
                        </button>
                        <a
                          href={mapLocation.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-none border border-white/15 bg-white/5 px-4 py-3 text-center text-xs font-bold text-gray-200 transition hover:border-[#15b2f5] hover:text-[#15b2f5]"
                        >
                          <MapIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Ver Mapa</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Barra inferior para probar la Invitación Pública en Vivo */}
            <div className="mt-5 flex flex-col items-stretch justify-between gap-3 rounded-xl border border-[#F1F2F6] bg-[#FAFAFC] p-3.5 text-xs sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                  <Rocket className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold text-[#111827]">
                    Enlace Público Activo
                  </span>
                  <code className="mt-0.5 block break-all font-mono text-[11px] font-medium text-[#6D28D9] sm:truncate">
                    {baseShareUrl}
                  </code>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const realUrl = await ensureRealShareUrl();
                  if (realUrl) {
                    window.open(realUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-center text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
              >
                Abrir Invitación Pública en Vivo
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* =================================================================
              ZONA INFERIOR: GENERADOR DE LINKS ADICIONALES POR MODALIDAD Y PASES
             ================================================================= */}
          <div className="xl:col-span-12 rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1F2F6] pb-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    GENERADOR DE ENLACES PERSONALIZADOS
                  </span>
                  <h2 className="text-sm font-bold text-[#111827] sm:text-base">
                    Links de Invitación por Modalidad de Asistencia y Cantidad de Pases
                  </h2>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">
                    Genera diferentes enlaces para este mismo evento (con la misma plantilla y datos) diferenciados por{" "}
                    <strong className="font-semibold text-[#111827]">
                      Modalidad de Asistencia
                    </strong>{" "}
                    y{" "}
                    <strong className="font-semibold text-[#111827]">
                      Cantidad de Pases (Adultos, Niños)
                    </strong>
                    .
                  </p>
                </div>
              </div>
              <div className="inline-flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] px-3.5 py-2.5 text-[11px] font-medium text-[#6B7280]">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6D28D9]" />
                <span>
                  <strong className="text-[#111827]">Nota:</strong> Si dejas{" "}
                  <strong className="text-[#111827]">Adultos</strong> o{" "}
                  <strong className="text-[#111827]">Niños</strong> en{" "}
                  <strong className="text-[#6D28D9]">0</strong>, el invitado podrá
                  elegir libremente la cantidad. Si ingresas un número mayor a 0,
                  ese campo estará{" "}
                  <strong className="text-[#111827]">bloqueado</strong> para el
                  invitado.
                </span>
              </div>
            </div>

            {/* Formulario para crear o editar un link diferenciado */}
            <form
              onSubmit={handleCreateCustomLink}
              className={`mt-5 grid grid-cols-1 items-end gap-4 rounded-xl border p-4 transition sm:grid-cols-2 sm:p-5 lg:grid-cols-12 ${
                editingCustomLinkId
                  ? "border-[#6D28D9] bg-[#F5F3FF]/60"
                  : "border-[#E5E7EB] bg-[#FAFAFC]"
              }`}
            >
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                  Identificador del Link <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customLinkForm.etiqueta}
                  onChange={(e) => {
                    if (customLinkError) setCustomLinkError("");
                    setCustomLinkForm((p) => ({
                      ...p,
                      etiqueta: e.target.value,
                    }));
                  }}
                  placeholder="Ej. Link 2 Personalizado"
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition ${
                    customLinkError
                      ? "border-rose-500 ring-2 ring-rose-500/20"
                      : "border-[#E5E7EB] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                  }`}
                />
                {customLinkError && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600">
                    {customLinkError}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                  Tipo de Pase
                </label>
                <select
                  value={customLinkForm.tipoPase || "GENERAL"}
                  onChange={(e) =>
                    setCustomLinkForm((p) => ({
                      ...p,
                      tipoPase: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                  Modalidad de Asistencia
                </label>
                <select
                  value={customLinkForm.modalidad}
                  onChange={(e) => {
                    const nuevaMod = e.target.value;
                    setCustomLinkForm((p) => ({
                      ...p,
                      modalidad: nuevaMod,
                      adultos: isSoloNinosMod(nuevaMod) ? 0 : p.adultos,
                      ninos: isSoloAdultosMod(nuevaMod) ? 0 : p.ninos,
                    }));
                  }}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                >
                  {MODALIDADES_INVITADOS.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <label className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] font-medium text-[#9CA3AF]">
                  <span>Pases Adultos</span>
                  {isSoloNinosMod(customLinkForm.modalidad) ? (
                    <span className="rounded bg-[#F4F5F8] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                      No aplica
                    </span>
                  ) : Number(customLinkForm.adultos) > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded bg-[#F3E8FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                      <Lock className="h-2.5 w-2.5" /> Bloqueado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-[#ECFDF5] px-1.5 py-0.5 text-[10px] font-semibold text-[#059669]">
                      <Unlock className="h-2.5 w-2.5" /> Libre (0)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  disabled={isSoloNinosMod(customLinkForm.modalidad)}
                  value={
                    isSoloNinosMod(customLinkForm.modalidad)
                      ? 0
                      : customLinkForm.adultos
                  }
                  onChange={(e) =>
                    setCustomLinkForm((p) => ({
                      ...p,
                      adultos: Math.max(0, parseInt(e.target.value || "0", 10) || 0),
                    }))
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:opacity-50"
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <label className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] font-medium text-[#9CA3AF]">
                  <span>Pases Niños</span>
                  {isSoloAdultosMod(customLinkForm.modalidad) ? (
                    <span className="rounded bg-[#F4F5F8] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                      No aplica
                    </span>
                  ) : Number(customLinkForm.ninos) > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded bg-[#F3E8FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                      <Lock className="h-2.5 w-2.5" /> Bloqueado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-[#ECFDF5] px-1.5 py-0.5 text-[10px] font-semibold text-[#059669]">
                      <Unlock className="h-2.5 w-2.5" /> Libre (0)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  disabled={isSoloAdultosMod(customLinkForm.modalidad)}
                  value={
                    isSoloAdultosMod(customLinkForm.modalidad)
                      ? 0
                      : customLinkForm.ninos
                  }
                  onChange={(e) =>
                    setCustomLinkForm((p) => ({
                      ...p,
                      ninos: Math.max(0, parseInt(e.target.value || "0", 10) || 0),
                    }))
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:opacity-50"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                {editingCustomLinkId ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="submit"
                      className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-3 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditCustomLink}
                      title="Cancelar edición"
                      className="inline-flex cursor-pointer items-center justify-center rounded-none border border-[#E5E7EB] bg-white px-2.5 py-2.5 text-xs font-bold text-[#6B7280] transition hover:border-rose-400 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Crear Link
                  </button>
                )}
              </div>
            </form>

            {/* Tabla de Links Generados */}
            <div className="mt-6 overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="min-w-[780px] w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F7F8FB] text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    <th className="px-4 py-3">Identificador del Link</th>
                    <th className="px-4 py-3">Tipo de Pase</th>
                    <th className="px-4 py-3">Modalidad de Asistencia</th>
                    <th className="px-4 py-3">Pases Adultos</th>
                    <th className="px-4 py-3">Pases Niños</th>
                    <th className="px-4 py-3">Link Generado</th>
                    <th className="px-4 py-3 text-right">Copiar o Compartir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F6] bg-white">
                  {/* Fila 1: Link General Principal del Evento */}
                  <tr className="bg-[#FAFAFC] hover:bg-[#F5F3FF]/40">
                    <td className="px-4 py-3.5 font-bold text-[#111827]">
                      <span className="mr-2 inline-flex items-center gap-1 rounded-md bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                        <Star className="h-3 w-3" /> Principal
                      </span>
                      Link General del Evento
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#374151]">
                        GENERAL
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-semibold text-[#6D28D9]">
                        <Ticket className="h-3.5 w-3.5" />
                        {normalizeModalidad(invForm.modalidad_invitados)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isSoloNinosMod(invForm.modalidad_invitados) ? (
                        <span className="rounded-lg bg-[#F4F5F8] px-2.5 py-1 text-[11px] font-medium text-[#6B7280]">
                          No aplica (0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#059669]">
                          <Unlock className="h-3 w-3" /> 0 (Libre)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {isSoloAdultosMod(invForm.modalidad_invitados) ? (
                        <span className="rounded-lg bg-[#F4F5F8] px-2.5 py-1 text-[11px] font-medium text-[#6B7280]">
                          No aplica (0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#059669]">
                          <Unlock className="h-3 w-3" /> 0 (Libre)
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 font-mono text-[11px] text-[#111827]">
                      <a
                        href={baseShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#6D28D9] hover:underline"
                        title={baseShareUrl}
                      >
                        {baseShareUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(baseShareUrl);
                            showNotice("✓ Link general copiado al portapapeles.");
                          }}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#374151] transition hover:border-[#6D28D9] hover:text-[#6D28D9]"
                        >
                          <Copy className="h-3 w-3" />
                          Copiar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleWhatsAppCustomLink({
                              modalidad: normalizeModalidad(
                                invForm.modalidad_invitados
                              ),
                              url: baseShareUrl,
                            })
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1.5 text-[11px] font-semibold text-[#059669] transition hover:bg-[#059669] hover:text-white"
                        >
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleShareCustomLink({
                              modalidad: normalizeModalidad(
                                invForm.modalidad_invitados
                              ),
                              url: baseShareUrl,
                            })
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded-none bg-[#6D28D9] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#5B21B6]"
                        >
                          <Share2 className="h-3 w-3" />
                          Compartir
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Filas de Links Personalizados Creados */}
                  {customLinksItems.map((item) => {
                    const soloAd = isSoloAdultosMod(item.modalidad);
                    const soloNi = isSoloNinosMod(item.modalidad);
                    return (
                      <tr
                        key={item.iditem}
                        className={`transition ${
                          editingCustomLinkId === item.iditem
                            ? "bg-[#F5F3FF]"
                            : "hover:bg-[#FAFAFC]"
                        }`}
                      >
                        <td className="px-4 py-3.5 font-bold text-[#111827]">
                          {item.etiqueta}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                              item.tipoPase === "VIP"
                                ? "border-[#DDD6FE] bg-[#F3E8FF] text-[#6D28D9]"
                                : "border-[#E5E7EB] bg-white text-[#374151]"
                            }`}
                          >
                            {item.tipoPase || "GENERAL"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-semibold text-[#6D28D9]">
                            <Ticket className="h-3.5 w-3.5" /> {item.modalidad}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {soloNi ? (
                            <span className="rounded-lg bg-[#F4F5F8] px-2.5 py-1 text-[11px] font-medium text-[#6B7280]">
                              No aplica (0)
                            </span>
                          ) : item.adultos > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-semibold text-[#6D28D9]">
                              <Lock className="h-3 w-3" /> {item.adultos} Adulto(s) (Bloqueado)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#059669]">
                              <Unlock className="h-3 w-3" /> 0 (Libre)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {soloAd ? (
                            <span className="rounded-lg bg-[#F4F5F8] px-2.5 py-1 text-[11px] font-medium text-[#6B7280]">
                              No aplica (0)
                            </span>
                          ) : item.ninos > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-semibold text-[#6D28D9]">
                              <Lock className="h-3 w-3" /> {item.ninos} Niño(s) (Bloqueado)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#059669]">
                              <Unlock className="h-3 w-3" /> 0 (Libre)
                            </span>
                          )}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3.5 font-mono text-[11px] text-[#111827]">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#6D28D9] hover:underline"
                            title={item.url}
                          >
                            {item.url}
                          </a>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditCustomLink(item)}
                              title="Editar este link"
                              className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#6D28D9] transition hover:border-[#6D28D9] hover:bg-[#F5F3FF]"
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(item.url);
                                showNotice(
                                  `✓ Link "${item.etiqueta}" copiado al portapapeles.`
                                );
                              }}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#374151] transition hover:border-[#6D28D9] hover:text-[#6D28D9]"
                            >
                              <Copy className="h-3 w-3" />
                              Copiar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleWhatsAppCustomLink(item)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1.5 text-[11px] font-semibold text-[#059669] transition hover:bg-[#059669] hover:text-white"
                            >
                              <MessageCircle className="h-3 w-3" />
                              WhatsApp
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShareCustomLink(item)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-none bg-[#6D28D9] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#5B21B6]"
                            >
                              <Share2 className="h-3 w-3" />
                              Compartir
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLogistica(item.iditem)}
                              title="Eliminar este link"
                              className="inline-flex cursor-pointer items-center justify-center rounded-none border border-[#E5E7EB] bg-white px-2 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal de Confirmación al Crear Link */}
            {showConfirmCreateLinkModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-xs">
                <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-2xl sm:p-6">
                  <div className="flex items-start justify-between gap-3 border-b border-[#F1F2F6] pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                        <Link2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#111827] sm:text-base">
                          ¿Confirmas crear este link de invitación?
                        </h3>
                        <p className="mt-0.5 text-xs text-[#9CA3AF]">
                          Verifica los datos del link antes de agregarlo a la tabla:
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmCreateLinkModal(false)}
                      className="inline-flex cursor-pointer items-center justify-center rounded-none border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-bold text-[#6B7280] hover:border-rose-300 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-3.5 text-xs sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-[#9CA3AF]">
                        Identificador del Link:
                      </span>
                      <span className="font-bold text-[#111827]">
                        {customLinkForm.etiqueta.trim()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-[#9CA3AF]">
                        Tipo de Pase:
                      </span>
                      <span className="font-bold text-[#111827]">
                        {customLinkForm.tipoPase || "GENERAL"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-[#9CA3AF]">
                        Modalidad de Asistencia:
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#F3E8FF] px-2.5 py-0.5 font-semibold text-[#6D28D9]">
                        <Ticket className="h-3.5 w-3.5" /> {customLinkForm.modalidad}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-[#9CA3AF]">
                        Pases Adultos:
                      </span>
                      <span className="font-bold text-[#111827]">
                        {isSoloNinosMod(customLinkForm.modalidad)
                          ? "No aplica (0)"
                          : Number(customLinkForm.adultos) > 0
                          ? `${customLinkForm.adultos} Adulto(s) (Bloqueado)`
                          : "0 (Libre)"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-[#9CA3AF]">
                        Pases Niños:
                      </span>
                      <span className="font-bold text-[#111827]">
                        {isSoloAdultosMod(customLinkForm.modalidad)
                          ? "No aplica (0)"
                          : Number(customLinkForm.ninos) > 0
                          ? `${customLinkForm.ninos} Niño(s) (Bloqueado)`
                          : "0 (Libre)"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmCreateLinkModal(false)}
                      className="cursor-pointer rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B7280] transition hover:border-[#111827] hover:text-[#111827]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={executeSaveCustomLink}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Sí, Crear Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PESTAÑA: 🛠️ CONFIGURACIÓN (/events/[id]/config) — ESTILO TARJETAS LIMPIAS & VIOLETA ELÉCTRICO (#6D28D9)
         ===================================================================== */}
      {currentTab === "config" && (
        <div className="w-full">
          <form
            onSubmit={handleSaveEvento}
            className="w-full space-y-5 rounded-3xl bg-[#F7F8FB] p-3 text-[#111827] sm:space-y-6 sm:p-6"
          >
            {/* Cabecera Superior Estilo Tarjeta Limpia */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-start gap-3.5 sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-[#111827] sm:text-lg">
                    Configuración del Evento
                  </h3>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">
                    Configura la fecha límite de confirmación, límite de invitados permitidos, acceso QR, mesa de regalos, itinerario y ubicación.
                  </p>
                </div>
              </div>
              <span className="w-fit shrink-0 rounded-lg bg-[#F3E8FF] px-3 py-1.5 text-[11px] font-semibold text-[#6D28D9]">
                Ajustes Generales
              </span>
            </div>

            {/* 1. Tarjeta: Fecha Límite de Confirmación al Evento */}
            <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F1F2F6] pb-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                    <Hourglass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] sm:text-[15px]">
                      Fecha Límite de Confirmación al Evento
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#9CA3AF]">
                      Asigna una fecha límite para que tus invitados confirmen
                      su asistencia. Cuando pase la fecha límite, el sistema ya
                      no permitirá confirmar y mostrará que la fecha de
                      confirmación ya caducó.
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-semibold ${
                    invForm.fecha_limite_rsvp_activa
                      ? "bg-[#ECFDF5] text-[#059669]"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                >
                  {invForm.fecha_limite_rsvp_activa ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Activa ({invForm.fecha_limite_rsvp || "Sin fecha"})
                    </>
                  ) : (
                    "Sin Fecha Límite"
                  )}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 md:grid-cols-12">
                <div className="sm:col-span-2 md:col-span-6">
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs font-semibold transition select-none ${
                      invForm.fecha_limite_rsvp_activa
                        ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9]"
                        : "border-[#E5E7EB] bg-white text-[#1F2937] hover:border-[#6D28D9]/50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={Boolean(invForm.fecha_limite_rsvp_activa)}
                        onChange={async (e) => {
                          const checked = e.target.checked;
                          const nextFecha = checked
                            ? invForm.fecha_limite_rsvp ||
                              invForm.fecha_evento ||
                              ""
                            : "";
                          setInvForm((prev) => ({
                            ...prev,
                            fecha_limite_rsvp_activa: checked,
                            fecha_limite_rsvp: nextFecha,
                          }));
                          if (evento.idevento) {
                            await handleSaveEvento(null, {
                              fecha_limite_rsvp_activa: checked,
                              fecha_limite_rsvp: nextFecha,
                            });
                          }
                        }}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-[#6D28D9]"
                      />
                      <span>
                        Asignar Fecha Límite de confirmación al Evento
                      </span>
                    </span>
                    {invForm.fecha_limite_rsvp_activa && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </label>
                </div>

                <div className="sm:col-span-1 md:col-span-3">
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    max={invForm.fecha_evento || undefined}
                    disabled={!invForm.fecha_limite_rsvp_activa}
                    value={
                      invForm.fecha_limite_rsvp_activa
                        ? invForm.fecha_limite_rsvp || ""
                        : ""
                    }
                    onChange={async (e) => {
                      const nextDate = e.target.value;
                      setInvForm((prev) => ({
                        ...prev,
                        fecha_limite_rsvp: nextDate,
                      }));
                      if (
                        evento.idevento &&
                        /^\d{4}-\d{2}-\d{2}$/.test(nextDate)
                      ) {
                        await handleSaveEvento(null, {
                          fecha_limite_rsvp_activa: true,
                          fecha_limite_rsvp: nextDate,
                        });
                      }
                    }}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:opacity-60"
                  />
                </div>

                <div className="sm:col-span-1 md:col-span-3">
                  <button
                    type="button"
                    disabled={!invForm.fecha_limite_rsvp_activa}
                    onClick={async () => {
                      if (!invForm.fecha_limite_rsvp) {
                        showNotice(
                          "Selecciona la fecha límite de confirmación."
                        );
                        return;
                      }
                      await handleSaveEvento(null, {
                        fecha_limite_rsvp_activa: true,
                        fecha_limite_rsvp: invForm.fecha_limite_rsvp,
                      });
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Guardar Fecha
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Tarjeta: Número de Invitados Permitidos y Opciones del Evento */}
            <div className="space-y-5 rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
              {/* Número de Invitados Permitidos */}
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#111827] sm:text-[15px]">
                        Número de Invitados Permitidos (Límite del Evento)
                      </h4>
                      <p className="text-[11px] text-[#9CA3AF]">
                        Si al compartir las invitaciones virtuales por WhatsApp o Correo se sobrepasa este número, el sistema mostrará una advertencia.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-semibold ${
                      isGuestLimitExceeded
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-[#F3E8FF] text-[#6D28D9]"
                    }`}
                  >
                    {isGuestLimitExceeded ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Superado: {totalInvitadosCount} invitados / {totalPasesLista} lugares
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        En lista: {totalInvitadosCount} invitados / {totalPasesLista} lugares
                      </>
                    )}
                  </span>
                </div>

                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={invForm.capacidad ?? evento.capacidad ?? 100}
                  onChange={(e) =>
                    setInvForm((prev) => ({
                      ...prev,
                      capacidad: e.target.value,
                    }))
                  }
                  placeholder="Ej. 100"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                />
              </div>

              {/* Opciones activables estilo filas "Preffered Positions" */}
              <div className="space-y-3 border-t border-[#F1F2F6] pt-4">
                {/* ¿Confirmar Acceso el día del evento? */}
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-xs transition hover:border-[#6D28D9]/50">
                  <div className="flex items-start gap-3 sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[13px] font-semibold text-[#111827]">
                        ¿Confirmar Acceso el día del evento?
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#9CA3AF]">
                        Si está activado, al invitado se le mostrará un Código QR
                        después de confirmar su asistencia en la invitación virtual.
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    {Boolean(
                      invForm.confirmar_acceso_qr ??
                        invForm.permitir_acompanantes ??
                        true
                    ) && (
                      <span className="hidden rounded-md bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#059669] sm:inline-block">
                        Activo
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={Boolean(
                        invForm.confirmar_acceso_qr ??
                          invForm.permitir_acompanantes ??
                          true
                      )}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        setInvForm((prev) => ({
                          ...prev,
                          confirmar_acceso_qr: checked,
                          permitir_acompanantes: checked,
                        }));
                        if (evento.idevento) {
                          await handleSaveEvento(null, {
                            confirmar_acceso_qr: checked,
                            permitir_acompanantes: checked,
                          });
                        }
                      }}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-[#6D28D9]"
                    />
                  </div>
                </label>

                {/* ¿Tu evento tendrá Mesa de Regalos? */}
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-xs transition hover:border-[#6D28D9]/50">
                  <div className="flex items-start gap-3 sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[13px] font-semibold text-[#111827]">
                        ¿Tu evento tendrá Mesa de Regalos?
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#9CA3AF]">
                        Activa esta opción para agregar un único link al carrito
                        de compras o lista de regalos del anfitrión (Amazon,
                        Mercado Libre, IKEA, Liverpool, etc.) y mostrarlo en tu
                        invitación digital.
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    {Boolean(invForm.mesa_regalos_habilitada) && (
                      <span className="hidden rounded-md bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#059669] sm:inline-block">
                        Activo
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={Boolean(invForm.mesa_regalos_habilitada)}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        setInvForm((prev) => ({
                          ...prev,
                          mesa_regalos_habilitada: checked,
                        }));
                        if (evento.idevento) {
                          await handleSaveEvento(null, {
                            mesa_regalos_habilitada: checked,
                          });
                        }
                      }}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-[#6D28D9]"
                    />
                  </div>
                </label>

                {/* Casilla para habilitar el Itinerario de Evento */}
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-xs transition hover:border-[#6D28D9]/50">
                  <div className="flex items-start gap-3 sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[13px] font-semibold text-[#111827]">
                        Agregar Itinerario
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#9CA3AF]">
                        Marca esta casilla para desplegar y completar el itinerario de actividades del evento con horario inicial, horario final, título de actividad y descripción.
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    {Boolean(invForm.itinerario_habilitado) && (
                      <span className="hidden rounded-md bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#059669] sm:inline-block">
                        Activo
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={Boolean(invForm.itinerario_habilitado)}
                      onChange={(e) =>
                        handleToggleItinerarioHabilitado(e.target.checked)
                      }
                      className="h-4 w-4 shrink-0 cursor-pointer accent-[#6D28D9]"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Panel de Mesa de Regalos: Link único del Carrito / Lista del Anfitrión */}
            {Boolean(invForm.mesa_regalos_habilitada) && (
              <div className="space-y-4 rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F2F6] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                        LINK DE MESA DE REGALOS / CARRITO DEL ANFITRIÓN
                      </span>
                      <h4 className="text-sm font-bold text-[#111827]">
                        Agrega el enlace del carrito de compras o lista de regalos
                      </h4>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-semibold ${
                      String(invForm.mesa_regalos_url || "").trim()
                        ? "bg-[#ECFDF5] text-[#059669]"
                        : "bg-[#F3E8FF] text-[#6D28D9]"
                    }`}
                  >
                    {String(invForm.mesa_regalos_url || "").trim() ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Link configurado
                      </>
                    ) : (
                      "Pendiente de link"
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                      Tienda del Carrito / Lista
                    </label>
                    <select
                      value={
                        TIENDAS_MESA_REGALOS.includes(
                          invForm.mesa_regalos_tienda || "Amazon"
                        )
                          ? invForm.mesa_regalos_tienda || "Amazon"
                          : "Otra tienda"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setInvForm((prev) => ({
                          ...prev,
                          mesa_regalos_tienda:
                            val === "Otra tienda" ? "Tienda Externa" : val,
                        }));
                      }}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                    >
                      {TIENDAS_MESA_REGALOS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0 sm:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                      Link del Carrito de Compras o Mesa de Regalos del Anfitrión *
                    </label>
                    <input
                      type="url"
                      value={invForm.mesa_regalos_url || ""}
                      onChange={(e) => {
                        if (giftError) setGiftError("");
                        const nextUrl = e.target.value;
                        const detected = detectStoreFromUrl(nextUrl);
                        setInvForm((prev) => ({
                          ...prev,
                          mesa_regalos_url: nextUrl,
                          mesa_regalos_tienda:
                            detected || prev.mesa_regalos_tienda || "Amazon",
                        }));
                      }}
                      placeholder="https://www.amazon.com.mx/... o link del carrito de Mercado Libre..."
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                    />
                  </div>

                  {!TIENDAS_MESA_REGALOS.slice(0, -1).includes(
                    invForm.mesa_regalos_tienda || "Amazon"
                  ) && (
                    <div className="sm:col-span-3">
                      <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                        Nombre personalizado de la Tienda
                      </label>
                      <input
                        type="text"
                        value={
                          invForm.mesa_regalos_tienda === "Otra tienda"
                            ? ""
                            : invForm.mesa_regalos_tienda || ""
                        }
                        onChange={(e) =>
                          setInvForm((prev) => ({
                            ...prev,
                            mesa_regalos_tienda: e.target.value,
                          }))
                        }
                        placeholder="Ej. Zara Home, Sephora, Costco..."
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                      />
                    </div>
                  )}

                  {giftError && (
                    <p className="inline-flex items-center gap-1 sm:col-span-3 text-[11px] font-semibold text-rose-600">
                      <AlertTriangle className="h-3.5 w-3.5" /> {giftError}
                    </p>
                  )}

                  <div className="sm:col-span-3 flex flex-col-reverse items-stretch justify-end gap-2.5 pt-1 sm:flex-row sm:items-center">
                    {String(invForm.mesa_regalos_url || "").trim() && (
                      <button
                        type="button"
                        onClick={async () => {
                          setGiftError("");
                          setInvForm((prev) => ({
                            ...prev,
                            mesa_regalos_url: "",
                          }));
                          if (evento.idevento) {
                            await handleSaveEvento(null, {
                              mesa_regalos_url: "",
                            });
                          }
                        }}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-4 py-2 text-center text-xs font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 sm:w-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Quitar Link
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        let urlClean = String(
                          invForm.mesa_regalos_url || ""
                        ).trim();
                        if (!urlClean) {
                          setGiftError(
                            "Por favor pega el enlace (URL) del carrito de compras o lista de regalos."
                          );
                          return;
                        }
                        if (!/^https?:\/\//i.test(urlClean)) {
                          urlClean = `https://${urlClean}`;
                        }
                        const tiendaFinal =
                          detectStoreFromUrl(urlClean) ||
                          invForm.mesa_regalos_tienda ||
                          "Amazon";
                        setGiftError("");
                        setInvForm((prev) => ({
                          ...prev,
                          mesa_regalos_url: urlClean,
                          mesa_regalos_tienda: tiendaFinal,
                        }));
                        await handleSaveEvento(null, {
                          mesa_regalos_habilitada: true,
                          mesa_regalos_tienda: tiendaFinal,
                          mesa_regalos_url: urlClean,
                        });
                      }}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-center text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6] sm:w-auto"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Guardar Link del Carrito
                    </button>
                  </div>
                </div>

                {/* Vista previa del link configurado estilo "Resume" en imagen de referencia */}
                {String(invForm.mesa_regalos_url || "").trim() ? (
                  (() => {
                    const tiendaActual =
                      invForm.mesa_regalos_tienda ||
                      detectStoreFromUrl(invForm.mesa_regalos_url) ||
                      "Amazon";
                    const hrefUrl = /^https?:\/\//i.test(
                      invForm.mesa_regalos_url.trim()
                    )
                      ? invForm.mesa_regalos_url.trim()
                      : `https://${invForm.mesa_regalos_url.trim()}`;
                    return (
                      <div className="flex min-w-0 flex-col justify-between gap-3 rounded-xl border border-[#F1F2F6] bg-[#FAFAFC] p-3.5 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                            <ShoppingBag className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="truncate text-xs font-bold text-[#111827]">
                                {tiendaActual} — Carrito / Mesa de Regalos
                              </strong>
                            </div>
                            <a
                              href={hrefUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 block max-w-full truncate text-[11px] font-medium text-[#6D28D9] hover:underline"
                            >
                              {hrefUrl}
                            </a>
                          </div>
                        </div>
                        <a
                          href={hrefUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-4 py-2 text-center text-xs font-semibold text-white shadow-[0_4px_12px_rgba(109,40,217,0.2)] transition hover:bg-[#5B21B6] sm:w-auto"
                        >
                          Probar Link
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    );
                  })()
                ) : (
                  <p className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFC] p-3.5 text-center text-xs text-[#9CA3AF]">
                    Pega aquí el enlace único de tu carrito de compras o lista
                    de regalos (por ejemplo de Amazon o Mercado Libre) para que
                    tus invitados accedan directamente desde la invitación.
                  </p>
                )}
              </div>
            )}

            {/* Zona Condicional: ITINERARIO DE EVENTO */}
            {Boolean(invForm.itinerario_habilitado) && (
              <div className="space-y-4 rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F2F6] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                        ITINERARIO DE EVENTO
                      </span>
                      <h4 className="text-sm font-bold text-[#111827] sm:text-[15px]">
                        Itinerario de evento
                      </h4>
                      <p className="text-[11px] text-[#9CA3AF]">
                        Organiza los horarios y actividades de tu celebración
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-[#F3E8FF] px-3 py-1 text-[11px] font-semibold text-[#6D28D9]">
                    {itinerarioItems.length}{" "}
                    {itinerarioItems.length === 1
                      ? "actividad"
                      : "actividades"}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {itinerarioItems.map((act, idx) => (
                    <div
                      key={act.iditem || act.localId || idx}
                      className="rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#6D28D9]/40"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#F1F2F6] pb-2.5">
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-[#111827]">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F3E8FF] text-[11px] font-bold text-[#6D28D9]">
                            {idx + 1}
                          </span>
                          <span>Actividad {idx + 1}</span>
                        </span>

                        {(itinerarioItems.length > 1 ||
                          act.iditem ||
                          act.titulo ||
                          act.descripcion) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItinerarioActividad(idx)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                            title="Eliminar esta actividad"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-12">
                        {/* 1. Horario Inicial */}
                        <div className="col-span-1 min-w-0 lg:col-span-2">
                          <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                            Horario Inicial
                          </label>
                          <input
                            type="time"
                            value={act.horario_inicial || ""}
                            onChange={(e) =>
                              handleUpdateItinerarioField(
                                idx,
                                "horario_inicial",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                          />
                        </div>

                        {/* 2. Horario Final */}
                        <div className="col-span-1 min-w-0 lg:col-span-2">
                          <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                            Horario Final
                          </label>
                          <input
                            type="time"
                            value={act.horario_final || ""}
                            onChange={(e) =>
                              handleUpdateItinerarioField(
                                idx,
                                "horario_final",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                          />
                        </div>

                        {/* 3. Título de Actividad */}
                        <div className="col-span-2 min-w-0 sm:col-span-1 lg:col-span-4">
                          <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                            Título de Actividad
                          </label>
                          <input
                            type="text"
                            value={act.titulo || ""}
                            onChange={(e) =>
                              handleUpdateItinerarioField(
                                idx,
                                "titulo",
                                e.target.value
                              )
                            }
                            placeholder="Ej. Recepción de invitados, Cena, Brindis..."
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                          />
                        </div>

                        {/* 4. Descripción */}
                        <div className="col-span-2 min-w-0 sm:col-span-1 lg:col-span-4">
                          <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={act.descripcion || ""}
                            onChange={(e) =>
                              handleUpdateItinerarioField(
                                idx,
                                "descripcion",
                                e.target.value
                              )
                            }
                            placeholder="Ej. Cóctel de bienvenida en jardín principal..."
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {itinerarioError && (
                  <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                    <AlertTriangle className="h-3.5 w-3.5" /> {itinerarioError}
                  </p>
                )}

                <div className="flex flex-col items-stretch justify-between gap-2.5 pt-1 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleAddItinerarioActividad}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-center text-xs font-semibold text-[#6D28D9] transition hover:border-[#6D28D9] hover:bg-[#F5F3FF] sm:w-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar más actividades
                  </button>

                  <button
                    type="button"
                    disabled={savingItinerario}
                    onClick={() => handleSaveItinerarioEvento({ silent: false })}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-center text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {savingItinerario
                      ? "Guardando Itinerario..."
                      : "Guardar Itinerario"}
                  </button>
                </div>
              </div>
            )}

            {/* 7. Tarjeta: Configuración de Ubicación del Evento con Google Maps */}
            <div className="space-y-4 rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2F6] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-[#6D28D9]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                      UBICACIÓN EN LA TARJETA DE INVITACIÓN
                    </span>
                    <h4 className="text-sm font-bold text-[#111827] sm:text-[15px]">
                      Configurar Salón / Dirección con Google Maps
                    </h4>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        showNotice("Tu navegador no soporta geolocalización.");
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const coords = `${pos.coords.latitude.toFixed(
                            6
                          )}, ${pos.coords.longitude.toFixed(6)}`;
                          setInvForm((prev) => ({
                            ...prev,
                            direccion: coords,
                          }));
                          showNotice(
                            "✓ Coordenadas GPS aplicadas al mapa de la invitación."
                          );
                        },
                        () => {
                          showNotice(
                            "No se pudo obtener el GPS. Escribe la dirección o pega el enlace de Google Maps."
                          );
                        }
                      );
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#374151] transition hover:border-[#6D28D9] hover:text-[#6D28D9]"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Usar mi GPS
                  </button>
                  <a
                    href={mapLocation.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-none bg-[#F3E8FF] px-4 py-2 text-xs font-semibold text-[#6D28D9] transition hover:bg-[#6D28D9] hover:text-white"
                  >
                    Abrir Google Maps
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Estado
                  </label>
                  <select
                    value={invForm.estado_evento || "Ningúno"}
                    onChange={(e) => {
                      const nuevoEstado = e.target.value;
                      if (nuevoEstado === "Ningúno") {
                        setInvForm((prev) => ({
                          ...prev,
                          estado_evento: "Ningúno",
                          municipio: "Ningúno",
                        }));
                      } else {
                        const listaMun =
                          catalogosMexico.municipiosPorEstado?.[nuevoEstado] ||
                          [];
                        setInvForm((prev) => ({
                          ...prev,
                          estado_evento: nuevoEstado,
                          municipio: listaMun[0] || "Ningúno",
                        }));
                      }
                    }}
                    className="w-full max-w-full truncate rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                  >
                    <option value="Ningúno">
                      Ningúno
                    </option>
                    {(catalogosMexico.estados || []).map((est) => (
                      <option
                        key={est.key}
                        value={est.nombre}
                      >
                        {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Municipio
                  </label>
                  <select
                    value={
                      !invForm.estado_evento ||
                      invForm.estado_evento === "Ningúno"
                        ? "Ningúno"
                        : invForm.municipio || "Ningúno"
                    }
                    disabled={
                      !invForm.estado_evento ||
                      invForm.estado_evento === "Ningúno"
                    }
                    onChange={(e) =>
                      setInvForm((prev) => ({
                        ...prev,
                        municipio: e.target.value,
                      }))
                    }
                    className="w-full max-w-full truncate rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]"
                  >
                    {!invForm.estado_evento ||
                    invForm.estado_evento === "Ningúno" ? (
                      <option value="Ningúno">
                        Ningúno
                      </option>
                    ) : (
                      (
                        catalogosMexico.municipiosPorEstado?.[
                          invForm.estado_evento
                        ] || []
                      ).map((mun) => (
                        <option key={mun} value={mun}>
                          {mun}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Nombre del Salón, Jardín o Recinto
                  </label>
                  <input
                    type="text"
                    value={invForm.lugar || ""}
                    onChange={(e) =>
                      setInvForm((prev) => ({ ...prev, lugar: e.target.value }))
                    }
                    placeholder="Ej. Salón Jardín Imperial / Hacienda Los Morales"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Dirección Exacta, Coordenadas o Enlace de Google Maps
                  </label>
                  <input
                    type="text"
                    value={invForm.direccion || ""}
                    onChange={(e) =>
                      setInvForm((prev) => ({
                        ...prev,
                        direccion: e.target.value,
                      }))
                    }
                    placeholder="Ej. Av. Paseo de la Reforma 500, CDMX o pega el link de Google Maps"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                  />
                </div>
              </div>

              {/* Mapa Interactivo de Google Maps en Vivo */}
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                <iframe
                  title="Vista previa de ubicación en Google Maps"
                  src={mapLocation.embedUrl}
                  className="h-44 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Botón Principal de Guardado Recto Violeta Eléctrico */}
            <button
              type="submit"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-[#6D28D9] px-6 py-3.5 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(109,40,217,0.28)] transition hover:bg-[#5B21B6] active:scale-[0.99]"
            >
              <Save className="h-4 w-4" />
              Guardar Configuración del Evento
            </button>
          </form>
        </div>
      )}

      {/* =====================================================================
          TAB B: 👥 LISTA DE INVITADOS Y RSVP (/events/[id]/guests) — ESTILO TARJETAS LIMPIAS & VIOLETA ELÉCTRICO (#6D28D9)
         ===================================================================== */}
      {currentTab === "guests" && (
        <div className="space-y-5 rounded-3xl bg-[#F7F8FB] p-3 text-[#111827] sm:space-y-6 sm:p-6">
          {/* Banner de estado / advertencia del límite de invitados permitidos */}
          {isGuestLimitExceeded && (
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-200 bg-white p-5 text-xs text-[#111827] shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-base text-amber-600">
                  <AlertTriangle className="h-5 w-5 stroke-[2]" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    Límite de Invitados Permitidos Superado (+
                    {excedenteInvitadosActual} adicional
                    {excedenteInvitadosActual === 1 ? "" : "es"})
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6B7280]">
                    Tienes <strong className="text-[#111827]">{totalInvitadosCount} invitados</strong> (
                    <strong className="text-[#111827]">{totalPasesLista} pases</strong>) frente al máximo
                    configurado de{" "}
                    <strong className="text-[#6D28D9]">{limiteInvitadosPermitidos} permitidos</strong>. Al
                    compartir invitaciones virtuales por WhatsApp o Correo se
                    mostrará una advertencia.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChangeSubTab("config")}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 stroke-[2]" />
                <span>Ajustar Límite ({limiteInvitadosPermitidos})</span>
              </button>
            </div>
          )}

          {/* Resumen Estadístico Superior estilo "All Personal Informations" */}
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#F0F1F6] bg-white p-4 shadow-[0_4px_20px_rgba(17,24,39,0.03)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                <Users className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-[#111827] sm:text-lg">
                  {totalInvitadosCount}{" "}
                  <span className="text-[11px] font-medium text-[#9CA3AF]">
                    ({totalPasesLista} pases)
                  </span>
                </p>
                <span className="block text-[11px] font-medium text-[#9CA3AF]">
                  Total Invitados
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#F0F1F6] bg-white p-4 shadow-[0_4px_20px_rgba(17,24,39,0.03)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF5] text-base text-[#059669]">
                <CheckCircle2 className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-[#059669] sm:text-lg">
                  {confirmadosList.length}{" "}
                  <span className="text-[11px] font-medium text-[#9CA3AF]">
                    ({pasesConfirmadosCount} pases)
                  </span>
                </p>
                <span className="block text-[11px] font-medium text-[#9CA3AF]">
                  Confirmados
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#F0F1F6] bg-white p-4 shadow-[0_4px_20px_rgba(17,24,39,0.03)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-base text-rose-600">
                <X className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-[#111827] sm:text-lg">
                  {rechazadosList.length}{" "}
                  <span className="text-[11px] font-medium text-[#6D28D9]">
                    ({pendientesList.length} pend.)
                  </span>
                </p>
                <span className="block text-[11px] font-medium text-[#9CA3AF]">
                  Rechazados / Pend.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#F0F1F6] bg-white p-4 shadow-[0_4px_20px_rgba(17,24,39,0.03)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E8FF] text-base text-[#6D28D9]">
                <Users className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#111827] sm:text-base">
                  {totalAdultos} Ad.{" "}
                  <span className="text-xs font-semibold text-[#6D28D9]">
                    • {totalNinos} Niños
                  </span>
                </p>
                <span className="block text-[11px] font-medium text-[#9CA3AF]">
                  Adultos / Niños
                </span>
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-[#F0F1F6] bg-white p-4 shadow-[0_4px_20px_rgba(17,24,39,0.03)] lg:col-span-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                <Utensils className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-[#111827] sm:text-lg">
                  {menusEspecialesCount}{" "}
                  <span className="text-[11px] font-medium text-[#9CA3AF]">
                    solicitados
                  </span>
                </p>
                <span className="block text-[11px] font-medium text-[#9CA3AF]">
                  Menús Especiales
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Modalidad de Asistencia (Notificado en la Tarjeta de Invitación) */}
          <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#F1F2F6] pb-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                  <Ticket className="h-5 w-5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    SE NOTIFICARÁ EN LA TARJETA DE INVITACIÓN
                  </span>
                  <h4 className="text-sm font-bold text-[#111827] sm:text-base">
                    Modalidad de Invitados Permitida
                  </h4>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={normalizeModalidad(invForm.modalidad_invitados)}
                  onChange={(e) =>
                    handleChangeModalidadInvitados(e.target.value)
                  }
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                >
                  {MODALIDADES_INVITADOS.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => onChangeSubTab("invitation")}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6D28D9] transition hover:border-[#6D28D9] hover:bg-[#F5F3FF]"
                >
                  <LayoutTemplate className="h-3.5 w-3.5 stroke-[2]" />
                  <span>Ver en Tarjeta de Invitación</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {MODALIDADES_INVITADOS.map((mod) => {
                const isSelected =
                  normalizeModalidad(invForm.modalidad_invitados) === mod;
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => handleChangeModalidadInvitados(mod)}
                    className={`cursor-pointer rounded-none border px-3.5 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-[0_4px_12px_rgba(109,40,217,0.2)]"
                        : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#6D28D9] hover:text-[#6D28D9]"
                    }`}
                  >
                    {isSelected ? `✓ ${mod}` : mod}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel de Alta: Individual o Importación Masiva Excel/CSV */}
          <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[#F1F2F6] pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                  <UserPlus className="h-5 w-5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    REGISTRO DE ASISTENTES
                  </span>
                  <h3 className="text-sm font-bold text-[#111827] sm:text-base">
                    Agregar Invitados
                  </h3>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 border border-[#E5E7EB] bg-[#F4F5F8] p-1 sm:flex sm:w-auto">
                <button
                  type="button"
                  onClick={() => setAddMode("individual")}
                  className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none px-3 py-1.5 text-center text-[11px] font-semibold transition sm:px-3.5 sm:text-xs ${
                    addMode === "individual"
                      ? "bg-[#6D28D9] text-white shadow-xs"
                      : "text-[#6B7280] hover:text-[#6D28D9]"
                  }`}
                >
                  <User className="h-3.5 w-3.5 stroke-[2]" />
                  <span>Registro Individual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("csv")}
                  className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none px-3 py-1.5 text-center text-[11px] font-semibold transition sm:px-3.5 sm:text-xs ${
                    addMode === "csv"
                      ? "bg-[#6D28D9] text-white shadow-xs"
                      : "text-[#6B7280] hover:text-[#6D28D9]"
                  }`}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 stroke-[2]" />
                  <span>Importar desde Excel / CSV</span>
                </button>
              </div>
            </div>

            {addMode === "individual" ? (
              <form onSubmit={handleAddGuest} className="mt-5 space-y-4">
                {/* FILA 1: Nombre, Teléfono, Correo y Grupo */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
                  {/* Campo 1: Nombre Completo */}
                  <div className="group relative lg:col-span-4">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF]">
                      <span>Nombre del Invitado *</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#F3E8FF] text-[10px] font-bold text-[#6D28D9]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-60 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-[11px] leading-snug text-[#111827] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Nombre y apellido del invitado principal tal como
                      aparecerá en su invitación y pase digital.
                    </div>
                    <input
                      type="text"
                      required
                      value={guestForm.nombre}
                      onChange={(e) =>
                        setGuestForm((p) => ({ ...p, nombre: e.target.value }))
                      }
                      placeholder="Ej. Sofía Hernández *"
                      title="Nombre y apellido del invitado principal tal como aparecerá en su invitación y pase digital."
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                    />
                  </div>

                  {/* Campo 2: Teléfono / WhatsApp */}
                  <div className="group relative lg:col-span-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF]">
                      <span>Teléfono / WhatsApp</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#F3E8FF] text-[10px] font-bold text-[#6D28D9]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-60 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-[11px] leading-snug text-[#111827] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Número celular (con código de país opcional) para enviarle
                      su pase directo o recordatorios por WhatsApp.
                    </div>
                    <input
                      type="text"
                      value={guestForm.telefono}
                      onChange={(e) =>
                        setGuestForm((p) => ({
                          ...p,
                          telefono: e.target.value,
                        }))
                      }
                      placeholder="Ej. +52 55 1234 5678"
                      title="Número celular para enviarle su pase directo o recordatorios por WhatsApp."
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                    />
                  </div>

                  {/* Campo 3: Correo electrónico */}
                  <div className="group relative lg:col-span-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF]">
                      <span>Correo Electrónico</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#F3E8FF] text-[10px] font-bold text-[#6D28D9]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-60 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-[11px] leading-snug text-[#111827] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Dirección de correo del invitado para el envío de
                      invitaciones con diseño HTML.
                    </div>
                    <input
                      type="email"
                      value={guestForm.correo}
                      onChange={(e) =>
                        setGuestForm((p) => ({ ...p, correo: e.target.value }))
                      }
                      placeholder="ejemplo@correo.com"
                      title="Dirección de correo del invitado para el envío de invitaciones con diseño HTML."
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                    />
                  </div>

                  {/* Campo 4: Grupo */}
                  <div className="group relative lg:col-span-2">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF]">
                      <span>Grupo / Categoría</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#F3E8FF] text-[10px] font-bold text-[#6D28D9]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full right-0 z-30 mb-1.5 w-60 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-[11px] leading-snug text-[#111827] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Clasifica al invitado (Familia, Amigos, VIP o Trabajo)
                      para organizar y filtrar tu lista fácilmente.
                    </div>
                    <select
                      value={guestForm.grupo}
                      onChange={(e) =>
                        setGuestForm((p) => ({ ...p, grupo: e.target.value }))
                      }
                      title="Clasifica al invitado (Familia, Amigos, VIP o Trabajo) para organizar y filtrar tu lista fácilmente."
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                    >
                      <option value="Familia">Grupo: Familia</option>
                      <option value="Amigos">Grupo: Amigos</option>
                      <option value="VIP">Grupo: VIP</option>
                      <option value="Trabajo">Grupo: Trabajo</option>
                    </select>
                  </div>
                </div>

                {/* FILA 2: Modalidad de Asistencia, Adultos/Niños, Menú/Alergias y Botón Agregar */}
                <div className="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
                  {/* Campo 5: Modalidad de Pase */}
                  <div className="group relative lg:col-span-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF]">
                      <span>Modalidad de Asistencia</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#F3E8FF] text-[10px] font-bold text-[#6D28D9]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-[11px] leading-snug text-[#111827] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Tipo de invitación asignada (Solo adultos, Adultos y
                      niños, etc.). También actualiza el aviso en la tarjeta de
                      invitación.
                    </div>
                    <select
                      value={normalizeModalidad(
                        guestForm.modalidad_pase || invForm.modalidad_invitados
                      )}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGuestForm((p) => ({ ...p, modalidad_pase: val }));
                        handleChangeModalidadInvitados(val);
                      }}
                      title="Tipo de invitación asignada (Solo Adultos, Adultos + Niños, etc.). También actualiza el aviso en la tarjeta de invitación."
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                    >
                      {MODALIDADES_INVITADOS.map((mod) => (
                        <option key={mod} value={mod}>
                          {mod}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campo 6: Pases (Adultos y Niños) */}
                  <div className="group relative lg:col-span-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF]">
                      <span>Cantidad de Pases</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#F3E8FF] text-[10px] font-bold text-[#6D28D9]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-[11px] leading-snug text-[#111827] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Indica el número de adultos y de niños incluidos en el
                      pase de este invitado para calcular el aforo total.
                    </div>
                    <div
                      title="Indica el número de adultos y de niños incluidos en el pase de este invitado."
                      className="grid grid-cols-2 gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-1 border-r border-[#F1F2F6] pr-2">
                        <span className="text-[11px] text-[#9CA3AF]">
                          Adultos:
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={guestForm.adultos}
                          onChange={(e) =>
                            setGuestForm((p) => ({
                              ...p,
                              adultos: e.target.value,
                            }))
                          }
                          className="w-12 bg-transparent text-center font-bold text-[#111827] outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1 pl-1">
                        <span className="text-[11px] text-[#9CA3AF]">
                          Niños:
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={guestForm.ninos}
                          onChange={(e) =>
                            setGuestForm((p) => ({
                              ...p,
                              ninos: e.target.value,
                            }))
                          }
                          className="w-12 bg-transparent text-center font-bold text-[#6D28D9] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campo 7: Restricción alimentaria o nota para el anfitrión */}
                  <div className="group relative lg:col-span-4">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF]">
                      <span>Restricción alimentaria o nota para el anfitrión</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#F3E8FF] text-[10px] font-bold text-[#6D28D9]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-[11px] leading-snug text-[#111827] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Anota si el invitado requiere menú especial, tiene alguna
                      alergia alimentaria o preferencia (ej. Vegano, Sin gluten,
                      Menú infantil).
                    </div>
                    <input
                      type="text"
                      value={guestForm.nota_alimentacion}
                      onChange={(e) =>
                        setGuestForm((p) => ({
                          ...p,
                          nota_alimentacion: e.target.value,
                        }))
                      }
                      placeholder="Ej. Vegano, Sin gluten, Menú infantil..."
                      title="Anota si el invitado requiere menú especial o tiene alguna alergia alimentaria."
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                    />
                  </div>

                  {/* Botón + Agregar */}
                  <div className="group relative lg:col-span-2">
                    <div className="pointer-events-none invisible absolute bottom-full right-0 z-30 mb-1.5 w-56 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-[11px] leading-snug text-[#111827] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Registra al invitado en la lista del evento.
                    </div>
                    <button
                      type="submit"
                      title="Registra al invitado en la lista del evento."
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.2]" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Importación Masiva Excel / CSV */
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280]">
                  <p>
                    Sube un archivo <code>.csv</code> o pega tus filas de Excel
                    en formato:{" "}
                    <span className="font-mono font-semibold text-[#6D28D9]">
                      Nombre, Telefono, Email, Grupo, Adultos, Ninos,
                      Requerimientos
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadCsvTemplate}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[11px] font-semibold text-[#374151] transition hover:border-[#6D28D9] hover:text-[#6D28D9]"
                    >
                      <Download className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Descargar Plantilla CSV</span>
                    </button>
                    <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#F3E8FF] px-3.5 py-1.5 text-[11px] font-semibold text-[#6D28D9] transition hover:bg-[#6D28D9] hover:text-white">
                      <FolderOpen className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Seleccionar Archivo .CSV</span>
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleCsvFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`Ejemplo:\nAna Torres, +525511223344, ana@correo.com, Familia, 2, 1, Sin lactosa\nLuis Vega, +525599887766, luis@correo.com, VIP, 2, 0, Menú vegano`}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3.5 font-mono text-xs text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                />

                <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <span className="text-xs text-[#6B7280]">
                    Filas listas para importar:{" "}
                    <strong className="font-bold text-[#6D28D9]">
                      {csvPreviewRows.length}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleImportCsv}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6] sm:w-auto"
                  >
                    <Upload className="h-3.5 w-3.5 stroke-[2]" />
                    <span>Importar {csvPreviewRows.length} Invitados Ahora</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Buscador, Filtros por Estado y Grupo + Tabla Interactiva de Invitados */}
          <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#F1F2F6] pb-4 lg:flex-row lg:items-center">
              {/* Filtro por Estado (sin bordes redondeados) */}
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                {["Todos", "Confirmados", "Rechazados", "Pendientes"].map(
                  (st) => {
                    const isActive = rsvpFilter === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setRsvpFilter(st)}
                        className={`cursor-pointer rounded-none border px-4 py-2 text-center text-xs font-semibold transition ${
                          isActive
                            ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-[0_4px_12px_rgba(109,40,217,0.2)]"
                            : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#6D28D9] hover:text-[#6D28D9]"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Filtro por Grupo y Buscador */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 sm:w-auto"
                >
                  <option value="Todos">Todos los Grupos</option>
                  <option value="Familia">Familia</option>
                  <option value="Amigos">Amigos</option>
                  <option value="VIP">VIP</option>
                  <option value="Trabajo">Trabajo</option>
                </select>

                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Buscar por nombre, teléfono, email o alergia..."
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 sm:w-72"
                />
              </div>
            </div>

            {/* Tabla Interactiva de Invitados */}
            <div className="mt-5 overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="min-w-[820px] w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F7F8FB] text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    <th className="py-3.5 pl-4 pr-3">Nombre / Grupo</th>
                    <th className="py-3.5 pr-3">Teléfono / Email</th>
                    <th className="py-3.5 pr-3">Estado</th>
                    <th className="py-3.5 pr-3">Acompañantes / Modalidad</th>
                    <th className="py-3.5 pr-3">Requerimientos (Menú/Alergias)</th>
                    <th className="py-3.5 pr-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F6] bg-white">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-9 text-center text-xs font-medium text-[#9CA3AF]"
                      >
                        No hay invitados que coincidan con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((g) => {
                      const statusBadge =
                        g.estado_rsvp === "Confirmado"
                          ? "Confirmado"
                          : isRejected(g.estado_rsvp)
                          ? "Rechazado"
                          : "Pendiente";

                      return (
                        <tr
                          key={g.idinvitado}
                          className="transition hover:bg-[#FAFAFC]"
                        >
                          {/* Nombre y Grupo */}
                          <td className="py-3.5 pl-4 pr-3">
                            <p className="font-bold text-[#111827]">
                              {g.nombre}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <select
                                value={g.grupo || "Amigos"}
                                onChange={(e) =>
                                  handleUpdateGuest(g.idinvitado, {
                                    grupo: e.target.value,
                                  })
                                }
                                className="rounded-md bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#6D28D9] outline-none"
                              >
                                <option value="Familia">Familia</option>
                                <option value="Amigos">Amigos</option>
                                <option value="VIP">VIP</option>
                                <option value="Trabajo">Trabajo</option>
                              </select>
                              <span className="hidden text-[10px] font-medium text-[#9CA3AF]">
                                {g.mesa_asignada || "Sin asignar"}
                              </span>
                            </div>
                          </td>

                          {/* Teléfono / Email */}
                          <td className="py-3.5 pr-3">
                            <span className="block font-semibold text-[#111827]">
                              {g.telefono || "Sin teléfono"}
                            </span>
                            <span className="block text-[11px] text-[#9CA3AF]">
                              {g.correo || "Sin email"}
                            </span>
                          </td>

                          {/* Estado */}
                          <td className="py-3.5 pr-3">
                            <select
                              value={
                                isRejected(g.estado_rsvp)
                                  ? "Rechazado"
                                  : g.estado_rsvp
                              }
                              onChange={(e) =>
                                handleUpdateGuest(g.idinvitado, {
                                  estado_rsvp: e.target.value,
                                })
                              }
                              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none ${
                                g.estado_rsvp === "Confirmado"
                                  ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]"
                                  : isRejected(g.estado_rsvp)
                                  ? "border-rose-200 bg-rose-50 text-rose-600"
                                  : "border-[#DDD6FE] bg-[#F3E8FF] text-[#6D28D9]"
                              }`}
                            >
                              <option
                                value="Confirmado"
                                className="bg-white text-[#111827]"
                              >
                                ✓ Confirmado
                              </option>
                              <option
                                value="Pendiente"
                                className="bg-white text-[#111827]"
                              >
                                • Pendiente
                              </option>
                              <option
                                value="Rechazado"
                                className="bg-white text-[#111827]"
                              >
                                ✕ Rechazado
                              </option>
                            </select>
                            <span className="sr-only">{statusBadge}</span>
                          </td>

                          {/* Acompañantes (Adultos / Niños) y Modalidad */}
                          <td className="py-3.5 pr-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <select
                                value={normalizeModalidad(
                                  g.modalidad_pase || invForm.modalidad_invitados
                                )}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateGuest(g.idinvitado, {
                                    modalidad_pase: val,
                                  });
                                  handleChangeModalidadInvitados(val);
                                }}
                                className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#374151] outline-none"
                              >
                                {MODALIDADES_INVITADOS.map((mod) => (
                                  <option key={mod} value={mod}>
                                    {mod}
                                  </option>
                                ))}
                              </select>
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#F4F5F8] px-2 py-0.5 text-[11px] font-semibold text-[#374151]">
                                <User className="h-3 w-3 stroke-[2]" />
                                <span>{g.adultos ?? g.pases ?? 1} Ad.</span>
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-semibold text-[#6D28D9]">
                                <Users className="h-3 w-3 stroke-[2]" />
                                <span>{g.ninos ?? 0} Niños</span>
                              </span>
                              <span className="text-[10px] font-medium text-[#9CA3AF]">
                                ({g.pases} total)
                              </span>
                            </div>
                          </td>

                          {/* Requerimientos (Menú/Alergias) */}
                          <td className="py-3.5 pr-3">
                            <input
                              type="text"
                              defaultValue={g.nota_alimentacion || ""}
                              onBlur={(e) => {
                                if (
                                  e.target.value !== (g.nota_alimentacion || "")
                                ) {
                                  handleUpdateGuest(g.idinvitado, {
                                    nota_alimentacion: e.target.value,
                                  });
                                }
                              }}
                              placeholder="Normal / Sin alergias"
                              className="w-40 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                            />
                          </td>

                          {/* Acciones (Botones sin bordes redondeados) */}
                          <td className="py-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditGuest(g)}
                                className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-none bg-[#6D28D9] px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(109,40,217,0.2)] transition hover:bg-[#5B21B6]"
                                title="Editar invitado"
                              >
                                <Pencil className="h-3 w-3 stroke-[2]" />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGuest(g.idinvitado)}
                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-none border border-[#E5E7EB] bg-white text-xs font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                                title="Eliminar invitado"
                              >
                                <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal para Editar Invitado */}
            {editingGuest && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-xs">
                <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-2xl sm:p-6">
                  <div className="flex items-center justify-between border-b border-[#F1F2F6] pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                        <Pencil className="h-5 w-5 stroke-[2]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                          EDICIÓN DE REGISTRO
                        </span>
                        <h3 className="text-sm font-bold text-[#111827] sm:text-base">
                          Editar Invitado: {editingGuest.nombre}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingGuest(null)}
                      className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-none border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-semibold text-[#6B7280] hover:border-rose-300 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Cerrar</span>
                    </button>
                  </div>

                  <form
                    onSubmit={handleSaveEditedGuest}
                    className="mt-4 space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                          Nombre del Invitado *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingGuest.nombre}
                          onChange={(e) =>
                            setEditingGuest((p) => ({
                              ...p,
                              nombre: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                          Teléfono / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={editingGuest.telefono}
                          onChange={(e) =>
                            setEditingGuest((p) => ({
                              ...p,
                              telefono: e.target.value,
                            }))
                          }
                          placeholder="+52 55..."
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={editingGuest.correo}
                          onChange={(e) =>
                            setEditingGuest((p) => ({
                              ...p,
                              correo: e.target.value,
                            }))
                          }
                          placeholder="correo@ejemplo.com"
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                          Grupo / Categoría
                        </label>
                        <select
                          value={editingGuest.grupo}
                          onChange={(e) =>
                            setEditingGuest((p) => ({
                              ...p,
                              grupo: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                        >
                          <option value="Familia">Familia</option>
                          <option value="Amigos">Amigos</option>
                          <option value="VIP">VIP</option>
                          <option value="Trabajo">Trabajo</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                          Estado de Confirmación
                        </label>
                        <select
                          value={editingGuest.estado_rsvp}
                          onChange={(e) =>
                            setEditingGuest((p) => ({
                              ...p,
                              estado_rsvp: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                        >
                          <option value="Confirmado">✓ Confirmado</option>
                          <option value="Pendiente">• Pendiente</option>
                          <option value="Rechazado">✕ Rechazado</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                          Modalidad de Asistencia
                        </label>
                        <select
                          value={editingGuest.modalidad_pase}
                          onChange={(e) => {
                            const mod = e.target.value;
                            setEditingGuest((p) => ({
                              ...p,
                              modalidad_pase: mod,
                              adultos: isSoloNinosMod(mod) ? 0 : p.adultos,
                              ninos: isSoloAdultosMod(mod) ? 0 : p.ninos,
                            }));
                          }}
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                        >
                          {MODALIDADES_INVITADOS.map((mod) => (
                            <option key={mod} value={mod}>
                              {mod}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                            Pases Adultos
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={25}
                            disabled={isSoloNinosMod(
                              editingGuest.modalidad_pase
                            )}
                            value={
                              isSoloNinosMod(editingGuest.modalidad_pase)
                                ? 0
                                : editingGuest.adultos
                            }
                            onChange={(e) =>
                              setEditingGuest((p) => ({
                                ...p,
                                adultos: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-center text-xs font-bold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 disabled:bg-[#F9FAFB] disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                            Pases Niños
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={25}
                            disabled={isSoloAdultosMod(
                              editingGuest.modalidad_pase
                            )}
                            value={
                              isSoloAdultosMod(editingGuest.modalidad_pase)
                                ? 0
                                : editingGuest.ninos
                            }
                            onChange={(e) =>
                              setEditingGuest((p) => ({
                                ...p,
                                ninos: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-center text-xs font-bold text-[#6D28D9] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 disabled:bg-[#F9FAFB] disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                          Restricción alimentaria o nota para el anfitrión
                        </label>
                        <input
                          type="text"
                          value={editingGuest.nota_alimentacion}
                          onChange={(e) =>
                            setEditingGuest((p) => ({
                              ...p,
                              nota_alimentacion: e.target.value,
                            }))
                          }
                          placeholder="Normal / Sin alergias..."
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] placeholder:font-normal placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 border-t border-[#F1F2F6] pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingGuest(null)}
                        className="cursor-pointer rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B7280] transition hover:border-[#111827] hover:text-[#111827]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
                      >
                        <Save className="h-3.5 w-3.5 stroke-[2]" />
                        <span>Guardar Cambios</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB C: 📤 CENTRO DE ENVÍOS Y DIFUSIÓN (/events/[id]/broadcast) — ESTILO TARJETAS LIMPIAS & VIOLETA ELÉCTRICO (#6D28D9)
         ===================================================================== */}
      {currentTab === "broadcast" && (
        <div className="space-y-5 rounded-3xl bg-[#F7F8FB] p-3 text-[#111827] sm:space-y-6 sm:p-6">
          {/* Barra de control / advertencia de Número de Invitados Permitidos al compartir */}
          <div
            className={`flex flex-col justify-between gap-3 rounded-2xl border bg-white p-5 text-xs shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:flex-row sm:items-center sm:p-6 ${
              isGuestLimitExceeded
                ? "border-amber-200 text-[#111827]"
                : "border-[#F0F1F6] text-[#111827]"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${
                  isGuestLimitExceeded
                    ? "bg-amber-50 text-amber-600"
                    : "bg-[#F4F5F8] text-[#6D28D9]"
                }`}
              >
                {isGuestLimitExceeded ? (
                  <AlertTriangle className="h-5 w-5 stroke-[2]" />
                ) : (
                  <Users className="h-5 w-5 stroke-[2]" />
                )}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-[#111827]">
                    {isGuestLimitExceeded
                      ? "Advertencia: Se ha superado el número de invitados permitidos en la configuración"
                      : "Control de Invitados Permitidos para Compartir por WhatsApp / Correo"}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-semibold ${
                      isGuestLimitExceeded
                        ? "border border-amber-200 bg-amber-50 text-amber-700"
                        : "bg-[#ECFDF5] text-[#059669]"
                    }`}
                  >
                    {isGuestLimitExceeded ? (
                      <>
                        <AlertTriangle className="h-3 w-3 stroke-[2]" />
                        <span>+{excedenteInvitadosActual} sobre el límite</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 stroke-[2.2]" />
                        <span>Dentro del límite</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#9CA3AF]">
                  Límite configurado:{" "}
                  <strong className="font-semibold text-[#111827]">
                    {limiteInvitadosPermitidos} invitados
                  </strong>{" "}
                  • En lista:{" "}
                  <strong className="font-semibold text-[#111827]">
                    {totalInvitadosCount} invitados ({totalPasesLista} pases)
                  </strong>{" "}
                  • Enviados:{" "}
                  <strong className="font-semibold text-[#6D28D9]">
                    {invitadosEnviadosCount} ({pasesEnviadosCount} pases)
                  </strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onChangeSubTab("config")}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6D28D9] transition hover:border-[#6D28D9] hover:bg-[#F5F3FF]"
            >
              <Settings className="h-3.5 w-3.5 stroke-[2]" />
              <span>Configurar Límite ({limiteInvitadosPermitidos})</span>
            </button>
          </div>

          {/* 1. Enlace de Invitación del Evento */}
          <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2F6] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                  <Link2 className="h-5 w-5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    ENLACE PRINCIPAL DE COMPARTICIÓN
                  </span>
                  <h3 className="text-sm font-bold text-[#111827] sm:text-base">
                    Enlace de Invitación del Evento
                  </h3>
                </div>
              </div>
              <span className="rounded-lg bg-[#F3E8FF] px-3 py-1 text-[11px] font-semibold text-[#6D28D9]">
                Público y activo
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                readOnly
                value={baseShareUrl}
                className="flex-1 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] px-4 py-2.5 font-mono text-xs font-medium text-[#6D28D9] outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(baseShareUrl);
                  showNotice("✓ Enlace general copiado al portapapeles.");
                }}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
              >
                <Copy className="h-3.5 w-3.5 stroke-[2]" />
                <span>Copiar Enlace General</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
            {/* 2. Módulo WhatsApp */}
            <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F2F6] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF5] text-base text-[#059669]">
                    <MessageCircle className="h-5 w-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                      CANAL DIRECTO
                    </span>
                    <h4 className="text-sm font-bold text-[#111827] sm:text-base">
                      Módulo WhatsApp Directo
                    </h4>
                  </div>
                </div>
                <span className="rounded-lg bg-[#ECFDF5] px-3 py-1 text-[11px] font-semibold text-[#059669]">
                  Web / Móvil
                </span>
              </div>
              <p className="mt-3 text-xs text-[#9CA3AF]">
                Personaliza el mensaje con variables automáticas y abre WhatsApp
                con el enlace de la invitación del evento.
              </p>

              {/* Selector de Link Creado para Enviar por WhatsApp */}
              <div className="mt-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#111827]">
                    <Link2 className="h-3.5 w-3.5 text-[#6D28D9]" />
                    <span>
                      Selecciona el Link a Enviar ({allAvailableLinks.length}{" "}
                      disponible{allAvailableLinks.length === 1 ? "" : "s"}):
                    </span>
                  </label>
                  <span className="rounded-md bg-[#F3E8FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                    Activo: {selectedWhatsappLinkObj.etiqueta}
                  </span>
                </div>

                <div
                  className={`mt-2.5 space-y-2 pr-1 ${
                    allAvailableLinks.length > 5
                      ? "max-h-[395px] overflow-y-auto"
                      : ""
                  }`}
                >
                  {allAvailableLinks.map((lnk) => {
                    const isSelected =
                      String(selectedWhatsappLinkObj.iditem) ===
                      String(lnk.iditem);
                    const soloAd = isSoloAdultosMod(lnk.modalidad);
                    const soloNi = isSoloNinosMod(lnk.modalidad);
                    return (
                      <div
                        key={lnk.iditem}
                        onClick={() => setSelectedWhatsappLinkId(lnk.iditem)}
                        className={`flex cursor-pointer flex-col justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs transition sm:flex-row sm:items-center ${
                          isSelected
                            ? "border-[aliceblue] bg-[#c3ebcb] shadow-xs ring-2 ring-[#6D28D9]/12"
                            : "border-[#E5E7EB] bg-white hover:border-[#6D28D9]/50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 font-bold text-[#111827]">
                              {lnk.isPrincipal ? (
                                <Star className="h-3 w-3 text-[#6D28D9]" />
                              ) : (
                                <Link2 className="h-3 w-3 text-[#6D28D9]" />
                              )}
                              <span>{lnk.etiqueta}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                              <Ticket className="h-3 w-3 stroke-[2]" />
                              <span>{lnk.modalidad}</span>
                            </span>
                            {!soloNi && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#F4F5F8] px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
                                <span>Adultos:</span>
                                {lnk.adultos > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 font-semibold text-[#111827]">
                                    <Lock className="h-2.5 w-2.5" />
                                    {lnk.adultos}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5">
                                    <Unlock className="h-2.5 w-2.5" />
                                    Libre
                                  </span>
                                )}
                              </span>
                            )}
                            {!soloAd && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#F4F5F8] px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
                                <span>Niños:</span>
                                {lnk.ninos > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 font-semibold text-[#111827]">
                                    <Lock className="h-2.5 w-2.5" />
                                    {lnk.ninos}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5">
                                    <Unlock className="h-2.5 w-2.5" />
                                    Libre
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate font-mono text-[10px] text-[#6D28D9]">
                            {lnk.url}
                          </p>
                        </div>

                        <span
                          className={`self-start shrink-0 rounded-none px-2.5 py-1 text-[10px] font-semibold sm:self-center ${
                            isSelected
                              ? "bg-[#437d4e] text-white"
                              : "border border-[#E5E7EB] bg-white text-[#6B7280]"
                          }`}
                        >
                          {isSelected ? "✓ Seleccionado" : "Seleccionar"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <textarea
                rows={3}
                value={whatsappMsg}
                onChange={(e) => setWhatsappMsg(e.target.value)}
                className="hidden mt-3 w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#111827] outline-none focus:border-[#6D28D9]"
              />

              {/* Vista Previa de la Miniatura (Open Graph) que se envía por WhatsApp */}
              <div className="mt-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-3.5">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    <ImageIcon className="h-3.5 w-3.5 stroke-[2]" />
                    <span>Vista Previa de Miniatura en WhatsApp</span>
                  </span>
                  <span className="rounded-md bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#059669]">
                    {invForm.imagen_portada
                      ? "✓ Póster del evento activo"
                      : "Tarjeta automática del evento"}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                  {invForm.imagen_portada ? (
                    <div className="relative h-32 w-full overflow-hidden bg-[#142257] sm:h-36">
                      <img
                        src={invForm.imagen_portada}
                        alt={evento.nombre}
                        className="h-full w-full object-cover object-[center_25%]"
                      />
                    </div>
                  ) : (
                    <div className="flex h-28 w-full flex-col justify-center bg-gradient-to-r from-[#142257] via-[#1B2D6E] to-[#171F39] px-4 py-3 text-white">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#15B2F5]">
                        {evento.tipo_evento || "INVITACIÓN DIGITAL"}
                      </span>
                      <p className="mt-0.5 truncate text-sm font-extrabold text-white">
                        {evento.nombre}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-gray-300">
                        {formatDateInput(evento.fecha_evento)} •{" "}
                        {evento.hora_evento || "20:00"} hrs •{" "}
                        {evento.lugar || "Salón VIP"}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-[#F1F2F6] bg-white px-3.5 py-2.5">
                    <p className="truncate text-xs font-bold text-[#111827]">
                      {evento.nombre} —{" "}
                      {evento.tipo_evento || "Invitación Digital"}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-[#6B7280]">
                      {formatDateInput(evento.fecha_evento)} •{" "}
                      {evento.hora_evento || "20:00"} hrs •{" "}
                      {evento.lugar || "Salón Principal"} —{" "}
                      {invForm.mensaje_invitacion ||
                        "Confirma tu asistencia en la invitación digital."}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] font-medium text-[#6D28D9]">
                      {selectedWhatsappLinkObj?.url || baseShareUrl}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Invitados para Enviar por WhatsApp estilo filas "Resume" (#c3ebcb + rounded-[8px]) */}
              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                {invitados.map((g) => (
                  <div
                    key={g.idinvitado}
                    className="flex flex-col gap-2.5 rounded-xl border border-[#b2dfc0] bg-[#c3ebcb] px-3.5 py-2.5 text-xs transition hover:border-[#6D28D9]/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/90 text-sm text-[#15803D] shadow-2xs">
                        <MessageCircle className="h-4 w-4 stroke-[2.1]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#111827]">
                          {g.nombre}
                        </p>
                        <p className="truncate text-[11px] text-[#111827]">
                          {g.telefono || "Sin número"} •{" "}
                          {g.invitacion_enviada ? (
                            <span className="font-semibold text-[#059669]">
                              ✓ Enviado ({g.canal_ultimo_envio || "Digital"})
                            </span>
                          ) : (
                            <span>No enviado</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(g)}
                      className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] bg-[#6D28D9] px-4 py-2 text-center text-xs font-semibold text-white shadow-[0_4px_12px_rgba(109,40,217,0.2)] transition hover:bg-[#5B21B6] sm:w-auto"
                    >
                      <MessageCircle className="h-3.5 w-3.5 stroke-[2.1]" />
                      <span>Enviar WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Módulo Email / SMS Masivo con Plantillas HTML */}
            <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F2F6] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                    <Mail className="h-5 w-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                      DIFUSIÓN CON PLANTILLAS HTML
                    </span>
                    <h4 className="text-sm font-bold text-[#111827] sm:text-base">
                      Módulo Email HTML / SMS Masivo
                    </h4>
                  </div>
                </div>
                <select
                  value={broadcastChannel}
                  onChange={(e) => setBroadcastChannel(e.target.value)}
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                >
                  <option value="Email HTML">Canal: Email HTML</option>
                  <option value="SMS Directo">Canal: SMS Directo</option>
                </select>
              </div>

              {/* Selector de Link Creado para Enviar por Correo / SMS */}
              <div className="mt-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#111827]">
                    <Link2 className="h-3.5 w-3.5 text-[#6D28D9]" />
                    <span>
                      Selecciona el Link a Enviar ({allAvailableLinks.length}{" "}
                      disponible{allAvailableLinks.length === 1 ? "" : "s"}):
                    </span>
                  </label>
                  <span className="rounded-md bg-[#F3E8FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                    Activo: {selectedEmailLinkObj.etiqueta}
                  </span>
                </div>

                <div
                  className={`mt-2.5 space-y-2 pr-1 ${
                    allAvailableLinks.length > 5
                      ? "max-h-[395px] overflow-y-auto"
                      : ""
                  }`}
                >
                  {allAvailableLinks.map((lnk) => {
                    const isSelected =
                      String(selectedEmailLinkObj.iditem) ===
                      String(lnk.iditem);
                    const soloAd = isSoloAdultosMod(lnk.modalidad);
                    const soloNi = isSoloNinosMod(lnk.modalidad);
                    return (
                      <div
                        key={lnk.iditem}
                        onClick={() => setSelectedEmailLinkId(lnk.iditem)}
                        className={`flex cursor-pointer flex-col justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs transition sm:flex-row sm:items-center ${
                          isSelected
                            ? "border-[#6D28D9] bg-[#efd1e7] shadow-xs ring-2 ring-[#6D28D9]/12"
                            : "border-[#E5E7EB] bg-white hover:border-[#6D28D9]/50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 font-bold text-[#111827]">
                              {lnk.isPrincipal ? (
                                <Star className="h-3 w-3 text-[#6D28D9]" />
                              ) : (
                                <Link2 className="h-3 w-3 text-[#6D28D9]" />
                              )}
                              <span>{lnk.etiqueta}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                              <Ticket className="h-3 w-3 stroke-[2]" />
                              <span>{lnk.modalidad}</span>
                            </span>
                            {!soloNi && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#F4F5F8] px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
                                <span>Adultos:</span>
                                {lnk.adultos > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 font-semibold text-[#111827]">
                                    <Lock className="h-2.5 w-2.5" />
                                    {lnk.adultos}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5">
                                    <Unlock className="h-2.5 w-2.5" />
                                    Libre
                                  </span>
                                )}
                              </span>
                            )}
                            {!soloAd && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#F4F5F8] px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
                                <span>Niños:</span>
                                {lnk.ninos > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 font-semibold text-[#111827]">
                                    <Lock className="h-2.5 w-2.5" />
                                    {lnk.ninos}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5">
                                    <Unlock className="h-2.5 w-2.5" />
                                    Libre
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate font-mono text-[10px] text-[#6D28D9]">
                            {lnk.url}
                          </p>
                        </div>

                        <span
                          className={`self-start shrink-0 rounded-none px-2.5 py-1 text-[10px] font-semibold sm:self-center ${
                            isSelected
                              ? "bg-[#6D28D9] text-white"
                              : "border border-[#E5E7EB] bg-white text-[#6B7280]"
                          }`}
                        >
                          {isSelected ? "✓ Seleccionado" : "Seleccionar"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {EMAIL_HTML_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedHtmlTemplate(t.id)}
                    className={`cursor-pointer rounded-none border p-2.5 text-left text-[11px] font-semibold transition ${
                      selectedHtmlTemplate === t.id
                        ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9]"
                        : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#6D28D9] hover:text-[#6D28D9]"
                    }`}
                  >
                    <span className="block font-bold">{t.name}</span>
                  </button>
                ))}
              </div>

              {/* Vista previa de la Plantilla HTML de Correo */}
              <div className="mt-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-4">
                <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] pb-2.5 text-[11px] text-[#6B7280]">
                  <span className="truncate">
                    <strong className="text-[#111827]">Asunto:</strong>{" "}
                    {formatGuestMessage(activeEmailTemplate.subject, null)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHtmlPreviewTab("visual");
                      setShowHtmlPreviewModal(true);
                    }}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-none bg-[#F3E8FF] px-3 py-1 text-[10px] font-semibold text-[#6D28D9] transition hover:bg-[#6D28D9] hover:text-white"
                    title="Abrir vista previa completa del correo HTML y ver código fuente"
                  >
                    <Eye className="h-3 w-3 stroke-[2]" />
                    <span>HTML PREVIEW</span>
                  </button>
                </div>
                <div
                  onClick={() => {
                    setHtmlPreviewTab("visual");
                    setShowHtmlPreviewModal(true);
                  }}
                  className={`mt-3 cursor-pointer rounded-xl border bg-gradient-to-r p-4 text-center transition hover:brightness-110 ${activeEmailTemplate.gradient} ${activeEmailTemplate.borderClass}`}
                  title="Haz clic para ampliar la vista previa HTML"
                >
                  <p
                    className="text-[10px] font-bold tracking-widest"
                    style={{ color: activeEmailTemplate.badgeColor }}
                  >
                    {activeEmailTemplate.badge}
                  </p>
                  <p
                    className="font-display mt-1 text-2xl font-bold uppercase text-white"
                    style={{ color: "#ffffff" }}
                  >
                    {evento.nombre}
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    {formatDateInput(evento.fecha_evento)} •{" "}
                    {evento.hora_evento} hrs • {evento.lugar || "Salón VIP"}
                  </p>
                  <span
                    className={`mt-3 inline-block rounded-none px-4 py-1.5 text-[10px] font-bold uppercase ${activeEmailTemplate.buttonClass}`}
                  >
                    Confirmar Asistencia
                  </span>
                </div>
              </div>

              {/* Lista de Invitados para Enviar por Correo estilo filas "Resume" (#e5ebe8 + rounded-[8px]) */}
              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                {invitados.map((g) => (
                  <div
                    key={g.idinvitado}
                    className="flex flex-col gap-2.5 rounded-xl border border-[#d5dfd9] bg-[#e5ebe8] px-3.5 py-2.5 text-xs transition hover:border-[#6D28D9]/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/90 text-sm text-[#6D28D9] shadow-2xs">
                        <Mail className="h-4 w-4 stroke-[2.1]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#111827]">
                          {g.nombre}
                        </p>
                        <p className="truncate text-[11px] text-[#6B7280]">
                          {g.correo || "Sin correo"} •{" "}
                          {g.invitacion_enviada ? (
                            <span className="font-semibold text-[#059669]">
                              ✓ Enviado ({g.canal_ultimo_envio || "Digital"})
                            </span>
                          ) : (
                            <span>No enviado</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRequestDirectEmail(g)}
                      className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] bg-[#6D28D9] px-4 py-2 text-center text-xs font-semibold text-white shadow-[0_4px_12px_rgba(109,40,217,0.2)] transition hover:bg-[#5B21B6] sm:w-auto"
                    >
                      <Mail className="h-3.5 w-3.5 stroke-[2.1]" />
                      <span>Enviar Correo</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Modal de Confirmación para Envío Individual de Correo */}
              {confirmDirectEmailGuest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-xs">
                  <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-2xl sm:p-6">
                    <div className="flex items-start justify-between gap-3 border-b border-[#F1F2F6] pb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                          <Mail className="h-5 w-5 stroke-[2]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#111827] sm:text-base">
                            ¿Confirmas enviar este correo de invitación?
                          </h3>
                          <p className="mt-0.5 text-xs text-[#9CA3AF]">
                            Verifica los datos del invitado y el link seleccionado antes de continuar:
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmDirectEmailGuest(null)}
                        className="cursor-pointer rounded-none border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-bold text-[#6B7280] hover:border-rose-300 hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5 stroke-[2]" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-3.5 text-xs sm:p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[#9CA3AF]">
                          Invitado:
                        </span>
                        <span className="font-bold text-[#111827]">
                          {confirmDirectEmailGuest.nombre}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[#9CA3AF]">
                          Correo Electrónico:
                        </span>
                        <span className="font-semibold text-[#111827]">
                          {confirmDirectEmailGuest.correo || "Sin correo registrado"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[#9CA3AF]">
                          Plantilla:
                        </span>
                        <span className="font-semibold text-[#111827]">
                          {activeEmailTemplate.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[#9CA3AF]">
                          Link Seleccionado:
                        </span>
                        <span className="font-semibold text-[#6D28D9]">
                          {selectedEmailLinkObj.etiqueta} (
                          {selectedEmailLinkObj.modalidad})
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => setConfirmDirectEmailGuest(null)}
                        className="cursor-pointer rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B7280] transition hover:border-[#111827] hover:text-[#111827]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const guestToSend = confirmDirectEmailGuest;
                          setConfirmDirectEmailGuest(null);
                          await handleSendDirectEmail(guestToSend);
                        }}
                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2]" />
                        <span>Sí, Enviar Correo</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    handleRequestBroadcastMasivo({
                      soloPendientes: true,
                      canal: broadcastChannel,
                    })
                  }
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
                >
                  <Send className="h-3.5 w-3.5 stroke-[2]" />
                  <span>Enviar a No Enviados</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleRequestBroadcastMasivo({
                      soloPendientes: false,
                      canal: broadcastChannel,
                    })
                  }
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#374151] transition hover:border-[#6D28D9] hover:text-[#6D28D9]"
                >
                  <RefreshCw className="h-3.5 w-3.5 stroke-[2]" />
                  <span>Reenviar a Todos ({invitados.length})</span>
                </button>
              </div>

              {/* Modal de Confirmación para Envío Masivo */}
              {confirmBroadcastModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-xs">
                  <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-2xl sm:p-6">
                    <div className="flex items-start justify-between gap-3 border-b border-[#F1F2F6] pb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                          <Send className="h-5 w-5 stroke-[2]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#111827] sm:text-base">
                            {confirmBroadcastModal.soloPendientes
                              ? "¿Confirmas enviar a los invitados No Enviados?"
                              : "¿Confirmas reenviar a todos los invitados?"}
                          </h3>
                          <p className="mt-0.5 text-xs text-[#9CA3AF]">
                            Verifica los detalles de la campaña antes de disparar el envío:
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmBroadcastModal(null)}
                        className="cursor-pointer rounded-none border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-bold text-[#6B7280] hover:border-rose-300 hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5 stroke-[2]" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-3.5 text-xs sm:p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[#9CA3AF]">
                          Destinatarios:
                        </span>
                        <span className="font-bold text-[#111827]">
                          {confirmBroadcastModal.soloPendientes
                            ? `${
                                invitados.filter((g) => !g.invitacion_enviada)
                                  .length
                              } invitado(s) sin envío previo`
                            : `Todos los invitados (${invitados.length})`}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[#9CA3AF]">
                          Canal de Envío:
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#F3E8FF] px-2.5 py-0.5 font-semibold text-[#6D28D9]">
                          <Mail className="h-3 w-3 stroke-[2]" />
                          <span>{confirmBroadcastModal.canal}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[#9CA3AF]">
                          Plantilla:
                        </span>
                        <span className="font-semibold text-[#111827]">
                          {activeEmailTemplate.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[#9CA3AF]">
                          Link Seleccionado:
                        </span>
                        <span className="font-semibold text-[#6D28D9]">
                          {selectedEmailLinkObj.etiqueta} (
                          {selectedEmailLinkObj.modalidad})
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => setConfirmBroadcastModal(null)}
                        className="cursor-pointer rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B7280] transition hover:border-[#111827] hover:text-[#111827]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const payload = confirmBroadcastModal;
                          setConfirmBroadcastModal(null);
                          await handleBroadcastMasivo(payload);
                        }}
                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6]"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2]" />
                        <span>Sí, Confirmar Envío</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Interactivo de Vista Previa Completa de Plantilla HTML */}
            {showHtmlPreviewModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/75 p-3 backdrop-blur-sm sm:p-4"
                onClick={() => setShowHtmlPreviewModal(false)}
              >
                <div
                  className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-2xl sm:p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2F6] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                        <Mail className="h-5 w-5 stroke-[2]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                          VISTA PREVIA DE PLANTILLA DE CORREO •{" "}
                          {activeEmailTemplate.name}
                        </span>
                        <h4 className="text-sm font-bold text-[#111827] sm:text-base">
                          Previsualizador HTML de Invitación
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHtmlPreviewModal(false)}
                      className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-none border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-rose-300 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Cerrar</span>
                    </button>
                  </div>

                  {/* Controles superiores: Selector de Invitado de Prueba y Pestaña Visual vs Código */}
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                      <label className="text-xs font-medium text-[#9CA3AF]">
                        Previsualizar como:
                      </label>
                      <select
                        value={previewGuestId}
                        onChange={(e) => setPreviewGuestId(e.target.value)}
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] sm:w-auto"
                      >
                        <option value="">Invitado General (Demo)</option>
                        {invitados.map((g) => (
                          <option key={g.idinvitado} value={g.idinvitado}>
                            {g.nombre} ({g.pases} pases)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 border border-[#E5E7EB] bg-[#F4F5F8] p-1 sm:flex">
                      <button
                        type="button"
                        onClick={() => setHtmlPreviewTab("visual")}
                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none px-3.5 py-1.5 text-xs font-semibold transition ${
                          htmlPreviewTab === "visual"
                            ? "bg-[#6D28D9] text-white shadow-xs"
                            : "text-[#6B7280] hover:text-[#6D28D9]"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5 stroke-[2]" />
                        <span>Vista Visual</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHtmlPreviewTab("code")}
                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none px-3.5 py-1.5 text-xs font-semibold transition ${
                          htmlPreviewTab === "code"
                            ? "bg-[#6D28D9] text-white shadow-xs"
                            : "text-[#6B7280] hover:text-[#6D28D9]"
                        }`}
                      >
                        <Code2 className="h-3.5 w-3.5 stroke-[2]" />
                        <span>Código HTML</span>
                      </button>
                    </div>
                  </div>

                  {htmlPreviewTab === "visual" ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAFAFC]">
                      {/* Cabecera simulada del cliente de correo */}
                      <div className="space-y-1 border-b border-[#E5E7EB] bg-white px-4 py-3 text-xs text-[#6B7280]">
                        <p>
                          <span className="font-medium text-[#9CA3AF]">
                            De:
                          </span>{" "}
                          Invitaciones Oficiales &lt;no-reply@dominalafiesta.com&gt;
                        </p>
                        <p>
                          <span className="font-medium text-[#9CA3AF]">
                            Para:
                          </span>{" "}
                          {previewGuestObj
                            ? `${previewGuestObj.nombre} <${
                                previewGuestObj.correo || "invitado@correo.com"
                              }>`
                            : "Invitado Especial <invitado@correo.com>"}
                        </p>
                        <p>
                          <span className="font-medium text-[#9CA3AF]">
                            Asunto:
                          </span>{" "}
                          <strong className="text-[#111827]">
                            {formatGuestMessage(
                              activeEmailTemplate.subject,
                              previewGuestObj
                            )}
                          </strong>
                        </p>
                      </div>

                      {/* Cuerpo del correo HTML renderizado */}
                      <div className="p-5">
                        <div
                          className={`mx-auto max-w-lg overflow-hidden rounded-2xl border bg-gradient-to-br shadow-xl ${activeEmailTemplate.gradient} ${activeEmailTemplate.borderClass}`}
                        >
                          {invForm.imagen_portada && (
                            <div className="relative h-44 w-full overflow-hidden border-b border-white/10">
                              <img
                                src={invForm.imagen_portada}
                                alt={evento.nombre}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </div>
                          )}

                          <div className="p-6 text-center">
                            <span
                              className="inline-block rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                              style={{ color: activeEmailTemplate.badgeColor }}
                            >
                              {activeEmailTemplate.badge} •{" "}
                              {evento.tipo_evento || "Evento Exclusivo"}
                            </span>

                            <h2 className="font-display mt-3 text-3xl font-bold uppercase tracking-wide text-white">
                              {evento.nombre}
                            </h2>

                            <p className="mt-2 text-xs leading-relaxed text-gray-200">
                              ¡Hola{" "}
                              <strong className="text-white">
                                {previewGuestObj?.nombre || "Invitado Especial"}
                              </strong>
                              !{" "}
                              {invForm.mensaje_bienvenida ||
                                "Estás cordialmente invitado(a) a celebrar con nosotros."}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl border border-white/10 bg-black/40 p-3.5 text-left text-xs text-gray-200">
                              <div>
                                <span className="block text-[10px] uppercase text-gray-400">
                                  Fecha
                                </span>
                                <strong className="text-white">
                                  {formatDateInput(evento.fecha_evento)}
                                </strong>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase text-gray-400">
                                  Hora
                                </span>
                                <strong className="text-white">
                                  {evento.hora_evento || "20:00"} hrs
                                </strong>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase text-gray-400">
                                  Lugar
                                </span>
                                <strong className="text-white">
                                  {evento.lugar || "Salón VIP"}
                                </strong>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase text-gray-400">
                                  Código de Vestimenta
                                </span>
                                <strong className="text-white">
                                  {invForm.codigo_vestimenta || "Formal / Libre"}
                                </strong>
                              </div>
                            </div>

                            {/* Notificación de Modalidad de Asistencia */}
                            <div className="mt-3 rounded-xl border border-[#15b2f5]/35 bg-[#15b2f5]/10 px-3.5 py-2 text-xs text-[#15b2f5]">
                              <strong>Modalidad de Asistencia:</strong>{" "}
                              {normalizeModalidad(
                                selectedEmailLinkObj &&
                                  !selectedEmailLinkObj.isPrincipal
                                  ? selectedEmailLinkObj.modalidad
                                  : previewGuestObj?.modalidad_pase ||
                                      invForm.modalidad_invitados
                              )}{" "}
                              (
                              {selectedEmailLinkObj &&
                              !selectedEmailLinkObj.isPrincipal &&
                              selectedEmailLinkObj.adultos +
                                selectedEmailLinkObj.ninos >
                                0
                                ? selectedEmailLinkObj.adultos +
                                  selectedEmailLinkObj.ninos
                                : previewGuestObj?.pases || 2}{" "}
                              pases)
                            </div>

                            <div className="mt-5">
                              <a
                                href={selectedEmailLinkObj?.url || baseShareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-block rounded-none px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition hover:opacity-90 ${activeEmailTemplate.buttonClass}`}
                              >
                                Confirmar Asistencia
                              </a>
                            </div>

                            <p className="mt-4 break-all font-mono text-[10px] text-gray-400">
                              Enlace de la invitación:{" "}
                              {selectedEmailLinkObj?.url || baseShareUrl}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#9CA3AF]">
                          Código HTML con estilos en línea listo para clientes
                          de correo (Gmail, Outlook, Apple Mail):
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              buildEmailHtmlCode(previewGuestObj)
                            );
                            showNotice(
                              "✓ Código HTML de la invitación copiado al portapapeles."
                            );
                          }}
                          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#5B21B6]"
                        >
                          <Copy className="h-3.5 w-3.5 stroke-[2]" />
                          <span>Copiar Código HTML</span>
                        </button>
                      </div>
                      <pre className="max-h-80 overflow-auto rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-4 font-mono text-[11px] leading-relaxed text-[#6D28D9]">
                        {buildEmailHtmlCode(previewGuestObj)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Sección de Recordatorios Automatizados */}
          <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1F2F6] pb-4">
              <div className="flex items-start gap-3.5 sm:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                  <AlarmClock className="h-5 w-5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    AUTOMATIZACIÓN INTELIGENTE
                  </span>
                  <h4 className="text-sm font-bold text-[#111827] sm:text-base">
                    Recordatorios Automatizados para Invitados Confirmados
                  </h4>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">
                    Dispara automáticamente un mensaje a los{" "}
                    <strong className="font-semibold text-[#059669]">
                      {confirmadosList.length} invitados Confirmados
                    </strong>{" "}
                    para recordarles cuántos días u horas faltan para la fiesta según el caso seleccionado.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="min-w-0 space-y-3.5 lg:col-span-5">
                {/* 1. Disparar cuando falten (días) + su check individual */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Disparar cuando falten (días)
                  </label>
                  <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={invForm.recordatorio_dias ?? 3}
                      onFocus={() => handleSwitchReminderMode("dias")}
                      onChange={(e) => {
                        setReminderPreviewMode("dias");
                        setInvForm((p) => ({
                          ...p,
                          recordatorio_dias: e.target.value,
                          recordatorio_mensaje: String(
                            p.recordatorio_mensaje || ""
                          ).replace(/\{horas\}\s*horas?/gi, "{dias} días"),
                        }));
                      }}
                      className="w-full shrink-0 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-bold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 sm:w-28"
                    />
                    <label
                      className={`flex min-w-0 cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition sm:flex-1 sm:justify-start ${
                        invForm.recordatorio_activo
                          ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9]"
                          : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#6D28D9]/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(invForm.recordatorio_activo)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) handleSwitchReminderMode("dias");
                          setInvForm((p) => ({
                            ...p,
                            recordatorio_activo: checked,
                          }));
                        }}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-[#6D28D9]"
                      />
                      <span className="truncate">
                        Recordatorio por Días Activo
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2. Disparar cuando falten (horas) + su check individual (debajo de días) */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Disparar cuando falten (horas)
                  </label>
                  <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={invForm.recordatorio_horas ?? 12}
                      onFocus={() => handleSwitchReminderMode("horas")}
                      onChange={(e) => {
                        setReminderPreviewMode("horas");
                        setInvForm((p) => ({
                          ...p,
                          recordatorio_horas: e.target.value,
                          recordatorio_mensaje: String(
                            p.recordatorio_mensaje || ""
                          ).replace(/\{dias\}\s*d[ií]as?/gi, "{horas} horas"),
                        }));
                      }}
                      className="w-full shrink-0 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-bold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12 sm:w-28"
                    />
                    <label
                      className={`flex min-w-0 cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition sm:flex-1 sm:justify-start ${
                        invForm.recordatorio_horas_activo
                          ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9]"
                          : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#6D28D9]/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(invForm.recordatorio_horas_activo)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) handleSwitchReminderMode("horas");
                          setInvForm((p) => ({
                            ...p,
                            recordatorio_horas_activo: checked,
                          }));
                        }}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-[#6D28D9]"
                      />
                      <span className="truncate">
                        Recordatorio por Horas Activo
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-col justify-between space-y-2.5 lg:col-span-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <label className="block text-[11px] font-medium text-[#9CA3AF]">
                    Mensaje del Recordatorio Automático
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center">
                    <button
                      type="button"
                      onClick={() => handleSwitchReminderMode("dias")}
                      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border px-3 py-1.5 text-center text-[11px] font-semibold transition sm:py-1 ${
                        reminderPreviewMode !== "horas"
                          ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-2xs"
                          : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#6D28D9] hover:text-[#6D28D9]"
                      }`}
                    >
                      <Hourglass className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Caso Días ({invForm.recordatorio_dias ?? 3} días)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchReminderMode("horas")}
                      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border px-3 py-1.5 text-center text-[11px] font-semibold transition sm:py-1 ${
                        reminderPreviewMode === "horas"
                          ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-2xs"
                          : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#6D28D9] hover:text-[#6D28D9]"
                      }`}
                    >
                      <AlarmClock className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Caso Horas ({invForm.recordatorio_horas ?? 12} hrs)</span>
                    </button>
                  </div>
                </div>

                {/* VISTA PREVIA DEL RECORDATORIO SEGÚN EL EVENTO */}
                {(() => {
                  const hasCustomThumb = Boolean(
                    String(
                      invForm.imagen_portada || evento.imagen_portada || ""
                    ).trim()
                  );
                  const previewThumbSrc = hasCustomThumb
                    ? invForm.imagen_portada || evento.imagen_portada
                    : "/default-invitacion.svg";
                  const isHorasMode = reminderPreviewMode === "horas";
                  const cantDias = Math.max(
                    1,
                    Number(invForm.recordatorio_dias ?? 3) || 3
                  );
                  const cantHoras = Math.max(
                    1,
                    Number(invForm.recordatorio_horas ?? 12) || 12
                  );
                  const autoTemplate = isHorasMode
                    ? DEFAULT_CONFIRMED_REMINDER_HORAS
                    : DEFAULT_CONFIRMED_REMINDER_DIAS;
                  const renderedReminderText = formatGuestMessage(
                    autoTemplate,
                    null,
                    selectedWhatsappLinkObj?.url || baseShareUrl,
                    {
                      mode: isHorasMode ? "horas" : "dias",
                      dias: cantDias,
                      horas: cantHoras,
                      useConfiguredCountdown: true,
                      adaptCountdown: true,
                    }
                  );

                  return (
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-3.5 text-[#111827] sm:p-4">
                      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] pb-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                          <Eye className="h-3.5 w-3.5 stroke-[2]" />
                          <span>Vista Previa según el Evento (Invitados Confirmados)</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#F3E8FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                          <ImageIcon className="h-3 w-3 stroke-[2]" />
                          <span>
                            {hasCustomThumb
                              ? "Miniatura del evento"
                              : "Miniatura genérica"}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-start gap-3 sm:items-center">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white sm:h-20 sm:w-20">
                          <img
                            src={previewThumbSrc}
                            alt={invForm.nombre || evento.nombre}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/default-invitacion.svg";
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#F3E8FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                              {isHorasMode ? (
                                <AlarmClock className="h-3 w-3 stroke-[2]" />
                              ) : (
                                <Hourglass className="h-3 w-3 stroke-[2]" />
                              )}
                              <span>
                                {isHorasMode
                                  ? `Faltan ${cantHoras} ${
                                      cantHoras === 1 ? "hora" : "horas"
                                    }`
                                  : `Faltan ${cantDias} ${
                                      cantDias === 1 ? "día" : "días"
                                    }`}
                              </span>
                            </span>
                            <span className="rounded-md bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#059669]">
                              ✓ Confirmado
                            </span>
                          </div>
                          <h5 className="mt-1 truncate text-sm font-bold text-[#111827] sm:text-base">
                            {invForm.nombre || evento.nombre}
                          </h5>
                          <p className="mt-0.5 break-words text-[11px] text-[#6B7280]">
                            {formatDateInput(
                              invForm.fecha_evento || evento.fecha_evento
                            )}{" "}
                            •{" "}
                            {invForm.hora_evento ||
                              evento.hora_evento ||
                              "20:00"}{" "}
                            hrs •{" "}
                            {invForm.lugar || evento.lugar || "Salón Principal"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 break-words rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs leading-relaxed text-[#374151]">
                        {renderedReminderText}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* SUBSECCIÓN INDEPENDIENTE: Envío Automático de Correo en Fecha y Hora Específica */}
            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#F3E8FF] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                      INDEPENDIENTE DE &ldquo;DISPARAR CUANDO FALTEN (DÍAS)&rdquo;
                    </span>
                  </div>
                  <h5 className="mt-1.5 flex items-center gap-1.5 text-sm font-bold tracking-tight text-[#111827] sm:text-base">
                    <Mail className="h-4 w-4 text-[#6D28D9]" />
                    <span>Envío Automático de Correo en Fecha y Hora Específica</span>
                  </h5>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">
                    Programa uno o varios envíos automáticos de correo electrónico
                    para los{" "}
                    <strong className="font-semibold text-[#059669]">
                      {confirmadosList.length} invitados en estado &ldquo;Confirmado&rdquo;
                    </strong>{" "}
                    en una fecha y hora exacta (horario CDMX), sin depender del
                    contador de días restantes.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F3E8FF] px-3 py-1.5 text-[11px] font-semibold text-[#6D28D9]">
                  <Calendar className="h-3.5 w-3.5 stroke-[2]" />
                  <span>
                    {correosProgramadosList.length} programado
                    {correosProgramadosList.length === 1 ? "" : "s"}
                  </span>
                </span>
              </div>

              <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Fecha de Envío *
                  </label>
                  <input
                    type="date"
                    value={scheduledEmailForm.fecha}
                    onChange={(e) =>
                      setScheduledEmailForm((p) => ({
                        ...p,
                        fecha: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Hora Exacta *
                  </label>
                  <input
                    type="time"
                    value={scheduledEmailForm.hora}
                    onChange={(e) =>
                      setScheduledEmailForm((p) => ({
                        ...p,
                        hora: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                  />
                </div>

                <div className="sm:col-span-1 lg:col-span-3">
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Plantilla de Correo HTML
                  </label>
                  <select
                    value={scheduledEmailForm.templateId}
                    onChange={(e) =>
                      setScheduledEmailForm((p) => ({
                        ...p,
                        templateId: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                  >
                    <option value="neon-vip">Neon VIP (Azul / Índigo)</option>
                    <option value="gala-gold">Gala Gold (Dorado)</option>
                    <option value="cyber-party">
                      Cyber Party (Esmeralda)
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-1 lg:col-span-4">
                  <label className="mb-1.5 block text-[11px] font-medium text-[#9CA3AF]">
                    Nota / Mensaje Personalizado (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Si lo dejas vacío se usará el mensaje del recordatorio..."
                    value={scheduledEmailForm.mensaje}
                    onChange={(e) =>
                      setScheduledEmailForm((p) => ({
                        ...p,
                        mensaje: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/12"
                  />
                </div>
              </div>

              <div className="mt-3.5 flex justify-end">
                <button
                  type="button"
                  disabled={savingScheduledEmail}
                  onClick={handleCreateScheduledEmail}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6] disabled:opacity-50 sm:w-auto"
                >
                  {savingScheduledEmail ? (
                    <>
                      <Hourglass className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Programando envío...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 stroke-[2.2]" />
                      <span>Agregar Envío Automático de Correo</span>
                    </>
                  )}
                </button>
              </div>

              {correosProgramadosList.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-[#E5E7EB] pt-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    Envíos Automáticos de Correo Programados ({correosProgramadosList.length}):
                  </p>
                  <div className="space-y-2">
                    {correosProgramadosList.map((item) => {
                      let parsed = {};
                      try {
                        parsed = JSON.parse(item.detalle || "{}");
                      } catch {
                        parsed = { mensaje: item.detalle || "" };
                      }
                      const isSent = item.estado === "Enviado";
                      const isPaused = item.estado === "Pausado";
                      const tplLabel =
                        parsed.templateId === "gala-gold"
                          ? "Gala Gold"
                          : parsed.templateId === "cyber-party"
                          ? "Cyber Party"
                          : "Neon VIP";

                      return (
                        <div
                          key={item.iditem}
                          className="flex flex-col items-stretch justify-between gap-2.5 rounded-xl border border-[#E5E7EB] bg-white p-3.5 text-xs sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#F3E8FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#6D28D9]">
                                <Calendar className="h-3 w-3 stroke-[2]" />
                                <span>
                                  {item.fecha_limite || "Sin fecha"} •{" "}
                                  {item.hora_itinerario || "10:00"} hrs
                                </span>
                              </span>
                              <span
                                className={`rounded-md px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                  isSent
                                    ? "bg-[#ECFDF5] text-[#059669]"
                                    : isPaused
                                    ? "bg-[#F4F5F8] text-[#6B7280]"
                                    : "bg-[#F3E8FF] text-[#6D28D9]"
                                }`}
                              >
                                {isSent
                                  ? "✓ Enviado"
                                  : isPaused
                                  ? "Pausado"
                                  : "Programado"}
                              </span>
                              <span className="rounded-md border border-[#E5E7EB] bg-[#FAFAFC] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                                {tplLabel}
                              </span>
                            </div>
                            {parsed.mensaje && (
                              <p className="mt-1 truncate text-[11px] text-[#6B7280]">
                                {parsed.mensaje}
                              </p>
                            )}
                            {parsed.resultado && (
                              <p className="mt-1 text-[11px] font-semibold text-[#059669]">
                                ✓ {parsed.resultado}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleScheduledEmailStatus(item)
                              }
                              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-none border border-[#E5E7EB] bg-white px-3 py-1.5 text-center text-[11px] font-semibold text-[#374151] transition hover:border-[#6D28D9] hover:text-[#6D28D9] sm:flex-initial"
                            >
                              {isSent ? (
                                <>
                                  <RefreshCw className="h-3 w-3 stroke-[2]" />
                                  <span>Reprogramar</span>
                                </>
                              ) : isPaused ? (
                                <>
                                  <Play className="h-3 w-3 stroke-[2]" />
                                  <span>Activar</span>
                                </>
                              ) : (
                                <>
                                  <Pause className="h-3 w-3 stroke-[2]" />
                                  <span>Pausar</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLogistica(item.iditem)}
                              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-none border border-[#E5E7EB] bg-white px-3 py-1.5 text-center text-[11px] font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 sm:flex-initial"
                            >
                              <Trash2 className="h-3 w-3 stroke-[2]" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {pendientesList.length > 0 && (
              <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-3.5">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#6D28D9]">
                  Invitados en estado &ldquo;Pendiente&rdquo; ({pendientesList.length})
                  {metaWaForm.configured
                    ? " — Envío Silencioso por WhatsApp API:"
                    : ":"}
                </p>
                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {pendientesList.map((g) => (
                    <div
                      key={g.idinvitado}
                      className="flex flex-col items-stretch justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs sm:flex-row sm:flex-wrap sm:items-center"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-[#111827]">{g.nombre}</span>{" "}
                        <span className="break-all text-[11px] text-[#9CA3AF]">
                          ({g.telefono || "Sin teléfono"} •{" "}
                          {g.correo || "Sin correo"})
                        </span>
                      </div>
                      <div className="flex w-full items-center gap-1.5 sm:w-auto">
                        {metaWaForm.configured && (
                          <button
                            type="button"
                            disabled={sendingWaGuestId === g.idinvitado}
                            onClick={() => handleSendSilentWhatsAppReminder(g)}
                            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#059669] px-3 py-2 text-center text-[11px] font-semibold text-white transition hover:bg-[#047857] disabled:opacity-50 sm:flex-initial sm:py-1.5"
                          >
                            {sendingWaGuestId === g.idinvitado ? (
                              <>
                                <Hourglass className="h-3.5 w-3.5 stroke-[2]" />
                                <span>Enviando...</span>
                              </>
                            ) : (
                              <>
                                <Rocket className="h-3.5 w-3.5 stroke-[2]" />
                                <span>Enviar Silencioso (API Meta)</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const guestPases = Math.max(
                              1,
                              Number(g?.pases || 1)
                            );
                            const isNewSend = !g?.invitacion_enviada;
                            validateAndWarnBeforeShare({
                              canal: "Recordatorio Manual desde mi WhatsApp",
                              destinatarioLabel: `${g.nombre} (${
                                g.telefono || "WhatsApp"
                              } • ${guestPases} pase${
                                guestPases === 1 ? "" : "s"
                              })`,
                              proyectadoInvitados: totalInvitadosCount,
                              proyectadoPases: totalPasesLista,
                              enviadosDespuesInvitados:
                                invitadosEnviadosCount + (isNewSend ? 1 : 0),
                              enviadosDespuesPases:
                                pasesEnviadosCount +
                                (isNewSend ? guestPases : 0),
                              onProceed: async () => {
                                const text = formatGuestMessage(
                                  DEFAULT_PENDING_REMINDER_MSG,
                                  g
                                );
                                const cleanPhone = String(
                                  g.telefono || ""
                                ).replace(/\D/g, "");
                                const waUrl = cleanPhone
                                  ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                      text
                                    )}`
                                  : `https://wa.me/?text=${encodeURIComponent(
                                      text
                                    )}`;
                                window.open(
                                  waUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                                await handleUpdateGuest(g.idinvitado, {
                                  invitacion_enviada: true,
                                  canal_ultimo_envio: "Recordatorio WhatsApp",
                                });
                              },
                            });
                          }}
                          title="Abrir mi WhatsApp para enviar el recordatorio manualmente"
                          className="inline-flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-3 py-2 text-center text-[11px] font-semibold text-[#6D28D9] transition hover:border-[#6D28D9] hover:bg-[#F5F3FF] sm:flex-initial sm:py-1.5"
                        >
                          <MessageCircle className="h-3.5 w-3.5 stroke-[2]" />
                          <span>Enviar por mi WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col items-stretch justify-end gap-2.5 border-t border-[#F1F2F6] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={(e) => handleSaveEvento(e)}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#374151] transition hover:border-[#6D28D9] hover:text-[#6D28D9] sm:w-auto"
              >
                <Save className="h-3.5 w-3.5 stroke-[2]" />
                <span>Guardar Regla de Recordatorio</span>
              </button>
              <button
                type="button"
                disabled={sendingWaBulk}
                onClick={handleTriggerBulkReminders}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(109,40,217,0.22)] transition hover:bg-[#5B21B6] disabled:opacity-50 sm:w-auto"
              >
                {sendingWaBulk ? (
                  <>
                    <Hourglass className="h-3.5 w-3.5 stroke-[2]" />
                    <span>Disparando por API Meta...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 stroke-[2]" />
                    <span>Disparar Ahora a {confirmadosList.length} Confirmados</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB D: 📋 LOGÍSTICA DEL EVENTO (/events/[id]/logistics)
         ===================================================================== */}
      {currentTab === "logistics" && (
        <div className="space-y-8">
          {/* 1. DISTRIBUCIÓN DE MESAS / SEATING CHART (DRAG & DROP) */}
          <div className="rounded-2xl border border-[#E6E9F4] bg-white shadow-xs p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E6E9F4] pb-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2D3047]">
                  🪑 Distribución de Mesas / Seating Chart (Drag & Drop)
                </h3>
                <p className="text-xs text-[#8E94A9]">
                  Arrastra y suelta invitados desde la columna izquierda hacia
                  cualquier mesa numerada, o cámbialos con el selector rápido.
                </p>
              </div>

              {/* Formulario rápido para añadir mesa */}
              <form
                onSubmit={handleCreateMesa}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  type="text"
                  value={newMesaForm.titulo}
                  onChange={(e) =>
                    setNewMesaForm((p) => ({ ...p, titulo: e.target.value }))
                  }
                  placeholder="Ej. Mesa 4 - Terraza"
                  className="rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                />
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={newMesaForm.capacidad_mesa}
                  onChange={(e) =>
                    setNewMesaForm((p) => ({
                      ...p,
                      capacidad_mesa: e.target.value,
                    }))
                  }
                  className="w-20 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-2.5 py-2 text-xs text-[#2D3047] outline-none"
                  title="Capacidad de asientos"
                />
                <button
                  type="submit"
                  className="btn-glow-red rounded-xl bg-[#6C7EE1] px-4 py-2 text-xs font-bold text-white"
                >
                  + Crear Mesa
                </button>
              </form>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Columna Izquierda: Invitados Sin Asignar (Zona Drag & Drop) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverMesa("Sin asignar");
                }}
                onDragLeave={() => setDragOverMesa(null)}
                onDrop={() => handleDropGuestOnMesa("Sin asignar")}
                className={`rounded-2xl border p-4 transition lg:col-span-4 ${
                  dragOverMesa === "Sin asignar"
                    ? "border-[#6C7EE1] bg-[#6C7EE1]/10"
                    : "border-[#E6E9F4] bg-[#F7F8FC]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B617A]">
                    🚶 Invitados Sin Mesa Asignada
                  </h4>
                  <span className="rounded-full bg-[#ECEFFA] px-2.5 py-0.5 text-[10px] font-bold text-[#6C7EE1]">
                    {
                      invitados.filter(
                        (g) =>
                          !g.mesa_asignada || g.mesa_asignada === "Sin asignar"
                      ).length
                    }
                  </span>
                </div>

                <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
                  {invitados
                    .filter(
                      (g) =>
                        !g.mesa_asignada || g.mesa_asignada === "Sin asignar"
                    )
                    .map((g) => (
                      <div
                        key={g.idinvitado}
                        draggable
                        onDragStart={() => setDraggedGuestId(g.idinvitado)}
                        className="cursor-grab rounded-xl border border-[#E6E9F4] bg-white shadow-xs p-3 text-xs transition hover:border-[#6C7EE1]/60 active:cursor-grabbing"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2D3047]">
                            ⠿ {g.nombre}
                          </span>
                          <span className="rounded bg-[#6C7EE1]/20 px-2 py-0.5 text-[10px] font-bold text-[#6C7EE1]">
                            {g.pases} pases
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-[#8E94A9]">
                            {g.grupo || "Amigos"}
                          </span>
                          <select
                            value="Sin asignar"
                            onChange={(e) =>
                              handleUpdateGuest(g.idinvitado, {
                                mesa_asignada: e.target.value,
                              })
                            }
                            className="rounded border border-[#DCE0F0] bg-[#F7F8FC] px-2 py-0.5 text-[10px] text-[#5B617A] outline-none"
                          >
                            <option value="Sin asignar">Mover a mesa...</option>
                            {mesasItems.map((m) => (
                              <option key={m.iditem} value={m.titulo}>
                                {m.titulo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Cuadrícula de Mesas Numeradas (Zonas de Drop) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
                {mesasItems.map((mesa) => {
                  const seatedGuests = invitados.filter(
                    (g) => g.mesa_asignada === mesa.titulo
                  );
                  const ocupados = seatedGuests.reduce(
                    (acc, g) => acc + Number(g.pases || 1),
                    0
                  );
                  const cap = Number(mesa.capacidad_mesa) || 8;
                  const pct = Math.min(100, Math.round((ocupados / cap) * 100));

                  return (
                    <div
                      key={mesa.iditem}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverMesa(mesa.titulo);
                      }}
                      onDragLeave={() => setDragOverMesa(null)}
                      onDrop={() => handleDropGuestOnMesa(mesa.titulo)}
                      className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                        dragOverMesa === mesa.titulo
                          ? "border-[#6C7EE1] bg-[#6C7EE1]/10 shadow-[0_0_20px_rgba(21,178,245,0.2)]"
                          : "border-[#E6E9F4] bg-[#F7F8FC]"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-bold text-[#2D3047]">
                              🪑 {mesa.titulo}
                            </h5>
                            <p className="text-[10px] text-[#8E94A9]">
                              {mesa.detalle || "Zona General"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                ocupados > cap
                                  ? "bg-rose-500/20 text-[#F26B61]"
                                  : "bg-emerald-500/15 text-[#18A97E]"
                              }`}
                            >
                              {ocupados} / {cap} asientos
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteLogistica(mesa.iditem)}
                              className="text-xs text-gray-500 hover:text-[#F26B61]"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Barra de capacidad de la mesa */}
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#ECEFFA]">
                          <div
                            className={`h-full transition-all ${
                              ocupados > cap ? "bg-rose-500" : "bg-[#6C7EE1]"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Invitados sentados en la mesa */}
                        <div className="mt-3 space-y-1.5">
                          {seatedGuests.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-[#E6E9F4] py-4 text-center text-[11px] text-gray-500">
                              Arrastra invitados aquí
                            </p>
                          ) : (
                            seatedGuests.map((sg) => (
                              <div
                                key={sg.idinvitado}
                                draggable
                                onDragStart={() =>
                                  setDraggedGuestId(sg.idinvitado)
                                }
                                className="flex cursor-grab items-center justify-between rounded-lg border border-[#E6E9F4] bg-white shadow-xs px-2.5 py-1.5 text-xs"
                              >
                                <span className="truncate font-semibold text-[#2D3047]">
                                  ⠿ {sg.nombre}{" "}
                                  <span className="text-[10px] text-[#6C7EE1]">
                                    ({sg.pases}p)
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateGuest(sg.idinvitado, {
                                      mesa_asignada: "Sin asignar",
                                    })
                                  }
                                  className="text-[10px] text-[#8E94A9] hover:text-[#F26B61]"
                                  title="Quitar de la mesa"
                                >
                                  Quitar
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. CHECKLIST / TAREAS Y 3. CRONOGRAMA DEL DÍA (ITINERARIO) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Checklist / Tareas con Fecha Límite */}
            <div className="rounded-2xl border border-[#E6E9F4] bg-white shadow-xs p-6">
              <h4 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2D3047]">
                ✅ Checklist / Tareas con Fecha Límite
              </h4>
              <p className="text-xs text-[#8E94A9]">
                Pendientes previos a la fiesta (ej. Contratar sonido, comprar
                bebidas, confirmar pastel).
              </p>

              <form
                onSubmit={handleCreateTask}
                className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                <input
                  type="text"
                  required
                  value={newTaskForm.titulo}
                  onChange={(e) =>
                    setNewTaskForm((p) => ({ ...p, titulo: e.target.value }))
                  }
                  placeholder="Tarea pendiente *"
                  className="rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1] sm:col-span-2"
                />
                <input
                  type="date"
                  value={newTaskForm.fecha_limite}
                  onChange={(e) =>
                    setNewTaskForm((p) => ({
                      ...p,
                      fecha_limite: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                />
                <input
                  type="text"
                  value={newTaskForm.detalle}
                  onChange={(e) =>
                    setNewTaskForm((p) => ({ ...p, detalle: e.target.value }))
                  }
                  placeholder="Responsable / Proveedor"
                  className="rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs text-[#2D3047] outline-none sm:col-span-2"
                />
                <button
                  type="submit"
                  className="btn-glow-red rounded-xl bg-[#6C7EE1] px-4 py-2 text-xs font-bold text-white"
                >
                  + Agregar Tarea
                </button>
              </form>

              <div className="mt-4 space-y-2">
                {tareasItems.map((item) => {
                  const done = item.estado === "Completado";
                  return (
                    <div
                      key={item.iditem}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#E6E9F4] bg-[#F7F8FC] p-3 text-xs"
                    >
                      <label className="flex cursor-pointer items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() =>
                            handleUpdateLogistica(item.iditem, {
                              estado: done ? "Pendiente" : "Completado",
                            })
                          }
                          className="mt-0.5 h-4 w-4 accent-[#6C7EE1]"
                        />
                        <div>
                          <p
                            className={`font-bold ${
                              done
                                ? "line-through text-gray-500"
                                : "text-[#2D3047]"
                            }`}
                          >
                            {item.titulo}
                          </p>
                          <p className="text-[10px] text-[#8E94A9]">
                            {item.detalle || "General"}
                            {item.fecha_limite
                              ? ` • 📅 Límite: ${item.fecha_limite}`
                              : ""}
                          </p>
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteLogistica(item.iditem)}
                        className="text-gray-500 hover:text-[#F26B61]"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cronograma del Día (Itinerario) */}
            <div className="rounded-2xl border border-[#E6E9F4] bg-white shadow-xs p-6">
              <h4 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2D3047]">
                ⏱️ Cronograma del Día (Itinerario)
              </h4>
              <p className="text-xs text-[#8E94A9]">
                Horarios minuto a minuto (ej. 20:00 Recepción, 21:30 Cena, 23:00
                Apertura de pista).
              </p>

              <form
                onSubmit={handleCreateCronograma}
                className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4"
              >
                <input
                  type="time"
                  value={newCronoForm.hora_itinerario}
                  onChange={(e) =>
                    setNewCronoForm((p) => ({
                      ...p,
                      hora_itinerario: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs font-bold text-[#6C7EE1] outline-none"
                />
                <input
                  type="text"
                  required
                  value={newCronoForm.titulo}
                  onChange={(e) =>
                    setNewCronoForm((p) => ({ ...p, titulo: e.target.value }))
                  }
                  placeholder="Actividad (ej. Apertura de pista)"
                  className="rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs text-[#2D3047] outline-none sm:col-span-2"
                />
                <button
                  type="submit"
                  className="btn-glow-red rounded-xl bg-[#6C7EE1] px-3 py-2 text-xs font-bold text-white"
                >
                  + Añadir Hora
                </button>
              </form>

              <div className="mt-4 space-y-2.5 border-l-2 border-[#6C7EE1]/40 pl-4 ml-2">
                {cronogramaItems.map((item) => (
                  <div
                    key={item.iditem}
                    className="flex items-center justify-between rounded-xl border border-[#E6E9F4] bg-[#F7F8FC] p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-[#6C7EE1]/20 px-2.5 py-1 font-mono text-xs font-bold text-[#6C7EE1]">
                        {item.hora_itinerario || "20:00"}
                      </span>
                      <div>
                        <p className="font-bold text-[#2D3047]">{item.titulo}</p>
                        {item.detalle && (
                          <p className="text-[10px] text-[#8E94A9]">
                            {item.detalle}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLogistica(item.iditem)}
                      className="text-gray-500 hover:text-[#F26B61]"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PESTAÑA OPCIONAL: 💰 PRESUPUESTO (/events/[id]/budget)
         ===================================================================== */}
      {currentTab === "budget" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddBudget}
            className="rounded-2xl border border-[#E6E9F4] bg-white shadow-xs p-6"
          >
            <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2D3047]">
              💰 Control de Presupuesto y Proveedores
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                type="text"
                required
                value={budgetForm.concepto}
                onChange={(e) =>
                  setBudgetForm((p) => ({ ...p, concepto: e.target.value }))
                }
                placeholder="Concepto / Proveedor *"
                className="rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none lg:col-span-2"
              />
              <input
                type="number"
                min="0"
                value={budgetForm.monto_estimado}
                onChange={(e) =>
                  setBudgetForm((p) => ({
                    ...p,
                    monto_estimado: e.target.value,
                  }))
                }
                placeholder="Costo Estimado ($)"
                className="rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none"
              />
              <input
                type="number"
                min="0"
                value={budgetForm.monto_pagado}
                onChange={(e) =>
                  setBudgetForm((p) => ({ ...p, monto_pagado: e.target.value }))
                }
                placeholder="Monto Pagado ($)"
                className="rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none"
              />
              <button
                type="submit"
                className="btn-glow-red rounded-xl bg-[#6C7EE1] px-4 py-2.5 text-xs font-bold uppercase text-white"
              >
                + Registrar Gasto
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-[#E6E9F4] bg-white shadow-xs p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E9F4] text-[#8E94A9]">
                    <th className="pb-3">Concepto</th>
                    <th className="pb-3">Estimado</th>
                    <th className="pb-3">Pagado</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEFFA]">
                  {presupuesto.map((b) => (
                    <tr key={b.idgasto}>
                      <td className="py-3 font-semibold text-[#2D3047]">
                        {b.concepto}
                      </td>
                      <td className="py-3 text-[#5B617A]">
                        ${Number(b.monto_estimado || 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-[#18A97E] font-bold">
                        ${Number(b.monto_pagado || 0).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <select
                          value={b.estado_pago}
                          onChange={(e) =>
                            handleUpdateBudget(b.idgasto, {
                              estado_pago: e.target.value,
                            })
                          }
                          className="rounded bg-[#ECEFFA] px-2 py-1 text-[11px] text-[#2D3047] outline-none"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Anticipo">Anticipo</option>
                          <option value="Liquidado">Liquidado</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteBudget(b.idgasto)}
                          className="text-[#8E94A9] hover:text-[#F26B61]"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB E: ⚙️ AJUSTES DEL EVENTO Y QR DE ACCESO (/events/[id]/settings)
         ===================================================================== */}
      {currentTab === "settings" && (
        <div className="grid grid-cols-1 gap-6 rounded-3xl bg-[#F7F8FB] p-3 text-[#111827] sm:gap-8 sm:p-6 lg:grid-cols-12">
          {/* Columna Izquierda (7 cols): Límite de Invitados, Duplicar, Pausar RSVP, Cambiar Propietario, Eliminar */}
          <div className="space-y-6 lg:col-span-7">
            {/* Tarjeta Principal: Configuración del Número de Invitados Permitidos */}
            <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                    <Users className="h-5 w-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6D28D9]">
                      CONFIGURACIÓN DE CAPACIDAD Y ENVÍOS
                    </span>
                    <h3 className="mt-0.5 text-lg font-bold tracking-tight text-[#111827] sm:text-xl">
                      Número de Invitados Permitidos
                    </h3>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold ${
                    isGuestLimitExceeded
                      ? "border border-[#FDE68A] bg-[#FEF3C7] text-[#D97706]"
                      : "border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]"
                  }`}
                >
                  {isGuestLimitExceeded ? (
                    <>
                      <AlertTriangle className="h-3 w-3 stroke-[2]" />
                      <span>Límite superado (+{excedenteInvitadosActual})</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 stroke-[2.2]" />
                      <span>Dentro del límite configurado</span>
                    </>
                  )}
                </span>
              </div>

              <p className="mt-2 text-xs text-[#6B7280]">
                Especifica el número máximo de invitados permitidos para tu
                evento. Si al compartir las invitaciones virtuales por{" "}
                <strong className="text-[#111827]">WhatsApp</strong> o{" "}
                <strong className="text-[#111827]">Correo Electrónico</strong>{" "}
                se sobrepasa esta cantidad, el sistema mostrará una advertencia.
              </p>

              <div className="mt-4 rounded-2xl border border-[#F0F1F6] bg-[#FAFAFC] p-4">
                <label className="mb-1.5 block text-[11px] font-semibold text-[#6B7280]">
                  Número de Invitados Permitidos en este Evento *
                </label>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={invForm.capacidad ?? evento.capacidad ?? 100}
                    onChange={(e) =>
                      setInvForm((prev) => ({
                        ...prev,
                        capacidad: e.target.value,
                      }))
                    }
                    placeholder="Ej. 100"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-bold text-[#111827] shadow-2xs outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/15 sm:max-w-[220px]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const cleanCapacidad = Math.max(
                        1,
                        Number(invForm.capacidad) || 1
                      );
                      setInvForm((prev) => ({
                        ...prev,
                        capacidad: cleanCapacidad,
                      }));
                      await handleSaveEvento(null, {
                        capacidad: cleanCapacidad,
                      });
                    }}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#5B21B6]"
                  >
                    <Save className="h-3.5 w-3.5 stroke-[2]" />
                    <span>Guardar Límite de Invitados</span>
                  </button>
                </div>

                {/* Resumen comparativo en vivo */}
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-3.5 shadow-2xs">
                    <span className="block text-[10px] font-bold uppercase text-[#9CA3AF]">
                      Permitidos (Configuración)
                    </span>
                    <p className="mt-0.5 text-lg font-extrabold text-[#111827]">
                      {limiteInvitadosPermitidos}{" "}
                      <span className="text-xs font-semibold text-[#6B7280]">
                        máx.
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-3.5 shadow-2xs">
                    <span className="block text-[10px] font-bold uppercase text-[#9CA3AF]">
                      En Lista Ahora
                    </span>
                    <p
                      className={`mt-0.5 text-xs font-extrabold ${
                        totalPasesLista > limiteInvitadosPermitidos ||
                        totalInvitadosCount > limiteInvitadosPermitidos
                          ? "text-[#D97706]"
                          : "text-[#111827]"
                      }`}
                    >
                      {totalInvitadosCount} invitados registrados /{" "}
                      <span className="font-semibold text-[#6B7280]">
                        {totalPasesLista} lugares
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-3.5 shadow-2xs">
                    <span className="block text-[10px] font-bold uppercase text-[#9CA3AF]">
                      Enviados (WhatsApp/Correo)
                    </span>
                    <p
                      className={`mt-0.5 text-lg font-extrabold ${
                        pasesEnviadosCount > limiteInvitadosPermitidos ||
                        invitadosEnviadosCount > limiteInvitadosPermitidos
                          ? "text-rose-600"
                          : "text-[#059669]"
                      }`}
                    >
                      {invitadosEnviadosCount} env.{" "}
                      <span className="text-xs font-semibold text-[#6B7280]">
                        ({pasesEnviadosCount} pases)
                      </span>
                    </p>
                  </div>
                </div>

                {isGuestLimitExceeded && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#FDE68A] bg-[#FEF3C7]/60 px-3.5 py-2.5 text-[11px] font-semibold text-[#92400E]">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[2]" />
                    <span>
                      Actualmente el número de invitados/pases supera el límite
                      configurado en{" "}
                      <strong>
                        +{excedenteInvitadosActual} invitado(s)/pase(s)
                      </strong>
                      . Cuando compartas invitaciones por WhatsApp o Correo se
                      mostrará una advertencia.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                  <Settings className="h-5 w-5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6D28D9]">
                    GESTIÓN OPERATIVA DEL EVENTO
                  </span>
                  <h3 className="mt-0.5 text-lg font-bold tracking-tight text-[#111827] sm:text-xl">
                    Acciones de Control del Evento
                  </h3>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 1. Pausar / Reanudar respuestas RSVP */}
                <div className="flex flex-col justify-between rounded-2xl border border-[#F0F1F6] bg-[#FAFAFC] p-4">
                  <div>
                    <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
                      {invForm.rsvp_habilitado ? (
                        <Pause className="h-4 w-4 text-[#D97706]" />
                      ) : (
                        <Play className="h-4 w-4 text-[#059669]" />
                      )}
                      <span>
                        {invForm.rsvp_habilitado
                          ? "Pausar Respuestas del Evento"
                          : "Reanudar Respuestas del Evento"}
                      </span>
                    </h4>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Congela temporalmente el formulario de confirmación para
                      que nadie más modifique su asistencia.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePauseRsvp}
                    className={`mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none py-2.5 text-xs font-semibold transition ${
                      invForm.rsvp_habilitado
                        ? "border border-[#FDE68A] bg-[#FEF3C7] text-[#D97706] hover:bg-[#F59E0B] hover:text-white"
                        : "bg-[#059669] text-white hover:bg-[#047857]"
                    }`}
                  >
                    {invForm.rsvp_habilitado ? (
                      <>
                        <Pause className="h-3.5 w-3.5 stroke-[2]" />
                        <span>Pausar Evento</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 stroke-[2]" />
                        <span>Reactivar Evento</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Duplicar Evento */}
                <div className="flex flex-col justify-between rounded-2xl border border-[#F0F1F6] bg-[#FAFAFC] p-4">
                  <div>
                    <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
                      <Copy className="h-4 w-4 text-[#6D28D9]" />
                      <span>Duplicar Evento</span>
                    </h4>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Crea una copia exacta del diseño de invitación
                      <span className="hidden">, mesas, cronograma y presupuesto</span>{" "}
                      y configuración para otra fecha.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDuplicateEvento}
                    className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#DDD6FE] bg-[#F3E8FF] py-2.5 text-xs font-semibold text-[#6D28D9] transition hover:bg-[#6D28D9] hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5 stroke-[2]" />
                    <span>Duplicar Este Evento</span>
                  </button>
                </div>

                {/* 2.B Compartir Fotos y Reels a Invitados Confirmados */}
                <div className="flex flex-col justify-between rounded-2xl border border-[#F0F1F6] bg-[#FAFAFC] p-4 sm:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
                        <Camera className="h-4 w-4 text-[#6D28D9]" />
                        <span>Compartir Fotos y Reels a Invitados</span>
                      </h4>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Otorga permiso para que todos los invitados que{" "}
                        <strong className="text-[#111827]">
                          confirmaron su invitación
                        </strong>{" "}
                        puedan ver y descargar las fotografías y reels de este
                        evento desde su sesión en el apartado{" "}
                        <strong className="text-[#111827]">
                          &ldquo;Mis Invitaciones&rdquo;
                        </strong>
                        .
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold ${
                        invForm.compartir_album_invitados
                          ? "border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]"
                          : "border border-[#E5E7EB] bg-[#F4F5F8] text-[#6B7280]"
                      }`}
                    >
                      {invForm.compartir_album_invitados ? (
                        <>
                          <Check className="h-3 w-3 stroke-[2.2]" />
                          <span>Permiso Activo</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 stroke-[2]" />
                          <span>Privado (Solo Anfitrión)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextShare = !invForm.compartir_album_invitados;
                      setInvForm((p) => ({
                        ...p,
                        compartir_album_invitados: nextShare,
                      }));
                      handleSaveEvento(null, {
                        compartir_album_invitados: nextShare,
                      });
                    }}
                    className={`mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none py-2.5 text-xs font-semibold transition ${
                      invForm.compartir_album_invitados
                        ? "bg-[#059669] text-white hover:bg-[#047857]"
                        : "border border-[#DDD6FE] bg-[#F3E8FF] text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white"
                    }`}
                  >
                    <Share2 className="h-3.5 w-3.5 stroke-[2]" />
                    <span>
                      {invForm.compartir_album_invitados
                        ? "Compartiendo Fotos y Reels a Invitados (Haz clic para ocultar)"
                        : "Compartir Fotos y Reels a Invitados"}
                    </span>
                  </button>
                </div>
              </div>

              {/* 3. Cambiar Propietario / Organizador */}
              <form
                onSubmit={handleCambiarPropietario}
                className="mt-5 rounded-2xl border border-[#F0F1F6] bg-[#FAFAFC] p-4"
              >
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
                  <UserCheck className="h-4 w-4 text-[#6D28D9]" />
                  <span>Cambiar Propietario / Organizador Responsable</span>
                </h4>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Asigna el correo del organizador titular o transfiere el
                  evento a otra cuenta registrada en la plataforma.
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={nuevoPropietarioEmail}
                    onChange={(e) => setNuevoPropietarioEmail(e.target.value)}
                    placeholder="correo@nuevo-organizador.com"
                    className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] shadow-2xs outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/15"
                  />
                  <button
                    type="submit"
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#6D28D9] bg-white px-4 py-2.5 text-xs font-semibold text-[#6D28D9] transition hover:bg-[#6D28D9] hover:text-white"
                  >
                    <UserCheck className="h-3.5 w-3.5 stroke-[2]" />
                    <span>Actualizar Propietario</span>
                  </button>
                </div>

                <label className="mt-2.5 flex items-center gap-2 text-[11px] font-medium text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={transferirCuenta}
                    onChange={(e) => setTransferirCuenta(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D1D5DB] accent-[#6D28D9]"
                  />
                  <span>
                    Transferir propiedad completa si el correo ya tiene cuenta
                    registrada
                  </span>
                </label>
              </form>
            </div>

            {/* 4. Eliminar Evento */}
            <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-base text-rose-600">
                  <Trash2 className="h-5 w-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-rose-600">
                    <AlertTriangle className="h-4 w-4 stroke-[2]" />
                    <span>Zona de Peligro: Eliminar Evento</span>
                  </h4>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Esta acción eliminará permanentemente el evento, su lista de
                    invitados<span className="hidden">, mesas</span> y registros
                    asociados.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteEvento}
                className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none border border-rose-300 bg-rose-50 px-5 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-600 hover:text-white sm:w-auto"
              >
                <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
                <span>Eliminar Evento Definitivamente</span>
              </button>
            </div>
          </div>

          {/* Columna Derecha (5 cols): Generador de Código QR de Control de Acceso */}
          <div className="rounded-2xl border border-[#F0F1F6] bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.03)] sm:p-6 lg:col-span-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F8] text-base text-[#6D28D9]">
                  <QrCode className="h-5 w-5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6D28D9]">
                    CHECK-IN EN PUERTA
                  </span>
                  <h3 className="mt-0.5 text-lg font-bold tracking-tight text-[#111827] sm:text-xl">
                    Código QR de Control de Acceso
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCode = `QR-GATE-${Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase()}`;
                  setInvForm((p) => ({ ...p, codigo_acceso_qr: newCode }));
                  handleSaveEvento(null, { codigo_acceso_qr: newCode });
                }}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-[#F4F5F8] px-3 py-1.5 text-[11px] font-semibold text-[#374151] transition hover:border-[#DDD6FE] hover:bg-[#F3E8FF] hover:text-[#6D28D9]"
              >
                <RefreshCw className="h-3 w-3 stroke-[2]" />
                <span>Regenerar Llave</span>
              </button>
            </div>

            <p className="mt-2 text-xs text-[#6B7280]">
              Escanea este código en la entrada el día de la fiesta para validar
              pases y registrar el ingreso en tiempo real.
            </p>

            {/* Credencial / Pase con QR SVG */}
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-[#E5E7EB] bg-[#FAFAFC] p-5 text-center shadow-xs sm:p-6">
              <span className="rounded-md bg-[#F3E8FF] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6D28D9]">
                PASE DE CONTROL DE ACCESO
              </span>
              <h4 className="mt-2.5 text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                {evento.nombre}
              </h4>
              <p className="mt-0.5 text-xs font-medium text-[#6B7280]">
                {formatDateInput(evento.fecha_evento)} • {evento.hora_evento}{" "}
                hrs
              </p>

              {/* Lienzo QR SVG */}
              <div className="mt-4 rounded-2xl border border-[#F0F1F6] bg-white p-4 shadow-[0_8px_25px_rgba(109,40,217,0.1)]">
                <svg
                  viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                  className="h-40 w-40 sm:h-44 sm:w-44"
                  shapeRendering="crispEdges"
                >
                  {qrMatrix.map((row, rIdx) =>
                    row.map((cell, cIdx) =>
                      cell ? (
                        <rect
                          key={`${rIdx}-${cIdx}`}
                          x={cIdx}
                          y={rIdx}
                          width={1}
                          height={1}
                          fill="#111827"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>

              <p className="mt-3 font-mono text-xs font-bold tracking-widest text-[#6D28D9]">
                {invForm.codigo_acceso_qr || "QR-GATE-ACTIVO"}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#6B7280]">
                Aforo confirmado:{" "}
                <strong className="text-[#111827]">{pasesConfirmadosCount}</strong>{" "}
                / {evento.capacidad} pases
              </p>

              <div className="mt-5 flex w-full flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDownloadQrSvg}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-none bg-[#6D28D9] py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#5B21B6]"
                >
                  <Download className="h-3.5 w-3.5 stroke-[2]" />
                  <span>Descargar QR (SVG)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#374151] transition hover:border-[#DDD6FE] hover:bg-[#F3E8FF] hover:text-[#6D28D9]"
                >
                  <Printer className="h-3.5 w-3.5 stroke-[2]" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB D: 📸 CÁMARA EN VIVO Y ÁLBUM DE RECUERDOS HD (/events/[id]/memories)
         ===================================================================== */}
      {currentTab === "memories" && (
        <CamaraAlbumEvento
          evento={evento}
          onShowNotice={showNotice}
          shortcutAction={memoriesShortcutAction}
          onConsumeShortcut={onConsumeMemoriesShortcut}
        />
      )}
        </div>
      </div>
    </div>
  );
}

export default GestorEvento;
