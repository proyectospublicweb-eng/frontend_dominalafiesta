import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthModal from "../components/AuthModal.jsx";

const SERVICES = [
  {
    icon: "💌",
    tag: "DISEÑO INTERACTIVO",
    title: "Invitaciones Interactivas",
    desc: "Crea invitaciones digitales con temas personalizados, póster principal, código de vestimenta y enlace permanente.",
    gradient: "from-[#FF8EC7] via-[#C996FF] to-[#7BE7FF]",
    accent: "text-[#FF8EC7]",
  },
  {
    icon: "📋",
    tag: "MÉTRICAS AL INSTANTE",
    title: "Control en Vivo",
    desc: "Recibe confirmaciones de asistencia, conteo de adultos y niños, y requerimientos alimenticios al instante.",
    gradient: "from-[#7BE7FF] via-[#8EA2FF] to-[#D49BFF]",
    accent: "text-[#7BE7FF]",
  },
  {
    icon: "📲",
    tag: "ENVÍO AUTOMATIZADO",
    title: "Difusión por WhatsApp",
    desc: "Envía pases individuales o campañas por correo HTML con plantillas listas para personalizar con un clic.",
    gradient: "from-[#4CE0B3] via-[#6FD6FF] to-[#9B8BFF]",
    accent: "text-[#4CE0B3]",
  },
  {
    icon: "💰",
    tag: "FINANZAS CLARAS",
    title: "Presupuesto y Pagos",
    desc: "Registra proveedores, anticipos y liquidaciones comparando el costo estimado frente al monto real pagado.",
    gradient: "from-[#FFC46B] via-[#FF8DA1] to-[#C28BFF]",
    accent: "text-[#FFC46B]",
  },
  {
    icon: "🔳",
    tag: "CHECK-IN EN PUERTA",
    title: "Acceso con Código QR",
    desc: "Genera e imprime el código QR oficial de recepción en formato SVG para validar entradas en puerta.",
    gradient: "from-[#B594FF] via-[#7A8CFF] to-[#68E8D8]",
    accent: "text-[#B594FF]",
  },
];

const GUARANTEES = [
  {
    icon: "🛡️",
    title: "Enlaces Permanentes Garantizados",
    desc: "Actualiza horarios, salones o colores en cualquier momento sin que los enlaces enviados dejen de funcionar.",
    badgeBg: "from-[#FF76A8] to-[#FF9F68]",
    glow: "shadow-[#FF76A8]/35",
  },
  {
    icon: "⚡",
    title: "Sincronización en Tiempo Real",
    desc: "Cada vez que un invitado confirma o actualiza sus pases, tus métricas y mesas se actualizan al segundo.",
    badgeBg: "from-[#35E2B4] to-[#12B886]",
    glow: "shadow-[#35E2B4]/35",
  },
  {
    icon: "📱",
    title: "Diseño 100% Adaptable (Móvil y PC)",
    desc: "Tus invitados disfrutan una experiencia fluida desde cualquier smartphone sin instalar aplicaciones.",
    badgeBg: "from-[#82E0FF] to-[#5C7CFA]",
    glow: "shadow-[#82E0FF]/35",
  },
  {
    icon: "🔔",
    title: "Recordatorios Automatizados",
    desc: "Programa avisos automáticos para los invitados que aún están pendientes de confirmar días antes del evento.",
    badgeBg: "from-[#FFB84D] to-[#FF7B39]",
    glow: "shadow-[#FFB84D]/35",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Modalidades de Pase Flexibles",
    desc: "Configura pases para solo adultos, familias con niños o pases individuales con total precisión.",
    badgeBg: "from-[#C882FF] to-[#7950F2]",
    glow: "shadow-[#C882FF]/35",
  },
  {
    icon: "📊",
    title: "Importación y Exportación CSV",
    desc: "Carga listas masivas desde Excel en segundos y descarga reportes completos para tu banquetera.",
    badgeBg: "from-[#63E6BE] to-[#3BC9DB]",
    glow: "shadow-[#63E6BE]/35",
  },
];

const HOW_IT_WORKS = [
  {
    num: "1",
    icon: "✨",
    title: "Configura tu evento en minutos",
    desc: "Define el nombre, fecha, lugar, modalidad de pases y elige el estilo visual de tu invitación digital en nuestro Wizard.",
    iconBg: "from-[#FF85B3] to-[#9B6BFF]",
  },
  {
    num: "2",
    icon: "📲",
    title: "Comparte pases por WhatsApp o Email",
    desc: "Importa tu lista de invitados y envía enlaces únicos personalizados para que confirmen su asistencia desde su celular.",
    iconBg: "from-[#64E8DE] to-[#5B86E5]",
  },
  {
    num: "3",
    icon: "🔳",
    title: "Organiza mesas, presupuesto y recepción QR",
    desc: "Asigna lugares en el mapa de mesas, controla tus gastos con proveedores y recibe a tus invitados con código QR.",
    iconBg: "from-[#FFB86C] to-[#FF6B9E]",
  },
];

const FAQS = [
  {
    q: "¿Mis invitados necesitan descargar alguna aplicación para confirmar?",
    a: "No. El enlace de tu invitación se abre directamente en cualquier navegador móvil o de escritorio y permite confirmar asistencia en segundos.",
  },
  {
    q: "¿Qué pasa si cambio la hora o el salón después de enviar las invitaciones?",
    a: "Tu enlace es permanente. Cualquier cambio que guardes en el Gestor del Evento se refleja de inmediato para todos tus invitados.",
  },
  {
    q: "¿Puedo restringir pases para que sean solo adultos?",
    a: "Sí, puedes elegir entre 'Solo adultos', 'Adultos y niños', 'Padre e hijos' u otras modalidades y se mostrará claramente en la invitación.",
  },
  {
    q: "¿Cómo funciona la importación desde Excel?",
    a: "Puedes descargar nuestra plantilla CSV de ejemplo, pegar tus contactos y subirlos en un solo paso con vista previa antes de guardar.",
  },
];

function getTimeRemaining(targetDate) {
  const total = Math.max(0, targetDate - Date.now());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function LandingPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [openFaq, setOpenFaq] = useState(0);

  const [targetTime] = useState(() => Date.now() + 14 * 86400000 + 6 * 3600000);
  const [countdown, setCountdown] = useState(() => getTimeRemaining(targetTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeRemaining(targetTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  const openLogin = () => {
    setAuthModalMode("login");
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalMode("register");
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#17162E] text-white selection:bg-[#C996FF] selection:text-[#17162E]">
      {/* =====================================================================
          HERO SUPERIOR CON DEGRADADO HOLOGRÁFICO PASTEL Y CORTE DIAGONAL
         ===================================================================== */}
      <div className="relative overflow-hidden bg-[linear-gradient(125deg,#99F3EB_0%,#BCE4FF_26%,#E5B8FF_58%,#B5BCFF_82%,#9DA6FF_100%)] text-[#17162E]">
        {/* Destellos geométricos translúcidos de fondo (estilo imagen de referencia) */}
        <div className="pointer-events-none absolute -top-24 left-1/3 h-96 w-32 rotate-[28deg] bg-white/30 blur-[1px]" />
        <div className="pointer-events-none absolute top-12 right-12 h-64 w-64 rotate-12 border-[18px] border-white/25" />
        <div className="pointer-events-none absolute bottom-20 left-10 h-52 w-52 rounded-full bg-[#FF9CE3]/30 blur-3xl" />

        {/* Navbar Superior */}
        <header className="relative z-20 mx-auto max-w-7xl px-4 pt-4 pb-2 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/40 text-sm font-black text-[#17162E] shadow-sm backdrop-blur-md sm:h-9 sm:w-9 sm:text-base">
                ✦
              </div>
              <span className="truncate text-base font-extrabold tracking-tight text-[#17162E] sm:text-lg">
                Recuerdalo<span className="text-[#5C4EE5]">.com.mx</span>
              </span>
            </div>

            <nav className="hidden items-center gap-3 text-xs font-bold text-[#2B294F]/85 md:flex">
              <a href="#nosotros" className="transition hover:text-[#17162E]">
                Nosotros
              </a>
              <span className="text-[#5C4EE5]">•</span>
              <a
                href="#como-funciona"
                className="transition hover:text-[#17162E]"
              >
                Cómo Funciona
              </a>
              <span className="hidden text-[#5C4EE5]">•</span>
              <a href="#servicios" className="hidden transition hover:text-[#17162E]">
                Servicios
              </a>
              <span className="text-[#5C4EE5]">•</span>
              <a href="#garantia" className="transition hover:text-[#17162E]">
                Garantía
              </a>
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              {isAuthenticated ? (
                <>
                  <span className="hidden text-xs font-semibold text-[#2B294F] sm:inline">
                    Hola, <strong>{user?.username}</strong>
                  </span>
                  <Link
                    to="/home"
                    className="rounded-full bg-[#17162E] px-3.5 py-1.5 text-[11px] font-extrabold text-white shadow-lg shadow-[#17162E]/25 transition hover:bg-[#252347] sm:px-5 sm:py-2 sm:text-xs"
                  >
                    Mi Panel ↗
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full bg-white/65 px-3 py-1.5 text-[11px] font-bold text-[#17162E] backdrop-blur-md transition hover:bg-white sm:px-4 sm:py-2 sm:text-xs"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openLogin}
                    className="px-2 py-1.5 text-[11px] font-extrabold text-[#17162E] transition hover:text-[#5C4EE5] sm:px-3 sm:py-2 sm:text-xs"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    onClick={openRegister}
                    className="rounded-full bg-white/85 px-3.5 py-1.5 text-[11px] font-extrabold text-[#17162E] shadow-md shadow-[#5C4EE5]/15 backdrop-blur-md transition hover:bg-white sm:px-5 sm:py-2 sm:text-xs"
                  >
                    Crear Cuenta
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Barra de navegación rápida visible en móviles (< md) */}
          <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-white/40 bg-white/30 px-3 py-1.5 text-[11px] font-bold text-[#2B294F] backdrop-blur-md md:hidden">
            <a href="#nosotros" className="hover:text-[#17162E]">
              Nosotros
            </a>
            <span className="text-[#5C4EE5]">•</span>
            <a href="#como-funciona" className="hover:text-[#17162E]">
              Cómo Funciona
            </a>
            <span className="hidden text-[#5C4EE5]">•</span>
            <a href="#servicios" className="hidden hover:text-[#17162E]">
              Servicios
            </a>
            <span className="text-[#5C4EE5]">•</span>
            <a href="#garantia" className="hover:text-[#17162E]">
              Garantía
            </a>
          </nav>
        </header>

        {/* Contenido Principal del Hero */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-8 sm:pb-28 lg:pb-36 lg:pt-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Columna Izquierda: Título Oscuro, Descripción y Botones Estilo "Cryptovio" */}
            <div className="text-center lg:col-span-6 lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 px-3.5 py-1 text-[11px] font-extrabold text-[#17162E] backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#12B886]" />
                <span>Plataforma 24/7 Activa • 100% Digital</span>
              </div>

              <h1 className="text-3xl font-extrabold leading-[1.14] tracking-tight text-[#17162E] sm:text-5xl lg:text-[3.2rem]">
                ¿Necesitas organizar o gestionar tu evento?
                <span className="mt-1 block text-[#2D2A5A]">
                  ¡Recuerdalo.com.mx puede ayudarte!
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed font-medium text-[#3E3C66] sm:mt-5 sm:text-sm lg:mx-0">
                Olvídate de las hojas de cálculo desordenadas y las
                confirmaciones perdidas por chat. Centraliza el diseño de tu
                invitación, tu lista de invitados, el mapa de mesas y el
                presupuesto en un solo panel.
              </p>

              {/* Botones CTA: Píldora Oscura (#17162E) + Enlace secundario */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:mt-8 sm:gap-5 lg:justify-start">
                {isAuthenticated ? (
                  <Link
                    to="/home"
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#17162E] px-6 py-3 text-xs font-extrabold text-white shadow-[0_14px_30px_rgba(23,22,46,0.35)] transition hover:-translate-y-0.5 hover:bg-[#232146] sm:px-7 sm:py-3.5"
                  >
                    <span>Abrir Gestor de Eventos</span>
                    <span>↗</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={openRegister}
                    className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#17162E] px-6 py-3 text-xs font-extrabold text-white shadow-[0_14px_30px_rgba(23,22,46,0.35)] transition hover:-translate-y-0.5 hover:bg-[#232146] sm:px-7 sm:py-3.5"
                  >
                    <span>Crear Mi Evento Ahora</span>
                    <span>↗</span>
                  </button>
                )}

                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#17162E] transition hover:translate-x-1"
                >
                  <span>Cómo Funciona</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Columna Derecha: Smartphone 3D Inclinado con Vista de Invitación y Métricas */}
            <div className="relative flex justify-center lg:col-span-6">
              {/* Roseta Holográfica 3D Flotante (como en la imagen de referencia) */}
              <div className="pointer-events-none absolute -bottom-4 left-4 z-30 hidden h-20 w-20 items-center justify-center rounded-full bg-[conic-gradient(from_0deg,#99F3EB,#FF8EC7,#FFE082,#9B8BFF,#99F3EB)] p-1 shadow-[0_12px_30px_rgba(23,22,46,0.45)] sm:flex">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#17162E]/85 text-xl text-white backdrop-blur-xs">
                  ✦
                </div>
              </div>

              {/* Smartphone 3D (recto en móvil pequeño para evitar desborde, inclinado en sm+) */}
              <div className="relative w-full max-w-[285px] rotate-0 rounded-[2.5rem] border-[6px] border-[#C6CCFF] bg-[#141329] p-3 text-white shadow-[0_35px_70px_rgba(23,22,46,0.6)] transition duration-500 sm:max-w-[310px] sm:-rotate-6 sm:rounded-[2.8rem] sm:border-[7px] sm:p-3.5 hover:rotate-0">
                <div className="mx-auto mb-2.5 h-1.5 w-16 rounded-full bg-white/20" />

                <div className="overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-[#1F1E3D] to-[#141329] p-4">
                  {/* Cabecera interna del teléfono */}
                  <div className="flex items-center justify-between text-[10px] text-[#9DA3C0]">
                    <span className="font-bold text-[#7BE7FF]">
                      ✦ INVITACIONES DIGITALES
                    </span>
                    <span className="rounded-full bg-[#FF8EC7]/20 px-2 py-0.5 font-extrabold text-[#FF8EC7]">
                      EN VIVO
                    </span>
                  </div>

                  {/* Tarjeta interna con foto e info del evento */}
                  <div className="relative mt-3 h-36 overflow-hidden rounded-2xl border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
                      alt="Recepción y Gala VIP"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141329] via-[#141329]/30 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <span className="rounded-md bg-[#6C7EE1] px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                        Diseño personalizado al instante
                      </span>
                      <p className="mt-1 text-sm font-extrabold text-white">
                        Bodas, XV Años, Galas y Corporativos
                      </p>
                    </div>
                  </div>

                  {/* Gráfica / Estado RSVP en vivo estilo app */}
                  <div className="mt-3.5 space-y-2 rounded-2xl border border-white/10 bg-[#1A1936] p-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#9DA3C0]">Confirmados RSVP</span>
                      <span className="font-extrabold text-[#4CE0B3]">
                        +94% Asistencia
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#7BE7FF] via-[#C996FF] to-[#FF8EC7]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                      <div className="rounded-xl bg-white/5 p-2">
                        <span className="block text-[#9DA3C0]">Acceso QR</span>
                        <strong className="text-white">Recepción sin filas</strong>
                      </div>
                      <div className="rounded-xl bg-white/5 p-2">
                        <span className="block text-[#9DA3C0]">WhatsApp</span>
                        <strong className="text-[#7BE7FF]">Envío 1 Clic</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corte Diagonal Inferior hacia el Fondo Nocturno (#17162E) */}
        <svg
          viewBox="0 0 1440 130"
          preserveAspectRatio="none"
          className="absolute -bottom-1 left-0 z-10 h-20 w-full sm:h-28 lg:h-36"
        >
          <polygon fill="#17162E" points="0,130 1440,0 1440,130" />
        </svg>
      </div>

      {/* =====================================================================
          SECCIÓN 2: PLATAFORMA PROFESIONAL (ESTILO "THE LARGEST EXCHANGE")
         ===================================================================== */}
      <section
        id="nosotros"
        className="relative mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:py-24"
      >
        {/* Resplandor ambiental violeta/rosa */}
        <div className="pointer-events-none absolute left-10 top-1/3 h-72 w-72 rounded-full bg-[#8B5CF6]/20 blur-[110px]" />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Columna Izquierda: Mockup Oscuro con Tarjeta Holográfica Brilliante */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-[285px] rotate-0 rounded-[2.4rem] border-[5px] border-[#2E2D52] bg-[#111022] p-3 shadow-[0_30px_70px_rgba(0,0,0,0.65)] transition duration-500 sm:max-w-[300px] sm:rotate-3 sm:rounded-[2.6rem] sm:p-3.5 hover:rotate-0">
              <div className="mx-auto mb-2.5 h-1.5 w-14 rounded-full bg-white/15" />

              {/* Tarjeta Holográfica Superior dentro del Smartphone (idéntica a la referencia) */}
              <div className="rounded-2xl bg-[linear-gradient(135deg,#FF94C2_0%,#C896FF_52%,#7BE7FF_100%)] p-4 text-[#17162E] shadow-lg">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
                  <span>Control en Vivo</span>
                  <span className="rounded-full bg-[#17162E]/15 px-2 py-0.5">
                    100% Digital
                  </span>
                </div>
                <p className="mt-3 text-base font-black leading-tight">
                  Recuerdalo.com.mx
                </p>
                <p className="mt-1 text-[11px] font-bold text-[#2D2A5A]">
                  Menos de 5 minutos para publicar
                </p>
              </div>

              {/* Métricas internas del dispositivo */}
              <div className="mt-3.5 space-y-2.5 rounded-2xl border border-white/10 bg-[#1A1933] p-3.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div>
                    <span className="block text-[10px] text-[#9DA3C0]">
                      Pases Digitales
                    </span>
                    <strong className="text-sm text-white">
                      Personalizados
                    </strong>
                  </div>
                  <span className="rounded-lg bg-[#6C7EE1]/25 px-2.5 py-1 text-[10px] font-bold text-[#9BA9FF]">
                    RSVP Activo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl bg-[#232242] p-2.5">
                    <span className="block text-[9px] text-[#9DA3C0]">
                      Invitados
                    </span>
                    <strong className="text-[#4CE0B3]">✓ Sincronizados</strong>
                  </div>
                  <div className="rounded-xl bg-[#232242] p-2.5">
                    <span className="block text-[9px] text-[#9DA3C0]">
                      Recepción
                    </span>
                    <strong className="text-[#FF8EC7]">✓ Código QR</strong>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
                    alt="Organización de eventos profesionales"
                    className="h-24 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Título, Subtítulo y Cuadrícula de Beneficios con Iconos Luminosos */}
          <div className="text-center lg:col-span-7 lg:text-left">
            <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-4xl">
              Plataforma profesional para la gestión de tus eventos
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[#A3A1C2] sm:mt-4 sm:text-sm lg:mx-0">
              ¿Listo para sorprender a tus invitados? Crea tu evento hoy y
              comparte tu pase digital personalizado en{" "}
              <span className="font-bold text-[#FF76A8]">
                menos de 5 minutos
              </span>
              .
            </p>

            {/* Grid 2x3 con Iconos 3D Resplandecientes */}
            <div className="mt-7 grid grid-cols-1 gap-4 text-left sm:mt-8 sm:grid-cols-2 sm:gap-5">
              {[
                {
                  label: "Invitaciones Interactivas",
                  sub: "Temas visuales y enlace permanente",
                  bg: "from-[#FF76A8] to-[#FF9F68]",
                  icon: "💌",
                },
                {
                  label: "Asignación de Mesas",
                  sub: "Organización clara por grupos y zonas",
                  bg: "from-[#35E2B4] to-[#12B886]",
                  icon: "🪑",
                },
                {
                  label: "Difusión por WhatsApp",
                  sub: "Envío directo con mensaje personalizado",
                  bg: "from-[#63E6BE] to-[#3BC9DB]",
                  icon: "📲",
                },
                {
                  label: "Control de Presupuesto",
                  sub: "Anticipos, proveedores y liquidaciones",
                  bg: "from-[#FFB84D] to-[#FF7B39]",
                  icon: "💰",
                },
                {
                  label: "Recepción con Código QR",
                  sub: "Validación rápida en puerta sin filas",
                  bg: "from-[#C882FF] to-[#7950F2]",
                  icon: "🔳",
                },
                {
                  label: "Confirmaciones en Vivo",
                  sub: "Adultos, niños y alergias al instante",
                  bg: "from-[#7BE7FF] to-[#5C7CFA]",
                  icon: "✓",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.bg} text-base font-extrabold text-white shadow-lg`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {item.label}
                    </h3>
                    <p className="text-xs text-[#9DA3C0]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 3: ¿CÓMO FUNCIONA? (3 TARJETAS CRISTAL CON NÚMEROS 1, 2, 3)
         ===================================================================== */}
      <section
        id="como-funciona"
        className="relative mx-auto max-w-6xl px-4 py-16 sm:px-8"
      >
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            ¿Cómo funciona Recuerdalo.com.mx?
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-[#A3A1C2] sm:text-sm">
            Configura, comparte y administra toda tu celebración en 3 simples
            pasos desde cualquier dispositivo.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {HOW_IT_WORKS.map((step, idx) => (
            <div
              key={step.num}
              className={`group relative overflow-hidden rounded-2xl border border-[#4D5196]/45 bg-[#1E1D3B]/80 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#9B8BFF] sm:p-7 ${
                idx === 2 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Número gigante de marca de agua en el fondo (idéntico a "Get Started" 1, 2, 3) */}
              <span className="pointer-events-none absolute right-5 top-1 select-none text-[6.5rem] font-black leading-none text-white/[0.04]">
                {step.num}
              </span>

              <div
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.iconBg} text-xl shadow-lg`}
              >
                {step.icon}
              </div>

              <h3 className="relative z-10 mt-6 text-base font-extrabold text-white">
                {step.num}. {step.title}
              </h3>

              <p className="relative z-10 mt-2.5 text-xs leading-relaxed text-[#A3A1C2]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 4: NUESTROS SERVICIOS (TARJETAS HOLOGRÁFICAS Y GLASSMORPHISM)
          [OCULTA TEMPORALMENTE - Quitar 'hidden' para volver a mostrar]
         ===================================================================== */}
      <section
        id="servicios"
        className="hidden relative mx-auto max-w-6xl px-4 py-16 sm:px-8"
      >
        {/* Resplandor ambiental derecho */}
        <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-[#EC4899]/15 blur-[120px]" />

        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Nuestros Servicios
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-[#A3A1C2] sm:text-sm">
            Todo lo que necesitas para planificar, enviar invitaciones y
            coordinar la logística de tu evento desde cualquier dispositivo.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((srv) => (
            <div
              key={srv.title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4D5196]/40 bg-[#1D1C38]/85 p-6 shadow-[0_16px_38px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#C996FF]/60"
            >
              <div>
                {/* Cabecera mini-widget holográfico */}
                <div
                  className={`mb-5 flex items-center justify-between rounded-2xl bg-gradient-to-r ${srv.gradient} p-3.5 text-[#17162E] shadow-md`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {srv.tag}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/75 text-base shadow-2xs">
                    {srv.icon}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white">
                  {srv.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#A3A1C2]">
                  {srv.desc}
                </p>
              </div>

              <div className="mt-5 pt-2">
                <button
                  type="button"
                  onClick={isAuthenticated ? undefined : openRegister}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[11px] font-bold text-white transition hover:border-[#C996FF] hover:bg-white/10"
                >
                  <span>Explorar módulo</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}

          {/* 6ta Tarjeta Destacada Holográfica: ¿Más herramientas? */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#99F3EB_0%,#C896FF_52%,#FF8EC7_100%)] p-6 text-[#17162E] shadow-[0_20px_45px_rgba(200,150,255,0.25)]">
            <div>
              <span className="inline-block rounded-full bg-[#17162E]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#17162E]">
                ✦ SUITE COMPLETA
              </span>
              <h3 className="mt-4 text-xl font-black text-[#17162E]">
                ¿Más herramientas?
              </h3>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-[#2B294F]">
                Duplica eventos con un clic, administra tu calendario mensual e
                importa invitados masivamente por CSV.
              </p>
            </div>

            <button
              type="button"
              onClick={isAuthenticated ? undefined : openRegister}
              className="mt-6 w-full cursor-pointer rounded-full bg-[#17162E] py-3 text-xs font-extrabold text-white shadow-lg transition hover:bg-[#252347]"
            >
              {isAuthenticated ? "Disponible en tu Panel →" : "Comenzar Ahora →"}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 5: GARANTÍA Y BENEFICIOS + CUENTA REGRESIVA EN VIVO
         ===================================================================== */}
      <section id="garantia" className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-14">
        <div className="rounded-3xl border border-[#4D5196]/45 bg-[#1E1D3B]/80 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-8 lg:p-12">
          <div className="grid grid-cols-1 items-center gap-4 border-b border-white/10 pb-7 sm:gap-6 sm:pb-9 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#7BE7FF]">
                ✦ POTENCIA Y SEGURIDAD
              </span>
              <h2 className="mt-1 text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                Rápido, Intuitivo y con Control Total Garantizado
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-xs leading-relaxed text-[#A3A1C2] sm:text-sm">
                Sin importar el tamaño de tu celebración, nuestra plataforma se
                adapta a tu flujo de trabajo para que cada invitado reciba su
                pase a tiempo y tú tengas visibilidad completa en tiempo real.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 md:grid-cols-2 md:gap-8">
            {GUARANTEES.map((g) => (
              <div key={g.title} className="flex items-start gap-3.5 sm:gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br sm:h-12 sm:w-12 ${g.badgeBg} text-lg text-white shadow-lg sm:text-xl ${g.glow}`}
                >
                  {g.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-white sm:text-base">
                    {g.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#A3A1C2]">
                    {g.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Barra integrada de Cuenta Regresiva Demo (100% responsiva en móvil/tablet/desk) */}
          <div className="mt-9 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#5C60A8]/40 bg-[#141329] p-4 sm:mt-12 sm:flex-row sm:gap-6 sm:p-6">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7BE7FF] sm:text-[11px]">
                ⏳ DEMO EN VIVO • PRÓXIMA GRAN GALA VIP
              </span>
              <p className="mt-1 text-xs font-bold text-white sm:text-sm">
                Cuenta regresiva automática integrada en todas tus invitaciones
              </p>
            </div>
            <div className="grid w-full grid-cols-4 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
              {[
                { label: "Días", val: countdown.days },
                { label: "Horas", val: countdown.hours },
                { label: "Min", val: countdown.minutes },
                { label: "Seg", val: countdown.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-xl border border-[#4D5196]/50 bg-[#1E1D3B] px-2 py-2 text-center shadow-inner sm:min-w-[64px] sm:px-3"
                >
                  <div className="bg-gradient-to-r from-[#7BE7FF] to-[#FF8EC7] bg-clip-text text-lg font-black text-transparent sm:text-xl">
                    {String(item.val).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] font-bold uppercase text-[#9DA3C0] sm:text-[10px]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 6: PREGUNTAS FRECUENTES (ACORDEÓN CRISTAL OSCURO)
         ===================================================================== */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF8EC7]">
              ✦ RESOLVEMOS TUS DUDAS
            </span>
            <h3 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              Preguntas Frecuentes
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-[#A3A1C2] sm:text-sm">
              ¿Tienes alguna duda adicional sobre cómo gestionar tus pases o
              configurar tu recepción con QR? Aquí respondemos las consultas más
              comunes.
            </p>
          </div>

          <div className="space-y-3.5 lg:col-span-7">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.q}
                  className={`rounded-2xl border transition ${
                    isOpen
                      ? "border-[#9B8BFF]/60 bg-[#212042] shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                      : "border-[#4D5196]/35 bg-[#1B1A36]/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-xs font-bold text-white sm:text-sm"
                  >
                    <span>{item.q}</span>
                    <span className="ml-4 text-[#7BE7FF]">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs leading-relaxed text-[#A3A1C2]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 7: TARJETA FLOTANTE PRE-FOOTER + FOOTER HOLOGRÁFICO DIAGONAL
         ===================================================================== */}
      <div className="relative mt-12">
        {/* Tarjeta Oscura Flotante sobre el Corte Diagonal (Estilo "Download the app" de la referencia) */}
        <div className="relative z-20 mx-auto max-w-4xl px-4 sm:px-8">
          <div className="rounded-3xl border border-[#5B5F9E]/55 bg-[#1A1936]/95 p-6 text-center shadow-[0_25px_65px_rgba(12,11,26,0.75)] backdrop-blur-xl sm:p-10 lg:p-12">
            <h2 className="mx-auto max-w-2xl text-xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
              ¿Listo para transformar la experiencia de tus invitados desde el
              primer clic?
            </h2>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#7BE7FF] sm:gap-6">
              <span>✓ Configuración en 5 minutos</span>
              <span>✓ Soporte para WhatsApp y QR</span>
            </div>

            <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-7 sm:flex-row sm:items-center sm:gap-4">
              {isAuthenticated ? (
                <Link
                  to="/home"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-3 text-xs font-extrabold text-[#17162E] shadow-md transition hover:bg-[#F0F2F8]"
                >
                  <span>✦ Ir al Panel de Eventos</span>
                  <span>→</span>
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openRegister}
                    className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-3 text-xs font-extrabold text-[#17162E] shadow-md transition hover:bg-[#F0F2F8]"
                  >
                    <span>🚀 Empezar Mi Evento Gratis</span>
                  </button>
                  <button
                    type="button"
                    onClick={openLogin}
                    className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-xs font-extrabold text-white transition hover:bg-white/20"
                  >
                    <span>🔑 Iniciar Sesión</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Holográfico Pastel con Corte Diagonal Superior */}
        <footer className="relative -mt-24 overflow-hidden bg-[linear-gradient(125deg,#B5AAFF_0%,#E5B8FF_45%,#BCE4FF_80%,#99F3EB_100%)] pt-36 text-[#17162E]">
          {/* Corte Diagonal Superior desde el Fondo Nocturno (#17162E) */}
          <svg
            viewBox="0 0 1440 130"
            preserveAspectRatio="none"
            className=" absolute left-0 top-0 h-20 w-full sm:h-28 lg:h-36"
          >
            <polygon fill="#17162E" points="0,0 1440,0 0,130" />
          </svg>

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-8 border-b border-[#17162E]/15 py-12 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#17162E] text-sm font-extrabold text-[#7BE7FF]">
                    ✦
                  </div>
                  <span className="text-lg font-extrabold tracking-tight text-[#17162E]">
                    Recuerdalo.com.mx
                  </span>
                </div>
                <p className="mt-3 max-w-xs text-xs font-medium leading-relaxed text-[#2D2A5A]">
                  Tu plataforma integral para crear invitaciones interactivas,
                  confirmar asistencia RSVP, asignar mesas y controlar el acceso
                  con código QR.
                </p>
              </div>

              <div>
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#17162E]">
                  Plataforma
                </h5>
                <ul className="mt-3 space-y-2 text-xs font-semibold text-[#2D2A5A]">
                  <li>
                    <a href="#nosotros" className="hover:underline">
                      Nosotros
                    </a>
                  </li>
                  <li className="hidden">
                    <a href="#servicios" className="hover:underline">
                      Servicios
                    </a>
                  </li>
                  <li>
                    <a href="#garantia" className="hover:underline">
                      Garantía
                    </a>
                  </li>
                  <li>
                    <a href="#como-funciona" className="hover:underline">
                      Cómo Funciona
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#17162E]">
                  Herramientas
                </h5>
                <ul className="mt-3 space-y-2 text-xs font-semibold text-[#2D2A5A]">
                  <li>Invitación Digital</li>
                  <li>Control RSVP</li>
                  <li>Seating Chart</li>
                  <li>Código QR SVG</li>
                </ul>
              </div>

              <div>
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#17162E]">
                  Legal y Acceso
                </h5>
                <ul className="mt-3 space-y-2 text-xs font-semibold text-[#2D2A5A]">
                  <li>
                    <button
                      type="button"
                      onClick={openLogin}
                      className="cursor-pointer hover:underline"
                    >
                      Iniciar Sesión
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={openRegister}
                      className="cursor-pointer hover:underline"
                    >
                      Crear Cuenta
                    </button>
                  </li>
                  <li>Privacidad y Términos</li>
                </ul>
              </div>
            </div>

            <div className="py-6 text-center text-xs font-bold text-[#2D2A5A]">
              © {new Date().getFullYear()} Recuerdalo.com.mx. Todos los derechos
              reservados.
            </div>
          </div>
        </footer>
      </div>

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default LandingPage;
