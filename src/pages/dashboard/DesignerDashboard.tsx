import { Link } from "react-router-dom";
import { Clock, Eye, CheckCircle2, XCircle, Sparkles, ArrowRight } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useDesignerDashboard } from "../../hooks/useDesignerDashboard";


import { MovementsBell } from "../../components/designs/MovementsBell";


interface StatusCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
}

function StatusCard({ label, value, icon: Icon, gradient, iconColor }: StatusCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70`} />
      <div className="relative">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 ${iconColor}`}>
          <Icon size={18} />
        </div>
        <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <h3 className="mt-1 text-3xl font-bold">{value}</h3>
      </div>
    </div>
  );
}

export default function DesignerDashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useDesignerDashboard();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-slate-500">Cargando ...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-500">{error ?? "Error al cargar"}</p>
      </main>
    );
  }

  const { statusCounts,  freeDesigns } = data;
  const hasFreeDesigns = freeDesigns.length > 0;

  return (
  <main className="mx-auto w-full px-6 py-8">
     <div className="flex flex-col gap-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Bienvenido, {user?.name ?? "Diseñador"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Este es el estado actual de tus diseños asignados.
            </p>
          </div>

          <MovementsBell />
        </div>



        {hasFreeDesigns && (
          <Link
            to="/diseños"
            className="flex items-center justify-between rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm transition-colors hover:from-blue-100 hover:to-indigo-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Hay {freeDesigns.length} diseño{freeDesigns.length > 1 ? "s" : ""} disponible
                  {freeDesigns.length > 1 ? "s" : ""} para asignar
                </p>
                <p className="text-xs text-slate-500">Entra a Diseños para revisarlos y tomarlos</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-blue-600" />
          </Link>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            label="Pendientes"
            value={statusCounts.pending}
            icon={Clock}
            gradient="from-sky-500/15 to-sky-500/5"
            iconColor="text-sky-600"
          />
          <StatusCard
            label="En revisión"
            value={statusCounts.inReview}
            icon={Eye}
            gradient="from-amber-500/15 to-amber-500/5"
            iconColor="text-amber-600"
          />
          <StatusCard
            label="Aceptados"
            value={statusCounts.accepted}
            icon={CheckCircle2}
            gradient="from-emerald-500/15 to-emerald-500/5"
            iconColor="text-emerald-600"
          />
          <StatusCard
            label="Rechazados"
            value={statusCounts.rejected}
            icon={XCircle}
            gradient="from-rose-500/15 to-rose-500/5"
            iconColor="text-rose-600"
          />
        </div>
       
      </div>
    </main>
  );
}