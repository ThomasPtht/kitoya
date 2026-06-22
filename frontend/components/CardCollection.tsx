import Colors from "@/constants/Colors";
import React from "react";
import { View, StyleSheet, Text, Image } from "react-native";

export default function CardCollection( ) {

const { name, country, logo } = data;

  return (
    <View style={styles.cardContainer}>
      <Image></Image>
      <Text></Text>
      <Text></Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
});
