import CardCollection from "@/components/CardCollection";
import { Colors } from "@/constants/Colors";
import {
  useJerseyCount,
  useJerseys,
  useMostRepresentedClub,
} from "@/hooks/useJerseyHook";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

export default function TabOneScreen() {
  const router = useRouter();
  const { data: jerseys, isLoading } = useJerseys();
  const { data: count } = useJerseyCount();
  const { data: club, isLoading: isClubLoading } = useMostRepresentedClub();
  console.log("Donnée reçue par le composant :", club);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* <Text style={styles.title}>HOME</Text> */}
        <TouchableOpacity
          style={styles.ctaCard}
          activeOpacity={0.8}
          onPress={() => router.push("/add")}
        >
          {/* Left part : texts */}
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>GOT A NEW KIT ?</Text>
            <Text style={styles.ctaSubtitle}>
              Add a new jersey to your Locker.
            </Text>
          </View>

          {/* right part : camera icon and + */}
          <View style={styles.ctaIconContainer}>
            <FontAwesome name="camera" size={20} color={Colors.theme.primary} />
            <View style={styles.plusBadge}>
              <FontAwesome
                name="plus"
                size={10}
                color={Colors.theme.background}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Last added to Locker section */}
        <Text style={styles.lastAdded}>LAST ADDED TO LOCKER</Text>
        {isLoading ? (
          <ActivityIndicator color={Colors.theme.primary} />
        ) : (
          <View style={styles.cardsRow}>
            {jerseys?.slice(0, 3).map((jersey) => (
              <CardCollection
                key={jersey.id}
                jersey={jersey}
                width="30%"
                size="small"
              />
            ))}
          </View>
        )}

        <View style={styles.containerTitleKit}>
          <Ionicons
            name="sparkles-outline"
            size={14}
            color={Colors.theme.primary}
          />
          <Text style={styles.kitDay}>KIT OF THE DAY</Text>
        </View>

        <Text style={styles.collectionTitle}>YOUR COLLECTION AT A GLANCE</Text>
        <View style={styles.containerStats}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Kits</Text>
            <View style={styles.statValueContainer}>
              <Ionicons
                name="shirt-outline"
                size={32}
                color={Colors.theme.primary}
              />
              <Text style={styles.statValue}>{count ?? 0}</Text>
            </View>
          </View>

          {/* Carte Top Team */}
          <View style={styles.statCard}>
            {/* Logo en arrière-plan */}
            {club?.logoUrl && (
              <Image
                source={{ uri: club.logoUrl }}
                style={styles.bgLogo}
                resizeMode="contain"
              />
            )}

            <Text style={styles.statLabel}>Top Team</Text>

            {isClubLoading ? (
              <ActivityIndicator size="small" color={Colors.theme.primary} />
            ) : (
              <>
                <Text style={[styles.statValue, { fontSize: 20 }]}>
                  {club?.name ?? "N/A"}
                </Text>
                <Text style={styles.statSubValue}>
                  {club?.count === 1 ? "1 kit" : `${club?.count ?? 0} kits`}
                </Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.theme.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  title: {
    color: Colors.theme.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  ctaCard: {
    flexDirection: "row",
    backgroundColor: Colors.theme.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.theme.primary,

    // halo effect for iOS
    shadowColor: Colors.theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,

    // halo effect for Android (not as precise as iOS shadows, but it adds a nice glow)
    elevation: 8,
  },
  ctaTextContainer: {
    flex: 1,
    padding: 10,
    marginRight: 15,
  },
  ctaTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ctaSubtitle: {
    color: Colors.theme.textMuted,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
  },
  ctaIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.theme.primaryTint,
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // Necessary to position the plus badge absolutely within this container
  },
  plusBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: Colors.theme.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  lastAdded: {
    color: "rgb(161 161 170)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 30,
    marginBottom: 10,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    marginTop: 10,
  },
  containerTotalKits: {
    borderWidth: 1,
    borderColor: Colors.theme.primary,
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  containerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    marginTop: 20,
    paddingHorizontal: 0,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.theme.surface,
    borderWidth: 1,
    borderColor: Colors.theme.primary,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "48%",
    height: 120,
    overflow: "hidden",
  },
  statLabel: {
    color: Colors.theme.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  clubLogo: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: Colors.theme.primary,
    backgroundColor: "#fff",
  },
  iconStyle: {
    marginVertical: 5,
  },
  statValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  statSubValue: {
    color: Colors.theme.primary,
    fontSize: 14,
    marginTop: 4,
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  collectionTitle: {
    color: "rgb(161 161 170)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  bgLogo: {
    position: "absolute",
    width: 110,
    height: 110,
    opacity: 0.1,
    // transform: [{ rotate: "-15deg" }],
  },
  kitDay: {
    color: Colors.theme.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  containerTitleKit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 10,
  },
});
