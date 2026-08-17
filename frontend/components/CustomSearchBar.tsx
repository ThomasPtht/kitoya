import React from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";

interface CustomSearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const CustomSearchBar = ({
  value,
  onChangeText,
  ...props
}: CustomSearchBarProps) => {
  const { t } = useTranslation();

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
        placeholder={t("common.searchPlaceholder")}
        placeholderTextColor={Colors.theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        clearButtonMode="while-editing"
        {...props}
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
