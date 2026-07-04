import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useJerseys } from "@/hooks/useJerseyHook";
import CardCollection from "@/components/CardCollection";
import { useMemo, useState } from "react";
import { JerseyData } from "@/services/jersey.service";
import JerseyModalWrapper from "@/components/JerseyModalWrapper";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { CustomSearchBar } from "@/components/CustomSearchBar";

export default function TabDressingScreen() {
  // On récupère les maillots depuis ton hook
  const { data: jerseys, isLoading } = useJerseys();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJersey, setSelectedJersey] = useState<JerseyData | null>(null);
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const filteredJerseys = useMemo(() => {
    if (!jerseys) return [];

    const searchLower = search.toLowerCase();

    return jerseys.filter((jersey: JerseyData) => {
      const clubName = jersey.club?.name?.toLowerCase() ?? "";
      const season = jersey.season?.toLowerCase() ?? "";

      return clubName.includes(searchLower) || season.includes(searchLower);
    });
  }, [jerseys, search]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Locker</Text>

      <View style={styles.searchContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <CustomSearchBar value={search} onChangeText={updateSearch} />
          </View>
          <TouchableOpacity onPress={() => console.log("Ouvrir filtre")}>
            <Feather name="filter" size={24} color="white" />
          </TouchableOpacity>
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
