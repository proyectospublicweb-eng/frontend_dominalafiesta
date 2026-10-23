export const GESTOR_TABS = [
  {
    id: "invitation",
    route: "invitation",
    label: "Tab A: 📇 Diseño e Invitación Virtual",
    short: "📇 Invitación Virtual",
    pathHint: "/events/[id]/invitation",
  },
  {
    id: "guests",
    route: "guests",
    label: "Tab B: 👥 Lista de Invitados",
    short: "👥 Invitados",
    pathHint: "/events/[id]/guests",
  },
  {
    id: "broadcast",
    route: "broadcast",
    label: "Tab C: 📤 Compartir WhatsApp/Email",
    short: "📤 Compartir WhatsApp/Email",
    pathHint: "/events/[id]/broadcast",
  },
  {
    id: "logistics",
    route: "logistics",
    label: "Tab D: 📋 Logística del Evento",
    short: "📋 Logística (Mesas/Tareas)",
    pathHint: "/events/[id]/logistics",
    hidden: true, // Oculto temporalmente sin eliminar la funcionalidad
  },
  {
    id: "budget",
    route: "budget",
    label: "💰 Presupuesto (Opcional)",
    short: "💰 Presupuesto",
    pathHint: "/events/[id]/budget",
    hidden: true, // Oculto temporalmente sin eliminar la funcionalidad
  },
  {
    id: "settings",
    route: "settings",
    label: "Tab E: ⚙️ Ajustes del Evento",
    short: "⚙️ Ajustes y QR",
    pathHint: "/events/[id]/settings",
  },
];

export function normalizeGestorTab(rawTab) {
  if (!rawTab) return "invitation";
  const map = {
    invitation: "invitation",
    invitacion: "invitation",
    guests: "guests",
    invitados: "guests",
    broadcast: "broadcast",
    difusion: "broadcast",
    logistics: "invitation", // Redirige a invitation mientras Logística esté oculta
    logistica: "invitation",
    budget: "invitation", // Redirige a invitation mientras Presupuesto esté oculto
    presupuesto: "invitation",
    settings: "settings",
    configuracion: "settings",
  };
  return map[String(rawTab).toLowerCase()] || "invitation";
}

