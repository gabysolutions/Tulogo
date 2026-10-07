import { useCallback, useEffect, useRef, useState } from "react";
import { getOrderMovementsService } from "../services/orders.service";
import type { OrderMovement } from "../types/order";

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

/**
 * Historial de movimientos de una orden.
 * `enabled` permite montar el hook sin pegarle al API hasta que el drawer se abra;
 * cada vez que pasa a true se vuelve a consultar (así el historial siempre está fresco).
 */
export function useOrderMovements(orderId: number | null | undefined, enabled = true) {
  const [movements, setMovements] = useState<OrderMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const fetchMovements = useCallback(async () => {
    if (!orderId || !enabled) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderMovementsService(orderId);
      if (requestId !== requestIdRef.current) return;
      setMovements(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setMovements([]);
      setError(getErrorMessage(err, "No se pudo cargar el historial"));
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [orderId, enabled]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return { movements, loading, error, refetch: fetchMovements };
}