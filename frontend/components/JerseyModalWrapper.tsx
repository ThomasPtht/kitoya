import { Modal, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import JerseyDetail from "./JerseyDetail";
import type { JerseyData } from "@/services/jersey.service";

interface JerseyModalWrapperProps {
  visible: boolean;
  onClose: () => void;
  jersey: JerseyData | null;
}

export default function JerseyModalWrapper({
  visible,
  onClose,
  jersey,
}: JerseyModalWrapperProps) {
  if (!jersey) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <JerseyDetail jersey={jersey} onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  modalHeader: {
    padding: 10,
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  closeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    alignSelf: "flex-end",
    padding: 10,
  },
  content: {
    flex: 1,
  },
});
