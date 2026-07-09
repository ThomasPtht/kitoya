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
import { LinearGradient } from "expo-linear-gradient";

export interface CardCollectionProps {
  jersey: {
    id: string;
    frontImageUrl?: string | null;
    frontImage?: string | null;
    club: { name: string };
    season?: string | null;
  };
  width?: DimensionValue;
  onPress?: () => void;
  size?: "small" | "normal";
}

export default function CardCollection({
  jersey,
  width = "100%",
  onPress,
  size = "normal",
}: CardCollectionProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUri = useMemo(() => {
    return jersey.frontImageUrl?.trim() || jersey.frontImage?.trim() || "";
  }, [jersey.frontImageUrl, jersey.frontImage]);

  const cardHeight = size === "small" ? 100 : 180;
  const textSize = size === "small" ? 12 : 16;

  return (
    <Pressable style={[styles.cardContainer, { width }]} onPress={onPress}>
      <LinearGradient
        // 1. Utilise un dégradé qui part d'une couleur très légère (plus proche du blanc ou d'un vert très pâle)
        // 2. Transparence forte pour que ça reste subtil
        colors={["rgba(255, 255, 255, 0.1)", "transparent"]}
        // 3. Modifie le "start" et "end" pour que la lumière soit concentrée
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={styles.glowBackground}
      />
      {imageUri && !imageFailed ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { height: cardHeight }]}
          resizeMode="contain"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackText}>No image</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.clubName, { fontSize: textSize }]}>
          {jersey.club.name}
        </Text>
        <Text style={[styles.season, { fontSize: textSize }]}>
          {jersey.season}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.45)",
    backgroundColor: "#050806",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",

    // halo effect for iOS
    shadowColor: "rgba(127, 206, 175, 0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5, // For Android shadow effect
    position: "relative",
  },
  glowBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: "100%",
    padding: 4,
    height: 180,
    // backgroundColor: Colors.theme.primaryTint,
  },
  imageFallback: {
    width: "100%",
    height: 180,
    // backgroundColor: Colors.theme.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 12,
    backgroundColor: "#151515", // Ensure the content area has a solid background
  },
  imageFallbackText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
  },
  clubName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "300",
  },
  season: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "300",
  },
});
