import { Share } from "react-native";

export const handleInviteFriends = async (navigation: any) => {
  try {
    navigation?.closeDrawer();
    await Share.share({
      message:
        "Check out Kitoya, the ultimate app to catalog, manage, and showcase your football shirt collection! ⚽🔥\n\n" +
        "Download the app here: https://kitoya.com",
    });
  } catch (error: any) {
    console.error("Error sharing:", error.message);
  }
};
