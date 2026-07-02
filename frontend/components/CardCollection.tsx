import { Colors } from "@/constants/Colors";
import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  type DimensionValue,
} from "react-native";

interface CardCollectionProps {
  jersey: {
    frontImageUrl?: string | null;
    frontImage?: string | null;
    club: { name: string };
    season?: string | null;
  };
  width?: DimensionValue;
  onPress?: () => void;
}

export default function CardCollection({
  jersey,
  width = "100%",
  onPress,
}: CardCollectionProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUri = useMemo(() => {
    return jersey.frontImageUrl?.trim() || jersey.frontImage?.trim() || "";
  }, [jersey.frontImageUrl, jersey.frontImage]);

  return (
    <Pressable style={[styles.cardContainer, { width }]} onPress={onPress}>
      {imageUri && !imageFailed ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackText}>No image</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.clubName}>{jersey.club.name}</Text>
        <Text style={styles.season}>{jersey.season}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: Colors.theme.primary,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    padding: 8,
    height: 180,
    backgroundColor: Colors.theme.primaryTint,
  },
  imageFallback: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.theme.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 12,
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
