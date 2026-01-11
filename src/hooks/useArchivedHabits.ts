import { useState, useEffect, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { ArchivedHabit } from "../models/habit";
import {
  getArchivedHabits,
  restoreHabit,
  permanentlyDeleteHabit,
} from "../services/habitService";
import { getSettings } from "../services/settingsService";

export function useArchivedHabits() {
  const db = useSQLiteContext();
  const [archivedHabits, setArchivedHabits] = useState<ArchivedHabit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArchivedHabits = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await getSettings(db);
      const habits = await getArchivedHabits(db, settings.deletionPolicyDays);
      setArchivedHabits(habits);
    } catch (error) {
      console.error("Failed to load archived habits:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadArchivedHabits();
  }, [loadArchivedHabits]);

  const restore = useCallback(
    async (id: string) => {
      await restoreHabit(db, id);
      await loadArchivedHabits();
    },
    [db, loadArchivedHabits]
  );

  const permanentlyDelete = useCallback(
    async (id: string) => {
      await permanentlyDeleteHabit(db, id);
      await loadArchivedHabits();
    },
    [db, loadArchivedHabits]
  );

  return {
    archivedHabits,
    loading,
    refresh: loadArchivedHabits,
    restore,
    permanentlyDelete,
  };
}
