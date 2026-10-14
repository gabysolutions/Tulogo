import { http, publicHttp } from "./http";
import type {
  AddOrderLinkResponse,
  AddOrderDetailsPayload,
  MessageResponse,
  PublicOrder,
} from "../types/orderLink";



interface PublicOrderDTO {
  order: {
    id: number;
    client: string;
    articles: {
      articleId: number;
      article: string;
      category: string;
      fabric_type: string;
      design_img: string;
      amount: number;
      piecesRegistered: number;
    }[];
  };
  expiresIn: string;
}

export async function addOrderLink(orderId: number): Promise<AddOrderLinkResponse> {
  const { data } = await http.post<AddOrderLinkResponse>(`/order/${orderId}/link`);
  return data;
}


export async function getOrderByToken(token: string): Promise<PublicOrder> {
  const { data } = await publicHttp.get<PublicOrderDTO>(`/public/order/${token}`);
  return {
    id: data.order.id,
    client: data.order.client,
    expiresAt: data.expiresIn,
    articles: data.order.articles.map((a) => ({
      articleId: a.articleId,
      article: a.article,
      category: a.category,
      fabricType: a.fabric_type,
      designImg: a.design_img,
      amount: a.amount,
      piecesRegistered: a.piecesRegistered,
    })),
  };
}

export async function addOrderDetails(
  token: string,
  payload: AddOrderDetailsPayload,
): Promise<MessageResponse> {
  const { data } = await publicHttp.post<MessageResponse>(
    `/public/order/${token}/details`,
    payload,
  );
  return data;
}


export async function acceptOrderDetails(linkId: number): Promise<MessageResponse> {
  const { data } = await http.patch<MessageResponse>(`/public/order/${linkId}/accept`);
  return data;
}

export async function rejectOrderDetails(linkId: number): Promise<MessageResponse> {
  const { data } = await http.patch<MessageResponse>(`/public/order/${linkId}/reject`);
  return data;
}