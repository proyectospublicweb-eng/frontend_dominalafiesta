import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ExternalLink,
  Film,
  Gift,
  Hourglass,
  Lock,
  Mail,
  Map as MapIcon,
  MapPin,
  Package,
  Pencil,
  Phone,
  RefreshCw,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sofa,
  Sparkles,
  Ticket,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  getInvitacionPublicaRequest,
  confirmarRsvpPublicoRequest,
} from "../../api/eventos.js";
import { useGoogleMapsLocation } from "../../utils/googleMaps.js";
import CamaraAlbumEvento from "./CamaraAlbumEvento.jsx";

const DEFAULT_INVITACION_THUMB = "/default-invitacion.svg";

function buildPseudoQrMatrix(seedText) {
  const str = String(seedText || "RECUERDALO-PASS");
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const size = 21;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (r0, c0) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[r0 + r][c0 + c] = isBorder || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let s = Math.abs(hash) || 1234567;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      s = (s * 1664525 + 1013904223) % 4294967296;
      matrix[r][c] = s % 2 === 0;
    }
  }
  return matrix;
}

function getTiendaMeta(tienda) {
  const t = String(tienda || "Amazon").toLowerCase();
  if (t.includes("mercado")) {
    return {
      Icon: ShoppingCart,
      badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-300",
    };
  }
  if (t.includes("ikea")) {
    return {
      Icon: Sofa,
      badgeClass: "bg-sky-50 text-sky-800 border-sky-300",
    };
  }
  if (t.includes("liverpool") || t.includes("palacio")) {
    return {
      Icon: ShoppingBag,
      badgeClass: "bg-pink-50 text-pink-800 border-pink-300",
    };
  }
  return {
    Icon: Package,
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
  };
}

function DetalleInvitacionRecibida({
  invitacionInicial,
  onBack,
  onInvitacionUpdated,
}) {
  const detalleZoneRef = useRef(null);
  const fotosZoneRef = useRef(null);
  const itinerarioZoneRef = useRef(null);

  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [eventoData, setEventoData] = useState(() => ({
    ...invitacionInicial,
  }));
  const [invitadoData, setInvitadoData] = useState(() => ({
    idinvitado: invitacionInicial?.idinvitado,
    nombre: invitacionInicial?.nombre_invitado || "",
    correo: invitacionInicial?.correo_invitado || "",
    telefono: invitacionInicial?.telefono_invitado || "",
    grupo: invitacionInicial?.grupo || "GENERAL",
    modalidad_pase:
      invitacionInicial?.modalidad_pase ||
      invitacionInicial?.modalidad_invitados ||
      "Adultos + Niños",
    pases: Number(invitacionInicial?.pases || 1),
    adultos: Number(invitacionInicial?.adultos ?? 1),
    ninos: Number(invitacionInicial?.ninos ?? 0),
    estado_rsvp: invitacionInicial?.estado_rsvp || "Pendiente",
    nota_alimentacion: invitacionInicial?.nota_alimentacion || "",
    token_invitacion: invitacionInicial?.token_invitacion || "",
  }));
  const [itinerarioItems, setItinerarioItems] = useState(() =>
    Array.isArray(invitacionInicial?.itinerario_evento)
      ? invitacionInicial.itinerario_evento
      : []
  );
  const [mesaRegalosList, setMesaRegalosList] = useState([]);

  // Estado para editar o confirmar asistencia desde la vista de detalle
  const [editingRsvp, setEditingRsvp] = useState(false);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpFeedback, setRsvpFeedback] = useState("");
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpForm, setRsvpForm] = useState({
    nombre: invitacionInicial?.nombre_invitado || "",
    correo: invitacionInicial?.correo_invitado || "",
    telefono: invitacionInicial?.telefono_invitado || "",
    adultos: Number(invitacionInicial?.adultos ?? 1) || 1,
    ninos: Number(invitacionInicial?.ninos ?? 0) || 0,
    estado_rsvp:
      invitacionInicial?.estado_rsvp === "Rechazado"
        ? "Rechazado"
        : "Confirmado",
    nota_alimentacion: invitacionInicial?.nota_alimentacion || "",
  });

  const fetchDetalleActualizado = async () => {
    if (!invitacionInicial?.idevento) return;
    setLoadingDetalle(true);
    try {
      const guestToken =
        invitacionInicial.token_invitacion ||
        String(invitacionInicial.idinvitado || "");
      const { data } = await getInvitacionPublicaRequest(
        invitacionInicial.idevento,
        guestToken
      );
      if (data?.evento) {
        setEventoData((prev) => ({
          ...prev,
          ...data.evento,
          compartir_album_invitados:
            data.evento.compartir_album_invitados !== undefined
              ? Boolean(data.evento.compartir_album_invitados)
              : Boolean(prev.compartir_album_invitados),
        }));
      }
      if (data?.invitado) {
        setInvitadoData((prev) => ({
          ...prev,
          ...data.invitado,
        }));
        setRsvpForm({
          nombre: data.invitado.nombre || "",
          correo: data.invitado.correo || "",
          telefono: data.invitado.telefono || "",
          adultos: Number(data.invitado.adultos ?? 1) || 1,
          ninos: Number(data.invitado.ninos ?? 0) || 0,
          estado_rsvp:
            data.invitado.estado_rsvp === "Rechazado"
              ? "Rechazado"
              : "Confirmado",
          nota_alimentacion: data.invitado.nota_alimentacion || "",
        });
      }
      if (Array.isArray(data?.itinerario_evento)) {
        setItinerarioItems(data.itinerario_evento);
      }
      if (Array.isArray(data?.mesa_regalos)) {
        setMesaRegalosList(data.mesa_regalos);
      }
    } catch (error) {
      console.error("Error al sincronizar detalle de invitación:", error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  useEffect(() => {
    fetchDetalleActualizado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitacionInicial?.idevento, invitacionInicial?.idinvitado]);

  const mapLocation = useGoogleMapsLocation(
    eventoData?.lugar,
    eventoData?.direccion
  );

  const qrMatrix = useMemo(
    () =>
      buildPseudoQrMatrix(
        invitadoData?.token_invitacion ||
          `${eventoData?.idevento}-${invitadoData?.idinvitado}`
      ),
    [
      invitadoData?.token_invitacion,
      eventoData?.idevento,
      invitadoData?.idinvitado,
    ]
  );

  const fechaEventoStr = String(eventoData?.fecha_evento || "").slice(0, 10);
  const fechaLimiteRsvpStr = String(eventoData?.fecha_limite_rsvp || "").slice(
    0,
    10
  );
  const isFechaLimiteVencida = Boolean(eventoData?.fecha_limite_rsvp_vencida);
  const coverThumb =
    String(eventoData?.imagen_portada || "").trim() || DEFAULT_INVITACION_THUMB;
  const modalidadEvento =
    invitadoData?.modalidad_pase ||
    eventoData?.modalidad_invitados ||
    "Adultos + Niños";
  const soloAdultos = modalidadEvento === "Solo Adultos";
  const soloNinos = modalidadEvento === "Solo Niños";
  const grupoNormalized =
    String(invitadoData?.grupo || "GENERAL").toUpperCase() === "VIP"
      ? "VIP"
      : "GENERAL";
  const compartirAlbumActivo = Boolean(eventoData?.compartir_album_invitados);

  const validItinerarioItems = useMemo(() => {
    return (itinerarioItems || []).filter(
      (item) =>
        String(item?.titulo || "").trim() ||
        String(item?.descripcion || "").trim() ||
        String(item?.horario_inicial || "").trim()
    );
  }, [itinerarioItems]);

  const scrollToZone = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSaveRsvp = async (e) => {
    e.preventDefault();
    if (!eventoData?.idevento) return;
    setSubmittingRsvp(true);
    setRsvpError("");
    setRsvpFeedback("");
    try {
      const guestToken =
        invitadoData?.token_invitacion ||
        String(invitadoData?.idinvitado || "");
      const { data } = await confirmarRsvpPublicoRequest(eventoData.idevento, {
        guestToken,
        nombre: rsvpForm.nombre,
        correo: rsvpForm.correo,
        telefono: rsvpForm.telefono,
        grupo: grupoNormalized,
        adultos: soloNinos ? 0 : Number(rsvpForm.adultos) || 1,
        ninos: soloAdultos ? 0 : Number(rsvpForm.ninos) || 0,
        estado_rsvp: rsvpForm.estado_rsvp,
        nota_alimentacion: rsvpForm.nota_alimentacion,
        modalidad_pase: modalidadEvento,
      });
      if (data?.invitado) {
        setInvitadoData((prev) => ({
          ...prev,
          ...data.invitado,
        }));
      }
      setRsvpFeedback(
        data?.message || "¡Tu respuesta ha sido actualizada correctamente!"
      );
      setEditingRsvp(false);
      if (typeof onInvitacionUpdated === "function") {
        onInvitacionUpdated();
      }
    } catch (err) {
      setRsvpError(
        err.response?.data?.message ||
          "No se pudo guardar tu confirmación. Intenta nuevamente."
      );
    } finally {
      setSubmittingRsvp(false);
    }
  };

  return (
    <div className="space-y-6 text-[#1E2235]">
      {/* =====================================================================
          BARRA SUPERIOR DE NAVEGACIÓN INTERNA (VOLVER + ATAJOS A LAS 3 ZONAS)
         ===================================================================== */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#DCE0E8] bg-white p-3 shadow-[0_8px_24px_rgba(30,42,70,0.05)] sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2D3047] px-3 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#1E2029] sm:flex-initial sm:px-3.5"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">Volver a Mis Invitaciones</span>
          </button>

          <button
            type="button"
            onClick={fetchDetalleActualizado}
            disabled={loadingDetalle}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#DCE0E8] bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#55617C] transition hover:border-[#2B7FFF] hover:text-[#2B7FFF] disabled:opacity-50"
            title="Sincronizar información más reciente del evento"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 shrink-0 ${
                loadingDetalle ? "animate-spin" : ""
              }`}
            />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Botones de salto directo a las 3 zonas */}
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={() => scrollToZone(detalleZoneRef)}
            className="inline-flex min-w-0 cursor-pointer items-center justify-center gap-1 rounded-xl border border-[#2B7FFF]/30 bg-[#2B7FFF]/10 px-2 py-2 text-[10px] font-extrabold text-[#2B7FFF] transition hover:bg-[#2B7FFF] hover:text-white min-[400px]:gap-1.5 min-[400px]:text-[11px] sm:px-3.5 sm:text-xs"
          >
            <Ticket className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">1. Detalle</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToZone(fotosZoneRef)}
            className="inline-flex min-w-0 cursor-pointer items-center justify-center gap-1 rounded-xl border border-[#10B981]/35 bg-[#10B981]/10 px-2 py-2 text-[10px] font-extrabold text-[#059669] transition hover:bg-[#10B981] hover:text-white min-[400px]:gap-1.5 min-[400px]:text-[11px] sm:px-3.5 sm:text-xs"
          >
            <Camera className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">2. Fotos y Reels</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToZone(itinerarioZoneRef)}
            className="inline-flex min-w-0 cursor-pointer items-center justify-center gap-1 rounded-xl border border-[#6D28D9]/30 bg-[#6D28D9]/10 px-2 py-2 text-[10px] font-extrabold text-[#6D28D9] transition hover:bg-[#6D28D9] hover:text-white min-[400px]:gap-1.5 min-[400px]:text-[11px] sm:px-3.5 sm:text-xs"
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">3. Itinerario</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          ZONA 1: DETALLE DE LA INVITACIÓN (INFORMACIÓN, UBICACIÓN Y PASE QR)
         ===================================================================== */}
      <section
        ref={detalleZoneRef}
        className="overflow-hidden rounded-[22px] border border-[#DCE0E8] bg-white shadow-[0_12px_32px_rgba(30,42,70,0.06)]"
      >
        {/* Banner Superior con Imagen de Portada y Resumen Principal (expansible sin recortar texto en móvil) */}
        <div className="relative flex min-h-[13.5rem] w-full flex-col justify-end overflow-hidden bg-[#181B2C] sm:min-h-[16rem] lg:min-h-[18.5rem]">
          <img
            src={coverThumb}
            alt={eventoData?.nombre || "Evento"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_INVITACION_THUMB;
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1021] via-[#0D1021]/65 to-[#0D1021]/15" />

          <div className="relative z-10 flex w-full flex-col justify-between gap-3 p-4 pt-14 text-white sm:flex-row sm:items-end sm:p-6 sm:pt-20 lg:p-7">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#2B7FFF] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm sm:text-xs">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span>{eventoData?.tipo_evento || "Evento Especial"}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm sm:text-xs ${
                    grupoNormalized === "VIP"
                      ? "border border-amber-300/60 bg-amber-400/25 text-amber-200"
                      : "border border-white/25 bg-white/15 text-white"
                  }`}
                >
                  <Ticket className="h-3 w-3 shrink-0" />
                  <span>PASE {grupoNormalized}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm sm:text-xs ${
                    invitadoData?.estado_rsvp === "Confirmado"
                      ? "bg-[#10B981] text-white"
                      : invitadoData?.estado_rsvp === "Rechazado"
                      ? "bg-rose-500 text-white"
                      : "bg-amber-400 text-[#1E2235]"
                  }`}
                >
                  {invitadoData?.estado_rsvp === "Confirmado" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span>Asistencia Confirmada</span>
                    </>
                  ) : invitadoData?.estado_rsvp === "Rechazado" ? (
                    <>
                      <XCircle className="h-3 w-3 shrink-0" />
                      <span>No Asistiré</span>
                    </>
                  ) : (
                    <>
                      <Hourglass className="h-3 w-3 shrink-0" />
                      <span>Pendiente por Confirmar</span>
                    </>
                  )}
                </span>
              </div>

              <h2 className="mt-2 break-words text-lg font-extrabold tracking-tight text-white min-[400px]:text-xl sm:text-2xl lg:text-3xl">
                {eventoData?.nombre}
              </h2>
              {eventoData?.mensaje_invitacion && (
                <p className="mt-1 max-w-3xl break-words text-xs leading-relaxed text-gray-200 sm:text-sm">
                  &ldquo;{eventoData.mensaje_invitacion}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cuerpo de Zona 1: Dos columnas en escritorio (Datos + Mapa a la izquierda, Pase QR y RSVP a la derecha) */}
        <div className="p-3.5 sm:p-6 lg:p-8">
          <div className="mb-5 flex items-center gap-2.5 border-b border-[#ECEFF6] pb-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2B7FFF]/12 text-[#2B7FFF]">
              <Ticket className="h-4 w-4 shrink-0" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2B7FFF]">
                ZONA 1 • INFORMACIÓN OFICIAL Y ACCESO
              </span>
              <h3 className="text-sm font-extrabold text-[#1E2235] sm:text-base">
                Detalle de la Invitación
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Columna Izquierda: Datos del Evento, Mapa y Mesa de Regalos */}
            <div className="space-y-5 lg:col-span-7">
              {/* Tarjetas de datos clave */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-[#E5E9F2] bg-[#F8FAFC] p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2B7FFF]/15 text-[#2B7FFF]">
                    <Calendar className="h-4 w-4 shrink-0" />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7B819A]">
                      Fecha y Hora del Evento
                    </span>
                    <p className="mt-0.5 text-xs font-extrabold text-[#1E2235] sm:text-sm">
                      {fechaEventoStr || "Por confirmar"} •{" "}
                      {eventoData?.hora_evento || "20:00"} hrs
                    </p>
                    {Boolean(eventoData?.fecha_limite_rsvp_activa) &&
                      fechaLimiteRsvpStr && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                          <Hourglass className="h-3 w-3 shrink-0" />
                          <span>
                            Confirmar antes de: {fechaLimiteRsvpStr}
                          </span>
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-[#E5E9F2] bg-[#F8FAFC] p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6D28D9]/12 text-[#6D28D9]">
                    <Shirt className="h-4 w-4 shrink-0" />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7B819A]">
                      Código de Vestimenta y Modalidad
                    </span>
                    <p className="mt-0.5 text-xs font-extrabold text-[#1E2235] sm:text-sm">
                      {eventoData?.codigo_vestimenta || "Formal / Libre"}
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#55617C]">
                      <Users className="h-3 w-3 shrink-0 text-[#6D28D9]" />
                      <span>Modalidad: {modalidadEvento}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-[#E5E9F2] bg-[#F8FAFC] p-3.5 sm:col-span-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#059669]">
                    <MapPin className="h-4 w-4 shrink-0" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7B819A]">
                      Lugar y Dirección
                    </span>
                    <p className="mt-0.5 text-xs font-extrabold text-[#1E2235] sm:text-sm">
                      {eventoData?.lugar || "Lugar por confirmar"}
                    </p>
                    {eventoData?.direccion && (
                      <p className="mt-0.5 break-words text-xs text-[#55617C]">
                        {eventoData.direccion}
                      </p>
                    )}
                    {eventoData?.estado_evento &&
                      !/^ning[uú]no$/i.test(eventoData.estado_evento) && (
                        <p className="mt-0.5 text-[11px] font-semibold text-[#7B819A]">
                          {eventoData.estado_evento}
                          {eventoData?.municipio &&
                          !/^ning[uú]no$/i.test(eventoData.municipio)
                            ? `, ${eventoData.municipio}`
                            : ""}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Mapa Interactivo de Ubicación */}
              <div className="overflow-hidden rounded-2xl border border-[#DCE0E8] bg-[#F8FAFC]">
                <iframe
                  title="Mapa de ubicación del evento"
                  src={mapLocation.embedUrl}
                  className="h-48 w-full border-0 sm:h-56"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="flex flex-col gap-2 border-t border-[#DCE0E8] bg-white px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex min-w-0 items-center gap-1.5 truncate font-bold text-[#1E2235]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#2B7FFF]" />
                    <span className="truncate">
                      {eventoData?.lugar || "Ubicación del Evento"}
                    </span>
                  </span>
                  <a
                    href={mapLocation.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 font-extrabold text-[#2B7FFF] hover:underline"
                  >
                    <MapIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
              </div>

              {/* Mesa de Regalos (si el anfitrión la habilitó) */}
              {Boolean(eventoData?.mesa_regalos_habilitada) &&
                (() => {
                  const rawUrl = String(
                    eventoData?.mesa_regalos_url ||
                      mesaRegalosList[0]?.detalle ||
                      ""
                  ).trim();
                  if (!rawUrl) return null;
                  const hrefUrl = /^https?:\/\//i.test(rawUrl)
                    ? rawUrl
                    : `https://${rawUrl}`;
                  const tiendaActual =
                    eventoData?.mesa_regalos_tienda ||
                    mesaRegalosList[0]?.estado ||
                    "Amazon";
                  const meta = getTiendaMeta(tiendaActual);
                  const TiendaIcon = meta.Icon;

                  return (
                    <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/60 p-4 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                          <Gift className="h-4 w-4 shrink-0 text-amber-600" />
                          <span>Mesa de Regalos del Evento</span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-[11px] font-extrabold ${meta.badgeClass}`}
                        >
                          <TiendaIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>{tiendaActual}</span>
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#55617C]">
                        El anfitrión compartió el siguiente enlace a su lista o
                        carrito de regalos sugeridos:
                      </p>
                      <a
                        href={hrefUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex flex-col items-stretch justify-between gap-2.5 rounded-xl border border-amber-300 bg-white px-4 py-3 text-xs shadow-2xs transition hover:border-amber-500 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 truncate font-extrabold text-[#1E2235]">
                            <ShoppingCart className="h-4 w-4 shrink-0 text-amber-600" />
                            <span className="truncate">
                              Lista de Regalos en {tiendaActual}
                            </span>
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-[#7B819A]">
                            {hrefUrl}
                          </p>
                        </div>
                        <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-amber-600">
                          <span>Abrir Lista de Regalos</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </span>
                      </a>
                    </div>
                  );
                })()}
            </div>

            {/* Columna Derecha: Pase del Invitado, Código QR y Confirmación RSVP */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-2xl border border-[#DCE0E8] bg-[#141728] p-5 text-white shadow-[0_12px_28px_rgba(15,20,40,0.22)] sm:p-6">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 shrink-0 text-[#4CE0B3]" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">
                      Tu Pase de Invitado
                    </h4>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      invitadoData?.estado_rsvp === "Confirmado"
                        ? "bg-[#10B981]/25 text-[#4CE0B3] ring-1 ring-[#4CE0B3]/40"
                        : invitadoData?.estado_rsvp === "Rechazado"
                        ? "bg-rose-500/25 text-rose-300 ring-1 ring-rose-400/40"
                        : "bg-amber-400/25 text-amber-300 ring-1 ring-amber-400/40"
                    }`}
                  >
                    {invitadoData?.estado_rsvp || "Pendiente"}
                  </span>
                </div>

                {/* Resumen de datos registrados del invitado */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-xl bg-white/5 px-3 py-2.5 sm:px-3.5">
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-gray-400">
                      <User className="h-3.5 w-3.5 shrink-0 text-[#4BA6FF]" />
                      <span>Invitado:</span>
                    </span>
                    <span className="min-w-0 truncate font-extrabold text-white">
                      {invitadoData?.nombre || "Invitado"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-xl bg-white/5 px-3 py-2.5 sm:px-3.5">
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-gray-400">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#4BA6FF]" />
                      <span>Correo:</span>
                    </span>
                    <span className="min-w-0 truncate font-semibold text-gray-200">
                      {invitadoData?.correo || "Sin correo"}
                    </span>
                  </div>

                  {invitadoData?.telefono && (
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-xl bg-white/5 px-3 py-2.5 sm:px-3.5">
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-gray-400">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-[#4BA6FF]" />
                        <span>Teléfono:</span>
                      </span>
                      <span className="min-w-0 truncate font-semibold text-gray-200">
                        {invitadoData.telefono}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-xl bg-white/5 px-3 py-2.5 sm:px-3.5">
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-gray-400">
                      <Users className="h-3.5 w-3.5 shrink-0 text-[#4CE0B3]" />
                      <span>Pases Asignados:</span>
                    </span>
                    <span className="font-extrabold text-[#4CE0B3]">
                      {invitadoData?.pases || 1} pase(s) ({invitadoData?.adultos ?? 1}{" "}
                      adultos, {invitadoData?.ninos ?? 0} niños)
                    </span>
                  </div>

                  {invitadoData?.nota_alimentacion && (
                    <div className="rounded-xl bg-white/5 px-3 py-2.5 sm:px-3.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Nota / Restricción alimentaria:
                      </span>
                      <p className="mt-0.5 break-words text-xs text-gray-200">
                        {invitadoData.nota_alimentacion}
                      </p>
                    </div>
                  )}
                </div>

                {/* Código QR cuando la asistencia está confirmada */}
                {invitadoData?.estado_rsvp === "Confirmado" &&
                  Boolean(
                    eventoData?.confirmar_acceso_qr ??
                      eventoData?.permitir_acompanantes ??
                      true
                  ) && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-[#0D0F1C] p-4 text-center">
                      <div className="mx-auto inline-block rounded-2xl bg-white p-3 shadow-lg">
                        <svg
                          viewBox="0 0 21 21"
                          className="h-32 w-32 sm:h-36 sm:w-36"
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
                                  fill="#141728"
                                />
                              ) : null
                            )
                          )}
                        </svg>
                      </div>
                      <p className="mt-2.5 font-mono text-xs font-extrabold text-[#4BA6FF]">
                        TOKEN: {invitadoData?.token_invitacion || "ACTIVO"}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        Presenta este código QR en la entrada del evento.
                      </p>
                    </div>
                  )}

                {rsvpFeedback && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#4CE0B3]/40 bg-[#10B981]/20 px-3.5 py-2.5 text-xs font-bold text-[#4CE0B3]">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{rsvpFeedback}</span>
                  </div>
                )}

                {rsvpError && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/20 px-3.5 py-2.5 text-xs font-bold text-rose-200">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>{rsvpError}</span>
                  </div>
                )}

                {/* Botón para confirmar o modificar asistencia */}
                {!editingRsvp && !isFechaLimiteVencida && (
                  <button
                    type="button"
                    onClick={() => {
                      setRsvpFeedback("");
                      setRsvpError("");
                      setEditingRsvp(true);
                    }}
                    className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2B7FFF] to-[#4F46E5] px-4 py-3 text-xs font-extrabold text-white shadow-md transition hover:brightness-110"
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {invitadoData?.estado_rsvp === "Confirmado"
                        ? "Modificar mi Confirmación o Datos"
                        : "Confirmar mi Asistencia Ahora"}
                    </span>
                  </button>
                )}

                {/* Formulario Inline para confirmar o actualizar datos */}
                {editingRsvp && (
                  <form
                    onSubmit={handleSaveRsvp}
                    className="mt-4 space-y-3 border-t border-white/10 pt-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#4BA6FF]">
                        <ClipboardCheck className="h-4 w-4 shrink-0" />
                        <span>Actualizar Confirmación</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingRsvp(false)}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs text-gray-400 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5 shrink-0" />
                        <span>Cancelar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRsvpForm((prev) => ({
                            ...prev,
                            estado_rsvp: "Confirmado",
                          }))
                        }
                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-extrabold transition ${
                          rsvpForm.estado_rsvp === "Confirmado"
                            ? "border-[#10B981] bg-[#10B981] text-white"
                            : "border-white/15 bg-white/5 text-gray-300 hover:text-white"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Sí, asistiré</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setRsvpForm((prev) => ({
                            ...prev,
                            estado_rsvp: "Rechazado",
                          }))
                        }
                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-extrabold transition ${
                          rsvpForm.estado_rsvp === "Rechazado"
                            ? "border-rose-400 bg-rose-500/30 text-rose-200"
                            : "border-white/15 bg-white/5 text-gray-300 hover:text-white"
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>No asistiré</span>
                      </button>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-gray-300">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        required
                        value={rsvpForm.nombre}
                        onChange={(e) =>
                          setRsvpForm((prev) => ({
                            ...prev,
                            nombre: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/15 bg-[#0D0F1C] px-3 py-2 text-xs text-white outline-none focus:border-[#4BA6FF]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-gray-300">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={rsvpForm.telefono}
                        onChange={(e) =>
                          setRsvpForm((prev) => ({
                            ...prev,
                            telefono: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/15 bg-[#0D0F1C] px-3 py-2 text-xs text-white outline-none focus:border-[#4BA6FF]"
                      />
                    </div>

                    {rsvpForm.estado_rsvp === "Confirmado" && (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-gray-300">
                              Adultos
                            </label>
                            <input
                              type="number"
                              min={soloNinos ? 0 : 1}
                              max={25}
                              disabled={soloNinos}
                              value={soloNinos ? 0 : rsvpForm.adultos}
                              onChange={(e) =>
                                setRsvpForm((prev) => ({
                                  ...prev,
                                  adultos: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-white/15 bg-[#0D0F1C] px-3 py-2 text-xs text-white outline-none focus:border-[#4BA6FF] disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-gray-300">
                              Niños
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={25}
                              disabled={soloAdultos}
                              value={soloAdultos ? 0 : rsvpForm.ninos}
                              onChange={(e) =>
                                setRsvpForm((prev) => ({
                                  ...prev,
                                  ninos: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-white/15 bg-[#0D0F1C] px-3 py-2 text-xs text-white outline-none focus:border-[#4BA6FF] disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-gray-300">
                            Restricción alimentaria o nota para el anfitrión
                          </label>
                          <input
                            type="text"
                            value={rsvpForm.nota_alimentacion}
                            onChange={(e) =>
                              setRsvpForm((prev) => ({
                                ...prev,
                                nota_alimentacion: e.target.value,
                              }))
                            }
                            placeholder="Ej. Vegetariano, sin gluten..."
                            className="w-full rounded-xl border border-white/15 bg-[#0D0F1C] px-3 py-2 text-xs text-white outline-none focus:border-[#4BA6FF]"
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={submittingRsvp}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#10B981] py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#059669] disabled:opacity-50"
                    >
                      <Check className="h-4 w-4 shrink-0" />
                      <span>
                        {submittingRsvp
                          ? "Guardando..."
                          : "Guardar Confirmación"}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ZONA 2: FOTOS Y REELS DEL EVENTO (SI EL ANFITRIÓN COMPARTIÓ EL ÁLBUM)
         ===================================================================== */}
      <section
        ref={fotosZoneRef}
        className="overflow-hidden rounded-[22px] border border-[#DCE0E8] bg-white p-3.5 shadow-[0_12px_32px_rgba(30,42,70,0.06)] sm:p-6 lg:p-8"
      >
        <div className="mb-5 flex flex-col gap-2.5 border-b border-[#ECEFF6] pb-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#059669]">
              <Camera className="h-4 w-4 shrink-0" />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#059669]">
                ZONA 2 • ÁLBUM DIGITAL Y RECUERDOS MULTIMEDIA
              </span>
              <h3 className="text-sm font-extrabold text-[#1E2235] sm:text-base">
                Fotos y Reels del Evento
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 self-start rounded-full px-3 py-1 text-[11px] font-extrabold sm:self-auto sm:text-xs ${
              compartirAlbumActivo
                ? "bg-[#10B981]/15 text-[#059669]"
                : "bg-amber-500/15 text-amber-700"
            }`}
          >
            {compartirAlbumActivo ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Compartido por el Anfitrión</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>Pendiente de habilitar por el anfitrión</span>
              </>
            )}
          </span>
        </div>

        {compartirAlbumActivo ? (
          <CamaraAlbumEvento evento={eventoData} modoInvitado={true} />
        ) : (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-10 text-center sm:py-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2D3047]/10 text-[#2D3047]">
              <div className="flex items-center gap-1">
                <Camera className="h-6 w-6 shrink-0 text-[#2B7FFF]" />
                <Film className="h-5 w-5 shrink-0 text-[#E1306C]" />
              </div>
            </div>
            <h4 className="mt-3 text-sm font-extrabold text-[#1E2235] sm:text-base">
              El anfitrión aún no ha compartido las Fotos y Reels de este evento
            </h4>
            <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-[#55617C]">
              Cuando el organizador active la casilla{" "}
              <strong>&ldquo;Compartir Fotos y Reels a invitados&rdquo;</strong>{" "}
              en el álbum del evento, aquí aparecerán automáticamente todas las
              fotografías y reels en Alta Definición para que puedas verlos y
              descargarlos.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================================
          ZONA 3: ITINERARIO DEL EVENTO (CRONOGRAMA DE ACTIVIDADES Y HORARIOS)
         ===================================================================== */}
      <section
        ref={itinerarioZoneRef}
        className="overflow-hidden rounded-[22px] border border-[#DCE0E8] bg-white p-3.5 shadow-[0_12px_32px_rgba(30,42,70,0.06)] sm:p-6 lg:p-8"
      >
        <div className="mb-5 flex flex-col gap-2.5 border-b border-[#ECEFF6] pb-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#6D28D9]/12 text-[#6D28D9]">
              <Clock className="h-4 w-4 shrink-0" />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#6D28D9]">
                ZONA 3 • PROGRAMA DE ACTIVIDADES Y HORARIOS
              </span>
              <h3 className="text-sm font-extrabold text-[#1E2235] sm:text-base">
                Itinerario del Evento
              </h3>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 self-start rounded-full bg-[#F3E8FF] px-3 py-1 text-[11px] font-extrabold text-[#6D28D9] sm:self-auto sm:text-xs">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {validItinerarioItems.length}{" "}
              {validItinerarioItems.length === 1
                ? "actividad programada"
                : "actividades programadas"}
            </span>
          </span>
        </div>

        {validItinerarioItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-10 text-center sm:py-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#6D28D9]">
              <Clock className="h-7 w-7 shrink-0" />
            </div>
            <h4 className="mt-3 text-sm font-extrabold text-[#1E2235] sm:text-base">
              Aún no hay actividades registradas en el itinerario
            </h4>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-[#55617C]">
              Cuando el anfitrión publique los horarios y actividades del
              evento, podrás consultar el programa paso a paso en esta sección.
            </p>
          </div>
        ) : (
          <div className="relative space-y-3.5 before:absolute before:top-4 before:bottom-4 before:left-5 before:hidden before:w-0.5 before:bg-gradient-to-b before:from-[#6D28D9] before:via-[#2B7FFF] before:to-[#10B981] sm:before:block">
            {validItinerarioItems.map((act, idx) => (
              <div
                key={act.iditem || idx}
                className="relative flex flex-col gap-3 rounded-2xl border border-[#E5E9F2] bg-[#F8FAFC] p-3.5 transition hover:border-[#6D28D9]/40 hover:bg-white hover:shadow-md sm:ml-12 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                {/* Nodo numérico en la línea de tiempo (visible en sm+) */}
                <span className="hidden sm:absolute sm:-left-[3.25rem] sm:flex sm:h-8 sm:w-8 sm:items-center sm:justify-center sm:rounded-full sm:border-2 sm:border-white sm:bg-[#6D28D9] sm:text-xs sm:font-extrabold sm:text-white sm:shadow-md">
                  {idx + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-lg bg-[#6D28D9] px-2 py-0.5 text-[10px] font-extrabold text-white sm:hidden">
                      #{idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#6D28D9]/25 bg-[#F3E8FF] px-2.5 py-1 text-xs font-extrabold text-[#6D28D9]">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {act.horario_inicial || "--:--"}
                        {act.horario_final ? ` - ${act.horario_final}` : ""} hrs
                      </span>
                    </span>
                    <h4 className="min-w-0 break-words text-sm font-extrabold text-[#1E2235] sm:text-base">
                      {act.titulo || `Actividad ${idx + 1}`}
                    </h4>
                  </div>

                  {act.descripcion && (
                    <p className="mt-2 break-words text-xs leading-relaxed text-[#55617C] sm:text-sm">
                      {act.descripcion}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#DCE0E8] bg-white px-3 py-1 text-[11px] font-bold text-[#55617C] sm:self-center">
                  <Bell className="h-3 w-3 shrink-0 text-[#6D28D9]" />
                  <span>Actividad {idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DetalleInvitacionRecibida;
