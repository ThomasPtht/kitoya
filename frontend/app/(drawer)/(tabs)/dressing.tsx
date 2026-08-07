import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  View,
  Text,
} from "react-native";

import { useJerseys } from "@/hooks/useJerseyHook";
import { useUserMe } from "@/hooks/useAuthHook";
import CardCollection from "@/components/CardCollection";
import React, { useMemo, useState } from "react";
import { JerseyData } from "@/services/jersey.service";
import JerseyModalWrapper from "@/components/JerseyModalWrapper";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CustomSearchBar } from "@/components/CustomSearchBar";
import { router } from "expo-router";

import { useFilterStore } from "@/stores/useFilterStore";
import FilterModal from "@/components/FilterModal";

export default function TabDressingScreen() {
  const { data: jerseys, isLoading } = useJerseys();
  const { data: userInfo } = useUserMe();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJersey, setSelectedJersey] = useState<JerseyData | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const { width } = useWindowDimensions();

  const {
    search,
    setSearch,
    selectedClubs,
    selectedSeasons,
    selectedKitTypes,
    selectedVersions,
    selectedConditions,
    selectedBrands,
  } = useFilterStore();

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const filteredJerseys = useMemo(() => {
    if (!jerseys) return [];
    return jerseys.filter((j: JerseyData) => {
      // Filter by search
      const matchesSearch = j.club?.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      // Filter by club
      const matchesClub =
        selectedClubs.length === 0 ||
        selectedClubs.includes(j.club?.name ?? "");

      //Filter by season
      const matchesSeason =
        selectedSeasons.length === 0 ||
        selectedSeasons.includes(j.season ?? "");

      // Filter by kit type
      const matchesKitType =
        selectedKitTypes.length === 0 ||
        selectedKitTypes.includes(j.type ?? "");

      const matchesVersion =
        selectedVersions.length === 0 ||
        selectedVersions.includes(j.version ?? "");

      const matchesCondition =
        selectedConditions.length === 0 ||
        selectedConditions.includes(j.condition ?? "");

      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(j.brand ?? "");

      return (
        matchesSearch &&
        matchesClub &&
        matchesSeason &&
        matchesKitType &&
        matchesVersion &&
        matchesCondition &&
        matchesBrand
      );
    });
  }, [
    jerseys,
    search,
    selectedClubs,
    selectedSeasons,
    selectedKitTypes,
    selectedVersions,
    selectedConditions,
    selectedBrands,
  ]);

  const hasJerseys = jerseys && jerseys.length > 0;
  const isPrivate = userInfo?.isPublic === false;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Locker</Text>

      {/* Bannière Locker Privé */}
      {isPrivate && (
        <View style={styles.privateBanner}>
          <View style={styles.privateBannerLeft}>
            <Feather name="lock" size={16} color="#888888" />
            <Text style={styles.privateBannerText}>
              Your locker is private. Turn it public in settings.
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Text style={styles.privateBannerButton}>SETTINGS</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* On n'affiche la barre de recherche que s'il y a des maillots */}
      {hasJerseys && (
        <View style={styles.searchContainer}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <CustomSearchBar value={search} onChangeText={updateSearch} />
            </View>
            <TouchableOpacity onPress={() => setIsFilterVisible(true)}>
              <Feather
                name="filter"
                size={24}
                color={selectedClubs.length > 0 ? "#05C785" : "white"}
              />
            </TouchableOpacity>

            <FilterModal
              jerseys={jerseys || []}
              visible={isFilterVisible}
              onClose={() => setIsFilterVisible(false)}
            />
          </View>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#05C785"
          style={{ marginTop: 40 }}
        />
      ) : hasJerseys ? (
        <FlatList
          data={filteredJerseys}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <CardCollection
              jersey={item}
              width={width / 2 - 30}
              onPress={() => {
                setSelectedJersey(item);
                setModalVisible(true);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name="tshirt-crew-outline"
                size={32}
                color="#05C785"
              />
            </View>

            <Text style={styles.emptyTitle}>Your locker is empty</Text>
            <Text style={styles.emptySubtitle}>
              Start building your archive. Add your first shirt and unlock your
              collector rank.
            </Text>

            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={() => {
                router.push("/(drawer)/(tabs)/add");
              }}
            >
              <Feather name="plus" size={18} color="#121212" />
              <Text style={styles.addButtonText}>Add your first kit</Text>
            </TouchableOpacity>
          </View>

          {/* Why Archive Card */}
          <View style={styles.whyBox}>
            <Text style={styles.whyTitle}>WHY ARCHIVE?</Text>
            <View style={styles.whyItem}>
              <Feather name="zap" size={14} color="#05C785" />
              <Text style={styles.whyText}>Track all your kits and gems</Text>
            </View>
            <View style={styles.whyItem}>
              <MaterialCommunityIcons
                name="trophy-outline"
                size={14}
                color="#05C785"
              />
              <Text style={styles.whyText}>
                Level up your rank as your collection grows
              </Text>
            </View>
            <View style={styles.whyItem}>
              <Feather name="arrow-up-right" size={14} color="#05C785" />
              <Text style={styles.whyText}>
                Export and showcase your ultimate locker
              </Text>
            </View>
          </View>
        </View>
      )}

      <JerseyModalWrapper
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        jersey={selectedJersey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 15,
    color: "white",
  },
  privateBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  privateBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  privateBannerText: {
    color: "#888888",
    fontSize: 13,
    flexShrink: 1,
  },
  privateBannerButton: {
    color: "#05C785",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  emptyContent: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#161E1A",
    borderWidth: 1,
    borderColor: "#05C785",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#05C785",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  addButtonText: {
    color: "#121212",
    fontSize: 15,
    fontWeight: "bold",
  },
  whyBox: {
    width: "100%",
    backgroundColor: "#161E1A",
    borderWidth: 1,
    borderColor: "#05C785",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  whyTitle: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  whyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  whyText: {
    color: "#CCCCCC",
    fontSize: 13,
  },
});
