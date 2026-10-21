
import { CreditCard } from "lucide-react";

import { EMOJI, openWhatsApp } from "../../lib/whatsapp";


const PAYMENT_INFO = {
  clabe: "002744701301102053",
  card: "5204 1604 1857 0284",
  bank: "CITIBANAMEX",
};

interface SendPaymentInfoButtonProps {
  phone?: string;
  folio: string;
}

export function SendPaymentInfoButton({ phone, folio }: SendPaymentInfoButtonProps) {
  const handleClick = () => {
    const message = [
      `${EMOJI.card} *Te comparto los datos de pago:*`,
      ``,
      `${EMOJI.bank} *Banco:* ${PAYMENT_INFO.bank}`,
      `${EMOJI.number} *CLABE interbancaria:* ${PAYMENT_INFO.clabe}`,
      `${EMOJI.card} *Tarjeta:* ${PAYMENT_INFO.card}`,
      ``,
      `${EMOJI.check} Una vez realizado el pago, envíanos tu comprobante por este medio para confirmar tu pedido ${folio}.`,
    ].join("\n");

    openWhatsApp(phone, message);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!phone}
      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-transparent"
      title="Enviar datos de pago por WhatsApp"
    >
      <CreditCard size={20} />
    </button>
  );
}