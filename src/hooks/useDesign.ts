import { useCallback, useEffect, useState } from "react";
import { getDesignByIdService } from "../services/design.service";
import type { Design } from "../types/design";


interface UseDesignResult {
  design: Design | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDesign(id: number): UseDesignResult {
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesign = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDesignByIdService(id);
      setDesign(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener el diseño");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDesign();
  }, [fetchDesign]);

  return { design, loading, error, refetch: fetchDesign };
}