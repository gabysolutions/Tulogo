import { Activity, AlertTriangle, CalendarClock, CheckCircle2, type LucideIcon } from "lucide-react";
import type { OrderCards } from "../../types/order";

interface Stat {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  iconClasses: string;
}

export function SummaryCards({ cards }: { cards: OrderCards }) {
  const stats: Stat[] = [
    { label: "Órdenes activas", value: cards.production, hint: "En proceso de fabricación", icon: Activity, iconClasses: "text-blue-600 bg-blue-50" },
    { label: "Órdenes urgentes", value: cards.priority, hint: "Prioridad alta o por vencer", icon: AlertTriangle, iconClasses: "text-red-600 bg-red-50" },
    { label: "Entregas hoy", value: cards.todaysDeliveries, hint: "Programadas para hoy", icon: CalendarClock, iconClasses: "text-amber-600 bg-amber-50" },
    { label: "Órdenes completadas", value: cards.delivered, hint: "Entregadas al cliente", icon: CheckCircle2, iconClasses: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClasses}`}>
              <Icon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{stat.label}</span>
              <span className="font-mono text-3xl font-semibold leading-none text-slate-800">{stat.value}</span>
              <span className="truncate text-xs text-slate-400">{stat.hint}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}