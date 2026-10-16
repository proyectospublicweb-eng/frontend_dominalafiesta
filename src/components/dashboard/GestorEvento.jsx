import { useEffect, useMemo, useState } from "react";
import {
  getEventoDetalleRequest,
  updateEventoRequest,
  duplicarEventoRequest,
  cambiarPropietarioRequest,
  deleteEventoRequest,
  addInvitadoRequest,
  importarInvitadosRequest,
  updateInvitadoRequest,
  deleteInvitadoRequest,
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
    name: "Carmesí Neón",
    accent: "#ff1e38",
    secondary: "#00f0ff",
    bg: "from-[#21070d] via-[#0b0d14] to-[#050508]",
    border: "border-[#ff1e38]",
  },
  {
    id: "cyber-cyan",
    name: "Cian Eléctrico",
    accent: "#00f0ff",
    secondary: "#ff1e38",
    bg: "from-[#061e24] via-[#0b0d14] to-[#050508]",
    border: "border-[#00f0ff]",
  },
  {
    id: "gold-gala",
    name: "Gala Dorada VIP",
    accent: "#f59e0b",
    secondary: "#fde68a",
    bg: "from-[#221706] via-[#0b0d14] to-[#050508]",
    border: "border-amber-400",
  },
  {
    id: "midnight-vip",
    name: "Medianoche Violeta",
    accent: "#a855f7",
    secondary: "#00f0ff",
    bg: "from-[#190729] via-[#0b0d14] to-[#050508]",
    border: "border-purple-500",
  },
];

const POSTER_PRESETS = [
  {
    label: "Sin póster (Degradado Neón)",
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
    name: "Gala Neón VIP (Oscuro)",
    subject: "✨ Invitación Exclusiva: {evento}",
    badge: "VIP ACCESS",
    gradient: "from-[#1c0810] via-[#0d0714] to-[#081921]",
    borderClass: "border-[#ff1e38]/40",
    badgeColor: "#00f0ff",
    accentHex: "#ff1e38",
    buttonClass: "bg-[#ff1e38] text-white",
  },
  {
    id: "minimal-gold",
    name: "Etiqueta Dorada Elegante",
    subject: "🥂 Estás invitado a {evento} - Confirma tu asistencia",
    badge: "RSVP INVITATION",
    gradient: "from-[#241907] via-[#120e07] to-[#0a0906]",
    borderClass: "border-amber-400/40",
    badgeColor: "#fde68a",
    accentHex: "#f59e0b",
    buttonClass: "bg-amber-400 text-[#07080d]",
  },
  {
    id: "club-pass",
    name: "Pase Nocturno / Afterparty",
    subject: "🎧 Tu pase digital para {evento} está listo",
    badge: "OFFICIAL PASS",
    gradient: "from-[#061e24] via-[#0c0a20] to-[#1a0726]",
    borderClass: "border-[#00f0ff]/40",
    badgeColor: "#a855f7",
    accentHex: "#00f0ff",
    buttonClass: "bg-[#00f0ff] text-[#050508]",
  },
];

const MODALIDADES_INVITADOS = [
  "Solo adultos",
  "Solo niños",
  "Adultos y niños",
  "Padre e hijos",
  "Madre e hijos",
  "Padres e hijos",
];

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

function GestorEvento({
  eventos,
  selectedEventoId,
  onSelectEvento,
  activeSubTab,
  onChangeSubTab,
  onEventoUpdated,
  onEventoDuplicated,
  onEventoDeleted,
  onGoToWizard,
}) {
  const currentTab = normalizeGestorTab(activeSubTab);

  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [toast, setToast] = useState("");

  // Tab A: Vista previa Móvil vs Escritorio y Editor Rápido
  const [previewDevice, setPreviewDevice] = useState("mobile"); // "mobile" | "desktop"
  const [invForm, setInvForm] = useState(null);

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
    modalidad_pase: "Adultos y niños",
    adultos: 1,
    ninos: 0,
    estado_rsvp: "Pendiente",
    mesa_asignada: "Sin asignar",
    nota_alimentacion: "",
  });
  const [csvText, setCsvText] = useState("");

  // Tab C: Centro de Envíos y Difusión (Enlaces, WhatsApp, Email/SMS, Recordatorios)
  const [linkMode, setLinkMode] = useState("general"); // "general" | "individual"
  const [whatsappMsg, setWhatsappMsg] = useState(
    "¡Hola {nombre}! 🎉 Estás cordialmente invitado(a) a {evento} el día {fecha} a las {hora} hrs en {lugar}. Confirma tu asistencia en tu pase único: {enlace}"
  );
  const [broadcastChannel, setBroadcastChannel] = useState("Email HTML");
  const [selectedHtmlTemplate, setSelectedHtmlTemplate] = useState("neon-vip");
  const [showHtmlPreviewModal, setShowHtmlPreviewModal] = useState(false);
  const [htmlPreviewTab, setHtmlPreviewTab] = useState("visual"); // "visual" | "code"
  const [previewGuestId, setPreviewGuestId] = useState("");

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
      if (!selectedEventoId) return;
      setLoading(true);
      try {
        const { data } = await getEventoDetalleRequest(selectedEventoId);
        if (!active) return;
        setDetalle(data);
        setInvForm({
          ...data.evento,
          fecha_evento: formatDateInput(data.evento.fecha_evento),
          color_secundario: data.evento.color_secundario || "#00f0ff",
          imagen_portada: data.evento.imagen_portada || "",
          texto_boton_rsvp:
            data.evento.texto_boton_rsvp || "Confirmar Asistencia",
          modalidad_invitados:
            data.evento.modalidad_invitados || "Adultos y niños",
          recordatorio_dias: data.evento.recordatorio_dias ?? 3,
          recordatorio_activo: Boolean(data.evento.recordatorio_activo),
          recordatorio_mensaje:
            data.evento.recordatorio_mensaje ||
            "¡Hola {nombre}! Faltan {dias} días para {evento}. Por favor confirma tu asistencia en tu enlace único: {enlace}",
        });
        setGuestForm((prev) => ({
          ...prev,
          modalidad_pase: data.evento.modalidad_invitados || "Adultos y niños",
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
  }, [selectedEventoId]);

  const csvPreviewRows = useMemo(() => parseCsvRows(csvText), [csvText]);

  if (!eventos || eventos.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#0b0d14] p-10 text-center">
        <h2 className="text-2xl font-bold text-white">
          Aún no tienes eventos activos
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Crea tu primer evento en el Wizard paso a paso para acceder al Gestor
          del Evento Activo (Diseño Virtual, Invitados RSVP, Difusión, Seating
          Chart y Código QR).
        </p>
        <button
          type="button"
          onClick={onGoToWizard}
          className="btn-glow-red mt-6 rounded-xl bg-[#ff1e38] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#ff334b]"
        >
          ➕ Crear Mi Primer Evento
        </button>
      </div>
    );
  }

  if (loading || !detalle || !invForm) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-400">
          Cargando panel del evento activo...
        </p>
      </div>
    );
  }

  const { evento, invitados, logistica, presupuesto } = detalle;
  const tpl =
    PLANTILLAS.find((p) => p.id === invForm.plantilla_tema) || PLANTILLAS[0];

  const baseShareUrl = `${window.location.origin}/rsvp/${evento.idevento}`;
  const getGuestPersonalLink = (guest) =>
    `${baseShareUrl}?guest=${guest.token_invitacion || guest.idinvitado}`;

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
      const { data } = await updateEventoRequest(evento.idevento, payload);
      setDetalle((prev) => ({ ...prev, evento: data }));
      setInvForm({
        ...data,
        fecha_evento: formatDateInput(data.fecha_evento),
      });
      onEventoUpdated();
      showNotice("✓ Cambios guardados sin alterar los enlaces compartidos.");
    } catch (err) {
      showNotice(
        err.response?.data?.message ||
          "Error al guardar los cambios del evento"
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
      ninos: nuevaModalidad === "Solo adultos" ? 0 : prev.ninos,
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
        modalidad_pase: invForm.modalidad_invitados || "Adultos y niños",
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
  const formatGuestMessage = (templateStr, guest) => {
    const link = guest ? getGuestPersonalLink(guest) : baseShareUrl;
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
    const link = guest ? getGuestPersonalLink(guest) : baseShareUrl;
    const guestName = guest?.nombre || "Invitado Especial";
    const modalidade =
      guest?.modalidad_pase ||
      invForm?.modalidad_invitados ||
      evento.modalidad_invitados ||
      "Adultos y niños";
    const pasesCount = guest?.pases || 2;
    const btnText = invForm?.texto_boton_rsvp || "Confirmar Asistencia";

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${formatGuestMessage(activeEmailTemplate.subject, guest)}</title>
</head>
<body style="margin:0;padding:24px;background-color:#050508;font-family:Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background-color:#0b0d14;border:1px solid ${activeEmailTemplate.accentHex};border-radius:16px;overflow:hidden;">
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
          👔 <strong>Dress Code:</strong> ${invForm?.codigo_vestimenta || "Formal / Libre"}
        </p>
        <div style="margin:16px auto;padding:10px 14px;background-color:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.35);border-radius:10px;display:inline-block;font-size:12px;color:#00f0ff;">
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

  const handleSendWhatsApp = async (guest) => {
    const text = formatGuestMessage(whatsappMsg, guest);
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
      const { data } = await enviarDifusionRequest(evento.idevento, {
        soloPendientes,
        canal,
        estadoFiltro,
      });
      setDetalle((prev) => ({ ...prev, invitados: data }));
      showNotice(
        estadoFiltro === "Pendiente"
          ? `✓ Recordatorio disparado por ${canal} a todos los invitados Pendientes.`
          : `✓ Campaña masiva enviada por ${canal}.`
      );
    } catch {
      showNotice("Error al procesar el envío masivo");
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
          }" width="${cellSize}" height="${cellSize}" fill="#050508" />`;
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
      }" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#050508">${
      evento.nombre
    }</text>
      <text x="50%" y="${
        totalDim + 32
      }" text-anchor="middle" font-family="monospace" font-size="10" fill="#ff1e38">${
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
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-[#00f0ff]/50 bg-[#0b0d14]/95 px-5 py-3 text-xs font-semibold text-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.25)] backdrop-blur-md">
          {toast}
        </div>
      )}

      {/* =====================================================================
          CABECERA DEL GESTOR DEL EVENTO ACTIVO (/events/[id])
         ===================================================================== */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#0b0d14] p-5 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff1e38]">
                🛠️ GESTOR DEL EVENTO ACTIVO
              </span>
              <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[#00f0ff]">
                /events/{evento.idevento}/
                {GESTOR_TABS.find((t) => t.id === currentTab)?.route ||
                  "invitation"}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <select
                value={evento.idevento}
                onChange={(e) => onSelectEvento(Number(e.target.value))}
                className="rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2 text-sm font-bold text-white outline-none focus:border-[#ff1e38]"
              >
                {eventos.map((ev) => (
                  <option key={ev.idevento} value={ev.idevento}>
                    {ev.nombre} ({formatDateInput(ev.fecha_evento)})
                  </option>
                ))}
              </select>

              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  invForm.rsvp_habilitado
                    ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border border-amber-500/40 bg-amber-500/15 text-amber-300"
                }`}
              >
                {invForm.rsvp_habilitado
                  ? "🟢 RSVP Activo"
                  : "⏸️ RSVP Pausado"}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-300">
                ⏳ Faltan <strong>{diasParaEvento}</strong> días
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="rounded-xl border border-white/10 bg-[#07080d] px-3.5 py-2">
            <span className="text-gray-400">Confirmados: </span>
            <strong className="text-emerald-400">
              {pasesConfirmadosCount} / {evento.capacidad} pases
            </strong>
          </div>
          <button
            type="button"
            onClick={onGoToWizard}
            className="rounded-xl border border-[#ff1e38]/40 bg-[#ff1e38]/15 px-3.5 py-2 font-semibold text-[#ff4d63] transition hover:bg-[#ff1e38] hover:text-white"
          >
            ➕ Nuevo Evento
          </button>
        </div>
      </div>

      {/* Pestañas Superiores del Evento Activo (Tab A - Tab E) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GESTOR_TABS.filter((t) => !t.hidden).map((t) => {
          const active = currentTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeSubTab(t.id)}
              className={` whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                active
                  ? "btn-glow-red bg-[#ff1e38] text-white"
                  : "border border-white/10 bg-[#0b0d14] text-gray-400 hover:border-white/25 hover:text-white"
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
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Editor Rápido (Columna Izquierda: 5 cols) */}
          <form
            onSubmit={handleSaveEvento}
            className="space-y-5 rounded-2xl border border-white/10 bg-[#0b0d14] p-6 xl:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                  TAB A • /events/{evento.idevento}/invitation
                </span>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  📇 Editor Rápido de Invitación
                </h3>
              </div>
            </div>

            {/* Banner de enlace permanente */}
            <div className="rounded-xl border border-[#00f0ff]/30 bg-[#00f0ff]/10 p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#00f0ff]">
                  🔗 Enlace Permanente Activo
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(baseShareUrl);
                    showNotice("✓ Enlace copiado al portapapeles.");
                  }}
                  className="rounded bg-[#00f0ff]/20 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-[#00f0ff]/40"
                >
                  Copiar URL
                </button>
              </div>
              <p className="mt-1 truncate font-mono text-[11px] text-gray-300">
                {baseShareUrl}
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                Modifica textos, colores, botones o póster en cualquier momento
                sin alterar los enlaces ya compartidos.
              </p>
            </div>

            {/* Plantilla y Colores */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-300">
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
                        ? "border-[#ff1e38] bg-[#ff1e38]/15"
                        : "border-white/10 bg-[#07080d] hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: p.accent }}
                      />
                      <span className="text-xs font-bold text-white">
                        {p.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080d] px-3 py-2">
                  <span className="text-[11px] text-gray-400">
                    Color Principal
                  </span>
                  <input
                    type="color"
                    value={invForm.color_acento || "#ff1e38"}
                    onChange={(e) =>
                      setInvForm((prev) => ({
                        ...prev,
                        color_acento: e.target.value,
                      }))
                    }
                    className="h-6 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080d] px-3 py-2">
                  <span className="text-[11px] text-gray-400">
                    Color Botón / Detalles
                  </span>
                  <input
                    type="color"
                    value={invForm.color_secundario || "#00f0ff"}
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
              <label className="block text-xs font-semibold text-gray-300">
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
                        ? "border-[#00f0ff] bg-[#00f0ff]/15 text-[#00f0ff]"
                        : "border-white/10 bg-[#07080d] text-gray-400 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
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
                  className="flex-1 rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs text-white outline-none focus:border-[#ff1e38]"
                />
                <label className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 transition hover:border-[#00f0ff] hover:text-white">
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
                <label className="mb-1 block text-xs font-semibold text-gray-300">
                  Título Principal en la Invitación
                </label>
                <input
                  type="text"
                  value={invForm.nombre || ""}
                  onChange={(e) =>
                    setInvForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2 text-sm text-white outline-none focus:border-[#ff1e38]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-300">
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
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs text-white outline-none focus:border-[#ff1e38]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-300">
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
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs text-white outline-none focus:border-[#ff1e38]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-300">
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
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2 text-xs text-white outline-none focus:border-[#ff1e38]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-glow-red w-full rounded-xl bg-[#ff1e38] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#ff334b]"
            >
              💾 Guardar Diseño e Invitación Virtual
            </button>
          </form>

          {/* Vista Previa en Vivo: Móvil y Escritorio (Columna Derecha: 7 cols) */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0b0d14] p-6 xl:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00f0ff]">
                  VISTA PREVIA EN VIVO
                </span>
                <h4 className="text-sm font-bold text-white">
                  Simulador de Invitación Virtual Interactiva
                </h4>
              </div>

              {/* Selector de dispositivo: Móvil vs Escritorio */}
              <div className="flex rounded-xl border border-white/15 bg-[#07080d] p-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    previewDevice === "mobile"
                      ? "bg-[#ff1e38] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  📱 Móvil
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    previewDevice === "desktop"
                      ? "bg-[#ff1e38] text-white"
                      : "text-gray-400 hover:text-white"
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
                <div className="w-full max-w-[360px] rounded-[2.6rem] border-[6px] border-white/15 bg-[#050508] p-3 shadow-[0_0_50px_rgba(0,0,0,0.85)]">
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
                          <span className="block text-base font-bold text-[#00f0ff]">
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
                        <p>
                          👔 <strong>Dress Code:</strong>{" "}
                          {invForm.codigo_vestimenta}
                        </p>
                      </div>

                      {/* Notificación de Modalidad de Invitados en la Tarjeta Móvil */}
                      <div className="mt-3 rounded-xl border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-3 py-2 text-center shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-[#00f0ff]">
                          🔔 MODALIDAD DE ASISTENCIA
                        </span>
                        <strong className="mt-0.5 block text-xs font-bold uppercase tracking-wider text-white">
                          🎟️ {invForm.modalidad_invitados || "Adultos y niños"}
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
                            invForm.color_secundario || "#00f0ff",
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
                <div className="w-full overflow-hidden rounded-2xl border border-white/15 bg-[#050508] shadow-2xl">
                  {/* Barra de navegador simulada */}
                  <div className="flex items-center justify-between border-b border-white/10 bg-[#0b0d14] px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="rounded bg-black/50 px-3 py-0.5 font-mono text-[10px] text-gray-400">
                      {baseShareUrl}
                    </span>
                    <span className="text-[10px] text-[#00f0ff]">100% HD</span>
                  </div>

                  <div
                    className={`grid grid-cols-1 md:grid-cols-12 bg-gradient-to-br ${tpl.bg}`}
                  >
                    {/* Póster Izquierdo en Escritorio */}
                    <div className="relative min-h-[320px] md:col-span-5">
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
                    <div className="flex flex-col justify-between p-8 md:col-span-7">
                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                            style={{
                              backgroundColor:
                                invForm.color_acento || tpl.accent,
                            }}
                          >
                            {invForm.tipo_evento}
                          </span>
                          <span className="font-mono text-xs text-[#00f0ff]">
                            Faltan {diasParaEvento} días
                          </span>
                        </div>

                        <h2 className="font-display mt-4 text-4xl font-bold uppercase tracking-wide text-white">
                          {invForm.nombre}
                        </h2>

                        <p className="mt-3 text-sm leading-relaxed text-gray-300">
                          {invForm.mensaje_invitacion}
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
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
                              Dress Code
                            </span>
                            <strong className="text-[#00f0ff]">
                              {invForm.codigo_vestimenta}
                            </strong>
                          </div>
                        </div>

                        {/* Notificación de Modalidad de Invitados en la Tarjeta de Escritorio */}
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-4 py-2.5 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                            🔔 Modalidad de Asistencia Notificada:
                          </span>
                          <strong className="text-xs font-bold uppercase tracking-wider text-white">
                            🎟️ {invForm.modalidad_invitados || "Adultos y niños"}
                          </strong>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(baseShareUrl, "_blank", "noopener,noreferrer")
                          }
                          className="flex-1 cursor-pointer rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition hover:brightness-110"
                          style={{
                            backgroundColor:
                              invForm.color_secundario || "#00f0ff",
                          }}
                          title="Haz clic para abrir y probar el formulario real de Confirmación de Asistencia"
                        >
                          {invForm.texto_boton_rsvp || "Confirmar Asistencia"}
                        </button>
                        <span className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-gray-300">
                          🗺️ Ver Mapa
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Barra inferior para probar la Invitación Pública en Local */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#00f0ff]/30 bg-[#07080d] px-4 py-3 text-xs">
              <div className="text-gray-300">
                <span className="font-bold text-[#00f0ff]">
                  🔗 Enlace Público Activo:
                </span>{" "}
                <code className="font-mono text-[11px] text-white">
                  {baseShareUrl}
                </code>
              </div>
              <a
                href={baseShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#00f0ff]/20 px-4 py-2 text-xs font-bold text-[#00f0ff] transition hover:bg-[#00f0ff] hover:text-black"
              >
                🚀 Abrir Invitación Pública en Vivo ↗
              </a>
            </div>
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
            <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-4">
              <span className="text-[11px] text-gray-400">Total Invitados</span>
              <p className="mt-1 text-2xl font-bold text-white">
                {totalInvitadosCount}{" "}
                <span className="text-xs font-normal text-gray-400">
                  ({totalPasesLista} pases)
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-[#0b0d14] p-4">
              <span className="text-[11px] text-emerald-400">
                🟢 Confirmados
              </span>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {confirmadosList.length}{" "}
                <span className="text-xs font-normal text-emerald-300/70">
                  ({pasesConfirmadosCount} pases)
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-[#0b0d14] p-4">
              <span className="text-[11px] text-rose-400">🔴 Rechazados</span>
              <p className="mt-1 text-2xl font-bold text-rose-400">
                {rechazadosList.length}{" "}
                <span className="text-xs font-normal text-rose-300/70">
                  (🟡 {pendientesList.length} pend.)
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-[#00f0ff]/30 bg-[#0b0d14] p-4">
              <span className="text-[11px] text-[#00f0ff]">
                👨‍👩‍👧 Adultos / Niños
              </span>
              <p className="mt-1 text-xl font-bold text-white">
                {totalAdultos} Adultos{" "}
                <span className="text-sm text-[#00f0ff]">
                  • {totalNinos} Niños
                </span>
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-amber-500/30 bg-[#0b0d14] p-4 lg:col-span-1">
              <span className="text-[11px] text-amber-300">
                🍽️ Menús Especiales
              </span>
              <p className="mt-1 text-2xl font-bold text-amber-300">
                {menusEspecialesCount}{" "}
                <span className="text-xs font-normal text-gray-400">
                  solicitados
                </span>
              </p>
            </div>
          </div>

          {/* Selector de Modalidad de Asistencia (Notificado en la Tarjeta de Invitación) */}
          <div className="rounded-2xl border border-[#00f0ff]/30 bg-[#0b0d14] p-5 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                  🔔 NOTIFICACIÓN EN LA TARJETA DE INVITACIÓN
                </span>
                <h4 className="font-display mt-0.5 text-xl font-bold uppercase tracking-wide text-white">
                  🎟️ Modalidad de Invitados Permitida
                </h4>
                <p className="text-xs text-gray-400">
                  Selecciona el tipo de asistencia para el evento; la opción
                  elegida se muestra notificada automáticamente en la tarjeta de
                  invitación virtual.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={invForm.modalidad_invitados || "Adultos y niños"}
                  onChange={(e) =>
                    handleChangeModalidadInvitados(e.target.value)
                  }
                  className="rounded-xl border border-[#00f0ff]/50 bg-[#07080d] px-4 py-2.5 text-xs font-bold text-[#00f0ff] outline-none focus:border-[#ff1e38]"
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
                  className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-gray-200 transition hover:border-[#00f0ff] hover:text-white"
                >
                  📇 Ver en Tarjeta de Invitación
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {MODALIDADES_INVITADOS.map((mod) => {
                const isSelected =
                  (invForm.modalidad_invitados || "Adultos y niños") === mod;
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => handleChangeModalidadInvitados(mod)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? "border-[#ff1e38] bg-[#ff1e38] text-white shadow-[0_0_15px_rgba(255,30,56,0.35)]"
                        : "border-white/10 bg-[#07080d] text-gray-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {isSelected ? `✓ ${mod}` : mod}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel de Alta: Individual o Importación Masiva Excel/CSV */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                  TAB B • /events/{evento.idevento}/guests
                </span>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  ➕ Agregar Invitados
                </h3>
              </div>

              <div className="flex rounded-xl border border-white/15 bg-[#07080d] p-1">
                <button
                  type="button"
                  onClick={() => setAddMode("individual")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    addMode === "individual"
                      ? "bg-[#ff1e38] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  👤 Registro Individual
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("csv")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    addMode === "csv"
                      ? "bg-[#ff1e38] text-white"
                      : "text-gray-400 hover:text-white"
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
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-300">
                      <span>Nombre del Invitado *</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#00f0ff]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-60 rounded-xl border border-[#00f0ff]/40 bg-[#050508] p-2.5 text-[11px] leading-snug text-gray-200 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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
                      className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#ff1e38]"
                    />
                  </div>

                  {/* Campo 2: Teléfono / WhatsApp */}
                  <div className="group relative lg:col-span-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-300">
                      <span>Teléfono / WhatsApp</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#00f0ff]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-60 rounded-xl border border-[#00f0ff]/40 bg-[#050508] p-2.5 text-[11px] leading-snug text-gray-200 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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
                      className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#ff1e38]"
                    />
                  </div>

                  {/* Campo 3: Correo electrónico */}
                  <div className="group relative lg:col-span-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-300">
                      <span>Correo Electrónico</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#00f0ff]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-60 rounded-xl border border-[#00f0ff]/40 bg-[#050508] p-2.5 text-[11px] leading-snug text-gray-200 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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
                      className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#ff1e38]"
                    />
                  </div>

                  {/* Campo 4: Grupo */}
                  <div className="group relative lg:col-span-2">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-300">
                      <span>Grupo / Categoría</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#00f0ff]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full right-0 z-30 mb-1.5 w-60 rounded-xl border border-[#00f0ff]/40 bg-[#050508] p-2.5 text-[11px] leading-snug text-gray-200 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Clasifica al invitado (Familia, Amigos, VIP o Trabajo)
                      para organizar y filtrar tu lista fácilmente.
                    </div>
                    <select
                      value={guestForm.grupo}
                      onChange={(e) =>
                        setGuestForm((p) => ({ ...p, grupo: e.target.value }))
                      }
                      title="Clasifica al invitado (Familia, Amigos, VIP o Trabajo) para organizar y filtrar tu lista fácilmente."
                      className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3 py-2.5 text-xs text-white outline-none focus:border-[#ff1e38]"
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
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-300">
                      <span>Modalidad de Asistencia</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#00f0ff]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-[#00f0ff]/40 bg-[#050508] p-2.5 text-[11px] leading-snug text-gray-200 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Tipo de invitación asignada (Solo adultos, Adultos y
                      niños, etc.). También actualiza el aviso en la tarjeta de
                      invitación.
                    </div>
                    <select
                      value={
                        guestForm.modalidad_pase ||
                        invForm.modalidad_invitados ||
                        "Adultos y niños"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setGuestForm((p) => ({ ...p, modalidad_pase: val }));
                        handleChangeModalidadInvitados(val);
                      }}
                      title="Tipo de invitación asignada (Solo adultos, Adultos y niños, etc.). También actualiza el aviso en la tarjeta de invitación."
                      className="w-full rounded-xl border border-[#00f0ff]/40 bg-[#07080d] px-3 py-2.5 text-xs font-semibold text-[#00f0ff] outline-none focus:border-[#ff1e38]"
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
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-300">
                      <span>Cantidad de Pases</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#00f0ff]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-[#00f0ff]/40 bg-[#050508] p-2.5 text-[11px] leading-snug text-gray-200 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Indica el número de adultos y de niños incluidos en el
                      pase de este invitado para calcular el aforo total.
                    </div>
                    <div
                      title="Indica el número de adultos y de niños incluidos en el pase de este invitado."
                      className="grid grid-cols-2 gap-2 rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-1 border-r border-white/10 pr-2">
                        <span className="text-[11px] text-gray-400">
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
                          className="w-12 bg-transparent text-center font-bold text-white outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1 pl-1">
                        <span className="text-[11px] text-gray-400">
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
                          className="w-12 bg-transparent text-center font-bold text-[#00f0ff] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campo 7: Menú / Alergias */}
                  <div className="group relative lg:col-span-4">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-300">
                      <span>Menú Especial / Alergias</span>
                      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#00f0ff]">
                        ?
                      </span>
                    </label>
                    <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-[#00f0ff]/40 bg-[#050508] p-2.5 text-[11px] leading-snug text-gray-200 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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
                      className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#ff1e38]"
                    />
                  </div>

                  {/* Botón + Agregar */}
                  <div className="group relative lg:col-span-2">
                    <div className="pointer-events-none invisible absolute bottom-full right-0 z-30 mb-1.5 w-56 rounded-xl border border-[#ff1e38]/40 bg-[#050508] p-2.5 text-[11px] leading-snug text-gray-200 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                      Registra al invitado en el evento y genera su enlace único
                      de confirmación RSVP.
                    </div>
                    <button
                      type="submit"
                      title="Registra al invitado en el evento y genera su enlace único de confirmación RSVP."
                      className="btn-glow-red w-full cursor-pointer rounded-xl bg-[#ff1e38] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#ff334b]"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Importación Masiva Excel / CSV */
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                  <p>
                    Sube un archivo <code>.csv</code> o pega tus filas de Excel
                    en formato:{" "}
                    <span className="font-mono text-[#00f0ff]">
                      Nombre, Telefono, Email, Grupo, Adultos, Ninos,
                      Requerimientos
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadCsvTemplate}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-gray-200 hover:border-[#00f0ff] hover:text-white"
                    >
                      ⬇️ Descargar Plantilla CSV
                    </button>
                    <label className="cursor-pointer rounded-lg border border-[#00f0ff]/40 bg-[#00f0ff]/15 px-3 py-1.5 text-[11px] font-bold text-[#00f0ff] hover:bg-[#00f0ff]/25">
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
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] p-3 font-mono text-xs text-white outline-none focus:border-[#00f0ff]"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Filas listas para importar:{" "}
                    <strong className="text-[#00f0ff]">
                      {csvPreviewRows.length}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleImportCsv}
                    className="btn-glow-red rounded-xl bg-[#ff1e38] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#ff334b]"
                  >
                    📥 Importar {csvPreviewRows.length} Invitados Ahora
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Buscador, Filtros por Estado y Grupo + Tabla Interactiva */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              {/* Filtro por Estado */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["Todos", "Confirmados", "Rechazados", "Pendientes"].map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRsvpFilter(st)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        rsvpFilter === st
                          ? "bg-[#ff1e38] text-white"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              {/* Filtro por Grupo y Buscador */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs text-white outline-none focus:border-[#00f0ff]"
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
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00f0ff] sm:w-72"
                />
              </div>
            </div>

            {/* Tabla Interactiva de Invitados */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-400">
                    <th className="pb-3 pr-3">Nombre / Grupo</th>
                    <th className="pb-3 pr-3">Teléfono / Email</th>
                    <th className="pb-3 pr-3">Estado (🟢/🔴/🟡)</th>
                    <th className="pb-3 pr-3">Acompañantes / Modalidad</th>
                    <th className="pb-3 pr-3">Requerimientos (Menú/Alergias)</th>
                    <th className="pb-3 text-right">Enlace Personalizado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-500"
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
                          className="transition hover:bg-white/[0.02]"
                        >
                          {/* Nombre y Grupo */}
                          <td className="py-3.5 pr-3">
                            <p className="font-bold text-white">{g.nombre}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <select
                                value={g.grupo || "Amigos"}
                                onChange={(e) =>
                                  handleUpdateGuest(g.idinvitado, {
                                    grupo: e.target.value,
                                  })
                                }
                                className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#00f0ff] outline-none"
                              >
                                <option value="Familia">Familia</option>
                                <option value="Amigos">Amigos</option>
                                <option value="VIP">VIP</option>
                                <option value="Trabajo">Trabajo</option>
                              </select>
                              <span className="text-[10px] text-gray-500">
                                🪑 {g.mesa_asignada || "Sin asignar"}
                              </span>
                            </div>
                          </td>

                          {/* Teléfono / Email */}
                          <td className="py-3.5 pr-3 text-gray-300">
                            <span className="block">
                              {g.telefono || "Sin teléfono"}
                            </span>
                            <span className="block text-[11px] text-gray-500">
                              {g.correo || "Sin email"}
                            </span>
                          </td>

                          {/* Estado (🟢/🔴/🟡) */}
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
                              className={`rounded-lg border px-2.5 py-1 text-xs font-bold outline-none ${
                                g.estado_rsvp === "Confirmado"
                                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                                  : isRejected(g.estado_rsvp)
                                  ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                                  : "border-amber-500/40 bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              <option value="Confirmado">🟢 Confirmado</option>
                              <option value="Pendiente">🟡 Pendiente</option>
                              <option value="Rechazado">🔴 Rechazado</option>
                            </select>
                            <span className="sr-only">{statusBadge}</span>
                          </td>

                          {/* Acompañantes (Adultos / Niños) y Modalidad */}
                          <td className="py-3.5 pr-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <select
                                value={
                                  g.modalidad_pase ||
                                  invForm.modalidad_invitados ||
                                  "Adultos y niños"
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateGuest(g.idinvitado, {
                                    modalidad_pase: val,
                                  });
                                  handleChangeModalidadInvitados(val);
                                }}
                                className="rounded border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-2 py-0.5 text-[10px] font-bold text-[#00f0ff] outline-none"
                              >
                                {MODALIDADES_INVITADOS.map((mod) => (
                                  <option key={mod} value={mod}>
                                    {mod}
                                  </option>
                                ))}
                              </select>
                              <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-white">
                                🧑 {g.adultos ?? g.pases ?? 1} Ad.
                              </span>
                              <span className="rounded bg-[#00f0ff]/10 px-2 py-0.5 text-[11px] text-[#00f0ff]">
                                🧒 {g.ninos ?? 0} Niños
                              </span>
                              <span className="text-[10px] font-bold text-gray-400">
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
                              className="w-40 rounded-lg border border-white/10 bg-[#07080d] px-2.5 py-1 text-[11px] text-amber-200 outline-none focus:border-amber-400"
                            />
                          </td>

                          {/* Enlace Personalizado y Acciones */}
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    getGuestPersonalLink(g)
                                  );
                                  showNotice(
                                    `✓ Enlace único de ${g.nombre} copiado.`
                                  );
                                }}
                                className="rounded-lg border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-2.5 py-1 text-[11px] font-semibold text-[#00f0ff] transition hover:bg-[#00f0ff]/25"
                              >
                                🔗 Copiar Pase
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGuest(g.idinvitado)}
                                className="rounded-lg border border-white/10 px-2 py-1 text-gray-400 transition hover:border-rose-500/40 hover:text-rose-400"
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
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB C: 📤 CENTRO DE ENVÍOS Y DIFUSIÓN (/events/[id]/broadcast)
         ===================================================================== */}
      {currentTab === "broadcast" && (
        <div className="space-y-6">
          {/* 1. Generador de Enlaces (General vs Individuales) */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                  TAB C • /events/{evento.idevento}/broadcast
                </span>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  🔗 Generador de Enlaces de Invitación
                </h3>
              </div>

              <div className="flex rounded-xl border border-white/15 bg-[#07080d] p-1">
                <button
                  type="button"
                  onClick={() => setLinkMode("general")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    linkMode === "general"
                      ? "bg-[#ff1e38] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  🌐 Enlace General
                </button>
                <button
                  type="button"
                  onClick={() => setLinkMode("individual")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    linkMode === "individual"
                      ? "bg-[#ff1e38] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  🎟️ Enlaces Individuales ({invitados.length})
                </button>
              </div>
            </div>

            {linkMode === "general" ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  readOnly
                  value={baseShareUrl}
                  className="flex-1 rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 font-mono text-xs text-[#00f0ff]"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(baseShareUrl);
                    showNotice("✓ Enlace general copiado al portapapeles.");
                  }}
                  className="btn-glow-red rounded-xl bg-[#ff1e38] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white"
                >
                  📋 Copiar Enlace General
                </button>
              </div>
            ) : (
              <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#07080d] p-3">
                <div className="space-y-2">
                  {invitados.map((g) => (
                    <div
                      key={g.idinvitado}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-[#0b0d14] px-3 py-2 text-xs"
                    >
                      <span className="font-bold text-white">
                        {g.nombre}{" "}
                        <span className="text-[10px] font-normal text-gray-400">
                          ({g.pases} pases)
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] text-[#00f0ff]">
                          {getGuestPersonalLink(g)}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              getGuestPersonalLink(g)
                            );
                            showNotice(`✓ Enlace de ${g.nombre} copiado.`);
                          }}
                          className="rounded bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#ff1e38]"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 2. Módulo WhatsApp */}
            <div className="rounded-2xl border border-emerald-500/30 bg-[#0b0d14] p-6">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-2xl font-bold uppercase tracking-wide text-emerald-400">
                  📲 Módulo WhatsApp Directo
                </h4>
                <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-[10px] font-bold text-emerald-300">
                  Web / Móvil
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Personaliza el mensaje con variables automáticas y abre WhatsApp
                con el enlace único de cada invitado.
              </p>

              <textarea
                rows={3}
                value={whatsappMsg}
                onChange={(e) => setWhatsappMsg(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/15 bg-[#07080d] p-3 text-xs text-white outline-none focus:border-emerald-400"
              />

              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                {invitados.map((g) => (
                  <div
                    key={g.idinvitado}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080d] px-3.5 py-2.5 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{g.nombre}</p>
                      <p className="text-[10px] text-gray-400">
                        {g.telefono || "Sin número"} •{" "}
                        {g.invitacion_enviada
                          ? `✓ Enviado (${g.canal_ultimo_envio || "Digital"})`
                          : "No enviado"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(g)}
                      className="rounded-xl bg-emerald-600 px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-emerald-500"
                    >
                      📲 Enviar WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Módulo Email / SMS Masivo con Plantillas HTML */}
            <div className="rounded-2xl border border-[#00f0ff]/30 bg-[#0b0d14] p-6">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-2xl font-bold uppercase tracking-wide text-[#00f0ff]">
                  ✉️ Módulo Email HTML / SMS Masivo
                </h4>
                <select
                  value={broadcastChannel}
                  onChange={(e) => setBroadcastChannel(e.target.value)}
                  className="rounded-lg border border-white/15 bg-[#07080d] px-2.5 py-1 text-xs font-bold text-[#00f0ff] outline-none"
                >
                  <option value="Email HTML">Canal: Email HTML</option>
                  <option value="SMS Directo">Canal: SMS Directo</option>
                </select>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {EMAIL_HTML_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedHtmlTemplate(t.id)}
                    className={`rounded-xl border p-2.5 text-left text-[11px] transition ${
                      selectedHtmlTemplate === t.id
                        ? "border-[#00f0ff] bg-[#00f0ff]/15 text-white"
                        : "border-white/10 bg-[#07080d] text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="block font-bold">{t.name}</span>
                  </button>
                ))}
              </div>

              {/* Vista previa de la Plantilla HTML de Correo */}
              <div className="mt-4 rounded-xl border border-white/15 bg-[#050508] p-4">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 text-[11px] text-gray-400">
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
                    className="shrink-0 cursor-pointer rounded-lg border border-[#ff1e38]/40 bg-[#ff1e38]/20 px-2.5 py-1 text-[10px] font-bold text-[#ff4d63] transition hover:bg-[#ff1e38] hover:text-white"
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
                  <p className="font-display mt-1 text-2xl font-bold uppercase text-white">
                    {evento.nombre}
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
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

              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    handleBroadcastMasivo({
                      soloPendientes: true,
                      canal: broadcastChannel,
                    })
                  }
                  className="btn-glow-red flex-1 rounded-xl bg-[#ff1e38] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                >
                  📤 Enviar a No Enviados
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleBroadcastMasivo({
                      soloPendientes: false,
                      canal: broadcastChannel,
                    })
                  }
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white"
                >
                  🔄 Reenviar a Todos ({invitados.length})
                </button>
              </div>
            </div>

            {/* Modal Interactivo de Vista Previa Completa de Plantilla HTML */}
            {showHtmlPreviewModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                onClick={() => setShowHtmlPreviewModal(false)}
              >
                <div
                  className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0b0d14] p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                        VISTA PREVIA DE PLANTILLA DE CORREO •{" "}
                        {activeEmailTemplate.name}
                      </span>
                      <h4 className="font-display text-2xl font-bold uppercase text-white">
                        ✉️ Previsualizador HTML de Invitación
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHtmlPreviewModal(false)}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300 hover:border-[#ff1e38] hover:text-white"
                    >
                      ✕ Cerrar
                    </button>
                  </div>

                  {/* Controles superiores: Selector de Invitado de Prueba y Pestaña Visual vs Código */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-gray-400">
                        Previsualizar como:
                      </label>
                      <select
                        value={previewGuestId}
                        onChange={(e) => setPreviewGuestId(e.target.value)}
                        className="rounded-xl border border-white/15 bg-[#07080d] px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-[#00f0ff]"
                      >
                        <option value="">Invitado General (Demo)</option>
                        {invitados.map((g) => (
                          <option key={g.idinvitado} value={g.idinvitado}>
                            {g.nombre} ({g.pases} pases)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex rounded-xl border border-white/15 bg-[#07080d] p-1">
                      <button
                        type="button"
                        onClick={() => setHtmlPreviewTab("visual")}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                          htmlPreviewTab === "visual"
                            ? "bg-[#ff1e38] text-white"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        👁️ Vista Visual
                      </button>
                      <button
                        type="button"
                        onClick={() => setHtmlPreviewTab("code")}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                          htmlPreviewTab === "code"
                            ? "bg-[#ff1e38] text-white"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        💻 Código HTML
                      </button>
                    </div>
                  </div>

                  {htmlPreviewTab === "visual" ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-[#050508]">
                      {/* Cabecera simulada del cliente de correo */}
                      <div className="space-y-1 border-b border-white/10 bg-[#07080d] px-4 py-3 text-xs text-gray-300">
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
                          <strong className="text-white">
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
                            <div className="mt-3 rounded-xl border border-[#00f0ff]/35 bg-[#00f0ff]/10 px-3.5 py-2 text-xs text-[#00f0ff]">
                              🔔 <strong>Modalidad de Asistencia:</strong>{" "}
                              {previewGuestObj?.modalidad_pase ||
                                invForm.modalidad_invitados ||
                                "Adultos y niños"}{" "}
                              ({previewGuestObj?.pases || 2} pases)
                            </div>

                            <div className="mt-5">
                              <a
                                href={
                                  previewGuestObj
                                    ? getGuestPersonalLink(previewGuestObj)
                                    : baseShareUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-block rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition hover:opacity-90 ${activeEmailTemplate.buttonClass}`}
                              >
                                {invForm.texto_boton_rsvp ||
                                  "Confirmar Asistencia"}
                              </a>
                            </div>

                            <p className="mt-4 break-all font-mono text-[10px] text-gray-400">
                              Enlace del pase:{" "}
                              {previewGuestObj
                                ? getGuestPersonalLink(previewGuestObj)
                                : baseShareUrl}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
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
                          className="rounded-xl bg-[#00f0ff]/20 px-3.5 py-1.5 text-xs font-bold text-[#00f0ff] hover:bg-[#00f0ff]/30"
                        >
                          📋 Copiar Código HTML
                        </button>
                      </div>
                      <pre className="max-h-80 overflow-auto rounded-xl border border-white/15 bg-[#050508] p-4 font-mono text-[11px] leading-relaxed text-emerald-300">
                        {buildEmailHtmlCode(previewGuestObj)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Sección de Recordatorios Automatizados */}
          <div className="rounded-2xl border border-amber-500/30 bg-[#0b0d14] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  AUTOMATIZACIÓN INTELIGENTE
                </span>
                <h4 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  ⏰ Recordatorios Automatizados para &ldquo;Pendientes&rdquo;
                </h4>
                <p className="text-xs text-gray-400">
                  Dispara automáticamente un mensaje a los{" "}
                  <strong className="text-amber-300">
                    {pendientesList.length} invitados en estado Pendiente
                  </strong>{" "}
                  cuando falten X días para la fiesta.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300">
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
                <label className="mb-1 block text-xs font-semibold text-gray-300">
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
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2.5 text-sm font-bold text-amber-300 outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-gray-300">
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
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {pendientesList.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-[#07080d] p-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  🟡 Invitados en estado &ldquo;Pendiente&rdquo; ({pendientesList.length}) — Envío directo por WhatsApp:
                </p>
                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {pendientesList.map((g) => (
                    <div
                      key={g.idinvitado}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0b0d14] px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{g.nombre}</span>{" "}
                        <span className="text-[10px] text-gray-400">
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

            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={(e) => handleSaveEvento(e)}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white"
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
                className="cursor-pointer rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-amber-400"
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
          <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                  TAB D • /events/{evento.idevento}/logistics
                </span>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  🪑 Distribución de Mesas / Seating Chart (Drag & Drop)
                </h3>
                <p className="text-xs text-gray-400">
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
                  className="rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs text-white outline-none focus:border-[#ff1e38]"
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
                  className="w-20 rounded-xl border border-white/15 bg-[#07080d] px-2.5 py-2 text-xs text-white outline-none"
                  title="Capacidad de asientos"
                />
                <button
                  type="submit"
                  className="btn-glow-red rounded-xl bg-[#ff1e38] px-4 py-2 text-xs font-bold text-white"
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
                    ? "border-[#00f0ff] bg-[#00f0ff]/10"
                    : "border-white/10 bg-[#07080d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    🚶 Invitados Sin Mesa Asignada
                  </h4>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-[#00f0ff]">
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
                        className="cursor-grab rounded-xl border border-white/10 bg-[#0b0d14] p-3 text-xs transition hover:border-[#00f0ff]/60 active:cursor-grabbing"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">
                            ⠿ {g.nombre}
                          </span>
                          <span className="rounded bg-[#ff1e38]/20 px-2 py-0.5 text-[10px] font-bold text-[#ff4d63]">
                            {g.pases} pases
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-gray-400">
                            {g.grupo || "Amigos"}
                          </span>
                          <select
                            value="Sin asignar"
                            onChange={(e) =>
                              handleUpdateGuest(g.idinvitado, {
                                mesa_asignada: e.target.value,
                              })
                            }
                            className="rounded border border-white/15 bg-[#07080d] px-2 py-0.5 text-[10px] text-gray-300 outline-none"
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
                          ? "border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                          : "border-white/10 bg-[#07080d]"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-bold text-white">
                              🪑 {mesa.titulo}
                            </h5>
                            <p className="text-[10px] text-gray-400">
                              {mesa.detalle || "Zona General"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                ocupados > cap
                                  ? "bg-rose-500/20 text-rose-300"
                                  : "bg-emerald-500/15 text-emerald-300"
                              }`}
                            >
                              {ocupados} / {cap} asientos
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteLogistica(mesa.iditem)}
                              className="text-xs text-gray-500 hover:text-rose-400"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Barra de capacidad de la mesa */}
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full transition-all ${
                              ocupados > cap ? "bg-rose-500" : "bg-[#00f0ff]"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Invitados sentados en la mesa */}
                        <div className="mt-3 space-y-1.5">
                          {seatedGuests.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-white/10 py-4 text-center text-[11px] text-gray-500">
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
                                className="flex cursor-grab items-center justify-between rounded-lg border border-white/10 bg-[#0b0d14] px-2.5 py-1.5 text-xs"
                              >
                                <span className="truncate font-semibold text-white">
                                  ⠿ {sg.nombre}{" "}
                                  <span className="text-[10px] text-[#00f0ff]">
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
                                  className="text-[10px] text-gray-400 hover:text-rose-400"
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
            <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6">
              <h4 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                ✅ Checklist / Tareas con Fecha Límite
              </h4>
              <p className="text-xs text-gray-400">
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
                  className="rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs text-white outline-none focus:border-[#ff1e38] sm:col-span-2"
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
                  className="rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs text-white outline-none focus:border-[#ff1e38]"
                />
                <input
                  type="text"
                  value={newTaskForm.detalle}
                  onChange={(e) =>
                    setNewTaskForm((p) => ({ ...p, detalle: e.target.value }))
                  }
                  placeholder="Responsable / Proveedor"
                  className="rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs text-white outline-none sm:col-span-2"
                />
                <button
                  type="submit"
                  className="btn-glow-red rounded-xl bg-[#ff1e38] px-4 py-2 text-xs font-bold text-white"
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
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#07080d] p-3 text-xs"
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
                          className="mt-0.5 h-4 w-4 accent-[#00f0ff]"
                        />
                        <div>
                          <p
                            className={`font-bold ${
                              done
                                ? "line-through text-gray-500"
                                : "text-white"
                            }`}
                          >
                            {item.titulo}
                          </p>
                          <p className="text-[10px] text-gray-400">
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
                        className="text-gray-500 hover:text-rose-400"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cronograma del Día (Itinerario) */}
            <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6">
              <h4 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                ⏱️ Cronograma del Día (Itinerario)
              </h4>
              <p className="text-xs text-gray-400">
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
                  className="rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs font-bold text-[#00f0ff] outline-none"
                />
                <input
                  type="text"
                  required
                  value={newCronoForm.titulo}
                  onChange={(e) =>
                    setNewCronoForm((p) => ({ ...p, titulo: e.target.value }))
                  }
                  placeholder="Actividad (ej. Apertura de pista)"
                  className="rounded-xl border border-white/15 bg-[#07080d] px-3 py-2 text-xs text-white outline-none sm:col-span-2"
                />
                <button
                  type="submit"
                  className="btn-glow-red rounded-xl bg-[#ff1e38] px-3 py-2 text-xs font-bold text-white"
                >
                  + Añadir Hora
                </button>
              </form>

              <div className="mt-4 space-y-2.5 border-l-2 border-[#ff1e38]/40 pl-4 ml-2">
                {cronogramaItems.map((item) => (
                  <div
                    key={item.iditem}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07080d] p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-[#ff1e38]/20 px-2.5 py-1 font-mono text-xs font-bold text-[#ff4d63]">
                        {item.hora_itinerario || "20:00"}
                      </span>
                      <div>
                        <p className="font-bold text-white">{item.titulo}</p>
                        {item.detalle && (
                          <p className="text-[10px] text-gray-400">
                            {item.detalle}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLogistica(item.iditem)}
                      className="text-gray-500 hover:text-rose-400"
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
            className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6"
          >
            <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
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
                className="rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2.5 text-xs text-white outline-none lg:col-span-2"
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
                className="rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2.5 text-xs text-white outline-none"
              />
              <input
                type="number"
                min="0"
                value={budgetForm.monto_pagado}
                onChange={(e) =>
                  setBudgetForm((p) => ({ ...p, monto_pagado: e.target.value }))
                }
                placeholder="Monto Pagado ($)"
                className="rounded-xl border border-white/15 bg-[#07080d] px-3.5 py-2.5 text-xs text-white outline-none"
              />
              <button
                type="submit"
                className="btn-glow-red rounded-xl bg-[#ff1e38] px-4 py-2.5 text-xs font-bold uppercase text-white"
              >
                + Registrar Gasto
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="pb-3">Concepto</th>
                    <th className="pb-3">Estimado</th>
                    <th className="pb-3">Pagado</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {presupuesto.map((b) => (
                    <tr key={b.idgasto}>
                      <td className="py-3 font-semibold text-white">
                        {b.concepto}
                      </td>
                      <td className="py-3 text-gray-300">
                        ${Number(b.monto_estimado || 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-emerald-400 font-bold">
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
                          className="rounded bg-white/10 px-2 py-1 text-[11px] text-white outline-none"
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
                          className="text-gray-400 hover:text-rose-400"
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Columna Izquierda (7 cols): Duplicar, Pausar RSVP, Cambiar Propietario, Eliminar */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                TAB E • /events/{evento.idevento}/settings
              </span>
              <h3 className="font-display mt-1 text-2xl font-bold uppercase tracking-wide text-white">
                ⚙️ Acciones de Control del Evento
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 1. Pausar / Reanudar respuestas RSVP */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#07080d] p-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {invForm.rsvp_habilitado
                        ? "⏸️ Pausar Respuestas del RSVP"
                        : "▶️ Reanudar Respuestas del RSVP"}
                    </h4>
                    <p className="mt-1 text-xs text-gray-400">
                      Congela temporalmente el formulario de confirmación para
                      que nadie más modifique su asistencia.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePauseRsvp}
                    className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                      invForm.rsvp_habilitado
                        ? "border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500 hover:text-black"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {invForm.rsvp_habilitado
                      ? "Pausar RSVP Ahora"
                      : "Reactivar RSVP"}
                  </button>
                </div>

                {/* 2. Duplicar Evento */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#07080d] p-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      📑 Duplicar Evento
                    </h4>
                    <p className="mt-1 text-xs text-gray-400">
                      Crea una copia exacta del diseño de invitación, mesas,
                      cronograma y presupuesto para otra fecha.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDuplicateEvento}
                    className="mt-4 w-full rounded-xl border border-[#00f0ff]/40 bg-[#00f0ff]/15 py-2.5 text-xs font-bold uppercase tracking-wider text-[#00f0ff] transition hover:bg-[#00f0ff] hover:text-black"
                  >
                    📑 Duplicar Este Evento
                  </button>
                </div>
              </div>

              {/* 3. Cambiar Propietario / Organizador */}
              <form
                onSubmit={handleCambiarPropietario}
                className="mt-6 rounded-xl border border-white/10 bg-[#07080d] p-4"
              >
                <h4 className="text-sm font-bold text-white">
                  👤 Cambiar Propietario / Organizador Responsable
                </h4>
                <p className="mt-1 text-xs text-gray-400">
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
                    className="flex-1 rounded-xl border border-white/15 bg-[#0b0d14] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#00f0ff]"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#00f0ff] hover:text-black"
                  >
                    Actualizar Propietario
                  </button>
                </div>

                <label className="mt-2.5 flex items-center gap-2 text-[11px] text-gray-400">
                  <input
                    type="checkbox"
                    checked={transferirCuenta}
                    onChange={(e) => setTransferirCuenta(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[#ff1e38]"
                  />
                  <span>
                    Transferir propiedad completa si el correo ya tiene cuenta
                    registrada
                  </span>
                </label>
              </form>
            </div>

            {/* 4. Eliminar Evento */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                ⚠️ Zona de Peligro: Eliminar Evento
              </h4>
              <p className="mt-1 text-xs text-gray-400">
                Esta acción eliminará permanentemente el evento, su lista de
                invitados, mesas y registros asociados.
              </p>
              <button
                type="button"
                onClick={handleDeleteEvento}
                className="mt-4 rounded-xl border border-rose-500/50 bg-rose-600/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-300 transition hover:bg-rose-600 hover:text-white"
              >
                🗑️ Eliminar Evento Definitivamente
              </button>
            </div>
          </div>

          {/* Columna Derecha (5 cols): Generador de Código QR de Control de Acceso */}
          <div className="rounded-2xl border border-[#00f0ff]/30 bg-[#0b0d14] p-6 lg:col-span-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                  CHECK-IN EN PUERTA
                </span>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
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
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-gray-300 hover:text-white"
              >
                🔄 Regenerar Llave
              </button>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Escanea este código en la entrada el día de la fiesta para validar
              pases y registrar el ingreso en tiempo real.
            </p>

            {/* Credencial / Pase con QR SVG */}
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-white/15 bg-[#050508] p-6 text-center shadow-xl">
              <span className="rounded-full bg-[#ff1e38]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#ff4d63]">
                PASE DE CONTROL DE ACCESO
              </span>
              <h4 className="font-display mt-2 text-2xl font-bold uppercase text-white">
                {evento.nombre}
              </h4>
              <p className="text-[11px] text-gray-400">
                {formatDateInput(evento.fecha_evento)} • {evento.hora_evento}{" "}
                hrs
              </p>

              {/* Lienzo QR SVG */}
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                <svg
                  viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                  className="h-44 w-44"
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
                          fill="#050508"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>

              <p className="mt-3 font-mono text-xs font-bold tracking-widest text-[#00f0ff]">
                {invForm.codigo_acceso_qr || "QR-GATE-ACTIVO"}
              </p>
              <p className="mt-1 text-[10px] text-gray-500">
                Aforo confirmado: {pasesConfirmadosCount} / {evento.capacidad}{" "}
                pases
              </p>

              <div className="mt-5 flex w-full gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadQrSvg}
                  className="btn-glow-red flex-1 rounded-xl bg-[#ff1e38] py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                >
                  ⬇️ Descargar QR (SVG)
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white"
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
