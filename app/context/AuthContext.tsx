import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import {
  getApiErrorMessage,
  setAuthToken,
  setRefreshHandler,
} from "../services/api";
import {
  AuthUser,
  LoginPayload,
  useLoginMutation,
  useRefreshTokenMutation,
} from "../services/auth/mutations";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const REFRESH_TOKEN_KEY = "auth.refreshToken";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const loginMutation = useLoginMutation();
  const refreshMutation = useRefreshTokenMutation();
  const isLoading = loginMutation.isPending;

  const login = useCallback(
    async (payload: LoginPayload) => {
      setError(null);

      try {
        const data = await loginMutation.mutateAsync(payload);
        const { refreshToken, ...safeUser } = data;
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        setUser(safeUser);
        setAuthToken(safeUser.accessToken);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        throw err;
      }
    },
    [loginMutation],
  );

  const refreshAccessToken = useCallback(async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!storedToken) {
        return null;
      }

      const data = await refreshMutation.mutateAsync(storedToken);
      setUser((prev) => (prev ? { ...prev, accessToken: data.accessToken } : prev));
      setAuthToken(data.accessToken);
      return data.accessToken;
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      return null;
    }
  }, [refreshMutation]);

  const logout = useCallback(() => {
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => null);
    setUser(null);
    setAuthToken(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setRefreshHandler(() => refreshAccessToken());
    return () => setRefreshHandler(null);
  }, [refreshAccessToken]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      login,
      refreshAccessToken,
      logout,
    }),
    [user, isLoading, error, login, refreshAccessToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
