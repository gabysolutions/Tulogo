
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Acceso no autorizado</h1>
        <p className="mt-1 text-sm text-slate-500">
          No tienes permisos para ver esta sección. Si crees que esto es un error,
          contacta a un administrador.
        </p>
      </div>

      <Link
        to="/"
        className="mt-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
      >
        Volver al Dashboard
      </Link>
    </main>
  );
}