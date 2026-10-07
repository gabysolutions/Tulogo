import { Loader2 } from "lucide-react";
import type { BillingState, InvoiceStatus } from "../../types/invoice";
import { BILLING_STATE_META, INVOICE_STATUS_META } from "../../utils/invoiceUtils";

type Props = { state: BillingState; status?: never } | { status: InvoiceStatus; state?: never };

export function BillingStatusBadge(props: Props) {
  const meta = props.status ? INVOICE_STATUS_META[props.status] : BILLING_STATE_META[props.state as BillingState];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.className}`}
    >
      {props.status === "pending" && <Loader2 className="h-3 w-3 animate-spin" />}
      {meta.label}
    </span>
  );
}
