import { useState } from "react";
import { Eye, Pencil, HandCoins, FileText, Trash } from "lucide-react";
import type { Sale } from "../../types/sale";
import { SaleStatusBadge, formatMoney } from "../sale/SaleUi";
import SaleNotePreviewModal from "../sale/SaleNotePreviewModal";

interface Props {
  sales: Sale[];
  onPreview: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
  onPay: (sale: Sale) => void;
    onCancel: (sale: Sale) => void;
}

const actionBtn =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition";

export default function SaleTable({ sales, onPreview, onEdit, onPay, onCancel  }: Props) {
   const [noteSale, setNoteSale] = useState<Sale | null>(null);
  return (
     <>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 text-left">Folio</th>
              <th className="px-6 py-4 text-left">Cliente</th>
              <th className="px-6 py-4 text-left">Fecha</th>
              <th className="px-6 py-4 text-center">Total</th>
              <th className="px-6 py-4 text-center">Anticipo</th>
              <th className="px-6 py-4 text-center">Saldo</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => {
              const isPending = sale.status === 1;
              const canPay = isPending && sale.balanceDue > 0;
              const hasPayments = sale.advance > 0;  
              
              return (
                <tr
                  key={sale.id}
                  className="border-t border-slate-100 transition-colors duration-200 hover:bg-blue-50/40"
                >
                  <td className="px-6 py-5">
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      V-{String(sale.id).padStart(4, "0")}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-800">{sale.clientName}</p>
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-medium text-slate-700">{sale.registrationDate}</p>
                    <p className="mt-1 text-xs text-slate-400">Entrega: {sale.deliveryDate}</p>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className="text-base font-bold text-slate-800">{formatMoney(sale.total)}</span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className="font-semibold text-emerald-600">{formatMoney(sale.advance)}</span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className={`font-semibold ${sale.balanceDue > 0 ? "text-red-600" : "text-slate-400"}`}>
                      {formatMoney(sale.balanceDue)}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <SaleStatusBadge status={sale.status} />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onPreview(sale)}
                        title="Ver"
                        className={`${actionBtn} hover:bg-blue-100 hover:text-blue-700`}
                      >
                        <Eye size={18} />
                      </button>

                      {isPending && (
                        <button
                          onClick={() => onEdit(sale)}
                          title="Editar"
                          className={`${actionBtn} hover:bg-amber-100 hover:text-amber-700`}
                        >
                          <Pencil size={18} />
                        </button>
                      )}

                      {canPay && (
                        <button
                          onClick={() => onPay(sale)}
                          title="Registrar abono"
                          className={`${actionBtn} hover:bg-emerald-100 hover:text-emerald-700`}
                        >
                          <HandCoins size={18} />
                        </button>
                      )}

                     <button
                          onClick={() => setNoteSale(sale)}
                          title="Nota de venta (PDF)"
                          className={`${actionBtn} hover:bg-violet-100 hover:text-violet-700`}
                        >
                          <FileText size={18} />
                        </button>
                        
                       {isPending && (
                            <button
                              onClick={() => onCancel(sale)}
                              disabled={hasPayments}
                              title={hasPayments ? "Cancela los abonos primero" : "Cancelar venta"}
                              className={`${actionBtn} ${
                                hasPayments
                                  ? "cursor-not-allowed opacity-40"
                                  : "hover:bg-red-100 hover:text-red-700"
                              }`}
                            >
                              <Trash size={18} />
                            </button>
                          )}

                    </div>
                  </td>
                </tr>
              );
            })}

            {sales.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No se encontraron ventas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

       <SaleNotePreviewModal sale={noteSale} onClose={() => setNoteSale(null)} />
    </>

  );
}