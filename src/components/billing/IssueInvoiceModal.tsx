import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import type { Invoice, InvoiceMode, IssueInvoicePayload, QuoteBillingSummary } from "../../types/invoice";
import { useCfdiUses } from "../../hooks/useBilling";
import { calcTotals, formatMoney, INVOICE_MODE_LABEL, round2, toApiError } from "../../utils/invoiceUtils";
import { getSwal, showApiError, toast } from "../../utils/swal";
import { TotalsPreview } from "./TotalsPreview";

type Props = {
  summary: QuoteBillingSummary;
  onClose: () => void;
  onIssue: (quoteId: number, payload: IssueInvoicePayload) => Promise<Invoice>;
  onIssued: () => void;
};

const MODES: InvoiceMode[] = ["full", "items", "amount"];

export function IssueInvoiceModal({ summary, onClose, onIssue, onIssued }: Props) {
  const cfdiUses = useCfdiUses();
  const [mode, setMode] = useState<InvoiceMode>("full");
  const [selected, setSelected] = useState<Record<number, { checked: boolean; qty: string }>>(() =>
    Object.fromEntries(summary.lines.map((l) => [l.detailId, { checked: false, qty: String(l.remainingQuantity) }])),
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Anticipo de uniformes");
  const [cfdiUse, setCfdiUse] = useState(summary.client?.cfdiUse || "G03");
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const missing = useMemo(() => {
    const c = summary.client;
    const m: string[] = [];
    if (!c?.rfc) m.push("RFC");
    if (!c?.fiscalName) m.push("Razón social");
    if (!c?.fiscalRegime) m.push("Régimen fiscal");
    if (!c?.fiscalZipCode) m.push("CP fiscal");
    return m;
  }, [summary.client]);

  const pendingLines = useMemo(() => summary.lines.filter((l) => l.remainingQuantity > 0), [summary.lines]);

  const itemErrors = useMemo(() => {
    const errs: Record<number, string> = {};
    for (const l of summary.lines) {
      const s = selected[l.detailId];
      if (!s?.checked) continue;
      const q = Number(s.qty);
      if (!Number.isFinite(q) || q <= 0) errs[l.detailId] = "Cantidad inválida";
      else if (q > l.remainingQuantity) errs[l.detailId] = `Máximo ${l.remainingQuantity}`;
    }
    return errs;
  }, [selected, summary.lines]);

  const previewSubtotal = useMemo(() => {
    if (mode === "full") return round2(pendingLines.reduce((s, l) => s + l.remainingQuantity * l.unitPrice, 0));
    if (mode === "items")
      return round2(
        summary.lines.reduce((s, l) => {
          const sel = selected[l.detailId];
          const q = Number(sel?.qty);
          return sel?.checked && q > 0 ? s + q * l.unitPrice : s;
        }, 0),
      );
    return round2(Number(amount) || 0);
  }, [mode, pendingLines, summary.lines, selected, amount]);

  const formError = useMemo(() => {
    if (mode === "full" && pendingLines.length === 0) return "No hay artículos pendientes";
    if (mode === "items") {
      if (!Object.values(selected).some((s) => s.checked)) return "Selecciona al menos un artículo";
      if (Object.keys(itemErrors).length) return "Revisa las cantidades marcadas en rojo";
    }
    if (mode === "amount") {
      const a = Number(amount);
      if (!amount || !Number.isFinite(a) || a <= 0) return "Captura un subtotal mayor a cero";
      if (a > summary.remaining + 0.004) return `El máximo es ${formatMoney(summary.remaining)}`;
      if (!description.trim()) return "Captura la descripción del concepto";
    }
    if (!cfdiUse) return "Selecciona el uso del CFDI";
    return null;
  }, [mode, pendingLines.length, selected, itemErrors, amount, summary.remaining, description, cfdiUse]);

  const buildPayload = (): IssueInvoicePayload => {
    if (mode === "items")
      return {
        mode,
        cfdiUse,
        items: summary.lines
          .filter((l) => selected[l.detailId]?.checked)
          .map((l) => ({ detailId: l.detailId, quantity: Number(selected[l.detailId].qty) })),
      };
    if (mode === "amount") return { mode, cfdiUse, amount: round2(Number(amount)), description: description.trim() };
    return { mode, cfdiUse };
  };

  const handleSubmit = async () => {
    setAttemptedSave(true);
    if (formError) return;
    const Swal = await getSwal();
    const t = calcTotals(previewSubtotal);
    const useName = cfdiUses.find((u) => u.value === cfdiUse)?.name ?? "";
    const ok = await Swal.fire({
      title: "¿Emitir factura?",
      icon: "question",
      html: `<div style="text-align:left;font-size:14px;line-height:1.8">
        <b>Modo:</b> ${INVOICE_MODE_LABEL[mode]}<br/>
        <b>Subtotal:</b> ${formatMoney(t.subtotal)}<br/>
        <b>IVA 16%:</b> ${formatMoney(t.iva)}<br/>
        <b>Total:</b> ${formatMoney(t.total)}<br/>
        <b>Uso del CFDI:</b> ${cfdiUse} ${useName}</div>`,
      showCancelButton: true,
      confirmButtonText: "Emitir",
      cancelButtonText: "Revisar",
      confirmButtonColor: "#2563eb",
    });
    if (!ok.isConfirmed) return;
    setSubmitting(true);
    try {
      const inv = await onIssue(summary.quoteId, buildPayload());
      await toast("success", `Factura ${inv.folio ?? ""} emitida`);
      onIssued();
      onClose();
    } catch (e) {
      await showApiError(toApiError(e), "No se pudo emitir la factura");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (err: boolean) =>
    `w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-4 ${
      err ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
    }`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <div className="relative flex max-h-[92vh] w-full max-w-2xl animate-in fade-in zoom-in-95 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="truncate text-base font-semibold text-slate-900">
            Emitir factura · {summary.folio} · {summary.client?.name ?? ""}
          </h2>
          <button onClick={onClose} disabled={submitting} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {missing.length > 0 && (
            <div className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <div>
                Faltan datos fiscales del cliente: <b>{missing.join(", ")}</b>. Complétalos en Clientes.
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-2 py-2 text-xs font-medium transition sm:text-sm ${
                  mode === m ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {INVOICE_MODE_LABEL[m]}
              </button>
            ))}
          </div>

          {mode === "full" && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Artículo</th>
                    <th className="px-3 py-2 text-right">Pendiente</th>
                    <th className="px-3 py-2 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingLines.map((l) => (
                    <tr key={l.detailId}>
                      <td className="px-3 py-2 text-slate-800">{l.description}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{l.remainingQuantity}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatMoney(l.remainingQuantity * l.unitPrice)}</td>
                    </tr>
                  ))}
                  {pendingLines.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                        Todas las cantidades ya están facturadas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {mode === "items" && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs text-slate-500">
                  <tr>
                    <th className="w-8 px-3 py-2" />
                    <th className="px-3 py-2">Artículo</th>
                    <th className="px-3 py-2 text-right">Pendiente</th>
                    <th className="w-28 px-3 py-2">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.lines.map((l) => {
                    const s = selected[l.detailId];
                    const err = attemptedSave ? itemErrors[l.detailId] : undefined;
                    const disabled = l.remainingQuantity <= 0;
                    return (
                      <tr key={l.detailId} className={disabled ? "opacity-50" : ""}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            disabled={disabled}
                            checked={!!s?.checked}
                            onChange={(e) => setSelected((p) => ({ ...p, [l.detailId]: { ...p[l.detailId], checked: e.target.checked } }))}
                            className="h-4 w-4 accent-blue-600"
                          />
                        </td>
                        <td className="px-3 py-2 text-slate-800">
                          {l.description}
                          <span className="block text-xs text-slate-500">{formatMoney(l.unitPrice)} c/u</span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{l.remainingQuantity}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={1}
                            max={l.remainingQuantity}
                            disabled={disabled || !s?.checked}
                            value={s?.qty ?? ""}
                            onChange={(e) => setSelected((p) => ({ ...p, [l.detailId]: { ...p[l.detailId], qty: e.target.value } }))}
                            className={`${inputCls(!!err)} py-1.5 disabled:bg-slate-50`}
                          />
                          {err && <span className="text-[11px] text-red-600">{err}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {mode === "amount" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Subtotal (antes de IVA)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`mt-1 ${inputCls(attemptedSave && !!formError && mode === "amount" && formError !== "Captura la descripción del concepto")}`}
                />
                <span className="mt-1 block text-xs text-slate-500">Máximo {formatMoney(summary.remaining)}</span>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Descripción del concepto</span>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`mt-1 ${inputCls(attemptedSave && !description.trim())}`}
                />
              </label>
            </div>
          )}

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Uso del CFDI</span>
            <select value={cfdiUse} onChange={(e) => setCfdiUse(e.target.value)} className={`mt-1 bg-white ${inputCls(attemptedSave && !cfdiUse)}`}>
              {cfdiUses.length === 0 && <option value={cfdiUse}>{cfdiUse}</option>}
              {cfdiUses.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.value} · {u.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-amber-700">Si se elige mal hay que cancelar y volver a emitir.</span>
          </label>

          <TotalsPreview subtotal={previewSubtotal} remaining={summary.remaining} />

          {attemptedSave && formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button onClick={onClose} disabled={submitting} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 disabled:opacity-40">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-blue-600 disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Timbrando…" : "Emitir factura"}
          </button>
        </footer>
      </div>
    </div>
  );
}
