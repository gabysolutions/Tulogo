import type { ButtonHTMLAttributes } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaymentPagination as Pagination } from "../../types/payment";

function Button({ className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-card px-4 text-sm font-medium whitespace-nowrap transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 ${className}`}
      {...props}
    />
  );
}

interface Props {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export function PaymentPagination({ pagination, onPageChange }: Props) {
  const { total, page, totalPages, hasNext, hasPrev } = pagination;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "pago" : "pagos"} · Página {page} de {Math.max(totalPages, 1)}
      </p>
      <div className="flex gap-2">
        <Button disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft /> Anterior
        </Button>
        <Button disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
          Siguiente <ChevronRight />
        </Button>
      </div>
    </div>
  );
}