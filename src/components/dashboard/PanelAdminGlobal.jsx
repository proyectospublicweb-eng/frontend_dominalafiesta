import { useEffect, useState } from "react";
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

  return (
    <div className="space-y-6">
      {notice && (
        <div className="fixed right-4 bottom-4 left-4 z-50 rounded-2xl border border-[#6C7EE1]/40 bg-[#2D3047] px-4 py-3 text-xs font-bold text-white shadow-xl sm:left-auto sm:max-w-md">
          {notice}
        </div>
      )}

      {/* Encabezado Exclusivo de Administradores */}
      <div className="rounded-3xl border border-[#6C7EE1]/30 bg-gradient-to-r from-[#2D3047] via-[#23263A] to-[#1E2135] p-4 text-white shadow-md sm:p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C7EE1]/25 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#9BA9FF]">
              🛡️ Zona Exclusiva • SuperAdmin
            </span>
            <h2 className="mt-2 font-display text-xl font-extrabold uppercase tracking-wide text-white sm:text-2xl lg:text-3xl">
              Configuración Global de Recuerdalo.com.mx
            </h2>
            <p className="mt-1 text-xs text-[#8E94B2]">
              Este apartado es invisible para los clientes. Todo lo que configures aquí aplica de forma centralizada para la plataforma.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
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
      <div className="rounded-3xl border border-emerald-500/30 bg-white p-4 shadow-xs sm:p-6">
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
      <div className="rounded-3xl border border-[#E6E9F4] bg-white p-4 shadow-xs sm:p-6">
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

          {usuariosList.map((u) => (
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
                  ) : u.isAdmin ? (
                    <span className="rounded-full bg-[#6C7EE1]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#6C7EE1]">
                      🛡️ Administrador
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-[10px] font-semibold text-[#5B617A]">
                      👤 Cliente / Organizador
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-[#8E94A9]">
                  ID #{u.idusuario} • {u.total_eventos} evento(s) creado(s)
                </p>
              </div>

              {!u.isPrimarySuperAdmin && (
                <button
                  type="button"
                  onClick={() => handleToggleUserAdmin(u)}
                  className={`w-full shrink-0 cursor-pointer rounded-xl px-3.5 py-2 text-center text-[11px] font-bold transition sm:w-auto ${
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
            </div>
          ))}
        </div>
      </div>

      {/* Módulo 3: Cámara en Vivo y Álbumes de Recuerdos HD por Evento */}
      <div className="rounded-3xl border border-[#6C7EE1]/30 bg-white p-4 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-2 border-b border-[#E6E9F4] pb-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6C7EE1]">
              MÓDULO 3 • CÁMARA EN VIVO Y ÁLBUMES DE RECUERDOS HD
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

