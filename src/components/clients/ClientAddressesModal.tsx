import { X } from "lucide-react";
import type { Client } from "../../types/client";
import { ClientAddressSection } from "./ClientAddressSection";
import { getFullName } from "../../utils/client-helpers";

interface ClientAddressesModalProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
}

export function ClientAddressesModal({ client, open, onClose }: ClientAddressesModalProps) {
  if (!open || !client) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Direcciones</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              { getFullName(client)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <ClientAddressSection clientId={client.id} />
        </div>
      </div>
    </div>
  );
}