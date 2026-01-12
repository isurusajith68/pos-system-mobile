import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type Product = {
  product_id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  english_name?: string | null;
  description?: string | null;
  brand?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  price: number;
  cost_price?: number | null;
  discounted_price?: number | null;
  wholesale?: number | null;
  tax_inclusive_price?: number | null;
  tax_rate?: number | null;
  unit_size?: string | null;
  unit_type?: string | null;
  unit?: string | null;
  stock_level?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
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
  stockFilter?: "all" | "in" | "low" | "out";
  threshold?: number;
};

export function useProductsQuery({
  page = 1,
  limit = 20,
  search,
  categoryId,
  stockFilter = "all",
  threshold = 10,
}: ProductsQueryParams) {
  return useQuery({
    queryKey: ["products", { page, limit, search, categoryId, stockFilter, threshold }],
    queryFn: async () => {
      const response = await api.get<ProductsResponse>("/products", {
        params: {
          page,
          limit,
          search: search || undefined,
          category_id: categoryId || undefined,
          stock: stockFilter !== "all" ? stockFilter : undefined,
          threshold: stockFilter === "low" ? threshold : undefined,
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

export function useProductQuery(productId?: string) {
  return useQuery({
    queryKey: ["products", productId],
    queryFn: async () => {
      const response = await api.get<Product>(`/products/${productId}`);
      return response.data;
    },
    enabled: Boolean(productId),
  });
}
