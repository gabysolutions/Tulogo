import { useCallback, useEffect, useState } from "react";
import { getMyDesignsService } from "../services/design.service";
import type { Design, DesignStatusCounts, DesignsPagination, GetDesignsParams } from "../types/design";

interface UseMyDesignsResult {
  designs: Design[];
  statusCounts: DesignStatusCounts | null;
  pagination: DesignsPagination | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMyDesigns(params: GetDesignsParams = {}): UseMyDesignsResult {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [statusCounts, setStatusCounts] = useState<DesignStatusCounts | null>(null);
  const [pagination, setPagination] = useState<DesignsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyDesignsService(params);
      setDesigns(res.designs);
      setStatusCounts(res.statusCounts);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener tus diseños");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  return { designs, statusCounts, pagination, loading, error, refetch: fetchDesigns };
}