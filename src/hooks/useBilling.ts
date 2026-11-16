import { useCallback, useEffect, useRef, useState } from "react";
import * as service from "../services/invoice.service";
import type {
   ApiError,
  BillingDocRef,
  BillingPagination,
  BillingQuoteRow,
  BillingQuotesQuery,
  BillingSource,
  BillingStats,
  CancelInvoicePayload,
  IssueInvoicePayload,
  QuoteBillingSummary,
  SendInvoicePayload,
} from "../types/invoice";
import { toApiError } from "../utils/invoiceUtils";

const openBlob = (blob: Blob, win: Window | null) => {
  const url = URL.createObjectURL(blob);
  if (win) win.location.href = url;
  else window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

export function useBilling(query: BillingQuotesQuery) {
  const [rows, setRows] = useState<BillingQuoteRow[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [pagination, setPagination] = useState<BillingPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const reqId = useRef(0);
  const { search, status,type, page, pageSize } = query;

  const refresh = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await service.getBillingQuotes({ search, status, type, page, pageSize });
      if (id !== reqId.current) return;
      setRows(res.rows);
      setStats(res.stats);
      setPagination(res.pagination);
    } catch (e) {
      if (id === reqId.current) setError(toApiError(e));
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [search, status, type, page, pageSize]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

 const issue = useCallback(
  async (source: BillingSource, documentId: number, payload: IssueInvoicePayload) => {
    const inv = await service.issueDocumentInvoice(source, documentId, payload);
    void refresh();
    return inv;
  },
  [refresh],
);

  const cancel = useCallback(
    async (invoiceId: number, payload: CancelInvoicePayload) => {
      const res = await service.cancelInvoice(invoiceId, payload);
      void refresh();
      return res;
    },
    [refresh],
  );

  const send = useCallback((invoiceId: number, payload: SendInvoicePayload) => service.sendInvoice(invoiceId, payload), []);

  const downloadPdf = useCallback(async (invoiceId: number) => {
    const win = window.open("", "_blank");
    try {
      openBlob(await service.getInvoicePdf(invoiceId), win);
    } catch (e) {
      win?.close();
      throw toApiError(e);
    }
  }, []);

  const downloadXml = useCallback(async (invoiceId: number, folio?: string | null) => {
    downloadBlob(await service.getInvoiceXml(invoiceId), `factura-${folio ?? invoiceId}.xml`);
  }, []);

  return { rows, stats, pagination, loading, error, refresh, issue, cancel, send, downloadPdf, downloadXml };
}

export type BillingActions = Pick<ReturnType<typeof useBilling>, "issue" | "cancel" | "send" | "downloadPdf" | "downloadXml">;

export function useDocumentBilling(doc: BillingDocRef | null) {
  const [summary, setSummary] = useState<QuoteBillingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const reqId = useRef(0);

  const type = doc?.type ?? null;
  const docId = doc?.id ?? null;

  const reload = useCallback(async () => {
    if (type == null || docId == null) return;
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await service.getDocumentBilling(type, docId);
      if (id === reqId.current) setSummary(res);
    } catch (e) {
      if (id === reqId.current) setError(toApiError(e));
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [type, docId]);

  useEffect(() => {
    setSummary(null);
    void reload();
  }, [reload]);

  return { summary, loading, error, reload };
}

export const useQuoteBilling = (quoteId: number | null) =>
  useDocumentBilling(quoteId == null ? null : { type: "quote", id: quoteId });

export function useCfdiUses() {
  const [uses, setUses] = useState<{ value: string; name: string }[]>([]);
  useEffect(() => {
    let alive = true;
    service.getCfdiUses().then((u) => alive && setUses(u)).catch(() => alive && setUses([]));
    return () => {
      alive = false;
    };
  }, []);
  return uses;
}
