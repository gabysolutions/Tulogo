import { http } from "./http";
import type { FabricType, FabricTypePayload ,FabricTypeActionResponse} from "../types/inventory";

interface MessageResponse {
  message: string;
}

export async function getFabricTypes(): Promise<FabricType[]> {
  const { data } = await http.get<FabricType[]>("/fabric-type");
  return data;
}

export async function getFabricTypeById(id: number): Promise<FabricType> {
  const { data } = await http.get<FabricType>(`/fabric-type/${id}`);
  return data;
}

export async function createFabricType(payload: FabricTypePayload): Promise<MessageResponse> {
  const { data } = await http.post<MessageResponse>("/fabric-type", payload);
  return data;
}

export async function updateFabricType(id: number, payload: FabricTypePayload): Promise<MessageResponse> {
  const { data } = await http.put<MessageResponse>(`/fabric-type/${id}`, payload);
  return data;
}

export const deleteFabricType = async (id: number): Promise<FabricTypeActionResponse> => {
  const { data } = await http.delete<FabricTypeActionResponse>(`/fabric-type/${id}`);
  return data;
};

export const activateFabricType = async (id: number): Promise<FabricTypeActionResponse> => {
  const { data } = await http.patch<FabricTypeActionResponse>(`/fabric-type/${id}`, {});
  return data;
};