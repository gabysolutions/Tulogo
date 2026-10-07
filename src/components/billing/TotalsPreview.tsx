import { calcTotals, formatMoney, round2 } from "../../utils/invoiceUtils";

type Props = { subtotal: number; remaining: number };

export function TotalsPreview({ subtotal, remaining }: Props) {
  const t = calcTotals(subtotal);
  const after = round2(remaining - t.subtotal);
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatMoney(t.subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>IVA 16%</span>
          <span className="tabular-nums">{formatMoney(t.iva)}</span>
        </div>
        <div className="flex justify-between border-t border-blue-100 pt-1.5 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(t.total)}</span>
        </div>
      </div>
      <p className={`mt-3 text-xs ${after < 0 ? "font-medium text-red-600" : "text-slate-500"}`}>
        Quedará pendiente por facturar: <span className="font-semibold tabular-nums">{formatMoney(after)}</span>
      </p>
      <p className="mt-1 text-[11px] text-slate-400">Vista previa. El cálculo oficial lo hace el servidor.</p>
    </div>
  );
}
