import { useEffect, useRef, useState } from "react";
import {
  getPlatformConfigAdminRequest,
  updatePlatformConfigAdminRequest,
  listarPlantillasPlatformAdminRequest,
  ejecutarVerificacionRecordatoriosAdminRequest,
  limpiarAlbumEventoAdminRequest,
  ejecutarAutolimpiezaAlbumesAdminRequest,
} from "../../api/eventos.js";

export default function PanelAdminGlobal() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [runningCron, setRunningCron] = useState(false);
  const [runningAlbumCleanup, setRunningAlbumCleanup] = useState(false);
  const [cleaningEventId, setCleaningEventId] = useState(null);
  const [notice, setNotice] = useState("");
  const [templatesList, setTemplatesList] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [albumesEventos, setAlbumesEventos] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilterType, setUserFilterType] = useState("all");
  const [userSortOrder, setUserSortOrder] = useState("newest");
  const [refreshingUsers, setRefreshingUsers] = useState(false);
  const [expandedUserEventsId, setExpandedUserEventsId] = useState(null);
  const tableScrollRef = useRef(null);

  const scrollUsersTable = (direction) => {
    if (!tableScrollRef.current) return;
    tableScrollRef.current.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  const [form, setForm] = useState({
    configured: false,
    wabaId: "",
    phoneNumberId: "",
    accessToken: "",
    tokenMasked: "",
    templateName: "recordatorio_evento_recuerdalo",
    templateLang: "es_MX",
    mode: "template",
    cronHour: 10,
    adminEmails: [],
    photoQuality: "hd",
    albumRetentionDays: 30,
  });

  const showToast = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 4500);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data } = await getPlatformConfigAdminRequest();
      if (data?.config) {
        setForm({
          configured: Boolean(data.config.configured),
          wabaId: data.config.wabaId || "",
          phoneNumberId: data.config.phoneNumberId || "",
          accessToken: "",
          tokenMasked: data.config.tokenMasked || "",
          templateName:
            data.config.templateName || "recordatorio_evento_recuerdalo",
          templateLang: data.config.templateLang || "es_MX",
          mode: data.config.mode || "template",
          cronHour: Number(data.config.cronHour ?? 10),
          adminEmails: Array.isArray(data.config.adminEmails)
            ? data.config.adminEmails
            : [],
          photoQuality: data.config.photoQuality || "hd",
          albumRetentionDays: Number(data.config.albumRetentionDays ?? 30) || 30,
        });
      }
      if (Array.isArray(data?.usuarios)) {
        setUsuariosList(data.usuarios);
      }
      if (Array.isArray(data?.albumesEventos)) {
        setAlbumesEventos(data.albumesEventos);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "No se pudo cargar la configuración global de administradores."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveConfig = async (customAdminEmails = null) => {
    try {
      setSaving(true);
      const emailsToSave = Array.isArray(customAdminEmails)
        ? customAdminEmails
        : form.adminEmails;

      const { data } = await updatePlatformConfigAdminRequest({
        wabaId: form.wabaId,
        phoneNumberId: form.phoneNumberId,
        accessToken: form.accessToken,
        templateName: form.templateName,
        templateLang: form.templateLang,
        mode: form.mode,
        cronHour: Number(form.cronHour ?? 10),
        adminEmails: emailsToSave,
        photoQuality: form.photoQuality,
        albumRetentionDays: Number(form.albumRetentionDays ?? 30) || 30,
      });

      if (data?.config) {
        setForm((prev) => ({
          ...prev,
          configured: Boolean(data.config.configured),
          wabaId: data.config.wabaId || "",
          phoneNumberId: data.config.phoneNumberId || "",
          accessToken: "",
          tokenMasked: data.config.tokenMasked || "",
          templateName:
            data.config.templateName || "recordatorio_evento_recuerdalo",
          templateLang: data.config.templateLang || "es_MX",
          mode: data.config.mode || "template",
          cronHour: Number(data.config.cronHour ?? 10),
          adminEmails: Array.isArray(data.config.adminEmails)
            ? data.config.adminEmails
            : [],
          photoQuality: data.config.photoQuality || "hd",
          albumRetentionDays: Number(data.config.albumRetentionDays ?? 30) || 30,
        }));
        if (Array.isArray(data?.albumesEventos)) {
          setAlbumesEventos(data.albumesEventos);
        }
        setUsuariosList((prev) =>
          prev.map((u) => {
            const emailLower = String(u.correoregistro || "")
              .trim()
              .toLowerCase();
            return {
              ...u,
              isAdmin:
                u.isPrimarySuperAdmin ||
                (data.config.adminEmails || []).includes(emailLower),
            };
          })
        );
      }
      showToast(
        `✓ ${
          data?.message ||
          "Configuración global de Recuerdalo.com.mx guardada correctamente."
        }`
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Error al guardar la configuración global."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleListTemplates = async () => {
    const cleanWaba = String(form.wabaId || "").trim();
    if (!cleanWaba) return;
    try {
      setLoadingTemplates(true);
      showToast("⏳ Consultando plantillas autorizadas de tu WABA en Meta...");
      const { data } = await listarPlantillasPlatformAdminRequest({
        wabaId: cleanWaba,
        accessToken: form.accessToken,
      });
      const list = Array.isArray(data?.templates) ? data.templates : [];
      setTemplatesList(list);
      if (list.length === 0) {
        showToast("ℹ️ No se encontraron plantillas en esta cuenta WABA.");
      } else {
        showToast(
          `✓ Se encontraron ${list.length} plantilla(s) en tu cuenta comercial de Meta. Haz clic en cualquiera para seleccionarla.`
        );
      }
    } catch (err) {
      showToast(
        `⚠️ ${
          err.response?.data?.message ||
          "Error al consultar las plantillas del WABA ID en Meta"
        }`
      );
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleToggleUserAdmin = async (usuario) => {
    if (usuario.isPrimarySuperAdmin) {
      showToast(
        "ℹ️ La cuenta SuperAdmin principal no puede ser revocada."
      );
      return;
    }
    const emailLower = String(usuario.correoregistro || "")
      .trim()
      .toLowerCase();
    const exists = form.adminEmails.includes(emailLower);
    const updatedEmails = exists
      ? form.adminEmails.filter((e) => e !== emailLower)
      : [...form.adminEmails, emailLower];

    setForm((prev) => ({ ...prev, adminEmails: updatedEmails }));
    await handleSaveConfig(updatedEmails);
  };

  const handleAddAdminByEmail = async (e) => {
    e.preventDefault();
    const emailLower = String(newAdminEmail || "").trim().toLowerCase();
    if (!emailLower || !emailLower.includes("@")) {
      showToast("⚠️ Ingresa un correo electrónico válido.");
      return;
    }
    if (form.adminEmails.includes(emailLower)) {
      showToast("ℹ️ Ese correo ya está en la lista de administradores.");
      return;
    }
    const updatedEmails = [...form.adminEmails, emailLower];
    setNewAdminEmail("");
    setForm((prev) => ({ ...prev, adminEmails: updatedEmails }));
    await handleSaveConfig(updatedEmails);
  };

  const handleRunReminderCheckNow = async () => {
    try {
      setRunningCron(true);
      const { data } = await ejecutarVerificacionRecordatoriosAdminRequest();
      showToast(
        `✓ ${
          data?.message ||
          "Verificación de recordatorios automáticos ejecutada."
        }`
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Error al ejecutar la verificación de recordatorios."
      );
    } finally {
      setRunningCron(false);
    }
  };

  const handleRunAlbumCleanupNow = async () => {
    try {
      setRunningAlbumCleanup(true);
      const { data } = await ejecutarAutolimpiezaAlbumesAdminRequest();
      if (Array.isArray(data?.albumesEventos)) {
        setAlbumesEventos(data.albumesEventos);
      }
      showToast(`✓ ${data?.message || "Autolimpieza de álbumes ejecutada."}`);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Error al ejecutar la autolimpieza de álbumes."
      );
    } finally {
      setRunningAlbumCleanup(false);
    }
  };

  const handleCleanEventAlbum = async (evAlbum) => {
    if (!evAlbum?.idevento) return;
    try {
      setCleaningEventId(evAlbum.idevento);
      const { data } = await limpiarAlbumEventoAdminRequest(evAlbum.idevento);
      if (Array.isArray(data?.albumesEventos)) {
        setAlbumesEventos(data.albumesEventos);
      }
      showToast(
        `🗑️ ${
          data?.message ||
          `Álbum del evento "${evAlbum.nombre}" limpiado exitosamente.`
        }`
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "No se pudo limpiar el álbum de este evento."
      );
    } finally {
      setCleaningEventId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#E6E9F4] bg-white p-8 text-center shadow-xs">
        <p className="text-sm font-bold text-[#6C7EE1]">
          ⏳ Cargando configuración global de administradores...
        </p>
      </div>
    );
  }

  const registeredEmailsSet = new Set(
    usuariosList.map((u) => String(u.correoregistro || "").trim().toLowerCase())
  );
  const preAuthorizedAdmins = (form.adminEmails || []).filter(
    (email) => email && !registeredEmailsSet.has(email.toLowerCase())
  );

  const handleRemovePreAuthorizedEmail = async (emailToRemove) => {
    const updatedEmails = form.adminEmails.filter(
      (e) => e.toLowerCase() !== String(emailToRemove).toLowerCase()
    );
    setForm((prev) => ({ ...prev, adminEmails: updatedEmails }));
    await handleSaveConfig(updatedEmails);
  };

  const handleRefreshUsers = async () => {
    try {
      setRefreshingUsers(true);
      const { data } = await getPlatformConfigAdminRequest();
      if (Array.isArray(data?.usuarios)) {
        setUsuariosList(data.usuarios);
      }
      if (Array.isArray(data?.albumesEventos)) {
        setAlbumesEventos(data.albumesEventos);
      }
      showToast(
        `✓ Lista de usuarios actualizada (${
          Array.isArray(data?.usuarios) ? data.usuarios.length : usuariosList.length
        } registrados).`
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "No se pudo actualizar la lista de usuarios registrados."
      );
    } finally {
      setRefreshingUsers(false);
    }
  };

  const nowMs = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const isRegisteredWithinDays = (creadoEn, days = 7) => {
    if (!creadoEn) return false;
    const ts = new Date(creadoEn).getTime();
    if (Number.isNaN(ts)) return false;
    return nowMs - ts <= days * DAY_MS;
  };

  const isRegisteredToday = (creadoEn) => {
    if (!creadoEn) return false;
    const d = new Date(creadoEn);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const formatFechaRegistro = (creadoEn) => {
    if (!creadoEn) return "Fecha no disponible";
    const d = new Date(creadoEn);
    if (Number.isNaN(d.getTime())) return String(creadoEn).slice(0, 16);
    const fecha = d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const hora = d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${fecha} • ${hora} hrs`;
  };

  const formatTiempoRelativo = (creadoEn) => {
    if (!creadoEn) return "";
    const ts = new Date(creadoEn).getTime();
    if (Number.isNaN(ts)) return "";
    const diffMs = Math.max(0, nowMs - ts);
    const mins = Math.floor(diffMs / 60000);
    if (mins < 2) return "Hace un momento";
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Ayer";
    if (days < 30) return `Hace ${days} días`;
    const months = Math.floor(days / 30);
    if (months === 1) return "Hace 1 mes";
    if (months < 12) return `Hace ${months} meses`;
    return `Hace +1 año`;
  };

  const recent7DaysCount = usuariosList.filter((u) =>
    isRegisteredWithinDays(u.creado_en, 7)
  ).length;
  const registeredTodayCount = usuariosList.filter((u) =>
    isRegisteredToday(u.creado_en)
  ).length;
  const usersWithEventsCount = usuariosList.filter(
    (u) => Number(u.total_eventos) > 0
  ).length;
  const usersWithoutEventsCount = usuariosList.filter(
    (u) => Number(u.total_eventos) === 0
  ).length;
  const adminUsersCount = usuariosList.filter(
    (u) => u.isAdmin || u.isPrimarySuperAdmin
  ).length;
  const totalPlatformEvents = usuariosList.reduce(
    (acc, u) => acc + (Number(u.total_eventos) || 0),
    0
  );
  const totalPlatformGuests = usuariosList.reduce(
    (acc, u) => acc + (Number(u.total_invitados) || 0),
    0
  );

  const filteredUsuarios = usuariosList
    .filter((u) => {
      if (userFilterType === "recent") {
        if (!isRegisteredWithinDays(u.creado_en, 7)) return false;
      } else if (userFilterType === "with_events") {
        if ((Number(u.total_eventos) || 0) === 0) return false;
      } else if (userFilterType === "without_events") {
        if ((Number(u.total_eventos) || 0) > 0) return false;
      } else if (userFilterType === "admins") {
        if (!u.isAdmin && !u.isPrimarySuperAdmin) return false;
      }

      const q = String(userSearchQuery || "").trim().toLowerCase();
      if (!q) return true;
      const emailMatch = String(u.correoregistro || "")
        .toLowerCase()
        .includes(q);
      const idMatch =
        String(u.idusuario).includes(q.replace(/^#/, "")) ||
        `#${u.idusuario}` === q;
      const eventMatch =
        Array.isArray(u.eventos_resumen) &&
        u.eventos_resumen.some((ev) =>
          String(ev?.nombre || "")
            .toLowerCase()
            .includes(q)
        );
      return emailMatch || idMatch || eventMatch;
    })
    .sort((a, b) => {
      if (userSortOrder === "oldest") {
        return Number(a.idusuario) - Number(b.idusuario);
      }
      if (userSortOrder === "most_events") {
        const diffEv =
          (Number(b.total_eventos) || 0) - (Number(a.total_eventos) || 0);
        if (diffEv !== 0) return diffEv;
      }
      return Number(b.idusuario) - Number(a.idusuario);
    });

  const adminUsersOnly = usuariosList.filter(
    (u) => u.isAdmin || u.isPrimarySuperAdmin
  );

  return (
    <div className="min-w-0 max-w-full space-y-5 sm:space-y-6">
      {notice && (
        <div className="fixed right-4 bottom-4 left-4 z-50 rounded-2xl border border-[#6C7EE1]/40 bg-[#2D3047] px-4 py-3 text-xs font-bold text-white shadow-xl sm:left-auto sm:max-w-md">
          {notice}
        </div>
      )}

      {/* Encabezado Exclusivo de Administradores */}
      <div className="min-w-0 max-w-full rounded-3xl border border-[#6C7EE1]/30 bg-gradient-to-r from-[#2D3047] via-[#23263A] to-[#1E2135] p-4 text-white shadow-md sm:p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C7EE1]/25 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#9BA9FF]">
              🛡️ Zona Exclusiva • SuperAdmin
            </span>
            <h2 className="mt-2 font-display text-lg font-extrabold uppercase tracking-wide text-white sm:text-2xl lg:text-3xl">
              Configuración Global de Recuerdalo.com.mx
            </h2>
            <p className="mt-1 text-xs text-[#8E94B2]">
              Este apartado es invisible para los clientes. Todo lo que configures aquí aplica de forma centralizada para la plataforma.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:flex sm:flex-wrap sm:items-center">
            <span className="w-full rounded-xl border border-[#6C7EE1]/40 bg-[#6C7EE1]/20 px-3.5 py-2 text-center text-xs font-extrabold text-[#B8C2FF] sm:w-auto">
              👥 {usuariosList.length} Usuario(s) Registrado(s)
            </span>
            <span
              className={`w-full rounded-xl px-3.5 py-2 text-center text-xs font-extrabold sm:w-auto ${
                form.configured
                  ? "bg-emerald-500/20 text-[#4CE0B3]"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {form.configured
                ? "✓ API Meta Global Activa"
                : "⚙️ API Meta Pendiente"}
            </span>
          </div>
        </div>
      </div>

      {/* Módulo 1: WhatsApp Business Cloud API (Meta) Global */}
      <div className="min-w-0 max-w-full rounded-3xl border border-emerald-500/30 bg-white p-3.5 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-2 border-b border-[#E6E9F4] pb-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#18A97E]">
              MÓDULO 1 • CONEXIÓN CENTRAL META CLOUD API
            </span>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#2D3047] sm:text-xl lg:text-2xl">
              📲 Credenciales Globales de WhatsApp Business API
            </h3>
            <p className="text-xs text-[#8E94A9]">
              Configura la cuenta oficial de Meta de Recuerdalo.com.mx para el disparo silencioso y automático de recordatorios en todos los eventos.
            </p>
          </div>
          {form.tokenMasked && (
            <span className="self-start rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 font-mono text-xs font-bold text-[#18A97E] sm:self-auto">
              Token activo: {form.tokenMasked}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12">
          <div className="sm:col-span-1 xl:col-span-4">
            <label className="mb-1 block text-xs font-bold text-[#2D3047]">
              Phone Number ID *
            </label>
            <input
              type="text"
              value={form.phoneNumberId}
              onChange={(e) =>
                setForm((p) => ({ ...p, phoneNumberId: e.target.value }))
              }
              placeholder="Ej. 109283746510293"
              className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#18A97E] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-1 xl:col-span-8">
            <label className="mb-1 block text-xs font-bold text-[#2D3047]">
              Token de Acceso Permanente (System User) *
            </label>
            <input
              type="password"
              value={form.accessToken}
              onChange={(e) =>
                setForm((p) => ({ ...p, accessToken: e.target.value }))
              }
              placeholder={
                form.tokenMasked
                  ? `Actual: ${form.tokenMasked} (deja vacío para conservar)`
                  : "EAAGm0PX4ZCps..."
              }
              className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#18A97E] focus:bg-white"
            />
          </div>

          {/* Campo WABA ID con Tooltip y Botón Listar Plantillas */}
          <div className="group relative sm:col-span-2 xl:col-span-6">
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#2D3047]">
              <span>WABA ID (Opcional)</span>
              <span
                title="No es necesario para enviar los mensajes si los campos de Phone Number ID, Token de Acceso Permanente, Nombre de la Plantilla e Idioma se conocen."
                className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-emerald-600/15 text-[10px] font-extrabold text-[#18A97E]"
              >
                ?
              </span>
            </label>
            <div className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-1.5 w-72 max-w-[calc(100vw-3rem)] rounded-xl border border-[#18A97E]/40 bg-[#F7F8FC] p-2.5 text-[11px] leading-snug text-[#2D3047] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              ℹ️ <strong>Sugerencia:</strong> No es necesario para enviar los mensajes si los campos de{" "}
              <strong>
                Phone Number ID, Token de Acceso Permanente, Nombre de la Plantilla e Idioma
              </strong>{" "}
              se conocen. Solo complétalo si deseas consultar y listar automáticamente las plantillas autorizadas de tu cuenta comercial.
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={form.wabaId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, wabaId: e.target.value }))
                }
                title="No es necesario para enviar los mensajes si los campos de Phone Number ID, Token de Acceso Permanente, Nombre de la Plantilla e Idioma se conocen."
                placeholder="Ej. 102938475610293"
                className="w-full min-w-0 flex-1 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#18A97E] focus:bg-white"
              />
              <button
                type="button"
                disabled={!String(form.wabaId || "").trim() || loadingTemplates}
                onClick={handleListTemplates}
                title={
                  String(form.wabaId || "").trim()
                    ? "Consultar plantillas autorizadas de esta cuenta WABA"
                    : "Completa el campo WABA ID para habilitar la consulta de plantillas"
                }
                className="w-full shrink-0 cursor-pointer rounded-xl border border-[#18A97E] bg-white px-4 py-2.5 text-center text-xs font-extrabold text-[#18A97E] transition hover:bg-[#18A97E] hover:text-white disabled:cursor-not-allowed disabled:border-[#DCE0F0] disabled:bg-gray-100 disabled:text-gray-400 sm:w-auto"
              >
                {loadingTemplates
                  ? "⏳ Consultando..."
                  : "📋 Listar Plantillas"}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 xl:col-span-6">
            <label className="mb-1 block text-xs font-bold text-[#2D3047]">
              Nombre de Plantilla Meta
            </label>
            <input
              type="text"
              value={form.templateName}
              onChange={(e) =>
                setForm((p) => ({ ...p, templateName: e.target.value }))
              }
              placeholder="recordatorio_evento_recuerdalo"
              className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#18A97E] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-1 xl:col-span-4">
            <label className="mb-1 block text-xs font-bold text-[#2D3047]">
              Idioma
            </label>
            <input
              type="text"
              value={form.templateLang}
              onChange={(e) =>
                setForm((p) => ({ ...p, templateLang: e.target.value }))
              }
              placeholder="es_MX"
              className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#18A97E] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-1 xl:col-span-4">
            <label className="mb-1 block text-xs font-bold text-[#2D3047]">
              Modo Envío
            </label>
            <select
              value={form.mode}
              onChange={(e) =>
                setForm((p) => ({ ...p, mode: e.target.value }))
              }
              className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#18A97E] focus:bg-white"
            >
              <option value="template">Plantilla</option>
              <option value="text">Texto (24h)</option>
            </select>
          </div>

          <div className="sm:col-span-2 xl:col-span-4">
            <label className="mb-1 block text-xs font-bold text-[#2D3047]">
              Hora Disparo Diario (CDMX)
            </label>
            <select
              value={form.cronHour}
              onChange={(e) =>
                setForm((p) => ({ ...p, cronHour: Number(e.target.value) }))
              }
              className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-2.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#18A97E] focus:bg-white"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00 hrs
                </option>
              ))}
            </select>
          </div>
        </div>

        {templatesList.length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#18A97E]">
                📑 Plantillas Encontradas en tu WABA ({templatesList.length}) — Haz clic para usar:
              </span>
              <button
                type="button"
                onClick={() => setTemplatesList([])}
                className="cursor-pointer text-xs font-bold text-[#8E94A9] hover:text-[#2D3047]"
              >
                ✕ Cerrar lista
              </button>
            </div>
            <div className="grid max-h-52 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {templatesList.map((tpl, idx) => {
                const isSelected =
                  form.templateName === tpl.name &&
                  form.templateLang === tpl.language;
                return (
                  <div
                    key={`${tpl.name}-${tpl.language}-${idx}`}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        templateName: tpl.name,
                        templateLang: tpl.language,
                      }))
                    }
                    className={`cursor-pointer rounded-xl border p-2.5 text-xs transition ${
                      isSelected
                        ? "border-[#18A97E] bg-white ring-2 ring-[#18A97E]/25"
                        : "border-[#E6E9F4] bg-white/80 hover:border-emerald-400 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate font-mono text-xs font-bold text-[#2D3047]">
                        {tpl.name}
                      </span>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                          tpl.status === "APPROVED"
                            ? "bg-emerald-500/15 text-[#18A97E]"
                            : "bg-amber-500/15 text-[#D97706]"
                        }`}
                      >
                        {tpl.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-semibold text-[#6C7EE1]">
                      Idioma: {tpl.language} • {tpl.category}
                    </p>
                    {tpl.bodyText && (
                      <p className="mt-1 line-clamp-2 text-[10px] text-[#5B617A]">
                        {tpl.bodyText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col items-stretch justify-between gap-3 border-t border-[#E6E9F4] pt-4 sm:flex-row sm:flex-wrap sm:items-center">
          <p className="text-[11px] text-[#5B617A]">
            💡 Tip: Para pruebas rápidas puedes usar la plantilla preaprobada{" "}
            <code className="rounded bg-[#F7F8FC] px-1.5 py-0.5 font-mono font-bold text-[#18A97E]">
              hello_world
            </code>{" "}
            con idioma{" "}
            <code className="rounded bg-[#F7F8FC] px-1.5 py-0.5 font-mono font-bold text-[#18A97E]">
              en_US
            </code>
            .
          </p>
          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={runningCron}
              onClick={handleRunReminderCheckNow}
              className="w-full cursor-pointer rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-center text-xs font-bold text-[#D97706] transition hover:bg-amber-500/20 disabled:opacity-50 sm:w-auto"
            >
              {runningCron
                ? "⏳ Verificando..."
                : "⚡ Ejecutar Ciclo Automático Ahora"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveConfig()}
              className="w-full cursor-pointer rounded-xl bg-[#18A97E] px-5 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50 sm:w-auto"
            >
              {saving ? "⏳ Guardando..." : "💾 Guardar Configuración Global"}
            </button>
          </div>
        </div>
      </div>

      {/* Módulo 2: Cuentas Administradoras de Recuerdalo.com.mx */}
      <div className="min-w-0 max-w-full rounded-3xl border border-[#E6E9F4] bg-white p-3.5 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[#E6E9F4] pb-4 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6C7EE1]">
              MÓDULO 2 • CONTROL DE ACCESO ADMINISTRATIVO
            </span>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#2D3047] sm:text-xl lg:text-2xl">
              👥 Cuentas Administradoras de Recuerdalo.com.mx
            </h3>
            <p className="text-xs text-[#8E94A9]">
              Elige qué usuarios tienen permiso para ver y administrar este apartado de Configuración Global.
            </p>
          </div>

          <form
            onSubmit={handleAddAdminByEmail}
            className="flex w-full flex-col gap-2 sm:flex-row sm:items-center xl:w-auto"
          >
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full min-w-0 flex-1 rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1] focus:bg-white xl:w-64"
            />
            <button
              type="submit"
              className="w-full shrink-0 cursor-pointer rounded-xl bg-[#6C7EE1] px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-[#5A6CD0] sm:w-auto"
            >
              ＋ Agregar Admin
            </button>
          </form>
        </div>

        <div className="space-y-2.5">
          {preAuthorizedAdmins.map((email) => (
            <div
              key={`pre-${email}`}
              className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-[#6C7EE1]/35 bg-[#ECEFFA]/55 p-3.5 text-xs sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-all font-bold text-[#2D3047] sm:truncate">
                    {email}
                  </span>
                  <span className="rounded-full bg-[#6C7EE1]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#6C7EE1]">
                    🛡️ Administrador Autorizado
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-[#5B617A]">
                  Correo autorizado en lista global (tendrá acceso Admin al iniciar sesión o registrarse)
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemovePreAuthorizedEmail(email)}
                className="w-full shrink-0 cursor-pointer rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-center text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 sm:w-auto"
              >
                Quitar Permiso Admin
              </button>
            </div>
          ))}

          {adminUsersOnly.map((u) => (
            <div
              key={u.idusuario}
              className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-[#E6E9F4] bg-[#F7F8FC] p-3.5 text-xs sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-all font-bold text-[#2D3047] sm:truncate">
                    {u.correoregistro}
                  </span>
                  {u.isPrimarySuperAdmin ? (
                    <span className="rounded-full bg-[#2D3047] px-2.5 py-0.5 text-[10px] font-extrabold text-[#4CE0B3]">
                      👑 SuperAdmin Principal
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#6C7EE1]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#6C7EE1]">
                      🛡️ Administrador
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-[#8E94A9]">
                  ID #{u.idusuario} • Registrado: {formatFechaRegistro(u.creado_en)} • {u.total_eventos} evento(s) creado(s)
                </p>
              </div>

              {!u.isPrimarySuperAdmin && (
                <button
                  type="button"
                  onClick={() => handleToggleUserAdmin(u)}
                  className="w-full shrink-0 cursor-pointer rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-center text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 sm:w-auto"
                >
                  Quitar Permiso Admin
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Módulo 3: Zona / Monitor de Usuarios Registrados en Recuerdalo.com.mx */}
      <div className="min-w-0 max-w-full rounded-3xl border border-[#6C7EE1]/35 bg-white p-3.5 shadow-xs sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[#E6E9F4] pb-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6C7EE1]">
              MÓDULO 3 • MONITOR DE REGISTROS DE PLATAFORMA
            </span>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#2D3047] sm:text-xl lg:text-2xl">
              🪪 Usuarios Registrados en Recuerdalo.com.mx
            </h3>
            <p className="text-xs text-[#8E94A9]">
              Supervisa en tiempo real cada cuenta que se va registrando en la plataforma, su fecha exacta de alta, eventos creados y actividad.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshingUsers}
            onClick={handleRefreshUsers}
            className="w-full shrink-0 cursor-pointer rounded-xl border border-[#6C7EE1] bg-[#ECEFFA]/60 px-4 py-2.5 text-center text-xs font-extrabold text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white disabled:opacity-50 sm:w-auto"
          >
            {refreshingUsers
              ? "⏳ Actualizando..."
              : "🔄 Actualizar Registros"}
          </button>
        </div>

        {/* Tarjetas KPI de Usuarios Registrados */}
        <div className="mb-5 grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 xl:grid-cols-4 sm:gap-3">
          <div className="min-w-0 rounded-2xl border border-[#E6E9F4] bg-gradient-to-br from-[#F7F8FC] to-white p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[10px] font-extrabold uppercase tracking-wider text-[#6C7EE1]">
                Total Registrados
              </span>
              <span className="shrink-0 rounded-lg bg-[#6C7EE1]/12 px-2 py-0.5 text-[10px] font-extrabold text-[#6C7EE1]">
                👥 Directorio
              </span>
            </div>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-[#2D3047]">
              {usuariosList.length}
            </p>
            <p className="mt-0.5 text-[11px] text-[#8E94A9]">
              Cuentas creadas en Recuerdalo.com.mx
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-50/50 to-white p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[10px] font-extrabold uppercase tracking-wider text-[#18A97E]">
                Nuevos (Últimos 7 Días)
              </span>
              <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-[#18A97E]">
                ⚡ Hoy: {registeredTodayCount}
              </span>
            </div>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-[#18A97E]">
              +{recent7DaysCount}
            </p>
            <p className="mt-0.5 text-[11px] text-[#8E94A9]">
              Usuarios registrados recientemente
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-[#E6E9F4] bg-gradient-to-br from-[#F7F8FC] to-white p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[10px] font-extrabold uppercase tracking-wider text-[#2D3047]">
                Usuarios con Eventos
              </span>
              <span className="shrink-0 rounded-lg bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                🎉 {totalPlatformEvents} evento(s)
              </span>
            </div>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-[#2D3047]">
              {usersWithEventsCount}{" "}
              <span className="text-xs font-bold text-[#8E94A9]">
                / {usuariosList.length}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-[#8E94A9]">
              {usersWithoutEventsCount} cuenta(s) aún sin eventos
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-[#E6E9F4] bg-gradient-to-br from-[#F7F8FC] to-white p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[10px] font-extrabold uppercase tracking-wider text-[#6C7EE1]">
                Invitados en Plataforma
              </span>
              <span className="shrink-0 rounded-lg bg-[#2D3047]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#2D3047]">
                🛡️ {adminUsersCount} Admin(s)
              </span>
            </div>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-[#2D3047]">
              {totalPlatformGuests}
            </p>
            <p className="mt-0.5 text-[11px] text-[#8E94A9]">
              Invitados acumulados en todos los eventos
            </p>
          </div>
        </div>

        {/* Barra de Búsqueda, Filtros y Ordenamiento */}
        <div className="mb-4 flex min-w-0 flex-col gap-3 rounded-2xl border border-[#E6E9F4] bg-[#F7F8FC] p-3">
          <div className="flex min-w-0 flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="🔍 Buscar por correo electrónico, #ID de usuario o nombre de evento..."
                className="w-full rounded-xl border border-[#DCE0F0] bg-white py-2.5 pr-8 pl-3.5 text-xs text-[#2D3047] outline-none focus:border-[#6C7EE1]"
              />
              {userSearchQuery && (
                <button
                  type="button"
                  onClick={() => setUserSearchQuery("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-lg px-2 py-0.5 text-xs font-bold text-[#8E94A9] hover:text-[#2D3047]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
              <label className="shrink-0 text-[11px] font-bold text-[#5B617A]">
                Ordenar:
              </label>
              <select
                value={userSortOrder}
                onChange={(e) => setUserSortOrder(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-[#DCE0F0] bg-white px-3 py-2 text-xs font-bold text-[#2D3047] outline-none focus:border-[#6C7EE1] sm:w-auto"
              >
                <option value="newest">
                  📅 Más recientes primero (Últimos registros)
                </option>
                <option value="oldest">
                  🕰️ Más antiguos primero (Primeros registros)
                </option>
                <option value="most_events">
                  🔥 Mayor cantidad de eventos creados
                </option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              {
                id: "all",
                label: `Todos (${usuariosList.length})`,
              },
              {
                id: "recent",
                label: `🆕 Nuevos 7 días (${recent7DaysCount})`,
              },
              {
                id: "with_events",
                label: `🎉 Con Eventos (${usersWithEventsCount})`,
              },
              {
                id: "without_events",
                label: `📭 Sin Eventos (${usersWithoutEventsCount})`,
              },
              {
                id: "admins",
                label: `🛡️ Administradores (${adminUsersCount})`,
              },
            ].map((tab) => {
              const active = userFilterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setUserFilterType(tab.id)}
                  className={`cursor-pointer rounded-xl px-3 py-1.5 text-[11px] font-extrabold transition ${
                    active
                      ? "bg-[#2D3047] text-white shadow-xs"
                      : "border border-[#DCE0F0] bg-white text-[#5B617A] hover:border-[#6C7EE1] hover:text-[#2D3047]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla de Usuarios Registrados con Scroll Horizontal y Vertical */}
        {filteredUsuarios.length === 0 ? (
          <div className="rounded-2xl border border-[#E6E9F4] bg-[#F7F8FC] p-6 text-center">
            <p className="text-xs font-bold text-[#5B617A]">
              No se encontraron usuarios registrados con el filtro o búsqueda actual.
            </p>
          </div>
        ) : (
          <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#E6E9F4] bg-white shadow-2xs">
            {/* Barra superior de ayuda y botones de desplazamiento horizontal */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E9F4] bg-[#F7F8FC] px-3 py-2">
              <span className="text-[11px] font-semibold text-[#5B617A]">
                ↔ Desliza horizontalmente la tabla para explorar todas las columnas ({filteredUsuarios.length} registro{filteredUsuarios.length === 1 ? "" : "s"})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollUsersTable(-1)}
                  title="Desplazar tabla hacia la izquierda"
                  className="cursor-pointer rounded-lg border border-[#DCE0F0] bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#2D3047] shadow-2xs transition hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
                >
                  ◀ Izq.
                </button>
                <button
                  type="button"
                  onClick={() => scrollUsersTable(1)}
                  title="Desplazar tabla hacia la derecha"
                  className="cursor-pointer rounded-lg border border-[#DCE0F0] bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#2D3047] shadow-2xs transition hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
                >
                  Der. ▶
                </button>
              </div>
            </div>

            <div
              ref={tableScrollRef}
              className="admin-table-scroll max-h-[520px] w-full max-w-full overflow-x-auto overflow-y-auto"
            >
              <table className="w-max min-w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10 border-b border-[#E6E9F4] bg-[#2D3047] text-[10px] font-extrabold uppercase tracking-wider text-white">
                  <tr>
                    <th className="px-3.5 py-3 whitespace-nowrap">ID</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">
                      Usuario / Correo Electrónico
                    </th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Rol</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">
                      Fecha de Alta
                    </th>
                    <th className="px-3.5 py-3 whitespace-nowrap">
                      Actividad
                    </th>
                    <th className="px-3.5 py-3 whitespace-nowrap">
                      Eventos Creados
                    </th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E9F4]">
                  {filteredUsuarios.map((u) => {
                    const isRecent = isRegisteredWithinDays(u.creado_en, 7);
                    const isToday = isRegisteredToday(u.creado_en);
                    const relativeTime = formatTiempoRelativo(u.creado_en);
                    const initial = String(u.correoregistro || "U")
                      .trim()
                      .charAt(0)
                      .toUpperCase();
                    const eventosResumen = Array.isArray(u.eventos_resumen)
                      ? u.eventos_resumen
                      : [];
                    const isExpanded = expandedUserEventsId === u.idusuario;
                    const visibleEvents = isExpanded
                      ? eventosResumen
                      : eventosResumen.slice(0, 3);

                    return (
                      <tr
                        key={`reg-${u.idusuario}`}
                        className={`align-middle transition hover:bg-[#ECEFFA]/45 ${
                          isToday
                            ? "bg-emerald-50/35"
                            : isRecent
                            ? "bg-[#F7F8FC]/80"
                            : "bg-white"
                        }`}
                      >
                        {/* Columna 1: ID */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-lg bg-[#2D3047]/10 px-2.5 py-1 font-mono text-[11px] font-extrabold text-[#2D3047]">
                            ID #{u.idusuario}
                          </span>
                        </td>

                        {/* Columna 2: Usuario / Correo */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-xs font-extrabold text-white shadow-2xs ${
                                u.isPrimarySuperAdmin
                                  ? "bg-[#2D3047]"
                                  : u.isAdmin
                                  ? "bg-[#6C7EE1]"
                                  : isToday
                                  ? "bg-[#18A97E]"
                                  : "bg-[#5B617A]"
                              }`}
                            >
                              {initial}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#2D3047]">
                                {u.correoregistro}
                              </span>
                              {isToday ? (
                                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                                  ⚡ Hoy
                                </span>
                              ) : isRecent ? (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#18A97E]">
                                  🆕 Nuevo (7d)
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* Columna 3: Rol */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          {u.isPrimarySuperAdmin ? (
                            <span className="inline-flex items-center rounded-full bg-[#2D3047] px-2.5 py-1 text-[10px] font-extrabold text-[#4CE0B3]">
                              👑 SuperAdmin Principal
                            </span>
                          ) : u.isAdmin ? (
                            <span className="inline-flex items-center rounded-full bg-[#6C7EE1]/15 px-2.5 py-1 text-[10px] font-extrabold text-[#6C7EE1]">
                              🛡️ Administrador
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-200/80 px-2.5 py-1 text-[10px] font-semibold text-[#5B617A]">
                              👤 Cliente / Organizador
                            </span>
                          )}
                        </td>

                        {/* Columna 4: Fecha de Alta */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#2D3047]">
                              📅 {formatFechaRegistro(u.creado_en)}
                            </span>
                            {relativeTime && (
                              <span className="rounded bg-[#6C7EE1]/12 px-2 py-0.5 text-[10px] font-bold text-[#6C7EE1]">
                                {relativeTime}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Columna 5: Actividad */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5 text-[11px] text-[#5B617A]">
                            <span>
                              🎉{" "}
                              <strong className="text-[#2D3047]">
                                {u.total_eventos || 0}
                              </strong>{" "}
                              evento(s)
                            </span>
                            <span>
                              🎟️{" "}
                              <strong className="text-[#2D3047]">
                                {u.total_invitados || 0}
                              </strong>{" "}
                              invitado(s)
                            </span>
                          </div>
                        </td>

                        {/* Columna 6: Eventos Creados */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          {eventosResumen.length > 0 ? (
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              {visibleEvents.map((ev) => (
                                <span
                                  key={`u-${u.idusuario}-ev-${ev.idevento}`}
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#DCE0F0] bg-[#F7F8FC] px-2 py-0.5 text-[10px] font-semibold text-[#2D3047]"
                                >
                                  <strong className="text-[#6C7EE1]">
                                    #{ev.idevento}
                                  </strong>{" "}
                                  <span>{ev.nombre}</span>
                                  {ev.fecha_evento && (
                                    <span className="text-[#8E94A9]">
                                      • {String(ev.fecha_evento).slice(0, 10)}
                                    </span>
                                  )}
                                </span>
                              ))}
                              {eventosResumen.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedUserEventsId(
                                      isExpanded ? null : u.idusuario
                                    )
                                  }
                                  className="cursor-pointer rounded-lg bg-[#ECEFFA] px-2 py-0.5 text-[10px] font-extrabold text-[#6C7EE1] transition hover:bg-[#6C7EE1] hover:text-white"
                                >
                                  {isExpanded
                                    ? "Ver menos"
                                    : `+${eventosResumen.length - 3} más`}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] italic text-[#8E94A9]">
                              📭 Sin eventos creados
                            </span>
                          )}
                        </td>

                        {/* Columna 7: Acción */}
                        <td className="px-3.5 py-3 text-right whitespace-nowrap">
                          {u.isPrimarySuperAdmin ? (
                            <span className="inline-flex items-center rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3 py-1.5 text-[10px] font-bold text-[#8E94A9]">
                              🔒 Permanente
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleUserAdmin(u)}
                              className={`cursor-pointer rounded-xl px-3.5 py-2 text-center text-[11px] font-bold transition ${
                                u.isAdmin
                                  ? "border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                  : "border border-[#6C7EE1] bg-white text-[#6C7EE1] hover:bg-[#6C7EE1] hover:text-white"
                              }`}
                            >
                              {u.isAdmin
                                ? "Quitar Permiso Admin"
                                : "🛡️ Hacer Administrador"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Módulo 4: Cámara en Vivo y Álbumes de Recuerdos HD por Evento */}
      <div className="min-w-0 max-w-full rounded-3xl border border-[#6C7EE1]/30 bg-white p-3.5 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-2 border-b border-[#E6E9F4] pb-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6C7EE1]">
              MÓDULO 4 • CÁMARA EN VIVO Y ÁLBUMES DE RECUERDOS HD
            </span>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#2D3047] sm:text-xl lg:text-2xl">
              📸 Calidad Fotográfica Global y Autolimpieza de Álbumes (30 Días)
            </h3>
            <p className="text-xs text-[#8E94A9]">
              Cada evento cuenta con su propio álbum ilimitado en Alta Definición. Configura el nivel de calidad WebP y el periodo de vigencia antes de su eliminación automática.
            </p>
          </div>
          <span className="self-start rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700 sm:self-auto">
            ∞ Fotos Ilimitadas por Evento • Vigencia: {form.albumRetentionDays} días
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12">
          <div className="sm:col-span-1 xl:col-span-6">
            <label className="mb-1 block text-xs font-bold text-[#2D3047]">
              Calidad Fotográfica Global (Motor Dual WebP HD)
            </label>
            <select
              value={form.photoQuality}
              onChange={(e) =>
                setForm((p) => ({ ...p, photoQuality: e.target.value }))
              }
              className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1] focus:bg-white"
            >
              <option value="standard">
                Estándar Full HD (1920px · ~180 KB — Máximo ahorro)
              </option>
              <option value="hd">
                ⭐ Alta Definición HD 2.5K (2560px · ~480 KB — Recomendado Gama Alta)
              </option>
              <option value="ultrahd">
                Ultra HD 4K Fotográfico (3840px · ~950 KB — Impresión / Pantallas 4K)
              </option>
            </select>
          </div>

          <div className="sm:col-span-1 xl:col-span-6">
            <label className="mb-1 block text-xs font-bold text-[#2D3047]">
              Periodo de Vigencia para Descargar Álbum (Días antes de Autolimpieza)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={form.albumRetentionDays}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  albumRetentionDays: Math.max(
                    1,
                    Math.min(365, Number(e.target.value) || 30)
                  ),
                }))
              }
              className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-3.5 py-2.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1] focus:bg-white"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col items-stretch justify-between gap-3 border-b border-[#E6E9F4] pb-4 sm:flex-row sm:flex-wrap sm:items-center">
          <p className="text-[11px] text-[#5B617A]">
            ℹ️ Al cumplirse los <strong>{form.albumRetentionDays} días</strong>, el servidor elimina automáticamente las fotos del evento vencido para mantener el disco libre.
          </p>
          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={runningAlbumCleanup}
              onClick={handleRunAlbumCleanupNow}
              className="w-full cursor-pointer rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-center text-xs font-bold text-[#D97706] transition hover:bg-amber-500/20 disabled:opacity-50 sm:w-auto"
            >
              {runningAlbumCleanup
                ? "⏳ Revisando álbumes..."
                : "🧹 Ejecutar Autolimpieza de Vencidos"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveConfig()}
              className="w-full cursor-pointer rounded-xl bg-[#6C7EE1] px-5 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#5A6CD0] disabled:opacity-50 sm:w-auto"
            >
              {saving ? "⏳ Guardando..." : "💾 Guardar Calidad y Vigencia"}
            </button>
          </div>
        </div>

        {/* Monitor de Álbumes por Evento */}
        <div className="mt-4">
          <h4 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[#2D3047]">
            📊 Monitor de Álbumes Fotográficos por Evento ({albumesEventos.length})
          </h4>
          {albumesEventos.length === 0 ? (
            <p className="rounded-xl bg-[#F7F8FC] p-4 text-center text-xs text-[#5B617A]">
              Aún no hay eventos registrados en la plataforma.
            </p>
          ) : (
            <div className="space-y-2.5">
              {albumesEventos.map((ev) => (
                <div
                  key={ev.idevento}
                  className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-[#E6E9F4] bg-[#F7F8FC] p-3.5 text-xs sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-[#2D3047]">
                        #{ev.idevento} • {ev.nombre}
                      </span>
                      <span className="rounded-full bg-[#6C7EE1]/12 px-2.5 py-0.5 text-[10px] font-extrabold text-[#6C7EE1]">
                        📷 {ev.totalPhotos} foto(s) ({ev.totalMb} MB)
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          ev.daysRemaining <= 5
                            ? "bg-amber-500/20 text-amber-800"
                            : "bg-emerald-500/15 text-emerald-700"
                        }`}
                      >
                        ⏳ Restan {ev.daysRemaining} días (Expira:{" "}
                        {String(ev.expiresAt || "").slice(0, 10)})
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-[#8E94A9]">
                      Anfitrión: {ev.propietario_email || "—"} • Fecha evento:{" "}
                      {String(ev.fecha_evento || "").slice(0, 10)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      ev.totalPhotos === 0 || cleaningEventId === ev.idevento
                    }
                    onClick={() => handleCleanEventAlbum(ev)}
                    className="w-full shrink-0 cursor-pointer rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-center text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 sm:w-auto"
                  >
                    {cleaningEventId === ev.idevento
                      ? "⏳ Limpiando..."
                      : ev.totalPhotos > 0
                      ? `🗑️ Limpiar Álbum (${ev.totalMb} MB)`
                      : "Álbum Vacío"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

