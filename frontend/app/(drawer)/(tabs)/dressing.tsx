import { StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";

export default function TabDressingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dressing</Text>
      
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
