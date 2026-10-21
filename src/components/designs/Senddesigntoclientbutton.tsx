import { MessageCircle } from "lucide-react";

interface SendDesignToClientButtonProps {

  clientName: string;
  
  clientPhone: string;

  designUrl?: string | null;
}

function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const EMOJI = {
  wave: String.fromCodePoint(0x1f44b),     // 👋
  palette: String.fromCodePoint(0x1f3a8),  // 🎨
  sparkles: String.fromCodePoint(0x2728),  // ✨
  smile: String.fromCodePoint(0x1f60a),    // 😊
  raisedHands: String.fromCodePoint(0x1f64c), // 🙌
};

function buildWhatsappUrl(phone: string, clientName: string, designUrl: string): string {
  const digits = phone.replace(/\D/g, "");
  const number = digits.length === 10 ? `52${digits}` : digits; 

  const text =
    `¡Hola ${clientName}! ${EMOJI.wave}\n\n` +
    `Te comparto el diseño de tu pedido ${EMOJI.palette}${EMOJI.sparkles}\n\n` +
    `${designUrl}\n\n` +
    `Quedo atento a tus comentarios ${EMOJI.smile}${EMOJI.raisedHands}`;

  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(text)}`;
}

export function SendDesignToClientButton({
  clientName,
  clientPhone,
  designUrl,
}: SendDesignToClientButtonProps) {
  if (!designUrl || !clientPhone?.trim()) return null;

  const prettyName = toTitleCase(clientName);

  const handleClick = () => {
    const url = buildWhatsappUrl(clientPhone, prettyName, designUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Enviar el diseño a ${prettyName} por WhatsApp`}
      className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
    >
      <MessageCircle size={16} /> Enviar al cliente
    </button>
  );
}