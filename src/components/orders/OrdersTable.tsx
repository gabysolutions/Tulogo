import type { OrderListItem, OrdersPagination  } from "../../types/order";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OrderRow from "./OrderRow";

interface Props {
  orders: OrderListItem[];
  onOpen: (order: OrderListItem) => void;
  onAdvance: (order: OrderListItem) => void;
  pagination?: OrdersPagination | null;
  onPageChange?: (page: number) => void;
}


export default function OrdersTable({ orders, onOpen, onAdvance, pagination,
  onPageChange,}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-gray-50 ">
            <tr className="border border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Orden
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Diseñador
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Piezas
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Entrega
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Dirección de envío
                </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Producción
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <OrderRow key={order.id} order={order} onOpen={onOpen} onAdvance={onAdvance} />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500">
                  No hay órdenes de producción.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500 sm:text-sm">
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} órdenes
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}