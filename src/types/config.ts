
export interface ConfigResponseDTO {
  company_name: string;
  phone: string;
  email: string;
  rfc: string;
  zip_code: string;
  city: string;
  state: string;
  street: string;
  number: string;
  neighborhood: string;
}
 

export interface UpdateConfigDTO {
  companyName: string;
  phone: string;
  email: string;
  rfc: string;
  zipCode: string;
  city: string;
  state: string;
  street: string;
  number: string;
  neighborhood: string;
}
 

export interface Config {
  companyName: string;
  phone: string;
  email: string;
  rfc: string;
  zipCode: string;
  city: string;
  state: string;
  street: string;
  number: string;
  neighborhood: string;
}
 

export interface UpdateConfigResponse {
  message: string;
}