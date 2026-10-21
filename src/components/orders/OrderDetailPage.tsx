import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";


import { useOrderDetail } from "../../hooks/useOrderDetail";
import { canAdvanceStage, missingPiecesCount } from "../../utils/orderValidation";

import OrderInformation from "../../components/orders/OrderInformation";
import OrderImages from "../../components/orders/OrderImages";
import OrderHistory from "../../components/orders/OrderHistory";
import OrderDetailsTable from "../../components/orders/OrderDetailsTable";
import OrderSizes from "../../components/orders/OrderSizes";

import { useOrderAdvance } from "../../hooks/useOrderAdvance";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id);
 

const { order, movements, loading, error,
  addDetail, updateDetail, removeDetail, advanceStage, refresh,
} = useOrderDetail(orderId);

const { requestAdvance, addressModal } = useOrderAdvance(async () => {
  await advanceStage();
});

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <p className="text-sm text-slate-400">Cargando pedido...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <p className="text-sm text-red-500">{error?.message ?? "Pedido no encontrado"}</p>
        <button
          onClick={() => navigate("/pedidos")}
          className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600"
        >
          <ArrowLeft size={16} /> Volver a Pedidos
        </button>
      </main>
    );
  }

  const blocked = !canAdvanceStage(order);
  const missing = missingPiecesCount(order);

  

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <button
        onClick={() => navigate("/pedidos")}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Volver a Pedidos
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">ORD-{String(order.id).padStart(4, "0")}</h2>
          <p className="text-sm text-slate-500">
            {order.client} · {order.details.length} de {order.numberPieces} piezas capturadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {blocked && order.status < 10 && (
            <span className="hidden items-center gap-1.5 text-xs text-amber-600 sm:flex">
              <AlertTriangle size={14} />
              Completa la configuración{missing > 0 ? ` (faltan ${missing})` : ""} para avanzar
            </span>
          )}
          <button
           onClick={() => requestAdvance(order)}
            disabled={order.status >= 10 || blocked}
            title={
              blocked
                ? "Completa la configuración (nombre, talla y género de cada pieza) antes de avanzar"
                : undefined
            }
            className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            → Avanzar etapa
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <OrderInformation order={order} />
          <OrderSizes order={order} />
          <OrderDetailsTable
            order={order}
            onAddDetail={addDetail}
            onUpdateDetail={updateDetail}
            onRemoveDetail={removeDetail}
            onRefresh={refresh}
          />
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <OrderImages order={order} />
          <OrderHistory movements={movements} />
        </aside>
      </div>
       {addressModal}
    </main>
  );
}