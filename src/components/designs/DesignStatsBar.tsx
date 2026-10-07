import { Clock, Eye, CheckCircle2, XCircle } from "lucide-react";

import type { DesignStatusCounts } from "../../types/design";

interface Props {
  statusCounts: DesignStatusCounts;
}

const STATS_CONFIG = [
  {
    key: "pending" as const,
    label: "Pendientes",
    icon: Clock,
    bar: "bg-amber-400",
    text: "text-amber-600",
  },
  {
    key: "inReview" as const,
    label: "En revisión",
    icon: Eye,
    bar: "bg-blue-400",
    text: "text-blue-600",
  },
  {
    key: "accepted" as const,
    label: "Aceptados",
    icon: CheckCircle2,
    bar: "bg-emerald-400",
    text: "text-emerald-600",
  },
  {
    key: "rejected" as const,
    label: "Rechazados",
    icon: XCircle,
    bar: "bg-red-400",
    text: "text-red-600",
  },
];

export function DesignStatsBar({ statusCounts }: Props) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STATS_CONFIG.map(({ key, label, icon: Icon, bar, text }) => {
        const count = statusCounts[key];

        return (
          <div
            key={key}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span className={`absolute left-0 top-0 h-full w-1 ${bar}`} />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">{count}</p>
              </div>

              <Icon className={`h-6 w-6 ${text}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}