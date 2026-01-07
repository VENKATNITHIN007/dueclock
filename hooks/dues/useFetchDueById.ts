import { useQuery } from "@tanstack/react-query";
import { DueType } from "@/schemas/apiSchemas/dueClientSchema";

const fetchDueById = async (id: string): Promise<DueType> => {
  const response = await fetch(`/api/duedates/details/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch due date");
  }
  return response.json();
};

export function useFetchDueById(id: string) {
  return useQuery({
    queryKey: ["dueDate", id],
    queryFn: () => fetchDueById(id),
    enabled: !!id,
  });
}