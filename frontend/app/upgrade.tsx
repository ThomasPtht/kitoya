import React, { useState } from "react";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSubscription } from "@/hooks/useSubscription";

type IntervalKey = "month" | "year";

export default function UpgradeScreen() {
  const [selectedInterval, setSelectedInterval] = useState<IntervalKey>("year");
  const [loading, setLoading] = useState(false);

  // Hook RevenueCat
  const { packages, purchasePackage, restorePurchases, isElite } =
    useSubscription();

  // Si l'utilisateur est déjà ELITE, on peut afficher un écran de succès direct ou un message
  if (isElite) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Feather name="check-circle" size={64} color="#D4AF37" />
        <Text style={styles.mainTitle}>You are a Kitroom ELITE member!</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.back()}
        >
          <Text style={styles.ctaButtonText}>Back to App</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSubscribe = async () => {
    // Trouve le package correspondant dans ceux renvoyés par RevenueCat
    // (Par convention RevenueCat identifie souvent les abonnements par durée ou type)
    const targetPackage = packages.find((pkg) => {
      if (selectedInterval === "year") {
        return (
          pkg.packageType === "ANNUAL" ||
          pkg.product.identifier.includes("annual")
        );
      } else {
        return (
          pkg.packageType === "MONTHLY" ||
          pkg.product.identifier.includes("monthly")
        );
      }
    });

    // Si on est en mode Expo Go ou si les packages ne sont pas chargés, fallback de sécurité
    if (!targetPackage) {
      Toast.show({
        type: "error",
        text1: "Subscription package not available right now.",
      });
      return;
    }

    setLoading(true);
    try {
      await purchasePackage(targetPackage);
      // Le hook gère déjà les alertes de succès/erreur, on peut juste fermer si c'est bon
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message || "An error occurred during purchase",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with close button */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Feather name="x" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Subtitle */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Take Your Collection Further</Text>
          <Text style={styles.subtitle}>
            Organize your jerseys, fill your digital locker, and showcase your
            passion without limits.
          </Text>
        </View>

        {/* Subscription Options (Yearly / Monthly) */}
        <View style={styles.plansContainer}>
          {/* Yearly Option */}
          <Pressable
            onPress={() => setSelectedInterval("year")}
            style={[
              styles.planCard,
              selectedInterval === "year" && styles.planCardSelected,
            ]}
          >
            <View style={styles.badgeContainer}>
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Popular</Text>
              </View>
            </View>

            <View style={styles.planInfoRow}>
              <View>
                <Text style={styles.planTitle}>Annual</Text>
                <Text style={styles.planSubtext}>Billed as €39.99/year</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.oldPrice}>€9.99</Text>
                <Text style={styles.priceHighlight}>
                  €3.33<Text style={styles.perPeriod}>/mo</Text>
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Monthly Option */}
          <Pressable
            onPress={() => setSelectedInterval("month")}
            style={[
              styles.planCard,
              selectedInterval === "month" && styles.planCardSelected,
            ]}
          >
            <View style={styles.planInfoRow}>
              <View>
                <Text style={styles.planTitle}>Monthly</Text>
                <Text style={styles.planSubtext}>Cancel anytime</Text>
              </View>
              <Text style={styles.priceHighlight}>
                €4.99<Text style={styles.perPeriod}>/mo</Text>
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresHeaderTitle}>
            Everything a true collector needs
          </Text>

          <View style={styles.featureRow}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="hanger" size={20} color="#D4AF37" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Unlimited Slots</Text>
              <Text style={styles.featureDesc}>
                Add every home, away, and third kit to your digital room.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIconContainer}>
              <Feather name="bar-chart-2" size={20} color="#D4AF37" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Advanced Stats</Text>
              <Text style={styles.featureDesc}>
                Break down your kit collection by clubs, brands, and seasons.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIconContainer}>
              <Feather name="download" size={20} color="#D4AF37" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Collection Export</Text>
              <Text style={styles.featureDesc}>
                Export clean catalogs of your sports jerseys instantly.
              </Text>
            </View>
          </View>
        </View>

        {/* Restore Purchases Button */}
        <TouchableOpacity
          onPress={restorePurchases}
          style={styles.restoreButton}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Footer with CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={loading}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>
            {loading
              ? "Loading..."
              : selectedInterval === "year"
                ? "Start 7-Day Free Trial"
                : "Subscribe Monthly (€4.99/mo)"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerLegal}>
          {selectedInterval === "year"
            ? "7-day free trial, then €39.99/year. Cancel anytime."
            : "Billed monthly at €4.99. Cancel anytime."}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    backgroundColor: "#1E1E1E",
    padding: 8,
    borderRadius: 50,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#262626",
    position: "relative",
  },
  planCardSelected: {
    borderColor: "#D4AF37",
    backgroundColor: "#1F1D17",
  },
  badgeContainer: {
    position: "absolute",
    top: -10,
    left: 20,
  },
  popularBadge: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularBadgeText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  planInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  planSubtext: {
    fontSize: 12,
    color: "#888888",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  oldPrice: {
    fontSize: 12,
    color: "#777777",
    textDecorationLine: "line-through",
  },
  priceHighlight: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  perPeriod: {
    fontSize: 12,
    color: "#888888",
    fontWeight: "normal",
  },
  featuresSection: {
    marginTop: 10,
  },
  featuresHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: "#888888",
  },
  restoreButton: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  restoreButtonText: {
    color: "#D4AF37",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#1E1E1E",
  },
  ctaButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  ctaButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 15,
  },
  footerLegal: {
    fontSize: 11,
    color: "#666666",
    textAlign: "center",
  },
});
