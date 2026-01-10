import { Pressable, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

interface HeatmapDayProps {
  date: Date | null;
  isCompleted: boolean;
  isScheduled: boolean;
  color: string;
  onPress?: () => void;
}

export function HeatmapDay({
  date,
  isCompleted,
  isScheduled,
  color,
  onPress,
}: HeatmapDayProps) {
  if (!date) {
    return <Pressable style={[styles.cell, styles.empty]} disabled />;
  }

  let backgroundColor = Colors.heatmapEmpty;

  if (isCompleted) {
    backgroundColor = color;
  } else if (isScheduled) {
    // Lighter shade for scheduled but not completed
    backgroundColor = adjustOpacity(color, 0.15);
  }

  return (
    <Pressable
      style={[styles.cell, { backgroundColor }]}
      onPress={onPress}
    />
  );
}

function adjustOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const styles = StyleSheet.create({
  cell: {
    width: 10,
    height: 10,
    borderRadius: 2,
    margin: 1,
  },
  empty: {
    backgroundColor: "transparent",
  },
});
