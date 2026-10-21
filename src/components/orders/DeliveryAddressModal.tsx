import { useEffect, useState } from "react";
import { MapPin, X, Check } from "lucide-react";
import { getClientAddresses } from "../../services/client.service";
import { updateOrderDeliveryAddress } from "../../services/client-address.service";
import type { ClientAddress } from "../../types/client";

interface Props {
  open: boolean;
  orderId: number;
  clientId: number;
  currentAddressId?: number | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

function formatAddress(a: ClientAddress) {
  return `${a.street} ${a.number}, ${a.neighborhood}, ${a.city}, ${a.state}, C.P. ${a.zipCode}`;
}

export default function DeliveryAddressModal({
  open,
  orderId,
  clientId,
  currentAddressId,
  onClose,
  onSaved,
}: Props) {
  const [addresses, setAddresses] = useState<ClientAddress[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await getClientAddresses(clientId);
        if (cancelled) return;
        setAddresses(list);
        setSelectedId(
          currentAddressId ?? (list.length === 1 ? list[0].id : null)
        );
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "No se pudieron cargar las direcciones.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, clientId, currentAddressId]);

  if (!open) return null;

  async function handleConfirm() {
    if (selectedId == null) return;
    setSaving(true);
    setError(null);
    try {
      await updateOrderDeliveryAddress(orderId, { addressId: selectedId });
      await onSaved();
    } catch (err: any) {
      setError(err?.message ?? "No se pudo guardar la dirección de envío.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Dirección de envío</h3>
            <p className="text-xs text-slate-500">
              Selecciona a dónde se enviará el paquete.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-1 text-slate-400 hover:bg-gray-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-6 py-4">
          {loading && <p className="text-sm text-slate-400">Cargando direcciones...</p>}

          {!loading && addresses.length === 0 && !error && (
            <p className="text-sm text-amber-600">
              Este cliente no tiene direcciones registradas. Agrégala desde el módulo de
              Clientes para poder avanzar.
            </p>
          )}

          {addresses.map((a) => {
            const active = a.id === selectedId;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-slate-900 bg-slate-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <MapPin size={18} className="mt-0.5 shrink-0 text-slate-500" />
                <span className="flex-1 text-sm text-slate-700">{formatAddress(a)}</span>
                {active && <Check size={18} className="shrink-0 text-slate-900" />}
              </button>
            );
          })}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-full px-4 py-2 text-xs font-medium text-slate-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedId == null || saving}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Guardando..." : "Guardar y avanzar"}
          </button>
        </div>
      </div>
    </div>
  );
}