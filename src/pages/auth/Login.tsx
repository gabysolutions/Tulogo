import { useState, type FormEvent, useEffect } from "react";
import {  User, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import logo from "../../../public/logo1.png"
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const {
    login,
    isAuthenticated,
  } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await login(username, password);

      toast.success("Bienvenido 🚀");

      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-100 to-blue-200 px-4 py-10">
      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-100 w-100 animate-pulse rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-40 blur-3xl [animation-duration:6s]" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] animate-pulse rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 opacity-40 blur-3xl [animation-duration:8s] [animation-delay:1s]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-sky-300 opacity-30 blur-3xl [animation-duration:10s]" />

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md duration-500 animate-in fade-in slide-in-from-bottom-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 p-[1px] shadow-2xl shadow-blue-500/30">
          <div className="rounded-3xl bg-white/85 px-8 py-10 backdrop-blur-xl sm:px-10">
            {/* Brand */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex  items-center justify-center  text-white  transition-transform duration-300 hover:rotate-6 hover:scale-110">
                <img className="h-25 w-30" src={logo} alt="" />
              </div>

              <h1 className="text-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-500 bg-clip-text text-transparent font-bold">
                Tu Logo en Todo
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Sistema de gestión y producción
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <Field
                id="username"
                label="Usuario"
                type="text"
                icon={<User className="h-4 w-4 " />}
                value={username}
                onChange={setUsername}
                placeholder="Ingresa tu usuario"
                autoComplete="username"
              />

              <Field
                id="password"
                label="Contraseña"
                type="password"
                icon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </span>

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>

           
          </div>
        </div>
      </div>
    </main>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

function Field({
  id,
  label,
  type,
  icon,
  value,
  onChange,
  placeholder,
  autoComplete,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="group relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600">
          {icon}
        </span>

        <input
          id={id}
          type={type}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white/70 py-3 pl-10 pr-3 text-sm text-blue-600 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
        />
      </div>
    </div>
  );
}