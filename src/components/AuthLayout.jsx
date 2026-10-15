function EventStack() {
  return (
    <div className="relative h-72 w-72" aria-hidden="true">
      <div className="absolute left-2 top-6 flex h-28 w-44 -rotate-6 items-center justify-center rounded-xl border border-[#00f0ff]/40 bg-[#0d101a] shadow-[0_0_25px_rgba(0,240,255,0.2)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.5" className="h-14 w-14 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
          <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      </div>

      <div className="absolute left-14 top-4 flex h-32 w-52 rotate-3 items-center justify-center gap-3 rounded-2xl border border-[#ff1e38]/50 bg-[#090b10] shadow-[0_0_30px_rgba(255,30,56,0.28)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" className="h-12 w-12">
          <path d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-15h9.75A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25A2.25 2.25 0 0 1 6.75 3Z" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="#ff1e38" strokeWidth="1.5" className="h-12 w-12 drop-shadow-[0_0_8px_rgba(255,30,56,0.8)]">
          <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      </div>

      <div className="absolute bottom-4 left-1 flex h-32 w-52 -rotate-3 items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-[#ff1e38] to-[#b80d24] shadow-[0_0_30px_rgba(255,30,56,0.5)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" className="h-14 w-14">
          <path d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-15h9.75A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25A2.25 2.25 0 0 1 6.75 3Z" />
          <path d="M8.25 9h3.75M8.25 12h3.75M8.25 15h3.75" strokeOpacity="0.7" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" className="h-10 w-10 opacity-75">
          <path d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050508] sm:p-6">
      <div className="flex min-h-screen w-full max-w-5xl overflow-hidden border border-white/10 bg-[#0b0d14] shadow-[0_0_50px_rgba(0,0,0,0.9)] sm:min-h-[640px] sm:rounded-3xl">
        {/* Panel decorativo */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/10 bg-[#07080d] p-10 lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#ff1e38]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[#00f0ff]/15 blur-3xl" />

          <div className="relative flex flex-1 items-center justify-center">
            <EventStack />
          </div>

          <div className="relative text-center">
            <h2 className="text-2xl font-bold text-white">
              La plataforma de tus eventos
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-gray-400">
              ProyectoEventos te ayuda a crear, organizar y gestionar tus eventos
              de forma rápida y sencilla.
            </p>
          </div>
        </div>

        {/* Contenido (formulario) */}
        <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
