import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordField from "./PasswordField";

function AuthModal({ isOpen, initialMode = "login", onClose }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);
    const correoRegistro = formData.get("correoRegistro");
    const password = formData.get("password");

    if (mode === "register") {
      const confirmPassword = formData.get("confirmPassword");
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ correoRegistro, password, remember });
      } else {
        await register({ correoRegistro, password, remember });
      }
      onClose();
      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (mode === "login"
            ? "Error al iniciar sesión"
            : "Error al registrarse")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#ff1e38]/50 bg-[#0b0d14] p-8 shadow-[0_0_50px_rgba(255,30,56,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Línea superior neón */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff1e38] to-[#00f0ff]" />

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Cerrar modal"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#ff1e38]">
              PROYECTO EVENTOS
            </span>
            <h2 className="mt-1 text-3xl font-bold text-white">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </h2>
            <p className="mt-1.5 text-sm text-gray-400">
              {mode === "login"
                ? "Accede para gestionar tus fiestas y servicios"
                : "Únete y empieza a organizar tus eventos"}
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-[#ff1e38]/40 bg-[#ff1e38]/10 px-3 py-2 text-sm text-[#ff4d63]">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <input
              name="correoRegistro"
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              className="w-full rounded-lg border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#ff1e38] focus:ring-2 focus:ring-[#ff1e38]/25"
              required
            />

            <PasswordField
              minLength={mode === "register" ? 6 : undefined}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="Contraseña"
            />

            {mode === "register" && (
              <PasswordField
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Repetir contraseña"
              />
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-[#ff1e38]"
            />
            Recordarme
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="btn-glow-red w-full rounded-lg bg-[#ff1e38] py-3 text-sm font-semibold text-white transition hover:bg-[#ff334b] disabled:opacity-60"
          >
            {submitting
              ? "Procesando..."
              : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
          </button>

          <p className="text-center text-sm text-gray-400">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="font-semibold text-[#ff1e38] hover:text-[#00f0ff] hover:underline"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="font-semibold text-[#ff1e38] hover:text-[#00f0ff] hover:underline"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;

