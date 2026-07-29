import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCollectionAnalytics } from "@/hooks/useJerseyHook";

interface AnalyticsProps {
  onClose?: () => void;
  stats?: {
    totalKits: number;
    uniqueClubs: number;
    erasCovered: number;
    brandsCount: number;
    totalInvested: number;
    avgPrice: number;
    topClubs: { name: string; count: number; maxCount: number }[];
    eras: { name: string; count: number; maxCount: number }[];
    brands: { name: string; count: number }[];
    variants: { name: string; count: number; maxCount: number }[];
    conditions: { name: string; count: number; maxCount: number }[];
  };
}

// Fonction utilitaire pour formater les labels (ex: VERY_GOOD -> Very good, matchworn -> Matchworn)
const formatLabel = (text: string) => {
  if (!text) return "";
  const cleaned = text.replace(/[_]/g, " ").replace(/[-]/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

export default function AnalyticsScreen({ onClose }: AnalyticsProps) {
  const router = useRouter();
  const { data, isLoading, error } = useCollectionAnalytics();
  console.log("Collection Analytics Data:", data);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header identique à ExportCollectionScreen */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.archiveSubtitle}>ANALYTICS</Text>
          <Text style={styles.headerTitle}>Collection stats</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Grid 2x3 pour les stats principales */}
        <View style={styles.gridRow}>
          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="shopping-bag" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>TOTAL KITS</Text>
            </View>
            <Text style={styles.cardValue}>{data?.totalKits ?? 0}</Text>
          </View>

          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="shield" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>UNIQUE CLUBS</Text>
            </View>
            <Text style={styles.cardValue}>{data?.uniqueClubs ?? 0}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="calendar" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>ERAS COVERED</Text>
            </View>
            <Text style={styles.cardValue}>{data?.erasCovered ?? 0}</Text>
          </View>

          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="tag" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>BRANDS</Text>
            </View>
            <Text style={styles.cardValue}>{data?.brandsCount ?? 0}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="credit-card" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>TOTAL INVESTED</Text>
            </View>
            <Text style={styles.cardValueMoney}>
              £{data?.totalInvested ?? 0}
            </Text>
          </View>

          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="trending-up" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>AVG. PRICE</Text>
            </View>
            <Text style={styles.cardValueMoney}>£{data?.avgPrice ?? 0}</Text>
          </View>
        </View>

        {/* SECTION: TOP CLUBS */}
        <Text style={styles.sectionHeader}>TOP CLUBS</Text>
        <View style={styles.sectionCard}>
          {(data?.topClubs ?? []).map((club, index, array) => (
            <View
              key={index}
              style={[
                styles.barItemContainer,
                index !== array.length - 1 && styles.itemSeparator,
              ]}
            >
              <View style={styles.barItemHeader}>
                <Text style={styles.barItemName}>{club.name}</Text>
                <Text style={styles.barItemCount}>{club.count}</Text>
              </View>
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${
                        club.maxCount ? (club.count / club.maxCount) * 100 : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* SECTION: KITS BY ERA */}
        <Text style={styles.sectionHeader}>KITS BY ERA</Text>
        <View style={styles.sectionCard}>
          {(data?.eras ?? []).map((era, index, array) => (
            <View
              key={index}
              style={[
                styles.barItemContainer,
                index !== array.length - 1 && styles.itemSeparator,
              ]}
            >
              <View style={styles.barItemHeader}>
                <Text style={styles.barItemName}>{era.name}</Text>
                <Text style={styles.barItemCount}>{era.count}</Text>
              </View>
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${
                        era.maxCount ? (era.count / era.maxCount) * 100 : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* SECTION: BRAND MIX (Pills) */}
        <Text style={styles.sectionHeader}>BRAND MIX</Text>
        <View style={styles.pillsRow}>
          {(data?.brands ?? []).map((brand, index) => (
            <View key={index} style={styles.pill}>
              <Text style={styles.pillText}>
                {brand.name} <Text style={styles.pillCount}>{brand.count}</Text>
              </Text>
            </View>
          ))}
        </View>

        {/* SECTION: VARIANTS */}
        <Text style={styles.sectionHeader}>VARIANTS</Text>
        <View style={styles.sectionCard}>
          {(data?.variants ?? []).map((variant, index, array) => (
            <View
              key={index}
              style={[
                styles.barItemContainer,
                index !== array.length - 1 && styles.itemSeparator,
              ]}
            >
              <View style={styles.barItemHeader}>
                <Text style={styles.barItemName}>
                  {formatLabel(variant.name)}
                </Text>
                <Text style={styles.barItemCount}>{variant.count}</Text>
              </View>
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${
                        variant.maxCount
                          ? (variant.count / variant.maxCount) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* SECTION: CONDITION MIX */}
        <Text style={styles.sectionHeader}>CONDITION MIX</Text>
        <View style={styles.sectionCard}>
          {(data?.conditions ?? []).map((condition, index, array) => (
            <View
              key={index}
              style={[
                styles.barItemContainer,
                index !== array.length - 1 && styles.itemSeparator,
              ]}
            >
              <View style={styles.barItemHeader}>
                <Text style={styles.barItemName}>
                  {formatLabel(condition.name)}
                </Text>
                <Text style={styles.barItemCount}>{condition.count}</Text>
              </View>
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${
                        condition.maxCount
                          ? (condition.count / condition.maxCount) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  smallCard: {
    flex: 1,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#888888",
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cardValueMoney: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#05C785",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#888888",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 15,
  },
  sectionCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    padding: 16,
  },
  barItemContainer: {
    paddingVertical: 8,
  },
  itemSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
    marginBottom: 8,
  },
  barItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  barItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  barItemCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#05C785",
  },
  statBarTrack: {
    height: 4,
    backgroundColor: "#222222",
    borderRadius: 2,
    overflow: "hidden",
  },
  statBarFill: {
    height: "100%",
    backgroundColor: "#05C785",
    borderRadius: 2,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.3)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  pillCount: {
    color: "#05C785",
    fontWeight: "bold",
  },
});
