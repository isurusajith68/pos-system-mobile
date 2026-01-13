import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type Supplier = {
  supplier_id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseOrder = {
  po_id: string;
  supplier_id: string;
  order_date: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  supplier_name: string;
};

export type PurchaseOrderItem = {
  po_item_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  received_date: string | null;
  created_at: string;
  updated_at: string;
  product_name: string;
  product_english_name: string | null;
  sku: string | null;
  barcode: string | null;
  unit: string | null;
  unit_size: string | null;
  unit_type: string | null;
};

export type PurchaseOrderDetails = {
  po_id: string;
  supplier_id: string;
  order_date: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
};

export type PurchaseOrderStats = {
  total: number;
  pending: number;
  received: number;
  cancelled: number;
};

export type PurchaseOrdersResponse = {
  page: number;
  limit: number;
  rows: PurchaseOrder[];
};

export type PurchaseOrdersQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  supplierId?: string | null;
};

export function usePurchaseOrdersQuery({
  page = 1,
  limit = 20,
  search,
  supplierId,
}: PurchaseOrdersQueryParams) {
  return useQuery({
    queryKey: ["purchase-orders", { page, limit, search, supplierId }],
    queryFn: async () => {
      const response = await api.get<PurchaseOrdersResponse>("/purchase-orders/pos", {
        params: {
          page,
          limit,
          search: search || undefined,
          supplier_id: supplierId || undefined,
        },
      });
      return response.data;
    },
  });
}

export function usePurchaseOrderQuery(poId?: string) {
  return useQuery({
    queryKey: ["purchase-orders", poId],
    queryFn: async () => {
      const response = await api.get<PurchaseOrderDetails>(
        `/purchase-orders/pos/${poId}`
      );
      return response.data;
    },
    enabled: Boolean(poId),
  });
}

export function usePurchaseOrderStatsQuery() {
  return useQuery({
    queryKey: ["purchase-orders", "stats"],
    queryFn: async () => {
      const response = await api.get<PurchaseOrderStats>("/purchase-orders/stats");
      return response.data;
    },
  });
}

export function useSuppliersQuery() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await api.get<Supplier[]>("/purchase-orders/suppliers");
      return response.data;
    },
  });
}
