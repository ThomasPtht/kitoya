import { authService } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";

export const useUserMe = () => {
  return useQuery({
    queryKey: ["userMe"],
    queryFn: authService.getUserInfo,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
