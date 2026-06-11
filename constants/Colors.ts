const tintColorDark = "#05C785";

export const Colors = {
  theme: {
    background: "#121212",
    surface: "#1A1A1A", // dark gray for cards and modals
    surfaceBorder: "#262626", // card border color
    primary: "#05C785",
    primaryTint: "#1C2E24",
    text: "#05C785", // light green for main text
    textMuted: "#9CA3AF",
    textDark: "#6B7280",
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
