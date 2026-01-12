import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type Product = {
  product_id: string;
  name: string;
  price?: number | null;
  stock_level?: number | null;
  category_id?: string | null;
  category_name?: string | null;
};

export type ProductStats = {
  total: number;
  in_stock: number;
  out_of_stock: number;
  low_stock: number;
  threshold: number;
};

export type ProductsResponse = {
  page: number;
  limit: number;
  rows: Product[];
};

export type ProductsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string | null;
};

export function useProductsQuery({
  page = 1,
  limit = 20,
  search,
  categoryId,
}: ProductsQueryParams) {
  return useQuery({
    queryKey: ["products", { page, limit, search, categoryId }],
    queryFn: async () => {
      const response = await api.get<ProductsResponse>("/products", {
        params: {
          page,
          limit,
          search: search || undefined,
          category_id: categoryId || undefined,
        },
      });
      return response.data;
    },
  });
}

export function useProductStatsQuery(threshold = 10) {
  return useQuery({
    queryKey: ["products", "stats", threshold],
    queryFn: async () => {
      const response = await api.get<ProductStats>("/products/stats", {
        params: { threshold },
      });
      return response.data;
    },
  });
}
