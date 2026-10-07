import { useCallback, useEffect, useState } from "react";
import { getDesignsService } from "../services/design.service";
import type { Design } from "../types/design";

const MAX_PAGES = 50;

export function useCalendarDesigns() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all: Design[] = [];
      let page = 1;
      let hasNext = true;
      while (hasNext && page <= MAX_PAGES) {
        const res = await getDesignsService({ page });
        all.push(...res.designs);
        hasNext = res.pagination.hasNext;
        page += 1;
      }
      setDesigns(all);
    } catch {
      setError("No se pudieron cargar los diseños.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { designs, loading, error, refetch };
}