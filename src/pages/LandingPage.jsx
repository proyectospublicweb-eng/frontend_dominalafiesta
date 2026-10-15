import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";

const FEATURED_SERVICES = [
  {
    id: "dj",
    title: "DJ & ILUMINACIÓN",
    meta: "SONIDO PRO • LÁSER LED",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "catering",
    title: "CATERING & BARRA",
    meta: "BANQUETES • MIXOLOGÍA VIP",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "salones",
    title: "SALONES & LOUNGE",
    meta: "TERRAZAS • MONTAJE GALA",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
  },
];

const EVENT_CATEGORIES = [
  {
    id: 1,
    name: "BODAS EXCLUSIVAS",
    rank: "TOP #1",
    accent: "red",
    svg: (
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    ),
  },
  {
    id: 2,
    name: "FIESTAS PRIVADAS",
    rank: "TOP #2",
    accent: "cyan",
    svg: (
      <path d="M12 3L4 9L12 21L20 9L12 3ZM12 7.5L16.5 10L12 17L7.5 10L12 7.5Z" />
    ),
  },
  {
    id: 3,
    name: "XV AÑOS & GALAS",
    rank: "TOP #3",
    accent: "red",
    svg: (
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
    ),
  },
  {
    id: 4,
    name: "CONCIERTOS & FEST",
    rank: "TOP #4",
    accent: "cyan",
    svg: (
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2ZM12 6.2L17.2 9.1V14.9L12 17.8L6.8 14.9V9.1L12 6.2Z" />
    ),
  },
  {
    id: 5,
    name: "EVENTOS CORPORATIVOS",
    rank: "TOP #5",
    accent: "red",
    svg: (
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C14.21 7 16 8.79 16 11C16 13.21 14.21 15 12 15C9.79 15 8 13.21 8 11C8 8.79 9.79 7 12 7Z" />
    ),
  },
];

const LATEST_NEWS = [
  {
    id: 1,
    date: "20 OCT, 2026",
    category: "FESTIVAL",
    title: "¡Reservas abiertas para la Gala Neón & Temporada de Fin de Año!",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    date: "18 OCT, 2026",
    category: "SERVICIO",
    title: "Nuevo espectáculo de iluminación láser y barra de mixología molecular",
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    date: "15 OCT, 2026",
    category: "TENDENCIA",
    title: "Cómo planificar la fiesta perfecta: sonido, ambientación y catering",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
  },
];

function SectionHeading({ title }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex items-center gap-1 text-[#ff1e38]" aria-hidden="true">
        <span className="h-1.5 w-1.5 rotate-45 bg-[#ff1e38]" />
        <span className="h-3 w-0.5 bg-[#ff1e38]" />
      </span>
      <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
        {title}
      </h2>
      <div className="h-[1px] max-w-[140px] flex-1 bg-gradient-to-r from-[#ff1e38] to-transparent" />
    </div>
  );
}

function BrandLogo() {
  return (
    <a href="#inicio" className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          className="h-9 w-9 drop-shadow-[0_0_10px_rgba(255,30,56,0.8)]"
        >
          <polygon
            points="20,2 36,11 36,29 20,38 4,29 4,11"
            fill="#ff1e38"
            fillOpacity="0.15"
            stroke="#ff1e38"
            strokeWidth="2.5"
          />
          <path
            d="M13 27V13l14 14V13"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="leading-none">
        <span className="font-cyber block text-base font-black tracking-wider text-white">
          NEXUS
        </span>
        <span className="font-heading block text-[9px] font-bold tracking-[0.3em] text-gray-300">
          EVENTOS & FIESTAS
        </span>
      </div>
    </a>
  );
}

function SocialIcons({ vertical = false }) {
  const items = [
    {
      name: "Discord",
      path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z",
    },
    {
      name: "YouTube",
      path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z",
    },
    {
      name: "Twitter",
      path: "M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59Z",
    },
    {
      name: "Instagram",
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z",
    },
  ];

  return (
    <div className={`flex ${vertical ? "flex-col gap-5" : "items-center gap-4"}`}>
      {items.map((item) => (
        <a
          key={item.name}
          href={`#${item.name.toLowerCase()}`}
          onClick={(e) => e.preventDefault()}
          aria-label={item.name}
          className="text-gray-300 transition hover:scale-110 hover:text-[#ff1e38]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d={item.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}

/**
 * Ilustración central Hero: Consola DJ / Escenario de Fiesta Neón dentro del Hexágono Rojo y Cian
 */
function PartyHeroVisual() {
  return (
    <div className="relative mx-auto flex w-full max-w-[480px] items-center justify-center py-4">
      <svg
        viewBox="0 0 500 440"
        className="w-full drop-shadow-[0_0_35px_rgba(255,30,56,0.35)]"
      >
        <defs>
          <linearGradient id="hexNeon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="45%" stopColor="#ff1e38" />
            <stop offset="100%" stopColor="#ff1e38" />
          </linearGradient>
          <linearGradient id="deckBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#161926" />
            <stop offset="50%" stopColor="#0b0d14" />
            <stop offset="100%" stopColor="#06070b" />
          </linearGradient>
          <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff1e38" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#00f0ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#050508" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Reflejo de piso neón */}
        <ellipse cx="250" cy="390" rx="210" ry="34" fill="url(#floorGlow)" />

        {/* Hexágono Neón Trasero (idéntico al marco de la imagen de referencia) */}
        <polygon
          points="250,24 430,115 430,305 250,392 70,305 70,115"
          fill="none"
          stroke="url(#hexNeon)"
          strokeWidth="5"
          className="drop-shadow-[0_0_18px_rgba(255,30,56,0.9)]"
        />
        <polygon
          points="265,42 442,128 442,295 265,378 92,295 92,128"
          fill="none"
          stroke="#ff1e38"
          strokeOpacity="0.35"
          strokeWidth="2"
        />

        {/* Partículas y destellos de fiesta */}
        <circle cx="95" cy="95" r="3" fill="#00f0ff" />
        <circle cx="420" cy="85" r="4" fill="#ff1e38" />
        <circle cx="445" cy="240" r="3" fill="#ff1e38" />
        <circle cx="75" cy="260" r="2.5" fill="#00f0ff" />

        {/* Consola DJ / Mesa de Mezclas 3D en perspectiva */}
        <g transform="rotate(-8 250 225)">
          {/* Base 3D con borde neón cian y rojo */}
          <rect
            x="65"
            y="135"
            width="370"
            height="175"
            rx="34"
            fill="url(#deckBody)"
            stroke="#00f0ff"
            strokeWidth="2.5"
          />
          <rect
            x="73"
            y="143"
            width="354"
            height="159"
            rx="28"
            fill="#090b11"
            stroke="#ff1e38"
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />

          {/* Pantalla superior NEXUS EVENTOS */}
          <rect
            x="195"
            y="153"
            width="110"
            height="28"
            rx="6"
            fill="#05070c"
            stroke="#00f0ff"
            strokeOpacity="0.6"
            strokeWidth="1.2"
          />
          <text
            x="250"
            y="171"
            textAnchor="middle"
            fill="#00f0ff"
            fontSize="11"
            fontWeight="bold"
            letterSpacing="3"
          >
            NEXUS VIP
          </text>

          {/* Plato DJ Izquierdo (Tornamesa Neón Rojo/Cian) */}
          <circle
            cx="142"
            cy="228"
            r="52"
            fill="#05060a"
            stroke="#ff1e38"
            strokeWidth="3.5"
          />
          <circle
            cx="142"
            cy="228"
            r="38"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="1.8"
            strokeDasharray="18 8"
          />
          <circle
            cx="142"
            cy="228"
            r="16"
            fill="#ff1e38"
            fillOpacity="0.25"
            stroke="#ff1e38"
            strokeWidth="2"
          />
          <circle cx="142" cy="228" r="5" fill="#ffffff" />

          {/* Plato DJ Derecho (Tornamesa Neón Rojo) */}
          <circle
            cx="358"
            cy="228"
            r="52"
            fill="#05060a"
            stroke="#ff1e38"
            strokeWidth="3.5"
          />
          <circle
            cx="358"
            cy="228"
            r="38"
            fill="none"
            stroke="#ff1e38"
            strokeWidth="1.8"
            strokeDasharray="22 10"
          />
          <circle
            cx="358"
            cy="228"
            r="16"
            fill="#00f0ff"
            fillOpacity="0.2"
            stroke="#00f0ff"
            strokeWidth="2"
          />
          <circle cx="358" cy="228" r="5" fill="#ffffff" />

          {/* Barras Ecualizador Central */}
          {[212, 224, 236, 248, 260, 272, 284].map((x, idx) => {
            const h = [36, 54, 44, 62, 48, 56, 34][idx];
            const color = idx % 2 === 0 ? "#ff1e38" : "#00f0ff";
            return (
              <rect
                key={x}
                x={x}
                y={255 - h}
                width="6"
                height={h}
                rx="3"
                fill={color}
              />
            );
          })}

          {/* Pads de iluminación inferiores */}
          {[208, 228, 248, 268, 288].map((x, i) => (
            <rect
              key={x}
              x={x}
              y="268"
              width="13"
              height="10"
              rx="2.5"
              fill={i % 2 === 0 ? "#ff1e38" : "#00f0ff"}
              fillOpacity="0.85"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

function LandingPage({ initialModal = null }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [authModalMode, setAuthModalMode] = useState(initialModal);
  const [activeNav, setActiveNav] = useState("INICIO");
  const [selectedService, setSelectedService] = useState("dj");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [infoModal, setInfoModal] = useState(null);

  useEffect(() => {
    if (initialModal) {
      setAuthModalMode(initialModal);
    }
  }, [initialModal]);

  // Cuenta regresiva en vivo (09 Días, 23 Hrs, 47 Mins, 18 Segs)
  const [secondsLeft, setSecondsLeft] = useState(
    9 * 86400 + 23 * 3600 + 47 * 60 + 18
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 9 * 86400 + 23 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = String(Math.floor(secondsLeft / 86400)).padStart(2, "0");
  const hours = String(Math.floor((secondsLeft % 86400) / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const navLinks = [
    { label: "INICIO", href: "#inicio" },
    { label: "SERVICIOS", href: "#servicios" },
    { label: "ESPECIALIDADES", href: "#especialidades" },
    { label: "PRÓXIMO EVENTO", href: "#proximo-evento" },
    { label: "NOTICIAS", href: "#noticias" },
    { label: "CONTACTO", href: "#contacto" },
  ];

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
  };

  return (
    <div id="inicio" className="min-h-screen bg-[#050508] text-white">
      {/* NAVBAR SUPERIOR */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050508]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <BrandLogo />

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((item) => {
              const isActive = activeNav === item.label;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveNav(item.label)}
                  className={`font-heading relative py-1 text-xs font-bold tracking-[0.18em] transition ${
                    isActive
                      ? "text-[#ff1e38]"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1 h-[2px] bg-[#ff1e38] shadow-[0_0_8px_#ff1e38]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Botones de Login (abre modal flotante) y Registro */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="btn-glow-red rounded bg-[#ff1e38] px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#ff334b]"
              >
                IR A MI PANEL ({user?.correoRegistro?.split("@")[0]})
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAuthModalMode("login")}
                  className="rounded border border-white/20 bg-white/[0.02] px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#ff1e38] hover:text-[#ff1e38]"
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModalMode("register")}
                  className="btn-glow-red rounded bg-[#ff1e38] px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#ff334b]"
                >
                  REGISTRARSE
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* HERO SECTION */}
        <section className="relative grid grid-cols-1 items-center gap-8 pt-6 pb-10 lg:grid-cols-12 lg:pt-10">
          {/* Columna Izquierda */}
          <div className="relative z-10 lg:col-span-6">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.26em] text-[#ff1e38]">
              LA CELEBRACIÓN DEFINITIVA TE ESPERA
            </p>

            <h1 className="font-display mt-2 text-6xl font-bold uppercase leading-[0.86] tracking-wide sm:text-7xl lg:text-[5.4rem]">
              <span className="block text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.12)]">
                DOMINA
              </span>
              <span className="block text-[#ff1e38] text-glow-red">
                LA FIESTA
              </span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-300">
              ProyectoEventos reúne producción profesional de sonido, DJs,
              iluminación, banquetes y salones exclusivos para hacer de tu
              evento una experiencia inolvidable.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  isAuthenticated
                    ? navigate("/home")
                    : setAuthModalMode("register")
                }
                className="btn-glow-red flex items-center gap-3 rounded bg-[#ff1e38] px-6 py-3 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#ff334b]"
              >
                <span>RESERVAR AHORA</span>
                <span aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setInfoModal(
                    "Showreel Oficial: Conoce nuestros montajes de iluminación LED, pistas de baile, banquetes de lujo y escenarios para fiestas."
                  )
                }
                className="flex items-center gap-2.5 rounded border border-white/20 bg-white/[0.02] px-5 py-3 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-white/40 hover:bg-white/[0.06]"
              >
                <span>VER VIDEO</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/60 text-[8px]">
                  ▶
                </span>
              </button>
            </div>

            {/* Marcas / Alianzas de Producción */}
            <div className="mt-12 flex flex-wrap items-center gap-8 text-gray-400/75 sm:gap-10">
              <span className="font-heading flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.25em] transition hover:text-white">
                <span className="text-[#ff1e38]">❖</span> PIONEER DJ
              </span>
              <span className="font-heading flex items-center gap-1 text-sm font-bold tracking-wider transition hover:text-white">
                BOSE <span className="font-cyber text-xs text-white">PRO</span>
              </span>
              <span className="font-heading text-sm font-extrabold tracking-tight transition hover:text-white">
                Red Bull
              </span>
              <span className="font-cyber text-sm font-bold tracking-tight transition hover:text-white">
                LUMEN<span className="text-[#ff1e38]">.</span>
              </span>
            </div>
          </div>

          {/* Columna Derecha (Ilustración Neón + Barra Social) */}
          <div className="relative flex items-center justify-center lg:col-span-6">
            <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#ff1e38]/20 blur-[110px]" />
            <div className="pointer-events-none absolute h-60 w-60 -translate-x-10 translate-y-6 rounded-full bg-[#00f0ff]/15 blur-[95px]" />

            <PartyHeroVisual />

            {/* Barra lateral derecha SÍGUENOS */}
            <div className="hidden flex-col items-center gap-5 pl-2 sm:flex">
              <SocialIcons vertical />
              <div className="h-8 w-[1px] bg-white/15" />
              <span
                className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-[#ff1e38]"
                style={{ writingMode: "vertical-rl" }}
              >
                SÍGUENOS
              </span>
            </div>
          </div>
        </section>

        {/* BANNER PRÓXIMO GRAN EVENTO (COUNTDOWN) */}
        <section id="proximo-evento" className="my-6">
          <div className="relative overflow-hidden rounded-lg border border-[#ff1e38]/35 bg-gradient-to-r from-[#0d0c12] via-[#0b0d14] to-[#0d0c12] px-6 py-6 shadow-[0_0_35px_rgba(255,30,56,0.12)] sm:px-10">
            <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#ff1e38]" />
            <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-[#ff1e38]" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#ff1e38]" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#ff1e38]" />

            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
              <div className="text-center lg:text-left">
                <p className="font-heading text-xs font-bold uppercase tracking-[0.22em] text-[#ff1e38]">
                  PRÓXIMO EVENTO ESPECIAL
                </p>
                <h2 className="font-display mt-0.5 text-3xl font-bold uppercase tracking-wider text-white sm:text-4xl">
                  GALA NEÓN & FESTIVAL{" "}
                  <span className="text-[#ff1e38]">2026</span>
                </h2>
              </div>

              <div className="text-center">
                <p className="font-heading mb-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                  EL EVENTO COMIENZA EN
                </p>
                <div className="flex items-center gap-6 sm:gap-8">
                  {[
                    { value: days, label: "DÍAS" },
                    { value: hours, label: "HRS" },
                    { value: minutes, label: "MINS" },
                    { value: seconds, label: "SEGS" },
                  ].map((unit) => (
                    <div key={unit.label} className="text-center">
                      <span className="font-display block text-4xl font-bold leading-none tracking-wider text-white sm:text-5xl">
                        {unit.value}
                      </span>
                      <span className="font-heading mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff1e38]">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setAuthModalMode("login")}
                  className="rounded border border-[#ff1e38]/60 bg-[#ff1e38]/5 px-6 py-2.5 font-heading text-xs font-bold uppercase tracking-[0.2em] text-[#ff1e38] transition hover:bg-[#ff1e38] hover:text-white"
                >
                  VER DETALLES
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN MEDIA: SERVICIOS DESTACADOS + PAQUETE ESTELAR */}
        <section
          id="servicios"
          className="my-12 grid grid-cols-1 gap-8 lg:grid-cols-12"
        >
          {/* 3 Tarjetas de Servicios Destacados */}
          <div className="lg:col-span-7">
            <SectionHeading title="SERVICIOS DESTACADOS" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {FEATURED_SERVICES.map((service) => {
                const isSelected = selectedService === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`group relative cursor-pointer overflow-hidden rounded-md bg-[#0b0d13] transition duration-300 ${
                      isSelected
                        ? "border-2 border-[#ff1e38] box-glow-red"
                        : "border border-white/10 hover:border-[#ff1e38]/60"
                    }`}
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d13] via-[#0b0d13]/35 to-transparent" />
                    </div>

                    <div className="relative flex items-end justify-between px-4 pb-4 pt-2">
                      <div>
                        <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                          {service.title}
                        </h3>
                        <p className="font-heading text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          {service.meta}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#ff1e38] transition group-hover:translate-x-1">
                        ›
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setAuthModalMode("login")}
                className="font-heading inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ff1e38] transition hover:text-white"
              >
                <span>VER TODOS LOS SERVICIOS</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Bloque Derecho: Paquete Todo Incluido */}
          <div className="lg:col-span-5">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-md border border-white/10 bg-[#08090f] p-6">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">
                  PAQUETE ESTELAR
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#ff1e38]/70 to-transparent" />
              </div>

              <div className="my-3 text-center">
                <p className="font-cyber text-4xl font-black tracking-wider text-[#ff1e38] text-glow-red sm:text-5xl">
                  $250,000
                </p>
                <p className="font-heading mt-1 text-xs font-bold uppercase tracking-[0.24em] text-[#00f0ff] text-glow-cyan">
                  PRODUCCIÓN VIP TODO INCLUIDO
                </p>
              </div>

              {/* Ilustración Copa / Escenario de Celebración Neón */}
              <div className="relative my-2 flex h-36 items-center justify-center overflow-hidden rounded bg-gradient-to-b from-transparent via-[#ff1e38]/10 to-[#00f0ff]/10">
                <svg
                  viewBox="0 0 280 120"
                  className="h-32 w-full drop-shadow-[0_0_16px_rgba(0,240,255,0.6)]"
                >
                  {/* Luces láser laterales */}
                  <line
                    x1="10"
                    y1="25"
                    x2="85"
                    y2="55"
                    stroke="#ff1e38"
                    strokeWidth="2.5"
                  />
                  <line
                    x1="270"
                    y1="25"
                    x2="195"
                    y2="55"
                    stroke="#ff1e38"
                    strokeWidth="2.5"
                  />
                  <line
                    x1="25"
                    y1="75"
                    x2="90"
                    y2="90"
                    stroke="#00f0ff"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="255"
                    y1="75"
                    x2="190"
                    y2="90"
                    stroke="#00f0ff"
                    strokeWidth="1.5"
                  />
                  {/* Copa / Trofeo de Gala Central */}
                  <path
                    d="M110 22 H170 L162 62 C158 78 148 84 140 84 C132 84 122 78 118 62 Z"
                    fill="#0b0f1c"
                    stroke="#00f0ff"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M110 30 C92 30 90 52 115 58 M170 30 C188 30 190 52 165 58"
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="2.2"
                  />
                  <rect
                    x="135"
                    y="84"
                    width="10"
                    height="18"
                    fill="#00f0ff"
                  />
                  <rect
                    x="116"
                    y="102"
                    width="48"
                    height="8"
                    rx="3"
                    fill="#ff1e38"
                  />
                </svg>
              </div>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setAuthModalMode("login")}
                  className="inline-flex items-center gap-2 rounded border border-white/20 bg-white/[0.03] px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#ff1e38] hover:bg-[#ff1e38]/10"
                >
                  <span>COTIZAR PAQUETE</span>
                  <span className="text-[#00f0ff]">🥂</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ESPECIALIDADES EN EVENTOS (5 TARJETAS CON EMBLEMAS NEÓN) */}
        <section id="especialidades" className="my-12">
          <SectionHeading title="ESPECIALIDADES EN EVENTOS" />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {EVENT_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setAuthModalMode("login")}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-md border border-white/10 bg-[#0a0c12] px-4 py-6 text-center transition duration-300 ${
                  cat.accent === "red"
                    ? "hover:border-[#ff1e38]/70 hover:shadow-[0_0_25px_rgba(255,30,56,0.2)]"
                    : "hover:border-[#00f0ff]/70 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]"
                }`}
              >
                <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`h-12 w-12 transition duration-300 group-hover:scale-110 ${
                      cat.accent === "red"
                        ? "text-[#ff1e38] drop-shadow-[0_0_12px_rgba(255,30,56,0.85)]"
                        : "text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.85)]"
                    }`}
                  >
                    {cat.svg}
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">
                  {cat.name}
                </h3>
                <p className="font-heading mt-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {cat.rank}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setAuthModalMode("login")}
              className="font-heading inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ff1e38] transition hover:text-white"
            >
              <span>VER CATÁLOGO DE EVENTOS</span>
              <span>→</span>
            </button>
          </div>
        </section>

        {/* ÚLTIMAS NOTICIAS + MANTENTE AL DÍA */}
        <section id="noticias" className="my-12">
          <SectionHeading title="ÚLTIMAS TENDENCIAS" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-8">
              {LATEST_NEWS.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-md border border-white/10 bg-[#0a0c12] transition hover:border-white/25"
                >
                  <div>
                    <div className="h-32 w-full overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {item.date}
                        </span>
                        <span className="rounded bg-white/10 px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-white">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="mt-2.5 text-sm font-bold leading-snug text-white group-hover:text-[#ff1e38]">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => setInfoModal(item.title)}
                      className="font-heading inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff1e38] transition hover:text-white"
                    >
                      <span>LEER MÁS</span>
                      <span>→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Suscripción Newsletter */}
            <div className="lg:col-span-4">
              <div className="flex h-full flex-col justify-between rounded-md border border-white/10 bg-[#0a0c12] p-6">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase tracking-wider text-white">
                    MANTENTE AL DÍA
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
                    Suscríbete para recibir promociones en paquetes de fiestas,
                    fechas disponibles y descuentos exclusivos.
                  </p>
                </div>

                <form onSubmit={handleNewsletter} className="mt-5 space-y-3">
                  <div className="flex overflow-hidden rounded border border-white/15 bg-[#06070a] focus-within:border-[#ff1e38]">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Ingresa tu correo"
                      className="w-full bg-transparent px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none"
                      required
                    />
                    <button
                      type="submit"
                      aria-label="Suscribirse"
                      className="bg-[#ff1e38] px-4 text-sm font-bold text-white transition hover:bg-[#ff334b]"
                    >
                      →
                    </button>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-gray-400">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-3.5 w-3.5 rounded border-white/20 bg-[#06070a] accent-[#ff1e38]"
                    />
                    <span>Acepto recibir promociones y novedades.</span>
                  </label>

                  {newsletterSubscribed && (
                    <p className="text-[11px] font-medium text-[#00f0ff]">
                      ¡Gracias por suscribirte a ProyectoEventos!
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        id="contacto"
        className="mt-16 border-t border-white/10 bg-[#040507] py-12"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <BrandLogo />
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-white">
                ENLACES RÁPIDOS
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-gray-400">
                <li>
                  <a href="#inicio" className="transition hover:text-[#ff1e38]">
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a
                    href="#servicios"
                    className="transition hover:text-[#ff1e38]"
                  >
                    Servicios
                  </a>
                </li>
                <li>
                  <a
                    href="#especialidades"
                    className="transition hover:text-[#ff1e38]"
                  >
                    Paquetes VIP
                  </a>
                </li>
                <li>
                  <a
                    href="#noticias"
                    className="transition hover:text-[#ff1e38]"
                  >
                    Preguntas Frecuentes
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-white">
                SOPORTE
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-gray-400">
                <li>
                  <a href="#inicio" className="transition hover:text-[#ff1e38]">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a
                    href="#contacto"
                    className="transition hover:text-[#ff1e38]"
                  >
                    Contáctanos
                  </a>
                </li>
                <li>
                  <a href="#inicio" className="transition hover:text-[#ff1e38]">
                    Cotizaciones
                  </a>
                </li>
                <li>
                  <a href="#inicio" className="transition hover:text-[#ff1e38]">
                    Proveedores
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col justify-between gap-4 lg:col-span-5 lg:items-end">
              <div className="lg:self-start">
                <h4 className="font-heading mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white">
                  SÍGUENOS
                </h4>
                <SocialIcons />
              </div>

              <p className="text-xs text-gray-500">
                © 2026 ProyectoEventos. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL FLOTANTE DE LOGIN / REGISTRO */}
      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || "login"}
        onClose={() => setAuthModalMode(null)}
      />

      {/* Modal secundario informativo */}
      {infoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setInfoModal(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-[#ff1e38]/50 bg-[#0b0d14] p-6 shadow-[0_0_40px_rgba(255,30,56,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-heading text-xs font-bold uppercase tracking-[0.22em] text-[#ff1e38]">
                PROYECTO EVENTOS
              </span>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-200">
              {infoModal}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="btn-glow-red rounded bg-[#ff1e38] px-5 py-2 font-heading text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#ff334b]"
              >
                ENTENDIDO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;

