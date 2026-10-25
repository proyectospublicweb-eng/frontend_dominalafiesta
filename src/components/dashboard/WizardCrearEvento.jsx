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
    setForm((prev) => ({ ...prev, [field]: value }));
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
      colorClass: "bg-[#4E54A3] shadow-[0_6px_15px_rgba(78,84,163,0.28)]",
    },
    {
      num: 2,
      title: "Lugar y Aforo",
      colorClass: "bg-[#9599D6] shadow-[0_6px_15px_rgba(149,153,214,0.28)]",
    },
    {
      num: 3,
      title: "Diseño de Invitación",
      colorClass: "bg-[#6C7EE1] shadow-[0_6px_15px_rgba(108,126,225,0.28)]",
    },
    {
      num: 4,
      title: "Confirmación",
      colorClass: "bg-[#FF8086] shadow-[0_6px_15px_rgba(255,128,134,0.28)]",
    },
  ];

  const selectedTemplate =
    PLANTILLAS.find((p) => p.id === form.plantilla_tema) || PLANTILLAS[0];
  const mapLocation = useGoogleMapsLocation(form.lugar, form.direccion);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Cabecera del Wizard */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-md bg-[#6C7EE1] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
            Asistente Paso a Paso
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#2D3047] sm:text-4xl">
            ➕ Crear Nuevo Evento
          </h1>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-start rounded-xl border border-[#E2E5F1] bg-white px-4 py-2.5 text-xs font-bold text-[#2D3047] shadow-sm transition hover:bg-gray-50"
          >
            ← Volver a Mis Eventos
          </button>
        )}
      </div>

      {/* Barra de progreso de pasos con colores e insignias estilo imagen de referencia */}
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
              className={`group flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-white transition sm:gap-3 sm:px-4 sm:py-3 ${s.colorClass} ${
                isActive
                  ? "-translate-y-0.5 ring-2 ring-white brightness-105"
                  : "opacity-85 hover:opacity-100"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xs font-extrabold text-white sm:h-8 sm:w-8">
                {isDone ? "✓" : s.num}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
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
        className="rounded-2xl border border-[#E2E5F1] bg-white p-4 shadow-sm sm:p-8"
      >
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* PASO 1: DATOS BÁSICOS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#2D3047]">
                1. Información principal del evento
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Define el nombre, la categoría y cuándo se llevará a cabo la celebración.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Nombre del Evento o Fiesta *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => updateField("nombre", e.target.value)}
                  placeholder="Ej. Gala de Aniversario, Boda de Sofía & Diego..."
                  className="w-full rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] px-4 py-3 text-sm text-[#2D3047] placeholder-gray-400 outline-none transition focus:border-[#6C7EE1] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Tipo de Evento
                </label>
                <select
                  value={form.tipo_evento}
                  onChange={(e) => updateField("tipo_evento", e.target.value)}
                  className="w-full rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] px-4 py-3 text-sm text-[#2D3047] outline-none transition focus:border-[#6C7EE1] focus:bg-white"
                >
                  {TIPOS_EVENTO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Código de Vestimenta
                </label>
                <input
                  type="text"
                  value={form.codigo_vestimenta}
                  onChange={(e) =>
                    updateField("codigo_vestimenta", e.target.value)
                  }
                  placeholder="Ej. Formal / Cóctel, Rigurosa Etiqueta..."
                  className="w-full rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] px-4 py-3 text-sm text-[#2D3047] placeholder-gray-400 outline-none transition focus:border-[#6C7EE1] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Fecha del Evento *
                </label>
                <input
                  type="date"
                  value={form.fecha_evento}
                  onChange={(e) => updateField("fecha_evento", e.target.value)}
                  className="w-full rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] px-4 py-3 text-sm text-[#2D3047] outline-none transition focus:border-[#6C7EE1] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={form.hora_evento}
                  onChange={(e) => updateField("hora_evento", e.target.value)}
                  className="w-full rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] px-4 py-3 text-sm text-[#2D3047] outline-none transition focus:border-[#6C7EE1] focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: LUGAR, CAPACIDAD Y PRESUPUESTO */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#2D3047]">
                2. Ubicación y Aforo
                <span className="hidden">, Aforo y Presupuesto</span>
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Indica dónde se realizará el evento y el número estimado de invitados.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="min-w-0">
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-gray-700">
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
                  className="h-[31px] w-full max-w-full truncate rounded-lg border border-[#E2E5F1] bg-[#f7f8fc] px-3 py-1 text-[10px] font-semibold leading-tight text-[#2D3047] outline-none transition focus:border-[#6C7EE1] focus:bg-[#f7f8fc]"
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
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-gray-700">
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
                  className="h-[31px] w-full max-w-full truncate rounded-lg border border-[#E2E5F1] bg-[#f7f8fc] px-3 py-1 text-[10px] font-semibold leading-tight text-[#2D3047] outline-none transition focus:border-[#6C7EE1] focus:bg-[#f7f8fc] disabled:cursor-not-allowed disabled:bg-[#f7f8fc]/75 disabled:text-[#2D3047]/50"
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
              <div className="space-y-3 rounded-2xl border border-[#DCE0F0] bg-[#F7F8FC] p-4 sm:col-span-2">
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
                      className="cursor-pointer rounded-lg border border-[#DCE0F0] bg-white px-2.5 py-1 text-[10px] font-bold text-[#2D3047] shadow-2xs transition hover:border-[#6C7EE1] hover:text-[#6C7EE1]"
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

                {gpsNotice && (
                  <p className="text-[11px] font-bold text-[#6C7EE1]">
                    {gpsNotice}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-semibold text-[#5B617A]">
                      Nombre del Salón, Jardín o Recinto *
                    </label>
                    <input
                      type="text"
                      value={form.lugar}
                      onChange={(e) => updateField("lugar", e.target.value)}
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
                      value={form.direccion}
                      onChange={(e) => updateField("direccion", e.target.value)}
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
                    className="h-44 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Capacidad Estimada (Invitados)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.capacidad}
                  onChange={(e) => updateField("capacidad", e.target.value)}
                  className="w-full rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] px-4 py-3 text-sm text-[#2D3047] outline-none transition focus:border-[#6C7EE1] focus:bg-white"
                />
              </div>

              <div className="hidden">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
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
                  className="w-full rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] px-4 py-3 text-sm text-[#2D3047] outline-none transition focus:border-[#6C7EE1] focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: DISEÑO DE LA INVITACIÓN */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#2D3047]">
                3. Estilo y Mensaje de la Invitación
              </h2>
              <p className="mt-1 text-xs text-gray-500">
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
                        ? "border-2 border-[#2D3047] bg-[#6C7EE1]/25"
                        : "border-[#E2E5F1] bg-[#F7F8FC] hover:border-gray-300"
                    }`}
                  >
                    <span
                      className="h-6 w-6 rounded-full border border-black/15 shadow-sm"
                      style={{ backgroundColor: tpl.accent }}
                    />
                    <span className="text-xs font-bold text-[#2D3047]">
                      {tpl.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
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
                className="w-full rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] p-4 text-sm text-[#2D3047] placeholder-gray-400 outline-none transition focus:border-[#6C7EE1] focus:bg-white"
              />
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] px-4 py-3.5 text-xs transition hover:border-[#6C7EE1]">
                <div>
                  <span className="block font-extrabold text-[#2D3047]">
                    🎁 ¿Tu evento tendrá Mesa de Regalos?
                  </span>
                  <span className="mt-0.5 block text-[11px] text-gray-500">
                    Marca esta casilla si deseas agregar el enlace de tu carrito de compras o lista de regalos (Amazon, Mercado Libre, IKEA, Liverpool, etc.).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.mesa_regalos_habilitada)}
                  onChange={(e) =>
                    updateField("mesa_regalos_habilitada", e.target.checked)
                  }
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#6C7EE1]"
                />
              </label>

              {Boolean(form.mesa_regalos_habilitada) && (
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#6C7EE1]/30 bg-[#F7F8FC] p-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-[#2D3047]">
                      Tienda del Carrito / Lista
                    </label>
                    <select
                      value={form.mesa_regalos_tienda}
                      onChange={(e) =>
                        updateField("mesa_regalos_tienda", e.target.value)
                      }
                      className="w-full rounded-xl border border-[#E2E5F1] bg-white px-3 py-2.5 text-xs font-semibold text-[#2D3047] outline-none focus:border-[#6C7EE1]"
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
                    <label className="mb-1 block text-[11px] font-bold text-[#2D3047]">
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
                      className="w-full rounded-xl border border-[#E2E5F1] bg-white px-3 py-2.5 text-xs text-[#2D3047] placeholder-gray-400 outline-none focus:border-[#6C7EE1]"
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
              <h2 className="text-xl font-extrabold text-[#2D3047]">
                4. Revisión y Vista Previa de tu Evento
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Verifica que los datos sean correctos antes de crear el evento.
              </p>
            </div>

            <div
              className={`rounded-2xl border-2 ${selectedTemplate.border} bg-gradient-to-br ${selectedTemplate.previewBg} p-4 text-white sm:p-8`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className="rounded-lg px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#2D3047]"
                  style={{ backgroundColor: selectedTemplate.accent }}
                >
                  {form.tipo_evento}
                </span>
                <span className="text-xs text-gray-300">
                  Código de vestimenta: <strong>{form.codigo_vestimenta}</strong>
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {form.nombre}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                {form.mensaje_invitacion ||
                  `Te invitamos cordialmente a celebrar con nosotros "${form.nombre}". ¡Tu presencia hará esta noche inolvidable!`}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 text-xs text-gray-300 sm:grid-cols-3">
                <div>
                  <span className="block text-gray-400">FECHA Y HORA</span>
                  <strong className="text-sm text-[#15B2F5]">
                    {form.fecha_evento} • {form.hora_evento} hrs
                  </strong>
                </div>
                <div>
                  <span className="block text-gray-400">LUGAR</span>
                  <strong className="text-sm text-white">{form.lugar}</strong>
                  {form.estado_evento && form.estado_evento !== "Ningúno" && (
                    <span className="block text-gray-300">
                      {form.municipio && form.municipio !== "Ningúno"
                        ? `${form.municipio}, ${form.estado_evento}`
                        : form.estado_evento}
                    </span>
                  )}
                  {form.direccion && (
                    <span className="block text-gray-400">{form.direccion}</span>
                  )}
                </div>
                <div>
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
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E5F1] pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-[#E2E5F1] bg-[#F7F8FC] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2D3047] transition hover:bg-gray-200 sm:px-5"
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
              className="rounded-xl bg-[#6C7EE1] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#5A6CD0] sm:px-6"
            >
              Siguiente Paso →
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#6C7EE1] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#5A6CD0] disabled:opacity-60 sm:px-7"
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
