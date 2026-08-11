import {
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useFilterStore } from "@/stores/useFilterStore";
import { useMemo, useState } from "react";
import { FilterSection } from "./FilterSection";
import { JerseyData } from "@/services/jersey.service";
import { Feather } from "@expo/vector-icons";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  jerseys: JerseyData[];
}

export default function FilterModal({
  visible,
  onClose,
  jerseys,
}: FilterModalProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const {
    selectedClubs,
    toggleClub,
    selectedSeasons,
    toggleSeason,
    selectedKitTypes,
    toggleKitType,
    selectedVersions,
    toggleVersion,
    selectedConditions,
    toggleCondition,
    selectedBrands,
    toggleBrand,
  } = useFilterStore();

  const formatLabel = (value: string) => {
    return value.replace(/_/g, " ");
  };

  // --- FILTRAGE CROISÉ (CROSS-FILTERING) ---
  // Chaque section est filtrée par rapport aux sélections des AUTRES sections

  const filteredForClubs = useMemo(() => {
    return jerseys.filter((j) => {
      const matchSeason =
        selectedSeasons.length === 0 ||
        selectedSeasons.includes(j.season || "");
      const matchType =
        selectedKitTypes.length === 0 ||
        selectedKitTypes.includes(j.type || "");
      const matchVersion =
        selectedVersions.length === 0 ||
        selectedVersions.includes(j.version || "");
      const matchCondition =
        selectedConditions.length === 0 ||
        selectedConditions.includes(j.condition || "");
      const matchBrand =
        selectedBrands.length === 0 || selectedBrands.includes(j.brand || "");
      return (
        matchSeason && matchType && matchVersion && matchCondition && matchBrand
      );
    });
  }, [
    jerseys,
    selectedSeasons,
    selectedKitTypes,
    selectedVersions,
    selectedConditions,
    selectedBrands,
  ]);

  const filteredForSeasons = useMemo(() => {
    return jerseys.filter((j) => {
      const matchClub =
        selectedClubs.length === 0 ||
        selectedClubs.includes(j.club?.name || "");
      const matchType =
        selectedKitTypes.length === 0 ||
        selectedKitTypes.includes(j.type || "");
      const matchVersion =
        selectedVersions.length === 0 ||
        selectedVersions.includes(j.version || "");
      const matchCondition =
        selectedConditions.length === 0 ||
        selectedConditions.includes(j.condition || "");
      const matchBrand =
        selectedBrands.length === 0 || selectedBrands.includes(j.brand || "");
      return (
        matchClub && matchType && matchVersion && matchCondition && matchBrand
      );
    });
  }, [
    jerseys,
    selectedClubs,
    selectedKitTypes,
    selectedVersions,
    selectedConditions,
    selectedBrands,
  ]);

  const filteredForBrands = useMemo(() => {
    return jerseys.filter((j) => {
      const matchClub =
        selectedClubs.length === 0 ||
        selectedClubs.includes(j.club?.name || "");
      const matchSeason =
        selectedSeasons.length === 0 ||
        selectedSeasons.includes(j.season || "");
      const matchType =
        selectedKitTypes.length === 0 ||
        selectedKitTypes.includes(j.type || "");
      const matchVersion =
        selectedVersions.length === 0 ||
        selectedVersions.includes(j.version || "");
      const matchCondition =
        selectedConditions.length === 0 ||
        selectedConditions.includes(j.condition || "");
      return (
        matchClub && matchSeason && matchType && matchVersion && matchCondition
      );
    });
  }, [
    jerseys,
    selectedClubs,
    selectedSeasons,
    selectedKitTypes,
    selectedVersions,
    selectedConditions,
  ]);

  const filteredForKitTypes = useMemo(() => {
    return jerseys.filter((j) => {
      const matchClub =
        selectedClubs.length === 0 ||
        selectedClubs.includes(j.club?.name || "");
      const matchSeason =
        selectedSeasons.length === 0 ||
        selectedSeasons.includes(j.season || "");
      const matchVersion =
        selectedVersions.length === 0 ||
        selectedVersions.includes(j.version || "");
      const matchCondition =
        selectedConditions.length === 0 ||
        selectedConditions.includes(j.condition || "");
      const matchBrand =
        selectedBrands.length === 0 || selectedBrands.includes(j.brand || "");
      return (
        matchClub && matchSeason && matchVersion && matchCondition && matchBrand
      );
    });
  }, [
    jerseys,
    selectedClubs,
    selectedSeasons,
    selectedVersions,
    selectedConditions,
    selectedBrands,
  ]);

  const filteredForVersions = useMemo(() => {
    return jerseys.filter((j) => {
      const matchClub =
        selectedClubs.length === 0 ||
        selectedClubs.includes(j.club?.name || "");
      const matchSeason =
        selectedSeasons.length === 0 ||
        selectedSeasons.includes(j.season || "");
      const matchType =
        selectedKitTypes.length === 0 ||
        selectedKitTypes.includes(j.type || "");
      const matchCondition =
        selectedConditions.length === 0 ||
        selectedConditions.includes(j.condition || "");
      const matchBrand =
        selectedBrands.length === 0 || selectedBrands.includes(j.brand || "");
      return (
        matchClub && matchSeason && matchType && matchCondition && matchBrand
      );
    });
  }, [
    jerseys,
    selectedClubs,
    selectedSeasons,
    selectedKitTypes,
    selectedConditions,
    selectedBrands,
  ]);

  const filteredForConditions = useMemo(() => {
    return jerseys.filter((j) => {
      const matchClub =
        selectedClubs.length === 0 ||
        selectedClubs.includes(j.club?.name || "");
      const matchSeason =
        selectedSeasons.length === 0 ||
        selectedSeasons.includes(j.season || "");
      const matchType =
        selectedKitTypes.length === 0 ||
        selectedKitTypes.includes(j.type || "");
      const matchVersion =
        selectedVersions.length === 0 ||
        selectedVersions.includes(j.version || "");
      const matchBrand =
        selectedBrands.length === 0 || selectedBrands.includes(j.brand || "");
      return (
        matchClub && matchSeason && matchType && matchVersion && matchBrand
      );
    });
  }, [
    jerseys,
    selectedClubs,
    selectedSeasons,
    selectedKitTypes,
    selectedVersions,
    selectedBrands,
  ]);

  // --- EXTRACTION DES LISTES UNIQUES ---

  const allClubs = useMemo(() => {
    return Array.from(new Set(filteredForClubs.map((j) => j.club?.name)))
      .filter((name): name is string => Boolean(name))
      .sort();
  }, [filteredForClubs]);

  const allSeasons = useMemo(() => {
    return Array.from(new Set(filteredForSeasons.map((j) => j.season)))
      .filter((s): s is string => Boolean(s))
      .sort()
      .reverse();
  }, [filteredForSeasons]);

  const allBrands = useMemo(() => {
    return Array.from(new Set(filteredForBrands.map((j) => j.brand)))
      .filter((b): b is string => Boolean(b))
      .sort();
  }, [filteredForBrands]);

  const allKitTypes = useMemo(() => {
    return Array.from(new Set(filteredForKitTypes.map((j) => j.type)))
      .filter((t): t is string => Boolean(t))
      .sort();
  }, [filteredForKitTypes]);

  const allVersions = useMemo(() => {
    return Array.from(new Set(filteredForVersions.map((j) => j.version)))
      .filter((v): v is string => Boolean(v))
      .sort();
  }, [filteredForVersions]);

  const allConditions = useMemo(() => {
    return Array.from(new Set(filteredForConditions.map((j) => j.condition)))
      .filter((c): c is string => Boolean(c))
      .sort();
  }, [filteredForConditions]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onDismiss={onClose}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <View style={{ width: 32 }} />
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView>
          {/* TEAM */}
          <FilterSection
            title="Team"
            isOpen={openSection === "Team"}
            onToggle={() =>
              setOpenSection(openSection === "Team" ? null : "Team")
            }
          >
            {allClubs.map((club) => {
              const isSelected = selectedClubs.includes(club);
              return (
                <TouchableOpacity
                  key={club}
                  onPress={() => toggleClub(club)}
                  style={styles.item}
                >
                  <Feather
                    name={isSelected ? "check-square" : "square"}
                    size={16}
                    color={isSelected ? "#05C785" : "#555"}
                  />
                  <Text style={styles.itemText}>{club}</Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>

          {/* SEASON */}
          <FilterSection
            title="Season"
            isOpen={openSection === "Season"}
            onToggle={() =>
              setOpenSection(openSection === "Season" ? null : "Season")
            }
          >
            {allSeasons.map((season) => {
              const isSelected = selectedSeasons.includes(season);
              return (
                <TouchableOpacity
                  key={season}
                  onPress={() => toggleSeason(season)}
                  style={styles.item}
                >
                  <Feather
                    name={isSelected ? "check-square" : "square"}
                    size={16}
                    color={isSelected ? "#05C785" : "#555"}
                  />
                  <Text style={styles.itemText}>{season}</Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>

          {/* BRAND */}
          <FilterSection
            title="Brand"
            isOpen={openSection === "Brand"}
            onToggle={() =>
              setOpenSection(openSection === "Brand" ? null : "Brand")
            }
          >
            {allBrands.map((brand) => {
              const isSelected = selectedBrands.includes(brand);
              return (
                <TouchableOpacity
                  key={brand}
                  onPress={() => toggleBrand(brand)}
                  style={styles.item}
                >
                  <Feather
                    name={isSelected ? "check-square" : "square"}
                    size={16}
                    color={isSelected ? "#05C785" : "#555"}
                  />
                  <Text style={styles.itemText}>{brand}</Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>

          {/* KIT TYPE */}
          <FilterSection
            title="Kit Type"
            isOpen={openSection === "Kit Type"}
            onToggle={() =>
              setOpenSection(openSection === "Kit Type" ? null : "Kit Type")
            }
          >
            {allKitTypes.map((kitType) => {
              const isSelected = selectedKitTypes.includes(kitType);
              return (
                <TouchableOpacity
                  key={kitType}
                  onPress={() => toggleKitType(kitType)}
                  style={styles.item}
                >
                  <Feather
                    name={isSelected ? "check-square" : "square"}
                    size={16}
                    color={isSelected ? "#05C785" : "#555"}
                  />
                  <Text style={styles.itemText}>{kitType}</Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>

          {/* VERSION */}
          <FilterSection
            title="Version"
            isOpen={openSection === "Version"}
            onToggle={() =>
              setOpenSection(openSection === "Version" ? null : "Version")
            }
          >
            {allVersions.map((version) => {
              const isSelected = selectedVersions.includes(version);
              return (
                <TouchableOpacity
                  key={version}
                  onPress={() => toggleVersion(version)}
                  style={styles.item}
                >
                  <Feather
                    name={isSelected ? "check-square" : "square"}
                    size={16}
                    color={isSelected ? "#05C785" : "#555"}
                  />
                  <Text style={styles.itemText}>{version}</Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>

          {/* CONDITION */}
          <FilterSection
            title="Condition"
            isOpen={openSection === "Condition"}
            onToggle={() =>
              setOpenSection(openSection === "Condition" ? null : "Condition")
            }
          >
            {allConditions.map((condition) => {
              const isSelected = selectedConditions.includes(condition);
              return (
                <TouchableOpacity
                  key={condition}
                  onPress={() => toggleCondition(condition)}
                  style={styles.item}
                >
                  <Feather
                    name={isSelected ? "check-square" : "square"}
                    size={16}
                    color={isSelected ? "#05C785" : "#555"}
                  />
                  <Text style={styles.itemText}>{formatLabel(condition)}</Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>
        </ScrollView>

        <TouchableOpacity style={styles.applyButton} onPress={onClose}>
          <Text style={styles.applyButtonText}>See Results</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    alignSelf: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  itemText: { color: "#fff", fontSize: 16, textTransform: "capitalize" },
  applyButton: {
    backgroundColor: "#05C785",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  applyButtonText: { color: "black", fontWeight: "bold", fontSize: 16 },
  closeButton: {
    backgroundColor: "#333",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
