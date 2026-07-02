import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useJerseys } from "@/hooks/useJerseyHook";
import CardCollection from "@/components/CardCollection";
import { useState } from "react";
import { JerseyData } from "@/services/jersey.service";
import JerseyModalWrapper from "@/components/JerseyModalWrapper";

export default function TabDressingScreen() {
  // On récupère les maillots depuis ton hook
  const { data: jerseys, isLoading } = useJerseys();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJersey, setSelectedJersey] = useState<JerseyData | null>(null);
  const { width } = useWindowDimensions();

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
    paddingTop: 50,
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
});
