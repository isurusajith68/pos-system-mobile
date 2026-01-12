import { useMutation } from "@tanstack/react-query";
import { api } from "../api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  email: string;
  tenantId: string;
  schemaName: string;
  subscriptionId: string;
  accessToken: string;
  storeName?: string;
};

export type AuthResponse = AuthUser & {
  refreshToken: string;
};

export type ValidateResponse = AuthUser & {
  valid: boolean;
};

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await api.post<AuthResponse>("/auth/login", payload);
      return response.data;
    },
  });
}

export function useRefreshTokenMutation() {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await api.post<{ accessToken: string }>(
        "/auth/refresh",
        { refreshToken },
        { headers: { "x-skip-auth-refresh": "true" } },
      );
      return response.data;
    },
  });
}

export function useValidateTokenMutation() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<ValidateResponse>("/auth/validate");
      return response.data;
    },
  });
}
