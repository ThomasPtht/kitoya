import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

// Sits at the top of a pull-to-refresh list (as a ListHeaderComponent or a
// plain child right before the content) while the native RefreshControl's
// own indicator is made transparent, so this football takes its place.
export default function PullToRefreshBall({
  refreshing,
}: {
  refreshing: boolean;
}) {
  const spin = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      spin.value = 0;
      spin.value = withRepeat(
        withTiming(1, { duration: 650, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [refreshing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  if (!refreshing) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={styles.container}
    >
      <Animated.View style={animatedStyle}>
        <MaterialCommunityIcons
          name="soccer"
          size={24}
          color={Colors.theme.primary}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 10,
  },
});
