import { useState, useLayoutEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import { DraggableHabitList } from "../components/habits/DraggableHabitList";
import { HabitSheet } from "../components/habits/HabitSheet";
import { SettingsSheet } from "../components/settings/SettingsSheet";
import { ArchivedHabitsSheet } from "../components/settings/ArchivedHabitsSheet";
import { useHabits } from "../hooks/useHabits";
import { useSettings } from "../hooks/useSettings";
import { Colors } from "../constants/colors";

export default function HabitsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { habits, loading, refresh, addHabit, toggleCompletion, reorderHabits } = useHabits();
  const { settings, updateSetting } = useSettings();
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showArchivedHabits, setShowArchivedHabits] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => setShowSettings(true)}
          style={styles.headerButton}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.systemBlue} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => setShowCreate(true)}
          style={styles.headerButton}
        >
          <Ionicons name="add" size={28} color={Colors.systemBlue} />
        </Pressable>
      ),
    });
  }, [navigation]);

  const handleHabitPress = (habitId: string) => {
    router.push(`/habit/${habitId}`);
  };

  return (
    <View style={styles.container}>
      <DraggableHabitList
        habits={habits}
        onHabitPress={handleHabitPress}
        onToggle={toggleCompletion}
        onReorder={reorderHabits}
        refreshing={loading}
        onRefresh={refresh}
      />

      <HabitSheet
        visible={showCreate}
        onDismiss={() => setShowCreate(false)}
        onSave={addHabit}
      />

      <SettingsSheet
        visible={showSettings}
        onDismiss={() => setShowSettings(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onOpenArchivedHabits={() => {
          setShowSettings(false);
          setShowArchivedHabits(true);
        }}
      />

      <ArchivedHabitsSheet
        visible={showArchivedHabits}
        onDismiss={() => setShowArchivedHabits(false)}
        onHabitRestored={refresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginHorizontal: 8,
  },
});
