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
import { useTranslation } from "react-i18next";

type IntervalKey = "month" | "year";

export default function UpgradeScreen() {
  const { t } = useTranslation();
  const [selectedInterval, setSelectedInterval] = useState<IntervalKey>("year");
  const [loading, setLoading] = useState(false);

  // Hook RevenueCat
  const { packages, purchasePackage, restorePurchases, isElite } =
    useSubscription();

  // Si l'utilisateur est déjà ELITE, on affiche l'écran de succès traduit
  if (isElite) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Feather name="check-circle" size={64} color="#D4AF37" />
        <Text style={styles.mainTitle}>{t("upgrade.alreadyElite.title")}</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.back()}
        >
          <Text style={styles.ctaButtonText}>
            {t("upgrade.alreadyElite.backButton")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSubscribe = async () => {
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

    if (!targetPackage) {
      Toast.show({
        type: "error",
        text1: t("upgrade.errors.packageNotAvailable"),
      });
      return;
    }

    setLoading(true);
    try {
      await purchasePackage(targetPackage);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message || t("upgrade.errors.defaultPurchaseError"),
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
          <Text style={styles.mainTitle}>{t("upgrade.headerTitle")}</Text>
          <Text style={styles.subtitle}>{t("upgrade.subtitle")}</Text>
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
                <Text style={styles.popularBadgeText}>
                  {t("upgrade.annual.badge")}
                </Text>
              </View>
            </View>

            <View style={styles.planInfoRow}>
              <View>
                <Text style={styles.planTitle}>
                  {t("upgrade.annual.title")}
                </Text>
                <Text style={styles.planSubtext}>
                  {t("upgrade.annual.subtext")}
                </Text>
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
                <Text style={styles.planTitle}>
                  {t("upgrade.monthly.title")}
                </Text>
                <Text style={styles.planSubtext}>
                  {t("upgrade.monthly.subtext")}
                </Text>
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
            {t("upgrade.featuresHeader")}
          </Text>

          <View style={styles.featureRow}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="hanger" size={20} color="#D4AF37" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                {t("upgrade.features.unlimited.title")}
              </Text>
              <Text style={styles.featureDesc}>
                {t("upgrade.features.unlimited.desc")}
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIconContainer}>
              <Feather name="bar-chart-2" size={20} color="#D4AF37" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                {t("upgrade.features.stats.title")}
              </Text>
              <Text style={styles.featureDesc}>
                {t("upgrade.features.stats.desc")}
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIconContainer}>
              <Feather name="download" size={20} color="#D4AF37" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                {t("upgrade.features.export.title")}
              </Text>
              <Text style={styles.featureDesc}>
                {t("upgrade.features.export.desc")}
              </Text>
            </View>
          </View>
        </View>

        {/* Restore Purchases Button */}
        <TouchableOpacity
          onPress={restorePurchases}
          style={styles.restoreButton}
        >
          <Text style={styles.restoreButtonText}>{t("upgrade.restore")}</Text>
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
              ? t("upgrade.cta.loading")
              : selectedInterval === "year"
                ? t("upgrade.cta.trial")
                : t("upgrade.cta.monthly")}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerLegal}>
          {selectedInterval === "year"
            ? t("upgrade.legal.trial")
            : t("upgrade.legal.monthly")}
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
