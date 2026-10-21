import { http } from "./http";
import type { ClientAddress, ClientAddressPayload ,UpdateOrderDeliveryAddressPayload} from "../types/client";

interface ClientAddressDTO {
  id: number;
  clientId: number;
  state: string;
  city: string;
  zip_code: string;
  neighborhood: string;
  street: string;
  number: string;
}

interface MessageResponse {
  message: string;
}

function mapClientAddress(dto: ClientAddressDTO): ClientAddress {
  return {
    id: dto.id,
    clientId: dto.clientId,
    state: dto.state,
    city: dto.city,
    zipCode: dto.zip_code,
    neighborhood: dto.neighborhood,
    street: dto.street,
    number: dto.number,
  };
}

function buildAddressBody(payload: ClientAddressPayload) {
  return {
    state: payload.state,
    city: payload.city,
    zipCode: payload.zipCode,
    neighborhood: payload.neighborhood,
    street: payload.street,
    number: payload.number,
  };
}

export async function getClientAddressById(id: number): Promise<ClientAddress> {
  const { data } = await http.get<ClientAddressDTO>(`/client-address/${id}`);
  return mapClientAddress(data);
}

export async function updateClientAddress(
  id: number,
  payload: ClientAddressPayload
): Promise<MessageResponse> {
  const { data } = await http.put<MessageResponse>(`/client-address/${id}`, buildAddressBody(payload));
  return data;
}

export async function deleteClientAddress(id: number): Promise<MessageResponse> {
  const { data } = await http.delete<MessageResponse>(`/client-address/${id}`);
  return data;
}

export async function updateOrderDeliveryAddress(
  orderId: number,
  payload: UpdateOrderDeliveryAddressPayload
) {
  const { data } = await http.patch(`/order/${orderId}/delivery-address`, payload);
  return data;
}