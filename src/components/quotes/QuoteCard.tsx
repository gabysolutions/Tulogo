import type {
  Quote,
} from "../../types/quote";

interface Props {
  quote: Quote;
}

export default function QuoteCard({
  quote,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="font-semibold">
        {quote.folio}
      </h3>

      <p className="text-sm text-slate-500">
        {quote.clientName}
      </p>

      <div className="mt-4 flex justify-between">
        <span>Total</span>

        <span className="font-bold">
          $
          {quote.total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}