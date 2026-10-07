import type { CancelInvoicePayload, CancelInvoiceResult, CancelMotive, Invoice } from "../../types/invoice";
import { CANCEL_MOTIVES } from "../../types/invoice";
import { toApiError } from "../../utils/invoiceUtils";
import { escapeHtml, getSwal, showApiError, toast } from "../../utils/swal";

/** Abre el diálogo de cancelación. Devuelve el payload o null si el usuario desiste. */
export async function openCancelInvoiceDialog(invoice: Invoice): Promise<CancelInvoicePayload | null> {
  const Swal = await getSwal();
  const options = CANCEL_MOTIVES.map(
    (m) => `<option value="${m.value}" ${m.value === "02" ? "selected" : ""}>${m.value} · ${escapeHtml(m.label)}</option>`,
  ).join("");
  const res = await Swal.fire<CancelInvoicePayload>({
    title: `Cancelar factura ${invoice.folio ?? ""}`,
    icon: "warning",
    html: `
      <div style="text-align:left;font-size:14px">
        <label style="font-weight:600;display:block;margin-bottom:4px">Motivo</label>
        <select id="cancel-motive" class="swal2-select" style="width:100%;margin:0;font-size:14px">${options}</select>
        <div id="cancel-uuid-wrap" style="display:none;margin-top:12px">
          <label style="font-weight:600;display:block;margin-bottom:4px">UUID de la factura que la sustituye</label>
          <input id="cancel-uuid" class="swal2-input" style="width:100%;margin:0;font-size:14px" placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" />
        </div>
        <p style="margin-top:14px;color:#b45309">Esta acción no se puede deshacer y libera el monto para volver a facturarlo.</p>
      </div>`,
    showCancelButton: true,
    confirmButtonText: "Cancelar factura",
    cancelButtonText: "Volver",
    confirmButtonColor: "#dc2626",
    focusCancel: true,
    didOpen: () => {
      const sel = document.getElementById("cancel-motive") as HTMLSelectElement | null;
      const wrap = document.getElementById("cancel-uuid-wrap");
      sel?.addEventListener("change", () => {
        if (wrap) wrap.style.display = sel.value === "01" ? "block" : "none";
      });
    },
    preConfirm: () => {
      const motive = (document.getElementById("cancel-motive") as HTMLSelectElement).value as CancelMotive;
      const uuid = (document.getElementById("cancel-uuid") as HTMLInputElement).value.trim();
      if (motive === "01" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
        Swal.showValidationMessage("Captura un UUID válido de la factura que la sustituye");
        return false;
      }
      return motive === "01" ? { motive, uuidReplacement: uuid } : { motive };
    },
  });
  return res.isConfirmed && res.value ? res.value : null;
}

/** Flujo completo: diálogo → llamada → resultado. Devuelve true si hubo cambio. */
export async function runCancelInvoiceFlow(
  invoice: Invoice,
  cancel: (id: number, payload: CancelInvoicePayload) => Promise<CancelInvoiceResult>,
): Promise<boolean> {
  const payload = await openCancelInvoiceDialog(invoice);
  if (!payload) return false;
  const Swal = await getSwal();
  Swal.fire({ title: "Cancelando…", allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() });
  try {
    const res = await cancel(invoice.id, payload);
    Swal.close();
    if (res.status === "canceled") {
      await toast("success", res.message || "Factura cancelada");
    } else {
      await Swal.fire({
        icon: "info",
        title: "Cancelación pendiente",
        text: "El receptor debe aceptar la cancelación. El estatus se actualizará cuando responda.",
        confirmButtonColor: "#2563eb",
      });
    }
    return true;
  } catch (e) {
    Swal.close();
    await showApiError(toApiError(e), "No se pudo cancelar");
    return false;
  }
}
