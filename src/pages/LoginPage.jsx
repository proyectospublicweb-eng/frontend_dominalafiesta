import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await login({
        correoRegistro: formData.get("correoRegistro"),
        password: formData.get("password"),
        remember,
      });
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <span className="inline-block rounded-md bg-[#15B2F5] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
            Bienvenido
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#171F39]">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Ingresa a tu panel de ProyectoEventos
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

          <PasswordField autoComplete="current-password" />
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
          Entrar
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="font-bold text-[#171F39] underline decoration-[#15B2F5] decoration-2 underline-offset-4 hover:text-[#0E9DE0]"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
