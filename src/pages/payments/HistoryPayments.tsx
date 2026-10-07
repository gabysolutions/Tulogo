import { useState } from "react";
import "../finances/finance.css";
import { paymentService } from "../../services/payment.service";
import { usePayments } from "../../hooks/usePayments";
import { PaymentFilters } from "../../components/payments/PaymentFilters";
import { PaymentsSummary } from "../../components/payments/PaymentsSummary";
import { PaymentsTable } from "../../components/payments/PaymentsTable";
import { PaymentPagination } from "../../components/payments/PaymentPagination";
import { PaymentDetailDialog } from "../../components/payments/PaymentDetailDialog";

export default function HistoryPayments() {
  const { filters, updateFilters, resetFilters, data, loading, error, reload } = usePayments();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const handleCancel = async (id: number) => {
    if (!window.confirm("¿Cancelar este pago?")) return;
    try {
      const res = await paymentService.cancelPayment(id);
      setFeedback({ ok: true, text: res.message });
      setSelectedId(null);
      reload();
    } catch {
      setFeedback({ ok: false, text: "No se pudo cancelar el pago." });
    }
  };

  return (
    <main className="finance-theme min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Pagos</h1>
            <p className="mt-1 text-muted-foreground">
              Consulta, filtra y cancela los pagos y anticipos registrados.
            </p>
          </div>
          {loading && data && <span className="text-sm text-muted-foreground">Actualizando…</span>}
        </header>

        {feedback && (
          <p
            className={`rounded-lg px-4 py-2 text-sm ${
              feedback.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <PaymentFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />

        {error && <p className="text-sm text-danger">{error}</p>}
        {loading && !data && <p className="text-sm text-muted-foreground">Cargando…</p>}

        {data && (
          <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
            <PaymentsSummary payments={data.payments} total={data.pagination.total} />
            <PaymentsTable
              payments={data.payments}
              onView={setSelectedId}
              onCancel={handleCancel}
            />
            <PaymentPagination
              pagination={data.pagination}
              onPageChange={(page) => updateFilters({ page })}
            />
          </div>
        )}
      </div>

      <PaymentDetailDialog
        paymentId={selectedId}
        onClose={() => setSelectedId(null)}
        onCancel={handleCancel}
      />
    </main>
  );
}