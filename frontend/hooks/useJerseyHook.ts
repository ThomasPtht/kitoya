import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jerseyService } from "@/services/jersey.service";
import { sportsService } from "@/services/sport.service";

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
    mutationFn: (data: FormData) => jerseyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jerseys"] });
      queryClient.invalidateQueries({ queryKey: ["jerseyCount"] });
      queryClient.invalidateQueries({ queryKey: ["mostRepresentedClub"] });
      
    },
    onError: (error) => {
      console.error("Error creating jersey:", error);
    },
  });
};

export const useJerseyCount = () => {
  return useQuery({
    queryKey: ["jerseyCount"],
    queryFn: async () => {
      const count = await jerseyService.getTotalJerseysCount();
      return count !== undefined ? count : 0; // Return 0 if count is undefined
    },
  });
};

export const useMostRepresentedClub = () => {
  return useQuery({
    queryKey: ["mostRepresentedClub"],
    queryFn: async () => {
      const club = await jerseyService.getMostRepresentedClub();
      return club;
    },
  });
};

export const useSports = () => {
  return useQuery({
    queryKey: ["sports"],
    queryFn: sportsService.getSports,
  });
};
