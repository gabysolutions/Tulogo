import { useState } from "react";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import { useClientAddresses } from "../../hooks/useClientAddresses";
import { ClientAddressCard } from "./ClientAddressCard";
import { ClientAddressFormModal } from "./ClientAddressFormModal";
import type { ClientAddress } from "../../types/client";

interface ClientAddressSectionProps {
  clientId: number;
}

export function ClientAddressSection({ clientId }: ClientAddressSectionProps) {
  const { addresses, loading, error, createAddress, updateAddress, deleteAddress } =
    useClientAddresses(clientId);
  const [editingAddress, setEditingAddress] = useState<ClientAddress | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDelete = async (address: ClientAddress) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar dirección?",
      text: `${address.street} ${address.number}, ${address.city}`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteAddress(address.id);
    } catch {
      Swal.fire({ icon: "error", title: "No se pudo eliminar la dirección" });
    }
  };

  return (
    <section className="border-t border-slate-200 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Direcciones</p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
        >
          <Plus className="size-3.5" /> Agregar
        </button>
      </div>

      {loading && <p className="text-xs text-slate-400">Cargando direcciones...</p>}
      {error && <p className="text-xs text-red-500">Error al cargar direcciones.</p>}
      {!loading && !error && addresses.length === 0 && (
        <p className="text-xs text-slate-400">Este cliente no tiene direcciones registradas.</p>
      )}

      <div className="space-y-2">
        {addresses.map((address) => (
          <ClientAddressCard key={address.id} address={address} onEdit={setEditingAddress} onDelete={handleDelete} />
        ))}
      </div>

      <ClientAddressFormModal open={creating} address={null} onClose={() => setCreating(false)} onSave={createAddress} />

      <ClientAddressFormModal
        open={editingAddress !== null}
        address={editingAddress}
        onClose={() => setEditingAddress(null)}
        onSave={(payload) => updateAddress(editingAddress!.id, payload)}
      />
    </section>
  );
}