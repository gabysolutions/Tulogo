import {
  QuoteStatus,
} from "../../types/quote";

interface Props {
  status: QuoteStatus;
}

export default function QuoteStatusBadge({
  status,
}: Props) {
  if (status === QuoteStatus.ACEPTADA) {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
        Aceptada
      </span>
    );
  }

  if (status === QuoteStatus.CANCELADA) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
        Cancelada
      </span>
    );
  }

  if (status === QuoteStatus.LIQUIDADA) {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
        Liquidada
      </span>
    );
  }

  return (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
      Pendiente
    </span>
  );
}