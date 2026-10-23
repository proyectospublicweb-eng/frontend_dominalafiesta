import { useEffect, useMemo, useState } from "react";
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
  addLogisticaRequest,
  updateLogisticaRequest,
  deleteLogisticaRequest,
  addPresupuestoRequest,
  updatePresupuestoRequest,
  deletePresupuestoRequest,
} from "../../api/eventos.js";
import { GESTOR_TABS, normalizeGestorTab } from "./gestorTabs.js";

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
    adultos: 0,
    ninos: 0,
  });
  const [editingCustomLinkId, setEditingCustomLinkId] = useState(null);
  const [customLinkError, setCustomLinkError] = useState("");
  const [showConfirmCreateLinkModal, setShowConfirmCreateLinkModal] =
    useState(false);

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
        const draftObj = {
          ...draftEvento,
          idevento: null,
          fecha_evento: formatDateInput(draftEvento.fecha_evento),
          color_secundario: draftEvento.color_secundario || "#6C7EE1",
          imagen_portada: draftEvento.imagen_portada || "",
          texto_boton_rsvp:
            draftEvento.texto_boton_rsvp || "Confirmar Asistencia",
          modalidad_invitados: normalizeModalidad(
            draftEvento.modalidad_invitados
          ),
          permitir_acompanantes:
            draftEvento.permitir_acompanantes ?? true,
          confirmar_acceso_qr:
            draftEvento.confirmar_acceso_qr ??
            draftEvento.permitir_acompanantes ??
            true,
          recordatorio_dias: draftEvento.recordatorio_dias ?? 3,
          recordatorio_activo: Boolean(draftEvento.recordatorio_activo),
          recordatorio_mensaje:
            draftEvento.recordatorio_mensaje ||
            "¡Hola {nombre}! Faltan {dias} días para {evento}. Por favor confirma tu asistencia en la invitación virtual: {enlace}",
        };
        setDetalle({
          evento: draftObj,
          invitados: [],
          logistica: [],
          presupuesto: [],
        });
        setInvForm(draftObj);
        setLoading(false);
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
        setInvForm({
          ...data.evento,
          fecha_evento: formatDateInput(data.evento.fecha_evento),
          color_secundario: data.evento.color_secundario || "#6C7EE1",
          imagen_portada: data.evento.imagen_portada || "",
          texto_boton_rsvp:
            data.evento.texto_boton_rsvp || "Confirmar Asistencia",
          modalidad_invitados: modNormalizada,
          permitir_acompanantes:
            data.evento.permitir_acompanantes ?? true,
          confirmar_acceso_qr:
            data.evento.confirmar_acceso_qr ??
            data.evento.permitir_acompanantes ??
            true,
          recordatorio_dias: data.evento.recordatorio_dias ?? 3,
          recordatorio_activo: Boolean(data.evento.recordatorio_activo),
          recordatorio_mensaje:
            data.evento.recordatorio_mensaje ||
            "¡Hola {nombre}! Faltan {dias} días para {evento}. Por favor confirma tu asistencia en la invitación virtual: {enlace}",
        });
        setGuestForm((prev) => ({
          ...prev,
          modalidad_pase: modNormalizada,
        }));
        setCustomLinkForm((prev) => ({
          ...prev,
          modalidad: modNormalizada,
        }));
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

  const csvPreviewRows = useMemo(() => parseCsvRows(csvText), [csvText]);

  if ((!eventos || eventos.length === 0) && !draftEvento) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#E6E9F4] bg-white shadow-xs p-10 text-center">
        <h2 className="text-2xl font-bold text-[#2D3047]">
          Aún no tienes eventos activos
        </h2>
        <p className="mt-2 text-sm text-[#8E94A9]">
          Crea tu primer evento en el Wizard paso a paso para acceder al Gestor
          del Evento Activo (Diseño Virtual, Invitados y Confirmaciones, Difusión, Seating
          Chart y Código QR).
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
  const mapLocation = getGoogleMapsUrls(invForm.lugar, invForm.direccion);

  const eventoSlug =
    String(invForm?.nombre || evento?.nombre || "evento")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "evento";
  const baseShareUrl = `${window.location.origin}/${eventoSlug}/e${
    evento.idevento || "nuevo"
  }`;
  const buildCustomInviteUrl = ({ modalidad, adultos, ninos }) => {
    const params = new URLSearchParams();
    if (modalidad) params.set("mod", modalidad);
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
        adultos,
        ninos,
        url: buildCustomInviteUrl({ modalidad, adultos, ninos }),
      };
    });

  const allAvailableLinks = [
    {
      iditem: "principal",
      etiqueta: "Link General del Evento",
      modalidad: normalizeModalidad(invForm.modalidad_invitados),
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

  // =========================================================================
  // HANDLERS: EVENTO / INVITACIÓN / AJUSTES
  // =========================================================================
  const handleSaveEvento = async (e, customPatch = null) => {
    e?.preventDefault();
    const payload = customPatch ? { ...invForm, ...customPatch } : invForm;
    try {
      if (!evento.idevento) {
        const { data } = await createEventoRequest(payload);
        showNotice("✓ Evento guardado correctamente.");
        if (onDraftSaved) {
          await onDraftSaved(data);
        } else {
          onEventoUpdated();
        }
        return;
      }
      const { data } = await updateEventoRequest(evento.idevento, payload);
      setDetalle((prev) => ({ ...prev, evento: data }));
      setInvForm({
        ...data,
        fecha_evento: formatDateInput(data.fecha_evento),
        confirmar_acceso_qr:
          data.confirmar_acceso_qr ?? data.permitir_acompanantes ?? true,
      });
      onEventoUpdated();
      showNotice("✓ Evento guardado correctamente.");
    } catch (err) {
      showNotice(
        err.response?.data?.message ||
          "Error al guardar el evento"
      );
    }
  };

  const handlePosterFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const img = new Image();
      img.onload = () => {
        const maxW = 1000;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setInvForm((prev) => ({ ...prev, imagen_portada: compressedDataUrl }));
        showNotice("✓ Imagen/póster optimizado y cargado en la vista previa.");
      };
      img.onerror = () => {
        setInvForm((prev) => ({ ...prev, imagen_portada: reader.result }));
        showNotice("✓ Imagen/póster cargado en la vista previa.");
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
      showNotice("✓ Invitado agregado a la lista.");
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
      showNotice(
        `✓ Se importaron ${csvPreviewRows.length} invitados correctamente.`
      );
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
  const formatGuestMessage = (templateStr, guest, customUrl = null) => {
    const link = customUrl || baseShareUrl;
    return String(templateStr || "")
      .replaceAll("{nombre}", guest?.nombre || "Invitado Especial")
      .replaceAll("{evento}", evento.nombre)
      .replaceAll("{fecha}", formatDateInput(evento.fecha_evento))
      .replaceAll("{hora}", evento.hora_evento || "20:00")
      .replaceAll("{lugar}", evento.lugar || "Salón Principal")
      .replaceAll("{dias}", String(diasParaEvento))
      .replaceAll("{enlace}", link);
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
    const btnText = invForm?.texto_boton_rsvp || "Confirmar Asistencia";

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

  const handleSendDirectEmail = async (guest) => {
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

  const handleSendWhatsApp = async (guest) => {
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

  const handleBroadcastMasivo = async ({
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
        showNotice(
          `✓ Se enviaron ${data.enviadosCount} correo(s) HTML exitosamente desde notificaciones@recuerdalo.com.mx${
            data.sinCorreoCount > 0
              ? ` (${data.sinCorreoCount} sin correo registrado)`
              : ""
          }.`
        );
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
    const numAdultos = isSoloNinosMod(mod)
      ? 0
      : Math.max(0, parseInt(customLinkForm.adultos, 10) || 0);
    const numNinos = isSoloAdultosMod(mod)
      ? 0
      : Math.max(0, parseInt(customLinkForm.ninos, 10) || 0);

    const tituloFinal = customLinkForm.etiqueta.trim();
    const detalleJson = JSON.stringify({
      modalidad: mod,
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
        adultos: 0,
        ninos: 0,
      }));
      showNotice("✓ Nuevo link de invitación generado y agregado a la tabla.");
    } catch {
      showNotice("Error al generar el link de invitación");
    }
  };

  const handleShareCustomLink = async (linkItem) => {
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

  const handleWhatsAppCustomLink = (linkItem) => {
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
  // CÁLCULOS ESTADÍSTICOS (TAB B, D, E)
  // =========================================================================
  const isRejected = (status) =>
    status === "Rechazado" || status === "Declinado";

  const totalInvitadosCount = invitados.length;
  const confirmadosList = invitados.filter(
    (g) => g.estado_rsvp === "Confirmado"
  );
  const rechazadosList = invitados.filter((g) => isRejected(g.estado_rsvp));
  const pendientesList = invitados.filter((g) => g.estado_rsvp === "Pendiente");

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
  const menusEspecialesCount = invitados.filter(
    (g) => g.nota_alimentacion && g.nota_alimentacion.trim().length > 0
  ).length;

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
              <span>
                ⏳ Faltan <strong className="text-[#2D3047]">{diasParaEvento}</strong> días
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
                  {pasesConfirmadosCount} / {evento.capacidad}
                </span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#6C7EE1]">
                  Confirmación de Asistencia
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#5B617A]">
                <strong className="text-[#2D3047]">{pendientesList.length}</strong>{" "}
                invitaciones pendientes por confirmar
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onChangeSubTab("guests")}
                className="w-full cursor-pointer rounded-xl bg-[#6C7EE1] px-4 py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#5A6CD0] sm:w-auto sm:py-1.5"
              >
                Ver Invitados
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

      {/* Pestañas Superiores Estilo Carpeta con la Paleta de Colores (#6C7EE1, #F98880, #2D3047) */}
      <div className="grid grid-cols-2 gap-1.5 border-b border-[#DCE0F0] pb-2 sm:flex sm:flex-wrap sm:items-end sm:gap-2 sm:pb-0">
        {GESTOR_TABS.filter((t) => !t.hidden).map((t, idx) => {
          const active = currentTab === t.id;
          const tabPalette = [
            "bg-[#6C7EE1] text-white shadow-[#6C7EE1]/30",
            "bg-[#F98880] text-white shadow-[#F98880]/30",
            "bg-[#2D3047] text-white shadow-[#2D3047]/30",
          ];
          const colorClass = tabPalette[idx % tabPalette.length];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeSubTab(t.id)}
              className={`truncate rounded-xl px-3 py-2.5 text-center text-[11px] font-extrabold transition sm:whitespace-nowrap sm:rounded-t-2xl sm:rounded-b-none sm:px-6 sm:py-3.5 sm:text-xs ${colorClass} ${
                active
                  ? "sm:-translate-y-0.5 shadow-lg ring-2 ring-white brightness-105"
                  : "opacity-85 hover:opacity-100"
              }`}
            >
              {t.short}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB A: 📇 DISEÑO E INVITACIÓN VIRTUAL (/events/[id]/invitation)
         ===================================================================== */}
      {currentTab === "invitation" && (
        <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12">
          {/* Editor Rápido (Columna Izquierda: 5 cols) */}
          <form
            onSubmit={handleSaveEvento}
            className="space-y-5 rounded-2xl border border-[#E6E9F4] bg-white p-4 shadow-xs sm:p-6 xl:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-[#E6E9F4] pb-3">
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#2D3047] sm:text-2xl">
                  📇 Editor Rápido de Invitación
                </h3>
              </div>
            </div>

            {/* Banner de enlace permanente */}
            <div className="rounded-xl border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#6C7EE1]">
                  🔗 Enlace Permanente Activo
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(baseShareUrl);
                    showNotice("✓ Enlace copiado al portapapeles.");
                  }}
                  className="rounded bg-[#6C7EE1] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#6C7EE1]/40"
                >
                  Copiar URL
                </button>
              </div>
              <p className="mt-1 truncate font-mono text-[11px] text-[#5B617A]">
                {baseShareUrl}
              </p>
              <p className="mt-1 text-[10px] text-[#8E94A9]">
                Modifica textos, colores, botones o póster en cualquier momento
                sin alterar los enlaces ya compartidos.
              </p>
            </div>

            {/* Plantilla y Colores */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#5B617A]">
                Tema Visual y Colores de Acento / Botones
              </label>
              <div className="grid grid-cols-2 gap-2.5">
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
                    className={`rounded-xl border p-2.5 text-left transition ${
                      invForm.plantilla_tema === p.id
                        ? "border-[#6C7EE1] bg-[#6C7EE1]/15"
                        : "border-[#E6E9F4] bg-[#F7F8FC] hover:border-[#6C7EE1]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: p.accent }}
                      />
                      <span className="text-xs font-bold text-[#2D3047]">
                        {p.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-[#E6E9F4] bg-[#F7F8FC] px-3 py-2">
                  <span className="text-[11px] text-[#8E94A9]">
                    Color Principal
                  </span>
                  <input
                    type="color"
                    value={invForm.color_acento || "#6C7EE1"}
                    onChange={(e) =>
                      setInvForm((prev) => ({
                        ...prev,
                        color_acento: e.target.value,
                      }))
                    }
                    className="h-6 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#E6E9F4] bg-[#F7F8FC] px-3 py-2">
                  <span className="text-[11px] text-[#8E94A9]">
                    Color Botón / Detalles
                  </span>
                  <input
                    type="color"
                    value={invForm.color_secundario || "#6C7EE1"}
                    onChange={(e) =>
                      setInvForm((prev) => ({
                        ...prev,
                        color_secundario: e.target.value,
                      }))
                    }
                    className="h-6 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Imagen / Póster Principal */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#5B617A]">
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
                    className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition ${
                      invForm.imagen_portada === preset.url
                        ? "border-[#6C7EE1] bg-[#6C7EE1]/15 text-[#6C7EE1]"
                        : "border-[#E6E9F4] bg-[#F7F8FC] text-[#8E94A9] hover:text-[#6C7EE1]"
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
                  className="flex-1 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                />
                <label className="cursor-pointer rounded-xl border border-[#DCE0F0] bg-[#F0F2F8] px-3 py-2 text-center text-xs font-semibold text-[#2D3047] transition hover:border-[#6C7EE1] hover:text-[#6C7EE1]">
                  📷 Subir
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#5B617A]">
                  Título Principal en la Invitación
                </label>
                <input
                  type="text"
                  value={invForm.nombre || ""}
                  onChange={(e) =>
                    setInvForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2 text-sm text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5B617A]">
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
                  className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5B617A]">
                  Texto del Botón de Confirmación
                </label>
                <input
                  type="text"
                  value={invForm.texto_boton_rsvp || ""}
                  onChange={(e) =>
                    setInvForm((prev) => ({
                      ...prev,
                      texto_boton_rsvp: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#5B617A]">
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
                  className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-3 text-xs transition hover:border-[#6C7EE1]">
                  <div>
                    <span className="block font-bold text-[#2D3047]">
                      🔳 ¿Confirmar Acceso el día del evento?
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#8E94A9]">
                      Si está activado, al invitado se le mostrará un Código QR
                      después de confirmar su asistencia en la invitación virtual.
                    </span>
                  </div>
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
                    className="h-4 w-4 shrink-0 cursor-pointer accent-[#6C7EE1]"
                  />
                </label>
              </div>
            </div>

            {/* Configuración de Ubicación del Evento con Google Maps */}
            <div className="space-y-3 rounded-2xl border border-[#DCE0F0] bg-[#F7F8FC] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6C7EE1]">
                    📍 UBICACIÓN EN LA TARJETA DE INVITACIÓN
                  </span>
                  <h4 className="text-xs font-extrabold text-[#2D3047]">
                    Configurar Salón / Dirección con Google Maps
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
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
                    className="rounded-lg border border-[#DCE0F0] bg-white px-2.5 py-1 text-[10px] font-bold text-[#2D3047] shadow-2xs transition hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
                  >
                    🎯 Usar mi GPS
                  </button>
                  <a
                    href={mapLocation.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-[#6C7EE1]/15 px-2.5 py-1 text-[10px] font-bold text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white"
                  >
                    🗺️ Abrir Google Maps ↗
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-[#5B617A]">
                    Nombre del Salón, Jardín o Recinto
                  </label>
                  <input
                    type="text"
                    value={invForm.lugar || ""}
                    onChange={(e) =>
                      setInvForm((prev) => ({ ...prev, lugar: e.target.value }))
                    }
                    placeholder="Ej. Salón Jardín Imperial / Hacienda Los Morales"
                    className="w-full rounded-xl border border-[#DCE0F0] bg-white px-3 py-2 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-extrabold text-[#D9483B]">
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
                    className="w-full rounded-xl border border-[#DCE0F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder:font-normal placeholder:text-[#64748B] outline-none focus:border-[#6C7EE1]"
                  />
                </div>
              </div>

              {/* Mapa Interactivo de Google Maps en Vivo */}
              <div className="overflow-hidden rounded-xl border border-[#DCE0F0] bg-white shadow-2xs">
                <iframe
                  title="Vista previa de ubicación en Google Maps"
                  src={mapLocation.embedUrl}
                  className="h-40 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-glow-red w-full rounded-xl bg-[#6C7EE1] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#5A6CD0]"
            >
              Guardar Evento
            </button>
          </form>

          {/* Vista Previa en Vivo: Móvil y Escritorio (Columna Derecha: 7 cols) */}
          <div className="flex flex-col rounded-2xl border border-[#E6E9F4] bg-white p-4 shadow-xs sm:p-6 xl:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E9F4] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C7EE1]">
                  VISTA PREVIA EN VIVO
                </span>
                <h4 className="text-sm font-bold text-[#2D3047]">
                  Simulador de Invitación Virtual Interactiva
                </h4>
              </div>

              {/* Selector de dispositivo: Móvil vs Escritorio */}
              <div className="flex rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] p-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    previewDevice === "mobile"
                      ? "bg-[#6C7EE1] text-white"
                      : "text-[#8E94A9] hover:text-[#6C7EE1]"
                  }`}
                >
                  📱 Móvil
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    previewDevice === "desktop"
                      ? "bg-[#6C7EE1] text-white"
                      : "text-[#8E94A9] hover:text-[#6C7EE1]"
                  }`}
                >
                  🖥️ Escritorio
                </button>
              </div>
            </div>

            {/* Contenedor del Simulador */}
            <div className="mt-6 flex flex-1 items-center justify-center">
              {previewDevice === "mobile" ? (
                /* SIMULADOR DE PANTALLA MÓVIL */
                <div className="w-full max-w-[360px] rounded-[2.6rem] border-[6px] border-white/15 bg-[#0F1A45] p-3 shadow-[0_0_50px_rgba(0,0,0,0.85)]">
                  {/* Notch de smartphone */}
                  <div className="mx-auto mb-2.5 h-1.5 w-20 rounded-full bg-white/20" />

                  <div
                    className={`overflow-hidden rounded-[2rem] border bg-gradient-to-b ${tpl.bg} ${tpl.border}`}
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

                    <div className="p-5 text-center">
                      <span
                        className="inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
                        style={{
                          backgroundColor: invForm.color_acento || tpl.accent,
                        }}
                      >
                        {invForm.tipo_evento}
                      </span>

                      <h2 className="font-display mt-3 text-3xl font-bold uppercase tracking-wide text-white">
                        {invForm.nombre}
                      </h2>

                      <p className="mt-2 text-xs leading-relaxed text-gray-300">
                        {invForm.mensaje_invitacion}
                      </p>

                      {/* Contador rápido */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/50 p-2.5 text-center">
                        <div>
                          <span className="block text-base font-bold text-white">
                            {diasParaEvento}
                          </span>
                          <span className="text-[9px] uppercase text-gray-400">
                            Días
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
                            VIP
                          </span>
                          <span className="text-[9px] uppercase text-gray-400">
                            Pase
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5 rounded-xl border border-white/10 bg-black/40 p-3 text-left text-[11px] text-gray-200">
                        <p>
                          📅 <strong>Fecha:</strong> {invForm.fecha_evento}
                        </p>
                        <p>
                          📍 <strong>Lugar:</strong>{" "}
                          {invForm.lugar || "Por confirmar"}
                        </p>
                        {invForm.direccion && (
                          <p className="truncate">
                            🗺️ <strong>Dirección:</strong> {invForm.direccion}
                          </p>
                        )}
                        <p>
                          👔 <strong>Código de Vestimenta:</strong>{" "}
                          {invForm.codigo_vestimenta}
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
                        <div className="flex items-center justify-between px-3 py-2 text-[10px]">
                          <span className="truncate font-semibold text-gray-300">
                            📍 {invForm.lugar || "Ubicación del Evento"}
                          </span>
                          <a
                            href={mapLocation.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 font-extrabold text-[#15b2f5] hover:underline"
                          >
                            🗺️ Ver en Maps ↗
                          </a>
                        </div>
                      </div>

                      {/* Notificación de Modalidad de Invitados en la Tarjeta Móvil */}
                      <div className="mt-3 rounded-xl border border-[#15b2f5]/40 bg-[#15b2f5]/10 px-3 py-2 text-center shadow-[0_0_15px_rgba(21,178,245,0.15)]">
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-[#15b2f5]">
                          🔔 MODALIDAD DE ASISTENCIA
                        </span>
                        <strong className="mt-0.5 block text-xs font-bold uppercase tracking-wider text-white">
                          🎟️ {normalizeModalidad(invForm.modalidad_invitados)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          window.open(baseShareUrl, "_blank", "noopener,noreferrer")
                        }
                        className="mt-4 w-full cursor-pointer rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition hover:brightness-110"
                        style={{
                          backgroundColor:
                            invForm.color_secundario || "#15b2f5",
                        }}
                        title="Haz clic para abrir y probar el formulario real de Confirmación de Asistencia"
                      >
                        {invForm.texto_boton_rsvp || "Confirmar Asistencia"}
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
                            className="flex h-20 w-20 items-center justify-center rounded-2xl border text-3xl shadow-lg"
                            style={{
                              borderColor: invForm.color_acento || tpl.accent,
                              backgroundColor: `${
                                invForm.color_acento || tpl.accent
                              }22`,
                            }}
                          >
                            🥂
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
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15b2f5]">
                            🔔 Modalidad de Asistencia Notificada:
                          </span>
                          <strong className="text-xs font-bold uppercase tracking-wider text-white">
                            🎟️ {normalizeModalidad(invForm.modalidad_invitados)}
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
                      </div>

                      <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(baseShareUrl, "_blank", "noopener,noreferrer")
                          }
                          className="flex-1 cursor-pointer rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition hover:brightness-110"
                          style={{
                            backgroundColor:
                              invForm.color_secundario || "#15b2f5",
                          }}
                          title="Haz clic para abrir y probar el formulario real de Confirmación de Asistencia"
                        >
                          {invForm.texto_boton_rsvp || "Confirmar Asistencia"}
                        </button>
                        <a
                          href={mapLocation.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-xs font-bold text-gray-200 transition hover:border-[#15b2f5] hover:text-[#15b2f5]"
                        >
                          🗺️ Ver Mapa ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Barra inferior para probar la Invitación Pública en Local */}
            <div className="mt-5 flex flex-col items-stretch justify-between gap-3 rounded-xl border border-[#15b2f5]/30 bg-[#0F1A45] px-4 py-3 text-xs sm:flex-row sm:flex-wrap sm:items-center">
              <div className="min-w-0 text-gray-300">
                <span className="font-bold text-[#15b2f5]">
                  🔗 Enlace Público Activo:
                </span>{" "}
                <code className="break-all font-mono text-[11px] text-white">
                  {baseShareUrl}
                </code>
              </div>
              <a
                href={baseShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#15b2f5]/20 px-4 py-2 text-center text-xs font-bold text-[#15b2f5] transition hover:bg-[#15b2f5] hover:text-black"
              >
                🚀 Abrir Invitación Pública en Vivo ↗
              </a>
            </div>
          </div>

          {/* =================================================================
              ZONA INFERIOR: GENERADOR DE LINKS ADICIONALES POR MODALIDAD Y PASES
             ================================================================= */}
          <div className="xl:col-span-12 rounded-2xl border border-[#E6E9F4] bg-white p-4 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E6E9F4] pb-4">
              <div>
                <h2
                  className="text-lg font-extrabold tracking-wide text-[#f59e0b]"
                  style={{ color: "#f59e0b" }}
                >
                  🔗 Links de Invitación por Modalidad de Asistencia y Cantidad de Pases
                </h2>
                <p className="mt-1 text-xs text-[#8E94A9]">
                  Genera diferentes enlaces para este mismo evento (con la misma plantilla y datos) diferenciados por{" "}
                  <strong className="text-[#2D3047]">Modalidad de Asistencia</strong> y{" "}
                  <strong className="text-[#2D3047]">Cantidad de Pases (Adultos, Niños)</strong>.
                </p>
              </div>
              <div className="rounded-xl border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 px-3.5 py-2 text-[11px] font-medium text-[#2D3047]">
                💡 <strong>Nota:</strong> Si dejas <strong>Adultos</strong> o{" "}
                <strong>Niños</strong> en <strong>0</strong>, el invitado podrá
                elegir libremente la cantidad. Si ingresas un número mayor a 0,
                ese campo estará <strong>🔒 bloqueado</strong> para el invitado.
              </div>
            </div>

            {/* Formulario para crear o editar un link diferenciado */}
            <form
              onSubmit={handleCreateCustomLink}
              className={`mt-5 grid grid-cols-1 items-end gap-4 rounded-2xl border p-4 transition sm:grid-cols-2 sm:p-5 lg:grid-cols-12 ${
                editingCustomLinkId
                  ? "border-amber-400 bg-amber-50/50"
                  : "border-[#E6E9F4] bg-[#F8F9FD]"
              }`}
            >
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="mb-1.5 block text-xs font-bold text-[#2D3047]">
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
                  placeholder="Ej. Familia Pérez, Amigos trabajo..."
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-[#2D3047] outline-none transition ${
                    customLinkError
                      ? "border-rose-500 ring-2 ring-rose-500/20"
                      : "border-[#E6E9F4] focus:border-[#6C7EE1]"
                  }`}
                />
                {customLinkError && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600">
                    {customLinkError}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1 lg:col-span-3">
                <label className="mb-1.5 block text-xs font-bold text-[#2D3047]">
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
                  className="w-full rounded-xl border border-[#E6E9F4] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                >
                  {MODALIDADES_INVITADOS.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <label className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-[#2D3047]">
                  <span>Pases Adultos</span>
                  {isSoloNinosMod(customLinkForm.modalidad) ? (
                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                      No aplica
                    </span>
                  ) : Number(customLinkForm.adultos) > 0 ? (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      🔒 Bloqueado
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      🔓 Libre (0)
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
                  className="w-full rounded-xl border border-[#E6E9F4] bg-white px-3.5 py-2.5 text-xs font-bold text-[#2D3047] outline-none focus:border-[#6C7EE1] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <label className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-[#2D3047]">
                  <span>Pases Niños</span>
                  {isSoloAdultosMod(customLinkForm.modalidad) ? (
                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                      No aplica
                    </span>
                  ) : Number(customLinkForm.ninos) > 0 ? (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      🔒 Bloqueado
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      🔓 Libre (0)
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
                  className="w-full rounded-xl border border-[#E6E9F4] bg-white px-3.5 py-2.5 text-xs font-bold text-[#2D3047] outline-none focus:border-[#6C7EE1] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                {editingCustomLinkId ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="submit"
                      className="flex-1 cursor-pointer rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-amber-600"
                    >
                      💾 Guardar
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditCustomLink}
                      title="Cancelar edición"
                      className="cursor-pointer rounded-xl border border-[#E6E9F4] bg-white px-2.5 py-2.5 text-xs font-bold text-[#8E94A9] transition hover:border-rose-400 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-xl bg-[#6C7EE1] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#5A6CD0]"
                  >
                    ＋ Crear Link
                  </button>
                )}
              </div>
            </form>

            {/* Tabla de Links Generados */}
            <div className="mt-6 overflow-x-auto rounded-2xl border border-[#E6E9F4]">
              <table className="min-w-[780px] w-full border-collapse text-left text-xs">
                <thead
                  style={{ backgroundColor: "#fde68a", color: "#111212" }}
                >
                  <tr
                    className="border-b border-[#E6E9F4] bg-[#fde68a] text-[11px] font-bold uppercase tracking-wider text-[#111212]"
                    style={{ backgroundColor: "#fde68a", color: "#111212" }}
                  >
                    <th className="px-4 py-3 text-[#111212]">Identificador del Link</th>
                    <th className="px-4 py-3 text-[#111212]">Modalidad de Asistencia</th>
                    <th className="px-4 py-3 text-[#111212]">Pases Adultos</th>
                    <th className="px-4 py-3 text-[#111212]">Pases Niños</th>
                    <th className="px-4 py-3 text-[#111212]">Link Generado</th>
                    <th className="px-4 py-3 text-right text-[#111212]">Copiar o Compartir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E9F4]">
                  {/* Fila 1: Link General Principal del Evento */}
                  <tr className="bg-[#F8F9FD]/60 hover:bg-[#F3F6FA]">
                    <td className="px-4 py-3.5 font-bold text-[#2D3047]">
                      <span className="mr-1.5 inline-block rounded-md bg-[#6C7EE1]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#6C7EE1]">
                        ⭐ Principal
                      </span>
                      Link General del Evento
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 px-2.5 py-1 text-[11px] font-bold text-[#6C7EE1]">
                        🎟️ {normalizeModalidad(invForm.modalidad_invitados)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isSoloNinosMod(invForm.modalidad_invitados) ? (
                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                          🚫 No aplica (0)
                        </span>
                      ) : (
                        <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          🔓 0 (Libre)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {isSoloAdultosMod(invForm.modalidad_invitados) ? (
                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                          🚫 No aplica (0)
                        </span>
                      ) : (
                        <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          🔓 0 (Libre)
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 font-mono text-[11px] text-[#2D3047]">
                      <a
                        href={baseShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6C7EE1] hover:underline"
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
                          className="cursor-pointer rounded-lg border border-[#E6E9F4] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#2D3047] transition hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
                        >
                          📋 Copiar
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
                          className="cursor-pointer rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-500 hover:text-white"
                        >
                          📲 WhatsApp
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
                          className="cursor-pointer rounded-lg border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white"
                        >
                          🔗 Compartir
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
                            ? "bg-amber-50/70"
                            : "hover:bg-[#F8F9FD]"
                        }`}
                      >
                        <td className="px-4 py-3.5 font-bold text-[#2D3047]">
                          {item.etiqueta}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 px-2.5 py-1 text-[11px] font-bold text-[#6C7EE1]">
                            🎟️ {item.modalidad}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {soloNi ? (
                            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                              🚫 No aplica (0)
                            </span>
                          ) : item.adultos > 0 ? (
                            <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                              🔒 {item.adultos} Adulto(s) (Bloqueado)
                            </span>
                          ) : (
                            <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                              🔓 0 (Libre)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {soloAd ? (
                            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                              🚫 No aplica (0)
                            </span>
                          ) : item.ninos > 0 ? (
                            <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                              🔒 {item.ninos} Niño(s) (Bloqueado)
                            </span>
                          ) : (
                            <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                              🔓 0 (Libre)
                            </span>
                          )}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3.5 font-mono text-[11px] text-[#2D3047]">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6C7EE1] hover:underline"
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
                              className="cursor-pointer rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-500 hover:text-white"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(item.url);
                                showNotice(
                                  `✓ Link "${item.etiqueta}" copiado al portapapeles.`
                                );
                              }}
                              className="cursor-pointer rounded-lg border border-[#E6E9F4] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#2D3047] transition hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
                            >
                              📋 Copiar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleWhatsAppCustomLink(item)}
                              className="cursor-pointer rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-500 hover:text-white"
                            >
                              📲 WhatsApp
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShareCustomLink(item)}
                              className="cursor-pointer rounded-lg border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white"
                            >
                              🔗 Compartir
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLogistica(item.iditem)}
                              title="Eliminar este link"
                              className="cursor-pointer rounded-lg border border-rose-500/25 bg-rose-500/10 px-2 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-500 hover:text-white"
                            >
                              🗑️
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1A45]/60 p-4 backdrop-blur-xs">
                <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#E6E9F4] bg-white p-5 shadow-2xl sm:p-6">
                  <div className="flex items-start justify-between gap-3 border-b border-[#E6E9F4] pb-3.5">
                    <div>
                      <h3 className="text-base font-extrabold text-[#2D3047]">
                        🔗 ¿Confirmas crear este link de invitación?
                      </h3>
                      <p className="mt-1 text-xs text-[#8E94A9]">
                        Verifica los datos del link antes de agregarlo a la tabla:
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmCreateLinkModal(false)}
                      className="cursor-pointer rounded-lg border border-[#E6E9F4] px-2.5 py-1 text-xs font-bold text-[#8E94A9] hover:border-rose-400 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 space-y-2.5 rounded-xl border border-[#E6E9F4] bg-[#F8F9FD] p-3.5 text-xs sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-[#8E94A9]">
                        Identificador del Link:
                      </span>
                      <span className="font-extrabold text-[#2D3047]">
                        {customLinkForm.etiqueta.trim()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-[#8E94A9]">
                        Modalidad de Asistencia:
                      </span>
                      <span className="rounded-full border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 px-2.5 py-0.5 font-bold text-[#6C7EE1]">
                        🎟️ {customLinkForm.modalidad}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-[#8E94A9]">
                        Pases Adultos:
                      </span>
                      <span className="font-bold text-[#2D3047]">
                        {isSoloNinosMod(customLinkForm.modalidad)
                          ? "🚫 No aplica (0)"
                          : Number(customLinkForm.adultos) > 0
                          ? `🔒 ${customLinkForm.adultos} Adulto(s) (Bloqueado)`
                          : "🔓 0 (Libre)"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-[#8E94A9]">
                        Pases Niños:
                      </span>
                      <span className="font-bold text-[#2D3047]">
                        {isSoloAdultosMod(customLinkForm.modalidad)
                          ? "🚫 No aplica (0)"
                          : Number(customLinkForm.ninos) > 0
                          ? `🔒 ${customLinkForm.ninos} Niño(s) (Bloqueado)`
                          : "🔓 0 (Libre)"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmCreateLinkModal(false)}
                      className="cursor-pointer rounded-xl border border-[#E6E9F4] bg-white px-4 py-2.5 text-xs font-bold text-[#8E94A9] transition hover:border-[#2D3047] hover:text-[#2D3047]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={executeSaveCustomLink}
                      className="cursor-pointer rounded-xl bg-[#6C7EE1] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#5A6CD0]"
                    >
                      ✓ Sí, Crear Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB B: 👥 LISTA DE INVITADOS Y RSVP (/events/[id]/guests)
         ===================================================================== */}
      {currentTab === "guests" && (
        <div className="space-y-6">
          {/* Resumen Estadístico Superior */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-[#E6E9F4] bg-white shadow-xs p-4">
              <span className="text-[11px] text-[#8E94A9]">Total Invitados</span>
              <p className="mt-1 text-2xl font-bold text-[#2D3047]">
                {totalInvitadosCount}{" "}
                <span className="text-xs font-normal text-[#8E94A9]">
                  ({totalPasesLista} pases)
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-white border border-[#E6E9F4] shadow-xs p-4">
              <span className="text-[11px] text-[#18A97E]">
                🟢 Confirmados
              </span>
              <p className="mt-1 text-2xl font-bold text-[#18A97E]">
                {confirmadosList.length}{" "}
                <span className="text-xs font-normal text-[#18A97E]/70">
                  ({pasesConfirmadosCount} pases)
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-white border border-[#E6E9F4] shadow-xs p-4">
              <span className="text-[11px] text-[#F26B61]">🔴 Rechazados</span>
              <p className="mt-1 text-2xl font-bold text-[#F26B61]">
                {rechazadosList.length}{" "}
                <span className="text-xs font-normal text-[#F26B61]/70">
                  (🟡 {pendientesList.length} pend.)
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-[#6C7EE1]/30 bg-white border border-[#E6E9F4] shadow-xs p-4">
              <span className="text-[11px] text-[#6C7EE1]">
                👨‍👩‍👧 Adultos / Niños
              </span>
              <p className="mt-1 text-xl font-bold text-[#2D3047]">
                {totalAdultos} Adultos{" "}
                <span className="text-sm text-[#6C7EE1]">
                  • {totalNinos} Niños
                </span>
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-amber-500/30 bg-white border border-[#E6E9F4] shadow-xs p-4 lg:col-span-1">
              <span className="text-[11px] text-[#D97706]">
                🍽️ Menús Especiales
              </span>
              <p className="mt-1 text-2xl font-bold text-[#D97706]">
                {menusEspecialesCount}{" "}
                <span className="text-xs font-normal text-[#8E94A9]">
                  solicitados
                </span>
              </p>
            </div>
          </div>

          {/* Selector de Modalidad de Asistencia (Notificado en la Tarjeta de Invitación) */}
          <div className="rounded-2xl border border-[#6C7EE1]/30 bg-white border border-[#E6E9F4] shadow-xs p-5 shadow-[0_0_25px_rgba(21,178,245,0.08)]">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C7EE1]">
                  🔔 SE NOTIFICARÁ EN LA TARJETA DE INVITACIÓN
                </span>
                <h4 className="font-display mt-0.5 text-xl font-bold uppercase tracking-wide text-[#2D3047]">
                  🎟️ Modalidad de Invitados Permitida
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={normalizeModalidad(invForm.modalidad_invitados)}
                  onChange={(e) =>
                    handleChangeModalidadInvitados(e.target.value)
                  }
                  className="rounded-xl border border-[#6C7EE1]/50 bg-[#F7F8FC] px-4 py-2.5 text-xs font-bold text-[#6C7EE1] outline-none focus:border-[#6C7EE1]"
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
                  className="rounded-xl border border-[#DCE0F0] bg-[#F0F2F8] px-3.5 py-2.5 text-xs font-semibold text-[#2D3047] transition hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
                >
                  📇 Ver en Tarjeta de Invitación
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {MODALIDADES_INVITADOS.map((mod) => {
                const isSelected =
                  normalizeModalidad(invForm.modalidad_invitados) === mod;
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => handleChangeModalidadInvitados(mod)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? "border-[#6C7EE1] bg-[#6C7EE1] text-white shadow-[0_0_15px_rgba(21,178,245,0.35)]"
                        : "border-[#E6E9F4] bg-[#F7F8FC] text-[#8E94A9] hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
                    }`}
                  >
                    {isSelected ? `✓ ${mod}` : mod}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel de Alta: Individual o Importación Masiva Excel/CSV */}
          <div className="rounded-2xl border border-[#E6E9F4] bg-white p-4 shadow-xs sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[#E6E9F4] pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#2D3047] sm:text-2xl">
                  ➕ Agregar Invitados
                </h3>
              </div>

              <div className="grid w-full grid-cols-2 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] p-1 sm:flex sm:w-auto">
                <button
                  type="button"
                  onClick={() => setAddMode("individual")}
                  className={`rounded-lg px-2.5 py-1.5 text-center text-[11px] font-bold transition sm:px-3.5 sm:text-xs ${
                    addMode === "individual"
                      ? "bg-[#6C7EE1] text-white"
                      : "text-[#8E94A9] hover:text-[#6C7EE1]"
                  }`}
                >
                  👤 Registro Individual
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("csv")}
                  className={`rounded-lg px-2.5 py-1.5 text-center text-[11px] font-bold transition sm:px-3.5 sm:text-xs ${
                    addMode === "csv"
                      ? "bg-[#6C7EE1] text-white"
                      : "text-[#8E94A9] hover:text-[#6C7EE1]"
                  }`}
                >
                  📊 Importar desde Excel / CSV
                </button>
              </div>
            </div>

            {addMode === "individual" ? (
              <form onSubmit={handleAddGuest} className="mt-5 space-y-4">
                {/* FILA 1: Nombre, Teléfono, Correo y Grupo */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
                  {/* Campo 1: Nombre Completo */}
                  <div className="group relative lg:col-span-4">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#5B617A]">
                      <span>Nombre del Invitado *</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#ECEFFA] text-[10px] font-bold text-[#6C7EE1]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-60 rounded-xl border border-[#6C7EE1]/40 bg-[#F7F8FC] p-2.5 text-[11px] leading-snug text-[#2D3047] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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
                      className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                    />
                  </div>

                  {/* Campo 2: Teléfono / WhatsApp */}
                  <div className="group relative lg:col-span-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#5B617A]">
                      <span>Teléfono / WhatsApp</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#ECEFFA] text-[10px] font-bold text-[#6C7EE1]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-60 rounded-xl border border-[#6C7EE1]/40 bg-[#F7F8FC] p-2.5 text-[11px] leading-snug text-[#2D3047] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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
                      className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                    />
                  </div>

                  {/* Campo 3: Correo electrónico */}
                  <div className="group relative lg:col-span-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#5B617A]">
                      <span>Correo Electrónico</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#ECEFFA] text-[10px] font-bold text-[#6C7EE1]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-60 rounded-xl border border-[#6C7EE1]/40 bg-[#F7F8FC] p-2.5 text-[11px] leading-snug text-[#2D3047] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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
                      className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                    />
                  </div>

                  {/* Campo 4: Grupo */}
                  <div className="group relative lg:col-span-2">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#5B617A]">
                      <span>Grupo / Categoría</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#ECEFFA] text-[10px] font-bold text-[#6C7EE1]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full right-0 z-30 mb-1.5 w-60 rounded-xl border border-[#6C7EE1]/40 bg-[#F7F8FC] p-2.5 text-[11px] leading-snug text-[#2D3047] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Clasifica al invitado (Familia, Amigos, VIP o Trabajo)
                      para organizar y filtrar tu lista fácilmente.
                    </div>
                    <select
                      value={guestForm.grupo}
                      onChange={(e) =>
                        setGuestForm((p) => ({ ...p, grupo: e.target.value }))
                      }
                      title="Clasifica al invitado (Familia, Amigos, VIP o Trabajo) para organizar y filtrar tu lista fácilmente."
                      className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
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
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#5B617A]">
                      <span>Modalidad de Asistencia</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#ECEFFA] text-[10px] font-bold text-[#6C7EE1]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-[#6C7EE1]/40 bg-[#F7F8FC] p-2.5 text-[11px] leading-snug text-[#2D3047] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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
                      className="w-full rounded-xl border border-[#6C7EE1]/40 bg-[#F7F8FC] px-3 py-2.5 text-xs font-semibold text-[#6C7EE1] outline-none focus:border-[#6C7EE1]"
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
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#5B617A]">
                      <span>Cantidad de Pases</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#ECEFFA] text-[10px] font-bold text-[#6C7EE1]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-[#6C7EE1]/40 bg-[#F7F8FC] p-2.5 text-[11px] leading-snug text-[#2D3047] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Indica el número de adultos y de niños incluidos en el
                      pase de este invitado para calcular el aforo total.
                    </div>
                    <div
                      title="Indica el número de adultos y de niños incluidos en el pase de este invitado."
                      className="grid grid-cols-2 gap-2 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-1 border-r border-[#E6E9F4] pr-2">
                        <span className="text-[11px] text-[#8E94A9]">
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
                          className="w-12 bg-transparent text-center font-bold text-[#2D3047] outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1 pl-1">
                        <span className="text-[11px] text-[#8E94A9]">
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
                          className="w-12 bg-transparent text-center font-bold text-[#6C7EE1] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campo 7: Menú / Alergias */}
                  <div className="group relative lg:col-span-4">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#5B617A]">
                      <span>Menú Especial / Alergias</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[#ECEFFA] text-[10px] font-bold text-[#6C7EE1]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-[#6C7EE1]/40 bg-[#F7F8FC] p-2.5 text-[11px] leading-snug text-[#2D3047] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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
                      className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                    />
                  </div>

                  {/* Botón + Agregar */}
                  <div className="group relative lg:col-span-2">
                    <div className="pointer-events-none invisible absolute bottom-full right-0 z-30 mb-1.5 w-56 rounded-xl border border-[#6C7EE1]/40 bg-[#F7F8FC] p-2.5 text-[11px] leading-snug text-[#2D3047] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Registra al invitado en la lista del evento.
                    </div>
                    <button
                      type="submit"
                      title="Registra al invitado en la lista del evento."
                      className="btn-glow-red w-full cursor-pointer rounded-xl bg-[#6C7EE1] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#5A6CD0]"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Importación Masiva Excel / CSV */
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8E94A9]">
                  <p>
                    Sube un archivo <code>.csv</code> o pega tus filas de Excel
                    en formato:{" "}
                    <span className="font-mono text-[#6C7EE1]">
                      Nombre, Telefono, Email, Grupo, Adultos, Ninos,
                      Requerimientos
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadCsvTemplate}
                      className="rounded-lg border border-[#DCE0F0] bg-[#F0F2F8] px-3 py-1.5 text-[11px] font-semibold text-[#2D3047] hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
                    >
                      ⬇️ Descargar Plantilla CSV
                    </button>
                    <label className="cursor-pointer rounded-lg border border-[#6C7EE1]/40 bg-[#6C7EE1]/15 px-3 py-1.5 text-[11px] font-bold text-[#6C7EE1] hover:bg-[#6C7EE1]/25">
                      📂 Seleccionar Archivo .CSV
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
                  className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] p-3 font-mono text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                />

                <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <span className="text-xs text-[#8E94A9]">
                    Filas listas para importar:{" "}
                    <strong className="text-[#6C7EE1]">
                      {csvPreviewRows.length}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleImportCsv}
                    className="btn-glow-red w-full rounded-xl bg-[#6C7EE1] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#5A6CD0] sm:w-auto"
                  >
                    📥 Importar {csvPreviewRows.length} Invitados Ahora
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Buscador, Filtros por Estado y Grupo + Tabla Interactiva (Estilo Tarjetas Flotantes de Referencia) */}
          <div className="rounded-3xl border border-[#CFD8E6] bg-[#E3E9F2] p-3.5 shadow-inner sm:p-6">
            {/* Bloque Superior Blanco Elevado: Filtros de Colores + Buscador */}
            <div className="rounded-2xl border-b-4 border-[#CDD6E4] bg-white p-3.5 shadow-[0_6px_16px_rgba(45,62,80,0.08)] sm:p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                {/* Filtro por Estado con los 4 colores vibrantes de la imagen de referencia */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                  {[
                    {
                      id: "Todos",
                      colorClass:
                        "bg-[#3167FF] border-b-[3px] border-[#1D4ED8] text-white shadow-[#3167FF]/30",
                    },
                    {
                      id: "Confirmados",
                      colorClass:
                        "bg-[#7A22EA] border-b-[3px] border-[#5812B3] text-white shadow-[#7A22EA]/30",
                    },
                    {
                      id: "Rechazados",
                      colorClass:
                        "bg-[#EC1A8B] border-b-[3px] border-[#B80F6A] text-white shadow-[#EC1A8B]/30",
                    },
                    {
                      id: "Pendientes",
                      colorClass:
                        "bg-[#FFAF36] border-b-[3px] border-[#D98814] text-white shadow-[#FFAF36]/30",
                    },
                  ].map((st) => {
                    const isActive = rsvpFilter === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setRsvpFilter(st.id)}
                        className={`rounded-xl px-3 py-2 text-center text-[11px] font-extrabold uppercase tracking-wider shadow-md transition-all sm:px-4 sm:text-xs ${
                          st.colorClass
                        } ${
                          isActive
                            ? "-translate-y-0.5 ring-2 ring-[#37475A]/35 brightness-105"
                            : "opacity-80 hover:-translate-y-0.5 hover:opacity-100"
                        }`}
                      >
                        {st.id}
                      </button>
                    );
                  })}
                </div>

                {/* Filtro por Grupo y Buscador */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="w-full rounded-xl border border-[#CFD8E6] bg-[#F4F7FB] px-3.5 py-2 text-xs font-bold text-[#37475A] outline-none transition focus:border-[#3167FF] focus:bg-white sm:w-auto"
                  >
                    <option value="Todos">Todos los Grupos</option>
                    <option value="Familia">👨‍👩‍👧 Familia</option>
                    <option value="Amigos">🍻 Amigos</option>
                    <option value="VIP">⭐ VIP</option>
                    <option value="Trabajo">💼 Trabajo</option>
                  </select>

                  <input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="🔍 Buscar por nombre, teléfono, email o alergia..."
                    className="w-full rounded-xl border border-[#CFD8E6] bg-[#F4F7FB] px-3.5 py-2 text-xs font-medium text-[#37475A] placeholder-[#7B8B9E] outline-none transition focus:border-[#3167FF] focus:bg-white sm:w-72"
                  />
                </div>
              </div>
            </div>

            {/* Tabla Interactiva de Invitados con Filas en Tarjetas Blancas Flotantes */}
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[820px] w-full border-separate border-spacing-y-3 text-left text-xs">
                <thead>
                  <tr className="rounded-2xl bg-white shadow-[0_4px_12px_rgba(45,62,80,0.06)]">
                    <th className="rounded-l-2xl border-b-[3px] border-[#D0D9E6] py-3.5 pl-5 pr-3 text-[11px] font-extrabold uppercase tracking-wider text-[#37475A]">
                      Nombre / Grupo
                    </th>
                    <th className="border-b-[3px] border-[#D0D9E6] py-3.5 pr-3 text-[11px] font-extrabold uppercase tracking-wider text-[#37475A]">
                      Teléfono / Email
                    </th>
                    <th className="border-b-[3px] border-[#D0D9E6] py-3.5 pr-3 text-[11px] font-extrabold uppercase tracking-wider text-[#37475A]">
                      Estado (🟢/🔴/🟡)
                    </th>
                    <th className="border-b-[3px] border-[#D0D9E6] py-3.5 pr-3 text-[11px] font-extrabold uppercase tracking-wider text-[#37475A]">
                      Acompañantes / Modalidad
                    </th>
                    <th className="border-b-[3px] border-[#D0D9E6] py-3.5 pr-3 text-[11px] font-extrabold uppercase tracking-wider text-[#37475A]">
                      Requerimientos (Menú/Alergias)
                    </th>
                    <th className="rounded-r-2xl border-b-[3px] border-[#D0D9E6] py-3.5 pr-5 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#37475A]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.length === 0 ? (
                    <tr className="rounded-2xl bg-white shadow-[0_5px_14px_rgba(45,62,80,0.07)]">
                      <td
                        colSpan={6}
                        className="rounded-2xl border-b-[3px] border-[#D0D9E6] py-9 text-center text-xs font-semibold text-[#64748B]"
                      >
                        No hay invitados que coincidan con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((g) => {
                      const statusBadge =
                        g.estado_rsvp === "Confirmado"
                          ? "🟢 Confirmado"
                          : isRejected(g.estado_rsvp)
                          ? "🔴 Rechazado"
                          : "🟡 Pendiente";

                      return (
                        <tr
                          key={g.idinvitado}
                          className="group rounded-2xl bg-white shadow-[0_5px_14px_rgba(45,62,80,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,62,80,0.12)]"
                        >
                          {/* Nombre y Grupo */}
                          <td className="rounded-l-2xl border-b-[3px] border-[#D0D9E6] py-3.5 pl-5 pr-3">
                            <p className="font-extrabold text-[#37475A]">
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
                                className="rounded-md bg-[#7A22EA]/12 px-2 py-0.5 text-[10px] font-extrabold text-[#7A22EA] outline-none"
                              >
                                <option value="Familia">Familia</option>
                                <option value="Amigos">Amigos</option>
                                <option value="VIP">VIP</option>
                                <option value="Trabajo">Trabajo</option>
                              </select>
                              <span className="text-[10px] font-semibold text-[#64748B]">
                                🪑 {g.mesa_asignada || "Sin asignar"}
                              </span>
                            </div>
                          </td>

                          {/* Teléfono / Email */}
                          <td className="border-b-[3px] border-[#D0D9E6] py-3.5 pr-3 text-[#475569]">
                            <span className="block font-semibold text-[#37475A]">
                              {g.telefono || "Sin teléfono"}
                            </span>
                            <span className="block text-[11px] text-[#64748B]">
                              {g.correo || "Sin email"}
                            </span>
                          </td>

                          {/* Estado (🟢/🔴/🟡) */}
                          <td className="border-b-[3px] border-[#D0D9E6] py-3.5 pr-3">
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
                              className={`rounded-xl border-b-[3px] px-3 py-1.5 text-xs font-extrabold text-white shadow-xs outline-none ${
                                g.estado_rsvp === "Confirmado"
                                  ? "border-[#159E6B] bg-[#22C55E]"
                                  : isRejected(g.estado_rsvp)
                                  ? "border-[#B80F6A] bg-[#EC1A8B]"
                                  : "border-[#D98814] bg-[#FFAF36]"
                              }`}
                            >
                              <option
                                value="Confirmado"
                                className="bg-white text-[#37475A]"
                              >
                                ✔ Confirmado
                              </option>
                              <option
                                value="Pendiente"
                                className="bg-white text-[#37475A]"
                              >
                                ⏳ Pendiente
                              </option>
                              <option
                                value="Rechazado"
                                className="bg-white text-[#37475A]"
                              >
                                ✖ Rechazado
                              </option>
                            </select>
                            <span className="sr-only">{statusBadge}</span>
                          </td>

                          {/* Acompañantes (Adultos / Niños) y Modalidad */}
                          <td className="border-b-[3px] border-[#D0D9E6] py-3.5 pr-3">
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
                                className="rounded-lg border border-[#3167FF]/30 bg-[#3167FF]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#3167FF] outline-none"
                              >
                                {MODALIDADES_INVITADOS.map((mod) => (
                                  <option key={mod} value={mod}>
                                    {mod}
                                  </option>
                                ))}
                              </select>
                              <span className="rounded-lg bg-[#E3E9F2] px-2 py-0.5 text-[11px] font-bold text-[#37475A]">
                                🧑 {g.adultos ?? g.pases ?? 1} Ad.
                              </span>
                              <span className="rounded-lg bg-[#7A22EA]/12 px-2 py-0.5 text-[11px] font-bold text-[#7A22EA]">
                                🧒 {g.ninos ?? 0} Niños
                              </span>
                              <span className="text-[10px] font-extrabold text-[#64748B]">
                                ({g.pases} total)
                              </span>
                            </div>
                          </td>

                          {/* Requerimientos (Menú/Alergias) */}
                          <td className="border-b-[3px] border-[#D0D9E6] py-3.5 pr-3">
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
                              className="w-40 rounded-xl border border-[#CFD8E6] bg-[#F4F7FB] px-2.5 py-1.5 text-[11px] font-semibold text-[#37475A] placeholder-[#94A3B8] outline-none transition focus:border-[#3167FF] focus:bg-white"
                            />
                          </td>

                          {/* Acciones */}
                          <td className="rounded-r-2xl border-b-[3px] border-[#D0D9E6] py-3.5 pr-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditGuest(g)}
                                className="cursor-pointer rounded-xl border-b-[3px] border-[#5A6CD0] bg-[#6C7EE1] px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs transition hover:brightness-110"
                                title="Editar invitado"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGuest(g.idinvitado)}
                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border-b-[2px] border-[#B80F6A] bg-[#EC1A8B] text-xs font-extrabold text-white shadow-xs transition hover:brightness-110"
                                title="Eliminar invitado"
                              >
                                ✕
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
                <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#DCE0F0] bg-white p-5 shadow-2xl sm:p-6">
                  <div className="flex items-center justify-between border-b border-[#E6E9F4] pb-3.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C7EE1]">
                        EDICIÓN DE REGISTRO
                      </span>
                      <h3 className="text-lg font-extrabold text-[#2D3047]">
                        ✏️ Editar Invitado: {editingGuest.nombre}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingGuest(null)}
                      className="cursor-pointer rounded-lg bg-[#F0F2F8] px-2.5 py-1 text-xs font-bold text-[#6E7491] hover:text-[#2D3047]"
                    >
                      ✕ Cerrar
                    </button>
                  </div>

                  <form
                    onSubmit={handleSaveEditedGuest}
                    className="mt-4 space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block font-bold text-[#2D3047]">
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
                          className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block font-bold text-[#2D3047]">
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
                          className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block font-bold text-[#2D3047]">
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
                          className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block font-bold text-[#2D3047]">
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
                          className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                        >
                          <option value="Familia">Familia</option>
                          <option value="Amigos">Amigos</option>
                          <option value="VIP">VIP</option>
                          <option value="Trabajo">Trabajo</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block font-bold text-[#2D3047]">
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
                          className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                        >
                          <option value="Confirmado">🟢 Confirmado</option>
                          <option value="Pendiente">🟡 Pendiente</option>
                          <option value="Rechazado">🔴 Rechazado</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block font-bold text-[#2D3047]">
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
                          className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs font-semibold text-[#6C7EE1] outline-none focus:border-[#6C7EE1]"
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
                          <label className="mb-1 block font-bold text-[#2D3047]">
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
                            className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2.5 text-center text-xs font-bold text-[#2D3047] outline-none focus:border-[#6C7EE1] disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block font-bold text-[#2D3047]">
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
                            className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2.5 text-center text-xs font-bold text-[#6C7EE1] outline-none focus:border-[#6C7EE1] disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1 block font-bold text-[#2D3047]">
                          Requerimientos (Menú Especial / Alergias)
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
                          className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 border-t border-[#E6E9F4] pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingGuest(null)}
                        className="cursor-pointer rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-4 py-2.5 text-xs font-bold text-[#6E7491] transition hover:bg-[#ECEFFA]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="cursor-pointer rounded-xl bg-[#6C7EE1] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition hover:bg-[#5A6CD0]"
                      >
                        💾 Guardar Cambios
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
          TAB C: 📤 CENTRO DE ENVÍOS Y DIFUSIÓN (/events/[id]/broadcast)
         ===================================================================== */}
      {currentTab === "broadcast" && (
        <div className="space-y-6">
          {/* 1. Enlace de Invitación del Evento */}
          <div className="rounded-2xl border border-[#E6E9F4] bg-white shadow-xs p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2D3047]">
                  🔗 Enlace de Invitación del Evento
                </h3>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                readOnly
                value={baseShareUrl}
                className="flex-1 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-4 py-3 font-mono text-xs text-[#6C7EE1]"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(baseShareUrl);
                  showNotice("✓ Enlace general copiado al portapapeles.");
                }}
                className="btn-glow-red rounded-xl bg-[#6C7EE1] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white"
              >
                📋 Copiar Enlace General
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 2. Módulo WhatsApp */}
            <div className="rounded-2xl border border-emerald-500/30 bg-white border border-[#E6E9F4] shadow-xs p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-xl font-bold uppercase tracking-wide text-[#18A97E] sm:text-2xl">
                  📲 Módulo WhatsApp Directo
                </h4>
                <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-[10px] font-bold text-[#18A97E]">
                  Web / Móvil
                </span>
              </div>
              <p className="mt-1 text-xs text-[#8E94A9]">
                Personaliza el mensaje con variables automáticas y abre WhatsApp
                con el enlace de la invitación del evento.
              </p>

              {/* Selector de Link Creado para Enviar por WhatsApp */}
              <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-50/40 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#2D3047]">
                    🔗 Selecciona el Link a Enviar ({allAvailableLinks.length}{" "}
                    disponible{allAvailableLinks.length === 1 ? "" : "s"}):
                  </label>
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-[#18A97E]">
                    Activo: {selectedWhatsappLinkObj.etiqueta}
                  </span>
                </div>

                <div
                  className={`mt-2 space-y-1.5 pr-1 ${
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
                        className={`flex cursor-pointer flex-col justify-between gap-2 rounded-xl border px-3 py-2 text-xs transition sm:flex-row sm:items-center ${
                          isSelected
                            ? "border-[#18A97E] bg-white shadow-xs ring-2 ring-[#18A97E]/20"
                            : "border-[#E6E9F4] bg-white/70 hover:border-emerald-400 hover:bg-white"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-[#2D3047]">
                              {lnk.isPrincipal ? "⭐ " : "🔗 "}
                              {lnk.etiqueta}
                            </span>
                            <span className="rounded-full border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 px-2 py-0.5 text-[10px] font-bold text-[#6C7EE1]">
                              🎟️ {lnk.modalidad}
                            </span>
                            {!soloNi && (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B617A]">
                                Adultos:{" "}
                                {lnk.adultos > 0
                                  ? `🔒 ${lnk.adultos}`
                                  : "🔓 Libre"}
                              </span>
                            )}
                            {!soloAd && (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B617A]">
                                Niños:{" "}
                                {lnk.ninos > 0
                                  ? `🔒 ${lnk.ninos}`
                                  : "🔓 Libre"}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate font-mono text-[10px] text-[#6C7EE1]">
                            {lnk.url}
                          </p>
                        </div>

                        <span
                          className={`self-start shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase sm:self-center ${
                            isSelected
                              ? "bg-[#18A97E] text-white"
                              : "border border-[#DCE0F0] bg-[#F7F8FC] text-[#8E94A9]"
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
                className="hidden mt-3 w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] p-3 text-xs text-[#2D3047] outline-none focus:border-emerald-400"
              />

              {/* Vista Previa de la Miniatura (Open Graph) que se envía por WhatsApp */}
              <div className="mt-3 rounded-xl border border-emerald-500/30 bg-[#E7F8F0]/55 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    🖼️ Vista Previa de Miniatura en WhatsApp
                  </span>
                  <span className="rounded-md bg-emerald-600/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {invForm.imagen_portada
                      ? "✓ Póster del evento activo"
                      : "Tarjeta automática del evento"}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-emerald-600/20 bg-white shadow-xs">
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
                        📅 {formatDateInput(evento.fecha_evento)} • ⏰{" "}
                        {evento.hora_evento || "20:00"} hrs • 📍{" "}
                        {evento.lugar || "Salón VIP"}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-[#E6E9F4] bg-[#F7F8FC] px-3 py-2">
                    <p className="truncate text-xs font-extrabold text-[#2D3047]">
                      ✨ {evento.nombre} —{" "}
                      {evento.tipo_evento || "Invitación Digital"}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-[#5B617A]">
                      📅 {formatDateInput(evento.fecha_evento)} • ⏰{" "}
                      {evento.hora_evento || "20:00"} hrs • 📍{" "}
                      {evento.lugar || "Salón Principal"} —{" "}
                      {invForm.mensaje_invitacion ||
                        "Confirma tu asistencia en la invitación digital."}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] text-emerald-700">
                      {selectedWhatsappLinkObj?.url || baseShareUrl}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                {invitados.map((g) => (
                  <div
                    key={g.idinvitado}
                    className="flex flex-col gap-2 rounded-xl border border-[#E6E9F4] bg-[#F7F8FC] px-3.5 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#2D3047]">
                        {g.nombre}
                      </p>
                      <p className="text-[10px] text-[#8E94A9]">
                        {g.telefono || "Sin número"} •{" "}
                        {g.invitacion_enviada
                          ? `✓ Enviado (${g.canal_ultimo_envio || "Digital"})`
                          : "No enviado"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(g)}
                      className="w-full shrink-0 rounded-xl bg-emerald-600 px-3.5 py-2 text-center text-[11px] font-bold text-white transition hover:bg-emerald-500 sm:w-auto"
                    >
                      📲 Enviar WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Módulo Email / SMS Masivo con Plantillas HTML */}
            <div className="rounded-2xl border border-[#6C7EE1]/30 bg-white border border-[#E6E9F4] shadow-xs p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-xl font-bold uppercase tracking-wide text-[#6C7EE1] sm:text-2xl">
                  ✉️ Módulo Email HTML / SMS Masivo
                </h4>
                <select
                  value={broadcastChannel}
                  onChange={(e) => setBroadcastChannel(e.target.value)}
                  className="rounded-lg border border-[#DCE0F0] bg-[#F7F8FC] px-2.5 py-1 text-xs font-bold text-[#6C7EE1] outline-none"
                >
                  <option value="Email HTML">Canal: Email HTML</option>
                  <option value="SMS Directo">Canal: SMS Directo</option>
                </select>
              </div>

              {/* Selector de Link Creado para Enviar por Correo / SMS */}
              <div className="mt-3 rounded-xl border border-[#6C7EE1]/25 bg-[#6C7EE1]/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#2D3047]">
                    🔗 Selecciona el Link a Enviar ({allAvailableLinks.length}{" "}
                    disponible{allAvailableLinks.length === 1 ? "" : "s"}):
                  </label>
                  <span className="rounded-md bg-[#6C7EE1]/15 px-2 py-0.5 text-[10px] font-bold text-[#6C7EE1]">
                    Activo: {selectedEmailLinkObj.etiqueta}
                  </span>
                </div>

                <div
                  className={`mt-2 space-y-1.5 pr-1 ${
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
                        className={`flex cursor-pointer flex-col justify-between gap-2 rounded-xl border px-3 py-2 text-xs transition sm:flex-row sm:items-center ${
                          isSelected
                            ? "border-[#6C7EE1] bg-white shadow-xs ring-2 ring-[#6C7EE1]/20"
                            : "border-[#E6E9F4] bg-white/70 hover:border-[#6C7EE1] hover:bg-white"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-[#2D3047]">
                              {lnk.isPrincipal ? "⭐ " : "🔗 "}
                              {lnk.etiqueta}
                            </span>
                            <span className="rounded-full border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 px-2 py-0.5 text-[10px] font-bold text-[#6C7EE1]">
                              🎟️ {lnk.modalidad}
                            </span>
                            {!soloNi && (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B617A]">
                                Adultos:{" "}
                                {lnk.adultos > 0
                                  ? `🔒 ${lnk.adultos}`
                                  : "🔓 Libre"}
                              </span>
                            )}
                            {!soloAd && (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B617A]">
                                Niños:{" "}
                                {lnk.ninos > 0
                                  ? `🔒 ${lnk.ninos}`
                                  : "🔓 Libre"}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate font-mono text-[10px] text-[#6C7EE1]">
                            {lnk.url}
                          </p>
                        </div>

                        <span
                          className={`self-start shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase sm:self-center ${
                            isSelected
                              ? "bg-[#6C7EE1] text-white"
                              : "border border-[#DCE0F0] bg-[#F7F8FC] text-[#8E94A9]"
                          }`}
                        >
                          {isSelected ? "✓ Seleccionado" : "Seleccionar"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {EMAIL_HTML_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedHtmlTemplate(t.id)}
                    style={
                      selectedHtmlTemplate === t.id
                        ? { color: "#7486e9" }
                        : undefined
                    }
                    className={`rounded-xl border p-2.5 text-left text-[11px] transition ${
                      selectedHtmlTemplate === t.id
                        ? "border-[#6C7EE1] bg-[#6C7EE1]/15 text-[#7486e9]"
                        : "border-[#E6E9F4] bg-[#F7F8FC] text-[#8E94A9] hover:text-[#6C7EE1]"
                    }`}
                  >
                    <span className="block font-bold">{t.name}</span>
                  </button>
                ))}
              </div>

              {/* Vista previa de la Plantilla HTML de Correo */}
              <div className="mt-4 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] p-4">
                <div className="flex items-center justify-between gap-2 border-b border-[#E6E9F4] pb-2 text-[11px] text-[#8E94A9]">
                  <span className="truncate">
                    <strong>Asunto:</strong>{" "}
                    {formatGuestMessage(activeEmailTemplate.subject, null)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHtmlPreviewTab("visual");
                      setShowHtmlPreviewModal(true);
                    }}
                    className="shrink-0 cursor-pointer rounded-lg border border-[#6C7EE1]/40 bg-[#6C7EE1]/20 px-2.5 py-1 text-[10px] font-bold text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white"
                    title="Abrir vista previa completa del correo HTML y ver código fuente"
                  >
                    👁️ HTML PREVIEW
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
                  <p className="mt-1 text-xs text-[#5B617A]">
                    📅 {formatDateInput(evento.fecha_evento)} • ⏰{" "}
                    {evento.hora_evento} hrs • 📍 {evento.lugar || "Salón VIP"}
                  </p>
                  <span
                    className={`mt-3 inline-block rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase ${activeEmailTemplate.buttonClass}`}
                  >
                    {invForm.texto_boton_rsvp || "Confirmar Asistencia"}
                  </span>
                </div>
              </div>

              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                {invitados.map((g) => (
                  <div
                    key={g.idinvitado}
                    className="flex flex-col gap-2 rounded-xl border border-[#E6E9F4] bg-[#F7F8FC] px-3.5 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#2D3047]">
                        {g.nombre}
                      </p>
                      <p className="truncate text-[10px] text-[#8E94A9]">
                        {g.correo || "Sin correo"} •{" "}
                        {g.invitacion_enviada
                          ? `✓ Enviado (${g.canal_ultimo_envio || "Digital"})`
                          : "No enviado"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmDirectEmailGuest(g)}
                      className="w-full shrink-0 cursor-pointer rounded-xl bg-[#6C7EE1] px-3.5 py-2 text-center text-[11px] font-bold text-white transition hover:bg-[#5A6CD0] sm:w-auto"
                    >
                      ✉️ Enviar Correo
                    </button>
                  </div>
                ))}
              </div>

              {/* Modal de Confirmación para Envío Individual de Correo */}
              {confirmDirectEmailGuest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1A45]/60 p-4 backdrop-blur-xs">
                  <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#E6E9F4] bg-white p-5 shadow-2xl sm:p-6">
                    <div className="flex items-start justify-between gap-3 border-b border-[#E6E9F4] pb-3.5">
                      <div>
                        <h3 className="text-base font-extrabold text-[#2D3047]">
                          ✉️ ¿Confirmas enviar este correo de invitación?
                        </h3>
                        <p className="mt-1 text-xs text-[#8E94A9]">
                          Verifica los datos del invitado y el link seleccionado antes de continuar:
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmDirectEmailGuest(null)}
                        className="cursor-pointer rounded-lg border border-[#E6E9F4] px-2.5 py-1 text-xs font-bold text-[#8E94A9] hover:border-rose-400 hover:text-rose-500"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4 space-y-2.5 rounded-xl border border-[#E6E9F4] bg-[#F8F9FD] p-3.5 text-xs sm:p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#8E94A9]">
                          Invitado:
                        </span>
                        <span className="font-extrabold text-[#2D3047]">
                          {confirmDirectEmailGuest.nombre}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#8E94A9]">
                          Correo Electrónico:
                        </span>
                        <span className="font-bold text-[#2D3047]">
                          {confirmDirectEmailGuest.correo || "Sin correo registrado"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#8E94A9]">
                          Plantilla:
                        </span>
                        <span className="font-bold text-[#2D3047]">
                          {activeEmailTemplate.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#8E94A9]">
                          Link Seleccionado:
                        </span>
                        <span className="font-bold text-[#6C7EE1]">
                          {selectedEmailLinkObj.etiqueta} (
                          {selectedEmailLinkObj.modalidad})
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => setConfirmDirectEmailGuest(null)}
                        className="cursor-pointer rounded-xl border border-[#E6E9F4] bg-white px-4 py-2.5 text-xs font-bold text-[#8E94A9] transition hover:border-[#2D3047] hover:text-[#2D3047]"
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
                        className="cursor-pointer rounded-xl bg-[#6C7EE1] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#5A6CD0]"
                      >
                        ✓ Sí, Enviar Correo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmBroadcastModal({
                      soloPendientes: true,
                      canal: broadcastChannel,
                    })
                  }
                  className="btn-glow-red flex-1 cursor-pointer rounded-xl bg-[#6C7EE1] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                >
                  📤 Enviar a No Enviados
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmBroadcastModal({
                      soloPendientes: false,
                      canal: broadcastChannel,
                    })
                  }
                  className="cursor-pointer rounded-xl border border-[#DCE0F0] bg-[#F0F2F8] px-4 py-2.5 text-xs font-semibold text-[#2D3047] hover:text-[#6C7EE1]"
                >
                  🔄 Reenviar a Todos ({invitados.length})
                </button>
              </div>

              {/* Modal de Confirmación para Envío Masivo */}
              {confirmBroadcastModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1A45]/60 p-4 backdrop-blur-xs">
                  <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#E6E9F4] bg-white p-5 shadow-2xl sm:p-6">
                    <div className="flex items-start justify-between gap-3 border-b border-[#E6E9F4] pb-3.5">
                      <div>
                        <h3 className="text-base font-extrabold text-[#2D3047]">
                          {confirmBroadcastModal.soloPendientes
                            ? "📤 ¿Confirmas enviar a los invitados No Enviados?"
                            : "🔄 ¿Confirmas reenviar a todos los invitados?"}
                        </h3>
                        <p className="mt-1 text-xs text-[#8E94A9]">
                          Verifica los detalles de la campaña antes de disparar el envío:
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmBroadcastModal(null)}
                        className="cursor-pointer rounded-lg border border-[#E6E9F4] px-2.5 py-1 text-xs font-bold text-[#8E94A9] hover:border-rose-400 hover:text-rose-500"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4 space-y-2.5 rounded-xl border border-[#E6E9F4] bg-[#F8F9FD] p-3.5 text-xs sm:p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#8E94A9]">
                          Destinatarios:
                        </span>
                        <span className="font-extrabold text-[#2D3047]">
                          {confirmBroadcastModal.soloPendientes
                            ? `${
                                invitados.filter((g) => !g.invitacion_enviada)
                                  .length
                              } invitado(s) sin envío previo`
                            : `Todos los invitados (${invitados.length})`}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#8E94A9]">
                          Canal de Envío:
                        </span>
                        <span className="rounded-full border border-[#6C7EE1]/30 bg-[#6C7EE1]/10 px-2.5 py-0.5 font-bold text-[#6C7EE1]">
                          ✉️ {confirmBroadcastModal.canal}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#8E94A9]">
                          Plantilla:
                        </span>
                        <span className="font-bold text-[#2D3047]">
                          {activeEmailTemplate.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#8E94A9]">
                          Link Seleccionado:
                        </span>
                        <span className="font-bold text-[#6C7EE1]">
                          {selectedEmailLinkObj.etiqueta} (
                          {selectedEmailLinkObj.modalidad})
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => setConfirmBroadcastModal(null)}
                        className="cursor-pointer rounded-xl border border-[#E6E9F4] bg-white px-4 py-2.5 text-xs font-bold text-[#8E94A9] transition hover:border-[#2D3047] hover:text-[#2D3047]"
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
                        className="cursor-pointer rounded-xl bg-[#6C7EE1] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#5A6CD0]"
                      >
                        ✓ Sí, Confirmar Envío
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Interactivo de Vista Previa Completa de Plantilla HTML */}
            {showHtmlPreviewModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4"
                onClick={() => setShowHtmlPreviewModal(false)}
              >
                <div
                  className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E6E9F4] bg-white p-4 shadow-2xl sm:p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E9F4] pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C7EE1]">
                        VISTA PREVIA DE PLANTILLA DE CORREO •{" "}
                        {activeEmailTemplate.name}
                      </span>
                      <h4 className="font-display text-xl font-bold uppercase text-[#2D3047] sm:text-2xl">
                        ✉️ Previsualizador HTML de Invitación
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHtmlPreviewModal(false)}
                      className="rounded-lg border border-[#DCE0F0] bg-[#F0F2F8] px-3 py-1.5 text-xs font-bold text-[#5B617A] hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
                    >
                      ✕ Cerrar
                    </button>
                  </div>

                  {/* Controles superiores: Selector de Invitado de Prueba y Pestaña Visual vs Código */}
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                      <label className="text-xs font-semibold text-[#8E94A9]">
                        Previsualizar como:
                      </label>
                      <select
                        value={previewGuestId}
                        onChange={(e) => setPreviewGuestId(e.target.value)}
                        className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-1.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1] sm:w-auto"
                      >
                        <option value="">Invitado General (Demo)</option>
                        {invitados.map((g) => (
                          <option key={g.idinvitado} value={g.idinvitado}>
                            {g.nombre} ({g.pases} pases)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] p-1 sm:flex">
                      <button
                        type="button"
                        onClick={() => setHtmlPreviewTab("visual")}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                          htmlPreviewTab === "visual"
                            ? "bg-[#6C7EE1] text-white"
                            : "text-[#8E94A9] hover:text-[#6C7EE1]"
                        }`}
                      >
                        👁️ Vista Visual
                      </button>
                      <button
                        type="button"
                        onClick={() => setHtmlPreviewTab("code")}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                          htmlPreviewTab === "code"
                            ? "bg-[#6C7EE1] text-white"
                            : "text-[#8E94A9] hover:text-[#6C7EE1]"
                        }`}
                      >
                        💻 Código HTML
                      </button>
                    </div>
                  </div>

                  {htmlPreviewTab === "visual" ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-[#DCE0F0] bg-[#F7F8FC]">
                      {/* Cabecera simulada del cliente de correo */}
                      <div className="space-y-1 border-b border-[#E6E9F4] bg-[#F7F8FC] px-4 py-3 text-xs text-[#5B617A]">
                        <p>
                          <span className="font-semibold text-gray-500">
                            De:
                          </span>{" "}
                          Invitaciones Oficiales &lt;no-reply@dominalafiesta.com&gt;
                        </p>
                        <p>
                          <span className="font-semibold text-gray-500">
                            Para:
                          </span>{" "}
                          {previewGuestObj
                            ? `${previewGuestObj.nombre} <${
                                previewGuestObj.correo || "invitado@correo.com"
                              }>`
                            : "Invitado Especial <invitado@correo.com>"}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-500">
                            Asunto:
                          </span>{" "}
                          <strong className="text-[#2D3047]">
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
                                  📅 Fecha
                                </span>
                                <strong className="text-white">
                                  {formatDateInput(evento.fecha_evento)}
                                </strong>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase text-gray-400">
                                  ⏰ Hora
                                </span>
                                <strong className="text-white">
                                  {evento.hora_evento || "20:00"} hrs
                                </strong>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase text-gray-400">
                                  📍 Lugar
                                </span>
                                <strong className="text-white">
                                  {evento.lugar || "Salón VIP"}
                                </strong>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase text-gray-400">
                                  👔 Código de Vestimenta
                                </span>
                                <strong className="text-white">
                                  {invForm.codigo_vestimenta || "Formal / Libre"}
                                </strong>
                              </div>
                            </div>

                            {/* Notificación de Modalidad de Asistencia */}
                            <div className="mt-3 rounded-xl border border-[#15b2f5]/35 bg-[#15b2f5]/10 px-3.5 py-2 text-xs text-[#15b2f5]">
                              🔔 <strong>Modalidad de Asistencia:</strong>{" "}
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
                                className={`inline-block rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition hover:opacity-90 ${activeEmailTemplate.buttonClass}`}
                              >
                                {invForm.texto_boton_rsvp ||
                                  "Confirmar Asistencia"}
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
                        <p className="text-xs text-[#8E94A9]">
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
                          className="rounded-xl bg-[#6C7EE1]/20 px-3.5 py-1.5 text-xs font-bold text-[#6C7EE1] hover:bg-[#6C7EE1]/30"
                        >
                          📋 Copiar Código HTML
                        </button>
                      </div>
                      <pre className="max-h-80 overflow-auto rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] p-4 font-mono text-[11px] leading-relaxed text-[#18A97E]">
                        {buildEmailHtmlCode(previewGuestObj)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Sección de Recordatorios Automatizados */}
          <div className="rounded-2xl border border-amber-500/30 bg-white border border-[#E6E9F4] p-4 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706]">
                  AUTOMATIZACIÓN INTELIGENTE
                </span>
                <h4 className="font-display text-xl font-bold uppercase tracking-wide text-[#2D3047] sm:text-2xl">
                  ⏰ Recordatorios Automatizados para &ldquo;Pendientes&rdquo;
                </h4>
                <p className="text-xs text-[#8E94A9]">
                  Dispara automáticamente un mensaje a los{" "}
                  <strong className="text-[#D97706]">
                    {pendientesList.length} invitados en estado Pendiente
                  </strong>{" "}
                  cuando falten X días para la fiesta.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-[#D97706]">
                <input
                  type="checkbox"
                  checked={Boolean(invForm.recordatorio_activo)}
                  onChange={(e) =>
                    setInvForm((p) => ({
                      ...p,
                      recordatorio_activo: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-amber-400"
                />
                <span>Recordatorio Automático Activo</span>
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5B617A]">
                  Disparar cuando falten (días)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={invForm.recordatorio_dias ?? 3}
                  onChange={(e) =>
                    setInvForm((p) => ({
                      ...p,
                      recordatorio_dias: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-sm font-bold text-[#D97706] outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-[#5B617A]">
                  Mensaje del Recordatorio Automático
                </label>
                <input
                  type="text"
                  value={invForm.recordatorio_mensaje || ""}
                  onChange={(e) =>
                    setInvForm((p) => ({
                      ...p,
                      recordatorio_mensaje: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {pendientesList.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-[#F7F8FC] p-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                  🟡 Invitados en estado &ldquo;Pendiente&rdquo; ({pendientesList.length}) — Envío directo por WhatsApp:
                </p>
                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {pendientesList.map((g) => (
                    <div
                      key={g.idinvitado}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E6E9F4] bg-white shadow-xs px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#2D3047]">{g.nombre}</span>{" "}
                        <span className="text-[10px] text-[#8E94A9]">
                          ({g.telefono || "Sin teléfono"} •{" "}
                          {g.correo || "Sin correo"})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const text = formatGuestMessage(
                            invForm.recordatorio_mensaje,
                            g
                          );
                          const cleanPhone = String(g.telefono || "").replace(
                            /\D/g,
                            ""
                          );
                          const waUrl = cleanPhone
                            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                text
                              )}`
                            : `https://wa.me/?text=${encodeURIComponent(text)}`;
                          window.open(waUrl, "_blank", "noopener,noreferrer");
                          await handleUpdateGuest(g.idinvitado, {
                            invitacion_enviada: true,
                            canal_ultimo_envio: "Recordatorio WhatsApp",
                          });
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-500"
                      >
                        📲 Enviar Recordatorio WhatsApp
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col items-stretch justify-end gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={(e) => handleSaveEvento(e)}
                className="w-full rounded-xl border border-[#DCE0F0] bg-[#F0F2F8] px-4 py-2.5 text-xs font-semibold text-[#2D3047] hover:text-[#6C7EE1] sm:w-auto"
              >
                💾 Guardar Regla de Recordatorio
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (pendientesList.length === 0) {
                    showNotice(
                      "ℹ️ Actualmente hay 0 invitados en estado 'Pendiente'. Solo se envía a quienes aún no han confirmado."
                    );
                    return;
                  }
                  const firstPending = pendientesList[0];
                  if (firstPending) {
                    const text = formatGuestMessage(
                      invForm.recordatorio_mensaje,
                      firstPending
                    );
                    const cleanPhone = String(
                      firstPending.telefono || ""
                    ).replace(/\D/g, "");
                    const waUrl = cleanPhone
                      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          text
                        )}`
                      : `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(waUrl, "_blank", "noopener,noreferrer");
                  }
                  await handleBroadcastMasivo({
                    soloPendientes: true,
                    canal: "Recordatorio Automático",
                    estadoFiltro: "Pendiente",
                  });
                }}
                className="w-full cursor-pointer rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-amber-400 sm:w-auto"
              >
                ⚡ Disparar Ahora a {pendientesList.length} Pendientes
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
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
          {/* Columna Izquierda (7 cols): Duplicar, Pausar RSVP, Cambiar Propietario, Eliminar */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-[#E6E9F4] bg-white p-4 shadow-xs sm:p-6">
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#2D3047] sm:text-2xl">
                ⚙️ Acciones de Control del Evento
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 1. Pausar / Reanudar respuestas RSVP */}
                <div className="flex flex-col justify-between rounded-xl border border-[#E6E9F4] bg-[#F7F8FC] p-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#2D3047]">
                      {invForm.rsvp_habilitado
                        ? "⏸️ Pausar Respuestas del Evento"
                        : "▶️ Reanudar Respuestas del Evento"}
                    </h4>
                    <p className="mt-1 text-xs text-[#8E94A9]">
                      Congela temporalmente el formulario de confirmación para
                      que nadie más modifique su asistencia.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePauseRsvp}
                    className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                      invForm.rsvp_habilitado
                        ? "border border-amber-500/40 bg-amber-500/15 text-[#D97706] hover:bg-amber-500 hover:text-black"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {invForm.rsvp_habilitado
                      ? "Pausar Evento"
                      : "Reactivar Evento"}
                  </button>
                </div>

                {/* 2. Duplicar Evento */}
                <div className="flex flex-col justify-between rounded-xl border border-[#E6E9F4] bg-[#F7F8FC] p-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#2D3047]">
                      📑 Duplicar Evento
                    </h4>
                    <p className="mt-1 text-xs text-[#8E94A9]">
                      Crea una copia exacta del diseño de invitación, mesas,
                      cronograma y presupuesto para otra fecha.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDuplicateEvento}
                    className="mt-4 w-full rounded-xl border border-[#6C7EE1]/40 bg-[#6C7EE1]/15 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white"
                  >
                    📑 Duplicar Este Evento
                  </button>
                </div>
              </div>

              {/* 3. Cambiar Propietario / Organizador */}
              <form
                onSubmit={handleCambiarPropietario}
                className="mt-6 rounded-xl border border-[#E6E9F4] bg-[#F7F8FC] p-4"
              >
                <h4 className="text-sm font-bold text-[#2D3047]">
                  👤 Cambiar Propietario / Organizador Responsable
                </h4>
                <p className="mt-1 text-xs text-[#8E94A9]">
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
                    className="flex-1 rounded-xl border border-[#E6E9F4] bg-white shadow-xs px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-[#6C7EE1] bg-white px-4 py-2.5 text-xs font-bold text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white"
                  >
                    Actualizar Propietario
                  </button>
                </div>

                <label className="mt-2.5 flex items-center gap-2 text-[11px] text-[#8E94A9]">
                  <input
                    type="checkbox"
                    checked={transferirCuenta}
                    onChange={(e) => setTransferirCuenta(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[#6C7EE1]"
                  />
                  <span>
                    Transferir propiedad completa si el correo ya tiene cuenta
                    registrada
                  </span>
                </label>
              </form>
            </div>

            {/* 4. Eliminar Evento */}
            <div className="rounded-2xl border border-rose-500/30 bg-[#FFF5F7] p-4 sm:p-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#F26B61]">
                ⚠️ Zona de Peligro: Eliminar Evento
              </h4>
              <p className="mt-1 text-xs text-[#8E94A9]">
                Esta acción eliminará permanentemente el evento, su lista de
                invitados, mesas y registros asociados.
              </p>
              <button
                type="button"
                onClick={handleDeleteEvento}
                className="mt-4 w-full rounded-xl border border-rose-500/50 bg-rose-600/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F26B61] transition hover:bg-rose-600 hover:text-white sm:w-auto"
              >
                🗑️ Eliminar Evento Definitivamente
              </button>
            </div>
          </div>

          {/* Columna Derecha (5 cols): Generador de Código QR de Control de Acceso */}
          <div className="rounded-2xl border border-[#6C7EE1]/30 bg-white border border-[#E6E9F4] p-4 shadow-xs sm:p-6 lg:col-span-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C7EE1]">
                  CHECK-IN EN PUERTA
                </span>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#2D3047] sm:text-2xl">
                  📲 Código QR de Control de Acceso
                </h3>
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
                className="rounded-lg border border-[#DCE0F0] bg-[#F0F2F8] px-2.5 py-1 text-[10px] font-semibold text-[#5B617A] hover:text-[#6C7EE1]"
              >
                🔄 Regenerar Llave
              </button>
            </div>

            <p className="mt-1 text-xs text-[#8E94A9]">
              Escanea este código en la entrada el día de la fiesta para validar
              pases y registrar el ingreso en tiempo real.
            </p>

            {/* Credencial / Pase con QR SVG */}
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-[#DCE0F0] bg-[#F7F8FC] p-4 text-center shadow-xl sm:p-6">
              <span className="rounded-full bg-[#6C7EE1]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#6C7EE1]">
                PASE DE CONTROL DE ACCESO
              </span>
              <h4 className="font-display mt-2 text-2xl font-bold uppercase text-[#2D3047]">
                {evento.nombre}
              </h4>
              <p className="text-[11px] text-[#8E94A9]">
                {formatDateInput(evento.fecha_evento)} • {evento.hora_evento}{" "}
                hrs
              </p>

              {/* Lienzo QR SVG */}
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-[0_0_30px_rgba(21,178,245,0.2)]">
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
                          fill="#0F1A45"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>

              <p className="mt-3 font-mono text-xs font-bold tracking-widest text-[#6C7EE1]">
                {invForm.codigo_acceso_qr || "QR-GATE-ACTIVO"}
              </p>
              <p className="mt-1 text-[10px] text-gray-500">
                Aforo confirmado: {pasesConfirmadosCount} / {evento.capacidad}{" "}
                pases
              </p>

              <div className="mt-5 flex w-full flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDownloadQrSvg}
                  className="btn-glow-red flex-1 rounded-xl bg-[#6C7EE1] py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                >
                  ⬇️ Descargar QR (SVG)
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-[#DCE0F0] bg-[#F0F2F8] px-4 py-2.5 text-xs font-semibold text-[#2D3047] hover:text-[#6C7EE1]"
                >
                  🖨️ Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestorEvento;
