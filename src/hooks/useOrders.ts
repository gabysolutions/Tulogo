import { useCallback, useEffect, useState } from "react";
import { getOrdersService, updateOrderStatusService } from "../services/orders.service";
import type { OrderListItem, OrderCards, OrdersPagination, Priority } from "../types/order";
import Swal from "sweetalert2";
export function useOrders() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [cards, setCards] = useState<OrderCards | null>(null);
  const [pagination, setPagination] = useState<OrdersPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [search, setSearchState] = useState("");
  const [priority, setPriorityState] = useState<"all" | Priority>("all");
  const [stage, setStageState] = useState<number | "all">("all");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrdersService({
        search: search || undefined,
        priority: priority === "all" ? undefined : priority,
        status: stage === "all" ? undefined : stage,
        page,
      });
      setOrders(result.orders);
      setCards(result.cards);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al obtener los pedidos"));
    } finally {
      setLoading(false);
    }
  }, [search, priority, stage, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

const advanceStage = useCallback(
  async (orderId: number, currentStatus: number) => {
    if (currentStatus >= 10) return;
    try {
      await updateOrderStatusService(orderId, { status: currentStatus  });
      await fetchOrders();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "No se pudo avanzar la etapa.";
      Swal.fire({
        title: "No se pudo avanzar",
        text: message,
        icon: "error",
      });
    }
  },
  [fetchOrders]
);

  return {
    orders,
    cards,
    pagination,
    loading,
    error,

    search,
    setSearch: (value: string) => {
      setPage(1);
      setSearchState(value);
    },

    priority,
    setPriority: (value: "all" | Priority) => {
      setPage(1);
      setPriorityState(value);
    },

    stage,
    setStage: (value: number | "all") => {
      setPage(1);
      setStageState(value);
    },

    page,
    setPage,

    advanceStage,
    refetch: fetchOrders,
  };
}