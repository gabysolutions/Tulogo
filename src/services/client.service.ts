import { http } from "./http";
import type {
  Client,
  ClientListItem,
  ClientsResponse,
  ClientsPagination,
  ClientPayload,
  ClientAddress,
  ClientAddressPayload,
  ClientTaxInformationPayload,
  ClientTaxInformationResponse,
} from "../types/client";
import { buildFullName } from "../utils/client-helpers";

interface ClientDTO {
  id: number;
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  phone: string;
  email: string;
  rfc: string | null;
  registration_date: string;
  status: number;
  fiscalName?: string | null;
  fiscalRegime?: string | null;
  fiscalZipCode?: string | null;
  cfdiUse?: string | null;
}

interface ClientListItemDTO {
id: number;
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  phone: string;
  email: string;
  rfc: string | null;
  fiscalName: string | null;
  fiscalRegime: string | null;
  fiscalZipCode: string | null;
  cfdiUse: string | null;
  registration_date: string;
  status: number;
}

interface ClientsResponseDTO {
  clients: ClientListItemDTO[];
  pagination: ClientsPagination;
}

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

interface CreateClientResponse extends MessageResponse {
  id: number;
}

export interface QuickClientPayload {
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  phone?: string;
}

function mapClient(dto: ClientDTO): Client {
  const name = (dto.name ?? "").trim();
  const paternal = (dto.paternal_last_name ?? "").trim();
  const maternalRaw = (dto.maternal_last_name ?? "").trim();
  const maternal = maternalRaw === "." ? "" : maternalRaw;

  return {
    id: dto.id,
    name,
    paternal_last_name: paternal,
    maternal_last_name: maternal,
    fullName: buildFullName(name, paternal, maternal),
    phone: dto.phone,
    email: dto.email,
    rfc: dto.rfc ?? "",
    fiscalName: dto.fiscalName ?? null,
    fiscalRegime: dto.fiscalRegime ?? null,
    fiscalZipCode: dto.fiscalZipCode ?? null,
    cfdiUse: dto.cfdiUse ?? null,
    registrationDate: dto.registration_date,
    status: dto.status,
  };
}

function mapClientListItem(dto: ClientListItemDTO): ClientListItem {
  return mapClient(dto);
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

function buildClientBody(payload: ClientPayload) {
  return {
    name: payload.name.trim(),
    paternalLastName: payload.paternal_last_name.trim(),
    maternalLastName: payload.maternal_last_name?.trim() || ".",
    phone: payload.phone,
    email: payload.email,
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

export interface GetClientsParams {
  search?: string;
  page?: number;
}

export async function getClients(params: GetClientsParams = {}): Promise<ClientsResponse> {
  const { data } = await http.get<ClientsResponseDTO>("/client", { params });
  return {
    clients: data.clients.map(mapClientListItem),
    pagination: data.pagination,
  };
}

export async function getClientById(id: number): Promise<Client> {
  const { data } = await http.get<ClientDTO>(`/client/${id}`);
  return mapClient(data);
}

export async function createClient(payload: ClientPayload): Promise<CreateClientResponse> {
  const { data } = await http.post<CreateClientResponse>("/client", buildClientBody(payload));
  return data;
}

export async function createQuickClient(
  payload: QuickClientPayload
): Promise<CreateClientResponse> {
  const { data } = await http.post<CreateClientResponse>("/client", {
    name: payload.name.trim(),
    paternalLastName: payload.paternal_last_name.trim(),
    maternalLastName: payload.maternal_last_name?.trim() || ".",
    phone: payload.phone,
  });
  return data;
}

export async function updateClient(id: number, payload: ClientPayload): Promise<MessageResponse> {
  const { data } = await http.put<MessageResponse>(`/client/${id}`, buildClientBody(payload));
  return data;
}

export async function updateClientTaxInformation(
  clientId: number,
  payload: ClientTaxInformationPayload
): Promise<ClientTaxInformationResponse> {
  const { data } = await http.put<ClientTaxInformationResponse>(
    `/client/${clientId}/tax-information`,
    {
      rfc: payload.rfc.trim().toUpperCase(),
      fiscalName: payload.fiscalName.trim(),
      fiscalRegime: payload.fiscalRegime,
      fiscalZipCode: payload.fiscalZipCode,
      cfdiUse: payload.cfdiUse,
    }
  );
  return data;
}

export async function getClientAddresses(clientId: number): Promise<ClientAddress[]> {
  const { data } = await http.get<ClientAddressDTO[]>(`/client/${clientId}/address`);
  return data.map(mapClientAddress);
}

export async function addClientAddress(
  clientId: number,
  payload: ClientAddressPayload
): Promise<MessageResponse> {
  const { data } = await http.post<MessageResponse>(
    `/client/${clientId}/address`,
    buildAddressBody(payload)
  );
  return data;
}