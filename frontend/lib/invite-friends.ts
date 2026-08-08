import { Share } from "react-native";

export const handleInviteFriends = async (navigation: any) => {
  try {
    navigation?.closeDrawer();
    await Share.share({
      message:
        "Check out Kitroom, the ultimate app to catalog, manage, and showcase your football shirt collection! ⚽🔥\n\n" +
        "Download the app here: https://kitroom.app",
    });
  } catch (error: any) {
    console.error("Error sharing:", error.message);
  }
};
