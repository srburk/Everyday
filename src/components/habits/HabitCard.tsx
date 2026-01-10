import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import type { HabitWithStats } from "../../models/habit";
import { useHaptics } from "../../hooks/useHaptics";

interface HabitCardProps {
  habit: HabitWithStats;
  onPress: () => void;
  onToggle: () => void;
}

export function HabitCard({ habit, onPress, onToggle }: HabitCardProps) {
  const haptics = useHaptics();

  const handleToggle = () => {
    haptics.medium();
    onToggle();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {habit.name}
          </Text>
          <View style={styles.streak}>
            {habit.currentStreak > 0 && (
              <>
                <Ionicons
                  name="flame"
                  size={14}
                  color={Colors.systemOrange}
                />
                <Text style={styles.streakText}>{habit.currentStreak}</Text>
              </>
            )}
            {habit.frequency.type === "times_per_week" && (
              <Text style={styles.weeklyProgress}>
                {habit.completionsThisWeek}/{habit.frequency.timesPerWeek} this week
              </Text>
            )}
          </View>
        </View>
      </View>
      <Pressable
        style={styles.checkButton}
        onPress={handleToggle}
        hitSlop={8}
      >
        <Ionicons
          name={habit.completedToday ? "checkmark-circle" : "ellipse-outline"}
          size={28}
          color={habit.completedToday ? habit.color : Colors.separator}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "500",
    color: Colors.label,
  },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  streakText: {
    fontSize: 13,
    color: Colors.systemOrange,
    marginLeft: 2,
    fontWeight: "500",
  },
  weeklyProgress: {
    fontSize: 13,
    color: Colors.secondaryLabel,
  },
  checkButton: {
    padding: 4,
  },
});
