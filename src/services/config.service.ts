import { http } from "./http";
import type {
  Config,
  ConfigResponseDTO,
  UpdateConfigDTO,
  UpdateConfigResponse,
} from "../types/config";

const mapResponseToConfig = (dto: ConfigResponseDTO): Config => ({
  companyName: dto.company_name,
  phone: dto.phone,
  email: dto.email,
  rfc: dto.rfc,
  zipCode: dto.zip_code,
  city: dto.city,
  state: dto.state,
  street: dto.street,
  number: dto.number,
  neighborhood: dto.neighborhood,
});

const mapConfigToUpdateDTO = (config: Config): UpdateConfigDTO => ({
  companyName: config.companyName,
  phone: config.phone,
  email: config.email,
  rfc: config.rfc,
  zipCode: config.zipCode,
  city: config.city,
  state: config.state,
  street: config.street,
  number: config.number,
  neighborhood: config.neighborhood,
});

export const getConfig = async (): Promise<Config> => {
  const { data } = await http.get<ConfigResponseDTO>("/config");
  return mapResponseToConfig(data);
};

export const updateConfig = async (
  config: Config
): Promise<UpdateConfigResponse> => {
  const body = mapConfigToUpdateDTO(config);
  const { data } = await http.put<UpdateConfigResponse>("/config", body);
  return data;
};