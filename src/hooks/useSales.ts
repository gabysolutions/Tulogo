import { useCallback, useEffect, useState } from "react";
import {
  addSalePaymentService,
  cancelSalePaymentService,
   cancelSaleService,
  createSaleService,
  getSaleByIdService,
  getSalePDF,
  getSalesService,
  updateSaleService,
} from "../services/sale.service";
import type {
  AddSalePaymentPayload,
  CreateSalePayload,
  Sale,
  SalesPagination,
  SaleStatus,
  SaleWithDetails,
  UpdateSalePayload,
} from "../types/sale";

function errorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

export function useSales(limit = 10) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [pagination, setPagination] = useState<SalesPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatusState] = useState<SaleStatus | "all">("all");
  const [reloadKey, setReloadKey] = useState(0);

  // Venta abierta en el modal de detalle
  const [detail, setDetail] = useState<SaleWithDetails | null>(null);

  // Espera 400 ms después de escribir antes de buscar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Carga la lista; ignora respuestas viejas si cambian los filtros rápido
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getSalesService({ page, limit, search: debouncedSearch, status })
      .then((res) => {
        if (cancelled) return;
        setSales(res.sales);
        setPagination(res.pagination);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "No se pudieron cargar las ventas."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, debouncedSearch, status, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const setStatus = useCallback((value: SaleStatus | "all") => {
    setStatusState(value);
    setPage(1);
  }, []);

  // Si la venta abierta en el detalle cambió, actualízala con la respuesta del servidor
  const syncDetail = useCallback((updated: SaleWithDetails) => {
    setDetail((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  // Las acciones lanzan el error original: el modal o la página decide cómo avisarlo.
  const createSale = useCallback(
    async (payload: CreateSalePayload) => {
      const sale = await createSaleService(payload);
      setPage(1);
      refresh();
      return sale;
    },
    [refresh]
  );

  const updateSale = useCallback(
    async (id: number, payload: UpdateSalePayload) => {
      const res = await updateSaleService(id, payload);
      syncDetail(res.sale);
      refresh();
      return res;
    },
    [refresh, syncDetail]
  );

  const addPayment = useCallback(
    async (id: number, payload: AddSalePaymentPayload) => {
      const res = await addSalePaymentService(id, payload);
      syncDetail(res.sale);
      refresh();
      return res;
    },
    [refresh, syncDetail]
  );

const cancelSale = useCallback(
  async (id: number) => {
    const res = await cancelSaleService(id);
    syncDetail(res.sale);
    refresh();
    return res;
  },
  [refresh, syncDetail]
);


  const cancelPayment = useCallback(
    async (saleId: number, paymentId: number) => {
      const res = await cancelSalePaymentService(saleId, paymentId);
      syncDetail(res.sale);
      refresh();
      return res;
    },
    [refresh, syncDetail]
  );

  const openDetail = useCallback(async (id: number) => {
    setDetail(await getSaleByIdService(id));
  }, []);

  const closeDetail = useCallback(() => setDetail(null), []);

  const openNote = useCallback(async (id: number) => {
    const blob = await getSalePDF(id);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, []);

  return {
    
    sales,
    pagination,
    loading,
    error,
    refresh,
    
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
  
    detail,
    openDetail,
    closeDetail,
    cancelSale,
    createSale,
    updateSale,
    addPayment,
    cancelPayment,
    openNote,
  };
}