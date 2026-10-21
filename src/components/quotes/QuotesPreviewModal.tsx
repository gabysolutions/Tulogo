import { useEffect, useRef, useState } from "react";
import { X, MessageCircle, Download } from "lucide-react";
import Swal from "sweetalert2";
import type { Quote } from "../../types/quote";
import { getQuotePdf,createQuoteShareLink } from "../../services/quote.service";
import { EMOJI, openWhatsApp } from "../../lib/whatsapp";
import { SendPaymentInfoButton } from "../quotes/Sendpaymentinfobutton";

interface Props {
  quote: Quote | null;
  onClose: () => void;
}

const buildFileName = (q: Quote) => {
  const cleanName = q.clientName
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "");
  return `${q.folio} - ${cleanName}.pdf`;
};

export default function QuotePreviewModal({ quote, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); 
  const [sharing, setSharing] = useState(false);
  
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

const handleWhatsAppQuote = async () => {
  if (!quote || sharing) return;

  setSharing(true);
  try {
    const url = await createQuoteShareLink(quote.id);

    const message = [
      `Hola ${quote.clientName} ${EMOJI.wave}`,
      ``,
      `Te comparto tu cotización *${quote.folio}* ${EMOJI.page}`,
      url,
      ``,
      `Este enlace estará disponible por 48 horas.`,
      ``,
      `¡Gracias por tu preferencia! ${EMOJI.thanks}`,
    ].join("\n");

    openWhatsApp(quote.phone, message);
  } catch {
    Swal.fire({
      icon: "error",
      title: "No se pudo generar el enlace",
      text: "Intenta de nuevo en unos segundos.",
      confirmButtonColor: "#1e293b",
    });
  } finally {
    setSharing(false);
  }
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
            <h2 className="text-xl font-bold text-slate-800">Vista previa de cotización</h2>
            <p className="text-sm text-slate-500">{quote.folio}</p>
          </div>

          <div className="flex gap-2">
           <button
            onClick={handleWhatsAppQuote}
            disabled={!quote.phone || sharing}
            className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-40 disabled:hover:bg-transparent"
            title="Enviar cotización por WhatsApp"
          >
            <MessageCircle size={20} />
          </button>

            <SendPaymentInfoButton phone={quote.phone} folio={quote.folio} />

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
              title={`Cotización ${quote.folio}`}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}