import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  getInvitacionPublicaRequest,
  confirmarRsvpPublicoRequest,
} from "../api/eventos.js";

const PLANTILLAS = [
  {
    id: "neon-crimson",
    name: "Azul Celeste Pro",
    accent: "#15b2f5",
    secondary: "#15b2f5",
    bg: "from-[#142257] via-[#1B2D6E] to-[#171F39]",
    border: "border-[#15B2F5]",
  },
  {
    id: "cyber-cyan",
    name: "Esmeralda VIP",
    accent: "#10b981",
    secondary: "#15b2f5",
    bg: "from-[#062419] via-[#171F39] to-[#121316]",
    border: "border-emerald-400",
  },
  {
    id: "gold-gala",
    name: "Gala Dorada VIP",
    accent: "#f59e0b",
    secondary: "#fde68a",
    bg: "from-[#221706] via-[#171F39] to-[#121316]",
    border: "border-amber-400",
  },
  {
    id: "midnight-vip",
    name: "Carbón Minimal",
    accent: "#84cc16",
    secondary: "#15b2f5",
    bg: "from-[#142257] via-[#171F39] to-[#0B1336]",
    border: "border-lime-400",
  },
];

function formatDateInput(val) {
  if (!val) return "";
  return String(val).slice(0, 10);
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

  return { embedUrl, externalUrl };
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
  const { id: rawId } = useParams();
  const id = String(rawId || "").replace(/^e/i, "");
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get("guest") || searchParams.get("pase") || "";
  const urlMod = (searchParams.get("mod") || "").trim();
  const urlAdultos = Math.max(
    0,
    parseInt(searchParams.get("adultos") || "0", 10) || 0
  );
  const urlNinos = Math.max(
    0,
    parseInt(searchParams.get("ninos") || "0", 10) || 0
  );

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
        if (data.evento?.nombre) {
          document.title = data.invitado?.nombre
            ? `✨ Invitación para ${data.invitado.nombre} — ${data.evento.nombre}`
            : `✨ ${data.evento.nombre} — ${
                data.evento.tipo_evento || "Invitación Digital"
              }`;
        }

        const modalidad =
          urlMod ||
          data.invitado?.modalidad_pase ||
          data.evento?.modalidad_invitados ||
          "Adultos y Niños";
        const modLower = String(modalidad).trim().toLowerCase();

        const defaultAdultos =
          modLower === "solo niños"
            ? 0
            : urlAdultos > 0
            ? urlAdultos
            : data.invitado?.adultos !== undefined
            ? Number(data.invitado.adultos)
            : 1;
        const defaultNinos =
          modLower === "solo adultos"
            ? 0
            : urlNinos > 0
            ? urlNinos
            : data.invitado?.ninos !== undefined
            ? Number(data.invitado.ninos)
            : modLower === "solo niños"
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
  }, [id, guestToken, urlMod, urlAdultos, urlNinos]);

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
      <div className="flex min-h-screen items-center justify-center bg-[#F3F6FA] p-6 text-[#171F39]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-[#142257] border-t-[#15B2F5]" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Abriendo tu invitación digital...
          </p>
        </div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F6FA] p-6 text-[#171F39]">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <span className="text-4xl">🎟️</span>
          <h1 className="mt-3 text-xl font-extrabold text-[#171F39]">
            Invitación no disponible
          </h1>
          <p className="mt-2 text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const tpl =
    PLANTILLAS.find((p) => p.id === evento.plantilla_tema) || PLANTILLAS[0];
  const mapLocation = getGoogleMapsUrls(evento.lugar, evento.direccion);
  const fechaStr = formatDateInput(evento.fecha_evento);
  const diasParaEvento = Math.max(
    0,
    Math.ceil(
      (new Date(`${fechaStr}T00:00:00`).getTime() - Date.now()) / 86400000
    )
  );
  const modalidadEvento =
    urlMod ||
    invitado?.modalidad_pase ||
    evento.modalidad_invitados ||
    "Adultos y Niños";
  const modEventoLower = String(modalidadEvento).trim().toLowerCase();
  const soloAdultos = modEventoLower === "solo adultos";
  const soloNinos = modEventoLower === "solo niños";
  const adultosLockedByLink = !soloNinos && urlAdultos > 0;
  const ninosLockedByLink = !soloAdultos && urlNinos > 0;

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
        modalidad_pase: modalidadEvento,
        adultos: soloNinos
          ? 0
          : adultosLockedByLink
          ? urlAdultos
          : Number(form.adultos || 0),
        ninos: soloAdultos
          ? 0
          : ninosLockedByLink
          ? urlNinos
          : Number(form.ninos || 0),
        nota_alimentacion: form.nota_alimentacion.trim(),
      });
      if (data.evento) {
        setEvento(data.evento);
      }
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
    <div className="min-h-screen bg-[#F3F6FA] px-3 py-6 text-white sm:px-4 sm:py-10">
      <div className="mx-auto max-w-md">
        {/* Tarjeta Principal de Invitación Virtual */}
        <div
          className={`overflow-hidden rounded-[1.8rem] border-2 bg-gradient-to-b shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:rounded-[2.2rem] ${tpl.bg} ${tpl.border}`}
        >
          {evento.imagen_portada && (
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={evento.imagen_portada}
                alt={evento.nombre}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171F39] via-black/30 to-transparent" />
            </div>
          )}

          <div className="p-4 text-center sm:p-6">
            <span
              className="inline-block rounded-lg px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#171F39] shadow"
              style={{
                backgroundColor:
                  evento.color_acento === "#ff1e38"
                    ? "#15b2f5"
                    : evento.color_acento || tpl.accent,
              }}
            >
              {evento.tipo_evento || "Evento Exclusivo"}
            </span>

            {invitado && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-gray-200">
                🎟️ Pase Personal para:{" "}
                <strong className="text-[#15B2F5]">{invitado.nombre}</strong>
              </div>
            )}

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {evento.nombre}
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-gray-300">
              {evento.mensaje_invitacion ||
                `Estás cordialmente invitado(a) a celebrar con nosotros ${evento.nombre}. ¡Tu presencia hará esta noche inolvidable!`}
            </p>

            {/* Contador de Días, Hora y Tipo de Pase */}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/35 p-3 text-center">
              <div>
                <span className="block text-xl font-extrabold text-white">
                  {diasParaEvento}
                </span>
                <span className="text-[10px] uppercase text-gray-400">
                  Días
                </span>
              </div>
              <div>
                <span className="block text-xl font-extrabold text-white">
                  {evento.hora_evento || "20:00"}
                </span>
                <span className="text-[10px] uppercase text-gray-400">
                  Hora
                </span>
              </div>
              <div>
                <span className="block text-xl font-extrabold text-[#15B2F5]">
                  {invitado?.grupo || "VIP"}
                </span>
                <span className="text-[10px] uppercase text-gray-400">
                  Pase
                </span>
              </div>
            </div>

            {/* Datos de Fecha, Lugar y Código de Vestimenta */}
            <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-left text-xs text-gray-200">
              <p>
                📅 <strong>Fecha:</strong> {fechaStr}
              </p>
              <p>
                📍 <strong>Lugar:</strong> {evento.lugar || "Por confirmar"}
              </p>
              {evento.direccion && (
                <p>
                  🗺️ <strong>Dirección:</strong> {evento.direccion}
                </p>
              )}
              <p>
                👔 <strong>Código de Vestimenta:</strong>{" "}
                {evento.codigo_vestimenta || "Formal / Libre"}
              </p>
            </div>

            {/* Mapa Interactivo de Ubicación del Evento en la Tarjeta de Invitación */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-black/35 text-left">
              <iframe
                title="Mapa de ubicación del evento"
                src={mapLocation.embedUrl}
                className="h-40 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex flex-col gap-1.5 px-3.5 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <span className="truncate font-semibold text-gray-200">
                  📍 {evento.lugar || "Ubicación del Evento"}
                </span>
                <a
                  href={mapLocation.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-extrabold text-[#15B2F5] hover:underline"
                >
                  🗺️ Cómo llegar en Google Maps ↗
                </a>
              </div>
            </div>

            {/* Notificación de Modalidad de Asistencia */}
            <div className="mt-4 rounded-2xl border border-[#15B2F5]/40 bg-[#15B2F5]/15 px-4 py-3 text-center">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#15B2F5]">
                🔔 MODALIDAD DE ASISTENCIA
              </span>
              <strong className="mt-0.5 block text-sm font-extrabold uppercase tracking-wider text-white">
                🎟️ {modalidadEvento}
              </strong>
              {(adultosLockedByLink || ninosLockedByLink) && (
                <p className="mt-1 text-[11px] font-semibold text-gray-200">
                  Pases incluidos en esta invitación:{" "}
                  {!soloNinos && (
                    <span className="text-[#15B2F5]">
                      {adultosLockedByLink
                        ? `${urlAdultos} Adulto(s)`
                        : "Adultos libre"}
                    </span>
                  )}
                  {!soloNinos && !soloAdultos && " • "}
                  {!soloAdultos && (
                    <span className="text-[#15B2F5]">
                      {ninosLockedByLink
                        ? `${urlNinos} Niño(s)`
                        : "Niños libre"}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Mensaje de confirmación tras enviar formulario */}
            {feedbackMsg && (
              <div className="mt-4 rounded-2xl border border-[#15B2F5]/40 bg-[#15B2F5]/20 p-3.5 text-xs font-bold text-[#15B2F5]">
                ✓ {feedbackMsg}
              </div>
            )}

            {/* Si el invitado ya confirmó su asistencia, mostramos su Pase Digital con QR */}
            {invitado && invitado.estado_rsvp === "Confirmado" && !showRsvpForm ? (
              <div className="mt-5 rounded-2xl border border-[#15B2F5]/40 bg-[#0F1A45] p-5 text-center">
                <span className="inline-block rounded-lg bg-[#15B2F5] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
                  🟢 ASISTENCIA CONFIRMADA
                </span>
                <p className="mt-2 text-sm font-extrabold text-white">
                  {invitado.nombre}
                </p>
                <p className="text-xs text-gray-400">
                  Pases confirmados:{" "}
                  <strong className="text-[#15B2F5]">{invitado.pases}</strong> (
                  {invitado.adultos} adultos, {invitado.ninos} niños) • Mesa:{" "}
                  <strong className="text-white">
                    {invitado.mesa_asignada || "Por asignar"}
                  </strong>
                </p>

                {/* Código QR del Pase del Invitado (condicional según "¿Confirmar Acceso el día del evento?") */}
                {Boolean(
                  evento.confirmar_acceso_qr ??
                    evento.permitir_acompanantes ??
                    true
                ) && (
                  <>
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
                                fill="#171F39"
                              />
                            ) : null
                          )
                        )}
                      </svg>
                    </div>
                    <p className="mt-2 font-mono text-[11px] font-extrabold text-[#15B2F5]">
                      TOKEN: {invitado.token_invitacion}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      Presenta este código QR en la entrada del evento.
                    </p>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setShowRsvpForm(true)}
                  className="mt-4 w-full rounded-xl border border-white/15 bg-white/10 py-2 text-[11px] font-bold text-gray-200 transition hover:bg-white/20"
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
                  className="mt-5 w-full cursor-pointer rounded-xl bg-[#15B2F5] py-3.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#0E9DE0] disabled:cursor-not-allowed disabled:opacity-50"
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
                className="mt-5 space-y-3.5 rounded-2xl border border-[#15B2F5]/40 bg-[#0F1A45] p-5 text-left shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-[#15B2F5]">
                    📋 Confirmar Asistencia
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
                      className={`rounded-xl border py-2.5 text-xs font-extrabold transition ${
                        form.estado_rsvp === "Confirmado"
                          ? "border-[#15B2F5] bg-[#15B2F5] text-white"
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
                      className={`rounded-xl border py-2.5 text-xs font-extrabold transition ${
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
                    className="w-full rounded-xl border border-white/15 bg-[#142257] px-3.5 py-2 text-xs text-white outline-none focus:border-[#15B2F5]"
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
                      className="w-full rounded-xl border border-white/15 bg-[#142257] px-3.5 py-2 text-xs text-white outline-none focus:border-[#15B2F5]"
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
                      className="w-full rounded-xl border border-white/15 bg-[#142257] px-3.5 py-2 text-xs text-white outline-none focus:border-[#15B2F5]"
                    />
                  </div>
                </div>

                {form.estado_rsvp === "Confirmado" && (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 flex flex-wrap items-center justify-between gap-1 text-xs font-semibold text-gray-300">
                          <span>Adultos</span>
                          {soloNinos ? (
                            <span className="text-[10px] font-bold text-gray-400">
                              (No aplica)
                            </span>
                          ) : adultosLockedByLink ? (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                              🔒 Bloqueado ({urlAdultos})
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-[#15B2F5]">
                              🔓 Libre
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          min={soloNinos ? 0 : 1}
                          max={25}
                          disabled={soloNinos || adultosLockedByLink}
                          value={
                            soloNinos
                              ? 0
                              : adultosLockedByLink
                              ? urlAdultos
                              : form.adultos
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              adultos: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/15 bg-[#142257] px-3.5 py-2 text-xs text-white outline-none focus:border-[#15B2F5] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 flex flex-wrap items-center justify-between gap-1 text-xs font-semibold text-gray-300">
                          <span>Niños</span>
                          {soloAdultos ? (
                            <span className="text-[10px] font-bold text-gray-400">
                              (Solo adultos)
                            </span>
                          ) : ninosLockedByLink ? (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                              🔒 Bloqueado ({urlNinos})
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-[#15B2F5]">
                              🔓 Libre
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={25}
                          disabled={soloAdultos || ninosLockedByLink}
                          value={
                            soloAdultos
                              ? 0
                              : ninosLockedByLink
                              ? urlNinos
                              : form.ninos
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              ninos: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/15 bg-[#142257] px-3.5 py-2 text-xs text-white outline-none focus:border-[#15B2F5] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                    {(adultosLockedByLink || ninosLockedByLink) && (
                      <p className="text-[11px] text-amber-200/90">
                        🔒 Los campos con candado tienen el número de pases preasignado por el organizador.
                      </p>
                    )}

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
                        className="w-full rounded-xl border border-white/15 bg-[#142257] px-3.5 py-2 text-xs text-white outline-none focus:border-[#15B2F5]"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full cursor-pointer rounded-xl bg-[#15B2F5] py-3 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#0E9DE0] disabled:opacity-50"
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
