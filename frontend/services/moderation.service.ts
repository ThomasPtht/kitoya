import { apiClient } from "./api";

export type ReportTargetType = "USER" | "JERSEY";
export type ReportReason =
  | "SPAM"
  | "INAPPROPRIATE"
  | "HARASSMENT"
  | "FAKE"
  | "OTHER";

export const REPORT_REASONS: ReportReason[] = [
  "INAPPROPRIATE",
  "HARASSMENT",
  "SPAM",
  "FAKE",
  "OTHER",
];

export const moderationService = {
  async report(data: {
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
  }) {
    const response = await apiClient.post("/moderation/report", data);
    return response.data;
  },

  async blockUser(userId: string) {
    const response = await apiClient.post(`/moderation/block/${userId}`);
    return response.data;
  },

  async unblockUser(userId: string) {
    const response = await apiClient.delete(`/moderation/block/${userId}`);
    return response.data;
  },

  async getBlockedUsers(): Promise<{ id: string; username: string }[]> {
    const response = await apiClient.get("/moderation/blocks");
    return response.data;
  },
};
