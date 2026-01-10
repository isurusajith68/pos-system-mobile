import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type UserMe = {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  email: string;
  tenantId: string;
  schemaName: string;
  subscriptionId: string;
};

export function useUserMeQuery() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const response = await api.get<UserMe>("/users/me");
      return response.data;
    },
  });
}
