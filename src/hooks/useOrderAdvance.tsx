import { useState } from "react";
import Swal from "sweetalert2";
import { getStage } from "../types/order";
import DeliveryAddressModal from "../components/orders/DeliveryAddressModal";

interface AdvanceTarget {
  id: number;
  status: number;
  sending: number;
  clientId: number | null;
  deliveryAddressId?: number | null;
}

export function useOrderAdvance<T extends AdvanceTarget>(
  advanceFn: (order: T) => Promise<void>
) {
  const [pending, setPending] = useState<T | null>(null);

  async function run(order: T) {
    const nextStage = getStage(order.status + 1);
    try {
      await advanceFn(order);
      Swal.fire({
        title: "Etapa actualizada",
        text: `Ahora en: ${nextStage.label}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        title: "No se pudo avanzar",
        text: err?.message ?? "Ocurrió un error al avanzar la etapa.",
        icon: "error",
      });
    }
  }

  async function requestAdvance(order: T) {
    // Empaque con envío: primero se elige la dirección
    if (order.status === 9 && order.sending === 1) {
      if (order.clientId == null) {
        Swal.fire({
          title: "Sin cliente",
          text: "Esta orden no tiene un cliente asignado, así que no se puede elegir una dirección de envío.",
          icon: "warning",
        });
        return;
      }
      setPending(order);
      return;
    }

    const currentStage = getStage(order.status);
    const nextStage = getStage(order.status + 1);

    const result = await Swal.fire({
      title: "¿Avanzar etapa?",
      html: `Pasarás de <b>${currentStage.label}</b> a <b>${nextStage.label}</b>.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, avanzar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;
    await run(order);
  }

  const addressModal =
    pending && pending.clientId != null ? (
      <DeliveryAddressModal
        open
        orderId={pending.id}
        clientId={pending.clientId}
        currentAddressId={pending.deliveryAddressId}
        onClose={() => setPending(null)}
        onSaved={async () => {
          const order = pending;
          setPending(null);
          await run(order);
        }}
      />
    ) : null;

  return { requestAdvance, addressModal };
}