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
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH * 0.65;
const CARD_HEIGHT = 440;
const SIDE_OFFSET = SCREEN_WIDTH * 0.25;

type PlanKey = "FREE" | "ROOKIE" | "ELITE";

interface PlanData {
  key: PlanKey;
  name: string;
  price: string;
  period: string;
  subtext: string;
  features: string[];
  cta: string;
}

export default function SubscriptionScreen() {
  // By default, the AMATEUR plan is selected when the user first opens the subscription screen
  const [activePlan, setActivePlan] = useState<PlanKey>("ROOKIE");

  const plans: PlanData[] = [
    {
      key: "FREE",
      name: "FREE",
      price: "€0.00",
      period: "/ LIFETIME",
      subtext: "Basic collection tracking",
      features: ["✓ Up to 10 slots", "✗ Limited valuation", "✗ Ads"],
      cta: "STAY FREE",
    },
    {
      key: "ROOKIE",
      name: "ROOKIE",
      price: "€2.99",
      period: "/ MONTH",
      subtext: "ANNUAL: €29.99",
      features: [
        "✓ Up to 100 slots",
        "✓ Valuation history",
        "✓ Ad-free experience",
        "✓ Custom labels",
      ],
      cta: "START 7-DAY FREE TRIAL",
    },
    {
      key: "ELITE",
      name: "ELITE",
      price: "€9.99",
      period: "/ MONTH",
      subtext: "or €99.99 / YEAR",
      features: [
        "✓ Unlimited slots",
        "✓ Advanced analytics",
        "✓ Portfolio export",
        "✓ Priority support",
      ],
      cta: "UPGRADE TO ELITE",
    },
  ];

  // Calcule the style for each card based on its position relative to the active card
  const getCardStyle = (key: PlanKey) => {
    // 1. active card in center
    if (key === activePlan) {
      return {
        zIndex: 3,
        transform: [{ scale: 1 }, { translateX: 0 }],
        opacity: 1,
      };
    }

    // 2. Logic when the active card is AMATEUR (in the middle)
    if (activePlan === "ROOKIE") {
      if (key === "FREE") {
        return {
          zIndex: 1,
          transform: [{ scale: 0.85 }, { translateX: -SIDE_OFFSET }],
          opacity: 0.5,
        };
      }
      if (key === "ELITE") {
        return {
          zIndex: 1,
          transform: [{ scale: 0.85 }, { translateX: SIDE_OFFSET }],
          opacity: 0.5,
        };
      }
    }

    // 3. Logic when the active card is FREE (on the left)
    if (activePlan === "FREE") {
      if (key === "ROOKIE") {
        return {
          zIndex: 2,
          transform: [{ scale: 0.85 }, { translateX: SIDE_OFFSET }],
          opacity: 0.6,
        };
      }
      if (key === "ELITE") {
        return {
          zIndex: 1,
          transform: [{ scale: 0.72 }, { translateX: SIDE_OFFSET * 1.8 }],
          opacity: 0.3,
        };
      }
    }

    // 4. Logic when the active card is PRO (on the right)
    if (activePlan === "ELITE") {
      if (key === "ROOKIE") {
        return {
          zIndex: 2,
          transform: [{ scale: 0.85 }, { translateX: -SIDE_OFFSET }],
          opacity: 0.6,
        };
      }
      if (key === "FREE") {
        return {
          zIndex: 1,
          transform: [{ scale: 0.72 }, { translateX: -SIDE_OFFSET * 1.8 }],
          opacity: 0.3,
        };
      }
    }

    return {
      zIndex: 1,
      transform: [{ scale: 0.85 }, { translateX: 0 }],
      opacity: 0.5,
    };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        {/* <Text style={styles.headerTitleText}>Settings</Text> */}
      </View>

      <Text style={styles.screenTitle}>CHOOSE YOUR PLAN</Text>

      <View style={styles.stackContainer}>
        {plans.map((plan) => {
          const isSelected = plan.key === activePlan;
          const cardAnimatedStyle = getCardStyle(plan.key);

          const isElite = plan.key === "ELITE";
          const isFree = plan.key === "FREE";

          let themeColor = "#05C785";
          if (isElite) themeColor = "#D4AF37";
          if (isFree) themeColor = "#777777";

          return (
            <Pressable
              key={plan.key}
              onPress={() => setActivePlan(plan.key)}
              style={[
                styles.cardBase,
                cardAnimatedStyle,
                { borderColor: isSelected ? themeColor : "#222222" },
                isSelected &&
                  (isElite
                    ? styles.glowPro
                    : isFree
                      ? styles.glowFree
                      : styles.glowAmateur),
              ]}
            >
              <View>
                <Text style={[styles.planName, { color: themeColor }]}>
                  {plan.name}
                </Text>

                <Text style={styles.price}>
                  {plan.price}{" "}
                  <Text style={styles.perMonth}>{plan.period}</Text>
                </Text>
                <Text
                  style={[
                    styles.subtext,
                    { color: isFree ? "#666666" : themeColor },
                  ]}
                >
                  {plan.subtext}
                </Text>

                <View style={styles.divider} />

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <Text key={index} style={styles.feature}>
                      {feature}
                    </Text>
                  ))}
                </View>
              </View>

              <TouchableOpacity
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
                  {plan.cta}
                </Text>
              </TouchableOpacity>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A", paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: { marginRight: 15 },
  headerTitleText: { color: "#FFFFFF", fontSize: 18, fontWeight: "500" },
  screenTitle: {
    color: "#5D7A5D",
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 50,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  stackContainer: {
    height: CARD_HEIGHT + 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    marginTop: 10,
  },

  // Style de base d'une carte (Positionnement absolu requis pour l'effet de superposition)
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
  glowAmateur: {
    shadowColor: "#05C785",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
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
