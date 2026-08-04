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
import { useJerseyOfTheDay, useToggleLikeJersey } from "@/hooks/useJerseyHook";
// Assure-toi que ce chemin est correct
import KitOfTheDayModal from "./KitOfTheDayModal";

export default function KitOfTheDayCard() {
  const { data: jersey, isLoading } = useJerseyOfTheDay();
  const [imageFailed, setImageFailed] = useState(false);
  const { mutate: toggleLike, isPending: isLiking } = useToggleLikeJersey();

  // État pour contrôler l'ouverture de la modale
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  // Si pas de maillot ou pas de données utilisateur associées, on ne rend rien
  if (!jersey || !jersey.user) return null;

  const generateTag = () => {
    const club = jersey.club.name.substring(0, 3).toUpperCase();
    const season = jersey.season ? jersey.season.slice(-2) : "XX";
    const type = jersey.type ? jersey.type.charAt(0).toUpperCase() : "X";
    return `${club}-${season}-${type}`;
  };

  return (
    <>
      <View style={styles.wrapper}>
        {/* En-tête Titre */}
        <View style={styles.header}>
          <Ionicons name="sparkles" size={14} color={Colors.theme.primary} />
          <Text style={styles.headerTitle}>KIT OF THE COMMUNITY</Text>
        </View>

        {/* Carte principale avec bordure */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => setIsModalVisible(true)} // Ouvre la modale au clic sur la carte
        >
          {/* Contenu principal (Image + Infos) */}
          <View style={styles.mainContent}>
            {/* Container Image */}
            <View style={styles.imageContainer}>
              {imageUri && !imageFailed ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => setImageFailed(true)}
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
                  {jersey.season} / {jersey.type?.toLowerCase()}
                </Text>

                <Text style={styles.story} numberOfLines={2}>
                  {jersey.story}
                </Text>
              </View>

              <Text style={styles.readMore}>READ THE STORY →</Text>
            </View>
          </View>

          {/* Ligne de séparation */}
          <View style={styles.divider} />

          {/* Pied de page de la carte (Auteur + Like) */}
          <View style={styles.footerContainer}>
            <View style={styles.authorContainer}>
              <View style={styles.iconTshirtContainer}>
                <Ionicons
                  name="shirt-outline"
                  size={16}
                  color={Colors.theme.primary}
                />
              </View>
              <Text style={styles.authorText}>
                From{" "}
                <Text style={styles.authorUsername}>
                  @{jersey.user.username}
                </Text>
                's locker
              </Text>
            </View>

            {/* Like button (Désactivé pendant l'action) */}
            <TouchableOpacity
              style={[
                styles.likeButtonFooter,
                jersey.hasLiked
                  ? styles.likedBackground
                  : styles.notLikedBackground,
              ]}
              activeOpacity={0.7}
              disabled={isLiking}
              onPress={() => {
                toggleLike(jersey.id);
              }}
            >
              <Ionicons
                name={jersey.hasLiked ? "heart" : "heart"} // Changé pour toujours 'heart' comme dans l'image
                size={16}
                color={jersey.hasLiked ? "#05C785" : Colors.theme.textMuted} // Vert si liké, gris sinon
              />
              <Text
                style={[
                  styles.likesCountText,
                  jersey.hasLiked ? styles.likedText : styles.notLikedText,
                ]}
              >
                {jersey.likesCount ?? 0}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* Intégration de la modale */}
      <KitOfTheDayModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        jersey={jersey}
        onToggleLike={(id) => toggleLike(id)}
      />
    </>
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
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerTitle: {
    color: Colors.theme.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.theme.surface,
    borderWidth: 1,
    borderColor: Colors.theme.primary, // Bordure verte
    borderRadius: 20, // Plus arrondi comme sur l'image
    padding: 0, // Padding à 0 car on gère les paddings internes
    overflow: "hidden", // Important pour que le footer respecte le radius
  },
  mainContent: {
    flexDirection: "row",
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
  divider: {
    height: 1,
    backgroundColor: Colors.theme.primary, // Ligne de séparation verte
    opacity: 0.3,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(5, 199, 133, 0.05)", // Fond vert très clair pour le footer
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconTshirtContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(5, 199, 133, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  authorText: {
    color: Colors.theme.textMuted,
    fontSize: 13,
  },
  authorUsername: {
    color: Colors.theme.primary, // Pseudo en vert
    fontWeight: "600",
  },
  // Styles spécifiques au bouton like du footer
  likeButtonFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16, // Très arrondi
    borderWidth: 1,
  },
  notLikedBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  likedBackground: {
    backgroundColor: "rgba(5, 199, 133, 0.15)", // Fond vert pâle si liké
    borderColor: "rgba(5, 199, 133, 0.3)",
  },
  likesCountText: {
    fontSize: 13,
    fontWeight: "700",
  },
  notLikedText: {
    color: Colors.theme.textMuted,
  },
  likedText: {
    color: "#05C785", // Texte du compteur vert si liké
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
});
