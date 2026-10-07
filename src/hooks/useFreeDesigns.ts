import { useCallback, useEffect, useState } from "react";
import { getFreeDesignsService } from "../services/design.service";
import type { Design } from "../types/design";

interface UseFreeDesignsResult {
  freeDesigns: Design[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFreeDesigns(): UseFreeDesignsResult {
  const [freeDesigns, setFreeDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFreeDesignsService();
      setFreeDesigns(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener diseños disponibles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFree();
  }, [fetchFree]);

  return { freeDesigns, loading, error, refetch: fetchFree };
}