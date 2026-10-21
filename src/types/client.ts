export interface Client {
    id: number;
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  phone: string;
  email: string;
  rfc: string;
  fiscalName: string | null;
  fiscalRegime: string | null;
  fiscalZipCode: string | null;
  cfdiUse: string | null;
  registrationDate: string;
  status: number;
  fullName?: string;
}

export interface ClientListItem {
  id: number;
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  fullName?: string;
  phone: string;
  email: string;
  rfc: string;
  fiscalName: string | null;
  fiscalRegime: string | null;
  fiscalZipCode: string | null;
  cfdiUse: string | null;
  registrationDate: string;
  status: number;

}

export interface ClientAddress {
  id: number;
  clientId: number;
  state: string;
  city: string;
  zipCode: string;
  neighborhood: string;
  street: string;
  number: string;
}

export interface ClientsPagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ClientsResponse {
  clients: ClientListItem[];
  pagination: ClientsPagination;
}

export interface ClientPayload {
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  phone: string;
  email?: string;
  rfc?: string;
  municipality?: number;
  neighborhood?: number;
  street?: string;
  number?: string;
  registrationDate?: string;
  status?: number;
}

export interface ClientAddressPayload {
  state: string;
  city: string;
  zipCode: string;
  neighborhood: string;
  street: string;
  number: string;
}

export interface UpdateOrderDeliveryAddressPayload {
  addressId: number;
}

export interface ClientTaxInformationPayload {
  rfc: string;
  fiscalName: string;
  fiscalRegime: string; 
  fiscalZipCode: string;
  cfdiUse: string; 
}

export interface ClientTaxInformationResponse {
  message: string;
}