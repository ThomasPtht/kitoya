import { lockerService } from "@/services/locker.service";
import { useQuery } from "@tanstack/react-query";

export const useLocker = (username: string) => {
  return useQuery({
    queryKey: ["locker", username],
    queryFn: () => lockerService.getPublicLocker(username),
    enabled: !!username, // Launch the query only if username is not empty
  });
};
