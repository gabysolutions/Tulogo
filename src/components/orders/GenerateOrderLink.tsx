import { useState } from "react";
import { Link2 } from "lucide-react";
import Swal from "sweetalert2";
import { useOrderLink } from "../../hooks/useOrderLink";
import { OrderLinkModal } from "./OrderLinkModal";

interface Props {
  orderId: number;
  phone?: string | null;
  disabled?: boolean;
}

export function GenerateOrderLink({ orderId, phone, disabled }: Props) {
  const { link, loading, generate } = useOrderLink(orderId);
  const [open, setOpen] = useState(false);

  async function handleClick() {
   
    if (link) return setOpen(true);

    const result = await generate();
    if ("error" in result) {
      Swal.fire({
        title: "No se pudo generar el link",
        text: result.error,
        icon: "warning",
      });
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        title={disabled ? "Revisa primero las piezas enviadas por el cliente" : undefined}
        className="..."
        >
        <Link2 size={16} />
        {loading ? "Generando..." : link ? "Ver link" : "Generar link"}
      </button>

      <OrderLinkModal open={open} link={link} phone={phone} onClose={() => setOpen(false)} />
    </>
  );
}