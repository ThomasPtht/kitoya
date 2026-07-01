import Colors from "@/constants/Colors";
import React, { useMemo, useState } from "react";
import { View, StyleSheet, Text, Image } from "react-native";

interface CardCollectionProps {
  jersey: {
    frontImageUrl?: string | null;
    frontImage?: string | null;
    club: { name: string };
    season?: string | null;
  };
}

export default function CardCollection({ jersey }: CardCollectionProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUri = useMemo(() => {
    return jersey.frontImageUrl?.trim() || jersey.frontImage?.trim() || "";
  }, [jersey.frontImageUrl, jersey.frontImage]);

  return (
    <View style={styles.cardContainer}>
      {imageUri && !imageFailed ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackText}>No image</Text>
        </View>
      )}
      <Text style={styles.clubName}>{jersey.club.name}</Text>
      <Text style={styles.season}>{jersey.season}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: "#2C2C2E",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#2C2C2E",
  },
  imageFallback: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
  },
  clubName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  season: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 4,
  },
});
