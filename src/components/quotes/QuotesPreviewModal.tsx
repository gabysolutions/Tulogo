import { useEffect, useRef, useState } from "react";
import { X, MessageCircle,Download  } from "lucide-react";

import type { Quote } from "../../types/quote";
import { getQuotePdf } from "../../services/quote.service";

interface Props {
  quote: Quote | null;
  onClose: () => void;
}

export default function QuotePreviewModal({ quote, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quote) {
      setPdfUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    setLoading(true);
    setError(null);

    getQuotePdf(quote.id)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch(() => {
        setError("No se pudo generar el PDF. Intenta de nuevo.");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [quote]);

 
  const handleWhatsApp = () => {
    if (!quote) return;

    const phone = quote.phone?.replace(/\D/g, "");
    if (!phone) return;

    const message = `Hola ${quote.clientName}, te comparto tu cotización ${quote.folio}.`;
    window.open(
      `https://wa.me/52${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

const buildFileName = (q: Quote) => {
  const cleanName = q.clientName
    .replace(/[\\/:*?"<>|]/g, "") 
    .replace(/\s+/g, " ")         
    .trim()
    .replace(/[. ]+$/, "");       
  return `${q.folio} - ${cleanName}.pdf`;
};

const handleDownload = () => {
  if (!quote || !pdfUrl) return;

  const a = document.createElement("a");
  a.href = pdfUrl;
  a.download = buildFileName(quote);
  document.body.appendChild(a);
  a.click();
  a.remove();
};

  if (!quote) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Vista previa de cotización
            </h2>
            <p className="text-sm text-slate-500">{quote.folio}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleWhatsApp}
              disabled={!quote.phone}
              className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Enviar por WhatsApp"
            >
              <MessageCircle size={20} />
            </button>
            
            <button
                onClick={handleDownload}
                disabled={!pdfUrl || loading}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Descargar PDF"
              >
                <Download size={20} />
              </button>
                        

            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-slate-200"
            >
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
              title={`Cotización ${quote.folio}`}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}