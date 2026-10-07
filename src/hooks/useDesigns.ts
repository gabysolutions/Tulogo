import { useCallback, useEffect, useState } from "react";
import { getDesignsService, type GetDesignsParams } from "../services/design.service";
import type { Design, DesignStatusCounts, DesignsPagination } from "../types/design";

interface UseDesignsResult {
  designs: Design[];
  statusCounts: DesignStatusCounts | null;
  pagination: DesignsPagination | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDesigns(params: GetDesignsParams = {}): UseDesignsResult {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [statusCounts, setStatusCounts] = useState<DesignStatusCounts | null>(null);
  const [pagination, setPagination] = useState<DesignsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDesignsService(params);
      setDesigns(res.designs);
      setStatusCounts(res.statusCounts);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener los diseños");
    } finally {
      setLoading(false);
    }
    
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  return { designs, statusCounts, pagination, loading, error, refetch: fetchDesigns };
}