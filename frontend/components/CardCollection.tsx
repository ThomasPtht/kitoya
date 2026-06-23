import Colors from "@/constants/Colors";
import React from "react";
import { View, StyleSheet, Text, Image } from "react-native";

interface CardCollectionProps {
  jersey: {
    frontImageUrl: string;
    club: { name: string };
    season: string;
  };
}

export default function CardCollection({ jersey }: CardCollectionProps) {
  return (
    <View style={styles.cardContainer}>
      <Image
        source={{ uri: jersey.frontImageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
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
