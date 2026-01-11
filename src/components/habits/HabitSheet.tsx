import { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Colors, HabitColors } from "../../constants/colors";
import { FrequencyPicker } from "./FrequencyPicker";
import { ColorPicker } from "../ui/ColorPicker";
import { IconPicker } from "../ui/IconPicker";
import { useHaptics } from "../../hooks/useHaptics";
import type { Habit, HabitFrequency, CreateHabitInput } from "../../models/habit";

interface HabitSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (habit: CreateHabitInput) => Promise<void>;
  habit?: Habit | null; // If provided, we're in edit mode
  onDelete?: () => void; // Optional delete handler (shown in edit mode)
}

export function HabitSheet({
  visible,
  onDismiss,
  onSave,
  habit,
  onDelete,
}: HabitSheetProps) {
  const haptics = useHaptics();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>({ type: "daily" });
  const [color, setColor] = useState(HabitColors[0]);
  const [icon, setIcon] = useState<string | null>(null);

  const isEditing = !!habit;

  // Populate form when editing
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setFrequency(habit.frequency);
      setColor(habit.color);
      setIcon(habit.icon);
    } else {
      resetForm();
    }
  }, [habit, visible]);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    haptics.success();
    await onSave({
      name: name.trim(),
      frequency,
      color,
      icon: icon || undefined,
    });
    resetForm();
    onDismiss();
  };

  const handleCancel = () => {
    resetForm();
    onDismiss();
  };

  const resetForm = () => {
    setName("");
    setFrequency({ type: "daily" });
    setColor(HabitColors[0]);
    setIcon(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Pressable onPress={handleCancel} hitSlop={8}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>{isEditing ? "Edit Habit" : "New Habit"}</Text>
          <Pressable
            onPress={handleSave}
            hitSlop={8}
            disabled={!canSave}
          >
            <Text
              style={[
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning meditation"
              placeholderTextColor={Colors.tertiaryLabel}
              autoFocus={!isEditing}
              returnKeyType="done"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Frequency</Text>
            <FrequencyPicker
              frequency={frequency}
              onChange={setFrequency}
              color={color}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Color</Text>
            <ColorPicker
              selectedColor={color}
              onChange={setColor}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Icon (Optional)</Text>
            <IconPicker
              selectedIcon={icon}
              color={color}
              onChange={setIcon}
            />
          </View>

          {isEditing && onDelete && (
            <View style={styles.deleteSection}>
              <Pressable
                style={styles.deleteButton}
                onPress={() => {
                  haptics.medium();
                  onDelete();
                }}
              >
                <Text style={styles.deleteButtonText}>Delete Habit</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.label,
  },
  cancelButton: {
    fontSize: 17,
    color: Colors.systemBlue,
  },
  saveButton: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.systemBlue,
  },
  saveButtonDisabled: {
    color: Colors.tertiaryLabel,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 28,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.secondaryLabel,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: Colors.label,
  },
  deleteSection: {
    marginTop: 12,
    paddingTop: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
  },
  deleteButton: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 17,
    fontWeight: "500",
    color: Colors.systemRed,
  },
});
