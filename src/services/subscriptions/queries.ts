import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type Subscription = {
  id: string;
  tenant_id: string;
  plan_name: string;
  joined_at: string;
  expires_at: string;
  status: string;
  created_at: string;
};

export function useSubscriptionsQuery() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const response = await api.get<Subscription[]>("/subscriptions");
      return response.data;
    },
  });
}
