import { useState, useCallback, useEffect } from "react";
import { getCategories, createCategory, updateCategory } from "../services/category.service";
import type { Category, CategoryPayload } from "../types/inventory";

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  createCategory: (payload: CategoryPayload) => Promise<void>;
  updateCategory: (id: number, payload: CategoryPayload) => Promise<void>;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al obtener las categorías"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const create = useCallback(
    async (payload: CategoryPayload) => {
      await createCategory(payload);
      await fetchCategories();
    },
    [fetchCategories]
  );

  const update = useCallback(
    async (id: number, payload: CategoryPayload) => {
      await updateCategory(id, payload);
      await fetchCategories();
    },
    [fetchCategories]
  );

  return { categories, loading, error, refetch: fetchCategories, createCategory: create, updateCategory: update };
}