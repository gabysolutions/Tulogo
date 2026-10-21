import { useEffect, useState } from "react";
import { MapPin, Check } from "lucide-react";
import { getClientAddresses } from "../../services/client.service"; // la misma función que usa tu modal
import type { ClientAddress } from "../../types/client";

interface Props {
  clientId: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function formatAddress(a: ClientAddress) {
  return `${a.street} ${a.number}, ${a.neighborhood}, ${a.city}, ${a.state}, C.P. ${a.zipCode}`;
}

export default function DeliveryAddressPicker({ clientId, selectedId, onSelect }: Props) {
  const [addresses, setAddresses] = useState<ClientAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await getClientAddresses(clientId);
        if (cancelled) return;
        setAddresses(list);
        if (selectedId == null && list.length === 1) onSelect(list[0].id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (loading) return <p className="text-sm text-slate-400">Cargando direcciones...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (addresses.length === 0) {
    return (
      <p className="text-sm text-amber-600">
        Este cliente no tiene direcciones registradas. Agrégala desde el módulo de Clientes para poder avanzar.
      </p>
    );
  }

  return (
    <div className="max-h-48 space-y-2 overflow-y-auto">
      {addresses.map((a) => {
        const active = a.id === selectedId;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
              active ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <MapPin size={16} className="mt-0.5 shrink-0 text-slate-500" />
            <span className="flex-1 text-sm text-slate-700">{formatAddress(a)}</span>
            {active && <Check size={16} className="shrink-0 text-slate-900" />}
          </button>
        );
      })}
    </div>
  );
}