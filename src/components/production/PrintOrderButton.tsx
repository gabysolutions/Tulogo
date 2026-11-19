import { useState } from "react";
import { Printer } from "lucide-react";

import type { ProductionOrderListItem } from "../../types/order";
import OrderPreviewModal from "./OrderPreviewModal";

interface Props {
  order: ProductionOrderListItem;
  className?: string;
}

export function PrintOrderButton({ order, className = "" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 ${className}`}
      >
        <Printer size={16} /> Imprimir
      </button>

      <OrderPreviewModal order={open ? order : null} onClose={() => setOpen(false)} />
    </>
  );
}