import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useHaptics } from "../../hooks/useHaptics";
import { useArchivedHabits } from "../../hooks/useArchivedHabits";
import type { ArchivedHabit } from "../../models/habit";

interface ArchivedHabitsSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onHabitRestored?: () => void;
}

export function ArchivedHabitsSheet({
  visible,
  onDismiss,
  onHabitRestored,
}: ArchivedHabitsSheetProps) {
  const haptics = useHaptics();
  const { archivedHabits, loading, restore, permanentlyDelete, refresh } =
    useArchivedHabits();

  const handleRestore = async (habit: ArchivedHabit) => {
    haptics.success();
    await restore(habit.id);
    onHabitRestored?.();
  };

  const handlePermanentDelete = (habit: ArchivedHabit) => {
    Alert.alert(
      "Permanently Delete",
      `Are you sure you want to permanently delete "${habit.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            haptics.medium();
            await permanentlyDelete(habit.id);
          },
        },
      ]
    );
  };

  const renderHabit = ({ item }: { item: ArchivedHabit }) => (
    <View style={styles.habitRow}>
      <View style={styles.habitInfo}>
        <View style={styles.habitHeader}>
          {item.icon ? (
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={Colors.background}
              />
            </View>
          ) : (
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          )}
          <Text style={styles.habitName} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <Text style={styles.daysRemaining}>
          {item.daysRemaining === 0
            ? "Deleting soon..."
            : `${item.daysRemaining} day${item.daysRemaining !== 1 ? "s" : ""} remaining`}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => handleRestore(item)}
          hitSlop={8}
        >
          <Ionicons name="arrow-undo" size={20} color={Colors.systemBlue} />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => handlePermanentDelete(item)}
          hitSlop={8}
        >
          <Ionicons name="trash" size={20} color={Colors.systemRed} />
        </Pressable>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trash-outline" size={48} color={Colors.tertiaryLabel} />
      <Text style={styles.emptyTitle}>No Deleted Habits</Text>
      <Text style={styles.emptyMessage}>
        Habits you delete will appear here for 30 days before being permanently
        removed.
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={Colors.systemBlue} />
          </Pressable>
          <Text style={styles.title}>Recently Deleted</Text>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          data={archivedHabits}
          keyExtractor={(item) => item.id}
          renderItem={renderHabit}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            archivedHabits.length === 0
              ? styles.emptyListContent
              : styles.listContent
          }
          refreshing={loading}
          onRefresh={refresh}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  headerSpacer: {
    width: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.label,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
    padding: 16,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  habitInfo: {
    flex: 1,
    marginRight: 12,
  },
  habitHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  habitName: {
    fontSize: 17,
    fontWeight: "500",
    color: Colors.label,
    flex: 1,
  },
  daysRemaining: {
    fontSize: 13,
    color: Colors.secondaryLabel,
    marginTop: 4,
    marginLeft: 34,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    padding: 4,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    color: Colors.secondaryLabel,
    textAlign: "center",
    lineHeight: 22,
  },
});
