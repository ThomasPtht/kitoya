import React from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface CustomSearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const CustomSearchBar = ({
  value,
  onChangeText,
}: CustomSearchBarProps) => {
  return (
    <View style={styles.searchContainer}>
      <Feather
        name="search"
        size={20}
        color={Colors.theme.textMuted}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder="Search by club or season"
        placeholderTextColor={Colors.theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        clearButtonMode="while-editing"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.theme.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.theme.primary,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.theme.text,
    fontSize: 16,
  },
});
