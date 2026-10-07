import { cn } from "../../lib/utils";
import { DesignStatus, type Design } from "../../types/design";
import { quoteFolio } from "../../utils/productionUtils";

export const designFolio = (id: number) => `DIS-${String(id).padStart(4, "0")}`;

const STATUS_META: Record<DesignStatus, { label: string; classes: string }> = {
  [DesignStatus.REJECTED]: { label: "Rechazado", classes: "bg-red-50 text-red-700" },
  [DesignStatus.PENDING]: { label: "Pendiente", classes: "bg-amber-50 text-amber-700" },
  [DesignStatus.REVIEW]: { label: "En revisión", classes: "bg-blue-50 text-blue-700" },
  [DesignStatus.APPROVED]: { label: "Aprobado", classes: "bg-emerald-50 text-emerald-700" },
};

interface Props {
  design: Design;
  onSelect: (design: Design) => void;
  variant?: "compact" | "full";
}

export function DesignEventCard({ design, onSelect, variant = "compact" }: Props) {
 const status = STATUS_META[design.status] ?? {
  label: "Diseño",
  classes: "bg-slate-100 text-slate-600",
};
  const compact = variant === "compact";

  return (
    <button
      type="button"
      onClick={() => onSelect(design)}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border border-dashed border-violet-300 bg-violet-50/60 text-left transition-all",
        "shadow-soft hover:shadow-lifted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        compact ? "py-1.5 pr-2 pl-2.5" : "p-3",
      )}
    >
      <span className="absolute top-0 bottom-0 left-0 w-1 bg-violet-400" />
      <div className="flex items-center gap-1.5">
        <span className={cn("truncate font-semibold text-foreground", compact ? "text-[11px]" : "text-sm")}>
          {designFolio(design.id)}
        </span>
        <span className={cn("rounded-full px-1.5 py-px text-[9px] font-semibold", status.classes)}>
          {status.label}
        </span>
      </div>
      <p className={cn("truncate text-muted-foreground", compact ? "text-[11px]" : "text-sm")}>
        {design.designerName || "Sin diseñador"}
      </p>
      <p className={cn("truncate text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
        {quoteFolio(design.quoteId)} • Diseño
      </p>
    </button>
  );
}