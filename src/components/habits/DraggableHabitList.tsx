import { useCallback, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  PanResponder,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useHaptics } from "../../hooks/useHaptics";
import type { HabitWithStats } from "../../models/habit";

const ITEM_HEIGHT = 72;
const LONG_PRESS_DURATION = 300;

interface DraggableHabitListProps {
  habits: HabitWithStats[];
  onHabitPress: (habitId: string) => void;
  onToggle: (habitId: string) => void;
  onReorder: (orderedIds: string[]) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

interface HabitItemProps {
  habit: HabitWithStats;
  onPress: () => void;
  onToggle: () => void;
  onLongPress: () => void;
  isDragging: boolean;
  isBeingDragged: boolean;
  translateY: Animated.Value;
  scale: Animated.Value;
}

function HabitItem({
  habit,
  onPress,
  onToggle,
  onLongPress,
  isDragging,
  isBeingDragged,
  translateY,
  scale,
}: HabitItemProps) {
  const haptics = useHaptics();

  const handleToggle = () => {
    if (!isDragging) {
      haptics.medium();
      onToggle();
    }
  };

  const animatedStyle = isBeingDragged
    ? {
        transform: [{ translateY }, { scale }],
        zIndex: 1000,
        shadowOpacity: 0.2,
      }
    : {};

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && !isDragging && styles.pressed,
        ]}
        onPress={isDragging ? undefined : onPress}
        onLongPress={onLongPress}
        delayLongPress={LONG_PRESS_DURATION}
      >
        <View style={styles.content}>
          {habit.icon ? (
            <View style={[styles.iconContainer, { backgroundColor: habit.color }]}>
              <Ionicons
                name={habit.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={Colors.background}
              />
            </View>
          ) : (
            <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
          )}
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
    </Animated.View>
  );
}

export function DraggableHabitList({
  habits,
  onHabitPress,
  onToggle,
  onReorder,
}: DraggableHabitListProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const [orderedHabits, setOrderedHabits] = useState<HabitWithStats[]>(habits);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(-1);

  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Update ordered habits when habits prop changes
  if (JSON.stringify(habits.map(h => h.id)) !== JSON.stringify(orderedHabits.map(h => h.id)) && !isDragging) {
    setOrderedHabits(habits);
  }

  const handleLongPress = useCallback((index: number) => {
    haptics.medium();
    setIsDragging(true);
    setDraggedIndex(index);
    Animated.spring(scale, {
      toValue: 1.03,
      useNativeDriver: true,
    }).start();
  }, [haptics, scale]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isDragging,
      onMoveShouldSetPanResponder: () => isDragging,
      onPanResponderMove: (_, gestureState) => {
        if (!isDragging || draggedIndex < 0) return;

        translateY.setValue(gestureState.dy);

        const newIndex = Math.round(
          Math.max(
            0,
            Math.min(
              orderedHabits.length - 1,
              draggedIndex + gestureState.dy / ITEM_HEIGHT
            )
          )
        );

        if (newIndex !== draggedIndex) {
          haptics.selection();
          const newOrder = [...orderedHabits];
          const [movedItem] = newOrder.splice(draggedIndex, 1);
          newOrder.splice(newIndex, 0, movedItem);
          setOrderedHabits(newOrder);
          setDraggedIndex(newIndex);
          translateY.setValue(0);
        }
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsDragging(false);
          const orderedIds = orderedHabits.map((h) => h.id);
          onReorder(orderedIds);
          setDraggedIndex(-1);
        });
      },
    })
  ).current;

  // Update panResponder when state changes
  panResponder.panHandlers.onStartShouldSetResponder = () => isDragging;
  panResponder.panHandlers.onMoveShouldSetResponder = () => isDragging;

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
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      scrollEnabled={!isDragging}
      showsVerticalScrollIndicator={false}
      {...panResponder.panHandlers}
    >
      {orderedHabits.map((habit, index) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          onPress={() => onHabitPress(habit.id)}
          onToggle={() => onToggle(habit.id)}
          onLongPress={() => handleLongPress(index)}
          isDragging={isDragging}
          isBeingDragged={isDragging && draggedIndex === index}
          translateY={translateY}
          scale={scale}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
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
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
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
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
