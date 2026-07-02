import { StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Text, View } from "@/components/Themed";
import { useJerseys } from "@/hooks/useJerseyHook";
import CardCollection from "@/components/CardCollection";

export default function TabDressingScreen() {
  // On récupère les maillots depuis ton hook
  const { data: jerseys, isLoading } = useJerseys();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Dressing</Text>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={jerseys}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <CardCollection jersey={item} width="48%" />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
    // paddingHorizontal: 10,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
});
