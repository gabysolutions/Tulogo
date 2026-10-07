import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  Clock,
  FileText,
  Package,
  Truck,
  Wallet,
} from "lucide-react";

import type { DashboardStat } from "../../types/dashboard";

interface Props {
  stat: DashboardStat;
}

const icons = {
  package: Package,
  fileText: FileText,
  clock: Clock,
  truck: Truck,
  wallet: Wallet,
  badgeDollar: BadgeDollarSign,
};

const styles = {
  package: {
    gradient: "from-violet-500/15 to-violet-500/5",
    icon: "text-violet-600",
  },
  fileText: {
    gradient: "from-amber-500/15 to-amber-500/5",
    icon: "text-amber-600",
  },
  clock: {
    gradient: "from-sky-500/15 to-sky-500/5",
    icon: "text-sky-600",
  },
  truck: {
    gradient: "from-emerald-500/15 to-emerald-500/5",
    icon: "text-emerald-600",
  },
  wallet: {
    gradient: "from-indigo-500/15 to-indigo-500/5",
    icon: "text-indigo-600",
  },
  badgeDollar: {
    gradient: "from-rose-500/15 to-rose-500/5",
    icon: "text-rose-600",
  },
};

export default function DashboardStatCard({ stat }: Props) {
  const Icon = icons[stat.icon];
  const style = styles[stat.icon];

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200  p-4 shadow-sm">

      <div
        className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-70`}
      />

      <div className="relative">

        <div className="flex items-center justify-between">

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 dark:bg-white/10 ${style.icon}`}
          >
            <Icon size={18} />
          </div>

          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              stat.variationType === "increase"
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {stat.variationType === "increase" ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}

            {stat.variationLabel === "%"
              ? `${stat.variation}%`
              : `${stat.variation}${stat.variationLabel}`}
          </span>
        </div>

        <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
          {stat.title}
        </p>

        <h3 className="mt-1 text-3xl font-bold">
          {stat.value}
        </h3>

      </div>
    </div>
  );
}