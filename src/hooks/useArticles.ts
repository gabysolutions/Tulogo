import { useState, useCallback, useEffect } from "react";
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  activateArticle,
} from "../services/article.service";
import type { ArticleListItem, ArticlesPagination, ArticlePayload } from "../types/inventory";

interface UseArticlesResult {
  articles: ArticleListItem[];
  pagination: ArticlesPagination | null;
  loading: boolean;
  error: Error | null;
  search: string;
  setSearch: (search: string) => void;
  categoryFilter: number | undefined;
  setCategoryFilter: (categoryId: number | undefined) => void;
  page: number;
  setPage: (page: number) => void;
  refetch: () => void;
  createArticle: (payload: ArticlePayload) => Promise<void>;
  updateArticle: (id: number, payload: ArticlePayload) => Promise<void>;
  deleteArticle: (id: number) => Promise<void>;
  activateArticle: (id: number) => Promise<void>;
}

export function useArticles(): UseArticlesResult {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [pagination, setPagination] = useState<ArticlesPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { articles: list, pagination: p } = await getArticles({
        search: search || undefined,
        category: categoryFilter,
        page,
      });
      setArticles(list);
      setPagination(p);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al obtener los artículos"));
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const create = useCallback(
    async (payload: ArticlePayload) => {
      await createArticle(payload);
      await fetchArticles();
    },
    [fetchArticles]
  );

  const update = useCallback(
    async (id: number, payload: ArticlePayload) => {
      await updateArticle(id, payload);
      await fetchArticles();
    },
    [fetchArticles]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteArticle(id);
      await fetchArticles();
    },
    [fetchArticles]
  );

  const activate = useCallback(
    async (id: number) => {
      await activateArticle(id);
      await fetchArticles();
    },
    [fetchArticles]
  );

  return {
    articles,
    pagination,
    loading,
    error,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    page,
    setPage,
    refetch: fetchArticles,
    createArticle: create,
    updateArticle: update,
    deleteArticle: remove,
    activateArticle: activate,
  };
}