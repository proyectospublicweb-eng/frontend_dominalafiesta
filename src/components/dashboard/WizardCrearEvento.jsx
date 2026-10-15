import { useState } from "react";

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
    name: "Carmesí Neón",
    accent: "#ff1e38",
    previewBg: "from-[#1a070b] via-[#0b0d14] to-[#07080d]",
    border: "border-[#ff1e38]",
  },
  {
    id: "cyber-cyan",
    name: "Cian Eléctrico",
    accent: "#00f0ff",
    previewBg: "from-[#06181c] via-[#0b0d14] to-[#07080d]",
    border: "border-[#00f0ff]",
  },
  {
    id: "gold-gala",
    name: "Gala Dorada VIP",
    accent: "#f59e0b",
    previewBg: "from-[#1c1506] via-[#0b0d14] to-[#07080d]",
    border: "border-amber-400",
  },
  {
    id: "midnight-vip",
    name: "Medianoche Violeta",
    accent: "#a855f7",
    previewBg: "from-[#150821] via-[#0b0d14] to-[#07080d]",
    border: "border-purple-500",
  },
];

function WizardCrearEvento({ onCreateEvento, onCancel }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    nombre: "",
    tipo_evento: "Fiesta Privada",
    fecha_evento: tomorrow,
    hora_evento: "20:00",
    lugar: "",
    direccion: "",
    capacidad: 100,
    presupuesto_meta: 25000,
    codigo_vestimenta: "Formal / Cóctel",
    plantilla_tema: "neon-crimson",
    color_acento: "#ff1e38",
    mensaje_invitacion: "",
  });

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
      await onCreateEvento({
        ...form,
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
    { num: 1, title: "Datos Básicos" },
    { num: 2, title: "Lugar y Aforo" },
    { num: 3, title: "Diseño de Invitación" },
    { num: 4, title: "Confirmación" },
  ];

  const selectedTemplate =
    PLANTILLAS.find((p) => p.id === form.plantilla_tema) || PLANTILLAS[0];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Cabecera del Wizard */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#ff1e38]">
            ASISTENTE PASO A PASO
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white sm:text-4xl">
            ➕ CREAR NUEVO EVENTO
          </h1>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-start rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:border-white/30 hover:text-white"
          >
            ← Volver a Mis Eventos
          </button>
        )}
      </div>

      {/* Barra de progreso de pasos */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                isActive
                  ? "border-[#ff1e38] bg-[#ff1e38]/15 shadow-[0_0_20px_rgba(255,30,56,0.2)]"
                  : isDone
                  ? "border-[#00f0ff]/40 bg-[#00f0ff]/10 text-white"
                  : "border-white/10 bg-[#0b0d14] text-gray-500"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-[#ff1e38] text-white"
                    : isDone
                    ? "bg-[#00f0ff] text-gray-950"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {isDone ? "✓" : s.num}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Paso {s.num}
                </p>
                <p className="truncate text-xs font-semibold text-white">
                  {s.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Contenedor del paso actual */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6 shadow-2xl sm:p-8"
      >
        {error && (
          <div className="mb-6 rounded-xl border border-[#ff1e38]/40 bg-[#ff1e38]/10 px-4 py-3 text-sm text-[#ff4d63]">
            {error}
          </div>
        )}

        {/* PASO 1: DATOS BÁSICOS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                1. Información principal del evento
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Define el nombre, la categoría y cuándo se llevará a cabo la celebración.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Nombre del Evento o Fiesta *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => updateField("nombre", e.target.value)}
                  placeholder="Ej. Gala Neón de Aniversario, Boda de Sofía & Diego..."
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#ff1e38]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Tipo de Evento
                </label>
                <select
                  value={form.tipo_evento}
                  onChange={(e) => updateField("tipo_evento", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#ff1e38]"
                >
                  {TIPOS_EVENTO.map((t) => (
                    <option key={t} value={t} className="bg-[#0b0d14]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Código de Vestimenta
                </label>
                <input
                  type="text"
                  value={form.codigo_vestimenta}
                  onChange={(e) =>
                    updateField("codigo_vestimenta", e.target.value)
                  }
                  placeholder="Ej. Formal / Cóctel, Rigurosa Etiqueta, Blanco & Neón..."
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#ff1e38]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Fecha del Evento *
                </label>
                <input
                  type="date"
                  value={form.fecha_evento}
                  onChange={(e) => updateField("fecha_evento", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#ff1e38]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={form.hora_evento}
                  onChange={(e) => updateField("hora_evento", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#ff1e38]"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: LUGAR, CAPACIDAD Y PRESUPUESTO */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                2. Ubicación, Aforo y Presupuesto
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Indica dónde se realizará el evento y el número estimado de invitados.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Nombre del Salón / Jardín / Recinto *
                </label>
                <input
                  type="text"
                  value={form.lugar}
                  onChange={(e) => updateField("lugar", e.target.value)}
                  placeholder="Ej. Terraza Nexus VIP, Gran Salón Imperial..."
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#ff1e38]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => updateField("direccion", e.target.value)}
                  placeholder="Calle, número, colonia y ciudad"
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#ff1e38]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Capacidad Estimada (Invitados)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.capacidad}
                  onChange={(e) => updateField("capacidad", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#ff1e38]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
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
                  className="w-full rounded-xl border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#ff1e38]"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: DISEÑO DE LA INVITACIÓN */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                3. Estilo y Mensaje de la Invitación
              </h2>
              <p className="mt-1 text-xs text-gray-400">
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
                        ? "border-2 border-[#ff1e38] bg-white/10"
                        : "border-white/10 bg-[#07080d] hover:border-white/30"
                    }`}
                  >
                    <span
                      className="h-6 w-6 rounded-full shadow-lg"
                      style={{ backgroundColor: tpl.accent }}
                    />
                    <span className="text-xs font-semibold text-white">
                      {tpl.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
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
                className="w-full rounded-xl border border-white/15 bg-[#07080d] p-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#ff1e38]"
              />
            </div>
          </div>
        )}

        {/* PASO 4: RESUMEN Y VISTA PREVIA */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                4. Revisión y Vista Previa de tu Evento
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Verifica que los datos sean correctos antes de crear el evento.
              </p>
            </div>

            <div
              className={`rounded-2xl border-2 ${selectedTemplate.border} bg-gradient-to-br ${selectedTemplate.previewBg} p-6 sm:p-8`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: selectedTemplate.accent }}
                >
                  {form.tipo_evento}
                </span>
                <span className="text-xs text-gray-300">
                  Código de vestimenta: <strong>{form.codigo_vestimenta}</strong>
                </span>
              </div>

              <h3 className="font-display mt-4 text-4xl font-bold uppercase tracking-wide text-white">
                {form.nombre}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                {form.mensaje_invitacion ||
                  `Te invitamos cordialmente a celebrar con nosotros "${form.nombre}". ¡Tu presencia hará esta noche inolvidable!`}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 text-xs text-gray-300 sm:grid-cols-3">
                <div>
                  <span className="block text-gray-500">FECHA Y HORA</span>
                  <strong className="text-sm text-white">
                    {form.fecha_evento} • {form.hora_evento} hrs
                  </strong>
                </div>
                <div>
                  <span className="block text-gray-500">LUGAR</span>
                  <strong className="text-sm text-white">{form.lugar}</strong>
                  {form.direccion && (
                    <span className="block text-gray-400">{form.direccion}</span>
                  )}
                </div>
                <div>
                  <span className="block text-gray-500">AFORO Y PRESUPUESTO</span>
                  <strong className="text-sm text-white">
                    {form.capacidad} invitados • $
                    {Number(form.presupuesto_meta || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación del Wizard */}
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-300 transition hover:bg-white/10 hover:text-white"
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
              className="btn-glow-red rounded-xl bg-[#ff1e38] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#ff334b]"
            >
              Siguiente Paso →
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="btn-glow-red rounded-xl bg-[#ff1e38] px-7 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#ff334b] disabled:opacity-60"
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

