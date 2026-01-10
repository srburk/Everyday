import { useEffect, useState, useLayoutEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import { YearHeatmap } from "../../components/heatmap/YearHeatmap";
import { Colors } from "../../constants/colors";
import { useHaptics } from "../../hooks/useHaptics";
import {
  getHabitById,
  getCompletions,
  toggleCompletion,
  archiveHabit,
} from "../../services/habitService";
import type { Habit, HabitCompletion } from "../../models/habit";

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const db = useSQLiteContext();
  const haptics = useHaptics();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;

    const [habitData, completionData] = await Promise.all([
      getHabitById(db, id),
      getCompletions(db, id),
    ]);

    setHabit(habitData);
    setCompletions(completionData);
    setLoading(false);
  }, [id, db]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            await archiveHabit(db, id);
            router.back();
          },
        },
      ]
    );
  }, [id, db, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: habit?.name || "",
      headerRight: () => (
        <Pressable onPress={handleDelete}>
          {Platform.OS === "ios" ? (
            <SymbolView
              name="trash"
              size={20}
              tintColor={Colors.systemRed}
              weight="medium"
            />
          ) : (
            <Ionicons name="trash-outline" size={24} color={Colors.systemRed} />
          )}
        </Pressable>
      ),
    });
  }, [navigation, habit, handleDelete]);

  const handleDayPress = async (date: string) => {
    if (!id) return;
    haptics.medium();
    await toggleCompletion(db, id, date);
    await loadData();
  };

  if (loading || !habit) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const completionDates = completions.map((c) => c.completedAt);
  const totalCompletions = completions.length;

  const getFrequencyLabel = () => {
    switch (habit.frequency.type) {
      case "daily":
        return "Every day";
      case "specific_days":
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = habit.frequency.days?.map((d) => dayNames[d]).join(", ");
        return days || "Specific days";
      case "times_per_week":
        return `${habit.frequency.timesPerWeek}x per week`;
      default:
        return "";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.header}>
        <View style={[styles.colorBadge, { backgroundColor: habit.color }]} />
        <View style={styles.headerInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.frequency}>{getFrequencyLabel()}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalCompletions}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{new Date().getFullYear()}</Text>
        <View style={styles.heatmapContainer}>
          <YearHeatmap
            completions={completionDates}
            frequency={habit.frequency}
            color={habit.color}
            onDayPress={handleDayPress}
          />
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={styles.legendColors}>
          <View style={[styles.legendColor, { backgroundColor: Colors.heatmapEmpty }]} />
          <View style={[styles.legendColor, { backgroundColor: habit.color, opacity: 0.25 }]} />
          <View style={[styles.legendColor, { backgroundColor: habit.color, opacity: 0.5 }]} />
          <View style={[styles.legendColor, { backgroundColor: habit.color, opacity: 0.75 }]} />
          <View style={[styles.legendColor, { backgroundColor: habit.color }]} />
        </View>
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: Colors.secondaryLabel,
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  colorBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.label,
    marginBottom: 4,
  },
  frequency: {
    fontSize: 15,
    color: Colors.secondaryLabel,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.label,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.secondaryLabel,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.label,
    marginBottom: 16,
  },
  heatmapContainer: {
    alignItems: "flex-start",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  legendLabel: {
    fontSize: 11,
    color: Colors.secondaryLabel,
  },
  legendColors: {
    flexDirection: "row",
    gap: 2,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
