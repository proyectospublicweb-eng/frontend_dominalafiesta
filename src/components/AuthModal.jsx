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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3047]/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#DCE0F0] bg-white p-8 shadow-[0_24px_60px_rgba(45,48,71,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Franja superior Periwinkle Indigo + Mint Aqua */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#6C7EE1] via-[#4CE0B3] to-[#F98880]" />

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[#8E94A9] transition hover:bg-[#F0F2F8] hover:text-[#2D3047]"
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
            <span className="inline-block rounded-full bg-[#ECEFFA] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#6C7EE1]">
              Recuerdalo.com.mx
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[#2D3047]">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </h2>
            <p className="mt-1.5 text-sm text-[#6E748A]">
              {mode === "login"
                ? "Accede para gestionar tus fiestas y servicios"
                : "Únete y empieza a organizar tus eventos"}
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-[#F98880]/40 bg-[#FFF2F1] px-3.5 py-2.5 text-sm font-medium text-[#E05349]">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <input
              name="correoRegistro"
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-4 py-3 text-sm text-[#2D3047] placeholder-[#8E94A9] outline-none transition focus:border-[#6C7EE1] focus:bg-white focus:ring-2 focus:ring-[#6C7EE1]/30"
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

          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6E748A]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-[#6C7EE1]"
            />
            Recordarme
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#7587EB] to-[#6475DC] py-3.5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(108,126,225,0.3)] transition hover:from-[#6475DC] hover:to-[#5A6CD0] disabled:opacity-60"
          >
            {submitting
              ? "Procesando..."
              : mode === "login"
              ? "Entrar a mi cuenta"
              : "Crear cuenta"}
          </button>

          <p className="text-center text-sm text-[#6E748A]">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="font-bold text-[#2D3047] underline decoration-[#6C7EE1] decoration-2 underline-offset-4 hover:text-[#6C7EE1]"
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
                  className="font-bold text-[#2D3047] underline decoration-[#6C7EE1] decoration-2 underline-offset-4 hover:text-[#6C7EE1]"
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
