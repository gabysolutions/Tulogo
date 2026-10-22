export interface OrderStage {
  id: number;
  label: string;
}

export const STAGES: OrderStage[] = [
  { id: 1, label: "Configuración" },
  { id: 2, label: "Personalizado" },
  { id: 3, label: "Impresión" },
  { id: 4, label: "Tela" },
  { id: 5, label: "Sublimación" },
  { id: 6, label: "Corte" },
  { id: 7, label: "Costura" },
  { id: 8, label: "Planchado" },
  { id: 9, label: "Empaque" },
  { id: 10, label: "Entrega" },
];

export const CONFIG_STAGE_ID = 1;

export function getStage(status: number): OrderStage {
  return STAGES.find((s) => s.id === status) ?? STAGES[0];
}

export type Priority = "baja" | "media" | "alta";

export const PRIORITY_META: Record<
  Priority,
  {
    label: string;
    classes: string;
    card: string;
    bar: string;
    dot: string;
    badge: string;
  }
> = {
  alta: {
    label: "Alta",
    classes: "bg-red-50 text-red-700 border-red-200",
    card: "border-red-200 bg-red-50/60 hover:bg-red-50",
    bar: "bg-red-500",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  media: {
    label: "Media",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    card: "border-amber-200 bg-amber-50/60 hover:bg-amber-50",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  baja: {
    label: "Baja",
    classes: "bg-slate-100 text-slate-600 border-slate-200",
    card: "border-slate-200 bg-slate-50/60 hover:bg-slate-50",
    bar: "bg-green-400",
    dot: "bg-green-400",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export type OrderSize = "2" | "3" | "4" | "6" | "8" | "10" | "12" | "14" | "16" | "XCH" | "CH" | "M"| "G"| "XL"| "2XL"| "3XL"| "4XL"| "5XL"| "6XL";
export type OrderGender = "M" | "F";


export interface OrderArticleDTO {
  articleId: number;
  article: string;
  category: string;
  fabric_type: string;
  design_img: string;
  amount: number;
}

export interface OrderArticle {
  articleId: number;
  article: string;
  category: string;
  fabricType: string;
  designImg: string;
  amount: number;
}

export interface OrderListItemDTO {
  id: number;
  designId: number;
  client: string;
  phone: string | null;
  designer: string;
  
  number_pieces: number;
  pieces_registered: number;
  delivery_date: string;
  priority: Priority;
  status: number;
  quoteId: number;
 clientId: number | null;
  sending: number;
  address: number | null;
}

export interface OrderCardsDTO {
  total: string;
  production: string;
  delivered: string;
  todays_deliveries: string;
  priority: string;
}

export interface OrdersPagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetOrdersResponseDTO {
  orders: OrderListItemDTO[];
  cards: OrderCardsDTO[];
  pagination: OrdersPagination;
}

export interface OrderDetailItemDTO {
  id: number;
  articleId: number;
  article: string;
  category: string;
  nickname: string;
  number: string | null;
  size: OrderSize;
  gender: OrderGender;
  observation: string | null;
}

export interface OrderImageDTO {
  img: string | null;
}

export interface OrderByIdDTO {
  id: number;
  designId: number;
  clientId?: number;
  client: string;
  phone: string | null;
  designer: string;
  number_pieces: number;
  pieces_registered: number;
  delivery_date: string;
  advance_date: string | null;
  priority: Priority;
  status: number;
  quoteId: number;
  address: number | null;
  activity?: OrderMovementDTO[];
  details: OrderDetailItemDTO[];
  imgs?: (string | OrderImageDTO| null)[];
  sizeDetail?: unknown[];
  articles?: OrderArticleDTO[];
  submittedDetails?: SubmittedOrderDetailDTO[];
  sending:number;
}

export interface OrderMovementDTO {
  id: number;
  orderId: number;
  status: number;
  registration_date: string;
  user: string;
}



export interface OrderListItem {
  id: number;
  designId: number;
  client: string;
  phone: string | null;
  designer: string;
  numberPieces: number;
  piecesRegistered: number;
  deliveryDate: string;
  priority: Priority;
  status: number;
  quoteId: number;
  clientId: number | null;
  sending: number;
  address: number | null;
}

export interface OrderCards {
  total: number;
  production: number;
  delivered: number;
  todaysDeliveries: number;
  priority: number;
}

export interface OrderDetailItem {
  id: number;
  articleId: number;
  article: string;
  category: string;
  nickname: string;
  number: string | null;
  size: OrderSize;
  gender: OrderGender;
  observation: string | null;
}

export interface Order {
  id: number;
  designId: number;
  clientId: number | null;
  client: string;
  phone: string | null;
  designer: string;
  numberPieces: number;
  piecesRegistered: number;
  deliveryDate: string;
  advanceDate: string | null;
  priority: Priority;
  status: number;
  quoteId: number;
  addressId: number | null;
  details: OrderDetailItem[];
  images: string[];
  articles: OrderArticle[];
  activity: OrderMovement[];
  submittedDetails: SubmittedOrderDetail[];
  sending:number;
}

export interface OrderMovement {
  id: number;
  orderId: number;
  status: number;
  registrationDate: string;
  user: string;
}

export function isCompleted(order: Order | OrderListItem): boolean {
  return order.status === STAGES[STAGES.length - 1].id;
}

export interface AddOrderDetailPayload {
  articleId: number;
  nickname: string;
  number?: string;
  size: OrderSize;
  gender: OrderGender;
  observation?: string;
}

export interface UpdateOrderDetailPayload {
  nickname: string;
  number?: string;
  size: OrderSize;
  gender: OrderGender;
}

export interface UpdateOrderStatusPayload {
  status: number;
}

export interface GetOrdersParams {
  status?: number;
  search?: string;
  priority?: Priority;
  page?: number;
}

export interface ProductionOrderImageDTO {
  designId: number;
  img: string| null;
}

export interface ProductionOrderListItemDTO extends OrderListItemDTO {
  detail: ProductionOrderImageDTO[];
}

export interface GetProductionOrdersResponseDTO {
  orders: ProductionOrderListItemDTO[];
  cards: OrderCardsDTO[];
  pagination: OrdersPagination;
}

export type ProductionOrderByIdDTO = Omit<OrderByIdDTO, "imgs" | "articles"> & {
  imgs: OrderImageDTO[];
};

export interface ProductionOrderListItem extends OrderListItem {
  images: string[];
}

export interface GetProductionOrdersParams extends GetOrdersParams {
  clientId?: number;
  designerId?: number;
}

export interface SubmittedOrderDetailDTO {
  id: number;
  linkId: number;
  orderId: number;
  articleId: number;
  nickname: string;
  number: string | null;
  size: OrderSize;
  gender: OrderGender;
  observation: string | null;
}

export interface SubmittedOrderDetail extends SubmittedOrderDetailDTO {
  article: string;   
  category: string;
}