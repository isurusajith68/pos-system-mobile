import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type InventoryItem = {
  inventory_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  reorder_level: number | null;
  batch_number: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryStats = {
  threshold: number;
  total: number;
  in_stock: number;
  out_of_stock: number;
  low_stock: number;
  expiring_soon: number;
  inventory_value: number | string;
};

export type InventoryResponse = {
  page: number;
  limit: number;
  rows: InventoryItem[];
};

export type InventoryQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  stockFilter?: "all" | "in" | "low" | "out";
  threshold?: number;
};

export function useInventoryQuery({
  page = 1,
  limit = 20,
  search,
  stockFilter = "all",
  threshold = 10,
}: InventoryQueryParams) {
  return useQuery({
    queryKey: ["inventory", { page, limit, search, stockFilter, threshold }],
    queryFn: async () => {
      const response = await api.get<InventoryResponse>("/inventory", {
        params: {
          page,
          limit,
          search: search || undefined,
          stock: stockFilter === "all" ? undefined : stockFilter,
          threshold,
        },
      });
      return response.data;
    },
  });
}

export function useInventoryStatsQuery(threshold = 10) {
  return useQuery({
    queryKey: ["inventory", "stats", threshold],
    queryFn: async () => {
      const response = await api.get<InventoryStats>("/inventory/stats", {
        params: { threshold },
      });
      return response.data;
    },
  });
}
