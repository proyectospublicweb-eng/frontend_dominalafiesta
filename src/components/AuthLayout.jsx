function EventStack() {
  return (
    <div className="relative h-72 w-72" aria-hidden="true">
      {/* Tarjeta superior izquierda gris claro */}
      <div className="absolute left-2 top-6 flex h-28 w-44 -rotate-6 items-center justify-center rounded-2xl bg-[#F2F3F5] shadow-lg">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#142257] text-[#15B2F5]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
      </div>

      {/* Tarjeta derecha oscura carbón */}
      <div className="absolute left-14 top-4 flex h-32 w-52 rotate-3 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#1B2D6E] shadow-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#15B2F5] text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
      </div>

      {/* Tarjeta inferior principal en Verde Lima (#15B2F5) */}
      <div className="absolute bottom-4 left-1 flex h-32 w-52 -rotate-3 items-center justify-center gap-3 rounded-2xl bg-[#15B2F5] shadow-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#142257] text-[#15B2F5]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <path d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-15h9.75A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25A2.25 2.25 0 0 1 6.75 3Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F6FA] sm:p-6">
      <div className="flex min-h-screen w-full max-w-5xl overflow-hidden border border-gray-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] sm:min-h-[640px] sm:rounded-3xl">
        {/* Panel decorativo izquierdo en Carbón (#142257) con acentos Verde Lima (#15B2F5) */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#142257] p-10 lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #15B2F5 1px, transparent 1px), linear-gradient(to bottom, #15B2F5 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#15B2F5] font-black text-white">
              ✦
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              ProyectoEventos
            </span>
          </div>

          <div className="relative flex flex-1 items-center justify-center">
            <EventStack />
          </div>

          <div className="relative text-center">
            <h2 className="text-2xl font-extrabold text-white">
              Hacemos Tu{" "}
              <span className="inline-block rounded-lg bg-[#15B2F5] px-2.5 py-0.5 text-white">
                Evento
              </span>{" "}
              Mejor
            </h2>
            <p className="mx-auto mt-2.5 max-w-xs text-sm text-gray-400">
              Crea invitaciones digitales, gestiona confirmaciones de asistencia y controla el acceso con códigos QR.
            </p>
          </div>
        </div>

        {/* Contenido (formulario) sobre fondo blanco limpio */}
        <div className="flex w-full items-center justify-center bg-white p-5 sm:p-10 lg:w-1/2 lg:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
