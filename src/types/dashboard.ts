export type DashboardIcon =
  | "package"
  | "fileText"
  | "clock"
  | "truck"
  | "wallet"
  | "badgeDollar";

export interface DashboardStat {
  id: number;
  title: string;
  value: number | string;
  variation: number;
  variationType: "increase" | "decrease";
  variationLabel: string;
  icon: DashboardIcon;
}

export interface MonthlySales {
  month: string;
  sales: number;
}

export interface WeeklyDeliveries {
  day: string;
  deliveries: number;
}

export interface UpcomingDelivery {
  id: number;
  quotationFolio: string;
  client: string;
  deliveryDate: string;
  priority: "Alta" | "Media" | "Baja";
  status: "Pendiente" | "Producción" | "Listo";
}

export interface ProductionTimelineItem {
  id: number;
  stage: string;
  count: number;
}



export interface DashboardApiActivity {
  id: number;
  orderId: number;
  status: number;
  registration_date: string;
  user: string;
}

export interface DashboardData {
  stats: DashboardStat[];
  monthlySales?: MonthlySales[];
  weeklyDeliveries?: WeeklyDeliveries[];
  upcomingDeliveries?: UpcomingDelivery[];
  productionTimeline: ProductionTimelineItem[];
   recentActivity: RecentActivityItem[];
}

// types/dashboard.ts (agregar esto)

export interface DashboardApiCards {
  pendingQuotes: number;
  pendingAdvance: string;
  currentMonthSales: string;
  activeOrders: number;
  productionOrders: number;
  deliveredOrders: number;
}

export interface DashboardApiTimelineRaw {
  diseño: string;
  personalizado: string;
  impresion: string;
  tela: string;
  sublimacion: string;
  corte: string;
  costura: string;
  planchado: string;
  empaque: string;
  entrega: string;
}

export interface DashboardApiResponse {
  cards: DashboardApiCards;
  timeline: DashboardApiTimelineRaw[];
  recentActivity:DashboardApiActivity[];
}

export type ActivityColor =
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "purple"
  | "yellow"
  | "pink"
  | "cyan"
  | "indigo"
  | "gray";

export interface RecentActivityItem {
  id: number;
  title: string;
  description: string;
  date: string;
  color: ActivityColor;
}