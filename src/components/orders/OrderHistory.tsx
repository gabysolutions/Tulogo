import type { OrderMovement } from "../../types/order";
import OrderTimeline from "./OrderTimeline";

interface Props {
  movements: OrderMovement[];
}

export default function OrderHistory({ movements }: Props) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold">Historial de producción</h3>

      <p className="mb-4 text-xs text-gray-500">
        Seguimiento de cambios de etapa y responsables
      </p>

      {movements.length === 0 ? (
        <p className="text-sm text-gray-400">No hay movimientos registrados</p>
      ) : (
        <OrderTimeline movements={movements} />
      )}
    </section>
  );
}