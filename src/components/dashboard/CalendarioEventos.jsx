import { useMemo, useRef, useState } from "react";

const DEFAULT_INVITACION_THUMB = "/default-invitacion.svg";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAY_NAMES = [
  { short: "L", medium: "Lun" },
  { short: "M", medium: "Mar" },
  { short: "Mi", medium: "Mié" },
  { short: "J", medium: "Jue" },
  { short: "V", medium: "Vie" },
  { short: "S", medium: "Sáb" },
  { short: "D", medium: "Dom" },
];

// Paleta de colores armónica con el Dashboard ("Tripler" style)
const EVENT_PALETTES = [
  {
    badgeBg: "bg-[#86B59F] text-white shadow-[#86B59F]/30",
    cardBg: "bg-[#F2F8F5] border border-[#DCECE4] border-l-4 border-l-[#86B59F]",
    avatarBg: "bg-[#86B59F] text-white",
    accentText: "text-[#588B73]",
    ringColor: "ring-[#86B59F]",
  },
  {
    badgeBg: "bg-[#4A4A8A] text-white shadow-[#4A4A8A]/30",
    cardBg: "bg-[#F3F3FA] border border-[#E2E2F2] border-l-4 border-l-[#4A4A8A]",
    avatarBg: "bg-[#4A4A8A] text-white",
    accentText: "text-[#4A4A8A]",
    ringColor: "ring-[#4A4A8A]",
  },
  {
    badgeBg: "bg-[#FF5B4D] text-white shadow-[#FF5B4D]/30",
    cardBg: "bg-[#FFF4F2] border border-[#FCDCD8] border-l-4 border-l-[#FF5B4D]",
    avatarBg: "bg-[#FF5B4D] text-white",
    accentText: "text-[#E6483B]",
    ringColor: "ring-[#FF5B4D]",
  },
  {
    badgeBg: "bg-[#C9B16B] text-white shadow-[#C9B16B]/30",
    cardBg: "bg-[#FAF7EE] border border-[#EFE6CC] border-l-4 border-l-[#C9B16B]",
    avatarBg: "bg-[#C9B16B] text-white",
    accentText: "text-[#9A8035]",
    ringColor: "ring-[#C9B16B]",
  },
  {
    badgeBg: "bg-[#14141F] text-white shadow-[#14141F]/25",
    cardBg: "bg-[#F6F7F9] border border-[#E4E6EE] border-l-4 border-l-[#14141F]",
    avatarBg: "bg-[#14141F] text-white",
    accentText: "text-[#14141F]",
    ringColor: "ring-[#14141F]",
  },
];

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const clean = String(dateStr).slice(0, 10);
  const parts = clean.split("-");
  if (parts.length !== 3) return clean;
  const year = Number(parts[0]);
  const monthIdx = Number(parts[1]) - 1;
  const day = parts[2];
  const shortMonth = (MONTH_NAMES[monthIdx] || "").slice(0, 3);
  return `${shortMonth} ${day}, ${year}`;
}

function CalendarioEventos({ eventos = [], onOpenEvento, onCreateNew }) {
  const calendarRef = useRef(null);

  // Inicializar el calendario en el mes del próximo evento (o el mes actual si no hay eventos)
  const initialDate = useMemo(() => {
    if (eventos.length > 0) {
      const sorted = [...eventos]
        .map((e) => String(e.fecha_evento || "").slice(0, 10))
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort();
      if (sorted.length > 0) {
        const [y, m] = sorted[0].split("-").map(Number);
        return { year: y, month: m - 1 };
      }
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, [eventos]);

  const [viewYear, setViewYear] = useState(initialDate.year);
  const [viewMonth, setViewMonth] = useState(initialDate.month);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [highlightedEventoId, setHighlightedEventoId] = useState(null);

  // Asignar un índice ("01", "02", ...) y paleta consistente a cada evento ordenado por fecha
  const enrichedEventos = useMemo(() => {
    const sorted = [...eventos].sort((a, b) => {
      const da = String(a.fecha_evento || "").slice(0, 10);
      const db = String(b.fecha_evento || "").slice(0, 10);
      return da.localeCompare(db);
    });
    return sorted.map((ev, idx) => {
      const dateStr = String(ev.fecha_evento || "").slice(0, 10);
      const codeNum = String(idx + 1).padStart(2, "0");
      const palette = EVENT_PALETTES[idx % EVENT_PALETTES.length];
      return {
        ...ev,
        dateStr,
        codeNum,
        palette,
      };
    });
  }, [eventos]);

  // Mapa rápido fecha YYYY-MM-DD -> lista de eventos en ese día
  const eventsByDate = useMemo(() => {
    const map = {};
    for (const ev of enrichedEventos) {
      if (!ev.dateStr) continue;
      if (!map[ev.dateStr]) map[ev.dateStr] = [];
      map[ev.dateStr].push(ev);
    }
    return map;
  }, [enrichedEventos]);

  // Construir las 35 o 42 celdas (semanas de 7 días empezando en Lunes)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Días del mes anterior
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNum);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate[dateStr] || [],
      });
    }

    // Días del mes actual
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const m = String(viewMonth + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      const dateStr = `${viewYear}-${m}-${d}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: true,
        events: eventsByDate[dateStr] || [],
      });
    }

    // Días del mes siguiente hasta completar 35 o 42 celdas
    const totalNeeded = cells.length > 35 ? 42 : 35;
    let nextDay = 1;
    while (cells.length < totalNeeded) {
      const nextDate = new Date(viewYear, viewMonth + 1, nextDay);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, "0");
      const d = String(nextDay).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      cells.push({
        dayNum: nextDay,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate[dateStr] || [],
      });
      nextDay++;
    }

    return cells;
  }, [viewYear, viewMonth, eventsByDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    const todayIso = now.toISOString().slice(0, 10);
    setSelectedDateStr(todayIso);
    const evToday = eventsByDate[todayIso]?.[0];
    setHighlightedEventoId(evToday ? evToday.idevento : null);
  };

  const handleFocusEventOnCalendar = (ev, shouldScrollOnMobile = false) => {
    setHighlightedEventoId(ev.idevento);
    setSelectedDateStr(ev.dateStr);
    if (ev.dateStr && /^\d{4}-\d{2}-\d{2}$/.test(ev.dateStr)) {
      const [y, m] = ev.dateStr.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
    if (
      shouldScrollOnMobile &&
      typeof window !== "undefined" &&
      window.innerWidth < 1024 &&
      calendarRef.current
    ) {
      calendarRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedDayEvents = selectedDateStr
    ? eventsByDate[selectedDateStr] || []
    : [];

  return (
    <div className="font-wallet grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
      {/* =====================================================================
          COLUMNA IZQUIERDA (7 COLS EN LG, 8 COLS EN XL): CALENDARIO MENSUAL
         ===================================================================== */}
      <div
        ref={calendarRef}
        className="min-w-0 rounded-2xl border border-[#ECEEF2] bg-white p-3.5 shadow-[0_14px_38px_rgba(20,20,31,0.05)] sm:rounded-3xl sm:p-6 lg:col-span-7 xl:col-span-8 xl:p-8"
      >
        {/* Cabecera del Mes y Controles de Navegación */}
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold tracking-tight text-[#14141F] sm:text-2xl">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <p className="mt-0.5 text-[11px] text-[#8A8D9F] sm:text-xs">
              Toca un día señalado o una tarjeta para ubicar tu evento
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {selectedDateStr && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDateStr(null);
                  setHighlightedEventoId(null);
                }}
                className="rounded-full bg-[#F3F3FA] px-3 py-1.5 text-[11px] font-bold text-[#4A4A8A] transition hover:bg-[#4A4A8A] hover:text-white sm:px-3.5 sm:text-xs"
              >
                Ver Todos ({enrichedEventos.length})
              </button>
            )}
            <button
              type="button"
              onClick={handleGoToToday}
              className="rounded-full border border-[#E4E6EE] bg-[#F6F7F9] px-3 py-1.5 text-[11px] font-bold text-[#14141F] transition hover:border-[#4A4A8A] hover:bg-[#4A4A8A] hover:text-white sm:text-xs"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E6EE] bg-[#F6F7F9] text-xs font-bold text-[#14141F] transition hover:border-[#4A4A8A] hover:bg-[#4A4A8A] hover:text-white sm:h-9 sm:w-9 sm:text-sm"
              aria-label="Mes anterior"
            >
              ←
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E6EE] bg-[#F6F7F9] text-xs font-bold text-[#14141F] transition hover:border-[#4A4A8A] hover:bg-[#4A4A8A] hover:text-white sm:h-9 sm:w-9 sm:text-sm"
              aria-label="Mes siguiente"
            >
              →
            </button>
          </div>
        </div>

        {/* Barra de Días de la Semana (Adaptativa para Móvil / Tablet / Desktop) */}
        <div className="mb-2.5 grid grid-cols-7 rounded-xl bg-[#F4F5F7] py-2 text-center text-[11px] font-extrabold text-[#14141F] sm:mb-3 sm:rounded-2xl sm:py-3 sm:text-xs">
          {DAY_NAMES.map((day) => (
            <div key={day.medium}>
              <span className="sm:hidden">{day.short}</span>
              <span className="hidden sm:inline">{day.medium}</span>
            </div>
          ))}
        </div>

        {/* Cuadrícula del Calendario */}
        <div className="grid grid-cols-7 overflow-hidden rounded-xl border-l border-t border-[#ECEEF2] sm:rounded-2xl">
          {calendarCells.map((cell) => {
            const isSelected = selectedDateStr === cell.dateStr;
            const isToday = todayStr === cell.dateStr;
            const hasEvents = cell.events.length > 0;

            return (
              <div
                key={cell.dateStr}
                onClick={() => {
                  if (hasEvents) {
                    setSelectedDateStr(cell.dateStr);
                    setHighlightedEventoId(cell.events[0].idevento);
                  } else {
                    setSelectedDateStr(isSelected ? null : cell.dateStr);
                    setHighlightedEventoId(null);
                  }
                }}
                className={`min-h-[62px] min-w-0 cursor-pointer border-b border-r border-[#ECEEF2] p-1 transition sm:min-h-[88px] sm:p-2 md:min-h-[104px] md:p-2.5 xl:min-h-[112px] xl:p-3 ${
                  !cell.isCurrentMonth
                    ? "bg-[#FAFBFD] text-[#C5C8D6]"
                    : isSelected
                    ? "bg-[#F3F3FA]/75 ring-2 ring-inset ring-[#4A4A8A]"
                    : hasEvents
                    ? "bg-[#F6F7F9] hover:bg-[#F3F3FA]/50"
                    : "bg-white hover:bg-[#FAFBFD]"
                }`}
              >
                {/* Número del día */}
                <div className="flex items-center justify-between gap-0.5">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold sm:h-6 sm:w-6 sm:text-xs ${
                      isToday
                        ? "bg-[#FF5B4D] text-white shadow-2xs"
                        : cell.isCurrentMonth
                        ? "text-[#14141F]"
                        : "text-[#C5C8D6]"
                    }`}
                  >
                    {String(cell.dayNum).padStart(2, "0")}
                  </span>

                  {hasEvents && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#86B59F] sm:h-2 sm:w-2" />
                  )}
                </div>

                {/* Insignias de Eventos dentro de la celda del día */}
                {hasEvents && (
                  <div className="mt-1 flex flex-col gap-1 sm:mt-1.5">
                    {cell.events.map((ev) => {
                      const isEvHighlighted =
                        highlightedEventoId === ev.idevento;
                      return (
                        <button
                          key={ev.idevento}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFocusEventOnCalendar(ev, false);
                          }}
                          title={`${ev.nombre} (${ev.hora_evento || "20:00"} hrs)`}
                          className={`group flex w-full min-w-0 items-center justify-center gap-1 rounded-md px-1 py-0.5 text-[9px] font-extrabold shadow-xs transition sm:justify-start sm:rounded-lg sm:px-2 sm:py-1 sm:text-[10px] ${
                            ev.palette.badgeBg
                          } ${
                            isEvHighlighted
                              ? "ring-2 ring-[#14141F]"
                              : "opacity-95 hover:opacity-100"
                          }`}
                        >
                          <span className="shrink-0">{ev.codeNum}</span>
                          <span className="hidden truncate md:inline">
                            {ev.nombre}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Botón "Crear Evento" dentro del mismo recuadro del día seleccionado */}
                {isSelected && (
                  <div className="mt-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateNew(cell.dateStr);
                      }}
                      className="flex w-full items-center justify-center gap-1 rounded-md bg-[#4A4A8A] px-1 py-1 text-center text-[8px] leading-tight font-extrabold text-white shadow-xs transition hover:bg-[#FF5B4D] sm:rounded-lg sm:px-2 sm:py-1.5 sm:text-[10px]"
                    >
                      <span className="hidden sm:inline">＋</span>
                      <span>Crear Evento</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Vista rápida en Móvil y Tablet Vertical cuando se toca un día con eventos */}
        {selectedDayEvents.length > 0 && (
          <div className="mt-4 rounded-2xl border border-[#ECEEF2] bg-[#F6F7F9] p-3.5 lg:hidden">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4A4A8A]">
                Eventos del {formatShortDate(selectedDateStr)}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="text-xs font-bold text-[#8A8D9F] hover:text-[#14141F]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {selectedDayEvents.map((ev) => {
                const coverThumb =
                  String(ev.imagen_portada || "").trim() ||
                  DEFAULT_INVITACION_THUMB;
                return (
                  <div
                    key={ev.idevento}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-2.5 shadow-2xs"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${ev.palette.avatarBg}`}
                      >
                        {ev.codeNum}
                      </span>
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#ECEEF2] bg-[#2D3047] shadow-2xs">
                        <img
                          src={coverThumb}
                          alt={`Invitación de ${ev.nombre}`}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_INVITACION_THUMB;
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-[#14141F]">
                          {ev.nombre}
                        </p>
                        <p className="truncate text-[10px] text-[#8A8D9F]">
                          ⏰ {ev.hora_evento || "20:00"} hrs • 📍{" "}
                          {ev.lugar || "Salón por definir"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenEvento(ev.idevento, "invitation")}
                      className="shrink-0 rounded-lg bg-[#4A4A8A] px-2.5 py-1.5 text-[10px] font-extrabold text-white shadow-2xs transition hover:bg-[#3F3F7A]"
                    >
                      Abrir →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          COLUMNA DERECHA (5 COLS EN LG, 4 COLS EN XL): TARJETAS DE EVENTOS
         ===================================================================== */}
      <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#ECEEF2] bg-white p-4 shadow-[0_14px_38px_rgba(20,20,31,0.05)] sm:rounded-3xl sm:p-6 lg:col-span-5 xl:col-span-4 xl:p-7">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECEEF2] pb-4">
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold tracking-tight text-[#14141F] sm:text-xl">
                Eventos Agendados
              </h3>
              <p className="mt-0.5 truncate text-xs text-[#8A8D9F]">
                {selectedDateStr
                  ? `Fecha seleccionada: ${formatShortDate(selectedDateStr)}`
                  : `${enrichedEventos.length} eventos registrados en tu calendario`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCreateNew(selectedDateStr || "")}
              className="shrink-0 rounded-full bg-[#FF5B4D] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(255,91,77,0.3)] transition hover:bg-[#F24C3E]"
            >
              ＋ Nuevo
            </button>
          </div>

          {enrichedEventos.length === 0 ? (
            <div className="py-10 text-center sm:py-12">
              <p className="text-sm font-bold text-[#14141F]">
                No tienes eventos programados
              </p>
              <p className="mt-1 text-xs text-[#8A8D9F]">
                Crea tu primer evento para visualizarlo en el calendario.
              </p>
              <button
                type="button"
                onClick={() => onCreateNew(selectedDateStr || "")}
                className="mt-4 rounded-full bg-[#FF5B4D] px-5 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(255,91,77,0.3)] transition hover:bg-[#F24C3E]"
              >
                ＋ Crear Evento
              </button>
            </div>
          ) : (
            /* En Tablet vertical (md) muestra 2 columnas; en Móvil y Desktop lateral muestra 1 columna */
            <div className="mt-3 grid max-h-[540px] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:mt-4 md:grid-cols-2 lg:max-h-[620px] lg:grid-cols-1">
              {enrichedEventos.map((ev) => {
                const isSelectedCard =
                  highlightedEventoId === ev.idevento ||
                  selectedDateStr === ev.dateStr;
                const coverThumb =
                  String(ev.imagen_portada || "").trim() ||
                  DEFAULT_INVITACION_THUMB;

                return (
                  <div
                    key={ev.idevento}
                    onClick={() => handleFocusEventOnCalendar(ev, true)}
                    className={`min-w-0 cursor-pointer rounded-2xl px-3 py-2 transition hover:-translate-y-0.5 hover:shadow-md sm:px-3.5 sm:py-2.5 ${
                      ev.palette.cardBg
                    } ${
                      isSelectedCard
                        ? `ring-2 ${ev.palette.ringColor} shadow-md`
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        {/* Fila superior en una sola línea: Insignia circular + Tipo + Fecha */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold shadow-xs ${ev.palette.avatarBg}`}
                            >
                              {ev.codeNum}
                            </span>
                            <span className="truncate rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#14141F] shadow-2xs">
                              {ev.tipo_evento || "Evento"}
                            </span>
                          </div>
                          <span className="shrink-0 text-[10px] font-bold text-[#8A8D9F]">
                            {formatShortDate(ev.dateStr)}
                          </span>
                        </div>

                        {/* Título del Evento y Horario/Lugar compactos */}
                        <div className="mt-1.5">
                          <h4 className="truncate text-xs font-extrabold leading-tight tracking-tight text-[#14141F] sm:text-sm">
                            {ev.nombre}
                          </h4>
                          <p className="mt-0.5 truncate text-[11px] font-medium leading-tight text-[#8A8D9F]">
                            ⏰ {ev.hora_evento || "20:00"} hrs &nbsp;•&nbsp; 📍{" "}
                            {ev.lugar || "Salón por definir"}
                          </p>
                        </div>
                      </div>

                      {/* Miniatura de la invitación virtual (o imagen genérica automática si no tiene) */}
                      <div className="h-12 w-10 shrink-0 overflow-hidden rounded-xl border border-white bg-[#2D3047] shadow-xs">
                        <img
                          src={coverThumb}
                          alt={`Invitación de ${ev.nombre}`}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_INVITACION_THUMB;
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Pie de tarjeta compacto: Confirmados y botón para abrir el Gestor */}
                    <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-[#14141F]/10 pt-1.5 text-[10px]">
                      <span className="font-bold text-[#14141F]">
                        👥 {ev.pases_confirmados || 0}/{ev.capacidad} confirmados
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEvento(ev.idevento, "invitation");
                        }}
                        className={`shrink-0 font-extrabold ${ev.palette.accentText} hover:underline`}
                      >
                        Abrir Evento →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarioEventos;
