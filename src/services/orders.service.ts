import { http } from "./http";
import type {
  GetOrdersResponseDTO,
  OrderListItem,
  OrderListItemDTO,
  OrderCards,
  OrderCardsDTO,
  OrdersPagination,
  GetOrdersParams,
  OrderByIdDTO,
  Order,
  OrderMovementDTO,
  OrderMovement,
  AddOrderDetailPayload,
  UpdateOrderDetailPayload,
  UpdateOrderStatusPayload,
  GetProductionOrdersResponseDTO,
  GetProductionOrdersParams,
  ProductionOrderListItemDTO,
  ProductionOrderListItem,
} from "../types/order";


interface MessageResponse {
  message: string;
}



function mapListItem(dto: OrderListItemDTO): OrderListItem {
  return {
    id: dto.id,
    designId: dto.designId,
    client: dto.client,
    phone: dto.phone ?? null,
    designer: dto.designer,
    numberPieces: dto.number_pieces,
    piecesRegistered: dto.pieces_registered,
    deliveryDate: dto.delivery_date,
    priority: dto.priority,
    status: dto.status,
    quoteId: dto.quoteId,
    clientId: dto.clientId ?? null,
    sending: Number(dto.sending ?? 0),
    address: dto.address ?? null,
    
  };
}

function mapCards(dto: OrderCardsDTO[]): OrderCards {
  const first = dto?.[0];
  return {
    total: Number(first?.total ?? 0),
    production: Number(first?.production ?? 0),
    delivered: Number(first?.delivered ?? 0),
    todaysDeliveries: Number(first?.todays_deliveries ?? 0),
    priority: Number(first?.priority ?? 0),
  };
}

const isImage = (src: unknown): src is string => typeof src === "string" && src.length > 0;

function mapProductionListItem(
  dto: ProductionOrderListItemDTO
): ProductionOrderListItem {
  return {
    ...mapListItem(dto),
    images: (dto.detail ?? []).map((d) => d?.img).filter(isImage),
  };
}
function mapImages(imgs: OrderByIdDTO["imgs"]): string[] {
  return (imgs ?? [])
    .map((i) => (typeof i === "string" ? i : i?.img))
    .filter(isImage);
}




function mapOrder(dto: OrderByIdDTO): Order {
  const articles = (dto.articles ?? []).map((a) => ({
    articleId: a.articleId,
    article: a.article,
    category: a.category,
    fabricType: a.fabric_type,
    designImg: a.design_img,
    amount: a.amount,
  }));
  const articleById = new Map(articles.map((a) => [a.articleId, a]));

  return {
    id: dto.id,
    designId: dto.designId,
    clientId: dto.clientId ?? null,
    client: dto.client,
    phone: dto.phone ?? null,
    designer: dto.designer,
    numberPieces: dto.number_pieces,
    piecesRegistered: dto.pieces_registered,
    deliveryDate: dto.delivery_date,
    advanceDate: dto.advance_date,
    priority: dto.priority,
    status: dto.status,
    quoteId: dto.quoteId,
    addressId: dto.address ?? null,
     sending: Number(dto.sending ?? 0),
    details: (dto.details ?? []).map((d) => ({
      id: d.id,
      articleId: d.articleId,
      article: d.article,
      category: d.category,
      nickname: d.nickname,
      number: d.number,
      size: d.size,
      gender: d.gender,
      observation: d.observation,
    })),
    images: mapImages(dto.imgs),
    articles,
    activity: (dto.activity ?? []).map(mapMovement),
    submittedDetails: (dto.submittedDetails ?? []).map((d) => ({
      id: d.id,
      linkId: d.linkId,
      orderId: d.orderId,
      articleId: d.articleId,
      article: articleById.get(d.articleId)?.article ?? "",
      category: articleById.get(d.articleId)?.category ?? "",
      nickname: d.nickname,
      number: d.number,
      size: d.size,
      gender: d.gender,
      observation: d.observation,
    })),
  };
}

function mapMovement(dto: OrderMovementDTO): OrderMovement {
  return {
    id: dto.id,
    orderId: dto.orderId,
    status: dto.status,
    registrationDate: dto.registration_date,
    user: dto.user,
  };
}


export interface GetOrdersResult {
  orders: OrderListItem[];
  cards: OrderCards;
  pagination: OrdersPagination;
}

export const getOrdersService = async (
  params: GetOrdersParams = {}
): Promise<GetOrdersResult> => {
  const { data } = await http.get<GetOrdersResponseDTO>("/order", { params });
  return {
    orders: data.orders.map(mapListItem),
    cards: mapCards(data.cards),
    pagination: data.pagination,
  };
};



export interface GetProductionOrdersResult {
  orders: ProductionOrderListItem[];
  cards: OrderCards;
  pagination: OrdersPagination;
}

export const getProductionOrdersService = async (
  params: GetProductionOrdersParams = {}
): Promise<GetProductionOrdersResult> => {
  const { data } = await http.get<GetProductionOrdersResponseDTO>(
    "/order/production",
    {
      params: { ...params, search: params.search?.trim() || undefined },
    }
  );
  return {
    orders: data.orders.map(mapProductionListItem),
    cards: mapCards(data.cards),
    pagination: data.pagination,
  };
};



export const getProductionOrderByIdService = async (
  id: number
): Promise<Order> => {
  const { data } = await http.get<OrderByIdDTO>(`/order/${id}/in-production`);
  return mapOrder(data);
};


export const getOrderByIdService = async (id: number): Promise<Order> => {
  const { data } = await http.get<OrderByIdDTO>(`/order/${id}`);
  return mapOrder(data);
};



export const getOrderMovementsService = async (
  id: number
): Promise<OrderMovement[]> => {
  const { data } = await http.get<OrderMovementDTO[]>(`/order/${id}/movements`);
  return data.map(mapMovement);
};



export const addOrderDetailService = async (
  orderId: number,
  payload: AddOrderDetailPayload
): Promise<MessageResponse> => {
  const { data } = await http.post<MessageResponse>(
    `/order/${orderId}/detail`,
    payload
  );
  return data;
};



export const updateOrderDetailService = async (
  detailId: number,
  payload: UpdateOrderDetailPayload
): Promise<MessageResponse> => {
  const { data } = await http.put<MessageResponse>(
    `/order-detail/${detailId}`,
    payload
  );
  return data;
};

// ---- deleteOrderDetail ----

export const deleteOrderDetailService = async (
  detailId: number
): Promise<MessageResponse> => {
  const { data } = await http.delete<MessageResponse>(
    `/order-detail/${detailId}`
  );
  return data;
};



export const updateOrderStatusService = async (
  orderId: number,
  payload: UpdateOrderStatusPayload
): Promise<MessageResponse> => {
  const { data } = await http.patch<MessageResponse>(
    `/order/${orderId}`,
    payload
  );
  return data;
};

export const getOrderPdfService = async (id: number): Promise<Blob> => {
  const { data } = await http.get<Blob>(`/order/${id}/PDF`, { responseType: "blob" });
  return data;
};