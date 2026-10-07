import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getProductionOrdersService,
  getProductionOrderByIdService,
} from "../services/orders.service";
import type {
  GetProductionOrdersParams,
  Order,
  OrderCards,
  OrdersPagination,
  ProductionOrderListItem,
} from "../types/order";

const SEARCH_DEBOUNCE_MS = 400;

const EMPTY_CARDS: OrderCards = {
  total: 0,
  production: 0,
  delivered: 0,
  todaysDeliveries: 0,
  priority: 0,
};

const EMPTY_PAGINATION: OrdersPagination = {
  total: 0,
  page: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export type ProductionFilters = Omit<GetProductionOrdersParams, "page">;

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

// ---------------------------------------------------------------------------
// Listado de órdenes en producción
// ---------------------------------------------------------------------------

export function useProductionOrders(initialFilters: ProductionFilters = {}) {
  const [filters, setFilters] = useState<ProductionFilters>(initialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search ?? "");
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState<ProductionOrderListItem[]>([]);
  const [cards, setCards] = useState<OrderCards>(EMPTY_CARDS);
  const [pagination, setPagination] = useState<OrdersPagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Evita que una respuesta vieja pise a una más reciente
  const requestIdRef = useRef(0);

  // Debounce del buscador
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(filters.search ?? "");
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [filters.search]);

  const params = useMemo<GetProductionOrdersParams>(
    () => ({
      status: filters.status,
      priority: filters.priority,
      clientId: filters.clientId,
      designerId: filters.designerId,
      search: debouncedSearch.trim() || undefined,
      page,
    }),
    [
      filters.status,
      filters.priority,
      filters.clientId,
      filters.designerId,
      debouncedSearch,
      page,
    ]
  );

  const fetchOrders = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getProductionOrdersService(params);
      if (requestId !== requestIdRef.current) return;
      setOrders(result.orders);
      setCards(result.cards);
      setPagination(result.pagination);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(getErrorMessage(err, "No se pudieron cargar los pedidos en producción"));
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cualquier cambio de filtro regresa a la página 1
  const setFilter = useCallback(
    <K extends keyof ProductionFilters>(key: K, value: ProductionFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setDebouncedSearch("");
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.status ||
          filters.priority ||
          filters.clientId ||
          filters.designerId ||
          filters.search?.trim()
      ),
    [filters]
  );

  return {
    orders,
    cards,
    pagination,
    loading,
    error,
    filters,
    page,
    hasActiveFilters,
    setFilter,
    setPage,
    clearFilters,
    refetch: fetchOrders,
  };
}

// ---------------------------------------------------------------------------
// Detalle de una orden en producción
// ---------------------------------------------------------------------------

export function useProductionOrder(id: number | null | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const fetchOrder = useCallback(async () => {
    if (!id) {
      setOrder(null);
      setLoading(false);
      return;
    }
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await getProductionOrderByIdService(id);
      if (requestId !== requestIdRef.current) return;
      setOrder(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(getErrorMessage(err, "No se pudo cargar el pedido"));
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}