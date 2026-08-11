import { apiClient } from "./api";

export const feedbackService = {
  sendFeedback: async (data: {
    type: "Question" | "Bug" | "Feature";
    message: string;
    email?: string;
  }) => {
    const response = await apiClient.post("/feedback", data);
    return response.data;
  },
};
