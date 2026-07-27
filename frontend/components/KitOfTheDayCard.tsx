import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useJerseyOfTheDay } from "@/hooks/useJerseyHook";

export default function KitOfTheDayCard() {
  const router = useRouter();
  const { data: jersey, isLoading } = useJerseyOfTheDay();
  const [imageFailed, setImageFailed] = useState(false);

  // Sécurisation de l'URL comme dans CardCollection
  const imageUri = useMemo(() => {
    return jersey?.frontImageUrl?.trim() || jersey?.frontImage?.trim() || "";
  }, [jersey?.frontImageUrl, jersey?.frontImage]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.theme.primary} />
      </View>
    );
  }

  if (!jersey) return null;

  const generateTag = () => {
    const club = jersey.club.name.substring(0, 3).toUpperCase();
    const season = jersey.season ? jersey.season.slice(-2) : "XX";
    const type = jersey.type ? jersey.type.charAt(0).toUpperCase() : "X";
    return `${club}-${season}-${type}`;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={14} color={Colors.theme.primary} />
        <Text style={styles.headerTitle}>KIT OF THE DAY</Text>
      </View>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        // onPress={() => router.push(`/jersey/${jersey.id}`)}
      >
        {/* Container Image avec gestion du fallback si l'image échoue */}
        <View style={styles.imageContainer}>
          {imageUri && !imageFailed ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
              onLoad={() => console.log("IMAGE CHARGÉE AVEC SUCCÈS 🎉")}
              onError={(e) =>
                console.log(
                  "ERREUR EXACTE iOS 🚨:",
                  JSON.stringify(e.nativeEvent, null, 2),
                )
              }
            />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons name="shirt-outline" size={24} color="#8E8E93" />
            </View>
          )}
        </View>

        {/* Infos à droite */}
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.tag}>{generateTag()}</Text>
            <Text style={styles.clubName} numberOfLines={1}>
              {jersey.club.name}
            </Text>
            <Text style={styles.seasonType}>
              {jersey.season} / {jersey.type.toLowerCase()}
            </Text>

            <Text style={styles.story} numberOfLines={2}>
              {jersey.story}
            </Text>
          </View>

          <Text style={styles.readMore}>READ THE STORY ➔</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  headerTitle: {
    color: Colors.theme.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.theme.surface,
    borderWidth: 1,
    borderColor: Colors.theme.primary,
    borderRadius: 16,
    padding: 12,
    gap: 16,
  },
  imageContainer: {
    width: 100,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151515",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  tag: {
    color: Colors.theme.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clubName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  seasonType: {
    color: Colors.theme.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  story: {
    color: "#D1D5DB",
    fontSize: 12,
    lineHeight: 18,
  },
  readMore: {
    color: Colors.theme.primary,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
});
