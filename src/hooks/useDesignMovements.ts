import { useCallback, useEffect, useState } from "react";
import { getMyDesignMovementsService } from "../services/design.service";
import type { DesignMovementDTO, DesignsPagination } from "../types/design";

interface UseDesignMovementsResult {
  movements: DesignMovementDTO[];
  pagination: DesignsPagination | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  refetch: () => void;
}

export function useDesignMovements(): UseDesignMovementsResult {
  const [movements, setMovements] = useState<DesignMovementDTO[]>([]);
  const [pagination, setPagination] = useState<DesignsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getMyDesignMovementsService(page);
      setMovements((prev) => (append ? [...prev, ...res.movements] : res.movements));
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener los movimientos");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = () => {
    if (!pagination?.hasNext || loadingMore) return;
    fetchPage(pagination.page + 1, true);
  };

  const refetch = () => fetchPage(1, false);

  return { movements, pagination, loading, loadingMore, error, loadMore, refetch };
}