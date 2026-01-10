export const Colors = {
  // Backgrounds
  background: "#FFFFFF",
  secondaryBackground: "#F2F2F7",
  tertiaryBackground: "#FFFFFF",

  // Labels
  label: "#000000",
  secondaryLabel: "rgba(60, 60, 67, 0.6)",
  tertiaryLabel: "rgba(60, 60, 67, 0.3)",
  quaternaryLabel: "rgba(60, 60, 67, 0.18)",

  // System colors
  systemBlue: "#007AFF",
  systemGreen: "#34C759",
  systemOrange: "#FF9500",
  systemRed: "#FF3B30",
  systemPurple: "#AF52DE",
  systemPink: "#FF2D55",
  systemTeal: "#5AC8FA",
  systemIndigo: "#5856D6",

  // Separators
  separator: "rgba(60, 60, 67, 0.29)",
  opaqueSeparator: "#C6C6C8",

  // Heatmap levels (grayscale for empty)
  heatmapEmpty: "#EBEDF0",
};

export const HabitColors = [
  "#007AFF", // Blue
  "#34C759", // Green
  "#FF9500", // Orange
  "#FF3B30", // Red
  "#AF52DE", // Purple
  "#FF2D55", // Pink
  "#5AC8FA", // Teal
  "#5856D6", // Indigo
];

export function getHeatmapLevels(baseColor: string): string[] {
  // Returns 5 levels: empty, 25%, 50%, 75%, 100%
  return [
    Colors.heatmapEmpty,
    adjustColorOpacity(baseColor, 0.25),
    adjustColorOpacity(baseColor, 0.5),
    adjustColorOpacity(baseColor, 0.75),
    baseColor,
  ];
}

function adjustColorOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
