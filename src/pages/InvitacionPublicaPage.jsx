import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthModal from "../components/AuthModal.jsx";
import {
  getInvitacionPublicaRequest,
  confirmarRsvpPublicoRequest,
} from "../api/eventos.js";
import { useGoogleMapsLocation } from "../utils/googleMaps.js";

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

function getTiendaMetaPublic(tienda) {
  const t = String(tienda || "").toLowerCase();
  if (t.includes("amazon")) {
    return {
      icon: "📦",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    };
  }
  if (t.includes("mercado")) {
    return {
      icon: "🤝",
      badgeClass: "bg-yellow-400/20 text-yellow-200 border-yellow-400/40",
    };
  }
  if (t.includes("ikea")) {
    return {
      icon: "🛋️",
      badgeClass: "bg-sky-500/20 text-sky-200 border-sky-400/40",
    };
  }
  if (t.includes("liverpool")) {
    return {
      icon: "🛍️",
      badgeClass: "bg-pink-500/20 text-pink-200 border-pink-400/40",
    };
  }
  if (t.includes("palacio")) {
    return {
      icon: "✨",
      badgeClass: "bg-amber-400/20 text-amber-200 border-amber-300/40",
    };
  }
  return {
    icon: "🎁",
    badgeClass: "bg-[#15B2F5]/20 text-[#15B2F5] border-[#15B2F5]/40",
  };
}

function parsePublicGiftItem(item) {
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
  return {
    iditem: item.iditem,
    tienda: parsed.tienda || item.estado || "Tienda Externa",
    producto: parsed.producto || item.titulo || "Regalo sugerido",
    url,
    nota: parsed.nota || item.fecha_limite || "",
  };
}

function InvitacionPublicaPage() {
  const { user } = useAuth();
  const { id: rawId, eventoSlug = "" } = useParams();
  const id = String(rawId || "").replace(/^e/i, "");
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get("guest") || searchParams.get("pase") || "";
  const urlMod = (searchParams.get("mod") || "").trim();
  const urlTipoPase = (
    searchParams.get("tipo") ||
    searchParams.get("tipo_pase") ||
    ""
  )
    .trim()
    .toUpperCase();
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
  const [invitadoTieneCuenta, setInvitadoTieneCuenta] = useState(false);
  const [mesaRegalos, setMesaRegalos] = useState([]);

  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [expiredRsvpMsg, setExpiredRsvpMsg] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("register");
  const [showScrollDownHint, setShowScrollDownHint] = useState(false);
  const promoCardRef = useRef(null);

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
        const { data } = await getInvitacionPublicaRequest(
          id,
          guestToken,
          eventoSlug
        );
        if (!active) return;
        setEvento(data.evento);
        setInvitado(data.invitado);
        setInvitadoTieneCuenta(Boolean(data.invitado_tiene_cuenta));
        if (
          data.evento?.idevento &&
          !/^\d+$/.test(String(id || "").trim()) &&
          typeof window !== "undefined" &&
          window.history?.replaceState
        ) {
          const realSlug =
            String(eventoSlug || data.evento.nombre || "evento")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "") || "evento";
          window.history.replaceState(
            null,
            "",
            `/${realSlug}/e${data.evento.idevento}${window.location.search || ""}`
          );
        }
        setMesaRegalos(
          Array.isArray(data.mesa_regalos)
            ? data.mesa_regalos.map(parsePublicGiftItem)
            : []
        );
        if (data.evento?.nombre) {
          document.title = data.invitado?.nombre
            ? `✨ Invitación para ${data.invitado.nombre} — ${data.evento.nombre}`
            : `✨ ${data.evento.nombre} — ${
                data.evento.tipo_evento || "Invitación Digital"
              }`;
        }

        const rawModalidad =
          urlMod ||
          data.invitado?.modalidad_pase ||
          data.evento?.modalidad_invitados ||
          "Adultos + Niños";
        const modLower = String(rawModalidad).trim().toLowerCase();
        const isOnlyAdults =
          modLower === "solo adultos" ||
          modLower === "solo hombres" ||
          modLower === "solo mujeres";

        const defaultAdultos =
          modLower === "solo niños"
            ? 0
            : urlAdultos > 0
            ? urlAdultos
            : data.invitado?.adultos !== undefined
            ? Number(data.invitado.adultos)
            : 1;
        const defaultNinos =
          isOnlyAdults
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
          correo: data.invitado?.correo || user?.correoRegistro || "",
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
  }, [id, guestToken, eventoSlug, urlMod, urlAdultos, urlNinos]);

  const qrMatrix = useMemo(
    () =>
      buildQrMatrix(
        `${evento?.idevento || ""}-${
          invitado?.token_invitacion || form.nombre || "VIP"
        }`
      ),
    [evento?.idevento, invitado?.token_invitacion, form.nombre]
  );
  const mapLocation = useGoogleMapsLocation(evento?.lugar, evento?.direccion);
  const isConfirmedView = Boolean(
    invitado && invitado.estado_rsvp === "Confirmado" && !showRsvpForm
  );

  useEffect(() => {
    if (!isConfirmedView) {
      setShowScrollDownHint(false);
      return;
    }

    const evaluateScrollPosition = () => {
      const el = promoCardRef.current;
      if (!el) {
        const remaining =
          document.documentElement.scrollHeight -
          (window.scrollY + window.innerHeight);
        setShowScrollDownHint(remaining > 90);
        return;
      }
      const rect = el.getBoundingClientRect();
      // Mostrar indicador fijo mientras la parte inferior de la tarjeta promocional siga debajo del viewport
      setShowScrollDownHint(rect.bottom > window.innerHeight + 55);
    };

    const timerId = window.setTimeout(evaluateScrollPosition, 120);
    window.addEventListener("scroll", evaluateScrollPosition, { passive: true });
    window.addEventListener("resize", evaluateScrollPosition);
    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("scroll", evaluateScrollPosition);
      window.removeEventListener("resize", evaluateScrollPosition);
    };
  }, [isConfirmedView, feedbackMsg, evento?.idevento]);

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
  const fechaStr = formatDateInput(evento.fecha_evento);
  const fechaLimiteRsvpStr = evento.fecha_limite_rsvp_activa
    ? formatDateInput(evento.fecha_limite_rsvp)
    : "";
  const todayMxStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const isFechaLimiteVencida = Boolean(
    evento.fecha_limite_rsvp_activa &&
      fechaLimiteRsvpStr &&
      (evento.fecha_limite_rsvp_vencida || todayMxStr > fechaLimiteRsvpStr)
  );
  const diasParaEvento = Math.max(
    0,
    Math.ceil(
      (new Date(`${fechaStr}T00:00:00`).getTime() - Date.now()) / 86400000
    )
  );
  const rawModalidadEvento =
    urlMod ||
    invitado?.modalidad_pase ||
    evento.modalidad_invitados ||
    "Adultos + Niños";
  const modEventoLower = String(rawModalidadEvento).trim().toLowerCase();
  const modalidadEvento =
    modEventoLower === "adultos y niños" ||
    modEventoLower === "padres e hijos" ||
    modEventoLower === "toda la familia"
      ? "Adultos + Niños"
      : modEventoLower === "padre e hijos" ||
        modEventoLower === "un padre, un hijo"
      ? "Papa + Niños"
      : modEventoLower === "madre e hijos" ||
        modEventoLower === "una madre, un hijo"
      ? "Mama + Niños"
      : rawModalidadEvento;
  const soloAdultos =
    modEventoLower === "solo adultos" ||
    modEventoLower === "solo hombres" ||
    modEventoLower === "solo mujeres";
  const soloNinos = modEventoLower === "solo niños";
  const adultosLockedByLink = !soloNinos && urlAdultos > 0;
  const ninosLockedByLink = !soloAdultos && urlNinos > 0;
  const tipoPaseEvento =
    urlTipoPase === "VIP" || urlTipoPase === "GENERAL"
      ? urlTipoPase
      : invitado?.grupo &&
        ["VIP", "GENERAL"].includes(String(invitado.grupo).trim().toUpperCase())
      ? String(invitado.grupo).trim().toUpperCase()
      : "GENERAL";

  const handleOpenRsvpAttempt = () => {
    if (isFechaLimiteVencida) {
      setShowRsvpForm(false);
      setExpiredRsvpMsg(
        `⚠️ La fecha de confirmación del evento ya caducó (Fecha límite: ${fechaLimiteRsvpStr}). Ya no es posible confirmar asistencia.`
      );
      return;
    }
    setExpiredRsvpMsg("");
    setShowRsvpForm(true);
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (isFechaLimiteVencida) {
      setShowRsvpForm(false);
      setExpiredRsvpMsg(
        `⚠️ La fecha de confirmación del evento ya caducó (Fecha límite: ${fechaLimiteRsvpStr}). Ya no es posible confirmar asistencia.`
      );
      return;
    }
    if (!form.nombre.trim()) return;
    setSubmitting(true);
    setFeedbackMsg("");
    setExpiredRsvpMsg("");
    try {
      const { data } = await confirmarRsvpPublicoRequest(evento.idevento, {
        guestToken: invitado?.token_invitacion || guestToken,
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim(),
        estado_rsvp: form.estado_rsvp,
        grupo: tipoPaseEvento,
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
      if (data.invitado_tiene_cuenta !== undefined) {
        setInvitadoTieneCuenta(Boolean(data.invitado_tiene_cuenta));
      }
      setFeedbackMsg(data.message);
      setShowRsvpForm(false);
    } catch (err) {
      if (err.response?.data?.fecha_limite_rsvp_vencida) {
        setShowRsvpForm(false);
        setExpiredRsvpMsg(
          err.response?.data?.message ||
            "La fecha de confirmación del evento ya caducó."
        );
      } else {
        setFeedbackMsg(
          err.response?.data?.message ||
            "Ocurrió un error al registrar tu confirmación."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F6FA] px-2.5 pt-4 pb-20 text-white sm:px-6 sm:py-10 md:py-12">
      <style>{`
        @keyframes recuerdalo-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes recuerdalo-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes recuerdalo-pulse-glow {
          0%, 100% { box-shadow: 0 12px 32px rgba(16, 185, 129, 0.45), 0 0 0 0 rgba(52, 211, 153, 0.5); }
          50% { box-shadow: 0 16px 40px rgba(16, 185, 129, 0.65), 0 0 0 8px rgba(52, 211, 153, 0); }
        }
        @keyframes recuerdalo-pop-in {
          0% { opacity: 0; transform: translateY(16px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes recuerdalo-bounce-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        .recuerdalo-float {
          animation: recuerdalo-float 3.4s ease-in-out infinite;
        }
        .recuerdalo-float-delayed {
          animation: recuerdalo-float 3.8s ease-in-out 0.9s infinite;
        }
        .recuerdalo-pulse-glow {
          animation: recuerdalo-pulse-glow 2.6s ease-in-out infinite;
        }
        .recuerdalo-pop-in {
          animation: recuerdalo-pop-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .recuerdalo-shimmer-btn {
          background-size: 200% 100%;
          animation: recuerdalo-shimmer 3.5s linear infinite;
        }
        .recuerdalo-bounce-down {
          animation: recuerdalo-bounce-down 1.25s ease-in-out infinite;
        }
      `}</style>
      <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {/* Tarjeta Principal de Invitación Virtual */}
        <div
          className={`recuerdalo-pop-in overflow-hidden rounded-[1.6rem] border-2 bg-gradient-to-b shadow-[0_24px_60px_rgba(0,0,0,0.22)] transition-all duration-500 sm:rounded-[2.2rem] ${tpl.bg} ${tpl.border}`}
        >
          {evento.imagen_portada && (
            <div className="group relative h-48 w-full overflow-hidden sm:h-64 md:h-72">
              <img
                src={evento.imagen_portada}
                alt={evento.nombre}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171F39] via-black/30 to-transparent" />
            </div>
          )}

          <div className="p-4 text-center sm:p-7 md:p-9">
            <span
              className="recuerdalo-float inline-block rounded-lg px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#171F39] shadow sm:text-xs"
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
              <div className="mt-3 break-words rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-gray-200 transition-transform duration-300 hover:scale-[1.02] sm:text-sm">
                🎟️ Pase Personal para:{" "}
                <strong className="text-[#15B2F5]">{invitado.nombre}</strong>
              </div>
            )}

            <h1 className="mt-3 break-words text-2xl font-extrabold tracking-tight text-white sm:text-4xl md:text-[2.5rem] md:leading-tight">
              {evento.nombre}
            </h1>

            <p className="mx-auto mt-2 max-w-xl break-words text-xs leading-relaxed text-gray-300 sm:text-sm">
              {evento.mensaje_invitacion ||
                `Estás cordialmente invitado(a) a celebrar con nosotros ${evento.nombre}. ¡Tu presencia hará esta noche inolvidable!`}
            </p>

            {/* Contador de Días, Hora y Tipo de Pase */}
            <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-black/35 p-2.5 text-center sm:gap-3 sm:p-4">
              <div className="min-w-0 rounded-xl p-1 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/5">
                <span className="block truncate text-lg font-extrabold text-white sm:text-2xl md:text-3xl">
                  {diasParaEvento}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-gray-400 sm:text-[11px]">
                  Días Restantes
                </span>
              </div>
              <div className="min-w-0 rounded-xl p-1 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/5">
                <span className="block truncate text-lg font-extrabold text-white sm:text-2xl md:text-3xl">
                  {evento.hora_evento || "20:00"}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-gray-400 sm:text-[11px]">
                  Hora
                </span>
              </div>
              <div className="min-w-0 rounded-xl p-1 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/5">
                <span className="block truncate text-lg font-extrabold text-[#15B2F5] sm:text-2xl md:text-3xl">
                  {tipoPaseEvento}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-gray-400 sm:text-[11px]">
                  Pase
                </span>
              </div>
            </div>

            {/* Datos de Fecha, Lugar y Código de Vestimenta */}
            <div className="mt-4 space-y-2 break-words rounded-2xl border border-white/10 bg-black/30 p-3.5 text-left text-xs text-gray-200 sm:p-5 sm:text-sm">
              <p>
                📅 <strong>Fecha:</strong> {fechaStr}
              </p>
              {Boolean(
                evento.fecha_limite_rsvp_activa && fechaLimiteRsvpStr
              ) && (
                <p
                  className={
                    isFechaLimiteVencida ? "text-rose-300" : "text-amber-300"
                  }
                >
                  ⏳ <strong>Fecha límite de confirmación:</strong>{" "}
                  {fechaLimiteRsvpStr}{" "}
                  {isFechaLimiteVencida ? "(Caducada)" : ""}
                </p>
              )}
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
                className="h-44 w-full border-0 sm:h-52 md:h-60"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex flex-col gap-1.5 px-3.5 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3 sm:text-sm">
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

            {/* Mesa de Regalos / Carrito de Compras del Anfitrión (Condicional según check del evento) */}
            {Boolean(evento.mesa_regalos_habilitada) &&
              (() => {
                const rawUrl = String(
                  evento.mesa_regalos_url || mesaRegalos[0]?.url || ""
                ).trim();
                if (!rawUrl) return null;
                const hrefUrl = /^https?:\/\//i.test(rawUrl)
                  ? rawUrl
                  : `https://${rawUrl}`;
                const tiendaActual =
                  evento.mesa_regalos_tienda ||
                  mesaRegalos[0]?.tienda ||
                  "Amazon";
                const meta = getTiendaMetaPublic(tiendaActual);
                return (
                  <div className="mt-4 rounded-2xl border border-amber-400/35 bg-black/35 p-4 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                        🎁 MESA DE REGALOS SUGERIDOS
                      </span>
                      <span
                        className={`inline-block rounded border px-2 py-0.5 text-[10px] font-extrabold ${meta.badgeClass}`}
                      >
                        {meta.icon} {tiendaActual}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-gray-300">
                      Tu presencia es nuestro mejor regalo, pero si deseas tener
                      un detalle con nosotros, puedes consultar nuestro carrito /
                      lista de regalos:
                    </p>
                    <a
                      href={hrefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex flex-col items-center justify-between gap-2.5 rounded-xl border border-amber-400/40 bg-amber-400/15 px-4 py-3 text-xs transition hover:border-amber-400 hover:bg-amber-400/25 sm:flex-row"
                    >
                      <div className="min-w-0 w-full flex-1 text-center sm:text-left">
                        <p className="truncate font-extrabold text-white">
                          🛒 Carrito / Lista de Regalos en {tiendaActual}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-amber-200/90">
                          {hrefUrl}
                        </p>
                      </div>
                      <span className="w-full shrink-0 rounded-lg bg-amber-400 px-3.5 py-2 text-center text-[11px] font-extrabold text-[#171F39] shadow sm:w-auto">
                        Ver Carrito / Lista ↗
                      </span>
                    </a>
                  </div>
                );
              })()}

            {/* Mensaje de confirmación tras enviar formulario */}
            {feedbackMsg && (
              <div className="recuerdalo-pop-in recuerdalo-pulse-glow mt-5 break-words rounded-2xl border-2 border-[#6EE7B7] bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#10B981] px-4 py-3.5 text-center text-base font-extrabold leading-snug tracking-tight text-[#041E17] shadow-[0_12px_32px_rgba(16,185,129,0.45)] sm:px-6 sm:py-4 sm:text-lg md:text-xl">
                ✓ {feedbackMsg}
              </div>
            )}

            {/* Aviso cuando la fecha límite de confirmación ya caducó */}
            {(isFechaLimiteVencida || expiredRsvpMsg) && (
              <div className="mt-4 rounded-2xl border border-rose-400/50 bg-rose-500/20 p-4 text-center shadow-lg">
                <span className="inline-block rounded-full bg-rose-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  ⏳ FECHA DE CONFIRMACIÓN CADUCADA
                </span>
                <p className="mt-2 text-xs font-extrabold text-rose-100 sm:text-sm">
                  {expiredRsvpMsg ||
                    `La fecha de confirmación del evento ya caducó (Fecha límite: ${fechaLimiteRsvpStr}).`}
                </p>
                <p className="mt-1 text-[11px] text-rose-200/90 sm:text-xs">
                  Ya no es posible confirmar asistencia porque venció la fecha
                  límite establecida por el anfitrión.
                </p>
              </div>
            )}

            {/* Si el invitado ya confirmó su asistencia, mostramos su Pase Digital con QR */}
            {invitado && invitado.estado_rsvp === "Confirmado" && !showRsvpForm ? (
              <>
                <div className="recuerdalo-pop-in mt-5 rounded-2xl border border-[#15B2F5]/40 bg-[#0F1A45] p-4 text-center transition-transform duration-300 hover:scale-[1.01] sm:p-6">
                  <span className="recuerdalo-float inline-block rounded-lg bg-[#15B2F5] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow sm:text-xs">
                    🟢 ASISTENCIA CONFIRMADA
                  </span>
                  <p className="mt-2 break-words text-sm font-extrabold text-white sm:text-base">
                    {invitado.nombre}
                  </p>
                  <p className="text-xs text-gray-400 sm:text-sm">
                    Pases confirmados:{" "}
                    <strong className="text-[#15B2F5]">{invitado.pases}</strong> (
                    {invitado.adultos} adultos, {invitado.ninos} niños)
                    <span className="hidden">
                      {" "}
                      • Mesa:{" "}
                      <strong className="text-white">
                        {invitado.mesa_asignada || "Por asignar"}
                      </strong>
                    </span>
                  </p>

                  {/* Código QR del Pase del Invitado (condicional según "¿Confirmar Acceso el día del evento?") */}
                  {Boolean(
                    evento.confirmar_acceso_qr ??
                      evento.permitir_acompanantes ??
                      true
                  ) && (
                    <>
                      <div className="mx-auto mt-4 inline-block rounded-2xl bg-white p-3 shadow-lg transition-transform duration-300 hover:scale-105 sm:p-3.5">
                        <svg
                          viewBox="0 0 21 21"
                          className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40"
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
                      <p className="mt-2 break-all font-mono text-[11px] font-extrabold text-[#15B2F5] sm:text-xs">
                        TOKEN: {invitado.token_invitacion}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400 sm:text-xs">
                        Presenta este código QR en la entrada del evento.
                      </p>
                    </>
                  )}

                  {!isFechaLimiteVencida && (
                    <button
                      type="button"
                      onClick={handleOpenRsvpAttempt}
                      className="mt-4 w-full rounded-xl border border-white/15 bg-white/10 py-2.5 text-[11px] font-bold text-gray-200 transition hover:bg-white/20 sm:text-xs"
                    >
                      ✏️ Modificar mi respuesta o datos
                    </button>
                  )}
                </div>

                {/* Publicidad de Recuerdalo.com.mx mostrada siempre tras confirmar asistencia */}
                <div
                  ref={promoCardRef}
                  className="recuerdalo-pop-in relative mt-5 overflow-hidden rounded-2xl border-2 border-[#4CE0B3]/70 bg-gradient-to-br from-[#131F4C] via-[#1E2E6E] to-[#111B42] p-4 text-left shadow-[0_20px_50px_rgba(21,178,245,0.28)] sm:rounded-3xl sm:p-6 md:p-7"
                >
                  {/* Destellos decorativos animados de fondo */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#4CE0B3]/20 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#15B2F5]/25 blur-2xl" />

                  {/* Cabecera con logo flotante y badge */}
                  <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
                    <img
                      src="/logo-recuerdalo.png?v=6"
                      alt="Recuerdalo.com.mx"
                      className="recuerdalo-float h-12 w-12 shrink-0 rounded-2xl border border-white/30 object-cover shadow-lg sm:h-14 sm:w-14"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#4CE0B3]/50 bg-[#4CE0B3]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#6EE7B7] sm:text-[11px]">
                        ✨ Recuerdalo.com.mx • Cuenta Gratis
                      </span>
                      <h3 className="mt-1 break-words text-base font-extrabold leading-tight text-[#edfb78] sm:text-lg md:text-xl">
                        ¡Si lo prefieres puedes registrarte con tu correo y vive el evento al máximo!
                      </h3>
                    </div>
                  </div>

                  {/* Tarjetas de beneficios con efectos de movimiento */}
                  <div className="relative mt-3.5 space-y-2.5 sm:space-y-3">
                    <div className="group flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#15B2F5]/60 hover:bg-white/15 sm:p-3.5">
                      <span className="recuerdalo-float flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#15B2F5]/25 text-lg shadow-inner transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10 sm:text-xl">
                        🔔
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-white sm:text-sm">
                          Dale seguimiento al evento en tiempo real
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-gray-300 sm:text-xs">
                          Consulta tu pase QR siempre a la mano, mapa, horarios y avisos desde tu sección{" "}
                          <strong className="text-[#15B2F5]">&ldquo;💌 Mis Invitaciones&rdquo;</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="group flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4CE0B3]/60 hover:bg-white/15 sm:p-3.5">
                      <span className="recuerdalo-float-delayed flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4CE0B3]/25 text-lg shadow-inner transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10 sm:text-xl">
                        📸
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-white sm:text-sm">
                          Mira las Fotos y Reels que comparta el organizador
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-gray-300 sm:text-xs">
                          Revive y descarga el álbum digital de fotos y reels oficiales del evento en alta definición.
                        </p>
                      </div>
                    </div>

                    <div className="group flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-white/15 sm:p-3.5">
                      <span className="recuerdalo-float flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/25 text-lg shadow-inner transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10 sm:text-xl">
                        🎉
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-white sm:text-sm">
                          Crea y organiza tus propios eventos gratis
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-gray-300 sm:text-xs">
                          Crea invitaciones digitales interactivas, controla confirmaciones y envía recordatorios por WhatsApp y Correo.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón CTA principal con efecto shimmer y movimiento */}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode("register");
                      setAuthModalOpen(true);
                    }}
                    className="recuerdalo-shimmer-btn relative mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4CE0B3] via-[#15B2F5] to-[#4CE0B3] px-3.5 py-3 text-center text-[11px] font-extrabold uppercase leading-snug tracking-wider text-[#0B1536] shadow-[0_12px_28px_rgba(21,178,245,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(76,224,179,0.55)] active:scale-[0.99] sm:px-5 sm:py-4 sm:text-xs md:text-sm"
                  >
                    <span>🚀 Crear mi Cuenta Gratis con mi Correo</span>
                  </button>

                  <div className="relative mt-3.5 flex flex-col items-center justify-center gap-2 text-center text-[11px] text-gray-300 sm:flex-row sm:justify-between sm:text-left sm:text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode("login");
                        setAuthModalOpen(true);
                      }}
                      className="font-bold text-[#4CE0B3] underline decoration-[#4CE0B3]/60 underline-offset-4 transition hover:text-white"
                    >
                      ¿Ya tienes cuenta? Inicia sesión aquí
                    </button>
                    <Link
                      to="/"
                      className="font-semibold text-gray-300 transition hover:text-[#15B2F5]"
                    >
                      Conocer Recuerdalo.com.mx ↗
                    </Link>
                  </div>
                </div>
              </>
            ) : invitado && invitado.estado_rsvp === "Rechazado" && !showRsvpForm ? (
              <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
                <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-[10px] font-bold uppercase text-rose-300">
                  🔴 NO PODRÁ ASISTIR
                </span>
                <p className="mt-2 text-xs text-gray-300">
                  Has notificado que no podrás asistir a este evento.
                </p>
                {!isFechaLimiteVencida && (
                  <button
                    type="button"
                    onClick={handleOpenRsvpAttempt}
                    className="mt-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
                  >
                    Cambiar mi respuesta a Confirmado
                  </button>
                )}
              </div>
            ) : null}

            {/* Botón principal "CONFIRMAR ASISTENCIA" */}
            {!showRsvpForm &&
              (!invitado || invitado.estado_rsvp === "Pendiente") && (
                <button
                  type="button"
                  disabled={!evento.rsvp_habilitado}
                  onClick={handleOpenRsvpAttempt}
                  className={`mt-5 w-full cursor-pointer rounded-xl py-3.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isFechaLimiteVencida
                      ? "bg-rose-600/80 hover:bg-rose-600"
                      : "bg-[#15B2F5] hover:bg-[#0E9DE0]"
                  }`}
                >
                  {!evento.rsvp_habilitado
                    ? "CONFIRMACIONES CERRADAS"
                    : isFechaLimiteVencida
                    ? "⏳ FECHA DE CONFIRMACIÓN CADUCADA"
                    : evento.texto_boton_rsvp || "CONFIRMAR ASISTENCIA"}
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
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.correo}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, correo: e.target.value }))
                      }
                      placeholder="correo@ejemplo.com"
                      className="w-full rounded-xl border border-white/15 bg-[#142257] px-3.5 py-2 text-xs text-white outline-none focus:border-[#15B2F5]"
                    />
                    <p className="mt-1 text-[10px] text-gray-400">
                      Con este correo verás tu invitación en &ldquo;Mis Invitaciones&rdquo; en Recuerdalo.com.mx.
                    </p>
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

      {/* Flecha animada flotante (fixed) indicando al invitado que hay más información debajo tras confirmar */}
      {isConfirmedView && showScrollDownHint && (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:bottom-5 sm:px-4">
          <button
            type="button"
            onClick={() => {
              if (promoCardRef.current) {
                promoCardRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              } else {
                window.scrollBy({ top: 420, behavior: "smooth" });
              }
            }}
            className="pointer-events-auto group flex max-w-[94vw] cursor-pointer items-center gap-2 rounded-full border-2 border-[#6EE7B7] bg-gradient-to-r from-[#0F1A45]/95 via-[#182B6B]/95 to-[#0F1A45]/95 px-3.5 py-2 text-[11px] font-extrabold text-white shadow-[0_14px_34px_rgba(16,185,129,0.5)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#4CE0B3] sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-xs md:text-sm"
            aria-label="Ver más información abajo"
          >
            <span className="inline-block h-2 w-2 shrink-0 animate-ping rounded-full bg-[#4CE0B3]" />
            <span className="truncate tracking-wide text-[#A7F3D0] group-hover:text-white">
              ✨ Ver más información
            </span>
            <span className="recuerdalo-bounce-down flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#4CE0B3] to-[#10B981] text-[#041E17] shadow-md sm:h-7 sm:w-7">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </button>
        </div>
      )}

      {/* Modal de Registro / Inicio de Sesión directo desde la Invitación */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        defaultEmail={invitado?.correo || form.correo || ""}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default InvitacionPublicaPage;
