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
          <h1 className="text-3xl font-bold text-white">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-gray-400">
            Bienvenido de nuevo a ProyectoEventos
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
            placeholder="Correo"
            autoComplete="email"
            className="w-full rounded-lg border border-white/15 bg-[#07080d] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#ff1e38] focus:ring-2 focus:ring-[#ff1e38]/25"
            required
          />

          <PasswordField autoComplete="current-password" />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-400">
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
          className="btn-glow-red w-full rounded-lg bg-[#ff1e38] py-3 text-sm font-semibold text-white transition hover:bg-[#ff334b]"
        >
          Entrar
        </button>

        <p className="text-center text-sm text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#ff1e38] hover:text-[#00f0ff] hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
