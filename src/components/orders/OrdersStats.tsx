import {
  Package,
  Factory,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { OrderCards } from "../../types/order";

interface OrdersStatsProps {
  cards: OrderCards;
}

export default function OrdersStats({ cards }: OrdersStatsProps) {
  const items = [
    {
      title: "Pedidos",
      value: cards.total,
      subtitle: "Órdenes registradas",
      icon: Package,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "En Producción",
      value: cards.production,
      subtitle: "Pedidos activos",
      icon: Factory,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Urgentes",
      value: cards.priority,
      subtitle: "Prioridad alta",
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-50",
    },
    {
      title: "Entregados",
      value: cards.delivered,
      subtitle: "Producción finalizada",
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-800">{card.value}</h2>
                <p className="mt-1 text-xs text-slate-400">{card.subtitle}</p>
              </div>
              <div className={`rounded-xl p-3 ${card.color}`}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}