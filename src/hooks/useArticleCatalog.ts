
import { useState, useCallback, useEffect } from "react";
import { getArticles } from "../services/article.service";
import type { ArticleListItem } from "../types/inventory";

export function useArticleCatalog() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const all: ArticleListItem[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const { articles: list, pagination } = await getArticles({ page });
        all.push(...list);
        hasNext = pagination.hasNext;
        page += 1;
      }

      setArticles(all.filter((a) => a.status === 1));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { articles, loading, refetch: fetchAll };
}