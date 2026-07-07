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
  const { selectedClubs, toggleClub } = useFilterStore();
  const { selectedSeasons, toggleSeason } = useFilterStore();
  const { selectedKitTypes, toggleKitType } = useFilterStore();

  // Extraction unique des clubs depuis tes données
  const allClubs = useMemo(() => {
    return Array.from(new Set(jerseys.map((j) => j.club?.name))).sort();
  }, [jerseys]);

  const allSeasons = useMemo(() => {
    return Array.from(new Set(jerseys.map((j) => j.season)))
      .sort()
      .reverse();
  }, [jerseys]);

  const allKitTypes = useMemo(() => {
    return Array.from(new Set(jerseys.map((j) => j.type))).sort();
  }, [jerseys]);

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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // make the touch area larger for easier tapping
          >
            <Feather name="x" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView>
          <FilterSection
            title="Team"
            isOpen={openSection === "Team"}
            onToggle={() =>
              setOpenSection(openSection === "Team" ? null : "Team")
            }
          >
            {allClubs.map((club) => (
              <TouchableOpacity
                key={club}
                onPress={() => toggleClub(club ? club : "")}
                style={styles.item}
              >
                <Text style={styles.itemText}>
                  {selectedClubs.includes(club ? club : "") ? "✅" : "⬜"}{" "}
                  {club}
                </Text>
              </TouchableOpacity>
            ))}
          </FilterSection>

          <FilterSection
            title="Season"
            isOpen={openSection === "Season"}
            onToggle={() =>
              setOpenSection(openSection === "Season" ? null : "Season")
            }
          >
            {allSeasons.map((season) => (
              <TouchableOpacity
                key={season}
                onPress={() => toggleSeason(season ? season : "")}
                style={styles.item}
              >
                <Text style={styles.itemText}>
                  {selectedSeasons.includes(season ? season : "") ? "✅" : "⬜"}{" "}
                  {season}
                </Text>
              </TouchableOpacity>
            ))}
          </FilterSection>

          <FilterSection
            title="Kit Type"
            isOpen={openSection === "Kit Type"}
            onToggle={() =>
              setOpenSection(openSection === "Kit Type" ? null : "Kit Type")
            }
          >
            {allKitTypes.map((kitType) => (
              <TouchableOpacity
                key={kitType}
                onPress={() => toggleKitType(kitType ? kitType : "")}
                style={styles.item}
              >
                <Text style={styles.itemText}>
                  {selectedKitTypes.includes(kitType ? kitType : "")
                    ? "✅"
                    : "⬜"}{" "}
                  {kitType}
                </Text>
              </TouchableOpacity>
            ))}
          </FilterSection>
        </ScrollView>

        <TouchableOpacity style={styles.applyButton} onPress={onClose}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    alignSelf: "center",
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  itemText: { color: "#fff", fontSize: 16 },
  applyButton: {
    backgroundColor: "#05C785",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  applyButtonText: { color: "white", fontWeight: "bold" },
  closeButton: {
    backgroundColor: "#333",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
