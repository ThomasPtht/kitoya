import { Colors } from "@/constants/Colors";
import { apiClient } from "@/services/api";
import { JerseyData } from "@/services/jersey.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";

interface JerseyDetailProps {
  jersey: JerseyData;
  onClose: () => void;
}

export default function JerseyDetail({ jersey, onClose }: JerseyDetailProps) {
  const imageUrl = jersey.frontImageUrl || jersey.frontImageUri;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/jerseys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jerseys"] });
      onClose(); // Close the modal after deletion
      Toast.show({
        type: "success",
        text1: "Jersey deleted",
        text2: "The jersey has been removed from your collection.",
        position: "bottom",
      });
    },
    onError: (error) => {
      console.error("Error deleting jersey:", error);
      Alert.alert(
        "Error",
        "There was an error deleting the jersey. Please try again.",
      );
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Jersey",
      "Are you sure you want to delete this jersey from your collection ?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => mutation.mutate(jersey.id as string),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Jersey details</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholder}>No image available</Text>
          )}
        </View>

        {/* Informations */}
        <View style={styles.infoSection}>
          <Text style={styles.clubName}>
            {jersey.club?.name || "Club Unknown"}
          </Text>
          <Text style={styles.season}>{jersey.season}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{jersey.type}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Condition</Text>
            <Text style={styles.value}>{jersey.condition}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Size</Text>
            <Text style={styles.value}>{jersey.size}</Text>
          </View>
          {jersey.playerName && (
            <View style={styles.row}>
              <Text style={styles.label}>Player</Text>
              <Text style={styles.value}>{jersey.playerName}</Text>
            </View>
          )}
          {jersey.number && (
            <View style={styles.row}>
              <Text style={styles.label}>Number</Text>
              <Text style={styles.value}>{jersey.number}</Text>
            </View>
          )}
          {jersey.version && (
            <View style={styles.row}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>{jersey.version}</Text>
            </View>
          )}

          {jersey.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{jersey.description}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.deleteButton, mutation.isPending && { opacity: 0.5 }]}
          onPress={handleDelete}
          disabled={mutation.isPending}
        >
          <Text style={styles.deleteButtonText}>Delete from collection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.theme.text,
    margin: 20,
  },
  scrollContent: { padding: 20 },
  imageContainer: {
    backgroundColor: Colors.theme.primaryTint,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  image: { width: "100%", height: 300 },
  placeholder: { color: "#8E8E93", paddingVertical: 120 },
  infoSection: { backgroundColor: "#1E1E1E", borderRadius: 20, padding: 20 },
  clubName: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF" },
  season: { fontSize: 18, color: "#8E8E93", marginBottom: 15 },
  divider: { height: 1, backgroundColor: "#2C2C2E", marginBottom: 15 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: { color: "#8E8E93", fontSize: 16 },
  value: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  deleteButton: {
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#2C1E1E",
    alignItems: "center",
    marginBottom: 40,
  },
  deleteButtonText: {
    color: "#FF453A",
    fontSize: 16,
    fontWeight: "700",
  },
});
