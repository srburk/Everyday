import { StyleSheet, Text, View, Pressable } from "react-native";
import { Colors } from "../../constants/colors";
import { DaySelector } from "../ui/DaySelector";
import { useHaptics } from "../../hooks/useHaptics";
import type { HabitFrequency, FrequencyType } from "../../models/habit";

interface FrequencyPickerProps {
  frequency: HabitFrequency;
  onChange: (frequency: HabitFrequency) => void;
  color?: string;
}

const FREQUENCY_OPTIONS: { type: FrequencyType; label: string }[] = [
  { type: "daily", label: "Daily" },
  { type: "specific_days", label: "Specific Days" },
  { type: "times_per_week", label: "Weekly Goal" },
];

export function FrequencyPicker({
  frequency,
  onChange,
  color = Colors.systemBlue,
}: FrequencyPickerProps) {
  const haptics = useHaptics();

  const handleTypeChange = (type: FrequencyType) => {
    haptics.selection();
    const newFrequency: HabitFrequency = { type };

    if (type === "specific_days") {
      newFrequency.days = [1, 3, 5]; // Default: Mon, Wed, Fri
    } else if (type === "times_per_week") {
      newFrequency.timesPerWeek = 3; // Default: 3x per week
    }

    onChange(newFrequency);
  };

  const handleDaysChange = (days: number[]) => {
    onChange({ ...frequency, days });
  };

  const handleTimesChange = (delta: number) => {
    haptics.selection();
    const current = frequency.timesPerWeek || 3;
    const newValue = Math.max(1, Math.min(7, current + delta));
    onChange({ ...frequency, timesPerWeek: newValue });
  };

  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        {FREQUENCY_OPTIONS.map((option) => {
          const isSelected = frequency.type === option.type;
          return (
            <Pressable
              key={option.type}
              style={[
                styles.segment,
                isSelected && { backgroundColor: color },
              ]}
              onPress={() => handleTypeChange(option.type)}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {frequency.type === "specific_days" && (
        <View style={styles.optionContainer}>
          <Text style={styles.optionLabel}>Select days</Text>
          <DaySelector
            selectedDays={frequency.days || []}
            onChange={handleDaysChange}
            color={color}
          />
        </View>
      )}

      {frequency.type === "times_per_week" && (
        <View style={styles.optionContainer}>
          <Text style={styles.optionLabel}>Times per week</Text>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepperButton}
              onPress={() => handleTimesChange(-1)}
            >
              <Text style={styles.stepperButtonText}>-</Text>
            </Pressable>
            <Text style={[styles.stepperValue, { color }]}>
              {frequency.timesPerWeek || 3}
            </Text>
            <Pressable
              style={styles.stepperButton}
              onPress={() => handleTimesChange(1)}
            >
              <Text style={styles.stepperButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.secondaryLabel,
  },
  segmentTextSelected: {
    color: Colors.background,
  },
  optionContainer: {
    gap: 12,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.secondaryLabel,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondaryBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonText: {
    fontSize: 24,
    fontWeight: "400",
    color: Colors.label,
  },
  stepperValue: {
    fontSize: 32,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
});
