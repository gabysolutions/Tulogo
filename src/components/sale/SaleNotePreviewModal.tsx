import { useEffect, useRef, useState } from "react";
import { X, Download ,MessageCircle} from "lucide-react";
import type { Sale } from "../../types/sale";
import Swal from "sweetalert2";
import { getSalePDF,createSaleShareLink } from "../../services/sale.service";
import { SendPaymentInfoButton } from "../quotes/Sendpaymentinfobutton";
import { EMOJI, openWhatsApp } from "../../lib/whatsapp";

interface Props {
  sale: Sale | null;
  onClose: () => void;
}

const buildFileName = (s: Sale) => {
  const cleanName = s.clientName
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "");
  return `V-${String(s.id).padStart(4, "0")} - ${cleanName}.pdf`;
};

export default function SaleNotePreviewModal({ sale, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!sale) {
      setPdfUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    setLoading(true);
    setError(null);
    setPdfUrl(null);

    getSalePDF(sale.id)
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
  }, [sale]);
  
  const handleWhatsAppSale = async () => {
    if (!sale || sharing) return;
  
    setSharing(true);
    try {
      const url = await createSaleShareLink(sale.id);
  
      const message = [
        `Hola ${sale.clientName} ${EMOJI.wave}`,
        ``,
        `Te comparto tu cotización *${sale.folio}* ${EMOJI.page}`,
        url,
        ``,
        `Este enlace estará disponible por 48 horas.`,
        ``,
        `¡Gracias por tu preferencia! ${EMOJI.thanks}`,
      ].join("\n");
  
      openWhatsApp(sale.phone, message);
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
    if (!sale || !pdfUrl) return;

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = buildFileName(sale);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!sale) return null;

  const folio = `V-${String(sale.id).padStart(4, "0")}`;

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
            <h2 className="text-xl font-bold text-slate-800">Nota de venta</h2>
            <p className="text-sm text-slate-500">{folio}</p>
          </div>

          <div className="flex gap-2">
              <button
              onClick={handleWhatsAppSale}
              disabled={!sale.phone || sharing}
              className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Enviar venta por WhatsApp"
            >
              <MessageCircle size={20} />
            </button>

             <SendPaymentInfoButton phone={sale.phone} folio={sale.folio} />

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
              title={`Nota de venta ${folio}`}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}