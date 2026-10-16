import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  getInvitacionPublicaRequest,
  confirmarRsvpPublicoRequest,
} from "../api/eventos.js";

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

function formatDateInput(val) {
  if (!val) return "";
  return String(val).slice(0, 10);
}

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

  let hash = 2166136261;
  const str = String(text || "EVENTO-VIP");
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      grid[r][c] = (Math.abs(hash) + r + c) % 3 === 0;
    }
  }
  return grid;
}

function InvitacionPublicaPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get("guest") || searchParams.get("pase") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [evento, setEvento] = useState(null);
  const [invitado, setInvitado] = useState(null);

  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    estado_rsvp: "Confirmado",
    adultos: 1,
    ninos: 0,
    nota_alimentacion: "",
  });

  useEffect(() => {
    let active = true;
    async function fetchInvitation() {
      setLoading(true);
      setError("");
      try {
        const { data } = await getInvitacionPublicaRequest(id, guestToken);
        if (!active) return;
        setEvento(data.evento);
        setInvitado(data.invitado);

        const modalidad =
          data.invitado?.modalidad_pase ||
          data.evento?.modalidad_invitados ||
          "Adultos y niños";

        const defaultAdultos =
          modalidad === "Solo niños"
            ? 0
            : data.invitado?.adultos !== undefined
            ? Number(data.invitado.adultos)
            : 1;
        const defaultNinos =
          modalidad === "Solo adultos"
            ? 0
            : data.invitado?.ninos !== undefined
            ? Number(data.invitado.ninos)
            : modalidad === "Solo niños"
            ? 1
            : 0;

        setForm({
          nombre: data.invitado?.nombre || "",
          telefono: data.invitado?.telefono || "",
          correo: data.invitado?.correo || "",
          estado_rsvp:
            data.invitado?.estado_rsvp === "Rechazado"
              ? "Rechazado"
              : "Confirmado",
          adultos: defaultAdultos,
          ninos: defaultNinos,
          nota_alimentacion: data.invitado?.nota_alimentacion || "",
        });
      } catch (err) {
        if (!active) return;
        setError(
          err.response?.data?.message ||
            "No se pudo cargar la invitación de este evento."
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchInvitation();
    return () => {
      active = false;
    };
  }, [id, guestToken]);

  const qrMatrix = useMemo(
    () =>
      buildQrMatrix(
        `${evento?.idevento || ""}-${
          invitado?.token_invitacion || form.nombre || "VIP"
        }`
      ),
    [evento?.idevento, invitado?.token_invitacion, form.nombre]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508] p-6 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#00f0ff] border-t-transparent" />
          <p className="mt-4 text-sm text-gray-400">
            Abriendo tu invitación digital...
          </p>
        </div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508] p-6 text-white">
        <div className="max-w-md rounded-2xl border border-rose-500/30 bg-[#0b0d14] p-8 text-center">
          <span className="text-4xl">🎟️</span>
          <h1 className="mt-3 text-xl font-bold text-white">
            Invitación no disponible
          </h1>
          <p className="mt-2 text-xs text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const tpl =
    PLANTILLAS.find((p) => p.id === evento.plantilla_tema) || PLANTILLAS[0];
  const fechaStr = formatDateInput(evento.fecha_evento);
  const diasParaEvento = Math.max(
    0,
    Math.ceil(
      (new Date(`${fechaStr}T00:00:00`).getTime() - Date.now()) / 86400000
    )
  );
  const modalidadEvento =
    invitado?.modalidad_pase || evento.modalidad_invitados || "Adultos y niños";
  const soloAdultos = modalidadEvento === "Solo adultos";
  const soloNinos = modalidadEvento === "Solo niños";

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setSubmitting(true);
    setFeedbackMsg("");
    try {
      const { data } = await confirmarRsvpPublicoRequest(evento.idevento, {
        guestToken: invitado?.token_invitacion || guestToken,
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim(),
        estado_rsvp: form.estado_rsvp,
        adultos: soloNinos ? 0 : Number(form.adultos || 0),
        ninos: soloAdultos ? 0 : Number(form.ninos || 0),
        nota_alimentacion: form.nota_alimentacion.trim(),
      });
      setInvitado(data.invitado);
      setFeedbackMsg(data.message);
      setShowRsvpForm(false);
    } catch (err) {
      setFeedbackMsg(
        err.response?.data?.message ||
          "Ocurrió un error al registrar tu confirmación."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-10 text-white">
      <div className="mx-auto max-w-md">
        {/* Tarjeta Principal de Invitación Virtual */}
        <div
          className={`overflow-hidden rounded-[2.2rem] border bg-gradient-to-b shadow-[0_0_60px_rgba(0,0,0,0.9)] ${tpl.bg} ${tpl.border}`}
        >
          {evento.imagen_portada && (
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={evento.imagen_portada}
                alt={evento.nombre}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06070b] via-black/30 to-transparent" />
            </div>
          )}

          <div className="p-6 text-center">
            <span
              className="inline-block rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow"
              style={{
                backgroundColor: evento.color_acento || tpl.accent,
              }}
            >
              {evento.tipo_evento || "Evento Exclusivo"}
            </span>

            {invitado && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-200">
                🎟️ Pase Personal para:{" "}
                <strong className="text-[#00f0ff]">{invitado.nombre}</strong>
              </div>
            )}

            <h1 className="font-display mt-3 text-4xl font-bold uppercase tracking-wide text-white">
              {evento.nombre}
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-gray-300">
              {evento.mensaje_invitacion ||
                `Estás cordialmente invitado(a) a celebrar con nosotros ${evento.nombre}. ¡Tu presencia hará esta noche inolvidable!`}
            </p>

            {/* Contador de Días, Hora y Tipo de Pase */}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/50 p-3 text-center">
              <div>
                <span className="block text-xl font-bold text-white">
                  {diasParaEvento}
                </span>
                <span className="text-[10px] uppercase text-gray-400">
                  Días
                </span>
              </div>
              <div>
                <span className="block text-xl font-bold text-white">
                  {evento.hora_evento || "20:00"}
                </span>
                <span className="text-[10px] uppercase text-gray-400">
                  Hora
                </span>
              </div>
              <div>
                <span className="block text-xl font-bold text-[#00f0ff]">
                  {invitado?.grupo || "VIP"}
                </span>
                <span className="text-[10px] uppercase text-gray-400">
                  Pase
                </span>
              </div>
            </div>

            {/* Datos de Fecha, Lugar y Dress Code */}
            <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4 text-left text-xs text-gray-200">
              <p>
                📅 <strong>Fecha:</strong> {fechaStr}
              </p>
              <p>
                📍 <strong>Lugar:</strong> {evento.lugar || "Por confirmar"}
              </p>
              <p>
                👔 <strong>Dress Code:</strong>{" "}
                {evento.codigo_vestimenta || "Formal / Libre"}
              </p>
            </div>

            {/* Notificación de Modalidad de Asistencia */}
            <div className="mt-4 rounded-2xl border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-4 py-3 text-center shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
                🔔 MODALIDAD DE ASISTENCIA
              </span>
              <strong className="mt-0.5 block text-sm font-bold uppercase tracking-wider text-white">
                🎟️ {modalidadEvento}
              </strong>
            </div>

            {/* Mensaje de confirmación tras enviar formulario */}
            {feedbackMsg && (
              <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-3.5 text-xs font-semibold text-emerald-200">
                ✓ {feedbackMsg}
              </div>
            )}

            {/* Si el invitado ya confirmó su asistencia, mostramos su Pase Digital con QR */}
            {invitado && invitado.estado_rsvp === "Confirmado" && !showRsvpForm ? (
              <div className="mt-5 rounded-2xl border border-emerald-500/40 bg-[#07090f]/90 p-5 text-center">
                <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  🟢 ASISTENCIA CONFIRMADA
                </span>
                <p className="mt-2 text-sm font-bold text-white">
                  {invitado.nombre}
                </p>
                <p className="text-xs text-gray-400">
                  Pases confirmados:{" "}
                  <strong className="text-[#00f0ff]">{invitado.pases}</strong> (
                  {invitado.adultos} adultos, {invitado.ninos} niños) • Mesa:{" "}
                  <strong className="text-white">
                    {invitado.mesa_asignada || "Por asignar"}
                  </strong>
                </p>

                {/* Código QR del Pase del Invitado */}
                <div className="mx-auto mt-4 inline-block rounded-2xl bg-white p-3 shadow-lg">
                  <svg
                    viewBox="0 0 21 21"
                    className="h-32 w-32"
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
                <p className="mt-2 font-mono text-[11px] font-bold text-[#00f0ff]">
                  TOKEN: {invitado.token_invitacion}
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Presenta este código QR en la entrada del evento.
                </p>

                <button
                  type="button"
                  onClick={() => setShowRsvpForm(true)}
                  className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-gray-300 transition hover:border-white/30 hover:text-white"
                >
                  ✏️ Modificar mi respuesta o datos
                </button>
              </div>
            ) : invitado && invitado.estado_rsvp === "Rechazado" && !showRsvpForm ? (
              <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
                <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-[10px] font-bold uppercase text-rose-300">
                  🔴 NO PODRÁ ASISTIR
                </span>
                <p className="mt-2 text-xs text-gray-300">
                  Has notificado que no podrás asistir a este evento.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRsvpForm(true)}
                  className="mt-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  Cambiar mi respuesta a Confirmado
                </button>
              </div>
            ) : null}

            {/* Botón principal "CONFIRMAR ASISTENCIA" */}
            {!showRsvpForm &&
              (!invitado || invitado.estado_rsvp === "Pendiente") && (
                <button
                  type="button"
                  disabled={!evento.rsvp_habilitado}
                  onClick={() => setShowRsvpForm(true)}
                  className="mt-5 w-full cursor-pointer rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor: evento.color_secundario || tpl.secondary,
                  }}
                >
                  {evento.rsvp_habilitado
                    ? evento.texto_boton_rsvp || "CONFIRMAR ASISTENCIA"
                    : "CONFIRMACIONES CERRADAS"}
                </button>
              )}

            {/* Formulario desplegable de Confirmación de Asistencia (RSVP) */}
            {showRsvpForm && (
              <form
                onSubmit={handleConfirmSubmit}
                className="mt-5 space-y-3.5 rounded-2xl border border-[#00f0ff]/40 bg-[#07080d]/95 p-5 text-left shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#00f0ff]">
                    📋 Confirmar Asistencia (RSVP)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowRsvpForm(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    ✕ Cerrar
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    ¿Asistirás al evento?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, estado_rsvp: "Confirmado" }))
                      }
                      className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                        form.estado_rsvp === "Confirmado"
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-black/40 text-gray-400 hover:text-white"
                      }`}
                    >
                      🟢 Sí, asistiré
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, estado_rsvp: "Rechazado" }))
                      }
                      className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                        form.estado_rsvp === "Rechazado"
                          ? "border-rose-400 bg-rose-500/20 text-rose-300"
                          : "border-white/10 bg-black/40 text-gray-400 hover:text-white"
                      }`}
                    >
                      🔴 No podré asistir
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, nombre: e.target.value }))
                    }
                    placeholder="Ej. Ana García"
                    className="w-full rounded-xl border border-white/15 bg-[#0b0d14] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-300">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={form.telefono}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, telefono: e.target.value }))
                      }
                      placeholder="+52 55..."
                      className="w-full rounded-xl border border-white/15 bg-[#0b0d14] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-300">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={form.correo}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, correo: e.target.value }))
                      }
                      placeholder="correo@ejemplo.com"
                      className="w-full rounded-xl border border-white/15 bg-[#0b0d14] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                </div>

                {form.estado_rsvp === "Confirmado" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-300">
                          Adultos {soloNinos && "(No aplica)"}
                        </label>
                        <input
                          type="number"
                          min={soloNinos ? 0 : 1}
                          max={15}
                          disabled={soloNinos}
                          value={soloNinos ? 0 : form.adultos}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              adultos: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/15 bg-[#0b0d14] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00f0ff] disabled:opacity-40"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-300">
                          Niños {soloAdultos && "(Solo adultos)"}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={15}
                          disabled={soloAdultos}
                          value={soloAdultos ? 0 : form.ninos}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              ninos: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/15 bg-[#0b0d14] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00f0ff] disabled:opacity-40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-300">
                        Restricción alimentaria o nota para el anfitrión
                      </label>
                      <input
                        type="text"
                        value={form.nota_alimentacion}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            nota_alimentacion: e.target.value,
                          }))
                        }
                        placeholder="Ej. Vegetariano, sin gluten, ¡felicidades!"
                        className="w-full rounded-xl border border-white/15 bg-[#0b0d14] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00f0ff]"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full cursor-pointer rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition hover:brightness-110 disabled:opacity-50"
                  style={{
                    backgroundColor: evento.color_secundario || tpl.secondary,
                  }}
                >
                  {submitting
                    ? "Guardando respuesta..."
                    : "✓ Enviar mi Confirmación"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvitacionPublicaPage;

