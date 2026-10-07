import { Plus } from "lucide-react";

interface Props {
  onNewQuote: () => void;
  
}

export default function QuoteHeader({
  onNewQuote,
 
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Cotizaciones
        </h1>

        <p className="text-sm text-slate-500">
          Gestiona cotizaciones, anticipos y pedidos.
        </p>
      </div>

      <div className="flex gap-2">
        

        <button
          onClick={onNewQuote}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Nueva cotización
        </button>
      </div>
    </div>
  );
}