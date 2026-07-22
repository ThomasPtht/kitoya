import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const router = useRouter();

  // Feedback state
  const [feedbackType, setFeedbackType] = useState<
    "Question" | "Bug" | "Feature"
  >("Question");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  // FAQ accordion state (index of open item, default first open)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "How do I add a new kit?",
      answer:
        "Tap the central + button in the tab bar, then choose Scan, Upload or Manual entry. Scan is the fastest way to digitise a jersey.",
    },
    {
      question: "What is the collector score?",
      answer:
        "Your collector score represents the overall value, rarity, and completeness of your documented sports jersey archive based on verified version details.",
    },
    {
      question: "Can I export my collection?",
      answer:
        "Yes! You can export your collection data anytime in CSV, JSON, or as a printable PDF portfolio directly from your archive settings.",
    },
    {
      question: "How does the affiliate link work?",
      answer:
        "Share your customized locker or collection links with fellow collectors. When they join or interact through your link, you unlock exclusive tracking badges.",
    },
    {
      question: "Is my locker public?",
      answer:
        "By default, your locker privacy settings are flexible. You can choose to keep your entire collection private or share specific items publicly.",
    },
  ];

  const handleEmailSupport = () => {
    Linking.openURL("mailto:hello@kitroom.app");
  };

  const handleSendFeedback = () => {
    if (!message.trim()) {
      Alert.alert(
        "Error",
        "Please enter a message before sending your feedback.",
      );
      return;
    }
    Alert.alert(
      "Success",
      "Thank you! Your feedback has been sent successfully.",
    );
    setMessage("");
    setEmail("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.supportSubtitle}>SUPPORT</Text>
          <Text style={styles.headerTitle}>Help & feedback</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions Section */}
        <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>
        <View style={styles.cardContainer}>
          <Pressable style={styles.quickActionRow} onPress={handleEmailSupport}>
            <View style={styles.quickActionLeft}>
              <Feather name="mail" size={18} color="#05C785" />
              <Text style={styles.quickActionText}>Email support</Text>
            </View>
            <Text style={styles.quickActionValue}>hello@kitroom.app</Text>
          </Pressable>

          <View style={styles.separator} />

          <Pressable
            style={styles.quickActionRow}
            onPress={() => setFeedbackType("Bug")}
          >
            <View style={styles.quickActionLeft}>
              <Feather name="alert-octagon" size={18} color="#05C785" />
              <Text style={styles.quickActionText}>Report a bug</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#555" />
          </Pressable>

          <View style={styles.separator} />

          <Pressable
            style={styles.quickActionRow}
            onPress={() => setFeedbackType("Feature")}
          >
            <View style={styles.quickActionLeft}>
              <Feather name="life-buoy" size={18} color="#05C785" />
              <Text style={styles.quickActionText}>Suggest a feature</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#555" />
          </Pressable>
        </View>

        {/* Frequently Asked Section */}
        <Text style={styles.sectionHeader}>FREQUENTLY ASKED</Text>

        {faqs.map((faq, index) => {
          const isOpen = openFaqIndex === index;
          return (
            <Pressable
              key={index}
              style={[styles.faqCard, isOpen && styles.faqCardActive]}
              onPress={() => setOpenFaqIndex(isOpen ? null : index)}
            >
              <View style={styles.faqHeaderRow}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Feather
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={isOpen ? "#05C785" : "#888"}
                />
              </View>
              {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </Pressable>
          );
        })}

        {/* Send Feedback Section */}
        <Text style={styles.sectionHeader}>SEND FEEDBACK</Text>
        <View style={styles.feedbackCard}>
          {/* Type Selector Tabs */}
          <View style={styles.tabContainer}>
            {(["Question", "Bug", "Feature"] as const).map((type) => {
              const active = feedbackType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                  onPress={() => setFeedbackType(type)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.tabText, active && styles.tabTextActive]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Message Input */}
          <Text style={styles.inputLabel}>MESSAGE</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Tell us what's on your mind..."
            placeholderTextColor="#555"
            multiline
            value={message}
            onChangeText={setMessage}
          />

          {/* Email Input */}
          <Text style={styles.inputLabel}>EMAIL (OPTIONAL)</Text>
          <TextInput
            style={styles.emailInput}
            placeholder="you@example.com"
            placeholderTextColor="#555"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSendFeedback}
            activeOpacity={0.8}
          >
            <Feather
              name="send"
              size={16}
              color="#121212"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.submitButtonText}>Send feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
  supportSubtitle: {
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#05C785",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 10,
  },
  cardContainer: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#1E2B24",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 25,
  },
  quickActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  quickActionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  quickActionValue: {
    fontSize: 14,
    color: "#888",
  },
  separator: {
    height: 1,
    backgroundColor: "#222222",
  },
  faqCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#1E2B24",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  faqCardActive: {
    borderColor: "#05C785",
    backgroundColor: "#181f1c",
  },
  faqHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    color: "#AAAAAA",
    marginTop: 12,
    lineHeight: 18,
  },
  feedbackCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#1E2B24",
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#111111",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#05C785",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888888",
  },
  tabTextActive: {
    color: "#121212",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#888888",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  messageInput: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  emailInput: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#05C785",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#121212",
    fontSize: 15,
    fontWeight: "bold",
  },
});
