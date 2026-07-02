import CardCollection, {
  CardCollectionProps,
} from "@/components/CardCollection";
import { Colors } from "@/constants/Colors";
import { useJerseys } from "@/hooks/useJerseyHook";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TabOneScreen() {
  const router = useRouter();
  const { data: jerseys, isLoading } = useJerseys();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>HOME</Text>
        <TouchableOpacity
          style={styles.ctaCard}
          activeOpacity={0.8}
          onPress={() => router.push("/add")}
        >
          {/* Left part : texts */}
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>GOT A NEW KIT?</Text>
            <Text style={styles.ctaSubtitle}>
              Scan or add a new jersey to your Locker.
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
        <Text style={styles.lastAdded}>Last added to Locker</Text>
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
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 30,
    marginBottom: 10,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});
