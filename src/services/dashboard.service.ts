
import { http } from "./http";
import type {
  DashboardApiActivity,
  DashboardApiResponse,
  DashboardData,
  DashboardStat,
  ProductionTimelineItem,
ActivityColor,
  RecentActivityItem,
} from "../types/dashboard";
import { STAGES } from "../types/order";


const STAGE_COLORS: Record<number, ActivityColor> = {
  1: "gray",     // Configuración
  2: "indigo",   // Moldes
  3: "cyan",     // Impresión
  4: "pink",     // Tela
  5: "purple",   // Sublimación
  6: "orange",   // Corte
  7: "yellow",   // Costura
  8: "blue",     // Planchado
  9: "red",      // Empaque
  10: "green",   // Entrega
};


const STAGE_LABELS: Record<keyof DashboardApiResponse["timeline"][0], string> = {
  configuracion: "Configuración",
  moldes: "Moldes",
  impresion: "Impresión",
  tela: "Tela",
  sublimacion: "Sublimación",
  corte: "Corte",
  costura: "Costura",
  planchado: "Planchado",
  empaque: "Empaque",
  entrega: "Entrega",
};





const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const mapActivity = (items: DashboardApiActivity[]): RecentActivityItem[] =>
  items.map((item) => {
    const stage =
      STAGES.find((s) => s.id === item.status)?.label ?? `Estatus ${item.status}`;
    const user = item.user.replace(/\s*\.$/, "").trim();

    return {
      id: item.id,
      title: `Orden #${item.orderId}`,
      description: `Pasó a ${stage} · ${user}`,
      date: formatDate(item.registration_date),
      color: STAGE_COLORS[item.status] ?? "gray",
    };
  });

const mapStats = (cards: DashboardApiResponse["cards"]): DashboardStat[] => [
  {
    id: 1,
    title: "Cotizaciones pendientes",
    value: cards.pendingQuotes,
    variation: 0,
    variationType: "increase",
    variationLabel: "",
    icon: "fileText",
  },
  {
    id: 2,
    title: "Anticipo pendiente",
    value: Number(cards.pendingAdvance),
    variation: 0,
    variationType: "increase",
    variationLabel: "",
    icon: "wallet",
  },
  {
    id: 3,
    title: "Ventas del mes",
    value: Number(cards.currentMonthSales),
    variation: 0,
    variationType: "increase",
    variationLabel: "",
    icon: "badgeDollar",
  },
  {
    id: 4,
    title: "Órdenes activas",
    value: cards.activeOrders,
    variation: 0,
    variationType: "increase",
    variationLabel: "",
    icon: "package",
  },
  {
    id: 5,
    title: "En producción",
    value: cards.productionOrders,
    variation: 0,
    variationType: "increase",
    variationLabel: "",
    icon: "clock",
  },
  {
    id: 6,
    title: "Entregadas",
    value: cards.deliveredOrders,
    variation: 0,
    variationType: "increase",
    variationLabel: "",
    icon: "truck",
  },
];

const mapTimeline = (
  raw: DashboardApiResponse["timeline"][0]
): ProductionTimelineItem[] =>
  (Object.keys(STAGE_LABELS) as Array<keyof typeof STAGE_LABELS>).map(
    (key, index) => ({
      id: index + 1,
      stage: STAGE_LABELS[key],
      count: Number(raw[key]),
    })
  );

export const getDashboardService = async (): Promise<DashboardData> => {
  const { data } = await http.get<DashboardApiResponse>("/dashboard/admin");

return {
  stats: mapStats(data.cards),
  productionTimeline: mapTimeline(data.timeline[0]),
  recentActivity: mapActivity(data.recentActivity),
};
};