import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordField({
  name = "password",
  placeholder = "Contraseña",
  minLength,
  autoComplete,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-[#DCE0F0] bg-[#F7F8FC] px-4 py-3 pr-11 text-sm text-[#2D3047] placeholder-[#8E94A9] outline-none transition focus:border-[#6C7EE1] focus:bg-white focus:ring-2 focus:ring-[#6C7EE1]/30"
        required
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E94A9] transition hover:text-[#2D3047]"
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? (
          <EyeOff className="h-5 w-5 shrink-0" />
        ) : (
          <Eye className="h-5 w-5 shrink-0" />
        )}
      </button>
    </div>
  );
}

export default PasswordField;
