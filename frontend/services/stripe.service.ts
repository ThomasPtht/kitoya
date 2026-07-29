import { apiClient } from "./api";

export const stripeService = {
  createSubscription: async (plan: string) => {
    const { data } = await apiClient.post("/stripe/create-subscription", {
      plan,
    });
    return data;
  },
};
