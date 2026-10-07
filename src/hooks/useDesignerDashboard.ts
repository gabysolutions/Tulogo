import { useCallback, useEffect, useState } from "react";
import {
  getMyDesignsService,
  getMyDesignMovementsService,
  getFreeDesignsService,
} from "../services/design.service";
import type { DesignMovementDTO, Design, DesignStatusCounts } from "../types/design";

interface DesignerDashboardData {
  statusCounts: DesignStatusCounts;
  movements: DesignMovementDTO[];
  freeDesigns: Design[];
}

interface UseDesignerDashboardResult {
  data: DesignerDashboardData | null;
  loading: boolean;
  error: string | null;
}

export function useDesignerDashboard(): UseDesignerDashboardResult {
  const [data, setData] = useState<DesignerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [myDesigns, movementsRes, freeDesigns] = await Promise.all([
        getMyDesignsService(),
        getMyDesignMovementsService(),
        getFreeDesignsService(),
      ]);

      setData({
        statusCounts: myDesigns.statusCounts,
        movements: movementsRes.movements,
        freeDesigns,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, error };
}