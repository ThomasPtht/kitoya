import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { router } from "expo-router";
import { View, StyleSheet, Text, Pressable } from "react-native";
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
            contentContainerStyle={styles.scrollContainer}
          >
            {/* top zone, display the list of screens automatically */}
            <View style={styles.mainContent}>
              <DrawerItemList {...props} />
            </View>

            {/* bottom zone, display the logout button  */}
            <View style={styles.footer}>
              <Pressable
                style={styles.logoutButton}
                onPress={async () => {
                  try {
                    await authService.logout();

                    router.replace("/(auth)/login");
                  } catch (error) {
                    console.error("Logout failed:", error);
                    router.replace("/(auth)/login");
                  }
                }}
              >
                <Feather name="log-out" size={20} color="#ffff" />
                <Text style={styles.logoutText}> Logout</Text>
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
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{ drawerItemStyle: { display: "none" } }}
        />

        {/* Settings */}
        <Drawer.Screen
          name="settings-link"
          listeners={{
            drawerItemPress: (e) => {
              e.preventDefault();
              router.push("/settings");
            },
          }}
          options={{
            drawerLabel: "Settings",
            title: "Settings",
            drawerIcon: ({ color, size }) => (
              <Feather name="settings" size={size} color={color} />
            ),
          }}
        />

        {/* Add other screens here if needed */}
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  mainContent: {
    flex: 1,
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
    color: "#FFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
