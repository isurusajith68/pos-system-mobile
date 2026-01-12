import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type Category = {
  category_id: string;
  name: string;
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<Category[]>("/categories");
      return response.data;
    },
  });
}
