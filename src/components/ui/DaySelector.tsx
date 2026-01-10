import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { useHaptics } from "../../hooks/useHaptics";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface DaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
  color?: string;
}

export function DaySelector({
  selectedDays,
  onChange,
  color = Colors.systemBlue,
}: DaySelectorProps) {
  const haptics = useHaptics();

  const toggleDay = (index: number) => {
    haptics.selection();
    if (selectedDays.includes(index)) {
      onChange(selectedDays.filter((d) => d !== index));
    } else {
      onChange([...selectedDays, index].sort());
    }
  };

  return (
    <View style={styles.container}>
      {DAYS.map((day, index) => {
        const isSelected = selectedDays.includes(index);
        return (
          <Pressable
            key={index}
            style={[
              styles.day,
              isSelected && { backgroundColor: color },
            ]}
            onPress={() => toggleDay(index)}
          >
            <Text
              style={[
                styles.dayText,
                isSelected && styles.dayTextSelected,
              ]}
            >
              {day}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.secondaryLabel,
  },
  dayTextSelected: {
    color: Colors.background,
  },
});
