import { http } from "./http";
import type { LoginResponse } from "../types/auth";

export const loginService = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const { data } = await http.post<LoginResponse>("/auth/login", {
    username,
    password,
  });

  return data;
};