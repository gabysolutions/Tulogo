import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, Printer } from "lucide-react";

import type { ProductionOrderListItem } from "../../types/order";
import { getOrderPdfService } from "../../services/orders.service";

interface Props {
  order: ProductionOrderListItem | null;
  onClose: () => void;
}

const orderFolio = (id: number) => `ORD-${String(id).padStart(4, "0")}`;

const buildFileName = (o: ProductionOrderListItem) => {
  const cleanName = o.client
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "");
  return `${orderFolio(o.id)} - ${cleanName}.pdf`;
};

export default function OrderPreviewModal({ order, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = order?.id;

  useEffect(() => {
    if (orderId === undefined) {
      setPdfUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    setLoading(true);
    setError(null);

    getOrderPdfService(orderId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo generar el PDF. Intenta de nuevo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orderId]);

  const handleDownload = () => {
    if (!order || !pdfUrl) return;

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = buildFileName(order);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  if (!order) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Vista previa de orden</h2>
            <p className="text-sm text-slate-500">
              {orderFolio(order.id)} · {order.client}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={!pdfUrl || loading}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Imprimir"
            >
              <Printer size={20} />
            </button>

            <button
              onClick={handleDownload}
              disabled={!pdfUrl || loading}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Descargar PDF"
            >
              <Download size={20} />
            </button>

            <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-200">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-slate-100">
          {loading && (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Generando PDF...
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center text-sm text-red-500">
              {error}
            </div>
          )}

          {pdfUrl && !loading && !error && (
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              title={`Orden ${orderFolio(order.id)}`}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

