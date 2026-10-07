import { Pencil, Trash2, MapPin } from "lucide-react";
import type { ClientAddress } from "../../types/client";

interface ClientAddressCardProps {
  address: ClientAddress;
  onEdit: (address: ClientAddress) => void;
  onDelete: (address: ClientAddress) => void;
}

export function ClientAddressCard({ address, onEdit, onDelete }: ClientAddressCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
      <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          {address.street} {address.number}
        </p>
        <p className="truncate text-xs text-slate-500">
          {address.neighborhood}, {address.city}, {address.state} · CP {address.zipCode}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => onEdit(address)}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Editar dirección"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(address)}
          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Eliminar dirección"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}