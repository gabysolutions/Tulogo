import { useState, useCallback, useEffect } from "react";
import {
  getQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
  acceptQuote,
  addQuoteIva,
  addQuoteArticles,
} from "../services/quote.service";
import type {
  Quote,
  QuotesPagination,
  QuoteCreatePayload,
  QuoteUpdatePayload,
  QuotePriority,
  QuoteAcceptResponse,
  QuoteIvaResponse,
  QuoteAddArticlesPayload,
  QuoteAddArticlesResponse,
} from "../types/quote";

interface UseQuotesResult {
  quotes: Quote[];
  pagination: QuotesPagination | null;
  loading: boolean;
  error: Error | null;
  search: string;
  setSearch: (v: string) => void;
  status: number | "all";
  setStatus: (v: number | "all") => void;
  priority: QuotePriority | "all";
  setPriority: (v: QuotePriority | "all") => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  page: number;
  setPage: (v: number) => void;
  refetch: () => void;
  createQuote: (payload: QuoteCreatePayload) => Promise<void>;
  updateQuote: (id: number, payload: QuoteUpdatePayload) => Promise<void>;
  deleteQuote: (id: number) => Promise<void>;
  acceptQuote: (id: number) => Promise<QuoteAcceptResponse>;
  addQuoteIva: (id: number) => Promise<QuoteIvaResponse>;
  addQuoteArticles: (
    id: number,
    payload: QuoteAddArticlesPayload
  ) => Promise<QuoteAddArticlesResponse>;
}

export function useQuotes(): UseQuotesResult {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState<QuotesPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<number | "all">("all");
  const [priority, setPriority] = useState<QuotePriority | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { quotes: list, pagination: p } = await getQuotes({
        search: search || undefined,
        initialDate: dateFrom || undefined,
        finalDate: dateTo || undefined,
        priority: priority !== "all" ? priority.toLowerCase() : undefined,
        status: status !== "all" ? status : undefined,
        page,
      });
      setQuotes(list);
      setPagination(p);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al obtener las cotizaciones"));
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const create = useCallback(
    async (payload: QuoteCreatePayload) => {
      await createQuote(payload);
      await fetchQuotes();
    },
    [fetchQuotes]
  );

  const update = useCallback(
    async (id: number, payload: QuoteUpdatePayload) => {
      await updateQuote(id, payload);
      await fetchQuotes();
    },
    [fetchQuotes]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteQuote(id);
      await fetchQuotes();
    },
    [fetchQuotes]
  );

  const accept = useCallback(
    async (id: number) => {
      const response = await acceptQuote(id);
      await fetchQuotes();
      return response;
    },
    [fetchQuotes]
  );

  const addIva = useCallback(
    async (id: number) => {
      const response = await addQuoteIva(id);
      await fetchQuotes();
      return response;
    },
    [fetchQuotes]
  );

  const addArticles = useCallback(
    async (id: number, payload: QuoteAddArticlesPayload) => {
      const response = await addQuoteArticles(id, payload);
      await fetchQuotes();
      return response;
    },
    [fetchQuotes]
  );

  return {
    quotes,
    pagination,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    refetch: fetchQuotes,
    createQuote: create,
    updateQuote: update,
    deleteQuote: remove,
    acceptQuote: accept,
    addQuoteIva: addIva,
    addQuoteArticles: addArticles,
  };
}