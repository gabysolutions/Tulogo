import { useCallback, useEffect, useState } from "react";
import {
  getOrderByIdService,
  getOrderMovementsService,
  addOrderDetailService,
  updateOrderDetailService,
  deleteOrderDetailService,
  updateOrderStatusService,
} from "../services/orders.service";
import type {
  Order,
  OrderMovement,
  AddOrderDetailPayload,
  UpdateOrderDetailPayload,
} from "../types/order";

export function useOrderDetail(orderId: number) {
  const [order, setOrder] = useState<Order | null>(null);
  const [movements, setMovements] = useState<OrderMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(
    async (silent: boolean) => {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const [orderData, movementsData] = await Promise.all([
          getOrderByIdService(orderId),
          getOrderMovementsService(orderId),
        ]);
        setOrder(orderData);
        setMovements(movementsData);
      } catch (err) {
        if (silent) {
          console.error("Error al refrescar el pedido:", err);
        } else {
          setError(err instanceof Error ? err : new Error("Error al obtener el pedido"));
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [orderId]
  );

  const fetchAll = useCallback(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addDetail = useCallback(
    async (payload: AddOrderDetailPayload) => {
      const res = await addOrderDetailService(orderId, payload);
      await refresh();
      return res;
    },
    [orderId, refresh]
  );

  const updateDetail = useCallback(
    async (detailId: number, payload: UpdateOrderDetailPayload) => {
      const res = await updateOrderDetailService(detailId, payload);
      await refresh();
      return res;
    },
    [refresh]
  );

  const removeDetail = useCallback(
    async (detailId: number) => {
      const res = await deleteOrderDetailService(detailId);
      await refresh();
      return res;
    },
    [refresh]
  );

  const advanceStage = useCallback(async () => {
    if (!order || order.status >= 10) return;
    try {
      await updateOrderStatusService(orderId, { status: order.status });
      await refresh();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "No se pudo avanzar la etapa.";
      console.error("Error al avanzar etapa:", err?.response?.data);
      throw new Error(message);
    }
  }, [order, orderId, refresh]);

  return {
    order,
    movements,
    loading,
    error,
    refetch: fetchAll,
    refresh,
    addDetail,
    updateDetail,
    removeDetail,
    advanceStage,
  };
}