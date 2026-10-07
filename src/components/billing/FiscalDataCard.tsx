import { AlertTriangle, Building2 } from "lucide-react";
import type { QuoteBillingClient } from "../../types/invoice";

type Props = { client: QuoteBillingClient | null };

export function FiscalDataCard({ client }: Props) {
  const fields: { label: string; value: string | null | undefined }[] = [
    { label: "RFC", value: client?.rfc },
    { label: "Razón social fiscal", value: client?.fiscalName },
    { label: "Régimen fiscal", value: client?.fiscalRegime },
    { label: "CP fiscal", value: client?.fiscalZipCode },
    { label: "Uso del CFDI", value: client?.cfdiUse },
  ];
  const incomplete = !client || fields.some((f) => !f.value);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-900">{client?.name ?? "Sin cliente"}</h3>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {fields.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="text-xs text-slate-500">{f.label}</dt>
            <dd className={`truncate font-medium ${f.value ? "text-slate-800" : "text-amber-600"}`}>{f.value || "Falta"}</dd>
          </div>
        ))}
      </dl>
      {incomplete && (
        <div className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Completa los datos fiscales en el módulo de Clientes antes de facturar.
        </div>
      )}
    </div>
  );
}
