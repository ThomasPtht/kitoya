const tintColorDark = "#05C785";

export const Colors = {
  theme: {
    background: "#0A0F0C",
    surface: "#050806", // dark gray for cards and modals
    surfaceBorder: "#262626", // card border color
    primary: "#05C785",
    primaryTint: "#161E1A", 
    text: "#05C785", // light green for main text
    textMuted: "#9CA3AF",
    textDark: "#6B7280",
    hairlineBrand: "oklch(0.78 0.19 155 / 0.45)",
  },
};

export default {
  light: {
    text: Colors.theme.text,
    background: Colors.theme.background,
    tint: tintColorDark,
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorDark,
  },
  dark: {
    text: Colors.theme.text,
    background: Colors.theme.background,
    tint: tintColorDark,
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorDark,
  },
};
