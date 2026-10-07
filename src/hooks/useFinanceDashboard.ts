import { useEffect, useState } from "react";
import { financeService } from "../services/finance.service";
import type { FinanceDashboard } from "../types/finance";
import { toMonthParam } from "../utils/format";

export function useFinanceDashboard() {
  const [month, setMonth] = useState(() => toMonthParam(new Date()));
  const [data, setData] = useState<FinanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    financeService
      .getDashboard(month)
      .then((res) => active && setData(res))
      .catch(() => active && setError("No se pudo cargar el dashboard."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [month, reloadKey]);

  return { month, setMonth, data, loading, error, reload: () => setReloadKey((k) => k + 1) };
}