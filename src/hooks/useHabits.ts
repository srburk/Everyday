import { useCallback, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { HabitWithStats, CreateHabitInput } from "../models/habit";
import {
  getHabitsWithStats,
  createHabit,
  toggleCompletion,
  archiveHabit,
  updateHabitOrder,
} from "../services/habitService";

export function useHabits() {
  const db = useSQLiteContext();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getHabitsWithStats(db);
      setHabits(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load habits"));
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addHabit = useCallback(
    async (input: CreateHabitInput) => {
      await createHabit(db, input);
      await refresh();
    },
    [db, refresh]
  );

  const toggle = useCallback(
    async (habitId: string, date?: string) => {
      await toggleCompletion(db, habitId, date);
      await refresh();
    },
    [db, refresh]
  );

  const archive = useCallback(
    async (habitId: string) => {
      await archiveHabit(db, habitId);
      await refresh();
    },
    [db, refresh]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await updateHabitOrder(db, orderedIds);
      await refresh();
    },
    [db, refresh]
  );

  return {
    habits,
    loading,
    error,
    refresh,
    addHabit,
    toggleCompletion: toggle,
    archiveHabit: archive,
    reorderHabits: reorder,
  };
}
