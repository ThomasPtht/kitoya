import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import { useJerseyCount, useJerseys } from "@/hooks/useJerseyHook";
import { jerseyService } from "@/services/jersey.service";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { exportCollectionToPdf } from "../lib/pdf-export";
import { useUserMe } from "@/hooks/useAuthHook";

type ExportFormat = "csv" | "json" | "pdf";

export default function ExportCollectionScreen() {
  const router = useRouter();
  const { data: userMe, isLoading: isUserLoading } = useUserMe();

  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [includeStories, setIncludeStories] = useState(true);
  const [includePurchaseHistory, setIncludePurchaseHistory] = useState(true);

  const { data: count } = useJerseyCount();
  const { data: jerseyData = [] } = useJerseys();

  const isAdmin = userMe?.role === "ADMIN";
  const isElite =
    (userMe?.subscription?.planType === "ELITE_MONTHLY" ||
      userMe?.subscription?.planType === "ELITE_YEARLY") &&
    userMe?.subscription?.status === "active";
  const hasEliteAccess = isAdmin || isElite;

  if (isUserLoading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={{ color: "#888888" }}>Loading...</Text>
      </View>
    );
  }

  if (!hasEliteAccess) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Export collection</Text>
        </View>

        <View style={styles.lockedContainer}>
          <View style={styles.lockIconContainer}>
            <Feather name="lock" size={32} color="#05C785" />
          </View>
          <Text style={styles.lockedTitle}>ELITE Feature</Text>
          <Text style={styles.lockedText}>
            Exporting your collection (CSV, JSON, PDF) is reserved for Kitroom
            ELITE members.
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
            <Text style={styles.exportButtonText}>Discover ELITE Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleExport = async () => {
    if (!jerseyData || jerseyData.length === 0) {
      Alert.alert("Error", "No data available to export");
      return;
    }

    try {
      setLoading(true);

      if (selectedFormat === "pdf") {
        await exportCollectionToPdf(jerseyData);
        return;
      }

      let fileContent = "";
      let fileName = "";
      let mimeType = "";
      let uti = "";

      if (selectedFormat === "json") {
        fileContent = JSON.stringify(jerseyData, null, 2);
        fileName = `kitroom_collection_${Date.now()}.json`;
        mimeType = "application/json";
        uti = "public.json";
      } else if (selectedFormat === "csv") {
        let headers =
          "ID,Club,Season,Player Name,Number,Type,Size,Condition,Version";
        if (includePurchaseHistory) {
          headers += ",Purchase Date,Purchase Price";
        }
        if (includeStories) {
          headers += ",Description";
        }
        headers += "\n";

        const rows = jerseyData
          .map((jersey: any) => {
            let row = `"${jersey.id || ""}","${jersey.club?.name || ""}","${jersey.season || ""}","${jersey.playerName || ""}","${jersey.number || ""}","${jersey.type || ""}","${jersey.size || ""}","${jersey.condition || ""}","${jersey.version || ""}"`;

            if (includePurchaseHistory) {
              row += `,"${jersey.purchaseDate || ""}","${jersey.purchasePrice || ""}"`;
            }
            if (includeStories) {
              row += `,"${jersey.description || ""}"`;
            }
            return row;
          })
          .join("\n");

        fileContent = headers + rows;
        fileName = `kitroom_collection_${Date.now()}.csv`;
        mimeType = "text/csv";
        uti = "public.comma-separated-values-text";
      }

      const file = new File(Paths.cache, fileName);

      if (!file.exists) {
        file.create();
      }

      file.write(fileContent);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: mimeType,
        dialogTitle: "Export your Collection",
        UTI: uti,
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to export collection");
    } finally {
      setLoading(false);
    }
  };

  const getFormatLabel = () => {
    switch (selectedFormat) {
      case "csv":
        return "Export CSV";
      case "json":
        return "Export JSON";
      case "pdf":
        return "Export PDF";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.archiveSubtitle}>ARCHIVE</Text>
          <Text style={styles.headerTitle}>Export collection</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statCard}>
          <View>
            <Text style={styles.statSubText}>IN YOUR ARCHIVE</Text>
            <Text style={styles.statMainText}>
              {count} {count > 1 ? "kits" : "kit"}
            </Text>
          </View>
          <Feather name="download" size={22} color="#05C785" />
        </View>

        <Text style={styles.sectionHeader}>FORMAT</Text>

        <Pressable
          style={[
            styles.optionCard,
            selectedFormat === "csv" && styles.optionCardActive,
          ]}
          onPress={() => setSelectedFormat("csv")}
        >
          <View style={styles.optionLeft}>
            <View style={styles.iconContainer}>
              <Feather name="file-text" size={20} color="#05C785" />
            </View>
            <View>
              <Text style={styles.optionTitle}>CSV spreadsheet</Text>
              <Text style={styles.optionDesc}>
                Open in Excel, Numbers or Sheets
              </Text>
            </View>
          </View>
          {selectedFormat === "csv" && (
            <Feather name="check-circle" size={20} color="#05C785" />
          )}
        </Pressable>

        <Pressable
          style={[
            styles.optionCard,
            selectedFormat === "json" && styles.optionCardActive,
          ]}
          onPress={() => setSelectedFormat("json")}
        >
          <View style={styles.optionLeft}>
            <View style={styles.iconContainer}>
              <Feather name="code" size={20} color="#05C785" />
            </View>
            <View>
              <Text style={styles.optionTitle}>JSON archive</Text>
              <Text style={styles.optionDesc}>
                Full data, developer friendly
              </Text>
            </View>
          </View>
          {selectedFormat === "json" && (
            <Feather name="check-circle" size={20} color="#05C785" />
          )}
        </Pressable>

        <Pressable
          style={[
            styles.optionCard,
            selectedFormat === "pdf" && styles.optionCardActive,
          ]}
          onPress={() => {
            setSelectedFormat("pdf");
          }}
        >
          <View style={styles.optionLeft}>
            <View style={styles.iconContainer}>
              <Feather name="file" size={20} color="#05C785" />
            </View>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.optionTitle}>PDF portfolio</Text>
              </View>
              <Text style={styles.optionDesc}>
                Printable, shareable summary
              </Text>
            </View>
          </View>
          {selectedFormat === "pdf" && (
            <Feather name="check-circle" size={20} color="#05C785" />
          )}
        </Pressable>

        <Text style={styles.sectionHeader}>INCLUDE</Text>

        <View style={styles.switchesContainer}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Kit stories</Text>
            <Switch
              value={includeStories}
              onValueChange={setIncludeStories}
              trackColor={{ false: "#2a2a2a", true: "#05C785" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Purchase history</Text>
            <Switch
              value={includePurchaseHistory}
              onValueChange={setIncludePurchaseHistory}
              trackColor={{ false: "#2a2a2a", true: "#05C785" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Feather
            name="download"
            size={18}
            color="#121212"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.exportButtonText}>
            {loading ? "Exporting..." : getFormatLabel()}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerInfo}>
          Your data stays yours. Files download directly to this device.
        </Text>
      </ScrollView>
    </View>
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
    paddingTop: 60,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#05C785",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statSubText: {
    fontSize: 12,
    color: "#888888",
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statMainText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#05C785",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#888888",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 5,
  },
  optionCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#222222",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  optionCardActive: {
    borderColor: "#05C785",
    backgroundColor: "#181f1c",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 13,
    color: "#888888",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(5, 199, 133, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  proText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#05C785",
  },
  switchesContainer: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#222222",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  separator: {
    height: 1,
    backgroundColor: "#222222",
  },
  exportButton: {
    backgroundColor: "#05C785",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  exportButtonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerInfo: {
    textAlign: "center",
    color: "#777777",
    fontSize: 12,
  },
});
