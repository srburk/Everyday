import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HabitCard } from "./HabitCard";
import type { HabitWithStats } from "../../models/habit";
import { Colors } from "../../constants/colors";

interface HabitListProps {
  habits: HabitWithStats[];
  onHabitPress: (habitId: string) => void;
  onToggle: (habitId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function HabitList({
  habits,
  onHabitPress,
  onToggle,
  refreshing,
  onRefresh,
}: HabitListProps) {
  const insets = useSafeAreaInsets();

  if (habits.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.emptyTitle}>No habits yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to create your first habit
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <HabitCard
          habit={item}
          onPress={() => onHabitPress(item.id)}
          onToggle={() => onToggle(item.id)}
        />
      )}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.label,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.secondaryLabel,
    textAlign: "center",
  },
});
