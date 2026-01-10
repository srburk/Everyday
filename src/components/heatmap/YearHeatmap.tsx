import { ScrollView, StyleSheet, Text, View } from "react-native";
import { format, getMonth } from "date-fns";
import { HeatmapDay } from "./HeatmapDay";
import { Colors } from "../../constants/colors";
import { getWeeksInYear, formatDateString, isScheduledDay } from "../../utils/dates";
import type { HabitFrequency } from "../../models/habit";

interface YearHeatmapProps {
  completions: string[];
  frequency: HabitFrequency;
  color: string;
  year?: number;
  onDayPress?: (date: string) => void;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "M", "", "W", "", "F", ""];

export function YearHeatmap({
  completions,
  frequency,
  color,
  year = new Date().getFullYear(),
  onDayPress,
}: YearHeatmapProps) {
  const weeks = getWeeksInYear(year);
  const completionSet = new Set(completions);

  // Calculate month label positions
  const monthPositions: { month: number; weekIndex: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find((d) => d !== null);
    if (firstValidDay) {
      const month = getMonth(firstValidDay);
      if (month !== lastMonth) {
        monthPositions.push({ month, weekIndex });
        lastMonth = month;
      }
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.dayLabels}>
        {DAY_LABELS.map((label, i) => (
          <Text key={i} style={styles.dayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <View style={styles.monthLabels}>
            {monthPositions.map(({ month, weekIndex }) => (
              <Text
                key={month}
                style={[
                  styles.monthLabel,
                  { left: weekIndex * 12 },
                ]}
              >
                {MONTH_LABELS[month]}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.week}>
                {week.map((date, dayIndex) => {
                  const dateStr = date ? formatDateString(date) : "";
                  const isCompleted = date ? completionSet.has(dateStr) : false;
                  const isScheduled = date ? isScheduledDay(date, frequency) : false;

                  return (
                    <HeatmapDay
                      key={dayIndex}
                      date={date}
                      isCompleted={isCompleted}
                      isScheduled={isScheduled}
                      color={color}
                      onPress={date && onDayPress ? () => onDayPress(dateStr) : undefined}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  dayLabels: {
    marginRight: 4,
    marginTop: 20,
  },
  dayLabel: {
    fontSize: 9,
    color: Colors.secondaryLabel,
    height: 12,
    lineHeight: 12,
  },
  scrollContent: {
    paddingRight: 16,
  },
  monthLabels: {
    height: 16,
    position: "relative",
  },
  monthLabel: {
    position: "absolute",
    fontSize: 9,
    color: Colors.secondaryLabel,
  },
  grid: {
    flexDirection: "row",
  },
  week: {
    flexDirection: "column",
  },
});
