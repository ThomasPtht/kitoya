import { apiClient } from "./api";

export const stripeService = {
  createSubscription: async (
    plan: string = "ELITE",
    interval: "month" | "year" = "month",
  ) => {
    const { data } = await apiClient.post("/stripe/create-subscription", {
      plan,
      interval, // Envoie 'month' par défaut
    });
    return data;
  },
};
