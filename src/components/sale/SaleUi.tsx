import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { SaleStatus } from "../../types/sale";

export const inputClass =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500";

export const formatMoney = (value: number) =>
  `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function getErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message ?? fallback;
}

// Suposición: 0 = cancelada, 1 = pendiente de pago, 2 = liquidada. Ajusta si tu backend usa otro significado.
const STATUS_STYLES: Record<SaleStatus, { label: string; className: string }> = {
  0: { label: "Cancelada", className: "bg-red-100 text-red-700" },
  1: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
  2: { label: "Liquidada", className: "bg-emerald-100 text-emerald-700" },
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const { label, className } = STATUS_STYLES[status] ?? STATUS_STYLES[1];
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function ModalShell({ title, onClose, children, maxWidth = "max-w-lg" }: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] w-full ${maxWidth} flex-col rounded-2xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalFooter({
  onClose,
  saving,
  disabled,
  submitLabel,
}: {
  onClose: () => void;
  saving: boolean;
  disabled: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors hover:bg-slate-100 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving || disabled}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Guardando..." : submitLabel}
      </button>
    </div>
  );
}