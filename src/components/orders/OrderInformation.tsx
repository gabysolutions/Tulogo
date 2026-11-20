import { useState } from "react";
import type { Order, OrderType } from "../../types/order";
import { getStage, ORDER_TYPE, ORDER_TYPE_META } from "../../types/order";

import PriorityBadge from "./PriorityBadge";
import SegmentedStages from "./SegmentedStages";

interface Props {
  order: Order;
  onChangeType: (type: OrderType) => Promise<void>;
}

export default function OrderInformation({ order, onChangeType }: Props) {
  const [pendingType, setPendingType] = useState<OrderType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No hay marcha atrás: una vez "sin personalizar", el select queda bloqueado
  const typeLocked = order.type === ORDER_TYPE.NO_CUSTOM;

  const handleSelect = (value: OrderType) => {
    if (value === order.type) return;
    setError(null);
    setPendingType(value);
  };

  const handleConfirm = async () => {
    if (!pendingType) return;
    try {
      setSaving(true);
      setError(null);
      await onChangeType(pendingType);
      setPendingType(null);
    } catch {
      setError("No se pudo cambiar el tipo de pedido. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (saving) return;
    setPendingType(null);
    setError(null);
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Información del pedido</h3>
        <PriorityBadge priority={order.priority} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <InfoItem label="Orden" value={`ORD-${String(order.id).padStart(4, "0")}`} />
        <InfoItem label="Cotización" value={`COT-${String(order.quoteId).padStart(4, "0")}`} />
        <InfoItem label="Cliente" value={order.client} />
        <InfoItem label="Diseñador" value={order.designer} />
        <InfoItem label="Piezas" value={String(order.numberPieces)} />
        <InfoItem label="Entrega" value={new Date(order.deliveryDate).toLocaleDateString()} />
        <InfoItem label="Etapa actual" value={getStage(order.status).label} />

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Tipo de pedido</p>
          <select
            value={order.type}
            disabled={typeLocked}
            onChange={(e) => handleSelect(e.target.value as OrderType)}
            title={typeLocked ? "Este cambio no se puede revertir" : undefined}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
          >
            {Object.values(ORDER_TYPE).map((t) => (
              <option key={t} value={t}>
                {ORDER_TYPE_META[t].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-gray-600">Progreso de producción</p>
        <SegmentedStages status={order.status} />
      </div>

      {pendingType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-slate-800">
              ¿Cambiar a sin personalizar?
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Vas a cambiar el pedido{" "}
              <span className="font-medium">ORD-{String(order.id).padStart(4, "0")}</span> de{" "}
              <span className="font-medium">personalizado</span> a{" "}
              <span className="font-medium">sin personalizar</span>.{" "}
              <span className="font-semibold text-red-600">
                Esta acción no se puede deshacer.
              </span>
            </p>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                {saving ? "Guardando..." : "Sí, cambiar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: ItemProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-gray-800">{value}</p>
    </div>
  );
}