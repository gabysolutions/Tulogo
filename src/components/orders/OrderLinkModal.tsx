import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, MessageCircle, X } from "lucide-react";
import Swal from "sweetalert2";

interface Props {
  open: boolean;
  link: string | null;
  phone?: string | null;
  onClose: () => void;
}


function buildWhatsAppUrl(link: string, phone?: string | null) {
  const text = encodeURIComponent(
    `👋 ¡Hola! 😎✨

📦 Para registrar las piezas de tu pedido, ingresa al siguiente enlace 👇🔗

${link}

⏳ Importante: El enlace estará disponible únicamente durante 24 horas. ¡No olvides completar tu registro a tiempo! ✅🙌`,
  );
  let digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) digits = `52${digits}`; 

  const base = "https://api.whatsapp.com/send";
  return digits ? `${base}?phone=${digits}&text=${text}` : `${base}?text=${text}`;
}

export function OrderLinkModal({ open, link, phone, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!open || !link) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link!);
      setCopied(true);
    } catch {
      inputRef.current?.select();
      Swal.fire({
        title: "No se pudo copiar",
        text: "Selecciona el link y cópialo manualmente.",
        icon: "info",
      });
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Link para el cliente</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Compártelo para que capture las piezas. Vence en 24 horas.
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <input
          ref={inputRef}
          readOnly
          value={link}
          onFocus={(e) => e.target.select()}
          className="w-full rounded-lg border border-gray-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            {copied ? "Copiado" : "Copiar link"}
          </button>
          <a
            href={buildWhatsAppUrl(link, phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}