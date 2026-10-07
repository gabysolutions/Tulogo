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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderData, movementsData] = await Promise.all([
        getOrderByIdService(orderId),
        getOrderMovementsService(orderId),
      ]);
      setOrder(orderData);
      setMovements(movementsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al obtener el pedido"));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addDetail = useCallback(
    async (payload: AddOrderDetailPayload) => {
      const res = await addOrderDetailService(orderId, payload);
      await fetchAll();
      return res;
    },
    [orderId, fetchAll]
  );

  const updateDetail = useCallback(
    async (detailId: number, payload: UpdateOrderDetailPayload) => {
      const res = await updateOrderDetailService(detailId, payload);
      await fetchAll();
      return res;
    },
    [fetchAll]
  );

  const removeDetail = useCallback(
    async (detailId: number) => {
      const res = await deleteOrderDetailService(detailId);
      await fetchAll();
      return res;
    },
    [fetchAll]
  );

const advanceStage = useCallback(async () => {
  if (!order || order.status >= 10) return;
  try {
    await updateOrderStatusService(orderId, { status: order.status }); 
    await fetchAll();
  } catch (err: any) {
    const message = err?.response?.data?.message ?? "No se pudo avanzar la etapa.";
    console.error("Error al avanzar etapa:", err?.response?.data);
    throw new Error(message);
  }
}, [order, orderId, fetchAll]);

  return {
    order,
    movements,
    loading,
    error,
    refetch: fetchAll,
    addDetail,
    updateDetail,
    removeDetail,
    advanceStage,
  };
}