import { Eye, ArrowRight } from "lucide-react";

import type { OrderListItem } from "../../types/order";
import { CONFIG_STAGE_ID } from "../../types/order";
import DeliveryAddressInfo from "./DeliveryAddressInfo";
import PriorityBadge from "./PriorityBadge";
import SegmentedStages from "./SegmentedStages";

interface Props {
  order: OrderListItem;
  onOpen: (order: OrderListItem) => void;
  onAdvance: (order: OrderListItem) => void;
}

export default function OrderRow({ order, onOpen, onAdvance }: Props) {
  const missing = Math.max(0, order.numberPieces - order.piecesRegistered);
  const blocked = order.status === CONFIG_STAGE_ID && missing > 0;

  return (
    <tr
      onClick={() => onOpen(order)}
      className="cursor-pointer border-b transition-colors hover:bg-gray-50"
    >
      {/* Orden */}
      <td className="px-4 py-4">
        <div className="font-semibold">ORD-{String(order.id).padStart(4, "0")}</div>
        <div className="text-xs text-gray-500">COT-{String(order.quoteId).padStart(4, "0")}</div>
      </td>

      {/* Cliente */}
      <td className="px-4 py-4">
        <div className="font-medium">{order.client}</div>
        <div className="mt-1">
          <PriorityBadge priority={order.priority} />
        </div>
      </td>

      {/* Diseñador */}
      <td className="px-4 py-4">
        <span className="text-sm text-gray-700">{order.designer}</span>
      </td>

      {/* Piezas */}
      <td className="px-4 py-4">
        <div className="font-semibold">
          {order.piecesRegistered}/{order.numberPieces}
        </div>

        {missing > 0 && <p className="text-xs text-red-500">Faltan {missing}</p>}
        {missing === 0 && <p className="text-xs text-green-600">Completo</p>}
      </td>

      {/* Fecha */}
      <td className="px-4 py-4">{new Date(order.deliveryDate).toLocaleDateString()}</td>
       
      <td className="px-4 py-4">
        
        <DeliveryAddressInfo sending={order.sending} addressId={order.address} />
      </td>

      {/* Producción */}
      <td className="px-4 py-4">
        <SegmentedStages status={order.status} />
      </td>

      {/* Acciones */}
      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end items-center gap-2">
          <button onClick={() => onOpen(order)} className="rounded-lg p-2 hover:bg-gray-100" title="Ver detalle">
            <Eye className="h-5 w-5" />
          </button>

          {order.status < 10 && (
            <button
              onClick={() => onAdvance(order)}
              disabled={blocked}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              title={blocked ? "Completa la configuración (piezas faltantes) antes de avanzar" : undefined}
            >
              <ArrowRight className="h-4 w-4" />
              Avanzar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}