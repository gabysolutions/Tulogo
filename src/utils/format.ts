export const money = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);


export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });


export const toMonthParam = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;

export const monthLabel = (param: string) =>
  new Date(`${param}T00:00:00`).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });


export const lastMonths = (n = 12) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) =>
    toMonthParam(new Date(now.getFullYear(), now.getMonth() - i, 1)),
  );
};

export const toDateParam = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// '2026-10-01 13:45' -> '01 oct 2026, 1:45 p.m.'
export const shortDateTime = (value: string) =>
  new Date(value.replace(" ", "T")).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });