import { useState, type ButtonHTMLAttributes } from "react";
import { Plus } from "lucide-react";
import { financeService } from "../../services/finance.service";
import { useFinanceDashboard } from "./../../hooks/useFinanceDashboard";
import { MonthSelector } from "../../components/finances/MonthSelector";
import { SummaryCards } from "../../components/finances/SummaryCards";
import { PaymentsList } from "../../components/finances/PaymentsList";
import { ExpensesList } from "../../components/finances/ExpensesList";
import { TodayMovements } from "../../components/finances/TodayMovements";
import { ExpenseCategoryChart } from "../../components/finances/ExpenseCategoryChart";
import { ExpenseDialog } from "../../components/finances/ExpenseDialog";
import { alertError, alertSuccess, confirmDanger } from "../../utils/alerts";
import "./finance.css";



function Button({
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 ${className}`}
      {...props}
    />
  );
}



export default function FinancePage() {
  const { month, setMonth, data, loading, error, reload } = useFinanceDashboard();
  const [openExpense, setOpenExpense] = useState(false);

  const handleCancel = async (id: number) => {
    const confirmed = await confirmDanger(
      "¿Cancelar este gasto?",
      "El gasto dejará de contar en los totales del mes.",
      "Sí, cancelar",
    );
    if (!confirmed) return;

    try {
      const res = await financeService.cancelExpense(id);
      alertSuccess(res.message, "Gasto cancelado");
      reload();
    } catch {
      alertError("No se pudo cancelar el gasto.");
    }
  };

  return (
    <main className="finance-theme min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Finanzas</h1>
            <p className="mt-1 text-muted-foreground">
              Control de ingresos, gastos y utilidad del negocio.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MonthSelector value={month} onChange={setMonth} />
            <Button onClick={() => setOpenExpense(true)}>
              <Plus /> Registrar gasto
            </Button>
          </div>
        </header>

        {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {error && <p className="text-sm text-danger">{error}</p>}

        {data && !loading && (
          <>
            <SummaryCards
              utility={data.utility}
              payments={data.paymentAmount}
              expenses={data.expenseAmount}
              month={month}
            />

            <section className="grid gap-4 xl:grid-cols-2">
              <PaymentsList payments={data.payments} total={data.paymentAmount} />
              <ExpensesList
                expenses={data.expenses}
                total={data.expenseAmount}
                onCancel={handleCancel}
                onAdd={() => setOpenExpense(true)}
              />
            </section>

            <TodayMovements currentDay={data.currentDay} />

            <ExpenseCategoryChart monthlyExpenses={data.monthlyExpenses} />
          </>
        )}
      </div>

      <ExpenseDialog open={openExpense} onOpenChange={setOpenExpense} onCreated={reload} />
    </main>
  );
}