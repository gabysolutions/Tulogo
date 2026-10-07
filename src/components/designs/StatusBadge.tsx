import { CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { DesignStatus } from "../../types/design";

const STATUS_META: Record<
  DesignStatus,
  { label: string; classes: string; icon: typeof Clock }
> = {
  [DesignStatus.PENDING]: {
    label: "Pendiente",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  [DesignStatus.REVIEW]: {
    label: "En revisión",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Eye,
  },
  [DesignStatus.APPROVED]: {
    label: "Aceptado",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  [DesignStatus.REJECTED]: {
    label: "Rechazado",
    classes: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: DesignStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.classes} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

export { STATUS_META };