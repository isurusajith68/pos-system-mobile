import axios, { AxiosError, AxiosRequestConfig } from "axios";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://47.245.83.89/app1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

export function setRefreshHandler(handler: RefreshHandler | null) {
  refreshHandler = handler;
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const method = error.config?.method?.toUpperCase() ?? "UNKNOWN";
    const url = error.config?.url ?? "unknown-url";
    const statusCode = error.response?.status ?? "no-status";
    console.error(`[api] ${method} ${url} -> ${statusCode}`);

    const status = error.response?.status;
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const skipRefresh =
      originalRequest?.headers &&
      (originalRequest.headers as Record<string, string>)["x-skip-auth-refresh"];

    if (
      status !== 401 ||
      !refreshHandler ||
      originalRequest._retry ||
      skipRefresh
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers = {
            ...(originalRequest.headers ?? {}),
            Authorization: `Bearer ${token}`,
          };
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const token = await refreshHandler();
      setAuthToken(token);
      refreshQueue.forEach((notify) => notify(token));
      refreshQueue = [];

      if (!token) {
        return Promise.reject(error);
      }

      originalRequest.headers = {
        ...(originalRequest.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
      return api(originalRequest);
    } catch (refreshError) {
      refreshQueue.forEach((notify) => notify(null));
      refreshQueue = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function getApiErrorMessage(error: unknown) {
  if (error && (error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status ?? 0;
    if (status >= 500) {
      return "Server unavailable. Please try again.";
    }
    return (
      axiosError.response?.data?.message ??
      axiosError.message ??
      "Request failed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed.";
}
