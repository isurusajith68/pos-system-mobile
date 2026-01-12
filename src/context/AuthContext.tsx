import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
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
  useValidateTokenMutation,
} from "../services/auth/mutations";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const REFRESH_TOKEN_KEY = "auth.refreshToken";
const MIN_SPLASH_DURATION_MS = 3000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const splashStartRef = useRef(Date.now());
  const queryClient = useQueryClient();

  const loginMutation = useLoginMutation();
  const refreshMutation = useRefreshTokenMutation();
  const validateMutation = useValidateTokenMutation();
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
    [loginMutation]
  );

  const refreshAccessToken = useCallback(async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!storedToken) {
        return null;
      }
      const data = await refreshMutation.mutateAsync(storedToken);
      setUser((prev) =>
        prev ? { ...prev, accessToken: data.accessToken } : prev
      );
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

  const validateSession = useCallback(async () => {
    setIsInitializing(true);
    try {
      const token = await refreshAccessToken();
      if (!token) {
        return;
      }

      const data = await validateMutation.mutateAsync();
      if (!data.valid) {
        setError("User not found.");
        logout();
        return;
      }

      setUser({
        id: data.id,
        employeeId: data.employeeId,
        name: data.name,
        role: data.role,
        email: data.email,
        tenantId: data.tenantId,
        schemaName: data.schemaName,
        subscriptionId: data.subscriptionId,
        accessToken: token,
        storeName: data.storeName,
      });
      setAuthToken(token);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      logout();
    } finally {
      const elapsed = Date.now() - splashStartRef.current;
      const remaining = Math.max(0, MIN_SPLASH_DURATION_MS - elapsed);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setIsInitializing(false);
    }
  }, [refreshAccessToken, validateMutation, logout]);

  useEffect(() => {
    setRefreshHandler(() => refreshAccessToken());
    return () => setRefreshHandler(null);
  }, [refreshAccessToken]);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      if (user) {
        return;
      }

      const storedToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (storedToken) {
        validateSession();
        return;
      }

      if (isMounted) {
        const elapsed = Date.now() - splashStartRef.current;
        const remaining = Math.max(0, MIN_SPLASH_DURATION_MS - elapsed);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        setIsInitializing(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [user, validateSession]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isInitializing,
      error,
      login,
      refreshAccessToken,
      logout,
    }),
    [user, isLoading, isInitializing, error, login, refreshAccessToken, logout]
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
