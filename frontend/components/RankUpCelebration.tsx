import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface RankUpCelebrationProps {
  visible: boolean;
  rank: string;
  onDismiss: () => void;
}

const VISIBLE_DURATION = 2200;

export default function RankUpCelebration({
  visible,
  rank,
  onDismiss,
}: RankUpCelebrationProps) {
  const { t } = useTranslation();
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withSequence(
        withTiming(1, { duration: 250 }),
        withDelay(
          VISIBLE_DURATION,
          withTiming(0, { duration: 350 }, (finished) => {
            if (finished) runOnJS(onDismiss)();
          }),
        ),
      );
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, overlayStyle]}>
      <Animated.View
        entering={ZoomIn.springify().damping(10)}
        style={styles.badge}
      >
        <MaterialCommunityIcons name="trophy-award" size={30} color="#05C785" />
        <Text style={styles.title}>{t("rankUp.title")}</Text>
        <Text style={styles.rankName}>{rank.toUpperCase()}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 999,
  },
  badge: {
    backgroundColor: "#161E1A",
    borderWidth: 1.5,
    borderColor: "#05C785",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: "center",
    gap: 8,
    shadowColor: "#05C785",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginTop: 6,
  },
  rankName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
