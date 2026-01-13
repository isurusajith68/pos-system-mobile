import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type RecentInvoice = {
  invoice_id: string;
  date: string;
  customer_id: string | null;
  customer_name: string | null;
  employee_id: string;
  sub_total: number;
  total_amount: number;
  payment_mode: string;
  tax_amount: number;
  discount_amount: number;
  amount_received: number;
  outstanding_balance: number;
  payment_status: string;
  refund_invoice_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesInvoice = RecentInvoice & {
  sales_details?: Array<{
    sales_detail_id: string;
    invoice_id: string;
    product_id: string | null;
    custom_product_id: string | null;
    unit: string | null;
    original_price: number | null;
    cost_price: number | null;
    quantity: number;
    unit_price: number;
    tax_rate: number | null;
    created_at: string;
    updated_at: string;
    product_name: string | null;
    custom_product_name: string | null;
  }>;
};

export type SalesInvoicesResponse = {
  page: number;
  limit: number;
  rows: SalesInvoice[];
};

export type SalesInvoicesQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  start?: string | null;
  end?: string | null;
};

export type SalesSummary = {
  total_amount: number;
  bill_count: number;
};

export function useRecentInvoicesQuery() {
  return useQuery({
    queryKey: ["invoices", "recent"],
    queryFn: async () => {
      const response = await api.get<RecentInvoice[]>("/invoices/recent");
      return response.data;
    },
    refetchInterval: 20000,
    refetchIntervalInBackground: true,
  });
}

export function useSalesInvoicesQuery({
  page = 1,
  limit = 20,
  search,
  start,
  end,
}: SalesInvoicesQueryParams) {
  return useQuery({
    queryKey: ["invoices", "list", { page, limit, search, start, end }],
    queryFn: async () => {
      const response = await api.get<SalesInvoicesResponse>("/invoices", {
        params: {
          page,
          limit,
          search: search || undefined,
          start: start || undefined,
          end: end || undefined,
        },
      });
      return response.data;
    },
  });
}

export function useSalesInvoiceQuery(invoiceId?: string) {
  return useQuery({
    queryKey: ["invoices", invoiceId],
    queryFn: async () => {
      const response = await api.get<SalesInvoice>(
        `/invoices/sales-details/${invoiceId}`
      );
      return response.data;
    },
    enabled: Boolean(invoiceId),
  });
}

export function useSalesSummaryQuery({
  search,
  start,
  end,
}: Pick<SalesInvoicesQueryParams, "search" | "start" | "end">) {
  return useQuery({
    queryKey: ["invoices", "summary", { search, start, end }],
    queryFn: async () => {
      const response = await api.get<SalesSummary>("/invoices/summary", {
        params: {
          search: search || undefined,
          start: start || undefined,
          end: end || undefined,
        },
      });
      return response.data;
    },
  });
}
