import { http } from "./http";
import type {
  CreateUserPayload,
  CreateUserResponse,
  SimpleMessageResponse,
  UpdateUserPayload,
  User,
  UserRole,
  UsersResponse,
  UserTypeBreakdown,
  UserPrivilege,
} from "../types/user";



interface UserDTO {
  id: number;
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  role: UserRole;
  username: string;
  status: number;
}

interface UserTypeBreakdownDTO {
  admin_users: string;
  sale_users: string;
  designer_users: string;
  production_users: string;
  packing_users: string;
}

interface UsersResponseDTO {
  users: UserDTO[];
  total: number;
  totalByUserType: UserTypeBreakdownDTO[];
}



function mapUser(dto: UserDTO): User {
  return {
    id: dto.id,
    name: dto.name,
    paternal_last_name: dto.paternal_last_name,
    maternal_last_name: dto.maternal_last_name,
    role: dto.role,
    username: dto.username,
    status: dto.status,
    fullName: `${dto.name} ${dto.paternal_last_name} ${dto.maternal_last_name}`.trim(),
  };
}

function mapUserTypeBreakdown(dto: UserTypeBreakdownDTO): UserTypeBreakdown {
  return {
    adminUsers: Number(dto.admin_users),
    saleUsers: Number(dto.sale_users),
    designerUsers: Number(dto.designer_users),
    productionUsers: Number(dto.production_users),
    packingUsers: Number(dto.packing_users),
  };
}

// ---- Servicio ----

interface CreateUserRequestDTO {
  name: string;
  paternalLastName: string;
  maternalLastName: string;
  role: UserRole;
  username: string;
  password: string;
}

export const createUserService = async (
  payload: CreateUserPayload
): Promise<CreateUserResponse> => {
  const body: CreateUserRequestDTO = {
    name: payload.name,
    paternalLastName: payload.paternal_last_name,
    maternalLastName: payload.maternal_last_name,
    role: payload.role,
    username: payload.username,
    password: payload.password,
  };

  const { data } = await http.post<CreateUserResponse>("/user", body);
  return data;
};

export const getUsersService = async (): Promise<UsersResponse> => {
  const { data } = await http.get<UsersResponseDTO>("/user");
  return {
    users: data.users.map(mapUser),
    total: data.total,
  
    totalByUserType: mapUserTypeBreakdown(
      data.totalByUserType[0] ?? {
        admin_users: "0",
        sale_users: "0",
        designer_users: "0",
        production_users: "0",
        packing_users: "0",
      }
    ),
  };
};

export const getUserByIdService = async (id: number): Promise<User> => {
  const { data } = await http.get<UserDTO>(`/user/${id}`);
  return mapUser(data);
};

export const updateUserService = async (
  id: number,
  payload: UpdateUserPayload
): Promise<SimpleMessageResponse> => {
  const body = {
    name: payload.name,
    paternalLastName: payload.paternal_last_name,
    maternalLastName: payload.maternal_last_name,
    role: payload.role,
    username: payload.username,
    ...(payload.password ? { password: payload.password } : {}),
  };

  const { data } = await http.put<SimpleMessageResponse>(`/user/${id}`, body);
  return data;
};

export const deleteUserService = async (
  id: number
): Promise<SimpleMessageResponse> => {
  const { data } = await http.delete<SimpleMessageResponse>(`/user/${id}`);
  return data;
};

export const toggleUserStatusService = async (
  id: number,
  status: 0 | 1
): Promise<SimpleMessageResponse> => {
  const { data } = await http.patch<SimpleMessageResponse>(`/user/${id}`, { status });
  return data;
};

export const getUserPrivilegesService = async (
  id: number
): Promise<UserPrivilege[]> => {
  const { data } = await http.get<UserPrivilege[]>(`/user/${id}/privileges`);
  return data;
};

export const getAllPrivilegesService = async (): Promise<UserPrivilege[]> => {
  const { data } = await http.get<UserPrivilege[]>("/privilege");
  return data;
};


export const addProdPermissionService = async (userId: number, status: number) => {
  const { data } = await http.post<SimpleMessageResponse>(
    `/user/${userId}/prod-permission/${status}`
  );
  return data;
};

export const deleteProdPermissionService = async (userId: number, status: number) => {
  const { data } = await http.delete<SimpleMessageResponse>(
    `/user/${userId}/prod-permission/${status}`
  );
  return data;
};

export const addPrivilegeService = async (userId: number, privilegeId: number) => {
  const { data } = await http.post<SimpleMessageResponse>(
    `/user/${userId}/privilege/${privilegeId}`
  );
  return data;
};

export const deletePrivilegeService = async (userId: number, privilegeId: number) => {
  const { data } = await http.delete<SimpleMessageResponse>(
    `/user/${userId}/privilege/${privilegeId}`
  );
  return data;
};