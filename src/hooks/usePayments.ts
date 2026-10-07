import { useEffect, useState } from "react";
import { paymentService } from "../services/payment.service";
import type { PaymentFilters, PaymentsResponse } from "../types/payment";
import { toDateParam } from "../utils/format";

// Por defecto: pagos activos, del primer día del mes a hoy
const defaultFilters = (): PaymentFilters => {
  const now = new Date();
  return {
    status: 1,
    initialDate: toDateParam(new Date(now.getFullYear(), now.getMonth(), 1)),
    finalDate: toDateParam(now),
    page: 1,
  };
};

function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function usePayments() {
  const [filters, setFilters] = useState<PaymentFilters>(defaultFilters);
  const debounced = useDebounced(filters);
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    paymentService
      .getPayments(debounced)
      .then((res) => active && setData(res))
      .catch(() => active && setError("No se pudieron cargar los pagos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debounced, reloadKey]);

  // Cualquier cambio de filtro regresa a la página 1, salvo que el patch traiga page
  const updateFilters = (patch: Partial<PaymentFilters>) =>
    setFilters((prev) => ({ ...prev, page: 1, ...patch }));

  const resetFilters = () => setFilters(defaultFilters());

  return {
    filters,
    updateFilters,
    resetFilters,
    data,
    loading,
    error,
    reload: () => setReloadKey((k) => k + 1),
  };
}