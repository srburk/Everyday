import { useState, useLayoutEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import { HabitList } from "../components/habits/HabitList";
import { CreateHabitSheet } from "../components/habits/CreateHabitSheet";
import { useHabits } from "../hooks/useHabits";
import { Colors } from "../constants/colors";

export default function HabitsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { habits, loading, refresh, addHabit, toggleCompletion } = useHabits();
  const [showCreate, setShowCreate] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setShowCreate(true)}
          style={styles.headerButton}
        >
          {Platform.OS === "ios" ? (
            <View style={styles.symbolContainer}>
              <SymbolView
                name="plus"
                size={24}
                tintColor={Colors.systemBlue}
                weight="medium"
              />
            </View>
          ) : (
            <Ionicons name="add" size={28} color={Colors.systemBlue} />
          )}
        </Pressable>
      ),
    });
  }, [navigation]);

  const handleHabitPress = (habitId: string) => {
    router.push(`/habit/${habitId}`);
  };

  return (
    <View style={styles.container}>
      <HabitList
        habits={habits}
        onHabitPress={handleHabitPress}
        onToggle={toggleCompletion}
        refreshing={loading}
        onRefresh={refresh}
      />

      <CreateHabitSheet
        visible={showCreate}
        onDismiss={() => setShowCreate(false)}
        onSave={addHabit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginRight: 8,
  },
  symbolContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
