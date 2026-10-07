import { cn } from "../../lib/utils";
import { getStage, isCompleted, PRIORITY_META, type OrderListItem } from "../../types/order";
import { quoteFolio } from "../../utils/productionUtils";

interface Props {
  order: OrderListItem;
  onSelect: (order: OrderListItem) => void;
  variant?: "compact" | "full";
}

export function EventCard({ order, onSelect, variant = "compact" }: Props) {
  const meta = PRIORITY_META[order.priority];
  const done = isCompleted(order);

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border text-left transition-all",
        "shadow-soft hover:shadow-lifted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        meta.card,
        variant === "compact" ? "py-1.5 pr-2 pl-2.5" : "p-3",
      )}
    >
      <span className={cn("absolute top-0 bottom-0 left-0 w-1", meta.bar)} />
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "truncate font-semibold text-foreground",
            variant === "compact" ? "text-[11px]" : "text-sm",
          )}
        >
          {quoteFolio(order.quoteId)}
        </span>
        {done && (
          <span className="rounded-full bg-success-soft px-1.5 py-px text-[9px] font-semibold text-success">
            Completado
          </span>
        )}
      </div>
      <p
        className={cn(
          "truncate text-muted-foreground",
          variant === "compact" ? "text-[11px]" : "text-sm",
        )}
      >
        {order.client}
      </p>
      <div
        className={cn(
          "mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-muted-foreground",
          variant === "compact" ? "text-[10px]" : "text-xs",
        )}
      >
        <span>{order.numberPieces} piezas</span>
        <span className="opacity-40">•</span>
        <span className="font-medium text-foreground/80">{getStage(order.status).label}</span>
        <span className="opacity-40">•</span>
        <span className="inline-flex items-center gap-1 font-medium">
          <span className={cn("size-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </span>
      </div>
    </button>
  );
}