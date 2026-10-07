import type { Order } from "../../types/order";
import { getStage } from "../../types/order";

import PriorityBadge from "./PriorityBadge";
import SegmentedStages from "./SegmentedStages";

interface Props {
  order: Order;
}

export default function OrderInformation({ order }: Props) {
  return (
    <div className="rounded-xl  bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Información del pedido
        </h3>

        <PriorityBadge priority={order.priority} />
      </div>

      <div className="grid grid-cols-2 gap-5">

        <InfoItem
          label="Orden"
          value={`ORD-${String(order.id).padStart(4, "0")}`}
        />

        <InfoItem
          label="Cotización"
          value={`COT-${String(order.quoteId).padStart(4, "0")}`}
        />

        <InfoItem
          label="Cliente"
          value={order.client}
        />

        <InfoItem
          label="Diseñador"
          value={order.designer}
        />

        <InfoItem
          label="Piezas"
          value={String(order.numberPieces)}
        />

        <InfoItem
          label="Entrega"
          value={new Date(order.deliveryDate).toLocaleDateString()}
        />

        <InfoItem
          label="Etapa actual"
          value={getStage(order.status).label}
        />

      </div>

      <div className="mt-6">

        <p className="mb-2 text-sm font-medium text-gray-600">
          Progreso de producción
        </p>

        <SegmentedStages status={order.status} />

      </div>
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
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}