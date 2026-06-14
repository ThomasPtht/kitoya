import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TabOneScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* */}
      // touchableopacity allow
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>HOME</Text>
        <TouchableOpacity
          style={styles.ctaCard}
          activeOpacity={0.8}
          onPress={() => router.push("/modal")}
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

        {/* <View style={styles.lastAddedContainer}>
          <Text style={styles.ctaTitle}>Your last jersey added</Text>
        </View> */}
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
});
