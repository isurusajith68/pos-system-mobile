import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type ReportDateParams = {
  start?: string;
  end?: string;
};

export type SalesSummary = {
  invoice_count: number;
  sub_total: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_received: number;
  outstanding_balance: number;
};

export type SalesDaily = {
  day: string;
  total_amount: number;
  invoice_count: number;
};

export type ProductPerformance = {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  sales_amount: number;
};

export type CustomerInsight = {
  customer_id: string;
  name: string;
  invoice_count: number;
  total_spent: number;
  average_invoice: number;
};

export type EmployeeSales = {
  employee_id: string;
  name: string;
  invoice_count: number;
  total_sales: number;
};

export function useSalesSummaryReport(params: ReportDateParams) {
  return useQuery({
    queryKey: ["reports", "sales-summary", params],
    queryFn: async () => {
      const response = await api.get<SalesSummary | null>(
        "/reports/sales-summary",
        { params }
      );
      return response.data;
    },
  });
}

export function useSalesDailyReport(params: ReportDateParams) {
  return useQuery({
    queryKey: ["reports", "sales-daily", params],
    queryFn: async () => {
      const response = await api.get<SalesDaily[]>("/reports/sales-daily", {
        params,
      });
      return response.data;
    },
  });
}

export function useProductPerformanceReport(params: ReportDateParams) {
  return useQuery({
    queryKey: ["reports", "product-performance", params],
    queryFn: async () => {
      const response = await api.get<ProductPerformance[]>(
        "/reports/product-performance",
        { params }
      );
      return response.data;
    },
  });
}

export function useCustomerInsightsReport(params: ReportDateParams) {
  return useQuery({
    queryKey: ["reports", "customer-insights", params],
    queryFn: async () => {
      const response = await api.get<CustomerInsight[]>(
        "/reports/customer-insights",
        { params }
      );
      return response.data;
    },
  });
}

export function useEmployeeSalesReport(params: ReportDateParams) {
  return useQuery({
    queryKey: ["reports", "employee-sales", params],
    queryFn: async () => {
      const response = await api.get<EmployeeSales[]>(
        "/reports/employee-sales",
        { params }
      );
      return response.data;
    },
  });
}
