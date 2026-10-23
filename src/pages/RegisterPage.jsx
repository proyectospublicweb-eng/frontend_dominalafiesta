import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!password || String(password).length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await register({
        correoRegistro: formData.get("correoRegistro"),
        password,
        remember,
      });
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrarse");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <span className="inline-block rounded-md bg-[#15B2F5] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
            Registro Gratis
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#171F39]">
            Crear cuenta
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Únete y empieza a organizar tus eventos
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            name="correoRegistro"
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            className="w-full rounded-xl border border-gray-200 bg-[#F3F6FA] px-4 py-3 text-sm text-[#171F39] placeholder-gray-400 outline-none transition focus:border-[#15B2F5] focus:bg-white focus:ring-2 focus:ring-[#15B2F5]/40"
            required
          />

          <PasswordField
            minLength={8}
            autoComplete="new-password"
            placeholder="Contraseña (mínimo 8 caracteres)"
          />

          <PasswordField
            name="confirmPassword"
            minLength={8}
            autoComplete="new-password"
            placeholder="Repetir contraseña"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-[#142257]"
          />
          Recordarme
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#15B2F5] py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0E9DE0]"
        >
          Crear cuenta
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="font-bold text-[#171F39] underline decoration-[#15B2F5] decoration-2 underline-offset-4 hover:text-[#0E9DE0]"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
