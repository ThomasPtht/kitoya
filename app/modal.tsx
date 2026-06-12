import { Colors } from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CameraModal() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // White tempory screen while we check permissions
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            Kitroom needs access to your camera to let you scan new kits and add
            them to your locker.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              {" "}
              Autorize Camera Access{" "}
            </Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        {/* close button to dismiss the modal and go back to the previous screen */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="times" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* UI DU SCANNER */}
        <View style={styles.overlayContainer}>
          <View style={styles.scannerTarget} />
          <Text style={styles.hintText}>Cadre le maillot ou l'étiquette</Text>
        </View>
      </CameraView>

      {/* Force icons and status bar to be light to be visible on the dark camera view */}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  permissionBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  permissionText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: Colors.theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: Colors.theme.background,
    fontWeight: "700",
    fontSize: 15,
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40, // adaptation for status bar height on iOS and Android
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerTarget: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: Colors.theme.primary,
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  hintText: {
    color: "#FFFFFF",
    marginTop: 25,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
