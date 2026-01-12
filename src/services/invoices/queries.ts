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

export function useRecentInvoicesQuery() {
  return useQuery({
    queryKey: ["invoices", "recent"],
    queryFn: async () => {
      const response = await api.get<RecentInvoice[]>("/invoices/recent");
      return response.data;
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
}
