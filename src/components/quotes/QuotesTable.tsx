import { Eye, Pencil, HandCoins, Trash2, CheckCheck, PackagePlus  } from "lucide-react";

import { QuoteStatus, type Quote } from "../../types/quote";

import QuoteStatusBadge from "./QuoteStatusBadge";
import QuotePriorityBadge from "./QuotePriorityBagde";

interface Props {
  quotes: Quote[];
  onPreview: (quote: Quote) => void;
  onEdit: (quote: Quote) => void;
  onPay: (quote: Quote) => void;
   onAccept: (quote: Quote) => void;
   onAddArticles: (quote: Quote) => void;
  onDelete: (quote: Quote) => void;
}

export default function QuoteTable({ quotes, onPreview, onEdit, onPay, onDelete,onAccept, onAddArticles }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 text-left">Folio</th>
              <th className="px-6 py-4 text-left">Cliente</th>
              <th className="px-6 py-4 text-left">Fecha</th>
              <th className="px-6 py-4 text-left">Productos</th>
              <th className="px-6 py-4 text-center">Piezas</th>
              <th className="px-6 py-4 text-center">Total</th>
              <th className="px-6 py-4 text-center">Anticipo</th>
              <th className="px-6 py-4 text-center">Prioridad</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {quotes.map((quote) => {
              const totalPieces = quote.details.reduce(
                (acc, item) => acc + item.amount,
                0
              );

              const productNames = quote.details.map((d) => d.description);

                
              const canAccept =
              quote.status === QuoteStatus.PENDIENTE && quote.advance === 0;
              
              const canPay =
                quote.balanceDue > 0 && quote.status !== QuoteStatus.CANCELADA;

              return (
                <tr
                  key={quote.id}
                  className="border-t border-slate-100 transition-colors duration-200 hover:bg-blue-50/40"
                >
                  <td className="px-6 py-5">
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {quote.folio}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-800">
                      {quote.clientName}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <div>
                      <p className="font-medium text-slate-700">
                        {quote.registrationDate}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Entrega: {quote.deliveryDate}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      {productNames.slice(0, 2).map((name, i) => (
                        <p key={i} className="text-sm text-slate-700">
                          • {name}
                        </p>
                      ))}

                      {productNames.length > 2 && (
                        <span className="text-xs text-blue-600">
                          +{productNames.length - 2} más
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <div className="font-semibold text-slate-800">
                      {totalPieces}
                    </div>
                    <div className="text-xs text-slate-400">piezas</div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className="text-base font-bold text-slate-800">
                      ${quote.total.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className="font-semibold text-emerald-600">
                      ${quote.advance.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <QuotePriorityBadge priority={quote.priority} />
                  </td>

                  <td className="px-6 py-5 text-center">
                    <QuoteStatusBadge status={quote.status} />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onPreview(quote)}
                        title="Ver"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-blue-100 hover:text-blue-700"
                      >
                        <Eye size={18} />
                      </button>

                      
                        <button
                          onClick={() => onEdit(quote)}
                          title="Editar"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-amber-100 hover:text-amber-700"
                        >
                          <Pencil size={18} />
                        </button>
                        
                       {quote.status === QuoteStatus.ACEPTADA && (
                            <button
                              onClick={() => onAddArticles(quote)}
                              title="Agregar artículos"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-violet-100 hover:text-violet-700"
                            >
                              <PackagePlus size={18} />
                            </button>
                          )}


                       {canAccept && (

                            <button
                              onClick={() => onAccept(quote)}
                              title="Aceptar cotización"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-green-100 hover:text-green-700"
                            >
                              <CheckCheck  size={18} />
                            </button>
                          )}

                      {canPay && (
                        <button
                          onClick={() => onPay(quote)}
                          title="Registrar abono"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-emerald-100 hover:text-emerald-700"
                        >
                          <HandCoins size={18} />
                        </button>
                      )}

                      {quote.status === QuoteStatus.PENDIENTE && (
                        <button
                          onClick={() => onDelete(quote)}
                          title="Eliminar"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {quotes.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  No se encontraron cotizaciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}