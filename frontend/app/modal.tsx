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
  const cameraRef = React.useRef<CameraView>(null); // create a ref to the CameraView component

  if (!permission) {
    // White temporary screen while we check permissions
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            Kitoya needs access to your camera to let you scan new kits and add
            them to your locker.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Authorize Camera Access
            </Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.8, skipProcessing: false };
        const photo = await cameraRef.current.takePictureAsync(options);
        console.log("Picture taken:", photo?.uri);

        router.back();
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* On ajoute l'attribut ref={cameraRef} indispensable pour la capture */}
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* close button to dismiss the modal and go back to the previous screen */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="times" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* UI of the picture frame with a hint text */}
        <View style={styles.overlayContainer}>
          <View style={styles.scannerTarget} />
          <Text style={styles.hintText}>
            Align the kit within the frame to take a picture
          </Text>
        </View>

        {/* button to take a picture and call the takePicture function */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
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
    justifyContent: "space-between",
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
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
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  scannerTarget: {
    width: 320,
    height: 420,
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
  actionContainer: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
    paddingTop: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
  },
});
