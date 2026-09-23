import React, { useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface AnimatedHeartIconProps {
  liked: boolean;
  size?: number;
  likedColor?: string;
  mutedColor?: string;
}

// Small reusable "pulse" heart used everywhere a jersey can be liked
// (public locker, Kit of the Day card & modal). Bursts on the like/unlike
// transition instead of just swapping the icon color instantly.
export default function AnimatedHeartIcon({
  liked,
  size = 16,
  likedColor = "#05C785",
  mutedColor = "#9CA3AF",
}: AnimatedHeartIconProps) {
  const scale = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      // Don't animate the very first render (e.g. opening a list of already-liked jerseys).
      isFirstRender.current = false;
      return;
    }

    scale.value = withSequence(
      withSpring(liked ? 1.4 : 0.8, { damping: 4, stiffness: 320 }),
      withSpring(1, { damping: 6, stiffness: 220 }),
    );
  }, [liked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons
        name="heart"
        size={size}
        color={liked ? likedColor : mutedColor}
      />
    </Animated.View>
  );
}
