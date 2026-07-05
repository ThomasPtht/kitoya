import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { router } from "expo-router";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { authService } from "@/services/auth.service";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // inject custom drawer content to include the logout button
        drawerContent={(props) => (
          <DrawerContentScrollView
            {...props}
            style={{ backgroundColor: "#121212" }}
            contentContainerStyle={styles.scrollContainer}
          >
            <View style={{ flex: 1 }}>
              <DrawerItemList {...props} />

              {/* settings button on top of the drawer items */}
              <Pressable
                style={[
                  styles.logoutButton,
                  { paddingHorizontal: 20, marginTop: 10 },
                ]}
                onPress={() => {
                  props.navigation.closeDrawer();
                  router.push("/settings");
                }}
              >
                <Feather name="settings" size={18} color="#ffffff" />
                <Text
                  style={[
                    styles.logoutText,
                    { textTransform: "capitalize", fontSize: 18 },
                  ]}
                >
                  Settings
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/subscription");
              }}
              style={({ pressed }) => [
                styles.upgradeContainer, // On applique le style du conteneur ici
                { opacity: pressed ? 0.8 : 1 }, // L'effet visuel s'applique désormais sur TOUT le bloc au toucher
              ]}
            >
              <Text style={styles.upgradeText}>Unlock Full Access</Text>

              {/* Ce View remplace l'ancien Pressable interne pour garder le même design de bouton */}
              <View style={styles.subButton}>
                <Text style={styles.subText}>Level Up</Text>
              </View>
            </Pressable>

            {/* bottom zone of the drawer with the logout button */}
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
                <Feather name="log-out" size={20} color="#ffffff" />
                <Text
                  style={[
                    styles.logoutText,
                    { textTransform: "uppercase", fontSize: 18 },
                  ]}
                >
                  Logout
                </Text>
              </Pressable>
            </View>
          </DrawerContentScrollView>
        )}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#121212",
            width: 280,
          },
          drawerActiveTintColor: "#05C785",
          drawerInactiveTintColor: "#ffffff",

          drawerLabelStyle: {
            fontSize: 18,
            textTransform: "capitalize",
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
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingVertical: 10,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  upgradeContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  ctaButton: {
    backgroundColor: "#05C785",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
  },
  subText: {
    color: "#05C785",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
  },
  subButton: {
    backgroundColor: "#121212",
    paddingVertical: 2,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
