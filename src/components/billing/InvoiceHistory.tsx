import { useState } from "react";
import { AlertCircle, Ban, Check, Copy, FileCode2, FileText, Inbox, Loader2, Mail } from "lucide-react";
import type { Invoice } from "../../types/invoice";
import type { BillingActions } from "../../hooks/useBilling";
import { canCancel, formatDate, formatMoney, isValidEmail, shortUuid, toApiError } from "../../utils/invoiceUtils";
import { getSwal, showApiError, toast } from "../../utils/swal";
import { BillingStatusBadge } from "./BillingStatusBadge";
import { runCancelInvoiceFlow } from "./CancelInvoiceDialog";

type Props = {
  invoices: Invoice[];
  actions: BillingActions;
  defaultEmail?: string;
  onChanged: () => void;
};

const iconBtn =
  "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50";

export function InvoiceHistory({ invoices, actions, defaultEmail, onChanged }: Props) {
  const [copied, setCopied] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      await showApiError(toApiError(e));
    } finally {
      setBusy(null);
    }
  };

  const copy = async (inv: Invoice) => {
    if (!inv.uuid) return;
    await navigator.clipboard?.writeText(inv.uuid);
    setCopied(inv.id);
    setTimeout(() => setCopied(null), 1500);
  };

  const sendEmail = async (inv: Invoice) => {
    const Swal = await getSwal();
    const res = await Swal.fire<{ email: string; subject?: string; comments?: string }>({
      title: `Enviar factura ${inv.folio ?? ""}`,
      html: `
        <div style="text-align:left;font-size:14px">
          <label style="font-weight:600">Correo *</label>
          <input id="snd-email" type="email" class="swal2-input" style="width:100%;margin:4px 0 10px" value="${defaultEmail ?? ""}" placeholder="cliente@correo.com" />
          <label style="font-weight:600">Asunto</label>
          <input id="snd-subject" class="swal2-input" style="width:100%;margin:4px 0 10px" placeholder="Factura ${inv.folio ?? ""}" />
          
        </div>`,
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      preConfirm: () => {
        const email = (document.getElementById("snd-email") as HTMLInputElement).value.trim();
        if (!isValidEmail(email)) {
          Swal.showValidationMessage("Captura un correo válido");
          return false;
        }
        const subject = (document.getElementById("snd-subject") as HTMLInputElement).value.trim() || undefined;
        const comments = (document.getElementById("snd-comments") as HTMLTextAreaElement).value.trim() || undefined;
        return { email, subject, comments };
      },
    });
    if (!res.isConfirmed || !res.value) return;
    const payload = res.value;
    await run(`send-${inv.id}`, async () => {
      const r = await actions.send(inv.id, payload);
      await toast("success", r.message);
    });
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 py-10 text-center">
        <Inbox className="h-10 w-10 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">Aún no hay facturas para esta cotización.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {invoices.map((inv) => {
        const canceled = inv.status === "canceled";
        const hasFiles = inv.status === "active" || inv.status === "canceled" || inv.status === "cancel_pending";
        return (
          <li key={inv.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BillingStatusBadge status={inv.status} />
                <span className="text-sm font-semibold text-slate-900">{inv.folio ? `Folio ${inv.folio}` : "Sin folio"}</span>
              </div>
              <span className="text-xs text-slate-500">{formatDate(inv.registrationDate)}</span>
            </div>

            {inv.uuid && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-mono">{shortUuid(inv.uuid)}</span>
                <button onClick={() => copy(inv)} className="rounded p-1 hover:bg-slate-100" aria-label="Copiar UUID">
                  {copied === inv.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            <div className={`mt-2 grid grid-cols-3 gap-2 text-xs ${canceled ? "text-slate-400 line-through" : "text-slate-600"}`}>
              <div>
                Subtotal <p className="font-medium tabular-nums">{formatMoney(inv.subtotal)}</p>
              </div>
              <div>
                IVA <p className="font-medium tabular-nums">{formatMoney(inv.iva)}</p>
              </div>
              <div>
                Total <p className={`font-semibold tabular-nums ${canceled ? "" : "text-slate-900"}`}>{formatMoney(inv.total)}</p>
              </div>
            </div>

            {inv.status === "pending" && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Timbrando…
              </p>
            )}
            {inv.status === "cancel_pending" && (
              <p className="mt-3 text-xs text-orange-700">Cancelación pendiente de aceptación</p>
            )}
            {inv.status === "failed" && (
              <p className="mt-3 flex gap-1.5 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 ring-1 ring-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" /> {inv.errorMessage ?? "El proveedor rechazó la factura."}
              </p>
            )}
            {canceled && inv.canceledDate && <p className="mt-2 text-xs text-slate-500">Cancelada el {formatDate(inv.canceledDate)}</p>}

            {hasFiles && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button className={iconBtn} disabled={!!busy} onClick={() => run(`pdf-${inv.id}`, () => actions.downloadPdf(inv.id))}>
                  {busy === `pdf-${inv.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} PDF
                </button>
                <button className={iconBtn} disabled={!!busy} onClick={() => run(`xml-${inv.id}`, () => actions.downloadXml(inv.id, inv.folio))}>
                  {busy === `xml-${inv.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCode2 className="h-3.5 w-3.5" />} XML
                </button>
                {inv.status === "active" && (
                  <button className={iconBtn} disabled={!!busy} onClick={() => sendEmail(inv)}>
                    {busy === `send-${inv.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />} Enviar
                  </button>
                )}
                {canCancel(inv) && (
                  <button
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    disabled={!!busy}
                    onClick={async () => {
                      if (await runCancelInvoiceFlow(inv, actions.cancel)) onChanged();
                    }}
                  >
                    <Ban className="h-3.5 w-3.5" /> Cancelar
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
