import { useEffect, useState } from "react";
import { useGoogleMapsLocation } from "../../utils/googleMaps.js";
import catalogosMexico from "../../utils/catalogosMexico.json";
import { getCatalogosEstadosMunicipiosRequest } from "../../api/eventos.js";

const TIPOS_EVENTO = [
  "Fiesta Privada",
  "Boda",
  "XV Años / Gala",
  "Cumpleaños",
  "Evento Corporativo",
  "Concierto / Festival",
];

const PLANTILLAS = [
  {
    id: "neon-crimson",
    name: "Azul Celeste Pro",
    accent: "#15b2f5",
    previewBg: "from-[#2D3047] via-[#1B2D6E] to-[#171F39]",
    border: "border-[#15B2F5]",
  },
  {
    id: "cyber-cyan",
    name: "Esmeralda VIP",
    accent: "#10b981",
    previewBg: "from-[#062419] via-[#171F39] to-[#121316]",
    border: "border-emerald-400",
  },
  {
    id: "gold-gala",
    name: "Gala Dorada VIP",
    accent: "#f59e0b",
    previewBg: "from-[#1c1506] via-[#171F39] to-[#121316]",
    border: "border-amber-400",
  },
  {
    id: "midnight-vip",
    name: "Carbón Minimal",
    accent: "#84cc16",
    previewBg: "from-[#2D3047] via-[#171F39] to-[#0B1336]",
    border: "border-lime-400",
  },
];

function WizardCrearEvento({ onCreateEvento, onCancel, initialDate = "" }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [gpsNotice, setGpsNotice] = useState("");
  const [catalogos, setCatalogos] = useState(catalogosMexico);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    nombre: "",
    tipo_evento: "Fiesta Privada",
    fecha_evento: initialDate || tomorrow,
    hora_evento: "20:00",
    fecha_limite_rsvp_activa: false,
    fecha_limite_rsvp: "",
    estado_evento: "Ningúno",
    municipio: "Ningúno",
    lugar: "",
    direccion: "",
    capacidad: 100,
    presupuesto_meta: 25000,
    codigo_vestimenta: "Formal / Cóctel",
    plantilla_tema: "neon-crimson",
    color_acento: "#15b2f5",
    mensaje_invitacion: "",
    mesa_regalos_habilitada: false,
    mesa_regalos_tienda: "Amazon",
    mesa_regalos_url: "",
  });

  useEffect(() => {
    getCatalogosEstadosMunicipiosRequest()
      .then((res) => {
        if (res.data?.estados?.length) {
          setCatalogos(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialDate) {
      setForm((prev) => ({ ...prev, fecha_evento: initialDate }));
    }
  }, [initialDate]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "fecha_evento" &&
      prev.fecha_limite_rsvp_activa &&
      prev.fecha_limite_rsvp &&
      value &&
      prev.fecha_limite_rsvp > value
        ? { fecha_limite_rsvp: value }
        : {}),
    }));
    setError("");
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.nombre.trim()) {
        setError("Por favor ingresa el nombre de tu evento o fiesta.");
        return;
      }
      if (!form.fecha_evento) {
        setError("Selecciona la fecha del evento.");
        return;
      }
      if (form.fecha_limite_rsvp_activa) {
        if (!form.fecha_limite_rsvp) {
          setError(
            "Selecciona la fecha límite de confirmación para tus invitados."
          );
          return;
        }
        if (form.fecha_evento && form.fecha_limite_rsvp > form.fecha_evento) {
          setError(
            "La fecha límite de confirmación no puede ser posterior a la fecha del evento."
          );
          return;
        }
      }
    }
    if (step === 2) {
      if (!form.lugar.trim()) {
        setError("Ingresa el nombre del salón, jardín o lugar del evento.");
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const esNinguno =
        !form.estado_evento || form.estado_evento === "Ningúno";
      await onCreateEvento({
        ...form,
        estado_evento: esNinguno ? "Ningúno" : form.estado_evento,
        municipio: esNinguno ? "Ningúno" : form.municipio || "Ningúno",
        mensaje_invitacion:
          form.mensaje_invitacion.trim() ||
          `Te invitamos cordialmente a celebrar con nosotros "${form.nombre}". ¡Tu presencia hará esta noche inolvidable!`,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo crear el evento. Intenta de nuevo."
      );
      setSubmitting(false);
    }
  };

  const stepsInfo = [
    {
      num: 1,
      title: "Datos Básicos",
      colorClass:
        "bg-[#86B59F] shadow-[0_12px_24px_rgba(134,181,159,0.36)]",
      badgeClass: "bg-white text-[#679A82]",
    },
    {
      num: 2,
      title: "Lugar y Aforo",
      colorClass:
        "bg-[#4A4A8A] shadow-[0_12px_24px_rgba(74,74,138,0.36)]",
      badgeClass: "bg-white text-[#4A4A8A]",
    },
    {
      num: 3,
      title: "Diseño de Invitación",
      colorClass:
        "bg-[#FF5B4D] shadow-[0_12px_24px_rgba(255,91,77,0.36)]",
      badgeClass: "bg-white text-[#FF5B4D]",
    },
    {
      num: 4,
      title: "Confirmación",
      colorClass:
        "bg-[#C9B16B] shadow-[0_12px_24px_rgba(201,177,107,0.36)]",
      badgeClass: "bg-white text-[#8C732B]",
    },
  ];

  const selectedTemplate =
    PLANTILLAS.find((p) => p.id === form.plantilla_tema) || PLANTILLAS[0];
  const mapLocation = useGoogleMapsLocation(form.lugar, form.direccion);

  return (
    <div className="font-wallet mx-auto max-w-4xl min-w-0">
      {/* Cabecera del Wizard */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-lg bg-[#4A4A8A] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-2xs">
            Asistente Paso a Paso
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#14141F] sm:text-4xl">
            ➕ Crear Nuevo Evento
          </h1>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-start rounded-xl border border-[#ECEEF2] bg-white px-4 py-2.5 text-xs font-bold text-[#14141F] shadow-2xs transition hover:border-[#4A4A8A] hover:text-[#4A4A8A]"
          >
            ← Volver a Mis Eventos
          </button>
        )}
      </div>

      {/* Barra de progreso de pasos con colores e insignias estilo Tripler */}
      <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {stepsInfo.map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
              className={`group flex min-w-0 items-center gap-2 rounded-[20px] px-3 py-2.5 text-left text-white transition sm:gap-3 sm:px-4 sm:py-3.5 ${s.colorClass} ${
                isActive
                  ? "-translate-y-0.5 ring-2 ring-white brightness-105"
                  : "opacity-90 hover:opacity-100"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold shadow-2xs sm:h-8 sm:w-8 ${s.badgeClass}`}
              >
                {isDone ? "✓" : s.num}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/85">
                  Paso {s.num}
                </p>
                <p className="truncate text-xs font-extrabold tracking-tight text-white">
                  {s.title}
                </p>
              </div>
              <span className="hidden text-xs font-bold text-white/90 transition-transform group-hover:translate-x-0.5 sm:inline">
                →
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenedor del paso actual */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#ECEEF2] bg-white p-4 shadow-[0_14px_38px_rgba(20,20,31,0.05)] sm:p-8"
      >
        {error && (
          <div className="mb-6 rounded-xl border border-[#FF5B4D]/30 bg-[#FFF4F2] px-4 py-3 text-sm font-medium text-[#E6483B]">
            {error}
          </div>
        )}

        {/* PASO 1: DATOS BÁSICOS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#14141F]">
                1. Información principal del evento
              </h2>
              <p className="mt-1 text-xs text-[#8A8D9F]">
                Define el nombre, la categoría y cuándo se llevará a cabo la celebración.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#14141F]">
                  Nombre del Evento o Fiesta *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => updateField("nombre", e.target.value)}
                  placeholder="Ej. Gala de Aniversario, Boda de Sofía & Diego..."
                  className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-3 text-sm text-[#14141F] placeholder-[#8A8D9F] outline-none transition focus:border-[#4A4A8A] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#14141F]">
                  Tipo de Evento
                </label>
                <select
                  value={form.tipo_evento}
                  onChange={(e) => updateField("tipo_evento", e.target.value)}
                  className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-3 text-sm text-[#14141F] outline-none transition focus:border-[#4A4A8A] focus:bg-white"
                >
                  {TIPOS_EVENTO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#14141F]">
                  Código de Vestimenta
                </label>
                <input
                  type="text"
                  value={form.codigo_vestimenta}
                  onChange={(e) =>
                    updateField("codigo_vestimenta", e.target.value)
                  }
                  placeholder="Ej. Formal / Cóctel, Rigurosa Etiqueta..."
                  className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-3 text-sm text-[#14141F] placeholder-[#8A8D9F] outline-none transition focus:border-[#4A4A8A] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#14141F]">
                  Fecha del Evento *
                </label>
                <input
                  type="date"
                  value={form.fecha_evento}
                  onChange={(e) => updateField("fecha_evento", e.target.value)}
                  className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-3 text-sm text-[#14141F] outline-none transition focus:border-[#4A4A8A] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#14141F]">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={form.hora_evento}
                  onChange={(e) => updateField("hora_evento", e.target.value)}
                  className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-3 text-sm text-[#14141F] outline-none transition focus:border-[#4A4A8A] focus:bg-white"
                />
              </div>

              {/* Opción de Fecha Límite de Confirmación al Evento */}
              <div className="sm:col-span-2 rounded-2xl border border-[#E4E6EE] bg-[#F6F7F9]/80 p-4">
                <div className="grid grid-cols-1 items-center gap-3.5 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-xs font-extrabold transition select-none ${
                      form.fecha_limite_rsvp_activa
                        ? "border-[#4A4A8A] bg-[#4A4A8A] text-white shadow-sm"
                        : "border-[#DCE0EE] bg-white text-[#14141F] hover:border-[#4A4A8A]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form.fecha_limite_rsvp_activa)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm((prev) => ({
                          ...prev,
                          fecha_limite_rsvp_activa: checked,
                          fecha_limite_rsvp: checked
                            ? prev.fecha_limite_rsvp || prev.fecha_evento || ""
                            : "",
                        }));
                        setError("");
                      }}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-[#FF5B4D]"
                    />
                    <span>⏳ Asignar Fecha Límite de confirmación al Evento</span>
                  </label>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#14141F]">
                      Fecha Límite de Confirmación
                    </label>
                    <input
                      type="date"
                      max={form.fecha_evento || undefined}
                      disabled={!form.fecha_limite_rsvp_activa}
                      value={
                        form.fecha_limite_rsvp_activa
                          ? form.fecha_limite_rsvp || ""
                          : ""
                      }
                      onChange={(e) =>
                        updateField("fecha_limite_rsvp", e.target.value)
                      }
                      className="w-full rounded-xl border border-[#E4E6EE] bg-white px-4 py-2.5 text-sm text-[#14141F] outline-none transition focus:border-[#4A4A8A] disabled:cursor-not-allowed disabled:bg-[#EAECEF] disabled:text-[#8A8D9F] disabled:opacity-60"
                    />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-[#8A8D9F]">
                  {form.fecha_limite_rsvp_activa
                    ? `✓ Activo: Los invitados podrán confirmar su asistencia hasta el ${
                        form.fecha_limite_rsvp || "día seleccionado"
                      }. Pasada esta fecha ya no se permitirá confirmar y se mostrará que la fecha de confirmación ya caducó.`
                    : "Marca el botón «Asignar Fecha Límite de confirmación al Evento» para desbloquear el selector de fecha límite."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: LUGAR, CAPACIDAD Y PRESUPUESTO */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#14141F]">
                2. Ubicación y Aforo
                <span className="hidden">, Aforo y Presupuesto</span>
              </h2>
              <p className="mt-1 text-xs text-[#8A8D9F]">
                Indica dónde se realizará el evento y el número estimado de invitados.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="min-w-0">
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[#14141F]">
                  Estado
                </label>
                <select
                  value={form.estado_evento || "Ningúno"}
                  onChange={(e) => {
                    const nuevoEstado = e.target.value;
                    if (nuevoEstado === "Ningúno") {
                      setForm((prev) => ({
                        ...prev,
                        estado_evento: "Ningúno",
                        municipio: "Ningúno",
                      }));
                    } else {
                      const listaMun =
                        catalogos.municipiosPorEstado?.[nuevoEstado] || [];
                      setForm((prev) => ({
                        ...prev,
                        estado_evento: nuevoEstado,
                        municipio: listaMun[0] || "Ningúno",
                      }));
                    }
                    setError("");
                  }}
                  className="h-[31px] w-full max-w-full truncate rounded-lg border border-[#E4E6EE] bg-[#F6F7F9] px-3 py-1 text-[10px] font-semibold leading-tight text-[#14141F] outline-none transition focus:border-[#4A4A8A] focus:bg-white"
                >
                  <option value="Ningúno" className="text-[10px]">
                    Ningúno
                  </option>
                  {(catalogos.estados || []).map((est) => (
                    <option
                      key={est.key}
                      value={est.nombre}
                      className="text-[10px]"
                    >
                      {est.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[#14141F]">
                  Municipio
                </label>
                <select
                  value={
                    form.estado_evento === "Ningúno"
                      ? "Ningúno"
                      : form.municipio || "Ningúno"
                  }
                  disabled={form.estado_evento === "Ningúno"}
                  onChange={(e) => updateField("municipio", e.target.value)}
                  className="h-[31px] w-full max-w-full truncate rounded-lg border border-[#E4E6EE] bg-[#F6F7F9] px-3 py-1 text-[10px] font-semibold leading-tight text-[#14141F] outline-none transition focus:border-[#4A4A8A] focus:bg-white disabled:cursor-not-allowed disabled:bg-[#F6F7F9]/75 disabled:text-[#14141F]/50"
                >
                  {form.estado_evento === "Ningúno" ? (
                    <option value="Ningúno" className="text-[10px]">
                      Ningúno
                    </option>
                  ) : (
                    (
                      catalogos.municipiosPorEstado?.[form.estado_evento] || []
                    ).map((mun) => (
                      <option key={mun} value={mun} className="text-[10px]">
                        {mun}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Configuración de Ubicación del Evento con Google Maps (mismo bloque que Editor Rápido) */}
              <div className="space-y-3 rounded-2xl border border-[#ECEEF2] bg-[#F6F7F9] p-4 sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4A4A8A]">
                      📍 UBICACIÓN EN LA TARJETA DE INVITACIÓN
                    </span>
                    <h4 className="text-xs font-extrabold text-[#14141F]">
                      Configurar Salón / Dirección con Google Maps
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          setGpsNotice(
                            "Tu navegador no soporta geolocalización."
                          );
                          return;
                        }
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const coords = `${pos.coords.latitude.toFixed(
                              6
                            )}, ${pos.coords.longitude.toFixed(6)}`;
                            updateField("direccion", coords);
                            setGpsNotice(
                              "✓ Coordenadas GPS aplicadas al mapa de la invitación."
                            );
                          },
                          () => {
                            setGpsNotice(
                              "No se pudo obtener el GPS. Escribe la dirección o pega el enlace de Google Maps."
                            );
                          }
                        );
                      }}
                      className="cursor-pointer rounded-lg border border-[#E4E6EE] bg-white px-2.5 py-1 text-[10px] font-bold text-[#14141F] shadow-2xs transition hover:border-[#4A4A8A] hover:text-[#4A4A8A]"
                    >
                      🎯 Usar mi GPS
                    </button>
                    <a
                      href={mapLocation.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[#4A4A8A]/12 px-2.5 py-1 text-[10px] font-bold text-[#4A4A8A] transition hover:bg-[#4A4A8A] hover:text-white"
                    >
                      🗺️ Abrir Google Maps ↗
                    </a>
                  </div>
                </div>

                {gpsNotice && (
                  <p className="text-[11px] font-bold text-[#588B73]">
                    {gpsNotice}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-semibold text-[#8A8D9F]">
                      Nombre del Salón, Jardín o Recinto *
                    </label>
                    <input
                      type="text"
                      value={form.lugar}
                      onChange={(e) => updateField("lugar", e.target.value)}
                      placeholder="Ej. Salón Jardín Imperial / Hacienda Los Morales"
                      className="w-full rounded-xl border border-[#E4E6EE] bg-white px-3 py-2 text-xs text-[#14141F] outline-none focus:border-[#4A4A8A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-extrabold text-[#FF5B4D]">
                      Dirección Exacta, Coordenadas o Enlace de Google Maps
                    </label>
                    <input
                      type="text"
                      value={form.direccion}
                      onChange={(e) => updateField("direccion", e.target.value)}
                      placeholder="Ej. Av. Paseo de la Reforma 500, CDMX o pega el link de Google Maps"
                      className="w-full rounded-xl border border-[#E4E6EE] bg-white px-3 py-2 text-xs font-semibold text-[#14141F] placeholder:font-normal placeholder:text-[#8A8D9F] outline-none focus:border-[#4A4A8A]"
                    />
                  </div>
                </div>

                {/* Mapa Interactivo de Google Maps en Vivo */}
                <div className="overflow-hidden rounded-xl border border-[#E4E6EE] bg-white shadow-2xs">
                  <iframe
                    title="Vista previa de ubicación en Google Maps"
                    src={mapLocation.embedUrl}
                    className="h-44 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4A4A8A]">
                  👥 Número de Invitados Permitidos (Capacidad del Evento)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.capacidad}
                  onChange={(e) => updateField("capacidad", e.target.value)}
                  className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-3 text-sm font-bold text-[#14141F] outline-none transition focus:border-[#4A4A8A] focus:bg-white"
                />
                <p className="mt-1 text-[11px] text-[#8A8D9F]">
                  Puedes modificar este límite en cualquier momento desde la configuración del evento. Si al compartir invitaciones virtuales por WhatsApp o Correo se supera esta cantidad, el sistema te enviará una advertencia.
                </p>
              </div>

              <div className="hidden">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#14141F]">
                  Presupuesto Meta Estimado ($ MXN - Opcional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={form.presupuesto_meta}
                  onChange={(e) =>
                    updateField("presupuesto_meta", e.target.value)
                  }
                  className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-3 text-sm text-[#14141F] outline-none transition focus:border-[#4A4A8A] focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: DISEÑO DE LA INVITACIÓN */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#14141F]">
                3. Estilo y Mensaje de la Invitación
              </h2>
              <p className="mt-1 text-xs text-[#8A8D9F]">
                Elige la plantilla visual y redacta el mensaje para tus invitados.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PLANTILLAS.map((tpl) => {
                const active = form.plantilla_tema === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      updateField("plantilla_tema", tpl.id);
                      updateField("color_acento", tpl.accent);
                    }}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
                      active
                        ? "border-2 border-[#4A4A8A] bg-[#4A4A8A]/10"
                        : "border-[#E4E6EE] bg-[#F6F7F9] hover:border-[#4A4A8A]/40"
                    }`}
                  >
                    <span
                      className="h-6 w-6 rounded-full border border-black/15 shadow-sm"
                      style={{ backgroundColor: tpl.accent }}
                    />
                    <span className="text-xs font-bold text-[#14141F]">
                      {tpl.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#14141F]">
                Mensaje de Invitación
              </label>
              <textarea
                rows={3}
                value={form.mensaje_invitacion}
                onChange={(e) =>
                  updateField("mensaje_invitacion", e.target.value)
                }
                placeholder={`Te invitamos cordialmente a celebrar con nosotros "${
                  form.nombre || "nuestro gran evento"
                }". ¡Tu presencia hará esta noche inolvidable!`}
                className="w-full rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] p-4 text-sm text-[#14141F] placeholder-[#8A8D9F] outline-none transition focus:border-[#4A4A8A] focus:bg-white"
              />
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-3.5 text-xs transition hover:border-[#4A4A8A]">
                <div>
                  <span className="block font-extrabold text-[#14141F]">
                    🎁 ¿Tu evento tendrá Mesa de Regalos?
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#8A8D9F]">
                    Marca esta casilla si deseas agregar el enlace de tu carrito de compras o lista de regalos (Amazon, Mercado Libre, IKEA, Liverpool, etc.).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.mesa_regalos_habilitada)}
                  onChange={(e) =>
                    updateField("mesa_regalos_habilitada", e.target.checked)
                  }
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#4A4A8A]"
                />
              </label>

              {Boolean(form.mesa_regalos_habilitada) && (
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#4A4A8A]/25 bg-[#F6F7F9] p-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-[#14141F]">
                      Tienda del Carrito / Lista
                    </label>
                    <select
                      value={form.mesa_regalos_tienda}
                      onChange={(e) =>
                        updateField("mesa_regalos_tienda", e.target.value)
                      }
                      className="w-full rounded-xl border border-[#E4E6EE] bg-white px-3 py-2.5 text-xs font-semibold text-[#14141F] outline-none focus:border-[#4A4A8A]"
                    >
                      {[
                        "Amazon",
                        "Mercado Libre",
                        "IKEA",
                        "Liverpool",
                        "Palacio de Hierro",
                        "Sears",
                        "Coppel",
                        "Walmart",
                        "Otra tienda",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold text-[#14141F]">
                      Link del Carrito de Compras del Anfitrión (Opcional, puedes agregarlo después)
                    </label>
                    <input
                      type="url"
                      value={form.mesa_regalos_url}
                      onChange={(e) => {
                        const val = e.target.value;
                        const lower = val.toLowerCase();
                        let detected = form.mesa_regalos_tienda;
                        if (lower.includes("amazon.") || lower.includes("amzn."))
                          detected = "Amazon";
                        else if (
                          lower.includes("mercadolibre.") ||
                          lower.includes("meli.")
                        )
                          detected = "Mercado Libre";
                        else if (lower.includes("ikea.")) detected = "IKEA";
                        else if (lower.includes("liverpool."))
                          detected = "Liverpool";
                        else if (lower.includes("elpalaciodehierro."))
                          detected = "Palacio de Hierro";
                        setForm((prev) => ({
                          ...prev,
                          mesa_regalos_url: val,
                          mesa_regalos_tienda: detected,
                        }));
                      }}
                      placeholder="https://www.amazon.com.mx/... o link de tu carrito de Mercado Libre..."
                      className="w-full rounded-xl border border-[#E4E6EE] bg-white px-3 py-2.5 text-xs text-[#14141F] placeholder-[#8A8D9F] outline-none focus:border-[#4A4A8A]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 4: RESUMEN Y VISTA PREVIA */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#14141F]">
                4. Revisión y Vista Previa de tu Evento
              </h2>
              <p className="mt-1 text-xs text-[#8A8D9F]">
                Verifica que los datos sean correctos antes de crear el evento.
              </p>
            </div>

            <div
              className={`rounded-2xl border-2 ${selectedTemplate.border} bg-gradient-to-br ${selectedTemplate.previewBg} p-4 text-white sm:p-8`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className="rounded-lg px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#14141F]"
                  style={{ backgroundColor: selectedTemplate.accent }}
                >
                  {form.tipo_evento}
                </span>
                <span className="text-xs text-gray-300">
                  Código de vestimenta: <strong>{form.codigo_vestimenta}</strong>
                </span>
              </div>

              <h3 className="mt-4 break-words text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {form.nombre}
              </h3>

              <p className="mt-2 break-words text-sm leading-relaxed text-gray-300">
                {form.mensaje_invitacion ||
                  `Te invitamos cordialmente a celebrar con nosotros "${form.nombre}". ¡Tu presencia hará esta noche inolvidable!`}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 text-xs text-gray-300 sm:grid-cols-3">
                <div className="min-w-0">
                  <span className="block text-gray-400">FECHA Y HORA</span>
                  <strong className="text-sm text-[#86B59F]">
                    {form.fecha_evento} • {form.hora_evento} hrs
                  </strong>
                  {form.fecha_limite_rsvp_activa && form.fecha_limite_rsvp && (
                    <span className="mt-1 block text-[11px] font-bold text-amber-300">
                      ⏳ Fecha límite confirmación: {form.fecha_limite_rsvp}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="block text-gray-400">LUGAR</span>
                  <strong className="block break-words text-sm text-white">{form.lugar}</strong>
                  {form.estado_evento && form.estado_evento !== "Ningúno" && (
                    <span className="block break-words text-gray-300">
                      {form.municipio && form.municipio !== "Ningúno"
                        ? `${form.municipio}, ${form.estado_evento}`
                        : form.estado_evento}
                    </span>
                  )}
                  {form.direccion && (
                    <span className="block break-all text-gray-400">{form.direccion}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="block text-gray-400">
                    AFORO ESTIMADO
                    <span className="hidden"> Y PRESUPUESTO</span>
                  </span>
                  <strong className="text-sm text-white">
                    {form.capacidad} invitados
                    <span className="hidden">
                      {" "}
                      • ${Number(form.presupuesto_meta || 0).toLocaleString()}
                    </span>
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación del Wizard */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#ECEEF2] pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-[#E4E6EE] bg-[#F6F7F9] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#14141F] transition hover:border-[#4A4A8A] hover:bg-[#ECEEF5] sm:px-5"
            >
              ← Anterior
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-2xl bg-[#FF5B4D] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_10px_22px_rgba(255,91,77,0.34)] transition hover:bg-[#F24C3E] sm:px-6"
            >
              Siguiente Paso →
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-[#FF5B4D] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_10px_22px_rgba(255,91,77,0.34)] transition hover:bg-[#F24C3E] disabled:opacity-60 sm:px-7"
            >
              {submitting
                ? "Creando Evento..."
                : "✓ Crear Evento e Ir al Gestor"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default WizardCrearEvento;
