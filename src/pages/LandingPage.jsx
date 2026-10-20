import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthModal from "../components/AuthModal.jsx";

const SERVICES = [
  {
    icon: "💌",
    title: "Invitaciones Interactivas",
    desc: "Crea invitaciones digitales con temas personalizados, póster principal, código de vestimenta y enlace permanente.",
  },
  {
    icon: "📋",
    title: "Control en Vivo",
    desc: "Recibe confirmaciones de asistencia, conteo de adultos y niños, y requerimientos alimenticios al instante.",
  },
  {
    icon: "📲",
    title: "Difusión por WhatsApp",
    desc: "Envía pases individuales o campañas por correo HTML con plantillas listas para personalizar con un clic.",
  },
  {
    icon: "💰",
    title: "Presupuesto y Pagos",
    desc: "Registra proveedores, anticipos y liquidaciones comparando el costo estimado frente al monto real pagado.",
  },
  {
    icon: "🔳",
    title: "Acceso con Código QR",
    desc: "Genera e imprime el código QR oficial de recepción en formato SVG para validar entradas en puerta.",
  },
];

const GUARANTEES = [
  {
    icon: "🛡️",
    title: "Enlaces Permanentes Garantizados",
    desc: "Actualiza horarios, salones o colores en cualquier momento sin que los enlaces enviados dejen de funcionar.",
  },
  {
    icon: "⚡",
    title: "Sincronización en Tiempo Real",
    desc: "Cada vez que un invitado confirma o actualiza sus pases, tus métricas y mesas se actualizan al segundo.",
  },
  {
    icon: "📱",
    title: "Diseño 100% Adaptable (Móvil y PC)",
    desc: "Tus invitados disfrutan una experiencia fluida desde cualquier smartphone sin instalar aplicaciones.",
  },
  {
    icon: "🔔",
    title: "Recordatorios Automatizados",
    desc: "Programa avisos automáticos para los invitados que aún están pendientes de confirmar días antes del evento.",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Modalidades de Pase Flexibles",
    desc: "Configura pases para solo adultos, familias con niños o pases individuales con total precisión.",
  },
  {
    icon: "📊",
    title: "Importación y Exportación CSV",
    desc: "Carga listas masivas desde Excel en segundos y descarga reportes completos para tu banquetera.",
  },
];

const HOW_IT_WORKS = [
  {
    num: "1.",
    title: "Configura tu evento en minutos",
    desc: "Define el nombre, fecha, lugar, modalidad de pases y elige el estilo visual de tu invitación digital en nuestro Wizard.",
  },
  {
    num: "2.",
    title: "Comparte pases por WhatsApp o Email",
    desc: "Importa tu lista de invitados y envía enlaces únicos personalizados para que confirmen su asistencia desde su celular.",
  },
  {
    num: "3.",
    title: "Organiza mesas, presupuesto y recepción QR",
    desc: "Asigna lugares en el mapa de mesas, controla tus gastos con proveedores y recibe a tus invitados con código QR.",
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
    <div className="min-h-screen bg-[#F7F8FC] text-[#2D3047] selection:bg-[#6C7EE1] selection:text-white">
      {/* =====================================================================
          HERO Y NAVBAR EN TWILIGHT NAVY (#2D3047) - ESTILO DASHBOARD
         ===================================================================== */}
      <div className="relative bg-gradient-to-br from-[#323650] via-[#2D3047] to-[#23263A] text-white">
        {/* Navbar Superior */}
        <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7587EB] to-[#6475DC] text-lg font-extrabold text-white shadow-md shadow-[#6C7EE1]/30">
              ✦
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Recuerdalo<span className="text-[#4CE0B3]">.com.mx</span>
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-xs font-semibold text-[#9DA3C0] md:flex">
            <a href="#nosotros" className="transition hover:text-white">
              Nosotros
            </a>
            <a href="#servicios" className="transition hover:text-white">
              Servicios
            </a>
            <a href="#garantia" className="transition hover:text-white">
              Garantía
            </a>
            <a href="#como-funciona" className="transition hover:text-white">
              Cómo Funciona
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-xs text-[#9DA3C0] sm:inline">
                  Hola, <strong className="text-white">{user?.username}</strong>
                </span>
                <Link
                  to="/home"
                  className="rounded-full bg-gradient-to-r from-[#7587EB] to-[#6475DC] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#6C7EE1]/30 transition hover:from-[#6475DC] hover:to-[#5A6CD0]"
                >
                  Ir a Mi Panel →
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full border border-white/20 px-3.5 py-2 text-xs font-semibold text-[#9DA3C0] transition hover:border-white hover:text-white"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <div className="hidden items-center gap-2 text-xs font-semibold text-white/90 lg:flex">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4CE0B3] shadow-[0_0_8px_#4CE0B3]" />
                  <span>Plataforma 24/7 Activa</span>
                </div>
                <button
                  type="button"
                  onClick={openLogin}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#6C7EE1] hover:bg-white/10"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={openRegister}
                  className="rounded-full bg-gradient-to-r from-[#7587EB] to-[#6475DC] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#6C7EE1]/30 transition hover:from-[#6475DC] hover:to-[#5A6CD0]"
                >
                  Crear Cuenta
                </button>
              </>
            )}
          </div>
        </header>

        {/* Cuerpo del Hero (3 Columnas: Imagen Izquierda + Contenido Central + Imagen Derecha) */}
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-8 lg:pb-20">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Imagen Lateral Izquierda */}
            <div className="hidden lg:col-span-3 lg:block">
              <div className="relative h-[420px] overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
                  alt="Recepción y Gala VIP"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D3047]/85 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-[#2D3047]/90 p-3 backdrop-blur-md">
                  <p className="text-[11px] font-bold text-[#4CE0B3]">
                    ✦ INVITACIONES DIGITALES
                  </p>
                  <p className="text-xs font-semibold text-white">
                    Diseño personalizado al instante
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Central Principal */}
            <div className="text-center lg:col-span-6">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                ¿Necesitas <span className="text-[#8FA0F8]">organizar</span> o{" "}
                <span className="text-[#4CE0B3]">gestionar</span> tu evento?
                <br />
                ¡<span className="text-[#F98880]">Recuerdalo.com.mx</span> puede{" "}
                <span className="text-[#8FA0F8]">ayudarte!</span>
              </h1>

              {/* Botón Píldora Índigo con Círculo Blanco */}
              <div className="mt-8 flex justify-center">
                {isAuthenticated ? (
                  <Link
                    to="/home"
                    className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#7587EB] to-[#6475DC] py-2 pl-7 pr-2 text-sm font-bold text-white shadow-[0_14px_30px_rgba(108,126,225,0.35)] transition hover:from-[#6475DC] hover:to-[#5A6CD0]"
                  >
                    <span>Abrir Gestor de Eventos</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6C7EE1] transition group-hover:scale-105">
                      →
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={openRegister}
                    className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#7587EB] to-[#6475DC] py-2 pl-7 pr-2 text-sm font-bold text-white shadow-[0_14px_30px_rgba(108,126,225,0.35)] transition hover:from-[#6475DC] hover:to-[#5A6CD0]"
                  >
                    <span>Crear Mi Evento Ahora</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6C7EE1] transition group-hover:scale-105">
                      ✦
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Imagen Lateral Derecha */}
            <div className="hidden lg:col-span-3 lg:block">
              <div className="relative h-[420px] overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
                <img
                  src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80"
                  alt="Celebración y Brindis"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D3047]/85 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-[#2D3047]/90 p-3 backdrop-blur-md">
                  <p className="text-[11px] font-bold text-[#F98880]">
                    ✦ CONTROL DE ACCESO QR
                  </p>
                  <p className="text-xs font-semibold text-white">
                    Recepción rápida y sin filas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Escalón decorativo inferior (estilo recorte) */}
        <div className="hidden justify-between lg:flex">
          <div className="h-8 w-56 rounded-tr-3xl bg-[#F7F8FC]" />
          <div className="h-8 w-56 rounded-tl-3xl bg-[#F7F8FC]" />
        </div>
      </div>

      {/* =====================================================================
          SECCIÓN 2: PROFESIONALES PARA TUS EVENTOS (2 COLUMNAS)
         ===================================================================== */}
      <section
        id="nosotros"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:py-24"
      >
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Texto y Checklist Izquierda */}
          <div className="lg:col-span-6">
            <h2 className="text-3xl font-extrabold leading-tight text-[#2D3047] sm:text-4xl">
              Plataforma profesional para la gestión de tus eventos
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6E748A]">
              Olvídate de las hojas de cálculo desordenadas y las confirmaciones
              perdidas por chat. Centraliza el diseño de tu invitación, tu lista
              de invitados, el mapa de mesas y el presupuesto en un solo panel.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3.5 text-sm font-bold text-[#2D3047] sm:grid-cols-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CE0B3] text-xs font-extrabold text-white">
                  ✓
                </span>
                Invitaciones Interactivas
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CE0B3] text-xs font-extrabold text-white">
                  ✓
                </span>
                Asignación de Mesas
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CE0B3] text-xs font-extrabold text-white">
                  ✓
                </span>
                Difusión por WhatsApp
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CE0B3] text-xs font-extrabold text-white">
                  ✓
                </span>
                Control de Presupuesto
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CE0B3] text-xs font-extrabold text-white">
                  ✓
                </span>
                Recepción con Código QR
              </div>
            </div>

            {/* Banner Índigo de Llamado a la Acción (Estilo Tarjeta 1 del Dashboard) */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#7587EB] to-[#6475DC] px-6 py-4 text-white shadow-[0_14px_30px_rgba(108,126,225,0.25)]">
              <p className="text-xs leading-relaxed sm:text-sm">
                ¿Listo para sorprender a tus invitados? Crea tu evento hoy y
                comparte tu pase digital personalizado en{" "}
                <strong className="underline decoration-[#4CE0B3] decoration-2">
                  menos de 5 minutos
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Imagen con Marco Geométrico Derecha */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-3 translate-x-3 translate-y-3 rounded-[2.2rem] bg-[#ECEFFA]" />
              <div className="relative overflow-hidden rounded-[2rem] border-4 border-[#6C7EE1]/30 bg-[#2D3047] shadow-[0_20px_45px_rgba(45,48,71,0.2)]">
                <img
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80"
                  alt="Organización de eventos profesionales"
                  className="h-[360px] w-full object-cover"
                />
                <div className="flex items-center justify-between bg-gradient-to-r from-[#323650] to-[#26293E] px-6 py-4 text-white">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#4CE0B3]">
                      Control en Vivo
                    </p>
                    <p className="text-sm font-bold">
                      Bodas, XV Años, Galas y Corporativos
                    </p>
                  </div>
                  <span className="rounded-full bg-[#6C7EE1] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                    100% Digital
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 3: NUESTROS SERVICIOS (CUADRÍCULA 3x2 CON TARJETA CORAL CTA)
         ===================================================================== */}
      <section id="servicios" className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-extrabold text-[#2D3047] sm:text-4xl">
            Nuestros Servicios
          </h2>
          <p className="mt-3 text-sm text-[#6E748A]">
            Todo lo que necesitas para planificar, enviar invitaciones y
            coordinar la logística de tu evento desde cualquier dispositivo.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((srv, idx) => {
            const isCoralAccent = idx % 2 === 1;
            return (
              <div
                key={srv.title}
                className="group rounded-3xl border border-[#ECEFFA] bg-white p-6 shadow-[0_10px_28px_rgba(108,126,225,0.06)] transition hover:-translate-y-0.5 hover:border-[#6C7EE1]/40 hover:shadow-[0_14px_32px_rgba(108,126,225,0.14)]"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-md transition ${
                    isCoralAccent
                      ? "bg-[#2D3047] text-[#F98880] group-hover:bg-gradient-to-br group-hover:from-[#FA938B] group-hover:to-[#F77D75] group-hover:text-white"
                      : "bg-[#2D3047] text-[#4CE0B3] group-hover:bg-gradient-to-br group-hover:from-[#7587EB] group-hover:to-[#6475DC] group-hover:text-white"
                  }`}
                >
                  {srv.icon}
                </div>
                <h3 className="mt-5 text-base font-extrabold text-[#2D3047]">
                  {srv.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#6E748A]">
                  {srv.desc}
                </p>
              </div>
            );
          })}

          {/* Tarjeta Destacada en Coral Salmón (#F98880) Estilo Tarjeta 2 del Dashboard */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#FA938B] to-[#F77D75] p-6 text-center text-white shadow-[0_14px_30px_rgba(249,136,128,0.28)]">
            <div className="relative z-10">
              <h3 className="text-lg font-extrabold text-white">
                ¿Más herramientas?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/90">
                Duplica eventos con un clic  e importa invitados por CSV.
              </p>
            </div>
            <button
              type="button"
              onClick={isAuthenticated ? undefined : openRegister}
              className="relative z-10 mt-6 w-full rounded-full bg-white py-3 text-xs font-extrabold text-[#F77D75] shadow-sm transition hover:bg-[#F7F8FC]"
            >
              {isAuthenticated ? "Disponible en tu Panel" : "Comenzar Ahora"}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 4: BLOQUE TWILIGHT NAVY (#2D3047) DE GARANTÍA Y BENEFICIOS
         ===================================================================== */}
      <section id="garantia" className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="rounded-[2.2rem] bg-gradient-to-br from-[#323650] to-[#26293E] p-8 text-white shadow-[0_20px_50px_rgba(45,48,71,0.25)] sm:p-12 lg:p-16">
          {/* Cabecera en 2 columnas */}
          <div className="grid grid-cols-1 items-center gap-6 border-b border-white/10 pb-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                Rápido, Intuitivo y con Control Total Garantizado
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-xs leading-relaxed text-[#9DA3C0] sm:text-sm">
                Sin importar el tamaño de tu celebración, nuestra plataforma se
                adapta a tu flujo de trabajo para que cada invitado reciba su
                pase a tiempo y tú tengas visibilidad completa en tiempo real.
              </p>
            </div>
          </div>

          {/* Grid 2x3 de 6 Garantías */}
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {GUARANTEES.map((g) => (
              <div key={g.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl text-[#4CE0B3]">
                  {g.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{g.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#9DA3C0]">
                    {g.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Barra integrada de Cuenta Regresiva Demo */}
          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/10 bg-[#23263A] p-6 sm:flex-row">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#4CE0B3]">
                ⏳ DEMO EN VIVO • PRÓXIMA GRAN GALA VIP
              </span>
              <p className="mt-1 text-sm font-bold text-white">
                Cuenta regresiva automática integrada en todas tus invitaciones
              </p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: "Días", val: countdown.days },
                { label: "Horas", val: countdown.hours },
                { label: "Min", val: countdown.minutes },
                { label: "Seg", val: countdown.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-[62px] rounded-xl border border-[#6C7EE1]/30 bg-[#2D3047] px-3 py-2 text-center shadow-inner"
                >
                  <div className="text-xl font-extrabold text-[#4CE0B3]">
                    {String(item.val).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] font-semibold uppercase text-[#9DA3C0]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 5: ¿CÓMO FUNCIONA? (IMAGEN CON INSIGNIA + PASOS 1, 2, 3)
         ===================================================================== */}
      <section
        id="como-funciona"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:py-20"
      >
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Imagen con Insignia de Verificación Mint Aqua */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto max-w-sm">
              <div className="overflow-hidden rounded-3xl bg-[#ECEFFA] shadow-[0_14px_34px_rgba(108,126,225,0.14)]">
                <img
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80"
                  alt="Cómo funciona Recuerdalo.com.mx"
                  className="h-[360px] w-full object-cover"
                />
              </div>
              {/* Insignia circular Mint Aqua con check (idéntica al check del Dashboard) */}
              <div className="absolute -right-5 top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#4CE0B3] text-2xl font-extrabold text-white shadow-lg">
                ✓
              </div>
            </div>
          </div>

          {/* Pasos Numerados 1, 2, 3 */}
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-extrabold leading-tight text-[#2D3047] sm:text-4xl">
              ¿Cómo funciona
              <br />
              Recuerdalo.com.mx?
            </h2>

            <div className="mt-8 space-y-6">
              {HOW_IT_WORKS.map((step) => (
                <div
                  key={step.num}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-start sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:col-span-5">
                    <span className="text-3xl font-extrabold text-[#6C7EE1]">
                      {step.num}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#2D3047] sm:text-base">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-[#6E748A] sm:col-span-7">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 6: PREGUNTAS FRECUENTES (SOBRE LAVANDA GRIS SUAVE #F0F2F8)
         ===================================================================== */}
      <section className="bg-[#F0F2F8] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          {/* Acordeón de Preguntas Frecuentes */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3 className="text-2xl font-extrabold text-[#2D3047] sm:text-3xl">
                Preguntas Frecuentes
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[#6E748A] sm:text-sm">
                ¿Tienes alguna duda adicional sobre cómo gestionar tus pases o
                configurar tu recepción con QR? Aquí respondemos las consultas
                más comunes.
              </p>
            </div>
            <div className="space-y-3 lg:col-span-7">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={item.q}
                    className={`rounded-2xl border transition ${
                      isOpen
                        ? "border-[#6C7EE1]/40 bg-white shadow-[0_8px_24px_rgba(108,126,225,0.08)]"
                        : "border-[#DCE0F0] bg-white/80"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left text-xs font-bold text-[#2D3047] sm:text-sm"
                    >
                      <span>{item.q}</span>
                      <span className="ml-4 text-[#6C7EE1]">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs leading-relaxed text-[#6E748A]">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 7: BANNER PRE-FOOTER (#2D3047) + FOOTER ÍNDIGO (#6C7EE1)
         ===================================================================== */}
      <section className="bg-gradient-to-br from-[#323650] to-[#26293E] text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-extrabold leading-tight sm:text-4xl">
              ¿Listo para transformar la experiencia de tus invitados desde el
              primer clic?
            </h2>
            <div className="mt-4 flex flex-wrap gap-6 text-xs font-semibold text-[#4CE0B3]">
              <span>✓ Configuración en 5 minutos</span>
              <span>✓ Soporte para WhatsApp y QR</span>
            </div>
            <div className="mt-7">
              <button
                type="button"
                onClick={isAuthenticated ? undefined : openRegister}
                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#FA938B] to-[#F77D75] py-2 pl-6 pr-2 text-xs font-bold text-white shadow-[0_14px_30px_rgba(249,136,128,0.3)] transition hover:opacity-95"
              >
                <span>
                  {isAuthenticated
                    ? "Ir al Panel de Eventos"
                    : "Empezar Mi Evento Gratis"}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#F77D75]">
                  →
                </span>
              </button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80"
                alt="Organiza tu evento hoy"
                className="h-56 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Periwinkle Indigo (#6C7EE1) Estilo Dashboard */}
      <footer className="bg-gradient-to-br from-[#7587EB] to-[#6475DC] pt-4 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          {/* Enlaces del Footer */}
          <div className="grid grid-cols-1 gap-8 border-b border-white/20 py-12 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D3047] text-sm font-extrabold text-[#4CE0B3]">
                  ✦
                </div>
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Recuerdalo.com.mx
                </span>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/90">
                Tu plataforma integral para crear invitaciones interactivas,
                confirmar asistencia RSVP, asignar mesas y controlar el acceso
                con código QR.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-white">
                Plataforma
              </h5>
              <ul className="mt-3 space-y-2 text-xs text-white/90">
                <li>
                  <a href="#nosotros" className="hover:underline">
                    Nosotros
                  </a>
                </li>
                <li>
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
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-white">
                Herramientas
              </h5>
              <ul className="mt-3 space-y-2 text-xs text-white/90">
                <li>Invitación Digital</li>
                <li>Control RSVP</li>
                <li>Seating Chart</li>
                <li>Código QR SVG</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-white">
                Legal y Acceso
              </h5>
              <ul className="mt-3 space-y-2 text-xs text-white/90">
                <li>
                  <button
                    type="button"
                    onClick={openLogin}
                    className="hover:underline"
                  >
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openRegister}
                    className="hover:underline"
                  >
                    Crear Cuenta
                  </button>
                </li>
                <li>Privacidad y Términos</li>
              </ul>
            </div>
          </div>

          <div className="py-5 text-center text-xs text-white/90">
            © {new Date().getFullYear()} Recuerdalo.com.mx. Todos los derechos
            reservados.
          </div>
        </div>
      </footer>

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
