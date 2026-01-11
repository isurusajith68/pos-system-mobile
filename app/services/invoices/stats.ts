import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type DailyInvoiceStats = {
  sales_date: string;
  invoice_count: number;
  sub_total: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
};

export function useDailyInvoiceStatsQuery() {
  return useQuery({
    queryKey: ["invoices", "daily-stats"],
    queryFn: async () => {
      const response = await api.get<DailyInvoiceStats>(
        "/invoices/daily-stats",
      );
      return response.data;
    },
  });
}
