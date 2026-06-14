import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false, // hide the header for all screens in the drawer
          drawerStyle: {
            backgroundColor: "#121212",
            width: 280,
          },
          drawerActiveTintColor: "#05C785",
          drawerInactiveTintColor: "#ffffff",
        }}
      >
        // Main screen of the app, hidden from the drawer menu
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        {/* settings screen displayed in the drawer menu */}
        <Drawer.Screen
          name="settings-link"
          options={{
            drawerLabel: "Paramètres",
            headerShown: true, 
            headerStyle: { backgroundColor: "#121212" },
            headerTintColor: "#ffffff",
            title: "Paramètres",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
