import { useNavigate } from "react-router-dom";
import { OrdersHeader, OrdersStats, OrdersFilters, OrdersTable } from "../../components/orders";
import { useOrders } from "../../hooks/useOrders";
import { useOrderAdvance } from "../../hooks/useOrderAdvance";
import type { OrderListItem } from "../../types/order";

export default function Orders() {
  const navigate = useNavigate();
  const {
    orders,
    cards,
    loading,
    error,
    search,
    setSearch,
    priority,
    setPriority,
    stage,
    setStage,
    pagination,
    advanceStage,
  } = useOrders();

  const { requestAdvance, addressModal } = useOrderAdvance(async (order: OrderListItem) => {
    await advanceStage(order.id, order.status);
  });

  const handleOpen = (order: OrderListItem) => navigate(`/pedidos/${order.id}`);

  return (
    <main className="mx-auto w-full px-6 py-8">
      <OrdersHeader />

      <section className="mt-6">{cards && <OrdersStats cards={cards} />}</section>

      <section className="mt-6">
        <OrdersFilters
          search={search}
          setSearch={setSearch}
          priority={priority}
          setPriority={setPriority}
          stage={stage}
          setStage={setStage}
          results={pagination?.total ?? orders.length}
        />
      </section>

      <section className="mt-6">
        {loading && <p className="text-sm text-slate-400">Cargando pedidos...</p>}
        {error && <p className="text-sm text-red-500">Error al cargar pedidos.</p>}
        {!loading && !error && (
          <OrdersTable orders={orders} onOpen={handleOpen} onAdvance={requestAdvance} />
        )}
      </section>

      {addressModal}
    </main>
  );
}