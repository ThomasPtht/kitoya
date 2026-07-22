import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { router } from "expo-router";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { authService } from "@/services/auth.service";
import { useUserMe } from "@/hooks/useAuthHook";

export default function DrawerLayout() {
  const { data: userMe } = useUserMe();

  // Extract initials for the avatar if name exists
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = userMe?.name || userMe?.username || "Collector";
  const displayEmail = userMe?.email || "user@kitroom.app";
  const userInitials = getInitials(displayName);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => (
          <DrawerContentScrollView
            {...props}
            style={{ backgroundColor: "#121212" }}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* User Profile Header Section */}
            <View style={styles.userProfileSection}>
              <View style={styles.userTopRow}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{userInitials}</Text>
                </View>
                <View style={styles.userInfoText}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {displayEmail}
                  </Text>
                </View>
              </View>

              <View style={styles.badgeContainer}>
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={14}
                  color="#05C785"
                />
                <Text style={styles.badgeText}>COLLECTOR</Text>
                <Text style={styles.badgePoints}>• 150 pts</Text>
              </View>
            </View>

            {/* Top Upgrade / Pro Card */}
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/subscription");
              }}
              style={({ pressed }) => [
                styles.upgradeContainer,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={styles.upgradeHeader}>
                <Feather name="zap" size={14} color="#05C785" />
                <Text style={styles.upgradeBadge}>KITROOM PRO</Text>
              </View>

              <Text style={styles.upgradeTitle}>Unlock the full archive</Text>

              <View style={styles.featureList}>
                <Text style={styles.featureItem}>
                  • Unlimited wishlist & price alerts
                </Text>
                <Text style={styles.featureItem}>
                  • PDF export for insurance
                </Text>
                <Text style={styles.featureItem}>
                  • Advanced tags & filters
                </Text>
              </View>

              <View style={styles.subButton}>
                <Text style={styles.subText}>Upgrade</Text>
                <Feather name="arrow-right" size={14} color="#121212" />
              </View>
            </Pressable>

            {/* Navigation Links Group */}
            <View style={styles.navSection}>
              <DrawerItemList {...props} />

              <Pressable
                style={styles.navItem}
                onPress={() => {
                  props.navigation.closeDrawer();
                  router.push("/settings");
                }}
              >
                <Feather name="settings" size={18} color="#ffffff" />
                <Text style={styles.navText}>Settings</Text>
              </Pressable>

              <Pressable
                style={styles.navItem}
                onPress={() => {
                  props.navigation.closeDrawer();
                  router.push("/exportCollection");
                }}
              >
                <Feather name="download" size={18} color="#ffffff" />
                <Text style={styles.navText}>Export collection</Text>
              </Pressable>

              <Pressable
                style={styles.navItem}
                onPress={() => {
                  props.navigation.closeDrawer();
                  router.push("/help");
                }}
              >
                <AntDesign name="question-circle" size={18} color="#ffffff" />
                <Text style={styles.navText}>Help & feedback</Text>
              </Pressable>
            </View>

            {/* Bottom Footer with Logout */}
            <View style={styles.footer}>
              <Pressable
                style={styles.logoutButton}
                onPress={async () => {
                  try {
                    props.navigation.closeDrawer();
                    await authService.logout();
                    router.replace("/(auth)/login");
                  } catch (error) {
                    console.error("Logout failed:", error);
                    router.replace("/(auth)/login");
                  }
                }}
              >
                <Feather name="log-out" size={18} color="#FF4D4D" />
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </View>
          </DrawerContentScrollView>
        )}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#121212",
            width: 290,
          },
          drawerActiveTintColor: "#05C785",
          drawerInactiveTintColor: "#ffffff",
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: "500",
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{ drawerItemStyle: { display: "none" } }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 12,
    paddingTop: 65, // Augmenté à 65 pour passer largement sous la status bar de l'iPhone (Dynamic Island / Notch)
  },
  userProfileSection: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  userTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#05C785",
    backgroundColor: "#161E1A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#05C785",
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 2,
  },
  userEmail: {
    color: "#888888",
    fontSize: 13,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E1A",
    borderWidth: 1,
    borderColor: "#05C785",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    gap: 6,
  },
  badgeText: {
    color: "#05C785",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  badgePoints: {
    color: "#AAAAAA",
    fontSize: 11,
  },
  upgradeContainer: {
    backgroundColor: "#141C17",
    borderColor: "#05C785",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    marginBottom: 20,
    shadowColor: "#05C785",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  upgradeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  upgradeBadge: {
    color: "#05C785",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  upgradeTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  featureList: {
    gap: 4,
    marginBottom: 14,
  },
  featureItem: {
    color: "#AAAAAA",
    fontSize: 12,
  },
  subButton: {
    backgroundColor: "#05C785",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  subText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 13,
  },
  navSection: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingVertical: 8,
  },
  logoutText: {
    color: "#FF4D4D",
    fontSize: 16,
    fontWeight: "500",
  },
});
