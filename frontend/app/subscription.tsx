import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/useSubscription";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_HEIGHT = 440;
const SIDE_OFFSET = SCREEN_WIDTH * 0.2;

type PlanKey = "FREE" | "ELITE";

interface PlanConfig {
  key: PlanKey;
  nameKey: string;
  price: string;
  periodKey: string;
  subtextKey: string;
  featuresKey: string;
  ctaKey: string;
}

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const [activePlan, setActivePlan] = useState<PlanKey>("ELITE");
  const { packages } = useSubscription();

  const monthlyPackage = packages.find(
    (pkg) => pkg.identifier === "elite_monthly",
  );
  const eliteMonthlyPrice = monthlyPackage?.product.priceString || "4.99€";
  const annualPackage = packages.find(
    (pkg) => pkg.identifier === "elite_annual",
  );
  const eliteAnnualPrice = annualPackage?.product.priceString || "39.99€";

  const plansConfig: PlanConfig[] = [
    {
      key: "FREE",
      nameKey: "subscription.plans.free.name",
      price: "0.00€",
      periodKey: "subscription.plans.free.period",
      subtextKey: "subscription.plans.free.subtext",
      featuresKey: "subscription.plans.free.features",
      ctaKey: "subscription.plans.free.cta",
    },
    {
      key: "ELITE",
      nameKey: "subscription.plans.elite.name",
      price: eliteMonthlyPrice,
      periodKey: "subscription.plans.elite.period",
      subtextKey: t("subscription.plans.elite.subtext", {
        price: eliteAnnualPrice,
      }),
      featuresKey: "subscription.plans.elite.features",
      ctaKey: "subscription.plans.elite.cta",
    },
  ];

  const handlePressCta = (planKey: PlanKey) => {
    if (planKey === "FREE") {
      router.back();
      return;
    }

    if (planKey === "ELITE") {
      router.push("/upgrade" as any);
      return;
    }
  };

  const getCardStyle = (key: PlanKey) => {
    if (key === activePlan) {
      return {
        zIndex: 3,
        transform: [{ scale: 1 }, { translateX: 0 }],
        opacity: 1,
      };
    }

    const translateXValue = key === "FREE" ? -SIDE_OFFSET : SIDE_OFFSET;

    return {
      zIndex: 1,
      transform: [{ scale: 0.85 }, { translateX: translateXValue }],
      opacity: 0.5,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.archiveSubtitle}>
            {t("subscription.headerSubtitle")}
          </Text>
          <Text style={styles.headerTitle}>
            {t("subscription.headerTitle")}
          </Text>
        </View>
      </View>

      <View style={styles.stackContainer}>
        {plansConfig.map((plan) => {
          const isSelected = plan.key === activePlan;
          const cardAnimatedStyle = getCardStyle(plan.key);

          const isElite = plan.key === "ELITE";
          const isFree = plan.key === "FREE";

          let themeColor = "#05C785";
          if (isElite) themeColor = "#D4AF37";
          if (isFree) themeColor = "#777777";

          const featuresList = t(plan.featuresKey, {
            returnObjects: true,
          }) as string[];

          return (
            <Pressable
              key={plan.key}
              onPress={() => setActivePlan(plan.key)}
              style={[
                styles.cardBase,
                cardAnimatedStyle,
                { borderColor: isSelected ? themeColor : "#222222" },
                isSelected && (isElite ? styles.glowPro : styles.glowFree),
              ]}
            >
              <View>
                <Text style={[styles.planName, { color: themeColor }]}>
                  {t(plan.nameKey)}
                </Text>

                <Text style={styles.price}>
                  {plan.price}{" "}
                  <Text style={styles.perMonth}>{t(plan.periodKey)}</Text>
                </Text>
                <Text
                  style={[
                    styles.subtext,
                    { color: isFree ? "#666666" : themeColor },
                  ]}
                >
                  {t(plan.subtextKey)}
                </Text>

                <View style={styles.divider} />

                <View style={styles.featuresContainer}>
                  {Array.isArray(featuresList) &&
                    featuresList.map((feature, index) => (
                      <Text key={index} style={styles.feature}>
                        {feature}
                      </Text>
                    ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handlePressCta(plan.key)}
                disabled={!isSelected}
                style={[
                  styles.ctaButton,
                  {
                    backgroundColor: themeColor,
                    opacity: isSelected ? 1 : 0.4,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.ctaButtonText,
                    { color: isFree ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  {t(plan.ctaKey)}
                </Text>
              </TouchableOpacity>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 50,
  },
  archiveSubtitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#05C785",
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  stackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    marginBottom: 40,
  },
  cardBase: {
    backgroundColor: "#161616",
    borderRadius: 24,
    padding: 24,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: "absolute",
    borderWidth: 2,
    justifyContent: "space-between",
  },
  glowFree: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  glowPro: {
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  price: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
  },
  perMonth: { fontSize: 13, color: "#888888", fontWeight: "normal" },
  subtext: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 15,
    fontWeight: "600",
  },
  divider: { height: 1, backgroundColor: "#262626", marginBottom: 15 },
  featuresContainer: { marginTop: 5 },
  feature: { color: "#D1D1D1", fontSize: 14, marginBottom: 12 },
  ctaButton: {
    paddingVertical: 15,
    borderRadius: 14,
  },
  ctaButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
