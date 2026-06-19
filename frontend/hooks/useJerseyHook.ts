import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jerseyService } from "@/services/jersey.service";

// Get all jerseys query hook
export const useJerseys = () => {
  return useQuery({
    queryKey: ["jerseys"],
    queryFn: jerseyService.getAll,
  });
};

// Create a jersey mutation hook
export const useCreateJersey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jerseyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jerseys"] });
    },
    onError: (error) => {
      console.error("Error creating jersey:", error);
    },
  });
};
