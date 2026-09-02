import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCollectionAnalytics } from "@/hooks/useJerseyHook";
import { useUserMe } from "@/hooks/useAuthHook";
import { useTranslation } from "react-i18next";
import DonutChart from "@/components/DonutChart";

interface CrownJewelData {
  clubName: string;
  season: string;
  type: string;
  price: number;
  frontImageUrl: string;
}

const CHART_COLORS = ["#05C785", "#0A8F5C", "#7FCEAF", "#3DB88A", "#1FA872"];

type TabKey = "overview" | "mix" | "timeline";

const formatLabel = (text: string) => {
  if (!text) return "";
  const cleaned = text.replace(/[_]/g, " ").replace(/[-]/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

export default function AnalyticsScreen({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: userMe, isLoading: isUserLoading } = useUserMe();
  const { data, isLoading, error } = useCollectionAnalytics();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const isAdmin = userMe?.role === "ADMIN";
  const isElite =
    (userMe?.subscription?.planType === "ELITE_MONTHLY" ||
      userMe?.subscription?.planType === "ELITE_YEARLY") &&
    userMe?.subscription?.status === "active";
  const hasEliteAccess = isAdmin || isElite;

  const CURRENCY_SYMBOLS: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
  };

  const currencySymbol = CURRENCY_SYMBOLS[userMe?.currency ?? "EUR"] ?? "€";

  const handleBack = () => {
    if (onClose) onClose();
    else router.back();
  };

  if (isUserLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <Text style={{ color: "#888888" }}>{t("analytics.loading")}</Text>
      </SafeAreaView>
    );
  }

  if (!hasEliteAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{t("analytics.headerTitle")}</Text>
        </View>

        <View style={styles.lockedContainer}>
          <View style={styles.lockIconContainer}>
            <Feather name="lock" size={32} color="#05C785" />
          </View>
          <Text style={styles.lockedTitle}>{t("analytics.locked.title")}</Text>
          <Text style={styles.lockedText}>
            {t("analytics.locked.description")}
          </Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => router.push("/subscription")}
            activeOpacity={0.8}
          >
            <Feather
              name="zap"
              size={18}
              color="#121212"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.exportButtonText}>
              {t("analytics.locked.button")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const brandDonutData = (data?.brands ?? []).map((b, i) => ({
    name: b.name,
    count: b.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const conditionDonutData = (data?.conditions ?? []).map((c, i) => ({
    name: formatLabel(c.name),
    count: c.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const renderLegend = (
    items: { name: string; count: number }[],
    total: number,
  ) =>
    items.map((item, index) => {
      const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return (
        <View key={index} style={styles.legendRow}>
          <View style={styles.legendLeft}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
              ]}
            />
            <Text style={styles.legendName}>{item.name}</Text>
          </View>
          <View style={styles.legendRight}>
            <Text style={styles.legendPercent}>{percent}%</Text>
            <Text style={styles.legendCount}>{item.count}</Text>
          </View>
        </View>
      );
    });

  const acquisitionsData = data?.acquisitionsByYear ?? [];
  const maxAcquisitions = Math.max(...acquisitionsData.map((d) => d.count), 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.archiveSubtitle}>
            {t("analytics.headerSubtitle")}
          </Text>
          <Text style={styles.headerTitle}>{t("analytics.headerTitle")}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("overview")}
          style={[styles.tab, activeTab === "overview" && styles.tabActive]}
        >
          <Feather
            name="bar-chart-2"
            size={13}
            color={activeTab === "overview" ? "#05C785" : "#888888"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.tabTextActive,
            ]}
          >
            {t("analytics.tabs.overview")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("mix")}
          style={[styles.tab, activeTab === "mix" && styles.tabActive]}
        >
          <MaterialIcons
            name="donut-large"
            size={14}
            color={activeTab === "mix" ? "#05C785" : "#888888"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "mix" && styles.tabTextActive,
            ]}
          >
            {t("analytics.tabs.mix")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("timeline")}
          style={[styles.tab, activeTab === "timeline" && styles.tabActive]}
        >
          <Feather
            name="trending-up"
            size={13}
            color={activeTab === "timeline" ? "#05C785" : "#888888"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "timeline" && styles.tabTextActive,
            ]}
          >
            {t("analytics.tabs.timeline")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === "overview" && (
          <>
            <View style={styles.gridRow}>
              <View style={styles.smallCard}>
                <View style={styles.cardHeaderRow}>
                  <Feather name="shopping-bag" size={13} color="#05C785" />
                  <Text style={styles.cardLabel}>
                    {t("analytics.cards.totalKits")}
                  </Text>
                </View>
                <Text style={styles.cardValue}>{data?.totalKits ?? 0}</Text>
              </View>

              <View style={styles.smallCard}>
                <View style={styles.cardHeaderRow}>
                  <Feather name="shield" size={13} color="#05C785" />
                  <Text style={styles.cardLabel}>
                    {t("analytics.cards.uniqueClubs")}
                  </Text>
                </View>
                <Text style={styles.cardValue}>{data?.uniqueClubs ?? 0}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.smallCard}>
                <View style={styles.cardHeaderRow}>
                  <Feather name="calendar" size={13} color="#05C785" />
                  <Text style={styles.cardLabel}>
                    {t("analytics.cards.erasCovered")}
                  </Text>
                </View>
                <Text style={styles.cardValue}>{data?.erasCovered ?? 0}</Text>
              </View>

              <View style={styles.smallCard}>
                <View style={styles.cardHeaderRow}>
                  <Feather name="tag" size={13} color="#05C785" />
                  <Text style={styles.cardLabel}>
                    {t("analytics.cards.brands")}
                  </Text>
                </View>
                <Text style={styles.cardValue}>{data?.brandsCount ?? 0}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.smallCard}>
                <View style={styles.cardHeaderRow}>
                  <Feather name="credit-card" size={13} color="#05C785" />
                  <Text style={styles.cardLabel}>
                    {t("analytics.cards.totalInvested")}
                  </Text>
                </View>
                <Text style={styles.cardValueMoney}>
                  {data?.totalInvested ?? 0} {currencySymbol}
                </Text>
              </View>

              <View style={styles.smallCard}>
                <View style={styles.cardHeaderRow}>
                  <Feather name="trending-up" size={13} color="#05C785" />
                  <Text style={styles.cardLabel}>
                    {t("analytics.cards.avgPrice")}
                  </Text>
                </View>
                <Text style={styles.cardValueMoney}>
                  {data?.avgPrice ?? 0} {currencySymbol}
                </Text>
              </View>
            </View>

            {data?.crownJewel && (
              <>
                <Text style={styles.sectionHeader}>
                  {t("analytics.sections.crownJewel")}
                </Text>
                <View style={styles.crownJewelCard}>
                  <Image
                    source={{ uri: data.crownJewel.frontImageUrl }}
                    style={styles.crownJewelImage}
                    resizeMode="cover"
                  />
                  <View style={styles.crownJewelInfo}>
                    <Text style={styles.crownJewelBadge}>
                      {t("analytics.crownJewel.mostValuable")}
                    </Text>
                    <Text style={styles.crownJewelName}>
                      {data.crownJewel.clubName}
                    </Text>
                    <Text style={styles.crownJewelMeta}>
                      {data.crownJewel.season} ·{" "}
                      {formatLabel(data.crownJewel.type)}
                    </Text>
                    <Text style={styles.crownJewelPrice}>
                      {data.crownJewel.price} {currencySymbol}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <Text style={styles.sectionHeader}>
              {t("analytics.sections.topClubs")}
            </Text>
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
                            club.maxCount
                              ? (club.count / club.maxCount) * 100
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.sectionHeader}>
              {t("analytics.sections.kitTypes")}
            </Text>
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
          </>
        )}

        {/* ================= MIX TAB ================= */}
        {activeTab === "mix" && (
          <>
            <Text style={styles.sectionHeader}>
              {t("analytics.sections.brandMix")}
            </Text>
            <View style={styles.donutCard}>
              <View style={styles.donutContainer}>
                <DonutChart
                  data={brandDonutData}
                  centerLabel={t("analytics.cards.brands")}
                />
              </View>
              <View style={styles.legendContainer}>
                {renderLegend(data?.brands ?? [], data?.brandsCount ?? 0)}
              </View>
            </View>

            <Text style={styles.sectionHeader}>
              {t("analytics.sections.conditionMix")}
            </Text>
            <View style={styles.donutCard}>
              <View style={styles.donutContainer}>
                <DonutChart
                  data={conditionDonutData}
                  centerLabel={t("analytics.cards.totalKits")}
                />
              </View>
              <View style={styles.legendContainer}>
                {renderLegend(
                  (data?.conditions ?? []).map((c) => ({
                    name: formatLabel(c.name),
                    count: c.count,
                  })),
                  data?.totalKits ?? 0,
                )}
              </View>
            </View>
          </>
        )}

        {/* ================= TIMELINE TAB ================= */}
        {activeTab === "timeline" && (
          <>
            <Text style={styles.sectionHeader}>
              {t("analytics.sections.acquisitionsTimeline")}
            </Text>
            <View style={styles.timelineCard}>
              <View style={styles.timelineRow}>
                {acquisitionsData.map((item, index) => (
                  <View key={index} style={styles.timelineColumn}>
                    <Text style={styles.timelineCount}>{item.count}</Text>
                    <View
                      style={[
                        styles.timelineBar,
                        {
                          height: Math.max(
                            (item.count / maxAcquisitions) * 100,
                            20,
                          ),
                        },
                      ]}
                    />
                    <Text style={styles.timelineYear}>{item.year}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.sectionHeader}>
              {t("analytics.sections.kitsByEra")}
            </Text>
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
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
  lockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: -40,
  },
  lockIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(5, 199, 133, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(5, 199, 133, 0.3)",
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  lockedText: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  exportButton: {
    backgroundColor: "#05C785",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  exportButtonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 15,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#262626",
  },
  tabActive: {
    borderColor: "#05C785",
    backgroundColor: "rgba(5, 199, 133, 0.1)",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#888888",
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: "#05C785",
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
  crownJewelCard: {
    flexDirection: "row",
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.3)",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 14,
    marginBottom: 5,
  },
  crownJewelIconContainer: {
    width: 70,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },
  crownJewelInfo: {
    flex: 1,
  },
  crownJewelBadge: {
    color: "#05C785",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  crownJewelName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  crownJewelMeta: {
    color: "#888888",
    fontSize: 12,
    marginBottom: 6,
  },
  crownJewelPrice: {
    color: "#05C785",
    fontSize: 18,
    fontWeight: "bold",
  },
  donutCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  donutContainer: {
    marginBottom: 20,
  },
  legendContainer: {
    width: "100%",
    gap: 10,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  legendRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendPercent: {
    color: "#888888",
    fontSize: 13,
  },
  legendCount: {
    color: "#05C785",
    fontSize: 14,
    fontWeight: "bold",
  },
  timelineCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    padding: 20,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
  },
  timelineColumn: {
    alignItems: "center",
    flex: 1,
  },
  timelineCount: {
    color: "#05C785",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  timelineBar: {
    width: "70%",
    backgroundColor: "#05C785",
    borderRadius: 8,
    minHeight: 20,
  },
  timelineYear: {
    color: "#888888",
    fontSize: 12,
    marginTop: 8,
  },
  crownJewelImage: {
    width: 70,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#0A0A0A",
  },
});
