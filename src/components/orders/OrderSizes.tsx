import type { Order, OrderSize } from "../../types/order";

interface Props {
  order: Order;
}

const SIZE_ORDER: OrderSize[] = [
  "2", "3", "4", "6", "8", "10", "12", "14", "16",
  "XCH", "CH", "M", "G", "XL", "2XL", "3XL", "4XL", "5XL", "6XL",
];

export default function OrderSizes({ order }: Props) {
  const totals = order.details.reduce<Record<string, number>>((acc, d) => {
    acc[d.size] = (acc[d.size] ?? 0) + (d.quantity ?? 1);
    return acc;
  }, {});

  const sizes = SIZE_ORDER.filter((s) => totals[s] > 0);

  if (sizes.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {sizes.map((size) => (
        <div
          key={size}
          className="rounded-xl border border-gray-200 bg-white p-2 text-center"
        >
          <p className="text-xs text-slate-400">{size}</p>
          <p className="font-bold">{totals[size]}</p>
        </div>
      ))}
    </div>
  );
}