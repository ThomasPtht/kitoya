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
import CardCollection from "@/components/CardCollection";
import React, { useMemo, useState } from "react";
import { JerseyData } from "@/services/jersey.service";
import JerseyModalWrapper from "@/components/JerseyModalWrapper";
import { Feather } from "@expo/vector-icons";
import { CustomSearchBar } from "@/components/CustomSearchBar";

import { useFilterStore } from "@/stores/useFilterStore";
import FilterModal from "@/components/FilterModal";

export default function TabDressingScreen() {
  const { data: jerseys, isLoading } = useJerseys();
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
  } = useFilterStore();

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const filteredJerseys = useMemo(() => {
    if (!jerseys) return [];
    return jerseys.filter((j: JerseyData) => {
      // Filter by search
      const matchesSearch = j.club?.name
        .toLowerCase()
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
      return matchesSearch && matchesClub && matchesSeason && matchesKitType;
    });
  }, [jerseys, search, selectedClubs, selectedSeasons, selectedKitTypes]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Locker</Text>

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

          {/* La modale que tu affiches */}
          <FilterModal
            jerseys={jerseys || []}
            visible={isFilterVisible}
            onClose={() => setIsFilterVisible(false)}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
          style={{ marginTop: 20 }}
        />
      ) : (
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 20,
    color: "white",
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
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchBarInput: {
    borderRadius: 12,
  },
  filterButton: {
    marginLeft: 10,
    padding: 10,
  },
});
