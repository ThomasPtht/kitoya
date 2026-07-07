import { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export const FilterSection = ({ title, children, isOpen, onToggle }: any) => (
  <View style={styles.sectionContainer}>
    <TouchableOpacity style={styles.header} onPress={onToggle}>
      <Text style={styles.title}>{title}</Text>
      <Feather
        name={isOpen ? "chevron-up" : "chevron-down"}
        size={20}
        color="white"
      />
    </TouchableOpacity>
    {isOpen && <View style={styles.content}>{children}</View>}
  </View>
);

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: "#1E1E1E", // Gris sombre
    borderRadius: 12,
    marginBottom: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333", // Bordure fine
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: "white", fontSize: 18, fontWeight: "600" },
  content: { marginTop: 15 },
  item: { paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  itemText: { color: "#ccc", fontSize: 16 },
});
